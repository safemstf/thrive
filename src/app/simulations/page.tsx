// src/app/simulations/page.tsx - Complete Professional Simulation Platform
'use client';

import React, { useState, useCallback } from 'react';
import dynamic from "next/dynamic";
import styled, { keyframes, css } from 'styled-components';
import { 
  Play, Pause, RotateCcw, Activity, Target, Grid, Volume2, VolumeX,
  Bone, Zap, Users, Trophy, Shield, Crown, Cpu, Eye, Star, RotateCw, Microscope,
  Droplet, Wifi, BookOpen, Sliders, Monitor, Beaker, Loader
} from 'lucide-react';
import { MatrixRain } from './matrixStyling';
import AmdahlsLawSimulator from '@/components/cs/amdalsLaw/amdalsLaw';

// Dynamically import ALL simulations with loading states
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

// Types
type SimulationType = 'ants' | 'life' | 'maze' | 'disease' | 'bacteria-phage' | 'predprey' | 'chem-resonance' | 'nbody' | 'three-body' | 'parallel-model' | 'amdahl' | 'masters-visual' | 'wireless' | 'FourierTransform-NeuralNetwork' | 'FourierTransformNetworkErrorCorrection';
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

const gentleGlow = keyframes`
  0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08); }
  50% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15); }
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

// Professional container
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 50%, #f1f5f9 100%);
  position: relative;
  overflow-x: hidden;
`;

// Subtle matrix background
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

// Professional tab system
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

// Professional card grid
const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Clean, professional cards
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

// Clean badge system
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

// Professional controls
const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ControlButton = styled.button<{ $variant?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  border: 1px solid ${({ $variant }) => 
    $variant === 'danger' ? '#f87171' : '#3b82f6'
  };
  background: ${({ $variant }) => 
    $variant === 'danger' ? '#fef2f2' : '#eff6ff'
  };
  color: ${({ $variant }) => 
    $variant === 'danger' ? '#dc2626' : '#2563eb'
  };
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $variant }) => 
      $variant === 'danger' ? '#fee2e2' : '#dbeafe'
    };
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

// Professional simulation window
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

const SimulationContent = styled.div`
  width: 100%;
  height: 100%;
  min-height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #fafbfc;
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

const StatusBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #475569;
  font-weight: 600;
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 6px;
    backdrop-filter: blur(10px);
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    
    &.running { background: #10b981; }
    &.paused { background: #f59e0b; }
    &.optimized { background: #3b82f6; }
  }
`;

// Data - Complete simulation items
const allItems: SimulationItem[] = [
  // Simulations
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
    comingSoon: false,
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
    
    // todo:
    // fourier transform based neural networks. simulation/algorithm module
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
    optimized: false,
    featured: false,
    comingSoon: true,
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

  // Render the actual simulation component
  const renderSimulation = () => {
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
            isDark={false} // Light mode
          />
        );
      
      case 'life':
        return (
          <LifeSimulation 
            isDark={false}
            isRunning={isRunning}
            speed={speed}
          />
        );
      
      case 'bacteria-phage':
        return (
          <AdvancedBacteremiaSimulator
            initialRunning={isRunning}
            initialSpeed={speed}
            isDark={false}
          />
        );

      case 'amdahl':
        return (
          <AmdahlsLawSimulator
            isRunning={isRunning}
            speed={speed}
            isDark={false}
          />  
        );
      
      default:
        return (
          <PlaceholderContent>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '1rem',
              color: activeItem?.color || '#3b82f6'
            }}>
              {activeItem?.icon}
            </div>
            <h3>{activeItem?.label}</h3>
            <p>{activeItem?.description}</p>
            {activeItem?.comingSoon && (
              <p style={{ marginTop: '2rem', color: '#f59e0b' }}>
                Coming Soon...
              </p>
            )}
          </PlaceholderContent>
        );
    }
  };

  return (
    <PageContainer>
      {/* Subtle Matrix Background */}
      <MatrixBackground>
        <MatrixRain 
          fontSize={32}
          layers={3}
        />
      </MatrixBackground>
      
      <ContentWrapper>
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
                <ItemIcon 
                  $color={item.color}
                  $comingSoon={item.comingSoon}
                >
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

        {activeItem && !activeItem.comingSoon && (
          <ControlsContainer>
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