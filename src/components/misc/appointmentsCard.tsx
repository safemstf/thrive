'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

const SCHEDULING_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1DPwHESq8j7NCC-Vt8nzpET1NlPlgsH1CKM4VvOqUlFiC2LEfFZv2S0WZhvWfW-1NQPyYygo1e?gv=true';

const AppointmentCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(!isHovered);
  
  const handleButtonClick = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };
  
  return (
    <>
      <StyledWrapper>
        <div 
          className={`card ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
        >
          <svg 
            className="card__image" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Calendar base */}
            <rect x="20" y="25" width="60" height="55" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
            
            {/* Calendar header */}
            <rect x="20" y="25" width="60" height="12" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
            
            {/* Calendar days */}
            <line x1="35" y1="47" x2="35" y2="72" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="50" y1="47" x2="50" y2="72" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="65" y1="47" x2="65" y2="72" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            
            <line x1="20" y1="47" x2="80" y2="47" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="20" y1="55" x2="80" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="20" y1="63" x2="80" y2="63" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
            
            {/* Selected date */}
            <circle cx="50" cy="55" r="5" fill="currentColor" />
            
            {/* Calendar tabs */}
            <path d="M30 25V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 25V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M70 25V15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Appointment clock */}
            <circle cx="75" cy="30" r="12" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
            <path d="M75 24V30H81" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          
          <div className="card__content">
            <p className="card__title">Appointments</p>
            <p className="card__description">
              Schedule a time to discuss tutoring here! 
            </p>
            <button className="card__button" onClick={handleButtonClick}>Book Session</button>
          </div>
        </div>
      </StyledWrapper>
      
      {showModal && (
        <ModalOverlay onClick={handleClose}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <iframe
              src={SCHEDULING_URL}
              frameBorder="0"
              style={{ border: 0, width: '100%', height: '100%' }}
              scrolling="auto"
            />
            <CloseButton onClick={handleClose} aria-label="Close modal">✕</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

const StyledWrapper = styled.div`
  /* Container styles to control width properly */
  width: 100%;

  max-width: 300px;
  margin: 0 auto;

  .card {
    position: relative;
    width: 250px;
    height: 320px;
    background: linear-gradient(135deg, #a5d6a7, #1b5e20);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(27, 94, 32, 0.2);
    padding: 1rem;
    box-sizing: border-box;
  }
  
  .card__image {
    width: 120px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    color: #e8f5e9;
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
    background-color: rgba(27, 94, 32, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid #43a047;
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
    color: #e8f5e9;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
  }
  
  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #c8e6c9;
    line-height: 1.5;
    text-align: center;
    max-width: 90%;
  }
  
  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #43a047;
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
    background-color: #2e7d32;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Hover effects for desktop */
  @media (hover: hover) {
    .card:hover {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 0 8px 16px rgba(27, 94, 32, 0.3);
    }
    
    .card:hover .card__content {
      opacity: 1;
    }
    
    .card:hover .card__image {
      transform: scale(0) rotate(-45deg);
    }
  }
  
  /* For mobile devices */
  @media (hover: none) {
    .card.hovered {
      transform: scale(1.02);
      box-shadow: 0 8px 16px rgba(27, 94, 32, 0.3);
    }
    
    .card.hovered .card__content {
      opacity: 1;
    }
    
    .card.hovered .card__image {
      transform: scale(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 1200px) {
    max-width: 280px;
  }
  
  @media (max-width: 992px) {
    max-width: 260px;
  }
  
  @media (max-width: 768px) {
    max-width: 240px;
  }
  
  @media (max-width: 576px) {
    max-width: 100%;
    
    .card {
      height: 230px;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  position: relative;
  width: 90vw;
  max-width: 800px;
  height: 80vh;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  iframe {
    width: 100%;
    height: 100%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 36px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #1b5e20;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &:hover { 
    background: #e8f5e9; 
    transform: scale(1.1);
  }
`;

export default AppointmentCard;