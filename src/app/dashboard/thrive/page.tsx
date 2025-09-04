// src/app/dashboard/thrive/page.tsx - Simplified Assessment Dashboard
'use client';

import React, { useState } from 'react';
import {
  Target, Trophy, Sparkles, CheckCircle, Timer,
  Brain, Lightbulb, Heart, Play, ArrowRight, Star,
  Award, Users, TrendingUp
} from 'lucide-react';

// Import mock data
import {
  PROFESSIONAL_ASSESSMENTS,
  PSYCHOLOGICAL_ASSESSMENTS,
  CREATIVITY_ASSESSMENTS
} from '@/data/mockData';

// Import shared logic
import { ThriveProvider, useThrive } from '@/components/thrive/thriveLogic';
import { useAuth } from '@/providers/authProvider';

// Import premium styled components
import {
  PageContainer,
  DashboardHero,
  ConstrainedContent,
  Section,
  WelcomeBadge,
  LevelTitle,
  GradientText,
  QuickStatsGrid,
  StatPill,
  StatValue,
  StatLabel,
  ActionCardsGrid,
  PremiumActionCard,
  ActionIcon,
  UrgentBadge,
  ActionFooter,
  FeaturedCard,
  FeaturedBadge,
  FeaturedIcon,
  FeatureMetrics,
  SectionHeader,
  LivePulse,
  GlowButton,
  ResponsiveGrid,
  FlexRow,
  CardContent
} from './assessments/styles';

// Import from styled-components hub
import {
  Heading1,
  Heading2,
  BodyText
} from '@/styles/styled-components';

// ==============================================
// SIMPLIFIED DASHBOARD COMPONENTS
// ==============================================

const PersonalWelcome = ({ user }: { user: any }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completedAssessments = Math.floor(Math.random() * 12) + 3;
  const averageScore = Math.floor(Math.random() * 20) + 75;
  const globalRank = Math.floor(Math.random() * 150) + 25;
  const streakDays = Math.floor(Math.random() * 30) + 5;

  return (
    <DashboardHero>
      <ConstrainedContent>
        <LevelTitle>
          <WelcomeBadge>
            <Sparkles size={16} />
            {getGreeting()}, {user?.name || 'Professional'}
          </WelcomeBadge>

          <Heading1>
            Ready to <GradientText>Level Up</GradientText> Your Skills?
          </Heading1>

          <BodyText style={{
            fontSize: 'var(--font-size-lg)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Take assessments, earn certificates, and track your professional growth.
          </BodyText>

          <QuickStatsGrid>
            <StatPill $color="#10b981">
              <StatValue $color="#10b981">
                {completedAssessments}
              </StatValue>
              <StatLabel>Completed</StatLabel>
            </StatPill>

            <StatPill $color="#3b82f6">
              <StatValue $color="#3b82f6">
                {averageScore}%
              </StatValue>
              <StatLabel>Avg Score</StatLabel>
            </StatPill>

            <StatPill $color="#f59e0b">
              <StatValue $color="#f59e0b">
                #{globalRank}
              </StatValue>
              <StatLabel>Your Rank</StatLabel>
            </StatPill>

            <StatPill $color="#8b5cf6">
              <StatValue $color="#8b5cf6">
                {streakDays}
              </StatValue>
              <StatLabel>Day Streak</StatLabel>
            </StatPill>
          </QuickStatsGrid>
        </LevelTitle>
      </ConstrainedContent>
    </DashboardHero>
  );
};

const NextSteps = ({ onAssessmentStart }: { onAssessmentStart: (id: string) => void }) => {
  // Simple, clear next steps based on user progress
  const nextSteps = [
    {
      id: 'emotional-intelligence',
      title: 'Start With Emotional Intelligence',
      description: 'The most requested skill by employers. Perfect starting point for career growth.',
      icon: Heart,
      color: '#ec4899',
      duration: '25 min',
      difficulty: 'Beginner Friendly',
      priority: true
    },
    {
      id: 'professional-communication',
      title: 'Test Your Communication Skills',
      description: 'See how well you communicate in professional settings.',
      icon: Users,
      color: '#3b82f6',
      duration: '20 min',
      difficulty: 'Easy',
      priority: false
    },
    {
      id: 'creative-problem-solving',
      title: 'Unlock Creative Thinking',
      description: 'Discover your creative problem-solving strengths.',
      icon: Lightbulb,
      color: '#f59e0b',
      duration: '15 min',
      difficulty: 'Fun',
      priority: false
    }
  ];

  return (
    <Section>
      <SectionHeader>
        <div className="icon-title">
          <Target size={28} color="#3b82f6" />
          <Heading2>What Should You Do Next?</Heading2>
        </div>
        <BodyText>
          We've picked the best assessments to start your professional development journey
        </BodyText>
      </SectionHeader>

      <ActionCardsGrid>
        {nextSteps.map((step, index) => {
          const IconComponent = step.icon;

          return (
            <PremiumActionCard
              key={step.id}
              $color={step.color}
              $urgent={step.priority}
              onClick={() => onAssessmentStart(step.id)}
            >
              {step.priority && <UrgentBadge>START HERE</UrgentBadge>}
              <CardContent>
                <ActionIcon $color={step.color}>
                  <IconComponent size={32} />
                </ActionIcon>

                <h3>{step.title}</h3>
                <p>{step.description}</p>

                <div style={{
                  margin: 'var(--spacing-md) 0',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)'
                }}>
                  {step.duration} • {step.difficulty}
                </div>

                <ActionFooter $color={step.color}>
                  <span>Take Assessment</span>
                  <ArrowRight size={16} />
                </ActionFooter>
              </CardContent>
            </PremiumActionCard>
          );
        })}
      </ActionCardsGrid>
    </Section>
  );
};

const FeaturedAssessment = ({ onStart }: { onStart: () => void }) => (
  <Section>
    <FeaturedCard>
      <FeaturedBadge>
        <Star size={12} />
        MOST POPULAR
      </FeaturedBadge>

      <CardContent style={{ padding: 'var(--spacing-2xl)', position: 'relative', zIndex: 1 }}>
        <FlexRow $gap="var(--spacing-xl)" $align="center">
          <FeaturedIcon>
            <Trophy size={40} style={{ color: '#10b981' }} />
          </FeaturedIcon>

          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: '1.4rem',
              fontWeight: 700
            }}>
              Big Five Personality Assessment
            </h3>

            <BodyText style={{
              margin: '0 0 var(--spacing-md) 0',
              lineHeight: '1.6'
            }}>
              The gold standard personality test used by Fortune 500 companies.
              Discover your core personality traits in just 15 minutes.
            </BodyText>

            <FeatureMetrics>
              <div className="metric">
                <Timer size={14} />
                <span>15 minutes</span>
              </div>
              <div className="metric">
                <Users size={14} />
                <span>500+ taken this week</span>
              </div>
              <div className="metric">
                <Award size={14} />
                <span>Free Certificate</span>
              </div>
            </FeatureMetrics>
          </div>

          <GlowButton
            $variant="primary"
            $size="lg"
            $glowColor="#10b981"
            onClick={onStart}
          >
            <Play size={20} />
            Start Now
          </GlowButton>
        </FlexRow>
      </CardContent>
    </FeaturedCard>
  </Section>
);

const BrowseAllAssessments = ({ onViewAll }: { onViewAll: () => void }) => {
  const categories = [
    {
      name: 'Professional Skills',
      count: PROFESSIONAL_ASSESSMENTS.length,
      color: '#3b82f6',
      icon: Target,
      description: 'Communication, leadership, problem-solving'
    },
    {
      name: 'Personality & Psychology',
      count: PSYCHOLOGICAL_ASSESSMENTS.length || 0,
      color: '#8b5cf6',
      icon: Brain,
      description: 'Personality traits, thinking styles, wellbeing'
    },
    {
      name: 'Creative Intelligence',
      count: CREATIVITY_ASSESSMENTS.length,
      color: '#f59e0b',
      icon: Lightbulb,
      description: 'Innovation, creative thinking, problem-solving'
    }
  ];

  return (
    <Section>
      <SectionHeader>
        <div className="icon-title">
          <Trophy size={28} color="#3b82f6" />
          <Heading2>Or Browse All Assessments</Heading2>
        </div>
        <BodyText>
          Explore our full library organized by skill category
        </BodyText>
      </SectionHeader>

      <ResponsiveGrid $minWidth="280px">
        {categories.map((category) => {
          const IconComponent = category.icon;

          return (
            <div
              key={category.name}
              onClick={onViewAll}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(15px)',
                border: `1px solid ${category.color}20`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--spacing-xl)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${category.color}40`;
                e.currentTarget.style.boxShadow = `0 10px 30px ${category.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.borderColor = `${category.color}20`;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)',
                border: `2px solid ${category.color}30`
              }}>
                <IconComponent size={28} style={{ color: category.color }} />
              </div>

              <h4 style={{
                margin: '0 0 var(--spacing-sm) 0',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                {category.name}
              </h4>

              <p style={{
                margin: '0 0 var(--spacing-md) 0',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.4'
              }}>
                {category.description}
              </p>

              <div style={{
                background: `${category.color}15`,
                color: category.color,
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'inline-block'
              }}>
                {category.count} assessments
              </div>
            </div>
          );
        })}
      </ResponsiveGrid>

      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
        <BodyText style={{ color: 'var(--color-text-secondary)' }}>
          New assessments added weekly • All assessments include certificates
        </BodyText>
      </div>
    </Section>
  );
};

// ==============================================
// MAIN DASHBOARD COMPONENT
// ==============================================

const DashboardContent = () => {
  const { user } = useAuth();
  const { handleAssessmentClick } = useThrive();

  const handleAssessmentStart = (assessmentId: string) => {
    handleAssessmentClick(assessmentId);
  };

  const handleFeaturedStart = () => {
    handleAssessmentClick('big-five-50');
  };

  const handleViewAll = () => {
    // Navigate to full assessment library
    // This would typically be handled by your routing logic
    console.log('Navigate to full assessment library');
  };

  return (
    <PageContainer>
      <PersonalWelcome user={user} />

      <ConstrainedContent>
        {/* Clear Next Steps - Primary CTA */}
        <NextSteps onAssessmentStart={handleAssessmentStart} />

        {/* Popular Choice - Social Proof */}
        <FeaturedAssessment onStart={handleFeaturedStart} />

        {/* Browse Option - Secondary Path */}
        <BrowseAllAssessments onViewAll={handleViewAll} />
      </ConstrainedContent>
    </PageContainer>
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