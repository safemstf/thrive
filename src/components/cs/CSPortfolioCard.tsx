'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const CSPortfolioCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(!isHovered);
  const handleClick = () => {
    router.push('/projects');
  };

  return (
    <StyledWrapper>
      <div
        className={`card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
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
          {/* Laptop */}
          <rect x="20" y="30" width="60" height="40" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3" />
          <rect x="25" y="35" width="50" height="30" fill="currentColor" fillOpacity="0.2" />
          {/* Terminal screen */}
          <text x="30" y="50" fontSize="6" fill="currentColor">{`>`}</text>
          <text x="38" y="50" fontSize="5.5" fill="currentColor">`npm run dev`</text>
          {/* Keyboard base */}
          <rect x="15" y="70" width="70" height="5" fill="currentColor" />
        </svg>
        <div className="card__content">
          <p className="card__title">CS Portfolio</p>
          <p className="card__description">
            Explore my software projects, GitHub work, and live demos.
          </p>
          <button className="card__button">View Projects</button>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;

  .card {
    position: relative;
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #90caf9, #0d47a1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(13, 71, 161, 0.2);
    padding: 1rem;
    box-sizing: border-box;
  }

  .card__image {
    width: 120px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    color: #e3f2fd;
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
    background-color: rgba(13, 71, 161, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid #42a5f5;
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
    color: #e3f2fd;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #bbdefb;
    line-height: 1.5;
    text-align: center;
    max-width: 90%;
  }

  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #1e88e5;
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
    background-color: #1565c0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (hover: hover) {
    .card:hover {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 0 8px 16px rgba(13, 71, 161, 0.3);
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
      box-shadow: 0 8px 16px rgba(13, 71, 161, 0.3);
    }

    .card.hovered .card__content {
      opacity: 1;
    }

    .card.hovered .card__image {
      transform: scale(0);
    }
  }

  @media (max-width: 768px) {
    max-width: 240px;
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
    max-width: 100%;
    .card {
      height: 320px;
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

export default CSPortfolioCard;
