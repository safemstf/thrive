// ============================================================================
// MAIN ALGORITHM HORSE RACE COMPONENT
// ============================================================================
// Properly integrates all fixed modules with professional design system
// Uses your styled-components and proper modular architecture

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Play, Pause, RotateCcw, Trophy, Volume2, Timer, Zap, Activity, Target, ZoomIn, ZoomOut, Move } from 'lucide-react';

// ============================================================================
// IMPORT FIXED MODULES
// ============================================================================

import { 
  generateSafeMaze, 
  validateMaze, 
  getMazeStatistics,
  type MazeConfig, 
  type MazeResult 
} from './mazeUtils';

import { 
  runAlgorithm, 
  compareAlgorithms, 
  getAvailableAlgorithms,
  type AlgorithmType, 
  type AlgorithmResult,
  type AlgorithmConfig 
} from './algorithms';

import { 
  createRacingTeam, 
  disposeRacingTeam,
  type RacingAgent, 
  type HorseData,
  type AgentStats 
} from './agent';

// ============================================================================
// STYLED COMPONENTS USING YOUR DESIGN SYSTEM
// ============================================================================

const raceGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
`;

const winnerPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, 
    var(--color-background-primary, #0f172a) 0%, 
    var(--color-background-secondary, #1e293b) 50%,
    var(--color-background-primary, #0f172a) 100%);
  color: var(--color-text-primary, #f8fafc);
  font-family: var(--font-body, 'Inter', sans-serif);
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, var(--color-text-primary, #f8fafc) 1px, transparent 1px);
    opacity: 0.02;
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl, 2rem);
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    padding: var(--spacing-lg, 1.5rem);
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-md, 1rem);
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl, 4rem);
  position: relative;
`;

const MainTitle = styled.h1`
  font-family: var(--font-display, 'Inter');
  font-weight: 700;
  font-size: clamp(2.5rem, 5vw, 4rem);
  background: linear-gradient(135deg, #fbbf24, #f59e0b, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-md, 1rem);
  letter-spacing: -0.02em;
`;

const TechBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  padding: var(--spacing-sm, 0.75rem) var(--spacing-lg, 1.5rem);
  background: var(--glass-background, rgba(30, 41, 59, 0.4));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.1));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border-radius: var(--radius-full, 9999px);
  font-size: 0.875rem;
  color: var(--color-text-secondary, #cbd5e1);
  margin-top: var(--spacing-md, 1rem);
`;

const CommentaryCard = styled.div<{ $celebration?: boolean }>`
  background: var(--glass-background, rgba(0, 0, 0, 0.4));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.2));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border-radius: var(--radius-lg, 1rem);
  padding: var(--spacing-lg, 1.5rem);
  margin-bottom: var(--spacing-2xl, 3rem);
  ${css`animation: ${raceGlow} 3s ease-in-out infinite;`}
  
  ${({ $celebration }) => $celebration && css`
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
    border-color: #fbbf24;
    box-shadow: 0 0 40px rgba(251, 191, 36, 0.4);
    animation: ${winnerPulse} 1s ease-in-out infinite;
  `}
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-2xl, 3rem);
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 350px;
    gap: var(--spacing-xl, 2rem);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg, 1.5rem);
  }
`;

const RaceTrackCard = styled.div`
  background: var(--glass-background, rgba(30, 41, 59, 0.3));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.2));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border-radius: var(--radius-xl, 1.5rem);
  padding: var(--spacing-2xl, 3rem);
  box-shadow: var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg, 1.5rem);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl, 2rem);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
    align-items: stretch;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary, #f8fafc);
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  margin: 0;
`;

const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary-400, #60a5fa);
`;

const CanvasContainer = styled.div`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(5, 150, 105, 0.2) 100%);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-xl, 1.5rem);
  padding: var(--spacing-lg, 1.5rem);
  margin-bottom: var(--spacing-xl, 2rem);
  position: relative;
  overflow: hidden;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%);
    pointer-events: none;
  }
`;

const CanvasControls = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const CanvasControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--glass-background, rgba(0, 0, 0, 0.6));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.3));
  border-radius: var(--radius-md, 0.75rem);
  color: var(--color-text-primary, #f8fafc);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  
  &:hover {
    background: var(--glass-background, rgba(0, 0, 0, 0.8));
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: var(--glass-background, rgba(0, 0, 0, 0.6));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.3));
  border-radius: var(--radius-md, 0.75rem);
  color: var(--color-text-primary, #f8fafc);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
  z-index: 10;
`;

const RaceCanvas = styled.canvas`
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  background: var(--color-background-secondary, #f8fafc);
  border-radius: var(--radius-lg, 1rem);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  border: 2px solid rgba(255, 255, 255, 0.1);
  image-rendering: pixelated;
`;

const BaseButton = styled.button<{ 
  $variant?: 'primary' | 'secondary' | 'success' | 'warning';
  $size?: 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  padding: ${({ $size = 'lg' }) => 
    $size === 'lg' ? 'var(--spacing-lg, 1.5rem) var(--spacing-2xl, 3rem)' : 'var(--spacing-md, 1rem) var(--spacing-xl, 2rem)'};
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 700;
  font-size: ${({ $size = 'lg' }) => $size === 'lg' ? '1.125rem' : '1rem'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: none;
  border-radius: var(--radius-xl, 1.5rem);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #047857, #065f46);
            transform: translateY(-2px);
            box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
          }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #d97706, #b45309);
            transform: translateY(-2px);
          }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: var(--color-background-tertiary, #374151);
          color: var(--color-text-primary, #f8fafc);
          border: 1px solid var(--color-border-medium, #6b7280);
          &:hover:not(:disabled) {
            background: var(--color-background-secondary, #4b5563);
            transform: translateY(-2px);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 1rem);
  justify-content: center;
  margin-bottom: var(--spacing-xl, 2rem);
`;

const SettingsPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg, 1.5rem);
  justify-content: center;
  padding: var(--spacing-lg, 1.5rem);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg, 1rem);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const SettingGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 1rem);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SettingLabel = styled.label`
  font-weight: 600;
  color: var(--color-text-secondary, #cbd5e1);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 2rem);
`;

const SidebarCard = styled.div`
  background: var(--glass-background, rgba(30, 41, 59, 0.3));
  border: 1px solid var(--glass-border, rgba(148, 163, 184, 0.2));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border-radius: var(--radius-xl, 1.5rem);
  padding: var(--spacing-lg, 1.5rem);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
`;

const SidebarTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary, #f8fafc);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  margin: 0 0 var(--spacing-lg, 1.5rem) 0;
`;

const AgentCard = styled.div<{ $status: 'winner' | 'finished' | 'running' }>`
  padding: var(--spacing-lg, 1.5rem);
  border-radius: var(--radius-lg, 1rem);
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: var(--spacing-md, 1rem);
  position: relative;
  overflow: hidden;
  
  ${({ $status }) => {
    switch ($status) {
      case 'winner':
        return css`
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
          border-color: #fbbf24;
          animation: ${winnerPulse} 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
        `;
      case 'finished':
        return css`
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border-color: #10b981;
        `;
      default:
        return css`
          background: rgba(107, 114, 128, 0.1);
          border-color: #6b7280;
        `;
    }
  }}
`;

const StatsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 0.5rem);
  padding: var(--spacing-sm, 0.75rem) var(--spacing-md, 1rem);
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-md, 0.75rem);
  color: var(--color-text-primary, #f8fafc);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.3);
    transform: translateY(-1px);
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(107, 114, 128, 0.3);
  border-radius: var(--radius-full, 9999px);
  overflow: hidden;
  margin-top: var(--spacing-sm, 0.75rem);
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: ${({ $color }) => $color};
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-full, 9999px);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    ${({ $percentage }) => $percentage > 0 && $percentage < 100 
      ? css`animation: ${raceGlow} 2s ease-in-out infinite;`
      : 'animation: none;'
    }
  }
`;

// ============================================================================
// RACE CONFIGURATION
// ============================================================================

const RACING_HORSES: HorseData[] = [
  { 
    id: 'BFS', 
    name: 'Breadth Lightning', 
    displayName: 'Breadth Lightning',
    emoji: '🦄', 
    color: '#3b82f6', 
    style: 'Methodical Explorer',
    odds: '2:1',
    bigO: 'O(V + E)',
    description: 'Guarantees shortest path, explores layer by layer'
  },
  { 
    id: 'DFS', 
    name: 'Deep Thunder', 
    displayName: 'Deep Thunder',
    emoji: '🐎', 
    color: '#ef4444', 
    style: 'Wild Sprinter',
    odds: '4:1',
    bigO: 'O(V + E)',
    description: 'Fast but unpredictable, dives deep into paths'
  },
  { 
    id: 'AStar', 
    name: 'Astro Bolt', 
    displayName: 'Astro Bolt',
    emoji: '⚡', 
    color: '#f59e0b', 
    style: 'Smart Speedster',
    odds: '3:2',
    bigO: 'O(b^d)',
    description: 'Heuristic-guided optimal pathfinder'
  },
  { 
    id: 'Dijkstra', 
    name: 'Dutch Dynamo', 
    displayName: 'Dutch Dynamo',
    emoji: '🏇', 
    color: '#10b981', 
    style: 'Steady Optimizer',
    odds: '5:2',
    bigO: 'O(V²)',
    description: 'Guaranteed optimal, handles all weights'
  },
];

const RACE_COMMENTARY = [
  "🎺 And they're off! The algorithms charge into the maze!",
  "⚡ Look at that pathfinding technique!",
  "🔥 The computational race is heating up!",
  "🎯 Someone's found a breakthrough path!",
  "🏃‍♂️ The Big O complexity is showing!",
  "🎪 What a display of algorithmic power!",
  "🚀 The heuristics are paying off!",
  "🎭 Plot twist in the maze corridors!"
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AlgorithmHorseRace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Core state using fixed modules
  const [mazeResult, setMazeResult] = useState<MazeResult | null>(null);
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResult[]>([]);
  const [agents, setAgents] = useState<RacingAgent[]>([]);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [raceTime, setRaceTime] = useState<number>(0);
  
  // UI state
  const [commentary, setCommentary] = useState<string>("🏁 Welcome to the Algorithm Derby! Generate a track to begin!");
  const [raceSpeed, setRaceSpeed] = useState<number>(60);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showExploration, setShowExploration] = useState<boolean>(true);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [celebrationMode, setCelebrationMode] = useState<boolean>(false);
  
  // Canvas viewport state - THIS IS WHAT MAKES IT JOB-WORTHY! 🚀
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  
  const MAZE_SIZE: number = 21;
  const CELL_SIZE: number = 18;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 4.0;
  const ZOOM_SENSITIVITY = 0.1;
  
  // ============================================================================
  // CANVAS VIEWPORT CONTROLS - JOB-WORTHY FEATURES! 🎯
  // ============================================================================
  
  const handleCanvasWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate zoom
    const zoomDelta = -event.deltaY * ZOOM_SENSITIVITY * 0.01;
    const newZoom = Math.min(Math.max(zoom + zoomDelta, MIN_ZOOM), MAX_ZOOM);
    
    if (newZoom !== zoom) {
      // Zoom towards mouse position
      const zoomRatio = newZoom / zoom;
      const newPanX = mouseX - (mouseX - panX) * zoomRatio;
      const newPanY = mouseY - (mouseY - panY) * zoomRatio;
      
      setZoom(newZoom);
      setPanX(newPanX);
      setPanY(newPanY);
    }
  }, [zoom, panX, panY]);
  
  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - rect.left - panX,
      y: event.clientY - rect.top - panY
    });
  }, [panX, panY]);
  
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const newPanX = event.clientX - rect.left - dragStart.x;
    const newPanY = event.clientY - rect.top - dragStart.y;
    
    setPanX(newPanX);
    setPanY(newPanY);
  }, [isDragging, dragStart]);
  
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);
  
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.25, MAX_ZOOM);
    setZoom(newZoom);
  }, [zoom]);
  
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom * 0.8, MIN_ZOOM);
    setZoom(newZoom);
  }, [zoom]);
  
  const resetView = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);
  
  // ============================================================================
  // RACE CONTROL FUNCTIONS USING FIXED MODULES
  // ============================================================================
  
  const generateNewRace = useCallback(async () => {
    setCommentary("🔧 Generating new race track with optimized maze algorithm...");
    
    try {
      // Use fixed maze generation module
      const mazeConfig: MazeConfig = {
        width: MAZE_SIZE,
        height: MAZE_SIZE,
        complexity: 0.7,
        seed: Math.floor(Math.random() * 1000000)
      };
      
      const newMazeResult = generateSafeMaze(mazeConfig);
      setMazeResult(newMazeResult);
      
      if (!newMazeResult.isValid) {
        throw new Error('Generated maze is not valid');
      }
      
      // Use fixed algorithms module
      const algorithmConfig: AlgorithmConfig = {
        maxSteps: 10000,
        timeLimit: 30000,
        enableProfiling: true
      };
      
      const algorithmTypes: AlgorithmType[] = ['BFS', 'DFS', 'AStar', 'Dijkstra'];
      const results = compareAlgorithms(
        newMazeResult.maze,
        newMazeResult.start,
        newMazeResult.goal,
        algorithmTypes,
        algorithmConfig
      );
      
      setAlgorithmResults(results);
      
      // Create racing agents using fixed agent module
      const newAgents = createRacingTeam(RACING_HORSES, results, {
        stepSpeed: 2.0,
        visualTrailLength: 8,
        enableProfiling: true
      });
      
      setAgents(newAgents);
      setWinner(null);
      setRaceTime(0);
      setIsRacing(false);
      setCelebrationMode(false);
      
      const stats = getMazeStatistics(newMazeResult.maze);
      const successfulAlgorithms = results.filter(r => r.success);
      
      // 🎯 EPIC RACE READY MESSAGE! 🎯
      const readyMessages = [
        `🏁 RACE READY! ${stats.openPercentage.toFixed(1)}% open maze, ${successfulAlgorithms.length}/${results.length} algorithms found paths!`,
        `⚡ ALGORITHMS ASSEMBLED! ${successfulAlgorithms.length} competitors ready to race!`,
        `🎪 THE STAGE IS SET! ${stats.totalCells} cells, ${successfulAlgorithms.length} fearless pathfinders!`,
        `🔥 MAZE GENERATED! ${stats.openPercentage.toFixed(1)}% exploration space awaits our champions!`
      ];
      
      const readyMessage = readyMessages[Math.floor(Math.random() * readyMessages.length)];
      setCommentary(readyMessage);
      
    } catch (error) {
      console.error('Error generating race:', error);
      setCommentary(`❌ Error generating race: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);
  
  const startRace = useCallback(() => {
    if (agents.length === 0) return;
    
    try {
      agents.forEach(agent => agent.startRace());
      setWinner(null);
      setRaceTime(0);
      setIsRacing(true);
      setCelebrationMode(false);
      
      // 🎺 EPIC RACE START! 🎺
      const startMessages = [
        "🎺 AND THEY'RE OFF! The algorithms sprint into the maze!",
        "⚡ RACE BEGINS! Watch these pathfinding legends compete!",
        "🔥 THE BATTLE STARTS! Who will conquer the maze first?",
        "🏇 CHARGE! The greatest algorithmic minds enter the arena!",
        "🎪 LET THE GAMES BEGIN! May the best Big O complexity win!"
      ];
      
      const startMessage = startMessages[Math.floor(Math.random() * startMessages.length)];
      setCommentary(startMessage);
    } catch (error) {
      console.error('Error starting race:', error);
      setCommentary(`❌ Error starting race: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [agents]);
  
  const pauseRace = useCallback(() => {
    setIsRacing(false);
    setCommentary("⏸️ Race paused. The algorithms await your command...");
  }, []);
  
  // ============================================================================
  // KEYBOARD SHORTCUTS AND CANVAS INTERACTIONS
  // ============================================================================
  
  // Apply keyboard shortcuts for professional UX (AFTER race functions are defined)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only when not typing in inputs
      if (event.target !== document.body) return;
      
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          resetView();
          break;
        case ' ':
          event.preventDefault();
          if (isRacing) {
            pauseRace();
          } else {
            startRace();
          }
          break;
        case 'r':
        case 'R':
          if (!isRacing) {
            event.preventDefault();
            generateNewRace();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoom, isRacing, zoomIn, zoomOut, resetView, startRace, pauseRace, generateNewRace]);
  
  // ============================================================================
  // GAME LOOP USING RACING AGENTS
  // ============================================================================
  
  useEffect(() => {
    if (!isRacing) return;
    
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= raceSpeed) {
        lastUpdateRef.current = timestamp;
        
        let raceEnded = false;
        let newWinner: string | null = null;
        
        // Step all agents
        agents.forEach(agent => {
          try {
            const justFinished = agent.step();
            if (justFinished && !winner && !newWinner) {
              newWinner = agent.name;
              setWinner(agent.name);
              const stats = agent.getStats();
              
              // 🎊 EPIC VICTORY MESSAGE! 🎊
              const victoryMessages = [
                `🎊 ${agent.name} WINS! ${agent.bigO} complexity triumphs!`,
                `👑 VICTORY! ${agent.name} conquers the maze with ${stats.pathLength} steps!`,
                `🏆 CHAMPION! ${agent.name} proves ${agent.id} superiority!`,
                `⚡ LEGENDARY! ${agent.name} explored ${stats.exploredCells} cells to victory!`,
                `🔥 DOMINANT! ${agent.name} wins with ${stats.efficiency.toFixed(2)} efficiency!`
              ];
              
              const victoryMessage = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
              setCommentary(victoryMessage);
              setCelebrationMode(true);
              raceEnded = true;
              
              // Add celebration effect
              setTimeout(() => {
                setCommentary(`🎉 RACE COMPLETE! ${agent.name} is the Algorithm Derby Champion! 🏆`);
              }, 3000);
              
              // Turn off celebration mode after 10 seconds
              setTimeout(() => {
                setCelebrationMode(false);
              }, 10000);
            }
          } catch (error) {
            console.error(`Error stepping agent ${agent.name}:`, error);
          }
        });
        
        if (raceEnded) {
          setIsRacing(false);
        }
        
        // Dynamic commentary based on race progress
        if (Math.random() < 0.02 && !raceEnded) {
          const racingAgents = agents.filter(a => !a.getIsFinished());
          const finishedCount = agents.length - racingAgents.length;
          
          let dynamicCommentary = '';
          
          if (finishedCount === 0) {
            // Early race commentary
            const leadingAgent = racingAgents.reduce((leader, agent) => 
              agent.getProgress() > leader.getProgress() ? agent : leader
            );
            const commentaryOptions = [
              `🔥 ${leadingAgent.name} is taking the lead with ${leadingAgent.bigO} complexity!`,
              `⚡ The algorithms are showing their true colors!`,
              `🎯 Look at that ${leadingAgent.id} pathfinding technique!`,
              `🏃‍♂️ ${leadingAgent.name} is ${leadingAgent.getProgress().toFixed(1)}% through the maze!`
            ];
            dynamicCommentary = commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)];
          } else if (finishedCount < agents.length - 1) {
            // Mid-race commentary
            const stillRacing = racingAgents.length;
            dynamicCommentary = `🎪 ${finishedCount} finished, ${stillRacing} still racing! What a competition!`;
          }
          
          if (dynamicCommentary) {
            setCommentary(dynamicCommentary);
          } else {
            const randomComment = RACE_COMMENTARY[Math.floor(Math.random() * RACE_COMMENTARY.length)];
            setCommentary(randomComment);
          }
        }
        
        setRaceTime(prev => prev + raceSpeed);
      }
      
      if (isRacing) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRacing, raceSpeed, agents, winner]);
  
  // ============================================================================
  // CANVAS RENDERING WITH RACING AGENTS - LET'S GO! 🏇
  // ============================================================================
  
  const renderRaceFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mazeResult) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = MAZE_SIZE * CELL_SIZE;
    const height = MAZE_SIZE * CELL_SIZE;
    
    // Clear and setup with viewport transform
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, panX, panY);
    ctx.clearRect(-panX/zoom, -panY/zoom, width/zoom + Math.abs(panX)/zoom, height/zoom + Math.abs(panY)/zoom);
    ctx.imageSmoothingEnabled = false;
    
    // ============================================================================
    // DRAW MAZE BACKGROUND - PROFESSIONAL STYLE
    // ============================================================================
    
    // Floor gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw walls with 3D effect
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    for (let y = 0; y < mazeResult.maze.length; y++) {
      for (let x = 0; x < mazeResult.maze[0].length; x++) {
        if (mazeResult.maze[y][x] === 1) {
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // 3D highlight
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 2);
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, 2, CELL_SIZE);
          ctx.fillStyle = '#1e293b';
          ctx.shadowBlur = 2;
        }
      }
    }
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // ============================================================================
    // DRAW START AND FINISH WITH STYLE
    // ============================================================================
    
    // Start (animated)
    const startPulse = 1 + 0.2 * Math.sin(Date.now() * 0.005);
    ctx.save();
    ctx.shadowBlur = 8 * startPulse;
    ctx.shadowColor = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'white';
    ctx.font = `${CELL_SIZE * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚩', CELL_SIZE/2, CELL_SIZE/2);
    ctx.restore();
    
    // Finish (animated)
    const finishPulse = 1 + 0.3 * Math.sin(Date.now() * 0.008);
    ctx.save();
    ctx.shadowBlur = 10 * finishPulse;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.fillRect((MAZE_SIZE - 1) * CELL_SIZE, (MAZE_SIZE - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'white';
    ctx.fillText('🏁', (MAZE_SIZE - 0.5) * CELL_SIZE, (MAZE_SIZE - 0.5) * CELL_SIZE);
    ctx.restore();
    
    // ============================================================================
    // DRAW AGENT EXPLORATION - SHOWING THE THINKING! 🧠
    // ============================================================================
    
    if (showExploration) {
      agents.forEach(agent => {
        const exploration = agent.getVisibleExploration();
        if (exploration.length === 0) return;
        
        ctx.globalAlpha = 0.15;
        
        // Create gradient for exploration
        const exploreGradient = ctx.createRadialGradient(
          (MAZE_SIZE / 2) * CELL_SIZE, 
          (MAZE_SIZE / 2) * CELL_SIZE, 
          0,
          (MAZE_SIZE / 2) * CELL_SIZE, 
          (MAZE_SIZE / 2) * CELL_SIZE, 
          Math.max(MAZE_SIZE * CELL_SIZE / 2, exploration.length * CELL_SIZE / 4)
        );
        exploreGradient.addColorStop(0, agent.color);
        exploreGradient.addColorStop(1, agent.color + '20');
        ctx.fillStyle = exploreGradient;
        
        exploration.forEach(([x, y], index) => {
          // Fade effect - newer explorations are more visible
          const fadeProgress = index / Math.max(1, exploration.length - 1);
          ctx.globalAlpha = 0.1 + 0.15 * fadeProgress;
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
        
        ctx.globalAlpha = 1;
      });
    }
    
    // ============================================================================
    // DRAW RACING TRAILS - THE PATH TO VICTORY! 🏃‍♂️
    // ============================================================================
    
    if (showTrails) {
      agents.forEach(agent => {
        const trail = agent.getTrailPositions();
        if (trail.length < 2) return;
        
        // Epic trail gradient
        const trailGradient = ctx.createLinearGradient(
          trail[0][0] * CELL_SIZE + CELL_SIZE / 2,
          trail[0][1] * CELL_SIZE + CELL_SIZE / 2,
          trail[trail.length - 1][0] * CELL_SIZE + CELL_SIZE / 2,
          trail[trail.length - 1][1] * CELL_SIZE + CELL_SIZE / 2
        );
        trailGradient.addColorStop(0, agent.color + '30');
        trailGradient.addColorStop(1, agent.color + 'B0');
        
        ctx.strokeStyle = trailGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = agent.color;
        
        ctx.beginPath();
        trail.forEach(([x, y], index) => {
          const centerX = x * CELL_SIZE + CELL_SIZE / 2;
          const centerY = y * CELL_SIZE + CELL_SIZE / 2;
          if (index === 0) {
            ctx.moveTo(centerX, centerY);
          } else {
            ctx.lineTo(centerX, centerY);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }
    
    // ============================================================================
    // DRAW THE RACING AGENTS - THE STARS OF THE SHOW! ⭐
    // ============================================================================
    
    agents.forEach(agent => {
      const position = agent.getCurrentPosition();
      if (!position) return;
      
      const [x, y] = position;
      const centerX = x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE * 0.4;
      
      ctx.save();
      
      // EPIC GLOW EFFECT
      if (agent.getIsFinished()) {
        // WINNER GLOW - LEGENDARY! 👑
        const winnerPulse = 1 + 0.6 * Math.sin(Date.now() * 0.015);
        ctx.shadowBlur = 20 * winnerPulse;
        ctx.shadowColor = '#ffd700';
        
        // Winner particles effect
        for (let i = 0; i < 6; i++) {
          const angle = (Date.now() * 0.01 + i * Math.PI / 3) % (Math.PI * 2);
          const sparkleX = centerX + Math.cos(angle) * radius * 2;
          const sparkleY = centerY + Math.sin(angle) * radius * 2;
          ctx.fillStyle = '#ffd700';
          ctx.globalAlpha = 0.8 * Math.sin(Date.now() * 0.02 + i);
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else {
        // RACING GLOW - SHOWING THE SPEED! 💨
        const racePulse = 1 + 0.4 * Math.sin(Date.now() * 0.012);
        ctx.shadowBlur = 12 * racePulse;
        ctx.shadowColor = agent.color;
      }
      
      // AGENT BODY - PROFESSIONAL GRADIENT
      const agentGradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      );
      agentGradient.addColorStop(0, '#ffffff');
      agentGradient.addColorStop(0.3, agent.color);
      agentGradient.addColorStop(1, agent.color + '80');
      
      ctx.fillStyle = agentGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // PROFESSIONAL BORDER
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // EMOJI WITH STYLE
      ctx.fillStyle = 'white';
      ctx.font = `${CELL_SIZE * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(agent.emoji, centerX, centerY);
      
      // WINNER CROWN - EPIC MOMENT! 👑
      if (agent.getIsFinished() && winner === agent.name) {
        const crownY = centerY - radius * 1.5;
        const crownBounce = 1 + 0.3 * Math.sin(Date.now() * 0.02);
        ctx.save();
        ctx.translate(centerX, crownY);
        ctx.scale(crownBounce, crownBounce);
        ctx.fillStyle = '#ffd700';
        ctx.font = `${CELL_SIZE * 0.5}px Arial`;
        ctx.fillText('👑', 0, 0);
        ctx.restore();
        
        // Victory text
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold ${CELL_SIZE * 0.25}px Arial`;
        ctx.fillText('WINNER!', centerX, centerY + radius * 2);
      }
      
      // SPEED LINES FOR MOVING AGENTS
      if (!agent.getIsFinished() && agent.getCurrentPosition()) {
        const progress = agent.getProgress();
        if (progress > 0) {
          ctx.strokeStyle = agent.color + '60';
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const lineX = centerX - radius - (i * 8);
            ctx.beginPath();
            ctx.moveTo(lineX, centerY - 4 + i * 4);
            ctx.lineTo(lineX - 12, centerY - 4 + i * 4);
            ctx.stroke();
          }
        }
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  }, [mazeResult, agents, showTrails, showExploration, winner, zoom, panX, panY]);
  
  // ============================================================================
  // RENDER LOOP - SMOOTH AS BUTTER! 🧈
  // ============================================================================
  
  useEffect(() => {
    const renderLoop = () => {
      renderRaceFrame();
      requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  }, [renderRaceFrame]);
  
  // ============================================================================
  // INITIALIZATION AND CLEANUP
  // ============================================================================
  
  useEffect(() => {
    generateNewRace();
    
    // Cleanup function
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (agents.length > 0) {
        disposeRacingTeam(agents);
      }
    };
  }, [generateNewRace]);
  
  // Cleanup agents when component unmounts
  useEffect(() => {
    return () => {
      if (agents.length > 0) {
        disposeRacingTeam(agents);
      }
      // Clean up any remaining animation frames
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [agents]);
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const runningAgents = agents.filter(a => !a.getIsFinished());
  const finishedAgents = [...agents]
    .filter(a => a.getIsFinished())
    .sort((a, b) => {
      const aTime = a.getCompletionTime() || Infinity;
      const bTime = b.getCompletionTime() || Infinity;
      return aTime - bTime;
    });
  
  const sortedAgents = [
    ...finishedAgents, 
    ...runningAgents.sort((a, b) => b.getProgress() - a.getProgress())
  ];
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <PageContainer>
      <ContentWrapper>
        
        {/* Hero Section */}
        <HeroSection>
          <MainTitle>🐎 Algorithm Derby</MainTitle>
          <TechBadge>
            <Activity size={16} />
            Big O Complexity • Pathfinding Algorithms • Real-time Visualization
          </TechBadge>
        </HeroSection>
        
        {/* Commentary */}
        <CommentaryCard $celebration={celebrationMode}>
          <Volume2 size={24} style={{ color: celebrationMode ? '#ffd700' : '#fbbf24', filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
            {commentary}
          </p>
        </CommentaryCard>
        
        <MainGrid>
          
          {/* Race Track */}
          <RaceTrackCard>
            <CardHeader>
              <CardTitle>
                🏁 Race Track
              </CardTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <TimerDisplay>
                  <Timer size={20} />
                  {(raceTime / 1000).toFixed(1)}s
                </TimerDisplay>
                <StatsToggle onClick={() => setShowStats(!showStats)}>
                  <Zap size={16} />
                  Stats
                </StatsToggle>
              </div>
            </CardHeader>
            
            {/* Canvas with Professional Viewport Controls */}
            <CanvasContainer>
              <CanvasControls>
                <CanvasControlButton onClick={zoomIn} title="Zoom In">
                  <ZoomIn size={16} />
                </CanvasControlButton>
                <CanvasControlButton onClick={zoomOut} title="Zoom Out">
                  <ZoomOut size={16} />
                </CanvasControlButton>
                <CanvasControlButton onClick={resetView} title="Reset View">
                  <Move size={16} />
                </CanvasControlButton>
              </CanvasControls>
              
              <ZoomIndicator>
                {(zoom * 100).toFixed(0)}% | Pan: {panX.toFixed(0)}, {panY.toFixed(0)}
              </ZoomIndicator>
              
              <RaceCanvas
                ref={canvasRef}
                width={MAZE_SIZE * CELL_SIZE}
                height={MAZE_SIZE * CELL_SIZE}
                onWheel={handleCanvasWheel}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              />
            </CanvasContainer>
            
            {/* Controls */}
            <ControlsContainer>
              <BaseButton
                $variant="primary"
                onClick={startRace}
                disabled={isRacing || agents.length === 0}
              >
                <Play size={20} />
                Start Race
              </BaseButton>
              
              <BaseButton
                $variant="warning"
                onClick={pauseRace}
                disabled={!isRacing}
              >
                <Pause size={20} />
                Pause
              </BaseButton>
              
              <BaseButton
                $variant="success"
                onClick={generateNewRace}
                disabled={isRacing}
              >
                <RotateCcw size={20} />
                New Track
              </BaseButton>
            </ControlsContainer>
            
            {/* Settings */}
            <SettingsPanel>
              <SettingGroup>
                <SettingLabel>Speed:</SettingLabel>
                <input
                  type="range"
                  min="20"
                  max="150"
                  value={raceSpeed}
                  onChange={(e) => setRaceSpeed(Number(e.target.value))}
                  style={{ width: '120px', accentColor: 'var(--color-primary-500, #3b82f6)' }}
                />
                <span style={{ 
                  fontFamily: 'var(--font-mono, monospace)', 
                  fontSize: '0.875rem',
                  color: 'var(--color-primary-400, #60a5fa)',
                  fontWeight: 600,
                  minWidth: '3rem',
                  textAlign: 'center'
                }}>
                  {Math.round((200 - raceSpeed) / 20 * 10) / 10}x
                </span>
              </SettingGroup>
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm, 0.75rem)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #cbd5e1)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: 'var(--color-primary-500, #3b82f6)'
                  }}
                />
                Trails
              </label>
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm, 0.75rem)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #cbd5e1)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <input
                  type="checkbox"
                  checked={showExploration}
                  onChange={(e) => setShowExploration(e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    accentColor: 'var(--color-primary-500, #3b82f6)'
                  }}
                />
                Exploration
              </label>
            </SettingsPanel>
          </RaceTrackCard>
          
          {/* Sidebar */}
          <SidebarContainer>
            
            {/* Leaderboard */}
            <SidebarCard>
              <SidebarTitle>
                <Trophy size={20} style={{ color: '#fbbf24' }} />
                Leaderboard
              </SidebarTitle>
              
              <div>
                {sortedAgents.map((agent, index) => {
                  const stats = agent.getStats();
                  const status = winner === agent.name ? 'winner' : agent.getIsFinished() ? 'finished' : 'running';
                  
                  return (
                    <AgentCard key={agent.id} $status={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md, 1rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md, 1rem)' }}>
                          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', minWidth: '2rem' }}>
                            {index + 1}.
                          </span>
                          <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}>
                            {agent.emoji}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary, #f8fafc)' }}>
                              {agent.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-400, #60a5fa)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                              {agent.bigO}
                            </span>
                          </div>
                          {winner === agent.name && (
                            <span style={{ fontSize: '1.25rem', animation: 'pulse 1s ease-in-out infinite', filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' }}>
                              👑
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary, #f8fafc)' }}>
                            {agent.getIsFinished() ? '🏁' : `${Math.round(agent.getProgress())}%`}
                          </div>
                          {showStats && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #cbd5e1)', fontFamily: 'var(--font-mono, monospace)' }}>
                              Path: {stats.pathLength} | Explored: {stats.exploredCells}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!agent.getIsFinished() && (
                        <ProgressBar>
                          <ProgressFill 
                            $percentage={agent.getProgress()}
                            $color={agent.color}
                          />
                        </ProgressBar>
                      )}
                    </AgentCard>
                  );
                })}
              </div>
            </SidebarCard>
            
            {/* Algorithm Info */}
            <SidebarCard>
              <SidebarTitle>
                <Target size={20} style={{ color: '#8b5cf6' }} />
                Algorithms
              </SidebarTitle>
              
              <div>
                {RACING_HORSES.map(horse => (
                  <div key={horse.id} style={{
                    background: 'rgba(75, 85, 99, 0.3)',
                    borderRadius: 'var(--radius-lg, 1rem)',
                    padding: 'var(--spacing-md, 1rem)',
                    marginBottom: 'var(--spacing-md, 1rem)',
                    border: '1px solid rgba(156, 163, 175, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm, 0.75rem)', marginBottom: 'var(--spacing-sm, 0.75rem)' }}>
                      <span style={{ fontSize: '1.5rem' }}>{horse.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary, #f8fafc)' }}>
                          {horse.displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-400, #60a5fa)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                          {horse.bigO}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #cbd5e1)', lineHeight: 1.4 }}>
                      {horse.description}
                    </div>
                  </div>
                ))}
              </div>
            </SidebarCard>
            
            {/* Technical Stats */}
            {showStats && mazeResult && (
              <SidebarCard>
                <SidebarTitle>
                  <Zap size={20} style={{ color: '#f59e0b' }} />
                  Race Performance
                </SidebarTitle>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-sm, 0.75rem)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>Maze Generation:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      {mazeResult.metadata.generationTime.toFixed(1)}ms
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>Algorithms:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      {algorithmResults.filter(r => r.success).length}/{algorithmResults.length} successful
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>Racing Agents:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      {agents.length} active
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>Zoom Level:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      {(zoom * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>Viewport:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      ({panX.toFixed(0)}, {panY.toFixed(0)})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary, #cbd5e1)' }}>FPS:</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary, #f8fafc)' }}>
                      {Math.round(1000 / Math.max(raceSpeed, 16))}
                    </span>
                  </div>
                </div>
              </SidebarCard>
            )}
            
            {/* Keyboard Shortcuts Help */}
            {showStats && (
              <SidebarCard>
                <SidebarTitle>
                  <Target size={20} style={{ color: '#8b5cf6' }} />
                  Keyboard Shortcuts
                </SidebarTitle>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-xs, 0.5rem)', fontSize: '0.875rem' }}>
                  {[
                    { key: '+/-', action: 'Zoom In/Out' },
                    { key: '0', action: 'Reset View' },
                    { key: 'Space', action: 'Start/Pause Race' },
                    { key: 'R', action: 'Generate New Race' },
                    { key: 'Mouse Wheel', action: 'Zoom' },
                    { key: 'Mouse Drag', action: 'Pan View' }
                  ].map(({ key, action }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(107, 114, 128, 0.2)',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--color-text-primary, #f8fafc)'
                      }}>
                        {key}
                      </span>
                      <span style={{ color: 'var(--color-text-secondary, #cbd5e1)', marginLeft: '0.75rem' }}>
                        {action}
                      </span>
                    </div>
                  ))}
                </div>
              </SidebarCard>
            )}
            
          </SidebarContainer>
        </MainGrid>
        
      </ContentWrapper>
    </PageContainer>
  );
}