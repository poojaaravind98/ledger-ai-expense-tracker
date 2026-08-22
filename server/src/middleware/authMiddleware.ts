import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required. Please provide a valid token.', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};
