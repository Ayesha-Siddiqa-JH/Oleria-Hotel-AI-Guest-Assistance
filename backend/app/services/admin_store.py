import threading
from datetime import datetime
from typing import Dict, Any, List, Optional

class AdminStore:
    def __init__(self):
        self._lock = threading.Lock()
        self._bookings: List[Dict[str, Any]] = []
        self._orders: List[Dict[str, Any]] = []
        self._services: List[Dict[str, Any]] = []
        self._seed_initial_data()

    def _seed_initial_data(self):
        self._bookings = [
            {
                'booking_id': 'OLR-BK-1042',
                'guest_name': 'Rohan Kapoor',
                'hotel_id': 'bengaluru',
                'hotel_name': 'Oleria Bengaluru',
                'room_type_id': 'executive_king_suite',
                'room_name': 'Executive King Suite',
                'assigned_room_number': '502',
                'check_in': '2026-09-20',
                'check_out': '2026-09-23',
                'adults': 2,
                'nights': 3,
                'total_price': 25500.0,
                'currency': 'INR',
                'status': 'Confirmed',
                'created_at': '2026-09-18 10:15'
            },
            {
                'booking_id': 'OLR-BK-2089',
                'guest_name': 'Meera Sen',
                'hotel_id': 'goa',
                'hotel_name': 'Oleria Goa Resort & Spa',
                'room_type_id': 'beachfront_villa',
                'room_name': 'Beachfront Luxury Villa',
                'assigned_room_number': '801',
                'check_in': '2026-09-22',
                'check_out': '2026-09-25',
                'adults': 2,
                'nights': 3,
                'total_price': 45000.0,
                'currency': 'INR',
                'status': 'Confirmed',
                'created_at': '2026-09-18 11:30'
            },
            {
                'booking_id': 'OLR-BK-3115',
                'guest_name': 'Vikram Singhania',
                'hotel_id': 'mumbai',
                'hotel_name': 'Oleria Mumbai Bay',
                'room_type_id': 'sea_facing_suite',
                'room_name': 'Sea-Facing Grand Suite',
                'assigned_room_number': '502',
                'check_in': '2026-09-25',
                'check_out': '2026-09-27',
                'adults': 2,
                'nights': 2,
                'total_price': 32000.0,
                'currency': 'INR',
                'status': 'Confirmed',
                'created_at': '2026-09-18 12:45'
            }
        ]

        self._orders = [
            {
                'order_id': 'OLR-ORD-1102',
                'guest_name': 'Rohan Kapoor',
                'hotel_id': 'bengaluru',
                'hotel_name': 'Oleria Bengaluru',
                'room_number': '502',
                'items': [
                    {'item_id': 'blr-bev-1', 'name': 'Artisan South Indian Filter Coffee', 'quantity': 2, 'price': 220.0, 'price_per_unit': 220.0},
                    {'item_id': 'blr-lt-2', 'name': 'Moong Dal & Ghee Comfort Khichdi', 'quantity': 1, 'price': 450.0, 'price_per_unit': 450.0}
                ],
                'subtotal': 890.0,
                'taxes': 44.5,
                'total': 934.5,
                'status': 'Preparing',
                'estimated_delivery': '25–35 minutes',
                'created_at': '2026-09-18 13:20'
            },
            {
                'order_id': 'OLR-ORD-2204',
                'guest_name': 'Ananya Roy',
                'hotel_id': 'goa',
                'hotel_name': 'Oleria Goa Resort & Spa',
                'room_number': '304',
                'items': [
                    {'item_id': 'goa-bev-1', 'name': 'Tender Coconut & Lemongrass Cooler', 'quantity': 1, 'price': 200.0, 'price_per_unit': 200.0},
                    {'item_id': 'goa-mc-1', 'name': 'Goan Prawn Curry with Traditional Sannas', 'quantity': 1, 'price': 900.0, 'price_per_unit': 900.0}
                ],
                'subtotal': 1100.0,
                'taxes': 55.0,
                'total': 1155.0,
                'status': 'Out for Delivery',
                'estimated_delivery': '25–35 minutes',
                'created_at': '2026-09-18 13:45'
            },
            {
                'order_id': 'OLR-ORD-3306',
                'guest_name': 'Siddharth Malhotra',
                'hotel_id': 'mumbai',
                'hotel_name': 'Oleria Mumbai Bay',
                'room_number': '410',
                'items': [
                    {'item_id': 'mum-bev-1', 'name': 'Artisanal Cutting Masala Chai Flask', 'quantity': 1, 'price': 250.0, 'price_per_unit': 250.0},
                    {'item_id': 'mum-lt-1', 'name': 'Mumbai Spiced Club Sandwich', 'quantity': 1, 'price': 500.0, 'price_per_unit': 500.0}
                ],
                'subtotal': 750.0,
                'taxes': 37.5,
                'total': 787.5,
                'status': 'Delivered',
                'estimated_delivery': 'Delivered',
                'created_at': '2026-09-18 12:00'
            }
        ]

        self._services = [
            {
                'request_id': 'OLR-SRV-1011',
                'guest_name': 'Rohan Kapoor',
                'hotel_id': 'bengaluru',
                'hotel_name': 'Oleria Bengaluru',
                'room_number': '502',
                'service_id': 'extra_pillows',
                'service_name': 'Extra Memory Foam Pillows',
                'status': 'In Progress',
                'estimated_delivery': '10-15 mins',
                'created_at': '2026-09-18 13:10'
            },
            {
                'request_id': 'OLR-SRV-2022',
                'guest_name': 'Sunita Verma',
                'hotel_id': 'delhi',
                'hotel_name': 'Oleria Delhi Heritage',
                'room_number': '208',
                'service_id': 'late_checkout',
                'service_name': 'Late Check-out Request (2:00 PM)',
                'status': 'New',
                'estimated_delivery': '20 mins',
                'created_at': '2026-09-18 14:05'
            },
            {
                'request_id': 'OLR-SRV-3033',
                'guest_name': 'David Miller',
                'hotel_id': 'jaipur',
                'hotel_name': 'Oleria Jaipur Palace',
                'room_number': '102',
                'service_id': 'turndown_service',
                'service_name': 'Evening Royal Turndown & Rose Water',
                'status': 'Completed',
                'estimated_delivery': 'Completed',
                'created_at': '2026-09-18 11:00'
            }
        ]

    def get_summary(self, hotel_id: Optional[str] = None) -> Dict[str, Any]:
        with self._lock:
            bookings = self._bookings
            orders = self._orders
            services = self._services

            if hotel_id and hotel_id.lower() != 'all':
                h_id = hotel_id.lower().strip()
                bookings = [b for b in bookings if b.get('hotel_id', '').lower() == h_id]
                orders = [o for o in orders if o.get('hotel_id', '').lower() == h_id]
                services = [s for s in services if s.get('hotel_id', '').lower() == h_id]

            booking_rev = sum(float(b.get('total_price', 0)) for b in bookings if b.get('status') != 'Cancelled')
            order_rev = sum(float(o.get('total', 0)) for o in orders if o.get('status') != 'Cancelled')
            demo_revenue = round(booking_rev + order_rev, 2)

            return {
                'success': True,
                'hotel_filter': hotel_id or 'all',
                'total_bookings': len(bookings),
                'total_orders': len(orders),
                'total_services': len(services),
                'demo_revenue': demo_revenue,
                'booking_revenue': round(booking_rev, 2),
                'dining_revenue': round(order_rev, 2)
            }

    def get_bookings(self, hotel_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            if hotel_id and hotel_id.lower() != 'all':
                return [b for b in self._bookings if b.get('hotel_id', '').lower() == hotel_id.lower().strip()]
            return list(self._bookings)

    def add_booking(self, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            record = dict(booking_data)
            if 'created_at' not in record:
                record['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M')
            if 'status' not in record:
                record['status'] = 'Confirmed'
            self._bookings.insert(0, record)
            return record

    def update_booking_status(self, booking_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            for b in self._bookings:
                if b.get('booking_id') == booking_id:
                    b['status'] = new_status
                    return b
            return None

    def get_orders(self, hotel_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            if hotel_id and hotel_id.lower() != 'all':
                return [o for o in self._orders if o.get('hotel_id', '').lower() == hotel_id.lower().strip()]
            return list(self._orders)

    def add_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            record = dict(order_data)
            if 'created_at' not in record:
                record['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M')
            if 'status' not in record:
                record['status'] = 'Confirmed'
            self._orders.insert(0, record)
            return record

    def update_order_status(self, order_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            for o in self._orders:
                if o.get('order_id') == order_id:
                    o['status'] = new_status
                    if new_status == 'Delivered':
                        o['estimated_delivery'] = 'Delivered'
                    return o
            return None

    def get_services(self, hotel_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            if hotel_id and hotel_id.lower() != 'all':
                return [s for s in self._services if s.get('hotel_id', '').lower() == hotel_id.lower().strip()]
            return list(self._services)

    def add_service_request(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            record = dict(service_data)
            if 'created_at' not in record:
                record['created_at'] = datetime.now().strftime('%Y-%m-%d %H:%M')
            if 'status' not in record:
                record['status'] = 'New'
            self._services.insert(0, record)
            return record

    def update_service_status(self, request_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            for s in self._services:
                if s.get('request_id') == request_id:
                    s['status'] = new_status
                    if new_status == 'Completed':
                        s['estimated_delivery'] = 'Completed'
                    return s
            return None

admin_store = AdminStore()
