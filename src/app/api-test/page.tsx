// src\app\api-test\page.tsx
'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  ExternalLink, Terminal, Settings, AlertTriangle, Route,
  Shield, User, Book, Image, Database, Upload, Play,
  Briefcase, Users, BarChart3, Code, Key, Lock,
  WifiOff, Activity, Filter, Download, Copy, Check,
  Heart, Zap, TrendingUp, Award, Eye, Clock
} from 'lucide-react';
import { API_ROUTES, RouteDefinition, replaceRouteParams } from '@/config/api-routes';
import { useApiTester } from '@/hooks/useApiTester';
import type { LucideIcon } from 'lucide-react'; 

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  health: Heart,
  auth: Shield,
  portfolios: Briefcase,
  gallery: Image,
  users: Users,
  books: Book,
  concepts: Database,
  progress: BarChart3,
  simulations: Zap,
};


// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, string> = {
  health: '#4caf50',
  auth: '#ff9800',
  portfolios: '#2196f3',
  gallery: '#9c27b0',
  users: '#f44336',
  books: '#00bcd4',
  concepts: '#673ab7',
  progress: '#009688',
  simulations: '#ffc107',
};

export default function EnhancedApiTestPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [filters, setFilters] = useState({ 
    showPassed: true, 
    showFailed: true, 
    showPending: true,
    showAuth: true,
    showPublic: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set());

  const baseUrl = process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000';

  const {
    testRoute,
    testRoutes,
    results,
    isRunning,
    clearResults,
    authToken,
  } = useApiTester({
    baseUrl: baseUrl.replace(/\/$/, ''),
  });

  // Check initial connection
  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-save auth token to localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('api_test_token', authToken);
    }
  }, [authToken]);

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const response = await fetch(`${baseUrl}/health`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendInfo(data);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const runCategoryTests = async () => {
    const routes = API_ROUTES[selectedCategory]?.routes || [];
    await testRoutes(routes, selectedCategory);
  };

  const runSelectedTests = async () => {
    const routes = API_ROUTES[selectedCategory]?.routes.filter(route => {
      const testKey = `${selectedCategory}-${route.name}`;
      return selectedRoutes.has(testKey);
    }) || [];
    
    await testRoutes(routes, selectedCategory);
  };

  const runAllTests = async () => {
    clearResults();
    
    // Test in specific order for dependencies
    const testOrder = ['health', 'auth', 'portfolios', 'gallery', 'users', 'books', 'concepts', 'progress', 'simulations'];
    
    for (const category of testOrder) {
      if (API_ROUTES[category]) {
        await testRoutes(API_ROUTES[category].routes, category);
      }
    }
  };

  const runAuthFlow = async () => {
    // Special flow for authentication testing
    const authRoutes = API_ROUTES.auth.routes.filter(r => 
      ['Login', 'Get Current User', 'Verify Token'].includes(r.name)
    );
    
    await testRoutes(authRoutes, 'auth');
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      baseUrl,
      results: Object.entries(results).map(([key, result]) => ({
        key,
        ...result,
        response: result.response ? {
          status: result.response.status,
          duration: result.response.duration,
          data: result.response.data
        } : undefined
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`;
    a.click();
  };

  const copyToken = () => {
    if (authToken) {
      navigator.clipboard.writeText(authToken);
    }
  };

  const stats = useMemo(() => {
    const allResults = Object.values(results);
    const categoryResults = Object.entries(results)
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
  }, [results, selectedCategory]);

  const filteredRoutes = useMemo(() => {
    const routes = API_ROUTES[selectedCategory]?.routes || [];
    
    return routes.filter(route => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          route.name.toLowerCase().includes(query) ||
          route.endpoint.toLowerCase().includes(query) ||
          route.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Auth filter
      if (!filters.showAuth && route.needsAuth) return false;
      if (!filters.showPublic && !route.needsAuth) return false;
      
      // Status filter
      const testKey = `${selectedCategory}-${route.name}`;
      const result = results[testKey];
      
      if (result) {
        if (!filters.showPassed && result.status === 'success') return false;
        if (!filters.showFailed && result.status === 'error') return false;
      } else {
        if (!filters.showPending) return false;
      }
      
      return true;
    });
  }, [selectedCategory, searchQuery, filters, results]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle style={{ color: '#4caf50' }} size={20} />;
      case 'error':
        return <XCircle style={{ color: '#f44336' }} size={20} />;
      case 'running':
        return <Loader2 style={{ color: '#2196f3' }} className="animate-spin" size={20} />;
      default:
        return <AlertCircle style={{ color: '#666666' }} size={20} />;
    }
  };

  const toggleRouteSelection = (testKey: string) => {
    setSelectedRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testKey)) {
        newSet.delete(testKey);
      } else {
        newSet.add(testKey);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const allKeys = filteredRoutes.map(route => `${selectedCategory}-${route.name}`);
    setSelectedRoutes(new Set(allKeys));
  };

  const clearSelection = () => {
    setSelectedRoutes(new Set());
  };

  return (
    <PageWrapper>
      <Container>
        <PageHeader>
          <HeaderLeft>
            <PageTitle>API Test Suite</PageTitle>
            <PageSubtitle>Comprehensive endpoint testing and diagnostics</PageSubtitle>
          </HeaderLeft>
          
          <HeaderRight>
            <ConnectionBadge $status={connectionStatus}>
              {connectionStatus === 'connected' ? <Activity size={16} /> : <WifiOff size={16} />}
              {connectionStatus}
            </ConnectionBadge>
            
            {authToken && (
              <AuthTokenBadge onClick={copyToken} title="Click to copy token">
                <Key size={16} />
                <span>Token Active</span>
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
            
            <StatCard $color="#4caf50">
              <StatIcon><CheckCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.passed}</StatValue>
                <StatLabel>Passed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#f44336">
              <StatIcon><XCircle size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.failed}</StatValue>
                <StatLabel>Failed</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard $color="#2196f3">
              <StatIcon><Loader2 size={24} /></StatIcon>
              <StatContent>
                <StatValue>{stats.running}</StatValue>
                <StatLabel>Running</StatLabel>
              </StatContent>
            </StatCard>
            
            <ProgressCard>
              <ProgressBar>
                <ProgressFill 
                  $width={(stats.passed / stats.total) * 100}
                  $color="#4caf50"
                />
              </ProgressBar>
              <ProgressLabel>
                {Math.round((stats.passed / stats.total) * 100)}% Success Rate
              </ProgressLabel>
            </ProgressCard>
          </StatsOverview>
        )}

        <MainCard>
          <TabRow>
            <TabButton $active={activeTab === 0} onClick={() => setActiveTab(0)}>
              <Route size={18} /> Route Testing
            </TabButton>
            <TabButton $active={activeTab === 1} onClick={() => setActiveTab(1)}>
              <Settings size={18} /> Configuration
            </TabButton>
            <TabButton $active={activeTab === 2} onClick={() => setActiveTab(2)}>
              <Code size={18} /> Integration Guide
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
                    {Object.entries(API_ROUTES).map(([key, category]) => {
                      const Icon = CATEGORY_ICONS[key] || Settings;
                      const categoryResults = Object.entries(results).filter(([k]) => k.startsWith(key));
                      const passed = categoryResults.filter(([, r]) => r.status === 'success').length;
                      const total = category.routes.length;
                      const hasResults = categoryResults.length > 0;
                      
                      return (
                        <CategoryCard
                          key={key}
                          $active={selectedCategory === key}
                          $color={CATEGORY_COLORS[key]}
                          onClick={() => setSelectedCategory(key)}
                        >
                          <CategoryIcon $color={CATEGORY_COLORS[key]}>
                            <Icon size={24} />
                          </CategoryIcon>
                          <CategoryName>{category.name}</CategoryName>
                          <CategoryStats>
                            {hasResults ? (
                              <>
                                <span style={{ color: '#4caf50' }}>{passed}</span>
                                <span style={{ color: '#666' }}>/</span>
                                <span>{total}</span>
                              </>
                            ) : (
                              <span style={{ color: '#666' }}>{total} routes</span>
                            )}
                          </CategoryStats>
                          {hasResults && (
                            <CategoryProgress>
                              <CategoryProgressFill 
                                $width={(passed / total) * 100}
                                $color={CATEGORY_COLORS[key]}
                              />
                            </CategoryProgress>
                          )}
                        </CategoryCard>
                      );
                    })}
                  </CategoryGrid>

                  <ActionPanel>
                    <SearchBar>
                      <SearchInput
                        type="text"
                        placeholder="Search routes by name, endpoint, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </SearchBar>

                    <FilterBar>
                      <FilterGroup>
                        <FilterButton
                          $active={filters.showPassed}
                          onClick={() => setFilters(prev => ({ ...prev, showPassed: !prev.showPassed }))}
                        >
                          <CheckCircle size={16} />
                          Passed
                        </FilterButton>
                        <FilterButton
                          $active={filters.showFailed}
                          onClick={() => setFilters(prev => ({ ...prev, showFailed: !prev.showFailed }))}
                        >
                          <XCircle size={16} />
                          Failed
                        </FilterButton>
                        <FilterButton
                          $active={filters.showPending}
                          onClick={() => setFilters(prev => ({ ...prev, showPending: !prev.showPending }))}
                        >
                          <AlertCircle size={16} />
                          Pending
                        </FilterButton>
                      </FilterGroup>
                      
                      <FilterGroup>
                        <FilterButton
                          $active={filters.showAuth}
                          onClick={() => setFilters(prev => ({ ...prev, showAuth: !prev.showAuth }))}
                        >
                          <Lock size={16} />
                          Auth Required
                        </FilterButton>
                        <FilterButton
                          $active={filters.showPublic}
                          onClick={() => setFilters(prev => ({ ...prev, showPublic: !prev.showPublic }))}
                        >
                          <Eye size={16} />
                          Public
                        </FilterButton>
                      </FilterGroup>
                    </FilterBar>

                    <ActionBar>
                      <ActionGroup>
                        <PrimaryButton onClick={runAuthFlow} disabled={isRunning}>
                          <Shield size={16} />
                          Auth Flow
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runCategoryTests} disabled={isRunning}>
                          <Play size={16} />
                          Test {API_ROUTES[selectedCategory]?.name}
                        </PrimaryButton>
                        
                        <PrimaryButton onClick={runAllTests} disabled={isRunning}>
                          <Terminal size={16} />
                          Test All Routes
                        </PrimaryButton>
                      </ActionGroup>
                      
                      <ActionGroup>
                        {selectedRoutes.size > 0 && (
                          <SecondaryButton onClick={runSelectedTests} disabled={isRunning}>
                            <Play size={16} />
                            Test Selected ({selectedRoutes.size})
                          </SecondaryButton>
                        )}
                        
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
                      {API_ROUTES[selectedCategory]?.name} Routes
                      <RouteBadge>{filteredRoutes.length} of {API_ROUTES[selectedCategory]?.routes.length}</RouteBadge>
                    </SectionTitle>
                    
                    {filteredRoutes.length > 0 && (
                      <SelectionControls>
                        <SelectButton onClick={selectAllVisible}>Select All</SelectButton>
                        <SelectButton onClick={clearSelection}>Clear Selection</SelectButton>
                      </SelectionControls>
                    )}
                  </SectionHeader>

                  <RouteList>
                    {filteredRoutes.map(route => {
                      const testKey = `${selectedCategory}-${route.name}`;
                      const result = results[testKey];
                      const isSelected = selectedRoutes.has(testKey);
                      
                      return (
                        <RouteCard key={route.name} $status={result?.status} $selected={isSelected}>
                          <RouteHeader>
                            <RouteLeft>
                              <RouteCheckbox>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRouteSelection(testKey)}
                                />
                              </RouteCheckbox>
                              
                              <StatusIcon>
                                {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#666' }} size={20} />}
                              </StatusIcon>
                              
                              <RouteInfo>
                                <RouteName>{route.name}</RouteName>
                                <RouteEndpoint>
                                  <MethodBadge $method={route.method}>{route.method}</MethodBadge>
                                  <EndpointPath>{replaceRouteParams(route.endpoint, route.params)}</EndpointPath>
                                </RouteEndpoint>
                                <RouteDescription>{route.description}</RouteDescription>
                                
                                <RouteTags>
                                  {route.needsAuth && (
                                    <RouteTag $type="auth">
                                      <Lock size={12} />
                                      Auth Required
                                    </RouteTag>
                                  )}
                                  {route.skipInBatchTest && (
                                    <RouteTag $type="skip">
                                      <AlertTriangle size={12} />
                                      Skip in Batch
                                    </RouteTag>
                                  )}
                                </RouteTags>
                              </RouteInfo>
                            </RouteLeft>
                            
                            <RouteActions>
                              {result?.response && (
                                <ResponseTime $status={result.status}>
                                  <Clock size={14} />
                                  {result.response.duration}ms
                                </ResponseTime>
                              )}
                              
                              <TestButton
                                onClick={() => testRoute(route, selectedCategory)}
                                disabled={result?.status === 'running' || isRunning}
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
                          
                          {(route.body || route.queryParams) && (
                            <RouteDetails>
                              {route.body && (
                                <DetailSection>
                                  <DetailTitle>Request Body:</DetailTitle>
                                  <CodeBlock>
                                    {JSON.stringify(
                                      typeof route.body === 'function' ? route.body() : route.body,
                                      null,
                                      2
                                    )}
                                  </CodeBlock>
                                </DetailSection>
                              )}
                              
                              {route.queryParams && (
                                <DetailSection>
                                  <DetailTitle>Query Parameters:</DetailTitle>
                                  <CodeBlock>{JSON.stringify(route.queryParams, null, 2)}</CodeBlock>
                                </DetailSection>
                              )}
                            </RouteDetails>
                          )}
                          
                          {result?.response && (
                            <ResponseSection>
                              <ResponseHeader>
                                <ResponseStatus $success={result.status === 'success'}>
                                  {result.response.status} {result.response.statusText}
                                </ResponseStatus>
                                <ResponseMeta>
                                  <span>{result.response.duration}ms</span>
                                  <span>•</span>
                                  <span>{new Date().toLocaleTimeString()}</span>
                                </ResponseMeta>
                              </ResponseHeader>
                              
                              <ResponseBody>
                                <CodeBlock>
                                  {typeof result.response.data === 'string'
                                    ? result.response.data
                                    : JSON.stringify(result.response.data, null, 2)}
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
              <ConfigActions>
                <ConfigCard>
                  <ConfigCard>
                    <ConfigHeader>
                      <ConfigTitle>Connection Settings</ConfigTitle>
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
                        <ConfigLabel>NGROK URL</ConfigLabel>
                        <ConfigValue>{process.env.NEXT_PUBLIC_NGROK_URL || 'Not configured'}</ConfigValue>
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
                    </ConfigContent>
                    
                    <ConfigActions>
                      <ActionButton onClick={checkConnection}>
                        <RefreshCw size={16} />
                        Test Connection
                      </ActionButton>
                      
                      {authToken && (
                        <ActionButton onClick={() => {
                          localStorage.removeItem('api_test_token');
                          window.location.reload();
                        }}>
                          <Lock size={16} />
                          Clear Auth
                        </ActionButton>
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

                  <ConfigCard>
                    <ConfigHeader>
                      <ConfigTitle>Setup Instructions</ConfigTitle>
                    </ConfigHeader>
                    
                    <SetupSteps>
                      <SetupStep>
                        <StepNumber>1</StepNumber>
                        <StepContent>
                          <StepTitle>Start Backend Server</StepTitle>
                          <CodeSnippet>cd backend && npm start</CodeSnippet>
                        </StepContent>
                      </SetupStep>
                      
                      <SetupStep>
                        <StepNumber>2</StepNumber>
                        <StepContent>
                          <StepTitle>Start Ngrok Tunnel</StepTitle>
                          <CodeSnippet>ngrok http 5000</CodeSnippet>
                        </StepContent>
                      </SetupStep>
                      
                      <SetupStep>
                        <StepNumber>3</StepNumber>
                        <StepContent>
                          <StepTitle>Update Environment</StepTitle>
                          <CodeSnippet>NEXT_PUBLIC_NGROK_URL=https://xxx.ngrok.io</CodeSnippet>
                          <StepNote>No trailing slash!</StepNote>
                        </StepContent>
                      </SetupStep>
                      
                      <SetupStep>
                        <StepNumber>4</StepNumber>
                        <StepContent>
                          <StepTitle>Restart Next.js</StepTitle>
                          <CodeSnippet>npm run dev</CodeSnippet>
                        </StepContent>
                      </SetupStep>
                    </SetupSteps>
                  </ConfigCard>
                </ConfigCard>
              </ConfigActions>
            )}

            {activeTab === 2 && (
              <IntegrationSection>
                <IntegrationCard>
                  <CardHeader>
                    <CardIcon $color="#ff9800"><Code size={24} /></CardIcon>
                    <CardTitle>Example Integration Flow</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CodeExample>
{`// 1. Login
POST /api/auth/login
{ "usernameOrEmail": "user@example.com", "password": "password" }

// 2. Get/Create Portfolio
GET /api/portfolios/me
// or
POST /api/portfolios/me/create
{ "username": "myusername", "name": "My Portfolio", "bio": "Artist bio" }

// 3. Upload Gallery Piece
POST /api/gallery
{ 
  "title": "My Artwork",
  "portfolioId": "portfolio-id-from-step-2",
  "visibility": "public",
  "category": "digital"
}

// 4. Manage Gallery through Portfolio
PUT /api/portfolios/me/gallery/batch/visibility
{ "pieceIds": ["id1", "id2"], "visibility": "public" }`}
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
                      <strong>"Failed to fetch"</strong>
                      <span>Backend not running or wrong URL configured</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>404 Not Found</strong>
                      <span>Route doesn't exist or incorrect path parameters</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>CORS errors</strong>
                      <span>Missing CORS headers on backend</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>401 Unauthorized</strong>
                      <span>Need to login first or token expired</span>
                    </DiagnosticItem>
                    <DiagnosticItem>
                      <strong>Portfolio Not Found</strong>
                      <span>User needs to create portfolio first</span>
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
                      <CommandTitle>Test Backend Health</CommandTitle>
                      <CodeBlock>
{`fetch('${baseUrl}/health', {
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(r => r.json()).then(console.log)`}
                      </CodeBlock>
                    </DebugCommand>
                    
                    <DebugCommand>
                      <CommandTitle>Test Login</CommandTitle>
                      <CodeBlock>
{`fetch('${baseUrl}/api/auth/login', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    usernameOrEmail: 'admin@admin.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log)`}
                      </CodeBlock>
                    </DebugCommand>
                  </DebugCommands>
                </DiagnosticCard>

                <DiagnosticCard $type="success">
                  <DiagnosticHeader>
                    <CheckCircle size={24} />
                    <h3>Health Checks</h3>
                  </DiagnosticHeader>
                  
                  <HealthChecks>
                    <HealthCheck>
                      <HealthIcon $status={connectionStatus === 'connected'}>
                        {connectionStatus === 'connected' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </HealthIcon>
                      <HealthLabel>Backend Connection</HealthLabel>
                      <HealthStatus>{connectionStatus}</HealthStatus>
                    </HealthCheck>
                    
                    <HealthCheck>
                      <HealthIcon $status={!!authToken}>
                        {authToken ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </HealthIcon>
                      <HealthLabel>Authentication</HealthLabel>
                      <HealthStatus>{authToken ? 'Authenticated' : 'Not authenticated'}</HealthStatus>
                    </HealthCheck>
                    
                    <HealthCheck>
                      <HealthIcon $status={stats.passed > 0}>
                        {stats.passed > 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      </HealthIcon>
                      <HealthLabel>Test Success Rate</HealthLabel>
                      <HealthStatus>
                        {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : 'No tests run'}
                      </HealthStatus>
                    </HealthCheck>
                  </HealthChecks>
                </DiagnosticCard>
              </DiagnosticsSection>
            )}
          </TabContent>
        </MainCard>
      </Container>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #ffffff;
`;

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #888888;
  margin: 0;
`;

const ConnectionBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ $status }) => 
    $status === 'connected' ? 'rgba(76, 175, 80, 0.1)' : 
    $status === 'disconnected' ? 'rgba(244, 67, 54, 0.1)' : 
    'rgba(33, 150, 243, 0.1)'};
  color: ${({ $status }) => 
    $status === 'connected' ? '#4caf50' : 
    $status === 'disconnected' ? '#f44336' : 
    '#2196f3'};
  border: 1px solid currentColor;
`;

const AuthTokenBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid #667eea;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateY(-1px);
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $color?: string }>`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  ${({ $color }) => $color && `
    border-color: ${$color}33;
    background: ${$color}0a;
    
    svg {
      color: ${$color};
    }
  `}
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
  margin-top: 0.25rem;
`;

const ProgressCard = styled.div`
  grid-column: span 2;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: #888888;
  text-align: center;
`;

const MainCard = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`;

const TabRow = styled.div`
  display: flex;
  background: #0f0f0f;
  border-bottom: 1px solid #2a2a2a;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  background: ${({ $active }) => ($active ? "#1a1a1a" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#888888")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? "#667eea" : "transparent")};
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#1a1a1a" : "#151515")};
    color: #ffffff;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const ControlPanel = styled.div`
  margin-bottom: 2rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CategoryCard = styled.button<{ $active: boolean; $color: string }>`
  background: ${({ $active }) => $active ? '#0f0f0f' : '#0a0a0a'};
  border: 2px solid ${({ $active, $color }) => $active ? $color : '#2a2a2a'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: #0f0f0f;
    border-color: ${({ $color }) => $color};
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}1a`};
  border-radius: 12px;
  color: ${({ $color }) => $color};
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const CategoryStats = styled.div`
  font-size: 0.875rem;
  color: #888888;
`;

const CategoryProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #2a2a2a;
`;

const CategoryProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #666666;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? '#667eea' : '#2a2a2a'};
  background: ${({ $active }) => $active ? 'rgba(102, 126, 234, 0.1)' : '#0f0f0f'};
  color: ${({ $active }) => $active ? '#667eea' : '#666666'};
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(102, 126, 234, 0.2)' : '#1a1a1a'};
    color: ${({ $active }) => $active ? '#667eea' : '#ffffff'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: #667eea;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5a67d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  color: #888888;
  
  &:hover:not(:disabled) {
    background: #1a1a1a;
    color: #ffffff;
    border-color: #3a3a3a;
    box-shadow: none;
  }
`;

const ActionButton = styled(SecondaryButton)``;

const RouteSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RouteBadge = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #666666;
  background: #0f0f0f;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

const SelectionControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SelectButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
  color: #888888;
  background: transparent;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0f0f0f;
    color: #ffffff;
    border-color: #3a3a3a;
  }
`;

const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RouteCard = styled.div<{ $status?: string; $selected?: boolean }>`
  background: #0f0f0f;
  border: 2px solid ${({ $status, $selected }) => 
    $selected ? '#667eea' :
    $status === 'success' ? '#4caf5033' : 
    $status === 'error' ? '#f4433633' : 
    $status === 'running' ? '#2196f333' : 
    '#2a2a2a'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #151515;
  }
`;

const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const RouteLeft = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
`;

const RouteCheckbox = styled.div`
  padding-top: 0.125rem;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const StatusIcon = styled.div``;

const RouteInfo = styled.div`
  flex: 1;
`;

const RouteName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.375rem;
  font-size: 1rem;
`;

const RouteEndpoint = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
`;

const EndpointPath = styled.span`
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #888888;
`;

const RouteDescription = styled.div`
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 0.5rem;
`;

const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ $method }) => 
    $method === 'GET' ? 'rgba(33, 150, 243, 0.2)' :
    $method === 'POST' ? 'rgba(76, 175, 80, 0.2)' :
    $method === 'PUT' || $method === 'PATCH' ? 'rgba(255, 152, 0, 0.2)' :
    $method === 'DELETE' ? 'rgba(244, 67, 54, 0.2)' :
    'rgba(158, 158, 158, 0.2)'};
  color: ${({ $method }) => 
    $method === 'GET' ? '#2196f3' :
    $method === 'POST' ? '#4caf50' :
    $method === 'PUT' || $method === 'PATCH' ? '#ff9800' :
    $method === 'DELETE' ? '#f44336' :
    '#9e9e9e'};
`;

const RouteTags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const RouteTag = styled.div<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${({ $type }) => 
    $type === 'auth' ? 'rgba(255, 152, 0, 0.1)' :
    $type === 'skip' ? 'rgba(244, 67, 54, 0.1)' :
    'rgba(158, 158, 158, 0.1)'};
  color: ${({ $type }) => 
    $type === 'auth' ? '#ff9800' :
    $type === 'skip' ? '#f44336' :
    '#9e9e9e'};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const RouteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ResponseTime = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
  color: ${({ $status }) => $status === 'success' ? '#4caf50' : '#f44336'};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const TestButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: #0a0a0a;
  color: #888888;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #667eea;
    color: #ffffff;
    border-color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RouteDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #2a2a2a;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const DetailSection = styled.div``;

const DetailTitle = styled.div`
  font-size: 0.813rem;
  font-weight: 600;
  color: #888888;
  margin-bottom: 0.5rem;
`;

const CodeBlock = styled.pre`
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  max-height: 200px;
  color: #cccccc;
`;

const ResponseSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #2a2a2a;
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ResponseStatus = styled.div<{ $success: boolean }>`
  font-weight: 600;
  color: ${({ $success }) => $success ? '#4caf50' : '#f44336'};
`;

const ResponseMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: #666666;
`;

const ResponseBody = styled.div``;

const ErrorSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
  color: #f44336;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #ff8a80;
  font-size: 0.875rem;
`;

// Configuration Tab Styles
const ConfigActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #2a2a2a;
  display: flex;
  gap: 1rem;
`;

const QuickLinks = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const QuickLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #888888;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: #2a2a2a;
    color: #ffffff;
    border-color: #3a3a3a;
  }
`;

const SetupSteps = styled.div`
  padding: 1.5rem;
`;

const SetupStep = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const CodeSnippet = styled.code`
  display: block;
  padding: 0.5rem 0.75rem;
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.813rem;
  color: #667eea;
  margin-bottom: 0.25rem;
`;

const StepNote = styled.div`
  font-size: 0.813rem;
  color: #ff9800;
  font-style: italic;
`;

// Integration Tab Styles
const IntegrationSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const IntegrationCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a2a;
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => `${$color}1a`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  
  p {
    margin: 0 0 1rem 0;
    color: #888888;
    line-height: 1.6;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Feature = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const FeatureIcon = styled.div`
  color: #4caf50;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const FeatureText = styled.div`
  font-size: 0.875rem;
  color: #cccccc;
  line-height: 1.5;
`;

const FlowSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FlowStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const StepInfo = styled.div``;

const StepName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const StepDesc = styled.div`
  font-size: 0.813rem;
  color: #666666;
`;

const FlowConnector = styled.div`
  width: 2px;
  height: 24px;
  background: #2a2a2a;
  margin-left: 19px;
`;

const CodeExample = styled.pre`
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  color: #cccccc;
  line-height: 1.6;
`;

// Diagnostics Tab Styles
const DiagnosticsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const DiagnosticCard = styled.div<{ $type: 'warning' | 'error' | 'info' | 'success' }>`
  background: #0f0f0f;
  border: 1px solid ${({ $type }) => 
    $type === 'warning' ? '#ff9800' :
    $type === 'error' ? '#f44336' :
    $type === 'info' ? '#2196f3' :
    '#4caf50'};
  border-radius: 12px;
  overflow: hidden;
`;

const DiagnosticHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a2a;
  
  svg {
    color: inherit;
  }
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
  }
`;

const DiagnosticList = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DiagnosticItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  strong {
    color: #ffffff;
    font-size: 0.875rem;
  }
  
  span {
    color: #888888;
    font-size: 0.813rem;
  }
`;

const DebugCommands = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DebugCommand = styled.div``;

const CommandTitle = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const HealthChecks = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HealthCheck = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HealthIcon = styled.div<{ $status: boolean }>`
  color: ${({ $status }) => $status ? '#4caf50' : '#f44336'};
`;

const HealthLabel = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #888888;
`;

const HealthStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
`;Selection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const ConfigCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
`;

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #2a2a2a;
`;

const ConfigTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const ConfigStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $connected }) => $connected ? '#4caf50' : '#f44336'};
  font-size: 0.875rem;
`;

const ConfigContent = styled.div`
  padding: 1.5rem;
`;

const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1a1a1a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
`;

const ConfigValue = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #888888;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

const TokenDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2a2a2a;
    color: #ffffff;
  }
`;
