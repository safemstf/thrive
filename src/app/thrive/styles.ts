// src/app/thrive/styles.ts

import styled, { keyframes } from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';


// Category styled components
export const CategoryContainer = styled.div`
  margin-bottom: 2rem;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
`;

export const CategoryHeader = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  background: ${({ $isActive }) => $isActive 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'transparent'};
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const CategoryIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: ${({ $color }) => $color};
`;

export const CategoryContent = styled.div`
  padding: 0 1.5rem 1.5rem;
  animation: expand 0.5s ease-out;

  @keyframes expand {
    from { 
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
    to { 
      max-height: 2000px;
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

export const ActionCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    ${themeUtils.alpha(theme.colors.primary[600], 0.1)},
    ${themeUtils.alpha(theme.colors.primary[400], 0.05)}
  );
  border: 2px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.weights.semibold};
  transition: all ${theme.transitions.normal};
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, 
      ${themeUtils.alpha(theme.colors.primary[600], 0.15)},
      ${themeUtils.alpha(theme.colors.primary[400], 0.08)}
    );
    border-color: ${theme.colors.primary[300]};
    transform: translateX(4px);
  }
`;

// Base Components
export const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, 
    ${theme.colors.background.primary} 0%,
    ${themeUtils.alpha(theme.colors.primary[50], 0.3)} 100%
  );
  color: ${theme.colors.text.primary};
  overflow-x: hidden;
`;

// Hero Section
export const HeroSection = styled.section`
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing['2xl']};
  text-align: center;
  background: linear-gradient(135deg, 
    ${themeUtils.alpha(theme.colors.primary[600], 0.08)},
    ${themeUtils.alpha(theme.colors.primary[400], 0.04)}
  );
  border-bottom: 1px solid ${theme.colors.border.glass};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 0%, 
      ${themeUtils.alpha(theme.colors.primary[500], 0.1)} 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

export const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing.lg};
  backdrop-filter: blur(10px);
  animation: ${slideUp} 0.6s ease-out;
`;

export const TrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${themeUtils.alpha(theme.colors.primary[100], 0.8)};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.primary[700]};
`;

export const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  font-family: ${theme.typography.fonts.secondary};
  line-height: 1.1;
  animation: ${slideUp} 0.8s ease-out 0.2s both;
`;

export const GradientText = styled.span`
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[400]});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const HeroSubtitle = styled.p`
  font-size: ${theme.typography.sizes.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  line-height: ${theme.typography.lineHeights.relaxed};
  animation: ${slideUp} 0.8s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes.lg};
  }
`;

export const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin: ${theme.spacing.xl} auto;
  padding: ${theme.spacing.xl};
  max-width: 800px;
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.9)};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${theme.colors.border.glass};
  backdrop-filter: blur(20px);
  box-shadow: ${theme.shadows.lg};
  animation: ${slideUp} 0.8s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
    gap: ${theme.spacing.lg};
  }
`;

export const StatItem = styled.div`
  text-align: center;
  position: relative;
`;

export const AnimatedCounter = styled.div`
  position: relative;
`;

export const StatValue = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes['2xl']};
  }
`;

export const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

export const LiveIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: ${pulse} 2s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    width: 20px;
    height: 20px;
    border: 2px solid #10b981;
    border-radius: 50%;
    opacity: 0.3;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

export const CTAButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${theme.spacing.xl};
  animation: ${slideUp} 0.8s ease-out 0.8s both;
`;

export const PrimaryButton = styled.button`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.primary[700]});
  color: ${theme.colors.text.inverse};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${themeUtils.alpha('#fff', 0.2)}, transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary[700]}, ${theme.colors.primary[800]});
    transform: translateY(-3px);
    box-shadow: ${theme.shadows.xl};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

export const SecondaryButton = styled.button`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.8)};
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[400]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const BenefitsList = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${theme.spacing.xl};
  animation: ${slideUp} 0.8s ease-out 1s both;
`;

export const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

// Sections
export const GlassSection = styled.section`
  padding: ${theme.spacing['2xl']} ${theme.spacing.xl};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.6)};
  border-radius: ${theme.borderRadius.xl};
  margin: ${theme.spacing.xl} auto;
  max-width: 1400px;
  backdrop-filter: blur(20px);
  border: 1px solid ${theme.colors.border.glass};
  box-shadow: ${theme.shadows.lg};
  position: relative;
  
  @media (max-width: 768px) {
    margin: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
  }
`;

export const SectionTitle = styled.h2`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fonts.secondary};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes['2xl']};
    flex-direction: column;
    text-align: center;
    gap: ${theme.spacing.md};
  }
`;

// Assessment Cards
export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

export const AssessmentCard = styled.div<{ $color: string }>`
  ${themeUtils.glass(0.95)}
  border: 2px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.8)};
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px ${themeUtils.alpha(theme.colors.primary[600], 0.25)};
    border-color: ${theme.colors.primary[300]};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.$color};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${themeUtils.alpha('#fff', 0.05)}, transparent);
    transition: left 0.6s;
  }
  
  &:hover::after {
    left: 100%;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const CardIcon = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: ${theme.shadows.lg};
  flex-shrink: 0;
  transition: transform ${theme.transitions.normal};
  
  .assessment-card:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

export const CardContent = styled.div`
  flex: 1;
`;

export const CardTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-family: ${theme.typography.fonts.secondary};
`;

export const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

export const CardMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.5)};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.glass};
`;

export const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const MetricLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  &:last-child {
    font-size: ${theme.typography.sizes.xs};
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.weights.normal};
  }
`;

export const CardFooter = styled.div`
  margin-top: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

// Leaderboard
export const LeaderboardSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

export const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

export const LeaderboardItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  background: ${props => {
    if (props.$rank <= 3) {
      return `linear-gradient(135deg, 
        ${themeUtils.alpha(theme.colors.primary[400], 0.15)},
        ${themeUtils.alpha(theme.colors.primary[300], 0.08)}
      )`;
    }
    return themeUtils.alpha(theme.colors.background.tertiary, 0.6);
  }};
  border-radius: ${theme.borderRadius.xl};
  border: 1px solid ${props => props.$rank <= 3 ? theme.colors.primary[200] : theme.colors.border.glass};
  transition: all ${theme.transitions.normal};
  position: relative;
  
  &:hover {
    transform: translateX(8px);
    background: ${props => {
      if (props.$rank <= 3) {
        return `linear-gradient(135deg, 
          ${themeUtils.alpha(theme.colors.primary[400], 0.2)},
          ${themeUtils.alpha(theme.colors.primary[300], 0.1)}
        )`;
      }
      return themeUtils.alpha(theme.colors.background.tertiary, 0.8);
    }};
    box-shadow: ${theme.shadows.md};
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
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
    if (props.$rank === 1) return `linear-gradient(135deg, #fbbf24, #f59e0b)`;
    if (props.$rank === 2) return `linear-gradient(135deg, #d1d5db, #9ca3af)`;
    if (props.$rank === 3) return `linear-gradient(135deg, #fdba74, #fb923c)`;
    return `linear-gradient(135deg, ${theme.colors.primary[300]}, ${theme.colors.primary[400]})`;
  }};
  
  color: ${props => {
    if (props.$rank <= 3) return '#1f2937';
    return theme.colors.text.inverse;
  }};
  
  border: 3px solid ${theme.colors.background.secondary};
  box-shadow: ${theme.shadows.md};
`;

export const PlayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const PlayerName = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const PlayerScore = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

export const FloatingCard = styled.div`
  padding: ${theme.spacing.xl};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.9)};
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.xl};
  backdrop-filter: blur(20px);
  box-shadow: ${theme.shadows.lg};
  animation: ${float} 6s ease-in-out infinite;
`;

// Feature Cards
export const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
`;

export const FeatureCard = styled.div`
  ${themeUtils.glass(0.95)}
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  text-align: center;
  transition: all ${theme.transitions.normal};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.8)};
  
  &:hover {
    transform: translateY(-8px);
    border-color: ${theme.colors.primary[300]};
    box-shadow: 0 25px 50px -12px ${themeUtils.alpha(theme.colors.primary[600], 0.15)};
  }
`;

export const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.lg} auto;
  color: white;
  box-shadow: ${theme.shadows.lg};
  transition: transform ${theme.transitions.normal};
  
  .feature-card:hover & {
    transform: scale(1.1);
  }
`;

// CTA Section
export const CTASection = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']};
  background: linear-gradient(135deg, 
    ${themeUtils.alpha(theme.colors.primary[600], 0.1)},
    ${themeUtils.alpha(theme.colors.primary[400], 0.05)}
  );
  border-radius: ${theme.borderRadius.xl};
  margin: ${theme.spacing.xl} auto;
  max-width: 900px;
  border: 1px solid ${theme.colors.primary[200]};
  box-shadow: ${theme.shadows.xl};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, 
      ${themeUtils.alpha(theme.colors.primary[500], 0.08)} 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

export const CTATitle = styled.h2`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  font-family: ${theme.typography.fonts.secondary};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.sizes['2xl']};
  }
`;

export const CTADescription = styled.p`
  font-size: ${theme.typography.sizes.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
  line-height: ${theme.typography.lineHeights.relaxed};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

export const SecurityFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  flex-wrap: wrap;
`;

export const SecurityFeature = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-weight: ${theme.typography.weights.medium};
`;

// Export alias for compatibility
export const StatsContainer = HeroStats;