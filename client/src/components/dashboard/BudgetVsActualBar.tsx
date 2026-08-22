import React from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { clsx } from 'clsx';

interface BudgetVsActualBarProps {
  data: Array<{ category: string; budget: number; spent: number; remaining: number; color: string; percentUsed: number }>;
  currency?: string;
}

export const BudgetVsActualBar: React.FC<BudgetVsActualBarProps> = ({ data, currency = 'USD' }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Active Budget Guardrails</h3>
          <p className="text-xs text-gray-400 mt-0.5">Budget limit utilization & threshold alerts</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4">No active budgets configured.</p>
        ) : (
          data.map((item) => {
            const isExceeded = item.percentUsed > 100;
            const isWarning = item.percentUsed >= 80 && item.percentUsed <= 100;

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-200">{item.category}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{formatCurrency(item.spent, currency)}</span>
                    <span className="text-gray-500">/ {formatCurrency(item.budget, currency)}</span>
                    <span
                      className={clsx(
                        'text-[10px] font-bold px-1.5 py-0.2 rounded ml-1',
                        isExceeded
                          ? 'bg-rose-500/20 text-rose-400'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      )}
                    >
                      {formatPercentage(item.percentUsed)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-500',
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    )}
                    style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
