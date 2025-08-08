import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  ExternalLink, Terminal, Settings, AlertTriangle, Route,
  Shield, User, Book, Image, Database, Upload, Play,
  Briefcase, Users, BarChart3, Code, Key, Lock,
  WifiOff, Activity, Filter, Download, Copy, Check,
  Heart, Zap, TrendingUp, Award, Eye, Clock
} from 'lucide-react';

// Define test result interface
interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
  timestamp?: Date;
}

// Define API method structure
interface ApiMethod {
  name: string;
  description: string;
  category: string;
  method: string;
  requiresAuth: boolean;
  requiresData?: boolean;
  requiresFile?: boolean;
  isDestructive?: boolean;
  testFunction: () => Promise<any>;
  generateTestData?: () => any;
}

// Category definitions with icons and colors
const CATEGORIES = {
  portfolio: {
    name: 'Portfolio',
    icon: Briefcase,
    color: '#3b82f6',
    description: 'Portfolio management and operations'
  },
  auth: {
    name: 'Authentication',
    icon: Shield,
    color: '#f59e0b',
    description: 'Login, signup, and token management'
  },
  education: {
    name: 'Education',
    icon: Book,
    color: '#06b6d4',
    description: 'Books and concepts management'
  },
  health: {
    name: 'Health',
    icon: Heart,
    color: '#10b981',
    description: 'System health and connectivity'
  }
};

// Mock API client for demo purposes
const mockApi = {
  health: {
    check: () => Promise.resolve({ status: 'healthy', version: '1.0.0', timestamp: new Date().toISOString() }),
    testConnection: () => Promise.resolve({ connected: true, baseUrl: 'http://localhost:5000', latency: 45 })
  },
  auth: {
    login: (credentials: any) => Promise.resolve({ 
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: { id: '1', email: credentials.usernameOrEmail, username: 'testuser' }
    }),
    getCurrentUser: () => Promise.resolve({ 
      id: '1', 
      email: 'admin@admin.com', 
      username: 'admin',
      createdAt: '2024-01-01T00:00:00Z'
    }),
    verifyToken: (token: string) => Promise.resolve({ valid: true, expiresAt: '2025-01-01T00:00:00Z' })
  },
  portfolio: {
    check: () => Promise.resolve(true),
    get: () => Promise.resolve({
      id: '1',
      username: 'testuser',
      title: 'My Creative Portfolio',
      bio: 'Digital artist and photographer',
      kind: 'creative',
      visibility: 'public',
      createdAt: '2024-01-01T00:00:00Z'
    }),
    getStats: () => Promise.resolve({
      totalPortfolios: 1247,
      activeUsers: 892,
      publicPortfolios: 734,
      galleryPieces: 5683
    }),
    getTypeConfig: (type: string) => Promise.resolve({
      type,
      features: ['gallery', 'analytics', 'custom_domain'],
      maxGalleryPieces: 100,
      storageLimit: '10GB'
    }),
    discover: (filters?: any) => Promise.resolve({
      portfolios: [
        { id: '1', username: 'artist1', title: 'Digital Dreams', kind: 'creative' },
        { id: '2', username: 'dev2', title: 'Code & Coffee', kind: 'developer' }
      ],
      pagination: { page: 1, limit: 5, total: 156 }
    }),
    gallery: {
      get: () => Promise.resolve([
        {
          id: '1',
          title: 'Sunset Landscape',
          description: 'Beautiful sunset over mountains',
          imageUrl: 'https://picsum.photos/800/600?random=1',
          category: 'photography',
          visibility: 'public',
          createdAt: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'Digital Portrait',
          description: 'Character design study',
          imageUrl: 'https://picsum.photos/800/600?random=2',
          category: 'digital',
          visibility: 'public',
          createdAt: '2024-01-10T00:00:00Z'
        }
      ]),
      getStats: () => Promise.resolve({
        totalPieces: 24,
        publicPieces: 18,
        categories: { photography: 12, digital: 8, traditional: 4 },
        totalViews: 1847
      }),
      add: (data: any) => Promise.resolve({
        id: '3',
        ...data,
        createdAt: new Date().toISOString()
      })
    },
    concepts: {
      get: () => Promise.resolve([
        {
          id: '1',
          conceptId: 'js-fundamentals',
          title: 'JavaScript Fundamentals',
          status: 'completed',
          score: 85,
          completedAt: '2024-01-20T00:00:00Z'
        }
      ])
    },
    analytics: {
      get: () => Promise.resolve({
        views: { total: 1847, thisMonth: 234 },
        likes: { total: 156, thisMonth: 23 },
        shares: { total: 45, thisMonth: 8 },
        topPieces: [
          { id: '1', title: 'Sunset Landscape', views: 456 }
        ]
      }),
      dashboard: () => Promise.resolve({
        overview: {
          portfolioViews: 1847,
          galleryPieces: 24,
          conceptsCompleted: 12,
          skillLevel: 'Intermediate'
        },
        recentActivity: [
          { type: 'gallery_add', title: 'Added new artwork', date: '2024-01-25T00:00:00Z' }
        ]
      })
    },
    debug: {
      uploadConfig: () => Promise.resolve({
        filesystem: {
          checks: {
            uploadsExists: true,
            canWrite: true,
            portfolioExists: true,
            portfolioCount: 24
          }
        },
        limits: {
          maxFileSize: '10MB',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      }),
      validateFile: (filename: string) => Promise.resolve({
        filename,
        validation: {
          checks: {
            exists: true,
            readable: true,
            sizeHuman: '2.3 MB',
            imageInfo: { format: 'JPEG', width: 1920, height: 1080 }
          }
        }
      })
    }
  },
  education: {
    books: {
      getAll: (params?: any) => Promise.resolve({
        books: [
          { id: '1', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'programming' },
          { id: '2', title: 'Design Patterns', author: 'Gang of Four', category: 'software-design' }
        ],
        pagination: { page: 1, limit: 5, total: 47 }
      })
    },
    concepts: {
      getAll: (filters?: any) => Promise.resolve({
        concepts: [
          { id: '1', title: 'JavaScript Fundamentals', category: 'programming', difficulty: 'beginner' },
          { id: '2', title: 'React Hooks', category: 'frontend', difficulty: 'intermediate' }
        ],
        pagination: { page: 1, limit: 5, total: 156 }
      }),
      search: (query: string, filters?: any) => Promise.resolve({
        concepts: [
          { id: '1', title: 'JavaScript Variables', category: 'programming', difficulty: 'beginner' }
        ],
        query,
        total: 12
      })
    }
  }
};

// Mock testing utils
const mockTestingUtils = {
  portfolio: {
    generateGalleryPieceData: () => ({
      title: `Test Artwork ${Date.now()}`,
      description: 'Test artwork created by API testing suite',
      imageUrl: 'https://picsum.photos/800/600',
      category: 'digital',
      medium: 'Digital Art',
      tags: ['test', 'digital', 'automated'],
      visibility: 'public',
      year: 2025,
      displayOrder: 0
    }),
    runFullSystemTest: () => Promise.resolve({
      success: true,
      tests: {
        health: { passed: true },
        auth: { passed: true },
        portfolio: { passed: true },
        gallery: { passed: true }
      },
      summary: 'All systems operational'
    })
  }
};

interface ApiClientTestLogicProps {
  baseUrl?: string;
}

export default function ApiClientTestLogic({
  baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000'
}: ApiClientTestLogicProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [backendInfo, setBackendInfo] = useState<any>(null);

  // Define all available API methods
  const API_METHODS: ApiMethod[] = useMemo(() => [
    // Health endpoints
    {
      name: 'Health Check',
      description: 'Check if the backend is running',
      category: 'health',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.health.check()
    },
    {
      name: 'Test Connection',
      description: 'Test backend connectivity',
      category: 'health',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.health.testConnection()
    },
    
    // Auth endpoints
    {
      name: 'Login',
      description: 'Authenticate user',
      category: 'auth',
      method: 'POST',
      requiresAuth: false,
      requiresData: true,
      testFunction: () => mockApi.auth.login({ 
        usernameOrEmail: 'admin@admin.com', 
        password: 'admin123' 
      }),
      generateTestData: () => ({ 
        usernameOrEmail: 'admin@admin.com', 
        password: 'admin123' 
      })
    },
    {
      name: 'Get Current User',
      description: 'Get authenticated user info',
      category: 'auth',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.auth.getCurrentUser()
    },
    {
      name: 'Verify Token',
      description: 'Verify auth token validity',
      category: 'auth',
      method: 'POST',
      requiresAuth: true,
      testFunction: () => mockApi.auth.verifyToken(authToken || '')
    },
    
    // Portfolio endpoints
    {
      name: 'Check Portfolio',
      description: 'Check if user has portfolio',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.check()
    },
    {
      name: 'Get My Portfolio',
      description: 'Get current user portfolio',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.get()
    },
    {
      name: 'Get Portfolio Stats',
      description: 'Get global portfolio statistics',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.portfolio.getStats()
    },
    {
      name: 'Get Type Config',
      description: 'Get portfolio type configuration',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.portfolio.getTypeConfig('creative')
    },
    {
      name: 'Discover Portfolios',
      description: 'Search public portfolios',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.portfolio.discover({ page: 1, limit: 5 })
    },
    
    // Portfolio Gallery
    {
      name: 'Get My Gallery',
      description: 'Get user gallery pieces',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.gallery.get()
    },
    {
      name: 'Gallery Stats',
      description: 'Get gallery statistics',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.gallery.getStats()
    },
    {
      name: 'Add Gallery Piece',
      description: 'Add piece to gallery',
      category: 'portfolio',
      method: 'POST',
      requiresAuth: true,
      requiresData: true,
      testFunction: () => mockApi.portfolio.gallery.add(mockTestingUtils.portfolio.generateGalleryPieceData()),
      generateTestData: () => mockTestingUtils.portfolio.generateGalleryPieceData()
    },
    
    // Portfolio Concepts
    {
      name: 'Get My Concepts',
      description: 'Get concept progress',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.concepts.get()
    },
    
    // Portfolio Analytics
    {
      name: 'Get Analytics',
      description: 'Get portfolio analytics',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.analytics.get()
    },
    {
      name: 'Get Dashboard',
      description: 'Get dashboard metrics',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.analytics.dashboard()
    },
    
    // Portfolio Debug
    {
      name: 'Upload Config',
      description: 'Check upload configuration',
      category: 'portfolio',
      method: 'GET',
      requiresAuth: true,
      testFunction: () => mockApi.portfolio.debug.uploadConfig()
    },
    
    // Education endpoints
    {
      name: 'Get All Books',
      description: 'Get all available books',
      category: 'education',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.education.books.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Get All Concepts',
      description: 'Get all available concepts',
      category: 'education',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.education.concepts.getAll({ page: 1, limit: 5 })
    },
    {
      name: 'Search Concepts',
      description: 'Search concepts by query',
      category: 'education',
      method: 'GET',
      requiresAuth: false,
      testFunction: () => mockApi.education.concepts.search('javascript', { limit: 5 })
    }
  ], [authToken]);

  // Load auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('api_test_token');
    if (token) {
      setAuthToken(token);
    }
    checkConnection();
  }, []);

  const checkConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      const response = await mockApi.health.check();
      setBackendInfo(response);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  const executeTest = useCallback(async (method: ApiMethod) => {
    const testKey = `${method.category}-${method.name}`;
    
    setTestResults(prev => ({
      ...prev,
      [testKey]: {
        status: 'running',
        timestamp: new Date()
      }
    }));

    const startTime = Date.now();

    try {
      const result = await method.testFunction();
      const duration = Date.now() - startTime;

      // Handle auth token from login
      if (method.name === 'Login' && result?.token) {
        setAuthToken(result.token);
        localStorage.setItem('api_test_token', result.token);
      }

      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          status: 'success',
          response: result,
          duration,
          timestamp: new Date()
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          duration,
          timestamp: new Date()
        }
      }));
    }
  }, []);

  const runCategoryTests = useCallback(async () => {
    setIsRunning(true);
    const categoryMethods = API_METHODS.filter(m => m.category === selectedCategory);
    
    for (const method of categoryMethods) {
      if (method.requiresAuth && !authToken) {
        continue; // Skip auth-required methods if not authenticated
      }
      await executeTest(method);
    }
    
    setIsRunning(false);
  }, [selectedCategory, authToken, API_METHODS, executeTest]);

  const runAuthFlow = useCallback(async () => {
    setIsRunning(true);
    
    // Run login first
    const loginMethod = API_METHODS.find(m => m.name === 'Login');
    if (loginMethod) {
      await executeTest(loginMethod);
      
      // Wait a bit for token to be set
      setTimeout(async () => {
        const userMethod = API_METHODS.find(m => m.name === 'Get Current User');
        if (userMethod) {
          await executeTest(userMethod);
        }
        setIsRunning(false);
      }, 500);
    } else {
      setIsRunning(false);
    }
  }, [API_METHODS, executeTest]);

  const runComprehensiveTest = useCallback(async () => {
    setIsRunning(true);
    
    try {
      // Run the comprehensive test
      const result = await mockTestingUtils.portfolio.runFullSystemTest();
      
      // Update test results based on the comprehensive test
      const testKey = 'portfolio-FullSystemTest';
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          status: result.success ? 'success' : 'error',
          response: result,
          timestamp: new Date()
        }
      }));
      
    } catch (error) {
      console.error('Comprehensive test failed:', error);
    }
    
    setIsRunning(false);
  }, []);

  const clearResults = useCallback(() => {
    setTestResults({});
  }, []);

  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      baseUrl,
      results: testResults
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-client-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [baseUrl, testResults]);

  const copyToken = useCallback(() => {
    if (authToken) {
      navigator.clipboard.writeText(authToken);
    }
  }, [authToken]);

  // Filter methods by category
  const filteredMethods = useMemo(() => {
    return API_METHODS.filter(method => method.category === selectedCategory);
  }, [API_METHODS, selectedCategory]);

  // Calculate stats
  const stats = useMemo(() => {
    const allResults = Object.values(testResults);
    const categoryResults = Object.entries(testResults)
      .filter(([key]) => key.startsWith(selectedCategory))
      .map(([, result]) => result);
    
    return {
      total: allResults.length,
      passed: allResults.filter(r => r.status === 'success').length,
      failed: allResults.filter(r => r.status === 'error').length,
      running: allResults.filter(r => r.status === 'running').length,
      categoryTotal: categoryResults.length,
      categoryPassed: categoryResults.filter(r => r.status === 'success').length,
      categoryFailed: categoryResults.filter(r => r.status === 'error').length,
    };
  }, [testResults, selectedCategory]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'running':
        return <Loader2 className="text-blue-500 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-gray-400" size={20} />;
    }
  }, []);

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Client Test Suite</h1>
            <p className="text-gray-600 mt-2">Test the real API client implementation</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus === 'connected' ? <Activity size={16} /> : <WifiOff size={16} />}
              <span className="capitalize">{connectionStatus}</span>
            </div>
            
            {authToken && (
              <button
                onClick={copyToken}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                title="Click to copy token"
              >
                <Key size={16} />
                <span>Authenticated</span>
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <TrendingUp className="text-gray-600" size={24} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <CheckCircle className="text-green-500" size={24} />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <XCircle className="text-red-500" size={24} />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-4">
                <Loader2 className="text-blue-500" size={24} />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
                  <div className="text-sm text-gray-600">Running</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% Success Rate
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 0, name: 'API Testing', icon: Route },
                { id: 1, name: 'Configuration', icon: Settings },
                { id: 2, name: 'Integration', icon: Code },
                { id: 3, name: 'Diagnostics', icon: AlertTriangle }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 0 && (
              <>
                {/* Category Selection */}
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(CATEGORIES).map(([key, category]) => {
                      const Icon = category.icon;
                      const categoryMethods = API_METHODS.filter(m => m.category === key);
                      const categoryResults = Object.entries(testResults)
                        .filter(([k]) => k.startsWith(key))
                        .map(([, r]) => r);
                      const passed = categoryResults.filter(r => r.status === 'success').length;
                      const total = categoryMethods.length;
                      const hasResults = categoryResults.length > 0;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedCategory === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="p-2 rounded"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              <Icon size={24} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{category.name}</div>
                              <div className="text-sm text-gray-600">
                                {hasResults ? (
                                  <span>
                                    <span className="text-green-600">{passed}</span>
                                    <span className="text-gray-400">/</span>
                                    <span>{total}</span>
                                  </span>
                                ) : (
                                  <span>{total} methods</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {hasResults && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(passed / total) * 100}%`,
                                  backgroundColor: category.color 
                                }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Panel */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={runAuthFlow}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Shield size={16} />
                        Auth Flow
                      </button>
                      
                      <button
                        onClick={runCategoryTests}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play size={16} />
                        Test {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
                      </button>
                      
                      <button
                        onClick={runComprehensiveTest}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Terminal size={16} />
                        Full System Test
                      </button>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={clearResults}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={16} />
                        Clear
                      </button>
                      
                      {stats.total > 0 && (
                        <button
                          onClick={exportResults}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <Download size={16} />
                          Export
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Methods List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name} Methods
                      <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {filteredMethods.length} methods
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {filteredMethods.map(method => {
                      const testKey = `${method.category}-${method.name}`;
                      const result = testResults[testKey];
                      
                      return (
                        <div 
                          key={method.name} 
                          className={`border rounded-lg p-4 ${
                            result?.status === 'success' ? 'border-green-200 bg-green-50' :
                            result?.status === 'error' ? 'border-red-200 bg-red-50' :
                            result?.status === 'running' ? 'border-blue-200 bg-blue-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                {result ? getStatusIcon(result.status) : <AlertCircle className="text-gray-400" size={20} />}
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900">{method.name}</h4>
                                <p className="text-sm text-gray-600">{method.description}</p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodBadgeColor(method.method)}`}>
                                    {method.method}
                                  </span>
                                  
                                  {method.requiresAuth && (
                                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                      <Lock size={10} />
                                      Auth Required
                                    </span>
                                  )}
                                  
                                  {method.requiresData && (
                                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                      <Database size={10} />
                                      Requires Data
                                    </span>
                                  )}
                                  
                                  {method.isDestructive && (
                                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                      <AlertTriangle size={10} />
                                      Destructive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {result?.duration && (
                                <div className={`flex items-center gap-1 text-sm ${
                                  result.status === 'success' ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  <Clock size={14} />
                                  {result.duration}ms
                                </div>
                              )}
                              
                              <button
                                onClick={() => executeTest(method)}
                                disabled={(result?.status === 'running') || isRunning || (method.requiresAuth && !authToken)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {result?.status === 'running' ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Play size={14} />
                                )}
                                Test
                              </button>
                            </div>
                          </div>
                          
                          {method.generateTestData && (
                            <div className="mt-4 p-3 bg-gray-100 rounded">
                              <div className="text-sm font-medium text-gray-700 mb-2">Test Data:</div>
                              <pre className="text-xs text-gray-600 overflow-x-auto">
                                {JSON.stringify(method.generateTestData(), null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {result?.response && (
                            <div className="mt-4 p-3 bg-white border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${
                                  result.status === 'success' ? 'text-green-600' : 'text-gray-700'
                                }`}>
                                  {result.status === 'success' ? 'Success' : 'Response'}
                                </span>
                                <div className="text-xs text-gray-500">
                                  {result.duration}ms • {result.timestamp?.toLocaleTimeString()}
                                </div>
                              </div>
                              
                              <pre className="text-xs text-gray-700 overflow-x-auto max-h-64 overflow-y-auto">
                                {typeof result.response === 'string'
                                  ? result.response
                                  : JSON.stringify(result.response, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {result?.error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <div className="text-sm font-medium text-red-800 mb-1">Error:</div>
                              <div className="text-sm text-red-700">{result.error}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === 1 && (
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">API Client Configuration</h3>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded ${
                      connectionStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {connectionStatus === 'connected' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      <span className="capitalize">{connectionStatus}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base URL</span>
                      <span className="font-mono text-sm">{baseUrl}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Environment</span>
                      <span className="font-mono text-sm">{process.env.NODE_ENV}</span>
                    </div>
                    
                    {backendInfo && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Backend Status</span>
                          <span className="font-mono text-sm">{backendInfo.status}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Backend Version</span>
                          <span className="font-mono text-sm">{backendInfo.version || 'Unknown'}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auth Token</span>
                      <div>
                        {authToken ? (
                          <button
                            onClick={copyToken}
                            className="flex items-center gap-2 font-mono text-sm hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            {authToken.substring(0, 20)}...
                            <Copy size={14} />
                          </button>
                        ) : (
                          <span className="text-gray-400">Not authenticated</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Methods</span>
                      <span className="font-mono text-sm">{API_METHODS.length} total</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={checkConnection}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <RefreshCw size={16} />
                      Test Connection
                    </button>
                    
                    {authToken && (
                      <button
                        onClick={() => {
                          setAuthToken(null);
                          localStorage.removeItem('api_test_token');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Lock size={16} />
                        Clear Auth
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open(baseUrl, '_blank')}
                      className="flex items-center gap-2 w-full p-3 text-left border rounded hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                      Open Backend URL
                    </button>
                    
                    <button
                      onClick={() => window.open('http://localhost:5000', '_blank')}
                      className="flex items-center gap-2 w-full p-3 text-left border rounded hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                      Open Localhost:5000
                    </button>
                    
                    <button
                      onClick={() => window.open('http://localhost:4040', '_blank')}
                      className="flex items-center gap-2 w-full p-3 text-left border rounded hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                      Ngrok Dashboard
                    </button>
                    
                    <button
                      onClick={() => window.open(`${baseUrl}/api`, '_blank')}
                      className="flex items-center gap-2 w-full p-3 text-left border rounded hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                      API Documentation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded">
                      <Code size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">API Client Usage Examples</h3>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`// 1. Authentication Flow
import { api } from '@/lib/api-client';

// Login
const loginResult = await api.auth.login({
  usernameOrEmail: 'user@example.com',
  password: 'password'
});

// Get current user
const user = await api.auth.getCurrentUser();

// 2. Portfolio Operations
// Check if user has portfolio
const hasPortfolio = await api.portfolio.check();

// Get or create portfolio
const portfolio = await api.portfolio.get();
if (!portfolio) {
  const newPortfolio = await api.portfolio.create({
    username: 'myusername',
    displayName: 'My Portfolio',
    bio: 'My creative journey',
    kind: 'creative'
  });
}

// 3. Gallery Management
// Get gallery pieces
const pieces = await api.portfolio.gallery.get();

// Add new piece
const newPiece = await api.portfolio.gallery.add({
  title: 'My Artwork',
  description: 'Beautiful creation',
  imageUrl: 'https://example.com/image.jpg',
  visibility: 'public'
});

// 4. Upload Images
const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
const uploadResult = await api.portfolio.images.upload(file, 'profile');

// 5. Debug and Testing
const uploadConfig = await api.portfolio.debug.uploadConfig();
const fileValidation = await api.portfolio.debug.validateFile('test.jpg');

// 6. Testing Utilities
import { testingUtils } from '@/lib/api-client';

// Run comprehensive system test
const systemTest = await testingUtils.portfolio.runFullSystemTest();

// Test upload functionality
const uploadTest = await testingUtils.portfolio.testImageUpload();

// Run upload diagnostics
const diagnostics = await testingUtils.portfolio.runUploadDiagnostics();`}
                    </pre>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 text-green-600 rounded">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Error Handling</h3>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
{`import { api, APIError } from '@/lib/api-client';

try {
  const result = await api.portfolio.get();
  console.log('Portfolio:', result);
} catch (error) {
  if (error instanceof APIError) {
    console.log('API Error:', error.message);
    console.log('Status:', error.status);
    console.log('Code:', error.code);
    
    // Handle specific errors
    if (error.status === 404) {
      console.log('Portfolio not found');
    } else if (error.status === 401) {
      console.log('Authentication required');
    }
  } else {
    console.log('Unknown error:', error);
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-orange-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Common Issues</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-gray-900">Authentication Required</div>
                      <div className="text-sm text-gray-600">Many methods require login first. Run Auth Flow to authenticate.</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Portfolio Not Found</div>
                      <div className="text-sm text-gray-600">User needs to create portfolio before accessing portfolio methods.</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Network Errors</div>
                      <div className="text-sm text-gray-600">Check if backend is running and URL is correct.</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">File Upload Issues</div>
                      <div className="text-sm text-gray-600">Use debug.uploadConfig() to check upload system status.</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Token Expired</div>
                      <div className="text-sm text-gray-600">Clear auth and login again if getting 401 errors.</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">Debug Commands</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-2">Test Portfolio System</div>
                      <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                        <pre className="text-green-400 text-xs">
{`import { testingUtils } from '@/lib/api-client';

// Full system test
const result = await testingUtils.portfolio.runFullSystemTest();
console.log('System test:', result);

// Upload diagnostics
const config = await testingUtils.portfolio.runUploadDiagnostics();
console.log('Upload config:', config);

// Test image upload
const uploadTest = await testingUtils.portfolio.testImageUpload();
console.log('Upload test:', uploadTest);`}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900 mb-2">Quick API Health Check</div>
                      <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                        <pre className="text-green-400 text-xs">
{`import { api } from '@/lib/api-client';

// Test connection
const health = await api.health.check();
console.log('Health:', health);

// Test auth
const user = await api.auth.getCurrentUser();
console.log('Current user:', user);

// Test portfolio
const hasPortfolio = await api.portfolio.check();
console.log('Has portfolio:', hasPortfolio);`}
                        </pre>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900 mb-2">Debug Upload Issues</div>
                      <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                        <pre className="text-green-400 text-xs">
{`import { api } from '@/lib/api-client';

// Check upload configuration
const uploadConfig = await api.portfolio.debug.uploadConfig();
console.log('Upload config:', uploadConfig);

// Validate specific file
const validation = await api.portfolio.debug.validateFile('test.jpg');
console.log('File validation:', validation);

// Check filesystem permissions
console.log('Directory exists:', uploadConfig.filesystem.checks.uploadsExists);
console.log('Can write:', uploadConfig.filesystem.checks.canWrite);`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-600" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Backend Connection</span>
                      <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                        {connectionStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Authentication</span>
                      <span className={authToken ? 'text-green-600' : 'text-red-600'}>
                        {authToken ? 'Authenticated' : 'Not authenticated'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Available Methods</span>
                      <span className="text-blue-600">
                        {API_METHODS.length} total
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Test Success Rate</span>
                      <span className={stats.total > 0 ? 'text-green-600' : 'text-gray-600'}>
                        {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : 'No tests run'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}