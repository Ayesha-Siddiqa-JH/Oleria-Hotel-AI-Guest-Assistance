import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, RotateCcw, AlertTriangle, RefreshCw, Send, Loader2, Bot, User, CheckCircle2, X, ShoppingBag, BellRing, HeartPulse, Bed } from 'lucide-react';

export default function ChatConcierge({
  isOpen,
  onClose,
  guestName,
  hotelData,
  stayContext,
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetry,
  onResetChat,
  onSelectSuggestion,
  onAddToCart,
  onOpenCart,
}) {
  const messagesEndRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const handleAddItem = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
      const itemId = item.id || item.item_id;
      setRecentlyAddedId(itemId);
      setTimeout(() => {
        setRecentlyAddedId((prev) => (prev === itemId ? null : prev));
      }, 2500);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

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

  const quickQuestions = [
    "What time is check-in?",
    "Does the hotel have a swimming pool?",
    "Which room is suitable for three guests?",
    "Is breakfast included?",
    "What is the cancellation policy?",
    "Do you have rooms available for a given date?",
    "I'm not feeling well",
    "Order 2 artisan coffees to my room",
    "I need 2 extra pillows",
  ];

  const hotelName = hotelData?.hotel_name || 'Oleria Hotel';
  const city = hotelData?.city || 'Bengaluru';
  const roomNumber = stayContext?.room_number || 502;

  return (
    <div className="fixed bottom-[85px] right-3 sm:right-6 z-[70] w-[calc(100vw-24px)] max-w-[430px] h-[580px] max-h-[78vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between text-white select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-950/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-sm text-white leading-none">
                Oleria AI Concierge
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </div>
            <p className="text-[10px] text-amber-300 mt-0.5">
              {hotelName} • Room {roomNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onResetChat}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close concierge"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-900/60 text-xs">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isError = msg.isError;

          return (
            <div
              key={index}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[92%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                } items-start gap-2`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs ${
                    isUser
                      ? 'bg-amber-500 text-slate-950'
                      : isError
                      ? 'bg-red-950 text-red-300 border border-red-500/40'
                      : 'bg-slate-800 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
                        : isError
                        ? 'bg-red-950/80 text-red-200 border border-red-500/30 rounded-tl-none'
                        : 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line space-y-1">
                      {msg.content}
                    </div>

                    {/* Action: Added to Cart */}
                    {msg.action && msg.action.type === 'add_to_cart' && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/30 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-amber-300 font-semibold truncate">
                          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Added to Cart: {msg.action.data?.quantity || 1}x {msg.action.data?.name}</span>
                        </div>
                        {onOpenCart && (
                          <button
                            type="button"
                            onClick={onOpenCart}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer shadow-sm transition-all"
                          >
                            View Cart
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action: Open Cart */}
                    {msg.action && msg.action.type === 'open_cart' && onOpenCart && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={onOpenCart}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>View Dining Cart & Checkout</span>
                        </button>
                      </div>
                    )}

                    {/* Action: Food Order Placed */}
                    {msg.action && msg.action.type === 'food_order_placed' && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-emerald-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Order Confirmed: {msg.action.data?.order_id || msg.action.order_id}</span>
                          </span>
                          <span className="text-[9px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-200">
                            Room {msg.action.data?.room_number || msg.action.room_number || roomNumber}
                          </span>
                        </div>
                        <p className="text-slate-300">
                          Total: ₹{(msg.action.data?.total_amount || msg.action.total_amount)?.toLocaleString('en-IN')} (inc. GST) • ETA: {msg.action.data?.delivery_time || msg.action.eta || '25-30 mins'}
                        </p>
                      </div>
                    )}

                    {/* Action: Service Requested or Created */}
                    {msg.action && (msg.action.type === 'service_created' || msg.action.type === 'service_requested') && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/30 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-amber-300 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Service Dispatched: {msg.action.data?.request_id || msg.action.request_id}</span>
                          </span>
                          <span className="text-[9px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">
                            Room {msg.action.data?.room_number || msg.action.room_number || roomNumber}
                          </span>
                        </div>
                        <p className="text-slate-300">
                          {msg.action.data?.service_name || msg.action.service_name} • ETA: {msg.action.data?.delivery_time || msg.action.delivery_time || msg.action.eta || '15-20 mins'}
                        </p>
                      </div>
                    )}

                    {/* Interactive Menu Recommendations */}
                    {msg.menu_recommendations && msg.menu_recommendations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          Recommended For You:
                        </span>
                        <div className="space-y-1.5">
                          {msg.menu_recommendations.map((item, i) => (
                            <div
                              key={item.id || i}
                              className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-2 flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <span className="text-white font-medium text-xs block truncate">{item.name}</span>
                                <span className="text-amber-400 text-[10px] font-semibold">₹{item.price}</span>
                              </div>
                              {onAddToCart && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem(item)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      recentlyAddedId === (item.id || item.item_id)
                                        ? 'bg-emerald-500 text-slate-950 scale-95 shadow-md shadow-emerald-500/20'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    }`}
                                  >
                                    {recentlyAddedId === (item.id || item.item_id) ? '✓ Added' : '+ Add to Order'}
                                  </button>
                                  {recentlyAddedId === (item.id || item.item_id) && onOpenCart && (
                                    <button
                                      type="button"
                                      onClick={onOpenCart}
                                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-semibold transition-colors cursor-pointer border border-amber-500/30"
                                    >
                                      Cart →
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compact Embedded Room Cards */}
                    {msg.availability && msg.availability.available && msg.availability.rooms?.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700">
                        <div className="flex items-center justify-between mb-2 text-[11px] font-semibold text-emerald-400">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Available ({msg.availability.nights} nights):</span>
                          </span>
                          <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            Demo
                          </span>
                        </div>
                        <div className="space-y-2 mt-2">
                          {msg.availability.rooms.map((room, idx) => (
                            <div key={idx} className="bg-slate-950/80 border border-slate-700 rounded-xl p-2.5 text-slate-200">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-serif font-bold text-xs text-white">{room.room_name}</span>
                                <span className="text-amber-400 text-[10px] font-semibold">
                                  ₹{room.price_per_night?.toLocaleString('en-IN')}/nt
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-1">{room.bed_type} • {room.size_sqm} m²</p>
                              {msg.availability.nights > 1 && (
                                <div className="text-[10px] text-amber-300 font-medium">
                                  Total: ₹{((room.total_price || room.price_per_night * msg.availability.nights))?.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[9px] text-slate-500 mt-1 px-1 ${
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
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1 px-1">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 border border-amber-400/20">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-3 py-1.5 shadow-xs flex items-center gap-1.5 text-slate-300 text-xs">
              <span>Oleria Concierge typing</span>
              <span className="flex space-x-1 ml-0.5">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        {/* Error Banner with Retry */}
        {error && (
          <div className="bg-red-950/80 border border-red-500/40 text-red-300 rounded-2xl p-2.5 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-[11px]">{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 bg-red-900 hover:bg-red-800 text-red-100 text-[10px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions & Input Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2.5">
        {/* Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectSuggestion(q)}
              className="text-[10px] whitespace-nowrap bg-slate-800 hover:bg-amber-400/20 active:bg-amber-400/30 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-400/40 px-2.5 py-1 rounded-full transition-all cursor-pointer shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-2xl p-1 pl-3 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30 transition-all">
            <input
              type="text"
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about dining, services, or your stay..."
              className="w-full bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="ml-1.5 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 text-slate-950 disabled:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
