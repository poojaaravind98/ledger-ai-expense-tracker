import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().optional().nullable(),
  amount: z.number().positive('Budget amount must be greater than 0'),
  period: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY']).default('MONTHLY'),
  alertThreshold: z.number().min(1).max(100).default(80),
  startDate: z.string().or(z.date()).optional().nullable(),
  endDate: z.string().or(z.date()).optional().nullable(),
});

export const updateBudgetSchema = createBudgetSchema.partial();
