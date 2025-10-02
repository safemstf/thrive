// src/app/thrive/page.tsx - Consistent with Homepage Design
'use client';

import React, { useState, useEffect, Suspense, useRef, useLayoutEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Target, TrendingUp, Users, Trophy, Star, CheckCircle,
  ArrowRight, Shield, Globe, Loader2, Activity, Award,
  Lock, Sparkles, Timer, Brain, AlertCircle, Lightbulb,
  Heart, Zap, BarChart3, Compass, ChevronRight, Building2,
  GraduationCap, Briefcase, LineChart, UserCheck, FileCheck,
  Clock, X, Rocket, TrendingDown
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

/* ===== Tunables ===== */
const HERO_MULTIPLIER = 160;
const SECTION1_MULTIPLIER = 110;
const SECTION2_MULTIPLIER = 110;
const FG_SCALE = 0.16;
const MID_SCALE = 0.7;

/* ===== Animations ===== */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ===== Parallax Hook ===== */
function useParallaxCSS(
  ref: React.RefObject<HTMLElement | null>,
  { multiplier = 120, sensitivity = 0.9, reduceOnMobile = true } = {}
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

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
      raw = -raw * sensitivity;
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

/* ===== Page Layout ===== */
const PageContainer = styled.main`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  margin-top: -80px;
  padding-top: 0;
`;

const MainContainer = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

/* ===== Hero Section ===== */
const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  --parallax-base: 0px;

  @media (max-width: 768px) {
    min-height: 90vh;
  }
`;

const HeroParallaxBg = styled.div`
  position: absolute;
  inset: 0;
  background-image: url('https://picsum.photos/1920/1080?random=12');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -1), 0) scale(1.15);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(59, 130, 246, 0.72) 0%,
      rgba(139, 92, 246, 0.68) 50%,
      rgba(236, 72, 153, 0.65) 100%
    );
    pointer-events: none;
  }
`;

const HeroFloatingElements = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
`;

const FloatingShape = styled.div<{ $delay: number; $duration: number; $top: string; $left: string }>`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent);
  top: ${p => p.$top};
  left: ${p => p.$left};
  animation: ${float} ${p => p.$duration}s ease-in-out ${p => p.$delay}s infinite;
  z-index: 2;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
  animation: ${fadeInUp} 1s ease-out;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE}), 0);
  will-change: transform;
`;

const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0.625rem 1.25rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  color: white;
  margin: 0 0 1.5rem;
  line-height: 1.1;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;

  .accent {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  color: rgba(255, 255, 255, 0.95);
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.5s both;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.25rem;
  background: white;
  color: #3b82f6;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.4);
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 1rem;
  }
`;

const ScrollDot = styled.div`
  width: 24px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 8px;
    background: white;
    border-radius: 2px;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    animation: ${float} 1.5s ease-in-out infinite;
  }
`;

/* ===== Stats Grid ===== */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 1.75rem 1.25rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: ${scaleIn} 0.5s ease-out both;

  &:nth-child(1) { animation-delay: 0.6s; }
  &:nth-child(2) { animation-delay: 0.7s; }
  &:nth-child(3) { animation-delay: 0.8s; }
  &:nth-child(4) { animation-delay: 0.9s; }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: white;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
`;

/* ===== Parallax Section 1 ===== */
const ParallaxSection1 = styled.section`
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  --parallax-base: 0px;

  @media (max-width: 768px) {
    min-height: 60vh;
  }
`;

const ParallaxBg1 = styled.div`
  position: absolute;
  inset: -10%;
  background-image: url('https://picsum.photos/1920/1080?random=20');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -${MID_SCALE}), 0) scale(1.08);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.75) 0%,
      rgba(168, 85, 247, 0.7) 50%,
      rgba(236, 72, 153, 0.72) 100%
    );
    pointer-events: none;
  }
`;

const ParallaxContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.9}), 0);
  will-change: transform;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const ParallaxTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 800;
  color: white;
  margin: 0 0 1.5rem;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  animation: ${slideInRight} 0.8s ease-out;
`;

const ParallaxText = styled.p`
  font-size: clamp(1.0625rem, 2vw, 1.375rem);
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 2rem;
  line-height: 1.7;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
  animation: ${slideInRight} 0.8s ease-out 0.2s both;
`;

const ParallaxButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 2rem;
  background: white;
  color: #8b5cf6;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4);
  animation: ${slideInRight} 0.8s ease-out 0.4s both;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 15px 40px -5px rgba(0, 0, 0, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ===== Category Section ===== */
const CategorySection = styled.section`
  padding: 5rem 1.5rem;
  position: relative;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%);
  margin: 0;
  --parallax-base: 0px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const CategoryHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.6s ease-out;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.7}), 0);
  will-change: transform;
`;

const CategoryBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  border: 1px solid #93c5fd;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h2`
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 800;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CategorySubtitle = styled.p`
  margin: 0 auto;
  color: #64748b;
  max-width: 680px;
  font-size: 1.125rem;
  line-height: 1.6;
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.8}), 0);
  will-change: transform;
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: 2px solid ${({ $active }) => ($active ? 'transparent' : '#e2e8f0')};
  background: ${({ $active }) =>
    $active ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'white'};
  color: ${({ $active }) => ($active ? 'white' : '#475569')};
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: ${({ $active }) =>
    $active ? '0 8px 24px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.04)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $active }) =>
      $active ? '0 12px 32px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.08)'};
    border-color: ${({ $active }) => ($active ? 'transparent' : '#cbd5e1')};
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ===== Assessment Grid ===== */
const AssessmentGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.8}), 0);
  will-change: transform;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const AssessmentCard = styled.div<{ $disabled?: boolean }>`
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid transparent;
  opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover:not([data-disabled='true']) {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
    border-color: transparent;
  }

  &:hover:not([data-disabled='true'])::before {
    transform: scaleX(1);
  }

  &:hover:not([data-disabled='true'])::after {
    opacity: 1;
  }

  &[data-disabled='true'] {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
`;

const AssessmentHeader = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
`;

const AssessmentIcon = styled.div<{ $color?: string }>`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: ${({ $color }) => {
    switch ($color) {
      case 'purple':
        return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
      case 'green':
        return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
      case 'amber':
        return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
    }
  }};
  color: white;
  flex-shrink: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 18px;
    background: ${({ $color }) => {
      switch ($color) {
        case 'purple':
          return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
        case 'green':
          return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        case 'amber':
          return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
        default:
          return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
      }
    }};
    opacity: 0;
    filter: blur(12px);
    transition: opacity 0.4s ease;
    z-index: -1;
  }

  ${AssessmentCard}:hover & {
    transform: scale(1.1) rotate(5deg);
  }

  ${AssessmentCard}:hover &::before {
    opacity: 0.6;
  }
`;

const AssessmentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const AssessmentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #0f172a;
  line-height: 1.3;
`;

const AssessmentDescription = styled.p`
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AssessmentMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  padding-top: 1.25rem;
  margin-top: 1.25rem;
  border-top: 2px solid #f1f5f9;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;

  svg {
    color: #94a3b8;
  }
`;

const AssessmentBadge = styled.div<{ $type: 'coming_soon' | 'restricted' | 'popular' }>`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $type }) => {
    switch ($type) {
      case 'coming_soon':
        return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
      case 'restricted':
        return 'linear-gradient(135deg, #ef4444, #f87171)';
      case 'popular':
        return 'linear-gradient(135deg, #10b981, #34d399)';
      default:
        return '#e2e8f0';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/* ===== Parallax Section 2 ===== */
const ParallaxSection2 = styled.section`
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  --parallax-base: 0px;

  @media (max-width: 768px) {
    min-height: 60vh;
  }
`;

const ParallaxBg2 = styled.div`
  position: absolute;
  inset: -10%;
  background-image: url('https://picsum.photos/1920/1080?random=30');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -${MID_SCALE}), 0) scale(1.08);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(5, 46, 22, 0.72) 0%,
      rgba(6, 95, 70, 0.7) 50%,
      rgba(4, 120, 87, 0.75) 100%
    );
    pointer-events: none;
  }
`;

/* ===== Trust Section ===== */
const TrustSection = styled.section`
  padding: 5rem 1.5rem;
  position: relative;
  background-image: url('https://picsum.photos/1920/1080?random=50');
  background-size: cover;
  background-position: center;
  margin: 0;
  --parallax-base: 0px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(241, 245, 249, 0.96) 0%,
      rgba(248, 250, 252, 0.97) 100%
    );
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const TrustContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.7}), 0);
  will-change: transform;
`;

const TrustTitle = styled.h2`
  margin: 0 0 1rem;
  color: #1e293b;
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 800;
`;

const TrustSubtitle = styled.p`
  margin: 0 auto 2.5rem;
  color: #64748b;
  font-size: 1.125rem;
  max-width: 700px;
  line-height: 1.6;
`;

const CompanyLogos = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
`;

const CompanyLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #475569;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
  }
`;

/* ===== Modal/Waiver ===== */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${scaleIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
  flex: 1;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
  color: #64748b;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 2rem;
`;

const DisclaimerBox = styled.div`
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const DisclaimerIcon = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fbbf24;
  display: grid;
  place-items: center;
  color: white;
`;

const DisclaimerText = styled.div`
  flex: 1;
  color: #92400e;
  font-size: 0.9375rem;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  border: ${({ $variant }) => ($variant === 'primary' ? 'none' : '2px solid #e2e8f0')};
  background: ${({ $variant }) =>
    $variant === 'primary' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'white'};
  color: ${({ $variant }) => ($variant === 'primary' ? 'white' : '#475569')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ $variant }) =>
      $variant === 'primary'
        ? '0 8px 24px rgba(59, 130, 246, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.08)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

/* ===== Loading ===== */
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

/* ===== Main Component ===== */
type AssessmentCategory = 'professional' | 'psychological' | 'creativity';

const PublicContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [assessmentCategory, setAssessmentCategory] = useState<AssessmentCategory>('professional');
  const { handleCreateAccount, handleSignIn } = useThrive();

  const [waiverOpen, setWaiverOpen] = useState(false);
  const [selectedAssessmentForWaiver, setSelectedAssessmentForWaiver] = useState<Assessment | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const section1Ref = useRef<HTMLElement | null>(null);
  const categoryRef = useRef<HTMLElement | null>(null);
  const section2Ref = useRef<HTMLElement | null>(null);
  const trustRef = useRef<HTMLElement | null>(null);

  useParallaxCSS(heroRef, { multiplier: HERO_MULTIPLIER, sensitivity: 0.95, reduceOnMobile: true });
  useParallaxCSS(section1Ref, { multiplier: SECTION1_MULTIPLIER, sensitivity: 0.8, reduceOnMobile: true });
  useParallaxCSS(categoryRef, { multiplier: 60, sensitivity: 0.6, reduceOnMobile: true });
  useParallaxCSS(section2Ref, { multiplier: SECTION2_MULTIPLIER, sensitivity: 0.8, reduceOnMobile: true });
  useParallaxCSS(trustRef, { multiplier: 55, sensitivity: 0.6, reduceOnMobile: true });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size={64} />
          <LoadingText>Loading assessment platform...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  const categoryIcons: Record<AssessmentCategory, React.ComponentType<any>> = {
    professional: Briefcase,
    psychological: Brain,
    creativity: Lightbulb
  };

  const CATEGORY_COLOR_PALETTES: Record<AssessmentCategory, ('blue' | 'purple' | 'green' | 'amber')[]> = {
    professional: ['blue', 'purple', 'green'],
    psychological: ['purple', 'blue', 'green'],
    creativity: ['amber', 'purple', 'blue']
  };

  const getAssessmentColor = (category: AssessmentCategory, index: number) => {
    const palette = CATEGORY_COLOR_PALETTES[category] ?? CATEGORY_COLOR_PALETTES.professional;
    return palette[index % palette.length] ?? 'blue';
  };

  const iconMap: Record<AssessmentCategory, React.ComponentType<any>[]> = {
    professional: [Target, LineChart, UserCheck, Trophy, BarChart3, Award],
    psychological: [Brain, Heart, Activity, Zap, Compass, TrendingUp],
    creativity: [Lightbulb, Sparkles, Award, Star, GraduationCap, Target]
  };

  const handleAssessmentClick = (assessment: Assessment) => {
    if (assessment.status === 'coming_soon') return;
    if (assessment.status === 'restricted') return;
    if ((assessment as any).disclaimerRequired) {
      setSelectedAssessmentForWaiver(assessment);
      setWaiverOpen(true);
      return;
    }
    console.log('Start assessment:', assessment.id);
  };

  const closeWaiver = () => {
    setWaiverOpen(false);
    setSelectedAssessmentForWaiver(null);
  };

  const renderAssessments = () => {
    const assessments = (
      assessmentCategory === 'professional'
        ? PROFESSIONAL_ASSESSMENTS
        : assessmentCategory === 'psychological'
        ? PSYCHOLOGICAL_ASSESSMENTS
        : CREATIVITY_ASSESSMENTS
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
              <AssessmentCard
                key={assessment.id}
                $disabled={disabled}
                data-disabled={disabled}
                onClick={() => !disabled && handleAssessmentClick(assessment)}
              >
                {assessment.status === 'coming_soon' && (
                  <AssessmentBadge $type="coming_soon">
                    <Clock size={12} />
                    Coming Soon
                  </AssessmentBadge>
                )}
                {assessment.status === 'restricted' && (
                  <AssessmentBadge $type="restricted">
                    <Lock size={12} />
                    Premium
                  </AssessmentBadge>
                )}

                <AssessmentHeader>
                  <AssessmentIcon $color={color}>
                    <Icon size={24} />
                  </AssessmentIcon>
                  <AssessmentInfo>
                    <AssessmentTitle>{assessment.title}</AssessmentTitle>
                    <AssessmentDescription>
                      {(assessment.description ?? '').slice(0, 90)}...
                    </AssessmentDescription>
                  </AssessmentInfo>
                </AssessmentHeader>

                <AssessmentMeta>
                  <MetaItem>
                    <Timer size={16} />
                    {assessment.duration || '15'} min
                  </MetaItem>
                  <MetaItem>
                    <FileCheck size={16} />
                    {assessment.questions ?? '25'} questions
                  </MetaItem>
                </AssessmentMeta>
              </AssessmentCard>
            );
          })}
        </AssessmentGrid>

        {waiverOpen && selectedAssessmentForWaiver && (
          <ModalOverlay onClick={closeWaiver}>
            <ModalCard onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>{selectedAssessmentForWaiver.title}</ModalTitle>
                <CloseButton onClick={closeWaiver} aria-label="Close modal">
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <DisclaimerBox>
                  <DisclaimerIcon>
                    <AlertCircle size={20} />
                  </DisclaimerIcon>
                  <DisclaimerText>
                    <strong>Important Disclaimer:</strong> This assessment is a clinical screening
                    tool designed for educational and informational purposes. It is not a diagnostic
                    instrument and cannot replace professional evaluation by a qualified healthcare
                    provider.
                  </DisclaimerText>
                </DisclaimerBox>

                <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  By proceeding, you acknowledge that this assessment provides screening results only
                  and should not be used as the sole basis for any health-related decisions. If you
                  have concerns about your mental health, please consult with a licensed professional.
                </p>
              </ModalBody>

              <ModalActions>
                <ActionButton $variant="secondary" onClick={closeWaiver}>
                  Cancel
                </ActionButton>
                <ActionButton
                  $variant="primary"
                  onClick={() => {
                    console.log('Accepted waiver', selectedAssessmentForWaiver.id);
                    closeWaiver();
                  }}
                >
                  I Understand — Start Assessment
                  <ArrowRight size={16} />
                </ActionButton>
              </ModalActions>
            </ModalCard>
          </ModalOverlay>
        )}
      </>
    );
  };

  return (
    <PageContainer>
      <MainContainer>
        {/* Hero Section */}
        <HeroSection ref={heroRef}>
          <HeroParallaxBg />

          <HeroFloatingElements aria-hidden>
            <FloatingShape $delay={0} $duration={20} $top="10%" $left="10%" />
            <FloatingShape $delay={2} $duration={15} $top="60%" $left="80%" />
            <FloatingShape $delay={1} $duration={18} $top="30%" $left="85%" />
            <FloatingShape $delay={3} $duration={22} $top="80%" $left="15%" />
          </HeroFloatingElements>

          <HeroContent>
            <TrustBadge>
              <Shield size={16} />
              Trusted by Fortune 500 Companies
            </TrustBadge>

            <HeroTitle>
              Professional Assessments
              <br />
              <span className="accent">Career Excellence</span>
            </HeroTitle>

            <HeroSubtitle>
              Validate your skills with scientifically-backed assessments used by leading organizations
              worldwide. Join millions of professionals advancing their careers.
            </HeroSubtitle>

            <CTAButtons>
              <PrimaryButton onClick={handleCreateAccount}>
                <CheckCircle size={18} />
                Start Free Assessment
              </PrimaryButton>
              <SecondaryButton onClick={handleSignIn}>Sign In to Continue</SecondaryButton>
            </CTAButtons>

            <StatsGrid>
              <StatCard>
                <StatNumber>2.4M+</StatNumber>
                <StatLabel>Professionals Assessed</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>1,200+</StatNumber>
                <StatLabel>Enterprise Clients</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>45+</StatNumber>
                <StatLabel>Assessment Types</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>94%</StatNumber>
                <StatLabel>Accuracy Rate</StatLabel>
              </StatCard>
            </StatsGrid>
          </HeroContent>

          <ScrollIndicator>
            <ScrollDot />
          </ScrollIndicator>
        </HeroSection>

        {/* Parallax Section 1 */}
        <ParallaxSection1 ref={section1Ref}>
          <ParallaxBg1 />
          <ParallaxContent>
            <ParallaxTitle>Measure What Matters</ParallaxTitle>
            <ParallaxText>
              Our scientifically validated assessments provide deep insights into professional competencies,
              cognitive abilities, and creative potential. Get actionable feedback that drives real career growth.
            </ParallaxText>
            <ParallaxButton onClick={handleCreateAccount}>
              Explore Assessments <Target size={20} />
            </ParallaxButton>
          </ParallaxContent>
        </ParallaxSection1>

        {/* Category & Assessments */}
        <CategorySection ref={categoryRef}>
          <CategoryHeader>
            <CategoryBadge>
              <Sparkles size={14} />
              Scientifically Validated
            </CategoryBadge>
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
              <Briefcase size={18} />
              Professional Skills
            </CategoryTab>
            <CategoryTab
              $active={assessmentCategory === 'psychological'}
              onClick={() => setAssessmentCategory('psychological')}
            >
              <Brain size={18} />
              Cognitive & Behavioral
            </CategoryTab>
            <CategoryTab
              $active={assessmentCategory === 'creativity'}
              onClick={() => setAssessmentCategory('creativity')}
            >
              <Lightbulb size={18} />
              Creative Thinking
            </CategoryTab>
          </CategoryTabs>

          {renderAssessments()}
        </CategorySection>

        {/* Parallax Section 2 */}
        <ParallaxSection2 ref={section2Ref}>
          <ParallaxBg2 />
          <ParallaxContent>
            <ParallaxTitle>Data-Driven Career Decisions</ParallaxTitle>
            <ParallaxText>
              Make informed career choices backed by comprehensive assessment data. Our platform helps you
              identify strengths, discover growth opportunities, and plan your professional development journey.
            </ParallaxText>
            <ParallaxButton onClick={handleSignIn}>
              View Your Progress <TrendingUp size={20} />
            </ParallaxButton>
          </ParallaxContent>
        </ParallaxSection2>

        {/* Trust Section */}
        <TrustSection ref={trustRef}>
          <TrustContent>
            <TrustTitle>Trusted by Industry Leaders</TrustTitle>
            <TrustSubtitle>
              Leading technology, healthcare, and enterprise organizations rely on our validated
              assessments for talent development and recruitment.
            </TrustSubtitle>

            <CompanyLogos>
              <CompanyLogo>
                <Building2 size={20} />
                TechCorp Global
              </CompanyLogo>
              <CompanyLogo>
                <Globe size={20} />
                Innovation Labs
              </CompanyLogo>
              <CompanyLogo>
                <Award size={20} />
                Strategy Plus
              </CompanyLogo>
              <CompanyLogo>
                <Target size={20} />
                Future Systems
              </CompanyLogo>
            </CompanyLogos>

            <PrimaryButton onClick={handleCreateAccount}>
              Join 2.4 Million Professionals
              <ArrowRight size={18} />
            </PrimaryButton>
          </TrustContent>
        </TrustSection>
      </MainContainer>
    </PageContainer>
  );
};

const ThrivePageWithSuspense = () => (
  <Suspense
    fallback={
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size={64} />
          <LoadingText>Loading...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    }
  >
    <ThriveProvider isAuthenticated={false}>
      <PublicContent />
    </ThriveProvider>
  </Suspense>
);

export default ThrivePageWithSuspense;