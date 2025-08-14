// src/app/dashboard/thrive/assessments/styles.tsx
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';
import { DifficultyLevel } from '@/types/thrive.types';

// Shared assessment components
export const AssessmentContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const NavigationSidebar = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  height: fit-content;
  position: sticky;
  top: ${theme.spacing.xl};
`;

export const TimerCard = styled.div<{ $color1: string, $color2: string }>`
  background: linear-gradient(135deg, ${props => props.$color1}, ${props => props.$color2});
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

export const TimerDisplay = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  font-family: ${theme.typography.fonts.secondary};
  margin: ${theme.spacing.sm} 0;
`;

export const TimerLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
`;

export const QuestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

export const QuestionButton = styled.button<{ $status: 'unanswered' | 'answered' | 'current' }>`
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  ${props => {
    if (props.$status === 'current') {
      return `
        background: ${theme.colors.primary[500]};
        color: white;
        transform: scale(1.05);
        box-shadow: ${theme.shadows.md};
      `;
    } else if (props.$status === 'answered') {
      return `
        background: ${themeUtils.alpha(theme.colors.primary[500], 0.2)};
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.primary[500]};
      `;
    }
    return `
      background: ${theme.colors.background.tertiary};
      color: ${theme.colors.text.secondary};
      border: 1px solid ${theme.colors.border.medium};
    `;
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const QuestionContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

export const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

export const QuestionNumber = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
`;

export const QuestionTitle = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  margin: ${theme.spacing.md} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

export const QuestionContent = styled.div`
  margin-bottom: ${theme.spacing.xl};
  line-height: ${theme.typography.lineHeights.relaxed};
`;

export const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

export const AnswerOption = styled.div<{ $selected: boolean, $color: string }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => 
    props.$selected ? props.$color : theme.colors.border.medium};
  background: ${props => 
    props.$selected 
      ? themeUtils.alpha(props.$color, 0.05) 
      : 'transparent'};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:hover {
    border-color: ${props => props.$color};
    transform: translateX(4px);
  }
`;

export const AnswerLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
`;

export const AnswerLetter = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.$color};
  color: white;
  font-weight: ${theme.typography.weights.bold};
`;

export const AnswerText = styled.div`
  flex: 1;
`;

export const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.medium};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

export const NavButton = styled.button<{ $primary?: boolean, $color1?: string, $color2?: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.semibold};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, 
      ${props.$color1 || theme.colors.primary[600]}, 
      ${props.$color2 || theme.colors.primary[700]}
    );
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.md};
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.medium};
    
    &:hover {
      color: ${theme.colors.text.primary};
      border-color: ${props.$color1 || theme.colors.primary[500]};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

export const DifficultyBadge = styled.div<{ $difficulty: DifficultyLevel }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: ${props => {
    switch (props.$difficulty) {
      case 'expert': return themeUtils.alpha(theme.colors.primary[700], 0.1);
      case 'expert': return themeUtils.alpha(theme.colors.primary[800], 0.1);
      case 'intermediate': return themeUtils.alpha(theme.colors.primary[500], 0.1);
      default: return themeUtils.alpha(theme.colors.primary[400], 0.1);
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'expert': return theme.colors.primary[700];
      case 'expert': return theme.colors.primary[800];
      case 'intermediate': return theme.colors.primary[500];
      default: return theme.colors.primary[400];
    }
  }};
`;

// Technical-specific components
export const CodeSnippetContainer = styled.div`
  margin: ${theme.spacing.xl} 0;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border-left: 4px solid ${theme.colors.primary[600]};
  font-family: ${theme.typography.fonts.mono}; // Use mono font
  font-size: ${theme.typography.sizes.sm};
  line-height: ${theme.typography.lineHeights.normal};
  overflow-x: auto;
  position: relative;
`;

export const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.medium};
`;

export const CodeLanguage = styled.div`
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.primary[600]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const PerformanceContainer = styled.div`
  background: ${themeUtils.alpha(theme.colors.primary[600], 0.05)};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin: ${theme.spacing.lg} 0;
  border: 1px solid ${theme.colors.primary[300]};
`;

export const PerformanceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.primary[600]};
`;

export const PerformanceContent = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const PerfMetric = styled.div`
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.medium};
`;

export const PerfLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

export const PerfValue = styled.div`
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.bold};
  font-family: ${theme.typography.fonts.secondary};
`;

// Writing-specific components
export const WritingTaskContainer = styled.div`
  margin: ${theme.spacing.xl} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.3)};
  border-radius: ${theme.borderRadius.md};
  border: 1px dashed ${theme.colors.primary[400]};
`;

export const WritingPrompt = styled.div`
  font-size: ${theme.typography.sizes.base};
  margin-bottom: ${theme.spacing.lg};
  line-height: ${theme.typography.lineHeights.relaxed};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.medium};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.base};
  resize: vertical;
  transition: ${theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${themeUtils.alpha(theme.colors.primary[400], 0.2)};
  }
`;