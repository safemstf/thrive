// lib/api/google-sheets-api-client.ts
/**
 * Google Sheets API Client
 * Connects to Apps Script Web App for serverless auth
 * 
 * Can be used as:
 * 1. Primary backend (no server needed)
 * 2. Fallback when main server is down
 */

import { BaseApiClient, APIError } from './base-api-client';

// ==================== TYPES ====================

export interface GSUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GSAuthResponse {
  token: string;
  user: GSUser;
  message: string;
  expiresAt?: string;
}

export interface GSLoginCredentials {
  usernameOrEmail?: string;
  email?: string;
  username?: string;
  password: string;
}

export interface GSSignupCredentials {
  email: string;
  password: string;
  username: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface GSHealthResponse {
  status: string;
  version: string;
  timestamp?: string;
  service?: string;
}

// ==================== CONFIGURATION ====================

// Your deployed Apps Script Web App URL
// Replace this with your actual deployment URL after deploying
const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVTagAPFGGqI6VFkPBt1U9aiqt7W-k0yROp0_sulcnmH7E9hg9lmf5ZKaVbLEZRhwV/exec';

// Storage key for the token
const TOKEN_KEY = 'gs-auth-token';

// ==================== CLIENT ====================

export class GoogleSheetsApiClient {
  private baseURL: string;
  private isProd: boolean;

  constructor(webAppUrl?: string) {
    this.baseURL = webAppUrl || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_URL || DEFAULT_APPS_SCRIPT_URL;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  // ==================== TOKEN MANAGEMENT ====================

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try our key first
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;
    
    // Fallback to standard auth-token (for compatibility)
    return localStorage.getItem('auth-token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    // Also set standard key for compatibility
    localStorage.setItem('auth-token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('auth-token');
  }

  // ==================== REQUEST HELPER ====================

  private async request<T>(
    action: string,
    payload?: Record<string, any>,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<T> {
    const token = this.getToken();

    try {
      let response: Response;

      if (method === 'GET') {
        // For GET requests, pass action and token as query params
        const params = new URLSearchParams({ action });
        if (token) params.append('token', token);
        
        response = await fetch(`${this.baseURL}?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
      } else {
        // For POST requests, include everything in the body
        // IMPORTANT: Use text/plain to avoid CORS preflight
        // Apps Script can still parse JSON from the body
        const body = {
          action,
          ...(token ? { token } : {}),
          ...payload,
        };

        response = await fetch(this.baseURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
        });
      }

      // Apps Script always returns 200, even for errors
      // We need to check the response body for error field
      const data = await response.json();

      if (data.error) {
        throw new APIError(
          data.message || 'Request failed',
          data.status || 400,
          data.code || 'ERROR'
        );
      }

      if (!this.isProd) {
        console.debug(`[GS-API] ${action}:`, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new APIError(
          error.message,
          undefined,
          'NETWORK_ERROR'
        );
      }

      throw new APIError('Unknown error', undefined, 'UNKNOWN');
    }
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<GSHealthResponse> {
    try {
      return await this.request<GSHealthResponse>('health', {}, 'GET');
    } catch (error) {
      return {
        status: 'offline',
        version: 'unknown',
      };
    }
  }

  async testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }> {
    try {
      const health = await this.healthCheck();
      return {
        connected: health.status === 'ok',
        baseUrl: this.baseURL,
      };
    } catch (error) {
      return {
        connected: false,
        baseUrl: this.baseURL,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== AUTH METHODS ====================

  async login(credentials: GSLoginCredentials): Promise<GSAuthResponse> {
    const response = await this.request<GSAuthResponse>('login', credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async signup(credentials: GSSignupCredentials): Promise<GSAuthResponse> {
    const response = await this.request<GSAuthResponse>('signup', credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await this.request<{ message: string }>('logout');
      return response;
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<GSUser> {
    const response = await this.request<{ user: GSUser }>('me', {}, 'GET');
    return response.user;
  }

  async updateProfile(updates: Partial<GSUser>): Promise<GSUser> {
    const response = await this.request<{ user: GSUser }>('update-profile', updates);
    return response.user;
  }

  async verifyToken(token: string): Promise<GSUser | null> {
    const originalToken = this.getToken();
    
    try {
      this.setToken(token);
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        return null;
      }
      throw error;
    } finally {
      // Restore original token
      if (originalToken) {
        this.setToken(originalToken);
      } else {
        this.clearToken();
      }
    }
  }
}

// ==================== SINGLETON ====================

let gsApiClient: GoogleSheetsApiClient | null = null;

export function getGoogleSheetsApiClient(webAppUrl?: string): GoogleSheetsApiClient {
  if (!gsApiClient) {
    gsApiClient = new GoogleSheetsApiClient(webAppUrl);
  }
  return gsApiClient;
}

// ==================== HYBRID API (with fallback) ====================

/**
 * Creates a hybrid API that tries the main server first,
 * then falls back to Google Sheets if it's down
 */
export function createHybridAuthApi(
  mainApiClient: any, // Your existing ApiClient
  gsApiClient: GoogleSheetsApiClient
) {
  let useGoogleSheets = false;

  return {
    // Check which backend to use
    async initialize(): Promise<'main' | 'sheets'> {
      try {
        const result = await mainApiClient.testConnection();
        if (result.connected) {
          useGoogleSheets = false;
          console.log('[Hybrid API] Using main server');
          return 'main';
        }
      } catch (error) {
        // Main server failed
      }

      // Try Google Sheets
      try {
        const gsResult = await gsApiClient.testConnection();
        if (gsResult.connected) {
          useGoogleSheets = true;
          console.log('[Hybrid API] Using Google Sheets fallback');
          return 'sheets';
        }
      } catch (error) {
        // Both failed
      }

      throw new Error('No backend available');
    },

    // Get current backend
    getBackend(): 'main' | 'sheets' {
      return useGoogleSheets ? 'sheets' : 'main';
    },

    // Auth methods with fallback
    async login(credentials: any) {
      if (useGoogleSheets) {
        return gsApiClient.login(credentials);
      }
      return mainApiClient.auth.login(credentials);
    },

    async signup(credentials: any) {
      if (useGoogleSheets) {
        return gsApiClient.signup(credentials);
      }
      return mainApiClient.auth.signup(credentials);
    },

    async logout() {
      if (useGoogleSheets) {
        return gsApiClient.logout();
      }
      return mainApiClient.auth.logout();
    },

    async getCurrentUser() {
      if (useGoogleSheets) {
        return gsApiClient.getCurrentUser();
      }
      return mainApiClient.auth.getCurrentUser();
    },

    async testConnection() {
      if (useGoogleSheets) {
        return gsApiClient.testConnection();
      }
      return mainApiClient.testConnection();
    },
  };
}

// ==================== CONVENIENCE EXPORT ====================

export const gsApi = {
  health: {
    check: () => getGoogleSheetsApiClient().healthCheck(),
    testConnection: () => getGoogleSheetsApiClient().testConnection(),
  },
  auth: {
    login: (credentials: GSLoginCredentials) => getGoogleSheetsApiClient().login(credentials),
    signup: (credentials: GSSignupCredentials) => getGoogleSheetsApiClient().signup(credentials),
    logout: () => getGoogleSheetsApiClient().logout(),
    getCurrentUser: () => getGoogleSheetsApiClient().getCurrentUser(),
    updateProfile: (updates: Partial<GSUser>) => getGoogleSheetsApiClient().updateProfile(updates),
    verifyToken: (token: string) => getGoogleSheetsApiClient().verifyToken(token),
  },
};

export default gsApi;