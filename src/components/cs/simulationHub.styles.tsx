'use client'
// src/components/cs/simulationHub.styles.tsx
import styled, { keyframes, css } from "styled-components";

/* -------------------------
   Animations
   ------------------------- */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%,100% { opacity: 1; } 50% { opacity: 0.7; }
`;

const glow = keyframes`
  0%,100% { box-shadow: 0 0 10px rgba(59,130,246,0.2); }
  50% { box-shadow: 0 0 20px rgba(59,130,246,0.35); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

/* -------------------------
   Layout helpers
   ------------------------- */

/**
 * SimulationContainer: root visual wrapper.
 * Added optional $fullscreen prop so React can switch true fullscreen mode easily.
 */
export const SimulationContainer = styled.div<{
  $isDark?: boolean;
  $fullscreen?: boolean;
}>`
  width: 100%;
  min-height: 100vh;
  background: ${({ $isDark = true }) =>
    $isDark ? 'rgba(5,10,20,0.90)' : 'rgba(255,255,255,0.95)'};
  color: ${({ $isDark = true }) => ($isDark ? '#e6eef8' : '#0f172a')};
  position: ${({ $fullscreen }) => ($fullscreen ? 'fixed' : 'relative')};
  inset: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  z-index: ${({ $fullscreen }) => ($fullscreen ? 99999 : 1)};
  animation: ${fadeInUp} 0.6s ease-out;
  box-sizing: border-box;
  padding: ${({ $fullscreen }) => ($fullscreen ? 'calc(1rem + env(safe-area-inset-top)) 0.75rem calc(1.25rem + env(safe-area-inset-bottom)) 0.75rem' : '2rem 1rem')};
  margin-top: 20px;

  & * { box-sizing: border-box; }

  /* Slightly tighter padding on small screens unless in fullscreen (then safe-area used) */
  @media (max-width: 640px) {
    padding: ${({ $fullscreen }) => ($fullscreen ? 'calc(0.75rem + env(safe-area-inset-top)) 0.5rem calc(0.9rem + env(safe-area-inset-bottom)) 0.5rem' : '1rem 0.75rem')};
    margin-top: 12px;
  }
`;

/**
 * SimulationInner: center content and constrain width so spacing is predictable.
 */
export const SimulationInner = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px; /* main content width — adjust as needed */
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

/* -------------------------
   Video / Canvas area
   ------------------------- */

/* VideoSection: full-width but constrained by SimulationInner
   Allows for mobile-fullscreen mode (class .mobile-fullscreen) where aspect-ratio gives way to height-based layout
*/
export const VideoSection = styled.section<{ $mobileFullscreen?: boolean }>`
  width: 100%;
  max-width: 100%;
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(59,130,246,0.22);
  box-shadow: 0 8px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.02);
  padding: 0; /* keep canvas flush */
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  max-height: 65vh;

  /* When presenting a compact mobile fullscreen mode (toggled via prop or class),
     relax the aspect-ratio and make height relative to viewport so we maximize space. */
  ${({ $mobileFullscreen }) => $mobileFullscreen && css`
    aspect-ratio: auto;
    max-height: none;
    height: calc(100vh - 120px); /* default reserve for header / controls — adjust in JS if needed */
  `}

  @media (max-width: 900px) {
    aspect-ratio: 16 / 9;
    max-height: 50vh;
  }

  @media (max-width: 640px) {
    /* On small phones prefer 4:3 to get a taller canvas, unless mobile fullscreen requested */
    aspect-ratio: 4 / 3;
    max-height: 40vh;
    ${({ $mobileFullscreen }) => $mobileFullscreen && css`
      height: calc(100vh - 84px); /* leave space for top/bottom bars */
    `}
  }

  /* Landscape phones: expand height aggressively */
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
  display: block; /* avoids inline whitespace issues */
  cursor: crosshair;
  transition: filter 0.2s ease;
  border-radius: 0;

  /* ensure touch/pointer interactions behave predictably on mobile */
  touch-action: none; /* we handle gestures in JS (pan/zoom) */
  -webkit-tap-highlight-color: transparent;
`;

/* -------------------------
   Heads-up / Controls
   ------------------------- */

/* HUD: pinned to top-left of the VideoSection, responsive and safe-area aware.
   On very small screens the HUD can be collapsed by toggling the `hud-collapsed` class. */
export const HUD = styled.div<{ $isDark?: boolean }>`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  left: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.78);
  backdrop-filter: blur(8px);
  color: #e2e8f0;
  border: 1px solid rgba(59,130,246,0.22);
  font-size: 0.9rem;
  z-index: 12;
  min-width: 180px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.36);
  transition: transform 0.18s ease, opacity 0.18s ease;

  @media (max-width: 640px) {
    min-width: 140px;
    top: calc(0.6rem + env(safe-area-inset-top));
    left: 0.75rem;
    font-size: 0.85rem;
  }

  /* collapsed compact HUD for tiny mobile screens or if user toggles it */
  &.hud-collapsed {
    transform-origin: left top;
    transform: scale(0.86) translateY(-6px);
    opacity: 0.96;
    pointer-events: auto;
    min-width: 100px;
    padding: 0.5rem 0.6rem;
  }
`;

/* DiseaseSelector: pinned top-right */
export const DiseaseSelector = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  min-width: 160px;
  z-index: 12;
  padding: 0.5rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.78);
  border: 1px solid rgba(59,130,246,0.22);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.32);

  @media (max-width: 640px) {
    top: calc(0.6rem + env(safe-area-inset-top));
    right: 0.75rem;
    min-width: 140px;
  }
`;

/* PlaybackControls: centered at bottom, responsive spacing, safe-area aware
   Buttons get larger min-size on touch devices */
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
  transition: transform 0.28s ease;

  @media (max-width: 480px) {
    bottom: calc(0.75rem + env(safe-area-inset-bottom));
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  button {
    background: transparent;
    border: none;
    color: #e6eef8;
    padding: 0.5rem;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.12s ease, background 0.12s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    /* touch target improvements */
    min-width: 44px;
    min-height: 44px;

    &:hover { transform: scale(1.07); background: rgba(59,130,246,0.12); }
    &:active { transform: scale(0.98); }
  }

  input[type="range"] {
    width: 120px;
    height: 4px;
    background: rgba(59,130,246,0.18);
    border-radius: 999px;
    -webkit-appearance: none;
    outline: none;
  }

  /* compact controls state for tiny screens */
  &.controls-collapsed {
    padding: 0.35rem 0.5rem;

    button { min-width: 38px; min-height: 38px; padding: 0.35rem; }
    input[type="range"] { width: 84px; }
  }
`;

/* Speed indicator pinned bottom-right (keeps spacing consistent) */
export const SpeedIndicator = styled.div`
  position: absolute;
  right: 1rem;
  bottom: calc(1.25rem + env(safe-area-inset-bottom));
  z-index: 12;
  padding: 0.5rem 0.75rem;
  background: rgba(0,0,0,0.78);
  border-radius: 18px;
  border: 1px solid rgba(59,130,246,0.18);
  color: #3b82f6;
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

/* -------------------------
   Controls / Panels
   ------------------------- */

export const ControlsSection = styled.section<{ $isDark?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ $isDark = true }) => ($isDark ? 'rgba(8,12,20,0.6)' : 'rgba(255,255,255,0.9)')};
  border: 1px solid ${({ $isDark = true }) => ($isDark ? 'rgba(59,130,246,0.06)' : 'rgba(0,0,0,0.06)')};
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  box-shadow: 0 8px 24px rgba(0,0,0,0.28);

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  /* optionally pinned bottom for mobile if you toggle this state in the React view */
  &.pinned-bottom-mobile {
    @media (max-width: 700px) {
      position: fixed;
      left: 0;
      right: 0;
      bottom: calc(0.5rem + env(safe-area-inset-bottom));
      margin: 0 auto;
      width: calc(100% - 1.5rem);
      z-index: 30;
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.45);
    }
  }
`;

/* Tab strip & content */
export const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ $active = false }) => ($active ? 'rgba(59,130,246,0.36)' : 'rgba(59,130,246,0.12)')};
  background: ${({ $active = false }) => ($active ? 'rgba(59,130,246,0.08)' : 'transparent')};
  color: ${({ $active = false }) => ($active ? '#3b82f6' : '#94a3b8')};
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease;
  font-family: 'Courier New', monospace;

  &:hover {
    transform: translateY(-2px);
    color: #3b82f6;
  }
`;

export const TabContent = styled.div`
  width: 100%;
  animation: ${fadeInUp} 0.32s ease-out;
`;

/* -------------------------
   Stat / Intervention UI
   ------------------------- */

export const StatCard = styled.div<{ $color?: string; $alert?: boolean }>`
  --card-color: ${({ $color = '#3b82f6' }) => $color};
  padding: 0.85rem;
  border-radius: 10px;
  background: rgba(0,0,0,0.42);
  border: 1px solid rgba(59,130,246,0.1);
  color: #e6eef8;
  min-width: 120px;
  transition: transform 0.16s ease, box-shadow 0.16s ease;

  ${({ $alert = false }) => $alert && css`animation: ${pulse} 2s infinite;`}

  .label { font-size: 0.72rem; color: #94a3b8; font-weight: 700; }
  .value { font-size: 1.6rem; color: var(--card-color); font-weight: 800; }
`;

export const ParameterControl = styled.div<{ $isDark?: boolean }>`
  --accent: #3b82f6;
  --accent-strong: #1d4ed8;
  --bg: ${({ $isDark = true }) => ($isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')};
  --label: ${({ $isDark = false }) => ($isDark ? '#e6eef8' : '#0f172a')};
  --muted: ${({ $isDark = false }) => ($isDark ? '#94a3b8' : '#475569')};

  display: block;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--bg);
  min-width: 160px;

  .header {
    display:flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--label);
    font-family: 'Courier New', monospace;
  }

  .value {
    color: var(--accent);
    font-family: 'Courier New', monospace;
    font-weight: 800;
    font-size: 0.95rem;
  }

  input[type="range"] {
    width: 100%;
    height: 12px;
    -webkit-appearance: none;
    background: transparent;
    outline: none;
    border-radius: 999px;
    margin-top: 0.5rem;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: rgba(59,130,246,0.12);
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -6px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    border: 2px solid rgba(255,255,255,0.08);
    box-shadow: 0 4px 14px rgba(13, 42, 148, 0.25);
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  input[type="range"]::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: rgba(59,130,246,0.12);
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    border: 2px solid rgba(255,255,255,0.08);
  }
`;

export const InterventionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
  width: 100%;
`;

export const InterventionCard = styled.button<{ $active?: boolean; $color?: string }>`
  --intervention-color: ${({ $color = '#3b82f6' }) => $color};
  padding: 1rem;
  border-radius: 12px;
  background: ${({ $active = false }) => ($active ? 'rgba(59,130,246,0.10)' : 'rgba(0,0,0,0.36)')};
  border: 1px solid ${({ $active = false }) => ($active ? 'var(--intervention-color)' : 'rgba(59,130,246,0.12)')};
  color: #e6eef8;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  }

  .icon { font-size: 1.35rem; color: var(--intervention-color); }
  .name { font-weight: 800; font-size: 0.95rem; text-align: center; }
  .efficacy { font-size: 0.75rem; color: #94a3b8; text-align: center; }
`;

/* Misc utilities */
export const MatrixOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

/* Reusable glowing button */
export const GlowButton = styled.button<{ $color?: string }>`
  --glow: ${({ $color = '#3b82f6' }) => $color};
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

/* End of file */
