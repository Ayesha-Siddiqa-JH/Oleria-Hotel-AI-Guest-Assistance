# OLERIA HOTEL — Interview Preparation Notes & Technical Defense

This guide provides structured, conversational, and technically rigorous explanations of the architectural, AI, and product decisions behind **OLERIA HOTEL** for the **Simplotel AI Product Engineer** evaluation.

---

## 1. Executive Summary: What Makes Oleria Hotel Production-Grade?

1. **Multi-Property Architecture**: Five distinct properties (Bengaluru, Goa, Mumbai, Delhi, Jaipur) with completely isolated knowledge bases, dining menus, service offerings, and suite categories.
2. **Deterministic Single Source of Truth**: Availability checks, pricing, 5% GST on dining, 12% GST on rooms, order tracking numbers (`OLR-ORD-XXXX`), and service request IDs (`OLR-SRV-XXXX`) are 100% computed in Python backend logic. The LLM is never allowed to guess or confirm transactions.
3. **Full Guest Lifecycle Integration**: From property discovery and room availability search, to instant demo booking, activating "My Stay" with Room 502, in-room food ordering, housekeeping requests, and compassionate "not feeling well" assistance.
4. **Single Clean AI Trigger**: The AI Concierge is accessed via a single, polished bottom-right floating widget. Duplicate buttons have been eliminated.
5. **Zero-Failure Offline Fallback**: The platform operates with 100% reliability even if Gemini API keys are absent or network connections drop, thanks to rule-based keyword matching.

---

## 2. Why React 18 + Vite for the Frontend?
- **Component Reusability & Isolation**: Modals (`FoodCartModal`, `BookingModal`), sections (`MyStayCard`, `MakeMyStayEasierSection`, `HotelServicesSection`, `DiningSection`), and the floating `ChatConcierge` maintain independent state while syncing cleanly through React state lifting.
- **Sub-Second Hot Module Reloading & Optimized Build**: Vite 5 produces minified production assets with gzip compression (~70KB JS bundle), ensuring instant page loads.
- **Declarative UI for Real-Time State**: React smoothly updates live cart badge counters, order tracking toasts, and in-chat recommendation cards without DOM flicker.

---

## 3. Why FastAPI for the Backend?
- **High Concurrency & Async I/O**: Hospitality chatbots handle multiple simultaneous visitors asking questions or requesting quotes. FastAPI is built on Starlette and ASGI, delivering asynchronous event loops capable of handling thousands of concurrent connections with minimal overhead.
- **Strict Data Validation with Pydantic v2**: Inputs (`check_in`, `check_out`, `adults`, `items`, `room_number`) are validated before touching business logic. Invalid inputs produce automatic, structured 422/400 errors.
- **Auto-Generated OpenAPI / Swagger**: Interactive API testing available out-of-the-box at `/docs`.

---

## 4. Why Google Gemini 2.5 Flash?
- **Sub-Second Latency & High Reasoning Fidelity**: Flash models provide high reasoning fidelity and sub-second token generation speeds at cost-effective pricing, essential for conversational concierges.
- **System Instructions & Large Context Window**: Gemini handles rich system instructions and detailed property context effortlessly, maintaining strict grounding across multiple conversation turns.
- **Clean Python SDK Integration**: Uses the official `google-genai` SDK.

---

## 5. Why Property-Isolated JSON Schemas?
- **Simplicity & Zero Infrastructure Friction**: Eliminates the need to run, configure, and migrate a PostgreSQL/MySQL database for local development and interviewing. Anyone can clone the repository and run it in seconds.
- **Strict Property Isolation**: Files `bengaluru.json`, `goa.json`, `mumbai.json`, `delhi.json`, and `jaipur.json` isolate hotel facts into structured schemas. Goa never mentions Bengaluru's rooftop pool; Delhi never claims Candolim beach access.
- **Clean Service Boundary**: `HotelService` abstracts the data source behind clean methods (`get_hotel_data()`, `find_suitable_rooms()`). Swapping JSON for PostgreSQL + SQLAlchemy or MongoDB later requires changing only the service layer without touching routes, schemas, or the frontend.

---

## 6. How Are LLM Hallucinations Prevented?
1. **Context Grounding**: Every prompt injected into the LLM includes verified hotel records for the specific active `hotel_id`.
2. **Strict System Instructions**: The system prompt explicitly commands: *"Answer ONLY using the provided hotel context. Never invent amenities, rooms, prices, or policies. If not in the context, state that the information is unavailable."*
3. **Deterministic Tool Boundaries**: The LLM NEVER generates final order IDs, booking IDs, or price calculations. It delegates to deterministic backend services.
4. **Low Temperature (0.2)**: Minimizes stochastic creativity for factual hotel queries.
5. **Rule-Based Grounded Fallback**: Even if the LLM is completely offline, our fallback engine performs keyword matching against verified JSON fields, ensuring 0% hallucination rate.

---

## 7. How Does the "Not Feeling Well" Flow Work?
- **Empathy & Guest Care**: Acknowledges illness with warm hospitality.
- **Medical Boundary**: Explicitly clarifies that the AI cannot give medical diagnoses or prescribe medications.
- **Comforting Light Dining**: Queries the active property's menu for items tagged `light`, `soup`, `tea`, `healthy`, `comfort` (e.g., Coastal Lemon Coriander Soup, Royal Kahwa, Ginger Mint Infusion).
- **Front Desk Notification / Emergency Escalation**: Supplies direct front desk extension numbers and emergency contact options.

---

## 8. How Does the In-Room Food Ordering & Cart Work?
- **Menu Categorization**: Beverages, Light Meals, Mains, Breakfast, Desserts.
- **Deterministic 5% GST**: Subtotal + 5% GST is computed strictly in Python (`DiningService.calculate_cart_totals`).
- **Conversational Ordering**: The AI Concierge extracts requested dishes and quantities from conversational user messages, checks menu availability, and outputs structured action payloads (`food_order_placed`) with unique `OLR-ORD-XXXX` tracking IDs.
