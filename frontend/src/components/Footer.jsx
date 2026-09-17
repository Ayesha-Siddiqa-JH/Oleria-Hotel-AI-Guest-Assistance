import React from 'react';
import { Hotel, Phone, Mail, MapPin, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
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
              <span className="font-serif text-xl font-bold text-white tracking-tight">StayAI Grand</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Urban luxury and contemporary elegance situated in the premier commercial & cultural heart of central Bengaluru.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>24/7 AI Concierge Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-amber-300 transition-colors">Home Overview</a></li>
              <li><a href="#concierge" className="hover:text-amber-300 transition-colors">AI Guest Concierge</a></li>
              <li><a href="#rooms" className="hover:text-amber-300 transition-colors">Suites & Accommodations</a></li>
              <li><a href="#amenities" className="hover:text-amber-300 transition-colors">Resort Amenities</a></li>
              <li><a href="#dining" className="hover:text-amber-300 transition-colors">Dining & Rooftop Lounge</a></li>
              <li><a href="#availability" className="hover:text-amber-300 transition-colors">Live Availability Search</a></li>
            </ul>
          </div>

          {/* Key Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Guest Schedule</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Check-in:</strong> 3:00 PM onwards</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Check-out:</strong> 11:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Breakfast:</strong> 6:30 AM ? 10:30 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Rooftop Pool:</strong> 6:00 AM ? 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Direct Contact</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>142 MG Road, Ashok Nagar, Bengaluru, Karnataka 560001, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Concierge Desk: +91 80 4965 2000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>concierge@stayaigrand.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span><strong>Demo Hotel Experience:</strong> Prototype built for Simplotel AI Product Engineer Assignment. No real booking is charged.</span>
          </div>
          <p>? 2026 StayAI Grand Hotel Bengaluru. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
