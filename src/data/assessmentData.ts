// src/data/assessmentData.ts

import {
    Target, TrendingUp, Users, Trophy, Star, CheckCircle,
    ArrowRight, Shield, Globe, Loader2, Activity, Award,
    Lock, Sparkles, Timer, Brain, AlertCircle, Lightbulb,
    Heart, Zap, BarChart3, Compass, MessageSquare, Briefcase,
    LineChart, UserCheck, FileCheck, GraduationCap, Building2,
    Palette, PenTool, Puzzle, BookOpen, Scale, Smile,
    Frown, CloudRain, Sun, Moon, Battery, BatteryLow,
    HeartHandshake, Shield as ShieldIcon, Gauge, Mountain
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ==============================================
// TYPE DEFINITIONS
// ==============================================

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
}

export interface PsychologicalAssessment extends BaseAssessment {
    type: 'psychological';
    clinicalUse: boolean;
    ageRange?: string;
    normData?: string;
    interpretationGuide?: boolean;
    disclaimerRequired: boolean;
}

export interface CreativityAssessment extends BaseAssessment {
    type: 'creativity';
    domain: 'divergent' | 'convergent' | 'artistic' | 'practical' | 'mixed';
    scoringMethod: string;
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
        disclaimerRequired: false
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
        disclaimerRequired: false
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