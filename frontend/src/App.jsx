import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MyStayCard from './components/MyStayCard';
import MakeMyStayEasierSection from './components/MakeMyStayEasierSection';
import AvailabilitySection from './components/AvailabilitySection';
import HotelServicesSection from './components/HotelServicesSection';
import AmenitiesSection from './components/AmenitiesSection';
import DiningSection from './components/DiningSection';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import FoodCartModal from './components/FoodCartModal';
import BookingModal from './components/BookingModal';
import ChatConcierge from './components/ChatConcierge';
import AdminDashboard from './components/AdminDashboard';
import { fetchHotelDetails, sendChatMessage } from './services/api';
import { MessageSquare, X } from 'lucide-react';

export default function App() {
  // Routing view state: 'guest' | 'admin'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'guest';
  });

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('guest');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Selected Property (Bengaluru, Goa, Mumbai, Delhi, Jaipur)
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('oleria_selected_city') || 'bengaluru';
  });

  // Hotel data loaded from API
  const [hotelData, setHotelData] = useState(null);

  // Guest Identity
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('oleria_guest_name') || '';
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        return false;
      }
      const enteredThisSession = sessionStorage.getItem('oleria_entered_session');
      if (enteredThisSession === 'true') {
        return false;
      }
    }
    return true;
  });

  // Active Stay Context (Defaults to demo stay or user booking)
  const [stayContext, setStayContext] = useState(() => {
    return {
      booking_id: 'OLR-BK-8821',
      room_number: 502,
      room_name: 'Executive Garden Suite',
      check_in: 'Today',
      check_out: 'In 3 Days',
      guest_name: localStorage.getItem('oleria_guest_name') || 'Ayesha Siddiqa',
    };
  });

  // Food Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    room: null,
    checkIn: '',
    checkOut: '',
    nights: 1,
  });

  // Chat Concierge State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const buildInitialGreeting = (name, currentHotel) => {
    const greetingName = name && name !== 'Guest' && name !== 'Valued Guest' ? name : 'Guest';
    const hotelTitle = currentHotel?.hotel_name || 'Oleria Hotel';
    const city = currentHotel?.city || 'Bengaluru';

    return {
      role: 'assistant',
      content: `Welcome to ${hotelTitle}, ${greetingName}! ✨\n\nI am your 24/7 **Oleria AI Concierge**. How may I assist your stay in ${city} today?\n\n• "I'm not feeling well" — I will suggest comforting warm dishes and notify guest care.\n• "Order 2 coffees to Room 502" — Instant conversational dining orders.\n• "Send 2 extra pillows" — Direct housekeeping dispatch.\n• Check pool hours, breakfast timings, or room rates.`,
      timestamp: 'Just now',
    };
  };

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);

  // Load Hotel Details on City Change
  useEffect(() => {
    async function loadHotel() {
      try {
        const data = await fetchHotelDetails(selectedCity);
        const resolvedHotel = data?.hotel || data;
        setHotelData(resolvedHotel);
        setMessages([buildInitialGreeting(guestName, resolvedHotel)]);
      } catch (err) {
        console.error('Failed to load hotel:', err);
      }
    }
    loadHotel();
  }, [selectedCity]);

  // Handle City Change
  const handleSelectCity = (cityId) => {
    setSelectedCity(cityId);
    localStorage.setItem('oleria_selected_city', cityId);
  };

  // Welcome Gate
  const handleEnterHotel = (name) => {
    setGuestName(name);
    localStorage.setItem('oleria_guest_name', name);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oleria_entered_session', 'true');
    }
    setShowWelcomeModal(false);
    setStayContext((prev) => ({
      ...prev,
      guest_name: name,
    }));
    setMessages([buildInitialGreeting(name, hotelData)]);
  };

  const handleResetGuest = () => {
    localStorage.removeItem('oleria_guest_name');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('oleria_entered_session');
    }
    setGuestName('');
    setShowWelcomeModal(true);
  };

  // Cart Handlers
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === (item.id || item.item_id));
      if (existing) {
        return prev.map((i) =>
          i.item_id === (item.id || item.item_id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          item_id: item.id || item.item_id,
          name: item.name,
          price: item.price,
          price_per_unit: item.price || item.price_per_unit || 0,
          quantity: 1,
          category: item.category || 'Dining',
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.item_id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.item_id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.item_id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Booking Modal Triggers
  const handleOpenBooking = (room, checkIn, checkOut, nights) => {
    setBookingModal({
      isOpen: true,
      room,
      checkIn,
      checkOut,
      nights,
    });
  };

  const handleBookingConfirmed = (confirmedData) => {
    setStayContext(confirmedData);
  };

  // Chat Messaging
  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    setError(null);
    setLastUserMessage(userText);
    setIsChatOpen(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newGuestMessage = {
      role: 'user',
      content: userText,
      timestamp: timeStr,
    };

    const updatedMessages = [...messages, newGuestMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const history = updatedMessages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendChatMessage({
        message: userText,
        conversationHistory: history,
        hotelId: selectedCity,
        guestName: guestName || 'Guest',
        roomNumber: stayContext?.room_number || 502,
        currentCart: cart,
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.answer || "I am delighted to assist you. Please let me know if you need anything else.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        availability: res.availability || null,
        menu_recommendations: res.menu_recommendations || [],
        action: res.action || null,
        toolUsed: res.tool_used || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Sync Conversational AI actions with application state
      if (res.action) {
        if (res.action.type === 'add_to_cart' && res.action.data) {
          const item = res.action.data;
          setCart((prev) => {
            const existing = prev.find((i) => i.item_id === item.item_id);
            const addQty = item.quantity || 1;
            if (existing) {
              return prev.map((i) =>
                i.item_id === item.item_id ? { ...i, quantity: i.quantity + addQty } : i
              );
            }
            return [
              ...prev,
              {
                item_id: item.item_id,
                name: item.name,
                price: item.price_per_unit || item.price,
                price_per_unit: item.price_per_unit || item.price || 0,
                quantity: addQty,
                category: 'In-Room Dining',
              },
            ];
          });
        } else if (res.action.type === 'remove_from_cart' && res.action.data?.item_id) {
          handleRemoveFromCart(res.action.data.item_id);
        } else if (res.action.type === 'update_quantity' && res.action.data) {
          handleUpdateQuantity(res.action.data.item_id, res.action.data.quantity);
        } else if (res.action.type === 'open_cart') {
          setIsCartOpen(true);
        } else if (res.action.type === 'open_booking') {
          const el = document.getElementById('availability') || document.getElementById('availability-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Unable to reach the concierge. Please try again.');

      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I am temporarily having trouble reaching our concierge system. Please try again or reach our front desk directly at " + (hotelData?.contact?.phone || '+91 80 4965 2000') + ".",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAboutRoom = (roomName) => {
    const prompt = `Can you tell me more about the ${roomName}, its bed configuration, and what amenities are included?`;
    handleSendMessage(prompt);
  };

  const handleAskConcierge = (query) => {
    handleSendMessage(query);
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleResetChat = () => {
    setMessages([buildInitialGreeting(guestName, hotelData)]);
    setError(null);
    setLastUserMessage(null);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToGuestView={() => {
          setCurrentView('guest');
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  // Dedicated First Screen: Welcome / Name-Entry Gate
  if (showWelcomeModal) {
    return <WelcomeModal onEnter={handleEnterHotel} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Luxury Navbar with 5 City Switcher */}
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        hotelData={hotelData}
        guestName={guestName || 'Guest'}
        stayContext={stayContext}
        cartItemCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onResetGuest={handleResetGuest}
        onOpenAdmin={() => {
          setCurrentView('admin');
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/admin');
          }
        }}
      />

      {/* Hero Section with City Switcher & Visual Ambience */}
      <HeroSection
        hotelData={hotelData}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        guestName={guestName}
        onOpenConcierge={() => setIsChatOpen(true)}
      />

      {/* My Stay Context Card */}
      {stayContext && (
        <div id="my-stay" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <MyStayCard
            stayContext={stayContext}
            onOpenDining={() => {
              const el = document.getElementById('dining');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenServices={() => {
              const el = document.getElementById('services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenConcierge={() => setIsChatOpen(true)}
          />
        </div>
      )}

      {/* Make My Stay Easier Feature Highlights */}
      <MakeMyStayEasierSection
        onPromptClick={(prompt) => {
          handleSendMessage(prompt);
          setIsChatOpen(true);
        }}
      />

      {/* Instant Availability Search & Room Cards */}
      <AvailabilitySection
        selectedCity={selectedCity}
        hotelData={hotelData}
        onAskAboutRoom={handleAskAboutRoom}
        onBookRoom={handleOpenBooking}
      />

      {/* On-Demand Guest Services */}
      <HotelServicesSection
        hotelData={hotelData}
        stayContext={stayContext}
        onAskConcierge={handleAskConcierge}
      />

      {/* Curated Resort Amenities */}
      <AmenitiesSection
        hotelData={hotelData}
        onAskConcierge={handleAskConcierge}
      />

      {/* In-Room Dining & Culinary Menu */}
      <DiningSection
        hotelData={hotelData}
        cart={cart}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
        onAskConcierge={(prompt) => {
          handleSendMessage(prompt);
          setIsChatOpen(true);
        }}
        onOpenConciergeWithPrompt={(prompt) => {
          handleSendMessage(prompt);
          setIsChatOpen(true);
        }}
      />

      {/* Comprehensive Hotel Footer */}
      <Footer
        hotelData={hotelData}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
      />

      {/* Food Cart & Order Checkout Modal */}
      <FoodCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        hotelData={hotelData}
        stayContext={stayContext}
        guestName={guestName}
      />

      {/* Room Booking Checkout Modal */}
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal((prev) => ({ ...prev, isOpen: false }))}
        room={bookingModal.room}
        checkIn={bookingModal.checkIn}
        checkOut={bookingModal.checkOut}
        nights={bookingModal.nights}
        hotelData={hotelData}
        guestName={guestName}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* Compact Floating AI Concierge Popup Window */}
      <ChatConcierge
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        guestName={guestName || 'Guest'}
        hotelData={hotelData}
        stayContext={stayContext}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onRetry={lastUserMessage ? handleRetry : null}
        onResetChat={handleResetChat}
        onSelectSuggestion={handleSendMessage}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Single Persistent Floating AI Concierge Trigger (Bottom-Right) */}
      <button
        onClick={() => setIsChatOpen((prev) => !prev)}
        title={isChatOpen ? "Close AI Concierge" : "Open Oleria AI Concierge"}
        aria-label="Toggle AI Concierge"
        className="fixed bottom-6 right-4 sm:right-6 z-[70] px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold shadow-2xl shadow-amber-950/60 transition-all duration-200 flex items-center gap-2.5 cursor-pointer border border-amber-300/40"
      >
        {isChatOpen ? (
          <>
            <X className="w-4 h-4 text-slate-950" />
            <span className="text-xs font-bold tracking-wide">Close Concierge</span>
          </>
        ) : (
          <>
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </div>
            <MessageSquare className="w-4 h-4 text-slate-950" />
            <span className="text-xs font-bold tracking-wide">AI Concierge</span>
          </>
        )}
      </button>
    </div>
  );
}
