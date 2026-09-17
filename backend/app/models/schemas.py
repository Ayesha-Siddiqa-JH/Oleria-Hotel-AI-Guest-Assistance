from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Guest message or query")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list,
        description="Recent conversation turns (up to 8 recommended)"
    )

class RoomInfo(BaseModel):
    room_type_id: str
    room_name: str
    capacity: int
    bed_type: str
    size_sqm: int
    view: str
    price_per_night: float
    total_price: Optional[float] = None
    currency: str = "INR"
    amenities: List[str] = Field(default_factory=list)
    description: str

class AvailabilityResult(BaseModel):
    available: bool
    check_in: str
    check_out: str
    adults: int
    nights: int
    rooms: List[RoomInfo] = Field(default_factory=list)
    demo_note: str = "Demo availability — mock inventory based on capacity and dates"

class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    intent: str = "hotel_information"
    tool_used: bool = False
    availability: Optional[AvailabilityResult] = None
    error: Optional[dict] = None

class AvailabilityRequest(BaseModel):
    check_in: str = Field(..., description="Check-in date (YYYY-MM-DD)")
    check_out: str = Field(..., description="Check-out date (YYYY-MM-DD)")
    adults: int = Field(..., ge=1, le=10, description="Number of adult guests")

class AvailabilityResponse(BaseModel):
    success: bool = True
    available: bool = False
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    adults: Optional[int] = None
    nights: Optional[int] = None
    rooms: List[RoomInfo] = Field(default_factory=list)
    demo_note: Optional[str] = "Demo availability — mock inventory based on capacity and dates"
    error: Optional[dict] = None

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
