import api from './api';
import { User } from '../types';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
  register: (email: string, password: string, role: 'ADMIN' | 'USER') =>
    api.post('/auth/register', { email, password, role }),
  profile: () => api.get('/auth/profile'),
};