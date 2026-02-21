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
import {
  createStarCoronaMesh,
  createSaturnRingMaterial,
  createBodyMaterial,
  GalaxyRenderer,
} from './nb.shaders';

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
    // Reject NaN / Infinity positions — these corrupt the geometry buffer
    if (!isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) return;

    // Skip if too close to last point (avoids duplicate vertices)
    if (this.lastPosition && this.lastPosition.distanceTo(position) < this.minDistance) {
      return;
    }

    this.positions.push(position.clone());
    this.initialized = true;

    // Trim to max length (ring buffer behaviour)
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
    if (pointCount === 0) {
      this.geometry.setDrawRange(0, 0);
      return;
    }

    for (let i = 0; i < pointCount; i++) {
      const pos = this.positions[i];
      positionAttribute.setXYZ(i, pos.x, pos.y, pos.z);

      const t = i / Math.max(1, pointCount - 1); // 0 = oldest, 1 = newest
      let fade: number;
      switch (this.fadeType) {
        case 'exponential': fade = Math.pow(t, 2.5); break;
        case 'quadratic': fade = t * t; break;
        default: fade = t;
      }
      fade = 0.04 + fade * 0.96;

      const cv = 0.7 + fade * 0.3;
      colorAttribute.setXYZ(i, this.color.r * cv, this.color.g * cv, this.color.b * cv);
      alphaAttribute.setX(i, fade);
    }

    this.geometry.setDrawRange(0, pointCount);
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;

    // Only compute bounding sphere when we have valid finite positions
    try {
      this.geometry.computeBoundingSphere();
    } catch {
      // Swallow — happens on degenerate geometry, not fatal
    }
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
  simulationTime?: number;  // current simulation time in seconds, for analytical moon orbits
  onCameraUpdate?: (position: Vector3Data, target: Vector3Data) => void;
  onBodyClick?: (bodyId: string, event: MouseEvent) => void;
  onBackgroundClick?: (event: MouseEvent) => void;
  /** Called when the rendering mode switches between solar-system and galaxy. */
  onGalaxyModeChange?: (isGalaxy: boolean) => void;
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

// ===== UTILITY FUNCTIONS =====

const scalePosition = (position: Vector3Data): THREE.Vector3 => {
  return new THREE.Vector3(
    position.x * SCALE_FACTOR,
    position.y * SCALE_FACTOR,
    position.z * SCALE_FACTOR
  );
};

// Logarithmic body scale: preserves relative sizes (Sun >> Jupiter >> Earth >> Moon)
// Anchored so Earth (r=6.371e6 m) ≈ 2.0 scene units.
// log(1 + r/EARTH_R) compresses the 1–109× range into a ~0.69–4.7 range.
const EARTH_R = 6.371e6; // metres
const LOG_BASE = 2.0 / Math.log(1 + 1); // ≈ 2.885, so Earth → 2.0

const getBodyScale = (body: SimulationBody): number => {
  const ratio = body.radius / EARTH_R;
  let scale = LOG_BASE * Math.log(1 + ratio);

  // Hard floors so tiny bodies are still clickable / visible
  if (body.type === 'star') scale = Math.max(scale, 10.0);
  else if (body.type === 'planet') scale = Math.max(scale, 0.6);
  else if (body.type === 'moon') scale = Math.max(scale, 0.25);
  else scale = Math.max(scale, 0.15);

  // Hard ceiling — nothing should be enormous on screen
  scale = Math.min(scale, 18.0);

  return scale;
};

// ── Moon visual orbit radii ──────────────────────────────────────────────────
// Real orbital distances are far smaller than inflated planet display radii,
// so we use fixed visual radii that look good while keeping the physics direction.
const VISUAL_ORBIT_RADII: Record<string, number> = {
  // Earth system  (Earth display r ≈ 2.0)
  moon: 6.5,
  // Mars system   (Mars display r ≈ 1.23)
  phobos: 3.8,
  deimos: 6.5,
  // Jupiter system (Jupiter display r ≈ 7.16)
  io: 14,
  europa: 19,
  ganymede: 25,
  callisto: 32,
  // Saturn system  (Saturn display r ≈ 6.68)
  enceladus: 13,
  titan: 22,
};

// ── Moon orbital periods (seconds) for analytical angle computation ───────────
// Used for moons whose N-body orbit is under-resolved at the current timestep.
// Phobos (7.65h) and Deimos (30.3h) are far too fast for a 1hr timestep.
const MOON_ORBITAL_PERIODS: Record<string, number> = {
  moon:      2360592,  // 27.32 days
  phobos:    27552,    // 7.65 hours
  deimos:    109080,   // 30.3 hours
  io:        152853,   // 1.769 days
  europa:    306822,   // 3.55 days
  ganymede:  618153,   // 7.15 days
  callisto:  1441931,  // 16.69 days
  titan:     1377648,  // 15.95 days
  enceladus: 118386,   // 1.37 days
};

// ── Moon initial phases (radians) — must match makeMoon phaseMap in nb.config.ts ──
const MOON_INITIAL_PHASES: Record<string, number> = {
  moon:      Math.PI / 2,
  phobos:    0,
  deimos:    Math.PI,
  io:        0,
  europa:    Math.PI / 2,
  ganymede:  Math.PI,
  callisto:  3 * Math.PI / 2,
  titan:     Math.PI / 4,
  enceladus: 3 * Math.PI / 4,
};

// Threshold: if a moon has fewer than this many timesteps per orbit, use analytical angle
const MIN_STEPS_PER_ORBIT = 40;

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
  private followPosition: THREE.Vector3 | null = null; // live rendered position ref
  public followBodyId: string | null = null;            // id resolved each frame via renderables map
  private followBodyZoomed: boolean = false;            // one-shot zoom when switching follow target
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

  public setMaxDistance(d: number): void {
    this.maxDistance = d;
  }

  public setMinDistance(d: number): void {
    this.minDistance = d;
  }

  public getTargetSphericalClone(): THREE.Spherical {
    return this.targetSpherical.clone();
  }

  public setTargetRadius(radius: number): void {
    const clamped = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
    this.targetSpherical.radius = clamped;
  }

  /** Instantly snap current spherical radius to target (bypasses lerp) */
  public snapToTargetRadius(): void {
    this.spherical.radius = this.targetSpherical.radius;
    this.updateCameraPosition();
  }

  public zoomIn(factor: number = 0.8): void {
    this.setTargetRadius(this.targetSpherical.radius * factor);
  }

  public zoomOut(factor: number = 1.2): void {
    this.setTargetRadius(this.targetSpherical.radius * factor);
  }

  setFollowTarget(body: SimulationBody | null): void {
    this.followTarget = body;
    this.followPosition = null;
    this.followBodyId = null;
    if (body) {
      const targetPos = scalePosition(body.position);
      this.targetOffset.copy(targetPos).sub(this.target);
    }
  }

  /** Follow a live rendered position (e.g. interpolatedPosition from RenderableBody).
   *  This is preferred over setFollowTarget for moons/bodies with visual orbit overrides. */
  setFollowRenderPosition(pos: THREE.Vector3 | null, displayRadius?: number): void {
    this.followPosition = pos;
    this.followTarget = null;
    this.followBodyId = null;
    if (pos) {
      // Zoom to a comfortable viewing distance: 8× the display radius or minimum 20
      const viewDist = Math.max(20, (displayRadius ?? 2) * 8);
      this.targetSpherical.radius = viewDist;
    }
  }

  /** Most robust follow: store body ID, resolved to renderable position each frame.
   *  Pass renderables map so we can snap the camera target immediately. */
  setFollowById(bodyId: string | null, renderables?: Map<string, RenderableBody>): void {
    this.followBodyId = bodyId;
    this.followTarget = null;
    this.followPosition = null;
    this.followBodyZoomed = false;

    if (bodyId && renderables) {
      const r = renderables.get(bodyId);
      if (r) {
        // Snap camera target immediately to body's current position — no slow glide across the scene
        this.target.copy(r.interpolatedPosition);
        // Set zoom to a good distance for this body
        this.targetSpherical.radius = Math.max(20, r.displayRadius * 8);
        this.followBodyZoomed = true;
      }
    }
  }

  update(deltaTime: number, renderables?: Map<string, RenderableBody>): void {
    const smoothingFactor = Math.min(0.99, 1 - Math.pow(1 - this.smoothing, deltaTime * 60));

    this.spherical.radius += (this.targetSpherical.radius - this.spherical.radius) * smoothingFactor;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * smoothingFactor;
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * smoothingFactor;

    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));

    if (this.autoRotate && !this.isDragging) {
      this.targetSpherical.theta += this.autoRotateSpeed;
    }

    // Resolve follow target — prefer id-based (most robust), then position ref, then physics body
    if (this.followBodyId && renderables) {
      const r = renderables.get(this.followBodyId);
      if (r) {
        // One-shot zoom the first time we successfully find the renderable
        if (!this.followBodyZoomed) {
          this.target.copy(r.interpolatedPosition);
          this.targetSpherical.radius = Math.max(20, r.displayRadius * 8);
          this.followBodyZoomed = true;
        }
        this.target.lerp(r.interpolatedPosition, Math.min(0.99, smoothingFactor * 2));
      }
    } else if (this.followPosition) {
      // Follow the live rendered position directly (correct for moons with visual orbit overrides)
      this.target.lerp(this.followPosition, Math.min(0.99, smoothingFactor * 2));
    } else if (this.followTarget) {
      const targetPos = scalePosition(this.followTarget.position);
      this.target.lerp(targetPos, Math.min(0.99, smoothingFactor * 2));
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

      this.followTarget = null;
      this.followPosition = null;
      this.followBodyId = null;
      this.followBodyZoomed = false;
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
    this.followPosition = null;
    this.followBodyId = null;
    this.followBodyZoomed = false;
  }

  reset(): void {
    this.target.set(0, 0, 0);
    this.targetSpherical.set(500, Math.PI / 3, 0);
    this.spherical = this.targetSpherical.clone();
    this.followTarget = null;
    this.followPosition = null;
    this.followBodyId = null;
    this.followBodyZoomed = false;
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
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const [xPc, yPc, zPc, mag, bv] = catalog[i];

      // Place stars on a large sphere — direction from real xyz, but normalized
      // so all stars appear at the same distance (they're background)
      const len = Math.sqrt(xPc * xPc + yPc * yPc + zPc * zPc) || 1;
      // HYG xyz: x toward vernal equinox, y toward 90h RA, z toward north pole
      // Map to Three.js: x→x, y→z, z→y (Three.js Y is up)
      positions[i * 3] = (xPc / len) * this.SPHERE_RADIUS;
      positions[i * 3 + 1] = (zPc / len) * this.SPHERE_RADIUS;
      positions[i * 3 + 2] = (yPc / len) * this.SPHERE_RADIUS;

      const col = bvToRGB(bv);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      // Size based on magnitude: brighter = bigger point
      // mag -1.5 (Sirius) → size 5.5; mag 6.5 → size 0.6
      const normMag = Math.max(-1.5, Math.min(6.5, mag));
      sizes[i] = Math.max(0.5, 5.5 - normMag * 0.77);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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
          type: { value: obj.type === 'galaxy' ? 0 : obj.type === 'nebula' ? 1 : 2 }
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

    const positions = new Float32Array(exoplanets.length * 3);
    const brightness = new Float32Array(exoplanets.length);

    exoplanets.forEach((ep, i) => {
      const len = Math.sqrt(ep.x * ep.x + ep.y * ep.y + ep.z * ep.z) || 1;
      positions[i * 3] = (ep.x / len) * this.SPHERE_RADIUS;
      positions[i * 3 + 1] = (ep.z / len) * this.SPHERE_RADIUS;
      positions[i * 3 + 2] = (ep.y / len) * this.SPHERE_RADIUS;
      brightness[i] = 1.0;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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
  private yaw: number = 0;    // horizontal (radians)
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
    this.camera.far = 200000;
    this.camera.updateProjectionMatrix();
  }

  handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };
  }

  handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouse.x;
    const dy = e.clientY - this.lastMouse.y;
    this.yaw -= dx * this.rotateSpeed;
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
      distAU = Math.sqrt(dx * dx + dy * dy + dz * dz) / 1.496e11;
    }
    // Speed in km/s
    const speedKms = Math.sqrt(
      body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2
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
  simulationTime = 0,
  onCameraUpdate,
  onBodyClick,
  onBackgroundClick,
  onGalaxyModeChange,
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
  const realStarfieldRef = useRef<RealStarfield | null>(null);
  const milkyWayRef = useRef<MilkyWayDome | null>(null);
  const deepSkyRef = useRef<DeepSkyObjects | null>(null);
  const exoplanetsRef = useRef<ExoplanetMarkers | null>(null);
  const asteroidBeltRef = useRef<THREE.InstancedMesh | null>(null);
  const galaxyRendererRef = useRef<GalaxyRenderer | null>(null);

  // First-person mode
  const fpControllerRef = useRef<FirstPersonCameraController | null>(null);
  const fpStateRef = useRef<{ active: boolean; bodyId: string | null }>({ active: false, bodyId: null });
  const [fpActive, setFpActive] = useState(false);
  const [fpHUD, setFpHUD] = useState<FPHUDData | null>(null);
  const bodiesRef = useRef<SimulationBody[]>(bodies);
  const simulationTimeRef = useRef<number>(simulationTime);
  // Per-moon visual angle (radians) — advanced each update at a capped real-time rate
  // so fast moons (Phobos ~7.65h) never spin like electrons on screen.
  const moonVisualAnglesRef = useRef<Map<string, number>>(new Map());
  const lastBodyUpdateTimeRef = useRef<number>(performance.now());
  // Max visual angular speed: one full orbit takes at least 12 real-world seconds
  const MAX_VISUAL_RAD_PER_SECOND = (Math.PI * 2) / 12;
  // Track previous galaxy mode to only apply camera changes on transition
  const wasGalaxyModeRef = useRef<boolean>(false);

  // Keep simulationTimeRef in sync each render
  useEffect(() => {
    simulationTimeRef.current = simulationTime;
  }, [simulationTime]);

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

    // ── Asteroid belt ─────────────────────────────────────────────────────────
    // Visual-only instanced mesh — no physics. 2000 rocks in a torus between
    // Mars (1.52 AU) and Jupiter (5.2 AU), concentrated around 2.7 AU.
    // SCALE_FACTOR = 1e-9 → 1 AU = 1.496e11 * 1e-9 = 149.6 scene units
    {
      const AU_SCENE = 1.496e11 * SCALE_FACTOR; // 149.6 scene units per AU
      const BELT_COUNT = 2000;
      const geo = new THREE.IcosahedronGeometry(0.12, 0);
      const mat = new THREE.MeshLambertMaterial({ color: 0x7a6a58 });
      const belt = new THREE.InstancedMesh(geo, mat, BELT_COUNT);
      belt.castShadow = false;
      belt.receiveShadow = false;

      const dummy = new THREE.Object3D();
      const rng = (min: number, max: number) => min + Math.random() * (max - min);

      for (let i = 0; i < BELT_COUNT; i++) {
        // Radial distance: concentrated near 2.7 AU, tapering to 2.0–3.3 AU
        const u = Math.random();
        const radAU = 2.0 + 1.3 * (u * u * (3 - 2 * u)); // smooth-stepped bias to center
        const rad = radAU * AU_SCENE;

        const angle = Math.random() * Math.PI * 2;
        // Slight vertical scatter (belt is ~10° thick in reality)
        const yScatter = (Math.random() - 0.5) * rad * 0.09;

        dummy.position.set(
          Math.cos(angle) * rad,
          yScatter,
          Math.sin(angle) * rad
        );
        // Random scale: most are tiny, a few are bigger (Ceres-like)
        const scale = rng(0.15, 1.0) * (Math.random() < 0.02 ? 3.5 : 1.0);
        dummy.scale.setScalar(scale);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.updateMatrix();
        belt.setMatrixAt(i, dummy.matrix);

        // Vary color: grey-brown to reddish
        const r = rng(0.42, 0.62), g = rng(0.36, 0.50), b = rng(0.28, 0.38);
        belt.setColorAt(i, new THREE.Color(r, g, b));
      }
      belt.instanceMatrix.needsUpdate = true;
      if (belt.instanceColor) belt.instanceColor.needsUpdate = true;

      scene.add(belt);
      asteroidBeltRef.current = belt;
    }

    // ── Galaxy renderer ────────────────────────────────────────────────────────
    // Visual-only spiral galaxy, activated when bodies contain 'central-blackhole'.
    // Hidden by default (solar system mode). Visibility toggled in the bodies effect.
    {
      const galaxyRenderer = new GalaxyRenderer(scene);
      galaxyRenderer.group.visible = false;
      galaxyRendererRef.current = galaxyRenderer;
    }

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
      if (asteroidBeltRef.current) {
        asteroidBeltRef.current.geometry.dispose();
        (asteroidBeltRef.current.material as THREE.Material).dispose();
        asteroidBeltRef.current = null;
      }
      galaxyRendererRef.current?.dispose();
      galaxyRendererRef.current = null;
    };
  }, [containerRef, config.showPotentialWells]);

  // Initialize on mount
  useEffect(() => {
    const cleanup = initializeRenderer();
    return cleanup;
  }, [initializeRenderer]);

  // Handle window resize — reads from ref so no renderingState dep needed
  useEffect(() => {
    const handleResize = () => {
      const rs = renderingStateRef.current;
      if (!containerRef.current || !rs.camera || !rs.renderer) return;

      const rect = containerRef.current.getBoundingClientRect();
      rs.camera.aspect = rect.width / rect.height;
      rs.camera.updateProjectionMatrix();
      rs.renderer.setSize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]); // renderingStateRef is a stable ref — no dep needed

  // Update renderable bodies — reads Three.js objects from ref, never from state.
  // This is the OOP rule: mutable singletons live in refs, not in React state.
  // Removing renderingState from the dep array breaks the infinite setState loop.
  useEffect(() => {
    const rs = renderingStateRef.current;
    if (!rs.scene || !rs.isInitialized || !rs.camera) return;

    // Narrow once for TypeScript
    const scene = rs.scene!;
    const camera = rs.camera!;

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

    // Galaxy mode: show galaxy renderer + hide solar-system-specific objects
    const isGalaxyMode = bodies.some(b => b.id === 'central-blackhole');
    if (galaxyRendererRef.current) {
      galaxyRendererRef.current.group.visible = isGalaxyMode;
    }
    // Objects that belong to solar system view only
    if (asteroidBeltRef.current)   asteroidBeltRef.current.visible   = !isGalaxyMode;
    if (realStarfieldRef.current)  realStarfieldRef.current.getPoints().visible  = !isGalaxyMode;
    if (milkyWayRef.current)       milkyWayRef.current.getMesh().visible          = !isGalaxyMode;
    if (deepSkyRef.current)        deepSkyRef.current.getGroup().visible           = !isGalaxyMode;
    if (exoplanetsRef.current)     exoplanetsRef.current.getGroup().visible        = !isGalaxyMode;

    // Camera + fog — only apply changes on mode transition
    const modeChanged = isGalaxyMode !== wasGalaxyModeRef.current;
    if (modeChanged && camera && cameraControllerRef.current && sceneRef.current) {
      wasGalaxyModeRef.current = isGalaxyMode;
      if (isGalaxyMode) {
        // Galaxy world: disable fog, extend clip planes, pull camera out
        sceneRef.current.fog = null;
        camera.far  = 2000000;
        camera.near = 10;
        cameraControllerRef.current.setMaxDistance(450000);
        cameraControllerRef.current.setMinDistance(500);
        cameraControllerRef.current.setTargetRadius(200000);
        cameraControllerRef.current.snapToTargetRadius();
      } else {
        // Solar system world: restore fog + intimate camera limits
        sceneRef.current.fog = new THREE.FogExp2(0x000511, 0.00015);
        camera.far  = 10000;
        camera.near = 0.1;
        cameraControllerRef.current.setMaxDistance(10000);
        cameraControllerRef.current.setMinDistance(10);
        cameraControllerRef.current.setTargetRadius(500);
        cameraControllerRef.current.snapToTargetRadius();
      }
      camera.updateProjectionMatrix();
      // Notify parent so it can pause/resume the physics loop
      onGalaxyModeChange?.(isGalaxyMode);
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

    // Build quick lookups (avoid O(n) finds inside the per-body loop)
    const bodyScaledPositions = new Map<string, THREE.Vector3>();
    const bodyById = new Map<string, SimulationBody>();
    for (const body of bodies) {
      bodyScaledPositions.set(body.id, scalePosition(body.position));
      bodyById.set(body.id, body);
    }

    // Real-time delta for capping visual moon orbit speed
    const nowMs = performance.now();
    const realDeltaSec = Math.min((nowMs - lastBodyUpdateTimeRef.current) / 1000, 0.1);
    lastBodyUpdateTimeRef.current = nowMs;

    // Add or update bodies
    for (const body of bodies) {
      let renderable = renderableBodies.get(body.id);

      // Raw physics-scaled position
      const rawScaledPosition = bodyScaledPositions.get(body.id)!;

      // Guard against NaN physics positions (can happen on first frame)
      const rawIsValid = isFinite(rawScaledPosition.x) && isFinite(rawScaledPosition.y) && isFinite(rawScaledPosition.z);
      let scaledPosition = rawIsValid ? rawScaledPosition.clone() : new THREE.Vector3(0, 0, 0);

      if (body.type === 'moon' && body.parentId) {
        const parentRawPos = bodyScaledPositions.get(body.parentId);
        if (parentRawPos && isFinite(parentRawPos.x)) {
          const moonKey = body.id.toLowerCase();
          const parentBody = bodyById.get(body.parentId!);
          const parentDisplayR = parentBody ? getBodyScale(parentBody) : 2;
          const moonDisplayR = getBodyScale(body);
          const fallbackR = parentDisplayR * 3.0 + moonDisplayR * 2;
          const visualR = VISUAL_ORBIT_RADII[moonKey] ?? fallbackR;

          let dir: THREE.Vector3;

          const period = MOON_ORBITAL_PERIODS[moonKey];
          const timeStep = 3600;
          const stepsPerOrbit = period ? period / timeStep : Infinity;

          if (period && stepsPerOrbit < MIN_STEPS_PER_ORBIT) {
            // Rate-limited visual orbit for fast moons (Phobos, Deimos, Enceladus).
            // We don't tie the visual angle to sim time — that makes Phobos spin like an
            // electron at any meaningful speed. Instead we advance by a fixed pleasant
            // angular rate (MAX_VISUAL_RAD_PER_SECOND) every real-wall-clock second.
            // One full visual orbit ≈ 12 real seconds regardless of simulation speed.
            const initialPhase = MOON_INITIAL_PHASES[moonKey] ?? 0;

            if (!moonVisualAnglesRef.current.has(moonKey)) {
              // Seed phase from sim time on first frame so it starts at the right position
              const seedAngle = (simulationTimeRef.current / period) * Math.PI * 2 + initialPhase;
              moonVisualAnglesRef.current.set(moonKey, seedAngle % (Math.PI * 2));
            }

            const currentAngle = moonVisualAnglesRef.current.get(moonKey)!;
            const newAngle = (currentAngle + MAX_VISUAL_RAD_PER_SECOND * realDeltaSec) % (Math.PI * 2);
            moonVisualAnglesRef.current.set(moonKey, newAngle);

            dir = new THREE.Vector3(Math.cos(newAngle), 0, Math.sin(newAngle));
          } else {
            // Physics direction — well-resolved moons use actual N-body position
            const moonDir = scaledPosition.clone().sub(parentRawPos);
            const moonDist = moonDir.length();
            if (moonDist > 0.0001 && isFinite(moonDir.x) && isFinite(moonDir.y) && isFinite(moonDir.z)) {
              dir = moonDir.normalize();
            } else {
              // Fallback: distribute by body id hash so moons don't stack
              const angle = (body.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 1.618) % (Math.PI * 2);
              dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
            }
          }

          scaledPosition = parentRawPos.clone().add(dir.multiplyScalar(visualR));
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
          const uv = ringGeo.attributes.uv;
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

        // Position update — moons use visual orbit override so snap directly (no lerp drift)
        if (body.type === 'moon') {
          renderable.interpolatedPosition.copy(scaledPosition);
        } else {
          renderable.interpolatedPosition.lerp(scaledPosition, 0.2);
        }
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

  // renderingState intentionally excluded: Three.js objects are mutable singletons
  // that live in renderingStateRef. Adding renderingState here caused an infinite
  // setState loop because every setRenderingState call triggered this effect again.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodies, selectedBodies, config, onGalaxyModeChange]);

  // Mouse interaction — reads from ref, no renderingState dep
  const handleMouseClick = useCallback((event: MouseEvent) => {
    const rs = renderingStateRef.current;
    if (!rs.camera || !rs.scene || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, rs.camera);

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
  }, [containerRef, onBodyClick, onBackgroundClick]); // renderingStateRef is stable

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
  }, [containerRef, handleMouseClick]); // renderingState removed — controller is a stable ref

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
      cameraControllerRef.current?.update(deltaTime, renderableBodiersRef.current);
    }

    // Update spacetime grid
    spacetimeGridRef.current?.update(deltaTime);

    // Update universe background animations
    milkyWayRef.current?.update(deltaTime);
    exoplanetsRef.current?.update(clockRef.current.getElapsedTime());
    if (renderingStateRef.current.camera) {
      deepSkyRef.current?.updateBillboards(renderingStateRef.current.camera);
    }
    if (galaxyRendererRef.current?.group.visible) {
      galaxyRendererRef.current.update(deltaTime, state.camera);
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

  // Animation loop — starts once on mount after init, never restarts on FPS ticks.
  // We use renderingStateRef.current.isInitialized (ref read, not state dep) inside
  // the render callback itself. The effect only re-runs if `render` identity changes.
  useEffect(() => {
    // Don't start if renderer isn't ready yet — render() guards internally
    let started = false;
    const tryStart = () => {
      if (renderingStateRef.current.isInitialized && !started) {
        started = true;
        const animate = () => {
          render();
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
      }
    };

    // Poll briefly until initialized (avoids adding renderingState to deps)
    tryStart();
    const poll = setInterval(() => {
      if (renderingStateRef.current.isInitialized) {
        clearInterval(poll);
        tryStart();
      }
    }, 50);

    return () => {
      clearInterval(poll);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [render]); // Only re-run if render callback changes (it won't — it's stable)

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
    // Pass renderables map so we can snap immediately to the body's current rendered position
    cameraControllerRef.current?.setFollowById(bodyId, renderableBodiersRef.current);
  }, []);

  const zoomToFit = useCallback(() => {
    cameraControllerRef.current?.zoomToFit(bodies);
  }, [bodies]);

  const getCameraInfo = useCallback(() => {
    return cameraControllerRef.current?.getInfo() || null;
  }, []);

  const resetCamera = useCallback(() => {
    cameraControllerRef.current?.reset();
  }, []);

  // Jump camera to a specific orbital radius (used by galaxy POI navigation)
  const snapToRadius = useCallback((radius: number) => {
    const ctrl = cameraControllerRef.current;
    if (!ctrl) return;
    ctrl.setMaxDistance(Math.max(radius * 2, 450000));
    ctrl.setTargetRadius(radius);
    ctrl.snapToTargetRadius();
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
    snapToRadius,
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