import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, Loader2, BellRing, Shirt, Droplets, Waves, Check, ShieldCheck, MessageSquare } from 'lucide-react';
import { requestHotelService } from '../services/api';

export default function HotelServicesSection({ hotelData, stayContext, onAskConcierge }) {
  const [requestingId, setRequestingId] = useState(null);
  const [successStatus, setSuccessStatus] = useState({});
  const [roomNum, setRoomNum] = useState(stayContext?.room_number || 502);

  const services = hotelData?.services || [
    {
      service_id: 'extra_pillows',
      name: 'Extra Pillows',
      category: 'Housekeeping',
      description: 'Hypoallergenic goose-down or firm memory foam pillows delivered to your suite.',
      delivery_time: '15 mins',
      cost: 'Complimentary'
    },
    {
      service_id: 'extra_towels',
      name: 'Extra Bath & Pool Towels',
      category: 'Housekeeping',
      description: 'Plush Turkish cotton bath sheets and oversized pool towels.',
      delivery_time: '10-15 mins',
      cost: 'Complimentary'
    },
    {
      service_id: 'water_bottles',
      name: 'Packaged Himalayan Water',
      category: 'Refreshment',
      description: 'Chilled glass bottles of pure Himalayan natural mineral water.',
      delivery_time: '10 mins',
      cost: 'Complimentary'
    },
    {
      service_id: 'housekeeping',
      name: 'Turn-Down & Suite Refresh',
      category: 'Housekeeping',
      description: 'Evening turndown service, fresh linen replacement, and aromatherapy pillow mist.',
      delivery_time: '20 mins',
      cost: 'Complimentary'
    },
    {
      service_id: 'iron_board',
      name: 'Steam Iron & Pressing Board',
      category: 'Laundry',
      description: 'High-pressure Philips steam iron and full-length padded ironing board.',
      delivery_time: '10 mins',
      cost: 'Complimentary'
    },
    {
      service_id: 'laundry',
      name: 'Express Dry Cleaning & Laundry',
      category: 'Laundry',
      description: 'Same-day professional laundering, pressing, and delicate fabric care.',
      delivery_time: 'Same-day 4 hrs',
      cost: '₹350 / garment'
    },
    {
      service_id: 'airport_cab',
      name: 'Airport Luxury Sedan Transfer',
      category: 'Concierge',
      description: 'Chauffeur-driven Mercedes E-Class or BMW 5-Series private airport transit.',
      delivery_time: 'Scheduled',
      cost: '₹2,200 / trip'
    }
  ];

  const handleRequestService = async (service) => {
    setRequestingId(service.service_id);
    try {
      const activeRoom = stayContext?.room_number || roomNum || 502;
      const res = await requestHotelService({
        hotel_id: hotelData?.hotel_id || 'bengaluru',
        service_id: service.service_id,
        room_number: Number(activeRoom),
        guest_name: stayContext?.guest_name || 'Valued Guest',
        special_instructions: 'Requested via Oleria Guest Portal',
      });

      setSuccessStatus((prev) => ({
        ...prev,
        [service.service_id]: {
          request_id: res.request_id,
          eta: res.estimated_delivery,
          room: res.room_number,
        }
      }));

      setTimeout(() => {
        setSuccessStatus((prev) => {
          const next = { ...prev };
          delete next[service.service_id];
          return next;
        });
      }, 7000);
    } catch (err) {
      console.error('Service request failed:', err);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <section id="services" className="py-20 bg-slate-950 text-white relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <BellRing className="w-3.5 h-3.5" />
            <span>On-Demand Guest Services</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Effortless Hospitality at Your Fingertips
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light">
            Request essential housekeeping amenities, laundry, or concierge transfers directly to your suite without calling the front desk.
          </p>

          {/* Delivery Room Target Notice */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs text-slate-300">
            <span>Delivering to suite:</span>
            <strong className="text-amber-400 font-serif">Room {stayContext?.room_number || roomNum}</strong>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {stayContext ? 'Active Stay' : 'Demo Default'}
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => {
            const isRequesting = requestingId === svc.service_id;
            const success = successStatus[svc.service_id];

            return (
              <div
                key={svc.service_id}
                className="group bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      {svc.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{svc.delivery_time}</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white mb-2">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Rate</span>
                    <span className="font-semibold text-xs text-amber-300">{svc.cost}</span>
                  </div>

                  {success ? (
                    <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dispatched ({success.request_id})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestService(svc)}
                      disabled={isRequesting}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/40"
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Request (Demo)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Footer Note */}
        <div className="mt-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>All requests are handled deterministically with assigned tracking IDs (e.g. OLR-SRV-XXXX) for instant guest peace of mind.</span>
        </div>
      </div>
    </section>
  );
}
