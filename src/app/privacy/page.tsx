'use client';
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield } from 'lucide-react';

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

/* ---------- Content ---------- */
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

const List = styled.ul`
  margin: 0.25rem 0;
  padding-left: 1.2rem;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: right;
`;

/* ---------- Component ---------- */
export default function Privacy() {
  return (
    <Page>
      <Container>
        <Hero>
          <IconWrapper>
            <Shield size={26} />
          </IconWrapper>
          <div>
            <Title>Privacy Policy</Title>
            <Subtitle>
              Transparent. Minimal. Respectful of your data.
            </Subtitle>
          </div>
        </Hero>

        <Section>
          <SectionTitle>Overview</SectionTitle>
          <Text>
            This website prioritizes privacy and transparency. It collects only
            the minimal information necessary to operate and improve the site.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Information Collected</SectionTitle>
          <List>
            <li>
              <strong>Basic analytics:</strong> Anonymous data such as page
              visits, browser type, and general usage trends.
            </li>
            <li>
              <strong>Voluntary inputs:</strong> Any information you choose to
              send via contact forms or linked communication channels.
            </li>
            <li>
              <strong>Cookies:</strong> Used sparingly to enhance performance or
              remember preferences; no advertising or tracking cookies.
            </li>
          </List>
        </Section>

        <Section>
          <SectionTitle>How Information Is Used</SectionTitle>
          <List>
            <li>To maintain and improve site functionality.</li>
            <li>To respond to inquiries or feedback you send voluntarily.</li>
            <li>To monitor performance and prevent abuse.</li>
          </List>
        </Section>

        <Section>
          <SectionTitle>Third-Party Services</SectionTitle>
          <Text>
            Some services (such as analytics or hosting providers) may process
            limited, anonymized data to support site operation. These providers
            are selected for their privacy and compliance standards.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Data Sharing</SectionTitle>
          <Text>
            No personal information is sold, rented, or shared with third
            parties except when required by law or essential for functionality.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Security</SectionTitle>
          <Text>
            Reasonable technical and organizational measures are in place to
            protect information. However, no system can be guaranteed 100%
            secure.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Policy Updates</SectionTitle>
          <Text>
            This Privacy Policy may be updated periodically. Updates will be
            reflected on this page with an effective date.
          </Text>
        </Section>

        <Footer>Last updated: October 9, 2025</Footer>
      </Container>
    </Page>
  );
}
