// lib/api/base-client.ts
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
    this.baseURL = `${base}/api`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    this.maxRetries = config.client.maxRetries;
    this.retryDelay = config.client.retryDelay;
  }

  // Get auth token from localStorage
  protected getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
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
    
    // Build URL with query params
    const url = new URL(`${this.baseURL}${endpoint}`);
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
    }

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`API Request: ${url.toString()}`); // Debug logging
      
      const response = await fetch(url.toString(), {
        ...fetchConfig,
        headers,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          errorData.details
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      const data = await response.json();
      
      // Transform dates in the response
      return transformDates<T>(data);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408, 'TIMEOUT');
        }
        
        // Better error messages for common issues
        if (error.message === 'Failed to fetch') {
          throw new APIError(
            'Cannot connect to server. This might be a CORS issue or the server is not reachable. ' +
            'Make sure your backend server has CORS enabled for your frontend URL.',
            undefined,
            'CORS_OR_NETWORK_ERROR'
          );
        }
        
        throw new APIError(error.message, undefined, 'NETWORK_ERROR');
      }
      
      throw new APIError('Unknown error occurred', undefined, 'UNKNOWN');
    }
  }

  // Common utilities
  async healthCheck(): Promise<{ status: string; version: string }> {
    try {
      return await this.request<{ status: string; version: string }>('/health');
    } catch (error) {
      console.error('Health check failed:', error);
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