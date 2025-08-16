// src/types/thrive.types.ts
import type React from 'react';

/**
 * Core enums / unions
 */
export type SkillType =
  | 'critical-thinking'
  | 'linguistic'
  | 'technical'
  | 'analytical'
  | 'creative';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Shared small pieces
 */
export interface PerformanceMetric {
  label: string;
  value: string;
}

/**
 * Basic assessment question
 */
export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  codeSnippet?: string;
  performanceMetrics?: PerformanceMetric[];
  // handy for writing tasks (used in your professional-communication page)
  writingTask?: boolean;
  writingPrompt?: string;
}

/**
 * Assessment (single authoritative definition)
 */
export interface Assessment {
  id: string;
  title: string;
  description: string;
  skillType: SkillType;
  difficulty: DifficultyLevel;
  duration: number; // minutes
  participants: number;
  averageScore?: number;
  completionRate?: number;
  employerTrust?: number;
  route?: string;
  questions?: AssessmentQuestion[];
}

/**
 * Category & leaderboard related types
 */
export interface AssessmentCategory {
  id: string;
  title: string;
  description?: string;
  // use React SVG props so lucide-react icons fit nicely
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  participants?: number;
  difficulty?: DifficultyLevel;
  duration?: number;
  averageScore?: number;
  route?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  verified?: boolean;
}

/**
 * User & platform stats
 */
export interface RankedUser {
  id: string;
  name: string;
  title?: string;
  rank: number;
  overallScore: number;
  // keep flexible: either SkillType or string labels
  skills?: Array<SkillType | string>;
  verified?: boolean;
  // optional per-skill numbers if you want to show detailed breakdowns
  metrics?: Partial<Record<SkillType, number>>;
}

export interface PlatformStats {
  verifiedProfessionals: number;
  activeSessions: number;
  completedToday: number;
  employerTrust: number;
}

/* ======================================================================
   Game / challenge types used by GameShell, renderers and results
   ====================================================================== */

export type GameChallengeType =
  | 'logic-puzzle'
  | 'pattern-recognition'
  | 'code-debug'
  | 'interactive-scenario'
  | 'visual-reasoning';

/**
 * GameChallenge extends AssessmentQuestion so you can reuse text/options/etc.
 * and also include game-specific fields used by your renderers.
 */
export interface GameChallenge extends AssessmentQuestion {
  type: GameChallengeType;
  maxPoints?: number;
  timeLimit?: number; // seconds
  instructions?: string;
  gameData?: any;
}

/**
 * Actions and results tracked during a game
 */
export interface GameAction {
  challengeId: string;
  actionType: 'click' | 'drag' | 'input' | 'selection' | 'custom';
  data?: any;
  timestamp: Date;
  points?: number;
}

export interface ChallengeResult {
  challengeId: string;
  completed: boolean;
  score: number;
  timeSpent: number; // seconds
  attempts: number;
}

export interface GameResults {
  assessmentId: string;
  totalScore: number;
  totalPoints: number;
  timeTaken: number; // seconds
  actions: GameAction[];
  completedAt: Date;
  challenges: ChallengeResult[];
  metadata?: Record<string, any>;
}

/**
 * Props passed to challenge renderer components
 */
export interface ChallengeRendererProps {
  challenge: GameChallenge;
  onComplete: (result: ChallengeResult) => void;
  onAction: (action: GameAction) => void;
  isDisabled: boolean;
  currentProgress?: ChallengeResult;
}

// Add these types to your existing assessment types file (e.g., src/types/thrive.types.ts)

export interface TopPerformer {
  id: string;
  rank: number;
  name: string;
  username: string;
  profileImage: string;
  totalScore: number;
  assessmentsCompleted: number;
  averageScore: number;
  specialization: string;
  verified: boolean;
  monthlyGain: number;
  lastActive: Date;
}

export interface AssessmentLeaderboard {
  assessmentId: string;
  title: string;
  category: string;
  leaders: AssessmentLeader[];
}

export interface AssessmentLeader {
  rank: number;
  name: string;
  username: string;
  score: number;
  completedAt: Date;
  timeSpent: number;
}

export interface RankingPlatformStats {
  totalParticipants: number;
  activeThisWeek: number;
  averageScore: number;
  completionsToday: number;
}