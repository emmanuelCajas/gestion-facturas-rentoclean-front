import api from './api';
import { Service } from '../types';

export const servicesService = {
  findAll: () => api.get<Service[]>('/services'),
  findOne: (id: string) => api.get<Service>(`/services/${id}`),
  create: (name: string, price: number) =>
    api.post<Service>('/services', { name, price }),
  update: (id: string, name: string, price: number) =>
    api.put<Service>(`/services/${id}`, { name, price }),
  remove: (id: string) => api.delete(`/services/${id}`),
};