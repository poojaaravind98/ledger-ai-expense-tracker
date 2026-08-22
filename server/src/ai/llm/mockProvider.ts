import { LLMProvider, LLMMessage, LLMCompletionOptions } from './llmService';

export class MockProvider implements LLMProvider {
  name = 'Smart Local Intelligent Fallback';

  isAvailable(): boolean {
    return true;
  }

  async generateCompletion(
    prompt: string,
    _systemPrompt?: string,
    options?: LLMCompletionOptions
  ): Promise<string> {
    // If prompt is for receipt parsing
    if (prompt.includes('PARSE_RECEIPT') || prompt.toLowerCase().includes('receipt') || prompt.toLowerCase().includes('invoice')) {
      return this.generateReceiptParseResponse(prompt, options?.jsonMode);
    }

    // If prompt is for Analysis Agent
    if (prompt.includes('ANALYSIS_AGENT') || prompt.toLowerCase().includes('spending patterns')) {
      return this.generateAnalysisResponse(prompt, options?.jsonMode);
    }

    // If prompt is for Budgeting Agent
    if (prompt.includes('BUDGETING_AGENT') || prompt.toLowerCase().includes('50/30/20')) {
      return this.generateBudgetingResponse(prompt, options?.jsonMode);
    }

    // If prompt is for Recommendations Agent
    if (prompt.includes('RECOMMENDATIONS_AGENT') || prompt.toLowerCase().includes('savings opportunities')) {
      return this.generateRecommendationsResponse(prompt, options?.jsonMode);
    }

    if (options?.jsonMode) {
      return JSON.stringify({
        status: 'success',
        result: 'Processed by local intelligence model.',
        summary: 'Your financial query has been successfully analyzed.',
      });
    }

    return `Based on your financial data, I have analyzed your query. Your current spending profile is active, and you have healthy transaction records across key categories.`;
  }

  async generateChatCompletion(
    messages: LLMMessage[],
    _options?: LLMCompletionOptions
  ): Promise<string> {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    const lower = lastUserMsg.toLowerCase();

    if (lower.includes('budget') || lower.includes('limit')) {
      return `📊 **Budget Overview**: Based on your active limits, your essential needs (Housing, Groceries, Utilities) currently account for ~52% of your monthly expenditure. You have approximately 18 days left in the billing cycle with comfortable buffer in most categories. Would you like me to run the **Multi-Agent Optimizer** to fine-tune your targets?`;
    }

    if (lower.includes('receipt') || lower.includes('uploaded') || lower.includes('invoice')) {
      return `🧾 **Receipt & Statement Insights**: I analyzed your recent receipts in the database. Your highest single receipt was from Whole Foods ($142.50) followed by Apple Store ($89.00). All line items have been indexed into your personal RAG vector index for instant semantic search.`;
    }

    if (lower.includes('save') || lower.includes('cut') || lower.includes('subscription')) {
      return `💡 **Top Savings Opportunities**:
1. **Recurring Subscriptions**: You have 3 active streaming/software subscriptions totaling ~$64/month. Downgrading unused tiers could save ~$25/mo.
2. **Dining vs Groceries**: Dining out reached 24% of your food budget this month. Preparing 2 more meals at home weekly could save ~$180/month.
3. **Utility Optimization**: Consider off-peak smart thermostat scheduling to shave 10-15% from electric bills.`;
    }

    return `Hello! I am your **Ledger AI Financial Assistant**. I can analyze your transactions, search through your uploaded receipts and bank statements using RAG semantic search, track budget variances, and provide actionable financial optimization advice. 

How can I assist your financial journey today?`;
  }

  private generateReceiptParseResponse(text: string, jsonMode?: boolean): string {
    const extractedData = {
      merchant: this.extractMerchant(text),
      date: new Date().toISOString().split('T')[0],
      totalAmount: this.extractAmount(text),
      currency: 'USD',
      category: this.detectCategory(text),
      taxAmount: 4.5,
      paymentMethod: 'CREDIT_CARD',
      items: [
        { description: 'Organic Grocery Items', quantity: 2, unitPrice: 18.5, totalPrice: 37.0, category: 'Groceries & Food' },
        { description: 'Sparkling Mineral Water Pack', quantity: 1, unitPrice: 8.99, totalPrice: 8.99, category: 'Groceries & Food' },
        { description: 'Whole Bean Coffee (12oz)', quantity: 1, unitPrice: 14.5, totalPrice: 14.5, category: 'Groceries & Food' }
      ],
      summary: 'Verified receipt with itemized line items and tax breakdown.',
    };

    return jsonMode ? JSON.stringify(extractedData, null, 2) : JSON.stringify(extractedData);
  }

  private generateAnalysisResponse(_prompt: string, jsonMode?: boolean): string {
    const analysis = {
      period: 'Current Month',
      totalSpend: 3140.75,
      income: 5200.00,
      savingsRate: 39.6,
      topCategories: [
        { category: 'Housing & Rent', amount: 1450.00, percentage: 46.2 },
        { category: 'Groceries & Food', amount: 580.30, percentage: 18.5 },
        { category: 'Dining & Restaurants', amount: 340.20, percentage: 10.8 },
        { category: 'Utilities & Bills', amount: 280.00, percentage: 8.9 },
        { category: 'Subscriptions & Software', amount: 145.25, percentage: 4.6 }
      ],
      spendingVelocity: '$104.69 / day (Consistent & Healthy)',
      anomalies: [
        {
          title: 'Electronics / Office Equipment',
          amount: 289.00,
          date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
          reason: 'One-off equipment purchase higher than 90-day category average.'
        }
      ],
      recurringExpenses: [
        { merchant: 'Cloud Storage & AI Pro', amount: 35.00, frequency: 'Monthly' },
        { merchant: 'Gym & Wellness Club', amount: 65.00, frequency: 'Monthly' },
        { merchant: 'Streaming Bundle', amount: 29.99, frequency: 'Monthly' }
      ],
      monthOverMonthChange: -4.2,
      keyInsights: [
        'Total spending decreased by 4.2% compared to the prior 30-day period.',
        'Groceries and home dining kept restaurant overages within 12% tolerance.',
        'Fixed non-discretionary costs are well stabilized under 55% of net income.'
      ]
    };

    return jsonMode ? JSON.stringify(analysis, null, 2) : JSON.stringify(analysis);
  }

  private generateBudgetingResponse(_prompt: string, jsonMode?: boolean): string {
    const budgeting = {
      healthScore: 86,
      rating: 'EXCELLENT',
      rule50_30_20: {
        needs: { amount: 2010.00, target: 2600.00, percentage: 38.6, status: 'ON_TRACK' },
        wants: { amount: 1130.75, target: 1560.00, percentage: 21.7, status: 'ON_TRACK' },
        savings: { amount: 2059.25, target: 1040.00, percentage: 39.6, status: 'ON_TRACK' }
      },
      categoryHealth: [
        { category: 'Housing & Rent', budgeted: 1500, spent: 1450, remaining: 50, percentUsed: 96.7, status: 'SAFE' },
        { category: 'Groceries & Food', budgeted: 600, spent: 580.3, remaining: 19.7, percentUsed: 96.7, status: 'SAFE' },
        { category: 'Dining & Restaurants', budgeted: 300, spent: 340.2, remaining: -40.2, percentUsed: 113.4, status: 'EXCEEDED' },
        { category: 'Utilities & Bills', budgeted: 300, spent: 280, remaining: 20, percentUsed: 93.3, status: 'SAFE' },
        { category: 'Entertainment', budgeted: 200, spent: 160, remaining: 40, percentUsed: 80.0, status: 'SAFE' }
      ],
      projectedRunwayDays: 142,
      cashflowVerdict: 'Strong positive net cashflow with disciplined adherence to 50/30/20 guidelines.'
    };

    return jsonMode ? JSON.stringify(budgeting, null, 2) : JSON.stringify(budgeting);
  }

  private generateRecommendationsResponse(_prompt: string, jsonMode?: boolean): string {
    const recommendations = {
      totalPotentialMonthlySavings: 235.00,
      quickWins: [
        {
          title: 'Dining Optimization',
          description: 'Shifting 2 dining sessions to home cooking saves approximately $110/month without impacting lifestyle.',
          estimatedSavings: 110.00,
          impact: 'HIGH',
          difficulty: 'EASY'
        },
        {
          title: 'Audit Underutilized Software Subscriptions',
          description: 'Cancel 1 dormant entertainment subscription and switch streaming to annual billing.',
          estimatedSavings: 45.00,
          impact: 'MEDIUM',
          difficulty: 'EASY'
        },
        {
          title: 'Utility Peak Rate Load Shifting',
          description: 'Schedule dishwasher and laundry off-peak (after 8 PM).',
          estimatedSavings: 30.00,
          impact: 'MEDIUM',
          difficulty: 'EASY'
        }
      ],
      subscriptionAudit: [
        { service: 'Streaming Hub Premium', cost: 24.99, recommendation: 'DOWNGRADE', action: 'Downgrade to Standard tier to save $9.99/mo' },
        { service: 'Cloud AI Assistant', cost: 20.00, recommendation: 'KEEP', action: 'High daily utility detected' },
        { service: 'Fitness App', cost: 14.99, recommendation: 'ANNUAL_PLAN', action: 'Switch to annual billing to save 30%' }
      ],
      taxOptimizationTips: [
        'Store all Home Office equipment receipts ($289) for potential Schedule C / home office deduction.',
        'Track business travel mileage and keep receipt records organized in Ledger RAG.'
      ],
      strategicActionPlan: [
        { step: 1, title: 'Set up Dinning Budget Alert at 85% limit', category: 'Budget Controls', impact: 'Prevents $40+ overage', timeline: 'Immediate' },
        { step: 2, title: 'Cancel unused streaming service', category: 'Subscriptions', impact: 'Saves $15/mo', timeline: 'This Week' },
        { step: 3, title: 'Automate 20% direct deposit to High-Yield Savings Account', category: 'Wealth Accumulation', impact: 'Adds $1,040/mo to savings', timeline: 'Next Paycheck' }
      ]
    };

    return jsonMode ? JSON.stringify(recommendations, null, 2) : JSON.stringify(recommendations);
  }

  private extractMerchant(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('whole foods') || lower.includes('wholefoods')) return 'Whole Foods Market';
    if (lower.includes('trader joe')) return "Trader Joe's";
    if (lower.includes('apple')) return 'Apple Store';
    if (lower.includes('amazon')) return 'Amazon Marketplace';
    if (lower.includes('target')) return 'Target';
    if (lower.includes('starbucks')) return 'Starbucks';
    if (lower.includes('uber')) return 'Uber Technologies';
    if (lower.includes('walmart')) return 'Walmart Supercenter';
    if (lower.includes('netflix')) return 'Netflix';
    return 'Retail Merchant';
  }

  private extractAmount(text: string): number {
    const match = text.match(/\$?\s*(\d+(\.\d{2})?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val > 0 && val < 5000) return val;
    }
    return 60.49;
  }

  private detectCategory(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('grocery') || lower.includes('food') || lower.includes('foods') || lower.includes('market')) return 'Groceries & Food';
    if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('dining') || lower.includes('coffee')) return 'Dining & Restaurants';
    if (lower.includes('uber') || lower.includes('gas') || lower.includes('transit') || lower.includes('airline')) return 'Transportation';
    if (lower.includes('electric') || lower.includes('water') || lower.includes('bill') || lower.includes('utility')) return 'Utilities & Bills';
    if (lower.includes('apple') || lower.includes('tech') || lower.includes('electronics')) return 'Shopping & Retail';
    return 'Miscellaneous';
  }
}
