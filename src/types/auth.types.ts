// types/auth.types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';  // Added role as optional field
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;    
  login: (email: string, password: string) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

// Auth API interface for type safety
export interface AuthAPI {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<AuthResponse>;
  verifyToken(token: string): Promise<User | null>;
  signup(credentials: SignupCredentials): Promise<AuthResponse>;
  updateProfile(updates: Partial<User>): Promise<User>;
}