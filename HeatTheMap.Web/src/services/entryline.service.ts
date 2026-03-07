import api from './api';
import type { EntryLineConfig, CreateEntryLine, UpdateEntryLine } from '../types';

export const entryLineService = {
  async getByStoreId(storeId: number): Promise<EntryLineConfig | null> {
    try {
      const response = await api.get<EntryLineConfig>(`/api/entrylines/store/${storeId}`);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async create(data: CreateEntryLine): Promise<EntryLineConfig> {
    const response = await api.post<EntryLineConfig>('/api/entrylines', data);
    return response.data;
  },

  async update(id: number, data: UpdateEntryLine): Promise<EntryLineConfig> {
    const response = await api.put<EntryLineConfig>(`/api/entrylines/${id}`, data);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/entrylines/${id}`);
  },
};
