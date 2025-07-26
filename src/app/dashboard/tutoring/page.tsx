// src/app/dashboard/tutoring/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  X, 
  BookOpen, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Star,
  Clock,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';

const SCHEDULING_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1DPwHESq8j7NCC-Vt8nzpET1NlPlgsH1CKM4VvOqUlFiC2LEfFZv2S0WZhvWfW-1NQPyYygo1e?gv=true';
const WHATSAPP_URL = 'https://wa.me/4694748676';
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe6J_HJcwKGy2I55b5tn58kxkUIXWI7z5kabyYjEi9DA9120g/viewform?embedded=true';

export default function DashboardTutoringPage() {
  const [loaded, setLoaded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contactOpen) {
        closeContact();
      }
    };
    
    if (contactOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [contactOpen]);

  const openContact = () => setContactOpen(true);
  
  const closeContact = () => setContactOpen(false);
  
  const goToForm = () => window.open(FORM_URL, '_blank', 'noopener,noreferrer');

  return (
    <PageWrapper $loaded={loaded}>
      <Container>
        <Header>
          <IconWrapper>
            <BookOpen size={40} />
          </IconWrapper>
          <Title>Excel Prep Tutoring</Title>
          <Subtitle>
            Master Excel with personalized one-on-one tutoring sessions designed for your success.
          </Subtitle>
        </Header>

        <Features>
          <FeatureCard>
            <Users size={24} />
            <h3>Personalized Learning</h3>
            <p>Tailored sessions based on your current skill level and learning goals</p>
          </FeatureCard>
          <FeatureCard>
            <Clock size={24} />
            <h3>Flexible Scheduling</h3>
            <p>Book sessions at times that work best for your schedule</p>
          </FeatureCard>
          <FeatureCard>
            <Award size={24} />
            <h3>Expert Guidance</h3>
            <p>Learn from experienced tutors with proven track records</p>
          </FeatureCard>
        </Features>

        <Actions>
          <PrimaryButton onClick={openContact}>
            <MessageSquare size={20} />
            Get Started
          </PrimaryButton>
          <SecondaryButton onClick={goToForm}>
            <Star size={20} />
            Leave a Review
          </SecondaryButton>
        </Actions>

        <Benefits>
          <BenefitItem>
            <CheckCircle size={18} />
            <span>Learn advanced Excel formulas and functions</span>
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={18} />
            <span>Master data analysis and visualization</span>
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={18} />
            <span>Improve productivity and efficiency</span>
          </BenefitItem>
          <BenefitItem>
            <CheckCircle size={18} />
            <span>Get personalized practice exercises</span>
          </BenefitItem>
        </Benefits>
      </Container>

      {/* Contact Modal */}
      {contactOpen && (
        <ModalOverlay onClick={closeContact} role="dialog" aria-modal="true">
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Contact Us</ModalTitle>
              <CloseButton 
                onClick={closeContact} 
                aria-label="Close contact options"
                type="button"
              >
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <p>Choose your preferred way to get in touch:</p>
              <ModalActions>
                <ModalLink 
                  href={WHATSAPP_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageSquare size={20} />
                  <div>
                    <strong>WhatsApp</strong>
                    <small>Quick questions & instant replies</small>
                  </div>
                </ModalLink>
                <ModalLink 
                  href={SCHEDULING_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <CalendarIcon size={20} />
                  <div>
                    <strong>Schedule Session</strong>
                    <small>Book your tutoring appointment</small>
                  </div>
                </ModalLink>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

// ---------- Styled Components ----------

const PageWrapper = styled.div<{ $loaded: boolean }>`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transform: ${({ $loaded }) =>
    $loaded ? 'translateY(0)' : 'translateY(30px)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const Title = styled.h1`
  font-family: 'Work Sans', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    color: #667eea;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-family: 'Work Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #1e293b;
  }
  
  p {
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin-bottom: 3rem;
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border: 2px solid #667eea;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
`;

const Benefits = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  
  svg {
    color: #10b981;
    flex-shrink: 0;
  }
  
  span {
    color: #1e293b;
    font-weight: 500;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 0 2rem 2rem 2rem;
  
  p {
    color: #64748b;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ModalLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: #1e293b;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8fafc;
    transform: translateY(-1px);
  }
  
  svg {
    color: #667eea;
    flex-shrink: 0;
  }
  
  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    strong {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    small {
      color: #64748b;
      font-size: 0.875rem;
    }
  }
`;