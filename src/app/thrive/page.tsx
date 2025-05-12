'use client';

import React, { useState, useEffect } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import { useRouter } from 'next/navigation';

// Add Google Fonts
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
  
  :root {
    /* Background & text */
  --background: #e0f7ff;       /* a very pale sky blue */
  --foreground: #0b3d91;       /* deep navy text */

  /* Accent colors */
  --accent-primary: #2196f3;   /* classic blue */
  --accent-secondary: #64b5f6; /* lighter blue */

  /* Complementary pop (optional) */
  --complement: #ff7043;       /* muted coral */

  /* Gradient stops */
  --gradient-start: #2196f3;
  --gradient-end: #64b5f6;

  /* Glassmorphism stays the same... */
  --glass-background: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 15px;
    
    /* Text shadow */
    --text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    
    /* Box shadow */
    --box-shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.1);
    --box-shadow-md: 0 15px 35px rgba(0, 0, 0, 0.4);
    --box-shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.15);
    
    /* Border radius */
    --radius-sm: 12px;
    --radius-md: 20px;
    --radius-lg: 24px;
    
    /* Transitions */
    --transition-normal: all 0.3s ease;
  }
  
  @media (prefers-color-scheme: dark) {
    :root {
/* Background & text */
  --background: #e0f7ff;       /* a very pale sky blue */
  --foreground: #0b3d91;       /* deep navy text */

  /* Accent colors */
  --accent-primary: #2196f3;   /* classic blue */
  --accent-secondary: #64b5f6; /* lighter blue */

  /* Complementary pop (optional) */
  --complement: #ff7043;       /* muted coral */

  /* Gradient stops */
  --gradient-start: #2196f3;
  --gradient-end: #64b5f6;

  /* Glassmorphism stays the same... */
  --glass-background: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 15px;

  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
    background-color: var(--background);
    color: var(--foreground);
  }
`;

export default function ThrivePage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const router = useRouter();
  // Handle initial animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle modal open
  const openModal = (modalType: string) => {
    setActiveModal(modalType);
    document.body.style.overflow = 'hidden';
  };

  // Handle modal close
  const closeModal = () => {
    setActiveModal(null);
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = 'auto';
  };
  useEffect(() => {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && activeModal) {
          closeModal();
        }
      };
      document.addEventListener('keydown', handleEscKey);
       return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'auto';
      };
    }, [activeModal]);

  return (
    <>
      <GlobalStyle />
      <Container className={isLoaded ? 'loaded' : ''}>
        <ContentWrapper>
          <Header>
            <Ribbon>7+ Years of Excellence</Ribbon>
            <SubHeading>Start with an Entry Assessment to determine your personalized track, but approximately 6 to 12 lessons. Contact me through the HomePage.</SubHeading>

          </Header>
          
          <ButtonsContainer>
            <Section>
              <SectionTitle>Programs</SectionTitle>
              <ButtonGroup>
                <MainButton onClick={() => openModal('sat')} aria-label="SAT Prep Options">
                  SAT Prep
                </MainButton>
                <MainButton onClick={() => openModal('ap')} aria-label="AP Courses Options">
                  AP Courses
                </MainButton>
              </ButtonGroup>
            </Section>
            
            <Section>
              <SectionTitle>Common Resources</SectionTitle>
              <ResourceCards>
                <ResourceCard onClick={() => openModal('mathTips')} aria-label="Math Tips">
                  <ResourceIcon>π</ResourceIcon>
                  <ResourceName>Math</ResourceName>
                </ResourceCard>
                <ResourceCard onClick={() => openModal('readingTips')} aria-label="Reading Tips">
                  <ResourceIcon>📚</ResourceIcon>
                  <ResourceName>Reading</ResourceName>
                </ResourceCard>
                <ResourceCard onClick={() => openModal('writingTips')} aria-label="Writing Tips">
                  <ResourceIcon>✍️</ResourceIcon>
                  <ResourceName>Writing</ResourceName>
                </ResourceCard>
                <ResourceCard onClick={() => openModal('studyTips')} aria-label="Study Skills">
                  <ResourceIcon>🎯</ResourceIcon>
                  <ResourceName>Study Skills</ResourceName>
                </ResourceCard>
              </ResourceCards>
            </Section>
          </ButtonsContainer>
          
          <Footer>
            <ButtonGroup>          
              <MainButton onClick={() => router.push('/')} aria-label="Go Home">
                Home
              </MainButton>
              {/* <MainButton onClick={() => router.push('/thrive/sharpner')} aria-label="Go to Sharpner">
                Sharpner
              </MainButton> */}
            </ButtonGroup>
            <FooterText>Simply the Best</FooterText>
          </Footer>
        </ContentWrapper>

        {/* Modals */}
        {activeModal && (
          <Modal onClick={closeModal} role="dialog" aria-modal="true">
            <ModalContent onClick={(e) => e.stopPropagation()}>
              {activeModal === 'sat' && (
                <>
                  <ModalTitle>SAT Prep Options</ModalTitle>
                  <ModalOption>
                    <OptionTitle>Standard Track</OptionTitle>
                    <OptionDescription>Once weekly sessions with Curriculum + Assessments</OptionDescription>
                  </ModalOption>
                  <ModalOption>
                    <OptionTitle>Intensive Track</OptionTitle>
                    <OptionDescription>Twice weekly sessions with Curriculum + Assessments</OptionDescription>
                  </ModalOption>
                  <ModalText>
                    We utilize advanced online tutoring platforms with interactive whiteboards, digital materials, and real-time collaboration tools for the most effective learning experience.
                  </ModalText>
                </>
              )}

              {activeModal === 'ap' && (
                <>
                  <ModalTitle>AP Course Options</ModalTitle>
                  <ModalOption>
                    <OptionTitle>Standard Track</OptionTitle>
                    <OptionDescription>Once weekly sessions with Curriculum + Assessments</OptionDescription>
                  </ModalOption>
                  <ModalOption>
                    <OptionTitle>Intensive Track</OptionTitle>
                    <OptionDescription>Twice weekly sessions with Curriculum + Assessments</OptionDescription>
                  </ModalOption>
                  <ModalText>
                    Our online tutoring technology includes digital textbooks, practice exams, and collaborative study tools that mirror College Board materials.
                  </ModalText>
                  <ModalSubtitle>Available Courses</ModalSubtitle>
                  <CourseGrid>
                    <CourseItem>Calculus</CourseItem>
                    <CourseItem>Precalculus</CourseItem>
                    <CourseItem>Biology</CourseItem>
                    <CourseItem>Chemistry</CourseItem>
                    <CourseItem>US History</CourseItem>
                    <CourseItem>Physics</CourseItem>
                  </CourseGrid>
                </>
              )}

              {activeModal === 'mathTips' && (
                <>
                  <ModalTitle>Math Tips</ModalTitle>
                  <ModalText>Common strategies and tips for SAT/AP math success. Master algebraic techniques, focus on graph interpretation, and develop efficient calculator usage skills. Practice time management and learn to eliminate wrong answers quickly.</ModalText>
                </>
              )}

              {activeModal === 'readingTips' && (
                <>
                  <ModalTitle>Reading Tips</ModalTitle>
                  <ModalText>Strategies for improving reading comprehension and speed. Learn active reading techniques, develop skimming strategies for quick information extraction, and practice identifying main ideas and supporting details across various text types.</ModalText>
                </>
              )}
              
              {activeModal === 'writingTips' && (
                <>
                  <ModalTitle>Writing Tips</ModalTitle>
                  <ModalText>Effective strategies for essay composition and grammar excellence. Focus on thesis development, evidence integration, and concise argumentation. Master common grammar rules, sentence structure variations, and strategic editing techniques.</ModalText>
                </>
              )}
              
              {activeModal === 'studyTips' && (
                <>
                  <ModalTitle>Study Skills</ModalTitle>
                  <ModalText>Time management, focus techniques, and effective study habits. Develop personalized study schedules, utilize spaced repetition for better retention, and create distraction-free environments to maximize learning efficiency.</ModalText>
                </>
              )}
              
              <CloseButton onClick={closeModal} aria-label="Close modal">Close</CloseButton>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </>
  );
}

// Glassmorphic styles
const glass = css`
  background: var(--glass-background);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  color: var(--foreground);
  box-shadow: var(--box-shadow-sm);
`;
// In your Container styled-component, drop the image layer
const Container = styled.div`
  width: 100%;
  min-height: 100vh;

  /* pure blue gradient now */
  background: linear-gradient(
    135deg,
    var(--gradient-start),
    var(--gradient-end)
  );
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;

  &.loaded {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ContentWrapper = styled.div`
  ${glass}
  width: 100%;
  max-width: 850px;
  padding: 3rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--box-shadow-lg);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Ribbon = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: var(--text-shadow);
  letter-spacing: 0.5px;
  color: var(--foreground);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SubHeading = styled.p`
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.95;
  max-width: 80%;
  margin: 0 auto;
  line-height: 1.6;
  color: var(--foreground);
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    max-width: 95%;
  }
  margin: 20px;

`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.section`
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  margin-bottom: 1.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
  color: var(--foreground);
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 2px;
    background: var(--accent-primary);
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const MainButton = styled.button`
  ${glass}
  flex: 1;
  min-width: 150px;
  padding: 1.2rem;
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
  border: none;
  outline: none;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--box-shadow-md);
    background: var(--accent-secondary);
    color: white;
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ResourceCards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ResourceCard = styled.div`
  ${glass}
  padding: 1.2rem 0.8rem;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: center;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--box-shadow-md);
    background: var(--accent-secondary);
    color: white;
  }
  
  &:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }
`;

const ResourceIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.6rem;
`;

const ResourceName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
`;

const Footer = styled.footer`
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 1px;
    background: var(--accent-secondary);
  }
`;

const FooterText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0.85;
`;

// Modal styles
const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  ${glass}
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--box-shadow-md);
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;
  
  @keyframes slideUp {
    from { transform: translateY(20px); }
    to { transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    padding: 1.8rem;
    max-width: 90%;
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.8rem;
  text-align: center;
  text-shadow: var(--text-shadow);
  position: relative;
  color: var(--foreground);
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 2px;
    background: var(--accent-primary);
  }
`;

const ModalOption = styled.div`
  ${glass}
  padding: 1.2rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.2rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-sm);
    background: var(--accent-secondary);
    color: white;
  }
`;

const OptionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const OptionDescription = styled.p`
  font-size: 0.95rem;
  opacity: 0.95;
  font-weight: 300;
`;

const ModalSubtitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  margin: 1.8rem 0 1.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  color: var(--foreground);
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const CourseItem = styled.div`
  ${glass}
  padding: 1rem;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-sm);
    background: var(--accent-secondary);
    color: white;
  }
`;

const ModalText = styled.p`
  font-size: 1.05rem;
  margin-bottom: 1.8rem;
  line-height: 1.7;
  font-weight: 300;
`;

const CloseButton = styled.button`
  ${glass}
  width: 100%;
  padding: 0.9rem;
  border-radius: var(--radius-sm);
  margin-top: 1.5rem;
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-sm);
    background: var(--accent-primary);
    color: white;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid var(--accent-secondary);
    outline-offset: 2px;
  }
`;