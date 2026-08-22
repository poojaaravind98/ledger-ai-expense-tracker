import { z } from 'zod';

export const sendChatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
  includeRagSources: z.boolean().optional().default(true),
});
