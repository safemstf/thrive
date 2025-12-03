'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Zap, MapPin, Navigation, Building2, Brain, Shuffle, Trophy, Cpu, BarChart3, ChevronDown, ChevronUp, Home, Compass, CheckCircle2, AlertCircle, TrendingUp, Award, RotateCcw, Layers } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

// ==================== CONSTANTS ====================
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

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 700;

// Performance thresholds
const SMALL_NETWORK = 50;
const MEDIUM_NETWORK = 150;
const LARGE_NETWORK = 500;

// ==================== STYLED COMPONENTS ====================
const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

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

const PerformanceBadge = styled(Badge) <{ $level: 'good' | 'medium' | 'heavy' }>`
  background: ${({ $level }) =>
    $level === 'good' ? 'rgba(34, 197, 94, 0.12)' :
      $level === 'medium' ? 'rgba(251, 191, 36, 0.12)' :
        'rgba(239, 68, 68, 0.12)'};
  border-color: ${({ $level }) =>
    $level === 'good' ? 'rgba(34, 197, 94, 0.3)' :
      $level === 'medium' ? 'rgba(251, 191, 36, 0.3)' :
        'rgba(239, 68, 68, 0.3)'};
  color: ${({ $level }) =>
    $level === 'good' ? COLORS.success :
      $level === 'medium' ? COLORS.warn :
        COLORS.danger};
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

const CanvasColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
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
  width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,10,30,0.95) 100%);
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 2px solid ${({ $color }) => $color};
  box-shadow: 0 0 30px ${({ $color }) => $color}60;
  text-align: center;
  animation: ${slideUp} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const WinnerTitle = styled.h2<{ $color: string }>`
  font-size: 1.5rem;
  margin: 0;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  font-weight: 700;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
    gap: 0.5rem;
  }
`;

const WinnerStats = styled.div`
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const Sidebar = styled.div`
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.borderAccent};
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem 1.5rem;
  background: ${({ $variant }) =>
    $variant === 'primary'
      ? `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentSoft} 100%)`
      : 'rgba(59, 130, 246, 0.12)'};
  border: 1px solid ${COLORS.borderAccent};
  border-radius: 12px;
  color: ${COLORS.textPrimary};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    background: ${({ $variant }) =>
    $variant === 'primary'
      ? `linear-gradient(135deg, ${COLORS.accentSoft} 0%, ${COLORS.accent} 100%)`
      : 'rgba(59, 130, 246, 0.2)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Section = styled.div`
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1.25rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.textPrimary};
`;

const Label = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.textMuted};
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(59, 130, 246, 0.2);
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${COLORS.accent};
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    background: ${COLORS.accentSoft};
    transform: scale(1.1);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${COLORS.accent};
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  background: ${({ $active }) =>
    $active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.3)'};
  border: 1px solid ${({ $active }) =>
    $active ? COLORS.accent : COLORS.borderAccent};
  border-radius: 8px;
  color: ${({ $active }) => $active ? COLORS.accent : COLORS.textMuted};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }
`;

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

const Leaderboard = styled.div<{ $expanded?: boolean }>`
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1.25rem;
  animation: ${fadeIn} 0.6s ease-out;
  min-height: 400px;
  max-height: ${({ $expanded }) => $expanded ? '1000px' : '400px'};
  overflow-y: auto;
  transition: max-height 0.3s ease;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.borderAccent};
    border-radius: 3px;
  }
`;

const LeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const LeaderboardTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.textPrimary};
`;

const ExpandButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textMuted};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${COLORS.textPrimary};
  }
`;

const LeaderboardItem = styled.div<{ $rank: number; $isWinner: boolean; $color: string; $failed: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: ${({ $isWinner, $color, $failed }) =>
    $failed ? 'rgba(239, 68, 68, 0.1)' :
      $isWinner ? `${$color}20` : 'rgba(0,0,0,0.3)'};
  border: 1px solid ${({ $isWinner, $color, $failed }) =>
    $failed ? 'rgba(239, 68, 68, 0.3)' :
      $isWinner ? $color : COLORS.borderAccent};
  border-radius: 12px;
  animation: ${fadeIn} 0.4s ease-out ${({ $rank }) => $rank * 0.05}s both;
  
  ${({ $isWinner }) => $isWinner && `
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  `}
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
`;

const AlgoInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AlgoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AlgoNameInBoard = styled.span<{ $color: string }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

const AlgoStatus = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${COLORS.textMuted};
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${COLORS.textPrimary};
`;

const GlobalLeaderboard = styled.div`
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1.25rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const GlobalLeaderboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResetButton = styled.button`
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: ${COLORS.danger};
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: translateY(-1px);
  }
`;

const GlobalLeaderboardItem = styled.div<{ $rank: number; $color: string }>`
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(0,0,0,0.3);
  border: 1px solid ${COLORS.borderAccent};
  border-radius: 12px;
  animation: ${fadeIn} 0.4s ease-out ${({ $rank }) => $rank * 0.05}s both;
`;

const GlobalAlgoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const GlobalAlgoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const GlobalAlgoName = styled.span<{ $color: string }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

const GlobalStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
`;

const GlobalStatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const GlobalStatLabel = styled.span`
  opacity: 0.7;
`;

const GlobalStatValue = styled.span`
  color: ${COLORS.textPrimary};
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

// ==================== TYPES ====================
type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs' | 'bmssp';
type MapMode = 'us-cities' | 'metro' | 'highway' | 'regional' | 'large-grid' | 'mega-random' | 'scale-free' | 'small-world' | 'ultra-grid' | 'massive-random' | 'super-scale' | 'mega-world';
type AlgorithmStatus = 'idle' | 'running' | 'finished' | 'winner' | 'failed';

interface City {
  id: number;
  name: string;
  x: number;
  y: number;
  connections: number[];
}

interface AlgorithmConfig {
  name: string;
  emoji: string;
  color: string;
  glow: string;
  funFact: string;
}

interface AlgorithmState {
  id: AlgorithmType;
  path: number[];
  explored: Set<number>;
  frontier: number[];
  status: AlgorithmStatus;
  steps: number;
  distance: number;
  partialPaths: Map<number, number[]>; // Map from frontier node to its path from start
}

interface shortestPathDemoProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
  isTheaterMode?: boolean;
}

interface LeaderboardStats {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  totalRuns: number;
  totalSteps: number;
  totalDistance: number;
  avgSteps: number;
  avgDistance: number;
  fastestSteps: number;
  shortestDistance: number;
}

// ==================== GRAPH CLASS ====================
class CityGraph {
  cities: City[];
  distances: number[][];

  constructor() {
    this.cities = [];
    this.distances = [];
  }

  initializeCities(mode: MapMode): void {
    switch (mode) {
      case 'us-cities':
        this.cities = this.generateUSCities();
        break;
      case 'metro':
        this.cities = this.generateMetro();
        break;
      case 'highway':
        this.cities = this.generateHighway();
        break;
      case 'regional':
        this.cities = this.generateRegional();
        break;
      case 'large-grid':
        this.cities = this.generateLargeGrid(15, 10); // 150 nodes
        break;
      case 'mega-random':
        this.cities = this.generateMegaRandom(300); // 300 nodes
        break;
      case 'scale-free':
        this.cities = this.generateScaleFree(200); // 200 nodes
        break;
      case 'small-world':
        this.cities = this.generateSmallWorld(250); // 250 nodes
        break;
      case 'ultra-grid':
        this.cities = this.generateLargeGrid(40, 25); // 1000 nodes
        break;
      case 'massive-random':
        this.cities = this.generateMegaRandom(2000); // 2000 nodes
        break;
      case 'super-scale':
        this.cities = this.generateScaleFree(1500); // 1500 nodes
        break;
      case 'mega-world':
        this.cities = this.generateSmallWorld(3000); // 3000 nodes
        break;
    }
    this.calculateDistances();
  }

  private generateUSCities(): City[] {
    return [
      { id: 0, name: 'Seattle', x: 150, y: 80, connections: [1, 3, 6] },
      { id: 1, name: 'Portland', x: 140, y: 140, connections: [0, 2, 3] },
      { id: 2, name: 'San Francisco', x: 120, y: 240, connections: [1, 4, 5] },
      { id: 3, name: 'Boise', x: 250, y: 130, connections: [0, 1, 6, 7] },
      { id: 4, name: 'Los Angeles', x: 180, y: 340, connections: [2, 5, 8] },
      { id: 5, name: 'Las Vegas', x: 240, y: 300, connections: [2, 4, 8, 9] },
      { id: 6, name: 'Helena', x: 350, y: 90, connections: [0, 3, 7, 10] },
      { id: 7, name: 'Salt Lake City', x: 320, y: 210, connections: [3, 6, 9, 11] },
      { id: 8, name: 'Phoenix', x: 300, y: 380, connections: [4, 5, 12] },
      { id: 9, name: 'Denver', x: 430, y: 240, connections: [5, 7, 11, 12, 13] },
      { id: 10, name: 'Fargo', x: 520, y: 100, connections: [6, 11, 14] },
      { id: 11, name: 'Omaha', x: 550, y: 220, connections: [7, 9, 10, 13, 15] },
      { id: 12, name: 'Albuquerque', x: 380, y: 360, connections: [8, 9, 13, 16] },
      { id: 13, name: 'Kansas City', x: 630, y: 260, connections: [9, 11, 12, 15, 17] },
      { id: 14, name: 'Minneapolis', x: 650, y: 130, connections: [10, 15, 18] },
      { id: 15, name: 'Des Moines', x: 680, y: 200, connections: [11, 13, 14, 18] },
      { id: 16, name: 'Dallas', x: 580, y: 400, connections: [12, 17, 19] },
      { id: 17, name: 'St. Louis', x: 730, y: 290, connections: [13, 16, 18, 20] },
      { id: 18, name: 'Chicago', x: 780, y: 190, connections: [14, 15, 17, 21] },
      { id: 19, name: 'Houston', x: 650, y: 480, connections: [16, 20, 22] },
      { id: 20, name: 'Memphis', x: 770, y: 360, connections: [17, 19, 21, 23] },
      { id: 21, name: 'Detroit', x: 860, y: 200, connections: [18, 20, 24] },
      { id: 22, name: 'New Orleans', x: 790, y: 470, connections: [19, 23] },
      { id: 23, name: 'Atlanta', x: 880, y: 390, connections: [20, 22, 24, 25] },
      { id: 24, name: 'Cleveland', x: 930, y: 230, connections: [21, 23, 26] },
      { id: 25, name: 'Charlotte', x: 950, y: 360, connections: [23, 26, 27] },
      { id: 26, name: 'Pittsburgh', x: 1000, y: 260, connections: [24, 25, 27, 28] },
      { id: 27, name: 'Washington', x: 1040, y: 320, connections: [25, 26, 28] },
      { id: 28, name: 'New York', x: 1070, y: 250, connections: [26, 27, 29] },
      { id: 29, name: 'Boston', x: 1100, y: 190, connections: [28] }
    ];
  }

  private generateMetro(): City[] {
    return [
      { id: 0, name: 'Downtown', x: 600, y: 350, connections: [1, 2, 3, 4] },
      { id: 1, name: 'Midtown', x: 600, y: 250, connections: [0, 5, 6] },
      { id: 2, name: 'Eastside', x: 750, y: 350, connections: [0, 7, 8] },
      { id: 3, name: 'Westside', x: 450, y: 350, connections: [0, 9, 10] },
      { id: 4, name: 'Southport', x: 600, y: 500, connections: [0, 11, 12] },
      { id: 5, name: 'Uptown', x: 600, y: 150, connections: [1, 13] },
      { id: 6, name: 'Financial', x: 700, y: 250, connections: [1, 2, 14] },
      { id: 7, name: 'Tech Hub', x: 850, y: 300, connections: [2, 8, 15] },
      { id: 8, name: 'Innovation Park', x: 800, y: 450, connections: [2, 4, 16] },
      { id: 9, name: 'Arts District', x: 350, y: 300, connections: [3, 10] },
      { id: 10, name: 'University', x: 400, y: 450, connections: [3, 4, 17] },
      { id: 11, name: 'Harbor', x: 550, y: 580, connections: [4, 12, 18] },
      { id: 12, name: 'Airport', x: 700, y: 550, connections: [4, 8, 19] },
      { id: 13, name: 'North End', x: 550, y: 100, connections: [5] },
      { id: 14, name: 'Business Park', x: 800, y: 200, connections: [6, 7] },
      { id: 15, name: 'Suburbs East', x: 950, y: 350, connections: [7] },
      { id: 16, name: 'Industrial', x: 850, y: 500, connections: [8, 12] },
      { id: 17, name: 'Suburbs West', x: 300, y: 500, connections: [10] },
      { id: 18, name: 'Waterfront', x: 500, y: 630, connections: [11] },
      { id: 19, name: 'Cargo Terminal', x: 750, y: 620, connections: [12] }
    ];
  }

  private generateHighway(): City[] {
    const cities: City[] = [];
    const mainHighway = [
      { name: 'City A', x: 150, y: 350 },
      { name: 'City B', x: 300, y: 300 },
      { name: 'City C', x: 450, y: 280 },
      { name: 'City D', x: 600, y: 350 },
      { name: 'City E', x: 750, y: 320 },
      { name: 'City F', x: 900, y: 350 },
      { name: 'City G', x: 1050, y: 340 }
    ];

    const branches = [
      { name: 'North 1', x: 300, y: 180, connectTo: 1 },
      { name: 'North 2', x: 600, y: 200, connectTo: 3 },
      { name: 'North 3', x: 900, y: 200, connectTo: 5 },
      { name: 'South 1', x: 300, y: 450, connectTo: 1 },
      { name: 'South 2', x: 600, y: 500, connectTo: 3 },
      { name: 'South 3', x: 900, y: 480, connectTo: 5 }
    ];

    mainHighway.forEach((city, i) => {
      const connections: number[] = [];
      if (i > 0) connections.push(i - 1);
      if (i < mainHighway.length - 1) connections.push(i + 1);
      cities.push({ id: i, ...city, connections });
    });

    branches.forEach((branch, i) => {
      const id = mainHighway.length + i;
      cities.push({
        id,
        ...branch,
        connections: [branch.connectTo]
      });
      cities[branch.connectTo].connections.push(id);
    });

    return cities;
  }

  private generateRegional(): City[] {
    const cities: City[] = [];
    const regions = [
      { name: 'Region A', cx: 300, cy: 250, cities: 5 },
      { name: 'Region B', cx: 700, cy: 250, cities: 5 },
      { name: 'Region C', cx: 500, cy: 450, cities: 4 }
    ];

    let idCounter = 0;
    regions.forEach((region, regionIdx) => {
      const startId = idCounter;
      const angleStep = (Math.PI * 2) / region.cities;

      for (let i = 0; i < region.cities; i++) {
        const angle = i * angleStep;
        const radius = 100;
        const x = region.cx + Math.cos(angle) * radius;
        const y = region.cy + Math.sin(angle) * radius;

        const connections: number[] = [];
        if (i > 0) connections.push(idCounter - 1);
        if (i === region.cities - 1) connections.push(startId);
        if (i < region.cities - 1) connections.push(idCounter + 1);

        cities.push({
          id: idCounter,
          name: `${region.name.slice(-1)}${i + 1}`,
          x, y,
          connections
        });
        idCounter++;
      }
    });

    cities[2].connections.push(5);
    cities[5].connections.push(2);
    cities[7].connections.push(10);
    cities[10].connections.push(7);

    return cities;
  }

  // ==================== LARGE NETWORK GENERATORS ====================

  private generateLargeGrid(cols: number, rows: number): City[] {
    const cities: City[] = [];
    const cellWidth = CANVAS_WIDTH / (cols + 1);
    const cellHeight = CANVAS_HEIGHT / (rows + 1);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const id = row * cols + col;
        const x = (col + 1) * cellWidth;
        const y = (row + 1) * cellHeight;

        const connections: number[] = [];

        // Connect to neighbors (up, down, left, right)
        if (col > 0) connections.push(id - 1); // left
        if (col < cols - 1) connections.push(id + 1); // right
        if (row > 0) connections.push(id - cols); // up
        if (row < rows - 1) connections.push(id + cols); // down

        // Add some diagonal connections for variety
        if (Math.random() > 0.7 && col > 0 && row > 0) {
          connections.push(id - cols - 1); // diagonal up-left
        }
        if (Math.random() > 0.7 && col < cols - 1 && row < rows - 1) {
          connections.push(id + cols + 1); // diagonal down-right
        }

        cities.push({
          id,
          name: `N${id}`,
          x,
          y,
          connections
        });
      }
    }

    return cities;
  }

  private generateMegaRandom(count: number): City[] {
    const cities: City[] = [];
    const margin = 50;

    // Generate random positions
    for (let i = 0; i < count; i++) {
      cities.push({
        id: i,
        name: `N${i}`,
        x: margin + Math.random() * (CANVAS_WIDTH - margin * 2),
        y: margin + Math.random() * (CANVAS_HEIGHT - margin * 2),
        connections: []
      });
    }

    // Connect each node to k nearest neighbors
    const k = Math.min(8, Math.max(4, Math.floor(Math.sqrt(count)))); // adaptive degree

    for (let i = 0; i < count; i++) {
      const distances: Array<{ id: number; dist: number }> = [];

      for (let j = 0; j < count; j++) {
        if (i !== j) {
          const dx = cities[i].x - cities[j].x;
          const dy = cities[i].y - cities[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          distances.push({ id: j, dist });
        }
      }

      distances.sort((a, b) => a.dist - b.dist);

      for (let j = 0; j < k && j < distances.length; j++) {
        const neighborId = distances[j].id;
        if (!cities[i].connections.includes(neighborId)) {
          cities[i].connections.push(neighborId);
        }
        if (!cities[neighborId].connections.includes(i)) {
          cities[neighborId].connections.push(i);
        }
      }
    }

    return cities;
  }

  private generateScaleFree(count: number): City[] {
    // Barabási-Albert model for scale-free network
    const cities: City[] = [];
    const margin = 50;
    const m = 3; // edges to add per new node

    // Start with a small complete graph
    const initialNodes = 5;
    for (let i = 0; i < initialNodes; i++) {
      const angle = (i / initialNodes) * Math.PI * 2;
      const cx = CANVAS_WIDTH / 2;
      const cy = CANVAS_HEIGHT / 2;
      const radius = 100;

      cities.push({
        id: i,
        name: `N${i}`,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        connections: []
      });
    }

    // Connect initial nodes in a ring
    for (let i = 0; i < initialNodes; i++) {
      cities[i].connections.push((i + 1) % initialNodes);
      cities[i].connections.push((i - 1 + initialNodes) % initialNodes);
    }

    // Add remaining nodes using preferential attachment
    for (let i = initialNodes; i < count; i++) {
      cities.push({
        id: i,
        name: `N${i}`,
        x: margin + Math.random() * (CANVAS_WIDTH - margin * 2),
        y: margin + Math.random() * (CANVAS_HEIGHT - margin * 2),
        connections: []
      });

      // Calculate degree distribution for preferential attachment
      const degrees: number[] = cities.slice(0, i).map(c => c.connections.length);
      const totalDegree = degrees.reduce((sum, d) => sum + d, 0);

      if (totalDegree === 0) continue;

      const targets = new Set<number>();
      let attempts = 0;
      while (targets.size < Math.min(m, i) && attempts < 50) {
        const rand = Math.random() * totalDegree;
        let cumulative = 0;

        for (let j = 0; j < i; j++) {
          cumulative += degrees[j];
          if (rand <= cumulative && !targets.has(j)) {
            targets.add(j);
            break;
          }
        }
        attempts++;
      }

      targets.forEach(target => {
        cities[i].connections.push(target);
        cities[target].connections.push(i);
      });
    }

    return cities;
  }

  private generateSmallWorld(count: number): City[] {
    // Watts-Strogatz model for small-world network
    const cities: City[] = [];
    const k = Math.min(8, Math.max(4, Math.floor(Math.sqrt(count)))); // adaptive initial connections
    const beta = 0.3; // rewiring probability

    // Arrange nodes in a circle
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.4;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      cities.push({
        id: i,
        name: `N${i}`,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        connections: []
      });
    }

    // Connect each node to k nearest neighbors
    for (let i = 0; i < count; i++) {
      for (let j = 1; j <= k / 2; j++) {
        const target = (i + j) % count;
        if (!cities[i].connections.includes(target)) {
          cities[i].connections.push(target);
          cities[target].connections.push(i);
        }
      }
    }

    // Rewire edges with probability beta
    for (let i = 0; i < count; i++) {
      const originalConnections = [...cities[i].connections];
      for (const oldTarget of originalConnections) {
        if (oldTarget > i && Math.random() < beta) {
          // Rewire to random node
          let newTarget = Math.floor(Math.random() * count);
          let attempts = 0;
          while ((newTarget === i || cities[i].connections.includes(newTarget)) && attempts < 10) {
            newTarget = Math.floor(Math.random() * count);
            attempts++;
          }

          if (newTarget !== i && !cities[i].connections.includes(newTarget)) {
            // Remove old connection
            cities[i].connections = cities[i].connections.filter(c => c !== oldTarget);
            cities[oldTarget].connections = cities[oldTarget].connections.filter(c => c !== i);

            // Add new connection
            cities[i].connections.push(newTarget);
            cities[newTarget].connections.push(i);
          }
        }
      }
    }

    return cities;
  }

  private calculateDistances(): void {
    const n = this.cities.length;
    this.distances = Array(n).fill(0).map(() => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
      this.distances[i][i] = 0;
    }

    this.cities.forEach(city => {
      city.connections.forEach(connId => {
        const target = this.cities[connId];
        const dx = city.x - target.x;
        const dy = city.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.distances[city.id][connId] = dist;
      });
    });
  }

  getDistance(from: number, to: number): number {
    return this.distances[from][to];
  }

  getNeighbors(cityId: number): number[] {
    return this.cities[cityId].connections;
  }

  getHeuristic(from: number, to: number): number {
    // A* heuristic: Euclidean distance (straight-line distance)
    // This is admissible (never overestimates) and consistent
    // Formula: √((x₂-x₁)² + (y₂-y₁)²)
    const fromCity = this.cities[from];
    const toCity = this.cities[to];
    const dx = fromCity.x - toCity.x;
    const dy = fromCity.y - toCity.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getCityCount(): number {
    return this.cities.length;
  }
}

// ==================== PATHFINDING ALGORITHM BASE ====================
abstract class PathfindingAlgorithm {
  id: AlgorithmType;
  config: AlgorithmConfig;
  graph: CityGraph;
  startCity: number;
  goalCity: number;

  path: number[];
  explored: Set<number>;
  frontier: number[];
  status: AlgorithmStatus;
  steps: number;
  distance: number;
  partialPaths: Map<number, number[]>;

  protected internalState: any;

  constructor(id: AlgorithmType, config: AlgorithmConfig, graph: CityGraph, startCity: number, goalCity: number) {
    this.id = id;
    this.config = config;
    this.graph = graph;
    this.startCity = startCity;
    this.goalCity = goalCity;

    this.path = [];
    this.explored = new Set();
    this.frontier = [];
    this.status = 'running';
    this.steps = 0;
    this.distance = 0;
    this.partialPaths = new Map();

    this.internalState = this.initializeState();
  }

  abstract initializeState(): any;
  abstract step(): boolean;

  calculateTotalDistance(path: number[]): number {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      total += this.graph.getDistance(path[i], path[i + 1]);
    }
    return total;
  }

  reconstructPath(cameFrom: Map<number, number>, current: number): number[] {
    const path: number[] = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      path.unshift(current);
    }
    return path;
  }

  markFinished(): void {
    this.status = 'finished';
  }

  markWinner(): void {
    this.status = 'winner';
  }

  markFailed(): void {
    this.status = 'failed';
  }

  isComplete(): boolean {
    return this.status === 'finished' || this.status === 'winner' || this.status === 'failed';
  }

  getState(): AlgorithmState {
    return {
      id: this.id,
      path: this.path,
      explored: this.explored,
      frontier: this.frontier,
      status: this.status,
      steps: this.steps,
      distance: this.distance,
      partialPaths: this.partialPaths
    };
  }
}

// ==================== DIJKSTRA ====================
class DijkstraAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const distances = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const pq: Array<{ city: number; dist: number }> = [];

    distances.set(this.startCity, 0);
    pq.push({ city: this.startCity, dist: 0 });
    this.frontier = [this.startCity];

    return { distances, cameFrom, pq };
  }

  step(): boolean {
    if (this.internalState.pq.length === 0) {
      this.markFailed();
      return false;
    }

    this.internalState.pq.sort((a: { dist: number; }, b: { dist: number; }) => a.dist - b.dist);
    const { city: current, dist: currentDist } = this.internalState.pq.shift()!;

    this.frontier = this.internalState.pq.slice(0, 50).map((item: any) => item.city);

    // Update partial paths for frontier nodes
    this.partialPaths.clear();
    this.frontier.forEach(nodeId => {
      const partialPath = this.reconstructPath(this.internalState.cameFrom, nodeId);
      this.partialPaths.set(nodeId, partialPath);
    });

    if (this.explored.has(current)) return true;

    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (this.explored.has(neighbor)) return;

      const newDist = currentDist + this.graph.getDistance(current, neighbor);
      const oldDist = this.internalState.distances.get(neighbor) ?? Infinity;

      if (newDist < oldDist) {
        this.internalState.distances.set(neighbor, newDist);
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.pq.push({ city: neighbor, dist: newDist });
      }
    });

    return true;
  }
}

// ==================== A* ====================
class AStarAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const openSet: Array<{ city: number; f: number }> = [];

    gScore.set(this.startCity, 0);
    fScore.set(this.startCity, this.graph.getHeuristic(this.startCity, this.goalCity));
    openSet.push({ city: this.startCity, f: fScore.get(this.startCity)! });
    this.frontier = [this.startCity];

    return { gScore, fScore, cameFrom, openSet };
  }

  step(): boolean {
    if (this.internalState.openSet.length === 0) {
      this.markFailed();
      return false;
    }

    this.internalState.openSet.sort((a: { f: number; }, b: { f: number; }) => a.f - b.f);
    const { city: current } = this.internalState.openSet.shift()!;

    this.frontier = this.internalState.openSet.slice(0, 50).map((item: any) => item.city);

    // Update partial paths for frontier nodes
    this.partialPaths.clear();
    this.frontier.forEach(nodeId => {
      const partialPath = this.reconstructPath(this.internalState.cameFrom, nodeId);
      this.partialPaths.set(nodeId, partialPath);
    });

    if (this.explored.has(current)) return true;

    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const currentG = this.internalState.gScore.get(current) ?? Infinity;
    const neighbors = this.graph.getNeighbors(current);

    neighbors.forEach(neighbor => {
      if (this.explored.has(neighbor)) return;

      const tentativeG = currentG + this.graph.getDistance(current, neighbor);
      const oldG = this.internalState.gScore.get(neighbor) ?? Infinity;

      if (tentativeG < oldG) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.gScore.set(neighbor, tentativeG);
        const h = this.graph.getHeuristic(neighbor, this.goalCity);
        const f = tentativeG + h;
        this.internalState.fScore.set(neighbor, f);

        const existingIndex = this.internalState.openSet.findIndex((item: any) => item.city === neighbor);
        if (existingIndex >= 0) {
          this.internalState.openSet[existingIndex].f = f;
        } else {
          this.internalState.openSet.push({ city: neighbor, f });
        }
      }
    });

    return true;
  }
}

// ==================== BFS ====================
class BFSAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const queue: number[] = [this.startCity];
    const cameFrom = new Map<number, number>();
    this.frontier = [this.startCity];
    return { queue, cameFrom };
  }

  step(): boolean {
    if (this.internalState.queue.length === 0) {
      this.markFailed();
      return false;
    }

    const current = this.internalState.queue.shift()!;
    this.frontier = this.internalState.queue.slice(0, 50);

    // Update partial paths for frontier nodes
    this.partialPaths.clear();
    this.frontier.forEach(nodeId => {
      const partialPath = this.reconstructPath(this.internalState.cameFrom, nodeId);
      this.partialPaths.set(nodeId, partialPath);
    });

    if (this.explored.has(current)) return true;

    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (!this.explored.has(neighbor) && !this.internalState.cameFrom.has(neighbor)) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.queue.push(neighbor);
      }
    });

    return true;
  }
}

// ==================== DFS ====================
class DFSAlgorithm extends PathfindingAlgorithm {
  initializeState(): any {
    const stack: number[] = [this.startCity];
    const cameFrom = new Map<number, number>();
    this.frontier = [this.startCity];
    return { stack, cameFrom };
  }

  step(): boolean {
    if (this.internalState.stack.length === 0) {
      this.markFailed();
      return false;
    }

    const current = this.internalState.stack.pop()!;
    this.frontier = this.internalState.stack.slice(-50);

    // Update partial paths for frontier nodes
    this.partialPaths.clear();
    this.frontier.forEach(nodeId => {
      const partialPath = this.reconstructPath(this.internalState.cameFrom, nodeId);
      this.partialPaths.set(nodeId, partialPath);
    });

    if (this.explored.has(current)) return true;

    this.explored.add(current);
    this.steps++;

    if (current === this.goalCity) {
      this.path = this.reconstructPath(this.internalState.cameFrom, current);
      this.distance = this.calculateTotalDistance(this.path);
      this.markFinished();
      return false;
    }

    const neighbors = this.graph.getNeighbors(current);
    neighbors.forEach(neighbor => {
      if (!this.explored.has(neighbor) && !this.internalState.cameFrom.has(neighbor)) {
        this.internalState.cameFrom.set(neighbor, current);
        this.internalState.stack.push(neighbor);
      }
    });

    return true;
  }
}

// ==================== BMSSP (Optimized for large networks) ====================
class BMSSPAlgorithm extends PathfindingAlgorithm {
  private readonly WORK_PER_STEP = 5; // Process 5 nodes per step

  initializeState(): any {
    const k = this.graph.getCityCount();
    const bd = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    const pq: Array<{ city: number; dist: number }> = [];

    bd.set(this.startCity, 0);
    pq.push({ city: this.startCity, dist: 0 });
    this.frontier = [this.startCity];

    return { bd, cameFrom, pq, k };
  }

  step(): boolean {
    const state = this.internalState;

    if (state.pq.length === 0) {
      if ((state.bd.get(this.goalCity) ?? Infinity) < Infinity) {
        this.path = this.reconstructPath(state.cameFrom, this.goalCity);
        this.distance = this.calculateTotalDistance(this.path);
        this.markFinished();
      } else {
        this.markFailed();
      }
      return false;
    }

    // Process multiple nodes per step
    for (let i = 0; i < this.WORK_PER_STEP && state.pq.length > 0; i++) {
      state.pq.sort((a: { dist: number; }, b: { dist: number; }) => a.dist - b.dist);
      const { city: current, dist: currentDist } = state.pq.shift()!;

      if (this.explored.has(current)) continue;

      this.explored.add(current);
      this.steps++;

      if (current === this.goalCity) {
        this.path = this.reconstructPath(state.cameFrom, current);
        this.distance = this.calculateTotalDistance(this.path);
        this.markFinished();
        state.pq = [];
        return false;
      }

      const neighbors = this.graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (this.explored.has(neighbor)) continue;

        const newDist = currentDist + this.graph.getDistance(current, neighbor);
        const oldDist = state.bd.get(neighbor) ?? Infinity;

        if (newDist < oldDist) {
          state.bd.set(neighbor, newDist);
          state.cameFrom.set(neighbor, current);

          const existingIndex = state.pq.findIndex((item: { city: number; }) => item.city === neighbor);
          if (existingIndex >= 0) {
            state.pq[existingIndex].dist = newDist;
          } else {
            state.pq.push({ city: neighbor, dist: newDist });
          }
        }
      }
    }

    this.frontier = state.pq
      .slice()
      .sort((a: { dist: number; }, b: { dist: number; }) => a.dist - b.dist)
      .slice(0, 50)
      .map((item: { city: any; }) => item.city);

    // Update partial paths for frontier nodes
    this.partialPaths.clear();
    this.frontier.forEach(nodeId => {
      const partialPath = this.reconstructPath(state.cameFrom, nodeId);
      this.partialPaths.set(nodeId, partialPath);
    });

    return true;
  }
}

// ==================== OPTIMIZED RENDERER ====================
class GraphRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: CityGraph;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private staticLayerDirty: boolean = true;

  constructor(canvas: HTMLCanvasElement, graph: CityGraph) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.graph = graph;

    // Create offscreen canvas for static elements
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(algorithms: PathfindingAlgorithm[], startCity: number, goalCity: number): void {
    this.clear();

    const nodeCount = this.graph.getCityCount();
    const isLargeNetwork = nodeCount > LARGE_NETWORK;
    const isMediumNetwork = nodeCount > MEDIUM_NETWORK;

    // Render static layer (connections and cities) only when dirty
    if (this.staticLayerDirty && this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawConnections(this.offscreenCtx, isLargeNetwork, isMediumNetwork);
      this.staticLayerDirty = false;
    }

    // Draw static layer
    if (this.offscreenCanvas) {
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }

    // Draw dynamic elements
    this.drawAlgorithmStates(algorithms, isLargeNetwork, isMediumNetwork);
    this.drawCities(algorithms, startCity, goalCity, isLargeNetwork, isMediumNetwork);
  }

  markStaticLayerDirty(): void {
    this.staticLayerDirty = true;
  }

  private drawConnections(ctx: CanvasRenderingContext2D, isLarge: boolean, isMedium: boolean): void {
    if (isLarge) {
      // For ultra-large networks, draw very subtle connections
      ctx.strokeStyle = COLORS.road;
      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 0.05;
    } else if (isMedium) {
      ctx.strokeStyle = COLORS.road;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.1;
    } else {
      ctx.strokeStyle = COLORS.road;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
    }

    this.graph.cities.forEach(city => {
      city.connections.forEach(connId => {
        if (city.id < connId) {
          const target = this.graph.cities[connId];
          if (target) {
            ctx.beginPath();
            ctx.moveTo(city.x, city.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      });
    });

    ctx.globalAlpha = 1;
  }

  private drawAlgorithmStates(algorithms: PathfindingAlgorithm[], isLarge: boolean, isMedium: boolean): void {
    algorithms.forEach(algo => {
      // Draw partial paths (current exploration paths) with lower opacity
      if (algo.partialPaths && algo.partialPaths.size > 0 && algo.status === 'running') {
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = algo.config.color;
        this.ctx.lineWidth = isLarge ? 1 : isMedium ? 2 : 3;

        // Draw adaptive number of partial paths based on network size
        const maxPaths = isLarge ? 5 : isMedium ? 15 : 25;
        const pathsToDraw = Array.from(algo.partialPaths.entries()).slice(0, maxPaths);

        pathsToDraw.forEach(([nodeId, path]) => {
          if (path.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.graph.cities[path[0]].x, this.graph.cities[path[0]].y);
            for (let i = 1; i < path.length; i++) {
              const city = this.graph.cities[path[i]];
              if (city) {
                this.ctx.lineTo(city.x, city.y);
              }
            }
            this.ctx.stroke();
          }
        });
      }

      // Draw final path (when complete) with full opacity
      if (algo.path.length > 1) {
        this.ctx.globalAlpha = 0.9;
        this.ctx.strokeStyle = algo.config.color;
        this.ctx.lineWidth = isLarge ? 3 : isMedium ? 4 : 5;
        this.ctx.shadowColor = algo.config.glow;
        this.ctx.shadowBlur = isLarge ? 8 : isMedium ? 10 : 15;

        this.ctx.beginPath();
        this.ctx.moveTo(this.graph.cities[algo.path[0]].x, this.graph.cities[algo.path[0]].y);
        for (let i = 1; i < algo.path.length; i++) {
          const city = this.graph.cities[algo.path[i]];
          this.ctx.lineTo(city.x, city.y);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }

      this.ctx.globalAlpha = 1;
    });
  }

  private drawCities(algorithms: PathfindingAlgorithm[], startCity: number, goalCity: number, isLarge: boolean, isMedium: boolean): void {
    const nodeSize = isLarge ? 1.5 : isMedium ? 4 : 8;
    const specialSize = isLarge ? 8 : isMedium ? 10 : 14;

    // Draw all cities
    this.graph.cities.forEach(city => {
      const isStart = city.id === startCity;
      const isGoal = city.id === goalCity;

      if (isStart) {
        this.ctx.fillStyle = COLORS.success;
        this.ctx.shadowColor = COLORS.success;
        this.ctx.shadowBlur = isLarge ? 12 : 10;
      } else if (isGoal) {
        this.ctx.fillStyle = COLORS.danger;
        this.ctx.shadowColor = COLORS.danger;
        this.ctx.shadowBlur = isLarge ? 12 : 10;
      } else {
        this.ctx.fillStyle = isLarge ? 'rgba(222, 229, 239, 0.3)' : COLORS.textMuted;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }

      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, isStart || isGoal ? specialSize : nodeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Only show names for small networks or start/goal
      if (!isMedium && !isLarge && (isStart || isGoal)) {
        this.ctx.fillStyle = COLORS.textPrimary;
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(city.name, city.x, city.y - 20);
      }
    });
  }
}

// ==================== SIMULATION CONTROLLER ====================
class SimulationController {
  private graph: CityGraph;
  private algorithms: PathfindingAlgorithm[];
  private renderer: GraphRenderer;
  private startCity: number;
  private goalCity: number;
  private winner: AlgorithmType | null;
  private completionCheckInterval: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.graph = new CityGraph();
    this.algorithms = [];
    this.renderer = new GraphRenderer(canvas, this.graph);
    this.startCity = 0;
    this.goalCity = 0;
    this.winner = null;
  }

  initialize(mapMode: MapMode, selectedAlgos: AlgorithmType[], algorithmConfigs: Record<AlgorithmType, AlgorithmConfig>): void {
    this.graph.initializeCities(mapMode);
    this.renderer.markStaticLayerDirty();

    const cityCount = this.graph.getCityCount();

    // Smart city selection for large networks
    if (cityCount > 500) {
      // For very large networks, ensure start and goal are far apart
      this.startCity = Math.floor(Math.random() * (cityCount / 4));
      this.goalCity = Math.floor(cityCount * 3 / 4 + Math.random() * (cityCount / 4));
    } else {
      this.startCity = Math.floor(Math.random() * cityCount);
      let attempts = 0;
      do {
        this.goalCity = Math.floor(Math.random() * cityCount);
        attempts++;
      } while (
        (this.goalCity === this.startCity ||
          this.graph.getHeuristic(this.startCity, this.goalCity) < 200) &&
        attempts < 20
      );

      if (this.goalCity === this.startCity) {
        this.goalCity = (this.startCity + Math.floor(cityCount / 2)) % cityCount;
      }
    }

    this.winner = null;
    this.completionCheckInterval = 0;

    this.algorithms = selectedAlgos.map(algoType => {
      const config = algorithmConfigs[algoType];
      return this.createAlgorithm(algoType, config);
    });
  }

  private createAlgorithm(type: AlgorithmType, config: AlgorithmConfig): PathfindingAlgorithm {
    switch (type) {
      case 'dijkstra':
        return new DijkstraAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'astar':
        return new AStarAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'bfs':
        return new BFSAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'dfs':
        return new DFSAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
      case 'bmssp':
        return new BMSSPAlgorithm(type, config, this.graph, this.startCity, this.goalCity);
    }
  }

  step(): boolean {
    let anyRunning = false;

    // Step all non-complete algorithms
    this.algorithms.forEach(algo => {
      if (!algo.isComplete()) {
        const shouldContinue = algo.step();
        if (shouldContinue) {
          anyRunning = true;
        }

        // Check for winner
        if (algo.status === 'finished' && !this.winner) {
          this.winner = algo.id;
          algo.markWinner();
        }
      }
    });

    // Periodically check if all are complete to avoid infinite loops
    this.completionCheckInterval++;
    if (this.completionCheckInterval > 100) {
      this.completionCheckInterval = 0;
      const allComplete = this.algorithms.every(algo => algo.isComplete());
      if (allComplete) {
        return false;
      }
    }

    return anyRunning;
  }

  render(): void {
    this.renderer.render(this.algorithms, this.startCity, this.goalCity);
  }

  getAlgorithmStates(): AlgorithmState[] {
    return this.algorithms.map(algo => algo.getState());
  }

  getWinner(): AlgorithmType | null {
    return this.winner;
  }

  getCities(): City[] {
    return this.graph.cities;
  }

  getStartCity(): number {
    return this.startCity;
  }

  getGoalCity(): number {
    return this.goalCity;
  }

  isSimulationComplete(): boolean {
    return this.algorithms.every(algo => algo.isComplete());
  }
}

// ==================== LEADERBOARD MANAGER ====================
class LeaderboardManager {
  private static STORAGE_KEY = 'pathfinding_leaderboard';

  static getStats(): Record<AlgorithmType, LeaderboardStats> {
    if (typeof window === 'undefined') return this.getDefaultStats();

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return this.getDefaultStats();

    try {
      const parsed = JSON.parse(stored);
      const defaults = this.getDefaultStats();

      // Merge stored with defaults to ensure all algorithms exist
      // This handles cases where new algorithms were added after initial storage
      const merged: Record<AlgorithmType, LeaderboardStats> = { ...defaults };

      for (const key of Object.keys(defaults) as AlgorithmType[]) {
        if (parsed[key]) {
          merged[key] = { ...defaults[key], ...parsed[key] };
        }
      }

      return merged;
    } catch {
      return this.getDefaultStats();
    }
  }

  static updateStats(algorithmStates: AlgorithmState[], winner: AlgorithmType | null): void {
    if (typeof window === 'undefined') return;

    const stats = this.getStats();

    // Get all successful algorithms (not failed, has a path)
    const successfulAlgos = algorithmStates
      .filter(algo => algo.status !== 'failed' && algo.path.length > 0)
      .sort((a, b) => {
        // Sort by steps first
        if (a.steps !== b.steps) return a.steps - b.steps;
        // If steps equal, sort by distance
        return a.distance - b.distance;
      });

    console.log('📊 Updating leaderboard stats:', {
      totalCompeting: algorithmStates.length,
      successful: successfulAlgos.length,
      placements: successfulAlgos.map((a, i) => `${i + 1}. ${a.id} (${a.steps} steps, status: ${a.status}, pathLen: ${a.path.length})`)
    });

    // Award places to successful algorithms
    successfulAlgos.forEach((algo, index) => {
      const algoStats = stats[algo.id];

      // Safety check - ensure stats exist for this algorithm
      if (!algoStats) {
        console.warn(`⚠️ No stats entry for algorithm: ${algo.id}`);
        return;
      }

      // Only increment totalRuns for successful completions
      // (This keeps averages accurate - only successful runs contribute to totals)
      algoStats.totalRuns++;

      // Award placement
      if (index === 0) {
        algoStats.firstPlace++;
        console.log(`🥇 ${algo.id} gets 1st place`);
      } else if (index === 1) {
        algoStats.secondPlace++;
        console.log(`🥈 ${algo.id} gets 2nd place`);
      } else if (index === 2) {
        algoStats.thirdPlace++;
        console.log(`🥉 ${algo.id} gets 3rd place`);
      }

      // Update cumulative stats
      algoStats.totalSteps += algo.steps;
      algoStats.totalDistance += algo.distance;

      // Recalculate averages based on successful runs only
      algoStats.avgSteps = algoStats.totalSteps / algoStats.totalRuns;
      algoStats.avgDistance = algoStats.totalDistance / algoStats.totalRuns;

      // Track personal bests
      if (algoStats.fastestSteps === 0 || algo.steps < algoStats.fastestSteps) {
        algoStats.fastestSteps = algo.steps;
      }

      if (algoStats.shortestDistance === 0 || algo.distance < algoStats.shortestDistance) {
        algoStats.shortestDistance = algo.distance;
      }
    });

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    console.log('✅ Stats saved to localStorage', stats);
  }

  static reset(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private static getDefaultStats(): Record<AlgorithmType, LeaderboardStats> {
    const algorithms: AlgorithmType[] = ['dijkstra', 'astar', 'bfs', 'dfs', 'bmssp'];
    const stats: any = {};

    algorithms.forEach(algo => {
      stats[algo] = {
        firstPlace: 0,
        secondPlace: 0,
        thirdPlace: 0,
        totalRuns: 0,
        totalSteps: 0,
        totalDistance: 0,
        avgSteps: 0,
        avgDistance: 0,
        fastestSteps: 0,
        shortestDistance: 0
      };
    });

    return stats;
  }
}


// ==================== REACT COMPONENT ====================
export default function ShortestPathAlgorithmDemo({
  isDark = false,
  isRunning: isRunningProp = false,
  speed: speedProp = 3,
  isTheaterMode = false
}: shortestPathDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SimulationController | null>(null);
  const frameRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(isRunningProp);
  const [localSpeed, setLocalSpeed] = useState(speedProp);
  const [showStats, setShowStats] = useState(true);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(true);
  const [expandedStats, setExpandedStats] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>('massive-random');
  const [selectedAlgos, setSelectedAlgos] = useState<AlgorithmType[]>([
    'dijkstra', 'astar', 'bfs', 'dfs', 'bmssp'
  ]);

  const [algorithmStates, setAlgorithmStates] = useState<AlgorithmState[]>([]);
  const [winner, setWinner] = useState<AlgorithmType | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [startCity, setStartCity] = useState(0);
  const [goalCity, setGoalCity] = useState(0);
  const [globalStats, setGlobalStats] = useState<Record<AlgorithmType, LeaderboardStats>>(LeaderboardManager.getStats());

  // Use refs to track mutable state that needs to be accessed in callbacks without stale closures
  const statsUpdatedRef = useRef(false);
  const isPlayingRef = useRef(isPlaying);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    setIsPlaying(isRunningProp);
  }, [isRunningProp]);

  useEffect(() => {
    setLocalSpeed(speedProp);
  }, [speedProp]);

  // Refresh global stats from localStorage periodically to ensure UI stays in sync
  useEffect(() => {
    const refreshStats = () => {
      setGlobalStats({ ...LeaderboardManager.getStats() });
    };

    // Refresh on mount
    refreshStats();

    // Set up interval to refresh every 2 seconds (catches any missed updates)
    const interval = setInterval(refreshStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const algorithmConfigs: Record<AlgorithmType, AlgorithmConfig> = {
    dijkstra: {
      name: "Dijkstra's",
      emoji: '🔵',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.6)',
      funFact: 'Guarantees shortest path'
    },
    astar: {
      name: 'A* Search',
      emoji: '⭐',
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.6)',
      funFact: 'Euclidean heuristic-guided'
    },
    bfs: {
      name: 'BFS',
      emoji: '🌊',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.6)',
      funFact: 'Level by level'
    },
    dfs: {
      name: 'DFS',
      emoji: '🌲',
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.6)',
      funFact: 'Depth first'
    },
    bmssp: {
      name: 'BMSSP',
      emoji: '⚡',
      color: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.6)',
      funFact: 'Multi-source • O(m log^2/3 n)'
    }
  };

  // Memoized function to save stats - called when simulation completes
  const saveStatsIfNeeded = useCallback(() => {
    if (!controllerRef.current) return false;

    if (controllerRef.current.isSimulationComplete() && !statsUpdatedRef.current) {
      const states = controllerRef.current.getAlgorithmStates();
      const currentWinner = controllerRef.current.getWinner();

      console.log('🏁 Simulation complete, saving stats...', {
        winner: currentWinner,
        statesCount: states.length
      });

      LeaderboardManager.updateStats(states, currentWinner);
      setGlobalStats({ ...LeaderboardManager.getStats() });
      statsUpdatedRef.current = true;
      return true;
    }
    return false;
  }, []);

  // Initialize simulation
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!controllerRef.current) {
      controllerRef.current = new SimulationController(canvasRef.current);
    }

    controllerRef.current.initialize(mapMode, selectedAlgos, algorithmConfigs);

    setAlgorithmStates(controllerRef.current.getAlgorithmStates());
    setWinner(controllerRef.current.getWinner());
    setCities(controllerRef.current.getCities());
    setStartCity(controllerRef.current.getStartCity());
    setGoalCity(controllerRef.current.getGoalCity());

    // Reset the stats updated flag for new simulation
    statsUpdatedRef.current = false;

    controllerRef.current.render();
  }, [mapMode, selectedAlgos]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    let animationId: number;

    const animate = () => {
      if (!controllerRef.current) return;

      // Adaptive stepping based on speed
      const stepsPerFrame = Math.max(1, localSpeed);

      let shouldContinue = true;
      for (let i = 0; i < stepsPerFrame; i++) {
        shouldContinue = controllerRef.current.step();
        if (!shouldContinue) {
          break;
        }
      }

      controllerRef.current.render();

      const states = controllerRef.current.getAlgorithmStates();
      const currentWinner = controllerRef.current.getWinner();

      setAlgorithmStates(states);
      setWinner(currentWinner);

      // Check if simulation just completed and save stats
      if (!shouldContinue || controllerRef.current.isSimulationComplete()) {
        // Save stats immediately when simulation completes
        if (!statsUpdatedRef.current) {
          console.log('🏁 Simulation complete, saving stats...');
          LeaderboardManager.updateStats(states, currentWinner);
          setGlobalStats({ ...LeaderboardManager.getStats() });
          statsUpdatedRef.current = true;
        }
        setIsPlaying(false);
        return; // Don't schedule another frame
      }

      // Only schedule next frame if still playing
      if (isPlayingRef.current) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, localSpeed]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);

    // Save stats before resetting if simulation was complete AND we haven't saved yet
    if (controllerRef.current && controllerRef.current.isSimulationComplete() && !statsUpdatedRef.current) {
      const states = controllerRef.current.getAlgorithmStates();
      const currentWinner = controllerRef.current.getWinner();
      console.log('💾 Saving stats on reset...');
      LeaderboardManager.updateStats(states, currentWinner);
      statsUpdatedRef.current = true;
    }

    // Force refresh global stats from localStorage with new object reference
    setGlobalStats({ ...LeaderboardManager.getStats() });

    // Now reset to new map
    if (controllerRef.current && canvasRef.current) {
      controllerRef.current.initialize(mapMode, selectedAlgos, algorithmConfigs);
      setAlgorithmStates(controllerRef.current.getAlgorithmStates());
      setWinner(controllerRef.current.getWinner());
      setCities(controllerRef.current.getCities());
      setStartCity(controllerRef.current.getStartCity());
      setGoalCity(controllerRef.current.getGoalCity());

      // Reset the flag for the new simulation
      statsUpdatedRef.current = false;

      controllerRef.current.render();
    }
  };

  const handleResetGlobalStats = () => {
    if (confirm('Reset all global statistics?')) {
      LeaderboardManager.reset();
      setGlobalStats({ ...LeaderboardManager.getStats() });
    }
  };

  const mapModeIcons: Record<MapMode, { icon: React.ReactElement; label: string }> = {
    'us-cities': { icon: <Compass size={16} />, label: 'US (30)' },
    'metro': { icon: <Building2 size={16} />, label: 'Metro (20)' },
    'highway': { icon: <Navigation size={16} />, label: 'Highway (13)' },
    'regional': { icon: <MapPin size={16} />, label: 'Regional (14)' },
    'large-grid': { icon: <BarChart3 size={16} />, label: 'Grid (150)' },
    'mega-random': { icon: <Zap size={16} />, label: 'Random (300)' },
    'scale-free': { icon: <TrendingUp size={16} />, label: 'Scale (200)' },
    'small-world': { icon: <Cpu size={16} />, label: 'Small (250)' },
    'ultra-grid': { icon: <Layers size={16} />, label: 'Ultra (1K)' },
    'massive-random': { icon: <Zap size={16} />, label: 'Massive (2K)' },
    'super-scale': { icon: <TrendingUp size={16} />, label: 'Super (1.5K)' },
    'mega-world': { icon: <Cpu size={16} />, label: 'Mega (3K)' }
  };

  const getPerformanceLevel = (nodeCount: number): 'good' | 'medium' | 'heavy' => {
    if (nodeCount <= MEDIUM_NETWORK) return 'good';
    if (nodeCount <= LARGE_NETWORK) return 'medium';
    return 'heavy';
  };

  const winnerConfig = winner ? algorithmConfigs[winner] : null;
  const winnerState = algorithmStates.find(a => a.id === winner);

  const sortedGlobalStats = Object.entries(globalStats)
    .sort((a, b) => {
      // Weighted scoring: 1st = 3pts, 2nd = 2pts, 3rd = 1pt
      const scoreA = a[1].firstPlace * 3 + a[1].secondPlace * 2 + a[1].thirdPlace * 1;
      const scoreB = b[1].firstPlace * 3 + b[1].secondPlace * 2 + b[1].thirdPlace * 1;

      if (scoreB !== scoreA) return scoreB - scoreA;

      // Tiebreaker: more 1st places wins
      if (b[1].firstPlace !== a[1].firstPlace) return b[1].firstPlace - a[1].firstPlace;

      // Tiebreaker: more 2nd places wins
      return b[1].secondPlace - a[1].secondPlace;
    });

  const performanceLevel = getPerformanceLevel(cities.length);

  return (
    <MainContainer>
      <Header>
        <Title>
          <Cpu size={32} />
          Pathfinding Arena Ultra
        </Title>

        <Badge>
          {cities.length.toLocaleString()} Nodes • {selectedAlgos.length} Algorithms
        </Badge>

        <PerformanceBadge $level={performanceLevel}>
          {performanceLevel === 'good' ? '⚡ Fast' :
            performanceLevel === 'medium' ? '⚠️ Medium' :
              '🔥 Heavy'}
        </PerformanceBadge>
      </Header>

      <MainContent>
        <CanvasColumn>
          <CanvasArea>
            <RouteInfo>
              <CityLabel $color={COLORS.success}>
                <Home size={16} />
                {cities[startCity]?.name || `Node ${startCity}`}
              </CityLabel>
              <Navigation size={16} color={COLORS.textMuted} />
              <CityLabel $color={COLORS.danger}>
                <MapPin size={16} />
                {cities[goalCity]?.name || `Node ${goalCity}`}
              </CityLabel>
            </RouteInfo>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          </CanvasArea>

          {winnerConfig && winnerState && (
            <WinnerBanner $color={winnerConfig.color}>
              <WinnerTitle $color={winnerConfig.color}>
                <Trophy size={28} />
                <span>{winnerConfig.emoji} {winnerConfig.name} Wins!</span>
                <span style={{ opacity: 0.5, margin: '0 0.5rem' }}>•</span>
                <WinnerStats>
                  {winnerState.steps.toLocaleString()} steps • {winnerState.path.length} nodes • {winnerState.distance.toFixed(0)} distance
                </WinnerStats>
              </WinnerTitle>
            </WinnerBanner>
          )}
        </CanvasColumn>

        <Sidebar>
          <ControlsSection>
            <ControlButton $variant="primary" onClick={handlePlay}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </ControlButton>
            <ControlButton $variant="secondary" onClick={handleReset}>
              <Shuffle size={20} />
              Reset
            </ControlButton>
          </ControlsSection>

          {showGlobalLeaderboard && (
            <GlobalLeaderboard>
              <GlobalLeaderboardHeader>
                <LeaderboardTitle>
                  <Award size={20} />
                  Global Leaderboard
                </LeaderboardTitle>
                <ResetButton onClick={handleResetGlobalStats}>
                  <RotateCcw size={14} />
                  Reset
                </ResetButton>
              </GlobalLeaderboardHeader>

              {sortedGlobalStats.map(([id, stats], idx) => {
                const config = algorithmConfigs[id as AlgorithmType];
                const totalScore = stats.firstPlace * 3 + stats.secondPlace * 2 + stats.thirdPlace * 1;
                const podiumFinishes = stats.firstPlace + stats.secondPlace + stats.thirdPlace;
                const podiumRate = stats.totalRuns > 0 ? ((podiumFinishes / stats.totalRuns) * 100).toFixed(0) : '0';

                return (
                  <GlobalLeaderboardItem key={id} $rank={idx} $color={config.color}>
                    <GlobalAlgoHeader>
                      <GlobalAlgoLeft>
                        <span style={{ fontSize: '1.5rem' }}>{config.emoji}</span>
                        <GlobalAlgoName $color={config.color}>
                          {config.name}
                        </GlobalAlgoName>
                      </GlobalAlgoLeft>
                      <Rank style={{ fontSize: '1rem', minWidth: 'auto' }}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </Rank>
                    </GlobalAlgoHeader>

                    <GlobalStats>
                      <GlobalStatItem>
                        <GlobalStatLabel>Score</GlobalStatLabel>
                        <GlobalStatValue>{totalScore} pts</GlobalStatValue>
                      </GlobalStatItem>
                      <GlobalStatItem>
                        <GlobalStatLabel>Podium Rate</GlobalStatLabel>
                        <GlobalStatValue>{podiumRate}%</GlobalStatValue>
                      </GlobalStatItem>
                      <GlobalStatItem style={{ gridColumn: '1 / -1' }}>
                        <GlobalStatLabel>Finishes</GlobalStatLabel>
                        <GlobalStatValue>
                          <span style={{ marginRight: '0.75rem' }}>🥇 {stats.firstPlace}</span>
                          <span style={{ marginRight: '0.75rem' }}>🥈 {stats.secondPlace}</span>
                          <span>🥉 {stats.thirdPlace}</span>
                        </GlobalStatValue>
                      </GlobalStatItem>
                    </GlobalStats>
                  </GlobalLeaderboardItem>
                );
              })}
            </GlobalLeaderboard>
          )}

          {showStats && (
            <Leaderboard $expanded={expandedStats}>
              <LeaderboardHeader>
                <LeaderboardTitle>
                  <Trophy size={20} />
                  Current Race
                </LeaderboardTitle>
                <ExpandButton onClick={() => setExpandedStats(!expandedStats)}>
                  {expandedStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </ExpandButton>
              </LeaderboardHeader>

              {[...algorithmStates]
                .sort((a, b) => {
                  if (a.status === 'failed' && b.status !== 'failed') return 1;
                  if (a.status !== 'failed' && b.status === 'failed') return -1;
                  if (a.path.length === 0 && b.path.length === 0) return a.steps - b.steps;
                  if (a.path.length === 0) return 1;
                  if (b.path.length === 0) return -1;
                  return a.steps - b.steps;
                })
                .map((algo, idx) => {
                  const config = algorithmConfigs[algo.id];
                  return (
                    <LeaderboardItem
                      key={algo.id}
                      $rank={idx}
                      $isWinner={algo.status === 'winner'}
                      $color={config.color}
                      $failed={algo.status === 'failed'}
                    >
                      <Rank>
                        {algo.status === 'failed' ? <AlertCircle size={20} color={COLORS.danger} /> :
                          idx === 0 && algo.status === 'winner' ? '🏆' :
                            idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                      </Rank>

                      <AlgoInfo>
                        <AlgoHeader>
                          <span style={{ fontSize: '1.5rem' }}>{config.emoji}</span>
                          <AlgoNameInBoard $color={config.color}>
                            {config.name}
                          </AlgoNameInBoard>
                          {algo.status === 'running' && (
                            <AlgoStatus $color={config.color} />
                          )}
                          {algo.status === 'winner' && (
                            <CheckCircle2 size={18} color={COLORS.success} />
                          )}
                        </AlgoHeader>

                        <Stats>
                          <span>Steps: <StatValue>{algo.steps.toLocaleString()}</StatValue></span>
                          <span>Nodes: <StatValue>{algo.path.length > 0 ? algo.path.length : '-'}</StatValue></span>
                          {algo.distance > 0 && (
                            <span>Dist: <StatValue>{algo.distance.toFixed(0)}</StatValue></span>
                          )}
                        </Stats>
                      </AlgoInfo>
                    </LeaderboardItem>
                  );
                })}
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
              max="20"
              step="1"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(Number(e.target.value))}
            />
          </Section>

          <Section>
            <SectionTitle>
              <Compass size={18} />
              Network Size
            </SectionTitle>

            <ButtonGrid>
              {Object.entries(mapModeIcons).map(([mode, { icon, label }]) => (
                <ModeButton
                  key={mode}
                  $active={mapMode === mode}
                  onClick={() => setMapMode(mode as MapMode)}
                >
                  {icon}
                  <span>{label}</span>
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