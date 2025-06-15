// app/api-test/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, 
  ExternalLink, Terminal, Settings, AlertTriangle, Route,
  Shield, User, Book, Image, Database 
} from 'lucide-react';
import { API_ROUTES, RouteDefinition, replaceRouteParams } from '@/config/api-routes';
import { useApiTester } from '@/hooks/useApiTester';

// Styled Components (keeping your existing styles)
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  padding: 2rem 1rem;
  font-family: "Work Sans", sans-serif;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 2rem;
  letter-spacing: 1px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const TabRow = styled.div`
  display: flex;
  background: #f2f2f2;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: none;
  background: ${({ $active }) => ($active ? "#2c2c2c" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#2c2c2c")};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ $active }) => ($active ? "#2c2c2c" : "#e0e0e0")};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? "#2c2c2c" : "#e0e0e0")};
  background: ${({ $active }) => ($active ? "#2c2c2c" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#2c2c2c")};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ $active }) => ($active ? "#1a1a1a" : "#f8f8f8")};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const TestButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  border: 1px solid #2c2c2c;
  border-radius: 8px;
  background: #2c2c2c;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #1a1a1a;
  }

  &:disabled {
    background: #cccccc;
    border-color: #cccccc;
    cursor: not-allowed;
  }
`;

const RouteTestCard = styled.div<{ $status: string }>`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  
  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return 'border-left: 4px solid #4caf50;';
      case 'error':
        return 'border-left: 4px solid #f44336;';
      case 'running':
        return 'border-left: 4px solid #2196f3;';
      default:
        return 'border-left: 4px solid #9e9e9e;';
    }
  }}
`;

const RouteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const RouteDetails = styled.div`
  flex: 1;
  
  .name {
    font-weight: 500;
    color: #2c2c2c;
    margin-bottom: 0.25rem;
  }
  
  .endpoint {
    font-family: monospace;
    font-size: 0.85rem;
    color: #666;
  }
  
  .description {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.25rem;
  }
`;

const AuthBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #e65100;
  margin-top: 0.5rem;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const Details = styled.details`
  margin-top: 0.75rem;
  
  summary {
    cursor: pointer;
    color: #1976d2;
    font-size: 0.85rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  pre {
    margin-top: 0.5rem;
    background: #f5f5f5;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    overflow: auto;
    max-height: 300px;
  }
`;

// Additional styled components for Configuration tab
const StatusCard = styled.div`
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatusTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ $status }) => {
    switch ($status) {
      case 'connected':
        return `
          background: #e8f5e9;
          color: #2e7d32;
        `;
      case 'disconnected':
        return `
          background: #ffebee;
          color: #c62828;
        `;
      case 'connecting':
        return `
          background: #e3f2fd;
          color: #1565c0;
        `;
      default:
        return `
          background: #fff3e0;
          color: #e65100;
        `;
    }
  }}
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  font-family: monospace;
  font-size: 0.9rem;
`;

const ConfigRow = styled.div`
  display: flex;
  gap: 0.5rem;
  
  .label {
    color: #666;
    min-width: 120px;
  }
  
  .value {
    color: #1976d2;
    word-break: break-all;
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const QuickLinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #2c2c2c;
  border-radius: 6px;
  color: #2c2c2c;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2c2c2c;
    color: #ffffff;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoBox = styled.div<{ $type: 'warning' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  
  ${({ $type }) => {
    switch ($type) {
      case 'warning':
        return `
          background: #fff3e0;
          border: 1px solid #ffb74d;
          color: #e65100;
        `;
      case 'error':
        return `
          background: #ffebee;
          border: 1px solid #ef5350;
          color: #c62828;
        `;
      case 'info':
        return `
          background: #e3f2fd;
          border: 1px solid #42a5f5;
          color: #1565c0;
        `;
    }
  }}
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }
  
  ul, ol {
    margin: 0.5rem 0 0 1.5rem;
    font-size: 0.9rem;
  }
  
  p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }
`;

const CodeBlock = styled.pre`
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0.5rem 0;
`;

// Icon mapping with proper typing
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  system: Settings,
  auth: Shield,
  users: User,
  books: Book,
  gallery: Image,
  search: Database,
};

// Real configuration
const config = {
  api: {
    baseUrl: (process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:5000').replace(/\/$/, ''),
  }
};

export default function EnhancedApiTestPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('system');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [backendInfo, setBackendInfo] = useState<any>(null);

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
    // Clear previous results
    clearResults();
    
    // Test system routes first
    await testRoutes(API_ROUTES.system.routes, 'system');
    
    // Test auth to get token
    await testRoutes(API_ROUTES.auth.routes, 'auth');
    
    // Test all other categories
    for (const [key, category] of Object.entries(API_ROUTES)) {
      if (key !== 'system' && key !== 'auth') {
        await testRoutes(category.routes, key);
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
        return <AlertCircle style={{ color: '#9e9e9e' }} size={20} />;
    }
  };

  const renderRouteTest = (route: RouteDefinition) => {
    const testKey = `${selectedCategory}-${route.name}`;
    const result = results[testKey];
    
    return (
      <RouteTestCard key={route.name} $status={result?.status || 'pending'}>
        <RouteHeader>
          <RouteInfo>
            {result ? getStatusIcon(result.status) : <AlertCircle style={{ color: '#9e9e9e' }} size={20} />}
            <RouteDetails>
              <div className="name">{route.name}</div>
              <div className="endpoint">
                <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{route.method}</span>{' '}
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
            Test
          </TestButton>
        </RouteHeader>
        
        {route.body && (
          <Details>
            <summary>Request Body</summary>
            <pre>{JSON.stringify(route.body, null, 2)}</pre>
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

        <Card>
          <TabRow>
            <TabButton $active={activeTab === 0} onClick={() => setActiveTab(0)}>
              <Settings /> Configuration
            </TabButton>
            <TabButton $active={activeTab === 1} onClick={() => setActiveTab(1)}>
              <Route /> Route Tests
            </TabButton>
            <TabButton $active={activeTab === 2} onClick={() => setActiveTab(2)}>
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
                          <span className="value">{backendInfo.version}</span>
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
                    return (
                      <CategoryButton
                        key={key}
                        $active={selectedCategory === key}
                        onClick={() => setSelectedCategory(key)}
                      >
                        <Icon />
                        {category.name}
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
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                    {API_ROUTES[selectedCategory]?.name} Routes
                  </h3>
                  
                  {API_ROUTES[selectedCategory]?.routes.map(renderRouteTest)}
                </div>
              </>
            )}

            {/* Troubleshoot Tab */}
            {activeTab === 2 && (
              <>
                <InfoBox $type="warning">
                  <h4>Common Issues</h4>
                  <ul>
                    <li><strong>"Failed to fetch"</strong> - Backend not running or wrong URL</li>
                    <li><strong>"404 Not Found"</strong> - Route doesn't exist (check double slashes)</li>
                    <li><strong>CORS errors</strong> - Missing CORS headers on backend</li>
                    <li><strong>"//api" in URLs</strong> - Trailing slash in NEXT_PUBLIC_NGROK_URL</li>
                    <li><strong>401 Unauthorized</strong> - Need to login first or token expired</li>
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
}).then(r => r.text()).then(console.log).catch(console.error)`}</CodeBlock>
                </InfoBox>
              </>
            )}
          </TabContent>
        </Card>
      </Container>
    </PageWrapper>
  );
}