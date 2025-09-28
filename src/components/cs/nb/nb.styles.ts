// src/components/cs/nb/nb.styles.ts
// N-Body Sandbox - Complete Styling System
// Professional cosmic theme with floating glass panels

import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

// ===== ANIMATIONS =====

const cosmicGlow = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.1),
      0 0 40px rgba(59, 130, 246, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(59, 130, 246, 0.2),
      0 0 60px rgba(59, 130, 246, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const stellarPulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(251, 191, 36, 0.6);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const shimmerEffect = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const orbitRotation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const dataFlowPulse = keyframes`
  0%, 100% { opacity: 0.6; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(5px); }
`;

const loadingSpinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const starTwinkle = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

// ===== GLOBAL STYLES =====

export const NBodyGlobalStyles = createGlobalStyle`
  .n-body-simulation {
    * {
      box-sizing: border-box;
    }
    
    canvas {
      outline: none;
      cursor: grab;
      
      &:active {
        cursor: grabbing;
      }
    }
    
    /* Custom scrollbar for panels */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(59, 130, 246, 0.4);
      border-radius: 3px;
      
      &:hover {
        background: rgba(59, 130, 246, 0.6);
      }
    }
    
    /* Firefox scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.4) rgba(0, 0, 0, 0.2);
  }
`;

// ===== MAIN CONTAINER =====

export const SimulationContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: radial-gradient(ellipse at center, #0a0f1c 0%, #000000 70%, #000000 100%);
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  
  /* Cosmic background layers */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.02) 0%, transparent 50%);
    pointer-events: none;
    animation: ${starTwinkle} 8s ease-in-out infinite;
  }
  
  /* Subtle grid overlay */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 100px 100px;
    pointer-events: none;
    opacity: 0.3;
  }
`;

export const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;

// ===== FLOATING UI PANELS =====

// ===== FLOATING UI PANELS =====

export const FloatingPanel = styled.div<{ 
  $position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  $width?: string;
  $collapsed?: boolean;
  $hidden?: boolean;   /* added */
  $minimal?: boolean;  /* added */
}>`
  position: absolute;
  z-index: 10;
  background: ${({ $minimal }) => $minimal
    ? 'rgba(10,14,39,0.6)'
    : 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(0, 0, 0, 0.85) 100%)'};
  backdrop-filter: ${({ $minimal }) => $minimal ? 'blur(8px)' : 'blur(20px)'};
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: ${({ $minimal }) => $minimal ? '12px' : '16px'};
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease, box-shadow 0.28s ease;
  animation: ${fadeInUp} 0.38s ease-out;
  will-change: transform, opacity;
  
  ${({ $position }) => {
    switch ($position) {
      case 'top-left':
        return css`top: 1.5rem; left: 1.5rem;`;
      case 'top-right':
        return css`top: 1.5rem; right: 1.5rem;`;
      case 'bottom-left':
        return css`bottom: 1.5rem; left: 1.5rem;`;
      case 'bottom-right':
        return css`bottom: 1.5rem; right: 1.5rem;`;
      case 'bottom-center':
        return css`
          bottom: 1.5rem; 
          left: 50%; 
          transform: translateX(-50%);
        `;
      default:
        return css`top: 1.5rem; left: 1.5rem;`;
    }
  }}

  width: ${({ $width }) => $width || 'auto'};
  min-width: 280px;
  max-width: 450px;

  /* collapsed state */
  ${({ $collapsed }) => $collapsed && css`
    transform: scale(0.98);
    opacity: 0.85;
    pointer-events: none;
  `}

  /* hidden state (no layout change) */
  ${({ $hidden, $position }) => $hidden && css`
    transform: ${$position === 'bottom-center' ? 'translateX(-50%) translateY(12px)' : 'translateY(12px)'};
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  `}

  &:hover {
    /* avoid changing layout (do not change border-width or margins) */
    border-color: rgba(59, 130, 246, 0.36);
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    /* small raised transform to provide affordance */
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    min-width: 240px;
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
`;


/* ===== PANEL CONTENT: stable thin overlay scrollbar to avoid show/hide layout shifts ===== */

export const PanelContent = styled.div<{ $padding?: boolean; $maxHeight?: string }>`
  padding: ${({ $padding = true }) => ($padding ? '1.25rem' : '0')};
  max-height: ${({ $maxHeight }) => $maxHeight || 'calc(70vh - 60px)'};
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-y: auto;
  -ms-overflow-style: none; /* IE / Edge fallback */
  scrollbar-width: thin;

  /* visible thin overlay scrollbar that doesn't change layout */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.18);
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,0.15);
  }
  /* slightly highlight scrollbar on hover to show affordance */
  &:hover::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.32);
  }

  /* For Firefox */
  & {
    scrollbar-color: rgba(59,130,246,0.18) transparent;
  }
`;





export const PanelHeader = styled.div<{ $variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return 'linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)';
      case 'secondary':
        return 'linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)';
      default:
        return 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)';
    }
  }};
  
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  
  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
      letter-spacing: -0.025em;
    }
    
    .icon {
      color: ${({ $variant }) => {
        switch ($variant) {
          case 'warning': return '#fbbf24';
          case 'secondary': return '#a855f7';
          default: return '#60a5fa';
        }
      }};
    }
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;


// ===== CONTROL ELEMENTS =====

export const IconButton = styled.button<{ 
  $variant?: 'primary' | 'secondary' | 'danger' | 'success';
  $size?: 'sm' | 'md' | 'lg';
  $active?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm':
        return css`width: 32px; height: 32px;`;
      case 'lg':
        return css`width: 48px; height: 48px;`;
      default:
        return css`width: 40px; height: 40px;`;
    }
  }}
  
  ${({ $variant = 'primary', $active = false }) => {
    const variants = {
      primary: {
        bg: $active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        border: $active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)',
        color: $active ? '#60a5fa' : '#94a3b8',
        hoverBg: 'rgba(59, 130, 246, 0.15)',
        hoverColor: '#60a5fa'
      },
      secondary: {
        bg: $active ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.1)',
        border: $active ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.2)',
        color: $active ? '#cbd5e1' : '#94a3b8',
        hoverBg: 'rgba(148, 163, 184, 0.15)',
        hoverColor: '#cbd5e1'
      },
      danger: {
        bg: $active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        border: $active ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)',
        color: $active ? '#f87171' : '#94a3b8',
        hoverBg: 'rgba(239, 68, 68, 0.15)',
        hoverColor: '#f87171'
      },
      success: {
        bg: $active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
        border: $active ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.2)',
        color: $active ? '#4ade80' : '#94a3b8',
        hoverBg: 'rgba(34, 197, 94, 0.15)',
        hoverColor: '#4ade80'
      }
    };
    
    const v = variants[$variant];
    return css`
      background: ${v.bg};
      border: 1px solid ${v.border};
      color: ${v.color};
      
      &:hover {
        background: ${v.hoverBg};
        color: ${v.hoverColor};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${v.border};
      }
      
      &:active {
        transform: translateY(0);
      }
    `;
  }}
  
  ${({ $active }) => $active && css`
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 10px;
      padding: 2px;
      background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

export const PrimaryButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40px;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          background: rgba(148, 163, 184, 0.1);
          border: 1px solid rgba(148, 163, 184, 0.2);
          color: #cbd5e1;
          
          &:hover {
            background: rgba(148, 163, 184, 0.15);
            border-color: rgba(148, 163, 184, 0.3);
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return css`
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          
          &:hover {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.15));
            border-color: rgba(239, 68, 68, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
          }
        `;
      default:
        return css`
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
          
          &:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.15));
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
          }
        `;
    }
  }}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  ${({ $loading }) => $loading && css`
    cursor: wait;
    
    &::after {
      content: '';
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: ${loadingSpinner} 1s linear infinite;
      margin-left: 0.5rem;
    }
  `}
`;

// ===== SLIDERS AND INPUTS =====

export const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    font-weight: 500;
    color: #94a3b8;
    
    .value {
      color: #60a5fa;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
  }
`;

export const CustomSlider = styled.input.attrs({ type: 'range' })<{ $color?: string }>`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, 
    ${({ $color = '#3b82f6' }) => $color} 0%, 
    ${({ $color = '#3b82f6' }) => $color} var(--value, 50%), 
    rgba(148, 163, 184, 0.2) var(--value, 50%), 
    rgba(148, 163, 184, 0.2) 100%
  );
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${({ $color = '#3b82f6' }) => $color}, ${({ $color = '#3b82f6' }) => $color}dd);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${({ $color = '#3b82f6' }) => $color}, ${({ $color = '#3b82f6' }) => $color}dd);
    border: 2px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &::-webkit-slider-thumb, &::-moz-range-thumb {
      cursor: not-allowed;
      transform: none;
    }
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #94a3b8;
  }
  
  input, select {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 6px;
    color: #e2e8f0;
    font-family: inherit;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
    
    &::placeholder {
      color: #64748b;
    }
  }
`;

// ===== STATUS AND METRICS =====

export const MetricCard = styled.div<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'success': return 'rgba(34, 197, 94, 0.05)';
      case 'warning': return 'rgba(251, 191, 36, 0.05)';
      case 'danger': return 'rgba(239, 68, 68, 0.05)';
      default: return 'rgba(59, 130, 246, 0.05)';
    }
  }};
  border: 1px solid ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'success': return 'rgba(34, 197, 94, 0.15)';
      case 'warning': return 'rgba(251, 191, 36, 0.15)';
      case 'danger': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(59, 130, 246, 0.15)';
    }
  }};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: ${({ $variant = 'primary' }) => {
      switch ($variant) {
        case 'success': return 'rgba(34, 197, 94, 0.08)';
        case 'warning': return 'rgba(251, 191, 36, 0.08)';
        case 'danger': return 'rgba(239, 68, 68, 0.08)';
        default: return 'rgba(59, 130, 246, 0.08)';
      }
    }};
  }
  
  .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #94a3b8;
    
    .icon {
      color: ${({ $variant = 'primary' }) => {
        switch ($variant) {
          case 'success': return '#4ade80';
          case 'warning': return '#fbbf24';
          case 'danger': return '#f87171';
          default: return '#60a5fa';
        }
      }};
    }
  }
  
  .value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ $variant = 'primary' }) => {
      switch ($variant) {
        case 'success': return '#4ade80';
        case 'warning': return '#fbbf24';
        case 'danger': return '#f87171';
        default: return '#60a5fa';
      }
    }};
  }
`;

export const StatusIndicator = styled.div<{ $status: 'running' | 'paused' | 'stopped' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${({ $status }) => {
    switch ($status) {
      case 'running':
        return css`
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          animation: ${dataFlowPulse} 2s ease-in-out infinite;
        `;
      case 'paused':
        return css`
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fbbf24;
        `;
      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        `;
      default:
        return css`
          background: rgba(148, 163, 184, 0.15);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #94a3b8;
        `;
    }
  }}
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    
    ${({ $status }) => $status === 'running' && css`
      animation: ${stellarPulse} 1.5s ease-in-out infinite;
    `}
  }
`;

// ===== SCENARIO SELECTOR =====

export const ScenarioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ScenarioCard = styled.div<{ $active?: boolean; $featured?: boolean }>`
  padding: 1rem;
  background: ${({ $active }) => 
    $active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)'
  };
  border: 1px solid ${({ $active, $featured }) => {
    if ($active) return 'rgba(59, 130, 246, 0.4)';
    if ($featured) return 'rgba(251, 191, 36, 0.3)';
    return 'rgba(148, 163, 184, 0.1)';
  }};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    border-color: ${({ $active }) => 
      $active ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.3)'
    };
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  
  ${({ $featured }) => $featured && css`
    &::after {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), transparent, rgba(251, 191, 36, 0.2));
      z-index: -1;
      animation: ${orbitRotation} 8s linear infinite;
    }
  `}
  
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    
    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
    }
    
    .badge {
      padding: 0.25rem 0.5rem;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      color: #fbbf24;
    }
  }
  
  .description {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  
  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.7rem;
    color: #64748b;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }
`;

// ===== TIMELINE AND PROGRESS =====

export const TimelineContainer = styled.div`
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

export const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
  width: 100%;
  height: 6px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $progress }) => Math.max(0, Math.min(100, $progress))}%;
    background: linear-gradient(90deg, 
      ${({ $color = '#3b82f6' }) => $color}, 
      ${({ $color = '#3b82f6' }) => $color}dd
    );
    transition: width 0.3s ease;
    box-shadow: 0 0 10px ${({ $color = '#3b82f6' }) => $color}44;
  }
`;

// ===== LOADING STATES =====

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(10px);
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(59, 130, 246, 0.2);
    border-top: 4px solid #60a5fa;
    border-radius: 50%;
    animation: ${loadingSpinner} 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  .message {
    color: #94a3b8;
    font-size: 0.9rem;
    text-align: center;
    max-width: 300px;
    line-height: 1.5;
  }
`;

// ===== RESPONSIVE UTILITIES =====

export const ResponsiveContainer = styled.div`
  @media (max-width: 768px) {
    ${FloatingPanel} {
      position: relative;
      width: 100%;
      margin: 1rem 0;
      border-radius: 12px;
    }
    
    ${SimulationContainer} {
      flex-direction: column;
    }
    
    ${CanvasContainer} {
      height: 60vh;
    }
  }
`;

// ===== TOOLTIP SYSTEM =====

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-8px);
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.9);
  color: #e2e8f0;
  font-size: 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

export default {
  SimulationContainer,
  CanvasContainer,
  FloatingPanel,
  PanelHeader,
  PanelContent,
  IconButton,
  PrimaryButton,
  SliderContainer,
  CustomSlider,
  InputGroup,
  MetricCard,
  StatusIndicator,
  ScenarioGrid,
  ScenarioCard,
  TimelineContainer,
  ProgressBar,
  LoadingOverlay,
  TooltipWrapper,
  Tooltip,
  NBodyGlobalStyles
};