
// src/data/thrive-assessments.ts

import { 
  Brain, 
  MessageSquare, 
  Code, 
  Calculator, 
  Lightbulb, 
  Zap 
} from 'lucide-react';
import type { Assessment, AssessmentCategory } from '@/types/thrive.types';

export const ASSESSMENT_ROUTES = {
  ADVANCED_CRITICAL_THINKING: '/dashboard/thrive/assessments/advanced-critical-thinking',
  PROFESSIONAL_COMMUNICATION: '/dashboard/thrive/assessments/professional-communication',
  TECHNICAL_PROBLEM_SOLVING: '/dashboard/thrive/assessments/technical-problem-solving',
  DATA_ANALYSIS_INTERPRETATION: '/dashboard/thrive/assessments/data-analysis-interpertation',
  INNOVATIVE_PROBLEM_SOLVING: '/dashboard/thrive/assessments/innovative-problem-solving',
  RAPID_REASONING: '/dashboard/thrive/assessments/rapid-reasoning',
} as const;

export const ASSESSMENTS: Assessment[] = [
  {
    id: '1',
    title: 'Advanced Critical Thinking Assessment',
    description: 'Multi-dimensional evaluation of logical reasoning, problem decomposition, and analytical decision-making under time constraints.',
    skillType: 'critical-thinking',
    difficulty: 'expert',
    duration: 45,
    participants: 2847,
    averageScore: 74,
    completionRate: 68,
    employerTrust: 94,
    route: ASSESSMENT_ROUTES.ADVANCED_CRITICAL_THINKING
  },
  {
    id: '2',
    title: 'Professional Communication Evaluation',
    description: 'Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.',
    skillType: 'linguistic',
    difficulty: 'intermediate',
    duration: 30,
    participants: 4321,
    averageScore: 82,
    completionRate: 89,
    employerTrust: 91,
    route: ASSESSMENT_ROUTES.PROFESSIONAL_COMMUNICATION
  },
  {
    id: '3',
    title: 'Technical Problem Solving Challenge',
    description: 'Real-world technical scenarios requiring systematic debugging, optimization, and implementation of scalable solutions.',
    skillType: 'technical',
    difficulty: 'expert',
    duration: 60,
    participants: 1893,
    averageScore: 69,
    completionRate: 54,
    employerTrust: 96,
    route: ASSESSMENT_ROUTES.TECHNICAL_PROBLEM_SOLVING
  },
  {
    id: '4',
    title: 'Data Analysis & Interpretation',
    description: 'Complex data scenarios requiring statistical analysis, pattern recognition, and evidence-based conclusions.',
    skillType: 'analytical',
    difficulty: 'intermediate',
    duration: 40,
    participants: 3456,
    averageScore: 78,
    completionRate: 76,
    employerTrust: 88,
    route: ASSESSMENT_ROUTES.DATA_ANALYSIS_INTERPRETATION
  },
  {
    id: '5',
    title: 'Innovative Problem Solving',
    description: 'Open-ended challenges evaluating creative thinking, ideation processes, and innovative solution development.',
    skillType: 'creative',
    difficulty: 'expert',
    duration: 50,
    participants: 987,
    averageScore: 71,
    completionRate: 43,
    employerTrust: 85,
    route: ASSESSMENT_ROUTES.INNOVATIVE_PROBLEM_SOLVING
  },
  {
    id: '6',
    title: 'Rapid Reasoning Assessment',
    description: 'Quick-fire logical puzzles and reasoning challenges designed to evaluate processing speed and accuracy.',
    skillType: 'critical-thinking',
    difficulty: 'beginner',
    duration: 15,
    participants: 8765,
    averageScore: 86,
    completionRate: 94,
    employerTrust: 79,
    route: ASSESSMENT_ROUTES.RAPID_REASONING
  }
];

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  {
    id: 'critical-thinking',
    title: 'Advanced Critical Thinking',
    description: 'Multi-dimensional evaluation of logical reasoning, problem decomposition, and analytical decision-making under time constraints.',
    icon: Brain,
    color: 'linear-gradient(135deg, #374151, #4b5563)',
    participants: 2847,
    difficulty: 'expert',
    duration: 45,
    averageScore: 74,
    route: ASSESSMENT_ROUTES.ADVANCED_CRITICAL_THINKING
  },
  {
    id: 'communication',
    title: 'Professional Communication',
    description: 'Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.',
    icon: MessageSquare,
    color: 'linear-gradient(135deg, #059669, #10b981)',
    participants: 4321,
    difficulty: 'intermediate',
    duration: 30,
    averageScore: 82,
    route: ASSESSMENT_ROUTES.PROFESSIONAL_COMMUNICATION
  },
  {
    id: 'technical',
    title: 'Technical Problem Solving',
    description: 'Real-world technical scenarios requiring systematic debugging, optimization, and implementation of scalable solutions.',
    icon: Code,
    color: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    participants: 1893,
    difficulty: 'expert',
    duration: 60,
    averageScore: 69,
    route: ASSESSMENT_ROUTES.TECHNICAL_PROBLEM_SOLVING
  },
  {
    id: 'analytical',
    title: 'Data Analysis & Interpretation',
    description: 'Complex data scenarios requiring statistical analysis, pattern recognition, and evidence-based conclusions.',
    icon: Calculator,
    color: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    participants: 3456,
    difficulty: 'intermediate',
    duration: 40,
    averageScore: 78,
    route: ASSESSMENT_ROUTES.DATA_ANALYSIS_INTERPRETATION
  },
  {
    id: 'creative',
    title: 'Innovative Problem Solving',
    description: 'Open-ended challenges evaluating creative thinking, ideation processes, and innovative solution development.',
    icon: Lightbulb,
    color: 'linear-gradient(135deg, #ea580c, #f97316)',
    participants: 987,
    difficulty: 'advanced',
    duration: 50,
    averageScore: 71,
    route: ASSESSMENT_ROUTES.INNOVATIVE_PROBLEM_SOLVING
  },
  {
    id: 'rapid-reasoning',
    title: 'Rapid Reasoning Assessment',
    description: 'Quick-fire logical puzzles and reasoning challenges designed to evaluate processing speed and accuracy.',
    icon: Zap,
    color: 'linear-gradient(135deg, #dc2626, #ef4444)',
    participants: 8765,
    difficulty: 'beginner',
    duration: 15,
    averageScore: 86,
    route: ASSESSMENT_ROUTES.RAPID_REASONING
  }
];
