import React from 'react';
import { UtensilsCrossed, Clock, Sparkles, MessageSquare, Coffee, Wine, Moon } from 'lucide-react';
import { HOTEL_IMAGES } from '../data/hotelImages';

export default function DiningSection({ onAskConcierge }) {
  const venues = [
    {
      name: 'The Glasshouse Bistro',
      image: HOTEL_IMAGES.glasshouse_bistro,
      cuisine: 'Continental, Pan-Asian & Authentic South Indian',
      breakfast: '6:30 AM ? 10:30 AM (Buffet)',
      hours: 'All-Day Dining: 6:30 AM ? 11:00 PM',
      highlight:
        'Complimentary international breakfast buffet for Suite guests (?850 for Deluxe room-only). Features live dosa & egg stations and specialty coffees.',
      icon: Coffee,
      query: 'Is breakfast included and what are the timings?',
    },
    {
      name: 'Skyline Rooftop Bar & Lounge',
      image: HOTEL_IMAGES.skyline_lounge,
      cuisine: 'Artisan Cocktails, Wood-fired Pizzas & Tapas',
      breakfast: null,
      hours: '5:00 PM ? 1:00 AM Daily',
      highlight:
        'Stunning 15th-floor alfresco terrace overlooking Bengaluru skyline with resident DJ sets Thursday through Saturday.',
      icon: Wine,
      query: 'Tell me about the Skyline Rooftop Bar and timings',
    },
    {
      name: '24/7 In-Room Dining',
      image: HOTEL_IMAGES.in_room_dining,
      cuisine: 'Chef-crafted comfort food, midnight specials & beverages',
      breakfast: 'Available all day & night',
      hours: 'Open 24 Hours Daily',
      highlight:
        'Delivered promptly to your suite door. Extensive selection of Indian classics, pastas, burgers, and organic tea infusions.',
      icon: Moon,
      query: 'Is room service available 24/7?',
    },
  ];

  return (
    <section id="dining" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full inline-block mb-3">
            Culinary Excellence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-950 mb-3 tracking-tight">
            Fine Dining & Cocktails
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Savor exceptional flavors, from our lavish morning buffet at The Glasshouse Bistro to sunset cocktails on the 15th floor.
          </p>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {venues.map((venue, idx) => {
            const Icon = venue.icon;
            return (
              <div
                key={idx}
                className="group bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10" />

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">
                      {venue.cuisine}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white">
                      {venue.name}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{venue.hours}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {venue.highlight}
                    </p>
                  </div>

                  <button
                    onClick={() => onAskConcierge && onAskConcierge(venue.query)}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-amber-600 hover:text-slate-950 active:scale-[0.98] text-slate-800 border border-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Concierge About Dining</span>
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
