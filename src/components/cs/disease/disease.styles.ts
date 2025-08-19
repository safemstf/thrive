// src/components/cs/disease/disease.styles.ts
import styled, { css } from 'styled-components';
import { 
  Card, 
  CardContent,
  pulse,
  glow,
  slideUp,
  Badge
} from '../../../styles/styled-components';

// Only disease-specific components that don't exist in the main hub

export const SimCanvas = styled.canvas`
  width: 100%;
  height: auto;
  max-height: 500px;
  aspect-ratio: 1.6;
  border-radius: var(--radius-lg);
  background: var(--color-background-primary);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border-light);
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm);
  margin: var(--spacing-md) 0;
`;

export const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`;


export const StatItem = styled.div<{ $color: string; $alert?: boolean }>`
  background: var(--color-background-tertiary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border-left: 3px solid ${({ $color }) => $color};
  transition: var(--transition-fast);
  
  ${({ $alert }) => $alert && css`
    animation: ${pulse} 2s infinite;
    background: rgba(239, 68, 68, 0.05);
  `}
`;

export const StatLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
`;

export const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  font-family: var(--font-mono, 'Monaco', 'Courier New', monospace);
  color: var(--color-text-primary);
`;

export const RValue = styled.div<{ $value: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--font-mono, 'Monaco', 'Courier New', monospace);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin: var(--spacing-md) 0;
  transition: var(--transition-normal);
  
  background: ${({ $value }) => {
    if ($value < 1) return 'rgba(34, 197, 94, 0.05)';
    if ($value < 1.5) return 'rgba(251, 191, 36, 0.05)';
    return 'rgba(239, 68, 68, 0.05)';
  }};
  
  color: ${({ $value }) => {
    if ($value < 1) return '#10b981';
    if ($value < 1.5) return '#fbbf24';
    return '#ef4444';
  }};
  
  border: 2px solid ${({ $value }) => {
    if ($value < 1) return '#10b981';
    if ($value < 1.5) return '#fbbf24';
    return '#ef4444';
  }};
`;

export const ControlGrid = styled.div`
  display: grid;
  gap: var(--spacing-md);
`;

export const ControlRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

export const ControlLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ControlValue = styled.span`
  color: var(--color-text-primary);
  font-family: var(--font-mono, 'Monaco', 'Courier New', monospace);
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Slider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-background-tertiary);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary-500);
    cursor: pointer;
    transition: var(--transition-fast);
    
    &:hover {
      background: var(--color-primary-600);
      transform: scale(1.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary-500);
    cursor: pointer;
    border: none;
    transition: var(--transition-fast);
    
    &:hover {
      background: var(--color-primary-600);
      transform: scale(1.2);
    }
  }
`;

export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
`;

export const InterventionBtn = styled.button<{ $active: boolean; $color: string }>`
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid ${({ $active, $color }) => 
    $active ? $color : 'var(--color-border-light)'};
  background: ${({ $active, $color }) => 
    $active ? `${$color}15` : 'var(--color-background-tertiary)'};
  color: var(--color-text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  
  &:hover {
    background: ${({ $color }) => `${$color}20`};
    transform: translateY(-2px);
  }
  
  svg {
    color: ${({ $color }) => $color};
  }
`;

export const EventList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-background-tertiary);
    border-radius: var(--radius-full);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-border-medium);
    border-radius: var(--radius-full);
  }
`;

export const EventItem = styled.div<{ $type: 'info' | 'warning' | 'critical' | 'success' }>`
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  animation: ${slideUp} 0.3s ease;
  display: flex;
  gap: var(--spacing-sm);
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'rgba(251, 191, 36, 0.05)';
      case 'critical': return 'rgba(239, 68, 68, 0.05)';
      case 'success': return 'rgba(16, 185, 129, 0.05)';
      default: return 'var(--color-background-tertiary)';
    }
  }};
  
  border-left: 2px solid ${({ $type }) => {
    switch ($type) {
      case 'warning': return '#f59e0b';
      case 'critical': return '#dc2626';
      case 'success': return '#10b981';
      default: return 'var(--color-border-medium)';
    }
  }};
`;

export const EventTime = styled.span`
  color: var(--color-text-muted);
  font-family: var(--font-mono, 'Monaco', 'Courier New', monospace);
  min-width: 45px;
  font-size: 0.7rem;
`;

export const MutationIndicator = styled.div<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  background: ${({ $variant }) => {
    const colors: Record<string, string> = {
      'original': 'rgba(59, 130, 246, 0.1)',
      'alpha': 'rgba(139, 92, 246, 0.1)',
      'beta': 'rgba(236, 72, 153, 0.1)',
      'gamma': 'rgba(251, 191, 36, 0.1)',
      'delta': 'rgba(239, 68, 68, 0.1)',
      'omega': 'rgba(16, 185, 129, 0.1)'
    };
    return colors[$variant] || colors.original;
  }};
  color: ${({ $variant }) => {
    const colors: Record<string, string> = {
      'original': '#3b82f6',
      'alpha': '#8b5cf6',
      'beta': '#ec4899',
      'gamma': '#fbbf24',
      'delta': '#ef4444',
      'omega': '#10b981'
    };
    return colors[$variant] || colors.original;
  }};
`;

export const ChartContainer = styled.div`
  height: 180px;
  position: relative;
  margin-top: var(--spacing-md);
`;