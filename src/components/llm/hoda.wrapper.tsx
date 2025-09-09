// src/components/llm/hoda.wrapper.tsx - Clean Professional Wrapper
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
}

type ViewMode = 'avatar' | 'full' | 'hidden';

export function HodaWrapper({
  className,
  initialMode = 'avatar',
  professionalMode = true, // Default to professional
  reduceMotion
}: HodaWrapperProps) {
  const [hodaStatus, setHodaStatus] = useState<AssistantStatus>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [isMinimized, setIsMinimized] = useState(false);
  // Handle hydration properly
  const [isClient, setIsClient] = useState(false);

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

  // Listen for system motion preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (e: MediaQueryListEvent) => setSystemReduceMotion(e.matches);

      // Listen for close panel events from embedded help
      const handleClosePanel = () => {
        setViewMode('avatar');
        setIsMinimized(false);
      };

      mediaQuery.addListener(handleChange);
      window.addEventListener('hoda-close-panel', handleClosePanel);
      
      return () => {
        mediaQuery.removeListener(handleChange);
        window.removeEventListener('hoda-close-panel', handleClosePanel);
      };
    }
  }, []);

  const shouldReduceMotion = reduceMotion || systemReduceMotion;

  const handleAvatarClick = () => {
    if (viewMode === 'avatar') {
      setViewMode('full');
    } else if (viewMode === 'full') {
      setIsMinimized(!isMinimized);
    }
  };

  const handleClose = () => {
    setViewMode('avatar');
    setIsMinimized(false);
  };

  const handleStatusChange = (status: AssistantStatus) => {
    setHodaStatus(status);
  };

  if (viewMode === 'hidden') return null;

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
            ariaLabel="HODA voice assistant - Click to open full interface"
            className="hoda-fixed-avatar"
          />

          {/* Status tooltip - only shows on hover, no automatic bubbles */}
          <StatusTooltip>
            {viewMode === 'avatar' ? 'Click to interact with HODA' : 'Click to minimize HODA'}
          </StatusTooltip>
        </AvatarContainer>
      )}

      {viewMode === 'full' && (
        <FullContainer $isMinimized={isMinimized} $reduceMotion={shouldReduceMotion}>
          <HeaderBar>
            <HeaderTitle>
              {/* Remove the small avatar from header since we're keeping the main one */}
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

export default HodaWrapper;