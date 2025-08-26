'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Play, Pause, RotateCcw, Trophy, Zap, Activity, 
  Radio, Cpu, TrendingUp, Settings,
  Volume2, VolumeX, ChevronUp, ChevronDown, Target,
  CheckCircle, Layers3, Sparkles, Star, Award, 
  CloudLightning, BarChart3, AlertTriangle, Globe,
  Database, GitBranch, Brain, Gauge, Info
} from 'lucide-react';

// Import the styling hub components
import {
  SimulationContainer,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  GlowButton
} from '../simulationHub.styles';

// ============================================================================
// MINIMAL CUSTOM COMPONENTS
// ============================================================================

const Header = styled.div`
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BroadcastInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 900;
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #ef4444 0%, #f59e0b 100%);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: blink 1.5s infinite;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

const HeaderStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const StatBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${props => props.$color}40;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  
  svg {
    color: ${props => props.$color};
  }
`;

const TimeDisplay = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
`;

// Main Simulation Layout
const SimulationLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 1rem;
  margin: 2rem;
  height: 600px;
`;

const LeftPanel = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const RightPanel = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const PanelHeader = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelContent = styled.div`
  padding: 1.5rem;
  height: calc(100% - 60px);
  overflow-y: auto;
  
  .metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border-left: 3px solid #10b981;
  }
  
  .metric-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .metric-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: #10b981;
  }
`;

// Space Race Visualization Components
const SpaceVisualization = styled.div`
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 50%, #000000 100%);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.1);
`;

const SpaceHeader = styled.div`
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
`;

const MissionControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'secondary' 
    ? 'linear-gradient(45deg, #64748b 0%, #475569 100%)'
    : 'linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)'
  };
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$variant === 'secondary' ? 'rgba(100, 116, 139, 0.4)' : 'rgba(59, 130, 246, 0.4)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpaceContainer = styled.div`
  height: 600px;
  position: relative;
  background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 15% 25%, rgba(255,255,255,0.8) 1px, transparent 1px),
      radial-gradient(circle at 85% 15%, rgba(255,255,255,0.6) 1px, transparent 1px),
      radial-gradient(circle at 25% 70%, rgba(255,255,255,0.7) 1px, transparent 1px),
      radial-gradient(circle at 75% 85%, rgba(255,255,255,0.5) 1px, transparent 1px),
      radial-gradient(circle at 45% 30%, rgba(255,255,255,0.4) 1px, transparent 1px),
      radial-gradient(circle at 65% 60%, rgba(255,255,255,0.6) 1px, transparent 1px);
    animation: twinkle 4s ease-in-out infinite alternate;
    pointer-events: none;
    z-index: 1;
  }
  
  @keyframes twinkle {
    0% { opacity: 0.8; }
    100% { opacity: 1; }
  }
`;

const SpaceRocket = styled.div<{ $position: number; $color: string; $speedup: number }>`
  position: absolute;
  left: ${props => Math.min(props.$position * 75 + 10, 75)}%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
  filter: ${props => props.$speedup > 2 ? `drop-shadow(0 0 20px ${props.$color})` : 'none'};
  
  &::after {
    content: '🚀';
    font-size: 2rem;
    display: block;
    filter: hue-rotate(${props => 
      props.$color === '#3b82f6' ? '0deg' : 
      props.$color === '#10b981' ? '120deg' : 
      props.$color === '#06b6d4' ? '180deg' : 
      props.$color === '#f59e0b' ? '60deg' : '0deg'
    });
    animation: ${props => props.$speedup > 3 ? 'rocket-boost 0.5s ease-in-out infinite alternate' : 'none'};
  }
  
  @keyframes rocket-boost {
    0% { transform: scale(1) rotate(-2deg); }
    100% { transform: scale(1.1) rotate(2deg); }
  }
`;

const ThrusterTrail = styled.div<{ $progress: number; $color: string; $intensity: number }>`
  position: absolute;
  left: 10%;
  width: ${props => props.$progress * 75}%;
  top: calc(50% - 2px);
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    ${props => props.$color}22 20%,
    ${props => props.$color}66 60%,
    ${props => props.$color} 100%);
  border-radius: 2px;
  z-index: 2;
  opacity: ${props => 0.6 + props.$intensity * 0.4};
  box-shadow: 0 0 10px ${props => props.$color}44;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: -2px;
    bottom: -2px;
    width: 8px;
    background: ${props => props.$color};
    border-radius: 4px;
    box-shadow: 0 0 15px ${props => props.$color};
  }
`;

const MarsDestination = styled.div`
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  font-size: 4rem;
  z-index: 5;
  animation: mars-rotate 8s ease-in-out infinite;
  filter: drop-shadow(0 0 25px rgba(239, 68, 68, 0.6));
  
  @keyframes mars-rotate {
    0%, 100% { transform: translateY(-50%) rotate(0deg) scale(1); }
    50% { transform: translateY(-50%) rotate(2deg) scale(1.05); }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border: 3px solid rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    animation: mars-atmosphere 12s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 2px solid rgba(251, 191, 36, 0.2);
    border-radius: 50%;
    animation: mars-atmosphere 15s linear infinite reverse;
  }
  
  @keyframes mars-atmosphere {
    0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { transform: translate(-50%, -50%) rotate(360deg); opacity: 0.3; }
  }
`;

const LaunchPad = styled.div`
  position: absolute;
  left: 5%;
  bottom: 10%;
  width: 50px;
  height: 25px;
  background: linear-gradient(45deg, #374151 0%, #6b7280 100%);
  border-radius: 6px;
  z-index: 3;
  
  &::before {
    content: '🌍';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5rem;
  }
  
  &::after {
    content: 'EARTH';
    position: absolute;
    top: -45px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: bold;
    color: #10b981;
    text-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
  }
`;

const InfoDisplay = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  
  .highlight {
    color: #06b6d4;
    font-weight: 600;
  }
  
  .formula {
    background: rgba(59, 130, 246, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    margin: 0.75rem 0;
    border-left: 3px solid #3b82f6;
    font-size: 0.8rem;
  }
`;

const RocketStatus = styled.div<{ $speedup: number; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  border-left: 3px solid ${props => props.$color};
  
  .rocket-info {
    flex: 1;
  }
  
  .rocket-name {
    font-weight: 600;
    color: ${props => props.$color};
    margin-bottom: 0.25rem;
  }
  
  .rocket-specs {
    font-size: 0.75rem;
    opacity: 0.8;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .speedup-value {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: ${props => props.$speedup > 3 ? '#10b981' : props.$speedup > 2 ? '#06b6d4' : '#3b82f6'};
    font-size: 1.1rem;
  }
`;

// CPU Core Components
const ProcessorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin: 1rem 0;
`;

const CPUCore = styled.div<{ $active: boolean; $workload: number; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$active 
    ? `linear-gradient(45deg, ${props.$color} 0%, ${props.$color}aa 100%)`
    : 'rgba(100, 116, 139, 0.3)'
  };
  border: 1px solid ${props => props.$active ? props.$color : 'rgba(255, 255, 255, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.3s ease;
  opacity: ${props => props.$workload > 0 ? 1 : 0.4};
  
  ${props => props.$workload > 0.5 && css`
    box-shadow: 0 0 10px ${props.$color}66;
  `}
`;

// Card Components
const Card = styled.div`
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const CardHeader = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  padding: 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ScenarioButton = styled.button<{ $active: boolean; $color: string }>`
  width: 100%;
  background: ${props => props.$active 
    ? `linear-gradient(45deg, ${props.$color}33 0%, ${props.$color}11 100%)`
    : 'rgba(30, 41, 59, 0.5)'
  };
  border: 1px solid ${props => props.$active ? props.$color : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  margin-bottom: 0.5rem;
  
  &:hover {
    border-color: ${props => props.$color};
    transform: translateY(-1px);
  }
`;

const LeaderboardEntry = styled.div<{ $color: string; $rank: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${props => props.$rank === 1 ? `${props.$color}11` : 'rgba(30, 41, 59, 0.3)'};
  border: 1px solid ${props => props.$rank === 1 ? props.$color : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  position: relative;
  
  ${props => props.$rank <= 3 && css`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${props.$rank === 1 ? '#ffd700' : props.$rank === 2 ? '#c0c0c0' : '#cd7f32'};
      border-radius: 0 3px 3px 0;
    }
  `}
`;

const FormulaBox = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  margin: 1rem 0;
`;

// ============================================================================
// TYPES AND DATA
// ============================================================================

interface ProcessorConfig {
  id: string;
  name: string;
  cores: number;
  baseFreq: number;
  color: string;
}

interface Scenario {
  id: string;
  name: string;
  parallelPortion: number;
  workload: string;
  color: string;
  icon: React.ReactNode;
}

interface SimulationRacer {
  config: ProcessorConfig;
  currentSpeedup: number;
  efficiency: number;
  progress: number;
  workload: number[];
}

const PROCESSOR_CONFIGS: ProcessorConfig[] = [
  { id: 'quad', name: 'Quad Core Pro', cores: 4, baseFreq: 3.2, color: '#3b82f6' },
  { id: 'octa', name: 'Octa Core Beast', cores: 8, baseFreq: 2.8, color: '#10b981' },
  { id: 'hexa', name: 'Hexa Core Elite', cores: 6, baseFreq: 3.0, color: '#06b6d4' },
  { id: 'dual', name: 'Dual Core Turbo', cores: 2, baseFreq: 3.8, color: '#f59e0b' },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'web_server',
    name: 'Web Server Load',
    parallelPortion: 0.95,
    workload: 'HTTP requests, database queries',
    color: '#10b981',
    icon: <Globe size={16} />
  },
  {
    id: 'video_encoding',
    name: 'Video Encoding',
    parallelPortion: 0.85,
    workload: 'Frame processing, compression',
    color: '#06b6d4',
    icon: <Activity size={16} />
  },
  {
    id: 'database',
    name: 'Database Query',
    parallelPortion: 0.70,
    workload: 'Table scans, joins, indexing',
    color: '#3b82f6',
    icon: <Database size={16} />
  },
  {
    id: 'sequential',
    name: 'Sequential Algorithm',
    parallelPortion: 0.30,
    workload: 'Dependency chains, sequential processing',
    color: '#ef4444',
    icon: <GitBranch size={16} />
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AmdahlsLawSimulator({ isDark = false, isRunning: externalRunning = true, speed: externalSpeed = 1 }) {
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>(['quad', 'octa', 'hexa']);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  const [customParallelPortion, setCustomParallelPortion] = useState(0.8);
  const [useCustom, setUseCustom] = useState(false);
  const [isRacing, setIsRacing] = useState(false);
  const [raceTime, setRaceTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [racers, setRacers] = useState<SimulationRacer[]>([]);
  const [activeTab, setActiveTab] = useState<'setup' | 'mission' | 'race' | 'analysis'>('setup');
  
  // Performance tracking
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());
  const [totalDistance, setTotalDistance] = useState(0);

  const animationRef = useRef<number>(0);

  // Core calculations
  const calculateSpeedup = useCallback((parallelPortion: number, processors: number): number => {
    return 1 / ((1 - parallelPortion) + parallelPortion / processors);
  }, []);

  const calculateEfficiency = useCallback((speedup: number, processors: number): number => {
    return (speedup / processors) * 100;
  }, []);

  // Chart data
  const chartData = useMemo(() => {
    const data = [];
    const P = useCustom ? customParallelPortion : currentScenario.parallelPortion;
    
    for (let n = 1; n <= 16; n++) {
      const point: any = {
        processors: n,
        theoretical: n,
        actual: calculateSpeedup(P, n)
      };
      
      selectedProcessors.forEach(procId => {
        const config = PROCESSOR_CONFIGS.find(p => p.id === procId);
        if (config && n <= config.cores) {
          point[config.id] = calculateSpeedup(P, n);
        }
      });
      
      data.push(point);
    }
    return data;
  }, [currentScenario, customParallelPortion, useCustom, selectedProcessors, calculateSpeedup]);

  // Initialize race data
  const initializeRace = useCallback(() => {
    const P = useCustom ? customParallelPortion : currentScenario.parallelPortion;
    const newRacers: SimulationRacer[] = [];
    
    selectedProcessors.forEach(procId => {
      const config = PROCESSOR_CONFIGS.find(p => p.id === procId);
      if (!config) return;
      
      const speedup = calculateSpeedup(P, config.cores);
      const efficiency = calculateEfficiency(speedup, config.cores);
      
      const workload = new Array(8).fill(0);
      const serialWork = 1 - P;
      const parallelWork = P;
      
      workload[0] = Math.min(1, serialWork + parallelWork / config.cores);
      for (let i = 1; i < Math.min(config.cores, 8); i++) {
        workload[i] = parallelWork / config.cores;
      }
      
      newRacers.push({
        config,
        currentSpeedup: speedup,
        efficiency,
        progress: 0,
        workload
      });
    });
    
    newRacers.sort((a, b) => b.currentSpeedup - a.currentSpeedup);
    setRacers(newRacers);
    setRaceTime(0);
  }, [selectedProcessors, currentScenario, customParallelPortion, useCustom, calculateSpeedup, calculateEfficiency]);

  // Animation loop with FPS tracking
  const animate = useCallback(() => {
    if (!isRacing) return;
    
    // FPS calculation
    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime;
    setLastFrameTime(currentTime);
    setFrameCount(prev => prev + 1);
    
    if (frameCount % 10 === 0) { // Update FPS every 10 frames
      setFps(Math.round(1000 / deltaTime));
    }
    
    setRacers(prevRacers => 
      prevRacers.map(racer => {
        const baseSpeed = 0.01;
        const speedMultiplier = racer.currentSpeedup / 8;
        const newProgress = Math.min(1, racer.progress + baseSpeed * speedMultiplier);
        
        return {
          ...racer,
          progress: newProgress
        };
      })
    );
    
    setRaceTime(prev => prev + 20);
    setTotalDistance(prev => prev + 0.5); // Arbitrary distance units
    
    setRacers(prevRacers => {
      if (prevRacers.some(r => r.progress >= 1)) {
        setIsRacing(false);
      }
      return prevRacers;
    });
  }, [isRacing, lastFrameTime, frameCount]);

  useEffect(() => {
    if (isRacing) {
      const interval = setInterval(animate, 20);
      return () => clearInterval(interval);
    }
  }, [isRacing, animate]);

  useEffect(() => {
    initializeRace();
  }, [initializeRace]);

  const startRace = () => {
    setIsRacing(true);
    setFrameCount(0);
    setFps(0);
    setTotalDistance(0);
    setRacers(prev => prev.map(r => ({ ...r, progress: 0 })));
    setRaceTime(0);
    setLastFrameTime(Date.now());
  };

  const resetRace = () => {
    setIsRacing(false);
    setFrameCount(0);
    setFps(0);
    setTotalDistance(0);
    initializeRace();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}s`;
  };

  const P = useCustom ? customParallelPortion : currentScenario.parallelPortion;
  const theoreticalMax = 1 / (1 - P);

  return (
    <SimulationContainer $isDark={isDark}>
      {/* Header */}
      <Header>
        <HeaderContent>
          <BroadcastInfo>
            <Radio size={24} style={{ color: '#ef4444' }} />
            <Title>Amdahl's Law: Mars Mission Simulator</Title>
            <LiveBadge>Live</LiveBadge>
          </BroadcastInfo>
          
          <HeaderStats>
            <StatBadge $color="#10b981">
              <span>🚀</span>
              {racers.length} Rockets
            </StatBadge>
            <StatBadge $color="#06b6d4">
              <Zap size={16} />
              {Math.round(P * 100)}% Parallel
            </StatBadge>
            <StatBadge $color="#f59e0b">
              <Activity size={16} />
              {fps} FPS
            </StatBadge>
            <StatBadge $color="#ef4444">
              <span>📊</span>
              {Math.round(totalDistance)}km
            </StatBadge>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <TimeDisplay>{formatTime(raceTime)}</TimeDisplay>
          </HeaderStats>
        </HeaderContent>
      </Header>

      {/* Main Simulation Layout */}
      <SimulationLayout>
        {/* Left Panel - Mission Control */}
        <LeftPanel>
          <PanelHeader $color="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)">
            <span>🎛️</span>
            Mission Control
          </PanelHeader>
          <PanelContent>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
              <div className="metric">
                <span className="metric-label">Mission Time:</span>
                <span className="metric-value">{formatTime(raceTime)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Workload:</span>
                <span className="metric-value">{currentScenario.name}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Parallelization:</span>
                <span className="metric-value">{Math.round(P * 100)}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Mission Progress:</span>
                <span className="metric-value">
                  {racers.length > 0 ? Math.round(Math.max(...racers.map(r => r.progress)) * 100) : 0}%
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Distance to Mars:</span>
                <span className="metric-value">{Math.round(225000 * (1 - (racers.length > 0 ? Math.max(...racers.map(r => r.progress)) : 0)))}km</span>
              </div>
              <div className="metric">
                <span className="metric-label">Render FPS:</span>
                <span className="metric-value">{fps}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Max Speedup:</span>
                <span className="metric-value">{theoreticalMax.toFixed(2)}×</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <ControlButton onClick={startRace} disabled={isRacing || racers.length === 0} style={{ width: '100%', marginBottom: '0.5rem' }}>
                {isRacing ? <Pause size={16} /> : <Play size={16} />}
                {isRacing ? 'Abort Mission' : 'Launch Mission'}
              </ControlButton>
              <ControlButton onClick={resetRace} $variant="secondary" style={{ width: '100%' }}>
                <RotateCcw size={16} />
                Reset Mission
              </ControlButton>
            </div>
            
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#60a5fa' }}>
              Rocket Status:
            </div>
            {racers.map(racer => (
              <RocketStatus key={racer.config.id} $speedup={racer.currentSpeedup} $color={racer.config.color}>
                <div className="rocket-info">
                  <div className="rocket-name">
                    {racer.config.name}
                    {racer.progress >= 1 && <span style={{ marginLeft: '0.5rem' }}>🏆</span>}
                    {racer.progress >= 0.9 && racer.progress < 1 && <span style={{ marginLeft: '0.5rem' }}>🔥</span>}
                  </div>
                  <div className="rocket-specs">
                    {racer.config.cores} cores • {racer.efficiency.toFixed(1)}% efficient • {Math.round(racer.progress * 100)}% complete
                  </div>
                </div>
                <div className="speedup-value">{racer.currentSpeedup.toFixed(1)}×</div>
              </RocketStatus>
            ))}
          </PanelContent>
        </LeftPanel>

        {/* Center - Space Visualization */}
        <SpaceVisualization>
          <SpaceHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚀</span>
              Mission to Mars: Parallel Processing Race
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {racers.length} Rockets Racing • Destination: Mars 🔴
            </div>
          </SpaceHeader>
          
          <SpaceContainer>
            {/* Thruster trails showing computational progress */}
            {racers.map((racer, index) => (
              <ThrusterTrail
                key={`trail-${racer.config.id}`}
                $progress={racer.progress}
                $color={racer.config.color}
                $intensity={racer.currentSpeedup / 8}
                style={{
                  top: `${25 + index * 18}%`
                }}
              />
            ))}

            {/* Rocket processors */}
            {racers.map((racer, index) => (
              <div key={racer.config.id}>
                {/* Processor name - positioned above the rocket trail to avoid overlap */}
                <div style={{
                  position: 'absolute',
                  top: `${12 + index * 18}%`,
                  left: '2%',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: racer.config.color,
                  textShadow: '0 0 8px rgba(0,0,0,0.9)',
                  zIndex: 12,
                  background: 'rgba(0, 0, 0, 0.85)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${racer.config.color}66`,
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap'
                }}>
                  {racer.config.name}
                </div>
                
                {/* Space rocket */}
                <SpaceRocket
                  $position={racer.progress}
                  $color={racer.config.color}
                  $speedup={racer.currentSpeedup}
                  style={{ 
                    top: `${25 + index * 18}%`
                  }}
                />
                
                {/* Speedup indicator - positioned to the right of rocket, not overlapping */}
                <div style={{
                  position: 'absolute',
                  left: `${Math.min(racer.progress * 75 + 25, 85)}%`,
                  top: `${12 + index * 18}%`,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'JetBrains Mono, monospace',
                  background: `linear-gradient(45deg, ${racer.config.color}ee 0%, ${racer.config.color}aa 100%)`,
                  padding: '2px 5px',
                  borderRadius: '3px',
                  textShadow: 'none',
                  zIndex: 11,
                  border: `1px solid ${racer.config.color}`,
                  boxShadow: `0 2px 8px ${racer.config.color}44`,
                  whiteSpace: 'nowrap',
                  transform: 'translateX(-50%)'
                }}>
                  {racer.currentSpeedup.toFixed(1)}×
                </div>
              </div>
            ))}

            {/* Mars Destination */}
            <MarsDestination>🔴</MarsDestination>
            
            {/* Mars Label */}
            <div style={{
              position: 'absolute',
              right: '2%',
              top: '40%',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: '#ef4444',
              textShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
              zIndex: 12,
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              backdropFilter: 'blur(4px)',
              textAlign: 'center'
            }}>
              MARS<br/>
              <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>DESTINATION</span>
            </div>
            
            {/* Earth Launch Pad */}
            <LaunchPad />

            {/* Cosmic Background Elements */}
            <div style={{ position: 'absolute', top: '15%', left: '25%', fontSize: '1.2rem', opacity: 0.6, zIndex: 1 }}>⭐</div>
            <div style={{ position: 'absolute', top: '25%', right: '30%', fontSize: '0.8rem', opacity: 0.4, zIndex: 1 }}>✨</div>
            <div style={{ position: 'absolute', top: '60%', left: '15%', fontSize: '1rem', opacity: 0.5, zIndex: 1 }}>⭐</div>
            <div style={{ position: 'absolute', top: '80%', left: '40%', fontSize: '0.6rem', opacity: 0.3, zIndex: 1 }}>✨</div>
            <div style={{ position: 'absolute', bottom: '30%', right: '25%', fontSize: '2.5rem', opacity: 0.2, zIndex: 1 }}>🪐</div>
            <div style={{ position: 'absolute', top: '20%', left: '75%', fontSize: '1.8rem', opacity: 0.15, zIndex: 1 }}>🌙</div>
          </SpaceContainer>
        </SpaceVisualization>

        {/* Right Panel - Educational Content */}
        <RightPanel>
          <PanelHeader $color="linear-gradient(90deg, #10b981 0%, #059669 100%)">
            <span>🧠</span>
            CS Concepts
          </PanelHeader>
          <PanelContent>
            <InfoDisplay>
              <div style={{ marginBottom: '1rem' }}>
                <strong>🚀 Mars Mission = Computing Task</strong><br/>
                Each rocket represents a different processor configuration racing to Mars. The winner isn't always who you'd expect!
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>🤔 Why More Cores ≠ Always Faster</strong><br/>
                The <span className="highlight">{Math.round((1 - P) * 100)}% serial portion</span> acts like mission control - only one processor can handle it at a time, creating a bottleneck.
              </div>

              <div className="formula">
                <strong>Amdahl's Law:</strong><br/>
                Speedup = 1 / ((1-P) + P/N)<br/>
                <small>P = parallel %, N = cores</small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>🎯 Key Learning:</strong><br/>
                With <span className="highlight">{Math.round(P * 100)}%</span> parallelizable work, maximum speedup is <span className="highlight">{theoreticalMax.toFixed(2)}×</span> no matter how many cores you add!
              </div>

              {P < 0.5 && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '1rem'
                }}>
                  ⚠️ <strong>Serial Bottleneck Alert!</strong><br/>
                  This workload is mostly sequential - adding more cores won't help much. Sometimes a faster single core beats many slower ones!
                </div>
              )}

              {P > 0.9 && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  marginBottom: '1rem'
                }}>
                  🚀 <strong>Parallelization Paradise!</strong><br/>
                  This workload scales beautifully with more cores. Watch those multi-core rockets fly to Mars!
                </div>
              )}

              {P >= 0.5 && P <= 0.9 && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(6, 182, 212, 0.1)', 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  marginBottom: '1rem'
                }}>
                  ⚖️ <strong>Balanced Workload</strong><br/>
                  This shows the classic trade-off - more cores help, but there's still a serial bottleneck limiting speedup.
                </div>
              )}

              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem' }}>
                <strong>🌍 Real-world Examples:</strong><br/>
                • Web servers: Highly parallel (like our 95% scenario)<br/>
                • Video encoding: Moderately parallel (85% scenario)<br/>
                • Database queries: Mixed parallel/serial (70% scenario)<br/>
                • File compression: Often sequential (30% scenario)
              </div>
            </InfoDisplay>
          </PanelContent>
        </RightPanel>
      </SimulationLayout>

      {/* Controls */}
      <ControlsSection $isDark={isDark}>
        <TabContainer>
          <Tab $active={activeTab === 'setup'} onClick={() => setActiveTab('setup')}>
            <Settings size={16} style={{ marginRight: '0.5rem' }} />
            Mission Setup
          </Tab>
          <Tab $active={activeTab === 'mission'} onClick={() => setActiveTab('mission')}>
            <Activity size={16} style={{ marginRight: '0.5rem' }} />
            Mission Status
          </Tab>
          <Tab $active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')}>
            <BarChart3 size={16} style={{ marginRight: '0.5rem' }} />
            Data Analysis
          </Tab>
        </TabContainer>

        <TabContent>
          {activeTab === 'setup' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Rocket Selection */}
              <Card>
                <CardHeader $color="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🚀</span>
                    Rocket Fleet
                  </div>
                  <span style={{ fontSize: '0.75rem' }}>{selectedProcessors.length} rockets selected</span>
                </CardHeader>
                <CardContent>
                  {PROCESSOR_CONFIGS.map(config => (
                    <ScenarioButton
                      key={config.id}
                      $active={selectedProcessors.includes(config.id)}
                      $color={config.color}
                      onClick={() => {
                        if (selectedProcessors.includes(config.id)) {
                          setSelectedProcessors(prev => prev.filter(p => p !== config.id));
                        } else {
                          setSelectedProcessors(prev => [...prev, config.id]);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                            {config.name}
                            {selectedProcessors.includes(config.id) && <CheckCircle size={12} style={{ marginLeft: '0.5rem' }} />}
                          </div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            {config.cores} cores • {config.baseFreq} GHz
                          </div>
                        </div>
                        <div style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          backgroundColor: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {config.cores}
                        </div>
                      </div>
                    </ScenarioButton>
                  ))}
                </CardContent>
              </Card>

              {/* Mission Scenario Selection */}
              <Card>
                <CardHeader $color="linear-gradient(90deg, #10b981 0%, #059669 100%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={16} />
                    Mission Scenarios
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={useCustom}
                        onChange={(e) => setUseCustom(e.target.checked)}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Custom Configuration</span>
                    </label>
                  </div>

                  {!useCustom ? (
                    SCENARIOS.map(scenario => (
                      <ScenarioButton
                        key={scenario.id}
                        $active={currentScenario.id === scenario.id}
                        $color={scenario.color}
                        onClick={() => setCurrentScenario(scenario)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {scenario.icon}
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                              {scenario.name}
                              {currentScenario.id === scenario.id && <Star size={12} style={{ marginLeft: '0.5rem' }} />}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              {Math.round(scenario.parallelPortion * 100)}% parallelizable
                            </div>
                          </div>
                        </div>
                      </ScenarioButton>
                    ))
                  ) : (
                    <div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Parallel Portion: <strong>{Math.round(customParallelPortion * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.99"
                        step="0.01"
                        value={customParallelPortion}
                        onChange={(e) => setCustomParallelPortion(parseFloat(e.target.value))}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        Max speedup: {theoreticalMax.toFixed(2)}×
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'mission' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Leaderboard */}
              <Card>
                <CardHeader $color="linear-gradient(90deg, #f59e0b 0%, #d97706 100%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} />
                    Leaderboard
                  </div>
                  <Sparkles size={14} />
                </CardHeader>
                <CardContent>
                  {racers
                    .sort((a, b) => b.currentSpeedup - a.currentSpeedup)
                    .map((racer, index) => (
                      <LeaderboardEntry
                        key={racer.config.id}
                        $rank={index + 1}
                        $color={racer.config.color}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: index <= 2 ? '#000' : '#fff'
                          }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {racer.config.name}
                              {index === 0 && <CloudLightning size={12} style={{ marginLeft: '0.5rem' }} />}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: racer.config.color }}>
                              {racer.currentSpeedup.toFixed(2)}× • {racer.efficiency.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div>
                          {racer.efficiency > 50 && <Award size={14} />}
                        </div>
                      </LeaderboardEntry>
                    ))}
                </CardContent>
              </Card>

              {/* CPU Cores */}
              <Card>
                <CardHeader $color="linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={16} />
                    CPU Utilization
                  </div>
                </CardHeader>
                <CardContent>
                  {racers.map(racer => (
                    <div key={racer.config.id} style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: racer.config.color 
                        }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {racer.config.name}
                        </span>
                      </div>
                      <ProcessorGrid>
                        {Array.from({ length: 8 }, (_, i) => (
                          <CPUCore
                            key={i}
                            $active={i < racer.config.cores}
                            $workload={i < racer.config.cores ? racer.workload[i] || 0 : 0}
                            $color={racer.config.color}
                          >
                            {i < racer.config.cores ? i + 1 : ''}
                          </CPUCore>
                        ))}
                      </ProcessorGrid>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Chart */}
              <Card>
                <CardHeader $color="linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers3 size={16} />
                    Amdahl's Law: Rocket Performance Analysis
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="processors" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px' 
                          }}
                        />
                        
                        <Line 
                          type="monotone" 
                          dataKey="theoretical" 
                          stroke="#6B7280" 
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                        />
                        
                        {selectedProcessors.map(procId => {
                          const config = PROCESSOR_CONFIGS.find(p => p.id === procId);
                          return config ? (
                            <Line 
                              key={config.id}
                              type="monotone"
                              dataKey={config.id}
                              stroke={config.color}
                              strokeWidth={2}
                            />
                          ) : null;
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <FormulaBox>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Amdahl's Law</div>
                    <div style={{ fontSize: '1.1rem' }}>
                      Speedup = <span style={{ color: '#06b6d4' }}>1</span> / 
                      ((<span style={{ color: '#ef4444' }}>1 - P</span>) + 
                      <span style={{ color: '#10b981' }}> P</span> / 
                      <span style={{ color: '#3b82f6' }}>N</span>)
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
                      P = {Math.round(P * 100)}% parallel, Max = {theoreticalMax.toFixed(2)}×
                    </div>
                  </FormulaBox>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <StatCard $color="#10b981">
                  <div className="label">Parallel Operations</div>
                  <div className="value">{Math.round(P * 100)}%</div>
                  <div className="change">Can be done simultaneously</div>
                </StatCard>
                
                <StatCard $color="#ef4444">
                  <div className="label">Serial Bottleneck</div>
                  <div className="value">{Math.round((1 - P) * 100)}%</div>
                  <div className="change">Must be done sequentially</div>
                </StatCard>
                
                <StatCard $color="#3b82f6">
                  <div className="label">Theoretical Max Speed</div>
                  <div className="value">{theoreticalMax.toFixed(1)}×</div>
                  <div className="change">Physical limit of this workload</div>
                </StatCard>
                
                <StatCard $color="#06b6d4">
                  <div className="label">Fastest Processor</div>
                  <div className="value">
                    {racers.length > 0 ? Math.max(...racers.map(r => r.currentSpeedup)).toFixed(1) : '0'}×
                  </div>
                  <div className="change">Current race leader</div>
                </StatCard>
              </div>
            </div>
          )}
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}