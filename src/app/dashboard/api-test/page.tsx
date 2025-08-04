// src/app/dashboard/api-test/page.tsx
'use client'

import React, { Suspense } from 'react';
import { ApiTestLogic } from '@/components/apiTest/apiTestLogic';
import { Loader2 } from 'lucide-react';
import { AuthFlowHelper } from '@/hooks/utils/authFlowHelper';

// Loading component for better UX
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#fafafa',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
    <p style={{ color: '#666', fontSize: '1.125rem' }}>Loading API Test Suite...</p>
  </div>
);

// Error Boundary for better error handling
class ApiTestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Test Suite Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#fafafa',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', margin: '0 0 1.5rem 0' }}>
              The API Test Suite encountered an error. Please refresh the page or check the console for more details.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
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
            {this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details
                </summary>
                <pre style={{
                  background: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  marginTop: '0.5rem',
                  color: '#374151'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ApiTestPage() {
  return (
    <ApiTestErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <ApiTestLogic />
      </Suspense>
    </ApiTestErrorBoundary>
  );
}