import re
from datetime import datetime, date
from fastapi import APIRouter, HTTPException, status
from ..models.schemas import ChatRequest, ChatResponse, AvailabilityResult, RoomInfo
from ..services.llm_service import llm_service
from ..services.availability_service import availability_service
from ..utils.logging_config import logger

router = APIRouter(prefix="/api/chat", tags=["Chat"])

def extract_availability_parameters(text: str):
    """
    Attempts to extract dates (YYYY-MM-DD) and adult guest count from natural language text.
    """
    # Look for dates YYYY-MM-DD
    date_matches = re.findall(r'\b\d{4}-\d{2}-\d{2}\b', text)
    
    # Look for adult count: e.g. "3 guests", "2 adults", "for 4 people", "for 1 person"
    adults = 2  # default if not explicitly mentioned
    guest_match = re.search(r'\b(\d+)\s*(?:guests?|adults?|people|persons?)\b', text, re.IGNORECASE)
    if guest_match:
        adults = int(guest_match.group(1))

    if len(date_matches) >= 2:
        return date_matches[0], date_matches[1], adults
    
    return None, None, adults

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(payload: ChatRequest):
    """
    Main conversational endpoint for StayAI Guest Assistant.
    Coordinates between natural language understanding and deterministic availability tool.
    """
    message = payload.message.strip()
    history = payload.conversation_history
    logger.info(f"Received chat message: '{message}' (history length: {len(history)})")

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_MESSAGE", "message": "Message cannot be empty."}
        )

    # 1. Detect if the user is asking about availability
    lower_msg = message.lower()
    is_avail_query = any(keyword in lower_msg for keyword in [
        "available", "availability", "book", "reservation", "vacant", "rooms for"
    ])

    # Try extracting natural language parameters
    check_in, check_out, adults = extract_availability_parameters(message)

    if is_avail_query and check_in and check_out:
        # User provided dates in natural language -> execute deterministic availability tool
        logger.info(f"Executing deterministic availability tool for dates {check_in} to {check_out}, adults: {adults}")
        avail_res = availability_service.check_availability(check_in, check_out, adults)
        
        if not avail_res.get("success", False):
            # Validation error in dates
            err_msg = avail_res.get("error", {}).get("message", "Invalid dates provided.")
            return ChatResponse(
                success=True,
                answer=f"I tried checking availability for those dates, but there was an issue: {err_msg} Please adjust your dates or use the Check Availability panel on the right.",
                intent="availability",
                tool_used=False,
                availability=None
            )

        if avail_res.get("available", False):
            room_names = ", ".join([r["room_name"] for r in avail_res.get("rooms", [])])
            nights = avail_res.get("nights", 1)
            answer = (
                f"Good news! We have {len(avail_res.get('rooms', []))} room option(s) available for {adults} guest(s) "
                f"from {check_in} to {check_out} ({nights} night(s)): {room_names}. "
                f"Please review the room cards below or book via the availability panel."
            )
            
            # Convert to AvailabilityResult Pydantic model
            rooms_pydantic = [RoomInfo(**r) for r in avail_res.get("rooms", [])]
            avail_result_model = AvailabilityResult(
                available=True,
                check_in=check_in,
                check_out=check_out,
                adults=adults,
                nights=nights,
                rooms=rooms_pydantic,
                demo_note=avail_res.get("demo_note", "Demo availability — mock inventory based on capacity and dates")
            )

            return ChatResponse(
                success=True,
                answer=answer,
                intent="availability",
                tool_used=True,
                availability=avail_result_model
            )
        else:
            message_info = avail_res.get("message", "No rooms are available for the selected party size.")
            return ChatResponse(
                success=True,
                answer=f"I checked our inventory for {check_in} to {check_out} for {adults} guest(s), but unfortunately no suitable rooms are available: {message_info}",
                intent="availability",
                tool_used=True,
                availability=AvailabilityResult(
                    available=False,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    nights=avail_res.get("nights", 1),
                    rooms=[],
                    demo_note=avail_res.get("demo_note", "Demo availability — mock inventory based on capacity and dates")
                )
            )

    # If availability query without complete dates
    if is_avail_query and not (check_in and check_out):
        # We politely request dates and guests
        answer = (
            "I would be delighted to check room availability for you! "
            "Please provide your **check-in date** (YYYY-MM-DD), **check-out date** (YYYY-MM-DD), "
            "and the **number of guests**, or use the **Check Availability** panel on the right."
        )
        return ChatResponse(
            success=True,
            answer=answer,
            intent="availability",
            tool_used=False,
            availability=None
        )

    # 2. General hotel inquiry: delegate to LLM service (or grounded fallback)
    try:
        response_dict = llm_service.generate_response(
            message=message,
            conversation_history=history
        )
        return ChatResponse(
            success=True,
            answer=response_dict.get("answer", "I am here to help. How may I assist you?"),
            intent="hotel_information",
            tool_used=False,
            availability=None
        )
    except Exception as e:
        logger.exception(f"Error generating chat response: {e}")
        return ChatResponse(
            success=False,
            answer="I apologize, but our assistant is temporarily encountering an issue. Please try again shortly or contact our 24/7 front desk at +91 80 4965 2000.",
            intent="error",
            tool_used=False,
            availability=None,
            error={"code": "LLM_SERVICE_ERROR", "message": str(e)}
        )
