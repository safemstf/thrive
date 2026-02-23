// src/components/cs/nb/nb.shaders.tsx
// Extracted shader code from nb.rendering.tsx
// Contains all GLSL shaders and procedural planet/moon material factories

import * as THREE from 'three';
import { SimulationBody } from './nb.logic';

// ===== IMPROVED SHADERS =====

export const REALISTIC_STAR_VERTEX_SHADER = `
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

export const REALISTIC_STAR_FRAGMENT_SHADER = `
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

export const IMPROVED_ATMOSPHERE_FRAGMENT_SHADER = `
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

export function createStarCoronaMesh(displayRadius: number, starColor: THREE.Color): THREE.Mesh {
  // Large billboard plane that always faces the camera (updated each frame)
  // Size: 8× the star's display radius so corona extends well beyond the disc
  const coronaSize = displayRadius * 10.0;
  const geometry = new THREE.PlaneGeometry(coronaSize, coronaSize);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      starColor: { value: starColor.clone() },
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

        float edgeFade = 1.0 - smoothstep(0.25, 0.75, r);
        coronaIntensity *= edgeFade;

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
export function createSaturnRingMaterial(): THREE.ShaderMaterial {
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
      float NdotL = dot(n, lightDir);
      // Soft diffuse with some backscatter for the dusty regolith look
      float diffuse = max(0.0, NdotL);
      float ambient = 0.09; // Earthshine keeps the dark side visible

      float lat = asin(clamp(vPosition.y,-1.0,1.0));
      float lon = atan(vPosition.z, vPosition.x);
      vec2 sph = vec2(lon/6.28318+0.5, lat/3.14159+0.5);

      // Multi-scale noise for varied terrain
      float mare      = fbm(sph * 3.5);
      float highland  = fbm(sph * 9.0 + vec2(1.3, 0.7));
      float craterBig = fbm(sph * 18.0 + vec2(0.5, 2.1));
      float craterSml = fbm(sph * 42.0 + vec2(3.1, 1.4));

      vec3 basaltGrey  = vec3(0.22, 0.21, 0.20); // Dark mare basalt
      vec3 regolithTan = vec3(0.60, 0.58, 0.54); // Mid-tone highland regolith
      vec3 brightEject = vec3(0.88, 0.86, 0.82); // Fresh crater ejecta

      // Blend mare patches with highland
      float isMare = smoothstep(0.44, 0.52, mare);
      vec3 col = mix(regolithTan, basaltGrey, isMare);

      // Add bright crater rays / ejecta blankets
      float craterMask = smoothstep(0.60, 0.80, craterBig) * 0.5
                       + smoothstep(0.68, 0.88, craterSml) * 0.35;
      col = mix(col, brightEject, craterMask);

      // Subtle highland brightening
      col = mix(col, col * 1.18, smoothstep(0.55, 0.78, highland) * (1.0 - isMare) * 0.35);

      // Terminator enhancement — slight warm tint at grazing angle
      float terminator = smoothstep(0.0, 0.18, diffuse) * (1.0 - smoothstep(0.18, 0.35, diffuse));
      col = mix(col, col * vec3(1.05, 0.98, 0.92), terminator * 0.4);

      // Final lighting — regolith has a slight retroreflective boost at full phase
      float retroRef = max(0.0, NdotL) * max(0.0, NdotL); // exaggerates highlights at phase angle
      vec3 finalColor = col * (diffuse * 0.88 + retroRef * 0.12 + ambient);

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
export const createBodyMaterial = (body: SimulationBody, quality: string): THREE.Material => {
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
  if (id === 'earth') return createEarthMaterial();
  if (id === 'mars') return createMarsMaterial();
  if (id === 'venus') return createVenusMaterial();
  if (id === 'jupiter') return createJupiterMaterial();
  if (id === 'saturn') return createSaturnMaterial();
  if (id === 'uranus') return createUranusMaterial();
  if (id === 'neptune') return createNeptuneMaterial();
  if (id === 'mercury') return createMercuryMaterial();

  // Moon-specific shaders
  if (id === 'moon') return createMoonMaterial();
  if (id === 'io') return createIoMaterial();
  if (id === 'europa') return createEuropaMaterial();
  if (id === 'titan') return createTitanMaterial();
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

// ============================================================
// GALAXY RENDERER — NASA-ACCURATE MILKY WAY
// ============================================================
// Structural facts:
//  • 2 MAJOR arms : Perseus (0°) and Scutum-Centaurus (180°)
//  • 2 minor arms : Sagittarius (80°) and Norma (260°)
//  • Orion Spur   : our home, ~20° from Perseus at r≈26 kly
//  • Pitch angle  : ~12.5° → winding constant WIND ≈ 4.38
//  • Flat rotation curve — GPU vertex shader handles all 80k stars
//  • Disk glow GLSL: 2 bright + 2 dim arms + Orion spur + correct pitch
//  • Background: Andromeda (M31), LMC, SMC, distant galaxies
// ============================================================
export class GalaxyRenderer {
  public  group:          THREE.Group;
  private starsMesh:      THREE.Points;   // 80k stars, GPU-animated
  private hiiMesh:        THREE.Points;   // H-II nebulae (Hα / OIII / SII)
  private dustMesh:       THREE.Points;   // dark dust & ISM clouds
  private globularMesh:   THREE.Points;   // 150 globular clusters
  private coreMesh:       THREE.Mesh;     // nuclear bulge halo billboard
  private barMesh:        THREE.Mesh;     // central bar ellipsoid
  private coreBillboard:  THREE.Mesh;     // Sgr A* glow billboard
  private diskGlowMesh:   THREE.Mesh;     // full-disk spiral glow plane
  private bgGalaxyMesh:     THREE.Points;   // Andromeda, Magellanic Clouds, etc.
  private cosmicDustMesh:   THREE.Points;   // Background star/dust field (like solar system bg)
  private cosmicDomeMesh:   THREE.Mesh;     // Inside-facing background sphere — wraps viewer in deep space
  private youAreHereMesh!:  THREE.Mesh;     // "You Are Here" — Orion Spur marker
  private habitableMesh:    THREE.Points | null = null; // Earth-like world markers
  private time = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();

    // ── Constants (scene units ≈ light-years in galaxy mode) ─────────────────
    const GR    = 130000;   // galaxy outer radius
    const BAR_R = 27000;    // central bar half-length
    const BUL_R = 12000;    // bulge radius
    const COR_R = 3000;     // nuclear star cluster radius
    const DISK_H = 1500;    // thin disk half-height
    const TDISK_H = 5000;   // thick disk half-height
    const HALO_R = 200000;  // globular cluster halo extent
    const SUN_R  = 26000;   // Sun's galactocentric radius

    // Flat rotation curve
    const V_FLAT = 0.015;               // scene-units/sec
    const OM_IN  = V_FLAT / BAR_R;      // solid-body angular speed inside bar

    // Logarithmic spiral: θ(r) = startAngle + WIND·ln(r/BAR_R)
    // pitch angle 12.5° → WIND = 1/tan(77.5°) * (2π / ln(GR/BAR_R ... actually cot)
    // cot(12.5°) ≈ 4.51, empirically tuned to 4.38 for visual MW match
    const WIND = 4.38;
    const th = (r: number, start: number) =>
      start + WIND * Math.log(Math.max(r, BAR_R) / BAR_R);

    // Named arm start angles (where they exit the bar tips)
    const PER = 0.0;                    // Perseus         — major
    const SCU = Math.PI;                // Scutum-Centaurus — major
    const SAG = Math.PI * 0.44;         // Sagittarius      — minor (~80°)
    const NOR = Math.PI * 1.44;         // Norma            — minor (~260°)
    const ORI = Math.PI * 0.11;         // Orion Spur start (~20°)

    const rng = Math.random.bind(Math);

    // ── Reusable GLSL helpers ─────────────────────────────────────────────────
    // GPU-side differential rotation: orbit data stored as vertex attributes
    // [aRadius, aOmega, aTheta0, aY] → position recomputed each frame via time uniform
    const STAR_VERT = `
      attribute float aRadius;   // galactocentric radius
      attribute float aOmega;    // angular velocity (rad/s)
      attribute float aTheta0;   // initial angle
      attribute float aY;        // vertical position (fixed)
      attribute float size;
      attribute vec3  aColor;
      varying   vec3  vColor;
      varying   float vAlpha;
      uniform   float time;
      uniform   float timeScale; // speed-up factor for visible rotation (~10000)
      uniform   float alpha;     // LOD fade [0,1]

      void main() {
        vColor = aColor;
        vAlpha = alpha;
        float theta = aTheta0 + aOmega * time * timeScale;
        vec3  pos   = vec3(cos(theta)*aRadius, aY, sin(theta)*aRadius);
        vec4  mv    = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = clamp(size * projectionMatrix[1][1] / (-mv.z) * 380.0, 1.5, 11.0);
        gl_Position  = projectionMatrix * mv;
      }
    `;
    const STAR_FRAG = `
      varying vec3  vColor;
      varying float vAlpha;
      void main() {
        vec2  p = gl_PointCoord - 0.5;
        float r = length(p);
        if (r > 0.5) discard;
        float spike = exp(-r*r*30.0);
        float halo  = exp(-r*r* 6.5) * 0.55;
        float a     = clamp((spike+halo)*1.6, 0.0, 1.0);
        gl_FragColor = vec4(vColor + vColor*spike*0.9, a * vAlpha);
      }
    `;
    // Static point vert (nebulae, dust, globulars, background — not animated)
    const mkVert = (mn: string, mx: string, K = '360.0') => `
      attribute float size;
      varying   vec3  vColor;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(size * projectionMatrix[1][1] / (-mv.z) * ${K}, ${mn}, ${mx});
        gl_Position  = projectionMatrix * mv;
      }
    `;
    const NEBULA_FRAG = `
      varying vec3  vColor;
      uniform float alpha;
      void main() {
        vec2  p = gl_PointCoord - 0.5;
        float r = length(p);
        if (r > 0.5) discard;
        // Soft outer glow + brighter inner core — looks like real emission nebula
        float outer = exp(-r*r*1.8) * 0.50;
        float inner = exp(-r*r*6.5) * 0.35;
        float a = outer + inner;
        gl_FragColor = vec4(vColor, a * alpha);
      }
    `;
    const mkMat = (vert: string, frag: string, extra: object = {}) =>
      new THREE.ShaderMaterial({
        uniforms: { alpha: { value: 1.0 } },
        ...extra,
        vertexShader: vert, fragmentShader: frag,
        vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });

    // ── helper: place a star on a named arm ──────────────────────────────────
    type ArmDef = { start: number; major: boolean };
    const placeOnArm = (rad: number, arm: ArmDef, spreadMult = 1.0) => {
      const base   = th(rad, arm.start);
      const armF   = Math.min((rad - BUL_R) / (GR - BUL_R), 1.0);
      // Major arms tighter, minor looser
      const spread = (arm.major ? 0.28 : 0.55) * spreadMult * (0.12 + 0.88 * armF);
      return base + (rng() - 0.5) * spread * Math.PI * 2;
    };

    // =========================================================
    // 1. STELLAR DISK + BULGE  (80,000 stars, GPU-animated)
    // =========================================================
    const SC = 80000;
    // GPU attributes (not interleaved — Three.js requires separate buffers)
    const aR   = new Float32Array(SC);   // radius
    const aOm  = new Float32Array(SC);   // omega
    const aTh0 = new Float32Array(SC);   // theta0
    const aY   = new Float32Array(SC);   // y (fixed)
    const aSz  = new Float32Array(SC);   // point size
    const aCo  = new Float32Array(SC*3); // RGB colour

    // Arm pool: assign each disk star to one arm
    const ARMS: ArmDef[] = [
      { start: PER, major: true  },   // Perseus
      { start: SCU, major: true  },   // Scutum-Centaurus
      { start: SAG, major: false },   // Sagittarius
      { start: NOR, major: false },   // Norma
    ];

    for (let i = 0; i < SC; i++) {
      const isBulge    = i < SC * 0.20;
      const isThick    = !isBulge && rng() < 0.09;
      const isOrion    = !isBulge && !isThick && rng() < 0.07; // Orion Spur stars
      let   rad: number, thetaFinal: number, yFinal: number;

      if (isBulge) {
        // Boxy peanut bulge — random angles, concentrated radially
        rad        = COR_R * 0.5 + BUL_R * 1.3 * Math.pow(rng(), 0.42);
        thetaFinal = rng() * Math.PI * 2;
        yFinal     = (rng()-0.5) * DISK_H * 4.5 * Math.exp(-rad / BUL_R);
      } else if (isOrion) {
        // Orion Spur: short stub at r=SUN_R±8000, near Perseus, 20° offset
        rad        = SUN_R * 0.70 + SUN_R * 0.60 * Math.pow(rng(), 1.3);
        thetaFinal = th(rad, ORI) + (rng()-0.5) * 0.55;
        yFinal     = (rng()-0.5) * DISK_H * 1.4;
      } else {
        // Disk star on one of the four arms
        rad        = BUL_R * 0.55 + (GR - BUL_R) * Math.pow(rng(), 1.2);
        const arm  = ARMS[Math.floor(rng() * ARMS.length)];
        thetaFinal = placeOnArm(rad, arm);
        yFinal     = isThick
          ? (rng()-0.5) * TDISK_H * 2
          : (rng()-0.5) * DISK_H  * 2 * Math.max(0.03, 1 - rad/GR);
      }

      const omega = rad < BAR_R ? OM_IN : V_FLAT / Math.max(rad, 1);
      aR[i]    = rad;
      aOm[i]   = omega;
      aTh0[i]  = thetaFinal;
      aY[i]    = yFinal;

      // Colour by stellar population
      const cF  = Math.exp(-rad / (BUL_R * 1.5)); // core fraction
      const rv  = rng();
      let   sr: number, sg: number, sb: number;

      if (isBulge || cF > 0.38) {
        // Old bulge giants: warm yellow-orange
        sr = 1.0;  sg = 0.68+0.22*rng(); sb = 0.18+0.22*rng();
      } else if (isThick) {
        sr = 1.0;  sg = 0.60+0.24*rng(); sb = 0.14+0.18*rng();
      } else if (isOrion) {
        // Orion Spur has young blue-white OB clusters visible from Earth
        const ov = rng();
        if (ov < 0.35) { sr=0.55+0.15*rng(); sg=0.75+0.18*rng(); sb=1.0; }
        else if (ov < 0.65) { sr=0.88+0.10*rng(); sg=0.92+0.07*rng(); sb=1.0; }
        else { sr=1.0; sg=0.92+0.07*rng(); sb=0.70+0.20*rng(); }
      } else if (rv < 0.06) {
        sr = 0.50+0.18*rng(); sg = 0.70+0.22*rng(); sb = 1.0;    // OB supergiants
      } else if (rv < 0.18) {
        sr = 0.82+0.14*rng(); sg = 0.90+0.08*rng(); sb = 1.0;    // A-type
      } else if (rv < 0.42) {
        sr = 1.0; sg = 0.92+0.07*rng(); sb = 0.70+0.20*rng();   // G solar
      } else if (rv < 0.68) {
        sr = 1.0; sg = 0.54+0.22*rng(); sb = 0.09+0.12*rng();   // K orange
      } else {
        sr = 1.0; sg = 0.20+0.16*rng(); sb = 0.04+0.08*rng();   // M red
      }
      aCo[i*3]=sr; aCo[i*3+1]=sg; aCo[i*3+2]=sb;

      // Point size
      aSz[i] = isBulge || cF > 0.38
        ? 1200+rng()*2500
        : (rv < 0.18 || isOrion)
          ? 900+rng()*1500
          : 350+rng()*900;
    }

    // Build geometry with custom attributes
    const starGeo = new THREE.BufferGeometry();
    // Dummy position buffer (GPU shader ignores it, uses aRadius/aTheta0/aY)
    starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SC*3), 3));
    starGeo.setAttribute('aRadius',  new THREE.BufferAttribute(aR,   1));
    starGeo.setAttribute('aOmega',   new THREE.BufferAttribute(aOm,  1));
    starGeo.setAttribute('aTheta0',  new THREE.BufferAttribute(aTh0, 1));
    starGeo.setAttribute('aY',       new THREE.BufferAttribute(aY,   1));
    starGeo.setAttribute('size',     new THREE.BufferAttribute(aSz,  1));
    starGeo.setAttribute('aColor',   new THREE.BufferAttribute(aCo,  3));

    // ── Habitable Star Catalog ────────────────────────────────────────────
    // ~9% of thin-disk G/K stars host Earth-like planets (Kepler statistics)
    // Collect their orbital data to build a separate pulsing green mesh
    {
      const habR: number[] = [], habOm: number[] = [], habTh0: number[] = [];
      const habY: number[] = [], habSz: number[] = [];
      for (let i = SC * 0.20 | 0; i < SC; i++) { // skip bulge (first 20%)
        const rv_i = aCo[i*3+1]; // reuse G-band: G-type ~= green high, K ~= mid
        // Identify G/K by stored colours: G has sg>0.85, K has sg in 0.54-0.76
        const sg = aCo[i*3+1], sb = aCo[i*3+2];
        const isGK = (sg > 0.85 && sb > 0.60 && sb < 0.92) ||  // G solar
                     (sg > 0.52 && sg < 0.78 && sb < 0.25);    // K orange
        if (isGK && rng() < 0.094) {
          habR.push(aR[i]); habOm.push(aOm[i]); habTh0.push(aTh0[i]);
          habY.push(aY[i]);  habSz.push(750 + rng()*600);
        }
      }
      const HC = habR.length;
      if (HC > 0) {
        const hbR   = new Float32Array(habR);
        const hbOm  = new Float32Array(habOm);
        const hbTh0 = new Float32Array(habTh0);
        const hbY   = new Float32Array(habY);
        const hbSz  = new Float32Array(habSz);
        const hbCol = new Float32Array(HC * 3);
        for (let i = 0; i < HC; i++) {
          // Teal-green glow: approx 0.15 R, 0.85 G, 0.65 B
          hbCol[i*3]=0.15; hbCol[i*3+1]=0.85; hbCol[i*3+2]=0.65;
        }

        const HAB_FRAG = `
          varying vec3  vColor;
          varying float vAlpha;
          uniform float time;
          void main() {
            vec2  p = gl_PointCoord - 0.5;
            float r = length(p);
            if (r > 0.5) discard;
            float pulse  = 0.65 + 0.35 * sin(time * 3.5);
            float core   = exp(-r*r*22.0);
            float halo   = exp(-r*r* 4.5) * 0.55;
            float a      = clamp((core+halo)*1.5*pulse, 0.0, 1.0);
            gl_FragColor = vec4(vColor, a * vAlpha);
          }
        `;

        const habGeo = new THREE.BufferGeometry();
        habGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HC*3), 3));
        habGeo.setAttribute('aRadius',  new THREE.BufferAttribute(hbR,   1));
        habGeo.setAttribute('aOmega',   new THREE.BufferAttribute(hbOm,  1));
        habGeo.setAttribute('aTheta0',  new THREE.BufferAttribute(hbTh0, 1));
        habGeo.setAttribute('aY',       new THREE.BufferAttribute(hbY,   1));
        habGeo.setAttribute('size',     new THREE.BufferAttribute(hbSz,  1));
        habGeo.setAttribute('aColor',   new THREE.BufferAttribute(hbCol, 3));

        this.habitableMesh = new THREE.Points(habGeo,
          new THREE.ShaderMaterial({
            uniforms: {
              time:      { value: 0 },
              timeScale: { value: 8000.0 },
              alpha:     { value: 0.0 }, // starts invisible, LOD fades in
            },
            vertexShader:   STAR_VERT,
            fragmentShader: HAB_FRAG,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
      }
    }

    this.starsMesh = new THREE.Points(starGeo,
      new THREE.ShaderMaterial({
        uniforms: {
          time:      { value: 0 },
          timeScale: { value: 8000.0 }, // 8000x speed-up → visible differential rotation
          alpha:     { value: 1.0 },
        },
        vertexShader: STAR_VERT,
        fragmentShader: STAR_FRAG,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );

    // =========================================================
    // 2. H-II EMISSION NEBULAE (10,000 — tight to major arms)
    // Real examples: Carina, Eagle, Lagoon, Orion, Omega, Rosette
    // =========================================================
    const HN = 10000;
    const hPos = new Float32Array(HN*3);
    const hCol = new Float32Array(HN*3);
    const hSz  = new Float32Array(HN);

    // Named H-II concentrations (angle ranges along arms)
    for (let i = 0; i < HN; i++) {
      const rad  = BUL_R*0.45 + GR*0.76 * Math.pow(rng(), 1.12);
      // 60% on major arms, 40% on minor (matching real MW H-II distribution)
      const arm  = rng() < 0.60 ? ARMS[Math.floor(rng()*2)] : ARMS[2 + Math.floor(rng()*2)];
      const ang  = placeOnArm(rad, arm, 0.55);
      hPos[i*3]   = Math.cos(ang) * rad;
      hPos[i*3+1] = (rng()-0.5) * DISK_H * 0.7;
      hPos[i*3+2] = Math.sin(ang) * rad;

      const t = rng();
      if (t < 0.52) {
        // Hα — dominant, vivid pink-red
        hCol[i*3]=1.0; hCol[i*3+1]=0.12+0.14*rng(); hCol[i*3+2]=0.25+0.22*rng();
      } else if (t < 0.76) {
        // OIII — teal-blue
        hCol[i*3]=0.06+0.10*rng(); hCol[i*3+1]=0.72+0.20*rng(); hCol[i*3+2]=0.90+0.10*rng();
      } else {
        // SII — amber-orange
        hCol[i*3]=0.95+0.05*rng(); hCol[i*3+1]=0.44+0.22*rng(); hCol[i*3+2]=0.04+0.08*rng();
      }
      hSz[i] = 3000 + rng() * 10000;
    }
    const hGeo = new THREE.BufferGeometry();
    hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    hGeo.setAttribute('color',    new THREE.BufferAttribute(hCol, 3));
    hGeo.setAttribute('size',     new THREE.BufferAttribute(hSz,  1));
    this.hiiMesh = new THREE.Points(hGeo, mkMat(mkVert('4.0','90.0','420.0'), NEBULA_FRAG));

    // =========================================================
    // 3. DUST LANES (18,000 — between arms, dark absorption clouds)
    // =========================================================
    const DN = 18000;
    const dPos = new Float32Array(DN*3);
    const dCol = new Float32Array(DN*3);
    const dSz  = new Float32Array(DN);

    for (let i = 0; i < DN; i++) {
      const rad = BUL_R*0.20 + GR*0.70 * Math.pow(rng(), 0.98);
      const arm = ARMS[Math.floor(rng() * ARMS.length)];
      const base = th(rad, arm.start);
      // Dust lanes sit ½-arm-width between arms: offset by π/4 (half of 4-arm spacing)
      const interOffset = (Math.PI / ARMS.length) * (0.45 + 0.55*rng());
      const ang = base + interOffset + (rng()-0.5)*0.80;
      dPos[i*3]   = Math.cos(ang) * rad;
      dPos[i*3+1] = (rng()-0.5) * DISK_H * 1.5;
      dPos[i*3+2] = Math.sin(ang) * rad;

      const dt = rng();
      if (dt < 0.42) {
        // Dense molecular cloud — very dark reddish-brown
        dCol[i*3]=0.20+0.12*rng(); dCol[i*3+1]=0.09+0.07*rng(); dCol[i*3+2]=0.03+0.04*rng();
      } else if (dt < 0.72) {
        // Diffuse warm ISM — muted grey-tan
        const g=0.16+0.12*rng(); dCol[i*3]=g+0.07; dCol[i*3+1]=g; dCol[i*3+2]=g*0.78;
      } else {
        // Cold neutral — faint blue-grey
        dCol[i*3]=0.10+0.09*rng(); dCol[i*3+1]=0.12+0.09*rng(); dCol[i*3+2]=0.18+0.12*rng();
      }
      dSz[i] = 6000 + rng() * 16000;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    dGeo.setAttribute('color',    new THREE.BufferAttribute(dCol, 3));
    dGeo.setAttribute('size',     new THREE.BufferAttribute(dSz,  1));
    this.dustMesh = new THREE.Points(dGeo, mkMat(mkVert('4.0','80.0','390.0'), NEBULA_FRAG));

    // =========================================================
    // 4. GLOBULAR CLUSTERS (150 × 80 stars = 12,000 points)
    // Spherical halo distribution, concentrated toward galactic centre
    // =========================================================
    const GC = 150, GS = 80;
    const gPos = new Float32Array(GC*GS*3);
    const gCol = new Float32Array(GC*GS*3);
    const gSz  = new Float32Array(GC*GS);

    for (let c = 0; c < GC; c++) {
      // r² profile concentrated inside 60,000 ly
      const cR  = BUL_R*0.3 + HALO_R * Math.pow(rng(), 0.48);
      const cPh = Math.acos(2*rng()-1), cTh = rng()*Math.PI*2;
      const cx  = cR*Math.sin(cPh)*Math.cos(cTh);
      const cy  = cR*Math.cos(cPh);
      const cz  = cR*Math.sin(cPh)*Math.sin(cTh);
      const spd = 1200 + rng()*3500; // angular spread for visibility

      for (let s = 0; s < GS; s++) {
        const idx = c*GS+s;
        const sr  = spd * Math.pow(rng(), 1.5);
        const sp  = Math.acos(2*rng()-1), st = rng()*Math.PI*2;
        gPos[idx*3]   = cx + sr*Math.sin(sp)*Math.cos(st);
        gPos[idx*3+1] = cy + sr*Math.cos(sp);
        gPos[idx*3+2] = cz + sr*Math.sin(sp)*Math.sin(st);

        // Old Population II: red giants, horizontal branch, turnoff — all warm
        const gv = rng();
        if (gv < 0.20) {
          gCol[idx*3]=1.0; gCol[idx*3+1]=0.28+0.14*rng(); gCol[idx*3+2]=0.04+0.06*rng();
        } else if (gv < 0.58) {
          gCol[idx*3]=1.0; gCol[idx*3+1]=0.62+0.20*rng(); gCol[idx*3+2]=0.12+0.14*rng();
        } else {
          gCol[idx*3]=1.0; gCol[idx*3+1]=0.88+0.10*rng(); gCol[idx*3+2]=0.60+0.22*rng();
        }
        gSz[idx] = 700 + rng()*1100;
      }
    }
    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    gGeo.setAttribute('color',    new THREE.BufferAttribute(gCol, 3));
    gGeo.setAttribute('size',     new THREE.BufferAttribute(gSz,  1));
    // Use NEBULA_FRAG (uniform alpha) so LOD fading works; globulars are diffuse anyway
    this.globularMesh = new THREE.Points(gGeo, mkMat(mkVert('1.5','9.0'), NEBULA_FRAG));

    // =========================================================
    // 5. NUCLEAR BULGE HALO — soft billboard, always faces camera
    // Replaces the old sphere geometry which created an artificial globe shape.
    // A large warm gaussian gives the bulge volumetric depth at any zoom.
    // =========================================================
    this.coreMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(BUL_R * 3.2, BUL_R * 3.2),
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform float time; varying vec2 vUv;
          void main(){
            vec2  uv  = vUv - 0.5;
            float r   = length(uv);
            if(r > 0.5) discard;
            // Layered gaussian — bright centre, warm diffuse halo
            float core  = exp(-r*r*85.0) * 3.2;
            float inner = exp(-r*r*22.0) * 1.1;
            float halo  = exp(-r*r* 5.5) * 0.38;
            float total = core + inner + halo;
            if(total < 0.004) discard;
            float p = 0.93 + 0.07*sin(time*0.22);
            // White-hot centre → warm straw yellow → fades naturally
            vec3 col = mix(vec3(1.0,0.98,0.88), vec3(1.0,0.88,0.50), smoothstep(0.0,0.08,r));
            col       = mix(col,               vec3(0.90,0.68,0.28), smoothstep(0.06,0.28,r));
            col      *= 1.0 - smoothstep(0.20, 0.50, r)*0.75;
            gl_FragColor = vec4(col, clamp(total*p*0.72, 0.0, 0.88));
          }
        `,
        transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.DoubleSide,
      })
    );

    // =========================================================
    // 6. CENTRAL BAR — solid-body rotating elongated ellipsoid
    // =========================================================
    this.barMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 36, 18),
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vN;
          void main(){ vN=normalize(normalMatrix*normal);
            gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
        `,
        fragmentShader: `
          uniform float time; varying vec3 vN;
          void main(){
            float rim=pow(1.0-abs(vN.z),3.0);
            vec3 c=mix(vec3(0.96,0.80,0.42),vec3(1.0,0.52,0.14),rim);
            float p=0.84+0.16*sin(time*0.18);
            gl_FragColor=vec4(c*p,(0.12+0.26*rim)*p);
          }
        `,
        transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.FrontSide,
      })
    );
    this.barMesh.scale.set(BAR_R, DISK_H*3.0, BAR_R*0.25);

    // =========================================================
    // 7. SGR A* GLOW BILLBOARD — always faces camera
    // tight bright spike + warm gold diffuse — no purple, no giant halo
    // =========================================================
    this.coreBillboard = new THREE.Mesh(
      new THREE.PlaneGeometry(COR_R*10, COR_R*10),
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `
          uniform float time; varying vec2 vUv;
          void main(){
            vec2 uv=vUv-0.5; float r=length(uv);
            if(r>0.5) discard;
            float spike = exp(-r*r*160.0)*5.0;
            float inner = exp(-r*r* 40.0)*2.2;
            float mid   = exp(-r*r* 10.0)*0.75;
            float outer = exp(-r*r*  2.8)*0.18; // subtle diffuse only
            float total = spike+inner+mid+outer;
            if(total < 0.006) discard;
            float p = 0.88+0.12*sin(time*0.28);
            // White core → warm gold → fades to near-black. No purple.
            vec3 col = mix(vec3(1.0,0.99,0.95), vec3(1.0,0.82,0.30), smoothstep(0.0,0.06,r));
            col       = mix(col,               vec3(0.85,0.44,0.10), smoothstep(0.06,0.22,r));
            col       = mix(col,               vec3(0.12,0.04,0.01), smoothstep(0.18,0.48,r));
            gl_FragColor = vec4(col, clamp(total*p, 0.0, 1.0));
          }
        `,
        transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.DoubleSide,
      })
    );
    this.coreBillboard.renderOrder = 3;

    // =========================================================
    // 8. VOLUMETRIC DISK GLOW — full-galaxy billboard plane
    // GLSL encodes: 2 major arms (bright) + 2 minor (dim) + Orion spur
    // with the correct MW logarithmic pitch angle
    // =========================================================
    const diskGeo = new THREE.PlaneGeometry(GR*2.8, GR*2.8);
    diskGeo.rotateX(-Math.PI/2); // lie flat in XZ plane
    this.diskGlowMesh = new THREE.Mesh(diskGeo,
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, alpha: { value: 1.0 } },
        vertexShader: `
          varying vec2 vUv;
          void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
        `,
        fragmentShader: `
          uniform float time;
          uniform float alpha;
          varying vec2 vUv;

          float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.55); }
          float noise(vec2 p){
            vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
            return mix(mix(h(i),h(i+vec2(1,0)),u.x),
                       mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);
          }

          float armStrength(float r, float ang, float startAngle, float tightness){
            float armAng = startAngle + 4.38*log(max(r,0.001));
            float diff   = mod(ang - armAng + 3.14159, 6.28318) - 3.14159;
            return exp(-diff*diff*tightness);
          }

          // 5-octave FBM — same technique as MilkyWayDome for organic cloud texture
          float fbm(vec2 p){
            float v=0.0, a=0.5;
            for(int i=0;i<5;i++){
              v += a * noise(p);
              p  = p * 2.1 + vec2(1.7, 9.2);
              a *= 0.5;
            }
            return v;
          }

          void main(){
            vec2  uv  = vUv - 0.5;
            float r   = length(uv)*2.0;
            float ang = atan(uv.y, uv.x);
            float t   = time * 0.006;

            // Spiral arm skeleton
            float major =
              armStrength(r, ang, 0.0,     13.0) * 1.00 +
              armStrength(r, ang, 3.14159, 13.0) * 0.92;
            float minor =
              armStrength(r, ang, 1.382,   6.5) * 0.38 +
              armStrength(r, ang, 4.524,   6.5) * 0.32;
            float orion = smoothstep(0.13,0.21,r) * smoothstep(0.37,0.21,r)
                        * armStrength(r, ang, 0.345, 20.0) * 0.42;
            float arms  = clamp(major + minor + orion, 0.0, 1.0);

            // FBM cloud texture — this is what gives the MilkyWay its misty, nebular quality
            // Modulate by arm position so clouds follow the spiral structure
            float cloud  = fbm(uv * 5.5 + t * 0.08);           // large-scale cloud forms
            float cloud2 = fbm(uv * 12.0 - t * 0.04 + 3.7);    // fine wispy detail
            float nebula  = mix(cloud, cloud2, 0.45);

            // Arms carry the clouds — inter-arm has thinner, dimmer wisps
            float armCloud = arms * (0.55 + 0.45 * nebula)
                           + (1.0 - arms) * nebula * 0.18;
            armCloud = clamp(armCloud, 0.0, 1.0);

            // Radial brightness envelope
            float bar   = exp(-r*r*38.0) * 1.6;
            float bulge = exp(-r*r*18.0) * 0.75;
            float disk  = exp(-r * 5.5)  * 0.38 * armCloud;

            float glow  = bar + bulge + disk;
            if(glow < 0.004) discard;

            // Color: nebula regions pick up pink-red (Hα) and teal (OIII) tints
            // matching what real long-exposure galaxy photos show
            vec3 coreC   = vec3(1.0,  0.95, 0.78);  // warm white-gold
            vec3 armBlue = vec3(0.72, 0.84, 1.0 );  // OB star regions: cool blue
            vec3 nebPink = vec3(1.0,  0.62, 0.55);  // Hα emission: salmon-pink
            vec3 nebTeal = vec3(0.38, 0.82, 0.80);  // OIII emission: teal

            // Blend arm color with emission nebula tints based on cloud density
            vec3 armC = mix(armBlue, nebPink, clamp(cloud2 * 1.4 - 0.3, 0.0, 0.55));
            armC      = mix(armC,    nebTeal, clamp(cloud  * 1.2 - 0.5, 0.0, 0.30));

            vec3 col  = mix(coreC, armC, smoothstep(0.0, 0.38, r));
            col      *= 1.0 - smoothstep(0.28, 0.88, r) * 0.72;

            gl_FragColor = vec4(col, clamp(glow * 0.52, 0.0, 0.58) * alpha);
          }
        `,
        transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.DoubleSide,
      })
    );
    this.diskGlowMesh.renderOrder = 0;

    // =========================================================
    // 9. EXTRAGALACTIC BACKGROUND
    // Named objects: Andromeda (M31), LMC, SMC + random distant galaxies
    // =========================================================
    const BN = 4000;
    const bPos = new Float32Array(BN*3);
    const bCol = new Float32Array(BN*3);
    const bSz  = new Float32Array(BN);

    // Place named objects first
    const named = [
      // [x, y, z, r, g, b, size]  — positions in scene units
      // Andromeda (M31): ~2.5M ly away, in real direction but scaled for beauty
      [GR*16, GR*3, -GR*8,   0.85, 0.78, 1.0,  2800],
      // Large Magellanic Cloud: ~160k ly, below south galactic pole
      [GR*0.8, -GR*1.2, GR*0.6,  1.0, 0.92, 0.72, 2200],
      // Small Magellanic Cloud: ~200k ly
      [GR*1.1, -GR*1.4, GR*0.3,  0.88, 0.88, 1.0,  1600],
      // Triangulum (M33): companion to Andromeda
      [GR*14, GR*2.5, -GR*6,  0.75, 0.82, 1.0,  1400],
    ] as const;

    for (let n = 0; n < named.length && n < BN; n++) {
      const [x,y,z,r,g,b,sz] = named[n];
      bPos[n*3]=x; bPos[n*3+1]=y; bPos[n*3+2]=z;
      bCol[n*3]=r; bCol[n*3+1]=g; bCol[n*3+2]=b;
      bSz[n] = sz;
    }
    // Fill rest with generic distant background
    for (let i = named.length; i < BN; i++) {
      const br = GR*(3.0 + rng()*7.0);
      const bp = Math.acos(2*rng()-1), bt = rng()*Math.PI*2;
      bPos[i*3]   = br*Math.sin(bp)*Math.cos(bt);
      bPos[i*3+1] = br*Math.cos(bp);
      bPos[i*3+2] = br*Math.sin(bp)*Math.sin(bt);
      const bv = rng();
      if (bv<0.35) { bCol[i*3]=0.78+0.18*rng(); bCol[i*3+1]=0.84+0.12*rng(); bCol[i*3+2]=1.0; }
      else if (bv<0.65) { bCol[i*3]=1.0; bCol[i*3+1]=0.88+0.10*rng(); bCol[i*3+2]=0.72+0.22*rng(); }
      else { bCol[i*3]=0.88+0.10*rng(); bCol[i*3+1]=0.54+0.24*rng(); bCol[i*3+2]=0.18+0.16*rng(); }
      bSz[i] = 120 + rng()*320;
    }
    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    bGeo.setAttribute('color',    new THREE.BufferAttribute(bCol, 3));
    bGeo.setAttribute('size',     new THREE.BufferAttribute(bSz,  1));
    this.bgGalaxyMesh = new THREE.Points(bGeo,
      mkMat(mkVert('0.8','22.0','280.0'), NEBULA_FRAG));

    // =========================================================
    // 10. COSMIC BACKGROUND DUST — scattered faint stars filling deep space
    // Mirrors the solar system mode's space dust for consistent "alive" look
    // Distributed on a large sphere so it always surrounds the camera
    // =========================================================
    {
      const CD  = 22000;  // point count
      const cPos = new Float32Array(CD * 3);
      const cCol = new Float32Array(CD * 3);
      const cSz  = new Float32Array(CD);
      const R    = GR * 2.6; // radius of the background sphere
      for (let i = 0; i < CD; i++) {
        // Uniform distribution on sphere surface
        const phi   = Math.acos(2 * rng() - 1);
        const theta = rng() * Math.PI * 2;
        const r     = R * (0.85 + 0.15 * rng()); // slight depth variation
        cPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        cPos[i*3+1] = r * Math.cos(phi) * 0.35;  // flatten to a disk-ish distribution
        cPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);

        // Same color palette as solar system starfield
        const sv = rng();
        if (sv < 0.30) {
          cCol[i*3]=0.78; cCol[i*3+1]=0.84; cCol[i*3+2]=1.0;  // blue-white
        } else if (sv < 0.68) {
          cCol[i*3]=1.0;  cCol[i*3+1]=1.0;  cCol[i*3+2]=1.0;  // pure white
        } else {
          cCol[i*3]=1.0;  cCol[i*3+1]=0.90; cCol[i*3+2]=0.75; // warm yellow-white
        }
        cSz[i] = 40 + rng() * 90; // small and subtle
      }
      const cGeo = new THREE.BufferGeometry();
      cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
      cGeo.setAttribute('color',    new THREE.BufferAttribute(cCol, 3));
      cGeo.setAttribute('size',     new THREE.BufferAttribute(cSz,  1));
      this.cosmicDustMesh = new THREE.Points(cGeo,
        new THREE.PointsMaterial({
          size: 1.0,
          vertexColors: true,
          transparent: true,
          opacity: 0.30,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: false, // fixed pixel size — stays crisp at any zoom
          depthWrite: false,
        })
      );
    }

    // =========================================================
    // 11. "YOU ARE HERE" — Orion Spur marker
    // Pulsing Earth-green billboard at our Sun's actual position
    // r ≈ 26,000 ly from core, on the Orion Spur (θ ≈ ORI + WIND*ln(SUN_R/BAR_R))
    // =========================================================
    const youAreHerePx = 2500; // billboard world size in ly
    const oriAngle = ORI + WIND * Math.log(SUN_R / BAR_R);
    const yah_x = Math.cos(oriAngle) * SUN_R;
    const yah_z = Math.sin(oriAngle) * SUN_R;

    this.youAreHereMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(youAreHerePx, youAreHerePx),
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform float time; varying vec2 vUv;
          void main(){
            vec2 uv = vUv - 0.5; float r = length(uv);
            if(r > 0.5) discard;
            // Pulsing ring
            float pulse = 0.5 + 0.5*sin(time*2.4);
            float ring1 = exp(-pow((r-0.12)*60.0,2.0)) * 2.5;
            float ring2 = exp(-pow((r-0.28)*28.0,2.0)) * 1.2 * pulse;
            float ring3 = exp(-pow((r-0.44)*18.0,2.0)) * 0.6 * (1.0-pulse);
            float center = exp(-r*r*180.0) * 4.0;
            float total = ring1 + ring2 + ring3 + center;
            if(total < 0.015) discard;
            // Earth-green → white core
            vec3 col = mix(vec3(0.12,0.90,0.42), vec3(1.0,1.0,0.92), smoothstep(0.0, 0.10, r));
            col = mix(col, vec3(0.06,0.65,0.30), smoothstep(0.10, 0.48, r));
            gl_FragColor = vec4(col, clamp(total*0.85, 0.0, 1.0));
          }
        `,
        transparent:true, blending:THREE.AdditiveBlending,
        depthWrite:false, side:THREE.DoubleSide,
      })
    );
    this.youAreHereMesh.position.set(yah_x, 0, yah_z);
    this.youAreHereMesh.renderOrder = 4;

    // =========================================================
    // COSMIC BACKGROUND DOME — inside-facing sphere wrapping the viewer
    // The same role as MilkyWayDome in solar system mode: every direction
    // feels alive with depth. FBM noise creates cosmic-web filaments,
    // distant galaxy cluster warmth, and deep-space nebulosity.
    // =========================================================
    this.cosmicDomeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GR * 7, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vDir;
          void main(){
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vDir;
          uniform float time;

          float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
          float noise(vec2 p){
            vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
            return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
                       mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
          }
          float fbm(vec2 p){
            float v=0.0, a=0.5;
            for(int i=0;i<6;i++){
              v += a*noise(p);
              p  = p*2.1 + vec2(1.7,9.2);
              a *= 0.5;
            }
            return v;
          }

          void main(){
            vec3 d = normalize(vDir);

            // Use spherical coords as 2D noise input — gives organic coverage
            float lon = atan(d.z, d.x);
            float lat = asin(clamp(d.y, -1.0, 1.0));
            vec2 uv   = vec2(lon * 0.6, lat * 1.2);

            float t = time * 0.005;

            // Large-scale cosmic web filaments
            float web   = fbm(uv * 1.8 + t * 0.3);
            // Medium-scale galaxy cluster concentrations
            float clust = fbm(uv * 3.5 - t * 0.15 + 5.3);
            // Fine detail — individual galaxy smears
            float fine  = fbm(uv * 7.0 + t * 0.1 + 2.1);

            // Cosmic web: bright filaments, dark voids (just like real large-scale structure)
            float structure = pow(web, 1.6) * 0.55
                            + pow(clust, 2.0) * 0.30
                            + fine * 0.08;

            // Galactic plane: faint equatorial band (unresolved stars of other galaxies)
            float band = exp(-lat*lat * 8.0) * 0.12;
            structure += band;

            structure = clamp(structure, 0.0, 1.0);
            if(structure < 0.015) discard;

            // Color palette: deep space indigo-black, filaments are faint blue-white,
            // cluster nodes pick up warm amber (older stellar populations)
            vec3 voidC   = vec3(0.0,   0.002, 0.010); // nearly black deep space
            vec3 filC    = vec3(0.18,  0.28,  0.55);  // faint blue cosmic filament
            vec3 clustC  = vec3(0.55,  0.42,  0.22);  // warm amber cluster nodes

            vec3 col = mix(voidC, filC,   smoothstep(0.0,  0.5, web));
            col      = mix(col,   clustC, smoothstep(0.55, 0.8, clust) * 0.45);
            // Band is slightly warmer (distant galactic stars)
            col      = mix(col,   vec3(0.70, 0.65, 0.55), band * 1.5);

            // Very low opacity — adds depth without overpowering the galaxy
            float a = structure * 0.18;
            gl_FragColor = vec4(col, clamp(a, 0.0, 0.18));
          }
        `,
        transparent: true,
        side: THREE.BackSide,           // always renders from inside
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.cosmicDomeMesh.renderOrder = -5; // deepest — behind everything

    // ── Assemble ──────────────────────────────────────────────────────────────
    this.group.add(
      this.cosmicDomeMesh,   // immersive background dome (deepest — wraps viewer)
      this.cosmicDustMesh,   // background star dust (fills deep space)
      this.bgGalaxyMesh,     // extragalactic background (deepest)
      this.diskGlowMesh,     // volumetric disk glow
      this.dustMesh,         // dark dust lanes
      this.hiiMesh,          // H-II emission nebulae
      this.starsMesh,        // main stellar disk (GPU animated)
      this.globularMesh,     // globular clusters
      this.barMesh,          // central bar
      this.coreMesh,         // nuclear star cluster
      this.coreBillboard,    // Sgr A* glow
      this.youAreHereMesh,   // YOU ARE HERE — Orion Spur
    );
    if (this.habitableMesh) this.group.add(this.habitableMesh); // Earth-like markers
    scene.add(this.group);
  }

  update(deltaTime: number, camera: THREE.Camera): void {
    this.time += deltaTime;
    const t = this.time;

    // ── LOD: fade each layer by distance from galactic center ─────────────
    // smoothstep fade: 1 when dist <= near, 0 when dist >= far
    const camDist = camera.position.length();
    const fadeIn = (near: number, far: number, dist: number): number => {
      if (dist <= near) return 1;
      if (dist >= far)  return 0;
      const tt = (far - dist) / (far - near);
      return tt * tt * (3 - 2 * tt);
    };

    // Layer visibility thresholds (ly units)
    const starsAlpha    = fadeIn(80_000,  160_000, camDist); // stars fade in as you approach
    const hiiAlpha      = fadeIn(25_000,   70_000, camDist); // nebulae very close
    const dustAlpha     = fadeIn(25_000,   70_000, camDist);
    const globularAlpha = fadeIn(50_000,  130_000, camDist);
    // Disk glow: always visible but dims slightly when very close (you're inside it)
    const diskAlpha     = 0.35 + 0.65 * Math.min(1, camDist / 40_000);

    // ── Update time uniforms ───────────────────────────────────────────────
    const starMat = this.starsMesh.material as THREE.ShaderMaterial;
    starMat.uniforms.time.value  = t;
    starMat.uniforms.alpha.value = starsAlpha;

    (this.hiiMesh.material      as THREE.ShaderMaterial).uniforms.alpha.value = hiiAlpha;
    (this.dustMesh.material     as THREE.ShaderMaterial).uniforms.alpha.value = dustAlpha;
    (this.globularMesh.material as THREE.ShaderMaterial).uniforms.alpha.value = globularAlpha;

    (this.coreMesh.material       as THREE.ShaderMaterial).uniforms.time.value = t;
    (this.coreBillboard.material  as THREE.ShaderMaterial).uniforms.time.value = t;
    (this.barMesh.material        as THREE.ShaderMaterial).uniforms.time.value = t;

    const diskMat = this.diskGlowMesh.material as THREE.ShaderMaterial;
    diskMat.uniforms.time.value  = t;
    diskMat.uniforms.alpha.value = diskAlpha;

    (this.youAreHereMesh.material as THREE.ShaderMaterial).uniforms.time.value = t;
    (this.cosmicDomeMesh.material as THREE.ShaderMaterial).uniforms.time.value = t;

    // Habitable mesh LOD (if built)
    if (this.habitableMesh) {
      const habAlpha = fadeIn(12_000, 40_000, camDist);
      (this.habitableMesh.material as THREE.ShaderMaterial).uniforms.time.value  = t;
      (this.habitableMesh.material as THREE.ShaderMaterial).uniforms.alpha.value = habAlpha;
    }

    // ── Billboards always face camera ──────────────────────────────────────
    this.coreMesh.quaternion.copy(camera.quaternion);       // bulge halo billboard
    this.coreBillboard.quaternion.copy(camera.quaternion);  // Sgr A* spike
    this.youAreHereMesh.quaternion.copy(camera.quaternion);

    // Bar rotates as solid body: omega = V_FLAT/BAR_R * 0.62
    this.barMesh.rotation.y = (0.015 / 27000) * 0.62 * t;
  }

  dispose(): void {
    for (const m of [
      this.starsMesh, this.hiiMesh, this.dustMesh, this.globularMesh,
      this.coreMesh, this.barMesh, this.coreBillboard,
      this.diskGlowMesh, this.bgGalaxyMesh, this.cosmicDustMesh,
      this.cosmicDomeMesh, this.youAreHereMesh,
    ]) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    if (this.habitableMesh) {
      this.habitableMesh.geometry.dispose();
      (this.habitableMesh.material as THREE.Material).dispose();
    }
  }
}
