// src/app/dashboard/thrive/assessments/styles.tsx - Clean & No Duplicates

import styled, { css } from 'styled-components';

// Import existing components - no duplication!
import {
  Card,
  BaseButton,
  Badge,
  FlexRow,
  FlexColumn,
  Grid,
  PageContainer,
  Heading1,
  BodyText,
  responsive,
  ProgressBar,
  fadeIn,
  TextArea as BaseTextArea
} from '@/styles/styled-components';




export const AssessmentTimerCard = styled.div<{ $variant?: 'default' | 'warning' | 'danger' | 'primary' }>`
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return 'var(--color-warning-light)';
      case 'danger':
        return 'var(--color-error-light)';
      case 'primary':
        return 'var(--color-primary-100)'; // 👈 choose appropriate background
      default:
        return 'var(--color-background-card)';
    }
  }};
  ...
`;


// ===========================================
// LAYOUT COMPONENTS (Dashboard specific)
// ===========================================
export const PageWrapper = styled(PageContainer)`
  min-height: 100vh;
  background: var(--color-background-primary);
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
  }
`;

export const Header = styled.header`
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
`;

export const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
`;

export const WelcomeTitle = styled(Heading1)`
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const WelcomeSubtitle = styled(BodyText)`
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
  max-width: 600px;
`;

export const Section = styled.section`
  margin: var(--spacing-2xl) 0;
`;

// ===========================================
// ASSESSMENT-SPECIFIC COMPONENTS ONLY
// ===========================================
export const AssessmentContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);

  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

export const NavigationSidebar = styled.div`
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  height: fit-content;
  position: sticky;
  top: var(--spacing-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
`;

// ===========================================
// TIMER COMPONENTS
// ===========================================
export const TimerCard = styled(Card)<{ $color1?: string; $color2?: string }>`
  background: ${({ $color1 = 'var(--color-primary-500)', $color2 = 'var(--color-primary-600)' }) => 
    `linear-gradient(135deg, ${$color1}, ${$color2})`};
  color: white;
  text-align: center;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  border: none;
  
  svg {
    margin-bottom: var(--spacing-sm);
  }
`;

export const TimerDisplay = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-display);
  margin: var(--spacing-sm) 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const TimerLabel = styled.div`
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
`;

// ===========================================
// QUESTION COMPONENTS
// ===========================================
export const QuestionGrid = styled(Grid).attrs({ 
  $columns: 5, 
  $gap: 'var(--spacing-sm)' 
})`
  margin-top: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const QuestionButton = styled(BaseButton)<{ 
  $status: 'unanswered' | 'answered' | 'current' 
}>`
  aspect-ratio: 1;
  padding: 0;
  min-width: 40px;
  height: 40px;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  
  ${({ $status }) => {
    switch ($status) {
      case 'current':
        return css`
          background: var(--color-primary-500);
          color: white;
          transform: scale(1.05);
          box-shadow: var(--shadow-md);
          border: 2px solid var(--color-primary-600);
        `;
      case 'answered':
        return css`
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
          border: 1px solid #16a34a;
        `;
      default:
        return css`
          background: var(--color-background-tertiary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-medium);
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-2px) ${({ $status }) => $status === 'current' ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0) scale(1);
  }
`;

export const QuestionContainer = styled(Card).attrs({ $padding: 'lg' })`
  box-shadow: var(--shadow-sm);
`;

export const QuestionHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $responsive: true 
})`
  padding-bottom: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-medium);
`;

export const QuestionNumber = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: var(--font-weight-medium);
`;

export const QuestionTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-md) 0;
  line-height: 1.4;
  color: var(--color-text-primary);
`;

export const QuestionContent = styled.div`
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
  color: var(--color-text-primary);
`;

// ===========================================
// ANSWER COMPONENTS
// ===========================================
export const AnswerOptions = styled(FlexColumn).attrs({ $gap: 'var(--spacing-md)' })`
  margin: var(--spacing-xl) 0;
`;

export const AnswerOption = styled.div<{ $selected: boolean; $color: string }>`
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid ${({ $selected, $color }) => 
    $selected ? $color : 'var(--color-border-medium)'};
  background: ${({ $selected, $color }) => 
    $selected ? `${$color}0d` : 'transparent'};
  cursor: pointer;
  transition: var(--transition-normal);
  
  &:hover {
    border-color: ${({ $color }) => $color};
    transform: translateX(4px);
    background: ${({ $color }) => `${$color}05`};
  }
`;

export const AnswerLabel = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-md)', 
  $align: 'flex-start' 
})``;

export const AnswerLetter = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
`;

export const AnswerText = styled.div`
  flex: 1;
  line-height: 1.5;
`;

// ===========================================
// NAVIGATION COMPONENTS
// ===========================================
export const NavigationControls = styled(FlexRow).attrs({ 
  $justify: 'space-between',
  $responsive: true
})`
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-medium);
`;

export const NavButton = styled(BaseButton)<{ 
  $primary?: boolean;
  $color1?: string;
  $color2?: string;
}>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  
  ${({ $primary, $color1, $color2 }) => $primary ? css`
    background: ${$color1 && $color2 
      ? `linear-gradient(135deg, ${$color1}, ${$color2})` 
      : 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))'};
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      background: ${$color1 && $color2 
        ? `linear-gradient(135deg, ${$color2}, ${$color1})` 
        : 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))'};
    }
  ` : css`
    background: var(--color-background-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-medium);
    
    &:hover:not(:disabled) {
      background: var(--color-background-secondary);
      border-color: ${$color1 || 'var(--color-primary-500)'};
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// ===========================================
// BADGES & STATUS COMPONENTS
// ===========================================
export const DifficultyBadge = styled(Badge)<{ 
  $difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' 
}>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: var(--spacing-sm) var(--spacing-md);
  
  ${({ $difficulty = 'intermediate' }) => {
    const styles = {
      beginner: css`
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
        border: 1px solid rgba(34, 197, 94, 0.2);
      `,
      intermediate: css`
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
        border: 1px solid rgba(59, 130, 246, 0.2);
      `,
      advanced: css`
        background: rgba(139, 92, 246, 0.1);
        color: #7c3aed;
        border: 1px solid rgba(139, 92, 246, 0.2);
      `,
      expert: css`
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.2);
      `
    };
    return styles[$difficulty];
  }}
`;

export const StatusIndicator = styled.div<{ $status: 'active' | 'completed' | 'locked' }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  
  ${({ $status }) => {
    switch ($status) {
      case 'completed':
        return css`color: #10b981;`;
      case 'active':
        return css`color: var(--color-primary-600);`;
      case 'locked':
        return css`color: var(--color-text-secondary);`;
    }
  }}
`;

// ===========================================
// METRICS COMPONENTS
// ===========================================
export const MetricItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  
  .label {
    color: var(--color-text-secondary);
  }
  
  .value {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
`;

export const TrustScore = styled.div<{ $color?: string }>`
  font-weight: var(--font-weight-bold);
  color: ${({ $color = 'var(--color-primary-500)' }) => $color};
`;

// ===========================================
// TECHNICAL ASSESSMENT COMPONENTS
// ===========================================
export const CodeSnippetContainer = styled.div`
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary-600);
  font-family: 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.5;
  overflow-x: auto;
  position: relative;
  box-shadow: var(--shadow-sm);
`;

export const CodeHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-medium);
`;

export const CodeLanguage = styled.div`
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const PerformanceContainer = styled(Card).attrs({ $padding: 'lg' })`
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin: var(--spacing-lg) 0;
`;

export const PerformanceHeader = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-sm)', 
  $align: 'center' 
})`
  margin-bottom: var(--spacing-md);
  color: var(--color-primary-600);
  font-weight: var(--font-weight-medium);
`;

export const PerformanceContent = styled(Grid).attrs({ 
  $columns: 2, 
  $gap: 'var(--spacing-md)' 
})`
  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

export const PerfMetric = styled(Card).attrs({ $padding: 'md' })`
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-medium);
`;

export const PerfLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
`;

export const PerfValue = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-display);
  color: var(--color-text-primary);
`;

// ===========================================
// WRITING ASSESSMENT COMPONENTS
// ===========================================
export const WritingTaskContainer = styled(Card).attrs({ $padding: 'lg' })`
  margin: var(--spacing-xl) 0;
  background: rgba(59, 130, 246, 0.02);
  border: 1px dashed var(--color-primary-500);
`;

export const WritingPrompt = styled.div`
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
  padding: var(--spacing-md);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-primary-500);
`;

export const WritingTextArea = styled(BaseTextArea)`
  min-height: 200px;
  font-family: var(--font-body);
  line-height: 1.6;
  
  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export const WordCount = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: right;
  margin-top: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
`;

// ===========================================
// PROGRESS COMPONENTS
// ===========================================
export const ProgressContainer = styled.div`
  margin: var(--spacing-lg) 0;
`;

export const ProgressText = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  font-weight: var(--font-weight-medium);
`;

// Re-export components from main styled-components for convenience
export {
  Card,
  BaseButton,
  Badge,
  FlexRow,
  FlexColumn,
  Grid,
  Heading1,
  Heading2,
  Heading3,
  BodyText,
  LoadingSpinner,
  LoadingContainer
} from '@/styles/styled-components';