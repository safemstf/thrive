// src/components/Footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowUp, Heart, Github, Twitter, Mail } from 'lucide-react';
import { useDarkMode } from '@/providers/darkModeProvider';
import logo from '../../../public/assets/logo2.png';

const FooterContainer = styled.footer<{ $elevated: boolean }>`
  background: var(--color-background-secondary); /* Use CSS variable */
  border-top: 1px solid var(--color-border-medium); /* Use CSS variable */
  margin-top: auto; /* This pushes footer to bottom in flex layout */
  transition: all 0.3s ease;
  box-shadow: ${props => props.$elevated ? 'var(--shadow-sm)' : 'none'};
  /* Ensure footer stays at bottom and can't be scrolled past */
  position: relative;
  z-index: 1;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem 1.5rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem;
  }
`;

const FooterMain = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  margin-bottom: 2rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

const BrandSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

const LogoContainer = styled.div`
  flex-shrink: 0;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoImage = styled(Image)`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BrandTitle = styled.h3`
  font-size: 1.5rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: var(--color-text-primary); /* Use CSS variable */
  margin: 0;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const BrandTagline = styled.p`
  font-size: 0.9rem;
  color: var(--color-text-secondary); /* Use CSS variable */
  margin: 0;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  line-height: 1.5;
`;

const BrandDescription = styled.p`
  font-size: 0.85rem;
  color: var(--color-text-secondary); /* Use CSS variable */
  margin: 0.5rem 0 0 0;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  line-height: 1.6;
  max-width: 280px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 968px) {
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    align-items: center;
  }
`;

const LinkTitle = styled.h4`
  font-size: 0.85rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  color: var(--color-text-primary); /* Use CSS variable */
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FooterLink = styled(Link)`
  color: var(--color-text-secondary); /* Use CSS variable */
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  transition: color 0.2s ease;
  padding: 0.25rem 0;
  
  &:hover {
    color: var(--color-text-primary); /* Use CSS variable */
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid var(--color-border-light); /* Use CSS variable */
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const BottomLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Copyright = styled.p`
  margin: 0;
  color: var(--color-text-secondary); /* Use CSS variable */
  font-size: 0.85rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--color-border-medium); /* Use CSS variable */
  border-radius: 6px;
  color: var(--color-text-secondary); /* Use CSS variable */
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary-500); /* Use CSS variable */
    color: var(--color-primary-500); /* Use CSS variable */
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const BackToTopButton = styled.button<{ $visible: boolean }>`
  background: var(--color-background-secondary); /* Use CSS variable */
  border: 1px solid var(--color-border-medium); /* Use CSS variable */
  color: var(--color-text-secondary); /* Use CSS variable */
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.$visible ? '1' : '0'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  border-radius: 4px;

  &:hover {
    border-color: var(--color-primary-500); /* Use CSS variable */
    color: var(--color-primary-500); /* Use CSS variable */
    transform: translateY(-1px);
  }
`;

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const { isDarkMode } = useDarkMode(); // Add dark mode hook

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400;
      setShowBackToTop(scrolled);
      
      // Subtle elevation when near bottom
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
      
      setIsElevated(distanceFromBottom < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer $elevated={isElevated}>
      <FooterContent>
        <FooterMain>
          {/* Brand Section */}
          <BrandSection>
            <LogoContainer>
              <Link href="/">
                <LogoImage 
                  src={logo} 
                  alt="Learn Morra" 
                  width={50}
                  height={50}
                />
              </Link>
            </LogoContainer>
            <BrandInfo>
              <BrandTitle>LearnMorra</BrandTitle>
              <BrandTagline>Brag Responsibly</BrandTagline>
              <BrandDescription>
                Where your skills shine, your work speaks, and bragging is encouraged.
              </BrandDescription>
            </BrandInfo>
          </BrandSection>

          {/* Updated Links Grid with actual pages */}
          <LinksGrid>
            <LinkColumn>
              <LinkTitle>Explore</LinkTitle>
              <FooterLink href="/thrive">Thrive</FooterLink>
              <FooterLink href="/simulations">Simulations</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/portfolio">Portfolios</FooterLink>
            </LinkColumn>
            
            <LinkColumn>
              <LinkTitle>Dashboard</LinkTitle>
              <FooterLink href="/dashboard/profile">Profile</FooterLink>
              <FooterLink href="/dashboard/projects">Projects</FooterLink>
              <FooterLink href="/dashboard/thrive">Skills Arena</FooterLink>
              <FooterLink href="/dashboard/gallery">Gallery</FooterLink>
              <FooterLink href="/dashboard/writing">Writing</FooterLink>
            </LinkColumn>
            
            <LinkColumn>
              <LinkTitle>Support</LinkTitle>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </LinkColumn>
          </LinksGrid>
        </FooterMain>

        <FooterBottom>
          <BottomLeft>
            <Copyright>
              © {currentYear} Learn Morra. Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> for learners.
            </Copyright>
            <SocialLinks>
              <SocialLink 
                href="https://github.com/safemstf" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github />
              </SocialLink>
              <SocialLink 
                href="https://x.com/LearnMorra" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <Twitter />
              </SocialLink>
              <SocialLink 
                href="mailto:hello@learnmorra.com" 
                aria-label="Email"
              >
                <Mail />
              </SocialLink>
            </SocialLinks>
          </BottomLeft>
          
          <BackToTopButton onClick={scrollToTop} $visible={showBackToTop}>
            <ArrowUp size={14} />
            Back to Top
          </BackToTopButton>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}