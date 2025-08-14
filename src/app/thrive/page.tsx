// src/app/thrive/page.tsx - FIXED VERSION
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, TrendingUp, Users, Trophy, Star, Code, Brain,
  MessageSquare, Calculator, Lightbulb, BarChart3, Activity, Shield,
  ArrowRight, CheckCircle, Timer, Sparkles, Award, Lock, ChevronRight,
  Globe, Loader2, Zap
} from 'lucide-react';

import { Assessment, LeaderboardEntry, PlatformStats } from '@/types/thrive.types';
import { ASSESSMENTS, ASSESSMENT_CATEGORIES } from '@/data/thrive-assessments';

import {
  PageWrapper, HeroSection, HeroTitle, HeroSubtitle, StatsContainer,
  StatItem, StatValue, StatLabel, CTAButtons, PrimaryButton,
  SecondaryButton, GlassSection, SectionTitle, CardsGrid,
  AssessmentCard, CardHeader, CardIcon, CardContent, CardTitle,
  CardDescription, CardMetrics, MetricItem, MetricLabel,
  LeaderboardSection, LeaderboardList, LeaderboardItem, RankBadge,
  PlayerInfo, PlayerName, PlayerScore, FeatureGrid, FeatureCard,
  FeatureIcon, CTASection, CTATitle, CTADescription, SecurityFeatures,
  SecurityFeature, HeroBadge, CardFooter, ActionCard, BenefitsList,
  BenefitItem, LiveIndicator, TrustBadge, GradientText, FloatingCard
} from './styles';

// Simple animated counter component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const incrementTime = duration / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// Skill icon component
const SkillIcon = ({ skillType, size = 24 }: { skillType: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    'critical-thinking': <Brain size={size} />,
    'linguistic': <MessageSquare size={size} />,
    'technical': <Code size={size} />,
    'analytical': <Calculator size={size} />,
    'creative': <Lightbulb size={size} />,
    'rapid-reasoning': <Zap size={size} />
  };
  
  return icons[skillType] || <Brain size={size} />;
};

// Main component
export default function ThrivePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate platform stats from assessments data
  const platformStats = useMemo<PlatformStats>(() => {
    const verifiedProfessionals = ASSESSMENTS.reduce((sum, a) => sum + (a.participants || 0), 0);
    const activeSessions = Math.floor(Math.random() * 400) + 100;
    
    // Calculate average employer trust safely
    const totalTrust = ASSESSMENTS.reduce((sum, a) => sum + (a.employerTrust || 0), 0);
    const employerTrust = Math.round(totalTrust / ASSESSMENTS.length);
    
    // Calculate completed today (random but proportional to participants)
    const completedToday = Math.floor(verifiedProfessionals * 0.01) + 50;
    
    return { 
      verifiedProfessionals, 
      activeSessions, 
      employerTrust, 
      completedToday 
    };
  }, []);

  // Generate leaderboard data
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const names = [
      'Alex Johnson', 'Taylor Smith', 'Jordan Williams', 
      'Casey Brown', 'Riley Davis', 'Morgan Miller',
      'Jamie Garcia', 'Quinn Rodriguez', 'Avery Martinez',
      'Skyler Wilson', 'Cameron Taylor', 'Reese Anderson',
      'Peyton Thomas', 'Dakota Jackson', 'Emerson White'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      name: names[i % names.length],
      score: Math.floor(Math.random() * 10000) + 5000,
      verified: i % 3 === 0  // every 3rd player is verified
    })).sort((a, b) => b.score - a.score);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateAccount = () => {
    router.push('/auth/register?redirect=/dashboard/thrive');
  };

  const handleSignIn = () => {
    router.push('/auth/login?redirect=/dashboard/thrive');
  };

  const handleAssessmentClick = (assessment: Assessment) => {
    router.push(`/auth/register?redirect=${assessment.route}&assessment=${assessment.title}`);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem'
        }}>
          <Loader2 size={48} className="animate-spin" />
          <p style={{ color: '#6b7280' }}>Loading assessments...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroBadge>
          <Sparkles size={16} />
          <span>Trusted by 500+ Fortune Companies</span>
          <TrustBadge>
            <Shield size={12} />
            Verified
          </TrustBadge>
        </HeroBadge>

        <HeroTitle>
          Prove Your Professional Skills with
          <GradientText> Industry-Recognized</GradientText> Assessments
        </HeroTitle>

        <HeroSubtitle>
          Join thousands of professionals who have validated their capabilities through our standardized,
          employer-trusted assessment platform. Get certified, stand out, get hired.
        </HeroSubtitle>

        <StatsContainer>
          <StatItem>
            <StatValue>
              <AnimatedCounter value={platformStats.verifiedProfessionals} />
            </StatValue>
            <StatLabel>Professionals Certified</StatLabel>
          </StatItem>
          <StatItem>
            <LiveIndicator />
            <StatValue>
              <AnimatedCounter value={platformStats.activeSessions} duration={1500} />
            </StatValue>
            <StatLabel>Taking Assessments Now</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>
              <AnimatedCounter value={platformStats.employerTrust} />%
            </StatValue>
            <StatLabel>Employer Trust Rate</StatLabel>
          </StatItem>
        </StatsContainer>

        <CTAButtons>
          <PrimaryButton
            onClick={handleCreateAccount}
            aria-label="Create account and start assessment"
          >
            <Target size={18} />
            Start Assessment
          </PrimaryButton>
          <SecondaryButton
            onClick={handleSignIn}
            aria-label="Sign in"
          >
            Sign In
          </SecondaryButton>
        </CTAButtons>

        <BenefitsList>
          <BenefitItem>
            <CheckCircle size={16} color="#10b981" />
            <span>Free to start • Instant results • Industry recognized</span>
          </BenefitItem>
        </BenefitsList>
      </HeroSection>

      {/* Assessments Section */}
      <GlassSection>
        <SectionTitle>
          <BarChart3 size={28} />
          Choose Your Professional Assessment
          <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '1rem' }}>
            Click any assessment to start your certification journey
          </span>
        </SectionTitle>

        <CardsGrid role="list" aria-label="Available assessments">
          {ASSESSMENTS.map((assessment) => {
            const category = ASSESSMENT_CATEGORIES.find(c => c.id === assessment.skillType);
            const skillColor = category?.color || 'linear-gradient(135deg, #1e293b, #374151)';
            
            const difficultyColors: Record<string, string> = {
              'beginner': '#10b981',
              'novice': '#10b981',
              'intermediate': '#f59e0b',
              'expert': '#ef4444',
              'master': '#8b5cf6'
            };
            
            const difficultyColor = difficultyColors[assessment.difficulty] || '#6b7280';

            return (
              <AssessmentCard
                key={assessment.id}
                $color={skillColor}
                onClick={() => handleAssessmentClick(assessment)}
              >
                <CardHeader>
                  <CardIcon $color={skillColor}>
                    <SkillIcon skillType={assessment.skillType} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardContent>
                </CardHeader>

                <CardMetrics>
                  <MetricItem>
                    <MetricLabel>
                      <Users size={14} />
                      {(assessment.participants ?? 0).toLocaleString()} certified
                    </MetricLabel>
                    <MetricLabel>
                      <Timer size={14} />
                      {assessment.duration} minutes
                    </MetricLabel>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel style={{ color: difficultyColor }}>
                      <Target size={14} />
                      {assessment.difficulty.charAt(0).toUpperCase() + assessment.difficulty.slice(1)} Level
                    </MetricLabel>
                    <MetricLabel>
                      <TrendingUp size={14} />
                      {assessment.averageScore}% avg score
                    </MetricLabel>
                  </MetricItem>
                </CardMetrics>

                <CardFooter>
                  <ActionCard onClick={(e) => { e.stopPropagation(); handleAssessmentClick(assessment); }}>
                    <Lock size={16} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Start Assessment</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sign up required</div>
                    </div>
                    <ArrowRight size={16} />
                  </ActionCard>
                </CardFooter>
              </AssessmentCard>
            );
          })}
        </CardsGrid>
      </GlassSection>

      {/* Leaderboard Section */}
      <GlassSection>
        <SectionTitle>
          <Trophy size={28} />
          Join the Global Professional Leaderboard
          <LiveIndicator aria-hidden="false" aria-live="polite" />
        </SectionTitle>

        <LeaderboardSection>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap', // Better mobile support
            gap: '1rem'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Star size={20} color="#f59e0b" />
              This Week's Top Performers
            </h3>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              flexWrap: 'wrap' // Better mobile wrapping
            }}>
              <Globe size={14} /> 
              Live rankings • Updated hourly
              <span style={{ 
                color: '#10b981', 
                fontWeight: '500',
                marginLeft: '0.5rem'
              }}>
                • {leaderboard.length.toLocaleString()} participants
              </span>
            </div>
          </div>

          <LeaderboardList role="list" aria-label="Leaderboard">
            {leaderboard.map((player) => {
              // Enhanced weekly gain calculation - more realistic based on rank
              const baseGain = Math.max(5, 60 - (player.rank * 3));
              const variance = Math.floor(Math.random() * 20 - 10);
              const weeklyGain = Math.max(1, baseGain + variance);
              
              // Enhanced rank display with medals for top 3
              const getRankDisplay = (rank: number) => {
                switch (rank) {
                  case 1: return '🥇';
                  case 2: return '🥈'; 
                  case 3: return '🥉';
                  default: return rank.toString();
                }
              };
              
              return (
                <LeaderboardItem 
                  key={player.rank} 
                  $rank={player.rank}
                  style={{
                    // Add subtle animation on hover
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <RankBadge 
                    $rank={player.rank}
                    style={{
                      // Enhanced styling for top 3
                      background: player.rank <= 3 ? 
                        'linear-gradient(135deg, #f59e0b, #d97706)' : 
                        undefined,
                      fontSize: player.rank <= 3 ? '1.1rem' : undefined,
                      fontWeight: player.rank <= 3 ? '700' : undefined
                    }}
                  >
                    {getRankDisplay(player.rank)}
                  </RankBadge>
                  
                  <PlayerInfo>
                    <PlayerName>
                      {player.name}
                      {player.verified && (
                        <TrustBadge>
                          <Shield size={12} />
                          Verified
                        </TrustBadge>
                      )}
                      {/* Add specialty badge for top performers */}
                      {player.rank <= 3 && (
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          marginLeft: '0.5rem',
                          fontWeight: '500'
                        }}>
                          Top Performer
                        </span>
                      )}
                    </PlayerName>
                    <PlayerScore>
                      {player.score.toLocaleString()} points earned
                      {/* Add progress indicator for visual interest */}
                      <div style={{
                        width: '100%',
                        height: '2px',
                        background: '#e5e7eb',
                        borderRadius: '1px',
                        marginTop: '0.25rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(100, (player.score / Math.max(...leaderboard.map(p => p.score))) * 100)}%`,
                          height: '100%',
                          background: player.rank <= 3 ? 
                            'linear-gradient(90deg, #f59e0b, #d97706)' : 
                            'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </PlayerScore>
                  </PlayerInfo>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#059669', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      justifyContent: 'flex-end'
                    }}>
                      <TrendingUp size={14} />
                      +{weeklyGain} this week
                    </div>
                    {/* Add streak indicator for engagement */}
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      {Math.floor(Math.random() * 7) + 1} day streak
                    </div>
                  </div>
                </LeaderboardItem>
              );
            })}
          </LeaderboardList>

          {/* Enhanced floating card with better visual hierarchy */}
          <FloatingCard style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Award size={24} color="#f59e0b" />
              <span style={{ 
                fontSize: '0.75rem', 
                background: '#f59e0b',
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                JOIN NOW
              </span>
            </div>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              Your Name Could Be Here
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
              Complete assessments to earn points and climb the leaderboard.
              <strong style={{ color: '#059669', display: 'block', marginTop: '0.25rem' }}>
                Next assessment: +{Math.floor(Math.random() * 500) + 100} points
              </strong>
            </div>
            <PrimaryButton
              onClick={handleCreateAccount}
              style={{ 
                width: 'auto',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
              }}
            >
              Start Earning Points
              <ChevronRight size={16} />
            </PrimaryButton>
            
            {/* Add social proof */}
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <Users size={12} />
              {Math.floor(Math.random() * 50) + 20} people joined this week
            </div>
          </FloatingCard>
        </LeaderboardSection>
      </GlassSection>

      {/* Features Section */}
      <GlassSection>
        <SectionTitle>
          <Shield size={28} />
          Trusted by Industry Leaders Worldwide
        </SectionTitle>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon><Activity size={24} /></FeatureIcon>
            <CardTitle>Real-time Performance Analytics</CardTitle>
            <CardDescription>
              Get instant detailed insights into your performance with AI-powered analysis and industry benchmarking.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><Shield size={24} /></FeatureIcon>
            <CardTitle>Blockchain-Verified Credentials</CardTitle>
            <CardDescription>
              Tamper-proof digital certificates that employers can instantly verify, preventing credential fraud.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><TrendingUp size={24} /></FeatureIcon>
            <CardTitle>Market-Relevant Assessments</CardTitle>
            <CardDescription>
              Continuously updated assessments reflecting current industry demands and emerging skill requirements.
            </CardDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon><Globe size={24} /></FeatureIcon>
            <CardTitle>Global Recognition</CardTitle>
            <CardDescription>
              Accepted by 500+ companies worldwide including Fortune 500 companies across all major industries.
            </CardDescription>
          </FeatureCard>
        </FeatureGrid>
      </GlassSection>

      {/* Final CTA Section */}
      <CTASection>
        <CTATitle>Ready to Prove Your Professional Skills?</CTATitle>
        <CTADescription>
          Join 23,000+ professionals who have advanced their careers with verified skill certifications.
        </CTADescription>

        <CTAButtons>
          <PrimaryButton
            onClick={handleCreateAccount}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            <Target size={20} />
            Start Assessment
          </PrimaryButton>
        </CTAButtons>

        <SecurityFeatures>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Free to start</SecurityFeature>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Instant results</SecurityFeature>
          <SecurityFeature><CheckCircle size={16} color="#10b981" /> Industry recognized</SecurityFeature>
        </SecurityFeatures>
      </CTASection>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        /* Respect reduced-motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </PageWrapper>
  );
}