import { Response } from 'express';
import { receiptService } from '../services/receiptService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class ReceiptController {
  async uploadReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No receipt or statement file provided', 400);
        return;
      }

      const autoCreateExpense = req.body.autoCreateExpense === 'false' ? false : true;
      const result = await receiptService.processAndSaveReceipt(
        req.user!.id,
        req.file,
        autoCreateExpense
      );

      sendSuccess(res, result, 'Receipt processed, parsed and indexed into RAG successfully', 201);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getReceipts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const receipts = await receiptService.getReceipts(req.user!.id);
      sendSuccess(res, receipts);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getReceiptById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const receipt = await receiptService.getReceiptById(req.user!.id, req.params.id);
      sendSuccess(res, receipt);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
  async deleteReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await receiptService.deleteReceipt(req.user!.id, req.params.id);

    sendSuccess(
      res,
      { id: req.params.id },
      'Receipt and associated RAG embeddings removed successfully'
    );
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
}
  async markInvalidReceipt(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      const updated = await receiptService.setInvalidReceipt(req.user!.id, req.params.id, message);
      sendSuccess(res, updated, 'Receipt marked as invalid');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
  
}

export const receiptController = new ReceiptController();
