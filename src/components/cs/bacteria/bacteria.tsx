// bacteria.tsx
import React, { useRef, useState, useEffect, useCallback, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import {
  PlayCircle, PauseCircle, RefreshCw, Activity, Shield, Pill,
  Heart, TrendingUp, AlertTriangle, Microscope, Zap, Info,
  BarChart3, Settings, Dna, Download, Bug, ChevronDown,
  Thermometer, Wind, Droplets, Brain, Timer, FileText,
  Clock, Calendar, ArrowRight, Waves, GitBranch, Beaker,
  Target, Layers, FlaskConical, Binary, LineChart, ChevronUp,
  AlertCircle, Users, Filter, Maximize2, Volume2
} from "lucide-react";

// Import all types and constants
import {
  BacterialSpecies,
  EnhancedBacterium,
  EnhancedPhage,
  BloodRheology,
  ImmuneResponse,
  PatientVitals,
  SimulationStats,
  BACTERIAL_PROFILES,
  ANTIBIOTIC_PROFILES,
  ADVANCED_CONFIG,
  ImmuneCell,
  Antibody,
  BloodClot,
  FatDeposit,
  CellType
} from './bacteria.types';

// Import utility functions and classes
import {
  OctreeNode,
  BacterialEvolution,
  PhageTherapyEngine,
  calculateSepsisScore,
  calculateOrganDamage,
  getHealthColor
} from './bacteria.utils';

// ============= ERROR BOUNDARY =============
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class SimulationErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Simulation error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fff',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Simulation Error</h2>
          <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              this.props.onReset();
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Reset Simulation
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============= MAIN COMPONENT =============
export default function AdvancedBacteremiaSimulator({ 
  isDark = true, 
  isRunning: externalRunning = true, 
  speed: externalSpeed = 1
}) {
  // Canvas and animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  // Engine refs
  const octreeRef = useRef<OctreeNode>(new OctreeNode(0, 0, -300, 1500));
  const evolutionEngineRef = useRef<BacterialEvolution>(new BacterialEvolution());
  const phageEngineRef = useRef<PhageTherapyEngine>(new PhageTherapyEngine());
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const [fps, setFps] = useState(60);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Entities
  const bacteriaRef = useRef<EnhancedBacterium[]>([]);
  const immuneCellsRef = useRef<ImmuneCell[]>([]);
  const antibodiesRef = useRef<Antibody[]>([]);
  const bloodClotsRef = useRef<BloodClot[]>([]);
  const fatDepositsRef = useRef<FatDeposit[]>([]);
  const phagesRef = useRef<EnhancedPhage[]>([]);
  const cytokinesRef = useRef<any[]>([]);
  
  // Advanced tracking
  const strainMapRef = useRef<Map<string, number>>(new Map());
  const rheologyRef = useRef<BloodRheology>({
    viscosity: 1.0,
    shearRate: 100,
    hematocrit: 0.45,
    fibrinogenLevel: 3.0,
    plateletActivation: 0
  });
  const immuneResponseRef = useRef<ImmuneResponse>({
    innate: {
      neutrophilRecruitment: 0,
      macrophageActivation: 0,
      complementActivation: 0,
      acutePhaseProteins: 0
    },
    adaptive: {
      antibodyProduction: 0,
      tcellActivation: 0,
      memoryFormation: 0
    },
    cytokineProfile: {
      proInflammatory: 0,
      antiInflammatory: 0,
      chemokines: 0
    }
  });
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'microbiology' | 'therapy' | 'immune'>('overview');
  const [selectedSpecies, setSelectedSpecies] = useState<BacterialSpecies[]>(["S_aureus"]);
  const [phageTherapyMode, setPhageTherapyMode] = useState<'off' | 'targeted' | 'cocktail'>('off');
  const [selectedPhages, setSelectedPhages] = useState<string[]>([]);
  
  // Parameters
  const [initialBacterialLoad, setInitialBacterialLoad] = useState(10);
  const [immuneCompetence, setImmuneCompetence] = useState(100);
  const [bloodFlowRate, setBloodFlowRate] = useState(5);
  const [evolutionEnabled, setEvolutionEnabled] = useState(true);
  const [atherosclerosisLevel, setAtherosclerosisLevel] = useState(0);
  
  // Statistics
  const [stats, setStats] = useState<SimulationStats>({
    totalBacteria: 0,
    uniqueStrains: 0,
    dominantStrain: '',
    averageResistance: 0,
    biofilmCoverage: 0,
    phageCount: 0,
    lysogenicBacteria: 0,
    viscosity: 1.0,
    sepsisScore: 0,
    bacteremia: false,
    clottingRisk: 0,
    cytokineStorm: false
  });

  // Patient vitals
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 37.0,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    whiteBloodCells: 7.5,
    crp: 5.0,
    procalcitonin: 0.05,
    lactate: 1.0,
    organFunction: {
      heart: 100,
      lungs: 100,
      kidneys: 100,
      liver: 100,
      brain: 100
    },
    overallHealth: 100
  });

  // Canvas dimensions - responsive
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1200, height: 600 });
  const VESSEL_CENTER_Y = canvasDimensions.height / 2;
  const VESSEL_RADIUS = canvasDimensions.height * 0.35;

  // ============= RESPONSIVE CANVAS =============
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('simulation-container');
      if (container) {
        const width = container.clientWidth;
        const height = Math.max(400, Math.min(width * 0.5, 600));
        setCanvasDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============= ERROR HANDLING =============
  const safeUpdate = useCallback((fn: () => void, context: string) => {
    try {
      fn();
    } catch (err) {
      console.error(`Error in ${context}:`, err);
      setError(`Simulation error in ${context}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // ============= INITIALIZATION WITH IMMUNE CELLS =============
  const initializeSimulation = useCallback(() => {
    safeUpdate(() => {
      octreeRef.current.clear();
      const bacteria: EnhancedBacterium[] = [];
      const immuneCells: ImmuneCell[] = [];
      const fatDeposits: FatDeposit[] = [];
      
      // Initialize bacteria
      selectedSpecies.forEach(species => {
        const loadPerSpecies = Math.min(
          Math.floor(initialBacterialLoad / selectedSpecies.length),
          Math.floor(ADVANCED_CONFIG.MAX_BACTERIA / selectedSpecies.length)
        );
        
        const baseStrain = evolutionEngineRef.current.generateStrain(species);
        
        for (let i = 0; i < loadPerSpecies; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * VESSEL_RADIUS * 0.9;
          const z = r * Math.cos(angle);
          
          const bacterium: EnhancedBacterium = {
            id: Math.random(),
            x: canvasDimensions.width * 0.1 + Math.random() * canvasDimensions.width * 0.8,
            y: VESSEL_CENTER_Y + r * Math.sin(angle),
            z,
            vx: bloodFlowRate + (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.2,
            strain: baseStrain,
            health: 100,
            replicationTimer: BACTERIAL_PROFILES[species].divisionTime * 60,
            metabolicState: 'active',
            quorumSignal: 0,
            adherent: false,
            biofilm: false,
            phageInfected: false,
            opsonized: false,
            complementBound: false,
            age: 0,
            stressLevel: 0
          };
          
          bacteria.push(bacterium);
          octreeRef.current.insert(bacterium);
        }
      });
      
      // Initialize immune cells
      const immuneCellCount = Math.floor(immuneCompetence / 10);
      const cellTypes: CellType[] = ['neutrophil', 'macrophage', 'tcell', 'bcell'];
      
      for (let i = 0; i < immuneCellCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * VESSEL_RADIUS * 0.8;
        
        const cell: ImmuneCell = {
          id: Math.random(),
          type: cellTypes[Math.floor(Math.random() * cellTypes.length)],
          x: Math.random() * canvasDimensions.width,
          y: VESSEL_CENTER_Y + r * Math.sin(angle),
          z: r * Math.cos(angle),
          vx: bloodFlowRate * 0.8 + (Math.random() - 0.5),
          vy: (Math.random() - 0.5) * 0.3,
          health: 100,
          activation: 0,
          phagocytosedCount: 0,
          cytokineProduction: 0,
          age: 0,
          maturation: Math.random()
        };
        
        immuneCells.push(cell);
      }
      
      // Initialize atherosclerotic plaques if enabled
      if (atherosclerosisLevel > 0) {
        const plaqueCount = Math.floor(atherosclerosisLevel / 20);
        for (let i = 0; i < plaqueCount; i++) {
          const deposit: FatDeposit = {
            id: Math.random(),
            x: Math.random() * canvasDimensions.width,
            y: VESSEL_CENTER_Y + (Math.random() > 0.5 ? 1 : -1) * (VESSEL_RADIUS - 20),
            size: 10 + Math.random() * 20,
            oxidized: Math.random() > 0.5,
            foamCells: Math.floor(Math.random() * 5),
            plaque: true,
            ruptureRisk: atherosclerosisLevel / 100
          };
          fatDeposits.push(deposit);
        }
      }
      
      bacteriaRef.current = bacteria;
      immuneCellsRef.current = immuneCells;
      fatDepositsRef.current = fatDeposits;
      antibodiesRef.current = [];
      bloodClotsRef.current = [];
      phagesRef.current = [];
      cytokinesRef.current = [];
      strainMapRef.current.clear();
      
      rheologyRef.current = {
        viscosity: 1.0,
        shearRate: 100,
        hematocrit: 0.45,
        fibrinogenLevel: 3.0,
        plateletActivation: 0
      };
      
      setSimulationTime(0);
      setError(null);
      frameCountRef.current = 0;
    }, 'initialization');
  }, [selectedSpecies, initialBacterialLoad, bloodFlowRate, immuneCompetence, atherosclerosisLevel, canvasDimensions]);

  // ============= UPDATE WITH IMMUNE SYSTEM =============
  const updateSimulation = useCallback(() => {
    safeUpdate(() => {
      frameCountRef.current++;
      const bacteria = bacteriaRef.current;
      const immuneCells = immuneCellsRef.current;
      const deltaTime = speed;
      
      // Update FPS
      const now = performance.now();
      if (frameCountRef.current % 30 === 0) {
        const delta = now - lastFrameTimeRef.current;
        setFps(Math.round(30000 / delta));
        lastFrameTimeRef.current = now;
      }
      
      // Rebuild octree
      octreeRef.current.clear();
      bacteria.forEach(b => octreeRef.current.insert(b));
      immuneCells.forEach(c => octreeRef.current.insert(c));
      
      // Update immune cells
      immuneCells.forEach((cell, idx) => {
        // Move
        cell.x += cell.vx * deltaTime / rheologyRef.current.viscosity;
        cell.y += cell.vy * deltaTime / rheologyRef.current.viscosity;
        if (cell.x > canvasDimensions.width) cell.x = 0;
        
        // Find nearby bacteria
        const nearbyBacteria = octreeRef.current.query({
          x: cell.x,
          y: cell.y,
          z: cell.z || 0,
          radius: 30
        }).filter(e => e.strain) as EnhancedBacterium[];
        
        if (nearbyBacteria.length > 0) {
          cell.activation = Math.min(1, cell.activation + 0.1 * deltaTime);
          
          // Neutrophils and macrophages phagocytose
          if ((cell.type === 'neutrophil' || cell.type === 'macrophage') && Math.random() < cell.activation * deltaTime) {
            const target = nearbyBacteria[0];
            target.health -= 20;
            cell.phagocytosedCount++;
            
            // Produce cytokines
            cytokinesRef.current.push({
              x: cell.x,
              y: cell.y,
              z: cell.z,
              type: 'IL1',
              intensity: 0.5,
              radius: 30,
              age: 0
            });
          }
          
          // B cells produce antibodies
          if (cell.type === 'bcell' && cell.maturation > 0.8) {
            antibodiesRef.current.push({
              id: Math.random(),
              type: 'IgG',
              x: cell.x,
              y: cell.y,
              specificity: nearbyBacteria[0].strain.parentSpecies,
              opsonizing: true,
              concentration: 1
            });
          }
        } else {
          cell.activation *= 0.95;
        }
        
        // Cell death
        cell.age += deltaTime;
        if (cell.health <= 0 || (cell.type === 'neutrophil' && cell.age > 300)) {
          immuneCells.splice(idx, 1);
        }
      });
      
      // Update bacteria (existing code with modifications)
      for (let i = bacteria.length - 1; i >= 0; i--) {
        const bacterium = bacteria[i];
        const profile = BACTERIAL_PROFILES[bacterium.strain.parentSpecies];
        
        // Check for antibody binding
        antibodiesRef.current.forEach(ab => {
          if (ab.specificity === bacterium.strain.parentSpecies && !bacterium.opsonized) {
            const dist = Math.sqrt(Math.pow(ab.x - bacterium.x, 2) + Math.pow(ab.y - bacterium.y, 2));
            if (dist < 20) {
              bacterium.opsonized = true;
              ab.boundTo = bacterium.id;
            }
          }
        });
        
        // Opsonized bacteria are easier targets
        if (bacterium.opsonized) {
          bacterium.health -= 2 * deltaTime;
        }
        
        // Continue with existing bacteria update logic...
        bacterium.age += deltaTime / 60;
        bacterium.stressLevel *= 0.99;
        
        if (!bacterium.adherent) {
          const viscosityFactor = 1 / rheologyRef.current.viscosity;
          bacterium.x += bacterium.vx * deltaTime * viscosityFactor;
          bacterium.y += bacterium.vy * deltaTime * viscosityFactor;
          
          if (bacterium.x > canvasDimensions.width) bacterium.x = 0;
          
          const distFromCenter = Math.sqrt(
            Math.pow(bacterium.y - VESSEL_CENTER_Y, 2) + 
            Math.pow(bacterium.z, 2)
          );
          
          if (distFromCenter > VESSEL_RADIUS - 10) {
            bacterium.y = VESSEL_CENTER_Y + (VESSEL_RADIUS - 15) * Math.sin(Math.atan2(bacterium.y - VESSEL_CENTER_Y, bacterium.z));
            bacterium.vy *= -0.5;
          }
        }
        
        if (bacterium.health <= 0) {
          bacteria.splice(i, 1);
        }
      }
      
      // Check for clot formation
      if (rheologyRef.current.plateletActivation > 0.7 && bloodClotsRef.current.length < 3) {
        const clot: BloodClot = {
          id: Math.random(),
          x: Math.random() * canvasDimensions.width,
          y: VESSEL_CENTER_Y + (Math.random() > 0.5 ? 1 : -1) * (VESSEL_RADIUS * 0.8),
          radius: 20 + Math.random() * 30,
          components: new Map([
            ['fibrin', 0.4],
            ['platelet', 0.3],
            ['rbc', 0.3]
          ]),
          occlusion: 0.3 + Math.random() * 0.4,
          age: 0,
          stable: false
        };
        bloodClotsRef.current.push(clot);
      }
      
      updateStats();
      setSimulationTime(prev => prev + deltaTime);
    }, 'simulation update');
  }, [speed, canvasDimensions]);

  const updateStats = useCallback(() => {
    // Existing stats calculation...
    const bacteria = bacteriaRef.current;
    const immuneCells = immuneCellsRef.current;
    
    let dominantStrain = '';
    let maxCount = 0;
    strainMapRef.current.forEach((count, strainId) => {
      if (count > maxCount) {
        maxCount = count;
        dominantStrain = strainId;
      }
    });
    
    const clottingRisk = Math.min(
      rheologyRef.current.fibrinogenLevel / 10 * rheologyRef.current.plateletActivation,
      1.0
    ) + bloodClotsRef.current.reduce((sum, clot) => sum + clot.occlusion, 0) / 10;
    
    const bacterialLoad = bacteria.length;
    const cytokineStorm = immuneResponseRef.current.cytokineProfile.proInflammatory > 50;
    
    setStats({
      totalBacteria: bacterialLoad,
      uniqueStrains: strainMapRef.current.size,
      dominantStrain: dominantStrain ? dominantStrain.substring(0, 15) + '...' : '',
      averageResistance: 0,
      biofilmCoverage: bacteria.filter(b => b.biofilm).length / Math.max(1, bacteria.filter(b => b.adherent).length) * 100,
      phageCount: phagesRef.current.length,
      lysogenicBacteria: bacteria.filter(b => b.prophage).length,
      viscosity: rheologyRef.current.viscosity,
      sepsisScore: calculateSepsisScore(bacterialLoad, cytokineStorm, simulationTime, clottingRisk),
      bacteremia: bacterialLoad > 10,
      clottingRisk: clottingRisk * 100,
      cytokineStorm
    });
  }, [simulationTime]);

  // ============= OPTIMIZED RENDERING =============
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    
    // Draw vessel
    const viscosityColor = Math.floor(255 - (rheologyRef.current.viscosity - 1) * 200);
    ctx.strokeStyle = `rgb(${74}, ${viscosityColor / 3}, ${viscosityColor / 3})`;
    ctx.lineWidth = 3 + rheologyRef.current.viscosity;
    ctx.beginPath();
    ctx.moveTo(0, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.lineTo(canvasDimensions.width, VESSEL_CENTER_Y - VESSEL_RADIUS);
    ctx.moveTo(0, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.lineTo(canvasDimensions.width, VESSEL_CENTER_Y + VESSEL_RADIUS);
    ctx.stroke();
    
    // Draw fat deposits / atherosclerotic plaques
    fatDepositsRef.current.forEach(deposit => {
      ctx.save();
      const gradient = ctx.createRadialGradient(deposit.x, deposit.y, 0, deposit.x, deposit.y, deposit.size);
      gradient.addColorStop(0, deposit.oxidized ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 235, 59, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 235, 59, 0.1)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(deposit.x, deposit.y, deposit.size, 0, Math.PI * 2);
      ctx.fill();
      
      if (deposit.plaque) {
        ctx.strokeStyle = 'rgba(255, 193, 7, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    });
    
    // Draw blood clots
    bloodClotsRef.current.forEach(clot => {
      ctx.save();
      const gradient = ctx.createRadialGradient(clot.x, clot.y, 0, clot.x, clot.y, clot.radius);
      gradient.addColorStop(0, 'rgba(139, 0, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(178, 34, 34, 0.6)');
      gradient.addColorStop(1, 'rgba(220, 20, 60, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(clot.x, clot.y, clot.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Show occlusion
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.lineWidth = clot.occlusion * 5;
      ctx.stroke();
      ctx.restore();
    });
    
    // Draw immune cells
    immuneCellsRef.current.forEach(cell => {
      ctx.save();
      ctx.globalAlpha = cell.health / 100;
      
      // Different colors for different cell types
      const colors = {
        neutrophil: '#87CEEB',
        macrophage: '#4682B4',
        tcell: '#9370DB',
        bcell: '#DA70D6',
        platelet: '#FFB6C1',
        dendritic: '#DDA0DD',
        rbc: '#DC143C'
      };
      
      ctx.fillStyle = colors[cell.type] || '#FFFFFF';
      
      // Activated cells have a glow
      if (cell.activation > 0.5) {
        ctx.shadowBlur = 10 * cell.activation;
        ctx.shadowColor = colors[cell.type];
      }
      
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, cell.type === 'macrophage' ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw bacteria
    bacteriaRef.current.forEach(bacterium => {
      const distFromCenter = Math.sqrt(
        Math.pow(bacterium.y - VESSEL_CENTER_Y, 2) + 
        Math.pow(bacterium.z, 2)
      );
      
      if (distFromCenter < VESSEL_RADIUS + 10) {
        ctx.save();
        ctx.globalAlpha = bacterium.health / 100;
        ctx.fillStyle = bacterium.strain.color;
        
        if (bacterium.opsonized) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(bacterium.x, bacterium.y, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        const size = BACTERIAL_PROFILES[bacterium.strain.parentSpecies].size;
        ctx.beginPath();
        ctx.arc(bacterium.x, bacterium.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    
    // Draw antibodies as small Y shapes
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    antibodiesRef.current.forEach(ab => {
      ctx.beginPath();
      ctx.moveTo(ab.x, ab.y - 3);
      ctx.lineTo(ab.x - 2, ab.y);
      ctx.moveTo(ab.x, ab.y - 3);
      ctx.lineTo(ab.x + 2, ab.y);
      ctx.lineTo(ab.x, ab.y + 3);
      ctx.stroke();
    });
    
  }, [canvasDimensions]);

  // ============= ANIMATION LOOP =============
  const animate = useCallback(() => {
    updateSimulation();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateSimulation, render]);

  // ============= EFFECTS =============
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, animate]);

  const handleReset = () => {
    setIsRunning(false);
    initializeSimulation();
    setSimulationTime(0);
  };

  // ============= RENDER UI =============
  return (
    <SimulationErrorBoundary onReset={handleReset}>
      <div style={{
        width: '100%',
        maxWidth: '1920px',
        margin: '0 auto',
        background: isDark ? '#0a0a0a' : '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Bar */}
        <div style={{
          padding: '0.5rem 1rem',
          background: isDark ? '#111' : '#fff',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Microscope size={20} />
            Advanced Bacteremia Simulator
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              FPS: {fps} | Entities: {bacteriaRef.current.length + immuneCellsRef.current.length}
            </span>
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
          gap: '1rem'
        }}>
          {/* Canvas and Controls */}
          <div id="simulation-container" style={{
            position: 'relative',
            background: isDark ? '#0f0f0f' : '#f9f9f9',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid rgba(59, 130, 246, 0.3)'
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
            
            {/* Overlay Controls */}
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '0.75rem',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <button onClick={() => setIsRunning(!isRunning)} style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}>
                {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
              </button>
              <button onClick={handleReset} style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}>
                <RefreshCw size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <Zap size={14} />
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ width: '80px' }}
                />
                <span>{speed}x</span>
              </div>
            </div>
            
            {/* Mini Stats Overlay */}
            {showMiniMap && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '0.75rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                minWidth: '200px',
                fontSize: '0.75rem',
                color: '#fff'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#3b82f6' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Hour {Math.floor(simulationTime / 60)}
                </div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bacteria:</span>
                    <span style={{ color: '#ef4444' }}>{stats.totalBacteria}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Immune:</span>
                    <span style={{ color: '#3b82f6' }}>{immuneCellsRef.current.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sepsis:</span>
                    <span style={{ 
                      color: stats.sepsisScore > 75 ? '#ef4444' : 
                             stats.sepsisScore > 50 ? '#f59e0b' : '#22c55e'
                    }}>
                      {stats.sepsisScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Patient Panel */}
          <div style={{
            background: isDark ? '#0f0f0f' : '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                color: '#3b82f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={16} />
                Patient Vitals & System Status
              </span>
              {isPanelCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            
            {!isPanelCollapsed && (
              <div style={{
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {/* Vital Signs */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#3b82f6' }}>
                    Vital Signs
                  </h3>
                  <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.75rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>HR:</span>
                      <span style={{ color: patientVitals.heartRate > 100 ? '#f59e0b' : '#fff' }}>
                        {patientVitals.heartRate} bpm
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>BP:</span>
                      <span>{patientVitals.bloodPressure.systolic}/{patientVitals.bloodPressure.diastolic}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Temp:</span>
                      <span style={{ color: patientVitals.temperature > 38 ? '#ef4444' : '#fff' }}>
                        {patientVitals.temperature}°C
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SpO₂:</span>
                      <span style={{ color: patientVitals.oxygenSaturation < 95 ? '#f59e0b' : '#fff' }}>
                        {patientVitals.oxygenSaturation}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lab Values */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#8b5cf6' }}>
                    Lab Values
                  </h3>
                  <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.75rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>WBC:</span>
                      <span style={{ color: patientVitals.whiteBloodCells > 11 ? '#f59e0b' : '#fff' }}>
                        {patientVitals.whiteBloodCells} ×10⁹/L
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CRP:</span>
                      <span style={{ color: patientVitals.crp > 10 ? '#ef4444' : '#fff' }}>
                        {patientVitals.crp} mg/L
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>PCT:</span>
                      <span>{patientVitals.procalcitonin} ng/mL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lactate:</span>
                      <span style={{ color: patientVitals.lactate > 2 ? '#ef4444' : '#fff' }}>
                        {patientVitals.lactate} mmol/L
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#22c55e' }}>
                    System Status
                  </h3>
                  <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.75rem', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Clotting Risk:</span>
                      <span style={{ color: stats.clottingRisk > 50 ? '#ef4444' : '#fff' }}>
                        {stats.clottingRisk.toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Viscosity:</span>
                      <span>{stats.viscosity.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Immune Response:</span>
                      <span>{immuneCellsRef.current.length} cells</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Antibodies:</span>
                      <span>{antibodiesRef.current.length}</span>
                    </div>
                  </div>
                </div>

                {/* Overall Health */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '4px'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#ef4444' }}>
                    Overall Health
                  </h3>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: getHealthColor(patientVitals.overallHealth, { good: 70, warning: 40 })
                  }}>
                    {patientVitals.overallHealth}%
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: `${patientVitals.overallHealth}%`,
                      height: '100%',
                      background: getHealthColor(patientVitals.overallHealth, { good: 70, warning: 40 }),
                      transition: 'all 0.5s ease'
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control Tabs */}
          <div style={{
            background: isDark ? '#0f0f0f' : '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '1rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
              paddingBottom: '0.5rem'
            }}>
              {['overview', 'microbiology', 'therapy', 'immune'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    background: activeTab === tab ? 'rgba(59, 130, 246, 0.2)' : 'none',
                    border: 'none',
                    color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div style={{ fontSize: '0.875rem', color: isDark ? '#e2e8f0' : '#1f2937' }}>
                <h3 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>Simulation Overview</h3>
                <p style={{ marginBottom: '0.5rem' }}>
                  Advanced bacteremia simulation with immune response, clot formation, and atherosclerosis modeling.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <strong>Features:</strong>
                    <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                      <li>Multiple immune cell types</li>
                      <li>Antibody production</li>
                      <li>Blood clot formation</li>
                      <li>Atherosclerotic plaques</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem' }}>
                      <li>Hour: {Math.floor(simulationTime / 60)}</li>
                      <li>Bacteria: {stats.totalBacteria}</li>
                      <li>Immune cells: {immuneCellsRef.current.length}</li>
                      <li>Clots: {bloodClotsRef.current.length}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'microbiology' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
                    Initial CFU/mL: {initialBacterialLoad}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={initialBacterialLoad}
                    onChange={(e) => setInitialBacterialLoad(Number(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontWeight: 600, fontSize: '0.875rem' }}>
                    Select Pathogens
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(BACTERIAL_PROFILES).map(([species, profile]) => (
                      <label key={species} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: selectedSpecies.includes(species as BacterialSpecies) ? 
                          'rgba(59, 130, 246, 0.1)' : 'transparent',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedSpecies.includes(species as BacterialSpecies)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSpecies([...selectedSpecies, species as BacterialSpecies]);
                            } else {
                              setSelectedSpecies(selectedSpecies.filter(s => s !== species));
                            }
                          }}
                        />
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: profile.color
                        }} />
                        <div style={{ color: isDark ? '#fff' : '#000' }}>{profile.name}</div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'immune' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
                    Immune Competence: {immuneCompetence}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={immuneCompetence}
                    onChange={(e) => setImmuneCompetence(Number(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: isDark ? '#e2e8f0' : '#1f2937', fontSize: '0.875rem' }}>
                    Atherosclerosis Level: {atherosclerosisLevel}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={atherosclerosisLevel}
                    onChange={(e) => setAtherosclerosisLevel(Number(e.target.value))}
                    disabled={isRunning}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#4b5563' }}>
                  <p>Immune system features:</p>
                  <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                    <li>Neutrophils: Phagocytose bacteria</li>
                    <li>Macrophages: Engulf pathogens and debris</li>
                    <li>T cells: Coordinate immune response</li>
                    <li>B cells: Produce antibodies</li>
                    <li>Antibodies: Opsonize bacteria for destruction</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            maxWidth: '300px',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <strong>Error</strong>
            </div>
            <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
            <button
              onClick={() => setError(null)}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.75rem'
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