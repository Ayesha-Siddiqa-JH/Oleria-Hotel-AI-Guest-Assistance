import React from 'react';
import { Clock, Wifi, Waves, Dumbbell, Car, UtensilsCrossed, Phone, MapPin, Sparkles } from 'lucide-react';

export default function HotelInfo() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      {/* Property Title */}
      <div>
        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>5-Star Luxury Sanctuary</span>
        </div>
        <h3 className="font-serif font-bold text-slate-900 text-lg">Oleria Bengaluru</h3>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span>142 MG Road, Ashok Nagar, Bengaluru</span>
        </p>
      </div>

      {/* Key Timings */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Check-In</span>
          <span className="font-semibold text-slate-800">3:00 PM</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Check-Out</span>
          <span className="font-semibold text-slate-800">11:00 AM</span>
        </div>
      </div>

      {/* Amenities Badges */}
      <div>
        <span className="text-[11px] font-semibold text-slate-700 block mb-2">Featured Amenities</span>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg">
            <Waves className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Rooftop Pool (6 AM - 10 PM)</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg">
            <Wifi className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">500 Mbps Wi-Fi</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg">
            <Dumbbell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">24/7 Wellness Gym</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg">
            <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Valet & EV Charging</span>
          </div>
        </div>
      </div>

      {/* Dining Highlights */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
          <UtensilsCrossed className="w-3 h-3 text-amber-600" />
          <span>Dining Highlights</span>
        </span>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>The Glasshouse Bistro:</strong> International Breakfast Buffet 6:30 AM – 10:30 AM.<br />
          <strong>Skyline Lounge:</strong> 15th-floor rooftop cocktails & tapas from 5:00 PM.
        </p>
      </div>

      {/* Contact Concierge */}
      <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>Concierge: +91 80 4965 2000</span>
        </span>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
          24/7 Desk
        </span>
      </div>
    </div>
  );
}
