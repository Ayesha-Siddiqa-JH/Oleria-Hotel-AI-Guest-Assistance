import pytest
from datetime import date, timedelta

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "StayAI" in data["service"]

def test_get_hotel_info(client):
    response = client.get("/api/hotel")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "hotel_name" in data["hotel"]
    assert "StayAI Grand Hotel Bengaluru" in data["hotel"]["hotel_name"]

def test_normal_question_checkin(client):
    """1. Normal guest question: What time is check-in?"""
    response = client.post("/api/chat", json={"message": "What time is check-in?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "3:00 PM" in data["answer"]
    assert data["intent"] == "hotel_information"

def test_normal_question_checkout(client):
    """2. Normal guest question: What time is check-out?"""
    response = client.post("/api/chat", json={"message": "What time is check-out?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "11:00 AM" in data["answer"]

def test_breakfast_question(client):
    """3. Breakfast question: Is breakfast included?"""
    response = client.post("/api/chat", json={"message": "Is breakfast included?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "The Glasshouse Bistro" in data["answer"] or "breakfast" in data["answer"].lower()

def test_amenity_question_pool(client):
    """4. Amenity question: Does the hotel have a swimming pool?"""
    response = client.post("/api/chat", json={"message": "Does the hotel have a swimming pool?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "infinity pool" in data["answer"].lower() or "pool" in data["answer"].lower()

def test_room_suitability_three_guests(client):
    """5. Room suitability: Which room is suitable for three guests?"""
    response = client.post("/api/chat", json={"message": "Which room is suitable for three guests?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Executive King Suite" in data["answer"] or "Presidential Family Suite" in data["answer"]

def test_missing_availability_information(client):
    """6. Availability request with missing dates/guests prompts user."""
    response = client.post("/api/chat", json={"message": "Do you have rooms available?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "availability"
    assert data["tool_used"] is False
    assert "check-in" in data["answer"].lower()
    assert "check-out" in data["answer"].lower()
    assert "guests" in data["answer"].lower()

def test_availability_tool_calling_in_chat(client):
    """7. Natural language query with dates & guest count triggers availability tool."""
    future_in = (date.today() + timedelta(days=10)).strftime("%Y-%m-%d")
    future_out = (date.today() + timedelta(days=13)).strftime("%Y-%m-%d")
    msg = f"Do you have rooms for 2 guests from {future_in} to {future_out}?"
    
    response = client.post("/api/chat", json={"message": msg})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["intent"] == "availability"
    assert data["tool_used"] is True
    assert data["availability"] is not None
    assert data["availability"]["available"] is True
    assert len(data["availability"]["rooms"]) > 0
    assert data["availability"]["nights"] == 3

def test_ambiguous_question(client):
    """8. Ambiguous or greeting question handled gracefully."""
    response = client.post("/api/chat", json={"message": "Hello, can you help me?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["answer"]) > 10

def test_unsupported_out_of_domain_question(client):
    """9. Unsupported query outside hotel domain triggers safe fallback."""
    response = client.post("/api/chat", json={"message": "What is the capital of Mars?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Asserts polite limitation or clarification
    assert "stayai" in data["answer"].lower() or "hotel" in data["answer"].lower() or "clarify" in data["answer"].lower()

def test_follow_up_conversation_context(client):
    """10. Follow-up question relying on prior turn: 'Do you have a pool?' -> 'What are the timings?'"""
    history = [
        {"role": "user", "content": "Do you have a swimming pool?"},
        {"role": "assistant", "content": "Yes, we have a heated Rooftop Infinity Pool on the 15th floor."}
    ]
    response = client.post("/api/chat", json={
        "message": "What are the timings?",
        "conversation_history": history
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Should reference pool operating hours (6:00 AM to 10:00 PM)
    assert "6:00 AM" in data["answer"] or "pool" in data["answer"].lower()

def test_cancellation_policy_question(client):
    """11. Cancellation policy query."""
    response = client.post("/api/chat", json={"message": "What is the cancellation policy?"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "24 hours" in data["answer"]

def test_empty_message_validation(client):
    """12. Empty message returns HTTP 422 or 400 validation error."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code in [400, 422]
    data = response.json()
    assert data["success"] is False
    assert "error" in data
