import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Microscope,
  Beaker,
  Dna,
  GitBranch,
  Activity,
  Shield,
  Waves,
  AlertTriangle,
  Plus,
  Zap,
  Info,
  TrendingUp,
} from "lucide-react";

// Types & Constants
type BacteriumType = "ecoli" | "bacillus" | "coccus" | "spirillum" | "vibrio";
type PhageType = "lambda" | "T4" | "T7" | "P1";

interface Gene {
  id: string;
  type: 'resistance' | 'virulence' | 'metabolic' | 'regulatory';
  name: string;
  effect: number;
}

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
  pili: Array<{ x: number; y: number; length: number; angle: number }>;
  color: string;
  size: number;
  energy: number;
  dead: boolean;
  genes: Gene[];
  growthPhase: 'lag' | 'exponential' | 'stationary' | 'death';
  biofilmMember: boolean;
  antibioticResistance: number;
  stress: number;
  metabolicRate: number;
  generation: number;
  mutations: number;
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
  lifecycle: 'searching' | 'attaching' | 'injecting' | 'replicating';
}

interface Nutrient {
  id: number;
  x: number;
  y: number;
  value: number;
  type: "glucose" | "amino" | "vitamin" | "iron" | "phosphate";
  color: string;
  consumed: boolean;
  concentration: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'nutrient' | 'protein' | 'dna' | 'waste' | 'signal';
  glow?: boolean;
}

interface Biofilm {
  x: number;
  y: number;
  radius: number;
  members: Set<number>;
  age: number;
}

const BACTERIA_TYPES = {
  ecoli: { color: "#22c55e", size: 20, shape: "rod", divisionRate: 0.03, speed: 1.5, name: "E. coli", flagellaCount: 4 },
  bacillus: { color: "#3b82f6", size: 25, shape: "rod", divisionRate: 0.02, speed: 1.0, name: "Bacillus", flagellaCount: 2 },
  coccus: { color: "#f59e0b", size: 15, shape: "sphere", divisionRate: 0.04, speed: 0.8, name: "Staphylococcus", flagellaCount: 0 },
  spirillum: { color: "#a78bfa", size: 18, shape: "spiral", divisionRate: 0.025, speed: 2.0, name: "Spirillum", flagellaCount: 6 },
  vibrio: { color: "#ec4899", size: 17, shape: "comma", divisionRate: 0.035, speed: 1.8, name: "Vibrio", flagellaCount: 1 },
} as const;

const PHAGE_TYPES = {
  lambda: { color: "#ef4444", size: 8, tailLength: 12, burstSize: 50, latency: 150, name: "λ Phage" },
  T4: { color: "#dc2626", size: 10, tailLength: 15, burstSize: 100, latency: 200, name: "T4 Phage" },
  T7: { color: "#b91c1c", size: 7, tailLength: 10, burstSize: 30, latency: 100, name: "T7 Phage" },
  P1: { color: "#991b1b", size: 9, tailLength: 14, burstSize: 70, latency: 180, name: "P1 Phage" },
} as const;

// Helper Functions
const hexToRgba = (hex: string, alpha = 1) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};


export default function EnhancedBacteriaSimulation({ isDark = false, isRunning: externalRunning = true, speed: externalSpeed = 1 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWidth = 1200;
  const canvasHeight = 675;
  
  // Simulation state refs
  const bacteriaRef = useRef<Bacterium[]>([]);
  const phagesRef = useRef<Phage[]>([]);
  const nutrientsRef = useRef<Nutrient[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const biofilmsRef = useRef<Biofilm[]>([]);
  const nextIdRef = useRef(1);
  const tickRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  
  // UI State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [viewMode, setViewMode] = useState<"normal" | "fluorescent" | "phase" | "darkfield">("normal");
  const [activeTab, setActiveTab] = useState<"environment" | "genetics" | "interactions">("environment");
  
  // Environmental parameters
  const [temperature, setTemperature] = useState(37);
  const [pH, setPH] = useState(7);
  const [oxygenLevel, setOxygenLevel] = useState(80);
  const [nutrientDensity, setNutrientDensity] = useState(50);
  const [antibioticLevel, setAntibioticLevel] = useState(0);
  const [uvRadiation, setUvRadiation] = useState(0);
  
  // Biological switches
  const [quorumSensing, setQuorumSensing] = useState(true);
  const [horizontalGeneTransfer, setHorizontalGeneTransfer] = useState(true);
  const [biofilmFormation, setBiofilmFormation] = useState(false);
  const [phageTherapy, setPhageTherapy] = useState(false);
  const [chemotaxis, setChemotaxis] = useState(true);
  const [adaptiveEvolution, setAdaptiveEvolution] = useState(true);
  
  // Statistics
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
    avgFitness: 0,
    biofilmCoverage: 0,
  });
  
  // Generate random genes for bacteria
  const generateGenes = (): Gene[] => {
    const genes: Gene[] = [];
    const geneTypes = ['resistance', 'virulence', 'metabolic', 'regulatory'] as const;
    
    for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
      genes.push({
        id: `gene_${Math.random().toString(36).substr(2, 9)}`,
        type: geneTypes[Math.floor(Math.random() * geneTypes.length)],
        name: `Gene-${i}`,
        effect: Math.random(),
      });
    }
    
    return genes;
  };
  
  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    const bacteria: Bacterium[] = [];
    const types = Object.keys(BACTERIA_TYPES) as BacteriumType[];
    
    for (let i = 0; i < 40; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const cfg = BACTERIA_TYPES[type];
      
      bacteria.push({
        id: nextIdRef.current++,
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
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
        flagella: cfg.flagellaCount > 0,
        pili: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
          x: Math.random() * cfg.size,
          y: Math.random() * cfg.size,
          length: 5 + Math.random() * 10,
          angle: Math.random() * Math.PI * 2,
        })),
        color: cfg.color,
        size: cfg.size,
        energy: 70 + Math.random() * 30,
        dead: false,
        genes: generateGenes(),
        growthPhase: 'lag',
        biofilmMember: false,
        antibioticResistance: Math.random() * 0.2,
        stress: 0,
        metabolicRate: 0.8 + Math.random() * 0.4,
        generation: 0,
        mutations: 0,
      });
    }
    
    bacteriaRef.current = bacteria;
    
    // Create initial nutrients
    const nutrients: Nutrient[] = [];
    const nutrientTypes = ["glucose", "amino", "vitamin", "iron", "phosphate"] as const;
    const nutrientColors = {
      glucose: "#fbbf24",
      amino: "#34d399",
      vitamin: "#f472b6",
      iron: "#f87171",
      phosphate: "#60a5fa",
    };
    
    for (let i = 0; i < nutrientDensity; i++) {
      const type = nutrientTypes[Math.floor(Math.random() * nutrientTypes.length)];
      nutrients.push({
        id: nextIdRef.current++,
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        value: 15 + Math.random() * 25,
        type,
        color: nutrientColors[type],
        consumed: false,
        concentration: 0.5 + Math.random() * 0.5,
      });
    }
    
    nutrientsRef.current = nutrients;
    phagesRef.current = [];
    particlesRef.current = [];
    biofilmsRef.current = [];
    tickRef.current = 0;
    
    updateStats();
  }, [nutrientDensity]);
  
  // Update statistics
  const updateStats = useCallback(() => {
    const bacteria = bacteriaRef.current;
    const totalBacteria = bacteria.length;
    const healthyBacteria = bacteria.filter(b => !b.infected && !b.dead).length;
    const infectedBacteria = bacteria.filter(b => b.infected && !b.dead).length;
    const deadBacteria = bacteria.filter(b => b.dead).length;
    
    const avgResistance = bacteria.reduce((sum, b) => sum + b.resistance, 0) / (totalBacteria || 1);
    const avgFitness = bacteria.reduce((sum, b) => sum + (b.health * b.energy) / 10000, 0) / (totalBacteria || 1);
    
    const biofilmCoverage = biofilmsRef.current.reduce((sum, bf) => 
      sum + (Math.PI * bf.radius * bf.radius), 0) / (canvasWidth * canvasHeight) * 100;
    
    // Calculate biodiversity
    const typeCount = new Map<string, number>();
    bacteria.forEach(b => {
      if (!b.dead) {
        typeCount.set(b.type, (typeCount.get(b.type) || 0) + 1);
      }
    });
    
    let shannonIndex = 0;
    const livingBacteria = totalBacteria - deadBacteria;
    if (livingBacteria > 0) {
      typeCount.forEach(count => {
        if (count > 0) {
          const p = count / livingBacteria;
          shannonIndex -= p * Math.log(p);
        }
      });
    }
    
    setStats({
      totalBacteria,
      healthyBacteria,
      infectedBacteria,
      deadBacteria,
      totalPhages: phagesRef.current.length,
      nutrients: nutrientsRef.current.filter(n => !n.consumed).length,
      biodiversity: shannonIndex,
      resistanceLevel: avgResistance * 100,
      generationNumber: Math.floor(tickRef.current / 500),
      avgFitness,
      biofilmCoverage,
    });
  }, []);
  
  // Main simulation update
  const updateSimulation = useCallback((dt: number) => {
    // Environmental effects
    const tempEffect = Math.max(0.1, 1 - Math.abs(temperature - 37) / 50);
    const phEffect = Math.max(0.1, 1 - Math.abs(pH - 7) / 7);
    const oxygenEffect = Math.max(0.1, oxygenLevel / 100);
    const environmentalStress = Math.min(1, 1 - (tempEffect * phEffect * oxygenEffect));
    
    // Update bacteria
    bacteriaRef.current = bacteriaRef.current.filter(bacterium => {
      if (bacterium.dead) {
        bacterium.size *= 0.98;
        return bacterium.size > 1;
      }
      
      // Update growth phase
      if (bacterium.age < 50) {
        bacterium.growthPhase = 'lag';
      } else if (bacterium.energy > 60 && nutrientsRef.current.length > 20) {
        bacterium.growthPhase = 'exponential';
      } else if (bacterium.energy > 30) {
        bacterium.growthPhase = 'stationary';
      } else {
        bacterium.growthPhase = 'death';
      }
      
      // Metabolic processes
      bacterium.age += dt;
      bacterium.energy = Math.max(0, bacterium.energy - (0.1 + environmentalStress * 0.2) * bacterium.metabolicRate * dt);
      bacterium.stress = Math.min(1, bacterium.stress + environmentalStress * 0.01);
      
      // Antibiotic damage
      if (antibioticLevel > 0) {
        const damage = antibioticLevel * (1 - bacterium.antibioticResistance) * 0.5 * dt;
        bacterium.health = Math.max(0, bacterium.health - damage);
        
        // Adaptive resistance
        if (adaptiveEvolution && Math.random() < 0.001 * antibioticLevel) {
          bacterium.antibioticResistance = Math.min(1, bacterium.antibioticResistance + 0.1);
          bacterium.mutations++;
        }
      }
      
      // UV radiation damage
      if (uvRadiation > 0) {
        const uvDamage = uvRadiation * 0.3 * dt;
        bacterium.health = Math.max(0, bacterium.health - uvDamage);
        
        if (Math.random() < uvRadiation * 0.001) {
          bacterium.mutations++;
        }
      }
      
      // Movement
      if (!bacterium.biofilmMember && bacterium.flagella) {
        // Chemotaxis
        if (chemotaxis) {
          let closestNutrient: Nutrient | null = null;
          let minDist = Infinity;
          
          nutrientsRef.current.forEach((nutrient) => {
            if (!nutrient.consumed) {
              const dist = Math.hypot(nutrient.x - bacterium.x, nutrient.y - bacterium.y);
              if (dist < minDist && dist < 150) {
                minDist = dist;
                closestNutrient = nutrient;
              }
            }
          });

         if (closestNutrient !== null) {
            const angle = Math.atan2(
              (closestNutrient as Nutrient).y - bacterium.y,
              (closestNutrient as Nutrient).x - bacterium.x
            );
          }
        }
        
        // Random tumbling
        if (Math.random() < 0.02) {
          const tumbleAngle = Math.random() * Math.PI * 2;
          bacterium.vx = Math.cos(tumbleAngle) * BACTERIA_TYPES[bacterium.type].speed;
          bacterium.vy = Math.sin(tumbleAngle) * BACTERIA_TYPES[bacterium.type].speed;
        }
        
        // Apply velocity with bounds
        const maxSpeed = BACTERIA_TYPES[bacterium.type].speed * tempEffect * (2 - bacterium.stress);
        const currentSpeed = Math.hypot(bacterium.vx, bacterium.vy);
        if (currentSpeed > maxSpeed) {
          bacterium.vx = (bacterium.vx / currentSpeed) * maxSpeed;
          bacterium.vy = (bacterium.vy / currentSpeed) * maxSpeed;
        }
        
        bacterium.x += bacterium.vx * dt;
        bacterium.y += bacterium.vy * dt;
        bacterium.angle += bacterium.angularVelocity * dt;
        
        // Boundary collision
        if (bacterium.x < bacterium.size || bacterium.x > canvasWidth - bacterium.size) {
          bacterium.vx *= -0.8;
          bacterium.x = Math.max(bacterium.size, Math.min(canvasWidth - bacterium.size, bacterium.x));
        }
        if (bacterium.y < bacterium.size || bacterium.y > canvasHeight - bacterium.size) {
          bacterium.vy *= -0.8;
          bacterium.y = Math.max(bacterium.size, Math.min(canvasHeight - bacterium.size, bacterium.y));
        }
      }
      
      // Nutrient consumption
      nutrientsRef.current.forEach(nutrient => {
        if (!nutrient.consumed) {
          const dist = Math.hypot(nutrient.x - bacterium.x, nutrient.y - bacterium.y);
          if (dist < bacterium.size + 5) {
            nutrient.consumed = true;
            bacterium.energy = Math.min(100, bacterium.energy + nutrient.value);
            bacterium.health = Math.min(100, bacterium.health + nutrient.value * 0.5);
            
            // Create absorption particles
            for (let i = 0; i < 3; i++) {
              particlesRef.current.push({
                x: nutrient.x,
                y: nutrient.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 30,
                color: nutrient.color,
                size: 2,
                type: 'nutrient',
                glow: true,
              });
            }
          }
        }
      });
      
      // Cell division
      if (bacterium.growthPhase === 'exponential' && 
          bacterium.energy > 80 && 
          bacterium.health > 60 && 
          !bacterium.infected) {
        bacterium.divisionTimer -= dt;
        
        if (bacterium.divisionTimer <= 0) {
          // Binary fission - create daughter cell
          const daughter: Bacterium = {
            ...bacterium,
            id: nextIdRef.current++,
            x: bacterium.x + (Math.random() - 0.5) * 20,
            y: bacterium.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            energy: bacterium.energy / 2,
            health: bacterium.health * 0.9,
            age: 0,
            divisionTimer: 150 + Math.random() * 100,
            generation: bacterium.generation + 1,
            genes: [...bacterium.genes],
            mutations: bacterium.mutations,
          };
          
          // Chance of mutation during division
          if (adaptiveEvolution && Math.random() < 0.05) {
            daughter.mutations++;
            if (Math.random() < 0.5) {
              daughter.resistance = Math.min(1, daughter.resistance + 0.1);
            } else {
              daughter.metabolicRate *= 0.9 + Math.random() * 0.2;
            }
          }
          
          bacterium.energy /= 2;
          bacterium.divisionTimer = 150 + Math.random() * 100;
          bacteriaRef.current.push(daughter);
        }
      }
      
      // Horizontal gene transfer
      if (horizontalGeneTransfer && bacterium.pili && bacterium.pili.length > 0) {
        bacteriaRef.current.forEach(other => {
          if (other.id !== bacterium.id && !other.dead) {
            const dist = Math.hypot(other.x - bacterium.x, other.y - bacterium.y);
            if (dist < 40 && Math.random() < 0.001) {
              if (bacterium.antibioticResistance > other.antibioticResistance) {
                other.antibioticResistance = (other.antibioticResistance + bacterium.antibioticResistance) / 2;
                
                // Visualize gene transfer
                particlesRef.current.push({
                  x: bacterium.x,
                  y: bacterium.y,
                  vx: (other.x - bacterium.x) / 20,
                  vy: (other.y - bacterium.y) / 20,
                  life: 20,
                  color: '#fbbf24',
                  size: 3,
                  type: 'dna',
                  glow: true,
                });
              }
            }
          }
        });
      }
      
      // Phage infection progression
      if (bacterium.infected) {
        bacterium.health -= 0.3 * dt;
        bacterium.lysisTimer = (bacterium.lysisTimer ?? 100) - dt;
        
        if ((bacterium.lysisTimer ?? 0) <= 0 || bacterium.health <= 0) {
          // Lytic burst
          bacterium.dead = true;
          const burstSize = Math.max(5, bacterium.phageCount * 5);
          
          for (let i = 0; i < burstSize; i++) {
            const angle = (Math.PI * 2 * i) / burstSize;
            const speed = 1 + Math.random() * 2;
            phagesRef.current.push({
              id: nextIdRef.current++,
              x: bacterium.x,
              y: bacterium.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              attached: false,
              injected: false,
              type: "T4",
              size: PHAGE_TYPES.T4.size,
              color: PHAGE_TYPES.T4.color,
              tailLength: PHAGE_TYPES.T4.tailLength,
              angle,
              lifecycle: 'searching',
            });
          }
          
          // Lysis particles
          for (let p = 0; p < 10; p++) {
            particlesRef.current.push({
              x: bacterium.x,
              y: bacterium.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 30,
              color: '#ef4444',
              size: 1 + Math.random(),
              type: 'waste',
              glow: true,
            });
          }
        }
      }
      
      // Natural death
      if (bacterium.energy <= 0 || bacterium.health <= 0 || bacterium.age > 3000) {
        bacterium.dead = true;
      }
      
      return true;
    });
    
    // Update phages
    phagesRef.current = phagesRef.current.filter(phage => {
      switch (phage.lifecycle) {
        case 'searching':
          // Brownian motion
          phage.vx += (Math.random() - 0.5) * 0.5;
          phage.vy += (Math.random() - 0.5) * 0.5;
          
          const maxPhageSpeed = 4;
          const phageSpeed = Math.hypot(phage.vx, phage.vy);
          if (phageSpeed > maxPhageSpeed) {
            phage.vx = (phage.vx / phageSpeed) * maxPhageSpeed;
            phage.vy = (phage.vy / phageSpeed) * maxPhageSpeed;
          }
          
          phage.x += phage.vx * dt;
          phage.y += phage.vy * dt;
          phage.angle += 0.1 * dt;
          
          // Boundary bounce
          if (phage.x < 0 || phage.x > canvasWidth) phage.vx *= -1;
          if (phage.y < 0 || phage.y > canvasHeight) phage.vy *= -1;
          
          // Check for bacterial collision
          for (const bacterium of bacteriaRef.current) {
            if (!bacterium.dead && !bacterium.infected) {
              const dist = Math.hypot(bacterium.x - phage.x, bacterium.y - phage.y);
              if (dist < bacterium.size) {
                const attachProbability = 0.7 * (1 - bacterium.resistance);
                if (Math.random() < attachProbability) {
                  phage.lifecycle = 'attaching';
                  phage.targetId = bacterium.id;
                  phage.attachTick = tickRef.current;
                }
                break;
              }
            }
          }
          break;
          
        case 'attaching':
          const target = bacteriaRef.current.find(b => b.id === phage.targetId);
          if (target && !target.dead) {
            const angle = Math.atan2(target.y - phage.y, target.x - phage.x);
            phage.x = target.x + Math.cos(angle) * target.size * 0.8;
            phage.y = target.y + Math.sin(angle) * target.size * 0.8;
            phage.angle = angle + Math.PI / 2;
            
            if (tickRef.current - (phage.attachTick ?? 0) > 30) {
              phage.lifecycle = 'injecting';
            }
          } else {
            phage.lifecycle = 'searching';
            phage.targetId = undefined;
          }
          break;
          
        case 'injecting':
          const host = bacteriaRef.current.find(b => b.id === phage.targetId);
          if (host && !host.dead) {
            host.infected = true;
            host.phageCount++;
            host.lysisTimer = PHAGE_TYPES[phage.type].latency;
            return false; // Remove phage after injection
          } else {
            phage.lifecycle = 'searching';
          }
          break;
      }
      return true;
    });
    
    // Biofilm dynamics
    if (biofilmFormation) {
      const densityThreshold = 5;
      bacteriaRef.current.forEach(bacterium => {
        if (!bacterium.dead && !bacterium.biofilmMember) {
          const nearbyBacteria = bacteriaRef.current.filter(other => 
            !other.dead && 
            Math.hypot(other.x - bacterium.x, other.y - bacterium.y) < 50
          );
          
          if (nearbyBacteria.length >= densityThreshold && Math.random() < 0.01) {
            const biofilm: Biofilm = {
              x: bacterium.x,
              y: bacterium.y,
              radius: 30,
              members: new Set([bacterium.id]),
              age: 0,
            };
            
            bacterium.biofilmMember = true;
            bacterium.resistance += 0.2;
            bacterium.antibioticResistance += 0.3;
            biofilmsRef.current.push(biofilm);
          }
        }
      });
    }
    
    // Update particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      return particle.life > 0;
    });
    
    // Remove consumed nutrients and replenish
    nutrientsRef.current = nutrientsRef.current.filter(n => !n.consumed);
    
    if (tickRef.current % 100 === 0 && nutrientsRef.current.length < nutrientDensity * 0.7) {
      const types = ["glucose", "amino", "vitamin", "iron", "phosphate"] as const;
      const colors = { glucose: "#fbbf24", amino: "#34d399", vitamin: "#f472b6", iron: "#f87171", phosphate: "#60a5fa" };
      
      for (let i = 0; i < 3; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        nutrientsRef.current.push({
          id: nextIdRef.current++,
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          value: 15 + Math.random() * 25,
          type,
          color: colors[type],
          consumed: false,
          concentration: 0.5 + Math.random() * 0.5,
        });
      }
    }
    
    tickRef.current += Math.round(dt);
  }, [temperature, pH, oxygenLevel, antibioticLevel, uvRadiation, chemotaxis, 
      horizontalGeneTransfer, biofilmFormation, adaptiveEvolution, nutrientDensity]);
  
  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    switch (viewMode) {
      case "fluorescent":
        gradient.addColorStop(0, "#000814");
        gradient.addColorStop(1, "#001d3d");
        break;
      case "phase":
        gradient.addColorStop(0, "#0d1117");
        gradient.addColorStop(1, "#161b22");
        break;
      case "darkfield":
        gradient.addColorStop(0, "#000000");
        gradient.addColorStop(1, "#0a0a0a");
        break;
      default:
        gradient.addColorStop(0, "#050a15");
        gradient.addColorStop(1, "#0a1628");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw biofilms
    biofilmsRef.current.forEach(biofilm => {
      ctx.save();
      ctx.globalAlpha = 0.3;
      
      const gradient = ctx.createRadialGradient(
        biofilm.x, biofilm.y, 0,
        biofilm.x, biofilm.y, biofilm.radius
      );
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(biofilm.x, biofilm.y, biofilm.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw nutrients
    nutrientsRef.current.forEach(nutrient => {
      if (nutrient.consumed) return;
      
      ctx.save();
      
      if (viewMode === "fluorescent") {
        ctx.shadowBlur = 8;
        ctx.shadowColor = nutrient.color;
      }
      
      ctx.globalAlpha = nutrient.concentration;
      const gradient = ctx.createRadialGradient(
        nutrient.x, nutrient.y, 0,
        nutrient.x, nutrient.y, nutrient.value
      );
      gradient.addColorStop(0, hexToRgba(nutrient.color, 0.6));
      gradient.addColorStop(1, hexToRgba(nutrient.color, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(nutrient.x, nutrient.y, nutrient.value, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = nutrient.color;
      ctx.beginPath();
      ctx.arc(nutrient.x, nutrient.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Draw bacteria
    bacteriaRef.current.forEach(bacterium => {
      ctx.save();
      ctx.translate(bacterium.x, bacterium.y);
      ctx.rotate(bacterium.angle);
      
      ctx.globalAlpha = bacterium.dead ? 0.3 : Math.min(1, bacterium.health / 100);
      
      const shape = BACTERIA_TYPES[bacterium.type].shape;
      const size = bacterium.size;
      
      // Cell membrane/wall
      if (bacterium.infected) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
      } else if (bacterium.biofilmMember) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = hexToRgba(bacterium.color, 0.3);
        ctx.lineWidth = 1;
      }
      
      // Draw cell shape
      switch (shape) {
        case "rod":
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 0.9, size * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = bacterium.infected ? 
            hexToRgba(bacterium.color, 0.6) : bacterium.color;
          ctx.fill();
          ctx.stroke();
          break;
          
        case "sphere":
          const sphereGradient = ctx.createRadialGradient(
            -size * 0.2, -size * 0.2, 0,
            0, 0, size
          );
          sphereGradient.addColorStop(0, bacterium.color);
          sphereGradient.addColorStop(1, hexToRgba(bacterium.color, 0.4));
          ctx.fillStyle = sphereGradient;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
          
        case "spiral":
          ctx.strokeStyle = bacterium.infected ? '#ef4444' : bacterium.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let t = 0; t < Math.PI * 4; t += 0.2) {
            const x = t * 1.5 * Math.cos(t);
            const y = t * 1 * Math.sin(t);
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          break;
          
        case "comma":
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.4, Math.PI * 0.3, Math.PI * 1.7);
          ctx.strokeStyle = bacterium.infected ? '#ef4444' : bacterium.color;
          ctx.lineWidth = size * 0.3;
          ctx.lineCap = 'round';
          ctx.stroke();
          break;
      }
      
      ctx.setLineDash([]);
      
      // Draw flagella
      if (bacterium.flagella && !bacterium.dead) {
        ctx.strokeStyle = hexToRgba(bacterium.color, 0.4);
        ctx.lineWidth = 1;
        
        const flagellaCount = BACTERIA_TYPES[bacterium.type].flagellaCount;
        for (let f = 0; f < flagellaCount; f++) {
          ctx.beginPath();
          ctx.moveTo(size * 0.5, 0);
          
          for (let i = 1; i <= 4; i++) {
            const x = size * 0.5 + i * 3;
            const y = Math.sin(tickRef.current * 0.1 + i * 0.5 + f) * 4;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.rotate((Math.PI * 2) / flagellaCount);
        }
      }
      
      ctx.restore();
    });
    
    // Draw phages
    phagesRef.current.forEach(phage => {
      ctx.save();
      ctx.translate(phage.x, phage.y);
      ctx.rotate(phage.angle);
      
      if (viewMode === "fluorescent" || viewMode === "darkfield") {
        ctx.shadowBlur = 6;
        ctx.shadowColor = phage.color;
      }
      
      // Phage head
      ctx.fillStyle = phage.color;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const x = Math.cos(angle) * phage.size;
        const y = Math.sin(angle) * phage.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Tail
      ctx.strokeStyle = phage.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, phage.size);
      ctx.lineTo(0, phage.size + phage.tailLength);
      ctx.stroke();
      
      ctx.restore();
    });
    
    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life / 30);
      
      if (particle.glow) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = particle.color;
      }
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
    
    // Environmental stress overlay
    if (antibioticLevel > 0) {
      ctx.save();
      ctx.globalAlpha = antibioticLevel / 500;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    
    if (uvRadiation > 0) {
      ctx.save();
      ctx.globalAlpha = uvRadiation / 500;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#a78bfa');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [viewMode, antibioticLevel, uvRadiation]);
  
  // Animation loop
  const animate = useCallback(() => {
    const dt = speed;
    updateSimulation(dt);
    render();
    
    if (tickRef.current % 30 === 0) {
      updateStats();
    }
    
    rafRef.current = requestAnimationFrame(animate);
  }, [speed, updateSimulation, render, updateStats]);
  
  // Effects
  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(animate);
    } else if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, animate]);
  
  useEffect(() => {
    initializeSimulation();
    setTimeout(() => render(), 50);
  }, [initializeSimulation, render]);
  
  // Control handlers
  const handleReset = () => {
    setIsRunning(false);
    initializeSimulation();
    setTimeout(() => render(), 50);
  };
  
  const addPhages = () => {
    const types = Object.keys(PHAGE_TYPES) as PhageType[];
    for (let i = 0; i < 8; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const cfg = PHAGE_TYPES[type];
      phagesRef.current.push({
        id: nextIdRef.current++,
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        attached: false,
        injected: false,
        type,
        size: cfg.size,
        color: cfg.color,
        tailLength: cfg.tailLength,
        angle: Math.random() * Math.PI * 2,
        lifecycle: 'searching',
      });
    }
    updateStats();
  };
  
  const addAntibiotics = () => {
    setAntibioticLevel(prev => Math.min(100, prev + 25));
    
    // Visual feedback
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 60,
        color: '#ef4444',
        size: 1 + Math.random(),
        type: 'waste',
        glow: true,
      });
    }
  };
  
  const InterventionCard = ({ 
    children, 
    active, 
    onClick 
  }: { 
    children: React.ReactNode; 
    active: boolean; 
    onClick: () => void;
  }) => (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
        active 
          ? 'border-blue-500/60 bg-blue-500/10' 
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      } hover:transform hover:-translate-y-1 hover:shadow-lg`}
    >
      {children}
    </div>
  );
  
  const ParameterControl = ({ 
    label, 
    value, 
    children 
  }: { 
    label: string; 
    value: string | number; 
    children: React.ReactNode;
  }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-sm font-semibold text-blue-400 font-mono">{value}</span>
      </div>
      {children}
    </div>
  );
  
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-slate-900 text-slate-200">
      <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-blue-900 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
          
          {/* HUD */}
          <div className="absolute top-6 left-6 p-4 bg-black/85 backdrop-blur-xl rounded-xl border border-blue-500/20 min-w-48 shadow-2xl">
            <div className="flex items-center gap-2 text-base font-bold mb-3 text-white">
              <Microscope size={16} />
              Microbial Observatory
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/70">Bacteria:</span>
                <span className="font-semibold font-mono text-green-400">{stats.healthyBacteria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Infected:</span>
                <span className="font-semibold font-mono text-red-400">{stats.infectedBacteria}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Phages:</span>
                <span className="font-semibold font-mono text-red-600">{stats.totalPhages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Nutrients:</span>
                <span className="font-semibold font-mono text-yellow-400">{stats.nutrients}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white/70">Generation:</span>
                <span className="font-semibold font-mono">{stats.generationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Biodiversity:</span>
                <span className="font-semibold font-mono">{stats.biodiversity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Resistance:</span>
                <span className={`font-semibold font-mono ${
                  stats.resistanceLevel > 50 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {stats.resistanceLevel.toFixed(0)}%
                </span>
              </div>
              {biofilmFormation && stats.biofilmCoverage > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Biofilm:</span>
                  <span className="font-semibold font-mono text-emerald-400">
                    {stats.biofilmCoverage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Info Panel */}
          <div className="absolute top-6 right-6 p-4 bg-black/85 backdrop-blur-xl rounded-xl border border-purple-500/20 max-w-72 text-xs text-white/80 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 font-semibold text-purple-300">
              <Info size={14} />
              Environmental Conditions
            </div>
            <div className="space-y-1 leading-relaxed">
              <div>Temperature: <span className="text-yellow-400 font-semibold">{temperature}°C</span></div>
              <div>pH: <span className="text-yellow-400 font-semibold">{pH.toFixed(1)}</span></div>
              <div>O₂: <span className="text-yellow-400 font-semibold">{oxygenLevel}%</span></div>
              {antibioticLevel > 0 && (
                <div>Antibiotic: <span className="text-red-400 font-semibold">{antibioticLevel}%</span></div>
              )}
              {uvRadiation > 0 && (
                <div>UV: <span className="text-purple-400 font-semibold">{uvRadiation}%</span></div>
              )}
            </div>
          </div>
          
          {/* View Mode Selector */}
          <div className="absolute bottom-4 left-6 flex gap-2">
            {(['normal', 'fluorescent', 'phase', 'darkfield'] as const).map(mode => (
              <button
                key={mode}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-purple-500/30 border border-purple-500 text-purple-300'
                    : 'bg-black/60 border border-white/20 text-white/70 hover:bg-purple-500/20'
                }`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Playback Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-4 bg-black/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              {isRunning ? <PauseCircle size={32} className="text-white" /> : <PlayCircle size={32} className="text-white" />}
            </button>
            
            <button 
              onClick={handleReset}
              className="flex items-center justify-center p-2 rounded-full transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <RefreshCw size={24} className="text-white" />
            </button>
            
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <Zap size={14} className="text-white" />
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm font-semibold text-white min-w-10">{speed}x</span>
            </div>
          </div>
          
          {/* Controls Section */}
          <div className="absolute bottom-28 left-6 right-6 max-w-4xl mx-auto bg-black/85 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-6 shadow-2xl">
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
              {[
                { id: 'environment', label: 'Environment', icon: Beaker },
                { id: 'genetics', label: 'Genetics', icon: Dna },
                { id: 'interactions', label: 'Interactions', icon: GitBranch },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                        : 'text-white/60 hover:bg-blue-500/10 hover:text-blue-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            {activeTab === 'environment' && (
              <div className="grid grid-cols-3 gap-6">
                <ParameterControl label="Temperature" value={`${temperature}°C`}>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
                
                <ParameterControl label="pH Level" value={pH.toFixed(1)}>
                  <input
                    type="range"
                    min={4}
                    max={10}
                    step={0.1}
                    value={pH}
                    onChange={(e) => setPH(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
                
                <ParameterControl label="Oxygen" value={`${oxygenLevel}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={oxygenLevel}
                    onChange={(e) => setOxygenLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
                
                <ParameterControl label="Nutrients" value={`${nutrientDensity}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={nutrientDensity}
                    onChange={(e) => setNutrientDensity(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
                
                <ParameterControl label="Antibiotic" value={`${antibioticLevel}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={antibioticLevel}
                    onChange={(e) => setAntibioticLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
                
                <ParameterControl label="UV Radiation" value={`${uvRadiation}%`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={uvRadiation}
                    onChange={(e) => setUvRadiation(Number(e.target.value))}
                    className="w-full"
                  />
                </ParameterControl>
              </div>
            )}
            
            {activeTab === 'genetics' && (
              <div className="grid grid-cols-3 gap-4">
                <InterventionCard
                  active={horizontalGeneTransfer}
                  onClick={() => setHorizontalGeneTransfer(!horizontalGeneTransfer)}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-lg mb-3">
                    <GitBranch size={24} className="text-yellow-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Gene Transfer</div>
                  <div className="text-xs text-white/50">Conjugation & plasmid exchange</div>
                </InterventionCard>
                
                <InterventionCard
                  active={adaptiveEvolution}
                  onClick={() => setAdaptiveEvolution(!adaptiveEvolution)}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mb-3">
                    <TrendingUp size={24} className="text-purple-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Evolution</div>
                  <div className="text-xs text-white/50">Mutations & natural selection</div>
                </InterventionCard>
                
                <InterventionCard
                  active={chemotaxis}
                  onClick={() => setChemotaxis(!chemotaxis)}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-cyan-500/20 rounded-lg mb-3">
                    <Activity size={24} className="text-cyan-400" />
                  </div>
                  <div className="font-semibold text-white mb-1">Chemotaxis</div>
                  <div className="text-xs text-white/50">Chemical gradient sensing</div>
                </InterventionCard>
              </div>
            )}
            
            {activeTab === 'interactions' && (
              <div className="grid grid-cols-4 gap-4">
                <InterventionCard
                  active={quorumSensing}
                  onClick={() => setQuorumSensing(!quorumSensing)}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg mb-3">
                    <Waves size={24} className="text-emerald-400" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1">Quorum Sensing</div>
                  <div className="text-xs text-white/50">Density-dependent signaling</div>
                </InterventionCard>
                
                <InterventionCard
                  active={biofilmFormation}
                  onClick={() => setBiofilmFormation(!biofilmFormation)}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-lg mb-3">
                    <Shield size={24} className="text-green-400" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1">Biofilm</div>
                  <div className="text-xs text-white/50">Protective matrix formation</div>
                </InterventionCard>
                
                <InterventionCard
                  active={phageTherapy}
                  onClick={() => {
                    setPhageTherapy(!phageTherapy);
                    if (!phageTherapy) addPhages();
                  }}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg mb-3">
                    <AlertTriangle size={24} className="text-red-400" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1">Phage Therapy</div>
                  <div className="text-xs text-white/50">Bacteriophage predation</div>
                </InterventionCard>
                
                <InterventionCard
                  active={false}
                  onClick={addAntibiotics}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg mb-3">
                    <Plus size={24} className="text-red-400" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-1">Add Antibiotic</div>
                  <div className="text-xs text-white/50">Antimicrobial stress</div>
                </InterventionCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}