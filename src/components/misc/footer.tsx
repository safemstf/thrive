'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const TEAM_MEMBERS = [
  {
    name: 'Safe Mustafa',
    role: 'Senior Developer',
    initials: 'SM',
    profileUrl: 'https://www.linkedin.com/in/safe-mufasa',
  },
  {
    name: 'Dev Gurung',
    role: 'Developer',
    initials: 'DG',
    profileUrl: 'https://www.linkedin.com/in/dev-gurung-a8b863136/',
  },
  {
    name: 'Alan Mathew',
    role: 'Developer',
    initials: 'AM',
    profileUrl: 'https://www.linkedin.com/in/alan-mathew-992863184/',
  },
  {
    name: 'Joseph Devasia',
    role: 'SRE',
    initials: 'JD',
    profileUrl: 'https://www.linkedin.com/in/josephdevasia/',
  },
];

/* -------------------------------- fonts -------------------------------- */

const GlobalFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

/* -------------------------------- animations -------------------------------- */

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/* -------------------------------- layout -------------------------------- */

const FooterContainer = styled.footer`
  position: relative;
  overflow: hidden;
  padding: 3rem 1.5rem 2rem;

  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98),
    rgba(248, 250, 252, 0.95)
  );

  border-top: 1px solid rgba(59, 130, 246, 0.10);
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
      rgba(255, 255, 255, 0.08),
      transparent
    );
    ${css`animation: ${shimmer} 5s ease-in-out infinite;`}
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
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 1.75rem;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const FooterSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;

  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.04),
    rgba(139, 92, 246, 0.02)
  );

  border: 1px solid rgba(59, 130, 246, 0.07);
  border-radius: 16px;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.07);
  }

  h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    font-weight: 400;
    color: #1a1a1a;
    margin: 0 0 0.75rem;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 28px;
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    }
  }
`;

/* -------------------------------- connect column -------------------------------- */

const ConnectSection = styled(FooterSection)`
  @media (max-width: 900px) {
    grid-column: 1 / -1;
  }
`;

/* -------------------------------- text -------------------------------- */

const FooterLink = styled(Link)`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  padding: 0.4rem 0.6rem;
  border-radius: 7px;
  text-decoration: none;
  transition: all 0.18s ease;

  &:hover {
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.06);
    transform: translateX(3px);
  }
`;

/* -------------------------------- team members -------------------------------- */

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.25rem;
`;

const MemberCard = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  color: inherit;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(59, 130, 246, 0.22);
    background: rgba(59, 130, 246, 0.04);
    transform: translateX(2px);
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.08);
  }
`;

const MemberInitials = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #1a1a1a;
  color: #faf7f2;
  font-family: 'DM Mono', monospace, 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberRole = styled.p`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  color: #78716c;
  margin: 0;
`;

const LinkedInIcon = styled.span`
  color: #0a66c2;
  opacity: 0.7;
  flex-shrink: 0;
  transition: opacity 0.15s;

  ${MemberCard}:hover & {
    opacity: 1;
  }
`;

/* -------------------------------- bottom -------------------------------- */

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 2rem auto 0;
  padding: 1.25rem 1.5rem;
  text-align: center;

  background: rgba(248, 250, 252, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  p {
    margin: 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    color: #555;
  }
`;

/* -------------------------------- component -------------------------------- */

export function Footer({ className }: FooterProps) {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <>
      <GlobalFonts />
      <FooterContainer className={className}>
        <FooterContent>
          <FooterSection>
            <h3>Navigate</h3>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/thrive">Assessments</FooterLink>
            <FooterLink href="/Services">Services</FooterLink>
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
            <h3>Meet the Team</h3>
            <MemberList>
              {TEAM_MEMBERS.map((member) => (
                <MemberCard
                  key={member.initials}
                  href={member.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <MemberInitials>{member.initials}</MemberInitials>
                  <MemberInfo>
                    <MemberName>{member.name}</MemberName>
                    <MemberRole>{member.role}</MemberRole>
                  </MemberInfo>
                  <LinkedInIcon>
                    <ExternalLink size={13} />
                  </LinkedInIcon>
                </MemberCard>
              ))}
            </MemberList>
          </ConnectSection>
        </FooterContent>

        <FooterBottom>
          <p>© {year} LearnMorra · All rights reserved · Louder Than Words ✨</p>
        </FooterBottom>
      </FooterContainer>
    </>
  );
}
