'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const ArtPortfolioCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(!isHovered);
  const handleClick = () => {
    router.push('/gallery');
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
          {/* Easel/Canvas */}
          <path 
            d="M25 20L75 20L75 70L25 70L25 20Z" 
            fill="currentColor" 
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="3"
          />
          
          {/* Easel legs */}
          <path 
            d="M30 70L20 90" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <path 
            d="M70 70L80 90" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <path 
            d="M50 70L50 85" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          
          {/* Art on canvas - abstract shapes */}
          <circle cx="40" cy="35" r="8" fill="currentColor" fillOpacity="0.8" />
          <rect x="55" y="40" width="12" height="12" fill="currentColor" fillOpacity="0.6" />
          <path 
            d="M30 50C35 45 45 55 50 50C55 45 65 55 70 50" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          
          {/* Paint palette */}
          <path 
            d="M15 40C15 35 20 30 25 32C30 34 35 30 33 25C31 20 35 15 40 15C45 15 47 20 45 25C43 30 45 35 50 35C55 35 57 30 55 25C53 20 58 15 63 15C68 15 70 20 68 25C66 30 70 35 75 35" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            fillOpacity="0"
          />
          
          {/* Paint dots on palette */}
          <circle cx="25" cy="25" r="3" fill="currentColor" />
          <circle cx="40" cy="22" r="3" fill="currentColor" />
          <circle cx="55" cy="25" r="3" fill="currentColor" />
          <circle cx="70" cy="25" r="3" fill="currentColor" />
        </svg>
        <div className="card__content">
          <p className="card__title">Art Portfolio</p>
          <p className="card__description">
                Check out my art! Prints and requests available
          </p>
          <button className="card__button">View Gallery</button>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;

  .card {
    position: relative;
    width: 100%;
    height: 320px;
    background: linear-gradient(135deg, #a099f4, #5a1ee5);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.4s ease;
    box-shadow: 0 4px 12px rgba(90, 30, 229, 0.2);
    padding: 1rem;
    box-sizing: border-box;
  }

  .card__image {
    width: 120px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    color: #e9e5fb;
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
    background-color: rgba(90, 30, 229, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid #7b5fe9;
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
    color: #f3f0ff;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #dcd3fd;
    line-height: 1.5;
    text-align: center;
    max-width: 90%;
  }

  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #7b5fe9;
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
    background-color: #4e1dbd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (hover: hover) {
    .card:hover {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 0 8px 16px rgba(90, 30, 229, 0.3);
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
      box-shadow: 0 8px 16px rgba(90, 30, 229, 0.3);
    }

    .card.hovered .card__content {
      opacity: 1;
    }

    .card.hovered .card__image {
      transform: scale(0);
    }
  }

  /* Responsive adjustments (same as before) */
  
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
      height: 320px; /* Maintaining the requested height */
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

export default ArtPortfolioCard;