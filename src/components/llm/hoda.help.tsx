import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  X, Mic, MessageCircle, Search, Eye, Volume2, HelpCircle,
  ChevronDown, ChevronRight, Keyboard, Zap, Brain, Settings,
  Sparkles, BookOpen, Lightbulb, ArrowRight, Info, Play, Square
} from 'lucide-react';

// Enhanced animations for the help panel
const helpSlideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
`;

const statusPulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 20px rgba(var(--glow-color), 0.3);
  }
  50% { 
    transform: scale(1.02); 
    box-shadow: 0 0 30px rgba(var(--glow-color), 0.5);
  }
`;

const commandHover = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(4px); }
  100% { transform: translateX(0); }
`;

// Styled Components
const HelpPanelContainer = styled.div<{ $embedded?: boolean }>`
  position: fixed;
  z-index: 1001;
  
  ${({ $embedded }) => $embedded ? css`
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  ` : css`
    bottom: var(--spacing-xxl);
    right: calc(var(--spacing-xxl) + 80px);
    width: 400px;
    max-width: calc(100vw - 3rem);
  `}
  
  animation: ${helpSlideUp} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  @media (max-width: 768px) {
    ${({ $embedded }) => !$embedded && css`
      bottom: var(--spacing-lg);
      right: var(--spacing-lg);
      left: var(--spacing-lg);
      width: auto;
    `}
  }
  
  @media (max-width: 480px) {
    ${({ $embedded }) => !$embedded && css`
      bottom: 0;
      right: 0;
      left: 0;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    `}
  }
`;

const HelpPanelCard = styled.div<{ $embedded?: boolean; $professional?: boolean }>`
  background: ${({ $professional }) => 
    $professional 
      ? 'var(--glass-background)' 
      : 'var(--color-background-secondary)'
  };
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid ${({ $professional }) => 
    $professional 
      ? 'var(--glass-border)' 
      : 'var(--color-border-light)'
  };
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  width: ${({ $embedded }) => $embedded ? '100%' : 'auto'};
  max-width: ${({ $embedded }) => $embedded ? '1000px' : 'none'};
  max-height: ${({ $embedded }) => $embedded ? '90vh' : '600px'};
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const HeaderSection = styled.div<{ $status?: string }>`
  background: linear-gradient(135deg, 
    var(--color-primary-500) 0%, 
    var(--color-primary-600) 50%,
    #8b5cf6 100%
  );
  color: white;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    transform: translate(50%, -50%);
    pointer-events: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const AvatarIcon = styled.div<{ $status?: string; $pulse?: boolean }>`
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  
  ${({ $pulse, $status }) => $pulse && css`
    --glow-color: ${$status === 'listening' ? '34, 197, 94' : 
                    $status === 'processing' ? '139, 92, 246' : 
                    $status === 'speaking' ? '59, 130, 246' : '156, 163, 175'};
    animation: ${statusPulse} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }
`;

const HeaderTitle = styled.div`
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, white, rgba(255,255,255,0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    margin: var(--spacing-xs) 0 0 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const TabContainer = styled.div<{ $embedded?: boolean }>`
  display: ${({ $embedded }) => $embedded ? 'flex' : 'none'};
  background: var(--color-background-tertiary);
  border-bottom: 1px solid var(--color-border-light);
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: var(--spacing-lg);
  border: none;
  background: ${({ $active }) => $active ? 'var(--color-background-secondary)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)'};
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 3px solid ${({ $active }) => $active ? 'var(--color-primary-500)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  
  &:hover {
    background: ${({ $active }) => $active ? 'var(--color-background-secondary)' : 'rgba(0,0,0,0.05)'};
    color: ${({ $active }) => $active ? 'var(--color-primary-500)' : 'var(--color-text-primary)'};
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: -2px;
  }
`;

const ContentSection = styled.div<{ $embedded?: boolean; $professional?: boolean }>`
  padding: var(--spacing-xl);
  max-height: ${({ $embedded }) => $embedded ? '400px' : '500px'};
  overflow-y: auto;
  background: ${({ $professional }) => 
    $professional 
      ? 'linear-gradient(135deg, var(--color-background-primary), var(--color-background-tertiary))'
      : 'var(--color-background-secondary)'
  };
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-background-tertiary);
    border-radius: var(--radius-full);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-primary-500);
    border-radius: var(--radius-full);
  }
`;

const StatusCard = styled.div<{ $status?: string; $pulse?: boolean; $professional?: boolean }>`
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  background: ${({ $status, $professional }) => {
    if ($professional) return 'var(--glass-background)';
    
    switch ($status) {
      case 'listening': return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))';
      case 'processing': return 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))';
      case 'speaking': return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))';
      case 'error': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
      default: return 'var(--color-background-tertiary)';
    }
  }};
  border: 2px solid ${({ $status }) => {
    switch ($status) {
      case 'listening': return 'rgba(34, 197, 94, 0.3)';
      case 'processing': return 'rgba(139, 92, 246, 0.3)';
      case 'speaking': return 'rgba(59, 130, 246, 0.3)';
      case 'error': return 'rgba(239, 68, 68, 0.3)';
      default: return 'var(--color-border-medium)';
    }
  }};
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  ${({ $pulse, $status }) => $pulse && css`
    --glow-color: ${$status === 'listening' ? '34, 197, 94' : 
                    $status === 'processing' ? '139, 92, 246' : 
                    $status === 'speaking' ? '59, 130, 246' : '156, 163, 175'};
    animation: ${statusPulse} 2s ease-in-out infinite;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    pointer-events: none;
  }
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 2;
`;

const StatusIcon = styled.div<{ $status?: string; $pulse?: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $status }) => {
    switch ($status) {
      case 'listening': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'processing': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'speaking': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  
  ${({ $pulse }) => $pulse && css`
    animation: ${statusPulse} 1.5s ease-in-out infinite;
  `}
`;

const StatusText = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const StopButton = styled.button`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg);
  }
  
  &:focus {
    outline: 2px solid #fca5a5;
    outline-offset: 2px;
  }
`;

const ContextBanner = styled.div`
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0 0 var(--spacing-lg) 0;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  
  .page-type {
    text-transform: capitalize;
    background: rgba(255, 255, 255, 0.2);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
  }
  
  .page-title {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CommandGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CommandCard = styled.button<{ $priority?: number; $professional?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: ${({ $professional }) => 
    $professional 
      ? 'var(--glass-background)' 
      : 'var(--color-background-secondary)'
  };
  border: 1px solid ${({ $professional }) => 
    $professional 
      ? 'var(--glass-border)' 
      : 'var(--color-border-light)'
  };
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  backdrop-filter: ${({ $professional }) => $professional ? 'blur(10px)' : 'none'};
  
  ${({ $priority }) => $priority === 1 && css`
    border-color: var(--color-primary-500);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.02));
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-500);
    
    &::before {
      left: 100%;
    }
    
    .command-icon {
      transform: scale(1.1);
    }
    
    .command-text {
      animation: ${commandHover} 0.6s ease;
    }
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const CommandIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const CommandContent = styled.div`
  flex: 1;
  min-width: 0;
  
  .command-text {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary-500);
    margin: 0 0 var(--spacing-xs) 0;
    transition: all var(--transition-fast);
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
  
  .command-desc {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
`;

const PlayIcon = styled.div`
  width: 32px;
  height: 32px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-500);
  transition: all var(--transition-fast);
  flex-shrink: 0;
`;

const ShowMoreButton = styled.button`
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  border: 1px dashed var(--color-primary-500);
  color: var(--color-primary-500);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
  margin-top: var(--spacing-md);
  
  &:hover {
    background: rgba(79, 70, 229, 0.05);
    border-style: solid;
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const StepCard = styled.div<{ $professional?: boolean }>`
  text-align: center;
  padding: var(--spacing-xl);
  background: ${({ $professional }) => 
    $professional 
      ? 'var(--glass-background)' 
      : 'var(--color-background-tertiary)'
  };
  border: 1px solid ${({ $professional }) => 
    $professional 
      ? 'var(--glass-border)' 
      : 'var(--color-border-light)'
  };
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  backdrop-filter: ${({ $professional }) => $professional ? 'blur(10px)' : 'none'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary-500);
  }
  
  .step-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--spacing-lg) auto;
    color: white;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
  }
  
  &:hover .step-icon {
    transform: scale(1.1) rotate(5deg);
  }
  
  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
    font-weight: 700;
  }
  
  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const InfoSection = styled.div<{ $type: 'tips' | 'accessibility' }>`
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  background: ${({ $type }) => 
    $type === 'tips' 
      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
  };
  border: 1px solid ${({ $type }) => 
    $type === 'tips' 
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(59, 130, 246, 0.3)'
  };
  border-radius: var(--radius-xl);
  
  .info-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    
    .info-icon {
      width: 48px;
      height: 48px;
      background: ${({ $type }) => 
        $type === 'tips' 
          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
          : 'linear-gradient(135deg, #3b82f6, #2563eb)'
      };
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: var(--shadow-md);
    }
    
    h4 {
      margin: 0;
      color: ${({ $type }) => 
        $type === 'tips' ? '#d97706' : '#2563eb'
      };
      font-weight: 700;
      font-size: 1.125rem;
    }
  }
  
  .tip-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    
    li {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      
      .tip-number {
        width: 28px;
        height: 28px;
        background: ${({ $type }) => 
          $type === 'tips' 
            ? 'rgba(245, 158, 11, 0.2)'
            : 'rgba(59, 130, 246, 0.2)'
        };
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${({ $type }) => 
          $type === 'tips' ? '#d97706' : '#2563eb'
        };
        font-weight: 700;
        font-size: 0.875rem;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      span {
        color: ${({ $type }) => 
          $type === 'tips' ? '#92400e' : '#1e40af'
        };
        line-height: 1.6;
      }
    }
  }
  
  .info-text {
    color: ${({ $type }) => 
      $type === 'tips' ? '#92400e' : '#1e40af'
    };
    line-height: 1.6;
    margin: 0;
  }
`;

const FooterSection = styled.div<{ $professional?: boolean }>`
  padding: var(--spacing-lg);
  background: ${({ $professional }) => 
    $professional 
      ? 'var(--color-background-tertiary)' 
      : 'linear-gradient(135deg, var(--color-background-secondary), var(--color-background-tertiary))'
  };
  border-top: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
      
      &.ready {
        background: #10b981;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
      }
      
      &.loading {
        background: #6b7280;
      }
      
      &.listening {
        background: #10b981;
        animation: ${statusPulse} 1s ease-in-out infinite;
      }
    }
    
    span {
      color: var(--color-text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
    }
  }
  
  .shortcut-hint {
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    font-weight: 600;
  }
`;

interface HodaHelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hodaController?: any;
  currentPage?: string;
  onExecuteCommand?: (command: string) => void;
  embedded?: boolean;
  accessibilityMode?: boolean;
  status?: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  aiModelLoaded?: boolean;
  isReady?: boolean;
  reduceMotion?: boolean;
  professionalMode?: boolean;
}

const HodaHelpPanel: React.FC<HodaHelpPanelProps> = ({
  isOpen,
  onClose,
  hodaController,
  currentPage,
  onExecuteCommand,
  embedded = false,
  accessibilityMode = false,
  status = 'idle',
  aiModelLoaded = false,
  isReady = true,
  reduceMotion = false,
  professionalMode = false
}) => {
  const [showMore, setShowMore] = useState(false);
  const [pageContext, setPageContext] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'quick-start' | 'commands' | 'tips'>('quick-start');

  useEffect(() => {
    if (isOpen) {
      const context = analyzeCurrentPage();
      setPageContext(context);
    }
  }, [isOpen]);

  const analyzeCurrentPage = () => {
    const url = window.location.href;
    const title = document.title;
    const hasSearch = !!document.querySelector('input[type="search"], [role="search"], input[name*="search"], input[placeholder*="search" i]');
    const hasForm = !!document.querySelector('form');
    const hasNavigation = !!document.querySelector('nav, [role="navigation"]');
    const hasMain = !!document.querySelector('main, [role="main"]');
    const hasButtons = document.querySelectorAll('button, [role="button"]').length;
    const hasArticle = !!document.querySelector('article, [role="article"]');

    let pageType = 'webpage';
    if (hasForm && !hasArticle) pageType = 'form';
    else if (hasArticle) pageType = 'article';
    else if (url.includes('login') || url.includes('signin')) pageType = 'login';
    else if (url.includes('search') || hasSearch) pageType = 'search';

    return { title, pageType, hasSearch, hasForm, hasNavigation, hasMain, hasButtons, hasArticle };
  };

  const getContextualCommands = () => {
    if (!pageContext) return [];

    const baseCommands = [
      { text: "What's on this page?", icon: Eye, desc: "Get page overview", priority: 1 },
      { text: "Help me navigate", icon: HelpCircle, desc: "Show navigation options", priority: 1 }
    ];

    const contextCommands = [];
    if (pageContext.hasSearch) {
      contextCommands.push({ text: "Find the search box", icon: Search, desc: "Locate search", priority: 2 });
    }
    if (pageContext.hasForm) {
      contextCommands.push({ text: "Help me fill this form", icon: MessageCircle, desc: "Form assistance", priority: 2 });
    }
    if (pageContext.hasArticle) {
      contextCommands.push({ text: "Read this article", icon: Volume2, desc: "Audio reading", priority: 2 });
      contextCommands.push({ text: "Summarize this content", icon: Brain, desc: "Get key points", priority: 3 });
    }
    if (pageContext.hasButtons > 3) {
      contextCommands.push({ text: "Show me all buttons", icon: Eye, desc: "Highlight clickable items", priority: 3 });
    }
    if (pageContext.hasNavigation) {
      contextCommands.push({ text: "Where can I go from here?", icon: MessageCircle, desc: "Navigation options", priority: 3 });
    }

    contextCommands.push({ text: "Read the main content", icon: Volume2, desc: "Audio content", priority: 3 });

    return [...baseCommands, ...contextCommands].sort((a, b) => a.priority - b.priority);
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'listening':
        return { 
          text: "Listening...", 
          subText: "I'm ready to hear you speak",
          icon: Mic,
          pulse: true
        };
      case 'processing':
        return { 
          text: "Processing...", 
          subText: "Understanding your request",
          icon: Brain,
          pulse: false
        };
      case 'speaking':
        return { 
          text: "Speaking...", 
          subText: "Playing audio response",
          icon: Volume2,
          pulse: true
        };
      case 'error':
        return { 
          text: "Error", 
          subText: "Something went wrong",
          icon: X,
          pulse: false
        };
      default:
        return { 
          text: "Ready", 
          subText: "Press Space to start talking",
          icon: Mic,
          pulse: false
        };
    }
  };

  const handleCommandClick = (command: string) => {
    if (onExecuteCommand) {
      onExecuteCommand(command);
      if (!embedded && !accessibilityMode) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const commands = getContextualCommands();
  const statusInfo = getStatusInfo();
  const isEmbedded = embedded || accessibilityMode;

  return (
    <HelpPanelContainer $embedded={isEmbedded}>
      <HelpPanelCard $embedded={isEmbedded} $professional={professionalMode}>
        <HeaderSection $status={status}>
          <HeaderContent>
            <HeaderLeft>
              <AvatarIcon $status={status} $pulse={statusInfo.pulse && !reduceMotion}>
                <Sparkles size={28} />
              </AvatarIcon>
              <HeaderTitle>
                <h3>HODA Voice Assistant</h3>
                <p>
                  {aiModelLoaded && (
                    <>
                      <Brain size={14} />
                      AI Enhanced •
                    </>
                  )}
                  Your web navigation companion
                </p>
              </HeaderTitle>
            </HeaderLeft>
            <CloseButton onClick={onClose} aria-label="Close help panel">
              <X size={20} />
            </CloseButton>
          </HeaderContent>
        </HeaderSection>

        {isEmbedded && (
          <TabContainer $embedded={isEmbedded}>
            {[
              { id: 'quick-start', label: 'Getting Started', icon: Zap },
              { id: 'commands', label: 'Commands', icon: Mic },
              { id: 'tips', label: 'Tips & Help', icon: Lightbulb }
            ].map(tab => (
              <TabButton
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon size={18} />
                {tab.label}
              </TabButton>
            ))}
          </TabContainer>
        )}

        <ContentSection $embedded={isEmbedded} $professional={professionalMode}>
          {(!isEmbedded || activeTab === 'quick-start') && (
            <>
              <StatusCard 
                $status={status} 
                $pulse={statusInfo.pulse && !reduceMotion}
                $professional={professionalMode}
              >
                <StatusContent>
                  <StatusIcon $status={status} $pulse={statusInfo.pulse && !reduceMotion}>
                    <statusInfo.icon size={28} />
                  </StatusIcon>
                  <StatusText>
                    <h4>{statusInfo.text}</h4>
                    <p>{statusInfo.subText}</p>
                    {status === 'idle' && (
                      <p>Just speak naturally - no special commands needed</p>
                    )}
                  </StatusText>
                  {status === 'speaking' && (
                    <StopButton
                      onClick={() => onExecuteCommand && onExecuteCommand('stop')}
                      aria-label="Stop speaking"
                    >
                      <Square size={16} />
                    </StopButton>
                  )}
                </StatusContent>
              </StatusCard>

              {isEmbedded && (
                <StepsGrid>
                  {[
                    { title: "Activate", desc: "Press spacebar or click microphone", icon: Keyboard },
                    { title: "Speak", desc: "Use natural, conversational language", icon: MessageCircle },
                    { title: "Get Help", desc: "Receive voice and visual guidance", icon: HelpCircle }
                  ].map((step, index) => (
                    <StepCard key={index} $professional={professionalMode}>
                      <div className="step-icon">
                        <step.icon size={24} />
                      </div>
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </StepCard>
                  ))}
                </StepsGrid>
              )}
            </>
          )}

          {(!isEmbedded || activeTab === 'commands') && (
            <>
              {pageContext && (
                <ContextBanner>
                  <div>
                    Page detected: <span className="page-type">{pageContext.pageType}</span>
                  </div>
                  <div className="page-title">
                    {pageContext.title?.slice(0, 30) + (pageContext.title?.length > 30 ? '...' : '')}
                  </div>
                </ContextBanner>
              )}

              <CommandGrid>
                {commands.slice(0, showMore ? commands.length : (isEmbedded ? commands.length : 3)).map((cmd, index) => (
                  <CommandCard
                    key={index}
                    disabled={!isReady || status === 'processing'}
                    onClick={() => handleCommandClick(cmd.text)}
                    $priority={cmd.priority}
                    $professional={professionalMode}
                  >
                    <CommandIcon className="command-icon">
                      <cmd.icon size={20} />
                    </CommandIcon>
                    <CommandContent>
                      <p className="command-text">"{cmd.text}"</p>
                      <p className="command-desc">{cmd.desc}</p>
                    </CommandContent>
                    <PlayIcon>
                      <Play size={16} />
                    </PlayIcon>
                  </CommandCard>
                ))}
              </CommandGrid>

              {!isEmbedded && commands.length > 3 && (
                <ShowMoreButton onClick={() => setShowMore(!showMore)}>
                  {showMore ? 'Show less' : `${commands.length - 3} more commands`}
                  {showMore ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </ShowMoreButton>
              )}
            </>
          )}

          {isEmbedded && activeTab === 'tips' && (
            <>
              <InfoSection $type="tips">
                <div className="info-header">
                  <div className="info-icon">
                    <Lightbulb size={24} />
                  </div>
                  <h4>Tips for Better Results</h4>
                </div>
                <ul className="tip-list">
                  {[
                    'Speak clearly and at a normal pace',
                    'Be specific: "Click the login button" vs just "login"',
                    'Use natural language - no commands to memorize',
                    'Press Escape to stop HODA at any time'
                  ].map((tip, index) => (
                    <li key={index}>
                      <div className="tip-number">{index + 1}</div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </InfoSection>

              <InfoSection $type="accessibility">
                <div className="info-header">
                  <div className="info-icon">
                    <Info size={24} />
                  </div>
                  <h4>Accessibility Features</h4>
                </div>
                <p className="info-text">
                  HODA works seamlessly with screen readers and keyboard navigation. 
                  All features remain accessible through traditional methods while adding 
                  voice capabilities to enhance your browsing experience.
                </p>
              </InfoSection>
            </>
          )}
        </ContentSection>

        <FooterSection $professional={professionalMode}>
          <div className="status-indicator">
            <div className={`status-dot ${isReady ? (status === 'listening' ? 'listening' : 'ready') : 'loading'}`}></div>
            <span>
              {isReady ? (aiModelLoaded ? 'AI Enhanced Mode' : 'Ready') : 'Loading...'}
            </span>
          </div>
          <div className="shortcut-hint">
            {isEmbedded ? 'Alt+H' : 'Space = Talk'}
          </div>
        </FooterSection>
      </HelpPanelCard>
    </HelpPanelContainer>
  );
};

export default HodaHelpPanel;