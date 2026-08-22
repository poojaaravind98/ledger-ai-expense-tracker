import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ParsedReceiptData {
  isValidReceipt: boolean;
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  category: string;
  taxAmount?: number;
  paymentMethod?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string;
  }>;
  summary?: string;
}

export interface AnalysisAgentOutput {
  period: string;
  totalSpend: number;
  income: number;
  savingsRate: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  spendingVelocity: string;
  anomalies: Array<{ title: string; amount: number; date: string; reason: string }>;
  recurringExpenses: Array<{ merchant: string; amount: number; frequency: string }>;
  monthOverMonthChange: number;
  keyInsights: string[];
}

export interface BudgetingAgentOutput {
  healthScore: number; // 0 - 100
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'CRITICAL';
  rule50_30_20: {
    needs: { amount: number; target: number; percentage: number; status: 'ON_TRACK' | 'OVER_BUDGET' };
    wants: { amount: number; target: number; percentage: number; status: 'ON_TRACK' | 'OVER_BUDGET' };
    savings: { amount: number; target: number; percentage: number; status: 'ON_TRACK' | 'UNDER_TARGET' };
  };
  categoryHealth: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentUsed: number;
    status: 'SAFE' | 'WARNING' | 'EXCEEDED';
  }>;
  projectedRunwayDays: number;
  cashflowVerdict: string;
}

export interface RecommendationsAgentOutput {
  totalPotentialMonthlySavings: number;
  quickWins: Array<{
    title: string;
    description: string;
    estimatedSavings: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    difficulty: 'EASY' | 'MODERATE' | 'HARD';
  }>;
  subscriptionAudit: Array<{
    service: string;
    cost: number;
    recommendation: 'KEEP' | 'CANCEL' | 'DOWNGRADE' | 'ANNUAL_PLAN';
    action: string;
  }>;
  taxOptimizationTips: string[];
  strategicActionPlan: Array<{
    step: number;
    title: string;
    category: string;
    impact: string;
    timeline: string;
  }>;
}
