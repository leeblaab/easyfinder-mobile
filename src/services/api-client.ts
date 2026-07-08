import axios from 'axios';
import { Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.easyfinder.ae'; // Or fall back to local development API if needed

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle global network and security errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      Alert.alert(
        'Rate Limit Exceeded',
        'You are making too many requests. Please wait a moment.'
      );
    }
    return Promise.reject(error);
  }
);
