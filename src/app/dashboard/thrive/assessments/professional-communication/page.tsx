// src/app/dashboard/thrive/assessments/professional-communication/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, Timer, ChevronLeft, ChevronRight, Send, Shield, Edit,
  Zap, Check, Award, BarChart, BookOpen, Lightbulb, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

// Reuse existing styled components - no duplication!
import {
  Container,
  Grid,
  FlexRow,
  FlexColumn,
  Card,
  BaseButton,
  Heading2,
  Heading3,
  BodyText,
  Badge,
  TextArea,
  responsive,
  TimerCard,
  QuestionButton,
  WritingTaskContainer,
  DifficultyBadge, HeroSection
} from '@/styles/styled-components';

// Import utils for logic
import { utils } from '@/utils';

// Import existing thrive components (assuming these exist)
import { 
  SectionTitle,
  FloatingCard,
  HeroBadge,
  HeroTitle,
  HeroSubtitle,
  HeroStats,
  StatItem,
  StatValue,
  StatLabel,
  LiveIndicator
} from '@/app/thrive/styles';

import { Assessment, AssessmentQuestion, DifficultyLevel } from "@/types/thrive.types";
import styled from 'styled-components';

// ===========================================
// MINIMAL ASSESSMENT-SPECIFIC COMPONENTS
// ===========================================

const AssessmentGrid = styled(Grid).attrs({ 
  $columns: 2, 
  $gap: 'var(--spacing-xl)',
  $responsive: true 
})`
  margin-top: var(--spacing-xl);
  
  ${responsive.below.md} {
    grid-template-columns: 1fr;
  }
`;

const NavigationSidebar = styled(Card).attrs({ $padding: 'lg' })`
  height: fit-content;
  position: sticky;
  top: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
`;

const QuestionGrid = styled(Grid).attrs({ 
  $columns: 5, 
  $gap: 'var(--spacing-sm)' 
})`
  margin-top: var(--spacing-lg);
`;

const QuestionCard = styled(Card).attrs({ $padding: 'lg', $hover: false })`
  box-shadow: var(--shadow-sm);
`;

const AnswerOption = styled(Card).attrs({ $padding: 'lg', $hover: true })<{ $selected: boolean }>`
  cursor: pointer;
  border: 1px solid ${props => 
    props.$selected ? 'var(--color-primary-500)' : 'var(--color-border-medium)'};
  background: ${props => 
    props.$selected 
      ? 'rgba(59, 130, 246, 0.05)' 
      : 'transparent'};
  transition: var(--transition-fast);
  
  &:hover {
    transform: translateX(5px);
  }
`;

const TimerDisplay = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-mono);
  margin: var(--spacing-sm) 0;
`;

const WritingPrompt = styled(Card).attrs({ $padding: 'md' })`
  margin-bottom: var(--spacing-lg);
  background: var(--color-background-secondary);
  border-radius: var(--radius-md);
`;

// ===========================================
// ASSESSMENT DATA & LOGIC
// ===========================================

interface ExtendedAssessmentQuestion extends AssessmentQuestion {
  writingTask?: boolean;
  writingPrompt?: string;
}

const ASSESSMENT_DATA: Assessment = {
  id: '2',
  title: 'Professional Communication Evaluation',
  description: 'Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.',
  skillType: 'linguistic',
  difficulty: 'intermediate',
  duration: 30,
  participants: 4321,
  averageScore: 82,
  completionRate: 89,
  employerTrust: 91,
  route: '/assessments/professional-communication'
};

const QUESTIONS: ExtendedAssessmentQuestion[] = [
  {
    id: '1',
    question: "Which of these sentences demonstrates the most effective business writing style?",
    options: [
      "We are in receipt of your email and will respond shortly.",
      "I got your email and I'll get back to you soon.",
      "Thank you for your message; we will reply within 24 hours.",
      "Your email has been received and is being processed."
    ],
    correctAnswer: 2
  },
  {
    id: '2',
    question: "Read the following email excerpt. What is the primary issue with its tone? \n\n'Per our conversation, I need those reports ASAP. This is the third time I'm asking.'",
    options: [
      "Too informal for professional communication",
      "Uses jargon that may not be understood",
      "Comes across as demanding and accusatory",
      "Lacks clarity about what is needed"
    ],
    correctAnswer: 2
  },
  {
    id: '3',
    question: "Which option best rephrases this sentence for clarity and conciseness? \n\n'It is imperative that we utilize our resources in a manner that is both efficient and effective.'",
    options: [
      "We must use our resources efficiently and effectively.",
      "It's important that we use resources efficiently and effectively.",
      "Utilizing resources efficiently and effectively is imperative.",
      "We need to be sure to use resources in efficient and effective ways."
    ],
    correctAnswer: 0
  },
  {
    id: '4',
    question: "In the following sentence, which word is redundant? \n\n'We should plan ahead for the upcoming future event.'",
    options: [
      "plan",
      "ahead", 
      "upcoming",
      "event"
    ],
    correctAnswer: 2
  },
  {
    id: '5',
    question: "Writing Task",
    options: [],
    correctAnswer: -1,
    writingTask: true,
    writingPrompt: "You've received a complaint from an important client about a delayed shipment. Draft a 150-200 word response that:\n\n1. Acknowledges their frustration\n2. Explains the reason for the delay (without making excuses)\n3. Outlines the steps being taken to resolve the issue\n4. Offers appropriate compensation\n5. Reassures them about future service"
  }
];

export default function ProfessionalCommunicationEvaluation() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(ASSESSMENT_DATA.duration * 60);
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [writingResponse, setWritingResponse] = useState('');

  // Use utils for timer logic
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
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
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = utils.performance.debounce(() => {
    setIsSubmitting(true);
    
    // Calculate score
    const mcScore = QUESTIONS.reduce((total, question, index) => {
      if (!question.writingTask && answers[index] === question.correctAnswer) {
        return total + 16;
      }
      return total;
    }, 0);
    
    const writingScore = writingResponse.trim().length > 50 ? 20 : 0;
    const totalScore = mcScore + writingScore;
    
    const result = {
      assessmentId: ASSESSMENT_DATA.id,
      score: totalScore,
      timeTaken: (ASSESSMENT_DATA.duration * 60) - timeRemaining,
      answers,
      writingResponse,
      completedAt: new Date()
    };
    
    console.log("Submitting assessment result:", result);
    
    setTimeout(() => {
      router.push(`/dashboard/thrive/assessments/results?score=${result.score}&assessmentId=${ASSESSMENT_DATA.id}`);
    }, 1500);
  }, 300);

  // Use utils for formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.floor((timeRemaining / (ASSESSMENT_DATA.duration * 60)) * 100);
  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Hero Section - Reuse existing components */}
      <HeroSection style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center' }}
          >
            <HeroBadge style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Zap size={16} style={{ marginRight: '0.5rem' }} className="animate-pulse" />
              PROFESSIONAL COMMUNICATION
            </HeroBadge>
            
            <HeroTitle style={{ marginBottom: '1.5rem' }}>
              Professional Communication Evaluation
            </HeroTitle>
            
            <HeroSubtitle style={{ maxWidth: '48rem', margin: '0 auto', fontSize: '1.25rem' }}>
              Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.
            </HeroSubtitle>
          </motion.div>

          <HeroStats style={{ marginTop: '3rem', maxWidth: '80rem', margin: '3rem auto 0' }}>
            <StatItem>
              <StatValue>82%</StatValue>
              <StatLabel>Average Score</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>89%</StatValue>
              <StatLabel>Completion Rate</StatLabel>
              <LiveIndicator />
            </StatItem>
            <StatItem>
              <StatValue>91%</StatValue>
              <StatLabel>Employer Trust</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>30 min</StatValue>
              <StatLabel>Duration</StatLabel>
            </StatItem>
          </HeroStats>
        </Container>
      </HeroSection>

      {/* Assessment Container */}
      <Container style={{ padding: '2rem 0' }}>
        <AssessmentGrid>
          {/* Navigation Sidebar */}
          <NavigationSidebar>
            <TimerCard $variant={progressPercentage < 20 ? 'danger' : progressPercentage < 50 ? 'warning' : 'primary'}>
              <Timer size={20} />
              <div style={{ 
                fontSize: 'var(--font-size-sm)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                Time Remaining
              </div>
              <TimerDisplay>{formatTime(timeRemaining)}</TimerDisplay>
              <div>{progressPercentage}% remaining</div>
            </TimerCard>

            <FlexColumn $gap="var(--spacing-lg)">
              <div>
                <Heading3>Questions</Heading3>
                <QuestionGrid>
                  {QUESTIONS.map((q, index) => (
                    <QuestionButton
                      key={q.id}
                      $status={
                        currentQuestion === index 
                          ? 'current' 
                          : (answers[index] !== -1 || (q.writingTask && writingResponse)) 
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

              <div>
                <Heading3>Assessment Info</Heading3>
                <FlexColumn $gap="var(--spacing-md)">
                  <FlexRow $justify="space-between">
                    <FlexRow $gap="var(--spacing-sm)">
                      <BookOpen size={14} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Skill Type:
                      </span>
                    </FlexRow>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Communication</span>
                  </FlexRow>
                  
                  <FlexRow $justify="space-between">
                    <FlexRow $gap="var(--spacing-sm)">
                      <Award size={14} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Difficulty:
                      </span>
                    </FlexRow>
                    <DifficultyBadge $difficulty={ASSESSMENT_DATA.difficulty}>
                      <Shield size={14} />
                      INTERMEDIATE
                    </DifficultyBadge>
                  </FlexRow>
                  
                  <FlexRow $justify="space-between">
                    <FlexRow $gap="var(--spacing-sm)">
                      <BarChart size={14} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Participants:
                      </span>
                    </FlexRow>
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {utils.data.formatNumber(4321)}
                    </span>
                  </FlexRow>
                </FlexColumn>
              </div>

              <BaseButton 
                $variant="primary"
                $fullWidth
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
              </BaseButton>
            </FlexColumn>
          </NavigationSidebar>

          {/* Main Question Area */}
          <QuestionCard>
            <FlexRow $justify="space-between" $align="flex-start" $responsive={false}>
              <FlexColumn $gap="var(--spacing-md)">
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Question {currentQuestion + 1} of {QUESTIONS.length}
                </div>
                <Heading2>{currentQ.question}</Heading2>
              </FlexColumn>
              <DifficultyBadge $difficulty={ASSESSMENT_DATA.difficulty}>
                <MessageSquare size={14} />
                Professional Communication
              </DifficultyBadge>
            </FlexRow>

            {currentQ.writingTask ? (
              <WritingTaskContainer>
                <FlexRow $gap="var(--spacing-md)" $align="center">
                  <Edit size={20} />
                  <Heading3 style={{ margin: 0 }}>Writing Task</Heading3>
                </FlexRow>
                
                <WritingPrompt>
                  {currentQ.writingPrompt?.split('\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </WritingPrompt>
                
                <TextArea
                  value={writingResponse}
                  onChange={(e) => setWritingResponse(e.target.value)}
                  placeholder="Type your response here (150-200 words)..."
                  style={{ minHeight: '200px' }}
                />
                
                <div style={{ 
                  marginTop: 'var(--spacing-sm)', 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-secondary)', 
                  textAlign: 'right' 
                }}>
                  Word count: {writingResponse.trim() ? writingResponse.trim().split(/\s+/).length : 0}
                </div>
              </WritingTaskContainer>
            ) : (
              <>
                <Card $padding="lg" style={{ 
                  margin: 'var(--spacing-xl) 0',
                  background: 'rgba(59, 130, 246, 0.02)',
                  borderLeft: '3px solid var(--color-primary-500)'
                }}>
                  {currentQ.question.includes('\n') ? (
                    currentQ.question.split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))
                  ) : currentQ.question}
                </Card>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <FlexColumn $gap="var(--spacing-md)">
                    {currentQ.options.map((option, index) => (
                      <motion.div 
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <AnswerOption 
                          $selected={answers[currentQuestion] === index}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <FlexRow $gap="var(--spacing-md)" $align="flex-start">
                            <Badge $variant="default" style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'var(--color-primary-500)',
                              color: 'white',
                              fontWeight: 'var(--font-weight-bold)',
                              flexShrink: 0
                            }}>
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div style={{ flex: 1 }}>{option}</div>
                          </FlexRow>
                        </AnswerOption>
                      </motion.div>
                    ))}
                  </FlexColumn>
                </motion.div>
              </>
            )}

            <FlexRow 
              $justify="space-between" 
              $responsive={false}
              style={{ 
                marginTop: 'var(--spacing-xl)', 
                paddingTop: 'var(--spacing-lg)', 
                borderTop: '1px solid var(--color-border-medium)' 
              }}
            >
              <BaseButton 
                $variant="secondary"
                onClick={handlePrevious} 
                disabled={currentQuestion === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </BaseButton>
              
              {currentQuestion < QUESTIONS.length - 1 ? (
                <BaseButton $variant="primary" onClick={handleNext}>
                  Next
                  <ChevronRight size={16} />
                </BaseButton>
              ) : (
                <BaseButton $variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                </BaseButton>
              )}
            </FlexRow>
          </QuestionCard>
        </AssessmentGrid>
      </Container>

      {/* Tips Section - Reuse existing components */}
      <Container style={{ padding: '4rem 0' }}>
        <SectionTitle style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Lightbulb size={32} style={{ marginRight: 'var(--spacing-md)' }} />
          Communication Assessment Tips
        </SectionTitle>
        
        <Grid $columns={3} $responsive>
          <FloatingCard style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-lg)'
            }}>
              <Edit size={24} style={{ color: '#2563eb' }} />
            </div>
            <Heading3 style={{ textAlign: 'center' }}>Clarity is Key</Heading3>
            <BodyText style={{ textAlign: 'center' }}>
              Focus on clear, concise communication. Avoid jargon and unnecessary complexity in your responses.
            </BodyText>
          </FloatingCard>
          
          <FloatingCard style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-lg)'
            }}>
              <Users size={24} style={{ color: '#16a34a' }} />
            </div>
            <Heading3 style={{ textAlign: 'center' }}>Audience Awareness</Heading3>
            <BodyText style={{ textAlign: 'center' }}>
              Tailor your communication style to the intended audience. Professional contexts require formal language.
            </BodyText>
          </FloatingCard>
          
          <FloatingCard style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-lg)'
            }}>
              <Check size={24} style={{ color: '#d97706' }} />
            </div>
            <Heading3 style={{ textAlign: 'center' }}>Proofread Carefully</Heading3>
            <BodyText style={{ textAlign: 'center' }}>
              Always review your writing for grammar, punctuation, and spelling errors before submitting.
            </BodyText>
          </FloatingCard>
        </Grid>
      </Container>
    </div>
  );
}