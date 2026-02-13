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
  {
    name: 'Alan Mathew',
    vanity: 'alan-mathew-992863184',
    profileUrl: 'https://www.linkedin.com/in/alan-mathew-992863184/',
  },
   {
    name: 'Joseph Devasia',
    vanity: 'josephdevasia',
    profileUrl: 'https://www.linkedin.com/in/josephdevasia/',
  },
];

function useMatrixSafe() {
  try {
    return useMatrix();
  } catch {
    return {
      isMatrixOn: false,
      toggleMatrix: () => { },
      setMatrixOn: () => { },
      isHydrated: true,
    };
  }
}

/* -------------------------------- animations -------------------------------- */

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/* -------------------------------- layout -------------------------------- */

const FooterContainer = styled.footer`
  position: relative;
  overflow: hidden;
  padding: 3rem 1rem 2rem;

  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 250, 252, 0.95)
  );

  border-top: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 24px 24px 0 0;
  backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    left: -100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    ${css`animation: ${shimmer} 4s ease-in-out infinite;`}
  }

  @media (max-width: 768px) {
    padding: 2rem 1rem 1.5rem;
    border-radius: 20px 20px 0 0;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 2.25rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;

  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.05),
    rgba(139, 92, 246, 0.02)
  );

  border: 1px solid rgba(59, 130, 246, 0.08);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
  }

  h3 {
    margin: 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #1a1a1a;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -4px;
      width: 32px;
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    }
  }
`;

const ConnectSection = styled(FooterSection)`
  grid-column: 1 / -1;
  align-items: center;
  text-align: center;
  padding: 1.25rem 1.5rem;
`;

/* -------------------------------- text -------------------------------- */

const FooterLink = styled(Link)`
  font-family: 'Work Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
    transform: translateX(3px);
  }
`;

const FooterText = styled.p`
  margin: 0;
  font-family: 'Work Sans', sans-serif;
  font-size: 0.9rem;
  color: #666;
  opacity: 0.9;
`;

/* -------------------------------- members -------------------------------- */

const MemberGrid = styled.div`
  width: 100%;
  margin-top: 1rem;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  justify-items: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MemberCard = styled.div`
  width: 100%;
  max-width: 340px;
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.9rem;

  border-radius: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.65),
    rgba(248, 250, 252, 0.55)
  );
`;


const MemberCardInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;

  .linkedin-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .badge-base {
    margin: 0 auto !important;
    display: block !important;
  }

  .profile-fallback {
    font-size: 0.8rem;
    color: #64748b;
    text-decoration: none;

    &:hover {
      color: #3b82f6;
    }
  }
`;


/* -------------------------------- bottom -------------------------------- */

const FooterBottom = styled.div`
  margin-top: 3rem;
  padding: 1.5rem 2rem;
  text-align: center;

  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.8),
    rgba(241, 245, 249, 0.6)
  );

  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(10px);

  p {
    margin: 0;
    font-family: 'Work Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: #1a1a1a;
  }
`;

/* -------------------------------- component -------------------------------- */

export function Footer({ className }: FooterProps) {
  const [year] = useState(() => new Date().getFullYear());
  const { isMatrixOn } = useMatrixSafe();

  useEffect(() => { }, []);

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
            <FooterLink href="/thrive">Assessments</FooterLink>
            <FooterLink href="/simulations">Simulations</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
          </FooterSection>

          <FooterSection>
            <h3>Community</h3>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
          </FooterSection>

          <ConnectSection>
            <h3>Connect</h3>
            <FooterText>Message the LearnMorra team</FooterText>

            <MemberGrid>
              {TEAM_MEMBERS.map((member) => (
                <MemberCard key={member.vanity}>
                  <MemberCardInner>
                    <div className="linkedin-wrapper">
                      <div
                        className="badge-base LI-profile-badge"
                        data-locale="en_US"
                        data-size="medium"
                        data-theme="dark"
                        data-type="HORIZONTAL"
                        data-vanity={member.vanity}
                        data-version="v1"
                      />
                    </div>

                    <a
                      className="profile-fallback"
                      href={member.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit {member.name}&rsquo;s profile
                    </a>
                  </MemberCardInner>

                </MemberCard>
              ))}
            </MemberGrid>
          </ConnectSection>
        </FooterContent>

        <FooterBottom>
          <p>© {year} LearnMorra. All rights reserved. Brag Responsibly. ✨</p>
        </FooterBottom>
      </FooterContainer>
    </>
  );
}