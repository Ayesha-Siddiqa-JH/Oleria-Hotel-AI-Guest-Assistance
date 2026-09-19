import React, { useState } from 'react';
import { Utensils, Coffee, Leaf, HeartPulse, ShoppingBag, Plus, Sparkles, Check } from 'lucide-react';

export default function DiningSection({
  hotelData,
  onAddToCart,
  onOpenCart,
  cart,
  onOpenConciergeWithPrompt,
  onAskConcierge
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItemNotice, setAddedItemNotice] = useState(null);

  const menu = hotelData?.menu || [];
  const diningVenues = hotelData?.dining || [];
  const categories = ['All', 'Light Meals', 'Vegetarian', 'Breakfast', 'Beverages', 'Desserts'];

  const filteredMenu = selectedCategory === 'All'
    ? menu
    : menu.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleAdd = (item) => {
    onAddToCart(item);
    setAddedItemNotice(item.id);
    setTimeout(() => setAddedItemNotice(null), 1500);
  };

  return (
    <section id="dining" className="py-20 bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>In-Room Dining & Culinary Highlights</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Oleria In-Room Dining
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Order chef-crafted specialties, comforting broths, and fresh barista brews directly to your room.
          </p>
        </div>

        {/* Personalized "Feeling Unwell" Prompt Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-amber-950/40 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Personalized Care • Not Feeling Well?
              </p>
              <p className="text-xs text-slate-300">
                Ask Oleria AI Concierge for gentle, easy-to-digest broths, soothing herbal teas, or comfort khichdi.
              </p>
            </div>
          </div>

          <button
            onClick={() => (onOpenConciergeWithPrompt || onAskConcierge || (() => {}))("I'm not feeling well, please suggest something light")}
            className="shrink-0 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>"I'm Not Feeling Well" Flow</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredMenu.map((item) => {
            const isAdded = addedItemNotice === item.id;
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-lg"
              >
                {/* Photo */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                    {item.category}
                  </span>

                  {/* Price Tag */}
                  <span className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags & Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {item.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md capitalize">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAdd(item)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hotel Dining Venues Info Strip */}
        {diningVenues.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="font-serif text-xl font-bold text-white text-center mb-6">
              Property Restaurants & Lounges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diningVenues.map((v) => (
                <div key={v.name} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
                  <h4 className="font-semibold text-white text-sm flex items-center justify-between">
                    <span>{v.name}</span>
                    <span className="text-[11px] text-amber-400 font-mono font-normal">{v.timings}</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">{v.cuisine}</p>
                  {v.breakfast_inclusion && (
                    <p className="text-[11px] text-slate-400 mt-2 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                      💡 {v.breakfast_inclusion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
