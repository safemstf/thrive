// src/config/api-routes.ts - Enhanced version
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

// Enhanced Test Data Manager with better ID resolution
export class TestDataManager {
  private static generatedIds: Map<string, string[]> = new Map();
  private static idMappings: Map<string, string> = new Map();
  private static idResolutionStrategies: Map<string, IdResolutionStrategy> = new Map();

  // Define ID resolution strategies for different categories
  static {
    this.registerIdResolutionStrategy('gallery', {
      placeholders: ['PLACEHOLDER_COLLECTION_ID', 'PLACEHOLDER_ARTIST_ID', 'PLACEHOLDER_GALLERY_ID'],
      endpoints: {
        PLACEHOLDER_COLLECTION_ID: '/api/gallery/collections',
        PLACEHOLDER_ARTIST_ID: '/api/gallery/artists',
        PLACEHOLDER_GALLERY_ID: '/api/gallery'
      },
      idExtractors: {
        PLACEHOLDER_COLLECTION_ID: (data: any[]) => data[0]?.id || 'fallback-collection-id',
        PLACEHOLDER_ARTIST_ID: (data: any[]) => data[0]?.id || 'fallback-artist-id',
        PLACEHOLDER_GALLERY_ID: (data: any[]) => data[0]?._id || data[0]?.id || 'fallback-gallery-id'
      }
    });

    this.registerIdResolutionStrategy('portfolios', {
      placeholders: ['PLACEHOLDER_PORTFOLIO_ID', 'PLACEHOLDER_PIECE_ID', 'PLACEHOLDER_CONCEPT_ID', 'PLACEHOLDER_SHARE_TOKEN'],
      endpoints: {
        PLACEHOLDER_PORTFOLIO_ID: '/api/portfolios',
        PLACEHOLDER_PIECE_ID: '/api/portfolios/me/gallery',
        PLACEHOLDER_CONCEPT_ID: '/api/concepts',
        PLACEHOLDER_SHARE_TOKEN: '' // Special case - will be handled separately
      },
      idExtractors: {
        PLACEHOLDER_PORTFOLIO_ID: (data: any[]) => data[0]?.id || 'fallback-portfolio-id',
        PLACEHOLDER_PIECE_ID: (data: any[]) => data[0]?.id || data[0]?._id || 'fallback-piece-id',
        PLACEHOLDER_CONCEPT_ID: (data: any[]) => data[0]?.id || 'fallback-concept-id',
        PLACEHOLDER_SHARE_TOKEN: () => 'test-share-token-123' // Fallback token
      }
    });

    this.registerIdResolutionStrategy('users', {
      placeholders: ['PLACEHOLDER_USER_ID'],
      endpoints: {
        PLACEHOLDER_USER_ID: '/api/users'
      },
      idExtractors: {
        PLACEHOLDER_USER_ID: (data: any[]) => data[0]?.id || 'fallback-user-id'
      }
    });

    this.registerIdResolutionStrategy('books', {
      placeholders: ['PLACEHOLDER_BOOK_ID'],
      endpoints: {
        PLACEHOLDER_BOOK_ID: '/api/books'
      },
      idExtractors: {
        PLACEHOLDER_BOOK_ID: (data: any[]) => data[0]?.id || 'fallback-book-id'
      }
    });

    this.registerIdResolutionStrategy('concepts', {
      placeholders: ['PLACEHOLDER_CONCEPT_ID'],
      endpoints: {
        PLACEHOLDER_CONCEPT_ID: '/api/concepts'
      },
      idExtractors: {
        PLACEHOLDER_CONCEPT_ID: (data: any[]) => data[0]?.id || 'fallback-concept-id'
      }
    });

    this.registerIdResolutionStrategy('progress', {
      placeholders: ['PLACEHOLDER_USER_ID', 'PLACEHOLDER_BOOK_ID'],
      endpoints: {
        PLACEHOLDER_USER_ID: '/api/users',
        PLACEHOLDER_BOOK_ID: '/api/books'
      },
      idExtractors: {
        PLACEHOLDER_USER_ID: (data: any[]) => data[0]?.id || 'fallback-user-id',
        PLACEHOLDER_BOOK_ID: (data: any[]) => data[0]?.id || 'fallback-book-id'
      }
    });

    this.registerIdResolutionStrategy('simulations', {
      placeholders: ['PLACEHOLDER_SIMULATION_ID'],
      endpoints: {
        PLACEHOLDER_SIMULATION_ID: '/api/simulations'
      },
      idExtractors: {
        PLACEHOLDER_SIMULATION_ID: (data: any[]) => data[0]?.id || 'fallback-simulation-id'
      }
    });
  }

  static registerIdResolutionStrategy(category: string, strategy: IdResolutionStrategy): void {
    this.idResolutionStrategies.set(category, strategy);
  }

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

  static getIdResolutionStrategy(category: string): IdResolutionStrategy | undefined {
    return this.idResolutionStrategies.get(category);
  }

  static getAllPlaceholders(routes: RouteDefinition[]): string[] {
    const placeholders = new Set<string>();
    
    routes.forEach(route => {
      if (route.params) {
        Object.values(route.params).forEach(value => {
          if (typeof value === 'string' && value.startsWith('PLACEHOLDER_')) {
            placeholders.add(value);
          }
        });
      }
    });
    
    return Array.from(placeholders);
  }

  static processRoute(route: RouteDefinition, idCache: Record<string, string> = {}): RouteDefinition {
    const processed = { ...route };

    if (route.params) {
      processed.params = { ...route.params };
      Object.entries(route.params).forEach(([key, value]) => {
        if (typeof value === 'string' && value.startsWith('PLACEHOLDER_')) {
          // First check the provided cache
          let actualId = idCache[value];
          
          // Generate fallback if still no ID
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

  static getCategoryDependencies(category: string): string[] {
    // Define which categories depend on others for ID resolution
    const dependencies: Record<string, string[]> = {
      'portfolios': ['auth'], // portfolios need auth for user-specific operations
      'progress': ['auth', 'users', 'books'], // progress needs auth, user and book IDs
      'usersMe': ['auth'], // user/me endpoints need authentication
      'concepts': ['auth'], // concepts may need auth
      'simulations': ['auth'], // simulations may need auth
    };
    
    return dependencies[category] || [];
  }

  static reset(): void {
    this.generatedIds.clear();
    this.idMappings.clear();
  }

  static getStats(): IdResolutionStats {
    return {
      totalMappings: this.idMappings.size,
      mappings: Object.fromEntries(this.idMappings),
      generatedIdsByCategory: Object.fromEntries(this.generatedIds)
    };
  }
}

// Enhanced Route Filter with more sophisticated filtering
export class RouteFilter {
  static byTag(routes: RouteDefinition[], tag: keyof NonNullable<RouteDefinition['tags']>): RouteDefinition[] {
    return routes.filter(route => route.tags?.[tag]);
  }

  static byMethod(routes: RouteDefinition[], methods: string[]): RouteDefinition[] {
    return routes.filter(route => methods.includes(route.method));
  }

  static destructive(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      route.method === 'DELETE' || 
      route.tags?.destructive ||
      route.endpoint.includes('/delete') ||
      route.name.toLowerCase().includes('delete')
    );
  }

  static safe(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      !this.destructive([route]).length &&
      !route.tags?.dangerousOperation &&
      route.method === 'GET'
    );
  }

  static fileUploads(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      route.endpoint.includes('upload') ||
      route.tags?.needsFileUpload ||
      (route.body && typeof route.body === 'object' && 
       JSON.stringify(route.body).includes('multipart/form-data'))
    );
  }

  static adminOnly(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => route.tags?.requiresAdmin);
  }

  static requiresAuth(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => route.needsAuth);
  }

  static publicEndpoints(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => !route.needsAuth && !route.tags?.requiresAdmin);
  }

  static safeForTesting(routes: RouteDefinition[]): RouteDefinition[] {
    return routes.filter(route => 
      !route.skipInBatchTest &&
      !route.tags?.dangerousOperation &&
      !this.destructive([route]).length
    );
  }

  static needsIdResolution(routes: RouteDefinition[]): RouteDefinition[] {
    return TestDataManager.getRoutesNeedingIds(routes);
  }

  static byComplexity(routes: RouteDefinition[], complexity: 'simple' | 'medium' | 'complex'): RouteDefinition[] {
    return routes.filter(route => {
      const hasParams = route.params && Object.keys(route.params).length > 0;
      const hasBody = route.body !== undefined;
      const hasQuery = route.queryParams && Object.keys(route.queryParams).length > 0;
      const needsAuth = route.needsAuth;
      
      const complexityScore = 
        (hasParams ? 1 : 0) +
        (hasBody ? 1 : 0) +
        (hasQuery ? 1 : 0) +
        (needsAuth ? 1 : 0);
      
      switch (complexity) {
        case 'simple': return complexityScore <= 1;
        case 'medium': return complexityScore === 2 || complexityScore === 3;
        case 'complex': return complexityScore >= 4;
        default: return true;
      }
    });
  }

  // Create test execution order based on dependencies
  static createExecutionOrder(routes: RouteDefinition[], category: string): RouteDefinition[] {
    const authRoutes = routes.filter(route => 
      route.endpoint.includes('/login') || 
      route.endpoint.includes('/auth') ||
      route.name.toLowerCase().includes('login')
    );
    
    const idFetchingRoutes = routes.filter(route => 
      route.method === 'GET' && 
      !route.params &&
      !route.endpoint.includes('/login')
    );
    
    const otherRoutes = routes.filter(route => 
      !authRoutes.includes(route) && 
      !idFetchingRoutes.includes(route)
    );
    
    // Return in logical order: auth first, then ID fetching, then others
    return [...authRoutes, ...idFetchingRoutes, ...otherRoutes];
  }
}

// Test execution planner
export class TestExecutionPlanner {
  static createTestPlan(categories: string[]): TestExecutionPlan {
    const plan: TestExecutionPlan = {
      phases: [],
      totalRoutes: 0,
      estimatedDuration: 0
    };

    categories.forEach(category => {
      const routes = API_ROUTES[category]?.routes || [];
      const dependencies = TestDataManager.getCategoryDependencies(category);
      
      plan.phases.push({
        category,
        routes: RouteFilter.createExecutionOrder(routes, category),
        dependencies,
        needsAuth: routes.some(r => r.needsAuth),
        needsIdResolution: TestDataManager.getRoutesNeedingIds(routes).length > 0
      });
      
      plan.totalRoutes += routes.length;
      plan.estimatedDuration += routes.length * 200; // 200ms per route estimate
    });

    // Sort phases by dependencies
    plan.phases.sort((a, b) => {
      if (a.dependencies.includes(b.category)) return 1;
      if (b.dependencies.includes(a.category)) return -1;
      return 0;
    });

    return plan;
  }
}

// Type definitions for enhanced functionality
interface IdResolutionStrategy {
  placeholders: string[];
  endpoints: Record<string, string>;
  idExtractors: Record<string, (data: any) => string>;
}

interface IdResolutionStats {
  totalMappings: number;
  mappings: Record<string, string>;
  generatedIdsByCategory: Record<string, string[]>;
}

interface TestExecutionPhase {
  category: string;
  routes: RouteDefinition[];
  dependencies: string[];
  needsAuth: boolean;
  needsIdResolution: boolean;
}

interface TestExecutionPlan {
  phases: TestExecutionPhase[];
  totalRoutes: number;
  estimatedDuration: number;
}

export type { 
  IdResolutionStrategy, 
  IdResolutionStats, 
  TestExecutionPhase, 
  TestExecutionPlan 
};