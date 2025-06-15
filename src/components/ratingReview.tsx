// components/RatingReview.tsx
import React from 'react';
import styled from 'styled-components';
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.1rem;
`;

const Blurb = styled.blockquote`
  font-style: italic;
  color: #555;
  margin: 0;
  border-left: 3px solid #eee;
  padding-left: 0.75rem;
  quotes: "“" "”";
  &::before {
    content: open-quote;
  }
  &::after {
    content: close-quote;
  }
`;

interface RatingReviewProps {
  rating: number;
  votes: number;
}

const reviewTexts: Record<number, string> = {
  1: "Absolutely unbearable. Like a bag of skunk-scented onions.",
  2: "Rough around the edges—got a few moments, but mostly grit.",
  3: "Decent. Left me thinking more than I expected.",
  4: "Really enjoyable, with a few memorable highs.",
  5: "An instant classic. I’d reread it every summer.",
};

function getBlurb(rating: number) {
  const key = Math.round(rating);
  return reviewTexts[key] || "";
}

export const RatingReview: React.FC<RatingReviewProps> = ({ rating, votes }) => {
  if (votes === 0) {
    return (
      <Wrapper>
        <Stars>
          {[...Array(5)].map((_, i) => (
            <MdStarBorder size={20} key={i} />
          ))}
          <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
            No reviews yet
          </span>
        </Stars>
        <Blurb>Be the first to leave a review!</Blurb>
      </Wrapper>
    );
  }

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <Wrapper>
      <Stars>
        {[...Array(fullStars)].map((_, i) => (
          <MdStar size={20} key={`f${i}`} />
        ))}
        {halfStar && <MdStarHalf size={20} key="half" />}
        {[...Array(emptyStars)].map((_, i) => (
          <MdStarBorder size={20} key={`e${i}`} />
        ))}
        <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
          {rating.toFixed(1)}/5
        </span>
      </Stars>
      <Blurb>{getBlurb(rating)} — {votes} reviews</Blurb>
    </Wrapper>
  );
};
