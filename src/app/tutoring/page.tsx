// src/app/tutoring/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, BookOpen, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const SCHEDULING_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1DPwHESq8j7NCC-Vt8nzpET1NlPlgsH1CKM4VvOqUlFiC2LEfFZv2S0WZhvWfW-1NQPyYygo1e?gv=true';
const WHATSAPP_URL = 'https://wa.me/4694748676';
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe6J_HJcwKGy2I55b5tn58kxkUIXWI7z5kabyYjEi9DA9120g/viewform?embedded=true';

export default function TutoringPage() {
  const [loaded, setLoaded] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // close modal on ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contactOpen) {
        setContactOpen(false);
        document.body.style.overflow = 'auto';
      }
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [contactOpen]);

  const openContact = () => {
    setContactOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeContact = () => {
    setContactOpen(false);
    document.body.style.overflow = 'auto';
  };
  const goToForm = () => {
    window.open(FORM_URL, '_blank');
  };

  return (
    <PageWrapper $loaded={loaded}>
      <Main>
        <Header>
          <BookOpen size={28} />
          <h1>Excel Prep Tutoring</h1>
          <p>Reach out via WhatsApp, schedule a session, or leave us a review.</p>
        </Header>

        <Actions>
          <ContactButton onClick={openContact}>Contact Us</ContactButton>
          <FormButton onClick={goToForm}>Leave a Review</FormButton>
        </Actions>
      </Main>

      {/* Contact Options Modal */}
      {contactOpen && (
        <ModalOverlay onClick={closeContact}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <Close onClick={closeContact} aria-label="Close contact options">
              <X size={24} />
            </Close>
            <ModalTitle>Contact Options</ModalTitle>
            <ModalActions>
              <ModalLink href={WHATSAPP_URL} target="_blank" rel="noopener">
                <MessageSquare size={20} /> WhatsApp
              </ModalLink>
              <ModalLink href={SCHEDULING_URL} target="_blank" rel="noopener">
                <CalendarIcon size={20} /> Schedule Session
              </ModalLink>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}

// ---------- Styled Components ----------

const PageWrapper = styled.div<{ $loaded: boolean }>`
  background: linear-gradient(
    var(--gradient-angle),
    var(--background-start),
    var(--background-end)
  );
  min-height: 100vh;
   opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transform: ${({ $loaded }) =>
    $loaded ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.6s ease;
`;

const Main = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  h1 {
  font-family: 'Work Sans', sans-serif;
    font-size: 2.5rem;
    margin: 0;
  }
  p {
    max-width: 600px;
    color: var(--text-secondary);
  }
`;

const Actions = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ContactButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

const FormButton = styled(ContactButton)`
  border-radius: 4px;
  background: var(--glass-bg);
  border-color: var(--accent-primary);
  color: var(--accent-primary);

  &:hover {
    background: var(--accent-primary);
    color: #fff;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 2.5rem;
  border-radius: var(--radius-md);
  max-width: 360px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Close = styled.button`
  align-self: flex-end;
  background: transparent;
  border: none;
  cursor: pointer;
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-family: 'Work Sans', sans-serif;
  margin: 0;
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--accent-primary);
  border-radius: 4px;
  text-decoration: none;
  color: var(--accent-primary);
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    color: #fff;
  }
`;
