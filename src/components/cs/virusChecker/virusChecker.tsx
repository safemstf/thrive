'use client';
// src/components/cs/virusChecker/virusChecker.tsx

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Shield, Upload, RefreshCw, FileText, ChevronLeft, ChevronRight, Type,
  ShieldCheck, ShieldAlert, ShieldX, X, RotateCcw, Lock, Info,
} from 'lucide-react';
import {
  analyzeFile, buildHexRowsDynamic,
  type Detection, type ScanResult, type Severity, type Verdict,
  type HexRow, type EntropyBlock, type ExtractedString,
} from './virusChecker.analysis';

const HEX_ROWS_VISIBLE = 16;
type RightTab = 'threats' | 'strings' | 'hex';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const GRID_COLS   = 16;
const GRID_ROWS   = 10;
const TOTAL_FILES = GRID_COLS * GRID_ROWS;
const FILE_SIZE   = 40;
const FILE_GAP    = 6;
const VISUAL_SCALE = 0.84;
const INFECTION_RATE      = 0.09;
const SCAN_PROGRESS_RATE  = 4;
const QUARANTINE_DELAY_MS = 600;

const FILE_EXTENSIONS = ['.exe', '.dll', '.js', '.py', '.pdf', '.doc', '.zip', '.bat', '.sh', '.bin', '.msi', '.vbs'];
const FILE_NAMES = [
  'svchost', 'explorer', 'chrome', 'kernel32', 'ntdll', 'winlogon',
  'csrss', 'smss', 'lsass', 'wininit', 'services', 'spoolsv',
  'taskhost', 'rundll32', 'cmd', 'powershell', 'system32', 'regsvc',
  'update', 'installer', 'helper', 'launcher', 'loader', 'agent',
];
const VIRUS_SIGNATURES = [
  'EICAR.Test.File', 'Trojan.GenericKD.48211', 'W32.Blaster.Worm',
  'Ransom.WannaCry', 'Backdoor.NjRAT', 'Spyware.AgentTesla',
];

type FileStatus = 'unscanned' | 'scanning' | 'clean' | 'infected' | 'quarantined';
interface DemoFile {
  id: number; name: string; extension: string;
  status: FileStatus; scanProgress: number; signatureMatch: string | null;
  x: number; y: number;
}

const STATUS_COLORS: Record<FileStatus, { bg: string; border: string; glow: string; text: string }> = {
  unscanned:   { bg: 'rgba(241,245,249,0.9)',  border: 'rgba(148,163,184,0.3)',  glow: 'transparent',            text: '#94a3b8' },
  scanning:    { bg: 'rgba(59,130,246,0.08)',   border: '#3b82f6',                glow: 'rgba(59,130,246,0.2)',   text: '#3b82f6' },
  clean:       { bg: 'rgba(34,197,94,0.08)',    border: 'rgba(34,197,94,0.4)',    glow: 'transparent',            text: '#16a34a' },
  infected:    { bg: 'rgba(239,68,68,0.12)',    border: '#ef4444',                glow: 'rgba(239,68,68,0.25)',   text: '#dc2626' },
  quarantined: { bg: 'rgba(245,158,11,0.1)',    border: 'rgba(245,158,11,0.5)',   glow: 'rgba(245,158,11,0.2)',  text: '#b45309' },
};

function makeDemoFiles(): DemoFile[] {
  return Array.from({ length: TOTAL_FILES }, (_, i) => ({
    id: i,
    name: FILE_EXTENSIONS[Math.floor(Math.random() * FILE_EXTENSIONS.length)],
    extension: FILE_EXTENSIONS[Math.floor(Math.random() * FILE_EXTENSIONS.length)],
    status: 'unscanned', scanProgress: 0,
    signatureMatch: Math.random() < INFECTION_RATE
      ? VIRUS_SIGNATURES[Math.floor(Math.random() * VIRUS_SIGNATURES.length)] : null,
    x: 0, y: 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────

const fadeIn  = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const fadeUp  = keyframes`from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}`;
const spin    = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const stepIn  = keyframes`from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:translateX(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}`;

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const UI   = `'Inter', system-ui, -apple-system, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`;
const BORDER = 'rgba(148,163,184,0.18)';
const PHI_SPACE_1 = '0.5rem';
const PHI_SPACE_2 = '0.809rem';
const PHI_SPACE_3 = '1.309rem';
const PHI_SPACE_4 = '2.118rem';
const PHI_RADIUS_2 = '0.809rem';
const PHI_RADIUS_3 = '1.309rem';

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const VERDICT_CONFIG = {
  malicious: {
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
    border:   '#fca5a5',
    accent:   '#dc2626',
    iconBg:   'rgba(239,68,68,0.12)',
    iconFg:   '#dc2626',
    title:    '#991b1b',
    subtext:  '#b91c1c',
    badge:    { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  },
  suspicious: {
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border:   '#fcd34d',
    accent:   '#d97706',
    iconBg:   'rgba(245,158,11,0.12)',
    iconFg:   '#b45309',
    title:    '#78350f',
    subtext:  '#92400e',
    badge:    { bg: 'rgba(245,158,11,0.1)', text: '#b45309', border: 'rgba(245,158,11,0.3)' },
  },
  clean: {
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border:   '#86efac',
    accent:   '#16a34a',
    iconBg:   'rgba(34,197,94,0.12)',
    iconFg:   '#15803d',
    title:    '#14532d',
    subtext:  '#15803d',
    badge:    { bg: 'rgba(34,197,94,0.1)', text: '#15803d', border: 'rgba(34,197,94,0.3)' },
  },
};

const SEV_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  label: 'Critical' },
  high:     { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.2)',  label: 'High' },
  medium:   { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)',  border: 'rgba(202,138,4,0.2)',  label: 'Medium' },
  low:      { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)',  label: 'Low' },
  info:     { color: '#64748b', bg: 'rgba(100,116,139,0.07)',border: 'rgba(100,116,139,0.2)',label: 'Info' },
};

const SEV_BAR: Record<Severity, string> = {
  critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6', info: '#94a3b8',
};

const CAT_LABELS: Record<Detection['category'], string> = {
  'signature':         'Known Signature',
  'obfuscation':       'Code Obfuscation',
  'suspicious-string': 'Suspicious String',
  'entropy':           'High-Entropy Region',
  'magic-mismatch':    'File Type Mismatch',
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

const Root = styled.div`
  position: absolute; inset: 0;
  background: #f8fafc;
  font-family: ${UI};
  -webkit-font-smoothing: antialiased;
  display: flex; flex-direction: column;
  overflow: hidden;
`;

const Canvas = styled.canvas<{ $vis: boolean }>`
  position: absolute; inset: 0; display: block;
  width: 100%;
  height: 100%;
  transition: opacity 0.4s;
  opacity: ${p => p.$vis ? 1 : 0};
  pointer-events: none;
`;

const Stage = styled.div`
  position: relative;
  z-index: 10;
  flex: 1;
  min-height: 0;
  padding: clamp(0.75rem, 1.3vw, 1.35rem);
  @media (max-width: 900px) {
    padding: 0.65rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const UploadWrap = styled.div`
  position: absolute; inset: 0; z-index: 20;
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(360px, 540px);
  gap: ${PHI_SPACE_3};
  align-items: stretch;
  padding: ${PHI_SPACE_3};
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    padding: ${PHI_SPACE_2};
  }
`;

const UploadVisual = styled.div`
  position: relative;
  overflow: hidden;
  min-height: clamp(320px, 58vh, 760px);
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.2);
  background:
    radial-gradient(circle at 18% 24%, rgba(59,130,246,0.14), transparent 38%),
    radial-gradient(circle at 80% 72%, rgba(34,197,94,0.12), transparent 34%),
    linear-gradient(180deg, rgba(248,250,252,0.4) 0%, rgba(241,245,249,0.24) 100%);
  @media (max-width: 760px) {
    min-height: 220px;
  }
`;

const UploadPanel = styled.div`
  width: 100%;
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.2);
  background: rgba(248,250,252,0.92);
  backdrop-filter: blur(2px);
  box-shadow: 0 18px 40px rgba(15,23,42,0.09);
  justify-self: end;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: ${PHI_SPACE_4}; padding: ${PHI_SPACE_4};
  @media (max-width: 760px) {
    gap: ${PHI_SPACE_3};
    padding: ${PHI_SPACE_3};
  }
`;

const BrandRow = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${PHI_SPACE_1};
  animation: ${fadeIn} 0.4s ease;
`;

const LogoWrap = styled.div`
  width: 58px; height: 58px; border-radius: ${PHI_RADIUS_3};
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px rgba(59,130,246,0.32);
`;

const BrandTitle = styled.h1`
  margin: 0; font-size: 1.35rem; font-weight: 800;
  letter-spacing: -0.025em; color: #0f172a;
`;

const PrivacyPill = styled.div`
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2);
  border-radius: 999px; padding: 0.15rem 0.75rem 0.15rem 0.55rem;
  font-size: 0.7rem; font-weight: 500; color: #15803d;
  &::before { content: '●'; font-size: 0.45rem; color: #22c55e; }
`;

const DropCard = styled.label<{ $drag: boolean }>`
  width: min(560px, 100%);
  background: ${p => p.$drag ? 'rgba(59,130,246,0.03)' : 'white'};
  border: 2px dashed ${p => p.$drag ? '#3b82f6' : 'rgba(148,163,184,0.4)'};
  border-radius: 24px;
  box-shadow: ${p => p.$drag
    ? '0 0 0 6px rgba(59,130,246,0.06), 0 12px 40px rgba(15,23,42,0.08)'
    : '0 10px 34px rgba(15,23,42,0.07)'};
  padding: calc(${PHI_SPACE_4} * 1.1) ${PHI_SPACE_4};
  display: flex; flex-direction: column; align-items: center; gap: ${PHI_SPACE_2};
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease 0.1s both;
  &:hover {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 8px 32px rgba(15,23,42,0.08);
  }
`;

const DropIconWrap = styled.div<{ $drag: boolean }>`
  width: 68px; height: 68px; border-radius: ${PHI_RADIUS_3};
  background: ${p => p.$drag ? 'rgba(59,130,246,0.1)' : '#f1f5f9'};
  border: 1px solid ${p => p.$drag ? 'rgba(59,130,246,0.25)' : BORDER};
  display: flex; align-items: center; justify-content: center;
  color: ${p => p.$drag ? '#3b82f6' : '#64748b'};
  transition: all 0.2s;
`;

const DropTitle = styled.div`font-size: 0.95rem; font-weight: 700; color: #0f172a; text-align: center;`;
const DropSub   = styled.div`font-size: 0.76rem; color: #64748b; text-align: center; line-height: 1.6;`;

const DropButton = styled.div`
  display: flex; align-items: center; gap: 0.4rem;
  padding: ${PHI_SPACE_2} ${PHI_SPACE_4}; border-radius: ${PHI_RADIUS_2};
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white; font-size: 0.82rem; font-weight: 600;
  box-shadow: 0 8px 22px rgba(59,130,246,0.32);
`;

const PillRow = styled.div`
  display: flex; flex-wrap: wrap; justify-content: center; gap: ${PHI_SPACE_1};
  max-width: 540px;
  animation: ${fadeIn} 0.4s ease 0.18s both;
`;

const Pill = styled.div`
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.24rem ${PHI_SPACE_2}; border-radius: 999px;
  border: 1px solid ${BORDER};
  background: white;
  font-size: 0.68rem; color: #64748b;
  &::before { content: '✓'; color: #22c55e; font-weight: 800; font-size: 0.6rem; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCANNING SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const ScanWrap = styled.div`
  position: absolute; inset: 0; z-index: 30;
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.2);
  background: rgba(248,250,252,0.95);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1.1rem;
  animation: ${fadeIn} 0.25s ease;
`;

const SpinRing = styled.div`animation: ${spin} 1.1s linear infinite; color: #3b82f6; display: flex;`;
const ScanTitle = styled.div`font-size: 0.95rem; font-weight: 700; color: #0f172a;`;
const ScanFile  = styled.div`
  font-size: 0.72rem; color: #64748b; font-family: ${MONO};
  background: white; border: 1px solid ${BORDER}; border-radius: 7px;
  padding: 0.28rem 0.65rem; max-width: 280px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const StepList = styled.div`
  display: flex; flex-direction: column; gap: 0.28rem;
  background: white; border: 1px solid ${BORDER}; border-radius: 12px;
  padding: 0.8rem 1.1rem; min-width: 240px;
`;
const Step = styled.div<{ $d: number }>`
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.73rem; color: #64748b;
  animation: ${stepIn} 0.3s ease ${p => p.$d}s both;
  &::before { content: '✓'; color: #22c55e; font-weight: 800; font-size: 0.65rem; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TOOL MODE
// ─────────────────────────────────────────────────────────────────────────────

const ToolRoot = styled.div`
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.2);
  box-shadow: 0 16px 40px rgba(15,23,42,0.08);
  background: #f8fafc;
  animation: ${slideIn} 0.3s ease;
`;

// ── Full-width verdict header ─────────────────────────────────────────────────

const VerdictHeader = styled.div<{ $v: Verdict }>`
  flex-shrink: 0;
  background: ${p => VERDICT_CONFIG[p.$v].gradient};
  border-bottom: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  padding: ${PHI_SPACE_3} ${PHI_SPACE_4};
  display: flex; align-items: center; gap: ${PHI_SPACE_3};
`;

const VerdictIconBox = styled.div<{ $v: Verdict }>`
  flex-shrink: 0;
  width: 52px; height: 52px; border-radius: ${PHI_RADIUS_2};
  background: ${p => VERDICT_CONFIG[p.$v].iconBg};
  border: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  display: flex; align-items: center; justify-content: center;
  color: ${p => VERDICT_CONFIG[p.$v].iconFg};
`;

const VerdictText = styled.div`flex: 1; min-width: 0;`;

const VerdictTitle = styled.div<{ $v: Verdict }>`
  font-size: 1rem; font-weight: 800; letter-spacing: -0.01em;
  color: ${p => VERDICT_CONFIG[p.$v].title};
`;

const VerdictRec = styled.div<{ $v: Verdict }>`
  font-size: 0.74rem; color: ${p => VERDICT_CONFIG[p.$v].subtext};
  margin-top: 0.2rem; line-height: 1.6;
`;

const VerdictMeta = styled.div`
  flex-shrink: 0; text-align: right;
  display: flex; flex-direction: column; align-items: flex-end; gap: ${PHI_SPACE_1};
`;

const FileBadge = styled.div`
  font-size: 0.7rem; font-weight: 500; color: #475569;
  display: flex; align-items: center; gap: 0.35rem;
`;

const MagicChip = styled.span`
  background: rgba(59,130,246,0.07); border: 1px solid rgba(59,130,246,0.15);
  border-radius: 999px; padding: 0.08rem 0.5rem;
  font-size: 0.64rem; color: #3b82f6; font-weight: 600;
`;

const WarnChip = styled.span`
  background: rgba(234,88,12,0.08); border: 1px solid rgba(234,88,12,0.2);
  border-radius: 999px; padding: 0.08rem 0.5rem;
  font-size: 0.64rem; color: #ea580c; font-weight: 600;
`;

const RescanBtn = styled.button`
  display: flex; align-items: center; gap: 0.35rem;
  padding: ${PHI_SPACE_1} ${PHI_SPACE_3}; border-radius: ${PHI_RADIUS_2};
  border: 1px solid ${BORDER};
  background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
  color: #475569; font-size: 0.72rem; font-weight: 600; font-family: ${UI};
  cursor: pointer; transition: all 0.15s;
  &:hover { background: white; color: #1e293b; border-color: rgba(148,163,184,0.4); }
`;

// ── Content area below header ─────────────────────────────────────────────────

const ContentArea = styled.div`
  flex: 1; display: flex; overflow: hidden; min-height: 0;
  gap: ${PHI_SPACE_3};
  padding: ${PHI_SPACE_3};
  background: #f1f5f9;
  @media (max-width: 1080px) {
    flex-direction: column;
  }
`;

// ── Left sidebar ──────────────────────────────────────────────────────────────

const Sidebar = styled.div`
  flex-shrink: 0; width: min(280px, 30vw);
  background: white;
  border: 1px solid ${BORDER};
  border-radius: ${PHI_RADIUS_3};
  display: flex; flex-direction: column;
  overflow-y: auto;
  @media (max-width: 1080px) {
    width: 100%;
    max-height: 42%;
  }
  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 2px; }
`;

const SideSection = styled.div`
  padding: ${PHI_SPACE_2} ${PHI_SPACE_3};
  border-bottom: 1px solid rgba(241,245,249,1);
`;

const SideLabel = styled.div`
  font-size: 0.58rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 0.45rem;
`;

// Severity stat rows
const SevRow = styled.div<{ $sev: Severity }>`
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.22rem 0;
`;

const SevLeft = styled.div`display: flex; align-items: center; gap: 0.4rem;`;
const SevDot  = styled.div<{ $sev: Severity }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${p => SEV_BAR[p.$sev]};
`;
const SevName  = styled.span<{ $sev: Severity }>`font-size: 0.73rem; color: ${p => SEV_CONFIG[p.$sev].color};`;
const SevCount = styled.span<{ $sev: Severity }>`font-size: 0.8rem; font-weight: 700; color: ${p => SEV_CONFIG[p.$sev].color};`;

// Text ratio
const RatioRow = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;`;
const RatioLabel = styled.span`font-size: 0.71rem; color: #64748b;`;
const RatioValue = styled.span<{ $isText: boolean }>`
  font-size: 0.71rem; font-weight: 600;
  color: ${p => p.$isText ? '#15803d' : '#b45309'};
`;
const RatioBar = styled.div`height: 5px; border-radius: 999px; background: #f1f5f9; overflow: hidden;`;
const RatioFill = styled.div<{ $pct: number; $isText: boolean }>`
  height: 100%; border-radius: 999px;
  width: ${p => Math.min(100, Math.round(p.$pct * 100))}%;
  background: ${p => p.$isText ? '#22c55e' : '#f59e0b'};
`;
const RatioNote = styled.div`font-size: 0.62rem; color: #94a3b8; margin-top: 0.2rem; line-height: 1.5;`;

// Coverage
const CovItem = styled.div`
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.7rem; color: #64748b; padding: 0.1rem 0;
  &::before { content: '✓'; color: #22c55e; font-weight: 800; font-size: 0.6rem; flex-shrink: 0; }
`;

// File name
const SideFileName = styled.div`
  font-size: 0.77rem; font-weight: 600; color: #1e293b;
  word-break: break-all; font-family: ${MONO}; line-height: 1.4;
`;
const SideFileMeta = styled.div`font-size: 0.67rem; color: #64748b; margin-top: 0.15rem;`;

// ── Right panel ───────────────────────────────────────────────────────────────

const MainPanel = styled.div`
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-height: 0;
  background: white;
  border: 1px solid ${BORDER};
  border-radius: ${PHI_RADIUS_3};
`;

// Tab bar
const TabBar = styled.div`
  flex-shrink: 0;
  padding: 0 ${PHI_SPACE_3};
  border-bottom: 1px solid ${BORDER};
  background: #fafbfc;
  display: flex; align-items: flex-end; gap: 0;
`;

const Tab = styled.button<{ $a: boolean }>`
  display: flex; align-items: center; gap: 0.35rem;
  padding: ${PHI_SPACE_2} ${PHI_SPACE_3} ${PHI_SPACE_1};
  border: none; border-bottom: 2px solid ${p => p.$a ? '#3b82f6' : 'transparent'};
  background: transparent;
  color: ${p => p.$a ? '#1e293b' : '#64748b'};
  font-size: 0.74rem; font-weight: ${p => p.$a ? '600' : '400'};
  font-family: ${UI}; cursor: pointer; transition: color 0.15s;
  &:hover { color: #1e293b; }
`;

const TabChip = styled.span<{ $alert?: boolean; $ok?: boolean }>`
  font-size: 0.62rem; font-weight: 700;
  padding: 0.07rem 0.38rem; border-radius: 999px;
  background: ${p => p.$alert ? 'rgba(220,38,38,0.08)' : p.$ok ? 'rgba(22,163,74,0.08)' : '#f1f5f9'};
  color: ${p => p.$alert ? '#dc2626' : p.$ok ? '#15803d' : '#64748b'};
`;

const TabContent = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0;`;

// ─────────────────────────────────────────────────────────────────────────────
// THREATS TAB
// ─────────────────────────────────────────────────────────────────────────────

const ScrollArea = styled.div`
  flex: 1; overflow-y: auto; padding: ${PHI_SPACE_2} ${PHI_SPACE_3};
  display: flex; flex-direction: column; gap: ${PHI_SPACE_1};
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 2px; }
`;

const DismissBar = styled.div`
  flex-shrink: 0;
  padding: ${PHI_SPACE_1} ${PHI_SPACE_3};
  border-top: 1px solid ${BORDER};
  background: #fafbfc;
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.68rem; color: #64748b;
`;

const RestoreBtn = styled.button`
  display: flex; align-items: center; gap: 0.25rem;
  padding: 0.15rem 0.5rem; border-radius: 6px;
  border: 1px solid ${BORDER}; background: white;
  color: #3b82f6; font-size: 0.65rem; font-weight: 600; font-family: ${UI};
  cursor: pointer; transition: all 0.15s;
  &:hover { background: rgba(59,130,246,0.05); border-color: rgba(59,130,246,0.25); }
`;

// Detection card
const Card = styled.div<{ $sev: Severity; $sel: boolean }>`
  display: flex; border-radius: ${PHI_RADIUS_2};
  border: 1px solid ${p => p.$sel
    ? (p.$sev === 'critical' || p.$sev === 'high' ? 'rgba(239,68,68,0.35)' :
       p.$sev === 'medium' ? 'rgba(234,179,8,0.35)' : 'rgba(59,130,246,0.3)')
    : BORDER};
  background: ${p => p.$sel ? '#fafbff' : 'white'};
  box-shadow: ${p => p.$sel
    ? '0 2px 12px rgba(15,23,42,0.06)'
    : '0 1px 3px rgba(15,23,42,0.04)'};
  overflow: hidden; cursor: pointer;
  transition: all 0.15s;
  animation: ${fadeUp} 0.2s ease both;
  &:hover { box-shadow: 0 6px 16px rgba(15,23,42,0.07); }
  position: relative;
`;

const CardBar = styled.div<{ $sev: Severity }>`
  width: 3px; flex-shrink: 0;
  background: ${p => SEV_BAR[p.$sev]};
`;

const CardBody = styled.div`flex: 1; padding: ${PHI_SPACE_2} ${PHI_SPACE_3}; min-width: 0;`;

const CardHead = styled.div`display: flex; align-items: flex-start; gap: 0.45rem; margin-bottom: 0.18rem;`;
const CardName = styled.div`flex: 1; font-size: 0.77rem; font-weight: 600; color: #1e293b; line-height: 1.35; word-break: break-word;`;

const SevBadge = styled.span<{ $sev: Severity }>`
  flex-shrink: 0; font-size: 0.56rem; font-weight: 700;
  padding: 0.1rem 0.42rem; border-radius: 999px;
  text-transform: uppercase; letter-spacing: 0.07em;
  background: ${p => SEV_CONFIG[p.$sev].bg};
  color: ${p => SEV_CONFIG[p.$sev].color};
  border: 1px solid ${p => SEV_CONFIG[p.$sev].border};
`;

const HexHint = styled.span`
  flex-shrink: 0; font-size: 0.58rem; color: #94a3b8;
  font-family: ${MONO};
  background: #f8fafc; border: 1px solid ${BORDER};
  padding: 0.06rem 0.32rem; border-radius: 4px;
`;

const DismissBtn = styled.button`
  flex-shrink: 0; width: 22px; height: 22px;
  border: none; background: transparent;
  color: #94a3b8; cursor: pointer; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; padding: 0;
  &:hover { background: rgba(239,68,68,0.08); color: #dc2626; }
`;

const CatTag   = styled.div`font-size: 0.61rem; color: #94a3b8; margin-bottom: 0.28rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;`;
const ExplText = styled.div`font-size: 0.72rem; color: #475569; line-height: 1.6; margin-bottom: 0.35rem;`;

const Evidence = styled.pre`
  font-size: 0.62rem; color: #64748b; font-family: ${MONO};
  background: #f8fafc; border: 1px solid ${BORDER};
  border-radius: 6px; padding: 0.38rem 0.5rem;
  white-space: pre-wrap; word-break: break-all;
  margin: 0 0 0.22rem; max-height: 3.6rem; overflow: hidden;
`;

const DecodedHead = styled.div`
  font-size: 0.59rem; font-weight: 700; color: #92400e;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.12rem;
`;
const DecodedPre = styled.pre`
  font-size: 0.62rem; color: #b45309; font-family: ${MONO};
  background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.18);
  border-radius: 6px; padding: 0.38rem 0.5rem;
  white-space: pre-wrap; word-break: break-all;
  margin: 0; max-height: 3.6rem; overflow: hidden;
`;

const Empty = styled.div`
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.55rem; padding: 2.5rem; text-align: center;
`;

// ─────────────────────────────────────────────────────────────────────────────
// STRINGS TAB
// ─────────────────────────────────────────────────────────────────────────────

const GLabel = styled.div`
  font-size: 0.59rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.09em;
  padding: 0.28rem 0.4rem 0.12rem;
  border-bottom: 1px solid #f1f5f9; margin-bottom: 0.12rem;
`;
const SRow = styled.div<{ $f: boolean }>`
  display: flex; align-items: baseline; gap: 0.45rem;
  padding: 0.13rem 0.4rem; border-radius: 5px; margin-bottom: 0.07rem;
  background: ${p => p.$f ? 'rgba(245,158,11,0.04)' : 'transparent'};
  border: 1px solid ${p => p.$f ? 'rgba(245,158,11,0.14)' : 'transparent'};
  font-size: 0.62rem; line-height: 1.55;
`;
const SOffset = styled.span`color: #94a3b8; flex-shrink: 0; min-width: 52px; font-family: ${MONO}; font-size: 0.58rem;`;
const SVal    = styled.span<{ $f: boolean }>`color: ${p => p.$f ? '#b45309' : '#64748b'}; word-break: break-all; flex: 1;`;
const SReason = styled.span`
  color: white; font-size: 0.56rem; flex-shrink: 0;
  background: #f59e0b; border-radius: 4px; padding: 0.04rem 0.32rem; font-weight: 700;
`;

// ─────────────────────────────────────────────────────────────────────────────
// HEX TAB — dark theme (conventional)
// ─────────────────────────────────────────────────────────────────────────────

const HexWrap   = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; background: #0f172a;`;
const HexNav    = styled.div`flex-shrink: 0; padding: 0.28rem 0.7rem; display: flex; align-items: center; gap: 0.45rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(15,23,42,0.95);`;
const NavBt     = styled.button<{ $dim?: boolean }>`
  padding: 0.18rem 0.5rem; border-radius: 5px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(30,41,59,0.7);
  color: ${p => p.$dim ? '#1e3a5f' : '#64748b'};
  font-size: 0.63rem; font-family: ${UI}; cursor: ${p => p.$dim ? 'default' : 'pointer'};
  display: flex; align-items: center; gap: 0.18rem; transition: all 0.15s;
  &:hover:not([disabled]) { background: rgba(59,130,246,0.15); color: #93c5fd; }
`;
const HexOff    = styled.span`flex: 1; text-align: center; font-size: 0.6rem; color: #475569; font-family: ${MONO};`;
const SelBar    = styled.div`flex-shrink: 0; padding: 0.25rem 0.7rem; background: rgba(59,130,246,0.08); border-bottom: 1px solid rgba(59,130,246,0.15); font-size: 0.66rem; color: #60a5fa; display: flex; align-items: center; gap: 0.4rem;`;
const HexScroll = styled.div`flex: 1; overflow-y: auto; @media (max-width: 1080px) {    width: 100%;   max-height: 42%;  } padding: 0.25rem 0.5rem; &::-webkit-scrollbar{width:3px} &::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px}`;
const HexRw     = styled.div`display: flex; align-items: center; gap: 0.28rem; line-height: 1.7; font-size: 0.59rem; &:hover{background:rgba(255,255,255,0.02)}`;
const HexAddr   = styled.span`color: #1e3a5f; min-width: 48px; flex-shrink: 0; user-select: none; font-family: ${MONO};`;
const HexBG     = styled.span`display: flex; gap: 0.16rem; font-family: ${MONO};`;
const HexByte   = styled.span<{ $c?: 'red'|'amber'|'blue' }>`
  color: ${p=>p.$c==='red'?'#fca5a5':p.$c==='amber'?'#fcd34d':p.$c==='blue'?'#93c5fd':'#334155'};
  background: ${p=>p.$c==='red'?'rgba(239,68,68,0.18)':p.$c==='amber'?'rgba(245,158,11,0.14)':p.$c==='blue'?'rgba(59,130,246,0.14)':'transparent'};
  border-radius: 2px; padding: 0 1px; min-width: 14px; text-align: center;
`;
const AsciiG    = styled.span`color: #334155; padding-left: 0.3rem; border-left: 1px solid rgba(255,255,255,0.05); font-family: ${MONO}; font-size: 0.57rem;`;
const AsciiC    = styled.span<{ $c?: 'red'|'amber'|'blue' }>`color: ${p=>p.$c==='red'?'#f87171':p.$c==='amber'?'#fbbf24':p.$c==='blue'?'#60a5fa':'#334155'};`;
const EntWrap   = styled.div`flex-shrink: 0; padding: 0.25rem 0.6rem 0.35rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(15,23,42,0.95);`;
const EntLegend = styled.div`display: flex; gap: 0.7rem; font-size: 0.59rem; color: #475569; margin-bottom: 0.18rem;`;
const LDot      = styled.span<{ $c: string }>`&::before{content:'●';color:${p=>p.$c};margin-right:0.2rem;}`;

// Error toast
const ErrToast = styled.div`
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  background: white; border: 1px solid rgba(239,68,68,0.25); border-radius: 10px;
  color: #b91c1c; padding: 0.5rem 1rem; font-size: 0.77rem;
  box-shadow: 0 4px 16px rgba(239,68,68,0.1); z-index: 40;
  animation: ${fadeIn} 0.3s ease;
`;

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT COPY
// ─────────────────────────────────────────────────────────────────────────────

const VERDICT_TITLE: Record<Verdict, string> = {
  malicious:  'Threat Detected',
  suspicious: 'Suspicious File',
  clean:      'File Appears Safe',
};

const VERDICT_REC: Record<Verdict, string> = {
  malicious:  'Do not open, run, or share this file. Delete it immediately.',
  suspicious: 'Exercise caution. Verify with a second tool before opening.',
  clean:      'No known threats found. File appears safe.',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function DetectionCard({
  d, selected, onSelect, onDismiss,
}: { d: Detection; selected: boolean; onSelect: () => void; onDismiss: (e: React.MouseEvent) => void }) {
  return (
    <Card $sev={d.severity} $sel={selected} onClick={onSelect}>
      <CardBar $sev={d.severity} />
      <CardBody>
        <CardHead>
          <CardName>{d.name}</CardName>
          <SevBadge $sev={d.severity}>{d.severity}</SevBadge>
          <HexHint>0x{d.byteOffset.toString(16).toUpperCase().padStart(4,'0')}</HexHint>
          <DismissBtn title="Dismiss this finding" onClick={onDismiss}>
            <X size={11} />
          </DismissBtn>
        </CardHead>
        <CatTag>{CAT_LABELS[d.category]}</CatTag>
        <ExplText>{d.explanation}</ExplText>
        {d.evidence && <Evidence>{d.evidence}</Evidence>}
        {d.decoded && (
          <>
            <DecodedHead>↳ Decoded Payload</DecodedHead>
            <DecodedPre>{d.decoded}</DecodedPre>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function HexRow({ row }: { row: HexRow }) {
  const cm = new Map<number, 'red'|'amber'|'blue'>();
  for (const h of row.highlightRanges) cm.set(h.col, h.color);
  return (
    <HexRw>
      <HexAddr>{row.offset.toString(16).padStart(6,'0').toUpperCase()}</HexAddr>
      <HexBG>
        {row.bytes.map((b, col) => (
          <HexByte key={col} $c={cm.get(col)}>
            {b < 0 ? '  ' : b.toString(16).padStart(2,'0').toUpperCase()}
          </HexByte>
        ))}
      </HexBG>
      <AsciiG>
        {row.ascii.split('').map((ch, col) => (
          <AsciiC key={col} $c={cm.get(col)}>{ch}</AsciiC>
        ))}
      </AsciiG>
    </HexRw>
  );
}

function EntropyChart({ blocks }: { blocks: EntropyBlock[] }) {
  if (blocks.length === 0) return null;
  const H = 36, W = 100;
  const bw = W / blocks.length;
  const color = (e: number) =>
    e >= 7.8 ? '#ef4444' : e >= 7.2 ? '#f59e0b' : e >= 5.0 ? '#3b82f6' : '#22c55e';
  return (
    <EntWrap>
      <EntLegend>
        <LDot $c="#22c55e">Low</LDot>
        <LDot $c="#3b82f6">Normal</LDot>
        <LDot $c="#f59e0b">High</LDot>
        <LDot $c="#ef4444">Critical</LDot>
      </EntLegend>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width: '100%', height: H, display: 'block' }}>
        <line x1={0} y1={H-(7.2/8)*H} x2={W} y2={H-(7.2/8)*H} stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1,1"/>
        <line x1={0} y1={H-(7.8/8)*H} x2={W} y2={H-(7.8/8)*H} stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1,1"/>
        {blocks.map((b, i) => (
          <rect key={i} x={i*bw} y={H-(b.entropy/8)*H}
            width={Math.max(bw-0.2,0.5)} height={(b.entropy/8)*H}
            fill={color(b.entropy)} opacity={0.85}/>
        ))}
      </svg>
    </EntWrap>
  );
}

function StringsTab({ strings }: { strings: ExtractedString[] }) {
  const flagged = strings.filter(s => s.flagged);
  const normal  = strings.filter(s => !s.flagged);
  if (strings.length === 0) {
    return (
      <ScrollArea>
        <Empty>
          <Info size={24} color="#94a3b8" />
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No printable strings extracted</span>
        </Empty>
      </ScrollArea>
    );
  }
  return (
    <ScrollArea>
      {flagged.length > 0 && (
        <>
          <GLabel>⚠ Flagged ({flagged.length})</GLabel>
          {flagged.map((s, i) => (
            <SRow key={i} $f>
              <SOffset>{s.offset.toString(16).padStart(6,'0').toUpperCase()}</SOffset>
              <SVal $f>{s.value.slice(0,120)}</SVal>
              {s.reason && <SReason>{s.reason}</SReason>}
            </SRow>
          ))}
          <div style={{ height: '0.6rem' }} />
        </>
      )}
      {normal.length > 0 && (
        <>
          <GLabel>All Strings ({normal.length})</GLabel>
          {normal.map((s, i) => (
            <SRow key={i} $f={false}>
              <SOffset>{s.offset.toString(16).padStart(6,'0').toUpperCase()}</SOffset>
              <SVal $f={false}>{s.value.slice(0,120)}</SVal>
            </SRow>
          ))}
        </>
      )}
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type AppMode = 'demo' | 'scanning' | 'tool';

interface VirusCheckerProps { isRunning: boolean; speed: number; }

export default function VirusCheckerDemo({ isRunning, speed }: VirusCheckerProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const visualRef    = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef      = useRef<number>(0);
  const lastTickRef  = useRef(Date.now());
  const filesRef     = useRef<DemoFile[]>(makeDemoFiles());
  const scanIdxRef   = useRef(0);
  const activeRef    = useRef<number | null>(null);
  const quarQ        = useRef<{ id: number; at: number }[]>([]);

  const [mode,       setMode]       = useState<AppMode>('demo');
  const [result,     setResult]     = useState<ScanResult | null>(null);
  const [scanFile,   setScanFile]   = useState('');
  const [isDrag,     setIsDrag]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const fileRef      = useRef<HTMLInputElement>(null);

  // Dismiss state
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Hex / selection
  const [rawBytes,   setRawBytes]   = useState<Uint8Array | null>(null);
  const [hexOff,     setHexOff]     = useState(0);
  const [selId,      setSelId]      = useState<string | null>(null);
  const [tab,        setTab]        = useState<RightTab>('threats');

  const totalRows = useMemo(() => rawBytes ? Math.ceil(rawBytes.length / 16) : 0, [rawBytes]);

  const hexRows = useMemo(() => {
    if (!rawBytes || !result) return [];
    return buildHexRowsDynamic(rawBytes, result.detections, hexOff, HEX_ROWS_VISIBLE);
  }, [rawBytes, result, hexOff]);

  // Visible detections (minus dismissed)
  const visibleDets = useMemo(() =>
    result?.detections.filter(d => !dismissed.has(d.id)) ?? [],
    [result, dismissed]
  );

  const sevCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of visibleDets) c[d.severity] = (c[d.severity] ?? 0) + 1;
    return c;
  }, [visibleDets]);

  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

  // ── Canvas (light theme) ──────────────────────────────────────────────────
  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
    const W = c.clientWidth;
    const H = c.clientHeight;
    const targetW = Math.max(1, Math.floor(W * dpr));
    const targetH = Math.max(1, Math.floor(H * dpr));
    if (c.width !== targetW || c.height !== targetH) {
      c.width = targetW;
      c.height = targetH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(0,0,0,0.022)'; ctx.lineWidth = 1;
    for (let x=0;x<W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=0;y<H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    const fileSize = FILE_SIZE * VISUAL_SCALE;
    const fileGap = FILE_GAP * VISUAL_SCALE;
    const gW=GRID_COLS*(fileSize+fileGap)-fileGap, gH=GRID_ROWS*(fileSize+fileGap)-fileGap;
    const ox=(W-gW)/2, oy=(H-gH)/2;

    if (isRunning && scanIdxRef.current < filesRef.current.length) {
      const col=scanIdxRef.current%GRID_COLS, bx=ox+col*(fileSize+fileGap);
      const grad=ctx.createLinearGradient(bx-12,0,bx+fileSize+12,0);
      grad.addColorStop(0,'transparent'); grad.addColorStop(0.5,'rgba(59,130,246,0.06)'); grad.addColorStop(1,'transparent');
      ctx.fillStyle=grad; ctx.fillRect(bx-12,oy-4,fileSize+24,gH+8);
    }

    filesRef.current.forEach((f,i)=>{
      const col=i%GRID_COLS, row=Math.floor(i/GRID_COLS);
      const x=ox+col*(fileSize+fileGap), y=oy+row*(fileSize+fileGap);
      f.x=x; f.y=y;
      const cs=STATUS_COLORS[f.status];
      if (cs.glow!=='transparent'){ctx.shadowBlur=10;ctx.shadowColor=cs.glow;}
      ctx.fillStyle=cs.bg; ctx.strokeStyle=cs.border; ctx.lineWidth=f.id===activeRef.current?1.5:1;
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(x,y,fileSize,fileSize,Math.max(3,4*VISUAL_SCALE)); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
      if (f.status==='scanning'&&f.scanProgress>0){
        ctx.fillStyle='rgba(59,130,246,0.55)';
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(x+2*VISUAL_SCALE,y+fileSize-5*VISUAL_SCALE,(fileSize-4*VISUAL_SCALE)*f.scanProgress,3*VISUAL_SCALE,1); ctx.fill();
      }
      ctx.fillStyle=cs.text; ctx.font=`${Math.max(6, Math.round(7*VISUAL_SCALE))}px system-ui,sans-serif`; ctx.textAlign='center';
      ctx.fillText(f.extension.slice(0,4),x+fileSize/2,y+fileSize/2+3*VISUAL_SCALE);
    });
    ctx.textAlign='left';
  }, [isRunning]);

  const tick = useCallback(()=>{
    const now=Date.now(), dt=Math.min((now-lastTickRef.current)/1000,0.1);
    lastTickRef.current=now;
    const spd=Math.max(speed,0.1), files=filesRef.current;
    quarQ.current=quarQ.current.filter(({id,at})=>{
      if(now>=at){const f=files.find(f=>f.id===id);if(f)f.status='quarantined';return false;} return true;
    });
    const aid=activeRef.current;
    if(aid!==null){
      const f=files.find(f=>f.id===aid);
      if(f&&f.status==='scanning'){
        f.scanProgress=Math.min(1,f.scanProgress+SCAN_PROGRESS_RATE*spd*dt);
        if(f.scanProgress>=1){
          f.status=f.signatureMatch?'infected':'clean';
          if(f.signatureMatch)quarQ.current.push({id:f.id,at:now+QUARANTINE_DELAY_MS});
          activeRef.current=null; scanIdxRef.current++;
        }
      } else {activeRef.current=null;}
    }
    if(activeRef.current===null&&scanIdxRef.current<files.length){
      const next=files[scanIdxRef.current];
      if(next&&next.status==='unscanned'){next.status='scanning';next.scanProgress=0;activeRef.current=next.id;}
    }
    if(scanIdxRef.current>=files.length&&quarQ.current.length===0){
      setTimeout(()=>{filesRef.current=makeDemoFiles();scanIdxRef.current=0;activeRef.current=null;},1800);
    }
  },[speed]);

  const animate = useCallback(()=>{
    if(isRunning&&mode==='demo')tick();
    render();
    animRef.current=requestAnimationFrame(animate);
  },[isRunning,mode,tick,render]);

  useEffect(()=>{
    lastTickRef.current=Date.now();
    animRef.current=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(animRef.current);
  },[animate]);

  useEffect(()=>{
    const cont=visualRef.current; if(!cont) return;
    const obs=new ResizeObserver(e=>{
      const{width,height}=e[0].contentRect;
      const c=canvasRef.current;
      if(c){
        const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
        c.width = Math.max(1, Math.floor(width * dpr));
        c.height = Math.max(1, Math.floor(height * dpr));
      }
    });
    obs.observe(cont); return ()=>obs.disconnect();
  },[mode]);

  const handleFile = useCallback(async(file: File)=>{
    if(file.size>50*1024*1024){setError('File exceeds 50 MB limit.');setTimeout(()=>setError(null),4000);return;}
    setError(null); setScanFile(file.name); setMode('scanning');
    try{
      const buf=await file.arrayBuffer();
      setRawBytes(new Uint8Array(buf));
      await new Promise<void>(r=>setTimeout(r,500));
      const res=analyzeFile(buf,file.name);
      setResult(res); setHexOff(0); setSelId(null); setTab('threats');
      setDismissed(new Set());
      setMode('tool');
    }catch{
      setError('Analysis failed — file may be corrupt or unreadable.');
      setTimeout(()=>setError(null),4000); setMode('demo');
    }
  },[]);

  const handleReset=useCallback(()=>{
    setMode('demo');setResult(null);setScanFile('');setRawBytes(null);
    setHexOff(0);setSelId(null);setTab('threats');setDismissed(new Set());
    filesRef.current=makeDemoFiles();scanIdxRef.current=0;activeRef.current=null;quarQ.current=[];
  },[]);

  const handleDetClick=useCallback((d:Detection)=>{
    setSelId(prev=>prev===d.id?null:d.id);
    setHexOff(Math.max(0,Math.floor(d.byteOffset/16)-2));
    setTab('hex');
  },[]);

  const handleDismiss=useCallback((id:string,e:React.MouseEvent)=>{
    e.stopPropagation();
    setDismissed(prev=>{const n=new Set(prev);n.add(id);return n;});
    if(selId===id)setSelId(null);
  },[selId]);

  const onDragEnter=(e:React.DragEvent)=>{e.preventDefault();setIsDrag(true);};
  const onDragLeave=(e:React.DragEvent)=>{e.preventDefault();setIsDrag(false);};
  const onDragOver =(e:React.DragEvent)=>{e.preventDefault();};
  const onDrop=(e:React.DragEvent)=>{
    e.preventDefault();setIsDrag(false);
    const f=e.dataTransfer.files[0];if(f)handleFile(f);
  };

  const hexEnd=Math.max(0,Math.min((hexOff+HEX_ROWS_VISIBLE)*16,(result?.fileSize??0))-1);
  const selectedDet = result?.detections.find(d=>d.id===selId);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Root
      ref={containerRef}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Stage>

      {/* ── UPLOAD ──────────────────────────────────────────────────────── */}
      {mode==='demo' && (
        <UploadWrap>
          <UploadVisual aria-hidden="true" ref={visualRef}>
            <Canvas ref={canvasRef} $vis={true} />
          </UploadVisual>
          <UploadPanel>
            <BrandRow>
            <LogoWrap><Shield size={24} color="white" /></LogoWrap>
            <BrandTitle>File Safety Scanner</BrandTitle>
            <PrivacyPill>100% private — file never leaves your device</PrivacyPill>
          </BrandRow>

          <DropCard $drag={isDrag} htmlFor="vc-input">
            <DropIconWrap $drag={isDrag}>
              {isDrag ? <ShieldCheck size={26}/> : <Upload size={26}/>}
            </DropIconWrap>
            <DropTitle>{isDrag ? 'Release to scan' : 'Drop any file here to scan it'}</DropTitle>
            <DropSub>
              Detects malware signatures, obfuscated code, high-entropy payloads, and more.<br/>
              All file types · Max 50 MB
            </DropSub>
            <DropButton><Upload size={13}/> Browse files</DropButton>
            <input id="vc-input" ref={fileRef} type="file" style={{display:'none'}}
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value='';}}/>
          </DropCard>

          <PillRow>
            {['Signature database','Entropy analysis','Obfuscation detection','String extraction','File type check'].map(m=>(
              <Pill key={m}>{m}</Pill>
            ))}
          </PillRow>
        </UploadPanel>

        </UploadWrap>
      )}

      {/* ── SCANNING ────────────────────────────────────────────────────── */}
      {mode==='scanning' && (
        <ScanWrap>
          <SpinRing><Shield size={32}/></SpinRing>
          <ScanTitle>Scanning file…</ScanTitle>
          <ScanFile>{scanFile}</ScanFile>
          <StepList>
            {['Checking signature database','Analysing byte entropy','Detecting obfuscation','Extracting strings','Verifying file headers'].map((s,i)=>(
              <Step key={s} $d={i*0.08}>{s}</Step>
            ))}
          </StepList>
        </ScanWrap>
      )}

      {/* ── TOOL MODE ───────────────────────────────────────────────────── */}
      {mode==='tool' && result && (
        <ToolRoot>

          {/* VERDICT HEADER — full width */}
          <VerdictHeader $v={result.verdict}>
            <VerdictIconBox $v={result.verdict}>
              {result.verdict==='malicious'  && <ShieldX    size={22}/>}
              {result.verdict==='suspicious' && <ShieldAlert size={22}/>}
              {result.verdict==='clean'      && <ShieldCheck size={22}/>}
            </VerdictIconBox>

            <VerdictText>
              <VerdictTitle $v={result.verdict}>{VERDICT_TITLE[result.verdict]}</VerdictTitle>
              <VerdictRec $v={result.verdict}>{VERDICT_REC[result.verdict]}</VerdictRec>
            </VerdictText>

            <VerdictMeta>
              <FileBadge>
                <span style={{fontFamily:MONO,fontWeight:600,color:'#1e293b'}}>{result.fileName}</span>
                <span>·</span>
                <span>{fmt(result.fileSize)}</span>
                {result.magicBytesDetected && <><span>·</span><MagicChip>{result.magicBytesDetected}</MagicChip></>}
                {result.extensionMismatch  && <WarnChip>⚠ Extension mismatch</WarnChip>}
              </FileBadge>
              <RescanBtn onClick={handleReset}>
                <RotateCcw size={12}/> Scan Another File
              </RescanBtn>
            </VerdictMeta>
          </VerdictHeader>

          {/* CONTENT */}
          <ContentArea>

            {/* SIDEBAR */}
            <Sidebar>

              {/* Threat counts */}
              {visibleDets.length > 0 ? (
                <SideSection>
                  <SideLabel>Threats · {visibleDets.length} found</SideLabel>
                  {(['critical','high','medium','low','info'] as const).map(sev=>{
                    const n=sevCounts[sev]; if(!n) return null;
                    return (
                      <SevRow key={sev} $sev={sev}>
                        <SevLeft><SevDot $sev={sev}/><SevName $sev={sev}>{SEV_CONFIG[sev].label}</SevName></SevLeft>
                        <SevCount $sev={sev}>{n}</SevCount>
                      </SevRow>
                    );
                  })}
                  {dismissed.size > 0 && (
                    <div style={{fontSize:'0.62rem',color:'#94a3b8',marginTop:'0.3rem'}}>
                      {dismissed.size} finding{dismissed.size>1?'s':''} dismissed
                    </div>
                  )}
                </SideSection>
              ) : (
                <SideSection>
                  <SideLabel>Result</SideLabel>
                  <div style={{fontSize:'0.72rem',color:'#15803d',lineHeight:1.5}}>
                    {dismissed.size > 0
                      ? `All ${dismissed.size} finding${dismissed.size>1?'s':''} dismissed`
                      : 'No threats detected'}
                  </div>
                </SideSection>
              )}

              {/* File info */}
              <SideSection>
                <SideLabel>File</SideLabel>
                <SideFileName>{result.fileName}</SideFileName>
                <SideFileMeta>{fmt(result.fileSize)} · {result.scanDurationMs}ms</SideFileMeta>
              </SideSection>

              {/* File composition */}
              <SideSection>
                <SideLabel>File Composition</SideLabel>
                <RatioRow>
                  <RatioLabel>{Math.round(result.textRatio*100)}% printable</RatioLabel>
                  <RatioValue $isText={result.textRatio>0.35}>
                    {result.textRatio>0.35 ? 'Text' : 'Binary'}
                  </RatioValue>
                </RatioRow>
                <RatioBar><RatioFill $pct={result.textRatio} $isText={result.textRatio>0.35}/></RatioBar>
                {result.textRatio<=0.35 && (
                  <RatioNote>Text-pattern analysis skipped to prevent false positives on binary data.</RatioNote>
                )}
              </SideSection>

              {/* Coverage */}
              <SideSection>
                <SideLabel>Scan Methods</SideLabel>
                {[
                  'Signature database',
                  'Entropy analysis',
                  ...(result.textRatio>0.35?['Obfuscation detection','Suspicious strings']:[]),
                  'String extraction',
                  'File type verification',
                ].map(m=><CovItem key={m}>{m}</CovItem>)}
              </SideSection>

            </Sidebar>

            {/* MAIN PANEL */}
            <MainPanel>
              <TabBar>
                <Tab $a={tab==='threats'} onClick={()=>setTab('threats')}>
                  <ShieldX size={12}/>
                  Threats
                  <TabChip $alert={visibleDets.length>0&&result.verdict!=='clean'} $ok={visibleDets.length===0}>
                    {visibleDets.length}
                  </TabChip>
                </Tab>
                <Tab $a={tab==='strings'} onClick={()=>setTab('strings')}>
                  <Type size={12}/>
                  Strings
                  <TabChip $alert={result.extractedStrings.some(s=>s.flagged)}>
                    {result.extractedStrings.length}
                  </TabChip>
                </Tab>
                <Tab $a={tab==='hex'} onClick={()=>setTab('hex')}>
                  <FileText size={12}/>
                  Raw Bytes
                </Tab>
              </TabBar>

              <TabContent>

                {/* THREATS */}
                {tab==='threats' && (
                  <>
                    <ScrollArea>
                      {visibleDets.length===0 ? (
                        <Empty>
                          <ShieldCheck size={38} color="#22c55e"/>
                          <div style={{fontSize:'0.9rem',fontWeight:700,color:'#15803d'}}>
                            {dismissed.size>0 ? 'All Findings Dismissed' : 'No Threats Found'}
                          </div>
                          <div style={{fontSize:'0.74rem',color:'#64748b',lineHeight:1.6,maxWidth:260}}>
                            {dismissed.size>0
                              ? 'You have dismissed all flagged findings. Use "Restore" to review them again.'
                              : 'This file passed all checks including signature matching, entropy analysis, and file type verification.'}
                          </div>
                        </Empty>
                      ) : visibleDets.map(d=>(
                        <DetectionCard key={d.id} d={d}
                          selected={selId===d.id}
                          onSelect={()=>handleDetClick(d)}
                          onDismiss={(e)=>handleDismiss(d.id,e)}
                        />
                      ))}
                    </ScrollArea>

                    {dismissed.size > 0 && (
                      <DismissBar>
                        <span>{dismissed.size} finding{dismissed.size>1?'s':''} dismissed</span>
                        <RestoreBtn onClick={()=>setDismissed(new Set())}>
                          <RotateCcw size={9}/> Restore
                        </RestoreBtn>
                      </DismissBar>
                    )}
                  </>
                )}

                {/* STRINGS */}
                {tab==='strings' && <StringsTab strings={result.extractedStrings}/>}

                {/* HEX */}
                {tab==='hex' && (
                  <HexWrap>
                    <HexNav>
                      <NavBt $dim={hexOff<=0} disabled={hexOff<=0}
                        onClick={()=>setHexOff(o=>Math.max(0,o-HEX_ROWS_VISIBLE))}>
                        <ChevronLeft size={10}/> Prev
                      </NavBt>
                      <HexOff>
                        0x{(hexOff*16).toString(16).padStart(6,'0').toUpperCase()}
                        {' – '}
                        0x{hexEnd.toString(16).padStart(6,'0').toUpperCase()}
                      </HexOff>
                      <NavBt
                        $dim={hexOff+HEX_ROWS_VISIBLE>=totalRows}
                        disabled={hexOff+HEX_ROWS_VISIBLE>=totalRows}
                        onClick={()=>setHexOff(o=>Math.min(o+HEX_ROWS_VISIBLE,Math.max(0,totalRows-HEX_ROWS_VISIBLE)))}>
                        Next <ChevronRight size={10}/>
                      </NavBt>
                    </HexNav>

                    {selectedDet && (
                      <SelBar>
                        <span style={{color:'#64748b',fontSize:'0.63rem'}}>Viewing</span>
                        <span style={{fontWeight:600}}>{selectedDet.name}</span>
                        <span style={{marginLeft:'auto',fontFamily:MONO,fontSize:'0.61rem',color:'#475569'}}>
                          0x{selectedDet.byteOffset.toString(16).toUpperCase().padStart(4,'0')}
                        </span>
                      </SelBar>
                    )}

                    <HexScroll>{hexRows.map(r=><HexRow key={r.offset} row={r}/>)}</HexScroll>

                    <div style={{flexShrink:0,padding:'0.18rem 0.6rem',borderTop:'1px solid rgba(255,255,255,0.05)',
                      fontSize:'0.58rem',color:'#334155',textTransform:'uppercase',letterSpacing:'0.09em',
                      background:'rgba(15,23,42,0.95)'}}>
                      Entropy · 256-byte blocks
                    </div>
                    <EntropyChart blocks={result.entropyBlocks}/>
                  </HexWrap>
                )}

              </TabContent>
            </MainPanel>
          </ContentArea>
        </ToolRoot>
      )}

      </Stage>
      {error && <ErrToast>⚠ {error}</ErrToast>}
    </Root>
  );
}






