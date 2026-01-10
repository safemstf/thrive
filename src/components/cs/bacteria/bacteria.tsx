// bacteria.tsx - Streamlined Bacteremia Simulator (Embedded Component)
// Clean version without duplicate headers/controls - integrates with parent simulation page

import React, { useRef, useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  RefreshCw, AlertCircle, Target, Activity,
  Droplets, Wind, Shield, Heart, TrendingUp,
  ChevronDown, Beaker, Syringe
} from "lucide-react";

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
  formatTime,
  getHealthColor,
  getSeverityColor,
} from './bacteria.utils';

import { SimulationController } from './bacteria.logic';

// ============= CONSTANTS =============
const TIME_SCALE = 0.1;
const FPS_TARGET = 60;
const ANIMATION_SMOOTHING = 0.15;

// ============= STYLED COMPONENTS =============
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #0f172a;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`;

const StatsOverlay = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  z-index: 10;
  min-width: 200px;
  animation: ${fadeIn} 0.3s ease;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.75rem;
`;

const StatValue = styled.span<{ $color?: string }>`
  font-weight: 700;
  color: ${p => p.$color || '#e2e8f0'};
`;

const ControlsOverlay = styled.div`
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  z-index: 10;
`;

const ControlBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(51, 65, 85, 0.6)'};
  color: ${p => p.$active ? '#a5b4fc' : '#e2e8f0'};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(99, 102, 241, 0.3);
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 0.5rem;
  min-width: 160px;
  opacity: ${p => p.$show ? 1 : 0};
  visibility: ${p => p.$show ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 100;
`;

const DropdownItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.2)' : 'transparent'};
  color: ${p => p.$active ? '#a5b4fc' : '#e2e8f0'};
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  
  &:hover {
    background: rgba(99, 102, 241, 0.15);
  }
`;

const TimeDisplay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #60a5fa;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  z-index: 10;
`;

const PulseIndicator = styled.div<{ $active: boolean; $color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.$active ? (p.$color || '#22c55e') : '#6b7280'};
  animation: ${p => p.$active ? pulse : 'none'} 2s ease-in-out infinite;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.95);
  z-index: 100;
`;

const ErrorCard = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  color: #e2e8f0;
`;

// ============= ERROR BOUNDARY =============
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
    console.error('Bacteremia Simulation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorOverlay>
          <ErrorCard>
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Simulation Error</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <ControlBtn onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}>
              <RefreshCw size={14} /> Reset
            </ControlBtn>
          </ErrorCard>
        </ErrorOverlay>
      );
    }
    return this.props.children;
  }
}

// ============= MAIN COMPONENT =============
interface SimulatorProps {
  isDark?: boolean;
  initialRunning?: boolean;
  initialSpeed?: number;
}

export default function AdvancedBacteremiaSimulator({ 
  isDark = true, 
  initialRunning = false, 
  initialSpeed = 1
}: SimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef(Date.now());
  const accumulatedTimeRef = useRef(0);
  const simulationController = useRef<SimulationController>(new SimulationController());
  
  const [isRunning, setIsRunning] = useState(initialRunning);
  const [speed, setSpeed] = useState(initialSpeed);
  const [simulationTime, setSimulationTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 600 });
  
  const [showSpeciesMenu, setShowSpeciesMenu] = useState(false);
  const [showAntibioticMenu, setShowAntibioticMenu] = useState(false);
  
  const [selectedSpecies, setSelectedSpecies] = useState<BacterialSpecies[]>(["S_aureus", "E_coli"]);
  const [selectedAntibiotics, setSelectedAntibiotics] = useState<string[]>([]);
  const [initialBacterialLoad] = useState(25);
  const [immuneCompetence] = useState(100);
  const [bloodFlowRate, setBloodFlowRate] = useState(5);
  
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
      differential: { neutrophils: 60, lymphocytes: 30, monocytes: 6, eosinophils: 3, basophils: 1 }
    },
    crp: 5.0,
    procalcitonin: 0.05,
    lactate: 1.0,
    glucose: 5.0,
    creatinine: 1.0,
    bilirubin: 1.0,
    troponin: 0,
    organFunction: { heart: 100, lungs: 100, kidneys: 100, liver: 100, brain: 100 },
    SOFA_score: 0,
    overallHealth: 100
  });

  const [cardiovascularState, setCardiovascularState] = useState<CardiovascularState | null>(null);

  const VESSEL_CENTER_Y = canvasDimensions.height / 2;
  const VESSEL_RADIUS = canvasDimensions.height * 0.35;

  // Sync with parent props
  useEffect(() => {
    setIsRunning(initialRunning);
  }, [initialRunning]);

  useEffect(() => {
    setSpeed(initialSpeed);
  }, [initialSpeed]);

  // Responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasDimensions({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    try {
      simulationController.current = new SimulationController();
      
      const totalBacteria = initialBacterialLoad;
      selectedSpecies.forEach((species, index) => {
        const count = Math.floor(totalBacteria / selectedSpecies.length) + 
                     (index < totalBacteria % selectedSpecies.length ? 1 : 0);
        
        for (let i = 0; i < count; i++) {
          const x = canvasDimensions.width * (0.2 + Math.random() * 0.6);
          const y = VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS * 1.2;
          const z = (Math.random() - 0.5) * VESSEL_RADIUS * 0.8;
          simulationController.current.addBacterium(species, x, y, z, bloodFlowRate);
        }
      });
      
      const baseCellCount = Math.floor(immuneCompetence / 8);
      for (let i = 0; i < baseCellCount; i++) {
        simulationController.current.addImmuneCell(
          Math.random() * canvasDimensions.width,
          VESSEL_CENTER_Y + (Math.random() - 0.5) * VESSEL_RADIUS,
          bloodFlowRate
        );
      }
      
      setSimulationTime(0);
      accumulatedTimeRef.current = 0;
      setError(null);
      
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
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    }
  }, [selectedSpecies, initialBacterialLoad, bloodFlowRate, immuneCompetence, canvasDimensions, patientVitals, VESSEL_CENTER_Y, VESSEL_RADIUS]);

  // Update simulation
  const updateSimulation = useCallback(() => {
    try {
      const now = Date.now();
      const realDeltaTime = (now - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = now;
      
      accumulatedTimeRef.current += realDeltaTime;
      
      const fixedTimeStep = 1 / FPS_TARGET;
      while (accumulatedTimeRef.current >= fixedTimeStep) {
        const simulationDeltaTime = fixedTimeStep * speed * TIME_SCALE;
        
        const cardiovascularResult = simulationController.current.updateCardiovascular(
          patientVitals, bloodFlowRate, simulationDeltaTime
        );
        
        setCardiovascularState(cardiovascularResult.cardiovascularState);
        setBloodFlowRate(cardiovascularResult.bloodFlowRate);
        
        simulationController.current.update(
          simulationDeltaTime, VESSEL_RADIUS, VESSEL_CENTER_Y, canvasDimensions.width
        );
        
        const simStats = simulationController.current.getStats();
        setStats(prev => ({
          ...simStats,
          viscosity: prev.viscosity + (simStats.viscosity - prev.viscosity) * ANIMATION_SMOOTHING,
          sepsisScore: prev.sepsisScore + (simStats.sepsisScore - prev.sepsisScore) * ANIMATION_SMOOTHING,
        }));
        
        const newVitals = simulationController.current.updatePatientVitals(
          patientVitals, simStats, simulationDeltaTime
        );
        setPatientVitals(newVitals);
        
        setSimulationTime(prev => prev + simulationDeltaTime);
        accumulatedTimeRef.current -= fixedTimeStep;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      setIsRunning(false);
    }
  }, [speed, patientVitals, canvasDimensions, bloodFlowRate, VESSEL_CENTER_Y, VESSEL_RADIUS]);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    const time = Date.now() / 1000;
    
    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    
    // Subtle flow lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const offset = (time * 50 + i * 100) % canvasDimensions.width;
      ctx.beginPath();
      ctx.moveTo(offset - canvasDimensions.width, VESSEL_CENTER_Y);
      ctx.lineTo(offset, VESSEL_CENTER_Y);
      ctx.stroke();
    }
    
    // Vessel walls
    const inflammation = Math.min(1, stats.sepsisScore / 100);
    const heartPulse = cardiovascularState ? 
      0.5 + Math.sin(time * (cardiovascularState.heartRate / 60) * Math.PI * 2) * 0.5 : 0;
    
    const wallHue = 60 - inflammation * 30;
    const wallSat = 30 + inflammation * 40;
    const wallLight = 25 + inflammation * 15 + heartPulse * 5;
    
    ctx.strokeStyle = `hsl(${wallHue}, ${wallSat}%, ${wallLight}%)`;
    ctx.lineWidth = 2 + stats.viscosity + inflammation * 2 + heartPulse;
    
    // Upper wall
    ctx.beginPath();
    for (let x = 0; x <= canvasDimensions.width; x += 10) {
      const y = VESSEL_CENTER_Y - VESSEL_RADIUS + Math.sin(x / 100 + time) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Lower wall
    ctx.beginPath();
    for (let x = 0; x <= canvasDimensions.width; x += 10) {
      const y = VESSEL_CENTER_Y + VESSEL_RADIUS + Math.sin(x / 100 + time + Math.PI) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Blood flow particles
    if (cardiovascularState) {
      const flowIntensity = cardiovascularState.bloodFlowRate / 10;
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
    
    // Render entities
    simulationController.current.render(ctx, VESSEL_CENTER_Y, VESSEL_RADIUS);
  }, [canvasDimensions, stats, cardiovascularState, VESSEL_CENTER_Y, VESSEL_RADIUS]);

  // Animation loop
  const animate = useCallback(() => {
    if (isRunning) {
      updateSimulation();
      render();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isRunning, updateSimulation, render]);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    if (isRunning) {
      lastUpdateTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      render(); // Render static frame when paused
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate, render]);

  const handleReset = () => {
    setIsRunning(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setTimeout(() => {
      initializeSimulation();
      render();
    }, 100);
  };

  const handleToggleSpecies = (species: BacterialSpecies) => {
    if (selectedSpecies.includes(species)) {
      if (selectedSpecies.length > 1) {
        setSelectedSpecies(selectedSpecies.filter(s => s !== species));
      }
    } else {
      setSelectedSpecies([...selectedSpecies, species]);
    }
  };

  const handleToggleAntibiotic = (antibiotic: string) => {
    if (selectedAntibiotics.includes(antibiotic)) {
      setSelectedAntibiotics(selectedAntibiotics.filter(a => a !== antibiotic));
      simulationController.current.removeAntibiotic(antibiotic);
    } else {
      setSelectedAntibiotics([...selectedAntibiotics, antibiotic]);
      const profile = ANTIBIOTIC_PROFILES[antibiotic as keyof typeof ANTIBIOTIC_PROFILES];
      simulationController.current.addAntibiotic(antibiotic, profile?.therapeuticRange?.max || 100);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClick = () => {
      setShowSpeciesMenu(false);
      setShowAntibioticMenu(false);
    };
    if (showSpeciesMenu || showAntibioticMenu) {
      setTimeout(() => window.addEventListener('click', handleClick, { once: true }), 0);
    }
  }, [showSpeciesMenu, showAntibioticMenu]);

  const getSeverityColor = (value: number, thresholds: { low: number; high: number }) => {
    if (value < thresholds.low) return '#22c55e';
    if (value < thresholds.high) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <SimulationErrorBoundary onReset={handleReset}>
      <Container ref={containerRef}>
        <Canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
        />

        {/* Stats Overlay */}
        <StatsOverlay>
          <div style={{ 
            fontWeight: 700, 
            marginBottom: '0.75rem', 
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <Activity size={14} />
            Live Metrics
            <PulseIndicator $active={isRunning} $color="#60a5fa" />
          </div>
          
          <StatRow>
            <StatLabel><Target size={12} /> Bacteria</StatLabel>
            <StatValue $color={getSeverityColor(stats.totalBacteria, { low: 20, high: 80 })}>
              {stats.totalBacteria} CFU
            </StatValue>
          </StatRow>
          
          <StatRow>
            <StatLabel><TrendingUp size={12} /> Sepsis Score</StatLabel>
            <StatValue $color={getSeverityColor(stats.sepsisScore, { low: 25, high: 60 })}>
              {stats.sepsisScore.toFixed(1)}%
            </StatValue>
          </StatRow>
          
          <StatRow>
            <StatLabel><Heart size={12} /> Health</StatLabel>
            <StatValue $color={getHealthColor(patientVitals.overallHealth, { good: 70, warning: 40 })}>
              {patientVitals.overallHealth.toFixed(0)}%
            </StatValue>
          </StatRow>
          
          <StatRow>
            <StatLabel><Droplets size={12} /> Viscosity</StatLabel>
            <StatValue>{stats.viscosity.toFixed(1)} cP</StatValue>
          </StatRow>
          
          <StatRow>
            <StatLabel><Wind size={12} /> Flow</StatLabel>
            <StatValue>{bloodFlowRate.toFixed(1)} cm/s</StatValue>
          </StatRow>
          
          <StatRow>
            <StatLabel><Shield size={12} /> Biofilm</StatLabel>
            <StatValue>{(stats.biofilmCoverage * 100).toFixed(1)}%</StatValue>
          </StatRow>
        </StatsOverlay>

        {/* Simulation Time */}
        <TimeDisplay>
          {formatTime(simulationTime)}
        </TimeDisplay>

        {/* Controls */}
        <ControlsOverlay>
          <ControlBtn onClick={handleReset}>
            <RefreshCw size={14} /> Reset
          </ControlBtn>
          
          <DropdownContainer>
            <ControlBtn 
              $active={showSpeciesMenu}
              onClick={(e) => { e.stopPropagation(); setShowSpeciesMenu(!showSpeciesMenu); setShowAntibioticMenu(false); }}
            >
              <Beaker size={14} /> Species <ChevronDown size={12} />
            </ControlBtn>
            <DropdownMenu $show={showSpeciesMenu}>
              {(Object.keys(BACTERIAL_PROFILES) as BacterialSpecies[]).map(species => (
                <DropdownItem
                  key={species}
                  $active={selectedSpecies.includes(species)}
                  onClick={(e) => { e.stopPropagation(); handleToggleSpecies(species); }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: selectedSpecies.includes(species) ? '#22c55e' : '#475569'
                  }} />
                  {BACTERIAL_PROFILES[species].name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>
          
          <DropdownContainer>
            <ControlBtn 
              $active={showAntibioticMenu || selectedAntibiotics.length > 0}
              onClick={(e) => { e.stopPropagation(); setShowAntibioticMenu(!showAntibioticMenu); setShowSpeciesMenu(false); }}
            >
              <Syringe size={14} /> 
              Antibiotics {selectedAntibiotics.length > 0 && `(${selectedAntibiotics.length})`}
              <ChevronDown size={12} />
            </ControlBtn>
            <DropdownMenu $show={showAntibioticMenu}>
              {Object.keys(ANTIBIOTIC_PROFILES).map(antibiotic => (
                <DropdownItem
                  key={antibiotic}
                  $active={selectedAntibiotics.includes(antibiotic)}
                  onClick={(e) => { e.stopPropagation(); handleToggleAntibiotic(antibiotic); }}
                >
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: selectedAntibiotics.includes(antibiotic) ? '#f59e0b' : '#475569'
                  }} />
                  {antibiotic.replace(/_/g, ' ')}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>
        </ControlsOverlay>

        {/* Error display */}
        {error && (
          <ErrorOverlay>
            <ErrorCard>
              <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
              <ControlBtn onClick={() => { setError(null); handleReset(); }}>
                <RefreshCw size={14} /> Reset
              </ControlBtn>
            </ErrorCard>
          </ErrorOverlay>
        )}
      </Container>
    </SimulationErrorBoundary>
  );
}