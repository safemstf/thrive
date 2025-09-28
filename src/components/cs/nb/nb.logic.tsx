// src/components/cs/nb/nb.logic.tsx
// N-Body Simulation - Fixed Core Logic Engine
// Eliminates maximum update depth exceeded errors

import { useCallback, useRef, useEffect, useState } from 'react';
import {
  CelestialBodyDefinition,
  PhysicsConfig,
  PerformanceConfig,
  Scenario,
  Vector3Data,
  OrbitalElements,
  DEFAULT_PHYSICS
} from './nb.config';

// ===== INTERFACES =====

export interface SimulationBody extends CelestialBodyDefinition {
  // Runtime physics state
  acceleration: Vector3Data;
  previousPosition: Vector3Data;
  previousVelocity: Vector3Data;

  // Optimization data
  spatialHash?: string;
  lastForceUpdate: number;
  skipNextUpdate: boolean;

  // Hierarchy caching
  childBodies?: SimulationBody[];
  parentBody?: SimulationBody;

  // Analytics
  kineticEnergy: number;
  potentialEnergy: number;
  orbitalSpeed?: number;
  distanceFromPrimary?: number;
}

export type ViewMode = 'heliocentric' | 'barycentric' | 'relative';

export interface SimulationState {
  // Core state
  bodies: Map<string, SimulationBody>;
  selectedBodyIds: Set<string>;
  currentTime: number;
  timeStep: number;
  totalSteps: number;

  // View mode
  viewMode: ViewMode;
  referenceBodyId?: string;
  barycenter: Vector3Data;

  // Performance tracking
  fps: number;
  physicsTime: number;
  bodyCount: number;
  activeBodyCount: number;

  // Energy conservation
  totalEnergy: number;
  initialEnergy: number;
  totalMomentum: Vector3Data;
  energyDrift: number;

  // Simulation control
  isRunning: boolean;
  isPaused: boolean;
  speed: number;

  // Scenario info
  currentScenario?: Scenario;
  scenarioProgress: number;
}

export interface PhysicsUpdate {
  bodyId: string;
  position: Vector3Data;
  velocity: Vector3Data;
  acceleration: Vector3Data;
  kineticEnergy: number;
  potentialEnergy: number;
}

export interface PerformanceMetrics {
  fps: number;
  physicsTime: number;
  renderTime: number;
  memoryUsage: number;
  bodyCount: number;
  spatialSubdivisions: number;
  workerUtilization: number;
}

// ===== VECTOR MATH =====

class Vector3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) { }

  static from(data: Vector3Data): Vector3 {
    return new Vector3(data.x, data.y, data.z);
  }

  toData(): Vector3Data {
    return { x: this.x, y: this.y, z: this.z };
  }

  add(other: Vector3): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vector3): Vector3 {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  multiply(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  divide(scalar: number): Vector3 {
    return scalar !== 0 ? this.multiply(1 / scalar) : new Vector3();
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vector3 {
    const mag = this.magnitude();
    return mag > 0 ? this.multiply(1 / mag) : new Vector3();
  }

  distanceTo(other: Vector3): number {
    return this.subtract(other).magnitude();
  }

  dot(other: Vector3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vector3): Vector3 {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  copy(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }
}

// ===== SPATIAL OPTIMIZATION =====

class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, string[]> = new Map();

  constructor(cellSize: number = 1e10) { // 10 million km cells
    this.cellSize = cellSize;
  }

  private getHashKey(position: Vector3): string {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    return `${x},${y},${z}`;
  }

  clear(): void {
    this.grid.clear();
  }

  addBody(bodyId: string, position: Vector3): void {
    const key = this.getHashKey(position);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(bodyId);
  }

  getNearbyBodies(position: Vector3, radius: number): string[] {
    const nearby: string[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerX = Math.floor(position.x / this.cellSize);
    const centerY = Math.floor(position.y / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = `${centerX + dx},${centerY + dy},${centerZ + dz}`;
          const bodies = this.grid.get(key);
          if (bodies) {
            nearby.push(...bodies);
          }
        }
      }
    }

    return nearby;
  }
}

// ===== PHYSICS ENGINE =====

class PhysicsEngine {
  private config: PhysicsConfig;
  private spatialGrid: SpatialHashGrid;
  private barycenter: Vector3 = new Vector3();
  private totalSystemMass: number = 0;

  constructor(config: PhysicsConfig = DEFAULT_PHYSICS) {
    this.config = config;
    this.spatialGrid = new SpatialHashGrid();
  }

  updateConfiguration(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Calculate system center of mass
  calculateBarycenter(bodies: Map<string, SimulationBody>): Vector3Data {
    let totalMass = 0;
    let centerX = 0, centerY = 0, centerZ = 0;

    for (const body of bodies.values()) {
      // Include ALL bodies in barycenter, regardless of isFixed
      totalMass += body.mass;
      centerX += body.position.x * body.mass;
      centerY += body.position.y * body.mass;
      centerZ += body.position.z * body.mass;
    }

    if (totalMass > 0) {
      this.barycenter = new Vector3(
        centerX / totalMass,
        centerY / totalMass,
        centerZ / totalMass
      );
      this.totalSystemMass = totalMass;
    }

    return this.barycenter.toData();
  }

  // Calculate total system energy for conservation monitoring
  calculateSystemEnergy(bodies: Map<string, SimulationBody>): {
    totalKinetic: number;
    totalPotential: number;
    totalEnergy: number;
    totalMomentum: Vector3Data;
  } {
    let totalKinetic = 0;
    let totalPotential = 0;
    const totalMomentum = new Vector3();

    const bodyArray = Array.from(bodies.values());

    // Kinetic energy and momentum
    for (const body of bodyArray) {
      if (body.isFixed) continue; // Fixed bodies don't contribute

      const vel = Vector3.from(body.velocity);
      const speed = vel.magnitude();

      totalKinetic += 0.5 * body.mass * speed * speed;
      totalMomentum.x += body.mass * body.velocity.x;
      totalMomentum.y += body.mass * body.velocity.y;
      totalMomentum.z += body.mass * body.velocity.z;
    }

    // Potential energy (pairwise)
    for (let i = 0; i < bodyArray.length; i++) {
      for (let j = i + 1; j < bodyArray.length; j++) {
        const b1 = bodyArray[i];
        const b2 = bodyArray[j];

        const pos1 = Vector3.from(b1.position);
        const pos2 = Vector3.from(b2.position);
        const distance = pos1.distanceTo(pos2);

        if (distance > 0) {
          totalPotential -= this.config.gravitationalConstant * b1.mass * b2.mass / distance;
        }
      }
    }

    return {
      totalKinetic,
      totalPotential,
      totalEnergy: totalKinetic + totalPotential,
      totalMomentum: totalMomentum.toData()
    };
  }

  // Main force computation
  computeForces(bodies: Map<string, SimulationBody>): PhysicsUpdate[] {
    const updates: PhysicsUpdate[] = [];
    const bodyArray = Array.from(bodies.values());

    // Update spatial grid
    this.spatialGrid.clear();
    for (const body of bodyArray) {
      this.spatialGrid.addBody(body.id, Vector3.from(body.position));
    }

    // Calculate forces for all bodies
    for (const body of bodyArray) {
      const force = new Vector3();
      let potentialEnergy = 0;

      const bodyPos = Vector3.from(body.position);
      const bodyVel = Vector3.from(body.velocity);

      // Calculate gravitational forces from all other bodies
      for (const otherBody of bodyArray) {
        if (body.id === otherBody.id) continue;

        const otherPos = Vector3.from(otherBody.position);
        const r = otherPos.subtract(bodyPos);
        const distanceSquared = r.magnitudeSquared();

        // Apply softening to prevent singularities
        const softenedDistanceSquared = distanceSquared + this.config.softening * this.config.softening;
        const distance = Math.sqrt(softenedDistanceSquared);

        // F = G * m1 * m2 / r^2 * r_hat
        const forceMagnitude = this.config.gravitationalConstant * body.mass * otherBody.mass / softenedDistanceSquared;
        const forceDirection = r.normalize();

        force.x += forceMagnitude * forceDirection.x;
        force.y += forceMagnitude * forceDirection.y;
        force.z += forceMagnitude * forceDirection.z;

        // Potential energy contribution
        potentialEnergy -= this.config.gravitationalConstant * body.mass * otherBody.mass / distance;
      }

      // Calculate acceleration (F = ma, so a = F/m)
      const acceleration = body.isFixed
        ? new Vector3(0, 0, 0)
        : force.divide(body.mass);

      // Calculate kinetic energy
      const speed = bodyVel.magnitude();
      const kineticEnergy = 0.5 * body.mass * speed * speed;

      // Store orbital information
      body.orbitalSpeed = speed;

      // Find distance to primary (usually the star)
      const primaryBody = bodyArray.find(b => b.type === 'star');
      if (primaryBody && primaryBody.id !== body.id) {
        body.distanceFromPrimary = Vector3.from(body.position).distanceTo(Vector3.from(primaryBody.position));
      }

      updates.push({
        bodyId: body.id,
        position: body.position,
        velocity: body.velocity,
        acceleration: acceleration.toData(),
        kineticEnergy,
        potentialEnergy: potentialEnergy / 2 // Avoid double counting in pairwise calculation
      });

      // Update body's acceleration for integration
      body.acceleration = acceleration.toData();
      body.kineticEnergy = kineticEnergy;
      body.potentialEnergy = potentialEnergy / 2;
    }

    return updates;
  }

  // Integration step using selected method
  integrateStep(body: SimulationBody, timeStep: number): void {
    // Fixed bodies don't move
    if (body.isFixed) return;

    const dt = timeStep;

    // Store previous state
    body.previousPosition = { ...body.position };
    body.previousVelocity = { ...body.velocity };

    if (this.config.integrator === 'leapfrog') {
      // Leapfrog integration (symplectic, energy-conserving)
      // v(t+dt) = v(t) + a(t) * dt
      // x(t+dt) = x(t) + v(t+dt) * dt

      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;

      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      body.position.z += body.velocity.z * dt;

    } else if (this.config.integrator === 'verlet') {
      // Velocity Verlet
      const halfDtSquared = 0.5 * dt * dt;

      body.position.x += body.velocity.x * dt + body.acceleration.x * halfDtSquared;
      body.position.y += body.velocity.y * dt + body.acceleration.y * halfDtSquared;
      body.position.z += body.velocity.z * dt + body.acceleration.z * halfDtSquared;

      // Note: Full Verlet would need new acceleration here
      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;

    } else if (this.config.integrator === 'runge-kutta-4') {
      // RK4 (most accurate but expensive)
      this.integrateRK4(body, dt);

    } else {
      // Simple Euler (least accurate but fast)
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      body.position.z += body.velocity.z * dt;

      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;
    }
  }

  private integrateRK4(body: SimulationBody, dt: number): void {
    // Simplified RK4 - in practice would need multiple force evaluations
    const k1v = Vector3.from(body.acceleration);
    const k1x = Vector3.from(body.velocity);

    const k2v = k1v; // Would need force at t + dt/2
    const k2x = Vector3.from(body.velocity).add(k1v.multiply(dt * 0.5));

    const k3v = k2v; // Would need force at t + dt/2
    const k3x = Vector3.from(body.velocity).add(k2v.multiply(dt * 0.5));

    const k4v = k3v; // Would need force at t + dt
    const k4x = Vector3.from(body.velocity).add(k3v.multiply(dt));

    // Weighted average
    const dv = k1v.add(k2v.multiply(2)).add(k3v.multiply(2)).add(k4v).divide(6);
    const dx = k1x.add(k2x.multiply(2)).add(k3x.multiply(2)).add(k4x).divide(6);

    body.velocity.x += dv.x * dt;
    body.velocity.y += dv.y * dt;
    body.velocity.z += dv.z * dt;

    body.position.x += dx.x * dt;
    body.position.y += dx.y * dt;
    body.position.z += dx.z * dt;
  }

  // Calculate adaptive timestep based on system dynamics
  calculateAdaptiveTimeStep(bodies: Map<string, SimulationBody>, currentTimeStep: number): number {
    if (!this.config.adaptiveTimeStep) return currentTimeStep;

    let minOrbitalPeriod = Infinity;
    let minDistance = Infinity;
    let maxVelocity = 0;

    const bodyArray = Array.from(bodies.values());

    // Find critical parameters
    for (let i = 0; i < bodyArray.length; i++) {
      const vel = Vector3.from(bodyArray[i].velocity);
      maxVelocity = Math.max(maxVelocity, vel.magnitude());

      for (let j = i + 1; j < bodyArray.length; j++) {
        const pos1 = Vector3.from(bodyArray[i].position);
        const pos2 = Vector3.from(bodyArray[j].position);
        const distance = pos1.distanceTo(pos2);

        minDistance = Math.min(minDistance, distance);

        // Estimate orbital period using Kepler's third law
        const totalMass = bodyArray[i].mass + bodyArray[j].mass;
        const orbitalPeriod = 2 * Math.PI * Math.sqrt(
          Math.pow(distance, 3) / (this.config.gravitationalConstant * totalMass)
        );

        minOrbitalPeriod = Math.min(minOrbitalPeriod, orbitalPeriod);
      }
    }

    // Time step should be small fraction of shortest orbital period
    const suggestedTimeStep = Math.min(
      minOrbitalPeriod / 200,  // 1/200th of shortest orbit
      minDistance / (maxVelocity * 10)  // Ensure we don't skip through close encounters
    );

    // Apply limits and smoothing
    const targetTimeStep = Math.max(
      this.config.minTimeStep,
      Math.min(this.config.maxTimeStep, suggestedTimeStep)
    );

    // Smooth transition to avoid sudden jumps
    return currentTimeStep + (targetTimeStep - currentTimeStep) * 0.1;
  }

  destroy(): void {
    // Cleanup
    this.spatialGrid.clear();
  }
}

// ===== MAIN SIMULATION HOOK =====

export interface UseNBodySimulationProps {
  config?: Partial<PhysicsConfig>;
  performanceConfig?: Partial<PerformanceConfig>;
  initialScenario?: Scenario;
  onBodyUpdate?: (updates: PhysicsUpdate[]) => void;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}

export const useNBodySimulation = ({
  config = {},
  performanceConfig = {},
  initialScenario,
  onBodyUpdate,
  onPerformanceUpdate
}: UseNBodySimulationProps = {}) => {

  // Core state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    bodies: new Map(),
    selectedBodyIds: new Set(),
    currentTime: 0,
    timeStep: config.timeStep || DEFAULT_PHYSICS.timeStep,
    totalSteps: 0,
    viewMode: 'heliocentric',
    barycenter: { x: 0, y: 0, z: 0 },
    fps: 0,
    physicsTime: 0,
    bodyCount: 0,
    activeBodyCount: 0,
    totalEnergy: 0,
    initialEnergy: 0,
    totalMomentum: { x: 0, y: 0, z: 0 },
    energyDrift: 0,
    isRunning: false,
    isPaused: false,
    speed: 1,
    scenarioProgress: 0
  });

  // CRITICAL FIX: Use refs to track simulation state without causing re-renders
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const simulationStateRef = useRef(simulationState);

  // Update refs when state changes
  useEffect(() => {
    isRunningRef.current = simulationState.isRunning;
    isPausedRef.current = simulationState.isPaused;
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  // Refs for stable references
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const initialEnergyRef = useRef<number | null>(null);
  const fpsCounterRef = useRef<number>(0);
  const fpsUpdateTimeRef = useRef<number>(performance.now());

  // Initialize physics engine
  useEffect(() => {
    const physicsConfig = { ...DEFAULT_PHYSICS, ...config };
    physicsEngineRef.current = new PhysicsEngine(physicsConfig);

    return () => {
      physicsEngineRef.current?.destroy();
    };
  }, []);

  // Load initial scenario
  useEffect(() => {
    if (initialScenario) {
      loadScenario(initialScenario);
    }
  }, []);

  // Store callbacks in refs to ensure stability
  const onBodyUpdateRef = useRef(onBodyUpdate);
  const onPerformanceUpdateRef = useRef(onPerformanceUpdate);

  useEffect(() => {
    onBodyUpdateRef.current = onBodyUpdate;
    onPerformanceUpdateRef.current = onPerformanceUpdate;
  }, [onBodyUpdate, onPerformanceUpdate]);

  const simulationStep = useCallback(() => {
    const engine = physicsEngineRef.current;
    if (!engine) return;

    const startTime = performance.now();

    setSimulationState(prev => {
      if (prev.isPaused || prev.bodies.size === 0) {
        return prev;
      }

      const barycenter = engine.calculateBarycenter(prev.bodies);
      const updates = engine.computeForces(prev.bodies);

      // CRITICAL FIX: Don't multiply timeStep by speed in the physics integration
      // The timeStep is the actual physics step size (e.g., 3600 seconds = 1 hour)
      // Speed only affects how often we advance, not the step size itself
      const physicsTimeStep = prev.timeStep; // Use base timestep for physics accuracy

      // Apply integration with the actual physics timestep
      for (const update of updates) {
        const body = prev.bodies.get(update.bodyId);
        if (body) {
          body.acceleration = update.acceleration;
          engine.integrateStep(body, physicsTimeStep);
          body.kineticEnergy = update.kineticEnergy;
          body.potentialEnergy = update.potentialEnergy;
        }
      }

      // Calculate energy conservation
      const energyInfo = engine.calculateSystemEnergy(prev.bodies);

      if (initialEnergyRef.current === null && energyInfo.totalEnergy !== 0) {
        initialEnergyRef.current = energyInfo.totalEnergy;
      }

      const energyDrift = initialEnergyRef.current
        ? Math.abs((energyInfo.totalEnergy - initialEnergyRef.current) / initialEnergyRef.current)
        : 0;

      // Update simulation time - this is the actual simulation time advancement
      const newCurrentTime = prev.currentTime + physicsTimeStep;

      const newTimeStep = engine.calculateAdaptiveTimeStep(prev.bodies, prev.timeStep);
      const physicsTime = performance.now() - startTime;

      // FPS tracking
      fpsCounterRef.current++;
      const currentRealTime = performance.now();
      const fpsElapsed = currentRealTime - fpsUpdateTimeRef.current;

      let newFps = prev.fps;
      if (fpsElapsed >= 500) {
        newFps = Math.round((fpsCounterRef.current * 1000) / fpsElapsed);
        fpsCounterRef.current = 0;
        fpsUpdateTimeRef.current = currentRealTime;
      }

      // Notify callbacks
      if (onBodyUpdateRef.current && updates.length > 0) {
        setTimeout(() => onBodyUpdateRef.current?.(updates), 0);
      }

      if (onPerformanceUpdateRef.current) {
        const metrics: PerformanceMetrics = {
          fps: newFps,
          physicsTime,
          renderTime: 0,
          memoryUsage: 0,
          bodyCount: prev.bodies.size,
          spatialSubdivisions: 0,
          workerUtilization: 0
        };
        setTimeout(() => onPerformanceUpdateRef.current?.(metrics), 0);
      }

      return {
        ...prev,
        currentTime: newCurrentTime,
        totalSteps: prev.totalSteps + 1,
        timeStep: newTimeStep,
        barycenter,
        physicsTime,
        fps: newFps,
        bodyCount: prev.bodies.size,
        activeBodyCount: updates.length,
        totalEnergy: energyInfo.totalEnergy,
        initialEnergy: initialEnergyRef.current ?? energyInfo.totalEnergy,
        totalMomentum: energyInfo.totalMomentum,
        energyDrift,
        scenarioProgress: prev.currentScenario
          ? Math.min(1, newCurrentTime / (prev.currentScenario.estimatedDuration || 300))
          : 0
      };
    });
  }, []);

  // Extract just the control flags to avoid unnecessary re-renders
  const isRunning = simulationState.isRunning;
  const isPaused = simulationState.isPaused;

  // Animation loop - responds to control state changes
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    let frameId: number | null = null;

    const animate = () => {
      if (!isRunningRef.current || isPausedRef.current) {
        animationFrameRef.current = null;
        return;
      }

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      // CRITICAL FIX: Speed affects how often we call simulationStep, not the timestep itself
      // At 1x speed, run physics at 60 FPS
      // At higher speeds, run physics more frequently (but with same timestep)
      const targetInterval = 1000 / (60 * simulationStateRef.current.speed);

      if (deltaTime >= targetInterval) {
        simulationStep();
        lastTime = currentTime;
      }

      frameId = requestAnimationFrame(animate);
      animationFrameRef.current = frameId;
    };

    frameId = requestAnimationFrame(animate);
    animationFrameRef.current = frameId;

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isRunning, isPaused, simulationStep]);

  // ===== PUBLIC API =====

  // Key fixes to add to your nb.logic.tsx

  // 1. Fix the loadScenario dependency issue
  const loadScenario = useCallback((scenario: Scenario) => {
    const bodies = new Map<string, SimulationBody>();

    // Find primary star for view mode decisions
    const primaryStar = scenario.bodies.find(b => b.type === 'star');
    const currentViewMode = simulationStateRef.current.viewMode;
    const currentReferenceBodyId = simulationStateRef.current.referenceBodyId;

    console.log(`Loading scenario: ${scenario.name} with ${scenario.bodies.length} bodies`);

    // Convert scenario bodies to simulation bodies
    for (const bodyDef of scenario.bodies) {
      const simBody: SimulationBody = {
        ...bodyDef,
        acceleration: { x: 0, y: 0, z: 0 },
        previousPosition: { ...bodyDef.position },
        previousVelocity: { ...bodyDef.velocity },
        lastForceUpdate: 0,
        skipNextUpdate: false,
        kineticEnergy: 0,
        potentialEnergy: 0
      };

      // Apply view mode logic
      if (currentViewMode === 'heliocentric' && primaryStar) {
        if (simBody.id === primaryStar.id) {
          simBody.isFixed = true;
          simBody.position = { x: 0, y: 0, z: 0 };
          simBody.velocity = { x: 0, y: 0, z: 0 };
        } else {
          simBody.isFixed = false;
        }
      } else if (currentViewMode === 'barycentric') {
        simBody.isFixed = false;
      } else if (currentViewMode === 'relative' && currentReferenceBodyId) {
        simBody.isFixed = (simBody.id === currentReferenceBodyId);
      }

      bodies.set(bodyDef.id, simBody);
    }

    // Build hierarchy relationships
    for (const [id, body] of bodies) {
      if (body.parentId) {
        body.parentBody = bodies.get(body.parentId);
      }
      body.childBodies = body.childIds
        .map(childId => bodies.get(childId))
        .filter(Boolean) as SimulationBody[];
    }

    // Reset energy tracking
    initialEnergyRef.current = null;
    fpsCounterRef.current = 0;
    fpsUpdateTimeRef.current = performance.now();

    console.log(`Loaded ${bodies.size} bodies into simulation`);

    setSimulationState(prev => ({
      ...prev,
      bodies,
      currentScenario: scenario,
      currentTime: 0,
      totalSteps: 0,
      scenarioProgress: 0,
      totalEnergy: 0,
      initialEnergy: 0,
      energyDrift: 0
    }));

    // Apply scenario physics config
    if (scenario.physicsConfig && physicsEngineRef.current) {
      physicsEngineRef.current.updateConfiguration(scenario.physicsConfig);
    }
  }, []); // Remove dependencies to prevent infinite loops

  // 2. Fix the initial scenario loading
  useEffect(() => {
    if (initialScenario) {
      console.log('Loading initial scenario:', initialScenario.name);
      loadScenario(initialScenario);
    }
  }, [initialScenario, loadScenario]); // Add loadScenario as dependency

  const setViewMode = useCallback((mode: ViewMode, referenceBodyId?: string) => {
    setSimulationState(prev => {
      const newState = { ...prev, viewMode: mode, referenceBodyId };

      // Update body fixed states based on new view mode
      const primaryStar = Array.from(prev.bodies.values()).find(b => b.type === 'star');

      for (const body of prev.bodies.values()) {
        if (mode === 'heliocentric' && primaryStar) {
          // Only fix the star in heliocentric mode
          body.isFixed = (body.id === primaryStar.id);
        } else if (mode === 'barycentric') {
          // Free all bodies in barycentric mode
          body.isFixed = false;
        } else if (mode === 'relative' && referenceBodyId) {
          // Fix reference body in relative mode
          body.isFixed = (body.id === referenceBodyId);
        }
      }

      return newState;
    });
  }, []);

  const addBody = useCallback((bodyDef: CelestialBodyDefinition) => {
    const simBody: SimulationBody = {
      ...bodyDef,
      acceleration: { x: 0, y: 0, z: 0 },
      previousPosition: { ...bodyDef.position },
      previousVelocity: { ...bodyDef.velocity },
      lastForceUpdate: 0,
      skipNextUpdate: false,
      kineticEnergy: 0,
      potentialEnergy: 0
    };

    setSimulationState(prev => ({
      ...prev,
      bodies: new Map(prev.bodies).set(bodyDef.id, simBody)
    }));
  }, []);

  const removeBody = useCallback((bodyId: string) => {
    setSimulationState(prev => {
      const newBodies = new Map(prev.bodies);
      newBodies.delete(bodyId);

      const newSelectedIds = new Set(prev.selectedBodyIds);
      newSelectedIds.delete(bodyId);

      return {
        ...prev,
        bodies: newBodies,
        selectedBodyIds: newSelectedIds
      };
    });
  }, []);

  const selectBody = useCallback((bodyId: string | null, multiSelect: boolean = false) => {
    setSimulationState(prev => {
      const newSelectedIds = multiSelect ? new Set(prev.selectedBodyIds) : new Set<string>();

      if (bodyId) {
        if (newSelectedIds.has(bodyId)) {
          newSelectedIds.delete(bodyId);
        } else {
          newSelectedIds.add(bodyId);
        }
      }

      return {
        ...prev,
        selectedBodyIds: newSelectedIds
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      selectedBodyIds: new Set<string>()
    }));
  }, []);

  const updateBody = useCallback((bodyId: string, updates: Partial<CelestialBodyDefinition>) => {
    setSimulationState(prev => {
      const newBodies = new Map(prev.bodies);
      const body = newBodies.get(bodyId);

      if (body) {
        Object.assign(body, updates);
      }

      return {
        ...prev,
        bodies: newBodies
      };
    });
  }, []);

  const start = useCallback(() => {
    console.log('Start button clicked');
    setSimulationState(prev => {
      // Check if there are bodies to simulate
      if (prev.bodies.size === 0) {
        console.error('Cannot start simulation: no bodies loaded. Please load a scenario first.');
        return prev; // Don't change state
      }

      console.log('Starting simulation with', prev.bodies.size, 'bodies');
      return {
        ...prev,
        isRunning: true,
        isPaused: false
      };
    });
  }, []);

  const pause = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);

  const stop = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false
    }));
  }, []);

  const reset = useCallback(() => {
    // Reset to initial state
    if (simulationStateRef.current.currentScenario) {
      loadScenario(simulationStateRef.current.currentScenario);
    }

    initialEnergyRef.current = null;
    fpsCounterRef.current = 0;
    fpsUpdateTimeRef.current = performance.now();

    setSimulationState(prev => ({
      ...prev,
      currentTime: 0,
      totalSteps: 0,
      isRunning: false,
      isPaused: false,
      totalEnergy: 0,
      initialEnergy: 0,
      energyDrift: 0
    }));
  }, [loadScenario]);

  const setSpeed = useCallback((speed: number) => {
    setSimulationState(prev => ({
      ...prev,
      speed: Math.max(0.1, Math.min(10, speed))
    }));
  }, []);

  const setTimeStep = useCallback((timeStep: number) => {
    setSimulationState(prev => ({
      ...prev,
      timeStep: Math.max(1, timeStep)
    }));

    if (physicsEngineRef.current) {
      physicsEngineRef.current.updateConfiguration({ timeStep });
    }
  }, []);

  // ===== RETURN API =====

  return {
    // State
    simulationState,

    // Scenario management
    loadScenario,

    // View mode control
    setViewMode,

    // Body management
    addBody,
    removeBody,
    updateBody,
    selectBody,
    clearSelection,

    // Simulation control
    start,
    pause,
    stop,
    reset,
    setSpeed,
    setTimeStep,

    // Getters for rendering system
    getBodies: () => Array.from(simulationState.bodies.values()),
    getSelectedBodies: () => {
      return Array.from(simulationState.selectedBodyIds)
        .map(id => simulationState.bodies.get(id))
        .filter(Boolean) as SimulationBody[];
    },
    getBody: (id: string) => simulationState.bodies.get(id),

    // Physics info
    getBarycenter: () => simulationState.barycenter,
    getEnergyDrift: () => simulationState.energyDrift,

    // Direct engine access for advanced usage
    physicsEngine: physicsEngineRef.current
  };
};