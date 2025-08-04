// utils/authFlowHelper.ts
import { RouteDefinition } from '@/config/api-routes';

interface AuthFlowResult {
  success: boolean;
  token?: string;
  error?: string;
  userData?: any;
}

export class AuthFlowHelper {
  private baseUrl: string;
  private testRoute: (route: RouteDefinition, category: string, idCache?: Record<string, string>) => Promise<boolean>;
  private currentToken: string | null = null;

  constructor(
    baseUrl: string, 
    testRoute: (route: RouteDefinition, category: string, idCache?: Record<string, string>) => Promise<boolean>
  ) {
    this.baseUrl = baseUrl;
    this.testRoute = testRoute;
  }

  /**
   * Attempt to authenticate using default admin credentials
   */
  async authenticateWithDefaults(): Promise<AuthFlowResult> {
    console.log('🔐 Attempting authentication with default admin credentials...');
    
    const loginRoute: RouteDefinition = {
      name: 'Admin Login',
      endpoint: '/api/auth/login',
      method: 'POST',
      description: 'Login with admin credentials',
      needsAuth: false,
      body: {
        usernameOrEmail: 'admin@admin.com', // Using the field name from backend
        password: 'admin123' // Corrected password based on backend expectation
      }
    };

    try {
      const success = await this.testRoute(loginRoute, 'auth', {});
      
      if (success) {
        // Check if we can verify the token works
        const verifySuccess = await this.verifyAuth();
        if (verifySuccess) {
          return { success: true };
        }
      }
      
      return { success: false, error: 'Admin login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication error' 
      };
    }
  }

  /**
   * Register a new test user and login
   */
  async registerAndLogin(): Promise<AuthFlowResult> {
    console.log('🔐 Attempting new user registration...');
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 5);
    
    const registerRoute: RouteDefinition = {
      name: 'Register Test User',
      endpoint: '/api/auth/register',
      method: 'POST',
      description: 'Register new test user',
      needsAuth: false,
      body: {
        email: `test_${timestamp}_${randomId}@example.com`,
        password: 'testpassword123',
        name: 'Test User',
        username: `testuser_${timestamp}_${randomId}`
      }
    };

    try {
      const success = await this.testRoute(registerRoute, 'auth', {});
      
      if (success) {
        // Registration often returns a token directly
        const verifySuccess = await this.verifyAuth();
        if (verifySuccess) {
          return { success: true };
        }
        
        // If not, try to login with the created user
        const loginRoute: RouteDefinition = {
          name: 'Login Test User',
          endpoint: '/api/auth/login',
          method: 'POST',
          description: 'Login with test user',
          needsAuth: false,
          body: {
            usernameOrEmail: registerRoute.body.email,
            password: registerRoute.body.password
          }
        };
        
        const loginSuccess = await this.testRoute(loginRoute, 'auth', {});
        if (loginSuccess) {
          return { success: true };
        }
      }
      
      return { success: false, error: 'Registration/login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration error' 
      };
    }
  }

  /**
   * Verify current auth token works
   */
  async verifyAuth(): Promise<boolean> {
    const verifyRoute: RouteDefinition = {
      name: 'Verify Auth',
      endpoint: '/api/auth/me',
      method: 'GET',
      description: 'Verify authentication',
      needsAuth: true
    };

    try {
      const success = await this.testRoute(verifyRoute, 'auth', {});
      return success;
    } catch {
      return false;
    }
  }

  /**
   * Create portfolio for authenticated user
   */
  async ensurePortfolio(): Promise<boolean> {
    console.log('🎨 Ensuring user has a portfolio...');
    
    // First check if user already has a portfolio
    const checkRoute: RouteDefinition = {
      name: 'Check Portfolio',
      endpoint: '/api/portfolios/me',
      method: 'GET',
      description: 'Check if user has portfolio',
      needsAuth: true
    };

    try {
      const hasPortfolio = await this.testRoute(checkRoute, 'portfolios', {});
      
      if (hasPortfolio) {
        console.log('✅ User already has a portfolio');
        return true;
      }
      
      // Create portfolio if needed
      console.log('📝 Creating portfolio for user...');
      const createRoute: RouteDefinition = {
        name: 'Create Portfolio',
        endpoint: '/api/portfolios/me/create',
        method: 'POST',
        description: 'Create portfolio for current user',
        needsAuth: true,
        body: {
          username: `testportfolio_${Date.now()}`,
          displayName: 'Test Portfolio',
          bio: 'Test portfolio created by API tester',
          settings: {
            isPublic: true,
            allowComments: true,
            allowReviews: true
          }
        }
      };
      
      const success = await this.testRoute(createRoute, 'portfolios', {});
      if (success) {
        console.log('✅ Portfolio created successfully');
      }
      return success;
      
    } catch (error) {
      console.error('❌ Portfolio check/creation failed:', error);
      return false;
    }
  }

  /**
   * Try multiple authentication strategies
   */
  async ensureAuthenticated(): Promise<AuthFlowResult> {
    // Strategy 1: Try default admin login
    const adminResult = await this.authenticateWithDefaults();
    
    if (adminResult.success) {
      console.log('✅ Authenticated with admin credentials');
      return adminResult;
    }

    // Strategy 2: Register new user
    console.log('🔐 Admin login failed, attempting new user registration...');
    const registerResult = await this.registerAndLogin();
    
    if (registerResult.success) {
      console.log('✅ Authenticated with new user registration');
      return registerResult;
    }

    return { 
      success: false, 
      error: 'All authentication strategies failed' 
    };
  }

  /**
   * Full setup flow: authenticate and create portfolio
   */
  async setupTestEnvironment(): Promise<{
    success: boolean;
    hasAuth: boolean;
    hasPortfolio: boolean;
    error?: string;
  }> {
    // Step 1: Ensure authentication
    const authResult = await this.ensureAuthenticated();
    
    if (!authResult.success) {
      return {
        success: false,
        hasAuth: false,
        hasPortfolio: false,
        error: authResult.error
      };
    }

    // Step 2: Ensure portfolio exists
    const portfolioSuccess = await this.ensurePortfolio();
    
    return {
      success: authResult.success && portfolioSuccess,
      hasAuth: authResult.success,
      hasPortfolio: portfolioSuccess
    };
  }
}

// Usage in your hook
export const createAuthFlowHelper = (
  baseUrl: string, 
  testRoute: (route: RouteDefinition, category: string, idCache?: Record<string, string>) => Promise<boolean>
) => {
  return new AuthFlowHelper(baseUrl, testRoute);
};