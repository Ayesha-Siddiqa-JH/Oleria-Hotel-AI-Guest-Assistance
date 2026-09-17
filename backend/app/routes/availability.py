from fastapi import APIRouter, HTTPException, status
from ..models.schemas import AvailabilityRequest, AvailabilityResponse, ErrorResponse, ErrorDetail
from ..services.availability_service import availability_service
from ..utils.logging_config import logger

router = APIRouter(prefix="/api/availability", tags=["Availability"])

@router.post("", response_model=AvailabilityResponse)
async def check_room_availability(payload: AvailabilityRequest):
    """
    Deterministic room availability endpoint.
    Validates check-in, check-out dates and guest count, then computes matching room options.
    """
    try:
        result = availability_service.check_availability(
            check_in=payload.check_in,
            check_out=payload.check_out,
            adults=payload.adults
        )

        if not result.get("success", False):
            # Return 400 for validation errors with structured payload
            err = result.get("error", {})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": err.get("code", "INVALID_PARAMS"), "message": err.get("message", "Validation failed")}
            )

        return AvailabilityResponse(
            success=True,
            available=result.get("available", False),
            check_in=result.get("check_in"),
            check_out=result.get("check_out"),
            adults=result.get("adults"),
            nights=result.get("nights"),
            rooms=result.get("rooms", []),
            demo_note=result.get("demo_note", "Demo availability — mock inventory based on capacity and dates"),
            error=None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in check_room_availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred while checking room availability."}
        )
