/**
 * Foji Book Center POS - API Service Layer (Pure JavaScript)
 */

export const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000';

export class ApiService {
  static baseUrl = API_BASE_URL;

  static async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('foji_auth_token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network communication error';
      console.warn(`[API Adapter fallback] Express backend at ${url} not connected:`, errorMsg);
      throw err;
    }
  }
}
