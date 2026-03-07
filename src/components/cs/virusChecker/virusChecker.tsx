// src/components/cs/virusChecker/virusChecker.tsx
'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  Shield, FileText, ChevronLeft, ChevronRight, Type,
  ShieldCheck, ShieldAlert, ShieldX, X, RotateCcw, Info,
} from 'lucide-react';
import {
  analyzeFile, buildHexRowsDynamic,
  type Detection, type ScanResult, type Severity, type Verdict,
  type HexRow, type EntropyBlock, type ExtractedString,
} from './virusChecker.analysis';

const HEX_ROWS_VISIBLE = 16;
type RightTab = 'threats' | 'strings' | 'hex';

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const stepIn = keyframes`
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — identical to invoiceDigitalizer.tsx
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  ink:       '#1a1208',
  inkMid:    '#3d3120',
  inkLight:  '#7a6e5f',
  inkFaint:  '#b8ad9e',
  cream:     '#faf7f2',
  creamDark: '#f0ebe1',
  creamDeep: '#e4ddd0',
  rule:      'rgba(26,18,8,0.1)',
  ruleMid:   'rgba(26,18,8,0.06)',
  accent:    '#2563eb',
  accentBg:  'rgba(37,99,235,0.07)',
  green:     '#16a34a',
  greenBg:   'rgba(22,163,74,0.08)',
  amber:     '#b45309',
  amberBg:   'rgba(180,83,9,0.08)',
  red:       '#dc2626',
  redBg:     'rgba(220,38,38,0.08)',
  serif:     `'DM Serif Display', Georgia, serif`,
  mono:      `'DM Mono', 'Fira Code', ui-monospace, monospace`,
  sans:      `'DM Sans', system-ui, sans-serif`,
  shadow:    '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  shadowLg:  '0 8px 32px rgba(26,18,8,0.12)',
  radius:    '12px',
  radiusSm:  '7px',
};

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT / SEVERITY CONFIGS
// ─────────────────────────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  malicious:  { gradient: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)', border: 'rgba(220,38,38,0.18)', iconBg: T.redBg,   iconFg: T.red,   title: '#991b1b', subtext: T.red   },
  suspicious: { gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: 'rgba(180,83,9,0.18)', iconBg: T.amberBg, iconFg: T.amber, title: '#92400e', subtext: T.amber },
  clean:      { gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: 'rgba(22,163,74,0.18)', iconBg: T.greenBg, iconFg: T.green, title: '#14532d', subtext: T.green },
};

const SEV_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: T.red,      bg: T.redBg,                       border: 'rgba(220,38,38,0.2)',  label: 'Critical' },
  high:     { color: '#c2410c',  bg: 'rgba(194,65,12,0.07)',        border: 'rgba(194,65,12,0.18)', label: 'High'     },
  medium:   { color: T.amber,    bg: T.amberBg,                     border: 'rgba(180,83,9,0.2)',   label: 'Medium'   },
  low:      { color: T.accent,   bg: T.accentBg,                    border: 'rgba(37,99,235,0.18)', label: 'Low'      },
  info:     { color: T.inkLight, bg: 'rgba(122,110,95,0.06)',        border: T.rule,                label: 'Info'     },
};

const SEV_BAR: Record<Severity, string> = {
  critical: T.red, high: '#c2410c', medium: T.amber, low: T.accent, info: T.inkFaint,
};

const CAT_LABELS: Record<Detection['category'], string> = {
  'signature': 'Known Signature', 'obfuscation': 'Code Obfuscation',
  'suspicious-string': 'Suspicious String', 'entropy': 'High-Entropy Region', 'magic-mismatch': 'File Type Mismatch',
};

const VERDICT_TITLE: Record<Verdict, string> = {
  malicious: 'Threat Detected', suspicious: 'Suspicious File', clean: 'File Appears Safe',
};
const VERDICT_REC: Record<Verdict, string> = {
  malicious:  'Do not open, run, or share this file. Delete it immediately.',
  suspicious: 'Exercise caution. Verify with a second tool before opening.',
  clean:      'No known threats found. File appears safe.',
};

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT — matches invoiceDigitalizer Root + Header exactly
// ─────────────────────────────────────────────────────────────────────────────
const Root = styled.div`
  min-height: 100%;
  background: ${T.cream};
  font-family: ${T.sans};
  color: ${T.ink};
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem);
  -webkit-font-smoothing: antialiased;
`;

const Header = styled.header`
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid ${T.ink};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-family: ${T.serif};
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 0.25rem;
  color: ${T.ink};
`;

const Subtitle = styled.p`
  font-size: 0.82rem;
  color: ${T.inkLight};
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.02em;
`;

const HeaderBadge = styled.div`
  font-family: ${T.mono};
  font-size: 0.65rem;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 0.35rem 0.7rem;
  border: 1px solid ${T.creamDeep};
  border-radius: 999px;
  background: ${T.creamDark};
  white-space: nowrap;
`;

// ─────────────────────────────────────────────────────────────────────────────
// DROP ZONE — matches invoiceDigitalizer DropZone exactly
// ─────────────────────────────────────────────────────────────────────────────
const DropZone = styled.label<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 220px;
  border: 2px dashed ${p => (p.$active ? T.accent : T.creamDeep)};
  border-radius: ${T.radius};
  background: ${p => (p.$active ? T.accentBg : T.creamDark)};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 1.5rem;
  text-align: center;

  &:hover {
    border-color: ${T.inkFaint};
    background: ${T.creamDeep};
  }
`;

const DropTitle = styled.div`font-size: 0.9rem; font-weight: 500; color: ${T.ink};`;
const DropSub   = styled.div`font-size: 0.74rem; color: ${T.inkLight}; line-height: 1.5;`;

const PillRow = styled.div`display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; margin-top: 0.75rem;`;
const Pill = styled.div`
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.22rem 0.65rem; border-radius: 999px;
  border: 1px solid ${T.creamDeep}; background: ${T.cream};
  font-family: ${T.mono}; font-size: 0.62rem; color: ${T.inkFaint};
  text-transform: uppercase; letter-spacing: 0.08em;
  &::before { content: '✓'; color: ${T.green}; font-weight: 700; font-size: 0.57rem; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCANNING
// ─────────────────────────────────────────────────────────────────────────────
const ScanWrap = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1rem; min-height: 220px; border: 1px solid ${T.rule}; border-radius: ${T.radius};
  background: white; padding: 2rem; box-shadow: ${T.shadow};
`;
const SpinRing = styled.div`animation: ${spinAnim} 1.1s linear infinite; color: ${T.accent}; display: flex;`;
const ScanTitle = styled.div`font-family: ${T.serif}; font-size: 1.4rem; font-weight: 400; letter-spacing: -0.01em; color: ${T.ink};`;
const ScanFile  = styled.div`
  font-size: 0.72rem; color: ${T.inkLight}; font-family: ${T.mono};
  background: ${T.creamDark}; border: 1px solid ${T.rule}; border-radius: ${T.radiusSm};
  padding: 0.28rem 0.65rem; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const StepList = styled.div`
  display: flex; flex-direction: column; gap: 0.3rem;
  background: ${T.creamDark}; border: 1px solid ${T.rule}; border-radius: ${T.radius};
  padding: 0.75rem 1.1rem; min-width: 240px;
`;
const Step = styled.div<{ $d: number }>`
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: ${T.inkLight};
  animation: ${stepIn} 0.3s ease ${p => p.$d}s both;
  &::before { content: '✓'; color: ${T.green}; font-weight: 700; font-size: 0.63rem; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// RESULT SECTION
// ─────────────────────────────────────────────────────────────────────────────
const Divider = styled.hr`border: none; border-top: 1px solid ${T.rule}; margin: 2rem 0;`;

const SectionTitle = styled.h2`
  font-family: ${T.serif}; font-size: 1.4rem; font-weight: 400; letter-spacing: -0.01em;
  margin: 0 0 1.25rem; color: ${T.ink}; display: flex; align-items: baseline; gap: 0.6rem;
  span { font-family: ${T.mono}; font-size: 0.7rem; color: ${T.inkFaint}; font-weight: 400; letter-spacing: 0.05em; }
`;

const ResultWrap = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;

// Verdict card — mirrors invoiceDigitalizer ReceiptCard
const VerdictCard = styled.div<{ $v: Verdict }>`
  background: white; border: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  border-radius: ${T.radius}; overflow: hidden; box-shadow: ${T.shadow};
  animation: ${fadeSlideUp} 0.3s ease both;
`;

const VerdictHeader = styled.div<{ $v: Verdict }>`
  padding: 0.9rem 1rem 0.75rem; border-bottom: 1px solid ${T.ruleMid};
  background: ${p => VERDICT_CONFIG[p.$v].gradient};
  display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; row-gap: 0.5rem;
`;

const VerdictIconBox = styled.div<{ $v: Verdict }>`
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px;
  background: ${p => VERDICT_CONFIG[p.$v].iconBg}; border: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  display: flex; align-items: center; justify-content: center; color: ${p => VERDICT_CONFIG[p.$v].iconFg};
`;

const VerdictText  = styled.div`flex: 1; min-width: 0;`;
const VerdictTitle = styled.div<{ $v: Verdict }>`font-family: ${T.serif}; font-size: 1.05rem; font-weight: 400; letter-spacing: -0.01em; color: ${p => VERDICT_CONFIG[p.$v].title};`;
const VerdictRec   = styled.div<{ $v: Verdict }>`font-size: 0.72rem; color: ${p => VERDICT_CONFIG[p.$v].subtext}; margin-top: 0.15rem; line-height: 1.5;`;

const VerdictMeta = styled.div`display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; flex-shrink: 0;`;

const FileBadge = styled.div`
  font-family: ${T.mono}; font-size: 0.62rem; color: ${T.inkFaint};
  display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end;
`;
const MagicChip = styled.span`
  background: ${T.accentBg}; border: 1px solid rgba(37,99,235,0.18); border-radius: 999px;
  padding: 0.06rem 0.45rem; font-size: 0.6rem; color: ${T.accent}; font-weight: 600; font-family: ${T.mono};
`;
const WarnChip = styled.span`
  background: ${T.amberBg}; border: 1px solid rgba(180,83,9,0.2); border-radius: 999px;
  padding: 0.06rem 0.45rem; font-size: 0.6rem; color: ${T.amber}; font-weight: 600; font-family: ${T.mono};
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT ROW: sidebar + main panel
// ─────────────────────────────────────────────────────────────────────────────
const ContentRow = styled.div`
  display: flex; gap: 0.75rem;
  @media (max-width: 860px) { flex-direction: column; }
`;

const Sidebar = styled.div`
  flex-shrink: 0; width: 220px; background: white;
  border: 1px solid ${T.rule}; border-radius: ${T.radius}; box-shadow: ${T.shadow};
  display: flex; flex-direction: column; overflow: hidden;
  @media (max-width: 860px) { width: 100%; flex-direction: row; flex-wrap: wrap; }
`;

const SideSection = styled.div`
  padding: 0.7rem 0.9rem; border-bottom: 1px solid ${T.ruleMid}; flex-shrink: 0;
  @media (max-width: 860px) { border-bottom: none; border-right: 1px solid ${T.ruleMid}; flex: 1; min-width: 130px; }
`;

const SideLabel    = styled.div`font-family: ${T.mono}; font-size: 0.57rem; font-weight: 500; color: ${T.inkFaint}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.45rem;`;
const SevRow       = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 0.18rem 0;`;
const SevLeft      = styled.div`display: flex; align-items: center; gap: 0.38rem;`;
const SevDot       = styled.div<{ $sev: Severity }>`width: 7px; height: 7px; border-radius: 50%; background: ${p => SEV_BAR[p.$sev]};`;
const SevName      = styled.span<{ $sev: Severity }>`font-size: 0.71rem; color: ${p => SEV_CONFIG[p.$sev].color};`;
const SevCount     = styled.span<{ $sev: Severity }>`font-size: 0.78rem; font-weight: 700; color: ${p => SEV_CONFIG[p.$sev].color};`;
const RatioRow     = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.28rem;`;
const RatioLabel   = styled.span`font-size: 0.69rem; color: ${T.inkLight};`;
const RatioValue   = styled.span<{ $isText: boolean }>`font-size: 0.69rem; font-weight: 600; font-family: ${T.mono}; color: ${p => (p.$isText ? T.green : T.amber)};`;
const RatioBar     = styled.div`height: 4px; border-radius: 999px; background: ${T.creamDeep}; overflow: hidden;`;
const RatioFill    = styled.div<{ $pct: number; $isText: boolean }>`height: 100%; border-radius: 999px; width: ${p => Math.min(100, Math.round(p.$pct * 100))}%; background: ${p => (p.$isText ? T.green : T.amber)};`;
const RatioNote    = styled.div`font-size: 0.6rem; color: ${T.inkFaint}; margin-top: 0.18rem; line-height: 1.5;`;
const CovItem      = styled.div`
  display: flex; align-items: center; gap: 0.38rem; font-size: 0.68rem; color: ${T.inkLight}; padding: 0.06rem 0;
  &::before { content: '✓'; color: ${T.green}; font-weight: 700; font-size: 0.58rem; flex-shrink: 0; }
`;
const SideFileName = styled.div`font-size: 0.74rem; font-weight: 500; color: ${T.ink}; word-break: break-all; font-family: ${T.mono}; line-height: 1.4;`;
const SideFileMeta = styled.div`font-size: 0.64rem; color: ${T.inkLight}; margin-top: 0.12rem;`;

const MainPanel = styled.div`
  flex: 1; min-width: 0; background: white; border: 1px solid ${T.rule};
  border-radius: ${T.radius}; box-shadow: ${T.shadow};
  display: flex; flex-direction: column; overflow: hidden; min-height: 380px;
`;

const TabBar = styled.div`
  flex-shrink: 0; padding: 0 0.9rem; border-bottom: 1px solid ${T.rule}; background: ${T.cream};
  display: flex; align-items: flex-end; gap: 0; overflow-x: auto;
  &::-webkit-scrollbar { height: 0; }
`;
const Tab = styled.button<{ $a: boolean }>`
  display: flex; align-items: center; gap: 0.3rem; padding: 0.65rem 0.85rem 0.45rem;
  border: none; border-bottom: 2px solid ${p => (p.$a ? T.ink : 'transparent')};
  background: transparent; color: ${p => (p.$a ? T.ink : T.inkLight)};
  font-size: 0.73rem; font-weight: ${p => (p.$a ? '500' : '400')};
  font-family: ${T.sans}; cursor: pointer; transition: color 0.15s; white-space: nowrap;
  &:hover { color: ${T.ink}; }
`;
const TabChip = styled.span<{ $alert?: boolean; $ok?: boolean }>`
  font-size: 0.6rem; font-weight: 700; padding: 0.06rem 0.36rem; border-radius: 999px; font-family: ${T.mono};
  background: ${p => p.$alert ? T.redBg : p.$ok ? T.greenBg : T.creamDark};
  color: ${p => p.$alert ? T.red : p.$ok ? T.green : T.inkLight};
`;
const TabContent = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;`;

const ScrollArea = styled.div`
  flex: 1; overflow-y: auto; padding: 0.6rem 0.75rem;
  display: flex; flex-direction: column; gap: 0.4rem;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${T.creamDeep}; border-radius: 2px; }
`;
const DismissBar  = styled.div`flex-shrink: 0; padding: 0.4rem 0.75rem; border-top: 1px solid ${T.rule}; background: ${T.cream}; display: flex; align-items: center; gap: 0.45rem; font-size: 0.67rem; color: ${T.inkLight};`;
const RestoreBtn  = styled.button`
  display: flex; align-items: center; gap: 0.22rem; padding: 0.22rem 0.55rem;
  border-radius: ${T.radiusSm}; border: 1px solid ${T.rule}; background: white; color: ${T.accent};
  font-size: 0.63rem; font-weight: 600; font-family: ${T.sans}; cursor: pointer; transition: all 0.15s;
  &:hover { background: ${T.accentBg}; border-color: rgba(37,99,235,0.25); }
`;

const Card = styled.div<{ $sev: Severity; $sel: boolean }>`
  display: flex; border-radius: ${T.radiusSm};
  border: 1px solid ${p => p.$sel ? SEV_CONFIG[p.$sev].border : T.rule};
  background: ${p => (p.$sel ? T.accentBg : T.creamDark)};
  box-shadow: ${p => (p.$sel ? T.shadowLg : T.shadow)};
  overflow: hidden; cursor: pointer; transition: all 0.15s;
  animation: ${fadeSlideUp} 0.25s ease both;
  &:hover { box-shadow: ${T.shadowLg}; }
`;
const CardBar  = styled.div<{ $sev: Severity }>`width: 3px; flex-shrink: 0; background: ${p => SEV_BAR[p.$sev]};`;
const CardBody = styled.div`flex: 1; padding: 0.6rem 0.75rem; min-width: 0;`;
const CardHead = styled.div`display: flex; align-items: flex-start; gap: 0.4rem; margin-bottom: 0.15rem; flex-wrap: wrap;`;
const CardName = styled.div`flex: 1; font-size: 0.75rem; font-weight: 600; color: ${T.ink}; line-height: 1.35; word-break: break-word; min-width: 100px;`;
const SevBadge = styled.span<{ $sev: Severity }>`
  flex-shrink: 0; font-size: 0.54rem; font-weight: 700; padding: 0.09rem 0.4rem;
  border-radius: 999px; text-transform: uppercase; letter-spacing: 0.07em; font-family: ${T.mono};
  background: ${p => SEV_CONFIG[p.$sev].bg}; color: ${p => SEV_CONFIG[p.$sev].color}; border: 1px solid ${p => SEV_CONFIG[p.$sev].border};
`;
const HexHint    = styled.span`flex-shrink: 0; font-size: 0.56rem; color: ${T.inkFaint}; font-family: ${T.mono}; background: ${T.cream}; border: 1px solid ${T.rule}; padding: 0.05rem 0.3rem; border-radius: 4px;`;
const DismissBtn = styled.button`
  flex-shrink: 0; width: 20px; height: 20px; border: none; background: transparent; color: ${T.inkFaint};
  cursor: pointer; border-radius: 5px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; padding: 0;
  &:hover { background: ${T.redBg}; color: ${T.red}; }
`;
const CatTag   = styled.div`font-size: 0.59rem; color: ${T.inkFaint}; margin-bottom: 0.25rem; font-weight: 500; font-family: ${T.mono}; text-transform: uppercase; letter-spacing: 0.05em;`;
const ExplText = styled.div`font-size: 0.7rem; color: ${T.inkLight}; line-height: 1.6; margin-bottom: 0.32rem;`;
const Evidence = styled.pre`
  font-size: 0.6rem; color: ${T.inkMid}; font-family: ${T.mono}; background: ${T.cream};
  border: 1px solid ${T.rule}; border-radius: ${T.radiusSm}; padding: 0.35rem 0.48rem;
  white-space: pre-wrap; word-break: break-all; margin: 0 0 0.2rem; max-height: 3.5rem; overflow: hidden;
`;
const DecodedHead = styled.div`font-size: 0.57rem; font-weight: 700; color: ${T.amber}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.1rem; font-family: ${T.mono};`;
const DecodedPre  = styled.pre`
  font-size: 0.6rem; color: ${T.amber}; font-family: ${T.mono}; background: ${T.amberBg};
  border: 1px solid rgba(180,83,9,0.18); border-radius: ${T.radiusSm}; padding: 0.35rem 0.48rem;
  white-space: pre-wrap; word-break: break-all; margin: 0; max-height: 3.5rem; overflow: hidden;
`;
const Empty = styled.div`flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; text-align: center;`;

const GLabel  = styled.div`font-size: 0.57rem; font-weight: 500; font-family: ${T.mono}; color: ${T.inkFaint}; text-transform: uppercase; letter-spacing: 0.09em; padding: 0.25rem 0.38rem 0.1rem; border-bottom: 1px solid ${T.ruleMid}; margin-bottom: 0.1rem;`;
const SRow    = styled.div<{ $f: boolean }>`display: flex; align-items: baseline; gap: 0.4rem; padding: 0.11rem 0.38rem; border-radius: 5px; margin-bottom: 0.06rem; background: ${p => (p.$f ? T.amberBg : 'transparent')}; border: 1px solid ${p => (p.$f ? 'rgba(180,83,9,0.14)' : 'transparent')}; font-size: 0.6rem; line-height: 1.55;`;
const SOffset = styled.span`color: ${T.inkFaint}; flex-shrink: 0; min-width: 50px; font-family: ${T.mono}; font-size: 0.57rem;`;
const SVal    = styled.span<{ $f: boolean }>`color: ${p => (p.$f ? T.amber : T.inkLight)}; word-break: break-all; flex: 1;`;
const SReason = styled.span`color: white; font-size: 0.54rem; flex-shrink: 0; background: ${T.amber}; border-radius: 4px; padding: 0.03rem 0.3rem; font-weight: 700;`;

const HexWrap   = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; background: ${T.cream};`;
const HexNav    = styled.div`flex-shrink: 0; padding: 0.25rem 0.65rem; display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid ${T.rule}; background: ${T.creamDark};`;
const NavBt     = styled.button<{ $dim?: boolean }>`
  padding: 0.22rem 0.55rem; border-radius: ${T.radiusSm}; border: 1px solid ${T.rule}; background: white;
  color: ${p => (p.$dim ? T.inkFaint : T.inkMid)}; font-size: 0.61rem; font-family: ${T.sans};
  cursor: ${p => (p.$dim ? 'default' : 'pointer')}; display: flex; align-items: center; gap: 0.16rem;
  transition: all 0.15s; box-shadow: ${T.shadow};
  &:hover:not([disabled]) { background: ${T.creamDark}; color: ${T.ink}; }
`;
const HexOff    = styled.span`flex: 1; text-align: center; font-size: 0.58rem; color: ${T.inkFaint}; font-family: ${T.mono};`;
const SelBar    = styled.div`flex-shrink: 0; padding: 0.22rem 0.65rem; background: ${T.accentBg}; border-bottom: 1px solid rgba(37,99,235,0.12); font-size: 0.64rem; color: ${T.accent}; display: flex; align-items: center; gap: 0.38rem;`;
const HexScroll = styled.div`
  flex: 1; overflow-y: auto; overflow-x: auto; padding: 0.22rem 0.45rem;
  &::-webkit-scrollbar { width: 3px; height: 3px; }
  &::-webkit-scrollbar-thumb { background: ${T.creamDeep}; border-radius: 2px; }
`;
const HexRw   = styled.div`display: flex; align-items: center; gap: 0.24rem; line-height: 1.7; font-size: 0.58rem; &:hover { background: ${T.creamDark}; }`;
const HexAddr = styled.span`color: ${T.inkFaint}; min-width: 46px; flex-shrink: 0; user-select: none; font-family: ${T.mono};`;
const HexBG   = styled.span`display: flex; gap: 0.14rem; font-family: ${T.mono};`;
const HexByte = styled.span<{ $c?: 'red' | 'amber' | 'blue' }>`
  color: ${p => p.$c === 'red' ? T.red : p.$c === 'amber' ? T.amber : p.$c === 'blue' ? T.accent : T.inkFaint};
  background: ${p => p.$c === 'red' ? T.redBg : p.$c === 'amber' ? T.amberBg : p.$c === 'blue' ? T.accentBg : 'transparent'};
  border-radius: 2px; padding: 0 1px; min-width: 14px; text-align: center;
`;
const AsciiG = styled.span`color: ${T.creamDeep}; padding-left: 0.28rem; border-left: 1px solid ${T.rule}; font-family: ${T.mono}; font-size: 0.55rem;`;
const AsciiC = styled.span<{ $c?: 'red' | 'amber' | 'blue' }>`color: ${p => p.$c === 'red' ? T.red : p.$c === 'amber' ? T.amber : p.$c === 'blue' ? T.accent : T.inkFaint};`;

const EntWrap   = styled.div`flex-shrink: 0; padding: 0.22rem 0.55rem 0.3rem; border-top: 1px solid ${T.rule}; background: ${T.creamDark};`;
const EntLegend = styled.div`display: flex; gap: 0.65rem; font-size: 0.57rem; color: ${T.inkFaint}; margin-bottom: 0.16rem; font-family: ${T.mono};`;
const LDot      = styled.span<{ $c: string }>`&::before { content: '●'; color: ${p => p.$c}; margin-right: 0.18rem; }`;

const ActionRow = styled.div`display: flex; gap: 0.75rem; margin-top: 1.25rem; flex-wrap: wrap;`;
const Btn = styled.button<{ $primary?: boolean }>`
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: ${p => (p.$primary ? '0.65rem 1.4rem' : '0.55rem 1.1rem')};
  border-radius: ${T.radiusSm}; font-family: ${T.sans}; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.15s;
  border: 1px solid ${p => p.$primary ? 'transparent' : T.rule};
  background: ${p => p.$primary ? T.ink : 'white'};
  color: ${p => p.$primary ? T.cream : T.inkMid};
  box-shadow: ${p => (p.$primary ? T.shadow : 'none')};
  &:hover { background: ${p => p.$primary ? T.inkMid : T.creamDark}; transform: translateY(-1px); box-shadow: ${p => (p.$primary ? T.shadowLg : T.shadow)}; }
`;

const ErrToast = styled.div`
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  background: white; border: 1px solid rgba(220,38,38,0.25); border-radius: ${T.radius};
  color: ${T.red}; padding: 0.5rem 1.1rem; font-size: 0.75rem; box-shadow: ${T.shadowLg}; z-index: 40; white-space: nowrap;
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function DetectionCard({ d, selected, onSelect, onDismiss }: {
  d: Detection; selected: boolean; onSelect: () => void; onDismiss: (e: React.MouseEvent) => void;
}) {
  return (
    <Card $sev={d.severity} $sel={selected} onClick={onSelect}>
      <CardBar $sev={d.severity} />
      <CardBody>
        <CardHead>
          <CardName>{d.name}</CardName>
          <SevBadge $sev={d.severity}>{d.severity}</SevBadge>
          <HexHint>0x{d.byteOffset.toString(16).toUpperCase().padStart(4, '0')}</HexHint>
          <DismissBtn title="Dismiss" onClick={onDismiss}><X size={10} /></DismissBtn>
        </CardHead>
        <CatTag>{CAT_LABELS[d.category]}</CatTag>
        <ExplText>{d.explanation}</ExplText>
        {d.evidence && <Evidence>{d.evidence}</Evidence>}
        {d.decoded && <><DecodedHead>↳ Decoded Payload</DecodedHead><DecodedPre>{d.decoded}</DecodedPre></>}
      </CardBody>
    </Card>
  );
}

function HexRowView({ row }: { row: HexRow }) {
  const cm = new Map<number, 'red' | 'amber' | 'blue'>();
  for (const h of row.highlightRanges) cm.set(h.col, h.color);
  return (
    <HexRw>
      <HexAddr>{row.offset.toString(16).padStart(6, '0').toUpperCase()}</HexAddr>
      <HexBG>{row.bytes.map((b, col) => <HexByte key={col} $c={cm.get(col)}>{b < 0 ? '  ' : b.toString(16).padStart(2, '0').toUpperCase()}</HexByte>)}</HexBG>
      <AsciiG>{row.ascii.split('').map((ch, col) => <AsciiC key={col} $c={cm.get(col)}>{ch}</AsciiC>)}</AsciiG>
    </HexRw>
  );
}

function EntropyChart({ blocks }: { blocks: EntropyBlock[] }) {
  if (!blocks.length) return null;
  const H = 36, W = 100, bw = W / blocks.length;
  const col = (e: number) => e >= 7.8 ? T.red : e >= 7.2 ? T.amber : e >= 5.0 ? T.accent : T.green;
  return (
    <EntWrap>
      <EntLegend>
        <LDot $c={T.green}>Low</LDot><LDot $c={T.accent}>Normal</LDot>
        <LDot $c={T.amber}>High</LDot><LDot $c={T.red}>Critical</LDot>
      </EntLegend>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block' }}>
        <line x1={0} y1={H-(7.2/8)*H} x2={W} y2={H-(7.2/8)*H} stroke={T.amber} strokeWidth="0.3" strokeDasharray="1,1" />
        <line x1={0} y1={H-(7.8/8)*H} x2={W} y2={H-(7.8/8)*H} stroke={T.red}   strokeWidth="0.3" strokeDasharray="1,1" />
        {blocks.map((b, i) => <rect key={i} x={i*bw} y={H-(b.entropy/8)*H} width={Math.max(bw-0.2,0.5)} height={(b.entropy/8)*H} fill={col(b.entropy)} opacity={0.7} />)}
      </svg>
    </EntWrap>
  );
}

function StringsTab({ strings }: { strings: ExtractedString[] }) {
  const flagged = strings.filter(s => s.flagged);
  const normal  = strings.filter(s => !s.flagged);
  if (!strings.length) return (
    <ScrollArea><Empty><Info size={22} color={T.inkFaint} /><span style={{ fontSize: '0.76rem', color: T.inkLight }}>No printable strings extracted</span></Empty></ScrollArea>
  );
  return (
    <ScrollArea>
      {flagged.length > 0 && <>
        <GLabel>⚠ Flagged ({flagged.length})</GLabel>
        {flagged.map((s, i) => <SRow key={i} $f><SOffset>{s.offset.toString(16).padStart(6,'0').toUpperCase()}</SOffset><SVal $f>{s.value.slice(0,120)}</SVal>{s.reason && <SReason>{s.reason}</SReason>}</SRow>)}
        <div style={{ height: '0.5rem' }} />
      </>}
      {normal.length > 0 && <>
        <GLabel>All Strings ({normal.length})</GLabel>
        {normal.map((s, i) => <SRow key={i} $f={false}><SOffset>{s.offset.toString(16).padStart(6,'0').toUpperCase()}</SOffset><SVal $f={false}>{s.value.slice(0,120)}</SVal></SRow>)}
      </>}
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type AppMode = 'upload' | 'scanning' | 'result';

export default function VirusCheckerDemo() {
  const fileRef  = useRef<HTMLInputElement>(null);
  const [mode,      setMode]      = useState<AppMode>('upload');
  const [result,    setResult]    = useState<ScanResult | null>(null);
  const [scanFile,  setScanFile]  = useState('');
  const [isDrag,    setIsDrag]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [rawBytes,  setRawBytes]  = useState<Uint8Array | null>(null);
  const [hexOff,    setHexOff]    = useState(0);
  const [selId,     setSelId]     = useState<string | null>(null);
  const [tab,       setTab]       = useState<RightTab>('threats');

  const totalRows   = useMemo(() => (rawBytes ? Math.ceil(rawBytes.length / 16) : 0), [rawBytes]);
  const hexRows     = useMemo(() => (!rawBytes || !result) ? [] : buildHexRowsDynamic(rawBytes, result.detections, hexOff, HEX_ROWS_VISIBLE), [rawBytes, result, hexOff]);
  const visibleDets = useMemo(() => result?.detections.filter(d => !dismissed.has(d.id)) ?? [], [result, dismissed]);
  const sevCounts   = useMemo(() => { const c: Record<string,number>={}; for (const d of visibleDets) c[d.severity]=(c[d.severity]??0)+1; return c; }, [visibleDets]);

  const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1_048_576).toFixed(2)} MB`;

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 50 * 1024 * 1024) { setError('File exceeds 50 MB limit.'); setTimeout(() => setError(null), 4000); return; }
    setError(null); setScanFile(file.name); setMode('scanning');
    try {
      const buf = await file.arrayBuffer();
      setRawBytes(new Uint8Array(buf));
      await new Promise<void>(r => setTimeout(r, 500));
      const res = analyzeFile(buf, file.name);
      setResult(res); setHexOff(0); setSelId(null); setTab('threats'); setDismissed(new Set()); setMode('result');
    } catch {
      setError('Analysis failed — file may be corrupt or unreadable.'); setTimeout(() => setError(null), 4000); setMode('upload');
    }
  }, []);

  const handleReset = useCallback(() => {
    setMode('upload'); setResult(null); setScanFile(''); setRawBytes(null);
    setHexOff(0); setSelId(null); setTab('threats'); setDismissed(new Set());
  }, []);

  const handleDetClick = useCallback((d: Detection) => {
    setSelId(prev => (prev === d.id ? null : d.id));
    setHexOff(Math.max(0, Math.floor(d.byteOffset / 16) - 2));
    setTab('hex');
  }, []);

  const handleDismiss = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => { const n = new Set(prev); n.add(id); return n; });
    if (selId === id) setSelId(null);
  }, [selId]);

  const hexEnd      = Math.max(0, Math.min((hexOff + HEX_ROWS_VISIBLE) * 16, (result?.fileSize ?? 0)) - 1);
  const selectedDet = result?.detections.find(d => d.id === selId);

  return (
    <Root
      onDragEnter={e => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDrag(false); }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <GlobalStyle />

      {/* HEADER */}
      <Header>
        <div>
          <Title>File Safety Scanner</Title>
          <Subtitle>Signature matching · entropy analysis · obfuscation detection · local only</Subtitle>
        </div>
        <HeaderBadge>100% local · max 50 MB</HeaderBadge>
      </Header>

      {/* UPLOAD */}
      {mode === 'upload' && (
        <>
          <DropZone $active={isDrag} htmlFor="vc-file-input">
            <Shield size={28} color={isDrag ? T.accent : T.inkFaint} />
            <DropTitle>{isDrag ? 'Release to scan' : 'Drop any file here to scan it'}</DropTitle>
            <DropSub>
              Detects malware signatures, obfuscated code, high-entropy payloads, and more.<br />
              All file types supported · file never leaves your device
            </DropSub>
            <input id="vc-file-input" ref={fileRef} type="file" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </DropZone>
          <PillRow>
            {['Signature database','Entropy analysis','Obfuscation detection','String extraction','File type check'].map(m => <Pill key={m}>{m}</Pill>)}
          </PillRow>
        </>
      )}

      {/* SCANNING */}
      {mode === 'scanning' && (
        <ScanWrap>
          <SpinRing><Shield size={28} /></SpinRing>
          <ScanTitle>Scanning file…</ScanTitle>
          <ScanFile>{scanFile}</ScanFile>
          <StepList>
            {['Checking signature database','Analysing byte entropy','Detecting obfuscation','Extracting strings','Verifying file headers'].map((s,i) => <Step key={s} $d={i*0.08}>{s}</Step>)}
          </StepList>
        </ScanWrap>
      )}

      {/* RESULT */}
      {mode === 'result' && result && (
        <>
          <Divider />
          <SectionTitle>Scan Results <span>{result.detections.length} finding{result.detections.length !== 1 ? 's' : ''}</span></SectionTitle>

          <ResultWrap>
            <VerdictCard $v={result.verdict}>
              <VerdictHeader $v={result.verdict}>
                <VerdictIconBox $v={result.verdict}>
                  {result.verdict === 'malicious'  && <ShieldX     size={18} />}
                  {result.verdict === 'suspicious' && <ShieldAlert size={18} />}
                  {result.verdict === 'clean'      && <ShieldCheck size={18} />}
                </VerdictIconBox>
                <VerdictText>
                  <VerdictTitle $v={result.verdict}>{VERDICT_TITLE[result.verdict]}</VerdictTitle>
                  <VerdictRec   $v={result.verdict}>{VERDICT_REC[result.verdict]}</VerdictRec>
                </VerdictText>
                <VerdictMeta>
                  <FileBadge>
                    <span style={{ fontWeight: 600, color: T.ink }}>{result.fileName}</span>
                    <span>·</span><span>{fmt(result.fileSize)}</span>
                    {result.magicBytesDetected && <><span>·</span><MagicChip>{result.magicBytesDetected}</MagicChip></>}
                    {result.extensionMismatch   && <WarnChip>⚠ Extension mismatch</WarnChip>}
                  </FileBadge>
                </VerdictMeta>
              </VerdictHeader>
            </VerdictCard>

            <ContentRow>
              <Sidebar>
                {visibleDets.length > 0 ? (
                  <SideSection>
                    <SideLabel>Threats · {visibleDets.length} found</SideLabel>
                    {(['critical','high','medium','low','info'] as const).map(sev => {
                      const n = sevCounts[sev]; if (!n) return null;
                      return <SevRow key={sev}><SevLeft><SevDot $sev={sev} /><SevName $sev={sev}>{SEV_CONFIG[sev].label}</SevName></SevLeft><SevCount $sev={sev}>{n}</SevCount></SevRow>;
                    })}
                    {dismissed.size > 0 && <div style={{ fontSize: '0.6rem', color: T.inkFaint, marginTop: '0.28rem' }}>{dismissed.size} finding{dismissed.size>1?'s':''} dismissed</div>}
                  </SideSection>
                ) : (
                  <SideSection>
                    <SideLabel>Result</SideLabel>
                    <div style={{ fontSize: '0.7rem', color: T.green, lineHeight: 1.5 }}>
                      {dismissed.size > 0 ? `All ${dismissed.size} finding${dismissed.size>1?'s':''} dismissed` : 'No threats detected'}
                    </div>
                  </SideSection>
                )}
                <SideSection>
                  <SideLabel>File</SideLabel>
                  <SideFileName>{result.fileName}</SideFileName>
                  <SideFileMeta>{fmt(result.fileSize)} · {result.scanDurationMs}ms</SideFileMeta>
                </SideSection>
                <SideSection>
                  <SideLabel>Composition</SideLabel>
                  <RatioRow>
                    <RatioLabel>{Math.round(result.textRatio*100)}% printable</RatioLabel>
                    <RatioValue $isText={result.textRatio > 0.35}>{result.textRatio > 0.35 ? 'Text' : 'Binary'}</RatioValue>
                  </RatioRow>
                  <RatioBar><RatioFill $pct={result.textRatio} $isText={result.textRatio > 0.35} /></RatioBar>
                  {result.textRatio <= 0.35 && <RatioNote>Text-pattern analysis skipped to prevent false positives on binary data.</RatioNote>}
                </SideSection>
                <SideSection>
                  <SideLabel>Scan Methods</SideLabel>
                  {['Signature database','Entropy analysis',...(result.textRatio>0.35?['Obfuscation detection','Suspicious strings']:[]),'String extraction','File type verification'].map(m => <CovItem key={m}>{m}</CovItem>)}
                </SideSection>
              </Sidebar>

              <MainPanel>
                <TabBar>
                  <Tab $a={tab==='threats'} onClick={() => setTab('threats')}>
                    <ShieldX size={11} /> Threats
                    <TabChip $alert={visibleDets.length>0 && result.verdict!=='clean'} $ok={visibleDets.length===0}>{visibleDets.length}</TabChip>
                  </Tab>
                  <Tab $a={tab==='strings'} onClick={() => setTab('strings')}>
                    <Type size={11} /> Strings
                    <TabChip $alert={result.extractedStrings.some(s=>s.flagged)}>{result.extractedStrings.length}</TabChip>
                  </Tab>
                  <Tab $a={tab==='hex'} onClick={() => setTab('hex')}><FileText size={11} /> Raw Bytes</Tab>
                </TabBar>

                <TabContent>
                  {tab === 'threats' && (
                    <>
                      <ScrollArea>
                        {visibleDets.length === 0 ? (
                          <Empty>
                            <ShieldCheck size={34} color={T.green} />
                            <div style={{ fontSize: '0.88rem', fontFamily: T.serif, fontWeight: 400, color: T.green }}>
                              {dismissed.size > 0 ? 'All Findings Dismissed' : 'No Threats Found'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: T.inkLight, lineHeight: 1.6, maxWidth: 260 }}>
                              {dismissed.size > 0 ? 'You have dismissed all flagged findings. Use "Restore" to review them again.' : 'This file passed all checks including signature matching, entropy analysis, and file type verification.'}
                            </div>
                          </Empty>
                        ) : visibleDets.map(d => (
                          <DetectionCard key={d.id} d={d} selected={selId===d.id} onSelect={() => handleDetClick(d)} onDismiss={e => handleDismiss(d.id, e)} />
                        ))}
                      </ScrollArea>
                      {dismissed.size > 0 && (
                        <DismissBar>
                          <span>{dismissed.size} finding{dismissed.size>1?'s':''} dismissed</span>
                          <RestoreBtn onClick={() => setDismissed(new Set())}><RotateCcw size={8} /> Restore</RestoreBtn>
                        </DismissBar>
                      )}
                    </>
                  )}

                  {tab === 'strings' && <StringsTab strings={result.extractedStrings} />}

                  {tab === 'hex' && (
                    <HexWrap>
                      <HexNav>
                        <NavBt $dim={hexOff<=0} disabled={hexOff<=0} onClick={() => setHexOff(o => Math.max(0,o-HEX_ROWS_VISIBLE))}><ChevronLeft size={9} /> Prev</NavBt>
                        <HexOff>0x{(hexOff*16).toString(16).padStart(6,'0').toUpperCase()} – 0x{hexEnd.toString(16).padStart(6,'0').toUpperCase()}</HexOff>
                        <NavBt $dim={hexOff+HEX_ROWS_VISIBLE>=totalRows} disabled={hexOff+HEX_ROWS_VISIBLE>=totalRows} onClick={() => setHexOff(o => Math.min(o+HEX_ROWS_VISIBLE,Math.max(0,totalRows-HEX_ROWS_VISIBLE)))}>Next <ChevronRight size={9} /></NavBt>
                      </HexNav>
                      {selectedDet && (
                        <SelBar>
                          <span style={{ color: T.inkFaint, fontSize: '0.61rem' }}>Viewing</span>
                          <span style={{ fontWeight: 600 }}>{selectedDet.name}</span>
                          <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: '0.59rem', color: T.inkLight }}>0x{selectedDet.byteOffset.toString(16).toUpperCase().padStart(4,'0')}</span>
                        </SelBar>
                      )}
                      <HexScroll>{hexRows.map(r => <HexRowView key={r.offset} row={r} />)}</HexScroll>
                      <div style={{ flexShrink: 0, padding: '0.16rem 0.55rem', borderTop: `1px solid ${T.rule}`, fontSize: '0.56rem', color: T.inkFaint, textTransform: 'uppercase', letterSpacing: '0.09em', background: T.creamDark, fontFamily: T.mono }}>
                        Entropy · 256-byte blocks
                      </div>
                      <EntropyChart blocks={result.entropyBlocks} />
                    </HexWrap>
                  )}
                </TabContent>
              </MainPanel>
            </ContentRow>
          </ResultWrap>

          <ActionRow>
            <Btn $primary onClick={handleReset}><RotateCcw size={13} /> Scan Another File</Btn>
          </ActionRow>
        </>
      )}

      {error && <ErrToast>⚠ {error}</ErrToast>}
    </Root>
  );
}