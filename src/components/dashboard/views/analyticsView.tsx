// src/components/dashboard/views/AnalyticsView.tsx
import React from 'react';
import styled from 'styled-components';
import { BarChart3, ArrowUpRight, Award, Sparkles, Brain, Target } from 'lucide-react';
import type { QuickStats, Achievement } from '../dashboardLogic';
import { theme } from '@/styles/theme';
import {
  Section,
  SectionHeader,
  SectionTitle
} from '../dashboardStyles';

interface AnalyticsViewProps {
  stats: QuickStats;
  achievements: Achievement[];
  formatTimeAgo: (date: Date) => string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  stats, 
  achievements, 
  formatTimeAgo 
}) => {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <BarChart3 size={20} />
          Analytics & Insights
        </SectionTitle>
      </SectionHeader>

      <AnalyticsGrid>
        <AnalyticsCard>
          <CardHeader>
            <CardTitle>Weekly Growth</CardTitle>
            <GrowthIndicator $positive={stats.weeklyGrowth > 0}>
              <ArrowUpRight size={16} />
              +{stats.weeklyGrowth}%
            </GrowthIndicator>
          </CardHeader>
          <ChartPlaceholder>
            <BarChart3 size={32} />
            <span>Activity trend visualization</span>
          </ChartPlaceholder>
        </AnalyticsCard>

        <AnalyticsCard>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <AchievementsList>
            {achievements.map(achievement => (
              <AchievementItem key={achievement.id} $rarity={achievement.rarity}>
                <AchievementIcon $rarity={achievement.rarity}>
                  {achievement.rarity === 'epic' && <Target size={16} />}
                  {achievement.rarity === 'rare' && <Brain size={16} />}
                  {achievement.rarity === 'common' && <Sparkles size={16} />}
                </AchievementIcon>
                <AchievementContent>
                  <AchievementTitle>{achievement.title}</AchievementTitle>
                  <AchievementDescription>{achievement.description}</AchievementDescription>
                  <AchievementTime>{formatTimeAgo(achievement.unlockedAt)}</AchievementTime>
                </AchievementContent>
              </AchievementItem>
            ))}
          </AchievementsList>
        </AnalyticsCard>
      </AnalyticsGrid>
    </Section>
  );
};

// Analytics-specific styled components
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing['2xl']};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.light};
  box-shadow: ${theme.shadows.sm};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const GrowthIndicator = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.semibold};
`;

const ChartPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: ${theme.borderRadius.md};
  border: 2px dashed ${theme.colors.border.dark};
  color: ${theme.colors.text.secondary};
  text-align: center;
  
  span {
    margin-top: ${theme.spacing.sm};
    font-size: ${theme.typography.sizes.sm};
  }
`;

const AchievementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const AchievementItem = styled.div<{ $rarity: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${props => {
    switch (props.$rarity) {
      case 'epic': return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      case 'rare': return 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)';
      default: return 'rgba(248, 250, 252, 0.8)';
    }
  }};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => {
    switch (props.$rarity) {
      case 'epic': return '#f59e0b';
      case 'rare': return '#8b5cf6';
      default: return theme.colors.border.medium;
    }
  }};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const AchievementIcon = styled.div<{ $rarity: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$rarity) {
      case 'epic': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'rare': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: ${theme.shadows.sm};
`;

const AchievementContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const AchievementTitle = styled.div`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.sm};
`;

const AchievementDescription = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
  margin-bottom: ${theme.spacing.xs};
`;

const AchievementTime = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.muted};
  font-weight: ${theme.typography.weights.medium};
`;