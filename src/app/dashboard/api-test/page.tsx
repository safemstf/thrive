'use client'
// src\app\dashboard\api-test\page.tsx

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
  health: '#10b981',
  auth: '#f59e0b',
  portfolios: '#3b82f6',
  gallery: '#8b5cf6',
  users: '#ef4444',
  books: '#06b6d4',
  concepts: '#6366f1',
  progress: '#14b8a6',
  simulations: '#f59e0b',
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
        return <CheckCircle style={{ color: '#10b981' }} size={20} />;
      case 'error':
        return <XCircle style={{ color: '#ef4444' }} size={20} />;
      case 'running':
        return <Loader2 style={{ color: '#3b82f6' }} className="animate-spin" size={20} />;
      default:
        return <AlertCircle style={{ color: '#9ca3af' }} size={20} />;
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
                  $width={(stats.passed / stats.total) * 100}
                  $color="#10b981"
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
                                <span style={{ color: '#10b981' }}>{passed}</span>
                                <span style={{ color: '#6b7280' }}>/</span>
                                <span>{total}</span>
                              </>
                            ) : (
                              <span style={{ color: '#6b7280' }}>{total} routes</span>
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
                                {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#9ca3af' }} size={20} />}
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
              <ConfigSection>
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
              </ConfigSection>
            )}

            {activeTab === 2 && (
              <IntegrationSection>
                <IntegrationCard>
                  <CardHeader>
                    <CardIcon $color="#f59e0b"><Code size={24} /></CardIcon>
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

// Styled Components - Light Theme to match Taskbar design
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding: 2rem 1rem;
  font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2c2c2c;
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
  color: #2c2c2c;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #666;
  margin: 0;
  font-weight: 300;
`;

const ConnectionBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 400;
  background: ${({ $status }) => 
    $status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 
    $status === 'disconnected' ? 'rgba(239, 68, 68, 0.1)' : 
    'rgba(59, 130, 246, 0.1)'};
  color: ${({ $status }) => 
    $status === 'connected' ? '#10b981' : 
    $status === 'disconnected' ? '#ef4444' : 
    '#3b82f6'};
  border: 1px solid currentColor;
`;

const AuthTokenBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 400;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  ${({ $color }) => $color && `
    border-color: ${$color}33;
    background: ${$color}08;
    
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
  color: #2c2c2c;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
  font-weight: 300;
`;

const ProgressCard = styled.div`
  grid-column: span 2;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f3f4f6;
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
  color: #666;
  text-align: center;
  font-weight: 300;
`;

const MainCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
`;

const TabRow = styled.div`
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: fit-content;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: ${({ $active }) => ($active ? "400" : "300")};
  border: none;
  background: ${({ $active }) => ($active ? "white" : "transparent")};
  color: ${({ $active }) => ($active ? "#2c2c2c" : "#666")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Work Sans', sans-serif;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? "#2c2c2c" : "transparent")};
  }

  &:hover {
    background: ${({ $active }) => ($active ? "white" : "#f3f4f6")};
    color: #2c2c2c;
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
  background: ${({ $active }) => $active ? 'white' : '#fafafa'};
  border: 2px solid ${({ $active, $color }) => $active ? $color : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ $active }) => $active ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'};
  
  &:hover {
    background: white;
    border-color: ${({ $color }) => $color};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}15`};
  border-radius: 12px;
  color: ${({ $color }) => $color};
`;

const CategoryName = styled.div`
  font-weight: 500;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
`;

const CategoryStats = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

const CategoryProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f3f4f6;
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #2c2c2c;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
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
  border: 1px solid ${({ $active }) => $active ? '#3b82f6' : '#e5e7eb'};
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.1)' : 'white'};
  color: ${({ $active }) => $active ? '#3b82f6' : '#666'};
  font-size: 0.813rem;
  font-weight: ${({ $active }) => $active ? '400' : '300'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.2)' : '#f9fafb'};
    color: ${({ $active }) => $active ? '#3b82f6' : '#2c2c2c'};
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
  border-radius: 2px;
  border: 1px solid #2c2c2c;
  background: #2c2c2c;
  color: #f8f8f8;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(44, 44, 44, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: white;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  
  &:hover:not(:disabled) {
    background: #f8f8f8;
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
  color: #2c2c2c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const RouteBadge = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  color: #666;
  background: #f3f4f6;
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
  color: #666;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  
  &:hover {
    background: #f9fafb;
    color: #2c2c2c;
    border-color: #d1d5db;
  }
`;

const RouteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RouteCard = styled.div<{ $status?: string; $selected?: boolean }>`
  background: white;
  border: 2px solid ${({ $status, $selected }) => 
    $selected ? '#3b82f6' :
    $status === 'success' ? '#10b98133' : 
    $status === 'error' ? '#ef444433' : 
    $status === 'running' ? '#3b82f633' : 
    '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  color: #2c2c2c;
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
  color: #666;
`;

const RouteDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 300;
`;

const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 500;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ $method }) => 
    $method === 'GET' ? 'rgba(59, 130, 246, 0.2)' :
    $method === 'POST' ? 'rgba(16, 185, 129, 0.2)' :
    $method === 'PUT' || $method === 'PATCH' ? 'rgba(245, 158, 11, 0.2)' :
    $method === 'DELETE' ? 'rgba(239, 68, 68, 0.2)' :
    'rgba(156, 163, 175, 0.2)'};
  color: ${({ $method }) => 
    $method === 'GET' ? '#3b82f6' :
    $method === 'POST' ? '#10b981' :
    $method === 'PUT' || $method === 'PATCH' ? '#f59e0b' :
    $method === 'DELETE' ? '#ef4444' :
    '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    $type === 'auth' ? 'rgba(245, 158, 11, 0.1)' :
    $type === 'skip' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(156, 163, 175, 0.1)'};
  color: ${({ $type }) => 
    $type === 'auth' ? '#f59e0b' :
    $type === 'skip' ? '#ef4444' :
    '#6b7280'};
  
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
  color: ${({ $status }) => $status === 'success' ? '#10b981' : '#ef4444'};
  
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
  border: 1px solid #e5e7eb;
  background: white;
  color: #666;
  font-size: 0.813rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Work Sans', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    background: #2c2c2c;
    color: #f8f8f8;
    border-color: #2c2c2c;
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
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
`;

const DetailSection = styled.div``;

const DetailTitle = styled.div`
  font-size: 0.813rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CodeBlock = styled.pre`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  max-height: 200px;
  color: #374151;
`;

const ResponseSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const ResponseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ResponseStatus = styled.div<{ $success: boolean }>`
  font-weight: 600;
  color: ${({ $success }) => $success ? '#10b981' : '#ef4444'};
`;

const ResponseMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: #666;
`;

const ResponseBody = styled.div``;

const ErrorSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 8px;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
`;

// Configuration Tab Styles
const ConfigSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const ConfigCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

const ConfigTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

const ConfigStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $connected }) => $connected ? '#10b981' : '#ef4444'};
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
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

const ConfigValue = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  color: #374151;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

const TokenDisplay = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    color: #2c2c2c;
  }
`;

const ConfigActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  background: white;
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: 'Work Sans', sans-serif;
  
  &:hover {
    background: #f9fafb;
    color: #2c2c2c;
    border-color: #d1d5db;
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
  background: #2c2c2c;
  color: #f8f8f8;
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
  color: #2c2c2c;
  margin-bottom: 0.5rem;
`;

const CodeSnippet = styled.code`
  display: block;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.813rem;
  color: #3b82f6;
  margin-bottom: 0.25rem;
`;

const StepNote = styled.div`
  font-size: 0.813rem;
  color: #f59e0b;
  font-style: italic;
`;

// Integration Tab Styles
const IntegrationSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const IntegrationCard = styled.div`
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  
  p {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.6;
  }
`;

const CodeExample = styled.pre`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  overflow: auto;
  color: #374151;
  line-height: 1.6;
`;

// Diagnostics Tab Styles
const DiagnosticsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const DiagnosticCard = styled.div<{ $type: 'warning' | 'error' | 'info' | 'success' }>`
  background: white;
  border: 1px solid ${({ $type }) => 
    $type === 'warning' ? '#f59e0b' :
    $type === 'error' ? '#ef4444' :
    $type === 'info' ? '#3b82f6' :
    '#10b981'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const DiagnosticHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  
  svg {
    color: inherit;
  }
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c2c2c;
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
    color: #2c2c2c;
    font-size: 0.875rem;
  }
  
  span {
    color: #666;
    font-size: 0.813rem;
    font-weight: 300;
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
  color: #2c2c2c;
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
  color: ${({ $status }) => $status ? '#10b981' : '#ef4444'};
`;

const HealthLabel = styled.div`
  flex: 1;
  font-size: 0.875rem;
  color: #666;
  font-weight: 300;
`;

const HealthStatus = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c2c2c;
`;