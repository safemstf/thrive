// Note: Ensure 'Cormorant Garamond' font is imported in your layout or _document file:
// <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet">

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Target, TrendingUp, Users, Trophy, Star, CheckCircle,
  ArrowRight, Shield, Globe, Loader2, Activity, Award,
  Lock, Sparkles, Timer, Brain, AlertCircle, Lightbulb,
  Heart, Zap, BarChart3, Compass, ChevronRight, Building2,
  GraduationCap, Briefcase, LineChart, UserCheck, FileCheck
} from 'lucide-react';

import {
  PROFESSIONAL_ASSESSMENTS,
  PSYCHOLOGICAL_ASSESSMENTS,
  CREATIVITY_ASSESSMENTS,
} from '@/data/mockData';

import type { Assessment } from '@/data/mockData';

import {
  ThriveProvider,
  useThrive,
  formatNumber
} from '@/components/thrive/thriveLogic';


type AssessmentCategory = 'professional' | 'psychological' | 'creativity';

/* ---------------------------
   Animations - Subtle & Professional
   --------------------------- */
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const progressPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

/* ---------------------------
   Page Layout - Clean & Professional
   --------------------------- */
const PageContainer = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg, 
    #ffffff 0%,
    #f8fafc 50%,
    #f1f5f9 100%
  );
  color: #1e293b;
  position: relative;
`;

const ContentWrapper = styled.div`
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 1.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

/* ---------------------------
   Hero Section - Professional & Clean
   --------------------------- */
const HeroSection = styled.section`
  text-align: center;
  padding: 2rem 0 4rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 600;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 1.5rem;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  .accent {
    background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  color: #64748b;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const PrimaryButton = styled.button`
  padding: 0.875rem 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.875rem 2rem;
  border-radius: 12px;
  background: white;
  border: 2px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }
`;

/* ---------------------------
   Value Props - Professional Stats
   --------------------------- */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin: 4rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border-color: #cbd5e1;
  }
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

/* ---------------------------
   Assessment Categories - Professional Tabs
   --------------------------- */
const CategorySection = styled.section`
  margin: 6rem 0;
`;

const CategoryHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const CategoryTitle = styled.h2`
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
`;

const CategorySubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
`;

const CategoryTabs = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.25rem;
  max-width: 600px;
  margin: 0 auto 3rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, #3b82f6, #0ea5e9)' : 'transparent'};
  border: none;
  color: ${({ $active }) => $active ? 'white' : '#64748b'};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ $active }) => 
    $active
      ? 'linear-gradient(135deg, #3b82f6, #0ea5e9)'
      : '#f8fafc'
  };
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

/* ---------------------------
   Assessment Cards - Professional Grid
   --------------------------- */
const AssessmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const AssessmentCard = styled.div<{ $featured?: boolean }>`
  background: white;
  border: 2px solid ${({ $featured }) => $featured ? '#3b82f6' : '#e2e8f0'};
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  ${({ $featured }) => $featured && `
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    
    &::before {
      content: 'RECOMMENDED';
      position: absolute;
      top: 1rem;
      right: -2rem;
      background: linear-gradient(135deg, #3b82f6, #0ea5e9);
      color: white;
      padding: 0.25rem 3rem;
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      transform: rotate(45deg);
    }
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CardIcon = styled.div<{ $color: 'blue' | 'purple' | 'green' | 'amber' }>`
  width: 48px;
  height: 48px;
  background: ${({ $color }) => {
    const colors: Record<'blue'|'purple'|'green'|'amber', string> = {
      blue: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      purple: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
      green: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
      amber: 'linear-gradient(135deg, #fef3c7, #fde68a)'
    };
    return colors[$color] ?? colors.blue;
  }};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: ${({ $color }) => {
    const colors: Record<'blue'|'purple'|'green'|'amber', string> = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      green: '#10b981',
      amber: '#f59e0b'
    };
    return colors[$color] ?? colors.blue;
  }};
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #64748b;

  svg {
    width: 16px;
    height: 16px;
  }

  strong {
    color: #1e293b;
    font-weight: 600;
  }
`;

/* ---------------------------
   Trust Section
   --------------------------- */
const TrustSection = styled.section`
  background: white;
  border-radius: 24px;
  padding: 4rem;
  margin: 6rem 0;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const TrustTitle = styled.h2`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
`;

const TrustLogos = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin: 2rem 0;
  opacity: 0.6;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const TrustLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #94a3b8;
  font-size: 1.125rem;
`;

/* ---------------------------
   Loading State
   --------------------------- */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  
  svg {
    animation: spin 1s linear infinite;
    color: #3b82f6;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/* ---------------------------
   Modal (Waiver) Styles
   --------------------------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: min(720px, 95%);
  box-shadow: 0 30px 60px rgba(2,6,23,0.2);
`;

const ModalActions = styled.div`
  display:flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

/* ---------------------------
   Main Component
   --------------------------- */
const PublicContent = () => {
  const [loading, setLoading] = useState(true);
  const [assessmentCategory, setAssessmentCategory] = useState<AssessmentCategory>('professional');
  const { handleCreateAccount, handleSignIn } = useThrive();

  // modal state for clinical disclaimers
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [selectedAssessmentForWaiver, setSelectedAssessmentForWaiver] = useState<Assessment | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <Loader2 size={48} />
            <p style={{ color: '#64748b' }}>Loading assessment platform...</p>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // typed record so indexing is safe
  const categoryIcons: Record<AssessmentCategory, React.ComponentType<any>> = {
    professional: Briefcase,
    psychological: Brain,
    creativity: Lightbulb
  };

  // color palettes keyed by category (typed)
  const CATEGORY_COLOR_PALETTES: Record<AssessmentCategory, ('blue' | 'purple' | 'green' | 'amber')[]> = {
    professional: ['blue', 'purple', 'green'],
    psychological: ['purple', 'blue', 'green'],
    creativity: ['amber', 'purple', 'blue']
  };

  const getAssessmentColor = (category: AssessmentCategory, index: number) => {
    const palette = CATEGORY_COLOR_PALETTES[category] ?? CATEGORY_COLOR_PALETTES.professional;
    return palette[index % palette.length] ?? 'blue';
  };

  // icons to rotate through for visual variety
  const iconMap: Record<AssessmentCategory, React.ComponentType<any>[]> = {
    professional: [Target, LineChart, UserCheck],
    psychological: [Brain, Heart, Activity],
    creativity: [Lightbulb, Sparkles as any, Award]
  };

  // click handler that respects coming_soon / restricted / disclaimerRequired
  const handleAssessmentClick = (assessment: Assessment) => {
    if (assessment.status === 'coming_soon') {
      // simple feedback path — replace with a toast if you have one
      console.log('Assessment coming soon:', assessment.id);
      return;
    }
    if (assessment.status === 'restricted') {
      console.log('Assessment restricted:', assessment.id);
      // you might route to an enterprise/contact flow here
      return;
    }

    if ((assessment as any).disclaimerRequired) {
      setSelectedAssessmentForWaiver(assessment);
      setWaiverOpen(true);
      return;
    }

    // proceed to start assessment (replace with your navigation/start flow)
    console.log('Start assessment:', assessment.id);
  };

  const renderAssessments = () => {
    // show all psychological assessments — the mockData now flags coming_soon where appropriate
    const assessments = (
      assessmentCategory === 'professional' ? PROFESSIONAL_ASSESSMENTS :
      assessmentCategory === 'psychological' ? PSYCHOLOGICAL_ASSESSMENTS :
      CREATIVITY_ASSESSMENTS
    ) as Assessment[];

    const icons = iconMap[assessmentCategory];

    return (
      <>
        <AssessmentGrid>
          {assessments.slice(0, 6).map((assessment: Assessment, index: number) => {
            const Icon = icons[index % icons.length];
            const color = getAssessmentColor(assessmentCategory, index);
            const isFeatured = index === 0;
            const comingSoon = assessment.status === 'coming_soon';
            const restricted = assessment.status === 'restricted';
            const requiresDisclaimer = (assessment as any).disclaimerRequired;

            return (
              <AssessmentCard
                key={assessment.id}
                $featured={isFeatured}
                onClick={() => handleAssessmentClick(assessment)}
                style={{
                  cursor: comingSoon || restricted ? 'not-allowed' : undefined,
                  opacity: comingSoon ? 0.66 : 1,
                  pointerEvents: comingSoon || restricted ? 'auto' : undefined
                }}
              >
                {/* top-right badges */}
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                  {comingSoon && (
                    <div style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>Coming soon</div>
                  )}
                  {restricted && (
                    <div style={{
                      background: '#fff7ed',
                      color: '#b45309',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>Restricted</div>
                  )}
                  {requiresDisclaimer && (
                    <div style={{
                      background: '#fff1f2',
                      color: '#9f1239',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>Clinical</div>
                  )}
                </div>

                <CardHeader>
                  <CardIcon $color={color}>
                    <Icon size={24} />
                  </CardIcon>
                  <CardContent>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>
                      {assessment.description?.slice(0, 120)}...
                    </CardDescription>
                  </CardContent>
                </CardHeader>

                <CardMeta>
                  <MetaItem>
                    <Timer size={16} />
                    <strong>{assessment.duration || '15'}</strong> min
                  </MetaItem>
                  <MetaItem>
                    <FileCheck size={16} />
                    <strong>{assessment.questions ?? (assessment as any).items ?? '25'}</strong> questions
                  </MetaItem>
                  {isFeatured && (
                    <MetaItem style={{ marginLeft: 'auto', color: '#3b82f6' }}>
                      <Star size={16} fill="currentColor" />
                      Popular
                    </MetaItem>
                  )}
                </CardMeta>
              </AssessmentCard>
            );
          })}
        </AssessmentGrid>

        {/* Waiver modal — shown when a clinical assessment requires a disclaimer */}
        {waiverOpen && selectedAssessmentForWaiver && (
          <ModalOverlay onClick={() => { setWaiverOpen(false); setSelectedAssessmentForWaiver(null); }}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: 0 }}>{selectedAssessmentForWaiver.title}</h3>
              <p style={{ color: '#64748b', marginTop: 8 }}>
                This assessment is a clinical screening tool. It's not a diagnostic instrument
                and should not replace evaluation by a qualified healthcare provider. By continuing
                you acknowledge that you understand the purpose of this tool.
              </p>

              <div style={{ marginTop: 12, fontSize: 13, color: '#475569' }}>
                <strong>Important:</strong> If you are currently in crisis or at risk, please contact
                emergency services or a mental health professional.
              </div>

              <ModalActions>
                <SecondaryButton onClick={() => { setWaiverOpen(false); setSelectedAssessmentForWaiver(null); }}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={() => {
                  console.log('User accepted waiver, start:', selectedAssessmentForWaiver.id);
                  setWaiverOpen(false);
                  setSelectedAssessmentForWaiver(null);
                }}>
                  I Understand — Start Assessment
                </PrimaryButton>
              </ModalActions>
            </ModalCard>
          </ModalOverlay>
        )}
      </>
    );
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Hero Section */}
        <HeroSection>
          <TrustBadge>
            <Shield size={16} />
            Trusted by Fortune 500 Companies
          </TrustBadge>

          <HeroTitle>
            Professional Assessment Platform for<br />
            <span className="accent">Career Excellence</span>
          </HeroTitle>

          <HeroSubtitle>
            Validate your skills with scientifically-backed assessments used by
            leading organizations worldwide. Build your verified professional profile.
          </HeroSubtitle>

          <CTAButtons>
            <PrimaryButton onClick={handleCreateAccount}>
              <CheckCircle size={18} />
              Start Free Assessment
            </PrimaryButton>
            <SecondaryButton onClick={handleSignIn}>
              Already have an account? Sign in
            </SecondaryButton>
          </CTAButtons>

          {/* Stats */}
          <StatsGrid>
            <StatCard>
              <StatIcon><Users size={24} /></StatIcon>
              <StatNumber>2.4M+</StatNumber>
              <StatLabel>Professionals Assessed</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Building2 size={24} /></StatIcon>
              <StatNumber>1,200+</StatNumber>
              <StatLabel>Enterprise Clients</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><GraduationCap size={24} /></StatIcon>
              <StatNumber>45+</StatNumber>
              <StatLabel>Assessment Types</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon><Trophy size={24} /></StatIcon>
              <StatNumber>94%</StatNumber>
              <StatLabel>Accuracy Rate</StatLabel>
            </StatCard>
          </StatsGrid>
        </HeroSection>

        {/* Assessment Categories */}
        <CategorySection>
          <CategoryHeader>
            <CategoryTitle>Choose Your Assessment Category</CategoryTitle>
            <CategorySubtitle>
              Comprehensive evaluation across multiple dimensions of professional excellence
            </CategorySubtitle>
          </CategoryHeader>

          <CategoryTabs>
            <CategoryTab
              $active={assessmentCategory === 'professional'}
              onClick={() => setAssessmentCategory('professional')}
            >
              <Briefcase size={16} />
              Professional Skills
            </CategoryTab>
            <CategoryTab
              $active={assessmentCategory === 'psychological'}
              onClick={() => setAssessmentCategory('psychological')}
            >
              <Brain size={16} />
              Cognitive & Behavioral
            </CategoryTab>
            <CategoryTab
              $active={assessmentCategory === 'creativity'}
              onClick={() => setAssessmentCategory('creativity')}
            >
              <Lightbulb size={16} />
              Creative Thinking
            </CategoryTab>
          </CategoryTabs>

          {renderAssessments()}
        </CategorySection>

        {/* Trust Section */}
        <TrustSection>
          <TrustTitle>Trusted by Industry Leaders</TrustTitle>
          <TrustLogos>
            <TrustLogo>
              <Building2 size={24} />
              TechCorp
            </TrustLogo>
            <TrustLogo>
              <Globe size={24} />
              Global Inc
            </TrustLogo>
            <TrustLogo>
              <Award size={24} />
              Innovation Labs
            </TrustLogo>
            <TrustLogo>
              <Target size={24} />
              Strategy Plus
            </TrustLogo>
          </TrustLogos>

          <div style={{ marginTop: '3rem' }}>
            <PrimaryButton onClick={handleCreateAccount} style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}>
              Join 2.4 Million Professionals
              <ArrowRight size={20} />
            </PrimaryButton>
          </div>
        </TrustSection>
      </ContentWrapper>
    </PageContainer>
  );
};

const ThrivePageWithSuspense = () => (
  <Suspense fallback={
    <PageContainer>
      <ContentWrapper>
        <LoadingContainer>
          <Loader2 size={48} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </LoadingContainer>
      </ContentWrapper>
    </PageContainer>
  }>
    <ThriveProvider isAuthenticated={false}>
      <PublicContent />
    </ThriveProvider>
  </Suspense>
);

export default ThrivePageWithSuspense;
