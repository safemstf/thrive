// src/components/misc/footer.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import { useMatrix } from '@/hooks/useMatrix';

interface FooterProps {
  className?: string;
}

// Safe hook wrapper to prevent hook order violations
function useMatrixSafe() {
  try {
    return useMatrix();
  } catch (error) {
    return {
      isMatrixOn: false,
      toggleMatrix: () => {},
      setMatrixOn: () => {},
      isHydrated: true,
    };
  }
}

// Animations
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// Container
const FooterContainer = styled.footer`
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  border-top: 1px solid rgba(59, 130, 246, 0.12);
  padding: 3rem 1rem 2rem;
  margin-top: 4rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    ${css`animation: ${shimmer} 4s ease-in-out infinite;`}
  }

  border-radius: 24px 24px 0 0;

  @media (max-width: 768px) {
    padding: 2rem 1rem 1.5rem;
    border-radius: 20px 20px 0 0;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%);
  border: 1px solid rgba(59, 130, 246, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.15);
  }

  h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 50px;
    }
  }
`;

const FooterLink = styled(Link)`
  color: #666666;
  text-decoration: none;
  font-size: 0.95rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: block;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
`;

const FooterText = styled.p`
  color: #666666;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  line-height: 1.6;
  margin: 0;
  transition: color 0.3s ease;
  opacity: 0.9;
`;

const FooterBottom = styled.div`
  margin-top: 3rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;

  p {
    color: #1a1a1a;
    font-size: 0.85rem;
    font-family: 'Work Sans', sans-serif;
    font-weight: 500;
    margin: 0;
    transition: color 0.3s ease;
  }
`;

const BrandSection = styled(FooterSection)`
  h3 {
    font-size: 1.3rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

export function Footer({ className }: FooterProps) {
  const [currentYear] = useState(() => new Date().getFullYear());
  const { isMatrixOn } = useMatrixSafe();

  useEffect(() => {
    // Any footer effects would go here
  }, []);

  return (
    <FooterContainer className={className}>
      <FooterContent>
        <BrandSection>
          <h3>LearnMorra</h3>
          <FooterText>
            Master the art of responsible bragging through strategic gameplay and community interaction.
            Join thousands of players in our immersive digital ecosystem.
          </FooterText>
        </BrandSection>

        <FooterSection>
          <h3>Navigate</h3>
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/thrive">Thrive</FooterLink>
          <FooterLink href="/simulations">The Matrix</FooterLink>
          <FooterLink href="/dashboard">Dashboard</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Community</h3>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
        </FooterSection>

        <FooterSection>
          <h3>Stay Connected</h3>
          <FooterText>
            Get the latest updates, tips, and community highlights delivered to your inbox.
          </FooterText>
          <FooterLink href="/newsletter">Join Newsletter</FooterLink>
          <FooterLink href="/discord">Discord Community</FooterLink>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <p>
          © {currentYear} LearnMorra. All rights reserved. Brag Responsibly. ✨
        </p>
      </FooterBottom>
    </FooterContainer>
  );
}
