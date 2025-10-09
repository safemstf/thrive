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
  protected isProd: boolean;
  protected enableHealthCheck: boolean;

  constructor(baseURL?: string) {
    const base = baseURL || config.api.baseUrl;
    this.baseURL = base;

    // Detect production mode from config in a robust way
    // Accept either config.app.env === 'production' or config.app.isProduction boolean
    this.isProd =
      (config && (config.app.env === 'production' || config.app?.isProduction === true)) || false;

    // Enable or disable health checks client-side via config.app.enableHealthCheck (defaults true in dev, false in prod)
    this.enableHealthCheck = typeof config.client?.enableHealthCheck === 'boolean'
      ? config.client!.enableHealthCheck
      : !this.isProd;

    // Default headers: omit the ngrok header for production
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.isProd ? {} : { 'ngrok-skip-browser-warning': 'true' }),
    };

    this.maxRetries = config.client?.maxRetries ?? 2;
    this.retryDelay = config.client?.retryDelay ?? 500; // ms
  }

  // Get auth token from localStorage with better discovery
  // NOTE: In production we avoid mutating localStorage (don't copy tokens into a "standard" key)
  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const tokenKeys = [
      'auth-token', // standard primary key we prefer
      'authToken',
      'accessToken',
      'token',
      'jwt',
      'bearer',
      'access_token'
    ];

    // 1) Try obvious primary key first
    const primary = localStorage.getItem('auth-token');
    if (primary && primary.trim()) {
      return primary;
    }

    // 2) Search other keys; in development we will copy to 'auth-token' for convenience,
    //    but in production we will NOT mutate localStorage — only return whatever we find.
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token && token.trim()) {
        if (!this.isProd && key !== 'auth-token') {
          // help developer experience: persist to canonical key so future reads are easier
          try {
            localStorage.setItem('auth-token', token);
            console.debug(`[Auth] Found token under '${key}', copied to 'auth-token'`);
          } catch {
            // ignore quota/security issues
          }
        }
        return token;
      }
    }

    // 3) Search JSON stores (auth, user, session, etc.)
    const jsonKeys = ['auth', 'user', 'session', 'authentication', 'login', 'auth-storage'];
    for (const key of jsonKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const found =
          parsed?.token || parsed?.accessToken || parsed?.authToken ||
          parsed?.state?.token || parsed?.state?.accessToken || parsed?.state?.authToken ||
          parsed?.user?.token || parsed?.user?.accessToken;
        if (found) {
          if (!this.isProd) {
            try {
              localStorage.setItem('auth-token', found);
              console.debug(`[Auth] Found token in '${key}', copied to 'auth-token'`);
            } catch {
              // ignore
            }
          } else {
            // In production: do not mutate storage; do not log token keys (minimize info leaked to console)
            if (!this.isProd) { /* noop */ }
          }
          return found;
        }
      } catch {
        // not JSON, continue
      }
    }

    // only log a gentle debug/warn in dev — silence in production
    if (!this.isProd) {
      console.warn('[Auth] No authentication token found in localStorage');
    }
    return null;
  }

  // Store auth token in a consistent location (explicit API)
  // In production we still allow setting but keep logs minimal
  static setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && token) {
      try {
        localStorage.setItem('auth-token', token);
        // Only log in non-production
        if (typeof config !== 'undefined' && !(config.app.env === 'production' || config.app?.isProduction)) {
          // eslint-disable-next-line no-console
          console.debug('[Auth] Token stored in auth-token');
        }
      } catch {
        // ignore storage errors silently
      }
    }
  }

  // Clear auth token
  static clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-token');
        if (typeof config !== 'undefined' && !(config.app.env === 'production' || config.app?.isProduction)) {
          // eslint-disable-next-line no-console
          console.debug('[Auth] Token cleared from auth-token');
        }
      } catch {
        // ignore
      }
    }
  }

  // lib/api/base-api-client.ts (replace retry condition)
  protected async requestWithRetry<T>(
    endpoint: string,
    config?: RequestConfig,
    retryCount = 0
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, config);
    } catch (error) {
      // Only retry on transient server errors
      const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);

      if (
        error instanceof APIError &&
        typeof error.status === 'number' &&
        RETRYABLE_STATUS_CODES.has(error.status) &&
        retryCount < this.maxRetries
      ) {
        await new Promise(resolve =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount))
        );
        if (!this.isProd) {
          console.debug(`[API] Retrying request (${retryCount + 1}/${this.maxRetries}): ${endpoint}`);
        }
        return this.requestWithRetry<T>(endpoint, config, retryCount + 1);
      }
      throw error;
    }
  }


  protected async request<T>(
    endpoint: string,
    options?: RequestConfig
  ): Promise<T> {
    const { params, timeout = config?.api?.timeout || 30000, ...fetchConfig } = options || {};

    // Build URL - ensure endpoint starts with /api unless it's a full URL
    let fullUrl: string;
    if (endpoint.startsWith('http')) {
      fullUrl = endpoint;
    } else {
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

    // IMPORTANT: Check if body is FormData
    const isFormData = fetchConfig.body instanceof FormData;

    // Build headers - but exclude Content-Type for FormData
    const headers: Record<string, string> = {};

    if (!isFormData) {
      Object.assign(headers, this.defaultHeaders as Record<string, string>);
    } else {
      const { 'Content-Type': _, ...otherDefaultHeaders } = this.defaultHeaders as Record<string, string>;
      Object.assign(headers, otherDefaultHeaders);
    }

    // Add any custom headers from fetchConfig
    if (fetchConfig.headers) {
      Object.assign(headers, fetchConfig.headers as Record<string, string>);
    }

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      if (!this.isProd) {
        console.debug(`[API] Request with auth token: ${url.pathname}`);
      }
    } else {
      if (!this.isProd) {
        console.warn(`[API] Request without auth token: ${url.pathname}`);
      }
    }

    // Log FormData requests in dev only
    if (isFormData && !this.isProd) {
      console.debug(`[API] FormData request detected, Content-Type header omitted`);
    }

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // In production, avoid printing full URLs (could leak ngrok or internal host). Print path only.
      if (!this.isProd) {
        console.debug(`[API] ${fetchConfig.method || 'GET'} ${url.toString()}`);
      } else {
        console.debug(`[API] ${fetchConfig.method || 'GET'} ${url.pathname}`);
      }

      const response = await fetch(url.toString(), {
        ...fetchConfig,
        headers,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      if (!this.isProd) {
        console.debug(`[API] Response ${response.status}: ${url.pathname}`);
      }

      // Handle response non-ok
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

        if (!this.isProd) {
          console.error(`[API] Error ${response.status}:`, error.message);
        }
        throw error;
      }

      // Handle empty/non-json responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!this.isProd) {
          console.debug(`[API] Non-JSON response: ${contentType}`);
        }
        return {} as T;
      }

      const data = await response.json();

      if (!this.isProd) {
        console.debug(`[API] Success: ${url.pathname}`, { dataKeys: Object.keys(data || {}) });
      }

      return transformDates<T>(data);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new APIError('Request timeout', 408, 'TIMEOUT');
          if (!this.isProd) console.error('[API] Timeout:', timeoutError.message);
          throw timeoutError;
        }

        if (error.message === 'Failed to fetch') {
          const networkError = new APIError(
            'Cannot connect to server. This might be a CORS issue or the server is not reachable. ' +
            'Make sure your backend server has CORS enabled for your frontend URL.',
            undefined,
            'CORS_OR_NETWORK_ERROR'
          );
          if (!this.isProd) console.error('[API] Network error:', networkError.message);
          throw networkError;
        }

        const networkError = new APIError(error.message, undefined, 'NETWORK_ERROR');
        if (!this.isProd) console.error('[API] Network error:', networkError.message);
        throw networkError;
      }

      const unknownError = new APIError('Unknown error occurred', undefined, 'UNKNOWN');
      if (!this.isProd) console.error('[API] Unknown error:', unknownError.message);
      throw unknownError;
    }
  }

  // Common utilities
  async healthCheck(): Promise<{ status: string; version: string }> {
    // Respect enableHealthCheck flag (configured per environment)
    if (!this.enableHealthCheck) {
      if (!this.isProd) console.debug('[API] Health checks are disabled in this environment.');
      return { status: 'unknown', version: 'unknown' };
    }

    try {
      return await this.request<{ status: string; version: string }>('/health');
    } catch (error) {
      if (!this.isProd) console.error('[API] Health check failed:', error);
      // Return an informative fallback; do not throw (caller can decide)
      return { status: 'offline', version: 'unknown' };
    }
  }

  async testConnection(): Promise<{ connected: boolean; baseUrl: string; error?: string }> {
    try {
      const health = await this.healthCheck();
      return {
        connected: health.status !== 'offline' && health.status !== 'unknown',
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
