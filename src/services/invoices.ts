import api from './api';
import { Invoice, PaginatedResponse } from '../types';

export const invoicesService = {
  findAll: (params: { dateFrom?: string; dateTo?: string; clientId?: string; page?: number; limit?: number } = {}) =>
    api.get<PaginatedResponse<Invoice>>('/invoices', { params }),
  findOne: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  generate: (data: { invoices: { clientId: string; communityId?: string }[]; items: { serviceId: string; quantity: number }[]; paymentMethod?: string; notes?: string }) =>
    api.post<Invoice[]>('/invoices', data),
  downloadPdf: (id: string) => `${import.meta.env.VITE_API_URL || '/api'}/invoices/${id}/pdf`,
  remove: (id: string) => api.delete(`/invoices/${id}`),
};