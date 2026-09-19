import React from 'react';
import { MessageSquare, Calendar, MapPin, Clock, Waves, Sparkles, Star, Building2 } from 'lucide-react';

const CITIES = [
  { id: 'bengaluru', name: 'Bengaluru', label: 'Garden City & Tech Oasis' },
  { id: 'goa', name: 'Goa', label: 'Beachfront Haven & Spa' },
  { id: 'mumbai', name: 'Mumbai', label: 'Marine Drive Coastal Luxury' },
  { id: 'delhi', name: 'Delhi', label: 'Lutyens Imperial Heritage' },
  { id: 'jaipur', name: 'Jaipur', label: 'Royal Rajputana Haveli' },
];

export default function HeroSection({ hotelData, selectedCity, onSelectCity, guestName, onOpenConcierge }) {
  const heroImage = hotelData?.hero_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80';
  const hotelName = hotelData?.hotel_name || 'Oleria Bengaluru';
  const city = hotelData?.city || 'Bengaluru';
  const tagline = hotelData?.tagline || 'Exceptional stays. Intelligent hospitality.';
  const addressStr = hotelData?.address ? `${hotelData.address.landmark || hotelData.address.street}, ${city}` : `${city}, India`;
  const checkinTime = hotelData?.timings?.check_in || '3:00 PM';
  const checkoutTime = hotelData?.timings?.check_out || '11:00 AM';

  return (
    <section id="home" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Photography with Luxury Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/50" />
      </div>

      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center text-white z-10 flex flex-col items-center">
        {/* Rating & Brand Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide uppercase mb-4 backdrop-blur-md">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400" />
            ))}
          </div>
          <span>5-Star Luxury Heritage & Concierge • {city}</span>
        </div>

        {/* 5 City Switcher Bar in Hero */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-3xl">
          {CITIES.map((c) => {
            const isActive = selectedCity === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCity(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <Building2 className={`w-3 h-3 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-3 leading-tight">
          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent">
            {hotelName}
          </span>
        </h1>

        <p className="text-base sm:text-xl text-amber-200/90 font-light max-w-2xl mb-2">
          {tagline}
        </p>

        {/* Guest Greeting */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-8 leading-relaxed font-normal">
          {guestName && guestName !== 'Guest' && guestName !== 'Valued Guest' ? (
            <span>Welcome, <strong className="text-white font-semibold">{guestName}</strong>. </span>
          ) : null}
          Experience effortless intelligent hospitality with <strong>Oleria AI Concierge</strong> — ask questions, order in-room dining, or request room services directly by text.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-10">
          <button
            onClick={onOpenConcierge}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Oleria Concierge</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl w-full bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Location</span>
              <span className="font-semibold text-white truncate max-w-[150px] block">{addressStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Check-in / Out</span>
              <span className="font-semibold text-white">{checkinTime} / {checkoutTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Waves className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Pool & Wellness</span>
              <span className="font-semibold text-white">Heated Pool & Spa</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-slate-400 text-[10px] uppercase tracking-wider">AI Concierge</span>
              <span className="font-semibold text-emerald-400">24/7 Dedicated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
