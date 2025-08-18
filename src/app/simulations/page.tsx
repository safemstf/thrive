// app/simulations/page.tsx - Updated to work with optimized Life component
'use client';

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Play, Pause, RotateCcw, Activity, Target, Grid as GridIcon, Volume2, VolumeX } from 'lucide-react';
import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import AntsSimulation from '@/components/cs/ants/ants';
import { useDarkMode } from '@/providers/darkModeProvider';
import DiseaseSimulation from '@/components/cs/disease/disease';
import LifeSimulation from '@/components/cs/life/life';

// central hub styled exports
import {
  PageContainer,
  ContentWrapper,
  Heading1,
  BodyText,
  BaseButton,
  Card,
  CardContent,
  Grid,
  FlexRow,
  SimulationCanvas,
  ControlButton,
  fadeIn,
  pulse,
  glow
} from '@/styles/styled-components';

/* -------------------------
   Local simulation-specific styled bits (small & re-usable)
   ------------------------- */
const PageHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderTitle = styled(FlexRow)`
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
`;

const HeaderIcon = styled.div<{ $isDark: boolean }>`
  --glow-color: ${({ $isDark }) => ($isDark ? '147, 51, 234' : '59, 130, 246')};
  color: ${({ $isDark }) => ($isDark ? '#9333ea' : '#3b82f6')};
  animation: ${glow} 3s ease-in-out infinite;
  transition: all 0.3s ease;
`;

const SimulationNav = styled(Grid)`
  margin-bottom: var(--spacing-3xl);
  gap: var(--spacing-lg);
  grid-template-columns: repeat(2, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
`;

const SimulationCard = styled(Card)<{ $active?: boolean; $isDark?: boolean }>`
  cursor: pointer;
  text-align: left;
  position: relative;
  overflow: hidden;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  background: ${({ $active, $isDark }) =>
    $active
      ? $isDark
        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(124, 58, 237, 0.9))'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))'
      : $isDark
      ? 'rgba(30,41,59,0.78)'
      : 'rgba(255,255,255,0.9)'};

  color: ${({ $active, $isDark }) => ($active ? 'white' : $isDark ? '#e2e8f0' : '#334155')};
  border: 1px solid ${({ $active, $isDark }) => ($active ? ($isDark ? 'rgba(147,51,234,0.5)' : 'rgba(59,130,246,0.5)') : $isDark ? 'rgba(71,85,105,0.28)' : 'rgba(203,213,225,0.45)')};
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: ${({ $isDark }) => ($isDark ? '0 20px 40px rgba(0,0,0,0.32)' : '0 12px 30px rgba(0,0,0,0.08)')};
  }

  @media (max-width: 768px) {
    &:hover { transform: none; box-shadow: none; }
  }
`;

const SimulationCardHeader = styled(FlexRow)`
  gap: var(--spacing-md);
  align-items: center;
`;

const SimulationCardTitle = styled.h3`
  font-family: var(--font-body);
  font-weight: 700;
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.6px;
`;

const SimulationCardDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.9;
`;

/* Controls area */
const ControlsContainer = styled(FlexRow)`
  justify-content: center;
  margin-bottom: var(--spacing-3xl);
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  background: var(--glass-background);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SpeedControl = styled.div`
  display:flex;
  align-items:center;
  gap: 12px;

  input[type="range"] { width: 140px; }
  .value { min-width: 48px; text-align:center; font-weight:700; }
`;

/* Simulation container */
const SimulationContainer = styled(Card)`
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  background: var(--glass-background);
  display: flex;
  flex-direction: column;
  align-items: center;      /* center horizontally */
  justify-content: center;  /* center vertically if container has height */
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
  }
`;

/* -------------------------
   Types and simulation list
   ------------------------- */
type SimulationType = 'maze' | 'ants' | 'disease' | 'life';

const simulations = [
  {
    key: 'ants' as const,
    label: 'Ant Colonies',
    icon: <Target size={20} />,
    description: 'Competitive ant colonies — survival of the fittest (pheromones & path planning)'
  },
  {
    key: 'maze' as const,
    label: 'Maze Solver',
    icon: <GridIcon size={20} />,
    description: 'Advanced pathfinding algorithms visualization (A*, Dijkstra, BFS, DFS)'
  },
  {
    key: 'disease' as const,
    label: 'Disease Model',
    icon: <Activity size={20} />,
    description: 'Agent-based disease spread (SIR model with AI interventions)'
  },
  {
    key: 'life' as const,
    label: 'Cellular Automata',
    icon: <Activity size={20} />,
    description: 'High-performance Conway\'s Game of Life with variants'
  }
];

/* -------------------------
   Page component
   ------------------------- */
export default function SimulationsPage() {
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('ants');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const { isDarkMode } = useDarkMode();

  const handleReset = useCallback(() => {
    // resetting page-level UI; children may manage their own reset behaviors
    setIsRunning(true);
    setSpeed(1);
  }, []);

  const renderSimulation = () => {
    switch (activeSimulation) {
      case 'ants':
        return <AntsSimulation isRunning={isRunning} speed={speed} isDark={isDarkMode} />;
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
        // Pass the correct props that LifeSimulation expects
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

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader>
          <HeaderTitle>
            <HeaderIcon $isDark={isDarkMode}><Activity size={36} /></HeaderIcon>
            <Heading1 style={{ margin: 0 }}>Living Simulations</Heading1>
          </HeaderTitle>

          <BodyText $size="lg" style={{ fontWeight: 300, margin: '0 auto', maxWidth: 680, opacity: 0.9 }}>
            Immersive environments to observe and interact with complex systems — from cellular automata to ant colonies.
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
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveSimulation(sim.key); }
              }}
            >
              <SimulationCardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                    {sim.icon}
                  </div>
                  <SimulationCardTitle>{sim.label}</SimulationCardTitle>
                </div>
              </SimulationCardHeader>

              <SimulationCardDescription>{sim.description}</SimulationCardDescription>
            </SimulationCard>
          ))}
        </SimulationNav>

        <ControlsContainer>
          <ControlButton onClick={() => setIsRunning(prev => !prev)} $variant={isRunning ? 'danger' : 'primary'}>
            {isRunning ? <Pause size={16} /> : <Play size={16} />} {isRunning ? 'Pause' : 'Play'}
          </ControlButton>

          <ControlButton onClick={handleReset} $variant="secondary">
            <RotateCcw size={16} /> Reset
          </ControlButton>

          <SpeedControl>
            <span style={{ textTransform: 'uppercase', fontSize: 12, opacity: 0.85 }}>Speed</span>
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

          <ControlButton onClick={() => setSoundEnabled(s => !s)} $variant="secondary" aria-label="Toggle sound">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundEnabled ? 'Sound On' : 'Sound Off'}
          </ControlButton>
        </ControlsContainer>

        <SimulationContainer>
          {renderSimulation()}
        </SimulationContainer>
      </ContentWrapper>
    </PageContainer>
  );
}

/* -------------------------
   Minor Maze container left here for consistent styling
   ------------------------- */
const MazeContainer = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => ($isDark ? 'linear-gradient(135deg, rgba(30,20,40,0.95), rgba(60,40,80,0.95))' : 'linear-gradient(135deg, rgba(245,243,255,0.95), rgba(237,233,254,0.95))')};
  border-radius: var(--radius-lg);
  border: 2px solid ${({ $isDark }) => ($isDark ? 'rgba(147,51,234,0.3)' : 'rgba(147,51,234,0.2)')};
  overflow: hidden;
  padding: var(--spacing-md);
`;