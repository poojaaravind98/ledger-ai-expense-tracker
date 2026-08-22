import { prisma } from '../../config/prisma';
import { analysisAgent } from './analysisAgent';
import { budgetingAgent } from './budgetingAgent';
import { recommendationsAgent } from './recommendationsAgent';
import { AnalysisAgentOutput, BudgetingAgentOutput, RecommendationsAgentOutput } from '../../types';
import { logger } from '../../utils/logger';

export interface FullAgentWorkflowResult {
  reportId: string;
  userId: string;
  title: string;
  createdAt: Date;
  healthScore: number;
  analysis: AnalysisAgentOutput;
  budgeting: BudgetingAgentOutput;
  recommendations: RecommendationsAgentOutput;
}

export class MultiAgentOrchestrator {
  async runPipeline(userId: string): Promise<FullAgentWorkflowResult> {
    logger.info(`Starting Multi-Agent Workflow for User ${userId}`);

    // 1. Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        categories: true,
        budgets: {
          include: { category: true },
        },
      },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Fetch expenses for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Prepare budget comparison data
    const categorySpendMap: Record<string, number> = {};
    for (const exp of expenses) {
      const catName = exp.category.name;
      categorySpendMap[catName] = (categorySpendMap[catName] || 0) + exp.amount;
    }

    const budgetsData = user.budgets.map(b => ({
      category: b.category ? b.category.name : 'Overall Budget',
      amount: b.amount,
      spent: b.category ? (categorySpendMap[b.category.name] || 0) : totalSpent,
    }));

    // STEP 1: Execute Analysis Agent
    logger.info('Executing Step 1: Analysis Agent');
    const analysisOutput = await analysisAgent.run({
      monthlyIncome: user.monthlyIncome,
      expenses: expenses.map(e => ({
        title: e.title,
        amount: e.amount,
        category: e.category.name,
        date: e.date.toISOString().split('T')[0],
        isRecurring: e.isRecurring,
        merchant: e.merchant || undefined,
      })),
      totalSpent,
    });

    // STEP 2: Execute Budgeting Agent
    logger.info('Executing Step 2: Budgeting Agent');
    const budgetingOutput = await budgetingAgent.run(analysisOutput, budgetsData);

    // STEP 3: Execute Recommendations Agent
    logger.info('Executing Step 3: Recommendations Agent');
    const recommendationsOutput = await recommendationsAgent.run(analysisOutput, budgetingOutput);

    // Persist Report to Database
    const reportTitle = `Financial Optimization Report - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    const savedReport = await prisma.agentReport.create({
      data: {
        userId,
        title: reportTitle,
        status: 'COMPLETED',
        healthScore: budgetingOutput.healthScore,
        analysisSummary: JSON.stringify(analysisOutput),
        budgetAssessment: JSON.stringify(budgetingOutput),
        recommendations: JSON.stringify(recommendationsOutput),
        actionItems: JSON.stringify(recommendationsOutput.strategicActionPlan),
      },
    });

    logger.info(`Multi-Agent Pipeline completed successfully. Report ID: ${savedReport.id}`);

    return {
      reportId: savedReport.id,
      userId,
      title: reportTitle,
      createdAt: savedReport.createdAt,
      healthScore: budgetingOutput.healthScore,
      analysis: analysisOutput,
      budgeting: budgetingOutput,
      recommendations: recommendationsOutput,
    };
  }
}

export const multiAgentOrchestrator = new MultiAgentOrchestrator();
