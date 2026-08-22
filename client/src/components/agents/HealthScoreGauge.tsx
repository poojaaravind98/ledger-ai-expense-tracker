import React from 'react';
import { ShieldCheck, Award, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface HealthScoreGaugeProps {
  score: number;
  rating: string;
  runwayDays?: number;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  rating,
  runwayDays = 120,
}) => {
  const getRatingBadge = () => {
    if (score >= 85) {
      return {
        label: 'EXCELLENT',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: Award,
      };
    }
    if (score >= 70) {
      return {
        label: 'HEALTHY & STABLE',
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        icon: ShieldCheck,
      };
    }
    return {
      label: 'NEEDS ATTENTION',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: AlertTriangle,
    };
  };

  const badge = getRatingBadge();
  const Icon = badge.icon;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#111827] via-[#141C30] to-[#111827] border border-gray-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        {/* Score Number Circle */}
        <div className="relative w-24 h-24 rounded-full bg-gray-900 border-4 border-indigo-500/40 flex flex-col items-center justify-center shadow-glow-brand shrink-0">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">/ 100</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                badge.color
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {rating || badge.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">AI Financial Health Score</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Calculated across spending velocity, 50/30/20 guideline compliance, discretionary volatility, and cash reserves.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-right shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Projected Runway</span>
        <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{runwayDays} Days</p>
        <span className="text-[10px] text-gray-500">at current spend rate</span>
      </div>
    </div>
  );
};
