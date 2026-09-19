import re
from datetime import datetime, date, timedelta
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import (
    ChatRequest, ChatResponse, AvailabilityResult, RoomInfo, ChatAction, ServiceRequestPayload
)
from ..services.llm_service import llm_service
from ..services.availability_service import availability_service
from ..services.hotel_service import hotel_service
from ..services.service_request_service import service_request_service
from ..utils.logging_config import logger

router = APIRouter(prefix="/api/chat", tags=["Chat"])

def extract_availability_parameters(text: str):
    """Attempts to extract dates (YYYY-MM-DD or relative dates) and adult guest count from natural language text."""
    date_matches = re.findall(r'\b\d{4}-\d{2}-\d{2}\b', text)
    adults = 2

    # Numeric guest count
    guest_match = re.search(r'\b(\d+)\s*(?:guests?|adults?|people|persons?)\b', text, re.IGNORECASE)
    if guest_match:
        adults = int(guest_match.group(1))
    else:
        # Word guest count
        word_guests = {
            "one": 1, "single": 1, "two": 2, "couple": 2,
            "three": 3, "four": 4, "family": 4, "five": 5, "six": 6
        }
        for w, num in word_guests.items():
            if re.search(rf'\b{w}\s*(?:guests?|adults?|people|persons?)?\b', text, re.IGNORECASE) and w in ["single", "couple", "family", "three", "four", "five", "six"]:
                adults = num
                break

    if len(date_matches) >= 2:
        return date_matches[0], date_matches[1], adults
    elif len(date_matches) == 1:
        try:
            in_d = datetime.strptime(date_matches[0], "%Y-%m-%d").date()
            out_d = in_d + timedelta(days=1)
            return in_d.strftime("%Y-%m-%d"), out_d.strftime("%Y-%m-%d"), adults
        except Exception:
            return None, None, adults

    lower = text.lower()
    today = date.today()
    is_room_related = any(w in lower for w in ["room", "suite", "stay", "book", "available", "vacancy", "vacant", "reservation", "sleep", "check-in", "check in"])
    is_activity_query = any(act in lower for act in ["what can i do", "what to do", "things to do", "activities", "entertainment", "nightlife"])
    if is_room_related and not is_activity_query:
        if "tomorrow" in lower:
            in_d = today + timedelta(days=1)
            out_d = in_d + timedelta(days=1)
            return in_d.strftime("%Y-%m-%d"), out_d.strftime("%Y-%m-%d"), adults
        elif "tonight" in lower or "today" in lower:
            in_d = today
            out_d = in_d + timedelta(days=1)
            return in_d.strftime("%Y-%m-%d"), out_d.strftime("%Y-%m-%d"), adults

    return None, None, adults

def extract_food_quantity(text: str) -> int:
    """Extracts numeric or word quantities like 'two', '2', 'one', 'three'."""
    word_to_num = {
        "one": 1, "a": 1, "an": 1, "two": 2, "three": 3,
        "four": 4, "five": 5, "six": 6, "double": 2
    }
    match = re.search(r'\b(one|two|three|four|five|six|double|\d+)\b', text, re.IGNORECASE)
    if match:
        val = match.group(1).lower()
        if val in word_to_num:
            return word_to_num[val]
        if val.isdigit():
            return max(1, int(val))
    return 1

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest):
    """
    Main conversational endpoint for Oleria AI Concierge.
    Orchestrates natural language intent recognition and deterministic backend services.
    """
    message = payload.message.strip()
    hotel_id = (payload.hotel_id or "bengaluru").lower().strip()
    guest_name = str(payload.guest_name) if payload.guest_name is not None else "Guest"
    room_number = payload.room_number
    history = payload.conversation_history
    hotel = hotel_service.get_hotel(hotel_id)
    hotel_name = hotel.get("hotel_name", "Oleria Hotel")

    logger.info(f"[{hotel_id}] Chat message: '{message}' from {guest_name} (Room: {room_number})")

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_MESSAGE", "message": "Message cannot be empty."}
        )

    lower_msg = message.lower()
    room_context = {"room_number": room_number, "guest_name": guest_name} if room_number else None

    # ==========================================
    # WORKFLOW 1: "I'M NOT FEELING WELL" / LIGHT MEALS
    # ==========================================
    wellness_match = re.search(
        r'\b(not feeling well|feel sick|feeling sick|unwell|sick|illness|upset stomach|fever|nausea|headache|something light|don\'?t want heavy food|easy to eat)\b',
        lower_msg
    )
    is_service_explicit = any(w in lower_msg for w in ["pillow", "towel", "iron", "laundry", "housekeeping", "clean my room", "cab", "airport"])
    if wellness_match and not (is_service_explicit and not any(w in lower_msg for w in ["sick", "unwell", "not feeling well", "fever", "nausea"])):
        menu = hotel.get("menu", [])
        # Find light items
        light_items = [
            m for m in menu
            if any(t in m.get("tags", []) for t in ["light", "soup", "comfort", "digestive"])
            or m.get("category", "").lower() == "light meals"
        ]
        if not light_items:
            light_items = menu[:3]

        item_bullets = [f"• **{m['name']}** (₹{m['price']}) — {m['description']}" for m in light_items[:3]]
        bullets_text = "\n".join(item_bullets)

        phone = hotel.get('contact', {}).get('phone', 'Ext 0')
        answer = (
            f"I'm very sorry to hear you're not feeling well. I can help you find lighter food, soothing drinks, and convenient hotel services to help you rest and feel more comfortable.\n\n"
            f"Here are gentle, nourishing options from our **{hotel_name} In-Room Dining** menu:\n{bullets_text}\n\n"
            f"*(Please note: As an AI concierge, I cannot provide medical advice. If you require medical care, a doctor on call, or first aid, please contact our Front Desk immediately at {phone}.)*\n\n"
            f"Would you like me to dispatch fresh bottled water or extra pillows to Room {room_number or '502'}?"
        )

        return ChatResponse(
            success=True,
            answer=answer,
            intent="wellness_light_dining",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=True,
            action=ChatAction(
                type="suggest_light_menu",
                data={"items": light_items[:4]}
            ),
            menu_recommendations=light_items[:4]
        )

    # ==========================================
    # WORKFLOW 2: CONVERSATIONAL FOOD & CART ACTIONS
    # ==========================================
    # 2a. Cart removal e.g. "Remove the coffee", "Cancel coffee"
    if any(w in lower_msg for w in ["remove", "delete", "cancel the"]) and any(w in lower_msg for w in ["coffee", "sandwich", "order", "item", "dish", "cart"]):
        if payload.current_cart:
            target_item = None
            for c_item in payload.current_cart:
                name_words = [w for w in c_item.name.lower().split() if len(w) > 3]
                if c_item.name.lower() in lower_msg or any(w in lower_msg for w in name_words):
                    target_item = c_item
                    break
            if not target_item and "coffee" in lower_msg:
                target_item = next((c for c in payload.current_cart if "coffee" in c.name.lower()), None)
            if not target_item:
                target_item = payload.current_cart[-1]

            answer = f"I have removed **{target_item.name}** from your In-Room Dining cart."
            return ChatResponse(
                success=True,
                answer=answer,
                intent="cart_management",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(
                    type="remove_from_cart",
                    data={"item_id": target_item.item_id, "name": target_item.name}
                )
            )
        else:
            return ChatResponse(
                success=True,
                answer=f"Your In-Room Dining cart is currently empty. Would you like to view our {hotel_name} menu?",
                intent="cart_management",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(type="show_menu")
            )

    # 2b. Add one more e.g. "Add one more", "Add another"
    if any(phrase in lower_msg for phrase in ["add one more", "one more", "add another", "make it two", "another one"]):
        if payload.current_cart:
            target_item = payload.current_cart[-1]
            new_qty = target_item.quantity + 1
            answer = f"I have added one more **{target_item.name}** to your cart (Total: {new_qty}x). You can review your cart or checkout whenever you are ready."
            return ChatResponse(
                success=True,
                answer=answer,
                intent="cart_management",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(
                    type="update_quantity",
                    data={"item_id": target_item.item_id, "quantity": new_qty, "name": target_item.name}
                )
            )

    # 2c. View cart e.g. "What is in my cart", "Show my cart", "View cart"
    if any(phrase in lower_msg for phrase in ["my cart", "show cart", "view cart", "what is in my cart", "check my cart", "cart total"]):
        if payload.current_cart:
            items_str = ", ".join([f"{c.quantity}x {c.name}" for c in payload.current_cart])
            subtotal = sum((c.price_per_unit or c.price or 0) * c.quantity for c in payload.current_cart)
            taxes = round(subtotal * 0.05, 2)
            total = round(subtotal + taxes, 2)
            answer = f"Your In-Room Dining cart has: {items_str}. Subtotal: ₹{subtotal:,.0f} + 5% GST (₹{taxes:,.0f}) = **₹{total:,.0f}**. Would you like to proceed to Demo Payment?"
            return ChatResponse(
                success=True,
                answer=answer,
                intent="cart_management",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(type="open_cart", data={"total": total})
            )
        else:
            return ChatResponse(
                success=True,
                answer=f"Your In-Room Dining cart is currently empty. Would you like me to recommend dishes from our {hotel_name} menu?",
                intent="cart_management",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(type="show_menu")
            )

    # 2d. Cheapest vegetarian option
    menu = hotel.get("menu", [])
    if any(phrase in lower_msg for phrase in ["cheapest vegetarian", "cheapest veg", "lowest vegetarian", "cheapest option", "lowest price"]):
        veg_items = [
            m for m in menu
            if "vegetarian" in m.get("tags", []) or "veg" in m.get("category", "").lower()
        ]
        if not veg_items:
            veg_items = menu
        cheapest = min(veg_items, key=lambda x: x.get("price", 99999))
        answer = (
            f"Our most affordable vegetarian option at {hotel_name} is the **{cheapest['name']}** at **₹{cheapest['price']}** "
            f"({cheapest['description']}). Would you like me to add it to your order?"
        )
        return ChatResponse(
            success=True,
            answer=answer,
            intent="food_recommendation",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=True,
            action=ChatAction(
                type="show_item",
                data=cheapest
            ),
            menu_recommendations=[cheapest]
        )

    # 2e. Breakfast for two / Order breakfast
    if any(phrase in lower_msg for phrase in ["breakfast for two", "breakfast for 2", "order breakfast"]):
        breakfast_items = [
            m for m in menu
            if m.get("category", "").lower() == "breakfast" or "breakfast" in m.get("tags", [])
        ]
        if not breakfast_items:
            breakfast_items = menu[:3]

        venue = next((d for d in hotel.get("dining", []) if "breakfast" in d.get("cuisine", "").lower() or "breakfast_timings" in d), None)
        venue_info = f" You can also visit {venue['name']} ({venue.get('breakfast_timings', '6:30 AM – 10:30 AM')}) for the lavish morning buffet." if venue else ""

        items_str = "\n".join([f"• **{m['name']}** (₹{m['price']}): {m['description']}" for m in breakfast_items[:3]])
        answer = (
            f"Here are delightful breakfast selections for two at **{hotel_name}**:\n\n"
            f"{items_str}\n\n"
            f"Would you like me to add 2 breakfast sets to your In-Room Dining cart for Room {room_number or '502'}?{venue_info}"
        )
        return ChatResponse(
            success=True,
            answer=answer,
            intent="food_recommendation",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=True,
            action=ChatAction(type="show_menu", data={"category": "Breakfast"}),
            menu_recommendations=breakfast_items[:3]
        )

    # Check if user says "order", "add", "want coffee", "something under 500", "i'm hungry"
    is_food_query = any(w in lower_msg for w in [
        "order", "coffee", "sandwich", "hungry", "food", "eat", "menu",
        "dish", "under 500", "under ₹500", "pizza", "juice"
    ])

    is_room_booking_query = any(k in lower_msg for k in ["book a room", "reserve a room", "room availability", "rooms available", "check-in", "check out", "deluxe room", "presidential suite", "executive suite", "room rate", "room price"])
    if is_food_query and not is_room_booking_query:
        # Specific item ordering e.g. "Order two coffees", "Add vegetarian sandwich"
        matched_item = None
        for item in menu:
            item_name_lower = item["name"].lower()
            keywords = [w for w in item_name_lower.split() if len(w) > 3]
            if item_name_lower in lower_msg or any(k in lower_msg for k in keywords if k not in ["with", "from", "fresh"]):
                matched_item = item
                break

        # Common shortcuts: coffee, sandwich, tea, soup, pizza
        if not matched_item:
            if "coffee" in lower_msg:
                matched_item = next((m for m in menu if "coffee" in m["name"].lower()), None)
            elif "sandwich" in lower_msg:
                matched_item = next((m for m in menu if "sandwich" in m["name"].lower() or "wrap" in m["name"].lower()), None)
            elif "tea" in lower_msg or "chai" in lower_msg:
                matched_item = next((m for m in menu if "tea" in m["name"].lower() or "chai" in m["name"].lower()), None)
            elif "soup" in lower_msg or "broth" in lower_msg:
                matched_item = next((m for m in menu if "soup" in m["name"].lower() or "broth" in m["name"].lower()), None)
            elif "pizza" in lower_msg:
                matched_item = next((m for m in menu if "pizza" in m["name"].lower()), None)

        if matched_item and any(action_word in lower_msg for action_word in ["order", "add", "send", "bring", "two", "one", "three"]):
            qty = extract_food_quantity(message)
            total_item_price = matched_item["price"] * qty
            room_str = f" to Room {room_number}" if room_number else ""
            answer = (
                f"I have added **{qty}x {matched_item['name']}** (₹{matched_item['price']} each — ₹{total_item_price:,} total) "
                f"to your In-Room Dining cart{room_str}. "
                f"You can view your cart or proceed to Demo Payment whenever you are ready."
            )
            return ChatResponse(
                success=True,
                answer=answer,
                intent="food_ordering",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(
                    type="add_to_cart",
                    data={
                        "item_id": matched_item["id"],
                        "name": matched_item["name"],
                        "quantity": qty,
                        "price_per_unit": matched_item["price"]
                    }
                ),
                menu_recommendations=[matched_item]
            )

        # 2b: Budget filtering e.g. "under 500" or "cheapest vegetarian"
        if "under 500" in lower_msg or "under ₹500" in lower_msg:
            cheap_items = [m for m in menu if m["price"] <= 500]
            item_list = ", ".join([f"{m['name']} (₹{m['price']})" for m in cheap_items[:4]])
            answer = f"Here are delicious selections at {hotel_name} under ₹500: {item_list}. Would you like me to add any of these to your order?"
            return ChatResponse(
                success=True,
                answer=answer,
                intent="food_recommendation",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                menu_recommendations=cheap_items[:4]
            )

        # 2c: General hunger e.g. "I'm hungry"
        if "hungry" in lower_msg or "something to eat" in lower_msg or "food menu" in lower_msg:
            top_picks = menu[:4]
            picks_str = "\n".join([f"• **{m['name']}** ({m['category']}) — ₹{m['price']}: {m['description']}" for m in top_picks])
            answer = (
                f"Here are popular In-Room Dining recommendations available right now at **{hotel_name}**:\n\n"
                f"{picks_str}\n\n"
                f"You can browse the full menu below or simply say *'Order two coffees'* or *'Add sandwich'* to add items directly!"
            )
            return ChatResponse(
                success=True,
                answer=answer,
                intent="food_recommendation",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(type="show_menu", data={"categories": ["All", "Light Meals", "Vegetarian", "Breakfast", "Beverages", "Desserts"]}),
                menu_recommendations=top_picks
            )

    # ==========================================
    # WORKFLOW 3: HOTEL SERVICE REQUESTS
    # ==========================================
    services = hotel.get("services", [])
    matched_svc = None
    if any(w in lower_msg for q_word in ["pillow", "towel", "water", "housekeeping", "clean", "laundry", "maintenance", "chauffeur", "transfer"] for w in [q_word]):
        if "pillow" in lower_msg:
            matched_svc = next((s for s in services if "pillow" in s["service_id"]), None)
        elif "towel" in lower_msg:
            matched_svc = next((s for s in services if "towel" in s["service_id"]), None)
        elif "water" in lower_msg:
            matched_svc = next((s for s in services if "water" in s["service_id"]), None)
        elif "housekeeping" in lower_msg or "clean" in lower_msg:
            matched_svc = next((s for s in services if "housekeeping" in s["service_id"]), None)
        elif "laundry" in lower_msg:
            matched_svc = next((s for s in services if "laundry" in s["service_id"]), None)
        elif "maintenance" in lower_msg or "repair" in lower_msg:
            matched_svc = next((s for s in services if "maintenance" in s["service_id"]), None)
        elif "airport" in lower_msg or "chauffeur" in lower_msg:
            matched_svc = next((s for s in services if "airport" in s["service_id"]), None)

    if matched_svc and any(trigger in lower_msg for trigger in ["need", "request", "want", "send", "bring", "arrange", "can i have", "please"]):
        if room_number:
            # Deterministically create demo service request
            req_obj = ServiceRequestPayload(
                hotel_id=hotel_id,
                service_id=matched_svc["service_id"],
                service_name=matched_svc["name"],
                room_number=room_number,
                guest_name=guest_name
            )
            svc_res = service_request_service.create_demo_request(req_obj)
            answer = (
                f"Certainly, {guest_name}! I have dispatched a request for **{matched_svc['name']}** to **Room {room_number}**. "
                f"Reference ID: **{svc_res.request_id}** (Estimated delivery: {matched_svc.get('delivery_time', '15-20 mins')}). "
                f"Cost: {matched_svc.get('cost', 'Complimentary')}."
            )
            return ChatResponse(
                success=True,
                answer=answer,
                intent="service_request",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                action=ChatAction(
                    type="service_created",
                    data={
                        "request_id": svc_res.request_id,
                        "service_name": matched_svc["name"],
                        "room_number": room_number,
                        "delivery_time": matched_svc.get("delivery_time", "15 mins")
                    }
                )
            )
        else:
            answer = (
                f"I would be delighted to arrange **{matched_svc['name']}** for you at {hotel_name}! "
                f"Could you please tell me your room number (or complete your room booking above), so our team can deliver it to your room?"
            )
            return ChatResponse(
                success=True,
                answer=answer,
                intent="service_request",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=False
            )

    # ==========================================
    # WORKFLOW 4: ROOM AVAILABILITY & BOOKING
    # ==========================================
    check_in, check_out, adults = extract_availability_parameters(message)

    non_room_topics = any(topic in lower_msg for topic in [
        "parking", "valet", "pool", "swim", "wifi", "wi-fi", "breakfast", "gym", "spa", "sauna",
        "massage", "food", "table", "menu", "cab", "taxi", "laundry", "pillow", "towel", "water"
    ])
    is_explicit_room_query = any(k in lower_msg for k in [
        "room availability", "rooms available", "available room", "available rooms",
        "book a room", "book room", "reserve a room", "room reservation", "vacant room",
        "rooms for", "suites for", "book my stay", "hotel reservation"
    ])
    has_stay_dates = (check_in is not None and check_out is not None)

    is_avail_query = (
        not non_room_topics and (
            is_explicit_room_query or
            has_stay_dates or
            (any(k in lower_msg for k in ["availability", "reservation", "vacant"]) and any(r in lower_msg for r in ["room", "suite", "stay", "night", "hotel", "check"])) or
            lower_msg.strip() in ["check room availability", "room availability", "check availability", "book a room"]
        )
    )

    if is_avail_query and check_in and check_out:
        logger.info(f"Checking deterministic availability for {hotel_id}: {check_in} to {check_out}, adults={adults}")
        avail_res = availability_service.check_availability(check_in, check_out, adults, hotel_id=hotel_id)

        if not avail_res.get("success", False):
            err_msg = avail_res.get("error", {}).get("message", "Invalid dates provided.")
            return ChatResponse(
                success=True,
                answer=f"I checked availability at {hotel_name}, but there was an issue with the dates: {err_msg} Please adjust your dates or use the booking calendar.",
                intent="availability",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=False
            )

        if avail_res.get("available", False):
            room_names = ", ".join([r["room_name"] for r in avail_res.get("rooms", [])])
            nights = avail_res.get("nights", 1)
            answer = (
                f"Good news! We have {len(avail_res.get('rooms', []))} room option(s) available at **{hotel_name}** "
                f"for {adults} guest(s) from {check_in} to {check_out} ({nights} night(s)): {room_names}. "
                f"Please review the available room cards below or proceed to book!"
            )
            rooms_pydantic = [RoomInfo(**r) for r in avail_res.get("rooms", [])]
            return ChatResponse(
                success=True,
                answer=answer,
                intent="availability",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                availability=AvailabilityResult(
                    available=True,
                    hotel_id=hotel_id,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    nights=nights,
                    rooms=rooms_pydantic,
                    demo_note=avail_res.get("demo_note", "Demo availability — mock inventory based on capacity and dates")
                )
            )
        else:
            return ChatResponse(
                success=True,
                answer=f"I checked availability at {hotel_name} from {check_in} to {check_out} for {adults} guest(s), but no rooms meet those requirements: {avail_res.get('message', 'No single room fits this party size.')}",
                intent="availability",
                hotel_id=hotel_id,
                hotel_name=hotel_name,
                tool_used=True,
                availability=AvailabilityResult(
                    available=False,
                    hotel_id=hotel_id,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    nights=avail_res.get("nights", 1),
                    rooms=[],
                    demo_note=avail_res.get("demo_note", "Demo availability — mock inventory based on capacity and dates")
                )
            )

    if is_avail_query and not (check_in and check_out):
        answer = (
            f"I would be delighted to check room availability for you at **{hotel_name}**! "
            f"Please share your **check-in date** (YYYY-MM-DD), **check-out date** (YYYY-MM-DD), "
            f"and the **number of guests**, or use our **Check Availability** panel below."
        )
        return ChatResponse(
            success=True,
            answer=answer,
            intent="availability",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=False,
            action=ChatAction(type="open_booking")
        )

    # ==========================================
    # WORKFLOW 5: GENERAL HOTEL INQUIRY (LLM OR GROUNDED FALLBACK)
    # ==========================================
    try:
        response_dict = llm_service.generate_response(
            message=message,
            hotel_id=hotel_id,
            conversation_history=history,
            room_context=room_context
        )
        return ChatResponse(
            success=True,
            answer=response_dict.get("answer", f"Welcome to {hotel_name}. How may I assist your stay?"),
            intent="hotel_information",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=False
        )
    except Exception as e:
        logger.exception(f"Error in chat processing: {e}")
        return ChatResponse(
            success=False,
            answer=f"I apologize, but I am having trouble processing that at the moment. Please contact the front desk at {hotel_name} directly.",
            intent="error",
            hotel_id=hotel_id,
            hotel_name=hotel_name,
            tool_used=False,
            error={"code": "CHAT_ERROR", "message": str(e)}
        )
