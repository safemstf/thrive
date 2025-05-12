'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const WritingPortfolioCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleTouchStart = () => setIsHovered(prev => !prev);
  const handleClick = () => router.push('/writing');

  return (
    <StyledWrapper>
      <div
        className={`outer ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      >
        <div className="dot" />
        <div className="card">
          <div className="ray" />

          <svg
            className="card__image"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Pen nib circle base */}
            <circle cx="50" cy="50" r="30" fill="currentColor" fillOpacity="0.1" />
            {/* Nib body */}
            <path
              d="M45 30 L55 30 L65 70 L50 90 L35 70 Z"
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Nib slit */}
            <line
              x1="50"
              y1="35"
              x2="50"
              y2="80"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Tip highlight */}
            <circle cx="50" cy="82" r="3" fill="currentColor" />
          </svg>

          <div className="card__content">
            <p className="card__title">Writing Portfolio</p>
            <p className="card__description">
              Explore my creative writing and professional works
            </p>
            <button className="card__button" onClick={handleClick}>
              View Portfolio
            </button>
          </div>
        </div>
        <div className="line topl" />
        <div className="line bottoml" />
        <div className="line leftl" />
        <div className="line rightl" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;

  .outer {
    width: 100%;
    height: 320px;
    border-radius: 10px;
    padding: 1px;
    background: radial-gradient(circle 230px at 0% 0%, #b0a8b9, #4e3e36);
    position: relative;
    overflow: hidden;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }

  .outer.hovered {
    transform: rotate(-3deg) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 43, 0.4);
  }

  .dot {
    width: 5px;
    aspect-ratio: 1;
    position: absolute;
    background-color: #f4f2f7;
    box-shadow: 0 0 10px #d3cddc;
    border-radius: 100px;
    z-index: 2;
    right: 10%;
    top: 10%;
    animation: moveDot 6s linear infinite;
  }

  @keyframes moveDot {
    0%,100% { top: 10%; right: 10%; }
    25%      { top: 10%; right: calc(100% - 35px); }
    50%      { top: calc(100% - 30px); right: calc(100% - 35px); }
    75%      { top: calc(100% - 30px); right: 10%; }
  }

  .card {
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 9px;
    border: solid 1px #4e3e36;
    background: radial-gradient(circle 280px at 0% 0%, #7e6b8f, #4e3e36);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-direction: column;
    color: #f4f2f7;
    overflow: hidden;
  }

  .card__image {
    width: 80px;
    height: auto;
    transition: all 0.4s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    color: #f4f2f7;
    margin-bottom: 1rem;
  }

  .ray {
    width: 220px;
    height: 45px;
    border-radius: 100px;
    position: absolute;
    background-color: #d3cddc;
    opacity: 0.4;
    box-shadow: 0 0 50px #b0a8b9;
    filter: blur(10px);
    transform-origin: 10%;
    top: 0;
    left: 0;
    transform: rotate(40deg);
    transition: opacity 0.4s ease;
  }

  .line {
    width: 100%;
    height: 1px;
    position: absolute;
    background-color: #4e3e36;
  }

  .topl    { top: 10%; background: linear-gradient(90deg, #b0a8b9 30%, #4e3e36 70%); }
  .bottoml { bottom: 10%; }
  .leftl   { left: 10%; width: 1px; height: 100%; background: linear-gradient(180deg, #b0a8b9 30%, #4e3e36 70%); }
  .rightl  { right: 10%; width: 1px; height: 100%; }

  .card__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    box-sizing: border-box;
    background-color: #4e3e36;
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.8rem;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 10;
  }

  .card__title {
    margin: 0;
    font-size: 1.75rem;
    color: #f4f2f7;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .card__description {
    margin: 0;
    font-size: 1rem;
    color: #d3cddc;
    line-height: 1.5;
    text-align: center;
    max-width: 90%;
  }

  .card__button {
    padding: 0.7rem 1.5rem;
    background-color: #4e3e36;
    color: white;
    border: 1px solid #4e3e36;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
    display: block;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .card__button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  @media (hover: hover) {
    .outer:hover .card__content {
      opacity: 1;
    }
    .outer:hover .card__image {
      transform: scale(0) rotate(-45deg);
    }
    .outer:hover .ray {
      opacity: 0.1;
    }
  }

  @media (hover: none) {
    .outer.hovered .card__content {
      opacity: 1;
    }
    .outer.hovered .card__image {
      transform: scale(0) rotate(-45deg);
    }
    .outer.hovered .ray {
      opacity: 0.1;
    }
  }
`;
export default WritingPortfolioCard;
