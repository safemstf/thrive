// src/components/cs/virusChecker/virusChecker.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Shield, Upload, FileText, ChevronLeft, ChevronRight, Type,
  ShieldCheck, ShieldAlert, ShieldX, X, RotateCcw, Lock, Info,
} from 'lucide-react';
import {
  analyzeFile, buildHexRowsDynamic,
  type Detection, type ScanResult, type Severity, type Verdict,
  type HexRow, type EntropyBlock, type ExtractedString,
} from './virusChecker.analysis';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const HEX_ROWS_VISIBLE = 16;
type RightTab = 'threats' | 'strings' | 'hex';

const GRID_COLS            = 16;
const GRID_ROWS            = 10;
const TOTAL_FILES          = GRID_COLS * GRID_ROWS;
const FILE_SIZE            = 40;
const FILE_GAP             = 6;
const INFECTION_RATE       = 0.09;
const SCAN_PROGRESS_RATE   = 4;
const QUARANTINE_DELAY_MS  = 600;

const FILE_EXTENSIONS = [
  '.exe', '.dll', '.js', '.py', '.pdf', '.doc',
  '.zip', '.bat', '.sh', '.bin', '.msi', '.vbs',
];
const FILE_NAMES = [
  'svchost','explorer','chrome','kernel32','ntdll','winlogon',
  'csrss','smss','lsass','wininit','services','spoolsv',
  'taskhost','rundll32','cmd','powershell','system32','regsvc',
  'update','installer','helper','launcher','loader','agent',
];
const VIRUS_SIGNATURES = [
  'EICAR.Test.File','Trojan.GenericKD.48211','W32.Blaster.Worm',
  'Ransom.WannaCry','Backdoor.NjRAT','Spyware.AgentTesla',
];

type FileStatus = 'unscanned' | 'scanning' | 'clean' | 'infected' | 'quarantined';

interface DemoFile {
  id: number;
  name: string;
  extension: string;
  status: FileStatus;
  scanProgress: number;
  signatureMatch: string | null;
  x: number;
  y: number;
}

const STATUS_COLORS: Record<FileStatus, { bg: string; border: string; glow: string; text: string }> = {
  unscanned:   { bg: 'rgba(241,245,249,0.9)',  border: 'rgba(148,163,184,0.3)',  glow: 'transparent',           text: '#94a3b8' },
  scanning:    { bg: 'rgba(59,130,246,0.08)',   border: '#3b82f6',               glow: 'rgba(59,130,246,0.2)',   text: '#3b82f6' },
  clean:       { bg: 'rgba(34,197,94,0.08)',    border: 'rgba(34,197,94,0.4)',   glow: 'transparent',           text: '#16a34a' },
  infected:    { bg: 'rgba(239,68,68,0.12)',    border: '#ef4444',               glow: 'rgba(239,68,68,0.25)',   text: '#dc2626' },
  quarantined: { bg: 'rgba(245,158,11,0.1)',    border: 'rgba(245,158,11,0.5)',  glow: 'rgba(245,158,11,0.2)',  text: '#b45309' },
};

function makeDemoFiles(): DemoFile[] {
  return Array.from({ length: TOTAL_FILES }, (_, i) => ({
    id: i,
    name: FILE_NAMES[Math.floor(Math.random() * FILE_NAMES.length)],
    extension: FILE_EXTENSIONS[Math.floor(Math.random() * FILE_EXTENSIONS.length)],
    status: 'unscanned',
    scanProgress: 0,
    signatureMatch: Math.random() < INFECTION_RATE
      ? VIRUS_SIGNATURES[Math.floor(Math.random() * VIRUS_SIGNATURES.length)]
      : null,
    x: 0,
    y: 0,
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
const pulse   = keyframes`0%,100%{opacity:1}50%{opacity:0.5}`;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const UI   = `'Inter', system-ui, -apple-system, sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', ui-monospace, monospace`;
const BORDER = 'rgba(148,163,184,0.18)';

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT / SEVERITY CONFIGS
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
  critical: { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'Critical' },
  high:     { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.2)',   label: 'High'     },
  medium:   { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)',   border: 'rgba(202,138,4,0.2)',   label: 'Medium'   },
  low:      { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)',   label: 'Low'      },
  info:     { color: '#64748b', bg: 'rgba(100,116,139,0.07)', border: 'rgba(100,116,139,0.2)', label: 'Info'     },
};

const SEV_BAR: Record<Severity, string> = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#3b82f6',
  info:     '#94a3b8',
};

const CAT_LABELS: Record<Detection['category'], string> = {
  'signature':         'Known Signature',
  'obfuscation':       'Code Obfuscation',
  'suspicious-string': 'Suspicious String',
  'entropy':           'High-Entropy Region',
  'magic-mismatch':    'File Type Mismatch',
};

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
// LAYOUT PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Root = styled.div`
  position: absolute;
  inset: 0;
  background: #f8fafc;
  font-family: ${UI};
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

/**
 * Canvas for the demo visualization.
 * Setting width/height via JS (DPR-aware), but CSS keeps it filling the parent.
 */
const VisCanvas = styled.canvas<{ $vis: boolean }>`
  position: absolute;
  inset: 0;
  display: block;
  /* Fill the parent container at CSS level; actual resolution set in JS */
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
  transition: opacity 0.4s;
  opacity: ${p => (p.$vis ? 1 : 0)};
  pointer-events: none;
  image-rendering: -webkit-optimize-contrast; /* crisp on non-retina */
`;

const Stage = styled.div`
  position: relative;
  isolation: isolate;
  z-index: 10;
  flex: 1;
  min-height: 0;
  padding: clamp(0.65rem, 1.3vw, 1.35rem);

  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const UploadWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: grid;
  /* Visualization left, panel right */
  grid-template-columns: minmax(0, 1fr) minmax(0, 480px);
  grid-template-rows: 1fr;
  gap: 1rem;
  padding: 1rem;
  animation: ${fadeIn} 0.45s ease-out;

  /* Tablet: stack vertically, visualization collapses */
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
    overflow-y: auto;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
`;

/**
 * Left: animated visualization — hidden below 840 px to save space.
 */
const UploadVisual = styled.div`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background:
    radial-gradient(circle at 18% 24%, rgba(59,130,246,0.14), transparent 38%),
    radial-gradient(circle at 80% 72%, rgba(34,197,94,0.12), transparent 34%),
    linear-gradient(180deg, rgba(248,250,252,0.4) 0%, rgba(241,245,249,0.24) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.7),
    0 16px 38px rgba(15,23,42,0.12);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.75),
      0 22px 46px rgba(15,23,42,0.14);
  }

  /* Dot-grid texture overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(circle, rgba(255,255,255,0.22) 1px, transparent 1px),
      radial-gradient(circle at 78% 22%, rgba(59,130,246,0.16), transparent 38%),
      radial-gradient(circle at 22% 76%, rgba(16,185,129,0.12), transparent 34%);
    background-size: 26px 26px, auto, auto;
    opacity: 0.45;
  }

  /* Sheen */
  &::after {
    content: '';
    position: absolute;
    top: -22%;
    left: -35%;
    width: 170%;
    height: 52%;
    transform: rotate(-11deg);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
    z-index: 0;
    pointer-events: none;
  }

  /* On mobile collapse to a thin banner */
  @media (max-width: 840px) {
    min-height: 160px;
    max-height: 200px;
  }

  @media (max-width: 480px) {
    min-height: 120px;
    max-height: 150px;
  }
`;

const UploadPanel = styled.div`
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(148,163,184,0.2);
  background: rgba(248,250,252,0.95);
  backdrop-filter: blur(2px);
  box-shadow: 0 18px 40px rgba(15,23,42,0.09);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 1.5rem;
  overflow-y: auto;

  @media (max-width: 840px) {
    gap: 1.1rem;
    padding: 1.25rem 1rem;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    gap: 0.9rem;
    padding: 1rem 0.75rem;
    border-radius: 14px;
  }
`;

const BrandRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  animation: ${fadeIn} 0.4s ease;
`;

const LogoWrap = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(59,130,246,0.32);

  @media (max-width: 480px) {
    width: 42px;
    height: 42px;
    border-radius: 11px;
  }
`;

const BrandTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const PrivacyPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(22,163,74,0.08);
  border: 1px solid rgba(22,163,74,0.2);
  border-radius: 999px;
  padding: 0.15rem 0.75rem 0.15rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 500;
  color: #15803d;

  &::before {
    content: '●';
    font-size: 0.42rem;
    color: #22c55e;
  }
`;

const DropCard = styled.label<{ $drag: boolean }>`
  width: 100%;
  max-width: 480px;
  background: ${p => (p.$drag ? 'rgba(59,130,246,0.03)' : 'white')};
  border: 2px dashed ${p => (p.$drag ? '#3b82f6' : 'rgba(148,163,184,0.4)')};
  border-radius: 20px;
  box-shadow: ${p =>
    p.$drag
      ? '0 0 0 6px rgba(59,130,246,0.06), 0 12px 40px rgba(15,23,42,0.08)'
      : '0 10px 34px rgba(15,23,42,0.07)'};
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.4s ease 0.1s both;

  &:hover {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 8px 32px rgba(15,23,42,0.08);
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
    border-radius: 14px;
    gap: 0.6rem;
  }
`;

const DropIconWrap = styled.div<{ $drag: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: ${p => (p.$drag ? 'rgba(59,130,246,0.1)' : '#f1f5f9')};
  border: 1px solid ${p => (p.$drag ? 'rgba(59,130,246,0.25)' : BORDER)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => (p.$drag ? '#3b82f6' : '#64748b')};
  transition: all 0.2s;

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    border-radius: 11px;
  }
`;

const DropTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
`;

const DropSub = styled.div`
  font-size: 0.74rem;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
`;

const DropButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 8px 22px rgba(59,130,246,0.32);
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  max-width: 480px;
  animation: ${fadeIn} 0.4s ease 0.18s both;
`;

const Pill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  border: 1px solid ${BORDER};
  background: white;
  font-size: 0.66rem;
  color: #64748b;

  &::before {
    content: '✓';
    color: #22c55e;
    font-weight: 800;
    font-size: 0.58rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SCANNING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const ScanWrap = styled.div`
  position: absolute;
  inset: 0;
  z-index: 30;
  border-radius: 18px;
  border: 1px solid rgba(148,163,184,0.2);
  background: rgba(248,250,252,0.97);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  animation: ${fadeIn} 0.25s ease;
`;

const SpinRing = styled.div`
  animation: ${spin} 1.1s linear infinite;
  color: #3b82f6;
  display: flex;
`;

const ScanTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
`;

const ScanFile = styled.div`
  font-size: 0.72rem;
  color: #64748b;
  font-family: ${MONO};
  background: white;
  border: 1px solid ${BORDER};
  border-radius: 7px;
  padding: 0.28rem 0.65rem;
  max-width: min(280px, 80vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.26rem;
  background: white;
  border: 1px solid ${BORDER};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  min-width: min(240px, 80vw);
`;

const Step = styled.div<{ $d: number }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: #64748b;
  animation: ${stepIn} 0.3s ease ${p => p.$d}s both;

  &::before {
    content: '✓';
    color: #22c55e;
    font-weight: 800;
    font-size: 0.63rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TOOL MODE — outer shell
// ─────────────────────────────────────────────────────────────────────────────
const ToolRoot = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(148,163,184,0.2);
  box-shadow: 0 16px 40px rgba(15,23,42,0.08);
  background: #f8fafc;
  animation: ${slideIn} 0.3s ease;
`;

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT HEADER
// ─────────────────────────────────────────────────────────────────────────────
const VerdictHeader = styled.div<{ $v: Verdict }>`
  flex-shrink: 0;
  background: ${p => VERDICT_CONFIG[p.$v].gradient};
  border-bottom: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  padding: 0.9rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
  row-gap: 0.5rem;

  @media (max-width: 600px) {
    padding: 0.75rem 0.9rem;
  }
`;

const VerdictIconBox = styled.div<{ $v: Verdict }>`
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 11px;
  background: ${p => VERDICT_CONFIG[p.$v].iconBg};
  border: 1px solid ${p => VERDICT_CONFIG[p.$v].border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => VERDICT_CONFIG[p.$v].iconFg};

  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
  }
`;

const VerdictText = styled.div`
  flex: 1;
  min-width: 0;
`;

const VerdictTitle = styled.div<{ $v: Verdict }>`
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${p => VERDICT_CONFIG[p.$v].title};
`;

const VerdictRec = styled.div<{ $v: Verdict }>`
  font-size: 0.72rem;
  color: ${p => VERDICT_CONFIG[p.$v].subtext};
  margin-top: 0.15rem;
  line-height: 1.5;
`;

const VerdictMeta = styled.div`
  flex-shrink: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;

  /* On very small screens, push to its own row */
  @media (max-width: 540px) {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
`;

const FileBadge = styled.div`
  font-size: 0.68rem;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 540px) {
    justify-content: flex-start;
  }
`;

const MagicChip = styled.span`
  background: rgba(59,130,246,0.07);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 999px;
  padding: 0.06rem 0.45rem;
  font-size: 0.62rem;
  color: #3b82f6;
  font-weight: 600;
`;

const WarnChip = styled.span`
  background: rgba(234,88,12,0.08);
  border: 1px solid rgba(234,88,12,0.2);
  border-radius: 999px;
  padding: 0.06rem 0.45rem;
  font-size: 0.62rem;
  color: #ea580c;
  font-weight: 600;
`;

const RescanBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.38rem 0.85rem;
  border-radius: 9px;
  border: 1px solid ${BORDER};
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  font-family: ${UI};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: white;
    color: #1e293b;
    border-color: rgba(148,163,184,0.4);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT AREA (below header)
// ─────────────────────────────────────────────────────────────────────────────
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f1f5f9;

  /* Stack at medium width */
  @media (max-width: 900px) {
    flex-direction: column;
    overflow-y: auto;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;
    gap: 0.5rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = styled.div`
  flex-shrink: 0;
  width: min(260px, 28vw);
  background: white;
  border: 1px solid ${BORDER};
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 900px) {
    width: 100%;
    flex-shrink: 0;
    /* Show as horizontal scrollable row of sections on small screens */
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: unset;
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }

  &::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.3);
    border-radius: 2px;
  }
`;

const SideSection = styled.div`
  padding: 0.65rem 0.9rem;
  border-bottom: 1px solid rgba(241,245,249,1);
  flex-shrink: 0;

  @media (max-width: 900px) {
    border-bottom: none;
    border-right: 1px solid rgba(241,245,249,1);
    min-width: 140px;
  }

  @media (max-width: 600px) {
    border-right: none;
    border-bottom: 1px solid rgba(241,245,249,1);
    flex: 1;
    min-width: 120px;
  }
`;

const SideLabel = styled.div`
  font-size: 0.57rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.4rem;
`;

const SevRow = styled.div<{ $sev: Severity }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.18rem 0;
`;

const SevLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.38rem;
`;

const SevDot = styled.div<{ $sev: Severity }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => SEV_BAR[p.$sev]};
`;

const SevName  = styled.span<{ $sev: Severity }>`font-size: 0.71rem; color: ${p => SEV_CONFIG[p.$sev].color};`;
const SevCount = styled.span<{ $sev: Severity }>`font-size: 0.78rem; font-weight: 700; color: ${p => SEV_CONFIG[p.$sev].color};`;

const RatioRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.28rem;
`;

const RatioLabel = styled.span`font-size: 0.69rem; color: #64748b;`;
const RatioValue = styled.span<{ $isText: boolean }>`
  font-size: 0.69rem;
  font-weight: 600;
  color: ${p => (p.$isText ? '#15803d' : '#b45309')};
`;

const RatioBar = styled.div`height: 4px; border-radius: 999px; background: #f1f5f9; overflow: hidden;`;
const RatioFill = styled.div<{ $pct: number; $isText: boolean }>`
  height: 100%;
  border-radius: 999px;
  width: ${p => Math.min(100, Math.round(p.$pct * 100))}%;
  background: ${p => (p.$isText ? '#22c55e' : '#f59e0b')};
`;
const RatioNote = styled.div`font-size: 0.6rem; color: #94a3b8; margin-top: 0.18rem; line-height: 1.5;`;

const CovItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.68rem;
  color: #64748b;
  padding: 0.08rem 0;

  &::before {
    content: '✓';
    color: #22c55e;
    font-weight: 800;
    font-size: 0.58rem;
    flex-shrink: 0;
  }
`;

const SideFileName = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-all;
  font-family: ${MONO};
  line-height: 1.4;
`;

const SideFileMeta = styled.div`font-size: 0.65rem; color: #64748b; margin-top: 0.12rem;`;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL (right side)
// ─────────────────────────────────────────────────────────────────────────────
const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  background: white;
  border: 1px solid ${BORDER};
  border-radius: 13px;

  /* On mobile stacked layout give it a min-height so tabs are visible */
  @media (max-width: 900px) {
    min-height: 420px;
  }

  @media (max-width: 480px) {
    min-height: 360px;
    border-radius: 11px;
  }
`;

const TabBar = styled.div`
  flex-shrink: 0;
  padding: 0 0.9rem;
  border-bottom: 1px solid ${BORDER};
  background: #fafbfc;
  display: flex;
  align-items: flex-end;
  gap: 0;
  overflow-x: auto;

  &::-webkit-scrollbar { height: 0; }
`;

const Tab = styled.button<{ $a: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.65rem 0.85rem 0.45rem;
  border: none;
  border-bottom: 2px solid ${p => (p.$a ? '#3b82f6' : 'transparent')};
  background: transparent;
  color: ${p => (p.$a ? '#1e293b' : '#64748b')};
  font-size: 0.73rem;
  font-weight: ${p => (p.$a ? '600' : '400')};
  font-family: ${UI};
  cursor: pointer;
  transition: color 0.15s;
  white-space: nowrap;

  &:hover { color: #1e293b; }
`;

const TabChip = styled.span<{ $alert?: boolean; $ok?: boolean }>`
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.06rem 0.36rem;
  border-radius: 999px;
  background: ${p =>
    p.$alert ? 'rgba(220,38,38,0.08)' : p.$ok ? 'rgba(22,163,74,0.08)' : '#f1f5f9'};
  color: ${p =>
    p.$alert ? '#dc2626' : p.$ok ? '#15803d' : '#64748b'};
`;

const TabContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

// ─────────────────────────────────────────────────────────────────────────────
// THREATS TAB
// ─────────────────────────────────────────────────────────────────────────────
const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 2px; }
`;

const DismissBar = styled.div`
  flex-shrink: 0;
  padding: 0.4rem 0.75rem;
  border-top: 1px solid ${BORDER};
  background: #fafbfc;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.67rem;
  color: #64748b;
`;

const RestoreBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.22rem;
  padding: 0.14rem 0.48rem;
  border-radius: 6px;
  border: 1px solid ${BORDER};
  background: white;
  color: #3b82f6;
  font-size: 0.63rem;
  font-weight: 600;
  font-family: ${UI};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(59,130,246,0.05);
    border-color: rgba(59,130,246,0.25);
  }
`;

const Card = styled.div<{ $sev: Severity; $sel: boolean }>`
  display: flex;
  border-radius: 11px;
  border: 1px solid ${p =>
    p.$sel
      ? p.$sev === 'critical' || p.$sev === 'high'
        ? 'rgba(239,68,68,0.35)'
        : p.$sev === 'medium'
        ? 'rgba(234,179,8,0.35)'
        : 'rgba(59,130,246,0.3)'
      : BORDER};
  background: ${p => (p.$sel ? '#fafbff' : 'white')};
  box-shadow: ${p =>
    p.$sel
      ? '0 2px 12px rgba(15,23,42,0.06)'
      : '0 1px 3px rgba(15,23,42,0.04)'};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  animation: ${fadeUp} 0.2s ease both;

  &:hover { box-shadow: 0 6px 16px rgba(15,23,42,0.07); }
`;

const CardBar = styled.div<{ $sev: Severity }>`
  width: 3px;
  flex-shrink: 0;
  background: ${p => SEV_BAR[p.$sev]};
`;

const CardBody = styled.div`flex: 1; padding: 0.6rem 0.75rem; min-width: 0;`;
const CardHead = styled.div`display: flex; align-items: flex-start; gap: 0.4rem; margin-bottom: 0.15rem; flex-wrap: wrap;`;
const CardName = styled.div`flex: 1; font-size: 0.75rem; font-weight: 600; color: #1e293b; line-height: 1.35; word-break: break-word; min-width: 100px;`;

const SevBadge = styled.span<{ $sev: Severity }>`
  flex-shrink: 0;
  font-size: 0.54rem;
  font-weight: 700;
  padding: 0.09rem 0.4rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  background: ${p => SEV_CONFIG[p.$sev].bg};
  color: ${p => SEV_CONFIG[p.$sev].color};
  border: 1px solid ${p => SEV_CONFIG[p.$sev].border};
`;

const HexHint = styled.span`
  flex-shrink: 0;
  font-size: 0.56rem;
  color: #94a3b8;
  font-family: ${MONO};
  background: #f8fafc;
  border: 1px solid ${BORDER};
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
`;

const DismissBtn = styled.button`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  padding: 0;

  &:hover {
    background: rgba(239,68,68,0.08);
    color: #dc2626;
  }
`;

const CatTag   = styled.div`font-size: 0.59rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;`;
const ExplText = styled.div`font-size: 0.7rem; color: #475569; line-height: 1.6; margin-bottom: 0.32rem;`;

const Evidence = styled.pre`
  font-size: 0.6rem;
  color: #64748b;
  font-family: ${MONO};
  background: #f8fafc;
  border: 1px solid ${BORDER};
  border-radius: 6px;
  padding: 0.35rem 0.48rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 0.2rem;
  max-height: 3.5rem;
  overflow: hidden;
`;

const DecodedHead = styled.div`
  font-size: 0.57rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.1rem;
`;

const DecodedPre = styled.pre`
  font-size: 0.6rem;
  color: #b45309;
  font-family: ${MONO};
  background: rgba(245,158,11,0.05);
  border: 1px solid rgba(245,158,11,0.18);
  border-radius: 6px;
  padding: 0.35rem 0.48rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  max-height: 3.5rem;
  overflow: hidden;
`;

const Empty = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
`;

// ─────────────────────────────────────────────────────────────────────────────
// STRINGS TAB
// ─────────────────────────────────────────────────────────────────────────────
const GLabel = styled.div`
  font-size: 0.57rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 0.25rem 0.38rem 0.1rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.1rem;
`;

const SRow = styled.div<{ $f: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.11rem 0.38rem;
  border-radius: 5px;
  margin-bottom: 0.06rem;
  background: ${p => (p.$f ? 'rgba(245,158,11,0.04)' : 'transparent')};
  border: 1px solid ${p => (p.$f ? 'rgba(245,158,11,0.14)' : 'transparent')};
  font-size: 0.6rem;
  line-height: 1.55;
`;

const SOffset = styled.span`color: #94a3b8; flex-shrink: 0; min-width: 50px; font-family: ${MONO}; font-size: 0.57rem;`;
const SVal    = styled.span<{ $f: boolean }>`color: ${p => (p.$f ? '#b45309' : '#64748b')}; word-break: break-all; flex: 1;`;
const SReason = styled.span`
  color: white;
  font-size: 0.54rem;
  flex-shrink: 0;
  background: #f59e0b;
  border-radius: 4px;
  padding: 0.03rem 0.3rem;
  font-weight: 700;
`;

// ─────────────────────────────────────────────────────────────────────────────
// HEX TAB
// ─────────────────────────────────────────────────────────────────────────────
const HexWrap   = styled.div`flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; background: #0f172a;`;
const HexNav    = styled.div`flex-shrink: 0; padding: 0.25rem 0.65rem; display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(15,23,42,0.95);`;
const NavBt     = styled.button<{ $dim?: boolean }>`
  padding: 0.16rem 0.48rem;
  border-radius: 5px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(30,41,59,0.7);
  color: ${p => (p.$dim ? '#1e3a5f' : '#64748b')};
  font-size: 0.61rem;
  font-family: ${UI};
  cursor: ${p => (p.$dim ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 0.16rem;
  transition: all 0.15s;

  &:hover:not([disabled]) {
    background: rgba(59,130,246,0.15);
    color: #93c5fd;
  }
`;
const HexOff    = styled.span`flex: 1; text-align: center; font-size: 0.58rem; color: #475569; font-family: ${MONO};`;
const SelBar    = styled.div`flex-shrink: 0; padding: 0.22rem 0.65rem; background: rgba(59,130,246,0.08); border-bottom: 1px solid rgba(59,130,246,0.15); font-size: 0.64rem; color: #60a5fa; display: flex; align-items: center; gap: 0.38rem;`;

const HexScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 0.22rem 0.45rem;

  &::-webkit-scrollbar { width: 3px; height: 3px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
`;

const HexRw   = styled.div`display: flex; align-items: center; gap: 0.24rem; line-height: 1.7; font-size: 0.58rem; &:hover{background:rgba(255,255,255,0.02)}`;
const HexAddr = styled.span`color: #1e3a5f; min-width: 46px; flex-shrink: 0; user-select: none; font-family: ${MONO};`;
const HexBG   = styled.span`display: flex; gap: 0.14rem; font-family: ${MONO};`;

const HexByte = styled.span<{ $c?: 'red' | 'amber' | 'blue' }>`
  color: ${p => (p.$c === 'red' ? '#fca5a5' : p.$c === 'amber' ? '#fcd34d' : p.$c === 'blue' ? '#93c5fd' : '#334155')};
  background: ${p =>
    p.$c === 'red' ? 'rgba(239,68,68,0.18)' :
    p.$c === 'amber' ? 'rgba(245,158,11,0.14)' :
    p.$c === 'blue' ? 'rgba(59,130,246,0.14)' : 'transparent'};
  border-radius: 2px;
  padding: 0 1px;
  min-width: 14px;
  text-align: center;
`;

const AsciiG  = styled.span`color: #334155; padding-left: 0.28rem; border-left: 1px solid rgba(255,255,255,0.05); font-family: ${MONO}; font-size: 0.55rem;`;
const AsciiC  = styled.span<{ $c?: 'red' | 'amber' | 'blue' }>`color: ${p => (p.$c === 'red' ? '#f87171' : p.$c === 'amber' ? '#fbbf24' : p.$c === 'blue' ? '#60a5fa' : '#334155')};`;

const EntWrap   = styled.div`flex-shrink: 0; padding: 0.22rem 0.55rem 0.3rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(15,23,42,0.95);`;
const EntLegend = styled.div`display: flex; gap: 0.65rem; font-size: 0.57rem; color: #475569; margin-bottom: 0.16rem;`;
const LDot      = styled.span<{ $c: string }>`&::before{content:'●';color:${p => p.$c};margin-right:0.18rem;}`;

const ErrToast = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px;
  color: #b91c1c;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  box-shadow: 0 4px 16px rgba(239,68,68,0.1);
  z-index: 40;
  animation: ${fadeIn} 0.3s ease;
  white-space: nowrap;
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function DetectionCard({
  d,
  selected,
  onSelect,
  onDismiss,
}: {
  d: Detection;
  selected: boolean;
  onSelect: () => void;
  onDismiss: (e: React.MouseEvent) => void;
}) {
  return (
    <Card $sev={d.severity} $sel={selected} onClick={onSelect}>
      <CardBar $sev={d.severity} />
      <CardBody>
        <CardHead>
          <CardName>{d.name}</CardName>
          <SevBadge $sev={d.severity}>{d.severity}</SevBadge>
          <HexHint>0x{d.byteOffset.toString(16).toUpperCase().padStart(4, '0')}</HexHint>
          <DismissBtn title="Dismiss this finding" onClick={onDismiss}>
            <X size={10} />
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

function HexRowView({ row }: { row: HexRow }) {
  const cm = new Map<number, 'red' | 'amber' | 'blue'>();
  for (const h of row.highlightRanges) cm.set(h.col, h.color);
  return (
    <HexRw>
      <HexAddr>{row.offset.toString(16).padStart(6, '0').toUpperCase()}</HexAddr>
      <HexBG>
        {row.bytes.map((b, col) => (
          <HexByte key={col} $c={cm.get(col)}>
            {b < 0 ? '  ' : b.toString(16).padStart(2, '0').toUpperCase()}
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
  const H = 36;
  const W = 100;
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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: H, display: 'block' }}
      >
        <line x1={0} y1={H - (7.2 / 8) * H} x2={W} y2={H - (7.2 / 8) * H}
          stroke="#f59e0b" strokeWidth="0.3" strokeDasharray="1,1" />
        <line x1={0} y1={H - (7.8 / 8) * H} x2={W} y2={H - (7.8 / 8) * H}
          stroke="#ef4444" strokeWidth="0.3" strokeDasharray="1,1" />
        {blocks.map((b, i) => (
          <rect
            key={i}
            x={i * bw}
            y={H - (b.entropy / 8) * H}
            width={Math.max(bw - 0.2, 0.5)}
            height={(b.entropy / 8) * H}
            fill={color(b.entropy)}
            opacity={0.85}
          />
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
          <Info size={22} color="#94a3b8" />
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>No printable strings extracted</span>
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
              <SOffset>{s.offset.toString(16).padStart(6, '0').toUpperCase()}</SOffset>
              <SVal $f>{s.value.slice(0, 120)}</SVal>
              {s.reason && <SReason>{s.reason}</SReason>}
            </SRow>
          ))}
          <div style={{ height: '0.5rem' }} />
        </>
      )}
      {normal.length > 0 && (
        <>
          <GLabel>All Strings ({normal.length})</GLabel>
          {normal.map((s, i) => (
            <SRow key={i} $f={false}>
              <SOffset>{s.offset.toString(16).padStart(6, '0').toUpperCase()}</SOffset>
              <SVal $f={false}>{s.value.slice(0, 120)}</SVal>
            </SRow>
          ))}
        </>
      )}
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS RENDERING HELPERS
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Resolves the device pixel ratio, clamped to a sane range.
 * This ensures the canvas is rendered at native resolution on HiDPI screens.
 */
function getDpr(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(Math.max(window.devicePixelRatio ?? 1, 1), 3);
}

/**
 * Resizes a canvas to fill its CSS layout box at full DPR resolution.
 * Returns true when the canvas was actually resized.
 */
function syncCanvasSize(canvas: HTMLCanvasElement): boolean {
  const dpr = getDpr();
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  const wantW = Math.max(1, Math.round(cssW * dpr));
  const wantH = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== wantW || canvas.height !== wantH) {
    canvas.width  = wantW;
    canvas.height = wantH;
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type AppMode = 'demo' | 'scanning' | 'tool';

interface VirusCheckerProps {
  isRunning: boolean;
  speed: number;
}

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

  const [mode,     setMode]     = useState<AppMode>('demo');
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [scanFile, setScanFile] = useState('');
  const [isDrag,   setIsDrag]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [rawBytes,  setRawBytes]  = useState<Uint8Array | null>(null);
  const [hexOff,    setHexOff]    = useState(0);
  const [selId,     setSelId]     = useState<string | null>(null);
  const [tab,       setTab]       = useState<RightTab>('threats');

  const totalRows = useMemo(
    () => (rawBytes ? Math.ceil(rawBytes.length / 16) : 0),
    [rawBytes],
  );

  const hexRows = useMemo(() => {
    if (!rawBytes || !result) return [];
    return buildHexRowsDynamic(rawBytes, result.detections, hexOff, HEX_ROWS_VISIBLE);
  }, [rawBytes, result, hexOff]);

  const visibleDets = useMemo(
    () => result?.detections.filter(d => !dismissed.has(d.id)) ?? [],
    [result, dismissed],
  );

  const sevCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of visibleDets) c[d.severity] = (c[d.severity] ?? 0) + 1;
    return c;
  }, [visibleDets]);

  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1_048_576).toFixed(2)} MB`;

  // ── Canvas render ───────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure the backing store matches the CSS size at full DPR.
    syncCanvasSize(canvas);

    const dpr  = getDpr();
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // Scale context so all drawing coordinates are in CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cssW, cssH);

    // Subtle grid
    ctx.strokeStyle = 'rgba(0,0,0,0.022)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < cssW; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssH); ctx.stroke(); }
    for (let y = 0; y < cssH; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssW, y); ctx.stroke(); }

    // --- Compute scale so the grid fits the canvas with comfortable margins ---
    const baseGridW  = GRID_COLS * (FILE_SIZE + FILE_GAP) - FILE_GAP;
    const baseGridH  = GRID_ROWS * (FILE_SIZE + FILE_GAP) - FILE_GAP;
    const margin     = 0.88; // use 88% of available space
    const fitScaleW  = (cssW * margin) / baseGridW;
    const fitScaleH  = (cssH * margin) / baseGridH;
    // Never scale *up* beyond a natural 1× pixel density, but always scale down to fit.
    const drawScale  = Math.min(1.0, fitScaleW, fitScaleH);

    const fileSize = FILE_SIZE * drawScale;
    const fileGap  = FILE_GAP  * drawScale;
    const gW = GRID_COLS * (fileSize + fileGap) - fileGap;
    const gH = GRID_ROWS * (fileSize + fileGap) - fileGap;

    // Clamp origin so the grid is never clipped
    const pad = 6;
    const ox  = Math.max(pad, Math.min(cssW - gW - pad, (cssW - gW) / 2));
    const oy  = Math.max(pad, Math.min(cssH - gH - pad, (cssH - gH) / 2));

    // Scanning column highlight
    if (isRunning && scanIdxRef.current < filesRef.current.length) {
      const col = scanIdxRef.current % GRID_COLS;
      const bx  = ox + col * (fileSize + fileGap);
      const grad = ctx.createLinearGradient(bx - 12, 0, bx + fileSize + 12, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(59,130,246,0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - 12, oy - 4, fileSize + 24, gH + 8);
    }

    // Draw files
    ctx.save();
    filesRef.current.forEach((f, i) => {
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);
      const x   = ox + col * (fileSize + fileGap);
      const y   = oy + row * (fileSize + fileGap);
      f.x = x;
      f.y = y;

      const cs = STATUS_COLORS[f.status];

      if (cs.glow !== 'transparent') {
        ctx.shadowBlur  = 10;
        ctx.shadowColor = cs.glow;
      }

      ctx.fillStyle   = cs.bg;
      ctx.strokeStyle = cs.border;
      ctx.lineWidth   = f.id === activeRef.current ? 1.5 : 1;

      ctx.beginPath();
      // @ts-ignore — roundRect is widely supported in modern browsers
      ctx.roundRect(x, y, fileSize, fileSize, Math.max(3, 4 * drawScale));
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Progress bar for scanning files
      if (f.status === 'scanning' && f.scanProgress > 0) {
        ctx.fillStyle = 'rgba(59,130,246,0.55)';
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(
          x + 2 * drawScale,
          y + fileSize - 5 * drawScale,
          (fileSize - 4 * drawScale) * f.scanProgress,
          3 * drawScale,
          1,
        );
        ctx.fill();
      }

      // Extension label — clamped font size for crisp text
      const fontSize = Math.max(7, Math.round(7.5 * drawScale));
      ctx.fillStyle  = cs.text;
      ctx.font       = `600 ${fontSize}px ${UI}`;
      ctx.textAlign  = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.extension.slice(0, 4), x + fileSize / 2, y + fileSize / 2);
    });
    ctx.restore();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
  }, [isRunning]);

  // ── Simulation tick ─────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const now  = Date.now();
    const dt   = Math.min((now - lastTickRef.current) / 1000, 0.1);
    lastTickRef.current = now;

    const spd   = Math.max(speed, 0.1);
    const files = filesRef.current;

    // Process quarantine queue
    quarQ.current = quarQ.current.filter(({ id, at }) => {
      if (now >= at) {
        const f = files.find(f => f.id === id);
        if (f) f.status = 'quarantined';
        return false;
      }
      return true;
    });

    // Advance active scan
    const aid = activeRef.current;
    if (aid !== null) {
      const f = files.find(f => f.id === aid);
      if (f && f.status === 'scanning') {
        f.scanProgress = Math.min(1, f.scanProgress + SCAN_PROGRESS_RATE * spd * dt);
        if (f.scanProgress >= 1) {
          f.status = f.signatureMatch ? 'infected' : 'clean';
          if (f.signatureMatch) quarQ.current.push({ id: f.id, at: now + QUARANTINE_DELAY_MS });
          activeRef.current = null;
          scanIdxRef.current++;
        }
      } else {
        activeRef.current = null;
      }
    }

    // Start next scan
    if (activeRef.current === null && scanIdxRef.current < files.length) {
      const next = files[scanIdxRef.current];
      if (next && next.status === 'unscanned') {
        next.status       = 'scanning';
        next.scanProgress = 0;
        activeRef.current = next.id;
      }
    }

    // Reset after completion
    if (scanIdxRef.current >= files.length && quarQ.current.length === 0) {
      setTimeout(() => {
        filesRef.current   = makeDemoFiles();
        scanIdxRef.current = 0;
        activeRef.current  = null;
      }, 1800);
    }
  }, [speed]);

  const animate = useCallback(() => {
    if (isRunning && mode === 'demo') tick();
    render();
    animRef.current = requestAnimationFrame(animate);
  }, [isRunning, mode, tick, render]);

  useEffect(() => {
    lastTickRef.current = Date.now();
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  // Resize observer — triggers a re-render whenever the visual container changes size
  useEffect(() => {
    const cont = visualRef.current;
    if (!cont) return;
    const obs = new ResizeObserver(() => {
      // syncCanvasSize + a render will happen on the next animation frame automatically.
      // We just need to trigger that path if the animation loop is paused.
      if (!isRunning || mode !== 'demo') render();
    });
    obs.observe(cont);
    return () => obs.disconnect();
  }, [mode, isRunning, render]);

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds 50 MB limit.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setError(null);
    setScanFile(file.name);
    setMode('scanning');
    try {
      const buf = await file.arrayBuffer();
      setRawBytes(new Uint8Array(buf));
      await new Promise<void>(r => setTimeout(r, 500));
      const res = analyzeFile(buf, file.name);
      setResult(res);
      setHexOff(0);
      setSelId(null);
      setTab('threats');
      setDismissed(new Set());
      setMode('tool');
    } catch {
      setError('Analysis failed — file may be corrupt or unreadable.');
      setTimeout(() => setError(null), 4000);
      setMode('demo');
    }
  }, []);

  const handleReset = useCallback(() => {
    setMode('demo');
    setResult(null);
    setScanFile('');
    setRawBytes(null);
    setHexOff(0);
    setSelId(null);
    setTab('threats');
    setDismissed(new Set());
    filesRef.current   = makeDemoFiles();
    scanIdxRef.current = 0;
    activeRef.current  = null;
    quarQ.current      = [];
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

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDrag(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDrag(false); };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const hexEnd      = Math.max(0, Math.min((hexOff + HEX_ROWS_VISIBLE) * 16, (result?.fileSize ?? 0)) - 1);
  const selectedDet = result?.detections.find(d => d.id === selId);

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
        {mode === 'demo' && (
          <UploadWrap>
            <UploadVisual aria-hidden="true" ref={visualRef}>
              <VisCanvas ref={canvasRef} $vis={true} />
            </UploadVisual>

            <UploadPanel>
              <BrandRow>
                <LogoWrap><Shield size={22} color="white" /></LogoWrap>
                <BrandTitle>File Safety Scanner</BrandTitle>
                <PrivacyPill>100% private — file never leaves your device</PrivacyPill>
              </BrandRow>

              <DropCard $drag={isDrag} htmlFor="vc-input">
                <DropIconWrap $drag={isDrag}>
                  {isDrag ? <ShieldCheck size={24} /> : <Upload size={24} />}
                </DropIconWrap>
                <DropTitle>{isDrag ? 'Release to scan' : 'Drop any file here to scan it'}</DropTitle>
                <DropSub>
                  Detects malware signatures, obfuscated code, high-entropy payloads, and more.<br />
                  All file types · Max 50 MB
                </DropSub>
                <DropButton><Upload size={12} /> Browse files</DropButton>
                <input
                  id="vc-input"
                  ref={fileRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = '';
                  }}
                />
              </DropCard>

              <PillRow>
                {[
                  'Signature database',
                  'Entropy analysis',
                  'Obfuscation detection',
                  'String extraction',
                  'File type check',
                ].map(m => (
                  <Pill key={m}>{m}</Pill>
                ))}
              </PillRow>
            </UploadPanel>
          </UploadWrap>
        )}

        {/* ── SCANNING ────────────────────────────────────────────────────── */}
        {mode === 'scanning' && (
          <ScanWrap>
            <SpinRing><Shield size={30} /></SpinRing>
            <ScanTitle>Scanning file…</ScanTitle>
            <ScanFile>{scanFile}</ScanFile>
            <StepList>
              {[
                'Checking signature database',
                'Analysing byte entropy',
                'Detecting obfuscation',
                'Extracting strings',
                'Verifying file headers',
              ].map((s, i) => (
                <Step key={s} $d={i * 0.08}>{s}</Step>
              ))}
            </StepList>
          </ScanWrap>
        )}

        {/* ── TOOL MODE ───────────────────────────────────────────────────── */}
        {mode === 'tool' && result && (
          <ToolRoot>
            {/* Full-width verdict header */}
            <VerdictHeader $v={result.verdict}>
              <VerdictIconBox $v={result.verdict}>
                {result.verdict === 'malicious'  && <ShieldX     size={20} />}
                {result.verdict === 'suspicious' && <ShieldAlert size={20} />}
                {result.verdict === 'clean'      && <ShieldCheck size={20} />}
              </VerdictIconBox>

              <VerdictText>
                <VerdictTitle $v={result.verdict}>{VERDICT_TITLE[result.verdict]}</VerdictTitle>
                <VerdictRec   $v={result.verdict}>{VERDICT_REC[result.verdict]}</VerdictRec>
              </VerdictText>

              <VerdictMeta>
                <FileBadge>
                  <span style={{ fontFamily: MONO, fontWeight: 600, color: '#1e293b' }}>
                    {result.fileName}
                  </span>
                  <span>·</span>
                  <span>{fmt(result.fileSize)}</span>
                  {result.magicBytesDetected && (
                    <><span>·</span><MagicChip>{result.magicBytesDetected}</MagicChip></>
                  )}
                  {result.extensionMismatch && (
                    <WarnChip>⚠ Extension mismatch</WarnChip>
                  )}
                </FileBadge>
                <RescanBtn onClick={handleReset}>
                  <RotateCcw size={11} /> Scan Another File
                </RescanBtn>
              </VerdictMeta>
            </VerdictHeader>

            {/* Content area */}
            <ContentArea>
              {/* Sidebar */}
              <Sidebar>
                {/* Threat counts */}
                {visibleDets.length > 0 ? (
                  <SideSection>
                    <SideLabel>Threats · {visibleDets.length} found</SideLabel>
                    {(['critical', 'high', 'medium', 'low', 'info'] as const).map(sev => {
                      const n = sevCounts[sev];
                      if (!n) return null;
                      return (
                        <SevRow key={sev} $sev={sev}>
                          <SevLeft>
                            <SevDot $sev={sev} />
                            <SevName $sev={sev}>{SEV_CONFIG[sev].label}</SevName>
                          </SevLeft>
                          <SevCount $sev={sev}>{n}</SevCount>
                        </SevRow>
                      );
                    })}
                    {dismissed.size > 0 && (
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.28rem' }}>
                        {dismissed.size} finding{dismissed.size > 1 ? 's' : ''} dismissed
                      </div>
                    )}
                  </SideSection>
                ) : (
                  <SideSection>
                    <SideLabel>Result</SideLabel>
                    <div style={{ fontSize: '0.7rem', color: '#15803d', lineHeight: 1.5 }}>
                      {dismissed.size > 0
                        ? `All ${dismissed.size} finding${dismissed.size > 1 ? 's' : ''} dismissed`
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

                {/* Composition */}
                <SideSection>
                  <SideLabel>Composition</SideLabel>
                  <RatioRow>
                    <RatioLabel>{Math.round(result.textRatio * 100)}% printable</RatioLabel>
                    <RatioValue $isText={result.textRatio > 0.35}>
                      {result.textRatio > 0.35 ? 'Text' : 'Binary'}
                    </RatioValue>
                  </RatioRow>
                  <RatioBar>
                    <RatioFill $pct={result.textRatio} $isText={result.textRatio > 0.35} />
                  </RatioBar>
                  {result.textRatio <= 0.35 && (
                    <RatioNote>Text-pattern analysis skipped to prevent false positives on binary data.</RatioNote>
                  )}
                </SideSection>

                {/* Scan methods */}
                <SideSection>
                  <SideLabel>Scan Methods</SideLabel>
                  {[
                    'Signature database',
                    'Entropy analysis',
                    ...(result.textRatio > 0.35 ? ['Obfuscation detection', 'Suspicious strings'] : []),
                    'String extraction',
                    'File type verification',
                  ].map(m => <CovItem key={m}>{m}</CovItem>)}
                </SideSection>
              </Sidebar>

              {/* Main panel */}
              <MainPanel>
                <TabBar>
                  <Tab $a={tab === 'threats'} onClick={() => setTab('threats')}>
                    <ShieldX size={11} />
                    Threats
                    <TabChip $alert={visibleDets.length > 0 && result.verdict !== 'clean'} $ok={visibleDets.length === 0}>
                      {visibleDets.length}
                    </TabChip>
                  </Tab>
                  <Tab $a={tab === 'strings'} onClick={() => setTab('strings')}>
                    <Type size={11} />
                    Strings
                    <TabChip $alert={result.extractedStrings.some(s => s.flagged)}>
                      {result.extractedStrings.length}
                    </TabChip>
                  </Tab>
                  <Tab $a={tab === 'hex'} onClick={() => setTab('hex')}>
                    <FileText size={11} />
                    Raw Bytes
                  </Tab>
                </TabBar>

                <TabContent>
                  {/* Threats */}
                  {tab === 'threats' && (
                    <>
                      <ScrollArea>
                        {visibleDets.length === 0 ? (
                          <Empty>
                            <ShieldCheck size={34} color="#22c55e" />
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15803d' }}>
                              {dismissed.size > 0 ? 'All Findings Dismissed' : 'No Threats Found'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.6, maxWidth: 260 }}>
                              {dismissed.size > 0
                                ? 'You have dismissed all flagged findings. Use "Restore" to review them again.'
                                : 'This file passed all checks including signature matching, entropy analysis, and file type verification.'}
                            </div>
                          </Empty>
                        ) : (
                          visibleDets.map(d => (
                            <DetectionCard
                              key={d.id}
                              d={d}
                              selected={selId === d.id}
                              onSelect={() => handleDetClick(d)}
                              onDismiss={e => handleDismiss(d.id, e)}
                            />
                          ))
                        )}
                      </ScrollArea>
                      {dismissed.size > 0 && (
                        <DismissBar>
                          <span>{dismissed.size} finding{dismissed.size > 1 ? 's' : ''} dismissed</span>
                          <RestoreBtn onClick={() => setDismissed(new Set())}>
                            <RotateCcw size={8} /> Restore
                          </RestoreBtn>
                        </DismissBar>
                      )}
                    </>
                  )}

                  {/* Strings */}
                  {tab === 'strings' && <StringsTab strings={result.extractedStrings} />}

                  {/* Hex */}
                  {tab === 'hex' && (
                    <HexWrap>
                      <HexNav>
                        <NavBt
                          $dim={hexOff <= 0}
                          disabled={hexOff <= 0}
                          onClick={() => setHexOff(o => Math.max(0, o - HEX_ROWS_VISIBLE))}
                        >
                          <ChevronLeft size={9} /> Prev
                        </NavBt>
                        <HexOff>
                          0x{(hexOff * 16).toString(16).padStart(6, '0').toUpperCase()}
                          {' – '}
                          0x{hexEnd.toString(16).padStart(6, '0').toUpperCase()}
                        </HexOff>
                        <NavBt
                          $dim={hexOff + HEX_ROWS_VISIBLE >= totalRows}
                          disabled={hexOff + HEX_ROWS_VISIBLE >= totalRows}
                          onClick={() =>
                            setHexOff(o =>
                              Math.min(o + HEX_ROWS_VISIBLE, Math.max(0, totalRows - HEX_ROWS_VISIBLE)),
                            )
                          }
                        >
                          Next <ChevronRight size={9} />
                        </NavBt>
                      </HexNav>

                      {selectedDet && (
                        <SelBar>
                          <span style={{ color: '#64748b', fontSize: '0.61rem' }}>Viewing</span>
                          <span style={{ fontWeight: 600 }}>{selectedDet.name}</span>
                          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: '0.59rem', color: '#475569' }}>
                            0x{selectedDet.byteOffset.toString(16).toUpperCase().padStart(4, '0')}
                          </span>
                        </SelBar>
                      )}

                      <HexScroll>
                        {hexRows.map(r => <HexRowView key={r.offset} row={r} />)}
                      </HexScroll>

                      <div style={{
                        flexShrink: 0,
                        padding: '0.16rem 0.55rem',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.56rem',
                        color: '#334155',
                        textTransform: 'uppercase',
                        letterSpacing: '0.09em',
                        background: 'rgba(15,23,42,0.95)',
                      }}>
                        Entropy · 256-byte blocks
                      </div>
                      <EntropyChart blocks={result.entropyBlocks} />
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