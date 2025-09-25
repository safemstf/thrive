// np.tsx - Complete OFDM simulation with OOP state management (revised)
// 'use client'
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense
} from 'react';
import {
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Train,
  Wifi,
  Loader2
} from 'lucide-react';

// Import components
import TabNavigationSystem from './np.tabs';

// Import styled components
import {
  SimulationContainer,
  TrainStationContainer,
  VisualizationGrid,
  VisualizationPanel,
  PanelHeader,
  SimCanvas,
  PlaybackControls,
  TabContent
} from './np.styles';

// Import types
import {
  Agent,
  Train as TrainType,
  Channel,
  SimulationState,
  OFDMParameters,
  TransmissionMetrics,
  VisualizationSettings,
  TabType,
  OFDMSymbol,
  ConnectionLink,
  WIRELESS_STANDARDS
} from './np.types';

// Lazy load heavy components
const TrainStationSignalProcessor = lazy(() => import('./np.signal-processor'));
const AdvancedVisualizations = lazy(() => import('./np.advanced-viz'));

// Loading component
const TabLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#94a3b8',
    gap: '16px'
  }}>
    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
    <span>Loading component...</span>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ==================== OOP STATE MANAGEMENT ====================
class SimulationStateManager {
  private subscribers = new Set<() => void>();

  public simulationState: SimulationState;
  public train: TrainType;
  public agents: Agent[];
  public channel: Channel;
  public connectionLinks: ConnectionLink[];
  public currentSymbol: OFDMSymbol | null = null;
  public ofdmParams: OFDMParameters;
  public metrics: TransmissionMetrics;
  public selectedAgent: Agent | null = null;
  public visualizationSettings: VisualizationSettings;
  public activeTab: TabType = 'simulation';

  private cache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 100; // ms

  constructor() {
    this.simulationState = {
      isRunning: false,
      currentTime: 0,
      timeStep: 0.1,
      speed: 1.0,
      totalSymbols: 0,
      processedSymbols: 0,
      mode: 'ofdm',
      visualizationMode: 'network',
      trainPosition: 0,
      trainState: 'approaching',
      activeCommunications: [],
      interferenceLevel: 0
    };

    this.train = {
      id: 'express_101',
      position: { x: -100, y: 250 },
      velocity: { x: 0, y: 0, magnitude: 0, direction: 0 },
      length: 120,
      width: 30,
      passengers: [],
      isAtStation: false,
      direction: 'approaching',
      metalShielding: 15,
      interiorSignalStrength: -75
    };

    this.agents = [];
    this.channel = {
      type: 'multipath',
      snr: 25,
      dopplerShift: 0,
      multipath: [
        { delay: 0.5, amplitude: 0.8, phase: 0, dopplerShift: 0 },
        { delay: 1.2, amplitude: 0.3, phase: Math.PI / 4, dopplerShift: 5 }
      ],
      fadingRate: 0.1,
      mobility: 0.2,
      interferenceLevel: 0.15,
      pathLoss: 15
    };

    this.connectionLinks = [];
    this.ofdmParams = WIRELESS_STANDARDS.wifi6.ofdmParams;
    this.metrics = {
      throughput: 0,
      spectralEfficiency: 4.5,
      symbolErrorRate: 0.001,
      bitErrorRate: 0.0005,
      frameErrorRate: 0.01,
      latency: 15,
      jitter: 2,
      packetLossRate: 0.5,
      signalToNoiseRatio: 25,
      signalToInterferenceRatio: 20,
      peakToAverageRatio: 8.2,
      channelCapacity: 100,
      linkMargin: 10
    };

    this.visualizationSettings = {
      showConnections: true,
      showInterference: true,
      showDopplerEffects: true,
      showSignalStrength: true,
      showMovementTrails: false,
      animationSpeed: 1,
      colorScheme: 'default',
      updateRate: 30
    };
  }

  findOptimalRoute(from: Agent, to: Agent): Agent[] {
    const cache = this.cache.get(`route_${from.id}_${to.id}`);
    if (cache && Date.now() - cache.timestamp < this.CACHE_TTL) {
      return cache.value;
    }

    const accessPoints = this.agents.filter(a => a.type === 'access_point');
    const route = [from, ...accessPoints.slice(0, 1), to];

    this.cache.set(`route_${from.id}_${to.id}`, {
      value: route,
      timestamp: Date.now()
    });

    return route;
  }

  mitigateInterference(): void {
    const highInterference = this.agents.filter(a => (a as any).interferenceLevel > 0.5);

    for (const agent of highInterference) {
      const originalChannel = (agent as any).connectedToRouter;
      const alternativeAPs = this.agents
        .filter(a => a.type === 'access_point' && a.id !== originalChannel)
        .sort((a, b) => (a as any).interferenceLevel - (b as any).interferenceLevel);

      if (alternativeAPs.length > 0) {
        (agent as any).connectedToRouter = alternativeAPs[0].id;
        (agent as any).interferenceLevel *= 0.7;
      }
    }
  }

  updateMetrics(): void {
    const activeAgents = this.agents.filter(a => a.isTransmitting);
    this.metrics.throughput = activeAgents.reduce((sum, a) => sum + (a.throughput ?? 0), 0);
    this.metrics.signalToNoiseRatio = this.channel.snr;
    this.metrics.packetLossRate = activeAgents.length > 0 ? activeAgents.reduce((sum, a) => sum + (a.packetLoss ?? 0), 0) / activeAgents.length : 0;
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(): void {
    this.subscribers.forEach(cb => cb());
  }
}

// ==================== SIMULATION ENGINE ====================
class SimulationEngine {
  public isRunning = false;
  private animationFrame: number | null = null;
  private lastUpdateTime = 0;
  private stationStopTime = 0;
  public stateManager: SimulationStateManager;

  constructor(private width: number, private height: number) {
    this.stateManager = new SimulationStateManager();
    this.initializeAgents();
  }

  private initializeAgents() {
    const agents: Agent[] = [];

    // 3 Access Points
    const apPositions = [
      { x: 300, y: 50 },
      { x: 700, y: 50 },
      { x: 1100, y: 50 }
    ];

    apPositions.forEach((pos, i) => {
      agents.push({
        id: `ap_${i + 1}`,
        type: 'access_point',
        position: pos,
        velocity: { x: 0, y: 0, magnitude: 0, direction: 0 },
        movementState: 'stationary',
        connectionState: 'idle',
        transmitPower: 23,
        signalStrength: -30,
        interferenceLevel: 0.1,
        snr: 30,
        isTransmitting: true,
        connectedToRouter: null,
        dopplerShift: 0,
        pathLoss: 0,
        throughput: 0,
        latency: 5,
        packetLoss: 0.1,
        handoffCount: 0,
        trail: [],
        color: '#10b981'
      } as Agent);
    });

    // Platform & Train passengers
    for (let i = 0; i < 7; i++) {
      const isWalking = Math.random() > 0.6;
      agents.push({
        id: `platform_${i + 1}`,
        type: 'platform_passenger',
        position: {
          x: 250 + (i * 100) + (Math.random() - 0.5) * 80,
          y: 350 + (Math.random() - 0.5) * 100
        },
        velocity: isWalking
          ? { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5), magnitude: 0, direction: 0 }
          : { x: 0, y: 0, magnitude: 0, direction: 0 },
        movementState: isWalking ? 'walking' : 'sitting',
        connectionState: Math.random() > 0.3 ? 'transmitting' : 'idle',
        transmitPower: 15,
        signalStrength: -50 - Math.random() * 20,
        interferenceLevel: 0.05 + Math.random() * 0.1,
        snr: 20 + Math.random() * 10,
        isTransmitting: Math.random() > 0.4,
        connectedToRouter: `ap_${Math.floor(Math.random() * 3) + 1}`,
        dopplerShift: (Math.random() - 0.5) * 10,
        pathLoss: 10 + Math.random() * 15,
        platformArea: Math.random() > 0.5 ? 'waiting' : 'walking',
        throughput: 10 + Math.random() * 40,
        latency: 10 + Math.random() * 20,
        packetLoss: Math.random() * 2,
        handoffCount: 0,
        trail: [],
        color: '#3b82f6'
      } as Agent);
    }

    for (let i = 0; i < 3; i++) {
      agents.push({
        id: `train_${i + 1}`,
        type: 'train_passenger',
        position: { x: -80 + i * 25, y: 240 + (Math.random() - 0.5) * 20 },
        velocity: { x: 0, y: 0, magnitude: 0, direction: 0 },
        movementState: 'moving_with_train',
        connectionState: 'idle',
        transmitPower: 12,
        signalStrength: -70,
        interferenceLevel: 0.3,
        snr: 15,
        isTransmitting: false,
        connectedToRouter: null,
        dopplerShift: 0,
        pathLoss: 25,
        trainId: 'express_101',
        throughput: 0,
        latency: 50,
        packetLoss: 5,
        handoffCount: 0,
        trail: [],
        color: '#f59e0b'
      } as Agent);
    }

    this.stateManager.agents = agents;
  }

  private updateSimulation(deltaTime: number) {
    // Update train
    const train = this.stateManager.train;
    const stationStart = 400;

    switch (train.direction) {
      case 'approaching':
        train.velocity.x = 15 * this.stateManager.simulationState.speed;
        train.position.x += train.velocity.x * deltaTime;

        if (train.position.x >= stationStart) {
          train.direction = 'stopped';
          train.velocity.x = 0;
          train.isAtStation = true;
          this.stationStopTime = this.stateManager.simulationState.currentTime;
        }
        break;

      case 'stopped':
        if ((this.stateManager.simulationState.currentTime - this.stationStopTime) > 5) {
          train.direction = 'departing';
          train.isAtStation = false;
        }
        break;

      case 'departing':
        train.velocity.x = 20 * this.stateManager.simulationState.speed;
        train.position.x += train.velocity.x * deltaTime;

        if (train.position.x >= this.width + 100) {
          train.position.x = -150;
          train.direction = 'approaching';
          train.velocity.x = 0;
        }
        break;
    }

    train.velocity.magnitude = Math.abs(train.velocity.x);

    // Update agents (train passengers follow the train)
    for (const agent of this.stateManager.agents) {
      if (agent.type === 'train_passenger') {
        const idNum = parseInt(agent.id.split('_')[1] || '1', 10);
        const offset = idNum * 25 - 25;
        agent.position.x = train.position.x + offset;
        agent.position.y = train.position.y + (Math.random() - 0.5) * 10;
        agent.velocity = { ...train.velocity };
      }
    }

    // Update connections
    this.updateConnectionLinks();

    // Periodic optimizations
    if (Math.floor(this.stateManager.simulationState.currentTime) % 1 === 0) {
      this.stateManager.mitigateInterference();
    }

    this.stateManager.updateMetrics();
    this.stateManager.notify();
  }

  private updateConnectionLinks() {
    const links: ConnectionLink[] = [];
    const { agents } = this.stateManager;

    for (const agent of agents) {
      if ((agent as any).connectedToRouter && agent.isTransmitting) {
        const router = agents.find(a => a.id === (agent as any).connectedToRouter);
        if (router) {
          links.push({
            id: `${agent.id}_${router.id}`,
            fromAgent: agent.id,
            toAgent: router.id,
            signalStrength: agent.signalStrength,
            snr: agent.snr,
            interferenceLevel: agent.interferenceLevel,
            pathLoss: agent.pathLoss,
            opacity: Math.max(0.2, Math.min(1, (agent.signalStrength + 90) / 40)),
            color: agent.snr > 20 ? '#10b981' : agent.snr > 15 ? '#f59e0b' : '#ef4444',
            thickness: Math.max(1, Math.min(3, (agent.throughput ?? 0) / 25)),
            animationSpeed: 1.0,
            instantaneousThroughput: agent.throughput ?? 0,
            latency: agent.latency ?? 0,
            jitter: 0,
            packetLoss: agent.packetLoss ?? 0,
            interferencePattern: [],
            dopplerEffect: {
              isActive: false,
              frequencyShift: 0,
              direction: 'stationary',
              intensity: 0,
              waveCompressionFactor: 1,
              colorShift: '#3b82f6'
            }
          } as ConnectionLink);
        }
      }
    }

    this.stateManager.connectionLinks = links;
  }

  private simulationLoop = (timestamp: number) => {
    if (!this.isRunning) return;

    const deltaTime = Math.min((timestamp - this.lastUpdateTime) / 1000, 0.1) * this.stateManager.simulationState.speed;
    this.lastUpdateTime = timestamp;

    if (deltaTime > 0) {
      this.stateManager.simulationState.currentTime += deltaTime;
      this.updateSimulation(deltaTime);
    }

    this.animationFrame = requestAnimationFrame(this.simulationLoop);
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.stateManager.simulationState.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.simulationLoop);
  }

  stop() {
    this.isRunning = false;
    this.stateManager.simulationState.isRunning = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  reset() {
    this.stop();
    this.stateManager = new SimulationStateManager();
    this.initializeAgents();
    this.stationStopTime = 0;
    this.stateManager.notify();
  }

  setSpeed(speed: number) {
    this.stateManager.simulationState.speed = Math.max(0.1, Math.min(5, speed));
  }

  destroy() {
    this.stop();
  }
}

// ==================== VIEWPORT COMPONENTS ====================
const SimulationViewport: React.FC<{
  engine: SimulationEngine;
  settings: VisualizationSettings;
  onAgentSelect: (agent: Agent | null) => void;
}> = React.memo(({ engine, settings, onAgentSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // perform a pixel-perfect draw using devicePixelRatio
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(container.clientWidth));
    const h = Math.max(1, Math.floor(container.clientHeight));

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Snapshot of state (avoid referencing reactive data in mid-draw)
    const { train, agents, connectionLinks } = engine.stateManager;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Platform (example)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(200, 100, Math.min(800, w - 400), 150);

    // Tracks
    ctx.fillStyle = 'rgba(156, 163, 175, 0.3)';
    ctx.fillRect(0, 250, w, 50);

    // Train
    if (train.position.x > -200 && train.position.x < w + 200) {
      ctx.fillStyle = '#374151';
      ctx.fillRect(train.position.x, train.position.y - 15, train.length, train.width);
    }

    // Connections
    if (settings.showConnections) {
      for (const link of connectionLinks) {
        const from = agents.find(a => a.id === link.fromAgent);
        const to = agents.find(a => a.id === link.toAgent);
        if (from && to) {
          ctx.strokeStyle = link.color + '88';
          ctx.lineWidth = Math.max(1, Math.min(4, link.thickness));
          ctx.beginPath();
          ctx.moveTo(from.position.x, from.position.y);
          ctx.lineTo(to.position.x, to.position.y);
          ctx.stroke();
        }
      }
    }

    // Agents
    for (const agent of agents) {
      ctx.fillStyle = (agent.color || '#3b82f6');
      ctx.beginPath();
      ctx.arc(agent.position.x, agent.position.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // optionally draw signal strength rings
      if (settings.showSignalStrength && agent.isTransmitting) {
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [engine, settings]);

  // subscribe to state changes and schedule redraw via rAF
  useEffect(() => {
    const scheduleDraw = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => draw());
    };

    // initial draw
    scheduleDraw();

    const unsubscribe = engine.stateManager.subscribe(() => {
      scheduleDraw();
    });

    return () => {
      unsubscribe();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [engine, draw]);

  // ResizeObserver to resize canvas when container changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const obs = new ResizeObserver(() => {
      // schedule immediate draw on resize
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => draw());
    });
    obs.observe(container);
    resizeObserverRef.current = obs;

    return () => {
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    };
  }, [draw]);

  // click handler for selecting agents
  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width / dpr;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height / dpr;

    const clicked = engine.stateManager.agents.find(a => {
      const dx = x - a.position.x;
      const dy = y - a.position.y;
      return Math.sqrt(dx * dx + dy * dy) < 18;
    });

    onAgentSelect(clicked || null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <SimCanvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
      />
    </div>
  );
});

// ==================== MAIN COMPONENT WITH EXPORT PROPS ====================
export interface NetworkProtocolSimulationProps {
  isRunning?: boolean;
  speed?: number;
  isDark?: boolean;
  width?: number;
  height?: number;
  autoStart?: boolean;
}

const TrainStationOFDMSimulation: React.FC<NetworkProtocolSimulationProps> = ({
  isRunning: externalIsRunning,
  speed: externalSpeed = 1,
  isDark = true,
  width = 1400,
  height = 600,
  autoStart = true
}) => {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('simulation');
  const [, forceUpdate] = useState({});

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new SimulationEngine(width, height);
      engineRef.current.stateManager.simulationState.speed = externalSpeed;

      if (autoStart || externalIsRunning) {
        engineRef.current.start();
      }
    }

    const unsub = engineRef.current.stateManager.subscribe(() => forceUpdate({}));

    return () => {
      unsub();
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
    // NOTE: we intentionally don't include externalIsRunning in dependencies to avoid restarting the engine here
    // width/height changes will recreate on unmount -> mount (you can tweak if desired)
  }, [width, height, autoStart]);

  // Sync external props
  useEffect(() => {
    if (!engineRef.current) return;
    if (externalIsRunning === undefined) return;
    if (externalIsRunning && !engineRef.current.isRunning) engineRef.current.start();
    if (!externalIsRunning && engineRef.current.isRunning) engineRef.current.stop();
  }, [externalIsRunning]);

  useEffect(() => {
    if (engineRef.current && externalSpeed !== undefined) engineRef.current.setSpeed(externalSpeed);
  }, [externalSpeed]);

  const engine = engineRef.current;
  if (!engine) return <TabLoader />;

  const handleSimulationControl = (action: 'play' | 'pause' | 'reset' | 'step') => {
    switch (action) {
      case 'play':
        engine.start();
        break;
      case 'pause':
        engine.stop();
        break;
      case 'reset':
        engine.reset();
        break;
    }
  };

  // Map train direction for SimulationState (correct mapping)
  const getTrainState = (): 'approaching' | 'boarding' | 'departing' => {
    const dir = engine.stateManager.train.direction;
    if (dir === 'stopped') return 'boarding';
    if (dir === 'departing') return 'departing';
    return 'approaching';
  };

  engine.stateManager.simulationState.trainState = getTrainState();
  engine.stateManager.activeTab = activeTab;

  // full-height layout so visualization fills available viewport space
  return (
    <SimulationContainer $isDark={isDark} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Train size={24} />
          Train Station OFDM WiFi
        </h1>

        <PlaybackControls>
          <button
            onClick={() => handleSimulationControl(engine.isRunning ? 'pause' : 'play')}
            className="control-button"
            aria-label={engine.isRunning ? 'Pause simulation' : 'Play simulation'}
            title={engine.isRunning ? 'Pause' : 'Play'}
          >
            {engine.isRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
          </button>

          <button
            onClick={() => handleSimulationControl('reset')}
            className="control-button"
            aria-label="Reset simulation"
            title="Reset"
          >
            <RefreshCw size={20} />
          </button>
        </PlaybackControls>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <TabNavigationSystem
          agents={engine.stateManager.agents}
          train={engine.stateManager.train}
          channel={engine.stateManager.channel}
          simulationState={engine.stateManager.simulationState}
          ofdmParams={engine.stateManager.ofdmParams}
          metrics={engine.stateManager.metrics}
          visualizationSettings={engine.stateManager.visualizationSettings}
          onTabChange={(t) => setActiveTab(t)}
          onParameterChange={(param, value) => {
            // you can implement param changes here (kept intentionally minimal)
            if (param === 'modulation') {
              // mutate ofdmParams safely and notify
              (engine.stateManager.ofdmParams as any).modulation = value;
              engine.stateManager.notify();
            }
          }}
          onVisualizationChange={(settings) => {
            Object.assign(engine.stateManager.visualizationSettings, settings);
            engine.stateManager.notify();
          }}
          onSimulationControl={(action) => handleSimulationControl(action)}
          selectedAgent={engine.stateManager.selectedAgent}
          onAgentSelect={(agent) => {
            engine.stateManager.selectedAgent = agent;
            engine.stateManager.notify();
          }}
        />
      </div>

      {/* main content area - flex:1 so visualization fills remaining viewport */}
      <div style={{ padding: '20px', flex: 1, minHeight: 0 }}>
        {activeTab === 'simulation' && (
          <TrainStationContainer style={{ height: '100%' }}>
            <VisualizationGrid style={{ height: '100%' }}>
              <VisualizationPanel $gridArea="main-sim" $priority="primary" style={{ display: 'flex', flexDirection: 'column' }}>
                <PanelHeader $variant="enhanced">
                  <div className="title">
                    <Wifi size={16} />
                    Train Station Network
                  </div>
                </PanelHeader>

                {/* make the panel content fill available space */}
                <div style={{ flex: 1, paddingTop: '56px', minHeight: 0 }}>
                  <SimulationViewport
                    engine={engine}
                    settings={engine.stateManager.visualizationSettings}
                    onAgentSelect={(agent) => {
                      engine.stateManager.selectedAgent = agent;
                      engine.stateManager.notify();
                    }}
                  />
                </div>
              </VisualizationPanel>
            </VisualizationGrid>
          </TrainStationContainer>
        )}

        {activeTab === 'signal-analysis' && (
          <Suspense fallback={<TabLoader />}>
            <TrainStationSignalProcessor
              ofdmParams={engine.stateManager.ofdmParams}
              channel={engine.stateManager.channel}
              agents={engine.stateManager.agents}
              train={engine.stateManager.train}
              inputData={{ bits: [], message: "Test" }}
              onProcessingComplete={() => { }}
              onProgressUpdate={() => { }}
              onChannelAnalysis={() => { }}
            />
          </Suspense>
        )}

        {activeTab === 'metrics' && (
          <Suspense fallback={<TabLoader />}>
            <AdvancedVisualizations
              currentSymbol={engine.stateManager.currentSymbol}
              channel={engine.stateManager.channel}
              agents={engine.stateManager.agents}
              isActive={true}
              width={width}
              height={Math.round(height * 0.8)}
            />
          </Suspense>
        )}
      </div>
    </SimulationContainer>
  );
};

export default TrainStationOFDMSimulation;
export { TrainStationOFDMSimulation as NetworkProtocolSimulation };
