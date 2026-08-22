import React, { useEffect, useState } from 'react';
import { agentService } from "../services/agentService";
import { AgentReport } from '../types';
import { AgentWorkflowStepper } from '../components/agents/AgentWorkflowStepper';
import { HealthScoreGauge } from '../components/agents/HealthScoreGauge';
import { AnalysisCard } from '../components/agents/AnalysisCard';
import { BudgetReportCard } from '../components/agents/BudgetReportCard';
import { ActionPlanCard } from '../components/agents/ActionPlanCard';
import { Button } from '../components/common/Button';
import { Sparkles, History, Play, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AgentReportsPage: React.FC = () => {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [currentReport, setCurrentReport] = useState<AgentReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stepProgress, setStepProgress] = useState(0); // 0 idle, 1, 2, 3, 4 done
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchReports = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await agentService.getReports();
      setReports(data);
      if (data.length > 0 && !currentReport) {
        setCurrentReport(data[0]);
        setStepProgress(4);
      }
    } catch (err) {
      console.error('Failed to load agent reports:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const runMultiAgentPipeline = async () => {
    setIsRunning(true);
    setStepProgress(1);

    // Visual step progression
    const timer1 = setTimeout(() => setStepProgress(2), 1200);
    const timer2 = setTimeout(() => setStepProgress(3), 2400);

    try {
      const newReport = await agentService.runMultiAgentWorkflow();
      clearTimeout(timer1);
      clearTimeout(timer2);
      setStepProgress(4);
      setCurrentReport(newReport);
      setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error('Multi-Agent Pipeline execution failed:', err);
      alert('Agent pipeline execution failed. Please check server logs.');
      setStepProgress(0);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Multi-Agent Financial Optimizer
            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">
              3-Agent Sequential Orchestration
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Analysis Agent ➔ Budgeting Agent ➔ Recommendations Agent
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reports.length > 1 && (
            <select
              value={currentReport?.id || ''}
              onChange={(e) => {
                const found = reports.find((r) => r.id === e.target.value);
                if (found) {
                  setCurrentReport(found);
                  setStepProgress(4);
                }
              }}
              className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-xs text-gray-300 focus:border-indigo-500 focus:outline-none"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({new Date(r.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}

          <Button
            variant="glow"
            size="md"
            onClick={runMultiAgentPipeline}
            disabled={isRunning}
            isLoading={isRunning}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isRunning ? 'Orchestrating Agents...' : 'Run Multi-Agent Optimization'}
          </Button>
        </div>
      </div>

      {/* 3-Step Agent Workflow Pipeline Visualizer */}
      <AgentWorkflowStepper currentStep={stepProgress} isRunning={isRunning} />

      {/* Report Content */}
      {currentReport ? (
        <div className="space-y-6">
          {/* Health Score Gauge */}
          <HealthScoreGauge
            score={currentReport.healthScore}
            rating={currentReport.budgeting?.rating || 'EXCELLENT'}
            runwayDays={currentReport.budgeting?.projectedRunwayDays || 180}
          />

          {/* Step 1: Analysis Agent Findings */}
          {currentReport.analysis && <AnalysisCard analysis={currentReport.analysis} />}

          {/* Step 2: Budgeting Agent Assessment */}
          {currentReport.budgeting && <BudgetReportCard budgeting={currentReport.budgeting} />}

          {/* Step 3: Recommendations Agent Playbook */}
          {currentReport.recommendations && (
            <ActionPlanCard recommendations={currentReport.recommendations} />
          )}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-2xl bg-[#111827]/60 border border-gray-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Multi-Agent Report Generated Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Launch our 3-Agent pipeline to analyze transactions, compute 50/30/20 budget adherence, and generate prioritized savings actions.
            </p>
          </div>
          <Button variant="glow" size="md" onClick={runMultiAgentPipeline} leftIcon={<Play className="w-4 h-4" />}>
            Run Multi-Agent Optimization Now
          </Button>
        </div>
      )}
    </div>
  );
};
