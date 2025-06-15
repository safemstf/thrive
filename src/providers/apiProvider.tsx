// src/providers/apiProvider.tsx

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { config } from '@/config/environment';

interface ApiContextValue {
  client: ApiClient;
  isReady: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: Error | null;
  retryConnection: () => Promise<void>;
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

  const checkConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const health = await client.healthCheck();
      
      if (health.status === 'offline') {
        setConnectionStatus('disconnected');
        setIsReady(false);
      } else {
        setConnectionStatus('connected');
        setIsReady(true);
        setLastError(null);
      }
    } catch (error) {
      setConnectionStatus('error');
      setIsReady(false);
      setLastError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Set up periodic health checks
    const interval = setInterval(checkConnection, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [client]);

  const value: ApiContextValue = {
    client,
    isReady,
    connectionStatus,
    lastError,
    retryConnection: checkConnection,
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

// Hook for accessing the API client directly
export function useApiClient() {
  const { client } = useApi();
  return client;
}

// Hook for checking connection status
export function useApiConnection() {
  const { connectionStatus, isReady, lastError, retryConnection } = useApi();
  return { connectionStatus, isReady, lastError, retryConnection };
}