// src\components\homerank\homerank.styles.ts
import { Loader2 } from 'lucide-react';
import styled, { keyframes } from 'styled-components';


/* ---------- ANIMATIONS ---------- */
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

export const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ---------- SPACING ---------- */
export const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
  xxl: `${6.854}rem`,
};

/* ---------- LAYOUT ---------- */
export const Page = styled.main`
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
  overflow-x: hidden;
`;

export const BackgroundPattern = styled.div`
  position: fixed;
  inset: 0;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
`;

export const FloatingOrb = styled.div<{ $delay: number; $size: number; $top: string; $left: string; $color: string }>`
  position: fixed;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle, ${p => p.$color}40, transparent);
  top: ${p => p.$top};
  left: ${p => p.$left};
  animation: ${float} ${p => 4 + p.$delay}s ease-in-out infinite;
  animation-delay: ${p => p.$delay}s;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
`;

export const Hero = styled.header`
  width: 100%;
  background: linear-gradient(135deg, rgba(30,41,59,0.97), rgba(59,130,246,0.93));
  padding: ${GOLDEN_SPACING.xl} ${GOLDEN_SPACING.md};
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.3;
    animation: ${rotate} 60s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation: ${shimmer} 3s infinite;
  }
`;

export const HeroInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${GOLDEN_SPACING.md};
  position: relative;
  z-index: 1;
  animation: ${fadeInUp} 0.6s ease-out;
`;

export const HeroIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  
  svg {
    animation: ${float} 3s ease-in-out infinite;
  }
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

export const HeroText = styled.div`
  max-width: 800px;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  
  span {
    background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
`;

export const HeroSubtitle = styled.p`
  margin: ${GOLDEN_SPACING.sm} auto 0;
  font-size: clamp(1rem, 2vw, 1.15rem);
  opacity: 0.95;
  line-height: 1.6;
  max-width: 600px;
`;

export const HeroStats = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.xl};
  margin-top: ${GOLDEN_SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

export const HeroStat = styled.div`
  text-align: center;
  animation: ${slideInLeft} 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`;

export const HeroStatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
`;

export const HeroStatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.85;
  margin-top: 0.25rem;
`;

export const Container = styled.div`
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: ${GOLDEN_SPACING.lg} ${GOLDEN_SPACING.md};
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: ${GOLDEN_SPACING.lg};
  position: relative;
  z-index: 1;
  
  @media (max-width: 1200px) {
    grid-template-columns: 300px 1fr;
    gap: ${GOLDEN_SPACING.md};
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${GOLDEN_SPACING.md};
  animation: ${fadeInUp} 0.5s ease-out;
`;

export const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #667eea;
`;

export const LoadingText = styled.div`
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 600;
`;

export const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: ${GOLDEN_SPACING.lg};
  color: #991b1b;
  font-weight: 600;
  text-align: center;
  animation: ${scaleIn} 0.4s ease-out;
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SPACING.lg};
`;

export const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${GOLDEN_SPACING.md};
  animation: ${slideInRight} 0.5s ease-out;
`;

export const StatCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: ${GOLDEN_SPACING.md};
  border: 1px solid rgba(2,6,23,0.06);
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

export const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${p => p.$color}12;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color};
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  ${StatCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px ${p => p.$color}25;
  }
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.35rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
`;

export const ListingsSection = styled.div`
  animation: ${fadeInUp} 0.6s ease-out 0.3s;
  animation-fill-mode: both;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${GOLDEN_SPACING.lg};
  padding-bottom: ${GOLDEN_SPACING.md};
  border-bottom: 2px solid rgba(2,6,23,0.06);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

export const SectionTitleMain = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
`;

export const ResultCount = styled.span`
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
  padding: 0.5rem ${GOLDEN_SPACING.sm};
  background: rgba(102, 126, 234, 0.08);
  border-radius: 8px;
`;

export const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${GOLDEN_SPACING.lg};
`;

export const PropertyCard = styled.div<{ $active?: boolean }>`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid ${p => p.$active ? '#667eea' : 'rgba(2,6,23,0.06)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: ${p => p.$active 
    ? '0 16px 40px rgba(102, 126, 234, 0.25)' 
    : '0 4px 12px rgba(0, 0, 0, 0.04)'
  };
  animation: ${scaleIn} 0.4s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(n+1):nth-child(-n+6) {
    animation-delay: calc(0.05s * (var(--index) - 1));
  }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
    border-color: ${p => p.$active ? '#667eea' : 'rgba(102, 126, 234, 0.3)'};
  }
`;

export const PropertyImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 220px;
  background: url(${p => p.$url}) center/cover;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05));
    pointer-events: none;
  }
  
  ${PropertyCard}:hover & {
    &::before {
      background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.1));
    }
  }
`;

export const PropertyBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${p => {
    if (p.$status === 'active') return 'linear-gradient(135deg, #10b981, #059669)';
    if (p.$status === 'pending') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  animation: ${scaleIn} 0.3s ease-out 0.2s;
  animation-fill-mode: both;
`;

export const PropertyInfo = styled.div`
  padding: ${GOLDEN_SPACING.lg};
`;

export const PropertyPrice = styled.div`
  font-size: 1.7rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.xs};
  line-height: 1;
`;

export const PropertyAddress = styled.div`
  font-size: 1rem;
  color: #475569;
  margin-bottom: ${GOLDEN_SPACING.md};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
    color: #667eea;
  }
`;

export const PropertyFeatures = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  padding-top: ${GOLDEN_SPACING.md};
  border-top: 1px solid rgba(2,6,23,0.06);
`;

export const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  
  svg {
    color: #667eea;
    flex-shrink: 0;
  }
`;

export const PropertyActions = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.sm};
  padding: 0 ${GOLDEN_SPACING.lg} ${GOLDEN_SPACING.lg};
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.65rem ${GOLDEN_SPACING.sm};
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${p => p.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: transparent;
    color: #667eea;
    border: 2px solid rgba(102, 126, 234, 0.2);
    
    &:hover {
      background: rgba(102, 126, 234, 0.05);
      border-color: #667eea;
    }
  `}
`;
