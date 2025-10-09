'use client';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FileText } from 'lucide-react';

/* ---------- Animations ---------- */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

/* ---------- Layout ---------- */
const Page = styled.main`
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  justify-content: center;
  padding: 5rem 1rem;
`;

const Container = styled.div`
  width: 100%;
  max-width: 860px;
  animation: ${fadeInUp} 0.5s ease;
`;

const Hero = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  color: white;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  margin: 0;
  color: #0f172a;
`;

const Subtitle = styled.p`
  color: #475569;
  font-size: 1rem;
  margin: 0.25rem 0 0;
`;

/* ---------- Sections ---------- */
const Section = styled.section`
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(2,6,23,0.04);
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
`;

const Text = styled.p`
  margin: 0.25rem 0;
  color: #475569;
  line-height: 1.6;
  font-size: 0.96rem;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: right;
`;

/* ---------- Component ---------- */
export default function Terms() {
  return (
    <Page>
      <Container>
        <Hero>
          <IconWrapper>
            <FileText size={26} />
          </IconWrapper>
          <div>
            <Title>Terms of Service</Title>
            <Subtitle>Simple terms for using this website responsibly.</Subtitle>
          </div>
        </Hero>

        <Section>
          <SectionTitle>Overview</SectionTitle>
          <Text>
            By using this website, you agree to follow these terms. They exist to ensure fair and respectful use of the content and services provided.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Use of Services</SectionTitle>
          <Text>
            You agree to use this site for lawful purposes only. Activities that disrupt functionality, compromise security, or harm other users are strictly prohibited.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Intellectual Property</SectionTitle>
          <Text>
            All text, code, and design on this site are protected by applicable intellectual property laws. You may not copy, reproduce, or modify materials without prior permission.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Limitation of Liability</SectionTitle>
          <Text>
            This website and its content are provided “as is” without warranty of any kind. The owner is not responsible for any damages or losses arising from use or inability to use the site.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Termination</SectionTitle>
          <Text>
            Access to the website may be suspended or terminated at any time if these terms are violated or if maintenance is required.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Changes to Terms</SectionTitle>
          <Text>
            These terms may be updated periodically. Continued use of the site after updates implies acceptance of the new version.
          </Text>
        </Section>

        <Footer>Last updated: October 9, 2025</Footer>
      </Container>
    </Page>
  );
}
