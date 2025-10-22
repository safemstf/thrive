'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Zap, MapPin, Navigation, Building2, Brain, Shuffle, Trophy, Cpu, BarChart3, ChevronDown, ChevronUp, Home, Compass, CheckCircle2, AlertCircle } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const COLORS = {
  bg1: '#0a0e1a',
  bg2: '#1a1a2e',
  textPrimary: '#e6eef8',
  textMuted: '#dee5efff',
  accent: '#3b82f6',
  accentSoft: '#60a5fa',
  success: '#22c55e',
  warn: '#fbbf24',
  danger: '#ef4444',
  borderAccent: 'rgba(59, 130, 246, 0.15)',
  road: '#475569'
};

type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs' | 'bmssp';
type MapMode = 'us-cities' | 'metro' | 'highway' | 'regional';

interface City {
  id: number;
  name: string;
  x: number;
  y: number;
  connections: number[];
}

interface Algorithm {
  id: AlgorithmType;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  path: number[];
  explored: Set<number>;
  frontier: number[];
  status: 'idle' | 'running' | 'finished' | 'winner' | 'failed';
  steps: number;
  distance: number;
  description: string;
  state?: any;
}

interface ShortestPathAlgorithmDemoProps {
  isRunning?: boolean;
  speed?: number;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const gentlePulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

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
    inset: 0;
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
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  padding: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.35), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
  
  @media (max-width: 768px) {
    min-height: 400px;
    padding: 1rem;
  }
`;

const RouteInfo = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
    left: 1rem;
    top: 1rem;
  }
`;

const CityLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WinnerBanner = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.95);
  backdrop-filter: blur(20px);
  padding: 2rem 3rem;
  border-radius: 16px;
  border: 2px solid ${({ $color }) => $color};
  box-shadow: 0 0 40px ${({ $color }) => $color}80;
  text-align: center;
  animation: ${gentlePulse} 2s ease-in-out infinite;
  z-index: 100;
`;

const WinnerTitle = styled.h2<{ $color: string }>`
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
`;

const WinnerStats = styled.div`
  font-size: 1rem;
  color: ${COLORS.textMuted};
  margin-top: 0.5rem;
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
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  &::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.22); border-radius: 3px; }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
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
    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06))'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.06))'};
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
    box-shadow: 0 4px 20px ${({ $playing }) => $playing ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)'};
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
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
  margin-top: 0.75rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.05)'};
  border: 2px solid ${({ $active }) => $active ? COLORS.accent : 'transparent'};
  border-radius: 10px;
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
  
  input { display: none; }
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
  
  &:hover { color: ${COLORS.accentSoft}; }
`;

const LeaderboardItem = styled.div<{ $rank: number; $isWinner: boolean; $color: string; $failed?: boolean }>`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${({ $rank, $isWinner, $color, $failed }) => 
    $failed ? 'rgba(239, 68, 68, 0.08)' :
    $rank === 0 && $isWinner ? `${$color}15` : 'rgba(255,255,255,0.03)'};
  border-radius: 8px;
  border: 1px solid ${({ $rank, $isWinner, $color, $failed }) =>
    $failed ? COLORS.danger :
    $rank === 0 && $isWinner ? $color : 'transparent'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  opacity: ${({ $failed }) => $failed ? 0.6 : 1};
  
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

const algorithmConfigs = {
  dijkstra: {
    name: 'Dijkstra',
    emoji: '🎯',
    color: '#3b82f6',
    glow: '#60a5fa',
    description: 'Optimal pathfinding',
    funFact: 'Guarantees shortest route'
  },
  astar: {
    name: 'A*',
    emoji: '⭐',
    color: '#f59e0b',
    glow: '#fbbf24',
    description: 'GPS-style navigation',
    funFact: 'Uses "as-the-crow-flies" estimates'
  },
  bfs: {
    name: 'BFS',
    emoji: '🌊',
    color: '#06b6d4',
    glow: '#22d3ee',
    description: 'Breadth-first routing',
    funFact: 'Explores city by city'
  },
  dfs: {
    name: 'DFS',
    emoji: '🔍',
    color: '#8b5cf6',
    glow: '#a78bfa',
    description: 'Deep exploration',
    funFact: 'Follows roads to dead ends'
  },
  bmssp: {
    name: 'BMSSP',
    emoji: '⚡',
    color: '#ec4899',
    glow: '#f472b6',
    description: 'Multi-hub expansion',
    funFact: 'Searches from multiple hubs simultaneously'
  }
};

const CITY_NAMES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston',
  'El Paso', 'Nashville', 'Detroit', 'Portland', 'Memphis'
];

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

function generateCityNetwork(mode: MapMode): City[] {
  const cities: City[] = [];
  const margin = 80;
  
  let positions: [number, number][] = [];
  
  if (mode === 'us-cities') {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const x = margin + Math.random() * (CANVAS_WIDTH - margin * 2);
      const y = margin + Math.random() * (CANVAS_HEIGHT - margin * 2);
      positions.push([x, y]);
    }
  } else if (mode === 'metro') {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const count = 15;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 50 + Math.random() * 180;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      positions.push([x, y]);
    }
  } else if (mode === 'highway') {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const x = margin + (i / (count - 1)) * (CANVAS_WIDTH - margin * 2);
      const y = CANVAS_HEIGHT / 2 + (Math.sin(i * 0.8) * 150) + (Math.random() - 0.5) * 80;
      positions.push([x, y]);
    }
  } else {
    const regions = 4;
    const citiesPerRegion = 5;
    for (let r = 0; r < regions; r++) {
      const rx = (r % 2) * (CANVAS_WIDTH / 2) + CANVAS_WIDTH / 4;
      const ry = Math.floor(r / 2) * (CANVAS_HEIGHT / 2) + CANVAS_HEIGHT / 4;
      
      for (let c = 0; c < citiesPerRegion; c++) {
        const x = rx + (Math.random() - 0.5) * 200;
        const y = ry + (Math.random() - 0.5) * 150;
        positions.push([x, y]);
      }
    }
  }
  
  positions.forEach(([x, y], i) => {
    cities.push({
      id: i,
      name: CITY_NAMES[i % CITY_NAMES.length],
      x,
      y,
      connections: []
    });
  });
  
  cities.forEach((city, i) => {
    const distances = cities.map((other, j) => ({
      id: j,
      dist: i === j ? Infinity : Math.hypot(other.x - city.x, other.y - city.y)
    }));
    
    distances.sort((a, b) => a.dist - b.dist);
    
    const connectionCount = mode === 'highway' ? 3 : mode === 'metro' ? 5 : 4;
    
    for (let k = 0; k < connectionCount && k < distances.length; k++) {
      const targetId = distances[k].id;
      if (!city.connections.includes(targetId)) {
        city.connections.push(targetId);
        if (!cities[targetId].connections.includes(i)) {
          cities[targetId].connections.push(i);
        }
      }
    }
  });
  
  return cities;
}

function heuristic(cityA: City, cityB: City): number {
  return Math.hypot(cityB.x - cityA.x, cityB.y - cityA.y);
}

class RouteFinder {
  static dijkstra(
    cities: City[],
    startId: number,
    goalId: number,
    state?: any
  ): { frontier: number[], explored: Set<number>, path: number[], done: boolean, distance: number, state: any } {
    if (!state) {
      const frontier = [startId];
      const cameFrom = new Map<number, number>();
      const costSoFar = new Map<number, number>();
      costSoFar.set(startId, 0);
      
      state = { frontier, cameFrom, costSoFar, explored: new Set<number>(), iterationsWithoutProgress: 0 };
    }
    
    if (state.frontier.length === 0 || state.iterationsWithoutProgress > cities.length * 2) {
      return { frontier: [], explored: state.explored, path: [], done: true, distance: 0, state };
    }
    
    state.frontier.sort((a: number, b: number) => 
      (state.costSoFar.get(a) || Infinity) - (state.costSoFar.get(b) || Infinity)
    );
    
    const current = state.frontier.shift()!;
    state.explored.add(current);
    state.iterationsWithoutProgress++;
    
    if (current === goalId) {
      const path: number[] = [];
      let curr: number | undefined = current;
      const totalDist = state.costSoFar.get(current) || 0;
      
      while (curr !== undefined) {
        path.unshift(curr);
        curr = state.cameFrom.get(curr);
      }
      return { frontier: [], explored: state.explored, path, done: true, distance: totalDist, state };
    }
    
    for (const nextId of cities[current].connections) {
      const currentCity = cities[current];
      const nextCity = cities[nextId];
      const edgeCost = heuristic(currentCity, nextCity);
      const newCost = (state.costSoFar.get(current) || 0) + edgeCost;
      
      if (!state.costSoFar.has(nextId) || newCost < state.costSoFar.get(nextId)!) {
        state.costSoFar.set(nextId, newCost);
        state.cameFrom.set(nextId, current);
        state.iterationsWithoutProgress = 0;
        if (!state.frontier.includes(nextId)) {
          state.frontier.push(nextId);
        }
      }
    }
    
    return { frontier: state.frontier, explored: state.explored, path: [], done: false, distance: 0, state };
  }
  
  static astar(
    cities: City[],
    startId: number,
    goalId: number,
    state?: any
  ): { frontier: number[], explored: Set<number>, path: number[], done: boolean, distance: number, state: any } {
    if (!state) {
      const frontier = [startId];
      const cameFrom = new Map<number, number>();
      const gScore = new Map<number, number>();
      const fScore = new Map<number, number>();
      gScore.set(startId, 0);
      fScore.set(startId, heuristic(cities[startId], cities[goalId]));
      
      state = { frontier, cameFrom, gScore, fScore, explored: new Set<number>(), iterationsWithoutProgress: 0 };
    }
    
    if (state.frontier.length === 0 || state.iterationsWithoutProgress > cities.length * 2) {
      return { frontier: [], explored: state.explored, path: [], done: true, distance: 0, state };
    }
    
    state.frontier.sort((a: number, b: number) => 
      (state.fScore.get(a) || Infinity) - (state.fScore.get(b) || Infinity)
    );
    
    const current = state.frontier.shift()!;
    state.explored.add(current);
    state.iterationsWithoutProgress++;
    
    if (current === goalId) {
      const path: number[] = [];
      let curr: number | undefined = current;
      const totalDist = state.gScore.get(current) || 0;
      
      while (curr !== undefined) {
        path.unshift(curr);
        curr = state.cameFrom.get(curr);
      }
      return { frontier: [], explored: state.explored, path, done: true, distance: totalDist, state };
    }
    
    for (const nextId of cities[current].connections) {
      const currentCity = cities[current];
      const nextCity = cities[nextId];
      const edgeCost = heuristic(currentCity, nextCity);
      const tentativeG = (state.gScore.get(current) || Infinity) + edgeCost;
      
      if (tentativeG < (state.gScore.get(nextId) || Infinity)) {
        state.cameFrom.set(nextId, current);
        state.gScore.set(nextId, tentativeG);
        state.fScore.set(nextId, tentativeG + heuristic(cities[nextId], cities[goalId]));
        state.iterationsWithoutProgress = 0;
        
        if (!state.frontier.includes(nextId)) {
          state.frontier.push(nextId);
        }
      }
    }
    
    return { frontier: state.frontier, explored: state.explored, path: [], done: false, distance: 0, state };
  }
  
  static bfs(
    cities: City[],
    startId: number,
    goalId: number,
    state?: any
  ): { frontier: number[], explored: Set<number>, path: number[], done: boolean, distance: number, state: any } {
    if (!state) {
      const frontier = [startId];
      const cameFrom = new Map<number, number>();
      const distances = new Map<number, number>();
      distances.set(startId, 0);
      state = { frontier, cameFrom, distances, explored: new Set<number>(), iterationsWithoutProgress: 0 };
    }
    
    if (state.frontier.length === 0 || state.iterationsWithoutProgress > cities.length * 2) {
      return { frontier: [], explored: state.explored, path: [], done: true, distance: 0, state };
    }
    
    const current = state.frontier.shift()!;
    state.explored.add(current);
    state.iterationsWithoutProgress++;
    
    if (current === goalId) {
      const path: number[] = [];
      let curr: number | undefined = current;
      const totalDist = state.distances.get(current) || 0;
      
      while (curr !== undefined) {
        path.unshift(curr);
        curr = state.cameFrom.get(curr);
      }
      return { frontier: [], explored: state.explored, path, done: true, distance: totalDist, state };
    }
    
    for (const nextId of cities[current].connections) {
      if (!state.cameFrom.has(nextId) && !state.explored.has(nextId) && !state.frontier.includes(nextId)) {
        const currentCity = cities[current];
        const nextCity = cities[nextId];
        const edgeCost = heuristic(currentCity, nextCity);
        state.distances.set(nextId, (state.distances.get(current) || 0) + edgeCost);
        state.cameFrom.set(nextId, current);
        state.frontier.push(nextId);
        state.iterationsWithoutProgress = 0;
      }
    }
    
    return { frontier: state.frontier, explored: state.explored, path: [], done: false, distance: 0, state };
  }
  
  static dfs(
    cities: City[],
    startId: number,
    goalId: number,
    state?: any
  ): { frontier: number[], explored: Set<number>, path: number[], done: boolean, distance: number, state: any } {
    if (!state) {
      const frontier = [startId];
      const cameFrom = new Map<number, number>();
      const distances = new Map<number, number>();
      distances.set(startId, 0);
      state = { frontier, cameFrom, distances, explored: new Set<number>(), iterationsWithoutProgress: 0 };
    }
    
    if (state.frontier.length === 0 || state.iterationsWithoutProgress > cities.length * 2) {
      return { frontier: [], explored: state.explored, path: [], done: true, distance: 0, state };
    }
    
    const current = state.frontier.pop()!;
    state.explored.add(current);
    state.iterationsWithoutProgress++;
    
    if (current === goalId) {
      const path: number[] = [];
      let curr: number | undefined = current;
      const totalDist = state.distances.get(current) || 0;
      
      while (curr !== undefined) {
        path.unshift(curr);
        curr = state.cameFrom.get(curr);
      }
      return { frontier: [], explored: state.explored, path, done: true, distance: totalDist, state };
    }
    
    for (const nextId of cities[current].connections) {
      if (!state.cameFrom.has(nextId) && !state.explored.has(nextId)) {
        const currentCity = cities[current];
        const nextCity = cities[nextId];
        const edgeCost = heuristic(currentCity, nextCity);
        state.distances.set(nextId, (state.distances.get(current) || 0) + edgeCost);
        state.cameFrom.set(nextId, current);
        state.frontier.push(nextId);
        state.iterationsWithoutProgress = 0;
      }
    }
    
    return { frontier: state.frontier, explored: state.explored, path: [], done: false, distance: 0, state };
  }
  
  static bmssp(
    cities: City[],
    startId: number,
    goalId: number,
    state?: any
  ): { frontier: number[], explored: Set<number>, path: number[], done: boolean, distance: number, state: any } {
    if (!state) {
      const k = Math.max(3, Math.ceil(Math.sqrt(cities.length)));
      const pivots = new Set<number>();
      pivots.add(startId);
      
      for (let i = 1; i < k && i < cities.length; i++) {
        const pivotId = Math.floor((i / k) * cities.length);
        if (pivotId !== startId) {
          pivots.add(pivotId);
        }
      }
      
      const bd = new Map<number, number>();
      bd.set(startId, 0);
      
      const W = new Set(pivots);
      const frontier = Array.from(pivots);
      const cameFrom = new Map<number, number>();
      
      state = { pivots, bd, W, frontier, cameFrom, explored: new Set<number>(), iterationsWithoutProgress: 0 };
    }
    
    if (state.frontier.length === 0 || state.iterationsWithoutProgress > cities.length * 2) {
      return { frontier: [], explored: state.explored, path: [], done: true, distance: 0, state };
    }
    
    const batchSize = Math.min(3, state.frontier.length);
    const batch = state.frontier.splice(0, batchSize);
    
    for (const current of batch) {
      state.explored.add(current);
      state.iterationsWithoutProgress++;
      
      if (current === goalId) {
        const path: number[] = [];
        let curr: number | undefined = current;
        const totalDist = state.bd.get(current) || 0;
        
        while (curr !== undefined) {
          path.unshift(curr);
          curr = state.cameFrom.get(curr);
        }
        return { frontier: [], explored: state.explored, path, done: true, distance: totalDist, state };
      }
      
      const currentDist = state.bd.get(current) || Infinity;
      
      for (const nextId of cities[current].connections) {
        const currentCity = cities[current];
        const nextCity = cities[nextId];
        const edgeCost = heuristic(currentCity, nextCity);
        const newDist = currentDist + edgeCost;
        
        if (!state.bd.has(nextId) || newDist < state.bd.get(nextId)!) {
          state.bd.set(nextId, newDist);
          state.cameFrom.set(nextId, current);
          state.iterationsWithoutProgress = 0;
          
          if (!state.explored.has(nextId) && !state.frontier.includes(nextId)) {
            state.frontier.push(nextId);
            state.W.add(nextId);
          }
        }
      }
    }
    
    state.frontier.sort((a: number, b: number) => 
      (state.bd.get(a) || Infinity) - (state.bd.get(b) || Infinity)
    );
    
    return { frontier: state.frontier, explored: state.explored, path: [], done: false, distance: 0, state };
  }
}

export default function ShortestPathAlgorithmDemo({ isRunning = false, speed = 3 }: ShortestPathAlgorithmDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(isRunning);
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [cities, setCities] = useState<City[]>([]);
  const [startCity, setStartCity] = useState(0);
  const [goalCity, setGoalCity] = useState(0);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>(['dijkstra', 'astar', 'bmssp']);
  const [mapMode, setMapMode] = useState<MapMode>('us-cities');
  const [winner, setWinner] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [expandedStats, setExpandedStats] = useState(false);
  
  const frameRef = useRef<number>(0);

  useEffect(() => {
    setIsPlaying(isRunning);
  }, [isRunning]);

  useEffect(() => {
    setLocalSpeed(speed);
  }, [speed]);

  const initializeSimulation = useCallback(() => {
    const newCities = generateCityNetwork(mapMode);
    setCities(newCities);
    
    const start = 0;
    const goal = Math.floor(newCities.length * 0.7);
    setStartCity(start);
    setGoalCity(goal);
    setWinner(null);
    
    const algos: Algorithm[] = [];
    for (const [id, config] of Object.entries(algorithmConfigs)) {
      if (selectedAlgos.includes(id as AlgorithmType)) {
        algos.push({
          id: id as AlgorithmType,
          ...config,
          path: [],
          explored: new Set(),
          frontier: [],
          status: 'idle',
          steps: 0,
          distance: 0
        });
      }
    }
    
    setAlgorithms(algos);
  }, [mapMode, selectedAlgos]);

  const updateAlgorithms = useCallback(() => {
    if (cities.length === 0) return;
    
    setAlgorithms(prev => {
      const updated = prev.map(algo => {
        if (algo.status !== 'running') return algo;
        
        let result;
        switch (algo.id) {
          case 'dijkstra':
            result = RouteFinder.dijkstra(cities, startCity, goalCity, algo.state);
            break;
          case 'astar':
            result = RouteFinder.astar(cities, startCity, goalCity, algo.state);
            break;
          case 'bfs':
            result = RouteFinder.bfs(cities, startCity, goalCity, algo.state);
            break;
          case 'dfs':
            result = RouteFinder.dfs(cities, startCity, goalCity, algo.state);
            break;
          case 'bmssp':
            result = RouteFinder.bmssp(cities, startCity, goalCity, algo.state);
            break;
          default:
            return algo;
        }
        
        const newStatus = result.done ? 
          (result.path.length > 0 ? 'finished' as const : 'failed' as const) : 
          'running' as const;
        
        return {
          ...algo,
          frontier: result.frontier,
          explored: result.explored,
          path: result.path,
          steps: algo.steps + 1,
          distance: result.distance,
          status: newStatus,
          state: result.state
        };
      });
      
      if (updated.every(a => a.status === 'finished' || a.status === 'failed') && !winner) {
        const withPath = updated.filter(a => a.path.length > 0);
        if (withPath.length > 0) {
          const champion = withPath.reduce((best, current) => 
            current.steps < best.steps ? current : best
          );
          setWinner(champion.id);
          updated.forEach(a => {
            if (a.id === champion.id) a.status = 'winner';
          });
        }
      }
      
      return updated;
    });
  }, [cities, startCity, goalCity, winner]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = COLORS.bg1;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    cities.forEach(city => {
      city.connections.forEach(connId => {
        const target = cities[connId];
        if (city.id < connId) {
          ctx.strokeStyle = COLORS.road;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.moveTo(city.x, city.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    });
    
    algorithms.forEach(algo => {
      algo.explored.forEach(cityId => {
        const city = cities[cityId];
        ctx.fillStyle = `${algo.color}20`;
        ctx.beginPath();
        ctx.arc(city.x, city.y, 25, 0, Math.PI * 2);
        ctx.fill();
      });
      
      algo.frontier.forEach(cityId => {
        const city = cities[cityId];
        ctx.strokeStyle = algo.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(city.x, city.y, 28, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      if (algo.path.length > 1) {
        ctx.strokeStyle = algo.color;
        ctx.lineWidth = algo.status === 'winner' ? 6 : 4;
        ctx.shadowColor = algo.glow;
        ctx.shadowBlur = algo.status === 'winner' ? 20 : 15;
        ctx.beginPath();
        algo.path.forEach((cityId, i) => {
          const city = cities[cityId];
          if (i === 0) ctx.moveTo(city.x, city.y);
          else ctx.lineTo(city.x, city.y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    
    cities.forEach(city => {
      const isStart = city.id === startCity;
      const isGoal = city.id === goalCity;
      
      ctx.fillStyle = isStart ? COLORS.success : isGoal ? COLORS.danger : COLORS.accent;
      ctx.strokeStyle = COLORS.bg1;
      ctx.lineWidth = 3;
      ctx.shadowColor = isStart ? COLORS.success : isGoal ? COLORS.danger : COLORS.accentSoft;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(city.x, city.y, isStart || isGoal ? 18 : 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      if (isStart || isGoal) {
        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(city.name, city.x, city.y - 25);
      }
    });
  }, [cities, algorithms, startCity, goalCity]);

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
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
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

  const mapModeIcons: Record<MapMode, React.ReactElement> = {
    'us-cities': <Compass size={18} />,
    'metro': <Building2 size={18} />,
    'highway': <Navigation size={18} />,
    'regional': <MapPin size={18} />
  };

  const winnerAlgo = algorithms.find(a => a.id === winner);

  return (
    <MainContainer>
      <Header>
        <Title>
          <Cpu size={32} />
          City Route Finder
        </Title>
        
        <Badge>
          {cities.length} Cities • {algorithms.length} Algorithms
        </Badge>
      </Header>

      <MainContent>
        <CanvasArea>
          {cities.length > 0 && (
            <RouteInfo>
              <CityLabel $color={COLORS.success}>
                <Home size={16} />
                {cities[startCity]?.name}
              </CityLabel>
              <span>→</span>
              <CityLabel $color={COLORS.danger}>
                <MapPin size={16} />
                {cities[goalCity]?.name}
              </CityLabel>
            </RouteInfo>
          )}
          
          {winner && winnerAlgo && (
            <WinnerBanner $color={winnerAlgo.color}>
              <WinnerTitle $color={winnerAlgo.color}>
                <Trophy size={32} />
                {winnerAlgo.name} Wins!
              </WinnerTitle>
              <WinnerStats>
                Found route in {winnerAlgo.steps} steps • {winnerAlgo.path.length} cities • {winnerAlgo.distance.toFixed(0)}px distance
              </WinnerStats>
            </WinnerBanner>
          )}
          
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '8px'
            }}
          />
        </CanvasArea>

        <Sidebar>
          <ControlsSection>
            <PlayButton $playing={isPlaying} onClick={handlePlay}>
              {isPlaying ? <><Pause size={22} />Pause</> : <><Play size={22} />Find Routes</>}
            </PlayButton>
            
            <ControlButton onClick={handleReset}>
              <Shuffle size={22} />
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
                  Algorithm Performance
                </LeaderboardTitle>
                <ExpandButton onClick={() => setExpandedStats(!expandedStats)}>
                  {expandedStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </ExpandButton>
              </LeaderboardHeader>
              
              {[...algorithms]
                .sort((a, b) => {
                  if (a.status === 'failed' && b.status !== 'failed') return 1;
                  if (a.status !== 'failed' && b.status === 'failed') return -1;
                  if (a.path.length === 0 && b.path.length === 0) return a.steps - b.steps;
                  if (a.path.length === 0) return 1;
                  if (b.path.length === 0) return -1;
                  return a.steps - b.steps;
                })
                .map((algo, idx) => (
                  <LeaderboardItem
                    key={algo.id}
                    $rank={idx}
                    $isWinner={algo.status === 'winner'}
                    $color={algo.color}
                    $failed={algo.status === 'failed'}
                  >
                    <Rank>
                      {algo.status === 'failed' ? <AlertCircle size={20} color={COLORS.danger} /> :
                       idx === 0 && algo.status === 'winner' ? '🏆' : 
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
                        {algo.status === 'winner' && (
                          <CheckCircle2 size={18} color={COLORS.success} />
                        )}
                      </AlgoHeader>
                      
                      <Stats>
                        <span>Steps: <StatValue>{algo.steps}</StatValue></span>
                        <span>Route: <StatValue>{algo.path.length > 0 ? `${algo.path.length} cities` : '-'}</StatValue></span>
                        {algo.distance > 0 && (
                          <span>Distance: <StatValue>{algo.distance.toFixed(0)}px</StatValue></span>
                        )}
                      </Stats>
                    </AlgoInfo>
                  </LeaderboardItem>
                ))}
            </Leaderboard>
          )}

          <Section>
            <Label>
              <Zap size={16} />
              Speed: {localSpeed}x
            </Label>
            <Slider
              type="range"
              min="1"
              max="10"
              step="1"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(Number(e.target.value))}
            />
          </Section>

          <Section>
            <SectionTitle>
              <Compass size={18} />
              Map Layout
            </SectionTitle>
            
            <ButtonGrid>
              {Object.entries(mapModeIcons).map(([mode, icon]) => (
                <ModeButton
                  key={mode}
                  $active={mapMode === mode}
                  onClick={() => {
                    setMapMode(mode as MapMode);
                    setTimeout(initializeSimulation, 0);
                  }}
                >
                  {icon}
                  <span style={{ textTransform: 'capitalize' }}>
                    {mode === 'us-cities' ? 'US Cities' : mode}
                  </span>
                </ModeButton>
              ))}
            </ButtonGrid>
          </Section>

          <Section>
            <SectionTitle>
              <Brain size={18} />
              Algorithms
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