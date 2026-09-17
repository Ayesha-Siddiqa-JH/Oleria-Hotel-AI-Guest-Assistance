import React from 'react';
import { User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import RoomResultCard from './RoomResultCard';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] sm:max-w-[85%] md:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2.5`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-sm ${
          isUser 
            ? 'bg-slate-800 text-white' 
            : isError 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-200" />
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col">
          <div className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
            isUser
              ? 'bg-slate-900 text-white rounded-tr-none'
              : isError
                ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-none'
                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
          }`}>
            {/* Formatted Message Content */}
            <div className="whitespace-pre-line space-y-1.5 font-normal">
              {message.content}
            </div>

            {/* If Availability Results Are Attached */}
            {message.availability && message.availability.available && message.availability.rooms?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Available Rooms ({message.availability.nights} night{message.availability.nights > 1 ? 's' : ''}):
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    Demo availability
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {message.availability.rooms.map((room, idx) => (
                    <RoomResultCard
                      key={idx}
                      room={room}
                      nights={message.availability.nights || 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className={`text-[10px] text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp || 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}
