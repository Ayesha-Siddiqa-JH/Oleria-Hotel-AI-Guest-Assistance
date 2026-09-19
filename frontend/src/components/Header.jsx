import React from 'react';
import { Sparkles, Hotel, RotateCcw } from 'lucide-react';

export default function Header({ onResetChat }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/10">
            <Hotel className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900">Oleria Hotel</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                Hotel Guest Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Oleria Hotel Grand Hotel Bengaluru • MG Road
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">AI Concierge</span>
            <span>Online</span>
          </div>

          <button
            onClick={onResetChat}
            title="Reset conversation"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
