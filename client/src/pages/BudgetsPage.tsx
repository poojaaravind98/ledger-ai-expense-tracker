import React, { useEffect, useState } from 'react';
import { budgetService, BudgetOverviewResponse } from '../services/budgetService';
import { Budget } from '../types';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { SetBudgetModal } from '../components/budgets/SetBudgetModal';
import { Button } from '../components/common/Button';
import { Target, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Skeleton } from '../components/common/LoadingSkeleton';

export const BudgetsPage: React.FC = () => {
  const [data, setData] = useState<BudgetOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const res = await budgetService.getBudgets();
      setData(res);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await budgetService.deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Budgets & Guardrails</h2>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic threshold ceilings, real-time pacing alerts & monthly limits
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Set Category Budget
        </Button>
      </div>

      {/* Summary Banner */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Budgeted</span>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(data.summary.totalBudget, data.summary.currency)}
            </p>
            <span className="text-[11px] text-gray-500 mt-1">Across all category limits</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Month Total Spent</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">
              {formatCurrency(data.summary.totalSpent, data.summary.currency)}
            </p>
            <span className="text-[11px] text-gray-500 mt-1">
              {formatPercentage(data.summary.overallPercentUsed)} of total budget
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Remaining Buffer</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(data.summary.remainingBudget, data.summary.currency)}
            </p>
            <span className="text-[11px] text-emerald-400/80 mt-1">Safe runway available</span>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : !data || data.budgets.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#111827]/60 border border-gray-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Category Budgets Set</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Set monthly spending targets for categories like Dining, Groceries, or Shopping to receive automated warnings when nearing limits.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            Create First Budget Limit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currency={data.summary.currency}
            />
          ))}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <SetBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBudgets}
        initialBudget={editingBudget}
      />
    </div>
  );
};
