// src/components/misc/header.tsx - SAFE IMPROVEMENTS VERSION
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import logo from '../../../public/assets/logo2.png';
import { Taskbar } from './taskbar'; // Keep using your existing Taskbar!

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

// Performance optimization: Throttle function to reduce scroll event calls
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Improved scroll hook with better performance
const useOptimizedScroll = () => {
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    isVisible: true,
    lastScrollY: 0
  });

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      
      setScrollState(prev => {
        // Smart visibility logic
        const scrollingDown = scrollY > prev.lastScrollY;
        const scrolledPastThreshold = scrollY > 120;
        const nearTop = scrollY < 50;
        
        // Determine visibility
        let isVisible = prev.isVisible;
        if (nearTop) {
          isVisible = true; // Always show near top
        } else if (scrollingDown && scrolledPastThreshold) {
          isVisible = false; // Hide when scrolling down past threshold
        } else if (!scrollingDown && Math.abs(scrollY - prev.lastScrollY) > 5) {
          isVisible = true; // Show when scrolling up
        }
        
        return {
          isScrolled: scrollY > 50,
          isVisible,
          lastScrollY: scrollY
        };
      });
      
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    // Throttle scroll events to 10 times per second max
    const throttledScroll = throttle(requestTick, 100);
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  return scrollState;
};

// Keep all your existing styled components but add performance improvements
const HeaderContainer = styled.header<{ $scrolled: boolean; $visible: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid ${props => props.$scrolled ? '#e0e0e0' : '#f0f0f0'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$scrolled ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'};
  
  /* Smart hide/show animation */
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  
  /* Performance: Use will-change sparingly */
  ${props => props.$scrolled && css`
    will-change: transform;
  `}
`;

const HeaderContent = styled.div<{ $scrolled: boolean }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$scrolled ? '1rem' : '2rem 1rem'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid #2c2c2c;
    outline-offset: 4px;
    border-radius: 4px;
  }

  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

// Optimized image container with skeleton loading
const LogoImageContainer = styled.div<{ $scrolled: boolean; $loaded: boolean }>`
  width: ${props => props.$scrolled ? '150px' : '200px'};
  height: ${props => props.$scrolled ? '150px' : '200px'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;

  /* Skeleton loading effect */
  ${props => !props.$loaded && css`
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
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
    width: 120px;
    height: 120px;
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const BrandText = styled.div<{ $scrolled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;

  @media (max-width: 640px) {
    display: ${props => props.$scrolled ? 'none' : 'flex'};
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const BrandTitle = styled.span<{ $scrolled: boolean }>`
  font-size: ${props => props.$scrolled ? '2rem' : '3rem'};
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 1px;
  transition: font-size 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: ${props => props.$scrolled ? '1.5rem' : '2rem'};
  }
`;

const BrandSubtitle = styled.p<{ $scrolled: boolean }>`
  font-size: ${props => props.$scrolled ? '1rem' : '1.2rem'};
  color: #666;
  font-family: 'Work Sans', sans-serif;
  margin: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$scrolled ? '0.8' : '1'};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  flex-shrink: 0;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }

  &:focus-visible {
    outline: 2px solid #2c2c2c;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Improved mobile menu with better animations
const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
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
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 2rem 1.5rem;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  
  /* Performance: GPU acceleration */
  will-change: transform;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
`;

const MobileCloseButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }

  &:focus-visible {
    outline: 2px solid #2c2c2c;
    outline-offset: 2px;
  }
`;

const MobileBrand = styled.div`
  font-size: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 1px;
`;

// Quick Search Bar (new feature)
const SearchBar = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem;
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  opacity: ${props => props.$visible ? '1' : '0'};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
  }
`;

export function Header({ title, subtitle }: HeaderProps) {
  const { isScrolled, isVisible } = useOptimizedScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on escape key
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

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <HeaderContainer $scrolled={isScrolled} $visible={isVisible}>
        <HeaderContent $scrolled={isScrolled}>
          {/* Logo Section with skeleton loading */}
          <LogoSection href="/" aria-label="Go to homepage">
            <LogoImageContainer $scrolled={isScrolled} $loaded={imageLoaded}>
              <Image 
                src={logo} 
                alt="Learn Morra Logo" 
                width={isScrolled ? 60 : 180}
                height={isScrolled ? 60 : 180}
                priority
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onLoad={() => setImageLoaded(true)}
              />
            </LogoImageContainer>
            <BrandText $scrolled={isScrolled}>
              <BrandTitle $scrolled={isScrolled}>{title}</BrandTitle>
              {subtitle && (
                <BrandSubtitle $scrolled={isScrolled}>{subtitle}</BrandSubtitle>
              )}
            </BrandText>
          </LogoSection>

          {/* Desktop Navigation - Keep using your Taskbar! */}
          <DesktopNav>
            <Taskbar isScrolled={isScrolled} />
          </DesktopNav>

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            onClick={toggleMobileMenu} 
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={20} />
          </MobileMenuButton>
        </HeaderContent>

        {/* Search Bar (optional new feature) */}
        <SearchBar $visible={isSearchOpen}>
          <SearchInput
            ref={searchInputRef}
            type="search"
            placeholder="Search..."
            aria-label="Search"
          />
        </SearchBar>
      </HeaderContainer>

      {/* Mobile Menu */}
      <MobileMenuOverlay 
        $isOpen={isMobileMenuOpen} 
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
      >
        <MobileMenu 
          $isOpen={isMobileMenuOpen} 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <MobileMenuHeader>
            <MobileBrand>{title}</MobileBrand>
            <MobileCloseButton 
              onClick={closeMobileMenu} 
              aria-label="Close menu"
            >
              <X size={20} />
            </MobileCloseButton>
          </MobileMenuHeader>
          
          {/* Use your existing Taskbar for mobile too! */}
          <Taskbar isMobile onNavigate={closeMobileMenu} />
        </MobileMenu>
      </MobileMenuOverlay>
    </>
  );
}