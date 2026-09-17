import pytest
from datetime import date, timedelta

def test_valid_availability_two_adults(client):
    """Valid availability request for 2 adults returns available rooms and pricing."""
    check_in = (date.today() + timedelta(days=5)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=7)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": check_in,
        "check_out": check_out,
        "adults": 2
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["available"] is True
    assert data["nights"] == 2
    assert len(data["rooms"]) >= 1
    
    # Check that each room has price, capacity, and total_price
    for r in data["rooms"]:
        assert r["capacity"] >= 2
        assert r["total_price"] == r["price_per_night"] * 2
        assert r["currency"] == "INR"

def test_availability_capacity_filtering(client):
    """3 adults should filter out 2-person Deluxe Room and keep 3+ capacity suites."""
    check_in = (date.today() + timedelta(days=5)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=6)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": check_in,
        "check_out": check_out,
        "adults": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["available"] is True
    
    room_names = [r["room_name"] for r in data["rooms"]]
    assert "Deluxe Room" not in room_names
    assert "Executive King Suite" in room_names
    assert "Presidential Family Suite" in room_names

def test_availability_exceeding_capacity(client):
    """5 adults exceeds max single room capacity (4) -> available: False."""
    check_in = (date.today() + timedelta(days=5)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=6)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": check_in,
        "check_out": check_out,
        "adults": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["available"] is False
    assert len(data["rooms"]) == 0

def test_error_past_checkin_date(client):
    """Check-in date in the past returns HTTP 400 with clear message."""
    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")
    tomorrow = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": yesterday,
        "check_out": tomorrow,
        "adults": 2
    })
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "past" in detail["message"].lower()

def test_error_checkout_before_checkin(client):
    """Check-out date before or equal to check-in returns HTTP 400."""
    day1 = (date.today() + timedelta(days=5)).strftime("%Y-%m-%d")
    day2 = (date.today() + timedelta(days=3)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": day1,
        "check_out": day2,
        "adults": 2
    })
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "after check-in" in detail["message"].lower()

def test_error_stay_exceeds_max_nights(client):
    """Stay exceeding 30 nights returns HTTP 400."""
    check_in = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=35)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": check_in,
        "check_out": check_out,
        "adults": 2
    })
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "30 nights" in detail["message"]

def test_error_invalid_guest_count(client):
    """Zero or negative guests returns HTTP 422 or 400."""
    check_in = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    check_out = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")
    
    response = client.post("/api/availability", json={
        "check_in": check_in,
        "check_out": check_out,
        "adults": 0
    })
    assert response.status_code in [400, 422]
