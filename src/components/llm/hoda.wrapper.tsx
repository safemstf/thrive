// src/components/llm/hoda.wrapper.tsx
'use client';

import { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import styled, { css, keyframes } from 'styled-components';
import Avatar, { type AssistantStatus } from './hoda.avatar';
import { HeaderBar, HeaderTitle, HeaderControls, ControlButton, LoadingBox } from './hoda.styles';

const HODA = lazy(() => import('./hoda'));

/* -------------------------------------------------------
   Routes where HODA should not appear at all
------------------------------------------------------- */
const SUPPRESSED_PREFIXES = ['/auth', '/login', '/register', '/error'];
const HIDDEN_KEY = 'hoda_hidden';

/* -------------------------------------------------------
   Animations
------------------------------------------------------- */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

/* -------------------------------------------------------
   Styled components — single fixed anchor column
------------------------------------------------------- */

/**
 * Single fixed anchor at bottom-right.
 * Children stack in column-reverse: avatar at bottom, panel above it.
 */
const Anchor = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  pointer-events: none;

  > * { pointer-events: auto; }
`;

const AvatarBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  outline-offset: 3px;
  flex-shrink: 0;

  /* subtle shadow so it lifts off any bg */
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.18));
  transition: transform 0.15s ease;

  &:hover  { transform: scale(1.06); }
  &:active { transform: scale(0.96); }
`;

const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  white-space: nowrap;
  background: rgba(0,0,0,0.75);
  color: #fff;
  font-size: 0.72rem;
  padding: 4px 8px;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;

  ${AvatarBtn}:hover ~ & { opacity: 1; }
`;

const AvatarWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Panel = styled.div<{ $reduceMotion: boolean }>`
  width: 380px;
  max-width: calc(100vw - 3rem);
  max-height: 560px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  ${({ $reduceMotion }) => !$reduceMotion && css`
    animation: ${slideUp} 0.22s cubic-bezier(0.34, 1.4, 0.64, 1);
  `}

  @media (max-width: 480px) {
    width: calc(100vw - 3rem);
    max-height: 72vh;
  }
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  /* thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(99,102,241,0.3) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
`;

/** Small tab on the right edge — only visible when HODA is hidden */
const RestoreTab = styled.button`
  position: fixed;
  bottom: 50%;
  right: 0;
  transform: translateY(50%);
  z-index: 9998;
  writing-mode: vertical-rl;
  text-orientation: mixed;

  background: linear-gradient(180deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  border-radius: 8px 0 0 8px;
  padding: 12px 7px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: auto;

  animation: ${fadeIn} 0.3s ease;

  &:hover {
    opacity: 1;
    transform: translateY(50%) translateX(-2px);
  }
`;

/* -------------------------------------------------------
   Props
------------------------------------------------------- */
interface HodaWrapperProps {
  className?: string;
  professionalMode?: boolean;
  reduceMotion?: boolean;
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */
export function HodaWrapper({ className, professionalMode = true, reduceMotion }: HodaWrapperProps) {
  const pathname = usePathname();

  const [isOpen, setIsOpen]     = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hodaStatus, setHodaStatus] = useState<AssistantStatus>('idle');
  const [isClient, setIsClient] = useState(false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  // Click-tracking via refs — immune to stale closures
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Hydration + restore preferences */
  useEffect(() => {
    setIsClient(true);

    try { setIsHidden(localStorage.getItem(HIDDEN_KEY) === 'true'); } catch { /* noop */ }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReduceMotion(mq.matches);
    const onMq = (e: MediaQueryListEvent) => setSystemReduceMotion(e.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  /* Global imperative events */
  useEffect(() => {
    if (!isClient) return;

    const persist = (hidden: boolean) => {
      try {
        hidden ? localStorage.setItem(HIDDEN_KEY, 'true') : localStorage.removeItem(HIDDEN_KEY);
      } catch { /* noop */ }
    };

    const onHide = () => { setIsHidden(true);  setIsOpen(false); persist(true);  };
    const onShow = () => { setIsHidden(false);                   persist(false); };
    const onClosePanel = () => setIsOpen(false);

    window.addEventListener('hoda-hide', onHide);
    window.addEventListener('hoda-show', onShow);
    window.addEventListener('hoda-close-panel', onClosePanel);
    return () => {
      window.removeEventListener('hoda-hide', onHide);
      window.removeEventListener('hoda-show', onShow);
      window.removeEventListener('hoda-close-panel', onClosePanel);
    };
  }, [isClient]);

  /* Avatar click — single = toggle panel, double = hide */
  const handleAvatarClick = useCallback(() => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      const n = clickCountRef.current;
      clickCountRef.current = 0;

      if (n === 1) {
        setIsOpen(prev => !prev);
      } else if (n >= 2) {
        setIsHidden(true);
        setIsOpen(false);
        try { localStorage.setItem(HIDDEN_KEY, 'true'); } catch { /* noop */ }
      }
    }, 280);
  }, []);

  const handleRestore = useCallback(() => {
    setIsHidden(false);
    try { localStorage.removeItem(HIDDEN_KEY); } catch { /* noop */ }
  }, []);

  const handleHide = useCallback(() => {
    setIsHidden(true);
    setIsOpen(false);
    try { localStorage.setItem(HIDDEN_KEY, 'true'); } catch { /* noop */ }
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  /* Guard: SSR + suppressed routes */
  const isSuppressed = SUPPRESSED_PREFIXES.some(p => pathname?.startsWith(p));
  if (!isClient || isSuppressed) return null;

  const shouldReduceMotion = reduceMotion || systemReduceMotion;

  /* Hidden state — show the slim restore tab on the right edge */
  if (isHidden) {
    return <RestoreTab onClick={handleRestore} aria-label="Show HODA assistant">HODA</RestoreTab>;
  }

  return (
    <Anchor className={className}>
      {/* Panel stacks above the avatar (column flex, avatar is last child) */}
      {isOpen && (
        <Panel $reduceMotion={shouldReduceMotion} role="dialog" aria-label="HODA assistant panel">
          <HeaderBar>
            <HeaderTitle>HODA Assistant</HeaderTitle>
            <HeaderControls>
              <ControlButton
                onClick={handleHide}
                aria-label="Hide HODA"
                title="Hide — restores via tab on right edge"
                style={{ fontSize: '13px' }}
              >
                👁️
              </ControlButton>
              <ControlButton onClick={handleClose} aria-label="Close panel" title="Close">
                ×
              </ControlButton>
            </HeaderControls>
          </HeaderBar>

          <PanelBody>
            <Suspense fallback={<LoadingBox>Loading HODA…</LoadingBox>}>
              <HODA
                position="embedded"
                autoStart={false}
                onStatusChange={setHodaStatus}
                className="hoda-embedded"
              />
            </Suspense>
          </PanelBody>
        </Panel>
      )}

      {/* Avatar always at the bottom of the anchor */}
      <AvatarWrap>
        <AvatarBtn
          onClick={handleAvatarClick}
          aria-label={isOpen ? 'Close HODA panel' : 'Open HODA — double-click to hide'}
          aria-expanded={isOpen}
        >
          <Avatar
            size={58}
            status={hodaStatus}
            showStatusIndicator={isOpen}
            professionalMode={professionalMode}
            reduceMotion={shouldReduceMotion}
          />
        </AvatarBtn>
        {!isOpen && (
          <Tooltip aria-hidden>
            Click to chat · Double-click to hide
          </Tooltip>
        )}
      </AvatarWrap>
    </Anchor>
  );
}

/* Imperative helpers */
export const hideHoda = () =>
  typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('hoda-hide'));

export const showHoda = () =>
  typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('hoda-show'));

export default HodaWrapper;
