import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { 
  Play, Pause, RotateCcw, Trophy, Zap, Activity, 
  Radio, Users, DollarSign, TrendingUp, Flag,
  Volume2, VolumeX, Gauge, Navigation, MapPin,
  Timer, Award, Eye, Layers3, Sparkles, ChevronUp,
  ChevronDown, Info, Settings, Maximize2, Target,
  CheckCircle2, Circle, Gamepad2
} from 'lucide-react';

// Import the actual pathfinding algorithms
import { 
  breadthFirstSearch, 
  depthFirstSearch, 
  aStarSearch, 
  dijkstraSearch,
  AlgorithmResult,
  AlgorithmConfig
} from './algorithms';

// ============================================================================
// STYLED COMPONENTS (keeping all your existing styles)
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  overflow-x: hidden;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

const Header = styled.header`
  background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 2px solid #3b82f6;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BroadcastBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    animation: ${pulse} 2s infinite;
    color: #3b82f6;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  text-transform: uppercase;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const RoundBadge = styled.span`
  background: rgba(59, 130, 246, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
`;

const MainContainer = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section<{ $variant?: 'left' | 'center' | 'right' }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    order: ${({ $variant }) => {
      switch ($variant) {
        case 'center': return 0;
        case 'left': return 1;
        case 'right': return 2;
        default: return 0;
      }
    }};
  }
`;

const Card = styled.div<{ $glow?: boolean; $interactive?: boolean }>`
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $glow }) => $glow && css`
    animation: ${glow} 3s infinite;
  `}
  
  ${({ $interactive }) => $interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
    }
  `}
`;

const CardHeader = styled.div<{ $color?: string }>`
  background: ${({ $color }) => $color || 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'};
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem;
  border-radius: 10px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'transparent'};
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ $active }) => $active ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'rgba(59, 130, 246, 0.2)'};
  }
`;

const TeamSelector = styled.label<{ $selected: boolean; $teamColor: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $selected, $teamColor }) => 
    $selected ? `${$teamColor}15` : 'transparent'};
  border-left: 3px solid ${({ $selected, $teamColor }) => 
    $selected ? $teamColor : 'transparent'};
  
  &:hover {
    background: ${({ $teamColor }) => `${$teamColor}10`};
  }
  
  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ $teamColor }) => $teamColor};
  }
`;

const TeamBadge = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const TrackCanvas = styled.canvas`
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: #0a0a0a;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  image-rendering: crisp-edges;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.5rem 1rem';
      case 'lg': return '0.875rem 1.75rem';
      default: return '0.625rem 1.5rem';
    }
  }};
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1rem';
      default: return '0.9375rem';
    }
  }};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'secondary': return '#3b82f6';
      case 'danger': return '#dc2626';
      default: return '#10b981';
    }
  }};
  
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    filter: brightness(1.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LeaderboardItem = styled.div<{ $position: number; $teamColor: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid ${({ $teamColor }) => $teamColor};
  transition: all 0.2s;
  
  ${({ $position }) => $position === 0 && css`
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
  `}
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateX(4px);
  }
`;

const FlagCounter = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const FlagIcon = styled.div<{ $collected: boolean }>`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $collected }) => $collected ? '#fbbf24' : '#475569'};
  transition: all 0.3s;
  
  ${({ $collected }) => $collected && css`
    animation: ${pulse} 0.5s ease;
  `}
`;

const TelemetryBar = styled.div`
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
`;

const TelemetryFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const Commentary = styled.div<{ $type: 'exciting' | 'normal' | 'critical' }>`
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  animation: ${slideIn} 0.3s ease;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'exciting': return 'rgba(251, 191, 36, 0.1)';
      case 'critical': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(71, 85, 105, 0.2)';
    }
  }};
  
  color: ${({ $type }) => {
    switch ($type) {
      case 'exciting': return '#fbbf24';
      case 'critical': return '#f87171';
      default: return '#cbd5e1';
    }
  }};
  
  border-left: 2px solid ${({ $type }) => {
    switch ($type) {
      case 'exciting': return '#f59e0b';
      case 'critical': return '#dc2626';
      default: return '#475569';
    }
  }};
`;

const TimeDisplay = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 1px;
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }
  
  span {
    font-size: 0.875rem;
    color: #94a3b8;
  }
`;

const OddsItem = styled.div<{ $teamColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 2px solid ${({ $teamColor }) => $teamColor};
`;

const OddsValue = styled.span`
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 700;
  color: #fbbf24;
  font-size: 0.9375rem;
`;

// ============================================================================
// TYPES AND CONFIGURATION
// ============================================================================

const TRACK_WIDTH = 41;
const TRACK_HEIGHT = 41;
const CELL_SIZE = 14;
const VIEWPORT_W = TRACK_WIDTH * CELL_SIZE;
const VIEWPORT_H = TRACK_HEIGHT * CELL_SIZE;

type AlgorithmClass = 'BFS' | 'DFS' | 'AStar' | 'Dijkstra' | 'Greedy' | 'Bidirectional';
type RaceStatus = 'preparing' | 'starting' | 'racing' | 'finished';
type RaceMode = 'sprint' | 'flags';

interface RacingTeam {
  id: AlgorithmClass;
  name: string;
  number: number;
  stable: string;
  jockeyName: string;
  color: string;
  accentColor: string;
  strategy: string;
  topSpeed: number;
  acceleration: number;
  handling: number;
  stamina: number;
}

interface Racer {
  team: RacingTeam;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  heading: number;
  path: [number, number][];
  explored: Set<string>;
  currentTarget: number;
  lapTime: number;
  bestLap: number;
  totalDistance: number;
  currentSpeed: number;
  tire: number;
  fuel: number;
  finished: boolean;
  finishTime: number;
  trail: { x: number; y: number; alpha: number }[];
  telemetry: {
    speed: number[];
    exploration: number[];
    efficiency: number;
  };
  collectedFlags: Set<number>;
  targetFlag: number | null;
  flagPath: [number, number][];
}

interface RaceCommentary {
  time: number;
  message: string;
  type: 'exciting' | 'normal' | 'critical';
}

interface BettingOdds {
  team: AlgorithmClass;
  odds: string;
  movement: 'up' | 'down' | 'stable';
}

// Professional Racing Teams Database
const RACING_TEAMS: Record<AlgorithmClass, RacingTeam> = {
  BFS: {
    id: 'BFS',
    name: 'Breadth Lightning',
    number: 11,
    stable: 'Queue Stables',
    jockeyName: 'B. First',
    color: '#0ea5e9',
    accentColor: '#0284c7',
    strategy: 'Systematic exploration, guaranteed shortest path',
    topSpeed: 7.5,
    acceleration: 6,
    handling: 8,
    stamina: 9
  },
  DFS: {
    id: 'DFS',
    name: 'Deep Diver',
    number: 27,
    stable: 'Stack Racing',
    jockeyName: 'D. Explorer',
    color: '#dc2626',
    accentColor: '#b91c1c',
    strategy: 'Aggressive depth-first approach, high risk high reward',
    topSpeed: 8.5,
    acceleration: 9,
    handling: 5,
    stamina: 6
  },
  AStar: {
    id: 'AStar',
    name: 'Star Navigator',
    number: 42,
    stable: 'Heuristic Motors',
    jockeyName: 'A. Optimal',
    color: '#f59e0b',
    accentColor: '#d97706',
    strategy: 'Smart pathfinding with heuristic guidance',
    topSpeed: 9,
    acceleration: 8,
    handling: 9,
    stamina: 8
  },
  Dijkstra: {
    id: 'Dijkstra',
    name: 'Dutch Master',
    number: 59,
    stable: 'Shortest Path Inc',
    jockeyName: 'E. Dijkstra',
    color: '#10b981',
    accentColor: '#059669',
    strategy: 'Methodical approach, always finds optimal route',
    topSpeed: 7,
    acceleration: 5,
    handling: 10,
    stamina: 10
  },
  Greedy: {
    id: 'Greedy',
    name: 'Speed Demon',
    number: 88,
    stable: 'Fast & Loose',
    jockeyName: 'G. Quick',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    strategy: 'Always heading toward the goal, no looking back',
    topSpeed: 10,
    acceleration: 10,
    handling: 4,
    stamina: 5
  },
  Bidirectional: {
    id: 'Bidirectional',
    name: 'Twin Turbo',
    number: 99,
    stable: 'Both Ways Racing',
    jockeyName: 'B. Directional',
    color: '#ec4899',
    accentColor: '#db2777',
    strategy: 'Search from both ends simultaneously',
    topSpeed: 8,
    acceleration: 7,
    handling: 8,
    stamina: 7
  }
};

// ============================================================================
// MAZE GENERATION
// ============================================================================

class RaceTrack {
  private cells: Uint8Array;
  public width: number;
  public height: number;
  public start: [number, number];
  public finish: [number, number];
  public flags: [number, number][];
  
  constructor(width: number, height: number, flagCount: number = 7) {
    this.width = width;
    this.height = height;
    this.cells = new Uint8Array(width * height);
    this.start = [1, 1];
    this.finish = [width - 2, height - 2];
    this.flags = [];
    this.generateProfessionalTrack(flagCount);
  }
  
  private generateProfessionalTrack(flagCount: number) {
    this.cells.fill(1);
    
    const stack: [number, number][] = [];
    const visited = new Set<string>();
    
    const startX = 1, startY = 1;
    stack.push([startX, startY]);
    visited.add(`${startX},${startY}`);
    this.setCell(startX, startY, 0);
    
    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(cx, cy, visited);
      
      if (neighbors.length > 0) {
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        this.setCell((cx + nx) / 2, (cy + ny) / 2, 0);
        this.setCell(nx, ny, 0);
        
        visited.add(`${nx},${ny}`);
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }
    
    this.addOvertakingLanes();
    
    this.setCell(this.start[0], this.start[1], 0);
    this.setCell(this.finish[0], this.finish[1], 0);
    
    this.placeFlags(flagCount);
  }
  
  private getUnvisitedNeighbors(x: number, y: number, visited: Set<string>): [number, number][] {
    const neighbors: [number, number][] = [];
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
    
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx > 0 && nx < this.width - 1 && 
          ny > 0 && ny < this.height - 1 && 
          !visited.has(`${nx},${ny}`)) {
        neighbors.push([nx, ny]);
      }
    }
    
    return neighbors;
  }
  
  private addOvertakingLanes() {
    const attempts = Math.floor(this.width * this.height * 0.05);
    
    for (let i = 0; i < attempts; i++) {
      const x = 2 + Math.floor(Math.random() * (this.width - 4));
      const y = 2 + Math.floor(Math.random() * (this.height - 4));
      
      if (this.getCell(x, y) === 1) {
        let openNeighbors = 0;
        for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          if (this.getCell(x + dx, y + dy) === 0) openNeighbors++;
        }
        
        if (openNeighbors >= 2) {
          this.setCell(x, y, 0);
        }
      }
    }
  }
  
  private placeFlags(count: number) {
    const candidates: [number, number][] = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getCell(x, y) === 0) {
          const isStart = x === this.start[0] && y === this.start[1];
          const isFinish = x === this.finish[0] && y === this.finish[1];
          
          if (!isStart && !isFinish) {
            candidates.push([x, y]);
          }
        }
      }
    }
    
    const sectors = Math.ceil(Math.sqrt(count));
    const sectorWidth = Math.floor(this.width / sectors);
    const sectorHeight = Math.floor(this.height / sectors);
    
    this.flags = [];
    
    for (let i = 0; i < count && candidates.length > 0; i++) {
      const sectorX = (i % sectors) * sectorWidth + sectorWidth / 2;
      const sectorY = Math.floor(i / sectors) * sectorHeight + sectorHeight / 2;
      
      let bestCandidate = candidates[0];
      let bestDist = Infinity;
      
      for (const candidate of candidates) {
        const dist = Math.abs(candidate[0] - sectorX) + Math.abs(candidate[1] - sectorY);
        if (dist < bestDist) {
          bestDist = dist;
          bestCandidate = candidate;
        }
      }
      
      this.flags.push(bestCandidate);
      candidates.splice(candidates.indexOf(bestCandidate), 1);
    }
  }
  
  getCell(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 1;
    return this.cells[y * this.width + x];
  }
  
  setCell(x: number, y: number, value: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y * this.width + x] = value;
    }
  }
  
  // Convert to 2D array for the imported algorithms
  to2DArray(): number[][] {
    const maze: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(this.getCell(x, y));
      }
      maze.push(row);
    }
    return maze;
  }
}

// ============================================================================
// SIMPLIFIED ALGORITHM WRAPPERS
// ============================================================================

// Greedy Best-First Search implementation
function greedyBestFirstSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  const startTime = performance.now();
  const height = maze.length;
  const width = maze[0].length;
  
  const heuristic = (a: [number, number], b: [number, number]) => 
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  
  const openSet: { pos: [number, number]; h: number }[] = [];
  const visited = new Set<string>();
  const cameFrom = new Map<string, [number, number] | null>();
  const explored: [number, number][] = [];
  
  openSet.push({ pos: start, h: heuristic(start, goal) });
  cameFrom.set(`${start[0]},${start[1]}`, null);
  
  let steps = 0;
  const maxSteps = config?.maxSteps || 50000;
  
  while (openSet.length > 0 && steps < maxSteps) {
    openSet.sort((a, b) => a.h - b.h);
    const current = openSet.shift()!;
    const currentKey = `${current.pos[0]},${current.pos[1]}`;
    
    if (visited.has(currentKey)) continue;
    
    visited.add(currentKey);
    explored.push(current.pos);
    steps++;
    
    if (current.pos[0] === goal[0] && current.pos[1] === goal[1]) {
      const path: [number, number][] = [];
      let curr: [number, number] | null = goal;
      
      while (curr) {
        path.unshift(curr);
        const parent = cameFrom.get(`${curr[0]},${curr[1]}`);
        curr = parent || null;
      }
      
      return {
        name: 'Greedy',
        path,
        explored,
        steps,
        success: true,
        executionTime: performance.now() - startTime
      };
    }
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of directions) {
      const nx = current.pos[0] + dx;
      const ny = current.pos[1] + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && 
          maze[ny][nx] === 0 && !visited.has(`${nx},${ny}`)) {
        cameFrom.set(`${nx},${ny}`, current.pos);
        openSet.push({ pos: [nx, ny], h: heuristic([nx, ny], goal) });
      }
    }
  }
  
  return {
    name: 'Greedy',
    path: [],
    explored,
    steps,
    success: false,
    executionTime: performance.now() - startTime
  };
}

// Bidirectional Search implementation
function bidirectionalSearch(
  maze: number[][],
  start: [number, number],
  goal: [number, number],
  config?: AlgorithmConfig
): AlgorithmResult {
  const startTime = performance.now();
  const height = maze.length;
  const width = maze[0].length;
  
  const forwardQueue: [number, number][] = [start];
  const backwardQueue: [number, number][] = [goal];
  const forwardVisited = new Set<string>();
  const backwardVisited = new Set<string>();
  const forwardCameFrom = new Map<string, [number, number] | null>();
  const backwardCameFrom = new Map<string, [number, number] | null>();
  const explored: [number, number][] = [];
  
  forwardVisited.add(`${start[0]},${start[1]}`);
  backwardVisited.add(`${goal[0]},${goal[1]}`);
  forwardCameFrom.set(`${start[0]},${start[1]}`, null);
  backwardCameFrom.set(`${goal[0]},${goal[1]}`, null);
  
  let steps = 0;
  const maxSteps = config?.maxSteps || 50000;
  
  while ((forwardQueue.length > 0 || backwardQueue.length > 0) && steps < maxSteps) {
    // Forward search
    if (forwardQueue.length > 0) {
      const current = forwardQueue.shift()!;
      const currentKey = `${current[0]},${current[1]}`;
      explored.push(current);
      steps++;
      
      if (backwardVisited.has(currentKey)) {
        // Reconstruct path
        const forwardPath: [number, number][] = [];
        let curr: [number, number] | null = current;
        while (curr) {
          forwardPath.unshift(curr);
          const parent = forwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = backwardCameFrom.get(currentKey) || null;
        while (curr) {
          backwardPath.push(curr);
          const parent = backwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        return {
          name: 'Bidirectional',
          path: [...forwardPath.slice(0, -1), ...backwardPath],
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && 
            maze[ny][nx] === 0 && !forwardVisited.has(neighborKey)) {
          forwardVisited.add(neighborKey);
          forwardCameFrom.set(neighborKey, current);
          forwardQueue.push([nx, ny]);
        }
      }
    }
    
    // Backward search
    if (backwardQueue.length > 0) {
      const current = backwardQueue.shift()!;
      const currentKey = `${current[0]},${current[1]}`;
      explored.push(current);
      steps++;
      
      if (forwardVisited.has(currentKey)) {
        // Reconstruct path (similar to above)
        const forwardPath: [number, number][] = [];
        let curr: [number, number] | null = forwardCameFrom.get(currentKey) || current;
        while (curr) {
          forwardPath.unshift(curr);
          const parent = forwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        const backwardPath: [number, number][] = [];
        curr = current;
        while (curr) {
          backwardPath.push(curr);
          const parent = backwardCameFrom.get(`${curr[0]},${curr[1]}`);
          curr = parent || null;
        }
        
        return {
          name: 'Bidirectional',
          path: [...forwardPath, ...backwardPath.slice(1)],
          explored,
          steps,
          success: true,
          executionTime: performance.now() - startTime
        };
      }
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const nx = current[0] + dx;
        const ny = current[1] + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && 
            maze[ny][nx] === 0 && !backwardVisited.has(neighborKey)) {
          backwardVisited.add(neighborKey);
          backwardCameFrom.set(neighborKey, current);
          backwardQueue.push([nx, ny]);
        }
      }
    }
  }
  
  return {
    name: 'Bidirectional',
    path: [],
    explored,
    steps,
    success: false,
    executionTime: performance.now() - startTime
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfessionalAlgorithmDerby() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const [track, setTrack] = useState<RaceTrack | null>(null);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('preparing');
  const [raceTime, setRaceTime] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState<AlgorithmClass[]>(['BFS', 'AStar', 'Dijkstra']);
  const [raceMode, setRaceMode] = useState<RaceMode>('flags');
  
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [showExploration, setShowExploration] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [commentary, setCommentary] = useState<RaceCommentary[]>([]);
  const [bettingOdds, setBettingOdds] = useState<BettingOdds[]>([]);
  
  const initializeRace = useCallback(() => {
    const flagCount = raceMode === 'flags' ? 7 : 0;
    const newTrack = new RaceTrack(TRACK_WIDTH, TRACK_HEIGHT, flagCount);
    setTrack(newTrack);
    
    // Convert track to 2D array for the algorithms
    const maze = newTrack.to2DArray();
    const newRacers: Racer[] = [];
    
    const config: AlgorithmConfig = {
      maxSteps: 100000,
      allowDiagonal: false,
      timeLimit: 5000
    };
    
    for (const teamId of selectedTeams) {
      const team = RACING_TEAMS[teamId];
      let fullPath: [number, number][] = [];
      let totalExplored = new Set<string>();
      let algorithmResult: AlgorithmResult;
      
      if (raceMode === 'flags') {
        // Calculate flag collection order based on algorithm characteristics
        const flagOrder = calculateFlagOrder(newTrack.start, newTrack.flags, teamId);
        
        // Build path through all flags
        let currentPos = newTrack.start;
        
        for (const flagIdx of flagOrder) {
          const flagPos = newTrack.flags[flagIdx];
          
          // Use the actual algorithm for this team
          switch (teamId) {
            case 'BFS':
              algorithmResult = breadthFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'DFS':
              algorithmResult = depthFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'AStar':
              algorithmResult = aStarSearch(maze, currentPos, flagPos, config);
              break;
            case 'Dijkstra':
              algorithmResult = dijkstraSearch(maze, currentPos, flagPos, config);
              break;
            case 'Greedy':
              algorithmResult = greedyBestFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'Bidirectional':
              algorithmResult = bidirectionalSearch(maze, currentPos, flagPos, config);
              break;
            default:
              algorithmResult = breadthFirstSearch(maze, currentPos, flagPos, config);
          }
          
          if (algorithmResult.success && algorithmResult.path.length > 0) {
            fullPath = fullPath.concat(algorithmResult.path.slice(fullPath.length > 0 ? 1 : 0));
            algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
            currentPos = flagPos;
          }
        }
        
        // Path from last flag to finish
        switch (teamId) {
          case 'BFS':
            algorithmResult = breadthFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'DFS':
            algorithmResult = depthFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'AStar':
            algorithmResult = aStarSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Dijkstra':
            algorithmResult = dijkstraSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Greedy':
            algorithmResult = greedyBestFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Bidirectional':
            algorithmResult = bidirectionalSearch(maze, currentPos, newTrack.finish, config);
            break;
          default:
            algorithmResult = breadthFirstSearch(maze, currentPos, newTrack.finish, config);
        }
        
        if (algorithmResult.success && algorithmResult.path.length > 0) {
          fullPath = fullPath.concat(algorithmResult.path.slice(1));
          algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
        }
      } else {
        // Sprint mode - direct path to finish
        switch (teamId) {
          case 'BFS':
            algorithmResult = breadthFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'DFS':
            algorithmResult = depthFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'AStar':
            algorithmResult = aStarSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Dijkstra':
            algorithmResult = dijkstraSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Greedy':
            algorithmResult = greedyBestFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Bidirectional':
            algorithmResult = bidirectionalSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          default:
            algorithmResult = breadthFirstSearch(maze, newTrack.start, newTrack.finish, config);
        }
        
        fullPath = algorithmResult.path;
        algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
      }
      
      newRacers.push({
        team,
        position: { x: newTrack.start[0], y: newTrack.start[1] },
        velocity: { x: 0, y: 0 },
        heading: 0,
        path: fullPath,
        explored: totalExplored,
        currentTarget: 0,
        lapTime: 0,
        bestLap: Infinity,
        totalDistance: 0,
        currentSpeed: 0,
        tire: 100,
        fuel: 100,
        finished: false,
        finishTime: 0,
        trail: [],
        telemetry: {
          speed: [],
          exploration: [],
          efficiency: fullPath.length > 0 ? (fullPath.length / totalExplored.size) * 100 : 0
        },
        collectedFlags: new Set(),
        targetFlag: null,
        flagPath: []
      });
    }
    
    setRacers(newRacers);
    setRaceStatus('preparing');
    setRaceTime(0);
    
    const modeText = raceMode === 'flags' ? 'Flag Collection Challenge' : 'Sprint to the Finish';
    setCommentary([{
      time: 0,
      message: `Welcome to the Algorithm Derby! Today's event: ${modeText}!`,
      type: 'normal'
    }]);
    
    const odds = newRacers.map(racer => ({
      team: racer.team.id,
      odds: calculateOdds(racer),
      movement: 'stable' as const
    }));
    setBettingOdds(odds);
  }, [selectedTeams, raceMode]);
  
  // Calculate flag collection order based on algorithm strategy
  const calculateFlagOrder = (start: [number, number], flags: [number, number][], teamId: AlgorithmClass): number[] => {
    const order: number[] = [];
    const remaining = new Set(flags.map((_, i) => i));
    let current = start;
    
    // Different strategies for different algorithms
    if (teamId === 'Greedy' || teamId === 'DFS') {
      // Greedy and DFS: Always pick nearest flag
      while (remaining.size > 0) {
        let nearest = -1;
        let nearestDist = Infinity;
        
        for (const i of remaining) {
          const dist = Math.abs(flags[i][0] - current[0]) + Math.abs(flags[i][1] - current[1]);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
          }
        }
        
        if (nearest !== -1) {
          order.push(nearest);
          remaining.delete(nearest);
          current = flags[nearest];
        } else {
          break;
        }
      }
    } else if (teamId === 'AStar' || teamId === 'Dijkstra') {
      // A* and Dijkstra: Consider distance to finish as well
      const finish: [number, number] = track ? track.finish : [TRACK_WIDTH - 2, TRACK_HEIGHT - 2];
      
      while (remaining.size > 0) {
        let best = -1;
        let bestScore = Infinity;
        
        for (const i of remaining) {
          const distToFlag = Math.abs(flags[i][0] - current[0]) + Math.abs(flags[i][1] - current[1]);
          const distToFinish = Math.abs(flags[i][0] - finish[0]) + Math.abs(flags[i][1] - finish[1]);
          const score = distToFlag + distToFinish * 0.3;
          
          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        }
        
        if (best !== -1) {
          order.push(best);
          remaining.delete(best);
          current = flags[best];
        } else {
          break;
        }
      }
    } else {
      // BFS and Bidirectional: Systematic coverage
      const sections = Math.ceil(Math.sqrt(flags.length));
      const sectorFlags: number[][] = Array(sections * sections).fill(null).map(() => []);
      
      flags.forEach((flag, i) => {
        const sx = Math.floor(flag[0] / (TRACK_WIDTH / sections));
        const sy = Math.floor(flag[1] / (TRACK_HEIGHT / sections));
        const sector = sy * sections + sx;
        if (sector < sectorFlags.length) {
          sectorFlags[sector].push(i);
        }
      });
      
      for (const sector of sectorFlags) {
        for (const flagIdx of sector) {
          if (remaining.has(flagIdx)) {
            order.push(flagIdx);
            remaining.delete(flagIdx);
          }
        }
      }
    }
    
    return order;
  };
  
  const calculateOdds = (racer: Racer): string => {
    const score = racer.team.topSpeed * 0.3 + 
                  racer.team.handling * 0.3 + 
                  racer.team.stamina * 0.2 + 
                  racer.telemetry.efficiency * 0.2;
    const odds = Math.max(1.5, 10 - score / 3);
    return `${odds.toFixed(1)}:1`;
  };
  
  const startRace = () => {
    setRaceStatus('starting');
    const modeMessage = raceMode === 'flags' 
      ? "7 flags to collect before the finish!" 
      : "A straight sprint to the checkered flag!";
    
    setCommentary(prev => [...prev, {
      time: raceTime,
      message: `Engines are revving! ${modeMessage}`,
      type: 'exciting'
    }]);
    
    setTimeout(() => {
      setRaceStatus('racing');
      setCommentary(prev => [...prev, {
        time: raceTime,
        message: "AND THEY'RE OFF! The algorithms are racing through the maze!",
        type: 'exciting'
      }]);
    }, 2000);
  };
  
  const animate = useCallback(() => {
    if (raceStatus !== 'racing') return;
    
    setRacers(prevRacers => {
      const updated = prevRacers.map(racer => {
        if (racer.finished) return racer;
        
        // Check for flag collection
        if (raceMode === 'flags' && track) {
          track.flags.forEach((flag, idx) => {
            const dist = Math.abs(racer.position.x - flag[0]) + Math.abs(racer.position.y - flag[1]);
            if (dist < 0.5 && !racer.collectedFlags.has(idx)) {
              racer.collectedFlags.add(idx);
              setCommentary(prev => [...prev, {
                time: raceTime,
                message: `${racer.team.name} collects flag #${idx + 1}! (${racer.collectedFlags.size}/7)`,
                type: 'exciting'
              }]);
            }
          });
          
          // Can only finish after collecting all flags
          if (racer.collectedFlags.size < 7) {
            // Keep racing to collect flags
          } else if (racer.currentTarget >= racer.path.length - 1) {
            if (!racer.finished) {
              setCommentary(prev => [...prev, {
                time: raceTime,
                message: `${racer.team.name} (#${racer.team.number}) completes the challenge!`,
                type: 'exciting'
              }]);
            }
            
            return {
              ...racer,
              finished: true,
              finishTime: raceTime,
              position: {
                x: racer.path[racer.path.length - 1][0],
                y: racer.path[racer.path.length - 1][1]
              }
            };
          }
        } else if (racer.currentTarget >= racer.path.length - 1) {
          // Sprint mode finish
          if (!racer.finished) {
            setCommentary(prev => [...prev, {
              time: raceTime,
              message: `${racer.team.name} (#${racer.team.number}) crosses the finish line!`,
              type: 'exciting'
            }]);
          }
          
          return {
            ...racer,
            finished: true,
            finishTime: raceTime,
            position: {
              x: racer.path[racer.path.length - 1][0],
              y: racer.path[racer.path.length - 1][1]
            }
          };
        }
        
        const speed = racer.team.topSpeed * (racer.fuel / 100) * (racer.tire / 100);
        const nextTarget = Math.min(
          racer.currentTarget + speed * 0.02,
          racer.path.length - 1
        );
        
        const targetIndex = Math.floor(nextTarget);
        const t = nextTarget - targetIndex;
        
        const current = racer.path[targetIndex];
        const next = racer.path[Math.min(targetIndex + 1, racer.path.length - 1)];
        
        const newX = current[0] + (next[0] - current[0]) * t;
        const newY = current[1] + (next[1] - current[1]) * t;
        
        const newTrail = [...racer.trail, { 
          x: racer.position.x, 
          y: racer.position.y, 
          alpha: 1 
        }].slice(-20).map(t => ({ ...t, alpha: t.alpha * 0.95 }));
        
        const newSpeed = Math.sqrt(
          Math.pow(newX - racer.position.x, 2) + 
          Math.pow(newY - racer.position.y, 2)
        ) * 60;
        
        return {
          ...racer,
          position: { x: newX, y: newY },
          currentTarget: nextTarget,
          currentSpeed: newSpeed,
          fuel: Math.max(0, racer.fuel - 0.05),
          tire: Math.max(0, racer.tire - 0.03),
          trail: newTrail,
          totalDistance: racer.totalDistance + newSpeed / 60,
          telemetry: {
            ...racer.telemetry,
            speed: [...racer.telemetry.speed.slice(-50), newSpeed]
          }
        };
      });
      
      if (updated.every(r => r.finished)) {
        setRaceStatus('finished');
        setCommentary(prev => [...prev, {
          time: raceTime,
          message: "The race is complete! What an incredible display of algorithmic racing!",
          type: 'exciting'
        }]);
      }
      
      return updated;
    });
    
    setRaceTime(prev => prev + 16);
  }, [raceStatus, raceTime, raceMode, track]);
  
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);
    
    for (let y = 0; y < TRACK_HEIGHT; y++) {
      for (let x = 0; x < TRACK_WIDTH; x++) {
        const cell = track.getCell(x, y);
        
        if (cell === 1) {
          const gradient = ctx.createLinearGradient(
            x * CELL_SIZE, y * CELL_SIZE,
            x * CELL_SIZE, (y + 1) * CELL_SIZE
          );
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#0f172a');
          ctx.fillStyle = gradient;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 1);
        } else {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          if (x % 2 === 0 && y % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
    
    if (showExploration) {
      racers.forEach(racer => {
        ctx.fillStyle = `${racer.team.color}15`;
        racer.explored.forEach(key => {
          const [x, y] = key.split(',').map(Number);
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
      });
    }
    
    // Draw flags if in flag mode
    if (raceMode === 'flags') {
      track.flags.forEach((flag, idx) => {
        const x = flag[0] * CELL_SIZE + CELL_SIZE/2;
        const y = flag[1] * CELL_SIZE + CELL_SIZE/2;
        
        // Flag glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - CELL_SIZE, y - CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);
        
        // Flag pole
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE * 0.4);
        ctx.lineTo(x, y - CELL_SIZE * 0.4);
        ctx.stroke();
        
        // Flag
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(x, y - CELL_SIZE * 0.4);
        ctx.lineTo(x + CELL_SIZE * 0.4, y - CELL_SIZE * 0.2);
        ctx.lineTo(x + CELL_SIZE * 0.3, y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        
        // Flag number
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), x + CELL_SIZE * 0.2, y - CELL_SIZE * 0.2);
        
        // Check if collected by any racer
        const isCollected = racers.some(r => r.collectedFlags.has(idx));
        if (isCollected) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.fillRect(flag[0] * CELL_SIZE, flag[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    }
    
    ctx.fillStyle = '#10b981';
    ctx.fillRect(track.start[0] * CELL_SIZE, track.start[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', track.start[0] * CELL_SIZE + CELL_SIZE/2, track.start[1] * CELL_SIZE + CELL_SIZE/2);
    
    const fx = track.finish[0] * CELL_SIZE;
    const fy = track.finish[1] * CELL_SIZE;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? 'white' : 'black';
        ctx.fillRect(fx + i * CELL_SIZE/2, fy + j * CELL_SIZE/2, CELL_SIZE/2, CELL_SIZE/2);
      }
    }
    
    if (showTrails) {
      racers.forEach(racer => {
        racer.trail.forEach(point => {
          ctx.fillStyle = `${racer.team.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(
            point.x * CELL_SIZE + CELL_SIZE/2,
            point.y * CELL_SIZE + CELL_SIZE/2,
            CELL_SIZE * 0.15,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    }
    
    racers.forEach(racer => {
      const x = racer.position.x * CELL_SIZE + CELL_SIZE/2;
      const y = racer.position.y * CELL_SIZE + CELL_SIZE/2;
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE * 0.5);
      glow.addColorStop(0, `${racer.team.color}40`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - CELL_SIZE, y - CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);
      
      ctx.save();
      ctx.translate(x, y);
      
      if (racer.currentTarget > 0 && racer.currentTarget < racer.path.length - 1) {
        const prev = racer.path[Math.floor(racer.currentTarget)];
        const next = racer.path[Math.ceil(racer.currentTarget)];
        const angle = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
        ctx.rotate(angle);
      }
      
      ctx.fillStyle = racer.team.color;
      ctx.fillRect(-CELL_SIZE * 0.4, -CELL_SIZE * 0.2, CELL_SIZE * 0.8, CELL_SIZE * 0.4);
      
      ctx.fillStyle = racer.team.accentColor;
      ctx.fillRect(-CELL_SIZE * 0.35, -CELL_SIZE * 0.05, CELL_SIZE * 0.7, CELL_SIZE * 0.1);
      
      ctx.restore();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(racer.team.number.toString(), x, y);
      
      if (racer.finished) {
        ctx.font = '12px sans-serif';
        ctx.fillText('🏁', x, y - CELL_SIZE);
      }
      
      // Show flag count in flag mode
      if (raceMode === 'flags' && racer.collectedFlags.size > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${racer.collectedFlags.size}/7`, x, y - CELL_SIZE * 0.7);
      }
    });
    
    if (raceStatus === 'starting') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);
      
      const lights = 3 - Math.floor((Date.now() % 3000) / 1000);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < lights ? '#ef4444' : '#374151';
        ctx.beginPath();
        ctx.arc(VIEWPORT_W/2 + (i - 1) * 40, VIEWPORT_H/2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [track, racers, showExploration, showTrails, raceStatus, raceMode]);
  
  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      animate();
      render();
      frameId = requestAnimationFrame(loop);
    };
    
    if (raceStatus === 'racing') {
      loop();
    } else {
      render();
    }
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [raceStatus, animate, render]);
  
  useEffect(() => {
    initializeRace();
  }, [initializeRace]);
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BroadcastBadge>
            <Radio size={24} />
            <Title>Algorithm Derby Live</Title>
            <RoundBadge>Maze Circuit • Round 1</RoundBadge>
          </BroadcastBadge>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: 'none', 
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <TimeDisplay>{formatTime(raceTime)}</TimeDisplay>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContainer>
        <GridLayout>
          <Panel $variant="left">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #475569 0%, #334155 100%)">
                <Users size={16} />
                Racing Teams
              </CardHeader>
              <CardContent>
                {Object.values(RACING_TEAMS).map(team => (
                  <TeamSelector
                    key={team.id}
                    $selected={selectedTeams.includes(team.id)}
                    $teamColor={team.color}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeams([...selectedTeams, team.id]);
                        } else {
                          setSelectedTeams(selectedTeams.filter(t => t !== team.id));
                        }
                        setTimeout(initializeRace, 0);
                      }}
                    />
                    <TeamBadge $color={team.color}>{team.number}</TeamBadge>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{team.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{team.stable}</div>
                    </div>
                  </TeamSelector>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #d97706 0%, #b45309 100%)">
                <DollarSign size={16} />
                Betting Odds
              </CardHeader>
              <CardContent>
                {bettingOdds.map(odds => {
                  const team = RACING_TEAMS[odds.team];
                  return (
                    <OddsItem key={odds.team} $teamColor={team.color}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          backgroundColor: team.color 
                        }} />
                        <span style={{ fontSize: '0.875rem' }}>{team.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <OddsValue>{odds.odds}</OddsValue>
                        {odds.movement === 'up' && <TrendingUp size={14} style={{ color: '#10b981' }} />}
                      </div>
                    </OddsItem>
                  );
                })}
              </CardContent>
            </Card>
          </Panel>
          
          <Panel $variant="center">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)">
                <Gamepad2 size={16} />
                Race Mode
                <div style={{ marginLeft: 'auto' }}>
                  <ModeSelector>
                    <ModeButton 
                      $active={raceMode === 'sprint'}
                      onClick={() => {
                        setRaceMode('sprint');
                        setTimeout(initializeRace, 0);
                      }}
                    >
                      <Zap size={14} />
                      Sprint
                    </ModeButton>
                    <ModeButton 
                      $active={raceMode === 'flags'}
                      onClick={() => {
                        setRaceMode('flags');
                        setTimeout(initializeRace, 0);
                      }}
                    >
                      <Flag size={14} />
                      Flag Hunt
                    </ModeButton>
                  </ModeSelector>
                </div>
              </CardHeader>
              <CardContent>
                <TrackCanvas
                  ref={canvasRef}
                  width={VIEWPORT_W}
                  height={VIEWPORT_H}
                />
                
                <ControlsBar>
                  <Button
                    onClick={() => raceStatus === 'preparing' ? startRace() : setRaceStatus('preparing')}
                    disabled={raceStatus === 'starting'}
                    $variant={raceStatus === 'racing' ? 'danger' : 'primary'}
                  >
                    {raceStatus === 'racing' ? (
                      <>
                        <Pause size={16} />
                        Pause Race
                      </>
                    ) : raceStatus === 'starting' ? (
                      <>
                        <Zap size={16} />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start Race
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={initializeRace}
                    $variant="secondary"
                  >
                    <RotateCcw size={16} />
                    New Track
                  </Button>
                </ControlsBar>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)">
                <Radio size={16} />
                Race Commentary
              </CardHeader>
              <CardContent>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {commentary.slice(-5).reverse().map((comment, i) => (
                    <Commentary key={i} $type={comment.type}>
                      <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                        [{formatTime(comment.time)}]
                      </span>{' '}
                      {comment.message}
                    </Commentary>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Panel>
          
          <Panel $variant="right">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #f59e0b 0%, #d97706 100%)">
                <Trophy size={16} />
                Race Standings
              </CardHeader>
              <CardContent>
                {racers
                  .sort((a, b) => {
                    if (a.finished && !b.finished) return -1;
                    if (!a.finished && b.finished) return 1;
                    if (a.finished && b.finished) return a.finishTime - b.finishTime;
                    
                    if (raceMode === 'flags') {
                      const flagDiff = b.collectedFlags.size - a.collectedFlags.size;
                      if (flagDiff !== 0) return flagDiff;
                    }
                    
                    return b.currentTarget - a.currentTarget;
                  })
                  .map((racer, position) => (
                    <LeaderboardItem
                      key={racer.team.id}
                      $position={position}
                      $teamColor={racer.team.color}
                    >
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, width: '32px' }}>
                        {position === 0 && racer.finished ? '🏆' : `${position + 1}.`}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            backgroundColor: racer.team.color 
                          }} />
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            #{racer.team.number}
                          </span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            {racer.team.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                          {racer.finished 
                            ? `Finished: ${formatTime(racer.finishTime)}`
                            : `Progress: ${Math.round((racer.currentTarget / Math.max(1, racer.path.length - 1)) * 100)}%`
                          }
                        </div>
                        {raceMode === 'flags' && (
                          <FlagCounter>
                            {[...Array(7)].map((_, i) => (
                              <FlagIcon key={i} $collected={racer.collectedFlags.has(i)}>
                                {racer.collectedFlags.has(i) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              </FlagIcon>
                            ))}
                          </FlagCounter>
                        )}
                      </div>
                    </LeaderboardItem>
                  ))}
              </CardContent>
            </Card>
            
            {showTelemetry && (
              <Card>
                <CardHeader $color="linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)">
                  <Gauge size={16} />
                  Live Telemetry
                </CardHeader>
                <CardContent>
                  {racers.slice(0, 3).map(racer => (
                    <div key={racer.team.id} style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '0.5rem' 
                      }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          color: racer.team.color 
                        }}>
                          {racer.team.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                          {racer.currentSpeed.toFixed(1)} m/s
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '40px' }}>Fuel</span>
                          <TelemetryBar>
                            <TelemetryFill $percentage={racer.fuel} $color="#10b981" />
                          </TelemetryBar>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '40px' }}>Tire</span>
                          <TelemetryBar>
                            <TelemetryFill $percentage={racer.tire} $color="#f59e0b" />
                          </TelemetryBar>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #64748b 0%, #475569 100%)">
                <Settings size={16} />
                View Options
              </CardHeader>
              <CardContent>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showExploration}
                    onChange={(e) => setShowExploration(e.target.checked)}
                  />
                  <Eye size={16} />
                  <span>Show Exploration</span>
                </ToggleSwitch>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showTrails}
                    onChange={(e) => setShowTrails(e.target.checked)}
                  />
                  <Sparkles size={16} />
                  <span>Show Trails</span>
                </ToggleSwitch>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showTelemetry}
                    onChange={(e) => setShowTelemetry(e.target.checked)}
                  />
                  <Activity size={16} />
                  <span>Show Telemetry</span>
                </ToggleSwitch>
              </CardContent>
            </Card>
          </Panel>
        </GridLayout>
      </MainContainer>
    </PageContainer>
  );
}