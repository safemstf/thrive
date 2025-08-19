/*
    src\components\cs\disease\helper.ts
  Utility helpers to improve UX for the epidemic simulator.
  Drop this file into src/components/cs/disease/
  Exported helpers (named):
    - Camera          : viewport & pan/zoom utilities (canvas transform)
    - renderMinimap   : draw small overview/minimap
    - Playback        : playback controller (play/pause/step/speed)
    - SnapshotManager : compact snapshot storage + retrieval
    - exportRun       : export run JSON/CSV
    - metrics         : incidence / simple Rt / doubling time calculators

  Integration steps (quick):
    1. Add file to repo: src/components/cs/disease/simUXHelpers.ts
    2. Import in diseaseLogic.tsx:
       import { Camera, renderMinimap, Playback, SnapshotManager, exportRun, metrics } from './simUXHelpers';
    3. Create instances in your component (refs recommended):
       const cameraRef = useRef(new Camera(canvasWidth, canvasHeight));
       const playbackRef = useRef(new Playback({onTick: (t)=>...}));
       const snapRef = useRef(new SnapshotManager(5));
    4. Use camera.applyTransform(ctx) in render() before drawing world; use camera.worldToScreen for UI overlays.
    5. Call snapRef.current.record(tick, agents) every N ticks or when requested. Use getSnapshot(tick) to scrub.
    6. Use exportRun(...) to download runs. See examples below.
*/

// ----------------------------- Types ------------------------------------
export type VirusVariant = 'original' | 'alpha' | 'beta' | 'gamma' | 'delta' | 'omega';

export type PackedAgent = {
  id: number;
  x: number;
  y: number;
  state: 'S' | 'I' | 'R' | 'V';
  variant?: VirusVariant;
  immunity?: Record<VirusVariant, number>;
  infectionTime?: number;
  infectedBy?: number;
};

export type RunExport = {
  meta: {
    name?: string;
    seed?: number | null;
    profile?: string | object;
    params?: Record<string, any>;
    createdAt: string;
  };
  agents_snapshot?: { tick: number; agents: PackedAgent[] };
  history?: any[];
  events?: any[];
  lineage?: any[];
};

// ----------------------------- Camera -----------------------------------
export class Camera {
  // world -> screen transform: translate then scale
  public x = 0; // world coordinate at screen center x
  public y = 0;
  public scale = 1; // zoom (1 = 1:1)
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    // default center at world center
    this.x = width / 2;
    this.y = height / 2;
    this.scale = 1;
  }

  setSize(width: number, height: number) {
    this.width = width; this.height = height;
  }

  // Convert world coordinate -> screen pixel
  worldToScreen(px: number, py: number) {
    const sx = (px - this.x) * this.scale + this.width / 2;
    const sy = (py - this.y) * this.scale + this.height / 2;
    return { x: sx, y: sy };
  }

  // Convert screen pixel -> world coord
  screenToWorld(sx: number, sy: number) {
    const wx = (sx - this.width / 2) / this.scale + this.x;
    const wy = (sy - this.height / 2) / this.scale + this.y;
    return { x: wx, y: wy };
  }

  // Apply transform to canvas context (call before drawing world)
  applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.width / 2 - this.x * this.scale, this.height / 2 - this.y * this.scale);
  }

  // Reset transform (useful after world drawing for HUD)
  resetTransform(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Pan by screen-space delta
  panByScreen(dx: number, dy: number) {
    const dw = dx / this.scale;
    const dh = dy / this.scale;
    this.x -= dw;
    this.y -= dh;
  }

  // Zoom about a screen point (sx,sy). factor >1 zooms in
  zoomAt(factor: number, sx: number, sy: number) {
    const before = this.screenToWorld(sx, sy);
    this.scale *= factor;
    // clamp scale
    this.scale = Math.max(0.1, Math.min(8, this.scale));
    const after = this.screenToWorld(sx, sy);
    // adjust center so that world point under (sx,sy) stays fixed
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  // Fit camera to agents bounding box with optional padding (world units)
  fitToAgents(agents: PackedAgent[], padding = 40) {
    if (!agents || agents.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const a of agents) {
      minX = Math.min(minX, a.x);
      minY = Math.min(minY, a.y);
      maxX = Math.max(maxX, a.x);
      maxY = Math.max(maxY, a.y);
    }
    const w = Math.max(1, maxX - minX + padding * 2);
    const h = Math.max(1, maxY - minY + padding * 2);
    // center
    this.x = (minX + maxX) / 2;
    this.y = (minY + maxY) / 2;
    // choose scale to fit both directions
    const sx = this.width / w;
    const sy = this.height / h;
    this.scale = Math.max(0.1, Math.min(8, Math.min(sx, sy)));
  }
}

// --------------------------- Minimap renderer ----------------------------
export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  agents: PackedAgent[],
  camera: Camera,
  opts: { width: number; height: number; worldW: number; worldH: number }
) {
  // Draw small overview where (0,0)-(worldW,worldH) is mapped to (0,0)-(width,height)
  const { width, height, worldW, worldH } = opts;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  // background
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, width, height);

  // draw agents as tiny pixels - color by state/variant if provided
  const scaleX = width / worldW;
  const scaleY = height / worldH;
  for (const a of agents) {
    const sx = Math.round(a.x * scaleX);
    const sy = Math.round(a.y * scaleY);
    if (a.state === 'I') ctx.fillStyle = '#ef4444';
    else if (a.state === 'S') ctx.fillStyle = '#3b82f6';
    else if (a.state === 'R') ctx.fillStyle = '#22c55e';
    else if (a.state === 'V') ctx.fillStyle = '#8b5cf6';
    else ctx.fillStyle = '#999';
    ctx.fillRect(sx, sy, 2, 2);
  }

  // draw viewport rectangle (map camera view box to minimap coords)
  const viewWorldLeft = camera.x - (camera.width / (2 * camera.scale));
  const viewWorldTop = camera.y - (camera.height / (2 * camera.scale));
  const viewWorldW = camera.width / camera.scale;
  const viewWorldH = camera.height / camera.scale;

  const viewX = (viewWorldLeft / worldW) * width;
  const viewY = (viewWorldTop / worldH) * height;
  const viewW = (viewWorldW / worldW) * width;
  const viewH = (viewWorldH / worldH) * height;

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1;
  ctx.strokeRect(viewX, viewY, viewW, viewH);

  ctx.restore();
}

// ------------------------- Playback controller --------------------------
export type PlaybackOptions = {
  onTick?: (tick: number) => void;
  startTick?: number;
  maxTick?: number; // optional
};

export class Playback {
  public tick = 0;
  public playing = false;
  public speed = 1; // multiplier: 1 = real-time ticks per render-based loop
  private lastTime = 0;
  private onTick?: (t: number) => void;
  public maxTick?: number;

  constructor(opts?: PlaybackOptions) {
    if (opts) {
      this.onTick = opts.onTick;
      if (opts.startTick) this.tick = opts.startTick;
      if (opts.maxTick) this.maxTick = opts.maxTick;
    }
  }

  play() { this.playing = true; this.lastTime = performance.now(); }
  pause() { this.playing = false; }
  toggle() { this.playing = !this.playing; this.lastTime = performance.now(); }

  stepForward(n = 1) { this.tick += n; if (this.onTick) this.onTick(this.tick); }
  stepBackward(n = 1) { this.tick = Math.max(0, this.tick - n); if (this.onTick) this.onTick(this.tick); }
  jumpTo(t: number) { this.tick = Math.max(0, Math.floor(t)); if (this.onTick) this.onTick(this.tick); }

  setSpeed(mult: number) { this.speed = Math.max(0.01, Math.min(10, mult)); }

  // Call periodically from an animation loop
  tickLoop() {
    if (!this.playing) { this.lastTime = performance.now(); return; }
    const now = performance.now();
    const dt = now - this.lastTime; // ms
    // For simplicity, advance 1 tick per (1000 / 50) ms at speed=1 (50 ticks/day default)
    const msPerTick = 1000 / 50;
    const ticksToAdvance = Math.floor((dt / msPerTick) * this.speed);
    if (ticksToAdvance > 0) {
      this.tick += ticksToAdvance;
      if (this.onTick) this.onTick(this.tick);
      this.lastTime = now;
    }
  }
}

// ------------------------ Snapshot Manager ------------------------------
export class SnapshotManager {
  // store sparse snapshots every `stride` ticks (configurable)
  private stride: number;
  private buffer: Map<number, PackedAgent[]> = new Map();
  private maxEntries: number;

  constructor(stride = 5, maxEntries = 300) {
    this.stride = Math.max(1, stride);
    this.maxEntries = Math.max(10, maxEntries);
  }

  // Create a compact, serializable representation of agents
  compactAgents(agents: PackedAgent[]) {
    // Strip functions & heavy objects - shallow copy is fine
    return agents.map(a => ({
      id: a.id, x: a.x, y: a.y, state: a.state, variant: a.variant, immunity: a.immunity || undefined,
      infectionTime: a.infectionTime, infectedBy: a.infectedBy
    }));
  }

  record(tick: number, agents: PackedAgent[]) {
    if (tick % this.stride !== 0) return; // only store on stride boundaries
    const key = tick;
    this.buffer.set(key, this.compactAgents(agents));
    // enforce max entries (oldest removed)
    if (this.buffer.size > this.maxEntries) {
      const keys = Array.from(this.buffer.keys()).sort((a,b)=>a-b);
      while (this.buffer.size > this.maxEntries) this.buffer.delete(keys.shift() as number);
    }
  }

  getSnapshot(tick: number) {
    // nearest stored tick <= requested
    const keys = Array.from(this.buffer.keys()).sort((a,b)=>a-b);
    if (keys.length === 0) return null;
    let candidate = keys[0];
    for (const k of keys) {
      if (k <= tick) candidate = k;
      else break;
    }
    return { tick: candidate, agents: this.buffer.get(candidate) || [] };
  }

  clear() { this.buffer.clear(); }
}

// ---------------------------- Export Run --------------------------------
export function exportRun(filename = 'run.json', payload: RunExport) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------- Metrics ----------------------------------
export const metrics = {
  // history: array of {t, S, I, R, V, newInfections}
  computeIncidence: (history: any[]) => {
    return history.map(h => ({ t: h.t, incidence: h.newInfections || 0 }));
  },

  // Simple Rt estimator: ratio of new cases in window / infectious population in previous window
  estimateRtSimple: (history: any[], windowSize = 10) => {
    const rts: { t: number; rt: number }[] = [];
    for (let i = windowSize; i < history.length; i++) {
      const past = history.slice(i - windowSize, i);
      const recent = history.slice(i, i + windowSize);
      const sumRecent = recent.reduce((s, x) => s + (x.newInfections || 0), 0);
      const infectious = past.reduce((s, x) => s + (x.I || 0), 0) / windowSize; // avg I
      const rt = infectious > 0 ? (sumRecent / windowSize) / infectious : 0;
      rts.push({ t: history[i].t, rt });
    }
    return rts;
  },

  // Doubling time: fit exponential over sliding window
  estimateDoublingTime: (series: number[], windowSize = 7) => {
    const out: { idx: number; doublingDays: number | null }[] = [];
    for (let i = windowSize; i < series.length; i++) {
      const window = series.slice(i - windowSize, i);
      const first = window[0] || 1;
      const last = window[window.length - 1] || 1;
      if (first <= 0 || last <= 0) { out.push({ idx: i, doublingDays: null }); continue; }
      const rate = Math.log(last / first) / windowSize; // per-step log growth
      const doublingSteps = rate > 0 ? Math.log(2) / rate : null;
      out.push({ idx: i, doublingDays: doublingSteps });
    }
    return out;
  }
};

// --------------------------- End of file --------------------------------
