import { apiClient } from '../api/axiosInstance';
import { Budget } from '../types';

export interface BudgetOverviewResponse {
  budgets: Budget[];
  summary: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    overallPercentUsed: number;
    monthlyIncome: number;
    currency: string;
  };
}

export const budgetService = {
  async getBudgets(): Promise<BudgetOverviewResponse> {
    const res = await apiClient.get('/budgets');
    return res.data.data;
  },

  async createBudget(data: {
    categoryId?: string | null;
    amount: number;
    period?: string;
    alertThreshold?: number;
  }): Promise<Budget> {
    const res = await apiClient.post('/budgets', data);
    return res.data.data;
  },

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget> {
    const res = await apiClient.put(`/budgets/${id}`, data);
    return res.data.data;
  },

  async deleteBudget(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete(`/budgets/${id}`);
    return res.data.data;
  },
};
