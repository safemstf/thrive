'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  RotateCcw, Grid3X3, Shuffle, Play, Pause,
} from "lucide-react";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";

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

// Canvas stays dark so cells are visible; UI uses the cream theme tokens
const CANVAS_BG = '#0f1117';

const T = {
  ink:       '#1a1208',
  inkMid:    '#3d3120',
  inkLight:  '#7a6e5f',
  inkFaint:  '#b8ad9e',
  cream:     '#faf7f2',
  creamDark: '#f0ebe1',
  creamDeep: '#e4ddd0',
  rule:      'rgba(26,18,8,0.10)',
  ruleMid:   'rgba(26,18,8,0.06)',
  accent:    '#2563eb',
  accentBg:  'rgba(37,99,235,0.07)',
  green:     '#16a34a',
  greenBg:   'rgba(22,163,74,0.08)',
  amber:     '#b45309',
  amberBg:   'rgba(180,83,9,0.08)',
  red:       '#dc2626',
  serif:     `'DM Serif Display', Georgia, serif`,
  mono:      `'DM Mono', 'Fira Code', ui-monospace, monospace`,
  sans:      `'DM Sans', system-ui, sans-serif`,
  shadow:    '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  shadowLg:  '0 8px 32px rgba(26,18,8,0.12)',
  radius:    '12px',
  radiusSm:  '7px',
};

// Keep a COLORS alias for the Renderer (only canvas-internal rendering uses this)
const COLORS = {
  bg1:     CANVAS_BG,
  accent:  T.accent,
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
  none: "Solid", age: "Age", rainbow: "Rainbow", heat: "Heat",
};

const VARIANT_NOTATION: Record<Variant, string> = {
  conway:   'B3/S23',
  highlife: 'B36/S23',
  daynight: 'B3678/S34678',
  seeds:    'B2/S—',
  coral:    'B3/S45678',
  amoeba:   'B357/S1358',
};

const VARIANT_DESCRIPTIONS: Record<Variant, string> = {
  conway:   'The 1970 original. A cell is born with exactly 3 neighbors and survives with 2 or 3. Produces gliders, oscillators, and stable "still-life" structures.',
  highlife: 'Like Conway but also allows birth with 6 neighbors. Notable for the Replicator — a pattern that creates a complete copy of itself.',
  daynight: 'Live and dead cells follow symmetric rules, so the grid looks identical when inverted. Produces complex, high-density, symmetric growth.',
  seeds:    'Every cell dies immediately — no cell ever survives. New cells appear only with exactly 2 neighbors, producing explosive short-lived clouds.',
  coral:    'Cells born with 3 neighbors but survive with 4–8. Grows slowly, filling gaps and forming dense, stable masses resembling coral.',
  amoeba:   'Erratic birth and survival conditions produce chaotic blob-like structures that stretch and contract unpredictably each generation.',
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
// STYLED COMPONENTS — cream / ink theme
// ============================================================================

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`;

// Root — normal document flow, scrollable (fixes the "not rendered" bug)
const Root = styled.div`
  width: 100%;
  min-height: 580px;
  overflow-y: auto;
  background: ${T.cream};
  font-family: ${T.sans};
  color: ${T.ink};
  -webkit-font-smoothing: antialiased;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${T.creamDeep}; border-radius: 2px; }
`;

const Header = styled.header`
  padding-bottom: 1.1rem;
  border-bottom: 2px solid ${T.ink};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-family: ${T.serif};
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 0.2rem;
  color: ${T.ink};
`;

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: ${T.inkLight};
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.02em;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const HeaderBadge = styled.div`
  font-family: ${T.mono};
  font-size: 0.6rem;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.28rem 0.6rem;
  border: 1px solid ${T.creamDeep};
  border-radius: 999px;
  background: ${T.creamDark};
  white-space: nowrap;
`;

const RuleNotation = styled.div`
  font-family: ${T.mono};
  font-size: 0.68rem;
  font-weight: 600;
  color: ${T.accent};
  padding: 0.28rem 0.65rem;
  border: 1px solid rgba(37,99,235,0.25);
  border-radius: 999px;
  background: ${T.accentBg};
  white-space: nowrap;
  letter-spacing: 0.04em;
`;

// Body: sidebar | main
const Body = styled.div`
  display: grid;
  grid-template-columns: 228px 1fr;
  gap: 1rem;
  align-items: start;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

// Sidebar
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const SideCard = styled.div`
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  box-shadow: ${T.shadow};
  overflow: hidden;
`;

const SideHead = styled.div`
  padding: 0.48rem 0.85rem;
  background: ${T.creamDark};
  border-bottom: 1px solid ${T.ruleMid};
  font-family: ${T.mono};
  font-size: 0.57rem;
  font-weight: 600;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const VariantBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.85rem;
  border: none;
  border-bottom: 1px solid ${T.ruleMid};
  background: ${p => p.$active ? T.accentBg : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: all 0.12s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${p => p.$active ? T.accentBg : T.creamDark}; }
`;

const VDot = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${p => p.$active ? T.accent : T.inkFaint};
  transition: background 0.12s;
`;

const VLabel = styled.div`
  font-size: 0.73rem;
  font-weight: 500;
  color: ${T.ink};
  line-height: 1.25;
`;

const VNote = styled.div`
  font-size: 0.59rem;
  color: ${T.inkFaint};
  font-family: ${T.mono};
  margin-top: 0.06rem;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.3rem;
  padding: 0.5rem;
`;

const PatternBtn = styled.button`
  padding: 0.38rem 0.5rem;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  background: ${T.creamDark};
  color: ${T.inkLight};
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  font-family: ${T.sans};
  transition: all 0.12s;
  &:hover { background: ${T.accentBg}; color: ${T.accent}; border-color: rgba(37,99,235,0.22); }
`;

const DescBox = styled.div`
  padding: 0.7rem 0.85rem;
  background: ${T.creamDark};
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  font-size: 0.7rem;
  color: ${T.inkLight};
  line-height: 1.65;
`;

// Main column: canvas + controls + stats
const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
`;

const CanvasWrap = styled.div`
  background: #0f1117;
  border-radius: ${T.radius};
  border: 1px solid ${T.rule};
  box-shadow: ${T.shadowLg};
  position: relative;
  overflow: hidden;
  height: 420px;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

const ZoomIndicator = styled.div`
  position: absolute;
  bottom: 0.65rem;
  right: 0.65rem;
  background: rgba(15,17,23,0.8);
  padding: 0.25rem 0.5rem;
  border-radius: ${T.radiusSm};
  border: 1px solid rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.45);
  font-size: 0.62rem;
  font-family: ${T.mono};
  font-weight: 600;
`;

const HintText = styled.div`
  position: absolute;
  bottom: 0.65rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.16);
  font-size: 0.62rem;
  font-family: ${T.sans};
  white-space: nowrap;
  pointer-events: none;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  box-shadow: ${T.shadow};
  padding: 0.5rem 0.85rem;
`;

const ControlBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: ${T.radiusSm};
  border: 1px solid ${p => p.$active ? 'rgba(37,99,235,0.3)' : T.rule};
  background: ${p => p.$active ? T.accentBg : T.creamDark};
  color: ${p => p.$active ? T.accent : T.inkMid};
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: ${T.sans};
  white-space: nowrap;
  &:hover {
    background: ${p => p.$active ? T.accentBg : T.creamDeep};
    color: ${p => p.$active ? T.accent : T.ink};
    box-shadow: ${T.shadow};
  }
  svg { width: 12px; height: 12px; }
`;

const CDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${T.rule};
  flex-shrink: 0;
`;

const CLabel = styled.span`
  font-size: 0.62rem;
  color: ${T.inkFaint};
  font-family: ${T.mono};
  white-space: nowrap;
`;

const PulseIndicator = styled.div<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$active ? T.green : T.amber};
  animation: ${p => p.$active ? css`${pulse} 2s ease-in-out infinite` : 'none'};
  flex-shrink: 0;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  flex: 1;
  min-width: 90px;
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  box-shadow: ${T.shadow};
  padding: 0.45rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
`;

const StatLabel = styled.div`
  font-size: 0.58rem;
  font-weight: 500;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: ${T.mono};
`;

const StatVal = styled.div<{ $color?: string }>`
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ${T.mono};
  color: ${p => p.$color || T.ink};
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
  };

  const handleChangeVariant = (v: Variant) => {
    setVariant(v);
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

  return (
    <Root>
      <GlobalStyle />

      <Header>
        <div>
          <Title>Conway's Game of Life</Title>
          <Subtitle>Cellular automaton — emergent complexity from simple rules</Subtitle>
        </div>
        <HeaderRight>
          <RuleNotation>{VARIANT_NOTATION[variant]}</RuleNotation>
          <HeaderBadge>B/S Notation</HeaderBadge>
        </HeaderRight>
      </Header>

      <Body>
        <Sidebar>
          <SideCard>
            <SideHead>Rule Variants</SideHead>
            {(Object.keys(RULES) as Variant[]).map(v => (
              <VariantBtn key={v} $active={variant === v} onClick={() => handleChangeVariant(v)}>
                <VDot $active={variant === v} />
                <div>
                  <VLabel>{VARIANT_LABELS[v]}</VLabel>
                  <VNote>{VARIANT_NOTATION[v]}</VNote>
                </div>
              </VariantBtn>
            ))}
          </SideCard>

          <SideCard>
            <SideHead>Seed Patterns</SideHead>
            <PatternGrid>
              {PATTERNS.map(p => (
                <PatternBtn key={p.name} onClick={() => handleLoadPattern(p)}>
                  {p.name}
                </PatternBtn>
              ))}
            </PatternGrid>
          </SideCard>

          <DescBox>{VARIANT_DESCRIPTIONS[variant]}</DescBox>
        </Sidebar>

        <MainCol>
          <CanvasWrap ref={containerRef}>
            <Canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {zoom !== 1 && <ZoomIndicator>{(zoom * 100).toFixed(0)}%</ZoomIndicator>}
            <HintText>Scroll to zoom · Drag to pan</HintText>
          </CanvasWrap>

          <ControlsRow>
            <PulseIndicator $active={isPlaying} />
            <ControlBtn onClick={() => setIsPlaying(p => !p)}>
              {isPlaying ? <Pause /> : <Play />}
              {isPlaying ? 'Pause' : 'Play'}
            </ControlBtn>
            <ControlBtn onClick={handleReset}><Shuffle /> Randomize</ControlBtn>
            <ControlBtn onClick={resetView}><RotateCcw /> Reset View</ControlBtn>
            <ControlBtn $active={showGrid} onClick={() => setShowGrid(g => !g)}>
              <Grid3X3 /> Grid
            </ControlBtn>
            <CDivider />
            <CLabel>Color</CLabel>
            {(Object.keys(COLOR_LABELS) as ColorMode[]).map(c => (
              <ControlBtn key={c} $active={colorMode === c} onClick={() => setColorMode(c)}>
                {COLOR_LABELS[c]}
              </ControlBtn>
            ))}
          </ControlsRow>

          <StatsRow>
            <StatChip>
              <StatLabel>Generation</StatLabel>
              <StatVal $color={T.accent}>{generation.toLocaleString()}</StatVal>
            </StatChip>
            <StatChip>
              <StatLabel>Population</StatLabel>
              <StatVal $color={T.green}>{population.toLocaleString()}</StatVal>
            </StatChip>
            <StatChip>
              <StatLabel>Speed</StatLabel>
              <StatVal>{speed}×</StatVal>
            </StatChip>
            <StatChip>
              <StatLabel>Density</StatLabel>
              <StatVal $color={T.amber}>
                {((population / (canvasDimensions.width * canvasDimensions.height / (cellSize * cellSize))) * 100).toFixed(1)}%
              </StatVal>
            </StatChip>
          </StatsRow>
        </MainCol>
      </Body>
    </Root>
  );
}