import React from 'react';
import { Bed, Calendar, User, Key, Utensils, Bell, MessageSquare, CheckCircle, LogOut } from 'lucide-react';

export default function MyStayCard({
  stayContext,
  hotelData,
  onOpenDining,
  onOpenServices,
  onOpenConcierge,
  onClearStay
}) {
  if (!stayContext) return null;

  return (
    <section id="my-stay" className="py-8 bg-slate-900/60 border-y border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-400/30 p-6 sm:p-8 shadow-xl shadow-black/20">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Stay Details */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active In-House Stay
                </span>
                <span className="text-xs text-amber-300/80 font-medium">
                  {hotelData?.hotel_name || 'Oleria Hotel'}
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
                  <Key className="w-6 h-6 text-amber-400" />
                  <span>Room {stayContext.room_number}</span>
                </h2>
                <span className="text-sm font-medium text-amber-200/90">
                  {stayContext.room_name || 'Executive Suite'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guest: <strong className="text-white">{stayContext.guest_name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stay: <strong className="text-white">{stayContext.check_in}</strong> to <strong className="text-white">{stayContext.check_out}</strong></span>
                </div>
                {stayContext.booking_id && (
                  <div className="text-slate-400 font-mono text-[11px]">
                    Ref: {stayContext.booking_id}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick In-House Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <a
                href="#dining"
                onClick={onOpenDining}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20"
              >
                <Utensils className="w-3.5 h-3.5 text-slate-950" />
                <span>Order In-Room Dining</span>
              </a>

              <a
                href="#services"
                onClick={onOpenServices}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Room Services</span>
              </a>

              <button
                onClick={onOpenConcierge}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Concierge</span>
              </button>

              <button
                onClick={onClearStay}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="End demo stay simulation"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Room context linked to Oleria AI Concierge: AI knows your room number automatically.
            </span>
            <span className="hidden sm:inline text-slate-500">Demo Stay Context</span>
          </div>
        </div>
      </div>
    </section>
  );
}
