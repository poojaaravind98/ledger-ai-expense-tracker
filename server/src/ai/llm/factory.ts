import { config } from '../../config/env';
import { LLMProvider } from './llmService';
import { OpenAIProvider } from './openaiProvider';
import { ClaudeProvider } from './claudeProvider';
import { MockProvider } from './mockProvider';
import { logger } from '../../utils/logger';

let activeProvider: LLMProvider | null = null;

export const getLLMProvider = (): LLMProvider => {
  if (activeProvider) {
    return activeProvider;
  }

  const requested = config.llmProvider;

  if (requested === 'openai' && config.openaiApiKey) {
    logger.info('Initializing OpenAI LLM Provider');
    activeProvider = new OpenAIProvider(config.openaiApiKey);
    return activeProvider;
  }

  if (requested === 'claude' && config.anthropicApiKey) {
    logger.info('Initializing Anthropic Claude LLM Provider');
    activeProvider = new ClaudeProvider(config.anthropicApiKey);
    return activeProvider;
  }

  // Fallback check if keys are provided even if provider is not explicitly set
  if (config.openaiApiKey) {
    logger.info('Auto-detected OpenAI API key, using OpenAI Provider');
    activeProvider = new OpenAIProvider(config.openaiApiKey);
    return activeProvider;
  }

  if (config.anthropicApiKey) {
    logger.info('Auto-detected Anthropic API key, using Claude Provider');
    activeProvider = new ClaudeProvider(config.anthropicApiKey);
    return activeProvider;
  }

  logger.info('Using Smart Local Intelligent Fallback Provider (No external API key required)');
  activeProvider = new MockProvider();
  return activeProvider;
};
