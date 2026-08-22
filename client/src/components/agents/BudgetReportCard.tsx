import React from 'react';
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BudgetingAgentOutput } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { clsx } from 'clsx';

interface BudgetReportCardProps {
  budgeting: BudgetingAgentOutput;
  currency?: string;
}

export const BudgetReportCard: React.FC<BudgetReportCardProps> = ({ budgeting, currency = 'USD' }) => {
  const { rule50_30_20 } = budgeting;

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Budgeting Agent Assessment</h4>
            <p className="text-[11px] text-gray-400">50/30/20 benchmark adherence & category limits</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
          {budgeting.cashflowVerdict}
        </span>
      </div>

      {/* 50 / 30 / 20 Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Needs (50%) */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Needs (Target 50%)</span>
            <span
              className={clsx(
                'text-[10px] font-bold px-1.5 py-0.2 rounded',
                rule50_30_20?.needs?.status === 'ON_TRACK'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              )}
            >
              {rule50_30_20?.needs?.status === 'ON_TRACK' ? 'On Track' : 'Over Limit'}
            </span>
          </div>
          <p className="text-base font-extrabold text-white">
            {formatCurrency(rule50_30_20?.needs?.amount, currency)}
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, rule50_30_20?.needs?.percentage || 0)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">
            {formatPercentage(rule50_30_20?.needs?.percentage)} of net income
          </span>
        </div>

        {/* Wants (30%) */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Wants (Target 30%)</span>
            <span
              className={clsx(
                'text-[10px] font-bold px-1.5 py-0.2 rounded',
                rule50_30_20?.wants?.status === 'ON_TRACK'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              )}
            >
              {rule50_30_20?.wants?.status === 'ON_TRACK' ? 'On Track' : 'Over Limit'}
            </span>
          </div>
          <p className="text-base font-extrabold text-white">
            {formatCurrency(rule50_30_20?.wants?.amount, currency)}
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, rule50_30_20?.wants?.percentage || 0)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">
            {formatPercentage(rule50_30_20?.wants?.percentage)} of net income
          </span>
        </div>

        {/* Savings (20%) */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Savings (Target 20%)</span>
            <span
              className={clsx(
                'text-[10px] font-bold px-1.5 py-0.2 rounded',
                rule50_30_20?.savings?.status === 'ON_TRACK'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              )}
            >
              {rule50_30_20?.savings?.status === 'ON_TRACK' ? 'Goal Met' : 'Under Goal'}
            </span>
          </div>
          <p className="text-base font-extrabold text-emerald-400">
            {formatCurrency(rule50_30_20?.savings?.amount, currency)}
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, rule50_30_20?.savings?.percentage || 0)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">
            {formatPercentage(rule50_30_20?.savings?.percentage)} savings rate
          </span>
        </div>
      </div>

      {/* Category Health List */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
          Category Health Breakdown:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {budgeting.categoryHealth?.map((cat) => (
            <div key={cat.category} className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-200">{cat.category}</span>
                <span
                  className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded',
                    cat.status === 'SAFE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : cat.status === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  )}
                >
                  {cat.status} ({formatPercentage(cat.percentUsed)})
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className={clsx(
                    'h-1.5 rounded-full',
                    cat.status === 'EXCEEDED'
                      ? 'bg-rose-500'
                      : cat.status === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  )}
                  style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
