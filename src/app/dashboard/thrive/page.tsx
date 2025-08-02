// src/app/dashboard/thrive/page.tsx - Professional Skills Development Hub
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
  BookOpen,
  BarChart3,
  ChevronRight,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertCircle
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

// Professional styled components specific to Skills Hub
import styled from 'styled-components';
import MarketIntelligenceSystem from '@/components/skills/marketIntelligenceSystem';

const MetricsCard = styled(Card)`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
`;

const MetricsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const MetricsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const MetricsBadge = styled.span`
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color?: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color || '#3b82f6'};
  transition: width 0.5s ease;
`;

const ProgressLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  min-width: 45px;
  text-align: right;
`;

const SkillCard = styled(Card)<{ $priority?: boolean }>`
  border: 1px solid ${props => props.$priority ? '#dbeafe' : '#e5e7eb'};
  background: ${props => props.$priority ? '#eff6ff' : 'white'};
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const SkillInfo = styled.div`
  flex: 1;
`;

const SkillTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
`;

const SkillCategory = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const SkillMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin: 1rem 0;
`;

const Metric = styled.div`
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #0f172a;
    color: white;
    border: 1px solid #0f172a;
    
    &:hover {
      background: #1e293b;
      border-color: #1e293b;
    }
  ` : `
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
  `}
`;

const InsightCard = styled(Card)`
  background: #fefce8;
  border: 1px solid #fef3c7;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const InsightIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const InsightTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #713f12;
  margin: 0;
`;

const InsightText = styled.p`
  font-size: 0.875rem;
  color: #854d0e;
  line-height: 1.5;
  margin: 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimelineIndicator = styled.div<{ $status: 'completed' | 'in-progress' | 'upcoming' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    switch (props.$status) {
      case 'completed':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'in-progress':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'upcoming':
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const TimelineDescription = styled.p`
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0;
`;

const TimelineMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
`;

interface SkillData {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  marketDemand: number;
  learningHours: number;
  lastPracticed: string;
  trending: boolean;
  priority: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  completedDate?: string;
  estimatedHours?: number;
  skillsGained?: string[];
}

export default function ProfessionalSkillsHub() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'skills' | 'progress' | 'insights'>('overview');
  
  const [skills] = useState<SkillData[]>([
    {
      id: '1',
      name: 'React Performance Optimization',
      category: 'Technical',
      proficiency: 78,
      marketDemand: 92,
      learningHours: 45,
      lastPracticed: '2 days ago',
      trending: true,
      priority: true
    },
    {
      id: '2',
      name: 'Strategic Brand Development',
      category: 'Business',
      proficiency: 65,
      marketDemand: 87,
      learningHours: 32,
      lastPracticed: '1 week ago',
      trending: false,
      priority: false
    },
    {
      id: '3',
      name: 'Data-Driven Decision Making',
      category: 'Analytics',
      proficiency: 82,
      marketDemand: 95,
      learningHours: 58,
      lastPracticed: 'Today',
      trending: true,
      priority: true
    },
    {
      id: '4',
      name: 'UX Research Methods',
      category: 'Design',
      proficiency: 71,
      marketDemand: 78,
      learningHours: 28,
      lastPracticed: '3 days ago',
      trending: false,
      priority: false
    }
  ]);

  const [learningPath] = useState<LearningPath[]>([
    {
      id: '1',
      title: 'Advanced React Patterns',
      description: 'Master complex React patterns and performance optimization techniques',
      status: 'completed',
      completedDate: 'Jan 15, 2025',
      skillsGained: ['React Hooks', 'Performance', 'State Management']
    },
    {
      id: '2',
      title: 'Business Analytics Fundamentals',
      description: 'Learn to analyze business data and create actionable insights',
      status: 'in-progress',
      estimatedHours: 20
    },
    {
      id: '3',
      title: 'Leadership Communication',
      description: 'Develop executive-level communication and presentation skills',
      status: 'upcoming',
      estimatedHours: 15
    }
  ]);

  const totalSkills = skills.length;
  const averageProficiency = Math.round(skills.reduce((acc, skill) => acc + skill.proficiency, 0) / totalSkills);
  const totalHours = skills.reduce((acc, skill) => acc + skill.learningHours, 0);
  const trendingSkills = skills.filter(skill => skill.trending).length;

  return (
    <PageWrapper>
      <Container>
        {/* Header */}
        <Header>
          <HeaderContent>
            <WelcomeSection>
              <WelcomeTitle>Professional Development</WelcomeTitle>
              <WelcomeSubtitle>
                Track your skills, identify opportunities, and accelerate your career growth
              </WelcomeSubtitle>
            </WelcomeSection>
            
            <ViewToggle>
              <ViewButton 
                $active={activeView === 'overview'}
                onClick={() => setActiveView('overview')}
              >
                <BarChart3 size={16} />
                Overview
              </ViewButton>
              <ViewButton 
                $active={activeView === 'skills'}
                onClick={() => setActiveView('skills')}
              >
                <Target size={16} />
                Skills
              </ViewButton>
              <ViewButton 
                $active={activeView === 'progress'}
                onClick={() => setActiveView('progress')}
              >
                <TrendingUp size={16} />
                Progress
              </ViewButton>
              <ViewButton 
                $active={activeView === 'insights'}
                onClick={() => setActiveView('insights')}
              >
                <Activity size={16} />
                Insights
              </ViewButton>
            </ViewToggle>
          </HeaderContent>
        </Header>

        <DashboardContent>
          {/* Overview View */}
          {activeView === 'overview' && (
            <>
              {/* Key Metrics */}
              <StatsGrid>
                <StatCard>
                  <StatIcon $color="#3b82f6">
                    <Target size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{totalSkills}</StatValue>
                    <StatLabel>Active Skills</StatLabel>
                    <StatChange $positive>{trendingSkills} trending</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color="#10b981">
                    <TrendingUp size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{averageProficiency}%</StatValue>
                    <StatLabel>Avg. Proficiency</StatLabel>
                    <StatChange $positive>+5% this month</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color="#8b5cf6">
                    <Clock size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>{totalHours}h</StatValue>
                    <StatLabel>Learning Hours</StatLabel>
                    <StatChange $positive>+12h this week</StatChange>
                  </StatContent>
                </StatCard>

                <StatCard>
                  <StatIcon $color="#f59e0b">
                    <Award size={18} />
                  </StatIcon>
                  <StatContent>
                    <StatValue>3</StatValue>
                    <StatLabel>Certifications</StatLabel>
                    <StatChange>1 in progress</StatChange>
                  </StatContent>
                </StatCard>
              </StatsGrid>

              {/* Performance Overview */}
              <MetricsCard>
                <CardContent>
                  <MetricsHeader>
                    <MetricsTitle>Skill Development Overview</MetricsTitle>
                    <MetricsBadge>This Quarter</MetricsBadge>
                  </MetricsHeader>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#475569' }}>Technical Skills</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>82%</span>
                      </div>
                      <ProgressIndicator>
                        <ProgressBar>
                          <ProgressFill $percentage={82} $color="#3b82f6" />
                        </ProgressBar>
                      </ProgressIndicator>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#475569' }}>Business Acumen</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>68%</span>
                      </div>
                      <ProgressIndicator>
                        <ProgressBar>
                          <ProgressFill $percentage={68} $color="#10b981" />
                        </ProgressBar>
                      </ProgressIndicator>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#475569' }}>Leadership</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>75%</span>
                      </div>
                      <ProgressIndicator>
                        <ProgressBar>
                          <ProgressFill $percentage={75} $color="#8b5cf6" />
                        </ProgressBar>
                      </ProgressIndicator>
                    </div>
                  </div>
                </CardContent>
              </MetricsCard>

              {/* Quick Insights */}
              <ContentGrid>
                <Section>
                  <SectionHeader>
                    <SectionTitle>
                      <AlertCircle size={18} />
                      Key Insights
                    </SectionTitle>
                  </SectionHeader>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <InsightCard>
                      <CardContent>
                        <InsightHeader>
                          <InsightIcon>
                            <TrendingUp size={16} />
                          </InsightIcon>
                          <InsightTitle>High-Demand Skill Alert</InsightTitle>
                        </InsightHeader>
                        <InsightText>
                          Data Analytics skills are seeing 45% increased demand in your industry. 
                          Consider prioritizing this area for maximum career impact.
                        </InsightText>
                      </CardContent>
                    </InsightCard>
                  </div>
                </Section>

                <Section>
                  <SectionHeader>
                    <SectionTitle>
                      <BookOpen size={18} />
                      Learning Path
                    </SectionTitle>
                    <ViewAllLink onClick={() => setActiveView('progress')}>
                      View all
                    </ViewAllLink>
                  </SectionHeader>
                  
                  <Card>
                    <CardContent>
                      {learningPath.map((item) => (
                        <TimelineItem key={item.id}>
                          <TimelineIndicator $status={item.status}>
                            {item.status === 'completed' ? (
                              <CheckCircle2 size={16} />
                            ) : item.status === 'in-progress' ? (
                              <Circle size={16} />
                            ) : (
                              <Circle size={16} />
                            )}
                          </TimelineIndicator>
                          <TimelineContent>
                            <TimelineTitle>{item.title}</TimelineTitle>
                            <TimelineDescription>{item.description}</TimelineDescription>
                            <TimelineMeta>
                              {item.completedDate && (
                                <span>Completed {item.completedDate}</span>
                              )}
                              {item.estimatedHours && (
                                <span>{item.estimatedHours} hours</span>
                              )}
                              {item.skillsGained && (
                                <span>{item.skillsGained.length} skills gained</span>
                              )}
                            </TimelineMeta>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </CardContent>
                  </Card>
                </Section>
              </ContentGrid>
            </>
          )}

          {/* Skills View */}
          {activeView === 'skills' && (
            <>
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <Target size={18} />
                    Skills Portfolio
                  </SectionTitle>
                  <ViewAllLink>
                    <Filter size={14} />
                    Filter
                  </ViewAllLink>
                </SectionHeader>
                
                <Grid $minWidth="350px" $gap="1rem">
                  {skills.map((skill) => (
                    <SkillCard key={skill.id} $priority={skill.priority}>
                      <CardContent>
                        <SkillHeader>
                          <SkillInfo>
                            <SkillTitle>{skill.name}</SkillTitle>
                            <SkillCategory>{skill.category}</SkillCategory>
                          </SkillInfo>
                          {skill.trending && (
                            <ArrowUpRight size={20} color="#3b82f6" />
                          )}
                        </SkillHeader>
                        
                        <ProgressIndicator>
                          <ProgressBar>
                            <ProgressFill $percentage={skill.proficiency} />
                          </ProgressBar>
                          <ProgressLabel>{skill.proficiency}%</ProgressLabel>
                        </ProgressIndicator>
                        
                        <SkillMetrics>
                          <Metric>
                            <MetricValue>{skill.marketDemand}%</MetricValue>
                            <MetricLabel>Demand</MetricLabel>
                          </Metric>
                          <Metric>
                            <MetricValue>{skill.learningHours}h</MetricValue>
                            <MetricLabel>Invested</MetricLabel>
                          </Metric>
                          <Metric>
                            <MetricValue>{skill.lastPracticed}</MetricValue>
                            <MetricLabel>Last Active</MetricLabel>
                          </Metric>
                        </SkillMetrics>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <ActionButton $variant="primary">
                            Continue Learning
                          </ActionButton>
                          <ActionButton $variant="secondary">
                            View Details
                          </ActionButton>
                        </div>
                      </CardContent>
                    </SkillCard>
                  ))}
                </Grid>
              </Section>
            </>
          )}

          {/* Progress and Insights views would follow similar professional patterns */}
        </DashboardContent>
        <MarketIntelligenceSystem/>
      </Container>
    </PageWrapper>
  );
}