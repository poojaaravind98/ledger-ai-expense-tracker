import { Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class DashboardController {
  async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const overview = await dashboardService.getDashboardOverview(req.user!.id);
      sendSuccess(res, overview);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const dashboardController = new DashboardController();
