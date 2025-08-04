// hooks/useApiTester.ts
import { useState, useCallback, useRef } from 'react';
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

interface IdCache {
  [key: string]: string;
}

interface BatchTestOptions {
  skipAuth?: boolean;
  skipIdResolution?: boolean;
  delayBetweenRequests?: number;
  stopOnFirstError?: boolean;
}

export function useApiTester({ baseUrl }: UseApiTesterOptions) {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [authToken, setAuthToken] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('api_test_token');
    }
    return null;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  
  // Cache for resolved IDs to avoid repeated API calls
  const idCacheRef = useRef<IdCache>({});

  /**
   * Extract auth token from response data
   */
  const extractAuthToken = useCallback((data: any): string | null => {
    // Common token field names
    const tokenFields = ['token', 'access_token', 'accessToken', 'auth_token', 'authToken'];
    
    for (const field of tokenFields) {
      if (data?.[field]) {
        return data[field];
      }
    }
    
    // Check nested objects
    if (data?.data) {
      for (const field of tokenFields) {
        if (data.data[field]) {
          return data.data[field];
        }
      }
    }
    
    // Check user object
    if (data?.user) {
      for (const field of tokenFields) {
        if (data.user[field]) {
          return data.user[field];
        }
      }
    }
    
    return null;
  }, []);

  /**
   * Update auth token and persist to localStorage
   */
  const updateAuthToken = useCallback((token: string | null) => {
    setAuthToken(token);
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('api_test_token', token);
      } else {
        localStorage.removeItem('api_test_token');
      }
    }
  }, []);

  /**
   * Resolve placeholder IDs by fetching real IDs from the API
   */
  const resolveIds = useCallback(async (category: string): Promise<IdCache> => {
    const cache: IdCache = { ...idCacheRef.current };
    
    setCurrentOperation(`Resolving IDs for ${category} category...`);

    try {
      switch (category) {
        case 'gallery': {
          // Fetch collection ID if not cached
          if (!cache.PLACEHOLDER_COLLECTION_ID) {
            try {
              const collRes = await fetch(`${baseUrl}/api/gallery/collections`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              });
              if (collRes.ok) {
                const collData = await collRes.json();
                const collList = collData.collections || collData || [];
                if (Array.isArray(collList) && collList.length > 0) {
                  cache.PLACEHOLDER_COLLECTION_ID = collList[0].id || collList[0]._id;
                } else {
                  cache.PLACEHOLDER_COLLECTION_ID = 'fallback-collection-id';
                }
              }
            } catch (error) {
              console.warn('Failed to fetch collection ID:', error);
              cache.PLACEHOLDER_COLLECTION_ID = 'fallback-collection-id';
            }
          }

          // Fetch artist ID if not cached
          if (!cache.PLACEHOLDER_ARTIST_ID) {
            try {
              const artRes = await fetch(`${baseUrl}/api/gallery/artists`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              });
              if (artRes.ok) {
                const artData = await artRes.json();
                const artList = artData.artists || artData || [];
                if (Array.isArray(artList) && artList.length > 0) {
                  cache.PLACEHOLDER_ARTIST_ID = artList[0].id || artList[0]._id;
                } else {
                  cache.PLACEHOLDER_ARTIST_ID = 'fallback-artist-id';
                }
              }
            } catch (error) {
              console.warn('Failed to fetch artist ID:', error);
              cache.PLACEHOLDER_ARTIST_ID = 'fallback-artist-id';
            }
          }

          // Fetch gallery piece ID if not cached
          if (!cache.PLACEHOLDER_GALLERY_ID) {
            try {
              const pieceRes = await fetch(`${baseUrl}/api/gallery`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
              });
              if (pieceRes.ok) {
                const pieceData = await pieceRes.json();
                const pieceList = pieceData.pieces || pieceData.items || pieceData || [];
                if (Array.isArray(pieceList) && pieceList.length > 0) {
                  cache.PLACEHOLDER_GALLERY_ID = pieceList[0]._id || pieceList[0].id || 'fallback-gallery-id';
                } else {
                  cache.PLACEHOLDER_GALLERY_ID = 'fallback-gallery-id';
                }
              }
            } catch (error) {
              console.warn('Failed to fetch gallery piece ID:', error);
              cache.PLACEHOLDER_GALLERY_ID = 'fallback-gallery-id';
            }
          }
          break;
        }

        case 'portfolios': {
          // Fetch portfolio ID if not cached
          if (!cache.PLACEHOLDER_PORTFOLIO_ID) {
            try {
              const portfolioRes = await fetch(`${baseUrl}/api/portfolios`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (portfolioRes.ok) {
                const portfolioData = await portfolioRes.json();
                const portfolioList = portfolioData.portfolios || portfolioData || [];
                if (Array.isArray(portfolioList) && portfolioList.length > 0) {
                  cache.PLACEHOLDER_PORTFOLIO_ID = portfolioList[0].id || portfolioList[0]._id;
                } else {
                  cache.PLACEHOLDER_PORTFOLIO_ID = 'fallback-portfolio-id';
                }
              } else {
                cache.PLACEHOLDER_PORTFOLIO_ID = 'fallback-portfolio-id';
              }
            } catch (error) {
              console.warn('Failed to fetch portfolio ID:', error);
              cache.PLACEHOLDER_PORTFOLIO_ID = 'fallback-portfolio-id';
            }
          }

          // Fetch piece ID for portfolio gallery operations
          if (!cache.PLACEHOLDER_PIECE_ID) {
            try {
              const pieceRes = await fetch(`${baseUrl}/api/portfolios/me/gallery`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (pieceRes.ok) {
                const pieceData = await pieceRes.json();
                const pieceList = pieceData.pieces || pieceData || [];
                if (Array.isArray(pieceList) && pieceList.length > 0) {
                  cache.PLACEHOLDER_PIECE_ID = pieceList[0].id || pieceList[0]._id || 'fallback-piece-id';
                } else {
                  cache.PLACEHOLDER_PIECE_ID = 'fallback-piece-id';
                }
              } else {
                cache.PLACEHOLDER_PIECE_ID = 'fallback-piece-id';
              }
            } catch (error) {
              console.warn('Failed to fetch piece ID:', error);
              cache.PLACEHOLDER_PIECE_ID = 'fallback-piece-id';
            }
          }

          // Fetch concept ID if not cached
          if (!cache.PLACEHOLDER_CONCEPT_ID) {
            try {
              const conceptRes = await fetch(`${baseUrl}/api/concepts`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (conceptRes.ok) {
                const conceptData = await conceptRes.json();
                const conceptList = conceptData.concepts || conceptData || [];
                if (Array.isArray(conceptList) && conceptList.length > 0) {
                  cache.PLACEHOLDER_CONCEPT_ID = conceptList[0].id || conceptList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch concept ID:', error);
            }
          }

          // Fetch share token if not cached (would need to create one first)
          if (!cache.PLACEHOLDER_SHARE_TOKEN) {
            cache.PLACEHOLDER_SHARE_TOKEN = 'test-share-token-123';
          }
          break;
        }

        case 'users': {
          // Fetch user ID if not cached
          if (!cache.PLACEHOLDER_USER_ID) {
            try {
              const userRes = await fetch(`${baseUrl}/api/users`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                const userList = userData.users || userData || [];
                if (Array.isArray(userList) && userList.length > 0) {
                  cache.PLACEHOLDER_USER_ID = userList[0].id || userList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch user ID:', error);
            }
          }
          break;
        }

        case 'books': {
          // Fetch book ID if not cached
          if (!cache.PLACEHOLDER_BOOK_ID) {
            try {
              const bookRes = await fetch(`${baseUrl}/api/books`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (bookRes.ok) {
                const bookData = await bookRes.json();
                const bookList = bookData.books || bookData || [];
                if (Array.isArray(bookList) && bookList.length > 0) {
                  cache.PLACEHOLDER_BOOK_ID = bookList[0].id || bookList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch book ID:', error);
            }
          }
          break;
        }

        case 'concepts': {
          // Fetch concept ID if not cached
          if (!cache.PLACEHOLDER_CONCEPT_ID) {
            try {
              const conceptRes = await fetch(`${baseUrl}/api/concepts`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (conceptRes.ok) {
                const conceptData = await conceptRes.json();
                const conceptList = conceptData.concepts || conceptData || [];
                if (Array.isArray(conceptList) && conceptList.length > 0) {
                  cache.PLACEHOLDER_CONCEPT_ID = conceptList[0].id || conceptList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch concept ID:', error);
            }
          }
          break;
        }

        case 'progress': {
          // Progress routes might need user and book IDs
          if (!cache.PLACEHOLDER_USER_ID) {
            try {
              const userRes = await fetch(`${baseUrl}/api/users`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                const userList = userData.users || userData || [];
                if (Array.isArray(userList) && userList.length > 0) {
                  cache.PLACEHOLDER_USER_ID = userList[0].id || userList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch user ID for progress:', error);
            }
          }

          if (!cache.PLACEHOLDER_BOOK_ID) {
            try {
              const bookRes = await fetch(`${baseUrl}/api/books`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (bookRes.ok) {
                const bookData = await bookRes.json();
                const bookList = bookData.books || bookData || [];
                if (Array.isArray(bookList) && bookList.length > 0) {
                  cache.PLACEHOLDER_BOOK_ID = bookList[0].id || bookList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch book ID for progress:', error);
            }
          }
          break;
        }

        case 'simulations': {
          // Fetch simulation ID if not cached
          if (!cache.PLACEHOLDER_SIMULATION_ID) {
            try {
              const simRes = await fetch(`${baseUrl}/api/simulations`, {
                headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                }
              });
              if (simRes.ok) {
                const simData = await simRes.json();
                const simList = simData.simulations || simData || [];
                if (Array.isArray(simList) && simList.length > 0) {
                  cache.PLACEHOLDER_SIMULATION_ID = simList[0].id || simList[0]._id;
                }
              }
            } catch (error) {
              console.warn('Failed to fetch simulation ID:', error);
            }
          }
          break;
        }

        // Health routes don't need IDs
        case 'health':
        case 'auth':
          // No IDs needed for these categories
          break;

        default:
          console.warn(`No ID resolution logic for category: ${category}`);
      }

      // Update the cache
      idCacheRef.current = cache;
      return cache;

    } catch (error) {
      console.error(`Error resolving IDs for category ${category}:`, error);
      return cache;
    }
  }, [baseUrl, authToken]);

  /**
   * Replace placeholders in route with actual IDs
   */
  const processRouteWithIds = useCallback((route: RouteDefinition, idCache: IdCache): RouteDefinition => {
    if (!route.params) return route;

    const processedRoute = { ...route };
    processedRoute.params = { ...route.params };

    Object.entries(route.params).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('PLACEHOLDER_')) {
        const actualId = idCache[value] || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        if (!idCache[value]) {
          console.warn(`No ID found for placeholder: ${value}, using fallback: ${actualId}`);
        }
        
        processedRoute.params![key] = actualId;
      }
    });

    return processedRoute;
  }, []);

  /**
   * Test a single route
   */
  const testRoute = useCallback(async (route: RouteDefinition, category: string, idCache: IdCache = {}) => {
    const testKey = `${category}-${route.name}`;
    
    // Set running status
    setResults(prev => ({
      ...prev,
      [testKey]: { status: 'running' }
    }));

    const startTime = Date.now();

    try {
      // Process route with IDs
      const processedRoute = processRouteWithIds(route, idCache);
      
      // Build URL with params
      let url = `${baseUrl}${replaceRouteParams(processedRoute.endpoint, processedRoute.params)}`;
      
      // Add query params if present
      if (processedRoute.queryParams) {
        url += buildQueryString(processedRoute.queryParams);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };

      // IMPORTANT: Always add auth token if available and route needs auth
      if (processedRoute.needsAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log(`🔐 Adding auth header for ${route.name}`);
      }

      // Prepare request body
      let body: string | undefined;
      if (processedRoute.body && ['POST', 'PUT', 'PATCH'].includes(processedRoute.method)) {
        const bodyData = typeof processedRoute.body === 'function' ? processedRoute.body() : processedRoute.body;
        body = JSON.stringify(bodyData);
      }

      console.log(`🚀 Testing ${testKey}:`, {
        url,
        method: processedRoute.method,
        hasAuth: !!headers['Authorization'],
        hasBody: !!body
      });

      // Make request
      const response = await fetch(url, {
        method: processedRoute.method,
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
      if ((category === 'auth' && (route.endpoint.includes('/login') || route.endpoint.includes('/register'))) && response.ok) {
        const token = extractAuthToken(data);
        if (token) {
          console.log('🎉 Auth token extracted and saved');
          updateAuthToken(token);
        }
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

      return response.ok;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ Error testing ${testKey}:`, error);
      
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

      return false;
    }
  }, [baseUrl, authToken, extractAuthToken, processRouteWithIds, updateAuthToken]);

  /**
   * Test multiple routes with full end-to-end support
   */
  const testRoutes = useCallback(async (
    routes: RouteDefinition[], 
    category: string, 
    options: BatchTestOptions = {}
  ) => {
    const {
      skipAuth = false,
      skipIdResolution = false,
      delayBetweenRequests = 100,
      stopOnFirstError = false
    } = options;

    setIsRunning(true);
    setCurrentOperation(`Starting batch test for ${category}...`);

    try {
      let idCache: IdCache = {};

      // Step 1: Handle authentication if needed
      if (!skipAuth && !authToken) {
        const authRoutes = routes.filter(route => 
          route.endpoint.includes('/login') || 
          route.endpoint.includes('/register') ||
          route.name.toLowerCase().includes('login') ||
          route.name.toLowerCase().includes('register')
        );
        
        if (authRoutes.length > 0) {
          setCurrentOperation('Authenticating...');
          for (const authRoute of authRoutes) {
            const success = await testRoute(authRoute, category, idCache);
            if (success && authToken) {
              console.log('✅ Authentication successful');
              break;
            }
          }
        }
      }

      // Step 2: Resolve IDs if needed
      if (!skipIdResolution) {
        idCache = await resolveIds(category);
      }

      // Step 3: Test all routes
      setCurrentOperation(`Testing ${routes.length} routes...`);
      let successCount = 0;
      let errorCount = 0;

      for (const route of routes) {
        if (route.skipInBatchTest) {
          continue;
        }

        setCurrentOperation(`Testing ${route.name}...`);
        const success = await testRoute(route, category, idCache);
        
        if (success) {
          successCount++;
        } else {
          errorCount++;
          if (stopOnFirstError) {
            break;
          }
        }

        // Add delay between requests
        if (delayBetweenRequests > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
        }
      }

      setCurrentOperation(`Completed: ${successCount} success, ${errorCount} errors`);

    } catch (error) {
      setCurrentOperation(`Batch test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setCurrentOperation(''), 3000); // Clear status after 3 seconds
    }
  }, [testRoute, resolveIds, authToken]);

  /**
   * Clear all results and reset state
   */
  const clearResults = useCallback(() => {
    setResults({});
    // Don't clear auth token when clearing results
    idCacheRef.current = {};
    setCurrentOperation('');
  }, []);

  /**
   * Clear only the ID cache
   */
  const clearIdCache = useCallback(() => {
    idCacheRef.current = {};
  }, []);

  /**
   * Get cached IDs
   */
  const getCachedIds = useCallback(() => {
    return { ...idCacheRef.current };
  }, []);

  /**
   * Clear auth token
   */
  const clearAuth = useCallback(() => {
    updateAuthToken(null);
  }, [updateAuthToken]);

  return {
    results,
    authToken,
    isRunning,
    currentOperation,
    testRoute: (route: RouteDefinition, category: string) => testRoute(route, category, idCacheRef.current),
    testRoutes,
    clearResults,
    clearIdCache,
    clearAuth,
    getCachedIds,
    setAuthToken: updateAuthToken, // Use the update function that persists to localStorage
  };
}