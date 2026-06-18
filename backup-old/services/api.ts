import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://your-backend.example.com',
  timeout: 15000
});

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
}

// A helper to call APIs with explicit token when needed
export async function fetchWithToken(config) {
  const headers = config.headers || {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return api({ ...config, headers });
}

// Export typed endpoints in future files (printers, orders, users)
