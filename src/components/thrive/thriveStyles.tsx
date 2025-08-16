// src/components/dashboard/thrive/thriveStyles.tsx - Dashboard thrive styles using existing design system
import styled from 'styled-components';
import { theme } from '@/styles/styled-components';
import {
  Card,
  BaseButton,
  glassEffect,
  hoverLift
} from '@/styles/styled-components';

// Hero section styles
export const ThriveHeroSection = styled.div`
  text-align: center;
  padding: ${theme.spacing['2xl']} 0;
  margin-bottom: ${theme.spacing.xl};
`;

export const ThriveHeroTitle = styled.h1`
  font-family: ${theme.typography.fonts.display};
  font-size: ${theme.typography.sizes['3xl']};
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.accent.blue});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.weights.semibold};
`;

export const ThriveHeroSubtitle = styled.p`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  max-width: 600px;
  margin: 0 auto ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
`;

// Stats grid styles
export const ThriveStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

export const ThriveStatCard = styled(Card)`
  ${glassEffect}
  text-align: center;
  cursor: default;
`;

export const ThriveStatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.$color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto ${theme.spacing.sm};
  box-shadow: ${theme.shadows.sm};
`;

export const ThriveStatValue = styled.div`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.display};
`;

export const ThriveStatLabel = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

// Main content layout
export const ThriveMainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Section styles
export const ThriveSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const ThriveSectionTitle = styled.h2`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const ThriveViewAllLink = styled.a`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.accent.blue};
  text-decoration: none;
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.primary[500]};
  }
`;

// Challenge card styles
export const ThriveChallengeCard = styled(Card)<{ $featured?: boolean }>`
  ${glassEffect}
  cursor: pointer;
  position: relative;
  border: 2px solid ${({ $featured }) => 
    $featured ? theme.colors.accent.blue : 'rgba(255, 255, 255, 0.3)'
  };
  
  ${({ $featured }) => $featured && `
    &::before {
      content: 'Recommended';
      position: absolute;
      top: ${theme.spacing.sm};
      right: ${theme.spacing.sm};
      background: ${theme.colors.accent.blue};
      color: white;
      padding: 0.25rem ${theme.spacing.sm};
      border-radius: ${theme.borderRadius.sm};
      font-size: 0.625rem;
      font-weight: ${theme.typography.weights.semibold};
      text-transform: uppercase;
      letter-spacing: 0.025em;
      z-index: 2;
    }
  `}
`;

export const ThriveChallengeIcon = styled.div<{ $gradient: string }>`
  width: 56px;
  height: 56px;
  background: ${props => props.$gradient};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
`;

export const ThriveChallengeTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  line-height: 1.3;
`;

export const ThriveChallengeDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.sizes.sm};
  line-height: 1.5;
  margin-bottom: ${theme.spacing.md};
`;

export const ThriveChallengeMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.sm};
`;

export const ThriveMetaItem = styled.div`
  text-align: center;
  flex: 1;
`;

export const ThriveMetaValue = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.xs};
  margin-bottom: 2px;
`;

export const ThriveMetaLabel = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const ThriveChallengeButton = styled(BaseButton)`
  width: 100%;
  justify-content: center;
  font-size: ${theme.typography.sizes.sm};
`;

// Sidebar styles
export const ThriveSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const ThriveSidebarCard = styled(Card)`
  ${glassEffect}
`;

export const ThriveSidebarTitle = styled.h3`
  font-family: ${theme.typography.fonts.body};
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

// Streak card (special highlight card)
export const ThriveStreakCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.accent.blue} 0%, ${theme.colors.primary[500]} 100%);
  color: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  text-align: center;
  position: relative;
  overflow: hidden;
`;

export const ThriveStreakValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.typography.fonts.display};
`;

export const ThriveStreakLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  opacity: 0.9;
`;

// Live session styles
export const ThriveLiveSession = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.background.tertiary};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.border.light};
    transform: translateX(2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ThriveSessionAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${theme.colors.accent.blue}, ${theme.colors.primary[500]});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${theme.typography.sizes.xs};
  flex-shrink: 0;
`;

export const ThriveSessionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ThriveSessionTitle = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.xs};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ThriveSessionHost = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
`;

export const ThriveSessionTime = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.accent.blue};
  font-weight: ${theme.typography.weights.medium};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Leaderboard styles
export const ThriveLeaderboardItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.sm};
  background: ${props => props.$rank <= 3 ? theme.colors.background.tertiary : 'transparent'};
  transition: ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.background.tertiary};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ThriveRankBadge = styled.div<{ $rank: number }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.bold};
  font-size: 0.625rem;
  flex-shrink: 0;
  
  ${props => {
    if (props.$rank === 1) return 'background: linear-gradient(135deg, #ffd700, #ffed4e); color: #92400e;';
    if (props.$rank === 2) return 'background: linear-gradient(135deg, #c0c0c0, #e5e7eb); color: #374151;';
    if (props.$rank === 3) return 'background: linear-gradient(135deg, #cd7f32, #d97706); color: white;';
    return `background: ${theme.colors.background.tertiary}; color: ${theme.colors.text.secondary};`;
  }}
`;

export const ThriveLeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ThriveLeaderName = styled.div`
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.sizes.xs};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ThriveLeaderScore = styled.div`
  font-size: 0.625rem;
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;