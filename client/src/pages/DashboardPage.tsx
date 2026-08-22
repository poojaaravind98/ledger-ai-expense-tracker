import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardOverview } from '../types';
import { OverviewStats } from '../components/dashboard/OverviewStats';
import { SpendingAreaChart } from '../components/dashboard/SpendingAreaChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { BudgetVsActualBar } from '../components/dashboard/BudgetVsActualBar';
import { RecentExpensesList } from '../components/dashboard/RecentExpensesList';
import { AIInsightBanner } from '../components/dashboard/AIInsightBanner';
import { DashboardSkeleton } from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';
import { RefreshCw, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverview = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    try {
      const res = await dashboardService.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-gray-400">Failed to load dashboard overview.</p>
        <Button variant="secondary" onClick={() => fetchOverview()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Financial Command Center</h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time analytics, automated receipt intelligence & proactive budgeting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOverview(true)}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>

          <NavLink to="/agent-reports">
            <Button variant="glow" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Run AI Optimizer
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Real-time AI Insight Banner */}
      <AIInsightBanner insightText={data.aiInsight} />

      {/* KPI Stats */}
      <OverviewStats kpis={data.kpis} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingAreaChart data={data.spendingTrend} currency={data.kpis.currency} />
        </div>
        <div>
          <CategoryDonutChart data={data.categoryBreakdown} currency={data.kpis.currency} />
        </div>
      </div>

      {/* Lower Row: Budgets + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetVsActualBar data={data.budgetVsActual} currency={data.kpis.currency} />
        <RecentExpensesList expenses={data.recentExpenses} currency={data.kpis.currency} />
      </div>
    </div>
  );
};
