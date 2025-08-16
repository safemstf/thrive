// src\app\dashboard\thrive\assessments\rapid-reasoning\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Timer, ChevronLeft, ChevronRight, Send, Shield } from 'lucide-react';

// Import shared dashboard components
import {
  Container,  
  WelcomeTitle,
  WelcomeSubtitle,
  Section,
} from '@/components/dashboard/dashboardStyles';

// Import shared assessment components
import {
  AssessmentContainer,
  NavigationSidebar,
  TimerCard,
  TimerDisplay,
  TimerLabel,
  QuestionGrid,
  QuestionButton,
  QuestionContainer,
  QuestionHeader,
  QuestionNumber,
  QuestionTitle,
  AnswerOptions,
  AnswerOption,
  AnswerLabel,
  AnswerLetter,
  AnswerText,
  NavigationControls,
  NavButton,
  DifficultyBadge
} from '../styles';

// Import utils
import { 
  formatTime,
  getAssessmentTheme,
  calculateScore
} from '../utils';

import {   Assessment, 
  AssessmentQuestion, } from '@/types/thrive.types';

// Import theme
import { theme, Header,
  HeaderContent,   PageWrapper,
} from '@/styles/styled-components';


export default function RapidReasoningAssessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define assessment data locally
  const assessment: Assessment = {
    id: '6',
    title: 'Rapid Reasoning Assessment',
    description: 'Quick-fire logical puzzles and reasoning challenges designed to evaluate processing speed and accuracy.',
    skillType: 'critical-thinking',
    difficulty: 'beginner',
    duration: 15,
    participants: 8765,
    averageScore: 86,
    completionRate: 94,
    employerTrust: 79,
    questions: [
      {
        id: '1',
        question: "If all Bloops are Razzies and some Razzies are Loppies, which statement must be true?",
        options: [
          "All Bloops are Loppies",
          "Some Bloops are Loppies",
          "Some Loppies are Bloops",
          "None of the above"
        ],
        correctAnswer: 3
      },
      {
        id: '2',
        question: "What number continues the sequence: 2, 4, 8, 16, ___?",
        options: [
          "24",
          "28",
          "32",
          "36"
        ],
        correctAnswer: 2
      },
      {
        id: '3',
        question: "If A is taller than B, and B is taller than C, which statement must be true?",
        options: [
          "A is taller than C",
          "C is taller than A",
          "B is the tallest",
          "C is the shortest"
        ],
        correctAnswer: 0
      },
      {
        id: '4',
        question: "Which word does NOT belong: Apple, Banana, Carrot, Orange?",
        options: [
          "Apple",
          "Banana",
          "Carrot",
          "Orange"
        ],
        correctAnswer: 2
      },
      {
        id: '5',
        question: "If all cats are mammals and some mammals are pets, which is correct?",
        options: [
          "All cats are pets",
          "Some cats are pets",
          "No cats are pets",
          "All pets are cats"
        ],
        correctAnswer: 1
      }
    ]
  };

  // Get theme colors
  const themeColors = getAssessmentTheme(assessment.skillType);
  
  // Initialize state
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60);
  const [answers, setAnswers] = useState<number[]>(Array(assessment.questions?.length || 5).fill(-1));

  // Handle timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
        handleSubmit();
        return;
    }

    const timer = setInterval(() => {
        setTimeRemaining(prev => {
        if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
        }
        return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleNext = () => {
    if (currentQuestion < (assessment.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate score
    const score = calculateScore(assessment.questions || [], answers);
    
    // Create result object
    const result = {
      assessmentId: assessment.id,
      score,
      timeTaken: (assessment.duration * 60) - timeRemaining,
      answers,
      completedAt: new Date()
    };
    
    // Simulate submission delay
    setTimeout(() => {
      router.push(`/dashboard/thrive/assessments/results?score=${result.score}&assessmentId=${assessment.id}`);
    }, 1500);
  };

  // Calculate progress percentage
  const progressPercentage = Math.floor(
    (timeRemaining / (assessment.duration * 60)) * 100
  );

  // Get current question
  const currentQ = assessment.questions?.[currentQuestion];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderContent>
            <div>
              <WelcomeTitle>{assessment.title}</WelcomeTitle>
              <WelcomeSubtitle>
                {assessment.description}
              </WelcomeSubtitle>
            </div>
          </HeaderContent>
        </Header>

        <Section>
          <AssessmentContainer>
            {/* Navigation Sidebar */}
            <NavigationSidebar>
              <TimerCard 
                $color1={themeColors.primaryColor} 
                $color2={themeColors.secondaryColor}
              >
                <Timer size={20} />
                <TimerLabel>Time Remaining</TimerLabel>
                <TimerDisplay>{formatTime(timeRemaining)}</TimerDisplay>
                <div>{progressPercentage}% remaining</div>
              </TimerCard>

              <div>
                <h3>Questions</h3>
                <QuestionGrid>
                  {assessment.questions?.map((q, index) => (
                    <QuestionButton
                      key={q.id}
                      $status={
                        currentQuestion === index 
                          ? 'current' 
                          : answers[index] !== -1 
                            ? 'answered' 
                            : 'unanswered'
                      }
                      onClick={() => handleQuestionNavigation(index)}
                    >
                      {index + 1}
                    </QuestionButton>
                  ))}
                </QuestionGrid>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                <DifficultyBadge $difficulty={assessment.difficulty}>
                  <Shield size={14} />
                  {assessment.difficulty.toUpperCase()} LEVEL
                </DifficultyBadge>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.text.secondary
                }}>
                  <div>Employer Trust:</div>
                  <div style={{ fontWeight: theme.typography.weights.bold, color: themeColors.primaryColor }}>
                    {assessment.employerTrust}%
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  fontSize: theme.typography.sizes.sm,
                  color: theme.colors.text.secondary
                }}>
                  <div>Completion Rate:</div>
                  <div style={{ fontWeight: theme.typography.weights.bold, color: themeColors.primaryColor }}>
                    {assessment.completionRate}%
                  </div>
                </div>
              </div>

              <NavButton 
                $primary 
                onClick={handleSubmit}
                disabled={isSubmitting}
                $color1={themeColors.primaryColor}
                $color2={themeColors.secondaryColor}
                style={{ marginTop: theme.spacing.xl, width: '100%' }}
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </NavButton>
            </NavigationSidebar>

            {/* Main Question Area */}
            {currentQ && (
              <QuestionContainer>
                <QuestionHeader>
                  <div>
                    <QuestionNumber>Question {currentQuestion + 1} of {assessment.questions?.length}</QuestionNumber>
                    <QuestionTitle>{currentQ.question}</QuestionTitle>
                  </div>
                  <DifficultyBadge $difficulty={assessment.difficulty}>
                    <Zap size={14} />
                    Rapid Reasoning
                  </DifficultyBadge>
                </QuestionHeader>

                <AnswerOptions>
                  {currentQ.options.map((option, index) => (
                    <AnswerOption 
                      key={index}
                      $selected={answers[currentQuestion] === index}
                      $color={themeColors.accentColor}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <AnswerLabel>
                        <AnswerLetter $color={themeColors.accentColor}>
                          {String.fromCharCode(65 + index)}
                        </AnswerLetter>
                        <AnswerText>{option}</AnswerText>
                      </AnswerLabel>
                    </AnswerOption>
                  ))}
                </AnswerOptions>

                <NavigationControls>
                  <NavButton 
                    onClick={handlePrevious} 
                    disabled={currentQuestion === 0}
                    $color1={themeColors.accentColor}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </NavButton>
                  
                  {currentQuestion < (assessment.questions?.length || 0) - 1 ? (
                    <NavButton 
                      $primary 
                      onClick={handleNext}
                      $color1={themeColors.primaryColor}
                      $color2={themeColors.secondaryColor}
                    >
                      Next
                      <ChevronRight size={16} />
                    </NavButton>
                  ) : (
                    <NavButton 
                      $primary 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      $color1={themeColors.primaryColor}
                      $color2={themeColors.secondaryColor}
                    >
                      <Send size={16} />
                      {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </NavButton>
                  )}
                </NavigationControls>
              </QuestionContainer>
            )}
          </AssessmentContainer>
        </Section>
      </Container>
    </PageWrapper>
  );
}