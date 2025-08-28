// bacteria.tsx - Enhanced Bacteremia Simulator with Superior UX
// Production version with proper imports and time scaling

import React, { useRef, useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import {
  PlayCircle, PauseCircle, RefreshCw, Pill, Heart, Microscope, Zap,
  ChevronDown, ChevronUp, AlertCircle, Maximize2, Clock, Activity,
  Thermometer, Droplets, Wind, Brain, Settings, Info, TrendingUp,
  Shield, Target, Beaker, Database, Cpu, BarChart3, Timer,
  Gauge, Calendar, Pause, Play, SkipForward, Waves, Sparkles,
  AlertTriangle, CheckCircle, XCircle, Users, Syringe, FlaskConical,
  Flame, Snowflake, TrendingDown, Loader2, Crosshair, Volume2
} from "lucide-react";

// Import complete type system and logic
import {
  BacterialSpecies,
  SimulationStats,
  PatientVitals,
  BACTERIAL_PROFILES,
  ANTIBIOTIC_PROFILES,
  CardiovascularState,
  InflammatoryState,
  ADVANCED_CONFIG
} from './bacteria.types';

import {
  calculateOrganDamage,
  formatRealTime,
  formatTime,
  getHealthColor,
  getSeverityColor,
  getSeverityIcon
} from './bacteria.utils';

import { SimulationController } from './bacteria.logic';

import {AnalyticsTab, ImmuneTab, PhysiologyTab, MicrobiologyTab} from './bacteria.tabs'

// ============= CONSTANTS =============
const TIME_SCALE = 0.1; // 1 real second = 0.1 simulation minutes (6 seconds per minute)
const FPS_TARGET = 60;
const ANIMATION_SMOOTHING = 0.15; // For smooth value transitions

// ============= ERROR BOUNDARY (unchanged) =============
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SimulationErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Bacteremia Simulation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(127, 29, 29, 0.2))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#fff',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Simulation Critical Error
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            A critical error occurred in the bacteremia simulation engine:
            <br />
            <code style={{ fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.5rem' }}>
              {this.state.error?.message || 'Unknown simulation error'}
            </code>
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.4))',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.4))';
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Reset Simulation
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============= ANIMATED VALUE COMPONENT =============
const AnimatedValue = ({ 
  value, 
  format = (v) => v.toFixed(0), 
  duration = 500,
  color,
  fontSize = '2rem',
  fontWeight = 800
}: {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  color?: string;
  fontSize?: string;
  fontWeight?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number>(0);
  const startRef = useRef<number>(value);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = displayValue;
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutQuad = (t: number) => 
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const easedProgress = easeInOutQuad(progress);
      const currentValue = startRef.current + (value - startRef.current) * easedProgress;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span style={{ color, fontSize, fontWeight }}>
      {format(displayValue)}
    </span>
  );
};

// ============= PULSE INDICATOR =============
const PulseIndicator = ({ active, color = '#22c55e' }: { active: boolean; color?: string }) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <div style={{
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: active ? color : '#6b7280',
      transition: 'all 0.3s ease'
    }} />
    {active && (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        animation: 'pulse 2s infinite'
      }} />
    )}
  </div>
);

// ============= SPEED PRESETS =============
const SPEED_PRESETS = [
  { label: '0.1×', value: 0.1, icon: '🐌', description: 'Ultra Slow' },
  { label: '0.5×', value: 0.5, icon: '🚶', description: 'Slow' },
  { label: '1×', value: 1, icon: '⏯', description: 'Normal' },
  { label: '2×', value: 2, icon: '🏃', description: 'Fast' },
  { label: '5×', value: 5, icon: '✈️', description: 'Very Fast' },
  { label: '10×', value: 10, icon: '🚀', description: 'Ultra Fast' },
  { label: '50×', value: 50, icon: '⚡', description: 'Time Lapse' },
];

// ============= MAIN ENHANCED COMPONENT =============
interface SimulatorProps {
  isDark?: boolean;
  initialRunning?: boolean;
  initialSpeed?: number;
  showAdvanced?: boolean;
}

export default function EnhancedBacteremiaSimulator({ 
  isDark = true, 
  initialRunning = false, 
  initialSpeed = 1,
  showAdvanced = true
}: SimulatorProps) {
  // Core simulation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(Date.now());
  const accumulatedTimeRef = useRef(0);
  
  // Enhanced simulation controller
  const simulationController = useRef<SimulationController>(new SimulationController());
  
  // Primary state
  const [isRunning, setIsRunning] = useState(initialRunning);
  const [speed, setSpeed] = useState(initialSpeed);
  const [simulationTime, setSimulationTime] = useState(0); // in simulation minutes
  const [realTime, setRealTime] = useState(0); // in real seconds
  const [fps, setFps] = useState(60);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'physiology' | 'microbiology' | 'therapy' | 'immune' | 'analytics'>('overview');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(showAdvanced);
  const [autoScale, setAutoScale] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Enhanced selection state
  const [selectedSpecies, setSelectedSpecies] = useState<BacterialSpecies[]>(["S_aureus", "E_coli"]);
  const [selectedAntibiotics, setSelectedAntibiotics] = useState<string[]>([]);
  
  // Simulation parameters
  const [initialBacterialLoad, setInitialBacterialLoad] = useState(25);
  const [immuneCompetence, setImmuneCompetence] = useState(100);
  const [bloodFlowRate, setBloodFlowRate] = useState(5);
  const [atherosclerosisLevel, setAtherosclerosisLevel] = useState(15);
  const [oxygenSaturation, setOxygenSaturation] = useState(98);
  const [bodyTemperature, setBodyTemperature] = useState(37.0);
  
  // Enhanced statistics with smooth transitions
  const [stats, setStats] = useState<SimulationStats>({
    totalBacteria: 0,
    bacterialSpeciesCount: new Map(),
    uniqueStrains: 0,
    dominantStrain: '',
    averageResistance: 0,
    biofilmCoverage: 0,
    totalBiofilmBiomass: 0,
    phageCount: 0,
    lysogenicBacteria: 0,
    viscosity: 1.0,
    sepsisScore: 0,
    bacteremia: false,
    clottingRisk: 0,
    cytokineStorm: false,
    SIRS_criteria: 0,
    qSOFA_score: 0,
    DIC_risk: 0
  });

  // Enhanced patient vitals
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80, MAP: 93 },
    temperature: 37.0,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    pO2: 95,
    pCO2: 40,
    pH: 7.4,
    HCO3: 24,
    baseExcess: 0,
    whiteBloodCells: {
      total: 7.5,
      differential: {
        neutrophils: 60,
        lymphocytes: 30,
        monocytes: 6,
        eosinophils: 3,
        basophils: 1
      }
    },
    crp: 5.0,
    procalcitonin: 0.05,
    lactate: 1.0,
    glucose: 5.0,
    creatinine: 1.0,
    bilirubin: 1.0,
    troponin: 0,
    organFunction: {
      heart: 100,
      lungs: 100,
      kidneys: 100,
      liver: 100,
      brain: 100
    },
    SOFA_score: 0,
    overallHealth: 100
  });

  // Canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 600 });
  const VESSEL_CENTER_Y = canvasDimensions.height / 2;
  const VESSEL_RADIUS = canvasDimensions.height * 0.35;

  // Cardiovascular and inflammatory states
  const [cardiovascularState, setCardiovascularState] = useState<CardiovascularState | null>(null);
  const [inflammatoryState, setInflammatoryState] = useState<InflammatoryState | null>(null);

  // ============= RESPONSIVE CANVAS =============
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('simulation-container');
      if (container) {
        const width = Math.min(container.clientWidth, 1600);
        const height = autoScale ? Math.max(400, Math.min(width * 0.5, 800)) : 600;
        setCanvasDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoScale]);

  // ============= ENHANCED INITIALIZATION =============
  const initializeSimulation = useCallback(() => {
    try {
      simulationController.current = new SimulationController();
      
      // Add initial bacterial populations
      const totalBacteria = initialBacterialLoad;
      selectedSpecies.forEach((species, index) => {
        const count = Math.floor(totalBacteria / selectedSpecies.length) + 
                     (index < totalBacteria % selectedSpecies.length ? 1 : 0);
        
        for (let i = 0; i < count; i++) {
          const clusterCenterX = canvasDimensions.width * (0.2 + Math.random() * 0.6);
          const clusterCenterY = VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS * 1.2;
          
          const x = clusterCenterX + (Math.random() - 0.5) * 100;
          const y = clusterCenterY + (Math.random() - 0.5) * 50;
          const z = (Math.random() - 0.5) * VESSEL_RADIUS * 0.8;
          
          simulationController.current.addBacterium(species, x, y, z, bloodFlowRate);
        }
      });
      
      // Add immune cells
      const baseCellCount = Math.floor(immuneCompetence / 8);
      
      for (let i = 0; i < baseCellCount; i++) {
        simulationController.current.addImmuneCell(
          Math.random() * canvasDimensions.width,
          VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS,
          bloodFlowRate
        );
      }
      
      // Add atherosclerotic plaques
      if (atherosclerosisLevel > 0) {
        const plaqueCount = Math.floor(atherosclerosisLevel / 15);
        for (let i = 0; i < plaqueCount; i++) {
          const x = Math.random() * canvasDimensions.width;
          const y = VESSEL_CENTER_Y + (Math.random() > 0.5 ? 1 : -1) * (VESSEL_RADIUS - 25);
          const size = 8 + Math.random() * (atherosclerosisLevel / 5);
          
          simulationController.current.addFatDeposit(x, y, size);
        }
      }
      
      setSimulationTime(0);
      setRealTime(0);
      accumulatedTimeRef.current = 0;
      setError(null);
      
      // Initialize cardiovascular state
      setCardiovascularState({
        heartRate: patientVitals.heartRate,
        strokeVolume: 70,
        cardiacOutput: 5.25,
        meanArterialPressure: patientVitals.bloodPressure.MAP,
        systemicVascularResistance: 1200,
        arterialTone: 0.5,
        venousTone: 0.5,
        capillaryPermeability: 0.1,
        endothelialFunction: 1.0,
        bloodFlowRate: bloodFlowRate,
        oxygenDelivery: 1000,
        tissueHypoxia: 0
      });
      
    } catch (err) {
      console.error('Enhanced initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize simulation');
    }
  }, [
    selectedSpecies, initialBacterialLoad, bloodFlowRate, immuneCompetence, 
    atherosclerosisLevel, canvasDimensions, patientVitals
  ]);

  // ============= ENHANCED UPDATE WITH PROPER TIME SCALING =============
  const updateSimulation = useCallback(() => {
    try {
      const now = Date.now();
      const realDeltaTime = (now - lastUpdateTimeRef.current) / 1000; // Real seconds
      lastUpdateTimeRef.current = now;
      
      // Accumulate time for smooth updates
      accumulatedTimeRef.current += realDeltaTime;
      
      // Update at fixed timesteps for consistency
      const fixedTimeStep = 1 / FPS_TARGET; // seconds
      while (accumulatedTimeRef.current >= fixedTimeStep) {
        // Calculate simulation time passed (in minutes)
        const simulationDeltaTime = fixedTimeStep * speed * TIME_SCALE;
        
        // Update cardiovascular system
        const cardiovascularResult = simulationController.current.updateCardiovascular(
          patientVitals, bloodFlowRate, simulationDeltaTime
        );
        
        setCardiovascularState(cardiovascularResult.cardiovascularState);
        setBloodFlowRate(cardiovascularResult.bloodFlowRate);
        
        // Core simulation update
        simulationController.current.update(
          simulationDeltaTime, VESSEL_RADIUS, VESSEL_CENTER_Y, canvasDimensions.width
        );
        
        // Update statistics with smoothing
        const simStats = simulationController.current.getStats();
        setStats(prevStats => ({
          ...simStats,
          // Smooth certain values for better UX
          viscosity: prevStats.viscosity + (simStats.viscosity - prevStats.viscosity) * ANIMATION_SMOOTHING,
          sepsisScore: prevStats.sepsisScore + (simStats.sepsisScore - prevStats.sepsisScore) * ANIMATION_SMOOTHING,
          clottingRisk: prevStats.clottingRisk + (simStats.clottingRisk - prevStats.clottingRisk) * ANIMATION_SMOOTHING
        }));
        
        // Update patient vitals
        const newVitals = simulationController.current.updatePatientVitals(
          patientVitals, simStats, simulationDeltaTime
        );
        
        setPatientVitals(newVitals);
        
        // Update times
        setSimulationTime(prev => prev + simulationDeltaTime);
        setRealTime(prev => prev + fixedTimeStep);
        
        accumulatedTimeRef.current -= fixedTimeStep;
      }
      
      // Update FPS counter
      frameCountRef.current++;
      if (frameCountRef.current % 30 === 0) {
        const deltaFrameTime = now - lastFrameTimeRef.current;
        if (deltaFrameTime > 0) {
          setFps(Math.round(30000 / deltaFrameTime));
          lastFrameTimeRef.current = now;
        }
      }
      
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Simulation update failed');
      setIsRunning(false);
    }
  }, [speed, patientVitals, canvasDimensions, bloodFlowRate]);

  // ============= ENHANCED RENDERING =============
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Enhanced background with animated gradient
    const time = Date.now() / 1000;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasDimensions.height);
    const pulseIntensity = 0.02 + Math.sin(time * 0.5) * 0.01;
    gradient.addColorStop(0, `rgba(10, 10, 10, ${1 - pulseIntensity})`);
    gradient.addColorStop(0.5, `rgba(17, 17, 17, ${1 - pulseIntensity * 0.5})`);
    gradient.addColorStop(1, `rgba(10, 10, 10, ${1 - pulseIntensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    
    // Add subtle flow lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const offset = (time * 50 + i * 100) % canvasDimensions.width;
      ctx.beginPath();
      ctx.moveTo(offset - canvasDimensions.width, VESSEL_CENTER_Y);
      ctx.lineTo(offset, VESSEL_CENTER_Y);
      ctx.stroke();
    }
    
    // Enhanced vessel walls with pulse animation
    const viscosity = stats.viscosity;
    const inflammation = Math.min(1, stats.sepsisScore / 100);
    const heartPulse = cardiovascularState ? 
      0.5 + Math.sin(time * (cardiovascularState.heartRate / 60) * Math.PI * 2) * 0.5 : 0;
    
    const wallHue = 60 - inflammation * 30;
    const wallSat = 30 + inflammation * 40;
    const wallLight = 25 + inflammation * 15 + heartPulse * 5;
    
    ctx.strokeStyle = `hsl(${wallHue}, ${wallSat}%, ${wallLight}%)`;
    ctx.lineWidth = 2 + viscosity + inflammation * 2 + heartPulse;
    ctx.setLineDash([]);
    
    // Upper vessel wall with subtle curve
    ctx.beginPath();
    for (let x = 0; x <= canvasDimensions.width; x += 10) {
      const y = VESSEL_CENTER_Y - VESSEL_RADIUS + Math.sin(x / 100 + time) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Lower vessel wall
    ctx.beginPath();
    for (let x = 0; x <= canvasDimensions.width; x += 10) {
      const y = VESSEL_CENTER_Y + VESSEL_RADIUS + Math.sin(x / 100 + time + Math.PI) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Blood flow visualization with particles
    if (cardiovascularState) {
      const flowIntensity = cardiovascularState.bloodFlowRate / 10;
      
      // Flow particles
      ctx.globalAlpha = flowIntensity * 0.3;
      for (let i = 0; i < 20; i++) {
        const particleX = (time * 100 * flowIntensity + i * 50) % (canvasDimensions.width + 100) - 50;
        const particleY = VESSEL_CENTER_Y + Math.sin(particleX / 50 + i) * VESSEL_RADIUS * 0.8;
        
        ctx.fillStyle = `hsl(0, 60%, ${50 + flowIntensity * 20}%)`;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    
    // Render simulation entities
    simulationController.current.render(ctx, VESSEL_CENTER_Y, VESSEL_RADIUS);
    
  }, [canvasDimensions, stats, cardiovascularState]);

  // ============= ANIMATION LOOP =============
  const animate = useCallback(() => {
    if (isRunning) {
      updateSimulation();
      render();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, updateSimulation, render]);

  // ============= EFFECTS =============
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    if (isRunning) {
      lastUpdateTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate]);

  // ============= HANDLERS =============
  const handleReset = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTimeout(() => {
      initializeSimulation();
      setSimulationTime(0);
      setRealTime(0);
      render();
    }, 100);
  };

  const handleAntibioticAdministration = (antibiotic: string) => {
    if (selectedAntibiotics.includes(antibiotic)) {
      setSelectedAntibiotics(selectedAntibiotics.filter(a => a !== antibiotic));
      simulationController.current.removeAntibiotic(antibiotic);
    } else {
      setSelectedAntibiotics([...selectedAntibiotics, antibiotic]);
      const profile = ANTIBIOTIC_PROFILES[antibiotic as keyof typeof ANTIBIOTIC_PROFILES];
      const dose = profile?.therapeuticRange?.max || 100;
      simulationController.current.addAntibiotic(antibiotic, dose);
      
      // Visual feedback
      if (soundEnabled) {
        // Play administration sound
      }
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
  };



  // ============= RENDER ENHANCED UI =============
  return (

    <SimulationErrorBoundary onReset={handleReset}>
      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      
      <div style={{
        width: '100%',
        maxWidth: '1920px',
        margin: '0 auto',
        background: isDark ? 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)' : '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Enhanced Header with Better Clock */}
        <div style={{
          padding: '1rem 1.5rem',
          background: isDark ? 
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))' : 
            'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
          borderBottom: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Microscope size={24} style={{ color: '#3b82f6' }} />
              Bacteremia Simulator
            </h1>
            
            {/* Enhanced Clock Display */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Simulation Time
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  color: '#3b82f6',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Calendar size={14} />
                  {formatTime(simulationTime)}
                </div>
              </div>
              
              <div style={{
                width: '1px',
                background: 'rgba(59, 130, 246, 0.3)'
              }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Real Time
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  color: '#22c55e',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Timer size={14} />
                  {formatRealTime(realTime)}
                </div>
              </div>
              
              <div style={{
                width: '1px',
                background: 'rgba(59, 130, 246, 0.3)'
              }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Time Ratio
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Gauge size={14} />
                  1:{(speed * TIME_SCALE * 60).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {/* Performance Metrics */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'center',
              fontSize: '0.875rem',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Cpu size={14} />
                <span>{fps} FPS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Database size={14} />
                <AnimatedValue 
                  value={stats.totalBacteria + (simulationController.current?.state?.immuneCells?.length || 0)} 
                  fontSize="0.875rem"
                  fontWeight={600}
                  color="inherit"
                />
                <span> entities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <PulseIndicator active={isRunning} />
                <span style={{ color: isRunning ? '#22c55e' : '#f59e0b' }}>
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
            </div>
            
            {/* Quick Controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: soundEnabled ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Toggle sound"
              >
                <Volume2 size={16} />
              </button>
              <button
                onClick={() => setShowMiniMap(!showMiniMap)}
                style={{
                  background: showMiniMap ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Toggle mini-map"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                style={{
                  background: showAdvancedMetrics ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Toggle advanced metrics"
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Simulation Canvas */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          gap: '1.5rem'
        }}>
          <div id="simulation-container" style={{
            position: 'relative',
            background: isDark ? 
              'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 
              'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `3px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
            
            {/* Enhanced Controls Overlay with Speed Menu */}
            <div style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {/* Speed Menu */}
              {showSpeedMenu && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: 'rgba(0, 0, 0, 0.9)',
                  padding: '1rem',
                  borderRadius: '16px',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animation: 'slideIn 0.2s ease-out'
                }}>
                  {SPEED_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => handleSpeedChange(preset.value)}
                      style={{
                        background: speed === preset.value ? 
                          'rgba(59, 130, 246, 0.3)' : 
                          'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${speed === preset.value ? 
                          'rgba(59, 130, 246, 0.5)' : 
                          'rgba(255, 255, 255, 0.1)'}`,
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        color: speed === preset.value ? '#3b82f6' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '60px'
                      }}
                      title={preset.description}
                    >
                      <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                        {preset.icon}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Main Controls */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                {/* Play/Pause with animation */}
                <button 
                  onClick={() => setIsRunning(!isRunning)} 
                  style={{
                    background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    border: `2px solid ${isRunning ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    animation: isRunning ? 'heartbeat 1s infinite' : 'none'
                  }}
                  title={isRunning ? 'Pause simulation' : 'Start simulation'}
                >
                  {isRunning ? <Pause size={28} /> : <Play size={28} />}
                </button>
                
                {/* Reset */}
                <button 
                  onClick={handleReset} 
                  style={{
                    background: 'rgba(156, 163, 175, 0.2)',
                    border: '2px solid rgba(156, 163, 175, 0.5)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Reset simulation"
                >
                  <RefreshCw size={24} />
                </button>
                
                {/* Speed Control with Preset Button */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  color: '#fff',
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Zap size={16} />
                    <span style={{ fontWeight: 600 }}>{speed}×</span>
                  </button>
                  
                  <input
                    type="range"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    style={{ 
                      width: '120px',
                      accentColor: '#3b82f6'
                    }}
                  />
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.25rem' 
                  }}>
                    <button
                      onClick={() => setSpeed(Math.max(0.1, speed / 2))}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '4px',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                      title="Half speed"
                    >
                      0.5×
                    </button>
                    <button
                      onClick={() => setSpeed(Math.min(50, speed * 2))}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '4px',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                      title="Double speed"
                    >
                      2×
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Mini Stats with Animations */}
            {showMiniMap && (
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(0, 0, 0, 0.85)',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                minWidth: '320px',
                fontSize: '0.875rem',
                color: '#fff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ 
                  fontWeight: 700, 
                  marginBottom: '1rem', 
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem'
                }}>
                  <Activity size={16} />
                  Live Metrics
                  <PulseIndicator active={true} color="#3b82f6" />
                </div>
                
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {/* Critical Parameters with Icons */}
                  <div className="stat-card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getSeverityIcon(stats.totalBacteria, { low: 10, medium: 50, high: 100 })}
                      <Target size={14} style={{ color: '#ef4444' }} />
                      Bacterial Load:
                    </span>
                    <span style={{ 
                      color: getSeverityColor(stats.totalBacteria, { low: 10, medium: 50, high: 100 }),
                      fontWeight: 700
                    }}>
                      <AnimatedValue 
                        value={stats.totalBacteria} 
                        fontSize="1rem"
                        color={getSeverityColor(stats.totalBacteria, { low: 10, medium: 50, high: 100 })}
                      /> CFU/mL
                    </span>
                  </div>
                  
                  <div className="stat-card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getSeverityIcon(stats.sepsisScore, { low: 25, medium: 50, high: 75 })}
                      <TrendingUp size={14} style={{ color: '#f59e0b' }} />
                      Sepsis Score:
                    </span>
                    <span style={{ 
                      color: getSeverityColor(stats.sepsisScore, { low: 25, medium: 50, high: 75 }),
                      fontWeight: 700
                    }}>
                      <AnimatedValue 
                        value={stats.sepsisScore} 
                        format={(v) => v.toFixed(1)}
                        fontSize="1rem"
                        color={getSeverityColor(stats.sepsisScore, { low: 25, medium: 50, high: 75 })}
                      />%
                    </span>
                  </div>
                  
                  <div className="stat-card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getSeverityIcon(100 - patientVitals.overallHealth, { low: 30, medium: 60, high: 80 })}
                      <Heart size={14} style={{ color: '#22c55e' }} />
                      Overall Health:
                    </span>
                    <span style={{ 
                      color: getHealthColor(patientVitals.overallHealth, { good: 70, warning: 40 }),
                      fontWeight: 700
                    }}>
                      <AnimatedValue 
                        value={patientVitals.overallHealth} 
                        format={(v) => v.toFixed(1)}
                        fontSize="1rem"
                        color={getHealthColor(patientVitals.overallHealth, { good: 70, warning: 40 })}
                      />%
                    </span>
                  </div>
                  
                  {showAdvancedMetrics && (
                    <>
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Droplets size={14} style={{ color: '#06b6d4' }} />
                          Blood Viscosity:
                        </span>
                        <span style={{ 
                          color: stats.viscosity > 5 ? '#f59e0b' : '#22c55e',
                          fontWeight: 600
                        }}>
                          <AnimatedValue 
                            value={stats.viscosity} 
                            format={(v) => v.toFixed(1)}
                            fontSize="0.875rem"
                          /> cP
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Shield size={14} style={{ color: '#8b5cf6' }} />
                          Biofilm Coverage:
                        </span>
                        <span style={{ 
                          color: stats.biofilmCoverage > 0.3 ? '#f97316' : '#64748b',
                          fontWeight: 600
                        }}>
                          <AnimatedValue 
                            value={stats.biofilmCoverage * 100} 
                            format={(v) => v.toFixed(1)}
                            fontSize="0.875rem"
                          />%
                        </span>
                      </div>
                      
                      {cardiovascularState && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Wind size={14} style={{ color: '#10b981' }} />
                            Blood Flow:
                          </span>
                          <span style={{ 
                            color: cardiovascularState.bloodFlowRate < 3 ? '#f59e0b' : '#22c55e',
                            fontWeight: 600
                          }}>
                            <AnimatedValue 
                              value={cardiovascularState.bloodFlowRate} 
                              format={(v) => v.toFixed(1)}
                              fontSize="0.875rem"
                            /> cm/s
                          </span>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Heart size={14} style={{ color: '#ef4444' }} />
                          Heart Rate:
                        </span>
                        <span style={{ 
                          color: patientVitals.heartRate > 100 ? '#f59e0b' : patientVitals.heartRate < 60 ? '#06b6d4' : '#22c55e',
                          fontWeight: 600
                        }}>
                          <AnimatedValue 
                            value={patientVitals.heartRate} 
                            fontSize="0.875rem"
                          /> bpm
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rest of the UI components remain the same... */}
          {/* Patient Vitals Panel, Control Tabs, etc. */}
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(127, 29, 29, 0.9))',
            color: '#fff',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            maxWidth: '400px',
            fontSize: '0.875rem',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={18} />
              <strong>Simulation Error</strong>
            </div>
            <p style={{ margin: '0 0 1rem 0', lineHeight: 1.4 }}>{error}</p>
            <button 
              onClick={() => setError(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </SimulationErrorBoundary>
  );
}
