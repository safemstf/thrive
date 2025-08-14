// src/data/thrive-assessments.ts
import {
  BarChart, Search, PieChart, ShoppingCart, 
  TrendingUp, PenTool, Mail, Hash, Users,
  MessageSquare, Globe, CreditCard, Lightbulb,
  Clipboard, Target, Layout, Zap, Brain,
  Code, Users2, GitBranch, Cpu, HeartPulse,
  Palette, Ruler, Layers, Presentation, BookOpen,
  Puzzle, GanttChart, Star, Activity
} from 'lucide-react';
import type { Assessment, AssessmentCategory } from '@/types/thrive.types';

/**
 * Routes for each assessment (client-only routes)
 */
export const ASSESSMENT_ROUTES = {
  // Profession-specific routes
  MARKETING_STRATEGY: '/dashboard/thrive/assessments/marketing-strategy',
  CLINICAL_ASSESSMENT: '/dashboard/thrive/assessments/clinical-assessment',
  SYSTEM_DESIGN: '/dashboard/thrive/assessments/system-design',
  TEAM_LEADERSHIP: '/dashboard/thrive/assessments/team-leadership',
  UI_UX_DESIGN: '/dashboard/thrive/assessments/ui-ux-design',
  
  // Universal skill routes
  CRITICAL_THINKING: '/dashboard/thrive/assessments/critical-thinking',
  DATA_ANALYSIS: '/dashboard/thrive/assessments/data-analysis',
  PROBLEM_SOLVING: '/dashboard/thrive/assessments/problem-solving',
  DECISION_MAKING: '/dashboard/thrive/assessments/decision-making',
  TIME_MANAGEMENT: '/dashboard/thrive/assessments/time-management',
  COMMUNICATION: '/dashboard/thrive/assessments/communication',
  ADAPTABILITY: '/dashboard/thrive/assessments/adaptability',
  CREATIVE_THINKING: '/dashboard/thrive/assessments/creative-thinking'
} as const;

/**
 * Comprehensive assessment definitions
 */
export const ASSESSMENTS: Assessment[] = [
  // ========== PROFESSION-SPECIFIC ASSESSMENTS ==========
  // Marketing
  {
    id: 'mktg-001',
    title: "Marketing Strategy Development",
    description: "Create comprehensive marketing plans including positioning, channels, and KPIs.",
    skillType: 'critical-thinking',
    difficulty: 'advanced',
    duration: 45,
    participants: 2850,
    averageScore: 74,
    completionRate: 79,
    employerTrust: 89,
    route: ASSESSMENT_ROUTES.MARKETING_STRATEGY
  },
  
  // Psychology
  {
    id: 'psych-001',
    title: "Clinical Assessment Skills",
    description: "Evaluate case studies and demonstrate diagnostic skills for common mental health conditions.",
    skillType: 'analytical',
    difficulty: 'advanced',
    duration: 50,
    participants: 1200,
    averageScore: 68,
    completionRate: 65,
    employerTrust: 92,
    route: ASSESSMENT_ROUTES.CLINICAL_ASSESSMENT
  },
  
  // Engineering
  {
    id: 'eng-001',
    title: "System Architecture Design",
    description: "Design scalable and maintainable system architectures for complex applications.",
    skillType: 'technical',
    difficulty: 'expert',
    duration: 60,
    participants: 1850,
    averageScore: 65,
    completionRate: 60,
    employerTrust: 96,
    route: ASSESSMENT_ROUTES.SYSTEM_DESIGN
  },
  
  // Management
  {
    id: 'mgmt-001',
    title: "Team Leadership Simulation",
    description: "Navigate complex team dynamics, motivation challenges, and performance management scenarios.",
    skillType: 'critical-thinking',
    difficulty: 'advanced',
    duration: 40,
    participants: 2450,
    averageScore: 76,
    completionRate: 80,
    employerTrust: 91,
    route: ASSESSMENT_ROUTES.TEAM_LEADERSHIP
  },
  
  // Design
  {
    id: 'design-001',
    title: "UI/UX Design Challenge",
    description: "Create intuitive user interfaces and experiences based on user research and requirements.",
    skillType: 'creative',
    difficulty: 'intermediate',
    duration: 55,
    participants: 1950,
    averageScore: 74,
    completionRate: 68,
    employerTrust: 90,
    route: ASSESSMENT_ROUTES.UI_UX_DESIGN
  },
  
  // ========== UNIVERSAL SKILL ASSESSMENTS ==========
  {
    id: 'core-001',
    title: "Critical Thinking Challenge",
    description: "Evaluate arguments, identify logical fallacies, and draw reasoned conclusions.",
    skillType: 'critical-thinking',
    difficulty: 'intermediate',
    duration: 30,
    participants: 8750,
    averageScore: 72,
    completionRate: 85,
    employerTrust: 93,
    route: ASSESSMENT_ROUTES.CRITICAL_THINKING
  },
  {
    id: 'core-002',
    title: "Data Analysis & Interpretation",
    description: "Analyze datasets, identify patterns, and draw meaningful insights from complex information.",
    skillType: 'analytical',
    difficulty: 'intermediate',
    duration: 35,
    participants: 7650,
    averageScore: 71,
    completionRate: 82,
    employerTrust: 90,
    route: ASSESSMENT_ROUTES.DATA_ANALYSIS
  },
  {
    id: 'core-003',
    title: "Creative Problem Solving",
    description: "Generate innovative solutions to complex problems using design thinking approaches.",
    skillType: 'creative',
    difficulty: 'intermediate',
    duration: 40,
    participants: 6250,
    averageScore: 75,
    completionRate: 78,
    employerTrust: 88,
    route: ASSESSMENT_ROUTES.PROBLEM_SOLVING
  },
  {
    id: 'core-004',
    title: "Strategic Decision Making",
    description: "Evaluate options, assess risks, and make effective decisions in ambiguous situations.",
    skillType: 'critical-thinking',
    difficulty: 'advanced',
    duration: 45,
    participants: 5450,
    averageScore: 69,
    completionRate: 73,
    employerTrust: 91,
    route: ASSESSMENT_ROUTES.DECISION_MAKING
  },
  {
    id: 'core-005',
    title: "Effective Communication",
    description: "Demonstrate clear verbal and written communication skills in professional contexts.",
    skillType: 'linguistic',
    difficulty: 'intermediate',
    duration: 30,
    participants: 8950,
    averageScore: 77,
    completionRate: 87,
    employerTrust: 89,
    route: ASSESSMENT_ROUTES.COMMUNICATION
  },
  {
    id: 'core-006',
    title: "Time Management Mastery",
    description: "Prioritize tasks, manage workloads, and optimize productivity under pressure.",
    skillType: 'analytical',
    difficulty: 'intermediate',
    duration: 25,
    participants: 7250,
    averageScore: 74,
    completionRate: 83,
    employerTrust: 86,
    route: ASSESSMENT_ROUTES.TIME_MANAGEMENT
  },
  {
    id: 'core-007',
    title: "Adaptability & Flexibility",
    description: "Navigate changing circumstances and adjust strategies in dynamic environments.",
    skillType: 'creative',
    difficulty: 'intermediate',
    duration: 30,
    participants: 5850,
    averageScore: 73,
    completionRate: 79,
    employerTrust: 87,
    route: ASSESSMENT_ROUTES.ADAPTABILITY
  },
  {
    id: 'core-008',
    title: "Creative Thinking & Innovation",
    description: "Generate original ideas and approaches to challenges across various contexts.",
    skillType: 'creative',
    difficulty: 'intermediate',
    duration: 35,
    participants: 4950,
    averageScore: 76,
    completionRate: 76,
    employerTrust: 85,
    route: ASSESSMENT_ROUTES.CREATIVE_THINKING
  }
];

/**
 * Profession-based categories
 */
export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  // Profession-Specific
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Strategy, branding, and campaign management.',
    icon: BarChart,
    color: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    participants: 2850,
    difficulty: 'intermediate',
    duration: 40,
    averageScore: 73,
    route: ASSESSMENT_ROUTES.MARKETING_STRATEGY
  },
  {
    id: 'psychology',
    title: 'Psychology',
    description: 'Clinical assessment and therapeutic approaches.',
    icon: Brain,
    color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    participants: 1200,
    difficulty: 'advanced',
    duration: 45,
    averageScore: 72,
    route: ASSESSMENT_ROUTES.CLINICAL_ASSESSMENT
  },
  {
    id: 'engineering',
    title: 'Engineering',
    description: 'System design and technical problem solving.',
    icon: Code,
    color: 'linear-gradient(135deg, #ef4444, #f87171)',
    participants: 1850,
    difficulty: 'advanced',
    duration: 55,
    averageScore: 68,
    route: ASSESSMENT_ROUTES.SYSTEM_DESIGN
  },
  {
    id: 'management',
    title: 'Management',
    description: 'Leadership and team development.',
    icon: Users2,
    color: 'linear-gradient(135deg, #10b981, #34d399)',
    participants: 2450,
    difficulty: 'advanced',
    duration: 45,
    averageScore: 73,
    route: ASSESSMENT_ROUTES.TEAM_LEADERSHIP
  },
  {
    id: 'design',
    title: 'Design',
    description: 'UI/UX and visual communication.',
    icon: Palette,
    color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    participants: 1950,
    difficulty: 'intermediate',
    duration: 55,
    averageScore: 74,
    route: ASSESSMENT_ROUTES.UI_UX_DESIGN
  },
  
  // Universal Skills
  {
    id: 'core-skills',
    title: 'Core Professional Skills',
    description: 'Essential skills for success in any profession.',
    icon: Star,
    color: 'linear-gradient(135deg, #6366f1, #818cf8)',
    participants: 32000,
    difficulty: 'intermediate',
    duration: 35,
    averageScore: 74,
    route: ASSESSMENT_ROUTES.CRITICAL_THINKING
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving',
    description: 'Critical thinking and solution development.',
    icon: Puzzle,
    color: 'linear-gradient(135deg, #ec4899, #f472b6)',
    participants: 15000,
    difficulty: 'intermediate',
    duration: 40,
    averageScore: 73,
    route: ASSESSMENT_ROUTES.PROBLEM_SOLVING
  },
  {
    id: 'strategic',
    title: 'Strategic Thinking',
    description: 'Decision making and future planning.',
    icon: GanttChart,
    color: 'linear-gradient(135deg, #14b8a6, #2dd4bf)',
    participants: 11500,
    difficulty: 'advanced',
    duration: 45,
    averageScore: 71,
    route: ASSESSMENT_ROUTES.DECISION_MAKING
  }
];