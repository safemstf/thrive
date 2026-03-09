// src/components/cs/disease/disease.styles.ts
// ─────────────────────────────────────────────────────────────────────────────
// Disease simulation styled components.
// Shared tokens + base components come from simulationHub.styles.
// Only disease-specific overrides / extensions live here.
// ─────────────────────────────────────────────────────────────────────────────

import styled, { keyframes, css } from 'styled-components';
import {
  T, D, pulse, fadeIn,
  // Re-export hub primitives so consumers can import from one place
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  DiseaseSelector,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  DarkStatCard as StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton,
} from '@/components/cs/simulationHub.styles';

export {
  T, D, pulse, fadeIn,
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  DiseaseSelector,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton,
};

// ─────────────────────────────────────────────────────────────────────────────
// Disease-specific components
// ─────────────────────────────────────────────────────────────────────────────

/** Full-viewport dark overlay used in mobile fullscreen mode */
export const FullscreenOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  inset: 0;
  background: ${D.bg};
  z-index: 10000;
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
`;

export const FullscreenCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
  &:active { cursor: grabbing; }
`;

export const FullscreenControls = styled.div`
  position: absolute;
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(0,0,0,0.95);
  padding: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(59,130,246,0.5);
  z-index: 100;
`;

export const FullscreenButton = styled.button<{ $primary?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${({ $primary }) => $primary ? '#6366f1' : 'rgba(51,65,85,0.8)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ExitButton = styled.button`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(59,130,246,0.5);
  background: rgba(0,0,0,0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
`;

/** Sliding drawer from bottom — contains controls on mobile */
export const ControlsDrawer = styled.div<{ $expanded: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(10,14,26,0.98);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(59,130,246,0.3);
  z-index: 100;
  max-height: ${({ $expanded }) => $expanded ? '70vh' : '60px'};
  transition: max-height 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
`;

export const DrawerHandle = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: ${D.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  &:hover { background: rgba(59,130,246,0.1); }
`;

export const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: rgba(51,65,85,0.3); }
  &::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.5); border-radius: 3px; }
`;

/** Network-topology overlay pinned top-right of the canvas */
export const NetworkOverlay = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem;
  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(59,130,246,0.3);
  font-size: 0.75rem;
  color: white;
  z-index: 50;
  max-width: 250px;
`;

export const DiseaseButton = styled.button<{ $color: string; $selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ $selected, $color }) => $selected ? `${$color}20` : 'rgba(0,0,0,0.3)'};
  border: 1px solid ${({ $selected, $color }) => $selected ? $color : 'rgba(59,130,246,0.2)'};
  border-radius: 10px;
  color: white;
  cursor: pointer;
  text-align: left;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  &:hover { background: ${({ $color }) => `${$color}15`}; }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
`;

export const SimGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$columns}, 1fr);
  gap: 1rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

/** Mobile-only "View Simulation" CTA button */
export const ViewSimButton = styled.button`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    &:active { transform: scale(0.98); }
  }
`;
