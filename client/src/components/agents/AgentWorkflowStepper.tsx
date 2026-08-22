import React from 'react';
import { Activity, Target, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface AgentWorkflowStepperProps {
  currentStep: number; // 0 = idle, 1 = analysis, 2 = budgeting, 3 = recommendations, 4 = completed
  isRunning: boolean;
}

export const AgentWorkflowStepper: React.FC<AgentWorkflowStepperProps> = ({
  currentStep,
  isRunning,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Analysis Agent',
      desc: 'Pattern detection & anomaly scan',
      icon: Activity,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      num: 2,
      title: 'Budgeting Agent',
      desc: '50/30/20 & Health scoring',
      icon: Target,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      num: 3,
      title: 'Recommendations Agent',
      desc: 'Savings & strategic action plan',
      icon: Lightbulb,
      color: 'from-purple-500 to-emerald-500',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.num || currentStep === 4;
          const isActive = currentStep === step.num && isRunning;
          const isPending = currentStep < step.num && !isCompleted;

          return (
            <div
              key={step.num}
              className={clsx(
                'relative p-4 rounded-xl border transition-all flex items-start gap-3.5',
                isActive && 'bg-indigo-500/10 border-indigo-500/50 shadow-glow-brand animate-pulse',
                isCompleted && 'bg-emerald-500/5 border-emerald-500/30',
                isPending && 'bg-gray-900/40 border-gray-800 opacity-60'
              )}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xs',
                  isActive && 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md',
                  isCompleted && 'bg-emerald-600',
                  isPending && 'bg-gray-800 text-gray-400'
                )}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Step 0{step.num}</span>
                  {isActive && (
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.2 rounded uppercase">
                      Running
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded uppercase">
                      Done
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5">{step.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
