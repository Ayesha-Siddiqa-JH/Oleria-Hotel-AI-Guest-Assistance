# StayAI ? AI-Powered Hotel Guest Assistant

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-21_Passed-success?style=flat-square&logo=pytest&logoColor=white)](https://pytest.org/)

**StayAI** is a production-grade, full-stack AI-powered hotel guest assistant designed for modern luxury hospitality websites. It allows hotel guests to ask questions about property amenities, dining, check-in/out policies, room types, and check real-time room availability through an intuitive, luxury boutique web interface.

Built to fulfill all requirements of the **Simplotel AI Product Engineer Intern Assignment**, the system couples the conversational empathy and natural-language understanding of Google Gemini with rock-solid, deterministic backend business logic for availability and pricing calculation.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Customer Problem](#2-customer-problem)
3. [Key Features](#3-key-features)
4. [Guest Journey](#4-guest-journey)
5. [Technology Stack](#5-technology-stack)
6. [Architecture](#6-architecture)
7. [Data Flow](#7-data-flow)
8. [AI Design](#8-ai-design)
9. [Gemini Integration](#9-gemini-integration)
10. [Prompt & Context Strategy](#10-prompt--context-strategy)
11. [Deterministic Business Logic](#11-deterministic-business-logic)
12. [Hallucination Prevention](#12-hallucination-prevention)
13. [Error Handling & Fallback Behavior](#13-error-handling--fallback-behavior)
14. [API Documentation & cURL Examples](#14-api-documentation--curl-examples)
15. [Setup Instructions](#15-setup-instructions)
16. [Backend Setup](#16-backend-setup)
17. [Frontend Setup](#17-frontend-setup)
18. [Environment Variables](#18-environment-variables)
19. [Running the Application](#19-running-the-application)
20. [Testing & Verification](#20-testing--verification)
21. [Evaluation Scenarios & Results Matrix](#21-evaluation-scenarios--results-matrix)
22. [Product Decisions](#22-product-decisions)
23. [UX Decisions](#23-ux-decisions)
24. [Engineering Decisions](#24-engineering-decisions)
25. [Future Production Improvements](#25-future-production-improvements)
26. [AI Development Tools Used](#26-ai-development-tools-used)

---

## 1. Project Overview
StayAI represents a realistic prototype of a next-generation guest concierge. Guests visiting the hotel website often spend unnecessary time searching through multiple subpages or calling the front desk to find answers to routine questions (e.g., *"What time is check-in?"*, *"Is breakfast included?"*, *"Do you have a pool?"*, *"Which room is best for 3 guests?"*, or *"Do you have rooms available next weekend?"*).

StayAI solves this by offering:
- An **Interactive Chat Concierge** capable of answering property questions, handling multi-turn follow-ups, and extracting booking dates.
- A **Dedicated Availability Panel** that allows direct query of live inventory and room capacities.
- **Embedded Room Cards** directly within the conversation when availability is requested in natural language.

---

## 2. Customer Problem
- **Hotel Operations**: Hotel front desks and call centers receive hundreds of repetitive inquiries daily regarding pool hours, breakfast inclusions, early check-in fees, and cancellation rules. This distracts staff from in-person guest care.
- **Guest Friction**: Guests browsing on mobile or desktop must often click through 4 to 6 separate website tabs (Amenities, Rooms, Dining, Policies) or navigate complex booking engines just to verify simple facts.
- **Booking Abandonment**: When guests cannot quickly verify whether a room fits their family or whether cancellation is flexible, they leave the website and book via Online Travel Agencies (OTAs), costing the hotel 15?25% in commissions.

---

## 3. Key Features
- **Conversational Concierge**: Answers FAQs, amenities, dining hours, and policies using verified hotel records.
- **Multi-Turn Context Tracking**: Remembers prior conversational turns (e.g., Guest: *"Do you have a pool?"* -> *"What are the timings?"*).
- **Deterministic Availability Engine**: Rigorously validates check-in dates, check-out dates, and adult guest counts before checking room inventory.
- **Embedded Interactive Room Cards**: When room availability is found, returns structured cards displaying room size, view, bed configurations, nightly rate, and total stay price in INR.
- **Suggestion Chips**: One-click quick questions for rapid mobile and desktop exploration.
- **Graceful Offline Fallback**: Works 100% reliably even if Gemini API keys are unconfigured or external networks are down.
- **Full Responsive Experience**: Optimized for 1440px desktop down to 375px mobile screens.

---

## 4. Guest Journey
```
1. Guest Lands on Hotel Webpage
       ?
       ?
2. Welcomed by StayAI Concierge Banner & Quick Chips
       ?
       ????????????????????????????????????????????????????????????????????
       ?                                 ?                                ?
3A. Asks FAQ Question            3B. Asks Incomplete Avail        3C. Natural Language Query
(e.g., 'Is breakfast included?')  (e.g., 'Do you have rooms?')    (e.g., 'Room for 3 on Oct 10-12')
       ?                                 ?                                ?
       ?                                 ?                                ?
4A. Instant Grounded Answer       4B. Polite Clarification         4C. Deterministic Tool Execution
(Glasshouse Bistro details)       (Asks for dates & guests)        (Returns structured room cards)
       ?                                 ?                                ?
       ????????????????????????????????????????????????????????????????????
                                         ?
                                         ?
                 5. Guest Views Availability Panel & Room Options
                                         ?
                                         ?
                 6. Fast, Friction-Free Decision to Book Directly
```

---

## 5. Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React icons.
- **Backend**: Python 3.13 / 3.12, FastAPI, Pydantic v2, Uvicorn, Python-dotenv.
- **AI / LLM**: Google Gemini API (`google-genai` / `google-generativeai`), with clean architectural abstraction and offline grounded fallback.
- **Testing**: `pytest`, `pytest-asyncio`, `httpx` (FastAPI TestClient) ? **21 automated tests**.
- **Data Layer**: Clean JSON knowledge base (`backend/app/data/hotel.json`) structured for straightforward future migration to PostgreSQL or MySQL.

---

## 6. Architecture

```
??????????????????????????????????????????????????????????????????????????
?                        BROWSER / REACT FRONTEND                        ?
?                                                                        ?
?  ????????????????????????????????    ????????????????????????????????  ?
?  ?   ChatWindow (Messages,      ?    ?  AvailabilityCard & Form     ?  ?
?  ?   Input, Quick Questions)    ?    ?  (Dates, Guests, Results)    ?  ?
?  ????????????????????????????????    ????????????????????????????????  ?
?                 ?                                   ?                  ?
??????????????????????????????????????????????????????????????????????????
                  ?  POST /api/chat                   ? POST /api/availability
                  ?  GET  /api/hotel                  ?
                  ?                                   ?
??????????????????????????????????????????????????????????????????????????
?                          FASTAPI BACKEND                               ?
?                                                                        ?
?  ????????????????????????????????    ????????????????????????????????  ?
?  ?     routes/chat.py           ?    ?   routes/availability.py     ?  ?
?  ????????????????????????????????    ????????????????????????????????  ?
?                 ?                                   ?                  ?
?                 ?                                   ?                  ?
?  ????????????????????????????????    ????????????????????????????????  ?
?  ?     LLMService               ?    ?   AvailabilityService        ?  ?
?  ?  (Prompt, Gemini API,        ?    ? (Date validation, Capacity,  ?  ?
?  ?   Safe Fallback Engine)      ?    ?  Pricing, Mock Inventory)    ?  ?
?  ????????????????????????????????    ????????????????????????????????  ?
?                 ?                                   ?                  ?
?                 ?                                   ?                  ?
?  ????????????????????????????????????????????????????????????????????  ?
?  ?                      HotelService                                ?  ?
?  ?       Loads & queries backend/app/data/hotel.json                ?  ?
?  ????????????????????????????????????????????????????????????????????  ?
??????????????????????????????????????????????????????????????????????????
```

---

## 7. Data Flow
1. **Chat Route (`/api/chat`)**:
   - Accepts `{ message, conversation_history }`.
   - Checks if message requests room availability:
     - If dates and guest count are detected, calls `AvailabilityService.check_availability(check_in, check_out, adults)`.
     - Returns conversational response augmented with structured `AvailabilityResult`.
   - If general question:
     - Formats recent conversation turns (up to 6 turns).
     - Injects grounded hotel context from `HotelService`.
     - Calls `LLMService.generate_response(...)`.
     - If Gemini is offline/unconfigured, falls back to grounded rule matcher.
     - Returns `{ success: true, answer: '...', intent: 'hotel_information', tool_used: false }`.
2. **Availability Route (`/api/availability`)**:
   - Accepts `{ check_in, check_out, adults }`.
   - Validates parameters deterministically.
   - Computes stay duration in nights.
   - Filters rooms by capacity (`capacity >= adults`).
   - Returns structured `AvailabilityResponse`.

---

## 8. AI Design
The AI system is specifically engineered to treat the LLM as a **reasoning and linguistic interface**, NOT as a database or business calculator.
- **Role**: Natural language understanding, intent classification, contextual follow-up resolution, and courteous explanation.
- **Provider Abstraction**: Encapsulated inside `LLMService` in `backend/app/services/llm_service.py`. The rest of the application never touches Gemini directly, allowing seamless swaps to OpenAI, Anthropic, or local HuggingFace models without touching route logic.
- **State Handling**: The frontend passes the recent conversation window (last 6 turns), keeping backend state stateless and horizontally scalable.

---

## 9. Gemini Integration
- Integration uses the modern `google-genai` SDK with fallback to `google-generativeai`.
- The API key is read strictly from `os.getenv("GEMINI_API_KEY")` on the backend.
- **Security Guarantee**:
  - The API key is never bundled in frontend assets.
  - The frontend never makes direct network requests to Google Gemini.
  - `.env` is git-ignored; `.env.example` is provided.

---

## 10. Prompt & Context Strategy
The system instruction enforces 6 unbreakable behavioral guardrails:
1. **Absolute Grounding**: The model must answer *only* using the supplied hotel context string generated from `hotel.json`.
2. **Zero Price/Policy Hallucination**: Never guess rates, amenities, or operating hours.
3. **No Fake Bookings**: Never claim a booking was finalized or confirmed.
4. **Availability Clarification**: When asked about availability without dates, prompt for check-in date, check-out date, and guest count.
5. **Out-of-Domain Boundaries**: Politely decline general knowledge queries (e.g. general trivia, coding, unrelated topics) and redirect to the hotel desk.
6. **Concise & Elegant Tone**: Deliver answers formatted with clean bullet points and professional hotel hospitality phrasing.

---

## 11. Deterministic Business Logic
Hotel inventory and date math must never be left to stochastic LLM token probabilities.
Deterministic Python logic handles:
- **Date parsing & validation**: `check_in >= date.today()`, `check_out > check_in`, max duration <= 30 nights.
- **Guest capacity rules**: Compares requested adults against `room.capacity`. If 3 adults request a 2-person Deluxe Room, the Deluxe Room is excluded. If party size is 5 adults, the system indicates that no single room accommodates 5, advising multiple rooms.
- **Rate calculations**: `nights = (check_out - check_in).days`; `total_price = price_per_night * nights`.

---

## 12. Hallucination Prevention
To prevent hallucinations:
1. **Dynamic Context Injection**: Every LLM prompt is injected with the complete verified property data (room types, bed configurations, exact check-in times, breakfast pricing, pool operating hours, pet fee, cancellation policy).
2. **Temperature Control**: Low temperature (`0.2`) to minimize creative deviation.
3. **Deterministic Tool Separation**: The LLM is never asked to compute availability or pricing.
4. **Strict Negative Constraints**: Negative prompt rules: *"If information is not explicitly provided in the hotel knowledge base, explicitly say that you do not have that information."*
5. **Rule-Based Grounded Fallback**: Even in fallback mode, answers are sourced strictly from key-value lookups in `hotel.json`.

---

## 13. Error Handling & Fallback Behavior
- **Backend Request Validation**: Returns structured HTTP 400 or HTTP 422 JSON errors with clear `{ success: false, error: { code, message } }`.
- **Stack Trace Protection**: Global exception handlers intercept unhandled server errors, log the traceback internally to stdout, and return clean user-facing error messages without leaking internals.
- **Offline / Quota Fallback**: If `GEMINI_API_KEY` is not present, invalid, or hits quota limits, the system logs a warning and seamlessly uses `hotel_service.answer_by_knowledge_base(...)`. The user experiences zero interruption.
- **Frontend Error Boundaries**: The UI catches network dropouts, displays a clear error banner, and provides a one-click **Retry** button.

---

## 14. API Documentation & cURL Examples

FastAPI provides automated interactive Swagger documentation at:
**`http://127.0.0.1:8000/docs`**

### Endpoint 1: `POST /api/chat`
Ask questions, multi-turn follow-ups, or check availability via natural language.

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Is breakfast included?",
       "conversation_history": []
     }'
```

**Response:**
```json
{
  "success": true,
  "answer": "Breakfast is served daily from 6:30 AM ? 10:30 AM (Daily) at The Glasshouse Bistro. A lavish international breakfast buffet is included complimentary with Executive King Suite and Presidential Family Suite bookings. For Deluxe Room guests on room-only rates, the breakfast buffet is available for INR 850 + taxes per guest.",
  "intent": "hotel_information",
  "tool_used": false,
  "availability": null,
  "error": null
}
```

---

### Endpoint 2: `POST /api/availability`
Deterministic room availability lookup.

**Request:**
```bash
curl -X POST "http://127.0.0.1:8000/api/availability" \
     -H "Content-Type: application/json" \
     -d '{
       "check_in": "2026-10-15",
       "check_out": "2026-10-17",
       "adults": 3
     }'
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "check_in": "2026-10-15",
  "check_out": "2026-10-17",
  "adults": 3,
  "nights": 2,
  "rooms": [
    {
      "room_type_id": "executive_king_suite",
      "room_name": "Executive King Suite",
      "capacity": 3,
      "bed_type": "1 King Bed + 1 Premium Pull-Out Sofa Bed",
      "size_sqm": 58,
      "view": "Garden & Pool View",
      "price_per_night": 8500.0,
      "total_price": 17000.0,
      "currency": "INR",
      "amenities": [
        "Executive Club Lounge Access",
        "Deep Soaking Freestanding Bathtub",
        "High-Speed 500 Mbps Wi-Fi"
      ],
      "description": "Expansive executive suite featuring a separate living parlor..."
    },
    {
      "room_type_id": "presidential_family_suite",
      "room_name": "Presidential Family Suite",
      "capacity": 4,
      "bed_type": "2 King Bedrooms (2 King Beds or 1 King + 2 Twin Beds)",
      "size_sqm": 92,
      "view": "Panoramic City & Cubbon Park View",
      "price_per_night": 14000.0,
      "total_price": 28000.0,
      "currency": "INR",
      "amenities": [
        "Two Private Master Bedrooms",
        "Dedicated 24/7 Butler Service",
        "Complimentary Breakfast included for up to 4 guests"
      ],
      "description": "The pinnacle of luxury for families and small groups..."
    }
  ],
  "demo_note": "Demo availability ? mock inventory based on capacity and dates",
  "error": null
}
```

---

## 15. Setup Instructions

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.13)
- **Node.js**: Version 18+ (tested on Node v20.18.0)
- **Git**

---

## 16. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (optional for live Gemini; offline mode works without key):
   ```bash
   cp .env.example .env
   # Edit .env and paste your GEMINI_API_KEY if desired
   ```

---

## 17. Frontend Setup

1. In a separate terminal, navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 18. Environment Variables

Create `backend/.env` based on `backend/.env.example`:
```ini
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> If `GEMINI_API_KEY` is omitted or left blank, the backend operates in deterministic grounded fallback mode, ensuring zero errors during offline testing or interviews.

---

## 19. Running the Application

### Start Backend Server:
```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```
Backend will be live at: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`).

### Start Frontend Dev Server:
```bash
cd frontend
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

---

## 20. Testing & Verification

Run the comprehensive automated test suite in the backend virtual environment:
```bash
cd backend
.\venv\Scripts\pytest -v tests
```
**Results: 21 passed in 0.51s.**

---

## 21. Evaluation Scenarios & Results Matrix

| Test Case | Scenario / Query | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1. Check-in Time** | *"What time is check-in?"* | Answer with 3:00 PM and early check-in fee policy | Returned 3:00 PM with early check-in note | **PASS** |
| **2. Check-out Time** | *"What time is check-out?"* | Answer with 11:00 AM and late check-out policy | Returned 11:00 AM with late check-out fee | **PASS** |
| **3. Breakfast Inclusion** | *"Is breakfast included?"* | Mention Glasshouse Bistro, free for Suites, ?850 for Deluxe | Returned exact breakfast timings & inclusions | **PASS** |
| **4. Swimming Pool** | *"Does the hotel have a pool?"* | Describe 15th-floor heated infinity pool, 6 AM-10 PM, free | Accurately described pool hours and details | **PASS** |
| **5. Room for 3 Guests** | *"Which room is suitable for three guests?"* | Recommend Executive King Suite or Family Suite | Recommended Executive King Suite & Family Suite | **PASS** |
| **6. Missing Avail Info** | *"Do you have rooms available?"* | Prompt guest for check-in date, check-out date & guest count | Politeness prompt requesting missing parameters | **PASS** |
| **7. Natural Lang Avail** | *"Do you have rooms for 2 guests from 2026-10-10 to 2026-10-12?"* | Extract parameters, call tool, return embedded room cards | Tool called; structured room cards rendered | **PASS** |
| **8. Follow-up Context** | T1: *"Do you have a pool?"*<br>T2: *"What are the timings?"* | Infer *"timings"* refers to pool operating hours | Returned pool timings (6:00 AM to 10:00 PM) | **PASS** |
| **9. Cancellation Policy**| *"What is the cancellation policy?"* | Free cancellation up to 24 hrs prior to check-in | Returned exact 24-hour cancellation rule | **PASS** |
| **10. Out-of-Domain Query**| *"What is the flight schedule to New York?"* | Politely decline non-hotel query; redirect to front desk | Polite out-of-scope response with desk phone | **PASS** |
| **11. Invalid Date Range**| Check-out before check-in | Return HTTP 400 with descriptive validation error | Rejected with *"Check-out must be after check-in"* | **PASS** |
| **12. Past Check-in Date**| Check-in date set to yesterday | Return HTTP 400 with past date validation error | Rejected with *"Check-in cannot be in the past"* | **PASS** |
| **13. Exceeding Capacity** | Requesting availability for 5 adults | Return available: false; note max single room capacity is 4 | Returned available: false with multi-room guidance | **PASS** |
| **14. Offline Fallback** | Gemini API key unconfigured / unreachable | Grounded fallback answers from `hotel.json` | Accurate responses with zero crashes | **PASS** |

---

## 22. Product Decisions
1. **Chat Concierge as Primary Interface**: Guests visit hotel websites to get rapid, personal answers without searching through complex menus. Conversational interaction mimics speaking with a luxury front desk concierge.
2. **Dedicated Availability Widget**: Availability checking is a goal-oriented transaction. Giving it a persistent, dedicated card on the desktop right rail and mobile tab allows power users to bypass conversational typing when they simply want to check prices.
3. **Embedded Room Cards in Chat**: When a user asks about availability inside the conversation, returning visual cards with prices, capacity badges, and amenities bridges conversation with commerce.

---

## 23. UX Decisions
1. **Luxury Visual Aesthetic**: Used warm neutral tones (`#f8fafc`), dark slate text, subtle warm gold/amber accents, and Playfair Display serif typography to reflect luxury hospitality branding.
2. **Zero Dead Ends**: Suggestion chips give first-time visitors immediate clickable ideas to jumpstart exploration.
3. **Animated Processing Indicator**: Custom bouncing typing dots assure guests that their query is actively being processed by the AI.
4. **Resilient Error State with Retry**: If network disconnects, users are greeted with a clear alert and a one-click **Retry** button rather than an unhelpful blank screen.

---

## 24. Engineering Decisions
1. **Separation of LLM and Deterministic Engine**: The LLM is strictly prohibited from executing availability math, guaranteeing that prices and room availability are 100% deterministic and legally auditable.
2. **Stateless Backend with Sliding Client History**: The client maintains the conversation turn state and sends the recent 6 turns. This avoids server-side session memory bottlenecks and enables horizontal pod auto-scaling.
3. **JSON-First Knowledge Base**: A structured `hotel.json` enables instant property updates without database migration overhead during the prototype phase, while adhering to clean service abstractions for future SQL databases.

---

## 25. Future Production Improvements
1. **Relational Database Migration**: Transition from `hotel.json` to PostgreSQL with SQLAlchemy or Prisma for dynamic room inventory, booking transactions, and multi-property management.
2. **Redis Caching & Rate Limiting**: Cache frequent FAQ responses (check-in, pool hours) to reduce LLM API latency to < 10ms and apply IP-based rate limiting.
3. **Direct PMS / CRS Integration**: Connect with property management systems (e.g. Opera, Cloudbeds, Simplotel Booking Engine) via webhooks to read live room blocks.
4. **Hybrid RAG Pipeline**: As property documents expand to include restaurant menus and event brochures, introduce pgvector / Pinecone with semantic chunking.
5. **Human Concierge Handoff**: Provide an instant "Transfer to Human Front Desk Agent" button via LiveChat / WhatsApp Business API when queries require special manager approvals.
6. **Observability & Guardrail Monitoring**: Integrate LangSmith or OpenTelemetry to monitor token costs, response latency, and grounding adherence.

---

## 26. AI Development Tools Used
- **Antigravity**: Used as the primary agentic pairing environment for project scaffolding, code generation, refactoring, and test execution.
- **Google Gemini API**: Target conversational intelligence model powering natural language understanding and context-grounded responses.
