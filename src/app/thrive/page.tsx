// src/app/thrive/page.tsx - Fixed Double Scroll Issue
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, TrendingUp, Users, Trophy, Star, Code, Brain,
  Calculator, Lightbulb, BarChart3, Activity, Shield,
  ArrowRight, CheckCircle, Timer, Sparkles, Award, Lock,
  Globe, Loader2, Eye, Crown, Zap
} from 'lucide-react';

// Import from styled-components hub
import {
  PageContainer, ContentWrapper, Section, Heading1, Heading2, BodyText,
  BaseButton, Card, CardContent, Grid, FlexRow, FlexColumn, Badge,
  LoadingContainer, HeroSection
} from '@/styles/styled-components';

// Import utilities
import { utils } from '@/utils';
import styled from 'styled-components';

// ==============================================
// FIXED SCROLL COMPONENTS
// ==============================================

const ScrollFixContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto; /* Only this container should scroll */
  
  /* Reset any default margins/padding */
  & > * {
    margin-top: 0;
  }
`;

const FixedPageContainer = styled(PageContainer)`
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  overflow: visible; /* Don't create another scroll context */
  position: relative;
  
  /* Ensure no additional margins or padding */
  box-sizing: border-box;
  
  /* Ensure theme variables are inherited */
  color: var(--color-text-primary);
  background: var(--color-background-primary);
`;

// ==============================================
// TYPES & MOCK DATA
// ==============================================

interface Assessment {
  id: string;
  title: string;
  description: string;
  skillType: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  duration: number;
  participants: number;
  averageScore: number;
  route: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  verified: boolean;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: 'frontend-dev',
    title: 'Frontend Development',
    description: 'React, JavaScript, HTML/CSS proficiency assessment',
    skillType: 'code',
    difficulty: 'intermediate',
    duration: 45,
    participants: 15420,
    averageScore: 73,
    route: '/thrive/frontend'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Python, SQL, statistical analysis skills',
    skillType: 'analytics',
    difficulty: 'expert',
    duration: 60,
    participants: 8930,
    averageScore: 68,
    route: '/thrive/data'
  },
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'Agile, leadership, communication skills',
    skillType: 'management',
    difficulty: 'intermediate',
    duration: 30,
    participants: 12850,
    averageScore: 81,
    route: '/thrive/pm'
  },
  {
    id: 'ux-design',
    title: 'UX Design',
    description: 'User research, prototyping, design thinking',
    skillType: 'design',
    difficulty: 'intermediate',
    duration: 40,
    participants: 7200,
    averageScore: 76,
    route: '/thrive/ux'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'SEO, social media, analytics, campaign management',
    skillType: 'marketing',
    difficulty: 'beginner',
    duration: 35,
    participants: 9840,
    averageScore: 79,
    route: '/thrive/marketing'
  },
  {
    id: 'cloud-architecture',
    title: 'Cloud Architecture',
    description: 'AWS, Azure, infrastructure design',
    skillType: 'cloud',
    difficulty: 'expert',
    duration: 75,
    participants: 5420,
    averageScore: 65,
    route: '/thrive/cloud'
  }
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex Chen', score: 12450, verified: true },
  { rank: 2, name: 'Sarah Johnson', score: 11920, verified: true },
  { rank: 3, name: 'Mike Rodriguez', score: 11680, verified: false },
  { rank: 4, name: 'Emily Davis', score: 10980, verified: true },
  { rank: 5, name: 'James Wilson', score: 10540, verified: false },
  { rank: 6, name: 'Lisa Zhang', score: 10120, verified: true },
  { rank: 7, name: 'David Park', score: 9850, verified: false },
  { rank: 8, name: 'Anna Kim', score: 9420, verified: true }
];

const PLATFORM_STATS = {
  verifiedProfessionals: 45230,
  activeSessions: 342,
  employerTrust: 94,
  completedToday: 156
};

// ==============================================
// ENHANCED STYLED COMPONENTS (better polish)
// ==============================================

const EnhancedHeroSection = styled(HeroSection)`
  background: ${utils.theme.generateGradient(false, 'subtle')};
  position: relative;
  overflow: hidden;
  margin: 0; /* Remove any default margins */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const StatsGrid = styled(Grid)`
  margin: var(--spacing-2xl) 0;
`;

const StatCard = styled(Card)`
  text-align: center;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-glass);
  ${utils.animation.hoverLift(4, 'var(--shadow-md)')}
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-display);
`;

const AssessmentCard = styled(Card)`
  cursor: pointer;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  ${utils.animation.hoverLift(8, 'var(--shadow-lg)')}
  ${utils.component.interactiveProps}
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover .lock-icon {
    transform: scale(1.1);
    color: var(--color-primary-500);
  }
`;

const SkillIcon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const gradients = {
      code: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      analytics: 'linear-gradient(135deg, #10b981, #059669)',
      management: 'linear-gradient(135deg, #f59e0b, #d97706)',
      design: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      marketing: 'linear-gradient(135deg, #ef4444, #dc2626)',
      cloud: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    };
    return gradients[props.$type as keyof typeof gradients] || gradients.code;
  }};
  color: white;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  ${utils.animation.hoverLift(2)}
`;

const DifficultyBadge = styled(Badge)<{ $difficulty: string }>`
  background: ${props => {
    const colors = {
      beginner: 'linear-gradient(135deg, #10b981, #059669)',
      intermediate: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      expert: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };
    return colors[props.$difficulty as keyof typeof colors] || '#6b7280';
  }};
  color: white;
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GlassSection = styled(Section)`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  margin: var(--spacing-3xl) 0;
  padding: var(--spacing-3xl) var(--spacing-xl);
`;

const LeaderboardCard = styled(Card)`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
`;

const LeaderboardItem = styled(FlexRow)<{ $rank: number }>`
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background: ${props => props.$rank <= 3 ? 'var(--glass-background)' : 'transparent'};
  border: 1px solid ${props => props.$rank <= 3 ? 'var(--glass-border)' : 'transparent'};
  margin-bottom: var(--spacing-md);
  transition: var(--transition-normal);
  
  &:hover {
    background: var(--glass-background);
    border-color: var(--glass-border);
    transform: translateY(-2px);
  }
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #9ca3af, #6b7280)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #d97706, #92400e)';
    return 'var(--color-background-tertiary)';
  }};
  color: ${props => props.$rank <= 3 ? 'white' : 'var(--color-text-primary)'};
  margin-right: var(--spacing-lg);
  box-shadow: ${props => props.$rank <= 3 ? 'var(--shadow-md)' : 'var(--shadow-sm)'};
`;

const CTASection = styled(GlassSection)`
  text-align: center;
  background: linear-gradient(135deg, var(--glass-background), rgba(59, 130, 246, 0.05));
  margin-bottom: 0; 

`;

// ==============================================
// HELPER COMPONENTS
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

const SkillIconComponent: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    code: Code,
    analytics: BarChart3,
    management: Users,
    design: Lightbulb,
    marketing: TrendingUp,
    cloud: Globe
  };
  
  const Icon = icons[type as keyof typeof icons] || Code;
  return <Icon size={24} />;
};

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function ThrivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAccount = useCallback(() => {
    router.push('/auth/register?redirect=/dashboard/thrive');
  }, [router]);

  const handleSignIn = useCallback(() => {
    router.push('/auth/login?redirect=/dashboard/thrive');
  }, [router]);

  const handleAssessmentClick = useCallback((assessment: Assessment) => {
    router.push(`/auth/register?redirect=${assessment.route}&assessment=${assessment.title}`);
  }, [router]);

  if (loading) {
    return (
      <ScrollFixContainer>
        <FixedPageContainer>
          <LoadingContainer>
            <Loader2 size={48} className="animate-spin" />
            <BodyText>Loading skills assessments...</BodyText>
          </LoadingContainer>
        </FixedPageContainer>
      </ScrollFixContainer>
    );
  }

  return (
    <ScrollFixContainer>
      <FixedPageContainer>
        {/* Hero Section */}
        <EnhancedHeroSection>
          <ContentWrapper>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              <Badge style={{ marginBottom: 'var(--spacing-lg)' }}>
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
                standardized, employer-trusted assessment platform.
              </BodyText>

              {/* Stats */}
              <StatsGrid $columns={3} $gap="var(--spacing-lg)">
                <StatCard>
                  <CardContent>
                    <StatNumber>
                      <AnimatedCounter value={PLATFORM_STATS.verifiedProfessionals} />
                    </StatNumber>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      Professionals Certified
                    </div>
                  </CardContent>
                </StatCard>
                <StatCard>
                  <CardContent>
                    <FlexRow $justify="center" $gap="var(--spacing-xs)" style={{ marginBottom: 'var(--spacing-sm)' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: '#10b981',
                        animation: `${utils.animation.loadingPulse} 2s infinite`
                      }} />
                      <span style={{ fontSize: '0.875rem', color: '#10b981' }}>LIVE</span>
                    </FlexRow>
                    <StatNumber>
                      <AnimatedCounter value={PLATFORM_STATS.activeSessions} duration={1500} />
                    </StatNumber>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      Taking Assessments Now
                    </div>
                  </CardContent>
                </StatCard>
                <StatCard>
                  <CardContent>
                    <StatNumber>
                      <AnimatedCounter value={PLATFORM_STATS.employerTrust} />%
                    </StatNumber>
                    <div style={{ color: 'var(--color-text-secondary)' }}>
                      Employer Trust Rate
                    </div>
                  </CardContent>
                </StatCard>
              </StatsGrid>

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
            <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <BarChart3 size={28} />
              <Heading2 style={{ margin: 0 }}>Choose Your Professional Assessment</Heading2>
            </FlexRow>
            <BodyText style={{ marginBottom: 'var(--spacing-2xl)' }}>
              Click any assessment to start your certification journey
            </BodyText>

            <Grid $minWidth="350px">
              {MOCK_ASSESSMENTS.map((assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  onClick={() => handleAssessmentClick(assessment)}
                  $padding="lg"
                >
                  <SkillIcon $type={assessment.skillType}>
                    <SkillIconComponent type={assessment.skillType} />
                  </SkillIcon>

                  <h3 style={{ margin: '0 0 var(--spacing-sm)', fontSize: '1.25rem' }}>
                    {assessment.title}
                  </h3>
                  
                  <p style={{ 
                    margin: '0 0 var(--spacing-md)', 
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5
                  }}>
                    {assessment.description}
                  </p>

                  <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <DifficultyBadge $difficulty={assessment.difficulty}>
                      {assessment.difficulty}
                    </DifficultyBadge>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {assessment.duration} min
                    </span>
                  </FlexRow>

                  <FlexRow $justify="space-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}>
                      <Users size={14} />
                      {utils.data.formatNumber(assessment.participants)} certified
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}>
                      <TrendingUp size={14} />
                      {assessment.averageScore}% avg
                    </span>
                  </FlexRow>

                  <div style={{ 
                    background: 'var(--color-background-tertiary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <FlexRow $gap="var(--spacing-sm)">
                      <Lock size={16} className="lock-icon" style={{ transition: 'var(--transition-normal)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Start Assessment</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Sign up required
                        </div>
                      </div>
                    </FlexRow>
                    <ArrowRight size={16} />
                  </div>
                </AssessmentCard>
              ))}
            </Grid>
          </Section>

          {/* Leaderboard Section */}
          <Section>
            <FlexRow $gap="var(--spacing-sm)" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <Trophy size={28} />
              <Heading2 style={{ margin: 0 }}>Global Professional Leaderboard</Heading2>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#10b981',
                animation: `${utils.animation.loadingPulse} 2s infinite`
              }} />
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
                  {MOCK_LEADERBOARD.map((player) => (
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
                          {utils.data.formatNumber(player.score)} points
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

              <Card style={{ background: 'var(--glass-background)', textAlign: 'center' }}>
                <CardContent>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)', 
                    marginBottom: 'var(--spacing-md)' 
                  }}>
                    <Award size={24} color="#f59e0b" />
                    <Badge style={{ background: '#f59e0b', color: 'white' }}>JOIN NOW</Badge>
                  </div>
                  
                  <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Your Name Could Be Here</h3>
                  
                  <p style={{ 
                    marginBottom: 'var(--spacing-lg)', 
                    color: 'var(--color-text-secondary)' 
                  }}>
                    Complete assessments to earn points and climb the leaderboard.
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
              <Card>
                <CardContent>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <Activity size={24} color="white" />
                  </div>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Real-time Analytics</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Get instant insights with AI-powered analysis and industry benchmarking.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <Shield size={24} color="white" />
                  </div>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Verified Credentials</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Blockchain-verified certificates that employers can instantly verify.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <TrendingUp size={24} color="white" />
                  </div>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Market-Relevant</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Continuously updated assessments reflecting current industry demands.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <Globe size={24} color="white" />
                  </div>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Global Recognition</h3>
                  <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Accepted by 500+ companies worldwide including Fortune 500 firms.
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </Section>

          {/* Final CTA */}
          <CTASection>
            <ContentWrapper>
              <Heading2>Ready to Prove Your Professional Skills?</Heading2>
              <BodyText $size="lg" style={{ marginBottom: 'var(--spacing-xl)' }}>
                Join 23,000+ professionals who have advanced their careers with verified skill certifications.
              </BodyText>

              <BaseButton 
                $variant="primary" 
                $size="lg"
                onClick={handleCreateAccount}
              >
                <Target size={20} />
                Start Assessment
              </BaseButton>
            </ContentWrapper>
          </CTASection>
        </ContentWrapper>
      </FixedPageContainer>
    </ScrollFixContainer>
  );
}