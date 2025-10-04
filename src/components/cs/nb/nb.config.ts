// src/components/cs/nb/nb.config.ts
// ===== CORE TYPES =====

/**
 * NOTE: This file was updated to import canonical numeric constants from
 * `nb.planetConstants.ts` and to generate the Solar System `bodies` array
 * programmatically. All exported names and shapes from the original file
 * are preserved so downstream modules are not disrupted.
 */

// import plain numeric constants (data-only, no circular types)
import {
  PLANETARY_CONSTANTS,
  MOON_CONSTANTS,
  DEFAULT_BODY_COLORS,
  PLANET_KEYS
} from './nb.planetConstants';

// ===== CORE TYPES =====

export interface Vector3Data {
    x: number;
    y: number;
    z: number;
}

export interface OrbitalElements {
    semiMajorAxis: number;      // a (AU)
    eccentricity: number;       // e (0-1)
    inclination: number;        // i (radians)
    longitudeOfAscendingNode: number;  // Ω (radians)
    argumentOfPeriapsis: number;       // ω (radians)
    meanAnomalyAtEpoch: number;        // M0 (radians)
    epochTime: number;                 // t0 (seconds)
}

export type BodyType = 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'artificial' | 'particle' | 'blackhole';
export type IntegratorType = 'euler' | 'leapfrog' | 'runge-kutta-4' | 'verlet' | 'hermite';
export type ForceAlgorithm = 'brute-force' | 'barnes-hut' | 'fast-multipole' | 'tree-code';

export interface CelestialBodyDefinition {
    id: string;
    name: string;
    type: BodyType;

    // Physical properties
    position: Vector3Data;
    velocity: Vector3Data;
    mass: number;           // kg
    radius: number;         // meters
    density?: number;       // kg/m³ (calculated if not provided)

    // Visual properties
    color: string;
    emissive?: string;      // for stars
    texture?: string;
    albedo: number;         // 0-1 reflectivity
    temperature?: number;   // Kelvin (for color calculation)

    // Hierarchical relationships
    parentId?: string;
    childIds: string[];

    // Advanced properties
    orbitalElements?: OrbitalElements;  // For analytical orbits
    rotationPeriod?: number;            // seconds
    obliquity?: number;                 // axial tilt in radians
    magneticField?: number;             // Tesla
    atmosphere?: {
        pressure: number;     // Pascals
        composition: Record<string, number>; // gas percentages
    };

    // Optimization flags
    isFixed: boolean;       // doesn't move (like galactic center)
    useAnalyticalOrbit: boolean;  // Use Kepler's laws instead of N-body
    collisionRadius?: number;     // different from visual radius

    // Metadata
    realWorldObject?: string;     // "Earth", "Alpha Centauri A", etc.
    discoveryDate?: string;
    physicalDescription?: string;
}

// ===== PHYSICS CONFIGURATION =====

export interface PhysicsConfig {
    // Core constants
    gravitationalConstant: number;    // m³ kg⁻¹ s⁻²
    speedOfLight: number;            // m/s (for relativistic effects)

    // Integration settings
    timeStep: number;                // seconds per step
    maxTimeStep: number;             // adaptive stepping limit
    minTimeStep: number;             // prevent infinite subdivision
    integrator: IntegratorType;
    adaptiveTimeStep: boolean;
    errorTolerance: number;          // for adaptive stepping

    // Force calculation
    algorithm: ForceAlgorithm;
    barnesHutTheta: number;         // accuracy parameter (0.1-1.0)
    softening: number;              // prevent r=0 singularities (meters)

    // Collision detection
    enableCollisions: boolean;
    collisionType: 'merge' | 'bounce' | 'shatter' | 'ignore';
    coefficientOfRestitution: number;  // bounce energy loss

    // Advanced physics
    enableRelativisticEffects: boolean;
    enableTidalForces: boolean;
    enableRadiationPressure: boolean;
    enableStellarWind: boolean;

    // Performance limits
    maxBodies: number;
    spatialSubdivisionDepth: number;
    forceCalculationThreads: number;

    // Energy conservation tracking
    trackConservationLaws: boolean;
    energyDriftThreshold: number;    // warning threshold for energy drift
}

// ===== VISUAL CONFIGURATION =====

export interface VisualConfig {
    // Rendering quality
    qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
    targetFrameRate: number;
    adaptiveQuality: boolean;        // reduce quality to maintain FPS

    // Particle rendering
    particleSize: 'realistic' | 'enhanced' | 'adaptive';
    minParticleSize: number;         // pixels
    maxParticleSize: number;         // pixels
    particleGlow: boolean;
    glowIntensity: number;          // 0-2

    // Trail system
    enableTrails: boolean;
    trailLength: number;            // number of points
    trailFadeType: 'linear' | 'exponential' | 'logarithmic';
    trailOpacity: number;           // 0-1
    trailWidth: number;             // pixels

    // Physics visualization overlays
    showVelocityVectors: boolean;
    showAccelerationVectors: boolean;
    showGravitationalField: boolean;
    showPotentialWells: boolean;
    showCenterOfMass: boolean;
    showHillSpheres: boolean;
    showRocheLobes: boolean;

    // time-space visualization
    showSpacetimeGrid: boolean;
    spacetimeGridOpacity: number;   // 0-1
    spacetimeGridColor: string;     // hex color
    spacetimeGridSize: number;      // size of grid in meters
    spacetimeGridDivisions: number; // number of divisions
    spacetimeWarpStrength: number; // 0-1
    showGravitationalWaves: boolean;


    // Advanced visual effects
    enableBloom: boolean;
    enableGravitationalLensing: boolean;
    enableDopplerShift: boolean;     // color shift for high velocities
    enableRelativisticBeaming: boolean;

    // Background and environment
    showStarField: boolean;
    starFieldDensity: number;       // stars per square degree
    showGrid: boolean;
    showScale: boolean;
    ambientLightIntensity: number;  // 0-1

    // Color schemes
    colorScheme: 'realistic' | 'temperature' | 'velocity' | 'mass' | 'type' | 'custom';
    customColorMap?: Record<string, string>;

    // UI overlays
    showBodyLabels: boolean;
    showDistances: boolean;
    showOrbitalPeriods: boolean;
    showPhysicalProperties: boolean;
}

// ===== CAMERA CONFIGURATION =====

export interface CameraConfig {
    position: Vector3Data;
    target: Vector3Data;
    up: Vector3Data;

    // Movement settings
    followBody?: string;            // body ID to follow
    followDistance: number;         // meters
    followDamping: number;         // 0-1 smoothing

    // Controls
    enableZoom: boolean;
    minZoom: number;               // meters
    maxZoom: number;               // meters
    zoomSpeed: number;

    enableRotation: boolean;
    rotationSpeed: number;
    enablePan: boolean;
    panSpeed: number;

    // Automation
    autoOrbit: boolean;
    orbitSpeed: number;            // radians per second
    autoZoomToFit: boolean;        // zoom to show all bodies
}

// ====== BODY_SCALE TYPE (if not already present) =====
export type BodyScale = {
  min: number;
  max: number;
  multiplier: number;
  lodDistances: number[];
  glowScale?: number;
  enableTrails?: boolean;
  trailLength?: number;
  trailFadeType?: 'linear' | 'exponential' | 'inverse' | 'none';
};

export const BODY_SCALE: Record<string, BodyScale> = {
  star: { min: 5, max: 15, multiplier: 2e-7, lodDistances: [0,500,1000,2000], glowScale: 3, enableTrails: false, trailLength: 0 },
  planet: { min: 1, max: 5, multiplier: 5e-6, lodDistances: [0,300,800,1500], enableTrails: true, trailLength: 300 },
  moon: { min: 0.3, max: 2, multiplier: 1e-5, lodDistances: [0,200,600,1200], enableTrails: true, trailLength: 150 },
  asteroid: { min: 0.1, max: 0.5, multiplier: 1e-4, lodDistances: [0,100,400,800], enableTrails: true, trailLength: 80 },
  comet: { min: 0.2, max: 1, multiplier: 5e-5, lodDistances: [0,150,500,1000], enableTrails: true, trailLength: 400 },
  artificial: { min: 0.05, max: 0.2, multiplier: 1e-3, lodDistances: [0,50,200,600], enableTrails: false, trailLength: 50 },
  particle: { min: 0.01, max: 0.1, multiplier: 1e-3, lodDistances: [0,30,100,400], enableTrails: false, trailLength: 0 }
};

// -------------------------------
// planet -> CelestialBodyDefinition factories (keep in nb.config.ts so types stay authoritative)
// -------------------------------

function capitalizeId(id: string) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function makePlanet(id: keyof typeof PLANETARY_CONSTANTS, overrides: Partial<CelestialBodyDefinition> = {}): CelestialBodyDefinition {
  const p = PLANETARY_CONSTANTS[id];
  const color = (DEFAULT_BODY_COLORS as Record<string,string>)[id] ?? '#888';

  return {
    id,
    name: capitalizeId(id),
    type: 'planet',
    position: { x: p.semiMajorAxis ?? 0, y: 0, z: 0 }, // place on +x axis
    velocity: { x: 0, y: p.orbitalVelocity ?? 0, z: 0 },
    mass: p.mass,
    radius: p.radius,
    color,
    albedo: p.albedo ?? 0.3,
    temperature: p.temperature,
    parentId: 'sun',
    childIds: p.moons ? [...p.moons] : [],
    isFixed: false,
    useAnalyticalOrbit: true,
    rotationPeriod: p.rotationPeriod,
    obliquity: p.obliquity,
    orbitalElements: overrides.orbitalElements ?? undefined,
    ...overrides
  } as CelestialBodyDefinition;
}

function makeMoon(
  id: string, 
  parentId: keyof typeof PLANETARY_CONSTANTS, 
  overrides: Partial<CelestialBodyDefinition> = {}
): CelestialBodyDefinition {
  const m = MOON_CONSTANTS[id];
  const parent = PLANETARY_CONSTANTS[parentId];
  const sun = PLANETARY_CONSTANTS.sun;
  
  const parentSemi = parent?.semiMajorAxis ?? 0;
  const semiFromParent = m?.semiMajorAxisFromParent ?? 0;
  const parentOrbitalV = parent?.orbitalVelocity ?? 0;
  
  // CRITICAL FIX: Vary the initial orbital phase for each moon
  // Instead of placing all moons at 0°, distribute them around parent
  const phaseMap: Record<string, number> = {
    'moon': Math.PI / 2,        // 90° ahead of Earth
    'phobos': 0,                // 0° (on X-axis)
    'deimos': Math.PI,          // 180° opposite
    'io': 0,
    'europa': Math.PI / 2,
    'ganymede': Math.PI,
    'callisto': 3 * Math.PI / 2,
    'titan': Math.PI / 4,
    'enceladus': 3 * Math.PI / 4
  };
  
  const phase = phaseMap[id] || 0;
  
  // Calculate circular orbital velocity around parent
  const G = 6.67430e-11;
  const circularVelocity = Math.sqrt(G * parent.mass / semiFromParent);
  
  // Position: moon at 'phase' angle from parent's position
  // Parent is at (parentSemi, 0, 0)
  // Moon orbits in XZ plane (same as planets orbit sun in XY)
  const moonX = parentSemi + semiFromParent * Math.cos(phase);
  const moonZ = semiFromParent * Math.sin(phase);
  
  // Velocity: parent's velocity + moon's perpendicular velocity
  // Moon velocity direction is tangent to its orbit around parent
  const moonVelX = -circularVelocity * Math.sin(phase);
  const moonVelZ = circularVelocity * Math.cos(phase);
  
  return {
    id,
    name: capitalizeId(id),
    type: 'moon',
    position: { x: moonX, y: 0, z: moonZ },
    velocity: { x: moonVelX, y: parentOrbitalV, z: moonVelZ },
    mass: m?.mass ?? 1e16,
    radius: m?.radius ?? 1e3,
    color: DEFAULT_BODY_COLORS['moon'] ?? '#C0C0C0',
    albedo: m?.albedo ?? 0.1,
    parentId,
    childIds: [],
    isFixed: false,
    useAnalyticalOrbit: false, // Patched conics handles this dynamically
    rotationPeriod: m?.rotationPeriod,
    ...overrides
  } as CelestialBodyDefinition;
}

// Build solar system array: sun + planets + moons (keeps ordering consistent with previous file)
const planetOrder = PLANET_KEYS; // handled in planetConstants
const sunBody: CelestialBodyDefinition = {
  id: 'sun',
  name: 'Sun',
  type: 'star',
  position: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  mass: PLANETARY_CONSTANTS.sun.mass,
  radius: PLANETARY_CONSTANTS.sun.radius,
  color: DEFAULT_BODY_COLORS.sun,
  emissive: DEFAULT_BODY_COLORS.sun,
  albedo: 1.0,
  temperature: PLANETARY_CONSTANTS.sun.temperature,
  parentId: undefined,
  childIds: planetOrder as string[],
  isFixed: true,
  useAnalyticalOrbit: false,
  realWorldObject: 'Sun'
};

const planetBodies = planetOrder.map(k => makePlanet(k));
const moonBodies: CelestialBodyDefinition[] = [];
for (const pKey of planetOrder) {
  const moons = PLANETARY_CONSTANTS[pKey].moons ?? [];
  for (const mKey of moons) {
    moonBodies.push(makeMoon(mKey, pKey));
  }
}

const solarBodies: CelestialBodyDefinition[] = [sunBody, ...planetBodies, ...moonBodies];

// ===== SCENARIO DEFINITIONS =====

export interface ScenarioWaypoint {
    time: number;                  // simulation time in seconds
    cameraPosition: Vector3Data;
    cameraTarget: Vector3Data;
    description: string;
    narration?: string;            // educational text
    highlightBodies?: string[];    // body IDs to highlight
    overlaysToShow?: string[];     // which visual overlays to enable
}

export interface Scenario {
    id: string;
    name: string;
    description: string;
    category: 'solar-system' | 'binary-stars' | 'galaxy' | 'chaos' | 'educational' | 'sandbox';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';

    // Scenario content
    bodies: CelestialBodyDefinition[];
    initialCamera: CameraConfig;
    physicsConfig: Partial<PhysicsConfig>;  // overrides for this scenario
    visualConfig: Partial<VisualConfig>;   // visual settings for this scenario

    // Educational content
    learningObjectives?: string[];
    educationalContext?: string;
    keyPhysicsConcepts?: string[];
    estimatedDuration: number;     // seconds

    // Guided experience
    waypoints?: ScenarioWaypoint[];
    autoNarration?: boolean;
    interactiveElements?: string[]; // what users can modify

    // Metadata
    basedOnRealSystem?: boolean;
    dataSource?: string;           // scientific paper, NASA data, etc.
    accuracy?: 'educational' | 'research' | 'entertainment';
}

// ===== PERFORMANCE CONFIGURATION =====

export interface PerformanceConfig {
    // Computation distribution
    useWebWorkers: boolean;
    maxWorkerThreads: number;
    workerTaskSize: number;        // bodies per worker chunk

    // Memory management
    enableObjectPooling: boolean;
    maxPoolSize: number;
    gcThreshold: number;           // trigger cleanup after N steps

    // Adaptive performance
    enableAdaptiveQuality: boolean;
    targetFrameRate: number;
    qualityAdjustmentRate: number; // how quickly to adapt

    // Spatial optimization
    enableSpatialHashing: boolean;
    spatialHashSize: number;       // grid size for spatial hash
    enableOctree: boolean;
    octreeDepth: number;

    // Level of detail
    enableLOD: boolean;
    lodDistanceThreshold: number;  // meters
    lodParticleReduction: number;  // factor to reduce particles by

    // Profiling
    enableProfiling: boolean;
    profilingInterval: number;     // seconds between reports
    logPerformanceWarnings: boolean;
}

// ===== DEFAULT CONFIGURATIONS =====

export const DEFAULT_PHYSICS: PhysicsConfig = {
    gravitationalConstant: 6.67430e-11,
    speedOfLight: 299792458,
    timeStep: 86400, // 1 day in seconds
    maxTimeStep: 86400 * 7, // 1 week
    minTimeStep: 3600, // 1 hour
    integrator: 'leapfrog',
    adaptiveTimeStep: true,
    errorTolerance: 1e-6,
    algorithm: 'barnes-hut',
    barnesHutTheta: 0.5,
    softening: 1000, // 1 km
    enableCollisions: true,
    collisionType: 'merge',
    coefficientOfRestitution: 0.3,
    enableRelativisticEffects: false,
    enableTidalForces: false,
    enableRadiationPressure: false,
    enableStellarWind: false,
    maxBodies: 10000,
    spatialSubdivisionDepth: 8,
    forceCalculationThreads: 4,
    trackConservationLaws: true,
    energyDriftThreshold: 0.001
};

export const DEFAULT_VISUAL: VisualConfig = {
    qualityLevel: 'high',
    targetFrameRate: 60,
    adaptiveQuality: true,
    particleSize: 'adaptive',
    minParticleSize: 2,
    maxParticleSize: 100,
    particleGlow: true,
    glowIntensity: 1.2,
    enableTrails: true,
    trailLength: 100,
    trailFadeType: 'exponential',
    trailOpacity: 0.7,
    trailWidth: 2,
    showVelocityVectors: false,
    showAccelerationVectors: false,
    showGravitationalField: false,
    showPotentialWells: false,
    showCenterOfMass: false,
    showHillSpheres: false,
    showRocheLobes: false,

    // NEW: Spacetime defaults
    showSpacetimeGrid: false,
    spacetimeGridOpacity: 0.15,
    spacetimeGridColor: '#0066ff',
    spacetimeGridSize: 2000,
    spacetimeGridDivisions: 60,
    spacetimeWarpStrength: 0.05,
    showGravitationalWaves: true,

    enableBloom: true,
    enableGravitationalLensing: false,
    enableDopplerShift: false,
    enableRelativisticBeaming: false,
    showStarField: true,
    starFieldDensity: 1000,
    showGrid: false,
    showScale: true,
    ambientLightIntensity: 0.1,
    colorScheme: 'realistic',
    showBodyLabels: true,
    showDistances: false,
    showOrbitalPeriods: false,
    showPhysicalProperties: false
};

export const DEFAULT_CAMERA: CameraConfig = {
    position: { x: 0, y: 0, z: 1.496e11 }, // 1 AU away
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    followDistance: 1.496e11, // 1 AU
    followDamping: 0.95,
    enableZoom: true,
    minZoom: 1e6, // 1000 km
    maxZoom: 1e15, // ~67 AU
    zoomSpeed: 1.5,
    enableRotation: true,
    rotationSpeed: 1.0,
    enablePan: true,
    panSpeed: 1.0,
    autoOrbit: false,
    orbitSpeed: 0.1,
    autoZoomToFit: false
};

export const DEFAULT_PERFORMANCE: PerformanceConfig = {
    useWebWorkers: true,
    maxWorkerThreads: 4,
    workerTaskSize: 100,
    enableObjectPooling: true,
    maxPoolSize: 1000,
    gcThreshold: 1000,
    enableAdaptiveQuality: true,
    targetFrameRate: 60,
    qualityAdjustmentRate: 0.1,
    enableSpatialHashing: true,
    spatialHashSize: 1000,
    enableOctree: true,
    octreeDepth: 6,
    enableLOD: true,
    lodDistanceThreshold: 1e12, // ~6700 AU
    lodParticleReduction: 0.5,
    enableProfiling: false,
    profilingInterval: 5,
    logPerformanceWarnings: true
};

// ===== PREDEFINED SCENARIOS =====

// Solar System - bodies built from planet constants (keeps exports identical)
export const SOLAR_SYSTEM_SCENARIO: Scenario = {
    id: 'solar-system',
    name: 'Our Solar System',
    description: 'Explore the planets and their motions around the Sun',
    category: 'solar-system',
    difficulty: 'beginner',
    bodies: solarBodies,
    initialCamera: {
        ...DEFAULT_CAMERA,
        position: { x: 0, y: 5e10, z: 5e10 }, // Above and away from solar system
        followBody: 'earth'
    },
    physicsConfig: {
        timeStep: 3600, // 1 hour steps for smoother planetary motion
        algorithm: 'barnes-hut'
    },
    visualConfig: {
        enableTrails: true,
        trailLength: 365, // Show one year of orbital history
        showBodyLabels: true
    },
    learningObjectives: [
        'Understand orbital mechanics',
        'Observe Kepler\'s laws in action',
        'Compare planetary sizes and distances'
    ],
    educationalContext: 'The solar system demonstrates fundamental principles of celestial mechanics, including gravitational attraction, orbital motion, and the conservation of energy and angular momentum.',
    keyPhysicsConcepts: ['Gravity', 'Orbital mechanics', 'Kepler\'s laws', 'Conservation laws'],
    estimatedDuration: 300, // 5 minutes
    basedOnRealSystem: true,
    dataSource: 'NASA JPL Horizons System',
    accuracy: 'educational'
};

// Binary Star System
export const BINARY_STAR_SCENARIO: Scenario = {
    id: 'binary-star',
    name: 'Alpha Centauri A & B',
    description: 'Watch two stars dance around their common center of mass',
    category: 'binary-stars',
    difficulty: 'intermediate',
    bodies: [
        {
            id: 'alpha-cen-a',
            name: 'Alpha Centauri A',
            type: 'star',
            position: { x: -1.1e11, y: 0, z: 0 }, // Offset from barycenter
            velocity: { x: 0, y: -15000, z: 0 },
            mass: 2.2e30, // 1.1 solar masses
            radius: 8.5e8,
            color: '#FFF4EA',
            emissive: '#FFF4EA',
            albedo: 1.0,
            temperature: 5790,
            parentId: undefined,
            childIds: [],
            isFixed: false,
            useAnalyticalOrbit: false,
            realWorldObject: 'Alpha Centauri A'
        },
        {
            id: 'alpha-cen-b',
            name: 'Alpha Centauri B',
            type: 'star',
            position: { x: 1.3e11, y: 0, z: 0 }, // Offset from barycenter
            velocity: { x: 0, y: 12500, z: 0 },
            mass: 1.8e30, // 0.9 solar masses
            radius: 6.0e8,
            color: '#FFE4B5',
            emissive: '#FFE4B5',
            albedo: 1.0,
            temperature: 5260,
            parentId: undefined,
            childIds: [],
            isFixed: false,
            useAnalyticalOrbit: false,
            realWorldObject: 'Alpha Centauri B'
        }
    ],
    initialCamera: {
        ...DEFAULT_CAMERA,
        position: { x: 0, y: 0, z: 5e11 },
        target: { x: 0, y: 0, z: 0 }
    },
    physicsConfig: {
        timeStep: 86400 * 30, // 30 days
        algorithm: 'brute-force' // Only 2 bodies, direct calculation is fine
    },
    visualConfig: {
        enableTrails: true,
        trailLength: 200,
        showCenterOfMass: true,
        enableBloom: true
    },
    learningObjectives: [
        'Understand binary star systems',
        'Observe center of mass motion',
        'See how stellar masses affect orbits'
    ],
    educationalContext: 'Binary star systems are common in the universe. The two stars orbit around their common center of mass (barycenter), demonstrating Newton\'s laws and conservation of momentum.',
    keyPhysicsConcepts: ['Center of mass', 'Mutual orbits', 'Stellar evolution'],
    estimatedDuration: 240,
    basedOnRealSystem: true,
    accuracy: 'educational'
};

// Empty Sandbox
export const SANDBOX_SCENARIO: Scenario = {
    id: 'sandbox',
    name: 'Empty Space',
    description: 'Start with empty space and create your own system',
    category: 'sandbox',
    difficulty: 'beginner',
    bodies: [],
    initialCamera: DEFAULT_CAMERA,
    physicsConfig: {},
    visualConfig: {
        showGrid: true,
        showScale: true
    },
    learningObjectives: [
        'Experiment with different configurations',
        'Understand the effects of mass and distance',
        'Discover stable and unstable orbits'
    ],
    educationalContext: 'Use the sandbox to experiment with different gravitational configurations. Try creating stable orbits, binary systems, or chaotic three-body systems.',
    keyPhysicsConcepts: ['Gravitational force', 'Orbital stability', 'Three-body problem'],
    estimatedDuration: 600, // 10 minutes
    basedOnRealSystem: false,
    accuracy: 'educational'
};

// Galaxy Explorer scenario
export const GALAXY_EXPLORER_SCENARIO: Scenario = {
  id: 'galaxy-explorer',
  name: 'Galaxy Explorer',
  description: 'Fly through a procedurally generated galaxy — inspect star clusters, nebulae, and galactic dynamics.',
  category: 'galaxy',
  difficulty: 'intermediate',
  bodies: [
    // keep this intentionally light — populate procedurally at runtime (e.g. generate 10k stars)
    {
      id: 'central-blackhole',
      name: 'Galactic Core (BH)',
      type: 'blackhole',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      mass: 4e40,
      radius: 1e9,
      color: '#000000',
      albedo: 0,
      parentId: undefined,
      childIds: [],
      isFixed: true,
      useAnalyticalOrbit: false,
      realWorldObject: 'Supermassive Black Hole'
    }
    // you would procedurally generate stellar population here
  ],
  initialCamera: {
    ...DEFAULT_CAMERA,
    position: { x: 0, y: 5e20, z: 5e20 },
    followBody: undefined
  },
  physicsConfig: {
    timeStep: 3600 * 24, // coarse for galactic scales
    algorithm: 'barnes-hut'
  },
  visualConfig: {
    enableTrails: false,
    trailLength: 0,
    showBodyLabels: false
  },
  learningObjectives: [
    'Understand differences between planetary and galactic dynamics',
    'Explore scale differences (AU vs ly)',
    'Observe collective gravitational interactions'
  ],
  educationalContext: 'A galaxy scenario emphasizes emergent dynamics at very large scales, dominated by many-body interactions and dark-matter-like potentials.',
  keyPhysicsConcepts: ['Many-body gravity', 'Dynamical friction', 'Orbital precession'],
  estimatedDuration: 600,
  basedOnRealSystem: false,
  dataSource: 'Procedural / simulated',
  accuracy: 'entertainment'
};

export const PREDEFINED_SCENARIOS: Record<string, Scenario> = {
    'solar-system': SOLAR_SYSTEM_SCENARIO,
    'binary-star': BINARY_STAR_SCENARIO,
    'sandbox': SANDBOX_SCENARIO,
    'galaxy-explorer': GALAXY_EXPLORER_SCENARIO
};

// ===== UTILITY CONSTANTS =====

export const ASTRONOMICAL_UNITS = {
    METER: 1,
    KILOMETER: 1e3,
    ASTRONOMICAL_UNIT: 1.496e11,
    LIGHT_YEAR: 9.461e15,
    PARSEC: 3.086e16,
    SOLAR_RADIUS: 6.96e8,
    EARTH_RADIUS: 6.371e6,
    JUPITER_RADIUS: 6.9911e7
} as const;

export const MASS_UNITS = {
    KILOGRAM: 1,
    SOLAR_MASS: 1.989e30,
    EARTH_MASS: 5.972e24,
    JUPITER_MASS: 1.898e27,
    LUNAR_MASS: 7.342e22
} as const;

export const TIME_UNITS = {
    SECOND: 1,
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    YEAR: 31557600, // Julian year
    MILLION_YEARS: 31557600e6
} as const;

// ===== BODY TEMPLATES =====

export const BODY_TEMPLATES = {
    STAR: {
        type: 'star' as const,
        mass: MASS_UNITS.SOLAR_MASS,
        radius: ASTRONOMICAL_UNITS.SOLAR_RADIUS,
        color: '#FDB813',
        emissive: '#FDB813',
        temperature: 5778,
        albedo: 1.0
    },
    PLANET: {
        type: 'planet' as const,
        mass: MASS_UNITS.EARTH_MASS,
        radius: ASTRONOMICAL_UNITS.EARTH_RADIUS,
        color: '#6B93D6',
        temperature: 288,
        albedo: 0.3
    },
    MOON: {
        type: 'moon' as const,
        mass: MASS_UNITS.LUNAR_MASS,
        radius: ASTRONOMICAL_UNITS.EARTH_RADIUS * 0.27,
        color: '#C0C0C0',
        albedo: 0.136
    },
    ASTEROID: {
        type: 'asteroid' as const,
        mass: 1e15, // ~1 km diameter rocky body
        radius: 500,
        color: '#8C7853',
        albedo: 0.05
    }
} as const;
