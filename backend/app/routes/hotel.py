from fastapi import APIRouter, HTTPException
from typing import Optional
from ..models.schemas import HotelListResponse, HotelDetailResponse, HotelSummary
from ..services.hotel_service import hotel_service

router = APIRouter(prefix="/api/hotel", tags=["Hotel"])

@router.get("s", response_model=HotelListResponse)
async def list_all_hotels():
    """Returns list of all 5 Oleria hotel properties."""
    hotels = hotel_service.get_all_hotels()
    return HotelListResponse(
        success=True,
        hotels=[HotelSummary(**h) for h in hotels]
    )

@router.get("", response_model=HotelDetailResponse)
async def get_default_hotel(hotel_id: Optional[str] = None):
    """Returns hotel property details by query param or defaults to Bengaluru."""
    target_id = hotel_id or "bengaluru"
    hotel = hotel_service.get_hotel(target_id)
    if not hotel:
        raise HTTPException(status_code=404, detail={"code": "HOTEL_NOT_FOUND", "message": f"Hotel '{target_id}' not found."})
    return HotelDetailResponse(
        success=True,
        hotel=hotel
    )

@router.get("/{hotel_id}", response_model=HotelDetailResponse)
async def get_hotel_by_id(hotel_id: str):
    """Returns complete property details, rooms, dining, amenities, policies, and FAQs."""
    hotel = hotel_service.get_hotel(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail={"code": "HOTEL_NOT_FOUND", "message": f"Hotel '{hotel_id}' not found."})
    return HotelDetailResponse(
        success=True,
        hotel=hotel
    )
