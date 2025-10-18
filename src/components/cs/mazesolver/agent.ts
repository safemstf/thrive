import { AlgorithmClass, RacingTeam } from "./mazeTypes";

// Professional Racing Teams Database
export const RACING_TEAMS: Record<AlgorithmClass, RacingTeam> = {
  'BFS': {
    id: 'BFS',
    name: 'BFS Racer',
    number: 1,
    stable: 'Classic Computing',
    jockeyName: 'B. First',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    strategy: 'Explores layer by layer - guaranteed optimal',
    topSpeed: 85,
    acceleration: 80,
    handling: 90,
    stamina: 95
  },
  'DFS': {
    id: 'DFS',
    name: 'DFS Diver',
    number: 2,
    stable: 'Recursive Racing',
    jockeyName: 'D. Stack',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    strategy: 'Goes deep fast - unpredictable paths',
    topSpeed: 90,
    acceleration: 95,
    handling: 70,
    stamina: 75
  },
  'AStar': {
    id: 'AStar',
    name: 'AStar Pathfinder',
    number: 3,
    stable: 'Heuristic Heroes',
    jockeyName: 'A. Smart',
    color: '#10b981',
    accentColor: '#34d399',
    strategy: 'Intelligent search with goal awareness',
    topSpeed: 95,
    acceleration: 90,
    handling: 95,
    stamina: 90
  },
  'Dijkstra': {
    id: 'Dijkstra',
    name: 'Dijkstra Master',
    number: 4,
    stable: 'Optimal Routes Inc',
    jockeyName: 'E. Dijkstra',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    strategy: 'Explores everything - finds best path',
    topSpeed: 88,
    acceleration: 85,
    handling: 92,
    stamina: 95
  },
  'Greedy': {
    id: 'Greedy',
    name: 'Greedy Demon',
    number: 5,
    stable: 'Quick Decisions',
    jockeyName: 'G. Fast',
    color: '#ef4444',
    accentColor: '#f87171',
    strategy: 'Always picks closest - fast but risky',
    topSpeed: 98,
    acceleration: 100,
    handling: 75,
    stamina: 70
  },
  'Bidirectional': {
    id: 'Bidirectional',
    name: 'Bidirectional Runner',
    number: 6,
    stable: 'Dual Search Division',
    jockeyName: 'B. Directional',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    strategy: 'Searches from both ends simultaneously',
    topSpeed: 92,
    acceleration: 88,
    handling: 88,
    stamina: 85
  },
  'BMSSP': {
    id: 'BMSSP',
    name: 'BMSSP Master',
    number: 7,
    stable: 'Research Labs',
    jockeyName: 'Dr. Algorithm',
    color: '#ec4899',
    accentColor: '#f472b6',
    strategy: 'Multi-level partitioning with pivots',
    topSpeed: 96,
    acceleration: 92,
    handling: 94,
    stamina: 93
  }
};