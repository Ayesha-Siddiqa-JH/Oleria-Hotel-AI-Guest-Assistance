import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from ..services.hotel_service import hotel_service
from ..utils.logging_config import logger

# Load environment variables from .env if present
load_dotenv()

import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from ..services.hotel_service import hotel_service
from ..utils.logging_config import logger

# Load environment variables from .env if present
load_dotenv()

SYSTEM_INSTRUCTION_TEMPLATE = """You are "Oleria AI Concierge", the official AI Hotel Guest Experience & Concierge assistant for "{hotel_name}" in {city}, India.
Your mission is to provide warm, hospitable, accurate, and proactive assistance to prospective and resident hotel guests.

CRITICAL OPERATIONAL RULES:
1. STRICT HOTEL ISOLATION & GROUNDING:
   - Answer questions ONLY using the verified hotel knowledge base provided below for {hotel_name}.
   - NEVER mix information between different hotel properties (e.g. if assisting for Oleria Goa, do NOT mention Bengaluru facilities or menus).
   - If a question asks about details not in the hotel context, politely clarify that you only have information about {hotel_name} ({city}).

2. DO NOT MAKE UP FACTS:
   - Never invent room availability, room prices, food menu items, food prices, amenities, or policies.
   - All booking reservations, payments, and food orders are handled deterministically by the backend.

3. "I'M NOT FEELING WELL" & LIGHT FOOD FLOW:
   - If a guest mentions not feeling well, feeling sick, having an upset stomach, fever, or needing light comfort food:
     a) Express warm compassion: "I'm sorry you're not feeling well. I can help you find lighter food and convenient hotel services to make you comfortable."
     b) Recommend ONLY genuine light items present in the hotel menu below (such as clear soups/broth, herbal tea, comfort khichdi, or fresh juices).
     c) Offer convenient room amenities such as complimentary extra pillows, fresh water bottles, or housekeeping.
     d) NEVER diagnose medical conditions or recommend medication/treatments.

4. ROOM AVAILABILITY & BOOKING INQUIRIES:
   - If a guest asks about room availability without providing both check-in, check-out dates, and number of guests:
     Politely ask them to provide their check-in date (YYYY-MM-DD), check-out date (YYYY-MM-DD), and number of guests, or suggest using the Check Availability section.

5. CONVERSATIONAL IN-ROOM DINING & SERVICES:
   - Help guests find food by category (Light Meals, Vegetarian, Breakfast, Beverages, Desserts).
   - Acknowledge orders warmly (e.g. "I've added two coffees to your order", "I'll arrange two extra pillows for your room").

6. TONE & ELEGANCE:
   - Warm, refined, courteous, and concise. Use clear bullet points for lists when appropriate.
"""

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key.startswith("your_"):
            logger.info("No valid GEMINI_API_KEY found in environment. Running in deterministic grounded fallback mode.")
            return

        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Google GenAI client initialized successfully.")
        except Exception as e:
            logger.warning(f"Could not initialize google-genai client ({e}). Testing legacy fallback.")
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=self.api_key)
                self.client = "legacy"
                logger.info("google.generativeai configured successfully.")
            except Exception as e2:
                logger.warning(f"Could not initialize legacy Gemini SDK: {e2}. Grounded offline engine will be active.")
                self.client = None

    def generate_response(
        self,
        message: str,
        hotel_id: str = "bengaluru",
        conversation_history: Optional[List[Any]] = None,
        room_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a grounded hotel assistant response scoped strictly to hotel_id.
        Gracefully falls back to the grounded deterministic rule engine if Gemini is offline or unavailable.
        """
        hotel = hotel_service.get_hotel(hotel_id)
        hotel_name = hotel.get("hotel_name", "Oleria Hotel")
        city = hotel.get("city", "our hotel")
        hotel_context = hotel_service.get_hotel_context_for_prompt(hotel_id=hotel_id, room_context=room_context)

        system_instruction = SYSTEM_INSTRUCTION_TEMPLATE.format(
            hotel_name=hotel_name,
            city=city
        )
        full_system_prompt = f"{system_instruction}\n\nVERIFIED HOTEL KNOWLEDGE BASE FOR {hotel_name.upper()}:\n{hotel_context}"

        # If client is ready, attempt Gemini call
        if self.client:
            try:
                # Format conversation history
                formatted_history = []
                if conversation_history:
                    for turn in conversation_history[-6:]:
                        role = turn.role if hasattr(turn, "role") else turn.get("role", "user")
                        content = turn.content if hasattr(turn, "content") else turn.get("content", "")
                        gemini_role = "user" if role == "user" else "model"
                        formatted_history.append({"role": gemini_role, "parts": [{"text": content}]})

                if hasattr(self.client, "models"):
                    prompt_parts = []
                    for h in formatted_history:
                        prompt_parts.append(f"{h['role']}: {h['parts'][0]['text']}")
                    prompt_parts.append(f"user: {message}")
                    full_query = "\n".join(prompt_parts)

                    response = self.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=full_query,
                        config={
                            "system_instruction": full_system_prompt,
                            "temperature": 0.2,
                        }
                    )
                    text = response.text.strip() if response and response.text else None
                    if text:
                        return {
                            "answer": text,
                            "source": "gemini",
                            "status": "success"
                        }
                elif self.client == "legacy":
                    import google.generativeai as legacy_genai
                    model = legacy_genai.GenerativeModel(
                        model_name="gemini-1.5-flash",
                        system_instruction=full_system_prompt
                    )
                    chat = model.start_chat(history=[])
                    res = chat.send_message(message)
                    if res and res.text:
                        return {
                            "answer": res.text.strip(),
                            "source": "gemini_legacy",
                            "status": "success"
                        }
            except Exception as e:
                logger.error(f"Gemini API call failed ({e}). Executing graceful grounded offline fallback.")

        # Deterministic grounded fallback
        fallback_answer = hotel_service.answer_by_knowledge_base(
            query=message,
            hotel_id=hotel_id,
            history=conversation_history,
            room_context=room_context
        )
        return {
            "answer": fallback_answer or f"I am pleased to assist you with any questions regarding {hotel_name}. Could you please specify your request?",
            "source": "grounded_knowledge_base",
            "status": "fallback"
        }

llm_service = LLMService()

