from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None

class CartItem(BaseModel):
    item_id: str
    name: str
    quantity: int = Field(default=1, ge=1)
    price_per_unit: Optional[float] = None
    price: Optional[float] = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.price_per_unit is None and self.price is not None:
            self.price_per_unit = self.price
        elif self.price is None and self.price_per_unit is not None:
            self.price = self.price_per_unit
        elif self.price_per_unit is None and self.price is None:
            self.price_per_unit = 0.0
            self.price = 0.0

class ChatAction(BaseModel):
    type: Optional[str] = None  # e.g., "add_to_cart", "cart_updated", "service_created", "order_created", "show_menu", "suggest_light_menu"
    data: Optional[Dict[str, Any]] = None

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
    image: Optional[str] = None
    amenities: List[str] = Field(default_factory=list)
    description: str

class AvailabilityResult(BaseModel):
    available: bool
    hotel_id: str = "bengaluru"
    check_in: str
    check_out: str
    adults: int
    nights: int
    rooms: List[RoomInfo] = Field(default_factory=list)
    demo_note: str = "Demo availability — mock inventory based on capacity and dates"

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Guest message or query")
    hotel_id: str = Field(default="bengaluru", description="Selected hotel property identifier")
    guest_name: Optional[Union[str, int]] = None
    room_number: Optional[Union[str, int]] = None
    conversation_history: List[ChatMessage] = Field(
        default_factory=list,
        description="Recent conversation turns"
    )
    current_cart: Optional[List[CartItem]] = Field(
        default_factory=list,
        description="Current items in guest food cart"
    )

class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    intent: str = "hotel_information"
    hotel_id: str = "bengaluru"
    hotel_name: Optional[str] = None
    tool_used: bool = False
    availability: Optional[AvailabilityResult] = None
    action: Optional[ChatAction] = None
    menu_recommendations: Optional[List[Dict[str, Any]]] = None
    error: Optional[dict] = None

class AvailabilityRequest(BaseModel):
    check_in: str = Field(..., description="Check-in date (YYYY-MM-DD)")
    check_out: str = Field(..., description="Check-out date (YYYY-MM-DD)")
    adults: int = Field(..., ge=1, le=10, description="Number of adult guests")
    hotel_id: str = Field(default="bengaluru", description="Hotel property ID")

class AvailabilityResponse(BaseModel):
    success: bool = True
    available: bool = False
    hotel_id: Optional[str] = "bengaluru"
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    adults: Optional[int] = None
    nights: Optional[int] = None
    rooms: List[RoomInfo] = Field(default_factory=list)
    demo_note: Optional[str] = "Demo availability — mock inventory based on capacity and dates"
    error: Optional[dict] = None

# Hotel Models
class HotelSummary(BaseModel):
    hotel_id: str
    hotel_name: str
    city: str
    tagline: str
    star_rating: int = 5
    hero_image: str

class HotelListResponse(BaseModel):
    success: bool = True
    hotels: List[HotelSummary]

class HotelDetailResponse(BaseModel):
    success: bool = True
    hotel: Dict[str, Any]

# Dining & Menu Models
class MenuItem(BaseModel):
    id: str
    name: str
    category: str
    price: float
    description: str
    tags: List[str] = Field(default_factory=list)
    image: Optional[str] = None

class MenuResponse(BaseModel):
    success: bool = True
    hotel_id: str
    hotel_name: str
    categories: List[str]
    items: List[MenuItem]

class CartCalculationRequest(BaseModel):
    hotel_id: str = "bengaluru"
    items: List[CartItem]

class CartCalculationResponse(BaseModel):
    success: bool = True
    hotel_id: str
    items: List[CartItem]
    item_count: int
    subtotal: float
    taxes: float
    gst: Optional[float] = None
    delivery_fee: float = 0.0
    total: float
    total_amount: Optional[float] = None

from typing import List, Optional, Literal, Dict, Any, Union

class FoodOrderRequest(BaseModel):
    hotel_id: str = "bengaluru"
    room_number: Union[str, int] = Field(..., description="Guest room number e.g. 502")
    guest_name: str = Field(..., description="Guest full name")
    items: List[CartItem]
    special_instructions: Optional[str] = None

class FoodOrderResponse(BaseModel):
    success: bool = True
    order_id: str
    hotel_id: str
    hotel_name: str
    room_number: Union[str, int]
    guest_name: str
    items: List[CartItem]
    subtotal: float
    taxes: float
    total: float
    status: str = "Confirmed"
    estimated_delivery_mins: int = 30
    estimated_delivery: Optional[str] = "30 mins"
    demo_note: str = "Demo order — no real food delivery will occur."

# Hotel Services Models
class ServiceItem(BaseModel):
    service_id: str
    name: str
    category: str
    description: str
    delivery_time: str = "15-20 mins"
    cost: str = "Complimentary"

class ServicesListResponse(BaseModel):
    success: bool = True
    hotel_id: str
    hotel_name: str
    services: List[ServiceItem]

class ServiceRequestPayload(BaseModel):
    hotel_id: str = "bengaluru"
    service_id: str
    service_name: Optional[str] = None
    room_number: Union[str, int] = Field(..., description="Guest room number e.g. 502")
    guest_name: str = Field(..., description="Guest full name")
    notes: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    success: bool = True
    request_id: str
    hotel_id: str
    hotel_name: str
    service_id: str
    service_name: str
    room_number: Union[str, int]
    guest_name: str
    status: str = "Confirmed"
    estimated_delivery: str = "15-20 mins"
    demo_note: str = "Demo request — no real hotel staff will receive this request."

# Room Booking Checkout Models
class BookingCheckoutRequest(BaseModel):
    hotel_id: str = "bengaluru"
    room_type_id: str
    check_in: str
    check_out: str
    adults: int = Field(default=2, ge=1, le=10)
    guest_name: str
    guest_email: str
    guest_phone: Optional[str] = None

class BookingCheckoutResponse(BaseModel):
    success: bool = True
    booking_id: str
    hotel_id: str
    hotel_name: str
    room_type_id: str
    room_name: str
    assigned_room_number: str
    room_number: Optional[Union[str, int]] = None
    check_in: str
    check_out: str
    adults: int
    nights: int
    total_price: float
    total_amount: Optional[float] = None
    currency: str = "INR"
    guest_name: str
    demo_note: str = "Demo Experience — No real reservation or payment is processed."

    def __init__(self, **data):
        super().__init__(**data)
        if self.room_number is None and self.assigned_room_number:
            self.room_number = self.assigned_room_number
        if self.total_amount is None and self.total_price is not None:
            self.total_amount = self.total_price

# Generic Error Models
class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
