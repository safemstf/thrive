'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createGlobalStyle } from 'styled-components';
import {
  SimState, Agent, NEATGenome, Particle, Obstacle, Species,
  createSimState, stepSim, nextGeneration,
  PI, L, HEAD_RADIUS, MOTORS, AGENT_COLORS,
  N_INPUT, N_OUTPUT, STANDING_PELVIS_H, STANDING_COM_H, STANDING_HEAD_H,
  getObstaclesNear,
} from './td.logic';

// ── Character costumes ─────────────────────────────────────────
// Each of the 10 agent slots has a permanent character identity.
// drawExtras is called after the stick-figure with the same globalAlpha.

type DrawFn = (
  ctx: CanvasRenderingContext2D,
  p:   Particle[],
  sx:  (x: number) => number,
  sy:  (y: number) => number,
  alpha: number,
  col:   string,
) => void;

const noop: DrawFn = () => {};
// Generate character labels dynamically for any population size
const CHARACTERS: Array<{ name: string; drawExtras: DrawFn }> = Array.from(
  { length: 15 },
  (_, i) => ({ name: String(i + 1), drawExtras: noop }),
);

// ── Alto's Adventure Color Palette ─────────────────────────────
const ALTO = {
  skyTop: '#0f0a2a', skyMid: '#2a1555', skyAmber: '#d4804a', skyHorizon: '#c05a30',
  groundTop: '#2a1a10', groundBot: '#1a0e08', groundLine: '#5a3820',
  mtFar: '#151030', mtMid: '#25152a', mtNear: '#351a18',
  hudBg: 'rgba(35,20,12,0.88)', hudBorder: 'rgba(255,190,140,0.12)',
  hudText: '#a08060', hudVal: '#e8c090', hudGreen: '#70c080', hudAmber: '#f0a050', hudRed: '#c05040',
  barBg: 'rgba(35,20,12,0.92)', barBorder: 'rgba(255,190,140,0.15)',
  btnText: '#a08060', btnHover: '#e8c090', btnActive: '#f0a050',
};

// ── Styles ────────────────────────────────────────────────────

const NeatStyles = createGlobalStyle`
  .neat-root {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: ${ALTO.groundBot};
    user-select: none;
  }
  .neat-canvas {
    display: block;
    width: 100%;
    height: auto;
  }

  /* HUD — top-right stats */
  .neat-hud {
    position: absolute;
    top: 0.75rem; right: 0.75rem;
    background: ${ALTO.hudBg};
    backdrop-filter: blur(8px);
    border: 1px solid ${ALTO.hudBorder};
    border-radius: 10px;
    padding: 0.6rem 0.85rem;
    min-width: 148px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.72rem;
    color: ${ALTO.hudText};
    line-height: 1.8;
  }
  .neat-hud-row { display: flex; justify-content: space-between; gap: 0.75rem; }
  .neat-hud .label { color: #7a6050; }
  .neat-hud .val   { color: ${ALTO.hudVal}; font-weight: 600; }
  .neat-hud .best  { color: ${ALTO.hudGreen}; font-weight: 600; }
  .neat-hud .champ { color: ${ALTO.hudAmber}; font-weight: 600; }
  .neat-hud-divider { height: 1px; background: rgba(255,190,140,0.08); margin: 0.3rem 0; }

  /* NN overlay — top-left */
  .neat-nn {
    position: absolute;
    top: 0.75rem; left: 0.75rem;
    background: ${ALTO.hudBg};
    backdrop-filter: blur(8px);
    border: 1px solid ${ALTO.hudBorder};
    border-radius: 10px;
    padding: 0.4rem 0.5rem 0.5rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 0.6rem;
    color: #7a6050;
  }
  .neat-nn-title {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 0.65rem;
    color: ${ALTO.hudAmber};
    margin-bottom: 0.3rem;
    letter-spacing: 0.02em;
  }

  /* Fitness history bar */
  .neat-history {
    position: absolute;
    bottom: 4rem; left: 0.75rem;
    background: ${ALTO.hudBg};
    backdrop-filter: blur(6px);
    border: 1px solid ${ALTO.hudBorder};
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
    display: flex;
    align-items: flex-end;
    gap: 2px;
  }

  /* Control pill bar */
  .neat-bar {
    position: absolute;
    bottom: 2.75rem; left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: ${ALTO.barBg};
    backdrop-filter: blur(10px);
    border: 1px solid ${ALTO.barBorder};
    border-radius: 50px;
    padding: 0.3rem 0.7rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    white-space: nowrap;
  }
  .neat-bar.theater-top { bottom: auto; top: 0.65rem; }

  .neat-btn {
    background: none;
    border: none;
    color: ${ALTO.btnText};
    cursor: pointer;
    padding: 0.3rem 0.55rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .neat-btn:hover  { background: rgba(255,190,140,0.10); color: ${ALTO.btnHover}; }
  .neat-btn.active { background: rgba(240,160,80,0.20);  color: ${ALTO.btnActive}; }
  .neat-btn.danger { background: rgba(192,80,64,0.12);   color: ${ALTO.hudRed}; }
  .neat-divider    { width: 1px; height: 18px; background: rgba(255,190,140,0.10); margin: 0 0.1rem; }

  /* Population dots */
  .neat-pop {
    position: absolute;
    bottom: 1.1rem; left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    align-items: center;
  }
  .neat-pop-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    transition: all 0.3s;
  }
`;

// ── Canvas dimensions ─────────────────────────────────────────

const CW       = 900;  // logical canvas width
const CH       = 460;  // taller canvas for better proportions
const GROUND_Y = 360;  // ground at ~78% — leaves room for characters (~155px tall) above

// ── Rendering helpers ─────────────────────────────────────────

function colorWithAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // HSL → HSLA
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(')', `,${alpha})`);
  }
  return color;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  camX: number,
  startX: number,
) {
  // ── Alto's Adventure sky gradient ──
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, ALTO.skyTop);
  sky.addColorStop(0.35, ALTO.skyMid);
  sky.addColorStop(0.75, ALTO.skyAmber);
  sky.addColorStop(1, ALTO.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CW, GROUND_Y);

  // ── Stars — warm twinkle ──
  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    const wx  = (i * 137.508) % 4000;
    const wy  = (i * 53.71)   % (GROUND_Y * 0.5);  // only upper sky
    const sz  = (i * 0.43)    % 1.2 + 0.3;
    const twinkle = 0.3 + 0.3 * Math.sin(now * 0.001 + i * 2.3);
    const sx  = ((wx - camX * 0.05) % CW + CW) % CW;
    ctx.beginPath();
    ctx.arc(sx, wy, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,230,200,${twinkle})`;
    ctx.fill();
  }

  // ── Parallax mountain silhouettes (3 layers) ──
  const mtLayers = [
    { parallax: 0.03, baseY: GROUND_Y - 100, color: ALTO.mtFar,  freqs: [0.003, 0.008], amps: [50, 20] },
    { parallax: 0.10, baseY: GROUND_Y - 60,  color: ALTO.mtMid,  freqs: [0.005, 0.012], amps: [40, 18] },
    { parallax: 0.20, baseY: GROUND_Y - 30,  color: ALTO.mtNear, freqs: [0.008, 0.020], amps: [30, 12] },
  ];
  for (const layer of mtLayers) {
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= CW; x += 2) {
      const wx = x + camX * layer.parallax;
      const h = layer.amps[0] * Math.sin(wx * layer.freqs[0])
              + layer.amps[1] * Math.sin(wx * layer.freqs[1]);
      ctx.lineTo(x, layer.baseY - Math.max(0, h));
    }
    ctx.lineTo(CW, GROUND_Y);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
  }

  // ── Ground fill — warm earth ──
  const gnd = ctx.createLinearGradient(0, GROUND_Y, 0, CH);
  gnd.addColorStop(0, ALTO.groundTop);
  gnd.addColorStop(1, ALTO.groundBot);
  ctx.fillStyle = gnd;
  ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);

  // Ground surface line
  ctx.strokeStyle = ALTO.groundLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y); ctx.lineTo(CW, GROUND_Y);
  ctx.stroke();

  // ── Distance ticks ──
  const firstWx = Math.floor(camX / 100) * 100;
  for (let wx = firstWx; wx < camX + CW + 100; wx += 100) {
    if (wx < startX) continue;
    const sx   = wx - camX;
    const dist = wx - startX;
    if (sx < -10 || sx > CW + 10) continue;

    const isMajor = dist % 500 === 0;
    ctx.strokeStyle = isMajor ? '#5a3820' : '#3a2010';
    ctx.lineWidth   = isMajor ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y);
    ctx.lineTo(sx, GROUND_Y + (isMajor ? 12 : 6));
    ctx.stroke();

    if (dist % 200 === 0) {
      ctx.fillStyle = '#5a3820';
      ctx.font      = '10px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dist === 0 ? 'START' : `${dist}`, sx, GROUND_Y + 22);
    }
  }

  // ── Grass strokes along ground line ──
  for (let i = 0; i < 80; i++) {
    const wx = (i * 73.7) % 2000;
    const px = ((wx - camX * 0.95) % CW + CW) % CW;
    const h = 3 + (i % 4) * 1.5;
    ctx.strokeStyle = `rgba(60,80,40,${0.15 + (i % 3) * 0.08})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(px, GROUND_Y);
    ctx.lineTo(px + (i % 2 ? 1 : -1), GROUND_Y - h);
    ctx.stroke();
  }
}

function drawFootTrail(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  camX: number,  // world X of left screen edge
) {
  const isChamp = agent.rank === 0;
  for (const pt of agent.ragdoll.footTrail) {
    const sx = pt.x - camX;  // screenX = worldX - camLeft
    if (sx < -20 || sx > CW + 20) continue;
    ctx.beginPath();
    const r = isChamp ? (pt.side === 'l' ? 3.5 : 3) : (pt.side === 'l' ? 2.5 : 2);
    ctx.arc(sx, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = colorWithAlpha(agent.ragdoll.color, isChamp ? 0.45 : 0.2);
    ctx.fill();
  }
}

function drawRagdoll(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  camX: number,  // world X of left screen edge
) {
  const p       = agent.ragdoll.particles;
  const isChamp = agent.rank === 0;
  const alive   = agent.ragdoll.alive;
  const alpha   = alive ? (isChamp ? 1.0 : 0.55) : 0.2;
  const col     = agent.ragdoll.color;

  // screenX = worldX - camLeft
  const sx = (wx: number) => wx - camX;
  const sy = (wy: number) => wy;

  ctx.save();
  ctx.globalAlpha = alpha;

  const lw = isChamp ? 3 : 2;
  ctx.lineCap = 'round';

  // Back limbs (R = rendered behind)
  const drawSeg = (ai: number, bi: number, aMult = 1.0) => {
    const a = p[ai], b = p[bi];
    ctx.globalAlpha = alpha * aMult;
    ctx.strokeStyle = col;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(sx(a.x), sy(a.y));
    ctx.lineTo(sx(b.x), sy(b.y));
    ctx.stroke();
  };

  // Draw back leg + foot first
  drawSeg(PI.PELVIS,  PI.R_KNEE,   0.55);
  drawSeg(PI.R_KNEE,  PI.R_FOOT,   0.55);
  drawSeg(PI.R_FOOT,  PI.R_TOE,    0.55);
  drawSeg(PI.CHEST,   PI.R_ELBOW,  0.5);
  drawSeg(PI.R_ELBOW, PI.R_HAND,   0.5);

  // Torso
  drawSeg(PI.HEAD,   PI.CHEST,  1.0);
  drawSeg(PI.CHEST,  PI.PELVIS, 1.0);

  // Front leg + foot
  drawSeg(PI.PELVIS,  PI.L_KNEE,  1.0);
  drawSeg(PI.L_KNEE,  PI.L_FOOT,  1.0);
  drawSeg(PI.L_FOOT,  PI.L_TOE,   1.0);
  drawSeg(PI.CHEST,   PI.L_ELBOW, 0.85);
  drawSeg(PI.L_ELBOW, PI.L_HAND,  0.85);

  // Joint dots
  ctx.globalAlpha = alpha * 0.7;
  for (const ji of [PI.PELVIS, PI.CHEST, PI.L_KNEE, PI.R_KNEE, PI.L_ELBOW, PI.R_ELBOW]) {
    ctx.beginPath();
    ctx.arc(sx(p[ji].x), sy(p[ji].y), 3, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }

  // Head circle
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(sx(p[PI.HEAD].x), sy(p[PI.HEAD].y), HEAD_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.fill();
  if (isChamp) {
    ctx.strokeStyle = 'rgba(240,160,80,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Character costume extras
  const charIdx = agent.rank;
  const char    = CHARACTERS[charIdx % CHARACTERS.length];
  if (char) char.drawExtras(ctx, p, sx, sy, alpha, col);

  // Character name label (small, above head)
  ctx.globalAlpha = alpha * (isChamp ? 0.95 : 0.55);
  ctx.font = isChamp ? 'bold 8px "DM Sans",sans-serif' : '7px "DM Sans",sans-serif';
  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  const nameY = sy(p[PI.HEAD].y) - HEAD_RADIUS - (isChamp ? 24 : 16);
  ctx.fillText(char?.name ?? '', sx(p[PI.HEAD].x), nameY);

  // Champion star + distance
  if (isChamp) {
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#f0a050';
    ctx.textAlign = 'center';
    ctx.fillText('★', sx(p[PI.HEAD].x), sy(p[PI.HEAD].y) - HEAD_RADIUS - 14);
    if (alive) {
      const dist = Math.round(agent.ragdoll.fitness);
      ctx.globalAlpha = 0.8;
      ctx.font = '9px "DM Sans",sans-serif';
      ctx.fillStyle = '#f0a050';
      ctx.fillText(`${dist}px`, sx(p[PI.HEAD].x), sy(p[PI.HEAD].y) - HEAD_RADIUS - 36);
    }
  }

  ctx.restore();
}

// ── NEAT Neural Network visualisation ────────────────────────
// Draws the variable-topology NEAT genome as a node-link diagram.
// Inputs on left, outputs on right, hidden nodes in middle columns
// ordered by ID (which reflects when they were added during evolution).

function drawNN(
  canvas: HTMLCanvasElement,
  agent: Agent,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const genome  = agent.genome;
  const inputs  = agent.lastInputs  ?? new Float32Array(N_INPUT);
  const outputs = agent.lastOutputs ?? new Float32Array(N_OUTPUT);

  // Run a forward pass to get hidden activations
  const activations = new Map<number, number>();
  for (let i = 0; i < N_INPUT; i++) activations.set(i, inputs[i]);
  const sortedHidden = [...genome.nodes].sort((a, b) => a.id - b.id);
  for (const n of sortedHidden) {
    let sum = n.bias;
    for (const c of genome.conns) {
      if (c.enabled && c.outNode === n.id) sum += (activations.get(c.inNode) ?? 0) * c.weight;
    }
    const x = Math.max(-5, Math.min(5, sum));
    activations.set(n.id, x * (27 + x * x) / (27 + 9 * x * x));
  }

  const PAD = 10;
  const inputX  = PAD + 6;
  const outputX = W - PAD - 6;

  // ── Group hidden nodes by their explicit layer tag ──
  const layerMap = new Map<number, number[]>();
  for (const n of genome.nodes) {
    const l = n.layer ?? 0;
    if (!layerMap.has(l)) layerMap.set(l, []);
    layerMap.get(l)!.push(n.id);
  }
  const layerDepths = [...layerMap.keys()].sort((a, b) => a - b);
  const nLayers = layerDepths.length || 1;

  // Build node position map
  const nodePos = new Map<number, { x: number; y: number }>();

  // Inputs: left column
  const iSpacing = (H - PAD * 2) / Math.max(N_INPUT - 1, 1);
  for (let i = 0; i < N_INPUT; i++) nodePos.set(i, { x: inputX, y: PAD + i * iSpacing });

  // Outputs: right column
  const oSpacing = (H - PAD * 2) / Math.max(N_OUTPUT - 1, 1);
  for (let o = 0; o < N_OUTPUT; o++) nodePos.set(N_INPUT + o, { x: outputX, y: PAD + o * oSpacing });

  // Hidden: spread across columns between input and output
  const hiddenXStart = inputX + 30;
  const hiddenXEnd   = outputX - 30;
  for (let li = 0; li < layerDepths.length; li++) {
    const depth = layerDepths[li];
    const nodesInLayer = layerMap.get(depth)!;
    const x = nLayers === 1
      ? (hiddenXStart + hiddenXEnd) / 2
      : hiddenXStart + (li / (nLayers - 1)) * (hiddenXEnd - hiddenXStart);
    const spacing = (H - PAD * 2) / Math.max(nodesInLayer.length, 1);
    const startY = PAD + (spacing * 0.5);
    nodesInLayer.forEach((id, idx) => {
      nodePos.set(id, { x, y: startY + idx * spacing });
    });
  }

  // ── Draw connections (only strong ones for clarity with large networks) ──
  const enabledConns = genome.conns.filter(c => c.enabled);
  // With 1000+ connections, only draw the top ~400 by weight magnitude
  const maxDraw = 400;
  const sorted = enabledConns.length > maxDraw
    ? [...enabledConns].sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)).slice(0, maxDraw)
    : enabledConns;

  ctx.lineWidth = 0.6;
  for (const c of sorted) {
    const src = nodePos.get(c.inNode);
    const dst = nodePos.get(c.outNode);
    if (!src || !dst) continue;
    const w = Math.abs(c.weight);
    const a = Math.min(w * 0.25, 0.45);
    ctx.strokeStyle = c.weight > 0
      ? `rgba(240,160,80,${a})`
      : `rgba(180,80,60,${a})`;
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(dst.x, dst.y);
    ctx.stroke();
  }

  // ── Draw nodes ──
  const nodeR = Math.max(1.5, Math.min(4, 120 / Math.max(genome.nodes.length, 1)));

  // Input nodes
  for (let i = 0; i < N_INPUT; i++) {
    const pos = nodePos.get(i)!;
    const brt = Math.abs(inputs[i]);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeR + 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120,180,120,${0.3 + brt * 0.7})`;
    ctx.fill();
  }

  // Hidden nodes — color by activation
  for (const n of genome.nodes) {
    const pos = nodePos.get(n.id);
    if (!pos) continue;
    const act = activations.get(n.id) ?? 0;
    const brt = Math.abs(act);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2);
    // Purple hue, brightness by activation
    ctx.fillStyle = `rgba(200,160,120,${0.2 + brt * 0.7})`;
    ctx.fill();
  }

  // Output nodes
  for (let o = 0; o < N_OUTPUT; o++) {
    const pos = nodePos.get(N_INPUT + o)!;
    const brt = Math.abs(outputs[o]);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeR + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,160,80,${0.3 + brt * 0.7})`;
    ctx.fill();
  }

  // Legend
  ctx.font      = '9px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(160,128,96,0.9)';
  ctx.textAlign = 'left';
  ctx.fillText(`${genome.nodes.length}H  ${enabledConns.length}C  ${nLayers}L`, PAD, H - 4);
}

// ── Fitness history mini-chart ────────────────────────────────

function drawHistory(canvas: HTMLCanvasElement, history: number[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (history.length < 2) return;

  const max  = Math.max(...history, 1);
  // Show last N bars that fit
  const barW = 3;
  const gap  = 1;
  const maxBars = Math.floor(W / (barW + gap));
  const show    = history.slice(-maxBars);

  // Draw a subtle baseline
  ctx.strokeStyle = 'rgba(90,56,32,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, H - 0.5); ctx.lineTo(W, H - 0.5);
  ctx.stroke();

  for (let i = 0; i < show.length; i++) {
    const bh    = Math.max(2, (show[i] / max) * (H - 2));
    const bx    = i * (barW + gap);
    const alpha = 0.25 + (i / show.length) * 0.75;
    // Gradient from teal to blue as fitness grows
    const g = ctx.createLinearGradient(0, H - bh, 0, H);
    g.addColorStop(0, `rgba(240,160,80,${alpha})`);
    g.addColorStop(1, `rgba(120,180,120,${alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(bx, H - bh, barW, bh);
  }
}

// ── Main component ────────────────────────────────────────────

interface Props {
  isRunning?:    boolean;
  speed?:        number;
  isTheaterMode?: boolean;
}

export default function EvolutionWalker({ isRunning = true, speed = 1, isTheaterMode = false }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const nnCanvasRef = useRef<HTMLCanvasElement>(null);
  const histCanvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef     = useRef<SimState | null>(null);
  const cameraXRef   = useRef(0);
  const rafRef       = useRef<number>(0);
  const isPlayingRef = useRef(isRunning);
  const speedRef     = useRef(speed);

  const [isPlaying,  setIsPlaying]  = useState(isRunning);
  const [localSpeed, setLocalSpeed] = useState(speed);
  const [display, setDisplay] = useState({
    generation: 1, time: 0, bestFitness: 0,
    allTimeBest: 0, alive: 15,
    champDist: 0, history: [] as number[],
    hiddenNodes: 0, activeConns: N_INPUT * N_OUTPUT,
    uprightPct: 0, champSteps: 0, champStandingTime: 0, comPct: 0, headPct: 0,
    stagnation: 0, gravityPct: 90,
    speciesCount: 0,
  });

  isPlayingRef.current = isPlaying;
  speedRef.current     = localSpeed;

  // Initialise simulation
  const initSim = useCallback(() => {
    stateRef.current = createSimState(GROUND_Y);
    cameraXRef.current = 0;
  }, []);

  useEffect(() => { initSim(); }, [initSim]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let lastTime = 0;
    const PHYSICS_DT = 1 / 60;

    function loop(now: number) {
      rafRef.current = requestAnimationFrame(loop);
      const state = stateRef.current;
      if (!state) return;

      const elapsed  = Math.min((now - lastTime) / 1000, 0.05);
      lastTime       = now;
      const steps    = isPlayingRef.current ? Math.round(speedRef.current) : 0;

      for (let s = 0; s < steps; s++) {
        const done = stepSim(state, PHYSICS_DT);
        if (done) {
          nextGeneration(state);
          break;
        }
      }

      // Camera: smoothly follow the leader (camX = world X of left screen edge)
      const leader = [...state.agents].sort((a, b) =>
        b.ragdoll.fitness - a.ragdoll.fitness
      )[0];
      const leaderX   = leader.ragdoll.particles[PI.PELVIS].x;
      const startX    = state.agents[0].ragdoll.startX; // for distance labels
      const targetCam = leaderX - CW * 0.3;             // keep leader at 30% from left
      cameraXRef.current += (targetCam - cameraXRef.current) * 0.07;
      const camX = Math.max(startX - CW * 0.15, cameraXRef.current); // don't pan left of spawn

      // Render — camX is the world X of the left screen edge
      ctx.clearRect(0, 0, CW, CH);
      drawBackground(ctx, camX, startX);

      // Generation progress bar (thin bar below ground)
      const progress = Math.min(1, Math.max(0, state.time - 0.5) / state.evalDuration);
      const barW = CW * 0.25;
      const barX = (CW - barW) / 2;
      const barY = GROUND_Y + 38;
      ctx.fillStyle = 'rgba(30,45,62,0.4)';
      ctx.fillRect(barX, barY, barW, 2.5);
      ctx.fillStyle = `rgba(240,160,80,${0.35 + progress * 0.4})`;
      ctx.fillRect(barX, barY, barW * progress, 2.5);

      // Draw obstacles (hurdles on the ground)
      const obstacles = getObstaclesNear(camX + CW / 2, CW, startX, GROUND_Y);
      for (const obs of obstacles) {
        const sx = obs.x - camX;
        if (sx + obs.w < -10 || sx > CW + 10) continue;
        const top = obs.groundY - obs.h;
        // Subtle gradient hurdle
        const grad = ctx.createLinearGradient(0, top, 0, obs.groundY);
        grad.addColorStop(0, 'rgba(240,160,80,0.35)');
        grad.addColorStop(1, 'rgba(240,160,80,0.12)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, top, obs.w, obs.h);
        // Top edge highlight
        ctx.strokeStyle = 'rgba(240,160,80,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, top); ctx.lineTo(sx + obs.w, top);
        ctx.stroke();
      }

      // All foot trails
      for (const agent of state.agents) drawFootTrail(ctx, agent, camX);

      // Draw agents: non-champions first (highest rank = drawn last = on top)
      const sorted = [...state.agents].sort((a, b) => b.rank - a.rank);
      for (const agent of sorted) drawRagdoll(ctx, agent, camX);

      // Update NN canvas (champion)
      const champ = state.agents.find(a => a.rank === 0);
      if (nnCanvasRef.current && champ) {
        drawNN(nnCanvasRef.current, champ);
      }

      // Keep allTimeBest current during the generation (not just at end)
      const liveBest = Math.max(...state.agents.map(a => a.ragdoll.fitness));
      if (liveBest > state.allTimeBest) state.allTimeBest = liveBest;

      // Update display state
      const alive = state.agents.filter(a => a.ragdoll.alive).length;
      setDisplay({
        generation:   state.generation,
        time:         Math.max(0, Math.ceil(state.evalDuration - Math.max(0, state.time - 0.5))),
        bestFitness:  Math.round(state.bestFitness),
        allTimeBest:  Math.round(state.allTimeBest),
        alive,
        champDist:    champ ? Math.round(champ.ragdoll.fitness) : 0,
        history:      state.history,
        hiddenNodes:  Math.max(...state.agents.map(a => a.genome.nodes.length)),
        activeConns:  champ ? champ.genome.conns.filter(c => c.enabled).length : 0,
        uprightPct:   champ ? Math.round(Math.max(0, Math.min(1,
          (GROUND_Y - champ.ragdoll.particles[PI.PELVIS].y) / STANDING_PELVIS_H)) * 100) : 0,
        comPct: champ ? Math.round(Math.min(100, Math.max(0,
          (GROUND_Y - champ.ragdoll.particles.reduce((s, p) => s + p.y * p.mass, 0) /
           champ.ragdoll.particles.reduce((s, p) => s + p.mass, 0)) / STANDING_COM_H * 100))) : 0,
        headPct: champ ? Math.round(Math.min(100, Math.max(0,
          (GROUND_Y - champ.ragdoll.particles[PI.HEAD].y) / STANDING_HEAD_H * 100))) : 0,
        champSteps:   champ ? champ.ragdoll.stepCount : 0,
        champStandingTime: champ ? Math.round(champ.ragdoll.standingTime) : 0,
        stagnation:   state.stagnation,
        gravityPct:   Math.round(state.gravityMul * 100),
        speciesCount: state.species.length,
      });
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Sync history chart
  useEffect(() => {
    if (histCanvasRef.current) drawHistory(histCanvasRef.current, display.history);
  }, [display.history]);

  const handleReset = () => {
    initSim();
    cameraXRef.current = 0;
  };

  const handleSkip = () => {
    const state = stateRef.current;
    if (!state) return;
    const DT = 1 / 60;
    let i = 0;
    while (i++ < 4000) {
      if (stepSim(state, DT)) break;
    }
    nextGeneration(state);
    cameraXRef.current = 0;
  };

  const SPEED_OPTIONS = [1, 3, 10, 30, 60];

  // Population dot colours
  const popDots = Array.from({ length: 15 }, (_, i) => {
    const agent = stateRef.current?.agents.find(a => a.rank === i);
    const alive = agent?.ragdoll.alive ?? false;
    return { color: AGENT_COLORS[i] ?? '#6b7280', alive };
  });

  return (
    <>
      <NeatStyles />
      <div className="neat-root">
        {/* Main simulation canvas */}
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          className="neat-canvas"
        />

        {/* Neural network overlay (champion) — large panel */}
        <div className="neat-nn">
          <div className="neat-nn-title">Champion Network</div>
          <canvas ref={nnCanvasRef} width={360} height={300} style={{ borderRadius: '6px', background: 'rgba(7,9,15,0.3)' }} />
          <div style={{ marginTop: '0.3rem', fontSize: '0.58rem', color: '#2e4158', lineHeight: 1.5, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span><span style={{ color: 'rgba(240,160,80,0.8)' }}>━</span> excite</span>
            <span><span style={{ color: 'rgba(180,80,60,0.8)' }}>━</span> inhibit</span>
            <span><span style={{ color: '#70c080' }}>●</span> sensor</span>
            <span><span style={{ color: '#a78bfa' }}>●</span> hidden</span>
            <span><span style={{ color: '#f0a050' }}>●</span> motor</span>
          </div>
        </div>

        {/* HUD — stats */}
        <div className="neat-hud">
          <div className="neat-hud-row">
            <span className="label">GEN</span>
            <span className="champ">{display.generation}</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">TIME</span>
            <span className="val">{display.time}s</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">GRAVITY</span>
            <span className="val" style={{ color: display.gravityPct >= 100 ? '#70c080' : '#f0a050' }}>
              {display.gravityPct}%
            </span>
          </div>
          {display.stagnation > 5 && (
            <div className="neat-hud-row">
              <span className="label">STAG</span>
              <span style={{ color: display.stagnation > 20 ? '#c05040' : '#f0a050', fontWeight: 600 }}>{display.stagnation}</span>
            </div>
          )}
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">LEAD</span>
            <span className="val">{display.champDist}px</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">CoG</span>
            <span className="val" style={{ color: display.comPct > 60 ? '#70c080' : display.comPct > 30 ? '#f0a050' : '#c05040' }}>
              {display.comPct}%
            </span>
          </div>
          <div className="neat-hud-row">
            <span className="label">STAND</span>
            <span className="val" style={{ color: display.champStandingTime > 10 ? '#70c080' : display.champStandingTime > 3 ? '#f0a050' : '#c05040' }}>
              {display.champStandingTime}s
            </span>
          </div>
          <div className="neat-hud-row">
            <span className="label">STEPS</span>
            <span className="val" style={{ color: display.champSteps > 0 ? '#70c080' : '#a08060' }}>{display.champSteps}</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">BEST</span>
            <span className="best">{display.allTimeBest}px</span>
          </div>
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">NODES</span>
            <span className="val">{display.hiddenNodes}</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">CONNS</span>
            <span className="val">{display.activeConns}</span>
          </div>
          {display.speciesCount > 0 && (
            <div className="neat-hud-row">
              <span className="label">SPECIES</span>
              <span className="val" style={{ color: display.speciesCount > 3 ? '#70c080' : '#f0a050' }}>{display.speciesCount}</span>
            </div>
          )}
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">ALIVE</span>
            <span className="val">{display.alive}/15</span>
          </div>
          {display.history.length > 1 && (
            <>
              <div className="neat-hud-divider" />
              <div style={{ fontSize: '0.55rem', color: '#2e4158', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>FITNESS HISTORY</div>
              <canvas ref={histCanvasRef} width={110} height={30} style={{ display: 'block', borderRadius: '3px' }} />
            </>
          )}
        </div>

        {/* Fitness history mini-chart — embedded in HUD below stats */}

        {/* Population dots (alive/dead indicator) */}
        <div className="neat-pop">
          {popDots.map((dot, i) => (
            <div
              key={i}
              className="neat-pop-dot"
              title={`Agent ${i + 1}`}
              style={{
                background:  dot.alive ? dot.color : 'rgba(100,116,139,0.3)',
                boxShadow:   dot.alive && i === 0 ? `0 0 6px ${dot.color}` : 'none',
                width:  i === 0 ? '6px' : '4px',
                height: i === 0 ? '6px' : '4px',
              }}
            />
          ))}
        </div>

        {/* Control bar */}
        <div className={`neat-bar${isTheaterMode ? ' theater-top' : ''}`}>
          {/* Play / Pause */}
          <button
            className={`neat-btn ${isPlaying ? 'active' : ''}`}
            onClick={() => setIsPlaying(p => !p)}
          >
            {isPlaying ? '⏸' : '▶'}
            <span style={{ fontSize: '0.7rem' }}>{isPlaying ? 'Pause' : 'Run'}</span>
          </button>

          <div className="neat-divider" />

          {/* Speed */}
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              className={`neat-btn ${localSpeed === s ? 'active' : ''}`}
              onClick={() => setLocalSpeed(s)}
            >
              {s}×
            </button>
          ))}

          <div className="neat-divider" />

          {/* Skip generation */}
          <button className="neat-btn" onClick={handleSkip} title="Skip to next generation">
            ⏭ Skip
          </button>

          <div className="neat-divider" />

          {/* Reset */}
          <button className="neat-btn danger" onClick={handleReset} title="Reset simulation">
            ↺
          </button>
        </div>
      </div>
    </>
  );
}
