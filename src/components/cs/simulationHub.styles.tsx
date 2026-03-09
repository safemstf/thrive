// src/components/cs/simulationHub.styles.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared design-token system + styled components for all CS tool/simulation
// pages. Import from here instead of duplicating styles across files.
//
// Usage:
//   import { T, Root, Header, Title, ControlsRow, StatChip } from '@/components/cs/simulationHub.styles';
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import styled, { keyframes, css, createGlobalStyle } from 'styled-components';

// ============================================================================
// DESIGN TOKENS — cream / ink theme
// ============================================================================

export const T = {
  // Text
  ink:       '#1a1208',
  inkMid:    '#3d3120',
  inkLight:  '#7a6e5f',
  inkFaint:  '#b8ad9e',
  // Surfaces
  cream:     '#faf7f2',
  creamDark: '#f0ebe1',
  creamDeep: '#e4ddd0',
  // Rules
  rule:      'rgba(26,18,8,0.10)',
  ruleMid:   'rgba(26,18,8,0.06)',
  // Accent — blue
  accent:    '#2563eb',
  accentBg:  'rgba(37,99,235,0.07)',
  // Status
  green:     '#16a34a',
  greenBg:   'rgba(22,163,74,0.08)',
  amber:     '#b45309',
  amberBg:   'rgba(180,83,9,0.08)',
  red:       '#dc2626',
  redBg:     'rgba(220,38,38,0.08)',
  purple:    '#7c3aed',
  purpleBg:  'rgba(124,58,237,0.08)',
  // Typography
  serif: `'DM Serif Display', Georgia, serif`,
  mono:  `'DM Mono', 'Fira Code', ui-monospace, monospace`,
  sans:  `'DM Sans', system-ui, sans-serif`,
  // Shadows / radii
  shadow:   '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  shadowLg: '0 8px 32px rgba(26,18,8,0.12)',
  radius:   '12px',
  radiusSm: '7px',
} as const;

// Dark canvas / simulation secondary palette (kept for canvas-based pages)
export const D = {
  bg:      '#0f1117',
  bgMid:   '#1a1f2e',
  text:    '#e6eef8',
  textMid: '#94a3b8',
  border:  'rgba(59,130,246,0.22)',
  accent:  '#3b82f6',
  accentStrong: '#1d4ed8',
  glow:    'rgba(59,130,246,0.18)',
} as const;

// ============================================================================
// KEYFRAMES
// ============================================================================

export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const shimmer = keyframes`
  0%   { background-position: -1000px 0; }
  100% { background-position:  1000px 0; }
`;

// ============================================================================
// GLOBAL STYLE — font imports
// ============================================================================

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ============================================================================
// CREAM SHELL — page-level layout
// ============================================================================

/**
 * Root — top-level cream container. Uses normal document flow (no absolute
 * positioning), so child components with their own height render correctly
 * inside SimulationWindow.
 */
export const Root = styled.div`
  width: 100%;
  min-height: 580px;
  overflow-y: auto;
  background: ${T.cream};
  font-family: ${T.sans};
  color: ${T.ink};
  -webkit-font-smoothing: antialiased;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${T.creamDeep}; border-radius: 2px; }
`;

// ============================================================================
// CREAM HEADER
// ============================================================================

export const Header = styled.header`
  padding-bottom: 1.1rem;
  border-bottom: 2px solid ${T.ink};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-family: ${T.serif};
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 0.2rem;
  color: ${T.ink};
`;

export const Subtitle = styled.p`
  font-size: 0.8rem;
  color: ${T.inkLight};
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.02em;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

/** Small pill badge in header (e.g. "B/S Notation", "SHA-256", version tags) */
export const HeaderBadge = styled.div`
  font-family: ${T.mono};
  font-size: 0.6rem;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.28rem 0.6rem;
  border: 1px solid ${T.creamDeep};
  border-radius: 999px;
  background: ${T.creamDark};
  white-space: nowrap;
`;

/** Blue accent pill (e.g. rule notation, algorithm name) */
export const AccentBadge = styled.div`
  font-family: ${T.mono};
  font-size: 0.68rem;
  font-weight: 600;
  color: ${T.accent};
  padding: 0.28rem 0.65rem;
  border: 1px solid rgba(37,99,235,0.25);
  border-radius: 999px;
  background: ${T.accentBg};
  white-space: nowrap;
  letter-spacing: 0.04em;
`;

// ============================================================================
// BODY LAYOUT — sidebar + main
// ============================================================================

/** Two-column grid: sidebar (228px) | main (1fr). Collapses to 1-col ≤720px */
export const Body = styled.div`
  display: grid;
  grid-template-columns: 228px 1fr;
  gap: 1rem;
  align-items: start;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const SideCard = styled.div`
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  box-shadow: ${T.shadow};
  overflow: hidden;
`;

export const SideHead = styled.div`
  padding: 0.48rem 0.85rem;
  background: ${T.creamDark};
  border-bottom: 1px solid ${T.ruleMid};
  font-family: ${T.mono};
  font-size: 0.57rem;
  font-weight: 600;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

/** Generic sidebar row button with active state */
export const SideBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.85rem;
  border: none;
  border-bottom: 1px solid ${T.ruleMid};
  background: ${p => p.$active ? T.accentBg : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${p => p.$active ? T.accentBg : T.creamDark}; }
`;

/** Active state dot for sidebar rows */
export const SideDot = styled.div<{ $active?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => p.$active ? T.accent : T.inkFaint};
  transition: background 0.12s;
`;

export const SideLabel = styled.div`
  font-size: 0.73rem;
  font-weight: 500;
  color: ${T.ink};
  line-height: 1.25;
`;

export const SideNote = styled.div`
  font-size: 0.59rem;
  color: ${T.inkFaint};
  font-family: ${T.mono};
  margin-top: 0.06rem;
`;

/** Descriptive text box at bottom of sidebar */
export const DescBox = styled.div`
  padding: 0.7rem 0.85rem;
  background: ${T.creamDark};
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  font-size: 0.7rem;
  color: ${T.inkLight};
  line-height: 1.65;
`;

// ============================================================================
// MAIN COLUMN — canvas + controls + stats
// ============================================================================

export const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
`;

/** Dark canvas wrapper — keeps the canvas black while cream UI surrounds it */
export const CanvasWrap = styled.div`
  background: ${D.bg};
  border-radius: ${T.radius};
  border: 1px solid ${T.rule};
  box-shadow: ${T.shadowLg};
  position: relative;
  overflow: hidden;
  height: 420px;
`;

export const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
  &:active { cursor: grabbing; }
`;

export const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 0.65rem;
  right: 0.65rem;
  background: rgba(15,17,23,0.8);
  padding: 0.25rem 0.5rem;
  border-radius: ${T.radiusSm};
  border: 1px solid rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.45);
  font-size: 0.62rem;
  font-family: ${T.mono};
  font-weight: 600;
  pointer-events: none;
`;

export const CanvasHint = styled.div`
  position: absolute;
  bottom: 0.65rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.16);
  font-size: 0.62rem;
  font-family: ${T.sans};
  white-space: nowrap;
  pointer-events: none;
`;

// ============================================================================
// CONTROLS ROW
// ============================================================================

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  box-shadow: ${T.shadow};
  padding: 0.5rem 0.85rem;
`;

export const ControlBtn = styled.button<{ $active?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: ${T.radiusSm};
  border: 1px solid ${p =>
    p.$danger ? 'rgba(220,38,38,0.3)' :
    p.$active  ? 'rgba(37,99,235,0.3)' : T.rule};
  background: ${p =>
    p.$danger ? T.redBg :
    p.$active  ? T.accentBg : T.creamDark};
  color: ${p =>
    p.$danger ? T.red :
    p.$active  ? T.accent : T.inkMid};
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: ${T.sans};
  white-space: nowrap;
  &:hover {
    background: ${p =>
      p.$danger ? 'rgba(220,38,38,0.14)' :
      p.$active  ? T.accentBg : T.creamDeep};
    color: ${p => p.$danger ? T.red : p.$active ? T.accent : T.ink};
    box-shadow: ${T.shadow};
  }
  svg { width: 12px; height: 12px; }
`;

export const CDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${T.rule};
  flex-shrink: 0;
`;

export const CLabel = styled.span`
  font-size: 0.62rem;
  color: ${T.inkFaint};
  font-family: ${T.mono};
  white-space: nowrap;
`;

export const PulseIndicator = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$active ? T.green : T.amber};
  animation: ${p => p.$active ? css`${pulse} 2s ease-in-out infinite` : 'none'};
  flex-shrink: 0;
`;

// ============================================================================
// CONTENT CARDS (full-width, used when no sidebar)
// ============================================================================

export const Card = styled.div`
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  box-shadow: ${T.shadow};
  overflow: hidden;
`;

export const CardHead = styled.div`
  padding: 0.6rem 1rem;
  background: ${T.creamDark};
  border-bottom: 1px solid ${T.ruleMid};
  font-family: ${T.mono};
  font-size: 0.6rem;
  font-weight: 600;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CardBody = styled.div`
  padding: 1rem;
`;

// ============================================================================
// STATS ROW
// ============================================================================

export const StatsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const StatChip = styled.div`
  flex: 1;
  min-width: 90px;
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  box-shadow: ${T.shadow};
  padding: 0.45rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
`;

export const StatLabel = styled.div`
  font-size: 0.58rem;
  font-weight: 500;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: ${T.mono};
`;

export const StatVal = styled.div<{ $color?: string }>`
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ${T.mono};
  color: ${p => p.$color || T.ink};
`;

// ============================================================================
// RESULT / STATUS BLOCKS
// ============================================================================

export const ResultBlock = styled.div<{ $variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }>`
  padding: 0.85rem 1rem;
  border-radius: ${T.radiusSm};
  border: 1px solid ${p => {
    switch (p.$variant) {
      case 'success': return 'rgba(22,163,74,0.25)';
      case 'warning': return 'rgba(180,83,9,0.25)';
      case 'danger':  return 'rgba(220,38,38,0.25)';
      case 'info':    return 'rgba(37,99,235,0.25)';
      default:        return T.rule;
    }
  }};
  background: ${p => {
    switch (p.$variant) {
      case 'success': return T.greenBg;
      case 'warning': return T.amberBg;
      case 'danger':  return T.redBg;
      case 'info':    return T.accentBg;
      default:        return T.creamDark;
    }
  }};
  font-size: 0.78rem;
  color: ${T.inkMid};
  line-height: 1.6;
`;

export const StatusBadge = styled.span<{ $variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: ${T.mono};
  font-size: 0.62rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid ${p => {
    switch (p.$variant) {
      case 'success': return 'rgba(22,163,74,0.3)';
      case 'warning': return 'rgba(180,83,9,0.3)';
      case 'danger':  return 'rgba(220,38,38,0.3)';
      case 'info':    return 'rgba(37,99,235,0.3)';
      default:        return T.creamDeep;
    }
  }};
  background: ${p => {
    switch (p.$variant) {
      case 'success': return T.greenBg;
      case 'warning': return T.amberBg;
      case 'danger':  return T.redBg;
      case 'info':    return T.accentBg;
      default:        return T.creamDark;
    }
  }};
  color: ${p => {
    switch (p.$variant) {
      case 'success': return T.green;
      case 'warning': return T.amber;
      case 'danger':  return T.red;
      case 'info':    return T.accent;
      default:        return T.inkMid;
    }
  }};
`;

// ============================================================================
// MONO INPUT / CODE DISPLAY
// ============================================================================

export const MonoInput = styled.input<{ $danger?: boolean }>`
  width: 100%;
  font-family: ${T.mono};
  font-size: 0.8rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid ${p => p.$danger ? 'rgba(220,38,38,0.4)' : T.rule};
  border-radius: ${T.radiusSm};
  background: ${p => p.$danger ? T.redBg : T.creamDark};
  color: ${T.ink};
  outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${p => p.$danger ? T.red : T.accent}; }
  &::placeholder { color: ${T.inkFaint}; }
`;

export const CodeBlock = styled.div`
  font-family: ${T.mono};
  font-size: 0.75rem;
  background: ${T.creamDark};
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  padding: 0.65rem 0.85rem;
  color: ${T.inkMid};
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
`;

// ============================================================================
// GRID PATTERNS
// ============================================================================

export const TwoCol = styled.div<{ $gap?: string }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${p => p.$gap || '0.75rem'};
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

export const PillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.3rem;
  padding: 0.5rem;
`;

export const PillBtn = styled.button<{ $active?: boolean }>`
  padding: 0.38rem 0.5rem;
  border: 1px solid ${p => p.$active ? 'rgba(37,99,235,0.22)' : T.rule};
  border-radius: ${T.radiusSm};
  background: ${p => p.$active ? T.accentBg : T.creamDark};
  color: ${p => p.$active ? T.accent : T.inkLight};
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  font-family: ${T.sans};
  transition: all 0.12s;
  &:hover { background: ${p => p.$active ? T.accentBg : 'rgba(37,99,235,0.05)'}; color: ${T.accent}; }
`;

// ============================================================================
// LOADING SPINNER
// ============================================================================

export const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${T.creamDeep};
  border-top-color: ${T.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// ============================================================================
// ─── DARK / SIMULATION SHELL (backward-compatible) ───────────────────────────
// These are retained for canvas-based simulation pages that use dark backgrounds.
// ============================================================================

/** @deprecated prefer Root + T tokens for new pages */
export const SimulationContainer = styled.div<{ $isDark?: boolean; $fullscreen?: boolean }>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $isDark = true }) => $isDark
    ? 'linear-gradient(to bottom, #0a0e1a, #1a1a2e)'
    : T.cream};
  color: ${({ $isDark = true }) => $isDark ? D.text : T.ink};
  position: ${({ $fullscreen }) => $fullscreen ? 'fixed' : 'relative'};
  inset: ${({ $fullscreen }) => $fullscreen ? '0' : 'auto'};
  z-index: ${({ $fullscreen }) => $fullscreen ? 99999 : 1};
  box-sizing: border-box;
  padding: ${({ $fullscreen }) => $fullscreen ? 'calc(1rem + env(safe-area-inset-top)) 0.75rem calc(1.25rem + env(safe-area-inset-bottom)) 0.75rem' : '2rem 1rem'};
  @media (max-width: 640px) {
    padding: ${({ $fullscreen }) => $fullscreen ? 'calc(0.75rem + env(safe-area-inset-top)) 0.5rem calc(0.9rem + env(safe-area-inset-bottom)) 0.5rem' : '1rem 0.75rem'};
  }
`;

export const SimulationInner = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const VideoSection = styled.section<{ $mobileFullscreen?: boolean }>`
  width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${D.border};
  box-shadow: 0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.02);
  aspect-ratio: 16 / 9;
  max-height: 65vh;
  ${({ $mobileFullscreen }) => $mobileFullscreen && css`
    aspect-ratio: auto;
    max-height: none;
    height: calc(100vh - 120px);
  `}
  @media (max-width: 900px) { max-height: 50vh; }
  @media (max-width: 640px) {
    aspect-ratio: 4 / 3;
    max-height: 40vh;
    ${({ $mobileFullscreen }) => $mobileFullscreen && css`height: calc(100vh - 84px);`}
  }
  @media (orientation: landscape) and (max-width: 900px) {
    aspect-ratio: auto;
    height: calc(100vh - 48px);
    max-height: none;
  }
`;

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const SimCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
`;

export const HUD = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.78);
  backdrop-filter: blur(8px);
  color: ${D.text};
  border: 1px solid ${D.border};
  font-size: 0.9rem;
  z-index: 12;
  min-width: 180px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.36);
  @media (max-width: 640px) {
    min-width: 140px;
    top: calc(0.6rem + env(safe-area-inset-top));
    left: 0.75rem;
    font-size: 0.85rem;
  }
`;

export const DiseaseSelector = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  min-width: 160px;
  z-index: 12;
  padding: 0.5rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.78);
  border: 1px solid ${D.border};
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.32);
  @media (max-width: 640px) {
    top: calc(0.6rem + env(safe-area-inset-top));
    right: 0.75rem;
    min-width: 140px;
  }
`;

export const PlaybackControls = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(1.25rem + env(safe-area-inset-bottom));
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: rgba(0,0,0,0.78);
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(59,130,246,0.26);
  z-index: 12;
  box-shadow: 0 12px 36px rgba(0,0,0,0.42);
  @media (max-width: 480px) {
    bottom: calc(0.75rem + env(safe-area-inset-bottom));
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }
  button {
    background: transparent;
    border: none;
    color: ${D.text};
    padding: 0.5rem;
    border-radius: 10px;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.12s ease, background 0.12s ease;
    &:hover { transform: scale(1.07); background: rgba(59,130,246,0.12); }
    &:active { transform: scale(0.98); }
  }
  input[type="range"] {
    width: 120px;
    height: 4px;
    background: ${D.glow};
    border-radius: 999px;
    -webkit-appearance: none;
    outline: none;
  }
`;

export const SpeedIndicator = styled.div`
  position: absolute;
  right: 1rem;
  bottom: calc(1.25rem + env(safe-area-inset-bottom));
  z-index: 12;
  padding: 0.5rem 0.75rem;
  background: rgba(0,0,0,0.78);
  border-radius: 18px;
  border: 1px solid rgba(59,130,246,0.18);
  color: ${D.accent};
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.36);
  @media (max-width: 480px) {
    right: 0.75rem;
    bottom: calc(0.9rem + env(safe-area-inset-bottom));
    font-size: 0.82rem;
    padding: 0.4rem 0.6rem;
  }
`;

export const ControlsSection = styled.section<{ $isDark?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ $isDark = true }) => $isDark ? 'rgba(8,12,20,0.6)' : 'rgba(255,255,255,0.9)'};
  border: 1px solid ${({ $isDark = true }) => $isDark ? 'rgba(59,130,246,0.06)' : T.rule};
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  box-shadow: 0 8px 24px rgba(0,0,0,0.28);
  @media (max-width: 700px) { flex-direction: column; gap: 0.75rem; padding: 0.75rem; }
`;

export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  overflow-x: auto;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $active = false }) => $active ? 'rgba(59,130,246,0.36)' : 'rgba(59,130,246,0.12)'};
  background: ${({ $active = false }) => $active ? 'rgba(59,130,246,0.08)' : 'transparent'};
  color: ${({ $active = false }) => $active ? D.accent : D.textMid};
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
  transition: color 0.12s, border-color 0.12s;
  &:hover { color: ${D.accent}; }
`;

export const TabContent = styled.div`
  width: 100%;
  animation: ${fadeIn} 0.32s ease-out;
`;

export const DarkStatCard = styled.div<{ $color?: string; $alert?: boolean }>`
  --card-color: ${({ $color = D.accent }) => $color};
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(59,130,246,0.1);
  color: ${D.text};
  ${({ $alert = false }) => $alert && css`animation: ${pulse} 2s infinite;`}
  .label { font-size: 0.72rem; color: ${D.textMid}; font-weight: 700; }
  .value { font-size: 1.6rem; color: var(--card-color); font-weight: 800; }
  .change { font-size: 0.7rem; color: ${D.textMid}; margin-top: 0.2rem; }
`;

export const ParameterControl = styled.div<{ $isDark?: boolean }>`
  display: block;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  min-width: 160px;
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .label { font-size: 0.9rem; font-weight: 700; color: ${({ $isDark = true }) => $isDark ? D.text : T.ink}; font-family: 'Courier New', monospace; }
  .value { color: ${D.accent}; font-family: 'Courier New', monospace; font-weight: 800; font-size: 0.9rem; }
  input[type="range"] { width: 100%; margin-top: 0.5rem; }
  select { width: 100%; padding: 0.5rem; margin-top: 0.5rem; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 4px; color: ${D.text}; cursor: pointer; }
`;

export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.8rem;
  width: 100%;
`;

export const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  --intervention-color: ${({ $color = D.accent }) => $color};
  padding: 1rem;
  border-radius: 12px;
  background: ${({ $active = false }) => $active ? 'rgba(59,130,246,0.10)' : 'rgba(0,0,0,0.36)'};
  border: 1px solid ${({ $active = false }) => $active ? 'var(--intervention-color)' : 'rgba(59,130,246,0.12)'};
  color: ${D.text};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  cursor: pointer;
  min-height: 100px;
  justify-content: center;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
  .icon { font-size: 1.35rem; color: var(--intervention-color); }
  .name { font-weight: 800; font-size: 0.9rem; text-align: center; }
  .efficacy { font-size: 0.75rem; color: ${D.textMid}; text-align: center; }
`;

export const MatrixOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

export const GlowButton = styled.button<{ $color?: string }>`
  --glow: ${({ $color = D.accent }) => $color};
  padding: 0.6rem 1rem;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--glow), color-mix(in srgb, var(--glow) 80%, transparent));
  border: none;
  color: white;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
`;
