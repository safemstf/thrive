// ============================================================================
// MAZE ENVIRONMENT RENDERER - FIXED VERSION
// ============================================================================
// Fixes rendering issues, performance problems, and memory leaks
// Professional-grade canvas operations with error handling

import React, { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// FIXED INTERFACES AND TYPES
// ============================================================================

export interface DrawMazeOptions {
  wallColor?: string;
  floorColor?: string;
  startColor?: string;
  goalColor?: string;
  showGrid?: boolean;
  gridLineWidth?: number;
  imageSmoothing?: boolean;
  showShadows?: boolean;
  animate?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface RenderStats {
  renderTime: number;
  cellsRendered: number;
  canvasSize: [number, number];
  dpr: number;
}

// FIXED: Safe default options with validation
const DEFAULT_OPTIONS: Required<DrawMazeOptions> = {
  wallColor: '#2d3748',
  floorColor: '#edf2f7',
  startColor: '#38a169',
  goalColor: '#d53f8c',
  showGrid: false,
  gridLineWidth: 0.5,
  imageSmoothing: false,
  showShadows: true,
  animate: false,
  quality: 'medium'
};

// ============================================================================
// UTILITY FUNCTIONS - Fixed and Optimized
// ============================================================================

/**
 * FIXED: Validate canvas context with error handling
 */
function validateCanvasContext(ctx: CanvasRenderingContext2D | null): CanvasRenderingContext2D {
  if (!ctx) {
    throw new Error('Canvas context is null or undefined');
  }
  return ctx;
}

/**
 * FIXED: Validate maze data with comprehensive checks
 */
function validateMazeData(maze: number[][]): void {
  if (!Array.isArray(maze)) {
    throw new Error('Maze must be an array');
  }
  
  if (maze.length === 0) {
    throw new Error('Maze cannot be empty');
  }
  
  if (!Array.isArray(maze[0])) {
    throw new Error('Maze rows must be arrays');
  }
  
  if (maze[0].length === 0) {
    throw new Error('Maze rows cannot be empty');
  }
  
  const width = maze[0].length;
  
  for (let y = 0; y < maze.length; y++) {
    if (!Array.isArray(maze[y])) {
      throw new Error(`Maze row ${y} is not an array`);
    }
    
    if (maze[y].length !== width) {
      throw new Error(`Maze row ${y} has inconsistent width`);
    }
    
    for (let x = 0; x < width; x++) {
      const cell = maze[y][x];
      if (cell !== 0 && cell !== 1) {
        throw new Error(`Invalid cell value at (${x}, ${y}): ${cell}`);
      }
    }
  }
}

/**
 * FIXED: Validate position coordinates
 */
function validatePosition(pos: [number, number], maze: number[][], name: string): void {
  const [x, y] = pos;
  
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error(`${name} position coordinates must be integers: (${x}, ${y})`);
  }
  
  if (x < 0 || x >= maze[0].length || y < 0 || y >= maze.length) {
    throw new Error(`${name} position out of bounds: (${x}, ${y})`);
  }
}

/**
 * FIXED: Clamp position to maze bounds
 */
function clampPosition(pos: [number, number], maze: number[][]): [number, number] {
  const [x, y] = pos;
  const width = maze[0]?.length || 0;
  const height = maze.length;
  
  return [
    Math.max(0, Math.min(x, width - 1)),
    Math.max(0, Math.min(y, height - 1))
  ];
}

/**
 * FIXED: Safe color parsing and validation
 */
function validateColor(color: string, fallback: string): string {
  if (typeof color !== 'string' || color.length === 0) {
    return fallback;
  }
  
  // Basic color validation (hex, rgb, rgba, named colors)
  const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+).*$/;
  return colorRegex.test(color) ? color : fallback;
}

/**
 * FIXED: Round rectangle helper with error handling
 */
function roundRect(
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  r: number, 
  fill: boolean = true, 
  stroke: boolean = false
): void {
  try {
    const radius = Math.min(Math.max(0, r), w / 2, h / 2);
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
    
  } catch (error) {
    console.warn('Error drawing rounded rectangle:', error);
    // Fallback to regular rectangle
    if (fill) ctx.fillRect(x, y, w, h);
    if (stroke) ctx.strokeRect(x, y, w, h);
  }
}

// ============================================================================
// MAIN DRAWING FUNCTION - Fixed and Optimized
// ============================================================================

export function drawMaze(
  ctx: CanvasRenderingContext2D | null,
  maze: number[][],
  cellSize: number,
  start: [number, number],
  goal: [number, number],
  options?: Partial<DrawMazeOptions>
): RenderStats {
  const startTime = performance.now();
  
  try {
    // FIXED: Validate inputs
    const validCtx = validateCanvasContext(ctx);
    validateMazeData(maze);
    
    if (cellSize <= 0 || !Number.isFinite(cellSize)) {
      throw new Error(`Invalid cell size: ${cellSize}`);
    }
    
    // FIXED: Merge options safely
    const opts: Required<DrawMazeOptions> = { ...DEFAULT_OPTIONS };
    if (options) {
      Object.keys(options).forEach(key => {
        const optKey = key as keyof DrawMazeOptions;
        if (options[optKey] !== undefined) {
          (opts as any)[optKey] = options[optKey];
        }
      });
    }
    
    // FIXED: Validate colors
    opts.wallColor = validateColor(opts.wallColor, DEFAULT_OPTIONS.wallColor);
    opts.floorColor = validateColor(opts.floorColor, DEFAULT_OPTIONS.floorColor);
    opts.startColor = validateColor(opts.startColor, DEFAULT_OPTIONS.startColor);
    opts.goalColor = validateColor(opts.goalColor, DEFAULT_OPTIONS.goalColor);
    
    // FIXED: Clamp positions to valid ranges
    const safeStart = clampPosition(start, maze);
    const safeGoal = clampPosition(goal, maze);
    
    const width = maze[0].length * cellSize;
    const height = maze.length * cellSize;
    
    // FIXED: Setup canvas with error handling
    try {
      validCtx.imageSmoothingEnabled = opts.imageSmoothing;
      validCtx.clearRect(0, 0, width, height);
    } catch (error) {
      console.warn('Error setting up canvas:', error);
    }
    
    validCtx.save();
    
    // FIXED: Performance optimization based on quality setting
    const shouldUseGradients = opts.quality !== 'low';
    const shouldUseShadows = opts.showShadows && opts.quality === 'high';
    
    // ============================================================================
    // BACKGROUND RENDERING
    // ============================================================================
    
    try {
      if (shouldUseGradients) {
        const bgGradient = validCtx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, opts.floorColor);
        bgGradient.addColorStop(1, 'rgba(255,255,255,0.025)');
        validCtx.fillStyle = bgGradient;
      } else {
        validCtx.fillStyle = opts.floorColor;
      }
      
      validCtx.fillRect(0, 0, width, height);
    } catch (error) {
      console.warn('Error rendering background:', error);
    }
    
    // ============================================================================
    // MAZE CELLS RENDERING - Optimized batching
    // ============================================================================
    
    let cellsRendered = 0;
    
    try {
      // FIXED: Batch wall rendering for performance
      const wallCells: Array<{x: number, y: number}> = [];
      
      for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
          if (maze[y][x] === 1) {
            wallCells.push({x, y});
          }
        }
      }
      
      // Render walls with optimizations
      validCtx.fillStyle = opts.wallColor;
      
      if (shouldUseShadows) {
        validCtx.shadowColor = 'rgba(0,0,0,0.3)';
        validCtx.shadowBlur = 2;
        validCtx.shadowOffsetX = 1;
        validCtx.shadowOffsetY = 1;
      }
      
      for (const {x, y} of wallCells) {
        const px = x * cellSize;
        const py = y * cellSize;
        
        if (opts.quality === 'high') {
          const inset = Math.max(1, cellSize * 0.08);
          roundRect(validCtx, px, py, cellSize, cellSize, Math.max(2, cellSize * 0.08), true, false);
          
          // Top highlight
          validCtx.fillStyle = 'rgba(255,255,255,0.02)';
          roundRect(validCtx, px + inset, py + inset, cellSize - inset * 2, cellSize / 2 - inset, Math.max(1, cellSize * 0.06), true, false);
          
          // Inner shadow
          validCtx.fillStyle = 'rgba(0,0,0,0.06)';
          roundRect(validCtx, px + inset, py + cellSize / 2, cellSize - inset * 2, cellSize / 2 - inset, Math.max(1, cellSize * 0.06), true, false);
          
          validCtx.fillStyle = opts.wallColor;
        } else {
          validCtx.fillRect(px, py, cellSize, cellSize);
        }
        
        cellsRendered++;
      }
      
      if (shouldUseShadows) {
        validCtx.shadowBlur = 0;
        validCtx.shadowOffsetX = 0;
        validCtx.shadowOffsetY = 0;
      }
      
    } catch (error) {
      console.warn('Error rendering maze cells:', error);
    }
    
    // ============================================================================
    // GRID RENDERING (Optional)
    // ============================================================================
    
    if (opts.showGrid) {
      try {
        validCtx.strokeStyle = 'rgba(0,0,0,0.03)';
        validCtx.lineWidth = Math.max(0.5, opts.gridLineWidth);
        
        validCtx.beginPath();
        
        // Vertical lines
        for (let x = 0; x <= maze[0].length; x++) {
          const px = x * cellSize + 0.5;
          validCtx.moveTo(px, 0);
          validCtx.lineTo(px, height);
        }
        
        // Horizontal lines
        for (let y = 0; y <= maze.length; y++) {
          const py = y * cellSize + 0.5;
          validCtx.moveTo(0, py);
          validCtx.lineTo(width, py);
        }
        
        validCtx.stroke();
      } catch (error) {
        console.warn('Error rendering grid:', error);
      }
    }
    
    // ============================================================================
    // START AND GOAL MARKERS
    // ============================================================================
    
    try {
      const [sx, sy] = safeStart;
      const [gx, gy] = safeGoal;
      
      if (shouldUseShadows) {
        validCtx.shadowBlur = Math.max(2, cellSize * 0.08);
        validCtx.shadowColor = 'rgba(0,0,0,0.12)';
      }
      
      // Start marker
      validCtx.fillStyle = opts.startColor;
      if (opts.quality === 'high') {
        roundRect(validCtx, sx * cellSize, sy * cellSize, cellSize, cellSize, Math.max(2, cellSize * 0.12), true, false);
      } else {
        validCtx.fillRect(sx * cellSize, sy * cellSize, cellSize, cellSize);
      }
      
      // Goal marker
      validCtx.fillStyle = opts.goalColor;
      if (opts.quality === 'high') {
        roundRect(validCtx, gx * cellSize, gy * cellSize, cellSize, cellSize, Math.max(2, cellSize * 0.12), true, false);
      } else {
        validCtx.fillRect(gx * cellSize, gy * cellSize, cellSize, cellSize);
      }
      
      if (shouldUseShadows) {
        validCtx.shadowBlur = 0;
      }
      
    } catch (error) {
      console.warn('Error rendering start/goal markers:', error);
    }
    
    validCtx.restore();
    
    const renderTime = performance.now() - startTime;
    const dpr = window.devicePixelRatio || 1;
    
    return {
      renderTime,
      cellsRendered,
      canvasSize: [width, height],
      dpr
    };
    
  } catch (error) {
    console.error('Critical error in drawMaze:', error);
    
    // FIXED: Return safe fallback stats
    return {
      renderTime: performance.now() - startTime,
      cellsRendered: 0,
      canvasSize: [0, 0],
      dpr: 1
    };
  }
}

// ============================================================================
// REACT COMPONENT WRAPPERS - Fixed and Optimized
// ============================================================================

interface MazeEnvironmentProps {
  ctx: CanvasRenderingContext2D | null;
  maze: number[][];
  cellSize: number;
  start: [number, number];
  goal: [number, number];
  options?: Partial<DrawMazeOptions>;
  onRenderComplete?: (stats: RenderStats) => void;
}

/**
 * FIXED: React component wrapper with proper lifecycle management
 */
const MazeEnvironment: React.FC<MazeEnvironmentProps> = ({ 
  ctx, 
  maze, 
  cellSize, 
  start, 
  goal, 
  options,
  onRenderComplete
}) => {
  const isRenderingRef = useRef(false);
  
  const render = useCallback(() => {
    if (isRenderingRef.current) return;
    
    try {
      isRenderingRef.current = true;
      const stats = drawMaze(ctx, maze, cellSize, start, goal, options);
      onRenderComplete?.(stats);
    } catch (error) {
      console.error('Error in MazeEnvironment render:', error);
    } finally {
      isRenderingRef.current = false;
    }
  }, [ctx, maze, cellSize, start, goal, options, onRenderComplete]);
  
  useEffect(() => {
    render();
  }, [render]);
  
  return null;
};

export default MazeEnvironment;

// ============================================================================
// DPR-AWARE CANVAS WRAPPER - Fixed Memory Management
// ============================================================================

interface MazeEnvironmentFromCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  maze: number[][];
  cellSize: number;
  start: [number, number];
  goal: [number, number];
  options?: Partial<DrawMazeOptions>;
  onRenderComplete?: (stats: RenderStats) => void;
}

/**
 * FIXED: DPR-aware canvas wrapper with memory leak prevention
 */
export function MazeEnvironmentFromCanvas({
  canvasRef,
  maze,
  cellSize,
  start,
  goal,
  options,
  onRenderComplete
}: MazeEnvironmentFromCanvasProps) {
  const renderRequestRef = useRef<number | null>(null);
  const isRenderingRef = useRef(false);
  
  const performRender = useCallback(() => {
    if (isRenderingRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      isRenderingRef.current = true;
      
      // FIXED: Proper DPR handling with bounds checking
      const dpr = Math.min(window.devicePixelRatio || 1, 3); // Cap DPR to prevent memory issues
      const width = Math.max(1, (maze[0]?.length || 0) * cellSize);
      const height = Math.max(1, maze.length * cellSize);
      
      // FIXED: Set canvas size safely
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      
      // FIXED: Scale context properly
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      const stats = drawMaze(ctx, maze, cellSize, start, goal, options);
      onRenderComplete?.(stats);
      
    } catch (error) {
      console.error('Error in MazeEnvironmentFromCanvas:', error);
    } finally {
      isRenderingRef.current = false;
    }
  }, [canvasRef, maze, cellSize, start, goal, options, onRenderComplete]);
  
  useEffect(() => {
    // FIXED: Cancel previous render request
    if (renderRequestRef.current) {
      cancelAnimationFrame(renderRequestRef.current);
    }
    
    // FIXED: Schedule render on next frame
    renderRequestRef.current = requestAnimationFrame(performRender);
    
    return () => {
      if (renderRequestRef.current) {
        cancelAnimationFrame(renderRequestRef.current);
      }
    };
  }, [performRender]);
  
  // FIXED: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderRequestRef.current) {
        cancelAnimationFrame(renderRequestRef.current);
      }
    };
  }, []);
  
  return null;
}

// ============================================================================
// CANVAS UTILITIES - Additional Helper Functions
// ============================================================================

/**
 * FIXED: Clear canvas safely
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  try {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  } catch (error) {
    console.warn('Error clearing canvas:', error);
  }
}

/**
 * FIXED: Resize canvas with proper DPR handling
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement, 
  width: number, 
  height: number,
  maxDPR: number = 2
): void {
  try {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  } catch (error) {
    console.warn('Error resizing canvas:', error);
  }
}

/**
 * FIXED: Get canvas rendering stats
 */
export function getCanvasStats(canvas: HTMLCanvasElement): {
  displaySize: [number, number];
  actualSize: [number, number];
  dpr: number;
  memoryUsage: number;
} {
  const displayWidth = parseInt(canvas.style.width) || 0;
  const displayHeight = parseInt(canvas.style.height) || 0;
  const actualWidth = canvas.width;
  const actualHeight = canvas.height;
  const dpr = actualWidth / displayWidth || 1;
  const memoryUsage = actualWidth * actualHeight * 4; // 4 bytes per pixel (RGBA)
  
  return {
    displaySize: [displayWidth, displayHeight],
    actualSize: [actualWidth, actualHeight],
    dpr,
    memoryUsage
  };
}