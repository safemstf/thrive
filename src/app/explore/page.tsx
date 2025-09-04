'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled, { css, keyframes } from "styled-components";

import { MOCK_PORTFOLIOS } from "@/data/mockData";
import type { Portfolio } from "@/types/portfolio.types";

/* ---------------------------
   Golden Ratio & Sizing System
   --------------------------- */
const GOLDEN_RATIO = 1.618;
const scale = 600;
const sizes = {
  featured: scale,
  orbit1: scale / (GOLDEN_RATIO * 2),
  orbit2: scale / (GOLDEN_RATIO ** 2.5),
  orbit3: scale / (GOLDEN_RATIO ** 3.5),
};

const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
};

const media = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
  xl: `@media (max-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`
};

/* ---------------------------
   Animations
   --------------------------- */
const orbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const floatGentle = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const LoadingDiv = styled.div`
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/* ---------------------------
   Main page layout
   --------------------------- */
const CosmicPage = styled.main`
  min-height: 100vh;
  background: linear-gradient(180deg,
    #ffffffff 0%,
    #f3f3f3ff 28%,
    #81a5dfff 50%,
    #f3f3f3ff 88%,
    #ffffffff 100%
  );
  color: var(--color-text-primary);
  font-family: var(--font-body);
  overflow-x: hidden;
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(59,130,246,0.06) 0%, transparent 40%),
      radial-gradient(circle at 80% 60%, rgba(139,92,246,0.04) 0%, transparent 40%);
    pointer-events: none;
    z-index: 1;
  }
`;

const CosmicContainer = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;

  ${media.lg} {
    padding: 2.5rem 1.5rem;
  }

  ${media.md} {
    padding: 2rem 1.25rem;
  }

  ${media.sm} {
    padding: 1.5rem 1rem;
  }
`;

/* ---------------------------
   Search Bar
   --------------------------- */
const SearchSection = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
  border-radius: 9999px;
  background: rgba(64, 93, 221, 0.67)
`;

const SearchContainer = styled.div<{ $focused: boolean }>`
  position: relative;
  background: rgba(255, 255, 255, 0.67)
  backdrop-filter: blur(10px);
  border: 2px solid ${({ $focused }) =>
    $focused ? 'rgba(255, 255, 255, 0.67)' : 'rgba(255,255,255,0.08)'};
  box-shadow: ${({ $focused }) =>
    $focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none'};
  transition: all 200ms ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: 15px;
  font-family: var(--font-body);
  padding: 14px 0;
  min-width: 0;

  &::placeholder {
    color: rgba(255, 255, 255, 0.73);
  }

  ${media.sm} {
    font-size: 14px;
    padding: 12px 0;
  }
`;

const ClearButton = styled.button<{ $visible: boolean }>`
  width: 28px;
  height: 28px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  cursor: pointer;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transform: scale(${({ $visible }) => $visible ? 1 : 0.8});
  transition: all 200ms ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-primary-500);
    color: white;
    transform: scale(1.1);
  }
`;

/* ---------------------------
   Header - Smaller text
   --------------------------- */
const CosmicHeader = styled.header`
  text-align: center;
  margin-bottom: 2.5rem;
  ${css`animation: ${fadeInUp} 600ms ease both;`}

  ${media.md} {
    margin-bottom: 2rem;
  }
`;

const CosmicTitle = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  font-family: var(--font-display);
  background: linear-gradient(135deg,
    #60A5FA 0%,
    #A78BFA 50%,
    #F472B6 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const CosmicSubtitle = styled.p`
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  color: rgba(255,255,255,0.5);
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

const FilterConstellation = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  ${media.sm} {
    margin-bottom: 1rem;
  }
`;

const FilterStar = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid ${({ $active }) =>
    $active ? 'transparent' : 'rgba(255,255,255,0.1)'};
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
      : 'rgba(145, 65, 134, 0.4)'};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255,255,255,0.6)'};
  font-weight: ${({ $active }) => $active ? 600 : 500};
  font-size: 13px;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59,130,246,0.2);
  }

  ${media.sm} {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const StatsGalaxy = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 14px;
  color: rgba(255,255,255,0.4);

  strong {
    color: #60A5FA;
    font-weight: 600;
    font-size: 16px;
  }

  ${media.md} {
    margin-bottom: 2rem;
  }
`;

/* ---------------------------
   Featured Planet - Larger with smaller text
   --------------------------- */
const CentralPlanetWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 3rem auto 6rem;
  position: relative;
  padding: 0;

  ${media.md} {
    margin: 2rem auto 4rem;
  }

  ${media.sm} {
    margin: 1.5rem auto 3rem;
  }
`;

const FeaturedOrb = styled.div`
  width: ${sizes.featured}px;
  height: ${sizes.featured}px;
  border-radius: 50%;
  position: relative;
  overflow: visible;
  background: linear-gradient(145deg,
    rgba(59,130,246,0.08) 0%,
    rgba(139,92,246,0.04) 100%
  );
  border: 2px solid rgba(255,255,255,0.08);
  box-shadow:
    0 20px 60px rgba(59,130,246,0.15),
    inset 0 0 60px rgba(139,92,246,0.05);
  ${css`animation: ${floatGentle} 8s ease-in-out infinite;`}

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: conic-gradient(
      from 0deg,
      transparent,
      rgba(59,130,246,0.3),
      rgba(139,92,246,0.2),
      transparent
    );
    border-radius: 50%;
    ${css`animation: ${orbit} 20s linear infinite;`}
    z-index: -1;
  }

  ${media.lg} {
    width: 400px;
    height: 400px;
  }

  ${media.md} {
    width: 340px;
    height: 340px;
  }

  ${media.sm} {
    width: min(280px, 75vw);
    height: min(280px, 75vw);
  }
`;

const PlanetSlide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $active }) => $active ? 1 : 0};
  transform: scale(${({ $active }) => $active ? 1 : 0.9});
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
`;

const PlanetNavigation = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% + 100px);
  left: -50px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;

  ${media.sm} {
    width: calc(100% + 60px);
    left: -30px;
  }
`;

const NavButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 200ms ease;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  pointer-events: all;

  &:hover {
    background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
    border-color: transparent;
    transform: scale(1.1);
  }

  ${media.sm} {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
`;

const PlayButton = styled(NavButton)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  font-size: 12px;
`;

const PlanetInfo = styled.div`
  position: absolute;
  bottom: -70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 12px 24px;
  text-align: center;
  min-width: 260px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.3);

  h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255,255,255,0.95);
  }

  p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    line-height: 1.4;
  }

  ${media.sm} {
    bottom: -60px;
    padding: 10px 20px;
    min-width: 220px;

    h3 {
      font-size: 16px;
    }

    p {
      font-size: 12px;
    }
  }
`;

const PlanetActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 8px 20px;
  border-radius: 9999px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  min-width: 80px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59,130,246,0.3);
  }

  &.secondary {
    background: transparent;
    border: 2px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.8);

    &:hover {
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.3);
    }
  }

  ${media.sm} {
    padding: 6px 16px;
    font-size: 12px;
    min-width: 70px;
  }
`;

/* ---------------------------
   Orbital System - Larger circles, better spacing
   --------------------------- */
const OrbitSystem = styled.section`
  position: relative;
  display: grid;
  gap: 4rem 3rem;
  grid-template-columns: repeat(auto-fill, minmax(${sizes.orbit1}px, 1fr));
  justify-items: center;
  align-items: start;
  margin: 4rem 0 2rem;
  padding: 2rem 0;

  ${media.xl} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 3.5rem 2.5rem;
  }

  ${media.lg} {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 3rem 2rem;
  }

  ${media.md} {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 2.5rem 1.5rem;
  }

  ${media.sm} {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem 1rem;
    padding: 1rem 0;
  }
`;

const UserPlanet = styled.article<{ $size: number; $delay: number; $tier: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  ${({ $delay, $tier }) => css`
    animation:
      ${fadeInUp} 600ms ease both,
      ${floatGentle} ${8 + $tier * 2}s ease-in-out infinite;
    animation-delay: ${$delay * 100}ms, ${$delay * 200}ms;
  `}
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: ${({ $tier }) =>
    $tier === 1
      ? 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.2))'
      : $tier === 2
        ? 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(244,114,182,0.2))'
        : 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(96,165,250,0.15))'
  };
    opacity: 0;
    transition: opacity 300ms ease;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-8px) scale(1.05);
    z-index: 20;

    &::before {
      opacity: 1;
    }
  }

  ${media.lg} {
    width: ${({ $size }) => $size * 0.9}px;
    height: ${({ $size }) => $size * 0.9}px;
  }

  ${media.md} {
    width: ${({ $size }) => $size * 0.8}px;
    height: ${({ $size }) => $size * 0.8}px;
  }

  ${media.sm} {
    width: ${({ $size }) => Math.min($size * 0.7, 120)}px;
    height: ${({ $size }) => Math.min($size * 0.7, 120)}px;

    &:hover {
      transform: translateY(-4px) scale(1.02);
    }
  }
`;

/* ---------------------------
   CHANGED PlanetSurface: layered cover + replacement
   --------------------------- */
const PlanetSurface = styled.div<{ $hasImage: boolean; $tier: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ $hasImage, $tier }) =>
    $hasImage
      ? 'transparent'
      : $tier === 1
        ? 'linear-gradient(145deg, rgba(96,165,250,0.08), rgba(167,139,250,0.04))'
        : $tier === 2
          ? 'linear-gradient(145deg, rgba(167,139,250,0.08), rgba(244,114,182,0.04))'
          : 'linear-gradient(145deg, rgba(244,114,182,0.08), rgba(96,165,250,0.04))'
  };
  border: 2px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 10px 30px rgba(0,0,0,0.2),
    inset 0 0 30px rgba(255,255,255,0.03);

  /* layering to support hover-replace */
  .cover,
  .replacement {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 260ms cubic-bezier(0.4,0,0.2,1), transform 260ms cubic-bezier(0.4,0,0.2,1);
    will-change: opacity, transform;
    backface-visibility: hidden;
  }

  /* .cover contains the Image (Next/Image with fill will work) or initials */
  .cover {
    z-index: 1;
    opacity: 1;
    transform: scale(1);
    background: transparent;
  }

  /* .replacement is the card that replaces the cover on hover */
  .replacement {
    z-index: 3;
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    pointer-events: none;
    padding: 8px;
    text-align: center;
    color: rgba(255,255,255,0.95);
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
  }

  /* show replacement when parent is hovered */
  ${UserPlanet}:hover &,
  &:hover {
    .cover {
      opacity: 0;
      transform: scale(1.05);
      pointer-events: none;
    }
    .replacement {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cover, .replacement { transition: none; }
    ${UserPlanet}:hover &,
    &:hover {
      .cover { opacity: 0; }
      .replacement { opacity: 1; }
    }
  }
`;

const PlanetTag = styled.div`
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);

  ${UserPlanet}:hover & {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.2);
  }

  ${media.sm} {
    bottom: -24px;
    padding: 3px 8px;
  }
`;

const MiniAvatar = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.08));
  flex-shrink: 0;

  ${media.sm} {
    width: 18px;
    height: 18px;
  }
`;

const TagInfo = styled.div`
  padding-right: 4px;

  .name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    line-height: 1.1;
  }

  .role {
    font-size: 10px;
    color: rgba(255,255,255,0.4);
    line-height: 1.1;
    margin-top: 1px;
  }

  ${media.sm} {
    .name {
      font-size: 11px;
    }

    .role {
      font-size: 9px;
    }
  }
`;

const EmptyVoid = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;

  h3 {
    font-size: 1.75rem;
    background: linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  p {
    color: rgba(255,255,255,0.4);
    font-size: 1rem;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

/* ---------------------------
   Helper functions
   --------------------------- */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

const getPlanetSizeAndTier = (index: number): { size: number; tier: number } => {
  const pattern = index % 9;
  if (pattern < 3) return { size: sizes.orbit1, tier: 1 };
  if (pattern < 6) return { size: sizes.orbit2, tier: 2 };
  return { size: sizes.orbit3, tier: 3 };
};

const getItemKey = (p: Partial<Portfolio> & { id?: string; username?: string; name?: string }, i: number) => {
  if (p.username) return p.username;
  if ((p as any).id) return String((p as any).id);
  const slug = (p.name || 'user').toString().trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return `${slug}-${i}`;
};

const getProfileHref = (p: Partial<Portfolio> & { id?: string; username?: string; name?: string }) => {
  const handle = p.username ?? (p.id ? String(p.id) : (p.name || 'user').toString().trim().toLowerCase().replace(/\s+/g, '-'));
  return `/portfolio/${encodeURIComponent(handle)}`;
};

/* ---------------------------
   Components
   --------------------------- */
function EnhancedSearch({ query, setQuery, isSearching }: {
  query: string;
  setQuery: (s: string) => void;
  isSearching: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    inputRef.current?.focus();
  }, [setQuery]);

  return (
    <SearchSection>
      <SearchContainer $focused={focused}>
        <SearchInputWrapper>
          <SearchInput
            ref={inputRef}
            placeholder="Search creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Search portfolios"
          />

          <ClearButton
            $visible={!!query}
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </ClearButton>
        </SearchInputWrapper>

        {isSearching && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            borderRadius: '0 0 999px 999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: 'rgba(255,255,255,0.5)',
              animation: `${shimmer} 1s infinite`
            }} />
          </div>
        )}
      </SearchContainer>
    </SearchSection>
  );
}

function FeaturedPlanet({ profiles }: { profiles: Portfolio[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showConnectFeedback, setShowConnectFeedback] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex(i => profiles.length ? (i + 1) % profiles.length : 0);
  }, [profiles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(i => profiles.length ? (i - 1 + profiles.length) % profiles.length : 0);
  }, [profiles.length]);

  const handleConnect = useCallback(() => {
    setShowConnectFeedback(true);
    setTimeout(() => setShowConnectFeedback(false), 2000);
  }, []);

  useEffect(() => {
    if (!isPlaying || profiles.length <= 1) return;

    intervalRef.current = window.setInterval(nextSlide, 5000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, profiles.length, nextSlide]);

  if (!profiles.length) {
    return (
      <CentralPlanetWrapper>
        <FeaturedOrb>
          <div style={{
            display: 'grid',
            placeItems: 'center',
            height: '100%',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '16px'
          }}>
            Discovering creators...
          </div>
        </FeaturedOrb>
      </CentralPlanetWrapper>
    );
  }

  const current = profiles[currentIndex];

  return (
    <CentralPlanetWrapper>
      <FeaturedOrb role="region" aria-label="Featured profiles">
        <PlanetNavigation>
          <NavButton onClick={prevSlide} aria-label="Previous profile" type="button">
            ‹
          </NavButton>
          <NavButton onClick={nextSlide} aria-label="Next profile" type="button">
            ›
          </NavButton>
        </PlanetNavigation>

        <PlayButton
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          type="button"
        >
          {isPlaying ? '❚❚' : '▶'}
        </PlayButton>

        {profiles.map((profile, idx) => {
          const isActive = idx === currentIndex;
          const imageSrc = profile.profileImage || profile.coverImage;

          return (
            <PlanetSlide
              key={getItemKey(profile, idx)}
              $active={isActive}
              aria-hidden={!isActive}
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={`${profile.name || profile.username} profile`}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={idx === 0}
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, (max-width: 1024px) 400px, 480px"
                />
              ) : (
                <div style={{
                  fontSize: '72px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {getInitials(profile.name || profile.username)}
                </div>
              )}
            </PlanetSlide>
          );
        })}

        <PlanetInfo>
          <h3>{current?.name || `@${current?.username}`}</h3>
          <p>{current?.title || current?.tagline || current?.kind}</p>
          <PlanetActions>
            <Link href={getProfileHref(current)} style={{ textDecoration: 'none' }}>
              <ActionButton type="button">Explore</ActionButton>
            </Link>
            <ActionButton
              className="secondary"
              type="button"
              onClick={handleConnect}
            >
              {showConnectFeedback ? '✓ Sent' : 'Connect'}
            </ActionButton>
          </PlanetActions>
        </PlanetInfo>
      </FeaturedOrb>
    </CentralPlanetWrapper>
  );
}

const OrbitingUser = React.memo(function _OrbitingUser({
  profile,
  index
}: {
  profile: Portfolio;
  index: number;
}) {
  const { size, tier } = getPlanetSizeAndTier(index);
  const delay = (index % 8) * 0.15;
  const initials = getInitials(profile.name || profile.username);

  return (
    <Link
      href={getProfileHref(profile)}
      style={{ textDecoration: 'none' }}
      aria-label={`Visit ${profile.name || profile.username}'s profile`}
    >
      <UserPlanet $size={size} $delay={delay} $tier={tier}>
        <PlanetSurface $hasImage={!!profile.coverImage} $tier={tier}>
          {/* COVER LAYER (image or initials) */}
          <div className="cover" aria-hidden="false">
            {profile.coverImage ? (
              <Image
                src={profile.coverImage}
                alt={`${profile.name || profile.username}'s cover`}
                fill
                style={{ objectFit: 'cover' }}
                loading="lazy"
                sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, 200px"
              />
            ) : (
              <div style={{
                fontSize: `${Math.round(size / 3.5)}px`,
                fontWeight: 700,
                background: `linear-gradient(135deg,
                  ${tier === 1 ? '#60A5FA 0%, #A78BFA' :
                    tier === 2 ? '#A78BFA 0%, #F472B6' :
                      '#F472B6 0%, #60A5FA'} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* REPLACEMENT LAYER (shown on hover; centered card inside planet) */}
          <div className="replacement" aria-hidden="true">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: Math.min(56, size * 0.4),
                height: Math.min(56, size * 0.4),
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.12)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(167,139,250,0.08))',
                position: 'relative'
              }}>
                {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.name || profile.username}
                    fill
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: Math.min(20, Math.round(size / 6)),
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.9)'
                  }}>
                    {initials.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                  {profile.name || `@${profile.username}`}
                </div>
                {profile.title && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                    {profile.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PlanetSurface>

        <PlanetTag>
          <MiniAvatar>
            {profile.profileImage ? (
              <Image
                src={profile.profileImage}
                alt={profile.name || profile.username}
                fill
                style={{ objectFit: 'cover' }}
                loading="lazy"
                sizes="20px"
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                fontSize: '10px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)'
              }}>
                {initials.charAt(0)}
              </div>
            )}
          </MiniAvatar>

          <TagInfo>
            <div className="name">
              {profile.name || `@${profile.username}`}
            </div>
            {profile.title && (
              <div className="role">
                {profile.title}
              </div>
            )}
          </TagInfo>
        </PlanetTag>
      </UserPlanet>
    </Link>
  );
});

/* ---------------------------
   Main component
   --------------------------- */
export default function CosmicExplorePage() {
  const [portfolios, setPortfolios] = useState<Portfolio[] | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 350);
  const isSearching = query !== debouncedQuery;

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setPortfolios(Object.values(MOCK_PORTFOLIOS));
      setIsLoading(false);
    };

    loadData();
  }, []);

  const allPortfolios = useMemo(() => portfolios ?? [], [portfolios]);

  const kinds = useMemo(() => {
    const kindSet = new Set<string>();
    allPortfolios.forEach(p => {
      if (p.kind) kindSet.add(p.kind);
    });
    return ["all", ...Array.from(kindSet)];
  }, [allPortfolios]);

  const featuredProfiles = useMemo(() => {
    const withImages = allPortfolios.filter(p => p.profileImage || p.coverImage);
    if (withImages.length >= 4) {
      return withImages
        .sort((a, b) => (b.stats?.averageRating ?? 0) - (a.stats?.averageRating ?? 0))
        .slice(0, 8);
    }
    return allPortfolios.slice(0, Math.min(8, allPortfolios.length));
  }, [allPortfolios]);

  const filteredProfiles = useMemo(() => {
    const searchTerm = debouncedQuery.trim().toLowerCase();

    return allPortfolios.filter(profile => {
      if (kindFilter !== "all" && profile.kind !== kindFilter) {
        return false;
      }

      if (!searchTerm) return true;

      const searchableText = [
        profile.username || "",
        profile.name || "",
        profile.title || "",
        profile.tagline || "",
        ...(profile.tags || []),
        ...(profile.specializations || [])
      ].join(" ").toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [allPortfolios, kindFilter, debouncedQuery]);

  if (isLoading) {
    return (
      <CosmicPage>
        <CosmicContainer>
          <CosmicHeader>
            <CosmicTitle>Cosmic Creators</CosmicTitle>
            <CosmicSubtitle>
              Loading universe...
            </CosmicSubtitle>
          </CosmicHeader>

          <CentralPlanetWrapper>
            <FeaturedOrb>
              <div style={{
                display: 'grid',
                placeItems: 'center',
                height: '100%',
                color: 'rgba(255,255,255,0.3)'
              }}>

                <LoadingDiv>Loading...</LoadingDiv>
              </div>
            </FeaturedOrb>
          </CentralPlanetWrapper>
        </CosmicContainer>
      </CosmicPage>
    );
  }

  return (
    <CosmicPage>
      <CosmicContainer>
        <CosmicHeader>
          <CosmicTitle>Cosmic Creators</CosmicTitle>
          <CosmicSubtitle>
            Explore the creative universe
          </CosmicSubtitle>
        </CosmicHeader>

        <EnhancedSearch
          query={query}
          setQuery={setQuery}
          isSearching={isSearching}
        />

        <FilterConstellation role="group" aria-label="Filter by kind">
          {kinds.slice(0, 8).map(kind => (
            <FilterStar
              key={kind}
              $active={kindFilter === kind}
              onClick={() => setKindFilter(kind)}
              type="button"
              aria-pressed={kindFilter === kind}
            >
              {kind}
            </FilterStar>
          ))}
        </FilterConstellation>

        <StatsGalaxy>
          <strong>{filteredProfiles.length}</strong> creators found
        </StatsGalaxy>

        <FeaturedPlanet profiles={featuredProfiles} />

        <OrbitSystem role="region" aria-label="Portfolio grid">
          {filteredProfiles.length === 0 ? (
            <EmptyVoid>
              <h3>Empty Space</h3>
              <p>No creators found. Try adjusting your search.</p>
            </EmptyVoid>
          ) : (
            filteredProfiles.map((profile, index) => (
              <OrbitingUser
                key={getItemKey(profile, index)}
                profile={profile}
                index={index}
              />
            ))
          )}
        </OrbitSystem>
      </CosmicContainer>
    </CosmicPage>
  );
}
