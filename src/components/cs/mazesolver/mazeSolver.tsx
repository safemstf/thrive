'use client'

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { 
  Play, Pause, RotateCcw, Trophy, Zap, Activity, 
  Radio, Users, DollarSign, TrendingUp, Flag,
  Volume2, VolumeX, Gauge, Navigation, MapPin,
  Timer, Award, Eye, Layers3, Sparkles, ChevronUp,
  ChevronDown, Info, Settings, Maximize2, Target,
  CheckCircle2, Circle, Gamepad2,
} from 'lucide-react';

// Import the actual pathfinding algorithms
import { 
  breadthFirstSearch, 
  depthFirstSearch, 
  aStarSearch, 
  dijkstraSearch,
  AlgorithmResult,
  AlgorithmConfig,
  greedyBestFirstSearch,
  bidirectionalSearch
} from './algorithms';

import { BroadcastBadge, Button, Card, CardContent, CardHeader, Commentary, ControlsBar,   FlagIcon,
FlagCounter, GridLayout, Header, HeaderContent, LeaderboardItem, MainContainer, ModeButton, ModeSelector, OddsItem, OddsValue, PageContainer, Panel, RoundBadge, TeamBadge, TeamSelector, TelemetryBar, TelemetryFill, TimeDisplay, Title, ToggleSwitch, TrackCanvas } from './mazeStyles';
import { AlgorithmClass, RacingTeam, Racer, RaceStatus, RaceMode, RaceCommentary, BettingOdds, RaceTrack } from './mazeTypes';
import { RACING_TEAMS } from './agent';

// ============================================================================
// TYPES AND CONFIGURATION
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
  const [selectedTeams, setSelectedTeams] = useState<AlgorithmClass[]>(['BFS', 'AStar', 'Dijkstra']);
  const [raceMode, setRaceMode] = useState<RaceMode>('flags');
  
  const [showMetrics, setShowMetrics] = useState(true);
  const [showExploration, setShowExploration] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [commentary, setCommentary] = useState<RaceCommentary[]>([]);
  const [bettingOdds, setBettingOdds] = useState<BettingOdds[]>([]);
  
  // Calculate flag collection order based on algorithm strategy
  const calculateFlagOrder = useCallback((start: [number, number], flags: [number, number][], teamId: AlgorithmClass, finishPos: [number, number]): number[] => {
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
    } else if (teamId === 'AStar' || teamId === 'Dijkstra') {
      // A* and Dijkstra: Consider distance to finish as well
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
  
  const initializeRace = useCallback(() => {
    const flagCount = raceMode === 'flags' ? 7 : 0;
    const newTrack = new RaceTrack(TRACK_WIDTH, TRACK_HEIGHT, flagCount);
    setTrack(newTrack);
    
    // Convert track to 2D array for the algorithms
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
        // Calculate flag collection order based on algorithm characteristics
        const flagOrder = calculateFlagOrder(newTrack.start, newTrack.flags, teamId, newTrack.finish);
        
        // Build path through all flags
        let currentPos = newTrack.start;
        
        for (const flagIdx of flagOrder) {
          const flagPos = newTrack.flags[flagIdx];
          
          // Use the actual algorithm for this team
          switch (teamId) {
            case 'BFS':
              algorithmResult = breadthFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'DFS':
              algorithmResult = depthFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'AStar':
              algorithmResult = aStarSearch(maze, currentPos, flagPos, config);
              break;
            case 'Dijkstra':
              algorithmResult = dijkstraSearch(maze, currentPos, flagPos, config);
              break;
            case 'Greedy':
              algorithmResult = greedyBestFirstSearch(maze, currentPos, flagPos, config);
              break;
            case 'Bidirectional':
              algorithmResult = bidirectionalSearch(maze, currentPos, flagPos, config);
              break;
            default:
              algorithmResult = breadthFirstSearch(maze, currentPos, flagPos, config);
          }
          
          if (algorithmResult.success && algorithmResult.path.length > 0) {
            fullPath = fullPath.concat(algorithmResult.path.slice(fullPath.length > 0 ? 1 : 0));
            algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
            currentPos = flagPos;
          }
        }
        
        // Path from last flag to finish
        switch (teamId) {
          case 'BFS':
            algorithmResult = breadthFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'DFS':
            algorithmResult = depthFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'AStar':
            algorithmResult = aStarSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Dijkstra':
            algorithmResult = dijkstraSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Greedy':
            algorithmResult = greedyBestFirstSearch(maze, currentPos, newTrack.finish, config);
            break;
          case 'Bidirectional':
            algorithmResult = bidirectionalSearch(maze, currentPos, newTrack.finish, config);
            break;
          default:
            algorithmResult = breadthFirstSearch(maze, currentPos, newTrack.finish, config);
        }
        
        if (algorithmResult.success && algorithmResult.path.length > 0) {
          fullPath = fullPath.concat(algorithmResult.path.slice(1));
          algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
        }
      } else {
        // Sprint mode - direct path to finish
        switch (teamId) {
          case 'BFS':
            algorithmResult = breadthFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'DFS':
            algorithmResult = depthFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'AStar':
            algorithmResult = aStarSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Dijkstra':
            algorithmResult = dijkstraSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Greedy':
            algorithmResult = greedyBestFirstSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          case 'Bidirectional':
            algorithmResult = bidirectionalSearch(maze, newTrack.start, newTrack.finish, config);
            break;
          default:
            algorithmResult = breadthFirstSearch(maze, newTrack.start, newTrack.finish, config);
        }
        
        fullPath = algorithmResult.path;
        algorithmResult.explored.forEach(e => totalExplored.add(`${e[0]},${e[1]}`));
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
        tire: 100, // Kept for compatibility but not used
        fuel: 100, // Kept for compatibility but not used
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
  }, [selectedTeams, raceMode, calculateFlagOrder]);
  
  const calculateOdds = (racer: Racer): string => {
    // Odds based on algorithm type and path efficiency
    const baseOdds: Record<AlgorithmClass, number> = {
      'AStar': 2.5,      // Usually finds optimal path
      'Dijkstra': 2.8,   // Optimal but explores more
      'BFS': 3.2,        // Optimal but explores everything
      'Bidirectional': 4.0, // Good but depends on maze
      'Greedy': 5.5,     // Fast but often suboptimal
      'DFS': 7.0         // Can take very long paths
    };
    
    const base = baseOdds[racer.team.id] || 5.0;
    
    // Adjust based on actual path length if available
    if (racer.path.length > 0) {
      const pathPenalty = racer.path.length / 100;
      return `${Math.max(1.5, base + pathPenalty).toFixed(1)}:1`;
    }
    
    return `${base.toFixed(1)}:1`;
  };
  
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
      setCommentary(prev => [...prev, {
        time: raceTime,
        message: "AND THEY'RE OFF! The algorithms are racing through the maze!",
        type: 'exciting'
      }, {
        time: raceTime,
        message: `Watch how each algorithm takes a different path - shorter paths win!`,
        type: 'normal'
      }]);
    }, 2000);
  };
  
  const animate = useCallback(() => {
    if (raceStatus !== 'racing') return;
    
    // Clear the commentary queue for this frame
    commentaryQueueRef.current = [];
    
    setRacers(prevRacers => {
      const updated = prevRacers.map(racer => {
        if (racer.finished) return racer;
        
        let updatedRacer = { ...racer };
        
        // Check for flag collection
        if (raceMode === 'flags' && track) {
          let flagsUpdated = false;
          const newCollectedFlags = new Set(racer.collectedFlags);
          
          track.flags.forEach((flag, idx) => {
            const dist = Math.abs(racer.position.x - flag[0]) + Math.abs(racer.position.y - flag[1]);
            if (dist < 0.5 && !racer.collectedFlags.has(idx)) {
              newCollectedFlags.add(idx);
              flagsUpdated = true;
              
              // Queue commentary instead of setting it directly
              commentaryQueueRef.current.push({
                time: raceTime,
                message: `${racer.team.name} collects flag #${idx + 1}! (${newCollectedFlags.size}/7)`,
                type: 'exciting'
              });
            }
          });
          
          if (flagsUpdated) {
            updatedRacer.collectedFlags = newCollectedFlags;
          }
          
          // Can only finish after collecting all flags
          if (updatedRacer.collectedFlags.size < 7) {
            // Keep racing to collect flags
          } else if (racer.currentTarget >= racer.path.length - 1) {
            if (!racer.finished) {
              commentaryQueueRef.current.push({
                time: raceTime,
                message: `${racer.team.name} (#${racer.team.number}) completes the challenge with ${racer.path.length} steps!`,
                type: 'exciting'
              });
            }
            
            return {
              ...updatedRacer,
              finished: true,
              finishTime: raceTime,
              position: {
                x: racer.path[racer.path.length - 1][0],
                y: racer.path[racer.path.length - 1][1]
              }
            };
          }
        } else if (racer.currentTarget >= racer.path.length - 1) {
          // Sprint mode finish
          if (!racer.finished) {
            commentaryQueueRef.current.push({
              time: raceTime,
              message: `${racer.team.name} (#${racer.team.number}) crosses the finish line with ${racer.path.length} steps!`,
              type: 'exciting'
            });
          }
          
          return {
            ...updatedRacer,
            finished: true,
            finishTime: raceTime,
            position: {
              x: racer.path[racer.path.length - 1][0],
              y: racer.path[racer.path.length - 1][1]
            }
          };
        }
        
        // All racers move at the same base speed - only path efficiency matters
        const BASE_SPEED = 0.2; // Uniform speed for all algorithms
        const nextTarget = Math.min(
          updatedRacer.currentTarget + BASE_SPEED,
          updatedRacer.path.length - 1
        );
        
        const targetIndex = Math.floor(nextTarget);
        const t = nextTarget - targetIndex;
        
        const current = updatedRacer.path[targetIndex];
        const next = updatedRacer.path[Math.min(targetIndex + 1, updatedRacer.path.length - 1)];
        
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
        // Find the winner
        if (updated.length > 0) {
          const winner = updated.reduce((prev, current) => 
            current.finishTime < prev.finishTime ? current : prev
          );
          commentaryQueueRef.current.push({
            time: raceTime,
            message: `Race complete! ${winner.team.name} wins with the most efficient path (${winner.path.length} steps)!`,
            type: 'exciting'
          });
        }
      }
      
      return updated;
    });
    
    // Process commentary queue after state update
    if (commentaryQueueRef.current.length > 0) {
      setCommentary(prev => [...prev, ...commentaryQueueRef.current]);
    }
    
    setRaceTime(prev => prev + 16);
  }, [raceStatus, raceTime, raceMode, track]);
  
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);
    
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
    
    if (showExploration) {
      racers.forEach(racer => {
        ctx.fillStyle = `${racer.team.color}15`;
        racer.explored.forEach(key => {
          const [x, y] = key.split(',').map(Number);
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
      });
    }
    
    // Draw flags if in flag mode
    if (raceMode === 'flags') {
      track.flags.forEach((flag, idx) => {
        const x = flag[0] * CELL_SIZE + CELL_SIZE/2;
        const y = flag[1] * CELL_SIZE + CELL_SIZE/2;
        
        // Flag glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, CELL_SIZE);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - CELL_SIZE, y - CELL_SIZE, CELL_SIZE * 2, CELL_SIZE * 2);
        
        // Flag pole
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + CELL_SIZE * 0.4);
        ctx.lineTo(x, y - CELL_SIZE * 0.4);
        ctx.stroke();
        
        // Flag
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(x, y - CELL_SIZE * 0.4);
        ctx.lineTo(x + CELL_SIZE * 0.4, y - CELL_SIZE * 0.2);
        ctx.lineTo(x + CELL_SIZE * 0.3, y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        
        // Flag number
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((idx + 1).toString(), x + CELL_SIZE * 0.2, y - CELL_SIZE * 0.2);
        
        // Check if collected by any racer
        const isCollected = racers.some(r => r.collectedFlags.has(idx));
        if (isCollected) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.fillRect(flag[0] * CELL_SIZE, flag[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      });
    }
    
    ctx.fillStyle = '#10b981';
    ctx.fillRect(track.start[0] * CELL_SIZE, track.start[1] * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', track.start[0] * CELL_SIZE + CELL_SIZE/2, track.start[1] * CELL_SIZE + CELL_SIZE/2);
    
    const fx = track.finish[0] * CELL_SIZE;
    const fy = track.finish[1] * CELL_SIZE;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? 'white' : 'black';
        ctx.fillRect(fx + i * CELL_SIZE/2, fy + j * CELL_SIZE/2, CELL_SIZE/2, CELL_SIZE/2);
      }
    }
    
    if (showTrails) {
      racers.forEach(racer => {
        racer.trail.forEach(point => {
          ctx.fillStyle = `${racer.team.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(
            point.x * CELL_SIZE + CELL_SIZE/2,
            point.y * CELL_SIZE + CELL_SIZE/2,
            CELL_SIZE * 0.15,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      });
    }
    
    racers.forEach(racer => {
      const x = racer.position.x * CELL_SIZE + CELL_SIZE/2;
      const y = racer.position.y * CELL_SIZE + CELL_SIZE/2;
      
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
      
      // Show flag count in flag mode
      if (raceMode === 'flags' && racer.collectedFlags.size > 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`${racer.collectedFlags.size}/7`, x, y - CELL_SIZE * 0.7);
      }
    });
    
    if (raceStatus === 'starting') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);
      
      const lights = 3 - Math.floor((Date.now() % 3000) / 1000);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < lights ? '#ef4444' : '#374151';
        ctx.beginPath();
        ctx.arc(VIEWPORT_W/2 + (i - 1) * 40, VIEWPORT_H/2, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [track, racers, showExploration, showTrails, raceStatus, raceMode]);
  
  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      animate();
      render();
      frameId = requestAnimationFrame(loop);
    };
    
    if (raceStatus === 'racing') {
      loop();
    } else {
      render();
    }
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [raceStatus, animate, render]);
  
  useEffect(() => {
    initializeRace();
  }, [initializeRace]);
  
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BroadcastBadge>
            <Radio size={24} />
            <Title>Algorithm Racing Derby</Title>
            <RoundBadge>Pathfinding Challenge • Round 1</RoundBadge>
          </BroadcastBadge>
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
            <TimeDisplay>{formatTime(raceTime)}</TimeDisplay>
          </div>
        </HeaderContent>
      </Header>
      
      <MainContainer>
        <GridLayout>
          <Panel $variant="left">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #475569 0%, #334155 100%)">
                <Users size={16} />
                Select Algorithms
              </CardHeader>
              <CardContent>
                {Object.values(RACING_TEAMS).map(team => (
                  <TeamSelector
                    key={team.id}
                    $selected={selectedTeams.includes(team.id)}
                    $teamColor={team.color}
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
                        setTimeout(initializeRace, 0);
                      }}
                    />
                    <TeamBadge $color={team.color}>{team.number}</TeamBadge>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{team.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                        {team.strategy}
                      </div>
                    </div>
                  </TeamSelector>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #d97706 0%, #b45309 100%)">
                <DollarSign size={16} />
                Algorithm Odds
              </CardHeader>
              <CardContent>
                {bettingOdds.map(odds => {
                  const team = RACING_TEAMS[odds.team];
                  return (
                    <OddsItem key={odds.team} $teamColor={team.color}>
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
                        <OddsValue>{odds.odds}</OddsValue>
                        {odds.movement === 'up' && <TrendingUp size={14} style={{ color: '#10b981' }} />}
                      </div>
                    </OddsItem>
                  );
                })}
              </CardContent>
            </Card>
          </Panel>
          
          <Panel $variant="center">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)">
                <Gamepad2 size={16} />
                Race Mode
                <div style={{ marginLeft: 'auto' }}>
                  <ModeSelector>
                    <ModeButton 
                      $active={raceMode === 'sprint'}
                      onClick={() => {
                        setRaceMode('sprint');
                        setTimeout(initializeRace, 0);
                      }}
                    >
                      <Zap size={14} />
                      Sprint
                    </ModeButton>
                    <ModeButton 
                      $active={raceMode === 'flags'}
                      onClick={() => {
                        setRaceMode('flags');
                        setTimeout(initializeRace, 0);
                      }}
                    >
                      <Flag size={14} />
                      Flag Hunt
                    </ModeButton>
                  </ModeSelector>
                </div>
              </CardHeader>
              <CardContent>
                <TrackCanvas
                  ref={canvasRef}
                  width={VIEWPORT_W}
                  height={VIEWPORT_H}
                />
                
                <ControlsBar>
                  <Button
                    onClick={() => raceStatus === 'preparing' ? startRace() : setRaceStatus('preparing')}
                    disabled={raceStatus === 'starting'}
                    $variant={raceStatus === 'racing' ? 'danger' : 'primary'}
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
                  </Button>
                  
                  <Button
                    onClick={initializeRace}
                    $variant="secondary"
                  >
                    <RotateCcw size={16} />
                    New Track
                  </Button>
                </ControlsBar>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)">
                <Radio size={16} />
                Race Commentary
              </CardHeader>
              <CardContent>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {commentary.slice(-5).reverse().map((comment, i) => (
                    <Commentary key={i} $type={comment.type}>
                      <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
                        [{formatTime(comment.time)}]
                      </span>{' '}
                      {comment.message}
                    </Commentary>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Panel>
          
          <Panel $variant="right">
            <Card>
              <CardHeader $color="linear-gradient(90deg, #f59e0b 0%, #d97706 100%)">
                <Trophy size={16} />
                Race Standings
              </CardHeader>
              <CardContent>
                {racers
                  .sort((a, b) => {
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
                    <LeaderboardItem
                      key={racer.team.id}
                      $position={position}
                      $teamColor={racer.team.color}
                    >
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, width: '32px' }}>
                        {position === 0 && racer.finished ? '🏆' : `${position + 1}.`}
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
                            ? `Finished: ${formatTime(racer.finishTime)} • ${racer.path.length} steps`
                            : `Progress: ${Math.round((racer.currentTarget / Math.max(1, racer.path.length - 1)) * 100)}% • ${racer.path.length} steps`
                          }
                        </div>
                        {raceMode === 'flags' && (
                          <FlagCounter>
                            {[...Array(7)].map((_, i) => (
                              <FlagIcon key={i} $collected={racer.collectedFlags.has(i)}>
                                {racer.collectedFlags.has(i) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                              </FlagIcon>
                            ))}
                          </FlagCounter>
                        )}
                      </div>
                    </LeaderboardItem>
                  ))}
              </CardContent>
            </Card>
            
            {showMetrics && (
              <Card>
                <CardHeader $color="linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)">
                  <Gauge size={16} />
                  Algorithm Metrics
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader $color="linear-gradient(90deg, #64748b 0%, #475569 100%)">
                <Settings size={16} />
                View Options
              </CardHeader>
              <CardContent>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showExploration}
                    onChange={(e) => setShowExploration(e.target.checked)}
                  />
                  <Eye size={16} />
                  <span>Show Exploration</span>
                </ToggleSwitch>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showTrails}
                    onChange={(e) => setShowTrails(e.target.checked)}
                  />
                  <Sparkles size={16} />
                  <span>Show Trails</span>
                </ToggleSwitch>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={showMetrics}
                    onChange={(e) => setShowMetrics(e.target.checked)}
                  />
                  <Activity size={16} />
                  <span>Algorithm Metrics</span>
                </ToggleSwitch>
              </CardContent>
            </Card>
          </Panel>
        </GridLayout>
      </MainContainer>
    </PageContainer>
  );
}