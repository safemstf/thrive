'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

/* -------------------- Animations & Styles -------------------- */
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.55}`;
const slideIn = keyframes`from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}`;

const Wrap = styled.div`
  display:flex; flex-direction:column; width:100%; height:100%; min-height:560px;
  background:radial-gradient(ellipse at 50% 40%, #132712 0%, #071207 60%, #030603 100%);
  font-family: 'Crimson Text', serif; color:#efe6d0; user-select:none; overflow:hidden;
`;
const HUD = styled.div`
  display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;
  padding:0.45rem 1rem; background:linear-gradient(180deg, rgba(8,6,3,0.95), rgba(14,12,6,0.9));
  border-bottom:2px solid #3a2e14; flex-shrink:0; z-index:20;
`;
const HUDTitle = styled.div`
  font-family:'Cinzel',serif; font-weight:900; font-size:1.05rem; color:#f0b840; text-shadow:0 0 14px #b6861a66;
  letter-spacing:0.08em;
`;
const Stat = styled.div<{ $accent?: string }>`
  display:flex; align-items:center; gap:0.3rem; padding:0.2rem 0.6rem; border-radius:6px;
  background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.02);
  color:${p => p.$accent || '#efe6d0'}; font-size:0.84rem; font-weight:700;
`;
const WaveBadge = styled.div<{ $boss?: boolean }>`
  margin-left:auto; padding:0.22rem 0.7rem; border-radius:6px; font-size:0.78rem; font-weight:800;
  color:${p => p.$boss ? '#FF8C42' : '#A8E060'}; border:1px solid ${p => p.$boss ? '#FF8C4266' : '#A8E06066'};
  background:${p => p.$boss ? 'rgba(255,140,66,0.08)' : 'rgba(168,224,96,0.06)'};
  animation:${p => p.$boss ? pulse : 'none'} 0.9s ease-in-out infinite;
`;

const Main = styled.div`
  display:flex; flex:1; position:relative; overflow:hidden;
`;

const CanvasWrap = styled.div`
  flex:1; position:relative; overflow:auto; padding-right:280px;
`;
const CanvasEl = styled.canvas`
  display:block; cursor:crosshair; background:transparent;
`;

const Side = styled.aside`
  position:absolute; right:0; top:0; bottom:0; width:280px; z-index:25;
  background:linear-gradient(270deg, rgba(8,6,3,0.98), rgba(12,10,5,0.94));
  border-left:2px solid #3a2e14; padding:0.8rem; display:flex; flex-direction:column; gap:0.6rem; overflow:auto;
`;
const SideTitle = styled.div`
  font-family:'Cinzel',serif; font-size:0.78rem; font-weight:800; color:#f0b840; letter-spacing:0.08em; text-transform:uppercase;
  margin-bottom:0.3rem;
`;
const BuildBtn = styled.button<{ $sel?: boolean; $disabled?: boolean }>`
  display:flex; align-items:center; gap:0.5rem; padding:0.45rem 0.5rem; border-radius:7px; width:100%; text-align:left;
  background:${p => p.$sel ? 'rgba(240,184,64,0.08)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${p => p.$sel ? '#b6861a66' : 'transparent'};
  color:#efe6d0; cursor:${p => p.$disabled ? 'not-allowed' : 'pointer'}; opacity:${p => p.$disabled ? 0.44 : 1};
  transition:all 0.12s;
`;
const Small = styled.div`font-size:0.72rem;color:#bfa878;`;
const SelPanel = styled.div`
  background:rgba(200,146,26,0.06); border:1px solid rgba(200,146,26,0.16); border-radius:8px; padding:0.6rem;
`;
const ActBtn = styled.button<{ $danger?: boolean }>`
  display:block; width:100%; padding:0.36rem; border-radius:6px; margin-top:0.36rem;
  font-weight:800; font-family:'Cinzel',serif; font-size:0.78rem; cursor:pointer;
  background:${p => p.$danger ? 'rgba(224,80,32,0.12)' : 'rgba(72,180,72,0.09)'};
  border:1px solid ${p => p.$danger ? 'rgba(224,80,32,0.3)' : 'rgba(72,180,72,0.3)'};
  color:${p => p.$danger ? '#f08d78' : '#bfeec0'};
  &:disabled{opacity:0.42;cursor:not-allowed;}
`;

// New UI components
const ProgressBar = styled.div<{ $value: number; $color: string }>`
  width:100%; height:8px; background:rgba(0,0,0,0.4); border-radius:4px; overflow:hidden;
  div { height:100%; width:${p => p.$value}%; background:${p => p.$color}; transition:width 0.2s; }
`;
const SliderRow = styled.div`
  display:flex; align-items:center; gap:0.5rem; margin:0.3rem 0;
  span { min-width:60px; font-size:0.8rem; color:#bfa878; }
  input { flex:1; }
`;
const InfluenceButton = styled.button<{ $active?: boolean; $color: string }>`
  flex:1; padding:0.3rem; border-radius:6px; font-family:'Cinzel',serif; font-size:0.7rem;
  background:${p => p.$active ? p.$color + '33' : 'rgba(255,255,255,0.03)'};
  border:1px solid ${p => p.$active ? p.$color + '99' : 'transparent'};
  color:${p => p.$active ? p.$color : '#bfa878'};
  cursor:pointer; transition:all 0.1s;
  &:hover { background:${p => p.$color + '22'}; }
`;

/* -------------------- Grid & Kingdom Layout -------------------- */
const COLS = 26;
const ROWS = 18;
const CELL = 44;
const GW = COLS * CELL;
const GH = ROWS * CELL;
const DAY_LENGTH = 30000;        // 30 seconds day
const NIGHT_LENGTH = 20000;      // 20 seconds night
const CHAIN_RADIUS = 86;

// Kingdom center
const KEEP_CENTER: [number, number] = [12, 8];
const KEEP_RADIUS = 2.5;

// Spawn points (entrances)
const SPAWNS: [number, number][] = [
  [0, 0], [13, 0], [25, 0], [25, 9], [25, 17], [12, 17], [0, 17], [0, 9]
];

// Generate roads from each spawn to the keep (winding paths)
function generateRoadPath(startCol: number, startRow: number): [number, number][] {
  const path: [number, number][] = [[startCol, startRow]];
  let [c, r] = [startCol, startRow];
  const [targetCol, targetRow] = KEEP_CENTER;
  let safety = 0;
  while (Math.hypot(c - targetCol, r - targetRow) > KEEP_RADIUS && safety < 200) {
    safety++;
    const dc = targetCol - c;
    const dr = targetRow - r;
    const moveHorizontal = Math.abs(dc) > Math.abs(dr) ? Math.sign(dc) : 0;
    const moveVertical = Math.abs(dr) > Math.abs(dc) ? Math.sign(dr) : 0;
    // Jitter: sometimes move perpendicular
    if (Math.random() < 0.3) {
      if (moveHorizontal !== 0 && Math.random() < 0.5) {
        r += Math.sign(dr) || (Math.random() > 0.5 ? 1 : -1);
      } else if (moveVertical !== 0) {
        c += Math.sign(dc) || (Math.random() > 0.5 ? 1 : -1);
      } else {
        c += (Math.random() > 0.5 ? 1 : -1);
        r += (Math.random() > 0.5 ? 1 : -1);
      }
    } else {
      c += moveHorizontal;
      r += moveVertical;
    }
    c = Math.max(0, Math.min(COLS - 1, c));
    r = Math.max(0, Math.min(ROWS - 1, r));
    const last = path[path.length - 1];
    if (last[0] !== c || last[1] !== r) path.push([c, r]);
  }
  return path;
}

const ROADS: [number, number][][] = SPAWNS.map(spawn => generateRoadPath(spawn[0], spawn[1]));

// Set of road tiles
const ROAD_SET = new Set<string>();
for (const road of ROADS) {
  for (const [c, r] of road) ROAD_SET.add(`${c},${r}`);
}

// Buildable tiles: adjacent to roads (8-neighbor) and not road/keep
const BUILDABLE_SET = new Set<string>();
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const key = `${c},${r}`;
    if (ROAD_SET.has(key)) continue;
    if (Math.hypot(c - KEEP_CENTER[0], r - KEEP_CENTER[1]) < KEEP_RADIUS) continue; // keep area
    // check adjacency
    let adjacent = false;
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        const nc = c + dc, nr = r + dr;
        if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && ROAD_SET.has(`${nc},${nr}`)) {
          adjacent = true;
          break;
        }
      }
      if (adjacent) break;
    }
    if (adjacent) BUILDABLE_SET.add(key);
  }
}

// Enemy paths (use road pixel coordinates)
const PATH_PX: [number, number][][] = ROADS.map(road =>
  road.map(([c, r]) => [c * CELL + CELL / 2, r * CELL + CELL / 2] as [number, number])
);

// Terrain decoration map
const DECO = new Map<string, string>();
const WILD_TYPES = ['tree', 'bush', 'rock', 'flower', 'farmland', 'none', 'none'];
for (let c = 0; c < COLS; c++) {
  for (let r = 0; r < ROWS; r++) {
    const key = `${c},${r}`;
    if (ROAD_SET.has(key)) DECO.set(key, 'road');
    else if (BUILDABLE_SET.has(key)) DECO.set(key, 'buildable');
    else if (Math.hypot(c - KEEP_CENTER[0], r - KEEP_CENTER[1]) < KEEP_RADIUS) DECO.set(key, 'keep');
    else {
      const h = (c * 37 + r * 19 + c * r * 11) % WILD_TYPES.length;
      DECO.set(key, WILD_TYPES[h]);
    }
  }
}

function isVillage(c: number, r: number) {
  return Math.hypot(c - KEEP_CENTER[0], r - KEEP_CENTER[1]) < KEEP_RADIUS;
}

/* -------------------- Types -------------------- */
type TT = 'archer' | 'ballista' | 'mortar' | 'frost' | 'lightning' | 'barricade' | 'chapel';
type ET = 'goblin' | 'raider' | 'ogre' | 'wolf' | 'shaman' | 'warlord';

interface Tower { col: number; row: number; type: TT; lastFired: number; lvl: 1 | 2 | 3; key: string; }
interface Enemy { id: number; x: number; y: number; hp: number; maxHp: number; baseSpeed: number; speed: number; reward: number; wpIdx: number; pathPX: [number, number][]; type: ET; armor: number; slowUntil: number; slowPct: number; healRate: number; }
interface Proj { id: number; x: number; y: number; eid: number; dmg: number; spd: number; splash: number; chain: number; color: string; slowUntil: number; type: TT; }
interface Float { id: number; x: number; y: number; text: string; color: string; age: number; }
interface Particle { id: number; x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number; r: number; }
interface Spawn { type: ET; at: number; pathIdx: number; }

interface Population {
  total: number;
  farmers: number;
  builders: number;
  soldiers: number;
  faith: number;
  science: number;
  farmersCount: number;
  buildersCount: number;
  soldiersCount: number;
  faithCount: number;
  scienceCount: number;
}
interface Influence { faith: number; reason: number; dominion: number; }
interface EraBonuses { faith: number; reason: number; dominion: number; }

interface GS {
  gold: number; lives: number; wave: number; score: number; kills: number; gt: number;
  towers: Map<string, Tower>; enemies: Enemy[]; projs: Proj[]; floats: Float[]; particles: Particle[];
  waveActive: boolean; gameOver: boolean; countdown: number; waveStartGT: number; queue: Spawn[]; waveScale: number; waveLabel: string; isBoss: boolean; uid: number;
  selectedKey: string | null; selType: TT;
  mode: 'day' | 'night';
  dayLength: number; nightLength: number; phaseTime: number;
  population: Population;
  food: number; foodCapacity: number; happiness: number; dread: number;
  influence: Influence; influencePoints: number;
  eraBonuses: EraBonuses; eraChoiceAvailable: boolean; nextEraWave: number;
  panicShieldActive: boolean; panicShieldEndTime: number;
}

/* -------------------- Tower & Enemy Configs -------------------- */
interface TCfg { name: string; cost: number; range: number; dmg: number; rate: number; color: string; dark: string; pc: string; splash: number; chain: number; slow: number; emoji: string; desc: string; }
const TCFG: Record<TT, TCfg> = {
  archer: { name: 'Archer Post', cost: 60, range: 3.2, dmg: 18, rate: 2.6, color: '#a8e060', dark: '#2a4010', pc: '#a8e060', splash: 0, chain: 0, slow: 0, emoji: '🏹', desc: 'Fast arrows, good vs light foes' },
  ballista: { name: 'Ballista', cost: 110, range: 5.0, dmg: 90, rate: 0.6, color: '#e0a060', dark: '#4a2208', pc: '#e0a060', splash: 0, chain: 0, slow: 0, emoji: '🎯', desc: 'Long-range high single-target damage' },
  mortar: { name: 'Mortar', cost: 140, range: 3.2, dmg: 70, rate: 0.45, color: '#d04040', dark: '#500a0a', pc: '#d04040', splash: 64, chain: 0, slow: 0, emoji: '💥', desc: 'Area explosions' },
  frost: { name: 'Frost Spire', cost: 100, range: 3.0, dmg: 10, rate: 1.0, color: '#60c8f0', dark: '#082840', pc: '#60c8f0', splash: 0, chain: 0, slow: 0.55, emoji: '❄️', desc: 'Strong slow effect' },
  lightning: { name: 'Storm Tower', cost: 160, range: 2.8, dmg: 40, rate: 1.0, color: '#f0c020', dark: '#3a2800', pc: '#f0c020', splash: 0, chain: 4, slow: 0, emoji: '⚡', desc: 'Chains between targets' },
  barricade: { name: 'Barricade', cost: 30, range: 0, dmg: 0, rate: 0, color: '#8a7050', dark: '#2a1a08', pc: '#8a7050', splash: 0, chain: 0, slow: 0, emoji: '🪵', desc: 'Blocks tiles (cosmetic)' },
  chapel: { name: 'Chapel', cost: 200, range: 4.2, dmg: 0, rate: 0, color: '#f0e090', dark: '#3a3010', pc: '#f0e090', splash: 0, chain: 0, slow: 0, emoji: '⛪', desc: 'Damage aura to nearby towers' },
};

interface ECfg { hp: number; spd: number; reward: number; color: string; rim: string; sz: number; name: string; armor: number; healRate: number; }
const ECFG: Record<ET, ECfg> = {
  goblin: { hp: 70, spd: 95, reward: 8, color: '#80c840', rim: '#b0e870', sz: 8, name: 'Goblin', armor: 0, healRate: 0 },
  raider: { hp: 200, spd: 60, reward: 18, color: '#6090d0', rim: '#90c0f0', sz: 11, name: 'Raider', armor: 0, healRate: 0 },
  ogre: { hp: 600, spd: 35, reward: 45, color: '#607060', rim: '#8a9e8a', sz: 15, name: 'Ogre', armor: 0.45, healRate: 0 },
  wolf: { hp: 90, spd: 150, reward: 14, color: '#c08040', rim: '#e0b070', sz: 9, name: 'Wolf', armor: 0, healRate: 0 },
  shaman: { hp: 250, spd: 50, reward: 35, color: '#20c080', rim: '#60e0b0', sz: 11, name: 'Shaman', armor: 0, healRate: 15 },
  warlord: { hp: 2200, spd: 30, reward: 150, color: '#e04050', rim: '#ff7080', sz: 20, name: 'Warlord', armor: 0.35, healRate: 0 },
};

/* -------------------- Helper Functions -------------------- */
function tDmg(t: Tower) { const b = TCFG[t.type].dmg; return t.lvl === 1 ? b : t.lvl === 2 ? Math.round(b * 1.75) : Math.round(b * 2.9); }
function tRng(t: { type: TT; lvl: number }) { const b = TCFG[t.type].range; return t.lvl === 1 ? b : t.lvl === 2 ? b + 0.7 : b + 1.5; }
function tRate(t: Tower) { const b = TCFG[t.type].rate; return t.lvl === 1 ? b : t.lvl === 2 ? b * 1.4 : b * 1.85; }
function tChain(t: Tower) { const b = TCFG[t.type].chain; return t.lvl === 1 ? b : t.lvl === 2 ? b + 2 : b + 4; }
function tSlow(t: Tower) { const b = TCFG[t.type].slow; return t.lvl === 1 ? b : t.lvl === 2 ? b + 0.15 : b + 0.3; }
function upgCost(t: Tower) { return t.lvl < 3 ? Math.round(TCFG[t.type].cost * (t.lvl === 1 ? 1 : 1.5)) : 0; }
function sellVal(t: Tower) { return Math.floor(TCFG[t.type].cost * (1 + (t.lvl - 1) * 1.25) * 0.6); }

function mkSpawns(type: ET, n: number, iv: number, st = 0): Spawn[] {
  return Array.from({ length: n }, (_, i) => ({ type, at: st + i * iv, pathIdx: Math.floor(Math.random() * PATH_PX.length) }));
}

function generateWave(gs: GS) {
  const n = gs.wave;
  const dreadScale = 1 + gs.dread / 100;
  const baseScale = 1 + (n - 1) * 0.14;
  const arch = n % 6;
  const spawns: Spawn[] = [];
  let label = '', isBoss = false;
  if (arch === 0) {
    isBoss = true; label = `💀 WARLORD ${n}`;
    const wc = Math.min(1 + Math.floor(n / 6), 3);
    spawns.push(...mkSpawns('warlord', wc, 7000));
    spawns.push(...mkSpawns('raider', 6 + n, Math.max(350, 800 - n * 18), 1500));
  } else if (arch === 1) {
    label = `⚔️ Horde ${n}`; spawns.push(...mkSpawns('goblin', 10 + n * 2, Math.max(180, 600 - n * 20)));
  } else if (arch === 2) {
    label = `🐺 Rush ${n}`; spawns.push(...mkSpawns('wolf', 8 + n, Math.max(120, 420 - n * 14)));
  } else if (arch === 3) {
    label = `🛡 Siege ${n}`; const c = Math.max(2, Math.floor(n * 0.6)); spawns.push(...mkSpawns('ogre', c, Math.max(1200, 3000 - n * 70))); spawns.push(...mkSpawns('shaman', Math.floor(n * 0.3), 1500, c * 1500));
  } else if (arch === 4) {
    label = `🔮 Shamans ${n}`; spawns.push(...mkSpawns('shaman', 3 + Math.floor(n * 0.4), 900)); spawns.push(...mkSpawns('goblin', 8 + n, 400, 1200));
  } else {
    label = `🌊 Mixed ${n}`; const b = Math.max(2, Math.floor(n * 0.5)); spawns.push(...mkSpawns('raider', b, 700)); spawns.push(...mkSpawns('wolf', Math.floor(b * 0.8), 350, b * 600)); spawns.push(...mkSpawns('ogre', Math.max(1, Math.floor(n * 0.15)), 2500, b * 1200));
    if (n > 5) spawns.push(...mkSpawns('shaman', Math.floor(n * 0.2), 1600, b * 1800));
  }
  spawns.sort((a, b) => a.at - b.at);
  return { spawns, label, isBoss };
}

function initGS(): GS {
  return {
    gold: 220, lives: 20, wave: 0, score: 0, kills: 0, gt: 0,
    towers: new Map(), enemies: [], projs: [], floats: [], particles: [],
    waveActive: false, gameOver: false, countdown: 0, waveStartGT: 0, queue: [], waveScale: 1, waveLabel: 'Prepare…', isBoss: false, uid: 1,
    selectedKey: null, selType: 'archer',
    mode: 'day', dayLength: DAY_LENGTH, nightLength: NIGHT_LENGTH, phaseTime: 0,
    population: {
      total: 20, farmers: 40, builders: 20, soldiers: 15, faith: 15, science: 10,
      farmersCount: 0, buildersCount: 0, soldiersCount: 0, faithCount: 0, scienceCount: 0,
    },
    food: 100, foodCapacity: 200, happiness: 80, dread: 0,
    influence: { faith: 0, reason: 0, dominion: 0 }, influencePoints: 1,
    eraBonuses: { faith: 1.0, reason: 1.0, dominion: 1.0 }, eraChoiceAvailable: false, nextEraWave: 3,
    panicShieldActive: false, panicShieldEndTime: 0,
  };
}

function uidOf(gs: GS) { return gs.uid++; }
function floatText(gs: GS, x: number, y: number, text: string, color: string) {
  gs.floats.push({ id: uidOf(gs), x, y, text, color, age: 0 });
}
function chapelBoost(gs: GS, bx: number, by: number) {
  let bonus = 1;
  for (const [, t] of gs.towers) {
    if (t.type === 'chapel') {
      const d2 = (t.col - bx) * (t.col - bx) + (t.row - by) * (t.row - by);
      const r = Math.pow(tRng(t) * CELL, 2);
      if (d2 <= r) bonus += 0.25;
    }
  }
  return bonus;
}
function spawnParticles(gs: GS, x: number, y: number, color: string, count = 6) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const spd = 30 + Math.random() * 60;
    gs.particles.push({ id: uidOf(gs), x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, color, life: 0.45 + Math.random() * 0.35, maxLife: 0.8, r: 2 + Math.random() * 3 });
  }
}

/* -------------------- Day/Night Update Functions -------------------- */
function updateDay(gs: GS, dt: number) {
  const pop = gs.population;
  pop.farmersCount = Math.floor(pop.total * (pop.farmers / 100));
  pop.buildersCount = Math.floor(pop.total * (pop.builders / 100));
  pop.soldiersCount = Math.floor(pop.total * (pop.soldiers / 100));
  pop.faithCount = Math.floor(pop.total * (pop.faith / 100));
  pop.scienceCount = Math.floor(pop.total * (pop.science / 100));

  const foodProduced = pop.farmersCount * 0.3 * dt;
  const foodConsumed = pop.total * 0.1 * dt;
  gs.food = Math.min(gs.foodCapacity, gs.food + foodProduced - foodConsumed);
  const foodRatio = gs.food / gs.foodCapacity;
  gs.happiness = Math.min(100, Math.max(0, 50 + (foodRatio - 0.5) * 100));
  if (foodRatio > 0.8) pop.total += 0.01 * dt;

  gs.dread = Math.min(100, gs.dread + pop.total * 0.0005 * dt + gs.towers.size * 0.001 * dt - gs.influence.faith * 0.002 * dt);

  // Reduce panic shield over time
  if (gs.panicShieldActive && gs.gt > gs.panicShieldEndTime) {
    gs.panicShieldActive = false;
  }
}

function startNight(gs: GS) {
  gs.mode = 'night';
  gs.phaseTime = 0;
  gs.wave++;
  gs.waveScale = 1 + (gs.wave - 1) * 0.14;
  const { spawns, label, isBoss } = generateWave(gs);
  gs.queue = spawns;
  gs.waveLabel = label;
  gs.waveStartGT = gs.gt;
  gs.waveActive = true;
  gs.isBoss = isBoss;
}

function endNight(gs: GS) {
  gs.mode = 'day';
  gs.phaseTime = 0;
  gs.waveActive = false;
  const interest = Math.min(Math.floor(gs.gold * 0.035), 50);
  if (interest > 0) {
    gs.gold += interest;
    floatText(gs, GW / 2, GH * 0.45, `+${interest}g harvest`, '#a8e060');
  }
  gs.influencePoints += 1;
  if (gs.wave >= gs.nextEraWave) {
    gs.eraChoiceAvailable = true;
    gs.nextEraWave += 3;
  }
}

function updateNight(gs: GS, dt: number) {
  if (gs.gameOver) return;

  // Spawn enemies
  if (gs.waveActive && gs.queue.length > 0) {
    const el = gs.gt - gs.waveStartGT;
    while (gs.queue.length > 0 && gs.queue[0].at <= el) {
      const s = gs.queue.shift()!;
      const cfg = ECFG[s.type];
      const dreadScale = 1 + gs.dread / 100;
      const spdMult = 1 + Math.min(gs.wave * 0.01, 0.45) * dreadScale;
      const path = PATH_PX[s.pathIdx];
      const [sx, sy] = path[0];
      let typeMultiplier = 1;
      if (s.type === 'shaman' && gs.influence.faith < 5) typeMultiplier = 1.5;
      const hp = Math.round(cfg.hp * gs.waveScale * dreadScale * typeMultiplier);
      gs.enemies.push({
        id: uidOf(gs), x: sx, y: sy, hp, maxHp: hp,
        baseSpeed: cfg.spd, speed: cfg.spd * spdMult,
        reward: Math.round(cfg.reward * (1 + (gs.wave - 1) * 0.07) * (1 + gs.influence.dominion * 0.02)),
        wpIdx: 1, pathPX: path,
        type: s.type, armor: cfg.armor, slowUntil: 0, slowPct: 0, healRate: cfg.healRate * (s.type === 'shaman' && typeMultiplier > 1 ? 2 : 1)
      });
    }
  }

  // Move enemies & check leaks
  const leakedIds: number[] = [];
  for (const e of gs.enemies) {
    if (e.healRate > 0) e.hp = Math.min(e.maxHp, e.hp + e.healRate * dt);
    if (e.wpIdx >= e.pathPX.length) {
      leakedIds.push(e.id);
      gs.lives--;
      // simple soldier intercept chance
      if (Math.random() < Math.min(0.25, gs.population.soldiersCount * 0.001)) {
        // intercepted, don't count as leak but spawn particle and reward nothing
        spawnParticles(gs, e.x, e.y, '#f0c030', 6);
      } else {
        if (gs.lives <= 0) { gs.gameOver = true; return; }
      }
      continue;
    }
    const slowFactor = gs.gt < e.slowUntil ? Math.max(0.15, 1 - e.slowPct) : 1;
    const effSpeed = e.baseSpeed * slowFactor * (e.speed / e.baseSpeed);
    const [tx, ty] = e.pathPX[e.wpIdx];
    const dx = tx - e.x, dy = ty - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    const step = effSpeed * dt;
    if (dist <= step + 0.5) { e.x = tx; e.y = ty; e.wpIdx++; } else { e.x += dx / dist * step; e.y += dy / dist * step; }
  }
  gs.enemies = gs.enemies.filter(e => !leakedIds.includes(e.id) && e.hp > 0);

  // Tower firing
  const soldierEffect = gs.happiness < 50 ? 0.7 + (gs.happiness / 100) * 0.3 : 1.0;
  for (const [, t] of gs.towers) {
    const cfg = TCFG[t.type];
    if (!cfg.dmg && !cfg.slow) continue;
    const rate = tRate(t) * (1 + gs.influence.reason * 0.02);
    if (gs.gt - t.lastFired < 1000 / rate) continue;
    const range = tRng(t) * CELL;
    const bx = t.col * CELL + CELL / 2, by = t.row * CELL + CELL / 2;
    let best: Enemy | null = null; let bestWp = -1;
    const range2 = range * range;
    for (const e of gs.enemies) {
      const dx = e.x - bx, dy = e.y - by;
      const d2 = dx * dx + dy * dy;
      if (d2 <= range2 && e.wpIdx > bestWp) { best = e; bestWp = e.wpIdx; }
    }
    if (!best) continue;
    t.lastFired = gs.gt;
    const boost = chapelBoost(gs, t.col, t.row) * (1 + gs.influence.faith * 0.02) * (gs.panicShieldActive ? 1.5 : 1.0) * soldierEffect;
    const dmg = Math.round(tDmg(t) * boost);
    gs.projs.push({ id: uidOf(gs), x: bx, y: by, eid: best.id, dmg, spd: 420, splash: cfg.splash, chain: tChain(t), color: cfg.pc, slowUntil: cfg.slow > 0 ? gs.gt + 2000 : 0, type: t.type });
  }

  // Projectile movement & hits
  const deadProj: number[] = [];
  for (const p of gs.projs) {
    const tgt = gs.enemies.find(e => e.id === p.eid);
    if (!tgt) { deadProj.push(p.id); continue; }
    const dx = tgt.x - p.x, dy = tgt.y - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist <= p.spd * dt + 8) {
      const hitList = p.splash > 0 ? gs.enemies.filter(e => Math.hypot(e.x - tgt.x, e.y - tgt.y) <= p.splash) : [tgt];
      for (const e of hitList) {
        const dmgReduced = p.type === 'ballista' ? p.dmg : Math.round(p.dmg * (1 - e.armor));
        e.hp -= dmgReduced;
        if (p.slowUntil > 0) { e.slowUntil = Math.max(e.slowUntil, p.slowUntil); e.slowPct = Math.max(e.slowPct, TCFG.frost.slow); }
        spawnParticles(gs, e.x, e.y, p.color, p.splash > 0 ? 12 : 4);
        if (e.hp <= 0) {
          gs.gold += e.reward; gs.score += e.reward; gs.kills++;
          floatText(gs, e.x, e.y - 16, `+${e.reward}g`, '#f0c030');
        }
      }
      // Chain lightning
      if (p.chain > 0) {
        const already = new Set(hitList.map(h => h.id));
        let from = tgt;
        for (let i = 0; i < p.chain; i++) {
          const next = gs.enemies.filter(e => !already.has(e.id) && Math.hypot(e.x - from.x, e.y - from.y) < CHAIN_RADIUS)
            .sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
          if (!next) break;
          const cd = Math.round(p.dmg * 0.6 * (1 - next.armor));
          next.hp -= cd; spawnParticles(gs, next.x, next.y, p.color, 4);
          if (next.hp <= 0) { gs.gold += next.reward; gs.score += next.reward; gs.kills++; }
          already.add(next.id); from = next;
        }
      }
      deadProj.push(p.id);
    } else {
      p.x += dx / dist * p.spd * dt;
      p.y += dy / dist * p.spd * dt;
    }
  }
  gs.projs = gs.projs.filter(p => !deadProj.includes(p.id));

  // Wave end condition
  if (gs.waveActive && gs.queue.length === 0 && gs.enemies.length === 0) {
    gs.waveActive = false;
    // Night will end via timer; endNight handled by update()
  }
}

function update(gs: GS, dt: number) {
  if (gs.gameOver) return;
  gs.gt += dt * 1000;
  gs.phaseTime += dt * 1000;

  if (gs.mode === 'day') {
    updateDay(gs, dt);
    if (gs.phaseTime >= gs.dayLength) startNight(gs);
  } else {
    updateNight(gs, dt);
    if (gs.phaseTime >= gs.nightLength) endNight(gs);
  }

  // Common updates
  for (const f of gs.floats) f.age += dt * 1000;
  gs.floats = gs.floats.filter(f => f.age < 1500);
  for (const p of gs.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.88; p.vy *= 0.88; p.life -= dt; }
  gs.particles = gs.particles.filter(p => p.life > 0);

  // Simple particle cap
  if (gs.particles.length > 800) gs.particles.splice(0, gs.particles.length - 800);
}

/* -------------------- Drawing Primitives -------------------- */
function fillRR(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); ctx.fill();
}
function glowCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = 20) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r + glow);
  g.addColorStop(0, color + 'CC'); g.addColorStop(0.5, color + '44'); g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r + glow, 0, Math.PI * 2); ctx.fill();
}
function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#1A3010'; ctx.fillRect(cx - 2, cy + 6, 4, 8);
  [[0, 0, 8, '#1E4318'], [0, -5, 6, '#245920']].forEach(([dx, dy, r, c]) => { ctx.fillStyle = c as string; ctx.beginPath(); ctx.arc(cx + (dx as number), cy + (dy as number), r as number, 0, Math.PI * 2); ctx.fill(); });
}
function drawRock(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#1C2333'; ctx.beginPath(); ctx.ellipse(cx, cy, 9, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2D3748'; ctx.beginPath(); ctx.ellipse(cx - 1, cy - 1, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
}
function drawBush(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#1d3a0a'; ctx.beginPath(); ctx.ellipse(cx, cy, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a5010'; ctx.beginPath(); ctx.ellipse(cx - 2, cy - 1, 6, 5, 0.3, 0, Math.PI * 2); ctx.fill();
}
function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#c0e840'; ctx.fillRect(cx - 1, cy, 2, 7);
  ctx.fillStyle = '#f0c020'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
}
function drawRoad(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#5d4a2e';
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a5c3a';
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.2, 0, Math.PI * 2); ctx.fill();
}
function drawBuildable(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#2d4a1a';
  ctx.fillRect(cx - CELL/2, cy - CELL/2, CELL, CELL);
  ctx.fillStyle = '#3a5a2a';
  for (let i = 0; i < 3; i++) {
    const x = cx - CELL/2 + 8 + i * 12;
    const y = cy - CELL/2 + 8 + (i % 2) * 8;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  }
}
function drawKeep(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(cx - CELL/2, cy - CELL/2, CELL, CELL);
  ctx.fillStyle = '#7a6a4a';
  ctx.beginPath(); ctx.arc(cx, cy, CELL * 0.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c0a060';
  ctx.font = 'bold 18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🏰', cx, cy - 2);
}
function drawBuilding(ctx: CanvasRenderingContext2D, t: Tower, gs: GS, selected: boolean) {
  const cfg = TCFG[t.type];
  const x = t.col * CELL, y = t.row * CELL, cx = x + CELL / 2, cy = y + CELL / 2;
  const firing = gs.gt - t.lastFired < 220;
  if (selected) { ctx.strokeStyle = '#7DD3FC'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, CELL / 2 - 5, 0, Math.PI * 2); ctx.stroke(); }
  if (firing) glowCircle(ctx, cx, cy, CELL / 2 - 8, cfg.color, 10);
  ctx.fillStyle = cfg.dark; fillRR(ctx, x + 3, y + 3, CELL - 6, CELL - 6, 6);
  const grad = ctx.createLinearGradient(x, y, x + CELL, y + CELL); grad.addColorStop(0, cfg.color + '44'); grad.addColorStop(1, cfg.color + '18');
  ctx.fillStyle = grad; fillRR(ctx, x + 6, y + 6, CELL - 12, CELL - 12, 5);
  ctx.strokeStyle = firing ? cfg.color : cfg.color + '66'; ctx.lineWidth = firing ? 1.8 : 1.2; ctx.beginPath(); ctx.arc(cx, cy, CELL / 2 - 6, 0, Math.PI * 2); ctx.stroke();
  ctx.font = `${Math.floor(CELL * 0.36)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#efe6d0'; ctx.fillText(cfg.emoji, cx, cy - 1);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i < t.lvl ? cfg.color : '#13100a'; ctx.beginPath(); ctx.arc(x + 10 + i * 10, y + CELL - 8, 2.8, 0, Math.PI * 2); ctx.fill(); }
}
function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, gs: GS) {
  const cfg = ECFG[e.type];
  const slowed = gs.gt < e.slowUntil;
  if (e.type === 'shaman') glowCircle(ctx, e.x, e.y, cfg.sz + 8, '#20c080', 8);
  if (e.type === 'warlord') glowCircle(ctx, e.x, e.y, cfg.sz + 10, '#e04050', 12);
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(e.x, e.y + cfg.sz * 0.85, cfg.sz * 0.7, cfg.sz * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  if (slowed) { ctx.fillStyle = 'rgba(96,200,240,0.12)'; ctx.beginPath(); ctx.arc(e.x, e.y, cfg.sz + 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = slowed ? '#9aa9b6' : cfg.color; ctx.beginPath(); ctx.arc(e.x, e.y, cfg.sz, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(e.x - cfg.sz * 0.25, e.y - cfg.sz * 0.25, cfg.sz * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = slowed ? '#60c8f0' : cfg.rim; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(e.x, e.y, cfg.sz, 0, Math.PI * 2); ctx.stroke();
  const bw = cfg.sz * 3, bh = 5, bx = e.x - bw / 2, by = e.y - cfg.sz - 10;
  ctx.fillStyle = '#0d0f08'; ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = '#21261a'; ctx.fillRect(bx, by, bw, bh);
  const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));
  ctx.fillStyle = pct > 0.6 ? '#40c040' : pct > 0.3 ? '#d09020' : '#d03030'; ctx.fillRect(bx, by, bw * pct, bh);
}

/* -------------------- React Component -------------------- */
export default function Hamletfall({ isRunning = true, speed = 1 }: { isRunning?: boolean; speed?: number; }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gsRef = useRef<GS>(initGS());
  const runningRef = useRef(isRunning);
  const speedRef = useRef(speed);
  const animRef = useRef<number | null>(null);

  const [ui, setUi] = useState({
    gold: 220, lives: 20, wave: 0, score: 0, kills: 0, waveLabel: '', countdown: 0, waveActive: false, gameOver: false, isBoss: false,
    mode: 'day' as 'day' | 'night',
    phaseTime: 0,
    population: { total: 20, farmers: 40, builders: 20, soldiers: 15, faith: 15, science: 10 } as Population,
    food: 100, foodCapacity: 200, happiness: 80, dread: 0,
    influence: { faith: 0, reason: 0, dominion: 0 },
    influencePoints: 1,
    eraChoiceAvailable: false,
  });
  const [selType, setSelType] = useState<TT>('archer');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showEraModal, setShowEraModal] = useState(false);
  const hoverRef = useRef<[number, number] | null>(null);

  useEffect(() => { runningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const syncUI = useCallback(() => {
    const g = gsRef.current;
    setUi({
      gold: g.gold, lives: g.lives, wave: g.wave, score: g.score, kills: g.kills,
      waveLabel: g.waveLabel, countdown: g.countdown, waveActive: g.waveActive, gameOver: g.gameOver, isBoss: g.isBoss,
      mode: g.mode, phaseTime: g.phaseTime,
      population: { ...g.population },
      food: g.food, foodCapacity: g.foodCapacity, happiness: g.happiness, dread: g.dread,
      influence: { ...g.influence },
      influencePoints: g.influencePoints,
      eraChoiceAvailable: g.eraChoiceAvailable,
    });
    setSelectedKey(g.selectedKey);
    setSelType(g.selType);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = GW; canvas.height = GH;
    let last = 0, tick = 0;

    const loop = (ts: number) => {
      const dt = last === 0 ? 0 : Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const gs = gsRef.current;
      if (runningRef.current && !gs.gameOver) {
        update(gs, dt * Math.max(0.12, speedRef.current));
        if (++tick >= 18) { tick = 0; syncUI(); }
      }
      renderFrame(ctx, gs, hoverRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [syncUI]);

  function renderFrame(ctx: CanvasRenderingContext2D, gs: GS, hover: [number, number] | null) {
    ctx.clearRect(0, 0, GW, GH);
    // Background
    ctx.fillStyle = '#0b1208';
    ctx.fillRect(0, 0, GW, GH);
    // Draw terrain
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
        const key = `${c},${r}`;
        const terrain = DECO.get(key) || 'none';
        if (terrain === 'road') drawRoad(ctx, cx, cy);
        else if (terrain === 'buildable') drawBuildable(ctx, cx, cy);
        else if (terrain === 'keep') drawKeep(ctx, cx, cy);
        else if (terrain === 'tree') drawTree(ctx, cx, cy);
        else if (terrain === 'rock') drawRock(ctx, cx, cy);
        else if (terrain === 'bush') drawBush(ctx, cx, cy);
        else if (terrain === 'flower') drawFlower(ctx, cx, cy);
        else {
          ctx.fillStyle = '#1a2a0a';
          ctx.fillRect(cx - CELL/2, cy - CELL/2, CELL, CELL);
        }
      }
    }

    // Grid lines (faint)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, GH); ctx.stroke(); }
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(GW, r * CELL); ctx.stroke(); }

    // Hover highlight
    if (hover) {
      const [hc, hr] = hover;
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = 2;
      ctx.strokeRect(hc * CELL + 2, hr * CELL + 2, CELL - 4, CELL - 4);
    }

    // Towers
    for (const [, t] of gs.towers) {
      drawBuilding(ctx, t, gs, gs.selectedKey === t.key);
    }

    // Projectiles
    for (const p of gs.projs) {
      glowCircle(ctx, p.x, p.y, p.splash > 0 ? 6 : 3, p.color, p.splash > 0 ? 12 : 6);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.splash > 0 ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // Particles
    for (const p of gs.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r * (p.life / p.maxLife)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Enemies
    for (const e of gs.enemies) drawEnemy(ctx, e, gs);

    // Floating texts
    for (const f of gs.floats) {
      const a = 1 - f.age / 1500, dy = -f.age * 0.04;
      ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = f.color;
      ctx.font = 'bold 11px "Crimson Text", serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.text, f.x, f.y + dy);
    }
    ctx.globalAlpha = 1;

    // Night overlay
    if (gs.mode === 'night') {
      ctx.fillStyle = 'rgba(0,0,30,0.4)';
      ctx.fillRect(0, 0, GW, GH);
    }

    // Phase progress bar
    const phasePercent = gs.phaseTime / (gs.mode === 'day' ? gs.dayLength : gs.nightLength);
    ctx.fillStyle = '#3a2e14';
    ctx.fillRect(0, GH - 2, GW * Math.max(0, Math.min(1, phasePercent)), 2);

    // Panic shield visual
    if (gs.panicShieldActive) {
      ctx.strokeStyle = '#f0e090';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        KEEP_CENTER[0] * CELL + CELL / 2,
        KEEP_CENTER[1] * CELL + CELL / 2,
        CELL * 3,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  const handlePopChange = (role: keyof Omit<Population, 'total' | 'farmersCount' | 'buildersCount' | 'soldiersCount' | 'faithCount' | 'scienceCount'>, value: number) => {
    const g = gsRef.current;
    g.population[role] = value;
    syncUI();
  };

  const allocateInfluence = (pillar: 'faith' | 'reason' | 'dominion') => {
    const g = gsRef.current;
    if (g.influencePoints <= 0) return;
    g.influencePoints--;
    g.influence[pillar]++;
    syncUI();
  };

  const chooseEraBonus = (pillar: 'faith' | 'reason' | 'dominion') => {
    const g = gsRef.current;
    g.eraBonuses[pillar] += 0.1;
    g.eraChoiceAvailable = false;
    setShowEraModal(false);
    syncUI();
  };

  const setBuildType = (type: TT) => {
    const g = gsRef.current;
    g.selType = type;
    setSelType(type);
    g.selectedKey = null;
    syncUI();
  };

  const activatePanicShield = () => {
    const g = gsRef.current;
    if (g.influence.faith < 1 || g.mode !== 'night') return;
    g.panicShieldActive = true;
    g.panicShieldEndTime = g.gt + 5000;
    g.influence.faith--;
    syncUI();
  };

  const canBuild = gsRef.current.mode === 'day' && !gsRef.current.gameOver;

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canBuild) {
      // allow selecting towers even if can't build
      const rect = canvasRef.current!.getBoundingClientRect();
      const col = Math.floor((e.clientX - rect.left) / CELL);
      const row = Math.floor((e.clientY - rect.top) / CELL);
      const k = `${col},${row}`;
      const g = gsRef.current;
      if (g.towers.has(k)) {
        g.selectedKey = k;
        syncUI();
      }
      return;
    }

    const rect = canvasRef.current!.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL);
    const row = Math.floor((e.clientY - rect.top) / CELL);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    const g = gsRef.current;
    const k = `${col},${row}`;
    if (g.towers.has(k)) {
      g.selectedKey = k;
      syncUI();
      return;
    }
    g.selectedKey = null;
    if (!BUILDABLE_SET.has(k)) return; // only build on buildable tiles
    const cfg = TCFG[g.selType];
    if (g.gold < cfg.cost) return;
    g.gold -= cfg.cost;
    const tower: Tower = { col, row, type: g.selType, lastFired: -9999, lvl: 1, key: k };
    g.towers.set(k, tower);
    syncUI();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / CELL);
    const row = Math.floor((e.clientY - rect.top) / CELL);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) hoverRef.current = [col, row];
    else hoverRef.current = null;
  };

  const upgradeTower = () => {
    const g = gsRef.current;
    if (!g.selectedKey) return;
    const t = g.towers.get(g.selectedKey);
    if (!t || t.lvl >= 3) return;
    const cost = upgCost(t);
    if (g.gold < cost) return;
    g.gold -= cost;
    t.lvl++;
    syncUI();
  };

  const sellTower = () => {
    const g = gsRef.current;
    if (!g.selectedKey) return;
    const t = g.towers.get(g.selectedKey);
    if (!t) return;
    g.gold += sellVal(t);
    g.towers.delete(g.selectedKey);
    g.selectedKey = null;
    syncUI();
  };

  const buildButtons = (Object.keys(TCFG) as TT[]).map(t => {
    const cfg = TCFG[t];
    const disabled = ui.gold < cfg.cost || !canBuild;
    return (
      <BuildBtn key={t} $sel={selType === t} $disabled={disabled} onClick={() => setBuildType(t)}>
        <div style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{cfg.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: '0.9rem', color: '#efe6d0' }}>{cfg.name}</div>
          <Small>🌾 {cfg.cost} • {cfg.desc}</Small>
        </div>
      </BuildBtn>
    );
  });

  return (
    <Wrap>
      <HUD>
        <HUDTitle>☾ HAMLETFALL</HUDTitle>
        <Stat $accent='#f0b840'>🌾 {ui.gold}</Stat>
        <Stat $accent='#f08d8d'>❤️ {ui.lives}</Stat>
        <Stat>⚔️ {ui.wave}</Stat>
        <Stat $accent='#b6861a'>⭐ {ui.score}</Stat>
        <Stat $accent='#a8e060'>☠️ {ui.kills}</Stat>
        <Stat $accent='#60c8f0'>🌙 {ui.mode}</Stat>
        <WaveBadge $boss={ui.isBoss}>{ui.waveLabel}</WaveBadge>
      </HUD>

      <Main>
        <CanvasWrap>
          <CanvasEl
            ref={canvasRef}
            width={GW}
            height={GH}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { hoverRef.current = null; }}
          />
        </CanvasWrap>

        <Side>
          <SideTitle>🏗 Build</SideTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{buildButtons}</div>

          <SideTitle>👥 Population ({Math.floor(ui.population.total)})</SideTitle>
          <SliderRow><span>Farmers</span><input type="range" min="0" max="100" value={ui.population.farmers} onChange={e => handlePopChange('farmers', Number(e.target.value))} disabled={ui.mode === 'night'} /><span>{ui.population.farmers}%</span></SliderRow>
          <SliderRow><span>Builders</span><input type="range" min="0" max="100" value={ui.population.builders} onChange={e => handlePopChange('builders', Number(e.target.value))} disabled={ui.mode === 'night'} /><span>{ui.population.builders}%</span></SliderRow>
          <SliderRow><span>Soldiers</span><input type="range" min="0" max="100" value={ui.population.soldiers} onChange={e => handlePopChange('soldiers', Number(e.target.value))} disabled={ui.mode === 'night'} /><span>{ui.population.soldiers}%</span></SliderRow>
          <SliderRow><span>Faith</span><input type="range" min="0" max="100" value={ui.population.faith} onChange={e => handlePopChange('faith', Number(e.target.value))} disabled={ui.mode === 'night'} /><span>{ui.population.faith}%</span></SliderRow>
          <SliderRow><span>Science</span><input type="range" min="0" max="100" value={ui.population.science} onChange={e => handlePopChange('science', Number(e.target.value))} disabled={ui.mode === 'night'} /><span>{ui.population.science}%</span></SliderRow>

          <SideTitle>📦 Resources</SideTitle>
          <div>Food: {Math.floor(ui.food)}/{ui.foodCapacity}</div>
          <ProgressBar $value={(ui.food / ui.foodCapacity) * 100} $color="#a8e060"><div /></ProgressBar>
          <div>Happiness: {Math.floor(ui.happiness)}%</div>
          <ProgressBar $value={ui.happiness} $color="#f0b840"><div /></ProgressBar>
          <div>Dread: {Math.floor(ui.dread)}%</div>
          <ProgressBar $value={ui.dread} $color="#e04050"><div /></ProgressBar>

          <SideTitle>✨ Influence ({ui.influencePoints} pts)</SideTitle>
          <div style={{ display: 'flex', gap: 4 }}>
            <InfluenceButton $active={ui.influence.faith > 0} $color="#f0e090" onClick={() => allocateInfluence('faith')}>Faith ({ui.influence.faith})</InfluenceButton>
            <InfluenceButton $active={ui.influence.reason > 0} $color="#a8e060" onClick={() => allocateInfluence('reason')}>Reason ({ui.influence.reason})</InfluenceButton>
            <InfluenceButton $active={ui.influence.dominion > 0} $color="#e0a060" onClick={() => allocateInfluence('dominion')}>Dominion ({ui.influence.dominion})</InfluenceButton>
          </div>
          <ActBtn onClick={activatePanicShield} disabled={ui.influence.faith < 1 || ui.mode !== 'night'}>🛡️ Panic Shield (Faith)</ActBtn>

          {selectedKey && (
            <SelPanel>
              <SideTitle>Selected</SideTitle>
              <ActBtn onClick={upgradeTower}>Upgrade</ActBtn>
              <ActBtn $danger onClick={sellTower}>Sell</ActBtn>
            </SelPanel>
          )}

          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#bfa878', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {ui.mode === 'day' ? 'Day - Prepare' : 'Night - Battle'}
            </div>
          </div>
        </Side>
      </Main>

      {ui.eraChoiceAvailable && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#1a1a0a', border: '2px solid #b6861a', borderRadius: 16, padding: 24, maxWidth: 400 }}>
            <h2 style={{ color: '#f0b840', textAlign: 'center' }}>Era of Choice</h2>
            <p style={{ color: '#bfa878', textAlign: 'center' }}>Your people look to you for guidance. Choose a permanent blessing:</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => chooseEraBonus('faith')} style={{ flex: 1, padding: 12, background: 'rgba(240,224,144,0.2)', border: '1px solid #f0e090', borderRadius: 8, color: '#f0e090' }}>
                <div style={{ fontSize: '1.5rem' }}>🕯️</div>
                <div>Reinforce Tradition</div>
                <small>+10% Faith effect</small>
              </button>
              <button onClick={() => chooseEraBonus('reason')} style={{ flex: 1, padding: 12, background: 'rgba(168,224,96,0.2)', border: '1px solid #a8e060', borderRadius: 8, color: '#a8e060' }}>
                <div style={{ fontSize: '1.5rem' }}>⚙️</div>
                <div>Embrace Knowledge</div>
                <small>+10% Reason effect</small>
              </button>
              <button onClick={() => chooseEraBonus('dominion')} style={{ flex: 1, padding: 12, background: 'rgba(224,160,96,0.2)', border: '1px solid #e0a060', borderRadius: 8, color: '#e0a060' }}>
                <div style={{ fontSize: '1.5rem' }}>🗡️</div>
                <div>Harden the People</div>
                <small>+10% Dominion effect</small>
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrap>
  );
}