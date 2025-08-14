'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants, Easing } from 'framer-motion';
import {
  Lightbulb, Sparkles, Zap, Target, Users, Rocket,
  PenTool, RotateCcw, Brain, Star, TrendingUp, Flame,
  CheckCircle, Award, Clock, ArrowRight
} from 'lucide-react';
import type { ChallengeRendererProps, ChallengeResult } from '../../gameShell';

// ------------------------------
// Helpers & Maps
// ------------------------------
const E = (s: string) => s as Easing; // small helper so we don't repeat casts

const bgColorMap: Record<string, string> = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  pink: 'bg-pink-500 text-white'
};
const textColorMap: Record<string, string> = {
  blue: 'text-blue-800',
  green: 'text-green-800',
  purple: 'text-purple-800',
  pink: 'text-pink-800'
};

// ------------------------------
// Types
// ------------------------------
interface InnovationLevel {
  level: string;
  score: number;
  color: keyof typeof bgColorMap;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

// ------------------------------
// Static data
// ------------------------------
const innovationLevels: InnovationLevel[] = [
  { level: 'Incremental', score: 60, color: 'blue', icon: TrendingUp, description: 'Logical improvement' },
  { level: 'Practical', score: 70, color: 'green', icon: Users, description: 'User-centered solution' },
  { level: 'Breakthrough', score: 85, color: 'purple', icon: Zap, description: 'Paradigm shift' },
  { level: 'Visionary', score: 100, color: 'pink', icon: Rocket, description: 'Game-changing innovation' }
];

const getInnovationData = (optionIndex: number) => innovationLevels[optionIndex] ?? innovationLevels[0];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const calculateCreativityBonus = (ideationNotes: string, sketchActive: boolean, timeSpent: number) => {
  let bonus = 0;
  if (ideationNotes.length > 50) bonus += 10;
  if (ideationNotes.length > 150) bonus += 5;
  if (sketchActive) bonus += 15;
  if (timeSpent > 60) bonus += 5;
  if (timeSpent > 180) bonus += 5;
  return Math.min(bonus, 30);
};

// ------------------------------
// Variants (typed)
// ------------------------------
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

// ------------------------------
// Renderer
// ------------------------------
const InnovationGameRenderer: React.FC<ChallengeRendererProps> = ({
  challenge,
  onComplete,
  onAction,
  isDisabled,
  currentProgress
}) => {
  // state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [innovationScore, setInnovationScore] = useState(0);
  const [creativityBonus, setCreativityBonus] = useState(0);
  const [ideationNotes, setIdeationNotes] = useState('');
  const [sketchActive, setSketchActive] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showIdeationTools, setShowIdeationTools] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [remoteDataLoaded, setRemoteDataLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef(Date.now());

  // If challenge has remoteId, try fetch more info (non-blocking / best-effort)
  useEffect(() => {
    if ((challenge as any).remoteId && !remoteDataLoaded) {
      // example: fetch(`/api/thrive/challenges/${challenge.remoteId}`)
      // keep this a no-op for now; uncomment & wire your endpoint when server is ready
      (async () => {
        try {
          // const res = await fetch(`/api/thrive/challenges/${(challenge as any).remoteId}`);
          // if (res.ok) { const data = await res.json(); /* merge to local state if desired */ }
        } catch (e) {
          // ignore network errors for now — renderer must remain resilient
        } finally {
          setRemoteDataLoaded(true);
        }
      })();
    }
  }, [challenge, remoteDataLoaded]);

  // Timer
  useEffect(() => {
    if (hasSubmitted || currentProgress?.completed) return;
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasSubmitted, currentProgress?.completed]);

  // realtime creativity
  useEffect(() => {
    if (!hasSubmitted && !currentProgress?.completed) {
      setCreativityBonus(calculateCreativityBonus(ideationNotes, sketchActive, timeSpent));
    }
  }, [ideationNotes, sketchActive, timeSpent, hasSubmitted, currentProgress?.completed]);

  // Canvas DPI scaling + basic setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);
    // set a clean baseline
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Drawing handlers (desktop + touch)
  const startDrawing = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isDisabled || hasSubmitted) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setSketchActive(true);
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }, [isDisabled, hasSubmitted]);

  const drawTo = useCallback((clientX: number, clientY: number) => {
    if (!isDrawing || isDisabled || hasSubmitted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }, [isDrawing, isDisabled, hasSubmitted]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.closePath();
  }, [isDrawing]);

  // mouse / touch bridging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => startDrawing(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => drawTo(e.clientX, e.clientY);
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    if (t) startDrawing(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    if (t) drawTo(t.clientX, t.clientY);
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isDisabled || hasSubmitted) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSketchActive(false);
  }, [isDisabled, hasSubmitted]);

  // Answer submit
  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (isDisabled || currentProgress?.completed || hasSubmitted) return;
    setSelectedAnswer(optionIndex);
    setHasSubmitted(true);

    const innovationData = getInnovationData(optionIndex);
    setInnovationScore(innovationData.score);

    const bonus = calculateCreativityBonus(ideationNotes, sketchActive, timeSpent);
    setCreativityBonus(bonus);

    // action metadata
    onAction({
      challengeId: challenge.id,
      actionType: 'selection',
      data: {
        selectedOption: optionIndex,
        innovationLevel: innovationData.level,
        baseScore: innovationData.score,
        creativityBonus: bonus,
        timeSpent,
        usedIdeationTools: ideationNotes.length > 0 || sketchActive,
        ideationNotesLength: ideationNotes.length,
        usedCanvas: sketchActive
      },
      timestamp: new Date(),
      points: innovationData.score + bonus
    });

    const finalScore = Math.min(innovationData.score + bonus, challenge.maxPoints ?? 100);
    const isCorrect = typeof challenge.correctAnswer === 'number' ? optionIndex === challenge.correctAnswer : true;

    setTimeout(() => {
      const result: ChallengeResult = {
        challengeId: challenge.id,
        completed: true,
        score: isCorrect ? finalScore : Math.max(finalScore * 0.7, 30),
        timeSpent,
        attempts: 1
      };
      onComplete(result);
    }, 1400);
  }, [challenge, ideationNotes, sketchActive, timeSpent, isDisabled, currentProgress, hasSubmitted, onComplete, onAction]);

  // ---------- Render helpers ----------
  const renderStatsHeader = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <motion.div
        className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl text-center shadow-sm"
        variants={slideInLeft}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock size={18} className="text-purple-600" />
          <span className="font-bold text-purple-800 text-sm">Time</span>
        </div>
        <div className="text-xl font-bold text-purple-900">{formatTime(timeSpent)}</div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-orange-100 to-orange-200 p-4 rounded-xl text-center shadow-sm"
        variants={slideInLeft}
        whileHover={{ scale: 1.02 }}
        animate={innovationScore > 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={innovationScore > 0 ? { duration: 0.6, ease: E('easeInOut') } : {}}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star size={18} className="text-orange-600" />
          <span className="font-bold text-orange-800 text-sm">Innovation</span>
        </div>
        <div className="text-xl font-bold text-orange-900">{innovationScore}/100</div>
      </motion.div>

      <motion.div
        className="bg-gradient-to-r from-pink-100 to-pink-200 p-4 rounded-xl text-center shadow-sm"
        variants={slideInLeft}
        whileHover={{ scale: 1.02 }}
        animate={creativityBonus > 0 ? { scale: [1, 1.05, 1] } : {}}
        transition={creativityBonus > 0 ? { duration: 0.6, ease: E('easeInOut') } : {}}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame size={18} className="text-pink-600" />
          <span className="font-bold text-pink-800 text-sm">Creativity</span>
        </div>
        <div className="text-xl font-bold text-pink-900">+{creativityBonus}</div>
      </motion.div>
    </div>
  );

  const renderInstructions = () => (
    <motion.div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-l-4 border-indigo-400 p-6 rounded-r-2xl mb-6" variants={fadeInUp}>
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl shadow-lg flex-shrink-0">
          <Rocket size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation Challenge</h3>
          <p className="text-gray-700 leading-relaxed mb-4">{challenge.instructions}</p>

          <motion.div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200" variants={scaleIn}>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-800">Think Like an Innovator</span>
            </div>
            <p className="text-sm text-purple-700">
              Consider <strong>breakthrough solutions</strong> that combine technologies, challenge assumptions,
              or create entirely new behaviors.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderIdeationTools = () => (
    <AnimatePresence>
      {showIdeationTools && (
        <motion.div
          className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm"
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.36, ease: E('easeInOut') }}
        >
          <h5 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-purple-600" />
            Innovation Workspace
          </h5>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Canvas */}
            <div>
              <h6 className="font-medium mb-3 flex items-center gap-2">
                <PenTool size={16} className="text-blue-600" />
                Visual Brainstorm
              </h6>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className={`border-2 border-gray-300 rounded-xl bg-white w-full shadow-sm transition-all duration-200 ${isDisabled || hasSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair hover:border-purple-400'}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={stopDrawing}
                />
                <button
                  onClick={() => !isDisabled && !hasSubmitted && clearCanvas()}
                  disabled={isDisabled || hasSubmitted}
                  className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 shadow-sm ${isDisabled || hasSubmitted ? 'bg-gray-200 cursor-not-allowed opacity-60' : 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md'}`}
                >
                  <RotateCcw size={14} className={isDisabled || hasSubmitted ? 'text-gray-400' : 'text-gray-600'} />
                </button>

                {sketchActive && (
                  <motion.div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    ✨ +15pts bonus!
                  </motion.div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h6 className="font-medium mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-600" />
                Wild Ideas & Connections
              </h6>
              <div className="relative">
                <textarea
                  value={ideationNotes}
                  onChange={(e) => !hasSubmitted && !isDisabled && setIdeationNotes(e.target.value)}
                  placeholder="What if... Imagine... Combine... Challenge assumptions..."
                  disabled={isDisabled || hasSubmitted}
                  className={`w-full h-44 p-4 border-2 rounded-xl resize-none transition-all duration-200 shadow-sm ${isDisabled || hasSubmitted ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : 'border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300'}`}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">{ideationNotes.length}/500</div>
              </div>

              <div className="mt-2 text-sm">
                {ideationNotes.length > 50 ? (
                  <motion.span className="text-green-600 flex items-center gap-1" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    <CheckCircle size={14} />
                    Creativity bonus unlocked! +{ideationNotes.length > 150 ? '15' : '10'}pts
                  </motion.span>
                ) : (
                  <span className="text-gray-500">Write 50+ characters for bonus points</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Answer options
  const renderAnswerOptions = () => (
    <div className="space-y-3">
      <h5 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
        <Target size={20} className="text-orange-500" />
        Choose Your Innovation Approach
      </h5>

      <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
        {challenge.options.map((option, index) => {
          const innovationData = getInnovationData(index);
          const IconComponent = innovationData.icon;
          const isSelected = selectedAnswer === index;
          const isCompleted = currentProgress?.completed || hasSubmitted;

          // safe classes instead of fully dynamic Tailwind interpolation
          const badgeClasses = isSelected
            ? isCompleted ? 'bg-green-500 text-white shadow-lg' : 'bg-purple-500 text-white shadow-lg'
            : 'bg-gray-200 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-700';

          return (
            <motion.div
              key={index}
              className={[
                'group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300',
                isSelected && !isCompleted ? 'border-purple-500 bg-purple-50 shadow-xl ring-4 ring-purple-100' : '',
                isSelected && isCompleted ? 'border-green-500 bg-green-50 shadow-xl ring-4 ring-green-100' : '',
                (!isSelected && !isCompleted) ? 'border-gray-200 hover:border-purple-300 hover:bg-white hover:shadow-lg' : '',
                (isDisabled || isCompleted) ? 'cursor-not-allowed pointer-events-none opacity-80' : ''
              ].filter(Boolean).join(' ')}
              onClick={() => { if (!isDisabled && !isCompleted) handleAnswerSelect(index); }}
              variants={fadeInUp}
              whileHover={isDisabled || isCompleted ? undefined : { x: 8, scale: 1.02 }}
              whileTap={isDisabled || isCompleted ? undefined : { scale: 0.98 }}
              layout
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${badgeClasses}`}>
                    {isSelected && isCompleted ? <CheckCircle size={20} /> : String.fromCharCode(65 + index)}
                  </div>

                  <div className="text-center">
                    <div className={`p-2 rounded-lg transition-all duration-300 mb-1 ${isSelected ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                      <IconComponent size={16} className="text-purple-600" />
                    </div>
                    <div className="text-xs font-bold text-gray-600">{innovationData.score}pts</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">{innovationData.level} Innovation</span>
                    <span className="text-xs text-gray-500">{innovationData.description}</span>
                  </div>

                  <div className="text-gray-800 leading-relaxed mb-3">{option}</div>

                  {isSelected && (
                    <motion.div
                      className={`p-4 rounded-xl border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2, ease: E('easeInOut') }}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? <Award size={20} className="text-green-600" /> : <Sparkles size={20} className="text-purple-600" />}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${isCompleted ? 'text-green-800' : 'text-purple-800'}`}>
                            {isCompleted ? 'Challenge Completed!' : `${innovationData.level} Innovation Approach!`}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Base Score: {innovationData.score}pts
                            {creativityBonus > 0 && ` + ${creativityBonus}pts creativity bonus`}
                            {creativityBonus > 0 && ` = ${innovationData.score + creativityBonus}pts total`}
                          </div>
                        </div>
                      </div>

                      {isCompleted && (
                        <motion.div className="mt-3 flex items-center gap-2 text-sm text-green-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                          <ArrowRight size={14} />
                          <span>Moving to next challenge...</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );

  const renderInnovationTip = () => (!selectedAnswer && (
    <motion.div className="mt-6 bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, ease: E('easeInOut') }}>
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-2xl shadow-lg flex-shrink-0">
          <Rocket size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h6 className="font-bold text-amber-800 mb-2">Pro Innovation Tip</h6>
          <p className="text-amber-700 text-sm leading-relaxed">
            <strong>Use the "Yes, and..." mindset:</strong> Instead of thinking why an idea won't work, explore how it might be possible.
          </p>
        </div>
      </div>
    </motion.div>
  ));

  // ---------------- main render ----------------
  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      {renderStatsHeader()}
      {renderInstructions()}

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h4 className="text-xl font-bold mb-4 text-gray-900">{challenge.question}</h4>

        <motion.button
          className={`mb-6 w-full p-4 rounded-xl transition-all duration-300 border-2 border-dashed ${showIdeationTools ? 'bg-teal-100 border-teal-400 text-teal-800' : 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 hover:from-teal-100 hover:to-cyan-100 text-teal-700'}`}
          onClick={() => !isDisabled && !hasSubmitted && setShowIdeationTools(v => !v)}
          disabled={isDisabled || hasSubmitted}
          variants={fadeInUp}
          whileHover={isDisabled || hasSubmitted ? undefined : { scale: 1.01 }}
          whileTap={isDisabled || hasSubmitted ? undefined : { scale: 0.99 }}
        >
          <div className="flex items-center justify-center gap-3">
            <PenTool size={20} />
            <span className="font-medium">{showIdeationTools ? 'Hide' : 'Open'} Creative Toolkit</span>
            <Sparkles size={16} className="animate-pulse" />
            {creativityBonus > 0 && <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">+{creativityBonus}pts</span>}
          </div>
        </motion.button>

        {renderIdeationTools()}
        {renderAnswerOptions()}
        {renderInnovationTip()}
      </div>
    </motion.div>
  );
};

export default InnovationGameRenderer;
