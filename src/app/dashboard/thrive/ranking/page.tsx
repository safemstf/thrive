// src/app/dashboard/thrive/ranking/page.tsx - Clean version using mock data
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Crown, Star, TrendingUp, Users, 
  Award, Calendar, Clock, Target, Zap, Shield
} from 'lucide-react';

// Import from styled-components hub
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  Card, CardContent, Grid, FlexRow, FlexColumn, Badge, LoadingContainer,
  BaseButton, animationUtils
} from '@/styles/styled-components';

// Import mock data
import {
  MOCK_TOP_PERFORMERS,
  MOCK_ASSESSMENT_LEADERBOARDS, 
  PLATFORM_RANKING_STATS,
  WEEKLY_TRENDING_PERFORMERS
} from '@/data/mockData';

// Import types
import type { TopPerformer } from '@/types/thrive.types';

import styled from 'styled-components';

// ==============================================
// STYLED COMPONENTS USING HUB
// ==============================================

const RankingContainer = styled(PageContainer)`
  background: linear-gradient(135deg, 
    var(--color-background-primary) 0%, 
    var(--color-background-tertiary) 100%
  );
`;

const HeroRankingSection = styled(Section)`
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(59, 130, 246, 0.02) 100%
  );
  border-bottom: 1px solid var(--color-border-light);
  text-align: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LeaderCard = styled(Card)<{ $rank: number }>`
  cursor: pointer;
  transition: all var(--transition-normal);
  background: ${({ $rank }) => {
    if ($rank === 1) return 'linear-gradient(135deg, #fef3c7, #fed7aa)';
    if ($rank === 2) return 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
    if ($rank === 3) return 'linear-gradient(135deg, #fde68a, #f59e0b)';
    return 'var(--color-background-secondary)';
  }};
  border: 2px solid ${({ $rank }) => {
    if ($rank <= 3) return 'rgba(59, 130, 246, 0.2)';
    return 'var(--color-border-light)';
  }};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-500);
  }
  
  animation: ${animationUtils.fadeInUp} 0.6s ease-out ${({ $rank }) => $rank * 0.1}s both;
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin-right: var(--spacing-lg);
  flex-shrink: 0;
  
  background: ${({ $rank }) => {
    if ($rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    if ($rank === 2) return 'linear-gradient(135deg, #d1d5db, #9ca3af)';
    if ($rank === 3) return 'linear-gradient(135deg, #fdba74, #fb923c)';
    return 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))';
  }};
  
  color: ${({ $rank }) => $rank <= 3 ? '#1f2937' : 'white'};
  border: 3px solid var(--color-background-secondary);
  box-shadow: var(--shadow-md);
`;

const StatsCard = styled(Card)`
  text-align: center;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  ${animationUtils.hoverLift(4)}
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-xs);
`;

const CategorySection = styled(Section)`
  background: var(--color-background-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  margin: var(--spacing-xl) 0;
`;

// ==============================================
// HELPER COMPONENTS
// ==============================================

const PerformerCard: React.FC<{ performer: TopPerformer }> = ({ performer }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <LeaderCard $rank={performer.rank}>
      <CardContent>
        <FlexRow $gap="var(--spacing-lg)" $align="center">
          <RankBadge $rank={performer.rank}>
            {performer.rank <= 3 ? 
              ['👑', '🥈', '🥉'][performer.rank - 1] : 
              performer.rank
            }
          </RankBadge>
          
          <img 
            src={performer.profileImage}
            alt={performer.name}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          
          <FlexColumn $gap="0" style={{ flex: 1 }}>
            <FlexRow $gap="var(--spacing-sm)" $align="center">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{performer.name}</h3>
              {performer.verified && (
                <Badge $variant="success">
                  <Shield size={10} />
                  Verified
                </Badge>
              )}
            </FlexRow>
            <BodyText style={{ 
              margin: 0, 
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)' 
            }}>
              @{performer.username} • {performer.specialization}
            </BodyText>
          </FlexColumn>
          
          <FlexColumn $align="end" $gap="var(--spacing-xs)">
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              color: 'var(--color-primary-600)'
            }}>
              {performer.totalScore.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)'
            }}>
              <TrendingUp size={12} />
              +{performer.monthlyGain}
            </div>
          </FlexColumn>
        </FlexRow>
        
        <FlexRow 
          $justify="space-between" 
          style={{ 
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm) 0',
            borderTop: '1px solid var(--color-border-light)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)'
          }}
        >
          <span>{performer.assessmentsCompleted} assessments</span>
          <span>{performer.averageScore}% avg score</span>
          <span>Active {formatDate(performer.lastActive)}</span>
        </FlexRow>
      </CardContent>
    </LeaderCard>
  );
};

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function RankingPage() {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <RankingContainer>
        <LoadingContainer>
          <Trophy size={48} />
          <BodyText>Loading rankings...</BodyText>
        </LoadingContainer>
      </RankingContainer>
    );
  }

  return (
    <RankingContainer>
      <ContentWrapper>
        {/* Hero Section */}
        <HeroRankingSection>
          <Badge style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Trophy size={16} />
            Global Rankings
            <Crown size={12} style={{ marginLeft: 'var(--spacing-xs)' }} />
          </Badge>

          <Heading1 $responsive>
            Top Professional <span style={{ 
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Performers</span>
          </Heading1>

          <BodyText $size="lg" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            Celebrating the highest-achieving professionals in our community
          </BodyText>

          {/* Platform Stats */}
          <Grid $columns={4} $gap="var(--spacing-lg)" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <StatsCard>
              <CardContent>
                <StatNumber>{PLATFORM_RANKING_STATS.totalParticipants.toLocaleString()}</StatNumber>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Total Participants
                </BodyText>
              </CardContent>
            </StatsCard>
            <StatsCard>
              <CardContent>
                <StatNumber>{PLATFORM_RANKING_STATS.activeThisWeek.toLocaleString()}</StatNumber>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Active This Week
                </BodyText>
              </CardContent>
            </StatsCard>
            <StatsCard>
              <CardContent>
                <StatNumber>{PLATFORM_RANKING_STATS.averageScore}%</StatNumber>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Average Score
                </BodyText>
              </CardContent>
            </StatsCard>
            <StatsCard>
              <CardContent>
                <StatNumber>{PLATFORM_RANKING_STATS.completionsToday}</StatNumber>
                <BodyText style={{ margin: 0, fontSize: '0.875rem' }}>
                  Completed Today
                </BodyText>
              </CardContent>
            </StatsCard>
          </Grid>
        </HeroRankingSection>

        {/* Top Performers */}
        <Section>
          <FlexRow $justify="space-between" $align="center" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div>
              <Heading2>🏆 Hall of Champions</Heading2>
              <BodyText style={{ margin: 0 }}>
                The top 5 performers across all assessments
              </BodyText>
            </div>
            <BaseButton $variant="secondary">
              View Full Leaderboard
            </BaseButton>
          </FlexRow>

          <FlexColumn $gap="var(--spacing-md)">
            {MOCK_TOP_PERFORMERS.slice(0, 5).map((performer) => (
              <PerformerCard key={performer.id} performer={performer} />
            ))}
          </FlexColumn>
        </Section>

        {/* Weekly Trending */}
        <Section>
          <Heading2>🔥 Weekly Trending</Heading2>
          <BodyText style={{ marginBottom: 'var(--spacing-xl)' }}>
            Biggest point gainers this week
          </BodyText>

          <Grid $columns={3} $gap="var(--spacing-lg)">
            {WEEKLY_TRENDING_PERFORMERS.map((performer, index) => (
              <Card key={performer.id}>
                <CardContent>
                  <FlexRow $gap="var(--spacing-md)" $align="center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <FlexColumn $gap="0" style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{performer.name}</h4>
                      <BodyText style={{ 
                        margin: 0, 
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)' 
                      }}>
                        @{performer.username}
                      </BodyText>
                    </FlexColumn>
                  </FlexRow>
                  <FlexRow $justify="space-between" style={{ marginTop: 'var(--spacing-md)' }}>
                    <div style={{ color: '#059669', fontWeight: 'bold' }}>
                      +{performer.weeklyGain} points
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {performer.assessmentsThisWeek} assessments
                    </div>
                  </FlexRow>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Assessment-Specific Leaderboards */}
        <CategorySection>
          <ContentWrapper>
            <Heading2>Assessment Leaderboards</Heading2>
            <BodyText style={{ marginBottom: 'var(--spacing-xl)' }}>
              Top performers in specific skill assessments
            </BodyText>

            <Grid $columns={2} $gap="var(--spacing-xl)">
              {MOCK_ASSESSMENT_LEADERBOARDS.map((assessment) => (
                <Card key={assessment.assessmentId}>
                  <CardContent>
                    <FlexRow $justify="space-between" $align="center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <div>
                        <h3 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                          {assessment.title}
                        </h3>
                        <Badge>{assessment.category}</Badge>
                      </div>
                      <Medal size={24} color="var(--color-primary-500)" />
                    </FlexRow>

                    <FlexColumn $gap="var(--spacing-md)">
                      {assessment.leaders.slice(0, 5).map((leader) => (
                        <FlexRow 
                          key={leader.rank} 
                          $justify="space-between" 
                          $align="center"
                          style={{
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-sm)',
                            background: leader.rank === 1 ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                          }}
                        >
                          <FlexRow $gap="var(--spacing-sm)" $align="center">
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: leader.rank === 1 ? 
                                'linear-gradient(135deg, #fbbf24, #f59e0b)' : 
                                'var(--color-background-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              color: leader.rank === 1 ? 'white' : 'var(--color-text-primary)'
                            }}>
                              {leader.rank}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                {leader.name}
                              </div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--color-text-secondary)' 
                              }}>
                                @{leader.username}
                              </div>
                            </div>
                          </FlexRow>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: '1rem', 
                              fontWeight: 'bold',
                              color: 'var(--color-primary-600)'
                            }}>
                              {leader.score}%
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--color-text-secondary)' 
                            }}>
                              {leader.timeSpent}m
                            </div>
                          </div>
                        </FlexRow>
                      ))}
                    </FlexColumn>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </ContentWrapper>
        </CategorySection>
      </ContentWrapper>
    </RankingContainer>
  );
}