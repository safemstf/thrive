import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Lightbulb, Code, Brain, Target, Info, Eye, EyeOff, BarChart3, ChevronDown, ChevronUp, Shuffle, CheckCircle, XCircle, AlertCircle, Terminal } from 'lucide-react';

// Props interface matching other simulations
interface AlgorithmVisualizerProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

// Type definitions for better type safety
type BankPosition = 'left' | 'right';
type ProblemType = 'lights' | 'toys' | 'gold' | 'river';

// Problem configurations with full descriptions
const PROBLEMS: Record<ProblemType, {
  name: string;
  icon: string;
  description: string;
  difficulty: string;
  complexity: string;
  fullProblem: string;
  hint: string;
  example: string;
  category: string;
  testCases?: Array<{
    input: any;
    expected: any;
    description: string;
  }>;
}> = {
  lights: {
    name: "Christmas Lights",
    icon: "💡",
    description: "Lights switch colors based on factors",
    difficulty: "Medium",
    complexity: "O(N√N)",
    category: "Math & Patterns",
    fullProblem: "You have N Christmas lights numbered 1 to N, all starting GREEN. At each step K (from 1 to N), every light whose number is a FACTOR of K switches color (green→red or red→green). After N steps, which lights will be RED?",
    hint: "Only perfect squares have an odd number of factors!",
    example: "Step 6: Factors are 1,2,3,6 → Lights #1,#2,#3,#6 switch",
    testCases: [
      { input: 16, expected: 4, description: "Lights 1, 4, 9, 16 are red" },
      { input: 25, expected: 5, description: "Perfect squares up to 25" },
      { input: 9, expected: 3, description: "Lights 1, 4, 9 are red" }
    ]
  },
  toys: {
    name: "Toys", 
    icon: "🎁",
    description: "Assign toys based on height comparison",
    difficulty: "Easy",
    complexity: "O(N)",
    category: "Arrays & Greedy",
    fullProblem: "People stand in a row. If a child is taller than EVERYONE to their right, they get a BLUE toy. Otherwise, they get a RED toy. Given N people's heights, determine how many of each toy color is needed.",
    hint: "Scan from right to left, tracking the maximum height!",
    example: "Heights [5,3,7,2]: Child with height 7 is tallest to the right → BLUE",
    testCases: [
      { input: [5,3,7,2,6,1,4], expected: { blue: 3, red: 4 }, description: "Mixed heights" },
      { input: [1,2,3,4,5], expected: { blue: 1, red: 4 }, description: "Ascending order" },
      { input: [5,4,3,2,1], expected: { blue: 5, red: 0 }, description: "Descending order" }
    ]
  },
  gold: {
    name: "Bags of Gold",
    icon: "💰",
    description: "Find the fake bag using binary search",
    difficulty: "Medium", 
    complexity: "O(log N)",
    category: "Binary Search",
    fullProblem: "You have N identical-looking bags. One contains SAND (lighter) instead of gold. Using a balance scale, find the fake bag in the minimum number of weighings.",
    hint: "Binary search: divide in half, weigh, eliminate half!",
    example: "8 bags → weigh 4 vs 4 → lighter side has fake → repeat",
    testCases: [
      { input: 8, expected: 3, description: "log₂(8) = 3 weighings" },
      { input: 16, expected: 4, description: "log₂(16) = 4 weighings" },
      { input: 32, expected: 5, description: "log₂(32) = 5 weighings" }
    ]
  },
  river: {
    name: "River Crossing",
    icon: "🚣",
    description: "Transport everyone safely across",
    difficulty: "Hard",
    complexity: "11 moves",
    category: "Logic & Puzzles",
    fullProblem: "3 orcs and 3 hobbits must cross a river. The boat holds MAX 2 people and needs someone to row. If orcs ever outnumber hobbits on either bank, the orcs eat the hobbits! Get everyone across safely.",
    hint: "Move orcs first to establish safety zones!",
    example: "Never leave 2 orcs with 1 hobbit on either bank",
    testCases: [
      { input: { orcs: 3, hobbits: 3 }, expected: 11, description: "Minimum moves: 11" }
    ]
  }
};

// Theme matching TSP visualizer's Matrix blue theme
const theme = {
  bg: 'rgba(0, 10, 20, 0.9)',
  panel: 'rgba(0, 10, 20, 0.95)',
  border: 'rgba(59, 130, 246, 0.3)',
  primary: '#3b82f6',
  primaryGlow: 'rgba(59, 130, 246, 0.6)',
  text: '#3b82f6',
  textLight: '#94a3b8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export default function AlgorithmVisualizer({ 
  isRunning: externalIsRunning = false, 
  speed: externalSpeed = 1,
  isDark = true 
}: AlgorithmVisualizerProps) {
  const [problem, setProblem] = useState<ProblemType>('lights');
  const [isPlaying, setIsPlaying] = useState(false);
  const [localSpeed, setLocalSpeed] = useState(1);
  const [showExplanation, setShowExplanation] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [showProblemStatement, setShowProblemStatement] = useState(true);
  const [userCode, setUserCode] = useState('');
  const [codeOutput, setCodeOutput] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  
  // Christmas Lights state
  const [lightsCount, setLightsCount] = useState(16);
  const [currentStep, setCurrentStep] = useState(0);
  const [lights, setLights] = useState<boolean[]>([]);
  const [switchingLights, setSwitchingLights] = useState<number[]>([]);
  const [factorExplanation, setFactorExplanation] = useState('');
  
  // Children & Toys state
  const [childrenHeights, setChildrenHeights] = useState([5, 3, 7, 2, 6, 1, 4]);
  const [toyColors, setToyColors] = useState<string[]>([]);
  const [currentChild, setCurrentChild] = useState(-1);
  const [comparisonExplanation, setComparisonExplanation] = useState('');
  
  // Bags of Gold state
  const [bagsCount, setBagsCount] = useState(8);
  const [fakeBag, setFakeBag] = useState(5);
  const [searchRange, setSearchRange] = useState({ left: 0, right: 7 });
  const [weighings, setWeighings] = useState<any[]>([]);
  const [foundBag, setFoundBag] = useState(-1);
  
  // River Crossing state
  const [leftBank, setLeftBank] = useState({ orcs: 3, hobbits: 3 });
  const [rightBank, setRightBank] = useState({ orcs: 0, hobbits: 0 });
  const [boat, setBoat] = useState<{ orcs: number; hobbits: number; position: BankPosition }>({ 
    orcs: 0, 
    hobbits: 0, 
    position: 'left' 
  });
  const [moves, setMoves] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external props
  useEffect(() => {
    setIsPlaying(externalIsRunning);
  }, [externalIsRunning]);

  useEffect(() => {
    setLocalSpeed(externalSpeed);
  }, [externalSpeed]);

  // Initialize Christmas Lights
  useEffect(() => {
    if (problem === 'lights') {
      const initialLights = Array(lightsCount).fill(false);
      setLights(initialLights);
      setCurrentStep(0);
      setSwitchingLights([]);
      setFactorExplanation('');
    }
  }, [lightsCount, problem]);

  // Initialize Children & Toys
  useEffect(() => {
    if (problem === 'toys') {
      const colors = calculateToyColors(childrenHeights);
      setToyColors(colors);
      setCurrentChild(-1);
    }
  }, [childrenHeights, problem]);

  // Calculate toy colors
  const calculateToyColors = (heights: number[]) => {
    const n = heights.length;
    const colors = new Array(n);
    
    for (let i = 0; i < n; i++) {
      let tallerThanAllRight = true;
      for (let j = i + 1; j < n; j++) {
        if (heights[j] >= heights[i]) {
          tallerThanAllRight = false;
          break;
        }
      }
      colors[i] = tallerThanAllRight ? 'blue' : 'red';
    }
    
    return colors;
  };

  // Step through Christmas Lights
  const stepLights = useCallback(() => {
    if (currentStep >= lightsCount) {
      setIsPlaying(false);
      return;
    }
    
    const nextStep = currentStep + 1;
    const factors = [];
    
    for (let i = 1; i <= lightsCount; i++) {
      if (nextStep % i === 0) {
        factors.push(i);
      }
    }
    
    const newLights = [...lights];
    factors.forEach(factor => {
      if (factor <= lightsCount) {
        newLights[factor - 1] = !newLights[factor - 1];
      }
    });
    
    setSwitchingLights(factors.map(f => f - 1));
    setLights(newLights);
    setCurrentStep(nextStep);
    
    const factorStr = factors.filter(f => f <= lightsCount).join(', ');
    setFactorExplanation(`Step ${nextStep}: Checking which lights divide ${nextStep} evenly → Factors: [${factorStr}] switch colors!`);
    
    setTimeout(() => setSwitchingLights([]), 500);
  }, [currentStep, lights, lightsCount]);

  // Step through Children & Toys
  const stepToys = useCallback(() => {
    if (currentChild >= childrenHeights.length - 1) {
      setIsPlaying(false);
      return;
    }
    
    const nextChild = currentChild + 1;
    setCurrentChild(nextChild);
    
    let tallerThanAll = true;
    let rightHeights = [];
    for (let j = nextChild + 1; j < childrenHeights.length; j++) {
      rightHeights.push(childrenHeights[j]);
      if (childrenHeights[j] >= childrenHeights[nextChild]) {
        tallerThanAll = false;
      }
    }
    
    if (rightHeights.length === 0) {
      setComparisonExplanation(`Child ${nextChild + 1} (height ${childrenHeights[nextChild]}) is last → Gets BLUE toy`);
    } else {
      setComparisonExplanation(
        `Child ${nextChild + 1} (height ${childrenHeights[nextChild]}) vs right side [${rightHeights.join(', ')}] → Gets ${tallerThanAll ? 'BLUE' : 'RED'} toy`
      );
    }
  }, [currentChild, childrenHeights]);

  // Binary search for gold
  const stepGold = useCallback(() => {
    if (searchRange.left > searchRange.right || foundBag !== -1) {
      setIsPlaying(false);
      return;
    }
    
    const mid = Math.floor((searchRange.left + searchRange.right) / 2);
    const newWeighing = {
      left: { start: searchRange.left, end: mid },
      right: { start: mid + 1, end: searchRange.right },
      result: fakeBag <= mid ? 'left' : 'right'
    };
    
    setWeighings([...weighings, newWeighing]);
    
    if (searchRange.left === searchRange.right) {
      setFoundBag(searchRange.left);
    } else if (fakeBag <= mid) {
      setSearchRange({ left: searchRange.left, right: mid });
    } else {
      setSearchRange({ left: mid + 1, right: searchRange.right });
    }
  }, [searchRange, fakeBag, weighings, foundBag]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const delay = 2200 - (localSpeed * 400); // Convert speed to delay
      intervalRef.current = setInterval(() => {
        switch (problem) {
          case 'lights':
            stepLights();
            break;
          case 'toys':
            stepToys();
            break;
          case 'gold':
            stepGold();
            break;
          default:
            break;
        }
      }, delay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, problem, localSpeed, stepLights, stepToys, stepGold]);

  // Reset functions
  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCurrentChild(-1);
    setWeighings([]);
    setFoundBag(-1);
    setSearchRange({ left: 0, right: bagsCount - 1 });
    setSwitchingLights([]);
    setFactorExplanation('');
    setComparisonExplanation('');
    setCodeOutput(null);
    
    if (problem === 'lights') {
      setLights(Array(lightsCount).fill(false));
    } else if (problem === 'river') {
      setLeftBank({ orcs: 3, hobbits: 3 });
      setRightBank({ orcs: 0, hobbits: 0 });
      setBoat({ orcs: 0, hobbits: 0, position: 'left' });
      setMoves([]);
      setGameOver(false);
      setVictory(false);
    }
  };

  // River crossing logic with proper typing
  const moveToBoat = (type: 'orcs' | 'hobbits', from: BankPosition) => {
    if (boat.orcs + boat.hobbits >= 2) return;
    
    if (from === 'left' && leftBank[type] > 0) {
      setLeftBank(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setBoat(prev => ({ ...prev, [type]: prev[type] + 1 }));
    } else if (from === 'right' && rightBank[type] > 0) {
      setRightBank(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setBoat(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
  };

  const moveFromBoat = (type: 'orcs' | 'hobbits', to: BankPosition) => {
    if (boat[type] === 0) return;
    
    if (to === 'left') {
      setLeftBank(prev => ({ ...prev, [type]: prev[type] + 1 }));
    } else {
      setRightBank(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
    setBoat(prev => ({ ...prev, [type]: prev[type] - 1 }));
  };

  const crossRiver = () => {
    if (boat.orcs + boat.hobbits === 0) return;
    
    const newPosition: BankPosition = boat.position === 'left' ? 'right' : 'left';
    setBoat(prev => ({ ...prev, position: newPosition }));
    
    const leftDanger = leftBank.hobbits > 0 && leftBank.orcs > leftBank.hobbits;
    const rightDanger = rightBank.hobbits > 0 && rightBank.orcs > rightBank.hobbits;
    
    if (leftDanger || rightDanger) {
      setGameOver(true);
    } else if (rightBank.orcs === 3 && rightBank.hobbits === 3) {
      setVictory(true);
    }
    
    setMoves(prev => [...prev, `${boat.orcs}O ${boat.hobbits}H → ${newPosition}`]);
  };

  // Test user code
  const testUserCode = () => {
    try {
      // Basic safety check - prevent infinite loops
      if (userCode.includes('while') && !userCode.includes('break')) {
        setCodeOutput({ 
          type: 'error', 
          message: 'Infinite loops are not allowed. Add a break condition.' 
        });
        return;
      }
      
      // Create a safe evaluation context
      const func = new Function('n', 'heights', 'Math', userCode);
      
      // Run test cases based on problem
      const currentProblem = PROBLEMS[problem];
      if (currentProblem.testCases) {
        let allPassed = true;
        let results = [];
        
        for (const testCase of currentProblem.testCases) {
          try {
            const result = func(testCase.input, null, Math);
            const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
            if (!passed) allPassed = false;
            results.push(`Test: ${testCase.description} - ${passed ? '✅' : '❌'}`);
          } catch (e) {
            allPassed = false;
            results.push(`Test: ${testCase.description} - ❌ Error`);
          }
        }
        
        setCodeOutput({
          type: allPassed ? 'success' : 'error',
          message: results.join('\n')
        });
      }
    } catch (error: any) {
      setCodeOutput({ 
        type: 'error', 
        message: `Error: ${error.message}` 
      });
    }
  };

  const algorithmCode: Record<ProblemType, string> = {
    lights: `// Christmas Lights Algorithm
function christmasLights(n) {
  let lights = new Array(n).fill(false); // all green
  
  for (let step = 1; step <= n; step++) {
    // Find all factors of current step
    for (let light = 1; light <= n; light++) {
      if (step % light === 0) {
        lights[light - 1] = !lights[light - 1];
      }
    }
  }
  
  // Count red lights (true values)
  return lights.filter(l => l).length;
}

// Optimized: Only perfect squares have odd factors
function efficientSolution(n) {
  return Math.floor(Math.sqrt(n));
}`,
    
    toys: `// Children & Toys Algorithm - O(N)
function assignToys(heights) {
  const n = heights.length;
  const toys = new Array(n);
  let maxFromRight = -1;
  
  // Traverse from right to left
  for (let i = n - 1; i >= 0; i--) {
    if (i === n - 1 || heights[i] > maxFromRight) {
      toys[i] = 'blue';
      maxFromRight = Math.max(maxFromRight, heights[i]);
    } else {
      toys[i] = 'red';
    }
  }
  
  return toys;
}`,
    
    gold: `// Binary Search for Fake Bag - O(log N)
function findFakeBag(n) {
  let left = 0, right = n - 1;
  
  while (left < right) {
    let mid = Math.floor((left + right) / 2);
    
    // Weigh bags [left...mid] vs [mid+1...right]
    if (leftSideIsLighter()) {
      right = mid; // Fake is in left half
    } else {
      left = mid + 1; // Fake is in right half
    }
  }
  
  return left; // Found the fake bag
}`,
    
    river: `// River Crossing Solution
const solution = [
  "2 Orcs cross →",
  "1 Orc returns ←",
  "2 Orcs cross →",
  "1 Orc returns ←",
  "2 Hobbits cross →",
  "1 Orc + 1 Hobbit return ←",
  "2 Hobbits cross →",
  "1 Orc returns ←",
  "2 Orcs cross →",
  "1 Orc returns ←",
  "2 Orcs cross →"
];`
  };

  const currentProblem = PROBLEMS[problem];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 32px',
        background: theme.panel,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px', 
          fontWeight: 700,
          color: theme.text,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }}>
          <Brain size={32} />
          Algorithm Class Problems
        </h1>
        
        <div style={{ 
          padding: '8px 16px',
          background: `${theme.primary}22`,
          borderRadius: '24px',
          fontSize: '14px',
          border: `1px solid ${theme.border}`,
          fontWeight: 500
        }}>
          {currentProblem.complexity} • {currentProblem.difficulty}
        </div>
        
        <div style={{ 
          marginLeft: 'auto',
          padding: '6px 12px',
          background: `${theme.warning}22`,
          borderRadius: '16px',
          fontSize: '13px',
          border: `1px solid ${theme.warning}40`,
          fontWeight: 500
        }}>
          {currentProblem.category}
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px', overflow: 'hidden' }}>
        {/* Main Visualization Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Problem Statement Panel */}
          {showProblemStatement && (
            <div style={{
              background: theme.panel,
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              padding: '20px',
              position: 'relative'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '20px',
                  color: theme.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Info size={20} />
                  Problem Statement
                </h2>
                <button
                  onClick={() => setShowProblemStatement(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.textLight,
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ×
                </button>
              </div>
              
              <p style={{ 
                margin: '0 0 12px 0',
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#fff'
              }}>
                {currentProblem.fullProblem}
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: '16px',
                paddingTop: '12px',
                borderTop: `1px solid ${theme.border}`
              }}>
                <div style={{
                  flex: 1,
                  padding: '10px',
                  background: `${theme.primary}15`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.primary}40`
                }}>
                  <div style={{ fontSize: '12px', color: theme.textLight, marginBottom: '4px' }}>
                    💡 Hint
                  </div>
                  <div style={{ fontSize: '13px', color: theme.primary }}>
                    {currentProblem.hint}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  padding: '10px',
                  background: `${theme.warning}15`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.warning}40`
                }}>
                  <div style={{ fontSize: '12px', color: theme.textLight, marginBottom: '4px' }}>
                    📝 Example
                  </div>
                  <div style={{ fontSize: '13px', color: theme.warning }}>
                    {currentProblem.example}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Visualization Canvas */}
          <div style={{ 
            flex: 1,
            background: theme.panel,
            borderRadius: '16px',
            border: `1px solid ${theme.border}`,
            padding: '24px',
            position: 'relative',
            overflow: 'auto'
          }}>
            {/* Christmas Lights Visualization */}
            {problem === 'lights' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 600,
                    color: theme.primary,
                    marginBottom: '16px'
                  }}>
                    Step {currentStep} of {lightsCount}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ color: theme.textLight }}>Number of Lights:</label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={lightsCount}
                      onChange={(e) => {
                        setLightsCount(Number(e.target.value));
                        reset();
                      }}
                      style={{ width: '150px', accentColor: theme.primary }}
                    />
                    <span style={{ 
                      fontFamily: 'monospace',
                      background: 'rgba(59, 130, 246, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`
                    }}>
                      {lightsCount}
                    </span>
                  </div>
                </div>
                
                {/* Lights Grid */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  {lights.map((isRed, idx) => (
                    <div
                      key={idx}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        transition: 'all 0.5s ease',
                        transform: switchingLights.includes(idx) ? 'scale(1.15)' : 'scale(1)',
                        background: isRed 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: switchingLights.includes(idx)
                          ? `0 0 30px ${isRed ? '#ef4444' : '#10b981'}`
                          : `0 0 15px ${isRed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        border: `2px solid ${isRed ? '#7f1d1d' : '#064e3b'}`
                      }}
                    >
                      <div style={{ fontSize: '28px' }}>
                        {isRed ? '🔴' : '🟢'}
                      </div>
                      <div style={{ fontSize: '16px', marginTop: '4px' }}>
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Factor Explanation */}
                {factorExplanation && (
                  <div style={{
                    background: `${theme.primary}15`,
                    border: `1px solid ${theme.primary}`,
                    borderRadius: '12px',
                    padding: '16px',
                    animation: 'fadeIn 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 600, color: theme.primary }}>
                      {factorExplanation}
                    </div>
                  </div>
                )}
                
                {/* Final Result */}
                {currentStep === lightsCount && (
                  <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                    borderRadius: '12px',
                    border: `1px solid ${theme.primary}`
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                      ✨ Final Result
                    </div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                      Red lights: <strong style={{ color: theme.danger }}>
                        {lights.filter(l => l).length}
                      </strong> at positions: {
                        lights.map((l, i) => l ? i + 1 : null).filter(x => x).join(', ')
                      }
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: theme.warning,
                      marginTop: '12px',
                      padding: '8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '6px'
                    }}>
                      💡 Notice: These are all perfect squares! (1, 4, 9, 16, 25...)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Children & Toys Visualization */}
            {problem === 'toys' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 600,
                    color: theme.primary,
                    marginBottom: '16px'
                  }}>
                    Assigning Toys Based on Height
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={childrenHeights.join(', ')}
                      onChange={(e) => {
                        const heights = e.target.value.split(',').map(h => parseInt(h.trim())).filter(h => !isNaN(h));
                        if (heights.length > 0) {
                          setChildrenHeights(heights);
                          reset();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                      placeholder="Enter heights: 5, 3, 7, 2, 6, 1, 4"
                    />
                    <button
                      onClick={() => {
                        const random = Array.from({length: 7}, () => Math.floor(Math.random() * 9) + 1);
                        setChildrenHeights(random);
                        reset();
                      }}
                      style={{
                        padding: '10px 16px',
                        background: `${theme.primary}22`,
                        border: `1px solid ${theme.primary}`,
                        borderRadius: '8px',
                        color: theme.primary,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      <Shuffle size={16} style={{ display: 'inline', marginRight: '4px' }} />
                      Random
                    </button>
                  </div>
                </div>
                
                {/* Children Visualization */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '16px',
                  minHeight: '300px',
                  marginBottom: '24px'
                }}>
                  {childrenHeights.map((height, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>
                        {idx <= currentChild ? (toyColors[idx] === 'blue' ? '🔵' : '🔴') : '❓'}
                      </div>
                      <div
                        style={{
                          width: '60px',
                          height: `${height * 30}px`,
                          background: idx === currentChild 
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          borderRadius: '8px 8px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#fff',
                          boxShadow: idx === currentChild 
                            ? '0 0 30px rgba(251, 191, 36, 0.5)'
                            : '0 4px 12px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {height}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        marginTop: '4px',
                        color: theme.textLight
                      }}>
                        Child {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Comparison Explanation */}
                {comparisonExplanation && (
                  <div style={{
                    background: `${theme.warning}15`,
                    border: `1px solid ${theme.warning}`,
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontWeight: 600, color: theme.warning }}>
                      {comparisonExplanation}
                    </div>
                  </div>
                )}
                
                {/* Result Summary */}
                {currentChild === childrenHeights.length - 1 && (
                  <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(239, 68, 68, 0.1))',
                    borderRadius: '12px',
                    border: `1px solid ${theme.primary}`
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                      📊 Distribution Results
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ 
                        padding: '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px'
                      }}>
                        🔵 Blue toys: <strong>{toyColors.filter(c => c === 'blue').length}</strong>
                      </div>
                      <div style={{ 
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px'
                      }}>
                        🔴 Red toys: <strong>{toyColors.filter(c => c === 'red').length}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bags of Gold Visualization */}
            {problem === 'gold' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 600,
                    color: theme.primary,
                    marginBottom: '16px'
                  }}>
                    Finding the Fake Bag with Binary Search
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ color: theme.textLight }}>Number of bags:</label>
                    <input
                      type="range"
                      min="4"
                      max="16"
                      value={bagsCount}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setBagsCount(count);
                        setFakeBag(Math.floor(Math.random() * count));
                        reset();
                      }}
                      style={{ width: '150px', accentColor: theme.primary }}
                    />
                    <span style={{ 
                      fontFamily: 'monospace',
                      background: 'rgba(59, 130, 246, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.border}`
                    }}>
                      {bagsCount}
                    </span>
                  </div>
                </div>
                
                {/* Bags Grid */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  {Array.from({ length: bagsCount }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        transform: foundBag === idx ? 'scale(1.2)' : 'scale(1)',
                        opacity: searchRange.left <= idx && idx <= searchRange.right ? 1 : 0.3,
                        background: foundBag === idx || (idx === fakeBag && foundBag !== -1)
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        boxShadow: foundBag === idx 
                          ? '0 0 30px rgba(239, 68, 68, 0.5)'
                          : '0 4px 12px rgba(0, 0, 0, 0.2)',
                        border: `2px solid ${foundBag === idx ? '#7f1d1d' : '#92400e'}`
                      }}
                    >
                      <div style={{ fontSize: '32px' }}>
                        {foundBag === idx || (idx === fakeBag && foundBag !== -1) ? '🏖️' : '💰'}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Weighing History */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    fontSize: '16px',
                    fontWeight: 600,
                    color: theme.textLight,
                    marginBottom: '12px'
                  }}>
                    ⚖️ Weighing History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {weighings.map((w, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                          Bags [{w.left.start + 1}-{w.left.end + 1}] vs [{w.right.start + 1}-{w.right.end + 1}]
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          background: w.result === 'left' 
                            ? 'rgba(239, 68, 68, 0.2)' 
                            : 'rgba(16, 185, 129, 0.2)',
                          color: w.result === 'left' ? theme.danger : theme.success
                        }}>
                          {w.result === 'left' ? '← Lighter' : 'Heavier →'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {foundBag !== -1 && (
                  <div style={{
                    padding: '20px',
                    background: `linear-gradient(135deg, ${theme.success}15, ${theme.success}05)`,
                    borderRadius: '12px',
                    border: `1px solid ${theme.success}`
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                      ✅ Found the Fake!
                    </div>
                    <div style={{ fontSize: '16px' }}>
                      Bag #{foundBag + 1} contains sand
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: theme.textLight,
                      marginTop: '8px'
                    }}>
                      Found in {weighings.length} weighings • O(log {bagsCount}) = {Math.ceil(Math.log2(bagsCount))} max weighings
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* River Crossing Visualization */}
            {problem === 'river' && (
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 600,
                  color: theme.primary,
                  marginBottom: '24px'
                }}>
                  Transport Everyone Safely
                </h2>
                
                {/* River Scene */}
                <div style={{
                  position: 'relative',
                  height: '400px',
                  background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0.2) 100%)',
                  borderRadius: '16px',
                  border: `1px solid ${theme.border}`,
                  padding: '20px'
                }}>
                  {/* Left Bank */}
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '20px',
                    bottom: '20px',
                    width: '30%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `2px solid ${theme.success}`
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      marginBottom: '16px',
                      color: theme.success
                    }}>
                      Left Bank
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {Array.from({ length: leftBank.orcs }).map((_, i) => (
                        <div 
                          key={`lo${i}`} 
                          style={{ 
                            fontSize: '32px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => moveToBoat('orcs', 'left')}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          👹
                        </div>
                      ))}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      {Array.from({ length: leftBank.hobbits }).map((_, i) => (
                        <div 
                          key={`lh${i}`} 
                          style={{ 
                            fontSize: '32px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => moveToBoat('hobbits', 'left')}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          🧙
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Boat */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: boat.position === 'left' ? '32%' : '52%',
                    transition: 'left 1s ease',
                    background: 'rgba(251, 191, 36, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `2px solid ${theme.warning}`,
                    minWidth: '120px'
                  }}>
                    <div style={{ textAlign: 'center', fontSize: '28px', marginBottom: '8px' }}>
                      🚣
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '4px',
                      minHeight: '40px'
                    }}>
                      {Array.from({ length: boat.orcs }).map((_, i) => (
                        <div 
                          key={`bo${i}`} 
                          style={{ fontSize: '24px', cursor: 'pointer' }}
                          onClick={() => moveFromBoat('orcs', boat.position)}
                        >
                          👹
                        </div>
                      ))}
                      {Array.from({ length: boat.hobbits }).map((_, i) => (
                        <div 
                          key={`bh${i}`} 
                          style={{ fontSize: '24px', cursor: 'pointer' }}
                          onClick={() => moveFromBoat('hobbits', boat.position)}
                        >
                          🧙
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={crossRiver}
                      disabled={boat.orcs + boat.hobbits === 0}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '8px',
                        background: boat.orcs + boat.hobbits === 0 
                          ? 'rgba(156, 163, 175, 0.2)'
                          : theme.primary,
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: boat.orcs + boat.hobbits === 0 ? 'not-allowed' : 'pointer',
                        opacity: boat.orcs + boat.hobbits === 0 ? 0.5 : 1
                      }}
                    >
                      Row {boat.position === 'left' ? '→' : '←'}
                    </button>
                  </div>
                  
                  {/* Right Bank */}
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '20px',
                    bottom: '20px',
                    width: '30%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `2px solid ${theme.success}`
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      marginBottom: '16px',
                      color: theme.success
                    }}>
                      Right Bank
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {Array.from({ length: rightBank.orcs }).map((_, i) => (
                        <div 
                          key={`ro${i}`} 
                          style={{ 
                            fontSize: '32px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => moveToBoat('orcs', 'right')}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          👹
                        </div>
                      ))}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      {Array.from({ length: rightBank.hobbits }).map((_, i) => (
                        <div 
                          key={`rh${i}`} 
                          style={{ 
                            fontSize: '32px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onClick={() => moveToBoat('hobbits', 'right')}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          🧙
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status Messages */}
                  {gameOver && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(127, 29, 29, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💀</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Game Over!
                        </div>
                        <div style={{ fontSize: '16px', color: theme.textLight }}>
                          The orcs ate the hobbits!
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {victory && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(6, 78, 59, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                          Victory!
                        </div>
                        <div style={{ fontSize: '16px', color: theme.textLight }}>
                          Everyone crossed safely!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Move History */}
                {moves.length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ 
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: theme.primary
                    }}>
                      Move History
                    </div>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {moves.map((move, i) => (
                        <div key={i} style={{
                          padding: '4px 8px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontFamily: 'monospace'
                        }}>
                          {i + 1}. {move}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div style={{
          width: '400px',
          background: theme.panel,
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}>
          {/* Problem Selector */}
          <div>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              color: theme.primary,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Target size={18} />
              Select Problem
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(Object.entries(PROBLEMS) as [ProblemType, typeof PROBLEMS[ProblemType]][]).map(([key, prob]) => (
                <button
                  key={key}
                  onClick={() => {
                    setProblem(key);
                    reset();
                  }}
                  style={{
                    padding: '16px',
                    background: problem === key 
                      ? `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${problem === key ? theme.primary : theme.border}`,
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: problem === key ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{prob.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{prob.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                    {prob.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Play Controls */}
          <div>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              color: theme.primary,
              marginBottom: '16px'
            }}>
              Controls
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: isPlaying ? theme.danger : theme.primary,
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={reset}
                style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: `2px solid ${theme.border}`,
                  borderRadius: '10px',
                  color: theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <RotateCcw size={22} />
              </button>
            </div>

            {/* Speed Control */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ 
                fontSize: '14px', 
                color: theme.textLight, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '8px'
              }}>
                <Zap size={16} />
                Speed: {localSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={localSpeed}
                onChange={(e) => setLocalSpeed(Number(e.target.value))}
                style={{ 
                  width: '100%',
                  accentColor: theme.primary
                }}
              />
            </div>
          </div>

          {/* View Options */}
          <div>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: 600,
              color: theme.primary,
              marginBottom: '16px'
            }}>
              View Options
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: showExplanation ? `${theme.primary}22` : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${showExplanation ? theme.primary : theme.border}`,
                  borderRadius: '10px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Lightbulb size={18} />
                Explain
              </button>
              
              <button
                onClick={() => setShowCode(!showCode)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: showCode ? `${theme.primary}22` : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${showCode ? theme.primary : theme.border}`,
                  borderRadius: '10px',
                  color: theme.text,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Code size={18} />
                Code
              </button>
            </div>
          </div>

          {/* Explanation Panel */}
          {showExplanation && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: theme.primary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Brain size={20} />
                Algorithm Insight
              </h3>
              
              {problem === 'lights' && (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: theme.textLight }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.primary }}>Key Pattern:</strong><br/>
                    Each light switches once for every factor it has.
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.warning }}>The Trick:</strong><br/>
                    Only perfect squares have an ODD number of factors (because one factor is repeated: √n × √n).
                  </div>
                  <div>
                    <strong style={{ color: theme.success }}>Solution:</strong><br/>
                    Count perfect squares ≤ N<br/>
                    Answer = ⌊√N⌋
                  </div>
                </div>
              )}
              
              {problem === 'toys' && (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: theme.textLight }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.primary }}>Naive Approach:</strong><br/>
                    Check each child against all to the right: O(N²)
                  </div>
                  <div>
                    <strong style={{ color: theme.success }}>Optimized:</strong><br/>
                    Scan right-to-left, track max height seen.<br/>
                    If current {'>'} max, give blue toy.<br/>
                    Time: O(N), Space: O(1)
                  </div>
                </div>
              )}
              
              {problem === 'gold' && (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: theme.textLight }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.primary }}>Strategy:</strong><br/>
                    Divide bags in half, weigh both groups.
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.warning }}>Key Insight:</strong><br/>
                    The lighter group contains the fake bag.
                  </div>
                  <div>
                    <strong style={{ color: theme.success }}>Complexity:</strong><br/>
                    Each weighing eliminates half.<br/>
                    Total weighings: log₂(N)
                  </div>
                </div>
              )}
              
              {problem === 'river' && (
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: theme.textLight }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.danger }}>Danger:</strong><br/>
                    Orcs {'>'} Hobbits on any bank = Game Over
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: theme.primary }}>Strategy:</strong><br/>
                    Move orcs first to establish safe zones.
                  </div>
                  <div>
                    <strong style={{ color: theme.success }}>Minimum Moves:</strong><br/>
                    11 crossings required for optimal solution.
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Code Panel */}
          {showCode && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${theme.border}`
            }}>
              <h3 style={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: theme.primary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Code size={20} />
                Implementation
              </h3>
              <pre style={{
                fontSize: '12px',
                lineHeight: 1.5,
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                <code style={{ color: '#10b981' }}>
                  {algorithmCode[problem]}
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}