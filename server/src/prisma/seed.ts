import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_CATEGORIES } from '../config/constants';
import { ragPipeline } from '../ai/rag/ragPipeline';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Ledger AI Expense Tracker...');

  // 1. Create Demo User
  const demoEmail = 'alex@ledger.io';

const existingUser = await prisma.user.findUnique({
  where: { email: demoEmail },
});

if (existingUser) {
  console.log(`👤 Demo user already exists: ${existingUser.email}`);
  console.log('✅ Skipping seed to avoid duplicate demo data.');
  return;
}

const passwordHash = await bcrypt.hash('password123', 10);

const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: 'Alex Vance',
      passwordHash,
      currency: 'USD',
      monthlyIncome: 6500,
    },
  });
  console.log(`👤 Created Demo User: ${user.email} (Password: password123)`);

  // 2. Create Categories
  const categoryRecords: Record<string, any> = {};
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isCustom: false,
      },
    });
    categoryRecords[cat.name] = created;
  }
  console.log(`📁 Created ${Object.keys(categoryRecords).length} default categories`);

  // 3. Create Sample Budgets
  const budgetList = [
    { catName: 'Housing & Rent', amount: 1800, alertThreshold: 90 },
    { catName: 'Groceries & Food', amount: 650, alertThreshold: 80 },
    { catName: 'Dining & Restaurants', amount: 400, alertThreshold: 75 },
    { catName: 'Transportation', amount: 300, alertThreshold: 80 },
    { catName: 'Utilities & Bills', amount: 350, alertThreshold: 85 },
    { catName: 'Subscriptions & Software', amount: 150, alertThreshold: 90 },
    { catName: 'Shopping & Retail', amount: 350, alertThreshold: 70 },
  ];

  for (const b of budgetList) {
    if (categoryRecords[b.catName]) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: categoryRecords[b.catName].id,
          amount: b.amount,
          period: 'MONTHLY',
          alertThreshold: b.alertThreshold,
        },
      });
    }
  }
  console.log(`🎯 Created active category budgets`);

  // 4. Create Sample Expenses over last 30 days
  const now = new Date();
  const sampleExpenses = [
    { title: 'Monthly Apartment Rent', amount: 1750.00, cat: 'Housing & Rent', daysAgo: 20, isRecurring: true, merchant: 'Apex Property Management', paymentMethod: 'BANK_TRANSFER' },
    { title: 'Whole Foods Market Weekly Haul', amount: 164.20, cat: 'Groceries & Food', daysAgo: 18, isRecurring: false, merchant: 'Whole Foods Market', paymentMethod: 'CREDIT_CARD' },
    { title: 'Electric & Gas Utility Bill', amount: 142.50, cat: 'Utilities & Bills', daysAgo: 15, isRecurring: true, merchant: 'City Power & Light', paymentMethod: 'DEBIT_CARD' },
    { title: 'High-Speed Fiber Internet', amount: 79.99, cat: 'Utilities & Bills', daysAgo: 14, isRecurring: true, merchant: 'Metro Fiber', paymentMethod: 'CREDIT_CARD' },
    { title: 'Dinner with Colleagues', amount: 88.50, cat: 'Dining & Restaurants', daysAgo: 12, isRecurring: false, merchant: 'The Rustic Bistro', paymentMethod: 'CREDIT_CARD' },
    { title: 'Trader Joe\'s Grocery Stockup', amount: 92.40, cat: 'Groceries & Food', daysAgo: 10, isRecurring: false, merchant: 'Trader Joe\'s', paymentMethod: 'CREDIT_CARD' },
    { title: 'Uber Ride to Airport', amount: 46.20, cat: 'Transportation', daysAgo: 8, isRecurring: false, merchant: 'Uber Technologies', paymentMethod: 'CREDIT_CARD' },
    { title: 'Cloud Workspace & AI Tools', amount: 35.00, cat: 'Subscriptions & Software', daysAgo: 7, isRecurring: true, merchant: 'OpenAI / Claude Sub', paymentMethod: 'CREDIT_CARD' },
    { title: 'Organic Produce & Coffee', amount: 54.80, cat: 'Groceries & Food', daysAgo: 6, isRecurring: false, merchant: 'Local Farmers Market', paymentMethod: 'DEBIT_CARD' },
    { title: 'Gym & Fitness Membership', amount: 65.00, cat: 'Health & Fitness', daysAgo: 5, isRecurring: true, merchant: 'Equinox Fitness', paymentMethod: 'CREDIT_CARD' },
    { title: 'Streaming Media Bundle', amount: 24.99, cat: 'Subscriptions & Software', daysAgo: 4, isRecurring: true, merchant: 'Netflix & Spotify', paymentMethod: 'CREDIT_CARD' },
    { title: 'Weekend Brunch with Friends', amount: 62.00, cat: 'Dining & Restaurants', daysAgo: 3, isRecurring: false, merchant: 'Sunnyside Cafe', paymentMethod: 'CREDIT_CARD' },
    { title: 'Ergonomic Desk Accessories', amount: 149.00, cat: 'Shopping & Retail', daysAgo: 2, isRecurring: false, merchant: 'Amazon Marketplace', paymentMethod: 'CREDIT_CARD' },
    { title: 'Midweek Quick Lunch', amount: 18.50, cat: 'Dining & Restaurants', daysAgo: 1, isRecurring: false, merchant: 'Chipotle Mexican Grill', paymentMethod: 'CREDIT_CARD' },
  ];

  for (const item of sampleExpenses) {
    const expDate = new Date(now);
    expDate.setDate(expDate.getDate() - item.daysAgo);

    await prisma.expense.create({
      data: {
        userId: user.id,
        title: item.title,
        amount: item.amount,
        categoryId: categoryRecords[item.cat].id,
        currency: 'USD',
        date: expDate,
        merchant: item.merchant,
        paymentMethod: item.paymentMethod,
        isRecurring: item.isRecurring,
        notes: item.isRecurring ? 'Recurring monthly auto-charge' : 'Regular expense',
      },
    });
  }
  console.log(`💳 Created ${sampleExpenses.length} sample expenses across multiple periods`);

  // 5. Create Sample Receipt Document and Ingest to RAG
  const receiptParsed = {
    merchant: 'Whole Foods Market',
    date: new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0],
    totalAmount: 124.50,
    currency: 'USD',
    category: 'Groceries & Food',
    taxAmount: 8.25,
    paymentMethod: 'CREDIT_CARD',
    items: [
      { description: 'Organic Honeycrisp Apples (3 lbs)', quantity: 1, unitPrice: 8.99, totalPrice: 8.99, category: 'Groceries & Food' },
      { description: 'Wild Caught Alaskan Salmon Fillet', quantity: 2, unitPrice: 16.50, totalPrice: 33.00, category: 'Groceries & Food' },
      { description: 'Artisan Sourdough Loaf', quantity: 1, unitPrice: 6.49, totalPrice: 6.49, category: 'Groceries & Food' },
      { description: 'Organic Extra Virgin Olive Oil 750ml', quantity: 1, unitPrice: 18.99, totalPrice: 18.99, category: 'Groceries & Food' },
      { description: 'Almond Milk Unsweetened (Pack of 3)', quantity: 1, unitPrice: 9.99, totalPrice: 9.99, category: 'Groceries & Food' },
      { description: 'Organic Whole Bean Dark Roast Coffee', quantity: 2, unitPrice: 14.99, totalPrice: 29.98, category: 'Groceries & Food' },
    ],
    summary: 'Whole Foods Market grocery receipt with itemized organic produce and seafood.',
  };

  const receiptDoc = await prisma.receiptDocument.create({
    data: {
      userId: user.id,
      filename: 'receipt-wholefoods-mar.pdf',
      originalName: 'WholeFoods_Receipt_March.pdf',
      mimeType: 'application/pdf',
      fileSize: 42800,
      filePath: 'uploads/sample-wholefoods.pdf',
      rawText: `WHOLE FOODS MARKET #10429
DATE: ${receiptParsed.date}
TRANSACTION: 8849-01283
------------------------------------------
ORGANIC HONEYCRISP APPLES 3LB       $8.99
WILD ALASKAN SALMON FILLET (2X)     $33.00
ARTISAN SOURDOUGH LOAF              $6.49
ORGANIC EVOO 750ML                  $18.99
ALMOND MILK UNSWEETENED 3PK         $9.99
ORGANIC DARK ROAST COFFEE (2X)      $29.98
------------------------------------------
SUBTOTAL:                           $107.44
SALES TAX (7.5%):                   $8.25
TOTAL PAID:                         $124.50
VISA ENDING IN **** 4920
AUTH CODE: 092841`,
      status: 'PROCESSED',
      parsedData: JSON.stringify(receiptParsed),
      totalAmount: 124.50,
      currency: 'USD',
      merchant: 'Whole Foods Market',
      invoiceDate: new Date(receiptParsed.date),
    },
  });

  await prisma.receiptItem.createMany({
    data: receiptParsed.items.map(it => ({
      receiptId: receiptDoc.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      category: it.category,
    })),
  });

  await ragPipeline.indexReceipt(user.id, receiptDoc);
  console.log(`🧾 Created sample receipt & ingested vector chunks into RAG`);

  // 6. Create Initial Multi-Agent Report
  const sampleAnalysis = {
    period: 'Current Month',
    totalSpend: 2783.18,
    income: 6500.00,
    savingsRate: 57.2,
    topCategories: [
      { category: 'Housing & Rent', amount: 1750.00, percentage: 62.9 },
      { category: 'Groceries & Food', amount: 311.40, percentage: 11.2 },
      { category: 'Utilities & Bills', amount: 222.49, percentage: 8.0 },
      { category: 'Dining & Restaurants', amount: 169.00, percentage: 6.1 },
      { category: 'Shopping & Retail', amount: 149.00, percentage: 5.4 }
    ],
    spendingVelocity: '$92.77 / day (Extremely disciplined)',
    anomalies: [
      { title: 'Ergonomic Desk Accessories', amount: 149.00, date: new Date().toISOString().split('T')[0], reason: 'One-time home office upgrade' }
    ],
    recurringExpenses: [
      { merchant: 'Apex Property Management', amount: 1750.00, frequency: 'Monthly' },
      { merchant: 'Equinox Fitness', amount: 65.00, frequency: 'Monthly' },
      { merchant: 'Metro Fiber', amount: 79.99, frequency: 'Monthly' },
      { merchant: 'Cloud AI Services', amount: 35.00, frequency: 'Monthly' }
    ],
    monthOverMonthChange: -5.8,
    keyInsights: [
      'Total spending is down 5.8% compared to previous monthly run-rate.',
      'Savings rate of 57.2% significantly outperforms the 20% baseline standard.',
      'Discretionary dining out remained safely below the $400 monthly allocation.'
    ]
  };

  const sampleBudgeting = {
    healthScore: 92,
    rating: 'EXCELLENT',
    rule50_30_20: {
      needs: { amount: 2283.89, target: 3250.00, percentage: 35.1, status: 'ON_TRACK' },
      wants: { amount: 499.29, target: 1950.00, percentage: 7.7, status: 'ON_TRACK' },
      savings: { amount: 3716.82, target: 1300.00, percentage: 57.2, status: 'ON_TRACK' }
    },
    categoryHealth: [
      { category: 'Housing & Rent', budgeted: 1800, spent: 1750, remaining: 50, percentUsed: 97.2, status: 'SAFE' },
      { category: 'Groceries & Food', budgeted: 650, spent: 311.4, remaining: 338.6, percentUsed: 47.9, status: 'SAFE' },
      { category: 'Dining & Restaurants', budgeted: 400, spent: 169, remaining: 231, percentUsed: 42.3, status: 'SAFE' },
      { category: 'Transportation', budgeted: 300, spent: 46.2, remaining: 253.8, percentUsed: 15.4, status: 'SAFE' },
      { category: 'Utilities & Bills', budgeted: 350, spent: 222.49, remaining: 127.51, percentUsed: 63.6, status: 'SAFE' }
    ],
    projectedRunwayDays: 240,
    cashflowVerdict: 'Outstanding financial health score with robust emergency reserve trajectory.'
  };

  const sampleRecommendations = {
    totalPotentialMonthlySavings: 185.00,
    quickWins: [
      {
        title: 'Optimize Fiber Internet Plan',
        description: 'Call Metro Fiber to switch to new promotional tier saving $20/month with identical bandwidth.',
        estimatedSavings: 20.00,
        impact: 'MEDIUM',
        difficulty: 'EASY'
      },
      {
        title: 'Streaming Bundle Consolidation',
        description: 'Pause unused streaming add-ons during summer months.',
        estimatedSavings: 15.00,
        impact: 'LOW',
        difficulty: 'EASY'
      },
      {
        title: 'Switch Fitness Gym to Annual Prepaid',
        description: 'Equinox offers 15% discount on 12-month advance renewal, yielding ~$150 annual savings.',
        estimatedSavings: 12.50,
        impact: 'MEDIUM',
        difficulty: 'EASY'
      }
    ],
    subscriptionAudit: [
      { service: 'Metro Fiber', cost: 79.99, recommendation: 'DOWNGRADE', action: 'Request retention loyalty rate' },
      { service: 'Cloud AI Services', cost: 35.00, recommendation: 'KEEP', action: 'High daily utility' },
      { service: 'Streaming Bundle', cost: 24.99, recommendation: 'ANNUAL_PLAN', action: 'Consolidate plans' }
    ],
    taxOptimizationTips: [
      'Document home office desk accessory purchase ($149) for remote work business deduction.',
      'Log recurring internet bill portion allocable to home business operations.'
    ],
    strategicActionPlan: [
      { step: 1, title: 'Deploy $2,500 surplus to High-Yield Cash Account (4.8% APY)', category: 'Wealth Building', impact: 'Earns ~$120/year passive interest', timeline: 'Immediate' },
      { step: 2, title: 'Set up automated Dining Alert at 80% ceiling', category: 'Budget Guardrails', impact: 'Maintains disciplined trajectory', timeline: 'This Week' },
      { step: 3, title: 'Review tax-advantaged retirement IRA contributions', category: 'Tax Strategy', impact: 'Lowers taxable adjusted gross income', timeline: 'End of Month' }
    ]
  };

  await prisma.agentReport.create({
    data: {
      userId: user.id,
      title: 'Q1 Financial Health & Optimization Report',
      status: 'COMPLETED',
      healthScore: 92,
      analysisSummary: JSON.stringify(sampleAnalysis),
      budgetAssessment: JSON.stringify(sampleBudgeting),
      recommendations: JSON.stringify(sampleRecommendations),
      actionItems: JSON.stringify(sampleRecommendations.strategicActionPlan),
    },
  });
  console.log(`🤖 Created sample multi-agent report`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
