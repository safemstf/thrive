// src/app/dashboard/thrive/assessments/assessmentShell.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Timer, ChevronLeft, ChevronRight, Send, Shield, 
  CheckCircle, BookOpen, Award, BarChart,
  Lightbulb, MessageSquare, Code, Calculator, Brain, Zap
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AssessmentQuestion, Assessment } from '@/types/thrive.types';

// ============================================================================
// TYPES
// ============================================================================

interface Answer {
  questionId: string;
  type: 'multiple-choice' | 'writing' | 'code';
  value: number | string;
  timestamp: Date;
}

interface AssessmentResults {
  assessmentId: string;
  score: number;
  percentage: number;
  timeTaken: number;
  answers: Map<string, Answer>;
  completedAt: Date;
  metadata?: Record<string, any>;
}

interface QuestionRendererProps {
  question: AssessmentQuestion;
  currentAnswer: Answer | undefined;
  onAnswerChange: (answer: Answer) => void;
  isDisabled: boolean;
}

interface AssessmentShellProps {
  assessment: Assessment;
  questions: AssessmentQuestion[];
  onSubmit: (results: AssessmentResults) => Promise<void>;
  customQuestionRenderer?: React.ComponentType<QuestionRendererProps>;
  heroContent?: React.ReactNode;
  tipsContent?: React.ReactNode;
  showTips?: boolean;
  allowReview?: boolean;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const questionVariants = {
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.4, ease: 'easeInOut' } 
  }
};


// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getSkillIcon = (skillType: string, size = 20) => {
  const iconProps = { size };
  switch (skillType) {
    case 'critical-thinking': return <Brain {...iconProps} />;
    case 'linguistic': return <MessageSquare {...iconProps} />;
    case 'technical': return <Code {...iconProps} />;
    case 'analytical': return <Calculator {...iconProps} />;
    case 'creative': return <Lightbulb {...iconProps} />;
    default: return <Zap {...iconProps} />;
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
    case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'expert': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getAssessmentTheme = (skillType: string) => {
  switch (skillType) {
    case 'critical-thinking':
      return {
        primaryGradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-50 to-slate-100',
        heroGradient: 'from-gray-100 to-slate-200'
      };
    case 'linguistic':
      return {
        primaryGradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-100',
        heroGradient: 'from-green-100 to-emerald-200'
      };
    case 'technical':
      return {
        primaryGradient: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-50 to-indigo-100',
        heroGradient: 'from-blue-100 to-indigo-200'
      };
    case 'analytical':
      return {
        primaryGradient: 'from-purple-500 to-purple-600',
        bgGradient: 'from-purple-50 to-violet-100',
        heroGradient: 'from-purple-100 to-violet-200'
      };
    case 'creative':
      return {
        primaryGradient: 'from-orange-500 to-pink-600',
        bgGradient: 'from-orange-50 to-pink-100',
        heroGradient: 'from-orange-100 to-pink-200'
      };
    default:
      return {
        primaryGradient: 'from-blue-500 to-blue-600',
        bgGradient: 'from-blue-50 to-indigo-100',
        heroGradient: 'from-blue-100 to-indigo-200'
      };
  }
};

const getSkillDisplayName = (skillType: string): string => {
  switch (skillType) {
    case 'linguistic': return 'Professional Communication';
    case 'creative': return 'Creative Problem Solving';
    case 'technical': return 'Technical Problem Solving';
    case 'analytical': return 'Data Analysis';
    case 'critical-thinking': return 'Critical Thinking';
    default: return 'Assessment';
  }
};

// ============================================================================
// DEFAULT COMPONENTS
// ============================================================================

const DefaultHeroContent: React.FC<{ assessment: Assessment; themeColors: any }> = ({ 
  assessment, 
  themeColors 
}) => (
  <div className={`bg-gradient-to-br ${themeColors.heroGradient} pt-16 pb-16`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-800 mb-6 border border-white/30">
          {getSkillIcon(assessment.skillType, 16)}
          <span className="ml-2 uppercase tracking-wide">{getSkillDisplayName(assessment.skillType)}</span>
          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {assessment.title}
        </h1>
        
        <p className="max-w-3xl mx-auto text-xl text-gray-700 mb-8 leading-relaxed">
          {assessment.description}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="text-3xl font-bold text-gray-900">{assessment.averageScore}%</div>
            <div className="text-sm text-gray-700 mt-1">Average Score</div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="text-3xl font-bold text-gray-900">{assessment.completionRate}%</div>
            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              Completion Rate
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="text-3xl font-bold text-gray-900">{assessment.employerTrust}%</div>
            <div className="text-sm text-gray-700 mt-1">Employer Trust</div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="text-3xl font-bold text-gray-900">{assessment.duration} min</div>
            <div className="text-sm text-gray-700 mt-1">Duration</div>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

const DefaultQuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  isDisabled
}) => {
  const handleAnswerSelect = (optionIndex: number) => {
    if (isDisabled) return;
    
    onAnswerChange({
      questionId: question.id,
      type: 'multiple-choice',
      value: optionIndex,
      timestamp: new Date()
    });
  };

  return (
    <div className="space-y-6">
      {/* Question Content */}
      <div className="prose max-w-none">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
          {question.question.split('\n').map((line, i) => {
            // Handle quoted text differently
            if (line.startsWith("'") && line.endsWith("'")) {
              return (
                <div key={i} className="bg-white p-4 rounded-lg my-3 italic border border-gray-200 shadow-sm">
                  {line.slice(1, -1)}
                </div>
              );
            }
            return (
              <React.Fragment key={i}>
                {line}
                {i < question.question.split('\n').length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Answer Options */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${currentAnswer?.value === index
                  ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleAnswerSelect(index)}
              whileHover={isDisabled ? {} : { x: 8, scale: 1.01 }}
              whileTap={isDisabled ? {} : { scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5
                  transition-all duration-200
                  ${currentAnswer?.value === index
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  {option.startsWith('"') && option.endsWith('"') ? (
                    <div className="bg-gray-50 p-3 rounded-lg italic border border-gray-200">
                      {option.slice(1, -1)}
                    </div>
                  ) : (
                    <span className="text-gray-800 leading-relaxed">{option}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Context Hint */}
      <motion.div 
        className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <Lightbulb size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-indigo-800">
            <strong>Tip:</strong> Consider all aspects of the problem before selecting your answer. Think about practical implementation and real-world constraints.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN ASSESSMENT SHELL COMPONENT
// ============================================================================

const AssessmentShell: React.FC<AssessmentShellProps> = ({
  assessment,
  questions,
  onSubmit,
  customQuestionRenderer: CustomQuestionRenderer,
  heroContent,
  tipsContent,
  showTips = true,
  allowReview = true
}) => {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeColors = getAssessmentTheme(assessment.skillType);
  const QuestionRenderer = CustomQuestionRenderer || DefaultQuestionRenderer;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const score = useMemo(() => {
    let correct = 0;
    questions.forEach(question => {
      const answer = answers.get(question.id);
      if (answer && answer.type === 'multiple-choice' && answer.value === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions]);

  const progressPercentage = Math.floor((timeRemaining / (assessment.duration * 60)) * 100);
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  const currentQ = questions[currentQuestion];
  const currentAnswer = answers.get(currentQ.id);

  // ============================================================================
  // EFFECTS
  // ============================================================================

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

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers(prev => new Map(prev).set(answer.questionId, answer));
  }, []);

  const handleQuestionNavigation = useCallback((index: number) => {
    setCurrentQuestion(index);
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const results: AssessmentResults = {
        assessmentId: assessment.id,
        score,
        percentage: score,
        timeTaken: (assessment.duration * 60) - timeRemaining,
        answers,
        completedAt: new Date(),
        metadata: {
          questionsAnswered: answers.size,
          totalQuestions: questions.length
        }
      };
      
      await onSubmit(results);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
    }
  }, [assessment, answers, score, timeRemaining, onSubmit, isSubmitting, questions.length]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} pb-20`}>
      {/* Hero Section */}
      {heroContent || <DefaultHeroContent assessment={assessment} themeColors={themeColors} />}

      {/* Assessment Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8 space-y-6">
              
              {/* Timer */}
              <motion.div 
                className={`
                  bg-gradient-to-br ${isLowTime ? 'from-red-500 to-red-600' : themeColors.primaryGradient} 
                  text-white p-6 rounded-xl text-center shadow-2xl 
                  transition-colors duration-300
                `}
                animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
                transition={isLowTime ? { repeat: Infinity, duration: 2 } : {}}
              >
                <Timer size={24} className={isLowTime ? 'animate-pulse' : ''} />
                <div className="text-sm uppercase tracking-wide mb-2 opacity-90 font-medium">Time Remaining</div>
                <div className="text-4xl font-bold font-mono mb-2">{formatTime(timeRemaining)}</div>
                <div className="text-sm opacity-90">{progressPercentage}% remaining</div>
              </motion.div>

              {/* Question Navigation */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <BookOpen size={18} />
                  Questions
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => {
                    const isAnswered = answers.has(q.id);
                    const isCurrent = currentQuestion === index;
                    
                    return (
                      <motion.button
                        key={q.id}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center font-bold
                          cursor-pointer transition-all duration-200 text-sm
                          ${isCurrent 
                            ? `bg-gradient-to-br ${themeColors.primaryGradient} text-white shadow-lg ring-4 ring-blue-200` 
                            : isAnswered 
                              ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:bg-gray-200'
                          }
                        `}
                        onClick={() => handleQuestionNavigation(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Question ${index + 1}${isAnswered ? ' (answered)' : ''}`}
                        aria-pressed={isCurrent}
                      >
                        {isAnswered && !isCurrent ? <CheckCircle size={16} /> : index + 1}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <Award size={18} />
                  Assessment Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen size={14} />
                      <span>Skill Type:</span>
                    </div>
                    <span className="font-medium text-gray-800 capitalize">
                      {assessment.skillType.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award size={14} />
                      <span>Difficulty:</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(assessment.difficulty)}`}>
                      <Shield size={12} className="inline mr-1" />
                      {assessment.difficulty.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BarChart size={14} />
                      <span>Participants:</span>
                    </div>
                    <span className="font-medium text-gray-800">{assessment.participants.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-bold text-blue-600">{assessment.averageScore}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Employer Trust:</span>
                    <span className="font-bold text-green-600">{assessment.employerTrust}%</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                className={`w-full bg-gradient-to-r ${themeColors.primaryGradient} text-white py-4 px-6 
                           rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 transition-all duration-300 text-sm`}
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={16} />
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </motion.button>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              
              {/* Question Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {currentQ.question.split('\n')[0]}
                  </h2>
                </div>
                
                <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border-2 ${getDifficultyColor(assessment.difficulty)}`}>
                  {getSkillIcon(assessment.skillType, 16)}
                  {getSkillDisplayName(assessment.skillType)}
                </div>
              </div>

              {/* Question Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  variants={questionVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <QuestionRenderer
                    question={currentQ}
                    currentAnswer={currentAnswer}
                    onAnswerChange={handleAnswerChange}
                    isDisabled={isSubmitting}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                           rounded-lg hover:bg-gray-100 font-medium"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || isSubmitting}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                <div className="text-sm text-gray-500 font-medium">
                  Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </div>
                
                {currentQuestion < questions.length - 1 ? (
                  <button
                    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${themeColors.primaryGradient}
                             text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-medium`}
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600
                             text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-medium"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Content */}
      {tipsContent && showTips && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tipsContent}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AssessmentShell;
export type { AssessmentShellProps, QuestionRendererProps, AssessmentResults, Answer };