export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  currency: string;
  monthlyIncome: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  userId?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  category: Category;
  merchant?: string | null;
  date: string;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'OTHER' | string;
  tags?: string | null;
  notes?: string | null;
  isRecurring: boolean;
  receiptId?: string | null;
  receipt?: {
    id: string;
    originalName: string;
    totalAmount: number;
  } | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId?: string | null;
  category?: Category | null;
  amount: number;
  spent: number;
  remaining: number;
  overspentAmount: number;
  percentUsed: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  alertThreshold: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface ReceiptDocument {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  rawText?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  parsedData?: string | null;
  totalAmount?: number | null;
  currency: string;
  merchant?: string | null;
  invoiceDate?: string | null;
  createdAt: string;
  items?: ReceiptItem[];
  expenses?: Expense[];
}

export interface ParsedReceiptData {
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

export interface ChatSourceCitation {
  documentId: string;
  filename: string;
  merchant: string;
  score: number;
  textSnippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: string | null;
  createdAt: string;
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
  healthScore: number;
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

export interface AgentReport {
  id: string;
  title: string;
  status: string;
  healthScore: number;
  analysis: AnalysisAgentOutput;
  budgeting: BudgetingAgentOutput;
  recommendations: RecommendationsAgentOutput;
  actionItems: RecommendationsAgentOutput['strategicActionPlan'];
  createdAt: string;
}

export interface DashboardOverview {
  kpis: {
    totalSpentThisMonth: number;
    totalSpentLastMonth: number;
    momChangePercentage: number;
    monthlyIncome: number;
    savingsAmount: number;
    savingsRate: number;
    totalBudget: number;
    currency: string;
    topCategory: { name: string; amount: number; percentage: number };
    totalTransactions: number;
  };
  spendingTrend: Array<{ date: string; amount: number }>;
  categoryBreakdown: Array<{ name: string; amount: number; color: string; count: number; percentage: number }>;
  budgetVsActual: Array<{ category: string; budget: number; spent: number; remaining: number; color: string; percentUsed: number }>;
  recentExpenses: Array<{
    id: string;
    title: string;
    amount: number;
    currency: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    merchant?: string;
    date: string;
    paymentMethod: string;
  }>;
  aiInsight: string;
}
