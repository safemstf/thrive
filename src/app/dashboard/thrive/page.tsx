// src/app/dashboard/thrive/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Target, Trophy, BarChart3, Eye, Sparkles, CheckCircle, Timer } from 'lucide-react';
import { 
  PageWrapper, 
  Container, 
  Header, 
  HeaderContent, 
  WelcomeSection, 
  WelcomeTitle, 
  WelcomeSubtitle, 
  ViewToggle, 
  ViewButton, 
  DashboardContent 
} from '@/components/dashboard/dashboardStyles';
import { 
  WelcomeBanner, 
  WelcomeContent, 
  WelcomeBannerTitle, 
  WelcomeBannerText, 
  WelcomeActions, 
  AssessmentButton 
} from '@/components/thrive/styles';
import { useThriveStats, useThriveLeaderboard } from '@/hooks/useThrive';
import { theme } from '@/styles/theme';

import type { RankingsPageProps } from './ranking/page';
import type { EmployerToolsPageProps } from './employerTools/page';



// dynamic imports
const AnalyticsPage = dynamic(() => import('./analytics/page'), { ssr: false });
const RankingsPage = dynamic<RankingsPageProps>(
  () => import('./ranking/page').then(mod => mod.default),
  { ssr: false }
);
const EmployerToolsPage = dynamic<EmployerToolsPageProps>(
  () => import('./employerTools/page').then(mod => mod.default),
  { ssr: false }
);

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

// Create a styled component for the assessment card
const AssessmentCard = styled(Link)`
  display: block;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.background.secondary};
  text-decoration: none;
  color: ${theme.colors.text.primary};
  box-shadow: ${theme.shadows.sm};
  transition: ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
    background: ${theme.colors.background.tertiary};
  }
  
  h3 {
    margin-bottom: ${theme.spacing.sm};
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.semibold};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.sizes.sm};
  }
`;

const AssessmentsList = () => (
  <div style={{
    display: 'grid',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg
  }}>
    {ASSESSMENTS.map((a) => (
      <AssessmentCard
        key={a.id}
        href={`/dashboard/thrive/assessments/${a.id}`}
      >
        <h3>{a.title}</h3>
        <p>{a.description}</p>
      </AssessmentCard>
    ))}
  </div>
);

export default function ThriveShell() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<'assessments' | 'rankings' | 'analytics' | 'employer-tools'>('assessments');

  const requestedAssessment = searchParams.get('assessment');
  const fromPublic = searchParams.get('from') === 'public';

  // use your hooks
  const platformStats = useThriveStats();
  const leaderboard = useThriveLeaderboard();

  const handleStartAssessment = (route: string) => {
    if (route) router.push(route);
  };

  const handleEmployerToolAction = (toolId: string) => console.log('employer tool', toolId);

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
                    const a = ASSESSMENTS.find(s => s.title === requestedAssessment);
                    if (a) handleStartAssessment(`/dashboard/thrive/assessments/${a.id}`);
                  }}>
                    <Timer size={16} /> Start Assessment
                  </AssessmentButton>
                )}
              </WelcomeActions>
            </WelcomeBanner>
          )}

          {activeView === 'assessments' && (
            <>
              <WelcomeSection>
                <WelcomeTitle>Available Assessments</WelcomeTitle>
                <WelcomeSubtitle>
                  Choose an assessment to start your journey
                </WelcomeSubtitle>
              </WelcomeSection>
              <AssessmentsList />
            </>
          )}

          <Suspense fallback={<div>Loading…</div>}>
            {activeView === 'rankings' && (
              <RankingsPage topPerformers={leaderboard} />
            )}

            {activeView === 'analytics' && <AnalyticsPage />}

            {activeView === 'employer-tools' && (
              <EmployerToolsPage onToolAction={handleEmployerToolAction} />
            )}
        </Suspense>

        </DashboardContent>
      </Container>
    </PageWrapper>
  );
}