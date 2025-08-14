// src\app\dashboard\thrive\assessments\advanced-critical-thinking\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Timer, ChevronLeft, ChevronRight, Send, Shield } from 'lucide-react';

// Import shared dashboard components
import {
  PageWrapper,
  Container,
  Header,
  HeaderContent,
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
  AssessmentQuestion,  SkillType, 
  DifficultyLevel  } from '@/types/thrive.types';
// Import theme
import { theme } from '@/styles/theme';

export default function AdvancedCriticalThinkingAssessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define assessment data locally
  const assessment: Assessment = {
    id: '1',
    title: 'Advanced Critical Thinking Assessment',
    description: 'Multi-dimensional evaluation of logical reasoning, problem decomposition, and analytical decision-making under time constraints.',
    skillType: 'critical-thinking',
    difficulty: 'expert',
    duration: 45,
    participants: 2847,
    averageScore: 74,
    completionRate: 68,
    employerTrust: 94,
    questions: [
      {
        id: '1',
        question: "A company is deciding between two marketing strategies. Strategy A has a 70% chance of gaining $100,000 and a 30% chance of losing $50,000. Strategy B has a 100% chance of gaining $40,000. Which strategy has the higher expected value, and by how much?",
        options: [
          "Strategy A by $15,000",
          "Strategy A by $25,000",
          "Strategy B by $10,000",
          "Strategy B by $15,000"
        ],
        correctAnswer: 0
      },
      {
        id: '2',
        question: "If all Bloops are Razzies and some Razzies are Loppies, which of the following must be true?",
        options: [
          "Some Bloops are Loppies",
          "All Razzies are Bloops",
          "Some Loppies are Bloops",
          "None of the above"
        ],
        correctAnswer: 3
      },
      {
        id: '3',
        question: "A hospital administrator is reviewing two proposals to reduce patient wait times. Proposal 1 would reduce wait times by 15% for all patients. Proposal 2 would reduce wait times by 30% for the 50% of patients who wait the longest. Which proposal would provide the greater overall reduction in total waiting time?",
        options: [
          "Proposal 1",
          "Proposal 2",
          "Both provide equal reduction",
          "Cannot be determined from the information"
        ],
        correctAnswer: 3
      },
      {
        id: '4',
        question: "In a study of 500 companies, researchers found that companies with more diverse management teams had 25% higher profits. A commentator concludes that diversity causes higher profits. What is the most significant flaw in this reasoning?",
        options: [
          "Correlation does not imply causation",
          "The sample size is too small",
          "Profit is not an accurate measure of success",
          "The study didn't account for company size"
        ],
        correctAnswer: 0
      },
      {
        id: '5',
        question: "A city council must choose between building a new hospital wing or a community center. The hospital wing would save an estimated 15 lives per year. The community center would prevent an estimated 10 deaths from drug overdoses and reduce crime. How should the council approach this decision?",
        options: [
          "Choose the hospital wing as it saves more lives",
          "Choose the community center as it has broader benefits",
          "Conduct a cost-benefit analysis considering multiple factors",
          "Defer the decision until more data is available"
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
                    <Brain size={14} />
                    Critical Thinking
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