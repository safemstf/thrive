'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DataEntryCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(600);
  
  // Adjust iframe height based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setIframeHeight(680);
      } else if (window.innerWidth <= 768) {
        setIframeHeight(650);
      } else {
        setIframeHeight(600);
      }
    };
    
    handleResize(); // Set initial height
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(!isHovered);
  
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Close modal on escape key press
  useEffect(() => {
    const handleEscKey = (event: { key: string; }) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  return (
    <>
      <StyledWrapper>
        <div
          className={`card ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onClick={openModal}
          role="button"
          tabIndex={0}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === ' ') openModal();
          }}
        >
          <svg
            className="card__image"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Form icon */}
            <rect x="25" y="20" width="50" height="60" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
            {/* Form lines */}
            <rect x="30" y="30" width="40" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
            <rect x="30" y="42" width="40" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
            <rect x="30" y="54" width="40" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
            {/* Checkmark */}
            <circle cx="70" y="70" r="12" fill="currentColor" fillOpacity="0.3" />
            <path d="M65 70L68 73L75 66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="card__content">
            <p className="card__title">Leave a Review!</p>
            <p className="card__description">
              Submit your information quickly and securely through our form.
            </p>
            <button className="card__button">Open Form</button>
          </div>
        </div>
      </StyledWrapper>

      {isModalOpen && (
        <Modal>
          <ModalOverlay onClick={closeModal} />
          <ModalContent>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <ModalHeader>Submit Your Information</ModalHeader>
            
            <FormContainer>
              {isLoading && (
                <LoadingOverlay>
                  <LoadingSpinner>Loading form...</LoadingSpinner>
                </LoadingOverlay>
              )}
              <ResponsiveIframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSe6J_HJcwKGy2I55b5tn58kxkUIXWI7z5kabyYjEi9DA9120g/viewform?embedded=true"
                onLoad={() => setIsLoading(false)}
                style={{ 
                  opacity: isLoading ? 0 : 1,
                  height: `${iframeHeight}px`
                }}
                allowFullScreen
                title="Data Entry Form"
              />
            </FormContainer>
            
            <PrivacyNote>
              Your information is secure. All submissions are anonymous unless you choose to share your contact details.
            </PrivacyNote>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

const StyledWrapper = styled.div`
  /* Fixed: Set consistent box-sizing */
  box-sizing: border-box;
  /* Fixed: Use consistent width with proper margins */
  width: 100%;
  max-width: 320px;
  /* Fixed: Add proper margin to prevent overlapping */
  margin: 1.5rem;
  perspective: 800px;

  .card {
    position: relative;
    /* Fixed: Set exact width instead of 320 without unit */
    width: 95%;
    height: 280px;
    background: linear-gradient(135deg, #26a69a, #004d40);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(0, 77, 64, 0.2);
    padding: 1rem;
    box-sizing: border-box;
    cursor: pointer;
  }

  .card__image {
    width: 120px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    color: #e0f2f1;
  }

  .card__content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    padding: 2rem;
    box-sizing: border-box;
    background-color: rgba(0, 77, 64, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid #26a69a;
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.4s ease;
  }

  .card__title {
    margin: 0;
    font-size: 1.75rem;
    color: #e0f2f1;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #b2dfdb;
    line-height: 1.5;
    text-align: center;
    max-width: 90%;
  }

  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #00897b;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
    display: block;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .card__button:hover {
    background-color: #00695c;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (hover: hover) {
    .card:hover {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 0 8px 16px rgba(0, 77, 64, 0.3);
    }

    .card:hover .card__content {
      opacity: 1;
    }

    .card:hover .card__image {
      transform: scale(0) rotate(-45deg);
    }
  }

  @media (hover: none) {
    .card.hovered {
      transform: scale(1.02);
      box-shadow: 0 8px 16px rgba(0, 77, 64, 0.3);
    }

    .card.hovered .card__content {
      opacity: 1;
    }

    .card.hovered .card__image {
      transform: scale(0);
    }
  }

  @media (max-width: 768px) {
    /* Fixed: Update margin to be responsive on smaller screens */
    margin: 1rem;
    max-width: 280px;
    
    .card__title {
      font-size: 1.5rem;
    }
    .card__description {
      font-size: 0.95rem;
    }
    .card__button {
      padding: 0.6rem 1.3rem;
    }
  }

  @media (max-width: 576px) {
    /* Fixed: Proper margin for smallest screens */
    margin: 1rem 0.5rem;
    max-width: 100%;
    
    .card {
      height: 300px; /* Slightly reduced height for better spacing */
    }
    .card__content {
      padding: 1.5rem;
      gap: 0.6rem;
    }
    .card__title {
      font-size: 1.4rem;
    }
    .card__description {
      font-size: 0.9rem;
    }
    .card__button {
      padding: 0.5rem 1.2rem;
      font-size: 0.9rem;
      margin-top: 0.3rem;
    }
    .card__image {
      width: 100px;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--glass-background, #ffffff);
  backdrop-filter: blur(var(--glass-blur, 8px));
  border: 1px solid var(--glass-border, rgba(38, 166, 154, 0.3));
  border-radius: var(--radius-md, 16px);
  padding: 2rem;
  box-shadow: var(--box-shadow-md, 0 10px 25px rgba(0, 0, 0, 0.2));
  z-index: 1001;
  
  /* Custom scrollbar for the modal content */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary, #26a69a);
    opacity: 0.8;
    border-radius: 10px;
    
    &:hover {
      opacity: 1;
    }
  }
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary, #26a69a) rgba(0, 0, 0, 0.05);
  
  @media (max-width: 840px) {
    padding: 1.5rem;
    width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: var(--radius-sm, 8px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.75rem;
  color: var(--text-secondary, #555);
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--accent-primary, #26a69a);
  }
`;

const ModalHeader = styled.h2`
  font-family: var(--font-display, sans-serif);
  color: var(--accent-primary, #26a69a);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
`;

const FormContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
  min-height: 400px;
  border-radius: var(--radius-sm, 8px);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    margin: 5px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary, #26a69a);
    opacity: 0.7;
    border-radius: 10px;
    transition: opacity 0.2s ease;
    
    &:hover {
      opacity: 1;
      background: var(--accent-secondary, #00695c);
    }
  }
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary, #26a69a) rgba(0, 0, 0, 0.05);
`;

const ResponsiveIframe = styled.iframe`
  width: 100%;
  border: none;
  transition: opacity 0.5s ease, height 0.3s ease;
  display: block;
  
  /* Custom scrollbar for the iframe if it has any */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent-primary, #26a69a);
    opacity: 0.7;
    border-radius: 10px;
    
    &:hover {
      opacity: 1;
      background: var(--accent-secondary, #00695c);
    }
  }
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--accent-primary, #26a69a) rgba(0, 0, 0, 0.05);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  color: var(--text-secondary, #555);
  font-size: 0.9rem;
  text-align: center;
  
  &:before {
    content: "";
    display: block;
    width: 40px;
    height: 40px;
    margin: 0 auto 12px;
    border-radius: 50%;
    border: 3px solid var(--accent-primary, #26a69a);
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PrivacyNote = styled.p`
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #555);
  text-align: center;
  max-width: 90%;
  line-height: 1.4;
  margin-left: auto;
  margin-right: auto;
`;

export default DataEntryCard;