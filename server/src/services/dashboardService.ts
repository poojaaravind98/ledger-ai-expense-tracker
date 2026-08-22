import { prisma } from '../config/prisma';

export class DashboardService {
  async getDashboardOverview(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyIncome: true, currency: true, name: true },
    });

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Current month expenses
    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfCurrentMonth },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    // Previous month expenses
    const previousMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfPreviousMonth,
          lte: endOfPreviousMonth,
        },
      },
    });

    // Total spend this month and last month
    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSpentLastMonth = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyIncome = user?.monthlyIncome || 5000;
    const savingsAmount = Math.max(0, monthlyIncome - totalSpentThisMonth);
    const savingsRate = monthlyIncome > 0 ? parseFloat(((savingsAmount / monthlyIncome) * 100).toFixed(1)) : 0;

    let momChangePercentage = 0;
    if (totalSpentLastMonth > 0) {
      momChangePercentage = parseFloat((((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) * 100).toFixed(1));
    }

    // Category breakdown
    const categoryMap: Record<string, { name: string; amount: number; color: string; count: number }> = {};
    for (const exp of currentMonthExpenses) {
      const cat = exp.category;
      if (!categoryMap[cat.id]) {
        categoryMap[cat.id] = {
          name: cat.name,
          amount: 0,
          color: cat.color || '#6366F1',
          count: 0,
        };
      }
      categoryMap[cat.id].amount += exp.amount;
      categoryMap[cat.id].count += 1;
    }

    const categoryBreakdown = Object.values(categoryMap)
      .map(c => ({
        ...c,
        amount: parseFloat(c.amount.toFixed(2)),
        percentage: totalSpentThisMonth > 0 ? parseFloat(((c.amount / totalSpentThisMonth) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown[0] || { name: 'None', amount: 0, percentage: 0 };

    // Budgets comparison
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetVsActual = budgets.map(b => {
      const spent = b.categoryId ? (categoryMap[b.categoryId]?.amount || 0) : totalSpentThisMonth;
      return {
        category: b.category ? b.category.name : 'Overall',
        budget: b.amount,
        spent: parseFloat(spent.toFixed(2)),
        remaining: Math.max(0, b.amount - spent),
        color: b.category?.color || '#6366F1',
        percentUsed: b.amount > 0 ? parseFloat(((spent / b.amount) * 100).toFixed(1)) : 0,
      };
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

    // 30-Day Daily Spending Trend
    const dailyTrendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrendMap[dateStr] = 0;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30DaysExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
    });

    for (const exp of last30DaysExpenses) {
      const dateStr = exp.date.toISOString().split('T')[0];
      if (dailyTrendMap[dateStr] !== undefined) {
        dailyTrendMap[dateStr] += exp.amount;
      }
    }

    const spendingTrend = Object.entries(dailyTrendMap).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: parseFloat(amount.toFixed(2)),
    }));

    // Recent transactions (last 6)
    const recentExpenses = currentMonthExpenses.slice(0, 6).map(e => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      currency: e.currency,
      categoryName: e.category.name,
      categoryColor: e.category.color,
      categoryIcon: e.category.icon,
      merchant: e.merchant,
      date: e.date,
      paymentMethod: e.paymentMethod,
    }));

    // AI Dynamic Insight
    let aiInsight = 'You are on track with your monthly budget. Fixed essentials are well balanced against your discretionary outlays.';
    if (savingsRate > 35) {
      aiInsight = `🌟 Exceptional month! Your savings rate is at ${savingsRate}%, exceeding the 20% standard recommended benchmark.`;
    } else if (savingsRate < 15) {
      aiInsight = `⚠️ Heads up: Discretionary spending in ${topCategory.name} is accelerating. Consider trimming non-essentials to preserve your savings buffer.`;
    }

    return {
      kpis: {
        totalSpentThisMonth: parseFloat(totalSpentThisMonth.toFixed(2)),
        totalSpentLastMonth: parseFloat(totalSpentLastMonth.toFixed(2)),
        momChangePercentage,
        monthlyIncome,
        savingsAmount: parseFloat(savingsAmount.toFixed(2)),
        savingsRate,
        totalBudget,
        currency: user?.currency || 'USD',
        topCategory,
        totalTransactions: currentMonthExpenses.length,
      },
      spendingTrend,
      categoryBreakdown,
      budgetVsActual,
      recentExpenses,
      aiInsight,
    };
  }
}

export const dashboardService = new DashboardService();
