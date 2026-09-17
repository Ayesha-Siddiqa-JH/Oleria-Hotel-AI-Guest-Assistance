const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Sends a guest question and conversation history to the StayAI backend.
 */
export async function sendChatMessage(message, conversationHistory = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail?.message || 'Server error occurred.';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error('API Error (sendChatMessage):', err);
    throw err;
  }
}

/**
 * Deterministically checks room availability for given dates and guest count.
 */
export async function checkRoomAvailability(checkIn, checkOut, adults) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        check_in: checkIn,
        check_out: checkOut,
        adults: parseInt(adults, 10),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail?.message || 'Failed to check availability.';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error('API Error (checkRoomAvailability):', err);
    throw err;
  }
}

/**
 * Fetches hotel property metadata for header and property badges.
 */
export async function fetchHotelInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hotel`);
    if (!res.ok) throw new Error('Could not load hotel information.');
    return await res.json();
  } catch (err) {
    console.warn('API Error (fetchHotelInfo), using cached local info:', err);
    return null;
  }
}
