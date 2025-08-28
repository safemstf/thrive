'use client'
// src/components/cs/simulationHub.styles.tsx
import styled, { keyframes, css } from "styled-components";

// Define animations locally to avoid import issues
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Main container - designed to work with Matrix Rain background
export const SimulationContainer = styled.div<{ $isDark?: boolean }>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $isDark = true }) => 
    $isDark 
      ? 'rgba(5, 10, 20, 0.85)' // Default to dark to match Matrix theme
      : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(8px);
  border-radius: 0;
  position: relative;
  z-index: 1;
  animation: ${fadeInUp} 0.8s ease-out;
  
  /* Subtle border to define against Matrix background */
  border: 1px solid ${({ $isDark = true }) => 
    $isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  };
`;

// Video section with enhanced visual depth
export const VideoSection = styled.div`
  width: 97%;
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
  display: block; /* Prevent hydration issues with canvas */
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    filter: brightness(1.05);
  }
`;

// Enhanced HUD with Matrix integration - removed complex pseudo-elements
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
  
  /* Simplified glow effect */
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
  
  /* Matrix-style text shadow */
  text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
`;

// Control selector with enhanced styling
export const DiseaseSelector = styled.div`
  position: absolute;
  margin-top: 100px;
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

// Enhanced playback controls - simplified for hydration safety
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
  
  /* Simplified visual effects */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  
  /* Hover effect */
  transition: all 0.3s ease;
  &:hover {
    transform: translateX(-50%) translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
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
`;

// Enhanced controls section with default props
export const ControlsSection = styled.div<{ $isDark?: boolean }>`
  padding: 2rem;
  background: ${({ $isDark = true }) => 
    $isDark 
      ? 'rgba(10, 15, 30, 0.95)' 
      : 'rgba(248, 250, 252, 0.95)'
  };
  backdrop-filter: blur(10px);
  border-top: 1px solid ${({ $isDark = true }) => 
    $isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'
  };
  margin: 1rem;
  border-radius: 0 0 12px 12px;
  
  /* Simplified background pattern */
  background-image: ${({ $isDark = true }) => 
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
  background: ${({ $active = false }) => 
    $active 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'transparent'
  };
  border: 1px solid ${({ $active = false }) => 
    $active 
      ? 'rgba(59, 130, 246, 0.5)' 
      : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 8px;
  color: ${({ $active = false }) => 
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
  animation: ${fadeInUp} 0.4s ease-out;
`;

// Enhanced stat cards with default props
export const StatCard = styled.div<{ $color?: string; $alert?: boolean }>`
  --card-color: ${({ $color }) => $color || '#3b82f6'};
  
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ $alert = false }) => $alert && css`animation: ${pulse} 2s infinite;`}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: rgba(59, 130, 246, 0.8);
  }
  
  /* Simplified gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--card-color);
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
    color: var(--card-color);
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    line-height: 1;
  }
  
  .change {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    color: #64748b;
    font-family: 'Courier New', monospace;
  }
`;

// Parameter controls with Matrix styling - simplified
export const ParameterControl = styled.div<{ $isDark?: boolean }>`
  --accent: #3b82f6; /* blue-500 */
  --accent-strong: #1d4ed8; /* blue-700 */
  --track-dark: rgba(59,130,246,0.18);
  --track-light: rgba(15,23,42,0.06);

  /* adapt to theme */
  --bg: ${({ $isDark = true }) => ($isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')};
  --label: ${({ $isDark = true }) => ($isDark ? '#e6eef8' : '#0f172a')};       /* higher contrast label */
  --muted: ${({ $isDark = true }) => ($isDark ? '#94a3b8' : '#475569')};       /* muted text */
  --thumb-border: ${({ $isDark = true }) => ($isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')};

  display: block;
  padding: 0.25rem 0;
  margin-bottom: 1.5rem;
  background: var(--bg);
  border-radius: 8px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .label {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--label);
    font-family: 'Courier New', monospace;
    letter-spacing: 0.2px;
  }

  .value {
    color: var(--accent);
    font-family: 'Courier New', monospace;
    font-weight: 800;
    font-size: 0.95rem;
    text-shadow: 0 0 4px rgba(59, 130, 246, 0.25);
    margin-left: 0.5rem;
  }

  /* Range slider: larger thumb, accessible focus ring */
  input[type="range"] {
    width: 100%;
    height: 12px;
    -webkit-appearance: none;
    background: ${({ $isDark = true }) => ($isDark ? 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))' : 'transparent')};
    outline: none;
    border-radius: 999px;
  }

  /* Track for webkit */
  input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: ${({ $isDark = true }) => ($isDark ? 'var(--track-dark)' : 'var(--track-light)')};
  }

  /* Thumb for webkit */
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    margin-top: -7px; /* centers the thumb on the track */
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    border: 2px solid var(--thumb-border);
    box-shadow: 0 4px 14px rgba(13, 42, 148, 0.25);
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(13, 42, 148, 0.32);
  }

  /* Focus visible for keyboard users */
  input[type="range"]:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 6px rgba(59,130,246,0.14), 0 6px 20px rgba(13, 42, 148, 0.28);
    transform: scale(1.06);
  }

  /* Firefox styles */
  input[type="range"]::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: ${({ $isDark = true }) => ($isDark ? 'var(--track-dark)' : 'var(--track-light)')};
  }
  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    border: 2px solid var(--thumb-border);
    box-shadow: 0 4px 14px rgba(13, 42, 148, 0.25);
    cursor: pointer;
  }

  /* Reduced-motion / prefers-contrast */
  @media (prefers-reduced-motion: reduce) {
    input[type="range"]::-webkit-slider-thumb,
    input[type="range"]::-moz-range-thumb {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    --label: ${({ $isDark = true }) => ($isDark ? '#ffffff' : '#0b1220')};
    --muted: ${({ $isDark = true }) => ($isDark ? '#cbd5e1' : '#334155')};
    input[type="range"]::-webkit-slider-track,
    input[type="range"]::-moz-range-track {
      background: rgba(59,130,246,0.28);
    }
    input[type="range"]::-webkit-slider-thumb,
    input[type="range"]::-moz-range-thumb {
      box-shadow: 0 0 0 5px rgba(59,130,246,0.16);
    }
  }
`;


// Intervention components with default props
export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
`;

export const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  --intervention-color: ${({ $color }) => $color || '#3b82f6'};
  
  padding: 1.5rem;
  background: ${({ $active = false }) => 
    $active 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'rgba(0, 0, 0, 0.3)'
  };
  backdrop-filter: blur(8px);
  border: 2px solid ${({ $active = false }) => 
    $active ? 'var(--intervention-color)' : 'rgba(59, 130, 246, 0.3)'};
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
  
  .icon {
    color: var(--intervention-color);
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.4));
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
  --glow-color: ${({ $color }) => $color || '#3b82f6'};
  
  background: linear-gradient(135deg, 
    var(--glow-color), 
    color-mix(in srgb, var(--glow-color) 80%, transparent)
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
      0 8px 25px rgba(59, 130, 246, 0.4),
      0 0 20px rgba(59, 130, 246, 0.6);
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;