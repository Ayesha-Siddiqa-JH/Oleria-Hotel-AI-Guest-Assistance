import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ShieldCheck, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { placeFoodOrder } from '../services/api';

export default function FoodCartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  hotelData,
  stayContext,
  guestName
}) {
  const [roomNumber, setRoomNumber] = useState(stayContext?.room_number || '502');
  const [name, setName] = useState(guestName || 'Valued Guest');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (stayContext?.room_number) {
      setRoomNumber(String(stayContext.room_number));
    }
  }, [stayContext]);

  useEffect(() => {
    if (guestName) {
      setName(guestName);
    }
  }, [guestName]);

  if (!isOpen) return null;

  const getItemPrice = (item) => (item.price_per_unit !== undefined ? item.price_per_unit : item.price) || 0;
  const subtotal = cart.reduce((acc, item) => acc + (getItemPrice(item) * item.quantity), 0);
  const taxes = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + taxes) * 100) / 100;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!roomNumber.trim()) {
      setErrorMsg('Please provide your room number for in-room delivery.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        hotel_id: hotelData?.hotel_id || 'bengaluru',
        room_number: roomNumber.trim(),
        guest_name: name.trim() || 'Guest',
        items: cart,
        special_instructions: specialInstructions.trim() || null,
      };

      const result = await placeFoodOrder(payload);
      setOrderConfirmation(result);
      onClearCart();
    } catch (err) {
      setErrorMsg(err.message || 'Could not complete demo payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">In-Room Dining Cart</h3>
              <p className="text-xs text-slate-400">{hotelData?.hotel_name || 'Oleria Hotel'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {orderConfirmation ? (
            /* Order Confirmed Screen */
            <div className="py-2 space-y-4">
              {/* Payment Successful Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">Payment Successful</h4>
                    <p className="text-[11px] text-emerald-400/80">Simulated Demo Transaction Approved</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Demo Paid
                </span>
              </div>

              {/* Order Details Header */}
              <div className="text-center pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Status: {orderConfirmation.status || 'Confirmed'}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Order Confirmed</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Order ID: <strong className="text-amber-400 font-mono tracking-wider">{orderConfirmation.order_id}</strong>
                </p>
              </div>

              {/* Order Summary Breakdown Card */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-300 pb-2.5 border-b border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hotel Name</span>
                    <span className="font-semibold text-white truncate block">{orderConfirmation.hotel_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Room Number</span>
                    <span className="font-semibold text-amber-300">Room {orderConfirmation.room_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Guest Name</span>
                    <span className="font-semibold text-white truncate block">{orderConfirmation.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimated Delivery Time</span>
                    <span className="font-semibold text-emerald-400">{orderConfirmation.estimated_delivery || '25–35 minutes'}</span>
                  </div>
                </div>

                {/* Items Ordered Breakdown */}
                <div>
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider block mb-2">
                    Items Ordered:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {orderConfirmation.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-200 truncate pr-2">
                          <strong className="text-amber-400">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="text-slate-300 font-medium shrink-0">
                          ₹{((item.price_per_unit || item.price || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Amount:</span>
                  <span className="text-amber-400">
                    ₹{orderConfirmation.total?.toLocaleString()} <span className="text-xs font-normal text-slate-400">(Demo Payment)</span>
                  </span>
                </div>
              </div>

              {/* Required Demo Note */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] text-amber-300 text-center leading-relaxed">
                Demo Order: No real payment was charged. The order has been sent to the hotel kitchen demo queue.
              </div>

              <button
                onClick={() => {
                  setOrderConfirmation(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Close & Continue
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart Screen */
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Your in-room dining cart is empty.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Browse our menu below or ask Oleria AI Concierge to add coffees, light snacks, or comfort meals.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            /* Active Cart Items */
            <form onSubmit={handleCheckout} className="space-y-5">
              {/* Item List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{item.name}</p>
                      <p className="text-slate-400 text-[11px]">
                        ₹{item.price_per_unit} each • <strong className="text-amber-400">₹{getItemPrice(item) * item.quantity}</strong>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.item_id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-white text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.item_id, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.item_id)}
                        className="ml-2 text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Details Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-medium">Delivery Room #</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. 502"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-medium">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Guest name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Bill Breakdown */}
              <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST & Service Charge (5%)</span>
                  <span className="text-slate-200">₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>In-Room Delivery</span>
                  <span className="text-emerald-400 font-medium">Complimentary</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Grand Total</span>
                  <span className="text-amber-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  {errorMsg}
                </p>
              )}

              {/* Checkout Action Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Pay Demo Amount (₹{total.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Demo Payment — No real card or payment processed</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
