'use client'
// src/components/bacteria/bacteria.tsx
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  CSSProperties,
} from "react";
import {
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Zap,
  Droplet,
  Plus,
  Eye,
  Activity,
  Thermometer,
  Beaker,
  Dna,
  Shield,
  AlertTriangle,
  Microscope,
} from "lucide-react";

// Import styled components from the shared styles (your file)
import {
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton,
} from "../cs/simulationHub.styles";

/* -------------------------
   Types & constants
   ------------------------- */

type BacteriumType = "ecoli" | "bacillus" | "coccus" | "spirillum";
type PhageType = "lambda" | "T4" | "T7";

interface Bacterium {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  type: BacteriumType;
  health: number;
  age: number;
  divisionTimer: number;
  infected: boolean;
  phageCount: number;
  lysisTimer?: number;
  resistance: number;
  flagella: boolean;
  pili: { x: number; y: number; length: number }[];
  color: string;
  size: number;
  energy: number;
  dead: boolean;
}

interface Phage {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  attached: boolean;
  attachTick?: number;
  injected: boolean;
  targetId?: number;
  type: PhageType;
  size: number;
  color: string;
  tailLength: number;
  angle: number;
}

interface Nutrient {
  id: number;
  x: number;
  y: number;
  value: number;
  type: "glucose" | "amino" | "vitamin";
  color: string;
  consumed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

/* Keep your type maps (copied from what you shared) */
const BACTERIA_TYPES = {
  ecoli: {
    color: "#22c55e",
    size: 20,
    shape: "rod",
    divisionRate: 0.03,
    speed: 1.5,
    name: "E. coli",
  },
  bacillus: {
    color: "#3b82f6",
    size: 25,
    shape: "rod",
    divisionRate: 0.02,
    speed: 1.0,
    name: "Bacillus",
  },
  coccus: {
    color: "#f59e0b",
    size: 15,
    shape: "sphere",
    divisionRate: 0.04,
    speed: 0.8,
    name: "Coccus",
  },
  spirillum: {
    color: "#a78bfa",
    size: 18,
    shape: "spiral",
    divisionRate: 0.025,
    speed: 2.0,
    name: "Spirillum",
  },
} as const;

const PHAGE_TYPES = {
  lambda: {
    color: "#ef4444",
    size: 8,
    tailLength: 12,
    burstSize: 50,
    latency: 150,
    name: "λ Phage",
  },
  T4: {
    color: "#dc2626",
    size: 10,
    tailLength: 15,
    burstSize: 100,
    latency: 200,
    name: "T4 Phage",
  },
  T7: {
    color: "#b91c1c",
    size: 7,
    tailLength: 10,
    burstSize: 30,
    latency: 100,
    name: "T7 Phage",
  },
} as const;

/* -------------------------
   Helpers
   ------------------------- */

const hexToRgba = (hex: string, alpha = 1) => {
  // accepts "#rrggbb"
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

/* -------------------------
   Component
   ------------------------- */

interface Props {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

export default function BacteriaPhageSimulation({
  isRunning: externalIsRunning = false,
  speed: externalSpeed = 1,
  isDark = true,
}: Props) {
  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWidth = useRef(1200);
  const canvasHeight = useRef(675);

  // Mutable simulation state (keeps renders low)
  const bacteriaRef = useRef<Bacterium[]>([]);
  const phagesRef = useRef<Phage[]>([]);
  const nutrientsRef = useRef<Nutrient[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextIdRef = useRef(1);

  // ticks tracked in ref, occasional UI updates via state
  const tickRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // UI state
  const [isRunning, setIsRunning] = useState<boolean>(externalIsRunning);
  const [speed, setSpeed] = useState<number>(externalSpeed);
  const [viewMode, setViewMode] = useState<"normal" | "fluorescent" | "phase">(
    "normal"
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [nutrientDensity, setNutrientDensity] = useState<number>(50);
  const [addingNutrients, setAddingNutrients] = useState<boolean>(true);
  const [addingPhages, setAddingPhages] = useState<boolean>(false);
  const [biofilmMode, setBiofilmMode] = useState<boolean>(false);
  const [quorumSensing, setQuorumSensing] = useState<boolean>(true);

  // Stats (UI-friendly, updated intermittently)
  const [stats, setStats] = useState({
    totalBacteria: 0,
    healthyBacteria: 0,
    infectedBacteria: 0,
    deadBacteria: 0,
    totalPhages: 0,
    nutrients: 0,
    biodiversity: 0,
    resistanceLevel: 0,
    generationNumber: 0,
  });

  /* -------------------------
     Initialization (client-only to avoid hydration issues)
     ------------------------- */
  useEffect(() => {
    // run once on client
    const width = canvasWidth.current;
    const height = canvasHeight.current;

    const createBacteria = (count = 30) => {
      const types = Object.keys(BACTERIA_TYPES) as BacteriumType[];
      const arr: Bacterium[] = [];
      for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const cfg = BACTERIA_TYPES[type];
        arr.push({
          id: nextIdRef.current++,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * cfg.speed,
          vy: (Math.random() - 0.5) * cfg.speed,
          angle: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.1,
          type,
          health: 100,
          age: 0,
          divisionTimer: 100 + Math.random() * 200,
          infected: false,
          phageCount: 0,
          resistance: Math.random() * 0.3,
          flagella: type === "ecoli" || type === "spirillum",
          pili:
            Math.random() > 0.5
              ? Array.from({ length: 2 + Math.floor(Math.random() * 4) }, () => ({
                  x: Math.random() * Math.PI * 2,
                  y: Math.random() * Math.PI * 2,
                  length: 5 + Math.random() * 10,
                }))
              : [],
          color: cfg.color,
          size: cfg.size,
          energy: 60 + Math.random() * 40,
          dead: false,
        });
      }
      return arr;
    };

    const createNutrients = (count: number) => {
      const types = ["glucose", "amino", "vitamin"] as const;
      const colors: Record<typeof types[number], string> = {
        glucose: "#fbbf24",
        amino: "#34d399",
        vitamin: "#f472b6",
      };
      const arr: Nutrient[] = [];
      for (let i = 0; i < count; i++) {
        const t = types[Math.floor(Math.random() * types.length)];
        arr.push({
          id: nextIdRef.current++,
          x: Math.random() * width,
          y: Math.random() * height,
          value: 10 + Math.random() * 20,
          type: t,
          color: colors[t],
          consumed: false,
        });
      }
      return arr;
    };

    const createPhages = (count = 5) => {
      const types = Object.keys(PHAGE_TYPES) as PhageType[];
      const arr: Phage[] = [];
      for (let i = 0; i < count; i++) {
        const t = types[Math.floor(Math.random() * types.length)];
        const cfg = PHAGE_TYPES[t];
        arr.push({
          id: nextIdRef.current++,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          attached: false,
          injected: false,
          type: t,
          size: cfg.size,
          color: cfg.color,
          tailLength: cfg.tailLength,
          angle: Math.random() * Math.PI * 2,
        });
      }
      return arr;
    };

    bacteriaRef.current = createBacteria(30);
    nutrientsRef.current = createNutrients(Math.floor(nutrientDensity * 0.5));
    phagesRef.current = addingPhages ? createPhages(5) : [];
    particlesRef.current = [];

    // initial stats
    setTimeout(() => {
      // small delay so refs populated
      updateStatsImmediate();
      renderOnce();
    }, 20);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // client-only initialization to avoid hydration mismatch

  /* -------------------------
     Simulation update & rendering
     ------------------------- */

  // lightweight immediate stats updater used in init/reset
  const updateStatsImmediate = useCallback(() => {
    const totalBacteria = bacteriaRef.current.length;
    const deadBacteria = bacteriaRef.current.filter((b) => b.dead).length;
    const healthyBacteria = bacteriaRef.current.filter(
      (b) => !b.infected && !b.dead
    ).length;
    const infectedBacteria = bacteriaRef.current.filter(
      (b) => b.infected && !b.dead
    ).length;
    const avgResistance =
      bacteriaRef.current.reduce((s, b) => s + b.resistance, 0) /
      (totalBacteria || 1);

    setStats((s) => ({
      ...s,
      totalBacteria,
      healthyBacteria,
      infectedBacteria,
      deadBacteria,
      totalPhages: phagesRef.current.length,
      nutrients: nutrientsRef.current.filter((n) => !n.consumed).length,
      biodiversity: Math.max(0, totalBacteria - deadBacteria),
      resistanceLevel: avgResistance * 100,
      generationNumber: Math.floor(tickRef.current / 500),
    }));
  }, []);

  // render once (used on init/reset)
  const renderOnce = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvasWidth.current;
    canvas.height = canvasHeight.current;

    // do a quick render by delegating to the full render function
    // (we'll reuse renderLoopRender below)
    renderLoopRender(ctx);
  }, []);

  // core update: advances simulation by dt (dt scaled by speed)
  const stepSimulation = useCallback(
    (dt: number) => {
      const width = canvasWidth.current;
      const height = canvasHeight.current;

      // environmental factors (kept simple here)
      const tempEffect = 1; // placeholder, could be dynamic
      const phEffect = 1;

      // Bacteria updates
      for (const bacterium of bacteriaRef.current) {
        if (bacterium.dead) {
          bacterium.size *= 0.995; // decompose
          continue;
        }

        bacterium.age += dt;
        bacterium.energy -= 0.05 * dt * tempEffect;

        // random movement / chemotaxis simplification
        bacterium.vx += (Math.random() - 0.5) * 0.2 * dt;
        bacterium.vy += (Math.random() - 0.5) * 0.2 * dt;

        const vel = Math.sqrt(bacterium.vx * bacterium.vx + bacterium.vy * bacterium.vy);
        const maxSpeed =
          BACTERIA_TYPES[bacterium.type].speed * tempEffect * phEffect;
        if (vel > maxSpeed) {
          bacterium.vx = (bacterium.vx / vel) * maxSpeed;
          bacterium.vy = (bacterium.vy / vel) * maxSpeed;
        }

        bacterium.x += bacterium.vx * dt;
        bacterium.y += bacterium.vy * dt;
        bacterium.angle += bacterium.angularVelocity * dt;

        // bounds
        if (bacterium.x < bacterium.size) {
          bacterium.x = bacterium.size;
          bacterium.vx *= -0.8;
        }
        if (bacterium.x > width - bacterium.size) {
          bacterium.x = width - bacterium.size;
          bacterium.vx *= -0.8;
        }
        if (bacterium.y < bacterium.size) {
          bacterium.y = bacterium.size;
          bacterium.vy *= -0.8;
        }
        if (bacterium.y > height - bacterium.size) {
          bacterium.y = height - bacterium.size;
          bacterium.vy *= -0.8;
        }

        // consume nearby nutrient (simple)
        for (const nutrient of nutrientsRef.current) {
          if (nutrient.consumed) continue;
          const dx = nutrient.x - bacterium.x;
          const dy = nutrient.y - bacterium.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < (bacterium.size + 5) * (bacterium.size + 5)) {
            nutrient.consumed = true;
            bacterium.energy = Math.min(100, bacterium.energy + nutrient.value);
            bacterium.health = Math.min(100, bacterium.health + nutrient.value * 0.5);

            // add a couple particles
            for (let i = 0; i < 4; i++) {
              particlesRef.current.push({
                x: nutrient.x,
                y: nutrient.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                life: 30,
                color: nutrient.color,
                size: 1 + Math.random() * 2,
              });
            }
          }
        }

        // division
        if (!bacterium.infected && bacterium.energy > 80 && bacterium.health > 50) {
          bacterium.divisionTimer -= dt;
          if (bacterium.divisionTimer <= 0) {
            const daughter: Bacterium = {
              ...bacterium,
              id: nextIdRef.current++,
              x: bacterium.x + (Math.random() - 0.5) * 12,
              y: bacterium.y + (Math.random() - 0.5) * 12,
              vx: (Math.random() - 0.5) * 1,
              vy: (Math.random() - 0.5) * 1,
              energy: bacterium.energy / 2,
              health: bacterium.health * 0.9,
              age: 0,
              divisionTimer: 150 + Math.random() * 120,
              pili: [],
            };
            bacterium.energy /= 2;
            bacterium.divisionTimer = 150 + Math.random() * 120;
            bacteriaRef.current.push(daughter);
          }
        }

        // infected progression (lysis)
        if (bacterium.infected) {
          bacterium.health -= 0.2 * dt;
          bacterium.lysisTimer = (bacterium.lysisTimer ?? 100) - dt;
          if ((bacterium.lysisTimer ?? 0) <= 0 || bacterium.health <= 0) {
            // lysis: bacterium dies and releases phages
            bacterium.dead = true;
            const burstSize = Math.max(5, bacterium.phageCount * 8);
            for (let i = 0; i < burstSize; i++) {
              const angle = Math.random() * Math.PI * 2;
              phagesRef.current.push({
                id: nextIdRef.current++,
                x: bacterium.x,
                y: bacterium.y,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                attached: false,
                injected: false,
                type: "T4",
                size: PHAGE_TYPES.T4.size,
                color: PHAGE_TYPES.T4.color,
                tailLength: PHAGE_TYPES.T4.tailLength,
                angle,
              });
            }
            // explosion particles
            for (let p = 0; p < 10; p++) {
              particlesRef.current.push({
                x: bacterium.x,
                y: bacterium.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 40,
                color: "#ef4444",
                size: 2 + Math.random() * 2,
              });
            }
          }
        }

        // natural death
        if (bacterium.energy <= 0 || bacterium.age > 2000) {
          bacterium.dead = true;
        }
      }

      // Phage updates
      for (const phage of phagesRef.current) {
        if (!phage.attached) {
          phage.x += phage.vx * dt;
          phage.y += phage.vy * dt;
          phage.angle += 0.05 * dt;

          // bounce
          if (phage.x < 0 || phage.x > width) phage.vx *= -1;
          if (phage.y < 0 || phage.y > height) phage.vy *= -1;

          // collision check
          for (const bacterium of bacteriaRef.current) {
            if (bacterium.dead || bacterium.infected) continue;
            const dx = bacterium.x - phage.x;
            const dy = bacterium.y - phage.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < bacterium.size * bacterium.size) {
              // attach probabilistically based on resistance
              if (Math.random() > bacterium.resistance) {
                phage.attached = true;
                phage.targetId = bacterium.id;
                phage.attachTick = tickRef.current;
                phage.x = bacterium.x;
                phage.y = bacterium.y;
                // keep phage.injected false; injection handled below by timing
              }
              break;
            }
          }
        } else {
          // follow target
          const t = bacteriaRef.current.find((b) => b.id === phage.targetId);
          if (t && !t.dead) {
            phage.x = t.x + Math.cos(phage.angle) * t.size * 0.6;
            phage.y = t.y + Math.sin(phage.angle) * t.size * 0.6;
            // check latency -> inject
            const latency = PHAGE_TYPES[phage.type].latency;
            if (!phage.injected && phage.attachTick !== undefined) {
              if (tickRef.current - phage.attachTick >= latency) {
                phage.injected = true;
                t.infected = true;
                t.phageCount++;
                t.lysisTimer = PHAGE_TYPES[phage.type].latency;
              }
            }
          } else {
            // detach if target gone
            phage.attached = false;
            phage.targetId = undefined;
            phage.vx = (Math.random() - 0.5) * 2;
            phage.vy = (Math.random() - 0.5) * 2;
          }
        }
      }

      // Particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.vx *= 0.98;
        p.vy *= 0.98;
        return p.life > 0;
      });

      // remove consumed nutrients
      nutrientsRef.current = nutrientsRef.current.filter((n) => !n.consumed);

      // add nutrients occasionally
      if (addingNutrients && tickRef.current % 120 === 0) {
        const types = ["glucose", "amino", "vitamin"] as const;
        const t = types[Math.floor(Math.random() * types.length)];
        const colors = {
          glucose: "#fbbf24",
          amino: "#34d399",
          vitamin: "#f472b6",
        } as const;
        nutrientsRef.current.push({
          id: nextIdRef.current++,
          x: Math.random() * width,
          y: Math.random() * height,
          value: 10 + Math.random() * 20,
          type: t,
          color: colors[t],
          consumed: false,
        });
      }

      // increment tick
      tickRef.current += Math.max(1, Math.round(dt));
    },
    [addingNutrients]
  );

  // render helper used by both one-shot render and loop
  const renderLoopRender = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (viewMode === "fluorescent") {
      gradient.addColorStop(0, "#001018");
      gradient.addColorStop(1, "#002a2a");
    } else if (viewMode === "phase") {
      gradient.addColorStop(0, "#111216");
      gradient.addColorStop(1, "#0b0b0f");
    } else {
      gradient.addColorStop(0, "#071021");
      gradient.addColorStop(1, "#000409");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // zoom transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // nutrients
    for (const nutrient of nutrientsRef.current) {
      if (nutrient.consumed) continue;
      ctx.save();
      ctx.globalAlpha = 0.6;
      const glow = ctx.createRadialGradient(
        nutrient.x,
        nutrient.y,
        0,
        nutrient.x,
        nutrient.y,
        nutrient.value * 1.5
      );
      glow.addColorStop(0, hexToRgba(nutrient.color, 0.6));
      glow.addColorStop(1, hexToRgba(nutrient.color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(nutrient.x, nutrient.y, nutrient.value, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nutrient.color;
      ctx.beginPath();
      ctx.arc(nutrient.x, nutrient.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // bacteria
    for (const b of bacteriaRef.current) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);
      ctx.globalAlpha = b.dead ? 0.35 : Math.min(1, b.health / 100);
      const shape = BACTERIA_TYPES[b.type].shape;

      if (shape === "rod") {
        ctx.fillStyle = b.infected ? "#ef4444" : b.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.size * 0.8, b.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === "sphere") {
        const grad = ctx.createRadialGradient(-b.size * 0.2, -b.size * 0.2, 0, 0, 0, b.size);
        grad.addColorStop(0, b.infected ? "#ff6b6b" : b.color);
        grad.addColorStop(1, hexToRgba(b.color, 0.4));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = b.infected ? "#ef4444" : b.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 4; t += 0.2) {
          const x = (t * 2) * Math.cos(t);
          const y = (t * 1) * Math.sin(t);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // flagella (simple)
      if (b.flagella && !b.dead) {
        ctx.strokeStyle = hexToRgba(b.color, 0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.size * 0.5, 0);
        for (let i = 1; i <= 4; i++) {
          const x = b.size * 0.5 + i * 4.5;
          const y = Math.sin(tickRef.current * 0.05 + i * 0.5) * 4;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.restore();
    }

    // phages
    for (const p of phagesRef.current) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      if (viewMode === "fluorescent") {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // hex-ish head
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        const x = Math.cos(a) * p.size;
        const y = Math.sin(a) * p.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // tail
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, p.size);
      ctx.lineTo(0, p.size + p.tailLength);
      ctx.stroke();

      ctx.restore();
    }

    // particles
    for (const pt of particlesRef.current) {
      ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / 60));
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // quorum overlay
    if (quorumSensing) {
      const density = bacteriaRef.current.filter((b) => !b.dead).length;
      if (density > 20) {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#10b981";
        for (const b of bacteriaRef.current) {
          if (!b.dead) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 24, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
  };

  // main loop tick
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // dt scaled by speed (we use 1 as base)
    const dt = Math.max(1, Math.round(speed * 1)); // simple discrete dt
    stepSimulation(dt);
    renderLoopRender(ctx);

    // update stats every ~20 ticks to avoid over-render
    if (tickRef.current % 20 === 0) {
      updateStatsImmediate();
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [speed, stepSimulation, updateStatsImmediate]);

  // start/stop effect
  useEffect(() => {
    if (isRunning && rafRef.current === null) {
      rafRef.current = requestAnimationFrame(loop);
    } else if (!isRunning && rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, loop]);

  /* -------------------------
     Controls
     ------------------------- */

  const handleReset = () => {
    setIsRunning(false);
    tickRef.current = 0;
    // re-run client-only initialization logic quickly:
    // reuse same init logic but smaller
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    bacteriaRef.current = [];
    phagesRef.current = [];
    nutrientsRef.current = [];
    particlesRef.current = [];
    nextIdRef.current = 1;
    // small seed
    const types = Object.keys(BACTERIA_TYPES) as BacteriumType[];
    for (let i = 0; i < 24; i++) {
      const t = types[Math.floor(Math.random() * types.length)];
      const cfg = BACTERIA_TYPES[t];
      bacteriaRef.current.push({
        id: nextIdRef.current++,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        angle: 0,
        angularVelocity: 0,
        type: t,
        health: 100,
        age: 0,
        divisionTimer: 100 + Math.random() * 200,
        infected: false,
        phageCount: 0,
        resistance: Math.random() * 0.3,
        flagella: t === "ecoli" || t === "spirillum",
        pili: [],
        color: cfg.color,
        size: cfg.size,
        energy: 70 + Math.random() * 30,
        dead: false,
      });
    }
    nutrientsRef.current = [];
    for (let n = 0; n < Math.floor(nutrientDensity * 0.5); n++) {
      nutrientsRef.current.push({
        id: nextIdRef.current++,
        x: Math.random() * width,
        y: Math.random() * height,
        value: 10 + Math.random() * 20,
        type: (["glucose", "amino", "vitamin"] as const)[Math.floor(Math.random() * 3)],
        color: "#fbbf24",
        consumed: false,
      });
    }
    // brief render
    setTimeout(() => {
      updateStatsImmediate();
      renderOnce();
    }, 30);
  };

  const addPhages = () => {
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    const types = Object.keys(PHAGE_TYPES) as PhageType[];
    for (let i = 0; i < 8; i++) {
      const t = types[Math.floor(Math.random() * types.length)];
      const cfg = PHAGE_TYPES[t];
      phagesRef.current.push({
        id: nextIdRef.current++,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        attached: false,
        injected: false,
        type: t,
        size: cfg.size,
        color: cfg.color,
        tailLength: cfg.tailLength,
        angle: Math.random() * Math.PI * 2,
      });
    }
    updateStatsImmediate();
  };

  /* -------------------------
     Component render
     ------------------------- */

  return (
    <SimulationContainer $isDark={isDark}>
      <VideoSection>
        <CanvasContainer>
          <SimCanvas
            ref={canvasRef}
            // ensure canvas starts with fixed size server-side (no random)
            width={canvasWidth.current}
            height={canvasHeight.current}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.6) 100%)",
              zIndex: 20,
            }}
          />
          <HUD $isDark={isDark}>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Microscope size={16} />
              Microcosmos
            </div>

            <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Bacteria:</span>
                <span style={{ fontWeight: 600, color: "#22c55e" }}>
                  {stats.healthyBacteria}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Infected:</span>
                <span style={{ fontWeight: 600, color: "#ef4444" }}>
                  {stats.infectedBacteria}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Phages:</span>
                <span style={{ fontWeight: 600, color: "#dc2626" }}>
                  {stats.totalPhages}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.7 }}>Nutrients:</span>
                <span style={{ fontWeight: 600, color: "#fbbf24" }}>
                  {stats.nutrients}
                </span>
              </div>
            </div>
          </HUD>

          <div style={{ position: "absolute", bottom: 12, left: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Eye size={12} />
              <span>Magnification: {(zoomLevel * 1000).toFixed(0)}x</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: 8 }}>
              <button
                onClick={() => setViewMode("normal")}
                style={{
                  padding: "0.25rem 0.5rem",
                  background: viewMode === "normal" ? "#3b82f6" : "transparent",
                  border: "1px solid #3b82f6",
                  borderRadius: 4,
                  color: "#fff",
                  fontSize: "0.65rem",
                }}
              >
                Normal
              </button>
              <button
                onClick={() => setViewMode("fluorescent")}
                style={{
                  padding: "0.25rem 0.5rem",
                  background: viewMode === "fluorescent" ? "#10b981" : "transparent",
                  border: "1px solid #10b981",
                  borderRadius: 4,
                  color: "#fff",
                  fontSize: "0.65rem",
                }}
              >
                Fluor
              </button>
              <button
                onClick={() => setViewMode("phase")}
                style={{
                  padding: "0.25rem 0.5rem",
                  background: viewMode === "phase" ? "#8b5cf6" : "transparent",
                  border: "1px solid #8b5cf6",
                  borderRadius: 4,
                  color: "#fff",
                  fontSize: "0.65rem",
                }}
              >
                Phase
              </button>
            </div>
          </div>

          <PlaybackControls>
            <button onClick={() => setIsRunning((r) => !r)}>
              {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>

            <button onClick={handleReset}>
              <RefreshCw size={24} />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0 1rem",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Zap size={14} />
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, minWidth: 40 }}>
                {speed}x
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0 1rem",
                borderLeft: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Eye size={14} />
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
              />
            </div>
          </PlaybackControls>

          <SpeedIndicator>
            <Activity size={14} style={{ marginRight: 8 }} />
            Gen {stats.generationNumber}
          </SpeedIndicator>
        </CanvasContainer>
      </VideoSection>

      <ControlsSection $isDark={isDark}>
        <TabContainer>
          <Tab $active onClick={() => {}}>
            <Beaker size={16} style={{ marginRight: 8 }} />
            Environment
          </Tab>
          <Tab onClick={() => {}}>
            <Dna size={16} style={{ marginRight: 8 }} />
            Population
          </Tab>
          <Tab onClick={() => {}}>
            <Microscope size={16} style={{ marginRight: 8 }} />
            Microscope
          </Tab>
        </TabContainer>

        <TabContent>
          <div style={{ padding: 12 }}>
            <GridLikeControls
              nutrientDensity={nutrientDensity}
              setNutrientDensity={setNutrientDensity}
              nutrientToggle={{
                addingNutrients,
                setAddingNutrients,
              }}
              addingPhages={addingPhages}
              setAddingPhages={setAddingPhages}
              addPhages={addPhages}
              biofilmMode={biofilmMode}
              setBiofilmMode={setBiofilmMode}
              quorumSensing={quorumSensing}
              setQuorumSensing={setQuorumSensing}
              stats={stats}
            />
          </div>
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}

/* -------------------------
   Small presentational subcomponent kept outside main return for clarity
   (you can inline/replace with your styled components if preferred)
   ------------------------- */

function GridLikeControls(props: {
  nutrientDensity: number;
  setNutrientDensity: (v: number) => void;
  nutrientToggle: { addingNutrients: boolean; setAddingNutrients: (b: boolean) => void };
  addingPhages: boolean;
  setAddingPhages: (b: boolean) => void;
  addPhages: () => void;
  biofilmMode: boolean;
  setBiofilmMode: (b: boolean) => void;
  quorumSensing: boolean;
  setQuorumSensing: (b: boolean) => void;
  stats: any;
}) {
  const {
    nutrientDensity,
    setNutrientDensity,
    nutrientToggle,
    addingPhages,
    setAddingPhages,
    addPhages,
    biofilmMode,
    setBiofilmMode,
    quorumSensing,
    setQuorumSensing,
    stats,
  } = props;

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3,1fr)" }}>
      <ParameterControl>
        <div className="header">
          <span className="label">Nutrient Density</span>
          <span className="value">{nutrientDensity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={nutrientDensity}
          onChange={(e) => setNutrientDensity(Number(e.target.value))}
        />
      </ParameterControl>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <GlowButton onClick={addPhages} $color="#ef4444">
          <Plus size={14} style={{ marginRight: 8 }} /> Add Phages
        </GlowButton>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <InterventionCard
          $active={nutrientToggle.addingNutrients}
          $color="#fbbf24"
          onClick={() => nutrientToggle.setAddingNutrients(!nutrientToggle.addingNutrients)}
        >
          <div className="icon">
            <Droplet size={24} />
          </div>
          <div className="name">Nutrient Supply</div>
          <div className="efficacy">Auto-replenish</div>
        </InterventionCard>

        <InterventionCard
          $active={biofilmMode}
          $color="#22c55e"
          onClick={() => setBiofilmMode(!biofilmMode)}
        >
          <div className="icon">
            <Shield size={24} />
          </div>
          <div className="name">Biofilm Formation</div>
          <div className="efficacy">Collective behavior</div>
        </InterventionCard>

        <InterventionCard
          $active={quorumSensing}
          $color="#3b82f6"
          onClick={() => setQuorumSensing(!quorumSensing)}
        >
          <div className="icon">
            <Activity size={24} />
          </div>
          <div className="name">Quorum Sensing</div>
          <div className="efficacy">Cell communication</div>
        </InterventionCard>

        <InterventionCard
          $active={addingPhages}
          $color="#ef4444"
          onClick={() => setAddingPhages(!addingPhages)}
        >
          <div className="icon">
            <AlertTriangle size={24} />
          </div>
          <div className="name">Phage Therapy</div>
          <div className="efficacy">Viral predation</div>
        </InterventionCard>
      </div>

      {/* Quick stat cards */}
      <StatCard $color="#22c55e">
        <div className="label">Biodiversity</div>
        <div className="value">{stats.biodiversity.toFixed ? stats.biodiversity.toFixed(0) : stats.biodiversity}</div>
        <div className="change">Shannon index (approx)</div>
      </StatCard>

      <StatCard $color="#ef4444">
        <div className="label">Infection Rate</div>
        <div className="value">
          {stats.totalBacteria > 0
            ? `${Math.round((stats.infectedBacteria / stats.totalBacteria) * 100)}%`
            : "0%"}
        </div>
        <div className="change">Phage spread</div>
      </StatCard>

      <StatCard $color="#8b5cf6">
        <div className="label">Resistance</div>
        <div className="value">{Math.round(stats.resistanceLevel)}%</div>
        <div className="change">Average immunity</div>
      </StatCard>
    </div>
  );
}
