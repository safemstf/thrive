// src/app/services/page.tsx - Enhanced Professional Simulation Platform
'use client';
// cladogram simulation with longest subsequences and phylogenetic trees
import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';
import {
  Play, Pause, RotateCcw, Activity, Target, Grid, Volume2, VolumeX,
  Zap, Users, Star, RotateCw, Microscope, Droplet, Wifi, BookOpen,
  Sliders, Cpu, Eye, EyeOff, Camera, Info, Gauge, HelpCircle, Maximize2, Check, Shield,
  Lock, Fingerprint, FileSearch, Code2, Sheet, X, Briefcase, Home, Globe,
  ChevronDown
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
  loading: () => <SimulationLoader>Loading Bacterial Evolution...</SimulationLoader>
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

const AgarioDemo = dynamic(() => import('@/components/cs/agario/agario'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Ecosystem Simulation...</SimulationLoader>
});

const TDVisualization = dynamic(() => import('@/components/cs/td/td'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading TD Visualization...</SimulationLoader>
});

const VirusCheckerDemo = dynamic(() => import('@/components/cs/virusChecker/virusChecker'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Virus Checker...</SimulationLoader>
});

const InvoiceDigitalizerDemo = dynamic(() => import('@/components/cs/invoiceDigitalizer/invoiceDigitalizer'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Invoice Digitalizer...</SimulationLoader>
});

const PasswordStrengthDemo = dynamic(() => import('@/components/cs/passwordChecker/passwordChecker'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Password Strength Checker...</SimulationLoader>
});

const HashGeneratorDemo = dynamic(() => import('@/components/cs/hashGenerator/hashGenerator'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Hash & Verify...</SimulationLoader>
});

const SQLBreachDemo = dynamic(() => import('@/components/cs/sqlBreach/sqlBreach'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading SQL Breach Simulation...</SimulationLoader>
});

const VirtualRecruiterDemo = dynamic(() => import('@/components/cs/virtualRecruiter/virtualRecruiter'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Virtual Recruiter...</SimulationLoader>
});

const InterviewPrepDemo = dynamic(() => import('@/components/cs/interviewPrep/interviewPrep'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Interview Prep...</SimulationLoader>
});

const HomeRankDemo = dynamic(() => import('@/app/homerank/page'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Home Rank...</SimulationLoader>
});

const TalkOhTacoDemo = dynamic(() => import('@/app/talkohtaco/page'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Talk Oh—Taco...</SimulationLoader>
});

const ContractScraperDemo = dynamic(() => import('@/components/cs/webscraper/webscrapper'), {
  ssr: false,
  loading: () => <SimulationLoader>Loading Contract Intelligence...</SimulationLoader>
});


// Types
type SimulationType = 'ants' | 'life' | 'maze' | 'disease' | 'bacteria-phage' | 'predprey' | 'medical-models' | 'nbody' | 'TD' | 'phylogeny' | 'amdahl' | 'permutations-visual' | 'wireless' | 'FourierTransform-NeuralNetwork' | 'FourierTransformNetworkErrorCorrection' | 'Shortest-Path-Networks' | 'virus-checker' | 'password-checker' | 'hash-generator' | 'metadata-viewer' | 'encoder-decoder' | 'invoice-digitalizer' | 'sql-breach' | 'virtual-recruiter' | 'interview-prep' | 'homerank' | 'talkohtaco' | 'contract-scraper';
type TabType = 'simulations' | 'algorithms' | 'tools';

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

/* Stealth mode: hide site header, footer, and scrollbar chrome */
const StealthGlobalStyle = createGlobalStyle`
  html.stealth-mode {
    /* Hide the site-wide header and footer rendered by ConditionalLayout */
    & header,
    & footer {
      display: none !important;
    }
    /* Remove any top margin/padding the header was reserving */
    & body {
      padding-top: 0 !important;
    }
  }
`;

// Loading Component
const SimulationLoader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: #7a6e5f;
  font-family: 'DM Sans', system-ui, sans-serif;

  &::before {
    content: '';
    width: 32px;
    height: 32px;
    border: 2px solid #e8e0d0;
    border-top: 2px solid #2563eb;
    border-radius: 50%;
    margin-bottom: 1rem;
    animation: ${spin} 1s linear infinite;
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #faf7f2;
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
  color: #1a1208;
  margin-bottom: 1rem;
  font-family: 'DM Serif Display', Georgia, serif;
  letter-spacing: -0.025em;

  @media (max-width: 768px) {
    font-size: 2.25rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #7a6e5f;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: 'DM Sans', system-ui, sans-serif;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
`;

const TabWrapper = styled.div`
  display: flex;
  background: rgba(250, 247, 242, 0.95);
  border: 1px solid rgba(26, 18, 8, 0.1);
  border-radius: 14px;
  padding: 5px;
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 24px rgba(26, 18, 8, 0.06);
  transition: all 0.3s ease;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 10px;
  background: #f5f0e8;
  color: ${({ $active }) => ($active ? '#1a1208' : '#7a6e5f')};
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 3px 10px rgba(26, 18, 8, 0.08);
      transform: translateY(-1px);
    `}

  &:hover {
    background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #ffffff, #ede8df)'
      : 'rgba(37, 99, 235, 0.06)'};
    color: ${({ $active }) => ($active ? '#1a1208' : '#2563eb')};
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
  background: #f5f0e8;
  border-radius: 16px;
  border: 1px solid ${({ $active, $color }) =>
    $active ? ($color || '#2563eb') : 'rgba(26,18,8,0.1)'};
  cursor: ${({ $comingSoon }) => ($comingSoon ? 'default' : 'pointer')};
  opacity: ${({ $comingSoon }) => ($comingSoon ? 0.6 : 1)};
  box-shadow: ${({ $active, $color }) =>
    $active
      ? `0 8px 32px ${$color || '#2563eb'}25, 0 0 0 1px ${$color || '#2563eb'}20`
      : '0 4px 16px rgba(26,18,8,0.04)'};
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
    background: ${({ $active, $color }) => $active ? ($color || '#2563eb') : 'transparent'};
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
      background: linear-gradient(180deg, rgba(255,255,255,1), rgba(245,240,232,0.98));
    `}

  &:hover {
    transform: ${({ $comingSoon }) => ($comingSoon ? 'none' : 'translateY(-4px)')};
    box-shadow: ${({ $comingSoon, $color }) =>
    $comingSoon
      ? '0 4px 16px rgba(26,18,8,0.04)'
      : `0 12px 40px ${$color || '#2563eb'}18`};
    border-color: ${({ $comingSoon, $color }) => ($comingSoon ? 'rgba(26,18,8,0.1)' : ($color || '#2563eb'))};

    &::before {
      background: ${({ $comingSoon, $color }) => $comingSoon ? 'transparent' : ($color || '#2563eb')};
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
  background: #f0ebe1;
  color: #7a6e5f;
  border: 1px solid rgba(26, 18, 8, 0.12);
  font-family: 'DM Sans', system-ui, sans-serif;
  letter-spacing: 0.02em;
`;

const ItemTitle = styled.h3<{ $comingSoon?: boolean }>`
  font-weight: 700;
  font-size: 1.05rem;
  color: ${({ $comingSoon }) => ($comingSoon ? '#a09080' : '#1a1208')};
  line-height: 1.3;
  margin-bottom: 0.375rem;
  font-family: 'DM Sans', system-ui, sans-serif;
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
  font-family: 'DM Sans', system-ui, sans-serif;
  margin: 0;
  font-size: 0.825rem;
  line-height: 1.5;
  color: #7a6e5f;
`;

const FadingElements = styled.div<{ $theater: boolean; $stealth?: boolean }>`
  opacity: ${({ $theater }) => $theater ? '0' : '1'};
  visibility: ${({ $theater }) => $theater ? 'hidden' : 'visible'};
  pointer-events: ${({ $theater }) => $theater ? 'none' : 'auto'};
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1), visibility 0.35s, max-height 0.4s ease;

  ${({ $stealth }) => $stealth && css`
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    margin: 0;
  `}
`;

/* Stealth mode: compact strip showing active item + quick-switch dropdown */
const StealthBar = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => $visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background: rgba(26, 18, 8, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(26, 18, 8, 0.06);
  position: relative;
`;

const StealthLabel = styled.div`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #1a1208;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const StealthSelect = styled.select`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: #1a1208;
  background: rgba(26, 18, 8, 0.05);
  border: 1px solid rgba(26, 18, 8, 0.1);
  border-radius: 6px;
  padding: 0.25rem 1.5rem 0.25rem 0.5rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231a1208' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

const StealthToggle = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: ${({ $active }) => $active ? 'rgba(37, 99, 235, 0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#2563eb' : '#7a6e5f'};
  border: none;
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    color: #2563eb;
  }
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
    if ($active) return '#2563eb';
    return 'rgba(26, 18, 8, 0.12)';
  }};
  background: ${({ $variant, $active, $theater }) => {
    if ($theater) return $active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(51, 65, 85, 0.8)';
    if ($variant === 'danger') return '#fef2f2';
    if ($active) return '#eff6ff';
    return '#faf7f2';
  }};
  color: ${({ $variant, $active, $theater }) => {
    if ($theater) return '#e2e8f0';
    if ($variant === 'danger') return '#dc2626';
    if ($active) return '#2563eb';
    return '#3d3120';
  }};

  font-family: 'DM Sans', system-ui, sans-serif;
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
    return '#f0ebe1';
  }};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px
      ${({ $variant, $theater }) => ($theater ? 'rgba(59, 130, 246, 0.3)' : ($variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.12)'))};
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
  border: 1px solid ${({ $theater }) => $theater ? 'rgba(148, 163, 184, 0.3)' : 'rgba(26, 18, 8, 0.12)'};
  background: ${({ $theater }) => $theater ? 'rgba(51, 65, 85, 0.8)' : '#faf7f2'};
  flex-direction: ${({ $theater }) => $theater ? 'column' : 'row'};
  width: ${({ $theater }) => $theater ? '100%' : 'auto'};

  span {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#3d3120'};
    text-align: center;
  }

  input[type="range"] {
    width: ${({ $theater }) => $theater ? '100%' : '120px'};
    height: 4px;
    background: ${({ $theater }) => $theater ? 'rgba(148, 163, 184, 0.3)' : '#e8e0d0'};
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
    color: ${({ $theater }) => $theater ? '#60a5fa' : '#2563eb'};
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

/** Auto-hiding bottom pill bar shown in theater/fullscreen mode */
const TheaterBar = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2100;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(20px);
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.28);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.35s ease;
  white-space: nowrap;
`;

const TheaterBarBtn = styled.button<{ $active?: boolean; $danger?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ $active, $danger }) =>
    $danger ? 'rgba(239,68,68,0.45)' : $active ? 'rgba(59,130,246,0.55)' : 'rgba(148,163,184,0.22)'};
  background: ${({ $active, $danger }) =>
    $danger ? 'rgba(239,68,68,0.18)' : $active ? 'rgba(59,130,246,0.22)' : 'rgba(51,65,85,0.65)'};
  color: ${({ $danger, $active }) => $danger ? '#f87171' : $active ? '#93c5fd' : '#cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 120ms ease, transform 120ms ease, border-color 120ms ease;
  &:hover {
    background: ${({ $active, $danger }) =>
      $danger ? 'rgba(239,68,68,0.32)' : $active ? 'rgba(59,130,246,0.36)' : 'rgba(71,85,105,0.88)'};
    transform: scale(1.1);
  }
`;

const TheaterBarDivider = styled.div`
  width: 1px;
  height: 22px;
  background: rgba(148, 163, 184, 0.18);
  flex-shrink: 0;
  margin: 0 0.125rem;
`;

const TheaterSpeedWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;

  input[type='range'] {
    width: 72px;
    height: 3px;
    accent-color: #3b82f6;
    cursor: pointer;
  }

  span {
    font-family: 'DM Mono', 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    color: #60a5fa;
    min-width: 30px;
    text-align: right;
  }
`;

const SimulationWindow = styled.div<{ $fullscreen?: boolean; $isTool?: boolean; $cursorHidden?: boolean }>`
  background: ${({ $fullscreen, $isTool }) => $fullscreen ? '#000000' : $isTool ? 'transparent' : 'white'};
  border: ${({ $fullscreen, $isTool }) => $fullscreen || $isTool ? 'none' : '1px solid rgba(148, 163, 184, 0.2)'};
  border-radius: ${({ $fullscreen }) => $fullscreen ? '0' : '16px'};
  min-height: ${({ $fullscreen }) => $fullscreen ? '100vh' : 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: ${({ $fullscreen }) => $fullscreen ? 'fixed' : 'relative'};
  inset: ${({ $fullscreen }) => $fullscreen ? '0' : 'auto'};
  overflow: hidden;
  box-shadow: ${({ $fullscreen, $isTool }) => $fullscreen || $isTool ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.05)'};
  z-index: ${({ $fullscreen }) => $fullscreen ? '2000' : '1'};
  cursor: ${({ $cursorHidden }) => $cursorHidden ? 'none' : 'auto'};

  &:fullscreen {
    background: #000000;
    padding: 0;
  }
`;

const SimulationContent = styled.div<{ $theater?: boolean; $isTool?: boolean }>`
  width: 100%;
  display: flex;
  align-items: ${({ $isTool }) => $isTool ? 'flex-start' : 'center'};
  justify-content: center;
  background: transparent;
  position: relative;

  > * {
    width: 100%;
    background: transparent;
  }
`;

const PlaceholderContent = styled.div`
  text-align: center;
  color: #7a6e5f;
  font-family: 'DM Sans', system-ui, sans-serif;

  h3 {
    color: #1a1208;
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
  /* Theater mode: fixed overlay top-right; normal mode: flow element below controls */
  position: ${({ $theater }) => $theater ? 'fixed' : 'relative'};
  top: ${({ $theater }) => $theater ? '1.5rem' : 'auto'};
  right: ${({ $theater }) => $theater ? '14rem' : 'auto'};
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: ${({ $theater }) => $theater ? '2100' : 'auto'};
  opacity: ${({ $theater }) => $theater ? '1' : '0.8'};
  margin: ${({ $theater }) => $theater ? '0' : '0.25rem 0 1.5rem'};

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: ${({ $theater }) => $theater ? 'rgba(15, 23, 42, 0.9)' : 'rgba(250, 247, 242, 0.95)'};
    border: 1px solid ${({ $theater }) => $theater ? 'rgba(59, 130, 246, 0.3)' : 'rgba(26, 18, 8, 0.1)'};
    border-radius: 8px;
    backdrop-filter: blur(10px);
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#3d3120'};
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
    color: ${({ $theater }) => $theater ? '#e2e8f0' : '#1a1208'};
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  
  p {
    color: ${({ $theater }) => $theater ? '#94a3b8' : '#7a6e5f'};
    font-size: 0.75rem;
    line-height: 1.5;
    margin: 0;
    font-family: 'DM Sans', system-ui, sans-serif;
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
  font-family: 'DM Sans', system-ui, sans-serif;
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
  font-family: 'DM Sans', system-ui, sans-serif;
  
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
    key: 'invoice-digitalizer',
    label: 'Invoice Digitalizer',
    icon: <Code2 size={22} />,
    color: '#10b981',
    description: 'Convert scanned invoices into structured data using OCR and AI parsing',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'virus-checker',
    label: 'Virus Checker',
    icon: <Shield size={22} />,
    color: '#3b82f6',
    description: 'Scan files for viruses and malware using signature-based detection and heuristic analysis',
    category: 'tools',
    comingSoon: false,

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
    label: 'Bacterial Evolution',
    icon: <Droplet size={22} />,
    color: '#059669',
    description: 'Watch antibiotic resistance evolve in real time via natural selection',
    category: 'simulations'
  },
  {
    key: 'predprey',
    label: 'Ecosystem',
    icon: <Zap size={22} />,
    color: '#10b981',
    description: 'Spatial Lotka–Volterra population dynamics',
    comingSoon: false,
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
    key: 'TD',
    label: 'Walking',
    icon: <RotateCw size={22} />,
    color: '#ef4444',
    description: '2D bipedal walker',
    comingSoon: false,
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
  },

  {
    key: 'password-checker',
    label: 'Password Strength',
    icon: <Lock size={22} />,
    color: '#f97316',
    description: 'Analyse password entropy, detect common patterns, and estimate crack time',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'hash-generator',
    label: 'Hash & Verify',
    icon: <Fingerprint size={22} />,
    color: '#8b5cf6',
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes and verify file integrity',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'metadata-viewer',
    label: 'File Metadata',
    icon: <FileSearch size={22} />,
    color: '#0ea5e9',
    description: 'Inspect EXIF, document properties, and embedded metadata without uploading',
    comingSoon: true,
    category: 'tools',
  },
  {
    key: 'encoder-decoder',
    label: 'Encode / Decode',
    icon: <Sheet size={22} />,
    color: '#10b981',
    description: 'Convert invoices into structured data using OCR and AI parsing',
    comingSoon: true,
    category: 'tools',
  },
  {
    key: 'sql-breach',
    label: 'SQL Breach',
    icon: <Shield size={22} />,
    color: '#ef4444',
    description: 'Simulate and analyze SQL injection vulnerabilities',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'virtual-recruiter',
    label: 'Virtual Recruiter',
    icon: <Briefcase size={22} />,
    color: '#0369a1',
    description: 'Upload your resume — get an ATS score, keyword match against any JD, and instant job search links',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'interview-prep',
    label: 'Interview Prep',
    icon: <BookOpen size={22} />,
    color: '#7c3aed',
    description: 'Enter the company and role — get a customized prep kit: behavioral questions, system design, topics to study, and questions to ask',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'homerank',
    label: 'Home Rank',
    icon: <Home size={22} />,
    color: '#16a34a',
    description: 'Explore and rank properties with natural language search, interactive map, and smart filters',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'talkohtaco',
    label: 'Talk Oh—Taco',
    icon: <Globe size={22} />,
    color: '#f59e0b',
    description: 'Learn languages with AI-powered teachers — choose from Arabic, Spanish, French, Chinese, or Italian',
    comingSoon: false,
    category: 'tools',
  },
  {
    key: 'contract-scraper',
    label: 'Contract Intelligence',
    icon: <FileSearch size={22} />,
    color: '#0369a1',
    description: 'Search live SAM.gov contract opportunities — filter by NAICS, state, type, and date range. Import DataBank CSVs for deeper analysis.',
    comingSoon: false,
    category: 'tools',
  },

];

// Main Component
export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tools');
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('invoice-digitalizer');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fps, setFps] = useState(60);
  const [showTheaterBar, setShowTheaterBar] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);

  const fpsRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const simulationWindowRef = useRef<HTMLDivElement>(null);
  const theaterHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const simulationItems = allItems.filter(item => item.category === 'simulations');
  const algorithmItems = allItems.filter(item => item.category === 'algorithms');
  const toolItems = allItems.filter(item => item.category === 'tools');

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

  // Auto-hide theater bar after 3s of inactivity
  useEffect(() => {
    if (!theaterMode) {
      if (theaterHideTimerRef.current) clearTimeout(theaterHideTimerRef.current);
      setShowTheaterBar(true);
      return;
    }

    const showBar = () => {
      setShowTheaterBar(true);
      if (theaterHideTimerRef.current) clearTimeout(theaterHideTimerRef.current);
      theaterHideTimerRef.current = setTimeout(() => setShowTheaterBar(false), 3000);
    };

    showBar();
    window.addEventListener('mousemove', showBar);
    window.addEventListener('touchstart', showBar);
    return () => {
      window.removeEventListener('mousemove', showBar);
      window.removeEventListener('touchstart', showBar);
      if (theaterHideTimerRef.current) clearTimeout(theaterHideTimerRef.current);
    };
  }, [theaterMode]);

  // Stealth mode — hide site header and footer
  useEffect(() => {
    const html = document.documentElement;
    if (stealthMode) {
      html.classList.add('stealth-mode');
    } else {
      html.classList.remove('stealth-mode');
    }
    return () => html.classList.remove('stealth-mode');
  }, [stealthMode]);

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
  const isToolItem = activeItem?.category === 'tools';

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
        return <AdvancedBacteremiaSimulator initialRunning={isRunning} initialSpeed={speed} isDark={false} isTheaterMode={theaterMode} />;
      case 'amdahl':
        return <AmdahlsLawSimulator isRunning={isRunning} speed={speed} isDark={false} />;
      case 'wireless':
        return <NetworkProtocolSimulation />;
      case 'permutations-visual':
        return <PermutationSimulation isRunning={isRunning} speed={speed} isDark={false} />;
      case 'nbody':
        return <NBodySandbox isRunning={isRunning} speed={speed} isDark={false} />;
      case 'phylogeny':
        return <PhylogeneticTreeBuilder isRunning={isRunning} speed={speed} isTheaterMode={theaterMode} />;
      case 'Shortest-Path-Networks':
        return <ShortestPathAlgorithmDemo isRunning={isRunning} speed={speed} />;
      case 'predprey':
        return <AgarioDemo isRunning={isRunning} speed={speed} isTheaterMode={theaterMode} />;
      case 'TD':
        return <TDVisualization isRunning={isRunning} speed={speed} />;

      case 'invoice-digitalizer':
        return <InvoiceDigitalizerDemo />;
      case 'virus-checker':
        return <VirusCheckerDemo />;
      case 'password-checker':
        return <PasswordStrengthDemo />;
      case 'hash-generator':
        return <HashGeneratorDemo />;
      case 'sql-breach':
        return <SQLBreachDemo />;
      case 'virtual-recruiter':
        return <VirtualRecruiterDemo />;
      case 'interview-prep':
        return <InterviewPrepDemo />;
      case 'homerank':
        return <HomeRankDemo />;
      case 'talkohtaco':
        return <TalkOhTacoDemo />;
      case 'contract-scraper':
        return <ContractScraperDemo />;
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
      <MatrixRain />
      {stealthMode && <StealthGlobalStyle />}

      <ContentWrapper>
        {/* Stealth mode: compact item picker replaces full header/tabs/grid */}
        <StealthBar $visible={stealthMode}>
          <StealthLabel>
            <span style={{ color: activeItem?.color }}>{activeItem?.icon}</span>
            {activeItem?.label}
          </StealthLabel>
          <StealthSelect
            value={activeSimulation}
            onChange={(e) => {
              const item = allItems.find(i => i.key === e.target.value);
              if (item && !item.comingSoon) {
                setActiveSimulation(item.key as SimulationType);
                setActiveTab(item.category);
              }
            }}
          >
            <optgroup label="Tools">
              {allItems.filter(i => i.category === 'tools' && !i.comingSoon).map(i => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </optgroup>
            <optgroup label="Simulations">
              {allItems.filter(i => i.category === 'simulations' && !i.comingSoon).map(i => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </optgroup>
            <optgroup label="Algorithms">
              {allItems.filter(i => i.category === 'algorithms' && !i.comingSoon).map(i => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </optgroup>
          </StealthSelect>
          <StealthToggle $active={true} onClick={() => setStealthMode(false)} title="Exit stealth mode">
            <Eye size={14} />
          </StealthToggle>
        </StealthBar>

        <FadingElements $theater={theaterMode} $stealth={stealthMode}>
          <PageHeader>
            <PageTitle>Computation Tools & Models</PageTitle>
            <PageSubtitle>
              Professional-grade tools, algorithms and simulations for research, business and education
            </PageSubtitle>
          </PageHeader>

          <TabContainer>
            <TabWrapper>
              <TabButton
                $active={activeTab === 'tools'}
                onClick={() => setActiveTab('tools')}
              >
                <Shield size={18} />
                Tools
              </TabButton>
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
            {(activeTab === 'simulations' ? simulationItems : activeTab === 'algorithms' ? algorithmItems : toolItems).map(item => {
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

        {/* Stealth toggle for tool items (which don't have the TheaterControls bar) */}
        {isToolItem && !theaterMode && !stealthMode && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <StealthToggle onClick={() => setStealthMode(true)} title="Hide branding (stealth mode)">
              <EyeOff size={14} /> Stealth
            </StealthToggle>
          </div>
        )}

        {activeItem && !activeItem.comingSoon && !theaterMode && !isToolItem && (
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
                max={50}
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

            <ControlButton
              onClick={() => setStealthMode(!stealthMode)}
              $active={stealthMode}
              title={stealthMode ? 'Show branding' : 'Hide branding (stealth mode)'}
            >
              {stealthMode ? <Eye size={18} /> : <EyeOff size={18} />}
            </ControlButton>

            <ControlButton onClick={() => setShowKeyboardHints(true)}>
              <HelpCircle size={18} />
            </ControlButton>
          </TheaterControls>
        )}

        {!isToolItem && (
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
        )}

        <SimulationWindow ref={simulationWindowRef} $fullscreen={theaterMode} $isTool={isToolItem} $cursorHidden={theaterMode && !showTheaterBar}>
          {activeItem && (
            <>


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

              <SimulationContent $theater={theaterMode} $isTool={isToolItem}>
                {renderSimulation()}
              </SimulationContent>

              {theaterMode && !isToolItem && (
                <TheaterBar $visible={showTheaterBar}>
                  <TheaterBarBtn
                    $danger={isRunning}
                    onClick={() => setIsRunning(!isRunning)}
                    title={isRunning ? 'Pause' : 'Play'}
                  >
                    {isRunning ? <Pause size={15} /> : <Play size={15} />}
                  </TheaterBarBtn>

                  <TheaterBarBtn onClick={handleReset} title="Reset">
                    <RotateCcw size={15} />
                  </TheaterBarBtn>

                  <TheaterBarDivider />

                  <TheaterSpeedWrap>
                    <input
                      type="range"
                      min={0.1}
                      max={50}
                      step={0.1}
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    />
                    <span>{speed.toFixed(1)}x</span>
                  </TheaterSpeedWrap>

                  <TheaterBarDivider />

                  <TheaterBarBtn
                    $active={showPerformance}
                    onClick={() => setShowPerformance(!showPerformance)}
                    title="Performance"
                  >
                    <Gauge size={15} />
                  </TheaterBarBtn>

                  <TheaterBarBtn
                    $active={showInfo}
                    onClick={() => setShowInfo(!showInfo)}
                    title="Info"
                  >
                    <Info size={15} />
                  </TheaterBarBtn>

                  <TheaterBarBtn
                    $active={soundEnabled}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Mute' : 'Sound'}
                  >
                    {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </TheaterBarBtn>

                  <TheaterBarDivider />

                  <TheaterBarBtn
                    onClick={() => setTheaterMode(false)}
                    title="Exit Fullscreen (Esc)"
                  >
                    <X size={15} />
                  </TheaterBarBtn>
                </TheaterBar>
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