// src/types/api.types.ts - Enhanced with tags support
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
  dependsOn?: string;
  
  // NEW: Optional tagging system for test automation
  tags?: {
    // ID and placeholder management
    needsIdGenerator?: boolean;
    placeholderIds?: string[];
    dependsOnData?: string[];
    
    // Route characteristics
    readOnly?: boolean;
    modifiesData?: boolean;
    destructive?: boolean;
    needsFileUpload?: boolean;
    batchOperation?: boolean;
    
    // Authentication and authorization
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    requiresSpecialAuth?: boolean;
    
    // Data categories
    dataCategory?: 'portfolio' | 'gallery' | 'user' | 'concept' | 'book' | 'simulation' | 'auth' | 'health';
    
    // Functional categories
    analytics?: boolean;
    settings?: boolean;
    account?: boolean;
    billing?: boolean;
    educational?: boolean;
    subscription?: boolean;
    
    // Test execution hints
    setupRoute?: boolean;
    cleanupRoute?: boolean;
    dangerousOperation?: boolean;
    requiresExistingData?: boolean;
    
    // File handling
    fileUploadType?: 'image' | 'document' | 'avatar' | 'gallery';
    
    // Special handling
    realTimeData?: boolean;
    legacyEndpoint?: boolean;
    deprecatedEndpoint?: boolean;
  };
}

export interface RouteCategory {
  name: string;
  routes: RouteDefinition[];
}

// Utility functions for generating unique values
export function generateUniqueUsername(): string {
  return `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

export function generateUniqueEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`;
}

export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
