import { Response } from 'express';
import { expenseService } from '../services/expenseService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ExpenseController {
  async getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { categoryId, startDate, endDate, search, paymentMethod, isRecurring, minAmount, maxAmount, page, limit, sortBy, sortOrder } = req.query;

      const result = await expenseService.getExpenses({
        userId: req.user!.id,
        categoryId: categoryId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        search: search as string,
        paymentMethod: paymentMethod as string,
        isRecurring: isRecurring !== undefined ? isRecurring === 'true' : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: (sortBy as string) || 'date',
        sortOrder: ((sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc'),
      });

      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getExpenseById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const expense = await expenseService.getExpenseById(req.user!.id, req.params.id);
      sendSuccess(res, expense);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const expense = await expenseService.createExpense(req.user!.id, req.body);
      sendSuccess(res, expense, 'Expense created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const expense = await expenseService.updateExpense(req.user!.id, req.params.id, req.body);
      sendSuccess(res, expense, 'Expense updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await expenseService.deleteExpense(req.user!.id, req.params.id);
      sendSuccess(res, { id: req.params.id }, 'Expense deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categories = await expenseService.getCategories(req.user!.id);
      sendSuccess(res, categories);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const category = await expenseService.createCategory(req.user!.id, req.body);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const expenseController = new ExpenseController();
