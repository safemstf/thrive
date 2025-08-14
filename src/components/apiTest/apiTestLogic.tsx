// src/components/apiTest/apiTestLogic.tsx - Improved token management
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  Play, Shield, Settings, Route, Heart, Book, Users,
  Terminal, Copy, Download, ExternalLink, Clock, Key,
  User, TrendingUp, Zap, AlertTriangle
} from 'lucide-react';

// Import the real API client
import { api } from '@/lib/api-client';

// Import the COMPLETE API methods configuration
import { 
  CATEGORIES, 
  createCompleteApiMethods,
  getMethodsByCategory,
  getAuthRequiredMethods,
  getPublicMethods
} from './completeApiMethods';

// Import styled components
import {
  PageWrapper, Container, PageHeader, HeaderLeft, HeaderRight,
  PageTitle, PageSubtitle, ConnectionBadge, AuthTokenBadge,
  StatsOverview, StatCard, StatIcon, StatContent, StatValue, StatLabel,
  MainCard, TabRow, TabButton, TabContent, ControlPanel,
  CategoryGrid, CategoryCard, CategoryIcon, CategoryName, CategoryStats,
  ActionPanel, ActionBar, ActionGroup, PrimaryButton, SecondaryButton,
  RouteSection, SectionHeader, SectionTitle, RouteList, RouteCard,
  RouteHeader, RouteLeft, StatusIcon, RouteInfo, RouteName, RouteDescription,
  MethodBadge, RouteTags, RouteTag, RouteActions, TestButton,
  ResponseSection, ResponseHeader, ResponseStatus, ResponseBody,
  CodeBlock, ErrorSection, ErrorTitle, ErrorMessage,
  ConfigSection, ConfigCard, ConfigHeader, ConfigTitle, ConfigStatus,
  ConfigContent, ConfigRow, ConfigLabel, ConfigValue, TokenDisplay,
  ConfigActions, QuickLinks, QuickLink
} from './apiTestStyles';

// ==================== TYPES ====================
interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
  timestamp?: Date;
}

interface ApiMethod {
  name: string;
  description: string;
  category: string;
  method: string;
  requiresAuth: boolean;
  testFunction: () => Promise<any>;
  generateTestData?: () => any;
}

interface TestSession {
  isActive: boolean;
  token: string | null;
  startTime: Date | null;
}

// ==================== ICON MAPPING ====================
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Heart,
    Shield, 
    Route,
    Book,
    Users,
    User,
    TrendingUp,
    Zap
  };
  return icons[iconName] || AlertCircle;
};

// ==================== MAIN COMPONENT ====================
interface ApiTestLogicProps {
  baseUrl?: string;
}

export const ApiClientTestLogic: React.FC<ApiTestLogicProps> = ({
  baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000'
}) => {
  // ==================== STATE ====================
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    isActive: false,
    token: null,
    startTime: null
  });

  // ==================== COMPUTED VALUES ====================
  const apiMethods = useMemo(() => createCompleteApiMethods(authToken), [authToken]);
  
  const filteredMethods = useMemo(() => {
    return getMethodsByCategory(apiMethods, selectedCategory);
  }, [apiMethods, selectedCategory]);

  const stats = useMemo(() => {
    const allResults = Object.values(testResults);
    return {
      total: allResults.length,
      passed: allResults.filter(r => r.status === 'success').length,
      failed: allResults.filter(r => r.status === 'error').length,
      running: allResults.filter(r => r.status === 'running').length,
    };
  }, [testResults]);

  // ==================== EFFECTS ====================
  useEffect(() => {
    const token = localStorage.getItem('api_test_token');
    if (token) {
      setAuthToken(token);
      setTestSession(prev => ({ ...prev, token }));
    }
    checkConnection();
  }, []);

  // ==================== HANDLERS ====================
  const checkConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      const response = await api.health.check();
      setBackendInfo(response);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  }, []);

  const startTestSession = useCallback(async () => {
    // Start a fresh test session with authentication
    setTestSession({
      isActive: true,
      token: null,
      startTime: new Date()
    });

    try {
      const loginResult = await api.auth.login({ 
        email: 'admin@admin.com', 
        password: 'Safe123' 
      });
      
      if (loginResult?.token) {
        setAuthToken(loginResult.token);
        localStorage.setItem('api_test_token', loginResult.token);
        setTestSession(prev => ({ 
          ...prev, 
          token: loginResult.token 
        }));
      }
    } catch (error) {
      console.error('Failed to start test session:', error);
    }
  }, []);

  const endTestSession = useCallback(async () => {
    if (authToken) {
      try {
        await api.auth.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    
    setAuthToken(null);
    localStorage.removeItem('api_test_token');
    setTestSession({
      isActive: false,
      token: null,
      startTime: null
    });
  }, [authToken]);

  const executeTest = useCallback(async (method: ApiMethod) => {
    const testKey = `${method.category}-${method.name}`;
    
    setTestResults(prev => ({
      ...prev,
      [testKey]: { status: 'running', timestamp: new Date() }
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
    
    // Start test session if not active and category requires auth
    const hasAuthMethods = filteredMethods.some(m => m.requiresAuth);
    if (hasAuthMethods && !testSession.isActive) {
      await startTestSession();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for auth
    }
    
    // Filter methods based on auth availability
    const categoryMethods = filteredMethods.filter(m => 
      !m.requiresAuth || (m.requiresAuth && authToken)
    );
    
    for (const method of categoryMethods) {
      // Skip logout in category tests to preserve session
      if (method.name !== 'Logout') {
        await executeTest(method);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay between tests
      }
    }
    
    setIsRunning(false);
  }, [filteredMethods, authToken, testSession.isActive, startTestSession, executeTest]);

  const runPublicOnlyTests = useCallback(async () => {
    setIsRunning(true);
    
    const publicMethods = getPublicMethods(apiMethods);
    
    for (const method of publicMethods) {
      await executeTest(method);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  }, [apiMethods, executeTest]);

  const runAuthenticatedTests = useCallback(async () => {
    setIsRunning(true);
    
    // Start fresh session
    await startTestSession();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for auth
    
    const authMethods = getAuthRequiredMethods(apiMethods).filter(m => 
      m.name !== 'Login' && m.name !== 'Logout' // Skip these special methods
    );
    
    for (const method of authMethods) {
      if (authToken) { // Double check we still have token
        await executeTest(method);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setIsRunning(false);
  }, [apiMethods, authToken, startTestSession, executeTest]);

  const runCompleteTestSuite = useCallback(async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      // 1. Test public endpoints first
      console.log('🔍 Testing public endpoints...');
      const publicMethods = getPublicMethods(apiMethods);
      for (const method of publicMethods) {
        await executeTest(method);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 2. Start auth session and test authenticated endpoints
      console.log('🔐 Starting authenticated test session...');
      await startTestSession();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (authToken) {
        const authMethods = getAuthRequiredMethods(apiMethods).filter(m => 
          m.name !== 'Login' && m.name !== 'Logout'
        );
        
        for (const method of authMethods) {
          await executeTest(method);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // 3. Test logout last
      console.log('🚪 Testing logout...');
      const logoutMethod = apiMethods.find(m => m.name === 'Logout');
      if (logoutMethod && authToken) {
        await executeTest(logoutMethod);
      }
      
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      await endTestSession();
      setIsRunning(false);
    }
  }, [apiMethods, authToken, startTestSession, endTestSession, executeTest]);

  const clearResults = useCallback(() => setTestResults({}), []);

  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      baseUrl,
      testSession: {
        ...testSession,
        duration: testSession.startTime ? 
          Date.now() - testSession.startTime.getTime() : 0
      },
      results: testResults,
      summary: {
        totalMethods: apiMethods.length,
        testedMethods: Object.keys(testResults).length,
        categories: Object.keys(CATEGORIES),
        ...stats
      },
      issues: {
        authTokenLoss: !authToken && stats.failed > 0,
        backendErrors: Object.values(testResults).some(r => 
          r.error?.includes('500') || r.error?.includes('Concept.find')
        )
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [baseUrl, testSession, testResults, apiMethods.length, stats, authToken]);

  const copyToken = useCallback(() => {
    if (authToken) navigator.clipboard.writeText(authToken);
  }, [authToken]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'running': return <Loader2 className="animate-spin" size={20} />;
      default: return <AlertCircle size={20} />;
    }
  }, []);

  // ==================== RENDER ====================
  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>Complete API Test Suite</PageTitle>
            <PageSubtitle>Testing all {apiMethods.length} available endpoints</PageSubtitle>
          </HeaderLeft>
          
          <HeaderRight>
            <ConnectionBadge $status={connectionStatus}>
              {connectionStatus}
            </ConnectionBadge>
            
            {authToken && (
              <AuthTokenBadge onClick={copyToken} title="Click to copy token">
                <Key size={16} />
                <span>Authenticated</span>
                <Copy size={14} />
              </AuthTokenBadge>
            )}

            {testSession.isActive && (
              <SecondaryButton onClick={endTestSession}>
                <AlertTriangle size={16} />
                End Session
              </SecondaryButton>
            )}
          </HeaderRight>
        </PageHeader>

        {stats.total > 0 && (
          <StatsOverview>
            <StatCard>
              <StatIcon $statusColor="#666666">
                <Terminal size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Tests</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon $statusColor="#16a34a">
                <CheckCircle size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{stats.passed}</StatValue>
                <StatLabel>Passed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon $statusColor="#dc2626">
                <XCircle size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{stats.failed}</StatValue>
                <StatLabel>Failed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon $statusColor="#2563eb">
                <Loader2 size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{stats.running}</StatValue>
                <StatLabel>Running</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon $statusColor="#64748b">
                <Route size={24} />
              </StatIcon>
              <StatContent>
                <StatValue>{apiMethods.length}</StatValue>
                <StatLabel>Available</StatLabel>
              </StatContent>
            </StatCard>
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
          </TabRow>

          <TabContent>
            {activeTab === 0 && (
              <>
                <ControlPanel>
                  <CategoryGrid>
                    {Object.entries(CATEGORIES).map(([key, category]) => {
                      const IconComponent = getIconComponent(category.icon);
                      const categoryMethods = getMethodsByCategory(apiMethods, key);
                      const categoryResults = Object.entries(testResults)
                        .filter(([k]) => k.startsWith(key))
                        .map(([, r]) => r);
                      const passed = categoryResults.filter(r => r.status === 'success').length;
                      const failed = categoryResults.filter(r => r.status === 'error').length;
                      const total = categoryMethods.length;
                      
                      return (
                        <CategoryCard
                          key={key}
                          $active={selectedCategory === key}
                          $color={category.color}
                          onClick={() => setSelectedCategory(key)}
                        >
                          <CategoryIcon $color={category.color}>
                            <IconComponent size={24} />
                          </CategoryIcon>
                          <CategoryName>{category.name}</CategoryName>
                          <CategoryStats>
                            {categoryResults.length > 0 ? (
                              <>
                                <span style={{ color: '#16a34a', fontWeight: '500' }}>{passed}</span>
                                <span style={{ color: '#666' }}>/</span>
                                <span style={{ color: failed > 0 ? '#dc2626' : '#666' }}>{total}</span>
                                {failed > 0 && (
                                  <>
                                    <span style={{ color: '#666' }}> (</span>
                                    <span style={{ color: '#dc2626' }}>{failed} failed</span>
                                    <span style={{ color: '#666' }}>)</span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span style={{ color: '#999999' }}>{total} methods</span>
                            )}
                          </CategoryStats>
                        </CategoryCard>
                      );
                    })}
                  </CategoryGrid>

                  <ActionPanel>
                    <ActionBar>
                      <ActionGroup>
                        <PrimaryButton onClick={runPublicOnlyTests} disabled={isRunning}>
                          <Heart size={16} />
                          Public Only
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runAuthenticatedTests} disabled={isRunning}>
                          <Shield size={16} />
                          Auth Required
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runCategoryTests} disabled={isRunning}>
                          <Play size={16} />
                          Test {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
                        </PrimaryButton>

                        <PrimaryButton onClick={runCompleteTestSuite} disabled={isRunning}>
                          <Terminal size={16} />
                          Complete Suite
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
                            Export Results
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
                      ({filteredMethods.length} of {apiMethods.length} total)
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
                              <StatusIcon $status={result?.status}>
                                {result ? getStatusIcon(result.status) : <AlertCircle size={20} />}
                              </StatusIcon>
                              
                              <RouteInfo>
                                <RouteName>{method.name}</RouteName>
                                <RouteDescription>{method.description}</RouteDescription>
                                
                                <RouteTags>
                                  <MethodBadge $method={method.method}>{method.method}</MethodBadge>
                                  
                                  {method.requiresAuth ? (
                                    <RouteTag $type="auth">
                                      <Shield size={14} />
                                      Auth Required
                                    </RouteTag>
                                  ) : (
                                    <RouteTag $type="public">
                                      Public
                                    </RouteTag>
                                  )}
                                </RouteTags>
                              </RouteInfo>
                            </RouteLeft>
                            
                            <RouteActions>
                              {result?.duration && (
                                <span style={{ 
                                  fontSize: '0.875rem', 
                                  color: '#666666', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px' 
                                }}>
                                  <Clock size={14} />
                                  {result.duration}ms
                                </span>
                              )}
                              
                              <TestButton
                                $status={result?.status}
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
                                <span style={{ fontSize: '0.875rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '1px' }}>Test Data:</span>
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
                                <span style={{ fontSize: '0.875rem', color: '#666666' }}>
                                  {result.duration}ms • {result.timestamp?.toLocaleTimeString()}
                                </span>
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
                              <ErrorTitle>
                                <XCircle size={16} />
                                Error
                              </ErrorTitle>
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
                    
                    <ConfigRow>
                      <ConfigLabel>Test Session Active</ConfigLabel>
                      <ConfigValue>{testSession.isActive ? 'Yes' : 'No'}</ConfigValue>
                    </ConfigRow>

                    <ConfigRow>
                      <ConfigLabel>Session Duration</ConfigLabel>
                      <ConfigValue>
                        {testSession.startTime ? 
                          `${Math.floor((Date.now() - testSession.startTime.getTime()) / 1000)}s` : 
                          'N/A'
                        }
                      </ConfigValue>
                    </ConfigRow>
                    
                    <ConfigRow>
                      <ConfigLabel>Total API Methods</ConfigLabel>
                      <ConfigValue>{apiMethods.length}</ConfigValue>
                    </ConfigRow>

                    <ConfigRow>
                      <ConfigLabel>Public Methods</ConfigLabel>
                      <ConfigValue>{getPublicMethods(apiMethods).length}</ConfigValue>
                    </ConfigRow>

                    <ConfigRow>
                      <ConfigLabel>Auth Required Methods</ConfigLabel>
                      <ConfigValue>{getAuthRequiredMethods(apiMethods).length}</ConfigValue>
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
                  </ConfigContent>
                  
                  <ConfigActions>
                    <SecondaryButton onClick={checkConnection}>
                      <RefreshCw size={16} />
                      Test Connection
                    </SecondaryButton>
                    
                    <SecondaryButton onClick={startTestSession} disabled={testSession.isActive}>
                      <Shield size={16} />
                      Start Session
                    </SecondaryButton>
                    
                    {(authToken || testSession.isActive) && (
                      <SecondaryButton onClick={endTestSession}>
                        <Key size={16} />
                        End Session
                      </SecondaryButton>
                    )}
                  </ConfigActions>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigTitle>API Coverage Summary</ConfigTitle>
                  </ConfigHeader>
                  
                  <ConfigContent>
                    {Object.entries(CATEGORIES).map(([key, category]) => {
                      const methods = getMethodsByCategory(apiMethods, key);
                      const categoryResults = Object.entries(testResults)
                        .filter(([k]) => k.startsWith(key))
                        .map(([, r]) => r);
                      const passed = categoryResults.filter(r => r.status === 'success').length;
                      const failed = categoryResults.filter(r => r.status === 'error').length;
                      
                      return (
                        <ConfigRow key={key}>
                          <ConfigLabel>{category.name}</ConfigLabel>
                          <ConfigValue>
                            {methods.length} endpoints
                            {categoryResults.length > 0 && (
                              <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>
                                (<span style={{ color: '#16a34a' }}>{passed}</span>/
                                <span style={{ color: failed > 0 ? '#dc2626' : '#666' }}>{methods.length}</span>)
                              </span>
                            )}
                          </ConfigValue>
                        </ConfigRow>
                      );
                    })}
                  </ConfigContent>
                </ConfigCard>

                <ConfigCard>
                  <ConfigHeader>
                    <ConfigTitle>Known Issues</ConfigTitle>
                  </ConfigHeader>
                  
                  <ConfigContent>
                    <ConfigRow>
                      <ConfigLabel>Concept Model Error</ConfigLabel>
                      <ConfigValue>Backend concept routes failing</ConfigValue>
                    </ConfigRow>
                    
                    <ConfigRow>
                      <ConfigLabel>Educational Client</ConfigLabel>
                      <ConfigValue>Extended methods not working</ConfigValue>
                    </ConfigRow>
                    
                    <ConfigRow>
                      <ConfigLabel>Auth Token Loss</ConfigLabel>
                      <ConfigValue>Session management needed</ConfigValue>
                    </ConfigRow>
                  </ConfigContent>
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
                  </QuickLinks>
                </ConfigCard>
              </ConfigSection>
            )}
          </TabContent>
        </MainCard>
      </Container>
    </PageWrapper>
  );
};