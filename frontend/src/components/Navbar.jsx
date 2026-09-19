import React, { useState, useEffect } from 'react';
import { Hotel, Sparkles, Menu, X, User, ShoppingBag, Bed, LogOut } from 'lucide-react';

const CITIES = [
  { id: 'bengaluru', name: 'Bengaluru' },
  { id: 'goa', name: 'Goa' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'delhi', name: 'Delhi' },
  { id: 'jaipur', name: 'Jaipur' },
];

export default function Navbar({
  selectedCity,
  onSelectCity,
  hotelData,
  guestName,
  stayContext,
  cartItemCount = 0,
  onOpenCart,
  onResetGuest,
  onOpenAdmin
}) {
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
    { name: 'Overview', href: '#home' },
    ...(stayContext ? [{ name: 'My Stay', href: '#my-stay' }] : []),
    { name: 'Rooms & Suites', href: '#rooms' },
    { name: 'In-Room Dining', href: '#dining' },
    { name: 'Services', href: '#services' },
    { name: 'Amenities', href: '#amenities' },
    { name: 'Book Room', href: '#availability' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-2.5'
          : 'bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <a href="#home" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Hotel className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  OLERIA HOTEL
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest hidden sm:inline-block">
                  {hotelData?.city || 'Luxury'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden md:block truncate max-w-[200px]">
                {hotelData?.tagline || 'Intelligent Hospitality'}
              </p>
            </div>
          </a>

          {/* Center: City Selector Tabs */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-inner">
            {CITIES.map((c) => {
              const active = selectedCity === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCity(c.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Center/Right Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-slate-900/60 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Stay Badge if checked in */}
            {stayContext && (
              <a
                href="#my-stay"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-300 font-medium hover:bg-emerald-500/25 transition-colors"
              >
                <Bed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Room {stayContext.room_number}</span>
              </a>
            )}

            {/* Food Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 px-3 py-1.5 rounded-full text-xs text-slate-200 transition-colors cursor-pointer"
              title="View In-Room Dining Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Admin Demo Button */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-amber-600/15 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs text-amber-300 font-semibold transition-all cursor-pointer shadow-sm hover:scale-102"
                title="Open Hotel Operations Admin Demo"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Demo</span>
              </button>
            )}

            {/* Guest Chip */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold text-[11px]">
                {guestName ? guestName.charAt(0).toUpperCase() : 'G'}
              </div>
              <span className="font-medium truncate max-w-[90px]">{guestName || 'Guest'}</span>
              {onResetGuest && (
                <button
                  onClick={onResetGuest}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                  title="Change Guest Name"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/95 rounded-2xl p-4 shadow-xl space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Hotel City:</p>
              <div className="grid grid-cols-3 gap-1.5">
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCity(c.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center ${
                      selectedCity === c.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
              {onOpenAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Open Admin Demo Dashboard</span>
                </button>
              )}
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-300 hover:text-amber-400 py-1.5 px-2 rounded-lg hover:bg-slate-900"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
