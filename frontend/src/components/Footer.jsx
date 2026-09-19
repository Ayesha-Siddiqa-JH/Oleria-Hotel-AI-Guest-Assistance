import React from 'react';
import { Hotel, Phone, Mail, MapPin, Sparkles, Clock, ShieldCheck, Building2 } from 'lucide-react';

export default function Footer({ hotelData, selectedCity, onSelectCity }) {
  const properties = [
    { id: 'bengaluru', name: 'Oleria Bengaluru', address: '142 MG Road, Ashok Nagar, Bengaluru' },
    { id: 'goa', name: 'Oleria Goa Resort & Spa', address: 'Candolim Beach Boardwalk, Candolim, Goa' },
    { id: 'mumbai', name: 'Oleria Mumbai Heritage', address: 'Marine Drive, Nariman Point, Mumbai' },
    { id: 'delhi', name: 'Oleria New Delhi', address: 'Barakhamba Road, Connaught Place, New Delhi' },
    { id: 'jaipur', name: 'Oleria Jaipur Haveli & Palace', address: 'Civil Lines Heritage District, Jaipur' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
                <Hotel className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">OLERIA HOTEL</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Exceptional hospitality, architectural heritage, and modern intelligent guest experiences across India's most iconic destinations.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Oleria AI Concierge Active (24/7)</span>
            </div>
          </div>

          {/* 5 Distinct Destinations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Our 5 Properties</h4>
            <ul className="space-y-2 text-xs">
              {properties.map((p) => {
                const isActive = selectedCity === p.id;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => onSelectCity && onSelectCity(p.id)}
                      className={`text-left transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isActive ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Building2 className={`w-3 h-3 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{p.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Key Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Guest Schedule</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Check-in:</strong> {hotelData?.timings?.check_in || '3:00 PM'} onwards</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Check-out:</strong> {hotelData?.timings?.check_out || '11:00 AM'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Breakfast:</strong> 6:30 AM – 10:30 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>In-Room Dining:</strong> 24 Hours Daily</span>
              </div>
            </div>
          </div>

          {/* Contact Active Hotel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Active Property Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {hotelData?.address
                    ? `${hotelData.address.street}, ${hotelData.address.landmark || ''}, ${hotelData.city}`
                    : '142 MG Road, Ashok Nagar, Bengaluru 560001'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Concierge Desk: {hotelData?.contact?.phone || '+91 80 4965 2000'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{hotelData?.contact?.email || 'concierge@oleriahotels.com'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span><strong>Demonstration Platform:</strong> Built for Simplotel AI Product Engineer Demonstration. All room bookings, food orders, and service requests are simulated.</span>
          </div>
          <p>© 2026 Oleria Hotels & Resorts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
