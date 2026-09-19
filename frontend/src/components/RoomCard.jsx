import React, { useState } from 'react';
import { Users, Bed, Maximize2, Eye, Check, MessageSquare, Sparkles, Calendar } from 'lucide-react';
import { getRoomImage, HOTEL_IMAGES } from '../data/hotelImages';

export default function RoomCard({ room, nights = 1, onAskAboutRoom, onBookRoom }) {
  const [imgSrc, setImgSrc] = useState(room.image || getRoomImage(room.room_type_id));
  const totalPrice = room.total_price || (room.price_per_night * nights);

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Room Photo */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={imgSrc}
          alt={room.room_name || room.name}
          onError={() => setImgSrc(HOTEL_IMAGES.fallback)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Capacity badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Max {room.capacity} Adults</span>
        </div>

        {/* Room Name on Photo */}
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block mb-0.5">
            Oleria Luxury Suite
          </span>
          <h3 className="font-serif text-xl font-bold text-white tracking-tight drop-shadow-sm">
            {room.room_name || room.name}
          </h3>
        </div>
      </div>

      {/* Room Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {room.description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{room.bed_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{room.size_sqm} m²</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Eye className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{room.view}</span>
            </div>
          </div>

          {/* Amenities Chips */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-amber-50/80 text-amber-950 border border-amber-200/60 px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Check className="w-2.5 h-2.5 text-amber-700" />
                  <span>{amenity}</span>
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center pl-1">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                Nightly Rate
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-bold text-slate-950">
                  ₹{room.price_per_night?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-normal">/ night</span>
              </div>
            </div>
            {nights > 1 && (
              <span className="text-[11px] font-medium text-amber-800 block text-right">
                {nights} nights: ₹{totalPrice?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBookRoom && onBookRoom(room)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Suite (Demo)</span>
            </button>

            <button
              onClick={() => onAskAboutRoom && onAskAboutRoom(room.room_name || room.name)}
              title="Ask AI Concierge about this suite"
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
