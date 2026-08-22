import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { budgetService } from '../../services/budgetService';
import { expenseService } from '../../services/expenseService';
import { Category, Budget } from '../../types';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialBudget?: Budget | null;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialBudget,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      expenseService.getCategories().then((cats) => {
        setCategories(cats);
        if (!categoryId && cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      });

      if (initialBudget) {
        setCategoryId(initialBudget.categoryId || '');
        setAmount(String(initialBudget.amount));
        setPeriod(initialBudget.period || 'MONTHLY');
        setAlertThreshold(String(initialBudget.alertThreshold || 80));
      } else {
        setAmount('');
        setPeriod('MONTHLY');
        setAlertThreshold('80');
      }
      setError(null);
    }
  }, [isOpen, initialBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      setError('Please provide a budget amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (initialBudget) {
        await budgetService.updateBudget(initialBudget.id, {
          categoryId: categoryId || null,
          amount: parseFloat(amount),
          period,
          alertThreshold: parseFloat(alertThreshold),
        });
      } else {
        await budgetService.createBudget({
          categoryId: categoryId || null,
          amount: parseFloat(amount),
          period,
          alertThreshold: parseFloat(alertThreshold),
        });
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save budget limit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Budget Guardrail' : 'Set Category Budget'}
      description="Define spending limits and alert thresholds for active financial tracking."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Target Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Monthly Spending Limit ($) *</label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="e.g. 500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Alert Threshold (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {initialBudget ? 'Update Budget' : 'Save Budget Limit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
