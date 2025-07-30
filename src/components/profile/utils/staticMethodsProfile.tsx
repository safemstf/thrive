// src/components/profile/staticMethodsProfile.tsx
'use client';

import React from 'react';
import { 
  Brush, 
  GraduationCap, 
  Code, 
  Layers 
} from 'lucide-react';
import type { PortfolioKind } from '@/types/portfolio.types';

export interface PortfolioStats {
  gallery: {
    totalPieces: number;
    totalViews: number;
    totalLikes: number;
    recentUploads: number;
  };
  learning: {
    totalConcepts: number;
    completed: number;
    inProgress: number;
    weeklyStreak: number;
    averageScore: number;
  };
  analytics: {
    weeklyGrowth: number;
    monthlyViews: number;
    engagementRate: number;
  };
}

export interface UserStats {
  visits: number;
  averageRating: number;
  totalRatings: number;
}

/**
 * Get user initials from full name
 */
export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/**
 * Get portfolio type configuration with styling and metadata
 */
export const getPortfolioTypeConfig = (type: PortfolioKind) => {
  switch (type) {
    case 'creative':
      return {
        icon: <Brush size={24} />,
        title: 'Creative Portfolio',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        description: 'Showcase your artwork, designs, and creative projects',
        features: ['Image galleries', 'Portfolio showcase', 'Creative collections'],
        capabilities: ['gallery', 'visual_showcase', 'client_presentations']
      };
    case 'educational':
      return {
        icon: <GraduationCap size={24} />,
        title: 'Educational Portfolio',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        description: 'Track your academic progress and learning achievements',
        features: ['Progress tracking', 'Concept mastery', 'Learning analytics'],
        capabilities: ['learning', 'progress_tracking', 'educational_content']
      };
    case 'professional':
      return {
        icon: <Code size={24} />,
        title: 'Professional Portfolio',
        color: '#059669',
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        description: 'Highlight your technical skills and professional experience',
        features: ['Code repositories', 'Technical projects', 'Professional timeline'],
        capabilities: ['projects', 'technical_showcase', 'professional_timeline']
      };
    case 'hybrid':
      return {
        icon: <Layers size={24} />,
        title: 'Hybrid Portfolio',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
        description: 'Combine creative works with educational progress',
        features: ['Creative showcase', 'Learning progress', 'Unified dashboard'],
        capabilities: ['gallery', 'learning', 'projects', 'unified_analytics']
      };
    default:
      return {
        icon: <Layers size={24} />,
        title: 'Portfolio',
        color: '#6b7280',
        gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
        description: 'Your portfolio',
        features: ['Portfolio management'],
        capabilities: ['basic']
      };
  }
};

/**
 * Generate mock user stats (replace with real API call)
 */
export const generateMockUserStats = (): UserStats => {
  return {
    visits: Math.floor(Math.random() * 1000) + 100,
    averageRating: Math.random() * 2 + 3,
    totalRatings: Math.floor(Math.random() * 50) + 10
  };
};

/**
 * Generate mock portfolio stats (replace with real API call)
 */
export const generateMockPortfolioStats = (): PortfolioStats => {
  return {
    gallery: {
      totalPieces: Math.floor(Math.random() * 50) + 10,
      totalViews: Math.floor(Math.random() * 1000) + 100,
      totalLikes: Math.floor(Math.random() * 100) + 20,
      recentUploads: Math.floor(Math.random() * 5) + 1
    },
    learning: {
      totalConcepts: Math.floor(Math.random() * 50) + 20,
      completed: Math.floor(Math.random() * 30) + 10,
      inProgress: Math.floor(Math.random() * 10) + 3,
      weeklyStreak: Math.floor(Math.random() * 14) + 1,
      averageScore: Math.floor(Math.random() * 30) + 70
    },
    analytics: {
      weeklyGrowth: Math.floor(Math.random() * 25) + 5,
      monthlyViews: Math.floor(Math.random() * 1000) + 500,
      engagementRate: Math.floor(Math.random() * 20) + 15
    }
  };
};

/**
 * Show success notification
 */
export const showSuccessNotification = (message: string) => {
  const successMessage = document.createElement('div');
  successMessage.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #10b981; 
      color: white; 
      padding: 1rem; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 300px;
    ">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
      </svg>
      ${message}
    </div>
  `;
  document.body.appendChild(successMessage);
  
  setTimeout(() => {
    if (document.body.contains(successMessage)) {
      document.body.removeChild(successMessage);
    }
  }, 3000);
};

/**
 * Show error notification
 */
export const showErrorNotification = (message: string) => {
  const errorMessage = document.createElement('div');
  errorMessage.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #dc2626; 
      color: white; 
      padding: 1rem; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      max-width: 300px;
    ">
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      ${message}
    </div>
  `;
  document.body.appendChild(errorMessage);
  
  setTimeout(() => {
    if (document.body.contains(errorMessage)) {
      document.body.removeChild(errorMessage);
    }
  }, 5000);
};

/**
 * Format numbers for display (e.g., 1000 -> 1K)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Calculate completion percentage
 */
export const calculateCompletionPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Generate portfolio URL
 */
export const generatePortfolioUrl = (username: string): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/portfolio/${username}`;
  }
  return `/portfolio/${username}`;
};

/**
 * Clear URL parameters
 */
export const clearUrlParams = (router: any, paramNames: string[]) => {
  const newUrl = new URL(window.location.href);
  paramNames.forEach(param => newUrl.searchParams.delete(param));
  router.replace(newUrl.pathname, { scroll: false });
};

/**
 * Validate portfolio data before creation/update
 */
export const validatePortfolioData = (data: {
  title?: string;
  bio?: string;
  visibility?: string;
  kind?: PortfolioKind;
}) => {
  const errors: string[] = [];

  if (data.title && data.title.trim().length < 3) {
    errors.push('Portfolio title must be at least 3 characters long');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Portfolio title must be less than 100 characters');
  }

  if (data.bio && data.bio.length > 1000) {
    errors.push('Bio must be less than 1000 characters');
  }

  if (data.visibility && !['public', 'private', 'unlisted'].includes(data.visibility)) {
    errors.push('Invalid visibility setting');
  }

  if (data.kind && !['creative', 'educational', 'professional', 'hybrid'].includes(data.kind)) {
    errors.push('Invalid portfolio kind');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get tab configuration based on portfolio type
 */
export const getTabConfiguration = (portfolioKind: PortfolioKind | null) => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
  ];

  if (!portfolioKind) return baseTabs;

  const tabs = [...baseTabs];

  // Add gallery tab for portfolios with gallery capability
  if (['creative', 'hybrid', 'professional'].includes(portfolioKind)) {
    tabs.push({ id: 'gallery', label: 'Gallery', icon: 'Images' });
  }

  // Add learning tab for portfolios with learning capability
  if (['educational', 'hybrid'].includes(portfolioKind)) {
    tabs.push({ id: 'learning', label: 'Learning', icon: 'BookOpen' });
  }

  // Add analytics and settings for all portfolios
  tabs.push(
    { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  );

  // Add upgrade tab if not hybrid
  if (portfolioKind !== 'hybrid') {
    tabs.push({ id: 'upgrade', label: 'Upgrade', icon: 'Plus' });
  }

  return tabs;
};

/**
 * Get redirect URL after portfolio creation based on type
 */
export const getPostCreationRedirect = (portfolioKind: PortfolioKind): string => {
  const redirectMap: Record<PortfolioKind, string> = {
    creative: '/dashboard/gallery',
    educational: '/dashboard/writing',
    professional: '/dashboard/projects',
    hybrid: '/dashboard/profile'
  };

  return redirectMap[portfolioKind] || '/dashboard/profile';
};

/**
 * Check if portfolio has specific capabilities
 */
export const portfolioHasCapability = (portfolioKind: PortfolioKind | null, capability: string): boolean => {
  if (!portfolioKind) return false;
  
  const config = getPortfolioTypeConfig(portfolioKind);
  return config.capabilities.includes(capability);
};

/**
 * Get available upgrade options for a portfolio type
 */
export const getUpgradeOptions = (currentKind: PortfolioKind): PortfolioKind[] => {
  if (currentKind === 'hybrid') return [];
  return ['hybrid']; // For now, all upgrade paths lead to hybrid
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get time ago string
 */
export const getTimeAgo = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
};

/**
 * Generate color variations for themes
 */
export const generateColorVariations = (baseColor: string) => {
  // This is a simplified version - in production you'd use a proper color manipulation library
  return {
    50: `${baseColor}0d`,   // 5% opacity
    100: `${baseColor}1a`,  // 10% opacity
    200: `${baseColor}33`,  // 20% opacity
    300: `${baseColor}4d`,  // 30% opacity
    400: `${baseColor}66`,  // 40% opacity
    500: baseColor,         // Base color
    600: baseColor,         // Slightly darker (simplified)
    700: baseColor,         // Darker (simplified)
    800: baseColor,         // Much darker (simplified)
    900: baseColor,         // Darkest (simplified)
  };
};