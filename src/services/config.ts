import api from './api';
import { Company } from '../types';

export interface SequenceResponse {
  nextNumber: number;
}

export const configService = {
  getCompany: () => api.get<Company>('/config/company'),
  updateCompany: (data: Partial<Company>) => api.put<Company>('/config/company', data),
  getSequence: () => api.get<SequenceResponse>('/config/sequence'),
  updateSequence: (lastNumber: number) => api.put('/config/sequence', { lastNumber }),
};