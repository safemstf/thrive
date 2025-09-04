// src/components/thrive/thriveLogic.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Target, Trophy, BarChart3, Eye, Sparkles, CheckCircle, Timer,
  Brain, AlertCircle, Lightbulb, Shield, Users, Activity,
  Code, TrendingUp, Calculator, Star, Globe, Award
} from 'lucide-react';

// Import all data from mockData
import {
  PROFESSIONAL_ASSESSMENTS,
  PSYCHOLOGICAL_ASSESSMENTS,
  CREATIVITY_ASSESSMENTS,
  MOCK_TOP_PERFORMERS,
  PLATFORM_RANKING_STATS,
  MOCK_ASSESSMENT_LEADERBOARDS,
  WEEKLY_TRENDING_PERFORMERS,
  ASSESSMENT_COMPLETION_TRENDS,
  EMPLOYER_TOOLS,
  EMPLOYER_PLATFORM_METRICS
} from '@/data/mockData';

// ==============================================
// TYPES & INTERFACES
// ==============================================

export interface Assessment {
  id: string;
  title: string;
  description: string;
  skillType?: string;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  duration?: number | string;
  participants?: number;
  averageScore?: number;
  route?: string;
  icon?: any;
  color?: string;
  items?: number;
  validated?: boolean;
  category?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  username?: string;
  score: number;
  verified?: boolean;
  completedAt?: Date;
  timeSpent?: number;
}

export interface PlatformStats {
  totalParticipants: number;
  activeThisWeek: number;
  completionsToday: number;
  averageScore: number;
  verifiedProfessionals?: number;
  activeSessions?: number;
  employerTrust?: number;
}

export type ViewMode = 'assessments' | 'rankings' | 'analytics' | 'employer-tools';
export type AssessmentCategory = 'professional' | 'psychological' | 'creativity';

// ==============================================
// DATA TRANSFORMATION FUNCTIONS
// ==============================================

// Transform professional assessments to add missing fields for dashboard
export type PsychCategory = 'personality' | 'clinical' | 'wellbeing';

const transformPsychologicalAssessments = (): Record<PsychCategory, Assessment[]> => {
  return {
    personality: PSYCHOLOGICAL_ASSESSMENTS.filter(a => a.category === 'Personality').map(a => ({
      ...a,
      icon: Brain,
      color: '#8b5cf6',
      duration: a.duration || '10-15 min',
      route: `/dashboard/thrive/assessments/${a.id}`
    })),
    clinical: PSYCHOLOGICAL_ASSESSMENTS.filter(a => a.category === 'Clinical').map(a => ({
      ...a,
      icon: Brain,
      color: '#8b5cf6',
      duration: a.duration || '10-15 min',
      route: `/dashboard/thrive/assessments/${a.id}`
    })),
    wellbeing: PSYCHOLOGICAL_ASSESSMENTS.filter(a => a.category === 'Wellbeing').map(a => ({
      ...a,
      icon: Brain,
      color: '#8b5cf6',
      duration: a.duration || '10-15 min',
      route: `/dashboard/thrive/assessments/${a.id}`
    }))
  };
};

const transformProfessionalAssessments = (): Assessment[] => {
  return PROFESSIONAL_ASSESSMENTS.map((assessment, index) => ({
    ...assessment,
    duration: 45 + index * 5,
    participants: 5000 + index * 2000,
    averageScore: 70 + index * 3,
    difficulty: ['intermediate', 'expert', 'intermediate', 'expert', 'beginner', 'expert'][index] as any,
    skillType: ['code', 'analytics', 'management', 'design', 'marketing', 'cloud'][index],
    route: `/dashboard/thrive/assessments/${assessment.id}`
  }));
};


// Transform creativity assessments
const transformCreativityAssessments = (): Assessment[] => {
  return CREATIVITY_ASSESSMENTS.map(assessment => ({
    ...assessment,
    route: `/dashboard/thrive/assessments/${assessment.id}`
  }));
};

// Transform leaderboard data
const transformLeaderboard = (): LeaderboardEntry[] => {
  return MOCK_TOP_PERFORMERS.slice(0, 8).map(performer => ({
    rank: performer.rank,
    name: performer.name,
    username: performer.username,
    score: performer.totalScore,
    verified: performer.verified
  }));
};

// Transform platform stats
const transformPlatformStats = (): PlatformStats => {
  return {
    totalParticipants: PLATFORM_RANKING_STATS.totalParticipants,
    activeThisWeek: PLATFORM_RANKING_STATS.activeThisWeek,
    completionsToday: PLATFORM_RANKING_STATS.completionsToday,
    averageScore: PLATFORM_RANKING_STATS.averageScore,
    verifiedProfessionals: PLATFORM_RANKING_STATS.totalParticipants,
    activeSessions: Math.floor(PLATFORM_RANKING_STATS.activeThisWeek / 10),
    employerTrust: 94
  };
};

// ==============================================
// CONTEXT & PROVIDER
// ==============================================

interface ThriveContextType {
  // State
  mainView: ViewMode;
  assessmentCategory: AssessmentCategory;
  psychCategory: PsychCategory;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Data
  professionalAssessments: Assessment[];
  psychologicalAssessments: Record<PsychCategory, Assessment[]>;
  creativityAssessments: Assessment[];
  leaderboard: LeaderboardEntry[];
  topPerformers: typeof MOCK_TOP_PERFORMERS;
  platformStats: PlatformStats;
  assessmentLeaderboards: typeof MOCK_ASSESSMENT_LEADERBOARDS;
  weeklyTrending: typeof WEEKLY_TRENDING_PERFORMERS;
  completionTrends: typeof ASSESSMENT_COMPLETION_TRENDS;
  employerTools: typeof EMPLOYER_TOOLS;
  employerMetrics: typeof EMPLOYER_PLATFORM_METRICS;
  
  // Actions
  setMainView: (view: ViewMode) => void;
  setAssessmentCategory: (category: AssessmentCategory) => void;
  setPsychCategory: (category: PsychCategory) => void;
  setLoading: (loading: boolean) => void;
  handleStartAssessment: (route: string) => void;
  handleAssessmentClick: (assessmentId: string) => void;
  handleCreateAccount: () => void;
  handleSignIn: () => void;
  
  // Search params
  requestedAssessment: string | null;
  fromPublic: boolean;
}

const ThriveContext = createContext<ThriveContextType | undefined>(undefined);

export const useThrive = () => {
  const context = useContext(ThriveContext);
  if (!context) {
    throw new Error('useThrive must be used within ThriveProvider');
  }
  return context;
};

interface ThriveProviderProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export const ThriveProvider: React.FC<ThriveProviderProps> = ({ 
  children, 
  isAuthenticated = false 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [mainView, setMainView] = useState<ViewMode>('assessments');
  const [assessmentCategory, setAssessmentCategory] = useState<AssessmentCategory>('professional');
  const [psychCategory, setPsychCategory] = useState<PsychCategory>('personality');
  const [loading, setLoading] = useState(false);
  
  // Transform data on mount
  const [professionalAssessments] = useState(() => transformProfessionalAssessments());
  const [psychologicalAssessments] = useState(() => transformPsychologicalAssessments());
  const [creativityAssessments] = useState(() => transformCreativityAssessments());
  const [leaderboard] = useState(() => transformLeaderboard());
  const [platformStats] = useState(() => transformPlatformStats());
  
  // Search params
  const requestedAssessment = searchParams.get('assessment');
  const fromPublic = searchParams.get('from') === 'public';
  
  // Check for redirect after login
  useEffect(() => {
    if (isAuthenticated && requestedAssessment) {
      const assessment = professionalAssessments.find(a => a.title === requestedAssessment);
      if (assessment) {
        // Auto-start the requested assessment after login
        setTimeout(() => {
          router.push(`/dashboard/thrive/assessments/${assessment.id}`);
        }, 1000);
      }
    }
  }, [isAuthenticated, requestedAssessment, professionalAssessments, router]);
  
  // Handlers
  const handleStartAssessment = useCallback((route: string) => {
    setLoading(true);
    if (isAuthenticated) {
      router.push(route);
    } else {
      router.push(`/auth/register?redirect=${route}`);
    }
  }, [router, isAuthenticated]);
  
  const handleAssessmentClick = useCallback((assessmentId: string) => {
    setLoading(true);
    
    // Find the assessment across all categories
    const allAssessments = [
      ...professionalAssessments,
      ...creativityAssessments,
      ...Object.values(psychologicalAssessments).flat()
    ];
    
    const assessment = allAssessments.find(a => a.id === assessmentId);
    
    if (isAuthenticated) {
      // Direct navigation for authenticated users
      router.push(`/dashboard/thrive/assessments/${assessmentId}`);
    } else {
      // Redirect to register with assessment info for non-authenticated
      const title = assessment?.title || assessmentId;
      router.push(`/auth/register?redirect=/dashboard/thrive/assessments/${assessmentId}&assessment=${encodeURIComponent(title)}`);
    }
  }, [router, isAuthenticated, professionalAssessments, creativityAssessments, psychologicalAssessments]);
  
  const handleCreateAccount = useCallback(() => {
    router.push('/auth/register?redirect=/dashboard/thrive&from=public');
  }, [router]);
  
  const handleSignIn = useCallback(() => {
    router.push('/auth/login?redirect=/dashboard/thrive');
  }, [router]);
  
  const value: ThriveContextType = {
    // State
    mainView,
    assessmentCategory,
    psychCategory,
    loading,
    isAuthenticated,
    
    // Data
    professionalAssessments,
    psychologicalAssessments,
    creativityAssessments,
    leaderboard,
    topPerformers: MOCK_TOP_PERFORMERS,
    platformStats,
    assessmentLeaderboards: MOCK_ASSESSMENT_LEADERBOARDS,
    weeklyTrending: WEEKLY_TRENDING_PERFORMERS,
    completionTrends: ASSESSMENT_COMPLETION_TRENDS,
    employerTools: EMPLOYER_TOOLS,
    employerMetrics: EMPLOYER_PLATFORM_METRICS,
    
    // Actions
    setMainView,
    setAssessmentCategory,
    setPsychCategory,
    setLoading,
    handleStartAssessment,
    handleAssessmentClick,
    handleCreateAccount,
    handleSignIn,
    
    // Search params
    requestedAssessment,
    fromPublic
  };
  
  return (
    <ThriveContext.Provider value={value}>
      {children}
    </ThriveContext.Provider>
  );
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

export const getAssessmentIcon = (type: string) => {
  const icons: Record<string, any> = {
    code: Code,
    analytics: BarChart3,
    management: Users,
    design: Lightbulb,
    marketing: TrendingUp,
    cloud: Globe,
    brain: Brain,
    creativity: Lightbulb,
    critical: Calculator
  };
  
  return icons[type] || Target;
};

export const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, string> = {
    beginner: 'linear-gradient(135deg, #10b981, #059669)',
    intermediate: 'linear-gradient(135deg, #f59e0b, #d97706)',
    expert: 'linear-gradient(135deg, #ef4444, #dc2626)'
  };
  
  return colors[difficulty] || '#6b7280';
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export const formatDuration = (duration: string | number): string => {
  if (typeof duration === 'string') return duration;
  return `${duration} min`;
};