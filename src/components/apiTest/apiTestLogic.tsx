// src/components/apiTest/apiTestLogic.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Import styled components from the styles file
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
  SearchBar,
  SearchInput,
  FilterBar,
  FilterGroup,
  FilterButton,
  ActionBar,
  ActionGroup,
  PrimaryButton,
  SecondaryButton,
  RouteSection,
  SectionHeader,
  SectionTitle,
  RouteBadge,
  SelectionControls,
  SelectButton,
  RouteList,
  RouteCard,
  RouteHeader,
  RouteLeft,
  RouteCheckbox,
  StatusIcon,
  RouteInfo,
  RouteName,
  RouteEndpoint,
  EndpointPath,
  RouteDescription,
  MethodBadge,
  RouteTags,
  RouteTag,
  RouteActions,
  ResponseTime,
  TestButton,
  RouteDetails,
  DetailSection,
  DetailTitle,
  CodeBlock,
  ResponseSection,
  ResponseHeader,
  ResponseStatus,
  ResponseMeta,
  ResponseBody,
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
  CommandTitle,
  HealthChecks,
  HealthCheck,
  HealthIcon,
  HealthLabel,
  HealthStatus
} from './apiTestStyles';

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

interface ApiTestLogicProps {
  // Optional props for customization
  defaultCategory?: string;
  baseUrl?: string;
}

export const ApiTestLogic: React.FC<ApiTestLogicProps> = ({
  defaultCategory = 'health',
  baseUrl: propBaseUrl
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
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

  const baseUrl = propBaseUrl || process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000';

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

  const checkConnection = useCallback(async () => {
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
  }, [baseUrl]);

  const runCategoryTests = useCallback(async () => {
    const routes = API_ROUTES[selectedCategory]?.routes || [];
    await testRoutes(routes, selectedCategory);
  }, [selectedCategory, testRoutes]);

  const runSelectedTests = useCallback(async () => {
    const routes = API_ROUTES[selectedCategory]?.routes.filter(route => {
      const testKey = `${selectedCategory}-${route.name}`;
      return selectedRoutes.has(testKey);
    }) || [];
    
    await testRoutes(routes, selectedCategory);
  }, [selectedCategory, selectedRoutes, testRoutes]);

  const runAllTests = useCallback(async () => {
    clearResults();
    
    // Test in specific order for dependencies
    const testOrder = ['health', 'auth', 'portfolios', 'gallery', 'users', 'books', 'concepts', 'progress', 'simulations'];
    
    for (const category of testOrder) {
      if (API_ROUTES[category]) {
        await testRoutes(API_ROUTES[category].routes, category);
      }
    }
  }, [clearResults, testRoutes]);

  const runAuthFlow = useCallback(async () => {
    // Special flow for authentication testing
    const authRoutes = API_ROUTES.auth?.routes.filter(r => 
      ['Login', 'Get Current User', 'Verify Token'].includes(r.name)
    ) || [];
    
    await testRoutes(authRoutes, 'auth');
  }, [testRoutes]);

  const exportResults = useCallback(() => {
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
    URL.revokeObjectURL(url);
  }, [baseUrl, results]);

  const copyToken = useCallback(() => {
    if (authToken) {
      navigator.clipboard.writeText(authToken);
    }
  }, [authToken]);

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

  const toggleRouteSelection = useCallback((testKey: string) => {
    setSelectedRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testKey)) {
        newSet.delete(testKey);
      } else {
        newSet.add(testKey);
      }
      return newSet;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    const allKeys = filteredRoutes.map(route => `${selectedCategory}-${route.name}`);
    setSelectedRoutes(new Set(allKeys));
  }, [filteredRoutes, selectedCategory]);

  const clearSelection = useCallback(() => {
    setSelectedRoutes(new Set());
  }, []);

  // Ensure we have API_ROUTES data before rendering
  if (!API_ROUTES || Object.keys(API_ROUTES).length === 0) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
            <h2 style={{ 
              color: '#2c2c2c', 
              margin: 0, 
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              API Routes Configuration Missing
            </h2>
            <p style={{ 
              color: '#666', 
              margin: 0,
              maxWidth: '500px',
              lineHeight: '1.6'
            }}>
              Please ensure API_ROUTES is properly configured in your config/api-routes file.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#2c2c2c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Refresh Page
            </button>
          </div>
        </Container>
      </PageWrapper>
    );
  }

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
              <Route size={18} /> Route Testing
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
                                $percentage={(passed / total) * 100}
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
                    <SecondaryButton onClick={checkConnection}>
                      <RefreshCw size={16} />
                      Test Connection
                    </SecondaryButton>
                    
                    {authToken && (
                      <SecondaryButton onClick={() => {
                        localStorage.removeItem('api_test_token');
                        window.location.reload();
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
};