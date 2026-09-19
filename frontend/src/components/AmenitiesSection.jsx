import React from 'react';
import { Waves, Sparkles, Dumbbell, Wifi, Car, Clock, Shield, MessageSquare, Compass, Sun } from 'lucide-react';
import { HOTEL_IMAGES } from '../data/hotelImages';

export default function AmenitiesSection({ hotelData, onAskConcierge }) {
  const city = hotelData?.city || 'Bengaluru';

  // Customize amenities descriptions based on selected hotel
  const getCityAmenities = () => {
    if (hotelData?.amenities && hotelData.amenities.length >= 4) {
      return hotelData.amenities.map((a, i) => {
        let image = HOTEL_IMAGES.pool;
        let icon = Waves;
        if (i === 1) { image = HOTEL_IMAGES.spa; icon = Sparkles; }
        else if (i === 2) { image = HOTEL_IMAGES.gym; icon = Dumbbell; }
        else if (i === 3) { image = HOTEL_IMAGES.lobby; icon = Compass; }

        return {
          title: a.name,
          image: image,
          icon: icon,
          hours: a.timings || 'Daily Hours',
          cost: a.cost || 'Complimentary for Guests',
          description: a.details,
          query: `Tell me about ${a.name} and timings at ${hotelData.hotel_name}`
        };
      });
    }

    // Default rich amenities
    return [
      {
        title: `${city} Rooftop Infinity Pool`,
        image: HOTEL_IMAGES.pool,
        icon: Waves,
        hours: '6:00 AM – 10:00 PM',
        cost: 'Complimentary for Guests',
        description: `A temperature-controlled open-air swimming pool offering scenic vistas of ${city}, plush loungers, and poolside refreshments.`,
        query: `What are the swimming pool timings and rules at ${hotelData?.hotel_name || 'the hotel'}?`,
      },
      {
        title: 'Aura Luxury Spa & Hydrotherapy',
        image: HOTEL_IMAGES.spa,
        icon: Sparkles,
        hours: '8:00 AM – 9:00 PM',
        cost: 'Treatments Per Menu',
        description: 'Holistic Ayurvedic therapies, aromatherapy massages, steam baths, and signature relaxation rituals.',
        query: 'Tell me about the spa facilities and timings',
      },
      {
        title: '24/7 Technogym Wellness Center',
        image: HOTEL_IMAGES.gym,
        icon: Dumbbell,
        hours: 'Open 24 Hours',
        cost: 'Complimentary Access',
        description: 'Equipped with modern cardiovascular treadmills, ellipticals, free weights, resistance cables, and a zen yoga pavilion.',
        query: 'Do you have gym facilities and what are the hours?',
      },
      {
        title: 'Ultra-Fast 500 Mbps Fiber Wi-Fi',
        image: HOTEL_IMAGES.wifi,
        icon: Wifi,
        hours: 'Always Connected',
        cost: 'Complimentary Unlimited',
        description: 'Enterprise-grade fiber optic Wi-Fi accessible seamlessly across all suites, meeting rooms, lounges, and outdoor terraces.',
        query: 'Is Wi-Fi free and what is the speed?',
      },
      {
        title: 'Valet Parking & High-Speed EV Charging',
        image: HOTEL_IMAGES.valet,
        icon: Car,
        hours: '24/7 Attendants',
        cost: 'Complimentary Valet',
        description: 'Secure multi-level parking with round-the-clock valet service and Type-2 high-speed EV charging stations.',
        query: 'Do you have parking and EV charging?',
      },
      {
        title: '24/7 Dedicated Concierge & Transfers',
        image: HOTEL_IMAGES.lobby,
        icon: Clock,
        hours: '24/7 Front Desk',
        cost: 'Complimentary Assistance',
        description: 'Personalized travel assistance, secure luggage holding before check-in or after check-out, and luxury airport sedan transfers.',
        query: 'Can I store luggage before check-in or after check-out?',
      },
    ];
  };

  const amenities = getCityAmenities();

  return (
    <section id="amenities" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full inline-block mb-3">
            World-Class Facilities • {city}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mb-3 tracking-tight">
            Curated Resort Amenities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Every convenience crafted to elevate your stay at <strong>{hotelData?.hotel_name || 'Oleria Hotel'}</strong>.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{item.hours}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-800">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-950">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {item.cost}
                    </span>

                    <button
                      onClick={() => onAskConcierge && onAskConcierge(item.query)}
                      className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ask Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
