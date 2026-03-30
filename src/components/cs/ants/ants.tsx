'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Sparkles, Map as MapIcon, TrendingUp, Brain, Circle, Grid3x3, Shuffle, Eye, EyeOff, Trophy, X } from 'lucide-react';
import styled, { createGlobalStyle } from 'styled-components';

// Color palette matching Permutations
const COLORS = {
  bg1: '#0a0e1a',
  bg2: '#1a1a2e',
  surface: 'rgba(0,0,0,0.5)',
  textPrimary: '#e6eef8',
  textMuted: '#dee5efff',
  accent: '#3b82f6',
  accentSoft: '#60a5fa',
  purple: '#d5c7f5ff',
  success: '#22c55e',
  warn: '#fbbf24',
  danger: '#ef4444',
  borderAccent: 'rgba(59, 130, 246, 0.15)'
};

// Types
type AlgorithmType = 'greedy' | 'twoOpt' | 'annealing' | 'genetic' | 'antColony' | 'bmssp';
type CityMode = 'random' | 'circle' | 'grid' | 'clusters' | 'spiral';

interface City {
  x: number;
  y: number;
  id: number;
}

interface BMSSPState {
  pivots: Set<number>;
  distances: number[][];
  phase: 'exploration' | 'refinement';
  iteration: number;
  W: Set<number>;
}

interface Algorithm {
  id: AlgorithmType;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  tour: number[];
  distance: number;
  bestDistance: number;
  iterations: number;
  improvements: number;
  status: 'idle' | 'running' | 'finished' | 'winner';
  description: string;
  funFact: string;
  temperature?: number;
  particles?: Particle[];
  history?: number[];
  improvementRate?: number;
  lastImprovement?: number;
  bmsspState?: BMSSPState;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface TSPAlgorithmRaceProps {
  isRunning?: boolean;
  speed?: number;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

// ==================== OVERLAY STYLES (same pattern as shortestPath) ====================
const AntOverlayStyles = createGlobalStyle`
  .ant-root {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    max-height: 70vh;
    background: #0a0e1a;
    border-radius: 12px;
    overflow: hidden;
    user-select: none;
  }
  .ant-canvas {
    position: absolute; inset: 0; width: 100%; height: 100%;
    cursor: grab; touch-action: none; display: block;
  }
  .ant-canvas:active { cursor: grabbing; }

  .ant-chips { position: absolute; top: 0.75rem; left: 0.75rem; z-index: 50;
    display: flex; flex-wrap: wrap; gap: 0.3rem; max-width: calc(100% - 5rem); }
  .ant-chip { display: flex; align-items: center; gap: 0.3rem; padding: 0.28rem 0.6rem;
    border-radius: 999px; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.62); color: rgba(255,255,255,0.65);
    font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
    backdrop-filter: blur(8px); font-family: inherit; white-space: nowrap; }
  .ant-chip:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .ant-chip.active { border-color: var(--chip-color, #3b82f6);
    background: color-mix(in srgb, var(--chip-color, #3b82f6) 20%, rgba(0,0,0,0.6)); color: #fff; }

  .ant-top-right { position: absolute; top: 0.75rem; right: 0.75rem; z-index: 50; display: flex; gap: 0.3rem; }
  .ant-icon-btn { width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.62);
    color: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center;
    cursor: pointer; backdrop-filter: blur(8px); transition: all 0.15s; }
  .ant-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .ant-icon-btn.active { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.5); color: #3b82f6; }

  .ant-hud { position: absolute; top: 3rem; right: 0.75rem; z-index: 40;
    min-width: 145px; background: rgba(5,8,18,0.82); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
    padding: 0.6rem 0.75rem; font-size: 0.73rem; color: rgba(255,255,255,0.55); }
  .ant-hud-title { font-weight: 700; font-size: 0.78rem; color: #e2e8f0;
    margin-bottom: 0.45rem; display: flex; align-items: center; gap: 0.3rem; }
  .ant-hud-row { display: flex; justify-content: space-between; align-items: center;
    padding: 0.13rem 0; gap: 0.6rem; }
  .ant-hud-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 0.3rem 0; }

  .ant-bar { position: absolute; bottom: 0.75rem; left: 50%; transform: translateX(-50%);
    z-index: 50; display: flex; align-items: center; gap: 0.25rem;
    background: rgba(4,7,16,0.84); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 999px;
    padding: 0.35rem 0.55rem; white-space: nowrap; }
  .ant-bar-btn { display: flex; align-items: center; gap: 0.28rem;
    padding: 0.28rem 0.6rem; border-radius: 999px; border: 1px solid transparent;
    background: transparent; color: rgba(255,255,255,0.55); font-size: 0.72rem;
    font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
  .ant-bar-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .ant-bar-btn.primary { background: #3b82f6; color: #fff; border-color: rgba(59,130,246,0.4); }
  .ant-bar-btn.primary:hover { background: #2563eb; }
  .ant-bar-btn.danger { background: rgba(239,68,68,0.18); color: #f87171; border-color: rgba(239,68,68,0.25); }
  .ant-bar-btn.active { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.35); color: #a5b4fc; }
  .ant-bar-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 0.1rem; flex-shrink: 0; }
  .ant-speed-ctrl { display: flex; align-items: center; gap: 0.3rem; }
  .ant-slider { width: 56px; height: 4px; cursor: pointer; accent-color: #3b82f6; }
  .ant-speed-label { color: rgba(255,255,255,0.45); font-size: 0.68rem; font-family: monospace; min-width: 1.6rem; text-align: right; }

  .ant-panel { position: absolute; bottom: 3.5rem; left: 0.75rem; z-index: 60;
    width: clamp(220px, 32vw, 380px); background: rgba(6,10,22,0.93);
    backdrop-filter: blur(20px); border: 1px solid rgba(59,130,246,0.18);
    border-radius: 12px; overflow: hidden; }
  .ant-panel-header { display: flex; align-items: center; gap: 0.45rem;
    padding: 0.65rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-weight: 700; font-size: 0.82rem; color: #e2e8f0; }
  .ant-panel-close { margin-left: auto; background: transparent; border: none;
    color: rgba(255,255,255,0.35); cursor: pointer; padding: 0.2rem; border-radius: 4px;
    display: flex; align-items: center; transition: all 0.15s; }
  .ant-panel-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .ant-panel-body { padding: 0.6rem 0.85rem; max-height: 48vh; overflow-y: auto; overflow-x: hidden; }
  .ant-panel-body::-webkit-scrollbar { width: 3px; }
  .ant-panel-body::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.4); border-radius: 2px; }

  .ant-city-ctrl { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; }
  .ant-city-ctrl span { font-size: 0.72rem; color: rgba(255,255,255,0.5); font-family: monospace; }
  .ant-city-slider { width: 80px; height: 4px; cursor: pointer; accent-color: #3b82f6; }
`;

// Styled components for algorithm panel (reused in popup)
const AlgoCheckbox = styled.label<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${({ $active, $color }) =>
    $active ? `${$color}15` : 'rgba(0,0,0,0.3)'};
  border: 1px solid ${({ $active, $color }) =>
    $active ? $color : COLORS.borderAccent};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;

  &:hover {
    background: ${({ $color }) => `${$color}20`};
    transform: translateX(4px);
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: ${({ $color }) => $color};
  }
`;

const AlgoEmoji = styled.span`
  font-size: 1.75rem;
  line-height: 1;
`;

const AlgoDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const AlgoName = styled.div<{ $color: string; $active: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $color, $active }) => $active ? $color : COLORS.textMuted};
`;

const AlgoDescription = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  opacity: 0.8;
`;

// Constants
const CANVAS_BASE_WIDTH = 800;
const CANVAS_BASE_HEIGHT = 800;

const algorithmConfigs = {
  greedy: {
    name: 'Greedy',
    emoji: '🏃',
    color: '#3b82f6',
    glow: '#60a5fa',
    description: 'Fast & furious, picks nearest city',
    funFact: 'O(n²) complexity - Quick but not optimal'
  },
  twoOpt: {
    name: '2-Opt',
    emoji: '✂️',
    color: '#06b6d4',
    glow: '#22d3ee',
    description: 'The perfectionist, keeps tweaking',
    funFact: 'Improves by swapping edge pairs'
  },
  annealing: {
    name: 'Simulated Annealing',
    emoji: '🔥',
    color: '#f59e0b',
    glow: '#fbbf24',
    description: 'Hot-headed but cools down',
    funFact: 'Escapes local minima with probability'
  },
  genetic: {
    name: 'Genetic',
    emoji: '🧬',
    color: '#8b5cf6',
    glow: '#a78bfa',
    description: 'Darwin\'s favorite algorithm',
    funFact: 'Evolves solutions through generations'
  },
  antColony: {
    name: 'Ant Colony',
    emoji: '🐜',
    color: '#10b981',
    glow: '#34d399',
    description: 'Follow the pheromone highway',
    funFact: 'Inspired by real ant behavior'
  },
  bmssp: {
    name: 'BMSSP Multi-Source',
    emoji: '🌊',
    color: '#ec4899',
    glow: '#f472b6',
    description: 'Wave expansion from pivots',
    funFact: 'Multi-source shortest path adaptation'
  }
};

// TSP Algorithms
class TSP {
  static distance(cities: City[], tour: number[]): number {
    let d = 0;
    for (let i = 0; i < tour.length; i++) {
      const a = cities[tour[i]];
      const b = cities[tour[(i + 1) % tour.length]];
      d += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return d;
  }

  static greedy(cities: City[]): number[] {
    const n = cities.length;
    const unvisited = new Set(Array.from({length: n}, (_, i) => i));
    const path = [0];
    unvisited.delete(0);
    
    while (unvisited.size > 0) {
      const current = path[path.length - 1];
      let nearest = -1;
      let minDist = Infinity;
      
      for (const city of unvisited) {
        const d = Math.hypot(cities[city].x - cities[current].x, cities[city].y - cities[current].y);
        if (d < minDist) {
          minDist = d;
          nearest = city;
        }
      }
      
      if (nearest !== -1) {
        path.push(nearest);
        unvisited.delete(nearest);
      }
    }
    
    return path;
  }

  static twoOpt(cities: City[], tour: number[]): { path: number[], improved: boolean } {
    const newTour = [...tour];
    const n = tour.length;
    
    for (let i = 1; i < n - 2; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j - i === 1) continue;
        
        const candidate = [...newTour];
        for (let k = 0; k < (j - i) / 2; k++) {
          [candidate[i + k], candidate[j - k - 1]] = [candidate[j - k - 1], candidate[i + k]];
        }
        
        if (this.distance(cities, candidate) < this.distance(cities, newTour)) {
          return { path: candidate, improved: true };
        }
      }
    }
    
    return { path: newTour, improved: false };
  }

  static simulatedAnnealing(cities: City[], tour: number[], temp: number): { path: number[], accepted: boolean } {
    const newTour = [...tour];
    const n = tour.length;
    
    const i = 1 + Math.floor(Math.random() * (n - 2));
    const j = 1 + Math.floor(Math.random() * (n - 2));
    
    if (i !== j) {
      [newTour[i], newTour[j]] = [newTour[j], newTour[i]];
      
      const delta = this.distance(cities, newTour) - this.distance(cities, tour);
      if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
        return { path: newTour, accepted: true };
      }
    }
    
    return { path: tour, accepted: false };
  }

  static genetic(cities: City[], population: number[][]): { best: number[], population: number[][] } {
    if (population.length === 0) {
      const pop: number[][] = [];
      for (let i = 0; i < 20; i++) {
        const tour = Array.from({length: cities.length}, (_, i) => i);
        for (let j = tour.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [tour[j], tour[k]] = [tour[k], tour[j]];
        }
        pop.push(tour);
      }
      population = pop;
    }

    const sorted = [...population].sort((a, b) => 
      this.distance(cities, a) - this.distance(cities, b)
    );
    
    const newPop: number[][] = sorted.slice(0, 5);
    
    while (newPop.length < 20) {
      const parent1 = sorted[Math.floor(Math.random() * 10)];
      const parent2 = sorted[Math.floor(Math.random() * 10)];
      
      const start = Math.floor(Math.random() * parent1.length);
      const end = Math.floor(Math.random() * parent1.length);
      const child = new Array(parent1.length).fill(-1);
      
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        child[i] = parent1[i];
      }
      
      let ptr = 0;
      for (const city of parent2) {
        if (!child.includes(city)) {
          while (child[ptr] !== -1) ptr++;
          child[ptr] = city;
        }
      }
      
      if (Math.random() < 0.1) {
        const i = Math.floor(Math.random() * child.length);
        const j = Math.floor(Math.random() * child.length);
        [child[i], child[j]] = [child[j], child[i]];
      }
      
      newPop.push(child);
    }
    
    return { best: sorted[0], population: newPop };
  }

  static antColony(cities: City[], pheromones: number[][], ants: number = 10): { best: number[], pheromones: number[][] } {
    const n = cities.length;
    
    if (!pheromones || pheromones.length === 0) {
      pheromones = Array(n).fill(null).map(() => Array(n).fill(1));
    }
    
    const tours: number[][] = [];
    
    for (let ant = 0; ant < ants; ant++) {
      const tour: number[] = [];
      const unvisited = new Set(Array.from({length: n}, (_, i) => i));
      
      let current = Math.floor(Math.random() * n);
      tour.push(current);
      unvisited.delete(current);
      
      while (unvisited.size > 0) {
        const probabilities: [number, number][] = [];
        let sum = 0;
        
        for (const next of unvisited) {
          const distance = Math.hypot(cities[next].x - cities[current].x, cities[next].y - cities[current].y);
          const pheromone = pheromones[current][next];
          const probability = Math.pow(pheromone, 1) * Math.pow(1 / distance, 2);
          probabilities.push([next, probability]);
          sum += probability;
        }
        
        let random = Math.random() * sum;
        let chosen = probabilities[0][0];
        
        for (const [city, prob] of probabilities) {
          random -= prob;
          if (random <= 0) {
            chosen = city;
            break;
          }
        }
        
        tour.push(chosen);
        unvisited.delete(chosen);
        current = chosen;
      }
      
      tours.push(tour);
    }
    
    const evaporation = 0.1;
    const newPheromones = pheromones.map(row => row.map(p => p * (1 - evaporation)));
    
    for (const tour of tours) {
      const distance = this.distance(cities, tour);
      const deposit = 100 / distance;
      
      for (let i = 0; i < tour.length; i++) {
        const from = tour[i];
        const to = tour[(i + 1) % tour.length];
        newPheromones[from][to] += deposit;
        newPheromones[to][from] += deposit;
      }
    }
    
    const bestTour = tours.reduce((best, tour) => 
      this.distance(cities, tour) < this.distance(cities, best) ? tour : best
    );
    
    return { best: bestTour, pheromones: newPheromones };
  }

  static bmssp(cities: City[], state?: BMSSPState): { path: number[], improved: boolean, state: BMSSPState } {
    const n = cities.length;
    
    if (!state) {
      const k = Math.max(3, Math.ceil(Math.sqrt(n)));
      const pivots = new Set<number>();
      
      for (let i = 0; i < k; i++) {
        pivots.add(Math.floor(i * n / k));
      }
      
      const distances: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            distances[i][j] = 0;
          } else {
            distances[i][j] = Math.hypot(cities[i].x - cities[j].x, cities[i].y - cities[j].y);
          }
        }
      }
      
      state = {
        pivots,
        distances,
        phase: 'exploration',
        iteration: 0,
        W: new Set(pivots)
      };
    }

    if (state.phase === 'exploration') {
      const visited = new Set<number>();
      const tour: number[] = [];
      
      const bd: Map<number, number> = new Map();
      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        for (const pivot of state.pivots) {
          minDist = Math.min(minDist, state.distances[i][pivot]);
        }
        bd.set(i, minDist);
      }
      
      const sortedCities = Array.from(bd.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([city]) => city);
      
      let current = sortedCities[0];
      tour.push(current);
      visited.add(current);
      
      while (visited.size < n) {
        let bestNext = -1;
        let bestScore = -Infinity;
        
        for (let i = 0; i < n; i++) {
          if (visited.has(i)) continue;
          
          const dist = state.distances[current][i];
          const boundary = bd.get(i) || Infinity;
          const isPivot = state.pivots.has(i) ? 3 : 1;
          const inW = state.W.has(i) ? 1.5 : 1;
          
          const score = (isPivot * inW) / (dist + 1) / (boundary + 1);
          
          if (score > bestScore) {
            bestScore = score;
            bestNext = i;
          }
        }
        
        if (bestNext !== -1) {
          tour.push(bestNext);
          visited.add(bestNext);
          current = bestNext;
          
          if (bd.get(bestNext)! < 50) {
            state.W.add(bestNext);
          }
        } else {
          break;
        }
      }
      
      for (let i = 0; i < n; i++) {
        if (!visited.has(i)) {
          tour.push(i);
        }
      }
      
      state.iteration++;
      
      if (state.iteration > 15 || state.W.size > n * 0.6) {
        state.phase = 'refinement';
      }
      
      return { path: tour, improved: true, state };
      
    } else {
      const currentTour = TSP.greedy(cities);
      const refinedResult = TSP.twoOpt(cities, currentTour);
      
      return {
        path: refinedResult.path,
        improved: refinedResult.improved,
        state
      };
    }
  }
}

const generateCities = (count: number, mode: CityMode, canvasWidth: number, canvasHeight: number): City[] => {
  const cities: City[] = [];
  const margin = 60;
  
  switch (mode) {
    case 'circle':
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(canvasWidth, canvasHeight) / 2 - margin * 2;
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        cities.push({
          id: i,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      break;
      
    case 'grid':
      const cols = Math.ceil(Math.sqrt(count * (canvasWidth / canvasHeight)));
      const rows = Math.ceil(count / cols);
      const spacingX = (canvasWidth - 2 * margin) / Math.max(1, cols - 1);
      const spacingY = (canvasHeight - 2 * margin) / Math.max(1, rows - 1);
      
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        cities.push({
          id: i,
          x: margin + col * spacingX,
          y: margin + row * spacingY
        });
      }
      break;
      
    case 'clusters':
      const numClusters = Math.max(3, Math.floor(count / 5));
      const clusters: { x: number, y: number }[] = [];
      
      for (let i = 0; i < numClusters; i++) {
        clusters.push({
          x: margin * 2 + Math.random() * (canvasWidth - margin * 4),
          y: margin * 2 + Math.random() * (canvasHeight - margin * 4)
        });
      }
      
      for (let i = 0; i < count; i++) {
        const cluster = clusters[i % numClusters];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 80;
        cities.push({
          id: i,
          x: Math.max(margin, Math.min(canvasWidth - margin, cluster.x + Math.cos(angle) * dist)),
          y: Math.max(margin, Math.min(canvasHeight - margin, cluster.y + Math.sin(angle) * dist))
        });
      }
      break;
      
    case 'spiral':
      const spiralCenterX = canvasWidth / 2;
      const spiralCenterY = canvasHeight / 2;
      const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - margin;
      
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = t * Math.PI * 6;
        const r = t * maxRadius;
        cities.push({
          id: i,
          x: spiralCenterX + Math.cos(angle) * r,
          y: spiralCenterY + Math.sin(angle) * r
        });
      }
      break;
      
    default:
      for (let i = 0; i < count; i++) {
        cities.push({
          id: i,
          x: margin + Math.random() * (canvasWidth - 2 * margin),
          y: margin + Math.random() * (canvasHeight - 2 * margin)
        });
      }
  }
  
  return cities;
};

export default function TSPAlgorithmRace({ isRunning = false, speed = 1 }: TSPAlgorithmRaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(isRunning);
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [cities, setCities] = useState<City[]>([]);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>(['greedy', 'twoOpt', 'annealing']);
  const [cityCount, setCityCount] = useState(12);
  const [cityMode, setCityMode] = useState<CityMode>('random');
  const [showTrails, setShowTrails] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [activePanel, setActivePanel] = useState<'algorithms' | 'city' | 'none'>('none');
  
  const frameRef = useRef<number>(0);
  const tempRef = useRef(100);
  const populationRef = useRef<Record<string, number[][]>>({});
  const pheromonesRef = useRef<number[][]>([]);
  const timeRef = useRef(0);
  const trailsRef = useRef(new Map<string, TrailPoint[]>());

  useEffect(() => {
    setIsPlaying(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setLocalSpeed(speed);
  }, [speed]);

  const initializeSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width / (window.devicePixelRatio || 1) : CANVAS_BASE_WIDTH;
    const height = canvas ? canvas.height / (window.devicePixelRatio || 1) : CANVAS_BASE_HEIGHT;
    
    const newCities = generateCities(cityCount, cityMode, width, height);
    setCities(newCities);
    
    tempRef.current = 100;
    populationRef.current = {};
    pheromonesRef.current = [];
    timeRef.current = 0;
    trailsRef.current.clear();
    setWinner(null);
    
    const algos: Algorithm[] = [];
    
    for (const [id, config] of Object.entries(algorithmConfigs)) {
      if (selectedAlgos.includes(id as AlgorithmType)) {
        const initialTour = TSP.greedy(newCities);
        algos.push({
          id: id as AlgorithmType,
          ...config,
          tour: initialTour,
          distance: TSP.distance(newCities, initialTour),
          bestDistance: TSP.distance(newCities, initialTour),
          iterations: 0,
          improvements: 0,
          status: 'idle',
          particles: [],
          history: [],
          improvementRate: 0,
          lastImprovement: 0
        });
      }
    }
    
    setAlgorithms(algos);
  }, [cityCount, cityMode, selectedAlgos]);

  const updateAlgorithms = useCallback(() => {
    if (cities.length === 0) return;
    
    setAlgorithms(prev => {
      const updated = prev.map(algo => {
        if (algo.status !== 'running') return algo;
        
        let newTour = algo.tour;
        let improved = false;
        
        switch (algo.id) {
          case 'greedy':
            if (algo.iterations === 0) {
              return { ...algo, status: 'finished' as const, iterations: 1 };
            }
            break;
            
          case 'twoOpt':
            const twoOptResult = TSP.twoOpt(cities, algo.tour);
            newTour = twoOptResult.path;
            improved = twoOptResult.improved;
            
            if (!improved && algo.iterations > 10) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;
            
          case 'annealing':
            const annealingResult = TSP.simulatedAnnealing(cities, algo.tour, tempRef.current);
            newTour = annealingResult.path;
            improved = annealingResult.accepted;
            tempRef.current *= 0.995;
            
            if (tempRef.current < 0.1) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1, temperature: tempRef.current };
            }
            break;
            
          case 'genetic':
            const population = populationRef.current[algo.id] || [];
            const geneticResult = TSP.genetic(cities, population);
            populationRef.current[algo.id] = geneticResult.population;
            newTour = geneticResult.best;
            improved = TSP.distance(cities, newTour) < algo.bestDistance;
            
            if (algo.iterations > 50) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;
            
          case 'antColony':
            const antResult = TSP.antColony(cities, pheromonesRef.current, 10);
            pheromonesRef.current = antResult.pheromones;
            newTour = antResult.best;
            improved = TSP.distance(cities, newTour) < algo.bestDistance;
            
            if (algo.iterations > 30) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1 };
            }
            break;

          case 'bmssp':
            const bmsspResult = TSP.bmssp(cities, algo.bmsspState);
            newTour = bmsspResult.path;
            improved = bmsspResult.improved;
            
            if (algo.iterations > 40) {
              return { ...algo, status: 'finished' as const, iterations: algo.iterations + 1, bmsspState: bmsspResult.state };
            }
            
            return {
              ...algo,
              tour: newTour,
              distance: TSP.distance(cities, newTour),
              bestDistance: Math.min(algo.bestDistance, TSP.distance(cities, newTour)),
              iterations: algo.iterations + 1,
              improvements: improved ? algo.improvements + 1 : algo.improvements,
              bmsspState: bmsspResult.state,
              particles: algo.particles,
              history: [...(algo.history || []), TSP.distance(cities, newTour)].slice(-50),
              improvementRate: improved ? ((algo.bestDistance - TSP.distance(cities, newTour)) / algo.bestDistance * 100) : algo.improvementRate,
              lastImprovement: improved ? algo.iterations : algo.lastImprovement
            };
        }
        
        const newDistance = TSP.distance(cities, newTour);
        
        const history = [...(algo.history || []), newDistance];
        if (history.length > 50) history.shift();
        
        const improvementRate = improved ? 
          ((algo.bestDistance - newDistance) / algo.bestDistance * 100) : 
          algo.improvementRate || 0;
        
        let particles = algo.particles || [];
        if (improved && newDistance < algo.bestDistance) {
          const cityIdx = newTour[Math.floor(Math.random() * newTour.length)];
          const city = cities[cityIdx];
          for (let i = 0; i < 5; i++) {
            particles.push({
              x: city.x,
              y: city.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 1,
              color: algo.glow
            });
          }
        }
        
        particles = particles
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02 }))
          .filter(p => p.life > 0);
        
        return {
          ...algo,
          tour: newTour,
          distance: newDistance,
          bestDistance: Math.min(algo.bestDistance, newDistance),
          iterations: algo.iterations + 1,
          improvements: improved ? algo.improvements + 1 : algo.improvements,
          temperature: algo.id === 'annealing' ? tempRef.current : algo.temperature,
          particles,
          history,
          improvementRate: improved ? improvementRate : algo.improvementRate,
          lastImprovement: improved ? algo.iterations : algo.lastImprovement
        };
      });
      
      if (updated.every(a => a.status === 'finished') && !winner) {
        const champion = updated.reduce((best, current) => 
          current.bestDistance < best.bestDistance ? current : best
        );
        setWinner(champion.id);
        updated.forEach(a => {
          if (a.id === champion.id) a.status = 'winner';
        });
      }
      
      return updated;
    });
  }, [cities, winner]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.fillStyle = COLORS.bg1;
    ctx.fillRect(0, 0, width, height);
    
    const gridSize = 30;
    const gridOffset = (timeRef.current * 0.05) % gridSize;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 0.5;
    
    for (let x = -gridOffset; x <= width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = -gridOffset; y <= height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    const antAlgo = algorithms.find(a => a.id === 'antColony');
    if (antAlgo && pheromonesRef.current.length > 0 && showTrails) {
      const maxPheromone = Math.max(...pheromonesRef.current.flat());
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
          const intensity = pheromonesRef.current[i]?.[j] / maxPheromone || 0;
          if (intensity > 0.1) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${intensity * 0.3})`;
            ctx.lineWidth = intensity * 3;
            ctx.beginPath();
            ctx.moveTo(cities[i].x, cities[i].y);
            ctx.lineTo(cities[j].x, cities[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    algorithms.forEach((algo) => {
      if (algo.tour.length === 0) return;
      
      if (showTrails) {
        const trail = trailsRef.current.get(algo.id) || [];
        trail.forEach((point: TrailPoint) => {
          ctx.fillStyle = `${algo.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fill();
          point.alpha *= 0.98;
        });
        
        if (trail.length > 100) trail.shift();
      }
      
      ctx.strokeStyle = algo.color;
      ctx.lineWidth = algo.status === 'winner' ? 4 : 2;
      ctx.shadowColor = algo.glow;
      ctx.shadowBlur = algo.status === 'winner' ? 20 : 10;
      
      ctx.beginPath();
      for (let i = 0; i <= algo.tour.length; i++) {
        const cityIdx = algo.tour[i % algo.tour.length];
        const city = cities[cityIdx];
        if (i === 0) {
          ctx.moveTo(city.x, city.y);
        } else {
          ctx.lineTo(city.x, city.y);
        }
        
        if (showTrails && i > 0 && Math.random() < 0.1) {
          let trail = trailsRef.current.get(algo.id);
          if (!trail) {
            trail = [];
            trailsRef.current.set(algo.id, trail);
          }
          trail.push({ x: city.x, y: city.y, alpha: 0.5 });
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      algo.particles?.forEach(p => {
        ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    cities.forEach((city) => {
      const gradient = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, 25);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(city.x - 25, city.y - 25, 50, 50);
      
      ctx.fillStyle = COLORS.accent;
      ctx.strokeStyle = COLORS.bg1;
      ctx.lineWidth = 2;
      ctx.shadowColor = COLORS.accentSoft;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(city.x, city.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(city.id.toString(), city.x, city.y);
    });
    
    timeRef.current++;
  }, [cities, algorithms, showTrails]);

  useEffect(() => {
    const animate = () => {
      for (let i = 0; i < localSpeed; i++) {
        updateAlgorithms();
      }
      render();
      
      if (isPlaying) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (isPlaying) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      render();
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, localSpeed, updateAlgorithms, render]);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  const handlePlay = () => {
    if (!isPlaying) {
      setAlgorithms(prev => prev.map(a => ({ ...a, status: 'running' })));
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    initializeSimulation();
  };

  const winnerAlgo = algorithms.find(a => a.id === winner);

  const cityModeIcons: Record<CityMode, { icon: React.ReactElement; label: string }> = {
    random: { icon: <Sparkles size={13} />, label: 'Random' },
    circle: { icon: <Circle size={13} />, label: 'Circle' },
    grid: { icon: <Grid3x3 size={13} />, label: 'Grid' },
    clusters: { icon: <MapIcon size={13} />, label: 'Clusters' },
    spiral: { icon: <TrendingUp size={13} />, label: 'Spiral' },
  };

  const sorted = [...algorithms].sort((a, b) => a.bestDistance - b.bestDistance);

  return (
    <>
      <AntOverlayStyles />

      <div className="ant-root">
        <canvas
          ref={canvasRef}
          className="ant-canvas"
          width={CANVAS_BASE_WIDTH}
          height={CANVAS_BASE_HEIGHT}
        />

        {/* Top-left: city mode chips */}
        <div className="ant-chips">
          {Object.entries(cityModeIcons).map(([mode, { icon, label }]) => (
            <button
              key={mode}
              className={`ant-chip${cityMode === mode ? ' active' : ''}`}
              style={cityMode === mode ? { '--chip-color': COLORS.accent } as React.CSSProperties : {}}
              onClick={() => {
                setCityMode(mode as CityMode);
                setTimeout(initializeSimulation, 0);
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Top-right: icon buttons */}
        <div className="ant-top-right">
          <button
            className={`ant-icon-btn${showTrails ? ' active' : ''}`}
            onClick={() => setShowTrails(!showTrails)}
            title="Toggle trails"
          >
            {showTrails ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            className={`ant-icon-btn${showStats ? ' active' : ''}`}
            onClick={() => setShowStats(!showStats)}
            title="Live leaderboard"
          >
            <Trophy size={15} />
          </button>
        </div>

        {/* HUD: winner announcement */}
        {winner && winnerAlgo && (
          <div className="ant-hud" style={{ top: '50%', left: '50%', right: 'auto',
            transform: 'translate(-50%, -50%)', textAlign: 'center',
            border: `1px solid ${winnerAlgo.color}`,
            boxShadow: `0 0 40px ${winnerAlgo.glow}` }}>
            <div className="ant-hud-title" style={{ justifyContent: 'center', color: winnerAlgo.color, fontSize: '1.1rem' }}>
              🏆 {winnerAlgo.emoji} {winnerAlgo.name} Wins!
            </div>
            <div className="ant-hud-divider" />
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              Distance: <span style={{ color: winnerAlgo.color, fontWeight: 700 }}>{winnerAlgo.bestDistance.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Stats HUD: live leaderboard */}
        {showStats && !winner && sorted.length > 0 && (
          <div className="ant-hud">
            <div className="ant-hud-title">
              <Trophy size={13} style={{ color: COLORS.accent }} />
              Leaderboard
            </div>
            <div className="ant-hud-divider" />
            {sorted.map((algo, idx) => {
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              return (
                <div className="ant-hud-row" key={algo.id}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.6rem', minWidth: 14 }}>{medal}</span>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: algo.color,
                      boxShadow: algo.status === 'running' ? `0 0 6px ${algo.color}` : 'none',
                      flexShrink: 0, display: 'inline-block',
                    }} />
                    <span style={{ color: algo.color, fontWeight: 600, fontSize: '0.7rem' }}>
                      {algo.name.length > 10 ? algo.name.slice(0, 9) + '…' : algo.name}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>
                    {algo.bestDistance.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom pill bar */}
        <div className="ant-bar">
          <button
            className={`ant-bar-btn${isPlaying ? ' danger' : ' primary'}`}
            onClick={handlePlay}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            {isPlaying ? 'Pause' : 'Race'}
          </button>

          <button className="ant-bar-btn" onClick={handleReset}>
            <Shuffle size={13} />Reset
          </button>

          <div className="ant-bar-divider" />

          <div className="ant-speed-ctrl">
            <span className="ant-speed-label">{localSpeed}×</span>
            <input type="range" className="ant-slider" min={0.5} max={5} step={0.5}
              value={localSpeed} onChange={e => setLocalSpeed(Number(e.target.value))} />
          </div>

          <div className="ant-bar-divider" />

          <button
            className={`ant-bar-btn${activePanel === 'algorithms' ? ' active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'algorithms' ? 'none' : 'algorithms')}
          >
            <Brain size={13} />Algos
          </button>

          <button
            className={`ant-bar-btn${activePanel === 'city' ? ' active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'city' ? 'none' : 'city')}
          >
            <MapIcon size={13} />Cities
          </button>

          <div className="ant-bar-divider" />

          {/* Inline position tracker */}
          {algorithms.length > 0 && (
            <>
              {sorted.map((algo, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                return (
                  <div key={algo.id} title={`${algo.name}: ${algo.bestDistance.toFixed(0)} (${algo.improvements} improvements)`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.2rem',
                      padding: '0.15rem 0.4rem', borderRadius: 999,
                      background: algo.status === 'winner' ? `${algo.color}25` : 'transparent',
                      transition: 'all 0.3s',
                    }}>
                    {medal && <span style={{ fontSize: '0.55rem' }}>{medal}</span>}
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', background: algo.color,
                      boxShadow: algo.status === 'running' ? `0 0 6px ${algo.color}` : 'none',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 600, color: algo.color,
                      fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}>
                      {algo.name.length > 6 ? algo.name.slice(0, 5) : algo.name}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Algorithms popup panel */}
        {activePanel === 'algorithms' && (
          <div className="ant-panel">
            <div className="ant-panel-header">
              <Brain size={15} />Algorithms
              <button className="ant-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="ant-panel-body">
              {Object.entries(algorithmConfigs).map(([id, config]) => (
                <AlgoCheckbox
                  key={id}
                  $active={selectedAlgos.includes(id as AlgorithmType)}
                  $color={config.color}
                >
                  <input
                    type="checkbox"
                    checked={selectedAlgos.includes(id as AlgorithmType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAlgos([...selectedAlgos, id as AlgorithmType]);
                      } else {
                        setSelectedAlgos(selectedAlgos.filter(a => a !== id));
                      }
                    }}
                  />
                  <AlgoEmoji>{config.emoji}</AlgoEmoji>
                  <AlgoDetails>
                    <AlgoName $color={config.color} $active={selectedAlgos.includes(id as AlgorithmType)}>
                      {config.name}
                    </AlgoName>
                    <AlgoDescription>{config.funFact}</AlgoDescription>
                  </AlgoDetails>
                </AlgoCheckbox>
              ))}
            </div>
          </div>
        )}

        {/* City config popup panel */}
        {activePanel === 'city' && (
          <div className="ant-panel">
            <div className="ant-panel-header">
              <MapIcon size={15} />City Configuration
              <button className="ant-panel-close" onClick={() => setActivePanel('none')}><X size={13} /></button>
            </div>
            <div className="ant-panel-body">
              <div className="ant-city-ctrl">
                <span>Cities: {cityCount}</span>
                <input type="range" className="ant-city-slider" min={5} max={25}
                  value={cityCount} onChange={e => setCityCount(Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}