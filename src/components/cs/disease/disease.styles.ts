// src\components\cs\disease\disease.styles.ts

import { fadeIn, pulse } from "@/styles/styled-components";
import styled from "styled-components";

export const SimulationContainer = styled.div<{ $isDark?: boolean }>`
  width: 100%;
  background: ${({ $isDark }) => 
    $isDark ? '#0a0a0a' : '#ffffff'};
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
`;

export const VideoSection = styled.div`
  width: 100%;
  background: #000;
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

export const HUD = styled.div<{ $isDark?: boolean }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.875rem;
  min-width: 180px;
  z-index: 10;
`;

export const DiseaseSelector = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  z-index: 10;
`;

export const PlaybackControls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
`;

export const SpeedIndicator = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
`;

export const ControlsSection = styled.div<{ $isDark?: boolean }>`
  padding: 1.5rem;
  background: ${({ $isDark }) => 
    $isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(250, 250, 250, 0.95)'};
  border-top: 1px solid ${({ $isDark }) => 
    $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: ${({ $active }) => 
    $active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)'};
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--color-primary-500);
    transform: scaleX(${({ $active }) => $active ? 1 : 0});
    transition: transform 0.2s ease;
  }
  
  &:hover {
    color: var(--color-text-primary);
  }
`;

export const TabContent = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

export const StatCard = styled.div<{ $color?: string; $alert?: boolean }>`
  padding: 1rem;
  background: var(--color-background-tertiary);
  border-radius: 8px;
  border-left: 3px solid ${({ $color = '#3b82f6' }) => $color};
  ${({ $alert }) => $alert && `animation: ${pulse} 2s infinite;`}
  
  .label {
    font-size: 0.7rem;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: monospace;
  }
  
  .change {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    opacity: 0.8;
  }
`;

export const ParameterControl = styled.div`
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .label {
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .value {
    color: var(--color-primary-500);
    font-family: monospace;
    font-weight: 700;
    font-size: 0.875rem;
  }
  
  input[type="range"] {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-background-tertiary);
    outline: none;
    -webkit-appearance: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--color-primary-500);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.2);
      }
    }
  }
`;

export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

export const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 1rem;
  background: ${({ $active, $color = '#3b82f6' }) => 
    $active ? `${$color}15` : 'var(--color-background-tertiary)'};
  border: 2px solid ${({ $active, $color = '#3b82f6' }) => 
    $active ? $color : 'var(--color-border-light)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-primary);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    color: ${({ $color = '#3b82f6' }) => $color};
  }
  
  .name {
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .efficacy {
    font-size: 0.7rem;
    opacity: 0.7;
  }
`;