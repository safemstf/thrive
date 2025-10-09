'use client';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { SiLinkedin, SiGithub, SiYoutube } from 'react-icons/si';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

// --- Page Wrapper ---
const PageWrapper = styled.div`
  width: 100%;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// --- Hero Section ---
const HeroSection = styled.section`
  width: 100%;
  padding: 6rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-image: url('https://picsum.photos/1920/1080?random=12');
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(30,41,59,0.6), rgba(59,130,246,0.3));
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 10;
  max-width: 800px;
  animation: ${fadeInUp} 1s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  color: white;
  margin-bottom: 1rem;
  span {
    background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
`;

// --- Contact Grid ---
const ContactGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 900px;
`;

// --- Contact Card ---
const ContactCard = styled.a`
  background: #ffffff;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 260px;
  text-decoration: none;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;

  svg {
    width: 56px;
    height: 56px;
    margin-bottom: 1rem;
    animation: ${float} 3s ease-in-out infinite;
  }

  &:hover {
    transform: translateY(-10px) scale(1.05);
    box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  }
`;

const ContactTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ContactDesc = styled.p`
  font-size: 0.95rem;
  text-align: center;
  color: #64748b;
`;

// --- Component ---
export default function Contact() {
  return (
    <PageWrapper>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Contact <span>Me</span></HeroTitle>
          <HeroSubtitle>
            I’m always open to discussing projects, collaborations, or opportunities. Connect with me below!
          </HeroSubtitle>
          <ContactGrid>
            <ContactCard href="https://www.linkedin.com/in/safe-mufasa" target="_blank" rel="noopener noreferrer">
              <SiLinkedin color="#0A66C2" />
              <ContactTitle>LinkedIn</ContactTitle>
              <ContactDesc>Connect and message me on LinkedIn</ContactDesc>
            </ContactCard>

            <ContactCard href="https://github.com/safemstf" target="_blank" rel="noopener noreferrer">
              <SiGithub color="#333" />
              <ContactTitle>GitHub</ContactTitle>
              <ContactDesc>Check out my repositories and projects</ContactDesc>
            </ContactCard>

            <ContactCard href="https://www.youtube.com/@learnmorra" target="_blank" rel="noopener noreferrer">
              <SiYoutube color="#FF0000" />
              <ContactTitle>YouTube</ContactTitle>
              <ContactDesc>Watch tutorials and creative content</ContactDesc>
            </ContactCard>
          </ContactGrid>
        </HeroContent>
      </HeroSection>
    </PageWrapper>
  );
}
