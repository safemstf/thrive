// src/app/thrive/page.tsx - Enhanced with Professional Design Vision
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, Users, Trophy, Star, CheckCircle,
  ArrowRight, Shield, Globe, Loader2, Activity, Award,
  Lock, Sparkles, Timer, Brain, AlertCircle, Lightbulb,
  Heart, Zap, Palette, PenTool, BookOpen, Puzzle
} from 'lucide-react';

// Import mock data
import { 
  PROFESSIONAL_ASSESSMENTS, 
  PSYCHOLOGICAL_ASSESSMENTS, 
  CREATIVITY_ASSESSMENTS 
} from '@/data/mockData';

// Import shared components and logic
import { 
  ThriveProvider, 
  useThrive, 
  formatNumber,
  formatDuration
} from '@/components/thrive/thriveLogic';

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
  CTASection,
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
  LoadingContainer
} from '@/styles/styled-components';

// ==============================================
// ANIMATED COUNTER COMPONENT
// ==============================================

const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const timer = setInterval(() => {
      start += Math.ceil(end / (duration / 50));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// ==============================================
// ASSESSMENT CATEGORY NAVIGATION
// ==============================================

type AssessmentCategoryType = 'professional' | 'psychological' | 'creativity';

const AssessmentCategoryTabs = ({ activeCategory, onCategoryChange }: {
  activeCategory: AssessmentCategoryType;
  onCategoryChange: (category: AssessmentCategoryType) => void;
}) => (
  <FlexRow $justify="center" $gap="var(--spacing-md)" style={{ 
    marginBottom: 'var(--spacing-2xl)',
    flexWrap: 'wrap'
  }}>
    <BaseButton
      $variant={activeCategory === 'professional' ? 'primary' : 'secondary'}
      onClick={() => onCategoryChange('professional')}
    >
      <Target size={18} />
      Professional Skills
    </BaseButton>
    <BaseButton
      $variant={activeCategory === 'psychological' ? 'primary' : 'secondary'}
      onClick={() => onCategoryChange('psychological')}
    >
      <Brain size={18} />
      Psychological Assessments
    </BaseButton>
    <BaseButton
      $variant={activeCategory === 'creativity' ? 'primary' : 'secondary'}
      onClick={() => onCategoryChange('creativity')}
    >
      <Lightbulb size={18} />
      Creativity & Critical Thinking
    </BaseButton>
  </FlexRow>
);

// ==============================================
// PUBLIC CONTENT COMPONENT
// ==============================================

const PublicContent = () => {
  const [loading, setLoading] = useState(true);
  const [assessmentCategory, setAssessmentCategory] = useState<'professional' | 'psychological' | 'creativity'>('professional');
  const [psychCategory, setPsychCategory] = useState<'personality' | 'clinical' | 'wellbeing'>('personality');

  const {
    leaderboard,
    platformStats,
    handleAssessmentClick,
    handleCreateAccount,
    handleSignIn
  } = useThrive();

  // Use mock data for assessments
  const professionalAssessments = PROFESSIONAL_ASSESSMENTS;
  const psychologicalAssessments = PSYCHOLOGICAL_ASSESSMENTS;
  const creativityAssessments = CREATIVITY_ASSESSMENTS;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageWrapper>
        <ContentContainer>
          <LoadingContainer>
            <Loader2 size={48} className="animate-spin" />
            <BodyText>Loading professional assessments...</BodyText>
          </LoadingContainer>
        </ContentContainer>
      </PageWrapper>
    );
  }

  // Render functions for different assessment types
  const renderProfessionalAssessments = () => (
    <AssessmentGrid>
      {professionalAssessments.map((assessment, index) => {
        const IconComponent = assessment.icon || Target;
        const isPopular = index < 3; // First three are "most popular"
        
        return (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor={assessment.color}
            onClick={() => handleAssessmentClick(assessment.id)}
            style={{
              background: isPopular 
                ? 'var(--color-background-secondary)'
                : 'var(--color-background-secondary)',
              border: isPopular 
                ? `2px solid ${assessment.color}`
                : `1px solid var(--color-border-light)`,
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            {/* Popular Badge */}
            {isPopular && (
              <div style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                background: 'var(--color-background-secondary)',
                color: assessment.color,
                border: `1px solid ${assessment.color}`,
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 600,
                zIndex: 2
              }}>
                <Star size={12} style={{ marginRight: '4px' }} />
                Popular
              </div>
            )}

            {/* Professional Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto var(--spacing-lg)',
              background: `radial-gradient(circle, ${assessment.color}20 0%, ${assessment.color}10 70%, transparent 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'transform 0.4s ease'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${assessment.color}40`
              }}>
                <IconComponent size={28} style={{ color: assessment.color }} />
              </div>
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
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                <div style={{
                  background: `linear-gradient(135deg, ${assessment.color}20, ${assessment.color}10)`,
                  color: assessment.color,
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${assessment.color}30`
                }}>
                  Professional Level
                </div>
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

            {/* Elegant Action Area */}
            <div style={{ 
              background: `linear-gradient(135deg, ${assessment.color}08, ${assessment.color}04)`,
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              border: `1px solid ${assessment.color}20`
            }}>
              <FlexRow $gap="var(--spacing-md)">
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${assessment.color}40`
                }}>
                  <Lock size={20} style={{ color: assessment.color }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                    Start Assessment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {isPopular ? 'Most popular choice' : 'Sign up required'}
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
      <BodyText style={{ 
        textAlign: 'center', 
        marginBottom: 'var(--spacing-lg)',
        maxWidth: '600px',
        margin: '0 auto var(--spacing-lg)'
      }}>
        Explore scientifically validated psychological assessments to understand your personality, 
        mental health, and wellbeing patterns.
      </BodyText>

      <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ 
        marginBottom: 'var(--spacing-xl)',
        flexWrap: 'wrap'
      }}>
        <BaseButton
          $variant={psychCategory === 'personality' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('personality')}
        >
          <Heart size={16} />
          Personality
        </BaseButton>
        <BaseButton
          $variant={psychCategory === 'clinical' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('clinical')}
        >
          <Shield size={16} />
          Clinical Screening
        </BaseButton>
        <BaseButton
          $variant={psychCategory === 'wellbeing' ? 'primary' : 'ghost'}
          $size="sm"
          onClick={() => setPsychCategory('wellbeing')}
        >
          <Star size={16} />
          Wellbeing
        </BaseButton>
      </FlexRow>
      
      <AssessmentGrid>
        {psychologicalAssessments[psychCategory]?.map((assessment) => (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor="#8b5cf6"
            onClick={() => handleAssessmentClick(assessment.id)}
            style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-light)',
              transition: 'all 0.3s ease'
            }}
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

            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto var(--spacing-lg)',
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #8b5cf6'
            }}>
              <Brain size={28} style={{ color: '#8b5cf6' }} />
            </div>

            <AssessmentTitle style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {assessment.title}
            </AssessmentTitle>
            <AssessmentDescription style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              {assessment.description}
            </AssessmentDescription>
            
            <div style={{ 
              background: 'var(--color-background-tertiary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
              border: '1px solid var(--color-border-light)'
            }}>
              <FlexRow $justify="space-between">
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
            </div>

            <div style={{ 
              background: 'var(--color-background-tertiary)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--color-border-light)'
            }}>
              <FlexRow $gap="var(--spacing-md)">
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'var(--color-background-secondary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #8b5cf6'
                }}>
                  <Lock size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                    Scientific Assessment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Research validated • Sign up required
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={20} style={{ color: '#8b5cf6' }} />
            </div>
          </AssessmentCardWrapper>
        ))}
      </AssessmentGrid>
    </>
  );

  const renderCreativityAssessments = () => (
    <>
      <BodyText style={{ 
        textAlign: 'center', 
        marginBottom: 'var(--spacing-xl)',
        maxWidth: '600px',
        margin: '0 auto var(--spacing-xl)'
      }}>
        Unlock your creative potential and critical thinking skills with assessments designed 
        to measure innovation, problem-solving, and analytical abilities.
      </BodyText>

      <AssessmentGrid>
        {creativityAssessments.map((assessment) => {
          const IconComponent = assessment.icon || Lightbulb;
          return (
            <AssessmentCardWrapper
              key={assessment.id}
              $borderColor={assessment.color}
              onClick={() => handleAssessmentClick(assessment.id)}
              style={{
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-light)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto var(--spacing-lg)',
                background: 'var(--color-background-tertiary)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${assessment.color}`
              }}>
                <IconComponent size={28} style={{ color: assessment.color }} />
              </div>

              <AssessmentTitle style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {assessment.title}
              </AssessmentTitle>
              <AssessmentDescription style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                {assessment.description}
              </AssessmentDescription>
              
              <div style={{ 
                background: 'var(--color-background-tertiary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                border: '1px solid var(--color-border-light)'
              }}>
                <FlexRow $justify="space-between">
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
              </div>

              <div style={{ 
                background: 'var(--color-background-tertiary)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--color-border-light)'
              }}>
                <FlexRow $gap="var(--spacing-md)">
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'var(--color-background-secondary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${assessment.color}`
                  }}>
                    <Lock size={20} style={{ color: assessment.color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                      Creative Challenge
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Unlock potential • Sign up required
                    </div>
                  </div>
                </FlexRow>
                <ArrowRight size={20} style={{ color: assessment.color }} />
              </div>
            </AssessmentCardWrapper>
          );
        })}
      </AssessmentGrid>
    </>
  );

  return (
    <PageWrapper>
      {/* Hero Section */}
      <EnhancedHeroSection style={{
        background: `
          radial-gradient(ellipse at top, rgba(139, 92, 246, 0.08) 0%, transparent 70%),
          radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.06) 0%, transparent 70%),
          radial-gradient(ellipse at bottom right, rgba(16, 185, 129, 0.04) 0%, transparent 70%),
          linear-gradient(135deg, var(--color-background-primary) 0%, var(--color-background-tertiary) 100%)
        `,
        borderBottom: '1px solid var(--color-border-light)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle floating elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 15s ease-in-out infinite reverse',
          zIndex: 0
        }} />
        
        <ContentWrapper style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <Badge style={{ 
              marginBottom: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'var(--color-text-primary)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <Sparkles size={16} />
              Trusted by 500+ Companies
              <Shield size={12} style={{ marginLeft: 'var(--spacing-xs)' }} />
            </Badge>

            <Heading1 $responsive>
              Prove Your Professional Skills with 
              <span style={{ 
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}> Industry-Recognized</span> Assessments
            </Heading1>

            <BodyText $size="xl" style={{ 
              marginBottom: 'var(--spacing-2xl)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-2xl)'
            }}>
              Join thousands of professionals who have validated their capabilities through our 
              comprehensive assessment platform covering skills, psychology, and creativity.
            </BodyText>

            {/* Elegant Stats */}
            <Grid $columns={3} $gap="var(--spacing-xl)" style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <Card style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent>
                  <div style={{ 
                    width: '56px', 
                    height: '56px',
                    margin: '0 auto var(--spacing-md)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Shield size={28} style={{ color: '#10b981' }} />
                  </div>
                  <StatNumber style={{ fontSize: '2rem', fontWeight: 800 }}>
                    <AnimatedCounter value={45230} />
                  </StatNumber>
                  <StatLabel style={{ fontWeight: 600 }}>Professionals Certified</StatLabel>
                </CardContent>
              </Card>

              <Card style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent>
                  <div style={{ 
                    width: '56px', 
                    height: '56px',
                    margin: '0 auto var(--spacing-md)',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Activity size={28} style={{ color: '#3b82f6' }} />
                  </div>
                  <ProgressIndicator style={{ justifyContent: 'center', marginBottom: 'var(--spacing-sm)' }}>
                    <span className="pulse" />
                    LIVE
                  </ProgressIndicator>
                  <StatNumber style={{ fontSize: '2rem', fontWeight: 800 }}>
                    <AnimatedCounter value={342} duration={1500} />
                  </StatNumber>
                  <StatLabel style={{ fontWeight: 600 }}>Taking Assessments Now</StatLabel>
                </CardContent>
              </Card>

              <Card style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <CardContent>
                  <div style={{ 
                    width: '56px', 
                    height: '56px',
                    margin: '0 auto var(--spacing-md)',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={28} style={{ color: '#8b5cf6' }} />
                  </div>
                  <StatNumber style={{ fontSize: '2rem', fontWeight: 800 }}>
                    <AnimatedCounter value={94} />%
                  </StatNumber>
                  <StatLabel style={{ fontWeight: 600 }}>Employer Trust Rate</StatLabel>
                </CardContent>
              </Card>
            </Grid>

            <FlexRow $justify="center" $gap="var(--spacing-md)" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <BaseButton $variant="primary" onClick={handleCreateAccount}>
                <Target size={18} />
                Start Assessment
              </BaseButton>
              <BaseButton $variant="secondary" onClick={handleSignIn}>
                Sign In
              </BaseButton>
            </FlexRow>

            <FlexRow $justify="center" $gap="var(--spacing-lg)" style={{ fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <CheckCircle size={16} color="#10b981" />
                Free to start
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <CheckCircle size={16} color="#10b981" />
                Instant results
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <CheckCircle size={16} color="#10b981" />
                Industry recognized
              </span>
            </FlexRow>
          </div>
        </ContentWrapper>
      </EnhancedHeroSection>

      <ContentWrapper>
        {/* Assessments Section */}
        <Section>
          <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Target size={28} />
            <Heading2 style={{ margin: 0 }}>Choose Your Assessment Category</Heading2>
          </FlexRow>
          
          <BodyText style={{ 
            textAlign: 'center', 
            marginBottom: 'var(--spacing-2xl)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-2xl)'
          }}>
            Explore our comprehensive suite of assessments designed to validate your professional skills, 
            understand your psychological profile, and unlock your creative potential.
          </BodyText>

          {/* Category Navigation */}
          <AssessmentCategoryTabs 
            activeCategory={assessmentCategory} 
            onCategoryChange={setAssessmentCategory} 
          />

          {/* Assessment Content */}
          {assessmentCategory === 'professional' && renderProfessionalAssessments()}
          {assessmentCategory === 'psychological' && renderPsychologicalAssessments()}
          {assessmentCategory === 'creativity' && renderCreativityAssessments()}
        </Section>

        {/* Assessment Categories Overview */}
        <Section>
          <Heading2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
            Three Pillars of Professional Assessment
          </Heading2>
          
          <Grid $columns={3} $gap="var(--spacing-xl)">
            <Card $hover onClick={() => setAssessmentCategory('professional')} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <Target size={28} style={{ color: '#3b82f6' }} />
                  </div>
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Professional Skills</h3>
                <BodyText style={{ marginBottom: 'var(--spacing-md)' }}>
                  Industry-validated assessments for communication, leadership, technical problem-solving, 
                  and emotional intelligence.
                </BodyText>
                <FlexRow $gap="var(--spacing-xs)" style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span>Employer Recognized</span>
                </FlexRow>
              </CardContent>
            </Card>

            <Card $hover onClick={() => setAssessmentCategory('psychological')} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 70%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>
                    <Brain size={28} style={{ color: '#8b5cf6' }} />
                  </div>
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Psychological Profile</h3>
                <BodyText style={{ marginBottom: 'var(--spacing-md)' }}>
                  Research-validated assessments covering personality traits, clinical screening, 
                  and wellbeing indicators.
                </BodyText>
                <FlexRow $gap="var(--spacing-xs)" style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  <Shield size={14} color="#8b5cf6" />
                  <span>Scientifically Validated</span>
                </FlexRow>
              </CardContent>
            </Card>

            <Card $hover onClick={() => setAssessmentCategory('creativity')} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    <Lightbulb size={28} style={{ color: '#f59e0b' }} />
                  </div>
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Creativity & Critical Thinking</h3>
                <BodyText style={{ marginBottom: 'var(--spacing-md)' }}>
                  Innovative assessments measuring divergent thinking, creative problem-solving, 
                  and analytical reasoning.
                </BodyText>
                <FlexRow $gap="var(--spacing-xs)" style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Innovation Focused</span>
                </FlexRow>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* Leaderboard Section */}
        <Section>
          <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Trophy size={28} />
            <Heading2 style={{ margin: 0 }}>Global Professional Leaderboard</Heading2>
            <ProgressIndicator style={{ marginLeft: 'var(--spacing-sm)' }}>
              <span className="pulse" />
            </ProgressIndicator>
          </FlexRow>

          <Grid $columns={2} $gap="var(--spacing-xl)">
            <div>
              <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)', 
                  margin: 0 
                }}>
                  <Star size={20} color="#f59e0b" />
                  Top Performers
                </h3>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <Globe size={14} />
                  Live rankings
                </span>
              </FlexRow>

              <LeaderboardCard $padding="sm">
                {leaderboard.map((player) => (
                  <LeaderboardItem key={player.rank} $rank={player.rank}>
                    <RankBadge $rank={player.rank}>
                      {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : player.rank}
                    </RankBadge>
                    
                    <FlexColumn $gap="0" style={{ flex: 1 }}>
                      <FlexRow $gap="var(--spacing-sm)">
                        <span style={{ fontWeight: 600 }}>{player.name}</span>
                        {player.verified && (
                          <Badge $variant="success" style={{ fontSize: '0.75rem' }}>
                            <Shield size={10} />
                            Verified
                          </Badge>
                        )}
                        {player.rank <= 3 && (
                          <Badge style={{ 
                            background: '#f59e0b', 
                            color: 'white',
                            fontSize: '0.7rem'
                          }}>
                            Top Performer
                          </Badge>
                        )}
                      </FlexRow>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--color-text-secondary)' 
                      }}>
                        {formatNumber(player.score)} points
                      </div>
                    </FlexColumn>
                    
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#059669', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}>
                      <TrendingUp size={14} />
                      +{Math.floor(Math.random() * 50) + 10}
                    </div>
                  </LeaderboardItem>
                ))}
              </LeaderboardCard>
            </div>

            <Card style={{ 
              background: 'var(--color-background-secondary)', 
              textAlign: 'center',
              border: '1px solid var(--color-border-light)'
            }}>
              <CardContent>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)', 
                  marginBottom: 'var(--spacing-md)' 
                }}>
                  <Award size={24} color="#f59e0b" />
                  <Badge style={{ 
                    background: '#f59e0b', 
                    color: 'white',
                    border: 'none'
                  }}>
                    JOIN NOW
                  </Badge>
                </div>
                
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Your Name Could Be Here</h3>
                
                <p style={{ 
                  marginBottom: 'var(--spacing-lg)', 
                  color: 'var(--color-text-secondary)' 
                }}>
                  Complete assessments to earn points and climb the global leaderboard across all categories.
                </p>
                
                <div style={{ 
                  color: '#059669', 
                  fontWeight: 600, 
                  marginBottom: 'var(--spacing-lg)' 
                }}>
                  Next assessment: +{Math.floor(Math.random() * 500) + 100} points
                </div>
                
                <BaseButton $variant="primary" onClick={handleCreateAccount} $fullWidth>
                  Start Earning Points
                  <ArrowRight size={16} />
                </BaseButton>
                
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  justifyContent: 'center'
                }}>
                  <Users size={12} />
                  {Math.floor(Math.random() * 50) + 20} people joined this week
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* Features Section */}
        <Section>
          <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Shield size={28} />
            <Heading2 style={{ margin: 0 }}>Trusted by Industry Leaders</Heading2>
          </FlexRow>

          <Grid $columns={2} $gap="var(--spacing-lg)">
            <Card style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-light)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
                  border: '2px solid #3b82f6'
                }}>
                  <Activity size={24} style={{ color: '#3b82f6' }} />
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Real-time Analytics</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Get instant insights with AI-powered analysis and industry benchmarking across all assessment types.
                </p>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-light)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
                  border: '2px solid #10b981'
                }}>
                  <Shield size={24} style={{ color: '#10b981' }} />
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Verified Credentials</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Blockchain-verified certificates that employers can instantly verify for all completed assessments.
                </p>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-light)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
                  border: '2px solid #f59e0b'
                }}>
                  <TrendingUp size={24} style={{ color: '#f59e0b' }} />
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Market-Relevant</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Continuously updated assessments reflecting current industry demands and psychological research.
                </p>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-light)'
            }}>
              <CardContent>
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-background-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
                  border: '2px solid #8b5cf6'
                }}>
                  <Globe size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Global Recognition</h3>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                  Accepted by 500+ companies worldwide including Fortune 500 firms across multiple industries.
                </p>
              </CardContent>
            </Card>
          </Grid>
        </Section>

        {/* Final CTA */}
        <CTASection style={{
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <ContentWrapper>
            <Heading2>Ready to Prove Your Complete Professional Profile?</Heading2>
            <BodyText $size="lg" style={{ marginBottom: 'var(--spacing-xl)' }}>
              Join 45,000+ professionals who have advanced their careers with comprehensive 
              skill, psychological, and creativity certifications.
            </BodyText>

            <BaseButton 
              $variant="primary" 
              $size="lg"
              onClick={handleCreateAccount}
            >
              <Target size={20} />
              Start Your Journey
            </BaseButton>
          </ContentWrapper>
        </CTASection>
      </ContentWrapper>
    </PageWrapper>
  );
};

// ==============================================
// MAIN EXPORT WITH PROVIDER
// ==============================================

export default function ThrivePage() {
  return (
    <ThriveProvider isAuthenticated={false}>
      <PublicContent />
    </ThriveProvider>
  );
}