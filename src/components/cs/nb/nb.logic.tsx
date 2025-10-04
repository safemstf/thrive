// src/components/cs/nb/nb.logic.tsx
// N-Body Simulation with Patched Conics (Sphere of Influence Method)

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

export interface KeplerOrbit {
  semiMajorAxis: number;           // a (meters)
  eccentricity: number;            // e (0-1)
  inclination: number;             // i (radians)
  longitudeAscNode: number;        // Ω (radians)
  argPeriapsis: number;            // ω (radians)
  meanAnomalyAtEpoch: number;      // M0 at t0 (radians)
  epoch: number;                   // t0 (seconds)
  period: number;                  // T (seconds)
}

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

  // Sphere of Influence (Patched Conics)
  sphereOfInfluence?: number;      // SOI radius in meters
  dominantBody?: string;            // ID of body whose SOI we're in
  distanceFromDominant?: number;    // current distance to dominant body
  keplerOrbit?: KeplerOrbit;        // Orbital elements when in SOI
  useKeplerOrbit?: boolean;         // Flag to use analytical orbit this step
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

  constructor(cellSize: number = 1e10) {
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

// ===== KEPLER ORBIT SOLVER =====

class KeplerSolver {
  private config: PhysicsConfig;

  constructor(config: PhysicsConfig) {
    this.config = config;
  }

  // Solve Kepler's equation: M = E - e*sin(E)
  private solveKeplerEquation(M: number, e: number, tolerance: number = 1e-8): number {
    let E = M; // Initial guess
    
    // Newton-Raphson iteration
    for (let i = 0; i < 15; i++) {
      const f = E - e * Math.sin(E) - M;
      const fp = 1 - e * Math.cos(E);
      const delta = f / fp;
      E -= delta;
      
      if (Math.abs(delta) < tolerance) break;
    }
    
    return E;
  }

  // Convert state vectors to orbital elements
  stateToElements(
    position: Vector3,
    velocity: Vector3,
    mu: number, // G * M_primary
    currentTime: number
  ): KeplerOrbit {
    const r = position.magnitude();
    const v = velocity.magnitude();

    // Specific orbital energy
    const energy = v * v / 2 - mu / r;
    
    // Semi-major axis: a = -mu / (2 * E)
    const a = -mu / (2 * energy);
    
    // Angular momentum vector: h = r × v
    const h = position.cross(velocity);
    const hMag = h.magnitude();
    
    // Eccentricity vector: e = (v × h) / mu - r_hat
    const eVec = velocity.cross(h).divide(mu).subtract(position.normalize());
    const e = eVec.magnitude();
    
    // Inclination: i = acos(h_z / |h|)
    const i = Math.acos(h.z / hMag);
    
    // Node vector: n = k × h (where k is [0,0,1])
    const n = new Vector3(-h.y, h.x, 0);
    const nMag = n.magnitude();
    
    // Longitude of ascending node: Ω
    let Omega = 0;
    if (nMag > 1e-10) {
      Omega = Math.acos(n.x / nMag);
      if (n.y < 0) Omega = 2 * Math.PI - Omega;
    }
    
    // Argument of periapsis: ω
    let omega = 0;
    if (nMag > 1e-10 && e > 1e-10) {
      omega = Math.acos(n.dot(eVec) / (nMag * e));
      if (eVec.z < 0) omega = 2 * Math.PI - omega;
    }
    
    // True anomaly: ν
    let nu = 0;
    if (e > 1e-10) {
      nu = Math.acos(eVec.dot(position) / (e * r));
      if (position.dot(velocity) < 0) nu = 2 * Math.PI - nu;
    } else {
      // Circular orbit - use argument of latitude
      nu = Math.acos(n.dot(position) / (nMag * r));
      if (position.z < 0) nu = 2 * Math.PI - nu;
    }
    
    // Eccentric anomaly: E
    const E = 2 * Math.atan2(
      Math.sqrt(1 - e) * Math.sin(nu / 2),
      Math.sqrt(1 + e) * Math.cos(nu / 2)
    );
    
    // Mean anomaly: M = E - e * sin(E)
    const M = E - e * Math.sin(E);
    
    // Orbital period: T = 2π * sqrt(a³ / μ)
    const T = 2 * Math.PI * Math.sqrt(Math.abs(a * a * a) / mu);
    
    return {
      semiMajorAxis: a,
      eccentricity: e,
      inclination: i,
      longitudeAscNode: Omega,
      argPeriapsis: omega,
      meanAnomalyAtEpoch: M,
      epoch: currentTime,
      period: T
    };
  }

  // Convert orbital elements to state vectors
  elementsToState(
    orbit: KeplerOrbit,
    primaryPos: Vector3,
    primaryVel: Vector3,
    mu: number,
    currentTime: number
  ): { position: Vector3Data; velocity: Vector3Data } {
    const { semiMajorAxis: a, eccentricity: e, inclination: i,
            longitudeAscNode: Omega, argPeriapsis: omega,
            meanAnomalyAtEpoch: M0, epoch: t0, period: T } = orbit;
    
    // Mean motion: n = 2π / T
    const n = 2 * Math.PI / T;
    
    // Time since epoch
    const dt = currentTime - t0;
    
    // Current mean anomaly: M = M0 + n * dt
    const M = (M0 + n * dt) % (2 * Math.PI);
    
    // Solve for eccentric anomaly
    const E = this.solveKeplerEquation(M, e);
    
    // True anomaly
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    );
    
    // Distance from primary
    const r = a * (1 - e * Math.cos(E));
    
    // Position in orbital plane
    const x_orb = r * Math.cos(nu);
    const y_orb = r * Math.sin(nu);
    
    // Velocity in orbital plane
    const v_factor = Math.sqrt(mu / (a * (1 - e * e)));
    const vx_orb = -v_factor * Math.sin(nu);
    const vy_orb = v_factor * (e + Math.cos(nu));
    
    // Rotation matrices
    const cos_Omega = Math.cos(Omega);
    const sin_Omega = Math.sin(Omega);
    const cos_omega = Math.cos(omega);
    const sin_omega = Math.sin(omega);
    const cos_i = Math.cos(i);
    const sin_i = Math.sin(i);
    
    // Transform to 3D space (perifocal to inertial frame)
    const P_x = cos_Omega * cos_omega - sin_Omega * sin_omega * cos_i;
    const P_y = sin_Omega * cos_omega + cos_Omega * sin_omega * cos_i;
    const P_z = sin_omega * sin_i;
    
    const Q_x = -cos_Omega * sin_omega - sin_Omega * cos_omega * cos_i;
    const Q_y = -sin_Omega * sin_omega + cos_Omega * cos_omega * cos_i;
    const Q_z = cos_omega * sin_i;
    
    // Position relative to primary
    const x_rel = P_x * x_orb + Q_x * y_orb;
    const y_rel = P_y * x_orb + Q_y * y_orb;
    const z_rel = P_z * x_orb + Q_z * y_orb;
    
    // Velocity relative to primary
    const vx_rel = P_x * vx_orb + Q_x * vy_orb;
    const vy_rel = P_y * vx_orb + Q_y * vy_orb;
    const vz_rel = P_z * vx_orb + Q_z * vy_orb;
    
    // Transform to world coordinates
    return {
      position: {
        x: primaryPos.x + x_rel,
        y: primaryPos.y + y_rel,
        z: primaryPos.z + z_rel
      },
      velocity: {
        x: primaryVel.x + vx_rel,
        y: primaryVel.y + vy_rel,
        z: primaryVel.z + vz_rel
      }
    };
  }
}

// ===== PHYSICS ENGINE =====

class PhysicsEngine {
  private config: PhysicsConfig;
  private spatialGrid: SpatialHashGrid;
  private keplerSolver: KeplerSolver;
  private barycenter: Vector3 = new Vector3();
  private totalSystemMass: number = 0;
  private bodiesMapRef: Map<string, SimulationBody> = new Map();

  constructor(config: PhysicsConfig = DEFAULT_PHYSICS) {
    this.config = config;
    this.spatialGrid = new SpatialHashGrid();
    this.keplerSolver = new KeplerSolver(config);
  }

  updateConfiguration(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Calculate sphere of influence using Laplace formula
  private calculateSOI(body: SimulationBody, primaryBody: SimulationBody): number {
    const bodyPos = Vector3.from(body.position);
    const primaryPos = Vector3.from(primaryBody.position);
    const a = bodyPos.distanceTo(primaryPos); // semi-major axis approximation
    
    const massRatio = body.mass / primaryBody.mass;
    
    // Laplace SOI: r_SOI = a * (m_sat / m_primary)^(2/5)
    return a * Math.pow(massRatio, 0.4);
  }

  // Find which body's SOI this body is currently in (hierarchical check)
  private findDominantBody(body: SimulationBody, bodies: Map<string, SimulationBody>): string | undefined {
    // Only check the body's designated parent from the hierarchy
    // This prevents moons from being captured by the Sun
    if (!body.parentId) {
      return undefined; // Top-level bodies (like the Sun) have no dominant body
    }
    
    const parent = bodies.get(body.parentId);
    if (!parent) {
      return undefined;
    }
    
    const bodyPos = Vector3.from(body.position);
    const parentPos = Vector3.from(parent.position);
    const distance = bodyPos.distanceTo(parentPos);
    
    // Calculate parent's SOI if not already cached
    if (!parent.sphereOfInfluence) {
      // Find the parent's parent (grandparent) to calculate SOI
      const grandparent = parent.parentId ? bodies.get(parent.parentId) : null;
      
      if (grandparent) {
        // Normal case: planet orbiting star, moon orbiting planet
        parent.sphereOfInfluence = this.calculateSOI(parent, grandparent);
      } else {
        // Parent has no parent (it's a top-level body like the Sun)
        // Give it a very large SOI
        parent.sphereOfInfluence = 1e15; // ~6700 AU
      }
    }
    
    // Check if we're inside parent's SOI
    if (distance < parent.sphereOfInfluence) {
      return parent.id;
    }
    
    // Outside parent's SOI - body is now in N-body regime
    return undefined;
  }

  // Update SOI status for all bodies
  private updateSOIStatus(bodies: Map<string, SimulationBody>, currentTime: number): void {
    this.bodiesMapRef = bodies;
    
    for (const body of bodies.values()) {
      // Skip fixed bodies (they don't orbit anything)
      if (body.isFixed) {
        body.dominantBody = undefined;
        body.useKeplerOrbit = false;
        continue;
      }
      
      const previousDominant = body.dominantBody;
      const newDominant = this.findDominantBody(body, bodies);
      
      body.dominantBody = newDominant;
      
      if (newDominant) {
        const dominant = bodies.get(newDominant)!;
        const bodyPos = Vector3.from(body.position);
        const domPos = Vector3.from(dominant.position);
        body.distanceFromDominant = bodyPos.distanceTo(domPos);
        
        // If entering new SOI or don't have orbit yet, calculate orbital elements
        if (newDominant !== previousDominant || !body.keplerOrbit) {
          const mu = this.config.gravitationalConstant * dominant.mass;
          const relPos = bodyPos.subtract(domPos);
          const relVel = Vector3.from(body.velocity).subtract(Vector3.from(dominant.velocity));
          
          body.keplerOrbit = this.keplerSolver.stateToElements(
            relPos,
            relVel,
            mu,
            currentTime
          );
          
          console.log(`${body.name} entered ${dominant.name}'s SOI - orbital period: ${(body.keplerOrbit.period / 86400).toFixed(1)} days`);
        }
        
        // Use Kepler orbit if we have valid elements
        body.useKeplerOrbit = !!body.keplerOrbit;
      } else {
        // Outside all SOIs - use N-body physics
        body.useKeplerOrbit = false;
        body.distanceFromDominant = undefined;
        
        if (previousDominant) {
          console.log(`${body.name} left SOI - using N-body physics`);
        }
      }
    }
  }

  calculateBarycenter(bodies: Map<string, SimulationBody>): Vector3Data {
    let totalMass = 0;
    let centerX = 0, centerY = 0, centerZ = 0;

    for (const body of bodies.values()) {
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

    for (const body of bodyArray) {
      if (body.isFixed) continue;

      const vel = Vector3.from(body.velocity);
      const speed = vel.magnitude();

      totalKinetic += 0.5 * body.mass * speed * speed;
      totalMomentum.x += body.mass * body.velocity.x;
      totalMomentum.y += body.mass * body.velocity.y;
      totalMomentum.z += body.mass * body.velocity.z;
    }

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

  // Main force computation with patched conics
  computeForces(bodies: Map<string, SimulationBody>, currentTime: number): PhysicsUpdate[] {
    const updates: PhysicsUpdate[] = [];
    const bodyArray = Array.from(bodies.values());

    // Update SOI status
    this.updateSOIStatus(bodies, currentTime);

    // Update spatial grid
    this.spatialGrid.clear();
    for (const body of bodyArray) {
      this.spatialGrid.addBody(body.id, Vector3.from(body.position));
    }

    // Calculate forces for bodies NOT using Kepler orbits
    for (const body of bodyArray) {
      // Bodies using Kepler orbits skip force calculation
      if (body.useKeplerOrbit) {
        // Position/velocity will be calculated in integration step
        updates.push({
          bodyId: body.id,
          position: body.position,
          velocity: body.velocity,
          acceleration: { x: 0, y: 0, z: 0 },
          kineticEnergy: 0,
          potentialEnergy: 0
        });
        continue;
      }

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

        const softenedDistanceSquared = distanceSquared + this.config.softening * this.config.softening;
        const distance = Math.sqrt(softenedDistanceSquared);

        const forceMagnitude = this.config.gravitationalConstant * body.mass * otherBody.mass / softenedDistanceSquared;
        const forceDirection = r.normalize();

        force.x += forceMagnitude * forceDirection.x;
        force.y += forceMagnitude * forceDirection.y;
        force.z += forceMagnitude * forceDirection.z;

        potentialEnergy -= this.config.gravitationalConstant * body.mass * otherBody.mass / distance;
      }

      const acceleration = body.isFixed
        ? new Vector3(0, 0, 0)
        : force.divide(body.mass);

      const speed = bodyVel.magnitude();
      const kineticEnergy = 0.5 * body.mass * speed * speed;

      body.orbitalSpeed = speed;

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
        potentialEnergy: potentialEnergy / 2
      });

      body.acceleration = acceleration.toData();
      body.kineticEnergy = kineticEnergy;
      body.potentialEnergy = potentialEnergy / 2;
    }

    return updates;
  }

  // Integration with Kepler orbit support
  integrateStep(body: SimulationBody, timeStep: number, currentTime: number): void {
    if (body.isFixed) return;

    // Store previous state
    body.previousPosition = { ...body.position };
    body.previousVelocity = { ...body.velocity };

    // Use Kepler orbit if in SOI
    if (body.useKeplerOrbit && body.keplerOrbit && body.dominantBody) {
      const dominant = this.bodiesMapRef.get(body.dominantBody);
      if (dominant) {
        const mu = this.config.gravitationalConstant * dominant.mass;
        const state = this.keplerSolver.elementsToState(
          body.keplerOrbit,
          Vector3.from(dominant.position),
          Vector3.from(dominant.velocity),
          mu,
          currentTime
        );
        
        body.position = state.position;
        body.velocity = state.velocity;
        return;
      }
    }

    // Otherwise use N-body integration
    const dt = timeStep;

    if (this.config.integrator === 'leapfrog') {
      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;

      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      body.position.z += body.velocity.z * dt;

    } else if (this.config.integrator === 'verlet') {
      const halfDtSquared = 0.5 * dt * dt;

      body.position.x += body.velocity.x * dt + body.acceleration.x * halfDtSquared;
      body.position.y += body.velocity.y * dt + body.acceleration.y * halfDtSquared;
      body.position.z += body.velocity.z * dt + body.acceleration.z * halfDtSquared;

      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;

    } else {
      // Euler
      body.position.x += body.velocity.x * dt;
      body.position.y += body.velocity.y * dt;
      body.position.z += body.velocity.z * dt;

      body.velocity.x += body.acceleration.x * dt;
      body.velocity.y += body.acceleration.y * dt;
      body.velocity.z += body.acceleration.z * dt;
    }
  }

  calculateAdaptiveTimeStep(bodies: Map<string, SimulationBody>, currentTimeStep: number): number {
    if (!this.config.adaptiveTimeStep) return currentTimeStep;

    let minOrbitalPeriod = Infinity;
    
    // Find shortest period from bodies using Kepler orbits
    for (const body of bodies.values()) {
      if (body.keplerOrbit) {
        minOrbitalPeriod = Math.min(minOrbitalPeriod, body.keplerOrbit.period);
      }
    }
    
    // Time step should be ~1/100th of shortest orbital period
    const suggestedTimeStep = minOrbitalPeriod / 100;
    
    const targetTimeStep = Math.max(
      this.config.minTimeStep,
      Math.min(this.config.maxTimeStep, suggestedTimeStep)
    );

    return currentTimeStep + (targetTimeStep - currentTimeStep) * 0.1;
  }

  destroy(): void {
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

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const simulationStateRef = useRef(simulationState);

  useEffect(() => {
    isRunningRef.current = simulationState.isRunning;
    isPausedRef.current = simulationState.isPaused;
    simulationStateRef.current = simulationState;
  }, [simulationState]);

  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const initialEnergyRef = useRef<number | null>(null);
  const fpsCounterRef = useRef<number>(0);
  const fpsUpdateTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const physicsConfig = { ...DEFAULT_PHYSICS, ...config };
    physicsEngineRef.current = new PhysicsEngine(physicsConfig);

    return () => {
      physicsEngineRef.current?.destroy();
    };
  }, []);

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
      const updates = engine.computeForces(prev.bodies, prev.currentTime);

      const physicsTimeStep = prev.timeStep;

      for (const update of updates) {
        const body = prev.bodies.get(update.bodyId);
        if (body) {
          body.acceleration = update.acceleration;
          engine.integrateStep(body, physicsTimeStep, prev.currentTime + physicsTimeStep);
          body.kineticEnergy = update.kineticEnergy;
          body.potentialEnergy = update.potentialEnergy;
        }
      }

      const energyInfo = engine.calculateSystemEnergy(prev.bodies);

      if (initialEnergyRef.current === null && energyInfo.totalEnergy !== 0) {
        initialEnergyRef.current = energyInfo.totalEnergy;
      }

      const energyDrift = initialEnergyRef.current
        ? Math.abs((energyInfo.totalEnergy - initialEnergyRef.current) / initialEnergyRef.current)
        : 0;

      const newCurrentTime = prev.currentTime + physicsTimeStep;
      const newTimeStep = engine.calculateAdaptiveTimeStep(prev.bodies, prev.timeStep);
      const physicsTime = performance.now() - startTime;

      fpsCounterRef.current++;
      const currentRealTime = performance.now();
      const fpsElapsed = currentRealTime - fpsUpdateTimeRef.current;

      let newFps = prev.fps;
      if (fpsElapsed >= 500) {
        newFps = Math.round((fpsCounterRef.current * 1000) / fpsElapsed);
        fpsCounterRef.current = 0;
        fpsUpdateTimeRef.current = currentRealTime;
      }

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

  const isRunning = simulationState.isRunning;
  const isPaused = simulationState.isPaused;

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

  const loadScenario = useCallback((scenario: Scenario) => {
    const bodies = new Map<string, SimulationBody>();

    const primaryStar = scenario.bodies.find(b => b.type === 'star');
    const currentViewMode = simulationStateRef.current.viewMode;
    const currentReferenceBodyId = simulationStateRef.current.referenceBodyId;

    console.log(`Loading scenario: ${scenario.name} with ${scenario.bodies.length} bodies`);

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

    for (const [id, body] of bodies) {
      if (body.parentId) {
        body.parentBody = bodies.get(body.parentId);
      }
      body.childBodies = body.childIds
        .map(childId => bodies.get(childId))
        .filter(Boolean) as SimulationBody[];
    }

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

    if (scenario.physicsConfig && physicsEngineRef.current) {
      physicsEngineRef.current.updateConfiguration(scenario.physicsConfig);
    }
  }, []);

  useEffect(() => {
    if (initialScenario) {
      console.log('Loading initial scenario:', initialScenario.name);
      loadScenario(initialScenario);
    }
  }, [initialScenario, loadScenario]);

  const setViewMode = useCallback((mode: ViewMode, referenceBodyId?: string) => {
    setSimulationState(prev => {
      const newState = { ...prev, viewMode: mode, referenceBodyId };
      const primaryStar = Array.from(prev.bodies.values()).find(b => b.type === 'star');

      for (const body of prev.bodies.values()) {
        if (mode === 'heliocentric' && primaryStar) {
          body.isFixed = (body.id === primaryStar.id);
        } else if (mode === 'barycentric') {
          body.isFixed = false;
        } else if (mode === 'relative' && referenceBodyId) {
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
      if (prev.bodies.size === 0) {
        console.error('Cannot start simulation: no bodies loaded');
        return prev;
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

  return {
    simulationState,
    loadScenario,
    setViewMode,
    addBody,
    removeBody,
    updateBody,
    selectBody,
    clearSelection,
    start,
    pause,
    stop,
    reset,
    setSpeed,
    setTimeStep,
    getBodies: () => Array.from(simulationState.bodies.values()),
    getSelectedBodies: () => {
      return Array.from(simulationState.selectedBodyIds)
        .map(id => simulationState.bodies.get(id))
        .filter(Boolean) as SimulationBody[];
    },
    getBody: (id: string) => simulationState.bodies.get(id),
    getBarycenter: () => simulationState.barycenter,
    getEnergyDrift: () => simulationState.energyDrift,
    physicsEngine: physicsEngineRef.current
  };
};