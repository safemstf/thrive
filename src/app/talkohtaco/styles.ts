// src/app/talkohtaco/styles.ts
/* TalkOhTaco — centralized styles with agent-driven palette and loading modal
   - Exported TS types for reuse
   - Tokenized colors & gradients
   - Loading modal & per-agent loading row styles included
   - All styled props use the $ prefix and are typed
*/

import styled, { css, keyframes } from 'styled-components';
import React from 'react';

/* =========================
   Exported Types
   ========================= */

export type AgentStatus = 'ready' | 'inDev';
export type AgentCategory = 'language' | 'coding' | 'creative';
export type ModelLoadingPhase = 'idle' | 'initializing' | 'downloading' | 'processing' | 'ready' | 'error';
export type AgentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface LoadingAgentState {
  agentId: number;
  progress: number;
  message: string;
  isComplete: boolean;
}

/* =========================
   Color Tokens & Agent Palette
   ========================= */

export const TOKENS = {
  background: '#0b1020',        // page / modal background (slightly off-black for contrast)
  surface: '#0f1724',           // card surfaces (dark card)
  surfaceAlt: '#0b1220',        // alt surfaces / hero
  panel: '#0b1220',
  textPrimary: '#e6eef8',
  textMuted: '#b6c2d6',
  border: 'rgba(255,255,255,0.04)',
  glass: 'rgba(255,255,255,0.04)',
};

/**
 * Primary agent accent colors (use these for progress bars, icons, badges).
 * These match the AGENTS_DATA color values you provided.
 */
export const AGENT_COLORS: Record<string, string> = {
  Lexi: '#3b82f6',   // blue
  Kai: '#ef4444',    // red
  Sana: '#8b5cf6',   // purple
  Mei: '#ec4899',    // pink
  Jax: '#f59e0b',    // orange
  Aria: '#10b981',   // green
  Pixel: '#06b6d4',  // teal
};

const gradient = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

/* Respect prefers-reduced-motion */
const reducedMotion = '@media (prefers-reduced-motion: reduce)';

/* =========================
   Animations
   ========================= */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.95; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.95; }
`;

/* Reduced motion helper */
const applyReducedMotion = css`
  ${reducedMotion} {
    animation: none !important;
    transition: none !important;
  }
`;

/* =========================
   Page / Hero / Layout
   ========================= */

export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 10% 10%, rgba(59,130,246,0.06), transparent 10%), ${TOKENS.background};
  color: ${TOKENS.textPrimary};
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  padding-bottom: 6rem;
`;

export const Hero = styled.section`
  padding: 4.5rem 1.25rem 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, ${TOKENS.surfaceAlt} 0%, rgba(255,255,255,0.02) 100%);
  border-bottom: 1px solid ${TOKENS.border};
  ${applyReducedMotion}

  &::before {
    content: "";
    position: absolute;
    width: 740px;
    height: 740px;
    border-radius: 50%;
    right: -18%;
    top: -28%;
    background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 55%);
    filter: blur(28px);
    z-index: 0;
    animation: ${float} 20s ease-in-out infinite;
  }
`;

export const HeroTitle = styled.h1`
  position: relative;
  z-index: 1;
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  font-weight: 800;
  margin: 0 0 0.5rem;
  color: ${TOKENS.textPrimary};
  display: inline-block;
`;

export const HeroSubtitle = styled.p`
  color: ${TOKENS.textMuted};
  max-width: 860px;
  margin: 0.4rem auto 1.25rem;
  font-size: 1rem;
`;

/* Controls & Search */
export const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  z-index: 1;
`;

export const SearchWrap = styled.div`
  position: relative;
  width: min(900px, 92%);
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 3.2rem 0.9rem 3rem;
  border-radius: 9999px;
  border: 1px solid ${TOKENS.border};
  background: rgba(255,255,255,0.02);
  color: ${TOKENS.textPrimary};
  font-size: 0.98rem;
  box-shadow: 0 6px 18px rgba(2,6,23,0.5);
  transition: box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease;

  &:focus, &:focus-visible {
    outline: none;
    box-shadow: 0 10px 30px rgba(59,130,246,0.08);
    transform: translateY(-1px);
    border-color: rgba(59,130,246,0.35);
  }

  &::placeholder { color: ${TOKENS.textMuted}; }
`;

/* Pills */
export const Pills = styled.div`
  display:flex;
  gap: .5rem;
  align-items:center;
  justify-content:center;
  flex-wrap:wrap;
`;

export const Pill = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? 'transparent' : 'rgba(255,255,255,0.02)'};
  color: ${({ $active }) => $active ? TOKENS.textPrimary : TOKENS.textMuted};
  border: 1px solid ${({ $active }) => $active ? 'rgba(255,255,255,0.06)' : TOKENS.border};
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;

  &:hover { transform: translateY(-2px); }
  &:focus-visible { outline: 3px solid rgba(59,130,246,0.07); }
`;

/* =========================
   Model Status & Load Button
   ========================= */

export const ModelStatusBar = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 96px;
  left: 50%;
  transform: translateX(-50%);
  background: ${gradient('#0b1220', '#0f1724')};
  color: ${TOKENS.textPrimary};
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(3,7,25,0.6);
  z-index: 1100;
  display: ${({ $isVisible }) => $isVisible ? 'flex' : 'none'};
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  animation: ${fadeInUp} 0.28s ease;
  ${applyReducedMotion}
`;

export const LoadAIButton = styled.button<{ $status: 'idle' | 'loading' | 'ready' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.95rem 1.6rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: ${({ $status }) => $status === 'loading' ? 'not-allowed' : 'pointer'};
  transition: transform .16s ease, box-shadow .16s ease;

  ${({ $status }) => {
    switch ($status) {
      case 'idle':
        return css`background: ${gradient('#3b82f6', '#7c3aed')}; color: white; box-shadow: 0 10px 30px rgba(59,130,246,0.18);`;
      case 'loading':
        return css`background: ${gradient('#f59e0b', '#d97706')}; color: black; box-shadow: 0 10px 30px rgba(245,158,11,0.14);`;
      case 'ready':
        return css`background: ${gradient('#10b981', '#059669')}; color: white; box-shadow: 0 10px 30px rgba(16,185,129,0.14);`;
    }
  }}

  &:focus-visible { outline: 3px solid rgba(255,255,255,0.04); }
`;

/* Spinning icon */
export const SpinningIcon = styled.div<{ $spinning: boolean }>`
  display: flex;
  align-items: center;
  animation: ${({ $spinning }) => $spinning ? `${spin} 1.8s linear infinite` : 'none'};
  ${reducedMotion} { animation: none; }
`;

/* =========================
   Agents Grid / Cards
   ========================= */

export const AgentsSection = styled.section`
  padding: 3rem 1.25rem 6rem;
  background: transparent;
`;

export const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

/* Card using dark surfaces and subtle border */
export const Card = styled.article<{ $status: AgentStatus; $disabled?: boolean }>`
  background: linear-gradient(180deg, ${TOKENS.surface} 0%, ${TOKENS.surfaceAlt} 100%);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 8px 30px rgba(2,6,23,0.55);
  transition: transform .22s cubic-bezier(.22,.9,.35,1), box-shadow .22s;
  border: 1px solid ${({ $status }) => ($status === 'inDev' ? 'rgba(245,158,11,0.08)' : 'transparent')};
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};

  &:hover { transform: translateY(-8px); }
`;

/* Basic text elements */
export const Name = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${TOKENS.textPrimary};
`;

export const Role = styled.p`
  margin: 0.35rem 0 1rem;
  color: ${TOKENS.textMuted};
  font-size: 0.9rem;
`;

/* Tag styles */
export const Tags = styled.div`
  display:flex;
  gap:0.4rem;
  justify-content:center;
  flex-wrap:wrap;
  margin-bottom: 0.9rem;
`;

export const Tag = styled.span`
  background: rgba(255,255,255,0.02);
  color: ${TOKENS.textMuted};
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-weight:600;
  font-size: 0.78rem;
`;

/* Action row & buttons */
export const ActionRow = styled.div`
  display:flex;
  gap: .6rem;
  justify-content:center;
  align-items:center;
`;

/* Primary/Secondary buttons */
export const StartBtn = styled.button<{ $disabled?: boolean; $variant?: 'primary' | 'secondary' }>`
  display:inline-flex;
  align-items:center;
  gap:0.5rem;
  padding:0.6rem 1rem;
  border-radius:999px;
  font-weight:700;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  transition: transform .12s ease, box-shadow .12s ease;

  ${({ $disabled, $variant = 'primary' }) => {
    if ($disabled) {
      return css`color: ${TOKENS.textMuted}; background: rgba(255,255,255,0.02); box-shadow: none;`;
    }
    if ($variant === 'secondary') {
      return css`background: rgba(255,255,255,0.02); color: ${TOKENS.textPrimary}; box-shadow: 0 6px 18px rgba(2,6,23,0.5); &:hover { transform: translateY(-1px); }`;
    }
    return css`color: white; background: ${gradient('#3b82f6', '#7c3aed')}; box-shadow: 0 10px 30px rgba(59,130,246,0.12); &:hover { transform: translateY(-1px); }`;
  }}
`;

/* Dev badge */
export const DevBadge = styled.span`
  display:inline-flex;
  gap:0.4rem;
  align-items:center;
  background: linear-gradient(90deg,#f59e0b,#d97706);
  color: white;
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  font-weight:700;
  font-size:0.78rem;
`;

/* Toast container */
export const ToastWrap = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  z-index: 9999;
  max-width: 92%;
`;

/* =========================
   Chat Interface (kept dark-friendly)
   ========================= */

export const ChatOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const ChatContainer = styled.div`
  background: linear-gradient(180deg, ${TOKENS.surface} 0%, ${TOKENS.surfaceAlt} 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 920px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(2,6,23,0.6);
  overflow: hidden;
`;

/* Header */
export const ChatHeader = styled.div`
  background: ${gradient('#0b1220', '#0f1724')};
  color: ${TOKENS.textPrimary};
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

/* Input area */
export const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid ${TOKENS.border};
  background: ${TOKENS.surfaceAlt};
`;

/* Text input */
export const TextInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 0.75rem;
  border: 1px solid ${TOKENS.border};
  border-radius: 12px;
  font-size: 0.875rem;
  resize: none;
  color: ${TOKENS.textPrimary};
  background: rgba(255,255,255,0.01);

  &:focus { box-shadow: 0 8px 28px rgba(59,130,246,0.06); outline: none; }
`;

/* =========================
   Loading Modal & Agent Loading Row
   ========================= */

/* Overlay modal background (high contrast dark) */
export const LoadingModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, rgba(2,6,23,0.7), rgba(2,6,23,0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12000;
  padding: 1rem;
`;

/* Modal card */
export const LoadingModalCard = styled.div`
  width: min(880px, 96%);
  background: linear-gradient(180deg, #071025 0%, #081226 100%);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 30px 90px rgba(2,6,23,0.8);
  color: ${TOKENS.textPrimary};
  animation: ${fadeInUp} 220ms ease;
`;

/* Header row inside modal */
export const LoadingModalHeader = styled.div`
  display:flex;
  gap:0.75rem;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 0.75rem;

  h3 { margin: 0; font-size: 1.125rem; }
  p { margin: 0; color: ${TOKENS.textMuted}; font-size: 0.875rem; }
`;

/* Container for the per-agent rows */
export const LoadingAgentsList = styled.div`
  display:flex;
  flex-direction:column;
  gap: 0.6rem;
  margin-top: 0.5rem;
`;

/* The per-agent loading row (matches user sketch) */
export const AgentLoadingItem = styled.div<{ $isComplete?: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 10px;
  background: ${({ $isComplete }) => $isComplete ? 'rgba(255,255,255,0.02)' : 'transparent'};
  transition: background 180ms ease, opacity 180ms ease;
  opacity: ${({ $isComplete }) => $isComplete ? 0.85 : 1};
`;

/* Icon container, tinted with agent accent (uses CSS prop $color) */
export const AgentLoadingIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ $color }) => `${$color}22`}; /* subtle tint */
  border-radius: 8px;
  color: ${({ $color }) => $color};
  flex-shrink: 0;

  svg { width: 18px; height: 18px; display: block; color: inherit; animation: ${spin} 1.2s linear infinite; }
`;

/* Info column */
export const AgentLoadingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;

  strong {
    font-size: 0.95rem;
    color: ${TOKENS.textPrimary};
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 0.78rem;
    color: ${TOKENS.textMuted};
    display: block;
  }
`;

/* compact progress bar */
export const AgentProgressBar = styled.div`
  width: 120px;
  height: 6px;
  background: rgba(255,255,255,0.04);
  border-radius: 999px;
  overflow: hidden;
  margin-left: 0.5rem;
`;

/* progress fill uses agent color; guard bounds and animate width */
export const AgentProgressFill = styled.div<{ $progress: number; $color: string }>`
  height: 100%;
  width: ${({ $progress }) => Math.max(0, Math.min(100, $progress))}%;
  background: linear-gradient(90deg, ${({ $color }) => $color}, ${({ $color }) => darken($color, 0.08)});
  border-radius: 999px;
  transition: width 260ms ease;
`;

/* small helper button row in modal */
export const LoadingModalActions = styled.div`
  display:flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 0.85rem;
`;

/* Utility: visually-hidden (for accessibility) */
export const VisuallyHidden = styled.span`
  position: absolute !important;
  height: 1px; width: 1px;
  overflow: hidden; clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap; border: 0; padding: 0; margin: -1px;
`;

/* =========================
   Small helpers: Ready badge, small components
   ========================= */

export const ReadyBadge = styled.div`
  display:inline-flex;
  gap:0.75rem;
  align-items:center;
  background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  color: ${TOKENS.textPrimary};
  padding: 0.6rem 1rem;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(2,6,23,0.6);
`;

/* =========================
   Helpers / small utils
   ========================= */

/**
 * Slight color darken (very tiny helper). Since styled-components does not
 * expose a builtin darken without an external lib, we provide a simple fallback.
 * This small function is intentionally tiny and conservative — use a real color
 * util (polished / tinycolor) if you need complex transformations.
 */
function darken(hex: string, amount = 0.06) {
  try {
    const normalized = hex.replace('#','');
    const bigint = parseInt(normalized.length === 3 ? normalized.split('').map(c => c+c).join('') : normalized, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
    const out = (r << 16) + (g << 8) + b;
    return `#${out.toString(16).padStart(6,'0')}`;
  } catch (err) {
    return hex;
  }
}

/* =========================
   Export default (none) — module exports the named components above
   ========================= */
