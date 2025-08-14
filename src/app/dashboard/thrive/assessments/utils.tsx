// src\app\dashboard\thrive\assessments\utils.tsx

import { AssessmentQuestion, PerformanceMetric, SkillType } from "@/types/thrive.types";

// Theme colors
const theme = {
  colors: {
    primary: {
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
    },
    text: {
      secondary: '#64748b',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
    },
    weights: {
      bold: 600,
    }
  }
};

// Format time for display (MM:SS)
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get color theme for assessment based on skill type
export const getAssessmentTheme = (skillType: SkillType) => {
  switch (skillType) {
    case 'critical-thinking':
      return {
        primaryColor: theme.colors.primary[600],
        secondaryColor: theme.colors.primary[700],
        accentColor: theme.colors.primary[500]
      };
    case 'linguistic':
      return {
        primaryColor: theme.colors.primary[500],
        secondaryColor: theme.colors.primary[600],
        accentColor: theme.colors.primary[400]
      };
    case 'technical':
      return {
        primaryColor: theme.colors.primary[700],
        secondaryColor: theme.colors.primary[800],
        accentColor: theme.colors.primary[600]
      };
    case 'analytical':
      return {
        primaryColor: theme.colors.primary[500],
        secondaryColor: theme.colors.primary[600],
        accentColor: theme.colors.primary[400]
      };
    case 'creative':
      return {
        primaryColor: theme.colors.primary[600],
        secondaryColor: theme.colors.primary[700],
        accentColor: theme.colors.primary[500]
      };
    default:
      return {
        primaryColor: theme.colors.primary[600],
        secondaryColor: theme.colors.primary[700],
        accentColor: theme.colors.primary[500]
      };
  }
};

// Calculate assessment score
export const calculateScore = (questions: AssessmentQuestion[], answers: number[]) => {
  let score = 0;
  
  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      score += 20; // 20 points per question
    }
  });
  
  return score;
};

// Performance metric type guard
export const isPerformanceMetric = (obj: any): obj is PerformanceMetric => {
  return obj && typeof obj.label === 'string' && typeof obj.value === 'string';
};