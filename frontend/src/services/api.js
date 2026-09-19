const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetches list of all 5 hotel properties.
 */
export async function fetchAllHotels() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hotels`);
    if (!res.ok) throw new Error('Could not load hotels list.');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchAllHotels):', err);
    return null;
  }
}

/**
 * Fetches specific hotel property details (rooms, dining, menu, services, policies, FAQs).
 */
export async function fetchHotelDetails(hotelId = 'bengaluru') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hotel/${hotelId}`);
    if (!res.ok) throw new Error(`Could not load hotel information for ${hotelId}.`);
    const data = await res.json();
    return data?.hotel || data;
  } catch (err) {
    console.error('API Error (fetchHotelDetails):', err);
    return null;
  }
}

/**
 * Sends a guest question and conversation history to Oleria AI Concierge.
 */
export async function sendChatMessage(
  message,
  conversationHistory = [],
  hotelId = 'bengaluru',
  guestName = 'Guest',
  roomNumber = 502,
  currentCart = []
) {
  try {
    let msg = message;
    let history = conversationHistory;
    let hId = hotelId;
    let gName = guestName;
    let rNum = roomNumber;
    let cart = currentCart;

    // Support calling as sendChatMessage({ message, conversationHistory, hotelId, guestName, roomNumber, currentCart })
    if (typeof message === 'object' && message !== null && message.message) {
      msg = message.message;
      history = message.conversationHistory || message.history || [];
      hId = message.hotelId || message.hotel_id || 'bengaluru';
      gName = message.guestName || message.guest_name || 'Guest';
      rNum = message.roomNumber || message.room_number || 502;
      cart = message.currentCart || message.cart || [];
    } else {
      // Auto-correct if guestName and roomNumber were accidentally inverted in positional arguments
      if (typeof gName === 'number' && typeof rNum === 'string') {
        const temp = gName;
        gName = rNum;
        rNum = temp;
      }
    }

    const payload = {
      message: String(msg || '').trim(),
      hotel_id: String(hId || 'bengaluru').toLowerCase().trim(),
      guest_name: String(gName || 'Guest'),
      room_number: rNum !== null && rNum !== undefined ? rNum : 502,
      conversation_history: Array.isArray(history) ? history : [],
      current_cart: Array.isArray(cart) ? cart : [],
    };

    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data?.error?.message ||
        (Array.isArray(data?.detail)
          ? data.detail.map((d) => d.msg).join('; ')
          : data?.detail?.message) ||
        'Server error occurred.';
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error('API Error (sendChatMessage):', err);
    throw err;
  }
}

/**
 * Checks room availability deterministically for the selected property.
 */
export async function checkRoomAvailability(checkIn, checkOut, adults, hotelId = 'bengaluru') {
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
        hotel_id: hotelId,
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
 * Completes a demo room booking and generates "My Stay" room context.
 */
export async function checkoutRoomBooking(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/booking/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail?.message || 'Booking checkout failed.';
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error('API Error (checkoutRoomBooking):', err);
    throw err;
  }
}

/**
 * Fetches In-Room Dining menu for given hotel and optional category.
 */
export async function fetchHotelMenu(hotelId = 'bengaluru', category = null) {
  try {
    const url = category
      ? `${API_BASE_URL}/api/dining/menu?hotel_id=${encodeURIComponent(hotelId)}&category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/api/dining/menu?hotel_id=${encodeURIComponent(hotelId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not load menu.');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchHotelMenu):', err);
    return null;
  }
}

/**
 * Calculates cart subtotal, taxes (5% GST), and total.
 */
export async function calculateCartTotals(hotelId = 'bengaluru', items = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dining/cart/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hotel_id: hotelId,
        items,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error('Could not calculate cart.');
    return data;
  } catch (err) {
    console.error('API Error (calculateCartTotals):', err);
    throw err;
  }
}

/**
 * Places a simulated demo in-room food order.
 */
export async function placeFoodOrder(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/dining/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail?.message || 'Food order failed.';
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error('API Error (placeFoodOrder):', err);
    throw err;
  }
}

/**
 * Fetches hotel services catalog.
 */
export async function fetchHotelServices(hotelId = 'bengaluru') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services?hotel_id=${encodeURIComponent(hotelId)}`);
    if (!res.ok) throw new Error('Could not load hotel services.');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchHotelServices):', err);
    return null;
  }
}

/**
 * Submits a demo hotel service request (pillows, towels, housekeeping, etc.).
 */
export async function requestHotelService(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/services/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data?.error?.message || data?.detail?.message || 'Service request failed.';
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.error('API Error (requestHotelService):', err);
    throw err;
  }
}

/**
 * Fetches admin operational summary metrics and demo revenue.
 */
export async function fetchAdminSummary(hotelId = null) {
  try {
    const url = hotelId && hotelId !== 'all'
      ? `${API_BASE_URL}/api/admin/summary?hotel_id=${encodeURIComponent(hotelId)}`
      : `${API_BASE_URL}/api/admin/summary`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch admin summary.');
    return await res.json();
  } catch (err) {
    console.error('API Error (fetchAdminSummary):', err);
    throw err;
  }
}

/**
 * Fetches all room bookings for admin view.
 */
export async function fetchAdminBookings(hotelId = null) {
  try {
    const url = hotelId && hotelId !== 'all'
      ? `${API_BASE_URL}/api/admin/bookings?hotel_id=${encodeURIComponent(hotelId)}`
      : `${API_BASE_URL}/api/admin/bookings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch admin bookings.');
    const data = await res.json();
    return data?.bookings || [];
  } catch (err) {
    console.error('API Error (fetchAdminBookings):', err);
    return [];
  }
}

/**
 * Updates a booking's status (Confirmed, Completed, Cancelled).
 */
export async function updateAdminBookingStatus(bookingId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update booking status.');
    return await res.json();
  } catch (err) {
    console.error('API Error (updateAdminBookingStatus):', err);
    throw err;
  }
}

/**
 * Fetches all dining orders for admin view.
 */
export async function fetchAdminOrders(hotelId = null) {
  try {
    const url = hotelId && hotelId !== 'all'
      ? `${API_BASE_URL}/api/admin/orders?hotel_id=${encodeURIComponent(hotelId)}`
      : `${API_BASE_URL}/api/admin/orders`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch admin orders.');
    const data = await res.json();
    return data?.orders || [];
  } catch (err) {
    console.error('API Error (fetchAdminOrders):', err);
    return [];
  }
}

/**
 * Updates an in-room dining order status (Confirmed, Preparing, Out for Delivery, Delivered).
 */
export async function updateAdminOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status.');
    return await res.json();
  } catch (err) {
    console.error('API Error (updateAdminOrderStatus):', err);
    throw err;
  }
}

/**
 * Fetches all guest service requests for admin view.
 */
export async function fetchAdminServices(hotelId = null) {
  try {
    const url = hotelId && hotelId !== 'all'
      ? `${API_BASE_URL}/api/admin/services?hotel_id=${encodeURIComponent(hotelId)}`
      : `${API_BASE_URL}/api/admin/services`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch admin services.');
    const data = await res.json();
    return data?.services || [];
  } catch (err) {
    console.error('API Error (fetchAdminServices):', err);
    return [];
  }
}

/**
 * Updates a guest service request status (New, In Progress, Completed).
 */
export async function updateAdminServiceStatus(requestId, status) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/services/${encodeURIComponent(requestId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update service status.');
    return await res.json();
  } catch (err) {
    console.error('API Error (updateAdminServiceStatus):', err);
    throw err;
  }
}

