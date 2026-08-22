import OpenAI from 'openai';
import { LLMProvider, LLMMessage, LLMCompletionOptions } from './llmService';
import { logger } from '../../utils/logger';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async generateCompletion(
    prompt: string,
    systemPrompt = 'You are an expert AI Financial Analyst.',
    options?: LLMCompletionOptions
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured');
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2000,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('OpenAI generation error:', error);
      throw error;
    }
  }

  async generateChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client is not configured');
    }

    try {
      const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 2000,
        response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('OpenAI chat generation error:', error);
      throw error;
    }
  }
}
