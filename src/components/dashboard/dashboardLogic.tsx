// src/components/dashboard/dashboardLogic.tsx
"use client";

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/authProvider';
import { useApiClient } from '@/lib/api-client';
import type { Portfolio } from '@/types/portfolio.types';
import type { GalleryPiece, GalleryStatus } from '@/types/gallery.types';
import type { BackendGalleryPiece } from '@/types/base.types';

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

// Convert BackendGalleryPiece to GalleryPiece for dashboard compatibility
const convertToGalleryPiece = (backendPiece: BackendGalleryPiece, portfolioId?: string, userId?: string): GalleryPiece => {
  // Ensure we have a valid ID
  const pieceId = backendPiece._id || backendPiece.id || `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle dimensions with proper type checking
  const dimensions = backendPiece.dimensions && 
    typeof backendPiece.dimensions.width === 'number' && 
    typeof backendPiece.dimensions.height === 'number'
    ? {
        width: backendPiece.dimensions.width,
        height: backendPiece.dimensions.height,
        depth: backendPiece.dimensions.depth,
        unit: backendPiece.dimensions.unit || 'cm'
      }
    : undefined;

  // Set default status since BackendGalleryPiece doesn't have status field
  const status: GalleryStatus = 'available'; // Default status for all pieces
  
  return {
    _id: pieceId,
    id: pieceId, // GalleryPiece requires non-optional id
    title: backendPiece.title,
    artist: backendPiece.artist || userId || 'Unknown Artist',
    description: backendPiece.description,
    
    // Images
    thumbnailUrl: backendPiece.thumbnailUrl || backendPiece.imageUrl,
    imageUrl: backendPiece.imageUrl,
    highResUrl: backendPiece.imageUrl, // Use main image as high-res fallback
    
    // Metadata & Accessibility
    alt: backendPiece.title || 'Gallery piece',
    medium: backendPiece.medium,
    year: backendPiece.year,
    size: 'medium' as const, // Default size
    displayOrder: backendPiece.displayOrder || 0,
    
    // Dimensions (properly typed)
    dimensions,
    
    // Sales/Status
    status, // Default to 'available' since BackendGalleryPiece doesn't include status
    price: backendPiece.price,
    currency: 'USD', // Default currency
    
    // Visibility & Permissions
    visibility: backendPiece.visibility || 'public',
    ownerId: userId || portfolioId || '', // Use user ID or portfolio ID as fallback
    sharedWith: [],
    shareToken: undefined,
    
    // Timestamps
    createdAt: backendPiece.createdAt ? new Date(backendPiece.createdAt) : new Date(),
    updatedAt: backendPiece.updatedAt ? new Date(backendPiece.updatedAt) : new Date(),
    publishedAt: backendPiece.createdAt ? new Date(backendPiece.createdAt) : undefined,
    
    // Tags & Categories
    tags: backendPiece.tags,
    category: backendPiece.category as any, // Type assertion for category
    
    // Upload metadata
    uploadedBy: userId || '', // Use current user ID
    originalFileName: undefined,
    fileSize: backendPiece.metadata?.fileSize,
    mimeType: backendPiece.metadata?.format,
    
    // Portfolio/Social Features
    portfolioId: backendPiece.portfolioId || portfolioId,
    views: backendPiece.stats?.views || 0,
    likes: backendPiece.stats?.likes || 0,
  };
};

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
      // Use the correct API method from your PortfolioApiClient
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
          // Use the correct API method from your PortfolioApiClient
          const galleryResponse = await apiClient.portfolio.getMyGalleryPieces();
          
          // Handle the response structure from your API
          let backendPieces: BackendGalleryPiece[] = [];
          
          if (galleryResponse && typeof galleryResponse === 'object') {
            if ('success' in galleryResponse && galleryResponse.success !== false) {
              // Response with success flag - use galleryPieces from your API
              backendPieces = galleryResponse.galleryPieces || [];
            } else if (Array.isArray(galleryResponse)) {
              // Direct array response
              backendPieces = galleryResponse;
            }
          }
          
          // Convert backend pieces to dashboard-compatible format
          galleryItems = backendPieces.map(piece => 
            convertToGalleryPiece(piece, portfolio.id || portfolio._id, portfolio.userId)
          );
          totalItems += galleryItems.length;
          
          console.log(`Loaded ${galleryItems.length} gallery items for dashboard`);
        } catch (error) {
          console.log('No gallery data available:', error);
          galleryItems = [];
        }
      }

      // Learning content fetching
      if (portfolio.kind === 'educational' || portfolio.kind === 'hybrid') {
        try {
          // Use the correct API method from your PortfolioApiClient
          const conceptResponse = await apiClient.portfolio.getMyConcepts();
          
          // Handle concept response structure
          let concepts: ConceptProgress[] = [];
          
          if (conceptResponse && typeof conceptResponse === 'object') {
            if ('success' in conceptResponse && conceptResponse.success !== false) {
              concepts = conceptResponse.concepts || [];
            } else if (Array.isArray(conceptResponse)) {
              concepts = conceptResponse;
            }
          }
          
          const enhancedConcepts = concepts.map((concept: ConceptProgress, index: number) => ({
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
            
          console.log(`Loaded ${enhancedConcepts.length} concepts for dashboard`);
        } catch (error) {
          console.log('No concept data available:', error);
          conceptProgress = [];
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
      // Use the analytics method when available
      const analytics = await apiClient.portfolio.getAnalytics('7d');
      
      // Extract recent activity from analytics if available
      if (analytics && analytics.success && analytics.analytics) {
        // Transform analytics data to recent activity format
        // This is a placeholder - adjust based on your actual analytics structure
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }, [apiClient]);

  // Fetch achievements from API
  const fetchAchievements = useCallback(async (portfolioId: string): Promise<Achievement[]> => {
    if (!portfolioId) return [];
    
    try {
      // Use the dashboard method to get achievement data
      const dashboardData = await apiClient.portfolio.getDashboard();
      
      if (dashboardData && dashboardData.success && dashboardData.dashboard) {
        // Extract achievements from dashboard data if available
        // This is a placeholder - adjust based on your actual dashboard structure
        return [];
      }
      
      return [];
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