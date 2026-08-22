import React from 'react';
import { Edit2, Trash2, Receipt, ArrowUpDown, Tag, Repeat } from 'lucide-react';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewReceipt?: (receiptId: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  currency?: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onEdit,
  onDelete,
  onViewReceipt,
  sortBy,
  sortOrder,
  onSort,
  currency = 'USD',
}) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900/60 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
            <tr>
              <th
                onClick={() => onSort('date')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Date
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Transaction / Merchant</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Payment</th>
              <th
                onClick={() => onSort('amount')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  Amount
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-center">Receipt</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50 text-gray-300">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 italic">
                  No expense records found. Click "+ Add Expense" or scan a receipt to get started.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-gray-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-medium text-gray-400 whitespace-nowrap">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {exp.title}
                        </p>
                        {exp.merchant && (
                          <p className="text-[11px] text-gray-400">{exp.merchant}</p>
                        )}
                      </div>
                      {exp.isRecurring && (
                        <span
                          title="Recurring monthly charge"
                          className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]"
                        >
                          <Repeat className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                      style={{
                        backgroundColor: `${exp.category?.color || '#6366F1'}15`,
                        color: exp.category?.color || '#6366F1',
                        borderColor: `${exp.category?.color || '#6366F1'}30`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: exp.category?.color || '#6366F1' }}
                      />
                      {exp.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                    {exp.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-white text-sm font-mono">
                    -{formatCurrency(exp.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {exp.receiptId ? (
                      <button
                        onClick={() => onViewReceipt?.(exp.receiptId!)}
                        title="View linked receipt & RAG context"
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(exp)}
                        title="Edit Expense"
                        className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${exp.title}"?`)) {
                            onDelete(exp.id);
                          }
                        }}
                        title="Delete Expense"
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
