// src/hooks/useApiTester.ts
import { useState, useCallback } from 'react';
import { RouteDefinition, replaceRouteParams, buildQueryString } from '@/config/api-routes';
import { config } from '@/config/environment';

export interface TestResult {
  route: RouteDefinition;
  status: 'pending' | 'running' | 'success' | 'error';
  response?: {
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    duration: number;
  };
  error?: string;
}

export interface ApiTesterOptions {
  baseUrl?: string;
  authToken?: string;
  onTestComplete?: (result: TestResult) => void;
  onAllTestsComplete?: (results: TestResult[]) => void;
}

export function useApiTester(options: ApiTesterOptions = {}) {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [authToken, setAuthToken] = useState(options.authToken || null);

  const baseUrl = options.baseUrl || config.api.baseUrl;

  // Test a single route
  const testRoute = useCallback(async (route: RouteDefinition, categoryKey?: string) => {
    const testKey = categoryKey ? `${categoryKey}-${route.name}` : route.name;
    
    // Set status to running
    setResults(prev => ({
      ...prev,
      [testKey]: { route, status: 'running' }
    }));

    const startTime = Date.now();

    try {
      // Build URL
      const endpoint = replaceRouteParams(route.endpoint, route.params);
      const queryString = buildQueryString(route.queryParams);
      const url = `${baseUrl}${endpoint}${queryString}`;

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };

      // Add auth token if needed
      if (route.needsAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Make request
      const response = await fetch(url, {
        method: route.method,
        headers,
        ...(route.body && route.body !== 'FormData with image file' 
          ? { body: JSON.stringify(route.body) } 
          : {}),
        credentials: 'include',
      });

      const duration = Date.now() - startTime;

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = null;
      }

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Check if this was a login route and extract token
      if (route.name === 'Login' && response.ok && data.token) {
        setAuthToken(data.token);
      }

      // Create result
      const result: TestResult = {
        route,
        status: response.ok ? 'success' : 'error',
        response: {
          status: response.status,
          statusText: response.statusText,
          data,
          headers: responseHeaders,
          duration,
        },
      };

      // Update results
      setResults(prev => ({
        ...prev,
        [testKey]: result
      }));

      // Call callback if provided
      if (options.onTestComplete) {
        options.onTestComplete(result);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const result: TestResult = {
        route,
        status: 'error',
        error: errorMessage,
        response: {
          status: 0,
          statusText: 'Network Error',
          data: { error: errorMessage },
          headers: {},
          duration,
        },
      };

      setResults(prev => ({
        ...prev,
        [testKey]: result
      }));

      if (options.onTestComplete) {
        options.onTestComplete(result);
      }

      return result;
    }
  }, [baseUrl, authToken, options]);

  // Test multiple routes
  const testRoutes = useCallback(async (routes: RouteDefinition[], categoryKey?: string) => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    for (const route of routes) {
      const result = await testRoute(route, categoryKey);
      testResults.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsRunning(false);

    if (options.onAllTestsComplete) {
      options.onAllTestsComplete(testResults);
    }

    return testResults;
  }, [testRoute, options]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults({});
  }, []);

  // Get result for specific test
  const getResult = useCallback((testKey: string) => {
    return results[testKey];
  }, [results]);

  // Get all results as array
  const getAllResults = useCallback(() => {
    return Object.values(results);
  }, [results]);

  // Update auth token
  const updateAuthToken = useCallback((token: string | null) => {
    setAuthToken(token);
  }, []);

  return {
    testRoute,
    testRoutes,
    results,
    isRunning,
    clearResults,
    getResult,
    getAllResults,
    authToken,
    updateAuthToken,
  };
}
