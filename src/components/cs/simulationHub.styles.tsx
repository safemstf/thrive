// src\components\cs\simulationHub.styles.tsx
import styled, { keyframes, css } from "styled-components";
import { fadeInUp, pulse, glow } from "@/styles/styled-components";

// Animation keyframes
const fadeIn = fadeInUp

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Main container - designed to work with Matrix Rain background
export const SimulationContainer = styled.div<{ $isDark?: boolean }>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $isDark }) => 
    $isDark 
      ? 'rgba(5, 10, 20, 0.85)' // Dark with transparency for Matrix Rain
      : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(8px);
  border-radius: 0;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.8s ease-out;
  
  /* Subtle border to define against Matrix background */
  border: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  };
`;

// Video section with enhanced visual depth
export const VideoSection = styled.div`
  width: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(10, 20, 40, 0.9));
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin: 1rem;
  overflow: hidden;
  
  /* Enhanced border with Matrix blue theme */
  border: 2px solid rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 20px rgba(59, 130, 246, 0.1);
`;

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

export const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
  transition: all 0.2s ease;
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    filter: brightness(1.05);
  }
`;

// Enhanced HUD with Matrix integration
export const HUD = styled.div<{ $isDark?: boolean }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #e2e8f0;
  font-size: 0.875rem;
  min-width: 200px;
  z-index: 15;
  animation: ${glow} 3s ease-in-out infinite;
  
  /* Matrix-style text shadow */
  text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  
  /* Subtle matrix pattern overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(59, 130, 246, 0.03) 50%,
      transparent 70%
    );
    border-radius: 12px;
    pointer-events: none;
  }
`;

// Control selector with enhanced styling
export const DiseaseSelector = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  padding: 0.75rem;
  z-index: 15;
  min-width: 160px;
  
  /* Subtle glow effect */
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
`;

// Enhanced playback controls
export const PlaybackControls = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  padding: 1rem 2rem;
  border-radius: 50px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  z-index: 15;
  
  /* Enhanced visual effects */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  /* Hover effect */
  transition: all 0.3s ease;
  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(59, 130, 246, 0.3);
  }
  
  button {
    background: transparent;
    border: none;
    color: #e2e8f0;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
      color: #ffffff;
      transform: scale(1.1);
    }
  }
  
  input[type="range"] {
    width: 120px;
    height: 4px;
    background: rgba(59, 130, 246, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      
      &:hover {
        transform: scale(1.3);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
      }
    }
  }
`;

export const SpeedIndicator = styled.div`
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  z-index: 15;
  text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  
  /* Animated border */
  background: linear-gradient(45deg, rgba(0,0,0,0.85), rgba(0,0,0,0.85)),
              linear-gradient(45deg, #3b82f6, #1d4ed8, #3b82f6);
  background-size: 100% 100%, 200% 200%;
  background-clip: padding-box, border-box;
  animation: ${shimmer} 3s linear infinite;
`;

// Enhanced controls section
export const ControlsSection = styled.div<{ $isDark?: boolean }>`
  padding: 2rem;
  background: ${({ $isDark }) => 
    $isDark 
      ? 'rgba(10, 15, 30, 0.95)' 
      : 'rgba(248, 250, 252, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-top: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  };
  margin: 1rem;
  border-radius: 0 0 12px 12px;
  
  /* Subtle matrix grid background */
  background-image: ${({ $isDark }) => 
    $isDark 
      ? 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.05) 1px, transparent 0)'
      : 'none'
  };
  background-size: 20px 20px;
`;

// Tab components with Matrix theme
export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  padding-bottom: 0.5rem;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.875rem 1.75rem;
  background: ${({ $active }) => 
    $active 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'transparent'
  };
  border: 1px solid ${({ $active }) => 
    $active 
      ? 'rgba(59, 130, 246, 0.5)' 
      : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 8px;
  color: ${({ $active }) => 
    $active ? '#3b82f6' : '#94a3b8'
  };
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

export const TabContent = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

// Enhanced stat cards
export const StatCard = styled.div<{ $color?: string; $alert?: boolean }>`
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid ${({ $color = '#3b82f6' }) => `${$color}40`};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ $alert }) => $alert && `animation: ${pulse} 2s infinite;`}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: ${({ $color = '#3b82f6' }) => `${$color}80`};
  }
  
  /* Gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      ${({ $color = '#3b82f6' }) => $color}, 
      ${({ $color = '#3b82f6' }) => `${$color}60`},
      ${({ $color = '#3b82f6' }) => $color}
    );
  }
  
  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    font-family: 'Courier New', monospace;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Courier New', monospace;
    color: ${({ $color = '#3b82f6' }) => $color};
    text-shadow: 0 0 10px ${({ $color = '#3b82f6' }) => `${$color}40`};
    line-height: 1;
  }
  
  .change {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    color: #64748b;
    font-family: 'Courier New', monospace;
  }
`;

// Parameter controls with Matrix styling
export const ParameterControl = styled.div`
  margin-bottom: 1.5rem;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #e2e8f0;
    font-family: 'Courier New', monospace;
  }
  
  .value {
    color: #3b82f6;
    font-family: 'Courier New', monospace;
    font-weight: 700;
    font-size: 0.9rem;
    text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(59, 130, 246, 0.2);
    outline: none;
    -webkit-appearance: none;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #1d4ed8);
      border-radius: 3px;
      width: var(--value, 50%);
    }
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.6);
      }
    }
  }
`;

// Intervention components
export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
`;

export const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 1.5rem;
  background: ${({ $active, $color = '#3b82f6' }) => 
    $active 
      ? `rgba(59, 130, 246, 0.15)` 
      : 'rgba(0, 0, 0, 0.3)'
  };
  backdrop-filter: blur(8px);
  border: 2px solid ${({ $active, $color = '#3b82f6' }) => 
    $active ? $color : 'rgba(59, 130, 246, 0.3)'};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #e2e8f0;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
  
  /* Animated background for active state */
  ${({ $active }) => $active && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(59, 130, 246, 0.1) 50%,
        transparent 70%
      );
    }
  `}
  
  .icon {
    color: ${({ $color = '#3b82f6' }) => $color};
    filter: drop-shadow(0 0 5px ${({ $color = '#3b82f6' }) => `${$color}40`});
    z-index: 1;
  }
  
  .name {
    font-weight: 700;
    font-size: 0.9rem;
    font-family: 'Courier New', monospace;
    z-index: 1;
  }
  
  .efficacy {
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: 'Courier New', monospace;
    z-index: 1;
  }
`;

// Additional utility components
export const MatrixOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  pointer-events: none;
  z-index: 0;
`;

export const GlowButton = styled.button<{ $color?: string }>`
  background: linear-gradient(135deg, 
    ${({ $color = '#3b82f6' }) => $color}, 
    ${({ $color = '#3b82f6' }) => `${$color}CC`}
  );
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px ${({ $color = '#3b82f6' }) => `${$color}40`},
      0 0 20px ${({ $color = '#3b82f6' }) => `${$color}60`};
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;