import { AlgorithmClass, RacingTeam } from "./mazeTypes";

// Algorithm Teams Database - Colors matched to design tokens
export const RACING_TEAMS: Record<AlgorithmClass, RacingTeam> = {
  'BFS': {
    id: 'BFS',
    name: 'BFS',
    number: 1,
    stable: 'Classic Computing',
    jockeyName: 'B. First',
    color: '#58a6ff',
    accentColor: '#79c0ff',
    strategy: 'Layer-by-layer exploration',
    topSpeed: 85,
    acceleration: 80,
    handling: 90,
    stamina: 95
  },
  'DFS': {
    id: 'DFS',
    name: 'DFS',
    number: 2,
    stable: 'Recursive Racing',
    jockeyName: 'D. Stack',
    color: '#a371f7',
    accentColor: '#c9a0ff',
    strategy: 'Deep path exploration',
    topSpeed: 90,
    acceleration: 95,
    handling: 70,
    stamina: 75
  },
  'AStar': {
    id: 'AStar',
    name: 'A*',
    number: 3,
    stable: 'Heuristic Heroes',
    jockeyName: 'A. Smart',
    color: '#3fb950',
    accentColor: '#56d364',
    strategy: 'Heuristic-guided search',
    topSpeed: 95,
    acceleration: 90,
    handling: 95,
    stamina: 90
  },
  'Dijkstra': {
    id: 'Dijkstra',
    name: 'Dijkstra',
    number: 4,
    stable: 'Optimal Routes Inc',
    jockeyName: 'E. Dijkstra',
    color: '#d29922',
    accentColor: '#e3b341',
    strategy: 'Exhaustive shortest path',
    topSpeed: 88,
    acceleration: 85,
    handling: 92,
    stamina: 95
  },
  'Greedy': {
    id: 'Greedy',
    name: 'Greedy',
    number: 5,
    stable: 'Quick Decisions',
    jockeyName: 'G. Fast',
    color: '#f85149',
    accentColor: '#ff7b72',
    strategy: 'Always nearest first',
    topSpeed: 98,
    acceleration: 100,
    handling: 75,
    stamina: 70
  },
  'Bidirectional': {
    id: 'Bidirectional',
    name: 'Bidir',
    number: 6,
    stable: 'Dual Search Division',
    jockeyName: 'B. Directional',
    color: '#79c0ff',
    accentColor: '#a5d6ff',
    strategy: 'Search from both ends',
    topSpeed: 92,
    acceleration: 88,
    handling: 88,
    stamina: 85
  },
  'BMSSP': {
    id: 'BMSSP',
    name: 'BMSSP',
    number: 7,
    stable: 'Research Labs',
    jockeyName: 'Dr. Algorithm',
    color: '#f778ba',
    accentColor: '#ffa5d2',
    strategy: 'Hierarchical partitioning',
    topSpeed: 96,
    acceleration: 92,
    handling: 94,
    stamina: 93
  }
};

// Presets for quick configuration
export const MAZE_PRESETS = {
  small: { size: 21, label: 'Small (21×21)' },
  medium: { size: 31, label: 'Medium (31×31)' },
  large: { size: 41, label: 'Large (41×41)' },
  huge: { size: 51, label: 'Huge (51×51)' }
};

export const NETWORK_PRESETS = {
  sparse: { nodes: 12, label: 'Sparse (12 nodes)' },
  medium: { nodes: 20, label: 'Medium (20 nodes)' },
  dense: { nodes: 30, label: 'Dense (30 nodes)' },
  complex: { nodes: 40, label: 'Complex (40 nodes)' }
};