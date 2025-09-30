'use client'
// src/components/cs/nb/nb.tsx
// N-Body Sandbox - Main React Component (Refined Mobile UI)

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Play, Pause, RotateCcw, Settings, Target, Zap, Star, Users, Activity, 
  Clock, Cpu, Eye, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, 
  Grid, Maximize2, Menu, X
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
  ProgressBar, NBodyGlobalStyles, MobileMenuButton, MobileStatusBar,
  MobileDrawer, MobileDrawerOverlay, MobileDrawerContent, MobileDrawerHeader,
  MobileDrawerSection, MobileQuickActions, MobileQuickAction
} from './nb.styles';

// ========================================
// INTERFACES & TYPES
// ========================================

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
  isFullscreen: boolean;
  fullscreenControlsVisible: boolean;
  hudMode: boolean;
  mobileMenuOpen: boolean;
}

// ========================================
// MAIN COMPONENT
// ========================================

const NBodySandbox: React.FC<NBodySandboxProps> = ({
  isRunning: externalRunning = false,
  speed: externalSpeed = 1,
  isDark = true
}) => {
  
  // ===== REFS =====
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // ===== STATE =====
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
    isFullscreen: false,
    fullscreenControlsVisible: true,
    hudMode: false,
    mobileMenuOpen: false
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

  // ===== SIMULATION & RENDERING =====
  const simulation = useNBodySimulation({
    config: physicsConfig,
    initialScenario: PREDEFINED_SCENARIOS[uiState.selectedScenario || 'solar-system'],
    onBodyUpdate: useCallback((updates: PhysicsUpdate[]) => {}, []),
    onPerformanceUpdate: useCallback((metrics: PerformanceMetrics) => {}, [])
  });

  const rendering = useNBodyRendering({
    containerRef: canvasContainerRef,
    bodies: simulation.getBodies(),
    selectedBodies: simulation.getSelectedBodies(),
    visualConfig,
    cameraConfig,
    onCameraUpdate: useCallback((position: Vector3Data, target: Vector3Data) => {}, []),
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

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    if (externalRunning && !simulation.simulationState.isRunning) {
      simulation.start();
    } else if (!externalRunning && simulation.simulationState.isRunning) {
      simulation.pause();
    }
  }, [externalRunning, simulation]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isFS = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      setUIState(prev => ({ ...prev, isFullscreen: isFS }));
    };

    const handleMouseMove = () => {
      if (uiState.isFullscreen) {
        setUIState(prev => ({ ...prev, fullscreenControlsVisible: true }));
        if (controlsTimeoutRef.current !== null) {
          window.clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = window.setTimeout(() => {
          setUIState(prev => ({ ...prev, fullscreenControlsVisible: false }));
        }, 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current !== null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [uiState.isFullscreen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handlePlayPause = useCallback(() => {
    if (simulation.simulationState.isRunning) {
      simulation.pause();
    } else {
      simulation.start();
    }
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

  const handleFullscreenToggle = useCallback(async () => {
    const el = canvasContainerRef.current;
    if (!el) return;

    try {
      const doc = window.document as any;
      if (!doc.fullscreenElement) {
        if ((el as any).requestFullscreen) await (el as any).requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
        else if ((el as any).mozRequestFullScreen) await (el as any).mozRequestFullScreen();
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
      }
    } catch (err) {
      console.warn('Fullscreen API failed', err);
    }
  }, []);

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

  const toggleMobileMenu = useCallback(() => {
    setUIState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  // ========================================
  // DESKTOP UI RENDER FUNCTIONS
  // ========================================

  const renderScenarioPanel = () => (
    <FloatingPanel $position="top-left" $width="320px">
      <PanelHeader>
        <div className="title">
          <Star className="icon" />
          <h3>Scenarios</h3>
        </div>
        <div className="actions">
          <IconButton onClick={() => togglePanel('scenarios')} $active={uiState.activePanel === 'scenarios'}>
            {uiState.activePanel === 'scenarios' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </div>
      </PanelHeader>

      {uiState.activePanel === 'scenarios' && (
        <PanelContent>
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
        </PanelContent>
      )}
    </FloatingPanel>
  );

  const renderControlsPanel = () => (
    <FloatingPanel $position="top-right" $width="300px" $hidden={uiState.isFullscreen && !uiState.fullscreenControlsVisible}>
      <PanelHeader>
        <div className="title">
          <Settings className="icon" />
          <h3>Simulation Controls</h3>
        </div>
      </PanelHeader>

      <PanelContent>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <PrimaryButton onClick={handlePlayPause}>
            {simulation.simulationState.isRunning ? (
              <><Pause size={16} />Pause</>
            ) : (
              <><Play size={16} />Play</>
            )}
          </PrimaryButton>
          <IconButton onClick={handleReset} $variant="secondary">
            <RotateCcw size={16} />
          </IconButton>
          <IconButton onClick={handleFullscreenToggle} $variant="secondary" title="Toggle fullscreen">
            <Maximize2 size={16} />
          </IconButton>
          <IconButton
            onClick={toggleCameraFollow}
            $variant="secondary"
            $active={!!uiState.cameraFollowTarget}
            title="Follow selected body"
          >
            <Target size={16} />
          </IconButton>
        </div>

        <SliderContainer>
          <div className="label">
            <span>Simulation Speed</span>
            <span className="value">{simulation.simulationState.speed.toFixed(1)}x</span>
          </div>
          <CustomSlider
            min={0.1}
            max={10}
            step={0.1}
            value={simulation.simulationState.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
          />
        </SliderContainer>

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

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Visual Options</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <IconButton
              onClick={() => updateVisualSetting('showTrails', !uiState.showTrails)}
              $active={uiState.showTrails}
              $size="sm"
              title="Orbital Trails"
            >
              <Activity size={14} />
            </IconButton>
            <IconButton
              onClick={() => updateVisualSetting('showVelocityVectors', !uiState.showVelocityVectors)}
              $active={uiState.showVelocityVectors}
              $size="sm"
              title="Velocity Vectors"
            >
              <Zap size={14} />
            </IconButton>
            <IconButton
              onClick={() => updateVisualSetting('showLabels', !uiState.showLabels)}
              $active={uiState.showLabels}
              $size="sm"
              title="Body Labels"
            >
              <Eye size={14} />
            </IconButton>
            <IconButton
              onClick={() => updateVisualSetting('showGrid', !uiState.showGrid)}
              $active={uiState.showGrid}
              $size="sm"
              title="Grid"
            >
              <Grid size={14} />
            </IconButton>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#94a3b8' }}>Body Management</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <PrimaryButton onClick={handleAddBody} $variant="secondary">
              <Plus size={16} />
              Add Body
            </PrimaryButton>
            {uiState.selectedBodyId && (
              <IconButton
                onClick={() => uiState.selectedBodyId && handleRemoveBody(uiState.selectedBodyId)}
                $variant="danger"
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </div>
        </div>
      </PanelContent>
    </FloatingPanel>
  );

  const renderMetricsPanel = () => (
    <FloatingPanel $position="bottom-right" $width="280px">
      <PanelHeader $variant="secondary">
        <div className="title">
          <Activity className="icon" />
          <h3>Performance</h3>
        </div>
        <div className="actions">
          <IconButton
            onClick={() => setUIState(prev => ({ ...prev, showMetrics: !prev.showMetrics }))}
            $active={uiState.showMetrics}
          >
            {uiState.showMetrics ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </IconButton>
        </div>
      </PanelHeader>

      {uiState.showMetrics && (
        <PanelContent>
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

          <MetricCard $variant="primary">
            <div className="label">
              <Activity className="icon" />
              <span>Total Steps</span>
            </div>
            <div className="value">{simulation.simulationState.totalSteps.toLocaleString()}</div>
          </MetricCard>

          {typeof simulation.simulationState.energyDrift === 'number' && 
           isFinite(simulation.simulationState.energyDrift) && 
           simulation.simulationState.energyDrift > 0.01 && (
            <MetricCard $variant="danger">
              <div className="label">
                <AlertTriangle className="icon" />
                <span>Energy Drift</span>
              </div>
              <div className="value">{(simulation.simulationState.energyDrift * 100).toFixed(2)}%</div>
            </MetricCard>
          )}
        </PanelContent>
      )}
    </FloatingPanel>
  );

  const renderStatusPanel = () => {
    const timeInDays = simulation.simulationState.currentTime / 86400;
    const timeInYears = timeInDays / 365.25;

    const hidden = uiState.isFullscreen && !uiState.fullscreenControlsVisible && !uiState.hudMode;

    return (
      <FloatingPanel
        $position="bottom-center"
        $width="600px"
        $minimal={uiState.hudMode}
        $hidden={hidden}
      >
        <PanelContent $padding={false}>
          <div style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px'
          }}>
            <StatusIndicator
              $status={
                simulation.simulationState.isRunning
                  ? 'running'
                  : simulation.simulationState.isPaused
                    ? 'paused'
                    : 'stopped'
              }
            >
              <div className="dot" />
              <span>
                {simulation.simulationState.isRunning
                  ? 'Simulating'
                  : simulation.simulationState.isPaused
                    ? 'Paused'
                    : 'Stopped'}
              </span>
            </StatusIndicator>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.8rem',
              color: '#94a3b8',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              <div>
                {timeInYears >= 1 ? `${timeInYears.toFixed(2)} years` : `${timeInDays.toFixed(1)} days`}
              </div>
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: '#60a5fa',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {simulation.simulationState.speed.toFixed(1)}×
            </div>

            {uiState.selectedScenario && (
              <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                {PREDEFINED_SCENARIOS[uiState.selectedScenario]?.name}
              </div>
            )}
          </div>

          {uiState.selectedScenario && PREDEFINED_SCENARIOS[uiState.selectedScenario] && (
            <ProgressBar
              $progress={simulation.simulationState.scenarioProgress * 100}
              $color="#60a5fa"
            />
          )}
        </PanelContent>
      </FloatingPanel>
    );
  };

  // ========================================
  // MOBILE UI RENDER FUNCTIONS
  // ========================================

  const renderMobileStatusBar = () => {
    const timeInDays = simulation.simulationState.currentTime / 86400;
    const timeInYears = timeInDays / 365.25;
    
    return (
      <MobileStatusBar>
        <div className="status-item">
          <Activity className="icon" size={14} />
          <span className="value">
            {simulation.simulationState.isRunning ? 'Running' : 'Paused'}
          </span>
        </div>
        
        <div className="divider" />
        
        <div className="status-item">
          <Clock className="icon" size={14} />
          <span className="value">
            {timeInYears >= 1 ? `${timeInYears.toFixed(1)}y` : `${timeInDays.toFixed(0)}d`}
          </span>
        </div>
        
        <div className="divider" />
        
        <div className="status-item">
          <Zap className="icon" size={14} />
          <span className="value">{simulation.simulationState.speed.toFixed(1)}×</span>
        </div>
      </MobileStatusBar>
    );
  };

  const renderMobileMenu = () => (
    <>
      <MobileMenuButton 
        $isOpen={uiState.mobileMenuOpen}
        onClick={toggleMobileMenu}
      >
        {uiState.mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </MobileMenuButton>

      <MobileDrawerOverlay 
        $isOpen={uiState.mobileMenuOpen} 
      />
      
      <MobileDrawer $isOpen={uiState.mobileMenuOpen}>
        <MobileDrawerHeader>
          <div className="header-content">
            <div className="icon">
              <Settings size={20} />
            </div>
            <h2>Simulation Controls</h2>
          </div>
        </MobileDrawerHeader>

        <MobileDrawerContent>
          {/* Quick Actions */}
          <MobileDrawerSection style={{ '--section-index': 0 } as React.CSSProperties}>
            <div className="section-title">
              <Zap className="icon" />
              <span>Quick Actions</span>
            </div>
            <div className="section-content">
              <MobileQuickActions>
                <MobileQuickAction 
                  onClick={handlePlayPause}
                  $active={simulation.simulationState.isRunning}
                  $variant="primary"
                >
                  <div className="icon">
                    {simulation.simulationState.isRunning ? <Pause size={24} /> : <Play size={24} />}
                  </div>
                  <div className="label">
                    {simulation.simulationState.isRunning ? 'Pause' : 'Play'}
                  </div>
                </MobileQuickAction>

                <MobileQuickAction onClick={handleReset} $variant="warning">
                  <div className="icon"><RotateCcw size={24} /></div>
                  <div className="label">Reset</div>
                </MobileQuickAction>

                <MobileQuickAction onClick={handleFullscreenToggle}>
                  <div className="icon"><Maximize2 size={24} /></div>
                  <div className="label">Fullscreen</div>
                </MobileQuickAction>

                <MobileQuickAction 
                  onClick={toggleCameraFollow}
                  $active={!!uiState.cameraFollowTarget}
                >
                  <div className="icon"><Target size={24} /></div>
                  <div className="label">Follow</div>
                </MobileQuickAction>
              </MobileQuickActions>
            </div>
          </MobileDrawerSection>

          {/* Simulation Controls */}
          <MobileDrawerSection style={{ '--section-index': 1 } as React.CSSProperties}>
            <div className="section-title">
              <Settings className="icon" />
              <span>Simulation</span>
            </div>
            <div className="section-content">
              <SliderContainer>
                <div className="label">
                  <span>Speed</span>
                  <span className="value">{simulation.simulationState.speed.toFixed(1)}x</span>
                </div>
                <CustomSlider
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={simulation.simulationState.speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                />
              </SliderContainer>

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
          </MobileDrawerSection>

          {/* Visual Options */}
          <MobileDrawerSection style={{ '--section-index': 2 } as React.CSSProperties}>
            <div className="section-title">
              <Eye className="icon" />
              <span>Visual Options</span>
            </div>
            <div className="section-content">
              <MobileQuickActions>
                <MobileQuickAction
                  onClick={() => updateVisualSetting('showTrails', !uiState.showTrails)}
                  $active={uiState.showTrails}
                >
                  <div className="icon"><Activity size={24} /></div>
                  <div className="label">Trails</div>
                </MobileQuickAction>

                <MobileQuickAction
                  onClick={() => updateVisualSetting('showVelocityVectors', !uiState.showVelocityVectors)}
                  $active={uiState.showVelocityVectors}
                >
                  <div className="icon"><Zap size={24} /></div>
                  <div className="label">Vectors</div>
                </MobileQuickAction>

                <MobileQuickAction
                  onClick={() => updateVisualSetting('showLabels', !uiState.showLabels)}
                  $active={uiState.showLabels}
                >
                  <div className="icon"><Eye size={24} /></div>
                  <div className="label">Labels</div>
                </MobileQuickAction>

                <MobileQuickAction
                  onClick={() => updateVisualSetting('showGrid', !uiState.showGrid)}
                  $active={uiState.showGrid}
                >
                  <div className="icon"><Grid size={24} /></div>
                  <div className="label">Grid</div>
                </MobileQuickAction>
              </MobileQuickActions>
            </div>
          </MobileDrawerSection>

          {/* Scenarios */}
          <MobileDrawerSection style={{ '--section-index': 3 } as React.CSSProperties}>
            <div className="section-title">
              <Star className="icon" />
              <span>Scenarios</span>
            </div>
            <div className="section-content">
              <ScenarioGrid>
                {Object.entries(PREDEFINED_SCENARIOS).map(([id, scenario]) => (
                  <ScenarioCard
                    key={id}
                    $active={uiState.selectedScenario === id}
                    onClick={() => {
                      handleScenarioSelect(id);
                    }}
                  >
                    <div className="header">
                      <h4>{scenario.name}</h4>
                    </div>
                    <div className="description">{scenario.description}</div>
                    <div className="stats">
                      <div className="stat">
                        <Users size={12} />
                        <span>{scenario.bodies.length}</span>
                      </div>
                    </div>
                  </ScenarioCard>
                ))}
              </ScenarioGrid>
            </div>
          </MobileDrawerSection>

          {/* Performance Metrics */}
          <MobileDrawerSection style={{ '--section-index': 4 } as React.CSSProperties}>
            <div className="section-title">
              <Activity className="icon" />
              <span>Performance</span>
            </div>
            <div className="section-content">
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
          </MobileDrawerSection>
        </MobileDrawerContent>
      </MobileDrawer>
    </>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <>
      <NBodyGlobalStyles />
      <SimulationContainer className="n-body-simulation">
        <CanvasContainer ref={canvasContainerRef} />

        {/* Desktop UI - Floating Panels */}
        {renderScenarioPanel()}
        {renderControlsPanel()}
        {renderMetricsPanel()}
        {renderStatusPanel()}

        {/* Mobile UI - Status Bar + Drawer Menu */}
        {renderMobileStatusBar()}
        {renderMobileMenu()}

        {/* Loading Overlay */}
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
      </SimulationContainer>
    </>
  );
};

export default NBodySandbox;