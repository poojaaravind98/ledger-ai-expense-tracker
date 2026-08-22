import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { expenseService } from '../../services/expenseService';
import { Category, Expense } from '../../types';
import { PAYMENT_METHODS } from '../../utils/colors';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialExpense?: Expense | null;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
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

      if (initialExpense) {
        setTitle(initialExpense.title);
        setAmount(String(initialExpense.amount));
        setCategoryId(initialExpense.categoryId);
        setMerchant(initialExpense.merchant || '');
        setDate(initialExpense.date ? new Date(initialExpense.date).toISOString().split('T')[0] : '');
        setPaymentMethod(initialExpense.paymentMethod || 'CREDIT_CARD');
        setNotes(initialExpense.notes || '');
        setIsRecurring(initialExpense.isRecurring);
      } else {
        setTitle('');
        setAmount('');
        setMerchant('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('CREDIT_CARD');
        setNotes('');
        setIsRecurring(false);
      }
      setError(null);
    }
  }, [isOpen, initialExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (initialExpense) {
        await expenseService.updateExpense(initialExpense.id, {
          title: title.trim(),
          amount: parseFloat(amount),
          categoryId,
          merchant: merchant.trim() || null,
          date,
          paymentMethod,
          notes: notes.trim() || null,
          isRecurring,
        });
      } else {
        await expenseService.createExpense({
          title: title.trim(),
          amount: parseFloat(amount),
          categoryId,
          merchant: merchant.trim() || null,
          date,
          paymentMethod,
          notes: notes.trim() || null,
          isRecurring,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExpense ? 'Edit Transaction' : 'Record New Expense'}
      description="Track transaction details, merchants, and categories."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Title / Description *</label>
          <input
            type="text"
            required
            placeholder="e.g. Groceries at Whole Foods"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Category *</label>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Merchant / Vendor</label>
            <input
              type="text"
              placeholder="e.g. Amazon, Uber"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CRYPTO">Crypto</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
              />
              <span>Recurring monthly expense</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Notes / Tags (Optional)</label>
          <textarea
            rows={2}
            placeholder="Add any extra details or tax notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            {initialExpense ? 'Update Expense' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
