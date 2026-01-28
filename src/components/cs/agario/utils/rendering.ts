// src/components/cs/agario/rendering.ts

import {
  Blob, Food, FoodCluster, Obstacle, Log, TerrainZone
} from '../config/agario.types';
import {
  WORLD_WIDTH, WORLD_HEIGHT,
  REPRODUCTION_MIN_MASS, MIN_AGE_FOR_REPRODUCTION,
  FOOD_FOR_REPRODUCTION, REPRODUCTION_COOLDOWN
} from '../config/agario.constants';

/**
 * Rendering System
 * 
 * This module handles all canvas rendering for the simulation.
 * Separated into focused functions for each entity type.
 */

// ===================== TYPES =====================

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  width: number;
  height: number;
  selectedBlobId?: number;
  currentTick: number;
}

// ===================== BACKGROUND & GRID =====================

/**
 * Clear canvas and draw background
 */
export function renderBackground(ctx: RenderContext): void {
  const { ctx: canvas, width, height } = ctx;
  canvas.fillStyle = '#0a0e1a';
  canvas.fillRect(0, 0, width, height);
}

/**
 * Apply camera transformation
 */
export function applyCameraTransform(ctx: RenderContext): void {
  const { ctx: canvas, camera, width, height } = ctx;
  canvas.translate(width / 2, height / 2);
  canvas.scale(camera.zoom, camera.zoom);
  canvas.translate(-camera.x, -camera.y);
}

/**
 * Render world grid
 */
export function renderGrid(ctx: RenderContext): void {
  const { ctx: canvas, camera } = ctx;
  
  canvas.strokeStyle = 'rgba(59, 130, 246, 0.08)';
  canvas.lineWidth = 1 / camera.zoom;

  // Vertical lines
  for (let x = 0; x <= WORLD_WIDTH; x += 100) {
    canvas.beginPath();
    canvas.moveTo(x, 0);
    canvas.lineTo(x, WORLD_HEIGHT);
    canvas.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
    canvas.beginPath();
    canvas.moveTo(0, y);
    canvas.lineTo(WORLD_WIDTH, y);
    canvas.stroke();
  }
}

/**
 * Render world border
 */
export function renderBorder(ctx: RenderContext): void {
  const { ctx: canvas, camera } = ctx;
  
  canvas.strokeStyle = 'rgba(59, 130, 246, 0.4)';
  canvas.lineWidth = 4 / camera.zoom;
  canvas.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

// ===================== TERRAIN ZONES =====================

/**
 * Render terrain zones (safe/danger areas)
 */
export function renderTerrainZones(
  zones: TerrainZone[],
  ctx: RenderContext
): void {
  const { ctx: canvas, camera } = ctx;
  
  // Only render if zoomed in enough
  if (camera.zoom <= 0.4) return;

  for (const zone of zones) {
    // Zone fill
    canvas.fillStyle =
      zone.type === 'safe' ? 'rgba(34, 197, 94, 0.06)' :
      zone.type === 'danger' ? 'rgba(239, 68, 68, 0.06)' :
      'rgba(100, 100, 100, 0.02)';
    
    canvas.fillRect(zone.x, zone.y, zone.width, zone.height);

    // Zone border (only if very zoomed in)
    if (camera.zoom > 0.6) {
      canvas.strokeStyle =
        zone.type === 'safe' ? 'rgba(34, 197, 94, 0.12)' :
        zone.type === 'danger' ? 'rgba(239, 68, 68, 0.12)' :
        'rgba(100, 100, 100, 0.08)';
      
      canvas.lineWidth = 1 / camera.zoom;
      canvas.strokeRect(zone.x, zone.y, zone.width, zone.height);
    }
  }
}

// ===================== FOOD RENDERING =====================

/**
 * Render food clusters (LOD optimization)
 */
export function renderFoodClusters(
  clusters: FoodCluster[],
  ctx: RenderContext
): Set<Food> {
  const { ctx: canvas, camera } = ctx;
  const clusteredFoodIds = new Set<Food>();

  for (const cluster of clusters) {
    // Track which food is in clusters
    cluster.foods.forEach(f => clusteredFoodIds.add(f));

    // Gradient for depth effect
    const gradient = canvas.createRadialGradient(
      cluster.x, cluster.y, 0,
      cluster.x, cluster.y, cluster.radius
    );
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
    gradient.addColorStop(0.7, 'rgba(34, 197, 94, 0.6)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');

    canvas.fillStyle = gradient;
    canvas.beginPath();
    canvas.arc(cluster.x, cluster.y, cluster.radius, 0, Math.PI * 2);
    canvas.fill();

    // Outline
    canvas.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    canvas.lineWidth = 2 / camera.zoom;
    canvas.stroke();

    // Count label when zoomed in
    if (camera.zoom > 0.7) {
      canvas.fillStyle = 'rgba(255, 255, 255, 0.8)';
      canvas.font = `bold ${Math.max(10, cluster.radius * 0.4) / camera.zoom}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.fillText(`×${cluster.count}`, cluster.x, cluster.y);
    }
  }

  return clusteredFoodIds;
}

/**
 * Render individual food pellets (not in clusters)
 */
export function renderIndividualFood(
  food: Food[],
  clusteredFoodIds: Set<Food>,
  ctx: RenderContext
): void {
  const { ctx: canvas } = ctx;

  for (const f of food) {
    if (clusteredFoodIds.has(f)) continue;

    const alpha = Math.min(1, f.age / 30);
    canvas.fillStyle = `rgba(34, 197, 94, ${alpha * 0.85})`;
    canvas.beginPath();
    canvas.arc(f.x, f.y, Math.sqrt(f.mass) * 2.2, 0, Math.PI * 2);
    canvas.fill();
  }
}

// ===================== LOGS RENDERING =====================

/**
 * Render movable logs
 */
export function renderLogs(logs: Log[], ctx: RenderContext): void {
  const { ctx: canvas, camera } = ctx;

  for (const log of logs) {
    canvas.save();
    canvas.translate(log.x, log.y);
    canvas.rotate(log.rotation);

    // Wood texture gradient
    const gradient = canvas.createLinearGradient(
      -log.width / 2, 0,
      log.width / 2, 0
    );
    gradient.addColorStop(0, '#8b4513');
    gradient.addColorStop(0.3, '#a0522d');
    gradient.addColorStop(0.7, '#8b4513');
    gradient.addColorStop(1, '#654321');

    canvas.fillStyle = gradient;
    canvas.fillRect(-log.width / 2, -log.height / 2, log.width, log.height);

    // Wood grain lines
    canvas.strokeStyle = 'rgba(101, 67, 33, 0.5)';
    canvas.lineWidth = 1 / camera.zoom;
    for (let i = 0; i < 3; i++) {
      const y = -log.height / 2 + (log.height / 4) * (i + 1);
      canvas.beginPath();
      canvas.moveTo(-log.width / 2, y);
      canvas.lineTo(log.width / 2, y);
      canvas.stroke();
    }

    // Border
    canvas.strokeStyle = '#654321';
    canvas.lineWidth = 2 / camera.zoom;
    canvas.strokeRect(-log.width / 2, -log.height / 2, log.width, log.height);

    // Grabbed indicator
    if (log.grabbedBy !== undefined) {
      canvas.strokeStyle = '#fbbf24';
      canvas.lineWidth = 3 / camera.zoom;
      canvas.strokeRect(
        -log.width / 2 - 3,
        -log.height / 2 - 3,
        log.width + 6,
        log.height + 6
      );
    }

    canvas.restore();
  }
}

// ===================== OBSTACLES RENDERING =====================

/**
 * Render obstacles (hazards)
 */
export function renderObstacles(obstacles: Obstacle[], ctx: RenderContext): void {
  const { ctx: canvas, camera } = ctx;

  for (const obs of obstacles) {
    // Circle
    canvas.fillStyle = '#dc2626';
    canvas.beginPath();
    canvas.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
    canvas.fill();

    // Border
    canvas.strokeStyle = '#991b1b';
    canvas.lineWidth = 2 / camera.zoom;
    canvas.stroke();

    // Skull emoji when zoomed in
    if (camera.zoom > 0.5) {
      canvas.fillStyle = '#7f1d1d';
      canvas.font = `bold ${Math.min(16, obs.radius) / camera.zoom}px sans-serif`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.fillText('☠', obs.x, obs.y);
    }
  }
}

// ===================== FAMILY CONNECTIONS =====================

/**
 * Render family connection lines
 */
export function renderFamilyConnections(blobs: Blob[], ctx: RenderContext): void {
  const { ctx: canvas, camera } = ctx;

  // Only render if zoomed in
  if (camera.zoom <= 0.6) return;

  for (const blob of blobs) {
    for (const childId of blob.childrenIds) {
      const child = blobs.find(b => b.id === childId);
      if (!child) continue;

      canvas.strokeStyle = 'rgba(251, 191, 36, 0.2)';
      canvas.lineWidth = 1 / camera.zoom;
      canvas.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
      canvas.beginPath();
      canvas.moveTo(blob.x, blob.y);
      canvas.lineTo(child.x, child.y);
      canvas.stroke();
      canvas.setLineDash([]);
    }
  }
}

// ===================== BLOB RENDERING =====================

/**
 * Check if blob can reproduce
 */
function canBlobReproduce(blob: Blob, currentTick: number): boolean {
  return (
    blob.age >= MIN_AGE_FOR_REPRODUCTION &&
    blob.mass >= REPRODUCTION_MIN_MASS &&
    (blob.kills > 0 || blob.foodEaten >= FOOD_FOR_REPRODUCTION) &&
    (currentTick - blob.lastReproductionTick) > REPRODUCTION_COOLDOWN
  );
}

/**
 * Render a single blob with all indicators
 */
export function renderBlob(blob: Blob, ctx: RenderContext): void {
  const { ctx: canvas, camera, selectedBlobId, currentTick } = ctx;
  const radius = Math.sqrt(blob.mass) * 2.5;

  // Health warning for low mass
  if (blob.mass / 100 < 0.5) {
    canvas.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    canvas.lineWidth = 3 / camera.zoom;
    canvas.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
    canvas.beginPath();
    canvas.arc(blob.x, blob.y, radius + 3, 0, Math.PI * 2);
    canvas.stroke();
    canvas.setLineDash([]);
  }

  // Main blob circle
  canvas.fillStyle = blob.color;
  canvas.beginPath();
  canvas.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
  canvas.fill();

  // Border
  canvas.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  canvas.lineWidth = 2 / camera.zoom;
  canvas.stroke();

  // Direction indicator
  const angle = Math.atan2(blob.vy, blob.vx);
  canvas.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  canvas.lineWidth = 3 / camera.zoom;
  canvas.beginPath();
  canvas.moveTo(blob.x, blob.y);
  canvas.lineTo(
    blob.x + Math.cos(angle) * radius * 0.8,
    blob.y + Math.sin(angle) * radius * 0.8
  );
  canvas.stroke();

  // Reproduction readiness indicator
  if (canBlobReproduce(blob, currentTick)) {
    canvas.fillStyle = 'rgba(147, 51, 234, 0.3)';
    canvas.beginPath();
    canvas.arc(blob.x, blob.y, radius + 15, 0, Math.PI * 2);
    canvas.fill();

    if (camera.zoom > 0.8) {
      canvas.fillStyle = '#9333ea';
      canvas.font = `bold ${8 / camera.zoom}px monospace`;
      canvas.textAlign = 'center';
      canvas.textBaseline = 'top';
      canvas.fillText('Ready!', blob.x, blob.y + radius + 20);
    }
  }

  // Log carrying indicator
  if (blob.grabbedLog !== undefined) {
    canvas.fillStyle = 'rgba(139, 69, 19, 0.7)';
    canvas.beginPath();
    canvas.arc(blob.x, blob.y - radius - 8, 5, 0, Math.PI * 2);
    canvas.fill();
  }

  // ID label
  if (camera.zoom > 0.5) {
    canvas.fillStyle = 'rgba(255, 255, 255, 0.9)';
    canvas.font = `bold ${11 / camera.zoom}px monospace`;
    canvas.textAlign = 'center';
    canvas.textBaseline = 'middle';
    canvas.fillText(`#${blob.id}`, blob.x, blob.y);
  }

  // Selection highlight
  if (selectedBlobId === blob.id) {
    canvas.strokeStyle = '#6366f1';
    canvas.lineWidth = 3 / camera.zoom;
    canvas.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
    canvas.beginPath();
    canvas.arc(blob.x, blob.y, radius + 8, 0, Math.PI * 2);
    canvas.stroke();
    canvas.setLineDash([]);
  }
}

/**
 * Render all blobs
 */
export function renderBlobs(blobs: Blob[], ctx: RenderContext): void {
  for (const blob of blobs) {
    renderBlob(blob, ctx);
  }
}

// ===================== MAIN RENDER FUNCTION =====================

/**
 * Render the entire simulation scene
 */
export function renderSimulation(
  blobs: Blob[],
  food: Food[],
  foodClusters: FoodCluster[],
  obstacles: Obstacle[],
  logs: Log[],
  terrainZones: TerrainZone[],
  ctx: RenderContext
): void {
  const { ctx: canvas } = ctx;

  // Clear and setup
  renderBackground(ctx);

  canvas.save();
  applyCameraTransform(ctx);

  // Background layers
  renderTerrainZones(terrainZones, ctx);
  renderGrid(ctx);
  renderBorder(ctx);

  // Food (LOD system)
  const clusteredFoodIds = renderFoodClusters(foodClusters, ctx);
  renderIndividualFood(food, clusteredFoodIds, ctx);

  // Objects
  renderLogs(logs, ctx);
  renderObstacles(obstacles, ctx);

  // Entities
  renderFamilyConnections(blobs, ctx);
  renderBlobs(blobs, ctx);

  canvas.restore();
}

// ===================== UTILITY FUNCTIONS =====================

/**
 * Calculate what the camera should follow
 */
export function getCameraTarget(
  blobs: Blob[],
  followMode: 'best' | 'center' | null
): { x: number; y: number } | null {
  if (followMode === 'center') {
    return { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
  }

  if (followMode === 'best' && blobs.length > 0) {
    const best = blobs.reduce((a, b) =>
      a.genome.fitness > b.genome.fitness ? a : b
    );
    return { x: best.x, y: best.y };
  }

  return null;
}

/**
 * Smoothly move camera towards target
 */
export function updateCamera(
  camera: Camera,
  target: { x: number; y: number } | null,
  smoothing: number = 0.08
): void {
  if (!target) return;

  camera.x += (target.x - camera.x) * smoothing;
  camera.y += (target.y - camera.y) * smoothing;
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const worldX = (screenX - canvasWidth / 2) / camera.zoom + camera.x;
  const worldY = (screenY - canvasHeight / 2) / camera.zoom + camera.y;
  return { x: worldX, y: worldY };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const screenX = (worldX - camera.x) * camera.zoom + canvasWidth / 2;
  const screenY = (worldY - camera.y) * camera.zoom + canvasHeight / 2;
  return { x: screenX, y: screenY };
}