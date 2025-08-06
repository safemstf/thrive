// src/config/api-routes/portfolios.routes.ts - Portfolio-Centric Architecture (TypeScript Fixed)
import { RouteCategory } from '@/types/api.types';

export const portfoliosRoutes: RouteCategory = {
  name: 'Portfolios',
  description: 'Portfolio management with integrated gallery - all gallery operations are portfolio-owned',
  routes: [
    // ==================== PUBLIC PORTFOLIO DISCOVERY ====================
    {
      name: 'Discover Public Portfolios',
      endpoint: '/api/portfolios/discover',
      method: 'GET',
      description: 'Discover public portfolios with filtering',
      queryParams: {
        page: 1,
        limit: 12,
        type: 'creative', // creative, educational, professional, hybrid
        featured: false,
        discipline: 'digital-art'
      },
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Get Global Portfolio Stats',
      endpoint: '/api/portfolios/stats',
      method: 'GET',
      description: 'Get global portfolio statistics',
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Get Portfolio Type Config',
      endpoint: '/api/portfolios/type-config/:type',
      method: 'GET',
      description: 'Get configuration for portfolio type',
      params: {
        type: 'creative' // creative, educational, professional, hybrid
      },
      tags: {
        readOnly: true
      }
    },

    // ==================== PORTFOLIO ACCESS BY IDENTIFIER ====================
    {
      name: 'Get Portfolio by Username',
      endpoint: '/api/portfolios/by-username/:username',
      method: 'GET',
      description: 'Get portfolio by username (public or owned)',
      params: {
        username: 'john-doe'
      },
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Get Portfolio Gallery by Username',
      endpoint: '/api/portfolios/by-username/:username/gallery',
      method: 'GET',
      description: 'Get gallery pieces for specific portfolio (public pieces only unless owned)',
      params: {
        username: 'john-doe'
      },
      queryParams: {
        page: 1,
        limit: 20
      },
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Track Portfolio View',
      endpoint: '/api/portfolios/by-id/:id/views',
      method: 'POST',
      description: 'Track portfolio view (public endpoint)',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        referrer: 'google.com',
        duration: 120
      },
      tags: {
        needsIdGenerator: true
      }
    },

    // ==================== CURRENT USER PORTFOLIO MANAGEMENT ====================
    {
      name: 'Get My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'GET',
      description: 'Get current user\'s portfolio',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Create My Portfolio',
      endpoint: '/api/portfolios/me/create',
      method: 'POST',
      description: 'Create portfolio for current user',
      needsAuth: true,
      body: {
        kind: 'creative', // creative, educational, professional, hybrid
        username: 'my-portfolio',
        displayName: 'My Creative Portfolio',
        bio: 'Showcasing my creative work and artistic journey',
        profession: 'Digital Artist',
        skills: ['Digital Art', 'Photography', '3D Modeling'],
        socialLinks: {
          instagram: 'https://instagram.com/myart',
          website: 'https://myartsite.com'
        },
        settings: {
          isPublic: true,
          allowComments: true,
          allowReviews: true
        }
      },
      tags: {
        modifiesData: true
      }
    },
    {
      name: 'Update My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'PUT',
      description: 'Update current user\'s portfolio',
      needsAuth: true,
      body: {
        bio: 'Updated portfolio bio',
        skills: ['Updated Skill List'],
        socialLinks: {
          instagram: 'https://instagram.com/updated'
        }
      },
      tags: {
        modifiesData: true
      }
    },
    {
      name: 'Delete My Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'DELETE',
      description: 'Delete current user\'s portfolio',
      needsAuth: true,
      body: {
        deleteGalleryPieces: false // Whether to delete gallery pieces or just unlink them
      },
      tags: {
        destructive: true,
        dangerousOperation: true
      }
    },
    {
      name: 'Upgrade Portfolio Type',
      endpoint: '/api/portfolios/me/upgrade',
      method: 'PUT',
      description: 'Upgrade/change portfolio type',
      needsAuth: true,
      body: {
        kind: 'hybrid', // creative, educational, professional, hybrid
        preserveContent: true
      },
      tags: {
        modifiesData: true
      }
    },
    {
      name: 'Check Portfolio Exists',
      endpoint: '/api/portfolios/me/check',
      method: 'GET',
      description: 'Check if current user has a portfolio',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },

    // ==================== PORTFOLIO-OWNED GALLERY MANAGEMENT ====================
    {
      name: 'Get My Gallery Pieces',
      endpoint: '/api/portfolios/me/gallery',
      method: 'GET',
      description: 'Get all gallery pieces for current user\'s portfolio',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Add Gallery Piece to Portfolio',
      endpoint: '/api/portfolios/me/gallery',
      method: 'POST',
      description: 'Add gallery piece to current user\'s portfolio',
      needsAuth: true,
      body: {
        title: 'Sunset Landscape',
        description: 'A beautiful sunset over mountains',
        imageUrl: 'https://example.com/sunset.jpg',
        category: 'photography',
        medium: 'Digital Photography',
        tags: ['landscape', 'sunset', 'nature'],
        visibility: 'public',
        year: 2025,
        displayOrder: 0
      },
      tags: {
        modifiesData: true
      }
    },
    {
      name: 'Update Gallery Piece',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'PUT',
      description: 'Update gallery piece in portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      body: {
        title: 'Updated Artwork Title',
        description: 'Updated description',
        tags: ['updated', 'tags']
      },
      tags: {
        modifiesData: true,
        needsIdGenerator: true
      }
    },
    {
      name: 'Delete Gallery Piece',
      endpoint: '/api/portfolios/me/gallery/:pieceId',
      method: 'DELETE',
      description: 'Delete gallery piece from portfolio',
      needsAuth: true,
      params: {
        pieceId: 'PLACEHOLDER_PIECE_ID'
      },
      tags: {
        destructive: true,
        needsIdGenerator: true
      }
    },
    {
      name: 'Batch Delete Gallery Pieces',
      endpoint: '/api/portfolios/me/gallery/batch',
      method: 'DELETE',
      description: 'Batch delete multiple gallery pieces',
      needsAuth: true,
      body: {
        pieceIds: ['PLACEHOLDER_PIECE_ID']
      },
      tags: {
        destructive: true,
        dangerousOperation: true
      }
    },
    {
      name: 'Batch Update Gallery Visibility',
      endpoint: '/api/portfolios/me/gallery/batch/visibility',
      method: 'PUT',
      description: 'Batch update gallery piece visibility',
      needsAuth: true,
      body: {
        pieceIds: ['PLACEHOLDER_PIECE_ID'],
        visibility: 'public' // public, private, unlisted
      },
      tags: {
        modifiesData: true
      }
    },
    {
      name: 'Get Gallery Statistics',
      endpoint: '/api/portfolios/me/gallery/stats',
      method: 'GET',
      description: 'Get gallery statistics for current user\'s portfolio',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },

    // ==================== PORTFOLIO CONCEPTS (Educational/Hybrid) ====================
    {
      name: 'Get My Concept Progress',
      endpoint: '/api/portfolios/me/concepts',
      method: 'GET',
      description: 'Get current user concept progress (educational/hybrid portfolios only)',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Add Concept to Portfolio',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'POST',
      description: 'Add concept to current user portfolio',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        notes: 'Starting this concept today'
      },
      tags: {
        modifiesData: true,
        needsIdGenerator: true
      }
    },
    {
      name: 'Update Concept Progress',
      endpoint: '/api/portfolios/me/concepts/:conceptId',
      method: 'PUT',
      description: 'Update concept progress in portfolio',
      needsAuth: true,
      params: {
        conceptId: 'PLACEHOLDER_CONCEPT_ID'
      },
      body: {
        status: 'completed',
        score: 85,
        notes: 'Completed with good understanding',
        completedAt: new Date().toISOString()
      },
      tags: {
        modifiesData: true,
        needsIdGenerator: true
      }
    },

    // ==================== PORTFOLIO ANALYTICS & DASHBOARD ====================
    {
      name: 'Get Portfolio Analytics',
      endpoint: '/api/portfolios/me/analytics',
      method: 'GET',
      description: 'Get detailed analytics for current user\'s portfolio',
      needsAuth: true,
      queryParams: {
        period: '30d' // 7d, 30d, 90d, 1y
      },
      tags: {
        readOnly: true
      }
    },
    {
      name: 'Get Portfolio Dashboard',
      endpoint: '/api/portfolios/me/dashboard',
      method: 'GET',
      description: 'Get dashboard metrics for current user\'s portfolio',
      needsAuth: true,
      tags: {
        readOnly: true
      }
    },

    // ==================== PORTFOLIO IMAGE UPLOADS ====================
    {
      name: 'Upload Portfolio Image',
      endpoint: '/api/portfolios/upload-image',
      method: 'POST',
      description: 'Upload portfolio profile or cover image',
      needsAuth: true,
      body: {
        type: 'profile' // 'profile' or 'cover'
        // Note: File upload would be handled via FormData in actual implementation
      },
      tags: {
        needsFileUpload: true,
        modifiesData: true
      },
      skipInBatchTest: true
    },

    // ==================== DEPRECATED/MIGRATION ENDPOINTS ====================
    {
      name: 'Get Portfolio by ID (Deprecated)',
      endpoint: '/api/portfolios/:id',
      method: 'GET',
      description: 'Get portfolio by ID (use /by-username instead)',
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      tags: {
        readOnly: true,
        deprecatedEndpoint: true
      }
    },
    {
      name: 'Update Portfolio by ID (Deprecated)',
      endpoint: '/api/portfolios/:id',
      method: 'PUT',
      description: 'Update portfolio by ID (use /me instead)',
      needsAuth: true,
      params: {
        id: 'PLACEHOLDER_PORTFOLIO_ID'
      },
      body: {
        bio: 'Updated via deprecated endpoint'
      },
      tags: {
        modifiesData: true,
        deprecatedEndpoint: true
      }
    }
  ]
};

// Export route count for documentation
export const PORTFOLIO_ROUTE_COUNT = portfoliosRoutes.routes.length;

// Export route categories for filtering and organization
export const PORTFOLIO_ROUTE_CATEGORIES = {
  // Core portfolio functionality
  DISCOVERY: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/discover') || 
    r.endpoint.includes('/stats') || 
    r.endpoint.includes('/type-config')
  ),
  
  CORE_MANAGEMENT: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/me') && 
    !r.endpoint.includes('/gallery') && 
    !r.endpoint.includes('/concepts') &&
    !r.endpoint.includes('/analytics') &&
    !r.endpoint.includes('/dashboard')
  ),
  
  // Portfolio-owned gallery operations
  GALLERY_MANAGEMENT: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/gallery') && !r.tags?.deprecatedEndpoint
  ),
  
  // Educational portfolio features
  CONCEPT_TRACKING: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/concepts')
  ),
  
  // Analytics and insights
  ANALYTICS: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/analytics') || 
    r.endpoint.includes('/dashboard') ||
    r.endpoint.includes('/views')
  ),
  
  // File handling
  FILE_UPLOADS: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/upload')
  ),
  
  // Public access points
  PUBLIC_ACCESS: portfoliosRoutes.routes.filter(r => 
    r.endpoint.includes('/by-username') || 
    r.endpoint.includes('/by-id')
  ),
  
  // Deprecated routes to be removed
  DEPRECATED: portfoliosRoutes.routes.filter(r => 
    r.tags?.deprecatedEndpoint
  )
};

// Helper function to get routes by portfolio type capabilities
export function getRoutesByPortfolioType(portfolioType: 'creative' | 'educational' | 'professional' | 'hybrid') {
  const typeCapabilities = {
    creative: {
      gallery: true,
      concepts: false,
      analytics: false,
      writing: false
    },
    educational: {
      gallery: false,
      concepts: true,
      analytics: true,
      writing: true
    },
    professional: {
      gallery: false,
      concepts: false,
      analytics: true,
      writing: true
    },
    hybrid: {
      gallery: true,
      concepts: true,
      analytics: true,
      writing: true
    }
  };
  
  const capabilities = typeCapabilities[portfolioType];
  
  return portfoliosRoutes.routes.filter(route => {
    // Core management routes are always available
    if (PORTFOLIO_ROUTE_CATEGORIES.CORE_MANAGEMENT.includes(route)) return true;
    if (PORTFOLIO_ROUTE_CATEGORIES.DISCOVERY.includes(route)) return true;
    if (PORTFOLIO_ROUTE_CATEGORIES.PUBLIC_ACCESS.includes(route)) return true;
    if (PORTFOLIO_ROUTE_CATEGORIES.FILE_UPLOADS.includes(route)) return true;
    
    // Feature-specific routes based on portfolio type
    if (capabilities.gallery && PORTFOLIO_ROUTE_CATEGORIES.GALLERY_MANAGEMENT.includes(route)) return true;
    if (capabilities.concepts && PORTFOLIO_ROUTE_CATEGORIES.CONCEPT_TRACKING.includes(route)) return true;
    if (capabilities.analytics && PORTFOLIO_ROUTE_CATEGORIES.ANALYTICS.includes(route)) return true;
    
    // Skip deprecated routes unless specifically requested
    if (route.tags?.deprecatedEndpoint) return false;
    
    return false;
  });
}

// Helper function to get safe routes for testing
export function getSafePortfolioRoutes() {
  return portfoliosRoutes.routes.filter(route => 
    !route.tags?.destructive &&
    !route.tags?.dangerousOperation &&
    !route.tags?.needsFileUpload &&
    !route.tags?.deprecatedEndpoint
  );
}

// Helper function to get gallery-specific routes (using endpoint patterns)
export function getGalleryRoutes() {
  return portfoliosRoutes.routes.filter(route => 
    route.endpoint.includes('/gallery')
  );
}

// Helper function to get educational routes (using endpoint patterns)
export function getEducationalRoutes() {
  return portfoliosRoutes.routes.filter(route => 
    route.endpoint.includes('/concepts')
  );
}

// Migration helper - routes that should be updated in frontend
export function getDeprecatedRoutes() {
  return portfoliosRoutes.routes.filter(route => 
    route.tags?.deprecatedEndpoint
  );
}

// Portfolio architecture summary
export const PORTFOLIO_ARCHITECTURE_INFO = {
  description: 'Portfolio-Centric Architecture with Integrated Gallery',
  benefits: [
    'Clear ownership: Gallery pieces belong to portfolios',
    'Better data consistency and integrity',
    'Simplified permission model',
    'Unified user experience',
    'Easier to maintain and extend'
  ],
  migrations: [
    'Gallery operations moved to /api/portfolios/me/gallery/*',
    'All gallery pieces now require portfolio context',
    'Public gallery access via /api/portfolios/by-username/:username/gallery',
    'Analytics integrated into portfolio dashboard'
  ],
  nextSteps: [
    'Update frontend to use portfolio-centric gallery endpoints',
    'Remove standalone gallery API calls',
    'Migrate any remaining /api/gallery/* calls to portfolio context',
    'Remove deprecated endpoints after migration complete'
  ]
};

// Test-friendly route groups
export const PORTFOLIO_TEST_GROUPS = {
  // Safe read-only operations
  SAFE_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.readOnly && !r.needsAuth
  ),
  
  // Authenticated read operations
  AUTH_READ_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.readOnly && r.needsAuth
  ),
  
  // Data modification operations (be careful in tests)
  MODIFICATION_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.modifiesData
  ),
  
  // Destructive operations (use with extreme caution)
  DESTRUCTIVE_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.destructive
  ),
  
  // File upload operations (require special handling)
  FILE_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.needsFileUpload
  ),
  
  // Operations that need ID generation for testing
  ID_DEPENDENT_OPERATIONS: portfoliosRoutes.routes.filter(r => 
    r.tags?.needsIdGenerator
  )
};

// Export for your API test page
export const getTestablePortfolioRoutes = () => {
  return [
    ...PORTFOLIO_TEST_GROUPS.SAFE_OPERATIONS,
    ...PORTFOLIO_TEST_GROUPS.AUTH_READ_OPERATIONS,
    // Add modification operations only if you want to test them
    // ...PORTFOLIO_TEST_GROUPS.MODIFICATION_OPERATIONS.filter(r => !r.tags?.dangerousOperation)
  ];
};