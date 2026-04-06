'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { TrendingUp, TrendingDown, BarChart2, Info, RefreshCw, Layers, BookOpen, Zap, Award } from 'lucide-react';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  ink:       '#1a1208', inkMid: '#3d3120', inkLight: '#7a6e5f', inkFaint: '#b8ad9e',
  cream:     '#faf7f2', creamDark: '#f0ebe1', creamDeep: '#e4ddd0',
  rule:      'rgba(26,18,8,0.1)', ruleMid: 'rgba(26,18,8,0.06)',
  accent:    '#2563eb', accentBg: 'rgba(37,99,235,0.07)',
  green:     '#16a34a', greenBg: 'rgba(22,163,74,0.08)',
  amber:     '#b45309', amberBg: 'rgba(180,83,9,0.08)',
  red:       '#dc2626', redBg: 'rgba(220,38,38,0.08)',
  radius: '12px', radiusSm: '7px',
  shadow: '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  serif: "'DM Serif Display', Georgia, serif",
  mono:  "'DM Mono', 'Fira Mono', monospace",
  sans:  "'DM Sans', system-ui, sans-serif",
};

const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const spin   = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─── Shell ────────────────────────────────────────────────────────────────────
const Root = styled.div`
  background:${T.cream};min-height:100%;font-family:${T.sans};color:${T.ink};
  animation:${fadeUp} 0.35s ease;display:flex;flex-direction:column;
`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  padding:1.25rem 1.75rem 1.1rem;border-bottom:1px solid ${T.rule};flex-shrink:0;
`;
const Title = styled.h2`
  font-family:${T.serif};font-size:1.45rem;font-weight:400;color:${T.ink};margin:0;
`;
const Badge = styled.span`
  font-family:${T.mono};font-size:0.63rem;font-weight:500;color:${T.accent};
  background:${T.accentBg};border:1px solid ${T.accent}35;border-radius:999px;
  padding:0.2rem 0.65rem;letter-spacing:0.08em;
`;
const TabRow = styled.div`
  display:flex;align-items:center;gap:0.2rem;padding:0.5rem 1.75rem;
  border-bottom:1px solid ${T.rule};background:${T.creamDark};flex-shrink:0;
`;
const TabBtn = styled.button<{$a:boolean}>`
  display:flex;align-items:center;gap:0.38rem;padding:0.38rem 0.8rem;
  border-radius:${T.radiusSm};border:1px solid ${p=>p.$a?T.accent+'50':'transparent'};
  background:${p=>p.$a?T.accent+'12':'transparent'};
  color:${p=>p.$a?T.accent:T.inkLight};font-family:${T.sans};font-size:0.79rem;
  font-weight:${p=>p.$a?'600':'400'};cursor:pointer;transition:all 0.13s;
  &:hover{background:${T.accent}0e;color:${T.accent};}
`;

// ─── Shared ───────────────────────────────────────────────────────────────────
const SideCard = styled.div`
  background:${T.creamDark};border:1px solid ${T.rule};border-radius:${T.radius};
  padding:0.8rem 0.875rem;
`;
const SideHead = styled.div`
  font-size:0.67rem;font-weight:600;color:${T.inkFaint};letter-spacing:0.07em;
  text-transform:uppercase;font-family:${T.mono};margin-bottom:0.5rem;
`;
const PillGrid = styled.div`display:flex;flex-wrap:wrap;gap:0.35rem;`;
const PillBtn = styled.button<{$a:boolean}>`
  padding:0.28rem 0.6rem;border-radius:999px;
  border:1px solid ${p=>p.$a?T.accent:T.rule};
  background:${p=>p.$a?T.accent:'transparent'};
  color:${p=>p.$a?'#fff':T.inkLight};font-family:${T.mono};font-size:0.7rem;
  font-weight:500;cursor:pointer;transition:all 0.13s;
  &:hover{border-color:${T.accent};color:${p=>p.$a?'#fff':T.accent};}
`;
const MiniStatGrid = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.65rem;`;
const MiniStat = styled.div`
  background:${T.cream};border:1px solid ${T.ruleMid};border-radius:${T.radiusSm};padding:0.7rem 0.75rem;
`;
const MiniLabel = styled.div`
  font-family:${T.mono};font-size:0.62rem;letter-spacing:0.06em;text-transform:uppercase;
  color:${T.inkFaint};margin-bottom:0.26rem;
`;
const MiniValue = styled.div<{$c?:string}>`font-family:${T.mono};font-size:0.9rem;color:${p=>p.$c??T.ink};`;
const BulletList = styled.div`display:flex;flex-direction:column;gap:0.45rem;`;
const BulletRow = styled.div`
  display:grid;grid-template-columns:14px 1fr;gap:0.5rem;align-items:flex-start;
  font-size:0.78rem;color:${T.inkMid};line-height:1.55;
`;
const BulletDot = styled.div<{$c:string}>`
  width:7px;height:7px;border-radius:50%;background:${p=>p.$c};margin-top:0.36rem;
`;
const SummaryText = styled.p`margin:0;color:${T.inkMid};font-size:0.82rem;line-height:1.65;`;
const Disclaimer = styled.div`
  display:flex;align-items:flex-start;gap:0.5rem;padding:0.65rem 0.875rem;
  background:${T.amberBg};border:1px solid ${T.amber}35;border-radius:${T.radiusSm};
  font-size:0.7rem;color:${T.amber};font-family:${T.sans};line-height:1.55;
`;
const InsightCard = styled.div`
  background:#fff;border:1px solid ${T.rule};border-radius:${T.radius};
  padding:0.95rem 1rem;box-shadow:${T.shadow};
`;
const InsightHead = styled.div`
  display:flex;align-items:flex-start;justify-content:space-between;gap:0.875rem;margin-bottom:0.85rem;
`;
const InsightTitle = styled.div`font-family:${T.serif};font-size:1.05rem;color:${T.ink};`;
const InsightSub = styled.div`margin-top:0.18rem;font-size:0.74rem;color:${T.inkLight};line-height:1.45;`;
const InsightBody = styled.div`display:flex;flex-direction:column;gap:0.875rem;`;
const SignalPill = styled.div<{$t:string}>`
  padding:0.34rem 0.68rem;border-radius:999px;border:1px solid ${p=>p.$t}30;
  background:${p=>p.$t}12;color:${p=>p.$t};font-family:${T.mono};font-size:0.66rem;
  font-weight:600;letter-spacing:0.04em;white-space:nowrap;
`;
const Spinner = styled.div`
  width:16px;height:16px;border:2px solid ${T.creamDeep};
  border-top:2px solid ${T.accent};border-radius:50%;animation:${spin} 0.75s linear infinite;
`;

// ─── Heatmap ──────────────────────────────────────────────────────────────────
const HeatPage = styled.div`
  padding:1.25rem 1.75rem;display:flex;flex-direction:column;gap:1rem;flex:1;overflow-y:auto;
`;
const HeatControls = styled.div`
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;
`;
const HeatMapWrap = styled.div`display:flex;flex-wrap:wrap;gap:4px;min-height:260px;`;
const HeatTile = styled.div<{$bg:string;$fg:string;$flex:number}>`
  flex:${p=>p.$flex};min-width:82px;max-width:220px;height:96px;
  background:${p=>p.$bg};border-radius:${T.radiusSm};padding:0.6rem 0.7rem;
  cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;
  transition:filter 0.13s,transform 0.13s;position:relative;overflow:hidden;
  color:${p=>p.$fg};
  &:hover{filter:brightness(0.88);transform:scale(1.025);z-index:2;}
`;
const TileSymbol = styled.div`font-family:${T.mono};font-size:0.8rem;font-weight:600;`;
const TileName = styled.div`font-size:0.63rem;opacity:0.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const TileRet = styled.div`font-family:${T.mono};font-size:1.15rem;font-weight:600;line-height:1.1;`;
const TileEventsRow = styled.div`display:flex;flex-wrap:wrap;gap:3px;margin-top:3px;`;
const EventBadge = styled.div`
  font-family:${T.mono};font-size:0.5rem;font-weight:700;letter-spacing:0.04em;
  padding:0.1rem 0.32rem;border-radius:3px;background:rgba(0,0,0,0.22);
`;
const TileLoader = styled.div`
  width:14px;height:14px;border:2px solid rgba(0,0,0,0.15);
  border-top:2px solid rgba(0,0,0,0.55);border-radius:50%;animation:${spin} 0.75s linear infinite;
`;

// ─── Compare ──────────────────────────────────────────────────────────────────
const ComparePage = styled.div`display:grid;grid-template-columns:200px 1fr;flex:1;min-height:0;`;
const CompareSidebar = styled.div`
  border-right:1px solid ${T.rule};overflow-y:auto;padding:0.875rem 0.75rem;
  display:flex;flex-direction:column;gap:0.625rem;
`;
const CheckItem = styled.div<{$a:boolean;$c:string}>`
  display:flex;align-items:center;gap:0.45rem;padding:0.3rem 0.45rem;
  border-radius:${T.radiusSm};cursor:pointer;font-size:0.77rem;
  color:${p=>p.$a?p.$c:T.inkMid};font-weight:${p=>p.$a?'600':'400'};transition:background 0.1s;
  &:hover{background:${T.creamDeep};}
`;
const CheckDot = styled.div<{$c:string;$a:boolean}>`
  width:10px;height:10px;border-radius:50%;border:2px solid ${p=>p.$c};
  background:${p=>p.$a?p.$c:'transparent'};flex-shrink:0;transition:background 0.1s;
`;
const CompareMain = styled.div`
  padding:1.25rem 1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;
`;
const CompareChartWrap = styled.div`
  background:#fff;border:1px solid ${T.rule};border-radius:${T.radius};
  padding:0.625rem;position:relative;
`;
const CompareLegend = styled.div`display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.5rem;`;
const LegendItem = styled.div`
  display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-family:${T.mono};color:${T.inkMid};
`;
const BundleRow = styled.div`display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;`;
const BundleBtn = styled.button<{$a:boolean}>`
  padding:0.3rem 0.65rem;border-radius:${T.radiusSm};
  border:1px solid ${p=>p.$a?T.accent:T.rule};
  background:${p=>p.$a?T.accent+'12':'transparent'};
  color:${p=>p.$a?T.accent:T.inkLight};font-family:${T.mono};font-size:0.71rem;
  font-weight:500;cursor:pointer;transition:all 0.13s;
  &:hover{border-color:${T.accent};color:${T.accent};}
`;
const CompareStatsRow = styled.div`display:flex;flex-wrap:wrap;gap:0.625rem;`;
const CompareStatCard = styled.div<{$c:string}>`
  flex:1;min-width:110px;background:${T.cream};border:1px solid ${T.rule};
  border-left:3px solid ${p=>p.$c};border-radius:${T.radiusSm};padding:0.65rem 0.75rem;
`;
const CStatSym = styled.div<{$c:string}>`font-family:${T.mono};font-size:0.74rem;font-weight:600;color:${p=>p.$c};margin-bottom:0.2rem;`;
const CStatVal = styled.div<{$pos:boolean}>`font-family:${T.mono};font-size:1.05rem;color:${p=>p.$pos?T.green:T.red};`;
const CStatSub = styled.div`font-size:0.65rem;color:${T.inkFaint};font-family:${T.mono};margin-top:0.1rem;`;

// ─── Scenarios ────────────────────────────────────────────────────────────────
const ScenPage = styled.div`
  padding:1.25rem 1.75rem;display:flex;flex-direction:column;gap:1rem;overflow-y:auto;flex:1;
`;
const ScenGrid = styled.div`
  display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:0.875rem;
`;
const ScenCard = styled.div`
  background:#fff;border:1px solid ${T.rule};border-radius:${T.radius};
  padding:1rem 1.1rem;box-shadow:${T.shadow};display:flex;flex-direction:column;gap:0.7rem;
`;
const ScenCardHead = styled.div`display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;`;
const ScenTitle2 = styled.div`font-family:${T.serif};font-size:1rem;color:${T.ink};`;
const ScenPeriod = styled.div`
  font-family:${T.mono};font-size:0.63rem;color:${T.inkFaint};background:${T.creamDark};
  border:1px solid ${T.rule};border-radius:999px;padding:0.2rem 0.5rem;white-space:nowrap;
`;
const ScenTrigger = styled.p`margin:0;font-size:0.79rem;color:${T.inkMid};line-height:1.6;`;
const ImpactSection = styled.div`display:flex;flex-direction:column;gap:0.35rem;`;
const ImpactLabel = styled.div`
  font-family:${T.mono};font-size:0.62rem;letter-spacing:0.07em;text-transform:uppercase;color:${T.inkFaint};
`;
const ImpactRow = styled.div`display:flex;flex-wrap:wrap;gap:0.35rem;`;
const ImpactPill = styled.div<{$pos:boolean}>`
  display:flex;align-items:center;gap:0.3rem;padding:0.22rem 0.52rem;border-radius:999px;
  border:1px solid ${p=>p.$pos?T.green:T.red}35;
  background:${p=>p.$pos?T.greenBg:T.redBg};
  font-family:${T.mono};font-size:0.7rem;font-weight:500;color:${p=>p.$pos?T.green:T.red};
`;
const ScenLesson = styled.div`
  background:${T.accentBg};border:1px solid ${T.accent}25;border-radius:${T.radiusSm};
  padding:0.6rem 0.75rem;font-size:0.77rem;color:${T.inkMid};line-height:1.6;
`;
const LoadInCompareBtn = styled.button`
  align-self:flex-start;display:flex;align-items:center;gap:0.38rem;
  padding:0.38rem 0.8rem;border-radius:${T.radiusSm};border:1px solid ${T.accent}50;
  background:${T.accent}10;color:${T.accent};font-family:${T.mono};font-size:0.74rem;
  font-weight:500;cursor:pointer;transition:all 0.13s;
  &:hover{background:${T.accent}20;border-color:${T.accent}80;}
`;

// ─── Deep Dive ────────────────────────────────────────────────────────────────
const Body = styled.div`display:grid;grid-template-columns:232px 1fr;flex:1;min-height:0;`;
const Sidebar = styled.div`
  border-right:1px solid ${T.rule};overflow-y:auto;padding:0.875rem 0.75rem;
  display:flex;flex-direction:column;gap:0.625rem;
`;
const StockBtn = styled.button<{$a:boolean;$c:string}>`
  width:100%;display:flex;align-items:center;gap:0.45rem;padding:0.38rem 0.55rem;
  border-radius:${T.radiusSm};border:1px solid ${p=>p.$a?p.$c+'60':'transparent'};
  background:${p=>p.$a?p.$c+'12':'transparent'};color:${p=>p.$a?p.$c:T.inkMid};
  font-family:${T.sans};font-size:0.77rem;font-weight:${p=>p.$a?'600':'400'};
  cursor:pointer;transition:all 0.13s;text-align:left;
  &:hover{background:${p=>p.$c+'10'};color:${p=>p.$c};border-color:${p=>p.$c+'40'};}
`;
const StockDot = styled.div<{$c:string}>`width:7px;height:7px;border-radius:50%;background:${p=>p.$c};flex-shrink:0;`;
const StockSym = styled.span`font-family:${T.mono};font-size:0.75rem;flex-shrink:0;min-width:42px;`;
const StockNm = styled.span`font-size:0.71rem;opacity:0.65;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;
const AmountInput = styled.input`
  width:100%;padding:0.475rem 0.7rem;border-radius:${T.radiusSm};border:1px solid ${T.rule};
  background:${T.cream};color:${T.ink};font-family:${T.mono};font-size:0.85rem;outline:none;box-sizing:border-box;
  &:focus{border-color:${T.accent};box-shadow:0 0 0 2px ${T.accentBg};}
`;
const ToggleRow = styled.div`
  display:flex;align-items:center;justify-content:space-between;font-size:0.77rem;
  color:${T.inkMid};cursor:pointer;& + &{margin-top:0.4rem;}
`;
const ToggleTrack = styled.div<{$on:boolean;$c:string}>`
  width:30px;height:17px;border-radius:999px;
  background:${p=>p.$on?p.$c:T.creamDeep};border:1px solid ${p=>p.$on?p.$c:T.rule};
  position:relative;cursor:pointer;transition:all 0.2s;flex-shrink:0;
  &::after{content:'';position:absolute;left:${p=>p.$on?'14px':'2px'};top:1px;
    width:13px;height:13px;border-radius:50%;background:white;transition:left 0.2s;
    box-shadow:0 1px 2px rgba(0,0,0,0.15);}
`;
const CustomRow = styled.div`display:flex;gap:0.35rem;`;
const CustomInput = styled.input`
  flex:1;padding:0.4rem 0.6rem;border-radius:${T.radiusSm};border:1px solid ${T.rule};
  background:${T.cream};color:${T.ink};font-family:${T.mono};font-size:0.8rem;outline:none;
  text-transform:uppercase;min-width:0;
  &::placeholder{text-transform:none;}&:focus{border-color:${T.accent};}
`;
const AddBtn = styled.button`
  padding:0.4rem 0.6rem;border-radius:${T.radiusSm};border:1px solid ${T.accent}60;
  background:${T.accentBg};color:${T.accent};font-family:${T.mono};font-size:0.78rem;
  cursor:pointer;transition:all 0.13s;&:hover{background:${T.accent}20;}
`;
const MainCol = styled.div`
  padding:1.25rem 1.5rem 1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;
`;
const CompanyRow = styled.div`display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;`;
const CompanyLeft = styled.div`display:flex;flex-direction:column;gap:0.15rem;`;
const CompanySymbol = styled.span<{$c:string}>`font-family:${T.mono};font-size:1.15rem;font-weight:500;color:${p=>p.$c};`;
const CompanyFull = styled.span`font-size:0.78rem;color:${T.inkLight};`;
const PriceRight = styled.div`text-align:right;`;
const PriceVal = styled.div`font-family:${T.mono};font-size:1.35rem;font-weight:500;color:${T.ink};`;
const PriceChange = styled.div<{$pos:boolean}>`
  font-family:${T.mono};font-size:0.75rem;color:${p=>p.$pos?T.green:T.red};
  display:flex;align-items:center;justify-content:flex-end;gap:0.2rem;margin-top:0.1rem;
`;
const ChartWrap = styled.div`
  background:#fff;border:1px solid ${T.rule};border-radius:${T.radius};
  padding:0.625rem;position:relative;
`;
const MiniChartWrap = styled.div`
  background:#fff;border:1px solid ${T.rule};border-radius:${T.radius};
  padding:0.5rem 0.625rem 0.375rem;
`;
const MiniChartLabel = styled.div`
  font-family:${T.mono};font-size:0.63rem;letter-spacing:0.06em;text-transform:uppercase;
  color:${T.inkFaint};margin-bottom:0.25rem;
`;
const LoadOverlay = styled.div`
  position:absolute;inset:0;background:rgba(250,247,242,0.88);display:flex;
  align-items:center;justify-content:center;border-radius:${T.radius};
  gap:0.5rem;font-size:0.82rem;color:${T.inkLight};font-family:${T.sans};z-index:5;
`;
const TooltipBox = styled.div<{$l:number;$t:number}>`
  position:absolute;left:${p=>p.$l}px;top:${p=>p.$t}px;
  transform:translate(-50%,calc(-100% - 8px));background:${T.ink};color:#f0ebe1;
  border-radius:${T.radiusSm};padding:0.35rem 0.6rem;font-family:${T.mono};font-size:0.7rem;
  pointer-events:none;white-space:nowrap;z-index:10;line-height:1.65;
  box-shadow:0 4px 12px rgba(0,0,0,0.2);
`;
const SignalStrip = styled.div`display:flex;gap:0.5rem;flex-wrap:wrap;`;
const SignalChip = styled.div<{$t:string}>`
  display:flex;align-items:center;gap:0.35rem;padding:0.3rem 0.65rem;border-radius:999px;
  border:1px solid ${p=>p.$t}35;background:${p=>p.$t}0e;font-family:${T.mono};font-size:0.69rem;
`;
const SChipLabel = styled.span`color:${T.inkFaint};font-size:0.62rem;`;
const SChipVal = styled.span<{$t:string}>`color:${p=>p.$t};font-weight:600;`;
const SmartLegend = styled.div`display:flex;gap:0.8rem;flex-wrap:wrap;padding:0 0.2rem;`;
const SmartLI = styled.div`display:inline-flex;align-items:center;gap:0.35rem;font-size:0.68rem;color:${T.inkLight};font-family:${T.mono};`;
const StatsRow = styled.div`display:flex;gap:0.625rem;flex-wrap:wrap;`;
const StatChip = styled.div`flex:1;min-width:90px;background:${T.creamDark};border:1px solid ${T.rule};border-radius:${T.radius};padding:0.7rem 0.875rem;`;
const StatLabel = styled.div`font-size:0.63rem;font-weight:600;color:${T.inkFaint};letter-spacing:0.07em;text-transform:uppercase;font-family:${T.mono};margin-bottom:0.25rem;`;
const StatVal = styled.div<{$c?:string}>`font-family:${T.mono};font-size:1rem;font-weight:500;color:${p=>p.$c??T.ink};`;
const InsightGrid = styled.div`
  display:grid;grid-template-columns:minmax(0,1.1fr) minmax(260px,0.9fr);gap:0.875rem;
  @media(max-width:980px){grid-template-columns:1fr;}
`;
const ScenarioCard2 = styled.div`
  display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:0.7rem;
  padding:0.75rem 0.8rem;background:${T.cream};border:1px solid ${T.ruleMid};border-radius:${T.radiusSm};
`;
const ForecastChartBox = styled.div`
  background:linear-gradient(180deg,#fff,${T.cream});border:1px solid ${T.ruleMid};
  border-radius:${T.radiusSm};padding:0.6rem 0.7rem 0.4rem;
`;
const ForecastLegend = styled.div`display:flex;gap:0.8rem;flex-wrap:wrap;margin-top:0.45rem;`;
const ForecastLI = styled.div`display:inline-flex;align-items:center;gap:0.35rem;font-size:0.68rem;color:${T.inkLight};font-family:${T.mono};`;

// ─── Rankings components ──────────────────────────────────────────────────────
const RankPage = styled.div`
  padding:1.25rem 1.75rem;display:flex;flex-direction:column;gap:1.25rem;flex:1;overflow-y:auto;
`;
const RankPageHead = styled.div`
  display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;
`;
const RankControls = styled.div`display:flex;gap:0.4rem;flex-wrap:wrap;`;
const TopPickBanner = styled.div<{$color:string}>`
  background:#fff;border:1px solid ${p=>p.$color}40;border-left:4px solid ${p=>p.$color};
  border-radius:${T.radius};padding:1.25rem 1.5rem;box-shadow:${T.shadow};
  display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;
`;
const TopPickLeft = styled.div`display:flex;flex-direction:column;gap:0.2rem;flex:1;min-width:200px;`;
const TopPickBadge = styled.div`
  font-family:${T.mono};font-size:0.62rem;font-weight:700;letter-spacing:0.08em;
  text-transform:uppercase;color:${T.amber};margin-bottom:0.1rem;
`;
const TopPickSymbol = styled.div<{$c:string}>`
  font-family:${T.mono};font-size:1.6rem;font-weight:600;color:${p=>p.$c};line-height:1.1;
`;
const TopPickName = styled.div`font-size:0.82rem;color:${T.inkLight};`;
const TopPickRight = styled.div`display:flex;flex-direction:column;gap:0.5rem;flex:2;min-width:240px;`;
const TopPickSignals = styled.div`display:flex;flex-wrap:wrap;gap:0.4rem;`;
const SignalTag = styled.div<{$pos:boolean}>`
  padding:0.22rem 0.55rem;border-radius:999px;font-family:${T.mono};font-size:0.68rem;font-weight:500;
  border:1px solid ${p=>p.$pos?T.green:T.red}35;
  background:${p=>p.$pos?T.greenBg:T.redBg};
  color:${p=>p.$pos?T.green:T.red};
`;
const TopPickScore = styled.div<{$c:string}>`
  font-family:${T.mono};font-size:2rem;font-weight:600;color:${p=>p.$c};line-height:1;
`;
const TopPickScoreLabel = styled.div`font-size:0.68rem;color:${T.inkFaint};font-family:${T.mono};`;
const RankList = styled.div`display:flex;flex-direction:column;gap:0.5rem;`;
const RankRow = styled.div<{$color:string;$top:boolean}>`
  display:grid;grid-template-columns:28px 56px 1fr auto auto;align-items:center;gap:0.75rem;
  padding:0.65rem 0.875rem;border-radius:${T.radius};
  background:${p=>p.$top?p.$color+'0d':'#fff'};
  border:1px solid ${p=>p.$top?p.$color+'40':T.rule};
  cursor:pointer;transition:background 0.12s;
  &:hover{background:${p=>p.$color}12;}
`;
const RankNum = styled.div`font-family:${T.mono};font-size:0.85rem;font-weight:600;color:${T.inkFaint};text-align:right;`;
const RankSym = styled.div<{$c:string}>`font-family:${T.mono};font-size:0.88rem;font-weight:600;color:${p=>p.$c};`;
const RankSignalsInline = styled.div`display:flex;flex-wrap:wrap;gap:0.3rem;`;
const RankRet = styled.div<{$pos:boolean}>`font-family:${T.mono};font-size:0.82rem;color:${p=>p.$pos?T.green:T.red};white-space:nowrap;`;
const RankScoreBar = styled.div`display:flex;align-items:center;gap:0.4rem;`;
const ScoreBarTrack = styled.div`width:52px;height:6px;background:${T.creamDeep};border-radius:999px;overflow:hidden;`;
const ScoreBarFill = styled.div<{$pct:number;$c:string}>`width:${p=>p.$pct}%;height:100%;background:${p=>p.$c};border-radius:999px;`;
const ScoreNum = styled.div<{$c:string}>`font-family:${T.mono};font-size:0.75rem;color:${p=>p.$c};font-weight:600;min-width:24px;text-align:right;`;
const RankLoadingGrid = styled.div`
  display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:0.5rem;
`;
const RankLoadingTile = styled.div`
  height:48px;background:${T.creamDark};border:1px solid ${T.rule};border-radius:${T.radiusSm};
  display:flex;align-items:center;justify-content:center;gap:0.5rem;font-family:${T.mono};
  font-size:0.7rem;color:${T.inkFaint};
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
interface DataPoint { timestamp: number; date: string; close: number; }
interface Metrics { initialValue:number;finalValue:number;totalReturn:number;cagr:number;maxDrawdown:number;volatility:number;shares:number; }

const STOCKS = [
  { symbol:'SPY',   name:'S&P 500 ETF',      color:'#2563eb', mcap:600  },
  { symbol:'QQQ',   name:'NASDAQ 100',        color:'#7c3aed', mcap:400  },
  { symbol:'AAPL',  name:'Apple',             color:'#374151', mcap:3000 },
  { symbol:'MSFT',  name:'Microsoft',         color:'#0078d4', mcap:3000 },
  { symbol:'NVDA',  name:'NVIDIA',            color:'#76b900', mcap:2500 },
  { symbol:'GOOGL', name:'Alphabet',          color:'#ea4335', mcap:2000 },
  { symbol:'AMZN',  name:'Amazon',            color:'#e67e22', mcap:2000 },
  { symbol:'META',  name:'Meta',              color:'#1877f2', mcap:1500 },
  { symbol:'TSLA',  name:'Tesla',             color:'#cc0000', mcap:800  },
  { symbol:'BRK-B', name:'Berkshire B',       color:'#5a3820', mcap:900  },
  { symbol:'JPM',   name:'JPMorgan',          color:'#0069aa', mcap:700  },
  { symbol:'WMT',   name:'Walmart',           color:'#0071ce', mcap:700  },
  { symbol:'V',     name:'Visa',              color:'#1a1f71', mcap:550  },
  { symbol:'UNH',   name:'UnitedHealth',      color:'#005eb8', mcap:450  },
  { symbol:'XOM',   name:'Exxon Mobil',       color:'#d62828', mcap:450  },
  { symbol:'NFLX',  name:'Netflix',           color:'#e50914', mcap:350  },
  { symbol:'CVX',   name:'Chevron',           color:'#1d4ed8', mcap:270  },
  { symbol:'DIS',   name:'Disney',            color:'#006e99', mcap:190  },
  { symbol:'CAT',   name:'Caterpillar',       color:'#f2c300', mcap:180  },
  { symbol:'PFE',   name:'Pfizer',            color:'#0093d0', mcap:160  },
  { symbol:'COP',   name:'ConocoPhillips',    color:'#9a3412', mcap:130  },
  { symbol:'SLB',   name:'Schlumberger',      color:'#0f766e', mcap:70   },
  { symbol:'OXY',   name:'Occidental',        color:'#7c2d12', mcap:50   },
  { symbol:'XLE',   name:'Energy Select ETF', color:'#14532d', mcap:40   },
];

const RANGES = [
  {label:'1M',value:'1mo'},{label:'3M',value:'3mo'},{label:'6M',value:'6mo'},
  {label:'1Y',value:'1y'},{label:'3Y',value:'3y'},{label:'5Y',value:'5y'},
];

const TILE_EVENTS: Record<string,string[]> = {
  XLE:['OIL SHOCK'],XOM:['OIL SHOCK'],CVX:['OIL SHOCK'],COP:['OIL SHOCK'],OXY:['OIL SHOCK'],
  NVDA:['AI BOOM'],MSFT:['AI BOOM'],META:['AI BOOM'],
  AMZN:['COVID'],NFLX:['COVID'],PFE:['COVID'],
  SPY:['BENCHMARK'],QQQ:['BENCHMARK'],
};

const CHART_EVENTS = [
  { symbols:['NVDA','MSFT','META','QQQ','AAPL','GOOGL'], date:'2022-11-30', label:'ChatGPT' },
  { symbols:['AMZN','NFLX','PFE','SPY','QQQ'],           date:'2020-03-11', label:'COVID-19' },
  { symbols:['XLE','XOM','CVX','COP','OXY'],             date:'2022-02-24', label:'Russia/Ukraine' },
  { symbols:['XLE','XOM','CVX','COP','OXY','SLB'],       date:'2025-04-01', label:'Iran/Hormuz' },
  { symbols:['SPY','QQQ','MSFT','AAPL','NFLX','META'],   date:'2022-01-03', label:'Fed Hike Cycle' },
];

const BUNDLES = [
  { label:'AI Leaders',    symbols:['NVDA','MSFT','META','QQQ']  },
  { label:'Oil Majors',    symbols:['XOM','CVX','COP','XLE']     },
  { label:'COVID Winners', symbols:['AMZN','NFLX','PFE','SPY']   },
  { label:'Big Tech',      symbols:['AAPL','MSFT','GOOGL','AMZN']},
];

const SCENARIOS = [
  {
    id:'ai-boom',title:'AI Adoption Wave',period:'2023 – 2025',
    compareSymbols:['NVDA','MSFT','META','QQQ'],compareRange:'3y',
    trigger:'ChatGPT\'s release in late 2022 ignited mainstream awareness of large language models. NVIDIA\'s GPU monopoly on AI training made it the primary beneficiary. The buildout of AI infrastructure lifted hyperscalers and foundation model companies across the board.',
    lesson:'Enabling technology captures the largest gains. NVIDIA provided the "picks and shovels" for the AI gold rush — outperforming the stocks it enabled by 4× or more.',
    winners:[{s:'NVDA',pct:800},{s:'META',pct:200},{s:'MSFT',pct:100}],
    losers:[],
  },
  {
    id:'oil-shock',title:'Oil Shock — Iran / Hormuz Strait',period:'2025 YTD',
    compareSymbols:['XOM','CVX','COP','XLE'],compareRange:'1mo',
    trigger:'Escalating US-Iran tensions and the closure of the Strait of Hormuz — through which ~20% of global oil ships transit — caused crude to surge. Upstream producers benefit directly; fuel-intensive industries absorb the margin hit.',
    lesson:'Geopolitical supply shocks move the fastest. Energy stocks can gain 20–30% in days while airlines and consumer goods absorb margin compression. Oil price is a proxy for these upstream equities.',
    winners:[{s:'XOM',pct:100},{s:'CVX',pct:85},{s:'COP',pct:70},{s:'XLE',pct:65}],
    losers:[],
  },
  {
    id:'covid',title:'COVID Crash & Recovery',period:'2020 – 2021',
    compareSymbols:['AMZN','NFLX','PFE','SPY'],compareRange:'2y',
    trigger:'Global pandemic lockdowns in March 2020 crashed markets in weeks — then turbocharged digital consumption. E-commerce, streaming, and biotech surged through 2021. Investors who identified "stay-at-home" beneficiaries early captured 5–10× the index return.',
    lesson:'Crisis events create massive sector rotation. The key insight: which existing trends does this crisis accelerate? COVID accelerated e-commerce by years and made vaccine developers essential overnight.',
    winners:[{s:'AMZN',pct:90},{s:'NFLX',pct:65},{s:'PFE',pct:40}],
    losers:[{s:'XLE',pct:-40}],
  },
  {
    id:'rate-hike',title:'Fed Rate Hike Shock',period:'2022',
    compareSymbols:['QQQ','JPM','NFLX','SPY'],compareRange:'1y',
    trigger:'The Federal Reserve raised rates from 0.25% to 4.5% in 2022 — the fastest hiking cycle in 40 years — to combat 9% inflation. Growth stocks with high P/E ratios collapsed as future cash flows were discounted more aggressively.',
    lesson:'Interest rates are the gravity of financial markets. High-growth tech stocks are longest-duration assets — most sensitive to rate changes. When rates rise sharply, rotate toward value stocks and financials.',
    winners:[{s:'JPM',pct:5},{s:'V',pct:-3}],
    losers:[{s:'QQQ',pct:-35},{s:'NFLX',pct:-70},{s:'META',pct:-65}],
  },
  {
    id:'vs-spy',title:'Best Stocks vs. the Index',period:'5-Year Comparison',
    compareSymbols:['NVDA','MSFT','META','SPY'],compareRange:'5y',
    trigger:'The S&P 500 (SPY) returns ~10% annually on average — but the best individual stocks within it far exceed this. Understanding which stocks outperform and why separates active investing from passive index ownership.',
    lesson:'NVIDIA returned 40× the S&P 500 over 5 years. The question is always: can you identify the next NVIDIA early? Sector catalysts, earnings acceleration, and technical breakouts are three signals worth watching.',
    winners:[{s:'NVDA',pct:2000},{s:'META',pct:400},{s:'MSFT',pct:200}],
    losers:[{s:'PFE',pct:-30},{s:'DIS',pct:-20}],
  },
  {
    id:'reopening',title:'Post-COVID Reopening Rotation',period:'2021',
    compareSymbols:['DIS','XLE','NFLX','SPY'],compareRange:'1y',
    trigger:'As vaccines rolled out in 2021, the trade reversed — travel, entertainment, and physical retail surged while pandemic-era winners stagnated. Capital rotated from "stay-at-home" into "get-out" stocks rapidly.',
    lesson:'Sector rotation is as important as stock selection. The same catalyst that lifts some sectors devastates others. Tracking where capital flows — out of COVID winners into reopening plays — is as valuable as picking individual names.',
    winners:[{s:'DIS',pct:25},{s:'XLE',pct:55}],
    losers:[{s:'NFLX',pct:-25},{s:'PFE',pct:-15}],
  },
];

const CUSTOM_COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6','#06b6d4'];

// ─── Utilities ────────────────────────────────────────────────────────────────
function clamp(n:number,min:number,max:number){return Math.min(max,Math.max(min,n));}
function fmt$(n:number):string{
  if(n>=1_000_000)return`$${(n/1_000_000).toFixed(2)}M`;
  if(n>=1_000)return`$${(n/1_000).toFixed(1)}K`;
  return`$${n.toFixed(2)}`;
}
function fmtPct(n:number,plus=true):string{return`${plus&&n>0?'+':''}${n.toFixed(1)}%`;}

function computeSMA(prices:number[],w:number):(number|null)[]{
  return prices.map((_,i)=>{
    if(i<w-1)return null;
    return prices.slice(i-w+1,i+1).reduce((a,b)=>a+b,0)/w;
  });
}

function computeEMA(prices:number[],period:number):(number|null)[]{
  if(prices.length<period)return prices.map(()=>null);
  const k=2/(period+1);
  const result:(number|null)[]=Array(period-1).fill(null);
  let ema=prices.slice(0,period).reduce((a,b)=>a+b,0)/period;
  result.push(ema);
  for(let i=period;i<prices.length;i++){ema=prices[i]*k+ema*(1-k);result.push(ema);}
  return result;
}

function computeRSI(prices:number[],period=14):(number|null)[]{
  if(prices.length<period+1)return prices.map(()=>null);
  const result:(number|null)[]=Array(period).fill(null);
  let avgGain=0,avgLoss=0;
  for(let i=1;i<=period;i++){
    const d=prices[i]-prices[i-1];
    if(d>0)avgGain+=d;else avgLoss+=Math.abs(d);
  }
  avgGain/=period;avgLoss/=period;
  result.push(avgLoss===0?100:100-100/(1+avgGain/avgLoss));
  for(let i=period+1;i<prices.length;i++){
    const d=prices[i]-prices[i-1];
    const g=d>0?d:0;const l=d<0?Math.abs(d):0;
    avgGain=(avgGain*(period-1)+g)/period;
    avgLoss=(avgLoss*(period-1)+l)/period;
    result.push(avgLoss===0?100:100-100/(1+avgGain/avgLoss));
  }
  return result;
}

function computeMACD(prices:number[]):{macd:(number|null)[];signal:(number|null)[];histogram:(number|null)[]}{
  const ema12=computeEMA(prices,12);
  const ema26=computeEMA(prices,26);
  const macd:(number|null)[]=ema12.map((v,i)=>{const e=ema26[i];return v!=null&&e!=null?v-e:null;});
  const firstIdx=macd.findIndex(v=>v!==null);
  if(firstIdx===-1)return{macd,signal:macd.map(()=>null),histogram:macd.map(()=>null)};
  const macdDefined=macd.slice(firstIdx) as number[];
  const sigDefined=computeEMA(macdDefined,9);
  const signal:(number|null)[]=[...Array(firstIdx).fill(null),...sigDefined];
  const histogram:(number|null)[]=macd.map((v,i)=>{const s=signal[i];return v!=null&&s!=null?v-s:null;});
  return{macd,signal,histogram};
}

function findBuySignals(closes:number[],rsi:(number|null)[],macd:(number|null)[],signal:(number|null)[]):number[]{
  const out:number[]=[];
  for(let i=1;i<closes.length;i++){
    const r=rsi[i],pm=macd[i-1],cm=macd[i],ps=signal[i-1],cs=signal[i];
    if(r!=null&&r<40&&pm!=null&&cm!=null&&ps!=null&&cs!=null&&pm<=ps&&cm>cs)out.push(i);
  }
  return out;
}

function computeMetrics(data:DataPoint[],amount:number):Metrics{
  if(data.length<2)return{initialValue:amount,finalValue:amount,totalReturn:0,cagr:0,maxDrawdown:0,volatility:0,shares:0};
  const p0=data[0].close,pN=data[data.length-1].close;
  const shares=amount/p0,finalValue=shares*pN;
  const totalReturn=((finalValue-amount)/amount)*100;
  const years=(data[data.length-1].timestamp-data[0].timestamp)/(1000*60*60*24*365.25);
  const cagr=years>0.05?(Math.pow(finalValue/amount,1/years)-1)*100:0;
  let peak=p0,maxDrawdown=0;
  for(const d of data){if(d.close>peak)peak=d.close;const dd=((d.close-peak)/peak)*100;if(dd<maxDrawdown)maxDrawdown=dd;}
  const returns=data.slice(1).map((d,i)=>Math.log(d.close/data[i].close));
  const mean=returns.reduce((a,b)=>a+b,0)/returns.length;
  const variance=returns.reduce((a,b)=>a+(b-mean)**2,0)/returns.length;
  const volatility=Math.sqrt(variance*252)*100;
  return{initialValue:amount,finalValue,totalReturn,cagr,maxDrawdown,volatility,shares};
}

function computeTrendSignal(data:DataPoint[],sma50:(number|null)[],sma200:(number|null)[]){
  if(data.length<30)return null;
  const closes=data.map(d=>d.close);
  const current=closes[closes.length-1];
  const s50=[...sma50].reverse().find((v):v is number=>v!=null)??current;
  const s200=[...sma200].reverse().find((v):v is number=>v!=null)??s50;
  const mom20=closes.length>21?((current/closes[closes.length-21])-1)*100:0;
  const trendSpread=((s50-s200)/s200)*100;
  const support=Math.min(...closes.slice(-30));
  const resistance=Math.max(...closes.slice(-30));
  const returns=closes.slice(1).map((c,i)=>Math.log(c/closes[i]));
  const meanR=returns.reduce((a,b)=>a+b,0)/returns.length;
  const sigma=Math.sqrt(returns.reduce((a,b)=>a+(b-meanR)**2,0)/returns.length);
  const h=90;
  const drift=meanR*h,shock=sigma*Math.sqrt(h);
  const proj=(z:number)=>({
    price:current*Math.exp(drift+z*shock),
    pct:((current*Math.exp(drift+z*shock)/current)-1)*100,
  });
  return{current,support,resistance,mom20,trendSpread,s50,s200,
    trendLabel:trendSpread>4?'Uptrend':trendSpread<-3?'Downtrend':'Range-bound',
    bull:proj(1),base:proj(0),bear:proj(-1),};
}

function heatColor(ret:number):string{
  if(ret>=50)return'#14532d';if(ret>=25)return'#16a34a';if(ret>=10)return'#4ade80';
  if(ret>=3)return'#bbf7d0';if(ret>=-3)return'#d4d0c8';if(ret>=-10)return'#fca5a5';
  if(ret>=-25)return'#ef4444';return'#7f1d1d';
}
function heatFg(ret:number):string{return Math.abs(ret)>10?'#fff':'#1a1208';}

interface RankResult {
  symbol: string; score: number; ret1y: number;
  signals: {label:string;pos:boolean}[]; summary: string;
}

function scoreStock(data:DataPoint[]):Omit<RankResult,'symbol'>{
  const closes=data.map(d=>d.close);
  if(closes.length<50){
    return{score:0,ret1y:0,signals:[{label:'Insufficient data',pos:false}],summary:'Not enough history.'};
  }
  const rsiVals=computeRSI(closes,14);
  const{macd:ml,signal:sl}=computeMACD(closes);
  const sma50=computeSMA(closes,50);
  const sma200=computeSMA(closes,200);

  const lastRSI=[...rsiVals].reverse().find((v):v is number=>v!=null);
  const lm=ml[ml.length-1],pm=ml[ml.length-2],ls=sl[sl.length-1],ps=sl[sl.length-2];
  const s50=[...sma50].reverse().find((v):v is number=>v!=null);
  const s200=[...sma200].reverse().find((v):v is number=>v!=null);
  const current=closes[closes.length-1];
  const mom1m=closes.length>21?((current/closes[closes.length-21])-1)*100:0;
  const ret1y=((current/closes[0])-1)*100;

  let score=50;
  const signals:{label:string;pos:boolean}[]=[];

  // RSI
  if(lastRSI!=null){
    if(lastRSI<30){score+=22;signals.push({label:`RSI ${lastRSI.toFixed(0)} — oversold`,pos:true});}
    else if(lastRSI<42){score+=12;signals.push({label:`RSI ${lastRSI.toFixed(0)} — cooling`,pos:true});}
    else if(lastRSI>70){score-=18;signals.push({label:`RSI ${lastRSI.toFixed(0)} — overbought`,pos:false});}
    else if(lastRSI>60){score-=6;signals.push({label:`RSI ${lastRSI.toFixed(0)} — elevated`,pos:false});}
  }

  // MACD crossover
  if(lm!=null&&ls!=null&&pm!=null&&ps!=null){
    if(pm<=ps&&lm>ls){score+=22;signals.push({label:'MACD bullish cross',pos:true});}
    else if(pm>=ps&&lm<ls){score-=20;signals.push({label:'MACD bearish cross',pos:false});}
    else if(lm>ls){score+=8;signals.push({label:'MACD bullish',pos:true});}
    else{score-=8;signals.push({label:'MACD bearish',pos:false});}
  }

  // Golden / death cross
  if(s50!=null&&s200!=null){
    const spread=((s50-s200)/s200)*100;
    if(s50>s200){score+=14;signals.push({label:`Golden cross (+${spread.toFixed(1)}%)`,pos:true});}
    else{score-=14;signals.push({label:`Death cross (${spread.toFixed(1)}%)`,pos:false});}
  }

  // 1-month momentum
  if(mom1m>8){score+=12;signals.push({label:`+${mom1m.toFixed(1)}% momentum`,pos:true});}
  else if(mom1m>3){score+=6;signals.push({label:`+${mom1m.toFixed(1)}% momentum`,pos:true});}
  else if(mom1m<-8){score-=12;signals.push({label:`${mom1m.toFixed(1)}% momentum`,pos:false});}
  else if(mom1m<-3){score-=6;signals.push({label:`${mom1m.toFixed(1)}% momentum`,pos:false});}

  // 1Y return quality
  if(ret1y>30)score+=6;
  else if(ret1y<-15)score-=6;

  const s=Math.round(clamp(score,0,100));
  const topSignal=signals.filter(x=>x.pos)[0]?.label??'';
  const summary=s>=75?`Strong setup — ${topSignal}.`:s>=60?`Watchlist candidate — ${topSignal}.`:s>=45?`Mixed signals — wait for clarity.`:'Avoid for now — bearish signals dominate.';
  return{score:s,ret1y,signals,summary};
}

function scoreTone(score:number):string{
  if(score>=72)return T.green;if(score>=55)return T.accent;if(score>=40)return T.amber;return T.red;
}

// ─── Component ────────────────────────────────────────────────────────────────
type TabType='heatmap'|'compare'|'scenarios'|'deepdive'|'rankings';

export default function StockBroker(){
  const [tab,setTab]=useState<TabType>('heatmap');

  // ── Heatmap state ──
  const [heatRange,setHeatRange]=useState('1y');
  const [heatData,setHeatData]=useState<Record<string,{ret:number|null;loading:boolean}>>({});

  // ── Rankings state ──
  const [rankRange,setRankRange]=useState('1y');
  const [rankResults,setRankResults]=useState<RankResult[]>([]);
  const [rankLoading,setRankLoading]=useState(false);
  const [rankLoaded,setRankLoaded]=useState(0); // count of stocks loaded so far

  // ── Compare state ──
  const [compareSyms,setCompareSyms]=useState<string[]>(['NVDA','QQQ','SPY']);
  const [compareRange,setCompareRange]=useState('3y');
  const [compareData,setCompareData]=useState<Record<string,DataPoint[]>>({});
  const [compareLoading,setCompareLoading]=useState(false);

  // ── Deep Dive state ──
  const [symbol,setSymbol]=useState('SPY');
  const [range,setRange]=useState('1y');
  const [amountStr,setAmountStr]=useState('10000');
  const [riskPctStr,setRiskPctStr]=useState('1');
  const [data,setData]=useState<DataPoint[]>([]);
  const [benchmarkData,setBenchmarkData]=useState<DataPoint[]>([]);
  const [ddLoading,setDdLoading]=useState(false);
  const [ddError,setDdError]=useState<string|null>(null);
  const [showSMA50,setShowSMA50]=useState(true);
  const [showSMA200,setShowSMA200]=useState(false);
  const [hoverIdx,setHoverIdx]=useState<number|null>(null);
  const [customSymStr,setCustomSymStr]=useState('');
  const [customStocks,setCustomStocks]=useState<typeof STOCKS>([]);
  const chartWrapRef=useRef<HTMLDivElement>(null);

  const amount=Math.max(1,parseFloat(amountStr.replace(/[^\d.]/g,''))||0);
  const riskPct=clamp(parseFloat(riskPctStr.replace(/[^\d.]/g,''))||0,0.1,10);
  const allStocks=useMemo(()=>[...STOCKS,...customStocks],[customStocks]);
  const stock=allStocks.find(s=>s.symbol===symbol)??STOCKS[0];

  // ── Heatmap fetch ──
  useEffect(()=>{
    if(tab!=='heatmap')return;
    const init:Record<string,{ret:null;loading:true}>={};
    allStocks.forEach(s=>{init[s.symbol]={ret:null,loading:true};});
    setHeatData(init);
    allStocks.forEach(s=>{
      fetch(`/api/stock?symbol=${encodeURIComponent(s.symbol)}&range=${heatRange}`)
        .then(r=>r.json())
        .then(json=>{
          const chart=json?.chart?.result?.[0];
          if(!chart)throw new Error('no data');
          const closes:number[]=chart.indicators?.quote?.[0]?.close??[];
          const valid=closes.filter((c:number)=>c!=null&&!isNaN(c));
          if(valid.length<2)throw new Error('insufficient');
          const ret=((valid[valid.length-1]/valid[0])-1)*100;
          setHeatData(prev=>({...prev,[s.symbol]:{ret,loading:false}}));
        })
        .catch(()=>setHeatData(prev=>({...prev,[s.symbol]:{ret:null,loading:false}})));
    });
  },[tab,heatRange,allStocks.length]);// eslint-disable-line

  // ── Rankings fetch ──
  useEffect(()=>{
    if(tab!=='rankings')return;
    setRankLoading(true);setRankResults([]);setRankLoaded(0);
    let completed=0;
    const pending:RankResult[]=[];
    allStocks.forEach(s=>{
      fetch(`/api/stock?symbol=${encodeURIComponent(s.symbol)}&range=${rankRange}`)
        .then(r=>r.json())
        .then(json=>{
          const chart=json?.chart?.result?.[0];
          if(chart){
            const ts:number[]=chart.timestamp??[];
            const cl:number[]=chart.indicators?.quote?.[0]?.close??[];
            const pts=ts.map((t:number,i:number)=>({timestamp:t*1000,date:new Date(t*1000).toISOString().slice(0,10),close:cl[i]}))
              .filter((p:DataPoint)=>p.close!=null&&!isNaN(p.close));
            if(pts.length>=50){
              const result=scoreStock(pts);
              pending.push({symbol:s.symbol,...result});
            }
          }
        })
        .catch(()=>{/* skip */})
        .finally(()=>{
          completed++;
          setRankLoaded(completed);
          if(completed===allStocks.length){
            pending.sort((a,b)=>b.score-a.score);
            setRankResults([...pending]);
            setRankLoading(false);
          }
        });
    });
  },[tab,rankRange,allStocks.length]);// eslint-disable-line

  // ── Compare fetch ──
  useEffect(()=>{
    if(tab!=='compare'||!compareSyms.length)return;
    setCompareLoading(true);
    Promise.allSettled(
      compareSyms.map(sym=>
        fetch(`/api/stock?symbol=${encodeURIComponent(sym)}&range=${compareRange}`)
          .then(r=>r.json())
          .then(json=>{
            const chart=json?.chart?.result?.[0];
            if(!chart)return{sym,pts:[] as DataPoint[]};
            const ts:number[]=chart.timestamp??[];
            const closes:number[]=chart.indicators?.quote?.[0]?.close??[];
            const pts=ts.map((t:number,i:number)=>({timestamp:t*1000,date:new Date(t*1000).toISOString().slice(0,10),close:closes[i]}))
              .filter((p:DataPoint)=>p.close!=null&&!isNaN(p.close));
            return{sym,pts};
          })
      )
    ).then(results=>{
      const map:Record<string,DataPoint[]>={};
      results.forEach(r=>{if(r.status==='fulfilled'&&r.value.pts.length)map[r.value.sym]=r.value.pts;});
      setCompareData(map);setCompareLoading(false);
    });
  },[tab,compareSyms.join(','),compareRange]);// eslint-disable-line

  // ── Deep Dive fetch ──
  useEffect(()=>{
    let cancelled=false;
    setDdLoading(true);setDdError(null);setData([]);setBenchmarkData([]);setHoverIdx(null);
    const load=(sym:string)=>
      fetch(`/api/stock?symbol=${encodeURIComponent(sym)}&range=${range}`)
        .then(r=>r.json())
        .then(json=>{
          const chart=json?.chart?.result?.[0];
          if(!chart)throw new Error(json?.chart?.error?.description??'No data');
          const ts:number[]=chart.timestamp??[];
          const closes:number[]=chart.indicators?.quote?.[0]?.close??[];
          return ts.map((t:number,i:number)=>({timestamp:t*1000,date:new Date(t*1000).toISOString().slice(0,10),close:closes[i]}))
            .filter((p:DataPoint)=>p.close!=null&&!isNaN(p.close));
        });
    Promise.all([load(symbol),symbol==='SPY'?Promise.resolve<DataPoint[]>([]):load('SPY')])
      .then(([pts,bench])=>{
        if(cancelled)return;
        setData(pts);setBenchmarkData(symbol==='SPY'?pts:bench);setDdLoading(false);
      })
      .catch(()=>{if(!cancelled){setDdError('Could not reach the data API.');setDdLoading(false);}});
    return()=>{cancelled=true;};
  },[symbol,range]);

  // ── Deep Dive memos ──
  const metrics=useMemo(()=>computeMetrics(data,amount),[data,amount]);
  const closes=useMemo(()=>data.map(d=>d.close),[data]);
  const sma50=useMemo(()=>computeSMA(closes,50),[closes]);
  const sma200=useMemo(()=>computeSMA(closes,200),[closes]);
  const rsiVals=useMemo(()=>computeRSI(closes,14),[closes]);
  const macdVals=useMemo(()=>computeMACD(closes),[closes]);
  const buySignals=useMemo(()=>findBuySignals(closes,rsiVals,macdVals.macd,macdVals.signal),[closes,rsiVals,macdVals]);
  const trend=useMemo(()=>computeTrendSignal(data,sma50,sma200),[data,sma50,sma200]);
  const isPos=metrics.totalReturn>=0;
  const n=data.length;

  // Signal summary
  const signalSummary=useMemo(()=>{
    const lastRSI=[...rsiVals].reverse().find((v):v is number=>v!=null);
    const {macd:ml,signal:sl}=macdVals;
    const lm=ml[ml.length-1],pm=ml[ml.length-2],ls=sl[sl.length-1],ps=sl[sl.length-2];
    const rsiStatus=lastRSI==null?'—':lastRSI<30?'Oversold':lastRSI>70?'Overbought':'Neutral';
    const rsiTone=lastRSI==null?T.inkFaint:lastRSI<30?T.green:lastRSI>70?T.red:T.amber;
    const macdStatus=(lm!=null&&ls!=null&&pm!=null&&ps!=null)
      ?(pm<=ps&&lm>ls?'Bullish cross':pm>=ps&&lm<ls?'Bearish cross':lm>ls?'Bullish':'Bearish'):'—';
    const macdTone=macdStatus.includes('Bull')?T.green:macdStatus.includes('Bear')?T.red:T.amber;
    const s50=[...sma50].reverse().find((v):v is number=>v!=null);
    const s200=[...sma200].reverse().find((v):v is number=>v!=null);
    const golden=(s50!=null&&s200!=null)?(s50>s200?'Golden cross':'Death cross'):'—';
    const goldenTone=golden==='Golden cross'?T.green:golden==='Death cross'?T.red:T.amber;
    const combined=(rsiStatus==='Oversold'||rsiStatus==='Neutral')&&macdStatus.includes('Bull')&&golden==='Golden cross'
      ?'Watch for entry':rsiStatus==='Overbought'||macdStatus.includes('Bear')?'Avoid / wait':'Neutral';
    const combinedTone=combined==='Watch for entry'?T.green:combined==='Avoid / wait'?T.red:T.amber;
    return{lastRSI,rsiStatus,rsiTone,macdStatus,macdTone,golden,goldenTone,combined,combinedTone};
  },[rsiVals,macdVals,sma50,sma200]);

  // Chart coords
  const VW=800,VH=260,ML=58,MR=14,MT=14,MB=36,PW=VW-ML-MR,PH=VH-MT-MB;
  const minC=closes.length?Math.min(...closes)*0.97:0;
  const maxC=closes.length?Math.max(...closes)*1.03:1;
  const histShare=trend?0.78:1;
  const histPW=PW*histShare,forecastPW=PW-histPW,histEndX=ML+histPW;
  const xs=(i:number)=>ML+(i/Math.max(1,n-1))*histPW;
  const ys=(v:number)=>MT+PH-((v-minC)/(maxC-minC))*PH;
  const fxs=(step:number)=>histEndX+step*forecastPW;

  const areaPath=n>1?`M${xs(0)},${ys(data[0].close)} `+data.slice(1).map((d,i)=>`L${xs(i+1)},${ys(d.close)}`).join(' ')+` L${histEndX},${MT+PH} L${ML},${MT+PH} Z`:'';
  const linePath=n>1?`M${xs(0)},${ys(data[0].close)} `+data.slice(1).map((d,i)=>`L${xs(i+1)},${ys(d.close)}`).join(' '):'';

  const buildSMAPath=(vals:(number|null)[])=>{let d='';for(let i=0;i<vals.length;i++){const v=vals[i];if(v==null)continue;d+=d?` L${xs(i)},${ys(v)}`:`M${xs(i)},${ys(v)}`;}return d;};

  // Forecast fan paths (90-day rolling)
  const forecastPaths=useMemo(()=>{
    if(!trend||!n)return null;
    const pts=(p:number)=>[0,0.25,0.5,0.75,1].map((s,j)=>({s,price:trend.current+(p-trend.current)*s}));
    const path=(pts:{s:number;price:number}[])=>pts.map((p,i)=>`${i===0?'M':'L'}${fxs(p.s)},${ys(p.price)}`).join(' ');
    const bullPts=pts(trend.bull.price);
    const bearPts=pts(trend.bear.price);
    return{
      base:path(pts(trend.base.price)),
      bull:path(bullPts),
      bear:path(bearPts),
      area:`M${fxs(0)},${ys(trend.bull.price)} `+bullPts.slice(1).map(p=>`L${fxs(p.s)},${ys(p.price)}`).join(' ')+' '+[...bearPts].reverse().map(p=>`L${fxs(p.s)},${ys(p.price)}`).join(' ')+' Z',
    };
  },[trend,n,ys,fxs]);// eslint-disable-line

  // Chart event markers
  const chartEventMarkers=useMemo(()=>{
    if(!n)return[];
    const evts=CHART_EVENTS.filter(e=>e.symbols.includes(symbol));
    return evts.flatMap(evt=>{
      const idx=data.findIndex(d=>d.date>=evt.date);
      if(idx<0||idx>=n)return[];
      return[{x:xs(idx),label:evt.label}];
    });
  },[symbol,data,n]);// eslint-disable-line

  // X/Y axis labels
  const xLabels=n>0?[0,0.25,0.5,0.75,1].map(f=>{const i=Math.min(n-1,Math.round(f*(n-1)));return{x:xs(i),label:data[i].date.slice(0,7)};}).concat(trend?[{x:fxs(1),label:'90D proj'}]:[]):[];
  const yTicks=[1,0.75,0.5,0.25,0].map(f=>{const v=minC+f*(maxC-minC);return{y:ys(v),label:v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`};});

  // Tooltip
  const tooltipPos=useMemo(()=>{
    if(hoverIdx==null||!data[hoverIdx]||!chartWrapRef.current)return null;
    const cRect=chartWrapRef.current.getBoundingClientRect();
    const svgEl=chartWrapRef.current.querySelector('svg');
    if(!svgEl)return null;
    const sRect=svgEl.getBoundingClientRect();
    return{left:(sRect.left-cRect.left)+xs(hoverIdx)*(sRect.width/VW),top:(sRect.top-cRect.top)+ys(data[hoverIdx].close)*(sRect.height/VH)};
  },[hoverIdx,data]);// eslint-disable-line

  const hoverShares=n>0?amount/data[0].close:0;

  // RSI/MACD SVG coords (same VW, same ML/MR)
  const RH=80;
  const rsiY=(v:number)=>4+RH-8-((v/100)*(RH-12));
  const buildRSIPath=()=>{let d='';for(let i=0;i<rsiVals.length;i++){const v=rsiVals[i];if(v==null)continue;d+=d?` L${xs(i)},${rsiY(v)}`:`M${xs(i)},${rsiY(v)}`;}return d;};

  const {macd:macdLine,signal:sigLine,histogram}=macdVals;
  const histNonNull=histogram.filter((v):v is number=>v!=null);
  const macdMin=histNonNull.length?Math.min(...histNonNull):0;
  const macdMax=histNonNull.length?Math.max(...histNonNull):0;
  const macdRange=Math.max(Math.abs(macdMin),Math.abs(macdMax),0.001);
  const MH=80;
  const mY=(v:number)=>4+(MH-8)/2-(v/macdRange)*((MH-8)/2);
  const mZero=4+(MH-8)/2;
  const buildMACDPath=(vals:(number|null)[])=>{let d='';for(let i=0;i<vals.length;i++){const v=vals[i];if(v==null)continue;d+=d?` L${xs(i)},${mY(v)}`:`M${xs(i)},${mY(v)}`;}return d;};

  // Compare chart
  const compareSeries=useMemo(()=>{
    return compareSyms.map(sym=>{
      const pts=compareData[sym];
      if(!pts||!pts.length)return{sym,norm:[]};
      const base=pts[0].close;
      const norm=pts.map((p,i)=>({i,v:(p.close/base)*100}));
      return{sym,norm,last:norm[norm.length-1]?.v??100};
    });
  },[compareSyms,compareData]);

  const compareMinMax=useMemo(()=>{
    const all=compareSeries.flatMap(s=>s.norm.map(p=>p.v));
    if(!all.length)return{min:80,max:120};
    return{min:Math.min(...all)*0.97,max:Math.max(...all)*1.03};
  },[compareSeries]);

  const CVW=800,CVH=220,CML=50,CMR=14,CMT=12,CMB=32,CPW=CVW-CML-CMR,CPH=CVH-CMT-CMB;
  const cxs=(i:number,len:number)=>CML+(i/Math.max(1,len-1))*CPW;
  const cys=(v:number)=>CMT+CPH-((v-compareMinMax.min)/(compareMinMax.max-compareMinMax.min))*CPH;

  // Position plan
  const positionPlan=useMemo(()=>{
    if(!trend)return null;
    const stop=trend.current*0.97;
    const riskBudget=amount*(riskPct/100);
    const stopGap=Math.max(trend.current-stop,0.01);
    const byRisk=Math.floor(riskBudget/stopGap);
    const byCash=Math.floor(amount/trend.current);
    const shares=Math.max(0,Math.min(byRisk,byCash));
    return{riskBudget,shares,capitalUsed:shares*trend.current,downsideRisk:shares*stopGap,
      firstTarget:shares*trend.bull.price*0.7,stop};
  },[trend,amount,riskPct]);

  // Benchmark context
  const benchCtx=useMemo(()=>{
    if(!data.length||!benchmarkData.length)return null;
    const sRet=((data[data.length-1].close/data[0].close)-1)*100;
    const bRet=((benchmarkData[benchmarkData.length-1].close/benchmarkData[0].close)-1)*100;
    const alpha=sRet-bRet;
    const label=alpha>8?'Strong alpha':alpha>2?'Beating SPY':alpha<-8?'Lagging badly':alpha<-2?'Below SPY':'Near index';
    return{sRet,bRet,alpha,label};
  },[data,benchmarkData]);

  // Custom ticker add
  const handleAddCustom=()=>{
    const sym=customSymStr.trim().toUpperCase();
    if(!sym||allStocks.find(s=>s.symbol===sym))return;
    const color=CUSTOM_COLORS[customStocks.length%CUSTOM_COLORS.length];
    setCustomStocks(prev=>[...prev,{symbol:sym,name:sym,color,mcap:50}]);
    setCustomSymStr('');
    setTab('deepdive');
    setSymbol(sym);
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return(
    <Root>
      <GlobalStyle/>
      <Header>
        <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
          <BarChart2 size={19} color={T.accent}/>
          <Title>Stock Market Simulator</Title>
        </div>
        <Badge>LIVE DATA</Badge>
      </Header>

      <TabRow>
        <TabBtn $a={tab==='heatmap'} onClick={()=>setTab('heatmap')}>
          <Layers size={14}/> Heatmap
        </TabBtn>
        <TabBtn $a={tab==='compare'} onClick={()=>setTab('compare')}>
          <TrendingUp size={14}/> Compare
        </TabBtn>
        <TabBtn $a={tab==='scenarios'} onClick={()=>setTab('scenarios')}>
          <BookOpen size={14}/> Scenarios
        </TabBtn>
        <TabBtn $a={tab==='deepdive'} onClick={()=>setTab('deepdive')}>
          <Zap size={14}/> Deep Dive
        </TabBtn>
        <TabBtn $a={tab==='rankings'} onClick={()=>setTab('rankings')}>
          <Award size={14}/> Rankings
        </TabBtn>
      </TabRow>

      {/* ─── HEATMAP ─── */}
      {tab==='heatmap'&&(
        <HeatPage>
          <HeatControls>
            <div>
              <div style={{fontFamily:T.serif,fontSize:'1.05rem',color:T.ink}}>Market Heatmap</div>
              <div style={{fontSize:'0.75rem',color:T.inkLight,marginTop:'0.1rem'}}>
                Tile size ≈ market cap. Click any tile to deep dive.
              </div>
            </div>
            <PillGrid>
              {RANGES.map(r=>(
                <PillBtn key={r.value} $a={heatRange===r.value} onClick={()=>setHeatRange(r.value)}>
                  {r.label}
                </PillBtn>
              ))}
            </PillGrid>
          </HeatControls>

          <HeatMapWrap>
            {allStocks.map(s=>{
              const d=heatData[s.symbol];
              const ret=d?.ret??null;
              const loading=d?.loading??true;
              const bg=ret!=null?heatColor(ret):T.creamDeep;
              const fg=ret!=null?heatFg(ret):T.inkLight;
              const events=TILE_EVENTS[s.symbol]??[];
              return(
                <HeatTile key={s.symbol} $bg={bg} $fg={fg} $flex={s.mcap}
                  onClick={()=>{setTab('deepdive');setSymbol(s.symbol);}}>
                  <div>
                    <TileSymbol>{s.symbol}</TileSymbol>
                    <TileName>{s.name}</TileName>
                  </div>
                  {loading?(
                    <TileLoader/>
                  ):(
                    <div>
                      <TileRet>{ret!=null?fmtPct(ret):'—'}</TileRet>
                      {events.length>0&&(
                        <TileEventsRow>
                          {events.map(e=><EventBadge key={e}>{e}</EventBadge>)}
                        </TileEventsRow>
                      )}
                    </div>
                  )}
                </HeatTile>
              );
            })}
          </HeatMapWrap>

          <Disclaimer>
            <Info size={13} style={{flexShrink:0,marginTop:'1px'}}/>
            Historical data via Yahoo Finance. Tile size represents approximate market capitalization (as of early 2025), not current. For educational purposes only.
          </Disclaimer>
        </HeatPage>
      )}

      {/* ─── COMPARE ─── */}
      {tab==='compare'&&(
        <ComparePage>
          <CompareSidebar>
            <SideCard>
              <SideHead>Presets</SideHead>
              <BundleRow>
                {BUNDLES.map(b=>(
                  <BundleBtn key={b.label}
                    $a={JSON.stringify(compareSyms.slice().sort())===JSON.stringify(b.symbols.slice().sort())}
                    onClick={()=>{setCompareSyms(b.symbols);setCompareData({});}}>
                    {b.label}
                  </BundleBtn>
                ))}
              </BundleRow>
            </SideCard>

            <SideCard>
              <SideHead>Select Stocks (max 4)</SideHead>
              {allStocks.map(s=>{
                const active=compareSyms.includes(s.symbol);
                return(
                  <CheckItem key={s.symbol} $a={active} $c={s.color}
                    onClick={()=>{
                      if(active){setCompareSyms(p=>p.filter(x=>x!==s.symbol));}
                      else if(compareSyms.length<4){setCompareSyms(p=>[...p,s.symbol]);setCompareData({});}
                    }}>
                    <CheckDot $c={s.color} $a={active}/>
                    <span style={{fontFamily:T.mono,fontSize:'0.73rem'}}>{s.symbol}</span>
                    <span style={{fontSize:'0.68rem',opacity:0.6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
                  </CheckItem>
                );
              })}
            </SideCard>

            <SideCard>
              <SideHead>Time Range</SideHead>
              <PillGrid>
                {RANGES.map(r=>(
                  <PillBtn key={r.value} $a={compareRange===r.value}
                    onClick={()=>{setCompareRange(r.value);setCompareData({});}}>
                    {r.label}
                  </PillBtn>
                ))}
              </PillGrid>
            </SideCard>
          </CompareSidebar>

          <CompareMain>
            <div>
              <div style={{fontFamily:T.serif,fontSize:'1.05rem',color:T.ink}}>Normalized Returns</div>
              <div style={{fontSize:'0.75rem',color:T.inkLight,marginTop:'0.1rem'}}>
                All series start at 100. Higher = more return over the period.
              </div>
            </div>

            <CompareChartWrap style={{position:'relative'}}>
              {compareLoading&&(
                <LoadOverlay><Spinner/>Loading…</LoadOverlay>
              )}
              <svg viewBox={`0 0 ${CVW} ${CVH}`} preserveAspectRatio="none" style={{width:'100%',height:'220px',display:'block'}}>
                <defs>
                  <linearGradient id="cmpGrid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.ink} stopOpacity="0.04"/>
                    <stop offset="100%" stopColor={T.ink} stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {/* Grid */}
                {[0,0.25,0.5,0.75,1].map((f,i)=>{
                  const v=compareMinMax.min+f*(compareMinMax.max-compareMinMax.min);
                  const y=cys(v);
                  return<g key={i}>
                    <line x1={CML} y1={y} x2={CML+CPW} y2={y} stroke="rgba(26,18,8,0.07)" strokeWidth="1"/>
                    <text x={CML-4} y={y+3} textAnchor="end" fontSize="9" fill={T.inkFaint} fontFamily={T.mono}>{v.toFixed(0)}</text>
                  </g>;
                })}
                {/* 100 baseline */}
                <line x1={CML} y1={cys(100)} x2={CML+CPW} y2={cys(100)} stroke={T.ink} strokeWidth="1" strokeDasharray="4,4" opacity="0.3"/>
                <text x={CML-4} y={cys(100)+3} textAnchor="end" fontSize="9" fill={T.inkMid} fontFamily={T.mono}>100</text>
                {/* Series */}
                {compareSeries.map(({sym,norm})=>{
                  if(!norm.length)return null;
                  const s=allStocks.find(x=>x.symbol===sym);
                  const color=s?.color??T.accent;
                  const path=norm.map((p,i)=>`${i===0?'M':'L'}${cxs(i,norm.length)},${cys(p.v)}`).join(' ');
                  return<path key={sym} d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>;
                })}
                {/* End labels */}
                {compareSeries.map(({sym,norm,last})=>{
                  if(!norm.length||last==null)return null;
                  const s=allStocks.find(x=>x.symbol===sym);
                  const color=s?.color??T.accent;
                  const x=CML+CPW+4;const y=cys(last);
                  return<text key={sym} x={x} y={y+3} fontSize="9" fill={color} fontFamily={T.mono}>{sym}</text>;
                })}
              </svg>

              <CompareLegend>
                {compareSeries.map(({sym,norm,last})=>{
                  const s=allStocks.find(x=>x.symbol===sym);
                  const color=s?.color??T.accent;
                  const ret=last!=null?(last-100):null;
                  return(
                    <LegendItem key={sym}>
                      <div style={{width:12,height:3,background:color,borderRadius:2}}/>
                      <span style={{color}}>{sym}</span>
                      {ret!=null&&<span style={{color:ret>=0?T.green:T.red,fontWeight:600}}>{fmtPct(ret)}</span>}
                    </LegendItem>
                  );
                })}
              </CompareLegend>
            </CompareChartWrap>

            <CompareStatsRow>
              {compareSeries.map(({sym,norm,last})=>{
                const s=allStocks.find(x=>x.symbol===sym);
                const color=s?.color??T.accent;
                const ret=last!=null?(last-100):null;
                return(
                  <CompareStatCard key={sym} $c={color}>
                    <CStatSym $c={color}>{sym}</CStatSym>
                    <CStatVal $pos={(ret??0)>=0}>{ret!=null?fmtPct(ret):'—'}</CStatVal>
                    <CStatSub>{s?.name??sym} · {compareRange.toUpperCase()}</CStatSub>
                  </CompareStatCard>
                );
              })}
            </CompareStatsRow>

            <Disclaimer>
              <Info size={13} style={{flexShrink:0,marginTop:'1px'}}/>
              Normalized to 100 at the start of the selected range. Past performance does not guarantee future results.
            </Disclaimer>
          </CompareMain>
        </ComparePage>
      )}

      {/* ─── SCENARIOS ─── */}
      {tab==='scenarios'&&(
        <ScenPage>
          <div>
            <div style={{fontFamily:T.serif,fontSize:'1.2rem',color:T.ink}}>Market Scenarios</div>
            <div style={{fontSize:'0.78rem',color:T.inkLight,marginTop:'0.2rem',lineHeight:1.5}}>
              Historical events that moved markets — why they happened, who won, and what they teach.
              Click "Load in Compare" to see the real data.
            </div>
          </div>

          <ScenGrid>
            {SCENARIOS.map(sc=>(
              <ScenCard key={sc.id}>
                <ScenCardHead>
                  <ScenTitle2>{sc.title}</ScenTitle2>
                  <ScenPeriod>{sc.period}</ScenPeriod>
                </ScenCardHead>

                <ScenTrigger>{sc.trigger}</ScenTrigger>

                {sc.winners.length>0&&(
                  <ImpactSection>
                    <ImpactLabel>Winners</ImpactLabel>
                    <ImpactRow>
                      {sc.winners.map(w=>(
                        <ImpactPill key={w.s} $pos={true}>
                          <TrendingUp size={10}/>{w.s} +{w.pct>999?`${(w.pct/100).toFixed(0)}×`:w.pct+'%'}
                        </ImpactPill>
                      ))}
                    </ImpactRow>
                  </ImpactSection>
                )}

                {sc.losers.length>0&&(
                  <ImpactSection>
                    <ImpactLabel>Losers</ImpactLabel>
                    <ImpactRow>
                      {sc.losers.map(l=>(
                        <ImpactPill key={l.s} $pos={false}>
                          <TrendingDown size={10}/>{l.s} {l.pct}%
                        </ImpactPill>
                      ))}
                    </ImpactRow>
                  </ImpactSection>
                )}

                <ScenLesson>
                  <strong style={{color:T.accent,fontFamily:T.mono,fontSize:'0.68rem',letterSpacing:'0.04em'}}>LESSON · </strong>
                  {sc.lesson}
                </ScenLesson>

                <LoadInCompareBtn onClick={()=>{
                  setCompareSyms(sc.compareSymbols);
                  setCompareRange(sc.compareRange);
                  setCompareData({});
                  setTab('compare');
                }}>
                  <Layers size={12}/>Load in Compare
                </LoadInCompareBtn>
              </ScenCard>
            ))}
          </ScenGrid>
        </ScenPage>
      )}

      {/* ─── RANKINGS ─── */}
      {tab==='rankings'&&(
        <RankPage>
          <RankPageHead>
            <div>
              <div style={{fontFamily:T.serif,fontSize:'1.2rem',color:T.ink}}>Stock Rankings</div>
              <div style={{fontSize:'0.78rem',color:T.inkLight,marginTop:'0.2rem',lineHeight:1.5}}>
                Every stock scored by RSI, MACD crossover, golden cross, and momentum.
                Click any row to deep dive.
              </div>
            </div>
            <RankControls>
              {RANGES.map(r=>(
                <PillBtn key={r.value} $a={rankRange===r.value}
                  onClick={()=>{setRankRange(r.value);setRankResults([]);setRankLoaded(0);}}>
                  {r.label}
                </PillBtn>
              ))}
            </RankControls>
          </RankPageHead>

          {/* Loading progress */}
          {rankLoading&&rankLoaded<allStocks.length&&(
            <div>
              <div style={{fontSize:'0.76rem',color:T.inkLight,fontFamily:T.mono,marginBottom:'0.6rem'}}>
                Analyzing signals… {rankLoaded}/{allStocks.length} stocks
              </div>
              <RankLoadingGrid>
                {allStocks.map(s=>(
                  <RankLoadingTile key={s.symbol}>
                    {rankResults.find(r=>r.symbol===s.symbol)
                      ?<span style={{color:T.green}}>✓ {s.symbol}</span>
                      :<><Spinner style={{width:12,height:12,border:`2px solid ${T.creamDeep}`,borderTop:`2px solid ${T.accent}`} as React.CSSProperties}/>{s.symbol}</>
                    }
                  </RankLoadingTile>
                ))}
              </RankLoadingGrid>
            </div>
          )}

          {/* Top pick banner */}
          {rankResults.length>0&&(()=>{
            const top=rankResults[0];
            const st=allStocks.find(s=>s.symbol===top.symbol)!;
            const tone=scoreTone(top.score);
            return(
              <TopPickBanner $color={st.color}>
                <TopPickLeft>
                  <TopPickBadge>⭐ Top Pick · {rankRange.toUpperCase()} signals</TopPickBadge>
                  <TopPickSymbol $c={st.color}>{top.symbol}</TopPickSymbol>
                  <TopPickName>{st.name}</TopPickName>
                  <div style={{marginTop:'0.35rem',fontSize:'0.78rem',color:T.inkMid,lineHeight:1.55}}>
                    {top.summary}
                  </div>
                </TopPickLeft>
                <TopPickRight>
                  <TopPickSignals>
                    {top.signals.slice(0,5).map((sig,i)=>(
                      <SignalTag key={i} $pos={sig.pos}>{sig.label}</SignalTag>
                    ))}
                  </TopPickSignals>
                  <div style={{display:'flex',alignItems:'flex-end',gap:'0.5rem'}}>
                    <div>
                      <TopPickScore $c={tone}>{top.score}</TopPickScore>
                      <TopPickScoreLabel>/ 100 signal score</TopPickScoreLabel>
                    </div>
                    <div style={{marginBottom:'0.25rem'}}>
                      <div style={{fontFamily:T.mono,fontSize:'0.85rem',color:top.ret1y>=0?T.green:T.red}}>
                        {fmtPct(top.ret1y)} {rankRange.toUpperCase()}
                      </div>
                      <div style={{fontFamily:T.mono,fontSize:'0.65rem',color:T.inkFaint}}>period return</div>
                    </div>
                    <button
                      onClick={()=>{setSymbol(top.symbol);setTab('deepdive');}}
                      style={{marginBottom:'0.2rem',padding:'0.38rem 0.8rem',borderRadius:T.radiusSm,border:`1px solid ${st.color}60`,background:`${st.color}12`,color:st.color,fontFamily:T.mono,fontSize:'0.74rem',cursor:'pointer'}}>
                      Deep Dive →
                    </button>
                  </div>
                </TopPickRight>
              </TopPickBanner>
            );
          })()}

          {/* Full ranked list */}
          {rankResults.length>0&&(
            <RankList>
              <div style={{fontSize:'0.7rem',fontFamily:T.mono,color:T.inkFaint,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.15rem'}}>
                All {rankResults.length} stocks ranked by signal score
              </div>
              {rankResults.map((r,i)=>{
                const st=allStocks.find(s=>s.symbol===r.symbol)!;
                const tone=scoreTone(r.score);
                return(
                  <RankRow key={r.symbol} $color={st.color} $top={i<3}
                    onClick={()=>{setSymbol(r.symbol);setTab('deepdive');}}>
                    <RankNum>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}</RankNum>
                    <RankSym $c={st.color}>{r.symbol}</RankSym>
                    <RankSignalsInline>
                      {r.signals.slice(0,3).map((sig,j)=>(
                        <SignalTag key={j} $pos={sig.pos}>{sig.label}</SignalTag>
                      ))}
                    </RankSignalsInline>
                    <RankRet $pos={r.ret1y>=0}>{fmtPct(r.ret1y)}</RankRet>
                    <RankScoreBar>
                      <ScoreBarTrack>
                        <ScoreBarFill $pct={r.score} $c={tone}/>
                      </ScoreBarTrack>
                      <ScoreNum $c={tone}>{r.score}</ScoreNum>
                    </RankScoreBar>
                  </RankRow>
                );
              })}
            </RankList>
          )}

          <Disclaimer>
            <Info size={13} style={{flexShrink:0,marginTop:'1px'}}/>
            Rankings are based on technical signals only (RSI, MACD, moving average crossovers, momentum).
            They do not account for fundamentals, earnings, or macro conditions. For educational purposes only — not financial advice.
          </Disclaimer>
        </RankPage>
      )}

      {/* ─── DEEP DIVE ─── */}
      {tab==='deepdive'&&(
        <Body>
          {/* Sidebar */}
          <Sidebar>
            <SideCard>
              <SideHead>Custom Ticker</SideHead>
              <CustomRow>
                <CustomInput
                  value={customSymStr}
                  onChange={e=>setCustomSymStr(e.target.value.toUpperCase())}
                  onKeyDown={e=>{if(e.key==='Enter')handleAddCustom();}}
                  placeholder="e.g. TSM"
                  maxLength={6}
                />
                <AddBtn onClick={handleAddCustom}>Add</AddBtn>
              </CustomRow>
            </SideCard>

            <SideCard>
              <SideHead>Stock / ETF</SideHead>
              {allStocks.map(s=>(
                <StockBtn key={s.symbol} $a={symbol===s.symbol} $c={s.color}
                  onClick={()=>setSymbol(s.symbol)}>
                  <StockDot $c={s.color}/>
                  <StockSym>{s.symbol}</StockSym>
                  <StockNm>{s.name}</StockNm>
                </StockBtn>
              ))}
            </SideCard>

            <SideCard>
              <SideHead>Time Range</SideHead>
              <PillGrid>
                {RANGES.map(r=>(
                  <PillBtn key={r.value} $a={range===r.value} onClick={()=>setRange(r.value)}>
                    {r.label}
                  </PillBtn>
                ))}
              </PillGrid>
            </SideCard>

            <SideCard>
              <SideHead>Investment ($)</SideHead>
              <AmountInput value={amountStr} onChange={e=>setAmountStr(e.target.value)}
                onBlur={()=>{const v=parseFloat(amountStr.replace(/[^\d.]/g,''));if(!isNaN(v)&&v>0)setAmountStr(v.toLocaleString());}}
                placeholder="10,000"/>
            </SideCard>

            <SideCard>
              <SideHead>Risk Per Trade (%)</SideHead>
              <AmountInput value={riskPctStr} onChange={e=>setRiskPctStr(e.target.value)}
                onBlur={()=>setRiskPctStr(riskPct.toFixed(1).replace(/\.0$/,''))} placeholder="1"/>
            </SideCard>

            <SideCard>
              <SideHead>Indicators</SideHead>
              <ToggleRow onClick={()=>setShowSMA50(v=>!v)}>
                <span style={{color:T.amber}}>SMA 50</span>
                <ToggleTrack $on={showSMA50} $c={T.amber}/>
              </ToggleRow>
              <ToggleRow onClick={()=>setShowSMA200(v=>!v)}>
                <span style={{color:T.red}}>SMA 200</span>
                <ToggleTrack $on={showSMA200} $c={T.red}/>
              </ToggleRow>
            </SideCard>
          </Sidebar>

          {/* Main */}
          <MainCol>
            {/* Company row */}
            <CompanyRow>
              <CompanyLeft>
                <CompanySymbol $c={stock.color}>{stock.symbol}</CompanySymbol>
                <CompanyFull>{stock.name}</CompanyFull>
              </CompanyLeft>
              {n>0&&!ddLoading&&(
                <PriceRight>
                  <PriceVal>${data[n-1].close.toFixed(2)}</PriceVal>
                  <PriceChange $pos={isPos}>
                    {isPos?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                    {fmtPct(metrics.totalReturn)} over period
                  </PriceChange>
                </PriceRight>
              )}
            </CompanyRow>

            {/* Price chart */}
            <ChartWrap ref={chartWrapRef}>
              <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none"
                style={{width:'100%',height:'260px',display:'block'}}>
                <defs>
                  <linearGradient id={`ag-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stock.color} stopOpacity="0.2"/>
                    <stop offset="100%" stopColor={stock.color} stopOpacity="0.01"/>
                  </linearGradient>
                  <linearGradient id={`fg-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stock.color} stopOpacity="0.12"/>
                    <stop offset="100%" stopColor={stock.color} stopOpacity="0.02"/>
                  </linearGradient>
                </defs>

                {yTicks.map((t,i)=>(
                  <g key={i}>
                    <line x1={ML} y1={t.y} x2={ML+PW} y2={t.y} stroke="rgba(26,18,8,0.07)" strokeWidth="1"/>
                    <text x={ML-5} y={t.y+3.5} textAnchor="end" fontSize="9" fill={T.inkFaint} fontFamily={T.mono}>{t.label}</text>
                  </g>
                ))}
                {xLabels.map((l,i)=>(
                  <text key={i} x={l.x} y={MT+PH+24} textAnchor="middle" fontSize="9" fill={T.inkFaint} fontFamily={T.mono}>{l.label}</text>
                ))}

                {/* Event markers */}
                {chartEventMarkers.map((m,i)=>(
                  <g key={i}>
                    <line x1={m.x} y1={MT} x2={m.x} y2={MT+PH} stroke={T.amber} strokeWidth="1" strokeDasharray="3,4" opacity="0.7"/>
                    <text x={m.x+4} y={MT+14} fontSize="8" fill={T.amber} fontFamily={T.mono}>{m.label}</text>
                  </g>
                ))}

                {/* Forecast divider */}
                {trend&&(
                  <>
                    <line x1={histEndX} y1={MT} x2={histEndX} y2={MT+PH} stroke={T.inkFaint} strokeWidth="1" strokeDasharray="3,5" opacity="0.7"/>
                    <text x={histEndX+6} y={MT+11} fontSize="8" fill={T.inkFaint} fontFamily={T.mono}>projected</text>
                  </>
                )}

                {/* Area + line */}
                {areaPath&&<path d={areaPath} fill={`url(#ag-${symbol})`}/>}
                {linePath&&<path d={linePath} fill="none" stroke={stock.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>}

                {/* Forecast fan */}
                {forecastPaths&&(
                  <>
                    <path d={forecastPaths.area} fill={`url(#fg-${symbol})`}/>
                    <path d={forecastPaths.bear} fill="none" stroke={T.red} strokeWidth="1.15" strokeDasharray="4,4" opacity="0.85"/>
                    <path d={forecastPaths.bull} fill="none" stroke={T.green} strokeWidth="1.15" strokeDasharray="4,4" opacity="0.85"/>
                    <path d={forecastPaths.base} fill="none" stroke={stock.color} strokeWidth="1.7" strokeDasharray="6,5" strokeLinecap="round" opacity="0.95"/>
                  </>
                )}

                {/* SMAs */}
                {showSMA50&&n>=50&&<path d={buildSMAPath(sma50)} fill="none" stroke={T.amber} strokeWidth="1.1" strokeDasharray="5,3" opacity="0.85"/>}
                {showSMA200&&n>=200&&<path d={buildSMAPath(sma200)} fill="none" stroke={T.red} strokeWidth="1.1" strokeDasharray="5,3" opacity="0.85"/>}

                {/* Buy signal triangles */}
                {buySignals.map(idx=>{
                  const bx=xs(idx),by=ys(data[idx].close);
                  return<polygon key={idx} points={`${bx},${by-16} ${bx-6},${by-6} ${bx+6},${by-6}`}
                    fill={T.green} opacity="0.85"/>;
                })}

                {/* Live dot */}
                {n>1&&<>
                  <circle cx={xs(n-1)} cy={ys(data[n-1].close)} r="4.5" fill={stock.color} stroke="#fff" strokeWidth="1.5"/>
                  <text x={xs(n-1)-6} y={ys(data[n-1].close)-10} textAnchor="end" fontSize="9" fill={stock.color} fontFamily={T.mono}>Now</text>
                </>}

                {/* Hover crosshair */}
                {hoverIdx!=null&&data[hoverIdx]&&(()=>{
                  const hx=xs(hoverIdx),hy=ys(data[hoverIdx].close);
                  return<g>
                    <line x1={hx} y1={MT} x2={hx} y2={MT+PH} stroke={T.inkFaint} strokeWidth="1" strokeDasharray="3,3"/>
                    <circle cx={hx} cy={hy} r="4" fill={stock.color} stroke="#fff" strokeWidth="1.5"/>
                  </g>;
                })()}

                <rect x={ML} y={MT} width={PW} height={PH} fill="transparent"
                  onMouseMove={e=>{
                    if(!n)return;
                    const svg=e.currentTarget.ownerSVGElement!;
                    const rect=svg.getBoundingClientRect();
                    const plotX=(e.clientX-rect.left)*(VW/rect.width)-ML;
                    setHoverIdx(Math.max(0,Math.min(n-1,Math.round((plotX/PW)*(n-1)))));
                  }}
                  onMouseLeave={()=>setHoverIdx(null)}
                  style={{cursor:'crosshair'}}/>
              </svg>

              {/* Hover tooltip */}
              {hoverIdx!=null&&data[hoverIdx]&&tooltipPos&&(
                <TooltipBox $l={tooltipPos.left} $t={tooltipPos.top}>
                  <div style={{opacity:0.7}}>{data[hoverIdx].date}</div>
                  <div>Price: <strong style={{color:stock.color}}>${data[hoverIdx].close.toFixed(2)}</strong></div>
                  <div>Portfolio: <strong style={{color:isPos?T.green:T.red}}>{fmt$(hoverShares*data[hoverIdx].close)}</strong></div>
                </TooltipBox>
              )}

              {ddLoading&&<LoadOverlay><Spinner/>Loading {symbol}…</LoadOverlay>}
              {ddError&&!ddLoading&&(
                <LoadOverlay style={{color:T.red,flexDirection:'column',gap:'0.4rem'}}>
                  <Info size={18} color={T.red}/><span>{ddError}</span>
                  <button onClick={()=>setSymbol(s=>s)} style={{padding:'0.3rem 0.75rem',borderRadius:'999px',border:`1px solid ${T.red}`,background:'transparent',color:T.red,font:`0.72rem ${T.mono}`,cursor:'pointer'}}>
                    <RefreshCw size={11} style={{marginRight:4,verticalAlign:'middle'}}/>Retry
                  </button>
                </LoadOverlay>
              )}
            </ChartWrap>

            {/* Legend */}
            {trend&&n>0&&!ddLoading&&(
              <SmartLegend>
                <SmartLI><BulletDot $c={T.green}/>Bull {fmtPct(trend.bull.pct)} (90D)</SmartLI>
                <SmartLI><BulletDot $c={stock.color}/>Base {fmtPct(trend.base.pct)} (90D)</SmartLI>
                <SmartLI><BulletDot $c={T.red}/>Bear {fmtPct(trend.bear.pct)} (90D)</SmartLI>
                {showSMA50&&<SmartLI><BulletDot $c={T.amber}/>SMA 50</SmartLI>}
                {showSMA200&&<SmartLI><BulletDot $c={T.red}/>SMA 200</SmartLI>}
                {buySignals.length>0&&<SmartLI><BulletDot $c={T.green}/>▲ Entry signal ({buySignals.length})</SmartLI>}
              </SmartLegend>
            )}

            {/* Signal strip */}
            {n>0&&!ddLoading&&(
              <SignalStrip>
                <SignalChip $t={signalSummary.rsiTone}>
                  <SChipLabel>RSI</SChipLabel>
                  <SChipVal $t={signalSummary.rsiTone}>
                    {signalSummary.lastRSI!=null?`${signalSummary.lastRSI.toFixed(0)} · `:''}
                    {signalSummary.rsiStatus}
                  </SChipVal>
                </SignalChip>
                <SignalChip $t={signalSummary.macdTone}>
                  <SChipLabel>MACD</SChipLabel>
                  <SChipVal $t={signalSummary.macdTone}>{signalSummary.macdStatus}</SChipVal>
                </SignalChip>
                <SignalChip $t={signalSummary.goldenTone}>
                  <SChipLabel>Trend</SChipLabel>
                  <SChipVal $t={signalSummary.goldenTone}>{signalSummary.golden}</SChipVal>
                </SignalChip>
                <SignalChip $t={signalSummary.combinedTone}>
                  <SChipLabel>Signal</SChipLabel>
                  <SChipVal $t={signalSummary.combinedTone}>{signalSummary.combined}</SChipVal>
                </SignalChip>
              </SignalStrip>
            )}

            {/* RSI mini-chart */}
            {n>=15&&!ddLoading&&(
              <MiniChartWrap>
                <MiniChartLabel>RSI (14) — Oversold &lt;30 · Overbought &gt;70</MiniChartLabel>
                <svg viewBox={`0 0 ${VW} ${RH}`} preserveAspectRatio="none" style={{width:'100%',height:`${RH}px`,display:'block'}}>
                  {/* Zones */}
                  <rect x={ML} y={rsiY(70)} width={histPW} height={rsiY(30)-rsiY(70)} fill={T.green} opacity="0.06"/>
                  <rect x={ML} y={rsiY(30)} width={histPW} height={RH-4-rsiY(30)} fill={T.red} opacity="0.06"/>
                  <line x1={ML} y1={rsiY(70)} x2={ML+histPW} y2={rsiY(70)} stroke={T.green} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
                  <line x1={ML} y1={rsiY(30)} x2={ML+histPW} y2={rsiY(30)} stroke={T.red} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
                  <text x={ML-4} y={rsiY(70)+3} textAnchor="end" fontSize="8" fill={T.green} fontFamily={T.mono}>70</text>
                  <text x={ML-4} y={rsiY(30)+3} textAnchor="end" fontSize="8" fill={T.red} fontFamily={T.mono}>30</text>
                  <path d={buildRSIPath()} fill="none" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </MiniChartWrap>
            )}

            {/* MACD mini-chart */}
            {n>=34&&!ddLoading&&(
              <MiniChartWrap>
                <MiniChartLabel>MACD (12,26,9) — Bullish cross = buy signal · Bearish cross = caution</MiniChartLabel>
                <svg viewBox={`0 0 ${VW} ${MH}`} preserveAspectRatio="none" style={{width:'100%',height:`${MH}px`,display:'block'}}>
                  <line x1={ML} y1={mZero} x2={ML+histPW} y2={mZero} stroke={T.inkFaint} strokeWidth="1"/>
                  {/* Histogram */}
                  {histogram.map((v,i)=>{
                    if(v==null)return null;
                    const barX=xs(i);
                    const zeroY=mZero;
                    const barY=mY(v);
                    const barH=Math.abs(barY-zeroY);
                    const barTop=Math.min(barY,zeroY);
                    return<rect key={i} x={barX-1} y={barTop} width={2} height={Math.max(1,barH)}
                      fill={v>=0?T.green:T.red} opacity="0.5"/>;
                  })}
                  <path d={buildMACDPath(macdLine)} fill="none" stroke={T.accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d={buildMACDPath(sigLine)} fill="none" stroke={T.amber} strokeWidth="1.1" strokeDasharray="4,3"/>
                  <text x={ML-4} y={mZero+3} textAnchor="end" fontSize="8" fill={T.inkFaint} fontFamily={T.mono}>0</text>
                </svg>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'0.3rem'}}>
                  <SmartLI><BulletDot $c={T.accent}/>MACD</SmartLI>
                  <SmartLI><BulletDot $c={T.amber}/>Signal</SmartLI>
                  <SmartLI><BulletDot $c={T.green}/>Hist+</SmartLI>
                  <SmartLI><BulletDot $c={T.red}/>Hist−</SmartLI>
                </div>
              </MiniChartWrap>
            )}

            {/* Stats */}
            {n>0&&!ddLoading&&(
              <StatsRow>
                {[
                  {label:'Invested',val:fmt$(metrics.initialValue),c:undefined},
                  {label:'Final Value',val:fmt$(metrics.finalValue),c:isPos?T.green:T.red},
                  {label:'Total Return',val:fmtPct(metrics.totalReturn),c:isPos?T.green:T.red},
                  {label:'CAGR',val:fmtPct(metrics.cagr),c:isPos?T.green:T.red},
                  {label:'Max Drawdown',val:fmtPct(metrics.maxDrawdown,false),c:T.red},
                  {label:'Ann. Volatility',val:`${metrics.volatility.toFixed(1)}%`,c:undefined},
                ].map(s=>(
                  <StatChip key={s.label}>
                    <StatLabel>{s.label}</StatLabel>
                    <StatVal $c={s.c}>{s.val}</StatVal>
                  </StatChip>
                ))}
              </StatsRow>
            )}

            {/* Benchmark + Capital Plan */}
            {trend&&n>0&&!ddLoading&&(
              <InsightGrid>
                {/* Benchmark */}
                <InsightCard>
                  <InsightHead>
                    <div>
                      <InsightTitle>vs. SPY benchmark</InsightTitle>
                      <InsightSub>Is picking {stock.symbol} actually better than owning the index?</InsightSub>
                    </div>
                    {benchCtx&&<SignalPill $t={benchCtx.alpha>=2?T.green:benchCtx.alpha<-2?T.red:T.amber}>{benchCtx.label??''}</SignalPill>}
                  </InsightHead>
                  <InsightBody>
                    {benchCtx&&(
                      <MiniStatGrid>
                        <MiniStat><MiniLabel>{stock.symbol} Return</MiniLabel>
                          <MiniValue $c={benchCtx.sRet>=0?T.green:T.red}>{fmtPct(benchCtx.sRet)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>SPY Return</MiniLabel>
                          <MiniValue $c={benchCtx.bRet>=0?T.green:T.red}>{fmtPct(benchCtx.bRet)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Alpha vs SPY</MiniLabel>
                          <MiniValue $c={benchCtx.alpha>=0?T.green:T.red}>{fmtPct(benchCtx.alpha)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>90D Base Case</MiniLabel>
                          <MiniValue $c={trend.base.pct>=0?T.green:T.red}>{fmtPct(trend.base.pct)}</MiniValue></MiniStat>
                      </MiniStatGrid>
                    )}
                    <BulletList>
                      {[
                        `Trend: ${trend.trendLabel} · 50/200 spread ${trend.trendSpread>=0?'+':''}${trend.trendSpread.toFixed(1)}%`,
                        `1-month momentum: ${fmtPct(trend.mom20)} · Support $${trend.support.toFixed(2)} / Resistance $${trend.resistance.toFixed(2)}`,
                        `90-day projection: Bear ${fmtPct(trend.bear.pct)} · Base ${fmtPct(trend.base.pct)} · Bull ${fmtPct(trend.bull.pct)}`,
                      ].map((line,i)=>(
                        <BulletRow key={i}>
                          <BulletDot $c={i===0?stock.color:i===1?T.accent:T.amber}/>
                          <span>{line}</span>
                        </BulletRow>
                      ))}
                    </BulletList>
                  </InsightBody>
                </InsightCard>

                {/* Capital plan */}
                <InsightCard>
                  <InsightHead>
                    <div>
                      <InsightTitle>Capital plan</InsightTitle>
                      <InsightSub>Position sizing from your ${amount.toLocaleString()} portfolio at {riskPct.toFixed(1)}% risk.</InsightSub>
                    </div>
                    <SignalPill $t={T.accent}>Sizing engine</SignalPill>
                  </InsightHead>
                  {positionPlan&&(
                    <InsightBody>
                      <MiniStatGrid>
                        <MiniStat><MiniLabel>Risk Budget</MiniLabel><MiniValue>{fmt$(positionPlan.riskBudget)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Suggested Shares</MiniLabel><MiniValue>{positionPlan.shares}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Capital Used</MiniLabel><MiniValue>{fmt$(positionPlan.capitalUsed)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Stop Loss</MiniLabel><MiniValue $c={T.red}>{fmt$(positionPlan.stop)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Max Loss</MiniLabel><MiniValue $c={T.red}>{fmt$(positionPlan.downsideRisk)}</MiniValue></MiniStat>
                        <MiniStat><MiniLabel>Bull Target</MiniLabel><MiniValue $c={T.green}>{fmt$(positionPlan.firstTarget)}</MiniValue></MiniStat>
                      </MiniStatGrid>
                      <SummaryText>
                        Stop set at -3% from current price. If you take a larger position than suggested,
                        your realized risk rises faster than the forecast confidence does.
                      </SummaryText>
                    </InsightBody>
                  )}
                </InsightCard>
              </InsightGrid>
            )}

            <Disclaimer>
              <Info size={13} style={{flexShrink:0,marginTop:'1px'}}/>
              Historical data via Yahoo Finance. RSI and MACD are technical indicators — not buy/sell advice.
              Past performance does not guarantee future results. For educational purposes only.
            </Disclaimer>
          </MainCol>
        </Body>
      )}
    </Root>
  );
}
