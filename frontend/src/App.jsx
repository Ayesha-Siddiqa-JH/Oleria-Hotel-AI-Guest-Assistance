import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ChatConcierge from './components/ChatConcierge';
import AvailabilitySection from './components/AvailabilitySection';
import AmenitiesSection from './components/AmenitiesSection';
import DiningSection from './components/DiningSection';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import { sendChatMessage } from './services/api';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('stayai_guest_name') || '';
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return !localStorage.getItem('stayai_guest_name');
  });

  const buildInitialGreeting = (name) => {
    const greetingName = name && name !== 'Guest' && name !== 'Valued Guest' ? name : 'Guest';
    return {
      role: 'assistant',
      content: `Welcome to StayAI Grand Hotel Bengaluru, ${greetingName} ??\n\nI am your 24/7 AI Guest Concierge. How may I assist your stay today?\n\nYou can ask me about our 15th-floor heated rooftop pool, breakfast timings at The Glasshouse Bistro, early check-in, pet policies, or search live suite availability!`,
      timestamp: 'Just now',
    };
  };

  const [messages, setMessages] = useState(() => [buildInitialGreeting(guestName)]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);

  const handleEnterHotel = (name) => {
    setGuestName(name);
    localStorage.setItem('stayai_guest_name', name);
    setShowWelcomeModal(false);
    setMessages([buildInitialGreeting(name)]);
  };

  const handleResetGuest = () => {
    localStorage.removeItem('stayai_guest_name');
    setGuestName('');
    setShowWelcomeModal(true);
  };

  const scrollToConcierge = () => {
    const el = document.getElementById('concierge');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isLoading) return;

    setError(null);
    setLastUserMessage(userText);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

      const res = await sendChatMessage(userText, history);

      const assistantMessage = {
        role: 'assistant',
        content: res.answer || "I am glad to assist you. Please let me know if you need any other details.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        availability: res.availability || null,
        toolUsed: res.tool_used || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Unable to reach the concierge. Please try again.');

      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I am temporarily having trouble accessing the hotel database. Please try again or reach our front desk directly at +91 80 4965 2000.",
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
    scrollToConcierge();
  };

  const handleAskConcierge = (query) => {
    handleSendMessage(query);
    scrollToConcierge();
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleResetChat = () => {
    setMessages([buildInitialGreeting(guestName)]);
    setError(null);
    setLastUserMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Optional Welcome Gate Modal on First Arrival */}
      {showWelcomeModal && (
        <WelcomeModal onEnter={handleEnterHotel} />
      )}

      {/* Top Floating Luxury Navbar */}
      <Navbar
        guestName={guestName || 'Guest'}
        onOpenConcierge={scrollToConcierge}
        onResetGuest={handleResetGuest}
      />

      {/* Hero Section */}
      <HeroSection
        guestName={guestName}
        onOpenConcierge={scrollToConcierge}
      />

      {/* Interactive AI Concierge Salon */}
      <ChatConcierge
        guestName={guestName || 'Guest'}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onRetry={lastUserMessage ? handleRetry : null}
        onResetChat={handleResetChat}
        onSelectSuggestion={handleSendMessage}
      />

      {/* Dedicated Availability Search & Room Cards Grid */}
      <AvailabilitySection onAskAboutRoom={handleAskAboutRoom} />

      {/* Curated Resort Amenities Grid */}
      <AmenitiesSection onAskConcierge={handleAskConcierge} />

      {/* Culinary & Fine Dining Venues */}
      <DiningSection onAskConcierge={handleAskConcierge} />

      {/* Comprehensive Hotel Footer */}
      <Footer />

      {/* Floating Concierge Action Button */}
      <button
        onClick={scrollToConcierge}
        title="Open AI Concierge"
        className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-2xl shadow-amber-950/60 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-amber-300/40"
      >
        <MessageSquare className="w-5 h-5 text-slate-950" />
        <span className="text-xs hidden sm:inline-block font-semibold">AI Concierge</span>
      </button>
    </div>
  );
}
