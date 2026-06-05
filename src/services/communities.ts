import api from './api';
import { Community } from '../types';

export const communitiesService = {
  getAll: async (clientId?: string): Promise<Community[]> => {
    const params = clientId ? `?clientId=${clientId}` : '';
    const response = await api.get(`/communities${params}`);
    return response.data;
  },

  getByClient: async (clientId: string): Promise<Community[]> => {
    const response = await api.get(`/communities/client/${clientId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Community> => {
    const response = await api.get(`/communities/${id}`);
    return response.data;
  },

  create: async (data: { name: string; address: string; clientId: string }): Promise<Community> => {
    const response = await api.post('/communities', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; address?: string }): Promise<Community> => {
    const response = await api.put(`/communities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/communities/${id}`);
  },
};