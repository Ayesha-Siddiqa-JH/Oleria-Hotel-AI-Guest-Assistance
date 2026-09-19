import React, { useState, useEffect } from 'react';
import { Calendar, Users, Search, Loader2, CheckCircle2, AlertCircle, Sparkles, Filter, Building2 } from 'lucide-react';
import RoomCard from './RoomCard';
import { checkRoomAvailability } from '../services/api';

export default function AvailabilitySection({ selectedCity = 'bengaluru', hotelData, onAskAboutRoom, onBookRoom }) {
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

  // Sync default rooms from hotelData when city changes
  const defaultRooms = (hotelData?.rooms || []).map((r) => ({
    room_type_id: r.room_type_id,
    room_name: r.name,
    capacity: r.capacity,
    bed_type: r.bed_type,
    size_sqm: r.size_sqm,
    view: r.view,
    price_per_night: r.price_per_night,
    amenities: r.amenities,
    description: r.description,
    image: r.image,
  }));

  // Reset availability search when property changes
  useEffect(() => {
    setAvailabilityResult(null);
    setValidationError('');
  }, [selectedCity]);

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
      const res = await checkRoomAvailability(checkIn, checkOut, adults, selectedCity);
      setAvailabilityResult(res);
    } catch (err) {
      setValidationError(err.message || 'Failed to check room availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeRooms = availabilityResult?.rooms || defaultRooms;
  const nights = availabilityResult?.nights || 2;

  const handleTriggerBooking = (room) => {
    if (onBookRoom) {
      onBookRoom(room, checkIn, checkOut, nights);
    }
  };

  return (
    <section id="availability" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Room Availability • {hotelData?.city || 'Bengaluru'}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Suites & Accommodations
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light">
            Explore live availability, nightly rates, and instant demo reservations at <strong>{hotelData?.hotel_name || 'Oleria Hotel'}</strong>.
          </p>
        </div>

        {/* Floating Search Bar Card */}
        <div className="max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl mb-14">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Check-in Date</span>
              </label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={handleCheckInChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Check-out Date</span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setValidationError('');
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Guests (Adults)</span>
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults</option>
              </select>
            </div>

            <div className="sm:col-span-3 lg:col-span-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[42px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Rates</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {validationError && (
            <div className="mt-4 p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Results Banner if search conducted */}
        {availabilityResult && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {availabilityResult.available ? `${availabilityResult.rooms.length} Suites Available` : 'No Suites Available'}
                </h3>
                <p className="text-xs text-slate-400">
                  {checkIn} to {checkOut} • {availabilityResult.nights} night{availabilityResult.nights > 1 ? 's' : ''} • {adults} guest{adults > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30">
              Live Verified Rates
            </span>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeRooms.map((room, idx) => (
            <RoomCard
              key={room.room_type_id || idx}
              room={room}
              nights={nights}
              onAskAboutRoom={onAskAboutRoom}
              onBookRoom={handleTriggerBooking}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
