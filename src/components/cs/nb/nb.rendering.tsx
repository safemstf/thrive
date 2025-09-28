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

const createBodyMaterial = (body: SimulationBody, quality: string): THREE.Material => {
  const baseColor = new THREE.Color(body.color || '#ffffff');

  if (body.type === 'star') {
    // Realistic star shader
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: baseColor },
        time: { value: 0 },
        temperature: { value: Math.min(1.0, (body.mass / 2e30)) }, // Normalize to sun mass
        pulseIntensity: { value: 0.5 },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: REALISTIC_STAR_VERTEX_SHADER,
      fragmentShader: REALISTIC_STAR_FRAGMENT_SHADER,
      transparent: false,
      side: THREE.FrontSide,
      depthWrite: true
    });
  } else if (body.type === 'planet' && body.mass > 1e26) {
    // Gas giants with better shading
    return new THREE.MeshPhongMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.02,
      shininess: 10,
      specular: new THREE.Color(0x222222),
      side: THREE.FrontSide
    });
  } else if (body.type === 'moon' || (body.type === 'planet' && body.mass <= 1e26)) {
    // Rocky bodies with enhanced lighting
    return new THREE.MeshPhongMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.01,
      shininess: 5,
      specular: new THREE.Color(0x111111),
      side: THREE.FrontSide
    });
  } else if (body.type === 'comet') {
    // Icy bodies
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
  } else {
    // Default material for asteroids
    return new THREE.MeshLambertMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.01
    });
  }
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

  const renderableBodiersRef = useRef<Map<string, RenderableBody>>(new Map());
  const cameraControllerRef = useRef<EnhancedCameraController | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const frustumRef = useRef<THREE.Frustum>(new THREE.Frustum());
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const spacetimeGridRef = useRef<SpacetimeGrid | null>(null);
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

    scene.add(createStarfield(3000, 0.5, 4000));
    scene.add(createStarfield(1000, 1.0, 8000));
    scene.add(createStarfield(200, 2.0, 12000));

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
        renderableBodies.delete(id);
      }
    }

    // Track primary star for lighting
    let primaryStarPosition: THREE.Vector3 | null = null;
    let primaryStarColor: THREE.Color | null = null;
    let primaryStarMass: number | null = null;

    // Add or update bodies
    for (const body of bodies) {
      let renderable = renderableBodies.get(body.id);
      const scaledPosition = scalePosition(body.position);

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
          atmosphere: null,
          rings: null,
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

    const handleMouseDown = (e: MouseEvent) => controller.handleMouseDown(e);
    const handleMouseMove = (e: MouseEvent) => controller.handleMouseMove(e);
    const handleMouseUp = () => controller.handleMouseUp();
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

    // Update camera
    cameraControllerRef.current?.update(deltaTime);

    // Update spacetime grid
    spacetimeGridRef.current?.update(deltaTime);

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
    isInitialized: renderingState.isInitialized,
    quality: renderingState.quality,
    fps: renderingState.renderFPS
  };
};