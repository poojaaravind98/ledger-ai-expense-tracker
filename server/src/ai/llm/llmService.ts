export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateCompletion(
    prompt: string,
    systemPrompt?: string,
    options?: LLMCompletionOptions
  ): Promise<string>;
  generateChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<string>;
}
