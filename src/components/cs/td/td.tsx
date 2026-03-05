'use client';
import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

import {
  GS, TT, Tower,
  TCFG, COLS, ROWS, GW, GH,
  initGS, update, sendWaveNow,
  tDmg, tRng, tRate, upgCost, sellVal,
} from './td.logic';
import { renderFrame } from './td.rendering';

/* ── Animations ──────────────────────────────────────────────────── */
const pulse    = keyframes`0%,100%{opacity:1}50%{opacity:0.45}`;
const flicker  = keyframes`0%,100%{opacity:1;transform:scale(1)}50%{opacity:.72;transform:scale(.95)}`;
const slideUp  = keyframes`from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}`;
const shimmer  = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;
const orbPulse = keyframes`0%,100%{box-shadow:0 0 6px #c9a22744}50%{box-shadow:0 0 18px #c9a227bb}`;

/* ── Palette ─────────────────────────────────────────────────────── */
const C = {
  bg:       '#060402',
  panel:    '#0e0a06',
  panelAlt: '#13100a',
  border:   '#5a4218',
  borderDim:'#2c1e0c',
  borderBrt:'#8a6828',
  text:     '#d4b878',
  textDim:  '#604c28',
  textMid:  '#987040',
  gold:     '#c9a227',
  goldBrt:  '#f0c84a',
  goldDim:  '#7a5e14',
  danger:   '#8c1c1c',
  dangerBrt:'#e04848',
  warn:     '#b87020',
  night:    '#3850a0',
  green:    '#507830',
  greenBrt: '#74b83a',
  silver:   '#9ab0c4',
};

/* ── Styled Components ───────────────────────────────────────────── */
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  min-height: 580px;
  overflow: hidden;
  font-family: 'Cinzel', 'Palatino', 'Georgia', serif;
  color: ${C.text};
  user-select: none;
`;

/* HUD — thin top bar */
const HUD = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  flex-shrink: 0;
  background: linear-gradient(180deg,#050301,#09060300);
  border-bottom: 1px solid ${C.border};
  z-index: 20;
  flex-wrap: nowrap;
  overflow: hidden;
`;
const Title = styled.span`
  font-weight: 900;
  font-size: 0.82rem;
  color: ${C.gold};
  letter-spacing: 0.16em;
  white-space: nowrap;
  text-shadow: 0 0 14px ${C.gold}55;
  margin-right: 0.35rem;
  background: linear-gradient(90deg, ${C.goldDim}, ${C.goldBrt}, ${C.goldDim});
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 4s linear infinite;
`;
const Stat = styled.div<{$c?:string}>`
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  padding: 0.12rem 0.38rem;
  border-radius: 3px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  color: ${p=>p.$c||C.text};
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
`;
const WaveBadge = styled.div<{$boss?:boolean}>`
  margin-left: auto;
  padding: 0.14rem 0.5rem;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  white-space: nowrap;
  color: ${p=>p.$boss?'#ff9055':'#a0e060'};
  border: 1px solid ${p=>p.$boss?'#ff906055':'#a0e06040'};
  background: ${p=>p.$boss?'rgba(255,90,20,0.08)':'rgba(140,220,60,0.06)'};
  animation: ${p=>p.$boss?css`${pulse} 0.85s ease-in-out infinite`:'none'};
`;

/* ── Main layout ─────────────────────────────────────────────────── */
const Main = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

/* Canvas area — flex 1, centers + scales canvas */
const CanvasArea = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #060402;
  position: relative;
`;
/* Canvas wrapper — exact scaled dimensions, clips canvas */
const CanvasWrap = styled.div<{$w:number;$h:number}>`
  position: relative;
  width: ${p=>p.$w}px;
  height: ${p=>p.$h}px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid ${C.border}55;
  box-shadow: 0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.5);
`;
const CanvasEl = styled.canvas`
  display: block;
  cursor: crosshair;
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: crisp-edges;
`;

/* ── Side Panel ──────────────────────────────────────────────────── */
const Side = styled.aside`
  width: 264px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${C.panel};
  border-left: 1px solid ${C.border};
`;
const SideScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0.5rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: ${C.border} transparent;
`;

/* Section header */
const SecHead = styled.div`
  font-size: 0.6rem;
  font-weight: 900;
  color: ${C.gold};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid ${C.borderDim};
  margin-bottom: 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

/* Divider */
const Div = styled.div`height:1px;background:${C.borderDim};margin:0.1rem 0;`;

/* Tower grid */
const TGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:0.25rem;`;
const TBtn = styled.button<{$sel?:boolean;$off?:boolean}>`
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.4rem;
  border-radius: 5px;
  text-align: left;
  background: ${p=>p.$sel?'rgba(201,162,39,0.10)':'rgba(255,255,255,0.02)'};
  border: 1px solid ${p=>p.$sel?C.gold+'55':C.borderDim};
  color: ${C.text};
  cursor: ${p=>p.$off?'not-allowed':'pointer'};
  opacity: ${p=>p.$off?0.32:1};
  transition: all 0.1s;
  animation: ${p=>p.$sel?css`${orbPulse} 2s ease-in-out infinite`:'none'};
  &:hover:not(:disabled) { background:rgba(201,162,39,0.06); border-color:${C.goldDim}; }
`;
const TDot = styled.span<{$c:string}>`
  width:8px;height:8px;border-radius:50%;background:${p=>p.$c};flex-shrink:0;
  box-shadow:0 0 5px ${p=>p.$c}cc;
`;
const TRow = styled.div`display:flex;align-items:center;gap:0.28rem;`;
const TName = styled.div`font-size:0.7rem;font-weight:700;color:${C.text};line-height:1.2;`;
const TCost = styled.div`font-size:0.6rem;color:${C.textMid};`;
const TDesc = styled.div`font-size:0.55rem;color:${C.textDim};line-height:1.3;margin-top:0.08rem;`;

/* Selected box */
const SelBox = styled.div`
  background: rgba(201,162,39,0.04);
  border: 1px solid ${C.borderDim};
  border-radius: 5px;
  padding: 0.45rem;
  animation: ${slideUp} 0.15s ease-out;
`;
const StatGrid = styled.div`display:grid;grid-template-columns:auto auto auto;gap:0.12rem 0.4rem;margin:0.2rem 0;`;
const SLabel = styled.div`font-size:0.57rem;color:${C.textDim};text-transform:uppercase;letter-spacing:0.06em;`;
const SVal   = styled.div`font-size:0.7rem;color:${C.text};font-weight:700;`;

/* Action buttons */
const ActBtn = styled.button<{$v?:'upgrade'|'sell'|'beacon'|'wave'|'speed'}>`
  display:block; width:100%; padding:0.28rem 0.4rem;
  border-radius:4px; margin-top:0.22rem;
  font-weight:800; font-family:'Cinzel',serif; font-size:0.65rem;
  cursor:pointer; transition:all 0.1s;
  background:${p=>(
    p.$v==='sell'   ?'rgba(140,32,32,0.10)':
    p.$v==='beacon' ?'rgba(201,162,39,0.10)':
    p.$v==='wave'   ?'rgba(60,160,60,0.10)':
    p.$v==='speed'  ?'rgba(80,80,220,0.10)':
                     'rgba(55,130,55,0.10)'
  )};
  border:1px solid ${p=>(
    p.$v==='sell'   ?'rgba(160,36,36,0.40)':
    p.$v==='beacon' ?C.gold+'44':
    p.$v==='wave'   ?'rgba(60,160,60,0.40)':
    p.$v==='speed'  ?'rgba(80,80,220,0.40)':
                     'rgba(55,130,55,0.35)'
  )};
  color:${p=>(
    p.$v==='sell'   ?'#e08080':
    p.$v==='beacon' ?C.gold:
    p.$v==='wave'   ?'#80e880':
    p.$v==='speed'  ?'#9090f8':
                     '#88e888'
  )};
  &:disabled{opacity:0.26;cursor:not-allowed;}
  &:not(:disabled):hover{filter:brightness(1.25);}
`;

/* Meter */
const MBar = styled.div`width:100%;height:6px;background:rgba(0,0,0,0.6);border-radius:3px;overflow:hidden;margin:0.15rem 0;`;
const MFill = styled.div<{$p:number;$c:string}>`height:100%;width:${p=>p.$p}%;background:${p=>p.$c};transition:width 0.3s;border-radius:3px;`;

/* Beacon pips */
const BPips = styled.div`display:flex;gap:4px;margin:0.2rem 0;`;
const BPip  = styled.div<{$on:boolean}>`
  width:12px;height:12px;border-radius:50%;
  background:${p=>p.$on?C.gold:'#110d05'};
  border:1px solid ${p=>p.$on?C.gold:C.borderDim};
  box-shadow:${p=>p.$on?`0 0 8px ${C.gold}99`:'none'};
  animation:${p=>p.$on?css`${flicker} 1.4s ease-in-out infinite`:'none'};
`;

/* Speed buttons */
const SpeedRow = styled.div`display:flex;gap:0.2rem;margin-top:0.2rem;`;
const SpeedBtn = styled.button<{$on:boolean}>`
  flex:1;padding:0.22rem 0;border-radius:4px;font-size:0.62rem;font-weight:800;
  font-family:'Cinzel',serif;cursor:pointer;transition:all 0.1s;
  background:${p=>p.$on?'rgba(80,80,220,0.18)':'rgba(255,255,255,0.02)'};
  border:1px solid ${p=>p.$on?'rgba(120,120,255,0.5)':C.borderDim};
  color:${p=>p.$on?'#b0b8ff':C.textDim};
  &:hover{filter:brightness(1.2);}
`;

/* Phase bar at bottom of side panel */
const PhaseFooter = styled.div`
  padding:0.4rem 0.5rem 0.5rem;
  border-top:1px solid ${C.borderDim};
  flex-shrink:0;
  background:rgba(0,0,0,0.3);
`;
const PLabel = styled.div`font-size:0.6rem;letter-spacing:0.06em;text-transform:uppercase;color:${C.textDim};margin-bottom:0.18rem;`;

/* Info chip */
const Chip = styled.div`font-size:0.6rem;color:${C.textDim};line-height:1.5;`;

/* Game over */
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:500;
  display:flex;align-items:center;justify-content:center;
`;
const GOBox = styled.div`
  background:${C.panel};border:2px solid ${C.border};border-radius:14px;
  padding:2.2rem 2.8rem;text-align:center;max-width:340px;
  box-shadow:0 0 80px rgba(0,0,0,0.8),0 0 20px ${C.border}44;
`;
const GOTitle = styled.h2`font-size:1.7rem;color:${C.dangerBrt};margin:0 0 0.4rem;letter-spacing:0.08em;`;
const GOSub   = styled.p`color:${C.textMid};font-size:0.85rem;margin:0 0 1.4rem;line-height:1.6;`;
const GOBtn   = styled.button`
  padding:0.55rem 1.8rem;border-radius:8px;font-family:'Cinzel',serif;
  font-size:0.85rem;font-weight:800;cursor:pointer;
  background:rgba(201,162,39,0.12);border:1px solid ${C.gold}88;color:${C.gold};
  &:hover{background:rgba(201,162,39,0.22);}
`;

/* ── UI State ────────────────────────────────────────────────────── */
interface UI {
  gold:number; lives:number; wave:number; score:number; kills:number;
  waveLabel:string; isBoss:boolean; gameOver:boolean;
  mode:'day'|'night'; phaseTime:number;
  eyeOfSauron:number;
  beaconCharges:number; beaconActive:boolean; beaconEnd:number;
  sendWaveReady:boolean;
  gameSpeed:1|2|4;
}
function snapUI(g:GS): UI {
  return {
    gold:g.gold, lives:g.lives, wave:g.wave, score:g.score, kills:g.kills,
    waveLabel:g.waveLabel, isBoss:g.isBoss, gameOver:g.gameOver,
    mode:g.mode, phaseTime:g.phaseTime,
    eyeOfSauron:g.eyeOfSauron,
    beaconCharges:g.beaconCharges, beaconActive:g.beaconActive, beaconEnd:g.beaconEnd,
    sendWaveReady:g.sendWaveReady,
    gameSpeed:g.gameSpeed,
  };
}

/* ── Component ───────────────────────────────────────────────────── */
export default function TDGame({ isRunning=true, speed=1 }: { isRunning?:boolean; speed?:number }) {
  const canvasRef     = useRef<HTMLCanvasElement|null>(null);
  const canvasAreaRef = useRef<HTMLDivElement|null>(null);
  const gsRef         = useRef<GS>(initGS());
  const runRef        = useRef(isRunning);
  const speedRef      = useRef(speed);
  const animRef       = useRef<number|null>(null);
  const hoverRef      = useRef<[number,number]|null>(null);
  const scaleRef      = useRef(1);

  const [ui,          setUi]          = useState<UI>(()=>snapUI(gsRef.current));
  const [selType,     setSelType]     = useState<TT>('arrow');
  const [selectedKey, setSelectedKey] = useState<string|null>(null);
  const [scale,       setScale]       = useState(1);

  useEffect(()=>{ runRef.current=isRunning; },[isRunning]);
  useEffect(()=>{ speedRef.current=speed; },[speed]);

  /* ── Responsive canvas scaling using ResizeObserver ─── */
  useLayoutEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const update = () => {
      const r = area.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / GW, r.height / GH);
      scaleRef.current = s;
      setScale(s);
      if (canvasRef.current) canvasRef.current.style.transform = `scale(${s})`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

  const syncUI = useCallback(() => {
    const g = gsRef.current;
    setUi(snapUI(g));
    setSelectedKey(g.selectedKey);
    setSelType(g.selType);
  }, []);

  /* ── Game loop ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = GW; canvas.height = GH;
    if (scaleRef.current !== 1) canvas.style.transform = `scale(${scaleRef.current})`;
    let last = 0, tick = 0;
    const loop = (ts:number) => {
      const dt = last===0?0:Math.min((ts-last)/1000,0.05);
      last = ts;
      const gs = gsRef.current;
      if (runRef.current && !gs.gameOver) {
        // Combine outer speed prop + internal game speed
        const sp = Math.max(0.12, speedRef.current) * gs.gameSpeed;
        update(gs, dt * sp);
        if (++tick>=12) { tick=0; syncUI(); }
      }
      const bm = gs.mode==='day' && !gs.gameOver;
      renderFrame(ctx, gs, hoverRef.current, gs.selType, bm);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [syncUI]);

  /* ── Coordinate translation (accounts for CSS scale automatically) ─── */
  const toCell = (e:React.MouseEvent<HTMLCanvasElement>): [number,number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [
      Math.floor((e.clientX-rect.left) / rect.width  * COLS),
      Math.floor((e.clientY-rect.top)  / rect.height * ROWS),
    ];
  };

  const onClick = (e:React.MouseEvent<HTMLCanvasElement>) => {
    const [col,row] = toCell(e);
    if (col<0||col>=COLS||row<0||row>=ROWS) return;
    const g = gsRef.current;
    const k = `${col},${row}`;
    if (g.towers.has(k)) { g.selectedKey=k; syncUI(); return; }
    g.selectedKey=null;
    const canBuild = g.mode==='day' && !g.gameOver;
    if (!canBuild || !g.map.buildableSet.has(k)) { syncUI(); return; }
    const cfg = TCFG[g.selType];
    if (g.gold<cfg.cost) return;
    g.gold-=cfg.cost;
    g.towers.set(k,{col,row,type:g.selType,lastFired:-9999,lvl:1,key:k,angle:0});
    syncUI();
  };
  const onMouseMove = (e:React.MouseEvent<HTMLCanvasElement>) => {
    const [col,row] = toCell(e);
    hoverRef.current = (col>=0&&col<COLS&&row>=0&&row<ROWS)?[col,row]:null;
  };

  /* ── Actions ─── */
  const setBuild   = (t:TT) => { const g=gsRef.current; g.selType=t; g.selectedKey=null; syncUI(); };
  const upgrade    = () => { const g=gsRef.current; if (!g.selectedKey) return; const t=g.towers.get(g.selectedKey); if (!t||t.lvl>=3) return; const c=upgCost(t); if (g.gold<c) return; g.gold-=c; t.lvl=(t.lvl+1) as 1|2|3; syncUI(); };
  const sell       = () => { const g=gsRef.current; if (!g.selectedKey) return; const t=g.towers.get(g.selectedKey); if (!t) return; g.gold+=sellVal(t); g.towers.delete(g.selectedKey); g.selectedKey=null; syncUI(); };
  const lightBeacon= () => { const g=gsRef.current; if (g.beaconCharges<=0||g.beaconActive) return; g.beaconCharges--; g.beaconActive=true; g.beaconEnd=g.gt+10000; syncUI(); };
  const doSendWave = () => { sendWaveNow(gsRef.current); syncUI(); };
  const setSpeed   = (s:1|2|4) => { gsRef.current.gameSpeed=s; syncUI(); };
  const restart    = () => { gsRef.current=initGS(); setSelectedKey(null); setSelType('arrow'); syncUI(); };

  const canBuild  = ui.mode==='day' && !ui.gameOver;
  const selTower: Tower|undefined = selectedKey ? gsRef.current.towers.get(selectedKey) : undefined;
  const eyeColor  = ui.eyeOfSauron>=80?C.dangerBrt:ui.eyeOfSauron>=50?C.warn:C.textDim;
  const eyeLabel  = ui.eyeOfSauron>=80?'DIRE THREAT':ui.eyeOfSauron>=50?'Rising':'Dormant';
  const bTimerPct = ui.beaconActive ? Math.max(0,(ui.beaconEnd-gsRef.current.gt)/10000) : 0;
  const phaseMax  = ui.mode==='day'?25000:35000;
  const phaseRem  = Math.max(0,Math.ceil((phaseMax-ui.phaseTime)/1000));
  const phasePct  = ui.mode==='day' ? ui.phaseTime/phaseMax*100 : ui.phaseTime/phaseMax*100;

  return (
    /* inline style overrides any parent "background:transparent" rule */
    <Wrap style={{ background: C.bg }}>

      {/* ── HUD ─────────────────────────────────────────────── */}
      <HUD>
        <Title>⚔ MIDDLE-EARTH DEFENDER</Title>
        <Stat $c={C.gold}>🌾 {Math.floor(ui.gold)}</Stat>
        <Stat $c="#e06060">❤ {ui.lives}</Stat>
        <Stat>W{ui.wave}</Stat>
        <Stat $c={C.silver}>⭐ {ui.score}</Stat>
        <Stat $c="#80c0a0">☠ {ui.kills}</Stat>
        <Stat $c={ui.mode==='night'?'#6882c0':C.gold}>
          {ui.mode==='night'?'🌙':'☀'} {phaseRem}s
        </Stat>
        {/* Speed controls in HUD */}
        <SpeedRow style={{marginTop:0,marginLeft:'0.2rem'}}>
          {([1,2,4] as const).map(s=>(
            <SpeedBtn key={s} $on={ui.gameSpeed===s} onClick={()=>setSpeed(s)} style={{padding:'0.1rem 0.3rem',fontSize:'0.62rem'}}>
              {s}×
            </SpeedBtn>
          ))}
        </SpeedRow>
        {ui.wave>0 && <WaveBadge $boss={ui.isBoss}>{ui.waveLabel}</WaveBadge>}
      </HUD>

      <Main>
        {/* ── Canvas ──────────────────────────────────────────── */}
        <CanvasArea ref={canvasAreaRef}>
          <CanvasWrap $w={GW*scale} $h={GH*scale}>
            <CanvasEl
              ref={canvasRef}
              width={GW}
              height={GH}
              onClick={onClick}
              onMouseMove={onMouseMove}
              onMouseLeave={()=>{ hoverRef.current=null; }}
            />
          </CanvasWrap>
        </CanvasArea>

        {/* ── Side Panel ──────────────────────────────────────── */}
        <Side>
          <SideScroll>

            {/* ── BUILD ── */}
            <SecHead>
              {canBuild ? '🏗 Build Towers' : <span style={{color:C.warn}}>⚔ Battle — night</span>}
            </SecHead>
            <TGrid>
              {(Object.keys(TCFG) as TT[]).map(t => {
                const cfg = TCFG[t];
                const off = !canBuild || ui.gold < cfg.cost;
                return (
                  <TBtn key={t} $sel={selType===t&&!selectedKey} $off={off}
                    onClick={()=>setBuild(t)} disabled={off}>
                    <TRow><TDot $c={cfg.color}/><TName>{cfg.name}</TName></TRow>
                    <TCost>🌾 {cfg.cost}</TCost>
                    <TDesc>{cfg.desc}</TDesc>
                  </TBtn>
                );
              })}
            </TGrid>

            {/* ── SEND WAVE NOW ── */}
            {canBuild && (
              <>
                <Div/>
                <SecHead>⚡ Early Assault</SecHead>
                <Chip>Skip build phase — earn bonus gold</Chip>
                <ActBtn $v="wave" onClick={doSendWave} disabled={!ui.sendWaveReady}>
                  ⚡ Send Wave Early! (+{20+ui.wave*8}🌾)
                </ActBtn>
              </>
            )}

            <Div/>

            {/* ── SELECTED TOWER ── */}
            {selTower ? (
              <>
                <SecHead>⚒ Selected Tower</SecHead>
                <SelBox>
                  <TRow style={{marginBottom:4}}>
                    <TDot $c={TCFG[selTower.type].color}/>
                    <TName style={{fontSize:'0.78rem',color:TCFG[selTower.type].color}}>{TCFG[selTower.type].name}</TName>
                    <span style={{marginLeft:'auto',fontSize:'0.6rem',color:C.textDim}}>Lv{selTower.lvl}</span>
                  </TRow>
                  <StatGrid>
                    <SLabel>DMG</SLabel><SLabel>RNG</SLabel><SLabel>RATE</SLabel>
                    <SVal>{tDmg(selTower)}</SVal>
                    <SVal>{tRng(selTower).toFixed(1)}</SVal>
                    <SVal>{tRate(selTower).toFixed(1)}/s</SVal>
                  </StatGrid>
                  <ActBtn $v="upgrade" onClick={upgrade}
                    disabled={selTower.lvl>=3||ui.gold<upgCost(selTower)}>
                    {selTower.lvl<3?`▲ Lv${selTower.lvl+1}  (${upgCost(selTower)}🌾)`:'✓ Max Level'}
                  </ActBtn>
                  <ActBtn $v="sell" onClick={sell}>
                    ✕ Sell  +{sellVal(selTower)}🌾
                  </ActBtn>
                </SelBox>
              </>
            ) : (
              <Chip style={{padding:'0.1rem 0'}}>Click a tower to select</Chip>
            )}

            <Div/>

            {/* ── BEACON OF GONDOR ── */}
            <SecHead>🔥 Beacon of Gondor</SecHead>
            <Chip>×2.5 dmg · ×1.5 range · 10 seconds</Chip>
            <BPips>
              {[0,1,2].map(i=><BPip key={i} $on={i<ui.beaconCharges}/>)}
              <span style={{fontSize:'0.6rem',color:C.textDim,marginLeft:5,alignSelf:'center'}}>{ui.beaconCharges}/3</span>
            </BPips>
            {ui.beaconActive && (
              <>
                <Chip style={{color:C.gold}}>Active — {Math.ceil(bTimerPct*10)}s left</Chip>
                <MBar><MFill $p={bTimerPct*100} $c={C.gold}/></MBar>
              </>
            )}
            <ActBtn $v="beacon" onClick={lightBeacon}
              disabled={ui.beaconCharges<=0||ui.beaconActive}>
              {ui.beaconActive?'⟳ Burning…':'🔥 Light the Beacons!'}
            </ActBtn>

            <Div/>

            {/* ── EYE OF SAURON ── */}
            <SecHead>👁 Eye of Sauron</SecHead>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
              <span style={{fontSize:'0.65rem',color:eyeColor,fontWeight:700}}>{eyeLabel}</span>
              <span style={{fontSize:'0.6rem',color:C.textDim}}>{Math.floor(ui.eyeOfSauron)}%</span>
            </div>
            <MBar style={{height:9}}>
              <MFill $p={ui.eyeOfSauron}
                $c={ui.eyeOfSauron>=80?C.dangerBrt:ui.eyeOfSauron>=50?C.warn:'#602010'}/>
            </MBar>
            {ui.eyeOfSauron>=50 && (
              <Chip style={{color:C.warn}}>
                {ui.eyeOfSauron>=80?'⚠ Enemies faster & tougher':'⚠ Enemies moving faster'}
              </Chip>
            )}

          </SideScroll>

          {/* Phase footer */}
          <PhaseFooter>
            <PLabel>
              {ui.mode==='day'?`☀ Day — ${phaseRem}s to nightfall`:`🌙 Night — ${phaseRem}s remaining`}
            </PLabel>
            <MBar style={{height:5}}>
              <MFill $p={phasePct} $c={ui.mode==='night'?C.night:C.goldDim}/>
            </MBar>
          </PhaseFooter>
        </Side>
      </Main>

      {/* ── Game Over ─────────────────────────────────────── */}
      {ui.gameOver && (
        <Overlay>
          <GOBox>
            <GOTitle>The Eye Sees All</GOTitle>
            <GOSub>
              Middle-earth has fallen.<br/>
              Wave {ui.wave} · {ui.kills} foes slain · {ui.score} glory.
            </GOSub>
            <GOBtn onClick={restart}>Rise Again</GOBtn>
          </GOBox>
        </Overlay>
      )}
    </Wrap>
  );
}
