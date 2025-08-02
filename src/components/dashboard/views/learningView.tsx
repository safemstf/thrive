// src/components/dashboard/views/LearningView.tsx
import React from 'react';
import styled from 'styled-components';
import { Brain, BookOpen, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import type { ConceptProgress, QuickStats } from '../dashboardLogic';
import { theme } from '@/styles/theme';
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

interface LearningViewProps {
  conceptProgress: ConceptProgress[];
  stats: QuickStats;
}

export const LearningView: React.FC<LearningViewProps> = ({ conceptProgress, stats }) => {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <Brain size={20} />
          Learning Dashboard
          <Badge>{conceptProgress.filter(c => c.status === 'completed').length} completed</Badge>
        </SectionTitle>
        <SectionActions>
          <ActionButton $primary>
            <BookOpen size={16} />
            Explore Concepts
          </ActionButton>
        </SectionActions>
      </SectionHeader>

      <LearningStats>
        <LearningStatCard>
          <StatIcon>
            <BookOpen size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{conceptProgress.length}</StatValue>
            <StatLabel>Total Concepts</StatLabel>
          </StatContent>
        </LearningStatCard>
        
        <LearningStatCard>
          <StatIcon>
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{conceptProgress.filter(c => c.status === 'completed').length}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </LearningStatCard>
        
        <LearningStatCard>
          <StatIcon>
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.averageScore?.toFixed(0) || 0}%</StatValue>
            <StatLabel>Avg. Score</StatLabel>
          </StatContent>
        </LearningStatCard>
        
        <LearningStatCard>
          <StatIcon>
            <Zap size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{conceptProgress.filter(c => c.status === 'in-progress').length}</StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatContent>
        </LearningStatCard>
      </LearningStats>
      
      <ConceptGrid>
        {conceptProgress.length > 0 ? (
          conceptProgress.slice(0, 8).map(concept => (
            <ConceptCard key={concept.conceptId} $status={concept.status}>
              <ConceptHeader>
                <ConceptStatus $status={concept.status}>
                  {concept.status === 'completed' && <CheckCircle size={16} />}
                  {concept.status === 'in-progress' && <Clock size={16} />}
                  {concept.status === 'not-started' && <BookOpen size={16} />}
                </ConceptStatus>
                <DifficultyBadge $difficulty={concept.difficulty || 'intermediate'}>
                  {concept.difficulty || 'intermediate'}
                </DifficultyBadge>
              </ConceptHeader>
              
              <ConceptTitle>{concept.title || `Concept ${concept.conceptId}`}</ConceptTitle>
              <ConceptCategory>{concept.category || 'General'}</ConceptCategory>
              
              {concept.score && (
                <ScoreDisplay>
                  <ScoreBar>
                    <ScoreFill $percentage={concept.score} />
                  </ScoreBar>
                  <ScoreText>{concept.score}%</ScoreText>
                </ScoreDisplay>
              )}
              
              <ConceptActions>
                <ConceptAction>
                  {concept.status === 'not-started' ? 'Start' : 
                   concept.status === 'in-progress' ? 'Continue' : 'Review'}
                </ConceptAction>
              </ConceptActions>
            </ConceptCard>
          ))
        ) : (
          <EmptyStateCard>
            <EmptyIcon>
              <Brain size={48} />
            </EmptyIcon>
            <EmptyTitle>Ready to learn?</EmptyTitle>
            <EmptyMessage>Explore our library of concepts and start your learning journey</EmptyMessage>
            <ActionButton $primary>
              <BookOpen size={16} />
              Browse concepts
            </ActionButton>
          </EmptyStateCard>
        )}
      </ConceptGrid>
    </Section>
  );
};

// Learning-specific styled components
const LearningStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};
`;

const LearningStatCard = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.sizes['2xl']};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.weights.medium};
`;

const ConceptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ConceptCard = styled.div<{ $status: string }>`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      default: return theme.colors.border.medium;
    }
  }};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$status) {
        case 'completed': return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        case 'in-progress': return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
        default: return `linear-gradient(90deg, ${theme.colors.border.medium} 0%, ${theme.colors.border.dark} 100%)`;
      }
    }};
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.md};
  }
`;

const ConceptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const ConceptStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#d1fae5';
      case 'in-progress': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#065f46';
      case 'in-progress': return '#92400e';
      default: return theme.colors.text.secondary;
    }
  }};
`;

const DifficultyBadge = styled.span<{ $difficulty: string }>`
  background: ${props => {
    switch (props.$difficulty) {
      case 'beginner': return '#dbeafe';
      case 'intermediate': return '#fef3c7';
      case 'advanced': return '#fce7f3';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'beginner': return '#1e40af';
      case 'intermediate': return '#92400e';
      case 'advanced': return '#be185d';
      default: return theme.colors.text.secondary;
    }
  }};
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  padding: 0.25rem ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-transform: capitalize;
`;

const ConceptTitle = styled.h4`
  font-size: ${theme.typography.sizes.base};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: 1.3;
`;

const ConceptCategory = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

const ScoreDisplay = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const ScoreBar = styled.div`
  height: 6px;
  background: ${theme.colors.border.medium};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`;

const ScoreFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.8s ease;
`;

const ScoreText = styled.div`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.text.secondary};
  text-align: right;
  font-weight: ${theme.typography.weights.semibold};
`;

const ConceptActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ConceptAction = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;