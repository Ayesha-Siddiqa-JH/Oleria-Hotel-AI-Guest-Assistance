import random
from typing import List, Dict, Any, Optional
from ..models.schemas import CartItem, CartCalculationResponse, FoodOrderRequest, FoodOrderResponse
from .hotel_service import hotel_service
from .admin_store import admin_store
from ..utils.logging_config import logger

class DiningService:
    def calculate_cart(self, hotel_id: str, items: List[CartItem]) -> Dict[str, Any]:
        hotel = hotel_service.get_hotel(hotel_id)
        menu_items_map = {m["id"]: m for m in hotel.get("menu", [])}

        validated_items: List[CartItem] = []
        subtotal = 0.0

        for item in items:
            menu_item = menu_items_map.get(item.item_id)
            if not menu_item:
                # Find by exact name match if ID mismatch
                for m in hotel.get("menu", []):
                    if m["name"].lower() == item.name.lower():
                        menu_item = m
                        break

            if menu_item:
                unit_price = float(menu_item.get("price", item.price_per_unit or item.price or 0.0))
                item_name = menu_item.get("name", item.name)
                item_id = menu_item.get("id", item.item_id)
            else:
                unit_price = float(item.price_per_unit or item.price or 0.0)
                item_name = item.name or "Dining Special"
                item_id = item.item_id or f"item-{random.randint(100, 999)}"

            item_qty = max(1, item.quantity)
            subtotal += unit_price * item_qty
            validated_items.append(CartItem(
                item_id=item_id,
                name=item_name,
                quantity=item_qty,
                price_per_unit=unit_price,
                price=unit_price
            ))

        taxes = round(subtotal * 0.05, 2)  # 5% GST
        delivery_fee = 0.0  # Complimentary in-room delivery for guests
        total = round(subtotal + taxes + delivery_fee, 2)

        return {
            "success": True,
            "hotel_id": hotel_id,
            "items": validated_items,
            "item_count": sum(i.quantity for i in validated_items),
            "subtotal": subtotal,
            "taxes": taxes,
            "gst": taxes,
            "delivery_fee": delivery_fee,
            "total": total,
            "total_amount": total
        }

    def place_demo_order(self, request: FoodOrderRequest) -> FoodOrderResponse:
        hotel = hotel_service.get_hotel(request.hotel_id)
        hotel_name = hotel.get("hotel_name", "Oleria Hotel")
        calc = self.calculate_cart(request.hotel_id, request.items)

        order_suffix = random.randint(1000, 9999)
        order_id = f"OLR-ORD-{order_suffix}"

        # Persist order in AdminStore for live visibility in Admin Dashboard
        order_record = {
            "order_id": order_id,
            "guest_name": request.guest_name,
            "hotel_id": request.hotel_id,
            "hotel_name": hotel_name,
            "room_number": str(request.room_number),
            "items": [
                {
                    "item_id": i.item_id,
                    "name": i.name,
                    "quantity": i.quantity,
                    "price_per_unit": i.price_per_unit or i.price or 0.0,
                    "price": (i.price_per_unit or i.price or 0.0) * i.quantity
                }
                for i in calc["items"]
            ],
            "subtotal": calc["subtotal"],
            "taxes": calc["taxes"],
            "total": calc["total"],
            "status": "Confirmed",
            "estimated_delivery": "25–35 minutes",
            "special_instructions": request.special_instructions
        }
        admin_store.add_order(order_record)

        logger.info(f"Created demo food order {order_id} for {request.guest_name} at {hotel_name}, Room {request.room_number}")

        return FoodOrderResponse(
            success=True,
            order_id=order_id,
            hotel_id=request.hotel_id,
            hotel_name=hotel_name,
            room_number=request.room_number,
            guest_name=request.guest_name,
            items=calc["items"],
            subtotal=calc["subtotal"],
            taxes=calc["taxes"],
            total=calc["total"],
            status="Confirmed",
            estimated_delivery_mins=30,
            estimated_delivery="25–35 minutes",
            demo_note="Demo order — No real payment was charged. The order has been sent to the hotel kitchen demo queue."
        )

dining_service = DiningService()
