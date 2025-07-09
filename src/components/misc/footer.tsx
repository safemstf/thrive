// src/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { ArrowUp, Heart, Github, Twitter, Mail } from 'lucide-react';
import logo from '../../../public/assets/logo2.png';

const FooterContainer = styled.footer`
  background: white;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
`;

const FooterMain = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const LogoImage = styled(Image)`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandTitle = styled.h3`
  font-size: 1.25rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0;
  letter-spacing: 1px;
`;

const BrandTagline = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-family: 'Work Sans', sans-serif;
`;

const QuickLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 640px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
`;

const FooterLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  
  &:hover {
    color: #2c2c2c;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: #2c2c2c;
    border-color: #2c2c2c;
    color: white;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
`;

const Copyright = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  font-family: 'Work Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackToTopButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
    transform: translateY(-1px);
  }
`;

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterMain>
          {/* Brand Section */}
          <BrandSection>
            <LogoImage 
              src={logo} 
              alt="Learn Morra Logo" 
              width={50}
              height={50}
            />
            <BrandText>
              <BrandTitle>Learn Morra</BrandTitle>
              <BrandTagline>Your guide to excellence</BrandTagline>
            </BrandText>
          </BrandSection>

          {/* Quick Links & Social */}
          <QuickLinks>
            <LinkGroup>
              <FooterLink href="/thrive">Thrive</FooterLink>
              <FooterLink href="/help">Help</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </LinkGroup>
            
            <SocialLinks>
              <SocialLink href="#" aria-label="GitHub">
                <Github />
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter">
                <Twitter />
              </SocialLink>
              <SocialLink href="mailto:contact@learnmorra.com" aria-label="Email">
                <Mail />
              </SocialLink>
            </SocialLinks>
          </QuickLinks>
        </FooterMain>

        <FooterBottom>
          <Copyright>
            © {currentYear} Learn Morra. Made with <Heart size={14} color="#ef4444" /> for learners.
          </Copyright>
          <BackToTopButton onClick={scrollToTop}>
            <ArrowUp size={14} />
            Top
          </BackToTopButton>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}