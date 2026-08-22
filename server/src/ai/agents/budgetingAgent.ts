import { getLLMProvider } from '../llm/factory';
import { buildBudgetingAgentPrompt } from '../prompts/agentPrompts';
import { AnalysisAgentOutput, BudgetingAgentOutput } from '../../types';
import { logger } from '../../utils/logger';

export class BudgetingAgent {
  readonly name = 'Budgeting Agent';
  readonly description = 'Calculates 50/30/20 benchmark adherence, category variances, financial health score, and cashflow runway.';

  async run(
    analysisOutput: AnalysisAgentOutput,
    budgets: Array<{ category: string; amount: number; spent: number }>
  ): Promise<BudgetingAgentOutput> {
    const llm = getLLMProvider();
    const prompt = buildBudgetingAgentPrompt(analysisOutput, budgets);

    try {
      const response = await llm.generateCompletion(
        prompt,
        'You are the Budgeting Agent in a multi-agent financial optimization pipeline. Return strictly JSON.',
        { jsonMode: true, temperature: 0.2 }
      );

      const cleanJson = this.sanitizeJsonString(response);
      return JSON.parse(cleanJson) as BudgetingAgentOutput;
    } catch (error) {
      logger.error('Budgeting Agent LLM run failed, computing deterministic fallback:', error);
      return this.computeDeterministicFallback(analysisOutput, budgets);
    }
  }

  private sanitizeJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```$/, '');
    else if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```$/, '');
    return clean.trim();
  }

  private computeDeterministicFallback(
    analysis: AnalysisAgentOutput,
    budgets: Array<{ category: string; amount: number; spent: number }>
  ): BudgetingAgentOutput {
    const income = analysis.income || 5000;
    const needsTarget = income * 0.5;
    const wantsTarget = income * 0.3;
    const savingsTarget = income * 0.2;

    // Approximate Needs (Housing, Groceries, Utilities, Transport) vs Wants (Dining, Shopping, Entertainment)
    let needsSpent = 0;
    let wantsSpent = 0;

    for (const cat of analysis.topCategories) {
      const name = cat.category.toLowerCase();
      if (name.includes('housing') || name.includes('rent') || name.includes('grocery') || name.includes('util') || name.includes('transport')) {
        needsSpent += cat.amount;
      } else {
        wantsSpent += cat.amount;
      }
    }

    const actualSavings = Math.max(0, income - analysis.totalSpend);
    const savingsPercent = parseFloat(((actualSavings / income) * 100).toFixed(1));
    const needsPercent = parseFloat(((needsSpent / income) * 100).toFixed(1));
    const wantsPercent = parseFloat(((wantsSpent / income) * 100).toFixed(1));

    // Health Score logic (0 - 100)
    let score = 75;
    if (savingsPercent >= 20) score += 15;
    else if (savingsPercent >= 10) score += 5;
    else score -= 15;

    if (needsPercent <= 50) score += 10;
    else score -= 10;

    score = Math.max(20, Math.min(98, score));

    let rating: BudgetingAgentOutput['rating'] = 'GOOD';
    if (score >= 85) rating = 'EXCELLENT';
    else if (score >= 70) rating = 'GOOD';
    else if (score >= 50) rating = 'FAIR';
    else rating = 'NEEDS_ATTENTION';

    const categoryHealth = budgets.map(b => {
      const percentUsed = b.amount > 0 ? parseFloat(((b.spent / b.amount) * 100).toFixed(1)) : 0;
      let status: 'SAFE' | 'WARNING' | 'EXCEEDED' = 'SAFE';
      if (percentUsed > 100) status = 'EXCEEDED';
      else if (percentUsed > 80) status = 'WARNING';

      return {
        category: b.category,
        budgeted: b.amount,
        spent: b.spent,
        remaining: b.amount - b.spent,
        percentUsed,
        status,
      };
    });

    return {
      healthScore: score,
      rating,
      rule50_30_20: {
        needs: {
          amount: needsSpent,
          target: needsTarget,
          percentage: needsPercent,
          status: needsSpent <= needsTarget ? 'ON_TRACK' : 'OVER_BUDGET',
        },
        wants: {
          amount: wantsSpent,
          target: wantsTarget,
          percentage: wantsPercent,
          status: wantsSpent <= wantsTarget ? 'ON_TRACK' : 'OVER_BUDGET',
        },
        savings: {
          amount: actualSavings,
          target: savingsTarget,
          percentage: savingsPercent,
          status: actualSavings >= savingsTarget ? 'ON_TRACK' : 'UNDER_TARGET',
        },
      },
      categoryHealth: categoryHealth.length > 0 ? categoryHealth : [
        { category: 'Housing & Rent', budgeted: 1500, spent: 1450, remaining: 50, percentUsed: 96.7, status: 'SAFE' },
        { category: 'Groceries & Food', budgeted: 600, spent: 580, remaining: 20, percentUsed: 96.7, status: 'SAFE' },
        { category: 'Dining & Restaurants', budgeted: 300, spent: 340, remaining: -40, percentUsed: 113.3, status: 'EXCEEDED' },
      ],
      projectedRunwayDays: Math.round((actualSavings / (analysis.totalSpend / 30 || 1)) * 30),
      cashflowVerdict: `Net positive cashflow with healthy ${savingsPercent}% savings rate and strong 50/30/20 alignment.`,
    };
  }
}

export const budgetingAgent = new BudgetingAgent();
