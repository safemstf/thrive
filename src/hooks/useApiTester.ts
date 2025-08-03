// hooks/useApiTester.ts
import { useState, useCallback } from 'react';
import { RouteDefinition, replaceRouteParams, buildQueryString } from '@/config/api-routes';

interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  response?: {
    status: number;
    statusText: string;
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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const testRoute = useCallback(async (route: RouteDefinition, category: string) => {
    const testKey = `${category}-${route.name}`;
    
    // Set running status
    setResults(prev => ({
      ...prev,
      [testKey]: { status: 'running' }
    }));

    const startTime = Date.now();

    try {
      // Build URL with params
      let url = `${baseUrl}${replaceRouteParams(route.endpoint, route.params)}`;
      
      // Add query params if present
      if (route.queryParams) {
        url += buildQueryString(route.queryParams);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };

      // Add auth token if route needs auth
      if (route.needsAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Prepare request body
      let body: string | undefined;
      if (route.body && ['POST', 'PUT', 'PATCH'].includes(route.method)) {
        body = JSON.stringify(typeof route.body === 'function' ? route.body() : route.body);
      }

      // Make request
      const response = await fetch(url, {
        method: route.method,
        headers,
        body,
      });

      const duration = Date.now() - startTime;

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Extract token from auth responses
      if (
        category === 'auth' &&
        route.endpoint.includes('/login') &&
        response.ok
      ) {
        const token = data.token ?? data.access_token;
        if (token) setAuthToken(token);
      }

      // Update results
      setResults(prev => ({
        ...prev,
        [testKey]: {
          status: response.ok ? 'success' : 'error',
          response: {
            status: response.status,
            statusText: response.statusText,
            data,
            duration,
          },
          error: response.ok ? undefined : `${response.status} ${response.statusText}`,
        }
      }));

    } catch (error) {
      const duration = Date.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [testKey]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          response: {
            status: 0,
            statusText: 'Network Error',
            data: null,
            duration,
          }
        }
      }));
    }
  }, [baseUrl, authToken]);

  const testRoutes = useCallback(async (routes: RouteDefinition[], category: string) => {
    setIsRunning(true);
    
    for (const route of routes) {
      // Skip routes marked to skip in batch tests
      if (route.skipInBatchTest) {
        continue;
      }
      
      await testRoute(route, category);
      
      // Add small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  }, [testRoute]);

  const clearResults = useCallback(() => {
    setResults({});
    setAuthToken(null);
  }, []);

  return {
    results,
    authToken,
    isRunning,
    testRoute,
    testRoutes,
    clearResults,
  };
}