import React, { useState, useEffect } from 'react';
import { Hotel, Sparkles, MessageSquare, Menu, X, User, Calendar, LogOut } from 'lucide-react';

export default function Navbar({ guestName, onOpenConcierge, onResetGuest }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'AI Concierge', href: '#concierge', highlight: true },
    { name: 'Rooms & Suites', href: '#rooms' },
    { name: 'Amenities', href: '#amenities' },
    { name: 'Dining', href: '#dining' },
    { name: 'Check Availability', href: '#availability' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/10 py-3'
          : 'bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-md shadow-amber-950/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Hotel className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                StayAI
              </span>
              <span className="bg-amber-400/15 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest hidden sm:inline-block">
                Grand Hotel
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden md:block">
              MG Road ? Central Bengaluru
            </p>
          </div>
        </a>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                link.highlight
                  ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Guest Name & AI Concierge Pill */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Guest Greeting Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-200">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium max-w-[100px] truncate">{guestName}</span>
            <button
              onClick={onResetGuest}
              title="Change guest name"
              className="text-slate-400 hover:text-slate-200 ml-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>

          {/* AI Status Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">AI Concierge</span>
          </div>

          {/* Ask Concierge CTA */}
          <button
            onClick={onOpenConcierge}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-md shadow-amber-950/30 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Concierge</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-200 hover:text-white focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3 mt-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-amber-400" />
              <span>Welcome, {guestName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Concierge</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs p-2.5 rounded-xl block text-center font-medium transition-colors ${
                  link.highlight
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConcierge();
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Concierge</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onResetGuest();
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
              title="Change guest"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
