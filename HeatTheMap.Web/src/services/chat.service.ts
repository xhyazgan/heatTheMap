import api from './api';
import { ChatRequest, ChatResponse } from '../types';

export const chatService = {
  async sendMessage(query: string, storeId: number): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/api/chat', {
      query,
      storeId,
    } as ChatRequest);
    return response.data;
  },
};
