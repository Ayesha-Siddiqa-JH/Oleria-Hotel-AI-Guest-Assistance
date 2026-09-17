import React from 'react';
import { HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  "What time is check-in?",
  "Is breakfast included?",
  "Do you have a pool?",
  "Which room is best for 3 guests?",
  "What is the cancellation policy?",
  "Check room availability",
];

export default function QuickQuestions({ onSelect, disabled }) {
  return (
    <div className="pt-2 pb-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Frequently asked questions:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((query, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(query)}
            className="text-xs bg-white hover:bg-amber-50/80 active:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-full transition-all duration-150 text-left shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
