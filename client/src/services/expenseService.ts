import { apiClient } from '../api/axiosInstance';
import { Expense, Category } from '../types';

export interface ExpenseQueryParams {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const expenseService = {
  async getExpenses(params: ExpenseQueryParams = {}): Promise<{
    expenses: Expense[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await apiClient.get('/expenses', { params });
    return res.data.data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const res = await apiClient.get(`/expenses/${id}`);
    return res.data.data;
  },

  async createExpense(data: {
    title: string;
    amount: number;
    categoryId: string;
    currency?: string;
    merchant?: string;
    date?: string;
    paymentMethod?: string;
    tags?: string;
    notes?: string;
    isRecurring?: boolean;
    receiptId?: string;
  }): Promise<Expense> {
    const res = await apiClient.post('/expenses', data);
    return res.data.data;
  },

  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    const res = await apiClient.put(`/expenses/${id}`, data);
    return res.data.data;
  },

  async deleteExpense(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete(`/expenses/${id}`);
    return res.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get('/expenses/categories');
    return res.data.data;
  },

  async createCategory(data: { name: string; icon?: string; color?: string }): Promise<Category> {
    const res = await apiClient.post('/expenses/categories', data);
    return res.data.data;
  },
};
