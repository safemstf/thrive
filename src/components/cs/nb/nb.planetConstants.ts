// src/components/cs/nb/nb.planetConstants.ts
// Plain numeric constants only — used by nb.config.ts
// Units: mass (kg), radius (m), semiMajorAxis (m), orbitalVelocity (m/s), temperature (K), albedo unitless
// Additional fields: rotationPeriod (s), obliquity (rad), surfaceGravity (m/s^2), escapeVelocity (m/s), orbitalPeriod (s)

export type PlanetConstKey =
  | 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';

export const PLANETARY_CONSTANTS: Record<
  PlanetConstKey,
  {
    mass: number;
    radius: number;
    semiMajorAxis?: number;
    orbitalVelocity?: number;
    meanDensity?: number;
    albedo?: number;
    temperature?: number;
    rotationPeriod?: number;
    obliquity?: number; // radians
    surfaceGravity?: number;
    escapeVelocity?: number;
    orbitalPeriod?: number; // seconds
    moons?: string[]; // moon keys (strings)
    notes?: string;
  }
> = {
  sun: {
    mass: 1.98847e30,
    radius: 6.9634e8,
    meanDensity: 1408,
    albedo: 1,
    temperature: 5778,
    rotationPeriod: 2.16e6, // roughly ~25 days at equator in seconds (approx.)
    obliquity: 7.25 * Math.PI / 180,
    surfaceGravity: 274,
    escapeVelocity: 617700,
    moons: [],
    notes: 'G-type main-sequence star'
  },

  mercury: {
    mass: 3.3011e23,
    radius: 2.4397e6,
    semiMajorAxis: 5.7909e10,
    orbitalVelocity: 47870,
    orbitalPeriod: 7.6005e6, // ~88 days
    meanDensity: 5427,
    albedo: 0.119,
    temperature: 440,
    rotationPeriod: 5.07e6, // slow, 58.6 days
    obliquity: 0.034 * Math.PI/180,
    surfaceGravity: 3.7,
    escapeVelocity: 4250,
    moons: [],
    notes: 'Small, airless, heavily cratered'
  },

  venus: {
    mass: 4.8675e24,
    radius: 6.0518e6,
    semiMajorAxis: 1.0821e11,
    orbitalVelocity: 35020,
    orbitalPeriod: 1.941e7, // ~224.7 days
    meanDensity: 5243,
    albedo: 0.689,
    temperature: 735,
    rotationPeriod: -2.6e7, // retrograde: -243 days
    obliquity: 177.36 * Math.PI/180, // using degrees converted to rad (retrograde)
    surfaceGravity: 8.87,
    escapeVelocity: 10360,
    moons: [],
    notes: 'Thick CO2 atmosphere, extreme greenhouse'
  },

  earth: {
    mass: 5.97237e24,
    radius: 6.371e6,
    semiMajorAxis: 1.495978707e11,
    orbitalVelocity: 29780,
    orbitalPeriod: 3.15576e7, // 1 year (Julian)
    meanDensity: 5514,
    albedo: 0.306,
    temperature: 288,
    rotationPeriod: 86164, // sidereal day (s)
    obliquity: 23.439281 * Math.PI/180,
    surfaceGravity: 9.807,
    escapeVelocity: 11186,
    moons: ['moon'],
    notes: 'Host to life; reference for "Earthlike" parameters'
  },

  mars: {
    mass: 6.4171e23,
    radius: 3.3895e6,
    semiMajorAxis: 2.279e11,
    orbitalVelocity: 24070,
    orbitalPeriod: 5.93e7, // ~687 days
    meanDensity: 3933,
    albedo: 0.25,
    temperature: 210,
    rotationPeriod: 88642, // ~24.6 hours
    obliquity: 25.19 * Math.PI/180,
    surfaceGravity: 3.71,
    escapeVelocity: 5030,
    moons: ['phobos', 'deimos'],
    notes: 'Thin CO2 atmosphere; red iron oxide surface'
  },

  jupiter: {
    mass: 1.89813e27,
    radius: 6.9911e7,
    semiMajorAxis: 7.785e11,
    orbitalVelocity: 13070,
    orbitalPeriod: 3.743e8, // ~11.86 years
    meanDensity: 1326,
    albedo: 0.343,
    temperature: 165,
    rotationPeriod: 35730, // ~9.9 hours
    obliquity: 3.13 * Math.PI/180,
    surfaceGravity: 24.79,
    escapeVelocity: 59500,
    moons: ['io','europa','ganymede','callisto'],
    notes: 'Gas giant with strong magnetic field; many moons'
  },

  saturn: {
    mass: 5.6834e26,
    radius: 5.8232e7,
    semiMajorAxis: 1.427e12,
    orbitalVelocity: 9690,
    orbitalPeriod: 9.292e8, // ~29.46 years
    meanDensity: 687,
    albedo: 0.342,
    temperature: 134,
    rotationPeriod: 38340, // ~10.7 hours
    obliquity: 26.7 * Math.PI/180,
    surfaceGravity: 10.44,
    escapeVelocity: 35900,
    moons: ['titan','enceladus'],
    notes: 'Prominent rings; low mean density'
  },

  uranus: {
    mass: 8.6810e25,
    radius: 2.5362e7,
    semiMajorAxis: 2.871e12,
    orbitalVelocity: 6810,
    orbitalPeriod: 2.655e9, // ~84 years
    meanDensity: 1271,
    albedo: 0.3,
    temperature: 76,
    rotationPeriod: -62064, // retrograde-ish ~ -17.24 hours (for modeling treat signs accordingly)
    obliquity: 97.77 * Math.PI/180,
    surfaceGravity: 8.69,
    escapeVelocity: 21600,
    moons: [],
    notes: 'Ice giant; extreme axial tilt'
  },

  neptune: {
    mass: 1.02413e26,
    radius: 2.4622e7,
    semiMajorAxis: 4.498e12,
    orbitalVelocity: 5430,
    orbitalPeriod: 5.2e9, // ~165 years
    meanDensity: 1638,
    albedo: 0.29,
    temperature: 72,
    rotationPeriod: 57996, // ~16.11 hours
    obliquity: 29.58 * Math.PI/180,
    surfaceGravity: 11.15,
    escapeVelocity: 23700,
    moons: [],
    notes: 'Farthest major planet, dynamic atmosphere'
  }
};

// A minimal moon constants map (extendable). All semi-major distances are from parent center.
export const MOON_CONSTANTS: Record<string, {
  mass: number;
  radius: number;
  semiMajorAxisFromParent?: number; // m
  orbitalVelocity?: number;
  albedo?: number;
  orbitalPeriod?: number; // s
  rotationPeriod?: number; // s (synchronous = orbitalPeriod)
  notes?: string;
}> = {
  moon: {
    mass: 7.342e22,
    radius: 1.7374e6,
    semiMajorAxisFromParent: 3.844e8,
    orbitalVelocity: 1022,
    orbitalPeriod: 2.3606e6, // ~27.3 days
    rotationPeriod: 2.3606e6,
    albedo: 0.136,
    notes: "Earth's Moon; tidally locked"
  },

  phobos: {
    mass: 1.0659e16,
    radius: 1.1e4,
    semiMajorAxisFromParent: 9.378e6,
    orbitalVelocity: 2138,
    orbitalPeriod: 27552, // ~7.65 hours
    albedo: 0.071,
    notes: 'Mars inner moon; decaying orbit'
  },

  deimos: {
    mass: 1.4762e15,
    radius: 6.2e3,
    semiMajorAxisFromParent: 2.3459e7,
    orbitalVelocity: 1351,
    orbitalPeriod: 109080, // ~30.3 hours
    albedo: 0.068,
    notes: 'Mars outer moon'
  },

  io: {
    mass: 8.9319e22,
    radius: 1.8216e6,
    semiMajorAxisFromParent: 4.217e8,
    orbitalVelocity: 17370,
    orbitalPeriod: 152853, // ~1.769 days
    rotationPeriod: 152853,
    albedo: 0.63,
    notes: 'Volcanically active'
  },

  europa: {
    mass: 4.7998e22,
    radius: 1.5608e6,
    semiMajorAxisFromParent: 6.711e8,
    orbitalVelocity: 13500,
    orbitalPeriod: 306822, // ~3.55 days
    rotationPeriod: 306822,
    albedo: 0.67,
    notes: 'Icy surface; subsurface ocean candidate'
  },

  ganymede: {
    mass: 1.4819e23,
    radius: 2.6341e6,
    semiMajorAxisFromParent: 1.0704e9,
    orbitalVelocity: 10880,
    orbitalPeriod: 604800, // ~7.15 days
    rotationPeriod: 604800,
    albedo: 0.43,
    notes: 'Largest moon in Solar System'
  },

  callisto: {
    mass: 1.0759e23,
    radius: 2.4103e6,
    semiMajorAxisFromParent: 1.8827e9,
    orbitalVelocity: 8200,
    orbitalPeriod: 1.7e6, // ~16.7 days
    rotationPeriod: 1.7e6,
    albedo: 0.22,
    notes: 'Heavily cratered outer Galilean moon'
  },

  titan: {
    mass: 1.3452e23,
    radius: 2.575e6,
    semiMajorAxisFromParent: 1.2219e9,
    orbitalVelocity: 5600,
    orbitalPeriod: 1.382e6, // ~15.95 days
    rotationPeriod: 1.382e6,
    albedo: 0.22,
    notes: 'Saturn moon with dense atmosphere'
  },

  enceladus: {
    mass: 1.08022e20,
    radius: 2.52e5,
    semiMajorAxisFromParent: 2.378e8,
    orbitalVelocity: 12000,
    orbitalPeriod: 529920, // ~6.13 days
    rotationPeriod: 529920,
    albedo: 0.81,
    notes: 'Geysers and subsurface water'
  }
};

export const DEFAULT_BODY_COLORS: Record<string, string> = {
  sun: '#FDB813',
  mercury: '#8C7853',
  venus: '#FFC649',
  earth: '#6B93D6',
  mars: '#CD5C5C',
  jupiter: '#DAA520',
  saturn: '#F4E99B',
  uranus: '#4FD0E0',
  neptune: '#4169E1',
  moon: '#C0C0C0'
};

// Convenience export listing for iteration in factories (optional consumer)
export const PLANET_KEYS: PlanetConstKey[] = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'];
