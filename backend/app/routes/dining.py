from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from ..models.schemas import (
    MenuResponse, MenuItem, CartCalculationRequest, CartCalculationResponse,
    FoodOrderRequest, FoodOrderResponse
)
from ..services.hotel_service import hotel_service
from ..services.dining_service import dining_service

router = APIRouter(prefix="/api/dining", tags=["Dining"])

@router.get("/menu", response_model=MenuResponse)
async def get_hotel_menu(
    hotel_id: str = Query("bengaluru", description="Hotel property ID"),
    category: Optional[str] = Query(None, description="Optional category filter")
):
    """Returns in-room dining menu for the specified hotel."""
    hotel = hotel_service.get_hotel(hotel_id)
    raw_menu = hotel_service.get_menu(hotel_id, category=category)
    all_items = hotel.get("menu", [])
    categories = sorted(list(set(m.get("category", "General") for m in all_items)))

    return MenuResponse(
        success=True,
        hotel_id=hotel_id,
        hotel_name=hotel.get("hotel_name", "Oleria Hotel"),
        categories=categories,
        items=[MenuItem(**item) for item in raw_menu]
    )

@router.post("/cart/calculate", response_model=CartCalculationResponse)
async def calculate_cart_totals(payload: CartCalculationRequest):
    """Deterministically validates items and calculates subtotal, 5% GST, and grand total."""
    result = dining_service.calculate_cart(payload.hotel_id, payload.items)
    return CartCalculationResponse(**result)

@router.post("/order", response_model=FoodOrderResponse)
async def place_demo_food_order(payload: FoodOrderRequest):
    """Places a simulated demo food order with assigned room number and order ID."""
    if not payload.items:
        raise HTTPException(status_code=400, detail={"code": "EMPTY_CART", "message": "Cannot place order with empty cart."})
    if not str(payload.room_number).strip():
        raise HTTPException(status_code=400, detail={"code": "MISSING_ROOM", "message": "Room number is required for in-room dining."})

    response = dining_service.place_demo_order(payload)
    return response
