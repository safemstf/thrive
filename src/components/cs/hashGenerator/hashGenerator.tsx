// src/components/cs/hashGenerator/hashGenerator.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { Upload, Copy, Check, Hash, ShieldCheck, X, FileText, RotateCcw, AlertTriangle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS (invoice digitalizer)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// MD5 — pure TypeScript, no external deps
// ─────────────────────────────────────────────────────────────
function md5(input: Uint8Array | string): string {
  const msg = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const len  = msg.length;
  const bits = len * 8;
  const padLen = len % 64 < 56 ? 56 - (len % 64) : 120 - (len % 64);
  const padded = new Uint8Array(len + padLen + 8);
  padded.set(msg);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, bits >>> 0, true);
  dv.setUint32(padded.length - 4, Math.floor(bits / 2 ** 32), true);

  const K = Array.from({ length: 64 }, (_, i) => (Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
  const S = [
    7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
    5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
    4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
    6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21,
  ];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let i = 0; i < padded.length; i += 64) {
    const M = Array.from({ length: 16 }, (_, j) => dv.getUint32(i + j * 4, true));
    let A = a0, B = b0, C = c0, D = d0;
    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if      (j < 16) { F = (B & C) | (~B & D); g = j; }
      else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16; }
      else if (j < 48) { F = B ^ C ^ D;           g = (3 * j + 5) % 16; }
      else             { F = C ^ (B | ~D);         g = (7 * j) % 16; }
      F = (F + A + K[j] + M[g]) >>> 0;
      A = D; D = C; C = B;
      B = (B + ((F << S[j]) | (F >>> (32 - S[j])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  [a0, b0, c0, d0].forEach((v, i) => odv.setUint32(i * 4, v, true));
  return Array.from(out).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeAll(data: Uint8Array): Promise<Record<string, string>> {
  // Slice creates a proper ArrayBuffer (required by Web Crypto API typings)
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    crypto.subtle.digest('SHA-1',   ab),
    crypto.subtle.digest('SHA-256', ab),
    crypto.subtle.digest('SHA-384', ab),
    crypto.subtle.digest('SHA-512', ab),
  ]);
  return {
    'MD5':    md5(data),
    'SHA-1':  toHex(sha1),
    'SHA-256':toHex(sha256),
    'SHA-384':toHex(sha384),
    'SHA-512':toHex(sha512),
  };
}

function fmt(n: number): string {
  if (n < 1024)       return `${n} B`;
  if (n < 1_048_576)  return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1_048_576).toFixed(2)} MB`;
}

function detectAlgo(hex: string): string | null {
  if (!/^[0-9a-f]+$/.test(hex)) return null;
  return { 32: 'MD5', 40: 'SHA-1', 64: 'SHA-256', 96: 'SHA-384', 128: 'SHA-512' }[hex.length] ?? null;
}

const ALGO_BITS: Record<string, string> = {
  'MD5': '128-bit', 'SHA-1': '160-bit',
  'SHA-256': '256-bit', 'SHA-384': '384-bit', 'SHA-512': '512-bit',
};

// ─────────────────────────────────────────────────────────────
// ANIMATIONS & GLOBAL STYLE
// ─────────────────────────────────────────────────────────────
const fadeIn  = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const fadeUp  = keyframes`from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}`;
const spin    = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────
const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow-y: auto;
  background: ${T.cream};
  font-family: ${T.sans};
  color: ${T.ink};
  -webkit-font-smoothing: antialiased;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${T.creamDeep}; border-radius: 2px; }
`;

const Header = styled.header`
  padding-bottom: 1.25rem;
  border-bottom: 2px solid ${T.ink};
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-family: ${T.serif};
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 0.2rem;
  color: ${T.ink};
`;

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: ${T.inkLight};
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.02em;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const HeaderBadge = styled.div`
  font-family: ${T.mono};
  font-size: 0.6rem;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 0.28rem 0.6rem;
  border: 1px solid ${T.creamDeep};
  border-radius: 999px;
  background: ${T.creamDark};
  white-space: nowrap;
`;

const ModeRow = styled.div`
  display: flex;
  gap: 0;
  background: ${T.creamDark};
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  padding: 3px;
  width: fit-content;
`;

const ModeBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.38rem 0.95rem;
  border-radius: 9px;
  border: none;
  font-family: ${T.sans};
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: ${p => p.$active ? 'white' : 'transparent'};
  color: ${p => p.$active ? T.ink : T.inkLight};
  box-shadow: ${p => p.$active ? T.shadow : 'none'};
`;

const DropZone = styled.label<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 180px;
  border: 2px dashed ${p => p.$active ? T.accent : T.creamDeep};
  border-radius: ${T.radius};
  background: ${p => p.$active ? T.accentBg : T.creamDark};
  cursor: pointer;
  transition: all 0.2s;
  padding: 1.5rem;
  text-align: center;

  &:hover {
    border-color: ${T.inkFaint};
    background: ${T.creamDeep};
  }
`;

const DropIcon = styled.div<{ $active: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${p => p.$active ? T.accentBg : 'white'};
  border: 1px solid ${p => p.$active ? 'rgba(37,99,235,0.2)' : T.rule};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$active ? T.accent : T.inkLight};
  box-shadow: ${T.shadow};
`;

const DropTitle = styled.div`font-size: 0.88rem; font-weight: 500; color: ${T.ink};`;
const DropSub   = styled.div`font-size: 0.73rem; color: ${T.inkLight}; line-height: 1.55; margin-top: 0.15rem;`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  box-shadow: ${T.shadow};
  animation: ${fadeIn} 0.25s ease;
`;

const FileIconBox = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: ${T.accentBg};
  border: 1px solid rgba(37,99,235,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${T.accent};
  flex-shrink: 0;
`;

const FileName = styled.div`font-size: 0.8rem; font-weight: 500; color: ${T.ink}; word-break: break-all; line-height: 1.4;`;
const FileMeta = styled.div`font-size: 0.67rem; color: ${T.inkLight}; margin-top: 0.1rem;`;

const SmallBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border-radius: ${T.radiusSm};
  border: 1px solid ${T.rule};
  background: white;
  color: ${T.inkMid};
  font-family: ${T.sans};
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  box-shadow: ${T.shadow};
  flex-shrink: 0;

  &:hover { background: ${T.creamDark}; color: ${T.ink}; }
`;

const TextInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  max-height: 220px;
  padding: 0.85rem 1rem;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  background: white;
  font-family: ${T.mono};
  font-size: 0.78rem;
  color: ${T.ink};
  resize: vertical;
  transition: border-color 0.15s;
  box-shadow: ${T.shadow};
  outline: none;

  &:focus { border-color: ${T.accent}; }
  &::placeholder { color: ${T.inkFaint}; }
`;

const HashCard = styled.div`
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: ${T.shadow};
  animation: ${fadeIn} 0.3s ease;
`;

const CardHead = styled.div`
  padding: 0.65rem 1rem;
  border-bottom: 1px solid ${T.ruleMid};
  background: ${T.creamDark};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.div`
  font-family: ${T.serif};
  font-size: 1.05rem;
  font-weight: 400;
  color: ${T.ink};
`;

const CardMeta = styled.div`
  font-family: ${T.mono};
  font-size: 0.6rem;
  color: ${T.inkFaint};
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HashRow = styled.div<{ $match?: boolean; $mismatch?: boolean }>`
  display: grid;
  grid-template-columns: 72px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid ${T.ruleMid};
  background: ${p => p.$match ? T.greenBg : p.$mismatch ? T.redBg : 'transparent'};
  transition: background 0.2s;

  &:last-child { border-bottom: none; }

  @media (max-width: 560px) {
    grid-template-columns: 60px 1fr auto;
    gap: 0.5rem;
    padding: 0.55rem 0.75rem;
  }
`;

const AlgoBadge = styled.span`
  font-family: ${T.mono};
  font-size: 0.59rem;
  font-weight: 600;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const HashValue = styled.code`
  font-family: ${T.mono};
  font-size: 0.63rem;
  color: ${T.inkMid};
  word-break: break-all;
  line-height: 1.5;
  min-width: 0;
`;

const CopyBtn = styled.button<{ $copied: boolean }>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 1px solid ${p => p.$copied ? 'rgba(22,163,74,0.3)' : T.rule};
  border-radius: 7px;
  background: ${p => p.$copied ? T.greenBg : 'white'};
  color: ${p => p.$copied ? T.green : T.inkFaint};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: ${T.shadow};

  &:hover { border-color: ${T.accent}; color: ${T.accent}; background: ${T.accentBg}; }
`;

const VerifyCard = styled.div`
  background: white;
  border: 1px solid ${T.rule};
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: ${T.shadow};
  animation: ${fadeIn} 0.35s ease;
`;

const VerifyBody = styled.div`padding: 1rem;`;

const VerifyInput = styled.input`
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  background: ${T.creamDark};
  font-family: ${T.mono};
  font-size: 0.73rem;
  color: ${T.ink};
  outline: none;
  transition: border-color 0.15s;

  &:focus { border-color: ${T.accent}; background: white; }
  &::placeholder { color: ${T.inkFaint}; }
`;

const AlgoHint = styled.div`
  margin-top: 0.35rem;
  font-size: 0.63rem;
  color: ${T.inkFaint};
  font-family: ${T.mono};
`;

const VerifyResult = styled.div<{ $ok: boolean }>`
  margin-top: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  border-radius: ${T.radiusSm};
  background: ${p => p.$ok ? T.greenBg : T.redBg};
  border: 1px solid ${p => p.$ok ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'};
  font-size: 0.74rem;
  color: ${p => p.$ok ? T.green : T.red};
  font-weight: 500;
  animation: ${fadeUp} 0.2s ease;
`;

const SpinBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: ${T.inkLight};
  font-size: 0.8rem;
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${T.creamDeep};
  border-top-color: ${T.accent};
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
`;

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function HashGeneratorDemo() {
  const [inputMode,  setInputMode]  = useState<'file' | 'text'>('file');
  const [hashes,     setHashes]     = useState<Record<string, string> | null>(null);
  const [computing,  setComputing]  = useState(false);
  const [fileName,   setFileName]   = useState('');
  const [fileSize,   setFileSize]   = useState(0);
  const [text,       setText]       = useState('');
  const [isDrag,     setIsDrag]     = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const [copied,     setCopied]     = useState<string | null>(null);

  const fileRef   = useRef<HTMLInputElement>(null);
  const textTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processData = useCallback(async (data: Uint8Array) => {
    setComputing(true);
    setHashes(null);
    try {
      setHashes(await computeAll(data));
    } finally {
      setComputing(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setVerifyHash('');
    file.arrayBuffer().then(buf => processData(new Uint8Array(buf)));
  }, [processData]);

  const handleText = useCallback((val: string) => {
    setText(val);
    setVerifyHash('');
    if (textTimer.current) clearTimeout(textTimer.current);
    if (!val) { setHashes(null); return; }
    textTimer.current = setTimeout(() => processData(new TextEncoder().encode(val)), 300);
  }, [processData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const copy = useCallback((key: string, val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  const reset = () => {
    setHashes(null); setFileName(''); setFileSize(0);
    setText(''); setVerifyHash('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const switchMode = (m: 'file' | 'text') => { setInputMode(m); reset(); };

  const verifyNorm  = verifyHash.trim().toLowerCase();
  const detectedAlgo = verifyNorm ? detectAlgo(verifyNorm) : null;
  const verifyMatch  = detectedAlgo && hashes
    ? hashes[detectedAlgo]?.toLowerCase() === verifyNorm
    : null;

  return (
    <Root>
      <GlobalStyle />

      {/* ── Header ──────────────────────────────────────────── */}
      <Header>
        <div>
          <Title>Hash & Verify</Title>
          <Subtitle>Compute cryptographic hashes locally — nothing leaves your device</Subtitle>
        </div>
        <HeaderRight>
          <HeaderBadge>MD5 · SHA-1 · SHA-256 · SHA-384 · SHA-512</HeaderBadge>
          {hashes && (
            <SmallBtn onClick={reset}>
              <RotateCcw size={11} /> Reset
            </SmallBtn>
          )}
        </HeaderRight>
      </Header>

      {/* ── Mode toggle ─────────────────────────────────────── */}
      <ModeRow>
        <ModeBtn $active={inputMode === 'file'} onClick={() => switchMode('file')}>
          <Upload size={12} /> File
        </ModeBtn>
        <ModeBtn $active={inputMode === 'text'} onClick={() => switchMode('text')}>
          <FileText size={12} /> Text
        </ModeBtn>
      </ModeRow>

      {/* ── Input ───────────────────────────────────────────── */}
      {inputMode === 'file' ? (
        fileName ? (
          <FileInfo>
            <FileIconBox><Hash size={18} /></FileIconBox>
            <div style={{ flex: 1, minWidth: 0 }}>
              <FileName>{fileName}</FileName>
              <FileMeta>{fmt(fileSize)}</FileMeta>
            </div>
            <SmallBtn onClick={reset}><X size={12} /> Clear</SmallBtn>
          </FileInfo>
        ) : (
          <DropZone
            $active={isDrag}
            onDragEnter={e => { e.preventDefault(); setIsDrag(true); }}
            onDragLeave={() => setIsDrag(false)}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <DropIcon $active={isDrag}><Upload size={22} /></DropIcon>
            <div>
              <DropTitle>{isDrag ? 'Release to hash' : 'Drop any file to hash it'}</DropTitle>
              <DropSub>All file types · No size limit<br />File stays on your device</DropSub>
            </div>
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            />
          </DropZone>
        )
      ) : (
        <TextInput
          placeholder="Type or paste text to hash…"
          value={text}
          onChange={e => handleText(e.target.value)}
          spellCheck={false}
        />
      )}

      {/* ── Computing ───────────────────────────────────────── */}
      {computing && (
        <SpinBox><Spinner />Computing hashes…</SpinBox>
      )}

      {/* ── Hash results ────────────────────────────────────── */}
      {hashes && !computing && (
        <HashCard>
          <CardHead>
            <CardTitle>Hash Results</CardTitle>
            <CardMeta>{fileName || `${text.length} chars`}</CardMeta>
          </CardHead>
          {Object.entries(hashes).map(([algo, hash]) => {
            const isCopied   = copied === algo;
            const matchAlgo  = detectedAlgo === algo;
            const isMatch    = matchAlgo && verifyMatch === true;
            const isMismatch = matchAlgo && verifyMatch === false;
            return (
              <HashRow key={algo} $match={isMatch} $mismatch={isMismatch}>
                <AlgoBadge>{algo}</AlgoBadge>
                <HashValue>{hash}</HashValue>
                <CopyBtn $copied={isCopied} onClick={() => copy(algo, hash)} title="Copy hash">
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                </CopyBtn>
              </HashRow>
            );
          })}
        </HashCard>
      )}

      {/* ── Verify ──────────────────────────────────────────── */}
      {hashes && !computing && (
        <VerifyCard>
          <CardHead>
            <CardTitle>Verify Hash</CardTitle>
            <CardMeta>Paste a known checksum to compare</CardMeta>
          </CardHead>
          <VerifyBody>
            <VerifyInput
              placeholder="Paste MD5, SHA-1, SHA-256, SHA-384, or SHA-512 hash…"
              value={verifyHash}
              onChange={e => setVerifyHash(e.target.value)}
              spellCheck={false}
            />
            {detectedAlgo && (
              <AlgoHint>
                Detected: {detectedAlgo} ({ALGO_BITS[detectedAlgo]})
              </AlgoHint>
            )}
            {verifyMatch !== null && (
              <VerifyResult $ok={verifyMatch}>
                {verifyMatch
                  ? <><ShieldCheck size={14} /> Hash matches — integrity verified</>
                  : <><AlertTriangle size={14} /> Hash does not match — file may be modified</>}
              </VerifyResult>
            )}
            {verifyNorm && !detectedAlgo && (
              <VerifyResult $ok={false}>
                <AlertTriangle size={14} /> Unrecognised hash length (expected 32, 40, 64, 96, or 128 hex chars)
              </VerifyResult>
            )}
          </VerifyBody>
        </VerifyCard>
      )}
    </Root>
  );
}
