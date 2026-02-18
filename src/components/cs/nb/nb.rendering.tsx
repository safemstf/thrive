// src/components/cs/nb/nb.rendering.tsx
// Enhanced N-Body Sandbox - Fixed Rendering Engine
// Eliminates maximum update depth exceeded errors

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  VisualConfig,
  CameraConfig,
  Vector3Data,
  DEFAULT_VISUAL,
  DEFAULT_CAMERA,
  BODY_SCALE
} from './nb.config';
import { SimulationBody } from './nb.logic';
import { STAR_CATALOG, MESSIER_OBJECTS, NOTABLE_EXOPLANETS, StarEntry, MessierEntry, ExoplanetEntry } from './nb.starCatalog';

// ===== RENDERING INTERFACES =====

export interface RenderingState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: any | null;
  isInitialized: boolean;
  lastRenderTime: number;
  frameCount: number;
  renderFPS: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

// Enhanced Trail System Class
class DynamicTrailSystem {
  private positions: THREE.Vector3[] = [];
  private maxPoints: number;
  private geometry: THREE.BufferGeometry;
  private line: THREE.Line;
  private material: THREE.ShaderMaterial;
  private color: THREE.Color;
  private fadeType: 'linear' | 'exponential' | 'quadratic';
  private initialized: boolean = false;
  private lastPosition: THREE.Vector3 | null = null;
  private minDistance: number = 0.5; // Minimum distance between points

  constructor(
    maxPoints: number = 300,
    color: string = '#ffffff',
    fadeType: 'exponential' | 'linear' | 'quadratic' = 'exponential'
  ) {
    this.maxPoints = maxPoints;
    this.color = new THREE.Color(color);
    this.fadeType = fadeType;

    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(maxPoints * 3);
    const colors = new Float32Array(maxPoints * 3);
    const alphas = new Float32Array(maxPoints);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    this.geometry.setDrawRange(0, 0);

    // Custom shader for per-vertex alpha
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: 0.8 }
      },
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          vAlpha = alpha;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, vAlpha * opacity);
          if (gl_FragColor.a < 0.01) discard;
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 2
    });

    this.line = new THREE.Line(this.geometry, this.material);
  }

  addPoint(position: THREE.Vector3): void {
    // Skip if too close to last point
    if (this.lastPosition && this.lastPosition.distanceTo(position) < this.minDistance) {
      return;
    }

    // For the very first point, initialize the trail at this position
    if (!this.initialized && this.positions.length === 0) {
      // Pre-fill with current position to avoid line from origin
      for (let i = 0; i < Math.min(10, this.maxPoints); i++) {
        this.positions.push(position.clone());
      }
      this.initialized = true;
    } else {
      this.positions.push(position.clone());
    }

    // Limit array size
    if (this.positions.length > this.maxPoints) {
      this.positions.shift();
    }

    this.lastPosition = position.clone();
    this.updateGeometry();
  }

  private updateGeometry(): void {
    const positionAttribute = this.geometry.attributes.position as THREE.BufferAttribute;
    const colorAttribute = this.geometry.attributes.color as THREE.BufferAttribute;
    const alphaAttribute = this.geometry.attributes.alpha as THREE.BufferAttribute;

    const pointCount = this.positions.length;

    for (let i = 0; i < pointCount; i++) {
      const pos = this.positions[i];
      positionAttribute.setXYZ(i, pos.x, pos.y, pos.z);

      let fade: number;
      const normalizedPosition = i / Math.max(1, pointCount - 1);

      switch (this.fadeType) {
        case 'exponential':
          fade = Math.pow(normalizedPosition, 2.5);
          break;
        case 'quadratic':
          fade = normalizedPosition * normalizedPosition;
          break;
        case 'linear':
        default:
          fade = normalizedPosition;
      }

      fade = 0.05 + fade * 0.95; // Keep minimum 5% opacity

      const colorVariation = 0.7 + fade * 0.3;
      colorAttribute.setXYZ(
        i,
        this.color.r * colorVariation,
        this.color.g * colorVariation,
        this.color.b * colorVariation
      );

      alphaAttribute.setX(i, fade);
    }

    this.geometry.setDrawRange(0, pointCount);

    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;

    this.geometry.computeBoundingSphere();
  }

  updateColor(color: string): void {
    this.color = new THREE.Color(color);
    this.updateGeometry();
  }

  clear(): void {
    this.positions = [];
    this.lastPosition = null;
    this.initialized = false;
    this.geometry.setDrawRange(0, 0);
  }

  getMesh(): THREE.Line {
    return this.line;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// Spacetime Grid Visualization
class SpacetimeGrid {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time: number = 0;

  constructor(size: number = 2000, divisions: number = 50) {
    const geometry = new THREE.PlaneGeometry(size, size, divisions, divisions);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        warpStrength: { value: 0.05 },
        gridColor: { value: new THREE.Color(0x0066ff) },
        opacity: { value: 0.12 },
        masses: { value: [] },
        massCount: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        uniform float warpStrength;
        uniform vec3 masses[10];
        uniform int massCount;
        
        varying vec2 vUv;
        varying float vDistortion;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          float totalWarp = 0.0;
          for (int i = 0; i < 10; i++) {
            if (i >= massCount) break;
            vec3 mass = masses[i];
            float dist = distance(pos.xy, mass.xy);
            float warp = (mass.z * warpStrength) / (dist * dist + 1.0);
            totalWarp += warp;
            
            float ripple = sin(dist * 0.05 - time * 2.0) * 0.05;
            totalWarp += ripple * warp * 0.1;
          }
          
          pos.z = -totalWarp * 20.0;
          vDistortion = totalWarp;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 gridColor;
        uniform float opacity;
        varying vec2 vUv;
        varying float vDistortion;
        
        void main() {
          float gridX = abs(fract(vUv.x * 50.0) - 0.5);
          float gridY = abs(fract(vUv.y * 50.0) - 0.5);
          float grid = smoothstep(0.47, 0.48, max(gridX, gridY));
          
          vec3 color = mix(gridColor, vec3(0.5, 0.2, 1.0), vDistortion * 3.0);
          
          gl_FragColor = vec4(color, grid * opacity * (1.0 + vDistortion * 2.0));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -100;
  }

  updateMasses(bodies: Array<{ position: THREE.Vector3; mass: number }>): void {
    const masses = [];
    const maxBodies = Math.min(bodies.length, 10);

    for (let i = 0; i < maxBodies; i++) {
      const body = bodies[i];
      masses.push(new THREE.Vector3(
        body.position.x,
        body.position.z,
        Math.min(5, body.mass / 1e30) // Normalize and cap
      ));
    }

    this.material.uniforms.masses.value = masses;
    this.material.uniforms.massCount.value = maxBodies;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }

  setOpacity(opacity: number): void {
    this.material.uniforms.opacity.value = opacity;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

export interface RenderableBody {
  id: string;
  body: SimulationBody;
  mesh: THREE.Mesh | null;
  displayRadius: number;
  trail: DynamicTrailSystem | null;
  labelSprite: THREE.Sprite | null;
  velocityArrow: THREE.ArrowHelper | null;
  selectionRing: THREE.Mesh | null;
  glowMesh: THREE.Mesh | null;
  coronaMesh: THREE.Mesh | null;  // majestic corona for stars
  atmosphere: THREE.Mesh | null;
  rings: THREE.Mesh | null;
  lastUpdateTime: number;
  interpolatedPosition: THREE.Vector3;
  interpolatedVelocity: THREE.Vector3;
  lodLevel: number;
  isInFrustum: boolean;
  pointLight?: THREE.PointLight;
}

export interface UseNBodyRenderingProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  bodies: SimulationBody[];
  selectedBodies: SimulationBody[];
  visualConfig?: Partial<VisualConfig>;
  cameraConfig?: Partial<CameraConfig>;
  onCameraUpdate?: (position: Vector3Data, target: Vector3Data) => void;
  onBodyClick?: (bodyId: string, event: MouseEvent) => void;
  onBackgroundClick?: (event: MouseEvent) => void;
}

// normalize trail fade types to the types expected by DynamicTrailSystem
type TrailFade = 'linear' | 'exponential' | 'quadratic';

function normalizeTrailFadeType(t?: string | null): TrailFade {
  switch (t) {
    case 'linear': return 'linear';
    case 'exponential': return 'exponential';
    case 'quadratic': return 'quadratic';
    case 'inverse':   // legacy / alternate name -> map to closest supported
      return 'quadratic';
    // add mappings for other legacy names here if you have them
    default:
      return 'exponential'; // safe default
  }
}

// ===== IMPROVED CONSTANTS =====
const AU = 1.496e11; // meters
const SCALE_FACTOR = 1e-9; // Better precision: 1 billion meters = 1 scene unit

// ===== IMPROVED SHADERS =====

const REALISTIC_STAR_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vViewPosition;
  uniform float time;
  uniform float pulseIntensity;
  
  // Simplex noise for surface detail
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    
    // Add surface turbulence for photosphere effect
    vec3 noisePos = position * 2.0 + vec3(time * 0.02);
    float turbulence = snoise(noisePos) * 0.02;
    turbulence += snoise(noisePos * 2.0) * 0.01;
    turbulence += snoise(noisePos * 4.0) * 0.005;
    
    // Subtle pulsing
    float pulse = 1.0 + sin(time * 1.5) * pulseIntensity * 0.01;
    
    vec3 newPosition = position * pulse + normal * turbulence;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const REALISTIC_STAR_FRAGMENT_SHADER = `
  uniform vec3 color;
  uniform float time;
  uniform float temperature;
  uniform vec3 viewVector;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vViewPosition;
  
  // Improved noise function for granulation
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Voronoi for solar granulation
  vec2 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 mg, mr;
    float md = 8.0;
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = noise(n + g) * vec2(1.0);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if(d < md) {
          md = d;
          mr = r;
          mg = g;
        }
      }
    }
    return mr;
  }
  
  void main() {
    // Base color with temperature variation
    vec3 baseColor = color;
    
    // Solar granulation pattern
    vec2 granuleUV = vUv * 30.0 + vec2(time * 0.01);
    vec2 vor = voronoi(granuleUV);
    float granulation = 1.0 - smoothstep(0.0, 0.05, length(vor));
    granulation = mix(0.7, 1.0, granulation);
    
    // Sunspot simulation
    float spotNoise = noise(vUv * 5.0 + time * 0.001);
    float spots = smoothstep(0.7, 0.71, spotNoise) * 0.3;
    granulation *= (1.0 - spots);
    
    // Limb darkening for realism
    vec3 viewDir = normalize(-vViewPosition);
    float limbDarkening = dot(vNormal, viewDir);
    limbDarkening = pow(max(limbDarkening, 0.0), 0.4);
    
    // Temperature-based color variation
    vec3 hotColor = vec3(1.0, 0.95, 0.8);
    vec3 coolColor = baseColor * vec3(1.0, 0.9, 0.7);
    vec3 finalColor = mix(coolColor, hotColor, temperature * granulation);
    
    // Apply limb darkening
    finalColor *= (0.6 + 0.4 * limbDarkening);
    
    // Add bright faculae near the limb
    float faculae = pow(1.0 - limbDarkening, 3.0) * 0.2;
    finalColor += vec3(1.0, 0.95, 0.9) * faculae * granulation;
    
    // Subtle chromosphere emission at the edge
    float edge = pow(1.0 - limbDarkening, 8.0);
    finalColor += baseColor * edge * 0.5;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const IMPROVED_ATMOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 color;
  uniform float opacity;
  uniform vec3 lightPosition;
  uniform vec3 lightColor;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    vec3 lightDir = normalize(lightPosition - vPosition);
    
    // Rayleigh scattering approximation
    float viewDot = dot(vNormal, viewDirection);
    float rim = 1.0 - abs(viewDot);
    rim = pow(rim, 1.5);
    
    // Mie scattering for sun-facing side
    float sunDot = max(0.0, dot(vNormal, lightDir));
    float scatter = pow(sunDot, 0.5) * 0.5 + pow(sunDot, 8.0) * 0.5;
    
    // Combine atmospheric effects
    vec3 atmosphereColor = color;
    vec3 scatteredLight = mix(atmosphereColor, lightColor, scatter * 0.3);
    vec3 finalColor = scatteredLight * (rim * 2.0 + scatter * intensity);
    
    float alpha = rim * opacity * (0.5 + scatter * 0.5);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ===== MAJESTIC STAR CORONA SYSTEM =====
// Creates a permanent, beautiful corona + ray halo around any star body

function createStarCoronaMesh(displayRadius: number, starColor: THREE.Color): THREE.Mesh {
  // Large billboard plane that always faces the camera (updated each frame)
  // Size: 8× the star's display radius so corona extends well beyond the disc
  const coronaSize = displayRadius * 8.0;
  const geometry = new THREE.PlaneGeometry(coronaSize, coronaSize);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time:       { value: 0 },
      starColor:  { value: starColor.clone() },
      coreRadius: { value: 0.12 }, // fraction of plane size that is solid star core
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3  starColor;
      uniform float coreRadius;
      varying vec2 vUv;

      // Fast hash for noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                   mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      void main() {
        vec2 uv  = vUv - 0.5;           // -0.5 … 0.5, center = 0
        float r  = length(uv);
        float angle = atan(uv.y, uv.x); // -PI … PI

        // --- Solid star disc ---
        float disc = 1.0 - smoothstep(coreRadius - 0.005, coreRadius + 0.005, r);

        // --- Soft inner corona glow ---
        float innerGlow = exp(-r * r * 22.0) * 1.8;

        // --- Outer halo ---
        float halo = exp(-r * r * 3.5) * 0.55;

        // --- Volumetric rays (rotating over time) ---
        // We sum several rotated "spokes" using angular noise
        float rays = 0.0;
        float rayFade = exp(-r * r * 8.0) * (1.0 - smoothstep(0.0, coreRadius * 1.5, r));
        for (int i = 0; i < 8; i++) {
          float spoke = float(i) * 3.14159 / 4.0 + time * 0.04;
          float diff  = mod(abs(angle - spoke), 3.14159 * 2.0);
          if (diff > 3.14159) diff = 3.14159 * 2.0 - diff;
          float ray   = pow(max(0.0, 1.0 - diff * 5.0), 3.0);
          // Modulate each ray length with noise for organic feel
          float len   = 0.6 + 0.4 * noise(vec2(float(i) * 2.3, time * 0.05));
          rays += ray * len * rayFade * 1.2;
        }

        // --- Solar wind wisps (fast rotating faint bands) ---
        float wisps = 0.0;
        for (int j = 0; j < 4; j++) {
          float wAngle = float(j) * 3.14159 / 2.0 + time * 0.12 + float(j) * 0.8;
          float wDiff  = mod(abs(angle - wAngle), 3.14159 * 2.0);
          if (wDiff > 3.14159) wDiff = 3.14159 * 2.0 - wDiff;
          wisps += pow(max(0.0, 1.0 - wDiff * 3.0), 2.0) * exp(-r * r * 2.0) * 0.25;
        }

        // --- Combine ---
        float coronaIntensity = innerGlow + halo + rays + wisps;

        // Color: hot white core → star color → deep orange edge
        vec3 coreWhite = vec3(1.0, 0.98, 0.92);
        vec3 midColor  = starColor;
        vec3 edgeColor = starColor * vec3(1.0, 0.6, 0.3);

        float tMid = smoothstep(coreRadius, coreRadius * 3.0, r);
        float tEdge= smoothstep(coreRadius * 3.0, 0.5, r);
        vec3 coronaColor = mix(coreWhite, mix(midColor, edgeColor, tEdge), tMid);

        // Final color: disc is fully bright, corona fades out
        vec3 finalColor = mix(coronaColor * coronaIntensity, coreWhite, disc);
        float alpha     = clamp(disc + coronaIntensity * 0.85, 0.0, 1.0);

        // Kill fully transparent fragments
        if (alpha < 0.005) discard;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 2; // draw on top of star sphere and other objects
  return mesh;
}

// ===== UTILITY FUNCTIONS =====

const scalePosition = (position: Vector3Data): THREE.Vector3 => {
  return new THREE.Vector3(
    position.x * SCALE_FACTOR,
    position.y * SCALE_FACTOR,
    position.z * SCALE_FACTOR
  );
};

const getBodyScale = (body: SimulationBody): number => {
  const config = BODY_SCALE[body.type] || BODY_SCALE.asteroid;
  let scale = body.radius * config.multiplier;

  // Special handling for stars to make them more prominent
  if (body.type === 'star') {
    scale = Math.max(config.min * 1.5, Math.min(config.max * 1.5, scale * 1.2));
  }

  return Math.max(config.min, Math.min(config.max, scale));
};

// ===== PER-PLANET PROCEDURAL SHADERS =====

function makePlanetShader(uniforms: Record<string, THREE.IUniform>, frag: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vNormal   = normalize(normalMatrix * normal);
        vUv       = uv;
        // Always pass a unit-sphere direction so fragment shaders work
        // regardless of the actual display radius of the sphere geometry.
        vPosition = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: frag,
    side: THREE.FrontSide,
  });
}

// GLSL noise helpers (inlined so each shader is self-contained)
const NOISE_GLSL = `
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p){
    float v=0.0,a=0.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
    return v;
  }
  float hash3(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float noise3(vec3 p){
    vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);
    float n=i.x+i.y*157.0+113.0*i.z;
    return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),
                   mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),
                   mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm3(vec3 p){
    float v=0.0,a=0.5;
    for(int i=0;i<4;i++){ v+=a*noise3(p); p*=2.1; a*=0.5; }
    return v;
  }
`;

// ── EARTH ──────────────────────────────────────────────────────────────────
function createEarthMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.5, 1).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.08;

      // Spherical coords for continent placement
      float lat = asin(clamp(vPosition.y, -1.0, 1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon / 6.28318 + 0.5, lat / 3.14159 + 0.5);

      // Land vs ocean via layered noise
      float land = fbm(sph * 6.0 + vec2(2.3, 1.7));
      land += 0.4 * fbm(sph * 14.0 + vec2(0.9, 3.1));
      float isLand = smoothstep(0.52, 0.58, land);

      // Ice caps
      float pole = abs(vPosition.y);
      float ice = smoothstep(0.75, 0.88, pole);

      // Ocean color with depth variation
      float depth = fbm(sph * 10.0 + vec2(5.0, 2.0));
      vec3 shallowOcean = vec3(0.05, 0.38, 0.72);
      vec3 deepOcean    = vec3(0.02, 0.14, 0.42);
      vec3 ocean = mix(deepOcean, shallowOcean, depth * 0.7);

      // Land colors: green forests, brown desert, mountain grey
      float elevation = fbm(sph * 8.0 + vec2(1.1, 4.2));
      vec3 forest  = vec3(0.07, 0.32, 0.08);
      vec3 desert  = vec3(0.62, 0.46, 0.22);
      vec3 rock    = vec3(0.38, 0.34, 0.30);
      vec3 grass   = vec3(0.18, 0.52, 0.12);
      vec3 landCol = mix(mix(forest, grass, smoothstep(0.3, 0.6, elevation)),
                        mix(desert, rock, smoothstep(0.6, 0.9, elevation)),
                        smoothstep(0.55, 0.75, elevation));

      vec3 surface = mix(ocean, landCol, isLand);
      surface = mix(surface, vec3(0.92, 0.96, 1.0), ice);

      // Thin cloud layer
      float cloud = fbm(sph * 5.0 + vec2(time * 0.003, 0.0));
      cloud += 0.5 * fbm(sph * 12.0 + vec2(0.0, time * 0.002));
      float cloudMask = smoothstep(0.52, 0.68, cloud) * (1.0 - ice * 0.5);
      surface = mix(surface, vec3(0.95, 0.97, 1.0), cloudMask * 0.75);

      // Atmosphere rim glow
      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 4.0);
      vec3 atmColor = vec3(0.28, 0.58, 1.0);

      vec3 finalColor = surface * (diffuse + ambient);
      finalColor += atmColor * rim * 0.35;

      // Ocean specular
      float spec = pow(max(0.0, dot(reflect(-lightDir, n), vec3(0,0,1))), 30.0);
      finalColor += vec3(0.6, 0.75, 1.0) * spec * (1.0 - isLand) * 0.6;

      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── MARS ───────────────────────────────────────────────────────────────────
function createMarsMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.4, 0.8).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.10;

      float lat = asin(clamp(vPosition.y, -1.0, 1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon / 6.28318 + 0.5, lat / 3.14159 + 0.5);

      float terrain = fbm(sph * 7.0 + vec2(1.5, 2.3));
      terrain += 0.3 * fbm(sph * 18.0);

      vec3 rust    = vec3(0.76, 0.24, 0.10);
      vec3 dark    = vec3(0.38, 0.12, 0.06);
      vec3 basalt  = vec3(0.28, 0.18, 0.14);
      vec3 bright  = vec3(0.88, 0.42, 0.22);

      vec3 surface = mix(dark, rust, smoothstep(0.3, 0.6, terrain));
      surface = mix(surface, bright, smoothstep(0.65, 0.85, terrain));
      surface = mix(surface, basalt, fbm(sph * 25.0) * 0.4);

      // Polar ice caps
      float pole = abs(vPosition.y);
      float cap = smoothstep(0.82, 0.92, pole);
      surface = mix(surface, vec3(0.90, 0.92, 0.95), cap);

      // Valles Marineris hint — long canyon near equator
      float canyon = smoothstep(0.02, 0.0, abs(lat - 0.25)) * smoothstep(1.5, 0.8, abs(lon));
      surface = mix(surface, dark * 0.6, canyon * 0.5);

      // Thin reddish dust atmosphere
      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 3.5);
      vec3 dustAtm = vec3(0.85, 0.45, 0.20);

      vec3 finalColor = surface * (diffuse + ambient);
      finalColor += dustAtm * rim * 0.25;

      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── VENUS ──────────────────────────────────────────────────────────────────
function createVenusMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.18; // thick clouds scatter a lot

      float lat = asin(clamp(vPosition.y, -1.0, 1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon / 6.28318 + 0.5, lat / 3.14159 + 0.5);

      // Swirling thick clouds
      float c1 = fbm(sph * 4.0 + vec2(time * 0.001, 0.0));
      float c2 = fbm(sph * 9.0 + vec2(0.0, time * 0.0007));
      float c3 = fbm(sph * 16.0 + vec2(time * 0.0015, time * 0.001));
      float clouds = c1 * 0.5 + c2 * 0.3 + c3 * 0.2;

      vec3 cream   = vec3(0.95, 0.88, 0.65);
      vec3 yellow  = vec3(0.88, 0.72, 0.32);
      vec3 orange  = vec3(0.78, 0.52, 0.18);
      vec3 bright  = vec3(1.0,  0.96, 0.80);

      vec3 surface = mix(yellow, cream, smoothstep(0.35, 0.65, clouds));
      surface = mix(surface, orange, smoothstep(0.15, 0.35, clouds) * 0.5);
      surface = mix(surface, bright, smoothstep(0.75, 0.95, clouds) * 0.4);

      // Thick atmosphere rim (very bright — Venus is reflective)
      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 2.5);
      vec3 atmColor = vec3(0.98, 0.88, 0.55);

      vec3 finalColor = surface * (diffuse + ambient);
      finalColor += atmColor * rim * 0.60;

      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── JUPITER ────────────────────────────────────────────────────────────────
function createJupiterMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.07;

      // Latitude-based band coordinate
      float lat = vPosition.y;  // -1 to 1 on unit sphere
      float lon = atan(vPosition.z, vPosition.x);

      // Turbulent band distortion
      float distort = 0.12 * sin(lat * 18.0 + time * 0.008)
                    + 0.06 * sin(lat * 35.0 - time * 0.012)
                    + 0.03 * noise(vec2(lon * 3.0, lat * 8.0 + time * 0.005));
      float band = lat + distort;

      // Band palette
      vec3 cream  = vec3(0.90, 0.82, 0.65);
      vec3 amber  = vec3(0.78, 0.52, 0.22);
      vec3 brown  = vec3(0.52, 0.30, 0.12);
      vec3 tan    = vec3(0.86, 0.74, 0.52);
      vec3 white_ = vec3(0.96, 0.92, 0.84);

      // Repeating bands via sine
      float bSin = sin(band * 22.0);
      float bSin2= sin(band * 44.0 + 0.5);
      vec3 bandCol = mix(cream, amber, smoothstep(-0.2, 0.2, bSin));
      bandCol = mix(bandCol, brown, smoothstep(0.4, 0.7, bSin));
      bandCol = mix(bandCol, white_, smoothstep(-0.6, -0.3, bSin2) * 0.4);
      bandCol = mix(bandCol, tan,   smoothstep(0.3, 0.6, bSin2) * 0.3);

      // Wispy detail within bands
      float detail = fbm(vec2(lon * 8.0 + time * 0.003, lat * 15.0));
      bandCol = mix(bandCol, bandCol * 1.25, detail * 0.2);

      // Great Red Spot — large oval near lat ≈ -0.38, lon ≈ 0
      float spotLon = lon - 0.5;
      float spotLat = lat + 0.38;
      float spotDist = sqrt((spotLon / 0.28) * (spotLon / 0.28) + (spotLat / 0.12) * (spotLat / 0.12));
      float spot = smoothstep(1.0, 0.3, spotDist);
      vec3 spotColor = vec3(0.68, 0.18, 0.06);
      // Inner eye of storm
      float spotEye = smoothstep(0.2, 0.0, spotDist);
      bandCol = mix(bandCol, spotColor, spot * 0.85);
      bandCol = mix(bandCol, vec3(0.78, 0.32, 0.10), spotEye * 0.9);

      // Polar darkening
      float poleDark = smoothstep(0.5, 0.9, abs(lat));
      bandCol *= (1.0 - poleDark * 0.3);

      vec3 finalColor = bandCol * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── SATURN ─────────────────────────────────────────────────────────────────
function createSaturnMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.08;

      float lat = vPosition.y;
      float lon = atan(vPosition.z, vPosition.x);

      float distort = 0.08 * sin(lat * 16.0 + time * 0.006)
                    + 0.04 * sin(lat * 30.0 - time * 0.009);
      float band = lat + distort;

      vec3 straw  = vec3(0.92, 0.86, 0.62);
      vec3 honey  = vec3(0.82, 0.66, 0.32);
      vec3 cream  = vec3(0.97, 0.93, 0.78);
      vec3 tan2   = vec3(0.72, 0.58, 0.30);

      float bSin = sin(band * 18.0);
      float bSin2= sin(band * 36.0 + 0.3);
      vec3 bandCol = mix(cream, straw,  smoothstep(-0.3, 0.1, bSin));
      bandCol = mix(bandCol, honey, smoothstep(0.3, 0.7, bSin));
      bandCol = mix(bandCol, tan2,  smoothstep(-0.5, -0.1, bSin2) * 0.35);

      float detail = fbm(vec2(lon * 6.0 + time * 0.002, lat * 12.0));
      bandCol = mix(bandCol, bandCol * 1.15, detail * 0.18);

      // Subtle hexagonal storm hint at north pole
      float poleDark = smoothstep(0.55, 0.95, abs(lat));
      bandCol *= (1.0 - poleDark * 0.2);

      vec3 finalColor = bandCol * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// Saturn ring disc material
function createSaturnRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      lightDir: { value: new THREE.Vector3(1, 0.4, 0.6).normalize() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${NOISE_GLSL}
      uniform vec3 lightDir;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        // vUv.x = 0 at inner edge, 1 at outer edge (ring radial position)
        float r = vUv.x;

        // Cassini division — dark gap at ~r = 0.48
        float cassini = smoothstep(0.44, 0.47, r) * (1.0 - smoothstep(0.47, 0.50, r));

        // B-ring (inner, bright/opaque), A-ring (outer, slightly less opaque)
        float bRing = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.45, 0.47, r));
        float aRing = smoothstep(0.50, 0.54, r) * (1.0 - smoothstep(0.88, 0.98, r));
        float cRing = smoothstep(0.0, 0.05, r) * smoothstep(0.08, 0.0, r); // inner C ring (faint)

        float ringMask = bRing * 0.9 + aRing * 0.75 + cRing * 0.2;
        ringMask *= (1.0 - cassini);

        // Ring color: icy beige/gold
        vec3 innerColor = vec3(0.88, 0.80, 0.60);
        vec3 outerColor = vec3(0.78, 0.72, 0.55);
        vec3 ringColor  = mix(innerColor, outerColor, r);

        // Density variation (streaks / spiral)
        float streak = 0.5 + 0.5 * noise(vec2(r * 80.0, 0.3));
        ringColor *= (0.85 + 0.15 * streak);

        // Lighting — rings are mostly forward-scattering
        float lit = 0.65 + 0.35 * abs(dot(normalize(vNormal), lightDir));

        float alpha = ringMask * 0.92;
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(ringColor * lit, alpha);
      }
    `,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// ── URANUS ─────────────────────────────────────────────────────────────────
function createUranusMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.09;

      float lat = vPosition.y;
      float lon = atan(vPosition.z, vPosition.x);

      // Subtle banding
      float band = lat + 0.05 * sin(lat * 20.0 + time * 0.004);
      float bSin = sin(band * 12.0);

      vec3 teal    = vec3(0.25, 0.80, 0.82);
      vec3 mint    = vec3(0.35, 0.90, 0.88);
      vec3 cyan    = vec3(0.18, 0.72, 0.76);
      vec3 white_  = vec3(0.75, 0.96, 0.98);

      vec3 col = mix(teal, mint, smoothstep(-0.2, 0.4, bSin));
      col = mix(col, cyan,   smoothstep(0.5, 0.9, bSin) * 0.4);
      col = mix(col, white_, smoothstep(0.6, 0.9, abs(lat)) * 0.3);

      float haze = fbm(vec2(lon * 3.0 + time * 0.002, lat * 6.0));
      col = mix(col, white_, haze * 0.08);

      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 3.0);
      vec3 atmCol = vec3(0.35, 0.88, 0.90);

      vec3 finalColor = col * (diffuse + ambient);
      finalColor += atmCol * rim * 0.28;
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── NEPTUNE ────────────────────────────────────────────────────────────────
function createNeptuneMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.2, 0.6).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.10;

      float lat = vPosition.y;
      float lon = atan(vPosition.z, vPosition.x);

      float distort = 0.10 * sin(lat * 15.0 + time * 0.012);
      float band = lat + distort;
      float bSin = sin(band * 14.0);

      vec3 deep    = vec3(0.06, 0.12, 0.72);
      vec3 royal   = vec3(0.12, 0.28, 0.90);
      vec3 bright  = vec3(0.25, 0.52, 1.00);
      vec3 white_  = vec3(0.70, 0.80, 1.00);

      vec3 col = mix(deep, royal,  smoothstep(-0.3, 0.2, bSin));
      col = mix(col,  bright, smoothstep(0.4, 0.8, bSin) * 0.5);

      // Great Dark Spot
      float spotLon = lon - 1.0;
      float spotLat = lat - 0.25;
      float spotD = sqrt((spotLon/0.20)*(spotLon/0.20) + (spotLat/0.08)*(spotLat/0.08));
      float darkSpot = smoothstep(1.0, 0.3, spotD) * 0.5;
      col = mix(col, deep * 0.6, darkSpot);

      // Scooter (fast white cloud)
      float scooterLon = lon - (time * 0.015);
      float scooterLat = lat + 0.10;
      float scooterD = sqrt((scooterLon/0.06)*(scooterLon/0.06) + (scooterLat/0.04)*(scooterLat/0.04));
      float scooter = smoothstep(1.0, 0.0, scooterD);
      col = mix(col, white_, scooter * 0.7);

      float haze = fbm(vec2(lon * 5.0 + time * 0.008, lat * 9.0));
      col = mix(col, white_, haze * 0.06);

      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 3.2);
      vec3 atmCol = vec3(0.18, 0.35, 1.0);

      vec3 finalColor = col * (diffuse + ambient);
      finalColor += atmCol * rim * 0.35;
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── MERCURY ────────────────────────────────────────────────────────────────
function createMercuryMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.05;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float terrain = fbm(sph * 9.0);
      float craters = fbm(sph * 22.0);

      vec3 grey    = vec3(0.42, 0.38, 0.33);
      vec3 dark    = vec3(0.22, 0.20, 0.18);
      vec3 bright  = vec3(0.62, 0.58, 0.52);

      vec3 col = mix(dark, grey, smoothstep(0.3, 0.6, terrain));
      col = mix(col, bright, smoothstep(0.7, 0.9, terrain) * 0.5);
      // Crater rays (lighter ejecta)
      float ejecta = smoothstep(0.62, 0.78, craters);
      col = mix(col, bright * 0.85, ejecta * 0.4);

      vec3 finalColor = col * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── MOON (Luna) ─────────────────────────────────────────────────────────────
function createMoonMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.04;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float mare  = fbm(sph * 4.0);
      float highland = fbm(sph * 11.0);
      float craters  = fbm(sph * 28.0);

      vec3 darkGrey  = vec3(0.20, 0.19, 0.18); // Mare basalt
      vec3 lightGrey = vec3(0.66, 0.64, 0.60); // Highland
      vec3 bright    = vec3(0.80, 0.78, 0.74); // Ejecta

      float isMare = smoothstep(0.48, 0.54, mare);
      vec3 col = mix(lightGrey, darkGrey, isMare);
      col = mix(col, mix(col, bright, 0.5), smoothstep(0.65, 0.85, craters) * 0.45);
      col = mix(col, bright * 0.9, smoothstep(0.72, 0.88, highland) * (1.0-isMare) * 0.3);

      vec3 finalColor = col * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── IO (volcanic moon) ──────────────────────────────────────────────────────
function createIoMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.08;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float sulfur = fbm(sph * 6.0);
      float lava   = fbm(sph * 14.0 + vec2(time*0.001,0));
      float dark   = fbm(sph * 22.0);

      vec3 yellow  = vec3(0.88, 0.82, 0.10);
      vec3 orange  = vec3(0.85, 0.45, 0.05);
      vec3 red_    = vec3(0.72, 0.15, 0.05);
      vec3 white_  = vec3(0.92, 0.90, 0.82);
      vec3 black_  = vec3(0.08, 0.06, 0.04);

      vec3 col = mix(yellow, orange, smoothstep(0.38, 0.58, sulfur));
      col = mix(col, red_,   smoothstep(0.6, 0.8, lava));
      col = mix(col, white_, smoothstep(0.7, 0.9, sulfur) * 0.4);
      col = mix(col, black_, smoothstep(0.65, 0.82, dark) * 0.5);

      // Active volcano glows
      float volcano = smoothstep(0.75, 1.0, fbm(sph * 30.0 + vec2(time*0.003, 0.0)));
      col = mix(col, vec3(1.0, 0.4, 0.0), volcano * 0.6);

      vec3 finalColor = col * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── EUROPA (ice moon) ───────────────────────────────────────────────────────
function createEuropaMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.12;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float ice   = fbm(sph * 5.0);
      float crack = fbm(sph * 18.0);

      vec3 white_ = vec3(0.90, 0.92, 0.96);
      vec3 iceBlue= vec3(0.72, 0.82, 0.92);
      vec3 rust   = vec3(0.72, 0.42, 0.22); // rusty crack minerals

      vec3 col = mix(white_, iceBlue, smoothstep(0.35, 0.65, ice));
      // Linear cracks
      float crackMask = smoothstep(0.60, 0.72, crack) * (1.0 - smoothstep(0.72, 0.80, crack));
      col = mix(col, rust, crackMask * 0.55);

      // Specular ice glint
      float spec = pow(max(0.0, dot(reflect(-lightDir,n), normalize(vec3(0,0,1)))), 60.0);
      col += vec3(0.8,0.9,1.0) * spec * 0.4;

      vec3 finalColor = col * (diffuse + ambient);
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── TITAN (orange haze moon) ────────────────────────────────────────────────
function createTitanMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.14;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      // Thick haze — mostly uniform orange
      float haze1 = fbm(sph * 3.0 + vec2(time*0.0008, 0.0));
      float haze2 = fbm(sph * 8.0 + vec2(0.0, time*0.0006));

      vec3 deepOrange = vec3(0.72, 0.32, 0.05);
      vec3 orange_    = vec3(0.88, 0.52, 0.12);
      vec3 tan_       = vec3(0.82, 0.68, 0.38);
      vec3 darkBrown  = vec3(0.42, 0.18, 0.05);

      vec3 col = mix(orange_, tan_,      smoothstep(0.35, 0.65, haze1));
      col = mix(col, deepOrange, smoothstep(0.2, 0.4, haze2) * 0.5);
      col = mix(col, darkBrown,  smoothstep(0.7, 0.9, haze2) * 0.35);

      // Thick rim glow (Titan's haze is very visible from space)
      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 2.8);
      vec3 hazeRim = vec3(0.95, 0.65, 0.20);

      vec3 finalColor = col * (diffuse + ambient);
      finalColor += hazeRim * rim * 0.50;
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── ENCELADUS (icy, geyser moon) ────────────────────────────────────────────
function createEnceladusMaterial(): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.15;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float terrain = fbm(sph * 8.0);
      float cracks  = fbm(sph * 20.0);

      vec3 snow   = vec3(0.96, 0.97, 1.00);
      vec3 blue_  = vec3(0.70, 0.80, 0.95);
      vec3 grey_  = vec3(0.60, 0.62, 0.65);

      vec3 col = mix(snow, blue_,  smoothstep(0.4, 0.65, terrain) * 0.4);
      float crackMask = smoothstep(0.58, 0.70, cracks) * (1.0-smoothstep(0.70,0.78,cracks));
      col = mix(col, grey_, crackMask * 0.45);

      // Geyser hints at south pole
      float southPole = smoothstep(0.0, -0.80, vPosition.y);
      float geyserN = fbm(sph * 35.0 + vec2(time*0.004, 0.0));
      col = mix(col, vec3(0.85, 0.92, 1.0), southPole * geyserN * 0.3);

      // Strong specular — very icy
      float spec = pow(max(0.0, dot(reflect(-lightDir,n), normalize(vec3(0,0,1)))), 80.0);
      col += vec3(0.9,0.95,1.0) * spec * 0.55;

      float rim = pow(1.0 - max(0.0, dot(n, normalize(vec3(0,0,1)))), 3.5);
      vec3 finalColor = col * (diffuse + ambient);
      finalColor += vec3(0.7,0.85,1.0) * rim * 0.20;
      gl_FragColor = vec4(finalColor, 1.0);
    }`
  );
}

// ── GANYMEDE / CALLISTO / PHOBOS / DEIMOS (generic rocky moons) ─────────────
function createGenericRockyMoonMaterial(baseColor: THREE.Color): THREE.ShaderMaterial {
  return makePlanetShader(
    { time: { value: 0 }, lightDir: { value: new THREE.Vector3(1, 0.3, 0.7).normalize() }, baseColor: { value: baseColor } },
    `${NOISE_GLSL}
    uniform float time;
    uniform vec3 lightDir;
    uniform vec3 baseColor;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vec3 n = normalize(vNormal);
      float diffuse = max(0.0, dot(n, lightDir));
      float ambient = 0.06;

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      float terrain = fbm(sph * 7.0);
      float craters = fbm(sph * 20.0);

      vec3 dark   = baseColor * 0.5;
      vec3 bright = baseColor * 1.3;

      vec3 col = mix(dark, baseColor, smoothstep(0.3, 0.7, terrain));
      float ejecta = smoothstep(0.65, 0.82, craters);
      col = mix(col, bright * 0.85, ejecta * 0.4);

      vec3 finalColor = col * (diffuse + ambient);
      gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
    }`
  );
}

// ── MAIN createBodyMaterial dispatcher ─────────────────────────────────────
const createBodyMaterial = (body: SimulationBody, quality: string): THREE.Material => {
  const baseColor = new THREE.Color(body.color || '#ffffff');
  const id = body.id.toLowerCase();

  if (body.type === 'star') {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: baseColor },
        time: { value: 0 },
        temperature: { value: Math.min(1.0, (body.mass / 2e30)) },
        pulseIntensity: { value: 0.5 },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: REALISTIC_STAR_VERTEX_SHADER,
      fragmentShader: REALISTIC_STAR_FRAGMENT_SHADER,
      transparent: false,
      side: THREE.FrontSide,
      depthWrite: true
    });
  }

  // Per-planet procedural shaders
  if (id === 'earth')    return createEarthMaterial();
  if (id === 'mars')     return createMarsMaterial();
  if (id === 'venus')    return createVenusMaterial();
  if (id === 'jupiter')  return createJupiterMaterial();
  if (id === 'saturn')   return createSaturnMaterial();
  if (id === 'uranus')   return createUranusMaterial();
  if (id === 'neptune')  return createNeptuneMaterial();
  if (id === 'mercury')  return createMercuryMaterial();

  // Moon-specific shaders
  if (id === 'moon')      return createMoonMaterial();
  if (id === 'io')        return createIoMaterial();
  if (id === 'europa')    return createEuropaMaterial();
  if (id === 'titan')     return createTitanMaterial();
  if (id === 'enceladus') return createEnceladusMaterial();
  // Ganymede, Callisto, Phobos, Deimos → generic rocky
  if (body.type === 'moon') return createGenericRockyMoonMaterial(baseColor);

  // Comets
  if (body.type === 'comet') {
    return new THREE.MeshPhongMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.05,
      shininess: 80,
      specular: new THREE.Color(0x444444),
      opacity: 0.95,
      transparent: true,
      side: THREE.FrontSide
    });
  }

  // Default (asteroids, artificial, etc.)
  return new THREE.MeshLambertMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 0.01
  });
};

const createBodyGeometry = (
  body: SimulationBody,
  lodLevel: number = 0
): { geometry: THREE.BufferGeometry; displayRadius: number } => {
  const displayRadius = getBodyScale(body);

  const lodMultipliers = [1, 0.75, 0.5, 0.25];
  const multiplier = lodMultipliers[Math.min(lodLevel, 3)];

  let segments = 16;
  if (body.type === 'star') segments = 64; // Higher quality for stars
  else if (body.type === 'planet') segments = 48;
  else if (body.type === 'moon') segments = 32;
  else if (displayRadius < 0.5) segments = 12;

  segments = Math.max(8, Math.floor(segments * multiplier));

  return {
    geometry: new THREE.SphereGeometry(displayRadius, segments, segments),
    displayRadius
  };
};

// Enhanced Camera Controller
class EnhancedCameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private targetOffset: THREE.Vector3;
  private isDragging: boolean = false;
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private followTarget: SimulationBody | null = null;
  private spherical: THREE.Spherical;
  private targetSpherical: THREE.Spherical;
  private smoothing: number = 0.08;
  private zoomSpeed: number = 0.05;
  private rotateSpeed: number = 0.005;
  private panSpeed: number = 0.001;
  private minDistance: number = 10;
  private maxDistance: number = 10000;
  private autoRotate: boolean = false;
  private autoRotateSpeed: number = 0.001;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.target = new THREE.Vector3(0, 0, 0);
    this.targetOffset = new THREE.Vector3(0, 0, 0);
    this.spherical = new THREE.Spherical(500, Math.PI / 3, 0);
    this.targetSpherical = this.spherical.clone();
    this.updateCameraPosition();
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
  }

  public isAutoRotateEnabled(): boolean {
    return this.autoRotate;
  }

  public getMinDistance(): number {
    return this.minDistance;
  }

  public getMaxDistance(): number {
    return this.maxDistance;
  }

  public getTargetSphericalClone(): THREE.Spherical {
    return this.targetSpherical.clone();
  }

  public setTargetRadius(radius: number): void {
    const clamped = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
    this.targetSpherical.radius = clamped;
  }

  public zoomIn(factor: number = 0.8): void {
    this.setTargetRadius(this.targetSpherical.radius * factor);
  }

  public zoomOut(factor: number = 1.2): void {
    this.setTargetRadius(this.targetSpherical.radius * factor);
  }

  setFollowTarget(body: SimulationBody | null): void {
    this.followTarget = body;
    if (body) {
      const targetPos = scalePosition(body.position);
      this.targetOffset.copy(targetPos).sub(this.target);
    }
  }

  update(deltaTime: number): void {
    const smoothingFactor = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);

    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * smoothingFactor;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * smoothingFactor;
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * smoothingFactor;

    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

    if (this.autoRotate && !this.isDragging) {
      this.targetSpherical.theta += this.autoRotateSpeed;
    }

    if (this.followTarget) {
      const targetPos = scalePosition(this.followTarget.position);
      this.target.lerp(targetPos, smoothingFactor * 2);
    } else {
      this.targetOffset.multiplyScalar(1 - smoothingFactor);
      this.target.add(this.targetOffset.clone().multiplyScalar(smoothingFactor));
    }

    this.updateCameraPosition();

    const distance = this.spherical.radius;
    this.camera.near = Math.max(0.01, distance * 0.0001);
    this.camera.far = distance * 10000;
    this.camera.updateProjectionMatrix();
  }

  private updateCameraPosition(): void {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
  }

  handleMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.lastMousePosition = { x: event.clientX, y: event.clientY };
    this.autoRotate = false;
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMousePosition.x;
    const deltaY = event.clientY - this.lastMousePosition.y;

    if (event.ctrlKey || event.metaKey) {
      const distance = this.spherical.radius;
      const adjustedPanSpeed = this.panSpeed * Math.sqrt(distance);

      const right = new THREE.Vector3();
      const up = new THREE.Vector3();

      right.setFromMatrixColumn(this.camera.matrix, 0);
      up.setFromMatrixColumn(this.camera.matrix, 1);

      this.target.add(right.multiplyScalar(-deltaX * adjustedPanSpeed));
      this.target.add(up.multiplyScalar(deltaY * adjustedPanSpeed));

      if (this.followTarget) {
        this.followTarget = null;
      }
    } else {
      this.targetSpherical.theta -= deltaX * this.rotateSpeed;
      this.targetSpherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1,
        this.targetSpherical.phi + deltaY * this.rotateSpeed));
    }

    this.lastMousePosition = { x: event.clientX, y: event.clientY };
  }

  handleMouseUp(): void {
    this.isDragging = false;
  }

  handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY * 0.001;
    const zoomFactor = 1 + Math.abs(delta);

    if (event.deltaY > 0) {
      this.targetSpherical.radius = Math.min(
        this.maxDistance,
        this.targetSpherical.radius * zoomFactor
      );
    } else {
      this.targetSpherical.radius = Math.max(
        this.minDistance,
        this.targetSpherical.radius / zoomFactor
      );
    }
  }

  zoomToFit(bodies: SimulationBody[], padding: number = 2): void {
    if (bodies.length === 0) return;

    const box = new THREE.Box3();
    bodies.forEach(body => {
      const pos = scalePosition(body.position);
      box.expandByPoint(pos);
    });

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    this.target.copy(center);
    this.targetSpherical.radius = Math.max(maxDim * padding, 50);
    this.followTarget = null;
  }

  reset(): void {
    this.target.set(0, 0, 0);
    this.targetSpherical.set(500, Math.PI / 3, 0);
    this.spherical = this.targetSpherical.clone();
    this.followTarget = null;
    this.autoRotate = false;
  }

  getInfo(): { position: Vector3Data; target: Vector3Data; distance: number } {
    return {
      position: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      },
      target: {
        x: this.target.x,
        y: this.target.y,
        z: this.target.z
      },
      distance: this.spherical.radius
    };
  }

  handleKeyPress(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case 'r':
        this.reset();
        break;
      case 'f':
        this.autoRotate = !this.autoRotate;
        break;
      case ' ':
        this.reset();
        break;
      case 'h':
        this.target.set(0, 0, 0);
        break;
      case '+':
      case '=':
        this.targetSpherical.radius = Math.max(
          this.minDistance,
          this.targetSpherical.radius * 0.9
        );
        break;
      case '-':
      case '_':
        this.targetSpherical.radius = Math.min(
          this.maxDistance,
          this.targetSpherical.radius * 1.1
        );
        break;
      case 'arrowleft':
        this.targetSpherical.theta -= 0.1;
        break;
      case 'arrowright':
        this.targetSpherical.theta += 0.1;
        break;
      case 'arrowup':
        this.targetSpherical.phi = Math.max(0.1, this.targetSpherical.phi - 0.1);
        break;
      case 'arrowdown':
        this.targetSpherical.phi = Math.min(Math.PI - 0.1, this.targetSpherical.phi + 0.1);
        break;
    }
  }
}

// ===== REAL UNIVERSE BACKGROUND SYSTEMS =====

// B-V color index to RGB color (spectral classification)
function bvToRGB(bv: number): THREE.Color {
  // Clamp BV to valid range
  const t = Math.max(-0.4, Math.min(2.0, bv));
  let r: number, g: number, b: number;

  if (t < 0.0) {
    // Blue-white (O/B type)
    const f = (t + 0.4) / 0.4;
    r = 0.63 + f * 0.12; g = 0.71 + f * 0.16; b = 1.0;
  } else if (t < 0.6) {
    // White to yellow-white (A/F/G)
    const f = t / 0.6;
    r = 1.0; g = 1.0 - f * 0.05; b = 1.0 - f * 0.35;
  } else if (t < 1.5) {
    // Yellow to orange (G/K)
    const f = (t - 0.6) / 0.9;
    r = 1.0; g = 0.95 - f * 0.28; b = 0.65 - f * 0.42;
  } else {
    // Deep red (M type)
    const f = Math.min(1.0, (t - 1.5) / 0.5);
    r = 1.0; g = 0.67 - f * 0.20; b = 0.23 - f * 0.10;
  }
  return new THREE.Color(r, g, b);
}

// RA/Dec (radians) → unit direction vector in Three.js space
function raDecToDir(ra: number, dec: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    -Math.cos(dec) * Math.sin(ra)
  );
}

class RealStarfield {
  private points: THREE.Points;
  private material: THREE.ShaderMaterial;
  private SPHERE_RADIUS = 48000; // scene units — far background

  constructor(catalog: StarEntry[]) {
    const count = catalog.length;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const [xPc, yPc, zPc, mag, bv] = catalog[i];

      // Place stars on a large sphere — direction from real xyz, but normalized
      // so all stars appear at the same distance (they're background)
      const len = Math.sqrt(xPc*xPc + yPc*yPc + zPc*zPc) || 1;
      // HYG xyz: x toward vernal equinox, y toward 90h RA, z toward north pole
      // Map to Three.js: x→x, y→z, z→y (Three.js Y is up)
      positions[i*3]   = (xPc / len) * this.SPHERE_RADIUS;
      positions[i*3+1] = (zPc / len) * this.SPHERE_RADIUS;
      positions[i*3+2] = (yPc / len) * this.SPHERE_RADIUS;

      const col = bvToRGB(bv);
      colors[i*3]   = col.r;
      colors[i*3+1] = col.g;
      colors[i*3+2] = col.b;

      // Size based on magnitude: brighter = bigger point
      // mag -1.5 (Sirius) → size 5.5; mag 6.5 → size 0.6
      const normMag = Math.max(-1.5, Math.min(6.5, mag));
      sizes[i] = Math.max(0.5, 5.5 - normMag * 0.77);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    // Custom shader: circular glowing points (PointsMaterial gives squares)
    this.material = new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 0.95 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vColor = color;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (800.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vec2 xy = gl_PointCoord - vec2(0.5);
          float r = length(xy);
          if (r > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.25, r);
          float glow = exp(-r * r * 12.0) * 0.4;
          float alpha = (core + glow) * opacity;
          // Subtle twinkle via color boost on bright core
          vec3 finalColor = vColor * (1.0 + core * 0.5);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.renderOrder = -2; // draw before everything else
  }

  getPoints(): THREE.Points { return this.points; }

  setVisible(v: boolean): void { this.points.visible = v; }

  dispose(): void {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}

// Milky Way procedural dome
class MilkyWayDome {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor() {
    // Inside-facing large sphere
    const geometry = new THREE.SphereGeometry(45000, 64, 64);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vWorldPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPos;
        uniform float time;

        // Simple hash noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for(int i = 0; i < 5; i++) {
            v += a * noise(p);
            p  = p * 2.1 + vec2(1.7, 9.2);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec3 dir = normalize(vWorldPos);

          // Convert to "galactic-like" coordinates
          // Galactic plane tilted ~63° from equator, center toward Sagittarius
          // We approximate: rotate direction to align with galactic plane
          float galLat = asin(
            dir.y * 0.5  +
            dir.x * 0.7  * 0.867 - dir.z * 0.7 * 0.5
          );
          float galLon = atan(
            dir.z * 0.867 + dir.x * 0.5,
            dir.x * 0.867 - dir.z * 0.5
          );

          // Main band: gaussian around galactic equator (galLat = 0)
          float band = exp(-galLat * galLat / (2.0 * 0.09));

          // Galactic bulge: bright center
          float bulgeDist = length(vec2(galLon * 0.3, galLat * 1.2));
          float bulge = 0.5 * exp(-bulgeDist * bulgeDist / 0.04);

          // Dust lanes: darkening at specific longitudes
          float dust = 0.0;
          dust += 0.4 * exp(-pow(galLon - 0.3, 2.0) / 0.02) * band;
          dust += 0.3 * exp(-pow(galLon + 0.8, 2.0) / 0.04) * band;
          dust += 0.25 * exp(-pow(galLon - 1.8, 2.0) / 0.03) * band * 0.5;

          // Fine star haze (noise texture for unresolved stars)
          vec2 noiseUV = vec2(galLon * 3.0, galLat * 8.0);
          float haze = fbm(noiseUV) * band * 0.6;
          float haze2 = fbm(noiseUV * 2.3 + vec2(5.1, 2.7)) * band * 0.3;

          float totalIntensity = (band * 0.5 + bulge + haze + haze2) * (1.0 - dust * 0.7);
          totalIntensity = clamp(totalIntensity, 0.0, 1.0);

          // Color: warm yellow-white in bulge/core, blue-white in arms
          vec3 bulgeColor = vec3(1.0, 0.92, 0.78);
          vec3 armColor   = vec3(0.75, 0.85, 1.0);
          vec3 bandColor  = mix(armColor, bulgeColor, bulge * 2.0);

          // Very faint background haze in gaps
          vec3 deepSpace = vec3(0.0, 0.001, 0.004);

          vec3 finalColor = mix(deepSpace, bandColor, totalIntensity * 0.65);

          // Alpha: visible only where there's milky way
          float alpha = totalIntensity * 0.55;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = -3;
  }

  getMesh(): THREE.Mesh { return this.mesh; }

  update(dt: number): void {
    this.material.uniforms.time.value += dt;
  }

  setVisible(v: boolean): void { this.mesh.visible = v; }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

// Deep-sky objects (galaxies, nebulae, clusters)
class DeepSkyObjects {
  private group: THREE.Group;
  private SPHERE_RADIUS = 46000;

  constructor(objects: MessierEntry[]) {
    this.group = new THREE.Group();

    objects.forEach(obj => {
      const dir = raDecToDir(obj.ra, obj.dec);
      const pos = dir.clone().multiplyScalar(this.SPHERE_RADIUS);

      const sizePx = Math.max(20, obj.angularSizeDeg * 600);
      const col = new THREE.Color(obj.color);

      const geometry = new THREE.PlaneGeometry(sizePx, sizePx * (obj.type === 'galaxy' ? 0.4 : 1.0));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: col },
          type:  { value: obj.type === 'galaxy' ? 0 : obj.type === 'nebula' ? 1 : 2 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform int type;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv - 0.5;
            float r = length(uv);
            float alpha = 0.0;
            if (type == 0) {
              // Galaxy: elliptical with sharp core
              float core = exp(-r * r * 40.0) * 0.9;
              float disk = exp(-r * r * 8.0) * 0.4;
              alpha = core + disk;
            } else if (type == 1) {
              // Nebula: irregular soft glow
              float base = exp(-r * r * 5.0);
              alpha = base * (0.3 + 0.3 * fract(sin(dot(uv * 10.0, vec2(12.9, 78.2))) * 43758.5));
            } else {
              // Cluster: bright center + scattered stars
              alpha = exp(-r * r * 30.0) * 0.8;
            }
            alpha = clamp(alpha, 0.0, 0.7);
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const sprite = new THREE.Mesh(geometry, material);
      sprite.position.copy(pos);
      sprite.lookAt(new THREE.Vector3(0, 0, 0));
      this.group.add(sprite);
    });

    this.group.renderOrder = -1;
  }

  getGroup(): THREE.Group { return this.group; }

  // Billboard update: make all sprites face the camera
  updateBillboards(camera: THREE.Camera): void {
    this.group.children.forEach(child => {
      child.lookAt(camera.position);
    });
  }

  setVisible(v: boolean): void { this.group.visible = v; }

  dispose(): void {
    this.group.children.forEach(child => {
      const m = child as THREE.Mesh;
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
  }
}

// Exoplanet markers — teal pulsing dots
class ExoplanetMarkers {
  private group: THREE.Group;
  private material: THREE.ShaderMaterial;
  private SPHERE_RADIUS = 47000;

  constructor(exoplanets: ExoplanetEntry[]) {
    this.group = new THREE.Group();

    const positions  = new Float32Array(exoplanets.length * 3);
    const brightness = new Float32Array(exoplanets.length);

    exoplanets.forEach((ep, i) => {
      const len = Math.sqrt(ep.x*ep.x + ep.y*ep.y + ep.z*ep.z) || 1;
      positions[i*3]   = (ep.x / len) * this.SPHERE_RADIUS;
      positions[i*3+1] = (ep.z / len) * this.SPHERE_RADIUS;
      positions[i*3+2] = (ep.y / len) * this.SPHERE_RADIUS;
      brightness[i] = 1.0;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',   new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('brightness', new THREE.BufferAttribute(brightness, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float brightness;
        varying float vBright;
        uniform float time;
        void main() {
          vBright = brightness;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0 + sin(time * 2.0) * 1.0;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        varying float vBright;
        void main() {
          vec2 xy = gl_PointCoord - 0.5;
          float r = length(xy);
          if (r > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.2, 0.5, r)) * 0.85;
          float pulse = 0.8 + 0.2 * sin(time * 2.0);
          // Teal color for habitable-zone exoplanets
          gl_FragColor = vec4(0.2, 0.9, 0.85, alpha * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, this.material);
    this.group.add(points);
  }

  getGroup(): THREE.Group { return this.group; }

  update(time: number): void {
    this.material.uniforms.time.value = time;
  }

  setVisible(v: boolean): void { this.group.visible = v; }

  dispose(): void {
    this.group.children.forEach(c => {
      (c as THREE.Points).geometry.dispose();
    });
    this.material.dispose();
  }
}

// ===== FIRST PERSON CAMERA CONTROLLER =====

export interface FPHUDData {
  bodyName: string;
  distAU: number;
  speedKms: number;
}

class FirstPersonCameraController {
  private camera: THREE.PerspectiveCamera;
  private yaw: number   = 0;    // horizontal (radians)
  private pitch: number = 0.3;  // vertical — slight upward tilt to see stars
  private isDragging: boolean = false;
  private lastMouse: { x: number; y: number } = { x: 0, y: 0 };
  private rotateSpeed: number = 0.003;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  update(scaledPosition: THREE.Vector3, displayRadius: number): void {
    // Sit just above the body's "north pole" (top)
    const surfaceOffset = displayRadius * 1.8 + 0.5;
    const camPos = scaledPosition.clone().add(new THREE.Vector3(0, surfaceOffset, 0));
    this.camera.position.copy(camPos);

    // YXZ Euler order = natural FPS camera (yaw first, then pitch)
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;

    // Very close near plane (on a surface), huge far plane (see stars)
    this.camera.near = 0.0001;
    this.camera.far  = 200000;
    this.camera.updateProjectionMatrix();
  }

  handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMouse  = { x: e.clientX, y: e.clientY };
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.yaw  -= dx * this.rotateSpeed;
    this.pitch = Math.max(-1.48, Math.min(1.48, this.pitch + dy * this.rotateSpeed));
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  handleMouseUp(): void { this.isDragging = false; }

  getHUDData(body: SimulationBody, allBodies: SimulationBody[]): FPHUDData {
    // Distance to star (AU)
    const star = allBodies.find(b => b.type === 'star');
    let distAU = 0;
    if (star) {
      const dx = body.position.x - star.position.x;
      const dy = body.position.y - star.position.y;
      const dz = body.position.z - star.position.z;
      distAU = Math.sqrt(dx*dx + dy*dy + dz*dz) / 1.496e11;
    }
    // Speed in km/s
    const speedKms = Math.sqrt(
      body.velocity.x**2 + body.velocity.y**2 + body.velocity.z**2
    ) / 1000;
    return { bodyName: body.name, distAU, speedKms };
  }
}

// ===== MAIN RENDERING HOOK =====

export const useNBodyRendering = ({
  containerRef,
  bodies,
  selectedBodies,
  visualConfig = {},
  cameraConfig = {},
  onCameraUpdate,
  onBodyClick,
  onBackgroundClick
}: UseNBodyRenderingProps) => {

  const config = { ...DEFAULT_VISUAL, ...visualConfig };

  const [renderingState, setRenderingState] = useState<RenderingState>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    isInitialized: false,
    lastRenderTime: 0,
    frameCount: 0,
    renderFPS: 0,
    quality: 'high'
  });

  // CRITICAL FIX: Use refs for frame-by-frame values
  const renderingStateRef = useRef<RenderingState>(renderingState);
  const lastRenderTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsUpdateIntervalRef = useRef<number>(0);

  // Update ref when state changes
  useEffect(() => {
    renderingStateRef.current = renderingState;
  }, [renderingState]);

  // Keep bodiesRef in sync for FP HUD
  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  const renderableBodiersRef = useRef<Map<string, RenderableBody>>(new Map());
  const cameraControllerRef = useRef<EnhancedCameraController | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const frustumRef = useRef<THREE.Frustum>(new THREE.Frustum());
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const spacetimeGridRef = useRef<SpacetimeGrid | null>(null);

  // Universe background refs
  const realStarfieldRef  = useRef<RealStarfield | null>(null);
  const milkyWayRef       = useRef<MilkyWayDome | null>(null);
  const deepSkyRef        = useRef<DeepSkyObjects | null>(null);
  const exoplanetsRef     = useRef<ExoplanetMarkers | null>(null);

  // First-person mode
  const fpControllerRef   = useRef<FirstPersonCameraController | null>(null);
  const fpStateRef        = useRef<{ active: boolean; bodyId: string | null }>({ active: false, bodyId: null });
  const [fpActive, setFpActive] = useState(false);
  const [fpHUD, setFpHUD]       = useState<FPHUDData | null>(null);
  const bodiesRef               = useRef<SimulationBody[]>(bodies);

  const lightsRef = useRef<{
    ambient: THREE.AmbientLight | null;
    sun: THREE.DirectionalLight | null;
    hemisphere: THREE.HemisphereLight | null;
  }>({ ambient: null, sun: null, hemisphere: null });
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Initialize Three.js scene
  const initializeRenderer = useCallback(() => {
    if (!containerRef.current) return;

    console.log('Initializing improved renderer with dynamic trails...');
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Create renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000511, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Create scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000511, 0.00015);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      rect.width / rect.height,
      0.1,
      10000
    );
    camera.position.set(200, 100, 200);

    // Create camera controller
    const cameraController = new EnhancedCameraController(camera);
    cameraControllerRef.current = cameraController;

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0x404050, 0.3);
    scene.add(ambientLight);
    lightsRef.current.ambient = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 1000;
    const shadowSize = 500;
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    lightsRef.current.sun = sunLight;

    const hemiLight = new THREE.HemisphereLight(0x8899ff, 0x334455, 0.4);
    scene.add(hemiLight);
    lightsRef.current.hemisphere = hemiLight;

    // Add spacetime grid
    const spacetimeGrid = new SpacetimeGrid(2000, 60);
    spacetimeGridRef.current = spacetimeGrid;
    scene.add(spacetimeGrid.getMesh());
    spacetimeGrid.setVisible(config.showPotentialWells || false);

    // Improved starfield
    const createStarfield = (count: number, size: number, spread: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * spread;

        const starType = Math.random();
        if (starType < 0.3) {
          colors[i3] = 0.8;
          colors[i3 + 1] = 0.85;
          colors[i3 + 2] = 1.0;
        } else if (starType < 0.7) {
          colors[i3] = 1.0;
          colors[i3 + 1] = 1.0;
          colors[i3 + 2] = 1.0;
        } else {
          colors[i3] = 1.0;
          colors[i3 + 1] = 0.9;
          colors[i3 + 2] = 0.8;
        }

        sizes[i] = Math.random() * size * (1 + Math.random());
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: size,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      return new THREE.Points(geometry, material);
    };

    // Real universe background — replaces random starfield
    const realStarfield = new RealStarfield(STAR_CATALOG);
    scene.add(realStarfield.getPoints());
    realStarfieldRef.current = realStarfield;

    const milkyWay = new MilkyWayDome();
    scene.add(milkyWay.getMesh());
    milkyWayRef.current = milkyWay;

    const deepSky = new DeepSkyObjects(MESSIER_OBJECTS);
    scene.add(deepSky.getGroup());
    deepSkyRef.current = deepSky;

    const exoplanetMarkers = new ExoplanetMarkers(NOTABLE_EXOPLANETS);
    scene.add(exoplanetMarkers.getGroup());
    exoplanetsRef.current = exoplanetMarkers;

    container.appendChild(renderer.domElement);

    // Reset timing refs
    lastRenderTimeRef.current = performance.now();
    frameCountRef.current = 0;
    fpsUpdateIntervalRef.current = 0;

    console.log('Improved renderer with dynamic trails initialized successfully');

    setRenderingState({
      scene,
      camera,
      renderer,
      composer: null,
      isInitialized: true,
      lastRenderTime: performance.now(),
      frameCount: 0,
      renderFPS: 0,
      quality: 'high'
    });

    return () => {
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      spacetimeGridRef.current?.dispose();
      realStarfieldRef.current?.dispose();
      milkyWayRef.current?.dispose();
      deepSkyRef.current?.dispose();
      exoplanetsRef.current?.dispose();
    };
  }, [containerRef, config.showPotentialWells]);

  // Initialize on mount
  useEffect(() => {
    const cleanup = initializeRenderer();
    return cleanup;
  }, [initializeRenderer]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !renderingState.camera || !renderingState.renderer) return;

      const rect = containerRef.current.getBoundingClientRect();
      renderingState.camera.aspect = rect.width / rect.height;
      renderingState.camera.updateProjectionMatrix();
      renderingState.renderer.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderingState, containerRef]);

  // Update renderable bodies - keep the existing implementation
  useEffect(() => {
    if (!renderingState.scene || !renderingState.isInitialized || !renderingState.camera) return;

    // Narrow once for TypeScript
    const scene = renderingState.scene!;
    const camera = renderingState.camera!;

    const renderableBodies = renderableBodiersRef.current;
    const currentBodyIds = new Set(bodies.map(b => b.id));

    // Update spacetime grid with body positions
    if (spacetimeGridRef.current) {
      const bodyData = bodies.map(b => ({
        position: scalePosition(b.position),
        mass: b.mass
      }));
      spacetimeGridRef.current.updateMasses(bodyData);
    }

    // Remove bodies that no longer exist
    for (const [id, renderable] of renderableBodies) {
      if (!currentBodyIds.has(id)) {
        if (renderable.mesh) {
          scene.remove(renderable.mesh);
          renderable.mesh.geometry.dispose();
          if (Array.isArray(renderable.mesh.material)) {
            renderable.mesh.material.forEach(m => m.dispose());
          } else {
            renderable.mesh.material.dispose();
          }
        }
        if (renderable.trail) {
          scene.remove(renderable.trail.getMesh());
          renderable.trail.dispose();
        }
        if (renderable.pointLight) {
          scene.remove(renderable.pointLight);
        }
        if (renderable.coronaMesh) {
          scene.remove(renderable.coronaMesh);
          renderable.coronaMesh.geometry.dispose();
          (renderable.coronaMesh.material as THREE.Material).dispose();
        }
        if (renderable.rings) {
          scene.remove(renderable.rings);
          renderable.rings.geometry.dispose();
          (renderable.rings.material as THREE.Material).dispose();
        }
        renderableBodies.delete(id);
      }
    }

    // Track primary star for lighting
    let primaryStarPosition: THREE.Vector3 | null = null;
    let primaryStarColor: THREE.Color | null = null;
    let primaryStarMass: number | null = null;

    // Build a quick lookup: bodyId → physics-scaled position (used for moon separation)
    const bodyScaledPositions = new Map<string, THREE.Vector3>();
    for (const body of bodies) {
      bodyScaledPositions.set(body.id, scalePosition(body.position));
    }

    // Add or update bodies
    for (const body of bodies) {
      let renderable = renderableBodies.get(body.id);

      // Raw physics-scaled position
      const rawScaledPosition = bodyScaledPositions.get(body.id)!;

      // For moons: push out from parent so they are never inside the parent sphere.
      // Planet display radii are hugely inflated vs real orbital distances, so we
      // enforce a minimum visual separation of parentDisplayRadius * 3.5.
      let scaledPosition = rawScaledPosition.clone();
      if (body.type === 'moon' && body.parentId) {
        const parentRawPos = bodyScaledPositions.get(body.parentId);
        if (parentRawPos) {
          const parentBody = bodies.find(b => b.id === body.parentId);
          if (parentBody) {
            const parentDisplayR = getBodyScale(parentBody);
            const minSep = parentDisplayR * 3.5;          // clear visual gap
            const moonDir = rawScaledPosition.clone().sub(parentRawPos);
            const moonDist = moonDir.length();
            if (moonDist < minSep) {
              // Preserve direction but enforce minimum separation
              const dir = moonDist > 0.0001
                ? moonDir.normalize()
                : new THREE.Vector3(1, 0, 0); // fallback if coincident
              scaledPosition = parentRawPos.clone().add(dir.multiplyScalar(minSep));
            }
          }
        }
      }

      // Calculate LOD
      const distanceToCamera = camera.position.distanceTo(scaledPosition);
      const config = BODY_SCALE[body.type] || BODY_SCALE.asteroid;
      let lodLevel = 0;
      const lodDistances = [0, 50, 150, 500];
      for (let i = 0; i < lodDistances.length; i++) {
        if (distanceToCamera > lodDistances[i]) {
          lodLevel = i;
        }
      }

      if (!renderable) {
        console.log(`Creating renderable for: ${body.name} (${body.type}) with dynamic trail`);

        const { geometry, displayRadius } = createBodyGeometry(body, lodLevel);
        const material = createBodyMaterial(body, renderingState.quality);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(scaledPosition);
        mesh.castShadow = body.type !== 'star';
        mesh.receiveShadow = true;
        mesh.userData = { bodyId: body.id };

        scene.add(mesh);

        // Add star-specific effects
        let pointLight: THREE.PointLight | undefined = undefined;
        let coronaMesh: THREE.Mesh | null = null;
        if (body.type === 'star') {
          const intensityBase = Math.max(0.5, Math.min(6, (body.mass / 2e30) * 2.5));
          pointLight = new THREE.PointLight(
            new THREE.Color(body.color || '#FDB813'),
            intensityBase,
            0,
            2
          );
          pointLight.position.copy(scaledPosition);
          pointLight.castShadow = true;
          pointLight.shadow.mapSize.width = 2048;
          pointLight.shadow.mapSize.height = 2048;
          pointLight.shadow.camera.near = 0.1;
          pointLight.shadow.camera.far = Math.max(1000, displayRadius * 100);
          scene.add(pointLight);

          // 🌟 Majestic permanent corona billboard
          const starCol = new THREE.Color(body.color || '#FDB813');
          coronaMesh = createStarCoronaMesh(displayRadius, starCol);
          coronaMesh.position.copy(scaledPosition);
          scene.add(coronaMesh);
        }

        // Saturn ring system
        let ringsMesh: THREE.Mesh | null = null;
        if (body.id.toLowerCase() === 'saturn') {
          // Ring disc: inner radius = 1.2× body, outer = 2.4× body (like real ratio)
          const innerR = displayRadius * 1.25;
          const outerR = displayRadius * 2.45;
          // RingGeometry(innerRadius, outerRadius, segments)
          const ringGeo = new THREE.RingGeometry(innerR, outerR, 128, 6);
          // Remap UVs so u goes 0→1 radially (inner→outer) for shader
          const pos = ringGeo.attributes.position;
          const uv  = ringGeo.attributes.uv;
          for (let vi = 0; vi < pos.count; vi++) {
            const x = pos.getX(vi);
            const y = pos.getY(vi);
            const r = Math.sqrt(x * x + y * y);
            const u = (r - innerR) / (outerR - innerR);
            uv.setX(vi, u);
          }
          uv.needsUpdate = true;
          const ringMat = createSaturnRingMaterial();
          ringsMesh = new THREE.Mesh(ringGeo, ringMat);
          // Tilt rings ~27° (Saturn's obliquity)
          ringsMesh.rotation.x = Math.PI / 2 - 0.47;
          ringsMesh.position.copy(scaledPosition);
          ringsMesh.renderOrder = 1;
          scene.add(ringsMesh);
        }

        // Create NEW dynamic trail system
        let trail: DynamicTrailSystem | null = null;
        if (config.enableTrails && body.type !== 'star') {
          const fade = normalizeTrailFadeType(config.trailFadeType as unknown as string);
          trail = new DynamicTrailSystem(
            config.trailLength ?? 300,
            body.color ?? '#ffffff',
            fade
          );
          scene.add(trail.getMesh());
        }

        renderable = {
          id: body.id,
          body,
          mesh,
          displayRadius,
          trail,
          labelSprite: null,
          velocityArrow: null,
          selectionRing: null,
          glowMesh: null,
          coronaMesh,
          atmosphere: null,
          rings: ringsMesh,
          lastUpdateTime: performance.now(),
          interpolatedPosition: scaledPosition.clone(),
          interpolatedVelocity: new THREE.Vector3(),
          lodLevel,
          isInFrustum: true,
          pointLight
        };

        renderableBodies.set(body.id, renderable);

      } else {
        // Update existing body
        renderable.body = body;

        // Update LOD if needed
        if (renderable.lodLevel !== lodLevel && renderable.mesh) {
          const { geometry } = createBodyGeometry(body, lodLevel);
          renderable.mesh.geometry.dispose();
          renderable.mesh.geometry = geometry;
          renderable.lodLevel = lodLevel;
        }

        // Smooth position interpolation
        renderable.interpolatedPosition.lerp(scaledPosition, 0.2);
        if (renderable.mesh) {
          renderable.mesh.position.copy(renderable.interpolatedPosition);
        }

        // Update star light position & intensity
        if (renderable.pointLight) {
          renderable.pointLight.position.copy(renderable.interpolatedPosition);
          if (renderable.body && renderable.body.mass) {
            renderable.pointLight.intensity = Math.max(0.5, Math.min(8, (renderable.body.mass / 2e30) * 2.5));
          }
        }

        // 🌟 Update majestic corona — follow star, billboard face camera, animate time
        if (renderable.coronaMesh) {
          renderable.coronaMesh.position.copy(renderable.interpolatedPosition);
          // Billboard: always face the camera
          renderable.coronaMesh.quaternion.copy(camera.quaternion);
          // Animate corona rays
          const coronaMat = renderable.coronaMesh.material as THREE.ShaderMaterial;
          coronaMat.uniforms.time.value = clockRef.current.getElapsedTime();
        }

        // 🪐 Update Saturn rings — follow planet position
        if (renderable.rings) {
          renderable.rings.position.copy(renderable.interpolatedPosition);
        }

        // Update trail with new dynamic system
        if (renderable.trail && config.enableTrails) {
          renderable.trail.addPoint(scaledPosition.clone());
        }

        // Update shader uniforms
        if (renderable.mesh?.material instanceof THREE.ShaderMaterial) {
          const mat = renderable.mesh.material as THREE.ShaderMaterial;
          const uniforms = mat.uniforms as Record<string, any>;
          if (uniforms.time) {
            uniforms.time.value = clockRef.current.getElapsedTime();
          }
          if (uniforms.viewVector && renderable.mesh) {
            uniforms.viewVector.value = camera.position.clone().sub(renderable.mesh.position).normalize();
          }
          // Point lightDir toward primary star for accurate per-planet shading
          if (uniforms.lightDir && primaryStarPosition) {
            uniforms.lightDir.value = primaryStarPosition.clone()
              .sub(renderable.interpolatedPosition).normalize();
          }
        }
      }

      // Track primary star for lighting
      if (body.type === 'star' && (!primaryStarPosition || body.mass > (primaryStarMass ?? 0))) {
        primaryStarPosition = renderable.interpolatedPosition.clone();
        primaryStarColor = new THREE.Color(body.color || '#FDB813');
        primaryStarMass = body.mass;
      }

      // Handle selection
      const isSelected = selectedBodies.some(sb => sb.id === body.id);
      if (isSelected && !renderable.selectionRing && renderable.mesh) {
        const ringGeometry = new THREE.TorusGeometry(
          renderable.displayRadius * 1.5,
          renderable.displayRadius * 0.05,
          16,
          64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending
        });
        renderable.selectionRing = new THREE.Mesh(ringGeometry, ringMaterial);
        renderable.selectionRing.rotation.x = Math.PI / 2;
        renderable.mesh.add(renderable.selectionRing);
      } else if (!isSelected && renderable.selectionRing && renderable.mesh) {
        renderable.mesh.remove(renderable.selectionRing);
        renderable.selectionRing.geometry.dispose();
        (renderable.selectionRing.material as THREE.Material).dispose();
        renderable.selectionRing = null;
      }

      // Animate selection ring
      if (renderable.selectionRing) {
        const time = clockRef.current.getElapsedTime();
        renderable.selectionRing.rotation.z = time * 0.5;
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        renderable.selectionRing.scale.set(pulse, pulse, 1);
      }
    }

    // Update main directional light to follow primary star
    if (primaryStarPosition && lightsRef.current.sun) {
      lightsRef.current.sun.position.copy(primaryStarPosition);
      if (primaryStarColor) {
        lightsRef.current.sun.color.copy(primaryStarColor);
      }
      if (primaryStarMass) {
        lightsRef.current.sun.intensity = Math.min(6, (primaryStarMass / 2e30) * 2.5);
      }
    }

  }, [bodies, selectedBodies, config, renderingState]);

  // Mouse interaction
  const handleMouseClick = useCallback((event: MouseEvent) => {
    if (!renderingState.camera || !renderingState.scene || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, renderingState.camera);

    const meshes = Array.from(renderableBodiersRef.current.values())
      .filter(rb => rb.mesh)
      .map(rb => rb.mesh!)
      .filter(Boolean);

    const intersects = raycasterRef.current.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      let targetMesh = intersects[0].object;
      while (targetMesh.parent && !targetMesh.userData.bodyId) {
        targetMesh = targetMesh.parent as THREE.Mesh;
      }

      if (targetMesh.userData.bodyId) {
        onBodyClick?.(targetMesh.userData.bodyId, event);
      }
    } else {
      onBackgroundClick?.(event);
    }
  }, [renderingState, containerRef, onBodyClick, onBackgroundClick]);

  // Event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const controller = cameraControllerRef.current;

    if (!controller) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (fpStateRef.current.active) fpControllerRef.current?.handleMouseDown(e);
      else controller.handleMouseDown(e);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (fpStateRef.current.active) fpControllerRef.current?.handleMouseMove(e);
      else controller.handleMouseMove(e);
    };
    const handleMouseUp = () => {
      if (fpStateRef.current.active) fpControllerRef.current?.handleMouseUp();
      else controller.handleMouseUp();
    };
    const handleWheel = (e: WheelEvent) => controller.handleWheel(e);
    const handleKeyPress = (e: KeyboardEvent) => controller.handleKeyPress(e);

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleMouseClick);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleMouseClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [containerRef, handleMouseClick, renderingState]);

  // FIXED render callback - no state dependencies
  const render = useCallback(() => {
    const state = renderingStateRef.current;

    if (!state.renderer || !state.scene || !state.camera || !state.isInitialized) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastRenderTimeRef.current) / 1000;

    // Update camera (orbit or first-person)
    if (fpStateRef.current.active && fpControllerRef.current) {
      const targetR = renderableBodiersRef.current.get(fpStateRef.current.bodyId!);
      if (targetR) {
        fpControllerRef.current.update(targetR.interpolatedPosition, targetR.displayRadius);
        // Update HUD every 10 frames to avoid re-render storm
        if (frameCountRef.current % 10 === 0) {
          setFpHUD(fpControllerRef.current.getHUDData(targetR.body, bodiesRef.current));
        }
      }
    } else {
      cameraControllerRef.current?.update(deltaTime);
    }

    // Update spacetime grid
    spacetimeGridRef.current?.update(deltaTime);

    // Update universe background animations
    milkyWayRef.current?.update(deltaTime);
    exoplanetsRef.current?.update(clockRef.current.getElapsedTime());
    if (renderingStateRef.current.camera) {
      deepSkyRef.current?.updateBillboards(renderingStateRef.current.camera);
    }

    // Update camera info callback
    if (onCameraUpdate && cameraControllerRef.current) {
      const info = cameraControllerRef.current.getInfo();
      onCameraUpdate(info.position, info.target);
    }

    // Render scene
    state.renderer.render(state.scene, state.camera);

    // Update timing refs
    lastRenderTimeRef.current = currentTime;
    frameCountRef.current += 1;
    fpsUpdateIntervalRef.current += deltaTime;

    // Update FPS in state only every 0.5 seconds to avoid excessive re-renders
    if (fpsUpdateIntervalRef.current >= 0.5) {
      const avgFPS = deltaTime > 0 ? Math.round(1 / deltaTime) : 60;
      setRenderingState(prev => ({
        ...prev,
        lastRenderTime: currentTime,
        frameCount: frameCountRef.current,
        renderFPS: avgFPS
      }));
      fpsUpdateIntervalRef.current = 0;
    }
  }, [onCameraUpdate]); // Only depends on the callback prop

  // Animation loop
  useEffect(() => {
    if (!renderingState.isInitialized) return;

    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render, renderingState.isInitialized]);

  // Public API
  const enterFirstPerson = useCallback((bodyId: string) => {
    const renderable = renderableBodiersRef.current.get(bodyId);
    if (!renderable) return;
    // Hide the body mesh so you don't see it from inside
    if (renderable.mesh) renderable.mesh.visible = false;
    if (renderable.trail) renderable.trail.getMesh().visible = false;
    // Create FP controller using current camera
    const cam = renderingStateRef.current.camera;
    if (!cam) return;
    const fp = new FirstPersonCameraController(cam);
    fpControllerRef.current = fp;
    fpStateRef.current = { active: true, bodyId };
    setFpActive(true);
  }, []);

  const exitFirstPerson = useCallback(() => {
    const bodyId = fpStateRef.current.bodyId;
    if (bodyId) {
      const renderable = renderableBodiersRef.current.get(bodyId);
      if (renderable?.mesh) renderable.mesh.visible = true;
      if (renderable?.trail) renderable.trail.getMesh().visible = true;
    }
    fpControllerRef.current = null;
    fpStateRef.current = { active: false, bodyId: null };
    setFpActive(false);
    setFpHUD(null);
    // Reset orbit camera to reasonable position
    cameraControllerRef.current?.reset();
  }, []);

  const setFollowBody = useCallback((bodyId: string | null) => {
    const body = bodyId ? bodies.find(b => b.id === bodyId) : null;
    cameraControllerRef.current?.setFollowTarget(body || null);
  }, [bodies]);

  const zoomToFit = useCallback(() => {
    cameraControllerRef.current?.zoomToFit(bodies);
  }, [bodies]);

  const getCameraInfo = useCallback(() => {
    return cameraControllerRef.current?.getInfo() || null;
  }, []);

  const resetCamera = useCallback(() => {
    cameraControllerRef.current?.reset();
  }, []);

  const setAutoRotate = useCallback((enabled: boolean) => {
    cameraControllerRef.current?.setAutoRotate(enabled);
  }, []);

  const zoomIn = useCallback(() => {
    cameraControllerRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    cameraControllerRef.current?.zoomOut();
  }, []);

  const toggleSpacetimeGrid = useCallback((visible: boolean) => {
    spacetimeGridRef.current?.setVisible(visible);
  }, []);

  return {
    renderingState,
    setFollowBody,
    zoomToFit,
    getCameraInfo,
    resetCamera,
    setAutoRotate,
    zoomIn,
    zoomOut,
    toggleSpacetimeGrid,
    enterFirstPerson,
    exitFirstPerson,
    fpActive,
    fpHUD,
    isInitialized: renderingState.isInitialized,
    quality: renderingState.quality,
    fps: renderingState.renderFPS
  };
};