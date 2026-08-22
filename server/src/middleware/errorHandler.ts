import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error | any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  logger.error('Unhandled Express error:', err);

  if (err.name === 'MulterError') {
    return sendError(res, `Upload error: ${err.message}`, 400);
  }

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation failed', 422, err.errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};
