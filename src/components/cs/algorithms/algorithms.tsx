// PermutationSimulation.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Code, Users, Zap, Star, ChevronRight, Hash, Timer, Turtle, FileCode, Sparkles, Activity } from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';

// --- Color palette to match the other simulation ---
const COLORS = {
  bg1: '#0a0e1a',       // page background
  bg2: '#1a1a2e',       // secondary dark
  surface: 'rgba(0,0,0,0.5)',
  textPrimary: '#e6eef8',
  textMuted: '#dee5efff',
  accent: '#3b82f6',    // primary blue
  accentSoft: '#60a5fa',
  purple: '#d5c7f5ff',
  success: '#22c55e',
  warn: '#fbbf24',
  danger: '#ef4444',
  borderAccent: 'rgba(59, 130, 246, 0.15)'
};

// TypeScript interfaces
interface PermutationStep {
  id: number;
  type: 'enter' | 'choose' | 'skip' | 'complete' | 'recurse' | 'backtrack';
  path: number[];
  used: boolean[];
  depth: number;
  currentIndex?: number;
  resultIndex?: number;
  message: string;
  codeLine?: number;
}

interface AlgorithmInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  leetcode: string;
}

type AlgorithmMode = 'permute' | 'permuteUnique' | 'specialPerm';

interface PermutationSimulationProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

// Algorithm code for display
const ALGORITHM_CODE: Record<AlgorithmMode, { code: string; lineMapping: Record<string, number[]> }> = {
  permute: {
    code: `void backtrack(int* nums, int n, int* used, 
               int* path, int depth, int** result) {
    if (depth == n) {
        // Found complete permutation
        result[idx++] = copy(path);
        return;
    }
    
    for (int i = 0; i < n; i++) {
        if (!used[i]) {
            used[i] = 1;
            path[depth] = nums[i];
            backtrack(...);  // recurse
            used[i] = 0;     // backtrack
        }
    }
}`,
    lineMapping: {
      'enter': [2],
      'complete': [3, 4, 5],
      'choose': [10, 11, 12],
      'recurse': [13],
      'backtrack': [14],
      'skip': [9]
    }
  },
  permuteUnique: {
    code: `void backtrack(int* nums, int n, int* used, 
               int* path, int depth, int** result) {
    if (depth == n) {
        result[idx++] = copy(path);
        return;
    }
    
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        
        // Skip duplicates
        if (i > 0 && nums[i] == nums[i-1] && !used[i-1]) 
            continue;
        
        used[i] = 1;
        path[depth] = nums[i];
        backtrack(...);  // recurse
        used[i] = 0;     // backtrack
    }
}`,
    lineMapping: {
      'enter': [2],
      'complete': [3, 4],
      'choose': [14, 15, 16],
      'recurse': [16],
      'backtrack': [17],
      'skip': [8, 11, 12]
    }
  },
  specialPerm: {
    code: `void backtrack(int* nums, int n, int* used, 
               int* path, int depth, long* count) {
    if (depth == n) {
        (*count) = (*count + 1) % MOD;
        return;
    }
    
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        
        // Check divisibility
        if (depth == 0 || 
            nums[i] % path[depth-1] == 0 || 
            path[depth-1] % nums[i] == 0) {
            
            used[i] = 1;
            path[depth] = nums[i];
            backtrack(...);  // recurse
            used[i] = 0;     // backtrack
        }
    }
}`,
    lineMapping: {
      'enter': [2],
      'complete': [3, 4],
      'choose': [15, 16, 17],
      'recurse': [17],
      'backtrack': [18],
      'skip': [8, 11, 12, 13]
    }
  }
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.99); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const gentlePulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(59,130,246,0.12); }
  50% { transform: scale(1.02); box-shadow: 0 0 25px rgba(59,130,246,0.16); }
`;

const smoothGlow = keyframes`
  0%, 100% { box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15); }
  50% { box-shadow: 0 4px 25px rgba(59, 130, 246, 0.22); }
`;

const lineHighlight = keyframes`
  0% { background: rgba(139, 92, 246, 0); }
  50% { background: rgba(139, 92, 246, 0.08); }
  100% { background: rgba(139, 92, 246, 0.04); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const MainContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg1} 100%);
  color: ${COLORS.textPrimary};
  display: flex;
  flex-direction: column;
  padding: 4rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.86) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.86) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  animation: ${fadeIn} 0.6s ease-out;
`;

const VisualizationPanel = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent,
      rgba(59, 130, 246, 0.35),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const CodePanel = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,10,30,0.7) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const VisualizationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const CodeHeader = styled.div`
  padding: 1rem 1.25rem;
  background: rgba(0,0,0,0.28);
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${COLORS.accentSoft};
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CodeContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.22);
    border-radius: 3px;
  }
`;

const CodeLine = styled.div<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  margin: 0.125rem 0;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: pre;
  
  ${({ $active }) => $active && css`
    background: rgba(139, 92, 246, 0.08);
    border-left: 3px solid ${COLORS.purple};
    animation: ${lineHighlight} 1s ease;
  `}
  
  .line-number {
    display: inline-block;
    width: 2rem;
    color: #d0d7e1ff;
    text-align: right;
    margin-right: 1rem;
    user-select: none;
    font-size: 0.8rem;
  }
  
  .code-text {
    color: ${({ $active }) => $active ? COLORS.textPrimary : COLORS.textMuted};
  }
  
  .keyword { color: #f472b6; font-weight: 600; }
  .function { color: ${COLORS.accentSoft}; }
  .comment { color: ${COLORS.accentSoft}; font-style: italic; }
  .number { color: ${COLORS.warn}; }
`;

const BottomSection = styled.div`
  margin-top: 1rem;
  height: 180px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const ControlsCard = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
`;

const ResultsCard = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid ${COLORS.borderAccent};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: 0.75rem 1rem;
  background: rgba(0,0,0,0.28);
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  
  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${COLORS.accentSoft};
  }
  
  .count {
    background: rgba(59, 130, 246, 0.14);
    padding: 0.25rem 0.75rem;
    border-radius: 10px;
    font-size: 0.8rem;
    color: ${COLORS.textPrimary};
  }
`;

const ResultsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-content: flex-start;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.22);
    border-radius: 3px;
  }
`;

const ResultItem = styled.div<{ $highlight?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: ${({ $highlight }) => $highlight ? 'rgba(139,92,246,0.08)' : 'rgba(0,0,0,0.28)'};
  border: 1px solid ${({ $highlight }) => $highlight ? 'rgba(139,92,246,0.14)' : 'rgba(59, 130, 246, 0.08)'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $highlight }) => $highlight && css`
    animation: ${gentlePulse} 2s ease-in-out;
  `}
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(59, 130, 246, 0.06);
    border-color: rgba(59, 130, 246, 0.12);
  }
  
  .index {
    font-size: 0.65rem;
    color: #64748b;
  }
  
  .values {
    display: flex;
    gap: 0.25rem;
  }
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
`;

const PlayButton = styled.button<{ $playing?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  background: ${({ $playing }) => $playing
    ? `linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06))`
    : `linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.06))`};
  color: ${({ $playing }) => $playing ? COLORS.danger : COLORS.accentSoft};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px ${({ $playing }) => $playing
    ? 'rgba(239, 68, 68, 0.18)'
    : 'rgba(59, 130, 246, 0.18)'};
  }
`;

const ControlButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: rgba(0,0,0,0.28);
  color: ${COLORS.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    background: rgba(59, 130, 246, 0.06);
    color: ${COLORS.accentSoft};
  }
`;

const SlowMoButton = styled(ControlButton) <{ $active: boolean }>`
  ${({ $active }) => $active && css`
    background: rgba(34, 197, 94, 0.06);
    border-color: rgba(34, 197, 94, 0.12);
    color: ${COLORS.success};
  `}
`;

const SpeedSlider = styled.input`
  width: 120px;
  height: 4px;
  border-radius: 2px;
  background: rgba(59, 130, 246, 0.14);
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${COLORS.accentSoft};
    cursor: pointer;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ModeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ModeButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid ${({ $active, $color }) => $active ? $color : 'transparent'};
  background: ${({ $active }) => $active ? 'rgba(59, 130, 246, 0.06)' : 'transparent'};
  color: ${({ $active, $color }) => $active ? $color : '#64748b'};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: 100%;
  
  &:hover {
    background: rgba(59, 130, 246, 0.04);
    color: ${({ $color }) => $color};
  }
`;

const ArrayContainer = styled.div`
  display: flex;
  gap: 0.625rem;
  align-items: center;
  justify-content: center;
`;

const ArrayElement = styled.div<{ $state: 'available' | 'used' | 'current' | 'result' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid;
  
  ${({ $state }) => {
    switch ($state) {
      case 'available':
        return css`
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04));
          border-color: rgba(59, 130, 246, 0.22);
          color: ${COLORS.accentSoft};
        `;
      case 'used':
        return css`
          background: rgba(0,0,0,0.18);
          border-color: rgba(59,130,246,0.06);
          color: #9ca3af;
          opacity: 0.6;
          transform: scale(0.92);
        `;
      case 'current':
        return css`
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04));
          border-color: rgba(34, 197, 94, 0.2);
          color: ${COLORS.success};
          transform: scale(1.08);
          animation: ${smoothGlow} 2s ease-in-out infinite;
        `;
      case 'result':
        return css`
          width: 24px;
          height: 24px;
          font-size: 0.8rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04));
          border-color: rgba(139, 92, 246, 0.18);
          color: ${COLORS.purple};
        `;
    }
  }}
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(0,0,0,0.28);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.08);
  
  .main {
    font-size: 1rem;
    font-weight: 600;
    color: ${COLORS.accentSoft};
    margin-bottom: 0.5rem;
    font-family: 'Courier New', monospace;
  }
  
  .stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    font-size: 0.7rem;
    color: #8b99a8;
    
    .stat {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      
      svg { width: 12px; height: 12px; color: ${COLORS.accentSoft}; }
    }
  }
`;

// constants & modes
const SLOWMO_SPEED = 500;

const ALGORITHM_MODES: Record<AlgorithmMode, AlgorithmInfo> = {
  permute: {
    name: 'Permutations',
    icon: <Users className="w-4 h-4" />,
    color: COLORS.accent,
    description: 'Generate all unique arrangements',
    leetcode: 'LC 46'
  },
  permuteUnique: {
    name: 'Unique',
    icon: <Zap className="w-4 h-4" />,
    color: COLORS.warn,
    description: 'Handle duplicates efficiently',
    leetcode: 'LC 47'
  },
  specialPerm: {
    name: 'Beautiful',
    icon: <Star className="w-4 h-4" />,
    color: COLORS.purple,
    description: 'Divisible adjacent elements',
    leetcode: 'LC 2741'
  }
};

const PermutationSimulation: React.FC<PermutationSimulationProps> = ({
  isRunning: externalRunning = false,
  speed: externalSpeed = 800,
  isDark = true
}) => {
  const [currentMode, setCurrentMode] = useState<AlgorithmMode>('permute');
  const [inputArray, setInputArray] = useState<number[]>([1, 2, 3]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseSpeed, setBaseSpeed] = useState(externalSpeed);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<PermutationStep[]>([]);
  const [allPermutations, setAllPermutations] = useState<number[][]>([]);
  const [discoveredPermutations, setDiscoveredPermutations] = useState<number[][]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [used, setUsed] = useState<boolean[]>([]);
  const [latestResult, setLatestResult] = useState(-1);
  const [activeCodeLines, setActiveCodeLines] = useState<number[]>([]);

  const actualSpeed = isSlowMo ? SLOWMO_SPEED : baseSpeed;

  useEffect(() => {
    setIsPlaying(externalRunning);
  }, [externalRunning]);

  useEffect(() => {
    if (!isSlowMo) {
      setBaseSpeed(externalSpeed);
    }
  }, [externalSpeed]);

  const generateSteps = useCallback((nums: number[], algoType: AlgorithmMode): { steps: PermutationStep[]; permutations: number[][] } => {
    const steps: PermutationStep[] = [];
    const perms: number[][] = [];
    let stepId = 0;

    // Sort array for permuteUnique to enable duplicate detection
    const sortedNums = algoType === 'permuteUnique' ? [...nums].sort((a, b) => a - b) : nums;

    const backtrack = (path: number[], usedArray: boolean[], depth: number): void => {
      steps.push({
        id: stepId++,
        type: 'enter',
        path: [...path],
        used: [...usedArray],
        depth,
        message: `Depth ${depth}: [${path.join(', ') || 'empty'}]`
      });

      if (depth === sortedNums.length) {
        const permIndex = perms.length;
        perms.push([...path]);
        steps.push({
          id: stepId++,
          type: 'complete',
          path: [...path],
          used: [...usedArray],
          depth,
          resultIndex: permIndex,
          message: `✓ Found #${permIndex + 1}: [${path.join(', ')}]`
        });
        return;
      }

      for (let i = 0; i < sortedNums.length; i++) {
        let canUse = false;
        let skipReason = '';

        // Check all skip conditions first
        if (usedArray[i]) {
          skipReason = 'used';
          canUse = false;
        } else if (algoType === 'permuteUnique' && i > 0 && sortedNums[i] === sortedNums[i - 1] && !usedArray[i - 1]) {
          skipReason = 'duplicate';
          canUse = false;
        } else if (algoType === 'specialPerm') {
          if (depth === 0) {
            canUse = true;
          } else {
            const lastNum = path[depth - 1];
            canUse = sortedNums[i] % lastNum === 0 || lastNum % sortedNums[i] === 0;
            if (!canUse) {
              skipReason = 'not divisible';
            }
          }
        } else {
          // Default case: element is available
          canUse = true;
        }

        steps.push({
          id: stepId++,
          type: canUse ? 'choose' : 'skip',
          path: [...path],
          used: [...usedArray],
          depth,
          currentIndex: i,
          message: canUse ?
            `→ Choose ${sortedNums[i]}` :
            `✗ Skip ${sortedNums[i]} (${skipReason})`
        });

        if (canUse) {
          const newPath = [...path, sortedNums[i]];
          const newUsed = [...usedArray];
          newUsed[i] = true;

          backtrack(newPath, newUsed, depth + 1);

          steps.push({
            id: stepId++,
            type: 'backtrack',
            path: [...path],
            used: [...usedArray],
            depth,
            message: `← Backtrack from ${sortedNums[i]}`
          });
        }
      }
    };

    backtrack([], new Array(sortedNums.length).fill(false), 0);

    return { steps, permutations: perms };
  }, []);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCurrentPath([]);
    setUsed(new Array(inputArray.length).fill(false));
    setLatestResult(-1);
    setDiscoveredPermutations([]);
    setActiveCodeLines([]);

    const { steps: newSteps, permutations: newPerms } = generateSteps(inputArray, currentMode);
    setSteps(newSteps);
    setAllPermutations(newPerms);
  }, [inputArray, currentMode, generateSteps]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setCurrentPath(step.path);
      setUsed(step.used);

      const lineMapping = ALGORITHM_CODE[currentMode].lineMapping;
      const activeLines = lineMapping[step.type] || [];
      setActiveCodeLines(activeLines);

      if (step.type === 'complete' && step.resultIndex !== undefined) {
        setLatestResult(step.resultIndex);
        const newPermutation = allPermutations[step.resultIndex];
        if (newPermutation) {
          setDiscoveredPermutations(prev => [...prev, newPermutation]);
        }
      } else {
        setLatestResult(-1);
      }

      setCurrentStep(prev => prev + 1);
    }, actualSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, actualSpeed, allPermutations, currentMode]);

  useEffect(() => {
    if (currentStep >= steps.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, isPlaying]);

  const handlePlayPause = () => {
    if (currentStep >= steps.length) {
      resetSimulation();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleSlowMo = () => {
    setIsSlowMo(!isSlowMo);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setBaseSpeed(newSpeed);
  };

  const handleArrayChange = (value: string) => {
    try {
      const arr = value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
      if (arr.length > 0 && arr.length <= 4) setInputArray(arr);
    } catch {
      // Ignore invalid input
    }
  };

  const getCurrentStatus = (): { message: string; type: string } => {
    if (currentStep === 0) return { message: 'Ready to explore', type: 'info' };
    if (currentStep >= steps.length) return { message: `Complete! Found ${allPermutations.length}`, type: 'success' };
    return { message: steps[currentStep - 1].message, type: steps[currentStep - 1].type };
  };

  const renderCodeWithHighlight = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      const lineNumber = idx + 1;
      const isActive = activeCodeLines.includes(lineNumber);

      let highlightedLine = line
        .replace(/\b(void|int|long|if|for|return|continue)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(backtrack)\b/g, '<span class="function">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

      return (
        <CodeLine key={idx} $active={isActive}>
          <span className="line-number">{lineNumber}</span>
          <span className="code-text" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
        </CodeLine>
      );
    });
  };

  const currentAlgorithm = ALGORITHM_MODES[currentMode];
  const status = getCurrentStatus();
  const currentCode = ALGORITHM_CODE[currentMode].code;
  const progress = steps.length > 0 ? (currentStep / steps.length) * 100 : 0;

  return (
    <MainContainer>
      <TopSection>
        {/* Visualization Panel - 50% */}
        <VisualizationPanel>
          <VisualizationContent>
            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: COLORS.textPrimary }}>
                Backtracking Visualization
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#8b99a8' }}>
                {currentAlgorithm.name} • {currentAlgorithm.leetcode}
              </p>
            </div>

            {/* Input Array */}
            <div>
              <h3 style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Input Array
              </h3>
              <ArrayContainer>
                {inputArray.map((num, idx) => (
                  <ArrayElement
                    key={idx}
                    $state={used[idx] ? 'used' : 'available'}
                  >
                    {num}
                  </ArrayElement>
                ))}
              </ArrayContainer>
            </div>

            {/* Current Path */}
            <div>
              <h3 style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Building Permutation
              </h3>
              <ArrayContainer>
                {currentPath.map((num, idx) => (
                  <React.Fragment key={idx}>
                    <ArrayElement $state="current">
                      {num}
                    </ArrayElement>
                    {idx < currentPath.length - 1 && (
                      <ChevronRight className="w-4 h-4" style={{ color: '#6b7280' }} />
                    )}
                  </React.Fragment>
                ))}
                {currentPath.length < inputArray.length && currentPath.length > 0 && (
                  <>
                    <ChevronRight className="w-4 h-4" style={{ color: '#6b7280' }} />
                    <ArrayElement $state="available">
                      ?
                    </ArrayElement>
                  </>
                )}
              </ArrayContainer>
            </div>

            {/* Status */}
            <StatusMessage>
              <div className="main">{status.message}</div>
              <div className="stats">
                <div className="stat">
                  <Activity />
                  Step {Math.min(currentStep, steps.length)}/{steps.length}
                </div>
                <div className="stat">
                  <Sparkles />
                  Found {discoveredPermutations.length}/{allPermutations.length}
                </div>
                <div className="stat">
                  <Hash />
                  Depth {currentPath.length}/{inputArray.length}
                </div>
              </div>
            </StatusMessage>

            {/* Array Input */}
            <div style={{ width: '200px' }}>
              <input
                type="text"
                value={inputArray.join(', ')}
                onChange={(e) => handleArrayChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(0,0,0,0.28)',
                  border: `1px solid ${COLORS.borderAccent}`,
                  borderRadius: '0.5rem',
                  color: COLORS.textPrimary,
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}
                placeholder="1, 2, 3"
              />
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', maxWidth: '400px', height: '4px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentSoft})`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </VisualizationContent>
        </VisualizationPanel>

        {/* Code Panel - 50% */}
        <CodePanel>
          <CodeHeader>
            <FileCode />
            <span>{currentAlgorithm.name} Implementation</span>
          </CodeHeader>
          <CodeContent>
            {renderCodeWithHighlight(currentCode)}
          </CodeContent>
        </CodePanel>
      </TopSection>

      {/* Bottom Section - Full Width */}
      <BottomSection>
        {/* Controls */}
        <ControlsCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PlayButton $playing={isPlaying} onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </PlayButton>
            <ControlButton onClick={resetSimulation}>
              <RotateCcw className="w-4 h-4" />
            </ControlButton>
            <SlowMoButton $active={isSlowMo} onClick={toggleSlowMo}>
              <Turtle className="w-4 h-4" />
            </SlowMoButton>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SpeedSlider
              type="range"
              min="200"
              max="1500"
              value={baseSpeed}
              onChange={handleSpeedChange}
              disabled={isSlowMo}
            />
            <div style={{ fontSize: '0.75rem', color: isSlowMo ? COLORS.success : COLORS.accentSoft, fontWeight: '600', minWidth: '50px' }}>
              {isSlowMo ? 'SLOW' : `${baseSpeed}ms`}
            </div>
          </div>
        </ControlsCard>

        {/* Permutations Results */}
        <ResultsCard>
          <ResultsHeader>
            <div className="title">
              <Sparkles />
              <span>Generated Permutations</span>
            </div>
            <div className="count">{discoveredPermutations.length}</div>
          </ResultsHeader>
          <ResultsList>
            {discoveredPermutations.map((perm, idx) => (
              <ResultItem key={`${idx}-${perm.join('-')}`} $highlight={latestResult === idx}>
                <span className="index">#{idx + 1}</span>
                <div className="values">
                  {perm.map((num, numIdx) => (
                    <ArrayElement key={numIdx} $state="result">
                      {num}
                    </ArrayElement>
                  ))}
                </div>
              </ResultItem>
            ))}
            {discoveredPermutations.length === 0 && (
              <div style={{
                color: '#fbfcfcff',
                textAlign: 'center',
                padding: '1rem',
                fontSize: '0.8rem',
                gridColumn: '1 / -1'
              }}>
                Press play to start exploring permutations
              </div>
            )}
          </ResultsList>
        </ResultsCard>

        {/* Info & Mode Selection */}
        <InfoCard>
          <ModeSelector>
            {(Object.entries(ALGORITHM_MODES) as [AlgorithmMode, AlgorithmInfo][]).map(([mode, config]) => (
              <ModeButton
                key={mode}
                $active={currentMode === mode}
                $color={config.color}
                onClick={() => setCurrentMode(mode)}
              >
                {config.icon}
                <span>{config.leetcode}: {config.name}</span>
              </ModeButton>
            ))}
          </ModeSelector>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: COLORS.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Timer className="w-3 h-3" style={{ color: COLORS.accentSoft }} />
              <span>{actualSpeed}ms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Activity className="w-3 h-3" style={{ color: COLORS.accentSoft }} />
              <span>O(n!×n)</span>
            </div>
          </div>
        </InfoCard>
      </BottomSection>
    </MainContainer>
  );
};

export default PermutationSimulation;
