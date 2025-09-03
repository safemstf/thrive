// src/app/thrive/page.tsx 
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  Target, TrendingUp, Users, Trophy, Star, CheckCircle,
  ArrowRight, Shield, Globe, Loader2, Activity, Award,
  Lock, Sparkles, Timer, Brain, AlertCircle, Lightbulb,
  Heart
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
  formatNumber
} from '@/components/thrive/thriveLogic';

// Import ALL components from the styled-components hub
import {
  // Layout
  PageContainer,
  ContentWrapper,
  Section,
  Container,
  FlexRow,
  FlexColumn,
  Grid,

  // Typography
  Heading1,
  Heading2,
  BodyText,

  // Interactive
  BaseButton,
  Card,
  CardContent,
  Badge,

  // Utility
  LoadingContainer,
  LoadingSpinner,
  Spacer,
  Divider,

  // Animations
  animationUtils,

  // Theme utilities
  utils,
  media
} from '@/styles/styled-components';

// Import ONLY the thrive-specific styled components
import {
  EnhancedHeroSection,
  HeroBadge,
  HeroTitle,
  HeroSubtitle,
  GradientText,
  StatsOverview,
  StatCard,
  StatNumber,
  StatLabel,
  StatIcon,
  LiveIndicator,
  ProgressIndicator,
  AssessmentGrid,
  AssessmentCardWrapper,
  AssessmentIcon,
  AssessmentIconInner,
  AssessmentTitle,
  AssessmentDescription,
  AssessmentMeta,
  AssessmentAction,
  PopularBadge,
  ValidatedBadge,
  CategoryTabs,
  CategoryTab,
  LeaderboardCard,
  LeaderboardItem,
  RankBadge,
  CTASection,
  FeatureCard,
  FeatureIcon,
  MetricRow,
  MetricItem,
  PlayerInfo,
  PlayerName,
  PlayerScore,
  AnimatedCounter
} from '@/components/thrive/styles';

// ==============================================
// ANIMATED COUNTER COMPONENT
// ==============================================
const AnimatedCounterComponent: React.FC<{ value: number; duration?: number }> = ({
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

  return <AnimatedCounter>{count.toLocaleString()}</AnimatedCounter>;
};

// ==============================================
// ASSESSMENT CATEGORY NAVIGATION
// ==============================================
type AssessmentCategoryType = 'professional' | 'psychological' | 'creativity';

const AssessmentCategoryTabs = ({ activeCategory, onCategoryChange }: {
  activeCategory: AssessmentCategoryType;
  onCategoryChange: (category: AssessmentCategoryType) => void;
}) => (
  <CategoryTabs>
    <CategoryTab
      $isActive={activeCategory === 'professional'}
      onClick={() => onCategoryChange('professional')}
    >
      <Target size={18} />
      Professional Skills
    </CategoryTab>
    <CategoryTab
      $isActive={activeCategory === 'psychological'}
      onClick={() => onCategoryChange('psychological')}
    >
      <Brain size={18} />
      Psychological Assessments
    </CategoryTab>
    <CategoryTab
      $isActive={activeCategory === 'creativity'}
      onClick={() => onCategoryChange('creativity')}
    >
      <Lightbulb size={18} />
      Creativity & Critical Thinking
    </CategoryTab>
  </CategoryTabs>
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
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <LoadingSpinner $size="lg" />
            <BodyText>Loading professional assessments...</BodyText>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Render functions for different assessment types
  const renderProfessionalAssessments = () => (
    <AssessmentGrid>
      {professionalAssessments.map((assessment, index) => {
        const IconComponent = assessment.icon || Target;
        const isPopular = index < 3;

        return (
          <AssessmentCardWrapper
            key={assessment.id}
            $borderColor={assessment.color}
            onClick={() => handleAssessmentClick(assessment.id)}
            className="assessment-card"
          >
            {isPopular && (
              <PopularBadge $color={assessment.color}>
                <Star size={12} />
                Popular
              </PopularBadge>
            )}

            <AssessmentIcon $color={assessment.color}>
              <AssessmentIconInner $color={assessment.color}>
                <IconComponent size={28} />
              </AssessmentIconInner>
            </AssessmentIcon>

            <AssessmentTitle>{assessment.title}</AssessmentTitle>
            <AssessmentDescription>{assessment.description}</AssessmentDescription>

            <AssessmentMeta>
              <MetricRow>
                <Badge style={{
                  background: `linear-gradient(135deg, ${assessment.color}20, ${assessment.color}10)`,
                  color: assessment.color,
                  border: `1px solid ${assessment.color}30`,
                  fontSize: '0.75rem'
                }}>
                  Professional Level
                </Badge>
                <MetricItem>
                  <Timer size={14} />
                  45-60 min
                </MetricItem>
              </MetricRow>

              <MetricRow>
                <MetricItem>
                  <Users size={14} />
                  {(Math.floor(Math.random() * 5000) + 1000).toLocaleString()} certified
                </MetricItem>
                <MetricItem style={{ color: 'var(--color-success-600)', fontWeight: 600 }}>
                  <TrendingUp size={14} />
                  {Math.floor(Math.random() * 15) + 80}% avg
                </MetricItem>
              </MetricRow>
            </AssessmentMeta>

            <AssessmentAction $color={assessment.color}>
              <FlexRow $gap="var(--spacing-md)">
                <AssessmentIconInner $color={assessment.color} style={{ width: '48px', height: '48px' }}>
                  <Lock size={20} />
                </AssessmentIconInner>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', color: 'var(--color-text-primary)' }}>
                    Start Assessment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {isPopular ? 'Most popular choice' : 'Sign up required'}
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={20} style={{ color: assessment.color }} />
            </AssessmentAction>
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
          >
            {assessment.validated && (
              <ValidatedBadge>
                <Shield size={12} />
                Validated
              </ValidatedBadge>
            )}

            <AssessmentIcon $color="#8b5cf6">
              <AssessmentIconInner $color="#8b5cf6">
                <Brain size={28} />
              </AssessmentIconInner>
            </AssessmentIcon>

            <AssessmentTitle>{assessment.title}</AssessmentTitle>
            <AssessmentDescription>{assessment.description}</AssessmentDescription>

            <AssessmentMeta>
              <MetricRow>
                <MetricItem>
                  <AlertCircle size={14} />
                  {assessment.items} items
                </MetricItem>
                <MetricItem>
                  <Timer size={14} />
                  {assessment.duration}
                </MetricItem>
              </MetricRow>
            </AssessmentMeta>

            <AssessmentAction $color="#8b5cf6">
              <FlexRow $gap="var(--spacing-md)">
                <AssessmentIconInner $color="#8b5cf6" style={{ width: '48px', height: '48px' }}>
                  <Lock size={20} />
                </AssessmentIconInner>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', color: 'var(--color-text-primary)' }}>
                    Scientific Assessment
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Research validated • Sign up required
                  </div>
                </div>
              </FlexRow>
              <ArrowRight size={20} style={{ color: '#8b5cf6' }} />
            </AssessmentAction>
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
            >
              <AssessmentIcon $color={assessment.color}>
                <AssessmentIconInner $color={assessment.color}>
                  <IconComponent size={28} />
                </AssessmentIconInner>
              </AssessmentIcon>

              <AssessmentTitle>{assessment.title}</AssessmentTitle>
              <AssessmentDescription>{assessment.description}</AssessmentDescription>

              <AssessmentMeta>
                <MetricRow>
                  <MetricItem>
                    <AlertCircle size={14} />
                    {assessment.items} items
                  </MetricItem>
                  <MetricItem>
                    <Timer size={14} />
                    {assessment.duration}
                  </MetricItem>
                </MetricRow>
              </AssessmentMeta>

              <AssessmentAction $color={assessment.color}>
                <FlexRow $gap="var(--spacing-md)">
                  <AssessmentIconInner $color={assessment.color} style={{ width: '44px', height: '44px' }}>
                    <Lock size={20} />
                  </AssessmentIconInner>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px', color: 'var(--color-text-primary)' }}>
                      Creative Challenge
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Unlock potential • Sign up required
                    </div>
                  </div>
                </FlexRow>
                <ArrowRight size={20} style={{ color: assessment.color }} />
              </AssessmentAction>
            </AssessmentCardWrapper>
          );
        })}
      </AssessmentGrid>
    </>
  );

  return (
    <PageContainer>
      {/* HERO SECTION */}
      <EnhancedHeroSection>
        <ContentWrapper>
          <Container $maxWidth="800px" $padding={false}>
            <HeroBadge>
              <Sparkles size={16} />
              Trusted by 500+ Companies
              <Shield size={12} />
            </HeroBadge>

            <HeroTitle $responsive>
              Unlock Your Complete
              <GradientText> Professional Enneagram</GradientText> in Minutes
            </HeroTitle>

            <HeroSubtitle>
              The only platform that maps your complete professional identity—from core skills
              and psychological profile to creative potential. Trusted by Fortune 500 companies worldwide.
            </HeroSubtitle>

            {/* Elegant Stats */}
            <StatsOverview $columns={3} $gap="var(--spacing-xl)">
              <StatCard>
                <CardContent>
                  <StatIcon $color="var(--color-success-600)">
                    <Shield size={28} />
                  </StatIcon>
                  <StatNumber>
                    <AnimatedCounterComponent value={45230} />
                  </StatNumber>
                  <StatLabel>Professionals Certified</StatLabel>
                </CardContent>
              </StatCard>

              <StatCard>
                <CardContent>
                  <StatIcon $color="var(--color-primary-600)">
                    <Activity size={28} />
                  </StatIcon>
                  <ProgressIndicator style={{ justifyContent: 'center', marginBottom: 'var(--spacing-sm)' }}>
                    <span className="pulse" />
                    LIVE
                  </ProgressIndicator>
                  <StatNumber>
                    <AnimatedCounterComponent value={342} duration={1500} />
                  </StatNumber>
                  <StatLabel>Taking Assessments Now</StatLabel>
                </CardContent>
              </StatCard>

              <StatCard>
                <CardContent>
                  <StatIcon $color="#8b5cf6">
                    <TrendingUp size={28} />
                  </StatIcon>
                  <StatNumber>
                    <AnimatedCounterComponent value={94} />%
                  </StatNumber>
                  <StatLabel>Employer Trust Rate</StatLabel>
                </CardContent>
              </StatCard>
            </StatsOverview>

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
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle size={16} color="var(--color-success-600)" />
                Free to start
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle size={16} color="var(--color-success-600)" />
                Instant results
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                <CheckCircle size={16} color="var(--color-success-600)" />
                Industry recognized
              </span>
            </FlexRow>
          </Container>
        </ContentWrapper>
      </EnhancedHeroSection>

      {/* MAIN CONTENT */}
      <ContentWrapper>
        {/* Strategic Assessment Selection */}
        <Section>
          <Container $maxWidth="100%" $padding={false}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Target size={32} color="var(--color-primary-600)" />
                <Heading2 style={{ margin: 0 }}>Your Professional DNA Mapping</Heading2>
              </FlexRow>

              <BodyText style={{
                fontSize: 'var(--font-size-lg)',
                maxWidth: '700px',
                margin: '0 auto',
                color: 'var(--color-text-secondary)'
              }}>
                Don't guess at your potential. Get the complete picture with our three-pillar assessment system
                used by Google, Microsoft, and 500+ top companies.
              </BodyText>
            </div>

            {/* Category Navigation */}
            <AssessmentCategoryTabs
              activeCategory={assessmentCategory}
              onCategoryChange={setAssessmentCategory}
            />

            {/* Assessment Content */}
            {assessmentCategory === 'professional' && renderProfessionalAssessments()}
            {assessmentCategory === 'psychological' && renderPsychologicalAssessments()}
            {assessmentCategory === 'creativity' && renderCreativityAssessments()}
          </Container>
        </Section>

        {/* The Science Behind Your Success */}
        <Section>
          <Container $maxWidth="100%" $padding={false}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              <Heading2 style={{ marginBottom: 'var(--spacing-md)' }}>
                The Science Behind Your Success
              </Heading2>
              <BodyText style={{
                fontSize: 'var(--font-size-lg)',
                maxWidth: '650px',
                margin: '0 auto',
                color: 'var(--color-text-secondary)'
              }}>
                Why top companies use our three-dimensional assessment approach to identify and develop talent.
              </BodyText>
            </div>

            <Grid $columns={3} $gap="var(--spacing-xl)">
              <FeatureCard onClick={() => setAssessmentCategory('professional')}>
                <CardContent>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <FeatureIcon $color="var(--color-primary-600)">
                      <Target size={28} />
                    </FeatureIcon>
                    <Badge style={{
                      background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
                      color: 'white',
                      fontSize: '0.75rem',
                      border: 'none'
                    }}>
                      CORE PILLAR
                    </Badge>
                  </div>

                  <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                    Professional Excellence
                  </h3>
                  <BodyText style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.6' }}>
                    Six critical competencies that predict 89% of workplace success: communication mastery,
                    innovative problem-solving, and emotional intelligence.
                  </BodyText>

                  <div style={{
                    background: 'var(--color-primary-600)10',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-primary-600)30',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Employer Confidence</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>94%</span>
                    </FlexRow>
                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      height: '6px',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'var(--color-primary-600)',
                        height: '100%',
                        width: '94%',
                        borderRadius: '3px',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>

                  <FlexRow $gap="var(--spacing-xs)" style={{ fontSize: '0.875rem' }}>
                    <CheckCircle size={14} color="var(--color-success-600)" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Fortune 500 Validated</span>
                  </FlexRow>
                </CardContent>
              </FeatureCard>

              <FeatureCard onClick={() => setAssessmentCategory('psychological')}>
                <CardContent>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <FeatureIcon $color="#8b5cf6">
                      <Brain size={28} />
                    </FeatureIcon>
                    <Badge style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      fontSize: '0.75rem',
                      border: 'none'
                    }}>
                      RESEARCH BACKED
                    </Badge>
                  </div>

                  <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                    Psychological Intelligence
                  </h3>
                  <BodyText style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.6' }}>
                    Clinical-grade assessments including Big Five personality, wellbeing indicators,
                    and cognitive patterns used by leading researchers.
                  </BodyText>

                  <div style={{
                    background: '#8b5cf610',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #8b5cf630',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Scientific Validity</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#8b5cf6' }}>99.2%</span>
                    </FlexRow>
                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      height: '6px',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#8b5cf6',
                        height: '100%',
                        width: '99.2%',
                        borderRadius: '3px',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>

                  <FlexRow $gap="var(--spacing-xs)" style={{ fontSize: '0.875rem' }}>
                    <Shield size={14} color="#8b5cf6" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Peer-Reviewed Standards</span>
                  </FlexRow>
                </CardContent>
              </FeatureCard>

              <FeatureCard onClick={() => setAssessmentCategory('creativity')}>
                <CardContent>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <FeatureIcon $color="#f59e0b">
                      <Lightbulb size={28} />
                    </FeatureIcon>
                    <Badge style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      fontSize: '0.75rem',
                      border: 'none'
                    }}>
                      INNOVATION EDGE
                    </Badge>
                  </div>

                  <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                    Creative Potential
                  </h3>
                  <BodyText style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.6' }}>
                    Breakthrough assessments measuring divergent thinking, creative problem-solving,
                    and innovation capacity—the X-factor employers crave.
                  </BodyText>

                  <div style={{
                    background: '#f59e0b10',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #f59e0b30',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-xs)' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Innovation Predictor</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b' }}>87%</span>
                    </FlexRow>
                    <div style={{
                      background: 'var(--color-background-tertiary)',
                      height: '6px',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#f59e0b',
                        height: '100%',
                        width: '87%',
                        borderRadius: '3px',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>

                  <FlexRow $gap="var(--spacing-xs)" style={{ fontSize: '0.875rem' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>Future-Skills Focused</span>
                  </FlexRow>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Container>
        </Section>

        {/* Elite Performance Rankings */}
        <Section>
          <Container $maxWidth="100%" $padding={false}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
              <FlexRow $justify="center" $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-md)' }}>
                <Trophy size={32} color="#f59e0b" />
                <Heading2 style={{ margin: 0 }}>Elite Performance Rankings</Heading2>
                <LiveIndicator />
              </FlexRow>

              <BodyText style={{
                fontSize: 'var(--font-size-lg)',
                maxWidth: '600px',
                margin: '0 auto',
                color: 'var(--color-text-secondary)'
              }}>
                Where the world's top talent competes. Join the ranks of verified professionals
                climbing our global performance leaderboard.
              </BodyText>
            </div>

            <Grid $columns={2} $gap="var(--spacing-2xl)">
              <div>
                <div style={{
                  background: '#f59e0b15',
                  padding: 'var(--spacing-lg)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid #f59e0b30',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <FlexRow $justify="space-between" $align="center">
                    <div>
                      <h3 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        margin: '0 0 var(--spacing-xs) 0',
                        color: '#f59e0b'
                      }}>
                        <Star size={20} />
                        Global Champions
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Live rankings across all assessment categories
                      </p>
                    </div>
                    <div style={{
                      background: '#f59e0b20',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid #f59e0b30'
                    }}>
                      <FlexRow $gap="var(--spacing-xs)" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                        <Globe size={14} />
                        <span>Updated live</span>
                      </FlexRow>
                    </div>
                  </FlexRow>
                </div>

                <LeaderboardCard>
                  {leaderboard.map((player, index) => (
                    <LeaderboardItem key={player.rank} $rank={player.rank}>
                      <RankBadge $rank={player.rank}>
                        {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : player.rank}
                      </RankBadge>

                      <PlayerInfo $gap="0" style={{ flex: 1 }}>
                        <FlexRow $gap="var(--spacing-sm)" $align="center">
                          <PlayerName>{player.name}</PlayerName>
                          {player.verified && (
                            <Badge $variant="success" style={{ fontSize: '0.75rem' }}>
                              <Shield size={10} />
                              Verified
                            </Badge>
                          )}
                          {player.rank <= 3 && (
                            <Badge style={{
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: 'white',
                              fontSize: '0.7rem',
                              border: 'none'
                            }}>
                              Elite
                            </Badge>
                          )}
                        </FlexRow>
                        <FlexRow $gap="var(--spacing-md)" style={{ fontSize: '0.875rem' }}>
                          <PlayerScore>
                            {formatNumber(player.score)} points
                          </PlayerScore>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {['Professional', 'Psychological', 'Creative'][Math.floor(Math.random() * 3)]} Leader
                          </span>
                        </FlexRow>
                      </PlayerInfo>

                      <div style={{ textAlign: 'right' }}>
                        <MetricItem style={{ color: 'var(--color-success-600)', fontWeight: 600, marginBottom: '2px' }}>
                          <TrendingUp size={14} />
                          +{Math.floor(Math.random() * 50) + 10}
                        </MetricItem>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                          {Math.floor(Math.random() * 60) + 5}m ago
                        </div>
                      </div>
                    </LeaderboardItem>
                  ))}
                </LeaderboardCard>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <FeatureCard style={{
                  background: 'var(--color-primary-600)15',
                  border: '1px solid var(--color-primary-600)30'
                }}>
                  <CardContent style={{ textAlign: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--spacing-sm)',
                      marginBottom: 'var(--spacing-lg)'
                    }}>
                      <Award size={28} color="var(--color-primary-600)" />
                      <Badge style={{
                        background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
                        color: 'white',
                        border: 'none'
                      }}>
                        YOUR TURN
                      </Badge>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.4rem', color: 'var(--color-text-primary)' }}>
                      Claim Your Ranking
                    </h3>

                    <p style={{
                      marginBottom: 'var(--spacing-lg)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: '1.5'
                    }}>
                      Every assessment completed adds to your global ranking. Top performers get priority
                      access to exclusive opportunities and recognition.
                    </p>

                    <div style={{
                      background: 'var(--color-primary-600)10',
                      padding: 'var(--spacing-lg)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-primary-600)30',
                      marginBottom: 'var(--spacing-lg)'
                    }}>
                      <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Next Assessment Value:</span>
                        <span style={{ color: 'var(--color-success-600)', fontWeight: 700, fontSize: '1.1rem' }}>
                          +{Math.floor(Math.random() * 400) + 150} pts
                        </span>
                      </FlexRow>
                      <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                          Estimated ranking jump:
                        </span>
                        <span style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: '0.875rem' }}>
                          +{Math.floor(Math.random() * 50) + 10} positions
                        </span>
                      </FlexRow>
                    </div>

                    <BaseButton $variant="primary" onClick={handleCreateAccount} $fullWidth style={{ marginBottom: 'var(--spacing-md)' }}>
                      Start Climbing
                      <ArrowRight size={16} />
                    </BaseButton>

                    <MetricItem style={{
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-tertiary)'
                    }}>
                      <Users size={12} />
                      {Math.floor(Math.random() * 100) + 50} professionals joined in the last 24h
                    </MetricItem>
                  </CardContent>
                </FeatureCard>

                <FeatureCard>
                  <CardContent style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                      <Sparkles size={24} color="#f59e0b" style={{ marginBottom: 'var(--spacing-sm)' }} />
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>Elite Status Benefits</h4>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <CheckCircle size={16} color="var(--color-success-600)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Priority recruiter visibility</span>
                      </FlexRow>
                      <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <CheckCircle size={16} color="var(--color-success-600)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Exclusive opportunity access</span>
                      </FlexRow>
                      <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <CheckCircle size={16} color="var(--color-success-600)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Professional networking events</span>
                      </FlexRow>
                      <FlexRow $gap="var(--spacing-sm)">
                        <CheckCircle size={16} color="var(--color-success-600)" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Advanced analytics dashboard</span>
                      </FlexRow>
                    </div>
                  </CardContent>
                </FeatureCard>
              </div>
            </Grid>
          </Container>
        </Section>

        {/* FINAL CTA */}
        <Section>
          <CTASection>
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
          </CTASection>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
};

// ==============================================
// SUSPENSE WRAPPER COMPONENT
// ==============================================
const ThrivePageWithSuspense = () => (
  <Suspense fallback={
    <PageContainer>
      <ContentWrapper>
        <LoadingContainer>
          <LoadingSpinner $size="lg" />
          <BodyText>Loading professional assessments...</BodyText>
        </LoadingContainer>
      </ContentWrapper>
    </PageContainer>
  }>
    <ThriveProvider isAuthenticated={false}>
      <PublicContent />
    </ThriveProvider>
  </Suspense>
);

// ==============================================
// MAIN EXPORT WITH PROVIDER
// ==============================================

export default ThrivePageWithSuspense;