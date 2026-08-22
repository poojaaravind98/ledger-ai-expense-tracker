export const buildAnalysisAgentPrompt = (data: {
  monthlyIncome: number;
  expenses: Array<{ title: string; amount: number; category: string; date: string; isRecurring: boolean; merchant?: string }>;
  totalSpent: number;
}): string => {
  return `
TASK: ANALYSIS_AGENT
You are Step 1 in the Ledger Multi-Agent Financial Optimization Workflow: The Analysis Agent.
Analyze the user's spending data thoroughly.

INPUT DATA:
- Monthly Net Income: $${data.monthlyIncome.toFixed(2)}
- Total Spend (Current Period): $${data.totalSpent.toFixed(2)}
- Total Transactions: ${data.expenses.length}
- Transaction Sample: ${JSON.stringify(data.expenses.slice(0, 30), null, 2)}

Return a valid JSON object matching this structure:
{
  "period": "Current Month",
  "totalSpend": ${data.totalSpent},
  "income": ${data.monthlyIncome},
  "savingsRate": number (percentage of income saved, e.g. 35.5),
  "topCategories": [
    { "category": "Category Name", "amount": 0.00, "percentage": 0.0 }
  ],
  "spendingVelocity": "e.g. $85.40 / day (Pacing 8% below previous month)",
  "anomalies": [
    { "title": "Anomaly item", "amount": 0.00, "date": "YYYY-MM-DD", "reason": "Explanation" }
  ],
  "recurringExpenses": [
    { "merchant": "Service Name", "amount": 0.00, "frequency": "Monthly" }
  ],
  "monthOverMonthChange": number (-5.2 for 5.2% decrease),
  "keyInsights": [
    "Key analytical observation 1",
    "Key analytical observation 2",
    "Key analytical observation 3"
  ]
}
`.trim();
};

export const buildBudgetingAgentPrompt = (
  analysisOutput: unknown,
  budgets: Array<{ category: string; amount: number; spent: number }>
): string => {
  return `
TASK: BUDGETING_AGENT
You are Step 2 in the Ledger Multi-Agent Financial Optimization Workflow: The Budgeting Agent.
Using the output from the Analysis Agent, evaluate budget health, benchmark against the 50/30/20 framework, and compute financial health metrics.

ANALYSIS AGENT FINDINGS:
${JSON.stringify(analysisOutput, null, 2)}

ACTIVE BUDGET LIMITS:
${JSON.stringify(budgets, null, 2)}

Return a valid JSON object matching this structure:
{
  "healthScore": number (0 to 100 integer representing overall financial health),
  "rating": "EXCELLENT" | "GOOD" | "FAIR" | "NEEDS_ATTENTION" | "CRITICAL",
  "rule50_30_20": {
    "needs": { "amount": 0.00, "target": 0.00, "percentage": 0.0, "status": "ON_TRACK" | "OVER_BUDGET" },
    "wants": { "amount": 0.00, "target": 0.00, "percentage": 0.0, "status": "ON_TRACK" | "OVER_BUDGET" },
    "savings": { "amount": 0.00, "target": 0.00, "percentage": 0.0, "status": "ON_TRACK" | "UNDER_TARGET" }
  },
  "categoryHealth": [
    {
      "category": "Category name",
      "budgeted": 0.00,
      "spent": 0.00,
      "remaining": 0.00,
      "percentUsed": 0.0,
      "status": "SAFE" | "WARNING" | "EXCEEDED"
    }
  ],
  "projectedRunwayDays": number (days of living expenses covered),
  "cashflowVerdict": "Summary of cashflow health and budget compliance"
}
`.trim();
};

export const buildRecommendationsAgentPrompt = (
  analysisOutput: unknown,
  budgetingOutput: unknown
): string => {
  return `
TASK: RECOMMENDATIONS_AGENT
You are Step 3 in the Ledger Multi-Agent Financial Optimization Workflow: The Recommendations Agent.
Synthesize the outputs from both the Analysis Agent and the Budgeting Agent to generate high-impact, prioritized, and personalized recommendations.

ANALYSIS OUTPUT:
${JSON.stringify(analysisOutput, null, 2)}

BUDGETING OUTPUT:
${JSON.stringify(budgetingOutput, null, 2)}

Return a valid JSON object matching this structure:
{
  "totalPotentialMonthlySavings": number (sum of actionable quick wins),
  "quickWins": [
    {
      "title": "Title of action",
      "description": "Clear rationale and specific action to take",
      "estimatedSavings": 0.00,
      "impact": "HIGH" | "MEDIUM" | "LOW",
      "difficulty": "EASY" | "MODERATE" | "HARD"
    }
  ],
  "subscriptionAudit": [
    {
      "service": "Name of service",
      "cost": 0.00,
      "recommendation": "KEEP" | "CANCEL" | "DOWNGRADE" | "ANNUAL_PLAN",
      "action": "Specific optimization tip"
    }
  ],
  "taxOptimizationTips": [
    "Tax deductible or credit recommendation 1",
    "Tax deductible or credit recommendation 2"
  ],
  "strategicActionPlan": [
    {
      "step": 1,
      "title": "Action title",
      "category": "Category",
      "impact": "Description of impact",
      "timeline": "e.g. Immediate / This Month / Next Quarter"
    }
  ]
}
`.trim();
};
