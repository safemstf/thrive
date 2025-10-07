// Train Station OFDM WiFi Simulation
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, PauseCircle, RefreshCw, Train, Wifi, Radio } from 'lucide-react';

// Types
interface Position { x: number; y: number; }
interface Velocity { x: number; y: number; }

interface Agent {
  id: string;
  type: 'access_point' | 'passenger';
  position: Position;
  velocity: Velocity;
  state: 'on_platform' | 'boarding' | 'on_train' | 'exiting' | 'walking';
  isTransmitting: boolean;
  connectedToRouter: string | null;
  snr: number;
  throughput: number;
  color: string;
  targetPosition?: Position;
  boardingProgress?: number;
}

interface TrainType {
  id: string;
  position: Position;
  velocity: Velocity;
  length: number;
  width: number;
  isAtStation: boolean;
  direction: 'approaching' | 'stopped' | 'departing';
  passengerIds: string[];
}

interface ConnectionLink {
  fromAgent: string;
  toAgent: string;
  color: string;
  snr: number;
}

// Layout helper
const getLayout = (w: number, h: number) => ({
  platform: {
    x: w * 0.15,
    y: h * 0.15,
    width: w * 0.7,
    height: h * 0.22
  },
  track: {
    y: h * 0.48,
    height: h * 0.08
  },
  apZone: {
    y: h * 0.41 // Between platform and track for better coverage
  },
  stationZone: {
    x: w * 0.35,
    width: w * 0.15
  }
});

// ==================== STATE MANAGEMENT ====================
class SimulationEngine {
  private animationFrame: number | null = null;
  private lastUpdateTime = 0;
  private stationStopTime = 0;
  private subscribers = new Set<() => void>();

  public isRunning = false;
  public currentTime = 0;
  public speed = 1.0;
  public train: TrainType;
  public agents: Agent[];
  public connectionLinks: ConnectionLink[];
  public canvasSize = { width: 1400, height: 600 };

  constructor() {
    this.train = {
      id: 'express_101',
      position: { x: -150, y: 0 },
      velocity: { x: 0, y: 0 },
      length: 140,
      width: 32,
      isAtStation: false,
      direction: 'approaching',
      passengerIds: []
    };
    this.agents = [];
    this.connectionLinks = [];
  }

  initializeAgents(w: number, h: number) {
    const layout = getLayout(w, h);
    const agents: Agent[] = [];

    // 4 Access Points - positioned BETWEEN platform and track for optimal coverage
    const apY = layout.apZone.y;
    const apPositions = [
      { x: w * 0.22, y: apY },
      { x: w * 0.38, y: apY },
      { x: w * 0.62, y: apY },
      { x: w * 0.78, y: apY }
    ];

    apPositions.forEach((pos, i) => {
      agents.push({
        id: `ap_${i + 1}`,
        type: 'access_point',
        position: pos,
        velocity: { x: 0, y: 0 },
        state: 'on_platform',
        isTransmitting: true,
        connectedToRouter: null,
        snr: 35,
        throughput: 150,
        color: '#10b981'
      });
    });

    // Platform passengers waiting
    const platformY = layout.platform.y;
    const platformH = layout.platform.height;
    for (let i = 0; i < 8; i++) {
      const walkSpeed = Math.random() > 2.5;
      agents.push({
        id: `platform_${i + 1}`,
        type: 'passenger',
        position: {
          x: layout.platform.x + 40 + (i * (layout.platform.width - 80) / 7),
          y: platformY + 50 + Math.random() * (platformH - 100)
        },
        velocity: walkSpeed
          ? { x: (Math.random() - 0.5) * 1.2, y: (Math.random() - 0.5) * 0.6 }
          : { x: 0, y: 0 },
        state: walkSpeed ? 'walking' : 'on_platform',
        isTransmitting: Math.random() > 0.2,
        connectedToRouter: this.findNearestAPId(agents, { x: layout.platform.x + w * 0.4, y: platformY + platformH / 2 }),
        snr: 22 + Math.random() * 8,
        throughput: 30 + Math.random() * 60,
        color: '#3b82f6'
      });
    }

    // Initial train passengers (will be on the train when it arrives)
    const trainCenterY = layout.track.y + layout.track.height / 2;
    for (let i = 0; i < 5; i++) {
      agents.push({
        id: `train_${i + 1}`,
        type: 'passenger',
        position: { x: -100 + i * 25, y: trainCenterY },
        velocity: { x: 0, y: 0 },
        state: 'on_train',
        isTransmitting: false,
        connectedToRouter: null,
        snr: 12,
        throughput: 0,
        color: '#f59e0b'
      });
    }

    this.train.passengerIds = agents.filter(a => a.state === 'on_train').map(a => a.id);
    this.agents = agents;
  }

  private findNearestAPId(agents: Agent[], pos: Position): string {
    const aps = agents.filter(a => a.type === 'access_point');
    if (aps.length === 0) return 'ap_1';

    let nearest = aps[0].id;
    let minDist = Infinity;
    for (const ap of aps) {
      const dist = Math.hypot(ap.position.x - pos.x, ap.position.y - pos.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = ap.id;
      }
    }
    return nearest;
  }

  private updateSimulation(deltaTime: number) {
    const { train, agents, canvasSize } = this;
    const w = canvasSize.width;
    const h = canvasSize.height;
    const layout = getLayout(w, h);
    const stationX = layout.stationZone.x;

    // Update train
    switch (train.direction) {
      case 'approaching':
        train.velocity.x = 22 * this.speed;
        train.position.x += train.velocity.x * deltaTime;
        if (train.position.x >= stationX) {
          train.direction = 'stopped';
          train.velocity.x = 0;
          train.isAtStation = true;
          this.stationStopTime = this.currentTime;
          this.handleTrainArrival();
        }
        break;

      case 'stopped':
        if ((this.currentTime - this.stationStopTime) > 6) {
          train.direction = 'departing';
          train.isAtStation = false;
        }
        break;

      case 'departing':
        train.velocity.x = 28 * this.speed;
        train.position.x += train.velocity.x * deltaTime;
        if (train.position.x >= w + 100) {
          train.position.x = -train.length - 50;
          train.direction = 'approaching';
          train.velocity.x = 0;
          // Reset passengers for next cycle
          this.resetForNextCycle(layout);
        }
        break;
    }

    const trainCenterY = layout.track.y + layout.track.height / 2;
    const platformY = layout.platform.y;
    const platformH = layout.platform.height;

    // Update all agents
    for (const agent of agents) {
      if (agent.type === 'access_point') continue;

      switch (agent.state) {
        case 'on_train':
          // Move with train
          const trainPassengerIndex = train.passengerIds.indexOf(agent.id);
          if (trainPassengerIndex >= 0) {
            const spacing = train.length / (train.passengerIds.length + 1);
            agent.position.x = train.position.x + spacing * (trainPassengerIndex + 1);
            agent.position.y = trainCenterY;
            agent.velocity.x = train.velocity.x;

            // Connect to WiFi when train is at station
            if (train.isAtStation && !agent.isTransmitting) {
              agent.isTransmitting = true;
              agent.connectedToRouter = this.findNearestAPId(agents, agent.position);
              agent.snr = 18 + Math.random() * 10;
              agent.throughput = 20 + Math.random() * 50;
            } else if (!train.isAtStation) {
              agent.isTransmitting = false;
              agent.throughput = 0;
            }
          }
          break;

        case 'exiting':
          // Move from train to platform
          if (agent.targetPosition) {
            const dx = agent.targetPosition.x - agent.position.x;
            const dy = agent.targetPosition.y - agent.position.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 3) {
              const speed = 40;
              agent.position.x += (dx / dist) * speed * deltaTime;
              agent.position.y += (dy / dist) * speed * deltaTime;
            } else {
              agent.state = 'walking';
              agent.velocity = { x: (Math.random() - 0.5) * 1.2, y: (Math.random() - 0.5) * 0.6 };
              agent.color = '#3b82f6';
              agent.isTransmitting = true;
              agent.connectedToRouter = this.findNearestAPId(agents, agent.position);
            }
          }
          break;

        case 'boarding':
          // Move from platform to train
          if (agent.targetPosition) {
            const dx = agent.targetPosition.x - agent.position.x;
            const dy = agent.targetPosition.y - agent.position.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 3) {
              const speed = 40;
              agent.position.x += (dx / dist) * speed * deltaTime;
              agent.position.y += (dy / dist) * speed * deltaTime;
            } else {
              agent.state = 'on_train';
              agent.color = '#f59e0b';
              train.passengerIds.push(agent.id);
            }
          }
          break;

        case 'walking':
        case 'on_platform':
          // Move on platform
          if (agent.state === 'walking') {
            agent.position.x += agent.velocity.x * deltaTime * 10;
            agent.position.y += agent.velocity.y * deltaTime * 10;
          }

          // Strict platform boundaries
          const minX = layout.platform.x + 20;
          const maxX = layout.platform.x + layout.platform.width - 20;
          const minY = platformY + 35;
          const maxY = platformY + platformH - 20;

          if (agent.position.x <= minX || agent.position.x >= maxX) {
            agent.velocity.x *= -1;
            agent.position.x = Math.max(minX, Math.min(maxX, agent.position.x));
          }
          if (agent.position.y <= minY || agent.position.y >= maxY) {
            agent.velocity.y *= -1;
            agent.position.y = Math.max(minY, Math.min(maxY, agent.position.y));
          }

          // Update connection
          if (agent.isTransmitting) {
            agent.connectedToRouter = this.findNearestAPId(agents, agent.position);
          }
          break;
      }
    }

    this.updateConnectionLinks();
    this.notify();
  }

  private handleTrainArrival() {
    const layout = getLayout(this.canvasSize.width, this.canvasSize.height);
    const platformY = layout.platform.y;
    const platformH = layout.platform.height;

    // Some train passengers exit
    const trainPassengers = this.agents.filter(a => a.state === 'on_train');
    const exitCount = Math.min(3, Math.floor(trainPassengers.length * 0.6));

    for (let i = 0; i < exitCount; i++) {
      const passenger = trainPassengers[i];
      if (passenger) {
        passenger.state = 'exiting';
        passenger.targetPosition = {
          x: layout.platform.x + 50 + Math.random() * (layout.platform.width - 100),
          y: platformY + 60 + Math.random() * (platformH - 120)
        };
        const idx = this.train.passengerIds.indexOf(passenger.id);
        if (idx >= 0) this.train.passengerIds.splice(idx, 1);
      }
    }

    // Some platform passengers board
    const platformPassengers = this.agents.filter(a =>
      (a.state === 'on_platform' || a.state === 'walking') &&
      a.type === 'passenger'
    );
    const boardCount = Math.min(3, platformPassengers.length);

    for (let i = 0; i < boardCount; i++) {
      const passenger = platformPassengers[Math.floor(Math.random() * platformPassengers.length)];
      if (passenger && passenger.state !== 'boarding') {
        passenger.state = 'boarding';
        const trainCenterY = layout.track.y + layout.track.height / 2;
        passenger.targetPosition = {
          x: this.train.position.x + this.train.length / 2 + (Math.random() - 0.5) * 40,
          y: trainCenterY
        };
        passenger.isTransmitting = false;
      }
    }
  }

  private resetForNextCycle(layout: any) {
    // Reset all passengers for next train cycle
    const platformPassengers = this.agents.filter(a =>
      a.type === 'passenger' &&
      (a.state === 'on_platform' || a.state === 'walking' || a.state === 'exiting')
    );

    // Keep some on platform, put some on next train
    this.train.passengerIds = [];

    this.agents.forEach(agent => {
      if (agent.type === 'passenger') {
        if (Math.random() < 0.4) {
          // On next train
          agent.state = 'on_train';
          agent.color = '#f59e0b';
          agent.isTransmitting = false;
          this.train.passengerIds.push(agent.id);
        } else {
          // On platform
          agent.state = Math.random() > 0.5 ? 'walking' : 'on_platform';
          agent.color = '#3b82f6';
          agent.velocity = agent.state === 'walking'
            ? { x: (Math.random() - 0.5) * 1.2, y: (Math.random() - 0.5) * 0.6 }
            : { x: 0, y: 0 };
        }
      }
    });
  }

  private updateConnectionLinks() {
    const links: ConnectionLink[] = [];
    for (const agent of this.agents) {
      if (agent.connectedToRouter && agent.isTransmitting) {
        const router = this.agents.find(a => a.id === agent.connectedToRouter);
        if (router) {
          links.push({
            fromAgent: agent.id,
            toAgent: router.id,
            color: agent.snr > 22 ? '#10b981' : agent.snr > 16 ? '#f59e0b' : '#ef4444',
            snr: agent.snr
          });
        }
      }
    }
    this.connectionLinks = links;
  }

  private simulationLoop = (timestamp: number) => {
    if (!this.isRunning) return;
    const deltaTime = Math.min((timestamp - this.lastUpdateTime) / 1000, 0.1) * this.speed;
    this.lastUpdateTime = timestamp;
    if (deltaTime > 0) {
      this.currentTime += deltaTime;
      this.updateSimulation(deltaTime);
    }
    this.animationFrame = requestAnimationFrame(this.simulationLoop);
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.simulationLoop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  reset(w: number, h: number) {
    this.stop();
    this.currentTime = 0;
    this.stationStopTime = 0;
    this.canvasSize = { width: w, height: h };
    this.train.position.x = -150;
    this.train.direction = 'approaching';
    this.train.isAtStation = false;
    this.train.passengerIds = [];
    this.initializeAgents(w, h);
    this.notify();
  }

  setSpeed(speed: number) {
    this.speed = Math.max(0.5, Math.min(3, speed));
  }

  getStationProgress(): number {
    if (!this.train.isAtStation) return 0;
    return Math.min(1, (this.currentTime - this.stationStopTime) / 6);
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(): void {
    this.subscribers.forEach(cb => cb());
  }

  destroy() {
    this.stop();
  }
}

// ==================== VIEWPORT COMPONENT ====================
const SimulationViewport: React.FC<{ engine: SimulationEngine }> = React.memo(({ engine }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      engine.canvasSize = { width: w, height: h };
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { train, agents, connectionLinks } = engine;
    const layout = getLayout(w, h);

    // Background
    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Platform
    ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.fillRect(layout.platform.x, layout.platform.y, layout.platform.width, layout.platform.height);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(layout.platform.x, layout.platform.y, layout.platform.width, layout.platform.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('PLATFORM', w / 2, layout.platform.y + 24);

    // Yellow safety line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(layout.platform.x, layout.platform.y + layout.platform.height);
    ctx.lineTo(layout.platform.x + layout.platform.width, layout.platform.y + layout.platform.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Track
    ctx.fillStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.fillRect(0, layout.track.y, w, layout.track.height);

    // Station zone
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.fillRect(layout.stationZone.x, layout.track.y, layout.stationZone.width, layout.track.height);

    // Rails
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.lineWidth = 4;
    [0.28, 0.72].forEach(ratio => {
      ctx.beginPath();
      ctx.moveTo(0, layout.track.y + layout.track.height * ratio);
      ctx.lineTo(w, layout.track.y + layout.track.height * ratio);
      ctx.stroke();
    });

    // Train
    if (train.position.x > -train.length - 50 && train.position.x < w + 50) {
      const trainY = layout.track.y + (layout.track.height - train.width) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(train.position.x + 4, trainY + 4, train.length, train.width);

      const grad = ctx.createLinearGradient(0, trainY, 0, trainY + train.width);
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.5, '#475569');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.fillRect(train.position.x, trainY, train.length, train.width);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(train.position.x, trainY, train.length, train.width);

      // Windows
      ctx.fillStyle = 'rgba(147, 197, 253, 0.5)';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(
          train.position.x + 8 + i * (train.length / 6),
          trainY + 5,
          train.length / 6 - 10,
          train.width - 10
        );
      }

      // Status
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      const status = train.isAtStation ? '⬛ BOARDING' : train.direction === 'approaching' ? '→ ARRIVING' : '→→ DEPARTING';
      ctx.fillText(status, train.position.x + train.length / 2, trainY - 10);

      if (train.velocity.x > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.font = '10px monospace';
        ctx.fillText(`${Math.round(train.velocity.x * 3)} km/h`, train.position.x + train.length / 2, trainY + train.width + 14);
      }

      // Boarding timer
      if (train.isAtStation) {
        const progress = engine.getStationProgress();
        const barW = train.length - 24;
        const barH = 4;
        const barX = train.position.x + 12;
        const barY = trainY + train.width + 20;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(barX, barY, barW * progress, barH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
      }
    }

    // Connections
    for (const link of connectionLinks) {
      const from = agents.find(a => a.id === link.fromAgent);
      const to = agents.find(a => a.id === link.toAgent);
      if (from && to) {
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -(Date.now() / 30) % 12;

        ctx.strokeStyle = link.color + '50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(from.position.x, from.position.y);
        ctx.lineTo(to.position.x, to.position.y);
        ctx.stroke();

        ctx.strokeStyle = link.color + 'dd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Agents
    for (const agent of agents) {
      if (agent.type === 'access_point') {
        // Access Point - larger, more visible
        const grad = ctx.createRadialGradient(agent.position.x, agent.position.y, 0, agent.position.x, agent.position.y, 30);
        grad.addColorStop(0, agent.color + '66');
        grad.addColorStop(1, agent.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // AP icon
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('AP', agent.position.x, agent.position.y - 18);
        ctx.shadowBlur = 0;

        // Connection count
        const conns = connectionLinks.filter(l => l.toAgent === agent.id).length;
        if (conns > 0) {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px system-ui';
          ctx.fillText(`${conns}`, agent.position.x, agent.position.y + 26);
        }
      } else {
        // Passenger
        const grad = ctx.createRadialGradient(agent.position.x, agent.position.y, 0, agent.position.x, agent.position.y, 18);
        grad.addColorStop(0, agent.color + '55');
        grad.addColorStop(1, agent.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Signal rings
        if (agent.isTransmitting) {
          const pulse = (Date.now() / 1000) % 1;
          for (let i = 1; i <= 2; i++) {
            ctx.globalAlpha = Math.max(0, 0.7 - pulse - (i - 1) * 0.3);
            ctx.strokeStyle = agent.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(agent.position.x, agent.position.y, 12 * i + pulse * 8, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }

        // State indicators
        if (agent.state === 'on_train') {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
          ctx.font = '10px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('🚂', agent.position.x, agent.position.y - 12);
        } else if (agent.state === 'boarding') {
          ctx.fillStyle = '#22c55e';
          ctx.font = '12px system-ui';
          ctx.fillText('↓', agent.position.x, agent.position.y - 12);
        } else if (agent.state === 'exiting') {
          ctx.fillStyle = '#3b82f6';
          ctx.font = '12px system-ui';
          ctx.fillText('↑', agent.position.x, agent.position.y - 12);
        } else if (agent.state === 'walking') {
          const angle = Math.atan2(agent.velocity.y, agent.velocity.x);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(agent.position.x, agent.position.y);
          ctx.lineTo(agent.position.x + Math.cos(angle) * 10, agent.position.y + Math.sin(angle) * 10);
          ctx.stroke();
        }
      }
    }

    // Stats
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(15, 15, 330, 85);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';

    const onTrain = agents.filter(a => a.state === 'on_train').length;
    const onPlatform = agents.filter(a => a.state === 'on_platform' || a.state === 'walking').length;
    const boarding = agents.filter(a => a.state === 'boarding').length;
    const exiting = agents.filter(a => a.state === 'exiting').length;

    ctx.fillText(`Train: ${train.direction.toUpperCase()} | Position: ${Math.round(train.position.x)}`, 25, 33);
    ctx.fillText(`On Train: ${onTrain} | On Platform: ${onPlatform}`, 25, 51);
    ctx.fillText(`Boarding: ${boarding} | Exiting: ${exiting} | Connections: ${connectionLinks.length}`, 25, 69);
    ctx.fillText(`Speed: ${engine.speed}x`, 25, 87);

    // Legend
    const legendY = h - 42;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(15, legendY, w - 30, 32);

    ctx.font = 'bold 10px system-ui';
    const items = [
      { color: '#10b981', label: 'Access Point', x: 30 },
      { color: '#3b82f6', label: 'Platform User', x: 150 },
      { color: '#f59e0b', label: 'Train User', x: 280 },
      { label: '↑ Exiting', x: 390, isText: true },
      { label: '↓ Boarding', x: 460, isText: true }
    ];

    items.forEach(item => {
      if (item.isText) {
        ctx.fillStyle = 'white';
        ctx.fillText(item.label, item.x, legendY + 20);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(item.x, legendY + 16, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillText(item.label, item.x + 12, legendY + 20);
      }
    });
  }, [engine]);

  useEffect(() => {
    const scheduleDraw = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };
    scheduleDraw();
    const unsub = engine.subscribe(scheduleDraw);
    return () => {
      unsub();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine, draw]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
});

// ==================== MAIN COMPONENT ====================
const TrainStationOFDMSimulation: React.FC = () => {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const engine = new SimulationEngine();
    engineRef.current = engine;
    setTimeout(() => {
      engine.initializeAgents(1400, 600);
      engine.start();
    }, 100);
    const unsub = engine.subscribe(() => forceUpdate({}));
    return () => {
      unsub();
      engine.destroy();
    };
  }, []);

  const engine = engineRef.current;
  if (!engine) return null;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0f1e',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        padding: '18px 28px',
        background: 'rgba(0, 0, 0, 0.7)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={26} color="#10b981" />
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: 'white' }}>
            Train Station WiFi Network
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
            <span style={{ fontSize: '0.85rem' }}>Speed:</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={engine.speed}
              onChange={(e) => {
                engine.setSpeed(parseFloat(e.target.value));
                forceUpdate({});
              }}
              style={{ width: '100px', accentColor: '#10b981' }}
            />
            <span style={{ minWidth: '32px', fontSize: '0.85rem' }}>{engine.speed}x</span>
          </div>

          <button
            onClick={() => engine.isRunning ? engine.stop() : engine.start()}
            style={{
              padding: '9px 18px',
              background: engine.isRunning ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            {engine.isRunning ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
            {engine.isRunning ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => {
              const canvas = document.querySelector('canvas');
              const container = canvas?.parentElement;
              if (container) {
                engine.reset(container.clientWidth, container.clientHeight);
                engine.start();
              }
            }}
            style={{
              padding: '9px 18px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#60a5fa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={17} />
            Reset
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', minHeight: 0 }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
        }}>
          <SimulationViewport engine={engine} />
        </div>
      </div>
    </div>
  );
};

export default TrainStationOFDMSimulation;