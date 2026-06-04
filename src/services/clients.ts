import api from './api';
import { Client, PaginatedResponse } from '../types';

export const clientsService = {
  findAll: (search?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (search && search.trim()) {
      params.search = search;
    }
    return api.get<PaginatedResponse<Client>>('/clients', { params });
  },
  findOne: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Client>('/clients', data),
  update: (id: string, data: Partial<Client>) =>
    api.put<Client>(`/clients/${id}`, data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};