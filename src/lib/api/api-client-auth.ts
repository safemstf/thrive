// lib/api/api-client-auth.ts
import { BaseApiClient, APIError } from './base-api-client';
import {
  LoginCredentials,
  AuthResponse,
  User
} from '@/types/auth.types';

// Updated signup credentials to match backend
export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Auth API interface
export interface AuthAPI {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  signup(credentials: SignupCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  updateProfile(updates: Partial<User>): Promise<User>;
  refreshToken(): Promise<AuthResponse>;
  verifyToken(token: string): Promise<User | null>;
}

export class AuthApiClient extends BaseApiClient implements AuthAPI {
  // Add constructor to accept baseURL
  constructor(baseURL?: string) {
    super(baseURL);
  }

  // LOGIN
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const payload = {
      // prefer an explicit usernameOrEmail if provided, fallback to email or username
      usernameOrEmail: (credentials as any).usernameOrEmail ?? credentials.email ?? (credentials as any).username,
      password: credentials.password
    };

    const response = await this.requestWithRetry<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Persist token via BaseApiClient helper (keeps discovery consistent)
    if (response.token) {
      // use static helper on BaseApiClient so existing discovery/logging remains consistent
      BaseApiClient.setAuthToken(response.token);
      // DO NOT console.log the token or token value
    }

    return response;
  }

  // SIGNUP
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await this.requestWithRetry<AuthResponse>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      BaseApiClient.setAuthToken(response.token);
    }

    return response;
  }

  // LOGOUT
  async logout(): Promise<void> {
    try {
      await this.requestWithRetry<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Use BaseApiClient helper to clear token
      BaseApiClient.clearAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.requestWithRetry<{ user: User }>('/auth/me');
    return response.user;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.requestWithRetry<{ user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.user;
  }

  async refreshToken(): Promise<AuthResponse> {
    // Your backend doesn't seem to have a refresh endpoint
    // For now, just return current token
    const token = this.getAuthToken();
    if (!token) {
      throw new APIError('No token to refresh', 401, 'NO_TOKEN');
    }

    // Verify token is still valid by getting current user
    const user = await this.getCurrentUser();
    return { token, user, message: 'Token refreshed' };
  }

  async verifyToken(token: string): Promise<User | null> {
    // Save original token via base discovery
    const originalToken = super.getAuthToken() ?? null;
    try {
      // Use base helper to set the test token
      BaseApiClient.setAuthToken(token);
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) return null;
      throw error;
    } finally {
      // restore previous token (or clear)
      if (originalToken) {
        BaseApiClient.setAuthToken(originalToken);
      } else {
        BaseApiClient.clearAuthToken();
      }
    }
  }

}

// Singleton for auth API
let authApiClient: AuthApiClient;

export function getAuthApiClient(baseURL?: string): AuthApiClient {
  if (!authApiClient) {
    authApiClient = new AuthApiClient(baseURL);
  }
  return authApiClient;
}
