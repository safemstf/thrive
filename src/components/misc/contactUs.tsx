'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import whatsappQR from '@/assets/WhatsappQR.jpg';

const ContactCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleFlip = () => setIsFlipped(prev => !prev);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <StyledWrapper>
        <div
          className={`outer ${isFlipped ? 'flipped' : ''}`}
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={toggleFlip}
        >
          <div className="card">
            {/* FRONT FACE */}
            <div className="face front">
              <svg
                className="card__image"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="15" y="25" width="70" height="50" rx="4"
                  stroke="currentColor" strokeWidth="3"
                  fill="currentColor" fillOpacity="0.15" />
                <path d="M15 25 L50 55 L85 25"
                  stroke="currentColor" strokeWidth="3" fill="none" />
                <line x1="15" y1="25" x2="50" y2="55"
                  stroke="currentColor" strokeWidth="2" />
                <line x1="85" y1="25" x2="50" y2="55"
                  stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {/* BACK FACE */}
            <div className="face back">
              <p className="card__title">Contact Me</p>
              <p className="card__description">
              Tap the image to expand
              </p>
              <div
                className="qr__container"
                onClick={openModal}
                role="button"
                aria-label="Open QR code modal"
              >
                <img
                  src={whatsappQR.src}
                  alt="WhatsApp QR Code"
                  className="whatsapp__qr"
                />
              </div>
              <a
                href="https://wa.me/4694748676"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardButton>Chat on WhatsApp</CardButton>
              </a>
            </div>
          </div>
        </div>
      </StyledWrapper>

      {showModal && (
        <ModalOverlay onClick={closeModal} role="dialog" aria-modal="true">
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={closeModal} aria-label="Close">&times;</CloseButton>
            <a href="https://wa.me/4694748676" target="_blank" rel="noopener noreferrer">
              <img
                src={whatsappQR.src}
                alt="WhatsApp QR Code"
                className="modal__qr"
              />
            </a>
            <ModalButton
              href="https://wa.me/4694748676"
              target="_blank"
              rel="noopener noreferrer"
            >
              Reach me on WhatsApp
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  perspective: 1000px;

  .outer {
    width: 100%;
    height: 320px;
    position: relative;
    cursor: pointer;
  }

  .card {
    width: 100%;
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
  }

  .outer.flipped .card {
    transform: rotateY(180deg);
  }

  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .front {
    background: radial-gradient(circle 230px at 0% 0%, #b0a8b9, #3E364E);
    color: #f4f2f7;
  }

  .back {
    background: radial-gradient(circle 280px at 0% 0%, #7e6b8f, #3E364E);
    color: #f4f2f7;
    transform: rotateY(180deg);
    padding: 1rem;
    box-sizing: border-box;
    text-align: center;
  }

  .card__image {
    width: 80px;
    height: auto;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  }

  .card__title {
    font-size: 1.6rem;
    margin: 0.5rem 0 0.25rem;
    font-weight: 700;
  }

  .card__description {
    font-size: 0.95rem;
    margin: 0 0 1rem;
  }

  .qr__container {
    width: 180px;
    height: 180px;
    background: #fff;
    padding: 6px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .whatsapp__qr {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  position: relative;
  padding: 2rem;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  scale: 0.6;

  /* 1) make this a flex‐column so children center nicely */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .modal__qr {
    /* 2) remove width:100% and scale:... */
    /* width: 100%; */
    height: auto;
    transform: scale(0.7);      /* proper scaling */
    transform-origin: center;    /* scale from center */
    margin: 0 0 1.5rem;          /* 3) only vertical spacing */
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);

    /* if you still need a container around it: */
    display: block;              /* ensure block-level for auto margins */
  }
`;


const CloseButton = styled.button`
  position: absolute;
  top: 8px; right: 12px;
  background: red;
  border-radius: 50%;
  margin-top: -100px;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const CardButton = styled.button`
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #25D366;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: #1ebe57;
  }
`;

const ModalButton = styled.a`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #25D366;
  color: white;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background-color: #1ebe57;
  }
`;

export default ContactCard;