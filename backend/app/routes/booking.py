from fastapi import APIRouter, HTTPException
from ..models.schemas import BookingCheckoutRequest, BookingCheckoutResponse
from ..services.availability_service import availability_service

router = APIRouter(prefix="/api/booking", tags=["Booking"])

@router.post("/checkout", response_model=BookingCheckoutResponse)
async def checkout_demo_booking(payload: BookingCheckoutRequest):
    """Processes simulated room reservation payment and assigns room number for My Stay."""
    if not payload.guest_name.strip():
        raise HTTPException(status_code=400, detail={"code": "MISSING_NAME", "message": "Guest name is required."})

    response = availability_service.book_room_demo(payload)
    return response
