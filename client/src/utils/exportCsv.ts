import { Expense } from '../types';

export const exportExpensesToCsv = (expenses: Expense[], filename = 'ledger_expenses.csv') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const headers = ['Date', 'Title', 'Merchant', 'Category', 'Amount', 'Currency', 'Payment Method', 'Recurring', 'Notes'];

  const rows = expenses.map(exp => [
    exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
    `"${(exp.title || '').replace(/"/g, '""')}"`,
    `"${(exp.merchant || '').replace(/"/g, '""')}"`,
    `"${(exp.category?.name || 'General').replace(/"/g, '""')}"`,
    exp.amount.toFixed(2),
    exp.currency || 'USD',
    exp.paymentMethod || 'CREDIT_CARD',
    exp.isRecurring ? 'Yes' : 'No',
    `"${(exp.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
