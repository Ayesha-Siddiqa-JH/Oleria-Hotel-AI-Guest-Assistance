from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..models.schemas import ServicesListResponse, ServiceItem, ServiceRequestPayload, ServiceRequestResponse
from ..services.hotel_service import hotel_service
from ..services.service_request_service import service_request_service

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.get("", response_model=ServicesListResponse)
async def get_hotel_services(hotel_id: str = Query("bengaluru", description="Hotel property ID")):
    """Returns catalog of guest services (pillows, towels, housekeeping, water, etc.) for property."""
    hotel = hotel_service.get_hotel(hotel_id)
    raw_services = hotel_service.get_services(hotel_id)
    return ServicesListResponse(
        success=True,
        hotel_id=hotel_id,
        hotel_name=hotel.get("hotel_name", "Oleria Hotel"),
        services=[ServiceItem(**s) for s in raw_services]
    )

@router.post("/request", response_model=ServiceRequestResponse)
async def create_hotel_service_request(payload: ServiceRequestPayload):
    """Creates a deterministic demo service request for the guest's room."""
    if not str(payload.room_number).strip():
        raise HTTPException(status_code=400, detail={"code": "MISSING_ROOM", "message": "Room number is required for service requests."})

    response = service_request_service.create_demo_request(payload)
    return response
