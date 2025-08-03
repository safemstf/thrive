// src/config/api-routes.ts - Fixed main file
import { RouteCategory, RouteDefinition } from '@/types/api.types';
import { healthRoutes } from './api-routes/health.routes';
import { authRoutes } from './api-routes/auth.routes';
import { portfoliosRoutes } from './api-routes/portfolios.routes';
import { galleryRoutes } from './api-routes/gallery.routes';
import { usersRoutes } from './api-routes/users.routes';
import { usersMeRoutes } from './api-routes/users-me.routes';
import { booksRoutes } from './api-routes/books.routes';
import { conceptsRoutes } from './api-routes/concepts.routes';
import { progressRoutes } from './api-routes/progress.routes';
import { simulationsRoutes } from './api-routes/simulations.routes';

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

// COMPLETE route registry
export const API_ROUTES: Record<string, RouteCategory> = {
  health: healthRoutes,
  auth: authRoutes,
  portfolios: portfoliosRoutes,
  gallery: galleryRoutes,
  users: usersRoutes,
  usersMe: usersMeRoutes,
  books: booksRoutes,
  concepts: conceptsRoutes,
  progress: progressRoutes,
  simulations: simulationsRoutes,
};

// Export all route categories
export {
  healthRoutes,
  authRoutes,
  portfoliosRoutes,
  galleryRoutes,
  usersRoutes,
  usersMeRoutes,
  booksRoutes,
  conceptsRoutes,
  progressRoutes,
  simulationsRoutes,
};

// Re-export types
export type { RouteCategory, RouteDefinition };

// Test Data Manager - Fixed types
export class TestDataManager {
  private static generatedIds: Map<string, string[]> = new Map();
  private static idMappings: Map<string, string> = new Map();

  static generateId(category: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const id = `test_${category}_${timestamp}_${random}`;
    
    if (!this.generatedIds.has(category)) {
      this.generatedIds.set(category, []);
    }
    this.generatedIds.get(category)!.push(id);
    
    return id;
  }

  static mapPlaceholder(placeholder: string, actualId: string): void {
    this.idMappings.set(placeholder, actualId);
  }

  static processRoute(route: RouteDefinition): RouteDefinition {
    const processed = { ...route };

    if (route.params) {
      processed.params = { ...route.params };
      Object.entries(route.params).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('PLACEHOLDER_')) {
          let actualId = this.idMappings.get(value);
          
          if (!actualId) {
            const category = value.replace('PLACEHOLDER_', '').toLowerCase();
            actualId = this.generateId(category);
            this.mapPlaceholder(value, actualId);
          }
          
          processed.params![key] = actualId;
        }
      });
    }

    return processed;
  }

  static getRoutesNeedingIds(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => {
      if (route.params) {
        return Object.values(route.params).some(value => 
          typeof value === 'string' && value.startsWith('PLACEHOLDER_')
        );
      }
      return route.tags?.needsIdGenerator || false;
    });
  }

  static reset(): void {
    this.generatedIds.clear();
    this.idMappings.clear();
  }
}

// Route filtering utilities - Fixed types  
export class RouteFilter {
  static byTag(routes: RouteDefinition[], tag: keyof NonNullable<RouteDefinition['tags']>): RouteDefinition[] {
    return routes.filter(route => route.tags?.[tag]);
  }

  static destructive(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      route.method === 'DELETE' || 
      route.tags?.destructive
    );
  }

  static fileUploads(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      route.endpoint.includes('upload') ||
      route.tags?.needsFileUpload ||
      (route.body && typeof route.body === 'object' && 
       route.body.note?.includes('multipart/form-data'))
    );
  }

  static adminOnly(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => route.tags?.requiresAdmin);
  }

  static safeForTesting(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      !route.skipInBatchTest &&
      route.method === 'GET' &&
      !route.tags?.dangerousOperation
    );
  }
}