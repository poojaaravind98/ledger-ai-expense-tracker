import { prisma } from '../config/prisma';

export class BudgetService {
  async getBudgets(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true, currency: true },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { amount: 'desc' },
    });

    const currentExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
    });

    const categorySpendMap: Record<string, number> = {};
    let totalSpent = 0;

    for (const exp of currentExpenses) {
      categorySpendMap[exp.categoryId] = (categorySpendMap[exp.categoryId] || 0) + exp.amount;
      totalSpent += exp.amount;
    }

    const budgetsWithProgress = budgets.map(b => {
      const spent = b.categoryId ? (categorySpendMap[b.categoryId] || 0) : totalSpent;
      const percentUsed = b.amount > 0 ? parseFloat(((spent / b.amount) * 100).toFixed(1)) : 0;
      const isOverBudget = spent > b.amount;
      const isNearLimit = percentUsed >= b.alertThreshold;

      return {
        ...b,
        spent,
        remaining: Math.max(0, b.amount - spent),
        overspentAmount: isOverBudget ? spent - b.amount : 0,
        percentUsed,
        isOverBudget,
        isNearLimit,
      };
    });

    const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.amount, 0);

    return {
      budgets: budgetsWithProgress,
      summary: {
        totalBudget: totalBudgetLimit,
        totalSpent,
        remainingBudget: Math.max(0, totalBudgetLimit - totalSpent),
        overallPercentUsed: totalBudgetLimit > 0 ? parseFloat(((totalSpent / totalBudgetLimit) * 100).toFixed(1)) : 0,
        monthlyIncome: user?.monthlyIncome || 5000,
        currency: user?.currency || 'USD',
      },
    };
  }

  async createBudget(userId: string, data: {
    categoryId?: string | null;
    amount: number;
    period?: string;
    alertThreshold?: number;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  }) {
    if (data.categoryId) {
      const existing = await prisma.budget.findFirst({
        where: { userId, categoryId: data.categoryId },
      });
      if (existing) {
        throw new Error('A budget for this category already exists. Please update the existing budget.');
      }
    }

    return prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period || 'MONTHLY',
        alertThreshold: data.alertThreshold ?? 80,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: { category: true },
    });
  }

  async updateBudget(userId: string, id: string, data: any) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new Error('Budget not found');
    }

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    return prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async deleteBudget(userId: string, id: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new Error('Budget not found');
    }

    return prisma.budget.delete({
      where: { id },
    });
  }
}

export const budgetService = new BudgetService();
