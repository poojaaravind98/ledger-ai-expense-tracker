import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMMessage, LLMCompletionOptions } from './llmService';
import { logger } from '../../utils/logger';

export class ClaudeProvider implements LLMProvider {
  name = 'Claude';
  private client: Anthropic | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
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
      throw new Error('Anthropic Claude client is not configured');
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt + (options?.jsonMode ? ' Reply strictly with a valid JSON object.' : ''),
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens ?? 2500,
      });

      const block = response.content[0];
      return block.type === 'text' ? block.text : '';
    } catch (error) {
      logger.error('Claude generation error:', error);
      throw error;
    }
  }

  async generateChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic Claude client is not configured');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system')?.content || 'You are an expert AI Financial Assistant.';
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        system: systemMessage + (options?.jsonMode ? ' Reply strictly with a valid JSON object.' : ''),
        messages: chatMessages,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 2500,
      });

      const block = response.content[0];
      return block.type === 'text' ? block.text : '';
    } catch (error) {
      logger.error('Claude chat generation error:', error);
      throw error;
    }
  }
}
