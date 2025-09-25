// np.types.ts - Updated Types for Optimized OFDM Network Protocol Simulation
// ==================== CORE SIGNAL PROCESSING TYPES ====================
interface ComplexNumber {
    real: number;
    imag: number;
}

interface Subcarrier {
    id: number;
    frequency: number;
    amplitude: number;
    phase: number;
    data: number;
    snr: number;
    isActive: boolean;
    errorRate: number;
    interferenceLevel?: number;
}

interface OFDMSymbol {
    id: number;
    timestamp: number;
    subcarriers: Subcarrier[];
    cyclicPrefix: number[];
    timeDomainSamples: ComplexNumber[];
    frequencyDomainSamples: ComplexNumber[];
    channelResponse: ComplexNumber[];
    receivedSamples: ComplexNumber[];
    decodedBits: number[];
    symbolErrorRate: number;
    papr: number; // Peak-to-Average Power Ratio
}

interface Channel {
    type: 'awgn' | 'rayleigh' | 'rician' | 'multipath';
    snr: number;
    dopplerShift: number;
    multipath: MultipathComponent[];
    fadingRate: number;
    mobility: number;
    interferenceLevel: number;
    pathLoss: number;
}

interface MultipathComponent {
    delay: number; // microseconds
    amplitude: number;
    phase: number;
    dopplerShift: number;
}

// ==================== TRAIN STATION SCENARIO TYPES ====================
type AgentType = 'platform_passenger' | 'train_passenger' | 'access_point' | 'router';
type MovementState = 'sitting' | 'walking' | 'running' | 'moving_with_train' | 'stationary';
type ConnectionState = 'idle' | 'connecting' | 'transmitting' | 'receiving' | 'error' | 'handoff';

interface Position2D {
    x: number;
    y: number;
}

interface Velocity2D {
    x: number; // m/s
    y: number; // m/s
    magnitude: number; // calculated
    direction: number; // radians
}

interface Agent {
    id: string;
    type: AgentType;
    position: Position2D;
    velocity: Velocity2D;
    movementState: MovementState;
    connectionState: ConnectionState;

    // RF Characteristics
    transmitPower: number; // dBm
    signalStrength: number; // RSSI in dBm
    interferenceLevel: number; // 0-1
    snr: number; // dB

    // Mobility
    isTransmitting: boolean;
    connectedToRouter: string | null;
    dopplerShift: number; // Hz
    pathLoss: number; // dB

    // Train-specific
    trainId?: string; // Only for train passengers
    platformArea?: 'waiting' | 'walking' | 'boarding'; // Only for platform passengers

    // Network metrics
    throughput: number; // Mbps
    latency: number; // ms
    packetLoss: number; // percentage
    handoffCount: number;

    // Visual properties
    color?: string;
    size?: number;
    trail?: Position2D[]; // Movement history for visualization
}

interface Train {
    id: string;
    position: Position2D;
    velocity: Velocity2D;
    length: number; // meters
    width: number; // meters
    passengers: Agent[];
    isAtStation: boolean;
    direction: 'approaching' | 'arriving' | 'departing' | 'stopped';
    nextStopTime?: number; // seconds

    // Communication effects
    metalShielding: number; // dB attenuation
    interiorSignalStrength: number; // dBm
}

interface TrainStation {
    id: string;
    layout: {
        platform: {
            width: number;
            length: number;
            position: Position2D;
        };
        tracks: {
            position: Position2D;
            width: number;
            length: number;
        }[];
        waitingAreas: {
            position: Position2D;
            radius: number;
            capacity: number;
        }[];
        routers: AccessPoint[];
    };

    // Environmental factors
    wallAttenuation: number; // dB
    crowdingFactor: number; // 0-1 (affects interference)
    ambientNoise: number; // dBm
}

interface AccessPoint {
    id: string;
    position: Position2D;
    type: 'indoor' | 'outdoor' | 'train_onboard';

    // RF Properties
    transmitPower: number; // dBm
    coverageRadius: number; // meters
    frequency: number; // MHz
    bandwidth: number; // MHz
    antennaGain: number; // dBi

    // Network properties
    maxConnections: number;
    connectedAgents: string[];
    totalThroughput: number; // Mbps
    load: number; // 0-1

    // OFDM specific
    ofdmParams: OFDMParameters;
    supportedModulations: ModulationScheme[];

    // Beamforming/MIMO
    antennaCount: number;
    beamformingEnabled: boolean;
    mimoMode: '2x2' | '4x4' | '8x8' | 'massive';
}

// ==================== CONNECTION VISUALIZATION TYPES ====================
interface ConnectionLink {
    id: string;
    fromAgent: string;
    toAgent: string;

    // Signal properties
    signalStrength: number; // dBm
    snr: number; // dB
    interferenceLevel: number; // 0-1
    pathLoss: number; // dB

    // Visual properties
    opacity: number; // 0-1 based on signal strength
    color: string; // Based on connection quality
    thickness: number; // Based on throughput
    animationSpeed: number; // For wave animation

    // Real-time metrics
    instantaneousThroughput: number; // Mbps
    latency: number; // ms
    jitter: number; // ms
    packetLoss: number; // percentage

    // Interference visualization
    interferencePattern: InterferenceWave[];
    dopplerEffect: DopplerVisualization;
}

interface InterferenceWave {
    frequency: number; // Hz
    amplitude: number; // 0-1
    phase: number; // radians
    source: string; // Agent ID causing interference
    type: 'multipath' | 'doppler' | 'noise' | 'collision';
}

interface DopplerVisualization {
    isActive: boolean;
    frequencyShift: number; // Hz
    direction: 'approaching' | 'receding' | 'stationary';
    intensity: number; // 0-1
    waveCompressionFactor: number; // Visual stretching/compression
    colorShift: string; // Blue/red shift visualization
}

// ==================== MODULATION AND CODING TYPES ====================
interface ModulationScheme {
    type: 'bpsk' | 'qpsk' | '16qam' | '64qam' | '256qam';
    bitsPerSymbol: number;
    constellationPoints: ComplexNumber[];
    minimumSnr: number;
    spectralEfficiency: number;
    errorRateAtSnr: (snr: number) => number;
}

interface CodingScheme {
    type: 'none' | 'hamming' | 'bch' | 'ldpc' | 'turbo' | 'polar';
    codeRate: number;
    redundancy: number;
    correctionCapability: number;
    encodingComplexity: 'low' | 'medium' | 'high';
    decodingComplexity: 'low' | 'medium' | 'high';
}

interface OFDMParameters {
    numSubcarriers: number;
    subcarrierSpacing: number; // Hz
    cyclicPrefixLength: number;
    fftSize: number;
    symbolDuration: number; // microseconds
    guardInterval: number; // microseconds
    modulation: ModulationScheme;
    coding: CodingScheme;
    pilotDensity: number; // pilots per subcarrier
    windowingFunction: 'none' | 'hamming' | 'hanning' | 'blackman';
}

// ==================== PERFORMANCE METRICS ====================
interface TransmissionMetrics {
    throughput: number; // Mbps
    spectralEfficiency: number; // bits/s/Hz
    symbolErrorRate: number;
    bitErrorRate: number;
    frameErrorRate: number;
    latency: number; // ms
    jitter: number; // ms
    packetLossRate: number; // percentage
    signalToNoiseRatio: number; // dB
    signalToInterferenceRatio: number; // dB
    peakToAverageRatio: number; // dB
    channelCapacity: number; // Mbps (Shannon limit)
    linkMargin: number; // dB
}

interface NetworkPerformance {
    totalThroughput: number; // Mbps
    averageLatency: number; // ms
    handoffSuccessRate: number; // percentage
    coverageEfficiency: number; // percentage
    spectralReuse: number; // times
    energyEfficiency: number; // bits/joule
    userFairness: number; // Jain's fairness index
    networkLoad: number; // 0-1
}

// ==================== SIMULATION ENGINE TYPES ====================
interface SimulationEngineState {
    currentTime: number;
    timeStep: number;
    speed: number;
    train: Train;
    agents: Agent[];
    connectionLinks: ConnectionLink[];
    channel: Channel;
}

interface SimulationEngine {
    state: SimulationEngineState;
    isRunning: boolean;

    // Core methods
    start(): void;
    stop(): void;
    reset(): void;
    setSpeed(speed: number): void;

    // Subscription pattern
    subscribe(callback: () => void): () => void;
    destroy(): void;
}

// ==================== CONTEXT TYPES FOR REACT ====================
interface SimulationContextType {
    // Core simulation state
    simulationState: SimulationState;
    train: Train;
    agents: Agent[];
    channel: Channel;
    connectionLinks: ConnectionLink[];

    // OFDM processing
    currentSymbol: OFDMSymbol | null;
    ofdmParams: OFDMParameters;
    metrics: TransmissionMetrics;

    // UI state
    selectedAgent: Agent | null;
    visualizationSettings: VisualizationSettings;

    // Actions (memoized to prevent re-renders)
    actions: {
        setSelectedAgent: (agent: Agent | null) => void;
        updateVisualizationSettings: (settings: Partial<VisualizationSettings>) => void;
        updateOfdmParams: (params: Partial<OFDMParameters>) => void;
    };
}

// ==================== SIMULATION STATE ====================
interface SimulationState {
    isRunning: boolean;
    currentTime: number; // seconds
    timeStep: number; // seconds
    speed: number; // simulation speed multiplier
    totalSymbols: number;
    processedSymbols: number;
    mode: 'ofdm' | 'ofts' | 'comparison';
    visualizationMode: 'network' | 'signal' | 'constellation' | 'spectrum' | 'performance';

    // Train station specific
    trainPosition: number; // 0-1 (station approach to departure)
    trainState: 'approaching' | 'boarding' | 'departing';
    activeCommunications: string[]; // Connection IDs
    interferenceLevel: number; // Overall station interference
}

interface SignalTransmission {
    id: string;
    message: string;
    bits: number[];
    symbols: OFDMSymbol[];
    transmissionStage: 'encoding' | 'modulation' | 'ifft' | 'channel' | 'fft' | 'demodulation' | 'decoding' | 'complete';
    currentStage: number;
    progress: number; // 0-1

    // Source and destination
    sourceAgent: string;
    destinationAgent: string;
    routerAgent: string;

    // Real-time processing
    processingLatency: number; // ms
    channelLatency: number; // ms
    errors: TransmissionError[];
}

interface TransmissionError {
    type: 'symbol_error' | 'frame_error' | 'timeout' | 'handoff_failure' | 'interference';
    timestamp: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedSubcarriers?: number[];
    corrected: boolean;
    cause: string;
}

// ==================== UI AND VISUALIZATION TYPES ====================
type TabType = 'simulation' | 'signal-analysis' | 'metrics' | 'configuration' | 'parameters';

interface VisualizationSettings {
    showConnections: boolean;
    showInterference: boolean;
    showDopplerEffects: boolean;
    showSignalStrength: boolean;
    showMovementTrails: boolean;
    animationSpeed: number; // 0.1-2.0
    colorScheme: 'default' | 'accessibility' | 'thermal';
    updateRate: number; // Hz
}

interface CameraSettings {
    position: Position2D;
    zoom: number; // 0.1-5.0
    followTrain: boolean;
    autoFit: boolean;
}

// ==================== RENDERING AND ANIMATION TYPES ====================
interface RenderingState {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    animationFrameId: number | null;
    lastFrameTime: number;
    isRendering: boolean;
}

interface AnimationController {
    start(): void;
    stop(): void;
    setFrameRate(fps: number): void;
    subscribe(callback: (timestamp: number) => void): () => void;
}

// ==================== TAB SYSTEM TYPES ====================
interface TabConfiguration {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ size: number }>;
    component: React.ComponentType<any>;
    lazyLoad: boolean;
    priority: 'high' | 'medium' | 'low';
}

interface TabSystemState {
    activeTab: TabType;
    loadedTabs: Set<TabType>;
    tabHistory: TabType[];
}

// ==================== PERFORMANCE MONITORING TYPES ====================
interface PerformanceMetrics {
    renderTime: number; // ms
    frameRate: number; // fps
    memoryUsage: number; // MB
    agentCount: number;
    connectionCount: number;
    processingLoad: number; // 0-1
}

interface OptimizationSettings {
    maxAgents: number;
    maxConnections: number;
    renderDistance: number; // meters
    lodEnabled: boolean; // Level of detail
    cullingEnabled: boolean;
    adaptiveQuality: boolean;
}

// ==================== WORKER TYPES ====================
interface WorkerMessage {
    type: string;
    data: any;
    id: number;
}

interface WorkerResponse {
    type: string;
    result: any;
    id: number;
    error?: string;
}

interface SignalProcessingWorkerData {
    inputData: { bits: number[]; message: string };
    params: OFDMParameters;
    channel: Channel;
    agents: Agent[];
    transmissionId: string;
}

// ==================== SUBSCRIPTION SYSTEM TYPES ====================
type SubscriptionCallback = () => void;
type UnsubscribeFunction = () => void;

interface EventSubscriptionManager {
    subscribe(event: string, callback: SubscriptionCallback): UnsubscribeFunction;
    unsubscribe(event: string, callback: SubscriptionCallback): void;
    emit(event: string, data?: any): void;
    clear(): void;
}

// ==================== WIRELESS STANDARDS ====================
interface WirelessStandard {
    name: string;
    frequency: { min: number; max: number }; // MHz
    bandwidth: number[]; // MHz options
    maxThroughput: number; // Mbps
    typicalSNR: number; // dB
    range: { indoor: number; outdoor: number }; // meters
    ofdmParams: OFDMParameters;
    features: string[];
    release: string;
    backwardCompatible: string[];
}

// ==================== CONSTANTS AND LOOKUPS ====================
const MODULATION_TYPES = {
    'bpsk': { bitsPerSymbol: 1, spectralEfficiency: 1, minimumSnr: 10 },
    'qpsk': { bitsPerSymbol: 2, spectralEfficiency: 2, minimumSnr: 15 },
    '16qam': { bitsPerSymbol: 4, spectralEfficiency: 4, minimumSnr: 20 },
    '64qam': { bitsPerSymbol: 6, spectralEfficiency: 6, minimumSnr: 25 },
    '256qam': { bitsPerSymbol: 8, spectralEfficiency: 8, minimumSnr: 35 }
} as const;

const WIRELESS_STANDARDS: Record<string, WirelessStandard> = {
    'wifi6': {
        name: 'Wi-Fi 6 (802.11ax)',
        frequency: { min: 2400, max: 5875 },
        bandwidth: [20, 40, 80, 160],
        maxThroughput: 9600,
        typicalSNR: 25,
        range: { indoor: 70, outdoor: 250 },
        ofdmParams: {
            numSubcarriers: 256,
            subcarrierSpacing: 312.5e3,
            cyclicPrefixLength: 32,
            fftSize: 256,
            symbolDuration: 12.8,
            guardInterval: 3.2,
            modulation: {
                type: '256qam',
                bitsPerSymbol: 8,
                constellationPoints: [],
                minimumSnr: 35,
                spectralEfficiency: 8,
                errorRateAtSnr: (snr: number) => Math.pow(10, -0.3 * snr + 1)
            },
            coding: {
                type: 'ldpc',
                codeRate: 0.833,
                redundancy: 0.167,
                correctionCapability: 12,
                encodingComplexity: 'high',
                decodingComplexity: 'high'
            },
            pilotDensity: 0.1,
            windowingFunction: 'hamming'
        },
        features: ['MU-MIMO', 'OFDMA', 'BSS Coloring', 'TWT'],
        release: '2019',
        backwardCompatible: ['802.11ac', '802.11n', '802.11g', '802.11a']
    },
    'lte': {
        name: 'LTE Advanced',
        frequency: { min: 700, max: 2600 },
        bandwidth: [1.4, 3, 5, 10, 15, 20],
        maxThroughput: 1000,
        typicalSNR: 20,
        range: { indoor: 1000, outdoor: 10000 },
        ofdmParams: {
            numSubcarriers: 1200,
            subcarrierSpacing: 15e3,
            cyclicPrefixLength: 144,
            fftSize: 2048,
            symbolDuration: 71.4,
            guardInterval: 4.76,
            modulation: {
                type: '64qam',
                bitsPerSymbol: 6,
                constellationPoints: [],
                minimumSnr: 25,
                spectralEfficiency: 6,
                errorRateAtSnr: (snr: number) => Math.pow(10, -0.25 * snr + 0.5)
            },
            coding: {
                type: 'turbo',
                codeRate: 0.75,
                redundancy: 0.25,
                correctionCapability: 8,
                encodingComplexity: 'medium',
                decodingComplexity: 'high'
            },
            pilotDensity: 0.14,
            windowingFunction: 'none'
        },
        features: ['MIMO', 'Carrier Aggregation', 'CoMP', 'eICIC'],
        release: '2011',
        backwardCompatible: ['3G UMTS', 'GSM']
    }
};

// ==================== UTILITY TYPES ====================
type Vector2D = Position2D; // Alias for clarity
type Point2D = Position2D;  // Alias for clarity

interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface AnimationFrame {
    timestamp: number;
    agents: Agent[];
    connections: ConnectionLink[];
    metrics: NetworkPerformance;
    interferenceMap: number[][]; // 2D grid of interference levels
}

// ==================== HELPER FUNCTIONS TYPE DEFINITIONS ====================
type ModulationFunction = (bits: number[]) => ComplexNumber[];
type DemodulationFunction = (symbols: ComplexNumber[], snr: number) => number[];
type ChannelFunction = (input: ComplexNumber[], channel: Channel) => ComplexNumber[];
type PathLossFunction = (distance: number, frequency: number) => number;
type InterferenceFunction = (agents: Agent[], target: Agent) => number;

// ==================== CONFIGURATION TYPES ====================
interface SimulationConfiguration {
    engine: {
        timeStep: number;
        maxSpeed: number;
        autoStart: boolean;
    };
    rendering: {
        targetFps: number;
        enableLOD: boolean;
        maxRenderDistance: number;
    };
    networking: {
        maxAgents: number;
        interferenceCalculation: 'simple' | 'detailed';
        channelModel: 'basic' | 'advanced';
    };
    ui: {
        defaultTab: TabType;
        enableAnimations: boolean;
        showPerformanceMetrics: boolean;
    };
}

// ==================== ERROR HANDLING TYPES ====================
interface SimulationError {
    type: 'engine' | 'rendering' | 'worker' | 'network';
    message: string;
    timestamp: number;
    stack?: string;
    recoverable: boolean;
}

type ErrorHandler = (error: SimulationError) => void;

// ==================== EXPORTS ====================
export type {
    // Core types
    ComplexNumber,
    Subcarrier,
    OFDMSymbol,
    Channel,
    MultipathComponent,

    // Train station types
    AgentType,
    MovementState,
    ConnectionState,
    Position2D,
    Velocity2D,
    Agent,
    Train,
    TrainStation,
    AccessPoint,

    // Connection visualization
    ConnectionLink,
    InterferenceWave,
    DopplerVisualization,

    // Modulation and coding
    ModulationScheme,
    CodingScheme,
    OFDMParameters,

    // Performance metrics
    TransmissionMetrics,
    NetworkPerformance,

    // Simulation engine types
    SimulationEngineState,
    SimulationEngine,
    SimulationContextType,

    // Simulation state
    SimulationState,
    SignalTransmission,
    TransmissionError,

    // UI types
    TabType,
    TabConfiguration,
    TabSystemState,
    VisualizationSettings,
    CameraSettings,

    // Rendering types
    RenderingState,
    AnimationController,
    PerformanceMetrics,
    OptimizationSettings,

    // Worker types
    WorkerMessage,
    WorkerResponse,
    SignalProcessingWorkerData,

    // Subscription types
    SubscriptionCallback,
    UnsubscribeFunction,
    EventSubscriptionManager,

    // Standards
    WirelessStandard,

    // Utility types
    Vector2D,
    Point2D,
    BoundingBox,
    AnimationFrame,

    // Configuration types
    SimulationConfiguration,
    SimulationError,
    ErrorHandler,

    // Function types
    ModulationFunction,
    DemodulationFunction,
    ChannelFunction,
    PathLossFunction,
    InterferenceFunction
};

// Export constants
export { MODULATION_TYPES, WIRELESS_STANDARDS };