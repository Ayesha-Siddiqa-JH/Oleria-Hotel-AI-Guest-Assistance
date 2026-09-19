from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, Any
from pydantic import BaseModel
from ..services.admin_store import admin_store
from ..utils.logging_config import logger

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

class StatusUpdatePayload(BaseModel):
    status: str

@router.get("/summary")
async def get_admin_summary(hotel_id: Optional[str] = Query(None, description="Filter metrics by hotel property")):
    """Returns high-level operational counts and demo revenue."""
    return admin_store.get_summary(hotel_id)

@router.get("/bookings")
async def get_all_bookings(hotel_id: Optional[str] = Query(None, description="Filter bookings by hotel")):
    """Returns all guest room reservations, ordered newest first."""
    bookings = admin_store.get_bookings(hotel_id)
    return {"success": True, "count": len(bookings), "bookings": bookings}

@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, payload: StatusUpdatePayload):
    """Updates room booking status (Confirmed, Completed, Cancelled)."""
    updated = admin_store.update_booking_status(booking_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail={"code": "BOOKING_NOT_FOUND", "message": f"Booking {booking_id} not found."})
    logger.info(f"Admin updated booking {booking_id} status to {payload.status}")
    return {"success": True, "booking": updated}

@router.get("/orders")
async def get_all_orders(hotel_id: Optional[str] = Query(None, description="Filter food orders by hotel")):
    """Returns all in-room dining orders, ordered newest first."""
    orders = admin_store.get_orders(hotel_id)
    return {"success": True, "count": len(orders), "orders": orders}

@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: StatusUpdatePayload):
    """Updates room dining order status (Confirmed, Preparing, Out for Delivery, Delivered)."""
    valid_statuses = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail={"code": "INVALID_STATUS", "message": f"Status must be one of {valid_statuses}"})
    
    updated = admin_store.update_order_status(order_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail={"code": "ORDER_NOT_FOUND", "message": f"Order {order_id} not found."})
    logger.info(f"Admin updated food order {order_id} status to {payload.status}")
    return {"success": True, "order": updated}

@router.get("/services")
async def get_all_services(hotel_id: Optional[str] = Query(None, description="Filter service requests by hotel")):
    """Returns all guest service requests, ordered newest first."""
    services = admin_store.get_services(hotel_id)
    return {"success": True, "count": len(services), "services": services}

@router.patch("/services/{request_id}/status")
async def update_service_status(request_id: str, payload: StatusUpdatePayload):
    """Updates guest service request status (New, In Progress, Completed)."""
    valid_statuses = ["New", "In Progress", "Completed"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail={"code": "INVALID_STATUS", "message": f"Status must be one of {valid_statuses}"})

    updated = admin_store.update_service_status(request_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail={"code": "SERVICE_NOT_FOUND", "message": f"Service request {request_id} not found."})
    logger.info(f"Admin updated service request {request_id} status to {payload.status}")
    return {"success": True, "service": updated}
