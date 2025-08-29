// src/app/dashboard/thrive/page.tsx - Enhanced with Modern UI/UX
'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Target, Trophy, BarChart3, Eye, Sparkles, CheckCircle, Timer,
  Brain, AlertCircle, Lightbulb, ChevronRight, Shield, Star,
  TrendingUp, Users, Heart, Zap, Palette, PenTool, BookOpen,
  Settings, Award, Activity, Loader2, ArrowRight, Globe, Puzzle
} from 'lucide-react';

// Import mock data
import { 
  PROFESSIONAL_ASSESSMENTS, 
  PSYCHOLOGICAL_ASSESSMENTS, 
  CREATIVITY_ASSESSMENTS 
} from '@/data/mockData';

// Import shared components and logic
import { ThriveProvider, useThrive, formatDuration, formatNumber } from '@/components/thrive/thriveLogic';

// Types for navigation
type ViewMode = 'assessments' | 'analytics' | 'rankings' | 'employer-tools';
type AssessmentCategory = 'professional' | 'psychological' | 'creativity';
import {
  PageWrapper,
  ContentContainer,
  EnhancedHeroSection,
  StatsOverview,
  StatCard,
  StatNumber,
  StatLabel,
  AssessmentGrid,
  AssessmentCardWrapper,
  AssessmentTitle,
  AssessmentDescription,
  AssessmentMeta,
  DifficultyBadge,
  SkillIcon,
  LeaderboardCard,
  LeaderboardItem,
  RankBadge,
  GlassSection,
  ProgressIndicator
} from '@/components/thrive/styles';

// Import from styled-components hub
import { 
  ContentWrapper,
  Section,
  Heading1,
  Heading2,
  BodyText,
  BaseButton,
  Card,
  CardContent,
  Grid,
  FlexRow,
  FlexColumn,
  Badge,
  LoadingContainer,
  LoadingSpinner,
  HeroSection
} from '@/styles/styled-components';

// Import auth
import { useAuth } from '@/providers/authProvider';

// Dynamic imports for code splitting
const AnalyticsPage = dynamic(() => import('./analytics/page'), { 
  ssr: false,
  loading: () => (
    <LoadingContainer>
      <LoadingSpinner $size="lg" />
      <BodyText>Loading Analytics...</BodyText>
    </LoadingContainer>
  )
});

const RankingsPage = dynamic(() => import('./ranking/page'), { ssr: false });
const EmployerToolsPage = dynamic(() => import('./employerTools/page'), { ssr: false });

// ==============================================
// ENHANCED NAVIGATION COMPONENTS
// ==============================================

const PrimaryNavigation = ({ activeView, onViewChange }: {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}) => (
  <FlexRow $justify="center" $gap="var(--spacing-lg)" style={{ 
    marginBottom: 'var(--spacing-2xl)',
    flexWrap: 'wrap'
  }}>
    <BaseButton
      $variant={activeView === 'assessments' ? 'primary' : 'secondary'}
      onClick={() => onViewChange('assessments')}
    >
      <Target size={18} />
      My Skill Assessments
    </BaseButton>
    <BaseButton
      $variant={activeView === 'analytics' ? 'primary' : 'secondary'}
      onClick={() => onViewChange('analytics')}
    >
      <BarChart3 size={18} />
      My Analytics
    </BaseButton>
    <BaseButton
      $variant={activeView === 'rankings' ? 'primary' : 'secondary'}
      onClick={() => onViewChange('rankings')}
    >
      <Trophy size={18} />
      Global Rankings
    </BaseButton>
    <BaseButton
      $variant={activeView === 'employer-tools' ? 'primary' : 'secondary'}
      onClick={() => onViewChange('employer-tools')}
    >
      <Eye size={18} />
      Employer Tools
    </BaseButton>
  </FlexRow>
);

const AssessmentCategoryTabs = ({ activeCategory, onCategoryChange }: {
  activeCategory: AssessmentCategory;
  onCategoryChange: (category: AssessmentCategory) => void;
}) => (
  <FlexRow $justify="center" $gap="var(--spacing-md)" style={{ 
    marginBottom: 'var(--spacing-xl)',
    flexWrap: 'wrap'
  }}>
    <BaseButton
      $variant={activeCategory === 'professional' ? 'primary' : 'ghost'}
      $size="sm"
      onClick={() => onCategoryChange('professional')}
    >
      <Target size={16} />
      Professional Skills
    </BaseButton>
    <BaseButton
      $variant={activeCategory === 'psychological' ? 'primary' : 'ghost'}
      $size="sm"
      onClick={() => onCategoryChange('psychological')}
    >
      <Brain size={16} />
      Psychological
    </BaseButton>
    <BaseButton
      $variant={activeCategory === 'creativity' ? 'primary' : 'ghost'}
      $size="sm"
      onClick={() => onCategoryChange('creativity')}
    >
      <Lightbulb size={16} />
      Creativity & Critical
    </BaseButton>
  </FlexRow>
);

// ==============================================
// ENHANCED USER DASHBOARD COMPONENTS
// ==============================================

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const PersonalizedUserStats = ({ user }: { user: any }) => {
  const userLevel = Math.floor(Math.random() * 10) + 5;
  const totalXP = (Math.floor(Math.random() * 2000) + 500);
  const completed = Math.floor(Math.random() * 15) + 3;
  const avgScore = Math.floor(Math.random() * 20) + 75;
  const nextLevelXP = (userLevel + 1) * 200;
  const currentLevelProgress = (totalXP % 200) / 200 * 100;

  return (
    <Card $glass style={{ 
      marginBottom: 'var(--spacing-2xl)',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%), var(--glass-background)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <CardContent>
        {/* Personal Progress Overview */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h3 style={{ 
            margin: '0 0 var(--spacing-sm) 0', 
            fontSize: '1.25rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Your Professional Journey
          </h3>
          <p style={{ 
            color: 'var(--color-text-secondary)', 
            margin: 0,
            fontSize: '0.9rem'
          }}>
            Level {userLevel} Professional • {totalXP.toLocaleString()} Total XP
          </p>
          
          {/* Progress Bar */}
          <div style={{ 
            marginTop: 'var(--spacing-md)',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            height: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${currentLevelProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.8s ease'
            }} />
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--color-text-muted)', 
            marginTop: 'var(--spacing-xs)' 
          }}>
            {Math.floor(200 - (totalXP % 200))} XP to Level {userLevel + 1}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <Grid $columns={4} $gap="var(--spacing-lg)">
          <Card $padding="md" style={{ 
            textAlign: 'center',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-light)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px',
              margin: '0 auto var(--spacing-sm)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-medium)'
            }}>
              <Trophy size={24} style={{ color: '#f59e0b' }} />
            </div>
            <StatNumber style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {userLevel}
            </StatNumber>
            <StatLabel>Professional Level</StatLabel>
          </Card>

          <Card $padding="md" style={{ 
            textAlign: 'center',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-light)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px',
              margin: '0 auto var(--spacing-sm)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-medium)'
            }}>
              <CheckCircle size={24} style={{ color: '#10b981' }} />
            </div>
            <StatNumber style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {completed}
            </StatNumber>
            <StatLabel>Assessments Completed</StatLabel>
          </Card>

          <Card $padding="md" style={{ 
            textAlign: 'center',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-light)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px',
              margin: '0 auto var(--spacing-sm)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-medium)'
            }}>
              <TrendingUp size={24} style={{ color: '#8b5cf6' }} />
            </div>
            <StatNumber style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {avgScore}%
            </StatNumber>
            <StatLabel>Average Score</StatLabel>
          </Card>

          <Card $padding="md" style={{ 
            textAlign: 'center',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-light)'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px',
              margin: '0 auto var(--spacing-sm)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-medium)'
            }}>
              <Star size={24} style={{ color: '#3b82f6' }} />
            </div>
            <StatNumber style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              #{Math.floor(Math.random() * 100) + 50}
            </StatNumber>
            <StatLabel>Global Ranking</StatLabel>
          </Card>
        </Grid>
      </CardContent>
    </Card>
  );
};

// ==============================================
// DASHBOARD CONTENT COMPONENT
// ==============================================

const DashboardContent = () => {
  const { user } = useAuth();
  const [mainView, setMainView] = useState<ViewMode>('assessments');
  const [assessmentCategory, setAssessmentCategory] = useState<AssessmentCategory>('professional');
  const [psychCategory, setPsychCategory] = useState<'personality' | 'clinical' | 'wellbeing'>('personality');
  
  const {
    loading,
    platformStats,
    leaderboard,
    handleAssessmentClick,
    handleStartAssessment,
    requestedAssessment,
    fromPublic
  } = useThrive();

  // Use mock data for assessments
  const professionalAssessments = PROFESSIONAL_ASSESSMENTS;
  const psychologicalAssessments = PSYCHOLOGICAL_ASSESSMENTS;
  const creativityAssessments = CREATIVITY_ASSESSMENTS;

  // Platform Stats Component - Enhanced
  const PlatformStatsOverview = () => (
    <Section style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-md)' }}>
          <Globe size={24} color="var(--color-primary-500)" />
          <Heading2 style={{ margin: 0, fontSize: '1.5rem' }}>Global Platform Insights</Heading2>
          <ProgressIndicator>
            <span className="pulse" />
            LIVE
          </ProgressIndicator>
        </FlexRow>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          margin: 0,
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Join thousands of professionals advancing their careers through verified assessments
        </p>
      </div>

      <Grid $columns={4} $gap="var(--spacing-xl)">
        <Card style={{ 
          textAlign: 'center',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-light)'
        }}>
          <CardContent>
            <div style={{ 
              width: '56px', 
              height: '56px',
              margin: '0 auto var(--spacing-md)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <Shield size={28} style={{ color: '#10b981' }} />
            </div>
            <StatNumber style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
              {formatNumber(platformStats.verifiedProfessionals || 45230)}
            </StatNumber>
            <StatLabel style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Professionals Certified
            </StatLabel>
          </CardContent>
        </Card>

        <Card style={{ 
          textAlign: 'center',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-light)'
        }}>
          <CardContent>
            <div style={{ 
              width: '56px', 
              height: '56px',
              margin: '0 auto var(--spacing-md)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <Activity size={28} style={{ color: '#3b82f6' }} />
            </div>
            <ProgressIndicator style={{ justifyContent: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <span className="pulse" />
              LIVE
            </ProgressIndicator>
            <StatNumber style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
              {platformStats.activeThisWeek || 1247}
            </StatNumber>
            <StatLabel style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Active This Week
            </StatLabel>
          </CardContent>
        </Card>

        <Card style={{ 
          textAlign: 'center',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-light)'
        }}>
          <CardContent>
            <div style={{ 
              width: '56px', 
              height: '56px',
              margin: '0 auto var(--spacing-md)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              <Timer size={28} style={{ color: '#f59e0b' }} />
            </div>
            <StatNumber style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
              {platformStats.completionsToday || 89}
            </StatNumber>
            <StatLabel style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Completed Today
            </StatLabel>
          </CardContent>
        </Card>

        <Card style={{ 
          textAlign: 'center',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-light)'
        }}>
          <CardContent>
            <div style={{ 
              width: '56px', 
              height: '56px',
              margin: '0 auto var(--spacing-md)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <TrendingUp size={28} style={{ color: '#8b5cf6' }} />
            </div>
            <StatNumber style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--spacing-xs)' }}>
              {platformStats.averageScore || 84}%
            </StatNumber>
            <StatLabel style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Platform Average
            </StatLabel>
          </CardContent>
        </Card>
      </Grid>
    </Section>
  );

  // Assessment rendering functions - Enhanced
  const renderProfessionalAssessments = () => (
    <AssessmentGrid>
      {professionalAssessments.map((assessment, index) => {
        const IconComponent = assessment.icon || Target;
        const isRecommended = index < 2; // First two are "recommended for you"
        
        return (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor={assessment.color}
            onClick={() => handleAssessmentClick(assessment.id)}
            style={{
              background: isRecommended 
                ? `linear-gradient(135deg, ${assessment.color}08 0%, ${assessment.color}03 100%), var(--glass-background)`
                : 'var(--glass-background)',
              border: isRecommended 
                ? `2px solid ${assessment.color}40`
                : `1px solid ${assessment.color}20`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              cursor: 'pointer'
            }}
          >
            {/* Recommended Badge */}
            {isRecommended && (
              <div style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Star size={12} style={{ marginRight: '4px' }} />
                Recommended
              </div>
            )}

            {/* Enhanced Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto var(--spacing-lg)',
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${assessment.color}`,
              transition: 'transform 0.3s ease'
            }}>
              <IconComponent size={28} style={{ color: assessment.color }} />
            </div>

            <AssessmentTitle style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 'var(--spacing-md)'
            }}>
              {assessment.title}
            </AssessmentTitle>
            
            <AssessmentDescription style={{ 
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: 'var(--spacing-lg)'
            }}>
              {assessment.description}
            </AssessmentDescription>

            {/* Enhanced Meta Information */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <DifficultyBadge $difficulty="intermediate" style={{
                  background: `${assessment.color}20`,
                  color: assessment.color,
                  border: `1px solid ${assessment.color}40`,
                  fontWeight: 600
                }}>
                  Professional Level
                </DifficultyBadge>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontWeight: 600
                }}>
                  <Timer size={14} />
                  45-60 min
                </span>
              </FlexRow>

              <FlexRow $justify="space-between">
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <Users size={14} />
                  {(Math.floor(Math.random() * 5000) + 1000).toLocaleString()} certified
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#059669',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <TrendingUp size={14} />
                  {Math.floor(Math.random() * 15) + 80}% avg
                </span>
              </FlexRow>
            </div>

            {/* Enhanced Action Area */}
            <div style={{ 
              background: `linear-gradient(135deg, ${assessment.color}10, ${assessment.color}05)`,
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              border: `1px solid ${assessment.color}20`
            }}>
              <FlexRow $gap="var(--spacing-md)">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: `linear-gradient(135deg, ${assessment.color}, ${assessment.color}dd)`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 16px ${assessment.color}30`
                }}>
                  <CheckCircle size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                    Ready to Start
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {isRecommended ? 'Personalized for you' : 'Authenticated access'}
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={20} style={{ color: assessment.color }} />
            </div>
          </AssessmentCardWrapper>
        );
      })}
    </AssessmentGrid>
  );

  const renderPsychologicalAssessments = () => (
    <>
      <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ 
        marginBottom: 'var(--spacing-xl)' 
      }}>
        <BaseButton
          $variant={psychCategory === 'personality' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('personality')}
        >
          Personality
        </BaseButton>
        <BaseButton
          $variant={psychCategory === 'clinical' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('clinical')}
        >
          Clinical Screening
        </BaseButton>
        <BaseButton
          $variant={psychCategory === 'wellbeing' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('wellbeing')}
        >
          Wellbeing
        </BaseButton>
      </FlexRow>
      
      <AssessmentGrid>
        {psychologicalAssessments[psychCategory]?.map((assessment) => (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor="#8b5cf6"
            onClick={() => handleAssessmentClick(assessment.id)}
          >
            {assessment.validated && (
              <Badge $variant="success" style={{ 
                position: 'absolute', 
                top: 'var(--spacing-md)', 
                right: 'var(--spacing-md)',
                zIndex: 2
              }}>
                <Shield size={12} />
                Validated
              </Badge>
            )}

            <SkillIcon $type="psychology">
              <Brain size={24} />
            </SkillIcon>

            <AssessmentTitle>{assessment.title}</AssessmentTitle>
            <AssessmentDescription>{assessment.description}</AssessmentDescription>
            
            <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <span style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <AlertCircle size={14} />
                {assessment.items} items
              </span>
              <span style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <Timer size={14} />
                {assessment.duration}
              </span>
            </FlexRow>

            <div style={{ 
              background: 'linear-gradient(135deg, #8b5cf620, #8b5cf610)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <FlexRow $gap="var(--spacing-sm)">
                <Shield size={16} style={{ color: '#8b5cf6' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Scientific Assessment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Research validated
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={16} />
            </div>
          </AssessmentCardWrapper>
        ))}
      </AssessmentGrid>
    </>
  );

  const renderCreativityAssessments = () => (
    <AssessmentGrid>
      {creativityAssessments.map((assessment) => {
        const IconComponent = assessment.icon || Lightbulb;
        return (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor={assessment.color}
            onClick={() => handleAssessmentClick(assessment.id)}
          >
            <SkillIcon $type="creativity">
              <IconComponent size={24} />
            </SkillIcon>

            <AssessmentTitle>{assessment.title}</AssessmentTitle>
            <AssessmentDescription>{assessment.description}</AssessmentDescription>
            
            <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <span style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <AlertCircle size={14} />
                {assessment.items} items
              </span>
              <span style={{ 
                fontSize: '0.875rem', 
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <Timer size={14} />
                {assessment.duration}
              </span>
            </FlexRow>

            <div style={{ 
              background: `linear-gradient(135deg, ${assessment.color}20, ${assessment.color}10)`,
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <FlexRow $gap="var(--spacing-sm)">
                <Sparkles size={16} style={{ color: assessment.color }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Creative Challenge</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Unlock your potential
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={16} />
            </div>
          </AssessmentCardWrapper>
        );
      })}
    </AssessmentGrid>
  );

  return (
    <PageWrapper>
      {/* Enhanced Hero Section */}
      <EnhancedHeroSection style={{
        background: `
          linear-gradient(135deg, 
            var(--color-background-primary) 0%, 
            rgba(139, 92, 246, 0.03) 25%,
            rgba(59, 130, 246, 0.02) 50%,
            var(--color-background-primary) 75%,
            var(--color-background-tertiary) 100%
          )
        `,
        borderBottom: '1px solid var(--color-border-light)'
      }}>
        <ContentWrapper>
          <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            {/* Personalized Time-based Greeting */}
            <FlexRow $justify="center" $gap="var(--spacing-md)" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <Badge style={{ 
                background: 'var(--color-background-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-medium)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                <Sparkles size={16} />
                {getGreeting()}, {user?.name || 'Professional'}
              </Badge>
              <Badge style={{ 
                background: 'var(--color-background-secondary)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                fontSize: '0.9rem'
              }}>
                <Award size={12} />
                Verified Member
              </Badge>
            </FlexRow>

            <Heading1 $responsive style={{ marginBottom: 'var(--spacing-md)' }}>
              Your Professional
              <span style={{ 
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}> Certification Hub</span>
            </Heading1>

            {/* Personalized subtitle based on progress */}
            <BodyText $size="xl" style={{ 
              marginBottom: 'var(--spacing-2xl)',
              maxWidth: '700px',
              margin: '0 auto var(--spacing-2xl)'
            }}>
              Continue building your professional portfolio with industry-recognized assessments. 
              You're on track to achieve <strong>Expert Level</strong> certification.
            </BodyText>

            {/* Enhanced User Stats */}
            <PersonalizedUserStats user={user} />

            {/* Primary Navigation */}
            <PrimaryNavigation activeView={mainView} onViewChange={setMainView} />
          </div>
        </ContentWrapper>
      </EnhancedHeroSection>

      <ContentWrapper>
        {/* Welcome Banner for new users */}
        {(fromPublic || requestedAssessment) && mainView === 'assessments' && (
          <GlassSection style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <FlexRow $gap="var(--spacing-md)" $align="center">
              <CheckCircle size={32} color="#10b981" />
              <div style={{ flex: 1 }}>
                <Heading2 style={{ margin: '0 0 var(--spacing-sm) 0' }}>
                  Account Created Successfully!
                </Heading2>
                <BodyText style={{ margin: 0 }}>
                  {requestedAssessment
                    ? `Ready to start your "${requestedAssessment}" assessment?`
                    : 'You now have full access to all professional assessments and analytics.'}
                </BodyText>
              </div>
              {requestedAssessment && (
                <BaseButton 
                  $variant="primary" 
                  onClick={() => {
                    const assessment = professionalAssessments.find(
                      a => a.title === requestedAssessment
                    );
                    if (assessment) handleStartAssessment(assessment.id);
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Timer size={16} />}
                  Start Assessment
                </BaseButton>
              )}
            </FlexRow>
          </GlassSection>
        )}

        {/* Platform Stats */}
        {mainView === 'assessments' && <PlatformStatsOverview />}

        {/* Main Content Area */}
        <Section>
          {mainView === 'assessments' && (
            <>
              <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <Target size={28} />
                <Heading2 style={{ margin: 0 }}>Choose Your Assessment Category</Heading2>
              </FlexRow>

              {/* Assessment Category Navigation */}
              <AssessmentCategoryTabs 
                activeCategory={assessmentCategory} 
                onCategoryChange={setAssessmentCategory} 
              />

              {/* Assessment Content */}
              {assessmentCategory === 'professional' && renderProfessionalAssessments()}
              {assessmentCategory === 'psychological' && renderPsychologicalAssessments()}
              {assessmentCategory === 'creativity' && renderCreativityAssessments()}
            </>
          )}
          
          {/* Other Dynamic Views */}
          <Suspense fallback={
            <LoadingContainer>
              <LoadingSpinner $size="lg" />
              <BodyText>Loading {mainView}...</BodyText>
            </LoadingContainer>
          }>
            {mainView === 'rankings' && <RankingsPage />}
            {mainView === 'analytics' && <AnalyticsPage />}
            {mainView === 'employer-tools' && <EmployerToolsPage />}
          </Suspense>
        </Section>

        {/* Enhanced Quick Actions Section for Dashboard */}
        {mainView === 'assessments' && (
          <Section>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-md)' }}>
                <Sparkles size={24} color="var(--color-primary-500)" />
                <Heading2 style={{ margin: 0 }}>Personalized Recommendations</Heading2>
              </FlexRow>
              <p style={{ 
                color: 'var(--color-text-secondary)', 
                margin: 0,
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Based on your progress and industry trends, here are your next steps
              </p>
            </div>

            <Grid $columns={3} $gap="var(--spacing-2xl)">
              <Card 
                $glass 
                $hover 
                style={{ 
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setMainView('analytics')}
              >
                <CardContent>
                  <FlexColumn $align="center" $gap="var(--spacing-lg)">
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      background: 'var(--color-background-tertiary)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(6, 182, 212, 0.3)'
                    }}>
                      <BarChart3 size={32} style={{ color: '#06b6d4' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '1.25rem', fontWeight: 700 }}>
                        Track Your Progress
                      </h3>
                      <BodyText style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                        View detailed analytics of your assessment performance and skill development over time
                      </BodyText>
                    </div>

                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderRadius: 'var(--radius-md)',
                      width: '100%',
                      textAlign: 'center',
                      border: '1px solid var(--color-border-light)'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Next milestone: 5 more assessments to Expert Level
                      </div>
                    </div>

                    <BaseButton 
                      $variant="secondary" 
                      $size="sm"
                    >
                      <BarChart3 size={16} />
                      View Analytics
                    </BaseButton>
                  </FlexColumn>
                </CardContent>
              </Card>

              <Card 
                $glass 
                $hover 
                style={{ 
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setMainView('rankings')}
              >
                <CardContent>
                  <FlexColumn $align="center" $gap="var(--spacing-lg)">
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      background: 'var(--color-background-tertiary)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                      <Trophy size={32} style={{ color: '#f59e0b' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '1.25rem', fontWeight: 700 }}>
                        Climb the Leaderboard
                      </h3>
                      <BodyText style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                        See how you rank against professionals worldwide and discover top performers in your field
                      </BodyText>
                    </div>

                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderRadius: 'var(--radius-md)',
                      width: '100%',
                      textAlign: 'center',
                      border: '1px solid var(--color-border-light)'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Current rank: #{Math.floor(Math.random() * 100) + 50} globally
                      </div>
                    </div>

                    <BaseButton 
                      $variant="secondary" 
                      $size="sm"
                    >
                      <Trophy size={16} />
                      View Rankings
                    </BaseButton>
                  </FlexColumn>
                </CardContent>
              </Card>

              <Card 
                $glass 
                $hover 
                style={{ 
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setMainView('employer-tools')}
              >
                <CardContent>
                  <FlexColumn $align="center" $gap="var(--spacing-lg)">
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      background: 'var(--color-background-tertiary)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <Shield size={32} style={{ color: '#8b5cf6' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '1.25rem', fontWeight: 700 }}>
                        Share Your Credentials
                      </h3>
                      <BodyText style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
                        Generate verified certificates and share your professional achievements with employers
                      </BodyText>
                    </div>

                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderRadius: 'var(--radius-md)',
                      width: '100%',
                      textAlign: 'center',
                      border: '1px solid var(--color-border-light)'
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Ready to share: {Math.floor(Math.random() * 8) + 3} verified certificates
                      </div>
                    </div>

                    <BaseButton 
                      $variant="secondary" 
                      $size="sm"
                    >
                      <Eye size={16} />
                      Employer Tools
                    </BaseButton>
                  </FlexColumn>
                </CardContent>
              </Card>
            </Grid>
          </Section>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

// ==============================================
// MAIN EXPORT WITH PROVIDER
// ==============================================

export default function ThriveShell() {
  return (
    <ThriveProvider isAuthenticated={true}>
      <DashboardContent />
    </ThriveProvider>
  );
}