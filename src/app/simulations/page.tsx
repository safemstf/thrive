// src/app/simulations/page.tsx - Enhanced Professional Simulation Platform
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import styled, { keyframes, css } from 'styled-components';
import {
  Play, Pause, RotateCcw, Activity, Target, Grid, Volume2, VolumeX,
  Bone, Zap, Users, Trophy, Shield, Crown, Cpu, Eye, Star, RotateCw, Microscope,
  Droplet, Wifi, BookOpen, Sliders, Monitor, Beaker, Loader, Camera, Info,
  Maximize2, X, ChevronLeft, ChevronRight, Gauge, HelpCircle
} from 'lucide-react';
import { MatrixRain } from './matrixStyling';
import AmdahlsLawSimulator from '@/components/cs/amdalsLaw/amdalsLaw';
import PermutationSimulation from '@/components/cs/algorithms/algorithms';

// Dynamic imports
const TSPAlgorithmRace = dynamic(() => import("@/components/cs/ants/ants"), {
  ssr: false,
  loading: () => <SimulationLoader>Loading TSP Algorithm Race...</SimulationLoader>
});

const MazeSolverDemo = dynamic(() => import('@/components/cs/mazesolver/mazeSolver'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Pathfinding Derby...</SimulationLoader>
});

const DiseaseSimulation = dynamic(() => import('@/components/cs/disease/disease'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Epidemic Models...</SimulationLoader>
});

const LifeSimulation = dynamic(() => import('@/components/cs/life/life'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Game of Life...</SimulationLoader>
});

const AdvancedBacteremiaSimulator = dynamic(() => import('@/components/cs/bacteria/bacteria'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Bacteria & Phages...</SimulationLoader>
});

const NetworkProtocolSimulation = dynamic(() => import('@/components/cs/networkProtocol/np'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading OFDM Simulation...</SimulationLoader>
});

const NBodySandbox = dynamic(() => import("@/components/cs/nb/nb"), {
  ssr: false,
  loading: () => <SimulationLoader>Loading N-Body Sandbox...</SimulationLoader>
});

// Types
type SimulationType = 'ants' | 'life' | 'maze' | 'disease' | 'bacteria-phage' | 'predprey' | 'chem-resonance' | 'nbody' | 'three-body' | 'parallel-model' | 'amdahl' | 'permutations-visual' | 'wireless' | 'FourierTransform-NeuralNetwork' | 'FourierTransformNetworkErrorCorrection';
type TabType = 'simulations' | 'algorithms';

interface SimulationItem {
  key: SimulationType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  optimized: boolean;
  featured: boolean;
  special?: boolean;
  comingSoon?: boolean;
  category: TabType;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Loading Component
const SimulationLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #64748b;
  font-family: 'Inter', system-ui, sans-serif;
  
  &::before {
    content: '';
    width: 32px;
    height: 32px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    margin-bottom: 1rem;
    animation: ${spin} 1s linear infinite;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 50%, #f1f5f9 100%);
  position: relative;
  overflow-x: hidden;
`;

const MatrixBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.3;
  pointer-events: none;
`;

const ContentWrapper = styled.div`
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #475569, #64748b);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: 'Inter', system-ui, sans-serif;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
`;

const TabWrapper = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'white' : 'transparent'};
  color: ${({ $active }) => $active ? '#1e293b' : '#64748b'};
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $active }) => $active && css`
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  `}

  &:hover {
    background: ${({ $active }) => $active ? 'white' : 'rgba(59, 130, 246, 0.05)'};
    color: ${({ $active }) => $active ? '#1e293b' : '#3b82f6'};
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div<{ $active?: boolean; $featured?: boolean; $comingSoon?: boolean }>`
  position: relative;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid ${({ $active, $featured }) => {
    if ($featured && $active) return '#3b82f6';
    if ($active) return '#3b82f6';
    return 'rgba(148, 163, 184, 0.2)';
  }};
  cursor: ${({ $comingSoon }) => $comingSoon ? 'default' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $comingSoon }) => $comingSoon ? 0.6 : 1};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  
  ${({ $active }) => $active && css`
    box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  `}

  &:hover {
    transform: ${({ $comingSoon }) => $comingSoon ? 'none' : 'translateY(-4px)'};
    box-shadow: ${({ $comingSoon }) =>
    $comingSoon ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 12px 40px rgba(0, 0, 0, 0.1)'};
    border-color: ${({ $comingSoon }) => $comingSoon ? 'rgba(148, 163, 184, 0.2)' : '#3b82f6'};
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ItemIcon = styled.div<{ $color: string; $comingSoon?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color, $comingSoon }) =>
    $comingSoon ? '#f1f5f9' : `${$color}15`};
  color: ${({ $color, $comingSoon }) => $comingSoon ? '#94a3b8' : $color};
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.h3<{ $comingSoon?: boolean }>`
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
  color: ${({ $comingSoon }) => $comingSoon ? '#94a3b8' : '#1e293b'};
  line-height: 1.3;
`;

const ItemDescription = styled.p`
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #64748b;
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
`;

const Badge = styled.div<{ $variant?: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'featured':
        return css`
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        `;
      case 'optimized':
        return css`
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        `;
      case 'social':
        return css`
          background: #fefce8;
          color: #ca8a04;
          border: 1px solid #fef08a;
        `;
      case 'coming-soon':
        return css`
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        `;
      default:
        return css`
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
        `;
    }
  }}
`;

// Theater Mode Components
const TheaterOverlay = styled.div<{ $active: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, ${({ $active }) => $active ? '0.6' : '0'});
  /* make sure overlay sits under the simulation window */
  z-index: ${({ $active }) => $active ? '900' : '-1'};
  pointer-events: ${({ $active }) => $active ? 'auto' : 'none'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

/* Replace existing FadingElements */
const FadingElements = styled.div<{ $theater: boolean }>`
  /* transition only opacity+visibility to avoid creating stacking contexts */
  opacity: ${({ $theater }) => $theater ? '0' : '1'};
  visibility: ${({ $theater }) => $theater ? 'hidden' : 'visible'};
  pointer-events: ${({ $theater }) => $theater ? 'none' : 'auto'};
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1), visibility 0.35s;
`;


const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ControlButton = styled.button<{ $variant?: string; $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ $variant, $active }) => {
    if ($variant === 'danger') return '#f87171';
    if ($active) return '#3b82f6';
    return '#e2e8f0';
  }};
  background: ${({ $variant, $active }) => {
    if ($variant === 'danger') return '#fef2f2';
    if ($active) return '#eff6ff';
    return 'white';
  }};
  color: ${({ $variant, $active }) => {
    if ($variant === 'danger') return '#dc2626';
    if ($active) return '#2563eb';
    return '#475569';
  }};
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${({ $variant, $active }) => {
    if ($variant === 'danger') return '#fee2e2';
    if ($active) return '#dbeafe';
    return '#f8fafc';
  }};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ $variant }) =>
    $variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'
  };
  }
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  
  span {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    color: #475569;
  }
  
  input[type="range"] {
    width: 120px;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      cursor: pointer;
      transition: transform 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  .value {
    color: #3b82f6;
    font-weight: 700;
    min-width: 40px;
  }
`;

const TheaterControls = styled(ControlsContainer) <{ $theater: boolean }>`
  ${({ $theater }) => $theater && css`
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    background: rgba(15, 23, 42, 0.95);
    padding: 1rem 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    backdrop-filter: blur(20px);
    margin-bottom: 0;
    animation: ${slideIn} 0.5s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    
    ${ControlButton} {
      border-color: rgba(148, 163, 184, 0.3);
      background: rgba(51, 65, 85, 0.8);
      color: #e2e8f0;
      
      &:hover {
        background: rgba(71, 85, 105, 0.9);
        border-color: rgba(59, 130, 246, 0.5);
      }
    }
    
    ${SpeedControl} {
      background: rgba(51, 65, 85, 0.8);
      border-color: rgba(148, 163, 184, 0.3);
      
      span {
        color: #e2e8f0;
      }
      
      .value {
        color: #60a5fa;
      }
    }
  `}
`;

const SimulationWindow = styled.div`
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 2rem;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TheaterSimulationWindow = styled(SimulationWindow) <{ $theater: boolean }>`
  ${({ $theater }) => $theater && css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 92vw;
    height: 88vh;
    z-index: 1001; /* above the overlay */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(59, 130, 246, 0.4);
    min-height: unset;
    animation: ${fadeIn} 0.5s ease-out;
    padding: 1.5rem;
    /* IMPORTANT: keep this transparent so the canvas area isn't tinted */
    background: transparent;
  `}
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;


const SimulationContent = styled.div<{ $theater?: boolean }>`
  width: 100%;
  height: 100%;
  min-height: ${({ $theater }) => $theater ? 'auto' : '550px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ $theater }) => $theater ? '12px' : '16px'};
  /* Ensure the canvas area stays bright in theater mode */
  background: ${({ $theater }) => $theater ? '#ffffff' : '#fafbfc'};
  padding: ${({ $theater }) => $theater ? '0' : '2rem'};
  overflow: hidden;
  position: relative;
  /* put the content above the overlay so it doesn't get dimmed */
  z-index: ${({ $theater }) => $theater ? '1002' : '1'};

  > * {
    width: 100%;
    height: 100%;
    /* if the simulation uses a canvas element, ensure it has explicit background where needed */
    background: transparent;
  }
`;

const PlaceholderContent = styled.div`
  text-align: center;
  color: #64748b;
  font-family: 'Inter', system-ui, sans-serif;
  
  h3 {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 0.875rem;
    line-height: 1.6;
  }
`;

const StatusBar = styled.div<{ $theater?: boolean }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 600;
  z-index: 10;
  
  ${({ $theater }) => $theater && css`
    top: 2rem;
    right: 2rem;
  `}
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)'};
    border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
    border-radius: 8px;
    backdrop-filter: blur(10px);
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#475569'};
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.running {
      background: #10b981;
      animation: ${pulse} 2s ease-in-out infinite;
    }
    &.paused { background: #f59e0b; }
    &.optimized { background: #3b82f6; }
  }
`;

// New Components
const KeyboardHintOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 23, 42, 0.98);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  z-index: 10000;
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  backdrop-filter: blur(20px);
  max-width: 500px;
  width: 90%;
`;

const HintTitle = styled.h3`
  color: #e2e8f0;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
`;

const HintGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const HintItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
  font-size: 0.875rem;
  font-family: 'Inter', system-ui, sans-serif;
  
  .key {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }
`;

const PerformancePanel = styled.div<{ $show: boolean; $theater?: boolean }>`
  position: absolute;
  top: ${({ $theater }) => $theater ? '2rem' : '1rem'};
  left: ${({ $theater }) => $theater ? '2rem' : '1rem'};
  background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  z-index: 10;
  
  .metric {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
    color: ${({ $theater }) => $theater ? '#94a3b8' : '#64748b'};
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .value {
      color: ${({ $theater }) => $theater ? '#60a5fa' : '#3b82f6'};
      font-weight: 600;
    }
  }
`;

const ScreenshotButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #475569;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: white;
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const QuickSwitcher = styled.div<{ $show: boolean }>`
  position: fixed;
  bottom: 8rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1002;
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
  max-width: 90vw;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(51, 65, 85, 0.3);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 2px;
  }
`;

const QuickSimCard = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.5)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.5)' : 'rgba(148, 163, 184, 0.2)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 80px;
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  .icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const InfoPanel = styled.div<{ $show: boolean; $theater?: boolean }>`
  position: absolute;
  bottom: ${({ $theater }) => $theater ? '8rem' : '1rem'};
  right: ${({ $theater }) => $theater ? '2rem' : '1rem'};
  max-width: 300px;
  background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
  backdrop-filter: blur(10px);
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: all 0.3s ease;
  z-index: 10;
  
  h4 {
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#1e293b'};
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  p {
    color: ${({ $theater }) => $theater ? '#94a3b8' : '#64748b'};
    font-size: 0.75rem;
    line-height: 1.5;
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
  }
`;

// Data
const allItems: SimulationItem[] = [
  {
    key: 'life',
    label: "Conway's Game of Life",
    icon: <Activity size={24} />,
    color: '#10b981',
    description: 'GPU-accelerated cellular automaton with pattern analysis',
    optimized: true,
    featured: false,
    category: 'simulations'
  },
  {
    key: 'ants',
    label: 'Travelling Salesman',
    icon: <Users size={24} />,
    color: '#0077ff',
    description: 'Neural swarm intelligence with real user integration and live rankings',
    optimized: true,
    featured: true,
    special: true,
    category: 'algorithms'
  },
  {
    key: 'disease',
    label: 'Epidemiological Models',
    icon: <Target size={24} />,
    color: '#ef4444',
    description: 'Agent-based epidemic models with policy modules',
    optimized: true,
    featured: true,
    category: 'simulations'
  },
  {
    key: 'bacteria-phage',
    label: 'Bacteria & Phages',
    icon: <Droplet size={24} />,
    color: '#059669',
    description: 'Bacterial colony interactions with bacteriophage dynamics',
    optimized: false,
    featured: false,
    comingSoon: false,
    category: 'simulations'
  },
  {
    key: 'predprey',
    label: 'Predator–Prey Field',
    icon: <Zap size={24} />,
    color: '#10b981',
    description: 'Spatial Lotka–Volterra agent patches for population dynamics',
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'simulations'
  },
  {
    key: 'chem-resonance',
    label: 'Organic Chemistry Lab',
    icon: <Microscope size={24} />,
    color: '#a78bfa',
    description: 'Interactive resonance & reaction visualizer with electron clouds',
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'simulations'
  },
  {
    key: 'nbody',
    label: 'Space & Stars',
    icon: <Star size={24} />,
    color: '#f97316',
    description: 'Star & gravity sandbox with advanced physics integration',
    optimized: true,
    featured: true,
    comingSoon: false,
    category: 'simulations'
  },
  {
    key: 'three-body',
    label: '3-Body Explorer',
    icon: <RotateCw size={24} />,
    color: '#ef4444',
    description: '3-body problem presets with chaos and divergence visualization',
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'simulations'
  },
  {
    key: 'maze',
    label: 'Pathfinding Derby',
    icon: <Grid size={24} />,
    color: '#8b5cf6',
    description: 'Head-to-head algorithm comparisons with live metrics',
    optimized: true,
    featured: true,
    category: 'algorithms'
  },
  {
    key: 'parallel-model',
    label: 'Parallel Computing Lab',
    icon: <Cpu size={24} />,
    color: '#f59e0b',
    description: 'Task-DAG visualizer with scheduling strategies',
    optimized: true,
    featured: false,
    comingSoon: true,
    category: 'algorithms'
  },
  {
    key: 'amdahl',
    label: "Amdahl's Law Studio",
    icon: <Sliders size={24} />,
    color: '#fb7185',
    description: 'Interactive performance scaling law visualizer',
    optimized: true,
    featured: false,
    comingSoon: true,
    category: 'algorithms'
  },
  {
    key: 'permutations-visual',
    label: "Permutations",
    icon: <BookOpen size={24} />,
    color: '#7c3aed',
    description: 'Recursion-tree visualizer for complexity analysis',
    optimized: true,
    featured: false,
    comingSoon: false,
    category: 'algorithms'
  },
  {
    key: 'FourierTransform-NeuralNetwork',
    label: 'Fourier Transform Neural Network',
    icon: <Wifi size={24} />,
    color: '#d47406ff',
    description: 'Exploring Fourier transform in neural networks',
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'algorithms'
  },
  {
    key: 'FourierTransformNetworkErrorCorrection',
    label: 'Wireless Networks Error Corretion',
    icon: <Wifi size={24} />,
    color: '#06d4a0ff',
    description: 'Exploring wirless network error correction',
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'algorithms'
  },
  {
    key: 'wireless',
    label: 'Network Protocols',
    icon: <Wifi size={24} />,
    color: '#06b6d4',
    description: 'Wireless propagation, routing protocols and packet analysis',
    optimized: true,
    featured: true,
    comingSoon: false,
    category: 'algorithms'
  }
];

// Main Component
export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simulations');
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('disease');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fps, setFps] = useState(60);

  const fpsRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());

  const simulationItems = allItems.filter(item => item.category === 'simulations');
  const algorithmItems = allItems.filter(item => item.category === 'algorithms');

  // FPS Tracking
  useEffect(() => {
    if (!isRunning) return;

    let frameId: number;
    const updateFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const currentFps = Math.round(1000 / delta);
      fpsRef.current.push(currentFps);

      if (fpsRef.current.length > 60) {
        fpsRef.current.shift();
      }

      const avgFps = Math.round(fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length);
      setFps(avgFps);

      frameId = requestAnimationFrame(updateFPS);
    };

    frameId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  // Trigger resize when theater mode changes to update canvas simulations
  useEffect(() => {
    // Small delay to let DOM update
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, [theaterMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Theater mode
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setTheaterMode(prev => !prev);
      }

      // Exit theater mode
      if (e.key === 'Escape' && theaterMode) {
        setTheaterMode(false);
      }

      // Show keyboard hints
      if (e.key === '?' && e.shiftKey) {
        setShowKeyboardHints(prev => !prev);
      }

      // Quick switcher
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowQuickSwitcher(prev => !prev);
      }

      // Play/Pause
      if (e.key === ' ' && theaterMode) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }

      // Performance metrics
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowPerformance(prev => !prev);
      }

      // Info panel
      if (e.key === 'i') {
        setShowInfo(prev => !prev);
      }

      // Speed control
      if (e.key === '+' || e.key === '=') {
        setSpeed(prev => Math.min(3, prev + 0.1));
      }
      if (e.key === '-' || e.key === '_') {
        setSpeed(prev => Math.max(0.1, prev - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [theaterMode]);

  const handleItemClick = (item: SimulationItem) => {
    if (!item.comingSoon) {
      setActiveSimulation(item.key);
    }
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
      setSpeed(1);
    }, 100);
  }, []);

  const handleScreenshot = () => {
    // This would need to be implemented based on the specific simulation
    console.log('Screenshot captured');
  };

  const activeItem = allItems.find(item => item.key === activeSimulation);
  const availableSimulations = allItems.filter(item => !item.comingSoon);

  const renderSimulation = () => {
    switch (activeSimulation) {
      case 'ants':
        return <TSPAlgorithmRace isRunning={isRunning} speed={speed} />;
      case 'maze':
        return <MazeSolverDemo />;
      case 'disease':
        return <DiseaseSimulation isRunning={isRunning} speed={speed} isDark={false} />;
      case 'life':
        return <LifeSimulation isDark={false} isRunning={isRunning} speed={speed} />;
      case 'bacteria-phage':
        return <AdvancedBacteremiaSimulator initialRunning={isRunning} initialSpeed={speed} isDark={false} />;
      case 'amdahl':
        return <AmdahlsLawSimulator isRunning={isRunning} speed={speed} isDark={false} />;
      case 'wireless':
        return <NetworkProtocolSimulation isRunning={isRunning} speed={speed} isDark={false} />;
      case 'permutations-visual':
        return <PermutationSimulation isRunning={isRunning} speed={speed} isDark={false} />;
      case 'nbody':
        return <NBodySandbox isRunning={isRunning} speed={speed} isDark={false} />;
      default:
        return (
          <PlaceholderContent>
            <div style={{ fontSize: '48px', marginBottom: '1rem', color: activeItem?.color || '#3b82f6' }}>
              {activeItem?.icon}
            </div>
            <h3>{activeItem?.label}</h3>
            <p>{activeItem?.description}</p>
            {activeItem?.comingSoon && (
              <p style={{ marginTop: '2rem', color: '#f59e0b' }}>Coming Soon...</p>
            )}
          </PlaceholderContent>
        );
    }
  };

  return (
    <PageContainer>
      <TheaterOverlay
        $active={theaterMode}
        onClick={() => setTheaterMode(false)}
      />

      <MatrixBackground>
        <MatrixRain fontSize={32} layers={3} />
      </MatrixBackground>

      <ContentWrapper>
        <FadingElements $theater={theaterMode}>
          <PageHeader>
            <PageTitle>Computational Simulations</PageTitle>
            <PageSubtitle>
              Professional-grade algorithms and simulations for research and education
            </PageSubtitle>
          </PageHeader>

          <TabContainer>
            <TabWrapper>
              <TabButton
                $active={activeTab === 'simulations'}
                onClick={() => setActiveTab('simulations')}
              >
                <Microscope size={18} />
                Simulations
              </TabButton>
              <TabButton
                $active={activeTab === 'algorithms'}
                onClick={() => setActiveTab('algorithms')}
              >
                <Cpu size={18} />
                Algorithms
              </TabButton>
            </TabWrapper>
          </TabContainer>

          <ItemsGrid>
            {(activeTab === 'simulations' ? simulationItems : algorithmItems).map(item => (
              <ItemCard
                key={item.key}
                onClick={() => handleItemClick(item)}
                $active={activeSimulation === item.key}
                $featured={item.featured}
                $comingSoon={item.comingSoon}
              >
                <BadgeContainer>
                  {item.featured && !item.comingSoon && (
                    <Badge $variant="featured">Featured</Badge>
                  )}
                  {item.optimized && (
                    <Badge $variant="optimized">60 FPS</Badge>
                  )}
                  {item.special && (
                    <Badge $variant="social">Interactive</Badge>
                  )}
                  {item.comingSoon && (
                    <Badge $variant="coming-soon">Coming Soon</Badge>
                  )}
                </BadgeContainer>

                <ItemHeader>
                  <ItemIcon $color={item.color} $comingSoon={item.comingSoon}>
                    {item.icon}
                  </ItemIcon>
                  <ItemContent>
                    <ItemTitle $comingSoon={item.comingSoon}>
                      {item.label}
                    </ItemTitle>
                    <ItemDescription>{item.description}</ItemDescription>
                  </ItemContent>
                </ItemHeader>
              </ItemCard>
            ))}
          </ItemsGrid>
        </FadingElements>

        {activeItem && !activeItem.comingSoon && (
          <TheaterControls $theater={theaterMode}>
            <ControlButton
              onClick={() => setIsRunning(!isRunning)}
              $variant={isRunning ? 'danger' : 'primary'}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pause' : 'Run'}
            </ControlButton>

            <ControlButton onClick={handleReset}>
              <RotateCcw size={18} />
              Reset
            </ControlButton>

            <SpeedControl>
              <span>Speed</span>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
              />
              <div className="value">{speed.toFixed(1)}x</div>
            </SpeedControl>

            <ControlButton
              onClick={() => setTheaterMode(!theaterMode)}
              $active={theaterMode}
              title="Theater Mode (F)"
            >
              {theaterMode ? <Monitor size={18} /> : <Eye size={18} />}
              Focus
            </ControlButton>

            <ControlButton
              onClick={() => setShowPerformance(!showPerformance)}
              $active={showPerformance}
              title="Performance (Ctrl/Cmd + P)"
            >
              <Gauge size={18} />
            </ControlButton>

            <ControlButton
              onClick={() => setShowInfo(!showInfo)}
              $active={showInfo}
              title="Info (I)"
            >
              <Info size={18} />
            </ControlButton>

            <ControlButton
              onClick={() => setSoundEnabled(!soundEnabled)}
              $active={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </ControlButton>

            <ControlButton
              onClick={() => setShowKeyboardHints(true)}
              title="Keyboard Shortcuts (?)"
            >
              <HelpCircle size={18} />
            </ControlButton>
          </TheaterControls>
        )}

        <TheaterSimulationWindow $theater={theaterMode}>
          {activeItem && (
            <>
              <StatusBar $theater={theaterMode}>
                <div className="status-item">
                  <div className={`status-dot ${isRunning ? 'running' : 'paused'}`} />
                  {isRunning ? 'Running' : 'Paused'}
                </div>
                <div className="status-item">
                  Speed: {speed.toFixed(1)}x
                </div>
                {activeItem.optimized && (
                  <div className="status-item">
                    <div className="status-dot optimized" />
                    GPU Accelerated
                  </div>
                )}
              </StatusBar>

              <PerformancePanel $show={showPerformance} $theater={theaterMode}>
                <div className="metric">
                  <span>FPS</span>
                  <span className="value">{fps}</span>
                </div>
                <div className="metric">
                  <span>Frame Time</span>
                  <span className="value">{(1000 / fps).toFixed(1)}ms</span>
                </div>
                <div className="metric">
                  <span>Speed</span>
                  <span className="value">{speed.toFixed(1)}x</span>
                </div>
              </PerformancePanel>

              <InfoPanel $show={showInfo} $theater={theaterMode}>
                <h4>{activeItem.label}</h4>
                <p>{activeItem.description}</p>
              </InfoPanel>

              {theaterMode && (
                <ScreenshotButton onClick={handleScreenshot}>
                  <Camera size={16} />
                  Capture
                </ScreenshotButton>
              )}

              <SimulationContent $theater={theaterMode}>
                {renderSimulation()}
              </SimulationContent>
            </>
          )}
        </TheaterSimulationWindow>

        <QuickSwitcher $show={showQuickSwitcher && theaterMode}>
          {availableSimulations.map(item => (
            <QuickSimCard
              key={item.key}
              $active={activeSimulation === item.key}
              onClick={() => {
                setActiveSimulation(item.key);
                setShowQuickSwitcher(false);
              }}
            >
              <div className="icon">{item.icon}</div>
              <span>{item.label.split(' ')[0]}</span>
            </QuickSimCard>
          ))}
        </QuickSwitcher>

        <KeyboardHintOverlay $show={showKeyboardHints}>
          <HintTitle>Keyboard Shortcuts</HintTitle>
          <HintGrid>
            <HintItem>
              <span>Theater Mode</span>
              <span className="key">F</span>
            </HintItem>
            <HintItem>
              <span>Play / Pause</span>
              <span className="key">Space</span>
            </HintItem>
            <HintItem>
              <span>Quick Switcher</span>
              <span className="key">Ctrl/Cmd + K</span>
            </HintItem>
            <HintItem>
              <span>Performance</span>
              <span className="key">Ctrl/Cmd + P</span>
            </HintItem>
            <HintItem>
              <span>Info Panel</span>
              <span className="key">I</span>
            </HintItem>
            <HintItem>
              <span>Increase Speed</span>
              <span className="key">+</span>
            </HintItem>
            <HintItem>
              <span>Decrease Speed</span>
              <span className="key">-</span>
            </HintItem>
            <HintItem>
              <span>Exit / Close</span>
              <span className="key">Esc</span>
            </HintItem>
          </HintGrid>
          <ControlButton
            onClick={() => setShowKeyboardHints(false)}
            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
          >
            Close
          </ControlButton>
        </KeyboardHintOverlay>
      </ContentWrapper>
    </PageContainer>
  );
}