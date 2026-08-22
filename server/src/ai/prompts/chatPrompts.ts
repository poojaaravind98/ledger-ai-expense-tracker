export const buildChatPrompt = (params: {
  userQuery: string;
  userData: {
    name: string;
    monthlyIncome: number;
    currency: string;
    totalSpendThisMonth: number;
    recentExpenses: Array<{ title: string; amount: number; category: string; date: string }>;
    activeBudgets: Array<{ category: string; amount: number; spent: number }>;
  };
  ragContext?: string;
}): string => {
  return `
USER CONTEXT:
- Name: ${params.userData.name}
- Net Monthly Income: ${params.userData.currency} ${params.userData.monthlyIncome.toFixed(2)}
- Current Month Total Spent: ${params.userData.currency} ${params.userData.totalSpendThisMonth.toFixed(2)}
- Active Budgets: ${JSON.stringify(params.userData.activeBudgets)}
- Recent Expenses: ${JSON.stringify(params.userData.recentExpenses)}

${
  params.ragContext
    ? `RETRIEVED RECEIPT & FINANCIAL DOCUMENT CONTEXT (RAG):
"""
${params.ragContext}
"""`
    : ''
}

USER QUESTION:
"${params.userQuery}"

Provide a helpful, precise, analytical, and well-structured response.
`.trim();
};
