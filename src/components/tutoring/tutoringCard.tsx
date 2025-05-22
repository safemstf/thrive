'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const SATPrepCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const toggleHover    = () => setIsHovered(!isHovered);
  const handleMouseIn  = () => setIsHovered(true);
  const handleMouseOut = () => setIsHovered(false);
  const handleClick    = () => router.push('/tutoring');

  return (
    <Wrapper>
      <div
        className={`card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseIn}
        onMouseLeave={handleMouseOut}
        onTouchStart={toggleHover}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
      >
        <svg
          className="card__image"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Paper */}
          <rect x="20" y="15" width="60" height="70" rx="4" stroke="currentColor" strokeWidth="3" fill="currentColor" fillOpacity="0.1"/>
          {/* Pencil */}
          <path d="M70 80L55 65 80 40 95 55 70 80Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2"/>
          <path d="M53 62L47 68 72 93 78 87 53 62Z" fill="currentColor" fillOpacity="0.3"/>
        </svg>
        <div className="card__content">
          <p className="card__title">SAT Prep</p>
          <p className="card__description">
            Jump into practice passages, tips, and full-length tests
          </p>
          <button className="card__button">Go to SAT Hub</button>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;

  .card {
    position: relative;
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #f6c667, #f08c00);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(240, 140, 0, 0.2);
    padding: 1rem;
    box-sizing: border-box;
  }

  .card__image {
    width: 120px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    color: #fff7eb;
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
    background-color: rgba(240, 140, 0, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid #e6a84e;
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
    color: #fffaf0;
    font-weight: 700;
    text-align: center;
  }

  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #fff1d6;
    text-align: center;
    max-width: 90%;
  }

  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #e6a84e;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .card__button:hover {
    background-color: #c18b34;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  @media (hover: hover) {
    .card:hover {
      transform: rotate(3deg) scale(1.05);
      box-shadow: 0 8px 16px rgba(240,140,0,0.3);
    }

    .card:hover .card__content {
      opacity: 1;
    }

    .card:hover .card__image {
      transform: scale(0) rotate(45deg);
    }
  }

  @media (hover: none) {
    .card.hovered {
      transform: scale(1.02);
      box-shadow: 0 8px 16px rgba(240,140,0,0.3);
    }

    .card.hovered .card__content {
      opacity: 1;
    }

    .card.hovered .card__image {
      transform: scale(0);
    }
  }

  @media (max-width: 576px) {
    max-width: 100%;
    .card__image { width: 100px; }
    .card__title { font-size: 1.4rem; }
    .card__description { font-size: 0.9rem; }
    .card__button { padding: 0.5rem 1.2rem; font-size: 0.9rem; }
  }
`;

export default SATPrepCard;
