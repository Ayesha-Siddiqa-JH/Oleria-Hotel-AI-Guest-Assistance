import React from 'react';
import { MessageSquare, Calendar, MapPin, Clock, Waves, Sparkles, Star } from 'lucide-react';
import { HOTEL_IMAGES } from '../data/hotelImages';

export default function HeroSection({ guestName, onOpenConcierge }) {
  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background Photography with Luxury Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url(${HOTEL_IMAGES.hero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50" />
      </div>

      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center text-white z-10 flex flex-col items-center">
        {/* Rating & Location Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-md">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400" />
            ))}
          </div>
          <span>Luxury Boutique Hotel • Bengaluru</span>
        </div>


        {/* Main Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight">
          Welcome to <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
            StayAI Grand Hotel Bengaluru
          </span>
        </h1>

        {/* Subtitle with personalized guest greeting */}
        <p className="text-base sm:text-xl text-slate-200 font-light max-w-2xl mb-3">
          {guestName && guestName !== 'Guest' && guestName !== 'Valued Guest' ? (
            <span>Welcome, <strong>{guestName}</strong>. Your stay, made effortless.</span>
          ) : (
            <span>Your stay, made effortless.</span>
          )}
        </p>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-10 leading-relaxed font-normal">
          Experience world-class hospitality in the heart of MG Road with our 24/7 AI Guest Concierge for instant answers, dining reservations, and room availability.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-12">
          <button
            onClick={onOpenConcierge}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Concierge</span>
          </button>

          <a
            href="#availability"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Check Availability</span>
          </a>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Location</span>
              <span className="font-semibold text-white">MG Road, Bengaluru</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Check-in / Out</span>
              <span className="font-semibold text-white">3:00 PM / 11:00 AM</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Waves className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Infinity Pool</span>
              <span className="font-semibold text-white">15th-Fl Heated</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">AI Service</span>
              <span className="font-semibold text-emerald-400">Live 24/7 Concierge</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
