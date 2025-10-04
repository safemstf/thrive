'use client'
// src/components/cs/nb/nb.tsx
// N-Body Sandbox - No Sidebar Pattern

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, Settings, Target, Zap, Star, Users, Activity,
  Clock, Cpu, Eye, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle,
  Grid, Maximize2, X
} from 'lucide-react';

import { useNBodySimulation, PerformanceMetrics, PhysicsUpdate } from './nb.logic';
import { useNBodyRendering } from './nb.rendering';
import {
  DEFAULT_PHYSICS, DEFAULT_VISUAL, DEFAULT_CAMERA,
  PREDEFINED_SCENARIOS, CelestialBodyDefinition, BodyType,
  MASS_UNITS, ASTRONOMICAL_UNITS, Vector3Data
} from './nb.config';
import {
  SimulationContainer, CanvasContainer, FloatingPanel, PanelHeader, PanelContent,
  IconButton, PrimaryButton, SliderContainer, CustomSlider, InputGroup,
  MetricCard, StatusIndicator, ScenarioGrid, ScenarioCard, LoadingOverlay,
  ProgressBar, NBodyGlobalStyles
} from './nb.styles';

interface NBodySandboxProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
}

interface UIState {
  selectedScenario: string | null;
  activePanel: 'scenarios' | 'controls' | 'bodies' | 'physics' | 'visual' | null;
  selectedBodyId: string | null;
  showMetrics: boolean;
  isLoading: boolean;
  cameraFollowTarget: string | null;
  showTrails: boolean;
  showVelocityVectors: boolean;
  showLabels: boolean;
  showGrid: boolean;
  mobileViewing: boolean;
}

const NBodySandbox: React.FC<NBodySandboxProps> = ({
  isRunning: externalRunning = false,
  speed: externalSpeed = 1,
  isDark = true
}) => {

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const previouslyRunningRef = useRef<boolean>(false);

  const [uiState, setUIState] = useState<UIState>({
    selectedScenario: 'solar-system',
    activePanel: null,
    selectedBodyId: null,
    showMetrics: true,
    isLoading: false,
    cameraFollowTarget: null,
    showTrails: true,
    showVelocityVectors: false,
    showLabels: true,
    showGrid: false,
    mobileViewing: false
  });

  const [physicsConfig, setPhysicsConfig] = useState(DEFAULT_PHYSICS);
  const [visualConfig, setVisualConfig] = useState({
    ...DEFAULT_VISUAL,
    enableTrails: uiState.showTrails,
    showVelocityVectors: uiState.showVelocityVectors,
    showBodyLabels: uiState.showLabels,
    showGrid: uiState.showGrid
  });
  const [cameraConfig, setCameraConfig] = useState(DEFAULT_CAMERA);

  const simulation = useNBodySimulation({
    config: physicsConfig,
    initialScenario: PREDEFINED_SCENARIOS[uiState.selectedScenario || 'solar-system'],
    onBodyUpdate: useCallback((updates: PhysicsUpdate[]) => { }, []),
    onPerformanceUpdate: useCallback((metrics: PerformanceMetrics) => { }, [])
  });

  const rendering = useNBodyRendering({
    containerRef: canvasContainerRef,
    bodies: simulation.getBodies(),
    selectedBodies: simulation.getSelectedBodies(),
    visualConfig,
    cameraConfig,
    onCameraUpdate: useCallback((position: Vector3Data, target: Vector3Data) => { }, []),
    onBodyClick: useCallback((bodyId: string, event: MouseEvent) => {
      simulation.selectBody(bodyId, event.ctrlKey);
      setUIState(prev => ({ ...prev, selectedBodyId: bodyId }));
    }, [simulation]),
    onBackgroundClick: useCallback(() => {
      if ((simulation as any).clearSelection) {
        (simulation as any).clearSelection();
      } else if ((simulation as any).selectBody) {
        (simulation as any).selectBody(null, false);
      }
      setUIState(prev => ({ ...prev, selectedBodyId: null }));
    }, [simulation])
  });

  useEffect(() => {
    if (externalRunning && !simulation.simulationState.isRunning) {
      simulation.start();
    } else if (!externalRunning && simulation.simulationState.isRunning) {
      simulation.pause();
    }
  }, [externalRunning, simulation]);

  // Mobile viewing lifecycle
  useEffect(() => {
    if (!uiState.mobileViewing) return;

    const enterMobileView = async () => {
      previouslyRunningRef.current = simulation.simulationState.isRunning;
      if (!simulation.simulationState.isRunning) simulation.start();

      try {
        const el = canvasContainerRef.current;
        const doc = window.document as any;
        if (el && !doc.fullscreenElement) {
          if ((el as any).requestFullscreen) await (el as any).requestFullscreen();
          else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
          else if ((el as any).mozRequestFullScreen) await (el as any).mozRequestFullScreen();
        }
      } catch (err) {
        console.warn('Fullscreen failed', err);
      }

      // Trigger window resize event to ensure canvas resizes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    enterMobileView();
  }, [uiState.mobileViewing, simulation]);

  // Exit fullscreen handler + orientation change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFS = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      if (!isFS && uiState.mobileViewing) {
        setUIState(prev => ({ ...prev, mobileViewing: false }));
        if (!previouslyRunningRef.current) simulation.pause();
      }
    };

    const handleOrientationChange = () => {
      if (uiState.mobileViewing) {
        // Small delay to let orientation complete
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [uiState.mobileViewing, simulation]);

  const handlePlayPause = useCallback(() => {
    simulation.simulationState.isRunning ? simulation.pause() : simulation.start();
  }, [simulation]);

  const handleReset = useCallback(() => {
    simulation.reset();
    if (typeof rendering.zoomToFit === 'function') rendering.zoomToFit();
    setUIState(prev => ({ ...prev, selectedBodyId: null }));
  }, [simulation, rendering]);

  const handleSpeedChange = useCallback((value: number) => {
    simulation.setSpeed(value);
  }, [simulation]);

  const handleTimeStepChange = useCallback((value: number) => {
    simulation.setTimeStep(value);
  }, [simulation]);

  const toggleCameraFollow = useCallback(() => {
    const selectedBodies = simulation.getSelectedBodies();
    if (!selectedBodies || selectedBodies.length === 0) {
      if (typeof rendering.setFollowBody === 'function') {
        rendering.setFollowBody(null);
      }
      setUIState(prev => ({ ...prev, cameraFollowTarget: null }));
      return;
    }

    const firstId = selectedBodies[0].id;
    setUIState(prev => {
      const target = prev.cameraFollowTarget === firstId ? null : firstId;
      if (typeof rendering.setFollowBody === 'function') {
        rendering.setFollowBody(target);
      }
      return { ...prev, cameraFollowTarget: target };
    });
  }, [simulation, rendering]);

  const updateVisualSetting = useCallback(<K extends keyof UIState>(setting: K, value: UIState[K]) => {
    setUIState(prev => ({ ...prev, [setting]: value }));

    const configMap: { [key in keyof UIState]?: keyof typeof visualConfig } = {
      showTrails: 'enableTrails',
      showVelocityVectors: 'showVelocityVectors',
      showLabels: 'showBodyLabels',
      showGrid: 'showGrid'
    };

    const configKey = configMap[setting];
    if (configKey) {
      setVisualConfig(prev => ({ ...prev, [configKey]: value as any }));
    }

    if (rendering && typeof (rendering as any).updateVisuals === 'function') {
      (rendering as any).updateVisuals({ [configMap[setting] as string]: value });
    }
  }, [rendering, visualConfig]);

  const handleAddBody = useCallback(() => {
    const newBody: CelestialBodyDefinition = {
      id: `body-${Date.now()}`,
      name: `Custom Body ${simulation.simulationState.bodyCount + 1}`,
      type: 'planet' as BodyType,
      position: { x: Math.random() * 2e11 - 1e11, y: 0, z: Math.random() * 2e11 - 1e11 },
      velocity: { x: Math.random() * 2e4 - 1e4, y: 0, z: Math.random() * 2e4 - 1e4 },
      mass: MASS_UNITS.EARTH_MASS,
      radius: ASTRONOMICAL_UNITS.EARTH_RADIUS,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      albedo: 0.3,
      parentId: undefined,
      childIds: [],
      isFixed: false,
      useAnalyticalOrbit: false
    };
    simulation.addBody(newBody);
  }, [simulation]);

  const handleRemoveBody = useCallback((bodyId: string) => {
    simulation.removeBody(bodyId);
    if (uiState.selectedBodyId === bodyId) {
      setUIState(prev => ({ ...prev, selectedBodyId: null }));
    }
  }, [simulation, uiState.selectedBodyId]);

  const togglePanel = useCallback((panel: UIState['activePanel']) => {
    setUIState(prev => ({
      ...prev,
      activePanel: prev.activePanel === panel ? null : panel
    }));
  }, []);

  const handleScenarioSelect = useCallback(async (scenarioId: string) => {
    const scenario = PREDEFINED_SCENARIOS[scenarioId];
    if (!scenario) return;

    setUIState(prev => ({ ...prev, selectedScenario: scenarioId, isLoading: true }));

    try {
      const maybePromise = simulation.loadScenario(scenario) as unknown;
      if (maybePromise && typeof (maybePromise as any).then === 'function') {
        await (maybePromise as Promise<any>);
      }
    } catch (err) {
      console.error('Failed to load scenario', err);
    } finally {
      const primaryBody = scenario.bodies.find(b => b.type === 'star') || scenario.bodies[0];
      if (primaryBody && typeof rendering.setFollowBody === 'function') {
        rendering.setFollowBody(primaryBody.id);
      } else if (typeof rendering.zoomToFit === 'function') {
        rendering.zoomToFit();
      }
      setUIState(prev => ({ ...prev, isLoading: false }));
    }
  }, [simulation, rendering]);

  const exitMobileView = useCallback(async () => {
    setUIState(prev => ({ ...prev, mobileViewing: false }));

    try {
      const doc = window.document as any;
      if (doc && doc.fullscreenElement) {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed', err);
    }
  }, []);

  const timeInDays = simulation.simulationState.currentTime / 86400;
  const timeInYears = timeInDays / 365.25;

  return (
    <>
      <NBodyGlobalStyles />
      <style>{`
        .nb-wrapper {
          width: 100%;
          min-height: 100vh;
          background: radial-gradient(ellipse at center, #0a0f1c 0%, #000 70%, #000 100%);
          color: #e6eef8;
          padding: 2rem 1rem;
          box-sizing: border-box;
        }

        .nb-max-width {
          max-width: 1400px;
          margin: 0 auto;
        }

        .nb-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .nb-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .nb-subtitle {
          font-size: 1rem;
          color: #94a3b8;
        }

        .nb-view-btn {
          display: none;
        }

        .nb-canvas-section {
          width: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.88), rgba(5,10,20,0.9));
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(59,130,246,0.22);
          box-shadow: 0 8px 32px rgba(0,0,0,0.32);
          margin-bottom: 1.5rem;
          aspect-ratio: 16 / 9;
          max-height: 70vh;
          position: relative;
        }

        .nb-canvas-container {
          width: 100%;
          height: 100%;
          position: relative;
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        .nb-canvas-container canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
          touch-action: none;
        }

        .nb-hud {
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 1rem;
          border-radius: 10px;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          color: #e2e8f0;
          border: 1px solid rgba(59,130,246,0.3);
          font-size: 0.9rem;
          z-index: 10;
          min-width: 200px;
        }

        .nb-hud-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .nb-hud-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .nb-overlay-controls {
          position: absolute;
          top: calc(1rem + env(safe-area-inset-top));
          right: 1rem;
          z-index: 10001;
          display: none;
          gap: 0.5rem;
          background: rgba(0,0,0,0.95);
          padding: 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(59,130,246,0.5);
        }

        .nb-overlay-controls.active {
          display: flex;
        }

        .nb-overlay-btn {
          width: 44px;
          height: 44px;
          min-width: 44px;
          min-height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(51,65,85,0.8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .nb-overlay-btn.primary {
          background: #6366f1;
        }

        .nb-overlay-btn.danger {
          background: #ef4444;
        }

        .nb-controls-section {
          width: 100%;
          padding: 1.5rem;
          border-radius: 12px;
          background: rgba(8,12,20,0.6);
          border: 1px solid rgba(59,130,246,0.1);
          margin-bottom: 1.5rem;
        }

        .nb-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #fff;
        }

        .nb-button-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .nb-slider-group {
          margin-bottom: 1rem;
        }

        .nb-visual-options {
          margin-top: 1.5rem;
        }

        .nb-visual-title {
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .nb-visual-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .nb-body-management {
          margin-top: 1.5rem;
        }

        .nb-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .nb-wrapper {
            padding: 1rem 0.75rem;
          }

          .nb-title {
            font-size: 2rem;
          }

          .nb-view-btn {
            display: flex !important;
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

          .nb-view-btn:active {
            transform: scale(0.98);
          }

          .nb-canvas-section {
            display: none !important;
          }

          .nb-canvas-section.mobile-viewing {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            z-index: 10000 !important;
          }

          .nb-controls-section {
            padding: 1rem;
          }

          .nb-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="nb-wrapper">
        <div className="nb-max-width">
          <header className="nb-header">
            <h1 className="nb-title">N-Body Gravity Sandbox</h1>
            <p className="nb-subtitle">Simulate celestial mechanics in real-time</p>
          </header>

          <button
            className="nb-view-btn"
            onClick={() => setUIState(prev => ({ ...prev, mobileViewing: true }))}
          >
            <Maximize2 size={24} />
            View Simulation
          </button>

          <section className={`nb-canvas-section ${uiState.mobileViewing ? 'mobile-viewing' : ''}`}>
            <div ref={canvasContainerRef} className="nb-canvas-container">
              <div className="nb-hud">
                <div className="nb-hud-title">Day {Math.floor(timeInDays)}</div>
                <div className="nb-hud-row">
                  <span style={{ opacity: 0.7 }}>Bodies:</span>
                  <span style={{ fontWeight: 600, color: '#60a5fa' }}>{simulation.simulationState.bodyCount}</span>
                </div>
                <div className="nb-hud-row">
                  <span style={{ opacity: 0.7 }}>Speed:</span>
                  <span style={{ fontWeight: 600, color: '#60a5fa' }}>{simulation.simulationState.speed.toFixed(1)}×</span>
                </div>
                <div className="nb-hud-row">
                  <span style={{ opacity: 0.7 }}>FPS:</span>
                  <span style={{ fontWeight: 600, color: '#60a5fa' }}>{simulation.simulationState.fps}</span>
                </div>
              </div>

              <div className={`nb-overlay-controls ${uiState.mobileViewing ? 'active' : ''}`}>
                <button className="nb-overlay-btn primary" onClick={handlePlayPause}>
                  {simulation.simulationState.isRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button className="nb-overlay-btn" onClick={handleReset}>
                  <RotateCcw size={20} />
                </button>
                <button className="nb-overlay-btn danger" onClick={exitMobileView}>
                  <X size={20} />
                </button>
              </div>
            </div>
          </section>

          <div className="nb-controls-section">
            <div className="nb-section-title">
              <Settings size={20} />
              Simulation Controls
            </div>

            <div className="nb-button-group">
              <PrimaryButton onClick={handlePlayPause}>
                {simulation.simulationState.isRunning ? <><Pause size={16} />Pause</> : <><Play size={16} />Play</>}
              </PrimaryButton>
              <IconButton onClick={handleReset} $variant="secondary">
                <RotateCcw size={16} />
              </IconButton>
              <IconButton onClick={toggleCameraFollow} $variant="secondary" $active={!!uiState.cameraFollowTarget}>
                <Target size={16} />
              </IconButton>
            </div>

            <SliderContainer>
              <div className="label">
                <span>Simulation Speed</span>
                <span className="value">{simulation.simulationState.speed.toFixed(1)}×</span>
              </div>
              <CustomSlider
                min={0.1}
                max={10}
                step={0.1}
                value={simulation.simulationState.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              />
            </SliderContainer>

            <div className="nb-slider-group">
              <SliderContainer>
                <div className="label">
                  <span>Time Step</span>
                  <span className="value">{(simulation.simulationState.timeStep / 86400).toFixed(1)} days</span>
                </div>
                <CustomSlider
                  min={3600}
                  max={86400 * 30}
                  step={3600}
                  value={simulation.simulationState.timeStep}
                  onChange={(e) => handleTimeStepChange(parseInt(e.target.value))}
                />
              </SliderContainer>
            </div>

            <div className="nb-visual-options">
              <h4 className="nb-visual-title">Visual Options</h4>
              <div className="nb-visual-grid">
                <IconButton onClick={() => updateVisualSetting('showTrails', !uiState.showTrails)} $active={uiState.showTrails} $size="sm">
                  <Activity size={14} />
                </IconButton>
                <IconButton onClick={() => updateVisualSetting('showVelocityVectors', !uiState.showVelocityVectors)} $active={uiState.showVelocityVectors} $size="sm">
                  <Zap size={14} />
                </IconButton>
                <IconButton onClick={() => updateVisualSetting('showLabels', !uiState.showLabels)} $active={uiState.showLabels} $size="sm">
                  <Eye size={14} />
                </IconButton>
                <IconButton onClick={() => updateVisualSetting('showGrid', !uiState.showGrid)} $active={uiState.showGrid} $size="sm">
                  <Grid size={14} />
                </IconButton>
              </div>
            </div>

            <div className="nb-body-management">
              <h4 className="nb-visual-title">Body Management</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <PrimaryButton onClick={handleAddBody} $variant="secondary">
                  <Plus size={16} />
                  Add Body
                </PrimaryButton>
                {uiState.selectedBodyId && (
                  <IconButton onClick={() => uiState.selectedBodyId && handleRemoveBody(uiState.selectedBodyId)} $variant="danger">
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </div>
            </div>
          </div>

          <div className="nb-controls-section">
            <div className="nb-section-title">
              <Star size={20} />
              Scenarios
            </div>

            <ScenarioGrid>
              {Object.entries(PREDEFINED_SCENARIOS).map(([id, scenario]) => {
                const isFeatured = scenario.category === 'educational' || scenario.difficulty === 'beginner';
                return (
                  <ScenarioCard
                    key={id}
                    $active={uiState.selectedScenario === id}
                    $featured={isFeatured}
                    onClick={() => handleScenarioSelect(id)}
                  >
                    <div className="header">
                      <h4>{scenario.name}</h4>
                      {isFeatured && <div className="badge">Featured</div>}
                    </div>
                    <div className="description">{scenario.description}</div>
                    <div className="stats">
                      <div className="stat">
                        <Users size={12} />
                        <span>{scenario.bodies.length} bodies</span>
                      </div>
                      <div className="stat">
                        <Clock size={12} />
                        <span>{Math.round(scenario.estimatedDuration / 60)}min</span>
                      </div>
                    </div>
                  </ScenarioCard>
                );
              })}
            </ScenarioGrid>
          </div>

          <div className="nb-controls-section">
            <div className="nb-section-title">
              <Activity size={20} />
              Performance & Statistics
            </div>

            <div className="nb-stats-grid">
              <MetricCard $variant="primary">
                <div className="label">
                  <Cpu className="icon" />
                  <span>Simulation FPS</span>
                </div>
                <div className="value">{simulation.simulationState.fps}</div>
              </MetricCard>

              <MetricCard $variant="success">
                <div className="label">
                  <Eye className="icon" />
                  <span>Render FPS</span>
                </div>
                <div className="value">{rendering.renderingState.renderFPS}</div>
              </MetricCard>

              <MetricCard $variant="primary">
                <div className="label">
                  <Users className="icon" />
                  <span>Bodies</span>
                </div>
                <div className="value">{simulation.simulationState.bodyCount}</div>
              </MetricCard>

              <MetricCard $variant="warning">
                <div className="label">
                  <Clock className="icon" />
                  <span>Physics Time</span>
                </div>
                <div className="value">{simulation.simulationState.physicsTime.toFixed(1)}ms</div>
              </MetricCard>
            </div>
          </div>
        </div>
      </div>

      {uiState.isLoading && (
        <LoadingOverlay>
          <div className="spinner" />
          <div className="message">
            Loading scenario...
            <br />
            Calculating initial conditions
          </div>
        </LoadingOverlay>
      )}
    </>
  );
};

export default NBodySandbox;