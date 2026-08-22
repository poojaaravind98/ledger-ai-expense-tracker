import React, { useState } from 'react';
import { Lightbulb, DollarSign, CheckSquare, Square, ArrowUpRight, Scissors, ShieldAlert } from 'lucide-react';
import { RecommendationsAgentOutput } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { clsx } from 'clsx';

interface ActionPlanCardProps {
  recommendations: RecommendationsAgentOutput;
  currency?: string;
}

export const ActionPlanCard: React.FC<ActionPlanCardProps> = ({ recommendations, currency = 'USD' }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Recommendations Agent Playbook</h4>
            <p className="text-[11px] text-gray-400">Prioritized savings wins, subscription audit & tax advice</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Total Potential Savings</span>
          <p className="text-base font-extrabold text-emerald-400">
            +{formatCurrency(recommendations.totalPotentialMonthlySavings, currency)} / mo
          </p>
        </div>
      </div>

      {/* Quick Wins Cards */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> High-Impact Quick Wins
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.quickWins?.map((win, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white text-xs">{win.title}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    +{formatCurrency(win.estimatedSavings, currency)}/mo
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{win.description}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[10px] text-gray-500">
                <span>Impact: <strong className="text-gray-300">{win.impact}</strong></span>
                <span>•</span>
                <span>Effort: <strong className="text-gray-300">{win.difficulty}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Audit */}
      {recommendations.subscriptionAudit && recommendations.subscriptionAudit.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-indigo-400" /> Subscription & Recurring Audit
          </h5>
          <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-900/40">
            {recommendations.subscriptionAudit.map((sub, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{sub.service}</p>
                  <p className="text-[11px] text-gray-400">{sub.action}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-300">{formatCurrency(sub.cost, currency)}/mo</span>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded border',
                      sub.recommendation === 'KEEP'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : sub.recommendation === 'CANCEL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    )}
                  >
                    {sub.recommendation.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Action Plan Checklist */}
      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> Strategic Action Plan Checklist
        </h5>
        <div className="space-y-2">
          {recommendations.strategicActionPlan?.map((plan) => {
            const isDone = !!completedSteps[plan.step];
            return (
              <div
                key={plan.step}
                onClick={() => toggleStep(plan.step)}
                className={clsx(
                  'flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all text-xs',
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-400 line-through'
                    : 'bg-gray-900/60 hover:bg-gray-900 border-gray-800 text-gray-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <button className="text-indigo-400 focus:outline-none">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <div>
                    <p className="font-semibold text-white">{plan.title}</p>
                    <p className="text-[11px] text-gray-400">
                      {plan.category} • {plan.impact}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                  {plan.timeline}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
