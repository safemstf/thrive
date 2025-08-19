// ============================================================================
// USER-INTEGRATED ANT COLONY SIMULATION
// Each user becomes a special ant with unique behaviors and stats
// ============================================================================

// Import mock user data types
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  specialization?: string;
  score?: number;
  verified?: boolean;
  kind?: 'creative' | 'professional' | 'educational';
  stats?: {
    totalViews?: number;
    averageRating?: number;
    totalPieces?: number;
  };
}

// Mock user profiles from your data
export const USER_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice_creates',
    specialization: 'Creative Director',
    score: 125000,
    verified: true,
    kind: 'creative',
    stats: { totalViews: 125000, averageRating: 4.9, totalPieces: 42 }
  },
  {
    id: '2',
    name: 'Robert Chen',
    username: 'bob_codes',
    specialization: 'Software Architect',
    score: 67000,
    verified: true,
    kind: 'professional',
    stats: { totalViews: 67000, averageRating: 4.8, totalPieces: 28 }
  },
  {
    id: '3',
    name: 'Charlie Davis',
    username: 'charlie_learns',
    specialization: 'Full-Stack Developer',
    score: 28000,
    verified: false,
    kind: 'educational',
    stats: { totalViews: 28000, averageRating: 4.6, totalPieces: 15 }
  },
  {
    id: '4',
    name: 'Sarah Chen',
    username: 'sarah_codes',
    specialization: 'Full-Stack Development',
    score: 12450,
    verified: true,
    kind: 'professional'
  },
  {
    id: '5',
    name: 'Alex Rodriguez',
    username: 'alex_designs',
    specialization: 'UI/UX Design',
    score: 11920,
    verified: true,
    kind: 'creative'
  },
  {
    id: '6',
    name: 'Maria Santos',
    username: 'maria_data',
    specialization: 'Data Science',
    score: 11680,
    verified: false,
    kind: 'professional'
  }
];

// Constants
export const CANVAS_W = 900;
export const CANVAS_H = 600;
export const GRID_SIZE = 15;
export const PHEROMONE_DECAY = 0.995;
export const MAX_REGULAR_ANTS = 100;
export const MAX_USER_ANTS = USER_PROFILES.length;
export const SPATIAL_GRID_SIZE = 30;
export const USER_ANT_SIZE = 6; // Larger than regular ants


// Types
export type Strategy = 'random' | 'pheromone' | 'greedy' | 'smart' | 'leader';
export type AntType = 'regular' | 'user' | 'vip';

export interface Colony {
  id: number;
  name: string;
  color: string;
  baseX: number;
  baseY: number;
  foodCollected: number;
  strategy: Strategy;
  r: number;
  g: number;
  b: number;
  userAnts: number[];
}

export interface FoodSource {
  x: number;
  y: number;
  amount: number;
  quality: number; // 1-5, affects ant behavior
}

export interface UserAnt {
  userId: string;
  antIndex: number;
  profile: UserProfile;
  personalBest: number;
  currentStreak: number;
  achievements: string[];
}

// Props
export interface Props {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}
