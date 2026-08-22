import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, error: string, statusCode = 400, details?: unknown): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    details,
  });
};
