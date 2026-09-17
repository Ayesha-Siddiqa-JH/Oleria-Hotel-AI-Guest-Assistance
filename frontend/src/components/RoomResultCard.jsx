import React from 'react';
import { Users, Bed, Maximize2, Eye, Check } from 'lucide-react';

export default function RoomResultCard({ room, nights = 1 }) {
  const totalPrice = room.total_price || (room.price_per_night * nights);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-serif font-bold text-slate-900 text-base">{room.room_name}</h4>
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-md shrink-0">
            <Users className="w-3.5 h-3.5" />
            Max {room.capacity}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
          {room.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{room.bed_type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{room.size_sqm} m²</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{room.view}</span>
          </div>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Nightly rate</span>
          <span className="font-serif font-bold text-slate-900 text-base">
            ₹{room.price_per_night?.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500"> / night</span>
        </div>

        {nights > 1 && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total ({nights} nights)</span>
            <span className="font-semibold text-amber-900 text-sm">
              ₹{totalPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
