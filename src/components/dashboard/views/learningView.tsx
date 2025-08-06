// src/components/dashboard/views/LearningView.tsx - Clean version using shared styles
import React from 'react';
import { Brain, BookOpen, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { ConceptProgress, QuickStats } from '../dashboardLogic';

// Import shared styles from main dashboard styles
import {
  Section,
  SectionHeader,
  SectionTitle,
  SectionActions,
  ActionButton,
  Badge,
  EmptyStateCard,
  EmptyIcon,
  EmptyTitle,
  EmptyMessage
} from '../dashboardStyles';

// Import shared view styles
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
  ViewAction
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
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Brain size={20} />
            Learning Dashboard
            <Badge>{completedConcepts} completed</Badge>
          </SectionTitle>
          <SectionActions>
            <ActionButton $primary>
              <BookOpen size={16} />
              Explore Concepts
            </ActionButton>
          </SectionActions>
        </SectionHeader>

        {/* Learning Statistics */}
        <ViewStatsGrid>
          <ViewStatCard>
            <ViewStatIcon $gradient="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)">
              <BookOpen size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{conceptProgress.length}</ViewStatValue>
              <ViewStatLabel>Total Concepts</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
          
          <ViewStatCard>
            <ViewStatIcon $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <CheckCircle size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{completedConcepts}</ViewStatValue>
              <ViewStatLabel>Completed</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
          
          <ViewStatCard>
            <ViewStatIcon $gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <TrendingUp size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{averageScore.toFixed(0)}%</ViewStatValue>
              <ViewStatLabel>Avg. Score</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
          
          <ViewStatCard>
            <ViewStatIcon $gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <Zap size={20} />
            </ViewStatIcon>
            <ViewStatContent>
              <ViewStatValue>{inProgressConcepts}</ViewStatValue>
              <ViewStatLabel>In Progress</ViewStatLabel>
            </ViewStatContent>
          </ViewStatCard>
        </ViewStatsGrid>
        
        {/* Concepts Grid */}
        <ViewGrid $minWidth="300px">
          {conceptProgress.length > 0 ? (
            conceptProgress.slice(0, 8).map(concept => (
              <ViewCard key={concept.conceptId} $status={concept.status}>
                <ViewCardContent>
                  <ViewCardHeader>
                    <StatusIndicator $status={concept.status}>
                      {concept.status === 'completed' && <CheckCircle size={16} />}
                      {concept.status === 'in-progress' && <Clock size={16} />}
                      {concept.status === 'not-started' && <BookOpen size={16} />}
                    </StatusIndicator>
                    
                    <ViewTag 
                      $variant={
                        concept.difficulty === 'beginner' ? 'info' :
                        concept.difficulty === 'intermediate' ? 'warning' : 'primary'
                      }
                    >
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
                        <ProgressFill 
                          $percentage={concept.score}
                          $color="linear-gradient(90deg, #10b981 0%, #059669 100%)"
                        />
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
              <ActionButton $primary>
                <BookOpen size={16} />
                Browse concepts
              </ActionButton>
            </EmptyStateCard>
          )}
        </ViewGrid>
      </Section>
    </ViewContainer>
  );
};