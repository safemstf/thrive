// src/app/simulations/page.tsx - Enhanced Professional Simulation Platform
'use client';
// cladogram simulation with longest subsequences and phylogenetic trees
import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import styled, { keyframes, css } from 'styled-components';
import {
  Play, Pause, RotateCcw, Activity, Target, Grid, Volume2, VolumeX,
  Zap, Users, Star, RotateCw, Microscope, Droplet, Wifi, BookOpen,
  Sliders, Cpu, Eye, Camera, Info, Gauge, HelpCircle, Maximize2, Check
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

const PhylogeneticTreeBuilder = dynamic(() => import('@/components/cs/phylogeny/phylogeny'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Phylogenetic Tree Builder...</SimulationLoader>
});

const ShortestPathAlgorithmDemo = dynamic(() => import('@/components/cs/shortestPath/shortestPath'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Shortest Path Algorithm Builder...</SimulationLoader>
});

const MedicalModelsDemo = dynamic(() => import('@/components/cs/medicalModels/medicalModels'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Medical Models Simulation...</SimulationLoader>

});

// Types
type SimulationType = 'ants' | 'life' | 'maze' | 'disease' | 'bacteria-phage' | 'predprey' | 'medical-models' | 'nbody' | 'three-body' | 'phylogeny' | 'amdahl' | 'permutations-visual' | 'wireless' | 'FourierTransform-NeuralNetwork' | 'FourierTransformNetworkErrorCorrection' | 'Shortest-Path-Networks';
type TabType = 'simulations' | 'algorithms';

interface SimulationItem {
  key: SimulationType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  comingSoon?: boolean;
  category: TabType;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInFromRight = keyframes`
  from { transform: translate(100%, -50%); opacity: 0; }
  to { transform: translate(0, -50%); opacity: 1; }
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
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  padding: 5px;
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08);
  transition: all 0.3s ease;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? 'linear-gradient(135deg, #ffffff, #f8fafc)' : 'transparent'};
  color: ${({ $active }) => ($active ? '#1e293b' : '#64748b')};
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 3px 10px rgba(59, 130, 246, 0.12);
      transform: translateY(-1px);
    `}

  &:hover {
    background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #ffffff, #f1f5f9)'
      : 'rgba(59, 130, 246, 0.06)'};
    color: ${({ $active }) => ($active ? '#1e293b' : '#3b82f6')};
    transform: translateY(-1px);
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

const ItemCard = styled.div<{
  $active?: boolean;
  $color?: string;
  $comingSoon?: boolean;
}>`
  position: relative;
  padding: 1.5rem;
  padding-left: 1.75rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
  border-radius: 16px;
  border: 1px solid ${({ $active, $color }) =>
    $active ? ($color || '#3b82f6') : 'rgba(148,163,184,0.18)'};
  cursor: ${({ $comingSoon }) => ($comingSoon ? 'default' : 'pointer')};
  opacity: ${({ $comingSoon }) => ($comingSoon ? 0.6 : 1)};
  box-shadow: ${({ $active, $color }) =>
    $active 
      ? `0 8px 32px ${$color || '#3b82f6'}25, 0 0 0 1px ${$color || '#3b82f6'}20`
      : '0 4px 16px rgba(15,23,42,0.05)'};
  backdrop-filter: blur(8px);
  transform: translateY(0);
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;

  /* Left accent bar for selected state */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $active, $color }) => $active ? ($color || '#3b82f6') : 'transparent'};
    border-radius: 16px 0 0 16px;
    transition: background 0.25s ease;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  ${({ $active, $color }) =>
    $active &&
    css`
      transform: translateY(-2px);
      background: linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.98));
    `}

  &:hover {
    transform: ${({ $comingSoon }) => ($comingSoon ? 'none' : 'translateY(-4px)')};
    box-shadow: ${({ $comingSoon, $color }) =>
      $comingSoon 
        ? '0 4px 16px rgba(15,23,42,0.05)' 
        : `0 12px 40px ${$color || '#3b82f6'}18`};
    border-color: ${({ $comingSoon, $color }) => ($comingSoon ? 'rgba(148,163,184,0.18)' : ($color || '#3b82f6'))};
    
    &::before {
      background: ${({ $comingSoon, $color }) => $comingSoon ? 'transparent' : ($color || '#3b82f6')};
    }
  }
`;

const SelectionIndicator = styled.div<{ $color: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: white;
  box-shadow: 0 2px 8px ${({ $color }) => $color}40;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ComingSoonBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.02em;
`;

const ItemTitle = styled.h3<{ $comingSoon?: boolean }>`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ $comingSoon }) => ($comingSoon ? '#94a3b8' : '#1e293b')};
  line-height: 1.3;
  margin-bottom: 0.375rem;
  font-family: 'Inter', system-ui, sans-serif;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const ItemIcon = styled.div<{ $color: string; $comingSoon?: boolean; $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $color, $comingSoon, $active }) =>
    $comingSoon ? '#f1f5f9' : $active ? `${$color}20` : `${$color}12`};
  color: ${({ $color, $comingSoon }) => $comingSoon ? '#94a3b8' : $color};
  flex-shrink: 0;
  transition: all 0.25s ease;
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-right: 2rem;
`;


const ItemDescription = styled.p`
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  font-size: 0.825rem;
  line-height: 1.5;
  color: #64748b;
`;

const FadingElements = styled.div<{ $theater: boolean }>`
  opacity: ${({ $theater }) => $theater ? '0' : '1'};
  visibility: ${({ $theater }) => $theater ? 'hidden' : 'visible'};
  pointer-events: ${({ $theater }) => $theater ? 'none' : 'auto'};
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1), visibility 0.35s;
`;

/* ControlsContainer — chip layout with subtle dividers; children keep their own padding */
const ControlsContainer = styled.div`
  display: flex;
  gap: 0;
  margin: 1.5rem 0 2rem 0;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 0;

  /* each direct child gets horizontal spacing; don't force padding so buttons can manage it */
  > * {
    margin: 0 0.5rem;
    box-sizing: border-box;
    background: transparent;
    border: none;
  }

  /* thin vertical separators between chips (except wrap/new-line) */
  > * + * {
    position: relative;
  }
  > * + *::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 40%;
    background: rgba(148, 163, 184, 0.06);
    pointer-events: none;
  }

  @media (max-width: 520px) {
    > * {
      margin: 0 0.35rem;
    }
    > * + *::before {
      height: 30%;
      left: -0.35rem;
    }
  }
`;

/* ControlButton — retain your colors/variants but add touch-target, focus, and reduced-motion handling */
const ControlButton = styled.button<{
  $variant?: string;
  $active?: boolean;
  $theater?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* keep original padding, but ensure minimum touch target */
  padding: 0.75rem 1.25rem;
  min-height: 40px;
  min-width: 44px;
  border-radius: 8px;

  border: 1px solid
    ${({ $variant, $active, $theater }) => {
    if ($theater) return $active ? 'rgba(59, 130, 246, 0.5)' : 'rgba(148, 163, 184, 0.3)';
    if ($variant === 'danger') return '#f87171';
    if ($active) return '#3b82f6';
    return '#e2e8f0';
  }};
  background: ${({ $variant, $active, $theater }) => {
    if ($theater) return $active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(51, 65, 85, 0.8)';
    if ($variant === 'danger') return '#fef2f2';
    if ($active) return '#eff6ff';
    return 'white';
  }};
  color: ${({ $variant, $active, $theater }) => {
    if ($theater) return '#e2e8f0';
    if ($variant === 'danger') return '#dc2626';
    if ($active) return '#2563eb';
    return '#475569';
  }};

  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: box-shadow 180ms ease, transform 120ms ease, background 120ms ease;
  width: ${({ $theater }) => ($theater ? '100%' : 'auto')};
  justify-content: ${({ $theater }) => ($theater ? 'center' : 'flex-start')};

  /* keep spacing inside the container but avoid double-padding from parent > * */
  margin: 0; /* parent controls horizontal spacing */

  &:hover {
    background: ${({ $variant, $active, $theater }) => {
    if ($theater) return $active ? 'rgba(59, 130, 246, 0.35)' : 'rgba(71, 85, 105, 0.9)';
    if ($variant === 'danger') return '#fee2e2';
    if ($active) return '#dbeafe';
    return '#f8fafc';
  }};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px
      ${({ $variant, $theater }) => ($theater ? 'rgba(59, 130, 246, 0.3)' : ($variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.12)'))};
    border-color: ${({ $theater }) => ($theater ? 'rgba(59, 130, 246, 0.5)' : '')};
  }

  /* keyboard focus (accessible) */
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  }

  /* disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* avoid hover/transform on touch-only devices */
  @media (hover: none) {
    &:hover { transform: none; box-shadow: none; }
  }

  /* respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; box-shadow: none; }
  }
`;


const SpeedControl = styled.div<{ $theater?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(148, 163, 184, 0.3)' : '#e2e8f0'};
  background: ${({ $theater }) => $theater ? 'rgba(51, 65, 85, 0.8)' : 'white'};
  flex-direction: ${({ $theater }) => $theater ? 'column' : 'row'};
  width: ${({ $theater }) => $theater ? '100%' : 'auto'};
  
  span {
    font-family: 'Inter', system-ui, sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#475569'};
    text-align: center;
  }
  
  input[type="range"] {
    width: ${({ $theater }) => $theater ? '100%' : '120px'};
    height: 4px;
    background: ${({ $theater }) => $theater ? 'rgba(148, 163, 184, 0.3)' : '#e2e8f0'};
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
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  .value {
    color: ${({ $theater }) => $theater ? '#60a5fa' : '#3b82f6'};
    font-weight: 700;
    text-align: center;
  }
`;

const TheaterControls = styled(ControlsContainer) <{ $theater: boolean }>`
  ${({ $theater }) => $theater && css`
    position: fixed;
    top: 50%;
    right: 1rem;
    transform: translateY(-50%);
    z-index: 2100;
    background: rgba(15, 23, 42, 0.95);
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    backdrop-filter: blur(20px);
    margin-bottom: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    flex-direction: column;
    gap: 0.75rem;
    max-height: 90vh;
    overflow-y: auto;
    overflow-x: hidden;
    width: 200px;
    animation: ${slideInFromRight} 0.4s ease-out;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(51, 65, 85, 0.3);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.5);
      border-radius: 2px;
      
      &:hover {
        background: rgba(59, 130, 246, 0.7);
      }
    }
  `}
`;

const SimulationWindow = styled.div<{ $fullscreen?: boolean }>`
  background: ${({ $fullscreen }) => $fullscreen ? '#000000' : 'white'};
  border: ${({ $fullscreen }) => $fullscreen ? 'none' : '1px solid rgba(148, 163, 184, 0.2)'};
  border-radius: ${({ $fullscreen }) => $fullscreen ? '0' : '16px'};
  min-height: ${({ $fullscreen }) => $fullscreen ? '100vh' : 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: ${({ $fullscreen }) => $fullscreen ? 'fixed' : 'relative'};
  inset: ${({ $fullscreen }) => $fullscreen ? '0' : 'auto'};
  overflow: hidden;
  box-shadow: ${({ $fullscreen }) => $fullscreen ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)'};
  z-index: ${({ $fullscreen }) => $fullscreen ? '2000' : '1'};
  
  &:fullscreen {
    background: #000000;
    padding: 0;
  }
`;

const SimulationContent = styled.div<{ $theater?: boolean }>`
  width: 100%;
  height: 100%;
  min-height: ${({ $theater }) => $theater ? '100vh' : '550px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  position: relative;

  > * {
    width: 100%;
    height: 100%;
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
  position: ${({ $theater }) => $theater ? 'fixed' : 'absolute'};
  top: 1.5rem;
  right: ${({ $theater }) => $theater ? '14rem' : '1rem'};
  display: flex;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2100;
  opacity: ${({ $theater }) => $theater ? '1' : '0.55'};
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
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
  }
`;

const PerformancePanel = styled.div<{ $show: boolean; $theater?: boolean }>`
  position: ${({ $theater }) => $theater ? 'fixed' : 'absolute'};
  top: 1.5rem;
  left: 1.5rem;
  background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: opacity 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  z-index: 2100;
  
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

const InfoPanel = styled.div<{ $show: boolean; $theater?: boolean }>`
  position: ${({ $theater }) => $theater ? 'fixed' : 'absolute'};
  bottom: 1.5rem;
  left: ${({ $theater }) => $theater ? '1.5rem' : 'auto'};
  right: ${({ $theater }) => $theater ? 'auto' : '1rem'};
  max-width: 300px;
  background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.2)'};
  backdrop-filter: blur(10px);
  opacity: ${({ $show }) => $show ? '1' : '0'};
  pointer-events: ${({ $show }) => $show ? 'auto' : 'none'};
  transition: all 0.3s ease;
  z-index: 2100;
  
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

// Data - Simplified without misleading badges
const allItems: SimulationItem[] = [
  {
    key: 'life',
    label: "Conway's Game of Life",
    icon: <Activity size={22} />,
    color: '#10b981',
    description: 'GPU-accelerated cellular automaton with pattern analysis',
    category: 'simulations'
  },
  {
    key: 'ants',
    label: 'Travelling Salesman',
    icon: <Users size={22} />,
    color: '#3b82f6',
    description: 'Neural swarm intelligence with real user integration',
    category: 'algorithms'
  },
  {
    key: 'disease',
    label: 'Epidemiological Models',
    icon: <Target size={22} />,
    color: '#ef4444',
    description: 'Agent-based epidemic models with policy modules',
    category: 'simulations'
  },
  {
    key: 'bacteria-phage',
    label: 'Bacteria & Phages',
    icon: <Droplet size={22} />,
    color: '#059669',
    description: 'Bacterial colony interactions with bacteriophage',
    category: 'simulations'
  },
  {
    key: 'predprey',
    label: 'Predator–Prey Field',
    icon: <Zap size={22} />,
    color: '#10b981',
    description: 'Spatial Lotka–Volterra population dynamics',
    comingSoon: true,
    category: 'simulations'
  },
  {
    key: 'medical-models',
    label: 'Medical Models',
    icon: <Microscope size={22} />,
    color: '#a78bfa',
    description: 'Pharmacokinetic and physiological modeling',
    category: 'simulations'
  },
  {
    key: 'nbody',
    label: 'Space & Stars',
    icon: <Star size={22} />,
    color: '#f97316',
    description: 'N-body gravity sandbox with orbital mechanics',
    category: 'simulations'
  },
  {
    key: 'three-body',
    label: '3-Body Explorer',
    icon: <RotateCw size={22} />,
    color: '#ef4444',
    description: '3-body problem chaos visualization',
    comingSoon: true,
    category: 'simulations'
  },
  {
    key: 'maze',
    label: 'Pathfinding Derby',
    icon: <Grid size={22} />,
    color: '#8b5cf6',
    description: 'Algorithm comparison with live metrics',
    category: 'algorithms'
  },
  {
    key: 'phylogeny',
    label: 'Phylogenetic Trees',
    icon: <Cpu size={22} />,
    color: '#f59e0b',
    description: 'Evolutionary tree construction',
    category: 'simulations'
  },
  {
    key: 'amdahl',
    label: "Amdahl's Law",
    icon: <Sliders size={22} />,
    color: '#fb7185',
    description: 'Performance scaling visualizer',
    category: 'algorithms'
  },
  {
    key: 'permutations-visual',
    label: "Permutations",
    icon: <BookOpen size={22} />,
    color: '#7c3aed',
    description: 'Recursion visualizer',
    category: 'algorithms'
  },
  {
    key: 'wireless',
    label: 'Network Protocols',
    icon: <Wifi size={22} />,
    color: '#06b6d4',
    description: 'OFDM and routing protocols',
    category: 'algorithms'
  },
  {
    key: 'Shortest-Path-Networks',
    label: 'Shortest Path',
    icon: <Users size={22} />,
    color: '#0ea5e9',
    description: 'Shortest path algorithms comparison',
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
  const [showInfo, setShowInfo] = useState(false);
  const [fps, setFps] = useState(60);

  const fpsRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const simulationWindowRef = useRef<HTMLDivElement>(null);

  const simulationItems = allItems.filter(item => item.category === 'simulations');
  const algorithmItems = allItems.filter(item => item.category === 'algorithms');

  // FPS Tracking - Throttled updates
  useEffect(() => {
    if (!isRunning) return;

    let frameId: number;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 500; // Update FPS display every 500ms

    const updateFPS = (timestamp: number) => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const currentFps = Math.round(1000 / delta);
      fpsRef.current.push(currentFps);

      if (fpsRef.current.length > 60) {
        fpsRef.current.shift();
      }

      // Only update state periodically to avoid excessive re-renders
      if (timestamp - lastUpdate > UPDATE_INTERVAL) {
        const avgFps = Math.round(fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length);
        setFps(avgFps);
        lastUpdate = timestamp;
      }

      frameId = requestAnimationFrame(updateFPS);
    };

    frameId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning]);

  // Handle fullscreen on theater mode toggle
  useEffect(() => {
    const enterFullscreen = async () => {
      if (simulationWindowRef.current && !document.fullscreenElement) {
        try {
          await simulationWindowRef.current.requestFullscreen();
        } catch (err) {
          console.log('Fullscreen request failed:', err);
        }
      }
    };

    const exitFullscreen = async () => {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.log('Exit fullscreen failed:', err);
        }
      }
    };

    if (theaterMode) {
      enterFullscreen();
      document.body.style.overflow = 'hidden';
    } else {
      exitFullscreen();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [theaterMode]);

  // Sync with fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && theaterMode) {
        setTheaterMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [theaterMode]);

  // Trigger resize when theater mode changes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, [theaterMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setTheaterMode(prev => !prev);
      }
      if (e.key === 'Escape' && theaterMode) {
        setTheaterMode(false);
      }
      if (e.key === '?' && e.shiftKey) {
        setShowKeyboardHints(prev => !prev);
      }
      if (e.key === ' ' && theaterMode) {
        e.preventDefault();
        setIsRunning(prev => !prev);
      }
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowPerformance(prev => !prev);
      }
      if (e.key === 'i') {
        setShowInfo(prev => !prev);
      }
      if (e.key === '+' || e.key === '=') {
        setSpeed(prev => Math.min(3, +(prev + 0.1).toFixed(1)));
      }
      if (e.key === '-' || e.key === '_') {
        setSpeed(prev => Math.max(0.1, +(prev - 0.1).toFixed(1)));
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

  const activeItem = allItems.find(item => item.key === activeSimulation);

  const renderSimulation = () => {
    switch (activeSimulation) {
      case 'ants':
        return <TSPAlgorithmRace isRunning={isRunning} speed={speed} />;
      case 'maze':
        return <MazeSolverDemo />;
      case 'disease':
        return <DiseaseSimulation
          isRunning={isRunning}
          speed={speed}
          isDark={false}
          isTheaterMode={theaterMode}
        />;
      case 'life':
        return <LifeSimulation isDark={false} isRunning={isRunning} speed={speed} />;
      case 'medical-models':
        return <MedicalModelsDemo isDark={false} isRunning={isRunning} speed={speed} />;
      case 'bacteria-phage':
        return <AdvancedBacteremiaSimulator initialRunning={isRunning} initialSpeed={speed} isDark={false} />;
      case 'amdahl':
        return <AmdahlsLawSimulator isRunning={isRunning} speed={speed} isDark={false} />;
      case 'wireless':
        return <NetworkProtocolSimulation/>;
      case 'permutations-visual':
        return <PermutationSimulation isRunning={isRunning} speed={speed} isDark={false} />;
      case 'nbody':
        return <NBodySandbox isRunning={isRunning} speed={speed} isDark={false} />;
      case 'phylogeny':
        return <PhylogeneticTreeBuilder isRunning={isRunning} speed={speed} />;
      case 'Shortest-Path-Networks':
        return <ShortestPathAlgorithmDemo isRunning={isRunning} speed={speed} />;

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
            {(activeTab === 'simulations' ? simulationItems : algorithmItems).map(item => {
              const isActive = activeSimulation === item.key;
              return (
                <ItemCard
                  key={item.key}
                  onClick={() => handleItemClick(item)}
                  $active={isActive}
                  $color={item.color}
                  $comingSoon={item.comingSoon}
                >
                  {/* Selection checkmark indicator */}
                  {isActive && !item.comingSoon && (
                    <SelectionIndicator $color={item.color}>
                      <Check strokeWidth={3} />
                    </SelectionIndicator>
                  )}
                  
                  {/* Coming soon badge - the only badge we keep */}
                  {item.comingSoon && (
                    <ComingSoonBadge>Coming Soon</ComingSoonBadge>
                  )}

                  <ItemHeader>
                    <ItemIcon $color={item.color} $comingSoon={item.comingSoon} $active={isActive}>
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
              );
            })}
          </ItemsGrid>
        </FadingElements>

        {activeItem && !activeItem.comingSoon && !theaterMode && (
          <TheaterControls $theater={false}>
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
              onClick={() => setTheaterMode(true)}
              title="Fullscreen Focus Mode (F)"
            >
              <Maximize2 size={18} />
              Focus
            </ControlButton>

            <ControlButton
              onClick={() => setShowPerformance(!showPerformance)}
              $active={showPerformance}
            >
              <Gauge size={18} />
            </ControlButton>

            <ControlButton
              onClick={() => setShowInfo(!showInfo)}
              $active={showInfo}
            >
              <Info size={18} />
            </ControlButton>

            <ControlButton
              onClick={() => setSoundEnabled(!soundEnabled)}
              $active={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </ControlButton>

            <ControlButton onClick={() => setShowKeyboardHints(true)}>
              <HelpCircle size={18} />
            </ControlButton>
          </TheaterControls>
        )}

        <SimulationWindow ref={simulationWindowRef} $fullscreen={theaterMode}>
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
                <div className="status-item">
                  FPS: {fps}
                </div>
              </StatusBar>

              <PerformancePanel $show={showPerformance} $theater={theaterMode}>
                <div className="metric">
                  <span>FPS</span>
                  <span className="value">{fps}</span>
                </div>
                <div className="metric">
                  <span>Frame Time</span>
                  <span className="value">{(1000 / Math.max(1, fps)).toFixed(1)}ms</span>
                </div>
              </PerformancePanel>

              <InfoPanel $show={showInfo} $theater={theaterMode}>
                <h4>{activeItem.label}</h4>
                <p>{activeItem.description}</p>
              </InfoPanel>

              <SimulationContent $theater={theaterMode}>
                {renderSimulation()}
              </SimulationContent>

              {theaterMode && (
                <TheaterControls $theater>
                  <ControlButton
                    onClick={() => setIsRunning(!isRunning)}
                    $variant={isRunning ? 'danger' : 'primary'}
                    $theater
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isRunning ? 'Pause' : 'Run'}
                  </ControlButton>

                  <ControlButton onClick={handleReset} $theater>
                    <RotateCcw size={18} />
                    Reset
                  </ControlButton>

                  <SpeedControl $theater>
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
                    onClick={() => setTheaterMode(false)}
                    title="Exit Fullscreen (ESC)"
                    $theater
                  >
                    <Eye size={18} />
                    Exit
                  </ControlButton>

                  <ControlButton
                    onClick={() => setShowPerformance(!showPerformance)}
                    $active={showPerformance}
                    $theater
                  >
                    <Gauge size={18} />
                  </ControlButton>

                  <ControlButton
                    onClick={() => setShowInfo(!showInfo)}
                    $active={showInfo}
                    $theater
                  >
                    <Info size={18} />
                  </ControlButton>

                  <ControlButton
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    $active={soundEnabled}
                    $theater
                  >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </ControlButton>

                  <ControlButton
                    onClick={() => setShowKeyboardHints(true)}
                    $theater
                  >
                    <HelpCircle size={18} />
                  </ControlButton>
                </TheaterControls>
              )}
            </>
          )}
        </SimulationWindow>

        <KeyboardHintOverlay $show={showKeyboardHints}>
          <HintTitle>Keyboard Shortcuts</HintTitle>
          <HintGrid>
            <HintItem>
              <span>Fullscreen Focus</span>
              <span className="key">F</span>
            </HintItem>
            <HintItem>
              <span>Play / Pause</span>
              <span className="key">Space</span>
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
              <span>Exit Fullscreen</span>
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