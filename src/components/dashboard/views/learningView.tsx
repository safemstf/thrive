// src/components/dashboard/views/LearningView.tsx - Using Shared Components
import React from 'react';
import { Brain, BookOpen, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { ConceptProgress, QuickStats } from '../dashboardLogic';

// Use all shared components from dashboardStyles - no duplication!
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
  Card,
  FlexRow,
  FlexColumn,
  Heading2,
  BaseButton,
  Badge
} from '../dashboardStyles';

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
      {/* Learning Header */}
      <Card $glass $padding="lg">
        <FlexRow $justify="space-between" $align="center">
          <FlexRow $gap="1rem" $align="center">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-primary-600)',
              backdropFilter: 'blur(4px)'
            }}>
              <Brain size={24} />
            </div>
            <FlexColumn>
              <Heading2 style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.025em' }}>
                Learning Dashboard
              </Heading2>
              <Badge $variant="success">{completedConcepts} completed</Badge>
            </FlexColumn>
          </FlexRow>
          <BaseButton $variant="primary">
            <BookOpen size={16} />
            Explore Concepts
          </BaseButton>
        </FlexRow>
      </Card>

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
      <FlexColumn $gap="1.5rem">
        <Heading2 style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.025em' }}>
          Your Learning Journey
        </Heading2>
        
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
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              background: 'rgba(248, 250, 252, 0.6)',
              border: '2px dashed var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '3rem',
              minHeight: '400px'
            }}>
              <div style={{ 
                color: 'var(--color-text-secondary)', 
                marginBottom: '1rem',
                opacity: 0.6 
              }}>
                <Brain size={48} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Ready to learn?</h3>
              <p style={{ margin: '0 0 1.5rem 0', maxWidth: '300px' }}>
                Explore our library of concepts and start your learning journey
              </p>
              <BaseButton $variant="primary">
                <BookOpen size={16} />
                Browse concepts
              </BaseButton>
            </div>
          )}
        </ViewGrid>
      </FlexColumn>
    </ViewContainer>
  );
};