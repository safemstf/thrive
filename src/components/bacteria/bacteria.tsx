// src\components\bacteria\bacteria.tsx
import React, { useRef, useEffect, useState, useCallback, ReactNode, CSSProperties } from "react";
import { 
  PlayCircle, PauseCircle, RefreshCw, Zap, 
  Droplet, Plus, Eye, Activity,
  Thermometer, Beaker, Dna, Shield, AlertTriangle,
  Microscope
} from "lucide-react";

// Import styled components from the shared styles
import {
  SimulationContainer,
  VideoSection,
  CanvasContainer,
  SimCanvas,
  HUD,
  PlaybackControls,
  SpeedIndicator,
  ControlsSection,
  TabContainer,
  Tab,
  TabContent,
  StatCard,
  ParameterControl,
  InterventionGrid,
  InterventionCard,
  GlowButton
} from '../cs/simulationHub.styles';

// Additional components for this simulation
interface MicroscopeOverlayProps {
  children?: ReactNode; // make optional if you sometimes render <MicroscopeOverlay /> without children
}

const MicroscopeOverlay: React.FC<MicroscopeOverlayProps> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background:
        'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.8) 100%)',
      zIndex: 20,
    }}
  >
    {children}
  </div>
);


interface DepthIndicatorProps {
  children?: ReactNode;
}

const DepthIndicator: React.FC<DepthIndicatorProps> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      borderRadius: '8px',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      fontSize: '0.75rem',
      color: '#fff',
      zIndex: 10,
      fontFamily: 'Courier New, monospace',
    }}
  >
    {children}
  </div>
);

interface GridProps {
  $columns: number;
  $gap?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const Grid: React.FC<GridProps> = ({ $columns, $gap, children, style }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${$columns}, 1fr)`,
      gap: $gap || '1rem',
      ...style,
    }}
  >
    {children}
  </div>
);


// Types
interface Bacterium {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  type: 'ecoli' | 'bacillus' | 'coccus' | 'spirillum';
  health: number;
  age: number;
  divisionTimer: number;
  infected: boolean;
  phageCount: number;
  lysisTimer?: number;
  resistance: number;
  flagella: boolean;
  pili: { x: number; y: number; length: number }[];
  color: string;
  size: number;
  energy: number;
  dead: boolean;
}

interface Phage {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  attached: boolean;
  targetId?: number;
  injected: boolean;
  type: 'lambda' | 'T4' | 'T7';
  size: number;
  color: string;
  tailLength: number;
  angle: number;
}

interface Nutrient {
  id: number;
  x: number;
  y: number;
  value: number;
  type: 'glucose' | 'amino' | 'vitamin';
  color: string;
  consumed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

// Constants
const BACTERIA_TYPES = {
  ecoli: { 
    color: '#22c55e', 
    size: 20, 
    shape: 'rod',
    divisionRate: 0.03,
    speed: 1.5,
    name: 'E. coli'
  },
  bacillus: { 
    color: '#3b82f6', 
    size: 25, 
    shape: 'rod',
    divisionRate: 0.02,
    speed: 1.0,
    name: 'Bacillus'
  },
  coccus: { 
    color: '#f59e0b', 
    size: 15, 
    shape: 'sphere',
    divisionRate: 0.04,
    speed: 0.8,
    name: 'Coccus'
  },
  spirillum: { 
    color: '#a78bfa', 
    size: 18, 
    shape: 'spiral',
    divisionRate: 0.025,
    speed: 2.0,
    name: 'Spirillum'
  }
};

const PHAGE_TYPES = {
  lambda: { 
    color: '#ef4444', 
    size: 8,
    tailLength: 12,
    burstSize: 50,
    latency: 150,
    name: 'λ Phage'
  },
  T4: { 
    color: '#dc2626', 
    size: 10,
    tailLength: 15,
    burstSize: 100,
    latency: 200,
    name: 'T4 Phage'
  },
  T7: { 
    color: '#b91c1c', 
    size: 7,
    tailLength: 10,
    burstSize: 30,
    latency: 100,
    name: 'T7 Phage'
  }
};

// Main Component
export default function BacteriaPhageSimulation({   
  isRunning: externalIsRunning = false, 
  speed: externalSpeed = 1,
  isDark = true }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bacteria = useRef<Bacterium[]>([]);
  const phages = useRef<Phage[]>([]);
  const nutrients = useRef<Nutrient[]>([]);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  // State
  const [isRunning, setIsRunning] = useState(externalIsRunning);
  const [speed, setSpeed] = useState(externalSpeed);
  const [tickCount, setTickCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'environment' | 'population' | 'microscope'>('environment');
  const [viewMode, setViewMode] = useState<'normal' | 'fluorescent' | 'phase'>('normal');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Environment parameters
  const [temperature, setTemperature] = useState(37); // Celsius
  const [ph, setPh] = useState(7.0);
  const [oxygenLevel, setOxygenLevel] = useState(80);
  const [nutrientDensity, setNutrientDensity] = useState(50);
  const [antibioticLevel, setAntibioticLevel] = useState(0);
  
  // Intervention states
  const [addingPhages, setAddingPhages] = useState(false);
  const [addingNutrients, setAddingNutrients] = useState(true);
  const [biofilmMode, setBiofilmMode] = useState(false);
  const [quorumSensing, setQuorumSensing] = useState(true);
  
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
    generationNumber: 0
  });

  // Canvas dimensions
  const canvasWidth = useRef(1200);
  const canvasHeight = useRef(675);

  // Initialize simulation
  const initSimulation = useCallback(() => {
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    
    // Initialize bacteria
    const newBacteria: Bacterium[] = [];
    const bacteriaCount = 30;
    
    for (let i = 0; i < bacteriaCount; i++) {
      const types = Object.keys(BACTERIA_TYPES) as Array<keyof typeof BACTERIA_TYPES>;
      const type = types[Math.floor(Math.random() * types.length)];
      const config = BACTERIA_TYPES[type];
      
      newBacteria.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.1,
        type,
        health: 100,
        age: 0,
        divisionTimer: Math.random() * 200,
        infected: false,
        phageCount: 0,
        resistance: Math.random() * 0.3,
        flagella: type === 'ecoli' || type === 'spirillum',
        pili: [],
        color: config.color,
        size: config.size,
        energy: 80 + Math.random() * 20,
        dead: false
      });
      
      // Add pili for some bacteria
      if (Math.random() > 0.5) {
        const piliCount = 2 + Math.floor(Math.random() * 4);
        for (let j = 0; j < piliCount; j++) {
          newBacteria[i].pili.push({
            x: Math.random() * Math.PI * 2,
            y: Math.random() * Math.PI * 2,
            length: 5 + Math.random() * 10
          });
        }
      }
    }
    
    // Initialize nutrients
    const newNutrients: Nutrient[] = [];
    const nutrientCount = Math.floor(nutrientDensity * 0.5);
    
    for (let i = 0; i < nutrientCount; i++) {
      const types = ['glucose', 'amino', 'vitamin'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const colors = {
        glucose: '#fbbf24',
        amino: '#34d399',
        vitamin: '#f472b6'
      };
      
      newNutrients.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        value: 10 + Math.random() * 20,
        type,
        color: colors[type],
        consumed: false
      });
    }
    
    // Initialize phages (start with few)
    const newPhages: Phage[] = [];
    if (addingPhages) {
      for (let i = 0; i < 5; i++) {
        const types = Object.keys(PHAGE_TYPES) as Array<keyof typeof PHAGE_TYPES>;
        const type = types[Math.floor(Math.random() * types.length)];
        const config = PHAGE_TYPES[type];
        
        newPhages.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          attached: false,
          injected: false,
          type,
          size: config.size,
          color: config.color,
          tailLength: config.tailLength,
          angle: Math.random() * Math.PI * 2
        });
      }
    }
    
    bacteria.current = newBacteria;
    phages.current = newPhages;
    nutrients.current = newNutrients;
    particles.current = [];
    setTickCount(0);
    updateStats();
  }, [nutrientDensity, addingPhages]);

  // Update statistics
  const updateStats = useCallback(() => {
    const totalBacteria = bacteria.current.length;
    const healthyBacteria = bacteria.current.filter(b => !b.infected && !b.dead).length;
    const infectedBacteria = bacteria.current.filter(b => b.infected && !b.dead).length;
    const deadBacteria = bacteria.current.filter(b => b.dead).length;
    
    // Calculate biodiversity (Shannon index simplified)
    const typeCounts = new Map<string, number>();
    bacteria.current.forEach(b => {
      if (!b.dead) {
        typeCounts.set(b.type, (typeCounts.get(b.type) || 0) + 1);
      }
    });
    
    let biodiversity = 0;
    const livingBacteria = totalBacteria - deadBacteria;
    if (livingBacteria > 0) {
      typeCounts.forEach(count => {
        const p = count / livingBacteria;
        if (p > 0) biodiversity -= p * Math.log(p);
      });
    }
    
    const avgResistance = bacteria.current.reduce((sum, b) => sum + b.resistance, 0) / (totalBacteria || 1);
    
    setStats({
      totalBacteria,
      healthyBacteria,
      infectedBacteria,
      deadBacteria,
      totalPhages: phages.current.length,
      nutrients: nutrients.current.filter(n => !n.consumed).length,
      biodiversity: biodiversity * 100,
      resistanceLevel: avgResistance * 100,
      generationNumber: Math.floor(tickCount / 500)
    });
  }, [tickCount]);

  // Update simulation
  const update = useCallback(() => {
    if (!isRunning) return;
    
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    const dt = speed;
    
    // Environmental effects
    const tempEffect = 1 + (temperature - 37) * 0.02; // Optimal at 37°C
    const phEffect = 1 - Math.abs(ph - 7) * 0.1; // Optimal at pH 7
    const oxygenEffect = oxygenLevel / 100;
    
    // Update bacteria
    bacteria.current.forEach((bacterium, idx) => {
      if (bacterium.dead) {
        // Dead bacteria slowly decompose
        bacterium.size *= 0.99;
        if (bacterium.size < 1) {
          bacteria.current.splice(idx, 1);
        }
        return;
      }
      
      // Age and energy
      bacterium.age += dt;
      bacterium.energy -= 0.1 * dt * tempEffect;
      
      // Movement (chemotaxis toward nutrients)
      let targetX = 0, targetY = 0;
      let foundTarget = false;
      
      if (bacterium.flagella && nutrients.current.length > 0) {
        // Find nearest nutrient
        let minDist = Infinity;
        nutrients.current.forEach(nutrient => {
          if (!nutrient.consumed) {
            const dx = nutrient.x - bacterium.x;
            const dy = nutrient.y - bacterium.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist && dist < 100) {
              minDist = dist;
              targetX = dx;
              targetY = dy;
              foundTarget = true;
            }
          }
        });
      }
      
      // Apply movement
      if (foundTarget) {
        // Move toward nutrient
        const angle = Math.atan2(targetY, targetX);
        bacterium.vx += Math.cos(angle) * 0.1 * dt;
        bacterium.vy += Math.sin(angle) * 0.1 * dt;
      } else {
        // Random walk
        bacterium.vx += (Math.random() - 0.5) * 0.5 * dt;
        bacterium.vy += (Math.random() - 0.5) * 0.5 * dt;
      }
      
      // Limit speed
      const speed = Math.sqrt(bacterium.vx * bacterium.vx + bacterium.vy * bacterium.vy);
      const maxSpeed = BACTERIA_TYPES[bacterium.type].speed * tempEffect * phEffect;
      if (speed > maxSpeed) {
        bacterium.vx = (bacterium.vx / speed) * maxSpeed;
        bacterium.vy = (bacterium.vy / speed) * maxSpeed;
      }
      
      // Update position
      bacterium.x += bacterium.vx * dt;
      bacterium.y += bacterium.vy * dt;
      bacterium.angle += bacterium.angularVelocity * dt;
      
      // Boundary conditions
      if (bacterium.x < bacterium.size) {
        bacterium.x = bacterium.size;
        bacterium.vx *= -0.8;
      }
      if (bacterium.x > width - bacterium.size) {
        bacterium.x = width - bacterium.size;
        bacterium.vx *= -0.8;
      }
      if (bacterium.y < bacterium.size) {
        bacterium.y = bacterium.size;
        bacterium.vy *= -0.8;
      }
      if (bacterium.y > height - bacterium.size) {
        bacterium.y = height - bacterium.size;
        bacterium.vy *= -0.8;
      }
      
      // Consume nutrients
      nutrients.current.forEach(nutrient => {
        if (!nutrient.consumed) {
          const dx = nutrient.x - bacterium.x;
          const dy = nutrient.y - bacterium.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < bacterium.size + 5) {
            nutrient.consumed = true;
            bacterium.energy = Math.min(100, bacterium.energy + nutrient.value);
            bacterium.health = Math.min(100, bacterium.health + nutrient.value * 0.5);
            
            // Create consumption particles
            for (let i = 0; i < 5; i++) {
              particles.current.push({
                x: nutrient.x,
                y: nutrient.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 30,
                color: nutrient.color,
                size: 2
              });
            }
          }
        }
      });
      
      // Cell division
      if (bacterium.energy > 80 && bacterium.health > 60 && !bacterium.infected) {
        bacterium.divisionTimer -= dt * tempEffect * phEffect * oxygenEffect;
        
        if (bacterium.divisionTimer <= 0) {
          // Divide!
          const daughter: Bacterium = {
            ...bacterium,
            id: Date.now() + Math.random(),
            x: bacterium.x + (Math.random() - 0.5) * 20,
            y: bacterium.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            energy: bacterium.energy / 2,
            health: bacterium.health * 0.9,
            age: 0,
            divisionTimer: 200 + Math.random() * 100,
            resistance: bacterium.resistance + (Math.random() - 0.5) * 0.1,
            pili: []
          };
          
          bacterium.energy /= 2;
          bacterium.divisionTimer = 200 + Math.random() * 100;
          
          bacteria.current.push(daughter);
          
          // Division particles
          for (let i = 0; i < 10; i++) {
            particles.current.push({
              x: bacterium.x,
              y: bacterium.y,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              life: 40,
              color: bacterium.color,
              size: 3
            });
          }
        }
      }
      
      // Phage infection progression
      if (bacterium.infected) {
        bacterium.health -= 0.5 * dt;
        bacterium.lysisTimer = (bacterium.lysisTimer || 0) - dt;
        
        if (bacterium.lysisTimer <= 0 || bacterium.health <= 0) {
          // Lysis! Burst and release new phages
          bacterium.dead = true;
          
          const burstSize = bacterium.phageCount * 10;
          for (let i = 0; i < burstSize; i++) {
            const angle = (Math.PI * 2 * i) / burstSize;
            phages.current.push({
              id: Date.now() + i,
              x: bacterium.x,
              y: bacterium.y,
              vx: Math.cos(angle) * 3,
              vy: Math.sin(angle) * 3,
              attached: false,
              injected: false,
              type: 'T4',
              size: 8,
              color: '#dc2626',
              tailLength: 12,
              angle: angle
            });
          }
          
          // Lysis particles
          for (let i = 0; i < 20; i++) {
            particles.current.push({
              x: bacterium.x,
              y: bacterium.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 60,
              color: '#ef4444',
              size: 4
            });
          }
        }
      }
      
      // Antibiotic effects
      if (antibioticLevel > 0) {
        const damage = antibioticLevel * (1 - bacterium.resistance) * 0.1 * dt;
        bacterium.health -= damage;
        
        if (bacterium.health <= 0) {
          bacterium.dead = true;
        }
      }
      
      // Natural death
      if (bacterium.energy <= 0 || bacterium.age > 1000) {
        bacterium.dead = true;
      }
    });
    
    // Update phages
    phages.current.forEach((phage, idx) => {
      if (!phage.attached) {
        // Free-floating movement
        phage.x += phage.vx * dt;
        phage.y += phage.vy * dt;
        phage.angle += 0.05 * dt;
        
        // Boundary bounce
        if (phage.x < 0 || phage.x > width) phage.vx *= -1;
        if (phage.y < 0 || phage.y > height) phage.vy *= -1;
        
        // Check for bacterial collision
        bacteria.current.forEach(bacterium => {
          if (!bacterium.dead && !bacterium.infected && !phage.attached) {
            const dx = bacterium.x - phage.x;
            const dy = bacterium.y - phage.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bacterium.size) {
              // Attachment probability based on resistance
              if (Math.random() > bacterium.resistance) {
                phage.attached = true;
                phage.targetId = bacterium.id;
                phage.x = bacterium.x;
                phage.y = bacterium.y;
                
                // Start infection
                setTimeout(() => {
                  if (!phage.injected && phage.attached) {
                    phage.injected = true;
                    bacterium.infected = true;
                    bacterium.phageCount++;
                    bacterium.lysisTimer = PHAGE_TYPES[phage.type].latency;
                  }
                }, 500);
              }
            }
          }
        });
      } else if (phage.targetId !== undefined) {
        // Follow attached bacterium
        const target = bacteria.current.find(b => b.id === phage.targetId);
        if (target && !target.dead) {
          phage.x = target.x + Math.cos(phage.angle) * target.size * 0.8;
          phage.y = target.y + Math.sin(phage.angle) * target.size * 0.8;
        } else {
          // Detach if bacterium is dead
          phage.attached = false;
          phage.targetId = undefined;
          phage.vx = (Math.random() - 0.5) * 3;
          phage.vy = (Math.random() - 0.5) * 3;
        }
      }
    });
    
    // Update particles
    particles.current = particles.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      return particle.life > 0;
    });
    
    // Remove consumed nutrients
    nutrients.current = nutrients.current.filter(n => !n.consumed);
    
    // Periodically add new nutrients
    if (addingNutrients && tickCount % 100 === 0) {
      const types = ['glucose', 'amino', 'vitamin'] as const;
      const type = types[Math.floor(Math.random() * types.length)];
      const colors = {
        glucose: '#fbbf24',
        amino: '#34d399',
        vitamin: '#f472b6'
      };
      
      nutrients.current.push({
        id: Date.now(),
        x: Math.random() * width,
        y: Math.random() * height,
        value: 10 + Math.random() * 20,
        type,
        color: colors[type],
        consumed: false
      });
    }
    
    setTickCount(prev => prev + 1);
    updateStats();
  }, [isRunning, speed, temperature, ph, oxygenLevel, antibioticLevel, addingNutrients, tickCount, updateStats]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvasWidth.current;
    canvas.height = canvasHeight.current;
    
    // Background (petri dish)
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    
    if (viewMode === 'fluorescent') {
      gradient.addColorStop(0, '#000814');
      gradient.addColorStop(1, '#001d3d');
    } else if (viewMode === 'phase') {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f0f1e');
    } else {
      gradient.addColorStop(0, '#0d1117');
      gradient.addColorStop(1, '#010409');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Draw biofilm if enabled
    if (biofilmMode) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
      bacteria.current.forEach(b1 => {
        if (!b1.dead) {
          bacteria.current.forEach(b2 => {
            if (b1.id !== b2.id && !b2.dead) {
              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 60) {
                ctx.beginPath();
                ctx.moveTo(b1.x, b1.y);
                ctx.lineTo(b2.x, b2.y);
                ctx.strokeStyle = 'rgba(34, 197, 94, 0.05)';
                ctx.lineWidth = 20;
                ctx.stroke();
              }
            }
          });
        }
      });
    }
    
    // Draw nutrients
    nutrients.current.forEach(nutrient => {
      if (!nutrient.consumed) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        
        // Nutrient glow
        const glow = ctx.createRadialGradient(
          nutrient.x, nutrient.y, 0,
          nutrient.x, nutrient.y, nutrient.value
        );
        glow.addColorStop(0, nutrient.color + '80');
        glow.addColorStop(1, nutrient.color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(nutrient.x, nutrient.y, nutrient.value, 0, Math.PI * 2);
        ctx.fill();
        
        // Nutrient core
        ctx.fillStyle = nutrient.color;
        ctx.beginPath();
        ctx.arc(nutrient.x, nutrient.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    });
    
    // Draw bacteria
    bacteria.current.forEach(bacterium => {
      ctx.save();
      ctx.translate(bacterium.x, bacterium.y);
      ctx.rotate(bacterium.angle);
      
      // Apply visual mode effects
      if (viewMode === 'fluorescent') {
        ctx.shadowBlur = 20;
        ctx.shadowColor = bacterium.infected ? '#ef4444' : bacterium.color;
      } else if (viewMode === 'phase') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
      }
      
      // Draw bacterial body
      ctx.globalAlpha = bacterium.dead ? 0.3 : (bacterium.health / 100);
      
      const shape = BACTERIA_TYPES[bacterium.type].shape;
      
      if (shape === 'rod') {
        // Rod-shaped bacteria
        ctx.fillStyle = bacterium.infected ? '#ef4444' : bacterium.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, bacterium.size * 0.8, bacterium.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (viewMode === 'phase') ctx.stroke();
      } else if (shape === 'sphere') {
        // Spherical bacteria
        const gradient = ctx.createRadialGradient(
          -bacterium.size * 0.3, -bacterium.size * 0.3, 0,
          0, 0, bacterium.size
        );
        gradient.addColorStop(0, bacterium.infected ? '#ff6b6b' : bacterium.color);
        gradient.addColorStop(1, bacterium.infected ? '#c92a2a' : bacterium.color + '80');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, bacterium.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        if (viewMode === 'phase') ctx.stroke();
      } else if (shape === 'spiral') {
        // Spiral bacteria
        ctx.strokeStyle = bacterium.infected ? '#ef4444' : bacterium.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 4; t += 0.1) {
          const x = t * 2 * Math.cos(t);
          const y = t * Math.sin(t);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      // Draw flagella
      if (bacterium.flagella && !bacterium.dead) {
        ctx.strokeStyle = bacterium.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bacterium.size * 0.5, 0);
        for (let i = 1; i <= 5; i++) {
          const x = bacterium.size * 0.5 + i * 5;
          const y = Math.sin(tickCount * 0.1 + i * 0.5) * 5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      // Draw pili
      bacterium.pili.forEach(pilus => {
        ctx.strokeStyle = bacterium.color + '40';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const x = Math.cos(pilus.x) * pilus.length;
        const y = Math.sin(pilus.y) * pilus.length;
        ctx.lineTo(x, y);
        ctx.stroke();
      });
      
      // Health indicator
      if (!bacterium.dead && bacterium.health < 50) {
        ctx.fillStyle = '#ef4444';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, -bacterium.size - 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // Draw phages
    phages.current.forEach(phage => {
      ctx.save();
      ctx.translate(phage.x, phage.y);
      ctx.rotate(phage.angle);
      
      if (viewMode === 'fluorescent') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = phage.color;
      }
      
      // Phage head (icosahedral)
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
      
      // Phage tail
      ctx.strokeStyle = phage.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, phage.size);
      ctx.lineTo(0, phage.size + phage.tailLength);
      ctx.stroke();
      
      // Tail fibers
      if (!phage.injected) {
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
          if (i !== 0) {
            ctx.beginPath();
            ctx.moveTo(0, phage.size + phage.tailLength);
            ctx.lineTo(i * 5, phage.size + phage.tailLength + 5);
            ctx.stroke();
          }
        }
      }
      
      ctx.restore();
    });
    
    // Draw particles
    particles.current.forEach(particle => {
      ctx.globalAlpha = particle.life / 60;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
    
    // Draw quorum sensing signals
    if (quorumSensing) {
      ctx.globalAlpha = 0.2;
      const density = bacteria.current.filter(b => !b.dead).length;
      if (density > 20) {
        ctx.fillStyle = '#10b981';
        bacteria.current.forEach(b => {
          if (!b.dead) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 30, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    }
    
    ctx.globalAlpha = 1;
  }, [viewMode, zoomLevel, biofilmMode, quorumSensing, tickCount]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      update();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, update, render]);

  // Initialize on mount
  useEffect(() => {
    initSimulation();
    setTimeout(() => render(), 50);
  }, []);

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    initSimulation();
    setTimeout(() => render(), 100);
  };

  // Add phages
  const addPhages = () => {
    const types = Object.keys(PHAGE_TYPES) as Array<keyof typeof PHAGE_TYPES>;
    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const config = PHAGE_TYPES[type];
      
      phages.current.push({
        id: Date.now() + i,
        x: Math.random() * canvasWidth.current,
        y: Math.random() * canvasHeight.current,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        attached: false,
        injected: false,
        type,
        size: config.size,
        color: config.color,
        tailLength: config.tailLength,
        angle: Math.random() * Math.PI * 2
      });
    }
  };

  return (
    <SimulationContainer $isDark={isDark}>
      <VideoSection>
        <CanvasContainer>
          <SimCanvas ref={canvasRef} />
          <MicroscopeOverlay />
          
          <HUD $isDark={isDark}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Microscope size={16} />
              Microcosmos
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Bacteria:</span>
                <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.healthyBacteria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Infected:</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.infectedBacteria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Phages:</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{stats.totalPhages}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Nutrients:</span>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.nutrients}</span>
              </div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>Generation:</span>
                  <span style={{ fontWeight: 700 }}>{stats.generationNumber}</span>
                </div>
              </div>
            </div>
          </HUD>
          
          <DepthIndicator>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Eye size={12} />
              <span>Magnification: {(zoomLevel * 1000).toFixed(0)}x</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('normal')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: viewMode === 'normal' ? '#3b82f6' : 'transparent',
                  border: '1px solid #3b82f6',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.65rem',
                  cursor: 'pointer'
                }}
              >
                Normal
              </button>
              <button
                onClick={() => setViewMode('fluorescent')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: viewMode === 'fluorescent' ? '#10b981' : 'transparent',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.65rem',
                  cursor: 'pointer'
                }}
              >
                Fluor
              </button>
              <button
                onClick={() => setViewMode('phase')}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: viewMode === 'phase' ? '#8b5cf6' : 'transparent',
                  border: '1px solid #8b5cf6',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '0.65rem',
                  cursor: 'pointer'
                }}
              >
                Phase
              </button>
            </div>
          </DepthIndicator>
          
          <PlaybackControls>
            <button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>
            
            <button onClick={handleReset}>
              <RefreshCw size={24} />
            </button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0 1rem',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={14} />
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '35px' }}>
                {speed}x
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0 1rem',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Eye size={14} />
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
              />
            </div>
          </PlaybackControls>
          
          <SpeedIndicator>
            <Activity size={14} style={{ marginRight: '0.5rem' }} />
            Gen {stats.generationNumber}
          </SpeedIndicator>
        </CanvasContainer>
      </VideoSection>
      
      <ControlsSection $isDark={isDark}>
        <TabContainer>
          <Tab 
            $active={activeTab === 'environment'}
            onClick={() => setActiveTab('environment')}
          >
            <Beaker size={16} style={{ marginRight: '0.5rem' }} />
            Environment
          </Tab>
          <Tab 
            $active={activeTab === 'population'}
            onClick={() => setActiveTab('population')}
          >
            <Dna size={16} style={{ marginRight: '0.5rem' }} />
            Population
          </Tab>
          <Tab 
            $active={activeTab === 'microscope'}
            onClick={() => setActiveTab('microscope')}
          >
            <Microscope size={16} style={{ marginRight: '0.5rem' }} />
            Microscope
          </Tab>
        </TabContainer>
        
        <TabContent>
          {activeTab === 'environment' && (
            <Grid $columns={3} $gap="1.5rem">
              <ParameterControl>
                <div className="header">
                  <span className="label">Temperature</span>
                  <span className="value">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={45}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">pH Level</span>
                  <span className="value">{ph.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.1}
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Oxygen Level</span>
                  <span className="value">{oxygenLevel}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={oxygenLevel}
                  onChange={(e) => setOxygenLevel(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Nutrient Density</span>
                  <span className="value">{nutrientDensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={nutrientDensity}
                  onChange={(e) => setNutrientDensity(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Antibiotic Level</span>
                  <span className="value">{antibioticLevel}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={antibioticLevel}
                  onChange={(e) => setAntibioticLevel(Number(e.target.value))}
                />
              </ParameterControl>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <GlowButton onClick={addPhages} $color="#ef4444">
                  <Plus size={14} style={{ marginRight: '0.5rem' }} />
                  Add Phages
                </GlowButton>
              </div>
            </Grid>
          )}
          
          {activeTab === 'population' && (
            <div>
              <InterventionGrid>
                <InterventionCard
                  $active={addingNutrients}
                  $color="#fbbf24"
                  onClick={() => setAddingNutrients(!addingNutrients)}
                >
                  <div className="icon">
                    <Droplet size={24} />
                  </div>
                  <div className="name">Nutrient Supply</div>
                  <div className="efficacy">Auto-replenish</div>
                </InterventionCard>
                
                <InterventionCard
                  $active={biofilmMode}
                  $color="#22c55e"
                  onClick={() => setBiofilmMode(!biofilmMode)}
                >
                  <div className="icon">
                    <Shield size={24} />
                  </div>
                  <div className="name">Biofilm Formation</div>
                  <div className="efficacy">Collective behavior</div>
                </InterventionCard>
                
                <InterventionCard
                  $active={quorumSensing}
                  $color="#3b82f6"
                  onClick={() => setQuorumSensing(!quorumSensing)}
                >
                  <div className="icon">
                    <Activity size={24} />
                  </div>
                  <div className="name">Quorum Sensing</div>
                  <div className="efficacy">Cell communication</div>
                </InterventionCard>
                
                <InterventionCard
                  $active={addingPhages}
                  $color="#ef4444"
                  onClick={() => setAddingPhages(!addingPhages)}
                >
                  <div className="icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="name">Phage Therapy</div>
                  <div className="efficacy">Viral predation</div>
                </InterventionCard>
              </InterventionGrid>
              
              <Grid $columns={4} $gap="1rem" style={{ marginTop: '1.5rem' }}>
                <StatCard $color="#22c55e">
                  <div className="label">Biodiversity</div>
                  <div className="value">{stats.biodiversity.toFixed(0)}</div>
                  <div className="change">Shannon index</div>
                </StatCard>
                
                <StatCard $color="#ef4444">
                  <div className="label">Infection Rate</div>
                  <div className="value">
                    {stats.totalBacteria > 0 
                      ? ((stats.infectedBacteria / stats.totalBacteria) * 100).toFixed(0)
                      : 0}%
                  </div>
                  <div className="change">Phage spread</div>
                </StatCard>
                
                <StatCard $color="#8b5cf6">
                  <div className="label">Resistance</div>
                  <div className="value">{stats.resistanceLevel.toFixed(0)}%</div>
                  <div className="change">Average immunity</div>
                </StatCard>
                
                <StatCard $color="#fbbf24">
                  <div className="label">Growth Rate</div>
                  <div className="value">
                    {bacteria.current.filter(b => !b.dead && b.divisionTimer < 50).length}
                  </div>
                  <div className="change">Dividing cells</div>
                </StatCard>
              </Grid>
            </div>
          )}
          
          {activeTab === 'microscope' && (
            <div>
              <Grid $columns={2} $gap="1.5rem">
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#3b82f6' }}>
                    Species Present
                  </h3>
                  {Object.entries(BACTERIA_TYPES).map(([key, config]) => {
                    const count = bacteria.current.filter(b => b.type === key && !b.dead).length;
                    return (
                      <div key={key} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: config.color }}>{config.name}</span>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#ef4444' }}>
                    Phage Types
                  </h3>
                  {Object.entries(PHAGE_TYPES).map(([key, config]) => {
                    const count = phages.current.filter(p => p.type === key).length;
                    return (
                      <div key={key} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: config.color }}>{config.name}</span>
                        <span>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </Grid>
              
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
                  Observation Notes
                </h3>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: '#94a3b8' }}>
                  {temperature < 30 && "Low temperature is slowing bacterial metabolism. "}
                  {temperature > 40 && "High temperature is stressing the bacterial population. "}
                  {ph < 6 && "Acidic conditions are affecting cell membrane integrity. "}
                  {ph > 8 && "Alkaline environment is disrupting cellular processes. "}
                  {antibioticLevel > 50 && "High antibiotic concentration is selecting for resistant strains. "}
                  {stats.infectedBacteria > stats.healthyBacteria && "Phage outbreak is decimating the population! "}
                  {biofilmMode && "Biofilm formation is providing protection against phages. "}
                </p>
              </div>
            </div>
          )}
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}