'use client'
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { 
  Play, Pause, RotateCcw, Palette, Info, ZoomIn, ZoomOut, Grid3X3, 
  Download, Upload, Camera, Maximize, Mouse, Brush, Eraser, History,
  BarChart3, Settings, Save, FolderOpen, Copy, Share2, Sparkles
} from "lucide-react";

// Constants
const INITIAL_CANVAS_W = 800;
const INITIAL_CANVAS_H = 600;
const INITIAL_CELL_SIZE = 6;

// Types
type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type Cell = { 
  alive: boolean; 
  rgb?: RGB; 
  age?: number;
  trail?: number;
  energy?: number;
};

type ColorMode = "none" | "age" | "rainbow" | "heat" | "energy" | "blend" | "trails";
type RenderMode = "classic" | "impressionist" | "flowy" | "arcade" | "particle" | "organic";
type DrawMode = "draw" | "erase";
type BoundaryType = "toroidal" | "fixed" | "reflective";
type Variant = "conway" | "highlife" | "daynight" | "seeds" | "coral" | "amoeba" | "life34" | "diamoeba" | "maze" | "fredkin";

type Pattern = { 
  name: string; 
  matrix: number[][]; 
  category: string;
  description: string;
};

// Fixed Props interface to match what's being passed
interface Props {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
}

interface RuleSet {
  birth: number[];
  survive: number[];
}

// Optimized rule definitions using lookup tables
const RULES_LOOKUP: Record<Variant, RuleSet> = {
  conway: { birth: [3], survive: [2, 3] },
  highlife: { birth: [3, 6], survive: [2, 3] },
  daynight: { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
  seeds: { birth: [2], survive: [] },
  coral: { birth: [3], survive: [4, 5, 6, 7, 8] },
  amoeba: { birth: [3, 5, 7], survive: [1, 3, 5, 8] },
  life34: { birth: [3, 4], survive: [3, 4] },
  diamoeba: { birth: [3, 4, 5, 6, 7, 8], survive: [5, 6, 7, 8] },
  maze: { birth: [3], survive: [1, 2, 3, 4, 5] },
  fredkin: { birth: [1, 3, 5, 7], survive: [1, 3, 5, 7] }
};

// Patterns library (simplified for performance)
const PATTERNS: Pattern[] = [
  { name: "Blinker", category: "oscillators", description: "Period-2", matrix: [[0,1,0],[0,1,0],[0,1,0]] },
  { name: "Glider", category: "spaceships", description: "Diagonal", matrix: [[0,1,0],[0,0,1],[1,1,1]] },
  { name: "Block", category: "still", description: "2×2 still", matrix: [[1,1],[1,1]] },
  { name: "R-pentomino", category: "methuselahs", description: "Chaotic", matrix: [[0,1,1],[1,1,0],[0,1,0]] }
];

// Performance optimized component
export default function OptimizedLifeSimulation({ 
  isDark = false, 
  isRunning: externalIsRunning = false,
  speed: externalSpeed = 1 
}: Props) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gridRef = useRef<Uint8Array | null>(null);
  const colorDataRef = useRef<Uint32Array | null>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  
  // State
  const [canvasSize] = useState({ w: INITIAL_CANVAS_W, h: INITIAL_CANVAS_H });
  const [cellSize, setCellSize] = useState(INITIAL_CELL_SIZE);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [colorMode, setColorMode] = useState<ColorMode>("rainbow");
  const [renderMode, setRenderMode] = useState<RenderMode>("classic");
  const [variant, setVariant] = useState<Variant>("conway");
  const [showGrid, setShowGrid] = useState(false);
  const [isPlaying, setIsPlaying] = useState(externalIsRunning);
  const [simSpeed, setSimSpeed] = useState(externalSpeed);
  
  // Computed dimensions
  const COLS = Math.floor(canvasSize.w / cellSize);
  const ROWS = Math.floor(canvasSize.h / cellSize);
  const GRID_SIZE = ROWS * COLS;
  
  // Sync with external props
  useEffect(() => {
    setIsPlaying(externalIsRunning);
  }, [externalIsRunning]);
  
  useEffect(() => {
    setSimSpeed(externalSpeed);
  }, [externalSpeed]);
  
  // Initialize typed arrays for performance
  const initializeGrid = useCallback(() => {
    gridRef.current = new Uint8Array(GRID_SIZE);
    colorDataRef.current = new Uint32Array(GRID_SIZE);
    
    // Random initialization
    for (let i = 0; i < GRID_SIZE; i++) {
      if (Math.random() > 0.7) {
        gridRef.current[i] = 1;
        colorDataRef.current[i] = 0xFF000000 | (Math.random() * 0xFFFFFF);
      }
    }
    
    setGeneration(0);
    countPopulation();
  }, [GRID_SIZE]);
  
  // Optimized population counting
  const countPopulation = useCallback(() => {
    if (!gridRef.current) return;
    let count = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
      if (gridRef.current[i] > 0) count++;
    }
    setPopulation(count);
  }, [GRID_SIZE]);
  
  // Optimized neighbor counting with boundary conditions
  const getNeighborCount = useCallback((index: number): number => {
    if (!gridRef.current) return 0;
    
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    let count = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        let nr = row + dr;
        let nc = col + dc;
        
        // Toroidal boundary
        nr = (nr + ROWS) % ROWS;
        nc = (nc + COLS) % COLS;
        
        const neighborIndex = nr * COLS + nc;
        if (gridRef.current[neighborIndex] > 0) count++;
      }
    }
    
    return count;
  }, [ROWS, COLS]);
  
  // Optimized grid update using typed arrays
  const updateGrid = useCallback(() => {
    if (!gridRef.current) return;
    
    const newGrid = new Uint8Array(GRID_SIZE);
    const rules = RULES_LOOKUP[variant];
    
    for (let i = 0; i < GRID_SIZE; i++) {
      const alive = gridRef.current[i] > 0;
      const neighbors = getNeighborCount(i);
      
      const shouldLive = alive 
        ? rules.survive.includes(neighbors)
        : rules.birth.includes(neighbors);
      
      if (shouldLive) {
        newGrid[i] = alive ? Math.min(255, gridRef.current[i] + 1) : 1;
      }
    }
    
    gridRef.current = newGrid;
    setGeneration(g => g + 1);
    countPopulation();
  }, [GRID_SIZE, variant, getNeighborCount, countPopulation]);
  
  // Optimized rendering using ImageData
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !gridRef.current) return;
    
    // Clear canvas
    ctx.fillStyle = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create ImageData for batch rendering
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    // Render cells
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const gridIndex = row * COLS + col;
        const cell = gridRef.current[gridIndex];
        
        if (cell > 0) {
          const x = col * cellSize;
          const y = row * cellSize;
          
          // Calculate color based on mode
          let r = 0, g = 0, b = 0;
          
          switch (colorMode) {
            case "age":
              const hue = (cell * 15) % 360;
              [r, g, b] = hslToRgb(hue / 360, 0.7, 0.6);
              break;
            case "rainbow":
              const rainbowHue = (cell * 12) % 360;
              [r, g, b] = hslToRgb(rainbowHue / 360, 0.8, 0.5);
              break;
            case "heat":
              const heat = Math.min(1, cell / 20);
              r = Math.floor(255 * heat);
              g = Math.floor(255 * (1 - heat) * heat * 4);
              b = Math.floor(50 * (1 - heat));
              break;
            default:
              r = isDark ? 74 : 34;
              g = isDark ? 222 : 197;
              b = isDark ? 128 : 94;
          }
          
          // Draw cell pixels directly to ImageData
          for (let py = 0; py < cellSize; py++) {
            for (let px = 0; px < cellSize; px++) {
              const pixelIndex = ((y + py) * canvas.width + (x + px)) * 4;
              data[pixelIndex] = r;
              data[pixelIndex + 1] = g;
              data[pixelIndex + 2] = b;
              data[pixelIndex + 3] = 255;
            }
          }
        }
      }
    }
    
    // Batch render all pixels at once
    ctx.putImageData(imageData, 0, 0);
    
    // Draw grid if enabled
    if (showGrid && cellSize >= 4) {
      ctx.strokeStyle = isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      
      for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      ctx.stroke();
    }
  }, [ROWS, COLS, cellSize, colorMode, isDark, showGrid]);
  
  // Optimized animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;
      
      if (elapsed >= 100 / simSpeed) {
        updateGrid();
        lastUpdateRef.current = timestamp;
      }
      
      render();
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, simSpeed, updateGrid, render]);
  
  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
      initializeGrid();
      render();
    }
  }, [initializeGrid, render]);
  
  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !gridRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      const index = row * COLS + col;
      gridRef.current[index] = gridRef.current[index] > 0 ? 0 : 1;
      countPopulation();
      render();
    }
  }, [cellSize, ROWS, COLS, countPopulation, render]);
  
  // Load pattern
  const loadPattern = useCallback((pattern: Pattern) => {
    if (!gridRef.current) return;
    
    // Clear grid
    gridRef.current.fill(0);
    
    const centerX = Math.floor(COLS / 2);
    const centerY = Math.floor(ROWS / 2);
    const offsetX = Math.floor(pattern.matrix[0].length / 2);
    const offsetY = Math.floor(pattern.matrix.length / 2);
    
    for (let r = 0; r < pattern.matrix.length; r++) {
      for (let c = 0; c < pattern.matrix[0].length; c++) {
        const gridRow = centerY - offsetY + r;
        const gridCol = centerX - offsetX + c;
        
        if (gridRow >= 0 && gridRow < ROWS && gridCol >= 0 && gridCol < COLS) {
          const index = gridRow * COLS + gridCol;
          gridRef.current[index] = pattern.matrix[r][c];
        }
      }
    }
    
    setGeneration(0);
    countPopulation();
    render();
  }, [ROWS, COLS, countPopulation, render]);
  
  // Helper function for HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };
  
  const containerStyle = {
    minHeight: '100vh',
    padding: '1rem',
    background: isDark 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    color: isDark ? '#f8fafc' : '#1e293b'
  };
  
  const cardStyle = {
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
  };
  
  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };
  
  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Cellular Automata
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.8 }}>
            High-performance Conway's Game of Life simulation
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Main Canvas */}
          <div style={cardStyle}>
            {/* Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  ...buttonStyle,
                  backgroundColor: isPlaying ? '#ef4444' : '#22c55e',
                  color: 'white'
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={initializeGrid}
                style={{
                  ...buttonStyle,
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  color: isDark ? '#f9fafb' : '#374151'
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
              
              <button
                onClick={() => setCellSize(Math.max(2, cellSize - 1))}
                style={{
                  ...buttonStyle,
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  color: isDark ? '#f9fafb' : '#374151'
                }}
              >
                <ZoomOut size={16} />
              </button>
              
              <span style={{ padding: '0.5rem', fontSize: '0.875rem' }}>{cellSize}px</span>
              
              <button
                onClick={() => setCellSize(Math.min(20, cellSize + 1))}
                style={{
                  ...buttonStyle,
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  color: isDark ? '#f9fafb' : '#374151'
                }}
              >
                <ZoomIn size={16} />
              </button>
              
              <button
                onClick={() => setShowGrid(!showGrid)}
                style={{
                  ...buttonStyle,
                  backgroundColor: showGrid ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb'),
                  color: showGrid ? 'white' : (isDark ? '#f9fafb' : '#374151')
                }}
              >
                <Grid3X3 size={16} />
              </button>
            </div>
            
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              onClick={handleCanvasClick}
              style={{
                width: '100%',
                height: 'auto',
                border: `2px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                borderRadius: '8px',
                cursor: 'crosshair',
                imageRendering: 'pixelated'
              }}
            />
            
            {/* Speed Control */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Speed: {simSpeed}x
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Statistics */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} />
                Statistics
              </h3>
              <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Generation:</span>
                  <span style={{ fontFamily: 'monospace' }}>{generation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Population:</span>
                  <span style={{ fontFamily: 'monospace' }}>{population}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Grid Size:</span>
                  <span style={{ fontFamily: 'monospace' }}>{ROWS}×{COLS}</span>
                </div>
              </div>
            </div>
            
            {/* Visual Settings */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={16} />
                Visual Settings
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Color Mode
                  </label>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as ColorMode)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#374151'
                    }}
                  >
                    <option value="none">Single Color</option>
                    <option value="age">Age Based</option>
                    <option value="rainbow">Rainbow</option>
                    <option value="heat">Heat Map</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Rule Variant
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value as Variant)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                      backgroundColor: isDark ? '#374151' : '#ffffff',
                      color: isDark ? '#f9fafb' : '#374151'
                    }}
                  >
                    <option value="conway">Conway's Life</option>
                    <option value="highlife">HighLife</option>
                    <option value="daynight">Day & Night</option>
                    <option value="seeds">Seeds</option>
                    <option value="coral">Coral</option>
                    <option value="amoeba">Amoeba</option>
                    <option value="life34">34 Life</option>
                    <option value="diamoeba">Diamoeba</option>
                    <option value="maze">Maze</option>
                    <option value="fredkin">Fredkin</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Patterns */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Patterns</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PATTERNS.map((pattern) => (
                  <button
                    key={pattern.name}
                    onClick={() => loadPattern(pattern)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#f9fafb' : '#374151',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <span>{pattern.name}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      ({pattern.description})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}