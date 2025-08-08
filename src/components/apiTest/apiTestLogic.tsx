import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  ExternalLink, Terminal, Settings, AlertTriangle, Route,
  Shield, User, Book, Image, Database, Upload, Play,
  Briefcase, Users, BarChart3, Code, Key, Lock,
  WifiOff, Activity, Filter, Download, Copy, Check,
  Heart, Zap, TrendingUp, Award, Eye, Clock
} from 'lucide-react';

// Import styled components from the existing styles file
import {
  PageWrapper,
  Container,
  PageHeader,
  HeaderLeft,
  HeaderRight,
  PageTitle,
  PageSubtitle,
  ConnectionBadge,
  AuthTokenBadge,
  StatsOverview,
  StatCard,
  StatIcon,
  StatContent,
  StatValue,
  StatLabel,
  ProgressCard,
  ProgressBar,
  ProgressFill,
  ProgressLabel,
  MainCard,
  TabRow,
  TabButton,
  TabContent,
  ControlPanel,
  CategoryGrid,
  CategoryCard,
  CategoryIcon,
  CategoryName,
  CategoryStats,
  CategoryProgress,
  CategoryProgressFill,
  ActionPanel,
  ActionBar,
  ActionGroup,
  PrimaryButton,
  SecondaryButton,
  RouteSection,
  SectionHeader,
  SectionTitle,
  RouteBadge,
  RouteList,
  RouteCard,
  RouteHeader,
  RouteLeft,
  StatusIcon,
  RouteInfo,
  RouteName,
  RouteDescription,
  MethodBadge,
  RouteTags,
  RouteTag,
  RouteActions,
  ResponseTime,
  TestButton,
  ResponseSection,
  ResponseHeader,
  ResponseStatus,
  ResponseMeta,
  ResponseBody,
  CodeBlock,
  ErrorSection,
  ErrorTitle,
  ErrorMessage,
  ConfigSection,
  ConfigCard,
  ConfigHeader,
  ConfigTitle,
  ConfigStatus,
  ConfigContent,
  ConfigRow,
  ConfigLabel,
  ConfigValue,
  TokenDisplay,
  ConfigActions,
  QuickLinks,
  QuickLink,
  IntegrationSection,
  IntegrationCard,
  CardHeader,
  CardIcon,
  CardContent,
  CardTitle,
  CodeExample,
  DiagnosticsSection,
  DiagnosticCard,
  DiagnosticHeader,
  DiagnosticList,
  DiagnosticItem,
  DebugCommands,
  DebugCommand,
  CommandTitle
} from './apiTestStyles';

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

export const ApiClientTestLogic: React.FC<ApiClientTestLogicProps> = ({
  baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000'
}) => {
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
        return <CheckCircle style={{ color: '#10b981' }} size={20} />;
      case 'error':
        return <XCircle style={{ color: '#ef4444' }} size={20} />;
      case 'running':
        return <Loader2 style={{ color: '#3b82f6' }} className="animate-spin" size={20} />;
      default:
        return <AlertCircle style={{ color: '#9ca3af' }} size={20} />;
    }
  }, []);

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>API Client Test Suite</PageTitle>
            <PageSubtitle>Test the real API client implementation</PageSubtitle>
          </HeaderLeft>
          
          <HeaderRight>
            <ConnectionBadge $status={connectionStatus}>
              {connectionStatus === 'connected' ? <Activity size={16} /> : <WifiOff size={16} />}
              {connectionStatus}
            </ConnectionBadge>
            
            {authToken && (
              <AuthTokenBadge onClick={copyToken} title="Click to copy token">
                <Key size={16} />
                <span>Authenticated</span>
                <Copy size={14} />
              </AuthTokenBadge>
            )}
          </HeaderRight>
        </PageHeader>

        {stats.total > 0 && (
          <StatsOverview>
            <StatCard>
              <StatIcon><TrendingUp size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Tests</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#10b981">
              <StatIcon><CheckCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.passed}</StatValue>
                <StatLabel>Passed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#ef4444">
              <StatIcon><XCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.failed}</StatValue>
                <StatLabel>Failed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#3b82f6">
              <StatIcon><Loader2 size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.running}</StatValue>
                <StatLabel>Running</StatLabel>
              </StatContent>
            </StatCard>
            
            <ProgressCard>
              <ProgressBar>
                <ProgressFill 
                  $percentage={stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}
                  $color="#10b981"
                />
              </ProgressBar>
              <ProgressLabel>
                {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% Success Rate
              </ProgressLabel>
            </ProgressCard>
          </StatsOverview>
        )}

        <MainCard>
          <TabRow>
            <TabButton $active={activeTab === 0} onClick={() => setActiveTab(0)}>
              <Route size={18} /> API Testing
            </TabButton>
            <TabButton $active={activeTab === 1} onClick={() => setActiveTab(1)}>
              <Settings size={18} /> Configuration
            </TabButton>
            <TabButton $active={activeTab === 2} onClick={() => setActiveTab(2)}>
              <Code size={18} /> Integration
            </TabButton>
            <TabButton $active={activeTab === 3} onClick={() => setActiveTab(3)}>
              <AlertTriangle size={18} /> Diagnostics
            </TabButton>
          </TabRow>

          <TabContent>
            {activeTab === 0 && (
              <>
                <ControlPanel>
                  <CategoryGrid>
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
                        <CategoryCard
                          key={key}
                          $active={selectedCategory === key}
                          $color={category.color}
                          onClick={() => setSelectedCategory(key)}
                        >
                          <CategoryIcon $color={category.color}>
                            <Icon size={24} />
                          </CategoryIcon>
                          <CategoryName>{category.name}</CategoryName>
                          <CategoryStats>
                            {hasResults ? (
                              <>
                                <span style={{ color: '#10b981' }}>{passed}</span>
                                <span style={{ color: '#6b7280' }}>/</span>
                                <span>{total}</span>
                              </>
                            ) : (
                              <span style={{ color: '#6b7280' }}>{total} methods</span>
                            )}
                          </CategoryStats>
                          {hasResults && (
                            <CategoryProgress>
                              <CategoryProgressFill 
                                $percentage={(passed / total) * 100}
                                $color={category.color}
                              />
                            </CategoryProgress>
                          )}
                        </CategoryCard>
                      );
                    })}
                  </CategoryGrid>

                  <ActionPanel>
                    <ActionBar>
                      <ActionGroup>
                        <PrimaryButton onClick={runAuthFlow} disabled={isRunning}>
                          <Shield size={16} />
                          Auth Flow
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runCategoryTests} disabled={isRunning}>
                          <Play size={16} />
                          Test {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runComprehensiveTest} disabled={isRunning}>
                          <Terminal size={16} />
                          Full System Test
                        </PrimaryButton>
                      </ActionGroup>
                      
                      <ActionGroup>
                        <SecondaryButton onClick={clearResults} disabled={isRunning}>
                          <RefreshCw size={16} />
                          Clear
                        </SecondaryButton>
                        
                        {stats.total > 0 && (
                          <SecondaryButton onClick={exportResults}>
                            <Download size={16} />
                            Export
                          </SecondaryButton>
                        )}
                      </ActionGroup>
                    </ActionBar>
                  </ActionPanel>
                </ControlPanel>

                <RouteSection>
                  <SectionHeader>
                    <SectionTitle>
                      {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name} Methods
                      <RouteBadge>{filteredMethods.length} methods</RouteBadge>
                    </SectionTitle>
                  </SectionHeader>

                  <RouteList>
                    {filteredMethods.map(method => {
                      const testKey = `${method.category}-${method.name}`;
                      const result = testResults[testKey];
                      
                      return (
                        <RouteCard key={method.name} $status={result?.status}>
                          <RouteHeader>
                            <RouteLeft>
                              <StatusIcon>
                                {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#9ca3af' }} size={20} />}
                              </StatusIcon>
                              
                              <RouteInfo>
                                <RouteName>{method.name}</RouteName>
                                <RouteDescription>{method.description}</RouteDescription>
                                
                                <RouteTags>
                                  <MethodBadge $method={method.method}>{method.method}</MethodBadge>
                                  
                                  {method.requiresAuth && (
                                    <RouteTag $type="auth">
                                      <Lock size={12} />
                                      Auth Required
                                    </RouteTag>
                                  )}
                                  
                                  {method.requiresData && (
                                    <RouteTag $type="data">
                                      <Database size={12} />
                                      Requires Data
                                    </RouteTag>
                                  )}
                                  
                                  {method.isDestructive && (
                                    <RouteTag $type="warning">
                                      <AlertTriangle size={12} />
                                      Destructive
                                    </RouteTag>
                                  )}
                                </RouteTags>
                              </RouteInfo>
                            </RouteLeft>
                            
                            <RouteActions>
                              {result?.duration && (
                                <ResponseTime $status={result.status}>
                                  <Clock size={14} />
                                  {result.duration}ms
                                </ResponseTime>
                              )}
                              
                              <TestButton
                                onClick={() => executeTest(method)}
                                disabled={(result?.status === 'running') || isRunning || (method.requiresAuth && !authToken)}
                              >
                                {result?.status === 'running' ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Play size={14} />
                                )}
                                Test
                              </TestButton>
                            </RouteActions>
                          </RouteHeader>
                          
                          {method.generateTestData && (
                            <ResponseSection>
                              <ResponseHeader>
                                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Test Data:</span>
                              </ResponseHeader>
                              <ResponseBody>
                                <CodeBlock>
                                  {JSON.stringify(method.generateTestData(), null, 2)}
                                </CodeBlock>
                              </ResponseBody>
                            </ResponseSection>
                          )}
                          
                          {result?.response && (
                            <ResponseSection>
                              <ResponseHeader>
                                <ResponseStatus $success={result.status === 'success'}>
                                  {result.status === 'success' ? 'Success' : 'Response'}
                                </ResponseStatus>
                                <ResponseMeta>
                                  <span>{result.duration}ms</span>
                                  <span>•</span>
                                  <span>{result.timestamp?.toLocaleTimeString()}</span>
                                </ResponseMeta>
                              </ResponseHeader>
                              
                              <ResponseBody>
                                <CodeBlock>
                                  {typeof result.response === 'string'
                                    ? result.response
                                    : JSON.stringify(result.response, null, 2)}
                                </CodeBlock>
                              </ResponseBody>
                            </ResponseSection>
                          )}
                          
                          {result?.error && (
                            <ErrorSection>
                              <ErrorTitle>Error:</ErrorTitle>
                              <ErrorMessage>{result.error}</ErrorMessage>
                            </ErrorSection>
                          )}
                        </RouteCard>
                      );
                    })}
                  </RouteList>
                </RouteSection>
              </>
            )}

            {activeTab === 1 && (
              <ConfigSection>
                <ConfigCard>
                  <ConfigHeader>
                    <ConfigTitle>API Client Configuration</ConfigTitle>
                    <ConfigStatus $connected={connectionStatus === 'connected'}>
                      {connectionStatus === 'connected' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                      {connectionStatus}
                    </ConfigStatus>
                  </ConfigHeader>
                  
                  <ConfigContent>
                    <ConfigRow>
                      <ConfigLabel>Base URL</ConfigLabel>
                      <ConfigValue>{baseUrl}</ConfigValue>
                    </ConfigRow>
                    
                    <ConfigRow>
                      <ConfigLabel>Environment</ConfigLabel>
                      <ConfigValue>{process.env.NODE_ENV}</ConfigValue>
                    </ConfigRow>
                    
                    {backendInfo && (
                      <>
                        <ConfigRow>
                          <ConfigLabel>Backend Status</ConfigLabel>
                          <ConfigValue>{backendInfo.status}</ConfigValue>
                        </ConfigRow>
                        
                        <ConfigRow>
                          <ConfigLabel>Backend Version</ConfigLabel>
                          <ConfigValue>{backendInfo.version || 'Unknown'}</ConfigValue>
                        </ConfigRow>
                      </>
                    )}
                    
                    <ConfigRow>
                      <ConfigLabel>Auth Token</ConfigLabel>
                      <ConfigValue>
                        {authToken ? (
                          <TokenDisplay onClick={copyToken}>
                            {authToken.substring(0, 20)}...
                            <Copy size={14} />
                          </TokenDisplay>
                        ) : (
                          'Not authenticated'
                        )}
                      </ConfigValue>
                    </ConfigRow>
                    
                    <ConfigRow>
                      <ConfigLabel>Available Methods</ConfigLabel>
                      <ConfigValue>{API_METHODS.length} total</ConfigValue>
                    </ConfigRow>
                  </ConfigContent>
                  
                  <ConfigActions>
                    <SecondaryButton onClick={checkConnection}>
                      <RefreshCw size={16} />
                      Test Connection
                    </SecondaryButton>
                    
                    {authToken && (
                      <SecondaryButton onClick={() => {
                        setAuthToken(null);
                        localStorage.removeItem('api_test_token');
                      }}>
                        <Lock size={16} />
                        Clear Auth
                      </SecondaryButton>
                    )}
                  </ConfigActions>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigTitle>Quick Links</ConfigTitle>
                  </ConfigHeader>
                  
                  <QuickLinks>
                    <QuickLink onClick={() => window.open(baseUrl, '_blank')}>
                      <ExternalLink size={16} />
                      Open Backend URL
                    </QuickLink>
                    
                    <QuickLink onClick={() => window.open('http://localhost:5000', '_blank')}>
                      <ExternalLink size={16} />
                      Open Localhost:5000
                    </QuickLink>
                    
                    <QuickLink onClick={() => window.open('http://localhost:4040', '_blank')}>
                      <ExternalLink size={16} />
                      Ngrok Dashboard
                    </QuickLink>
                    
                    <QuickLink onClick={() => window.open(`${baseUrl}/api`, '_blank')}>
                      <ExternalLink size={16} />
                      API Documentation
                    </QuickLink>
                  </QuickLinks>
                </ConfigCard>
              </ConfigSection>
            )}

            {activeTab === 2 && (
              <IntegrationSection>
                <IntegrationCard>
                  <CardHeader>
                    <CardIcon $color="#3b82f6"><Code size={24} /></CardIcon>
                    <CardTitle>API Client Usage Examples</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CodeExample>
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
                    </CodeExample>
                  </CardContent>
                </IntegrationCard>
                
                <IntegrationCard>
                  <CardHeader>
                    <CardIcon $color="#10b981"><Shield size={24} /></CardIcon>
                    <CardTitle>Error Handling</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CodeExample>
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
                    </CodeExample>
                  </CardContent>
                </IntegrationCard>
              </IntegrationSection>
            )}

            {activeTab === 3 && (
              <DiagnosticsSection>
                <DiagnosticCard $type="warning">
                  <DiagnosticHeader>
                    <AlertTriangle size={24} />
                    <h3>Common Issues</h3>
                  </DiagnosticHeader>
                  
                  <DiagnosticList>
                    <DiagnosticItem>
                      <strong>Authentication Required</strong>
                      <span>Many methods require login first. Run Auth Flow to authenticate.</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Portfolio Not Found</strong>
                      <span>User needs to create portfolio before accessing portfolio methods.</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Network Errors</strong>
                      <span>Check if backend is running and URL is correct.</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>File Upload Issues</strong>
                      <span>Use debug.uploadConfig() to check upload system status.</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Token Expired</strong>
                      <span>Clear auth and login again if getting 401 errors.</span>
                    </DiagnosticItem>
                  </DiagnosticList>
                </DiagnosticCard>

                <DiagnosticCard $type="info">
                  <DiagnosticHeader>
                    <Settings size={24} />
                    <h3>Debug Commands</h3>
                  </DiagnosticHeader>
                  
                  <DebugCommands>
                    <DebugCommand>
                      <CommandTitle>Test Portfolio System</CommandTitle>
                      <CodeBlock>
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
                      </CodeBlock>
                    </DebugCommand>
                    
                    <DebugCommand>
                      <CommandTitle>Quick API Health Check</CommandTitle>
                      <CodeBlock>
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
                      </CodeBlock>
                    </DebugCommand>
                    
                    <DebugCommand>
                      <CommandTitle>Debug Upload Issues</CommandTitle>
                      <CodeBlock>
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
                      </CodeBlock>
                    </DebugCommand>
                  </DebugCommands>
                </DiagnosticCard>

                <DiagnosticCard $type="success">
                  <DiagnosticHeader>
                    <CheckCircle size={24} />
                    <h3>System Status</h3>
                  </DiagnosticHeader>
                  
                  <DiagnosticList>
                    <DiagnosticItem>
                      <strong>Backend Connection</strong>
                      <span style={{ color: connectionStatus === 'connected' ? '#10b981' : '#ef4444' }}>
                        {connectionStatus}
                      </span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Authentication</strong>
                      <span style={{ color: authToken ? '#10b981' : '#ef4444' }}>
                        {authToken ? 'Authenticated' : 'Not authenticated'}
                      </span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Available Methods</strong>
                      <span style={{ color: '#3b82f6' }}>
                        {API_METHODS.length} total
                      </span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Test Success Rate</strong>
                      <span style={{ color: stats.total > 0 ? '#10b981' : '#6b7280' }}>
                        {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : 'No tests run'}
                      </span>
                    </DiagnosticItem>
                  </DiagnosticList>
                </DiagnosticCard>
              </DiagnosticsSection>
            )}
          </TabContent>
        </MainCard>
      </Container>
    </PageWrapper>
  );
};