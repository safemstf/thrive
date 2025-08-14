// src\app\dashboard\thrive\assessments\innovative-problem-solving\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Timer, ChevronLeft, ChevronRight, Send, Shield } from 'lucide-react';
import styled from 'styled-components';
import { theme, themeUtils } from '@/styles/theme';

const AssessmentContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const Sidebar = styled.nav`
  width: 240px;
  background: ${theme.glass.blur};
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-shadow: ${theme.shadows.lg};
`;

const SidebarTitle = styled.h2`
  ${theme.typography.fonts.secondary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.primary[600]};
`;

const MainContent = styled.div`
  flex: 1;
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const QuestionCard = styled.div`
  background: ${theme.glass.blurSubtle};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  ${theme.typography.fonts.body};
`;

const TimerCard = styled.div`
  background: ${theme.colors.accent.amber};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.primary[600]};
  font-weight: bold;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
`;

const NavButton = styled.button<{ $primary?: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.sm};
  font-weight: bold;
  cursor: pointer;
  border: none;
  ${theme.transitions.normal};
  ${({ $primary }) =>
    $primary
      ? `
    background: ${theme.colors.primary[600]};
    color: white;
    &:hover {
      background: ${theme.colors.primary[700]};
    }
  `
      : `
    background: ${theme.colors.primary[100]};
    color: ${theme.colors.text};
    &:hover {
      background: ${theme.colors.primary[200]};
    }
  `}
`;

export default function InnovationAssessment() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const questions = [
    { id: 1, question: 'Describe a time you solved a problem in an innovative way.' },
    { id: 2, question: 'How would you encourage creative thinking in a team?' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const goNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      router.push('/dashboard/thrive'); // adjust destination if needed
    }
  };

  const goPrev = () => {
    if (questionIndex > 0) setQuestionIndex((prev) => prev - 1);
  };

  return (
    <AssessmentContainer>
      <Sidebar>
        <SidebarTitle>
          <Lightbulb size={20} /> Innovation
        </SidebarTitle>
        <TimerCard>
          <Timer size={18} /> {timeLeft}s
        </TimerCard>
      </Sidebar>

      <MainContent>
        <QuestionCard>
          <h3>{`Question ${questionIndex + 1}`}</h3>
          <p>{questions[questionIndex].question}</p>
        </QuestionCard>

        <ButtonRow>
          <NavButton onClick={goPrev}>
            <ChevronLeft size={16} /> Previous
          </NavButton>
          <NavButton $primary onClick={goNext}>
            {questionIndex === questions.length - 1 ? (
              <>
                Submit <Send size={16} />
              </>
            ) : (
              <>
                Next <ChevronRight size={16} />
              </>
            )}
          </NavButton>
        </ButtonRow>
      </MainContent>
    </AssessmentContainer>
  );
}