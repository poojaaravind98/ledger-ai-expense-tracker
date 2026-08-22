import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  glowColor?: 'brand' | 'emerald' | 'purple' | 'none';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeLabel = 'vs last month',
  icon,
  iconBgColor = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  glowColor = 'none',
  onClick,
}) => {
  const isPositive = change !== undefined ? change >= 0 : null;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={clsx(
        'relative p-5 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md transition-all',
        glowColor === 'brand' && 'hover:border-indigo-500/40 hover:shadow-glow-brand',
        glowColor === 'emerald' && 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
        glowColor === 'purple' && 'hover:border-purple-500/40 hover:shadow-glow-purple',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={clsx('p-2.5 rounded-xl', iconBgColor)}>{icon}</div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-md',
                isPositive
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              )}
            >
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500 ml-1">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-gray-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            {subtitle}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
};
