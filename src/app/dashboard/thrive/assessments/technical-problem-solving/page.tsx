// src\app\dashboard\thrive\assessments\technical-problem-solving\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code, Timer, ChevronLeft, ChevronRight, Send, Shield, Cpu, Zap } from 'lucide-react';

// Import shared styles
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
  CodeSnippetContainer,
  CodeHeader,
  CodeLanguage,
  PerformanceContainer,
  PerformanceHeader,
  PerformanceContent,
  PerfMetric,
  PerfLabel,
  PerfValue,
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
import { theme } from '@/styles/theme';
import { frameSteps } from 'framer-motion';

export default function TechnicalProblemSolvingChallenge() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define assessment data locally
  const assessment: Assessment = {
    id: '3',
    title: 'Technical Problem Solving Challenge',
    description: 'Real-world technical scenarios requiring systematic debugging, optimization, and implementation of scalable solutions.',
    skillType: 'technical',
    difficulty: 'expert',
    duration: 60,
    participants: 1893,
    averageScore: 69,
    completionRate: 54,
    employerTrust: 96,
    questions: [
      // Add your questions array here with actual content
      // Example:
      {
        id: 'q1',
        question: 'What is the time complexity of the following algorithm?',
        options: [
          'O(1)',
          'O(n)',
          'O(n log n)',
          'O(n²)'
        ],
        correctAnswer: 1,
        codeSnippet: `function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`,
        performanceMetrics: [
          { label: 'Input Size', value: '10,000 elements' },
          { label: 'Execution Time', value: '2.4ms' }
        ]
      },
      // Add more questions...
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
              <Code size={14} />
              Technical Problem Solving
            </DifficultyBadge>
          </QuestionHeader>

          {currentQ.codeSnippet && (
            <CodeSnippetContainer>
              <CodeHeader>
                <CodeLanguage>
                  <Cpu size={16} />
                  Code Analysis
                </CodeLanguage>
                <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.text.secondary }}>
                  Identify issues and propose solutions
                </div>
              </CodeHeader>
              <pre>{currentQ.codeSnippet}</pre>
            </CodeSnippetContainer>
          )}

          {currentQ.performanceMetrics && (
            <PerformanceContainer>
              <PerformanceHeader>
                <Zap size={18} />
                <h3>Performance Metrics</h3>
              </PerformanceHeader>
              <PerformanceContent>
                {currentQ.performanceMetrics.map((metric, index) => (
                  <PerfMetric key={index}>
                    <PerfLabel>{metric.label}</PerfLabel>
                    <PerfValue>{metric.value}</PerfValue>
                  </PerfMetric>
                ))}
              </PerformanceContent>
            </PerformanceContainer>
          )}

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
  );
}