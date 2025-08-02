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
  icon: React.ReactNode;
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
  icon: React.ReactNode;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic';
}

export interface DashboardState {
  portfolio: Portfolio | null;
  loading: boolean;
  activeView: 'overview' | 'gallery' | 'learning' | 'analytics';
  stats: QuickStats;
  recentActivity: RecentActivity[];
  galleryItems: GalleryPiece[];
  conceptProgress: ConceptProgress[];
  achievements: Achievement[];
  error: string | null;
}

export interface PortfolioTypeConfig {
  icon: React.ReactNode;
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
      icon: <span>🎨</span>, // Will be replaced with actual icon in component
      title: 'Creative Portfolio',
      description: 'Showcase artwork, designs, and creative projects',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
    },
    educational: {
      icon: <span>🧠</span>,
      title: 'Educational Portfolio',
      description: 'Track learning progress and academic achievements',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    hybrid: {
      icon: <span>📚</span>,
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
      if (portfolio.kind === 'creative' || portfolio.kind === 'hybrid') {
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
            lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
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
          recentActivity: Math.floor(Math.random() * 10) + 3,
          completionRate,
          weeklyGrowth: Math.floor(Math.random() * 25) + 5,
          averageScore
        }
      };
    } catch (error) {
      console.error('Error fetching portfolio content:', error);
      throw new Error('Failed to load some portfolio content.');
    }
  }, [apiClient]);

  const generateEnhancedActivity = useCallback((portfolioKind: string): RecentActivity[] => {
    const activities: RecentActivity[] = [];
    
    if (portfolioKind === 'creative' || portfolioKind === 'hybrid') {
      activities.push(
        {
          id: '1',
          type: 'gallery_upload',
          title: 'New artwork uploaded',
          description: 'Added "Digital Landscape #47" to gallery',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: <span>📷</span>,
          metadata: { category: 'Digital Art' }
        },
        {
          id: '4',
          type: 'achievement_unlock',
          title: 'Achievement unlocked!',
          description: 'Earned "Creative Streak" for 7 consecutive uploads',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon: <span>🏆</span>
        }
      );
    }
    
    if (portfolioKind === 'educational' || portfolioKind === 'hybrid') {
      activities.push(
        {
          id: '2',
          type: 'concept_complete',
          title: 'Concept mastered',
          description: 'Completed "Advanced Calculus - Derivatives" with 94% score',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          icon: <span>📖</span>,
          metadata: { score: 94, category: 'Mathematics' }
        }
      );
    }
    
    activities.push(
      {
        id: '3',
        type: 'project_create',
        title: 'New project started',
        description: 'Began "React Portfolio Website" development',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: <span>💻</span>,
        metadata: { category: 'Web Development' }
      },
      {
        id: '5',
        type: 'portfolio_update',
        title: 'Portfolio updated',
        description: 'Refreshed bio and added new specializations',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: <span>⚙️</span>
      }
    );

    return activities.slice(0, 5);
  }, []);

  const generateAchievements = useCallback((): Achievement[] => {
    return [
      {
        id: '1',
        title: 'First Steps',
        description: 'Created your first portfolio',
        icon: <span>✨</span>,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        rarity: 'common'
      },
      {
        id: '2',
        title: 'Learning Machine',
        description: 'Completed 10 learning concepts',
        icon: <span>🧠</span>,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rarity: 'rare'
      },
      {
        id: '3',
        title: 'Perfectionist',
        description: 'Achieved 95%+ on 5 concepts',
        icon: <span>🎯</span>,
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        rarity: 'epic'
      }
    ];
  }, []);

  const createPortfolio = useCallback(async (type: 'creative' | 'educational' | 'hybrid') => {
    try {
      const newPortfolio = await apiClient.portfolio.create({
        title: `${user?.name}'s ${portfolioTypeConfig[type].title}`,
        bio: `Welcome to my ${type} portfolio. I'm excited to share my journey with you.`,
        visibility: 'public',
        specializations: [],
        tags: []
      });
      
      return newPortfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw new Error('Failed to create portfolio. Please try again.');
    }
  }, [user, apiClient, portfolioTypeConfig]);

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

  return {
    portfolioTypeConfig,
    fetchPortfolioData,
    fetchPortfolioContent,
    generateEnhancedActivity,
    generateAchievements,
    createPortfolio,
    formatTimeAgo
  };
};