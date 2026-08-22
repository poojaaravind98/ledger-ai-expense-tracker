import React from 'react';
import { DollarSign, Wallet, PiggyBank, PieChart } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface OverviewStatsProps {
  kpis: {
    totalSpentThisMonth: number;
    momChangePercentage: number;
    monthlyIncome: number;
    savingsAmount: number;
    savingsRate: number;
    totalBudget: number;
    currency: string;
    topCategory: { name: string; amount: number; percentage: number };
  };
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        title="Total Spent (Month)"
        value={formatCurrency(kpis.totalSpentThisMonth, kpis.currency)}
        change={kpis.momChangePercentage}
        changeLabel="vs last month"
        icon={<DollarSign className="w-5 h-5" />}
        iconBgColor="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        glowColor="brand"
      />

      <StatCard
        title="Monthly Net Income"
        value={formatCurrency(kpis.monthlyIncome, kpis.currency)}
        subtitle="Expected regular cashflow"
        icon={<Wallet className="w-5 h-5" />}
        iconBgColor="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        glowColor="emerald"
      />

      <StatCard
        title="Savings Rate"
        value={formatPercentage(kpis.savingsRate)}
        subtitle={`${formatCurrency(kpis.savingsAmount, kpis.currency)} surplus`}
        icon={<PiggyBank className="w-5 h-5" />}
        iconBgColor="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
      />

      <StatCard
        title="Top Outlay Category"
        value={kpis.topCategory.name}
        subtitle={`${formatCurrency(kpis.topCategory.amount, kpis.currency)} (${formatPercentage(kpis.topCategory.percentage)})`}
        icon={<PieChart className="w-5 h-5" />}
        iconBgColor="bg-purple-500/10 text-purple-400 border border-purple-500/20"
        glowColor="purple"
      />
    </div>
  );
};
