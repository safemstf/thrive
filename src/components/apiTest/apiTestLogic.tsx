// src/components/apiTest/apiTestLogic.tsx - Updated to use complete API methods
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  Play, Shield, Settings, Route, Heart, Book, Users,
  Terminal, Copy, Download, ExternalLink, Clock, Key,
  User, TrendingUp, Zap
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

  // ==================== COMPUTED VALUES ====================
  // NOW USING THE COMPLETE API METHODS!
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
    if (token) setAuthToken(token);
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
    const categoryMethods = filteredMethods.filter(m => !m.requiresAuth || authToken);
    
    for (const method of categoryMethods) {
      await executeTest(method);
    }
    
    setIsRunning(false);
  }, [filteredMethods, authToken, executeTest]);

  const runAuthFlow = useCallback(async () => {
    setIsRunning(true);
    
    const loginMethod = apiMethods.find(m => m.name === 'Login');
    if (loginMethod) {
      await executeTest(loginMethod);
      
      setTimeout(async () => {
        const userMethod = apiMethods.find(m => m.name === 'Get Current User');
        if (userMethod) await executeTest(userMethod);
        setIsRunning(false);
      }, 500);
    } else {
      setIsRunning(false);
    }
  }, [apiMethods, executeTest]);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    
    // First run auth flow
    const loginMethod = apiMethods.find(m => m.name === 'Login');
    if (loginMethod) {
      await executeTest(loginMethod);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Then run all available methods
    const availableMethods = apiMethods.filter(m => !m.requiresAuth || authToken);
    for (const method of availableMethods) {
      if (method.name !== 'Login') { // Skip login since we already did it
        await executeTest(method);
      }
    }
    
    setIsRunning(false);
  }, [apiMethods, authToken, executeTest]);

  const clearResults = useCallback(() => setTestResults({}), []);

  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      baseUrl,
      results: testResults,
      summary: {
        totalMethods: apiMethods.length,
        testedMethods: Object.keys(testResults).length,
        categories: Object.keys(CATEGORIES),
        ...stats
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [baseUrl, testResults, apiMethods.length, stats]);

  const copyToken = useCallback(() => {
    if (authToken) navigator.clipboard.writeText(authToken);
  }, [authToken]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'success': return <CheckCircle style={{ color: '#666666' }} size={20} />;
      case 'error': return <XCircle style={{ color: '#999999' }} size={20} />;
      case 'running': return <Loader2 style={{ color: '#2c2c2c' }} className="animate-spin" size={20} />;
      default: return <AlertCircle style={{ color: '#cccccc' }} size={20} />;
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
          </HeaderRight>
        </PageHeader>

        {stats.total > 0 && (
          <StatsOverview>
            <StatCard>
              <StatIcon><Terminal size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total Tests</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#666666">
              <StatIcon><CheckCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.passed}</StatValue>
                <StatLabel>Passed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#999999">
              <StatIcon><XCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.failed}</StatValue>
                <StatLabel>Failed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#2c2c2c">
              <StatIcon><Loader2 size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.running}</StatValue>
                <StatLabel>Running</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#555555">
              <StatIcon><Route size={24} /></StatIcon>
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
                                <span style={{ color: '#666666' }}>{passed}</span>
                                <span style={{ color: '#999999' }}>/</span>
                                <span>{total}</span>
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
                        <PrimaryButton onClick={runAuthFlow} disabled={isRunning}>
                          <Shield size={16} />
                          Auth Flow
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runCategoryTests} disabled={isRunning}>
                          <Play size={16} />
                          Test {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
                        </PrimaryButton>

                        <PrimaryButton onClick={runAllTests} disabled={isRunning}>
                          <Terminal size={16} />
                          Run All Tests
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
                              <StatusIcon>
                                {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#cccccc' }} size={20} />}
                              </StatusIcon>
                              
                              <RouteInfo>
                                <RouteName>{method.name}</RouteName>
                                <RouteDescription>{method.description}</RouteDescription>
                                
                                <RouteTags>
                                  <MethodBadge $method={method.method}>{method.method}</MethodBadge>
                                  
                                  {method.requiresAuth && (
                                    <RouteTag $type="auth">
                                      Auth Required
                                    </RouteTag>
                                  )}
                                </RouteTags>
                              </RouteInfo>
                            </RouteLeft>
                            
                            <RouteActions>
                              {result?.duration && (
                                <span style={{ fontSize: '0.875rem', color: '#666666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={14} />
                                  {result.duration}ms
                                </span>
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
                    
                    {authToken && (
                      <SecondaryButton onClick={() => {
                        setAuthToken(null);
                        localStorage.removeItem('api_test_token');
                      }}>
                        <Key size={16} />
                        Clear Auth
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
                      return (
                        <ConfigRow key={key}>
                          <ConfigLabel>{category.name}</ConfigLabel>
                          <ConfigValue>{methods.length} endpoints</ConfigValue>
                        </ConfigRow>
                      );
                    })}
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