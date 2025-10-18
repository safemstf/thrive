// src/components/cs/nb/nb.spacecraftConstants.ts
// Spacecraft mission data - follows same pattern as planetConstants
// Units: mass (kg), radius (m), launchDate (ISO string), current/historical positions

export type SpacecraftKey = 
  | 'voyager1' | 'voyager2' | 'jwst' | 'new-horizons' 
  | 'cassini' | 'parker-solar' | 'juno' | 'hubble';

export interface SpacecraftMissionData {
  mass: number;              // kg
  radius: number;            // m (for visualization)
  launchDate: string;        // ISO date string
  missionStatus: 'active' | 'completed' | 'lost';
  missionType: 'flyby' | 'orbiter' | 'lander' | 'telescope' | 'probe';
  
  // Initial conditions (at a reference epoch)
  referenceEpoch: string;    // ISO date for position/velocity
  position: { x: number; y: number; z: number };  // meters from Sun
  velocity: { x: number; y: number; z: number };  // m/s
  
  // Visual properties
  color: string;
  trailColor?: string;
  icon?: string;             // SVG path or emoji
  
  // Mission metadata
  agency: string;
  description: string;
  scientificObjectives: string[];
  milestones: MissionMilestone[];
  
  // External data sources
  nasaId?: string;           // For HORIZONS queries
  jplUrl?: string;
}

export interface MissionMilestone {
  date: string;              // ISO date
  event: string;
  description: string;
  bodyId?: string;           // If related to a planet/moon
  position?: { x: number; y: number; z: number };
}

// ===== SPACECRAFT CONSTANTS =====

export const SPACECRAFT_CONSTANTS: Record<SpacecraftKey, SpacecraftMissionData> = {
  'voyager1': {
    mass: 825.5,
    radius: 2.0,  // ~4m diameter, but very small for vis
    launchDate: '1977-09-05',
    missionStatus: 'active',
    missionType: 'probe',
    
    // Position as of 2025-01-01 (approximate)
    referenceEpoch: '2025-01-01T00:00:00Z',
    position: { 
      x: 2.4e13,   // ~160 AU from Sun
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 17000,    // Moving away from Sun at ~17 km/s
      y: 0, 
      z: 0 
    },
    
    color: '#00ff88',
    trailColor: '#00ff8844',
    icon: '🛰️',
    
    agency: 'NASA/JPL',
    description: 'Farthest human-made object from Earth, now in interstellar space',
    scientificObjectives: [
      'Study outer planets',
      'Investigate interstellar medium',
      'Carry golden record of Earth'
    ],
    
    milestones: [
      {
        date: '1977-09-05',
        event: 'Launch',
        description: 'Launched from Cape Canaveral aboard Titan IIIE/Centaur'
      },
      {
        date: '1979-03-05',
        event: 'Jupiter Flyby',
        description: 'Closest approach to Jupiter at 349,000 km',
        bodyId: 'jupiter'
      },
      {
        date: '1980-11-12',
        event: 'Saturn Flyby',
        description: 'Closest approach to Saturn at 124,000 km',
        bodyId: 'saturn'
      },
      {
        date: '2012-08-25',
        event: 'Interstellar Space',
        description: 'Crossed heliopause into interstellar medium'
      },
      {
        date: '2025-01-01',
        event: 'Current Status',
        description: 'Still transmitting data from ~160 AU away'
      }
    ],
    
    nasaId: '-31',
    jplUrl: 'https://voyager.jpl.nasa.gov/mission/voyager-1/'
  },

  'voyager2': {
    mass: 825.5,
    radius: 2.0,
    launchDate: '1977-08-20',
    missionStatus: 'active',
    missionType: 'probe',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    position: { 
      x: 2.0e13,   // ~134 AU from Sun
      y: -5e12,
      z: 0 
    },
    velocity: { 
      x: 15400, 
      y: -4000, 
      z: 0 
    },
    
    color: '#00ccff',
    trailColor: '#00ccff44',
    icon: '🛰️',
    
    agency: 'NASA/JPL',
    description: 'Only spacecraft to visit Uranus and Neptune, now in interstellar space',
    scientificObjectives: [
      'Grand Tour of outer planets',
      'Study magnetic fields and atmospheres',
      'Investigate interstellar boundary'
    ],
    
    milestones: [
      {
        date: '1977-08-20',
        event: 'Launch',
        description: 'Launched 16 days before Voyager 1'
      },
      {
        date: '1979-07-09',
        event: 'Jupiter Flyby',
        description: 'Discovered volcanic activity on Io'
      },
      {
        date: '1981-08-25',
        event: 'Saturn Flyby',
        description: 'Studied Saturn\'s rings and moons'
      },
      {
        date: '1986-01-24',
        event: 'Uranus Flyby',
        description: 'First spacecraft to visit Uranus',
        bodyId: 'uranus'
      },
      {
        date: '1989-08-25',
        event: 'Neptune Flyby',
        description: 'First and only spacecraft to visit Neptune',
        bodyId: 'neptune'
      },
      {
        date: '2018-11-05',
        event: 'Interstellar Space',
        description: 'Entered interstellar medium'
      }
    ],
    
    nasaId: '-32',
    jplUrl: 'https://voyager.jpl.nasa.gov/mission/voyager-2/'
  },

  'jwst': {
    mass: 6200,
    radius: 10.5,  // 21m diameter sunshield
    launchDate: '2021-12-25',
    missionStatus: 'active',
    missionType: 'telescope',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    // JWST is at Sun-Earth L2 point: ~1.5M km beyond Earth
    position: { 
      x: 1.495978707e11 + 1.5e9,  // Earth orbit + 1.5M km
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 0, 
      y: 29780,  // Orbits with Earth
      z: 0 
    },
    
    color: '#ff6b35',
    trailColor: '#ff6b3544',
    icon: '🔭',
    
    agency: 'NASA/ESA/CSA',
    description: 'Most powerful space telescope, observing the early universe in infrared',
    scientificObjectives: [
      'Study first galaxies after Big Bang',
      'Investigate exoplanet atmospheres',
      'Observe star and planet formation'
    ],
    
    milestones: [
      {
        date: '2021-12-25',
        event: 'Launch',
        description: 'Launched on Ariane 5 from French Guiana'
      },
      {
        date: '2022-01-24',
        event: 'L2 Arrival',
        description: 'Reached halo orbit around L2 Lagrange point'
      },
      {
        date: '2022-07-12',
        event: 'First Images',
        description: 'Released stunning first deep field images'
      },
      {
        date: '2025-01-01',
        event: 'Science Operations',
        description: 'Continuing revolutionary observations'
      }
    ],
    
    nasaId: 'JWST',
    jplUrl: 'https://webb.nasa.gov/'
  },

  'new-horizons': {
    mass: 478,
    radius: 1.4,
    launchDate: '2006-01-19',
    missionStatus: 'active',
    missionType: 'flyby',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    position: { 
      x: 7.5e12,   // ~50 AU from Sun, beyond Pluto
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 14300, 
      y: 0, 
      z: 0 
    },
    
    color: '#9d4edd',
    trailColor: '#9d4edd44',
    icon: '🚀',
    
    agency: 'NASA/APL',
    description: 'First mission to Pluto, now exploring the Kuiper Belt',
    scientificObjectives: [
      'Explore Pluto system',
      'Study Kuiper Belt objects',
      'Investigate outer solar system'
    ],
    
    milestones: [
      {
        date: '2006-01-19',
        event: 'Launch',
        description: 'Fastest spacecraft ever launched from Earth'
      },
      {
        date: '2015-07-14',
        event: 'Pluto Flyby',
        description: 'Historic close approach revealed complex world'
      },
      {
        date: '2019-01-01',
        event: 'Arrokoth Flyby',
        description: 'Visited most distant object ever explored'
      }
    ],
    
    nasaId: '-98',
    jplUrl: 'https://pluto.jhuapl.edu/'
  },

  'cassini': {
    mass: 5600,
    radius: 3.3,
    launchDate: '1997-10-15',
    missionStatus: 'completed',
    missionType: 'orbiter',
    
    // Final position before Grand Finale (2017-09-15)
    referenceEpoch: '2017-09-15T00:00:00Z',
    position: { 
      x: 1.427e12,  // At Saturn
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 0, 
      y: 9690, 
      z: 0 
    },
    
    color: '#ffd60a',
    trailColor: '#ffd60a44',
    icon: '🛰️',
    
    agency: 'NASA/ESA/ASI',
    description: 'Orbited Saturn for 13 years, revolutionized our understanding of ringed planets',
    scientificObjectives: [
      'Study Saturn\'s atmosphere and magnetosphere',
      'Investigate rings and moons',
      'Explore Titan and Enceladus'
    ],
    
    milestones: [
      {
        date: '1997-10-15',
        event: 'Launch',
        description: 'Launched with Huygens probe'
      },
      {
        date: '2004-07-01',
        event: 'Saturn Orbit Insertion',
        description: 'Entered orbit around Saturn',
        bodyId: 'saturn'
      },
      {
        date: '2005-01-14',
        event: 'Huygens Landing',
        description: 'Huygens probe landed on Titan'
      },
      {
        date: '2017-09-15',
        event: 'Grand Finale',
        description: 'Deliberately crashed into Saturn\'s atmosphere'
      }
    ],
    
    nasaId: '-82',
    jplUrl: 'https://solarsystem.nasa.gov/missions/cassini/'
  },

  'parker-solar': {
    mass: 685,
    radius: 1.5,
    launchDate: '2018-08-12',
    missionStatus: 'active',
    missionType: 'probe',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    // Highly elliptical orbit, position at reference epoch
    position: { 
      x: 1.0e11,  // Variable - between 0.04 AU and 0.73 AU
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 0, 
      y: 95000,  // Up to 200 km/s at perihelion!
      z: 0 
    },
    
    color: '#ff006e',
    trailColor: '#ff006e44',
    icon: '☀️',
    
    agency: 'NASA/APL',
    description: 'Fastest human-made object, diving through the Sun\'s corona',
    scientificObjectives: [
      'Study solar wind acceleration',
      'Investigate coronal heating',
      'Measure magnetic fields in corona'
    ],
    
    milestones: [
      {
        date: '2018-08-12',
        event: 'Launch',
        description: 'Launched toward the Sun'
      },
      {
        date: '2021-04-28',
        event: 'Entered Corona',
        description: 'First spacecraft to enter solar corona'
      },
      {
        date: '2024-12-24',
        event: 'Record Close Approach',
        description: 'Closest ever approach at 6.1 million km'
      }
    ],
    
    nasaId: '-96',
    jplUrl: 'https://parkersolarprobe.jhuapl.edu/'
  },

  'juno': {
    mass: 3625,
    radius: 3.5,
    launchDate: '2011-08-05',
    missionStatus: 'active',
    missionType: 'orbiter',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    position: { 
      x: 7.785e11,  // At Jupiter
      y: 0, 
      z: 0 
    },
    velocity: { 
      x: 0, 
      y: 13070, 
      z: 0 
    },
    
    color: '#06ffa5',
    trailColor: '#06ffa544',
    icon: '🛰️',
    
    agency: 'NASA/JPL',
    description: 'Studying Jupiter\'s composition, gravity, magnetic field, and polar aurora',
    scientificObjectives: [
      'Measure Jupiter\'s water and ammonia',
      'Study magnetic and gravity fields',
      'Investigate polar auroras'
    ],
    
    milestones: [
      {
        date: '2011-08-05',
        event: 'Launch',
        description: 'Launched from Cape Canaveral'
      },
      {
        date: '2016-07-04',
        event: 'Jupiter Orbit Insertion',
        description: 'Entered polar orbit around Jupiter',
        bodyId: 'jupiter'
      },
      {
        date: '2025-01-01',
        event: 'Extended Mission',
        description: 'Continuing detailed observations'
      }
    ],
    
    nasaId: '-61',
    jplUrl: 'https://www.missionjuno.swri.edu/'
  },

  'hubble': {
    mass: 11110,
    radius: 6.5,  // 13m length
    launchDate: '1990-04-24',
    missionStatus: 'active',
    missionType: 'telescope',
    
    referenceEpoch: '2025-01-01T00:00:00Z',
    // Low Earth orbit - approximately at Earth's position
    position: { 
      x: 1.495978707e11,  // Earth's orbit
      y: 540000,          // 540 km altitude above Earth
      z: 0 
    },
    velocity: { 
      x: 0, 
      y: 29780 + 7660,  // Earth orbital + LEO velocity
      z: 0 
    },
    
    color: '#4cc9f0',
    trailColor: '#4cc9f044',
    icon: '🔭',
    
    agency: 'NASA/ESA',
    description: 'Iconic space telescope that transformed our view of the universe',
    scientificObjectives: [
      'Study distant galaxies and nebulae',
      'Measure expansion rate of universe',
      'Observe exoplanets and supernovae'
    ],
    
    milestones: [
      {
        date: '1990-04-24',
        event: 'Launch',
        description: 'Launched aboard Space Shuttle Discovery'
      },
      {
        date: '1993-12-02',
        event: 'First Servicing',
        description: 'Corrected optical flaw'
      },
      {
        date: '1995-12-18',
        event: 'Deep Field',
        description: 'Released iconic Hubble Deep Field image'
      },
      {
        date: '2025-01-01',
        event: 'Still Operating',
        description: '35 years of groundbreaking science'
      }
    ],
    
    nasaId: 'HST',
    jplUrl: 'https://hubblesite.org/'
  }
};

// Default colors for spacecraft types
export const SPACECRAFT_COLORS: Record<string, string> = {
  probe: '#00ff88',
  orbiter: '#ffd60a',
  flyby: '#9d4edd',
  telescope: '#4cc9f0',
  lander: '#ff006e'
};

// Convenience export for iteration
export const SPACECRAFT_KEYS: SpacecraftKey[] = [
  'voyager1', 'voyager2', 'jwst', 'new-horizons', 
  'cassini', 'parker-solar', 'juno', 'hubble'
];