import { apiClient } from './api-client';
import { UserProfile } from '../types';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post<{
      data: {
        access_token: string;
        refresh_token: string;
        expires: number;
      };
    }>('/auth/login', {
      email,
      password,
      mode: 'json',
    });
    return response.data.data;
  },

  async register(email: string, password: string, firstName: string) {
    await apiClient.post('/users/register', {
      email,
      password,
      first_name: firstName,
    });
  },

  async fetchMe(token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: UserProfile }>('/users/me', { headers });
    return response.data.data;
  },
};
