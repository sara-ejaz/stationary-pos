/**
 * Foji Book Center POS - API Service Layer
 * 
 * Boundary Notice: This frontend layer is prepared for future integration with
 * Express.js + MongoDB backend. During this frontend phase, it acts as a deterministic
 * typed data adapter that synchronizes in-memory and local storage state.
 * 
 * When backend is ready: Set `VITE_API_BASE_URL` in .env and switch adapter mode.
 */

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiService {
  private static baseUrl = API_BASE_URL;

  // Placeholder for real HTTP fetch when Express backend is connected
  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('foji_auth_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network communication error';
      console.warn(`[API Adapter fallback] Express backend at ${url} not connected:`, errorMsg);
      throw err;
    }
  }
}
