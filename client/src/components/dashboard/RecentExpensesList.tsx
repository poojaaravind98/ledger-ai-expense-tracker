import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RecentExpensesListProps {
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    currency: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    merchant?: string;
    date: string;
    paymentMethod: string;
  }>;
  currency?: string;
}

export const RecentExpensesList: React.FC<RecentExpensesListProps> = ({ expenses, currency = 'USD' }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest recorded expenses</p>
        </div>
        <NavLink
          to="/expenses"
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      <div className="divide-y divide-gray-800/60">
        {expenses.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-6">No recent expenses recorded.</p>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 group">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: `${exp.categoryColor}20`, border: `1px solid ${exp.categoryColor}40` }}
                >
                  <ShoppingBag className="w-4 h-4" style={{ color: exp.categoryColor }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {exp.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {exp.merchant || exp.categoryName} • {formatDate(exp.date)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-white">
                  -{formatCurrency(exp.amount, currency)}
                </p>
                <span className="text-[10px] text-gray-500 uppercase">{exp.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
