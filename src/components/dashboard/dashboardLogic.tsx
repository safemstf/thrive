// src/components/dashboard/dashboardLogic.tsx
"use client";

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';

// Enhanced types
export interface QuickStats {
  portfolioType?: string;
  totalItems: number;
  recentActivity: number;
  completionRate: number;
  weeklyGrowth: number;
  averageScore?: number;
}

export interface RecentActivity {
  id: string;
  type: 'gallery_upload' | 'concept_complete' | 'project_create' | 'portfolio_update' | 'achievement_unlock';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    category?: string;
    status?: string;
  };
}

export interface ConceptProgress {
  conceptId: string;
  title?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

export interface PortfolioTypeConfig {
  title: string;
  description: string;
  color: string;
  gradient: string;
}

export const useDashboardLogic = () => {
  const { user } = useAuth();
  const apiClient = useApiClient();

  // Portfolio type configuration
  const portfolioTypeConfig = useMemo((): Record<string, PortfolioTypeConfig> => ({
    creative: {
      title: 'Creative Portfolio',
      description: 'Showcase artwork, designs, and creative projects',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    },
    educational: {
      title: 'Educational Portfolio',
      description: 'Track learning progress and academic achievements',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    professional: {
      title: 'Professional Portfolio',
      description: 'Highlight technical skills and professional experience',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
    },
    hybrid: {
      title: 'Hybrid Portfolio',
      description: 'Combine creative works with educational progress',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)'
    }
  }), []);

  // Data fetching functions
  const fetchPortfolioData = useCallback(async () => {
    if (!user) return null;
    
    try {
      const portfolioData = await apiClient.portfolio.getMyPortfolio();
      return portfolioData;
    } catch (error: any) {
      if (error?.status !== 404) {
        console.error('Error fetching portfolio:', error);
        throw new Error('Failed to load portfolio data. Please try again.');
      }
      return null;
    }
  }, [user, apiClient]);

  const fetchPortfolioContent = useCallback(async (portfolio: Portfolio) => {
    let totalItems = 0;
    let completionRate = 0;
    let averageScore = 0;
    let galleryItems: GalleryPiece[] = [];
    let conceptProgress: ConceptProgress[] = [];

    try {
      // Gallery content fetching
      if (portfolio.kind === 'creative' || portfolio.kind === 'hybrid' || portfolio.kind === 'professional') {
        try {
          const galleryResponse = await apiClient.gallery.getPieces({ limit: 20 });
          galleryItems = Array.isArray(galleryResponse) ? galleryResponse : galleryResponse.pieces || [];
          totalItems += galleryItems.length;
        } catch (error) {
          console.log('No gallery data available');
        }
      }

      // Learning content fetching
      if (portfolio.kind === 'educational' || portfolio.kind === 'hybrid') {
        try {
          const conceptData = await apiClient.portfolio.getMyConcepts();
          const enhancedConcepts = (conceptData || []).map((concept: ConceptProgress, index: number) => ({
            ...concept,
            title: concept.title || `Concept ${index + 1}`,
            category: concept.category || 'General',
            difficulty: concept.difficulty || 'intermediate',
            lastUpdated: concept.lastUpdated || new Date()
          }));
          
          conceptProgress = enhancedConcepts;
          const completed = enhancedConcepts.filter((c: ConceptProgress) => c.status === 'completed').length;
          totalItems += enhancedConcepts.length;
          completionRate = enhancedConcepts.length > 0 ? (completed / enhancedConcepts.length) * 100 : 0;
          
          // Calculate average score
          const scoredConcepts = enhancedConcepts.filter((c: ConceptProgress) => c.score);
          averageScore = scoredConcepts.length > 0 
            ? scoredConcepts.reduce((sum: number, c: ConceptProgress) => sum + (c.score || 0), 0) / scoredConcepts.length 
            : 0;
        } catch (error) {
          console.log('No concept data available');
        }
      }

      return {
        galleryItems,
        conceptProgress,
        stats: {
          portfolioType: portfolio.kind,
          totalItems,
          recentActivity: 0, // Will be populated from actual activity data
          completionRate,
          weeklyGrowth: 0, // Will be calculated from historical data
          averageScore
        }
      };
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      throw new Error('Failed to load some portfolio content.');
    }
  }, [apiClient]);

  // Fetch recent activity from API
  const fetchRecentActivity = useCallback(async (portfolioId: string): Promise<RecentActivity[]> => {
    if (!portfolioId) return [];
    
    try {
      // TODO: Implement when activity API is available
      // const activityData = await apiClient.portfolio.getRecentActivity(portfolioId);
      // return activityData.map(activity => ({
      //   ...activity,
      //   timestamp: new Date(activity.timestamp)
      // }));
      
      return []; // Return empty array until API is ready
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }, [apiClient]);

  // Fetch achievements from API
  const fetchAchievements = useCallback(async (portfolioId: string): Promise<Achievement[]> => {
    if (!portfolioId) return [];
    
    try {
      // TODO: Implement when achievements API is available
      // const achievementsData = await apiClient.portfolio.getAchievements(portfolioId);
      // return achievementsData.map(achievement => ({
      //   ...achievement,
      //   unlockedAt: new Date(achievement.unlockedAt)
      // }));
      
      return []; // Return empty array until API is ready
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }, [apiClient]);

  // Calculate dashboard statistics from real data
  const calculateDashboardStats = useCallback((
    galleryItems: GalleryPiece[], 
    conceptProgress: ConceptProgress[],
    recentActivity: RecentActivity[]
  ): QuickStats => {
    const totalItems = galleryItems.length + conceptProgress.length;
    
    // Calculate completion rate for educational portfolios
    const completedConcepts = conceptProgress.filter(c => c.status === 'completed').length;
    const completionRate = conceptProgress.length > 0 
      ? (completedConcepts / conceptProgress.length) * 100 
      : 0;

    // Calculate average score from completed concepts
    const scoredConcepts = conceptProgress.filter(c => c.score);
    const averageScore = scoredConcepts.length > 0
      ? scoredConcepts.reduce((sum, c) => sum + (c.score || 0), 0) / scoredConcepts.length
      : undefined;

    // Recent activity count (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = recentActivity.filter(
      activity => activity.timestamp > weekAgo
    ).length;

    return {
      totalItems,
      recentActivity: recentActivityCount,
      completionRate,
      weeklyGrowth: 0, // TODO: Calculate from historical data
      averageScore
    };
  }, []);

  // Utility functions
  const formatTimeAgo = useCallback((date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  }, []);

  // Get available views based on portfolio type
  const getAvailableViews = useCallback((portfolioKind: string) => {
    const views = ['overview', 'analytics'];
    
    if (portfolioKind === 'creative' || portfolioKind === 'hybrid' || portfolioKind === 'professional') {
      views.push('gallery');
    }
    
    if (portfolioKind === 'educational' || portfolioKind === 'hybrid') {
      views.push('learning');
    }
    
    return views;
  }, []);

  return {
    // Configuration
    portfolioTypeConfig,
    
    // Data fetching
    fetchPortfolioData,
    fetchPortfolioContent,
    fetchRecentActivity,
    fetchAchievements,
    
    // Data processing
    calculateDashboardStats,
    
    // Utilities
    formatTimeAgo,
    getAvailableViews
  };
};