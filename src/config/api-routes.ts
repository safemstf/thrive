// src/config/api-routes.ts - Main index file
import { healthRoutes } from './api-routes/health.routes';
import { authRoutes } from './api-routes/auth.routes';
import { portfoliosRoutes } from './api-routes/portfolios.routes';
import { galleryRoutes } from './api-routes/gallery.routes';
import { usersRoutes } from './api-routes/users.routes';
import { booksRoutes } from './api-routes/books.routes';
import { conceptsRoutes } from './api-routes/concepts.routes';
import { progressRoutes } from './api-routes/progress.routes';
import { simulationsRoutes } from './api-routes/simulations.routes';
import {
  generateUniqueUsername,
  generateUniqueEmail,
  generateUniqueId
} from '@/types/api.types';

export interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  skipInBatchTest?: boolean;
  dependsOn?: string; // For routes that need data from other routes
}

export interface RouteCategory {
  name: string;
  routes: RouteDefinition[];
}

export function replaceRouteParams(
  endpoint: string,
  params?: Record<string, string>
): string {
  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
}

export function buildQueryString(params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Main route registry
export const API_ROUTES: Record<string, RouteCategory> = {
  health: healthRoutes,
  auth: authRoutes,
  portfolios: portfoliosRoutes,
  gallery: galleryRoutes,
  users: usersRoutes,
  books: booksRoutes,
  concepts: conceptsRoutes,
  progress: progressRoutes,
  simulations: simulationsRoutes,
};

// Export all route categories for direct import if needed
export {
  healthRoutes,
  authRoutes,
  portfoliosRoutes,
  galleryRoutes,
  usersRoutes,
  booksRoutes,
  conceptsRoutes,
  progressRoutes,
  simulationsRoutes,
};