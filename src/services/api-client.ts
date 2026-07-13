import axios from 'axios';
import { Alert } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.easyfinder.ae';
const DIRECTUS_TOKEN = process.env.EXPO_PUBLIC_DIRECTUS_TOKEN || 'YOUR_STATIC_TOKEN_HERE'; // <-- ADD THIS

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`, // <-- ADD THIS LINE
  },
  timeout: 10000,
});

// Request interceptor for debugging (remove in production)
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', `${config.baseURL}${config.url}`, config.params || {});
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (keep as is)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('API Response Error:', error.response.status, error.response.data);
      if (error.response.status === 429) {
        Alert.alert(
          'Rate Limit Exceeded',
          'You are making too many requests. Please wait a moment.'
        );
      } else if (error.response.status === 403) {
        console.error('Forbidden - Check your Directus permissions and token');
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);