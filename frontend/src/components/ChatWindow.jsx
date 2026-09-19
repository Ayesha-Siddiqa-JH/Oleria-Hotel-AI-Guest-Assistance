import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickQuestions from './QuickQuestions';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ChatWindow({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetry,
  onSelectSuggestion
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] bg-slate-50/50 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Welcome Intro Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 sm:p-5 text-slate-800 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base mb-1">
                Welcome to Oleria Hotel 👋
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                I am your virtual concierge for <strong>Oleria Hotel</strong>. Ask me anything about our luxury suites, infinity pool, breakfast timings, cancellation policies, or check live room availability!
              </p>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Typing / Processing State */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-1">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs flex items-center gap-1.5">
              <span className="text-slate-600 font-medium text-xs">Oleria Concierge is typing</span>
              <span className="flex space-x-1 ml-1">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        {/* Error Banner with Retry */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 bg-white hover:bg-red-100 text-red-700 font-medium px-2.5 py-1 rounded-lg border border-red-300 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Area: Suggestions + Input */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <QuickQuestions onSelect={onSelectSuggestion} disabled={isLoading} />
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
