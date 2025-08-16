// src/app/dashboard/thrive/page.tsx - Fixed offline-compatible version
'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Target, Trophy, BarChart3, Eye, Sparkles, CheckCircle, Timer } from 'lucide-react';

// Import from styled-components hub
import {  
  Container, 
  Header, 
  HeaderContent,
  PageWrapper,
  Card,
  CardContent
} from '@/styles/styled-components';

// Import from thrive styles
import { 
  WelcomeBanner, 
  WelcomeContent, 
  WelcomeBannerTitle, 
  WelcomeBannerText, 
  WelcomeActions, 
  AssessmentButton 
} from '@/components/thrive/styles';

import {
  WelcomeSection, 
  WelcomeTitle, 
  WelcomeSubtitle, 
  ViewToggle, 
  ViewButton, 
  DashboardContent,
} from '@/components/dashboard/dashboardStyles'

// Import mock data directly for offline compatibility
import { MOCK_TOP_PERFORMERS } from '@/data/mockData';

// Dynamic imports without props (for offline compatibility)
const AnalyticsPage = dynamic(() => import('./analytics/page'), { ssr: false });
const RankingsPage = dynamic(() => import('./ranking/page'), { ssr: false });
const EmployerToolsPage = dynamic(() => import('./employerTools/page'), { ssr: false });

// Centralized metadata for the 6 assessments
const ASSESSMENTS = [
  {
    id: 'professional-communication',
    title: 'Professional Communication Evaluation',
    description: 'Assesses clarity, tone, and adaptability in workplace communication.',
  },
  {
    id: 'innovative-problem-solving',
    title: 'Innovation & Creative Problem Solving',
    description: 'Measures creative thinking, ideation, and innovative solution development.',
  },
  {
    id: 'technical-problem-solving',
    title: 'Technical Problem-Solving Skills',
    description: 'Evaluates analytical thinking, coding, and debugging capabilities.',
  },
  {
    id: 'leadership-assessment',
    title: 'Leadership & Team Collaboration',
    description: 'Analyzes decision-making, motivation, and conflict resolution skills.',
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence Assessment',
    description: 'Assesses empathy, self-awareness, and interpersonal relationship skills.',
  },
  {
    id: 'time-management',
    title: 'Time Management & Productivity',
    description: 'Measures organization, prioritization, and execution efficiency.',
  }
];

// Create a styled component for the assessment card using hub components
const AssessmentCard = styled(Link)`
  display: block;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--color-background-secondary);
  text-decoration: none;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
  border: 1px solid var(--color-border-light);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background: var(--color-background-tertiary);
    border-color: var(--color-primary-500);
  }
  
  h3 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }
  
  p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    margin: 0;
  }
`;

const AssessmentGrid = styled.div`
  display: grid;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
`;

const StatCard = styled(Card)`
  text-align: center;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  transition: var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

const AssessmentsList = () => (
  <AssessmentGrid>
    {ASSESSMENTS.map((assessment) => (
      <AssessmentCard
        key={assessment.id}
        href={`/dashboard/thrive/assessments/${assessment.id}`}
      >
        <h3>{assessment.title}</h3>
        <p>{assessment.description}</p>
      </AssessmentCard>
    ))}
  </AssessmentGrid>
);

// Offline-compatible stats (using mock data)
const PlatformStatsOverview = () => {
  const totalUsers = MOCK_TOP_PERFORMERS.length * 100; // Simulate platform size
  const activeToday = Math.floor(totalUsers * 0.15);
  const assessmentsCompleted = MOCK_TOP_PERFORMERS.reduce((sum, p) => sum + p.assessmentsCompleted, 0);
  const avgScore = Math.round(MOCK_TOP_PERFORMERS.reduce((sum, p) => sum + p.averageScore, 0) / MOCK_TOP_PERFORMERS.length);

  return (
    <StatsOverview>
      <StatCard>
        <CardContent>
          <StatNumber>{totalUsers.toLocaleString()}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </CardContent>
      </StatCard>
      <StatCard>
        <CardContent>
          <StatNumber>{activeToday}</StatNumber>
          <StatLabel>Active Today</StatLabel>
        </CardContent>
      </StatCard>
      <StatCard>
        <CardContent>
          <StatNumber>{assessmentsCompleted}</StatNumber>
          <StatLabel>Assessments Completed</StatLabel>
        </CardContent>
      </StatCard>
      <StatCard>
        <CardContent>
          <StatNumber>{avgScore}%</StatNumber>
          <StatLabel>Average Score</StatLabel>
        </CardContent>
      </StatCard>
    </StatsOverview>
  );
};

export default function ThriveShell() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<'assessments' | 'rankings' | 'analytics' | 'employer-tools'>('assessments');

  const requestedAssessment = searchParams.get('assessment');
  const fromPublic = searchParams.get('from') === 'public';

  const handleStartAssessment = (route: string) => {
    if (route) router.push(route);
  };

  const handleEmployerToolAction = (toolId: string) => {
    console.log('Employer tool action:', toolId);
    // Handle offline tool actions
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>
                Welcome back, {user?.name || 'Professional'}!
                <Sparkles size={20} style={{ marginLeft: '0.5rem', color: '#f59e0b' }} />
              </WelcomeTitle>
              <WelcomeSubtitle>
                Continue your professional certification journey.
              </WelcomeSubtitle>
            </WelcomeSection>

            <ViewToggle>
              <ViewButton $active={activeView === 'assessments'} onClick={() => setActiveView('assessments')}>
                <Target size={16} /> Assessments
              </ViewButton>
              <ViewButton $active={activeView === 'rankings'} onClick={() => setActiveView('rankings')}>
                <Trophy size={16} /> Rankings
              </ViewButton>
              <ViewButton $active={activeView === 'analytics'} onClick={() => setActiveView('analytics')}>
                <BarChart3 size={16} /> Analytics
              </ViewButton>
              <ViewButton $active={activeView === 'employer-tools'} onClick={() => setActiveView('employer-tools')}>
                <Eye size={16} /> Employer Tools
              </ViewButton>
            </ViewToggle>
          </HeaderContent>
        </Header>

        <DashboardContent>
          {/* Welcome Banner for new users */}
          {(fromPublic || requestedAssessment) && (
            <WelcomeBanner>
              <WelcomeContent>
                <WelcomeBannerTitle>
                  <CheckCircle size={24} color="#10b981" />
                  Account Created Successfully!
                </WelcomeBannerTitle>
                <WelcomeBannerText>
                  {requestedAssessment
                    ? `Ready to start your "${requestedAssessment}" assessment?`
                    : 'You now have access to all professional assessments.'}
                </WelcomeBannerText>
              </WelcomeContent>

              <WelcomeActions>
                {requestedAssessment && (
                  <AssessmentButton $variant="primary" onClick={() => {
                    const assessment = ASSESSMENTS.find(a => a.title === requestedAssessment);
                    if (assessment) handleStartAssessment(`/dashboard/thrive/assessments/${assessment.id}`);
                  }}>
                    <Timer size={16} /> Start Assessment
                  </AssessmentButton>
                )}
              </WelcomeActions>
            </WelcomeBanner>
          )}

          {/* Platform Stats */}
          {activeView === 'assessments' && <PlatformStatsOverview />}

          {/* Main Content */}
          {activeView === 'assessments' && (
            <>
              <WelcomeSection>
                <WelcomeTitle>Available Assessments</WelcomeTitle>
                <WelcomeSubtitle>
                  Choose an assessment to start your professional certification journey
                </WelcomeSubtitle>
              </WelcomeSection>
              <AssessmentsList />
            </>
          )}

          {/* Dynamic content wrapped in Suspense for offline compatibility */}
          <Suspense fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'var(--spacing-3xl)',
              color: 'var(--color-text-secondary)'
            }}>
              Loading...
            </div>
          }>
            {activeView === 'rankings' && <RankingsPage />}
            {activeView === 'analytics' && <AnalyticsPage />}
            {activeView === 'employer-tools' && <EmployerToolsPage />}
          </Suspense>
        </DashboardContent>
      </Container>
    </PageWrapper>
  );
}