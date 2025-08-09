// src/app/thrive/styles.ts - Modern Glassmorphism Design
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';

export const PageWrapper = styled.div`
  background: ${theme.colors.background.primary};
  min-height: 100vh;
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;

  // Subtle background pattern
  &::before {
    content: '';
    position: absolute;
    top: -25%;
    left: -25%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, ${themeUtils.alpha(theme.colors.primary[600], 0.02)} 1px, transparent 1px);
    background-size: 50px 50px;
    animation: drift 30s ease-in-out infinite;
    z-index: 0;
  }

  @keyframes drift {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(1deg); }
    66% { transform: translate(-20px, 20px) rotate(-1deg); }
  }

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.xl} ${theme.spacing.md};
  }
`;

export const HeroSection = styled.div`
  text-align: center;
  position: relative;
  z-index: 1;
  margin-bottom: ${theme.spacing['4xl']};
  max-width: 800px;

  @media (max-width: ${theme.breakpoints.md}) {
    margin-bottom: ${theme.spacing['3xl']};
  }
`;

export const HeroTitle = styled.h1`
  font-size: ${theme.typography.sizes['5xl']};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.secondary};
  background: linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.accent.blue});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.lg};
  letter-spacing: ${theme.typography.letterSpacing.tight};
  line-height: ${theme.typography.lineHeights.tight};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.sizes['4xl']};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.sizes['3xl']};
  }
`;

export const HeroSubtitle = styled.p`
  font-size: ${theme.typography.sizes.xl};
  color: ${theme.colors.text.secondary};
  margin: 0 auto ${theme.spacing['2xl']};
  max-width: 600px;
  line-height: ${theme.typography.lineHeights.relaxed};
  font-family: ${theme.typography.fonts.primary};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.sizes.lg};
    margin-bottom: ${theme.spacing.xl};
  }
`;

export const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing['2xl']};
  flex-wrap: wrap;
  margin-top: ${theme.spacing['2xl']};

  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.lg};
  }
`;

export const StatItem = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  min-width: 120px;
  ${themeUtils.hoverLift}

  &:hover {
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.95)};
    border-color: ${theme.colors.primary[600]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.lg};
    min-width: 100px;
  }
`;

export const StatValue = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.secondary};
  line-height: ${theme.typography.lineHeights.tight};

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.sizes['2xl']};
  }
`;

export const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.primary};
`;

export const CardsSection = styled.div`
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 1;

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing.xl};
    width: 100%;

    @media (max-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: ${theme.spacing.lg};
    }

    @media (max-width: ${theme.breakpoints.sm}) {
      grid-template-columns: 1fr;
    }
  }
`;

export const Card = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  position: relative;
  backdrop-filter: blur(${theme.glass.blur});

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[600]};
    background: ${themeUtils.alpha(theme.colors.background.secondary, 0.95)};
  }

  &:active {
    transform: translateY(-4px);
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing['2xl']};
  min-height: 200px;
  text-align: center;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.xl};
  }
`;

export const CardIcon = styled.div<{ $color?: string }>`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.md};
  background: ${({ $color }) => $color || `linear-gradient(135deg, ${theme.colors.primary[600]}, ${theme.colors.accent.blue})`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: ${theme.spacing.lg};
  transition: ${theme.transitions.normal};
  backdrop-filter: blur(${theme.glass.blurSubtle});

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

export const CardTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fonts.secondary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

export const CardDescription = styled.p`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeights.relaxed};
  margin: 0;
  font-family: ${theme.typography.fonts.primary};
`;

export const ExercisesSection = styled.div`
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;
  margin-top: ${theme.spacing['4xl']};

  @media (max-width: ${theme.breakpoints.md}) {
    margin-top: ${theme.spacing['3xl']};
  }
`;

export const ExercisesContainer = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']};
  backdrop-filter: blur(${theme.glass.blur});

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.xl};
  }
`;

export const ExercisesTitle = styled.h2`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  font-family: ${theme.typography.fonts.secondary};
  letter-spacing: ${theme.typography.letterSpacing.wide};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.sizes['2xl']};
    margin-bottom: ${theme.spacing.lg};
  }
`;

export const LeaderboardSection = styled.div`
  margin-top: ${theme.spacing['2xl']};

  h3 {
    font-size: ${theme.typography.sizes.xl};
    font-weight: ${theme.typography.weights.medium};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing.lg};
    font-family: ${theme.typography.fonts.secondary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
  }
`;

export const ScoresList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const ScoreItem = styled.li<{ $rank?: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${({ $rank }) => 
    $rank && $rank <= 3 
      ? themeUtils.alpha(theme.colors.accent.amber, 0.1)
      : theme.colors.background.tertiary
  };
  border: 1px solid ${({ $rank }) => 
    $rank && $rank <= 3 
      ? themeUtils.alpha(theme.colors.accent.amber, 0.2)
      : theme.colors.border.glass
  };
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.primary};
  backdrop-filter: blur(${theme.glass.blurSubtle});
  transition: ${theme.transitions.normal};

  &:hover {
    background: ${({ $rank }) => 
      $rank && $rank <= 3 
        ? themeUtils.alpha(theme.colors.accent.amber, 0.15)
        : theme.colors.background.quaternary
    };
    transform: translateX(4px);
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.bold};
  font-size: ${theme.typography.sizes.sm};
  flex-shrink: 0;
  color: white;

  background: ${({ $rank }) => {
    if ($rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
    if ($rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e5e7eb)';
    if ($rank === 3) return 'linear-gradient(135deg, #cd7f32, #d97706)';
    return theme.colors.background.tertiary;
  }};

  color: ${({ $rank }) => {
    if ($rank === 1) return '#92400e';
    if ($rank === 2) return '#374151';
    if ($rank === 3) return 'white';
    return theme.colors.text;
  }};
`;

export const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PlayerName = styled.span`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
`;

export const PlayerScore = styled.span`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.xs};
`;

// Loading and error states
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: ${theme.spacing.lg};
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.border.light};
  border-top: 3px solid ${theme.colors.primary[600]};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
  margin: 0;
`;

export const ErrorContainer = styled.div`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xl};
  text-align: center;
  border-left: 4px solid ${theme.colors.accent.rose};
`;

export const ErrorTitle = styled.h3`
  color: ${theme.colors.accent.rose};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  margin-bottom: ${theme.spacing.sm};
`;

export const ErrorMessage = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
  margin: 0;
`;

// Action buttons
export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  text-transform: uppercase;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  border: 1px solid transparent;

  ${({ $variant = 'primary' }) => {
    if ($variant === 'primary') {
      return `
        background: ${theme.colors.primary[600]};
        color: ${theme.colors.text.inverse};
        border-color: ${theme.colors.primary[600]};

        &:hover {
          background: ${theme.colors.primary[700]};
          border-color: ${theme.colors.primary[700]};
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.md};
        }
      `;
    } else {
      return `
        ${themeUtils.glass(0.8)}
        color: ${theme.colors.text.secondary};
        border-color: ${theme.colors.border.glass};

        &:hover {
          background: ${theme.colors.background.tertiary};
          border-color: ${theme.colors.primary[600]};
          color: ${theme.colors.text.primary};
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.glassSubtle};
        }
      `;
    }
  }}

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;