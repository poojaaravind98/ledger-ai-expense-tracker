import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface AIInsightBannerProps {
  insightText: string;
}

export const AIInsightBanner: React.FC<AIInsightBannerProps> = ({ insightText }) => {
  return (
    <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-gray-900 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-950/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Live AI Financial Intelligence</h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                Real-Time Analysis
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-1 leading-relaxed">{insightText}</p>
          </div>
        </div>

        <NavLink
          to="/assistant"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
        >
          Ask Assistant <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>
    </div>
  );
};
