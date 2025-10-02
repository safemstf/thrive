// src/app/page.tsx - Enhanced Homepage with Buttery Parallax (CSS-vars + rAF)
'use client';
import React, { useLayoutEffect, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';
import {
  Search, Grid3X3, User, Target, Trophy,
  Eye, Star, Image, ArrowRight, Loader2, Zap,
  WifiOff, RefreshCw, AlertCircle, TrendingUp, Sparkles,
  Users, Palette, ChevronRight, Rocket
} from 'lucide-react';
import { getApiClient } from '@/lib/api-client';
import { Portfolio, getPortfolioId, normalizePortfolio } from '@/types/portfolio.types';
import { utils } from '@/utils';
import styled, { keyframes } from 'styled-components';
import { MOCK_PORTFOLIOS } from '@/data/mockData';

/* =========================
   Tunables
   ========================= */
// NOTE: multipliers are used by useParallaxCSS per-section to compute the px offset:
// final movement is "clampedNormalized * multiplier" in px. Tune per-section when calling hook.
const HERO_MULTIPLIER = 160;      // large, dramatic background on hero
const SECTION1_MULTIPLIER = 110;
const SECTION2_MULTIPLIER = 110;
const FG_SCALE = 0.16;            // foreground content reacts only a little (multiplier fraction)
const MID_SCALE = 0.7;            // middle decorative layers

/* =========================
   Animations
   ========================= */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* =========================
   Styled layout components
   ========================= */
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  margin-top: -80px;
  padding-top: 0;
`;

const MainContainer = styled.main`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

/* HERO */
const HeroSection = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* default var so nested calc() doesn't blow up */
  --parallax-base: 0px;
  @media (max-width: 768px) { min-height: 90vh; }
`;

/* Background layer reads the --parallax-base computed by useParallaxCSS */
const HeroParallaxBg = styled.div`
  position: absolute;
  inset: 0;
  background-image: url('https://picsum.photos/1920/1080?random=10');
  background-size: cover;
  background-position: center;

  /* translate using the computed px value. Multiply by -1 so background moves opposite to scroll */
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -1), 0) scale(1.15);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(30, 41, 59, 0.5) 0%,
      rgba(71, 85, 105, 0.36) 50%,
      rgba(59, 130, 246, 0.28) 100%
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

/* Floating shapes — decorative and animated, unaffected by CSS var movement (they float via keyframes) */
const FloatingShape = styled.div<{ $delay: number; $duration: number; $top: string; $left: string }>`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.08), transparent);
  top: ${p => p.$top};
  left: ${p => p.$left};
  animation: ${float} ${p => p.$duration}s ease-in-out ${p => p.$delay}s infinite;
  z-index: 2;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

/* Foreground content reads the same var but at smaller scale (FG_SCALE) */
const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
  animation: ${fadeInUp} 1s ease-out;
  /* foreground uses a small fraction of the base px movement */
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE}), 0);
  will-change: transform;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  color: white;
  margin: 0 0 1.5rem;
  line-height: 1.1;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);

  span {
    background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  color: rgba(255, 255, 255, 0.95);
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
`;

/* Search & buttons (unchanged styling) */
const SearchContainer = styled.form`
  max-width: 600px;
  margin: 0 auto 2.5rem;
  position: relative;
`;
const SearchInput = styled.input`
  width: 100%;
  padding: 1.25rem 3.5rem 1.25rem 3.5rem;
  font-size: 1.0625rem;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  color: white;
  transition: all 0.18s ease;
  &:focus { outline: none; border-color: rgba(255,255,255,0.35); }
  &::placeholder { color: rgba(255,255,255,0.6); }
`;
const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.75);
  pointer-events: none;
`;
const SearchButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease;
  &:hover { transform: translateY(-50%) scale(1.02); }
`;

const HeroButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;
const HeroPrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  color: #1e293b;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.0625rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  &:hover { transform: translateY(-2px) scale(1.03); }
`;
const HeroSecondaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.0625rem;
  &:hover { transform: translateY(-2px); }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 10;
  @media (max-width: 768px) { bottom: 1rem; }
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

/* PARALLAX SECTION 1 */
const ParallaxSection1 = styled.section`
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  --parallax-base: 0px;
  @media (max-width: 768px) { min-height: 60vh; }
`;

/* use var for section background transform; the child content will use small FG_SCALE fraction */
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
      rgba(139, 92, 246, 0.72) 0%,
      rgba(236, 72, 153, 0.6) 100%
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
  @media (max-width: 768px) { padding: 2rem 1.5rem; }
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

const ParallaxButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  color: #8b5cf6;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4);
  animation: ${slideInRight} 0.8s ease-out 0.4s both;
  &:hover { transform: translateY(-2px) scale(1.02); }
`;

/* STATS, PORTFOLIO, other sections: these use the same small FG transform pattern */
const StatsSection = styled.section`
  padding: 5rem 1.5rem;
  position: relative;
  background-image: url('https://picsum.photos/1920/1080?random=40');
  background-size: cover;
  background-position: center;
  margin: 0;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.97) 100%
    );
  }
  & > * { position: relative; z-index: 1; }
`;

const StatsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.8}), 0);
  will-change: transform;
`;

/* stat cards etc (unchanged) */
const StatCard = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: white;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  animation: ${fadeInUp} 0.6s ease-out;
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
    border-color: #3b82f6;
  }
`;
const StatIcon = styled.div` width: 70px; height: 70px; margin: 0 auto 1.5rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 18px; display:flex; align-items:center; justify-content:center; color:white; box-shadow: 0 10px 25px -5px rgba(59,130,246,0.4); `;
const StatNumber = styled.div` font-size: 3rem; font-weight: 900; background: linear-gradient(135deg, #1e293b, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; `;
const StatLabel = styled.div` font-size: 0.9375rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; `;

/* Portfolios */
const PortfoliosSection = styled.section`
  padding: 5rem 1.5rem;
  position: relative;
  background-image: url('https://picsum.photos/1920/1080?random=50');
  background-size: cover;
  background-position: center;
  margin: 0;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(248, 250, 252, 0.96) 0%,
      rgba(241, 245, 249, 0.97) 100%
    );
  }
  & > * { position: relative; z-index: 1; }
`;

const SectionHeader = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.7}), 0);
  will-change: transform;
`;
const SectionTitle = styled.h2` font-size: 2.5rem; font-weight: 800; color: #1e293b; display:flex; align-items:center; gap:0.75rem; svg { color: #3b82f6; } @media (max-width:768px) { font-size:2rem; } `;
const ViewAllLink = styled(Link)` display:flex; align-items:center; gap:0.5rem; color:#3b82f6; text-decoration:none; font-weight:700; font-size:1.0625rem; padding:0.5rem 1rem; border-radius:8px; &:hover { background:#f0f9ff; gap:0.75rem; } `;

const PortfolioGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.8}), 0);
  will-change: transform;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const PortfolioCard = styled.div` background:white; border-radius:20px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); transition:all 0.3s ease; cursor:pointer; border:1px solid #e2e8f0; animation:${fadeInUp} 0.6s ease-out; &:hover { transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border-color:#3b82f6; } `;
const PortfolioCover = styled.div<{ $gradient?: boolean }>` height:200px; background: ${p => p.$gradient ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#e2e8f0'}; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; `;
const PortfolioBadge = styled.span` position:absolute; top:1rem; right:1rem; padding:0.375rem 0.875rem; background:rgba(255,255,255,0.95); backdrop-filter: blur(6px); border-radius:999px; font-size:0.75rem; font-weight:700; color:#3b82f6; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); `;
const PortfolioContent = styled.div` padding:1.5rem; `;
const PortfolioHeader = styled.div` display:flex; gap:1rem; margin-bottom:1rem; `;
const PortfolioAvatar = styled.div` width:52px; height:52px; border-radius:14px; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; flex-shrink:0; box-shadow:0 4px 10px -2px rgba(59,130,246,0.4); `;
const PortfolioInfo = styled.div` flex:1; min-width:0; `;
const PortfolioUsername = styled.h3` font-size:1.0625rem; font-weight:700; color:#1e293b; margin:0 0 0.25rem; `;
const PortfolioTitle = styled.p` font-size:0.875rem; color:#64748b; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; `;
const PortfolioBio = styled.p` font-size:0.9375rem; color:#475569; line-height:1.6; margin:0 0 1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; `;
const PortfolioStats = styled.div` display:flex; justify-content:space-between; padding-top:1rem; border-top:1px solid #e2e8f0; font-size:0.875rem; `;
const PortfolioStat = styled.div` display:flex; align-items:center; gap:0.375rem; color:#64748b; svg { width:16px; height:16px; } span { font-weight:700; color:#1e293b; } `;

/* PARALLAX SECTION 2 */
const ParallaxSection2 = styled.section`
  position: relative;
  min-height: 70vh;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  margin:0;
  --parallax-base: 0px;
  @media (max-width:768px) { min-height:60vh; }
`;

const ParallaxBg2 = styled.div`
  position:absolute;
  inset:-10%;
  background-image: url('https://picsum.photos/1920/1080?random=30');
  background-size: cover;
  background-position: center;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * -${MID_SCALE}), 0) scale(1.08);
  will-change: transform;
  pointer-events: none;
  z-index: 0;

  &::after {
    content: '';
    position:absolute;
    inset:0;
    background: linear-gradient(135deg,
      rgba(5, 46, 22, 0.72) 0%,
      rgba(6,95,70,0.7) 50%,
      rgba(4,120,87,0.72) 100%
    );
    pointer-events:none;
  }
`;

/* QUICK ACTIONS */
const QuickActionsSection = styled.section`
  padding: 5rem 1.5rem;
  position: relative;
  background-image: url('https://picsum.photos/1920/1080?random=60');
  background-size: cover;
  background-position: center;
  margin: 0;
  &::before { content: ''; position:absolute; inset:0; background: linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.97) 100%); }
  & > * { position: relative; z-index:1; }
`;

const QuickActionsGrid = styled.div`
  max-width: 1200px;
  margin:0 auto;
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap:2rem;
  transform: translate3d(0, calc(var(--parallax-base, 0px) * ${FG_SCALE * 0.8}), 0);
  will-change: transform;
`;

/* Small cards */
const QuickActionCard = styled(Link)` display:block; padding:2.5rem 2rem; background: linear-gradient(135deg,#f8fafc,#ffffff); border-radius:20px; text-decoration:none; text-align:center; transition:all 0.3s ease; border:2px solid #e2e8f0; animation:${fadeInUp} 0.6s ease-out; &:hover { transform: translateY(-8px); border-color:#3b82f6; box-shadow:0 25px 50px -12px rgba(59,130,246,0.25); } `;
const QuickActionIcon = styled.div` width:70px; height:70px; margin:0 auto 1.5rem; background: linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:18px; display:flex; align-items:center; justify-content:center; color:white; transition:transform 0.3s ease; box-shadow:0 10px 25px -5px rgba(59,130,246,0.4); ${QuickActionCard}:hover & { transform: scale(1.15) rotate(5deg); } `;
const QuickActionTitle = styled.h3` font-size:1.375rem; font-weight:700; color:#1e293b; margin:0 0 0.75rem; `;
const QuickActionDesc = styled.p` font-size:0.9375rem; color:#64748b; margin:0; line-height:1.6; `;

/* Connection banner, loading etc left as-is */
const ConnectionBanner = styled.div<{ $type: 'offline' | 'error' }>`
  background: ${props => props.$type === 'offline' ? 'linear-gradient(90deg,#fef2f2,#fee2e2)' : 'linear-gradient(90deg,#fefce8,#fef9c3)'};
  border-bottom: 2px solid ${props => props.$type === 'offline' ? '#ef4444' : '#eab308'};
  padding: 0.875rem;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:0.75rem;
  font-weight:600;
  color: ${props => props.$type === 'offline' ? '#dc2626' : '#a16207'};
  position:relative;
  z-index:50;
`;
const RetryButton = styled.button` display:flex; align-items:center; gap:0.375rem; padding:0.5rem 1rem; background:white; border:2px solid currentColor; border-radius:8px; color:inherit; font-weight:700; cursor:pointer; &:hover { background: currentColor; color:white; } `;
const LoadingContainer = styled.div` min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; background: linear-gradient(135deg,#667eea 0%, #764ba2 100%); color:white; svg { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `;
const LoadingText = styled.p` font-size:1.25rem; font-weight:600; `;

/* =========================
   Hooks: network + api (unchanged)
   ========================= */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
};

const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'online' | 'offline' | 'error'>('online');
  const isOnline = useNetworkStatus();

  const fetchPortfolios = useCallback(async () => {
    if (!isOnline) {
      setConnectionState('offline');
      setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const apiClient = getApiClient();
      const portfolioData = await apiClient.portfolio?.discover?.({}, 1, 6);
      if (Array.isArray(portfolioData)) {
        setPortfolios(portfolioData.map(normalizePortfolio));
      } else if ((portfolioData as any)?.portfolios) {
        setPortfolios((portfolioData as any).portfolios.map(normalizePortfolio));
      } else {
        setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
      }
      setConnectionState('online');
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
      setError('Failed to load portfolios');
      setConnectionState('error');
      setPortfolios(Object.values(MOCK_PORTFOLIOS).slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => { fetchPortfolios(); }, [fetchPortfolios]);

  return { portfolios, loading, error, connectionState, refetch: fetchPortfolios };
};

/* =========================
   New: useParallaxCSS hook
   - writes a per-section pixel offset into --parallax-base
   - respects prefers-reduced-motion
   - runs only when section is visible via IntersectionObserver
   - uses requestAnimationFrame (no React state per frame)
   ========================= */
function useParallaxCSS(
  ref: React.RefObject<HTMLElement | null>,
  {
    multiplier = 120,
    sensitivity = 0.9,
    reduceOnMobile = true,
  }: { multiplier?: number; sensitivity?: number; reduceOnMobile?: boolean } = {}
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // honor reduced motion
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      el.style.setProperty('--parallax-base', '0px');
      return;
    }

    const computeMultiplier = () => (reduceOnMobile && window.innerWidth < 768 ? multiplier * 0.5 : multiplier);

    let rafId: number | null = null;
    let active = true;
    let isIntersecting = false;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        isIntersecting = e.isIntersecting;
        if (isIntersecting && rafId == null) {
          rafId = requestAnimationFrame(tick);
        } else if (!isIntersecting) {
          // snap to zero when offscreen to avoid odd transforms
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

      // write pixel value
      el.style.setProperty('--parallax-base', `${px}px`);

      rafId = requestAnimationFrame(tick);
    }

    // initial tick to set var
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

/* =========================
   MAIN PAGE Component
   ========================= */
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { portfolios, loading, connectionState, refetch } = usePortfolios();

  // refs for sections
  const heroRef = useRef<HTMLElement | null>(null);
  const section1Ref = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLElement | null>(null);
  const portfoliosRef = useRef<HTMLElement | null>(null);
  const section2Ref = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLElement | null>(null);

  // wire up per-section parallax CSS loops
  useParallaxCSS(heroRef, { multiplier: HERO_MULTIPLIER, sensitivity: 0.95, reduceOnMobile: true });
  useParallaxCSS(section1Ref, { multiplier: SECTION1_MULTIPLIER, sensitivity: 0.8, reduceOnMobile: true });
  useParallaxCSS(statsRef, { multiplier: 60, sensitivity: 0.6, reduceOnMobile: true });
  useParallaxCSS(portfoliosRef, { multiplier: 55, sensitivity: 0.6, reduceOnMobile: true });
  useParallaxCSS(section2Ref, { multiplier: SECTION2_MULTIPLIER, sensitivity: 0.8, reduceOnMobile: true });
  useParallaxCSS(actionsRef, { multiplier: 45, sensitivity: 0.7, reduceOnMobile: true });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  const handlePortfolioClick = (username: string) => {
    router.push(`/portfolio/${username}`);
  };

  const getInitials = (name: string) => {
    if (!name?.trim()) return '??';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading && portfolios.length === 0) {
    return (
      <LoadingContainer>
        <Loader2 size={64} />
        <LoadingText>Loading amazing portfolios...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <PageWrapper>
      <MainContainer>
        {connectionState !== 'online' && (
          <ConnectionBanner $type={connectionState === 'offline' ? 'offline' : 'error'}>
            {connectionState === 'offline' ? <WifiOff size={20} /> : <AlertCircle size={20} />}
            {connectionState === 'offline' ? "You're offline - Showing cached content" : "Connection issues - Showing cached content"}
            <RetryButton onClick={refetch}><RefreshCw size={14} /> Retry</RetryButton>
          </ConnectionBanner>
        )}

        {/* HERO */}
        <HeroSection ref={heroRef}>
          <HeroParallaxBg />

          <HeroFloatingElements aria-hidden>
            <FloatingShape $delay={0} $duration={20} $top="10%" $left="10%" />
            <FloatingShape $delay={2} $duration={15} $top="60%" $left="80%" />
            <FloatingShape $delay={1} $duration={18} $top="30%" $left="85%" />
            <FloatingShape $delay={3} $duration={22} $top="80%" $left="15%" />
          </HeroFloatingElements>

          <HeroContent>
            <HeroTitle>Discover <span>Creative</span> Excellence</HeroTitle>
            <HeroSubtitle>
              Connect with talented creators, develop your skills, and showcase your work to a global community
            </HeroSubtitle>

            <SearchContainer onSubmit={handleSearch}>
              <SearchIconWrapper><Search size={22} /></SearchIconWrapper>
              <SearchInput
                type="search"
                placeholder="Search portfolios, skills, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchButton type="submit">Search</SearchButton>
            </SearchContainer>

            <HeroButtons>
              {user ? (
                <HeroPrimaryBtn href="/dashboard"><Rocket size={20} /> Go to Dashboard</HeroPrimaryBtn>
              ) : (
                <HeroPrimaryBtn href="/login"><Sparkles size={20} /> Get Started Free</HeroPrimaryBtn>
              )}
              <HeroSecondaryBtn href="/thrive"><Zap size={20} /> Explore Skills Arena</HeroSecondaryBtn>
            </HeroButtons>
          </HeroContent>

          <ScrollIndicator><ScrollDot /></ScrollIndicator>
        </HeroSection>

        {/* PARALLAX SECTION 1 */}
        <ParallaxSection1 ref={section1Ref}>
          <ParallaxBg1 />
          <ParallaxContent>
            <ParallaxTitle>Build Your Creative Brand</ParallaxTitle>
            <ParallaxText>
              Showcase your best work with stunning portfolio templates. Stand out from the crowd
              and attract opportunities that match your creative vision and talent.
            </ParallaxText>
            <ParallaxButton href={user ? "/dashboard/profile" : "/login"}>
              {user ? "Edit Your Portfolio" : "Create Portfolio"} <ArrowRight size={20} />
            </ParallaxButton>
          </ParallaxContent>
        </ParallaxSection1>

        {/* STATS */}
        <StatsSection ref={statsRef}>
          <StatsGrid>
            <StatCard><StatIcon><Users size={32} /></StatIcon><StatNumber>1,247</StatNumber><StatLabel>Active Creators</StatLabel></StatCard>
            <StatCard><StatIcon><Grid3X3 size={32} /></StatIcon><StatNumber>120</StatNumber><StatLabel>Portfolios</StatLabel></StatCard>
            <StatCard><StatIcon><Palette size={32} /></StatIcon><StatNumber>900+</StatNumber><StatLabel>Creative Works</StatLabel></StatCard>
            <StatCard><StatIcon><TrendingUp size={32} /></StatIcon><StatNumber>45</StatNumber><StatLabel>Online Now</StatLabel></StatCard>
          </StatsGrid>
        </StatsSection>

        {/* FEATURED PORTFOLIOS */}
        <PortfoliosSection ref={portfoliosRef}>
          <SectionHeader>
            <SectionTitle><Star size={32} /> Featured Creators</SectionTitle>
            <ViewAllLink href="/explore">View All <ChevronRight size={20} /></ViewAllLink>
          </SectionHeader>

          <PortfolioGrid>
            {portfolios.map((portfolio) => {
              const portfolioId = getPortfolioId(portfolio);
              if (!portfolioId) return null;
              return (
                <PortfolioCard key={`${portfolioId}-${portfolio.username}`} onClick={() => handlePortfolioClick(portfolio.username)}>
                  <PortfolioCover $gradient={!portfolio.coverImage}>
                    <PortfolioBadge>{portfolio.kind}</PortfolioBadge>
                    {portfolio.coverImage ? (
                      <NextImage src={portfolio.coverImage} alt={`${portfolio.title}'s portfolio`} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <User size={52} color="white" opacity={0.5} />
                    )}
                  </PortfolioCover>

                  <PortfolioContent>
                    <PortfolioHeader>
                      <PortfolioAvatar>
                        {portfolio.profileImage ? (
                          <NextImage src={portfolio.profileImage} alt={portfolio.title || portfolio.username} width={52} height={52} style={{ borderRadius: '14px' }} />
                        ) : (
                          getInitials(portfolio.title || portfolio.username)
                        )}
                      </PortfolioAvatar>

                      <PortfolioInfo>
                        <PortfolioUsername>@{portfolio.username}</PortfolioUsername>
                        <PortfolioTitle>{portfolio.title}</PortfolioTitle>
                      </PortfolioInfo>
                    </PortfolioHeader>

                    {portfolio.bio && <PortfolioBio>{portfolio.bio}</PortfolioBio>}

                    <PortfolioStats>
                      <PortfolioStat><Eye /><span>{utils.data.formatNumber(portfolio.stats?.totalViews || 0)}</span></PortfolioStat>
                      <PortfolioStat><Image /><span>{portfolio.stats?.totalPieces || 0}</span></PortfolioStat>
                      <PortfolioStat><Star /><span>{portfolio.stats?.averageRating?.toFixed(1) || 'N/A'}</span></PortfolioStat>
                    </PortfolioStats>
                  </PortfolioContent>
                </PortfolioCard>
              );
            })}
          </PortfolioGrid>
        </PortfoliosSection>

        {/* PARALLAX SECTION 2 */}
        <ParallaxSection2 ref={section2Ref}>
          <ParallaxBg2 />
          <ParallaxContent>
            <ParallaxTitle>Level Up Your Skills</ParallaxTitle>
            <ParallaxText>
              Challenge yourself in the Skills Arena. Practice creative techniques, compete with peers,
              and track your progress as you master new abilities.
            </ParallaxText>
            <ParallaxButton href="/thrive">Enter Arena <Target size={20} /></ParallaxButton>
          </ParallaxContent>
        </ParallaxSection2>

        {/* QUICK ACTIONS */}
        <QuickActionsSection ref={actionsRef}>
          <SectionHeader><SectionTitle><Zap size={32} /> Quick Actions</SectionTitle></SectionHeader>

          <QuickActionsGrid>
            <QuickActionCard href="/explore">
              <QuickActionIcon><Grid3X3 size={28} /></QuickActionIcon>
              <QuickActionTitle>Browse Portfolios</QuickActionTitle>
              <QuickActionDesc>Discover amazing collections of creative work from talented artists</QuickActionDesc>
            </QuickActionCard>

            <QuickActionCard href="/thrive">
              <QuickActionIcon><Target size={28} /></QuickActionIcon>
              <QuickActionTitle>Skills Arena</QuickActionTitle>
              <QuickActionDesc>Challenge yourself with interactive games and creative exercises</QuickActionDesc>
            </QuickActionCard>

            <QuickActionCard href="/dashboard/profile">
              <QuickActionIcon><Trophy size={28} /></QuickActionIcon>
              <QuickActionTitle>Build Portfolio</QuickActionTitle>
              <QuickActionDesc>Create your professional showcase and stand out to opportunities</QuickActionDesc>
            </QuickActionCard>
          </QuickActionsGrid>
        </QuickActionsSection>
      </MainContainer>
    </PageWrapper>
  );
}
