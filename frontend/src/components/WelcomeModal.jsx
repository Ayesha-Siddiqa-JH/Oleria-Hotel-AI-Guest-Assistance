import React, { useState } from 'react';
import { Hotel, ArrowRight, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { HOTEL_IMAGES } from '../data/hotelImages';

export default function WelcomeModal({ onEnter }) {
  const [name, setName] = useState('');

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const guestName = name.trim() || 'Guest';
    onEnter(guestName);
  };

  const handleGuestContinue = () => {
    onEnter('Valued Guest');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 transition-all duration-300 relative overflow-hidden font-sans">
      {/* Ambient background scene */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-sm pointer-events-none scale-105"
        style={{ backgroundImage: `url(${HOTEL_IMAGES.hero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/80 pointer-events-none" />

      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl text-white backdrop-blur-xl z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.98)), url(${HOTEL_IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Golden ambient glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Hotel Monogram Crest */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-lg shadow-amber-950/50 mb-5">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Hotel className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-medium tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>5 Luxury Destinations • Intelligent Hospitality</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            OLERIA HOTEL
          </h2>
          <p className="text-sm font-medium text-amber-200/90 mb-2">
            AI-Powered Guest Experience & Concierge
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-8 leading-relaxed">
            Bengaluru • Goa • Mumbai • Delhi • Jaipur. Connect natural-language requests to hotel-specific room booking, in-room dining, and hotel services.
          </p>

          {/* Simple Entry Form */}
          <form onSubmit={handleNameSubmit} className="w-full max-w-md space-y-3.5">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (e.g., Ayesha)"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-center sm:text-left"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-[0.99] text-slate-950 font-semibold text-sm shadow-lg shadow-amber-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Hotel Experience</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="w-full text-xs text-slate-400 hover:text-amber-200 py-1.5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Continue as Guest</span>
            </button>
          </form>

          {/* Trust note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Fictional Demonstration Platform • Instant interactive concierge access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
