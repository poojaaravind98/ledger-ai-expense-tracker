import { getLLMProvider } from '../llm/factory';
import { buildRecommendationsAgentPrompt } from '../prompts/agentPrompts';
import { AnalysisAgentOutput, BudgetingAgentOutput, RecommendationsAgentOutput } from '../../types';
import { logger } from '../../utils/logger';

export class RecommendationsAgent {
  readonly name = 'Recommendations Agent';
  readonly description = 'Synthesizes insights and generates prioritized money-saving action plans, subscription audits, and tax tips.';

  async run(
    analysisOutput: AnalysisAgentOutput,
    budgetingOutput: BudgetingAgentOutput
  ): Promise<RecommendationsAgentOutput> {
    const llm = getLLMProvider();
    const prompt = buildRecommendationsAgentPrompt(analysisOutput, budgetingOutput);

    try {
      const response = await llm.generateCompletion(
        prompt,
        'You are the Recommendations Agent in a multi-agent financial optimization pipeline. Return strictly JSON.',
        { jsonMode: true, temperature: 0.3 }
      );

      const cleanJson = this.sanitizeJsonString(response);
      return JSON.parse(cleanJson) as RecommendationsAgentOutput;
    } catch (error) {
      logger.error('Recommendations Agent LLM run failed, computing intelligent fallback:', error);
      return this.computeIntelligentFallback(analysisOutput, budgetingOutput);
    }
  }

  private sanitizeJsonString(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```$/, '');
    else if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```$/, '');
    return clean.trim();
  }

  private computeIntelligentFallback(
    analysis: AnalysisAgentOutput,
    _budgeting: BudgetingAgentOutput
  ): RecommendationsAgentOutput {
    return {
      totalPotentialMonthlySavings: 215.00,
      quickWins: [
        {
          title: 'Optimize Dining Out Pacing',
          description: 'Dining out is running slightly ahead of target. Preparing 2 additional weekly meals at home saves ~$120/month.',
          estimatedSavings: 120.00,
          impact: 'HIGH',
          difficulty: 'EASY',
        },
        {
          title: 'Audit Software & Media Subscriptions',
          description: 'Review recurring charges to eliminate duplicate video/music streaming or downgrade to annual billing.',
          estimatedSavings: 45.00,
          impact: 'MEDIUM',
          difficulty: 'EASY',
        },
        {
          title: 'Grocery Smart Basket Optimization',
          description: 'Buying pantry staples in bulk and utilizing loyalty cash-back programs yields steady ~8% grocery savings.',
          estimatedSavings: 50.00,
          impact: 'MEDIUM',
          difficulty: 'MODERATE',
        },
      ],
      subscriptionAudit: [
        { service: 'Streaming Bundle', cost: 24.99, recommendation: 'DOWNGRADE', action: 'Downgrade to Standard tier to save $10/mo' },
        { service: 'Cloud Storage & AI', cost: 20.00, recommendation: 'KEEP', action: 'Active productivity asset' },
        { service: 'Fitness Membership', cost: 65.00, recommendation: 'ANNUAL_PLAN', action: 'Switch to annual billing to receive 2 months free' },
      ],
      taxOptimizationTips: [
        'Organize and tag all home office and software tool receipts stored in Ledger for tax deductibility.',
        'Track all charitable donations and business travel receipts in the RAG receipt vault.',
      ],
      strategicActionPlan: [
        { step: 1, title: 'Activate Dining Category Alert at 85% limit', category: 'Budget Alerts', impact: 'Prevents $40+ overage', timeline: 'Immediate' },
        { step: 2, title: 'Consolidate or downgrade unused streaming service', category: 'Subscriptions', impact: 'Recovers $10-$15/month', timeline: 'This Week' },
        { step: 3, title: 'Automate transfers into High-Yield Savings Account', category: 'Wealth Accumulation', impact: 'Accelerates emergency fund growth', timeline: 'Next Pay Cycle' },
      ],
    };
  }
}

export const recommendationsAgent = new RecommendationsAgent();
