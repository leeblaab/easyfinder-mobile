import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';
import { apiClient } from '../services/api-client';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const TOKEN_KEY = 'easyfinder_access_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts loading so we can hydrate first

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      
      // Save token securely
      await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
      
      // Configure default api header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      
      // Fetch user profile
      const user = await authService.fetchMe(data.access_token);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email, password, firstName) => {
    set({ isLoading: true });
    try {
      await authService.register(email, password, firstName);
      
      // Automatically login after registration
      const data = await authService.login(email, password);
      
      // Save token securely
      await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
      
      // Configure default api header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      
      // Fetch user profile
      const user = await authService.fetchMe(data.access_token);
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (e) {
      console.warn('Error clearing tokens during logout:', e);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const user = await authService.fetchMe(token);
          set({
            user,
            isAuthenticated: true,
          });
        } catch (fetchError) {
          console.warn('Failed to fetch user profile:', fetchError);
          // Token exists but user fetch failed - clear invalid token
          try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
          } catch (_) {}
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      } else {
        set({
          user: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.warn('Authentication hydration failed:', error);
      // Clean up potentially stale or invalid token
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
      } catch (_) {}
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
