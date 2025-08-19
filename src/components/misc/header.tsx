'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import logoLight from '../../../public/assets/logo3.png';
import logoDark from '../../../public/assets/logo3-dark.png';
import { Taskbar } from './taskbar';
import { useMatrix } from '@/hooks/useMatrix';
import { useDarkMode } from '@/providers/darkModeProvider';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/*
  REPLACED: previous throttle + rAF approach with a stable rAF-driven scroll loop.
  - Uses refs to store last scroll and visibility to avoid unnecessary setState calls.
  - Uses requestAnimationFrame and a single scroll handler to be reliable and low-overhead.
*/
const useOptimizedScroll = () => {
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    isVisible: true,
    lastScrollY: 0
  });

  const lastYRef = useRef(0);
  const visibleRef = useRef(true);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handle = (scrollY: number) => {
      const prevY = lastYRef.current;
      const scrollingDown = scrollY > prevY;
      const scrolledPastThreshold = scrollY > 120;
      const nearTop = scrollY < 50;

      let isVisible = visibleRef.current;
      if (nearTop) {
        isVisible = true;
      } else if (scrollingDown && scrolledPastThreshold) {
        isVisible = false;
      } else if (!scrollingDown && Math.abs(scrollY - prevY) > 5) {
        isVisible = true;
      }

      const isScrolled = scrollY > 50;

      // Only update if something meaningful changed
      if (
        isVisible !== visibleRef.current ||
        isScrolled !== scrollState.isScrolled ||
        scrollY !== scrollState.lastScrollY
      ) {
        visibleRef.current = isVisible;
        lastYRef.current = scrollY;
        setScrollState({
          isScrolled,
          isVisible,
          lastScrollY: scrollY
        });
      } else {
        // still update lastYRef for future comparisons
        lastYRef.current = scrollY;
      }
    };

    const onScroll = () => {
      const scrollY =
        typeof window !== 'undefined'
          ? window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0
          : 0;

      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          handle(scrollY);
          tickingRef.current = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // run once to initialize correctly
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      tickingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty: uses refs/state inside handler

  return scrollState;
};

// -------- Styled components (minor tweak: logo uses transform scale instead of width/height changes) --------

// Enhanced HeaderContainer with better matrix effects
const HeaderContainer = styled.header<{ $scrolled: boolean; $visible: boolean; $matrixActive?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  
  /* Matrix vs Normal background */
  background: ${props => {
    if (props.$matrixActive) {
      return props.$scrolled 
        ? 'rgba(0, 15, 0, 0.75)' // Darker when scrolled + matrix
        : 'rgba(0, 20, 0, 0.45)'; // Semi-transparent matrix
    }
    return 'var(--color-background-secondary)';
  }};
  
  /* Matrix vs Normal border */
  border-bottom: 1px solid ${props => {
    if (props.$matrixActive) {
      return props.$scrolled 
        ? 'rgba(34, 197, 94, 0.25)' // More visible when scrolled
        : 'rgba(34, 197, 94, 0.12)';
    }
    return props.$scrolled 
      ? 'var(--color-border-medium)' 
      : 'var(--color-border-light)';
  }};
  
  /* Enhanced transitions */
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.35s, 
              background 0.25s,
              border-color 0.25s;
              
  /* Box shadow with matrix glow effect */
  box-shadow: ${props => {
    if (props.$matrixActive && props.$scrolled) {
      return '0 4px 20px rgba(34, 197, 94, 0.1), var(--shadow-sm)';
    }
    return props.$scrolled ? 'var(--shadow-sm)' : 'none';
  }};
  
  transform: translateY(${props => (props.$visible ? '0' : '-100%')});
  will-change: transform;
  
  /* Matrix-specific backdrop blur */
  ${props => props.$matrixActive && `
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `}
  
  /* Matrix text color adjustments for all child text */
  ${props => props.$matrixActive && `
    color: #22c55e;
    
    /* Ensure text remains readable */
    * {
      text-shadow: ${props.$scrolled ? '0 0 8px rgba(34, 197, 94, 0.3)' : 'none'};
    }
  `}
`;

// Enhanced BrandTitle for matrix effect
const BrandTitle = styled.span<{ $scrolled: boolean; $matrixActive?: boolean }>`
  font-size: ${props => (props.$scrolled ? '1.25rem' : '1.6rem')};
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: ${props => props.$matrixActive ? '#22c55e' : 'var(--color-text-primary)'};
  letter-spacing: 1px;
  transition: font-size 0.22s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.25s,
              text-shadow 0.25s;
  white-space: nowrap;
  
  /* Matrix glow effect */
  ${props => props.$matrixActive && `
    text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
  `}

  @media (max-width: 768px) {
    font-size: ${props => (props.$scrolled ? '1rem' : '1.25rem')};
  }
`;

// Enhanced BrandSubtitle for matrix effect
const BrandSubtitle = styled.p<{ $scrolled: boolean; $matrixActive?: boolean }>`
  font-size: ${props => (props.$scrolled ? '0.85rem' : '0.95rem')};
  color: ${props => props.$matrixActive ? 'rgba(34, 197, 94, 0.8)' : 'var(--color-text-secondary)'};
  font-family: 'Work Sans', sans-serif;
  margin: 0;
  transition: opacity 0.22s, color 0.25s;
  opacity: ${props => (props.$scrolled ? '0.9' : '1')};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;
const HeaderContent = styled.div<{ $scrolled: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  /* make the header height stable to avoid layout shifts */
  padding: ${props => (props.$scrolled ? '0.75rem 1rem' : '1.25rem 1rem')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  transition: padding 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    gap: 1rem;
  }
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.18s ease;

  &:hover { transform: translateY(-1px); }
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (max-width: 640px) { gap: 0.75rem; }
`;

/*
  IMPORTANT: Keep container size stable and use transform:scale() for visual shrinking.
  This avoids reflow/relayout while scrolling and makes header transforms smooth.
*/
const LogoImageContainer = styled.div<{ $scrolled: boolean; $loaded: boolean }>`
  width: 72px;
  height: 72px;
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s;
  transform-origin: left center;
  transform: ${props => (props.$scrolled ? 'scale(0.78)' : 'scale(1)')};
  flex-shrink: 0;
  position: relative;

  ${props =>
    !props.$loaded &&
    css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          var(--color-border-light) 25%,
          var(--color-border-medium) 50%,
          var(--color-border-light) 75%
        );
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
  }
`;

const BrandText = styled.div<{ $scrolled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: opacity 0.25s, transform 0.25s;
  min-width: 0;
  transform-origin: left center;

  @media (max-width: 640px) {
    display: ${props => (props.$scrolled ? 'none' : 'flex')};
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

/* rest of your styled components unchanged (kept for brevity) */
const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* Mobile menu button + overlay + MobileMenu + etc. - kept unchanged from your original file */
const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: 1px solid var(--color-primary-500);
  color: var(--color-primary-500);
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  flex-shrink: 0;

  &:hover {
    background: var(--color-primary-500);
    color: var(--color-background-secondary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  max-width: 85vw;
  background: var(--color-background-secondary);
  border-left: 1px solid var(--color-border-medium);
  padding: 2rem 1.5rem;
  transform: translateX(${props => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  will-change: transform;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-light);
`;

const MobileCloseButton = styled.button`
  background: none;
  border: 1px solid var(--color-primary-500);
  color: var(--color-primary-500);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--color-primary-500);
    color: var(--color-background-secondary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const MobileBrand = styled.div`
  font-size: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: var(--color-text-primary);
  letter-spacing: 1px;
`;

const SearchBar = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background-secondary);
  border-bottom: 1px solid var(--color-border-medium);
  padding: 1rem;
  transform: translateY(${props => (props.$visible ? '0' : '-100%')});
  opacity: ${props => (props.$visible ? '1' : '0')};
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border-medium);
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.06);
  }

  &::placeholder { color: var(--color-text-muted); }
`;



export function Header({ title, subtitle }: HeaderProps) {
  const { isScrolled, isVisible } = useOptimizedScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setIsMounted(true), []);

  // Safe dark-mode hookup, same pattern as your original file
  let isDarkMode = false;
  let isLoaded = false;
  if (isMounted) {
    try {
      const darkModeContext = useDarkMode();
      isDarkMode = darkModeContext.isDarkMode;
      isLoaded = darkModeContext.isLoaded;
    } catch (error) {
      console.warn('Header rendered outside DarkModeProvider, using light mode as fallback');
      isDarkMode = false;
      isLoaded = true;
    }
  }

  // Matrix state hookup
  let isMatrixOn = false;
  if (isMounted) {
    try {
      const matrixCtx = useMatrix();
      isMatrixOn = matrixCtx.isMatrixOn;
    } catch {
      // no provider present — keep false
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    if (isMobileMenuOpen || isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    setIsSearchOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleSearch = () => { setIsSearchOpen(prev => !prev); setIsMobileMenuOpen(false); };

  return (
    <>
      <HeaderContainer 
        $scrolled={isScrolled} 
        $visible={isVisible}
        $matrixActive={isMatrixOn}
      >
        <HeaderContent $scrolled={isScrolled}>
          <LogoSection href="/" aria-label="Go to homepage">
            <LogoImageContainer $scrolled={isScrolled} $loaded={imageLoaded}>
              <Image
                src={isDarkMode ? logoDark : logoLight}
                alt="Learn Morra Logo"
                sizes="(max-width: 768px) 48px, 72px"
                priority
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onLoad={() => setImageLoaded(true)}
              />
            </LogoImageContainer>
            <BrandText $scrolled={isScrolled}>
              <BrandTitle $scrolled={isScrolled} $matrixActive={isMatrixOn}>
                {title}
              </BrandTitle>
              {subtitle && (
                <BrandSubtitle $scrolled={isScrolled} $matrixActive={isMatrixOn}>
                  {subtitle}
                </BrandSubtitle>
              )}
            </BrandText>
          </LogoSection>

          <DesktopNav>
            <Taskbar isScrolled={isScrolled} />
          </DesktopNav>

          <MobileMenuButton
            onClick={toggleMobileMenu}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={20} />
          </MobileMenuButton>
        </HeaderContent>

        <SearchBar $visible={isSearchOpen}>
          <SearchInput
            ref={searchInputRef}
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />
        </SearchBar>
      </HeaderContainer>

      {/* Mobile menu with matrix-aware styling */}
      <MobileMenuOverlay
        $isOpen={isMobileMenuOpen}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
        style={{
          // Enhanced backdrop when matrix is active
          backdropFilter: isMatrixOn ? 'blur(8px)' : 'blur(4px)',
          background: isMatrixOn 
            ? 'rgba(0, 20, 0, 0.7)' 
            : 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <MobileMenu
          $isOpen={isMobileMenuOpen}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          style={{
            // Matrix styling for mobile menu
            background: isMatrixOn 
              ? 'rgba(0, 20, 0, 0.95)' 
              : 'var(--color-background-secondary)',
            borderLeft: isMatrixOn 
              ? '1px solid rgba(34, 197, 94, 0.3)' 
              : '1px solid var(--color-border-medium)'
          }}
        >
          <MobileMenuHeader>
            <MobileBrand style={{ 
              color: isMatrixOn ? '#22c55e' : 'var(--color-text-primary)' 
            }}>
              {title}
            </MobileBrand>
            <MobileCloseButton 
              onClick={closeMobileMenu} 
              aria-label="Close menu"
              style={{
                borderColor: isMatrixOn ? '#22c55e' : 'var(--color-primary-500)',
                color: isMatrixOn ? '#22c55e' : 'var(--color-primary-500)'
              }}
            >
              <X size={20} />
            </MobileCloseButton>
          </MobileMenuHeader>

          <Taskbar isMobile onNavigate={closeMobileMenu} />
        </MobileMenu>
      </MobileMenuOverlay>
    </>
  );
}