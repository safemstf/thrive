// src/components/misc/footer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
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
      isHydrated: true
    };
  }
}

// Main footer container with matrix styling
const FooterContainer = styled.footer<{ $matrixActive?: boolean }>`
  background: ${props => 
    props.$matrixActive 
      ? 'rgba(0, 20, 0, 0.85)' 
      : 'var(--color-background-secondary)'
  };
  border-top: 1px solid ${props => 
    props.$matrixActive 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'var(--color-border-light)'
  };
  padding: 2rem 1rem 1rem;
  transition: background 0.3s ease, border-color 0.3s ease;
  
  /* Matrix backdrop effect */
  ${props => props.$matrixActive && `
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  `}
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div<{ $matrixActive?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: ${props => 
      props.$matrixActive 
        ? '#22c55e' 
        : 'var(--color-text-primary)'
    };
    margin: 0 0 0.5rem 0;
    transition: color 0.3s ease;
    
    ${props => props.$matrixActive && `
      text-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    `}
  }
`;

const FooterLink = styled(Link)<{ $matrixActive?: boolean }>`
  color: ${props => 
    props.$matrixActive 
      ? 'rgba(34, 197, 94, 0.8)' 
      : 'var(--color-text-secondary)'
  };
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  transition: color 0.2s ease, text-shadow 0.2s ease;
  
  &:hover {
    color: ${props => 
      props.$matrixActive 
        ? '#22c55e' 
        : 'var(--color-primary-500)'
    };
    
    ${props => props.$matrixActive && `
      text-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    `}
  }
`;

const FooterText = styled.p<{ $matrixActive?: boolean }>`
  color: ${props => 
    props.$matrixActive 
      ? 'rgba(34, 197, 94, 0.7)' 
      : 'var(--color-text-secondary)'
  };
  font-size: 0.85rem;
  font-family: 'Work Sans', sans-serif;
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;
`;

const FooterBottom = styled.div<{ $matrixActive?: boolean }>`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => 
    props.$matrixActive 
      ? 'rgba(34, 197, 94, 0.15)' 
      : 'var(--color-border-light)'
  };
  text-align: center;
  
  p {
    color: ${props => 
      props.$matrixActive 
        ? 'rgba(34, 197, 94, 0.6)' 
        : 'var(--color-text-muted)'
    };
    font-size: 0.8rem;
    font-family: 'Work Sans', sans-serif;
    margin: 0;
    transition: color 0.3s ease;
  }
`;

export function Footer({ className }: FooterProps) {
  // ✅ ALL HOOKS CALLED AT TOP LEVEL - ALWAYS THE SAME ORDER
  const [currentYear] = useState(() => new Date().getFullYear());
  const { isMatrixOn } = useMatrixSafe(); // ✅ Always called, safe wrapper
  
  // ✅ useEffect in consistent position (even if not currently used)
  useEffect(() => {
    // Any footer effects would go here
  }, []);

  return (
    <FooterContainer $matrixActive={isMatrixOn} className={className}>
      <FooterContent>
        <FooterSection $matrixActive={isMatrixOn}>
          <h3>LearnMorra</h3>
          <FooterText $matrixActive={isMatrixOn}>
            Master the art of responsible bragging through strategic gameplay and community interaction.
          </FooterText>
        </FooterSection>
        
        <FooterSection $matrixActive={isMatrixOn}>
          <h3>Quick Links</h3>
          <FooterLink href="/" $matrixActive={isMatrixOn}>
            Home
          </FooterLink>
          <FooterLink href="/thrive" $matrixActive={isMatrixOn}>
            Thrive
          </FooterLink>
          <FooterLink href="/simulations" $matrixActive={isMatrixOn}>
            The Matrix
          </FooterLink>
          <FooterLink href="/dashboard" $matrixActive={isMatrixOn}>
            Dashboard
          </FooterLink>
        </FooterSection>
        
        <FooterSection $matrixActive={isMatrixOn}>
          <h3>Community</h3>
          <FooterLink href="/about" $matrixActive={isMatrixOn}>
            About Us
          </FooterLink>
          <FooterLink href="/contact" $matrixActive={isMatrixOn}>
            Contact
          </FooterLink>
          <FooterLink href="/privacy" $matrixActive={isMatrixOn}>
            Privacy Policy
          </FooterLink>
          <FooterLink href="/terms" $matrixActive={isMatrixOn}>
            Terms of Service
          </FooterLink>
        </FooterSection>
        
        <FooterSection $matrixActive={isMatrixOn}>
          <h3>Connect</h3>
          <FooterText $matrixActive={isMatrixOn}>
            Follow us for updates and community highlights.
          </FooterText>
          <FooterLink href="#" $matrixActive={isMatrixOn}>
            Newsletter
          </FooterLink>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom $matrixActive={isMatrixOn}>
        <p>
          © {currentYear} LearnMorra. All rights reserved. Brag Responsibly.
        </p>
      </FooterBottom>
    </FooterContainer>
  );
}