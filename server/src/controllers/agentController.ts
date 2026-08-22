import { Response } from 'express';
import { prisma } from '../config/prisma';
import { multiAgentOrchestrator } from '../ai/agents/orchestrator';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AgentController {
  async runWorkflow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await multiAgentOrchestrator.runPipeline(req.user!.id);
      sendSuccess(res, result, 'Multi-Agent Workflow executed successfully');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reports = await prisma.agentReport.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const formatted = reports.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        healthScore: r.healthScore,
        analysis: JSON.parse(r.analysisSummary),
        budgeting: JSON.parse(r.budgetAssessment),
        recommendations: JSON.parse(r.recommendations),
        actionItems: JSON.parse(r.actionItems),
        createdAt: r.createdAt,
      }));

      sendSuccess(res, formatted);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getReportById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const report = await prisma.agentReport.findFirst({
        where: { id: req.params.id, userId: req.user!.id },
      });

      if (!report) {
        sendError(res, 'Report not found', 404);
        return;
      }

      const formatted = {
        id: report.id,
        title: report.title,
        status: report.status,
        healthScore: report.healthScore,
        analysis: JSON.parse(report.analysisSummary),
        budgeting: JSON.parse(report.budgetAssessment),
        recommendations: JSON.parse(report.recommendations),
        actionItems: JSON.parse(report.actionItems),
        createdAt: report.createdAt,
      };

      sendSuccess(res, formatted);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const agentController = new AgentController();
