// src/hooks/useOffline.ts - Enhanced Offline Functionality (Simplified)
import { useState, useEffect, useCallback, useRef } from 'react';
import { createMockPortfolio, createMockGalleryPieces } from '@/data/mockData';

interface OfflineData {
  dashboardStats: any;
  achievements: any[];
  galleryPieces: any[];
  portfolio: any;
  timestamp: number;
}

interface UseOfflineReturn {
  isOffline: boolean;
  isSyncing: boolean;
  hasOfflineData: boolean;
  initializeOfflineMode: () => void;
  syncData: (data: Partial<OfflineData>) => void;
  getOfflineData: () => OfflineData | null;
  clearOfflineData: () => void;
  lastSyncTime: number | null;
}

const OFFLINE_STORAGE_KEY = 'dashboard_offline_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

// Utility function to safely convert to Date
const ensureDate = (dateInput: any): Date => {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

// Generate mock analytics data
const generateMockAnalyticsData = (portfolio: any, galleryPieces: any[]) => {
  return {
    portfolioType: portfolio?.kind,
    totalItems: galleryPieces?.length || 0,
    recentActivity: Math.floor(Math.random() * 5) + 1,
    completionRate: Math.floor(Math.random() * 40) + 60,
    weeklyGrowth: Math.floor(Math.random() * 30) - 5,
    averageScore: Math.floor(Math.random() * 30) + 70,
    totalViews: Math.floor(Math.random() * 5000) + 1000,
    uniqueVisitors: Math.floor(Math.random() * 1000) + 500,
    engagementRate: Math.floor(Math.random() * 40) + 60,
    averageSessionTime: `${Math.floor(Math.random() * 5) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    monthlyGrowth: Math.floor(Math.random() * 50) + 10
  };
};

// Generate mock achievements
const generateMockAchievements = (portfolio: any, stats: any) => {
  const achievements = [];
  const now = new Date();
  
  // Safely convert portfolio.createdAt to Date
  const portfolioCreatedAt = ensureDate(portfolio?.createdAt) || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  achievements.push({
    id: 'portfolio-created',
    title: 'Portfolio Created',
    description: `Successfully created your ${portfolio?.kind || 'professional'} portfolio`,
    unlockedAt: portfolioCreatedAt,
    type: 'milestone' as const,
    icon: '🎯'
  });

  achievements.push({
    id: 'first-upload',
    title: 'Content Creator',
    description: `Added ${stats?.totalItems || 0} pieces to your portfolio`,
    unlockedAt: new Date(now.getTime() - Math.random() * 21 * 24 * 60 * 60 * 1000),
    type: 'content' as const,
    icon: '✨'
  });

  if (stats?.engagementRate > 70) {
    achievements.push({
      id: 'high-engagement',
      title: 'High Engagement',
      description: `Achieved ${stats.engagementRate}% engagement rate`,
      unlockedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      type: 'performance' as const,
      icon: '📈'
    });
  }

  achievements.push({
    id: 'active-user',
    title: 'Active User',
    description: 'Consistent portfolio activity',
    unlockedAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
    type: 'engagement' as const,
    icon: '⚡'
  });

  return achievements.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
};

export const useOffline = (): UseOfflineReturn => {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const hasInitialized = useRef<boolean>(false);

  // Get offline data - moved before syncData to fix temporal dead zone
  const getOfflineData = useCallback((): OfflineData | null => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored, (key, value) => {
        // Convert ISO date strings back to Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });
      
      const isValid = Date.now() - data.timestamp < CACHE_DURATION;
      
      if (!isValid) {
        localStorage.removeItem(OFFLINE_STORAGE_KEY);
        setHasOfflineData(false);
        return null;
      }
      
      // Ensure all dates are properly converted
      if (data.portfolio) {
        data.portfolio.createdAt = ensureDate(data.portfolio.createdAt);
        data.portfolio.updatedAt = ensureDate(data.portfolio.updatedAt);
      }
      
      if (data.achievements) {
        data.achievements = data.achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: ensureDate(achievement.unlockedAt)
        }));
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to get offline data:', error);
      return null;
    }
  }, []);

  // Initialize offline mode with mock data
  const initializeOfflineMode = useCallback(() => {
    if (hasInitialized.current) return;
    
    console.log('🔧 Initializing offline mode for development...');
    
    const mockPortfolio = createMockPortfolio();
    const mockGalleryPieces = createMockGalleryPieces();
    
    // Ensure portfolio has proper Date objects
    const portfolioWithDates = {
      ...mockPortfolio,
      createdAt: ensureDate(mockPortfolio.createdAt),
      updatedAt: ensureDate(mockPortfolio.updatedAt)
    };
    
    const mockStats = generateMockAnalyticsData(portfolioWithDates, mockGalleryPieces);
    const mockAchievements = generateMockAchievements(portfolioWithDates, mockStats);

    const offlineData: OfflineData = {
      portfolio: portfolioWithDates,
      galleryPieces: mockGalleryPieces,
      dashboardStats: mockStats,
      achievements: mockAchievements,
      timestamp: Date.now()
    };

    // Store the data
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineData, (key, value) => {
        // Convert Date objects to ISO strings for storage
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));
      setHasOfflineData(true);
      setLastSyncTime(offlineData.timestamp);
      hasInitialized.current = true;
      
      console.log('✅ Offline mode initialized with mock data');
      console.log('📊 Mock data includes:', {
        portfolio: portfolioWithDates.kind,
        galleryItems: mockGalleryPieces.length,
        achievements: mockAchievements.length
      });
    } catch (error) {
      console.error('Failed to initialize offline mode:', error);
    }
  }, []);

  // Enhanced sync data function
  const syncData = useCallback((data: Partial<OfflineData>) => {
    setIsSyncing(true);
    
    try {
      const existing = getOfflineData();
      const updatedData: OfflineData = {
        dashboardStats: data.dashboardStats || existing?.dashboardStats || null,
        achievements: data.achievements || existing?.achievements || [],
        galleryPieces: data.galleryPieces || existing?.galleryPieces || [],
        portfolio: data.portfolio || existing?.portfolio || null,
        timestamp: Date.now()
      };

      // Ensure portfolio dates are Date objects
      if (updatedData.portfolio) {
        updatedData.portfolio.createdAt = ensureDate(updatedData.portfolio.createdAt);
        updatedData.portfolio.updatedAt = ensureDate(updatedData.portfolio.updatedAt);
      }

      // Ensure achievement dates are Date objects
      if (updatedData.achievements) {
        updatedData.achievements = updatedData.achievements.map(achievement => ({
          ...achievement,
          unlockedAt: ensureDate(achievement.unlockedAt)
        }));
      }

      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedData, (key, value) => {
        // Convert Date objects to ISO strings for storage
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));
      
      setHasOfflineData(true);
      setLastSyncTime(updatedData.timestamp);
      
      console.log('✅ Data synced for offline use', {
        portfolio: !!updatedData.portfolio,
        galleryItems: updatedData.galleryPieces.length,
        achievements: updatedData.achievements.length
      });
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      // Simulate network delay for UX
      setTimeout(() => setIsSyncing(false), 300);
    }
  }, [getOfflineData]);

  // Clear offline data
  const clearOfflineData = useCallback(() => {
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      setHasOfflineData(false);
      setLastSyncTime(null);
      hasInitialized.current = false;
      console.log('🗑️ Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, []);

  // Check initial offline status and data
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
    };

    const checkOfflineData = () => {
      try {
        const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          const isValid = Date.now() - data.timestamp < CACHE_DURATION;
          setHasOfflineData(isValid);
          setLastSyncTime(data.timestamp);
          
          if (isValid) {
            console.log('📱 Found valid offline data');
          } else {
            console.log('🗑️ Clearing expired offline data');
            localStorage.removeItem(OFFLINE_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.warn('Failed to check offline data:', error);
        setHasOfflineData(false);
      }
    };

    // Initial checks
    updateOnlineStatus();
    checkOfflineData();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []); // Remove initializeOfflineMode dependency

  // Separate effect for auto-initialization in development
  useEffect(() => {
    if (DEVELOPMENT_MODE && !hasOfflineData && !hasInitialized.current) {
      console.log('🔧 Development mode - auto-initializing offline data');
      const timer = setTimeout(() => {
        initializeOfflineMode();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasOfflineData, initializeOfflineMode]); // Stable dependencies

  return {
    isOffline,
    isSyncing,
    hasOfflineData,
    initializeOfflineMode,
    syncData,
    getOfflineData,
    clearOfflineData,
    lastSyncTime
  };
};