// src/components/llm/hoda.avatar
'use client';

import React from 'react';
import styled, { css, keyframes } from 'styled-components';

import {
  HodaTheme,
  getDanceAnimation,
  focusIndicator,
  getStatusColor,
  professionalStyling,
} from './hoda.styles';

type AssistantStatus = 'idle' | 'loading' | 'listening' | 'processing' | 'speaking' | 'error';
type DanceMove = 'bounce' | 'pulse' | 'shimmer' | 'glow' | 'wave' | 'moonwalk' | 'griddy' | 'naynay' | 'none';

/* NOTE: removed `export` here to avoid duplicate-export conflict; exported at bottom instead */
interface AvatarProps {
  size?: number;
  status?: AssistantStatus;
  danceMove?: DanceMove;
  showStatusIndicator?: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  announceStatusChanges?: boolean;
  reduceMotion?: boolean;
  professionalMode?: boolean;
}

/* ---------------------------
   Keyframes (used by CSS in SVG)
   --------------------------- */
const listeningPulse = keyframes`0%,100%{ transform: scale(1); filter: brightness(1);} 50%{ transform: scale(1.05); filter: brightness(1.1);} `;
const processingRotate = keyframes`0%{ transform: rotate(0deg);} 100%{ transform: rotate(360deg);} `;
const speakingBounce = keyframes`0%,20%,50%,80%,100%{ transform: translateY(0);} 40%{ transform: translateY(-4px);} 60%{ transform: translateY(-2px);} `;
const floatingMotion = keyframes`0%,100%{ transform: translateY(0px) rotate(0deg);} 25%{ transform: translateY(-2px) rotate(0.5deg);} 50%{ transform: translateY(-4px) rotate(0deg);} 75%{ transform: translateY(-2px) rotate(-0.5deg);} `;
const breathingAnimation = keyframes`0%,100%{ transform: scale(1);} 50%{ transform: scale(1.02);} `;

/* ---------------------------
   Styled components
   --------------------------- */
const AvatarContainer = styled.div<{
  $size: number;
  $status: AssistantStatus;
  $danceMove: DanceMove;
  $clickable: boolean;
  $professionalMode: boolean;
  $reduceMotion: boolean;
}>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  position: relative;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  display: inline-block;
  border-radius: 50%;
  background: ${({ $professionalMode }) =>
    $professionalMode ? 'var(--glass-background)' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid
    ${({ $professionalMode, $status }) => ($professionalMode ? 'var(--glass-border)' : $status !== 'idle' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)')};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all var(--transition-normal);
  transform-origin: center center;
  overflow: hidden;

  --glow-color: ${({ $status }) => {
    switch ($status) {
      case 'listening':
        return '16, 185, 129';
      case 'processing':
        return '139, 92, 246';
      case 'speaking':
        return '59, 130, 246';
      case 'error':
        return '239, 68, 68';
      default:
        return '251, 191, 36';
    }
  }};

  ${({ $status, $reduceMotion }) =>
    $reduceMotion
      ? css`animation: ${floatingMotion} 0s;`
      : $status === 'listening'
      ? css`animation: ${listeningPulse} 2s ease-in-out infinite, ${floatingMotion} 6s ease-in-out infinite;`
      : $status === 'processing'
      ? css`animation: ${breathingAnimation} 1.5s ease-in-out infinite;`
      : $status === 'speaking'
      ? css`animation: ${speakingBounce} 0.6s ease-in-out infinite;`
      : css`animation: ${floatingMotion} 8s ease-in-out infinite;`}

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: ${({ $status }) => ($status === 'processing' ? 'conic-gradient(from 0deg, transparent, var(--color-primary-500), transparent)' : 'none')};
    opacity: ${({ $status, $reduceMotion }) => ($status === 'processing' && !$reduceMotion ? 1 : 0)};
    transition: opacity var(--transition-normal);
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 70%);
    pointer-events: none;
    transition: opacity var(--transition-normal);
    opacity: 0.6;
  }

  ${({ $danceMove, $reduceMotion, $professionalMode }) => getDanceAnimation($danceMove, $reduceMotion, $professionalMode)}

  ${({ $clickable, $status }) =>
    $clickable &&
    css`
      ${focusIndicator(getStatusColor($status))}
      &:focus {
        transform: scale(1.05);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(var(--glow-color), 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        filter: brightness(1.1);
      }
      &:hover {
        transform: scale(1.03);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(var(--glow-color), 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        border-color: rgba(var(--glow-color), 0.5);
        filter: brightness(1.05);
      }
      &:active {
        transform: scale(0.98);
        filter: brightness(0.95);
      }
    `}

  ${({ $professionalMode }) => professionalStyling($professionalMode)}

  &.fixed-position {
    position: fixed;
    bottom: var(--spacing-xxl);
    right: var(--spacing-xxl);
    z-index: 1000;
  }
`;

const AvatarSVG = styled.svg<{ $status: AssistantStatus; $professional: boolean }>`
  width: 100%;
  height: 100%;
  display: block;
  transition: filter var(--transition-normal);
  filter: ${({ $status }) => {
    switch ($status) {
      case 'listening':
        return 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))';
      case 'processing':
        return 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))';
      case 'speaking':
        return 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))';
      case 'error':
        return 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.3))';
      default:
        return 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.3))';
    }
  }};
`;

const StatusIndicatorContainer = styled.div<{
  $status: AssistantStatus;
  $size: number;
  $reduceMotion: boolean;
}>`
  position: absolute;
  top: -2px;
  right: -2px;
  width: ${({ $size }) => Math.max(16, $size * 0.25)}px;
  height: ${({ $size }) => Math.max(16, $size * 0.25)}px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'listening':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'processing':
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'speaking':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'loading':
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
      default:
        return 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
    }
  }};
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  svg {
    width: 60%;
    height: 60%;
    color: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  ${({ $status, $reduceMotion }) =>
    $reduceMotion
      ? ''
      : $status === 'listening'
      ? css`animation: ${listeningPulse} 2s ease-in-out infinite;`
      : $status === 'processing'
      ? css`animation: ${processingRotate} 2s linear infinite;`
      : $status === 'speaking'
      ? css`animation: ${speakingBounce} 0.6s ease-in-out infinite;`
      : ''}
`;

const StatusRipple = styled.div<{ $status: AssistantStatus; $reduceMotion: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140%;
  height: 140%;
  border-radius: 50%;
  border: 2px solid ${({ $status }) => getStatusColor($status)};
  opacity: 0;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: none;
  animation: ${({ $reduceMotion }) => ($reduceMotion ? 'none' : `${keyframes`
    0% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
    100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
  `} 2s ease-out infinite`)};
`;

/* ---------------------------
   Helpers
   --------------------------- */
const getStatusMessage = (status: AssistantStatus): string => {
  switch (status) {
    case 'listening':
      return 'HODA is listening';
    case 'speaking':
      return 'HODA is speaking';
    case 'processing':
      return 'HODA is processing your request';
    case 'error':
      return 'HODA encountered an error';
    case 'loading':
      return 'HODA is loading';
    default:
      return 'HODA is ready';
  }
};

const getAngelExpression = (status: AssistantStatus) => {
  switch (status) {
    case 'listening':
      return {
        leftEye: <circle cx="55" cy="37" r="2" fill="#4f46e5" opacity="0.9" />,
        rightEye: <circle cx="65" cy="37" r="2" fill="#4f46e5" opacity="0.9" />,
        mouth: <circle cx="60" cy="45" r="1.5" fill="#4f46e5" opacity="0.8" />,
      };
    case 'speaking':
      return {
        leftEye: <circle cx="55" cy="37" r="2.5" fill="#3b82f6" opacity="0.9" />,
        rightEye: <circle cx="65" cy="37" r="2.5" fill="#3b82f6" opacity="0.9" />,
        mouth: <ellipse cx="60" cy="45" rx="4" ry="3" fill="#3b82f6" opacity="0.7" />,
      };
    case 'processing':
      return {
        leftEye: <circle cx="55" cy="37" r="2" fill="#8b5cf6" opacity="0.8" />,
        rightEye: <circle cx="65" cy="37" r="2" fill="#8b5cf6" opacity="0.8" />,
        mouth: <path d="M57 44 Q60 47 63 44" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />,
      };
    case 'error':
      return {
        leftEye: <path d="M53 35 Q55 33 57 35" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />,
        rightEye: <path d="M63 35 Q65 33 67 35" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />,
        mouth: <path d="M57 47 L63 47" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />,
      };
    default:
      return {
        leftEye: <circle cx="55" cy="37" r="2" fill="#6b7280" opacity="0.8" />,
        rightEye: <circle cx="65" cy="37" r="2" fill="#6b7280" opacity="0.8" />,
        mouth: <path d="M57 43 Q60 46 63 43" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />,
      };
  }
};

/* ---------------------------
   Avatar component
   --------------------------- */
const Avatar: React.FC<AvatarProps> = ({
  size = 48,
  status = 'idle',
  danceMove = 'none',
  showStatusIndicator = true,
  onClick,
  className,
  ariaLabel,
  announceStatusChanges = true,
  reduceMotion = false,
  professionalMode = false,
}) => {
  const uniqueId = React.useId();
  const [prevStatus, setPrevStatus] = React.useState<AssistantStatus>(status);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Initialize with system preference if available
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return reduceMotion;
    try {
      return !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return reduceMotion;
    }
  });

  /* ---------------------------
     Listen for changes to prefers-reduced-motion safely
     - we cast to `any` only when calling legacy .addListener/.removeListener
     - `mq` typed as MediaQueryList | null, so TS knows it's not `never`
     --------------------------- */
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mq: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(!!e.matches);
    };

    // Modern (addEventListener) first, then legacy fallback
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
    } else if (typeof (mq as any).addListener === 'function') {
      // legacy TS DOM types sometimes don't include addListener — cast to any to call it
      (mq as any).addListener(handler as any);
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handler);
      } else if (typeof (mq as any).removeListener === 'function') {
        (mq as any).removeListener(handler as any);
      }
    };
  }, []);

  // Announce status changes via in-component live region
  const [liveMessage, setLiveMessage] = React.useState('');
  React.useEffect(() => {
    if (!announceStatusChanges) return;
    if (status !== prevStatus) {
      setLiveMessage(getStatusMessage(status));
      setPrevStatus(status);
      const t = setTimeout(() => setLiveMessage(''), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, announceStatusChanges]);

  const handleKeyPress = (ev: React.KeyboardEvent) => {
    if (!onClick) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      onClick();
    }
  };

  const expression = getAngelExpression(status);

  return (
    <AvatarContainer
      $size={size}
      $status={status}
      $danceMove={prefersReducedMotion ? 'none' : danceMove}
      $clickable={!!onClick}
      $professionalMode={professionalMode}
      $reduceMotion={prefersReducedMotion || reduceMotion}
      onClick={onClick}
      onKeyDown={handleKeyPress}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={className}
      role={onClick ? 'button' : 'img'}
      aria-label={ariaLabel || getStatusMessage(status)}
      aria-describedby={`${uniqueId}-desc`}
      tabIndex={onClick ? 0 : -1}
    >
      <div id={`${uniqueId}-desc`} style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        {`HODA angel assistant avatar. Current status: ${status}. ${onClick ? 'Press Enter or Space to interact.' : ''} ${
          prefersReducedMotion ? 'Animations reduced.' : ''
        }`}
      </div>

      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        {liveMessage}
      </div>

      <AvatarSVG viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" $status={status} $professional={professionalMode}>
        <style>{`
          @keyframes wingFlutter { 0% { transform: rotate(0deg);} 25% { transform: rotate(-6deg);} 50% { transform: rotate(0deg);} 75% { transform: rotate(6deg);} 100% { transform: rotate(0deg);} }
          @keyframes haloGlow { 0% { transform: scale(1); opacity: 0.9;} 50% { transform: scale(1.08); opacity: 1;} 100% { transform: scale(1); opacity: 0.9;} }
          @keyframes sparkleFloat { 0% { transform: translateY(0px) scale(1); opacity: 0.9;} 50% { transform: translateY(-6px) scale(1.1); opacity: 1;} 100% { transform: translateY(0px) scale(1); opacity: 0.9;} }
        `}</style>

        <defs>
          <linearGradient id={`${uniqueId}-colorCycle`}>
            <stop offset="0%" stopColor="#fbbf24">
              {!prefersReducedMotion && <animate attributeName="stop-color" values="#fbbf24;#f43f5e;#8b5cf6;#3b82f6;#10b981;#f59e0b;#fbbf24" dur="8s" repeatCount="indefinite" />}
            </stop>
          </linearGradient>

          <radialGradient id={`${uniqueId}-bodyGradient`} cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="70%" stopColor="rgba(248,250,252,0.95)" />
            <stop offset="100%" stopColor="rgba(241,245,249,0.9)" />
          </radialGradient>

          <radialGradient id={`${uniqueId}-wingGradient`} cx="0.2" cy="0.2" r="0.8">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="50%" stopColor="rgba(248,250,252,0.7)" />
            <stop offset="100%" stopColor="rgba(241,245,249,0.5)" />
          </radialGradient>

          <filter id={`${uniqueId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`${uniqueId}-softGlow`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="60" cy="60" r="58" fill={`url(#${uniqueId}-bodyGradient)`} opacity="0.1" />

        <g opacity="0.9" transform={`translate(0,0)`}>
          <ellipse
            cx="35"
            cy="55"
            rx="12"
            ry="20"
            fill={`url(#${uniqueId}-wingGradient)`}
            stroke={`url(#${uniqueId}-colorCycle)`}
            strokeWidth="0.5"
            strokeOpacity="0.3"
            transform="rotate(-15 35 55)"
            filter={`url(#${uniqueId}-softGlow)`}
            className="left-wing"
            style={{ transformOrigin: '35px 55px', animation: prefersReducedMotion ? 'none' : 'wingFlutter 3s ease-in-out infinite' }}
          />

          <ellipse
            cx="85"
            cy="55"
            rx="12"
            ry="20"
            fill={`url(#${uniqueId}-wingGradient)`}
            stroke={`url(#${uniqueId}-colorCycle)`}
            strokeWidth="0.5"
            strokeOpacity="0.3"
            transform="rotate(15 85 55)"
            filter={`url(#${uniqueId}-softGlow)`}
            className="right-wing"
            style={{ transformOrigin: '85px 55px', animation: prefersReducedMotion ? 'none' : 'wingFlutter 3s ease-in-out infinite 0.5s' }}
          />
        </g>

        <ellipse cx="60" cy="65" rx="18" ry="25" fill={`url(#${uniqueId}-bodyGradient)`} stroke={professionalMode ? 'var(--color-primary-300)' : `url(#${uniqueId}-colorCycle)`} strokeWidth="1" strokeOpacity="0.4" filter={status !== 'idle' ? `url(#${uniqueId}-glow)` : undefined} />
        <circle cx="60" cy="40" r="15" fill={`url(#${uniqueId}-bodyGradient)`} stroke={professionalMode ? 'var(--color-primary-300)' : `url(#${uniqueId}-colorCycle)`} strokeWidth="1" strokeOpacity="0.4" />

        <ellipse
          cx="60"
          cy="25"
          rx="8"
          ry="3"
          fill="none"
          stroke={professionalMode ? 'var(--color-primary-400)' : `url(#${uniqueId}-colorCycle)`}
          strokeWidth="2"
          opacity="0.8"
          style={{ animation: prefersReducedMotion ? 'none' : 'haloGlow 2s ease-in-out infinite' }}
        />
        <ellipse cx="60" cy="25" rx="6" ry="2" fill={`url(#${uniqueId}-colorCycle)`} opacity="0.3" style={{ animation: prefersReducedMotion ? 'none' : 'haloGlow 2s ease-in-out infinite 0.5s' }} />

        <g>
          {expression.leftEye}
          {expression.rightEye}
          <circle cx="55" cy="36" r="0.8" fill="white" opacity="0.9" />
          <circle cx="65" cy="36" r="0.8" fill="white" opacity="0.9" />
          {expression.mouth}
          <circle cx="48" cy="40" r="3" fill={`url(#${uniqueId}-colorCycle)`} opacity="0.15" />
          <circle cx="72" cy="40" r="3" fill={`url(#${uniqueId}-colorCycle)`} opacity="0.15" />
        </g>

        <g opacity="0.8">
          {[
            { x: 20, y: 30, delay: '0s', size: 1 },
            { x: 100, y: 35, delay: '1s', size: 0.8 },
            { x: 25, y: 80, delay: '2s', size: 1.2 },
            { x: 95, y: 75, delay: '3s', size: 0.9 },
            { x: 15, y: 60, delay: '4s', size: 0.7 },
            { x: 105, y: 50, delay: '5s', size: 1.1 },
          ].map((sparkle, i) => (
            <polygon
              key={i}
              points={`${sparkle.x},${sparkle.y - sparkle.size * 2} ${sparkle.x + sparkle.size},${sparkle.y} ${sparkle.x + sparkle.size * 3},${sparkle.y} ${sparkle.x + sparkle.size},${sparkle.y + sparkle.size} ${sparkle.x + sparkle.size * 2},${sparkle.y + sparkle.size * 4} ${sparkle.x},${sparkle.y + sparkle.size * 2} ${sparkle.x - sparkle.size * 2},${sparkle.y + sparkle.size * 4} ${sparkle.x - sparkle.size},${sparkle.y + sparkle.size} ${sparkle.x - sparkle.size * 3},${sparkle.y} ${sparkle.x - sparkle.size},${sparkle.y}`}
              fill={`url(#${uniqueId}-colorCycle)`}
              opacity="0.6"
              style={{
                transformOrigin: `${sparkle.x}px ${sparkle.y}px`,
                animation: prefersReducedMotion ? 'none' : `sparkleFloat 4s ease-in-out infinite ${sparkle.delay}`,
              }}
            />
          ))}
        </g>

        <g transform="translate(60,105)">
          <rect x="-24" y="-9" width="48" height="18" rx="9" fill={professionalMode ? 'rgba(248,250,252,0.95)' : 'rgba(255,255,255,0.95)'} stroke={professionalMode ? 'var(--color-primary-500)' : `url(#${uniqueId}-colorCycle)`} strokeWidth="1" strokeOpacity="0.6" filter={`url(#${uniqueId}-softGlow)`} />
          <text x="0" y="2" fontSize="11" textAnchor="middle" fill={professionalMode ? 'var(--color-primary-700)' : '#374151'} fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
            HODA
          </text>
        </g>

        {!prefersReducedMotion && <animateTransform attributeName="transform" type="translate" values="0,0;0,-1;0,0;0,1;0,0" dur="6s" repeatCount="indefinite" />}
      </AvatarSVG>

      {showStatusIndicator && status !== 'idle' && (
        <StatusIndicatorContainer $status={status} $size={size} $reduceMotion={prefersReducedMotion || reduceMotion}>
          {status === 'listening' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <path d="M12 19v3" />
            </svg>
          ) : status === 'processing' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" />
              <path d="M12 6a6 6 0 0 1 6 6" />
            </svg>
          ) : status === 'speaking' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            </svg>
          ) : status === 'error' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M15 9 9 15" />
              <path d="M9 9l6 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
            </svg>
          )}

          {!prefersReducedMotion && status === 'listening' && <StatusRipple $status={status} $reduceMotion={prefersReducedMotion || reduceMotion} />}
        </StatusIndicatorContainer>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-background-primary)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
          opacity: showTooltip ? 1 : 0,
          pointerEvents: 'none',
          transition: 'all var(--transition-fast)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 20,
        }}
      >
        {getStatusMessage(status)}
      </div>
    </AvatarContainer>
  );
};

export default Avatar;
export type { AvatarProps, AssistantStatus, DanceMove };