'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Play, Pause, RotateCcw, Trophy, Zap, Activity,
  Radio, Users, DollarSign, TrendingUp, Flag,
  Volume2, VolumeX, Gauge, Target,
  CheckCircle2, Circle, Gamepad2, Eye, Sparkles, Settings
} from 'lucide-react';

// Import the actual pathfinding algorithms
import {
  breadthFirstSearch,
  depthFirstSearch,
  aStarSearch,
  dijkstraSearch,
  greedyBestFirstSearch,
  bidirectionalSearch,
  bmsspSearch,
  AlgorithmResult,
  AlgorithmConfig
} from './algorithms';

import {
  BroadcastBadge, Button, Card, CardContent, CardHeader, Commentary,
  ControlsBar, FlagIcon, FlagCounter, GridLayout, Header, HeaderContent,
  LeaderboardItem, MainContainer, ModeButton, ModeSelector, OddsItem,
  OddsValue, PageContainer, Panel, RoundBadge, TeamBadge, TeamSelector,
  TimeDisplay, Title, ToggleSwitch, TrackCanvas
} from './mazeStyles';

import {
  AlgorithmClass, RacingTeam, Racer, RaceStatus, RaceMode,
  RaceCommentary, BettingOdds, RaceTrack
} from './mazeTypes';

import { RACING_TEAMS } from './agent';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TRACK_WIDTH = 41;
const TRACK_HEIGHT = 41;
const CELL_SIZE = 20;
const VIEWPORT_W = TRACK_WIDTH * CELL_SIZE;
const VIEWPORT_H = TRACK_HEIGHT * CELL_SIZE;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfessionalAlgorithmDerby() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const commentaryQueueRef = useRef<RaceCommentary[]>([]);

  const [track, setTrack] = useState<RaceTrack | null>(null);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('preparing');
  const [raceTime, setRaceTime] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState<AlgorithmClass[]>(['BFS', 'AStar', 'BMSSP']);
  const [raceMode, setRaceMode] = useState<RaceMode>('flags');

  const [showMetrics, setShowMetrics] = useState(true);
  const [showExploration, setShowExploration] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [commentary, setCommentary] = useState<RaceCommentary[]>([]);
  const [bettingOdds, setBettingOdds] = useState<BettingOdds[]>([]);

  // Calculate flag collection order based on algorithm strategy
  const calculateFlagOrder = useCallback((
    start: [number, number],
    flags: [number, number][],
    teamId: AlgorithmClass,
    finishPos: [number, number]
  ): number[] => {
    const order: number[] = [];
    const remaining = new Set(flags.map((_, i) => i));
    let current = start;

    // Different strategies for different algorithms
    if (teamId === 'Greedy' || teamId === 'DFS') {
      // Greedy and DFS: Always pick nearest flag
      while (remaining.size > 0) {
        let nearest = -1;
        let nearestDist = Infinity;

        for (const i of remaining) {
          const dist = Math.abs(flags[i][0] - current[0]) + Math.abs(flags[i][1] - current[1]);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
          }
        }

        if (nearest !== -1) {
          order.push(nearest);
          remaining.delete(nearest);
          current = flags[nearest];
        } else {
          break;
        }
      }
    } else if (teamId === 'AStar' || teamId === 'Dijkstra' || teamId === 'BMSSP') {
      // A*, Dijkstra, and BMSSP: Consider distance to finish as well
      while (remaining.size > 0) {
        let best = -1;
        let bestScore = Infinity;

        for (const i of remaining) {
          const distToFlag = Math.abs(flags[i][0] - current[0]) + Math.abs(flags[i][1] - current[1]);
          const distToFinish = Math.abs(flags[i][0] - finishPos[0]) + Math.abs(flags[i][1] - finishPos[1]);
          const score = distToFlag + distToFinish * 0.3;

          if (score < bestScore) {
            bestScore = score;
            best = i;
          }
        }

        if (best !== -1) {
          order.push(best);
          remaining.delete(best);
          current = flags[best];
        } else {
          break;
        }
      }
    } else {
      // BFS and Bidirectional: Systematic coverage
      const sections = Math.ceil(Math.sqrt(flags.length));
      const sectorFlags: number[][] = Array(sections * sections).fill(null).map(() => []);

      flags.forEach((flag, i) => {
        const sx = Math.floor(flag[0] / (TRACK_WIDTH / sections));
        const sy = Math.floor(flag[1] / (TRACK_HEIGHT / sections));
        const sector = sy * sections + sx;
        if (sector < sectorFlags.length) {
          sectorFlags[sector].push(i);
        }
      });

      for (const sector of sectorFlags) {
        for (const flagIdx of sector) {
          if (remaining.has(flagIdx)) {
            order.push(flagIdx);
            remaining.delete(flagIdx);
          }
        }
      }
    }

    return order;
  }, []);

  // Run algorithm based on team ID
  const runAlgorithm = useCallback((
    teamId: AlgorithmClass,
    maze: number[][],
    start: [number, number],
    goal: [number, number],
    config: AlgorithmConfig
  ): AlgorithmResult => {
    switch (teamId) {
      case 'BFS':
        return breadthFirstSearch(maze, start, goal, config);
      case 'DFS':
        return depthFirstSearch(maze, start, goal, config);
      case 'AStar':
        return aStarSearch(maze, start, goal, config);
      case 'Dijkstra':
        return dijkstraSearch(maze, start, goal, config);
      case 'Greedy':
        return greedyBestFirstSearch(maze, start, goal, config);
      case 'Bidirectional':
        return bidirectionalSearch(maze, start, goal, config);
      case 'BMSSP':
        return bmsspSearch(maze, start, goal, config);
      default:
        return breadthFirstSearch(maze, start, goal, config);
    }
  }, []);

  const calculateOdds = useCallback((racer: Racer): string => {
    // Odds based on algorithm type and path efficiency
    const baseOdds: Record<AlgorithmClass, number> = {
      'AStar': 2.5,
      'BMSSP': 2.3,
      'Dijkstra': 2.8,
      'BFS': 3.2,
      'Bidirectional': 4.0,
      'Greedy': 5.5,
      'DFS': 7.0
    };

    const base = baseOdds[racer.team.id] || 5.0;

    if (racer.path.length > 0) {
      const pathPenalty = racer.path.length / 100;
      return `${Math.max(1.5, base + pathPenalty).toFixed(1)}:1`;
    }

    return `${base.toFixed(1)}:1`;
  }, []);

  const initializeRace = useCallback(() => {
    const flagCount = raceMode === 'flags' ? 7 : 0;
    const newTrack = new RaceTrack(TRACK_WIDTH, TRACK_HEIGHT, flagCount);
    setTrack(newTrack);

    const maze = newTrack.to2DArray();
    const newRacers: Racer[] = [];

    const config: AlgorithmConfig = {
      maxSteps: 100000,
      allowDiagonal: false,
      timeLimit: 5000
    };

    for (const teamId of selectedTeams) {
      const team = RACING_TEAMS[teamId];
      let fullPath: [number, number][] = [];
      let totalExplored = new Set<string>();
      let algorithmResult: AlgorithmResult;

      if (raceMode === 'flags') {
        const flagOrder = calculateFlagOrder(newTrack.start, newTrack.flags, teamId, newTrack.finish);
        let currentPos = newTrack.start;

        for (const flagIdx of flagOrder) {
          const flagPos = newTrack.flags[flagIdx];
          algorithmResult = runAlgorithm(teamId, maze, currentPos, flagPos, config);

          if (algorithmResult.success && algorithmResult.path.length > 0) {
            fullPath = fullPath.concat(algorithmResult.path.slice(fullPath.length > 0 ? 1 : 0));
            algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
            currentPos = flagPos;
          }
        }

        algorithmResult = runAlgorithm(teamId, maze, currentPos, newTrack.finish, config);

        if (algorithmResult.success && algorithmResult.path.length > 0) {
          fullPath = fullPath.concat(algorithmResult.path.slice(1));
          algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
        }
      } else {
        algorithmResult = runAlgorithm(teamId, maze, newTrack.start, newTrack.finish, config);
        fullPath = algorithmResult.path;
        algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
      }

      if (!algorithmResult.success || fullPath.length === 0) {
        console.warn(`${team.name} failed to find a path!`);
      }

      newRacers.push({
        team,
        position: { x: newTrack.start[0], y: newTrack.start[1] },
        velocity: { x: 0, y: 0 },
        heading: 0,
        path: fullPath,
        explored: totalExplored,
        currentTarget: 0,
        lapTime: 0,
        bestLap: Infinity,
        totalDistance: 0,
        currentSpeed: 0,
        tire: 100,
        fuel: 100,
        finished: false,
        finishTime: 0,
        trail: [],
        telemetry: {
          speed: [],
          exploration: [],
          efficiency: fullPath.length > 0 ? (fullPath.length / totalExplored.size) * 100 : 0
        },
        collectedFlags: new Set(),
        targetFlag: null,
        flagPath: []
      });
    }

    setRacers(newRacers);
    setRaceStatus('preparing');
    setRaceTime(0);

    const modeText = raceMode === 'flags' ? 'Flag Collection Challenge' : 'Sprint to the Finish';
    setCommentary([{
      time: 0,
      message: `Welcome to the Algorithm Derby! Today's event: ${modeText}!`,
      type: 'normal'
    }, {
      time: 0,
      message: `All algorithms race at the same speed - only their pathfinding efficiency matters!`,
      type: 'normal'
    }]);

    const odds = newRacers.map(racer => ({
      team: racer.team.id,
      odds: calculateOdds(racer),
      movement: 'stable' as const
    }));
    setBettingOdds(odds);
  }, [selectedTeams, raceMode, calculateFlagOrder, runAlgorithm, calculateOdds]);

  const startRace = () => {
    setRaceStatus('starting');
    const modeMessage = raceMode === 'flags'
      ? "7 flags to collect before the finish!"
      : "A straight sprint to the checkered flag!";

    setCommentary(prev => [...prev, {
      time: raceTime,
      message: `Engines are revving! ${modeMessage}`,
      type: 'exciting'
    }]);

    setTimeout(() => {
      setRaceStatus('racing');

      const failedRacers = racers.filter(r => !r.path || r.path.length === 0);
      const initialCommentary: RaceCommentary[] = [{
        time: raceTime,
        message: "AND THEY'RE OFF! The algorithms are racing through the maze!",
        type: 'exciting'
      }];

      if (failedRacers.length > 0) {
        initialCommentary.push({
          time: raceTime,
          message: `Warning: ${failedRacers.map(r => r.team.name).join(', ')} failed to find a path!`,
          type: 'critical'
        });
      }

      initialCommentary.push({
        time: raceTime,
        message: `Watch how each algorithm takes a different path - shorter paths win!`,
        type: 'normal'
      });

      setCommentary(prev => [...prev, ...initialCommentary]);
    }, 2000);
  };

  // FIXED: Remove raceTime from dependencies - it's updated internally
  const animate = useCallback(() => {
    if (raceStatus !== 'racing') return;

    commentaryQueueRef.current = [];

    setRacers(prevRacers => {
      const updated = prevRacers.map(racer => {
        if (racer.finished) return racer;

        if (!racer.path || racer.path.length === 0) {
          return {
            ...racer,
            finished: true,
            finishTime: Infinity
          };
        }

        let updatedRacer = { ...racer };

        if (raceMode === 'flags' && track) {
          let flagsUpdated = false;
          const newCollectedFlags = new Set(racer.collectedFlags);

          track.flags.forEach((flag, idx) => {
            const dist = Math.abs(racer.position.x - flag[0]) + Math.abs(racer.position.y - flag[1]);
            if (dist < 0.5 && !racer.collectedFlags.has(idx)) {
              newCollectedFlags.add(idx);
              flagsUpdated = true;

              commentaryQueueRef.current.push({
                time: Date.now(),
                message: `${racer.team.name} collects flag #${idx + 1}! (${newCollectedFlags.size}/7)`,
                type: 'exciting'
              });
            }
          });

          if (flagsUpdated) {
            updatedRacer.collectedFlags = newCollectedFlags;
          }

          if (updatedRacer.collectedFlags.size < 7) {
            // Keep racing
          } else if (racer.currentTarget >= racer.path.length - 1) {
            if (!racer.finished) {
              commentaryQueueRef.current.push({
                time: Date.now(),
                message: `${racer.team.name} (#${racer.team.number}) completes the challenge with ${racer.path.length} steps!`,
                type: 'exciting'
              });
            }

            return {
              ...updatedRacer,
              finished: true,
              finishTime: Date.now(),
              position: {
                x: racer.path[racer.path.length - 1][0],
                y: racer.path[racer.path.length - 1][1]
              }
            };
          }
        } else if (racer.currentTarget >= racer.path.length - 1) {
          if (!racer.finished) {
            commentaryQueueRef.current.push({
              time: Date.now(),
              message: `${racer.team.name} (#${racer.team.number}) crosses the finish line with ${racer.path.length} steps!`,
              type: 'exciting'
            });
          }

          return {
            ...updatedRacer,
            finished: true,
            finishTime: Date.now(),
            position: {
              x: racer.path[racer.path.length - 1][0],
              y: racer.path[racer.path.length - 1][1]
            }
          };
        }

        const BASE_SPEED = 0.2;
        const nextTarget = Math.min(
          updatedRacer.currentTarget + BASE_SPEED,
          updatedRacer.path.length - 1
        );

        const targetIndex = Math.floor(nextTarget);
        const t = nextTarget - targetIndex;

        if (targetIndex >= updatedRacer.path.length) {
          return {
            ...updatedRacer,
            finished: true,
            finishTime: Date.now()
          };
        }

        const current = updatedRacer.path[targetIndex];
        const next = updatedRacer.path[Math.min(targetIndex + 1, updatedRacer.path.length - 1)];

        if (!current || !next) {
          return {
            ...updatedRacer,
            finished: true,
            finishTime: Date.now()
          };
        }

        const newX = current[0] + (next[0] - current[0]) * t;
        const newY = current[1] + (next[1] - current[1]) * t;

        const newTrail = [...updatedRacer.trail, {
          x: updatedRacer.position.x,
          y: updatedRacer.position.y,
          alpha: 1
        }].slice(-20).map(t => ({ ...t, alpha: t.alpha * 0.95 }));

        const newSpeed = Math.sqrt(
          Math.pow(newX - updatedRacer.position.x, 2) +
          Math.pow(newY - updatedRacer.position.y, 2)
        ) * 60;

        return {
          ...updatedRacer,
          position: { x: newX, y: newY },
          currentTarget: nextTarget,
          currentSpeed: newSpeed,
          trail: newTrail,
          totalDistance: updatedRacer.totalDistance + newSpeed / 60,
          telemetry: {
            ...updatedRacer.telemetry,
            speed: [...updatedRacer.telemetry.speed.slice(-50), newSpeed]
          }
        };
      });

      if (updated.every(r => r.finished)) {
        setRaceStatus('finished');
        if (updated.length > 0) {
          const finishers = updated.filter(r => r.finishTime !== Infinity);
          if (finishers.length > 0) {
            const winner = finishers.reduce((prev, current) =>
              current.finishTime < prev.finishTime ? current : prev
            );
            commentaryQueueRef.current.push({
              time: Date.now(),
              message: `Race complete! ${winner.team.name} wins with the most efficient path (${winner.path.length} steps)!`,
              type: 'exciting'
            });
          } else {
            commentaryQueueRef.current.push({
              time: Date.now(),
              message: `Race complete! All algorithms failed to find valid paths.`,
              type: 'critical'
            });
          }
        }
      }

      return updated;
    });

    if (commentaryQueueRef.current.length > 0) {
      setCommentary(prev => [...prev, ...commentaryQueueRef.current]);
    }

    setRaceTime(prev => prev + 16);
  }, [raceStatus, raceMode, track]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    // Draw track
    for (let y = 0; y < TRACK_HEIGHT; y++) {
      for (let x = 0; x < TRACK_WIDTH; x++) {
        const cell = track.getCell(x, y);

        if (cell === 1) {
          const gradient = ctx.createLinearGradient(
            x * CELL_SIZE, y * CELL_SIZE,
            x * CELL_SIZE, (y + 1) * CELL_SIZE
          );
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#0f172a');
          ctx.fillStyle = gradient;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 1);
        } else {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

          if (x % 2 === 0 && y % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // Draw exploration
    if (showExploration) {
      racers.forEach(racer => {
        ctx.fillStyle = `${racer.team.color}15`;
        racer.explored.forEach(key => {
          const [x, y] = key.split(',').map(Number);
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
      });
    }

    // Draw flags
    if (raceMode === 'flags') {
      track.flags.forEach((flag, idx) => {
        const x = flag[0] * CELL_SIZE + CELL_SIZE / 2;
        const y = flag[1] * CELL_SIZE + CELL_SIZE / 2;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - CELL_SIZE, y - CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE * 0.4);
        ctx.lineTo(x, y - CELL_SIZE * 0.4);
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(x, y - CELL_SIZE * 0.4);
        ctx.lineTo(x + CELL_SIZE * 0.4, y - CELL_SIZE * 0.2);
        ctx.lineTo(x + CELL_SIZE * 0.3, y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), x + CELL_SIZE * 0.2, y - CELL_SIZE * 0.2);

        const isCollected = racers.some(r => r.collectedFlags.has(idx));
        if (isCollected) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.fillRect(flag[0] * CELL_SIZE, flag[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    }

    // Draw start
    ctx.fillStyle = '#10b981';
    ctx.fillRect(track.start[0] * CELL_SIZE, track.start[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', track.start[0] * CELL_SIZE + CELL_SIZE / 2, track.start[1] * CELL_SIZE + CELL_SIZE / 2);

    // Draw finish
    const fx = track.finish[0] * CELL_SIZE;
    const fy = track.finish[1] * CELL_SIZE;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? 'white' : 'black';
        ctx.fillRect(fx + i * CELL_SIZE / 2, fy + j * CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2);
      }
    }

    // Draw trails
    if (showTrails) {
      racers.forEach(racer => {
        racer.trail.forEach(point => {
          ctx.fillStyle = `${racer.team.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(
            point.x * CELL_SIZE + CELL_SIZE / 2,
            point.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE * 0.15,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    }

    // Draw racers
    racers.forEach(racer => {
      const x = racer.position.x * CELL_SIZE + CELL_SIZE / 2;
      const y = racer.position.y * CELL_SIZE + CELL_SIZE / 2;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE * 0.5);
      glow.addColorStop(0, `${racer.team.color}40`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(x - CELL_SIZE, y - CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);

      ctx.save();
      ctx.translate(x, y);

      if (racer.currentTarget > 0 && racer.currentTarget < racer.path.length - 1) {
        const prev = racer.path[Math.floor(racer.currentTarget)];
        const next = racer.path[Math.ceil(racer.currentTarget)];
        const angle = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
        ctx.rotate(angle);
      }

      ctx.fillStyle = racer.team.color;
      ctx.fillRect(-CELL_SIZE * 0.4, -CELL_SIZE * 0.2, CELL_SIZE * 0.8, CELL_SIZE * 0.4);

      ctx.fillStyle = racer.team.accentColor;
      ctx.fillRect(-CELL_SIZE * 0.35, -CELL_SIZE * 0.05, CELL_SIZE * 0.7, CELL_SIZE * 0.1);

      ctx.restore();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(racer.team.number.toString(), x, y);

      if (racer.finished) {
        ctx.font = '12px sans-serif';
        ctx.fillText('🏁', x, y - CELL_SIZE);
      }

      if (raceMode === 'flags' && racer.collectedFlags.size > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${racer.collectedFlags.size}/7`, x, y - CELL_SIZE * 0.7);
      }
    });

    // Draw starting lights
    if (raceStatus === 'starting') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

      const lights = 3 - Math.floor((Date.now() % 3000) / 1000);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < lights ? '#ef4444' : '#374151';
        ctx.beginPath();
        ctx.arc(VIEWPORT_W / 2 + (i - 1) * 40, VIEWPORT_H / 2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [track, racers, showExploration, showTrails, raceStatus, raceMode]);

  // FIXED: Store animate and render in refs AFTER they're defined
  const animateRef = useRef(animate);
  const renderRef = useRef(render);

  useEffect(() => {
    animateRef.current = animate;
    renderRef.current = render;
  }, [animate, render]);

  // FIXED: Animation loop without animate/render in dependencies
  useEffect(() => {
    let frameId: number;

    const loop = () => {
      animateRef.current();
      renderRef.current();
      frameId = requestAnimationFrame(loop);
    };

    if (raceStatus === 'racing') {
      loop();
    } else {
      renderRef.current();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [raceStatus]);

  // Initialize race when dependencies change
  useEffect(() => {
    initializeRace();
  }, [initializeRace]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)', color: 'white', padding: '1rem' }}>
      <div style={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Radio size={24} />
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Algorithm Racing Derby</h1>
            <span style={{ background: 'rgba(0,0,0,0.3)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem' }}>
              Pathfinding Challenge • Round 1
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {formatTime(raceTime)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '1rem' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #475569 0%, #334155 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} />
              <span style={{ fontWeight: 600 }}>Select Algorithms</span>
            </div>
            <div>
              {Object.values(RACING_TEAMS).map(team => (
                <label
                  key={team.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: selectedTeams.includes(team.id) ? `${team.color}20` : '#0f172a',
                    border: `2px solid ${selectedTeams.includes(team.id) ? team.color : 'transparent'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTeams([...selectedTeams, team.id]);
                      } else {
                        setSelectedTeams(selectedTeams.filter(t => t !== team.id));
                      }
                      // FIXED: Removed setTimeout, will be called by state change effect below
                    }}
                  />
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: team.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {team.number}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{team.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                      {team.strategy}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} />
              <span style={{ fontWeight: 600 }}>Algorithm Odds</span>
            </div>
            <div>
              {bettingOdds.map(odds => {
                const team = RACING_TEAMS[odds.team];
                return (
                  <div key={odds.team} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', marginBottom: '0.25rem', background: '#0f172a', borderRadius: '6px', borderLeft: `3px solid ${team.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: team.color
                      }} />
                      <span style={{ fontSize: '0.875rem' }}>{team.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{odds.odds}</span>
                      {odds.movement === 'up' && <TrendingUp size={14} style={{ color: '#10b981' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gamepad2 size={16} />
                <span style={{ fontWeight: 600 }}>Race Mode</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setRaceMode('sprint');
                    // FIXED: Removed setTimeout, will be called by state change effect below
                  }}
                  style={{
                    background: raceMode === 'sprint' ? '#3b82f6' : '#1e293b',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <Zap size={14} />
                  Sprint
                </button>
                <button
                  onClick={() => {
                    setRaceMode('flags');
                    // FIXED: Removed setTimeout, will be called by state change effect below
                  }}
                  style={{
                    background: raceMode === 'flags' ? '#3b82f6' : '#1e293b',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <Flag size={14} />
                  Flag Hunt
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={VIEWPORT_W}
              height={VIEWPORT_H}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', background: '#0a0a0a' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => raceStatus === 'preparing' ? startRace() : setRaceStatus('preparing')}
                disabled={raceStatus === 'starting'}
                style={{
                  flex: 1,
                  background: raceStatus === 'racing' ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: raceStatus === 'starting' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  opacity: raceStatus === 'starting' ? 0.5 : 1
                }}
              >
                {raceStatus === 'racing' ? (
                  <>
                    <Pause size={16} />
                    Pause Race
                  </>
                ) : raceStatus === 'starting' ? (
                  <>
                    <Zap size={16} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Race
                  </>
                )}
              </button>

              <button
                onClick={initializeRace}
                style={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                <RotateCcw size={16} />
                New Track
              </button>
            </div>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={16} />
              <span style={{ fontWeight: 600 }}>Race Commentary</span>
            </div>
            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {commentary.slice(-5).reverse().map((comment, i) => (
                <div key={i} style={{ padding: '0.5rem', marginBottom: '0.25rem', background: comment.type === 'exciting' ? '#1e40af20' : comment.type === 'critical' ? '#dc262620' : '#0f172a', borderRadius: '4px', fontSize: '0.875rem' }}>
                  <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                    [{formatTime(comment.time)}]
                  </span>{' '}
                  {comment.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Continues with standings, metrics, and view options... */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Race Standings Panel */}
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={16} />
              <span style={{ fontWeight: 600 }}>Race Standings</span>
            </div>
            <div>
              {racers
                .sort((a, b) => {
                  if (a.finishTime === Infinity && b.finishTime !== Infinity) return 1;
                  if (a.finishTime !== Infinity && b.finishTime === Infinity) return -1;
                  if (a.finished && !b.finished) return -1;
                  if (!a.finished && b.finished) return 1;
                  if (a.finished && b.finished) return a.finishTime - b.finishTime;
                  if (raceMode === 'flags') {
                    const flagDiff = b.collectedFlags.size - a.collectedFlags.size;
                    if (flagDiff !== 0) return flagDiff;
                  }
                  return b.currentTarget - a.currentTarget;
                })
                .map((racer, position) => (
                  <div
                    key={racer.team.id}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      background: position === 0 && racer.finished ? `${racer.team.color}30` : '#0f172a',
                      border: `2px solid ${racer.team.color}`,
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, width: '32px' }}>
                      {racer.finishTime === Infinity
                        ? '❌'
                        : position === 0 && racer.finished
                          ? '🏆'
                          : `${position + 1}.`
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: racer.team.color
                        }} />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          #{racer.team.number}
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          {racer.team.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
                        {racer.finished
                          ? racer.finishTime === Infinity
                            ? `DNF - No path found`
                            : `Finished: ${formatTime(racer.finishTime)} • ${racer.path.length} steps`
                          : `Progress: ${Math.round((racer.currentTarget / Math.max(1, racer.path.length - 1)) * 100)}% • ${racer.path.length} steps`
                        }
                      </div>
                      {raceMode === 'flags' && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                          {[...Array(7)].map((_, i) => (
                            <div key={i} style={{ color: racer.collectedFlags.has(i) ? '#10b981' : '#374151' }}>
                              {racer.collectedFlags.has(i) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {showMetrics && (
            <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={16} />
                <span style={{ fontWeight: 600 }}>Algorithm Metrics</span>
              </div>
              <div>
                {racers.slice(0, 3).map(racer => (
                  <div key={racer.team.id} style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: racer.team.color
                      }}>
                        {racer.team.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {racer.currentSpeed.toFixed(1)} m/s
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '60px' }}>Path</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {racer.path.length} steps
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '60px' }}>Explored</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {racer.explored.size} cells
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '60px' }}>Efficiency</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                          {racer.telemetry.efficiency.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #64748b 0%, #475569 100%)', padding: '0.5rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} />
              <span style={{ fontWeight: 600 }}>View Options</span>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showExploration}
                  onChange={(e) => setShowExploration(e.target.checked)}
                />
                <Eye size={16} />
                <span style={{ fontSize: '0.875rem' }}>Show Exploration</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                />
                <Sparkles size={16} />
                <span style={{ fontSize: '0.875rem' }}>Show Trails</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showMetrics}
                  onChange={(e) => setShowMetrics(e.target.checked)}
                />
                <Activity size={16} />
                <span style={{ fontSize: '0.875rem' }}>Algorithm Metrics</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}