// src\app\dashboard\thrive\assessments\professional-communication\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Shield, 
  Edit,
  Zap,
  Check,
  Award,
  BarChart,
  BookOpen,
  Lightbulb,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';
import { 
  HeroSection,
  GlassSection,
  SectionTitle,
  PrimaryButton,
  SecondaryButton,
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
import styled from 'styled-components';
import { themeUtils } from '@/styles/theme';
import { Assessment, AssessmentQuestion, DifficultyLevel } from "@/types/thrive.types";

// Define extended question type locally
interface ExtendedAssessmentQuestion extends AssessmentQuestion {
  writingTask?: boolean;
  writingPrompt?: string;
}

// Assessment container
const AssessmentContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Navigation sidebar
const NavigationSidebar = styled(FloatingCard)`
  padding: ${theme.spacing.lg};
  height: fit-content;
  position: sticky;
  top: ${theme.spacing.xl};
  background: ${themeUtils.alpha(theme.colors.background.secondary, 0.9)};
`;

const TimerCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.primary[600]});
  color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg};
`;

const TimerDisplay = styled.div`
  font-size: ${theme.typography.sizes['3xl']};
  font-weight: ${theme.typography.weights.bold};
  font-family: ${theme.typography.fonts.secondary};
  margin: ${theme.spacing.sm} 0;
`;

const TimerLabel = styled.div`
  font-size: ${theme.typography.sizes.sm};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
`;

const QuestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

const QuestionButton = styled(motion.button).attrs({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } })<{ $status: 'unanswered' | 'answered' | 'current' }>`
  aspect-ratio: 1;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.weights.medium};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  ${props => {
    if (props.$status === 'current') {
      return `
        background: ${theme.colors.primary[400]};
        color: white;
        transform: scale(1.05);
        box-shadow: ${theme.shadows.md};
      `;
    } else if (props.$status === 'answered') {
      return `
        background: ${themeUtils.alpha(theme.colors.primary[400], 0.2)};
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.primary[400]};
      `;
    }
    return `
      background: ${theme.colors.background.tertiary};
      color: ${theme.colors.text.secondary};
      border: 1px solid ${theme.colors.border.medium};
    `;
  }}
`;

// Main content area
const QuestionContainer = styled(GlassSection)`
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

const QuestionNumber = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${theme.typography.letterSpacing.uppercase};
`;

const QuestionTitle = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  margin: ${theme.spacing.md} 0;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

const QuestionContent = styled.div`
  margin-bottom: ${theme.spacing.xl};
  line-height: ${theme.typography.lineHeights.relaxed};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.3)};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  border-left: 3px solid ${theme.colors.primary[400]};
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`;

const AnswerOption = styled(motion.div).attrs({ whileHover: { x: 5 } })<{ $selected: boolean }>`
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${props => 
    props.$selected ? theme.colors.primary[400] : theme.colors.border.medium};
  background: ${props => 
    props.$selected 
      ? themeUtils.alpha(theme.colors.primary[400], 0.05) 
      : 'transparent'};
  cursor: pointer;
  transition: ${theme.transitions.normal};
`;

const AnswerLabel = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
`;

const AnswerLetter = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${theme.colors.primary[400]};
  color: white;
  font-weight: ${theme.typography.weights.bold};
`;

const AnswerText = styled.div`
  flex: 1;
`;

const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.medium};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const DifficultyBadge = styled.div<{ $difficulty: DifficultyLevel }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.weights.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: ${props => {
    switch (props.$difficulty) {
      case 'expert': return themeUtils.alpha(theme.colors.primary[500], 0.1);
      case 'advanced': return themeUtils.alpha(theme.colors.primary[600], 0.1);
      case 'intermediate': return themeUtils.alpha(theme.colors.primary[400], 0.1);
      default: return themeUtils.alpha(theme.colors.primary[300], 0.1);
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'expert': return theme.colors.primary[500];
      case 'advanced': return theme.colors.primary[600];
      case 'intermediate': return theme.colors.primary[400];
      default: return theme.colors.primary[300];
    }
  }};
`;

const WritingTaskContainer = styled.div`
  margin: ${theme.spacing.xl} 0;
  padding: ${theme.spacing.lg};
  background: ${themeUtils.alpha(theme.colors.background.tertiary, 0.3)};
  border-radius: ${theme.borderRadius.md};
  border: 1px dashed ${theme.colors.primary[400]};
`;

const WritingPrompt = styled.div`
  font-size: ${theme.typography.sizes.base};
  margin-bottom: ${theme.spacing.lg};
  line-height: ${theme.typography.lineHeights.relaxed};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.md};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.medium};
  background: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fonts.primary};
  font-size: ${theme.typography.sizes.base};
  resize: vertical;
  transition: ${theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[400]};
    box-shadow: 0 0 0 3px ${themeUtils.alpha(theme.colors.primary[400], 0.2)};
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

export default function ProfessionalCommunicationEvaluation() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define assessment data locally with all required properties
  const assessment: Assessment = {
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
    route: '/assessments/professional-communication' // Added missing route property
  };

  // Mock questions for the assessment with writing task support
  const questions: ExtendedAssessmentQuestion[] = [ // Using extended type
    {
      id: '1', // Changed to string
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
      id: '2', // Changed to string
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
      id: '3', // Changed to string
      question: "Which option best rephrases this sentence for clarity and conciseness? \n\n'It is imperative that we utilize our resources in a manner that is both efficient and effective.'",
      options: [
        "We must use our resources efficiently and effectively.",
        "It's important that we use resources both efficiently and effectively.",
        "Utilizing resources efficiently and effectively is imperative.",
        "We need to be sure to use resources in efficient and effective ways."
      ],
      correctAnswer: 0
    },
    {
      id: '4', // Changed to string
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
      id: '5', // Changed to string
      question: "Writing Task",
      options: [],
      correctAnswer: -1,
      writingTask: true, // Added writing task property
      writingPrompt: "You've received a complaint from an important client about a delayed shipment. Draft a 150-200 word response that:\n\n1. Acknowledges their frustration\n2. Explains the reason for the delay (without making excuses)\n3. Outlines the steps being taken to resolve the issue\n4. Offers appropriate compensation\n5. Reassures them about future service" // Added writing prompt
    }
  ];

  // Initialize state based on local data
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [writingResponse, setWritingResponse] = useState('');

  // Handle timer countdown
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
    if (currentQuestion < questions.length - 1) {
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
    
    // Calculate score for multiple choice questions
    const mcScore = questions.reduce((total, question, index) => {
      if (!question.writingTask && answers[index] === question.correctAnswer) {
        return total + 16; // 16 points per MC question (80 points total)
      }
      return total;
    }, 0);
    
    // Writing task gets 20 points if response exists
    const writingScore = writingResponse.trim().length > 50 ? 20 : 0;
    
    const totalScore = mcScore + writingScore;
    
    // Create result object
    const result = {
      assessmentId: assessment.id,
      score: totalScore,
      timeTaken: (assessment.duration * 60) - timeRemaining,
      answers,
      writingResponse,
      completedAt: new Date()
    };
    
    // In a real app, this would send data to the server
    console.log("Submitting assessment result:", result);
    
    // Simulate submission delay
    setTimeout(() => {
      router.push(`/dashboard/thrive/assessments/results?score=${result.score}&assessmentId=${assessment.id}`);
    }, 1500);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = Math.floor(
    (timeRemaining / (assessment.duration * 60)) * 100
  );

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <HeroSection className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <HeroBadge className="inline-flex items-center mb-6">
              <Zap size={16} className="mr-2 animate-pulse" />
              PROFESSIONAL COMMUNICATION
            </HeroBadge>
            
            <HeroTitle className="mb-6">
              Professional Communication Evaluation
            </HeroTitle>
            
            <HeroSubtitle className="max-w-3xl mx-auto text-xl text-gray-700">
              Comprehensive assessment of written communication, linguistic precision, and contextual adaptation across business scenarios.
            </HeroSubtitle>
          </motion.div>

          <HeroStats className="mt-12 max-w-5xl mx-auto">
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
        </div>
      </HeroSection>

      {/* Assessment Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AssessmentContainer>
          {/* Navigation Sidebar */}
          <NavigationSidebar>
            <TimerCard>
              <Timer size={20} />
              <TimerLabel>Time Remaining</TimerLabel>
              <TimerDisplay>{formatTime(timeRemaining)}</TimerDisplay>
              <div>{progressPercentage}% remaining</div>
            </TimerCard>

            <div>
              <h3 className="text-lg font-semibold mb-4">Questions</h3>
              <QuestionGrid>
                {questions.map((q, index) => (
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

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Assessment Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen size={14} />
                    <span>Skill Type:</span>
                  </div>
                  <span className="font-medium">Communication</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award size={14} />
                    <span>Difficulty:</span>
                  </div>
                  <DifficultyBadge $difficulty={assessment.difficulty}>
                    <Shield size={14} />
                    INTERMEDIATE
                  </DifficultyBadge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BarChart size={14} />
                    <span>Participants:</span>
                  </div>
                  <span className="font-medium">4,321</span>
                </div>
              </div>
            </div>

            <PrimaryButton 
              className="mt-8 w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send size={16} className="mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
            </PrimaryButton>
          </NavigationSidebar>

          {/* Main Question Area */}
          <QuestionContainer>
            <QuestionHeader>
              <div>
                <QuestionNumber>Question {currentQuestion + 1} of {questions.length}</QuestionNumber>
                <QuestionTitle>{questions[currentQuestion].question}</QuestionTitle>
              </div>
              <DifficultyBadge $difficulty={assessment.difficulty}>
                <MessageSquare size={14} />
                Professional Communication
              </DifficultyBadge>
            </QuestionHeader>

            {questions[currentQuestion].writingTask ? (
              <WritingTaskContainer>
                <div className="flex items-center gap-3 mb-4">
                  <Edit size={20} />
                  <h3 className="text-lg font-semibold">Writing Task</h3>
                </div>
                
                <WritingPrompt>
                  {questions[currentQuestion].writingPrompt?.split('\n').map((line: string, i: number) => (
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
                />
                
                <div className="mt-3 text-sm text-gray-600 text-right">
                  Word count: {writingResponse.trim() ? writingResponse.trim().split(/\s+/).length : 0}
                </div>
              </WritingTaskContainer>
            ) : (
              <>
                <QuestionContent>
                  {questions[currentQuestion].question.includes('\n') ? (
                    questions[currentQuestion].question.split('\n').map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))
                  ) : questions[currentQuestion].question}
                </QuestionContent>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnswerOptions>
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <AnswerOption 
                          $selected={answers[currentQuestion] === index}
                          onClick={() => handleAnswerSelect(index)}
                        >
                          <AnswerLabel>
                            <AnswerLetter>{String.fromCharCode(65 + index)}</AnswerLetter>
                            <AnswerText>{option}</AnswerText>
                          </AnswerLabel>
                        </AnswerOption>
                      </motion.div>
                    ))}
                  </AnswerOptions>
                </motion.div>
              </>
            )}

            <NavigationControls>
              <SecondaryButton 
                onClick={handlePrevious} 
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </SecondaryButton>
              
              {currentQuestion < questions.length - 1 ? (
                <PrimaryButton onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight size={16} />
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
                </PrimaryButton>
              )}
            </NavigationControls>
          </QuestionContainer>
        </AssessmentContainer>
      </div>

      {/* Tips Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle className="text-center mb-12">
          <Lightbulb size={32} className="mr-3" />
          Communication Assessment Tips
        </SectionTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FloatingCard className="p-6">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Edit size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Clarity is Key</h3>
            <p className="text-gray-600">
              Focus on clear, concise communication. Avoid jargon and unnecessary complexity in your responses.
            </p>
          </FloatingCard>
          
          <FloatingCard className="p-6">
            <div className="bg-gradient-to-br from-green-100 to-teal-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Audience Awareness</h3>
            <p className="text-gray-600">
              Tailor your communication style to the intended audience. Professional contexts require formal language.
            </p>
          </FloatingCard>
          
          <FloatingCard className="p-6">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Proofread Carefully</h3>
            <p className="text-gray-600">
              Always review your writing for grammar, punctuation, and spelling errors before submitting.
            </p>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}