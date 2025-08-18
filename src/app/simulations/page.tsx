// app/simulations/page.tsx - Fixed with no double scrollbar and professional styling
'use client';

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Play, Pause, RotateCcw, Activity, Target, Grid as GridIcon, Volume2, VolumeX, Zap, Users, Trophy, Shield } from 'lucide-react';
import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import AntsSimulation from '@/components/cs/ants/ants'; // Using user-integrated version
import { useDarkMode } from '@/providers/darkModeProvider';
import DiseaseSimulation from '@/components/cs/disease/disease';
import LifeSimulation from '@/components/cs/life/life'; // Using optimized version

// Import styled components from your design system
import {
  PageContainer as BasePageContainer,
  ContentWrapper as BaseContentWrapper,
  Heading1,
  BodyText,
  Card,
  FlexRow,
  ControlButton,
  fadeIn,
  glow
} from '@/styles/styled-components';

/* -------------------------
   Fixed Containers - No double scrollbar
   ------------------------- */
const PageContainer = styled(BasePageContainer)`
  /* Remove min-height to prevent double scrollbar */
  min-height: auto;
  height: auto;
  overflow: visible;
  padding-bottom: 0;
`;

const ContentWrapper = styled(BaseContentWrapper)`
  /* Ensure proper spacing without causing overflow */
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

/* -------------------------
   Professional Header Section
   ------------------------- */
const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
`;

const HeaderTitle = styled(FlexRow)`
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  position: relative;
`;

const HeaderIcon = styled.div<{ $isDark: boolean }>`
  --glow-color: ${({ $isDark }) => ($isDark ? '147, 51, 234' : '59, 130, 246')};
  color: ${({ $isDark }) => ($isDark ? '#9333ea' : '#3b82f6')};
  animation: ${glow} 3s ease-in-out infinite;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 20px rgba(var(--glow-color), 0.3));
`;

const TitleText = styled(Heading1)`
  margin: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const PerformanceBadge = styled.div<{ $isDark: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 1rem;
  }
`;

/* -------------------------
   Simulation Cards Grid
   ------------------------- */
const SimulationNav = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SimulationCard = styled(Card)<{ $active?: boolean; $isDark?: boolean }>`
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 140px;

  background: ${({ $active, $isDark }) =>
    $active
      ? `linear-gradient(135deg, 
          ${$isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}, 
          ${$isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'})`
      : $isDark
      ? 'rgba(30, 41, 59, 0.5)'
      : 'rgba(255, 255, 255, 0.8)'};

  color: ${({ $isDark }) => ($isDark ? '#e2e8f0' : '#1e293b')};
  border: 2px solid ${({ $active, $isDark }) => 
    $active 
      ? ($isDark ? '#3b82f6' : '#3b82f6') 
      : ($isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)')};
  
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $isDark }) => 
      $isDark 
        ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(59, 130, 246, 0.1)' 
        : '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 60px rgba(59, 130, 246, 0.05)'};
    
    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    &:hover { 
      transform: none; 
    }
  }
`;

const OptimizedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 999px;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SimulationCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SimulationCardIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ $color }) => `linear-gradient(135deg, ${$color}20, ${$color}10)`};
  color: ${({ $color }) => $color};
`;

const SimulationCardTitle = styled.h3`
  font-weight: 700;
  margin: 0;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
`;

const SimulationCardDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.8;
`;

/* -------------------------
   Controls Section
   ------------------------- */
const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  flex-wrap: wrap;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.2);

  input[type="range"] { 
    width: 120px;
    accent-color: #8b5cf6;
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }
  
  .value { 
    min-width: 40px; 
    text-align: center; 
    font-weight: 700;
    color: #8b5cf6;
  }
`;

/* -------------------------
   Main Simulation Container
   ------------------------- */
const SimulationContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
  background: var(--glass-background);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
`;

const StatusBar = styled.div<{ $isDark: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: ${({ $isDark }) => 
    $isDark 
      ? 'linear-gradient(90deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8))'
      : 'linear-gradient(90deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))'};
  border-bottom: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)'};
  backdrop-filter: blur(10px);
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  .label {
    opacity: 0.7;
    font-weight: 500;
  }
  
  .value {
    font-weight: 700;
    font-family: monospace;
  }
`;

const MazeContainer = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => 
    $isDark 
      ? 'linear-gradient(135deg, rgba(30, 20, 40, 0.95), rgba(60, 40, 80, 0.95))' 
      : 'linear-gradient(135deg, rgba(245, 243, 255, 0.95), rgba(237, 233, 254, 0.95))'};
  border-radius: 16px;
  border: 2px solid ${({ $isDark }) => 
    $isDark ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)'};
  overflow: hidden;
  padding: 1rem;
`;

/* -------------------------
   Types and Data
   ------------------------- */
type SimulationType = 'maze' | 'ants' | 'disease' | 'life';

const simulations = [
  {
    key: 'ants' as const,
    label: 'Community Colony',
    icon: <Users size={20} />,
    color: '#3b82f6',
    description: 'Your portfolio competes as user ants with real-time rankings',
    optimized: true,
    special: true
  },
  {
    key: 'life' as const,
    label: 'Cellular Automata',
    icon: <Activity size={20} />,
    color: '#10b981',
    description: 'Conway\'s Game of Life with GPU-accelerated rendering',
    optimized: true
  },
  {
    key: 'maze' as const,
    label: 'Maze Solver',
    icon: <GridIcon size={20} />,
    color: '#8b5cf6',
    description: 'Advanced pathfinding algorithms visualization',
    optimized: false
  },
  {
    key: 'disease' as const,
    label: 'Disease Model',
    icon: <Activity size={20} />,
    color: '#ef4444',
    description: 'Agent-based epidemic simulation with interventions',
    optimized: false
  }
];

/* -------------------------
   Main Component
   ------------------------- */
export default function SimulationsPage() {
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('ants');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const { isDarkMode } = useDarkMode();

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
      setSpeed(1);
    }, 100);
  }, []);

  const renderSimulation = () => {
    switch (activeSimulation) {
      case 'ants':
        return (
          <AntsSimulation 
            isRunning={isRunning} 
            speed={speed} 
            isDark={isDarkMode} 
          />
        );
        
      case 'maze':
        return (
          <MazeContainer $isDark={isDarkMode}>
            <MazeSolverDemo />
          </MazeContainer>
        );
        
      case 'disease':
        return (
          <DiseaseSimulation 
            isRunning={isRunning} 
            speed={speed} 
            isDark={isDarkMode} 
          />
        );
        
      case 'life':
        return (
          <LifeSimulation 
            isDark={isDarkMode}
            isRunning={isRunning}
            speed={speed}
          />
        );
        
      default:
        return null;
    }
  };

  const activeSimInfo = simulations.find(s => s.key === activeSimulation);
  const isOptimized = activeSimInfo?.optimized || false;

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader>
          <HeaderTitle>
            <HeaderIcon $isDark={isDarkMode}>
              <Activity size={40} />
            </HeaderIcon>
            <TitleText>Interactive Simulations</TitleText>
            {isOptimized && (
              <PerformanceBadge $isDark={isDarkMode}>
                <Zap size={14} />
                60 FPS Optimized
              </PerformanceBadge>
            )}
          </HeaderTitle>

          <BodyText 
            $size="lg" 
            style={{ 
              fontWeight: 400, 
              margin: '0 auto', 
              maxWidth: 600, 
              opacity: 0.8,
              lineHeight: 1.6
            }}
          >
            High-performance visualizations powered by WebGL and optimized algorithms
          </BodyText>
        </PageHeader>

        <SimulationNav>
          {simulations.map(sim => (
            <SimulationCard
              key={sim.key}
              onClick={() => setActiveSimulation(sim.key)}
              $active={activeSimulation === sim.key}
              $isDark={isDarkMode}
              role="button"
              tabIndex={0}
              aria-pressed={activeSimulation === sim.key}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { 
                  e.preventDefault(); 
                  setActiveSimulation(sim.key); 
                }
              }}
            >
              {sim.optimized && (
                <OptimizedBadge>
                  <Zap size={10} />
                  OPTIMIZED
                </OptimizedBadge>
              )}
              
              {sim.special && (
                <OptimizedBadge style={{ 
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  right: sim.optimized ? '6rem' : '1rem'
                }}>
                  <Users size={10} />
                  SOCIAL
                </OptimizedBadge>
              )}
              
              <SimulationCardHeader>
                <SimulationCardIcon $color={sim.color}>
                  {sim.icon}
                </SimulationCardIcon>
                <SimulationCardTitle>{sim.label}</SimulationCardTitle>
              </SimulationCardHeader>

              <SimulationCardDescription>{sim.description}</SimulationCardDescription>
            </SimulationCard>
          ))}
        </SimulationNav>

        <ControlsContainer>
          <ControlButton 
            onClick={() => setIsRunning(!isRunning)} 
            $variant={isRunning ? 'danger' : 'primary'}
            style={{
              background: isRunning 
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: 'white',
              fontWeight: 600
            }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />} 
            {isRunning ? 'Pause' : 'Play'}
          </ControlButton>

          <ControlButton 
            onClick={handleReset} 
            $variant="secondary"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, #374151, #1f2937)'
                : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
              border: 'none',
              fontWeight: 600
            }}
          >
            <RotateCcw size={16} /> 
            Reset
          </ControlButton>

          <SpeedControl>
            <span className="label">Speed</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              aria-label="Simulation speed"
            />
            <div className="value">{speed.toFixed(1)}x</div>
          </SpeedControl>

          <ControlButton 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            $variant="secondary" 
            aria-label="Toggle sound"
            style={{
              background: soundEnabled
                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                : isDarkMode 
                  ? 'linear-gradient(135deg, #374151, #1f2937)'
                  : 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
              border: 'none',
              color: soundEnabled ? 'white' : 'inherit',
              fontWeight: 600
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} 
            Sound
          </ControlButton>
        </ControlsContainer>

        <SimulationContainer>
          {activeSimInfo && (
            <StatusBar $isDark={isDarkMode}>
              <StatusItem>
                <span className="label">Active:</span>
                <span className="value" style={{ color: activeSimInfo.color }}>
                  {activeSimInfo.label}
                </span>
              </StatusItem>
              
              <StatusItem>
                <span className="label">Status:</span>
                <span className="value" style={{ color: isRunning ? '#10b981' : '#f59e0b' }}>
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </StatusItem>
              
              <StatusItem>
                <span className="label">Speed:</span>
                <span className="value">{speed.toFixed(1)}x</span>
              </StatusItem>
              
              {isOptimized && (
                <StatusItem style={{ color: '#10b981' }}>
                  <Shield size={14} />
                  <span className="value">Hardware Accelerated</span>
                </StatusItem>
              )}
            </StatusBar>
          )}
          
          {renderSimulation()}
        </SimulationContainer>
      </ContentWrapper>
    </PageContainer>
  );
}