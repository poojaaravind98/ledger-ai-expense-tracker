import React from 'react';
import { Activity, AlertCircle, RefreshCw, Zap, TrendingDown } from 'lucide-react';
import { AnalysisAgentOutput } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface AnalysisCardProps {
  analysis: AnalysisAgentOutput;
  currency?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis, currency = 'USD' }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Analysis Agent Findings</h4>
            <p className="text-[11px] text-gray-400">Spending patterns, velocity & anomaly telemetry</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
          {analysis.spendingVelocity}
        </span>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Period Spend</span>
          <p className="text-base font-bold text-white mt-0.5">{formatCurrency(analysis.totalSpend, currency)}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingDown className="w-3 h-3" /> {analysis.monthOverMonthChange}% MoM change
          </span>
        </div>

        <div className="p-3.5 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Calculated Savings Rate</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{formatPercentage(analysis.savingsRate)}</p>
          <span className="text-[10px] text-gray-500 mt-1">Target baseline: 20%</span>
        </div>

        <div className="p-3.5 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Recurring Commitments</span>
          <p className="text-base font-bold text-indigo-300 mt-0.5">{analysis.recurringExpenses?.length || 0} Subscriptions</p>
          <span className="text-[10px] text-gray-500 mt-1">Auto-draft charges</span>
        </div>
      </div>

      {/* Top Categories */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
          Top Spending Distribution:
        </p>
        <div className="space-y-2">
          {analysis.topCategories?.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between text-xs p-2.5 bg-gray-900/40 rounded-xl border border-gray-800/60">
              <span className="font-medium text-gray-200">{cat.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{formatCurrency(cat.amount, currency)}</span>
                <span className="text-gray-500 text-[11px]">({formatPercentage(cat.percentage)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies Detected */}
      {analysis.anomalies && analysis.anomalies.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Spike / Anomaly Detected</span>
          </div>
          {analysis.anomalies.map((anom, idx) => (
            <p key={idx} className="text-amber-200/90 leading-relaxed">
              • <strong>{anom.title}</strong> ({formatCurrency(anom.amount, currency)}) on {anom.date}: {anom.reason}
            </p>
          ))}
        </div>
      )}

      {/* Key Insights List */}
      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1.5">
        <p className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
          <Zap className="w-3.5 h-3.5" /> Agent Insights Summary:
        </p>
        {analysis.keyInsights?.map((insight, idx) => (
          <p key={idx} className="text-gray-300 leading-relaxed">
            • {insight}
          </p>
        ))}
      </div>
    </div>
  );
};
