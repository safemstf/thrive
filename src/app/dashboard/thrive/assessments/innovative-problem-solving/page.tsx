// src/app/dashboard/thrive/assessments/innovative-problem-solving/page.tsx - Modernized
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Timer, ChevronLeft, ChevronRight, Send } from 'lucide-react';

// Use your modern assessment styles instead of recreating components
import {
  AssessmentContainer,
  NavigationSidebar,
  AssessmentTimerCard,
  TimerDisplay,
  TimerLabel,
  QuestionContainer,
  QuestionHeader,
  QuestionNumber,
  QuestionTitle,
  QuestionContent,
  NavigationControls,
  NavButton,
  WritingTaskContainer,
  WritingTextArea,
  WordCount,
  FlexRow,
  FlexColumn,
  Heading3,
  BodyText
} from '../styles';

// Additional styles specific to this assessment
import styled from 'styled-components';

const InnovationSidebar = styled(NavigationSidebar)`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
`;

const SidebarTitle = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-sm)', 
  $align: 'center' 
})`
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-lg);
`;

const MainContent = styled(FlexColumn).attrs({ $gap: 'var(--spacing-lg)' })`
  flex: 1;
  padding: var(--spacing-xl);
  min-height: 100vh;
`;

const InnovationQuestionCard = styled(QuestionContainer)`
  background: var(--glass-background);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
`;

const ResponseContainer = styled(WritingTaskContainer)`
  margin-top: var(--spacing-lg);
`;

const ResponseTextArea = styled(WritingTextArea)`
  min-height: 300px;
  font-size: var(--font-size-base);
  line-height: 1.6;
`;

const InstructionsCard = styled.div`
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
`;

const InstructionsList = styled.ul`
  margin: var(--spacing-md) 0 0 var(--spacing-lg);
  color: var(--color-text-secondary);
  
  li {
    margin-bottom: var(--spacing-xs);
    line-height: 1.5;
  }
`;

interface Question {
  id: number;
  question: string;
  instructions?: string;
  minWords?: number;
}

export default function InnovationAssessment() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for innovation assessment
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');

  const questions: Question[] = [
    { 
      id: 1, 
      question: 'Describe a time when you solved a complex problem using an innovative approach.',
      instructions: 'Think about a specific situation where traditional solutions weren\'t sufficient. Explain your thought process, the innovative solution you developed, and the outcomes.',
      minWords: 150
    },
    { 
      id: 2, 
      question: 'How would you foster a culture of innovation and creative thinking in a team environment?',
      instructions: 'Consider practical strategies, tools, and leadership approaches that encourage creative problem-solving and breakthrough thinking.',
      minWords: 200
    },
    {
      id: 3,
      question: 'Imagine you\'re tasked with improving a process that has remained unchanged for years. Describe your approach.',
      instructions: 'Walk through your methodology for identifying improvement opportunities, challenging assumptions, and implementing innovative changes.',
      minWords: 175
    }
  ];

  // Initialize responses array
  useEffect(() => {
    if (responses.length === 0) {
      setResponses(new Array(questions.length).fill(''));
    }
  }, [questions.length, responses.length]);

  // Load current response when question changes
  useEffect(() => {
    setCurrentResponse(responses[questionIndex] || '');
  }, [questionIndex, responses]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerVariant = () => {
    if (timeLeft < 300) return 'danger'; // Last 5 minutes
    if (timeLeft < 900) return 'warning'; // Last 15 minutes
    return 'primary';
  };

  const updateResponse = (value: string) => {
    setCurrentResponse(value);
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const goNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Save responses (you'll want to implement your actual submission logic)
    console.log('Assessment responses:', responses);
    
    // Navigate to results or dashboard
    router.push('/dashboard/thrive/assessments/results?type=innovation');
  };

  const currentQuestion = questions[questionIndex];
  const wordCount = getWordCount(currentResponse);
  const meetsMinimum = !currentQuestion.minWords || wordCount >= currentQuestion.minWords;

  return (
    <AssessmentContainer>
      <InnovationSidebar>
        <SidebarTitle>
          <Lightbulb size={20} />
          Innovation Assessment
        </SidebarTitle>
        
        <AssessmentTimerCard $variant={getTimerVariant()}>
          <TimerLabel>Time Remaining</TimerLabel>
          <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
        </AssessmentTimerCard>

        <InstructionsCard>
          <Heading3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: 'var(--font-size-sm)' }}>
            Assessment Guidelines
          </Heading3>
          <InstructionsList>
            <li>Answer all questions thoughtfully</li>
            <li>Use specific examples from your experience</li>
            <li>Focus on your problem-solving process</li>
            <li>Explain the impact of your solutions</li>
          </InstructionsList>
        </InstructionsCard>
      </InnovationSidebar>

      <MainContent>
        <InnovationQuestionCard>
          <QuestionHeader>
            <QuestionNumber>
              Question {questionIndex + 1} of {questions.length}
            </QuestionNumber>
          </QuestionHeader>

          <QuestionTitle>{currentQuestion.question}</QuestionTitle>
          
          {currentQuestion.instructions && (
            <QuestionContent>
              <strong>Instructions:</strong> {currentQuestion.instructions}
            </QuestionContent>
          )}

          <ResponseContainer>
            <ResponseTextArea
              value={currentResponse}
              onChange={(e) => updateResponse(e.target.value)}
              placeholder="Share your detailed response here. Be specific about your experience, approach, and outcomes..."
            />
            <FlexRow $justify="space-between" $align="center">
              <WordCount>
                {wordCount} words
                {currentQuestion.minWords && (
                  <span style={{ 
                    color: meetsMinimum ? '#10b981' : '#f59e0b',
                    marginLeft: 'var(--spacing-xs)'
                  }}>
                    (min. {currentQuestion.minWords})
                  </span>
                )}
              </WordCount>
              {!meetsMinimum && currentQuestion.minWords && (
                <BodyText style={{ 
                  color: '#f59e0b', 
                  fontSize: 'var(--font-size-sm)',
                  margin: 0 
                }}>
                  {currentQuestion.minWords - wordCount} more words needed
                </BodyText>
              )}
            </FlexRow>
          </ResponseContainer>
        </InnovationQuestionCard>

        <NavigationControls>
          <NavButton 
            onClick={goPrev}
            disabled={questionIndex === 0}
            $variant="secondary"
          >
            <ChevronLeft size={16} />
            Previous
          </NavButton>

          <NavButton 
            onClick={goNext}
            $primary
            $color1="var(--color-primary-500)"
            $color2="var(--color-primary-600)"
            disabled={!meetsMinimum}
          >
            {questionIndex === questions.length - 1 ? (
              <>
                Submit Assessment <Send size={16} />
              </>
            ) : (
              <>
                Next Question <ChevronRight size={16} />
              </>
            )}
          </NavButton>

        </NavigationControls>
      </MainContent>
    </AssessmentContainer>
  );
}