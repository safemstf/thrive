// src/components/misc/footer.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styled, { keyframes, css } from 'styled-components';
import { useMatrix } from '@/hooks/useMatrix';

interface FooterProps {
  className?: string;
}

const TEAM_MEMBERS = [
  {
    name: 'Safe Mustafa',
    vanity: 'safe-mufasa',
    profileUrl: 'https://www.linkedin.com/in/safe-mufasa',
  },
  {
    name: 'Dev Gurung',
    vanity: 'dev-gurung-a8b863136',
    profileUrl: 'https://www.linkedin.com/in/dev-gurung-a8b863136/',
  },
];

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

/* NEW: grid & member card styles for the Connect section */
const MemberGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  min-width: 220px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(248,250,252,0.5));
  border: 1px solid rgba(59,130,246,0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 2px 10px rgba(11, 15, 30, 0.02);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(59,130,246,0.08);
  }

  .badge-base {
    max-width: 160px;
  }

  a.profile-fallback {
    font-family: 'Work Sans', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    color: #0f172a;
    text-decoration: none;
  }
`;

/* small responsive tweak for mobile */
const MemberCardInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/* end new styles */

export function Footer({ className }: FooterProps) {
  const [currentYear] = useState(() => new Date().getFullYear());
  const { isMatrixOn } = useMatrixSafe();

  useEffect(() => {
    // Any footer effects would go here
  }, []);

  return (
    <>
      <Script
        src="https://platform.linkedin.com/badges/js/profile.js"
        strategy="lazyOnload"
      />
      <FooterContainer className={className}>
        <FooterContent>
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
            <h3>Connect</h3>
            <FooterText>Message the LearnMorra team</FooterText>

            <MemberGrid>
              {TEAM_MEMBERS.map((member) => (
                <MemberCard key={member.vanity} aria-label={`Connect with ${member.name}`}>
                  <MemberCardInner>
                    {/* LinkedIn badge (if script injects it) */}
                    <div
                      className="badge-base LI-profile-badge"
                      data-locale="en_US"
                      data-size="medium"
                      data-theme="dark"
                      data-type="HORIZONTAL"
                      data-vanity={member.vanity}
                      data-version="v1"
                      aria-hidden="true"
                    >
                      <a
                        className="badge-base__link LI-simple-link"
                        href={`${member.profileUrl}?trk=profile-badge`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {member.name}
                      </a>
                    </div>

                    {/* Fallback accessible link for screen readers / if badge doesn't render */}
                    <a
                      className="profile-fallback"
                      href={member.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit {member.name}'s profile
                    </a>
                  </MemberCardInner>
                </MemberCard>
              ))}
            </MemberGrid>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <p>
            © {currentYear} LearnMorra. All rights reserved. Brag Responsibly. ✨
          </p>
        </FooterBottom>
      </FooterContainer>
    </>
  );
}
