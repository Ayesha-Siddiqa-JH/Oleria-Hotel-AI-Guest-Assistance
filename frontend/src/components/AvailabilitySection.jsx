import React, { useState, useEffect } from 'react';
import { Calendar, Users, Search, Loader2, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';
import RoomCard from './RoomCard';
import { checkRoomAvailability, fetchHotelInfo } from '../services/api';

export default function AvailabilitySection({ onAskAboutRoom }) {
  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const todayStr = getFormattedDate(0);
  const tomorrowStr = getFormattedDate(1);
  const checkoutStr = getFormattedDate(3);

  const [checkIn, setCheckIn] = useState(tomorrowStr);
  const [checkOut, setCheckOut] = useState(checkoutStr);
  const [adults, setAdults] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [defaultRooms, setDefaultRooms] = useState([]);

  // Fetch initial room catalog to show on page load
  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchHotelInfo();
      if (data?.hotel?.rooms) {
        // Map to standard room object
        const mapped = data.hotel.rooms.map((r) => ({
          room_type_id: r.room_type_id,
          room_name: r.name,
          capacity: r.capacity,
          bed_type: r.bed_type,
          size_sqm: r.size_sqm,
          view: r.view,
          price_per_night: r.price_per_night,
          amenities: r.amenities,
          description: r.description,
        }));
        setDefaultRooms(mapped);
      }
    }
    loadCatalog();
  }, []);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    setValidationError('');
    if (val && checkOut && val >= checkOut) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!checkIn) {
      setValidationError('Please select a check-in date.');
      return;
    }
    if (!checkOut) {
      setValidationError('Please select a check-out date.');
      return;
    }
    if (checkIn < todayStr) {
      setValidationError('Check-in date cannot be in the past.');
      return;
    }
    if (checkOut <= checkIn) {
      setValidationError('Check-out date must be at least one day after check-in.');
      return;
    }
    if (!adults || adults < 1) {
      setValidationError('Guests must be at least 1.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await checkRoomAvailability(checkIn, checkOut, adults);
      setAvailabilityResult(res);
    } catch (err) {
      setValidationError(err.message || 'Failed to check room availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRooms = availabilityResult?.rooms || defaultRooms;
  const nights = availabilityResult?.nights || 2;

  return (
    <section id="availability" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Room Search</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Find Your Sanctuary
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light">
            Select your preferred dates to view available suites, rates, and occupancy limits.
          </p>
        </div>

        {/* Floating Search Bar Card */}
        <div className="max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl mb-14">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Check-In */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Check-in Date</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={handleCheckInChange}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
                required
              />
            </div>

            {/* Check-Out */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Check-out Date</span>
              </label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setValidationError('');
                }}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
                required
              />
            </div>

            {/* Adults Count */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Guests</span>
              </label>
              <select
                value={adults}
                onChange={(e) => {
                  setAdults(parseInt(e.target.value, 10));
                  setValidationError('');
                }}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults</option>
                <option value={5}>5+ Adults</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-bold text-xs rounded-2xl shadow-md shadow-amber-950/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Validation Alert */}
          {validationError && (
            <div className="mt-3.5 bg-red-950/60 border border-red-500/40 text-red-300 rounded-2xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Availability Status Notification */}
        {availabilityResult && (
          <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              {availabilityResult.available ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {availabilityResult.available
                  ? `Found ${availabilityResult.rooms?.length} available option(s) for ${availabilityResult.adults} guest(s) (${availabilityResult.nights} nights).`
                  : `No single room accommodates ${availabilityResult.adults} adults (our largest suite sleeps 4). Please contact concierge for multi-room bookings.`}
              </span>
            </div>
            <span className="text-[10px] bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded">
              Demo availability
            </span>
          </div>
        )}

        {/* Room Cards Grid (Anchor target for #rooms) */}
        <div id="rooms" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold text-white">
              {availabilityResult ? 'Available Accommodations' : 'Signature Rooms & Suites'}
            </h3>
            <span className="text-xs text-amber-300 font-medium">
              Best Rate Guarantee ? Direct Booking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRooms.map((room, idx) => (
              <RoomCard
                key={idx}
                room={room}
                nights={nights}
                onAskAboutRoom={onAskAboutRoom}
              />
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            * All room bookings include high-speed 500 Mbps Wi-Fi, 24/7 gym access, heated rooftop pool privileges, and complimentary valet parking.
          </p>
        </div>
      </div>
    </section>
  );
}
