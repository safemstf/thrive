'use client';

import React, { useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Play, Pause, RotateCcw, Activity, Target, Grid, Volume2, VolumeX,
  Bone, Zap, Users, Trophy, Shield, Crown, Cpu, Eye, Star, RotateCw, Microscope,
  Droplet, Wifi, BookOpen, Sliders, Monitor, Beaker
} from 'lucide-react';
import { MatrixRain } from './matrixStyling';

import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import TSPAlgorithmRace from '@/components/cs/ants/ants';
import DiseaseSimulation from '@/components/cs/disease/disease';
import LifeSimulation from '@/components/cs/life/life';
import AlgorithmVisualizer from '@/components/cs/algorithms/algorithms';
import BacteriaPhageSimulation from '@/components/bacteria/bacteria';

// Types
type SimulationType = 'ants' | 'life' | 'maze' | 'disease' | 'algorithms' | 'bacteria-phage' | 'predprey' | 'chem-resonance' | 'nbody' | 'three-body' | 'parallel-model' | 'amdahl' | 'masters-visual' | 'wireless';
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
const matrixGlow = keyframes`
  0% { box-shadow: 0 0 0px rgba(59, 130, 246, 0.1); transform: translateY(0); opacity: 0.95; }
  50% { box-shadow: 0 0 24px rgba(59, 130, 246, 0.3); transform: translateY(-2px); opacity: 1; }
  100% { box-shadow: 0 0 0px rgba(59, 130, 246, 0.1); transform: translateY(0); opacity: 0.95; }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const matrixTextFlow = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

// Main Container with darker background for matrix effect
const PageContainer = styled.div`
  min-height: 100vh;
  background: #000000;
  color: #e2e8f0;
  position: relative;
  overflow-x: hidden;
`;

// Matrix Rain Container - positioned behind content
const MatrixRainContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0.6;
  filter: blur(0.5px);
`;

// Overlay gradient to make content more readable
const ContentOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.85) 100%
  );
  z-index: 1;
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
  margin-bottom: 3rem;
  position: relative;
  z-index: 10;
`;

const PageTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00ff00, #3b82f6, #00ff00);
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  font-family: 'Courier New', monospace;
  letter-spacing: -1px;
  text-shadow: 0 0 40px rgba(0, 255, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #00ff00;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
  font-family: 'Courier New', monospace;
  opacity: 0.8;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
`;

// Tab Navigation
const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 10;
`;

const TabWrapper = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 16px;
  padding: 0.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.15);
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background: ${({ $active }) => $active 
    ? 'linear-gradient(135deg, #00ff00, #3b82f6)' 
    : 'transparent'
  };
  color: ${({ $active }) => $active ? 'black' : '#00ff00'};
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $active }) => $active && css`
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    animation: ${matrixGlow} 3s ease-in-out infinite;
  `}

  &:hover {
    background: ${({ $active }) => $active 
      ? 'linear-gradient(135deg, #00ff00, #3b82f6)' 
      : 'rgba(0, 255, 0, 0.1)'
    };
    transform: translateY(-1px);
  }
`;

// Grid Layout
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Item Card with matrix theme
const ItemCard = styled.div<{ $active?: boolean; $featured?: boolean; $comingSoon?: boolean }>`
  cursor: ${({ $comingSoon }) => $comingSoon ? 'default' : 'pointer'};
  position: relative;
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $comingSoon }) => $comingSoon ? 0.7 : 1};

  background: ${({ $active, $featured, $comingSoon }) => {
    if ($comingSoon) return 'rgba(50, 50, 50, 0.2)';
    if ($featured && $active) return 'rgba(0, 255, 0, 0.15)';
    if ($active) return 'rgba(59, 130, 246, 0.15)';
    return 'rgba(0, 0, 0, 0.8)';
  }};

  border: 2px solid ${({ $active, $featured, $comingSoon }) => {
    if ($comingSoon) return 'rgba(100, 100, 100, 0.3)';
    if ($featured && $active) return '#00ff00';
    if ($active) return '#3b82f6';
    return 'rgba(0, 255, 0, 0.2)';
  }};

  &:hover {
    transform: ${({ $comingSoon }) => 
      $comingSoon ? 'none' : 'translateY(-8px) scale(1.02)'
    };
    box-shadow: ${({ $comingSoon }) => 
      $comingSoon 
        ? 'none' 
        : '0 25px 50px rgba(0, 255, 0, 0.1)'
    };
    border-color: ${({ $comingSoon }) => 
      $comingSoon ? 'rgba(100, 100, 100, 0.3)' : '#00ff00'
    };
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ItemIcon = styled.div<{ $color: string; $comingSoon?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color, $comingSoon }) =>
    $comingSoon 
      ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.3), rgba(75, 85, 99, 0.1))'
      : `linear-gradient(135deg, ${$color}30, rgba(0, 255, 0, 0.1))`
  };
  color: ${({ $color, $comingSoon }) => $comingSoon ? '#9ca3af' : $color};
  border: 2px solid ${({ $color, $comingSoon }) =>
    $comingSoon ? 'rgba(107, 114, 128, 0.4)' : `${$color}50`
  };
`;

const ItemTitle = styled.h3<{ $comingSoon?: boolean }>`
  font-weight: 900;
  margin: 0;
  font-size: 1.1rem;
  color: ${({ $comingSoon }) => $comingSoon ? '#9ca3af' : '#00ff00'};
  text-shadow: ${({ $comingSoon }) => 
    $comingSoon ? 'none' : '0 0 5px rgba(0, 255, 0, 0.5)'
  };
`;

const ItemDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.6;
  opacity: 0.9;
  color: #94a3b8;
`;

// Badges
const BadgeContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-end;
`;

const Badge = styled.div<{ $variant?: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: 'Courier New', monospace;
  backdrop-filter: blur(10px);
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'featured':
        return css`
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.8), rgba(59, 130, 246, 0.6));
          color: black;
          animation: ${pulse} 2s infinite;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
        `;
      case 'social':
        return css`
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.6));
          color: black;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
        `;
      case 'coming-soon':
        return css`
          background: linear-gradient(135deg, rgba(107, 114, 128, 0.6), rgba(75, 85, 99, 0.4));
          color: #94a3b8;
        `;
      default:
        return css`
          background: linear-gradient(135deg, rgba(0, 255, 0, 0.8), rgba(29, 78, 216, 0.6));
          color: black;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        `;
    }
  }}
`;

// Controls
const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 10;
`;

const ControlButton = styled.button<{ $variant?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ $variant }) => 
    $variant === 'danger' ? '#ef4444' : '#00ff00'
  };
  background: ${({ $variant }) => 
    $variant === 'danger' 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'rgba(0, 255, 0, 0.1)'
  };
  color: ${({ $variant }) => 
    $variant === 'danger' ? '#ef4444' : '#00ff00'
  };
  font-family: 'Courier New', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px ${({ $variant }) => 
      $variant === 'danger' 
        ? 'rgba(239, 68, 68, 0.3)' 
        : 'rgba(0, 255, 0, 0.3)'
    };
    background: ${({ $variant }) => 
      $variant === 'danger' 
        ? 'rgba(239, 68, 68, 0.2)' 
        : 'rgba(0, 255, 0, 0.2)'
    };
  }
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  background: rgba(0, 255, 0, 0.05);
  backdrop-filter: blur(10px);
  
  span {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #00ff00;
  }
  
  input {
    width: 100px;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 4px;
    
    &::-webkit-slider-thumb {
      background: #00ff00;
    }
  }
  
  .value {
    color: #00ff00;
    min-width: 40px;
    text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  }
`;

// Simulation Container
const SimulationWindow = styled.div`
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 16px;
  padding: 2rem;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 0 40px rgba(0, 255, 0, 0.15),
    inset 0 0 20px rgba(0, 255, 0, 0.05);
  z-index: 10;
`;

const SimulationContent = styled.div`
  width: 100%;
  height: 100%;
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderContent = styled.div`
  text-align: center;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  
  h3 {
    color: #00ff00;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const StatusBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #00ff00;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
`;

// Data
const allItems: SimulationItem[] = [
  // Simulations
  {
    key: 'ants',
    label: 'Travelling Salesman',
    icon: <Users size={24} />,
    color: '#0077ff',
    description: 'Neural swarm intelligence with real user integration and live rankings',
    optimized: true,
    featured: true,
    special: true,
    category: 'simulations'
  },
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
    label: 'N-Body Sandbox',
    icon: <Star size={24} />,
    color: '#f97316',
    description: 'Star & gravity sandbox with advanced physics integration',
    optimized: true,
    featured: true,
    comingSoon: true,
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

  // Algorithms
  {
    key: 'algorithms',
    label: 'Algorithm Explorer',
    icon: <Bone size={24} />,
    color: '#44efd5',
    description: 'Interactive learning platform for core algorithms',
    optimized: false,
    featured: false,
    category: 'algorithms'
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
    key: 'masters-visual',
    label: "Master's Theorem Lab",
    icon: <BookOpen size={24} />,
    color: '#7c3aed',
    description: 'Recursion-tree visualizer for complexity analysis',
    optimized: true,
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
    optimized: false,
    featured: false,
    comingSoon: true,
    category: 'algorithms'
  }
];

// Main Component
export default function SimulationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simulations');
  const [activeSimulation, setActiveSimulation] = useState<SimulationType>('ants');
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const simulationItems = allItems.filter(item => item.category === 'simulations');
  const algorithmItems = allItems.filter(item => item.category === 'algorithms');

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

  // Render the actual simulation component or placeholder
  const renderSimulation = () => {
    // Uncomment these cases as you import the actual components
    switch (activeSimulation) {
      case 'ants':
        return (
          <TSPAlgorithmRace 
            isRunning={isRunning} 
            speed={speed} 
          />
        );
      
      case 'maze':
        return <MazeSolverDemo />;
      
      case 'disease':
        return (
          <DiseaseSimulation 
            isRunning={isRunning} 
            speed={speed} 
            isDark={true} 
          />
        );
      
      case 'life':
        return (
          <LifeSimulation 
            isDark={true}
            isRunning={isRunning}
            speed={speed}
          />
        );
      
      case 'algorithms':
        return (
          <AlgorithmVisualizer 
            isRunning={isRunning} 
            speed={speed}
            isDark={true}
          />
        );

      case 'bacteria-phage':
        return (
          <BacteriaPhageSimulation
            isRunning={isRunning}
            speed={speed}
            isDark={true}
          />
        );
      
      default:
        // Placeholder for simulations that aren't imported yet
        return (
          <PlaceholderContent>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '1rem',
              color: activeItem?.color || '#00ff00'
            }}>
              {activeItem?.icon}
            </div>
            <h3>{activeItem?.label}</h3>
            <p>{activeItem?.description}</p>
            {activeItem?.comingSoon && (
              <p style={{ marginTop: '2rem', color: '#fbbf24' }}>
                Coming Soon...
              </p>
            )}
          </PlaceholderContent>
        );
    }
  };

  return (
    <PageContainer>
      {/* Matrix Rain Background */}
      <MatrixRainContainer>
        <MatrixRain 
          fontSize={14}
          layers={4}
          style={{ opacity: 1 }}
        />
      </MatrixRainContainer>
      
      {/* Overlay for better readability */}
      <ContentOverlay />
      
      <ContentWrapper>
        <PageHeader>
          <PageTitle>Simulation Laboratory</PageTitle>
          <PageSubtitle>
            Visualizing AI
          </PageSubtitle>
        </PageHeader>

        <TabContainer>
          <TabWrapper>
            <TabButton 
              $active={activeTab === 'simulations'}
              onClick={() => setActiveTab('simulations')}
            >
              <Beaker size={20} />
              Simulations
            </TabButton>
            <TabButton 
              $active={activeTab === 'algorithms'}
              onClick={() => setActiveTab('algorithms')}
            >
              <Monitor size={20} />
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
                  <Badge $variant="featured">
                    <Crown size={10} />
                    Featured
                  </Badge>
                )}
                {item.optimized && (
                  <Badge $variant="optimized">
                    <Zap size={10} />
                    60 FPS
                  </Badge>
                )}
                {item.special && (
                  <Badge $variant="social">
                    <Users size={10} />
                    Social
                  </Badge>
                )}
                {item.comingSoon && (
                  <Badge $variant="coming-soon">
                    Coming Soon
                  </Badge>
                )}
              </BadgeContainer>
              
              <ItemHeader>
                <ItemIcon 
                  $color={item.color}
                  $comingSoon={item.comingSoon}
                >
                  {item.icon}
                </ItemIcon>
                <ItemTitle $comingSoon={item.comingSoon}>
                  {item.label}
                </ItemTitle>
              </ItemHeader>

              <ItemDescription>{item.description}</ItemDescription>
            </ItemCard>
          ))}
        </ItemsGrid>

        {activeItem && !activeItem.comingSoon && (
          <ControlsContainer>
            <ControlButton 
              onClick={() => setIsRunning(!isRunning)} 
              $variant={isRunning ? 'danger' : 'primary'}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />} 
              {isRunning ? 'Pause' : 'Execute'}
            </ControlButton>

            <ControlButton onClick={handleReset}>
              <RotateCcw size={18} /> 
              Reset Matrix
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
              onClick={() => setSoundEnabled(!soundEnabled)}
              $variant={soundEnabled ? 'primary' : 'secondary'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} 
              Audio
            </ControlButton>
          </ControlsContainer>
        )}

        <SimulationWindow>
          {activeItem && (
            <>
              <StatusBar>
                <span style={{ color: isRunning ? '#00ff00' : '#fbbf24' }}>
                  {isRunning ? '● RUNNING' : '● PAUSED'}
                </span>
                <span>SPEED: {speed.toFixed(1)}x</span>
                {activeItem.optimized && (
                  <span style={{ color: '#00ff00' }}>GPU ACCELERATED</span>
                )}
              </StatusBar>
              
              <SimulationContent>
                {renderSimulation()}
              </SimulationContent>
            </>
          )}
        </SimulationWindow>
      </ContentWrapper>
    </PageContainer>
  );
}