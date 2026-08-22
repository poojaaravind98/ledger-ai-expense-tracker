import React from 'react';
import { Target, Edit2, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Budget } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { clsx } from 'clsx';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  currency?: string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  currency = 'USD',
}) => {
  const isExceeded = budget.percentUsed > 100;
  const isWarning = budget.percentUsed >= budget.alertThreshold && !isExceeded;

  return (
    <div className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md space-y-4 hover:border-indigo-500/40 transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              backgroundColor: `${budget.category?.color || '#6366F1'}20`,
              border: `1px solid ${budget.category?.color || '#6366F1'}40`,
            }}
          >
            <Target className="w-5 h-5" style={{ color: budget.category?.color || '#6366F1' }} />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
              {budget.category?.name || 'Overall Spending'}
            </h4>
            <p className="text-[11px] text-gray-400">
              Alert at {budget.alertThreshold}% limit • {budget.period.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this budget limit?')) {
                onDelete(budget.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Spent so far:</span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className={isExceeded ? 'text-rose-400' : 'text-white'}>
              {formatCurrency(budget.spent, currency)}
            </span>
            <span className="text-gray-500 font-normal">/ {formatCurrency(budget.amount, currency)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
            )}
            style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
        <span className="text-gray-400">
          {isExceeded ? (
            <strong className="text-rose-400">Over by {formatCurrency(budget.overspentAmount, currency)}</strong>
          ) : (
            <span>{formatCurrency(budget.remaining, currency)} remaining</span>
          )}
        </span>

        <span
          className={clsx(
            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
            isExceeded
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : isWarning
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          )}
        >
          {isExceeded ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          {formatPercentage(budget.percentUsed)}
        </span>
      </div>
    </div>
  );
};
