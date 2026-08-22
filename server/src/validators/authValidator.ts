import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string().optional().default('USD'),
  monthlyIncome: z.number().nonnegative().optional().default(5000),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  currency: z.string().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
});
