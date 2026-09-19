import random
from typing import Dict, Any, Optional
from ..models.schemas import ServiceRequestPayload, ServiceRequestResponse
from .hotel_service import hotel_service
from .admin_store import admin_store
from ..utils.logging_config import logger

class ServiceRequestService:
    def create_demo_request(self, payload: ServiceRequestPayload) -> ServiceRequestResponse:
        hotel = hotel_service.get_hotel(payload.hotel_id)
        hotel_name = hotel.get("hotel_name", "Oleria Hotel")
        services = hotel.get("services", [])
        
        # Match service
        matched_svc = next((s for s in services if s.get("service_id") == payload.service_id), None)
        service_name = payload.service_name or (matched_svc.get("name") if matched_svc else payload.service_id.replace("_", " ").title())
        est_delivery = matched_svc.get("delivery_time", "15-20 mins") if matched_svc else "15-20 mins"

        req_suffix = random.randint(1000, 9999)
        request_id = f"OLR-SRV-{req_suffix}"

        # Persist service request in AdminStore
        service_record = {
            "request_id": request_id,
            "guest_name": payload.guest_name,
            "hotel_id": payload.hotel_id,
            "hotel_name": hotel_name,
            "room_number": str(payload.room_number),
            "service_id": payload.service_id,
            "service_name": service_name,
            "status": "New",
            "estimated_delivery": est_delivery
        }
        admin_store.add_service_request(service_record)

        logger.info(f"Created demo service request {request_id} ({service_name}) for {payload.guest_name}, Room {payload.room_number}")

        return ServiceRequestResponse(
            success=True,
            request_id=request_id,
            hotel_id=payload.hotel_id,
            hotel_name=hotel.get("hotel_name", "Oleria Hotel"),
            service_id=payload.service_id,
            service_name=service_name,
            room_number=payload.room_number,
            guest_name=payload.guest_name,
            status="Confirmed",
            estimated_delivery=est_delivery,
            demo_note="Demo request — no real hotel staff will receive this request."
        )

service_request_service = ServiceRequestService()
