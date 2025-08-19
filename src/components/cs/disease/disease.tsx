import React, { useRef, useEffect, useState, useCallback } from "react";
import { 
  PlayCircle, PauseCircle, RefreshCw, TrendingUp, 
  AlertTriangle, Shield, Users, Heart,
  BarChart3, Settings, Eye, Zap, Home, AlertCircle, Dna, Download,
  Bug, Globe, Calendar, Database, FileText, ChevronDown, Map, Building2
} from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  Card,
  CardContent,
  BaseButton,
  Badge,
  Heading3,
  BodyText,
  FlexRow,
  FlexColumn,
  Grid,
  Spacer,
  fadeIn,
  TabContainer
} from '@/styles/styled-components';
import { SimulationContainer, VideoSection, CanvasContainer, SimCanvas, HUD, DiseaseSelector, PlaybackControls, SpeedIndicator, ControlsSection, Tab, TabContent, ParameterControl, InterventionGrid, InterventionCard, StatCard } from "./disease.styles";
import { Agent, SimulationMode, DISEASE_PROFILES } from "./disease.types";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DiseaseSimulation({ isDark = false, isRunning: externalRunning = true, speed: externalSpeed = 1 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const animationRef = useRef<number | null>(null);
  const ticksPerDay = 30; // Ticks per simulated day

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [tickCount, setTickCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('covid19');
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'interventions' | 'statistics'>('parameters');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('homogeneous');

  // Get current disease profile
  const disease = DISEASE_PROFILES[selectedDisease];

  // Parameters
  const [population, setPopulation] = useState(1000);
  const [initialInfected, setInitialInfected] = useState(3);
  const [vaccinationRate, setVaccinationRate] = useState(0);
  const [contactRate, setContactRate] = useState(10); // Average contacts per day

  // Interventions
  const [socialDistancing, setSocialDistancing] = useState(false);
  const [vaccination, setVaccination] = useState(false);
  const [quarantine, setQuarantine] = useState(false);
  const [maskWearing, setMaskWearing] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    S: 0, E: 0, I: 0, R: 0, D: 0, V: 0,
    rt: 0,
    day: 0,
    newCases: 0,
    totalCases: 0,
    peakInfected: 0
  });

  // Canvas dimensions
  const canvasWidth = useRef(1200);
  const canvasHeight = useRef(675); // 16:9 aspect ratio

  // Initialize regions for spatial modeling
  const initializeRegions = (width: number, height: number, numRegions: number = 4) => {
    const regions: { x: number; y: number; radius: number }[] = [];
    const cols = Math.ceil(Math.sqrt(numRegions));
    const rows = Math.ceil(numRegions / cols);
    
    for (let i = 0; i < numRegions; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      regions.push({
        x: (col + 0.5) * (width / cols),
        y: (row + 0.5) * (height / rows),
        radius: Math.min(width / cols, height / rows) * 0.4
      });
    }
    
    return regions;
  };

  // Initialize agents with proper spatial distribution
  const initAgents = useCallback(() => {
    const width = canvasWidth.current;
    const height = canvasHeight.current;
    const regions = initializeRegions(width, height, 4);
    
    const newAgents: Agent[] = [];
    
    for (let i = 0; i < population; i++) {
      let x, y, region;
      
      if (simulationMode === 'regions') {
        // Distribute agents across regions
        region = Math.floor(Math.random() * regions.length);
        const r = regions[region];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * r.radius;
        x = r.x + Math.cos(angle) * distance;
        y = r.y + Math.sin(angle) * distance;
      } else if (simulationMode === 'households') {
        // Create household clusters
        const householdId = Math.floor(i / 4); // 4 people per household
        const householdX = Math.random() * width;
        const householdY = Math.random() * height;
        x = householdX + (Math.random() - 0.5) * 30;
        y = householdY + (Math.random() - 0.5) * 30;
      } else {
        // Homogeneous mixing
        x = Math.random() * width;
        y = Math.random() * height;
      }
      
      newAgents.push({
        id: i,
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        state: "S",
        timer: 0,
        immunity: 0,
        region,
        household: Math.floor(i / 4)
      });
    }

    // Initial infections
    for (let i = 0; i < initialInfected; i++) {
      const idx = Math.floor(Math.random() * newAgents.length);
      newAgents[idx].state = "I";
      newAgents[idx].timer = disease.infectiousDays.mean * ticksPerDay;
      newAgents[idx].infectionTime = 0;
    }

    // Apply initial vaccination
    if (vaccination && vaccinationRate > 0) {
      const numToVaccinate = Math.floor(population * vaccinationRate);
      let vaccinated = 0;
      
      while (vaccinated < numToVaccinate) {
        const idx = Math.floor(Math.random() * newAgents.length);
        if (newAgents[idx].state === "S") {
          newAgents[idx].state = "V";
          newAgents[idx].immunity = disease.interventions.vaccination?.efficacy || 0.8;
          vaccinated++;
        }
      }
    }

    agents.current = newAgents;
    setHistory([]);
    setTickCount(0);
    
    // Update initial stats
    updateStats(newAgents);
  }, [population, initialInfected, disease, vaccination, vaccinationRate, simulationMode]);

  // Update statistics
  const updateStats = (agentList: Agent[]) => {
    const counts = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0 };
    let newCases = 0;
    
    for (const a of agentList) {
      counts[a.state]++;
      if (a.infectionTime === tickCount) {
        newCases++;
      }
    }
    
    const totalCases = counts.I + counts.R + counts.D;
    const peakInfected = Math.max(stats.peakInfected, counts.I);
    
    // Calculate R(t) - effective reproduction number
    const infectiousCount = counts.I;
    const recentInfections = agentList.filter(a => 
      a.infectionTime && tickCount - a.infectionTime < ticksPerDay
    ).length;
    const rt = infectiousCount > 0 ? (recentInfections / infectiousCount) * (disease.infectiousDays.mean / 1) : 0;
    
    setStats({
      ...counts,
      rt,
      day: Math.floor(tickCount / ticksPerDay),
      newCases,
      totalCases,
      peakInfected
    });
  };

  // Update simulation with improved transmission dynamics
  const update = useCallback(() => {
    if (!isRunning) return;

    const width = canvasWidth.current;
    const height = canvasHeight.current;
    
    // Calculate effective parameters with interventions
    const maskEffect = maskWearing ? (1 - (disease.interventions.masks?.efficacy ?? 0)) : 1;
    const distanceEffect = socialDistancing ? (1 - (disease.interventions.distancing?.efficacy ?? 0)) : 1;

    const effectiveTransmissionProb = disease.transmissionProb * maskEffect * distanceEffect;
    const effectiveRadius = disease.transmissionRadius * (socialDistancing ? 0.6 : 1.0);
    const speedMultiplier = socialDistancing ? 0.3 : 1.0;
    
    // Movement and disease progression
    for (const agent of agents.current) {
      // Movement (restricted if quarantined and infected)
      if (!quarantine || agent.state !== "I") {
        // Add some randomness to movement
        agent.vx += (Math.random() - 0.5) * 0.5 * speed;
        agent.vy += (Math.random() - 0.5) * 0.5 * speed;
        
        // Limit speed
        const maxSpeed = speedMultiplier * 3 * speed;
        const currentSpeed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
        if (currentSpeed > maxSpeed) {
          agent.vx = (agent.vx / currentSpeed) * maxSpeed;
          agent.vy = (agent.vy / currentSpeed) * maxSpeed;
        }
        
        // Update position
        agent.x += agent.vx;
        agent.y += agent.vy;
        
        // Bounce off walls
        if (agent.x <= 5 || agent.x >= width - 5) {
          agent.vx *= -0.9;
          agent.x = Math.max(5, Math.min(width - 5, agent.x));
        }
        if (agent.y <= 5 || agent.y >= height - 5) {
          agent.vy *= -0.9;
          agent.y = Math.max(5, Math.min(height - 5, agent.y));
        }
        
        // Add regional attraction for spatial modes
        if (simulationMode === 'regions' && agent.region !== undefined) {
          const regions = initializeRegions(width, height, 4);
          const targetRegion = regions[agent.region];
          const dx = targetRegion.x - agent.x;
          const dy = targetRegion.y - agent.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > targetRegion.radius) {
            agent.vx += (dx / dist) * 0.1;
            agent.vy += (dy / dist) * 0.1;
          }
        }
      } else if (agent.state === "I") {
        // Quarantined infected agents slow down significantly
        agent.vx *= 0.95;
        agent.vy *= 0.95;
      }
      
      // Disease state transitions
      if (agent.state === "E" && agent.exposedTimer) {
        agent.exposedTimer--;
        if (agent.exposedTimer <= 0) {
          agent.state = "I";
          agent.timer = Math.floor(disease.infectiousDays.mean * ticksPerDay * (0.75 + Math.random() * 0.5));
        }
      } else if (agent.state === "I") {
        agent.timer--;
        if (agent.timer <= 0) {
          // Determine outcome
          if (Math.random() < disease.cfr) {
            agent.state = "D";
            agent.vx = 0;
            agent.vy = 0;
          } else {
            agent.state = "R";
            agent.immunity = 0.95; // Natural immunity
          }
        }
      }
    }
    
    // Transmission dynamics
    for (const infected of agents.current.filter(a => a.state === "I")) {
      // Contact-based transmission
      let contacts = 0;
      const maxContacts = Math.floor(contactRate / ticksPerDay * speed);
      
      for (const susceptible of agents.current) {
        if (contacts >= maxContacts) break;
        if (susceptible.state !== "S" && susceptible.state !== "V") continue;
        if (susceptible.id === infected.id) continue;
        
        const dx = infected.x - susceptible.x;
        const dy = infected.y - susceptible.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if within transmission radius
        if (distance < effectiveRadius) {
          contacts++;
          
          // Calculate transmission probability based on distance
          const distanceFactor = 1 - (distance / effectiveRadius) * 0.5;
          let transmissionChance = effectiveTransmissionProb * distanceFactor;
          
          // Account for immunity (vaccination or natural)
          if (susceptible.immunity > 0) {
            transmissionChance *= (1 - susceptible.immunity);
          }
          
          // Higher transmission within same household/region
          if (simulationMode === 'households' && infected.household === susceptible.household) {
            transmissionChance *= 2;
          } else if (simulationMode === 'regions' && infected.region === susceptible.region) {
            transmissionChance *= 1.5;
          }
          
          // Transmission occurs
          if (Math.random() < transmissionChance) {
            susceptible.state = "E";
            susceptible.exposedTimer = Math.floor(disease.incubationDays.mean * ticksPerDay * (0.5 + Math.random()));
            susceptible.infectedBy = infected.id;
            susceptible.infectionTime = tickCount;
          }
        }
      }
    }
    
    // Update statistics
    updateStats(agents.current);
    
    // Record history
    if (tickCount % 5 === 0) {
      setHistory(prev => [...prev.slice(-200), {
        t: tickCount,
        S: stats.S,
        E: stats.E,
        I: stats.I,
        R: stats.R,
        D: stats.D,
        V: stats.V,
        rt: stats.rt
      }]);
    }
    
    setTickCount(prev => prev + 1);
  }, [isRunning, speed, disease, socialDistancing, maskWearing, quarantine, contactRate, tickCount, simulationMode, stats]);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual canvas size
    canvas.width = canvasWidth.current;
    canvas.height = canvasHeight.current;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw regions if in regional mode
    if (simulationMode === 'regions') {
      const regions = initializeRegions(canvas.width, canvas.height, 4);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      for (const region of regions) {
        ctx.beginPath();
        ctx.arc(region.x, region.y, region.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw infection zones (very subtle)
    ctx.globalAlpha = 0.05;
    for (const a of agents.current) {
      if (a.state === 'I') {
        const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, disease.transmissionRadius);
        gradient.addColorStop(0, disease.color + '40');
        gradient.addColorStop(1, disease.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(a.x, a.y, disease.transmissionRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Draw agents
    for (const a of agents.current) {
      if (a.state === 'D') continue; // Don't draw dead agents initially
      
      ctx.beginPath();
      
      let size = 3;
      let color = '#3b82f6';
      
      switch (a.state) {
        case 'S':
          color = '#3b82f6';
          size = 3;
          break;
        case 'E':
          color = '#fbbf24';
          size = 3.5;
          break;
        case 'I':
          color = disease.color;
          size = 4;
          // Add glow effect for infected
          ctx.shadowColor = disease.color;
          ctx.shadowBlur = 10;
          break;
        case 'R':
          color = '#22c55e';
          size = 3;
          break;
        case 'V':
          color = '#8b5cf6';
          size = 3;
          break;
      }
      
      ctx.fillStyle = color;
      ctx.arc(a.x, a.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Draw dead agents last (smaller and grayer)
    ctx.fillStyle = '#4b5563';
    for (const a of agents.current.filter(a => a.state === 'D')) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [disease, simulationMode]);

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

  // Initialize on mount or when key parameters change
  useEffect(() => {
    initAgents();
  }, [population, initialInfected, selectedDisease, simulationMode]);

  // Reset simulation
  const handleReset = () => {
    setIsRunning(false);
    setTickCount(0);
    setHistory([]);
    initAgents();
    setTimeout(() => render(), 100);
  };

  // Chart data
  const chartData = {
    labels: history.map(d => `Day ${Math.floor(d.t / ticksPerDay)}`),
    datasets: [
      {
        label: "Susceptible",
        data: history.map(d => d.S),
        borderColor: "#3b82f6",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Exposed",
        data: history.map(d => d.E || 0),
        borderColor: "#fbbf24",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Infected",
        data: history.map(d => d.I),
        borderColor: disease.color,
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      },
      {
        label: "Recovered",
        data: history.map(d => d.R),
        borderColor: "#22c55e",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: { enabled: true }
    },
    scales: {
      x: { 
        display: true,
        grid: { display: false }
      },
      y: { 
        display: true,
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    },
    animation: { duration: 0 }
  };

  // Export simulation data
  const handleExport = () => {
    const data = {
      metadata: {
        disease: disease.name,
        date: new Date().toISOString(),
        parameters: {
          population,
          initialInfected,
          vaccinationCoverage: vaccinationRate,
          contactRate,
          simulationMode
        },
        interventions: {
          socialDistancing,
          maskWearing,
          quarantine,
          vaccination
        }
      },
      epidemiology: {
        basicReproductionNumber: disease.r0.typical,
        effectiveReproductionNumber: stats.rt,
        attackRate: ((stats.totalCases / population) * 100).toFixed(2) + '%',
        caseFatalityRate: (stats.D > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(2) : '0') + '%',
        peakInfected: stats.peakInfected,
        daysToEnd: stats.day
      },
      timeline: history,
      finalState: stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epidemic_simulation_${disease.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SimulationContainer $isDark={isDark}>
      {/* Video-like Section */}
      <VideoSection>
        <CanvasContainer>
          <SimCanvas ref={canvasRef} />
          
          {/* HUD Overlay */}
          <HUD $isDark={isDark}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Day {stats.day}
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Susceptible:</span>
                <span style={{ fontWeight: 600 }}>{stats.S}</span>
              </div>
              {stats.E > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7, color: '#fbbf24' }}>Exposed:</span>
                  <span style={{ fontWeight: 600, color: '#fbbf24' }}>{stats.E}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7, color: disease.color }}>Infected:</span>
                <span style={{ fontWeight: 600, color: disease.color }}>{stats.I}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7, color: '#22c55e' }}>Recovered:</span>
                <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.R}</span>
              </div>
              {stats.D > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7, color: '#6b7280' }}>Deaths:</span>
                  <span style={{ fontWeight: 600, color: '#6b7280' }}>{stats.D}</span>
                </div>
              )}
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ opacity: 0.7 }}>R(t):</span>
                  <span style={{ 
                    fontWeight: 700, 
                    color: stats.rt > 1 ? '#ef4444' : '#22c55e' 
                  }}>
                    {stats.rt.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </HUD>
          
          {/* Disease Selector */}
          <DiseaseSelector>
            <button
              onClick={() => setShowDiseaseDropdown(!showDiseaseDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <Bug size={16} style={{ color: disease.color }} />
              {disease.name}
              <ChevronDown size={14} />
            </button>
            
            {showDiseaseDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.5rem',
                minWidth: '250px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 100
              }}>
                {Object.values(DISEASE_PROFILES).map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDisease(d.id);
                      setShowDiseaseDropdown(false);
                      handleReset();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.75rem',
                      background: d.id === selectedDisease ? `${d.color}20` : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      borderRadius: '4px',
                      textAlign: 'left',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: d.color,
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                        R₀: {d.r0.typical} | CFR: {(d.cfr * 100).toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </DiseaseSelector>
          
          {/* Playback Controls */}
          <PlaybackControls>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
            </button>
            
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <RefreshCw size={24} />
            </button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0 1rem',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Speed:</span>
              <input
                type="range"
                min={0.25}
                max={3}
                step={0.25}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{
                  width: '80px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '35px' }}>
                {speed}x
              </span>
            </div>
          </PlaybackControls>
          
          {/* Speed Indicator */}
          <SpeedIndicator>
            <Zap size={14} />
            {speed}x Speed
          </SpeedIndicator>
        </CanvasContainer>
      </VideoSection>
      
      {/* Controls Section Below */}
      <ControlsSection $isDark={isDark}>
        {/* Tabs */}
        <TabContainer>
          <Tab 
            $active={activeTab === 'parameters'}
            onClick={() => setActiveTab('parameters')}
          >
            <Settings size={16} style={{ marginRight: '0.5rem' }} />
            Parameters
          </Tab>
          <Tab 
            $active={activeTab === 'interventions'}
            onClick={() => setActiveTab('interventions')}
          >
            <Shield size={16} style={{ marginRight: '0.5rem' }} />
            Interventions
          </Tab>
          <Tab 
            $active={activeTab === 'statistics'}
            onClick={() => setActiveTab('statistics')}
          >
            <BarChart3 size={16} style={{ marginRight: '0.5rem' }} />
            Statistics
          </Tab>
        </TabContainer>
        
        {/* Tab Content */}
        <TabContent>
          {activeTab === 'parameters' && (
            <Grid $columns={3} $gap="1.5rem">
              <ParameterControl>
                <div className="header">
                  <span className="label">Population Size</span>
                  <span className="value">{population}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={population}
                  onChange={(e) => setPopulation(Number(e.target.value))}
                  disabled={isRunning}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Initial Infected</span>
                  <span className="value">{initialInfected}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={initialInfected}
                  onChange={(e) => setInitialInfected(Number(e.target.value))}
                  disabled={isRunning}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Contact Rate (per day)</span>
                  <span className="value">{contactRate}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={contactRate}
                  onChange={(e) => setContactRate(Number(e.target.value))}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Vaccination Coverage</span>
                  <span className="value">{Math.round(vaccinationRate * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={vaccinationRate}
                  onChange={(e) => setVaccinationRate(Number(e.target.value))}
                  disabled={isRunning}
                />
              </ParameterControl>
              
              <ParameterControl>
                <div className="header">
                  <span className="label">Spatial Model</span>
                  <span className="value">{simulationMode}</span>
                </div>
                <select
                  value={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.value as SimulationMode)}
                  disabled={isRunning}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--color-background-tertiary)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '4px',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="homogeneous">Homogeneous Mixing</option>
                  <option value="regions">Regional Clusters</option>
                  <option value="households">Household Structure</option>
                </select>
              </ParameterControl>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <BaseButton
                  onClick={handleExport}
                  $variant="secondary"
                  $size="sm"
                  style={{ flex: 1 }}
                >
                  <Download size={14} />
                  Export Data
                </BaseButton>
              </div>
            </Grid>
          )}
          
          {activeTab === 'interventions' && (
            <>
              <InterventionGrid>
                <InterventionCard
                  $active={socialDistancing}
                  $color="#3b82f6"
                  onClick={() => setSocialDistancing(!socialDistancing)}
                >
                  <Users size={24} className="icon" />
                  <div className="name">Social Distancing</div>
                  <div className="efficacy">
                    {Math.round((disease.interventions.distancing?.efficacy || 0) * 100)}% effective
                  </div>
                </InterventionCard>
                
                <InterventionCard
                  $active={maskWearing}
                  $color="#10b981"
                  onClick={() => setMaskWearing(!maskWearing)}
                >
                  <Shield size={24} className="icon" />
                  <div className="name">Mask Wearing</div>
                  <div className="efficacy">
                    {Math.round((disease.interventions.masks?.efficacy || 0) * 100)}% effective
                  </div>
                </InterventionCard>
                
                <InterventionCard
                  $active={quarantine}
                  $color="#f59e0b"
                  onClick={() => setQuarantine(!quarantine)}
                >
                  <Home size={24} className="icon" />
                  <div className="name">Quarantine</div>
                  <div className="efficacy">
                    {Math.round((disease.interventions.quarantine?.efficacy || 0) * 100)}% effective
                  </div>
                </InterventionCard>
                
                <InterventionCard
                  $active={vaccination}
                  $color="#8b5cf6"
                  onClick={() => setVaccination(!vaccination)}
                >
                  <Heart size={24} className="icon" />
                  <div className="name">Vaccination</div>
                  <div className="efficacy">
                    {Math.round((disease.interventions.vaccination?.efficacy || 0) * 100)}% effective
                  </div>
                </InterventionCard>
              </InterventionGrid>
              
              <Spacer $height="1.5rem" />
              
              <Card>
                <CardContent>
                  <Heading3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                    Disease Characteristics: {disease.name}
                  </Heading3>
                  <Grid $columns={2} $gap="1rem">
                    <div>
                      <BodyText style={{ fontSize: '0.875rem' }}>
                        <strong>Pathogen:</strong> {disease.pathogen}<br />
                        <strong>Transmission:</strong> {disease.transmissionMode}<br />
                        <strong>Basic R₀:</strong> {disease.r0.min}-{disease.r0.max} (typical: {disease.r0.typical})
                      </BodyText>
                    </div>
                    <div>
                      <BodyText style={{ fontSize: '0.875rem' }}>
                        <strong>Incubation:</strong> {disease.incubationDays.min}-{disease.incubationDays.max} days<br />
                        <strong>Infectious Period:</strong> {disease.infectiousDays.mean} days<br />
                        <strong>Case Fatality Rate:</strong> {(disease.cfr * 100).toFixed(1)}%
                      </BodyText>
                    </div>
                  </Grid>
                </CardContent>
              </Card>
            </>
          )}
          
          {activeTab === 'statistics' && (
            <>
              <Grid $columns={4} $gap="1rem">
                <StatCard $color="#3b82f6">
                  <div className="label">Susceptible</div>
                  <div className="value">{stats.S}</div>
                  <div className="change">
                    {((stats.S / population) * 100).toFixed(1)}% of population
                  </div>
                </StatCard>
                
                <StatCard $color="#fbbf24">
                  <div className="label">Exposed</div>
                  <div className="value">{stats.E}</div>
                  <div className="change">
                    Incubating infection
                  </div>
                </StatCard>
                
                <StatCard $color={disease.color} $alert={stats.I > population * 0.1}>
                  <div className="label">Infected</div>
                  <div className="value">{stats.I}</div>
                  <div className="change">
                    Peak: {stats.peakInfected}
                  </div>
                </StatCard>
                
                <StatCard $color="#22c55e">
                  <div className="label">Recovered</div>
                  <div className="value">{stats.R}</div>
                  <div className="change">
                    {((stats.R / population) * 100).toFixed(1)}% immune
                  </div>
                </StatCard>
                
                {stats.V > 0 && (
                  <StatCard $color="#8b5cf6">
                    <div className="label">Vaccinated</div>
                    <div className="value">{stats.V}</div>
                    <div className="change">
                      {((stats.V / population) * 100).toFixed(1)}% coverage
                    </div>
                  </StatCard>
                )}
                
                {stats.D > 0 && (
                  <StatCard $color="#6b7280">
                    <div className="label">Deaths</div>
                    <div className="value">{stats.D}</div>
                    <div className="change">
                      CFR: {stats.totalCases > 0 ? ((stats.D / stats.totalCases) * 100).toFixed(2) : '0'}%
                    </div>
                  </StatCard>
                )}
                
                <StatCard $color={stats.rt > 1 ? '#ef4444' : '#22c55e'}>
                  <div className="label">R(t) - Effective</div>
                  <div className="value">{stats.rt.toFixed(2)}</div>
                  <div className="change">
                    {stats.rt > 1 ? 'Outbreak growing' : 'Outbreak declining'}
                  </div>
                </StatCard>
                
                <StatCard $color="#06b6d4">
                  <div className="label">Attack Rate</div>
                  <div className="value">
                    {((stats.totalCases / population) * 100).toFixed(1)}%
                  </div>
                  <div className="change">
                    Total cases: {stats.totalCases}
                  </div>
                </StatCard>
              </Grid>
              
              <Spacer $height="1.5rem" />
              
              <Card>
                <CardContent>
                  <Heading3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                    Epidemic Curve
                  </Heading3>
                  <div style={{ height: '200px' }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabContent>
      </ControlsSection>
    </SimulationContainer>
  );
}