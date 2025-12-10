import React, { useState, useEffect, useRef } from 'react';
// 5G vs 6G Massive MIMO Comparison
// Demonstrates the fundamental paradigm shift that drives 6G development

interface User {
  id: string;
  angle: number;
  dist: number;
}

interface Scenario {
  name: string;
  desc: string;
  why: string;
  users: User[];
}

export default function MIMOComparison() {
  const canvas5GRef = useRef<HTMLCanvasElement>(null);
  const canvas6GRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [scenario, setScenario] = useState(0);

  // Scenarios that demonstrate key differences
  const scenarios: Scenario[] = [
    {
      name: 'Depth-of-Focus',
      desc: 'Two users at same angle, different distances',
      why: '5G cannot separate users at the same angle. 6G uses distance focusing to serve both.',
      users: [
        { id: 'A', angle: 0, dist: 60 },
        { id: 'B', angle: 0, dist: 140 },
      ]
    },
    {
      name: 'Dense Deployment',
      desc: 'Multiple users clustered in similar directions',
      why: '6G enables higher user density by exploiting the distance dimension for spatial multiplexing.',
      users: [
        { id: 'A', angle: -15, dist: 50 },
        { id: 'B', angle: -15, dist: 120 },
        { id: 'C', angle: 20, dist: 70 },
        { id: 'D', angle: 20, dist: 150 },
      ]
    },
    {
      name: 'Angle Separation',
      desc: 'Users at different angles (both work)',
      why: 'When users are at different angles, both 5G and 6G can separate them effectively.',
      users: [
        { id: 'A', angle: -35, dist: 100 },
        { id: 'B', angle: 0, dist: 90 },
        { id: 'C', angle: 35, dist: 110 },
      ]
    },
    {
      name: 'Near-Field Advantage',
      desc: 'Close-range high-capacity scenario',
      why: 'Indoor/hotspot deployments where users are within the 6G near-field region.',
      users: [
        { id: 'A', angle: -10, dist: 30 },
        { id: 'B', angle: -10, dist: 80 },
        { id: 'C', angle: 10, dist: 40 },
        { id: 'D', angle: 10, dist: 90 },
        { id: 'E', angle: 0, dist: 60 },
      ]
    },
  ];

  const current = scenarios[scenario];

  // Group users by angle for 5G interference calculation
  function getAngleGroups(users: User[]): Record<number, User[]> {
    const groups: Record<number, User[]> = {};
    users.forEach(u => {
      const key = Math.round(u.angle / 10) * 10;
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    });
    return groups;
  }

  // Animation
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTime(t => t + 0.05), 50);
    return () => clearInterval(id);
  }, [isRunning]);

  // Draw 5G panel
  useEffect(() => {
    const canvas = canvas5GRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    
    draw5G(ctx, W, H, current.users, time);
  }, [time, current]);

  // Draw 6G panel
  useEffect(() => {
    const canvas = canvas6GRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    
    draw6G(ctx, W, H, current.users, time);
  }, [time, current]);

  function draw5G(ctx: CanvasRenderingContext2D, W: number, H: number, users: User[], t: number) {
    const cx = W / 2;
    const cy = H - 50;
    const scale = 2.2;
    const groups = getAngleGroups(users);

    // Background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('5G Massive MIMO', cx, 30);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText('Far-Field: Angle-Only Beamforming', cx, 48);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let r = 50; r <= 200; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, Math.PI, 0, true);
      ctx.stroke();
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(r + 'm', cx + r * scale + 4, cy - 4);
    }

    // Draw beams (one per angle group)
    const drawnAngles = new Set<number>();
    Object.entries(groups).forEach(([key, groupUsers]) => {
      const ang = parseInt(key);
      if (drawnAngles.has(ang)) return;
      drawnAngles.add(ang);

      const rad = (ang - 90) * Math.PI / 180;
      const conflict = groupUsers.length > 1;
      const beamW = 12 * Math.PI / 180;

      // Beam fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 200 * scale, rad - beamW, rad + beamW);
      ctx.closePath();
      
      const alpha = 0.15 + 0.1 * Math.sin(t * 3);
      ctx.fillStyle = conflict 
        ? `rgba(239, 68, 68, ${alpha})` 
        : `rgba(59, 130, 246, ${alpha})`;
      ctx.fill();

      // Plane wave fronts
      for (let i = 0; i < 5; i++) {
        const progress = ((t * 0.4 + i * 0.2) % 1);
        const waveR = progress * 200 * scale;
        
        ctx.beginPath();
        ctx.arc(cx, cy, waveR, rad - beamW * 0.8, rad + beamW * 0.8);
        ctx.strokeStyle = conflict
          ? `rgba(239, 68, 68, ${0.6 * (1 - progress)})`
          : `rgba(59, 130, 246, ${0.5 * (1 - progress)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Conflict label
      if (conflict) {
        const lx = cx + Math.cos(rad) * 80 * scale;
        const ly = cy + Math.sin(rad) * 80 * scale;
        
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('INTERFERENCE', lx, ly);
        ctx.font = '10px Arial';
        ctx.fillText(groupUsers.length + ' users share beam', lx, ly + 14);
      }
    });

    // Draw users
    users.forEach(u => {
      const rad = (u.angle - 90) * Math.PI / 180;
      const ux = cx + Math.cos(rad) * u.dist * scale;
      const uy = cy + Math.sin(rad) * u.dist * scale;

      const key = Math.round(u.angle / 10) * 10;
      const conflict = groups[key].length > 1;

      // User dot
      ctx.beginPath();
      ctx.arc(ux, uy, 10, 0, Math.PI * 2);
      ctx.fillStyle = conflict ? '#fbbf24' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = conflict ? '#dc2626' : '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(u.id, ux, uy + 4);

      // Rate
      ctx.font = '9px Arial';
      ctx.fillStyle = conflict ? '#fbbf24' : '#22c55e';
      const rate = conflict ? `1/${groups[key].length} rate` : 'Full rate';
      ctx.fillText(rate, ux, uy + 22);
    });

    // Base station
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 35, cy - 12, 70, 24);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 35, cy - 12, 70, 24);
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Base Station', cx, cy + 4);

    // Stats
    const conflictCount = Object.values(groups).filter(g => g.length > 1).flat().length;
    const beamCount = Object.keys(groups).length;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, H - 70, W - 20, 60);
    ctx.strokeStyle = conflictCount > 0 ? '#dc2626' : '#22c55e';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, H - 70, W - 20, 60);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    ctx.fillText(`Beams: ${beamCount}`, 20, H - 50);
    ctx.fillText(`Users: ${users.length}`, 20, H - 35);
    
    ctx.fillStyle = conflictCount > 0 ? '#f87171' : '#4ade80';
    ctx.fillText(`Conflicts: ${conflictCount}`, 20, H - 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('Rayleigh: ~6m (users in far-field)', W - 20, H - 50);
    ctx.fillText('Cannot separate by distance', W - 20, H - 35);
  }

  function draw6G(ctx: CanvasRenderingContext2D, W: number, H: number, users: User[], t: number) {
    const cx = W / 2;
    const cy = H - 50;
    const scale = 2.2;

    // Background
    ctx.fillStyle = '#0d0a14';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('6G Massive MIMO', cx, 30);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText('Near-Field: Angle + Distance Focusing', cx, 48);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let r = 50; r <= 200; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, Math.PI, 0, true);
      ctx.stroke();
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(r + 'm', cx + r * scale + 4, cy - 4);
    }

    // Draw focused beams to each user
    users.forEach(u => {
      const rad = (u.angle - 90) * Math.PI / 180;
      const ux = cx + Math.cos(rad) * u.dist * scale;
      const uy = cy + Math.sin(rad) * u.dist * scale;

      // Focus point glow
      const pulse = 0.4 + 0.3 * Math.sin(t * 4 + u.dist * 0.03);
      const grad = ctx.createRadialGradient(ux, uy, 0, ux, uy, 40);
      grad.addColorStop(0, `rgba(168, 85, 247, ${pulse})`);
      grad.addColorStop(0.6, `rgba(168, 85, 247, ${pulse * 0.3})`);
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      
      ctx.beginPath();
      ctx.arc(ux, uy, 40, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Converging spherical waves
      for (let i = 0; i < 4; i++) {
        const progress = ((t * 0.35 + i * 0.25) % 1);
        const waveR = (1 - progress) * u.dist * scale * 0.6;
        
        if (waveR > 5) {
          ctx.beginPath();
          ctx.arc(ux, uy, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${progress * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Beam line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ux, uy);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw users
    users.forEach(u => {
      const rad = (u.angle - 90) * Math.PI / 180;
      const ux = cx + Math.cos(rad) * u.dist * scale;
      const uy = cy + Math.sin(rad) * u.dist * scale;

      // User dot
      ctx.beginPath();
      ctx.arc(ux, uy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(u.id, ux, uy + 4);

      // Rate
      ctx.font = '9px Arial';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Full rate', ux, uy + 22);
    });

    // Base station
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 35, cy - 12, 70, 24);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 35, cy - 12, 70, 24);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Base Station', cx, cy + 4);

    // Stats
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(10, H - 70, W - 20, 60);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, H - 70, W - 20, 60);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    ctx.fillText(`Beams: ${users.length}`, 20, H - 50);
    ctx.fillText(`Users: ${users.length}`, 20, H - 35);
    
    ctx.fillStyle = '#4ade80';
    ctx.fillText('Conflicts: 0', 20, H - 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('Rayleigh: ~667m (users in near-field)', W - 20, H - 50);
    ctx.fillText('Separates by angle AND distance', W - 20, H - 35);
  }

  // Calculate metrics
  const groups = getAngleGroups(current.users);
  const conflicts5G = Object.values(groups).filter(g => g.length > 1).flat().length;
  const capacity5G = current.users.reduce((sum, u) => {
    const key = Math.round(u.angle / 10) * 10;
    return sum + (1 / groups[key].length);
  }, 0);
  const capacity6G = current.users.length;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#030305',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>
            Why 6G? The Near-Field Paradigm Shift
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Visualizing the fundamental capability gap between 5G and 6G Massive MIMO
          </p>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            padding: '8px 20px',
            backgroundColor: isRunning ? '#475569' : '#22c55e',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {isRunning ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Scenario selector */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ color: '#94a3b8', marginRight: '8px' }}>Scenario:</span>
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setScenario(i)}
            style={{
              padding: '8px 16px',
              backgroundColor: scenario === i ? '#6366f1' : '#1e293b',
              border: scenario === i ? '2px solid #818cf8' : '2px solid #334155',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Canvases */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2px',
        backgroundColor: '#1e293b'
      }}>
        <canvas ref={canvas5GRef} width={600} height={500} style={{ width: '100%', height: 'auto' }} />
        <canvas ref={canvas6GRef} width={600} height={500} style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* Analysis panel */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid #1e293b',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Scenario info */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ margin: '0 0 8px', color: '#f59e0b', fontSize: '1rem' }}>
            {current.name}
          </h3>
          <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '0.85rem' }}>
            {current.desc}
          </p>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>Why it matters:</strong> {current.why}
          </p>
        </div>

        {/* 5G metrics */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 12px', color: '#3b82f6', fontSize: '1rem' }}>
            5G Result
          </h3>
          <div style={{ fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Beams used:</span>
              <span style={{ color: '#60a5fa' }}>{Object.keys(groups).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Users affected:</span>
              <span style={{ color: conflicts5G > 0 ? '#f87171' : '#4ade80' }}>{conflicts5G}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Effective capacity:</span>
              <span style={{ color: '#60a5fa' }}>{(capacity5G * 100 / current.users.length).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* 6G metrics */}
        <div style={{
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 12px', color: '#a855f7', fontSize: '1rem' }}>
            6G Result
          </h3>
          <div style={{ fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Beams used:</span>
              <span style={{ color: '#c084fc' }}>{capacity6G}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Users affected:</span>
              <span style={{ color: '#4ade80' }}>0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Effective capacity:</span>
              <span style={{ color: '#c084fc' }}>100%</span>
            </div>
          </div>
        </div>

        {/* Gain */}
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>6G Advantage</span>
          <span style={{ color: '#22c55e', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {(capacity6G / capacity5G).toFixed(1)}×
          </span>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>capacity gain</span>
        </div>
      </div>

      {/* Technical footer */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid #1e293b',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <span>
          <strong style={{ color: '#94a3b8' }}>Rayleigh Distance:</strong> R = 2D²/λ
        </span>
        <span>
          <strong style={{ color: '#3b82f6' }}>5G (3.5 GHz):</strong> R ≈ 6m → far-field operation
        </span>
        <span>
          <strong style={{ color: '#a855f7' }}>6G (100 GHz):</strong> R ≈ 667m → near-field operation
        </span>
      </div>
    </div>
  );
}