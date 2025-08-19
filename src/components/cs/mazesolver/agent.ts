import { AlgorithmClass, RacingTeam } from "./mazeTypes";

// Professional Racing Teams Database
export const RACING_TEAMS: Record<AlgorithmClass, RacingTeam> = {
  BFS: {
    id: 'BFS',
    name: 'Breadth Lightning',
    number: 11,
    stable: 'Queue Stables',
    jockeyName: 'B. First',
    color: '#0ea5e9',
    accentColor: '#0284c7',
    strategy: 'Level-by-level • Shortest path',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  },
  DFS: {
    id: 'DFS',
    name: 'Deep Diver',
    number: 27,
    stable: 'Stack Racing',
    jockeyName: 'D. Explorer',
    color: '#dc2626',
    accentColor: '#b91c1c',
    strategy: 'Depth-first • Can take long paths',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  },
  AStar: {
    id: 'AStar',
    name: 'Star Navigator',
    number: 42,
    stable: 'Heuristic Motors',
    jockeyName: 'A. Optimal',
    color: '#f59e0b',
    accentColor: '#d97706',
    strategy: 'Heuristic-guided • Optimal & fast',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  },
  Dijkstra: {
    id: 'Dijkstra',
    name: 'Dutch Master',
    number: 59,
    stable: 'Shortest Path Inc',
    jockeyName: 'E. Dijkstra',
    color: '#10b981',
    accentColor: '#059669',
    strategy: 'Guaranteed shortest • Methodical',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  },
  Greedy: {
    id: 'Greedy',
    name: 'Speed Demon',
    number: 88,
    stable: 'Fast & Loose',
    jockeyName: 'G. Quick',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    strategy: 'Direct to goal • Often suboptimal',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  },
  Bidirectional: {
    id: 'Bidirectional',
    name: 'Twin Turbo',
    number: 99,
    stable: 'Both Ways Racing',
    jockeyName: 'B. Directional',
    color: '#ec4899',
    accentColor: '#db2777',
    strategy: 'Dual search • Meets in middle',
    topSpeed: 1,
    acceleration: 1,
    handling: 1,
    stamina: 1000
  }
};