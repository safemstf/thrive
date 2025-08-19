// app/simulations/page.tsx - Matrix-themed with enhanced ant simulation integration
'use client';

import React, { useState, useCallback, KeyboardEvent } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Target, 
  Grid as GridIcon, 
  Volume2, 
  VolumeX, 
  Zap, 
  Users, 
  Trophy, 
  Shield,
  Crown,
  Cpu,
  Eye
} from 'lucide-react';
import MazeSolverDemo from '@/components/cs/mazesolver/mazeSolver';
import AntsSimulation from '@/components/cs/ants/ants'; // Using Matrix-themed version
import { useDarkMode } from '@/providers/darkModeProvider';
import DiseaseSimulation from '@/components/cs/disease/disease';
import LifeSimulation from '@/components/cs/life/life';

// Import styled components from your design system
import {
  PageContainer as BasePageContainer,
  ContentWrapper as BaseContentWrapper,
  Heading1,
  BodyText,
  Card,
  FlexRow,
  ControlButton,
  fadeIn
} from '@/styles/styled-components';
import { MatrixRain } from './matrixStyling';

// Matrix-themed animations
const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Enhanced containers with Matrix integration
const PageContainer = styled(BasePageContainer)`
  min-height: 100vh;
  background: transparent; /* matrix rain shines through */
  overflow-x: hidden;
  position: relative;
`;

const ContentWrapper = styled(BaseContentWrapper)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

// Matrix-themed header section
const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.8s ease-out;
  position: relative;
  padding: 2rem 0;
`;

const HeaderTitle = styled(FlexRow)`
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  position: relative;
`;

const matrixGlow = keyframes`
  0% {
    box-shadow: 0 0 0px rgba(0,255,0,0.06);
    transform: translateY(0);
    opacity: 0.95;
  }
  50% {
    box-shadow: 0 0 24px rgba(0,255,0,0.18);
    transform: translateY(-2px);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 0px rgba(0,255,0,0.06);
    transform: translateY(0);
    opacity: 0.95;
  }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeaderIcon = styled.div`
  color: rgba(59, 130, 246, 0.4);
  animation: ${matrixGlow} 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 255, 0, 0.5));
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
    background: radial-gradient(circle, rgba(0, 255, 0, 0.1), transparent);
    border-radius: 50%;
    z-index: -1;
  }
`;

const TitleText = styled(Heading1)`
  margin: 0;
  background: linear-gradient(135deg, #00ff00, #3b82f6, #8b5cf6);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  letter-spacing: -0.02em;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
  animation: ${shimmer} 3s linear infinite;
`;

const SubtitleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.4); /* matches rain blue */
  border-radius: 25px;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.1), transparent);
    border-radius: 25px;
    animation: ${dataFlow} 2s linear infinite;
  }
`;

// Enhanced simulation cards with Matrix styling
const SimulationNav = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

interface SimulationCardProps {
  $active?: boolean;
  $featured?: boolean;
  $isDark?: boolean;
}

const SimulationCard = styled.div<SimulationCardProps>`
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 180px;
  backdrop-filter: blur(12px);

  background: ${({ $active, $featured, $isDark }) => {
    if ($featured && $active) return 'rgba(0, 255, 0, 0.15)';
    if ($active) return 'rgba(59, 130, 246, 0.15)';
    return $isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.1)';
  }};

  border: 2px solid ${({ $active, $featured }) => {
    if ($featured && $active) return 'rgba(59, 130, 246, 0.4)';
    if ($active) return '#3b82f6';
    return 'rgba(255, 255, 255, 0.2)';
  }};

  color: ${({ $isDark }) => ($isDark ? '#e2e8f0' : '#1e293b')};

  ${({ $featured }) =>
    $featured &&
    css`
      animation: ${matrixGlow} 4s ease-in-out infinite;
    `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $featured, $active }) => {
      if ($featured && $active) return 'linear-gradient(90deg, #00ff00, #3b82f6, #00ff00)';
      if ($active) return 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)';
      return 'transparent';
    }};
    background-size: 200% 100%;

    ${({ $active }) =>
      $active
        ? css`
            animation: ${shimmer} 2s linear infinite;
          `
        : css`
            animation: none;
          `}
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $featured }) =>
      $featured
        ? 'radial-gradient(circle at center, rgba(0, 255, 0, 0.05), transparent)'
        : 'transparent'};
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.2),
      0 0 50px ${({ $featured }) => ($featured ? 'rgba(0, 255, 0, 0.2)' : 'rgba(59, 130, 246, 0.2)')};

    &::after {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-end;
`;

interface OptimizedBadgeProps {
  $variant?: 'optimized' | 'social' | 'featured';
}

const OptimizedBadge = styled.div<OptimizedBadgeProps>`
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
  backdrop-filter: blur(8px);
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'featured':
        return css`
          background: linear-gradient(135deg, #rgba(59, 130, 246, 0.2), #rgba(59, 130, 246, 0.8));
          color: black;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
          animation: ${pulse} 2s infinite;
        `;
      case 'social':
        return css`
          background: linear-gradient(135deg, rgba(251, 191, 36, .4), rgba(245, 158, 11, 0.8));
          color: black;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
        `;
      default:
        return css`
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        `;
    }
  }}
`;

const SimulationCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

interface SimulationCardIconProps {
  $color: string;
  $featured?: boolean;
}

const SimulationCardIcon = styled.div<SimulationCardIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color, $featured }) => 
    $featured 
      ? `linear-gradient(135deg, ${$color}40, #00ff0020)`
      : `linear-gradient(135deg, ${$color}30, ${$color}10)`
  };
  color: ${({ $color }) => $color};
  border: 2px solid ${({ $color, $featured }) => 
    $featured ? 'rgba(59, 130, 246, 0.4)' : `${$color}50`
  };
  
  ${({ $featured }) => $featured && css`
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    animation: ${matrixGlow} 3s ease-in-out infinite;
  `}
`;

interface SimulationCardTitleProps {
  $featured?: boolean;
}

const SimulationCardTitle = styled.h3<SimulationCardTitleProps>`
  font-weight: 900;
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  font-family: ${({ $featured }) => $featured ? "'Courier New', monospace" : 'inherit'};
  
  ${({ $featured }) => $featured && css`
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  `}
`;

const SimulationCardDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.9;
`;

// Enhanced controls with Matrix styling
const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: rgba(0, 0, 0, 0.6);
  flex-wrap: wrap;
  margin-bottom: 2rem;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

interface MatrixControlButtonProps {
  $variant?: 'primary' | 'secondary' | 'danger';
}

const MatrixControlButton = styled(ControlButton)<MatrixControlButtonProps>`
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return 'linear-gradient(135deg, #00ff00, #10b981)';
      case 'danger':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default:
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))';
    }
  }};
  
  border: 1px solid ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return 'rgba(0, 255, 0, 0.5)';
      case 'danger':
        return 'rgba(239, 68, 68, 0.5)';
      default:
        return 'rgba(59, 130, 246, 0.5)';
    }
  }};
  
  color: ${({ $variant }) => $variant === 'primary' ? 'black' : 'white'};
  font-weight: 700;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 15px ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return 'rgba(0, 255, 0, 0.3)';
      case 'danger':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px ${({ $variant }) => {
      switch ($variant) {
        case 'primary':
          return 'rgba(0, 255, 0, 0.4)';
        case 'danger':
          return 'rgba(239, 68, 68, 0.4)';
        default:
          return 'rgba(59, 130, 246, 0.4)';
      }
    }};
  }
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 15px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);

  input[type="range"] { 
    width: 140px;
    height: 6px;
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      cursor: pointer;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #3b82f6;
    font-family: 'Courier New', monospace;
  }
  
  .value { 
    min-width: 50px; 
    text-align: center; 
    font-weight: 900;
    color: #3b82f6;
    font-family: 'Courier New', monospace;
  }
`;

// Enhanced simulation container
const SimulationContainer = styled(Card)`
  padding: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(15px);
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(90deg, 
    rgba(0, 0, 0, 0.9), 
    rgba(0, 20, 0, 0.9),
    rgba(0, 0, 0, 0.9)
  );
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ff00, transparent);
    animation: ${dataFlow} 3s linear infinite;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  
  .label {
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-weight: 900;
    text-shadow: 0 0 5px currentColor;
  }
`;

const MazeContainer = styled.div`
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.1), 
    rgba(59, 130, 246, 0.1)
  );
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.4); /* matches rain blue */
  overflow: hidden;
  padding: 1rem;
  backdrop-filter: blur(10px);
`;

// Types and enhanced data
type SimulationType = 'ants' | 'life' | 'maze' | 'disease';

interface Simulation {
  key: SimulationType;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  optimized: boolean;
  featured: boolean;
  special?: boolean;
}

const simulations: Simulation[] = [
  {
    key: 'ants',
    label: 'Travelling Salesman',
    icon: <Users size={24} />,
    color: '#0077ffff',
    description: 'Neural swarm intelligence with real user integration and live rankings',
    optimized: true,
    featured: true,
    special: true
  },
  {
    key: 'life',
    label: 'Conway\'s Game of Life',
    icon: <Activity size={24} />,
    color: '#10b981',
    description: 'With GPU-accelerated rendering',
    optimized: true,
    featured: false
  },
  {
    key: 'maze',
    label: 'Algorithmic Derby',
    icon: <GridIcon size={24} />,
    color: '#8b5cf6',
    description: 'Advanced pathfinding algorithms with real-time visualization',
    optimized: false,
    featured: false
  },
  {
    key: 'disease',
    label: 'Epidemiological Models',
    icon: <Target size={24} />,
    color: '#ef4444',
    description: 'Agent-based disease simulation with intervention strategies',
    optimized: false,
    featured: false
  }
];

// Main component
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, simKey: SimulationType) => {
    if (e.key === 'Enter' || e.key === ' ') { 
      e.preventDefault(); 
      setActiveSimulation(simKey); 
    }
  };

  const renderSimulation = () => {
    switch (activeSimulation) {
      case 'ants':
        return (
          <AntsSimulation 
            isRunning={isRunning} 
            speed={speed} 
            isDark={true} // Always use dark mode for Matrix theme
          />
        );
        
      case 'maze':
        return (
          <MazeContainer>
            <MazeSolverDemo />
          </MazeContainer>
        );
        
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
        
      default:
        return null;
    }
  };

  const activeSimInfo = simulations.find(s => s.key === activeSimulation);
  const isOptimized = activeSimInfo?.optimized || false;
  const isFeatured = activeSimInfo?.featured || false;

  return (
    <PageContainer>
      <MatrixRain />
      <ContentWrapper>
        <PageHeader>

          <SubtitleBadge>
            <Cpu size={16} />
            Neural Simulation Hub
          </SubtitleBadge>

          <BodyText 
            $size="lg" 
            style={{ 
              fontWeight: 400, 
              margin: '1.5rem auto 0', 
              maxWidth: 700, 
              color: '#94a3b8',
              lineHeight: 1.7,
              fontFamily: 'Courier New, monospace'
            }}
          >
            High-performance visualizations powered by WebGL and quantum algorithms
          </BodyText>
        </PageHeader>

        <SimulationNav>
          {simulations.map(sim => (
            <SimulationCard
              key={sim.key}
              onClick={() => setActiveSimulation(sim.key)}
              $active={activeSimulation === sim.key}
              $featured={sim.featured}
              $isDark={true}
              role="button"
              tabIndex={0}
              aria-pressed={activeSimulation === sim.key}
              onKeyDown={(e) => handleKeyDown(e, sim.key)}
            >
              <BadgeContainer>
                
                {sim.optimized && (
                  <OptimizedBadge $variant="optimized">
                    <Zap size={10} />
                    60 FPS
                  </OptimizedBadge>
                )}
                
                {sim.special && (
                  <OptimizedBadge $variant="social">
                    <Users size={10} />
                    SOCIAL
                  </OptimizedBadge>
                )}
              </BadgeContainer>
              
              <SimulationCardHeader>
                <SimulationCardIcon $color={sim.color} $featured={sim.featured}>
                  {sim.icon}
                </SimulationCardIcon>
                <SimulationCardTitle $featured={sim.featured}>
                  {sim.label}
                </SimulationCardTitle>
              </SimulationCardHeader>

              <SimulationCardDescription>{sim.description}</SimulationCardDescription>
            </SimulationCard>
          ))}
        </SimulationNav>

        <ControlsContainer>
          <MatrixControlButton 
            onClick={() => setIsRunning(!isRunning)} 
            $variant={isRunning ? 'danger' : 'primary'}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />} 
            {isRunning ? 'Pause' : 'Execute'}
          </MatrixControlButton>

          <MatrixControlButton 
            onClick={handleReset} 
            $variant="secondary"
          >
            <RotateCcw size={18} /> 
            Reset Matrix
          </MatrixControlButton>

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

          <MatrixControlButton 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            $variant={soundEnabled ? 'primary' : 'secondary'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />} 
            Audio
          </MatrixControlButton>
        </ControlsContainer>

        <SimulationContainer>
          {activeSimInfo && (
            <StatusBar>
              <StatusItem>
                <Eye size={16} style={{ color: activeSimInfo.color }} />
                <span className="label">Active Module:</span>
                <span className="value" style={{ color: activeSimInfo.color }}>
                  {activeSimInfo.label.toUpperCase()}
                </span>
              </StatusItem>
              
              <StatusItem>
                <span className="label">Status:</span>
                <span className="value" style={{ color: isRunning ? '#00ff00' : '#fbbf24' }}>
                  {isRunning ? 'RUNNING' : 'PAUSED'}
                </span>
              </StatusItem>
              
              <StatusItem>
                <span className="label">Speed:</span>
                <span className="value" style={{ color: '#3b82f6' }}>
                  {speed.toFixed(1)}X
                </span>
              </StatusItem>
              
              {isOptimized && (
                <StatusItem>
                  <Shield size={16} style={{ color: '#10b981' }} />
                  <span className="value" style={{ color: '#10b981' }}>
                    GPU ACCELERATED
                  </span>
                </StatusItem>
              )}

              {isFeatured && (
                <StatusItem>
                  <Crown size={16} style={{ color: '#fbbf24' }} />
                  <span className="value" style={{ color: '#fbbf24' }}>
                    NEURAL CORE
                  </span>
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