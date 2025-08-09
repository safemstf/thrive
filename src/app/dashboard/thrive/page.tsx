// src/app/dashboard/thrive/page.tsx - Fixed Objective Skills Assessment Platform
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/authProvider';
import { 
  Target,
  TrendingUp,
  Users,
  Clock,
  Award,
  Activity,
  BarChart3,
  Brain,
  MessageSquare,
  Code,
  Calculator,
  Lightbulb,
  FileText,
  Timer,
  Trophy,
  Eye,
  Shield,
  Zap
} from 'lucide-react';

// Import shared styled components from dashboard
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
  StatsGrid,
  StatCard,
  StatIcon,
  StatContent,
  StatValue,
  StatLabel,
  StatChange,
  DashboardContent,
  ContentGrid,
  Section,
  SectionHeader,
  SectionTitle,
  ViewAllLink
} from '@/components/dashboard/dashboardStyles';

// Import portfolio styles for consistency
import {
  Card,
  CardContent,
  Grid
} from '@/styles/styled-components';

// Import the missing components from employer tools
import {
  ViewStatsGrid,
  ViewStatCard,
  ViewStatIcon,
  ViewStatContent,
  ViewStatValue,
  ViewStatLabel,
  ViewGrid,
  ViewCard,
  ViewCardContent,
  ViewCardTitle,
  ViewCardDescription,
  ViewActionGroup,
  ViewAction,
  VerificationBadge,
  EmployerTools
} from '@/components/thrive/utils/employerTools';

// Modern themed styled components
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';

// Assessment Challenge Card - GREYSCALE ONLY
const AssessmentCard = styled(Card)<{ $difficulty: 'novice' | 'intermediate' | 'expert' | 'master' }>`
  ${themeUtils.glass(0.9)}
  border: 2px solid ${props => {
    switch (props.$difficulty) {
      case 'novice': return theme.colors.primary[300];
      case 'intermediate': return theme.colors.primary[500];
      case 'expert': return theme.colors.primary[600];
      case 'master': return theme.colors.primary[700];
    }
  }};
  background: ${props => {
    switch (props.$difficulty) {
      case 'novice': return themeUtils.alpha(theme.colors.primary[200], 0.05);
      case 'intermediate': return themeUtils.alpha(theme.colors.primary[400], 0.05);
      case 'expert': return themeUtils.alpha(theme.colors.primary[600], 0.05);
      case 'master': return themeUtils.alpha(theme.colors.primary[700], 0.05);
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  position: relative;
  ${themeUtils.hoverLift}
  
  &::before {
    content: '${props => props.$difficulty.toUpperCase()}';
    position: absolute;
    top: ${theme.spacing.md};
    right: ${theme.spacing.md};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background: ${props => {
      switch (props.$difficulty) {
        case 'novice': return theme.colors.primary[300];
        case 'intermediate': return theme.colors.primary[500];
        case 'expert': return theme.colors.primary[600];
        case 'master': return theme.colors.primary[700];
      }
    }};
    color: ${props => {
      switch (props.$difficulty) {
        case 'novice': return theme.colors.primary[700];
        case 'intermediate': return theme.colors.text.inverse;
        case 'expert': return theme.colors.text.inverse;
        case 'master': return theme.colors.text.inverse;
      }
    }};
    font-size: ${theme.typography.sizes.xs};
    font-weight: ${theme.typography.weights.bold};
    border-radius: ${theme.borderRadius.sm};
    letter-spacing: ${theme.typography.letterSpacing.uppercase};
    z-index: 2;
  }
`;

const AssessmentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const AssessmentIcon = styled.div<{ $skillType: string }>`
  width: 56px;
  height: 56px;
  border-radius: ${theme.borderRadius.md};
  background: ${props => {
    switch (props.$skillType) {
      case 'critical-thinking': return `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]})`;
      case 'linguistic': return `linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.primary[500]})`;
      case 'technical': return `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]})`;
      case 'analytical': return `linear-gradient(135deg, ${theme.colors.primary[300]}, ${theme.colors.primary[400]})`;
      case 'creative': return `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]})`;
      default: return `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]})`;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${theme.shadows.md};
  flex-shrink: 0;
`;

const AssessmentContent = styled.div`
  flex: 1;
`;

const AssessmentTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.secondary};
`;

const AssessmentDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

const AssessmentMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.glass};
`;

const MetricItem = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
`;

const MetricLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-weight: ${theme.typography.weights.medium};
`;

const AssessmentButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.sm};
  font-family: ${theme.typography.fonts.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
    color: ${theme.colors.text.inverse};
    border: 1px solid ${theme.colors.primary[600]};
    box-shadow: ${theme.shadows.md};
    
    &:hover {
      background: linear-gradient(135deg, ${theme.colors.primary[700]}, ${theme.colors.primary[800]});
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  ` : `
    ${themeUtils.glass(0.8)}
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.glass};
    
    &:hover {
      background: ${theme.colors.background.tertiary};
      border-color: ${theme.colors.primary[600]};
      color: ${theme.colors.text.primary};
      transform: translateY(-1px);
    }
  `}
`;

// Ranking/Leaderboard Components
const RankingCard = styled(Card)`
  ${themeUtils.glass(0.95)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.lg};
`;

const RankingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.glass};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.8)};
`;

const RankingItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.glass};
  transition: ${theme.transitions.normal};
  background: ${props => {
    if (props.$rank <= 3) {
      return themeUtils.alpha(theme.colors.primary[400], 0.05);
    }
    return 'transparent';
  }};
  
  &:hover {
    background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
    transform: translateX(4px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.bold};
  font-size: ${theme.typography.sizes.lg};
  flex-shrink: 0;
  
  background: ${props => {
    if (props.$rank === 1) return `linear-gradient(135deg, ${theme.colors.primary[200]}, ${theme.colors.primary[300]})`;
    if (props.$rank === 2) return `linear-gradient(135deg, ${theme.colors.primary[300]}, ${theme.colors.primary[400]})`;
    if (props.$rank === 3) return `linear-gradient(135deg, ${theme.colors.primary[400]}, ${theme.colors.primary[500]})`;
    return theme.colors.background.tertiary;
  }};
  
  color: ${props => {
    if (props.$rank === 1) return theme.colors.primary[700];
    if (props.$rank === 2) return theme.colors.primary[700];
    if (props.$rank === 3) return theme.colors.text.inverse;
    return theme.colors.text.secondary;
  }};
  
  border: ${props => props.$rank <= 3 ? `3px solid ${theme.colors.background.secondary}` : `2px solid ${theme.colors.border.medium}`};
  box-shadow: ${props => props.$rank <= 3 ? theme.shadows.md : 'none'};
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const UserTitle = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const UserSkills = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const SkillBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
  color: ${theme.colors.primary[600]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
`;

const ScoreDisplay = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const OverallScore = styled.div`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.secondary};
`;

const ScoreBreakdown = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

// Analytics Components
const AnalyticsContent = styled.div`
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TrendItem = styled.div`
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.5)};
  backdrop-filter: blur(${theme.glass.blurSubtle});
`;

const TrendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const TrendSkill = styled.div`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
`;

const TrendGrowth = styled.div<{ $positive?: boolean }>`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.bold};
  color: ${props => props.$positive ? theme.colors.primary[600] : theme.colors.primary[700]};
`;

const TrendBar = styled.div`
  height: 8px;
  background: ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`;

const TrendFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, ${theme.colors.primary[600]}, ${theme.colors.primary[500]});
  transition: width ${theme.transitions.normal};
`;

const TrendDetails = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
`;

const InsightItem = styled.div`
  padding: ${theme.spacing.lg};
  border-left: 3px solid ${theme.colors.primary[600]};
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.05)};
  border-radius: ${theme.borderRadius.sm};
`;

const InsightTitle = styled.div`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const InsightMetric = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fonts.secondary};
`;

const InsightDescription = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeights.relaxed};
`;

// Assessment data structure
interface Assessment {
  id: string;
  title: string;
  description: string;
  skillType: 'critical-thinking' | 'linguistic' | 'technical' | 'analytical' | 'creative';
  difficulty: 'novice' | 'intermediate' | 'expert' | 'master';
  duration: number;
  participants: number;
  averageScore: number;
  completionRate: number;
  employerTrust: number;
}

interface RankedUser {
  id: string;
  name: string;
  title: string;
  rank: number;
  overallScore: number;
  skills: string[];
  verified: boolean;
  criticalThinking: number;
  linguistic: number;
  technical: number;
  analytical: number;
}

export default function ObjectiveSkillsAssessment() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'assessments' | 'rankings' | 'analytics' | 'employer-tools'>('assessments');

  // Mock assessment data
  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'Advanced Critical Thinking Assessment',
      description: 'Multi-dimensional evaluation of logical reasoning, problem decomposition, and analytical decision-making under time constraints.',
      skillType: 'critical-thinking',
      difficulty: 'expert',
      duration: 45,
      participants: 2847,
      averageScore: 74,
      completionRate: 68,
      employerTrust: 94
    },
    {
      id: '2',
      title: 'Professional Communication Evaluation',
      description: 'Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.',
      skillType: 'linguistic',
      difficulty: 'intermediate',
      duration: 30,
      participants: 4321,
      averageScore: 82,
      completionRate: 89,
      employerTrust: 91
    },
    {
      id: '3',
      title: 'Technical Problem Solving Challenge',
      description: 'Real-world technical scenarios requiring systematic debugging, optimization, and implementation of scalable solutions.',
      skillType: 'technical',
      difficulty: 'expert',
      duration: 60,
      participants: 1893,
      averageScore: 69,
      completionRate: 54,
      employerTrust: 96
    },
    {
      id: '4',
      title: 'Data Analysis & Interpretation',
      description: 'Complex data scenarios requiring statistical analysis, pattern recognition, and evidence-based conclusions.',
      skillType: 'analytical',
      difficulty: 'intermediate',
      duration: 40,
      participants: 3456,
      averageScore: 78,
      completionRate: 76,
      employerTrust: 88
    },
    {
      id: '5',
      title: 'Innovation & Creative Problem Solving',
      description: 'Open-ended challenges evaluating creative thinking, ideation processes, and innovative solution development.',
      skillType: 'creative',
      difficulty: 'master',
      duration: 50,
      participants: 987,
      averageScore: 71,
      completionRate: 43,
      employerTrust: 85
    },
    {
      id: '6',
      title: 'Rapid Reasoning Assessment',
      description: 'Quick-fire logical puzzles and reasoning challenges designed to evaluate processing speed and accuracy.',
      skillType: 'critical-thinking',
      difficulty: 'novice',
      duration: 15,
      participants: 8765,
      averageScore: 86,
      completionRate: 94,
      employerTrust: 79
    }
  ];

  // Mock ranking data
  const topPerformers: RankedUser[] = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      title: 'Senior Data Scientist',
      rank: 1,
      overallScore: 94,
      skills: ['Critical Thinking', 'Analytics', 'Technical'],
      verified: true,
      criticalThinking: 96,
      linguistic: 91,
      technical: 97,
      analytical: 94
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      title: 'Strategic Consultant',
      rank: 2,
      overallScore: 91,
      skills: ['Critical Thinking', 'Linguistic', 'Creative'],
      verified: true,
      criticalThinking: 93,
      linguistic: 95,
      technical: 84,
      analytical: 91
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      title: 'Product Manager',
      rank: 3,
      overallScore: 89,
      skills: ['Analytics', 'Technical', 'Creative'],
      verified: true,
      criticalThinking: 87,
      linguistic: 88,
      technical: 92,
      analytical: 89
    },
    {
      id: '4',
      name: 'James Park',
      title: 'Software Architect',
      rank: 4,
      overallScore: 87,
      skills: ['Technical', 'Critical Thinking'],
      verified: false,
      criticalThinking: 89,
      linguistic: 82,
      technical: 94,
      analytical: 84
    },
    {
      id: '5',
      name: 'Dr. Aisha Patel',
      title: 'Research Director',
      rank: 5,
      overallScore: 86,
      skills: ['Analytics', 'Linguistic', 'Critical Thinking'],
      verified: true,
      criticalThinking: 88,
      linguistic: 90,
      technical: 79,
      analytical: 92
    }
  ];

  const getSkillIcon = (skillType: string) => {
    switch (skillType) {
      case 'critical-thinking': return Brain;
      case 'linguistic': return MessageSquare;
      case 'technical': return Code;
      case 'analytical': return Calculator;
      case 'creative': return Lightbulb;
      default: return Target;
    }
  };

  const handleEmployerToolAction = (toolId: string) => {
    console.log(`Employer tool action: ${toolId}`);
    // Handle tool actions here
  };

  return (
    <PageWrapper>
      <Container>
        {/* Header */}
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Objective Skills Assessment Platform</WelcomeTitle>
              <WelcomeSubtitle>
                Standardized, employer-trusted evaluations that provide measurable insights into critical professional capabilities
              </WelcomeSubtitle>
            </WelcomeSection>
            
            <ViewToggle>
              <ViewButton 
                $active={activeView === 'assessments'}
                onClick={() => setActiveView('assessments')}
              >
                <Target size={16} />
                Assessments
              </ViewButton>
              <ViewButton 
                $active={activeView === 'rankings'}
                onClick={() => setActiveView('rankings')}
              >
                <Trophy size={16} />
                Rankings
              </ViewButton>
              <ViewButton 
                $active={activeView === 'analytics'}
                onClick={() => setActiveView('analytics')}
              >
                <BarChart3 size={16} />
                Analytics
              </ViewButton>
              <ViewButton 
                $active={activeView === 'employer-tools'}
                onClick={() => setActiveView('employer-tools')}
              >
                <Eye size={16} />
                Employer Tools
              </ViewButton>
            </ViewToggle>
          </HeaderContent>
        </Header>

        <DashboardContent>
          {/* Assessments View */}
          {activeView === 'assessments' && (
            <>
              {/* Platform Metrics */}
              <StatsGrid>
                <StatCard>
                  <StatIcon $color={theme.colors.primary[600]}>
                    <Users size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>23,847</StatValue>
                    <StatLabel>Verified Professionals</StatLabel>
                    <StatChange $positive>+1,247 this month</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color={theme.colors.primary[500]}>
                    <Shield size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>91%</StatValue>
                    <StatLabel>Employer Trust Rating</StatLabel>
                    <StatChange $positive>Industry leading</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color={theme.colors.primary[700]}>
                    <Activity size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>342</StatValue>
                    <StatLabel>Active Assessments</StatLabel>
                    <StatChange>Live now</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color={theme.colors.primary[400]}>
                    <Zap size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>15min</StatValue>
                    <StatLabel>Avg. Response Time</StatLabel>
                    <StatChange $positive>Instant results</StatChange>
                  </StatContent>
                </StatCard>
              </StatsGrid>

              {/* Assessment Challenges */}
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <Target size={18} />
                    Professional Assessment Challenges
                  </SectionTitle>
                  <ViewAllLink>
                    View all categories
                  </ViewAllLink>
                </SectionHeader>
                
                <Grid $minWidth="400px" $gap={theme.spacing.xl}>
                  {assessments.map((assessment) => {
                    const IconComponent = getSkillIcon(assessment.skillType);
                    return (
                      <AssessmentCard key={assessment.id} $difficulty={assessment.difficulty}>
                        <CardContent>
                          <AssessmentHeader>
                            <AssessmentIcon $skillType={assessment.skillType}>
                              <IconComponent size={24} />
                            </AssessmentIcon>
                            <AssessmentContent>
                              <AssessmentTitle>{assessment.title}</AssessmentTitle>
                              <AssessmentDescription>{assessment.description}</AssessmentDescription>
                            </AssessmentContent>
                          </AssessmentHeader>

                          <AssessmentMetrics>
                            <MetricItem>
                              <MetricValue>{assessment.duration}min</MetricValue>
                              <MetricLabel>Duration</MetricLabel>
                            </MetricItem>
                            <MetricItem>
                              <MetricValue>{assessment.participants.toLocaleString()}</MetricValue>
                              <MetricLabel>Participants</MetricLabel>
                            </MetricItem>
                            <MetricItem>
                              <MetricValue>{assessment.averageScore}%</MetricValue>
                              <MetricLabel>Avg Score</MetricLabel>
                            </MetricItem>
                            <MetricItem>
                              <MetricValue>{assessment.employerTrust}%</MetricValue>
                              <MetricLabel>Trust Rating</MetricLabel>
                            </MetricItem>
                          </AssessmentMetrics>

                          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                            <AssessmentButton $variant="primary">
                              <Timer size={16} />
                              Begin Assessment
                            </AssessmentButton>
                            <AssessmentButton $variant="secondary">
                              <FileText size={16} />
                              Preview
                            </AssessmentButton>
                          </div>
                        </CardContent>
                      </AssessmentCard>
                    );
                  })}
                </Grid>
              </Section>
            </>
          )}

          {/* Rankings View */}
          {activeView === 'rankings' && (
            <RankingCard>
              <RankingHeader>
                <SectionTitle>
                  <Trophy size={18} />
                  Global Professional Rankings
                </SectionTitle>
                <VerificationBadge $verified={true}>
                  <Shield size={12} />
                  Verified Only
                </VerificationBadge>
              </RankingHeader>
              
              <div>
                {topPerformers.map((performer) => (
                  <RankingItem key={performer.id} $rank={performer.rank}>
                    <RankBadge $rank={performer.rank}>
                      {performer.rank}
                    </RankBadge>
                    <UserInfo>
                      <UserName>
                        {performer.name}
                        {performer.verified && (
                          <VerificationBadge $verified={true}>
                            <Shield size={10} />
                            Verified
                          </VerificationBadge>
                        )}
                      </UserName>
                      <UserTitle>{performer.title}</UserTitle>
                      <UserSkills>
                        {performer.skills.map((skill, index) => (
                          <SkillBadge key={index}>{skill}</SkillBadge>
                        ))}
                      </UserSkills>
                    </UserInfo>
                    <ScoreDisplay>
                      <OverallScore>{performer.overallScore}</OverallScore>
                      <ScoreBreakdown>
                        CT:{performer.criticalThinking} | L:{performer.linguistic} | T:{performer.technical} | A:{performer.analytical}
                      </ScoreBreakdown>
                    </ScoreDisplay>
                  </RankingItem>
                ))}
              </div>
            </RankingCard>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <>
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <BarChart3 size={18} />
                    Skills Analytics & Market Intelligence
                  </SectionTitle>
                  <ViewAllLink>Export Report</ViewAllLink>
                </SectionHeader>
                
                {/* Analytics Stats */}
                <ViewStatsGrid>
                  <ViewStatCard>
                    <ViewStatIcon $color={theme.colors.primary[600]}>
                      <TrendingUp size={20} />
                    </ViewStatIcon>
                    <ViewStatContent>
                      <ViewStatValue>87%</ViewStatValue>
                      <ViewStatLabel>Market Accuracy</ViewStatLabel>
                    </ViewStatContent>
                  </ViewStatCard>
                  
                  <ViewStatCard>
                    <ViewStatIcon $color={theme.colors.primary[500]}>
                      <Users size={20} />
                    </ViewStatIcon>
                    <ViewStatContent>
                      <ViewStatValue>12,450</ViewStatValue>
                      <ViewStatLabel>Data Points</ViewStatLabel>
                    </ViewStatContent>
                  </ViewStatCard>
                  
                  <ViewStatCard>
                    <ViewStatIcon $color={theme.colors.primary[700]}>
                      <BarChart3 size={20} />
                    </ViewStatIcon>
                    <ViewStatContent>
                      <ViewStatValue>342</ViewStatValue>
                      <ViewStatLabel>Skills Tracked</ViewStatLabel>
                    </ViewStatContent>
                  </ViewStatCard>
                  
                  <ViewStatCard>
                    <ViewStatIcon $color={theme.colors.primary[400]}>
                      <Clock size={20} />
                    </ViewStatIcon>
                    <ViewStatContent>
                      <ViewStatValue>24/7</ViewStatValue>
                      <ViewStatLabel>Live Updates</ViewStatLabel>
                    </ViewStatContent>
                  </ViewStatCard>
                </ViewStatsGrid>

                <ContentGrid>
                  {/* Market Trends */}
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        <TrendingUp size={18} />
                        Market Demand Trends
                      </SectionTitle>
                    </SectionHeader>
                    
                    <AnalyticsContent>
                      <TrendItem>
                        <TrendHeader>
                          <TrendSkill>Critical Thinking</TrendSkill>
                          <TrendGrowth $positive>+23%</TrendGrowth>
                        </TrendHeader>
                        <TrendBar>
                          <TrendFill $percentage={92} />
                        </TrendBar>
                        <TrendDetails>High demand across all industries</TrendDetails>
                      </TrendItem>
                      
                      <TrendItem>
                        <TrendHeader>
                          <TrendSkill>Data Analysis</TrendSkill>
                          <TrendGrowth $positive>+18%</TrendGrowth>
                        </TrendHeader>
                        <TrendBar>
                          <TrendFill $percentage={89} />
                        </TrendBar>
                        <TrendDetails>Especially in tech and finance sectors</TrendDetails>
                      </TrendItem>
                      
                      <TrendItem>
                        <TrendHeader>
                          <TrendSkill>Communication</TrendSkill>
                          <TrendGrowth $positive>+12%</TrendGrowth>
                        </TrendHeader>
                        <TrendBar>
                          <TrendFill $percentage={84} />
                        </TrendBar>
                        <TrendDetails>Remote work driving demand</TrendDetails>
                      </TrendItem>
                    </AnalyticsContent>
                  </Section>

                  {/* Industry Insights */}
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        <Brain size={18} />
                        Industry Insights
                      </SectionTitle>
                    </SectionHeader>
                    
                    <AnalyticsContent>
                      <InsightItem>
                        <InsightTitle>Technology Sector</InsightTitle>
                        <InsightMetric>95% of roles require technical problem-solving</InsightMetric>
                        <InsightDescription>
                          Critical thinking and analytical skills are the top predictors of performance in tech roles.
                        </InsightDescription>
                      </InsightItem>
                      
                      <InsightItem>
                        <InsightTitle>Financial Services</InsightTitle>
                        <InsightMetric>89% prioritize analytical reasoning</InsightMetric>
                        <InsightDescription>
                          Data interpretation and risk assessment skills command premium salaries.
                        </InsightDescription>
                      </InsightItem>
                      
                      <InsightItem>
                        <InsightTitle>Healthcare</InsightTitle>
                        <InsightMetric>91% value critical decision-making</InsightMetric>
                        <InsightDescription>
                          Quick, accurate reasoning under pressure is highly valued and tested.
                        </InsightDescription>
                      </InsightItem>
                    </AnalyticsContent>
                  </Section>
                </ContentGrid>
              </Section>
            </>
          )}

          {/* Employer Tools View */}
          {activeView === 'employer-tools' && (
            <Section>
              <SectionHeader>
                <SectionTitle>
                  <Shield size={18} />
                  Employer Verification & Tools
                </SectionTitle>
                <ViewAllLink>Request Demo</ViewAllLink>
              </SectionHeader>
              
              <EmployerTools onToolAction={handleEmployerToolAction} />
            </Section>
          )}
        </DashboardContent>
      </Container>
    </PageWrapper>
  );
}