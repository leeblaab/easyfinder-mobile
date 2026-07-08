import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api-client';

const TOKEN_KEY = 'easyfinder_access_token';

export const fileService = {
  /**
   * Uploads an image file to Directus files endpoint
   * @param uri Local URI of the file
   * @param name File name
   * @param type File MIME type
   */
  async uploadFile(uri: string, name: string, type: string): Promise<string> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    const formData = new FormData();
    // In React Native, the file object is constructed with uri, name, type
    formData.append('file', {
      uri,
      name,
      type,
    } as any);

    const baseURL = apiClient.defaults.baseURL || 'https://api.easyfinder.ae';

    const response = await axios.post(`${baseURL}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    // Directus file upload returns data object with ID: response.data.data.id
    if (response.data && response.data.data && response.data.data.id) {
      return response.data.data.id;
    }

    throw new Error('Failed to retrieve file ID from Directus response');
  },
};
