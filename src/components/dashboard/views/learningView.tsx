// src/components/dashboard/views/LearningView.tsx - Modern Glassmorphism Design
import React from 'react';
import styled from 'styled-components';
import { Brain, BookOpen, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { ConceptProgress, QuickStats } from '../dashboardLogic';
import { theme, themeUtils } from '@/styles/theme';

// Import unified view styles
import {
  ViewContainer,
  ViewStatsGrid,
  ViewStatCard,
  ViewStatIcon,
  ViewStatContent,
  ViewStatValue,
  ViewStatLabel,
  ViewGrid,
  ViewCard,
  ViewCardHeader,
  ViewCardContent,
  ViewCardTitle,
  ViewCardDescription,
  ViewTag,
  StatusIndicator,
  ProgressContainer,
  ProgressBar,
  ProgressFill,
  ProgressText,
  ViewActionGroup,
  ViewAction,
  EmptyStateCard,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage,
  GlassCard,
  PrimaryButton,
  SecondaryButton
} from './viewStyles';

interface LearningViewProps {
  conceptProgress: ConceptProgress[];
  stats: QuickStats;
}

export const LearningView: React.FC<LearningViewProps> = ({ conceptProgress, stats }) => {
  // Calculate learning stats
  const completedConcepts = conceptProgress.filter(c => c.status === 'completed').length;
  const inProgressConcepts = conceptProgress.filter(c => c.status === 'in-progress').length;
  const averageScore = stats.averageScore || 0;

  return (
    <ViewContainer>
      <ModernSection>
        <SectionHeader>
          <SectionTitle>
            <TitleIcon>
              <Brain size={24} />
            </TitleIcon>
            <TitleContent>
              <MainTitle>Learning Dashboard</MainTitle>
              <Badge>{completedConcepts} completed</Badge>
            </TitleContent>
          </SectionTitle>
          <SectionActions>
            <ModernActionButton $primary>
              <BookOpen size={16} />
              Explore Concepts
            </ModernActionButton>
          </SectionActions>
        </SectionHeader>

        <SectionContent>
          {/* Learning Statistics */}
          <ViewStatsGrid>
            <ViewStatCard>
              <ViewStatIcon>
                <BookOpen size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{conceptProgress.length}</ViewStatValue>
                <ViewStatLabel>Total Concepts</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon>
                <CheckCircle size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{completedConcepts}</ViewStatValue>
                <ViewStatLabel>Completed</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon>
                <TrendingUp size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{averageScore.toFixed(0)}%</ViewStatValue>
                <ViewStatLabel>Avg. Score</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon>
                <Zap size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{inProgressConcepts}</ViewStatValue>
                <ViewStatLabel>In Progress</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
          </ViewStatsGrid>
          
          {/* Concepts Grid */}
          <ConceptsSection>
            <SubSectionTitle>Your Learning Journey</SubSectionTitle>
            <ViewGrid $minWidth="320px">
              {conceptProgress.length > 0 ? (
                conceptProgress.slice(0, 8).map(concept => (
                  <ViewCard key={concept.conceptId}>
                    <ViewCardContent>
                      <ViewCardHeader>
                        <StatusIndicator $status={concept.status}>
                          {concept.status === 'completed' && <CheckCircle size={16} />}
                          {concept.status === 'in-progress' && <Clock size={16} />}
                          {concept.status === 'not-started' && <BookOpen size={16} />}
                        </StatusIndicator>
                        
                        <ViewTag>
                          {concept.difficulty || 'intermediate'}
                        </ViewTag>
                      </ViewCardHeader>
                      
                      <ViewCardTitle>
                        {concept.title || `Concept ${concept.conceptId}`}
                      </ViewCardTitle>
                      
                      <ViewCardDescription>
                        Category: {concept.category || 'General'}
                      </ViewCardDescription>
                      
                      {concept.score && (
                        <ProgressContainer>
                          <ProgressBar>
                            <ProgressFill $percentage={concept.score} />
                          </ProgressBar>
                          <ProgressText>{concept.score}%</ProgressText>
                        </ProgressContainer>
                      )}
                      
                      <ViewActionGroup>
                        <ViewAction $primary>
                          {concept.status === 'not-started' ? 'Start' : 
                           concept.status === 'in-progress' ? 'Continue' : 'Review'}
                        </ViewAction>
                      </ViewActionGroup>
                    </ViewCardContent>
                  </ViewCard>
                ))
              ) : (
                <EmptyStateCard>
                  <EmptyIcon>
                    <Brain size={48} />
                  </EmptyIcon>
                  <EmptyTitle>Ready to learn?</EmptyTitle>
                  <EmptyMessage>
                    Explore our library of concepts and start your learning journey
                  </EmptyMessage>
                  <ModernActionButton $primary>
                    <BookOpen size={16} />
                    Browse concepts
                  </ModernActionButton>
                </EmptyStateCard>
              )}
            </ViewGrid>
          </ConceptsSection>
        </SectionContent>
      </ModernSection>
    </ViewContainer>
  );
};

// Modern styled components matching the new theme
const ModernSection = styled.section`
  ${themeUtils.glass(0.9)}
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  backdrop-filter: blur(${theme.glass.blur});
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing['2xl']};
  border-bottom: 1px solid ${theme.colors.border.glass};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.8)};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
    padding: ${theme.spacing.xl};
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const TitleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.1)};
  border: 1px solid ${themeUtils.alpha(theme.colors.primary[600], 0.2)};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.primary[600]};
  backdrop-filter: blur(${theme.glass.blurSubtle});
`;

const TitleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const MainTitle = styled.h2`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0;
  font-family: ${theme.typography.fonts.secondary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const SectionActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ModernActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.sizes.sm};
  background: ${props => props.$primary ? theme.colors.primary[600] : themeUtils.alpha(theme.colors.background.secondary, 0.8)};
  color: ${props => props.$primary ? theme.colors.text.inverse : theme.colors.text.secondary};
  border: 1px solid ${props => props.$primary ? theme.colors.primary[600] : theme.colors.border.glass};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fonts.primary};
  backdrop-filter: blur(${theme.glass.blurSubtle});
  
  &:hover {
    background: ${props => props.$primary ? theme.colors.primary[700] : theme.colors.background.tertiary};
    border-color: ${theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.glassSubtle};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SectionContent = styled.div`
  padding: ${theme.spacing['2xl']};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.xl};
  }
`;

const ConceptsSection = styled.div`
  margin-top: ${theme.spacing['2xl']};
`;

const SubSectionTitle = styled.h3`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xl} 0;
  font-family: ${theme.typography.fonts.secondary};
  letter-spacing: ${theme.typography.letterSpacing.wide};
`;

const Badge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.sizes.xs};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.8)};
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.glass};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.weights.medium};
  text-transform: lowercase;
  letter-spacing: ${theme.typography.letterSpacing.normal};
  font-family: ${theme.typography.fonts.primary};
  backdrop-filter: blur(${theme.glass.blurSubtle});
`;