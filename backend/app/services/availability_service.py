from datetime import datetime, date
import random
from typing import Dict, Any, Tuple, Optional, List
from ..models.schemas import BookingCheckoutRequest, BookingCheckoutResponse
from ..services.hotel_service import hotel_service
from ..services.admin_store import admin_store
from ..utils.logging_config import logger

class AvailabilityService:
    def __init__(self):
        pass

    def validate_params(self, check_in_str: str, check_out_str: str, adults: int) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Deterministic validation for check-in date, check-out date, and guest count.
        """
        # Validate guest count
        if not isinstance(adults, int) or adults < 1:
            return False, "Number of guests must be at least 1.", None

        if adults > 10:
            return False, "For group bookings over 10 guests, please contact our events desk directly.", None

        # Validate date formats
        try:
            check_in_date = datetime.strptime(check_in_str.strip(), "%Y-%m-%d").date()
        except ValueError:
            return False, "Invalid check-in date format. Please use YYYY-MM-DD.", None

        try:
            check_out_date = datetime.strptime(check_out_str.strip(), "%Y-%m-%d").date()
        except ValueError:
            return False, "Invalid check-out date format. Please use YYYY-MM-DD.", None

        # Validate check-in is not in the past
        today = date.today()
        if check_in_date < today:
            return False, f"Check-in date ({check_in_str}) cannot be in the past.", None

        # Validate check-out is after check-in
        if check_out_date <= check_in_date:
            return False, f"Check-out date ({check_out_str}) must be at least one day after check-in ({check_in_str}).", None

        # Validate duration
        nights = (check_out_date - check_in_date).days
        if nights > 30:
            return False, "Online reservations are limited to a maximum stay of 30 nights.", None

        return True, None, {
            "check_in": check_in_str,
            "check_out": check_out_str,
            "adults": adults,
            "nights": nights,
            "check_in_date": check_in_date,
            "check_out_date": check_out_date
        }

    def check_availability(self, check_in: str, check_out: str, adults: int, hotel_id: str = "bengaluru") -> Dict[str, Any]:
        """
        Deterministic mock availability logic based on hotel capacity, property, and dates.
        """
        logger.info(f"Checking availability: hotel_id={hotel_id}, check_in={check_in}, check_out={check_out}, adults={adults}")
        
        is_valid, err_msg, info = self.validate_params(check_in, check_out, adults)
        if not is_valid:
            logger.warning(f"Availability validation failed: {err_msg}")
            return {
                "success": False,
                "available": False,
                "hotel_id": hotel_id,
                "error": {
                    "code": "INVALID_PARAMETERS",
                    "message": err_msg
                },
                "rooms": []
            }

        nights = info["nights"]
        suitable_rooms = hotel_service.find_suitable_rooms(adults, hotel_id=hotel_id)

        # Realistic mock availability: If requested guests exceed maximum single room capacity (4), return no room
        if not suitable_rooms:
            return {
                "success": True,
                "available": False,
                "hotel_id": hotel_id,
                "check_in": check_in,
                "check_out": check_out,
                "adults": adults,
                "nights": nights,
                "rooms": [],
                "message": f"No single room can accommodate {adults} adult guests at this property. Our largest suite accommodates up to 4 guests.",
                "demo_note": "Demo availability — mock inventory based on capacity and dates"
            }

        # Build list of available rooms with calculated total pricing
        room_results: List[Dict[str, Any]] = []
        for r in suitable_rooms:
            price_per_night = float(r.get("price_per_night", 0))
            total_price = price_per_night * nights
            room_results.append({
                "room_type_id": r.get("room_type_id"),
                "room_name": r.get("name"),
                "capacity": r.get("capacity"),
                "bed_type": r.get("bed_type"),
                "size_sqm": r.get("size_sqm"),
                "view": r.get("view"),
                "price_per_night": price_per_night,
                "total_price": total_price,
                "currency": r.get("currency", "INR"),
                "image": r.get("image", ""),
                "amenities": r.get("amenities", []),
                "description": r.get("description", "")
            })

        return {
            "success": True,
            "available": True,
            "hotel_id": hotel_id,
            "check_in": check_in,
            "check_out": check_out,
            "adults": adults,
            "nights": nights,
            "rooms": room_results,
            "demo_note": "Demo availability — mock inventory based on capacity and dates"
        }

    def book_room_demo(self, request: BookingCheckoutRequest) -> BookingCheckoutResponse:
        """
        Creates a deterministic demo room booking, assigns room number (e.g. 502),
        and returns confirmation for 'My Stay'.
        """
        hotel = hotel_service.get_hotel(request.hotel_id)
        hotel_name = hotel.get("hotel_name", "Oleria Hotel")
        
        # Match room
        rooms = hotel.get("rooms", [])
        matched_room = next((r for r in rooms if r.get("room_type_id") == request.room_type_id), None)
        room_name = matched_room.get("name", "Luxury Room") if matched_room else "Luxury Room"
        price_per_night = float(matched_room.get("price_per_night", 6000)) if matched_room else 6000.0

        # Calculate nights
        d_in = datetime.strptime(request.check_in, "%Y-%m-%d").date()
        d_out = datetime.strptime(request.check_out, "%Y-%m-%d").date()
        nights = max(1, (d_out - d_in).days)
        total_price = price_per_night * nights

        # Assign a realistic room number based on room type
        if "presidential" in request.room_type_id.lower() or "penthouse" in request.room_type_id.lower() or "villa" in request.room_type_id.lower():
            assigned_room = "801"
        elif "suite" in request.room_type_id.lower() or "executive" in request.room_type_id.lower():
            assigned_room = "502"
        else:
            assigned_room = "304"

        booking_suffix = random.randint(1000, 9999)
        booking_id = f"OLR-BK-{booking_suffix}"

        # Persist booking in AdminStore for live display in Admin Dashboard
        booking_record = {
            "booking_id": booking_id,
            "guest_name": request.guest_name,
            "hotel_id": request.hotel_id,
            "hotel_name": hotel_name,
            "room_type_id": request.room_type_id,
            "room_name": room_name,
            "assigned_room_number": assigned_room,
            "check_in": request.check_in,
            "check_out": request.check_out,
            "adults": request.adults,
            "nights": nights,
            "total_price": total_price,
            "currency": "INR",
            "status": "Confirmed"
        }
        admin_store.add_booking(booking_record)

        logger.info(f"Created demo booking {booking_id} for {request.guest_name} at {hotel_name}, Room {assigned_room}")

        return BookingCheckoutResponse(
            success=True,
            booking_id=booking_id,
            hotel_id=request.hotel_id,
            hotel_name=hotel_name,
            room_type_id=request.room_type_id,
            room_name=room_name,
            assigned_room_number=assigned_room,
            check_in=request.check_in,
            check_out=request.check_out,
            adults=request.adults,
            nights=nights,
            total_price=total_price,
            currency="INR",
            guest_name=request.guest_name,
            demo_note="Demo Experience — No real reservation or payment is processed."
        )

availability_service = AvailabilityService()

