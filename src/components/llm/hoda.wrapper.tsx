// src/components/llm/hoda.wrapper.tsx - Clean Professional Wrapper with Hide
'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import Avatar, { type AssistantStatus } from './hoda.avatar';

// Import ALL wrapper components from consolidated styles
import {
  WrapperContainer,
  AvatarContainer,
  StatusTooltip,
  FullContainer,
  HeaderBar,
  HeaderTitle,
  HeaderControls,
  ControlButton,
  ContentContainer,
  LoadingBox,
} from './hoda.styles';

// Lazy load the full HODA component
const HODA = lazy(() => import('./hoda'));

interface HodaWrapperProps {
  className?: string;
  initialMode?: 'avatar' | 'full' | 'hidden';
  professionalMode?: boolean;
  reduceMotion?: boolean;
  showHideOption?: boolean; // New prop to control if hide option is available
}

type ViewMode = 'avatar' | 'full' | 'hidden';

export function HodaWrapper({
  className,
  initialMode = 'avatar',
  professionalMode = true,
  reduceMotion,
  showHideOption = true // Default to showing hide option
}: HodaWrapperProps) {
  const [hodaStatus, setHodaStatus] = useState<AssistantStatus>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Track clicks for double-click to hide functionality
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check system preference for reduced motion
  const [systemReduceMotion, setSystemReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Listen for system motion preference changes and custom events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (e: MediaQueryListEvent) => setSystemReduceMotion(e.matches);

      // Listen for close panel events from embedded help
      const handleClosePanel = () => {
        setViewMode('avatar');
        setIsMinimized(false);
      };

      // Listen for hide HODA events (can be triggered globally)
      const handleHideHoda = () => {
        setViewMode('hidden');
        setIsMinimized(false);
      };

      // Listen for show HODA events (can be triggered globally)
      const handleShowHoda = () => {
        setViewMode('avatar');
        setIsMinimized(false);
      };

      mediaQuery.addListener(handleChange);
      window.addEventListener('hoda-close-panel', handleClosePanel);
      window.addEventListener('hoda-hide', handleHideHoda);
      window.addEventListener('hoda-show', handleShowHoda);

      return () => {
        mediaQuery.removeListener(handleChange);
        window.removeEventListener('hoda-close-panel', handleClosePanel);
        window.removeEventListener('hoda-hide', handleHideHoda);
        window.removeEventListener('hoda-show', handleShowHoda);
        // Clean up click timer on unmount
        if (clickTimer) {
          clearTimeout(clickTimer);
        }
      };
    }
  }, [clickTimer]);

  const shouldReduceMotion = reduceMotion || systemReduceMotion;

  // Handle clicks for double-click to hide functionality
  const handleAvatarClick = () => {
    if (!showHideOption) {
      // Normal behavior when hide option is disabled
      if (viewMode === 'avatar') {
        setViewMode('full');
      } else if (viewMode === 'full') {
        setIsMinimized(!isMinimized);
      }
      return;
    }

    // Handle double-click to hide when hide option is enabled
    setClickCount(prev => prev + 1);

    if (clickTimer) {
      clearTimeout(clickTimer);
    }

    const timer = setTimeout(() => {
      if (clickCount === 1) {
        // Single click - normal behavior
        if (viewMode === 'avatar') {
          setViewMode('full');
        } else if (viewMode === 'full') {
          setIsMinimized(!isMinimized);
        }
      } else if (clickCount === 2) {
        // Double click - hide HODA
        setViewMode('hidden');
      }
      setClickCount(0);
    }, 300);

    setClickTimer(timer);
  };

  const handleClose = () => {
    setViewMode('avatar');
    setIsMinimized(false);
  };

  const handleHide = () => {
    setViewMode('hidden');
    setIsMinimized(false);
  };

  const handleStatusChange = (status: AssistantStatus) => {
    setHodaStatus(status);
  };

  // Completely hidden - return null
  if (viewMode === 'hidden') {
    return null;
  }

  // Render minimal server-side version before hydration
  if (!isClient) {
    return (
      <WrapperContainer className={className}>
        {viewMode === 'avatar' && (
          <AvatarContainer $reduceMotion={true}>
            <Avatar
              size={64}
              status="idle"
              showStatusIndicator={false}
              professionalMode={professionalMode}
              reduceMotion={true}
              ariaLabel="HODA voice assistant - Loading..."
              className="hoda-fixed-avatar"
            />
          </AvatarContainer>
        )}
      </WrapperContainer>
    );
  }

  return (
    <WrapperContainer className={className}>
      {/* Keep avatar visible in both 'avatar' and 'full' modes */}
      {(viewMode === 'avatar' || viewMode === 'full') && (
        <AvatarContainer $reduceMotion={shouldReduceMotion}>
          <Avatar
            size={164}
            status={hodaStatus}
            showStatusIndicator={true}
            onClick={handleAvatarClick}
            professionalMode={professionalMode}
            reduceMotion={shouldReduceMotion}
            ariaLabel={
              showHideOption
                ? "HODA voice assistant - Click to interact, double-click to hide"
                : "HODA voice assistant - Click to interact"
            }
            className="hoda-fixed-avatar"
          />

          {/* Status tooltip - shows interaction hints */}
          <StatusTooltip>
            {viewMode === 'avatar'
              ? (showHideOption ? 'Click to interact • Double-click to hide' : 'Click to interact with HODA')
              : 'Click to minimize HODA'
            }
          </StatusTooltip>
        </AvatarContainer>
      )}

      {viewMode === 'full' && (
        <FullContainer $isMinimized={isMinimized} $reduceMotion={shouldReduceMotion}>
          <HeaderBar>
            <HeaderTitle>
              HODA Assistant
            </HeaderTitle>
            <HeaderControls>
              <ControlButton
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Expand HODA interface" : "Minimize HODA interface"}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? '▲' : '▼'}
              </ControlButton>

              {/* Show hide button if option is enabled */}
              {showHideOption && (
                <ControlButton
                  onClick={handleHide}
                  aria-label="Hide HODA completely"
                  title="Hide HODA"
                  style={{ fontSize: '14px' }}
                >
                  👁️
                </ControlButton>
              )}

              <ControlButton
                onClick={handleClose}
                aria-label="Close HODA interface and return to avatar mode"
                title="Close"
              >
                ×
              </ControlButton>
            </HeaderControls>
          </HeaderBar>

          {!isMinimized && (
            <ContentContainer>
              <Suspense fallback={<LoadingBox>Loading HODA...</LoadingBox>}>
                <HODA
                  position="embedded"
                  autoStart={false}
                  onStatusChange={handleStatusChange}
                  className="hoda-embedded"
                />
              </Suspense>
            </ContentContainer>
          )}
        </FullContainer>
      )}
    </WrapperContainer>
  );
}

// Helper functions to show/hide HODA from anywhere in the app
export const hideHoda = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hoda-hide'));
  }
};

export const showHoda = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hoda-show'));
  }
};

export default HodaWrapper;