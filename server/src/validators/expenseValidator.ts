import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category ID is required'),
  currency: z.string().optional().default('USD'),
  merchant: z.string().optional().nullable(),
  date: z.string().or(z.date()).optional(),
  paymentMethod: z.string().optional().default('CREDIT_CARD'),
  tags: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  receiptId: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
