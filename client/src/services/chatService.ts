import { apiClient } from '../api/axiosInstance';
import { ChatMessage, ChatSourceCitation } from '../types';

export interface SendMessageResponse {
  reply: string;
  sources: ChatSourceCitation[];
}

export const chatService = {
  async sendMessage(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
    includeRagSources = true
  ): Promise<SendMessageResponse> {
    const res = await apiClient.post('/chat/message', {
      message,
      conversationHistory,
      includeRagSources,
    });
    return res.data.data;
  },

  async getChatHistory(limit = 50): Promise<ChatMessage[]> {
    const res = await apiClient.get('/chat/history', { params: { limit } });
    return res.data.data;
  },

  async clearChatHistory(): Promise<{ success: boolean }> {
    const res = await apiClient.delete('/chat/history');
    return res.data.data;
  },
};
