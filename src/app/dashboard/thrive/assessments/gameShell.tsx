// src/app/dashboard/thrive/assessments/gameShell.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Timer, Trophy, Zap, Target, Brain, Gamepad2,
  CheckCircle, XCircle, Star, Award, BarChart,
  Lightbulb, MessageSquare, Code, Calculator, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants, Easing } from 'framer-motion';
import { AssessmentQuestion, Assessment } from '@/types/thrive.types';

// ---------------------------------------------------------------------------
// Small helper to cast string -> Easing so TS accepts 'easeInOut', 'easeOut', etc.
// ---------------------------------------------------------------------------
const E = (s: string) => s as Easing;

// ============================================================================
// TYPES
// ============================================================================

export interface GameAction {
  challengeId: string;
  actionType: 'click' | 'drag' | 'input' | 'selection' | 'custom';
  data: any;
  timestamp: Date;
  points?: number;
}

export interface GameResults {
  assessmentId: string;
  totalScore: number;
  totalPoints: number;
  timeTaken: number;
  actions: GameAction[];
  completedAt: Date;
  challenges: ChallengeResult[];
  metadata?: Record<string, any>;
}

export interface ChallengeResult {
  challengeId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  attempts: number;
}

export interface ChallengeRendererProps {
  challenge: GameChallenge;
  onComplete: (result: ChallengeResult) => void;
  onAction: (action: GameAction) => void;
  isDisabled: boolean;
  currentProgress: ChallengeResult | undefined;
}

export interface GameChallenge extends AssessmentQuestion {
  type: 'logic-puzzle' | 'pattern-recognition' | 'code-debug' | 'interactive-scenario' | 'visual-reasoning';
  maxPoints: number;
  timeLimit?: number;
  instructions: string;
  gameData?: any;
}

interface GameShellProps {
  assessment: Assessment;
  challenges: GameChallenge[];
  onSubmit: (results: GameResults) => Promise<void>;
  customChallengeRenderer?: React.ComponentType<ChallengeRendererProps>;
  heroContent?: React.ReactNode;
  tipsContent?: React.ReactNode;
  showTips?: boolean;
  allowReview?: boolean;
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const challengeVariants: Variants = {
  enter: { scale: 0.8, opacity: 0, rotateY: 90 },
  center: { scale: 1, opacity: 1, rotateY: 0 },
  exit: { scale: 0.8, opacity: 0, rotateY: -90 }
};

const scoreVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.6, ease: E('easeInOut') }
  }
};

const progressVariants: Variants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.8, ease: E('easeOut') }
  })
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

const getChallengeIcon = (type: string, size = 20) => {
  const iconProps = { size };
  switch (type) {
    case 'logic-puzzle': return <Brain {...iconProps} />;
    case 'pattern-recognition': return <Target {...iconProps} />;
    case 'code-debug': return <Code {...iconProps} />;
    case 'interactive-scenario': return <Gamepad2 {...iconProps} />;
    case 'visual-reasoning': return <Sparkles {...iconProps} />;
    default: return <Zap {...iconProps} />;
  }
};

const getGameTheme = (skillType: string) => {
  const themes = {
    'critical-thinking': {
      primaryGradient: 'from-indigo-500 via-purple-600 to-pink-600',
      secondaryGradient: 'from-indigo-100 to-purple-200',
      bgGradient: 'from-indigo-50 via-purple-50 to-pink-50',
      accentColor: 'indigo-500'
    },
    'technical': {
      primaryGradient: 'from-blue-500 via-cyan-500 to-teal-600',
      secondaryGradient: 'from-blue-100 to-cyan-200',
      bgGradient: 'from-blue-50 via-cyan-50 to-teal-50',
      accentColor: 'blue-500'
    },
    'creative': {
      primaryGradient: 'from-orange-500 via-pink-500 to-purple-600',
      secondaryGradient: 'from-orange-100 to-pink-200',
      bgGradient: 'from-orange-50 via-pink-50 to-purple-50',
      accentColor: 'orange-500'
    }
  };

  return themes[skillType as keyof typeof themes] || {
    primaryGradient: 'from-blue-500 via-purple-500 to-pink-600',
    secondaryGradient: 'from-blue-100 to-purple-200',
    bgGradient: 'from-blue-50 via-purple-50 to-pink-50',
    accentColor: 'blue-500'
  };
};

const getDifficultyStars = (difficulty: string) => {
  const stars = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4
  };
  return stars[difficulty as keyof typeof stars] || 2;
};

// ============================================================================
// DEFAULT COMPONENTS
// ============================================================================

const DefaultHeroContent: React.FC<{ assessment: Assessment; themeColors: any }> = ({
  assessment,
  themeColors
}) => (
  <div className={`bg-gradient-to-br ${themeColors.bgGradient} pt-16 pb-16 relative overflow-hidden`}>
    {/* Animated Background Elements */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-32 w-40 h-40 bg-gradient-to-br from-pink-400 to-orange-600 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/2 w-36 h-36 bg-gradient-to-br from-green-400 to-blue-600 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.div
          className="inline-flex items-center bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold text-gray-800 mb-8 border border-white/40 shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: E('easeInOut') }}
        >
          <Gamepad2 size={20} className="mr-2 text-purple-600" />
          <span className="uppercase tracking-wide">Interactive Game Assessment</span>
          <div className="ml-3 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className={`bg-gradient-to-r ${themeColors.primaryGradient} bg-clip-text text-transparent`}>
            {assessment.title}
          </span>
        </motion.h1>

        <motion.p
          className="max-w-3xl mx-auto text-xl text-gray-700 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {assessment.description}
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: E('easeInOut') }}
        >
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-3xl font-bold text-gray-900">{assessment.averageScore}%</div>
            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              <Trophy size={14} />
              Avg Score
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-3xl font-bold text-gray-900">{assessment.completionRate}%</div>
            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              Completion
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              {Array.from({ length: getDifficultyStars(assessment.difficulty) }).map((_, i) => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-sm text-gray-700 capitalize">{assessment.difficulty}</div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-3xl font-bold text-gray-900">{assessment.duration} min</div>
            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              <Timer size={14} />
              Duration
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </div>
);

// DefaultChallengeRenderer unchanged except guard & small improvements
const DefaultChallengeRenderer: React.FC<ChallengeRendererProps> = ({
  challenge,
  onComplete,
  onAction,
  isDisabled,
  currentProgress
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (isDisabled || currentProgress?.completed) return;

    setSelectedAnswer(optionIndex);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    onAction({
      challengeId: challenge.id,
      actionType: 'selection',
      data: { selectedOption: optionIndex, attempt: newAttempts },
      timestamp: new Date()
    });

    const isCorrect = optionIndex === challenge.correctAnswer;
    const basePoints = challenge.maxPoints || 100;
    const timeSpent = (Date.now() - startTime) / 1000;

    let score = 0;
    if (isCorrect) {
      score = Math.max(basePoints - ((newAttempts - 1) * 10), basePoints * 0.3);
    }

    setTimeout(() => {
      onComplete({
        challengeId: challenge.id,
        completed: isCorrect,
        score,
        timeSpent,
        attempts: newAttempts
      });
    }, 500);
  }, [challenge, attempts, startTime, isDisabled, currentProgress, onComplete, onAction]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 p-6 rounded-r-lg">
        <div className="flex items-center gap-3 mb-4">
          {getChallengeIcon(challenge.type, 24)}
          <h3 className="text-lg font-bold text-gray-800">Challenge Instructions</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{challenge.instructions}</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 p-6 rounded-xl">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">{challenge.question}</h4>

        <div className="grid grid-cols-1 gap-4">
          {challenge.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCompleted = currentProgress?.completed;
            const isCorrect = index === challenge.correctAnswer;

            let buttonStyles = 'border-gray-200 hover:border-purple-300 hover:bg-gray-50';

            if (isSelected) {
              if (isCompleted && isCorrect) {
                buttonStyles = 'border-green-500 bg-green-50 ring-4 ring-green-100';
              } else if (isCompleted) {
                buttonStyles = 'border-red-500 bg-red-50 ring-4 ring-red-100';
              } else {
                buttonStyles = 'border-blue-500 bg-blue-50 ring-4 ring-blue-100';
              }
            }

            return (
              <motion.button
                key={index}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${buttonStyles}
                  ${isDisabled || isCompleted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                `}
                onClick={() => handleAnswerSelect(index)}
                disabled={isDisabled || isCompleted}
                whileHover={isDisabled || isCompleted ? {} : { scale: 1.02 }}
                whileTap={isDisabled || isCompleted ? {} : { scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isSelected
                      ? isCompleted && isCorrect
                        ? 'bg-green-500 text-white'
                        : isCompleted
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-gray-800">{option}</span>

                  {isCompleted && isSelected && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle size={24} className="text-green-500" />
                      ) : (
                        <XCircle size={24} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {currentProgress?.completed && selectedAnswer !== challenge.correctAnswer && (
          <motion.div
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={18} />
              <span className="font-medium">
                Correct answer: {String.fromCharCode(65 + challenge.correctAnswer)} - {challenge.options[challenge.correctAnswer]}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{challenge.maxPoints}</div>
            <div className="text-sm text-gray-600">Max Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{attempts}</div>
            <div className="text-sm text-gray-600">Attempts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{currentProgress?.score || 0}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN GAME SHELL COMPONENT
// ============================================================================

const GameShell: React.FC<GameShellProps> = ({
  assessment,
  challenges,
  onSubmit,
  customChallengeRenderer: CustomChallengeRenderer,
  heroContent,
  tipsContent,
  showTips = true,
  allowReview = true
}) => {
  const router = useRouter();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60);
  const [challengeResults, setChallengeResults] = useState<Map<string, ChallengeResult>>(new Map());
  const [gameActions, setGameActions] = useState<GameAction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeColors = getGameTheme(assessment.skillType);
  const ChallengeRenderer = CustomChallengeRenderer || DefaultChallengeRenderer;

  const totalScore = useMemo(() => {
    return Array.from(challengeResults.values()).reduce((total, result) => total + result.score, 0);
  }, [challengeResults]);

  const totalPossiblePoints = useMemo(() => {
    return challenges.reduce((total, challenge) => total + (challenge.maxPoints || 100), 0);
  }, [challenges]);

  const completedChallenges = useMemo(() => {
    return Array.from(challengeResults.values()).filter(result => result.completed).length;
  }, [challengeResults]);

  const progressPercentage = Math.max(0, Math.floor(((assessment.duration * 60) - timeRemaining) / (assessment.duration * 60) * 100));
  const completionPercentage = Math.round((completedChallenges / challenges.length) * 100);
  const isLowTime = timeRemaining < 300;
  const currentC = challenges[currentChallenge];
  const currentResult = challengeResults.get(currentC?.id);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining]);

  const handleChallengeComplete = useCallback((result: ChallengeResult) => {
    setChallengeResults(prev => new Map(prev).set(result.challengeId, result));

    // Auto-advance to next challenge after a delay
    setTimeout(() => {
      if (currentChallenge < challenges.length - 1) {
        setCurrentChallenge(prev => prev + 1);
      }
    }, 2000);
  }, [currentChallenge, challenges.length]);

  const handleGameAction = useCallback((action: GameAction) => {
    setGameActions(prev => [...prev, action]);
  }, []);

  const handleChallengeNavigation = useCallback((index: number) => {
    if (index >= 0 && index < challenges.length) {
      setCurrentChallenge(index);
    }
  }, [challenges.length]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const results: GameResults = {
        assessmentId: assessment.id,
        totalScore,
        totalPoints: totalPossiblePoints,
        timeTaken: (assessment.duration * 60) - timeRemaining,
        actions: gameActions,
        completedAt: new Date(),
        challenges: Array.from(challengeResults.values()),
        metadata: {
          completedChallenges,
          totalChallenges: challenges.length,
          completionPercentage
        }
      };

      await onSubmit(results);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
    }
  }, [assessment, totalScore, totalPossiblePoints, timeRemaining, gameActions, challengeResults, completedChallenges, challenges.length, completionPercentage, isSubmitting, onSubmit]);

  if (!currentC) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bgGradient} pb-20`}>
      {heroContent || <DefaultHeroContent assessment={assessment} themeColors={themeColors} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8 space-y-6">

              <motion.div
                className={`bg-gradient-to-br ${themeColors.primaryGradient} text-white p-6 rounded-xl text-center shadow-2xl`}
                variants={scoreVariants}
                animate={totalScore > 0 ? "pulse" : "visible"}
              >
                <Trophy size={24} className="mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{Math.round(totalScore)}</div>
                <div className="text-sm opacity-90">Total Score</div>
                <div className="text-xs opacity-75 mt-1">of {totalPossiblePoints} points</div>
              </motion.div>

              <motion.div
                className={`
                  p-4 rounded-xl text-center border-2
                  ${isLowTime
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                  }
                `}
                animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
                transition={isLowTime ? { repeat: Infinity, duration: 2, ease: E('easeInOut') } : {}}
              >
                <Timer size={20} className={`mx-auto mb-2 ${isLowTime ? 'animate-pulse' : ''}`} />
                <div className="text-2xl font-bold font-mono">{formatTime(timeRemaining)}</div>
                <div className="text-xs opacity-75">{Math.floor((timeRemaining / (assessment.duration * 60)) * 100)}% remaining</div>
              </motion.div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                  <Target size={18} />
                  Challenges
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {challenges.map((challenge, index) => {
                    const result = challengeResults.get(challenge.id);
                    const isCurrent = currentChallenge === index;

                    let buttonStyles = 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';

                    if (isCurrent) {
                      buttonStyles = `bg-gradient-to-br ${themeColors.primaryGradient} text-white shadow-lg ring-2 ring-purple-200`;
                    } else if (result?.completed) {
                      buttonStyles = result.score > 0
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300';
                    }

                    return (
                      <motion.button
                        key={challenge.id}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center font-bold text-xs
                          cursor-pointer transition-all duration-200 border-2 ${buttonStyles}
                        `}
                        onClick={() => handleChallengeNavigation(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {result?.completed ? (
                          result.score > 0 ? <CheckCircle size={14} /> : <XCircle size={14} />
                        ) : (
                          index + 1
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{completedChallenges}/{challenges.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className={`h-3 bg-gradient-to-r ${themeColors.primaryGradient} rounded-full`}
                    variants={progressVariants}
                    initial="hidden"
                    animate="visible"
                    custom={completionPercentage}
                  />
                </div>
                <div className="text-center text-sm text-gray-600 mt-1">{completionPercentage}% Complete</div>
              </div>

              <motion.button
                className={`w-full bg-gradient-to-r ${themeColors.primaryGradient} text-white py-4 px-6
                           rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 transition-all duration-300`}
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                <Trophy size={16} />
                {isSubmitting ? 'Submitting...' : 'Complete Game'}
              </motion.button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">

              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide mb-2 font-medium">
                    Challenge {currentChallenge + 1} of {challenges.length}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-3">
                    {getChallengeIcon(currentC.type, 28)}
                    {currentC.question.split('\n')[0]}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{currentC.maxPoints || 100}</div>
                    <div className="text-sm text-gray-600">Max Points</div>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChallenge}
                  variants={challengeVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: E('easeInOut') }}
                >
                  <ChallengeRenderer
                    challenge={currentC}
                    onComplete={handleChallengeComplete}
                    onAction={handleGameAction}
                    isDisabled={isSubmitting}
                    currentProgress={currentResult}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {tipsContent && showTips && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {tipsContent}
        </div>
      )}
    </div>
  );
};

export default GameShell;
