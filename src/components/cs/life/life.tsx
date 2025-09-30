'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Palette, ZoomIn, ZoomOut, Grid3X3,
  Settings, Shapes, Maximize, X
} from "lucide-react";
import styled from "styled-components";

// ============================================================================
// TYPES
// ============================================================================

type ColorMode = "none" | "age" | "rainbow" | "heat";
type Variant = "conway" | "highlife" | "daynight" | "seeds" | "coral" | "amoeba";
interface RuleSet { birth: number[]; survive: number[]; }
interface Pattern { name: string; matrix: number[][]; description: string; }

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

  randomize(density: number = 0.25) {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = Math.random() < density ? 1 : 0;
    }
  }

  clear() {
    this.cells.fill(0);
  }

  getCell(row: number, col: number): number {
    return this.cells[row * this.cols + col];
  }

  setCell(row: number, col: number, value: number) {
    this.cells[row * this.cols + col] = value;
  }

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

  reset() {
    this.grid.randomize();
    this.generation = 0;
  }

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

  setPan(x: number, y: number) {
    this.panX = x;
    this.panY = y;
  }

  setZoom(z: number) {
    this.zoom = Math.max(0.1, Math.min(5, z));
  }

  setColorMode(mode: ColorMode) {
    this.colorMode = mode;
  }

  setShowGrid(show: boolean) {
    this.showGrid = show;
  }

  setCellSize(size: number) {
    this.cellSize = size;
  }

  render(grid: Grid) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
      }
    }

    if (this.showGrid && this.cellSize * this.zoom >= 4) {
      ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
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
    let r = 0, g = 0, b = 0;
    
    switch (this.colorMode) {
      case "age": {
        const hue = (age * 15) % 360;
        [r, g, b] = this.hslToRgb(hue / 360, 0.7, 0.6);
        break;
      }
      case "rainbow": {
        const hue = (age * 12) % 360;
        [r, g, b] = this.hslToRgb(hue / 360, 0.8, 0.55);
        break;
      }
      case "heat": {
        const heat = Math.min(1, age / 20);
        r = Math.floor(255 * heat);
        g = Math.floor(180 * (1 - heat) * heat * 3);
        b = Math.floor(80 * (1 - heat));
        break;
      }
      default:
        r = 99; g = 102; b = 241;
    }
    return `rgb(${r},${g},${b})`;
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;
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
  }

  getZoom() { return this.zoom; }
  getPan() { return { x: this.panX, y: this.panY }; }
}

// ============================================================================
// DATA
// ============================================================================

const RULES: Record<Variant, RuleSet> = {
  conway: { birth: [3], survive: [2, 3] },
  highlife: { birth: [3, 6], survive: [2, 3] },
  daynight: { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
  seeds: { birth: [2], survive: [] },
  coral: { birth: [3], survive: [4, 5, 6, 7, 8] },
  amoeba: { birth: [3, 5, 7], survive: [1, 3, 5, 8] }
};

const PATTERNS: Pattern[] = [
  { name: "Blinker", description: "Period-2", matrix: [[0,1,0],[0,1,0],[0,1,0]] },
  { name: "Glider", description: "Diagonal ship", matrix: [[0,1,0],[0,0,1],[1,1,1]] },
  { name: "Block", description: "2×2 still", matrix: [[1,1],[1,1]] },
  { name: "Toad", description: "Period-2", matrix: [[0,1,1,1],[1,1,1,0]] },
  { name: "Pulsar", description: "Period-3", matrix: [[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,1,1,1,0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,1,1,0,0,0,1,1,1,0,0]] },
  { name: "LWSS", description: "Ship", matrix: [[0,1,0,0,1],[1,0,0,0,0],[1,0,0,0,1],[1,1,1,1,0]] }
];

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #f9fafb;
  padding: 1.5rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const MaxWidth = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0;
`;

const ViewButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`;

const VideoWrapper = styled.div`
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(99, 102, 241, 0.2);
  
  @media (max-width: 768px) {
    display: none;
  }
  
  @media (min-width: 769px) {
    aspect-ratio: 4 / 3;
    max-height: 70vh;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: white;
  font-size: 0.75rem;
  font-family: monospace;
  z-index: 10;
`;

const OverlayRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  span:first-child {
    color: rgba(255, 255, 255, 0.6);
  }
  
  span:last-child {
    font-weight: 700;
    color: #60a5fa;
  }
`;

const Controls = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.95);
  padding: 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.3);
`;

const ControlBtn = styled.button<{ $primary?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${p => p.$primary ? '#6366f1' : 'rgba(51, 65, 85, 0.8)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid #cbd5e1;
  background: #f9fafb;
  color: #0f172a;
  font-weight: 500;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Btn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  background: ${p => p.$active ? '#cbd5e1' : '#fff'};
  color: #0f172a;
  border: 1px solid #e2e8f0;
  transition: background 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ZoomGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: white;
  border-radius: 0.6rem;
  padding: 0.25rem;
  border: 1px solid #e2e8f0;
`;

const ZoomBtn = styled.button`
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  color: #334155;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const Badge = styled.span`
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-family: monospace;
  font-weight: 600;
  color: #64748b;
  min-width: 48px;
  text-align: center;
`;

const SliderLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 1rem;
  outline: none;
  appearance: none;
  background: #cbd5e1;
  accent-color: #6366f1;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PatternCard = styled.button`
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #f9fafb;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    border-color: #6366f1;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.15);
  }
`;

const PatternName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
`;

const PatternDesc = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const Fullscreen = styled.div<{ $show: boolean }>`
  position: fixed;
  inset: 0;
  background: #0a0e1a;
  z-index: 10000;
  display: ${p => p.$show ? 'flex' : 'none'};
  flex-direction: column;
`;

const FSCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: grab;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
  }
`;

const FSOverlay = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  left: 1rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: white;
  font-size: 0.75rem;
  font-family: monospace;
`;

const FSControls = styled.div`
  position: absolute;
  bottom: calc(1.5rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.95);
  padding: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(71, 85, 105, 0.5);
`;

const FSBtn = styled.button<{ $primary?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: ${p => p.$primary ? '#6366f1' : 'rgba(51, 65, 85, 0.8)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExitBtn = styled.button`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(71, 85, 105, 0.5);
  
  &:hover {
    background: rgba(220, 38, 38, 0.9);
  }
`;

const ZoomInd = styled.div`
  position: absolute;
  top: calc(1rem + env(safe-area-inset-top));
  right: 5rem;
  background: rgba(15, 23, 42, 0.9);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: white;
  font-size: 0.75rem;
  font-family: monospace;
  font-weight: 600;
`;

const Hint = styled.div`
  position: absolute;
  bottom: calc(5rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-align: center;
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LifeSimulation() {
  const desktopCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Simulation | null>(null);
  const desktopRendererRef = useRef<Renderer | null>(null);
  const fullscreenRendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [cellSize, setCellSize] = useState(6);
  const [colorMode, setColorMode] = useState<ColorMode>("rainbow");
  const [variant, setVariant] = useState<Variant>("conway");
  const [showGrid, setShowGrid] = useState(false);
  const [simSpeed, setSimSpeed] = useState(3);
  const [zoom, setZoom] = useState(1);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const touchStartDistanceRef = useRef<number>(0);
  const lastZoomRef = useRef<number>(1);

  const initSimulation = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
    
    const sim = new Simulation(cols, rows, RULES[variant]);
    sim.reset();
    
    return { sim, ctx };
  }, [cellSize, variant]);

  useEffect(() => {
    const canvas = desktopCanvasRef.current;
    if (!canvas) return;

    const result = initSimulation(canvas);
    if (!result) return;

    simRef.current = result.sim;
    desktopRendererRef.current = new Renderer(result.ctx, cellSize);
    desktopRendererRef.current.setColorMode(colorMode);
    desktopRendererRef.current.setShowGrid(showGrid);
    
    setGeneration(result.sim.getGeneration());
    setPopulation(result.sim.getGrid().countPopulation());
    
    if (desktopRendererRef.current) {
      desktopRendererRef.current.render(result.sim.getGrid());
    }

    const handleResize = () => {
      const result = initSimulation(canvas);
      if (!result) return;
      simRef.current = result.sim;
      desktopRendererRef.current = new Renderer(result.ctx, cellSize);
      desktopRendererRef.current.setColorMode(colorMode);
      desktopRendererRef.current.setShowGrid(showGrid);
      if (desktopRendererRef.current) {
        desktopRendererRef.current.render(result.sim.getGrid());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initSimulation, cellSize, colorMode, showGrid]);

  useEffect(() => {
    if (!isFullscreen) return;
    
    const canvas = fullscreenCanvasRef.current;
    if (!canvas) return;

    const result = initSimulation(canvas);
    if (!result) return;

    simRef.current = result.sim;
    fullscreenRendererRef.current = new Renderer(result.ctx, cellSize);
    fullscreenRendererRef.current.setColorMode(colorMode);
    fullscreenRendererRef.current.setShowGrid(showGrid);
    
    if (fullscreenRendererRef.current) {
      fullscreenRendererRef.current.render(result.sim.getGrid());
    }
  }, [isFullscreen, initSimulation, cellSize, colorMode, showGrid]);

  useEffect(() => {
    if (desktopRendererRef.current) {
      desktopRendererRef.current.setColorMode(colorMode);
    }
    if (fullscreenRendererRef.current) {
      fullscreenRendererRef.current.setColorMode(colorMode);
    }
  }, [colorMode]);

  useEffect(() => {
    if (desktopRendererRef.current) {
      desktopRendererRef.current.setShowGrid(showGrid);
    }
    if (fullscreenRendererRef.current) {
      fullscreenRendererRef.current.setShowGrid(showGrid);
    }
  }, [showGrid]);

  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;
      
      if (elapsed >= 100 / simSpeed) {
        if (simRef.current) {
          simRef.current.step();
          setGeneration(simRef.current.getGeneration());
          setPopulation(simRef.current.getGrid().countPopulation());
        }
        lastUpdateRef.current = timestamp;
      }

      const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
      if (renderer && simRef.current) {
        renderer.render(simRef.current.getGrid());
      }

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
  }, [isPlaying, simSpeed, isFullscreen]);

  const handleReset = () => {
    if (simRef.current) {
      simRef.current.reset();
      setGeneration(simRef.current.getGeneration());
      setPopulation(simRef.current.getGrid().countPopulation());
      
      const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
      if (renderer) {
        renderer.render(simRef.current.getGrid());
      }
    }
  };

  const handleLoadPattern = (pattern: Pattern) => {
    if (simRef.current) {
      const grid = simRef.current.getGrid();
      const centerX = Math.floor(grid.getCols() / 2);
      const centerY = Math.floor(grid.getRows() / 2);
      simRef.current.loadPattern(pattern.matrix, centerX, centerY);
      setGeneration(simRef.current.getGeneration());
      setPopulation(simRef.current.getGrid().countPopulation());
      
      const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
      if (renderer) {
        renderer.render(simRef.current.getGrid());
      }
    }
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    setZoom(newZoom);
    
    const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
    if (renderer) {
      renderer.setZoom(newZoom);
      if (simRef.current) {
        renderer.render(simRef.current.getGrid());
      }
    }
  }, [zoom, isFullscreen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
    const pan = renderer?.getPan() || { x: 0, y: 0 };
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [isFullscreen]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    
    const newX = e.clientX - panStartRef.current.x;
    const newY = e.clientY - panStartRef.current.y;
    panOffsetRef.current = { x: newX, y: newY };
    
    const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
    if (renderer) {
      renderer.setPan(newX, newY);
      if (simRef.current) {
        renderer.render(simRef.current.getGrid());
      }
    }
  }, [isPanning, isFullscreen]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistanceRef.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      const renderer = fullscreenRendererRef.current;
      const pan = renderer?.getPan() || { x: 0, y: 0 };
      panStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (touchStartDistanceRef.current > 0) {
        const scale = distance / touchStartDistanceRef.current;
        const newZoom = Math.max(0.1, Math.min(5, lastZoomRef.current * scale));
        setZoom(newZoom);
        
        if (fullscreenRendererRef.current) {
          fullscreenRendererRef.current.setZoom(newZoom);
          if (simRef.current) {
            fullscreenRendererRef.current.render(simRef.current.getGrid());
          }
        }
      }
    } else if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const newX = touch.clientX - panStartRef.current.x;
      const newY = touch.clientY - panStartRef.current.y;
      panOffsetRef.current = { x: newX, y: newY };
      
      if (fullscreenRendererRef.current) {
        fullscreenRendererRef.current.setPan(newX, newY);
        if (simRef.current) {
          fullscreenRendererRef.current.render(simRef.current.getGrid());
        }
      }
    }
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchStartDistanceRef.current = 0;
  }, []);

  const resetView = () => {
    setZoom(1);
    panOffsetRef.current = { x: 0, y: 0 };
    
    const renderer = isFullscreen ? fullscreenRendererRef.current : desktopRendererRef.current;
    if (renderer) {
      renderer.setPan(0, 0);
      renderer.setZoom(1);
      if (simRef.current) {
        renderer.render(simRef.current.getGrid());
      }
    }
  };

  useEffect(() => {
    const canvas = isFullscreen ? fullscreenCanvasRef.current : desktopCanvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel, isFullscreen]);

  return (
    <>
      <Container>
        <MaxWidth>
          <Header>
            <Title>Cellular Automata</Title>
            <Subtitle>Configure and explore Conway's Game of Life</Subtitle>
          </Header>

          <ViewButton onClick={() => { setIsFullscreen(true); setIsPlaying(true); }}>
            <Maximize size={24} />
            View Simulation
          </ViewButton>

          <VideoWrapper>
            <Canvas
              ref={desktopCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            <Overlay>
              <OverlayRow>
                <span>Generation:</span>
                <span>{generation}</span>
              </OverlayRow>
              <OverlayRow>
                <span>Population:</span>
                <span>{population}</span>
              </OverlayRow>
            </Overlay>

            <Controls>
              <ControlBtn $primary onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </ControlBtn>
              <ControlBtn onClick={handleReset}>
                <RotateCcw size={18} />
              </ControlBtn>
              <ControlBtn onClick={() => setShowGrid(!showGrid)}>
                <Grid3X3 size={18} />
              </ControlBtn>
              <ControlBtn onClick={resetView}>
                <Maximize size={18} />
              </ControlBtn>
            </Controls>
          </VideoWrapper>

          <Section>
            <SectionTitle>
              <Settings size={20} />
              Controls
            </SectionTitle>
            
            <FormGroup>
              <Row>
                <Btn onClick={handleReset}>
                  <RotateCcw size={18} />
                  Randomize
                </Btn>
                <ZoomGroup>
                  <ZoomBtn onClick={() => setCellSize(Math.max(2, cellSize - 1))}>
                    <ZoomOut size={16} />
                  </ZoomBtn>
                  <Badge>{cellSize}px</Badge>
                  <ZoomBtn onClick={() => setCellSize(Math.min(20, cellSize + 1))}>
                    <ZoomIn size={16} />
                  </ZoomBtn>
                </ZoomGroup>
                <Btn $active={showGrid} onClick={() => setShowGrid(!showGrid)}>
                  <Grid3X3 size={18} />
                  Grid
                </Btn>
              </Row>
            </FormGroup>

            <FormGroup>
              <SliderLabel>Speed: {simSpeed}x</SliderLabel>
              <Slider
                type="range"
                min={1}
                max={10}
                value={simSpeed}
                onChange={(e) => setSimSpeed(parseInt(e.target.value))}
              />
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>
              <Palette size={20} />
              Visual Settings
            </SectionTitle>
            
            <FormGroup>
              <Label>Color Mode</Label>
              <Select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}>
                <option value="none">Single Color</option>
                <option value="age">Age Based</option>
                <option value="rainbow">Rainbow</option>
                <option value="heat">Heat Map</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Rule Variant</Label>
              <Select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
                <option value="conway">Conway's Life</option>
                <option value="highlife">HighLife</option>
                <option value="daynight">Day & Night</option>
                <option value="seeds">Seeds</option>
                <option value="coral">Coral</option>
                <option value="amoeba">Amoeba</option>
              </Select>
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>
              <Shapes size={20} />
              Patterns
            </SectionTitle>
            
            <PatternGrid>
              {PATTERNS.map((p) => (
                <PatternCard key={p.name} onClick={() => handleLoadPattern(p)}>
                  <PatternName>{p.name}</PatternName>
                  <PatternDesc>{p.description}</PatternDesc>
                </PatternCard>
              ))}
            </PatternGrid>
          </Section>
        </MaxWidth>
      </Container>

      <Fullscreen $show={isFullscreen}>
        <FSCanvas
          ref={fullscreenCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        <FSOverlay>
          <OverlayRow>
            <span>Generation:</span>
            <span>{generation}</span>
          </OverlayRow>
          <OverlayRow>
            <span>Population:</span>
            <span>{population}</span>
          </OverlayRow>
        </FSOverlay>

        <ZoomInd>{(zoom * 100).toFixed(0)}%</ZoomInd>

        <Hint>Pinch or scroll to zoom • Drag to pan</Hint>

        <FSControls>
          <FSBtn $primary onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </FSBtn>
          <FSBtn onClick={handleReset}>
            <RotateCcw size={20} />
          </FSBtn>
          <FSBtn onClick={() => setShowGrid(!showGrid)}>
            <Grid3X3 size={20} />
          </FSBtn>
          <FSBtn onClick={resetView}>
            <Maximize size={20} />
          </FSBtn>
        </FSControls>

        <ExitBtn onClick={() => { setIsFullscreen(false); setIsPlaying(false); }}>
          <X size={20} />
        </ExitBtn>
      </Fullscreen>
    </>
  );
}