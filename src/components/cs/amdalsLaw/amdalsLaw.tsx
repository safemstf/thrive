import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  bg: '#0a0e1a',
  surface: '#141414',
  border: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  primary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

interface Drop {
  x: number;
  y: number;
  speed: number;
  inBottleneck: boolean;
  waitTime: number;
}

const W = 500;
const H = 600;

export default function AmdahlRain() {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftDrops = useRef<Drop[]>([]);
  const rightDrops = useRef<Drop[]>([]);
  const frameCount = useRef(0);
  
  const [isRunning, setIsRunning] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cores, setCores] = useState(8);
  const [serialPercent, setSerialPercent] = useState(30);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  const serialPortion = serialPercent / 100;
  const speedup = 1 / (serialPortion + (1 - serialPortion) / cores);
  const efficiency = (speedup / cores) * 100;
  
  // Dynamic bottleneck - narrows with more serial work
  const BOTTLENECK_Y = 400;
  const BOTTLENECK_WIDTH = 30 + (1 - serialPortion) * 120; // 30px (narrow) to 150px (wide)

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      if (!isRunning) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      frameCount.current++;

      // Spawn new raindrops every few frames
      if (frameCount.current % 5 === 0) {
        for (let i = 0; i < cores; i++) {
          if (Math.random() < 0.3) {
            leftDrops.current.push({
              x: (i + 0.5) * (W / cores),
              y: 0,
              speed: 4,
              inBottleneck: false,
              waitTime: 0
            });
            rightDrops.current.push({
              x: (i + 0.5) * (W / cores),
              y: 0,
              speed: 4,
              inBottleneck: false,
              waitTime: 0
            });
          }
        }
      }

      // Update left drops (perfect parallel scaling)
      const baseSpeed = 4;
      for (let i = leftDrops.current.length - 1; i >= 0; i--) {
        const drop = leftDrops.current[i];
        // Perfect scaling: speed × number of cores
        drop.y += baseSpeed * cores;
        
        if (drop.y > H) {
          leftDrops.current.splice(i, 1);
          setLeftCount(c => c + 1);
        }
      }

      // Update right drops (with bottleneck - scales according to Amdahl's law)
      const dropsInBottleneck = rightDrops.current.filter(d => d.inBottleneck).length;
      // Bottleneck capacity scales with available parallel portion
      const bottleneckCapacity = Math.max(1, Math.floor((1 - serialPortion) * 3));
      
      for (let i = rightDrops.current.length - 1; i >= 0; i--) {
        const drop = rightDrops.current[i];
        
        // Check if entering bottleneck zone
        if (drop.y >= BOTTLENECK_Y && drop.y < BOTTLENECK_Y + 100) {
          const bottleneckX = W / 2;
          const distanceFromCenter = Math.abs(drop.x - bottleneckX);
          
          // Only allow drops near center to enter
          if (distanceFromCenter < BOTTLENECK_WIDTH / 2) {
            if (!drop.inBottleneck && dropsInBottleneck < bottleneckCapacity) {
              drop.inBottleneck = true;
            }
            
            if (drop.inBottleneck) {
              // Speed through bottleneck based on serial portion
              drop.y += baseSpeed * (1 - serialPortion * 0.8);
            } else {
              drop.y += 0.3; // Wait in queue
              drop.waitTime++;
            }
          } else {
            // Push towards center
            drop.x += (bottleneckX - drop.x) * 0.05;
            drop.y += 0.5;
          }
          
          if (drop.y >= BOTTLENECK_Y + 100) {
            drop.inBottleneck = false;
          }
        } else {
          // Speed scales with actual speedup from Amdahl's law
          drop.y += baseSpeed * speedup;
        }
        
        if (drop.y > H) {
          rightDrops.current.splice(i, 1);
          setRightCount(c => c + 1);
        }
      }

      // Render left canvas
      const leftCtx = leftCanvasRef.current?.getContext('2d');
      if (leftCtx) {
        leftCtx.fillStyle = COLORS.bg;
        leftCtx.fillRect(0, 0, W, H);
        
        // Draw lanes
        leftCtx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        leftCtx.lineWidth = 1;
        const laneWidth = W / cores;
        for (let i = 1; i < cores; i++) {
          leftCtx.beginPath();
          leftCtx.moveTo(i * laneWidth, 0);
          leftCtx.lineTo(i * laneWidth, H);
          leftCtx.stroke();
        }
        
        // Draw drops
        leftCtx.strokeStyle = 'rgba(100, 180, 255, 0.8)';
        leftCtx.lineWidth = 2;
        for (const drop of leftDrops.current) {
          leftCtx.beginPath();
          leftCtx.moveTo(drop.x, drop.y - 15);
          leftCtx.lineTo(drop.x, drop.y);
          leftCtx.stroke();
        }
      }

      // Render right canvas
      const rightCtx = rightCanvasRef.current?.getContext('2d');
      if (rightCtx) {
        rightCtx.fillStyle = COLORS.bg;
        rightCtx.fillRect(0, 0, W, H);
        
        // Draw lanes (only above bottleneck)
        rightCtx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        rightCtx.lineWidth = 1;
        const laneWidth = W / cores;
        for (let i = 1; i < cores; i++) {
          rightCtx.beginPath();
          rightCtx.moveTo(i * laneWidth, 0);
          rightCtx.lineTo(i * laneWidth, BOTTLENECK_Y - 20);
          rightCtx.stroke();
        }
        
        // Draw bottleneck zone
        rightCtx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        rightCtx.fillRect(0, BOTTLENECK_Y - 20, W, 140);
        
        // Draw funnel
        const centerX = W / 2;
        rightCtx.strokeStyle = COLORS.danger;
        rightCtx.lineWidth = 4;
        
        rightCtx.beginPath();
        rightCtx.moveTo(0, BOTTLENECK_Y);
        rightCtx.lineTo(centerX - BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 50);
        rightCtx.lineTo(centerX - BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 100);
        rightCtx.lineTo(0, BOTTLENECK_Y + 120);
        rightCtx.stroke();
        
        rightCtx.beginPath();
        rightCtx.moveTo(W, BOTTLENECK_Y);
        rightCtx.lineTo(centerX + BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 50);
        rightCtx.lineTo(centerX + BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 100);
        rightCtx.lineTo(W, BOTTLENECK_Y + 120);
        rightCtx.stroke();
        
        // Bottleneck opening
        rightCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        rightCtx.fillRect(centerX - BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 50, BOTTLENECK_WIDTH, 50);
        rightCtx.strokeStyle = COLORS.danger;
        rightCtx.lineWidth = 4;
        rightCtx.strokeRect(centerX - BOTTLENECK_WIDTH / 2, BOTTLENECK_Y + 50, BOTTLENECK_WIDTH, 50);
        
        // Bottleneck label
        rightCtx.fillStyle = COLORS.danger;
        rightCtx.font = 'bold 13px sans-serif';
        rightCtx.textAlign = 'center';
        rightCtx.fillText('SERIAL BOTTLENECK', centerX, BOTTLENECK_Y + 78);
        rightCtx.font = '11px sans-serif';
        rightCtx.fillText(`${serialPercent}% single-threaded`, centerX, BOTTLENECK_Y + 93);
        
        // Draw drops
        for (const drop of rightDrops.current) {
          if (drop.inBottleneck) {
            rightCtx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
          } else if (drop.waitTime > 0) {
            rightCtx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
          } else {
            rightCtx.strokeStyle = 'rgba(100, 180, 255, 0.8)';
          }
          
          rightCtx.lineWidth = 2;
          rightCtx.beginPath();
          rightCtx.moveTo(drop.x, drop.y - 15);
          rightCtx.lineTo(drop.x, drop.y);
          rightCtx.stroke();
        }
        
        // Queue count
        const queueCount = rightDrops.current.filter(d => 
          d.y >= BOTTLENECK_Y - 50 && d.y < BOTTLENECK_Y + 100 && !d.inBottleneck
        ).length;
        
        if (queueCount > 0) {
          rightCtx.fillStyle = 'rgba(239, 68, 68, 0.95)';
          rightCtx.fillRect(10, BOTTLENECK_Y - 50, 110, 40);
          rightCtx.fillStyle = COLORS.text;
          rightCtx.font = 'bold 20px monospace';
          rightCtx.fillText(`${queueCount} waiting`, 15, BOTTLENECK_Y - 22);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, cores, serialPercent]);

  const reset = () => {
    leftDrops.current = [];
    rightDrops.current = [];
    frameCount.current = 0;
    setLeftCount(0);
    setRightCount(0);
  };

  const speedupData = Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    return {
      cores: n,
      'Ideal': n,
      'Actual': 1 / (serialPortion + (1 - serialPortion) / n)
    };
  });

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      padding: '2rem 1rem',
      paddingBottom: '120px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Amdahl's Law
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '1.05rem', margin: 0, fontWeight: 400 }}>
            Why parallel computing has fundamental limits
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'rgba(20, 20, 20, 0.4)',
          borderRadius: '16px',
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Speedup</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: COLORS.primary, fontFamily: 'monospace', lineHeight: 1 }}>
              {speedup.toFixed(2)}×
            </div>
            <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
              vs {cores}× ideal
            </div>
          </div>
          <div style={{ width: '1px', background: COLORS.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Efficiency</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: efficiency > 70 ? COLORS.success : COLORS.warning, fontFamily: 'monospace', lineHeight: 1 }}>
              {efficiency.toFixed(0)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
              of {cores} cores
            </div>
          </div>
          <div style={{ width: '1px', background: COLORS.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Ideal Completed</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: COLORS.success, fontFamily: 'monospace', lineHeight: 1 }}>
              {leftCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
              {cores}× throughput
            </div>
          </div>
          <div style={{ width: '1px', background: COLORS.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Actual Completed</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: COLORS.danger, fontFamily: 'monospace', lineHeight: 1 }}>
              {rightCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary, marginTop: '0.5rem' }}>
              {leftCount > 0 ? `${((rightCount / leftCount) * cores).toFixed(2)}× throughput` : '—'}
            </div>
          </div>
        </div>

        {/* Canvases */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.03)',
            borderRadius: '16px',
            border: `2px solid ${COLORS.success}`,
            overflow: 'hidden',
            boxShadow: `0 8px 32px rgba(16, 185, 129, 0.15)`
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(16, 185, 129, 0.08)',
              borderBottom: `1px solid ${COLORS.success}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.success, marginBottom: '0.25rem' }}>
                  IDEAL: Perfect Parallelization
                </div>
                <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                  All {cores} cores working at full speed
                </div>
              </div>
              <div style={{
                background: COLORS.success,
                color: COLORS.bg,
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                fontFamily: 'monospace'
              }}>
                {cores}×
              </div>
            </div>
            <canvas
              ref={leftCanvasRef}
              width={W}
              height={H}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          
          <div style={{
            background: 'rgba(239, 68, 68, 0.03)',
            borderRadius: '16px',
            border: `2px solid ${COLORS.danger}`,
            overflow: 'hidden',
            boxShadow: `0 8px 32px rgba(239, 68, 68, 0.15)`
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(239, 68, 68, 0.08)',
              borderBottom: `1px solid ${COLORS.danger}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.danger, marginBottom: '0.25rem' }}>
                  REALITY: Serial Bottleneck
                </div>
                <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                  {serialPercent}% must execute single-threaded
                </div>
              </div>
              <div style={{
                background: COLORS.danger,
                color: COLORS.bg,
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                fontFamily: 'monospace'
              }}>
                {speedup.toFixed(2)}×
              </div>
            </div>
            <canvas
              ref={rightCanvasRef}
              width={W}
              height={H}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 14, 26, 0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: `2px solid ${COLORS.border}`,
        maxHeight: drawerOpen ? '60vh' : '60px',
        transition: 'max-height 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'transparent',
            border: 'none',
            color: COLORS.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}
        >
          {drawerOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          <span>Controls</span>
        </button>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '1.5rem', marginBottom: '2rem', alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.75rem', fontWeight: 600 }}>
                  CPU Cores
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS.primary, marginBottom: '0.75rem', fontFamily: 'monospace', lineHeight: 1 }}>
                  {cores}
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={cores}
                  onChange={(e) => {
                    setCores(parseInt(e.target.value));
                    reset();
                  }}
                  style={{ width: '100%', height: '6px', accentColor: COLORS.primary }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.textSecondary, marginBottom: '0.75rem', fontWeight: 600 }}>
                  Serial Bottleneck
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS.danger, marginBottom: '0.75rem', fontFamily: 'monospace', lineHeight: 1 }}>
                  {serialPercent}%
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="10"
                  value={serialPercent}
                  onChange={(e) => {
                    setSerialPercent(parseInt(e.target.value));
                    reset();
                  }}
                  style={{ width: '100%', height: '6px', accentColor: COLORS.danger }}
                />
              </div>

              <button
                onClick={() => setIsRunning(!isRunning)}
                style={{
                  padding: '1.25rem 1.75rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isRunning ? COLORS.danger : COLORS.success,
                  color: COLORS.bg,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.95rem',
                  transition: 'transform 0.2s',
                  boxShadow: `0 4px 12px ${isRunning ? COLORS.danger : COLORS.success}40`
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause' : 'Start'}
              </button>

              <button
                onClick={reset}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: `1px solid ${COLORS.border}`,
                  background: 'transparent',
                  color: COLORS.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = COLORS.surface;
                  e.currentTarget.style.color = COLORS.text;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = COLORS.textSecondary;
                }}
              >
                <RotateCcw size={18} />
              </button>
            </div>

            <div style={{ 
              background: 'rgba(20, 20, 20, 0.6)', 
              padding: '2rem', 
              borderRadius: '16px', 
              border: `1px solid ${COLORS.border}`,
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: COLORS.text }}>
                Speedup Analysis
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={speedupData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} opacity={0.3} />
                    <XAxis 
                      dataKey="cores" 
                      stroke={COLORS.textSecondary} 
                      style={{ fontSize: '0.85rem' }}
                      label={{ value: 'CPU Cores', position: 'insideBottom', offset: -5, fill: COLORS.textSecondary }}
                    />
                    <YAxis 
                      stroke={COLORS.textSecondary} 
                      style={{ fontSize: '0.85rem' }}
                      label={{ value: 'Speedup', angle: -90, position: 'insideLeft', fill: COLORS.textSecondary }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: COLORS.surface, 
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="Ideal" stroke={COLORS.success} strokeWidth={3} dot={{ r: 5, fill: COLORS.success }} />
                    <Line type="monotone" dataKey="Actual" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 5, fill: COLORS.danger }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${COLORS.primary}30`
            }}>
              <div style={{ fontSize: '0.95rem', color: COLORS.text, lineHeight: 1.7 }}>
                <strong style={{ color: COLORS.primary }}>Amdahl's Law:</strong> Even with infinite processors, speedup is limited by the serial portion. 
                With <strong>{serialPercent}%</strong> serial code, maximum theoretical speedup is <strong>{(1 / serialPortion).toFixed(2)}×</strong> 
                — no matter how many cores you add. Notice how the bottleneck funnel <strong>narrows</strong> as you increase the serial percentage, 
                visually showing the constraint on parallel throughput.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}