// lib/api/base-api-client.ts
import { config } from '@/config/environment';

// ==================== ERROR HANDLING ====================
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ==================== INTERFACES ====================
export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

// ==================== HELPER FUNCTIONS ====================
export function transformDates<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (obj instanceof Date) {
    return obj as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => transformDates(item)) as any;
  }
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if the key suggests it's a date field
      if ((key === 'createdAt' || key === 'updatedAt' || key === 'lastAccessed' || 
           key === 'lastUpdated' || key === 'startDate' || key === 'endDate' || 
           key === 'lastLogin') && typeof value === 'string') {
        transformed[key] = new Date(value);
      } else {
        transformed[key] = transformDates(value);
      }
    }
    return transformed;
  }
  return obj;
}

// ==================== BASE API CLIENT ====================
export class BaseApiClient {
  protected baseURL: string;
  protected defaultHeaders: HeadersInit;
  protected maxRetries: number;
  protected retryDelay: number;

  constructor(baseURL?: string) {
    const base = baseURL || config.api.baseUrl;
    // Don't automatically append /api - let individual services decide
    this.baseURL = base;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    this.maxRetries = config.client.maxRetries;
    this.retryDelay = config.client.retryDelay;
  }

  // Get auth token from localStorage with better discovery
  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    // First check if we have a token in our standard location
    const standardToken = localStorage.getItem('auth-token');
    if (standardToken && standardToken.trim()) {
      return standardToken;
    }

    // Check common token storage keys in order of preference
    const tokenKeys = [
      'authToken', 
      'accessToken',
      'token',
      'jwt',
      'bearer',
      'access_token'
    ];
    
    // Try direct token keys
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token && token.trim()) {
        // Store it in our standard location for next time
        localStorage.setItem('auth-token', token);
        console.log(`[Auth] Found token under '${key}', copied to 'auth-token'`);
        return token;
      }
    }
    
    // Check for tokens in JSON objects
    const jsonKeys = ['auth', 'user', 'session', 'authentication', 'login', 'auth-storage'];
    for (const key of jsonKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          
          // Check if it's a direct token object
          if (parsed.token || parsed.accessToken || parsed.authToken) {
            const token = parsed.token || parsed.accessToken || parsed.authToken;
            localStorage.setItem('auth-token', token);
            console.log(`[Auth] Found token in '${key}', copied to 'auth-token'`);
            return token;
          }
          
          // Check nested structures (like auth-storage might have state.token)
          if (parsed.state?.token || parsed.state?.accessToken || parsed.state?.authToken) {
            const token = parsed.state.token || parsed.state.accessToken || parsed.state.authToken;
            localStorage.setItem('auth-token', token);
            console.log(`[Auth] Found token in '${key}.state', copied to 'auth-token'`);
            return token;
          }
          
          // Check for user object with token
          if (parsed.user?.token || parsed.user?.accessToken) {
            const token = parsed.user.token || parsed.user.accessToken;
            localStorage.setItem('auth-token', token);
            console.log(`[Auth] Found token in '${key}.user', copied to 'auth-token'`);
            return token;
          }
        } catch {
          // Not JSON or parsing failed, continue
        }
      }
    }
    
    console.warn('[Auth] No authentication token found in localStorage');
    return null;
  }

  // Store auth token in a consistent location
  static setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('auth-token', token);
      console.log('[Auth] Token stored in auth-token');
    }
  }

  // Clear auth token
  static clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      console.log('[Auth] Token cleared from auth-token');
    }
  }

  // Helper method for making requests with retry logic
  protected async requestWithRetry<T>(
    endpoint: string,
    config?: RequestConfig,
    retryCount = 0
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, config);
    } catch (error) {
      if (error instanceof APIError && 
          error.status && 
          error.status >= 500 && 
          retryCount < this.maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount))
        );
        console.log(`[API] Retrying request (${retryCount + 1}/${this.maxRetries}): ${endpoint}`);
        return this.requestWithRetry<T>(endpoint, config, retryCount + 1);
      }
      throw error;
    }
  }

  // Helper method for making requests
  protected async request<T>(
    endpoint: string,
    options?: RequestConfig
  ): Promise<T> {
    const { params, timeout = config?.api?.timeout || 30000, ...fetchConfig } = options || {};
    
    // Build URL - ensure endpoint starts with /api unless it's a full URL
    let fullUrl: string;
    if (endpoint.startsWith('http')) {
      // Full URL provided
      fullUrl = endpoint;
    } else {
      // Relative endpoint - ensure it has /api prefix
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const apiPrefix = cleanEndpoint.startsWith('/api') ? '' : '/api';
      fullUrl = `${this.baseURL}${apiPrefix}${cleanEndpoint}`;
    }
    
    const url = new URL(fullUrl);
    
    // Add query params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Get auth token and add to headers if available
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      ...this.defaultHeaders as Record<string, string>,
      ...fetchConfig.headers as Record<string, string>,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[API] Request with auth token: ${url.pathname}`);
    } else {
      console.warn(`[API] Request without auth token: ${url.pathname}`);
    }

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`[API] ${fetchConfig.method || 'GET'} ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        ...fetchConfig,
        headers,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      console.log(`[API] Response ${response.status}: ${url.pathname}`);

      // Handle response
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        const error = new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
        
        console.error(`[API] Error ${response.status}:`, error.message);
        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`[API] Non-JSON response: ${contentType}`);
        return {} as T;
      }

      const data = await response.json();
      console.log(`[API] Success: ${url.pathname}`, { dataKeys: Object.keys(data || {}) });
      
      // Transform dates in the response
      return transformDates<T>(data);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new APIError('Request timeout', 408, 'TIMEOUT');
          console.error('[API] Timeout:', timeoutError.message);
          throw timeoutError;
        }
        
        // Better error messages for common issues
        if (error.message === 'Failed to fetch') {
          const networkError = new APIError(
            'Cannot connect to server. This might be a CORS issue or the server is not reachable. ' +
            'Make sure your backend server has CORS enabled for your frontend URL.',
            undefined,
            'CORS_OR_NETWORK_ERROR'
          );
          console.error('[API] Network error:', networkError.message);
          throw networkError;
        }
        
        const networkError = new APIError(error.message, undefined, 'NETWORK_ERROR');
        console.error('[API] Network error:', networkError.message);
        throw networkError;
      }
      
      const unknownError = new APIError('Unknown error occurred', undefined, 'UNKNOWN');
      console.error('[API] Unknown error:', unknownError.message);
      throw unknownError;
    }
  }

  // Common utilities
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      return await this.request<{ status: string; version: string }>('/health');
    } catch (error) {
      console.error('[API] Health check failed:', error);
      return { status: 'offline', version: 'unknown' };
    }
  }

  async testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }> {
    try {
      const health = await this.healthCheck();
      return {
        connected: health.status !== 'offline',
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
}