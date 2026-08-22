import { Response } from 'express';
import { budgetService } from '../services/budgetService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class BudgetController {
  async getBudgets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await budgetService.getBudgets(req.user!.id);
      sendSuccess(res, data);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async createBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const budget = await budgetService.createBudget(req.user!.id, req.body);
      sendSuccess(res, budget, 'Budget created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const budget = await budgetService.updateBudget(req.user!.id, req.params.id, req.body);
      sendSuccess(res, budget, 'Budget updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await budgetService.deleteBudget(req.user!.id, req.params.id);
      sendSuccess(res, { id: req.params.id }, 'Budget deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const budgetController = new BudgetController();
