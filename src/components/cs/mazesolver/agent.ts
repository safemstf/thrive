// src\components\cs\mazesolver\agent.ts
// ============================================================================
// RACING AGENT MODULE - FIXED VERSION
// ============================================================================
// Fixes memory leaks, performance issues, and state management bugs
// Proper integration with maze utilities and algorithms

import { AlgorithmResult } from './algorithms';

// ============================================================================
// FIXED INTERFACES - Simplified and Type-Safe
// ============================================================================

export interface AgentConfig {
  stepSpeed?: number;
  visualTrailLength?: number;
  animationStyle?: 'smooth' | 'discrete';
  enableProfiling?: boolean;
}

export interface AgentStats {
  totalSteps: number;
  exploredCells: number;
  pathLength: number;
  efficiency: number;
  completionTime?: number;
  memoryUsage?: number;
}

export interface HorseData {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  color: string;
  style: string;
  odds: string;
  bigO: string;
  description: string;
}

// ============================================================================
// FIXED RACING AGENT CLASS
// ============================================================================

export class RacingAgent {
  // ============================================================================
  // CORE PROPERTIES - Fixed memory management
  // ============================================================================
  
  // FIXED: Use readonly for immutable properties
  public readonly id: string;
  public readonly name: string;
  public readonly displayName: string;
  public readonly emoji: string;
  public readonly color: string;
  public readonly bigO: string;
  public readonly description: string;
  
  // FIXED: Optimized data storage
  private readonly algorithmResult: AlgorithmResult;
  private readonly config: Required<AgentConfig>;
  
  // FIXED: Efficient state tracking
  private currentStep: number = 0;
  private isFinished: boolean = false;
  private startTime: number | null = null;
  private finishTime: number | null = null;
  private lastStepTime: number = 0;
  
  // FIXED: Memory-efficient caching
  private cachedPosition: [number, number] | null = null;
  private cachedProgress: number = 0;
  private cacheValid: boolean = false;
  
  // ============================================================================
  // CONSTRUCTOR - Fixed initialization
  // ============================================================================
  
  constructor(
    id: string,
    name: string, 
    displayName: string,
    emoji: string,
    color: string,
    bigO: string,
    description: string,
    algorithmResult: AlgorithmResult,
    config: AgentConfig = {}
  ) {
    // FIXED: Validate inputs
    if (!id || !name || !algorithmResult) {
      throw new Error('Invalid agent configuration: missing required fields');
    }
    
    this.id = id;
    this.name = name;
    this.displayName = displayName;
    this.emoji = emoji;
    this.color = color;
    this.bigO = bigO;
    this.description = description;
    this.algorithmResult = Object.freeze(algorithmResult); // FIXED: Prevent mutation
    
    // FIXED: Proper default configuration
    this.config = {
      stepSpeed: 2.0,
      visualTrailLength: 8,
      animationStyle: 'smooth',
      enableProfiling: false,
      ...config
    };
    
    // FIXED: Initialize based on algorithm result
    this.isFinished = !algorithmResult.success || algorithmResult.path.length === 0;
    this.invalidateCache();
  }
  
  // ============================================================================
  // RACE CONTROL METHODS - Fixed state management
  // ============================================================================
  
  /**
   * FIXED: Start the agent's race with proper initialization
   */
  public startRace(): void {
    this.currentStep = 0;
    this.isFinished = !this.algorithmResult.success || this.algorithmResult.path.length === 0;
    this.startTime = performance.now();
    this.finishTime = null;
    this.lastStepTime = 0;
    this.invalidateCache();
    
    // FIXED: Memory profiling if enabled
    if (this.config.enableProfiling && 'memory' in performance) {
      console.log(`Agent ${this.id} started - Memory:`, (performance as any).memory);
    }
  }
  
  /**
   * FIXED: Advance the agent by one step with proper bounds checking
   */
  public step(): boolean {
    if (this.isFinished || !this.algorithmResult.success) {
      return false;
    }
    
    const currentTime = performance.now();
    this.lastStepTime = currentTime;
    
    // FIXED: Advance position with bounds checking
    const maxStep = this.algorithmResult.path.length - 1;
    if (this.currentStep >= maxStep) {
      this.finish(currentTime);
      return true;
    }
    
    this.currentStep = Math.min(this.currentStep + 1, maxStep);
    this.invalidateCache();
    
    // FIXED: Check if just finished
    if (this.currentStep >= maxStep) {
      this.finish(currentTime);
      return true;
    }
    
    return false;
  }
  
  /**
   * FIXED: Private method to handle finishing
   */
  private finish(currentTime: number): void {
    if (!this.isFinished) {
      this.isFinished = true;
      this.finishTime = currentTime;
      this.invalidateCache();
    }
  }
  
  /**
   * FIXED: Reset agent to starting position with cleanup
   */
  public reset(): void {
    this.currentStep = 0;
    this.isFinished = !this.algorithmResult.success || this.algorithmResult.path.length === 0;
    this.startTime = null;
    this.finishTime = null;
    this.lastStepTime = 0;
    this.invalidateCache();
  }
  
  // ============================================================================
  // OPTIMIZED CACHE MANAGEMENT
  // ============================================================================
  
  /**
   * FIXED: Invalidate cache when state changes
   */
  private invalidateCache(): void {
    this.cacheValid = false;
    this.cachedPosition = null;
    this.cachedProgress = 0;
  }
  
  /**
   * FIXED: Update cache efficiently
   */
  private updateCache(): void {
    if (this.cacheValid) return;
    
    // Cache position
    if (this.algorithmResult.success && this.algorithmResult.path.length > 0) {
      const index = Math.min(this.currentStep, this.algorithmResult.path.length - 1);
      this.cachedPosition = this.algorithmResult.path[index];
      
      // Cache progress
      this.cachedProgress = this.algorithmResult.path.length > 1 ? 
        (this.currentStep / (this.algorithmResult.path.length - 1)) * 100 : 0;
    } else {
      this.cachedPosition = null;
      this.cachedProgress = 0;
    }
    
    this.cacheValid = true;
  }
  
  // ============================================================================
  // STATE QUERIES - Fixed with caching and error handling
  // ============================================================================
  
  /**
   * FIXED: Get current position with caching
   */
  public getCurrentPosition(): [number, number] | null {
    this.updateCache();
    return this.cachedPosition;
  }
  
  /**
   * FIXED: Get race completion percentage with caching
   */
  public getProgress(): number {
    this.updateCache();
    return Math.min(Math.max(this.cachedProgress, 0), 100);
  }
  
  /**
   * FIXED: Check if agent has finished the race
   */
  public getIsFinished(): boolean {
    return this.isFinished;
  }
  
  /**
   * FIXED: Get completion time with validation
   */
  public getCompletionTime(): number | null {
    if (!this.isFinished || !this.startTime || !this.finishTime) {
      return null;
    }
    
    return Math.max(0, this.finishTime - this.startTime);
  }
  
  /**
   * FIXED: Get comprehensive racing statistics
   */
  public getStats(): AgentStats {
    const completionTime = this.getCompletionTime();
    
    // FIXED: Calculate efficiency safely
    const efficiency = this.algorithmResult.path.length > 0 && this.algorithmResult.explored.length > 0 ? 
      this.algorithmResult.path.length / this.algorithmResult.explored.length : 0;
    
    const stats: AgentStats = {
      totalSteps: Math.max(0, this.currentStep),
      exploredCells: Math.max(0, this.algorithmResult.explored.length),
      pathLength: Math.max(0, this.algorithmResult.path.length),
      efficiency: Math.min(Math.max(efficiency, 0), 1), // Clamp between 0 and 1
    };
    
    // FIXED: Add optional properties safely
    if (completionTime !== null) {
      stats.completionTime = completionTime;
    }
    
    // FIXED: Add memory usage if profiling enabled
    if (this.config.enableProfiling && 'memory' in performance) {
      stats.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    }
    
    return stats;
  }
  
  /**
   * FIXED: Get path positions for trail visualization with bounds checking
   */
  public getTrailPositions(): [number, number][] {
    if (!this.algorithmResult.success || this.currentStep === 0) {
      return [];
    }
    
    const maxLength = Math.min(this.config.visualTrailLength, this.currentStep + 1);
    const startIndex = Math.max(0, this.currentStep - maxLength + 1);
    const endIndex = Math.min(this.currentStep + 1, this.algorithmResult.path.length);
    
    // FIXED: Bounds checking
    if (startIndex >= endIndex || endIndex > this.algorithmResult.path.length) {
      return [];
    }
    
    return this.algorithmResult.path.slice(startIndex, endIndex);
  }
  
  /**
   * FIXED: Get explored cells with progressive revelation
   */
  public getVisibleExploration(): [number, number][] {
    if (!this.algorithmResult.success || this.algorithmResult.explored.length === 0) {
      return [];
    }
    
    // FIXED: Calculate exploration progress safely
    const totalPath = Math.max(1, this.algorithmResult.path.length - 1);
    const progressRatio = this.currentStep / totalPath;
    const explorationCount = Math.floor(progressRatio * this.algorithmResult.explored.length);
    
    // FIXED: Bounds checking
    const safeCount = Math.min(
      Math.max(0, explorationCount), 
      this.algorithmResult.explored.length
    );
    
    return this.algorithmResult.explored.slice(0, safeCount);
  }
  
  // ============================================================================
  // RENDERING METHODS - Fixed performance and safety
  // ============================================================================
  
  /**
   * FIXED: Render the agent on canvas with error handling
   */
  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    try {
      const position = this.getCurrentPosition();
      if (!position || cellSize <= 0) return;
      
      const [x, y] = position;
      const centerX = x * cellSize + cellSize / 2;
      const centerY = y * cellSize + cellSize / 2;
      const radius = Math.max(2, cellSize * 0.35);
      
      ctx.save();
      
      // FIXED: Glow effect with bounds checking
      this.renderGlow(ctx, radius);
      
      // FIXED: Agent body with proper error handling
      this.renderBody(ctx, centerX, centerY, radius);
      
      // FIXED: Winner effects
      if (this.isFinished) {
        this.renderWinnerEffects(ctx, centerX, centerY, radius, cellSize);
      }
      
      ctx.restore();
    } catch (error) {
      console.warn(`Error rendering agent ${this.id}:`, error);
    }
  }
  
  /**
   * FIXED: Private method for glow rendering
   */
  private renderGlow(ctx: CanvasRenderingContext2D, radius: number): void {
    if (this.isFinished) {
      const pulseIntensity = 1 + 0.3 * Math.sin(Date.now() * 0.01);
      ctx.shadowBlur = Math.min(radius * pulseIntensity, 50); // FIXED: Limit blur
      ctx.shadowColor = '#ffd700';
    } else {
      const pulseIntensity = 1 + 0.2 * Math.sin(Date.now() * 0.008);
      ctx.shadowBlur = Math.min(radius * 0.8 * pulseIntensity, 30); // FIXED: Limit blur
      ctx.shadowColor = this.color;
    }
  }
  
  /**
   * FIXED: Private method for body rendering
   */
  private renderBody(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number): void {
    // Main circular body
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight for 3D effect
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.arc(
      centerX - radius * 0.25, 
      centerY - radius * 0.25, 
      radius * 0.3, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Emoji with size limits
    const fontSize = Math.max(8, Math.min(radius * 1.2, 32)); // FIXED: Size limits
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(this.emoji, centerX, centerY);
  }
  
  /**
   * FIXED: Private method for winner effects
   */
  private renderWinnerEffects(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, cellSize: number): void {
    // Crown above winner
    const crownSize = Math.max(8, Math.min(cellSize * 0.4, 24)); // FIXED: Size limits
    ctx.font = `${crownSize}px Arial`;
    ctx.fillStyle = '#ffd700';
    ctx.fillText('👑', centerX, centerY - radius * 1.2);
    
    // Victory sparkles with limits
    const sparkleCount = 3;
    const sparkleSize = Math.max(6, Math.min(cellSize * 0.25, 16)); // FIXED: Size limits
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Date.now() * 0.005 + i * (Math.PI * 2 / sparkleCount)) % (Math.PI * 2);
      const sparkleRadius = radius * 1.5;
      const sparkleX = centerX + Math.cos(angle) * sparkleRadius;
      const sparkleY = centerY + Math.sin(angle) * sparkleRadius;
      
      ctx.fillStyle = '#ffd700';
      ctx.font = `${sparkleSize}px Arial`;
      ctx.fillText('✨', sparkleX, sparkleY);
    }
  }
  
  /**
   * FIXED: Render agent's exploration trail with optimization
   */
  public renderExploration(ctx: CanvasRenderingContext2D, cellSize: number, alpha: number = 0.1): void {
    try {
      const exploration = this.getVisibleExploration();
      if (exploration.length === 0 || cellSize <= 0) return;
      
      ctx.save();
      
      // FIXED: Batch rendering for performance
      const batchSize = 100; // Render in batches to prevent performance issues
      const totalBatches = Math.ceil(exploration.length / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const startIdx = batch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, exploration.length);
        
        exploration.slice(startIdx, endIdx).forEach(([x, y], relativeIndex) => {
          const absoluteIndex = startIdx + relativeIndex;
          // FIXED: Fade effect with bounds checking
          const fadeProgress = exploration.length > 1 ? 
            absoluteIndex / (exploration.length - 1) : 1;
          const cellAlpha = Math.min(Math.max(alpha * (0.3 + 0.7 * fadeProgress), 0), 1);
          
          ctx.globalAlpha = cellAlpha;
          ctx.fillStyle = this.color;
          ctx.fillRect(
            x * cellSize + 1, 
            y * cellSize + 1, 
            Math.max(1, cellSize - 2), 
            Math.max(1, cellSize - 2)
          );
        });
      }
      
      ctx.restore();
    } catch (error) {
      console.warn(`Error rendering exploration for agent ${this.id}:`, error);
      ctx.restore();
    }
  }
  
  /**
   * FIXED: Render agent's movement trail with performance optimization
   */
  public renderTrail(ctx: CanvasRenderingContext2D, cellSize: number): void {
    try {
      const trail = this.getTrailPositions();
      if (trail.length < 2 || cellSize <= 0) return;
      
      ctx.save();
      
      // FIXED: Create gradient trail with bounds checking
      const startPoint = trail[0];
      const endPoint = trail[trail.length - 1];
      
      if (!startPoint || !endPoint) return;
      
      const gradient = ctx.createLinearGradient(
        startPoint[0] * cellSize + cellSize / 2,
        startPoint[1] * cellSize + cellSize / 2,
        endPoint[0] * cellSize + cellSize / 2,
        endPoint[1] * cellSize + cellSize / 2
      );
      
      gradient.addColorStop(0, this.color + '20');
      gradient.addColorStop(1, this.color + '80');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1, Math.min(cellSize * 0.15, 8)); // FIXED: Line width limits
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = Math.min(4, cellSize * 0.2); // FIXED: Shadow limit
      ctx.shadowColor = this.color;
      
      ctx.beginPath();
      trail.forEach(([x, y], index) => {
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;
        
        if (index === 0) {
          ctx.moveTo(centerX, centerY);
        } else {
          ctx.lineTo(centerX, centerY);
        }
      });
      
      ctx.stroke();
      ctx.restore();
    } catch (error) {
      console.warn(`Error rendering trail for agent ${this.id}:`, error);
      ctx.restore();
    }
  }
  
  // ============================================================================
  // CLEANUP AND DISPOSAL
  // ============================================================================
  
  /**
   * FIXED: Cleanup method to prevent memory leaks
   */
  public dispose(): void {
    // Clear cached data
    this.invalidateCache();
    
    // Reset state
    this.currentStep = 0;
    this.isFinished = true;
    this.startTime = null;
    this.finishTime = null;
    this.lastStepTime = 0;
    
    // Log cleanup if profiling enabled
    if (this.config.enableProfiling) {
      console.log(`Agent ${this.id} disposed`);
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS - Fixed and Simplified
// ============================================================================

/**
 * FIXED: Create a racing agent with proper error handling
 */
export function createRacingAgent(
  horseData: HorseData,
  algorithmResult: AlgorithmResult,
  config?: AgentConfig
): RacingAgent {
  try {
    return new RacingAgent(
      horseData.id,
      horseData.name,
      horseData.displayName,
      horseData.emoji,
      horseData.color,
      horseData.bigO,
      horseData.description,
      algorithmResult,
      config
    );
  } catch (error) {
    console.error(`Failed to create racing agent for ${horseData.id}:`, error);
    throw error;
  }
}

/**
 * FIXED: Create multiple racing agents with validation
 */
export function createRacingTeam(
  horsesData: HorseData[],
  algorithmResults: AlgorithmResult[],
  config?: AgentConfig
): RacingAgent[] {
  // FIXED: Input validation
  if (!Array.isArray(horsesData) || !Array.isArray(algorithmResults)) {
    throw new Error('Invalid input: expected arrays for horses and results');
  }
  
  if (horsesData.length !== algorithmResults.length) {
    throw new Error(`Mismatch: ${horsesData.length} horses but ${algorithmResults.length} results`);
  }
  
  const agents: RacingAgent[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < horsesData.length; i++) {
    try {
      const agent = createRacingAgent(horsesData[i], algorithmResults[i], config);
      agents.push(agent);
    } catch (error) {
      errors.push(`Failed to create agent ${i}: ${error}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some agents failed to create:', errors);
  }
  
  if (agents.length === 0) {
    throw new Error('Failed to create any racing agents');
  }
  
  return agents;
}

/**
 * FIXED: Cleanup multiple agents
 */
export function disposeRacingTeam(agents: RacingAgent[]): void {
  if (!Array.isArray(agents)) return;
  
  agents.forEach(agent => {
    try {
      agent.dispose();
    } catch (error) {
      console.warn(`Error disposing agent ${agent.id}:`, error);
    }
  });
}