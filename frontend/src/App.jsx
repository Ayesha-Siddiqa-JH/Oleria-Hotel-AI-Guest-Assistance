import React, { useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import AvailabilityCard from './components/AvailabilityCard';
import HotelInfo from './components/HotelInfo';
import { sendChatMessage } from './services/api';
import { MessageSquare, Calendar } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hello and welcome to StayAI 👋\nI'm your personal hotel concierge. How may I assist you today? Feel free to ask about our luxury rooms, swimming pool, complimentary breakfast, check-in policies, or check availability for your stay.",
  timestamp: 'Just now',
};

export default function App() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' or 'availability'

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

    // Append guest message immediately to UI
    const updatedMessages = [...messages, newGuestMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation history excluding errors
      const conversationHistory = updatedMessages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendChatMessage(userText, conversationHistory);

      const assistantMessage = {
        role: 'assistant',
        content: res.answer || "I am glad to help. Please let me know if you need any other information.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        availability: res.availability || null,
        toolUsed: res.tool_used || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const friendlyError = err.message || 'Unable to connect to StayAI assistant. Please try again.';
      setError(friendlyError);

      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting to the hotel service at the moment. Please try again or check our availability widget on the right.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setLastUserMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Header */}
      <Header onResetChat={handleResetChat} />

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            mobileTab === 'chat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Concierge</span>
        </button>
        <button
          onClick={() => setMobileTab('availability')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            mobileTab === 'availability'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Hotel & Availability</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chat Window (Desktop: 7 cols) */}
          <div className={`lg:col-span-7 ${mobileTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={handleSendMessage}
              onRetry={lastUserMessage ? handleRetry : null}
              onSelectSuggestion={handleSendMessage}
            />
          </div>

          {/* Right Column: Availability & Hotel Info (Desktop: 5 cols) */}
          <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'availability' ? 'block' : 'hidden lg:block'}`}>
            <AvailabilityCard />
            <HotelInfo />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StayAI — AI-Powered Hotel Guest Assistant Prototype</span>
          <span className="text-[11px] text-slate-400">Grounded LLM + Deterministic Business Logic</span>
        </div>
      </footer>
    </div>
  );
}
