/* ================================================================
   td.logic.ts — Middle-Earth Defender · Game Logic
   ================================================================ */

/* -------------------- Constants -------------------- */
export const COLS      = 20;
export const ROWS      = 13;
export const CELL      = 44;
export const GW        = COLS * CELL;   // 880
export const GH        = ROWS * CELL;   // 572
export const DAY_LEN   = 25_000;        // 25 s prepare
export const NIGHT_LEN = 35_000;        // 35 s battle
export const CHAIN_R   = 80;
export const KEEP: [number, number] = [10, 6];
export const KEEP_R    = 2.5;

/* -------------------- Types -------------------- */
export type TT = 'arrow' | 'wizard' | 'catapult' | 'elven' | 'beacon' | 'rohirrim' | 'treant';
export type ET = 'orc' | 'warg' | 'urukhai' | 'troll' | 'nazgul' | 'balrog';

export interface Tower   { col:number; row:number; type:TT; lastFired:number; lvl:1|2|3; key:string; angle:number; }
export interface Enemy   { id:number; x:number; y:number; hp:number; maxHp:number; baseSpeed:number; speed:number; reward:number; wpIdx:number; pathPX:[number,number][]; type:ET; armor:number; slowUntil:number; slowPct:number; healRate:number; }
export interface Proj    { id:number; x:number; y:number; eid:number; dmg:number; spd:number; splash:number; chain:number; color:string; slowUntil:number; type:TT; }
export interface Float   { id:number; x:number; y:number; text:string; color:string; age:number; }
export interface Particle{ id:number; x:number; y:number; vx:number; vy:number; color:string; life:number; maxLife:number; r:number; }
export interface Spawn   { type:ET; at:number; pathIdx:number; }

/** Per-game map data — re-generated each initGS() call for variety */
export interface MapData {
  roads:       [number, number][][];
  roadSet:     Set<string>;
  buildableSet:Set<string>;
  pathPX:      [number, number][][];
  deco:        Map<string, string>;
}

export interface GS {
  gold:number; lives:number; wave:number; score:number; kills:number; gt:number;
  towers: Map<string, Tower>;
  enemies:Enemy[]; projs:Proj[]; floats:Float[]; particles:Particle[];
  waveActive:boolean; gameOver:boolean;
  waveStartGT:number; queue:Spawn[];
  waveScale:number; waveLabel:string; isBoss:boolean; uid:number;
  selectedKey:string|null; selType:TT;
  mode:'day'|'night'; dayLen:number; nightLen:number; phaseTime:number;
  eyeOfSauron:number;
  beaconCharges:number; beaconActive:boolean; beaconEnd:number; nextBeaconWave:number;
  /* New */
  map: MapData;
  gameSpeed: 1 | 2 | 4;
  sendWaveReady: boolean; // can fast-forward to night
}

/* -------------------- Tower Config -------------------- */
export interface TCfg {
  name:string; cost:number; range:number; dmg:number; rate:number;
  color:string; dark:string; pc:string;
  splash:number; chain:number; slow:number;
  piercesArmor:boolean; desc:string;
}
export const TCFG: Record<TT, TCfg> = {
  arrow:    { name:'Arrow Tower',   cost:65,  range:3.2, dmg:22, rate:2.5, color:'#8aaa70', dark:'#1e3010', pc:'#c0d890', splash:0,  chain:0, slow:0,   piercesArmor:false, desc:'Swift, reliable — great vs hordes' },
  wizard:   { name:'Istari Spire',  cost:190, range:3.6, dmg:45, rate:0.9, color:'#8898f0', dark:'#101840', pc:'#c0c8ff', splash:0,  chain:3, slow:0,   piercesArmor:false, desc:'Magic chains between foes' },
  catapult: { name:'Siege Engine',  cost:135, range:2.8, dmg:75, rate:0.5, color:'#c08858', dark:'#381808', pc:'#f0b880', splash:70, chain:0, slow:0,   piercesArmor:false, desc:'Explosive area damage' },
  elven:    { name:'Elven Watch',   cost:125, range:5.0, dmg:50, rate:1.1, color:'#78d8a0', dark:'#103828', pc:'#a8f8c8', splash:0,  chain:0, slow:0,   piercesArmor:true,  desc:'Long range, ignores armour' },
  beacon:   { name:'Beacon Tower',  cost:75,  range:4.0, dmg:0,  rate:0,   color:'#e8a030', dark:'#382008', pc:'#ffd060', splash:0,  chain:0, slow:0,   piercesArmor:false, desc:'+25% dmg to towers in range' },
  rohirrim: { name:'Rohirrim Post', cost:155, range:3.0, dmg:60, rate:1.0, color:'#d8a840', dark:'#382808', pc:'#f8d878', splash:32, chain:0, slow:0,   piercesArmor:false, desc:'Cavalry charge — small splash' },
  treant:   { name:'Ent Guardian',  cost:195, range:2.5, dmg:55, rate:0.7, color:'#60a848', dark:'#182010', pc:'#98d870', splash:50, chain:0, slow:0.5, piercesArmor:false, desc:'Slows enemies, crushes groups' },
};

/* -------------------- Enemy Config -------------------- */
export interface ECfg { hp:number; spd:number; reward:number; color:string; rim:string; sz:number; name:string; armor:number; healRate:number; }
export const ECFG: Record<ET, ECfg> = {
  orc:     { hp:85,   spd:75,  reward:8,   color:'#3d5a30', rim:'#70a050', sz:9,  name:'Orc',               armor:0,    healRate:0 },
  warg:    { hp:75,   spd:155, reward:13,  color:'#7a5028', rim:'#b07840', sz:9,  name:'Warg Rider',        armor:0,    healRate:0 },
  urukhai: { hp:320,  spd:50,  reward:24,  color:'#282820', rim:'#585848', sz:12, name:'Uruk-hai',          armor:0.4,  healRate:0 },
  troll:   { hp:750,  spd:28,  reward:55,  color:'#5a6050', rim:'#90a080', sz:16, name:'Cave Troll',        armor:0.5,  healRate:0 },
  nazgul:  { hp:200,  spd:105, reward:45,  color:'#18102a', rim:'#6040a0', sz:13, name:'Nazgûl',            armor:0.25, healRate:0 },
  balrog:  { hp:3200, spd:22,  reward:220, color:'#c84000', rim:'#ff8030', sz:22, name:'Balrog of Morgoth', armor:0.4,  healRate:0 },
};

/* -------------------- Map Generation -------------------- */
const SPAWN_SRCS: [number, number][] = [[0,3],[0,9],[10,0],[10,12],[19,4],[19,8]];

function genRoad(sc:number, sr:number): [number,number][] {
  const path:[number,number][] = [[sc,sr]];
  let [c,r] = [sc,sr];
  const [tc,tr] = KEEP;
  let safety = 0;
  while (Math.hypot(c-tc,r-tr) > KEEP_R && safety++ < 240) {
    const dc = tc-c, dr = tr-r;
    const mh = Math.abs(dc) > Math.abs(dr) ? Math.sign(dc) : 0;
    const mv = Math.abs(dr) > Math.abs(dc) ? Math.sign(dr) : 0;
    if (Math.random() < 0.30) {
      if (mh && Math.random()<0.5) r += Math.sign(dr)||1;
      else if (mv) c += Math.sign(dc)||1;
      else { c += Math.random()>.5?1:-1; r += Math.random()>.5?1:-1; }
    } else { c += mh; r += mv; }
    c = Math.max(0, Math.min(COLS-1,c));
    r = Math.max(0, Math.min(ROWS-1,r));
    const last = path[path.length-1];
    if (last[0]!==c || last[1]!==r) path.push([c,r]);
  }
  return path;
}

export function generateMap(): MapData {
  const roads = SPAWN_SRCS.map(([c,r]) => genRoad(c,r));
  const roadSet = new Set<string>();
  for (const road of roads) for (const [c,r] of road) roadSet.add(`${c},${r}`);

  const buildableSet = new Set<string>();
  for (let c=0;c<COLS;c++) for (let r=0;r<ROWS;r++) {
    const k = `${c},${r}`;
    if (roadSet.has(k) || Math.hypot(c-KEEP[0],r-KEEP[1])<KEEP_R) continue;
    let adj=false;
    outer: for (let dc=-1;dc<=1;dc++) for (let dr=-1;dr<=1;dr++) {
      if (!dc&&!dr) continue;
      if (roadSet.has(`${c+dc},${r+dr}`)) { adj=true; break outer; }
    }
    if (adj) buildableSet.add(k);
  }

  const pathPX: [number,number][][] = roads.map(road => road.map(([c,r]) => [c*CELL+CELL/2, r*CELL+CELL/2] as [number,number]));

  const WILD = ['tree','tree','tree','bush','rock','rock','none','none','none','none'];
  const deco = new Map<string,string>();
  for (let c=0;c<COLS;c++) for (let r=0;r<ROWS;r++) {
    const k = `${c},${r}`;
    if (roadSet.has(k)) deco.set(k,'road');
    else if (buildableSet.has(k)) deco.set(k,'buildable');
    else if (Math.hypot(c-KEEP[0],r-KEEP[1])<KEEP_R) deco.set(k,'keep');
    else deco.set(k, WILD[(c*37+r*19+c*r*11)%WILD.length]);
  }

  return { roads, roadSet, buildableSet, pathPX, deco };
}

/* Legacy static exports (kept for backward compat; rendering now uses gs.map) */
export const ROADS       = SPAWN_SRCS.map(([c,r])=>genRoad(c,r));
export const ROAD_SET    = new Set<string>(); for (const road of ROADS) for (const [c,r] of road) ROAD_SET.add(`${c},${r}`);
export const BUILDABLE_SET = new Set<string>();
export const PATH_PX: [number,number][][] = ROADS.map(road=>road.map(([c,r])=>[c*CELL+CELL/2,r*CELL+CELL/2] as [number,number]));
export const DECO = new Map<string,string>();

/* -------------------- Tower Helpers -------------------- */
export const tDmg   = (t:Tower)              => { const b=TCFG[t.type].dmg;   return t.lvl===1?b:t.lvl===2?Math.round(b*1.8):Math.round(b*3.0); };
export const tRng   = (t:{type:TT;lvl:number}) => { const b=TCFG[t.type].range; return t.lvl===1?b:t.lvl===2?b+0.8:b+1.6; };
export const tRate  = (t:Tower)              => { const b=TCFG[t.type].rate;  return t.lvl===1?b:t.lvl===2?b*1.45:b*1.9; };
export const tChain = (t:Tower)              => { const b=TCFG[t.type].chain; return t.lvl===1?b:t.lvl===2?b+2:b+4; };
export const tSlow  = (t:Tower)              => { const b=TCFG[t.type].slow;  return t.lvl===1?b:t.lvl===2?b+0.15:b+0.3; };
export const upgCost = (t:Tower) => t.lvl<3 ? Math.round(TCFG[t.type].cost*(t.lvl===1?1.0:1.5)) : 0;
export const sellVal = (t:Tower) => Math.floor(TCFG[t.type].cost*(1+(t.lvl-1)*1.25)*0.6);
export const uidOf   = (gs:GS) => gs.uid++;

/* -------------------- GS Helpers -------------------- */
export function floatText(gs:GS,x:number,y:number,text:string,color:string) { gs.floats.push({id:uidOf(gs),x,y,text,color,age:0}); }
export function spawnParticles(gs:GS,x:number,y:number,color:string,count=6) {
  for (let i=0;i<count;i++) {
    const a=(i/count)*Math.PI*2+Math.random()*0.6, spd=35+Math.random()*65;
    gs.particles.push({id:uidOf(gs),x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,color,life:0.45+Math.random()*0.35,maxLife:0.8,r:2+Math.random()*3});
  }
}
export function beaconBoost(gs:GS,tCol:number,tRow:number):number {
  let bonus=1;
  for (const [,t] of gs.towers) if (t.type==='beacon' && Math.hypot(t.col-tCol,t.row-tRow)<=tRng(t)) bonus+=0.25*t.lvl;
  return bonus;
}
function nazgulDebuff(gs:GS,tCol:number,tRow:number):number {
  let mult=1.0;
  for (const e of gs.enemies) if (e.type==='nazgul' && Math.hypot(e.x/CELL-tCol,e.y/CELL-tRow)<=2.5) mult=Math.max(0.5,mult-0.25);
  return mult;
}
function eyeSpeedMult(gs:GS) { return gs.eyeOfSauron>=80?1.30:gs.eyeOfSauron>=50?1.15:1.0; }
function eyeHpMult(gs:GS)    { return gs.eyeOfSauron>=80?1.20:1.0; }

/* -------------------- Wave Generation -------------------- */
function mkSpawns(type:ET,n:number,iv:number,st=0,pLen=6):Spawn[] {
  return Array.from({length:n},(_,i)=>({type,at:st+i*iv,pathIdx:Math.floor(Math.random()*pLen)}));
}

export function generateWave(gs:GS):{spawns:Spawn[];label:string;isBoss:boolean} {
  const n=gs.wave, arch=n%6, pLen=gs.map.pathPX.length;
  const spawns:Spawn[]=[];
  let label='',isBoss=false;
  if (arch===0) {
    isBoss=true; label=n<=6?'💀 THE BALROG WAKES':`💀 BALROG RETURNS (${n})`;
    spawns.push(...mkSpawns('balrog',Math.min(1+Math.floor(n/6),2),9000,0,pLen));
    spawns.push(...mkSpawns('urukhai',Math.floor(n*0.4)+2,1200,3000,pLen));
    spawns.push(...mkSpawns('orc',8+n,Math.max(350,700-n*18),2000,pLen));
  } else if (arch===1) {
    label=`⚔ Shadow of Mordor — ${n}`;
    spawns.push(...mkSpawns('orc',12+n*2,Math.max(180,580-n*20),0,pLen));
    if (n>3) spawns.push(...mkSpawns('warg',3+Math.floor(n*0.3),500,2200,pLen));
  } else if (arch===2) {
    label=`🐺 Warg Riders — ${n}`;
    spawns.push(...mkSpawns('warg',10+n,Math.max(100,380-n*14),0,pLen));
    spawns.push(...mkSpawns('orc',6+n,340,1500,pLen));
  } else if (arch===3) {
    label=`⛧ March of Isengard — ${n}`;
    const uc=Math.max(3,Math.floor(n*0.6));
    spawns.push(...mkSpawns('urukhai',uc,Math.max(900,2400-n*55),0,pLen));
    spawns.push(...mkSpawns('troll',Math.max(1,Math.floor(n*0.2)),3200,uc*900,pLen));
  } else if (arch===4) {
    label=`🌑 Riders of the Nine — ${n}`;
    const nc=Math.min(1+Math.floor(n/5),4);
    spawns.push(...mkSpawns('nazgul',nc,3000,0,pLen));
    spawns.push(...mkSpawns('orc',8+n,340,1000,pLen));
    if (n>4) spawns.push(...mkSpawns('urukhai',Math.floor(n*0.3),900,2600,pLen));
  } else {
    label=`🔥 Armies of Mordor — ${n}`;
    const b=Math.max(3,Math.floor(n*0.5));
    spawns.push(...mkSpawns('orc',b,480,0,pLen));
    spawns.push(...mkSpawns('warg',Math.floor(b*0.6),300,b*380,pLen));
    spawns.push(...mkSpawns('urukhai',Math.max(1,Math.floor(n*0.25)),1400,b*600,pLen));
    if (n>5) spawns.push(...mkSpawns('troll',Math.max(1,Math.floor(n*0.1)),3500,b*1000,pLen));
    if (n>8) spawns.push(...mkSpawns('nazgul',Math.floor(n*0.1),4000,b*1300,pLen));
  }
  spawns.sort((a,b)=>a.at-b.at);
  return {spawns,label,isBoss};
}

/* -------------------- Init -------------------- */
export function initGS(): GS {
  return {
    gold:200, lives:20, wave:0, score:0, kills:0, gt:0,
    towers:new Map(), enemies:[], projs:[], floats:[], particles:[],
    waveActive:false, gameOver:false,
    waveStartGT:0, queue:[], waveScale:1, waveLabel:'Middle-earth awaits…', isBoss:false, uid:1,
    selectedKey:null, selType:'arrow',
    mode:'day', dayLen:DAY_LEN, nightLen:NIGHT_LEN, phaseTime:0,
    eyeOfSauron:0,
    beaconCharges:1, beaconActive:false, beaconEnd:0, nextBeaconWave:3,
    map: generateMap(),
    gameSpeed: 1,
    sendWaveReady: true,
  };
}

/* -------------------- Phase Logic -------------------- */
export function startNight(gs:GS) {
  gs.mode='night'; gs.phaseTime=0;
  gs.wave++;
  gs.waveScale = 1+(gs.wave-1)*0.14;
  const {spawns,label,isBoss} = generateWave(gs);
  gs.queue=spawns; gs.waveLabel=label; gs.isBoss=isBoss;
  gs.waveStartGT=gs.gt; gs.waveActive=true; gs.sendWaveReady=false;
}

/** Call during day phase to start night early and earn a gold bonus */
export function sendWaveNow(gs:GS) {
  if (gs.mode!=='day'||gs.gameOver||!gs.sendWaveReady) return;
  const bonus = Math.round(20 + gs.wave * 8);
  gs.gold += bonus;
  floatText(gs, GW/2, GH*0.45, `+${bonus}🌾 Early Assault Bonus!`, '#ffd060');
  startNight(gs);
}

export function endNight(gs:GS) {
  gs.mode='day'; gs.phaseTime=0; gs.waveActive=false; gs.sendWaveReady=true;
  const interest = Math.min(Math.floor(gs.gold*0.04), 60);
  if (interest>0) { gs.gold+=interest; floatText(gs,GW/2,GH*0.45,`+${interest}🌾 interest`,TCFG.arrow.color); }
  if (gs.wave>=gs.nextBeaconWave && gs.beaconCharges<3) {
    gs.beaconCharges++;
    gs.nextBeaconWave+=3;
    floatText(gs,GW/2,GH*0.38,'🔥 Beacon Charged!','#ffc860');
  }
}

/* -------------------- Night Update -------------------- */
export function updateNight(gs:GS,dt:number) {
  if (gs.gameOver) return;
  gs.eyeOfSauron = Math.min(100, gs.eyeOfSauron+0.15*dt);
  if (gs.beaconActive && gs.gt>gs.beaconEnd) gs.beaconActive=false;

  if (gs.waveActive && gs.queue.length>0) {
    const elapsed = gs.gt-gs.waveStartGT;
    while (gs.queue.length>0 && gs.queue[0].at<=elapsed) {
      const s=gs.queue.shift()!;
      const cfg=ECFG[s.type];
      const spdMult=(1+Math.min(gs.wave*0.01,0.45))*eyeSpeedMult(gs);
      const path = gs.map.pathPX[s.pathIdx%gs.map.pathPX.length];
      const [sx,sy]=path[0];
      const hp=Math.round(cfg.hp*gs.waveScale*eyeHpMult(gs));
      gs.enemies.push({
        id:uidOf(gs),x:sx,y:sy,hp,maxHp:hp,
        baseSpeed:cfg.spd,speed:cfg.spd*spdMult,
        reward:Math.round(cfg.reward*(1+(gs.wave-1)*0.07)),
        wpIdx:1,pathPX:path,
        type:s.type,armor:cfg.armor,slowUntil:0,slowPct:0,healRate:cfg.healRate,
      });
    }
  }

  const leakedIds:number[]=[];
  for (const e of gs.enemies) {
    if (e.healRate>0) e.hp=Math.min(e.maxHp,e.hp+e.healRate*dt);
    if (e.wpIdx>=e.pathPX.length) {
      leakedIds.push(e.id); gs.lives--;
      gs.eyeOfSauron=Math.min(100,gs.eyeOfSauron+5);
      if (gs.lives<=0) { gs.gameOver=true; return; }
      continue;
    }
    const sf = gs.gt<e.slowUntil ? Math.max(0.15,1-e.slowPct) : 1;
    const [tx,ty]=e.pathPX[e.wpIdx];
    const dx=tx-e.x,dy=ty-e.y,dist=Math.hypot(dx,dy)||1,step=e.speed*sf*dt;
    if (dist<=step+0.5) { e.x=tx; e.y=ty; e.wpIdx++; }
    else { e.x+=dx/dist*step; e.y+=dy/dist*step; }
  }
  gs.enemies=gs.enemies.filter(e=>!leakedIds.includes(e.id)&&e.hp>0);

  const beaconDmg=gs.beaconActive?2.5:1.0, beaconRng=gs.beaconActive?1.5:1.0;
  for (const [,t] of gs.towers) {
    const cfg=TCFG[t.type];
    if (!cfg.dmg&&!cfg.slow) continue;
    const rate=tRate(t)*nazgulDebuff(gs,t.col,t.row);
    if (gs.gt-t.lastFired < 1000/rate) continue;
    const range=tRng(t)*CELL*beaconRng;
    const bx=t.col*CELL+CELL/2, by=t.row*CELL+CELL/2;
    let best:Enemy|null=null,bestWp=-1;
    for (const e of gs.enemies) {
      const dx=e.x-bx,dy=e.y-by;
      if (dx*dx+dy*dy<=range*range&&e.wpIdx>bestWp) { best=e; bestWp=e.wpIdx; }
    }
    if (!best) continue;
    t.lastFired=gs.gt; t.angle=Math.atan2(best.y-by,best.x-bx);
    const boost=beaconBoost(gs,t.col,t.row)*beaconDmg;
    const dmg=Math.round(tDmg(t)*boost);
    const slowDur=cfg.slow>0?gs.gt+2200:0;
    gs.projs.push({id:uidOf(gs),x:bx,y:by,eid:best.id,dmg,spd:460,splash:cfg.splash,chain:tChain(t),color:cfg.pc,slowUntil:slowDur,type:t.type});
  }

  const deadProj:number[]=[];
  for (const p of gs.projs) {
    const tgt=gs.enemies.find(e=>e.id===p.eid);
    if (!tgt) { deadProj.push(p.id); continue; }
    const dx=tgt.x-p.x,dy=tgt.y-p.y,dist=Math.hypot(dx,dy)||1;
    if (dist<=p.spd*dt+8) {
      const hitList=p.splash>0?gs.enemies.filter(e=>Math.hypot(e.x-tgt.x,e.y-tgt.y)<=p.splash):[tgt];
      for (const e of hitList) {
        const pierce=TCFG[p.type].piercesArmor;
        const dmg=pierce?p.dmg:Math.round(p.dmg*(1-e.armor));
        e.hp-=dmg;
        if (p.slowUntil>0) { e.slowUntil=Math.max(e.slowUntil,p.slowUntil); e.slowPct=Math.max(e.slowPct,TCFG.treant.slow); }
        spawnParticles(gs,e.x,e.y,p.color,p.splash>0?12:4);
        if (e.hp<=0) {
          gs.gold+=e.reward; gs.score+=e.reward; gs.kills++;
          floatText(gs,e.x,e.y-16,`+${e.reward}🌾`,'#f8d060');
          spawnParticles(gs,e.x,e.y,ECFG[e.type].rim,12);
        }
      }
      if (p.chain>0) {
        const already=new Set(hitList.map(h=>h.id));
        let from=tgt;
        for (let i=0;i<p.chain;i++) {
          const next=gs.enemies.filter(e=>!already.has(e.id)&&Math.hypot(e.x-from.x,e.y-from.y)<CHAIN_R)
            .sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];
          if (!next) break;
          next.hp-=Math.round(p.dmg*0.6*(1-next.armor));
          spawnParticles(gs,next.x,next.y,p.color,4);
          if (next.hp<=0) { gs.gold+=next.reward; gs.score+=next.reward; gs.kills++; }
          already.add(next.id); from=next;
        }
      }
      deadProj.push(p.id);
    } else { p.x+=dx/dist*p.spd*dt; p.y+=dy/dist*p.spd*dt; }
  }
  gs.projs=gs.projs.filter(p=>!deadProj.includes(p.id));
  if (gs.waveActive&&gs.queue.length===0&&gs.enemies.length===0) gs.waveActive=false;
}

/* -------------------- Day Update -------------------- */
export function updateDay(gs:GS,dt:number) {
  gs.eyeOfSauron=Math.max(0,gs.eyeOfSauron-0.4*dt);
  gs.gold+=2.5*dt; // passive trickle
}

/* -------------------- Main Update -------------------- */
export function update(gs:GS,dt:number) {
  if (gs.gameOver) return;
  gs.gt+=dt*1000;
  gs.phaseTime+=dt*1000;
  if (gs.mode==='day') {
    updateDay(gs,dt);
    if (gs.phaseTime>=gs.dayLen) startNight(gs);
  } else {
    updateNight(gs,dt);
    if (gs.phaseTime>=gs.nightLen) endNight(gs);
  }
  for (const f of gs.floats) f.age+=dt*1000;
  gs.floats=gs.floats.filter(f=>f.age<1800);
  for (const p of gs.particles) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=0.85; p.vy*=0.85; p.life-=dt; }
  gs.particles=gs.particles.filter(p=>p.life>0);
  if (gs.particles.length>900) gs.particles.splice(0,gs.particles.length-900);
}
