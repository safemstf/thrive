// src/components/ApiConnectionManager.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getApiClient } from '@/lib/api-client';
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  serverVersion: string | null;
}

export function ApiConnectionManager({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null,
    serverVersion: null,
  });

  const apiClient = getApiClient();

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const result = await apiClient.healthCheck();
      
      if (result.status === 'offline') {
        setStatus({
          isConnected: false,
          isChecking: false,
          lastChecked: new Date(),
          error: 'Server is offline or unreachable',
          serverVersion: null,
        });
      } else {
        setStatus({
          isConnected: true,
          isChecking: false,
          lastChecked: new Date(),
          error: null,
          serverVersion: result.version,
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        serverVersion: null,
      });
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [checkConnection, apiClient]);

  // Show connection banner if disconnected
  if (!status.isConnected && !status.isChecking) {
    return (
      <>
        <ConnectionBanner status={status} onRetry={checkConnection} />
        {children}
      </>
    );
  }

  return <>{children}</>;
}

interface ConnectionBannerProps {
  status: ConnectionStatus;
  onRetry: () => void;
}

function ConnectionBanner({ status, onRetry }: ConnectionBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <WifiOff className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Connection to server lost
            </p>
            <p className="text-xs text-red-600">
              {status.error || 'Unable to reach the API server'}
            </p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}

// Status indicator component
export function ConnectionStatusIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isChecking: true,
    lastChecked: null,
    error: null,
    serverVersion: null,
  });

  const apiClient = getApiClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await apiClient.healthCheck();
        setStatus({
          isConnected: result.status !== 'offline',
          isChecking: false,
          lastChecked: new Date(),
          error: null,
          serverVersion: result.version,
        });
      } catch (error) {
        setStatus({
          isConnected: false,
          isChecking: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          serverVersion: null,
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [apiClient]);

  if (status.isChecking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking connection...</span>
      </div>
    );
  }

  if (status.isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">Disconnected</span>
    </div>
  );
}