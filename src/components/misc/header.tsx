// src/components/Header.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Menu, X } from 'lucide-react';
import logo from '../../../public/assets/logo2.png';
import { Taskbar } from './taskbar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const HeaderContainer = styled.header<{ $scrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid ${props => props.$scrolled ? '#e0e0e0' : '#f0f0f0'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.$scrolled ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'};
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

  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

const LogoImageContainer = styled.div<{ $scrolled: boolean }>`
  width: ${props => props.$scrolled ? '150px' : '200px'};
  height: ${props => props.$scrolled ? '150px' : '200px'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

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
  min-width: 0; // Prevents text from pushing layout

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
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

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
  transition: transform 0.3s ease;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
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
`;

const MobileBrand = styled.div`
  font-size: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: #2c2c2c;
  letter-spacing: 1px;
`;

export function Header({ title, subtitle }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Improved scroll handling with hysteresis to prevent flicker
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const threshold = isScrolled ? 40 : 60; // Different thresholds for up/down
    
    if (scrollY > threshold && !isScrolled) {
      setIsScrolled(true);
    } else if (scrollY < threshold && isScrolled) {
      setIsScrolled(false);
    }
  }, [isScrolled]);

  useEffect(() => {
    let ticking = false;
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    return () => window.removeEventListener('scroll', requestTick);
  }, [handleScroll]);

  // Handle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <HeaderContainer $scrolled={isScrolled}>
        <HeaderContent $scrolled={isScrolled}>
          {/* Logo Section */}
          <LogoSection href="/">
            <LogoImageContainer $scrolled={isScrolled}>
              <Image 
                src={logo} 
                alt="Learn Morra Logo" 
                width={isScrolled ? 150 : 200}
                height={isScrolled ? 150 : 200}
                priority
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </LogoImageContainer>
            <BrandText $scrolled={isScrolled}>
              <BrandTitle $scrolled={isScrolled}>{title}</BrandTitle>
              {subtitle && (
                <BrandSubtitle $scrolled={isScrolled}>{subtitle}</BrandSubtitle>
              )}
            </BrandText>
          </LogoSection>

          {/* Desktop Navigation */}
          <DesktopNav>
            <Taskbar />
          </DesktopNav>

          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={toggleMobileMenu} aria-label="Open menu">
            <Menu size={20} />
          </MobileMenuButton>
        </HeaderContent>
      </HeaderContainer>

      {/* Mobile Menu */}
      <MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu}>
        <MobileMenu $isOpen={isMobileMenuOpen} onClick={(e) => e.stopPropagation()}>
          <MobileMenuHeader>
            <MobileBrand>{title}</MobileBrand>
            <MobileCloseButton onClick={closeMobileMenu} aria-label="Close menu">
              <X size={20} />
            </MobileCloseButton>
          </MobileMenuHeader>
          
          <Taskbar isMobile onNavigate={closeMobileMenu} />
        </MobileMenu>
      </MobileMenuOverlay>
    </>
  );
}