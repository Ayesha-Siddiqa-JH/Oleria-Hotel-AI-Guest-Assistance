import os
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from ..services.hotel_service import hotel_service
from ..utils.logging_config import logger

# Load environment variables from .env if present
load_dotenv()

SYSTEM_INSTRUCTION = """You are "StayAI", the official AI Hotel Guest Assistant for "StayAI Grand Hotel Bengaluru".
Your goal is to provide warm, courteous, accurate, and concise assistance to prospective and current guests.

CRITICAL OPERATIONAL RULES:
1. GROUNDING: Answer questions ONLY using the verified hotel knowledge base provided below. Do not make up facts.
2. NO HALLUCINATIONS: Never invent room availability, room prices, amenities, operating hours, or policies.
3. NO BOOKING CLAIMS: You cannot finalize a booking. Never claim a room has been reserved or confirmed.
4. OUT-OF-DOMAIN HANDLING: If a question is unrelated to the hotel, or if the answer is not in the provided hotel context, politely state:
   "I apologize, but I only have information about StayAI Grand Hotel Bengaluru (our rooms, amenities, dining, policies, and availability). Please contact our front desk at +91 80 4965 2000 for other inquiries."
5. AVAILABILITY REQUESTS:
   - If a guest asks about room availability (e.g. "Do you have rooms available?"), but has NOT provided check-in date, check-out date, and number of guests:
     Politely ask them to provide their check-in date, check-out date, and number of guests, or suggest using the Check Availability panel on the right.
6. TONE & STYLE: Be welcoming, professional, elegant, and concise. Format lists with clear bullet points when appropriate.
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
            logger.warning(f"Could not initialize google-genai client ({e}). Will test google.generativeai or REST fallback.")
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
        conversation_history: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a grounded hotel assistant response.
        If Gemini is unavailable or errors out, automatically falls back
        to the grounded rule-based knowledge engine.
        """
        hotel_context = hotel_service.get_hotel_context_for_prompt()
        full_system_prompt = f"{SYSTEM_INSTRUCTION}\n\nVERIFIED HOTEL KNOWLEDGE BASE:\n{hotel_context}"

        # If client is ready, attempt Gemini call
        if self.client:
            try:
                # Format conversation history
                formatted_history = []
                if conversation_history:
                    for turn in conversation_history[-6:]:
                        role = turn.role if hasattr(turn, "role") else turn.get("role", "user")
                        content = turn.content if hasattr(turn, "content") else turn.get("content", "")
                        # Map to user / model
                        gemini_role = "user" if role == "user" else "model"
                        formatted_history.append({"role": gemini_role, "parts": [{"text": content}]})

                if hasattr(self.client, "models"):
                    # New google-genai SDK
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
                    # google.generativeai legacy SDK
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
                logger.error(f"Gemini API call failed with error: {e}. Executing graceful offline fallback.")

        # Fallback to grounded knowledge base
        fallback_answer = hotel_service.answer_by_knowledge_base(message, conversation_history)
        return {
            "answer": fallback_answer or "I don't have enough information to answer that reliably. Please contact our concierge at +91 80 4965 2000.",
            "source": "grounded_knowledge_base",
            "status": "fallback"
        }

llm_service = LLMService()
