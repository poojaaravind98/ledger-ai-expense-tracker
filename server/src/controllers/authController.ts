import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const authController = new AuthController();
