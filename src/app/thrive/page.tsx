// src/app/thrive/page.tsx  (replace your existing Thrive file with this)
'use client';

import React, { useState, useEffect, Suspense, useRef, useLayoutEffect } from 'react';
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

/* ---------------------------
   Animations - Subtle & Professional
   --------------------------- */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
   Parallax hook (CSS var + rAF)
   - writes --parallax-base px to the section element
   - respects prefers-reduced-motion
   - only runs when section is in view (IntersectionObserver)
   --------------------------- */
function useParallaxCSS(
  ref: React.RefObject<HTMLElement | null>,
  { multiplier = 110, sensitivity = 0.9, reduceOnMobile = true } = {}
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // honor reduced motion preference
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      el.style.setProperty('--parallax-base', '0px');
      return;
    }

    const computeMultiplier = () => (reduceOnMobile && window.innerWidth < 768 ? multiplier * 0.5 : multiplier);

    let rafId: number | null = null;
    let active = true;
    let isIntersecting = false;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        isIntersecting = e.isIntersecting;
        if (isIntersecting && rafId == null) {
          rafId = requestAnimationFrame(tick);
        } else if (!isIntersecting) {
          el.style.setProperty('--parallax-base', '0px');
          if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
        }
      });
    }, { threshold: 0 });

    io.observe(el);

    function tick() {
      rafId = null;
      if (!active || !isIntersecting || !el) return;

      const rect = el.getBoundingClientRect();
      const elemCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      const denom = Math.max(1, viewportCenter + rect.height / 2);
      let raw = (elemCenter - viewportCenter) / denom;
      raw = -raw * sensitivity; // invert so positive -> background moves up
      const clamped = Math.max(-1, Math.min(1, raw));
      const px = clamped * computeMultiplier();

      el.style.setProperty('--parallax-base', `${px}px`);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => { rafId = requestAnimationFrame(tick); });
    };

    window.addEventListener('resize', onResize);

    return () => {
      active = false;
      io.disconnect();
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      if (el) el.style.removeProperty('--parallax-base');
    };
  }, [ref, multiplier, sensitivity, reduceOnMobile]);
}

/* ---------------------------
   Page Layout - Clean & Professional (with Picsum backgrounds)
   --------------------------- */
const PageContainer = styled.main`
  min-height: 100vh;
  color: #1e293b;
  position: relative;
`;

/* shared content wrapper */
const ContentWrapper = styled.div`
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 1.5rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

/* HERO SECTION: uses a full-bleed Picsum background and --parallax-base */
const HeroSection = styled.section`
  position: relative;
  min-height: 62vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  --parallax-base: 0px; /* default */
  margin-bottom: 2.5rem;
`;

/* background layer using Picsum; moves opposite scroll (calc * -1) */
const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  background-image: url('https://picsum.photos/1600/900?random=12');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -1), 0) scale(1.08);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(2,6,23,0.28) 0%, rgba(2,6,23,0.12) 40%, rgba(255,255,255,0.0) 100%);
    pointer-events: none;
  }
`;

/* content that sits above the background — small fraction of the base px movement */
const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 3rem 1rem;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * 0.12), 0);
  will-change: transform;
`;

/* reuse your typography */
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
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem;
  color: white;
  text-shadow: 0 6px 30px rgba(0,0,0,0.4);

  .accent {
    background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.2vw, 1.125rem);
  color: rgba(255,255,255,0.95);
  max-width: 760px;
  margin: 0 auto 1.75rem;
`;

/* CTA group (keeps original buttons but contrasts better on picsum) */
const CTAButtons = styled.div`
  display:flex;
  gap:1rem;
  justify-content:center;
  flex-wrap:wrap;
  margin-top:1rem;
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
  display:inline-flex;
  gap:0.5rem;
  align-items:center;
`;

const SecondaryButton = styled.button`
  padding: 0.875rem 2rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.06);
  color: #0f172a;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
`;

/* Trust section — also has a Picsum background with subtle parallax */
const TrustSection = styled.section`
  position: relative;
  margin: 4rem 0;
  border-radius: 18px;
  overflow: hidden;
  --parallax-base: 0px;
  min-height: 36vh;
`;

/* trust background */
const TrustBg = styled.div`
  position:absolute;
  inset:0;
  background-image: url('https://picsum.photos/1600/700?random=21');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -0.6), 0) scale(1.05);
  will-change: transform;
  z-index:0;

  &::after {
    content: '';
    position:absolute;
    inset:0;
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.75));
    pointer-events: none;
  }
`;

const TrustCard = styled.div`
  position:relative;
  z-index:2;
  background: transparent;
  padding: 3rem 2rem;
`;

/* The rest of your components can remain mostly unchanged — keep layout & cards */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin: 2.5rem 0 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.04);
  border-radius: 12px;
  padding: 1.25rem;
  text-align:center;
`;

/* reusing many of your existing styled components for assessments & cards */
const CategorySection = styled.section` margin: 3.5rem 0 4rem; `;
const CategoryHeader = styled.div` text-align:center; margin-bottom: 2rem; `;
const CategoryTitle = styled.h2` font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight:700; margin:0 0 0.75rem; `;
const CategorySubtitle = styled.p` margin:0 auto; color:#374151; max-width:640px; `;

const CategoryTabs = styled.div` display:flex; gap:8px; justify-content:center; margin-bottom:1.5rem; flex-wrap:wrap; `;
const CategoryTab = styled.button<{ $active:boolean }>`
  padding:0.5rem 0.9rem;
  border-radius:8px;
  border: 1px solid rgba(0,0,0,0.06);
  background: ${({$active}) => $active ? 'linear-gradient(135deg,#3b82f6,#60a5fa)' : 'white'};
  color: ${({$active}) => $active ? 'white' : '#374151'};
  font-weight:600;
`;

/* Assessment grid & cards */
const AssessmentGrid = styled.div` display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1rem; `;
const AssessmentCard = styled.div<{ $disabled?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(0,0,0,0.04);
  opacity: ${({$disabled}) => $disabled ? 0.66 : 1};
  cursor: ${({$disabled}) => $disabled ? 'not-allowed' : 'pointer'};
`;

/* Modal & Loading unchanged */
const ModalOverlay = styled.div` position:fixed; inset:0; background: rgba(2,6,23,0.6); display:flex; align-items:center; justify-content:center; z-index:1200; `;
const ModalCard = styled.div` background:white; border-radius:12px; padding:1.25rem; width:min(720px,95%); `;
const ModalActions = styled.div` display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1rem; `;
const LoadingContainer = styled.div` display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:40vh; gap:1rem; `;

/* ---------------------------
   MAIN COMPONENT
   --------------------------- */
type AssessmentCategory = 'professional' | 'psychological' | 'creativity';

const PublicContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assessmentCategory, setAssessmentCategory] = useState<AssessmentCategory>('professional');
  const { handleCreateAccount, handleSignIn } = useThrive();

  const [waiverOpen, setWaiverOpen] = useState(false);
  const [selectedAssessmentForWaiver, setSelectedAssessmentForWaiver] = useState<Assessment | null>(null);

  // parallax refs
  const heroRef = useRef<HTMLElement | null>(null);
  const trustRef = useRef<HTMLElement | null>(null);

  // wire parallax for hero and trust
  useParallaxCSS(heroRef, { multiplier: 140, sensitivity: 0.95, reduceOnMobile: true });
  useParallaxCSS(trustRef, { multiplier: 90, sensitivity: 0.8, reduceOnMobile: true });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <Loader2 size={48} />
            <p style={{ color: '#6b7280' }}>Loading assessment platform...</p>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const categoryIcons: Record<AssessmentCategory, React.ComponentType<any>> = {
    professional: Briefcase,
    psychological: Brain,
    creativity: Lightbulb
  };

  const CATEGORY_COLOR_PALETTES: Record<AssessmentCategory, ('blue'|'purple'|'green'|'amber')[]> = {
    professional: ['blue','purple','green'],
    psychological: ['purple','blue','green'],
    creativity: ['amber','purple','blue']
  };

  const getAssessmentColor = (category: AssessmentCategory, index: number) => {
    const palette = CATEGORY_COLOR_PALETTES[category] ?? CATEGORY_COLOR_PALETTES.professional;
    return palette[index % palette.length] ?? 'blue';
  };

  const iconMap: Record<AssessmentCategory, React.ComponentType<any>[]> = {
    professional: [Target, LineChart, UserCheck],
    psychological: [Brain, Heart, Activity],
    creativity: [Lightbulb, Sparkles as any, Award]
  };

  const handleAssessmentClick = (assessment: Assessment) => {
    if (assessment.status === 'coming_soon') return;
    if (assessment.status === 'restricted') return;
    if ((assessment as any).disclaimerRequired) {
      setSelectedAssessmentForWaiver(assessment);
      setWaiverOpen(true);
      return;
    }
    // start flow placeholder
    console.log('Start assessment:', assessment.id);
  };

  const renderAssessments = () => {
    const assessments = (
      assessmentCategory === 'professional' ? PROFESSIONAL_ASSESSMENTS :
      assessmentCategory === 'psychological' ? PSYCHOLOGICAL_ASSESSMENTS :
      CREATIVITY_ASSESSMENTS
    ) as Assessment[];

    const icons = iconMap[assessmentCategory];

    return (
      <>
        <AssessmentGrid>
          {assessments.slice(0, 6).map((assessment, index) => {
            const Icon = icons[index % icons.length];
            const color = getAssessmentColor(assessmentCategory, index);
            const disabled = assessment.status === 'coming_soon' || assessment.status === 'restricted';
            return (
              <AssessmentCard key={assessment.id} $disabled={disabled} onClick={() => !disabled && handleAssessmentClick(assessment)}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
                  <div style={{ width:44, height:44, borderRadius:10, display:'grid', placeItems:'center', background: '#f8fafc' }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700 }}>{assessment.title}</div>
                    <div style={{ fontSize:13, color:'#6b7280' }}>{(assessment.description ?? '').slice(0, 80)}...</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:12, marginTop:12, borderTop:'1px solid #f1f5f9', paddingTop:12 }}>
                  <div style={{ fontSize:13, color:'#6b7280' }}><Timer size={14} /> {assessment.duration || '15'} min</div>
                  <div style={{ fontSize:13, color:'#6b7280' }}><FileCheck size={14} /> {assessment.questions ?? '25'} q</div>
                </div>
              </AssessmentCard>
            );
          })}
        </AssessmentGrid>

        {waiverOpen && selectedAssessmentForWaiver && (
          <div>
            <div style={{ position:'fixed', inset:0, background:'rgba(2,6,23,0.6)', zIndex:1200 }} onClick={() => { setWaiverOpen(false); setSelectedAssessmentForWaiver(null); }} />
            <div style={{ position:'fixed', zIndex:1300, inset:0, display:'grid', placeItems:'center' }}>
              <div style={{ background:'white', borderRadius:12, padding:18, width:'min(720px,95%)' }}>
                <h3 style={{ margin:0 }}>{selectedAssessmentForWaiver.title}</h3>
                <p style={{ color:'#6b7280' }}>
                  This assessment is a clinical screening tool. It's not diagnostic...
                </p>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
                  <SecondaryButton onClick={() => { setWaiverOpen(false); setSelectedAssessmentForWaiver(null); }}>Cancel</SecondaryButton>
                  <PrimaryButton onClick={() => { console.log('Accepted waiver', selectedAssessmentForWaiver.id); setWaiverOpen(false); setSelectedAssessmentForWaiver(null); }}>
                    I Understand — Start Assessment
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <PageContainer>
      {/* HERO with Picsum bg */}
      <HeroSection ref={heroRef as any}>
        <HeroBg />
        <ContentWrapper>
          <HeroContent>
            <TrustBadge>
              <Shield size={16} />
              Trusted by Fortune 500 Companies
            </TrustBadge>

            <HeroTitle>
              Professional Assessment Platform for <br />
              <span className="accent">Career Excellence</span>
            </HeroTitle>

            <HeroSubtitle>
              Validate your skills with scientifically-backed assessments used by leading organizations worldwide.
            </HeroSubtitle>

            <CTAButtons>
              <PrimaryButton onClick={handleCreateAccount}><CheckCircle size={16} /> Start Free Assessment</PrimaryButton>
              <SecondaryButton onClick={handleSignIn}>Already have an account? Sign in</SecondaryButton>
            </CTAButtons>

            <StatsGrid>
              <StatCard>
                <div style={{ fontSize:26, fontWeight:800 }}>2.4M+</div>
                <div style={{ color:'#6b7280' }}>Professionals Assessed</div>
              </StatCard>
              <StatCard>
                <div style={{ fontSize:26, fontWeight:800 }}>1,200+</div>
                <div style={{ color:'#6b7280' }}>Enterprise Clients</div>
              </StatCard>
              <StatCard>
                <div style={{ fontSize:26, fontWeight:800 }}>45+</div>
                <div style={{ color:'#6b7280' }}>Assessment Types</div>
              </StatCard>
              <StatCard>
                <div style={{ fontSize:26, fontWeight:800 }}>94%</div>
                <div style={{ color:'#6b7280' }}>Accuracy Rate</div>
              </StatCard>
            </StatsGrid>
          </HeroContent>
        </ContentWrapper>
      </HeroSection>

      {/* Category & Assessments */}
      <ContentWrapper>
        <CategorySection>
          <CategoryHeader>
            <CategoryTitle>Choose Your Assessment Category</CategoryTitle>
            <CategorySubtitle>Comprehensive evaluation across multiple dimensions of professional excellence</CategorySubtitle>
          </CategoryHeader>

          <CategoryTabs>
            <CategoryTab $active={assessmentCategory === 'professional'} onClick={() => setAssessmentCategory('professional')}>
              <Briefcase size={16} /> Professional Skills
            </CategoryTab>
            <CategoryTab $active={assessmentCategory === 'psychological'} onClick={() => setAssessmentCategory('psychological')}>
              <Brain size={16} /> Cognitive & Behavioral
            </CategoryTab>
            <CategoryTab $active={assessmentCategory === 'creativity'} onClick={() => setAssessmentCategory('creativity')}>
              <Lightbulb size={16} /> Creative Thinking
            </CategoryTab>
          </CategoryTabs>

          {renderAssessments()}
        </CategorySection>
      </ContentWrapper>

      {/* TRUST (with Picsum background + parallax) */}
      <TrustSection ref={trustRef as any}>
        <TrustBg />
        <ContentWrapper>
          <TrustCard>
            <h2 style={{ margin:0, color:'white', textShadow:'0 6px 30px rgba(0,0,0,0.35)' }}>Trusted by Industry Leaders</h2>
            <div style={{ marginTop:12, color:'rgba(255,255,255,0.9)' }}>
              Technology, healthcare, and enterprise customers rely on our validated assessments.
            </div>

            <div style={{ display:'flex', gap:24, marginTop:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', color:'rgba(255,255,255,0.95)'}}><Building2 /> TechCorp</div>
              <div style={{ display:'flex', gap:8, alignItems:'center', color:'rgba(255,255,255,0.95)'}}><Globe /> Global Inc</div>
              <div style={{ display:'flex', gap:8, alignItems:'center', color:'rgba(255,255,255,0.95)'}}><Award /> Innovation Labs</div>
              <div style={{ display:'flex', gap:8, alignItems:'center', color:'rgba(255,255,255,0.95)'}}><Target /> Strategy Plus</div>
            </div>

            <div style={{ marginTop:24 }}>
              <PrimaryButton onClick={handleCreateAccount} style={{ padding:'0.75rem 1.5rem' }}>
                Join 2.4 Million Professionals <ArrowRight size={16} />
              </PrimaryButton>
            </div>
          </TrustCard>
        </ContentWrapper>
      </TrustSection>
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
