import React, { useState } from 'react';
import { Calendar, Users, Search, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import RoomResultCard from './RoomResultCard';
import { checkRoomAvailability } from '../services/api';

export default function AvailabilityCard() {
  // Compute default dates: tomorrow and 2 days later
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

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    setValidationError('');
    // Auto adjust checkout if needed
    if (val && checkOut && val >= checkOut) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e) => {
    setCheckOut(e.target.value);
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Client-side validations
    if (!checkIn) {
      setValidationError('Please select a valid check-in date.');
      return;
    }
    if (!checkOut) {
      setValidationError('Please select a valid check-out date.');
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
      setValidationError('Number of guests must be at least 1.');
      return;
    }

    setIsLoading(true);
    setAvailabilityResult(null);

    try {
      const result = await checkRoomAvailability(checkIn, checkOut, adults);
      setAvailabilityResult(result);
    } catch (err) {
      setValidationError(err.message || 'Failed to check room availability.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-semibold text-sm">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base">Check Availability</h3>
            <p className="text-[11px] text-slate-500">Instant rates & room capacity</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
          Demo tool
        </span>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Check-In Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span>Check-in Date</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={handleCheckInChange}
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Check-Out Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <span>Check-out Date</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={handleCheckOutChange}
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Guests Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Number of Guests</span>
          </label>
          <select
            value={adults}
            onChange={(e) => {
              setAdults(parseInt(e.target.value, 10));
              setValidationError('');
            }}
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-colors"
          >
            <option value={1}>1 Adult (Solo Traveler)</option>
            <option value={2}>2 Adults (Couple / Double)</option>
            <option value={3}>3 Adults (Executive Suite)</option>
            <option value={4}>4 Adults (Family Suite)</option>
            <option value={5}>5+ Adults (Group)</option>
          </select>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-2.5 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-amber-300 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking inventory...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Check Room Availability</span>
            </>
          )}
        </button>
      </form>

      {/* Results Display */}
      {availabilityResult && (
        <div className="mt-5 pt-4 border-t border-slate-100 animate-fadeIn">
          {availabilityResult.available && availabilityResult.rooms?.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {availabilityResult.rooms.length} Room{availabilityResult.rooms.length > 1 ? 's' : ''} Available ({availabilityResult.nights} Night{availabilityResult.nights > 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {availabilityResult.check_in} → {availabilityResult.check_out}
                </span>
              </div>

              <div className="space-y-3">
                {availabilityResult.rooms.map((room, idx) => (
                  <RoomResultCard
                    key={idx}
                    room={room}
                    nights={availabilityResult.nights || 1}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center text-xs text-amber-900">
              <p className="font-semibold mb-1">No single room available for this party size</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Our largest suite accommodates up to 4 adults. For parties of {adults} or more, please reserve multiple rooms or contact our concierge.
              </p>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center mt-3 italic">
            * Demo availability simulation — deterministic business logic
          </p>
        </div>
      )}
    </div>
  );
}
