import React, { useState } from 'react';
import { X, Calendar, User, Mail, CreditCard, ShieldCheck, CheckCircle2, Loader2, Sparkles, Building2, Bed } from 'lucide-react';
import { checkoutRoomBooking } from '../services/api';

export default function BookingModal({
  isOpen,
  onClose,
  room,
  checkIn,
  checkOut,
  nights = 1,
  hotelData,
  guestName: initialGuestName = '',
  onBookingConfirmed,
}) {
  const [guestName, setGuestName] = useState(initialGuestName || 'Ayesha Siddiqa');
  const [guestEmail, setGuestEmail] = useState('guest@oleriahotels.com');
  const [specialRequests, setSpecialRequests] = useState('High floor room requested');
  const [paymentMethod, setPaymentMethod] = useState('demo_card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!isOpen || !room) return null;

  const pricePerNight = room.price_per_night || 5000;
  const subtotal = pricePerNight * nights;
  const gst = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + gst;

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!guestEmail.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await checkoutRoomBooking({
        hotel_id: hotelData?.hotel_id || 'bengaluru',
        room_type_id: room.room_type_id,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
      });

      const confirmedData = {
        booking_id: res.booking_id,
        room_number: res.room_number || 502,
        room_name: room.room_name || room.name,
        check_in: checkIn,
        check_out: checkOut,
        nights: nights,
        guest_name: guestName.trim(),
        hotel_name: hotelData?.hotel_name || 'Oleria Hotel',
        hotel_id: hotelData?.hotel_id || 'bengaluru',
        city: hotelData?.city || 'Bengaluru',
        total_amount: res.total_amount || grandTotal,
      };

      setConfirmedBooking(confirmedData);
      if (onBookingConfirmed) {
        onBookingConfirmed(confirmedData);
      }
    } catch (err) {
      console.error('Booking checkout error:', err);
      setError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmedBooking(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md shadow-amber-950/40">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                {confirmedBooking ? 'Reservation Confirmed' : 'Instant Suite Reservation'}
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">
                {hotelData?.hotel_name || 'Oleria Hotel'} • {hotelData?.city || 'Bengaluru'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {confirmedBooking ? (
            /* Success View */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-400">
                  Confirmed & Ready
                </span>
                <h4 className="font-serif text-2xl font-bold text-white mt-1">
                  Welcome to Room {confirmedBooking.room_number}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Booking Reference: <strong className="text-amber-300 font-mono">{confirmedBooking.booking_id}</strong>
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Guest Name:</span>
                  <span className="text-white font-medium">{confirmedBooking.guest_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Suite Category:</span>
                  <span className="text-white font-medium">{confirmedBooking.room_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>Stay Dates:</span>
                  <span className="text-white font-medium">{checkIn} to {checkOut} ({confirmedBooking.nights} night{confirmedBooking.nights > 1 ? 's' : ''})</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total (inc. 12% GST):</span>
                  <span className="text-amber-400 font-serif font-bold text-sm">₹{confirmedBooking.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-amber-200 text-[11px] flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>"My Stay" is now active on your dashboard. You can order in-room dining and request amenities straight to Room {confirmedBooking.room_number}.</span>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-950/40"
              >
                Access My Stay Dashboard
              </button>
            </div>
          ) : (
            /* Booking Form View */
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Room Snapshot Banner */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={room.image || 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80'}
                      alt={room.room_name || room.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">{room.room_name || room.name}</h4>
                    <p className="text-[11px] text-slate-400">{room.bed_type || 'King Bed'} • Max {room.capacity} Guests</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-serif font-bold text-base">₹{pricePerNight.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-400 block">/ night</span>
                </div>
              </div>

              {/* Dates & Stay Summary */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Check-In</span>
                  <span className="font-medium text-white text-xs">{checkIn}</span>
                  <span className="text-[10px] text-slate-400 block">From 3:00 PM</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Check-Out</span>
                  <span className="font-medium text-white text-xs">{checkOut}</span>
                  <span className="text-[10px] text-slate-400 block">Until 11:00 AM</span>
                </div>
              </div>

              {/* Guest Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Primary Guest Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Ayesha Siddiqa"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Guest Email (for reservation confirmation) *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@domain.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Special Requests (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Quiet room away from elevator, extra pillows"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Payment Guarantee (Demo)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('demo_card')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'demo_card'
                        ? 'bg-amber-500/10 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className={`w-4 h-4 ${paymentMethod === 'demo_card' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-semibold text-xs block">Demo Card</span>
                      <span className="text-[10px] text-slate-400">Instant Hold</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pay_at_hotel')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      paymentMethod === 'pay_at_hotel'
                        ? 'bg-amber-500/10 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${paymentMethod === 'pay_at_hotel' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-semibold text-xs block">Pay At Hotel</span>
                      <span className="text-[10px] text-slate-400">Front Desk</span>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'demo_card' && (
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Card: {cardNumber}</span>
                    <span className="text-emerald-400 font-medium">Demo Authorized</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>₹{pricePerNight.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Luxury Hospitality GST (12%)</span>
                  <span className="text-white font-medium">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">Estimated Total</span>
                  <span className="font-serif font-bold text-amber-400 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Simulation Notice */}
              <div className="flex items-center gap-2 text-[10px] text-amber-300/80 bg-amber-400/5 p-2 rounded-xl border border-amber-400/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Simulation checkout for demonstration. No financial transaction takes place.</span>
              </div>

              {error && (
                <div className="p-2.5 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Suite...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Demo Reservation</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
