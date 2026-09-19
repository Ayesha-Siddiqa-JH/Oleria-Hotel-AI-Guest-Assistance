import json
import os
import glob
import re
from typing import Dict, Any, List, Optional
from ..utils.logging_config import logger

class HotelService:
    def __init__(self, data_dir: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if data_dir is None:
            data_dir = os.path.join(base_dir, "data", "hotels")
        self.data_dir = data_dir
        self._hotels: Dict[str, Dict[str, Any]] = {}
        self._load_all_hotels()

    def _load_all_hotels(self):
        """Loads all hotel properties from json files."""
        if os.path.exists(self.data_dir):
            for file_path in glob.glob(os.path.join(self.data_dir, "*.json")):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        hid = data.get("hotel_id") or os.path.splitext(os.path.basename(file_path))[0].lower()
                        self._hotels[hid] = data
                        logger.info(f"Loaded property '{hid}': {data.get('hotel_name')} from {file_path}")
                except Exception as e:
                    logger.error(f"Error loading hotel file {file_path}: {e}")

        # Fallback to single hotel.json if hotels directory was empty
        if not self._hotels:
            legacy_path = os.path.join(os.path.dirname(self.data_dir), "hotel.json")
            if os.path.exists(legacy_path):
                try:
                    with open(legacy_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        hid = data.get("hotel_id", "bengaluru")
                        self._hotels[hid] = data
                        logger.info(f"Loaded fallback property from {legacy_path}")
                except Exception as e:
                    logger.error(f"Error loading legacy hotel.json: {e}")

    def get_all_hotels(self) -> List[Dict[str, Any]]:
        """Returns summary list of all available hotel properties."""
        summaries = []
        for hid, h in self._hotels.items():
            summaries.append({
                "hotel_id": hid,
                "hotel_name": h.get("hotel_name", f"Oleria {hid.capitalize()}"),
                "city": h.get("city", hid.capitalize()),
                "tagline": h.get("tagline", ""),
                "star_rating": h.get("star_rating", 5),
                "hero_image": h.get("hero_image", "")
            })
        return summaries

    def get_hotel(self, hotel_id: str = "bengaluru") -> Dict[str, Any]:
        """Returns full hotel data for given property id, defaulting to bengaluru."""
        normalized_id = (hotel_id or "bengaluru").lower().strip()
        if normalized_id in self._hotels:
            return self._hotels[normalized_id]
        if "bengaluru" in self._hotels:
            return self._hotels["bengaluru"]
        return next(iter(self._hotels.values())) if self._hotels else {}

    def get_hotel_data(self, hotel_id: str = "bengaluru") -> Dict[str, Any]:
        """Backward-compatible helper."""
        return self.get_hotel(hotel_id)

    def get_all_rooms(self, hotel_id: str = "bengaluru") -> List[Dict[str, Any]]:
        hotel = self.get_hotel(hotel_id)
        return hotel.get("rooms", [])

    def find_suitable_rooms(self, adults: int, hotel_id: str = "bengaluru") -> List[Dict[str, Any]]:
        rooms = self.get_all_rooms(hotel_id)
        return [r for r in rooms if r.get("capacity", 0) >= adults]

    def get_menu(self, hotel_id: str = "bengaluru", category: Optional[str] = None) -> List[Dict[str, Any]]:
        hotel = self.get_hotel(hotel_id)
        menu = hotel.get("menu", [])
        if category and category.lower() != "all":
            return [m for m in menu if m.get("category", "").lower() == category.lower()]
        return menu

    def get_services(self, hotel_id: str = "bengaluru") -> List[Dict[str, Any]]:
        hotel = self.get_hotel(hotel_id)
        return hotel.get("services", [])

    def get_hotel_context_for_prompt(self, hotel_id: str = "bengaluru", room_context: Optional[Dict[str, Any]] = None) -> str:
        """
        Builds a comprehensive property-isolated knowledge context string for LLM system prompt.
        Ensures NO mixing between hotel properties.
        """
        d = self.get_hotel(hotel_id)
        if not d:
            return "Hotel knowledge base is currently unavailable."

        lines = [
            f"# HOTEL PROPERTY: {d.get('hotel_name')} ({d.get('tagline')})",
            f"City: {d.get('city')}, India",
            f"Address: {d.get('address', {}).get('street')}, {d.get('address', {}).get('city')}, {d.get('address', {}).get('state')}. Landmark: {d.get('address', {}).get('landmark')}",
            f"Contact: Phone {d.get('contact', {}).get('phone')}, Email {d.get('contact', {}).get('email')}, Extension: {d.get('contact', {}).get('concierge_ext')}",
        ]

        if room_context and room_context.get("room_number"):
            lines.append("")
            lines.append(f"## ACTIVE IN-HOUSE GUEST STAY CONTEXT")
            lines.append(f"- Guest Name: {room_context.get('guest_name', 'Valued Guest')}")
            lines.append(f"- Room Number: {room_context.get('room_number')}")
            lines.append(f"- Status: Currently In-House / Checked-in at {d.get('hotel_name')}")

        lines.extend([
            "",
            "## TIMINGS & CHECK-IN/OUT",
            f"- Check-in time: {d.get('timings', {}).get('check_in')}",
            f"- Check-out time: {d.get('timings', {}).get('check_out')}",
            f"- Early Check-in Policy: {d.get('timings', {}).get('early_check_in_policy')}",
            f"- Late Check-out Policy: {d.get('timings', {}).get('late_check_out_policy')}",
            f"- Reception Concierge: {d.get('timings', {}).get('reception')}",
            "",
            "## AVAILABLE ROOM TYPES & CAPACITIES",
        ])

        for r in d.get("rooms", []):
            lines.append(
                f"- **{r.get('name')}** (ID: {r.get('room_type_id')}): Capacity {r.get('capacity')} adults | Bed: {r.get('bed_type')} | Size: {r.get('size_sqm')} sqm | View: {r.get('view')} | Price: INR {r.get('price_per_night'):,}/night. {r.get('description')}. Key amenities: {', '.join(r.get('amenities', []))}"
            )

        lines.append("")
        lines.append("## DINING VENUES")
        for dn in d.get("dining", []):
            line = f"- **{dn.get('name')}**: Cuisine: {dn.get('cuisine')} | Timings: {dn.get('timings', 'N/A')}"
            if "breakfast_inclusion" in dn:
                line += f" | Breakfast Policy: {dn.get('breakfast_inclusion')}"
            if "breakfast_timings" in dn:
                line += f" | Breakfast Hours: {dn.get('breakfast_timings')}"
            lines.append(line)

        lines.append("")
        lines.append("## IN-ROOM DINING FOOD & BEVERAGE MENU")
        for item in d.get("menu", []):
            tags_str = ", ".join(item.get("tags", []))
            lines.append(
                f"- [{item.get('id')}] **{item.get('name')}** ({item.get('category')}): INR {item.get('price')}. {item.get('description')} [Tags: {tags_str}]"
            )

        lines.append("")
        lines.append("## HOTEL GUEST SERVICES CATALOG")
        for s in d.get("services", []):
            lines.append(
                f"- [{s.get('service_id')}] **{s.get('name')}** ({s.get('category')}): {s.get('description')} | Delivery: {s.get('delivery_time', '15 mins')} | Cost: {s.get('cost', 'Complimentary')}"
            )

        lines.append("")
        lines.append("## AMENITIES & FACILITIES")
        for am in d.get("amenities", []):
            lines.append(f"- **{am.get('name')}**: {am.get('details')} Timings: {am.get('timings', 'Open 24/7')}. Cost: {am.get('cost', 'Complimentary')}")

        lines.append("")
        lines.append("## HOTEL POLICIES")
        pol = d.get("policies", {})
        lines.append(f"- Cancellation: {pol.get('cancellation')}")
        lines.append(f"- Pets: {pol.get('pets')}")
        lines.append(f"- Smoking: {pol.get('smoking')}")
        lines.append(f"- Children: {pol.get('children')}")
        lines.append(f"- ID Requirements: {pol.get('id_requirements')}")

        lines.append("")
        lines.append("## FREQUENTLY ASKED QUESTIONS (FAQS)")
        for faq in d.get("faqs", []):
            lines.append(f"Q: {faq.get('question')}\nA: {faq.get('answer')}")

        return "\n".join(lines)

    def answer_by_knowledge_base(
        self,
        query: str,
        hotel_id: str = "bengaluru",
        history: Optional[List[Any]] = None,
        room_context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """
        Rule/keyword-based deterministic query resolver with 100% hotel grounding.
        Strictly isolated to the selected hotel_id.
        """
        q = query.lower().strip()
        d = self.get_hotel(hotel_id)
        hotel_name = d.get("hotel_name", "Oleria Hotel")
        city = d.get("city", "our hotel")
        policies = d.get("policies", {})
        contact = d.get("contact", {})
        timings = d.get("timings", {})
        address = d.get("address", {})
        amenities = d.get("amenities", [])
        dining = d.get("dining", [])
        rooms = d.get("rooms", [])
        services = d.get("services", [])
        faqs = d.get("faqs", [])
        menu = d.get("menu", [])

        # Context from recent messages
        recent_context = ""
        if history:
            for turn in reversed(history[-4:]):
                content = turn.content if hasattr(turn, "content") else turn.get("content", "")
                recent_context += " " + content.lower()

        # 1. "Not feeling well" / "Need something light" / "Sick"
        if any(w in q for w in ["not feeling well", "sick", "ill", "upset stomach", "fever", "nausea", "headache", "unwell"]):
            light_items = [m for m in menu if any(t in m.get("tags", []) for t in ["light", "soup", "comfort", "digestive"])]
            item_names = [f"{m['name']} (INR {m['price']})" for m in light_items[:3]]
            items_text = ", ".join(item_names) if item_names else "clear broth soup and herbal tea"
            return (
                f"I'm sorry you're not feeling well. I can help you find lighter food and convenient hotel services to make you comfortable. "
                f"From our {hotel_name} menu, I suggest: {items_text}. "
                f"I can also arrange complimentary extra pillows, fresh water bottles, or room service right away."
            )

        # 2. Check-in / Check-out questions
        has_checkin = any(w in q for w in ["check-in", "check in", "checkin", "arrival time"])
        has_checkout = any(w in q for w in ["check-out", "check out", "checkout", "departure time"])
        if has_checkin and has_checkout:
            return f"At {hotel_name}, standard check-in time is {timings.get('check_in')} and standard check-out time is {timings.get('check_out')}."
        if has_checkin:
            return f"Standard check-in time at {hotel_name} is {timings.get('check_in')}. {timings.get('early_check_in_policy')}"
        if has_checkout:
            return f"Standard check-out time at {hotel_name} is {timings.get('check_out')}. {timings.get('late_check_out_policy')}"

        # 3. Dynamic FAQ Matcher (matches meaningful keywords with official FAQs)
        stopwords = {
            "what", "where", "when", "which", "who", "whom", "whose", "why", "how",
            "the", "and", "for", "with", "from", "are", "you", "your", "our", "have",
            "has", "had", "can", "could", "would", "will", "shall", "should", "may",
            "might", "must", "does", "did", "doing", "this", "that", "these", "those",
            "is", "am", "was", "were", "been", "being", "tell", "give", "show", "any",
            "some", "hotel", "there", "about", "please", "like", "want", "know"
        }
        q_words = {w for w in re.findall(r'\b[a-z]{3,}\b', q) if w not in stopwords}
        best_faq = None
        best_overlap = 0
        for faq in faqs:
            faq_q_words = {w for w in re.findall(r'\b[a-z]{3,}\b', faq.get("question", "").lower()) if w not in stopwords}
            overlap = len(q_words.intersection(faq_q_words))
            if overlap >= 2 and overlap > best_overlap:
                best_overlap = overlap
                best_faq = faq
        # If strong FAQ match, return FAQ answer
        if best_faq and best_overlap >= 2:
            return best_faq.get("answer")

        # 4. Pool & Swimming questions
        if "pool" in q or "swim" in q or ("timing" in q and "pool" in recent_context):
            for am in amenities:
                if "pool" in am.get("name", "").lower():
                    return f"Yes, at {hotel_name} we feature our {am.get('name')}. {am.get('details')} Operating hours: {am.get('timings')}. Cost: {am.get('cost')}."
            return f"{hotel_name} features swimming facilities for our guests."

        # 5. Breakfast questions
        if "breakfast" in q or ("buffet" in q and "dinner" not in q):
            for dn in dining:
                if "breakfast_inclusion" in dn or "breakfast_timings" in dn:
                    inclusion = dn.get("breakfast_inclusion", "")
                    hours = dn.get("breakfast_timings", dn.get("timings", ""))
                    return f"At {hotel_name}, breakfast is served at {dn.get('name')} ({hours}). {inclusion}"
            return f"Breakfast at {hotel_name} is served daily with continental, Indian, and international selections."

        # 6. Cancellation & Refund policies
        if any(w in q for w in ["cancel", "cancellation", "refund"]):
            return policies.get("cancellation", "Free cancellation is available prior to check-in per hotel policy.")

        # 7. Pet policy
        if any(w in q for w in ["pet", "pets", "dog", "dogs", "cat", "cats", "animal"]):
            return f"Pet Policy at {hotel_name}: {policies.get('pets', 'Please contact concierge regarding pet arrangements.')}"

        # 8. Smoking policy
        if any(w in q for w in ["smoke", "smoking", "cigarette", "vape", "vaping"]):
            return f"Smoking Policy at {hotel_name}: {policies.get('smoking', 'Smoking is restricted to designated outdoor areas.')}"

        # 9. Children & Family policy
        if any(w in q for w in ["child", "children", "kid", "kids", "baby", "infant", "crib", "cot", "extra bed"]):
            return f"Children & Family Policy at {hotel_name}: {policies.get('children', 'Children are warmly welcomed.')}"

        # 10. ID & Document requirements
        if any(w in q for w in ["id ", " id", "id?", "identification", "passport", "aadhaar", "aadhar", "documents", "proof of identity"]):
            return f"ID Requirements at {hotel_name}: {policies.get('id_requirements', 'Valid government-issued photo ID is required for all guests at check-in.')}"

        # 11. Parking, Valet & EV Charging
        if any(w in q for w in ["parking", "valet", "car park", "park my car", "ev charging", "electric vehicle", "charger"]):
            for am in amenities:
                if any(k in am.get("name", "").lower() for k in ["parking", "valet", "car", "ev"]):
                    return f"Parking at {hotel_name}: {am.get('name')}. {am.get('details')} Timings: {am.get('timings')}. Cost: {am.get('cost')}."
            return f"{hotel_name} provides complimentary secure valet parking and EV charging for all resident guests."

        # 12. Spa, Massage, Wellness & Sauna
        if any(w in q for w in ["spa", "massage", "sauna", "steam", "ayurveda", "facial", "wellness treatment", "body scrub"]):
            for am in amenities:
                if any(k in am.get("name", "").lower() for k in ["spa", "sauna", "steam", "ayurved"]):
                    return f"Spa & Wellness at {hotel_name}: {am.get('name')}. {am.get('details')} Hours: {am.get('timings')}. Cost: {am.get('cost')}."
            return f"{hotel_name} offers rejuvenating holistic spa and wellness therapies."

        # 13. Gym / Fitness
        if any(w in q for w in ["gym", "fitness", "workout", "weights", "treadmill"]):
            for am in amenities:
                if any(k in am.get("name", "").lower() for k in ["gym", "fitness"]):
                    return f"Yes, {hotel_name} provides our {am.get('name')}. {am.get('details')} Hours: {am.get('timings')}, {am.get('cost')}."
            return f"Our modern fitness studio is open 24/7 complimentary for guests at {hotel_name}."

        # 14. Wi-Fi & Internet
        if any(w in q for w in ["wifi", "wi-fi", "internet", "broadband", "network speed"]):
            for am in amenities:
                if "wi-fi" in am.get("name", "").lower() or "wifi" in am.get("name", "").lower():
                    return f"At {hotel_name}, {am.get('name')}: {am.get('details')} ({am.get('cost')})."
            return f"Complimentary high-speed Wi-Fi is available across all guest rooms, suites, and public areas at {hotel_name}."

        # 15. Dining Venues / Restaurants / Where to eat
        if any(w in q for w in ["restaurant", "restaurants", "where can i eat", "where to eat", "dining option", "dining venues", "food options", "places to eat", "what eateries", "bars", "bistro"]):
            venue_lines = []
            for vn in dining:
                cuisine = vn.get("cuisine", "")
                timings_str = vn.get("timings", "")
                hl = f" — {vn.get('highlights')}" if vn.get("highlights") else ""
                venue_lines.append(f"• **{vn.get('name')}**: {cuisine} (Timings: {timings_str}){hl}")
            venues_formatted = "\n".join(venue_lines)
            return (
                f"At **{hotel_name}**, we offer exceptional dining venues:\n\n"
                f"{venues_formatted}\n\n"
                f"We also provide 24/7 In-Room Dining delivered directly to your room."
            )

        # 16. In-Room Dining Menu Overview
        if any(w in q for w in ["menu", "food menu", "what dishes", "what food", "dining menu", "what can i order"]):
            categories = ["Beverages", "Light Meals", "Vegetarian", "Breakfast", "Desserts"]
            cat_lines = []
            for cat in categories:
                cat_items = [m for m in menu if m.get("category", "").lower() == cat.lower()]
                if cat_items:
                    items_preview = ", ".join([f"{item['name']} (₹{item['price']})" for item in cat_items[:2]])
                    cat_lines.append(f"• **{cat}**: {items_preview}...")
            menu_summary = "\n".join(cat_lines)
            return (
                f"Here is a preview of our **{hotel_name} In-Room Dining** menu:\n\n"
                f"{menu_summary}\n\n"
                f"You can explore the full dining section or simply say *'Order 2 coffees'* or *'Add sandwich'* to order directly!"
            )

        # 17. Rooms Catalog / Room Types / Accommodations
        if any(w in q for w in ["what rooms", "room types", "room categories", "list rooms", "available rooms", "room options", "room prices", "rates", "types of rooms", "stay options", "how much is a room", "how much are the rooms", "room rate"]):
            room_lines = []
            for rm in rooms:
                p = rm.get("price_per_night", 0)
                room_lines.append(
                    f"• **{rm.get('name')}** (₹{p:,}/night): {rm.get('bed_type')}, {rm.get('size_sqm')} m², {rm.get('view')}. Capacity: up to {rm.get('capacity')} guest(s)."
                )
            rooms_formatted = "\n".join(room_lines)
            return (
                f"**{hotel_name}** offers {len(rooms)} beautifully appointed room & suite categories:\n\n"
                f"{rooms_formatted}\n\n"
                f"Would you like me to check availability for specific dates or reserve a room?"
            )

        # 18. Specific Room Enquiries
        for rm in rooms:
            r_name_words = [w for w in rm.get("name", "").lower().split() if len(w) > 3]
            if rm.get("name", "").lower() in q or (len(r_name_words) >= 2 and all(w in q for w in r_name_words[:2])):
                amenities_preview = ", ".join(rm.get("amenities", [])[:4])
                return (
                    f"**{rm.get('name')}** at {hotel_name} (₹{rm.get('price_per_night', 0):,}/night):\n"
                    f"{rm.get('description')}\n"
                    f"• **Bed**: {rm.get('bed_type')} | **Size**: {rm.get('size_sqm')} m² | **View**: {rm.get('view')} | **Max Guests**: {rm.get('capacity')}\n"
                    f"• **Featured Amenities**: {amenities_preview}."
                )

        # 19. Room suitability by guest count
        if any(w in q for w in ["3 guests", "three guests", "3 adults", "three adults"]):
            suites = [r["name"] for r in rooms if r.get("capacity", 0) >= 3]
            suites_str = " or ".join(suites) if suites else "our Executive Suites"
            return f"For three guests at {hotel_name}, {suites_str} is perfectly suited."
        if any(w in q for w in ["4 guests", "four guests", "family", "children and adults"]):
            suites = [r["name"] for r in rooms if r.get("capacity", 0) >= 4]
            suites_str = " or ".join(suites) if suites else "our Presidential / Family Suites"
            return f"For four guests or a family at {hotel_name}, {suites_str} offers ample space, multiple bedrooms, and dedicated amenities."
        if any(w in q for w in ["2 guests", "two guests", "couple"]):
            r0 = rooms[0] if rooms else None
            r_name = r0.get("name", "Deluxe Room") if r0 else "Deluxe Room"
            r_price = r0.get("price_per_night", 5500) if r0 else 5500
            return f"For two guests at {hotel_name}, our {r_name} (starting from INR {r_price:,}/night) is a wonderful choice."

        # 20. All Amenities & Facilities Overview
        if any(w in q for w in ["amenities", "amenity", "facilities", "what facilities", "what do you offer", "what do you have", "recreation", "activities"]):
            amenity_lines = [f"• **{am.get('name')}**: {am.get('details')} (Timings: {am.get('timings', '24/7')}, {am.get('cost', 'Complimentary')})" for am in amenities]
            amenities_formatted = "\n".join(amenity_lines)
            return (
                f"Guests at **{hotel_name}** enjoy a full range of luxury facilities & amenities:\n\n"
                f"{amenities_formatted}"
            )

        # 21. Hotel Services Overview
        if any(w in q for w in ["what services", "services offered", "guest services", "hotel services"]):
            service_lines = [f"• **{s.get('name')}** ({s.get('category')}): {s.get('description')} [ETA: {s.get('delivery_time')}, Cost: {s.get('cost')}]" for s in services]
            services_formatted = "\n".join(service_lines)
            return (
                f"**{hotel_name}** provides the following dedicated in-room guest services:\n\n"
                f"{services_formatted}\n\n"
                f"Just ask me to dispatch any of these to your room!"
            )

        # 22. Specific Service Requests Fallback
        if any(w in q for w in ["pillow", "towel", "water bottle", "housekeeping", "clean my room", "laundry", "iron", "maintenance"]):
            return (
                f"I can certainly assist you with housekeeping and services at {hotel_name}. "
                f"Would you like me to dispatch extra pillows, fresh bath towels, complimentary water bottles, or full housekeeping to your room?"
            )

        # 23. Airport transfer / cabs
        if any(w in q for w in ["airport", "cab", "transfer", "shuttle", "chauffeur", "taxi"]):
            svc = next((s for s in services if "airport" in s.get("service_id", "")), None)
            if svc:
                return f"At {hotel_name}, we offer {svc.get('name')}: {svc.get('description')} (Cost: {svc.get('cost')}, {svc.get('delivery_time')})."
            return f"Private luxury airport chauffeur transfers can be arranged directly at the {hotel_name} Concierge Desk."

        # 24. Contact Info & Front Desk
        if any(w in q for w in ["phone", "contact", "call", "email", "front desk", "reception", "number", "telephone", "extension"]):
            return (
                f"You can connect with **{hotel_name}** 24/7:\n"
                f"• **Phone**: {contact.get('phone', '+91 80 4965 2000')}\n"
                f"• **Concierge Extension**: {contact.get('concierge_ext', 'Ext 0 / 100')}\n"
                f"• **Email**: {contact.get('email', 'concierge@oleriahotels.com')}\n"
                f"• **Address**: {address.get('street')}, {address.get('city')}, {address.get('state')} {address.get('postal_code')}\n"
                f"• **Landmark**: {address.get('landmark')}\n"
                f"• Reception and Concierge are available 24 hours daily."
            )

        # 25. Location / Address / Neighborhood / Nearby Attractions
        if any(w in q for w in ["where are you", "location", "address", "landmark", "where is", "how to reach"]):
            return f"{hotel_name} is located at {address.get('street')}, {address.get('city')}, {address.get('state')} {address.get('postal_code')}. Landmark: {address.get('landmark')}."

        if any(w in q for w in ["nearby", "attractions", "sightseeing", "places to visit", "around the hotel", "what to see"]):
            if "bengaluru" in hotel_id.lower():
                return f"Around {hotel_name}, you can easily visit Cubbon Park, the bustling MG Road shopping promenade, UB City luxury mall, and Bangalore Palace. Our concierge can also arrange private city heritage tours."
            elif "goa" in hotel_id.lower():
                return f"Around {hotel_name}, you have direct access to Candolim Beach, historic Fort Aguada (5 mins away), Calangute Beach, and local coastal spice plantations."
            elif "mumbai" in hotel_id.lower():
                return f"Around {hotel_name}, you are moments away from Marine Drive promenade, the Gateway of India, Colaba Causeway art district, and Chhatrapati Shivaji Maharaj Vastu Sangrahalaya."
            elif "delhi" in hotel_id.lower():
                return f"Around {hotel_name}, iconic landmarks include India Gate, Humayun's Tomb, Lodhi Gardens, Connaught Place, and the historic Red Fort."
            elif "jaipur" in hotel_id.lower():
                return f"Around {hotel_name}, explore the regal City Palace, Hawa Mahal, Amer Fort, Jantar Mantar observatory, and vibrant Johari Bazaar for gemstones and handicrafts."
            return f"{hotel_name} is located in the prime district of {city} with easy access to top cultural, dining, and shopping landmarks."

        # 26. Hotel Overview / About / Introduction
        if any(w in q for w in ["about", "overview", "describe", "what is oleria", "what kind of hotel", "hotel details", "tell me about", "who are you", "hotel info"]):
            star = d.get("star_rating", 5)
            tagline = d.get("tagline", "Luxury Hotel & Suites")
            amenities_names = ", ".join([a["name"] for a in amenities[:3]])
            return (
                f"**{hotel_name}** is a premier {star}-star luxury destination in {city}. Tagline: *'{tagline}'*.\n\n"
                f"Situated at {address.get('street')} (adjacent to {address.get('landmark')}), we offer {len(rooms)} signature room & suite categories, "
                f"{len(dining)} exceptional dining venues, world-class amenities ({amenities_names}), and 24/7 dedicated AI Concierge and in-room dining service."
            )

        # 27. Beach (especially Goa)
        if "beach" in q:
            if "goa" in hotel_id.lower():
                return f"Yes! {hotel_name} features direct private boardwalk access to pristine Candolim Beach with dedicated loungers and towel service."
            return f"{hotel_name} is located in {city}. For beach getaways, visit our sister property Oleria Goa Resort & Spa!"

        # 28. What to do tonight / evening activities
        if any(w in q for w in ["tonight", "this evening", "at night", "what can i do", "things to do", "entertainment", "nightlife"]):
            if "bengaluru" in hotel_id.lower():
                return f"Tonight at {hotel_name}, you can unwind with handcrafted cocktails and skyline vistas at our 15th-floor Sky Lounge, savor authentic Italian fare at The Glasshouse Bistro, or enjoy an evening swim at our heated Rooftop Infinity Pool (open until 10:00 PM)."
            elif "goa" in hotel_id.lower():
                return f"Tonight at {hotel_name}, you can experience fresh coastal seafood under the stars at Fisherman's Cove, enjoy sunset cocktails at the Sunken Lagoon Pool Bar, or take a peaceful evening walk along Candolim Beach via our private boardwalk."
            elif "mumbai" in hotel_id.lower():
                return f"Tonight at {hotel_name}, you can dine with Arabian Sea views at Bayview Grill, sample single malts at The Harbour Club, or relax with an evening wellness therapy at our oceanfront spa."
            elif "delhi" in hotel_id.lower():
                return f"Tonight at {hotel_name}, you can experience royal Awadhi & Mughal cuisine at Dastaan, enjoy live classical music in the courtyard, or savor artisanal spirits at The Viceroy Lounge."
            elif "jaipur" in hotel_id.lower():
                return f"Tonight at {hotel_name}, you can witness Rajasthani folk dance and music performances in the courtyard, dine like royalty at Sheesh Mahal, or enjoy evening cocktails overlooking the illuminated palace gardens."
            return f"Tonight at {hotel_name}, you can explore our signature dining venues, unwind by the pool, or relax with personalized in-room dining."

        # 29. Greetings & Polite Salutations
        if any(w in q for w in ["hi", "hello", "hey", "good morning", "good evening", "namaste", "howdy"]):
            room_greeting = f" (Room {room_context.get('room_number')})" if room_context and room_context.get("room_number") else ""
            return (
                f"Welcome to {hotel_name}{room_greeting}! I am your Oleria AI Concierge. "
                f"How may I assist you today? Feel free to ask about our rooms, in-room dining, hotel services, or availability."
            )

        if any(w in q for w in ["thank", "thanks", "appreciate"]):
            return f"It is my absolute pleasure! If you need anything else to make your stay at {hotel_name} wonderful, please let me know."

        # 30. Fallback out of domain
        return (
            f"I can answer questions specifically related to {hotel_name} ({city}), including our rooms, "
            f"in-room dining, services, amenities, policies, and availability. Could you please clarify your question?"
        )


hotel_service = HotelService()

