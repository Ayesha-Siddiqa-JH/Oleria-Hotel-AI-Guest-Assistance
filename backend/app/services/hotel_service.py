import json
import os
from typing import Dict, Any, List, Optional
from ..utils.logging_config import logger

class HotelService:
    def __init__(self, data_path: Optional[str] = None):
        if data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, "data", "hotel.json")
        self.data_path = data_path
        self._data: Dict[str, Any] = self._load_data()

    def _load_data(self) -> Dict[str, Any]:
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                logger.info(f"Loaded hotel knowledge base from {self.data_path} successfully.")
                return data
        except Exception as e:
            logger.error(f"Error loading hotel knowledge base: {e}")
            return {}

    def get_hotel_data(self) -> Dict[str, Any]:
        return self._data

    def get_all_rooms(self) -> List[Dict[str, Any]]:
        return self._data.get("rooms", [])

    def find_suitable_rooms(self, adults: int) -> List[Dict[str, Any]]:
        rooms = self.get_all_rooms()
        return [r for r in rooms if r.get("capacity", 0) >= adults]

    def get_hotel_context_for_prompt(self) -> str:
        """
        Builds a comprehensive grounded knowledge context string for LLM system prompt.
        """
        d = self._data
        if not d:
            return "Hotel knowledge base is currently unavailable."

        lines = [
            f"# HOTEL: {d.get('hotel_name')} ({d.get('tagline')})",
            f"Location: {d.get('address', {}).get('street')}, {d.get('address', {}).get('city')}, {d.get('address', {}).get('state')}, India. Landmark: {d.get('address', {}).get('landmark')}",
            f"Contact: Phone {d.get('contact', {}).get('phone')}, Email {d.get('contact', {}).get('email')}",
            "",
            "## TIMINGS & CHECK-IN/OUT",
            f"- Check-in time: {d.get('timings', {}).get('check_in')}",
            f"- Check-out time: {d.get('timings', {}).get('check_out')}",
            f"- Early Check-in: {d.get('timings', {}).get('early_check_in_policy')}",
            f"- Late Check-out: {d.get('timings', {}).get('late_check_out_policy')}",
            f"- Reception: {d.get('timings', {}).get('reception')}",
            "",
            "## ROOM TYPES & CAPACITIES",
        ]

        for r in d.get("rooms", []):
            lines.append(
                f"- **{r.get('name')}**: Capacity {r.get('capacity')} adults | Bed: {r.get('bed_type')} | Size: {r.get('size_sqm')} sqm | View: {r.get('view')} | Price: INR {r.get('price_per_night'):,}/night. {r.get('description')}. Key amenities: {', '.join(r.get('amenities', []))}"
            )

        lines.append("")
        lines.append("## DINING VENUES")
        for dn in d.get("dining", []):
            line = f"- **{dn.get('name')}**: Cuisine: {dn.get('cuisine')} | Timings: {dn.get('timings', 'N/A')}"
            if "breakfast_inclusion" in dn:
                line += f" | Breakfast Inclusion: {dn.get('breakfast_inclusion')}"
            if "breakfast_timings" in dn:
                line += f" | Breakfast Hours: {dn.get('breakfast_timings')}"
            lines.append(line)

        lines.append("")
        lines.append("## AMENITIES & FACILITIES")
        for am in d.get("amenities", []):
            lines.append(f"- **{am.get('name')}**: {am.get('details')} Timings: {am.get('timings', 'Open 24/7')}. Cost: {am.get('cost', 'Complimentary')}")

        lines.append("")
        lines.append("## HOTEL POLICIES")
        pol = d.get("policies", {})
        lines.append(f"- Cancellation: {pol.get('cancellation')}")
        lines.append(f"- Pets: {pol.get('pets')}")
        lines.append(f"- Smoking: {pol.get('smoking')}")
        lines.append(f"- Children & Extra Beds: {pol.get('children')}")
        lines.append(f"- ID Requirements: {pol.get('id_requirements')}")

        lines.append("")
        lines.append("## FREQUENTLY ASKED QUESTIONS (FAQS)")
        for faq in d.get("faqs", []):
            lines.append(f"Q: {faq.get('question')}\nA: {faq.get('answer')}")

        return "\n".join(lines)

    def answer_by_knowledge_base(self, query: str, history: Optional[List[Any]] = None) -> Optional[str]:
        """
        Rule/keyword-based deterministic fallback query resolver.
        Ensures high accuracy even when offline or without Gemini API key.
        """
        q = query.lower().strip()
        d = self._data

        # Check follow-up context if query is very short
        recent_context = ""
        if history:
            for turn in reversed(history[-4:]):
                content = turn.content if hasattr(turn, "content") else turn.get("content", "")
                recent_context += " " + content.lower()

        # 1. Pool questions
        if "pool" in q or ("timing" in q and "pool" in recent_context):
            for am in d.get("amenities", []):
                if "pool" in am.get("name", "").lower():
                    return f"Yes, we have a {am.get('name')}. {am.get('details')} Operating hours are {am.get('timings')}, and it is {am.get('cost')}."

        # 2. Breakfast questions
        if "breakfast" in q:
            bistro = next((x for x in d.get("dining", []) if "glasshouse" in x.get("name", "").lower()), None)
            inclusion = bistro.get("breakfast_inclusion", "") if bistro else ""
            hours = bistro.get("breakfast_timings", "") if bistro else ""
            return f"Breakfast is served daily from {hours} at The Glasshouse Bistro. {inclusion}"

        # 3. Check-in / Check-out questions
        if "check-in" in q or "check in" in q:
            t = d.get("timings", {})
            return f"Standard check-in time is {t.get('check_in')}. {t.get('early_check_in_policy')}"
        if "check-out" in q or "check out" in q:
            t = d.get("timings", {})
            return f"Standard check-out time is {t.get('check_out')}. {t.get('late_check_out_policy')}"

        # 4. Cancellation policy
        if "cancel" in q or "cancellation" in q or "refund" in q:
            return d.get("policies", {}).get("cancellation", "Free cancellation is available up to 24 hours prior to check-in.")

        # 5. Room suitability by guest count
        if "3 guests" in q or "three guests" in q or "3 adults" in q or "three adults" in q:
            return "For three guests, our Executive King Suite (58 sqm, 1 King Bed + sofa bed) or Presidential Family Suite (92 sqm, accommodates up to 4) is ideal."
        if "4 guests" in q or "four guests" in q or "family" in q:
            return "For four guests or a family, our Presidential Family Suite (92 sqm, 2 King bedrooms, 2 en-suite bathrooms) is perfectly suited."
        if "2 guests" in q or "two guests" in q or "couple" in q:
            return "For two guests, our Deluxe Room (38 sqm, King or Twin beds, city view) is a wonderful choice at INR 5,500/night, or the Executive King Suite for extra luxury."

        # 6. Wifi
        if "wifi" in q or "wi-fi" in q or "internet" in q:
            return "Complimentary ultra-fast fiber optic Wi-Fi (500 Mbps) is available throughout all guest rooms, suites, and public areas of the hotel."

        # 7. Gym / Fitness
        if "gym" in q or "fitness" in q or "workout" in q:
            gym = next((x for x in d.get("amenities", []) if "gym" in x.get("name", "").lower()), None)
            return f"Yes, our Wellness Gym is open 24/7 with room keycard access and features modern TechnoGym equipment. It is complimentary for all guests."

        # 8. Parking / EV
        if "parking" in q or "ev" in q or "car" in q:
            return "We provide complimentary secure 24/7 valet parking for in-house guests, as well as four Type-2 fast charging stations for electric vehicles."

        # 9. Pets
        if "pet" in q or "dog" in q or "cat" in q:
            return d.get("policies", {}).get("pets", "")

        # 10. Smoking
        if "smoke" in q or "smoking" in q or "cigarette" in q:
            return d.get("policies", {}).get("smoking", "")

        # 11. Airport transfer
        if "airport" in q or "cab" in q or "transfer" in q or "shuttle" in q:
            return "We offer private luxury chauffeur transfers to/from Kempegowda International Airport (BLR) for a flat rate of INR 1,800. Presidential Family Suite guests receive one complimentary one-way transfer."

        # 12. General amenities
        if "amenit" in q or "facilities" in q:
            return "StayAI Grand Hotel features a heated Rooftop Infinity Pool (6 AM - 10 PM), 24/7 Wellness Gym, Aura Spa & Sauna, high-speed 500 Mbps Wi-Fi, complimentary valet parking with EV charging, and 3 dining venues."

        # 13. Luggage
        if "luggage" in q or "bag" in q:
            return "Yes, our concierge provides complimentary secure luggage storage for guests before check-in and after check-out."

        # 14. Availability without dates
        if "availab" in q:
            return "To check room availability, please provide your check-in date, check-out date, and the number of guests, or use our Check Availability panel on the right!"

        # 15. Greetings
        if any(w in q for w in ["hi", "hello", "hey", "good morning", "good evening"]):
            return f"Welcome to {d.get('hotel_name')}! I am your AI Guest Concierge. How may I assist you with your stay today? Feel free to ask about our rooms, dining, pool, check-in, policies, or availability."

        # Fallback for out of domain
        return "I can answer questions specifically related to StayAI Grand Hotel Bengaluru, including our rooms, amenities, dining, policies, and availability. Could you please clarify your question?"

hotel_service = HotelService()
