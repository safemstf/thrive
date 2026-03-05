/* ================================================================
   td.rendering.ts — Middle-Earth Defender · Canvas Rendering
   Aesthetic: Vibrant medieval city-builder meets dark fantasy
   ================================================================ */

import {
  GS, TT, TCFG, ECFG,
  COLS, ROWS, CELL, GW, GH,
  DAY_LEN, NIGHT_LEN, KEEP, KEEP_R,
  tRng, Tower, Enemy,
} from './td.logic';

/* ── Safe Primitives ────────────────────────────────────────────── */
function safeGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  col: string, blur = 18,
) {
  if (!isFinite(x) || !isFinite(y) || !isFinite(r) || r < 0 || !isFinite(blur)) return;
  const inner = Math.max(0.01, r * 0.1);
  const outer = Math.max(inner + 0.1, r + blur);
  try {
    const g = ctx.createRadialGradient(x, y, inner, x, y, outer);
    g.addColorStop(0, col + 'cc');
    g.addColorStop(0.5, col + '44');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, outer, 0, Math.PI * 2); ctx.fill();
  } catch { /* swallow any remaining edge cases */ }
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const R = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + R, y); ctx.lineTo(x + w - R, y); ctx.arcTo(x + w, y, x + w, y + R, R);
  ctx.lineTo(x + w, y + h - R); ctx.arcTo(x + w, y + h, x + w - R, y + h, R);
  ctx.lineTo(x + R, y + h); ctx.arcTo(x, y + h, x, y + h - R, R);
  ctx.lineTo(x, y + R); ctx.arcTo(x, y, x + R, y, R);
  ctx.closePath(); ctx.fill();
}
function tri(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}
function hline(ctx: CanvasRenderingContext2D, x1: number, y: number, x2: number, w: number, col: string) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
}

/* ── Terrain ────────────────────────────────────────────────────── */

function drawGrass(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const x = cx - CELL / 2, y = cy - CELL / 2;
  const col = (Math.round(cx / CELL) + Math.round(cy / CELL)) % 2 === 0 ? '#2a5c1a' : '#245218';
  ctx.fillStyle = col; ctx.fillRect(x, y, CELL, CELL);
  // Subtle grass blades
  ctx.fillStyle = '#346820';
  for (let i = 0; i < 7; i++) {
    const bx = x + 2 + ((cx * 13 + cy * 7 + i * 11) % (CELL - 4));
    const by = y + 2 + ((cx * 7 + cy * 17 + i * 9) % (CELL - 6));
    ctx.fillRect(bx, by, 1, 3);
  }
  // Occasional wildflower dot
  if (((cx * 31 + cy * 23) % 7) === 0) {
    ctx.fillStyle = '#f0d040';
    ctx.beginPath(); ctx.arc(x + 8 + ((cx * 11) % (CELL - 16)), y + 8 + ((cy * 13) % (CELL - 16)), 1.5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const x = cx - CELL / 2, y = cy - CELL / 2;
  // Warm sandy base
  ctx.fillStyle = '#9a7848'; ctx.fillRect(x, y, CELL, CELL);
  // Stone pavers
  ctx.fillStyle = '#b08c58';
  for (let i = 0; i < 3; i++) {
    const bx = x + 3 + ((cx * 11 + i * 16) % (CELL - 12));
    const by = y + 3 + ((cy * 13 + i * 9) % (CELL - 10));
    rr(ctx, bx, by, 10, 8, 2);
  }
  ctx.fillStyle = '#8a6c38';
  for (let i = 0; i < 2; i++) {
    const bx = x + 5 + ((cx * 17 + i * 13) % (CELL - 14));
    const by = y + 5 + ((cy * 11 + i * 17) % (CELL - 12));
    rr(ctx, bx, by, 7, 6, 1);
  }
  // Mortar lines
  ctx.strokeStyle = '#704c28'; ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
  // Edge shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x, y, 2, CELL); ctx.fillRect(x + CELL - 2, y, 2, CELL);
}

function drawBuildable(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const x = cx - CELL / 2, y = cy - CELL / 2;
  const col = (Math.round(cx / CELL) + Math.round(cy / CELL)) % 2 === 0 ? '#2e5420' : '#285018';
  ctx.fillStyle = col; ctx.fillRect(x, y, CELL, CELL);
  // Subtle cleared-land crosshatch
  ctx.strokeStyle = 'rgba(100,180,60,0.12)'; ctx.lineWidth = 0.5;
  ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y + CELL); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + CELL, y); ctx.lineTo(x, y + CELL); ctx.stroke();
  // Corner marker dots
  ctx.fillStyle = 'rgba(140,200,80,0.25)';
  [[x + 2, y + 2], [x + CELL - 3, y + 2], [x + 2, y + CELL - 3], [x + CELL - 3, y + CELL - 3]].forEach(([px, py]) => {
    ctx.fillRect(px as number, py as number, 2, 2);
  });
}

function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Thick dark trunk
  ctx.fillStyle = '#2a1a0a'; ctx.fillRect(cx - 3, cy + 4, 6, 12);
  // Gnarled branches
  ctx.strokeStyle = '#1e1406'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy + 8); ctx.lineTo(cx - 8, cy + 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + 6); ctx.lineTo(cx + 7, cy + 1); ctx.stroke();
  // 3-layer canopy (dark, vivid, highlight)
  ctx.fillStyle = '#1c3a10'; ctx.beginPath(); ctx.arc(cx, cy + 2, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#284e18'; ctx.beginPath(); ctx.arc(cx - 1, cy - 2, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#346224'; ctx.beginPath(); ctx.arc(cx + 1, cy - 6, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#40742c'; ctx.beginPath(); ctx.arc(cx, cy - 9, 3.5, 0, Math.PI * 2); ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 4, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#546070'; ctx.beginPath(); ctx.ellipse(cx, cy, 11, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#687888'; ctx.beginPath(); ctx.ellipse(cx - 2, cy - 1, 7, 4.5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a9098'; ctx.beginPath(); ctx.ellipse(cx - 3, cy - 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.ellipse(cx - 4, cy - 3, 2, 1, 0.4, 0, Math.PI * 2); ctx.fill();
}

function drawBush(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 4, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a4a18'; ctx.beginPath(); ctx.ellipse(cx, cy + 1, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#386424'; ctx.beginPath(); ctx.ellipse(cx - 2, cy - 1, 8, 5, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#447830'; ctx.beginPath(); ctx.arc(cx + 2, cy - 2, 4, 0, Math.PI * 2); ctx.fill();
  // Berries
  ctx.fillStyle = '#c83028'; ctx.beginPath(); ctx.arc(cx - 3, cy - 2, 1.5, 0, Math.PI * 2); ctx.fill();
}

/* ── Ambient city tiles ─────────────────────────────────────────── */
function drawSmallHouse(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawGrass(ctx, cx, cy);
  const x = cx - 10, y = cy - 8;
  // Walls
  ctx.fillStyle = '#c8a878'; rr(ctx, x, y, 20, 14, 2);
  ctx.fillStyle = '#d8b888'; rr(ctx, x + 1, y + 1, 18, 5, 1);
  // Roof
  ctx.fillStyle = '#803828'; tri(ctx, cx, y - 7, x - 1, y + 1, x + 21, y + 1);
  ctx.fillStyle = '#9a4830'; tri(ctx, cx, y - 5, x + 1, y + 1, x + 19, y + 1);
  // Door
  ctx.fillStyle = '#3a2010'; rr(ctx, cx - 2, y + 7, 4, 7, 1);
  // Window
  ctx.fillStyle = '#f8e080'; ctx.fillRect(cx + 5, y + 4, 4, 3);
}

function drawWell(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawGrass(ctx, cx, cy);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + 8, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Stone ring
  ctx.fillStyle = '#9a8868'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b8a078'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a2a38'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
  // Posts
  ctx.fillStyle = '#7a5028'; ctx.fillRect(cx - 8, cy - 12, 3, 12); ctx.fillRect(cx + 5, cy - 12, 3, 12);
  // Crossbar
  ctx.fillStyle = '#8a6030'; ctx.fillRect(cx - 8, cy - 13, 16, 3);
  // Rope
  ctx.strokeStyle = '#c8a040'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy - 5); ctx.stroke();
}

function drawFarm(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawGrass(ctx, cx, cy);
  const x = cx - CELL / 2, y = cy - CELL / 2;
  // Furrow strips
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#4a7020' : '#3a6018';
    ctx.fillRect(x + 2 + i * 8, y + 4, 7, CELL - 8);
  }
  // Crops (little crosses)
  ctx.fillStyle = '#f0d840';
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const bx = x + 5 + i * 8, by = y + 8 + j * 10;
    ctx.fillRect(bx - 1, by - 3, 2, 6); ctx.fillRect(bx - 3, by - 1, 6, 2);
  }
}

/** Draws Keep cell — imposing White Tower of Gondor */
function drawKeep(ctx: CanvasRenderingContext2D, cx: number, cy: number, gt: number) {
  const x = cx - CELL / 2, y = cy - CELL / 2;
  // Stone courtyard
  ctx.fillStyle = '#5a4838'; ctx.fillRect(x, y, CELL, CELL);
  ctx.fillStyle = '#6a5848'; rr(ctx, x + 2, y + 2, CELL - 4, CELL - 4, 4);
  // Cobblestone floor
  ctx.strokeStyle = '#584838'; ctx.lineWidth = 0.5;
  for (let i = 4; i < CELL - 4; i += 8) ctx.strokeRect(x + 4, y + 4, i, CELL - 8);

  // White Tower silhouette — imposing and layered
  ctx.fillStyle = '#f0ece0';
  ctx.fillRect(cx - 10, cy + 6, 20, 12); // wide base
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(cx - 7, cy - 2, 14, 10);  // mid section
  ctx.fillStyle = '#f0ece0';
  ctx.fillRect(cx - 5, cy - 12, 10, 12); // upper tower
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(cx - 3, cy - 20, 6, 10);  // spire
  // Battlement top
  ctx.fillStyle = '#dce4f0';
  ctx.fillRect(cx - 4, cy - 22, 8, 3);
  for (let i = 0; i < 4; i++) ctx.fillRect(cx - 4 + i * 3, cy - 25, 2, 4);
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(cx - 4, cy - 20, 3, 20);
  // Window slits
  ctx.fillStyle = '#1a1412';
  ctx.fillRect(cx - 1, cy - 9, 2, 5); ctx.fillRect(cx - 1, cy + 1, 2, 4);
  // Golden flame apex + glow
  const fp = 0.7 + 0.3 * Math.sin(gt / 250);
  safeGlow(ctx, cx, cy - 26, 3, '#ffcc00', 10 * fp);
  ctx.fillStyle = '#ffd840'; ctx.beginPath(); ctx.arc(cx, cy - 27, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8a0'; ctx.beginPath(); ctx.arc(cx - 0.5, cy - 28, 1.8, 0, Math.PI * 2); ctx.fill();
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(cx + 3, cy + 6, 8, 12);
}

/* ── Tower Drawing ──────────────────────────────────────────────── */

function drawArrowTower(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean) {
  const lv = t.lvl, cx = x + CELL / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 6, y + CELL - 10, CELL - 8, 8);
  // Base platform
  ctx.fillStyle = '#6a7060'; rr(ctx, x + 3, y + 12, CELL - 6, CELL - 14, 4);
  ctx.fillStyle = '#7a8070'; rr(ctx, x + 4, y + 13, CELL - 10, CELL - 18, 3);
  // Tower body
  ctx.fillStyle = firing ? '#8a9878' : '#6a7a60'; ctx.fillRect(cx - 9, y + 4, 18, CELL - 14);
  ctx.fillStyle = firing ? '#9aa888' : '#7a8870'; ctx.fillRect(cx - 8, y + 5, 8, CELL - 16);
  // Battlements — 4 merlons
  ctx.fillStyle = '#7a8a70';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + i * 9, y, 6, 7);
  ctx.fillStyle = '#8a9a80';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 9, y + 1, 4, 5);
  // Arrow slits (glowing when firing)
  ctx.fillStyle = firing ? '#ffe070' : '#1a1c14';
  ctx.fillRect(cx - 4, y + 12, 2, 10); ctx.fillRect(cx + 2, y + 12, 2, 10);
  if (firing) {
    safeGlow(ctx, cx, y + 17, 2, '#ffe070', 6);
  }
  // Level upgrades
  if (lv >= 2) {
    ctx.strokeStyle = '#805030'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx + 8, y); ctx.lineTo(cx + 8, y - 12); ctx.stroke();
    ctx.fillStyle = '#c04030'; tri(ctx, cx + 8, y - 12, cx + 8, y - 6, cx + 17, y - 9);
  }
  if (lv >= 3) {
    ctx.fillStyle = '#5a6a52'; ctx.fillRect(x + 1, y + 8, 9, CELL - 18);
    ctx.fillStyle = '#6a7a62';
    for (let i = 0; i < 2; i++) ctx.fillRect(x + 2 + i * 4, y + 4, 3, 5);
  }
}

function drawWizardSpire(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean, gt: number) {
  const lv = t.lvl, cx = x + CELL / 2;
  const orbR = lv === 1 ? 6 : lv === 2 ? 8 : 11;
  const orbCol = lv === 3 ? '#f0c030' : lv === 2 ? '#a060ff' : '#6080ff';
  // Orb glow
  safeGlow(ctx, cx, y + 4, orbR * (firing ? 1.2 : 0.6), orbCol, orbR * (firing ? 2 : 1));
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 5, y + CELL - 10, CELL - 6, 8);
  // Dark star-tower base
  ctx.fillStyle = '#1e2060'; rr(ctx, x + 5, y + 22, CELL - 10, CELL - 24, 6);
  ctx.fillStyle = '#2a2880'; rr(ctx, x + 7, y + 24, CELL - 14, CELL - 28, 4);
  // Marble spire
  ctx.fillStyle = '#c8d8f0'; ctx.fillRect(cx - 4, y + 8, 8, CELL - 22);
  ctx.fillStyle = '#e0eeff'; ctx.fillRect(cx - 2, y + 8, 4, CELL - 22);
  ctx.fillStyle = '#b0c0d8'; ctx.fillRect(cx + 2, y + 8, 2, CELL - 22);
  // Pointed tip
  ctx.fillStyle = '#d8e8f8'; tri(ctx, cx, y - 2, cx - 6, y + 10, cx + 6, y + 10);
  ctx.fillStyle = '#eef6ff'; tri(ctx, cx, y, cx - 4, y + 10, cx + 4, y + 10);
  // Orb at peak
  ctx.fillStyle = orbCol; ctx.beginPath(); ctx.arc(cx, y + 4, orbR * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(cx - orbR * 0.3, y + 4 - orbR * 0.3, orbR * 0.25, 0, Math.PI * 2); ctx.fill();
  // Rotating sparkles
  const speed = gt / (firing ? 350 : 800);
  const nSpark = lv >= 2 ? 6 : 4;
  ctx.fillStyle = lv === 3 ? '#f8e040' : '#a0b8ff';
  for (let i = 0; i < nSpark; i++) {
    const a = speed + i * Math.PI * 2 / nSpark;
    const sr = orbR + 6 + Math.sin(gt / 300 + i) * 2;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * sr, y + 4 + Math.sin(a) * sr * 0.6, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  if (lv >= 3) {
    ctx.strokeStyle = orbCol + '66'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.arc(cx, y + 4, orbR + 16, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawCatapult(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean) {
  const cx = x + CELL / 2, cy = y + CELL / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 2, cy + 12, CELL - 4, 8);
  // Platform
  ctx.fillStyle = '#8a5020'; ctx.fillRect(x + 3, cy + 2, CELL - 6, 14);
  ctx.fillStyle = '#a06030'; ctx.fillRect(x + 3, cy + 2, CELL - 6, 4);
  ctx.fillStyle = '#6a4018'; ctx.fillRect(x + 3, cy + 14, CELL - 6, 4);
  // Planks
  ctx.strokeStyle = '#603818'; ctx.lineWidth = 1;
  for (let i = cy + 6; i < cy + 14; i += 5) {
    ctx.beginPath(); ctx.moveTo(x + 5, i); ctx.lineTo(x + CELL - 5, i); ctx.stroke();
  }
  // Wheels
  [x + 9, x + CELL - 13].forEach(wx => {
    ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.arc(wx, cy + 14, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b07030'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(wx, cy + 14, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#7a5020'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(wx, cy + 14); ctx.lineTo(wx + Math.cos(a) * 7, cy + 14 + Math.sin(a) * 7); ctx.stroke();
    }
  });
  // Arm + rock
  const armAngle = firing ? -0.65 : 1.0;
  ctx.save(); ctx.translate(cx, cy + 4); ctx.rotate(armAngle);
  ctx.fillStyle = '#9a5828'; ctx.fillRect(-2, -22, 5, 26);
  ctx.fillStyle = '#b07038'; ctx.fillRect(-1, -22, 2, 10);
  // Rock
  ctx.fillStyle = '#888898'; ctx.beginPath(); ctx.arc(1, -22, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a0a0b0'; ctx.beginPath(); ctx.arc(-1, -23, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Counterweight
  ctx.save(); ctx.translate(cx, cy + 4); ctx.rotate(armAngle + Math.PI);
  ctx.fillStyle = '#585048'; ctx.beginPath(); ctx.arc(0, -7, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawElvenWatch(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean) {
  const lv = t.lvl, cx = x + CELL / 2, cy = y + CELL / 2;
  if (firing) safeGlow(ctx, cx, y + 8, 8, '#60f080', 12);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 5, y + CELL - 10, CELL - 6, 8);
  // Elegant silver column with slight taper
  ctx.fillStyle = '#c8d8e8'; ctx.fillRect(cx - 5, y + 10, 10, CELL - 12);
  ctx.fillStyle = '#e0eef8'; ctx.fillRect(cx - 3, y + 10, 5, CELL - 12);
  ctx.fillStyle = '#a8b8c8'; ctx.fillRect(cx + 2, y + 10, 2, CELL - 12);
  // Pointed Elven tip
  ctx.fillStyle = '#d8e8f0'; tri(ctx, cx, y - 2, cx - 7, y + 12, cx + 7, y + 12);
  ctx.fillStyle = '#f0f8ff'; tri(ctx, cx, y, cx - 5, y + 12, cx + 5, y + 12);
  // Leaf wing ornaments
  ctx.strokeStyle = firing ? '#60e898' : '#58b870'; ctx.lineWidth = 2;
  for (const [lx, sign] of [[cx - 5, -1], [cx + 5, 1]] as [number, number][]) {
    ctx.beginPath(); ctx.arc(lx + sign * 3, y + CELL / 2, 9, -Math.PI * 0.65 + sign * 0.2, Math.PI * 0.45 + sign * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(lx + sign * 3, y + CELL / 2 - 6, 7, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  }
  // Window with inner glow
  ctx.fillStyle = firing ? '#80ffc0' : '#508898'; ctx.fillRect(cx - 1, y + CELL / 2 - 5, 2, 9);
  if (lv >= 2) {
    ctx.fillStyle = '#b0c8d8'; ctx.fillRect(cx - 11, y + CELL / 2 - 1, 22, 4);
    ctx.fillStyle = '#d0e0e8'; ctx.fillRect(cx - 11, y + CELL / 2 - 1, 22, 2);
  }
  if (lv >= 3) {
    ctx.fillStyle = '#c8d8e8';
    ctx.fillRect(cx - 16, y + 14, 8, CELL - 18); tri(ctx, cx - 12, y + 4, cx - 19, y + 16, cx - 5, y + 16);
    ctx.fillRect(cx + 8, y + 14, 8, CELL - 18);  tri(ctx, cx + 12, y + 4, cx + 5, y + 16, cx + 19, y + 16);
    ctx.fillStyle = '#ddeef8'; ctx.fillRect(cx - 15, y + 14, 3, CELL - 18); ctx.fillRect(cx + 9, y + 14, 3, CELL - 18);
  }
}

function drawBeaconTower(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, gt: number) {
  const lv = t.lvl, cx = x + CELL / 2;
  const fireH = lv === 1 ? 14 : lv === 2 ? 20 : 28;
  const pulse = 0.80 + 0.20 * Math.sin(gt / 120);
  // Big warm glow
  safeGlow(ctx, cx, y + 4, 8, '#ff8800', fireH + 8);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 4, y + CELL - 10, CELL - 4, 8);
  // Stone column
  ctx.fillStyle = '#4a4030'; ctx.fillRect(cx - 7, y + 10, 14, CELL - 12);
  ctx.fillStyle = '#5a5040'; ctx.fillRect(cx - 6, y + 11, 8, CELL - 14);
  ctx.fillStyle = '#3a3020'; ctx.fillRect(cx + 2, y + 10, 3, CELL - 12);
  // Wide cap platform
  ctx.fillStyle = '#5a5038'; ctx.fillRect(cx - 15, y + 8, 30, 6);
  ctx.fillStyle = '#6a6048'; ctx.fillRect(cx - 15, y + 8, 30, 3);
  // Fire — 5 layers forming dramatic cone
  const fy = y + 8;
  ctx.fillStyle = `rgba(180,30,0,0.95)`;     tri(ctx, cx - 11 * pulse, fy, cx, fy - fireH, cx + 11 * pulse, fy);
  ctx.fillStyle = `rgba(240,80,0,0.90)`;     tri(ctx, cx - 8 * pulse, fy, cx, fy - fireH * .82, cx + 8 * pulse, fy);
  ctx.fillStyle = `rgba(255,150,0,0.88)`;    tri(ctx, cx - 6 * pulse, fy, cx, fy - fireH * .66, cx + 6 * pulse, fy);
  ctx.fillStyle = `rgba(255,220,40,0.82)`;   tri(ctx, cx - 4 * pulse, fy, cx, fy - fireH * .50, cx + 4 * pulse, fy);
  ctx.fillStyle = `rgba(255,255,180,0.75)`;  tri(ctx, cx - 2 * pulse, fy, cx, fy - fireH * .34, cx + 2 * pulse, fy);
  ctx.fillStyle = `rgba(255,255,255,0.60)`;  tri(ctx, cx - 1 * pulse, fy, cx, fy - fireH * .18, cx + 1 * pulse, fy);
  // Flying embers Lv3
  if (lv >= 3) {
    for (let i = 0; i < 7; i++) {
      const a = gt / 180 + i * 0.9;
      const er = 14 + Math.sin(gt / 150 + i * 1.3) * 6;
      const alpha = 0.5 + 0.3 * Math.sin(gt / 200 + i);
      ctx.fillStyle = `rgba(255,180,0,${alpha})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * er, fy - fireH * 0.4 + Math.sin(a) * 4, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawRohirrimPost(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean) {
  const lv = t.lvl, cx = x + CELL / 2, cy = y + CELL / 2;
  if (firing) safeGlow(ctx, cx, cy, 10, '#e8c040', 12);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x + 2, cy + 6, CELL - 4, 10);
  // Wooden hall
  ctx.fillStyle = '#9a6028'; rr(ctx, x + 2, cy - 2, CELL - 4, CELL - cy + y + 2, 4);
  ctx.fillStyle = '#7a4818'; ctx.fillRect(x + 2, cy + 8, CELL - 4, CELL - cy + y - 8);
  // Planking
  ctx.strokeStyle = '#603818'; ctx.lineWidth = 1;
  for (let ry = cy + 6; ry < y + CELL - 3; ry += 7) {
    ctx.beginPath(); ctx.moveTo(x + 4, ry); ctx.lineTo(x + CELL - 4, ry); ctx.stroke();
  }
  // Pitched thatched roof
  ctx.fillStyle = '#a87030'; tri(ctx, cx, y + 2, x + 1, cy, x + CELL - 1, cy);
  ctx.fillStyle = '#c09040'; tri(ctx, cx, y + 4, x + 3, cy - 1, x + CELL - 3, cy - 1);
  // Straw texture on roof
  ctx.strokeStyle = '#b88038'; ctx.lineWidth = 0.8;
  for (let i = x + 6; i < x + CELL - 4; i += 5) {
    ctx.beginPath(); ctx.moveTo(i, cy - 1); ctx.lineTo(cx, y + 4); ctx.stroke();
  }
  // Horse head silhouette
  ctx.fillStyle = '#e8c048';
  ctx.beginPath(); ctx.ellipse(cx + 2, cy + 5, 8, 6, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d0a838';
  ctx.beginPath(); ctx.ellipse(cx + 7, cy - 1, 5, 6, 0.4, 0, Math.PI * 2); ctx.fill();
  // Ear
  ctx.fillStyle = '#e8c048'; tri(ctx, cx + 5, cy - 6, cx + 8, cy - 12, cx + 11, cy - 5);
  // Eye
  ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.arc(cx + 9, cy - 3, 1.3, 0, Math.PI * 2); ctx.fill();
  // Mane
  ctx.fillStyle = '#f0d060'; ctx.fillRect(cx + 5, cy - 7, 2, 10);
  // Banners
  if (lv >= 2) {
    ctx.strokeStyle = '#b09030'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + CELL - 8, y + 2); ctx.lineTo(x + CELL - 8, y + 18); ctx.stroke();
    ctx.fillStyle = '#f0d040'; tri(ctx, x + CELL - 8, y + 2, x + CELL - 8, y + 10, x + CELL, y + 6);
  }
  if (lv >= 3) {
    ctx.strokeStyle = '#d8c028'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 4, y + 18); ctx.stroke();
    ctx.fillStyle = '#fff040'; tri(ctx, x + 4, y + 2, x + 4, y + 10, x + 14, y + 6);
  }
}

function drawEntGuardian(ctx: CanvasRenderingContext2D, x: number, y: number, t: Tower, firing: boolean) {
  const lv = t.lvl, cx = x + CELL / 2, cy = y + CELL / 2;
  if (firing) safeGlow(ctx, cx, cy - 10, 15, '#50c820', 14);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(cx + 2, cy + CELL / 2 - 4, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Root system
  ctx.strokeStyle = '#6a4020'; ctx.lineWidth = 3;
  for (const [dx, dy] of [[-14, 8], [-8, 13], [8, 13], [14, 8]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx, cy + 12);
    ctx.quadraticCurveTo(cx + dx * 0.45, cy + 16, cx + dx, cy + dy + 8); ctx.stroke();
  }
  ctx.strokeStyle = '#4a2e14'; ctx.lineWidth = 2;
  for (const [dx, dy] of [[-18, 14], [18, 14]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(cx, cy + 14);
    ctx.quadraticCurveTo(cx + dx * 0.5, cy + 18, cx + dx, cy + dy + 6); ctx.stroke();
  }
  // Irregular bark trunk
  ctx.fillStyle = '#7a4c24'; ctx.fillRect(cx - 7, y + 18, 14, CELL - 20);
  ctx.fillStyle = '#8a5c2c'; ctx.fillRect(cx - 6, y + 19, 5, CELL - 22);
  ctx.fillStyle = '#5a3a18'; ctx.fillRect(cx - 7, y + 24, 3, CELL - 30); ctx.fillRect(cx + 4, y + 22, 3, CELL - 28);
  // Bark horizontal lines
  ctx.strokeStyle = '#3e2810'; ctx.lineWidth = 1;
  for (let ry = y + 21; ry < y + CELL - 6; ry += 8) {
    ctx.beginPath(); ctx.moveTo(cx - 5, ry); ctx.bezierCurveTo(cx - 2, ry + 2, cx + 1, ry - 1, cx + 5, ry + 1); ctx.stroke();
  }
  // Lush canopy (multiple blobs)
  const cn = lv === 1 ? '#2e6820' : lv === 2 ? '#388828' : '#48a032';
  const cr = lv === 1 ? 14 : lv === 2 ? 17 : 20;
  const cn2 = lv === 1 ? '#3a7828' : lv === 2 ? '#44a030' : '#54bc3c';
  safeGlow(ctx, cx, y + 10, cr * 0.3, '#40b020', 6);
  for (const [dx, dy, r, col] of [
    [0, 0, cr, cn], [-9, 4, cr - 5, cn], [9, 4, cr - 5, cn],
    [0, -5, cr - 7, cn2], [-5, -3, cr - 9, cn2], [5, -3, cr - 9, cn2]
  ] as [number, number, number, string][]) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + dx, y + 10 + dy, r, 0, Math.PI * 2); ctx.fill();
  }
  // Eyes in trunk
  ctx.fillStyle = '#f0d820';
  ctx.beginPath(); ctx.ellipse(cx - 3, y + 23, 2.8, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 3, y + 23, 2.8, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1408';
  ctx.beginPath(); ctx.ellipse(cx - 3, y + 23, 1.3, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 3, y + 23, 1.3, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  // Lv3: amber age-glow
  if (lv >= 3) safeGlow(ctx, cx, y + 10, cr * 0.2, '#c8a020', 10);
}

function drawTowerAt(ctx: CanvasRenderingContext2D, t: Tower, gs: GS, selected: boolean, alpha = 1) {
  const x = t.col * CELL, y = t.row * CELL;
  const cx = x + CELL / 2, cy = y + CELL / 2;
  const firing = gs.gt - t.lastFired < 270;
  ctx.globalAlpha = alpha;

  // Selected range ring
  if (selected && alpha === 1) {
    ctx.strokeStyle = TCFG[t.type].color + '55'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, tRng(t) * CELL, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = TCFG[t.type].color + 'bb'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, CELL / 2 - 1, 0, Math.PI * 2); ctx.stroke();
  }

  switch (t.type) {
    case 'arrow':    drawArrowTower(ctx, x, y, t, firing); break;
    case 'wizard':   drawWizardSpire(ctx, x, y, t, firing, gs.gt); break;
    case 'catapult': drawCatapult(ctx, x, y, t, firing); break;
    case 'elven':    drawElvenWatch(ctx, x, y, t, firing); break;
    case 'beacon':   drawBeaconTower(ctx, x, y, t, gs.gt); break;
    case 'rohirrim': drawRohirrimPost(ctx, x, y, t, firing); break;
    case 'treant':   drawEntGuardian(ctx, x, y, t, firing); break;
  }

  // Level pips
  if (alpha === 1) {
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < t.lvl ? TCFG[t.type].color : '#1c1610';
      ctx.beginPath(); ctx.arc(x + 8 + i * 10, y + CELL - 6, 3, 0, Math.PI * 2); ctx.fill();
      if (i < t.lvl) {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(x + 8 + i * 10, y + CELL - 6, 3, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

/* ── Enemy Drawing ──────────────────────────────────────────────── */

function drawOrc(ctx: CanvasRenderingContext2D, e: Enemy, slowed: boolean) {
  const c = slowed ? '#60887a' : '#3a7228';
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(e.x + 1, e.y + 10, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(e.x, e.y, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = slowed ? '#78a890' : '#50a038';
  ctx.beginPath(); ctx.arc(e.x - 2, e.y - 2, 5, 0, Math.PI * 2); ctx.fill();
  // Glowing red eyes
  ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(e.x - 3, e.y - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(e.x + 3, e.y - 2, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(e.x - 3, e.y - 2, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(e.x + 3, e.y - 2, 0.7, 0, Math.PI * 2); ctx.fill();
  // Tusks
  ctx.fillStyle = '#f0e8c0'; ctx.beginPath(); ctx.arc(e.x - 2, e.y + 5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e.x + 2, e.y + 5, 1.8, 0, Math.PI * 2); ctx.fill();
  // Axe weapon
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(e.x + 7, e.y - 4); ctx.lineTo(e.x + 11, e.y - 8); ctx.stroke();
  ctx.fillStyle = '#a0a0b0'; tri(ctx, e.x + 10, e.y - 10, e.x + 14, e.y - 6, e.x + 9, e.y - 5);
}

function drawWarg(ctx: CanvasRenderingContext2D, e: Enemy, slowed: boolean) {
  const c = slowed ? '#a08070' : '#9a6530';
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(e.x + 1, e.y + 10, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Body
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(e.x, e.y + 2, 12, 7, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = slowed ? '#b89080' : '#7a5020';
  ctx.beginPath(); ctx.ellipse(e.x - 1, e.y, 8, 5, -0.1, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = '#805030'; ctx.beginPath(); ctx.ellipse(e.x + 8, e.y - 2, 5.5, 5.5, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#906040'; ctx.beginPath(); ctx.ellipse(e.x + 7, e.y - 3, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Ear
  ctx.fillStyle = '#805030'; tri(ctx, e.x + 5, e.y - 7, e.x + 8, e.y - 13, e.x + 12, e.y - 6);
  // Snarling mouth
  ctx.fillStyle = '#e03020'; ctx.beginPath(); ctx.arc(e.x + 10, e.y + 1, 2.5, Math.PI * 0.1, Math.PI * 0.9); ctx.fill();
  ctx.fillStyle = '#f8f0e0'; ctx.beginPath(); ctx.arc(e.x + 9, e.y, 1.5, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.fillStyle = '#ff8000'; ctx.beginPath(); ctx.arc(e.x + 10, e.y - 4, 2, 0, Math.PI * 2); ctx.fill();
  // Rider
  ctx.fillStyle = '#302018'; ctx.beginPath(); ctx.ellipse(e.x - 6, e.y, 4.5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#483020'; ctx.beginPath(); ctx.arc(e.x - 6, e.y - 5, 3, 0, Math.PI * 2); ctx.fill();
}

function drawUrukhai(ctx: CanvasRenderingContext2D, e: Enemy, slowed: boolean) {
  const c = slowed ? '#505050' : '#303028';
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(e.x + 1, e.y + 13, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Armored body
  ctx.fillStyle = c; rr(ctx, e.x - 11, e.y - 12, 22, 26, 3);
  ctx.fillStyle = '#404038'; rr(ctx, e.x - 9, e.y - 10, 18, 20, 2);
  // Iron helmet
  ctx.fillStyle = '#222220'; ctx.fillRect(e.x - 9, e.y - 14, 18, 8);
  ctx.fillStyle = '#303028'; ctx.fillRect(e.x - 9, e.y - 14, 18, 4);
  // Nasal guard
  ctx.fillStyle = '#181810'; ctx.fillRect(e.x - 1, e.y - 14, 2, 6);
  // Shoulder pauldrons
  ctx.fillStyle = '#484840'; ctx.beginPath(); ctx.arc(e.x - 11, e.y - 5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e.x + 11, e.y - 5, 6, 0, Math.PI * 2); ctx.fill();
  // White Hand of Saruman — palm + 5 fingers
  ctx.fillStyle = 'rgba(245,242,228,0.95)';
  ctx.beginPath(); ctx.arc(e.x, e.y - 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(230,228,210,0.8)';
  for (const [dx, dy] of [[0, -6], [-4, -2], [4, -2], [-3, 2.5], [3, 2.5]] as [number, number][]) {
    ctx.beginPath(); ctx.arc(e.x + dx, e.y + dy, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  // Weapon — pike
  ctx.strokeStyle = '#707060'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(e.x + 10, e.y - 14); ctx.lineTo(e.x + 12, e.y - 24); ctx.stroke();
  ctx.fillStyle = '#c0c0a0'; tri(ctx, e.x + 12, e.y - 26, e.x + 10, e.y - 22, e.x + 14, e.y - 22);
}

function drawTroll(ctx: CanvasRenderingContext2D, e: Enemy, slowed: boolean) {
  const c = slowed ? '#8898a8' : '#6a7868';
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.beginPath(); ctx.ellipse(e.x + 2, e.y + 18, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
  // Massive body
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(e.x, e.y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = slowed ? '#98a8b8' : '#7a8a78';
  ctx.beginPath(); ctx.arc(e.x - 3, e.y - 4, 11, 0, Math.PI * 2); ctx.fill();
  // Stone texture patches
  ctx.fillStyle = slowed ? '#a0b0c0' : '#889080';
  ctx.beginPath(); ctx.arc(e.x + 5, e.y + 4, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e.x - 9, e.y + 7, 4.5, 0, Math.PI * 2); ctx.fill();
  // Highlight on top
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.arc(e.x - 5, e.y - 8, 5, 0, Math.PI * 2); ctx.fill();
  // Vicious red eyes
  ctx.fillStyle = '#e02020'; ctx.beginPath(); ctx.arc(e.x - 5, e.y - 8, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e02020'; ctx.beginPath(); ctx.arc(e.x + 3, e.y - 8, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff6000'; ctx.beginPath(); ctx.arc(e.x - 5, e.y - 8, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff6000'; ctx.beginPath(); ctx.arc(e.x + 3, e.y - 8, 1.2, 0, Math.PI * 2); ctx.fill();
  // Club
  ctx.fillStyle = '#6a5030'; ctx.beginPath(); ctx.ellipse(e.x + 14, e.y - 2, 8, 10, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a6040'; ctx.beginPath(); ctx.ellipse(e.x + 13, e.y - 4, 5, 7, 0.2, 0, Math.PI * 2); ctx.fill();
}

function drawNazgul(ctx: CanvasRenderingContext2D, e: Enemy, slowed: boolean, gt: number) {
  const p = 0.5 + 0.5 * Math.abs(Math.sin(gt / 700));
  safeGlow(ctx, e.x, e.y - 4, 10, '#4020a0', 18);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(e.x + 1, e.y + 14, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
  // Flowing cloak with wing-like extensions
  ctx.fillStyle = slowed ? '#301a58' : '#130a22';
  ctx.beginPath(); ctx.ellipse(e.x, e.y + 5, 14, 17, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = slowed ? '#241444' : '#0e0618';
  ctx.beginPath(); ctx.ellipse(e.x - 1, e.y - 4, 11, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Dramatic wing-cloak extensions
  ctx.fillStyle = '#10081a';
  ctx.beginPath(); ctx.moveTo(e.x - 13, e.y + 8); ctx.quadraticCurveTo(e.x - 20, e.y, e.x - 11, e.y - 10); ctx.lineTo(e.x - 8, e.y + 8); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(e.x + 13, e.y + 8); ctx.quadraticCurveTo(e.x + 20, e.y, e.x + 11, e.y - 10); ctx.lineTo(e.x + 8, e.y + 8); ctx.closePath(); ctx.fill();
  // Nazgul crown
  ctx.fillStyle = '#604880';
  ctx.beginPath(); ctx.arc(e.x, e.y - 11, 7, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8060a8';
  for (let i = 0; i < 5; i++) {
    const a = Math.PI + i * Math.PI / 4;
    ctx.fillRect(e.x + Math.cos(a) * 6 - 1, e.y - 11 + Math.sin(a) * 6 - 3, 2, 4);
  }
  // Pale flame eyes — iconic
  safeGlow(ctx, e.x - 3, e.y - 11, 2, '#ffffa0', 5 * p);
  safeGlow(ctx, e.x + 3, e.y - 11, 2, '#ffffa0', 5 * p);
  ctx.fillStyle = `rgba(255, 230, 60, ${p})`;
  ctx.beginPath(); ctx.arc(e.x - 3, e.y - 11, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e.x + 3, e.y - 11, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 160, ${p * 0.8})`;
  ctx.beginPath(); ctx.arc(e.x - 3, e.y - 11, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(e.x + 3, e.y - 11, 1.2, 0, Math.PI * 2); ctx.fill();
}

function drawBalrog(ctx: CanvasRenderingContext2D, e: Enemy, gt: number) {
  const sz = ECFG[e.type].sz;
  const p = 0.65 + 0.35 * Math.abs(Math.sin(gt / 380));
  // Massive fire aura
  safeGlow(ctx, e.x, e.y, sz * 0.7, '#ff4000', sz * 1.8);
  safeGlow(ctx, e.x, e.y - 6, 4, '#ff2000', sz);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(e.x + 2, e.y + 22, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
  // Dark bat wings
  ctx.fillStyle = '#180800';
  tri(ctx, e.x, e.y - 10, e.x - sz * 3.8, e.y - sz, e.x - sz, e.y + 6);
  tri(ctx, e.x, e.y - 10, e.x + sz * 3.8, e.y - sz, e.x + sz, e.y + 6);
  // Wing fire edge
  ctx.strokeStyle = `rgba(255,90,0,0.45)`; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(e.x, e.y - 10); ctx.lineTo(e.x - sz * 3.8, e.y - sz); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(e.x, e.y - 10); ctx.lineTo(e.x + sz * 3.8, e.y - sz); ctx.stroke();
  // Demon body — dark with fire cracks
  ctx.fillStyle = '#1c0800'; ctx.beginPath(); ctx.arc(e.x, e.y, sz, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,${Math.floor(80 * p)},0,0.9)`;
  ctx.beginPath(); ctx.arc(e.x - 4, e.y + 2, sz * 0.65, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,190,0,${p * 0.9})`;
  ctx.beginPath(); ctx.arc(e.x - 4, e.y, sz * 0.40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255,250,100,${p * 0.75})`;
  ctx.beginPath(); ctx.arc(e.x - 5, e.y - 2, sz * 0.20, 0, Math.PI * 2); ctx.fill();
  // Blazing white eyes
  for (const [dx, dy] of [[-6, -9], [6, -9]] as [number, number][]) {
    safeGlow(ctx, e.x + dx, e.y + dy, 3, '#ffffff', 7);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(e.x + dx, e.y + dy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffee00'; ctx.beginPath(); ctx.arc(e.x + dx, e.y + dy, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // Fiery whip
  ctx.strokeStyle = `rgba(255,${Math.floor(100 + 100 * p)},0,0.9)`; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(e.x + sz, e.y + 2);
  ctx.bezierCurveTo(e.x + sz + 12, e.y - 8, e.x + sz + 24, e.y + 12, e.x + sz + 34, e.y + 6); ctx.stroke();
  ctx.strokeStyle = `rgba(255,230,0,0.55)`; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(e.x + sz, e.y + 2);
  ctx.bezierCurveTo(e.x + sz + 12, e.y - 8, e.x + sz + 24, e.y + 12, e.x + sz + 34, e.y + 6); ctx.stroke();
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, gs: GS) {
  if (!isFinite(e.x) || !isFinite(e.y)) return;
  const slowed = gs.gt < e.slowUntil;
  if (slowed) {
    ctx.fillStyle = 'rgba(70,150,255,0.14)';
    ctx.beginPath(); ctx.arc(e.x, e.y, ECFG[e.type].sz + 9, 0, Math.PI * 2); ctx.fill();
  }
  switch (e.type) {
    case 'orc':     drawOrc(ctx, e, slowed); break;
    case 'warg':    drawWarg(ctx, e, slowed); break;
    case 'urukhai': drawUrukhai(ctx, e, slowed); break;
    case 'troll':   drawTroll(ctx, e, slowed); break;
    case 'nazgul':  drawNazgul(ctx, e, slowed, gs.gt); break;
    case 'balrog':  drawBalrog(ctx, e, gs.gt); break;
  }
  // Health bar
  const sz = ECFG[e.type].sz;
  const bw = sz * 3, bh = 5, bx = e.x - bw / 2, by = e.y - sz - 13;
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#1c1810'; ctx.fillRect(bx, by, bw, bh);
  const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));
  const hcol = pct > 0.6 ? '#38e050' : pct > 0.3 ? '#e8a820' : '#e02828';
  ctx.fillStyle = hcol; ctx.fillRect(bx, by, bw * pct, bh);
  if (pct > 0.5) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(bx, by, bw * pct, bh / 2); }
}

/* ── Main renderFrame ───────────────────────────────────────────── */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  gs: GS,
  hover: [number, number] | null,
  selType: TT,
  buildMode: boolean,
) {
  const { deco, buildableSet, roads } = gs.map;
  const isDay = gs.mode === 'day';
  ctx.clearRect(0, 0, GW, GH);

  /* ── Sky gradient — twilight dusk atmosphere ── */
  const sky = ctx.createLinearGradient(0, 0, 0, GH);
  if (isDay) {
    sky.addColorStop(0, '#1a2c44'); sky.addColorStop(0.4, '#142030'); sky.addColorStop(1, '#1c1208');
  } else {
    sky.addColorStop(0, '#08050f'); sky.addColorStop(0.5, '#060310'); sky.addColorStop(1, '#0c0608');
  }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, GW, GH);

  /* ── Atmospheric top glow (sun-haze / moon-haze) ── */
  if (isDay) {
    const sunGrad = ctx.createRadialGradient(GW * 0.7, 0, 0, GW * 0.7, 0, GH * 0.7);
    sunGrad.addColorStop(0, 'rgba(255,200,80,0.12)');
    sunGrad.addColorStop(0.5, 'rgba(200,120,40,0.06)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, GW, GH);
  } else {
    // Stars
    for (let i = 0; i < 90; i++) {
      const sx = (i * 137 + 53) % GW, sy = (i * 89 + 31) % (GH * 0.65);
      const br = 0.2 + 0.8 * Math.abs(Math.sin(gs.gt / 1400 + i * 0.8));
      ctx.globalAlpha = br * 0.9;
      ctx.fillStyle = i % 4 === 0 ? '#f0e0ff' : '#fff8f0';
      ctx.fillRect(sx, sy, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
    // Crescent moon
    safeGlow(ctx, GW - 50, 26, 11, '#f0e4c0', 22);
    ctx.fillStyle = '#f0e8c8'; ctx.beginPath(); ctx.arc(GW - 50, 26, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0810'; ctx.beginPath(); ctx.arc(GW - 55, 23, 10, 0, Math.PI * 2); ctx.fill();
  }

  /* ── Mordor glow (right edge — always, stronger at night) ── */
  const ms = isDay ? 0.14 : 0.38;
  const mg = ctx.createRadialGradient(GW, GH * 0.5, GH * 0.08, GW, GH * 0.5, GH * 1.1);
  mg.addColorStop(0, `rgba(220,50,0,${ms})`);
  mg.addColorStop(0.35, `rgba(130,25,0,${ms * 0.5})`);
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg; ctx.fillRect(0, 0, GW, GH);

  /* ── Terrain ── */
  // Precompute which cells get ambient city decorations
  const keepCX = KEEP[0], keepCY = KEEP[1];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
    const t = deco.get(`${c},${r}`) || 'none';
    const dist = Math.hypot(c - keepCX, r - keepCY);

    switch (t) {
      case 'road':      drawRoad(ctx, cx, cy); break;
      case 'buildable': drawBuildable(ctx, cx, cy); break;
      case 'keep':      drawKeep(ctx, cx, cy, gs.gt); break;
      case 'tree':      drawGrass(ctx, cx, cy); drawTree(ctx, cx, cy); break;
      case 'rock':      drawGrass(ctx, cx, cy); drawRock(ctx, cx, cy); break;
      case 'bush':      drawGrass(ctx, cx, cy); drawBush(ctx, cx, cy); break;
      default: {
        // Ambient city decorations on wild tiles near the keep
        const hash = (c * 37 + r * 23 + c * r * 7) % 13;
        if (dist < 5 && hash < 2) drawSmallHouse(ctx, cx, cy);
        else if (dist < 4 && hash === 2) drawWell(ctx, cx, cy);
        else if (dist < 7 && hash < 2) drawFarm(ctx, cx, cy);
        else drawGrass(ctx, cx, cy);
      }
    }
  }

  /* ── Subtle grid ── */
  ctx.strokeStyle = 'rgba(255,255,255,0.012)'; ctx.lineWidth = 1;
  for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, GH); ctx.stroke(); }
  for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(GW, r * CELL); ctx.stroke(); }

  /* ── Path directional hints ── */
  ctx.globalAlpha = 0.22;
  for (const road of roads) {
    ctx.strokeStyle = '#d8a020'; ctx.lineWidth = 1.5;
    for (let i = 0; i < road.length - 1; i += 4) {
      const [c1, r1] = road[i];
      const [c2, r2] = road[Math.min(i + 1, road.length - 1)];
      const x1 = c1 * CELL + CELL / 2, y1 = r1 * CELL + CELL / 2;
      const x2 = c2 * CELL + CELL / 2, y2 = r2 * CELL + CELL / 2;
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const ax = dx / d * 5, ay = dy / d * 5;
      ctx.beginPath();
      ctx.moveTo(mx - ax, my - ay); ctx.lineTo(mx + ax, my + ay);
      ctx.lineTo(mx + ay * 0.5 - ax * 0.5, my - ax * 0.5 + ay * (-0.5));
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  /* ── Tower territory influence (subtle colored circles under towers) ── */
  for (const [, t] of gs.towers) {
    if (t.type === 'beacon') continue;
    const tx = t.col * CELL + CELL / 2, ty = t.row * CELL + CELL / 2;
    const tg = ctx.createRadialGradient(tx, ty, CELL * 0.4, tx, ty, tRng(t) * CELL * 0.7);
    tg.addColorStop(0, TCFG[t.type].color + '18');
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(tx, ty, tRng(t) * CELL * 0.7, 0, Math.PI * 2); ctx.fill();
  }

  /* ── Ghost tower hover ── */
  if (buildMode && hover) {
    const [hc, hr] = hover, hk = `${hc},${hr}`;
    if (buildableSet.has(hk) && !gs.towers.has(hk)) {
      const ghostT: Tower = { col: hc, row: hr, type: selType, lastFired: -9999, lvl: 1, key: hk, angle: 0 };
      drawTowerAt(ctx, ghostT, gs, false, 0.28);
      ctx.strokeStyle = TCFG[selType].color + 'aa'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(hc * CELL + CELL / 2, hr * CELL + CELL / 2, tRng({ type: selType, lvl: 1 }) * CELL, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    } else if (hover) {
      ctx.strokeStyle = 'rgba(230,50,50,0.8)'; ctx.lineWidth = 2;
      ctx.strokeRect(hover[0] * CELL + 3, hover[1] * CELL + 3, CELL - 6, CELL - 6);
    }
  }

  /* ── Towers ── */
  for (const [, t] of gs.towers) drawTowerAt(ctx, t, gs, gs.selectedKey === t.key);

  /* ── Projectiles ── */
  for (const p of gs.projs) {
    if (!isFinite(p.x) || !isFinite(p.y)) continue;
    const isBig = p.splash > 0;
    safeGlow(ctx, p.x, p.y, isBig ? 5 : 2, p.color, isBig ? 16 : 8);
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, isBig ? 5 : 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.arc(p.x, p.y, isBig ? 2.2 : 1, 0, Math.PI * 2); ctx.fill();
  }

  /* ── Particles ── */
  for (const p of gs.particles) {
    if (!isFinite(p.x) || !isFinite(p.y)) continue;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.2, p.r * (p.life / p.maxLife)), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* ── Enemies ── */
  for (const e of gs.enemies) drawEnemy(ctx, e, gs);

  /* ── Floating text ── */
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px Cinzel, Georgia, serif';
  for (const f of gs.floats) {
    const alpha = Math.max(0, 1 - f.age / 1800);
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = '#000'; ctx.fillText(f.text, f.x + 1, f.y - f.age * 0.030 + 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y - f.age * 0.030);
  }
  ctx.globalAlpha = 1;

  /* ── Night veil ── */
  if (!isDay) {
    ctx.fillStyle = 'rgba(0,0,25,0.28)'; ctx.fillRect(0, 0, GW, GH);
    // Torch light on keep
    const kx = KEEP[0] * CELL + CELL / 2, ky = KEEP[1] * CELL + CELL / 2;
    safeGlow(ctx, kx, ky, 10, '#e8b040', 12 + 4 * Math.sin(gs.gt / 280));
  }

  /* ── Beacon of Gondor — golden pulse ── */
  if (gs.beaconActive) {
    const pulse = 0.06 + 0.04 * Math.abs(Math.sin(gs.gt / 170));
    ctx.fillStyle = `rgba(255,210,60,${pulse})`; ctx.fillRect(0, 0, GW, GH);
    const kx = KEEP[0] * CELL + CELL / 2, ky = KEEP[1] * CELL + CELL / 2;
    const ringR = ((gs.gt % 1200) / 1200) * GH;
    const ringAlpha = 0.3 * (1 - ringR / GH);
    if (ringAlpha > 0) {
      ctx.strokeStyle = `rgba(255,210,60,${ringAlpha})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(kx, ky, ringR, 0, Math.PI * 2); ctx.stroke();
    }
  }

  /* ── Eye of Sauron vignette ── */
  if (gs.eyeOfSauron > 40) {
    const intensity = (gs.eyeOfSauron - 40) / 60 * 0.30;
    const vg = ctx.createRadialGradient(GW / 2, GH / 2, GH * 0.12, GW / 2, GH / 2, GH);
    vg.addColorStop(0, 'transparent');
    vg.addColorStop(1, `rgba(190,15,0,${intensity})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, GW, GH);
  }
  // Eye graphic at extreme threat
  if (gs.eyeOfSauron >= 80) {
    const ep = 0.3 + 0.3 * Math.abs(Math.sin(gs.gt / 480));
    safeGlow(ctx, GW * 0.84, GH * 0.11, 14, '#ff5000', 24 * ep);
    ctx.fillStyle = `rgba(255,90,0,${ep * 0.95})`; ctx.beginPath(); ctx.ellipse(GW * 0.84, GH * 0.11, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(0,0,0,${ep})`; ctx.beginPath(); ctx.ellipse(GW * 0.84, GH * 0.11, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,200,0,${ep * 0.8})`; ctx.beginPath(); ctx.ellipse(GW * 0.84, GH * 0.11, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
  }

  /* ── Phase progress bar ── */
  const phaseMax = isDay ? DAY_LEN : NIGHT_LEN;
  const phaseW = GW * Math.max(0, Math.min(1, gs.phaseTime / phaseMax));
  ctx.fillStyle = '#0a0806'; ctx.fillRect(0, GH - 5, GW, 5);
  const barG = ctx.createLinearGradient(0, 0, phaseW, 0);
  if (isDay) { barG.addColorStop(0, '#806010'); barG.addColorStop(1, '#d8aa28'); }
  else { barG.addColorStop(0, '#203070'); barG.addColorStop(1, '#5070c0'); }
  ctx.fillStyle = barG; ctx.fillRect(0, GH - 5, phaseW, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(0, GH - 5, phaseW, 2);
}
