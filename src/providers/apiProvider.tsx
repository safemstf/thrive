// src/providers/apiProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { gsApi, getGoogleSheetsApiClient } from '@/lib/api/google-sheets-api-client';

// Backend type
export type BackendType = 'main' | 'sheets' | 'none';

interface ApiContextValue {
  client: ApiClient;
  isReady: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: Error | null;
  retryConnection: () => Promise<void>;
  
  // NEW: Backend awareness
  backend: BackendType;
  usingFallback: boolean;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

interface ApiProviderProps {
  children: React.ReactNode;
  baseUrl?: string;
}

export function ApiProvider({ children, baseUrl }: ApiProviderProps) {
  const [client] = useState(() => new ApiClient(baseUrl));
  const [isReady, setIsReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ApiContextValue['connectionStatus']>('connecting');
  const [lastError, setLastError] = useState<Error | null>(null);
  const [backend, setBackend] = useState<BackendType>('none');

  const checkConnection = useCallback(async () => {
    setConnectionStatus('connecting');
    
    // Try main server first
    try {
      const health = await client.healthCheck();
      if (health.status !== 'offline' && health.status !== 'unknown') {
        setConnectionStatus('connected');
        setIsReady(true);
        setLastError(null);
        setBackend('main');
        console.log('[ApiProvider] Connected to main server');
        return;
      }
    } catch (error) {
      console.log('[ApiProvider] Main server unavailable, trying fallback...');
    }
    
    // Try Google Sheets fallback
    try {
      const gsHealth = await gsApi.health.testConnection();
      if (gsHealth.connected) {
        setConnectionStatus('connected');
        setIsReady(true);
        setLastError(null);
        setBackend('sheets');
        console.log('[ApiProvider] Connected to Google Sheets fallback');
        return;
      }
    } catch (error) {
      console.log('[ApiProvider] Google Sheets fallback also unavailable');
    }
    
    // Both failed
    setConnectionStatus('error');
    setIsReady(false);
    setBackend('none');
    setLastError(new Error('All backends unavailable'));
  }, [client]);

  useEffect(() => {
    checkConnection();

    // Check every 2 minutes (less aggressive)
    const interval = setInterval(checkConnection, 120000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  const value: ApiContextValue = {
    client,
    isReady,
    connectionStatus,
    lastError,
    retryConnection: checkConnection,
    backend,
    usingFallback: backend === 'sheets',
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

export function useApiClient() {
  const { client } = useApi();
  return client;
}

export function useApiConnection() {
  const { connectionStatus, isReady, lastError, retryConnection, backend, usingFallback } = useApi();
  return { connectionStatus, isReady, lastError, retryConnection, backend, usingFallback };
}

// NEW: Hook to get the current backend type
export function useBackend() {
  const { backend, usingFallback } = useApi();
  return { backend, usingFallback };
}