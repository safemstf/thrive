// src/components/ReviewResponses.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Define the type for our response data
interface ResponseData {
  id: string;
  timestamp: string;
  rating: number;
  subject: string;
  improvement: string;
  feedback: string;
}

export default function ReviewResponses() {
  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseData[]>([]);

  useEffect(() => {
    // Updated reviews with more detailed feedback
    const manualResponses: ResponseData[] = [
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
        id: '3',
        timestamp: '2025-03-17T14:15:22Z',
        rating: 5,
        subject: 'SAT Complete',
        improvement: '1360 → 1520',
        feedback: 'Incredible improvement! My overall SAT score went from 1360 to 1520. The personalized study plan and weekly practice tests made all the difference. I got into my dream school thanks to this score boost!'
      },
      {
        id: '4',
        timestamp: '2025-05-01T09:30:45Z',
        rating: 5,
        subject: 'AP Chemistry',
        improvement: 'B- → A+',
        feedback: 'Chemistry finally makes sense! I was struggling with grades, but after tutoring, I\'ve been scoring better on every test. The way concepts were explained made everything click. I\'m now confident about taking the AP exam.'
      },
      {
        id: '5',
        timestamp: '2025-04-05T13:25:18Z',
        rating: 5,
        subject: 'Geometry',
        improvement: 'C → A+',
        feedback: 'I struggled with geometry proofs and complex problems until these tutoring sessions. The step-by-step approach and visual explanations helped me understand concepts I\'d been struggling with for months.'
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

    // Simulate a short loading time for better UX
    const timer = setTimeout(() => {
      setResponses(manualResponses);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star key={index} filled={index < rating}>
        {index < rating ? '★' : '☆'}
      </Star>
    ));
  };

  return (
    <Wrapper>
      <Title>Student Success Stories</Title>
      <FormContainer>
        {isLoading ? (
          <LoadingSpinner>Loading reviews...</LoadingSpinner>
        ) : (
          <ReviewCardsGrid>
            {responses.map((response) => (
              <ReviewCard key={response.id}>
                <CardHeader>
                  <SubjectAndImprovement>
                    <Subject>{response.subject}</Subject>
                    <Improvement>{response.improvement}</Improvement>
                  </SubjectAndImprovement>
                  <InfoSection>
                    <StarRating>{renderStars(response.rating)}</StarRating>
                    <DateText>{formatDate(response.timestamp)}</DateText>
                  </InfoSection>
                </CardHeader>
                <FeedbackText>{response.feedback}</FeedbackText>
              </ReviewCard>
            ))}
          </ReviewCardsGrid>
        )}
      </FormContainer>
      <AccessNote>
        These are real results from recent students. All personal information has been anonymized for privacy.
      </AccessNote>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 150%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--box-shadow-md);
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    border-radius: var(--radius-sm);
  }
`;

const Title = styled.h2`
  font-family: var(--font-display);
  color: var(--accent-primary);
  margin-bottom: 1.25rem;
  text-align: center;
  font-size: 1.5rem;
  
  @media (min-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
`;

const FormContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 200px;
`;

// Card grid layout
const ReviewCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ReviewCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: var(--box-shadow-sm);
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const SubjectAndImprovement = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Subject = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const Improvement = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--accent-primary);
`;

const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const FeedbackText = styled.p`
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? 'var(--accent-primary)' : 'var(--text-muted)'};
  font-size: 1rem;
  margin-right: 1px;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &:before {
    content: "";
    display: block;
    width: 32px;
    height: 32px;
    margin: 0 auto 12px;
    border-radius: 50%;
    border: 2px solid var(--accent-primary);
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AccessNote = styled.p`
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  max-width: 90%;
  line-height: 1.4;
`;