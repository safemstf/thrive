// src/components/cs/nb/nb.styles.ts
// N-Body Sandbox — Refactored styling system
// Focus: DRY, typed props, tokenized colors and mixins

import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

/* ========================
   Tokens & Shared Mixins
   ======================== */
const COLORS = {
  blue: '#3b82f6',
  blueText: '#60a5fa',
  blueMuted: 'rgba(59, 130, 246, 0.1)',
  blueBorder: 'rgba(59, 130, 246, 0.2)',
  purple: '#a855f7',
  green: '#22c55e',
  amber: '#fbbf24',
  red: '#ef4444',
  grayText: '#94a3b8',
  panelText: '#e2e8f0',
  track: 'rgba(148, 163, 184, 0.2)',
  dark: '#0a0f1c',
};

const SIZES = {
  panelRadius: '16px',
  smallRadius: '8px',
  minPanelWidth: '280px',
  maxPanelWidth: '450px',
};

/* little helper for variant palettes */
const variantPalette = (variant?: string) => {
  switch (variant) {
    case 'success':
      return { bg: `rgba(34,197,94,0.05)`, border: `rgba(34,197,94,0.15)`, color: '#4ade80' };
    case 'warning':
      return { bg: `rgba(251,191,36,0.05)`, border: `rgba(251,191,36,0.15)`, color: COLORS.amber };
    case 'danger':
      return { bg: `rgba(239,68,68,0.05)`, border: `rgba(239,68,68,0.15)`, color: COLORS.red };
    default:
      return { bg: `rgba(59,130,246,0.05)`, border: `rgba(59,130,246,0.15)`, color: COLORS.blueText };
  }
};

/* ========================
   Animations
   ======================== */
const cosmicGlow = keyframes`
  0%,100% {
    box-shadow:
      0 0 20px rgba(59,130,246,0.1),
      0 0 40px rgba(59,130,246,0.05),
      inset 0 1px 0 rgba(255,255,255,0.1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(59,130,246,0.2),
      0 0 60px rgba(59,130,246,0.1),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }
`;

const stellarPulse = keyframes`
  0%,100% { transform: scale(1); box-shadow: 0 0 15px rgba(251,191,36,0.4); }
  50%    { transform: scale(1.05); box-shadow: 0 0 25px rgba(251,191,36,0.6); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const orbitRotation = keyframes` from { transform: rotate(0deg) } to { transform: rotate(360deg) } `;
const dataFlowPulse = keyframes`
  0%,100% { opacity: 0.6; transform: translateX(0); }
  50%     { opacity: 1; transform: translateX(5px); }
`;
const loadingSpinner = keyframes` 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } `;
const starTwinkle = keyframes` 0%,100% { opacity: 0.8 } 50% { opacity: 1 } `;

/* ========================
   Global Styles
   ======================== */
export const NBodyGlobalStyles = createGlobalStyle`
  .n-body-simulation {
    *, *::before, *::after { box-sizing: border-box; }

    canvas {
      outline: none;
      cursor: grab;
      &:active { cursor: grabbing; }
    }

    /* Thin overlay scrollbars */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.18); border-radius: 3px; }
    ::-webkit-scrollbar-thumb {
      background: ${COLORS.blueBorder};
      border-radius: 3px;
      &:hover { background: rgba(59,130,246,0.6); }
    }
    scrollbar-width: thin;
    scrollbar-color: rgba(59,130,246,0.4) rgba(0,0,0,0.2);
  }
`;

/* ========================
   Top-level containers
   ======================== */
export const SimulationContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at center, ${COLORS.dark} 0%, #000 70%, #000 100%);
  font-family: 'Inter', system-ui, sans-serif;

  &::before {
    content: '';
    position: absolute; inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 20% 20%, rgba(59,130,246,0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(168,85,247,0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(34,197,94,0.02) 0%, transparent 50%);
    animation: ${starTwinkle} 8s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image: linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
    background-size: 100px 100px;
    opacity: 0.28;
  }
`;

export const CanvasContainer = styled.div`
  position: absolute; inset: 0; z-index: 1;
  canvas { width: 100% !important; height: 100% !important; }
`;

/* ========================
   Floating Panel (typed props)
   ======================== */
type FloatPos = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
interface FloatingPanelProps {
  $position?: FloatPos;
  $width?: string;
  $collapsed?: boolean;
  $hidden?: boolean;
  $minimal?: boolean;
}

const positionStyle = (p?: FloatPos) => {
  switch (p) {
    case 'top-right': return css`top: 1.5rem; right: 1.5rem;`;
    case 'bottom-left': return css`bottom: 1.5rem; left: 1.5rem;`;
    case 'bottom-right': return css`bottom: 1.5rem; right: 1.5rem;`;
    case 'bottom-center': return css`bottom: 1.5rem; left: 50%; transform: translateX(-50%);`;
    case 'top-left':
    default:
      return css`top: 1.5rem; left: 1.5rem;`;
  }
};

export const FloatingPanel = styled.div<FloatingPanelProps>`
  position: absolute;
  z-index: 10;
  width: ${({ $width }) => $width || 'auto'};
  min-width: ${SIZES.minPanelWidth};
  max-width: ${SIZES.maxPanelWidth};
  border-radius: ${({ $minimal }) => ($minimal ? '12px' : SIZES.panelRadius)};
  transition: transform .28s cubic-bezier(.4,0,.2,1), opacity .28s ease, box-shadow .28s ease;
  will-change: transform, opacity;
  animation: ${fadeInUp} .38s ease-out;
  ${props => positionStyle(props.$position)}

  background: ${({ $minimal }) =>
    $minimal
      ? 'rgba(10,14,39,0.6)'
      : 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(15,23,42,0.9) 50%, rgba(0,0,0,0.85) 100%)'};
  backdrop-filter: ${({ $minimal }) => ($minimal ? 'blur(8px)' : 'blur(20px)')};
  border: 1px solid ${COLORS.blueBorder};
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1);

  &:hover {
    border-color: rgba(59,130,246,0.36);
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    min-width: 260px;
    max-width: calc(100vw - 3rem);
  }

  /* Hide ALL floating panels on mobile - they'll be in the drawer instead */
  @media (max-width: 768px) {
    display: none;
  }

  /* collapsed */
  ${({ $collapsed }) => $collapsed && css`
    transform: scale(0.98);
    opacity: 0.85;
    pointer-events: none;
  `}

  /* hidden (no layout shift) */
  ${({ $hidden, $position }) => $hidden && css`
    transform: ${$position === 'bottom-center' ? 'translateX(-50%) translateY(12px)' : 'translateY(12px)'};
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  `}
`;

/* ========================
   Panel content & header
   ======================== */
export const PanelContent = styled.div<{ $padding?: boolean; $maxHeight?: string }>`
  padding: ${({ $padding = true }) => ($padding ? '1.25rem' : '0')};
  max-height: ${({ $maxHeight }) => $maxHeight || 'calc(70vh - 60px)'};
  color: ${COLORS.panelText};
  font-size: 0.875rem;
  line-height: 1.6;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: thin;

  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(59,130,246,0.18);
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,0.15);
  }
  &:hover::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.32); }

  scrollbar-color: rgba(59,130,246,0.18) transparent;
`;

export const PanelHeader = styled.div<{ $variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(59,130,246,0.1);
  border-top-left-radius: ${SIZES.panelRadius};
  border-top-right-radius: ${SIZES.panelRadius};

  background: ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return `linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(0,0,0,0.2) 100%)`;
      case 'secondary':
        return `linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0.2) 100%)`;
      default:
        return `linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0.2) 100%)`;
    }
  }};

  .title { display:flex; align-items:center; gap: .75rem;
    h3 { margin:0; font-size:1rem; font-weight:600; color: ${COLORS.panelText}; letter-spacing: -0.025em; }
    .icon { color: ${({ $variant }) => $variant === 'warning' ? COLORS.amber : ($variant === 'secondary' ? COLORS.purple : COLORS.blueText)}; }
  }

  .actions { display:flex; align-items:center; gap: .5rem; }
`;

/* ========================
   Buttons / icon buttons
   ======================== */
interface IconBtnProps {
  $variant?: 'primary' | 'secondary' | 'danger' | 'success';
  $size?: 'sm' | 'md' | 'lg';
  $active?: boolean;
}

const sizeMap = (s?: IconBtnProps['$size']) => {
  switch (s) {
    case 'sm': return css`width:32px;height:32px;`;
    case 'lg': return css`width:48px;height:48px;`;
    default: return css`width:40px;height:40px;`;
  }
};

const variantMap = (variant?: string, active?: boolean) => {
  const v: Record<string, any> = {
    primary: {
      bg: active ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
      border: active ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)',
      color: active ? COLORS.blueText : COLORS.grayText,
      hoverBg: 'rgba(59,130,246,0.15)',
      hoverColor: COLORS.blueText,
    },
    secondary: {
      bg: active ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.1)',
      border: active ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.2)',
      color: active ? '#cbd5e1' : COLORS.grayText,
      hoverBg: 'rgba(148,163,184,0.15)',
      hoverColor: '#cbd5e1',
    },
    danger: {
      bg: active ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
      border: active ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.2)',
      color: active ? COLORS.red : COLORS.grayText,
      hoverBg: 'rgba(239,68,68,0.15)',
      hoverColor: COLORS.red,
    },
    success: {
      bg: active ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.1)',
      border: active ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.2)',
      color: active ? '#4ade80' : COLORS.grayText,
      hoverBg: 'rgba(34,197,94,0.15)',
      hoverColor: '#4ade80',
    },
  };
  return v[variant || 'primary'];
};

export const IconButton = styled.button<IconBtnProps>`
  display:flex; align-items:center; justify-content:center; border:none; border-radius: ${SIZES.smallRadius};
  position: relative; cursor:pointer; transition: all .2s cubic-bezier(.4,0,.2,1);

  ${({ $size }) => sizeMap($size)}
  ${({ $variant, $active }) => {
    const v = variantMap($variant, $active);
    return css`
      background: ${v.bg};
      border: 1px solid ${v.border};
      color: ${v.color};
      &:hover { background: ${v.hoverBg}; color: ${v.hoverColor}; transform: translateY(-1px); box-shadow: 0 4px 12px ${v.border}; }
      &:active { transform: translateY(0); }
    `;
  }}

  ${({ $active }) => $active && css`
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 10px;
      background: linear-gradient(45deg, transparent, rgba(59,130,246,0.3), transparent);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }
  `}

  &:disabled { opacity: .5; cursor: not-allowed; transform:none; &:hover { box-shadow:none; } }
`;

/* Primary button (loading variant support) */
export const PrimaryButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $loading?: boolean }>`
  display:flex; gap:.5rem; align-items:center; justify-content:center;
  padding:.75rem 1.5rem; border-radius:8px; border:none; cursor:pointer;
  font-weight:600; font-size:.875rem; min-height:40px; transition: all .2s cubic-bezier(.4,0,.2,1);

  ${({ $variant = 'primary' }) => {
    if ($variant === 'secondary') {
      return css`
        background: rgba(148,163,184,0.1);
        border: 1px solid rgba(148,163,184,0.2);
        color: #cbd5e1;
        &:hover { background: rgba(148,163,184,0.15); border-color: rgba(148,163,184,0.3); transform: translateY(-1px); }
      `;
    }
    if ($variant === 'danger') {
      return css`
        background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1));
        border: 1px solid rgba(239,68,68,0.3);
        color: ${COLORS.red};
        &:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(239,68,68,0.2); }
      `;
    }
    return css`
      background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.1));
      border: 1px solid rgba(59,130,246,0.3);
      color: ${COLORS.blueText};
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(59,130,246,0.2); }
    `;
  }}

  &:disabled { opacity:.5; cursor:not-allowed; transform:none; &:hover { box-shadow:none; } }

  ${({ $loading }) => $loading && css`
    cursor: wait;
    &::after {
      content: '';
      width: 16px; height: 16px;
      border: 2px solid transparent; border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: ${loadingSpinner} 1s linear infinite;
      margin-left: .5rem;
    }
  `}
`;

/* ========================
   Inputs / sliders / form groups
   ======================== */
export const SliderContainer = styled.div`
  display:flex; flex-direction:column; gap:.5rem;
  .label { display:flex; justify-content:space-between; align-items:center; font-size:.8rem; font-weight:500; color: ${COLORS.grayText};
    .value { color: ${COLORS.blueText}; font-weight:600; font-family: 'JetBrains Mono', monospace; }
  }
`;

export const CustomSlider = styled.input.attrs({ type: 'range' })<{ $color?: string }>`
  -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px;
  background: linear-gradient(90deg, ${({ $color = COLORS.blue }) => $color} 0%, ${({ $color = COLORS.blue }) => $color} var(--value,50%), ${COLORS.track} var(--value,50%), ${COLORS.track} 100%);
  outline:none; cursor:pointer; transition: all .2s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%;
    background: linear-gradient(135deg, ${({ $color = COLORS.blue }) => $color}, ${({ $color = COLORS.blue }) => $color}dd);
    border: 2px solid rgba(255,255,255,0.2); cursor:pointer; transition: all .2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    &:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
  }

  &::-moz-range-thumb {
    width:18px; height:18px; border-radius:50%;
  }

  &:disabled { opacity:.5; cursor:not-allowed; }
`;

export const InputGroup = styled.div`
  display:flex; flex-direction:column; gap:.5rem;
  label { font-size:.8rem; font-weight:500; color:${COLORS.grayText}; }
  input, select {
    padding:.75rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(148,163,184,0.2); border-radius:6px;
    color: ${COLORS.panelText}; font-family: inherit; font-size: .875rem; transition: all .2s ease;
    &:focus { outline: none; border-color: rgba(59,130,246,0.4); box-shadow: 0 0 0 2px rgba(59,130,246,0.08); }
    &::placeholder { color: #64748b; }
  }
`;

/* ========================
   Metrics / status / scenario cards
   ======================== */
export const MetricCard = styled.div<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' }>`
  display:flex; align-items:center; justify-content:space-between; padding:.75rem 1rem; border-radius:8px; margin-bottom:.5rem;
  transition: all .2s ease;
  background: ${({ $variant }) => variantPalette($variant).bg};
  border: 1px solid ${({ $variant }) => variantPalette($variant).border};
  &:last-child { margin-bottom: 0; }
  &:hover { background: ${({ $variant }) => variantPalette($variant).bg.replace('0.05','0.08')}; }

  .label { display:flex; align-items:center; gap:.5rem; font-size:.8rem; color: ${COLORS.grayText};
    .icon { color: ${({ $variant }) => variantPalette($variant).color}; }
  }
  .value { font-family:'JetBrains Mono', monospace; font-size:.9rem; font-weight:600; color: ${({ $variant }) => variantPalette($variant).color}; }
`;

export const StatusIndicator = styled.div<{ $status: 'running' | 'paused' | 'stopped' | 'error' }>`
  display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem; border-radius:999px; font-size:.8rem; font-weight:600;
  ${({ $status }) => {
    switch ($status) {
      case 'running': return css` background: rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3); color:#4ade80; animation: ${dataFlowPulse} 2s ease-in-out infinite;`;
      case 'paused':  return css` background: rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.3); color: ${COLORS.amber};`;
      case 'error':   return css` background: rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color: ${COLORS.red};`;
      default:        return css` background: rgba(148,163,184,0.15); border:1px solid rgba(148,163,184,0.3); color: ${COLORS.grayText};`;
    }
  }}

  .dot { width:8px; height:8px; border-radius:50%; background: currentColor; ${({ $status }) => $status === 'running' && css` animation: ${stellarPulse} 1.5s ease-in-out infinite; `} }
`;

/* Scenario selector grid & cards */
export const ScenarioGrid = styled.div`
  display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:1rem; margin-top:1rem;
  @media (max-width:768px) { grid-template-columns: 1fr; }
`;

export const ScenarioCard = styled.div<{ $active?: boolean; $featured?: boolean }>`
  padding:1rem; border-radius:12px; position:relative; cursor:pointer; transition: all .3s cubic-bezier(.4,0,.2,1);
  background: ${({ $active }) => $active ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.3)'};
  border: 1px solid ${({ $active, $featured }) => $active ? 'rgba(59,130,246,0.4)' : ($featured ? 'rgba(251,191,36,0.3)' : 'rgba(148,163,184,0.1)')};
  
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); border-color: ${({ $active }) => $active ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.3)'}; }

  ${({ $featured }) => $featured && css`
    &::after {
      content: '';
      position:absolute; inset:-1px; border-radius:12px; z-index:-1;
      background: linear-gradient(135deg, rgba(251,191,36,0.2), transparent, rgba(251,191,36,0.2));
      animation: ${orbitRotation} 8s linear infinite;
    }
  `}

  .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:.75rem;
    h4 { margin:0; font-size:1rem; font-weight:600; color: ${COLORS.panelText}; }
    .badge { padding:.25rem .5rem; border-radius:999px; font-size:.7rem; font-weight:600; color:${COLORS.amber}; background: rgba(251,191,36,0.2); border:1px solid rgba(251,191,36,0.3); }
  }

  .description { font-size:.8rem; color: ${COLORS.grayText}; line-height:1.5; margin-bottom:.75rem; }

  .stats { display:flex; gap:1rem; font-size:.7rem; color:#64748b;
    .stat { display:flex; align-items:center; gap:.25rem; }
  }
`;

/* ========================
   Timeline / progress / loading
   ======================== */
export const TimelineContainer = styled.div`
  width:100%; padding:1rem; background: rgba(0,0,0,0.4); border-radius:12px; border:1px solid rgba(59,130,246,0.1);
`;

export const ProgressBar = styled.div<{ $progress: number; $color?: string }>`
  width:100%; height:6px; background: rgba(148,163,184,0.2); border-radius:3px; position:relative; overflow:hidden;
  &::after {
    content:'';
    position:absolute; left:0; top:0; height:100%;
    width: ${({ $progress }) => Math.max(0, Math.min(100, $progress))}%;
    background: linear-gradient(90deg, ${({ $color = COLORS.blue }) => $color}, ${({ $color = COLORS.blue }) => $color}dd);
    transition: width .3s ease; box-shadow: 0 0 10px ${({ $color = COLORS.blue }) => $color}44;
  }
`;

export const LoadingOverlay = styled.div`
  position:absolute; inset:0; z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);

  .spinner {
    width:48px; height:48px; border:4px solid rgba(59,130,246,0.2); border-top:4px solid ${COLORS.blueText}; border-radius:50%;
    animation: ${loadingSpinner} 1s linear infinite; margin-bottom:1rem;
  }
  .message { color: ${COLORS.grayText}; font-size:.9rem; text-align:center; max-width:300px; line-height:1.5; }
`;

/* ========================
   Mobile-specific components
   ======================== */
export const MobileMenuButton = styled.button<{ $isOpen?: boolean }>`
  display: none;
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 101;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: ${SIZES.smallRadius};
  background: rgba(10,15,28,0.95);
  border: 1px solid ${({ $isOpen }) => $isOpen ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.25)'};
  color: ${({ $isOpen }) => $isOpen ? COLORS.blueText : COLORS.grayText};
  cursor: pointer;
  transition: all .25s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);

  &:active {
    transform: scale(0.96);
  }

  ${({ $isOpen }) => $isOpen && css`
    background: rgba(59,130,246,0.12);
    box-shadow: 0 0 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
  `}

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    transition: transform .25s ease;
    ${({ $isOpen }) => $isOpen && css`transform: rotate(90deg);`}
  }
`;

export const MobileStatusBar = styled.div`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  right: 5rem;
  z-index: 50;
  padding: 0.75rem 1rem;
  border-radius: ${SIZES.smallRadius};
  background: rgba(10,15,28,0.95);
  border: 1px solid rgba(59,130,246,0.25);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  gap: 0.75rem;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: ${COLORS.grayText};
    white-space: nowrap;

    .icon {
      font-size: 0.875rem;
      color: ${COLORS.blueText};
      opacity: 0.8;
    }

    .value {
      color: ${COLORS.blueText};
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }
  }

  .divider {
    width: 1px;
    height: 14px;
    background: rgba(59,130,246,0.2);
    flex-shrink: 0;
  }
`;

export const MobileDrawerOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0,0,0,0.6);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity .28s ease, visibility .28s ease;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileDrawer = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  width: min(85vw, 380px);
  background: linear-gradient(135deg, rgba(10,15,28,0.98) 0%, rgba(15,23,42,0.98) 50%, rgba(10,15,28,0.98) 100%);
  border-left: 1px solid rgba(59,130,246,0.25);
  box-shadow: -8px 0 32px rgba(0,0,0,0.6), inset 1px 0 0 rgba(255,255,255,0.05);
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform .28s cubic-bezier(.4,0,.2,1);
  will-change: transform;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }

  /* Cosmic accent gradient on left edge */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(59,130,246,0.4) 20%,
      rgba(168,85,247,0.4) 50%,
      rgba(59,130,246,0.4) 80%,
      transparent 100%
    );
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    transition: opacity .4s ease .1s;
  }
`;

export const MobileDrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: none;
  scrollbar-width: thin;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(59,130,246,0.25);
    border-radius: 2px;
    &:hover { background: rgba(59,130,246,0.4); }
  }

  scrollbar-color: rgba(59,130,246,0.25) transparent;
`;

export const MobileDrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(59,130,246,0.15);
  background: linear-gradient(90deg, rgba(59,130,246,0.08) 0%, transparent 100%);
  flex-shrink: 0;

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: rgba(59,130,246,0.15);
      border: 1px solid rgba(59,130,246,0.25);
      color: ${COLORS.blueText};
    }

    h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: ${COLORS.panelText};
      letter-spacing: -0.02em;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: rgba(148,163,184,0.08);
    border: 1px solid rgba(148,163,184,0.15);
    color: ${COLORS.grayText};
    cursor: pointer;
    transition: all .2s ease;

    &:active {
      transform: scale(0.95);
      background: rgba(148,163,184,0.12);
      color: #cbd5e1;
    }
  }
`;

export const MobileDrawerSection = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} .4s ease-out backwards;
  animation-delay: calc(var(--section-index, 0) * 0.05s);

  &:last-child {
    margin-bottom: 0.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.875rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(59,130,246,0.1);
    font-size: 0.8rem;
    font-weight: 600;
    color: ${COLORS.blueText};
    text-transform: uppercase;
    letter-spacing: 0.08em;

    .icon {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

export const MobileQuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const MobileQuickAction = styled.button<{ $variant?: 'primary' | 'success' | 'warning' | 'danger'; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1);
  min-height: 76px;
  position: relative;
  overflow: hidden;

  ${({ $variant = 'primary', $active }) => {
    const palette = variantPalette($variant);
    return css`
      background: ${$active ? palette.bg.replace('0.05', '0.12') : palette.bg};
      border: 1px solid ${$active ? palette.border.replace('0.15', '0.3') : palette.border};
      color: ${palette.color};

      &:active {
        transform: scale(0.97);
        background: ${palette.bg.replace('0.05', '0.15')};
      }

      ${$active && css`
        box-shadow: 0 0 0 2px ${palette.border}, inset 0 1px 0 rgba(255,255,255,0.1);
      `}
    `;
  }}

  /* Subtle shine effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: left .4s ease;
  }

  &:active::before {
    left: 100%;
  }

  .icon {
    font-size: 1.5rem;
    opacity: 0.95;
  }

  .label {
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.3;
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;

    &:active {
      transform: none;
    }
  }
`;

/* ========================
   Responsive utilities & tooltip
   ======================== */
export const ResponsiveContainer = styled.div`
  @media (max-width: 768px) {
    ${FloatingPanel} { position: relative; width:100%; margin:1rem 0; border-radius:12px; }
    ${SimulationContainer} { flex-direction: column; }
    ${CanvasContainer} { height: 60vh; }
  }
`;

export const TooltipWrapper = styled.div`
  position: relative; display:inline-block;
  &:hover .tooltip { opacity: 1; visibility: visible; transform: translateY(-8px); }
`;

export const Tooltip = styled.div`
  position:absolute; bottom:100%; left:50%; transform: translateX(-50%);
  padding: .5rem .75rem; background: rgba(0,0,0,0.9); color: ${COLORS.panelText}; font-size:.75rem; border-radius:6px;
  white-space:nowrap; z-index:1000; opacity:0; visibility:hidden; transition: all .2s ease; pointer-events:none;
  &::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:4px solid transparent; border-top-color: rgba(0,0,0,0.9); }
`;


/* ========================
   Default export (named exports are above)
   ======================== */
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
  NBodyGlobalStyles,
};
