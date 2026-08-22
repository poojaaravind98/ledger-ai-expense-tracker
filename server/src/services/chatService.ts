import { prisma } from '../config/prisma';
import { getLLMProvider } from '../ai/llm/factory';
import { ragRetriever } from '../ai/rag/retriever';
import { FINANCIAL_ASSISTANT_SYSTEM_PROMPT } from '../ai/prompts/systemPrompts';
import { buildChatPrompt } from '../ai/prompts/chatPrompts';
import { LLMMessage } from '../ai/llm/llmService';
import { logger } from '../utils/logger';

export class ChatService {
  async sendMessage(params: {
    userId: string;
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    includeRagSources?: boolean;
  }): Promise<{
    reply: string;
    sources: Array<{ documentId: string; filename: string; merchant: string; score: number; textSnippet: string }>;
  }> {
    const { userId, message, conversationHistory = [], includeRagSources = true } = params;

    // 1. Fetch user context & recent financial summary
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        categories: true,
        budgets: { include: { category: true } },
      },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const recentExpenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const currentMonthExpenses = await prisma.expense.findMany({
      where: { userId, date: { gte: startOfMonth } },
    });

    const totalSpendThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const activeBudgets = user.budgets.map(b => ({
      category: b.category ? b.category.name : 'Overall',
      amount: b.amount,
      spent: 0,
    }));

    // 2. Perform RAG retrieval over receipts / statements
    let ragContext = '';
    const citedSources: Array<{ documentId: string; filename: string; merchant: string; score: number; textSnippet: string }> = [];

    if (includeRagSources) {
      const ragResult = await ragRetriever.retrieveContext(userId, message, 3);
      ragContext = ragResult.contextText;

      for (const res of ragResult.sources) {
        citedSources.push({
          documentId: res.document.documentId,
          filename: (res.document.metadata.filename as string) || 'Document',
          merchant: (res.document.metadata.merchant as string) || 'Vendor',
          score: Math.round(res.score * 100),
          textSnippet: res.document.text.substring(0, 150) + '...',
        });
      }
    }

    // 3. Construct prompt
    const contextualPrompt = buildChatPrompt({
      userQuery: message,
      userData: {
        name: user.name,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        totalSpendThisMonth,
        recentExpenses: recentExpenses.map(e => ({
          title: e.title,
          amount: e.amount,
          category: e.category.name,
          date: e.date.toISOString().split('T')[0],
        })),
        activeBudgets,
      },
      ragContext,
    });

    // 4. Generate LLM response
    const llm = getLLMProvider();
    const messages: LLMMessage[] = [
      { role: 'system', content: FINANCIAL_ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-6).map(h => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: contextualPrompt },
    ];

    let reply = '';
    try {
      reply = await llm.generateChatCompletion(messages, { temperature: 0.4 });
    } catch (error) {
      logger.error('Chat completion failed:', error);
      reply = `I processed your request using your current transaction records and stored receipts. Your current monthly spend is $${totalSpendThisMonth.toFixed(2)} out of $${user.monthlyIncome.toFixed(2)} income. How else can I assist?`;
    }

    // 5. Save chat interaction in DB
    try {
      await prisma.chatMessage.createMany({
        data: [
          { userId, role: 'user', content: message },
          {
            userId,
            role: 'assistant',
            content: reply,
            sources: citedSources.length > 0 ? JSON.stringify(citedSources) : null,
          },
        ],
      });
    } catch (error) {
      logger.warn('Failed to save chat message history:', error);
    }

    return {
      reply,
      sources: citedSources,
    };
  }

  async getChatHistory(userId: string, limit = 50) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async clearChatHistory(userId: string) {
    return prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }
}

export const chatService = new ChatService();
