'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Zap, Sparkles, Map as MapIcon, TrendingUp, Award, Brain, Circle, Grid3x3, Shuffle, Eye, EyeOff, Trophy, Target, Cpu, BarChart3, Timer, Activity, ChevronDown, ChevronUp, X, Maximize2 } from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';

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

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const gentlePulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(59,130,246,0.12); }
  50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(59,130,246,0.16); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// Styled Components
const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg1} 100%);
  color: ${COLORS.textPrimary};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${COLORS.borderAccent};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: wrap;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${COLORS.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Badge = styled.div`
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 24px;
  font-size: 0.875rem;
  border: 1px solid ${COLORS.borderAccent};
  font-weight: 500;
  white-space: nowrap;
`;

const ThemeButtons = styled.div`
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }
`;

const ThemeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ $active }) => $active ? COLORS.accent : 'transparent'};
  border: 2px solid ${({ $active }) => $active ? COLORS.accent : COLORS.borderAccent};
  border-radius: 8px;
  color: ${({ $active }) => $active ? '#000' : COLORS.textPrimary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.3s ease;
  flex: 1;
  
  &:hover {
    background: ${({ $active }) => $active ? COLORS.accent : 'rgba(59, 130, 246, 0.06)'};
    transform: scale(1.05);
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
  }
`;

const CanvasArea = styled.div<{ $mobileViewing?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent,
      rgba(59, 130, 246, 0.35),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
  
  @media (max-width: 768px) {
    display: none;
    min-height: 400px;
  }
  
  ${({ $mobileViewing }) => $mobileViewing && css`
    @media (max-width: 768px) {
      display: flex !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
      border-radius: 0 !important;
      padding: 0 !important;
      z-index: 10000 !important;
    }
  `}
`;

const Sidebar = styled.div`
  width: 400px;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.22);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const MobileViewButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    
    &:active {
      transform: scale(0.98);
    }
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PlayButton = styled.button<{ $playing?: boolean }>`
  flex: 1;
  padding: 0.875rem;
  background: ${({ $playing }) => $playing
    ? `linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06))`
    : `linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.06))`};
  border: 1px solid ${({ $playing }) => $playing ? COLORS.danger : COLORS.accent};
  border-radius: 12px;
  color: ${({ $playing }) => $playing ? COLORS.danger : COLORS.accentSoft};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 20px ${({ $playing }) => $playing
    ? 'rgba(239, 68, 68, 0.18)'
    : 'rgba(59, 130, 246, 0.18)'};
  }
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  padding: 0.875rem;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(0,0,0,0.28)'};
  border: 1px solid ${({ $active }) => $active ? COLORS.accent : COLORS.borderAccent};
  border-radius: 12px;
  color: ${({ $active }) => $active ? COLORS.accentSoft : COLORS.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background: rgba(59, 130, 246, 0.06);
    color: ${COLORS.accentSoft};
  }
`;

const Section = styled.div``;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: ${COLORS.textPrimary};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.label`
  fontSize: 0.875rem;
  color: ${COLORS.textMuted};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const Slider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(59, 130, 246, 0.14);
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${COLORS.accentSoft};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${COLORS.accentSoft};
    cursor: pointer;
    border: none;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
  margin-top: 0.75rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.05)'};
  border: 2px solid ${({ $active }) => $active ? COLORS.accent : 'transparent'};
  border-radius: 10px;
  color: ${COLORS.textPrimary};
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.08);
    transform: scale(1.05);
  }
`;

const AlgoCheckbox = styled.label<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  margin-bottom: 0.625rem;
  background: ${({ $active, $color }) => $active ? `${$color}15` : 'rgba(255,255,255,0.05)'};
  border: 2px solid ${({ $active, $color }) => $active ? $color : 'transparent'};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $color }) => `${$color}10`};
    transform: translateY(-2px);
  }
  
  input {
    display: none;
  }
`;

const AlgoEmoji = styled.span`
  font-size: 1.5rem;
  min-width: 30px;
  text-align: center;
`;

const AlgoDetails = styled.div`
  flex: 1;
`;

const AlgoName = styled.div<{ $color: string; $active: boolean }>`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ $active, $color }) => $active ? $color : COLORS.textPrimary};
`;

const AlgoDescription = styled.div`
  font-size: 0.8125rem;
  color: ${COLORS.textMuted};
  margin-top: 0.125rem;
`;

const Leaderboard = styled.div<{ $expanded: boolean }>`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: ${({ $expanded }) => $expanded ? '1.25rem' : '1rem'};
  border: 1px solid ${COLORS.borderAccent};
`;

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const LeaderboardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExpandButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textPrimary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${COLORS.accentSoft};
  }
`;

const LeaderboardItem = styled.div<{ $rank: number; $isWinner: boolean; $color: string }>`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${({ $rank, $isWinner, $color }) => 
    $rank === 0 && $isWinner ? `${$color}15` : 'rgba(255,255,255,0.03)'};
  border-radius: 8px;
  border: 1px solid ${({ $rank, $isWinner, $color }) =>
    $rank === 0 && $isWinner ? $color : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.06);
    transform: translateX(4px);
  }
`;

const Rank = styled.div`
  font-size: 1.25rem;
  min-width: 30px;
  text-align: center;
`;

const AlgoInfo = styled.div`
  flex: 1;
`;

const AlgoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const AlgoStatus = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  animation: ${pulse} 1s infinite;
`;

const AlgoNameInBoard = styled.span<{ $color: string }>`
  font-weight: 600;
  font-size: 1rem;
  color: ${({ $color }) => $color};
`;

const Stats = styled.div`
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatValue = styled.strong`
  color: ${COLORS.textPrimary};
`;

const WinnerOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,10,30,0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid;
  text-align: center;
  box-shadow: 0 0 60px;
  max-width: 90%;
  animation: ${gentlePulse} 2s ease-in-out infinite;
`;

const WinnerTitle = styled.h2`
  font-size: 2.25rem;
  margin: 0 0 1rem 0;
`;

const WinnerAlgo = styled.p`
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
`;

const WinnerDistance = styled.p`
  font-size: 1rem;
  color: ${COLORS.textMuted};
  margin: 0;
`;

const MobileControls = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  z-index: 10001;
  display: flex;
  gap: 0.5rem;
  background: rgba(0,0,0,0.95);
  backdrop-filter: blur(10px);
  padding: 0.6rem;
  border-radius: 999px;
  border: 1px solid ${COLORS.borderAccent};
`;

const MobileControlButton = styled.button<{ $variant?: 'primary' | 'danger' | 'default' }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return '#6366f1';
      case 'danger': return '#ef4444';
      default: return 'rgba(51,65,85,0.8)';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
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
  const [showStats, setShowStats] = useState(true);
  const [expandedStats, setExpandedStats] = useState(false);
  const [mobileViewing, setMobileViewing] = useState(false);
  
  const frameRef = useRef<number>(0);
  const tempRef = useRef(100);
  const populationRef = useRef<Record<string, number[][]>>({});
  const pheromonesRef = useRef<number[][]>([]);
  const timeRef = useRef(0);
  const trailsRef = useRef(new Map<string, TrailPoint[]>());
  const previouslyRunningRef = useRef<boolean>(false);

  useEffect(() => {
    setIsPlaying(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setLocalSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (!mobileViewing) return;

    const enterMobileView = async () => {
      previouslyRunningRef.current = isPlaying;
      
      if (!isPlaying) {
        setAlgorithms(prev => prev.map(a => ({ ...a, status: 'running' })));
        setIsPlaying(true);
      }

      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const container = canvas.parentElement;
        if (!container) return;

        const doc = window.document as any;
        if (container && !doc.fullscreenElement) {
          if ((container as any).requestFullscreen) await (container as any).requestFullscreen();
          else if ((container as any).webkitRequestFullscreen) await (container as any).webkitRequestFullscreen();
          else if ((container as any).mozRequestFullScreen) await (container as any).mozRequestFullScreen();
        }
      } catch (err) {
        console.warn('Fullscreen failed', err);
      }

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    enterMobileView();
  }, [mobileViewing, isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFS = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      if (!isFS && mobileViewing) {
        setMobileViewing(false);
        if (!previouslyRunningRef.current) setIsPlaying(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [mobileViewing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      
      if (mobileViewing) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      } else {
        canvas.width = CANVAS_BASE_WIDTH * dpr;
        canvas.height = CANVAS_BASE_HEIGHT * dpr;
        canvas.style.width = `${CANVAS_BASE_WIDTH}px`;
        canvas.style.height = `${CANVAS_BASE_HEIGHT}px`;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
    };
  }, [mobileViewing]);

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

  const exitMobileView = async () => {
    setMobileViewing(false);
    
    try {
      const doc = window.document as any;
      if (doc && doc.fullscreenElement) {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed', err);
    }
  };

  const cityModeIcons: Record<CityMode, React.ReactElement> = {
    random: <Sparkles size={18} />,
    circle: <Circle size={18} />,
    grid: <Grid3x3 size={18} />,
    clusters: <MapIcon size={18} />,
    spiral: <TrendingUp size={18} />
  };

  const winnerAlgo = algorithms.find(a => a.id === winner);

  return (
    <MainContainer>
      <Header>
        <Title>
          <Cpu size={32} />
          TSP Algorithm Battle Arena
        </Title>
        
        <Badge>
          {cities.length} Cities • {algorithms.length} Algorithms
        </Badge>
        
        <ThemeButtons>
          <ThemeButton $active={true}>
            Matrix
          </ThemeButton>
        </ThemeButtons>
      </Header>

      <MainContent>
        <MobileViewButton onClick={() => setMobileViewing(true)}>
          <Maximize2 size={24} />
          View Simulation
        </MobileViewButton>

        <CanvasArea $mobileViewing={mobileViewing}>
          <canvas
            ref={canvasRef}
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '12px'
            }}
          />

          {winner && winnerAlgo && !mobileViewing && (
            <WinnerOverlay style={{
              borderColor: winnerAlgo.color,
              boxShadow: `0 0 60px ${winnerAlgo.glow}`
            }}>
              <WinnerTitle style={{ color: winnerAlgo.color }}>
                🎉 Victory! 🎉
              </WinnerTitle>
              <WinnerAlgo>
                {winnerAlgo.emoji} {winnerAlgo.name} Algorithm Wins!
              </WinnerAlgo>
              <WinnerDistance>
                Final Distance: {winnerAlgo.bestDistance.toFixed(1)}
              </WinnerDistance>
            </WinnerOverlay>
          )}

          {mobileViewing && (
            <MobileControls>
              <MobileControlButton $variant="primary" onClick={handlePlay}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </MobileControlButton>
              <MobileControlButton onClick={handleReset}>
                <Shuffle size={20} />
              </MobileControlButton>
              <MobileControlButton $variant="danger" onClick={exitMobileView}>
                <X size={20} />
              </MobileControlButton>
            </MobileControls>
          )}
        </CanvasArea>

        <Sidebar>
          <ControlsSection>
            <PlayButton $playing={isPlaying} onClick={handlePlay}>
              {isPlaying ? <><Pause size={22} />Pause</> : <><Play size={22} />Start Race</>}
            </PlayButton>
            
            <ControlButton onClick={handleReset}>
              <Shuffle size={22} />
            </ControlButton>
            
            <ControlButton $active={showTrails} onClick={() => setShowTrails(!showTrails)}>
              {showTrails ? <Eye size={22} /> : <EyeOff size={22} />}
            </ControlButton>
            
            <ControlButton $active={showStats} onClick={() => setShowStats(!showStats)}>
              <BarChart3 size={22} />
            </ControlButton>
          </ControlsSection>

          {showStats && (
            <Leaderboard $expanded={expandedStats}>
              <LeaderboardHeader>
                <LeaderboardTitle>
                  <Trophy size={20} />
                  Live Leaderboard
                </LeaderboardTitle>
                <ExpandButton onClick={() => setExpandedStats(!expandedStats)}>
                  {expandedStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </ExpandButton>
              </LeaderboardHeader>
              
              {[...algorithms]
                .sort((a, b) => a.bestDistance - b.bestDistance)
                .map((algo, idx) => (
                  <LeaderboardItem
                    key={algo.id}
                    $rank={idx}
                    $isWinner={algo.status === 'winner'}
                    $color={algo.color}
                  >
                    <Rank>
                      {idx === 0 && algo.status === 'winner' ? '🏆' : 
                       idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </Rank>
                    
                    <AlgoInfo>
                      <AlgoHeader>
                        <span style={{ fontSize: '1.5rem' }}>{algo.emoji}</span>
                        <AlgoNameInBoard $color={algo.color}>
                          {algo.name}
                        </AlgoNameInBoard>
                        {algo.status === 'running' && (
                          <AlgoStatus $color={algo.color} />
                        )}
                      </AlgoHeader>
                      
                      <Stats>
                        <span>Distance: <StatValue>
                          {algo.bestDistance.toFixed(0)}
                        </StatValue></span>
                        <span>Improvements: <StatValue>
                          {algo.improvements}
                        </StatValue></span>
                      </Stats>
                    </AlgoInfo>
                  </LeaderboardItem>
                ))}
            </Leaderboard>
          )}

          <Section>
            <Label>
              <Zap size={16} />
              Simulation Speed: {localSpeed}x
            </Label>
            <Slider
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(Number(e.target.value))}
            />
          </Section>

          <Section>
            <SectionTitle>
              <MapIcon size={18} />
              City Configuration
            </SectionTitle>
            
            <Label>
              Number of Cities: {cityCount}
            </Label>
            <Slider
              type="range"
              min="5"
              max="25"
              value={cityCount}
              onChange={(e) => setCityCount(Number(e.target.value))}
            />
            
            <ButtonGrid>
              {Object.entries(cityModeIcons).map(([mode, icon]) => (
                <ModeButton
                  key={mode}
                  $active={cityMode === mode}
                  onClick={() => {
                    setCityMode(mode as CityMode);
                    setTimeout(initializeSimulation, 0);
                  }}
                >
                  {icon}
                  <span style={{ textTransform: 'capitalize' }}>{mode}</span>
                </ModeButton>
              ))}
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>
              <Brain size={18} />
              Select Algorithms
            </SectionTitle>
            
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
                  <AlgoName
                    $color={config.color}
                    $active={selectedAlgos.includes(id as AlgorithmType)}
                  >
                    {config.name}
                  </AlgoName>
                  <AlgoDescription>
                    {config.funFact}
                  </AlgoDescription>
                </AlgoDetails>
              </AlgoCheckbox>
            ))}
          </Section>
        </Sidebar>
      </MainContent>
    </MainContainer>
  );
}