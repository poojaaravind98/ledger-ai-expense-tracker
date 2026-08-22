import { apiClient } from '../api/axiosInstance';
import { User } from '../types';

export const authService = {
  async register(data: { email: string; password: string; name: string; currency?: string; monthlyIncome?: number }) {
    const res = await apiClient.post('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data;
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get('/auth/profile');
    return res.data.data;
  },

  async updateProfile(data: { name?: string; currency?: string; monthlyIncome?: number }): Promise<User> {
    const res = await apiClient.put('/auth/profile', data);
    return res.data.data;
  },
};
