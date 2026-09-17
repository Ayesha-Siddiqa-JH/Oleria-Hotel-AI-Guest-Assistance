import React, { useRef, useEffect } from 'react';
import { Sparkles, RotateCcw, AlertTriangle, RefreshCw, MessageSquare, Send, Loader2, Bot, User, CheckCircle2 } from 'lucide-react';
import RoomCard from './RoomCard';

export default function ChatConcierge({
  guestName,
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetry,
  onResetChat,
  onSelectSuggestion,
}) {
  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = React.useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    'What time is check-in & check-out?',
    'Is breakfast included?',
    'Does the hotel have a swimming pool?',
    'Which room is suitable for three guests?',
    'What is the cancellation policy?',
    'Do you have rooms for 2 guests next weekend?',
  ];

  return (
    <section id="concierge" className="py-16 bg-slate-950 text-white relative overflow-hidden">
      {/* Golden ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive AI Assistant</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            StayAI Concierge
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-light">
            Ask any question about our suites, dining, pool, or check availability instantly.
          </p>
        </div>

        {/* Chat Concierge Container */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
          {/* Concierge Salon Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-950/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-white">AI Concierge</h3>
                  <span className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grounded in StayAI Grand Hotel verified records
                </p>
              </div>
            </div>

            <button
              onClick={onResetChat}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isError = msg.isError;

              return (
                <div
                  key={index}
                  className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[92%] sm:max-w-[85%] ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    } items-start gap-2.5`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm ${
                        isUser
                          ? 'bg-amber-500 text-slate-950'
                          : isError
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div className="flex flex-col">
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
                            : isError
                            ? 'bg-red-950/80 text-red-200 border border-red-500/30 rounded-tl-none'
                            : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line space-y-1">
                          {msg.content}
                        </div>

                        {/* Embedded Room Cards if availability results exist */}
                        {msg.availability && msg.availability.available && msg.availability.rooms?.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-emerald-400">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Available Rooms ({msg.availability.nights} night{msg.availability.nights > 1 ? 's' : ''}):
                              </span>
                              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                Demo availability
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                              {msg.availability.rooms.map((room, idx) => (
                                <RoomCard
                                  key={idx}
                                  room={room}
                                  nights={msg.availability.nights || 1}
                                  onAskAboutRoom={onSendMessage}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] text-slate-400 mt-1 px-1 ${
                          isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {msg.timestamp || 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Animation */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 border border-amber-400/20">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs flex items-center gap-1.5 text-slate-300">
                  <span className="text-xs">StayAI Concierge is typing</span>
                  <span className="flex space-x-1 ml-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {error && (
              <div className="bg-red-950/80 border border-red-500/40 text-red-300 rounded-2xl p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-100 font-medium px-3 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions & Input Bar */}
          <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-3">
            {/* Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {suggestions.map((query, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => onSelectSuggestion(query)}
                  className="text-[11px] whitespace-nowrap bg-slate-800/80 hover:bg-amber-400/20 active:bg-amber-400/30 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-400/40 px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-2xl p-1.5 pl-4 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
                <input
                  type="text"
                  value={inputText}
                  disabled={isLoading}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask Concierge anything about your stay, ${guestName}...`}
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 disabled:text-slate-500 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
