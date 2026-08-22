import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/expenseService';
import { Expense, Category } from '../types';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { ExpenseFilterBar } from '../components/expenses/ExpenseFilterBar';
import { ExpenseFormModal } from '../components/expenses/ExpenseFormModal';
import { ReceiptDetailModal } from '../components/receipts/ReceiptDetailModal';
import { receiptService } from '../services/receiptService';
import { exportExpensesToCsv } from '../utils/exportCsv';
import { Skeleton } from '../components/common/LoadingSkeleton';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getExpenses({
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        limit: 100,
      });
      setExpenses(data.expenses);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    expenseService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, startDate, endDate, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const handleViewReceipt = async (receiptId: string) => {
    try {
      const receipt = await receiptService.getReceiptById(receiptId);
      setViewingReceipt(receipt);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error('Failed to load receipt:', err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Expense Ledger</h2>
          <p className="text-xs text-gray-400 mt-1">
            Complete transaction record, merchant classification & receipt linkages
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <ExpenseFilterBar
        categories={categories}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onReset={handleResetFilters}
        onExportCsv={() => exportExpensesToCsv(expenses)}
        onAddNew={() => {
          setEditingExpense(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3 p-6 rounded-2xl bg-[#111827]/80 border border-gray-800">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <ExpenseTable
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewReceipt={handleViewReceipt}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchExpenses}
        initialExpense={editingExpense}
      />

      <ReceiptDetailModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={viewingReceipt}
      />
    </div>
  );
};
