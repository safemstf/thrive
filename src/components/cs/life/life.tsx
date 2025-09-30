'use client'
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, RotateCcw, Palette, ZoomIn, ZoomOut, Grid3X3,
  BarChart3
} from "lucide-react";

import styled from "styled-components";

import {
  SimulationContainer,
  VideoSection,
  CanvasContainer as SharedCanvasContainer,
  SimCanvas,
  HUD,
  ControlsSection,
  TabContent,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  SpeedIndicator
} from '../simulationHub.styles';

// --------------------------
// Local small layout helpers
// --------------------------
const PageWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem;
`;

/* Use a responsive grid so right column collapses on small screens */
const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* VideoInner wraps the canvas and the control bar (stacked vertically). */
const VideoInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* more breathing room */
  width: 100%;
`;

/* LocalControlsBar: horizontal bar below canvas that contains playback buttons and sliders. */
const LocalControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  background: rgba(0,0,0,0.65);
  border-radius: 12px;
  border: 1px solid rgba(59,130,246,0.18);
  box-shadow: 0 6px 18px rgba(0,0,0,0.22);

  button {
    background: transparent;
    border: none;
    color: #e2e8f0;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform .12s ease, background .12s ease;
  }
  button:hover {
    background: rgba(59,130,246,0.08);
    transform: translateY(-2px);
  }
  .sizeBadge {
    padding: 0.35rem 0.6rem;
    font-size: 0.875rem;
    color: #e2e8f0;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    font-family: monospace;
  }
  input[type="range"] {
    width: 160px;
    height: 4px;
    background: rgba(59,130,246,0.18);
    border-radius: 999px;
    outline: none;
    -webkit-appearance: none;
  }
  @media (max-width: 900px) {
    flex-wrap: wrap;
  }
`;

const SpeedBadge = styled.div`
  margin-left: auto;
  padding: 0.5rem 0.9rem;
  background: rgba(0,0,0,0.6);
  border-radius: 999px;
  color: #3b82f6;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  border: 1px solid rgba(59,130,246,0.14);
`;

const LocalTabBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 0.5rem;
  width: 100%;
  button {
    padding: 0.6rem 1.1rem;
    background: rgba(0,0,0,0.55);
    color: #cbd5e1;
    border: 1px solid rgba(59,130,246,0.12);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    transition: transform .12s ease, background .12s ease;
  }
  button.active {
    background: rgba(59,130,246,0.12);
    color: #3b82f6;
    border-color: rgba(59,130,246,0.28);
    transform: translateY(-2px);
  }
  @media (max-width: 700px) {
    gap: 0.25rem;
    button { padding: 0.45rem 0.8rem; font-size: 0.9rem; }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.25rem;
`;
const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 300;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
`;
const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.85;
  margin: 0;
`;

const StatList = styled.div`
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: monospace;
`;

/* Slight wrapper to observe size of the video area */
const CanvasWrapper = styled(SharedCanvasContainer)`
  width: 100%;
  height: 100%;
  min-height: 160px;
`;

/* --------------------------
   Constants / Types
   -------------------------- */
const INITIAL_CANVAS_W = 800;
const INITIAL_CANVAS_H = 600;
const INITIAL_CELL_SIZE = 6;

type ColorMode = "none" | "age" | "rainbow" | "heat" | "energy" | "blend" | "trails";
type RenderMode = "classic" | "impressionist" | "flowy" | "arcade" | "particle" | "organic";
type Variant = "conway" | "highlife" | "daynight" | "seeds" | "coral" | "amoeba" | "life34" | "diamoeba" | "maze" | "fredkin";

type Pattern = { name: string; matrix: number[][]; category: string; description: string; };
interface Props { isDark?: boolean; isRunning?: boolean; speed?: number; }
interface RuleSet { birth: number[]; survive: number[]; }

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

const PATTERNS: Pattern[] = [
  { name: "Blinker", category: "oscillators", description: "Period-2", matrix: [[0,1,0],[0,1,0],[0,1,0]] },
  { name: "Glider", category: "spaceships", description: "Diagonal", matrix: [[0,1,0],[0,0,1],[1,1,1]] },
  { name: "Block", category: "still", description: "2×2 still", matrix: [[1,1],[1,1]] },
  { name: "R-pentomino", category: "methuselahs", description: "Chaotic", matrix: [[0,1,1],[1,1,0],[0,1,0]] }
];

// --------------------------
// Component
// --------------------------
export default function LifeSimulation({
  isDark = false,
  isRunning: externalIsRunning = false,
  speed: externalSpeed = 1
}: Props) {
  // refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gridRef = useRef<Uint8Array | null>(null);
  const colorDataRef = useRef<Uint32Array | null>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const prevColsRef = useRef<number>(0);
  const prevRowsRef = useRef<number>(0);

  // container ref for measuring available layout space
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // state
  const [layoutSize, setLayoutSize] = useState({ w: INITIAL_CANVAS_W, h: INITIAL_CANVAS_H }); // CSS pixels
  const [cellSize, setCellSize] = useState(INITIAL_CELL_SIZE);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const [colorMode, setColorMode] = useState<ColorMode>("rainbow");
  const [renderMode, setRenderMode] = useState<RenderMode>("classic");
  const [variant, setVariant] = useState<Variant>("conway");
  const [showGrid, setShowGrid] = useState(false);
  const [isPlaying, setIsPlaying] = useState(externalIsRunning);
  const [simSpeed, setSimSpeed] = useState(externalSpeed);

  // active tab for right panel
  const [activeTab, setActiveTab] = useState<"settings" | "patterns">("settings");

  // derived (recomputed each render from layoutSize and cellSize)
  const COLS = Math.max(1, Math.floor(layoutSize.w / cellSize));
  const ROWS = Math.max(1, Math.floor(layoutSize.h / cellSize));
  const GRID_SIZE = ROWS * COLS;

  // sync external props
  useEffect(() => setIsPlaying(externalIsRunning), [externalIsRunning]);
  useEffect(() => setSimSpeed(externalSpeed), [externalSpeed]);

  /* -------------------------
     Resize handling
     - Observe the canvas container and adapt layoutWidth/layoutHeight.
     - Then update <canvas> attributes and scale context to devicePixelRatio.
     - Resize grid with copying of overlapping cells (keeps content on resize).
  ------------------------- */
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const el = canvasContainerRef.current;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const w = Math.max(64, Math.floor(cr.width)); // avoid zero
        const h = Math.max(64, Math.floor(cr.height));
        setLayoutSize({ w, h });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // apply layoutSize -> canvas DOM attributes and context transform for DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    // set css size
    canvas.style.width = `${layoutSize.w}px`;
    canvas.style.height = `${layoutSize.h}px`;
    // set internal pixel resolution
    canvas.width = Math.floor(layoutSize.w * dpr);
    canvas.height = Math.floor(layoutSize.h * dpr);

    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      // scale drawing operations so we can use CSS pixels in drawing code
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
    }

    // resize/rehydrate grid when dimensions change
    const newCols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const newRows = Math.max(1, Math.floor(layoutSize.h / cellSize));
    const prevCols = prevColsRef.current || 0;
    const prevRows = prevRowsRef.current || 0;

    if (!gridRef.current || prevCols === 0 || prevRows === 0) {
      // first time create grid sized to new dims
      gridRef.current = new Uint8Array(newCols * newRows);
      colorDataRef.current = new Uint32Array(newCols * newRows);
      // randomize a bit
      for (let i = 0; i < newCols * newRows; i++) {
        if (Math.random() > 0.7) {
          gridRef.current[i] = 1;
          colorDataRef.current[i] = 0xFF000000 | Math.floor(Math.random() * 0xFFFFFF);
        }
      }
      prevColsRef.current = newCols;
      prevRowsRef.current = newRows;
      setGeneration(0);
      // compute population
      let cnt = 0;
      for (let i = 0; i < gridRef.current.length; i++) if (gridRef.current[i] > 0) cnt++;
      setPopulation(cnt);
      return;
    }

    // if size changed, create new arrays and copy overlapping region
    if (newCols !== prevCols || newRows !== prevRows) {
      const newGrid = new Uint8Array(newCols * newRows);
      const newColor = new Uint32Array(newCols * newRows);

      const copyCols = Math.min(prevCols, newCols);
      const copyRows = Math.min(prevRows, newRows);

      for (let r = 0; r < copyRows; r++) {
        for (let c = 0; c < copyCols; c++) {
          const oldIndex = r * prevCols + c;
          const newIndex = r * newCols + c;
          newGrid[newIndex] = gridRef.current![oldIndex];
          newColor[newIndex] = colorDataRef.current ? colorDataRef.current[oldIndex] : 0;
        }
      }

      gridRef.current = newGrid;
      colorDataRef.current = newColor;
      prevColsRef.current = newCols;
      prevRowsRef.current = newRows;

      // recompute population
      let cnt = 0;
      for (let i = 0; i < gridRef.current.length; i++) if (gridRef.current[i] > 0) cnt++;
      setPopulation(cnt);
    }
  }, [layoutSize, cellSize]);

  /* -------------------------
     Utility: countPopulation + initializeGrid (works with current GRID_SIZE)
  ------------------------- */
  const countPopulation = useCallback(() => {
    if (!gridRef.current) return;
    let cnt = 0;
    for (let i = 0; i < gridRef.current.length; i++) if (gridRef.current[i] > 0) cnt++;
    setPopulation(cnt);
  }, []);

  const initializeGrid = useCallback(() => {
    const cols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const rows = Math.max(1, Math.floor(layoutSize.h / cellSize));
    const size = cols * rows;
    gridRef.current = new Uint8Array(size);
    colorDataRef.current = new Uint32Array(size);
    for (let i = 0; i < size; i++) {
      if (Math.random() > 0.7) {
        gridRef.current[i] = 1;
        colorDataRef.current[i] = 0xFF000000 | Math.floor(Math.random() * 0xFFFFFF);
      }
    }
    prevColsRef.current = cols;
    prevRowsRef.current = rows;
    setGeneration(0);
    countPopulation();
  }, [layoutSize.w, layoutSize.h, cellSize, countPopulation]);

  /* -------------------------
     Neighbors / update logic (wrap-around)
  ------------------------- */
  const getNeighborCount = useCallback((index: number, cols: number, rows: number): number => {
    if (!gridRef.current) return 0;
    const row = Math.floor(index / cols);
    const col = index % cols;
    let cnt = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        let nr = row + dr;
        let nc = col + dc;
        nr = (nr + rows) % rows;
        nc = (nc + cols) % cols;
        if (gridRef.current[nr * cols + nc] > 0) cnt++;
      }
    }
    return cnt;
  }, []);

  const updateGrid = useCallback(() => {
    if (!gridRef.current) return;
    const cols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const rows = Math.max(1, Math.floor(layoutSize.h / cellSize));
    const size = cols * rows;
    const newGrid = new Uint8Array(size);
    const rules = RULES_LOOKUP[variant];

    for (let i = 0; i < size; i++) {
      const alive = gridRef.current[i] > 0;
      const neighbors = getNeighborCount(i, cols, rows);
      const shouldLive = alive ? rules.survive.includes(neighbors) : rules.birth.includes(neighbors);
      if (shouldLive) {
        newGrid[i] = alive ? Math.min(255, (gridRef.current[i] || 1) + 1) : 1;
      }
    }
    gridRef.current = newGrid;
    setGeneration(g => g + 1);
    countPopulation();
  }, [layoutSize.w, layoutSize.h, cellSize, variant, getNeighborCount, countPopulation]);

  /* -------------------------
     hsl->rgb
  ------------------------- */
  const hslToRgb = useCallback((h: number, s: number, l: number): [number, number, number] => {
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
  }, []);

  /* -------------------------
     Rendering using scaled ctx (we use fillRect per cell; simple & correct with DPR scaling)
  ------------------------- */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !gridRef.current) return;

    // clear
    ctx.fillStyle = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    const cols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const rows = Math.max(1, Math.floor(layoutSize.h / cellSize));

    // draw cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gridIndex = row * cols + col;
        const cell = gridRef.current[gridIndex];
        if (cell > 0) {
          const x = col * cellSize;
          const y = row * cellSize;
          let r = 0, g = 0, b = 0;
          switch (colorMode) {
            case "age": {
              const hue = (cell * 15) % 360;
              [r, g, b] = hslToRgb(hue / 360, 0.7, 0.6);
              break;
            }
            case "rainbow": {
              const rainbowHue = (cell * 12) % 360;
              [r, g, b] = hslToRgb(rainbowHue / 360, 0.8, 0.5);
              break;
            }
            case "heat": {
              const heat = Math.min(1, cell / 20);
              r = Math.floor(255 * heat);
              g = Math.floor(255 * (1 - heat) * heat * 4);
              b = Math.floor(50 * (1 - heat));
              break;
            }
            default:
              r = isDark ? 74 : 34;
              g = isDark ? 222 : 197;
              b = isDark ? 128 : 94;
          }
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    // grid overlay
    if (showGrid && cellSize >= 4) {
      ctx.strokeStyle = isDark ? "rgba(100, 116, 139, 0.2)" : "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= layoutSize.w; x += cellSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, layoutSize.h);
      }
      for (let y = 0; y <= layoutSize.h; y += cellSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(layoutSize.w, y + 0.5);
      }
      ctx.stroke();
    }
  }, [layoutSize.w, layoutSize.h, cellSize, colorMode, isDark, showGrid, hslToRgb]);

  /* -------------------------
     Animation loop
  ------------------------- */
  useEffect(() => {
    if (!isPlaying) return;
    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;
      if (elapsed >= 100 / Math.max(1, simSpeed)) {
        updateGrid();
        lastUpdateRef.current = timestamp;
      }
      render();
      if (isPlaying) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, simSpeed, updateGrid, render]);

  /* -------------------------
     Init: only once, when component mounts ensure grid exists and canvas ctx is created
  ------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = `${layoutSize.w}px`;
      canvas.style.height = `${layoutSize.h}px`;
      canvas.width = Math.floor(layoutSize.w * dpr);
      canvas.height = Math.floor(layoutSize.h * dpr);
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctxRef.current = ctx;
      }
    }
    // initialize grid if missing
    if (!gridRef.current) initializeGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------
     Canvas click -> toggle cell (works correctly with layout scaling)
  ------------------------- */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !gridRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    const cols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const rows = Math.max(1, Math.floor(layoutSize.h / cellSize));
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const index = row * cols + col;
      gridRef.current[index] = gridRef.current[index] > 0 ? 0 : 1;
      countPopulation();
      render();
    }
  }, [cellSize, layoutSize.w, layoutSize.h, countPopulation, render]);

  /* -------------------------
     Load pattern (centers pattern in current grid)
  ------------------------- */
  const loadPattern = useCallback((pattern: Pattern) => {
    if (!gridRef.current) return;
    const cols = Math.max(1, Math.floor(layoutSize.w / cellSize));
    const rows = Math.max(1, Math.floor(layoutSize.h / cellSize));
    gridRef.current.fill(0);
    colorDataRef.current = new Uint32Array(cols * rows);
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);
    const offsetX = Math.floor(pattern.matrix[0].length / 2);
    const offsetY = Math.floor(pattern.matrix.length / 2);
    for (let r = 0; r < pattern.matrix.length; r++) {
      for (let c = 0; c < pattern.matrix[0].length; c++) {
        const gridRow = centerY - offsetY + r;
        const gridCol = centerX - offsetX + c;
        if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
          const index = gridRow * cols + gridCol;
          gridRef.current[index] = pattern.matrix[r][c];
          colorDataRef.current[index] = 0xFF000000 | Math.floor(Math.random() * 0xFFFFFF);
        }
      }
    }
    setGeneration(0);
    countPopulation();
    render();
  }, [layoutSize.w, layoutSize.h, cellSize, countPopulation, render]);

  return (
    <SimulationContainer $isDark={isDark}>
      <PageWrapper>
        <Header>
          <Title>Cellular Automata</Title>
          <Subtitle>High-performance Conway's Game of Life simulation</Subtitle>
        </Header>

        <GridLayout>
          {/* Left column: video + controls stacked */}
          <div>
            <VideoInner>
              <VideoSection>
                <CanvasWrapper ref={canvasContainerRef}>
                  <SimCanvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                  />
                  {/* HUD overlay */}
                  <HUD $isDark={isDark}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={16} />
                      <strong>Statistics</strong>
                    </div>

                    <StatList>
                      <StatRow><span>Generation:</span><span>{generation}</span></StatRow>
                      <StatRow><span>Population:</span><span>{population}</span></StatRow>
                      <StatRow><span>Grid Size:</span><span>{ROWS}×{COLS}</span></StatRow>
                    </StatList>
                  </HUD>
                </CanvasWrapper>
              </VideoSection>

              {/* Controls bar below the canvas (YouTube-style layout) */}
              <LocalControlsBar>
                <button onClick={() => setIsPlaying(!isPlaying)} aria-label="Play/Pause">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button onClick={initializeGrid} aria-label="Randomize">
                  <RotateCcw size={16} />
                </button>

                <button onClick={() => { setCellSize(Math.max(2, cellSize - 1)); }} aria-label="Zoom out">
                  <ZoomOut size={16} />
                </button>

                <div className="sizeBadge">{cellSize}px</div>

                <button onClick={() => { setCellSize(Math.min(20, cellSize + 1)); }} aria-label="Zoom in">
                  <ZoomIn size={16} />
                </button>

                <button onClick={() => setShowGrid(!showGrid)} aria-label="Toggle grid">
                  <Grid3X3 size={16} />
                </button>

                <input
                  type="range"
                  min={1}
                  max={10}
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                />

                <SpeedBadge>Speed: {simSpeed}x</SpeedBadge>
              </LocalControlsBar>

              {/* Local tab bar below video (controls the right-side panel) */}
              <LocalTabBar>
                <button
                  className={activeTab === "settings" ? "active" : ""}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
                <button
                  className={activeTab === "patterns" ? "active" : ""}
                  onClick={() => setActiveTab("patterns")}
                >
                  Patterns
                </button>
              </LocalTabBar>
            </VideoInner>
          </div>

          {/* Right column: settings / patterns */}
          <ControlsSection $isDark={isDark}>
            <TabContent>
              {activeTab === "settings" ? (
                <>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={16} />
                    <strong>Visual Settings</strong>
                  </div>

                  <ParameterControl>
                    <div className="header"><div className="label">Color Mode</div></div>
                    <select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}>
                      <option value="none">Single Color</option>
                      <option value="age">Age Based</option>
                      <option value="rainbow">Rainbow</option>
                      <option value="heat">Heat Map</option>
                    </select>
                  </ParameterControl>

                  <ParameterControl>
                    <div className="header"><div className="label">Rule Variant</div></div>
                    <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
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
                  </ParameterControl>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '0.75rem' }}><strong>Patterns</strong></div>
                  <InterventionGrid>
                    {PATTERNS.map((pattern) => (
                      <InterventionCard key={pattern.name} onClick={() => loadPattern(pattern)}>
                        <div className="name">{pattern.name}</div>
                        <div className="efficacy">{pattern.description}</div>
                      </InterventionCard>
                    ))}
                  </InterventionGrid>
                </>
              )}
            </TabContent>
          </ControlsSection>
        </GridLayout>
      </PageWrapper>
    </SimulationContainer>
  );
}
