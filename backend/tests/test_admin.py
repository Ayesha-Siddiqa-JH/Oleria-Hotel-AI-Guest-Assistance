import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.admin_store import admin_store

client = TestClient(app)

def test_admin_summary_seed():
    """Verify seeded operational summary metrics."""
    res = client.get("/api/admin/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["total_bookings"] >= 3
    assert data["total_orders"] >= 3
    assert data["total_services"] >= 3
    assert data["demo_revenue"] > 0

def test_admin_bookings_list():
    """Verify admin bookings list endpoint."""
    res = client.get("/api/admin/bookings")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert isinstance(data["bookings"], list)
    assert len(data["bookings"]) >= 3
    first = data["bookings"][0]
    assert "booking_id" in first
    assert "guest_name" in first
    assert "hotel_name" in first
    assert "room_name" in first
    assert "total_price" in first

def test_admin_orders_list():
    """Verify admin dining orders endpoint."""
    res = client.get("/api/admin/orders")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert isinstance(data["orders"], list)
    assert len(data["orders"]) >= 3
    first = data["orders"][0]
    assert "order_id" in first
    assert "guest_name" in first
    assert "items" in first
    assert "total" in first
    assert "status" in first

def test_admin_services_list():
    """Verify admin service requests endpoint."""
    res = client.get("/api/admin/services")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert isinstance(data["services"], list)
    assert len(data["services"]) >= 3
    first = data["services"][0]
    assert "request_id" in first
    assert "service_name" in first
    assert "status" in first

def test_admin_hotel_filtering():
    """Verify filtering across hotels."""
    res_all = client.get("/api/admin/summary?hotel_id=all")
    res_blr = client.get("/api/admin/summary?hotel_id=bengaluru")
    assert res_all.status_code == 200
    assert res_blr.status_code == 200
    assert res_blr.json()["total_bookings"] <= res_all.json()["total_bookings"]

def test_live_room_booking_flow():
    """Verify live room booking appears in admin dashboard and updates revenue."""
    prev_summary = client.get("/api/admin/summary").json()
    prev_bookings = prev_summary["total_bookings"]
    prev_rev = prev_summary["demo_revenue"]

    payload = {
        "hotel_id": "bengaluru",
        "room_type_id": "deluxe_room",
        "check_in": "2026-10-01",
        "check_out": "2026-10-03",
        "adults": 2,
        "guest_name": "Test Guest Booking",
        "guest_email": "testguest@oleriahotels.com",
        "guest_phone": "+91 98765 43210"
    }
    res = client.post("/api/booking/checkout", json=payload)
    assert res.status_code == 200
    booking_id = res.json()["booking_id"]
    total_price = res.json()["total_price"]

    new_summary = client.get("/api/admin/summary").json()
    assert new_summary["total_bookings"] == prev_bookings + 1
    assert new_summary["demo_revenue"] == prev_rev + total_price

    bookings_res = client.get("/api/admin/bookings").json()
    assert bookings_res["bookings"][0]["booking_id"] == booking_id
    assert bookings_res["bookings"][0]["guest_name"] == "Test Guest Booking"

def test_live_food_order_flow():
    """Verify placing a food order appears in admin orders and updates revenue."""
    prev_summary = client.get("/api/admin/summary").json()
    prev_orders = prev_summary["total_orders"]
    prev_rev = prev_summary["demo_revenue"]

    payload = {
        "hotel_id": "bengaluru",
        "room_number": "502",
        "guest_name": "Food Lover Guest",
        "items": [
            {
                "item_id": "blr-bev-1",
                "name": "Artisan South Indian Filter Coffee",
                "quantity": 2,
                "price": 220.0,
                "price_per_unit": 220.0
            }
        ]
    }
    res = client.post("/api/dining/order", json=payload)
    assert res.status_code == 200
    order_data = res.json()
    assert order_data["success"] is True
    assert order_data["status"] == "Confirmed"
    assert "25" in order_data["estimated_delivery"]
    assert "Demo order" in order_data["demo_note"]

    new_summary = client.get("/api/admin/summary").json()
    assert new_summary["total_orders"] == prev_orders + 1
    assert new_summary["demo_revenue"] == round(prev_rev + order_data["total"], 2)

    orders_res = client.get("/api/admin/orders").json()
    assert orders_res["orders"][0]["order_id"] == order_data["order_id"]
    assert orders_res["orders"][0]["guest_name"] == "Food Lover Guest"

def test_live_service_request_flow():
    """Verify submitting service request appears in admin requests."""
    prev_services = client.get("/api/admin/summary").json()["total_services"]

    payload = {
        "hotel_id": "bengaluru",
        "service_id": "extra_towels",
        "service_name": "Plush Bath Towels",
        "room_number": "502",
        "guest_name": "Fresh Towels Guest"
    }
    res = client.post("/api/services/request", json=payload)
    assert res.status_code == 200
    req_id = res.json()["request_id"]

    new_services = client.get("/api/admin/summary").json()["total_services"]
    assert new_services == prev_services + 1

    services_res = client.get("/api/admin/services").json()
    assert services_res["services"][0]["request_id"] == req_id
    assert services_res["services"][0]["status"] == "New"

def test_update_order_status():
    """Verify updating order status persists."""
    orders = client.get("/api/admin/orders").json()["orders"]
    target_id = orders[0]["order_id"]

    for new_status in ["Preparing", "Out for Delivery", "Delivered"]:
        res = client.patch(f"/api/admin/orders/{target_id}/status", json={"status": new_status})
        assert res.status_code == 200
        assert res.json()["order"]["status"] == new_status

def test_update_service_status():
    """Verify updating service status persists."""
    services = client.get("/api/admin/services").json()["services"]
    target_id = services[0]["request_id"]

    for new_status in ["In Progress", "Completed"]:
        res = client.patch(f"/api/admin/services/{target_id}/status", json={"status": new_status})
        assert res.status_code == 200
        assert res.json()["service"]["status"] == new_status

def test_wellness_flow_end_to_end():
    """
    Test full flow:
    1. Guest says 'I'm not feeling well'
    2. AI Concierge returns light meal recommendations
    3. Guest adds item to cart and clicks Pay Demo Amount
    4. Order succeeds and appears in Admin Dashboard
    """
    chat_res = client.post("/api/chat", json={
        "message": "I'm not feeling well, please suggest something light",
        "hotel_id": "bengaluru",
        "guest_name": "Ayesha",
        "room_number": 502
    })
    assert chat_res.status_code == 200
    recs = chat_res.json().get("menu_recommendations", [])
    assert len(recs) > 0
    rec_item = recs[0]

    # Checkout cart with recommended item
    order_payload = {
        "hotel_id": "bengaluru",
        "room_number": "502",
        "guest_name": "Ayesha",
        "items": [
            {
                "item_id": rec_item.get("id") or rec_item.get("item_id"),
                "name": rec_item["name"],
                "quantity": 1,
                "price": rec_item["price"],
                "price_per_unit": rec_item["price"]
            }
        ]
    }
    order_res = client.post("/api/dining/order", json=order_payload)
    assert order_res.status_code == 200
    confirmed = order_res.json()
    assert confirmed["success"] is True
    assert confirmed["order_id"].startswith("OLR-ORD-")
    assert confirmed["guest_name"] == "Ayesha"
    assert confirmed["room_number"] == "502"
    assert len(confirmed["items"]) == 1
    assert confirmed["items"][0]["name"] == rec_item["name"]
    assert confirmed["status"] == "Confirmed"

    # Verify order in admin dashboard
    admin_orders = client.get("/api/admin/orders").json()["orders"]
    assert admin_orders[0]["order_id"] == confirmed["order_id"]
    assert admin_orders[0]["items"][0]["name"] == rec_item["name"]
