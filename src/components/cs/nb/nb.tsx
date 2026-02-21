'use client'
// src/components/cs/nb/nb.tsx
// The Universe Explorer — immersive full-screen galaxy + solar system experience

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNBodySimulation, PerformanceMetrics, PhysicsUpdate } from './nb.logic';
import { useNBodyRendering } from './nb.rendering';
import {
  DEFAULT_PHYSICS, DEFAULT_VISUAL, DEFAULT_CAMERA,
  PREDEFINED_SCENARIOS, Vector3Data
} from './nb.config';
import { NBodyGlobalStyles } from './nb.styles';

interface NBodySandboxProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
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

  // UI panels
  const [showPanel, setShowPanel] = useState<'none' | 'navigate' | 'bodies' | 'info'>('none');
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [fpActive, setFpActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const previouslyRunningRef = useRef(false);

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
  });

  // ── Scenario switching ──────────────────────────────────────────────────────
  const switchScenario = useCallback(async (id: 'solar-system' | 'galaxy-explorer') => {
    if (id === activeScenario) return;
    setIsLoading(true);
    setShowPanel('none');
    setSelectedBodyId(null);
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
      <style>{CSS}</style>

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
              💡 Scroll to zoom in/out · Drag to orbit · The brighter arms are Perseus & Scutum-Centaurus
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

// ──────────────────────────────────────────────────────────────────────────────
// CSS — all scoped under .ue-root
// ──────────────────────────────────────────────────────────────────────────────
const CSS = `
  .ue-root {
    position: relative;
    width: 100%;
    /* 16:9 up to 90vh so it fits without scrolling */
    aspect-ratio: 16 / 9;
    max-height: 90vh;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #e2e8f0;
    /* Subtle border so it doesn't bleed into the page */
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 24px 80px rgba(0,0,0,0.8);
  }

  /* canvas fills root exactly */
  .ue-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .ue-canvas canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
    touch-action: none;
  }

  /* ── Loading veil ─────────────────────────────────────────── */
  .ue-veil {
    position: absolute; inset: 0; z-index: 200;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: rgba(0,0,5,0.88);
    backdrop-filter: blur(12px);
    gap: 1rem;
  }
  .ue-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: ue-spin 0.9s linear infinite;
  }
  @keyframes ue-spin { to { transform: rotate(360deg); } }
  .ue-veil-label { font-size: 0.85rem; color: rgba(148,163,184,0.8); letter-spacing: 0.1em; }

  /* ── World switcher (top-left) ──────────────────────────────── */
  .ue-world-switcher {
    position: absolute; top: 1rem; left: 1rem; z-index: 50;
    display: flex; gap: 0.4rem;
  }
  .ue-world-btn {
    padding: 0.35rem 0.85rem;
    font-size: 0.75rem; font-weight: 500;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(0,0,0,0.55);
    color: rgba(203,213,225,0.7);
    cursor: pointer; transition: all 0.18s;
    backdrop-filter: blur(8px);
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .ue-world-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .ue-world-btn.active {
    border-color: rgba(99,102,241,0.7);
    background: rgba(99,102,241,0.22);
    color: #a5b4fc;
  }

  /* ── Top-right buttons ─────────────────────────────────────── */
  .ue-top-right {
    position: absolute; top: 1rem; right: 1rem; z-index: 50;
    display: flex; gap: 0.4rem;
  }
  .ue-icon-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.55);
    color: rgba(203,213,225,0.8);
    cursor: pointer; transition: all 0.18s;
    backdrop-filter: blur(8px);
  }
  .ue-icon-btn:hover { background: rgba(255,255,255,0.1); }

  /* ── HUD (top-right, below fullscreen) ────────────────────── */
  .ue-hud {
    position: absolute; top: 3.5rem; right: 1rem; z-index: 40;
    padding: 0.75rem 1rem;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    font-size: 0.73rem; min-width: 180px;
  }
  .ue-hud.galaxy { border-color: rgba(99,102,241,0.25); }
  .ue-hud-title {
    font-size: 0.82rem; font-weight: 700;
    color: #fff; margin-bottom: 0.55rem;
    letter-spacing: 0.03em;
  }
  .ue-hud-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.15rem 0; color: rgba(148,163,184,0.85);
  }
  .ue-hud-row span:last-child { color: #93c5fd; font-weight: 500; }

  /* ── Bottom bar ────────────────────────────────────────────── */
  .ue-bottom-bar {
    position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
    z-index: 50;
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0,0,0,0.65); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 999px;
    flex-wrap: wrap; justify-content: center;
    max-width: calc(100% - 2rem);
  }
  .ue-bar-btn {
    padding: 0.3rem 0.75rem;
    font-size: 0.75rem; font-weight: 500;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(203,213,225,0.85);
    cursor: pointer; transition: all 0.16s;
    white-space: nowrap;
  }
  .ue-bar-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .ue-bar-btn.active {
    background: rgba(99,102,241,0.22);
    border-color: rgba(99,102,241,0.6);
    color: #a5b4fc;
  }
  .ue-bar-btn.primary {
    background: rgba(99,102,241,0.3);
    border-color: rgba(99,102,241,0.6);
    color: #c7d2fe;
  }
  .ue-bar-btn.primary:hover { background: rgba(99,102,241,0.5); }

  /* Speed slider inline in bottom bar */
  .ue-speed-control {
    display: flex; align-items: center; gap: 0.5rem;
  }
  .ue-speed-label {
    font-size: 0.7rem; color: rgba(148,163,184,0.7);
    white-space: nowrap;
  }
  .ue-slider {
    width: 80px; height: 4px;
    -webkit-appearance: none; appearance: none;
    background: rgba(255,255,255,0.12);
    border-radius: 2px; outline: none; cursor: pointer;
  }
  .ue-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 12px; height: 12px; border-radius: 50%;
    background: #6366f1; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.3);
  }

  /* ── Panels (slide up from bottom-left) ────────────────────── */
  .ue-panel {
    position: absolute; bottom: 4rem; left: 1rem; z-index: 60;
    width: clamp(280px, 36vw, 420px);
    max-height: 65%;
    overflow-y: auto;
    background: rgba(5,8,18,0.92); backdrop-filter: blur(18px);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 14px;
    padding: 1.25rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    animation: ue-slideup 0.22s ease-out;
    scrollbar-width: thin;
    scrollbar-color: rgba(99,102,241,0.3) transparent;
  }
  @keyframes ue-slideup {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ue-panel-header {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.9rem; font-weight: 700; color: #fff;
  }
  .ue-panel-close {
    background: none; border: none; color: rgba(148,163,184,0.6);
    cursor: pointer; font-size: 0.9rem; padding: 0.2rem;
    transition: color 0.15s;
  }
  .ue-panel-close:hover { color: #fff; }
  .ue-panel-desc {
    font-size: 0.75rem; color: rgba(148,163,184,0.75);
    line-height: 1.55; margin: 0;
  }
  .ue-panel-tip {
    font-size: 0.7rem; color: rgba(148,163,184,0.45);
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 0.6rem; line-height: 1.5;
  }

  /* ── Galaxy POI grid ───────────────────────────────────────── */
  .ue-poi-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .ue-poi-card {
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 0.2rem; padding: 0.6rem 0.75rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; cursor: pointer;
    transition: all 0.18s; text-align: left;
    color: inherit;
  }
  .ue-poi-card:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.45);
  }
  .ue-poi-icon { font-size: 1.3rem; }
  .ue-poi-name { font-size: 0.78rem; font-weight: 600; color: #e2e8f0; }
  .ue-poi-desc { font-size: 0.65rem; color: rgba(148,163,184,0.65); line-height: 1.4; }

  /* ── Body browser ──────────────────────────────────────────── */
  .ue-body-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .ue-body-group {}
  .ue-body-group-label {
    font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.08em;
    color: rgba(100,116,139,0.9); margin-bottom: 0.4rem;
  }
  .ue-body-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .ue-body-chip {
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.25rem 0.5rem 0.25rem 0.4rem;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    transition: all 0.16s; cursor: pointer;
  }
  .ue-body-chip:hover { background: rgba(255,255,255,0.07); }
  .ue-body-chip.selected {
    border-color: rgba(99,102,241,0.65);
    background: rgba(99,102,241,0.18);
  }
  .ue-body-chip-name {
    display: flex; align-items: center; gap: 0.35rem;
    font-size: 0.75rem; color: #cbd5e1; cursor: pointer;
  }
  .ue-body-chip.selected .ue-body-chip-name { color: #c7d2fe; font-weight: 600; }
  .ue-dot {
    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
    display: inline-block;
  }
  .ue-eye-btn {
    font-size: 0.65rem; cursor: pointer; opacity: 0.5;
    transition: opacity 0.15s; padding: 0.1rem;
  }
  .ue-eye-btn:hover { opacity: 1; }

  /* ── Info panel ────────────────────────────────────────────── */
  .ue-info-body {
    font-size: 0.75rem; color: rgba(148,163,184,0.85); line-height: 1.6;
    display: flex; flex-direction: column; gap: 0.6rem;
  }
  .ue-info-body h3 { color: #fff; font-size: 0.88rem; margin: 0; }
  .ue-info-body p { margin: 0; }
  .ue-info-body ul { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; }
  .ue-info-body strong { color: #93c5fd; }
  .ue-shortcuts {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0.3rem 1rem;
    font-size: 0.68rem; color: rgba(100,116,139,0.9);
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 0.6rem;
  }

  /* ── First-person overlay ──────────────────────────────────── */
  .ue-fp-overlay {
    position: absolute; inset: 0; z-index: 100;
    pointer-events: none;
  }
  .ue-fp-overlay > * { pointer-events: auto; }
  .ue-fp-hint {
    position: absolute; top: 1rem; left: 50%;
    transform: translateX(-50%);
    font-size: 0.68rem; color: rgba(148,163,184,0.45);
    letter-spacing: 0.04em; pointer-events: none;
  }
  .ue-fp-exit {
    position: absolute; top: 1rem; right: 1rem;
    background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px; color: #e2e8f0;
    padding: 0.3rem 0.8rem; cursor: pointer;
    font-size: 0.75rem; backdrop-filter: blur(8px);
    transition: background 0.18s;
  }
  .ue-fp-exit:hover { background: rgba(255,255,255,0.1); }
  .ue-fp-hud {
    position: absolute; bottom: 1.5rem; left: 1.5rem;
    font-family: 'JetBrains Mono','Fira Code','Courier New',monospace;
    font-size: 0.68rem; color: rgba(147,197,253,0.6);
    line-height: 1.7; pointer-events: none;
    text-shadow: 0 0 8px rgba(59,130,246,0.4);
  }
  .ue-crosshair {
    position: absolute; top: 50%; left: 50%;
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.25);
    transform: translate(-50%, -50%);
    box-shadow: 0 0 6px rgba(255,255,255,0.3);
    pointer-events: none;
  }

  /* ── Mobile ────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .ue-panel { width: calc(100vw - 2rem); left: 1rem; bottom: 4.5rem; }
    .ue-poi-grid { grid-template-columns: 1fr; }
    .ue-bottom-bar { gap: 0.35rem; padding: 0.4rem 0.6rem; }
    .ue-bar-btn { padding: 0.28rem 0.55rem; font-size: 0.7rem; }
    .ue-slider { width: 55px; }
    .ue-hud { display: none; }
  }
`;

export default NBodySandbox;
