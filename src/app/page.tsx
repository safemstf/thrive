'use client';
import React from 'react';
import Image from 'next/image';
import logo from '@/assets/logo2.png';

// Portfolio Cards
import CSPortfolioCard from '@/components/cs/CSPortfolioCard';
import ArtPortfolioCard from '@/components/gallery/artPortfolioCard';
import WritingPortfolioCard from '@/components/poetry/writingPortfolio';

// General & Misc Cards
import Card from '@/components/thrive/Card';
import ContactCard from '@/components/misc/contactUs';
import AppointmentCard from '@/components/misc/appointmentsCard';

// Reviews
import ReviewCard from '@/components/reviews/reviewCard';
import ReviewsCard from '@/components/reviews/reviewsCard';

// Golden ratio constant
const GOLDEN_RATIO = 1.618;
const MIN_SIZE = 330;
const THRIVE_SIZE = Math.round(MIN_SIZE * GOLDEN_RATIO);
const MAX_SIZE = Math.round(THRIVE_SIZE * GOLDEN_RATIO);

const CARD_CLASS = `
  bg-white
  rounded-2xl
  transition-transform transition-shadow duration-300 ease-in-out
  hover:shadow-xl hover:scale-[1.02]
  flex items-center justify-center
  justify-self-center
`;

export default function HomePage() {
  const cards = [
    { key: 'appointment', component: <AppointmentCard />, size: MIN_SIZE, extraStyle: { marginLeft: '40px' } },
    { key: 'thrive', component: <Card />, size: THRIVE_SIZE, extraStyle: { marginLeft: '60px' } },
    { key: 'cs', component: <CSPortfolioCard />, size: MIN_SIZE },
    { key: 'art', component: <ArtPortfolioCard />, size: MIN_SIZE },
    { key: 'writing', component: <WritingPortfolioCard />, size: MIN_SIZE },
    { key: 'contact', component: <ContactCard />, size: MIN_SIZE },
    { key: 'reviews-summary', component: <ReviewsCard />, size: MIN_SIZE },
    { key: 'individual-reviews', component: <ReviewCard />, size: MIN_SIZE },
  ];

  return (
    <main className="page">
      <div className="logo-container">
        <Image
          src={logo}
          alt="Site Logo"
          width={150}
          height={150}
          className="logo"
        />
      </div>

      <section className="cards-container">
        <div className="cards-grid">
          {cards.map(({ key, component, size, extraStyle }) => (
            <div
              key={key}
              className={CARD_CLASS}
              style={{ minWidth: size, minHeight: size, maxWidth: MAX_SIZE, maxHeight: MAX_SIZE, ...extraStyle }}
            >
              {component}
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          /* Soft pastel gradient from top-left to bottom-right */
          background: linear-gradient(
            135deg,
        rgba(55, 112, 178, 0.9) 0%,
        rgba(79, 161, 255, 0.8) 10%,
        rgba(255, 239, 118, 0.7) 100%
  );
        }

        .logo-container {
          margin-bottom: 2.5rem;
        }
        .logo {
          border-radius: 0.75rem;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        .cards-container {
          width: 100%;
          max-width: 1400px;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(${MIN_SIZE}px, 1fr));
          gap: 2.5rem;
          justify-items: center;
        }
        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(${MIN_SIZE}px, 1fr));
          }
        }
        @media (max-width: 640px) {
          .cards-grid {
            grid-template-columns: 1fr;
            justify-items: center;
          }
        }
      `}</style>
    </main>
  );
}
