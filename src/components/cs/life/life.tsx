'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  RotateCcw, Palette, Grid3X3, Shuffle, ChevronDown, 
  Layers, Activity, Sparkles, Hash, Timer, Zap
} from "lucide-react";
import styled, { keyframes, css } from "styled-components";

// ============================================================================
// TYPES & DATA
// ============================================================================

type ColorMode = "none" | "age" | "rainbow" | "heat";
type Variant = "conway" | "highlife" | "daynight" | "seeds" | "coral" | "amoeba";
interface RuleSet { birth: number[]; survive: number[]; }
interface Pattern { name: string; matrix: number[][]; }

interface LifeSimulationProps {
  isDark?: boolean;
  isRunning?: boolean;
  speed?: number;
}

const COLORS = {
  bg1: '#0a0e1a',
  bg2: '#1a1a2e',
  surface: 'rgba(0,0,0,0.5)',
  textPrimary: '#e6eef8',
  textMuted: '#94a3b8',
  accent: '#3b82f6',
  accentSoft: '#60a5fa',
  purple: '#a78bfa',
  success: '#22c55e',
  warn: '#fbbf24',
  borderAccent: 'rgba(59, 130, 246, 0.15)'
};

const RULES: Record<Variant, RuleSet> = {
  conway: { birth: [3], survive: [2, 3] },
  highlife: { birth: [3, 6], survive: [2, 3] },
  daynight: { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
  seeds: { birth: [2], survive: [] },
  coral: { birth: [3], survive: [4, 5, 6, 7, 8] },
  amoeba: { birth: [3, 5, 7], survive: [1, 3, 5, 8] }
};

const PATTERNS: Pattern[] = [
  { name: "Glider", matrix: [[0, 1, 0], [0, 0, 1], [1, 1, 1]] },
  { name: "Blinker", matrix: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] },
  { name: "Block", matrix: [[1, 1], [1, 1]] },
  { name: "Toad", matrix: [[0, 1, 1, 1], [1, 1, 1, 0]] },
  { name: "LWSS", matrix: [[0, 1, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]] },
  { name: "Pulsar", matrix: [[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0]] }
];

const VARIANT_LABELS: Record<Variant, string> = {
  conway: "Conway's Life",
  highlife: "HighLife",
  daynight: "Day & Night",
  seeds: "Seeds",
  coral: "Coral",
  amoeba: "Amoeba"
};

const COLOR_LABELS: Record<ColorMode, string> = {
  none: "Solid",
  age: "Age",
  rainbow: "Rainbow",
  heat: "Heat"
};

// ============================================================================
// SIMULATION CLASSES
// ============================================================================

class Grid {
  private cells: Uint8Array;
  private cols: number;
  private rows: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Uint8Array(cols * rows);
  }

  randomize(density: number = 0.55) {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = Math.random() < density ? 1 : 0;
    }
  }

  clear() { this.cells.fill(0); }
  getCell(row: number, col: number): number { return this.cells[row * this.cols + col]; }
  setCell(row: number, col: number, value: number) { this.cells[row * this.cols + col] = value; }

  getNeighborCount(row: number, col: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (row + dr + this.rows) % this.rows;
        const nc = (col + dc + this.cols) % this.cols;
        if (this.getCell(nr, nc) > 0) count++;
      }
    }
    return count;
  }

  countPopulation(): number {
    let count = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] > 0) count++;
    }
    return count;
  }

  getCols() { return this.cols; }
  getRows() { return this.rows; }
  getCells() { return this.cells; }
}

class Simulation {
  private grid: Grid;
  private rules: RuleSet;
  private generation: number = 0;

  constructor(cols: number, rows: number, rules: RuleSet) {
    this.grid = new Grid(cols, rows);
    this.rules = rules;
  }

  step() {
    const oldCells = this.grid.getCells().slice();
    const cols = this.grid.getCols();
    const rows = this.grid.getRows();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const alive = oldCells[idx] > 0;
        const neighbors = this.grid.getNeighborCount(row, col);
        const shouldLive = alive
          ? this.rules.survive.includes(neighbors)
          : this.rules.birth.includes(neighbors);

        if (shouldLive) {
          this.grid.setCell(row, col, alive ? Math.min(255, oldCells[idx] + 1) : 1);
        } else {
          this.grid.setCell(row, col, 0);
        }
      }
    }
    this.generation++;
  }

  reset() { this.grid.randomize(); this.generation = 0; }

  loadPattern(pattern: number[][], centerX: number, centerY: number) {
    this.grid.clear();
    const offsetX = Math.floor(pattern[0].length / 2);
    const offsetY = Math.floor(pattern.length / 2);

    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[0].length; c++) {
        const row = centerY - offsetY + r;
        const col = centerX - offsetX + c;
        if (row >= 0 && row < this.grid.getRows() && col >= 0 && col < this.grid.getCols()) {
          this.grid.setCell(row, col, pattern[r][c]);
        }
      }
    }
    this.generation = 0;
  }

  getGrid() { return this.grid; }
  getGeneration() { return this.generation; }
}

class Renderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private colorMode: ColorMode;
  private showGrid: boolean;
  private panX: number = 0;
  private panY: number = 0;
  private zoom: number = 1;

  constructor(ctx: CanvasRenderingContext2D, cellSize: number) {
    this.ctx = ctx;
    this.cellSize = cellSize;
    this.colorMode = "rainbow";
    this.showGrid = false;
  }

  setPan(x: number, y: number) { this.panX = x; this.panY = y; }
  setZoom(z: number) { this.zoom = Math.max(0.5, Math.min(4, z)); }
  setColorMode(mode: ColorMode) { this.colorMode = mode; }
  setShowGrid(show: boolean) { this.showGrid = show; }

  render(grid: Grid) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.fillStyle = COLORS.bg1;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    const cols = grid.getCols();
    const rows = grid.getRows();
    const cells = grid.getCells();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = cells[row * cols + col];
        if (cell > 0) {
          const x = col * this.cellSize;
          const y = row * this.cellSize;
          ctx.fillStyle = this.getCellColor(cell);
          ctx.fillRect(x, y, this.cellSize - 0.5, this.cellSize - 0.5);
        }
      }
    }

    if (this.showGrid && this.cellSize * this.zoom >= 4) {
      ctx.strokeStyle = "rgba(100, 116, 139, 0.12)";
      ctx.lineWidth = 0.5 / this.zoom;
      ctx.beginPath();
      for (let x = 0; x <= cols * this.cellSize; x += this.cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rows * this.cellSize);
      }
      for (let y = 0; y <= rows * this.cellSize; y += this.cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(cols * this.cellSize, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  private getCellColor(age: number): string {
    switch (this.colorMode) {
      case "age": return `hsl(${(age * 15) % 360}, 70%, 60%)`;
      case "rainbow": return `hsl(${(age * 12) % 360}, 80%, 55%)`;
      case "heat": {
        const heat = Math.min(1, age / 20);
        return `rgb(${Math.floor(255 * heat)},${Math.floor(180 * (1 - heat) * heat * 3)},${Math.floor(80 * (1 - heat))})`;
      }
      default: return COLORS.accent;
    }
  }

  getZoom() { return this.zoom; }
  getPan() { return { x: this.panX, y: this.panY }; }
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const Container = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${COLORS.bg1} 0%, ${COLORS.bg2} 50%, ${COLORS.bg1} 100%);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1rem;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const CanvasPanel = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.35), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s linear infinite;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

const StatsPanel = styled.div`
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid ${COLORS.borderAccent};
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 1rem 1.25rem;
  background: rgba(0,0,0,0.28);
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.accentSoft};
  svg { width: 16px; height: 16px; }
`;

const StatsContent = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  &::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.22); border-radius: 2px; }
`;

const StatCard = styled.div`
  background: rgba(0,0,0,0.28);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.08);
  padding: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.06);
    border-color: rgba(59, 130, 246, 0.12);
  }
`;

const StatLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${COLORS.textMuted};
  svg { width: 14px; height: 14px; color: ${COLORS.accentSoft}; }
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: ${p => p.$color || COLORS.textPrimary};
`;

const PulseIndicator = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$active ? COLORS.success : COLORS.warn};
  animation: ${p => p.$active ? css`${pulse} 2s ease-in-out infinite` : 'none'};
`;

const BottomSection = styled.div`
  height: 70px;
  display: flex;
  gap: 1rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const ControlsCard = styled.div`
  flex: 1;
  background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,10,30,0.6) 100%);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const ControlBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: ${p => p.$active ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.28)'};
  color: ${p => p.$active ? COLORS.accentSoft : COLORS.textMuted};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(59, 130, 246, 0.15);
    color: ${COLORS.accentSoft};
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  }
  
  svg { width: 16px; height: 16px; }
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: rgba(59, 130, 246, 0.15);
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, rgba(10,14,26,0.98) 0%, rgba(26,26,46,0.98) 100%);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid ${COLORS.borderAccent};
  padding: 0.5rem;
  min-width: 160px;
  opacity: ${p => p.$show ? 1 : 0};
  visibility: ${p => p.$show ? 'visible' : 'hidden'};
  transform: translateX(-50%) ${p => p.$show ? 'translateY(0)' : 'translateY(8px)'};
  transition: all 0.2s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const DropdownItem = styled.button<{ $active?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: none;
  border-radius: 8px;
  background: ${p => p.$active ? 'rgba(59, 130, 246, 0.15)' : 'transparent'};
  color: ${p => p.$active ? COLORS.accentSoft : COLORS.textMuted};
  font-size: 0.8rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: ${COLORS.accentSoft};
  }
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.375rem;
`;

const PatternBtn = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: rgba(0,0,0,0.3);
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.15);
    color: ${COLORS.purple};
  }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  color: ${COLORS.textMuted};
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
`;

const HintText = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(148, 163, 184, 0.4);
  font-size: 0.7rem;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LifeSimulation({ isDark = true, isRunning = true, speed = 1 }: LifeSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Simulation | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [cellSize] = useState(6);
  const [colorMode, setColorMode] = useState<ColorMode>("rainbow");
  const [variant, setVariant] = useState<Variant>("conway");
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 800 });

  const [showVariantMenu, setShowVariantMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showPatternMenu, setShowPatternMenu] = useState(false);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => { setIsPlaying(isRunning); }, [isRunning]);

  const initSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    setCanvasDimensions({ width, height });

    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    const sim = new Simulation(cols, rows, RULES[variant]);
    sim.reset();

    return { sim, ctx };
  }, [cellSize, variant]);

  useEffect(() => {
    const result = initSimulation();
    if (!result) return;

    simRef.current = result.sim;
    rendererRef.current = new Renderer(result.ctx, cellSize);
    rendererRef.current.setColorMode(colorMode);
    rendererRef.current.setShowGrid(showGrid);

    setGeneration(result.sim.getGeneration());
    setPopulation(result.sim.getGrid().countPopulation());
    rendererRef.current.render(result.sim.getGrid());

    const handleResize = () => {
      const result = initSimulation();
      if (result) {
        simRef.current = result.sim;
        rendererRef.current = new Renderer(result.ctx, cellSize);
        rendererRef.current.setColorMode(colorMode);
        rendererRef.current.setShowGrid(showGrid);
        rendererRef.current.render(result.sim.getGrid());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initSimulation, cellSize, colorMode, showGrid]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setColorMode(colorMode);
      if (simRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  }, [colorMode]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setShowGrid(showGrid);
      if (simRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  }, [showGrid]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const baseInterval = 100;
    const adjustedInterval = baseInterval / speed;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= adjustedInterval) {
        if (simRef.current) {
          simRef.current.step();
          setGeneration(simRef.current.getGeneration());
          setPopulation(simRef.current.getGrid().countPopulation());
        }
        lastUpdateRef.current = timestamp;
      }

      if (rendererRef.current && simRef.current) {
        rendererRef.current.render(simRef.current.getGrid());
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, speed]);

  const handleReset = () => {
    if (simRef.current) {
      simRef.current.reset();
      setGeneration(simRef.current.getGeneration());
      setPopulation(simRef.current.getGrid().countPopulation());
      if (rendererRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  };

  const handleLoadPattern = (pattern: Pattern) => {
    if (simRef.current) {
      const grid = simRef.current.getGrid();
      simRef.current.loadPattern(pattern.matrix, Math.floor(grid.getCols() / 2), Math.floor(grid.getRows() / 2));
      setGeneration(simRef.current.getGeneration());
      setPopulation(simRef.current.getGrid().countPopulation());
      if (rendererRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
    setShowPatternMenu(false);
  };

  const handleChangeVariant = (v: Variant) => {
    setVariant(v);
    setShowVariantMenu(false);
    setTimeout(() => {
      const result = initSimulation();
      if (result) {
        simRef.current = result.sim;
        rendererRef.current = new Renderer(result.ctx, cellSize);
        rendererRef.current.setColorMode(colorMode);
        rendererRef.current.setShowGrid(showGrid);
        setGeneration(result.sim.getGeneration());
        setPopulation(result.sim.getGrid().countPopulation());
        rendererRef.current.render(result.sim.getGrid());
      }
    }, 0);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(4, zoom * delta));
    setZoom(newZoom);
    if (rendererRef.current) {
      rendererRef.current.setZoom(newZoom);
      if (simRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    const pan = rendererRef.current?.getPan() || { x: 0, y: 0 };
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    if (rendererRef.current) {
      rendererRef.current.setPan(newX, newY);
      if (simRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => { setIsPanning(false); }, []);

  const resetView = () => {
    setZoom(1);
    if (rendererRef.current) {
      rendererRef.current.setPan(0, 0);
      rendererRef.current.setZoom(1);
      if (simRef.current) rendererRef.current.render(simRef.current.getGrid());
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handleClick = () => { setShowVariantMenu(false); setShowColorMenu(false); setShowPatternMenu(false); };
    if (showVariantMenu || showColorMenu || showPatternMenu) {
      setTimeout(() => window.addEventListener('click', handleClick, { once: true }), 0);
    }
  }, [showVariantMenu, showColorMenu, showPatternMenu]);

  return (
    <Container>
      <TopSection>
        <CanvasPanel ref={containerRef}>
          <Canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {zoom !== 1 && <ZoomIndicator>{(zoom * 100).toFixed(0)}%</ZoomIndicator>}
          <HintText>Scroll to zoom • Drag to pan</HintText>
        </CanvasPanel>

        <StatsPanel>
          <PanelHeader>
            <Activity /> Live Statistics
            <div style={{ marginLeft: 'auto' }}><PulseIndicator $active={isPlaying} /></div>
          </PanelHeader>
          <StatsContent>
            <StatCard>
              <StatLabel><Hash /> Generation</StatLabel>
              <StatValue $color={COLORS.accentSoft}>{generation.toLocaleString()}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel><Sparkles /> Population</StatLabel>
              <StatValue $color={COLORS.success}>{population.toLocaleString()}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel><Layers /> Rules</StatLabel>
              <StatValue $color={COLORS.purple}>{VARIANT_LABELS[variant].split(' ')[0]}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel><Palette /> Colors</StatLabel>
              <StatValue>{COLOR_LABELS[colorMode]}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel><Zap /> Speed</StatLabel>
              <StatValue>{speed}×</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel><Timer /> Density</StatLabel>
              <StatValue>{((population / (canvasDimensions.width * canvasDimensions.height / (cellSize * cellSize))) * 100).toFixed(1)}%</StatValue>
            </StatCard>
          </StatsContent>
        </StatsPanel>
      </TopSection>

      <BottomSection>
        <ControlsCard>
          <ControlBtn onClick={handleReset}><Shuffle size={16} /> Randomize</ControlBtn>
          <ControlBtn onClick={resetView}><RotateCcw size={16} /> Reset View</ControlBtn>
          <ControlBtn $active={showGrid} onClick={() => setShowGrid(!showGrid)}><Grid3X3 size={16} /> Grid</ControlBtn>
          
          <Divider />

          <DropdownContainer>
            <ControlBtn $active={showVariantMenu} onClick={(e) => { e.stopPropagation(); setShowVariantMenu(!showVariantMenu); setShowColorMenu(false); setShowPatternMenu(false); }}>
              <Layers size={16} /> {VARIANT_LABELS[variant].split(' ')[0]} <ChevronDown size={14} />
            </ControlBtn>
            <DropdownMenu $show={showVariantMenu}>
              {(Object.keys(RULES) as Variant[]).map(v => (
                <DropdownItem key={v} $active={variant === v} onClick={(e) => { e.stopPropagation(); handleChangeVariant(v); }}>
                  {VARIANT_LABELS[v]}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          <DropdownContainer>
            <ControlBtn $active={showColorMenu} onClick={(e) => { e.stopPropagation(); setShowColorMenu(!showColorMenu); setShowVariantMenu(false); setShowPatternMenu(false); }}>
              <Palette size={16} /> {COLOR_LABELS[colorMode]} <ChevronDown size={14} />
            </ControlBtn>
            <DropdownMenu $show={showColorMenu}>
              {(Object.keys(COLOR_LABELS) as ColorMode[]).map(c => (
                <DropdownItem key={c} $active={colorMode === c} onClick={(e) => { e.stopPropagation(); setColorMode(c); setShowColorMenu(false); }}>
                  {COLOR_LABELS[c]}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          <DropdownContainer>
            <ControlBtn $active={showPatternMenu} onClick={(e) => { e.stopPropagation(); setShowPatternMenu(!showPatternMenu); setShowVariantMenu(false); setShowColorMenu(false); }}>
              <Sparkles size={16} /> Patterns <ChevronDown size={14} />
            </ControlBtn>
            <DropdownMenu $show={showPatternMenu} style={{ minWidth: '200px' }}>
              <PatternGrid>
                {PATTERNS.map(p => (
                  <PatternBtn key={p.name} onClick={(e) => { e.stopPropagation(); handleLoadPattern(p); }}>
                    {p.name}
                  </PatternBtn>
                ))}
              </PatternGrid>
            </DropdownMenu>
          </DropdownContainer>
        </ControlsCard>
      </BottomSection>
    </Container>
  );
}