// app/api-test/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  ExternalLink, Terminal, Settings, AlertTriangle, Route,
  Shield, User, Book, Image, Database, Upload, Play,
  Briefcase, Users, BarChart3, Code
} from 'lucide-react';
import { API_ROUTES, RouteDefinition, replaceRouteParams } from '@/config/api-routes';
import { useApiTester } from '@/hooks/useApiTester';

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #ffffff;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Card = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`;

const TabRow = styled.div`
  display: flex;
  background: #0f0f0f;
  border-bottom: 1px solid #2a2a2a;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
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

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $active }) => ($active ? "#667eea" : "transparent")};
    transition: background 0.2s ease;
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#1a1a1a" : "#151515")};
    color: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#667eea" : "#2a2a2a")};
  background: ${({ $active }) => ($active ? "rgba(102, 126, 234, 0.1)" : "#0f0f0f")};
  color: ${({ $active }) => ($active ? "#667eea" : "#888888")};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ $active }) => ($active ? "rgba(102, 126, 234, 0.2)" : "#1a1a1a")};
    border-color: ${({ $active }) => ($active ? "#667eea" : "#3a3a3a")};
    color: ${({ $active }) => ($active ? "#667eea" : "#ffffff")};
  }

  svg {
    width: 24px;
    height: 24px;
  }

  .count {
    font-size: 0.75rem;
    color: #666666;
    margin-top: 0.25rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TestButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: 1px solid #667eea;
  border-radius: 10px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #667eea;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    background: #1a1a1a;
    border-color: #2a2a2a;
    color: #444444;
    cursor: not-allowed;
  }
`;

const RouteTestCard = styled.div<{ $status: string }>`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return `
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.05);
        `;
      case 'error':
        return `
          border-color: #f44336;
          background: rgba(244, 67, 54, 0.05);
        `;
      case 'running':
        return `
          border-color: #2196f3;
          background: rgba(33, 150, 243, 0.05);
        `;
      default:
        return '';
    }
  }}

  &:hover {
    border-color: #3a3a3a;
    background: #151515;
  }
`;

const RouteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const RouteDetails = styled.div`
  flex: 1;
  
  .name {
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }
  
  .endpoint {
    font-family: 'Fira Code', monospace;
    font-size: 0.85rem;
    color: #888888;
    margin-bottom: 0.25rem;
  }
  
  .description {
    font-size: 0.85rem;
    color: #666666;
    margin-top: 0.25rem;
  }
`;

const MethodBadge = styled.span<{ $method: string }>`
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.5rem;
  
  ${({ $method }) => {
    switch ($method) {
      case 'GET':
        return `
          background: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        `;
      case 'POST':
        return `
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        `;
      case 'PUT':
      case 'PATCH':
        return `
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        `;
      case 'DELETE':
        return `
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        `;
      default:
        return `
          background: rgba(158, 158, 158, 0.2);
          color: #9e9e9e;
        `;
    }
  }}
`;

const AuthBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #ff9800;
  margin-top: 0.5rem;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const Details = styled.details`
  margin-top: 1rem;
  
  summary {
    cursor: pointer;
    color: #667eea;
    font-size: 0.85rem;
    padding: 0.5rem 0;
    
    &:hover {
      color: #764ba2;
    }
  }
  
  pre {
    margin-top: 0.5rem;
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.75rem;
    overflow: auto;
    max-height: 300px;
    color: #cccccc;
    font-family: 'Fira Code', monospace;
  }
`;

const StatusCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StatusTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'connected':
        return `
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
          border: 1px solid #4caf50;
        `;
      case 'disconnected':
        return `
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
          border: 1px solid #f44336;
        `;
      case 'connecting':
        return `
          background: rgba(33, 150, 243, 0.2);
          color: #2196f3;
          border: 1px solid #2196f3;
        `;
      default:
        return `
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
          border: 1px solid #ff9800;
        `;
    }
  }}
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
`;

const ConfigRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #1a1a1a;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: #666666;
    min-width: 140px;
  }
  
  .value {
    color: #667eea;
    word-break: break-all;
    font-size: 0.85rem;
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const QuickLinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #888888;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1a1a1a;
    color: #ffffff;
    border-color: #3a3a3a;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const InfoBox = styled.div<{ $type: 'warning' | 'error' | 'info' | 'success' }>`
  padding: 1.25rem;
  border-radius: 12px;
  margin: 1rem 0;
  border: 1px solid;
  
  ${({ $type }) => {
    switch ($type) {
      case 'warning':
        return `
          background: rgba(255, 152, 0, 0.1);
          border-color: #ff9800;
          color: #ff9800;
        `;
      case 'error':
        return `
          background: rgba(244, 67, 54, 0.1);
          border-color: #f44336;
          color: #f44336;
        `;
      case 'info':
        return `
          background: rgba(33, 150, 243, 0.1);
          border-color: #2196f3;
          color: #2196f3;
        `;
      case 'success':
        return `
          background: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
          color: #4caf50;
        `;
    }
  }}
  
  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  ul, ol {
    margin: 0.5rem 0 0 1.5rem;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

const CodeBlock = styled.pre`
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  color: #cccccc;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.85rem;
    color: #666666;
  }
`;

// Icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  system: Settings,
  auth: Shield,
  portfolios: Briefcase,
  gallery: Image,
  users: Users,
  books: Book,
  concepts: Database,
  progress: BarChart3,
  simulations: Play,
  uploads: Upload,
};

// Real configuration
const config = {
  api: {
    baseUrl: (process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000').replace(/\/$/, ''),
  }
};

export default function EnhancedApiTestPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('portfolios');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [backendInfo, setBackendInfo] = useState<any>(null);
  const [testStats, setTestStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    running: 0,
  });

  const {
    testRoute,
    testRoutes,
    results,
    isRunning,
    clearResults,
    authToken,
  } = useApiTester({
    baseUrl: config.api.baseUrl,
  });

  // Check initial connection
  useEffect(() => {
    checkConnection();
  }, []);

  // Update test stats when results change
  useEffect(() => {
    const stats = {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.status === 'success').length,
      failed: Object.values(results).filter(r => r.status === 'error').length,
      running: Object.values(results).filter(r => r.status === 'running').length,
    };
    setTestStats(stats);
  }, [results]);

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    try {
      const response = await fetch(`${config.api.baseUrl}/health`, {
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

  const runAllTests = async () => {
    clearResults();
    
    // Test in specific order for dependencies
    const testOrder = ['system', 'auth', 'portfolios', 'gallery', 'users', 'books', 'concepts', 'progress', 'simulations', 'uploads'];
    
    for (const category of testOrder) {
      if (API_ROUTES[category]) {
        await testRoutes(API_ROUTES[category].routes, category);
      }
    }
  };

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

  const renderRouteTest = (route: RouteDefinition) => {
    const testKey = `${selectedCategory}-${route.name}`;
    const result = results[testKey];
    
    return (
      <RouteTestCard key={route.name} $status={result?.status || 'pending'}>
        <RouteHeader>
          <RouteInfo>
            {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#666666' }} size={20} />}
            <RouteDetails>
              <div className="name">{route.name}</div>
              <div className="endpoint">
                <MethodBadge $method={route.method}>{route.method}</MethodBadge>
                {replaceRouteParams(route.endpoint, route.params)}
              </div>
              <div className="description">{route.description}</div>
              {route.needsAuth && (
                <AuthBadge>
                  <Shield />
                  Requires authentication
                </AuthBadge>
              )}
            </RouteDetails>
          </RouteInfo>
          
          <TestButton
            onClick={() => testRoute(route, selectedCategory)}
            disabled={result?.status === 'running' || isRunning}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            <Play size={16} />
            Test
          </TestButton>
        </RouteHeader>
        
        {route.body && (
          <Details>
            <summary>Request Body</summary>
            <pre>{JSON.stringify(
              typeof route.body === 'function' ? route.body() : route.body, 
              null, 
              2
            )}</pre>
          </Details>
        )}
        
        {route.queryParams && (
          <Details>
            <summary>Query Parameters</summary>
            <pre>{JSON.stringify(route.queryParams, null, 2)}</pre>
          </Details>
        )}
        
        {result?.response && (
          <Details>
            <summary>
              Response ({result.response.status} - {result.response.duration}ms)
            </summary>
            <pre>
              {typeof result.response.data === 'string' 
                ? result.response.data 
                : JSON.stringify(result.response.data, null, 2)}
            </pre>
          </Details>
        )}
        
        {result?.error && (
          <div style={{ marginTop: '0.5rem', color: '#f44336', fontSize: '0.875rem' }}>
            Error: {result.error}
          </div>
        )}
      </RouteTestCard>
    );
  };

  return (
    <PageWrapper>
      <Container>
        <PageTitle>Comprehensive API Test Suite</PageTitle>

        {activeTab === 1 && testStats.total > 0 && (
          <StatsGrid>
            <StatCard>
              <div className="value">{testStats.total}</div>
              <div className="label">Total Tests</div>
            </StatCard>
            <StatCard>
              <div className="value" style={{ color: '#4caf50' }}>{testStats.passed}</div>
              <div className="label">Passed</div>
            </StatCard>
            <StatCard>
              <div className="value" style={{ color: '#f44336' }}>{testStats.failed}</div>
              <div className="label">Failed</div>
            </StatCard>
            <StatCard>
              <div className="value" style={{ color: '#2196f3' }}>{testStats.running}</div>
              <div className="label">Running</div>
            </StatCard>
          </StatsGrid>
        )}

        <Card>
          <TabRow>
            <TabButton $active={activeTab === 0} onClick={() => setActiveTab(0)}>
              <Settings /> Configuration
            </TabButton>
            <TabButton $active={activeTab === 1} onClick={() => setActiveTab(1)}>
              <Route /> Route Tests
            </TabButton>
            <TabButton $active={activeTab === 2} onClick={() => setActiveTab(2)}>
              <Code /> Integration
            </TabButton>
            <TabButton $active={activeTab === 3} onClick={() => setActiveTab(3)}>
              <AlertTriangle /> Troubleshoot
            </TabButton>
          </TabRow>

          <TabContent>
            {/* Configuration Tab */}
            {activeTab === 0 && (
              <>
                <StatusCard>
                  <StatusHeader>
                    <StatusTitle>Connection Status</StatusTitle>
                    <StatusBadge $status={connectionStatus}>{connectionStatus}</StatusBadge>
                  </StatusHeader>
                  
                  <ConfigGrid>
                    <ConfigRow>
                      <span className="label">Base URL:</span>
                      <span className="value">{config.api.baseUrl}</span>
                    </ConfigRow>
                    <ConfigRow>
                      <span className="label">NGROK_URL:</span>
                      <span className="value">{process.env.NEXT_PUBLIC_NGROK_URL || 'Not set'}</span>
                    </ConfigRow>
                    <ConfigRow>
                      <span className="label">Environment:</span>
                      <span className="value">{process.env.NODE_ENV}</span>
                    </ConfigRow>
                    {backendInfo && (
                      <>
                        <ConfigRow>
                          <span className="label">Backend Status:</span>
                          <span className="value">{backendInfo.status}</span>
                        </ConfigRow>
                        <ConfigRow>
                          <span className="label">Backend Version:</span>
                          <span className="value">{backendInfo.version || 'Unknown'}</span>
                        </ConfigRow>
                      </>
                    )}
                    {authToken && (
                      <ConfigRow>
                        <span className="label">Auth Token:</span>
                        <span className="value" style={{ fontSize: '0.75rem' }}>
                          {authToken.substring(0, 20)}...
                        </span>
                      </ConfigRow>
                    )}
                  </ConfigGrid>
                </StatusCard>

                <QuickLinksGrid>
                  <QuickLinkButton onClick={() => window.open(config.api.baseUrl, '_blank')}>
                    <ExternalLink /> Open Backend URL
                  </QuickLinkButton>
                  <QuickLinkButton onClick={() => window.open('http://localhost:5000', '_blank')}>
                    <ExternalLink /> Open Localhost
                  </QuickLinkButton>
                  <QuickLinkButton onClick={() => window.open('http://localhost:4040', '_blank')}>
                    <ExternalLink /> Ngrok Dashboard
                  </QuickLinkButton>
                  <QuickLinkButton onClick={checkConnection}>
                    <RefreshCw /> Retry Connection
                  </QuickLinkButton>
                </QuickLinksGrid>

                <InfoBox $type="info">
                  <h4>Setup Instructions</h4>
                  <ol>
                    <li>Start backend: <CodeBlock>cd backend && npm start</CodeBlock></li>
                    <li>Start ngrok: <CodeBlock>ngrok http 5000</CodeBlock></li>
                    <li>Update .env.local with ngrok URL (no trailing slash)</li>
                    <li>Restart Next.js dev server</li>
                  </ol>
                </InfoBox>
              </>
            )}

            {/* Route Tests Tab */}
            {activeTab === 1 && (
              <>
                <CategoryGrid>
                  {Object.entries(API_ROUTES).map(([key, category]) => {
                    const Icon = CATEGORY_ICONS[key] || Settings;
                    const categoryResults = Object.entries(results).filter(([k]) => k.startsWith(key));
                    const passed = categoryResults.filter(([, r]) => r.status === 'success').length;
                    
                    return (
                      <CategoryButton
                        key={key}
                        $active={selectedCategory === key}
                        onClick={() => setSelectedCategory(key)}
                      >
                        <Icon />
                        {category.name}
                        <div className="count">
                          {categoryResults.length > 0 && `${passed}/${category.routes.length}`}
                        </div>
                      </CategoryButton>
                    );
                  })}
                </CategoryGrid>

                <ActionButtons>
                  <TestButton onClick={runCategoryTests} disabled={isRunning}>
                    <Terminal />
                    Test {API_ROUTES[selectedCategory]?.name}
                  </TestButton>
                  
                  <TestButton onClick={runAllTests} disabled={isRunning}>
                    <Route />
                    Test All Routes
                  </TestButton>
                  
                  <TestButton onClick={clearResults} disabled={isRunning}>
                    <RefreshCw />
                    Clear Results
                  </TestButton>
                </ActionButtons>

                <div>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>
                    {API_ROUTES[selectedCategory]?.name} Routes ({API_ROUTES[selectedCategory]?.routes.length})
                  </h3>
                  
                  {API_ROUTES[selectedCategory]?.routes.map(renderRouteTest)}
                </div>
              </>
            )}

            {/* Integration Tab */}
            {activeTab === 2 && (
              <>
                <InfoBox $type="info">
                  <h4>Portfolio-Gallery Integration</h4>
                  <p>The API is designed with portfolios as the primary user experience:</p>
                  <ul>
                    <li>Each user has one portfolio that serves as their main profile</li>
                    <li>Gallery pieces are linked to portfolios via <code>portfolioId</code></li>
                    <li>Gallery management is done through portfolio endpoints</li>
                    <li>Visibility controls apply to both portfolio and gallery items</li>
                  </ul>
                </InfoBox>

                <InfoBox $type="success">
                  <h4>Key Integration Points</h4>
                  <ul>
                    <li><strong>Portfolio Creation:</strong> Automatically creates user's main profile</li>
                    <li><strong>Gallery Upload:</strong> Links artwork to user's portfolio</li>
                    <li><strong>Batch Operations:</strong> Manage multiple gallery pieces at once</li>
                    <li><strong>Analytics:</strong> Combined portfolio and gallery statistics</li>
                    <li><strong>Search:</strong> Unified search across portfolios and gallery</li>
                  </ul>
                </InfoBox>

                <InfoBox $type="warning">
                  <h4>Testing Flow Recommendations</h4>
                  <ol>
                    <li>Test auth endpoints first to get authentication token</li>
                    <li>Create a portfolio for the authenticated user</li>
                    <li>Upload gallery pieces linked to the portfolio</li>
                    <li>Test batch operations on gallery pieces</li>
                    <li>Verify analytics and search functionality</li>
                  </ol>
                </InfoBox>

                <CodeBlock>{`// Example Integration Flow
// 1. Login
POST /api/auth/login
{ "usernameOrEmail": "user@example.com", "password": "password" }

// 2. Get/Create Portfolio
GET /api/portfolios/me

// 3. Upload Gallery Piece
POST /api/gallery
{ 
  "title": "My Artwork",
  "portfolioId": "portfolio-id-from-step-2",
  "visibility": "public"
}

// 4. Manage Gallery through Portfolio
POST /api/portfolios/:portfolioId/gallery/batch-visibility
{ "pieceIds": ["id1", "id2"], "visibility": "public" }`}</CodeBlock>
              </>
            )}

            {/* Troubleshoot Tab */}
            {activeTab === 3 && (
              <>
                <InfoBox $type="warning">
                  <h4>Common Issues</h4>
                  <ul>
                    <li><strong>"Failed to fetch"</strong> - Backend not running or wrong URL</li>
                    <li><strong>"404 Not Found"</strong> - Route doesn't exist or path issue</li>
                    <li><strong>CORS errors</strong> - Missing CORS headers on backend</li>
                    <li><strong>"//api" in URLs</strong> - Trailing slash in NEXT_PUBLIC_NGROK_URL</li>
                    <li><strong>401 Unauthorized</strong> - Need to login first or token expired</li>
                    <li><strong>Portfolio Not Found</strong> - User needs to create portfolio first</li>
                  </ul>
                </InfoBox>

                <InfoBox $type="error">
                  <h4>Debug Steps</h4>
                  <ol>
                    <li>Check if backend is running on port 5000</li>
                    <li>Verify ngrok is forwarding to port 5000</li>
                    <li>Test backend directly in browser</li>
                    <li>Check Network tab in DevTools for actual URLs</li>
                    <li>Ensure .env.local has no trailing slash</li>
                    <li>Verify authentication token is being sent</li>
                  </ol>
                </InfoBox>

                <InfoBox $type="info">
                  <h4>Quick Tests</h4>
                  <p>Test backend health directly:</p>
                  <CodeBlock>{`fetch('${config.api.baseUrl}/health', {
  headers: { 'ngrok-skip-browser-warning': 'true' }
}).then(r => r.json()).then(console.log).catch(console.error)`}</CodeBlock>
                  
                  <p>Test login endpoint:</p>
                  <CodeBlock>{`fetch('${config.api.baseUrl}/api/auth/login', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    usernameOrEmail: 'admin@admin.com',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log).catch(console.error)`}</CodeBlock>

                  <p>Test portfolio creation:</p>
                  <CodeBlock>{`// First login to get token, then:
fetch('${config.api.baseUrl}/api/portfolios', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify({
    username: 'testuser',
    name: 'Test Portfolio',
    bio: 'Test bio'
  })
}).then(r => r.json()).then(console.log).catch(console.error)`}</CodeBlock>
                </InfoBox>
              </>
            )}
          </TabContent>
        </Card>
      </Container>
    </PageWrapper>
  );
}