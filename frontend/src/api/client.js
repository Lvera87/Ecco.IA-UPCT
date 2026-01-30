import axios from 'axios';

import { API_BASE_URL } from '@/config/env.js';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecco_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message;
    // Si es 401, podríamos disparar un logout global aquí
    return Promise.reject(new Error(message));
  },
);

export default client;
