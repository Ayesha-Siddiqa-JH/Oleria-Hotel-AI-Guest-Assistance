import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-2">
      <div className="flex items-center bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all p-1.5 pl-4">
        <input
          ref={textareaRef}
          type="text"
          value={text}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or inquire about availability..."
          className="w-full bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Send message"
          className="ml-2 w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shrink-0 transition-colors shadow-xs disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-1.5">
        <span>Press <kbd className="bg-slate-100 border border-slate-200 px-1 rounded text-[10px] font-mono text-slate-600">Enter ↵</kbd> to send</span>
        <span>StayAI Concierge v1.0</span>
      </div>
    </form>
  );
}
