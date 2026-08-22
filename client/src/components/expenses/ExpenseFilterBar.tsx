import React from 'react';
import { Search, Filter, Download, Plus, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';
import { Category } from '../../types';

interface ExpenseFilterBarProps {
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  onReset: () => void;
  onExportCsv: () => void;
  onAddNew: () => void;
}

export const ExpenseFilterBar: React.FC<ExpenseFilterBarProps> = ({
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset,
  onExportCsv,
  onAddNew,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, merchant, notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={onAddNew} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filter:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <span className="text-gray-500">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-500">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {(search || selectedCategory || startDate || endDate) && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors ml-auto text-xs"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
