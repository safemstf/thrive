// src/components/dashboard/views/LearningView.tsx - Lean & Efficient
import React from 'react';
import { Brain, BookOpen, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { ConceptProgress, QuickStats } from '../dashboardLogic';

// Reuse existing styled components - no duplication!
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
  EmptyState,
  Card,
  FlexRow,
  FlexColumn,
  Heading2,
  Heading3,
  BaseButton,
  Badge
} from './viewStyles';

import styled from 'styled-components';

import { responsive } from '@/styles/styled-components';
// ===========================================
// LEARNING-SPECIFIC COMPONENTS ONLY
// ===========================================

const LearningSection = styled(Card).attrs({ $glass: true, $padding: 'none' })`
  overflow: hidden;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-border-light);
  background: rgba(255, 255, 255, 0.8);
  
  ${responsive.below.md} {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }
`;

const SectionTitle = styled(FlexRow).attrs({ $gap: 'var(--spacing-lg)', $align: 'center' })``;

const TitleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-primary-600);
  backdrop-filter: blur(4px);
`;

const TitleContent = styled(FlexColumn).attrs({ $gap: 'var(--spacing-xs)' })``;

const MainTitle = styled(Heading2)`
  margin: 0;
  font-family: var(--font-display);
  letter-spacing: 0.025em;
`;

const SectionActions = styled(FlexRow).attrs({ $gap: 'var(--spacing-sm)' })``;

const SectionContent = styled.div`
  padding: var(--spacing-2xl);
  
  ${responsive.below.md} {
    padding: var(--spacing-xl);
  }
`;

const ConceptsSection = styled.div`
  margin-top: var(--spacing-2xl);
`;

const SubSectionTitle = styled(Heading3)`
  margin: 0 0 var(--spacing-xl) 0;
  font-family: var(--font-display);
  letter-spacing: 0.025em;
`;

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
      <LearningSection>
        <SectionHeader>
          <SectionTitle>
            <TitleIcon>
              <Brain size={24} />
            </TitleIcon>
            <TitleContent>
              <MainTitle>Learning Dashboard</MainTitle>
              <Badge $variant="success">{completedConcepts} completed</Badge>
            </TitleContent>
          </SectionTitle>
          <SectionActions>
            <BaseButton $variant="primary">
              <BookOpen size={16} />
              Explore Concepts
            </BaseButton>
          </SectionActions>
        </SectionHeader>

        <SectionContent>
          {/* Learning Statistics */}
          <ViewStatsGrid>
            <ViewStatCard>
              <ViewStatIcon $color="#3b82f6">
                <BookOpen size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{conceptProgress.length}</ViewStatValue>
                <ViewStatLabel>Total Concepts</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon $color="#10b981">
                <CheckCircle size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{completedConcepts}</ViewStatValue>
                <ViewStatLabel>Completed</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon $color="#8b5cf6">
                <TrendingUp size={20} />
              </ViewStatIcon>
              <ViewStatContent>
                <ViewStatValue>{averageScore.toFixed(0)}%</ViewStatValue>
                <ViewStatLabel>Avg. Score</ViewStatLabel>
              </ViewStatContent>
            </ViewStatCard>
            
            <ViewStatCard>
              <ViewStatIcon $color="#f59e0b">
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
                <EmptyState $minHeight="400px">
                  <Brain size={48} />
                  <h3>Ready to learn?</h3>
                  <p>Explore our library of concepts and start your learning journey</p>
                  <BaseButton $variant="primary">
                    <BookOpen size={16} />
                    Browse concepts
                  </BaseButton>
                </EmptyState>
              )}
            </ViewGrid>
          </ConceptsSection>
        </SectionContent>
      </LearningSection>
    </ViewContainer>
  );
};