import React from 'react';
import { Waves, Sparkles, Dumbbell, Wifi, Car, Clock, Shield, MessageSquare } from 'lucide-react';
import { HOTEL_IMAGES } from '../data/hotelImages';

export default function AmenitiesSection({ onAskConcierge }) {
  const amenities = [
    {
      title: 'Rooftop Infinity Pool',
      image: HOTEL_IMAGES.pool,
      icon: Waves,
      hours: '6:00 AM ? 10:00 PM',
      cost: 'Complimentary for Guests',
      description:
        'A temperature-controlled 15th-floor open-air swimming pool offering panoramic vistas of Bengaluru, plush sun loungers, and poolside refreshments.',
      query: 'What are the swimming pool timings and rules?',
    },
    {
      title: 'Aura Spa & Steam Sauna',
      image: HOTEL_IMAGES.spa,
      icon: Sparkles,
      hours: '8:00 AM ? 9:00 PM',
      cost: 'Treatments Per Menu',
      description:
        'Holistic Ayurvedic therapies, aromatherapy massages, steam bath, and Finnish dry sauna designed to restore balance and vitality.',
      query: 'Tell me about the spa facilities and timings',
    },
    {
      title: '24/7 Wellness Gym',
      image: HOTEL_IMAGES.gym,
      icon: Dumbbell,
      hours: 'Open 24 Hours',
      cost: 'Complimentary Access',
      description:
        'Equipped with modern TechnoGym treadmills, ellipticals, free weights, resistance cables, and a dedicated zen yoga stretching pavilion.',
      query: 'Do you have gym facilities and what are the hours?',
    },
    {
      title: 'Ultra-Fast 500 Mbps Wi-Fi',
      image: HOTEL_IMAGES.wifi,
      icon: Wifi,
      hours: 'Always Connected',
      cost: 'Complimentary Unlimited',
      description:
        'Enterprise-grade fiber optic Wi-Fi accessible seamlessly across all suites, meeting rooms, lounges, and outdoor garden terraces.',
      query: 'Is Wi-Fi free and what is the speed?',
    },
    {
      title: 'Valet Parking & EV Charging',
      image: HOTEL_IMAGES.valet,
      icon: Car,
      hours: '24/7 Attendants',
      cost: 'Complimentary Valet',
      description:
        'Secure multi-level underground parking with round-the-clock valet service and four Type-2 high-speed EV charging stations.',
      query: 'Do you have parking and EV charging?',
    },
    {
      title: 'Concierge & Luggage Storage',
      image: HOTEL_IMAGES.lobby,
      icon: Clock,
      hours: '24/7 Front Desk',
      cost: 'Complimentary Storage',
      description:
        'Personalized travel assistance, secure luggage holding before check-in/after check-out, and luxury airport sedan transfers.',
      query: 'Can I store luggage before check-in or after check-out?',
    },
  ];

  return (
    <section id="amenities" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full inline-block mb-3">
            World-Class Facilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mb-3 tracking-tight">
            Curated Resort Amenities
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Every convenience designed to elevate your stay, from our heated rooftop pool to 24/7 fitness and wellness services.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

                  <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/20 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                    {item.cost}
                  </span>

                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold mb-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{item.hours}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onAskConcierge && onAskConcierge(item.query)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-amber-600 hover:text-slate-950 active:scale-[0.98] text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Inquire About This</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
