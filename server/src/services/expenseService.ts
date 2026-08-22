import { prisma } from '../config/prisma';

export interface ExpenseFilterParams {
  userId: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ExpenseService {
  async getExpenses(params: ExpenseFilterParams) {
    const {
      userId,
      categoryId,
      startDate,
      endDate,
      search,
      paymentMethod,
      isRecurring,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    const where: any = { userId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (isRecurring !== undefined) {
      where.isRecurring = isRecurring;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { merchant: { contains: search } },
        { notes: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await prisma.expense.count({ where });

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        receipt: {
          select: { id: true, originalName: true, totalAmount: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return {
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExpenseById(userId: string, id: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
        receipt: true,
      },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    return expense;
  }

  async createExpense(userId: string, data: {
    title: string;
    amount: number;
    categoryId: string;
    currency?: string;
    merchant?: string | null;
    date?: string | Date;
    paymentMethod?: string;
    tags?: string | null;
    notes?: string | null;
    isRecurring?: boolean;
    receiptId?: string | null;
  }) {
    // Verify category exists
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
    });

    if (!category) {
      throw new Error('Invalid category selected');
    }

    return prisma.expense.create({
      data: {
        userId,
        title: data.title,
        amount: data.amount,
        categoryId: data.categoryId,
        currency: data.currency || 'USD',
        merchant: data.merchant,
        date: data.date ? new Date(data.date) : new Date(),
        paymentMethod: data.paymentMethod || 'CREDIT_CARD',
        tags: data.tags,
        notes: data.notes,
        isRecurring: data.isRecurring ?? false,
        receiptId: data.receiptId,
      },
      include: {
        category: true,
        receipt: true,
      },
    });
  }

  async updateExpense(userId: string, id: string, data: any) {
    await this.getExpenseById(userId, id);

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
      });
      if (!category) throw new Error('Invalid category selected');
    }

    if (data.date) {
      data.date = new Date(data.date);
    }

    return prisma.expense.update({
      where: { id },
      data,
      include: {
        category: true,
        receipt: true,
      },
    });
  }

  async deleteExpense(userId: string, id: string) {
    await this.getExpenseById(userId, id);
    return prisma.expense.delete({
      where: { id },
    });
  }

  async getCategories(userId: string) {
    return prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(userId: string, data: { name: string; icon?: string; color?: string }) {
    return prisma.category.create({
      data: {
        userId,
        name: data.name,
        icon: data.icon || 'Folder',
        color: data.color || '#6366F1',
        isCustom: true,
      },
    });
  }
}

export const expenseService = new ExpenseService();
