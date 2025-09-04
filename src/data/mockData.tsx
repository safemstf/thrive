// src/data/mockData.tsx - Fixed imports and exports

import { ArtworkCategory, ArtworkSize, ArtworkStatus, GalleryPiece, GalleryVisibility } from "@/types/gallery.types";
import { ConceptProgress, Portfolio, PortfolioKind, PortfolioReview, PortfolioSettings, PortfolioStats } from "@/types/portfolio.types";
import type { TopPerformer, AssessmentLeaderboard, RankingPlatformStats } from '@/types/thrive.types';
import { Users, Zap, Brain, Target, Heart, Timer, Lightbulb, Palette, Puzzle, PenTool, TrendingUp, BookOpen, Activity, AlertCircle, BatteryLow, Briefcase, CloudRain, Compass, Gauge, HeartHandshake, LineChart, LucideIcon, MessageSquare, Mountain, Shield, Star, Sun, Trophy } from "lucide-react";

// ==============================================
// THRIVE RANKING DATA (moved to top for better organization)
// ==============================================

// Assessment metadata
export interface BaseAssessment {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  items?: number;
  duration: string;
  questions?: number;
  validated: boolean;
  category: string;
  subcategory?: string;
  publisher?: string;
  year?: number;
}

export interface ProfessionalAssessment extends BaseAssessment {
  type: 'professional';
  skillArea: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  certificationAvailable?: boolean;
  status?: string;

}

export interface PsychologicalAssessment extends BaseAssessment {
  type: 'psychological';
  clinicalUse: boolean;
  ageRange?: string;
  normData?: string;
  interpretationGuide?: boolean;
  disclaimerRequired: boolean;
  status?: string;

}

export interface CreativityAssessment extends BaseAssessment {
  type: 'creativity';
  domain: 'divergent' | 'convergent' | 'artistic' | 'practical' | 'mixed';
  scoringMethod: string;
  status?: string;

}

export type Assessment = ProfessionalAssessment | PsychologicalAssessment | CreativityAssessment;

// ==============================================
// PROFESSIONAL ASSESSMENTS
// ==============================================

export const PROFESSIONAL_ASSESSMENTS: ProfessionalAssessment[] = [
  {
    id: 'professional-communication',
    type: 'professional',
    title: 'Professional Communication Excellence',
    description: 'Comprehensive evaluation of written, verbal, and non-verbal communication skills in workplace settings.',
    icon: MessageSquare,
    color: '#3b82f6', // blue
    items: 45,
    questions: 45,
    duration: '20-25 min',
    validated: true,
    category: 'Communication',
    skillArea: 'Soft Skills',
    level: 'all',
    status: 'coming_soon',
    certificationAvailable: true

  },
  {
    id: 'leadership-360',
    type: 'professional',
    title: 'Leadership 360° Assessment',
    description: 'Multi-dimensional leadership evaluation covering strategic thinking, team building, and organizational influence.',
    icon: Target,
    color: '#8b5cf6', // purple
    items: 60,
    questions: 60,
    duration: '25-30 min',
    validated: true,
    category: 'Leadership',
    skillArea: 'Management',
    level: 'intermediate',
    status: 'coming_soon',

    certificationAvailable: true
  },
  {
    id: 'technical-problem-solving',
    type: 'professional',
    title: 'Technical Problem-Solving Proficiency',
    description: 'Evaluates analytical thinking, algorithmic reasoning, and systematic debugging capabilities.',
    icon: LineChart,
    color: '#06b6d4', // cyan
    items: 40,
    questions: 40,
    duration: '30-35 min',
    validated: true,
    category: 'Technical',
    status: 'coming_soon',

    skillArea: 'Engineering',
    level: 'intermediate'
  },
  {
    id: 'project-management',
    type: 'professional',
    title: 'Project Management Competency',
    description: 'Assessment based on PMI standards covering initiation, planning, execution, monitoring, and closing.',
    icon: Briefcase,
    color: '#10b981', // emerald
    items: 50,
    questions: 50,
    duration: '25-30 min',
    validated: true,
    category: 'Management',
    skillArea: 'Operations',
    status: 'coming_soon',

    level: 'intermediate',
    certificationAvailable: true,
    publisher: 'PMI Standards'
  },
  {
    id: 'emotional-intelligence-work',
    type: 'professional',
    title: 'Workplace Emotional Intelligence',
    description: 'Measures EQ competencies crucial for professional success: self-awareness, empathy, and social skills.',
    icon: HeartHandshake,
    color: '#ec4899', // pink
    items: 35,
    questions: 35,
    duration: '15-20 min',
    validated: true,
    category: 'Interpersonal',
    status: 'coming_soon',

    skillArea: 'Soft Skills',
    level: 'all'
  },
  {
    id: 'time-productivity',
    type: 'professional',
    title: 'Time Management & Productivity Index',
    description: 'Analyzes work habits, prioritization strategies, and efficiency patterns for peak performance.',
    icon: Timer,
    color: '#f59e0b', // amber
    items: 30,
    questions: 30,
    duration: '12-15 min',
    validated: true,
    category: 'Productivity',
    status: 'coming_soon',

    skillArea: 'Performance',
    level: 'all'
  }
];

// ==============================================
// PSYCHOLOGICAL ASSESSMENTS - Clinical & Personality
// ==============================================

export const PSYCHOLOGICAL_ASSESSMENTS: PsychologicalAssessment[] = [
  // Personality Assessments
  {
    id: 'big-five-neo',
    type: 'psychological',
    title: 'NEO Big Five Personality Inventory',
    description: 'Gold standard assessment measuring Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.',
    icon: Brain,
    color: '#6366f1', // indigo
    items: 60,
    questions: 60,
    duration: '15-20 min',
    validated: true,
    category: 'Personality',
    subcategory: 'Trait Theory',
    clinicalUse: false,
    ageRange: '16+',
    normData: 'International norms available',
    interpretationGuide: true,
    disclaimerRequired: false,
    status: 'coming_soon',

    publisher: 'Costa & McCrae',
    year: 1992
  },
  {
    id: 'hexaco-100',
    type: 'psychological',
    title: 'HEXACO-100 Personality Assessment',
    description: 'Six-factor model adding Honesty-Humility to traditional Big Five dimensions for enhanced prediction.',
    icon: Shield,
    color: '#8b5cf6', // purple
    items: 100,
    questions: 100,
    duration: '20-25 min',
    validated: true,
    category: 'Personality',
    subcategory: 'Extended Trait Model',
    clinicalUse: false,
    ageRange: '16+',
    interpretationGuide: true,
    disclaimerRequired: false,
    status: 'coming_soon'

  },
  {
    id: 'mbti-style',
    type: 'psychological',
    title: 'Cognitive Function Type Indicator',
    description: 'Jungian-based assessment identifying cognitive preferences and decision-making styles.',
    icon: Compass,
    color: '#0ea5e9', // sky
    items: 70,
    questions: 70,
    duration: '20-25 min',
    validated: true,
    category: 'Personality',
    subcategory: 'Type Theory',
    clinicalUse: false,
    ageRange: '18+',
    interpretationGuide: true,
    disclaimerRequired: false,
    status: 'coming_soon'

  },

  // Clinical Screening Tools
  {
    id: 'gad-7',
    type: 'psychological',
    title: 'GAD-7 Anxiety Screening',
    description: 'Validated screening tool for Generalized Anxiety Disorder severity in clinical and research settings.',
    icon: Activity,
    color: '#ef4444', // red
    items: 7,
    questions: 7,
    duration: '2-3 min',
    validated: true,
    category: 'Clinical',
    subcategory: 'Anxiety Disorders',
    clinicalUse: true,
    ageRange: '12+',
    normData: 'Clinical cutoff scores',
    interpretationGuide: true,
    disclaimerRequired: true,
    status: 'coming_soon',
    publisher: 'Spitzer et al.',
    year: 2006
  },
  {
    id: 'phq-9',
    type: 'psychological',
    title: 'PHQ-9 Depression Scale',
    description: 'Primary care screening tool for major depressive disorder based on DSM criteria.',
    icon: CloudRain,
    color: '#64748b', // slate
    items: 9,
    questions: 9,
    duration: '3-5 min',
    validated: true,
    category: 'Clinical',
    subcategory: 'Mood Disorders',
    clinicalUse: true,
    ageRange: '12+',
    normData: 'Clinical severity ranges',
    interpretationGuide: true,
    disclaimerRequired: true,
    status: 'coming_soon',
    publisher: 'Kroenke et al.',
    year: 2001
  },
  {
    id: 'dass-42',
    type: 'psychological',
    title: 'DASS-42 (Depression, Anxiety, Stress Scales)',
    description: 'Comprehensive tri-dimensional assessment of negative emotional states for research and clinical monitoring.',
    icon: Gauge,
    color: '#dc2626', // red-600
    items: 42,
    questions: 42,
    duration: '10-15 min',
    validated: true,
    category: 'Clinical',
    subcategory: 'Emotional Distress',
    clinicalUse: true,
    ageRange: '17+',
    normData: 'Clinical and non-clinical norms',
    interpretationGuide: true,
    disclaimerRequired: true,
    status: 'coming_soon',
    publisher: 'Lovibond & Lovibond',
    year: 1995
  },
  {
    id: 'pcl-5',
    type: 'psychological',
    title: 'PCL-5 PTSD Checklist',
    description: 'DSM-5 aligned screening for Post-Traumatic Stress Disorder symptoms and severity.',
    icon: AlertCircle,
    color: '#9333ea', // purple-600
    items: 20,
    questions: 20,
    duration: '5-10 min',
    validated: true,
    category: 'Clinical',
    subcategory: 'Trauma & Stress',
    clinicalUse: true,
    status: 'coming_soon',
    ageRange: '18+',
    interpretationGuide: true,
    disclaimerRequired: true
  },

  // Wellbeing & Strengths
  {
    id: 'perma-profiler',
    type: 'psychological',
    title: 'PERMA Wellbeing Profiler',
    description: 'Measures five pillars of flourishing: Positive emotions, Engagement, Relationships, Meaning, and Achievement.',
    icon: Sun,
    color: '#fbbf24', // amber-400
    items: 23,
    questions: 23,
    duration: '5-7 min',
    validated: true,
    category: 'Wellbeing',
    subcategory: 'Positive Psychology',
    clinicalUse: false,
    status: 'coming_soon',
    ageRange: '16+',
    interpretationGuide: true,
    disclaimerRequired: false,
    publisher: 'Seligman et al.'
  },
  {
    id: 'via-character-strengths',
    type: 'psychological',
    title: 'VIA Character Strengths Survey',
    description: 'Identifies top character strengths from 24 universally valued virtues for personal development.',
    icon: Trophy,
    color: '#10b981', // emerald
    items: 120,
    questions: 120,
    duration: '15-20 min',
    validated: true,
    category: 'Wellbeing',
    subcategory: 'Character Strengths',
    clinicalUse: false,
    status: 'coming_soon',
    ageRange: '10+',
    interpretationGuide: true,
    disclaimerRequired: false,
    publisher: 'VIA Institute'
  },
  {
    id: 'resilience-scale',
    type: 'psychological',
    title: 'Connor-Davidson Resilience Scale',
    description: 'Measures psychological resilience and ability to cope with adversity and bounce back from challenges.',
    icon: Mountain,
    color: '#0891b2', // cyan-600
    items: 25,
    questions: 25,
    duration: '5-10 min',
    validated: true,
    category: 'Wellbeing',
    subcategory: 'Resilience',
    clinicalUse: false,
    status: 'coming_soon',
    ageRange: '18+',
    interpretationGuide: true,
    disclaimerRequired: false
  },
  {
    id: 'burnout-assessment',
    type: 'psychological',
    title: 'Maslach Burnout Inventory',
    description: 'Gold standard for measuring occupational burnout across emotional exhaustion, depersonalization, and achievement.',
    icon: BatteryLow,
    color: '#ea580c', // orange-600
    items: 22,
    questions: 22,
    duration: '5-10 min',
    validated: true,
    category: 'Wellbeing',
    subcategory: 'Occupational Health',
    clinicalUse: true,
    ageRange: '18+',
    normData: 'Occupational norms',
    interpretationGuide: true,
    status: 'coming_soon',
    disclaimerRequired: false,
    publisher: 'Maslach & Jackson'
  }
];

// ==============================================
// CREATIVITY & COGNITIVE ASSESSMENTS
// ==============================================

export const CREATIVITY_ASSESSMENTS: CreativityAssessment[] = [
  {
    id: 'divergent-thinking-test',
    type: 'creativity',
    title: 'Torrance Test of Creative Thinking',
    description: 'Classic assessment of divergent thinking measuring fluency, flexibility, originality, and elaboration.',
    icon: Lightbulb,
    color: '#fbbf24', // amber
    items: 30,
    questions: 30,
    duration: '20-30 min',
    validated: true,
    category: 'Creativity',
    domain: 'divergent',
    status: 'coming_soon',

    scoringMethod: 'Multi-dimensional scoring',
    publisher: 'Torrance',
    year: 1974
  },
  {
    id: 'creative-personality-scale',
    type: 'creativity',
    title: 'Creative Personality Scale (CPS)',
    description: 'Assesses personality traits consistently associated with creative achievement and potential.',
    icon: Palette,
    color: '#f472b6', // pink-400
    items: 30,
    questions: 30,
    duration: '10-15 min',
    validated: true,
    category: 'Creativity',
    status: 'coming_soon',

    domain: 'mixed',
    scoringMethod: 'Trait aggregation'
  },
  {
    id: 'remote-associates',
    type: 'creativity',
    title: 'Remote Associates Test (RAT)',
    description: 'Measures convergent thinking and creative problem-solving through word association challenges.',
    icon: Puzzle,
    color: '#818cf8', // violet-400
    items: 40,
    questions: 40,
    duration: '15-20 min',
    validated: true,
    status: 'coming_soon',

    category: 'Creativity',
    domain: 'convergent',
    scoringMethod: 'Accuracy-based',
    publisher: 'Mednick'
  },
  {
    id: 'creative-problem-solving',
    type: 'creativity',
    title: 'Basadur Creative Problem Solving Profile',
    description: 'Identifies preferred creative problem-solving style: Generator, Conceptualizer, Optimizer, or Implementer.',
    icon: PenTool,
    color: '#34d399', // emerald-400
    items: 36,
    questions: 36,
    duration: '15-20 min',
    validated: true,
    status: 'coming_soon',

    category: 'Creativity',
    domain: 'practical',
    scoringMethod: 'Style profiling'
  },
  {
    id: 'systems-thinking',
    type: 'creativity',
    title: 'Systems Thinking Scale',
    description: 'Evaluates ability to understand complex relationships, feedback loops, and emergent patterns.',
    icon: TrendingUp,
    color: '#60a5fa', // blue-400
    items: 28,
    status: 'coming_soon',

    questions: 28,
    duration: '12-15 min',
    validated: true,
    category: 'Cognition',
    domain: 'mixed',
    scoringMethod: 'Competency levels'
  },
  {
    id: 'cognitive-reflection',
    type: 'creativity',
    title: 'Extended Cognitive Reflection Test',
    description: 'Measures tendency to override intuitive responses in favor of analytical thinking.',
    icon: BookOpen,
    color: '#c084fc', // purple-400
    items: 10,
    questions: 10,
    duration: '5-10 min',
    validated: true,
    category: 'Cognition',
    status: 'coming_soon',

    domain: 'convergent',
    scoringMethod: 'Accuracy scoring',
    publisher: 'Frederick'
  },
  {
    id: 'innovative-work-behavior',
    type: 'creativity',
    title: 'Innovative Work Behavior Scale',
    description: 'Assesses innovation in workplace contexts: idea generation, promotion, and implementation.',
    icon: Zap,
    color: '#a855f7', // purple-500
    items: 32,
    questions: 32,
    duration: '10-15 min',
    validated: true,
    status: 'coming_soon',

    category: 'Innovation',
    domain: 'practical',
    scoringMethod: 'Behavioral frequency'
  },
  {
    id: 'creative-self-efficacy',
    type: 'creativity',
    title: 'Creative Self-Efficacy Scale',
    description: 'Measures confidence in one\'s ability to produce creative outcomes and overcome creative challenges.',
    icon: Star,
    color: '#eab308', // yellow-600
    items: 21,
    questions: 21,
    duration: '5-10 min',
    validated: true,
    status: 'coming_soon',

    category: 'Self-Perception',
    domain: 'mixed',
    scoringMethod: 'Likert scale aggregation'
  }
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export const getAssessmentById = (id: string): Assessment | undefined => {
  const allAssessments: Assessment[] = [
    ...PROFESSIONAL_ASSESSMENTS,
    ...PSYCHOLOGICAL_ASSESSMENTS,
    ...CREATIVITY_ASSESSMENTS
  ];
  return allAssessments.find(assessment => assessment.id === id);
};

export const getAssessmentsByCategory = (category: string): Assessment[] => {
  const allAssessments: Assessment[] = [
    ...PROFESSIONAL_ASSESSMENTS,
    ...PSYCHOLOGICAL_ASSESSMENTS,
    ...CREATIVITY_ASSESSMENTS
  ];
  return allAssessments.filter(assessment => assessment.category === category);
};

export const getClinicalAssessments = (): PsychologicalAssessment[] => {
  return PSYCHOLOGICAL_ASSESSMENTS.filter(assessment => assessment.clinicalUse);
};

export const getValidatedAssessments = (): Assessment[] => {
  const allAssessments: Assessment[] = [
    ...PROFESSIONAL_ASSESSMENTS,
    ...PSYCHOLOGICAL_ASSESSMENTS,
    ...CREATIVITY_ASSESSMENTS
  ];
  return allAssessments.filter(assessment => assessment.validated);
};

// Assessment categories for filtering
export const ASSESSMENT_CATEGORIES = {
  professional: ['Communication', 'Leadership', 'Technical', 'Management', 'Interpersonal', 'Productivity'],
  psychological: ['Personality', 'Clinical', 'Wellbeing'],
  creativity: ['Creativity', 'Cognition', 'Innovation', 'Self-Perception']
};

// Important disclaimers for clinical assessments
export const CLINICAL_DISCLAIMER = `
These clinical screening tools are for educational and informational purposes only. 
They are not diagnostic instruments and should not replace professional mental health evaluation. 
If you're experiencing distress, please consult with a qualified healthcare provider.
`;


export const MOCK_TOP_PERFORMERS: TopPerformer[] = [
  {
    id: '1',
    rank: 1,
    name: 'Sarah Chen',
    username: 'sarah_codes',
    profileImage: 'https://picsum.photos/100/100?random=1',
    totalScore: 12450,
    assessmentsCompleted: 24,
    averageScore: 94,
    specialization: 'Full-Stack Development',
    verified: true,
    monthlyGain: 890,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '2',
    rank: 2,
    name: 'Alex Rodriguez',
    username: 'alex_designs',
    profileImage: 'https://picsum.photos/100/100?random=2',
    totalScore: 11920,
    assessmentsCompleted: 21,
    averageScore: 92,
    specialization: 'UI/UX Design',
    verified: true,
    monthlyGain: 650,
    lastActive: new Date('2024-03-14')
  },
  {
    id: '3',
    rank: 3,
    name: 'Maria Santos',
    username: 'maria_data',
    profileImage: 'https://picsum.photos/100/100?random=3',
    totalScore: 11680,
    assessmentsCompleted: 19,
    averageScore: 96,
    specialization: 'Data Science',
    verified: false,
    monthlyGain: 720,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '4',
    rank: 4,
    name: 'David Kim',
    username: 'david_devops',
    profileImage: 'https://picsum.photos/100/100?random=4',
    totalScore: 10980,
    assessmentsCompleted: 18,
    averageScore: 91,
    specialization: 'DevOps Engineering',
    verified: true,
    monthlyGain: 540,
    lastActive: new Date('2024-03-13')
  },
  {
    id: '5',
    rank: 5,
    name: 'Emma Wilson',
    username: 'emma_pm',
    profileImage: 'https://picsum.photos/100/100?random=5',
    totalScore: 10540,
    assessmentsCompleted: 16,
    averageScore: 89,
    specialization: 'Project Management',
    verified: true,
    monthlyGain: 480,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '6',
    rank: 6,
    name: 'Michael Chang',
    username: 'mike_cloud',
    profileImage: 'https://picsum.photos/100/100?random=6',
    totalScore: 10120,
    assessmentsCompleted: 17,
    averageScore: 88,
    specialization: 'Cloud Architecture',
    verified: true,
    monthlyGain: 420,
    lastActive: new Date('2024-03-12')
  },
  {
    id: '7',
    rank: 7,
    name: 'Jessica Taylor',
    username: 'jess_mobile',
    profileImage: 'https://picsum.photos/100/100?random=7',
    totalScore: 9850,
    assessmentsCompleted: 15,
    averageScore: 90,
    specialization: 'Mobile Development',
    verified: false,
    monthlyGain: 380,
    lastActive: new Date('2024-03-14')
  },
  {
    id: '8',
    rank: 8,
    name: 'Ryan Parker',
    username: 'ryan_security',
    profileImage: 'https://picsum.photos/100/100?random=8',
    totalScore: 9420,
    assessmentsCompleted: 14,
    averageScore: 87,
    specialization: 'Cybersecurity',
    verified: true,
    monthlyGain: 340,
    lastActive: new Date('2024-03-11')
  },
  {
    id: '9',
    rank: 9,
    name: 'Lisa Zhang',
    username: 'lisa_ai',
    profileImage: 'https://picsum.photos/100/100?random=9',
    totalScore: 9180,
    assessmentsCompleted: 13,
    averageScore: 93,
    specialization: 'AI/Machine Learning',
    verified: true,
    monthlyGain: 520,
    lastActive: new Date('2024-03-15')
  },
  {
    id: '10',
    rank: 10,
    name: 'Thomas Brown',
    username: 'tom_blockchain',
    profileImage: 'https://picsum.photos/100/100?random=10',
    totalScore: 8940,
    assessmentsCompleted: 12,
    averageScore: 85,
    specialization: 'Blockchain Development',
    verified: false,
    monthlyGain: 290,
    lastActive: new Date('2024-03-10')
  }
];

export const MOCK_ASSESSMENT_LEADERBOARDS: AssessmentLeaderboard[] = [
  {
    assessmentId: 'frontend-dev',
    title: 'Frontend Development',
    category: 'Development',
    leaders: [
      {
        rank: 1,
        name: 'Sarah Chen',
        username: 'sarah_codes',
        score: 98,
        completedAt: new Date('2024-03-10'),
        timeSpent: 42
      },
      {
        rank: 2,
        name: 'Jake Morrison',
        username: 'jake_react',
        score: 96,
        completedAt: new Date('2024-03-12'),
        timeSpent: 38
      },
      {
        rank: 3,
        name: 'Lily Zhang',
        username: 'lily_frontend',
        score: 94,
        completedAt: new Date('2024-03-14'),
        timeSpent: 45
      },
      {
        rank: 4,
        name: 'Marcus Johnson',
        username: 'marcus_js',
        score: 92,
        completedAt: new Date('2024-03-13'),
        timeSpent: 41
      },
      {
        rank: 5,
        name: 'Anna Kowalski',
        username: 'anna_vue',
        score: 90,
        completedAt: new Date('2024-03-11'),
        timeSpent: 47
      }
    ]
  },
  {
    assessmentId: 'data-analysis',
    title: 'Data Analysis',
    category: 'Analytics',
    leaders: [
      {
        rank: 1,
        name: 'Maria Santos',
        username: 'maria_data',
        score: 97,
        completedAt: new Date('2024-03-08'),
        timeSpent: 55
      },
      {
        rank: 2,
        name: 'Chris Anderson',
        username: 'chris_analytics',
        score: 95,
        completedAt: new Date('2024-03-11'),
        timeSpent: 52
      },
      {
        rank: 3,
        name: 'Nina Patel',
        username: 'nina_data',
        score: 93,
        completedAt: new Date('2024-03-13'),
        timeSpent: 48
      },
      {
        rank: 4,
        name: 'Robert Chen',
        username: 'robert_stats',
        score: 91,
        completedAt: new Date('2024-03-09'),
        timeSpent: 58
      },
      {
        rank: 5,
        name: 'Elena Rodriguez',
        username: 'elena_bi',
        score: 89,
        completedAt: new Date('2024-03-12'),
        timeSpent: 54
      }
    ]
  },
  {
    assessmentId: 'ux-design',
    title: 'UX Design',
    category: 'Design',
    leaders: [
      {
        rank: 1,
        name: 'Alex Rodriguez',
        username: 'alex_designs',
        score: 96,
        completedAt: new Date('2024-03-09'),
        timeSpent: 40
      },
      {
        rank: 2,
        name: 'Sophie Chen',
        username: 'sophie_ux',
        score: 94,
        completedAt: new Date('2024-03-12'),
        timeSpent: 37
      },
      {
        rank: 3,
        name: 'James Wilson',
        username: 'james_design',
        score: 92,
        completedAt: new Date('2024-03-14'),
        timeSpent: 43
      },
      {
        rank: 4,
        name: 'Maya Singh',
        username: 'maya_ui',
        score: 90,
        completedAt: new Date('2024-03-10'),
        timeSpent: 39
      },
      {
        rank: 5,
        name: 'Daniel Kim',
        username: 'daniel_product',
        score: 88,
        completedAt: new Date('2024-03-13'),
        timeSpent: 42
      }
    ]
  },
  {
    assessmentId: 'cloud-architecture',
    title: 'Cloud Architecture',
    category: 'Infrastructure',
    leaders: [
      {
        rank: 1,
        name: 'David Kim',
        username: 'david_devops',
        score: 95,
        completedAt: new Date('2024-03-07'),
        timeSpent: 70
      },
      {
        rank: 2,
        name: 'Michael Chang',
        username: 'mike_cloud',
        score: 93,
        completedAt: new Date('2024-03-10'),
        timeSpent: 68
      },
      {
        rank: 3,
        name: 'Sandra Liu',
        username: 'sandra_aws',
        score: 91,
        completedAt: new Date('2024-03-12'),
        timeSpent: 72
      },
      {
        rank: 4,
        name: 'Ahmed Hassan',
        username: 'ahmed_azure',
        score: 89,
        completedAt: new Date('2024-03-11'),
        timeSpent: 75
      },
      {
        rank: 5,
        name: 'Isabella Garcia',
        username: 'bella_k8s',
        score: 87,
        completedAt: new Date('2024-03-13'),
        timeSpent: 69
      }
    ]
  }
];

export const PLATFORM_RANKING_STATS: RankingPlatformStats = {
  totalParticipants: 15420,
  activeThisWeek: 1240,
  averageScore: 78,
  completionsToday: 156
};

// Weekly trending performers (additional data)
export const WEEKLY_TRENDING_PERFORMERS = [
  {
    id: '1',
    name: 'Lisa Zhang',
    username: 'lisa_ai',
    weeklyGain: 520,
    assessmentsThisWeek: 3,
    specialization: 'AI/Machine Learning'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    username: 'sarah_codes',
    weeklyGain: 480,
    assessmentsThisWeek: 2,
    specialization: 'Full-Stack Development'
  },
  {
    id: '3',
    name: 'Maria Santos',
    username: 'maria_data',
    weeklyGain: 420,
    assessmentsThisWeek: 2,
    specialization: 'Data Science'
  }
];

// Assessment completion trends
export const ASSESSMENT_COMPLETION_TRENDS = {
  thisWeek: 1240,
  lastWeek: 1180,
  growthRate: 5.1,
  topCategories: [
    { category: 'Development', completions: 420 },
    { category: 'Design', completions: 280 },
    { category: 'Data Science', completions: 240 },
    { category: 'DevOps', completions: 180 },
    { category: 'Project Management', completions: 120 }
  ]
};

// ==============================================
// PORTFOLIO DATA
// ==============================================

export const MOCK_PORTFOLIOS: Record<string, Portfolio> = {
  'alice_creates': {
    id: '1',
    userId: '1',
    username: 'alice_creates',
    name: 'Alice Johnson',
    title: 'Creative Director & Digital Artist',
    tagline: 'Transforming ideas into immersive digital experiences',
    bio: 'Award-winning creative director with 8+ years of experience crafting digital narratives that resonate. My work spans interactive installations, brand identities, and digital products that have reached millions of users worldwide. Featured in major galleries and recognized by industry leaders for innovative approaches to storytelling through technology.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=1',
    coverImage: 'https://picsum.photos/1400/700?random=1',
    visibility: 'public',
    status: 'active',
    location: 'San Francisco, CA',
    yearsOfExperience: 8,
    specializations: ['Digital Art', 'Creative Direction', 'Brand Strategy', 'UI/UX Design', '3D Visualization'],
    tags: ['Creative', 'Digital Art', 'Design', 'Innovation', 'Technology'],
    socialLinks: {
      website: 'https://alice-creates.com',
      instagram: 'https://instagram.com/alice_creates',
      twitter: 'https://twitter.com/alice_creates',
      linkedin: 'https://linkedin.com/in/alice',
      behance: 'https://behance.net/alice',
      github: 'https://github.com/alice'
    },
    contactEmail: 'alice@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 125000,
      uniqueVisitors: 18500,
      totalPieces: 42,
      totalReviews: 127,
      averageRating: 4.9,
      responseRate: 95,
      responseTime: 'within 2 hours',
      viewsThisWeek: 3200,
      viewsThisMonth: 14800,
      shareCount: 890,
      savedCount: 1240
    },
    featuredPieces: ['1', '2', '3'],
    createdAt: new Date('2024-01-15'),
    lastActiveAt: new Date('2024-03-10')
  },
  'bob_codes': {
    id: '2',
    userId: '2',
    username: 'bob_codes',
    name: 'Robert Chen',
    title: 'Senior Software Architect',
    tagline: 'Building scalable systems that power the future',
    bio: 'Senior software architect with 12+ years of experience designing enterprise-scale systems. Led architecture for platforms serving 100M+ users. Passionate about clean code, system design, and mentoring the next generation of engineers. Certified in multiple cloud platforms and recognized for innovative solutions.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/1000/1000?random=2',
    coverImage: 'https://picsum.photos/1400/700?random=2',
    visibility: 'public',
    status: 'active',
    location: 'Seattle, WA',
    yearsOfExperience: 12,
    specializations: ['System Architecture', 'Cloud Computing', 'Microservices', 'Team Leadership', 'DevOps'],
    tags: ['Architecture', 'Leadership', 'Cloud', 'Scalability', 'Innovation'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/bob',
      github: 'https://github.com/bob',
      website: 'https://bob-codes.dev'
    },
    contactEmail: 'bob@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 15,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 67000,
      uniqueVisitors: 8900,
      totalPieces: 28,
      totalReviews: 84,
      averageRating: 4.8,
      responseRate: 98,
      responseTime: 'within 4 hours',
      viewsThisWeek: 1800,
      viewsThisMonth: 8400,
      shareCount: 420,
      savedCount: 680
    },
    featuredPieces: ['4', '5'],
    createdAt: new Date('2024-02-10'),
    lastActiveAt: new Date('2024-03-09')
  },
  'charlie_learns': {
    id: '3',
    userId: '3',
    username: 'charlie_learns',
    name: 'Charlie Davis',
    title: 'Full-Stack Developer & Lifelong Learner',
    tagline: 'Documenting my journey from curiosity to mastery',
    bio: 'Self-taught developer on a mission to master modern web technologies. I believe in learning in public and helping others grow. Currently diving deep into system design while building projects that solve real problems. Follow my journey as I tackle new concepts and share what I learn.',
    kind: 'educational',
    profileImage: 'https://picsum.photos/900/900?random=3',
    coverImage: 'https://picsum.photos/1400/700?random=3',
    visibility: 'public',
    status: 'active',
    location: 'Austin, TX',
    yearsOfExperience: 3,
    specializations: ['Web Development', 'JavaScript', 'React', 'Node.js', 'System Design'],
    tags: ['Learning', 'Development', 'Self-Taught', 'Growth', 'Community'],
    socialLinks: {
      github: 'https://github.com/charlie',
      twitter: 'https://twitter.com/charlie_learns',
      linkedin: 'https://linkedin.com/in/charlie'
    },
    contactEmail: 'charlie@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 25,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true,
      showProgress: true,
      publicProgress: true,
      showCertifications: true,
      trackLearningTime: true,
      notifyOnConceptCompletion: true,
      weeklyProgressEmail: true
    },
    stats: {
      totalViews: 28000,
      uniqueVisitors: 3200,
      totalPieces: 15,
      totalReviews: 42,
      averageRating: 4.6,
      responseRate: 88,
      responseTime: 'within 8 hours',
      viewsThisWeek: 850,
      viewsThisMonth: 3600,
      shareCount: 190,
      savedCount: 280,
      totalConcepts: 156,
      completedConcepts: 134,
      inProgressConcepts: 22,
      totalLearningHours: 420,
      averageScore: 87,
      streakDays: 127,
      certificationsEarned: 8
    },
    conceptProgress: [
      {
        conceptId: '1',
        status: 'completed',
        startedAt: '2024-02-01T10:00:00Z',
        completedAt: '2024-02-05T14:30:00Z',
        score: 95,
        attempts: 2,
        notes: 'Excellent understanding of React hooks patterns'
      },
      {
        conceptId: '2',
        status: 'in-progress',
        startedAt: '2024-03-01T09:00:00Z',
        score: 78,
        attempts: 1,
        notes: 'Working on advanced database optimization techniques'
      }
    ],
    learningGoals: [
      'Master system design principles',
      'Build a distributed application',
      'Contribute to open source projects',
      'Learn DevOps best practices',
      'Understand advanced algorithms'
    ],
    currentBooks: ['book1', 'book2'],
    completedBooks: ['book3', 'book4', 'book5'],
    featuredPieces: ['6', '7'],
    createdAt: new Date('2024-01-20'),
    lastActiveAt: new Date('2024-03-10')
  },
  'dana_writes': {
    id: '4',
    userId: '4',
    username: 'dana_writes',
    name: 'Dana Mitchell',
    title: 'Author & Storytelling Coach',
    tagline: 'Helping voices find their story',
    bio: 'Published author and storytelling coach with a decade of experience guiding writers to refine their craft. My novels have been translated into 5 languages and featured in literary festivals worldwide. Passionate about mentoring aspiring writers, especially in digital-first publishing.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=4',
    coverImage: 'https://picsum.photos/1400/700?random=4',
    visibility: 'public',
    status: 'active',
    location: 'New York, NY',
    yearsOfExperience: 10,
    specializations: ['Creative Writing', 'Publishing', 'Editing', 'Workshops'],
    tags: ['Writing', 'Publishing', 'Creativity', 'Mentorship'],
    socialLinks: {
      website: 'https://dana-writes.com',
      instagram: 'https://instagram.com/dana_writes',
      twitter: 'https://twitter.com/dana_writes',
      linkedin: 'https://linkedin.com/in/danamitchell'
    },
    contactEmail: 'dana@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 54000,
      uniqueVisitors: 7200,
      totalPieces: 30,
      totalReviews: 63,
      averageRating: 4.7,
      responseRate: 92,
      responseTime: 'within 1 day',
      viewsThisWeek: 1300,
      viewsThisMonth: 5600,
      shareCount: 300,
      savedCount: 470
    },
    featuredPieces: ['8', '9'],
    createdAt: new Date('2024-01-25'),
    lastActiveAt: new Date('2024-03-11')
  },
  'ella_designs': {
    id: '5',
    userId: '5',
    username: 'ella_designs',
    name: 'Ella Rodriguez',
    title: 'Product Designer & Accessibility Advocate',
    tagline: 'Design that includes everyone',
    bio: 'Product designer with 7+ years of experience specializing in accessibility and inclusive design. I help organizations create products that reach broader audiences by focusing on universal usability. Speaker at multiple UX conferences and contributor to open-source accessibility libraries.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=5',
    coverImage: 'https://picsum.photos/1400/700?random=5',
    visibility: 'public',
    status: 'active',
    location: 'Chicago, IL',
    yearsOfExperience: 7,
    specializations: ['Product Design', 'Accessibility', 'User Research', 'Inclusive Design'],
    tags: ['UX', 'Accessibility', 'Design Thinking', 'Innovation'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ella',
      behance: 'https://behance.net/ella',
      github: 'https://github.com/ella-designs'
    },
    contactEmail: 'ella@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 18,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 41000,
      uniqueVisitors: 5800,
      totalPieces: 22,
      totalReviews: 52,
      averageRating: 4.85,
      responseRate: 96,
      responseTime: 'within 3 hours',
      viewsThisWeek: 1600,
      viewsThisMonth: 7100,
      shareCount: 370,
      savedCount: 560
    },
    featuredPieces: ['10', '11'],
    createdAt: new Date('2024-02-12'),
    lastActiveAt: new Date('2024-03-10')
  },
  'felix_community': {
    id: '6',
    userId: '6',
    username: 'felix_community',
    name: 'Felix Thompson',
    title: 'Community Builder & Nonprofit Organizer',
    tagline: 'Creating spaces where people thrive',
    bio: 'Community organizer and nonprofit leader focused on building digital and physical communities that empower people. Over 9 years of experience coordinating large-scale events, online communities, and grassroots initiatives. Passionate about impact-driven collaboration.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=6',
    coverImage: 'https://picsum.photos/1400/700?random=6',
    visibility: 'public',
    status: 'active',
    location: 'Portland, OR',
    yearsOfExperience: 9,
    specializations: ['Community Building', 'Event Organization', 'Nonprofit Strategy', 'Digital Engagement'],
    tags: ['Community', 'Nonprofit', 'Collaboration', 'Leadership'],
    socialLinks: {
      website: 'https://felix-community.org',
      twitter: 'https://twitter.com/felix_builds',
      linkedin: 'https://linkedin.com/in/felixthompson'
    },
    contactEmail: 'felix@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: false,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 23000,
      uniqueVisitors: 4100,
      totalPieces: 18,
      totalReviews: 36,
      averageRating: 4.5,
      responseRate: 91,
      responseTime: 'within 6 hours',
      viewsThisWeek: 900,
      viewsThisMonth: 3100,
      shareCount: 210,
      savedCount: 330
    },
    featuredPieces: ['12'],
    createdAt: new Date('2024-02-01'),
    lastActiveAt: new Date('2024-03-09')
  },
  'sandy_sings': {
    id: '7',
    userId: '7',
    username: 'sandy_sings',
    name: 'Sandra Lopez',
    title: 'Vocalist & Music Educator',
    tagline: 'Finding harmony in every note',
    bio: 'Professional vocalist with over a decade of performance experience across jazz, soul, and contemporary music. Passionate about teaching others to unlock their unique voice. Performed in international tours and currently leading vocal workshops that blend technique with self-expression.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=7',
    coverImage: 'https://picsum.photos/1400/700?random=7',
    visibility: 'public',
    status: 'active',
    location: 'Los Angeles, CA',
    yearsOfExperience: 11,
    specializations: ['Vocal Performance', 'Songwriting', 'Music Education', 'Stage Presence'],
    tags: ['Music', 'Vocalist', 'Performance', 'Creativity'],
    socialLinks: {
      website: 'https://sandy-sings.com',
      instagram: 'https://instagram.com/sandy_sings',
      youtube: 'https://youtube.com/sandy_sings',
      spotify: 'https://spotify.com/artist/sandy_sings'
    },
    contactEmail: 'sandy@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 16,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 76000,
      uniqueVisitors: 10100,
      totalPieces: 35,
      totalReviews: 92,
      averageRating: 4.9,
      responseRate: 97,
      responseTime: 'within 3 hours',
      viewsThisWeek: 2500,
      viewsThisMonth: 9800,
      shareCount: 640,
      savedCount: 940
    },
    featuredPieces: ['13', '14'],
    createdAt: new Date('2024-02-05'),
    lastActiveAt: new Date('2024-03-10')
  },
  'kristin_knits': {
    id: '8',
    userId: '8',
    username: 'kristin_knits',
    name: 'Kristin Meyer',
    title: 'Fiber Artist & Pattern Designer',
    tagline: 'Stitching warmth into every creation',
    bio: 'Fiber artist specializing in hand-knitting, crochet, and sustainable textile design. My patterns have been published in leading craft magazines, and I run an online community for over 20,000 makers. Dedicated to eco-friendly practices and teaching traditional techniques with a modern twist.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=8',
    coverImage: 'https://picsum.photos/1400/700?random=8',
    visibility: 'public',
    status: 'active',
    location: 'Boulder, CO',
    yearsOfExperience: 9,
    specializations: ['Knitting', 'Crochet', 'Pattern Design', 'Sustainable Materials'],
    tags: ['Fiber Arts', 'Handmade', 'Crafts', 'Sustainability'],
    socialLinks: {
      website: 'https://kristin-knits.com',
      instagram: 'https://instagram.com/kristin_knits',
      etsy: 'https://etsy.com/shop/kristinknits',
      pinterest: 'https://pinterest.com/kristin_knits'
    },
    contactEmail: 'kristin@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'grid',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 34000,
      uniqueVisitors: 4800,
      totalPieces: 40,
      totalReviews: 76,
      averageRating: 4.85,
      responseRate: 93,
      responseTime: 'within 1 day',
      viewsThisWeek: 1200,
      viewsThisMonth: 5100,
      shareCount: 310,
      savedCount: 570
    },
    featuredPieces: ['15', '16', '17'],
    createdAt: new Date('2024-01-30'),
    lastActiveAt: new Date('2024-03-11')
  },
  'hannah_hunts': {
    id: '9',
    userId: '9',
    username: 'hannah_hunts',
    name: 'Hannah Green',
    title: 'Wildlife Photographer & Conservationist',
    tagline: 'Capturing nature, protecting its future',
    bio: 'Wildlife photographer and conservationist dedicated to documenting endangered species and ecosystems. My work has been featured in National Geographic and exhibited internationally. Actively involved in conservation projects and workshops teaching ethical wildlife photography.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=9',
    coverImage: 'https://picsum.photos/1400/700?random=9',
    visibility: 'public',
    status: 'active',
    location: 'Denver, CO',
    yearsOfExperience: 8,
    specializations: ['Wildlife Photography', 'Conservation', 'Expeditions', 'Storytelling'],
    tags: ['Photography', 'Nature', 'Wildlife', 'Conservation'],
    socialLinks: {
      website: 'https://hannah-hunts.com',
      instagram: 'https://instagram.com/hannah_hunts',
      twitter: 'https://twitter.com/hannah_hunts',
      linkedin: 'https://linkedin.com/in/hannahgreen'
    },
    contactEmail: 'hannah@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 24,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 89000,
      uniqueVisitors: 12300,
      totalPieces: 50,
      totalReviews: 110,
      averageRating: 4.95,
      responseRate: 99,
      responseTime: 'within 2 hours',
      viewsThisWeek: 3100,
      viewsThisMonth: 12200,
      shareCount: 870,
      savedCount: 1350
    },
    featuredPieces: ['18', '19'],
    createdAt: new Date('2024-02-08'),
    lastActiveAt: new Date('2024-03-12')
  },
  'lucas_writer': {
    id: '15',
    userId: '15',
    username: 'lucas_writer',
    name: 'Lucas Rivera',
    title: 'Author & Creative Writing Coach',
    tagline: 'Stories that move hearts and minds',
    bio: 'Published novelist and short story writer with 12+ years of experience. My works focus on contemporary fiction and have been featured in literary journals and anthologies. Passionate about mentoring new writers and teaching creative writing workshops worldwide.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=15',
    coverImage: 'https://picsum.photos/1400/700?random=15',
    visibility: 'public',
    status: 'active',
    location: 'Brooklyn, NY',
    yearsOfExperience: 12,
    specializations: ['Fiction Writing', 'Editing', 'Workshops', 'Storytelling'],
    tags: ['Writer', 'Fiction', 'Literature', 'Mentorship'],
    socialLinks: {
      website: 'https://lucaswrites.com',
      twitter: 'https://twitter.com/lucas_writer',
      linkedin: 'https://linkedin.com/in/lucasrivera'
    },
    contactEmail: 'lucas@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 54000,
      uniqueVisitors: 7800,
      totalPieces: 28,
      totalReviews: 64,
      averageRating: 4.7,
      responseRate: 92,
      responseTime: 'within 1 day',
      viewsThisWeek: 1400,
      viewsThisMonth: 5200,
      shareCount: 410,
      savedCount: 660
    },
    featuredPieces: ['20', '21'],
    createdAt: new Date('2024-01-20'),
    lastActiveAt: new Date('2024-03-09')
  },
  'maya_teacher': {
    id: '16',
    userId: '16',
    username: 'maya_teacher',
    name: 'Maya Desai',
    title: 'Educator & Curriculum Designer',
    tagline: 'Empowering learners through knowledge',
    bio: 'High school teacher and curriculum specialist with a focus on inclusive and engaging learning. I’ve designed educational resources adopted by multiple school districts and train educators on integrating technology into the classroom.',
    kind: 'educational',
    profileImage: 'https://picsum.photos/900/900?random=16',
    coverImage: 'https://picsum.photos/1400/700?random=16',
    visibility: 'public',
    status: 'active',
    location: 'Chicago, IL',
    yearsOfExperience: 14,
    specializations: ['Curriculum Design', 'STEM Education', 'EdTech', 'Inclusive Learning'],
    tags: ['Education', 'STEM', 'Teaching', 'Innovation'],
    socialLinks: {
      website: 'https://mayateaches.com',
      linkedin: 'https://linkedin.com/in/mayadesai',
      twitter: 'https://twitter.com/maya_teacher'
    },
    contactEmail: 'maya@example.com',
    showContactInfo: false,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: false,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 10,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 28000,
      uniqueVisitors: 4900,
      totalPieces: 15,
      totalReviews: 34,
      averageRating: 4.8,
      responseRate: 96,
      responseTime: 'within 12 hours',
      viewsThisWeek: 800,
      viewsThisMonth: 3100,
      shareCount: 230,
      savedCount: 410
    },
    featuredPieces: ['22'],
    createdAt: new Date('2024-01-18'),
    lastActiveAt: new Date('2024-03-11'),
    learningGoals: ['Integrate AI into curriculum', 'Expand inclusive teaching methods'],
    currentBooks: ['book-101'],
    completedBooks: ['book-55', 'book-76']
  },
  'ethan_hybrid': {
    id: '17',
    userId: '17',
    username: 'ethan_hybrid',
    name: 'Ethan Clarke',
    title: 'Data Scientist & Educator',
    tagline: 'Where numbers meet knowledge',
    bio: 'Data scientist with 7 years of professional experience and a passion for teaching. I work at the intersection of AI research and education, building projects that both solve real-world problems and educate others about data literacy.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=17',
    coverImage: 'https://picsum.photos/1400/700?random=17',
    visibility: 'public',
    status: 'active',
    location: 'Austin, TX',
    yearsOfExperience: 7,
    specializations: ['Machine Learning', 'Data Visualization', 'Statistics', 'EdTech'],
    tags: ['Data Science', 'AI', 'Education', 'Visualization'],
    socialLinks: {
      website: 'https://ethanclarke.ai',
      github: 'https://github.com/ethan-hybrid',
      linkedin: 'https://linkedin.com/in/ethanclarke'
    },
    contactEmail: 'ethan@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 18,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 47000,
      uniqueVisitors: 8300,
      totalPieces: 22,
      totalReviews: 52,
      averageRating: 4.85,
      responseRate: 94,
      responseTime: 'within 4 hours',
      viewsThisWeek: 1600,
      viewsThisMonth: 5900,
      shareCount: 350,
      savedCount: 510
    },
    featuredPieces: ['23', '24'],
    createdAt: new Date('2024-02-02'),
    lastActiveAt: new Date('2024-03-12'),
    learningGoals: ['Publish an AI textbook', 'Launch a MOOC on data literacy'],
    currentBooks: ['book-202'],
    completedBooks: ['book-101', 'book-150']
  },
  'sofia_designer': {
    id: '18',
    userId: '18',
    username: 'sofia_designer',
    name: 'Sofia Martins',
    title: 'Product Designer',
    tagline: 'Designing products with empathy and impact',
    bio: 'Product designer with 9+ years in the SaaS and consumer tech space. My work focuses on creating user-centered interfaces that balance business goals with delightful experiences. Mentor at design bootcamps and contributor to open-source design systems.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=18',
    coverImage: 'https://picsum.photos/1400/700?random=18',
    visibility: 'public',
    status: 'active',
    location: 'Lisbon, Portugal',
    yearsOfExperience: 9,
    specializations: ['Product Design', 'Interaction Design', 'Design Systems', 'Accessibility'],
    tags: ['Design', 'UX', 'Accessibility', 'SaaS'],
    socialLinks: {
      website: 'https://sofiadesigns.com',
      linkedin: 'https://linkedin.com/in/sofiamartins',
      behance: 'https://behance.net/sofia_m'
    },
    contactEmail: 'sofia@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 14,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 69000,
      uniqueVisitors: 11200,
      totalPieces: 36,
      totalReviews: 87,
      averageRating: 4.9,
      responseRate: 97,
      responseTime: 'within 6 hours',
      viewsThisWeek: 2100,
      viewsThisMonth: 8100,
      shareCount: 570,
      savedCount: 750
    },
    featuredPieces: ['25'],
    createdAt: new Date('2024-01-28'),
    lastActiveAt: new Date('2024-03-13')
  },
  'james_poet': {
    id: '19',
    userId: '19',
    username: 'james_poet',
    name: 'James O’Donnell',
    title: 'Poet & Spoken Word Performer',
    tagline: 'Words that echo and ignite',
    bio: 'Poet and performer whose works have been published in literary magazines and performed at national poetry slams. With 10 years of experience, I focus on themes of identity, resilience, and community. Founder of a nonprofit bringing poetry workshops to underserved schools.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=19',
    coverImage: 'https://picsum.photos/1400/700?random=19',
    visibility: 'public',
    status: 'active',
    location: 'Atlanta, GA',
    yearsOfExperience: 10,
    specializations: ['Poetry', 'Spoken Word', 'Workshops', 'Mentorship'],
    tags: ['Poetry', 'Writing', 'Performance', 'Community'],
    socialLinks: {
      website: 'https://jamespoetry.com',
      instagram: 'https://instagram.com/james_poet',
      youtube: 'https://youtube.com/james_poetry'
    },
    contactEmail: 'james@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'masonry',
      piecesPerPage: 15,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 51000,
      uniqueVisitors: 7200,
      totalPieces: 30,
      totalReviews: 61,
      averageRating: 4.8,
      responseRate: 95,
      responseTime: 'within 5 hours',
      viewsThisWeek: 1300,
      viewsThisMonth: 4900,
      shareCount: 380,
      savedCount: 560
    },
    featuredPieces: ['26', '27'],
    createdAt: new Date('2024-01-22'),
    lastActiveAt: new Date('2024-03-12')
  },
  'nina_researcher': {
    id: '20',
    userId: '20',
    username: 'nina_researcher',
    name: 'Dr. Nina Patel',
    title: 'Educational Researcher & Author',
    tagline: 'Exploring the future of learning',
    bio: 'Education researcher with a PhD in Learning Sciences. Author of multiple papers on digital learning, gamification, and inclusive pedagogy. I collaborate with universities and nonprofits to advance innovative approaches to education worldwide.',
    kind: 'educational',
    profileImage: 'https://picsum.photos/900/900?random=20',
    coverImage: 'https://picsum.photos/1400/700?random=20',
    visibility: 'public',
    status: 'active',
    location: 'Cambridge, MA',
    yearsOfExperience: 11,
    specializations: ['Learning Sciences', 'Gamification', 'Inclusive Education', 'Research'],
    tags: ['Education', 'Research', 'Innovation', 'Learning'],
    socialLinks: {
      website: 'https://nina-patel-research.org',
      linkedin: 'https://linkedin.com/in/ninapatel',
      twitter: 'https://twitter.com/nina_research'
    },
    contactEmail: 'nina@example.com',
    showContactInfo: false,
    settings: {
      allowReviews: false,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 8,
      notifyOnReview: false,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 22000,
      uniqueVisitors: 3900,
      totalPieces: 12,
      totalReviews: 18,
      averageRating: 4.6,
      responseRate: 90,
      responseTime: 'within 2 days',
      viewsThisWeek: 500,
      viewsThisMonth: 2100,
      shareCount: 160,
      savedCount: 280
    },
    featuredPieces: ['28'],
    createdAt: new Date('2024-01-26'),
    lastActiveAt: new Date('2024-03-13'),
    learningGoals: ['Publish a new research book', 'Develop open-access resources'],
    currentBooks: ['book-300'],
    completedBooks: ['book-201']
  },
  'omar_dev': {
    id: '21',
    userId: '21',
    username: 'omar_dev',
    name: 'Omar Haddad',
    title: 'Full-Stack Developer & Mentor',
    tagline: 'Building scalable apps, mentoring the next wave',
    bio: 'Software engineer with 8 years of experience across startups and enterprises. Specialized in scalable web architectures and cloud systems. Mentor for junior developers and contributor to open-source educational platforms.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=21',
    coverImage: 'https://picsum.photos/1400/700?random=21',
    visibility: 'public',
    status: 'active',
    location: 'Toronto, Canada',
    yearsOfExperience: 8,
    specializations: ['Full-Stack Development', 'Cloud Computing', 'Open Source', 'Mentorship'],
    tags: ['Software', 'Web Dev', 'Cloud', 'Mentorship'],
    socialLinks: {
      website: 'https://omar.dev',
      github: 'https://github.com/omarh',
      linkedin: 'https://linkedin.com/in/omarh'
    },
    contactEmail: 'omar@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'grid',
      piecesPerPage: 16,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 58000,
      uniqueVisitors: 8900,
      totalPieces: 25,
      totalReviews: 48,
      averageRating: 4.8,
      responseRate: 96,
      responseTime: 'within 6 hours',
      viewsThisWeek: 1500,
      viewsThisMonth: 5700,
      shareCount: 430,
      savedCount: 600
    },
    featuredPieces: ['29', '30'],
    createdAt: new Date('2024-01-30'),
    lastActiveAt: new Date('2024-03-12')
  },
  'claire_artist': {
    id: '22',
    userId: '22',
    username: 'claire_artist',
    name: 'Claire Dubois',
    title: 'Painter & Visual Storyteller',
    tagline: 'Brushstrokes that tell human stories',
    bio: 'French painter blending realism and abstract expression. Exhibited in galleries across Europe with works exploring memory, culture, and belonging. Active in community mural projects and online teaching.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=22',
    coverImage: 'https://picsum.photos/1400/700?random=22',
    visibility: 'public',
    status: 'active',
    location: 'Paris, France',
    yearsOfExperience: 13,
    specializations: ['Painting', 'Mixed Media', 'Mural Art', 'Teaching'],
    tags: ['Art', 'Painting', 'Community', 'Culture'],
    socialLinks: {
      website: 'https://clairedubois.com',
      instagram: 'https://instagram.com/claire_artist',
      behance: 'https://behance.net/claire_dubois'
    },
    contactEmail: 'claire@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 18,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 74000,
      uniqueVisitors: 10400,
      totalPieces: 40,
      totalReviews: 92,
      averageRating: 4.9,
      responseRate: 97,
      responseTime: 'within 5 hours',
      viewsThisWeek: 2500,
      viewsThisMonth: 9100,
      shareCount: 670,
      savedCount: 950
    },
    featuredPieces: ['31', '32', '33'],
    createdAt: new Date('2024-02-03'),
    lastActiveAt: new Date('2024-03-12')
  },
  'daniel_poet': {
    id: '23',
    userId: '23',
    username: 'daniel_poet',
    name: 'Daniel Kim',
    title: 'Poet & Literary Critic',
    tagline: 'Exploring the world through verse',
    bio: 'Poet and essayist whose work has appeared in international journals. Specializes in blending Eastern and Western traditions of poetry. Hosts a podcast on contemporary literature and teaches creative writing at a local university.',
    kind: 'creative',
    profileImage: 'https://picsum.photos/900/900?random=23',
    coverImage: 'https://picsum.photos/1400/700?random=23',
    visibility: 'public',
    status: 'active',
    location: 'Seoul, South Korea',
    yearsOfExperience: 15,
    specializations: ['Poetry', 'Literary Criticism', 'Creative Writing'],
    tags: ['Poetry', 'Writing', 'Criticism', 'Literature'],
    socialLinks: {
      website: 'https://danielkimwrites.com',
      twitter: 'https://twitter.com/daniel_poet',
      linkedin: 'https://linkedin.com/in/danielkim'
    },
    contactEmail: 'daniel@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'grid',
      piecesPerPage: 14,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 49000,
      uniqueVisitors: 7000,
      totalPieces: 27,
      totalReviews: 55,
      averageRating: 4.7,
      responseRate: 93,
      responseTime: 'within 1 day',
      viewsThisWeek: 1200,
      viewsThisMonth: 4500,
      shareCount: 310,
      savedCount: 480
    },
    featuredPieces: ['34'],
    createdAt: new Date('2024-01-25'),
    lastActiveAt: new Date('2024-03-11')
  },
  'soheil_hybrid': {
    id: '24',
    userId: '24',
    username: 'soheil_hybrid',
    name: 'Soheil Rahimi',
    title: 'Engineer & Educational Content Creator',
    tagline: 'Teaching through building',
    bio: 'Mechanical engineer with a love for teaching applied sciences. I combine professional engineering projects with approachable educational videos and tutorials that reach thousands of learners globally.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=24',
    coverImage: 'https://picsum.photos/1400/700?random=24',
    visibility: 'public',
    status: 'active',
    location: 'Berlin, Germany',
    yearsOfExperience: 9,
    specializations: ['Mechanical Engineering', 'STEM Education', 'Video Content'],
    tags: ['Engineering', 'Education', 'STEM', 'Content Creation'],
    socialLinks: {
      website: 'https://soheilrahimi.com',
      youtube: 'https://youtube.com/soheil_engineer',
      linkedin: 'https://linkedin.com/in/soheilrahimi'
    },
    contactEmail: 'soheil@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 56000,
      uniqueVisitors: 8600,
      totalPieces: 29,
      totalReviews: 61,
      averageRating: 4.8,
      responseRate: 95,
      responseTime: 'within 8 hours',
      viewsThisWeek: 1700,
      viewsThisMonth: 6000,
      shareCount: 430,
      savedCount: 700
    },
    featuredPieces: ['35', '36'],
    createdAt: new Date('2024-01-29'),
    lastActiveAt: new Date('2024-03-12'),
    learningGoals: ['Expand STEM YouTube channel', 'Publish a beginner-friendly engineering book'],
    currentBooks: ['book-88'],
    completedBooks: ['book-40']
  },
  'elena_journalist': {
    id: '25',
    userId: '25',
    username: 'elena_journalist',
    name: 'Elena Rossi',
    title: 'Journalist & Investigative Writer',
    tagline: 'Uncovering stories that matter',
    bio: 'Investigative journalist with over a decade of experience covering politics, human rights, and environmental issues. Published in international outlets and recognized with multiple awards for in-depth reporting.',
    kind: 'professional',
    profileImage: 'https://picsum.photos/900/900?random=25',
    coverImage: 'https://picsum.photos/1400/700?random=25',
    visibility: 'public',
    status: 'active',
    location: 'Rome, Italy',
    yearsOfExperience: 12,
    specializations: ['Investigative Journalism', 'Politics', 'Human Rights', 'Environment'],
    tags: ['Journalism', 'Writing', 'Politics', 'Investigative'],
    socialLinks: {
      website: 'https://elenarossi.com',
      twitter: 'https://twitter.com/elena_journalist',
      linkedin: 'https://linkedin.com/in/elena-rossi'
    },
    contactEmail: 'elena@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 82000,
      uniqueVisitors: 12500,
      totalPieces: 45,
      totalReviews: 101,
      averageRating: 4.9,
      responseRate: 98,
      responseTime: 'within 4 hours',
      viewsThisWeek: 2900,
      viewsThisMonth: 11300,
      shareCount: 790,
      savedCount: 980
    },
    featuredPieces: ['37', '38'],
    createdAt: new Date('2024-02-01'),
    lastActiveAt: new Date('2024-03-13')
  },
  'liam_maker': {
    id: '26',
    userId: '26',
    username: 'liam_maker',
    name: 'Liam O’Connor',
    title: 'Engineer & DIY Creator',
    tagline: 'Engineering meets creative tinkering',
    bio: 'Mechanical engineer turned maker. I design open-source hardware projects and document the process through video tutorials and blog posts. My work blends technical rigor with hands-on creativity to inspire the next generation of builders.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=26',
    coverImage: 'https://picsum.photos/1400/700?random=26',
    visibility: 'public',
    status: 'active',
    location: 'Dublin, Ireland',
    yearsOfExperience: 10,
    specializations: ['Mechanical Engineering', 'DIY', 'Open-Source Hardware'],
    tags: ['Engineering', 'Maker', 'DIY', 'Hardware'],
    socialLinks: {
      website: 'https://liammaker.com',
      youtube: 'https://youtube.com/liam_maker',
      github: 'https://github.com/liam-maker'
    },
    contactEmail: 'liam@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 18,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 47000,
      uniqueVisitors: 7200,
      totalPieces: 24,
      totalReviews: 58,
      averageRating: 4.7,
      responseRate: 95,
      responseTime: 'within 12 hours',
      viewsThisWeek: 1400,
      viewsThisMonth: 5000,
      shareCount: 380,
      savedCount: 610
    },
    featuredPieces: ['39', '40'],
    createdAt: new Date('2024-02-04'),
    lastActiveAt: new Date('2024-03-12')
  },
  'sofia_designs': {
    id: '27',
    userId: '27',
    username: 'sofia_designs',
    name: 'Sofia Alvarez',
    title: 'UX Designer & Creative Educator',
    tagline: 'Design with empathy, teach with passion',
    bio: 'User experience designer who bridges design and teaching. I lead product design for startups while also creating educational resources for design students. My hybrid career allows me to practice and pass on design knowledge.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=27',
    coverImage: 'https://picsum.photos/1400/700?random=27',
    visibility: 'public',
    status: 'active',
    location: 'Mexico City, Mexico',
    yearsOfExperience: 7,
    specializations: ['UX/UI Design', 'Design Education', 'Product Strategy'],
    tags: ['UX', 'UI', 'Education', 'Design'],
    socialLinks: {
      website: 'https://sofiadesigns.com',
      linkedin: 'https://linkedin.com/in/sofia-alvarez',
      instagram: 'https://instagram.com/sofia.designs'
    },
    contactEmail: 'sofia@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: false,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'grid',
      piecesPerPage: 15,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 39000,
      uniqueVisitors: 6200,
      totalPieces: 19,
      totalReviews: 42,
      averageRating: 4.8,
      responseRate: 92,
      responseTime: 'within 1 day',
      viewsThisWeek: 1100,
      viewsThisMonth: 4200,
      shareCount: 270,
      savedCount: 500
    },
    featuredPieces: ['41'],
    createdAt: new Date('2024-02-05'),
    lastActiveAt: new Date('2024-03-11')
  },
  'arjun_musictech': {
    id: '28',
    userId: '28',
    username: 'arjun_musictech',
    name: 'Arjun Mehta',
    title: 'Musician & Audio Engineer',
    tagline: 'Where art meets sound technology',
    bio: 'Producer and guitarist with a strong background in audio engineering. I compose music while also teaching sound design and mixing to students online. My portfolio blends live performance with technical expertise.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=28',
    coverImage: 'https://picsum.photos/1400/700?random=28',
    visibility: 'public',
    status: 'active',
    location: 'Mumbai, India',
    yearsOfExperience: 12,
    specializations: ['Music Production', 'Audio Engineering', 'Teaching'],
    tags: ['Music', 'Audio', 'Production', 'Education'],
    socialLinks: {
      website: 'https://arjunmusictech.com',
      soundcloud: 'https://soundcloud.com/arjunmusictech',
      linkedin: 'https://linkedin.com/in/arjunmehta'
    },
    contactEmail: 'arjun@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: true,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: false,
      defaultGalleryView: 'list',
      piecesPerPage: 12,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 56000,
      uniqueVisitors: 9100,
      totalPieces: 28,
      totalReviews: 64,
      averageRating: 4.7,
      responseRate: 94,
      responseTime: 'within 8 hours',
      viewsThisWeek: 1600,
      viewsThisMonth: 5800,
      shareCount: 420,
      savedCount: 770
    },
    featuredPieces: ['42', '43'],
    createdAt: new Date('2024-02-07'),
    lastActiveAt: new Date('2024-03-13')
  },
  'mei_coderartist': {
    id: '29',
    userId: '29',
    username: 'mei_coderartist',
    name: 'Mei Chen',
    title: 'Creative Coder & Interactive Artist',
    tagline: 'Coding art, teaching tech',
    bio: 'Interactive artist blending generative art with coding education. My installations have been displayed at tech-art festivals, and I run workshops teaching creative coding with JavaScript and Processing.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=29',
    coverImage: 'https://picsum.photos/1400/700?random=29',
    visibility: 'public',
    status: 'active',
    location: 'Shanghai, China',
    yearsOfExperience: 9,
    specializations: ['Generative Art', 'Creative Coding', 'Workshops'],
    tags: ['Art', 'Coding', 'Generative', 'Education'],
    socialLinks: {
      website: 'https://meichen.art',
      github: 'https://github.com/meichen',
      instagram: 'https://instagram.com/mei.coderartist'
    },
    contactEmail: 'mei@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'masonry',
      piecesPerPage: 20,
      notifyOnReview: true,
      notifyOnView: false,
      weeklyAnalyticsEmail: false
    },
    stats: {
      totalViews: 61000,
      uniqueVisitors: 9800,
      totalPieces: 30,
      totalReviews: 70,
      averageRating: 4.9,
      responseRate: 97,
      responseTime: 'within 6 hours',
      viewsThisWeek: 2100,
      viewsThisMonth: 7300,
      shareCount: 530,
      savedCount: 840
    },
    featuredPieces: ['44', '45'],
    createdAt: new Date('2024-02-08'),
    lastActiveAt: new Date('2024-03-13')
  },
  'david_storygames': {
    id: '30',
    userId: '30',
    username: 'david_storygames',
    name: 'David Williams',
    title: 'Game Designer & Storytelling Coach',
    tagline: 'Narrative-driven games, interactive teaching',
    bio: 'Indie game designer focusing on narrative-driven experiences. I also coach aspiring designers on storytelling techniques for games. My hybrid career mixes hands-on game development with mentorship and teaching.',
    kind: 'hybrid',
    profileImage: 'https://picsum.photos/900/900?random=30',
    coverImage: 'https://picsum.photos/1400/700?random=30',
    visibility: 'public',
    status: 'active',
    location: 'Austin, TX',
    yearsOfExperience: 11,
    specializations: ['Game Design', 'Storytelling', 'Mentorship'],
    tags: ['Games', 'Storytelling', 'Design', 'Education'],
    socialLinks: {
      website: 'https://davidstorygames.com',
      linkedin: 'https://linkedin.com/in/davidwilliams',
      twitter: 'https://twitter.com/david_storygames'
    },
    contactEmail: 'david@example.com',
    showContactInfo: true,
    settings: {
      allowReviews: true,
      allowComments: true,
      requireReviewApproval: false,
      allowAnonymousReviews: true,
      showStats: true,
      showPrices: true,
      defaultGalleryView: 'grid',
      piecesPerPage: 16,
      notifyOnReview: true,
      notifyOnView: true,
      weeklyAnalyticsEmail: true
    },
    stats: {
      totalViews: 72000,
      uniqueVisitors: 11200,
      totalPieces: 33,
      totalReviews: 85,
      averageRating: 4.8,
      responseRate: 96,
      responseTime: 'within 10 hours',
      viewsThisWeek: 2500,
      viewsThisMonth: 8700,
      shareCount: 660,
      savedCount: 940
    },
    featuredPieces: ['46', '47', '48'],
    createdAt: new Date('2024-02-10'),
    lastActiveAt: new Date('2024-03-13')
  },

};

// Enhanced gallery pieces with Thrive integration
export const MOCK_GALLERY: Record<string, GalleryPiece[]> = {
  'alice_creates': [
    {
      _id: '1',
      title: 'Interactive Brand Experience for TechFlow',
      artist: 'Alice Johnson',
      description: 'Complete digital brand transformation...',
      thumbnailUrl: 'https://picsum.photos/200/300?random=10',
      imageUrl: 'https://picsum.photos/800/1200?random=10',
      alt: 'Interactive brand experience design',
      size: 'large',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '1',
      uploadedBy: '1',
      portfolioId: '1',
      views: 12500,
      likes: 890,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      category: 'Brand Design',
      medium: 'Digital Design',
      year: 2024,
      dimensions: {
        width: 1200,
        height: 800,
        unit: 'px'
      },
      tags: ['Branding', 'Interactive', 'UI/UX'],
    },
    {
      _id: '2',
      title: 'Sustainable Fashion AR Experience',
      artist: 'Alice Johnson',
      description: 'Immersive AR installation for sustainable fashion week, allowing users to visualize the environmental impact of clothing choices.',
      thumbnailUrl: 'https://picsum.photos/200/300?random=11',
      imageUrl: 'https://picsum.photos/1000/800?random=11',
      alt: 'Sustainable Fashion AR Experience',
      size: 'large',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '1',
      uploadedBy: '1',
      views: 9800,
      likes: 670,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      category: 'mixed-media',
      tags: ['AR', 'Sustainability', 'Fashion', 'Installation'],
      medium: 'Digital AR Installation',
      year: 2024,
      dimensions: {
        width: 1000,
        height: 800,
        unit: 'px'
      },
      portfolioId: '1'
    }
  ],
  'bob_codes': [
    {
      _id: '4',
      portfolioId: '2',
      title: 'Microservices Architecture for E-commerce Platform',
      artist: 'Robert Chen',
      description: 'Designed and implemented scalable microservices architecture serving 10M+ daily active users with 99.99% uptime.',
      thumbnailUrl: 'https://picsum.photos/300/200?random=20',
      imageUrl: 'https://picsum.photos/1200/800?random=20',
      alt: 'Microservices architecture diagram',
      size: 'medium',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '2',
      uploadedBy: '2',
      views: 6500,
      likes: 340,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      category: 'Design',
      tags: ['Microservices', 'Scalability', 'Cloud', 'Performance'],
      medium: 'System Architecture',
      year: 2024,
      dimensions: {
        width: 1200,
        height: 800,
        unit: 'px'
      }
    }
  ],
  'charlie_learns': [
    {
      _id: '6',
      portfolioId: '3',
      title: 'Learning Progress: React Mastery Journey',
      artist: 'Charlie Davis',
      description: 'Complete documentation of my React learning journey, from basics to advanced patterns. Includes projects, notes, and insights.',
      thumbnailUrl: 'https://picsum.photos/300/200?random=30',
      imageUrl: 'https://picsum.photos/800/600?random=30',
      alt: 'React learning journey documentation',
      size: 'medium',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '3',
      uploadedBy: '3',
      views: 2800,
      likes: 180,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      category: 'Digital',
      tags: ['React', 'Learning', 'Documentation', 'Progress'],
      medium: 'Educational Content',
      year: 2024,
      dimensions: {
        width: 800,
        height: 600,
        unit: 'px'
      }
    }
  ],
  'dana_writes': [
    {
      _id: '8',
      portfolioId: '4',
      title: 'The Weight of Words - Novel Excerpt',
      artist: 'Dana Mitchell',
      description: 'Opening chapter from my latest novel exploring themes of identity and belonging in the digital age. Winner of the 2024 Literary Fiction Award.',
      thumbnailUrl: 'https://picsum.photos/300/400?random=40',
      imageUrl: 'https://picsum.photos/800/1000?random=40',
      alt: 'Novel excerpt manuscript page',
      size: 'medium',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '4',
      uploadedBy: '4',
      views: 4200,
      likes: 340,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      category: 'Writing',
      tags: ['Fiction', 'Literary', 'Novel', 'Award-Winning'],
      medium: 'Prose',
      year: 2024,
      originalFileName: 'weight-of-words-ch1.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf'
    },
    {
      _id: '9',
      portfolioId: '4',
      title: 'Character Development Workshop Series',
      artist: 'Dana Mitchell',
      description: 'Complete 6-part workshop series teaching writers how to create multi-dimensional characters. Includes exercises, examples, and participant feedback.',
      thumbnailUrl: 'https://picsum.photos/400/300?random=41',
      imageUrl: 'https://picsum.photos/1200/800?random=41',
      alt: 'Character development workshop materials',
      size: 'large',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '4',
      uploadedBy: '4',
      views: 2900,
      likes: 180,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      category: 'Education',
      tags: ['Workshop', 'Teaching', 'Character', 'Writing Craft'],
      medium: 'Educational Content',
      year: 2024,
      originalFileName: 'character-workshop-series.pdf',
      fileSize: 892416,
      mimeType: 'application/pdf'
    },
    {
      _id: '10',
      portfolioId: '4',
      title: 'Short Story Collection: Urban Echoes',
      artist: 'Dana Mitchell',
      description: 'Collection of interconnected short stories set in New York City, exploring how strangers\' lives intersect in unexpected ways.',
      thumbnailUrl: 'https://picsum.photos/300/400?random=42',
      imageUrl: 'https://picsum.photos/800/1000?random=42',
      alt: 'Short story collection cover design',
      size: 'medium',
      displayOrder: 3,
      status: 'published',
      visibility: 'public',
      ownerId: '4',
      uploadedBy: '4',
      views: 3600,
      likes: 290,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
      category: 'Writing',
      tags: ['Short Stories', 'Urban Fiction', 'NYC', 'Collection'],
      medium: 'Prose',
      year: 2024,
      originalFileName: 'urban-echoes-collection.pdf',
      fileSize: 1048576,
      mimeType: 'application/pdf'
    }
  ],

  'ella_designs': [
    {
      _id: '11',
      portfolioId: '5',
      title: 'Accessible Banking App Redesign',
      artist: 'Ella Rodriguez',
      description: 'Complete UX overhaul of a major banking app, focusing on accessibility compliance and inclusive design. Increased user satisfaction by 40% and achieved WCAG 2.1 AAA compliance.',
      thumbnailUrl: 'https://picsum.photos/400/300?random=50',
      imageUrl: 'https://picsum.photos/1200/900?random=50',
      alt: 'Banking app accessibility redesign screens',
      size: 'large',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '5',
      uploadedBy: '5',
      views: 8900,
      likes: 520,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      category: 'Design',
      tags: ['Accessibility', 'Mobile Design', 'Banking', 'WCAG', 'Inclusive Design'],
      medium: 'Digital Design',
      year: 2024,
      dimensions: {
        width: 1200,
        height: 900,
        unit: 'px'
      },
      originalFileName: 'banking-app-redesign.figma',
      fileSize: 3145728,
      mimeType: 'application/figma'
    },
    {
      _id: '12',
      portfolioId: '5',
      title: 'Design System for Accessibility',
      artist: 'Ella Rodriguez',
      description: 'Open-source design system built with accessibility-first principles. Includes components, guidelines, and testing tools used by 50+ organizations.',
      thumbnailUrl: 'https://picsum.photos/300/400?random=51',
      imageUrl: 'https://picsum.photos/1000/1200?random=51',
      alt: 'Accessibility-focused design system documentation',
      size: 'large',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '5',
      uploadedBy: '5',
      views: 12400,
      likes: 890,
      createdAt: new Date('2024-01-30'),
      updatedAt: new Date('2024-01-30'),
      category: 'Design',
      tags: ['Design System', 'Open Source', 'Accessibility', 'Components'],
      medium: 'Digital Design System',
      year: 2024,
      originalFileName: 'a11y-design-system.zip',
      fileSize: 5242880,
      mimeType: 'application/zip'
    }
  ],

  'felix_community': [
    {
      _id: '13',
      portfolioId: '6',
      title: 'Portland Tech Meetup Growth Strategy',
      artist: 'Felix Thompson',
      description: 'Complete case study of growing Portland\'s largest tech meetup from 50 to 2,000+ members. Includes community engagement strategies, event planning, and partnership development.',
      thumbnailUrl: 'https://picsum.photos/400/300?random=60',
      imageUrl: 'https://picsum.photos/1200/800?random=60',
      alt: 'Community growth strategy presentation',
      size: 'large',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '6',
      uploadedBy: '6',
      views: 3400,
      likes: 210,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
      category: 'Education',
      tags: ['Community Building', 'Event Planning', 'Growth Strategy', 'Networking'],
      medium: 'Case Study',
      year: 2024,
      originalFileName: 'meetup-growth-strategy.pptx',
      fileSize: 2097152,
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    },
    {
      _id: '14',
      portfolioId: '6',
      title: 'Digital Inclusion Workshop Series',
      artist: 'Felix Thompson',
      description: 'Nonprofit workshop series teaching digital literacy to underserved communities. Reached 500+ participants across 12 neighborhoods.',
      thumbnailUrl: 'https://picsum.photos/300/400?random=61',
      imageUrl: 'https://picsum.photos/800/1000?random=61',
      alt: 'Digital inclusion workshop participants',
      size: 'medium',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '6',
      uploadedBy: '6',
      views: 2100,
      likes: 160,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      category: 'Education',
      tags: ['Digital Literacy', 'Nonprofit', 'Education', 'Community Outreach'],
      medium: 'Educational Program',
      year: 2024,
      originalFileName: 'digital-inclusion-workshop.pdf',
      fileSize: 1572864,
      mimeType: 'application/pdf'
    }
  ],

  'sandy_sings': [
    {
      _id: '15',
      portfolioId: '7',
      title: 'Jazz Fusion Live Performance - Blue Note',
      artist: 'Sandra Lopez',
      description: 'Live recording from Blue Note LA featuring original compositions blending jazz, soul, and contemporary elements. Collaboration with Grammy-nominated musicians.',
      thumbnailUrl: 'https://picsum.photos/400/300?random=70',
      imageUrl: 'https://picsum.photos/1200/800?random=70',
      alt: 'Sandy performing at Blue Note LA',
      size: 'large',
      displayOrder: 1,
      status: 'published',
      visibility: 'public',
      ownerId: '7',
      uploadedBy: '7',
      views: 9800,
      likes: 740,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
      category: 'mixed-media',
      tags: ['Jazz', 'Live Performance', 'Original Music', 'Blue Note'],
      medium: 'Audio Recording',
      year: 2024,
      originalFileName: 'blue-note-live-recording.mp3',
      fileSize: 45678912,
      mimeType: 'audio/mpeg'
    },
    {
      _id: '16',
      portfolioId: '7',
      title: 'Vocal Workshop: Finding Your Authentic Voice',
      artist: 'Sandra Lopez',
      description: 'Comprehensive vocal workshop helping singers develop their unique sound while building technical skills. 8-week program with personalized feedback.',
      thumbnailUrl: 'https://picsum.photos/300/400?random=71',
      imageUrl: 'https://picsum.photos/800/1000?random=71',
      alt: 'Vocal workshop session with students',
      size: 'medium',
      displayOrder: 2,
      status: 'published',
      visibility: 'public',
      ownerId: '7',
      uploadedBy: '7',
      views: 4200,
      likes: 310,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      category: 'Education',
      tags: ['Vocal Training', 'Workshop', 'Music Education', 'Technique'],
      medium: 'Educational Content',
      year: 2024,
      originalFileName: 'vocal-workshop-materials.zip',
      fileSize: 12582912,
      mimeType: 'application/zip'
    },
    {
      _id: '17',
      portfolioId: '7',
      title: 'Original Song: "City Lights Serenade"',
      artist: 'Sandra Lopez',
      description: 'Original composition and performance capturing the energy of Los Angeles at night. Written during the pandemic as a love letter to the city.',
      thumbnailUrl: 'https://picsum.photos/400/400?random=72',
      imageUrl: 'https://picsum.photos/800/800?random=72',
      alt: 'City Lights Serenade album artwork',
      size: 'medium',
      displayOrder: 3,
      status: 'published',
      visibility: 'public',
      ownerId: '7',
      uploadedBy: '7',
      views: 6700,
      likes: 450,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      category: 'mixed-media',
      tags: ['Original Song', 'Songwriting', 'LA', 'Contemporary'],
      medium: 'Audio Recording',
      year: 2024,
      originalFileName: 'city-lights-serenade.mp3',
      fileSize: 8388608,
      mimeType: 'audio/mpeg'
    }
  ]

};

// Mock reviews with better structure
export const MOCK_REVIEWS: Record<string, PortfolioReview[]> = {
  'alice_creates': [
    {
      id: '1',
      portfolioId: '1',
      portfolioUserId: '1',
      reviewerId: '101',
      reviewerName: 'Sarah Chen',
      rating: 5,
      title: 'Exceptional Creative Vision',
      comment: "Alice's work on our brand transformation was absolutely phenomenal. She didn't just design - she crafted an entire experience that perfectly captured our company's soul. The attention to detail and innovative approach exceeded all expectations.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 12,
      reportCount: 0,
      createdAt: new Date('2024-03-01')
    },
    {
      id: '2',
      portfolioId: '1',
      portfolioUserId: '1',
      reviewerId: '102',
      reviewerName: 'Marcus Johnson',
      rating: 5,
      title: 'World-Class Designer',
      comment: "Working with Alice was a game-changer for our startup. Her creative direction helped us stand out in a crowded market. The AR experience she created got us featured in TechCrunch!",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 8,
      reportCount: 0,
      createdAt: new Date('2024-02-28'),
      artistResponse: {
        comment: "Thank you Marcus! It was amazing collaborating with your team. Your vision made this project truly special.",
        respondedAt: new Date('2024-03-01')
      }
    }
  ],
  'dana_writes': [
    {
      id: '3',
      portfolioId: '4',
      portfolioUserId: '4',
      reviewerId: '201',
      reviewerName: 'Michael Torres',
      rating: 5,
      title: 'Masterful Storytelling',
      comment: "Dana's workshop transformed my approach to character development. Her insights into creating authentic, multi-dimensional characters are invaluable. The feedback was detailed and actionable.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 15,
      reportCount: 0,
      createdAt: new Date('2024-02-28'),
      artistResponse: {
        comment: "Thank you Michael! Watching your characters come to life throughout the workshop was incredible. Keep writing!",
        respondedAt: new Date('2024-03-01')
      }
    },
    {
      id: '4',
      portfolioId: '4',
      portfolioUserId: '4',
      reviewerId: '202',
      reviewerName: 'Jennifer Walsh',
      rating: 5,
      title: 'Exceptional Mentor and Writer',
      comment: "Dana's novel excerpt was absolutely captivating. Her writing style is both accessible and profound. As a mentor, she provides honest, constructive feedback that pushes you to grow.",
      ratings: { creativity: 5, technique: 5, presentation: 4, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 9,
      reportCount: 0,
      createdAt: new Date('2024-03-02')
    },
    {
      id: '5',
      portfolioId: '4',
      portfolioUserId: '4',
      reviewerId: '203',
      reviewerName: 'Sarah Kim',
      rating: 4,
      title: 'Inspiring Writing Coach',
      comment: "Dana's short story collection 'Urban Echoes' really resonated with me as a NYC resident. Her workshop techniques helped me break through my creative block. Highly recommend!",
      ratings: { creativity: 5, technique: 4, presentation: 4, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 7,
      reportCount: 0,
      createdAt: new Date('2024-03-05')
    }
  ],

  'ella_designs': [
    {
      id: '6',
      portfolioId: '5',
      portfolioUserId: '5',
      reviewerId: '301',
      reviewerName: 'David Chen',
      rating: 5,
      title: 'Accessibility Champion',
      comment: "Ella's design system completely changed how our team approaches accessibility. The documentation is thorough, and the components are beautiful and functional. This is design leadership at its finest.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 22,
      reportCount: 0,
      createdAt: new Date('2024-03-05'),
      artistResponse: {
        comment: "So glad the system is helping your team! Accessibility should be seamless, and I'm thrilled it's working well for you.",
        respondedAt: new Date('2024-03-06')
      }
    },
    {
      id: '7',
      portfolioId: '5',
      portfolioUserId: '5',
      reviewerId: '302',
      reviewerName: 'Maria Rodriguez',
      rating: 5,
      title: 'Inclusive Design Expert',
      comment: "The banking app redesign Ella led was phenomenal. Our accessibility compliance went from barely passing to exceeding standards, and user satisfaction skyrocketed. She's a rare talent.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 18,
      reportCount: 0,
      createdAt: new Date('2024-02-25')
    },
    {
      id: '8',
      portfolioId: '5',
      portfolioUserId: '5',
      reviewerId: '303',
      reviewerName: 'Anonymous User',
      rating: 5,
      title: 'Life-Changing Work',
      comment: "As someone who uses screen readers, Ella's accessible design work has made banking actually possible for me. The attention to detail and genuine care for users with disabilities shines through.",
      ratings: { creativity: 4, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: true,
      helpfulCount: 31,
      reportCount: 0,
      createdAt: new Date('2024-02-28'),
      artistResponse: {
        comment: "This feedback means everything to me. Creating truly inclusive experiences is why I do this work. Thank you for sharing your experience.",
        respondedAt: new Date('2024-03-01')
      }
    }
  ],

  'felix_community': [
    {
      id: '9',
      portfolioId: '6',
      portfolioUserId: '6',
      reviewerId: '401',
      reviewerName: 'Sarah Kim',
      rating: 5,
      title: 'Community Building Genius',
      comment: "Felix transformed our local tech scene. His approach to community building is both strategic and heartfelt. The meetup went from small gatherings to the premier tech event in Portland.",
      ratings: { creativity: 4, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 14,
      reportCount: 0,
      createdAt: new Date('2024-03-01')
    },
    {
      id: '10',
      portfolioId: '6',
      portfolioUserId: '6',
      reviewerId: '402',
      reviewerName: 'Anonymous Community Member',
      rating: 5,
      title: 'Changed My Life',
      comment: "The digital inclusion workshop literally changed my life. Felix and his team taught me skills I never thought I'd learn. Now I have a job in tech and am helping teach others.",
      ratings: { creativity: 5, technique: 4, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: true,
      helpfulCount: 28,
      reportCount: 0,
      createdAt: new Date('2024-02-20'),
      artistResponse: {
        comment: "This is exactly why we do this work. Congratulations on your success - you earned it through your hard work and determination!",
        respondedAt: new Date('2024-02-21')
      }
    },
    {
      id: '11',
      portfolioId: '6',
      portfolioUserId: '6',
      reviewerId: '403',
      reviewerName: 'Marcus Thompson',
      rating: 4,
      title: 'Excellent Event Organization',
      comment: "Felix's meetup strategy case study was incredibly detailed and actionable. We applied his methods to our own community and saw a 300% increase in engagement. Great work!",
      ratings: { creativity: 4, technique: 5, presentation: 4, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 11,
      reportCount: 0,
      createdAt: new Date('2024-02-25')
    }
  ],

  'sandy_sings': [
    {
      id: '12',
      portfolioId: '7',
      portfolioUserId: '7',
      reviewerId: '501',
      reviewerName: 'Marcus Washington',
      rating: 5,
      title: 'Incredible Vocal Talent',
      comment: "Sandy's performance at Blue Note was absolutely mesmerizing. Her voice has this unique quality that draws you in completely. The original compositions were sophisticated yet accessible.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 19,
      reportCount: 0,
      createdAt: new Date('2024-03-07')
    },
    {
      id: '13',
      portfolioId: '7',
      portfolioUserId: '7',
      reviewerId: '502',
      reviewerName: 'Lisa Chen',
      rating: 5,
      title: 'Transformative Teacher',
      comment: "Sandy's vocal workshop was life-changing. She helped me find confidence in my voice and develop techniques I'd struggled with for years. Her teaching style is encouraging and effective.",
      ratings: { creativity: 5, technique: 5, presentation: 4, professionalism: 5 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 12,
      reportCount: 0,
      createdAt: new Date('2024-02-15'),
      artistResponse: {
        comment: "Lisa, watching your voice develop throughout the workshop was such a joy! Keep singing - you have something special.",
        respondedAt: new Date('2024-02-16')
      }
    },
    {
      id: '14',
      portfolioId: '7',
      portfolioUserId: '7',
      reviewerId: '503',
      reviewerName: 'James Rodriguez',
      rating: 5,
      title: 'Amazing Original Music',
      comment: "'City Lights Serenade' has been on repeat for weeks! Sandy's songwriting captures something really special about LA. Can't wait to hear more original work.",
      ratings: { creativity: 5, technique: 5, presentation: 5, professionalism: 4 },
      status: 'approved',
      isAnonymous: false,
      helpfulCount: 8,
      reportCount: 0,
      createdAt: new Date('2024-01-25'),
      artistResponse: {
        comment: "Thank you James! That song came from such a personal place, and I'm so happy it resonates with you. More music coming soon!",
        respondedAt: new Date('2024-01-26')
      }
    }
  ]
};

export const THRIVE_ASSESSMENTS: Record<string, any[]> = {
  'alice_creates': [
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design Mastery',
      score: 98,
      percentile: 99,
      completedAt: '2024-02-15',
      certification: 'Expert Level',
      skills: ['User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      timeSpent: 45
    },
    {
      id: 'creative-thinking',
      title: 'Creative Problem Solving',
      score: 96,
      percentile: 97,
      completedAt: '2024-01-20',
      certification: 'Expert Level',
      skills: ['Innovation', 'Ideation', 'Creative Strategy'],
      timeSpent: 35
    }
  ],
  'bob_codes': [
    {
      id: 'system-architecture',
      title: 'System Architecture & Design',
      score: 94,
      percentile: 96,
      completedAt: '2024-03-01',
      certification: 'Expert Level',
      skills: ['Microservices', 'Scalability', 'Performance Optimization'],
      timeSpent: 60
    }
  ],
  'charlie_learns': [
    {
      id: 'frontend-development',
      title: 'Frontend Development',
      score: 89,
      percentile: 85,
      completedAt: '2024-02-28',
      certification: 'Advanced Level',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      timeSpent: 50
    }
  ],

  'dana_writes': [
    {
      id: 'creative-writing',
      title: 'Creative Writing Mastery',
      score: 97,
      percentile: 98,
      completedAt: '2024-01-15',
      certification: 'Expert Level',
      skills: ['Character Development', 'Plot Structure', 'Dialogue', 'Literary Technique'],
      timeSpent: 40,
      badgeUrl: 'https://thrive.example.com/badges/creative-writing-expert',
      description: 'Comprehensive assessment of creative writing skills including character development, plot structure, and literary techniques.'
    },
    {
      id: 'teaching-mentorship',
      title: 'Teaching & Mentorship',
      score: 95,
      percentile: 96,
      completedAt: '2024-02-01',
      certification: 'Expert Level',
      skills: ['Workshop Design', 'Feedback Delivery', 'Curriculum Development'],
      timeSpent: 30,
      badgeUrl: 'https://thrive.example.com/badges/teaching-expert',
      description: 'Assessment covering teaching methodologies, mentorship techniques, and educational content creation.'
    },
    {
      id: 'storytelling',
      title: 'Advanced Storytelling',
      score: 96,
      percentile: 97,
      completedAt: '2024-01-20',
      certification: 'Expert Level',
      skills: ['Narrative Structure', 'Voice', 'Pacing', 'Theme Development'],
      timeSpent: 35,
      badgeUrl: 'https://thrive.example.com/badges/storytelling-expert',
      description: 'Deep dive into storytelling fundamentals and advanced narrative techniques.'
    }
  ],

  'ella_designs': [
    {
      id: 'accessibility-design',
      title: 'Accessibility & Inclusive Design',
      score: 99,
      percentile: 99,
      completedAt: '2024-02-20',
      certification: 'Expert Level',
      skills: ['WCAG Compliance', 'Inclusive Design', 'Assistive Technology', 'User Testing'],
      timeSpent: 55,
      badgeUrl: 'https://thrive.example.com/badges/accessibility-expert',
      description: 'Comprehensive evaluation of accessibility knowledge, inclusive design principles, and compliance standards.'
    },
    {
      id: 'design-systems',
      title: 'Design Systems Architecture',
      score: 96,
      percentile: 97,
      completedAt: '2024-01-25',
      certification: 'Expert Level',
      skills: ['Component Libraries', 'Design Tokens', 'Documentation', 'Scalability'],
      timeSpent: 45,
      badgeUrl: 'https://thrive.example.com/badges/design-systems-expert',
      description: 'Advanced assessment covering design system creation, maintenance, and organizational implementation.'
    },
    {
      id: 'user-research',
      title: 'User Research & Testing',
      score: 94,
      percentile: 95,
      completedAt: '2024-02-10',
      certification: 'Expert Level',
      skills: ['Usability Testing', 'User Interviews', 'Research Methods', 'Data Analysis'],
      timeSpent: 50,
      badgeUrl: 'https://thrive.example.com/badges/user-research-expert',
      description: 'Evaluation of user research methodologies, testing protocols, and data interpretation skills.'
    }
  ],

  'felix_community': [
    {
      id: 'community-building',
      title: 'Community Building & Engagement',
      score: 94,
      percentile: 95,
      completedAt: '2024-02-10',
      certification: 'Expert Level',
      skills: ['Event Planning', 'Community Engagement', 'Growth Strategy', 'Partnership Development'],
      timeSpent: 50,
      badgeUrl: 'https://thrive.example.com/badges/community-expert',
      description: 'Assessment of community building strategies, engagement techniques, and sustainable growth methods.'
    },
    {
      id: 'nonprofit-management',
      title: 'Nonprofit Leadership',
      score: 92,
      percentile: 93,
      completedAt: '2024-01-30',
      certification: 'Advanced Level',
      skills: ['Program Development', 'Volunteer Management', 'Grant Writing', 'Impact Measurement'],
      timeSpent: 40,
      badgeUrl: 'https://thrive.example.com/badges/nonprofit-advanced',
      description: 'Evaluation of nonprofit management skills including program development and organizational leadership.'
    },
    {
      id: 'digital-inclusion',
      title: 'Digital Inclusion & Literacy',
      score: 96,
      percentile: 97,
      completedAt: '2024-02-05',
      certification: 'Expert Level',
      skills: ['Digital Literacy Training', 'Inclusive Technology', 'Community Outreach', 'Curriculum Design'],
      timeSpent: 45,
      badgeUrl: 'https://thrive.example.com/badges/digital-inclusion-expert',
      description: 'Assessment covering digital inclusion strategies, literacy training, and accessible technology implementation.'
    }
  ],

  'sandy_sings': [
    {
      id: 'vocal-performance',
      title: 'Vocal Performance & Technique',
      score: 98,
      percentile: 99,
      completedAt: '2024-01-30',
      certification: 'Expert Level',
      skills: ['Jazz Vocals', 'Stage Presence', 'Improvisation', 'Vocal Health'],
      timeSpent: 60,
      badgeUrl: 'https://thrive.example.com/badges/vocal-performance-expert',
      description: 'Comprehensive assessment of vocal technique, performance skills, and professional music industry knowledge.'
    },
    {
      id: 'music-education',
      title: 'Music Education & Coaching',
      score: 93,
      percentile: 94,
      completedAt: '2024-02-15',
      certification: 'Expert Level',
      skills: ['Vocal Coaching', 'Curriculum Design', 'Student Assessment'],
      timeSpent: 35,
      badgeUrl: 'https://thrive.example.com/badges/music-education-expert',
      description: 'Evaluation of music teaching methodologies, vocal coaching techniques, and educational program development.'
    },
    {
      id: 'songwriting',
      title: 'Songwriting & Composition',
      score: 95,
      percentile: 96,
      completedAt: '2024-01-20',
      certification: 'Expert Level',
      skills: ['Lyrical Composition', 'Melody Creation', 'Song Structure', 'Genre Fusion'],
      timeSpent: 42,
      badgeUrl: 'https://thrive.example.com/badges/songwriting-expert',
      description: 'Assessment of original composition skills, lyrical creativity, and musical arrangement abilities.'
    },
    {
      id: 'performance-coaching',
      title: 'Performance & Stage Presence',
      score: 97,
      percentile: 98,
      completedAt: '2024-02-25',
      certification: 'Expert Level',
      skills: ['Stage Presence', 'Audience Engagement', 'Performance Psychology', 'Live Show Production'],
      timeSpent: 38,
      badgeUrl: 'https://thrive.example.com/badges/performance-expert',
      description: 'Evaluation of stage performance abilities, audience connection skills, and live show management.'
    }
  ]
};


// ==============================================
// EMPLOYER TOOLS DATA
// ==============================================

export const EMPLOYER_TOOLS = [
  {
    id: 'candidate-verification',
    title: 'Candidate Verification',
    description: 'Verify candidate assessment scores and certifications instantly',
    icon: 'Shield',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    status: 'active' as const,
    features: ['Real-time verification', 'Blockchain secured', 'API integration']
  },
  {
    id: 'bulk-assessment',
    title: 'Bulk Assessment Portal',
    description: 'Assess multiple candidates simultaneously with custom test suites',
    icon: 'Users',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    status: 'active' as const,
    features: ['Custom test creation', 'Batch processing', 'Detailed analytics']
  },
  {
    id: 'skills-analytics',
    title: 'Skills Analytics Dashboard',
    description: 'Advanced analytics on candidate skills and industry benchmarks',
    icon: 'BarChart3',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    status: 'active' as const,
    features: ['Industry benchmarking', 'Skill gap analysis', 'Custom reports']
  },
  {
    id: 'integration-api',
    title: 'ATS Integration API',
    description: 'Seamlessly integrate with your existing hiring workflow',
    icon: 'Settings',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    status: 'beta' as const,
    features: ['REST API', 'Webhook support', 'Custom integrations']
  },
  {
    id: 'team-management',
    title: 'Team Assessment Management',
    description: 'Manage and track your existing team\'s skill development',
    icon: 'Building2',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    status: 'beta' as const,
    features: ['Team dashboards', 'Progress tracking', 'Skill development plans']
  },
  {
    id: 'certification-portal',
    title: 'Certification Portal',
    description: 'Issue and manage professional certifications for your organization',
    icon: 'FileCheck',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    status: 'coming-soon' as const,
    features: ['Custom certificates', 'Digital badges', 'Verification system']
  }
];

export const EMPLOYER_PLATFORM_METRICS = {
  verifiedCandidates: 15420,
  partnerCompanies: 247,
  monthlyAssessments: 8930,
  averageVerificationTime: '2.3s'
};

// ==============================================
// Mock Portfolio Data
// ==============================================

export const createMockPortfolio = (kind: PortfolioKind = 'hybrid'): Portfolio => ({
  id: 'portfolio-dev-123',
  _id: 'portfolio-dev-123',
  userId: 'dev-user-123',
  username: 'devuser',
  name: 'Dev User',
  title: 'Full-Stack Developer & Designer',
  tagline: 'Building digital experiences that matter',
  bio: 'Passionate full-stack developer with a love for clean code and beautiful design. Currently exploring AI/ML applications and always learning something new.',
  kind,

  // Images
  profileImage: 'https://picsum.photos/200/200?random=profile',
  coverImage: 'https://picsum.photos/800/300?random=cover',

  // Visibility & Access
  visibility: 'public',
  status: 'active',
  customUrl: 'dev-portfolio',

  // Professional Info
  location: 'Seattle, WA',
  yearsOfExperience: 5,
  specializations: ['React', 'Node.js', 'TypeScript', 'UI/UX Design', 'PostgreSQL'],
  tags: ['Frontend', 'Backend', 'Design', 'Full-Stack', 'React', 'Next.js'],

  // Social & Contact
  socialLinks: {
    website: 'https://devportfolio.com',
    github: 'https://github.com/devuser',
    linkedin: 'https://linkedin.com/in/devuser',
    twitter: 'https://twitter.com/devuser'
  },
  contactEmail: 'dev@example.com',
  showContactInfo: true,

  // Settings - Fix: Properly type as PortfolioSettings
  settings: {
    allowReviews: true,
    allowComments: true,
    requireReviewApproval: false,
    allowAnonymousReviews: true,
    showStats: true,
    showPrices: false,
    defaultGalleryView: 'grid',
    piecesPerPage: 20,
    notifyOnReview: true,
    notifyOnView: false,
    weeklyAnalyticsEmail: true,
    // Educational settings for hybrid/educational portfolios
    showProgress: true,
    publicProgress: false,
    showCertifications: true,
    trackLearningTime: true,
    notifyOnConceptCompletion: true,
    weeklyProgressEmail: false
  } as PortfolioSettings,

  // Stats - Fix: Properly type as PortfolioStats
  stats: {
    totalViews: 2847,
    uniqueVisitors: 1253,
    totalPieces: 12,
    totalReviews: 8,
    averageRating: 4.7,
    responseRate: 95,
    responseTime: 'within 2 hours',
    viewsThisWeek: 156,
    viewsThisMonth: 612,
    shareCount: 23,
    savedCount: 45,
    // Educational stats for hybrid/educational portfolios
    totalConcepts: 45,
    completedConcepts: 32,
    inProgressConcepts: 8,
    totalLearningHours: 127,
    averageScore: 87,
    streakDays: 12,
    certificationsEarned: 3
  } as PortfolioStats,

  // Educational Content - Fix: Properly type as ConceptProgress[]
  conceptProgress: [
    {
      conceptId: 'react-hooks',
      status: 'completed',
      startedAt: '2024-01-10T10:00:00Z',
      completedAt: '2024-01-12T14:30:00Z',
      score: 92,
      attempts: 2,
      notes: 'Mastered useState and useEffect'
    },
    {
      conceptId: 'typescript-generics',
      status: 'in-progress',
      startedAt: '2024-01-15T09:00:00Z',
      score: 78,
      attempts: 1,
      notes: 'Need more practice with complex generic constraints'
    },
    {
      conceptId: 'database-optimization',
      status: 'not-started'
    }
  ] as ConceptProgress[],

  learningGoals: [
    'Master advanced TypeScript patterns',
    'Build scalable microservices architecture',
    'Complete AWS certification',
    'Contribute to open source projects'
  ],

  currentBooks: ['typescript-handbook', 'system-design-primer'],
  completedBooks: ['react-patterns', 'clean-code', 'you-dont-know-js'],

  // Metadata
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-20T15:30:00Z'),
  lastActiveAt: new Date('2024-01-22T12:00:00Z'),
  featuredPieces: ['piece-1', 'piece-3', 'piece-5']
});

// ==============================================
// Mock Gallery Pieces - Fixed categories and dimensions
// ==============================================

// Fixed createMockGalleryPieces function - Corrected property names
// Fixed createMockGalleryPieces function - Matches your GalleryPiece interface exactly
export const createMockGalleryPieces = (): GalleryPiece[] => [
  {
    _id: 'piece-1',
    title: 'E-commerce Dashboard',
    artist: 'Dev User',
    description: 'Modern React dashboard with real-time analytics and intuitive UX design',

    // Images
    thumbnailUrl: 'https://picsum.photos/400/300?random=1',
    imageUrl: 'https://picsum.photos/800/600?random=1',

    // Metadata & Accessibility
    alt: 'E-commerce dashboard interface screenshot',
    medium: 'Digital',
    year: 2024,
    size: 'large' as ArtworkSize,
    displayOrder: 1,

    // Dimensions
    dimensions: {
      width: 1920,
      height: 1080,
      unit: 'px'
    },

    // Sales/Status
    forSale: false,
    status: 'published' as ArtworkStatus,
    price: 0,
    currency: 'USD',

    // Visibility & Permissions
    visibility: 'public' as GalleryVisibility,
    ownerId: 'dev-user-123',

    // Timestamps
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
    publishedAt: new Date('2024-01-16T10:00:00Z'),

    // Tags & Categories
    tags: ['React', 'TypeScript', 'Dashboard', 'Analytics'],
    category: 'Digital' as ArtworkCategory,

    // Upload metadata
    uploadedBy: 'dev-user-123',
    originalFileName: 'ecommerce-dashboard.png',
    fileSize: 2.1,
    mimeType: 'image/png',

    // Portfolio/Social Features
    portfolioId: 'portfolio-dev-123',
    views: 245,
    likes: 18
  },
  {
    _id: 'piece-2',
    title: 'Mobile Banking App',
    artist: 'Dev User',
    description: 'Clean and secure mobile banking interface with biometric authentication',

    // Images
    thumbnailUrl: 'https://picsum.photos/400/300?random=2',
    imageUrl: 'https://picsum.photos/800/600?random=2',

    // Metadata & Accessibility
    alt: 'Mobile banking app UI design mockup',
    medium: 'Digital',
    year: 2024,
    size: 'medium' as ArtworkSize,
    displayOrder: 2,

    // Dimensions
    dimensions: {
      width: 375,
      height: 812,
      unit: 'px'
    },

    // Sales/Status
    forSale: false,
    status: 'published' as ArtworkStatus,
    price: 0,

    // Visibility & Permissions
    visibility: 'public' as GalleryVisibility,
    ownerId: 'dev-user-123',

    // Timestamps
    createdAt: new Date('2024-01-18T14:00:00Z'),
    updatedAt: new Date('2024-01-18T14:00:00Z'),
    publishedAt: new Date('2024-01-18T14:00:00Z'),

    // Tags & Categories
    tags: ['UI/UX', 'Mobile', 'Fintech', 'Design System'],
    category: 'Design' as ArtworkCategory,

    // Upload metadata
    uploadedBy: 'dev-user-123',
    originalFileName: 'banking-app-ui.png',
    fileSize: 1.8,
    mimeType: 'image/png',

    // Portfolio/Social Features
    portfolioId: 'portfolio-dev-123',
    views: 189,
    likes: 12
  },
  {
    _id: 'piece-3',
    title: 'Task Management API',
    artist: 'Dev User',
    description: 'RESTful API built with Node.js and PostgreSQL featuring real-time updates',

    // Images (using placeholder for code project)
    thumbnailUrl: 'https://picsum.photos/400/300?random=3',
    imageUrl: 'https://picsum.photos/800/600?random=3',

    // Metadata & Accessibility
    alt: 'Task Management API architecture diagram',
    medium: 'Code',
    year: 2024,
    size: 'medium' as ArtworkSize,
    displayOrder: 3,

    // Sales/Status
    forSale: false,
    status: 'published' as ArtworkStatus,

    // Visibility & Permissions
    visibility: 'public' as GalleryVisibility,
    ownerId: 'dev-user-123',

    // Timestamps
    createdAt: new Date('2024-01-20T09:00:00Z'),
    updatedAt: new Date('2024-01-20T09:00:00Z'),
    publishedAt: new Date('2024-01-20T09:00:00Z'),

    // Tags & Categories
    tags: ['Node.js', 'PostgreSQL', 'REST API', 'Real-time'],
    category: 'Digital' as ArtworkCategory,

    // Upload metadata
    uploadedBy: 'dev-user-123',
    originalFileName: 'api-architecture.png',
    fileSize: 1.2,
    mimeType: 'image/png',

    // Portfolio/Social Features
    portfolioId: 'portfolio-dev-123',
    views: 156,
    likes: 23
  },
  {
    _id: 'piece-4',
    title: 'Brand Identity Design',
    artist: 'Dev User',
    description: 'Complete brand identity package for a sustainable fashion startup',

    // Images
    thumbnailUrl: 'https://picsum.photos/400/300?random=4',
    imageUrl: 'https://picsum.photos/800/600?random=4',

    // Metadata & Accessibility
    alt: 'Brand identity design showcase with logo and color palette',
    medium: 'Digital',
    year: 2024,
    size: 'large' as ArtworkSize,
    displayOrder: 4,

    // Dimensions
    dimensions: {
      width: 2000,
      height: 1500,
      unit: 'px'
    },

    // Sales/Status
    forSale: false,
    status: 'published' as ArtworkStatus,

    // Visibility & Permissions
    visibility: 'public' as GalleryVisibility,
    ownerId: 'dev-user-123',

    // Timestamps
    createdAt: new Date('2024-01-19T11:00:00Z'),
    updatedAt: new Date('2024-01-19T11:00:00Z'),
    publishedAt: new Date('2024-01-19T11:00:00Z'),

    // Tags & Categories
    tags: ['Branding', 'Logo Design', 'Identity', 'Sustainability'],
    category: 'Design' as ArtworkCategory,

    // Upload metadata
    uploadedBy: 'dev-user-123',
    originalFileName: 'brand-identity.jpg',
    fileSize: 3.2,
    mimeType: 'image/jpeg',

    // Portfolio/Social Features
    portfolioId: 'portfolio-dev-123',
    views: 312,
    likes: 27
  },
  {
    _id: 'piece-5',
    title: 'Learning Management System',
    artist: 'Dev User',
    description: 'Full-stack LMS with video streaming, progress tracking, and assessments',

    // Images
    thumbnailUrl: 'https://picsum.photos/400/300?random=5',
    imageUrl: 'https://picsum.photos/800/600?random=5',

    // Metadata & Accessibility
    alt: 'Learning Management System dashboard interface',
    medium: 'Digital',
    year: 2024,
    size: 'large' as ArtworkSize,
    displayOrder: 5,

    // Dimensions
    dimensions: {
      width: 1440,
      height: 900,
      unit: 'px'
    },

    // Sales/Status
    forSale: false,
    status: 'published' as ArtworkStatus,

    // Visibility & Permissions
    visibility: 'public' as GalleryVisibility,
    ownerId: 'dev-user-123',

    // Timestamps
    createdAt: new Date('2024-01-21T16:00:00Z'),
    updatedAt: new Date('2024-01-21T16:00:00Z'),
    publishedAt: new Date('2024-01-21T16:00:00Z'),

    // Tags & Categories
    tags: ['React', 'Node.js', 'Education', 'Video Streaming'],
    category: 'Digital' as ArtworkCategory,

    // Upload metadata
    uploadedBy: 'dev-user-123',
    originalFileName: 'lms-dashboard.png',
    fileSize: 2.8,
    mimeType: 'image/png',

    // Portfolio/Social Features
    portfolioId: 'portfolio-dev-123',
    views: 198,
    likes: 15
  }
];
