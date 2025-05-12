// ReviewsCard.js
'use client';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

// Using your manual responses data
const manualResponses = [
  {
    id: '1',
    timestamp: '2025-04-12T16:45:12Z',
    rating: 5,
    subject: 'SAT English',
    improvement: '580 → 720',
    feedback: 'My English score improved from 580 to over 700 on the SAT! The tutoring sessions focused exactly on what I needed and the strategies really worked on test day. Would recommend to anyone struggling with the verbal section.'
  },
  {
    id: '2',
    timestamp: '2025-04-23T10:20:33Z',
    rating: 5,
    subject: 'SAT Math',
    improvement: '660 → 760',
    feedback: 'I was stuck at 660 in Math but I scored 760! The tutor identified exactly which topics I needed to improve and provided excellent practice problems. The approach to problem-solving made a huge difference.'
  },

  {
    id: '6',
    timestamp: '2025-03-28T11:50:10Z',
    rating: 5,
    subject: 'SAT Prep',
    improvement: '1120 → 1360',
    feedback: 'Practicing in my weak areas made a huge difference. Very grateful for the guidance and test-taking strategies.'
  }
];

const ReviewsCard = () => {
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handleEnter = () => {
    setIdx(prev => (prev + 1) % manualResponses.length);
    setFlipped(true);
  };

  const handleLeave = () => {
    setFlipped(false);
  };

  const toggleModal = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    setShowModal(prev => !prev);
  };

  const modal = showModal
    ? ReactDOM.createPortal(
        <ModalOverlay onClick={toggleModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={toggleModal}>×</CloseButton>
            <h2 className="modal-subject">{manualResponses[idx].subject}</h2>
            <div className="modal-rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="modal-rating-circle">
                  {i < manualResponses[idx].rating ? '•' : '○'}
                </span>
              ))}
              <span className="modal-rating-number">{manualResponses[idx].rating}.0</span>
            </div>
            <div className="modal-improvement">
              <span className="modal-improvement-label">Improvement: </span>
              <span className="modal-improvement-value">{manualResponses[idx].improvement}</span>
            </div>
            <div className="modal-feedback">"{manualResponses[idx].feedback}"</div>
            <div className="modal-timestamp">
              {new Date(manualResponses[idx].timestamp).toLocaleDateString()}
            </div>
          </ModalContent>
        </ModalOverlay>,
        document.body
      )
    : null;

  return (
    <>
      <Wrapper>
        <div
          className={`outer ${flipped ? 'flipped' : ''}`}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <div className="card">
            <div className="face front">
              <div className="rating-container">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="rating-circle">
                    {i < manualResponses[idx].rating ? '•' : '○'}
                  </span>
                ))}
              </div>
              <div className="rating">{manualResponses[idx].rating}.0 / 5.0</div>
              <div className="subject">{manualResponses[idx].subject}</div>
              <div className="improvement-badge">{manualResponses[idx].improvement}</div>
            </div>
            <div className="face back">
              <div className="review-snippet">
                "{manualResponses[idx].feedback.length > 150
                  ? manualResponses[idx].feedback.substring(0, 147) + '...'
                  : manualResponses[idx].feedback}"
              </div>
              <div className="improvement-highlight">
                <span className="improvement-label">Improvement:</span>
                <span className="improvement-value">{manualResponses[idx].improvement}</span>
              </div>
              <button className="btn" onClick={toggleModal}>
                Read All Reviews
              </button>
            </div>
          </div>
        </div>
      </Wrapper>
      {modal}
    </>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  perspective: 800px;

  .outer {
    width: 100%;
    height: 280px;
    position: relative;
    cursor: pointer;
  }

  .card {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
  }

  .outer.flipped .card {
    transform: rotateY(180deg);
  }

  .face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }

  .front {
    background: radial-gradient(circle 230px at top left, #b0a8b9, #364E3E);
    color: #f4f2f7;
  }

  .back {
    background: radial-gradient(circle 230px at top left, #7e6b8f, #364E3E);
    color: #f4f2f7;
    transform: rotateY(180deg);
    text-align: center;
  }

  .rating-container {
    display: flex;
    gap: 6px;
    margin-bottom: 0.5rem;
  }

  .rating-circle {
    font-size: 26px;
    color: white;
    line-height: 0.8;
  }

  .rating {
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
    font-family: 'Montserrat', sans-serif;
  }

  .subject {
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: 0.75rem;
    font-family: 'Montserrat', sans-serif;
  }

  .improvement-badge {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem;
    font-weight: 300;
    color: #ffd700;
    padding: 0.25rem 0.75rem;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 4px;
    letter-spacing: 1px;
  }

  .btn {
    padding: 0.6rem 1.2rem;
    background-color: #364E3E;
    color: #f4f2f7;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: 'Montserrat', sans-serif;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .btn:hover {
    background-color: #362e2a;
    transform: translateY(-2px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #b0a8b9, #4e3e36);
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  color: white;
  font-family: 'Montserrat', sans-serif;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

export default ReviewsCard;
