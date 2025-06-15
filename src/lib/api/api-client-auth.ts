// lib/api/api-client-auth.ts
import { BaseApiClient, APIError } from '@/lib/api/base-api-client';
import { 
  AuthAPI, 
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

export class AuthApiClient extends BaseApiClient implements AuthAPI {
  // No need to override getAuthToken - it's already in BaseApiClient
  
  // No need to override request method - BaseApiClient already adds auth headers

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.requestWithRetry<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        usernameOrEmail: credentials.email,
        password: credentials.password
      }),
    });

    // Store token in localStorage for API calls
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.token);
    }

    return response;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await this.requestWithRetry<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage for API calls
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem('auth-token', response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.requestWithRetry<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear local storage, even if server request fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.requestWithRetry<{user: User}>('/auth/me');
    return response.user;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.requestWithRetry<{user: User}>('/auth/me', {
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
    try {
      // Temporarily store token for this request
      const originalToken = this.getAuthToken();
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', token);
      }
      
      const user = await this.getCurrentUser();
      
      // Restore original token
      if (typeof window !== 'undefined') {
        if (originalToken) {
          localStorage.setItem('auth-token', originalToken);
        } else {
          localStorage.removeItem('auth-token');
        }
      }
      
      return user;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }
}

// Singleton for auth API
let authApiClient: AuthApiClient;

export function getAuthApiClient(): AuthApiClient {
  if (!authApiClient) {
    authApiClient = new AuthApiClient();
  }
  return authApiClient;
}