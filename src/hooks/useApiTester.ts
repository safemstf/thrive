// hooks/useApiTester.ts
import { useState, useCallback, useRef } from 'react';
import { replaceRouteParams, buildQueryString } from '@/config/api-routes';

// Define RouteDefinition interface locally to match the updated one
interface RouteDefinition {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  needsAuth?: boolean;
  params?: Record<string, string>;
  queryParams?: Record<string, any>;
  body?: any;
  skipInBatchTest?: boolean;
}

interface TestResult {
  status: 'success' | 'error' | 'running' | 'pending';
  response?: {
    status: number;
    data: any;
    duration: number;
  };
  error?: string;
}

interface UseApiTesterOptions {
  baseUrl: string;
}

export function useApiTester({ baseUrl }: UseApiTesterOptions) {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate unique test data for each test run
  const generateTestData = (template: any): any => {
    // If template is a function, call it to get dynamic data
    if (typeof template === 'function') {
      return template();
    }
    
    if (!template) return template;
    
    const result = { ...template };
    
    // Generate unique username if present
    if (result.username && typeof result.username === 'string') {
      result.username = `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Generate unique email if present
    if (result.email && typeof result.email === 'string') {
      result.email = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
    }
    
    // Generate unique title if present (for books, gallery items, etc.)
    if (result.title && typeof result.title === 'string' && result.title.includes('Test')) {
      result.title = `${result.title} ${Date.now()}`;
    }
    
    // Generate unique simulation_id if present
    if (result.simulation_id && typeof result.simulation_id === 'string') {
      result.simulation_id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return result;
  };

  const makeRequest = async (
    route: RouteDefinition,
    overrideBody?: any
  ): Promise<{ status: number; data: any; duration: number }> => {
    const startTime = Date.now();
    
    // Build the URL
    let url = `${baseUrl}${replaceRouteParams(route.endpoint, route.params)}`;
    
    // Add query parameters
    if (route.queryParams) {
      url += buildQueryString(route.queryParams);
    }
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Add auth token if needed
    if (route.needsAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Prepare body with unique data
    const body = overrideBody || (route.body ? generateTestData(route.body) : undefined);
    
    // Create abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const response = await fetch(url, {
        method: route.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      const duration = Date.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Store auth token from login response
      if (route.endpoint === '/api/auth/login' && response.ok && data.token) {
        setAuthToken(data.token);
      }
      
      return {
        status: response.status,
        data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      
      throw error;
    }
  };

  const testRoute = useCallback(
    async (route: RouteDefinition, category: string, overrideBody?: any) => {
      const testKey = `${category}-${route.name}`;
      
      // Skip if already running
      if (results[testKey]?.status === 'running') {
        return;
      }
      
      // Update status to running
      setResults(prev => ({
        ...prev,
        [testKey]: { status: 'running' },
      }));
      
      try {
        const response = await makeRequest(route, overrideBody);
        
        // Determine if response is successful
        const isSuccess = response.status >= 200 && response.status < 300;
        
        setResults(prev => ({
          ...prev,
          [testKey]: {
            status: isSuccess ? 'success' : 'error',
            response,
            error: isSuccess ? undefined : `HTTP ${response.status}`,
          },
        }));
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          [testKey]: {
            status: 'error',
            error: error.message || 'Unknown error',
          },
        }));
      }
    },
    [baseUrl, authToken, results]
  );

  const testRoutes = useCallback(
    async (routes: RouteDefinition[], category: string) => {
      setIsRunning(true);
      
      for (const route of routes) {
        // Skip routes marked to skip in batch tests
        if (route.skipInBatchTest) {
          console.log(`Skipping ${route.name} in batch test`);
          continue;
        }
        
        // Check if we need auth but don't have a token
        if (route.needsAuth && !authToken) {
          console.log(`Skipping ${route.name} - requires auth`);
          continue;
        }
        
        await testRoute(route, category);
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setIsRunning(false);
    },
    [testRoute, authToken]
  );

  const clearResults = useCallback(() => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setResults({});
    setIsRunning(false);
  }, []);

  const resetAuth = useCallback(() => {
    setAuthToken(null);
  }, []);

  return {
    results,
    isRunning,
    authToken,
    testRoute,
    testRoutes,
    clearResults,
    resetAuth,
  };
}