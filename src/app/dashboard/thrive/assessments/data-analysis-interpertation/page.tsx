// src\app\dashboard\thrive\assessments\data-analysis-interpertation\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart2, Timer, ChevronLeft, ChevronRight, Send, Shield } from 'lucide-react';

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

import { Assessment, 
  AssessmentQuestion, } from '@/types/thrive.types';

// Import theme
import { theme, PageWrapper,
    Header,
  HeaderContent, } from '@/styles/styled-components';

export default function DataAnalysisInterpretationAssessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define assessment data locally
  const assessment: Assessment = {
    id: '4',
    title: 'Data Analysis & Interpretation',
    description: 'Complex data scenarios requiring statistical analysis, pattern recognition, and evidence-based conclusions.',
    skillType: 'analytical',
    difficulty: 'intermediate',
    duration: 40,
    participants: 3456,
    averageScore: 78,
    completionRate: 76,
    employerTrust: 88,
    questions: [
      {
        id: '1',
        question: "A dataset shows that ice cream sales and shark attacks are positively correlated. What is the most likely explanation?",
        options: [
          "Ice cream consumption causes shark attacks",
          "Shark attacks cause people to eat more ice cream",
          "Both are influenced by a third variable (e.g., hot weather)",
          "The correlation is coincidental"
        ],
        correctAnswer: 2
      },
      {
        id: '2',
        question: "In a regression analysis, what does an R-squared value of 0.85 indicate?",
        options: [
          "85% of the variance in the dependent variable is explained by the model",
          "The model is 85% accurate",
          "There is a strong negative correlation",
          "The independent variables are not significant"
        ],
        correctAnswer: 0
      },
      {
        id: '3',
        question: "You have a dataset with missing values. Which method is NOT appropriate for handling missing data?",
        options: [
          "Deleting rows with missing values",
          "Replacing missing values with the mean",
          "Using machine learning algorithms to impute missing values",
          "Replacing missing values with a constant -1"
        ],
        correctAnswer: 3
      },
      {
        id: '4',
        question: "When interpreting a box plot, what does the length of the box represent?",
        options: [
          "The range of the data",
          "The interquartile range (IQR)",
          "The median value",
          "The standard deviation"
        ],
        correctAnswer: 1
      },
      {
        id: '5',
        question: "In hypothesis testing, what does a p-value of 0.03 indicate?",
        options: [
          "There is a 3% probability that the null hypothesis is true",
          "There is a 97% probability that the alternative hypothesis is true",
          "If the null hypothesis is true, there is a 3% probability of obtaining the observed result or more extreme",
          "The confidence interval is 97%"
        ],
        correctAnswer: 2
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
                  <div>Average Score:</div>
                  <div style={{ fontWeight: theme.typography.weights.bold, color: themeColors.primaryColor }}>
                    {assessment.averageScore}%
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
                    <BarChart2 size={14} />
                    Data Analysis
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