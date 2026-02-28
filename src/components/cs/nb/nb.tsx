'use client'
// src/components/cs/nb/nb.tsx
// The Universe Explorer — immersive full-screen galaxy + solar system experience

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNBodySimulation, PerformanceMetrics, PhysicsUpdate } from './nb.logic';
import { useNBodyRendering } from './nb.rendering';
import {
  DEFAULT_PHYSICS, DEFAULT_VISUAL, DEFAULT_CAMERA,
  PREDEFINED_SCENARIOS, Vector3Data, Scenario
} from './nb.config';
import { NBodyGlobalStyles, UniverseExplorerStyles } from './nb.styles';
import { STAR_CATALOG, NAMED_STARS } from './nb.starCatalog';

interface NBodySandboxProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

// Convert B-V color index to approximate spectral class label
function bvToSpectralClass(bv: number): string {
  if (bv === 99 || isNaN(bv) || bv > 90) return 'Unknown';
  if (bv < -0.20) return 'O (blue supergiant)';
  if (bv < 0.00)  return 'B (blue-white)';
  if (bv < 0.30)  return 'A (white)';
  if (bv < 0.58)  return 'F (yellow-white)';
  if (bv < 0.81)  return 'G (sun-like)';
  if (bv < 1.40)  return 'K (orange giant)';
  return 'M (red dwarf)';
}

// ──────────────────────────────────────────────────────────────────────────────
// Procedural star system generator
// Builds a unique N-body scenario from a star's B-V color index and catalog index.
// Uses a seeded LCG so the same star always produces the same system.
// ──────────────────────────────────────────────────────────────────────────────
function generateStarSystem(starName: string, bv: number, _mag: number, starIndex: number): Scenario {
  // Seeded LCG — reproducible per star
  let seed = (starIndex * 1664525 + 1013904223) >>> 0;
  const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xFFFFFFFF; };

  const SOLAR_MASS   = 2.0e30;  // kg
  const SOLAR_RADIUS = 7.0e8;   // m
  const AU = 1.496e11;           // m per AU
  const G  = 6.674e-11;
  const EARTH_MASS = 5.972e24;

  // ── Star properties from B-V ──────────────────────────────────────────────
  let starMass: number, starRadius: number, starColor: string, numPlanets: number, luminosity: number;
  if (bv < -0.20) {        // O — hot blue giant
    starMass = (20 + rng() * 60) * SOLAR_MASS;   starRadius = (6 + rng() * 14) * SOLAR_RADIUS;
    starColor = '#b8cbff'; luminosity = 100 + rng() * 900; numPlanets = 1 + Math.floor(rng() * 2);
  } else if (bv < 0.00) {  // B — blue-white
    starMass = (3 + rng() * 12) * SOLAR_MASS;    starRadius = (2 + rng() * 4) * SOLAR_RADIUS;
    starColor = '#cad8ff'; luminosity = 10 + rng() * 90;   numPlanets = 2 + Math.floor(rng() * 2);
  } else if (bv < 0.30) {  // A — white
    starMass = (1.5 + rng() * 1.0) * SOLAR_MASS; starRadius = (1.4 + rng() * 0.6) * SOLAR_RADIUS;
    starColor = '#eef0ff'; luminosity = 2 + rng() * 8;     numPlanets = 2 + Math.floor(rng() * 3);
  } else if (bv < 0.58) {  // F — yellow-white
    starMass = (1.1 + rng() * 0.4) * SOLAR_MASS; starRadius = (1.1 + rng() * 0.3) * SOLAR_RADIUS;
    starColor = '#fff7e8'; luminosity = 1.2 + rng() * 0.8; numPlanets = 3 + Math.floor(rng() * 3);
  } else if (bv < 0.81) {  // G — sun-like
    starMass = (0.85 + rng() * 0.3) * SOLAR_MASS; starRadius = (0.85 + rng() * 0.3) * SOLAR_RADIUS;
    starColor = '#fff3c0'; luminosity = 0.5 + rng() * 1.0; numPlanets = 3 + Math.floor(rng() * 4);
  } else if (bv < 1.40) {  // K — orange
    starMass = (0.45 + rng() * 0.35) * SOLAR_MASS; starRadius = (0.65 + rng() * 0.2) * SOLAR_RADIUS;
    starColor = '#ffb060'; luminosity = 0.08 + rng() * 0.5; numPlanets = 2 + Math.floor(rng() * 4);
  } else {                  // M — red dwarf
    starMass = (0.1 + rng() * 0.35) * SOLAR_MASS; starRadius = (0.15 + rng() * 0.5) * SOLAR_RADIUS;
    starColor = '#ff6634'; luminosity = 0.001 + rng() * 0.08; numPlanets = 1 + Math.floor(rng() * 4);
  }

  // Habitable zone in AU — scales with luminosity
  const hzAU = Math.max(0.05, Math.min(25, Math.sqrt(luminosity)));

  // ── Build bodies ──────────────────────────────────────────────────────────
  const bodies: Scenario['bodies'] = [
    {
      id: 'visited-star',
      name: starName,
      type: 'star',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass: starMass,
      radius: starRadius,
      color: starColor,
      emissive: starColor,
      albedo: 1.0,
      temperature: Math.round(7200 / (bv + 0.64) + 200), // rough bv→K
      parentId: undefined,
      childIds: [],
      isFixed: false,
      useAnalyticalOrbit: false,
      realWorldObject: starName,
    }
  ];

  // ── Planets — inner rocky, mid potentially habitable, outer gas/ice ──────
  const PLANET_COLORS = [
    '#c07040', '#8fb4c8', '#7a9e6a', '#d09050',  // rocky palette
    '#88aabb', '#c4a870', '#d4b090',              // gas/ice palette
  ];
  let orbitAU = Math.max(0.04, hzAU * 0.12); // start well inside hz

  for (let p = 0; p < numPlanets; p++) {
    orbitAU *= (1.5 + rng() * 0.8); // Titius-Bode-like spacing
    const orbitM = orbitAU * AU;
    const vOrb   = Math.sqrt(G * starMass / orbitM); // circular orbit velocity

    const fraction = p / Math.max(1, numPlanets - 1); // 0 (inner) → 1 (outer)
    let pMass: number, pRadius: number, pColor: string;

    if (fraction < 0.35) {
      // Inner rocky — Mercury/Venus-like
      pMass   = (0.05 + rng() * 1.0) * EARTH_MASS;
      pRadius = (2.0 + rng() * 3.0) * 1e6;
      pColor  = PLANET_COLORS[Math.floor(rng() * 4)];
    } else if (fraction < 0.65) {
      // Mid zone — possibly habitable, super-Earth to mini-Neptune
      pMass   = (0.5 + rng() * 8.0) * EARTH_MASS;
      pRadius = (3.5 + rng() * 8.0) * 1e6;
      pColor  = PLANET_COLORS[Math.floor(rng() * 4)];
    } else {
      // Outer — gas/ice giant
      pMass   = (15 + rng() * 300) * EARTH_MASS;
      pRadius = (2.0 + rng() * 6.0) * 7e7; // 0.3–1.1 Jupiter radii
      pColor  = PLANET_COLORS[4 + Math.floor(rng() * 3)];
    }

    bodies.push({
      id: `planet-${p}`,
      name: `${starName} ${String.fromCharCode(98 + p)}`, // b, c, d…
      type: 'planet',
      position: { x: orbitM, y: 0, z: 0 },
      velocity: { x: 0, y: vOrb, z: 0 },
      mass: pMass,
      radius: pRadius,
      color: pColor,
      albedo: 0.25 + rng() * 0.4,
      parentId: 'visited-star',
      childIds: [],
      isFixed: false,
      useAnalyticalOrbit: false,
    });
  }

  return {
    id: `visited-${starIndex}`,
    name: `${starName} System`,
    description: `${bvToSpectralClass(bv)} star with ${numPlanets} planet${numPlanets !== 1 ? 's' : ''}`,
    category: 'solar-system',
    difficulty: 'beginner',
    bodies,
    initialCamera: { ...DEFAULT_CAMERA, position: { x: 0, y: hzAU * AU * 3, z: hzAU * AU * 3 } },
    physicsConfig: { timeStep: 3600, algorithm: 'barnes-hut' },
    visualConfig: { enableTrails: true, showBodyLabels: true },
    estimatedDuration: 300,
    basedOnRealSystem: true,
    accuracy: 'educational',
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Galaxy points of interest — locations user can fly to
// ──────────────────────────────────────────────────────────────────────────────
const GALAXY_POIS = [
  { id: 'center',    label: 'Galactic Core',    desc: 'Sagittarius A* — 4 million solar masses',   icon: '⚫', radius: 8000   },
  { id: 'orion',     label: 'Orion Spur',        desc: 'Our home — between Perseus & Sagittarius',   icon: '🌍', radius: 200000 },
  { id: 'perseus',   label: 'Perseus Arm',        desc: 'Major spiral arm, dense OB star clusters',  icon: '✨', radius: 120000 },
  { id: 'scutum',    label: 'Scutum-Centaurus',   desc: 'The brightest major arm of the Milky Way',  icon: '🌀', radius: 150000 },
  { id: 'sagittarius', label: 'Sagittarius Arm',  desc: 'Inner minor arm rich in H-II nebulae',     icon: '🔴', radius: 180000 },
  { id: 'edge',      label: 'Galactic Edge',      desc: 'The outer disk — 130,000 light years out',  icon: '🌌', radius: 380000 },
] as const;

const NBodySandbox: React.FC<NBodySandboxProps> = ({
  isRunning: externalRunning = false,
}) => {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Which world we're in
  const [isGalaxyMode, setIsGalaxyMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'solar-system' | 'galaxy-explorer'>('solar-system');
  // Currently visited catalog star (null = our solar system)
  const [visitedStar, setVisitedStar] = useState<{ name: string; bv: number; mag: number } | null>(null);

  // UI panels
  const [showPanel, setShowPanel] = useState<'none' | 'navigate' | 'bodies' | 'info'>('none');
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [fpActive, setFpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const previouslyRunningRef = useRef(false);
  // Stable ref so onGalaxySunClick (created before switchScenario) can call it
  const switchScenarioRef = useRef<((id: 'solar-system' | 'galaxy-explorer') => void) | null>(null);
  // Stable ref so onCatalogStarClick (created before visitStar) can call it
  const visitStarRef = useRef<((idx: number) => void) | null>(null);

  const [physicsConfig] = useState(DEFAULT_PHYSICS);
  const [visualConfig] = useState({ ...DEFAULT_VISUAL, enableTrails: true, showBodyLabels: true });
  const [cameraConfig] = useState(DEFAULT_CAMERA);

  // ── Simulation ──────────────────────────────────────────────────────────────
  const simulation = useNBodySimulation({
    config: physicsConfig,
    initialScenario: PREDEFINED_SCENARIOS['solar-system'],
    onBodyUpdate: useCallback((_: PhysicsUpdate[]) => {}, []),
    onPerformanceUpdate: useCallback((_: PerformanceMetrics) => {}, []),
  });

  // Auto-start solar system on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!simulation.simulationState.isRunning) simulation.start();
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rendering ───────────────────────────────────────────────────────────────
  const rendering = useNBodyRendering({
    containerRef: canvasRef,
    bodies: simulation.getBodies(),
    selectedBodies: simulation.getSelectedBodies(),
    visualConfig,
    cameraConfig,
    simulationTime: simulation.simulationState.currentTime,
    onCameraUpdate: useCallback((_p: Vector3Data, _t: Vector3Data) => {}, []),
    onBodyClick: useCallback((bodyId: string) => {
      simulation.selectBody(bodyId, false);
      setSelectedBodyId(bodyId);
    }, [simulation]),
    onBackgroundClick: useCallback(() => {
      setSelectedBodyId(null);
    }, []),
    onGalaxyModeChange: useCallback((galaxy: boolean) => {
      setIsGalaxyMode(galaxy);
      if (galaxy) {
        simulation.pause();
      } else {
        simulation.start();
      }
    }, [simulation]),
    onGalaxySunClick: useCallback(() => {
      // Clicking our Sun in galaxy view → fly back to our solar system
      setVisitedStar(null);
      switchScenarioRef.current?.('solar-system');
    }, []),
    onCatalogStarClick: useCallback((starIndex: number) => {
      // Clicking a HYG catalog star → show its solar system (with star identity)
      const entry = STAR_CATALOG[starIndex];
      if (!entry) return;
      const [,,,mag,bv] = entry;
      const name = NAMED_STARS[starIndex] ?? `HYG-${starIndex}`;
      setVisitedStar({ name, bv, mag });
      switchScenarioRef.current?.('solar-system');
    }, []),
  });

  // ── Scenario switching ──────────────────────────────────────────────────────
  const switchScenario = useCallback(async (id: 'solar-system' | 'galaxy-explorer') => {
    if (id === activeScenario) return;
    setIsLoading(true);
    setShowPanel('none');
    setSelectedBodyId(null);
    // Clear visited-star context when manually switching scenarios
    if (id === 'galaxy-explorer') setVisitedStar(null);
    try {
      const scenario = PREDEFINED_SCENARIOS[id];
      simulation.loadScenario(scenario);
      setActiveScenario(id);
      await new Promise(r => setTimeout(r, 300));
      if (id === 'solar-system') {
        simulation.start();
        rendering.zoomToFit?.();
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeScenario, simulation, rendering]);

  // Keep switchScenarioRef in sync so onGalaxySunClick can call it without circular deps
  useEffect(() => {
    switchScenarioRef.current = switchScenario;
  }, [switchScenario]);

  // ── First-person ─────────────────────────────────────────────────────────────
  const enterFP = useCallback((bodyId: string) => {
    rendering.enterFirstPerson(bodyId);
    setFpActive(true);
    setShowPanel('none');
  }, [rendering]);

  const exitFP = useCallback(() => {
    rendering.exitFirstPerson();
    setFpActive(false);
  }, [rendering]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fpActive) exitFP();
        else setShowPanel('none');
      }
      if ((e.key === 'v' || e.key === 'V') && selectedBodyId && !fpActive && !isGalaxyMode) {
        enterFP(selectedBodyId);
      }
      if (e.key === 'h' || e.key === 'H') setHudVisible(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fpActive, selectedBodyId, isGalaxyMode, exitFP, enterFP]);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(async () => {
    const el = canvasRef.current?.parentElement as HTMLElement | null;
    const doc = document as any;
    try {
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        const target = el || canvasRef.current;
        if (!target) return;
        if (target.requestFullscreen) await target.requestFullscreen();
        else if ((target as any).webkitRequestFullscreen) await (target as any).webkitRequestFullscreen();
        setIsFullscreen(true);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        setIsFullscreen(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      }
    } catch (e) { /* ignore */ }
  }, []);
  useEffect(() => {
    const onFS = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    };
    document.addEventListener('fullscreenchange', onFS);
    document.addEventListener('webkitfullscreenchange', onFS);
    return () => {
      document.removeEventListener('fullscreenchange', onFS);
      document.removeEventListener('webkitfullscreenchange', onFS);
    };
  }, []);

  // Time display
  const simDays  = simulation.simulationState.currentTime / 86400;
  const simYears = simDays / 365.25;
  const J2000_MS = 946728000000;
  const simDate  = new Date(J2000_MS + simulation.simulationState.currentTime * 1000);
  const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr  = `${simDate.getUTCDate()} ${MONTHS[simDate.getUTCMonth()]} ${simDate.getUTCFullYear()}`;
  const timeStr  = simYears >= 1 ? `${simYears.toFixed(1)} yrs` : `${Math.floor(simDays)} days`;

  const bodies = simulation.getBodies();

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <NBodyGlobalStyles />
      <UniverseExplorerStyles />

      {/* ── Full-bleed canvas wrapper ───────────────────────────────────── */}
      <div className="ue-root">

        {/* WebGL canvas */}
        <div ref={canvasRef} className="ue-canvas" />

        {/* ── Loading veil ─────────────────────────────────────────────── */}
        {isLoading && (
          <div className="ue-veil">
            <div className="ue-spinner" />
            <div className="ue-veil-label">Travelling…</div>
          </div>
        )}

        {/* ── First-person overlay ─────────────────────────────────────── */}
        {fpActive && (
          <div className="ue-fp-overlay">
            <div className="ue-fp-hint">drag to look · V or Esc to exit</div>
            <button className="ue-fp-exit" onClick={exitFP}>✕ Exit View</button>
            {rendering.fpHUD && (
              <div className="ue-fp-hud">
                <div>📍 {rendering.fpHUD.bodyName}</div>
                <div>📅 {dateStr}</div>
                <div>{rendering.fpHUD.distAU < 0.001
                  ? `☀ ${(rendering.fpHUD.distAU * 149600).toFixed(0)} km`
                  : `☀ ${rendering.fpHUD.distAU.toFixed(4)} AU`}
                </div>
                <div>⚡ {rendering.fpHUD.speedKms.toFixed(2)} km/s</div>
              </div>
            )}
            <div className="ue-crosshair" />
          </div>
        )}

        {/* ── Top-left: world switcher ──────────────────────────────────── */}
        {!fpActive && (
          <div className="ue-world-switcher">
            <button
              className={`ue-world-btn ${activeScenario === 'solar-system' ? 'active' : ''}`}
              onClick={() => switchScenario('solar-system')}
            >
              🌍 Solar System
            </button>
            <button
              className={`ue-world-btn ${activeScenario === 'galaxy-explorer' ? 'active' : ''}`}
              onClick={() => switchScenario('galaxy-explorer')}
            >
              🌌 Milky Way
            </button>
          </div>
        )}

        {/* ── Top-right: fullscreen + hide HUD ─────────────────────────── */}
        {!fpActive && (
          <div className="ue-top-right">
            <button className="ue-icon-btn" onClick={() => setHudVisible(v => !v)} title="Toggle HUD (H)">
              {hudVisible ? '👁' : '👁‍🗨'}
            </button>
            <button className="ue-icon-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
              {isFullscreen ? '⊡' : '⛶'}
            </button>
          </div>
        )}

        {/* ── HUD: top-right info ───────────────────────────────────────── */}
        {hudVisible && !fpActive && (
          <div className={`ue-hud ${isGalaxyMode ? 'galaxy' : ''}`}>
            {isGalaxyMode ? (
              <>
                <div className="ue-hud-title">🌌 Milky Way</div>
                <div className="ue-hud-row"><span>Stars</span><span>~300 billion</span></div>
                <div className="ue-hud-row"><span>Diameter</span><span>~100,000 ly</span></div>
                <div className="ue-hud-row"><span>You are in</span><span style={{color:'#86efac'}}>Orion Spur</span></div>
                <div className="ue-hud-row"><span>Distance to core</span><span>26,000 ly</span></div>
                <div className="ue-hud-row"><span>FPS</span><span>{rendering.fps}</span></div>
              </>
            ) : visitedStar ? (
              <>
                <div className="ue-hud-title" style={{color:'#7dd3fc'}}>✦ {visitedStar.name}</div>
                <div className="ue-hud-row"><span>Spectral</span><span>{bvToSpectralClass(visitedStar.bv)}</span></div>
                <div className="ue-hud-row"><span>Magnitude</span><span>{visitedStar.mag.toFixed(1)}</span></div>
                <div className="ue-hud-row"><span>Date</span><span>{dateStr}</span></div>
                <div className="ue-hud-row"><span>FPS</span><span>{rendering.fps}</span></div>
                <button
                  style={{marginTop:'0.5rem',fontSize:'0.7rem',padding:'0.2rem 0.5rem',
                    background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',
                    borderRadius:'4px',color:'#cbd5e1',cursor:'pointer',width:'100%'}}
                  onClick={() => { setVisitedStar(null); switchScenario('galaxy-explorer'); }}
                >
                  ← Back to Milky Way
                </button>
              </>
            ) : (
              <>
                <div className="ue-hud-title">☀️ Solar System</div>
                <div className="ue-hud-row"><span>Date</span><span>{dateStr}</span></div>
                <div className="ue-hud-row"><span>Elapsed</span><span>{timeStr}</span></div>
                <div className="ue-hud-row"><span>Bodies</span><span>{simulation.simulationState.bodyCount}</span></div>
                <div className="ue-hud-row"><span>Speed</span><span>{simulation.simulationState.speed.toFixed(1)}×</span></div>
                <div className="ue-hud-row"><span>FPS</span><span>{rendering.fps}</span></div>
              </>
            )}
          </div>
        )}

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        {!fpActive && (
          <div className="ue-bottom-bar">

            {/* Galaxy: navigate panel toggle */}
            {isGalaxyMode && (
              <button
                className={`ue-bar-btn ${showPanel === 'navigate' ? 'active' : ''}`}
                onClick={() => setShowPanel(p => p === 'navigate' ? 'none' : 'navigate')}
              >
                🧭 Navigate
              </button>
            )}

            {/* Solar system: bodies panel toggle */}
            {!isGalaxyMode && (
              <button
                className={`ue-bar-btn ${showPanel === 'bodies' ? 'active' : ''}`}
                onClick={() => setShowPanel(p => p === 'bodies' ? 'none' : 'bodies')}
              >
                🪐 Bodies
              </button>
            )}

            {/* Solar system: play/pause */}
            {!isGalaxyMode && (
              <button
                className="ue-bar-btn primary"
                onClick={() => simulation.simulationState.isRunning ? simulation.pause() : simulation.start()}
              >
                {simulation.simulationState.isRunning ? '⏸ Pause' : '▶ Play'}
              </button>
            )}

            {/* Solar system: speed */}
            {!isGalaxyMode && (
              <div className="ue-speed-control">
                <span className="ue-speed-label">Speed {simulation.simulationState.speed.toFixed(1)}×</span>
                <input
                  type="range" min={0.1} max={20} step={0.1}
                  value={simulation.simulationState.speed}
                  onChange={e => simulation.setSpeed(parseFloat(e.target.value))}
                  className="ue-slider"
                />
              </div>
            )}

            {/* Galaxy: speed of tour */}
            {isGalaxyMode && (
              <div className="ue-speed-control">
                <span className="ue-speed-label">Fly speed</span>
                <input type="range" min={1} max={10} step={0.5} defaultValue={3} className="ue-slider" />
              </div>
            )}

            {/* First person: only show when body selected in solar */}
            {!isGalaxyMode && selectedBodyId && (
              <button className="ue-bar-btn" onClick={() => enterFP(selectedBodyId)}>
                👁 Surface View
              </button>
            )}

            {/* Info toggle */}
            <button
              className={`ue-bar-btn ${showPanel === 'info' ? 'active' : ''}`}
              onClick={() => setShowPanel(p => p === 'info' ? 'none' : 'info')}
            >
              ℹ Info
            </button>
          </div>
        )}

        {/* ── Panel: Galaxy Navigation ────────────────────────────────────── */}
        {showPanel === 'navigate' && isGalaxyMode && (
          <div className="ue-panel">
            <div className="ue-panel-header">
              <span>🧭 Navigate the Milky Way</span>
              <button className="ue-panel-close" onClick={() => setShowPanel('none')}>✕</button>
            </div>
            <p className="ue-panel-desc">
              You are floating in the Milky Way — a barred spiral galaxy 100,000 light years across.
              Use your mouse to orbit and scroll to zoom. Click a destination to fly there.
            </p>
            <div className="ue-poi-grid">
              {GALAXY_POIS.map(poi => (
                <button
                  key={poi.id}
                  className="ue-poi-card"
                  onClick={() => {
                    rendering.setFollowBody?.(null);
                    rendering.snapToRadius?.(poi.radius);
                    setShowPanel('none');
                  }}
                >
                  <span className="ue-poi-icon">{poi.icon}</span>
                  <span className="ue-poi-name">{poi.label}</span>
                  <span className="ue-poi-desc">{poi.desc}</span>
                </button>
              ))}
            </div>
            <div className="ue-panel-tip">
              💡 Scroll to zoom in/out · Drag to orbit · The brighter arms are Perseus &amp; Scutum-Centaurus
            </div>

            {/* ── Notable Stars ── */}
            <div style={{marginTop:'1.1rem'}}>
              <div style={{
                color:'#7dd3fc', fontSize:'0.72rem', fontWeight:600,
                letterSpacing:'0.06em', marginBottom:'0.5rem',
              }}>
                ✦ NAMED STARS — click to visit
              </div>
              <p style={{color:'#64748b',fontSize:'0.68rem',margin:'0 0 0.6rem'}}>
                Each star is placed across the galaxy. Click one to jump to its solar system.
              </p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem'}}>
                {([5368,2448,5319,2872,6863,5236,1725,2064,771,1490,6036,2275,7745,8545,496] as number[])
                  .filter(idx => STAR_CATALOG[idx] && NAMED_STARS[idx])
                  .map(idx => {
                    const [,,,mag,bv] = STAR_CATALOG[idx];
                    const name = NAMED_STARS[idx];
                    return (
                      <button
                        key={idx}
                        style={{
                          background:'rgba(125,211,252,0.06)',
                          border:'1px solid rgba(125,211,252,0.20)',
                          borderRadius:'5px', cursor:'pointer',
                          padding:'0.28rem 0.55rem',
                          display:'flex', flexDirection:'column', alignItems:'flex-start',
                          gap:'0.1rem', minWidth:'5.5rem',
                        }}
                        onClick={() => {
                          setVisitedStar({ name, bv, mag });
                          switchScenario('solar-system');
                          setShowPanel('none');
                        }}
                      >
                        <span style={{color:'#e2e8f0',fontSize:'0.72rem',fontWeight:600}}>{name}</span>
                        <span style={{color:'#64748b',fontSize:'0.62rem'}}>{bvToSpectralClass(bv)}</span>
                      </button>
                    );
                  })
                }
              </div>
            </div>
          </div>
        )}

        {/* ── Panel: Solar System Bodies ──────────────────────────────────── */}
        {showPanel === 'bodies' && !isGalaxyMode && (
          <div className="ue-panel">
            <div className="ue-panel-header">
              <span>🪐 Our Solar System</span>
              <button className="ue-panel-close" onClick={() => setShowPanel('none')}>✕</button>
            </div>
            <p className="ue-panel-desc">
              Click a body to follow it. Press 👁 to view from its surface.
            </p>
            {(() => {
              const groups: {key: string; label: string; icon: string; items: typeof bodies}[] = [
                { key:'star',   label:'Stars',   icon:'☀',  items: bodies.filter(b => b.type === 'star' || b.type === 'blackhole') },
                { key:'planet', label:'Planets', icon:'🪐', items: bodies.filter(b => b.type === 'planet') },
                { key:'moon',   label:'Moons',   icon:'🌙', items: bodies.filter(b => b.type === 'moon') },
                { key:'other',  label:'Other',   icon:'🛸', items: bodies.filter(b => !['star','blackhole','planet','moon'].includes(b.type)) },
              ];
              return (
                <div className="ue-body-list">
                  {groups.filter(g => g.items.length > 0).map(g => (
                    <div key={g.key} className="ue-body-group">
                      <div className="ue-body-group-label">{g.icon} {g.label}</div>
                      <div className="ue-body-chips">
                        {g.items.map(body => {
                          const sel = selectedBodyId === body.id;
                          return (
                            <div
                              key={body.id}
                              className={`ue-body-chip ${sel ? 'selected' : ''}`}
                            >
                              <span
                                className="ue-body-chip-name"
                                onClick={() => {
                                  simulation.selectBody(body.id, false);
                                  setSelectedBodyId(body.id);
                                  rendering.setFollowBody?.(body.id);
                                  setShowPanel('none');
                                }}
                              >
                                <span
                                  className="ue-dot"
                                  style={{
                                    background: body.color || '#aaa',
                                    boxShadow: g.key === 'star' ? `0 0 8px ${body.color}` : 'none'
                                  }}
                                />
                                {body.name}
                              </span>
                              <span
                                className="ue-eye-btn"
                                title="View from surface (V)"
                                onClick={e => { e.stopPropagation(); enterFP(body.id); }}
                              >👁</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Panel: Info ─────────────────────────────────────────────────── */}
        {showPanel === 'info' && (
          <div className="ue-panel">
            <div className="ue-panel-header">
              <span>ℹ About This Explorer</span>
              <button className="ue-panel-close" onClick={() => setShowPanel('none')}>✕</button>
            </div>
            {isGalaxyMode ? (
              <div className="ue-info-body">
                <h3>The Milky Way Galaxy</h3>
                <p>You are looking at a scientifically accurate model of our home galaxy — a barred spiral galaxy roughly 100,000 light-years across.</p>
                <ul>
                  <li><strong>2 major arms</strong> — Perseus &amp; Scutum-Centaurus (the brightest bands)</li>
                  <li><strong>2 minor arms</strong> — Sagittarius &amp; Norma</li>
                  <li><strong>Orion Spur</strong> — our home, a short stub between Perseus and Sagittarius, 26,000 ly from the core</li>
                  <li><strong>Sagittarius A*</strong> — the supermassive black hole at the center, ~4 million solar masses</li>
                  <li><strong>80,000 GPU-animated stars</strong> — all orbiting on correct flat rotation curves</li>
                  <li><strong>150 globular clusters</strong> — spherical swarms of ancient stars in the halo</li>
                  <li><strong>H-II nebulae</strong> — star-forming regions glowing in Hα red, OIII teal, SII amber</li>
                </ul>
                <p>All star colors, arm positions, pitch angles, and rotation speeds are based on NASA/ESA/Gaia data.</p>
              </div>
            ) : (
              <div className="ue-info-body">
                <h3>Our Solar System</h3>
                <p>A real-time N-body gravity simulation of our solar system using the Verlet integrator and Barnes-Hut algorithm.</p>
                <ul>
                  <li><strong>8 planets</strong> with real masses, radii, and orbital parameters</li>
                  <li><strong>9 moons</strong> — Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan, Enceladus</li>
                  <li><strong>Real orbital mechanics</strong> — planets drift slightly from Kepler orbits due to mutual gravity</li>
                  <li><strong>Surface views</strong> — press 👁 next to any body to view from its surface</li>
                  <li><strong>Asteroid belt</strong> — 2,000 visual rocks between Mars and Jupiter</li>
                </ul>
                <div className="ue-shortcuts">
                  <div>Drag → orbit camera</div>
                  <div>Scroll → zoom</div>
                  <div>Click body → select &amp; follow</div>
                  <div>V → enter surface view</div>
                  <div>H → hide/show HUD</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NBodySandbox;
