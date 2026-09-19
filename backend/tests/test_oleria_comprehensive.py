import pytest
from datetime import date, timedelta

def test_1_hotel_selection(client):
    """1. Hotel selection: list all 5 properties and verify Goa details."""
    response = client.get("/api/hotels")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["hotels"]) == 5
    hotel_ids = [h["hotel_id"] for h in data["hotels"]]
    assert "bengaluru" in hotel_ids
    assert "goa" in hotel_ids
    assert "mumbai" in hotel_ids
    assert "delhi" in hotel_ids
    assert "jaipur" in hotel_ids

    # Query specific hotel: Goa
    res_goa = client.get("/api/hotel/goa")
    assert res_goa.status_code == 200
    goa_data = res_goa.json()["hotel"]
    assert goa_data["hotel_name"] == "Oleria Goa Resort & Spa"
    assert goa_data["city"] == "Goa"

def test_2_hotel_specific_ai_context(client):
    """2. Hotel-specific AI context: Bengaluru vs Goa context returns property-isolated facts."""
    # Bengaluru pool query
    res_blr = client.post("/api/chat", json={
        "message": "Does the hotel have a pool?",
        "hotel_id": "bengaluru"
    })
    assert res_blr.status_code == 200
    blr_ans = res_blr.json()["answer"].lower()
    assert "rooftop" in blr_ans or "15th floor" in blr_ans or "infinity" in blr_ans

    # Goa pool query
    res_goa = client.post("/api/chat", json={
        "message": "Does the hotel have a pool?",
        "hotel_id": "goa"
    })
    assert res_goa.status_code == 200
    goa_ans = res_goa.json()["answer"].lower()
    assert "lagoon" in goa_ans or "freeform" in goa_ans

def test_3_hotel_information_query(client):
    """3. Hotel information query: Check-in/check-out timings."""
    res = client.post("/api/chat", json={
        "message": "What time is check-in and check-out?",
        "hotel_id": "mumbai"
    })
    assert res.status_code == 200
    ans = res.json()["answer"]
    assert "3:00 PM" in ans
    assert "12:00 PM" in ans

def test_4_room_availability(client):
    """4. Room availability: Deterministic query with future dates."""
    check_in = (date.today() + timedelta(days=7)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=9)).strftime("%Y-%m-%d")
    res = client.post("/api/availability", json={
        "hotel_id": "jaipur",
        "check_in": check_in,
        "check_out": check_out,
        "adults": 2
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["available"] is True
    assert data["nights"] == 2
    assert len(data["rooms"]) >= 1
    for r in data["rooms"]:
        assert r["total_price"] == r["price_per_night"] * 2

def test_5_room_booking_checkout(client):
    """5. Room booking checkout: Completes demo booking and returns assigned room number."""
    check_in = (date.today() + timedelta(days=10)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=12)).strftime("%Y-%m-%d")
    res = client.post("/api/booking/checkout", json={
        "hotel_id": "bengaluru",
        "room_type_id": "executive_king_suite",
        "check_in": check_in,
        "check_out": check_out,
        "adults": 2,
        "guest_name": "Ayesha Siddiqa",
        "guest_email": "ayesha@example.com"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "OLR-BK-" in data["booking_id"]
    assert data["assigned_room_number"] == "502"
    assert data["hotel_name"] == "Oleria Bengaluru"
    assert "Demo Experience" in data["demo_note"]

def test_6_menu_lookup(client):
    """6. Menu lookup: Retrieves menu items for Delhi property."""
    res = client.get("/api/dining/menu?hotel_id=delhi")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["hotel_id"] == "delhi"
    assert len(data["items"]) >= 5
    item_names = [i["name"] for i in data["items"]]
    assert any("Tea" in n or "Kahwa" in n or "Dal" in n for n in item_names)

def test_7_ai_food_recommendation(client):
    """7. AI food recommendation: Responds with relevant menu items when user is hungry."""
    res = client.post("/api/chat", json={
        "message": "I'm hungry, what food do you recommend?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["menu_recommendations"]) > 0
    assert "In-Room Dining" in data["answer"] or "recommend" in data["answer"].lower()

def test_8_conversational_food_ordering(client):
    """8. Conversational food ordering: 'Order two coffees' triggers add_to_cart action."""
    res = client.post("/api/chat", json={
        "message": "Please order two coffees for me",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["action"] is not None
    assert data["action"]["type"] == "add_to_cart"
    assert data["action"]["data"]["quantity"] == 2
    assert "coffee" in data["action"]["data"]["name"].lower()

def test_9_cart_quantity_update_and_calculation(client):
    """9. Cart quantity update & calculation: Subtotal + 5% GST calculated deterministically."""
    res = client.post("/api/dining/cart/calculate", json={
        "hotel_id": "bengaluru",
        "items": [
            {"item_id": "blr-bev-1", "name": "Artisan South Indian Filter Coffee", "quantity": 2, "price_per_unit": 220},
            {"item_id": "blr-veg-3", "name": "Crisp Garden Vegetable Club Sandwich", "quantity": 1, "price_per_unit": 420}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    # Subtotal: (220 * 2) + 420 = 440 + 420 = 860
    assert data["subtotal"] == 860.0
    # Tax: 860 * 0.05 = 43.0
    assert data["taxes"] == 43.0
    assert data["total"] == 903.0

def test_10_demo_food_order(client):
    """10. Demo food order: Generates order ID OLR-ORD-XXXX for assigned room."""
    res = client.post("/api/dining/order", json={
        "hotel_id": "bengaluru",
        "room_number": "502",
        "guest_name": "Ayesha Siddiqa",
        "items": [
            {"item_id": "blr-bev-1", "name": "Artisan South Indian Filter Coffee", "quantity": 2, "price_per_unit": 220}
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "OLR-ORD-" in data["order_id"]
    assert data["room_number"] == "502"
    assert data["status"] == "Confirmed"
    assert "Demo order" in data["demo_note"]

def test_11_room_context_request(client):
    """11. Room-context request: When room number is provided, AI acknowledges room context."""
    res = client.post("/api/chat", json={
        "message": "Hello concierge!",
        "hotel_id": "bengaluru",
        "guest_name": "Ayesha",
        "room_number": "502"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "502" in data["answer"] or "Ayesha" in data["answer"] or "Oleria" in data["answer"]

def test_12_hotel_service_request(client):
    """12. Hotel service request: Creates demo request OLR-SRV-XXXX for extra pillows."""
    res = client.post("/api/services/request", json={
        "hotel_id": "bengaluru",
        "service_id": "extra_pillows",
        "room_number": "502",
        "guest_name": "Ayesha Siddiqa"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "OLR-SRV-" in data["request_id"]
    assert data["service_name"] == "Extra Pillows"
    assert data["room_number"] == "502"
    assert data["status"] == "Confirmed"
    assert "Demo request" in data["demo_note"]

def test_13_not_feeling_well_flow(client):
    """13. 'I'm not feeling well': Responds compassionately with light menu items & zero medical claims."""
    res = client.post("/api/chat", json={
        "message": "I'm not feeling well, I need something light",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    ans = data["answer"].lower()
    assert "sorry you're not feeling well" in ans or "sorry" in ans
    assert "broth" in ans or "khichdi" in ans or "tea" in ans or "light" in ans
    assert "pillow" in ans or "water" in ans or "housekeeping" in ans
    assert "prescribe" not in ans and "diagnos" not in ans
    assert data["action"] is not None
    assert data["action"]["type"] == "suggest_light_menu"

def test_14_unsupported_request_fallback(client):
    """14. Unsupported query outside hotel domain triggers safe, polite fallback."""
    res = client.post("/api/chat", json={
        "message": "Can you solve a quadratic equation for me?",
        "hotel_id": "goa"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    ans = data["answer"].lower()
    assert "oleria" in ans or "hotel" in ans or "clarify" in ans

def test_15_gemini_failure_fallback(client):
    """15. Gemini failure fallback: Deterministic grounded engine answers accurately even without Gemini."""
    from app.services.hotel_service import hotel_service
    ans = hotel_service.answer_by_knowledge_base("What is the check-in time?", hotel_id="mumbai")
    assert "3:00 PM" in ans
    assert "Oleria Mumbai" in ans

def test_16_hotel_data_never_mixed(client):
    """16. Strict verification that hotel data is never mixed between properties."""
    # Ask about beach at Goa -> Candolim / beach
    res_goa = client.post("/api/chat", json={
        "message": "Do you have beach access?",
        "hotel_id": "goa"
    })
    assert res_goa.status_code == 200
    assert "candolim" in res_goa.json()["answer"].lower() or "beach" in res_goa.json()["answer"].lower()

    # Ask about beach at Delhi -> Should not claim Candolim beach
    res_delhi = client.post("/api/chat", json={
        "message": "Do you have beach access?",
        "hotel_id": "delhi"
    })
    assert res_delhi.status_code == 200
    delhi_ans = res_delhi.json()["answer"].lower()
    assert "candolim" not in delhi_ans
    assert "delhi" in delhi_ans or "sister property" in delhi_ans or "goa" in delhi_ans

def test_17_conversational_cart_manipulation(client):
    """17. Conversational cart updates: remove item, add one more, and view cart."""
    initial_cart = [
        {"item_id": "blr-bev-1", "name": "Artisan South Indian Filter Coffee", "quantity": 2, "price_per_unit": 220}
    ]
    # Add one more
    res_add = client.post("/api/chat", json={
        "message": "Add one more",
        "hotel_id": "bengaluru",
        "current_cart": initial_cart
    })
    assert res_add.status_code == 200
    data_add = res_add.json()
    assert data_add["action"]["type"] == "update_quantity"
    assert data_add["action"]["data"]["quantity"] == 3

    # Remove item
    res_rem = client.post("/api/chat", json={
        "message": "Remove the coffee",
        "hotel_id": "bengaluru",
        "current_cart": initial_cart
    })
    assert res_rem.status_code == 200
    data_rem = res_rem.json()
    assert data_rem["action"]["type"] == "remove_from_cart"
    assert data_rem["action"]["data"]["item_id"] == "blr-bev-1"

def test_18_cheapest_vegetarian_option(client):
    """18. Cheapest vegetarian option lookup across hotel menu."""
    res = client.post("/api/chat", json={
        "message": "What is the cheapest vegetarian option?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Artisan South Indian Filter Coffee" in data["answer"] or "Khichdi" in data["answer"]
    assert "₹" in data["answer"] or "INR" in data["answer"]

def test_19_pillows_service_request_not_illness(client):
    """19. Asking for pillows must trigger service request and NOT trigger 'not feeling well'."""
    res = client.post("/api/chat", json={
        "message": "I need extra pillows sent to my room",
        "hotel_id": "bengaluru",
        "room_number": 502,
        "guest_name": "Ayesha"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "service_request"
    assert "OLR-SRV-" in data["answer"]
    assert "sorry you're not feeling well" not in data["answer"].lower()

def test_20_what_can_i_do_tonight(client):
    """20. Asking what to do tonight highlights property-specific evening venues."""
    res = client.post("/api/chat", json={
        "message": "What can I do at the hotel tonight?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    ans = data["answer"].lower()
    assert "sky lounge" in ans or "glasshouse" in ans or "pool" in ans

def test_21_hotel_overview_query(client):
    """21. Asking about the hotel returns property-grounded overview."""
    res = client.post("/api/chat", json={
        "message": "Tell me about the hotel",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    ans = data["answer"]
    assert "Oleria Bengaluru" in ans
    assert "5-star" in ans.lower() or "luxury" in ans.lower()
    assert "clarify" not in ans.lower()

def test_22_restaurants_query(client):
    """22. Asking about restaurants returns dining venues catalog."""
    res = client.post("/api/chat", json={
        "message": "What restaurants do you have?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    ans = data["answer"]
    assert "Glasshouse Bistro" in ans or "Skyline" in ans
    assert "clarify" not in ans.lower()

def test_23_rooms_catalog_query(client):
    """23. Asking about rooms returns room types and rates."""
    res = client.post("/api/chat", json={
        "message": "What rooms do you have?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    ans = data["answer"]
    assert "Deluxe Room" in ans
    assert "Executive King Suite" in ans or "Presidential" in ans
    assert "clarify" not in ans.lower()

def test_24_amenities_query(client):
    """24. Asking about amenities returns comprehensive list."""
    res = client.post("/api/chat", json={
        "message": "What amenities do you have?",
        "hotel_id": "bengaluru"
    })
    assert res.status_code == 200
    data = res.json()
    ans = data["answer"]
    assert "Pool" in ans or "Wi-Fi" in ans or "Gym" in ans
    assert "clarify" not in ans.lower()

def test_25_pet_and_smoking_policies(client):
    """25. Asking about pet and smoking policies returns specific policy text."""
    res_pet = client.post("/api/chat", json={
        "message": "Do you allow pets?",
        "hotel_id": "bengaluru"
    })
    assert res_pet.status_code == 200
    assert "pet" in res_pet.json()["answer"].lower()
    assert "clarify" not in res_pet.json()["answer"].lower()

    res_smoke = client.post("/api/chat", json={
        "message": "Can I smoke in the room?",
        "hotel_id": "bengaluru"
    })
    assert res_smoke.status_code == 200
    assert "smoke" in res_smoke.json()["answer"].lower()
    assert "clarify" not in res_smoke.json()["answer"].lower()

def test_26_parking_and_spa_queries(client):
    """26. Asking about parking and spa returns exact amenity details."""
    res_park = client.post("/api/chat", json={
        "message": "Is parking available?",
        "hotel_id": "bengaluru"
    })
    assert res_park.status_code == 200
    assert "parking" in res_park.json()["answer"].lower() or "valet" in res_park.json()["answer"].lower()
    assert "clarify" not in res_park.json()["answer"].lower()

    res_spa = client.post("/api/chat", json={
        "message": "Do you have a spa?",
        "hotel_id": "bengaluru"
    })
    assert res_spa.status_code == 200
    assert "spa" in res_spa.json()["answer"].lower() or "aura" in res_spa.json()["answer"].lower()
    assert "clarify" not in res_spa.json()["answer"].lower()

def test_27_contact_and_address_query(client):
    """27. Asking about phone number or address returns accurate details."""
    res_phone = client.post("/api/chat", json={
        "message": "What is your phone number?",
        "hotel_id": "bengaluru"
    })
    assert res_phone.status_code == 200
    assert "+91" in res_phone.json()["answer"]
    assert "clarify" not in res_phone.json()["answer"].lower()

    res_addr = client.post("/api/chat", json={
        "message": "What is your address?",
        "hotel_id": "bengaluru"
    })
    assert res_addr.status_code == 200
    assert "MG Road" in res_addr.json()["answer"] or "Bengaluru" in res_addr.json()["answer"]
    assert "clarify" not in res_addr.json()["answer"].lower()

