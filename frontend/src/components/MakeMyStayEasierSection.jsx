import React from 'react';
import { Sparkles, HeartPulse, UtensilsCrossed, Bed, HelpCircle, ArrowRight, MessageSquare, Bot } from 'lucide-react';

export default function MakeMyStayEasierSection({ onPromptClick }) {
  const features = [
    {
      icon: HeartPulse,
      color: 'from-rose-500/20 to-amber-500/10 text-rose-400 border-rose-500/30',
      badge: 'Gentle Care',
      title: "Not Feeling Well?",
      description: "Our AI provides compassionate care, recommending comforting warm broths, ginger herbal teas, and simple hydration.",
      prompt: "I'm not feeling well. What light food and hot drinks do you recommend for my suite?",
      btnText: "Ask for Gentle Dining"
    },
    {
      icon: UtensilsCrossed,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      badge: 'In-Room Dining',
      title: "Conversational Food Orders",
      description: "Order two hot artisan coffees, warm soup, or desserts straight to Room 502 with live cart calculation and demo checkout.",
      prompt: "Please order two artisan coffees and a warm soup to Room 502",
      btnText: "Order Food by Chat"
    },
    {
      icon: Bed,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
      badge: 'Suite Amenities',
      title: "Housekeeping & Linen",
      description: "Request extra pillows, fresh bath sheets, iron board, or turn-down service delivered in minutes.",
      prompt: "I need 2 extra pillows and fresh towels sent to my room",
      btnText: "Request Pillows & Towels"
    },
    {
      icon: HelpCircle,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'Instant Answers',
      title: "Hotel Knowledge & Policies",
      description: "Ask about breakfast buffet timings, rooftop pool access, checkout hours, or luggage storage rules anytime.",
      prompt: "What are the breakfast buffet timings and pool hours today?",
      btnText: "Check Timings & Rules"
    }
  ];

  return (
    <section className="py-16 bg-slate-900/60 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Concierge Superpowers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Make My Stay Easier
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light">
            Click any intelligent scenario below to interact directly with the <strong>Oleria AI Concierge</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-amber-400/60 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${f.color} border flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {f.description}
                  </p>
                </div>

                <button
                  onClick={() => onPromptClick(f.prompt)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-medium text-xs transition-all flex items-center justify-between group/btn cursor-pointer"
                >
                  <span>{f.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-slate-950 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
