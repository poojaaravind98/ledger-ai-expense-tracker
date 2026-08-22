import { Response } from 'express';
import { chatService } from '../services/chatService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ChatController {
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message, conversationHistory, includeRagSources } = req.body;
      const result = await chatService.sendMessage({
        userId: req.user!.id,
        message,
        conversationHistory,
        includeRagSources,
      });

      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await chatService.getChatHistory(req.user!.id, limit);
      sendSuccess(res, history);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async clearChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await chatService.clearChatHistory(req.user!.id);
      sendSuccess(res, { success: true }, 'Chat history cleared');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const chatController = new ChatController();
