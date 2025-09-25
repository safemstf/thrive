// np.styles.tsx - OOCSS-refactor (keeps all exported names intact)
import styled, { keyframes, css } from 'styled-components';

/* =========================
   ANIMATIONS (unchanged exports)
   ========================= */
export const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.30); }
  50%     { box-shadow: 0 0 40px rgba(59,130,246,0.55); }
`;

export const dataFlow = keyframes`
  0% { transform: translateX(-100%) scaleX(0); opacity: 0; }
  50% { transform: translateX(0%) scaleX(1); opacity: 1; }
  100% { transform: translateX(100%) scaleX(0); opacity: 0; }
`;

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const flowRight = keyframes`
  0% { transform: translateX(-6px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(6px); opacity: 0; }
`;

export const trainMovement = keyframes`
  0% { transform: translateX(0) scaleX(1); }
  25% { transform: translateX(22vw) scaleX(1.02); }
  50% { transform: translateX(44vw) scaleX(1); }
  75% { transform: translateX(22vw) scaleX(0.98); }
  100% { transform: translateX(0) scaleX(1); }
`;

export const dopplerShift = keyframes`
  0% { transform: scaleX(1) scaleY(1); filter: hue-rotate(0deg); }
  25% { transform: scaleX(0.85) scaleY(1.05); filter: hue-rotate(220deg); }
  50% { transform: scaleX(1) scaleY(1); filter: hue-rotate(0deg); }
  75% { transform: scaleX(1.15) scaleY(0.95); filter: hue-rotate(340deg); }
  100% { transform: scaleX(1) scaleY(1); filter: hue-rotate(0deg); }
`;

export const signalPropagation = keyframes`
  0% { transform: scale(0.6); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
  100% { transform: scale(2); opacity: 0; }
`;

export const interferencePattern = keyframes`
  0%,100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  25% { background-position: 100% 50%; filter: hue-rotate(90deg); }
  50% { background-position: 200% 50%; filter: hue-rotate(180deg); }
  75% { background-position: 300% 50%; filter: hue-rotate(270deg); }
`;

export const walkingMotion = keyframes`
  0%,100% { transform: translateY(0px); }
  25% { transform: translateY(-2px); }
  50% { transform: translateY(0px); }
  75% { transform: translateY(2px); }
`;

export const channelQualityPulse = keyframes`
  0% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
  100% { opacity: 0.55; transform: scale(1); }
`;

/* =========================
   THEME / SKIN HELPERS (OOCSS: skins centralized)
   ========================= */

const themeVars = {
  primary: '#3b82f6',
  accent: '#8b5cf6',
  good: '#10b981',
  warn: '#f59e0b',
  danger: '#ef4444',
  panelGlass: 'rgba(6,8,14,0.6)',
  borderSubtle: 'rgba(59,130,246,0.12)'
};

const motionReset = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;

/* statusStyles centralizes badge colors for reuse */
const statusStyles = (type: 'excellent' | 'good' | 'fair' | 'poor' | 'critical') => {
  switch (type) {
    case 'excellent':
      return css` background: rgba(16,185,129,0.14); color: ${themeVars.good}; border: 1px solid rgba(16,185,129,0.18); `;
    case 'good':
      return css` background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.16); `;
    case 'fair':
      return css` background: rgba(245,158,11,0.12); color: ${themeVars.warn}; border: 1px solid rgba(245,158,11,0.14); `;
    case 'poor':
      return css` background: rgba(239,68,68,0.12); color: ${themeVars.danger}; border: 1px solid rgba(239,68,68,0.14); `;
    case 'critical':
      return css` background: rgba(220,38,38,0.12); color: #dc2626; border: 1px solid rgba(220,38,38,0.16); animation: ${channelQualityPulse} 1.2s ease-in-out infinite; `;
  }
};

/* maybe useful small utility: sizeToken returns px unit */
const sizeToken = (n: number) => `${n}px`;

/* =========================
   STRUCTURAL BASES (OOCSS: objects)
   - BasePanel: structure used across panels
   - BaseBadge: small reusable badge object
   - VisualToken: small token used by other components
   ========================= */

const BasePanel = styled.div<{ $glass?: boolean }>`
  position: relative;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  ${({ $glass }) => $glass ? css` background: ${themeVars.panelGlass}; border: 1px solid ${themeVars.borderSubtle}; ` : css` background: #fff; border: 1px solid rgba(0,0,0,0.04); `}
  ${motionReset}
`;

const BaseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

/* =========================
   EXPORTS (keeps original names)
   ========================= */

/* MAIN CONTAINERS */
export const SimulationContainer = styled.div<{ $isDark?: boolean }>`
  --primary: ${themeVars.primary};
  --accent: ${themeVars.accent};
  --good: ${themeVars.good};
  --warn: ${themeVars.warn};
  --danger: ${themeVars.danger};

  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  box-shadow: 0 18px 48px rgba(6,8,14,0.18);
  animation: ${fadeInUp} 540ms cubic-bezier(.16,.84,.24,1) both;
  position: relative;
  color: ${({ $isDark }) => $isDark ? 'rgba(255,255,255,0.92)' : '#0f1724'};
  background: ${({ $isDark }) => $isDark ? 'linear-gradient(135deg, #0a0a0a 0%, #16213e 100%)' : '#ffffff'};
  ${motionReset}
`;

/* TrainStationContainer */
export const TrainStationContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 80vh;
  max-height: 140vh;
  display: flex;
  align-items: stretch;           /* <-- important: let children stretch vertically */
  justify-content: center;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 0;
  box-sizing: border-box;

  &::before { /* decorative gradients */ }
  &::after { /* overlay */ }
`;

/* TrainStationLayout - structure object */
export const TrainStationLayout = styled.div`
  width: 100%; height: 100%;
  display: grid;
  grid-template-areas:
    "platform platform platform"
    "tracks tracks tracks"
    "waiting waiting waiting";
  grid-template-rows: 1fr 0.28fr 0.48fr;
  gap: 10px;
  padding: 20px;
  box-sizing: border-box;
  z-index: 2;

  .platform-area { grid-area: platform; border-radius: 12px; overflow: hidden; }
  .tracks-area   { grid-area: tracks; border-radius: 10px; overflow: hidden; }
  .waiting-area  { grid-area: waiting; border-radius: 12px; overflow: hidden; }
`;

/* AGENT MARKER (object + skin) */
export const AgentMarker = styled.div<{
  $agentType: 'platform_passenger' | 'train_passenger' | 'access_point';
  $movementState?: 'sitting' | 'walking' | 'moving_with_train' | 'stationary';
  $signalStrength?: number;
  $isTransmitting?: boolean;
}>`
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display:flex; align-items:center; justify-content:center;
  transition: transform 260ms cubic-bezier(.2,.9,.2,1), box-shadow 260ms ease, background 260ms ease;
  z-index: 10;
  will-change: transform, box-shadow;
  ${motionReset}

  ${({ $agentType, $signalStrength = 0.5, $isTransmitting = false }) => {
    const s = Math.max(0, Math.min(1, $signalStrength));
    switch ($agentType) {
      case 'platform_passenger':
        return css`
          width: 12px; height: 12px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 2px solid rgba(59,130,246,0.28);
          box-shadow: 0 6px 12px rgba(59,130,246,${0.16 + s*0.5});
        `;
      case 'train_passenger':
        return css`
          width: 10px; height: 10px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 2px solid rgba(245,158,11,0.36);
          box-shadow: 0 8px 16px rgba(245,158,11,${0.18 + s*0.5});
          animation: ${$isTransmitting ? dopplerShift : 'none'} 2.1s ease-in-out infinite;
        `;
      case 'access_point':
        return css`
          width: 20px; height: 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: 3px solid rgba(16,185,129,0.36);
          box-shadow: 0 8px 24px rgba(16,185,129,0.5);
          &::before {
            content: '';
            position: absolute;
            width: ${Math.round(40 + s*60)}px; height: ${Math.round(40 + s*60)}px;
            border: 1px dashed rgba(16,185,129,0.22); border-radius: 50%;
            animation: ${signalPropagation} 3s ease-out infinite;
            pointer-events: none;
          }
        `;
    }
  }}

  ${({ $movementState }) => $movementState === 'walking' ? css` animation: ${walkingMotion} 1s ease-in-out infinite; ` :
    $movementState === 'moving_with_train' ? css` animation: ${trainMovement} 9.5s linear infinite; ` : ''}

  &:hover { transform: translate(-50%, -50%) scale(1.25); z-index: 20; }

  &::after {
    content: '';
    position: absolute; top: -8px; right: -8px;
    width: 6px; height: 6px; border-radius: 50%;
    background: ${({ $signalStrength = 0.5 }) => $signalStrength > 0.7 ? themeVars.good : $signalStrength > 0.4 ? themeVars.warn : themeVars.danger};
    opacity: ${({ $isTransmitting }) => $isTransmitting ? 1 : 0.6};
    animation: ${({ $isTransmitting }) => $isTransmitting ? css`${channelQualityPulse} 1.6s ease-in-out infinite` : 'none'};
  }
`;

/* CONNECTION LINE (object + skin) */
export const ConnectionLine = styled.div<{
  $signalStrength: number;
  $interferenceLevel: number;
  $dopplerShift: number;
  $isActive: boolean;
}>`
  position: absolute;
  height: 2px;
  transform-origin: left center;
  z-index: 5;
  will-change: transform, opacity;
  overflow: visible;

  background: linear-gradient(90deg,
    ${({ $signalStrength, $interferenceLevel }) =>
      $interferenceLevel > 0.5 ? themeVars.danger :
      $signalStrength > 0.7 ? themeVars.good :
      $signalStrength > 0.4 ? themeVars.warn : themeVars.danger} 0%,
    transparent 100%);
  opacity: ${({ $isActive, $signalStrength }) => $isActive ? Math.max(0.2, $signalStrength) : 0.28 };

  ${({ $dopplerShift, $isActive }) => $isActive && Math.abs($dopplerShift) > 10 && css`
    animation: ${dopplerShift} ${Math.max(0.9, 2 - Math.abs($dopplerShift)/200)}s ease-in-out infinite;
  `}

  &::before {
    content: '';
    position: absolute; top: -1px; left: 0;
    width: 8px; height: 4px; border-radius: 2px;
    background: ${({ $signalStrength }) => $signalStrength > 0.7 ? 'rgba(16,185,129,0.92)' : $signalStrength > 0.4 ? 'rgba(245,158,11,0.92)' : 'rgba(239,68,68,0.92)'};
    animation: ${dataFlow} 1.8s linear infinite;
    opacity: ${({ $isActive }) => $isActive ? 1: 0};
  }

  ${({ $interferenceLevel }) => $interferenceLevel > 0.3 && css`
    &::after {
      content: '';
      position: absolute; top: -2px; left: 0; right: 0; height: 6px;
      background: linear-gradient(45deg, transparent 25%, rgba(239,68,68,0.18) 25%, rgba(239,68,68,0.18) 50%, transparent 50%, transparent 75%, rgba(239,68,68,0.18) 75%);
      background-size: 8px 8px;
      animation: ${interferencePattern} 1.1s linear infinite;
    }
  `}

  ${motionReset}
`;

/* TRAIN VEHICLE */
export const TrainVehicle = styled.div<{
  $position: number;
  $velocity: number;
  $isAtStation: boolean;
}>`
  position: absolute;
  width: 88px; height: 28px;
  background: linear-gradient(135deg, #374151, #1f2937);
  border: 2px solid #4b5563;
  border-radius: 12px;
  bottom: 20%;
  left: ${({ $position }) => `${$position}%`};
  transform: translateX(-50%);
  transition: left 900ms cubic-bezier(0.2,0.9,0.2,1), filter 300ms ease;
  z-index: 15;
  display:flex; align-items:center; justify-content:center;
  will-change: left, filter;
  ${motionReset}

  &::before, &::after { content:''; position:absolute; top:6px; width:12px; height:12px; background: rgba(59,130,246,0.6); border-radius:2px; }
  &::before { left:8px } &::after { right:8px }

  ${({ $velocity }) => Math.abs($velocity) > 10 && css`
    filter: blur(${Math.min(6, Math.abs($velocity)/18)}px);
    &::before, &::after { animation: ${pulseGlow} 1s ease-in-out infinite; }
  `}

  ${({ $isAtStation }) => $isAtStation && css`
    border-color: ${themeVars.good}; box-shadow: 0 0 20px rgba(16,185,129,0.28);
  `}

  .velocity-indicator {
    position:absolute; top:-12px; left:50%; transform:translateX(-50%);
    font-size:0.62rem; color:white; background: rgba(0,0,0,0.6); padding:1px 6px; border-radius:3px; font-family: 'JetBrains Mono', monospace;
  }
`;

/* VISUALIZATION PANELS and GRID */
export const VisualizationGrid = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "main-sim advanced-viz"
    "signal-flow metrics";
  gap: 12px;
  background: transparent;
  z-index: 1;
  padding: 20px;
  box-sizing: border-box;
  min-height: 0;                  /* <-- allow flex children to shrink */

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "main-sim"
      "signal-flow"
      "advanced-viz"
      "metrics";
    padding: 12px;
  }
`;

/* PanelHeader */
export const PanelHeader = styled.div<{ $variant?: 'default' | 'enhanced' }>`
  --panel-header-height: 56px;    /* adjust here to change header height globally */

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--panel-header-height);  /* explicit height */
  background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(0,0,0,0.7));
  backdrop-filter: blur(8px);
  padding: 12px 16px;             /* internal padding; panel will apply matching top padding */
  border-bottom: 1px solid rgba(59, 130, 246, 0.12);
  z-index: 20;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .title {
    color: white;
    font-size: ${({ $variant }) => $variant === 'enhanced' ? '1rem' : '0.875rem'};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .subtitle {
    color: rgba(255,255,255,0.7);
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: auto;
  }
`;

export const VisualizationPanel = styled.div<{
  $active?: boolean;
  $gridArea?: string;
  $priority?: 'primary' | 'secondary';
}>`
  grid-area: ${({ $gridArea }) => $gridArea || 'auto'};
  background: rgba(6, 8, 14, 0.75);
  backdrop-filter: blur(12px);
  border: 1.8px solid rgba(59, 130, 246, 0.18);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.32s cubic-bezier(0.2,0.85,0.2,1);
  min-height: 88px;

  /* IMPORTANT: turn into flex column so header + content behave predictably */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;

  /* reserve space for the absolutely positioned header */
  padding-top: var(--panel-header-height, 56px);

  ${({ $active }) => $active && css`
    border-color: var(--primary, #3b82f6);
    animation: ${pulseGlow} 3s ease-in-out infinite;
    transform: scale(1.015);
    box-shadow: 0 14px 40px rgba(59,130,246,0.18);
  `}

  ${({ $priority }) => $priority === 'primary' && css`
    border-width: 2.4px;
    box-shadow: 0 12px 36px rgba(59,130,246,0.18);
  `}

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary, #3b82f6), var(--accent, #8b5cf6), #ec4899);
    opacity: ${({ $active }) => $active ? 1 : 0.45};
    transition: opacity 0.3s ease;
  }

  /* ensure inner content can shrink in flex layouts (avoids overflow/centering issues) */
  & > *:not(${PanelHeader}) {
    min-height: 0;
    flex: 1 1 auto;
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;



/* StatusBadge - reuses statusStyles */
export const StatusBadge = styled(BaseBadge)<{ $type: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' }>`
  ${({ $type }) => statusStyles($type)}
`;

/* Metrics & RealTimeMetric */
export const MetricsGrid = styled.div`
  display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:12px; padding:12px; align-items:stretch;
`;

export const RealTimeMetric = styled.div<{
  $value: number;
  $threshold?: { good: number; fair: number };
  $animate?: boolean;
}>`
  display:flex; flex-direction:column; justify-content:center; align-items:center;
  padding:12px; border-radius:10px; min-height:64px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.04);
  transition: transform 180ms ease, background 120ms ease, box-shadow 180ms ease;
  ${motionReset}

  ${({ $animate }) => $animate && css` animation: ${channelQualityPulse} 2s ease-in-out infinite; `}

  .label { font-size:0.68rem; color: rgba(255,255,255,0.7); text-transform:uppercase; font-weight:700; margin-bottom:6px; letter-spacing:0.6px; }
  .value {
    font-size:1.05rem; font-weight:800; font-family:'JetBrains Mono', monospace; margin-bottom:4px;
    color: ${({ $value, $threshold }) => {
      if (!$threshold) return themeVars.primary;
      if ($value >= $threshold.good) return themeVars.good;
      if ($value >= $threshold.fair) return themeVars.warn;
      return themeVars.danger;
    }};
  }
  .trend { font-size:0.62rem; color: rgba(255,255,255,0.58); font-family:'JetBrains Mono', monospace; }
  &:hover { transform: translateY(-4px); background: rgba(255,255,255,0.03); }
`;

/* OFDM vs OFTS Comparison */
export const ComparisonContainer = styled(BasePanel)`
  background: rgba(139,92,246,0.09); border: 1px solid rgba(139,92,246,0.12); padding: 14px; border-radius:12px;
`;

export const ComparisonGrid = styled.div`
  display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-top:10px;
  @media (max-width:800px) { grid-template-columns: 1fr; }
`;

export const ComparisonMetric = styled.div<{ $improvement: boolean }>`
  background: rgba(0,0,0,0.22); padding:12px; border-radius:8px; text-align:center; min-height:82px;
  border: 1px solid ${({ $improvement }) => $improvement ? 'rgba(16,185,129,0.16)' : 'rgba(239,68,68,0.16)'};
  display:flex; flex-direction:column; justify-content:center;

  .metric-label { font-size:0.68rem; color: rgba(255,255,255,0.74); margin-bottom:6px; text-transform:uppercase; font-weight:700; }
  .metric-value {
    font-size:1.1rem; font-weight:800; font-family:'JetBrains Mono', monospace;
    color: ${({ $improvement }) => $improvement ? themeVars.good : themeVars.danger};
    ${({ $improvement }) => $improvement && css` &::before { content: '+'; color: ${themeVars.good}; margin-right: 0.12rem; } `}
  }
`;

/* SimCanvas */
export const SimCanvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
  display: block;                 /* prevent inline baseline offset */
  cursor: crosshair;
  transition: filter 180ms ease;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  object-fit: cover;              /* keep canvas fills the area visually */
  min-width: 0;
  min-height: 0;

  &:hover { filter: brightness(1.06); }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

/* PlaybackControls */
export const PlaybackControls = styled.div`
  position:absolute; bottom:22px; left:50%; transform: translateX(-50%); display:flex; gap:12px; align-items:center;
  background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.82)); backdrop-filter: blur(20px);
  padding: 10px 16px; border-radius:9999px; border: 1px solid rgba(59,130,246,0.28); z-index:30;
  box-shadow: 0 12px 30px rgba(0,0,0,0.55); ${motionReset}

  .control-button {
    background: transparent; border: none; color: white; cursor: pointer; padding:8px; border-radius:10px;
    transition: transform 140ms ease, background 140ms ease; display:flex; align-items:center; justify-content:center;
    &:hover { background: rgba(59,130,246,0.14); transform: scale(1.06); } &:active { transform: scale(0.96); }
    &.primary { background: linear-gradient(135deg, ${themeVars.primary}, #2563eb); border: 1px solid #1d4ed8; }
    &.train-mode { background: linear-gradient(135deg, ${themeVars.warn}, #d97706); border: 1px solid #b45309; }
  }

  .speed-control { display:flex; gap:8px; margin-left:10px; padding-left:12px; border-left:1px solid rgba(255,255,255,0.06);
    select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); color:white; padding:6px 8px; border-radius:6px; font-size:0.78rem;
      &:focus { outline:none; box-shadow: 0 0 0 4px rgba(59,130,246,0.06); } }
  }
`;

/* ContentSection */
export const ContentSection = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => $isDark ? 'rgba(12,12,16,0.92)' : 'rgba(248,250,252,0.98)'}; border-top: 1px solid rgba(59,130,246,0.08);
  backdrop-filter: blur(6px); padding: 8px;
`;

/* Tabs */
export const TabContainer = styled.div`
  display:flex; gap:0; border-bottom: 1px solid rgba(59,130,246,0.08); overflow-x:auto; -webkit-overflow-scrolling: touch; scrollbar-width:none;
  &::-webkit-scrollbar { display:none }
`;

export const Tab = styled.button<{ $active?: boolean; $hasNotification?: boolean }>`
  padding: 14px 20px; background:transparent; border:none; color: ${({ $active }) => $active ? themeVars.primary : 'rgba(164,174,196,0.9)'};
  font-weight:700; cursor:pointer; position:relative; transition: color 160ms ease, background 160ms ease; display:flex; gap:8px; align-items:center;
  font-size:0.88rem; white-space:nowrap; border-radius:8px 8px 0 0;

  &::after { content:''; position:absolute; bottom:-1px; left:10%; right:10%; height:3px; background: linear-gradient(135deg, ${themeVars.primary}, ${themeVars.accent}); transform: scaleX(${({ $active }) => $active ? 1 : 0}); transition: transform 220ms cubic-bezier(.2,.85,.2,1); border-radius:2px 2px 0 0; }
  ${({ $hasNotification }) => $hasNotification && css`
    &::before { content:''; position:absolute; top:8px; right:8px; width:8px; height:8px; background: ${themeVars.danger}; border-radius:50%; animation: ${channelQualityPulse} 1.6s ease-in-out infinite; box-shadow:0 0 6px rgba(239,68,68,0.18); }
  `}
  &:hover { color: ${themeVars.primary}; background: rgba(59,130,246,0.04); &::after { transform: scaleX(0.6); } }
  ${({ $active }) => $active && css` background: rgba(59,130,246,0.06); `}
  ${motionReset}
`;

/* TabContent */
export const TabContent = styled.div`
  padding: 30px 22px; animation: ${fadeInUp} 280ms ease-out; min-height:120px; ${motionReset}
`;

/* ParameterControl (form control) */
export const ParameterControl = styled.div<{ $variant?: 'enhanced' }>`
  border-radius:12px; padding:18px; box-shadow: 0 6px 16px rgba(2,6,23,0.04);
  ${({ $variant }) => $variant === 'enhanced' ? css` background: linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.96)); border:1px solid rgba(59,130,246,0.08); ` : css` background: #fff; border:1px solid rgba(0,0,0,0.04); `}
  .header { display:flex; justify-content:space-between; margin-bottom:12px; align-items:center; }
  .label { font-size:0.92rem; font-weight:700; color:#0f1724; display:flex; gap:8px; align-items:center; }
  .value { color: ${themeVars.primary}; font-family:'JetBrains Mono'; font-weight:800; background: rgba(59,130,246,0.06); padding:4px 8px; border-radius:6px; }
  input[type="range"] {
    width:100%; height:8px; border-radius:6px; background: linear-gradient(90deg,#e6eefb 0%, ${themeVars.primary} 0%, ${themeVars.primary} var(--value,50%), #e6eefb var(--value,50%), #e6eefb 100%);
    &::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background: linear-gradient(135deg, ${themeVars.primary}, #1d4ed8); cursor:pointer; box-shadow: 0 3px 10px rgba(59,130,246,0.18); border:2px solid white; }
    &:focus { box-shadow: 0 0 0 6px rgba(59,130,246,0.06); outline:none; }
  }
  .description { margin-top:8px; font-size:0.78rem; color:#64748b; line-height:1.44; }
`;

/* StatusIndicator */
export const StatusIndicator = styled.div<{
  $type: 'success' | 'info' | 'warning' | 'error' | 'doppler' | 'interference';
  $animate?: boolean;
}>`
  padding:10px; border-radius:8px; position:relative; border:1px solid rgba(0,0,0,0.04); background: rgba(255,255,255,0.02);
  ${({ $animate }) => $animate && css` animation: ${channelQualityPulse} 2s ease-in-out infinite; `}
  ${({ $type }) => {
    switch ($type) {
      case 'success': return css` background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.12); color: #059669; `;
      case 'info':    return css` background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.12); color: #2563eb; `;
      case 'warning': return css` background: rgba(245,158,11,0.06); border-color: rgba(245,158,11,0.12); color: #d97706; `;
      case 'error':   return css` background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.12); color: #dc2626; `;
      case 'doppler':
        return css`
          background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.12); color: #7c3aed;
          &::before { content:''; position:absolute; left:0; right:0; top:0; height:2px; background: linear-gradient(90deg, ${themeVars.primary}, ${themeVars.danger}); animation: ${interferencePattern} 2s linear infinite; }
        `;
      case 'interference': return css` background: rgba(236,72,153,0.06); border-color: rgba(236,72,153,0.12); color: #be185d; `;
    }
  }}
  .title { font-weight:700; margin-bottom:6px; }
  .subtitle { font-size:0.78rem; opacity:0.9; }
  ${motionReset}
`;

/* Grid utility */
export const Grid = styled.div<{ $columns: number; $gap?: string; $responsive?: boolean }>`
  display:grid; grid-template-columns: repeat(${p => p.$columns}, 1fr); gap: ${p => p.$gap || '1rem'};
  width:100%;
  ${({ $responsive = true }) => $responsive && css` @media (max-width:1024px){ grid-template-columns: repeat(2,1fr);} @media (max-width:768px){ grid-template-columns: 1fr;} `}
`;

/* SignalInput (form panel) */
export const SignalInput = styled(BasePanel)`
    .input-group { margin-bottom:16px;
    label { display:block; font-weight:700; color:#0f1724; margin-bottom:8px; font-size:0.88rem; }
    input, textarea, select {
      width:100%; padding:10px 14px; border:1.6px solid #e6eef6; border-radius:8px; font-size:0.9rem;
      transition: box-shadow 120ms ease, border-color 120ms ease;
      &:focus { outline:none; border-color: ${themeVars.primary}; box-shadow: 0 0 0 6px rgba(59,130,246,0.06); }
    }
    textarea { resize:vertical; min-height:78px; font-family:'JetBrains Mono', monospace; }
  }
  .bit-display { background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e6eef6; margin-top:10px;
    .bits { font-family:'JetBrains Mono', monospace; font-size:0.86rem; color:#0f1724; line-height:1.6; word-break:break-all; }
    .bit-stats { margin-top:8px; font-size:0.76rem; color:#64748b; }
  }
  .send-button { background: linear-gradient(135deg, ${themeVars.primary}, #2563eb); color:white; border:none; padding:10px 18px; border-radius:8px; font-weight:800; cursor:pointer; display:flex; gap:8px; align-items:center; transition: transform 140ms ease, box-shadow 140ms ease;
    &:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(59,130,246,0.18); }
    &:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }
  }
`;
