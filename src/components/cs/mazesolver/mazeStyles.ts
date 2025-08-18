import styled, { keyframes, css } from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  overflow-x: hidden;
`;

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

export const Header = styled.header`
  background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 2px solid #3b82f6;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const BroadcastBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    animation: ${pulse} 2s infinite;
    color: #3b82f6;
  }
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0;
  text-transform: uppercase;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const RoundBadge = styled.span`
  background: rgba(59, 130, 246, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(59, 130, 246, 0.3);
`;

export const MainContainer = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section<{ $variant?: 'left' | 'center' | 'right' }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    order: ${({ $variant }) => {
      switch ($variant) {
        case 'center': return 0;
        case 'left': return 1;
        case 'right': return 2;
        default: return 0;
      }
    }};
  }
`;

export const Card = styled.div<{ $glow?: boolean; $interactive?: boolean }>`
  background: rgba(30, 30, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $glow }) => $glow && css`
    animation: ${glow} 3s infinite;
  `}
  
  ${({ $interactive }) => $interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      border-color: rgba(59, 130, 246, 0.5);
    }
  `}
`;

export const CardHeader = styled.div<{ $color?: string }>`
  background: ${({ $color }) => $color || 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'};
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CardContent = styled.div`
  padding: 1rem;
`;

export const ModeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem;
  border-radius: 10px;
`;

export const ModeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'transparent'};
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${({ $active }) => $active ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'rgba(59, 130, 246, 0.2)'};
  }
`;

export const TeamSelector = styled.label<{ $selected: boolean; $teamColor: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $selected, $teamColor }) => 
    $selected ? `${$teamColor}15` : 'transparent'};
  border-left: 3px solid ${({ $selected, $teamColor }) => 
    $selected ? $teamColor : 'transparent'};
  
  &:hover {
    background: ${({ $teamColor }) => `${$teamColor}10`};
  }
  
  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ $teamColor }) => $teamColor};
  }
`;

export const TeamBadge = styled.div<{ $color: string }>`
  width: 28px;
  height: 28px;
  background: ${({ $color }) => $color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

export const TrackCanvas = styled.canvas`
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: #0a0a0a;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  image-rendering: crisp-edges;
`;

export const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.5rem 1rem';
      case 'lg': return '0.875rem 1.75rem';
      default: return '0.625rem 1.5rem';
    }
  }};
  border-radius: 8px;
  font-weight: 600;
  font-size: ${({ $size = 'md' }) => {
    switch ($size) {
      case 'sm': return '0.875rem';
      case 'lg': return '1rem';
      default: return '0.9375rem';
    }
  }};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'secondary': return '#3b82f6';
      case 'danger': return '#dc2626';
      default: return '#10b981';
    }
  }};
  
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    filter: brightness(1.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LeaderboardItem = styled.div<{ $position: number; $teamColor: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 3px solid ${({ $teamColor }) => $teamColor};
  transition: all 0.2s;
  
  ${({ $position }) => $position === 0 && css`
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
  `}
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: translateX(4px);
  }
`;

export const FlagCounter = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

export const FlagIcon = styled.div<{ $collected: boolean }>`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $collected }) => $collected ? '#fbbf24' : '#475569'};
  transition: all 0.3s;
  
  ${({ $collected }) => $collected && css`
    animation: ${pulse} 0.5s ease;
  `}
`;

export const TelemetryBar = styled.div`
  height: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
`;

export const TelemetryFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => `${$percentage}%`};
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

export const Commentary = styled.div<{ $type: 'exciting' | 'normal' | 'critical' }>`
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  animation: ${slideIn} 0.3s ease;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'exciting': return 'rgba(251, 191, 36, 0.1)';
      case 'critical': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(71, 85, 105, 0.2)';
    }
  }};
  
  color: ${({ $type }) => {
    switch ($type) {
      case 'exciting': return '#fbbf24';
      case 'critical': return '#f87171';
      default: return '#cbd5e1';
    }
  }};
  
  border-left: 2px solid ${({ $type }) => {
    switch ($type) {
      case 'exciting': return '#f59e0b';
      case 'critical': return '#dc2626';
      default: return '#475569';
    }
  }};
`;

export const TimeDisplay = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 1px;
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
`;

export const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }
  
  span {
    font-size: 0.875rem;
    color: #94a3b8;
  }
`;

export const OddsItem = styled.div<{ $teamColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 2px solid ${({ $teamColor }) => $teamColor};
`;

export const OddsValue = styled.span`
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 700;
  color: #fbbf24;
  font-size: 0.9375rem;
`;