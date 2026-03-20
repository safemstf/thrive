'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createGlobalStyle } from 'styled-components';
import {
  SimState, Agent, NEATGenome, Particle,
  createSimState, stepSim, nextGeneration,
  PI, L, HEAD_RADIUS, MOTORS, AGENT_COLORS,
  N_INPUT, N_OUTPUT, STANDING_PELVIS_H,
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
const CHARACTERS: Array<{ name: string; drawExtras: DrawFn }> = [
  { name: 'A', drawExtras: noop },
  { name: 'B', drawExtras: noop },
  { name: 'C', drawExtras: noop },
  { name: 'D', drawExtras: noop },
  { name: 'E', drawExtras: noop },
  { name: 'F', drawExtras: noop },
  { name: 'G', drawExtras: noop },
  { name: 'H', drawExtras: noop },
  { name: 'I', drawExtras: noop },
  { name: 'J', drawExtras: noop },
];

// ── Styles ────────────────────────────────────────────────────

const NeatStyles = createGlobalStyle`
  .neat-root {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: #07090f;
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
    background: rgba(7,9,15,0.88);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 0.6rem 0.85rem;
    min-width: 148px;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: #64748b;
    line-height: 1.8;
  }
  .neat-hud-row { display: flex; justify-content: space-between; gap: 0.75rem; }
  .neat-hud .label { color: #475569; }
  .neat-hud .val   { color: #60a5fa; font-weight: 600; }
  .neat-hud .best  { color: #34d399; font-weight: 600; }
  .neat-hud .champ { color: #fbbf24; font-weight: 600; }
  .neat-hud-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0.3rem 0; }

  /* NN overlay — top-left */
  .neat-nn {
    position: absolute;
    top: 0.75rem; left: 0.75rem;
    background: rgba(7,9,15,0.88);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 0.4rem 0.5rem 0.5rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    color: #475569;
  }
  .neat-nn-title {
    font-size: 0.62rem;
    color: #60a5fa;
    margin-bottom: 0.3rem;
    letter-spacing: 0.04em;
  }

  /* Fitness history bar — bottom of NN box */
  .neat-history {
    position: absolute;
    bottom: 4rem; left: 0.75rem;
    background: rgba(7,9,15,0.8);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.06);
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
    background: rgba(7,9,15,0.92);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50px;
    padding: 0.3rem 0.7rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    white-space: nowrap;
  }
  .neat-bar.theater-top { bottom: auto; top: 0.65rem; }

  .neat-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.3rem 0.55rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-family: 'DM Mono', monospace;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .neat-btn:hover  { background: rgba(255,255,255,0.07); color: #f1f5f9; }
  .neat-btn.active { background: rgba(96,165,250,0.15);  color: #60a5fa; }
  .neat-btn.danger { background: rgba(248,113,113,0.12); color: #f87171; }
  .neat-divider    { width: 1px; height: 18px; background: rgba(255,255,255,0.09); margin: 0 0.1rem; }

  /* Population dots at very bottom */
  .neat-pop {
    position: absolute;
    bottom: 1.1rem; left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .neat-pop-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    transition: all 0.3s;
  }
`;

// ── Canvas dimensions ─────────────────────────────────────────

const CW       = 900;  // logical canvas width
const CH       = 460;  // taller canvas for better proportions
const GROUND_Y = 360;  // ground at ~78% — leaves room for characters (~155px tall) above

// ── Rendering helpers ─────────────────────────────────────────

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  camX: number,   // world X of left screen edge
  startX: number, // world X where ragdolls started
) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#06080e');
  sky.addColorStop(1, '#0d1420');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CW, GROUND_Y);

  // Stars — parallax at 20% of camera speed
  for (let i = 0; i < 90; i++) {
    const wx  = (i * 137.508) % 4000;
    const wy  = (i * 53.71)   % (GROUND_Y - 40);
    const sz  = (i * 0.43)    % 1.5 + 0.4;
    const brt = (i * 0.17)    % 0.4 + 0.3;
    const sx  = ((wx - camX * 0.2) % CW + CW) % CW;
    ctx.beginPath();
    ctx.arc(sx, wy, sz, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${brt})`;
    ctx.fill();
  }

  // Horizon glow
  const hor = ctx.createLinearGradient(0, GROUND_Y - 70, 0, GROUND_Y);
  hor.addColorStop(0, 'rgba(20,50,100,0)');
  hor.addColorStop(1, 'rgba(20,50,120,0.18)');
  ctx.fillStyle = hor;
  ctx.fillRect(0, GROUND_Y - 70, CW, 70);

  // Ground fill
  const gnd = ctx.createLinearGradient(0, GROUND_Y, 0, CH);
  gnd.addColorStop(0, '#18212e');
  gnd.addColorStop(1, '#0b0f16');
  ctx.fillStyle = gnd;
  ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);

  // Ground surface line
  ctx.strokeStyle = '#2a3d52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y); ctx.lineTo(CW, GROUND_Y);
  ctx.stroke();

  // Distance ticks — every 100px in world space, labeled with distance from start
  // Only tick positions AT OR AFTER startX get numeric labels (no duplicate "0"s)
  const firstWx = Math.floor(camX / 100) * 100;
  for (let wx = firstWx; wx < camX + CW + 100; wx += 100) {
    if (wx < startX) continue; // don't draw ticks before the spawn point
    const sx   = wx - camX;
    const dist = wx - startX;
    if (sx < -10 || sx > CW + 10) continue;

    const isMajor = dist % 500 === 0;
    ctx.strokeStyle = isMajor ? '#3a5070' : '#1e2d3e';
    ctx.lineWidth   = isMajor ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y);
    ctx.lineTo(sx, GROUND_Y + (isMajor ? 12 : 6));
    ctx.stroke();

    if (dist % 200 === 0) {
      ctx.fillStyle = '#2e4158';
      ctx.font      = '10px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(dist === 0 ? 'START' : `${dist}`, sx, GROUND_Y + 22);
    }
  }

  // Subtle ground texture — pebbles at 95% parallax
  for (let i = 0; i < 50; i++) {
    const wx = (i * 97.3) % 2000;
    const wy = GROUND_Y + 4 + (i * 7.1) % 28;
    const px = ((wx - camX * 0.95) % CW + CW) % CW;
    ctx.beginPath();
    ctx.arc(px, wy, 1 + (i % 2) * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(42,61,82,${0.25 + (i % 3) * 0.08})`;
    ctx.fill();
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
    ctx.fillStyle = hex2rgba(agent.ragdoll.color, isChamp ? 0.45 : 0.2);
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
    ctx.strokeStyle = 'rgba(251,191,36,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Character costume extras
  const charIdx = agent.rank;
  const char    = CHARACTERS[charIdx % CHARACTERS.length];
  if (char) char.drawExtras(ctx, p, sx, sy, alpha, col);

  // Character name label (small, above head)
  ctx.globalAlpha = alpha * (isChamp ? 0.95 : 0.55);
  ctx.font = isChamp ? 'bold 8px "DM Mono",monospace' : '7px "DM Mono",monospace';
  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  const nameY = sy(p[PI.HEAD].y) - HEAD_RADIUS - (isChamp ? 24 : 16);
  ctx.fillText(char?.name ?? '', sx(p[PI.HEAD].x), nameY);

  // Champion star + distance
  if (isChamp) {
    ctx.globalAlpha = 0.9;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('★', sx(p[PI.HEAD].x), sy(p[PI.HEAD].y) - HEAD_RADIUS - 14);
    if (alive) {
      const dist = Math.round(agent.ragdoll.fitness);
      ctx.globalAlpha = 0.8;
      ctx.font = '9px "DM Mono",monospace';
      ctx.fillStyle = '#fbbf24';
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

  const PAD = 12;
  const inputX  = PAD + 10;
  const outputX = W - PAD - 10;
  const hiddenX = (inputX + outputX) / 2;

  // Build node position map
  const nodePos = new Map<number, { x: number; y: number }>();

  const iSpacing = (H - PAD * 2) / Math.max(N_INPUT - 1, 1);
  for (let i = 0; i < N_INPUT; i++) nodePos.set(i, { x: inputX,  y: PAD + i * iSpacing });

  const oSpacing = (H - PAD * 2) / Math.max(N_OUTPUT - 1, 1);
  for (let o = 0; o < N_OUTPUT; o++) nodePos.set(N_INPUT + o, { x: outputX, y: PAD + o * oSpacing });

  // Hidden nodes: spread horizontally by "depth" (derived from ID order)
  const sortedHidden = [...genome.nodes].sort((a, b) => a.id - b.id);
  if (sortedHidden.length > 0) {
    const hSpacing = (H - PAD * 2) / Math.max(sortedHidden.length - 1, 1);
    sortedHidden.forEach((n, idx) => {
      // Alternate x positions slightly to avoid overlap on same layer
      const xJitter = ((idx % 3) - 1) * 14;
      nodePos.set(n.id, { x: hiddenX + xJitter, y: PAD + idx * hSpacing });
    });
  }

  // Draw connections
  ctx.lineWidth = 1;
  for (const c of genome.conns) {
    if (!c.enabled) continue;
    const src = nodePos.get(c.inNode);
    const dst = nodePos.get(c.outNode);
    if (!src || !dst) continue;
    const a = Math.min(Math.abs(c.weight) * 0.35, 0.55);
    ctx.strokeStyle = c.weight > 0 ? `rgba(96,165,250,${a})` : `rgba(248,113,113,${a})`;
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    // Slight curve for aesthetics
    const mx = (src.x + dst.x) / 2;
    const my = (src.y + dst.y) / 2 - 8;
    ctx.quadraticCurveTo(mx, my, dst.x, dst.y);
    ctx.stroke();
  }

  // Input nodes
  for (let i = 0; i < N_INPUT; i++) {
    const pos = nodePos.get(i)!;
    const val = inputs[i];
    const brt = Math.abs(val);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(52,211,153,${0.3 + brt * 0.6})`;
    ctx.fill();
  }

  // Hidden nodes
  for (const n of genome.nodes) {
    const pos = nodePos.get(n.id);
    if (!pos) continue;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167,139,250,0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Output nodes
  for (let o = 0; o < N_OUTPUT; o++) {
    const pos = nodePos.get(N_INPUT + o)!;
    const val = outputs[o];
    const brt = Math.abs(val);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251,191,36,${0.3 + brt * 0.6})`;
    ctx.fill();
  }

  // Legend: nodes/connections count
  ctx.font      = '9px "DM Mono", monospace';
  ctx.fillStyle = 'rgba(100,130,160,0.8)';
  ctx.textAlign = 'left';
  ctx.fillText(`${genome.nodes.length}H  ${genome.conns.filter(c=>c.enabled).length}C`, PAD, H - 4);

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
  ctx.strokeStyle = 'rgba(46,65,88,0.6)';
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
    g.addColorStop(0, `rgba(96,165,250,${alpha})`);
    g.addColorStop(1, `rgba(52,211,153,${alpha})`);
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
    allTimeBest: 0, alive: 10,
    champDist: 0, history: [] as number[],
    hiddenNodes: 0, activeConns: N_INPUT * N_OUTPUT,
    uprightPct: 0,
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
      ctx.fillStyle = `rgba(96,165,250,${0.35 + progress * 0.4})`;
      ctx.fillRect(barX, barY, barW * progress, 2.5);

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
        // Show MAX hidden nodes across all agents (not just champion) so NEAT growth is visible
        hiddenNodes:  Math.max(...state.agents.map(a => a.genome.nodes.length)),
        activeConns:  champ ? champ.genome.conns.filter(c => c.enabled).length : 0,
        uprightPct:   champ ? Math.round(Math.max(0, Math.min(1,
          (GROUND_Y - champ.ragdoll.particles[PI.PELVIS].y) / STANDING_PELVIS_H)) * 100) : 0,
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
    // Run sim at full speed until done
    const DT = 1 / 60;
    let i = 0;
    while (i++ < 4000) { // max 60s of sim time + settle
      if (stepSim(state, DT)) break;
    }
    nextGeneration(state);
    cameraXRef.current = 0;
  };

  const SPEED_OPTIONS = [1, 3, 6, 24];

  // Population dot colours
  const popDots = Array.from({ length: 10 }, (_, i) => {
    const agent = stateRef.current?.agents.find(a => a.rank === i);
    const alive = agent?.ragdoll.alive ?? false;
    return { color: AGENT_COLORS[i], alive };
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

        {/* Neural network overlay (champion) */}
        <div className="neat-nn">
          <div className="neat-nn-title">Champion Network</div>
          <canvas ref={nnCanvasRef} width={200} height={180} />
          <div style={{ marginTop: '0.3rem', fontSize: '0.58rem', color: '#2e4158', lineHeight: 1.5, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span><span style={{ color: 'rgba(96,165,250,0.8)' }}>━</span> excite</span>
            <span><span style={{ color: 'rgba(248,113,113,0.8)' }}>━</span> inhibit</span>
            <span><span style={{ color: '#34d399' }}>●</span> sensor</span>
            <span><span style={{ color: '#a78bfa' }}>●</span> hidden</span>
            <span><span style={{ color: '#fbbf24' }}>●</span> motor</span>
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
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">LEAD</span>
            <span className="val">{display.champDist}px</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">UPRIGHT</span>
            <span className="val" style={{ color: display.uprightPct > 60 ? '#34d399' : display.uprightPct > 30 ? '#fbbf24' : '#f87171' }}>{display.uprightPct}%</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">BEST</span>
            <span className="best">{display.allTimeBest}px</span>
          </div>
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">NODES↑</span>
            <span className="val">{display.hiddenNodes}</span>
          </div>
          <div className="neat-hud-row">
            <span className="label">CONNS</span>
            <span className="val">{display.activeConns}</span>
          </div>
          <div className="neat-hud-divider" />
          <div className="neat-hud-row">
            <span className="label">ALIVE</span>
            <span className="val">{display.alive}/10</span>
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
                width:  i === 0 ? '7px' : '5px',
                height: i === 0 ? '7px' : '5px',
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

          {/* Reset */}
          <button className="neat-btn danger" onClick={handleReset} title="Reset simulation">
            ↺
          </button>
        </div>
      </div>
    </>
  );
}
