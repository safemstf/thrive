// src/components/invoiceDigitalizer/invoiceDigitalizer.tsx
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Tesseract from "tesseract.js";
import styled, { keyframes, createGlobalStyle } from "styled-components";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface ReceiptItem {
  name: string;
  price: number;
}

interface ReceiptData {
  id: string;
  fileName: string;
  fileHash: string;
  vendor?: string;
  date?: string;
  items: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  gratuity?: number;
  total?: number;
  rawText?: string;
  confidence?: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
  previewUrl?: string;
}

type ProcessingStatus = "idle" | "hashing" | "rotating" | "ocr" | "parsing" | "done" | "error";

interface FileEntry {
  file: File;
  id: string;
  status: ProcessingStatus;
  progress: number;
  error?: string;
  isDuplicate?: boolean;
  duplicateOf?: string;
  previewUrl?: string;
}

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;
const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const pulseBar = keyframes`
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
`;
const scanLine = keyframes`
  0%   { top: 0%; opacity: 1; }
  95%  { top: 100%; opacity: 0.6; }
  100% { top: 0%; opacity: 0; }
`;
const checkPop = keyframes`
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
`;

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  ink:       "#1a1208",
  inkMid:    "#3d3120",
  inkLight:  "#7a6e5f",
  inkFaint:  "#b8ad9e",
  cream:     "#faf7f2",
  creamDark: "#f0ebe1",
  creamDeep: "#e4ddd0",
  rule:      "rgba(26,18,8,0.1)",
  ruleMid:   "rgba(26,18,8,0.06)",
  accent:    "#2563eb",
  accentBg:  "rgba(37,99,235,0.07)",
  green:     "#16a34a",
  greenBg:   "rgba(22,163,74,0.08)",
  amber:     "#b45309",
  amberBg:   "rgba(180,83,9,0.08)",
  red:       "#dc2626",
  redBg:     "rgba(220,38,38,0.08)",
  serif:     `'DM Serif Display', Georgia, serif`,
  mono:      `'DM Mono', 'Fira Code', ui-monospace, monospace`,
  sans:      `'DM Sans', system-ui, sans-serif`,
  shadow:    "0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)",
  shadowLg:  "0 8px 32px rgba(26,18,8,0.12)",
  radius:    "12px",
  radiusSm:  "7px",
};

// ─────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────
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

const HeaderLeft = styled.div``;

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

// ── Drop Zone ────────────────────────────────────────────────
const DropZone = styled.label<{ $active: boolean; $hasFiles: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: ${p => (p.$hasFiles ? "120px" : "220px")};
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

const DropIcon = styled.div<{ $active: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: ${T.radius};
  background: ${p => (p.$active ? T.accent : T.ink)};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
`;

const DropTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${T.ink};
`;

const DropSub = styled.div`
  font-size: 0.74rem;
  color: ${T.inkLight};
  line-height: 1.5;
`;

// ── File Queue ───────────────────────────────────────────────
const Queue = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const QueueItem = styled.div<{ $status: ProcessingStatus; $dup: boolean }>`
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem 0.6rem 0.6rem;
  border-radius: ${T.radiusSm};
  background: white;
  border: 1px solid ${p =>
    p.$dup ? T.amberBg :
    p.$status === "error" ? T.redBg :
    p.$status === "done" ? "rgba(22,163,74,0.15)" :
    T.rule};
  box-shadow: ${T.shadow};
  animation: ${fadeSlideUp} 0.25s ease both;
  transition: border-color 0.2s;
`;

const Thumb = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 6px;
  overflow: hidden;
  background: ${T.creamDark};
  flex-shrink: 0;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ScanOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(37, 99, 235, 0.12);

  &::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #2563eb, transparent);
    animation: ${scanLine} 1.2s linear infinite;
  }
`;

const QueueInfo = styled.div`min-width: 0;`;
const QueueName = styled.div`font-size: 0.78rem; font-weight: 500; color: ${T.ink}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const QueueMeta = styled.div`font-size: 0.66rem; color: ${T.inkLight}; margin-top: 0.1rem; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;`;

const ProgressTrack = styled.div`
  height: 3px;
  background: ${T.creamDeep};
  border-radius: 999px;
  margin-top: 0.35rem;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number; $done: boolean }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => (p.$done ? T.green : T.accent)};
  border-radius: 999px;
  transition: width 0.3s ease;
  animation: ${p => (!p.$done ? pulseBar : "none")} 1.5s ease infinite;
`;

const StatusIcon = styled.div<{ $status: ProcessingStatus }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${p =>
    p.$status === "done" ? T.greenBg :
    p.$status === "error" ? T.redBg :
    T.accentBg};
  color: ${p =>
    p.$status === "done" ? T.green :
    p.$status === "error" ? T.red :
    T.accent};

  svg { animation: ${p => (["hashing","rotating","ocr","parsing"].includes(p.$status) ? spinAnim : "none")} 1s linear infinite; }
`;

const DupBadge = styled.span`
  font-size: 0.6rem;
  font-family: ${T.mono};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: ${T.amberBg};
  color: ${T.amber};
  border: 1px solid rgba(180,83,9,0.2);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${T.inkFaint};
  padding: 0.2rem;
  border-radius: 4px;
  line-height: 1;
  transition: all 0.15s;
  &:hover { color: ${T.red}; background: ${T.redBg}; }
`;

// ── Action Row ───────────────────────────────────────────────
const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
`;

const Btn = styled.button<{ $primary?: boolean; $ghost?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: ${p => (p.$primary ? "0.65rem 1.4rem" : "0.55rem 1.1rem")};
  border-radius: ${T.radiusSm};
  font-family: ${T.sans};
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid ${p =>
    p.$primary ? "transparent" : p.$ghost ? T.creamDeep : T.rule};
  background: ${p =>
    p.$primary ? T.ink : p.$ghost ? "transparent" : "white"};
  color: ${p =>
    p.$primary ? T.cream : T.inkMid};
  box-shadow: ${p => (p.$primary ? T.shadow : "none")};

  &:hover:not(:disabled) {
    background: ${p =>
      p.$primary ? T.inkMid : T.creamDark};
    transform: translateY(-1px);
    box-shadow: ${p => (p.$primary ? T.shadowLg : T.shadow)};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const BtnSpinner = styled.span`
  display: inline-block;
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spinAnim} 0.7s linear infinite;
`;

// ── Results ──────────────────────────────────────────────────
const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${T.rule};
  margin: 2rem 0;
`;

const SectionTitle = styled.h2`
  font-family: ${T.serif};
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin: 0 0 1.25rem;
  color: ${T.ink};
  display: flex;
  align-items: baseline;
  gap: 0.6rem;

  span {
    font-family: ${T.mono};
    font-size: 0.7rem;
    color: ${T.inkFaint};
    font-weight: 400;
    letter-spacing: 0.05em;
  }
`;

const ReceiptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const ReceiptCard = styled.div<{ $dup: boolean }>`
  background: white;
  border: 1px solid ${p => (p.$dup ? "rgba(180,83,9,0.25)" : T.rule)};
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: ${T.shadow};
  animation: ${fadeSlideUp} 0.3s ease both;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div<{ $dup: boolean }>`
  padding: 0.9rem 1rem 0.75rem;
  border-bottom: 1px solid ${T.ruleMid};
  background: ${p => (p.$dup ? "rgba(180,83,9,0.04)" : T.creamDark)};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
`;

const CardVendor = styled.div`
  font-family: ${T.serif};
  font-size: 1.05rem;
  font-weight: 400;
  color: ${T.ink};
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardMeta = styled.div`
  font-family: ${T.mono};
  font-size: 0.62rem;
  color: ${T.inkFaint};
  white-space: nowrap;
`;

const CardBody = styled.div`padding: 0.75rem 1rem; flex: 1;`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.28rem 0;
  border-bottom: 1px solid ${T.ruleMid};
  font-size: 0.76rem;

  &:last-child { border-bottom: none; }
`;

const ItemName = styled.span`
  color: ${T.inkMid};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemPrice = styled.span`
  font-family: ${T.mono};
  font-size: 0.73rem;
  color: ${T.ink};
  flex-shrink: 0;
`;

const EmptyItems = styled.div`
  font-size: 0.72rem;
  color: ${T.inkFaint};
  font-style: italic;
  padding: 0.3rem 0;
`;

const CardFooter = styled.div`
  padding: 0.65rem 1rem;
  border-top: 1px solid ${T.rule};
  background: ${T.cream};
`;

const TotalsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.18rem 0.75rem;
  font-size: 0.73rem;
`;

const TotalLabel = styled.span<{ $bold?: boolean }>`
  color: ${p => (p.$bold ? T.ink : T.inkLight)};
  font-weight: ${p => (p.$bold ? "600" : "400")};
`;

const TotalValue = styled.span<{ $bold?: boolean }>`
  font-family: ${T.mono};
  color: ${p => (p.$bold ? T.ink : T.inkMid)};
  font-weight: ${p => (p.$bold ? "600" : "400")};
  text-align: right;
`;

const ConfidencePill = styled.div<{ $pct: number }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.62rem;
  font-family: ${T.mono};
  color: ${p => (p.$pct >= 70 ? T.green : p.$pct >= 40 ? T.amber : T.red)};
  background: ${p => (p.$pct >= 70 ? T.greenBg : p.$pct >= 40 ? T.amberBg : T.redBg)};
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
`;

// ── Summary Row ──────────────────────────────────────────────
const SummaryBar = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  background: ${T.ink};
  border-radius: ${T.radius};
  color: ${T.cream};
  margin-bottom: 1rem;
`;

const SumStat = styled.div``;
const SumLabel = styled.div`font-size: 0.62rem; color: ${T.inkFaint}; font-family: ${T.mono}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.15rem;`;
const SumValue = styled.div`font-family: ${T.serif}; font-size: 1.35rem; color: ${T.cream};`;

// ── Edit overlay ─────────────────────────────────────────────
const EditInput = styled.input`
  font-family: ${T.mono};
  font-size: 0.73rem;
  color: ${T.ink};
  background: ${T.cream};
  border: 1px solid ${T.accent};
  border-radius: 4px;
  padding: 0.1rem 0.3rem;
  width: 80px;
  text-align: right;
  outline: none;

  &:focus { box-shadow: 0 0 0 3px ${T.accentBg}; }
`;

const EditVendorInput = styled.input`
  font-family: ${T.serif};
  font-size: 1rem;
  color: ${T.ink};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${T.accent};
  outline: none;
  width: 100%;
  padding: 0.1rem 0;
`;

// ─────────────────────────────────────────────────────────────
// IMAGE PRE-PROCESSING UTILS
// ─────────────────────────────────────────────────────────────

/** Compute a cheap hash of a file for duplicate detection. */
async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Read EXIF orientation tag from a JPEG and return the degree rotation needed. */
function getExifRotation(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xFFD8) return 0; // not JPEG

  let offset = 2;
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset);
    if (marker === 0xFFE1) {
      // APP1 — look for Exif header
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5),
        view.getUint8(offset + 6), view.getUint8(offset + 7),
      );
      if (exifHeader !== "Exif") break;

      const tiffOffset = offset + 10;
      const littleEndian = view.getUint16(tiffOffset) === 0x4949;
      const readUint16 = (o: number) => littleEndian ? view.getUint16(o, true) : view.getUint16(o);
      const readUint32 = (o: number) => littleEndian ? view.getUint32(o, true) : view.getUint32(o);

      const ifdOffset = tiffOffset + readUint32(tiffOffset + 4);
      const entryCount = readUint16(ifdOffset);

      for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdOffset + 2 + i * 12;
        if (readUint16(entryOffset) === 0x0112) {
          const orientation = readUint16(entryOffset + 8);
          switch (orientation) {
            case 3: return 180;
            case 6: return 90;
            case 8: return -90;
            default: return 0;
          }
        }
      }
    }
    const segmentLength = view.getUint16(offset + 2);
    offset += 2 + segmentLength;
  }
  return 0;
}

/**
 * Load an image file and return a canvas with correct EXIF orientation applied.
 */
async function normalizeImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const buffer = await file.arrayBuffer();
  const rotation = getExifRotation(buffer);

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const needsSwap = rotation === 90 || rotation === -90;
  canvas.width  = needsSwap ? bitmap.height : bitmap.width;
  canvas.height = needsSwap ? bitmap.width  : bitmap.height;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  ctx.restore();

  return canvas;
}

/**
 * Score how "receipt-like" a block of text is.
 * Counts occurrences of common receipt keywords and currency patterns.
 * Used as a tiebreaker when two rotations have similar OCR confidence.
 */
function receiptScore(text: string): number {
  const lower = text.toLowerCase();
  const keywords = [
    "total", "subtotal", "tax", "tip", "gratuity", "receipt",
    "thank you", "change", "cash", "visa", "mastercard", "debit",
    "amount", "balance", "paid", "order", "item", "qty", "price",
  ];
  const keywordHits = keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
  const currencyHits = (text.match(/\$?\d+\.\d{2}/g) ?? []).length;
  return keywordHits * 3 + currencyHits * 2;
}

/**
 * Attempt OCR on multiple rotations (0°, 90°, 180°, 270°), pick the one
 * with the best combined score (OCR confidence × receipt keyword density).
 * Always tries all four orientations for images where EXIF is missing or wrong.
 */
async function ocrWithBestRotation(
  canvas: HTMLCanvasElement,
  onProgress: (p: number) => void,
): Promise<{ text: string; confidence: number }> {
  const rotations = [0, 90, 180, 270];
  let best: { text: string; confidence: number; score: number } = {
    text: "", confidence: 0, score: -1,
  };

  for (let i = 0; i < rotations.length; i++) {
    const deg = rotations[i];
    let rotCanvas = canvas;

    if (deg !== 0) {
      rotCanvas = document.createElement("canvas");
      const ctx = rotCanvas.getContext("2d")!;
      const needsSwap = deg === 90 || deg === 270;
      rotCanvas.width  = needsSwap ? canvas.height : canvas.width;
      rotCanvas.height = needsSwap ? canvas.width  : canvas.height;
      ctx.save();
      ctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      ctx.restore();
    }

    const blob: Blob = await new Promise(res => rotCanvas.toBlob(b => res(b!), "image/png"));
    const { data } = await Tesseract.recognize(blob, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          onProgress(Math.round((i / rotations.length + m.progress / rotations.length) * 100));
        }
      },
    });

    // Combined score: OCR confidence weighted by receipt keyword density.
    // This means a slightly lower-confidence result with "Total $12.50" beats
    // a high-confidence result that's all garbled sideways characters.
    const rScore = receiptScore(data.text);
    const combinedScore = data.confidence * 0.6 + rScore * 0.4;

    if (combinedScore > best.score) {
      best = { text: data.text, confidence: data.confidence, score: combinedScore };
    }

    // Only skip remaining rotations if confidence is very high AND we already
    // have strong receipt signal — avoids accepting a partially-right orientation
    if (best.confidence >= 88 && rScore >= 8) break;
  }

  return { text: best.text, confidence: best.confidence };
}

// ─────────────────────────────────────────────────────────────
// RECEIPT PARSING
// ─────────────────────────────────────────────────────────────
const CURRENCY_RE = /\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2}))/;

function parseCurrency(str: string): number | undefined {
  const m = str.match(CURRENCY_RE);
  if (!m) return undefined;
  return parseFloat(m[1].replace(/,/g, ""));
}

/**
 * Attempts to find a labeled value in an array of lines.
 * Returns the first match for any of the given keywords.
 */
function findLabeledValue(lines: string[], ...keywords: string[]): number | undefined {
  const pattern = new RegExp(`(${keywords.join("|")})\\D{0,15}?(\\d{1,4}(?:,\\d{3})*\\.\\d{2})`, "i");
  for (const line of lines) {
    const m = line.match(pattern);
    if (m) return parseFloat(m[2].replace(/,/g, ""));
  }
  return undefined;
}

function extractDateFromLines(lines: string[]): string | undefined {
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}\b/i,
    /\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4}\b/i,
  ];
  for (const line of lines) {
    for (const pat of datePatterns) {
      const m = line.match(pat);
      if (m) {
        try {
          const d = new Date(m[0]);
          if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
        } catch { /* skip */ }
      }
    }
  }
  return undefined;
}

/**
 * Phrases that appear at the top of receipts but are NOT the vendor name.
 * These are printed by POS systems and should be completely ignored.
 */
const VENDOR_NOISE_PATTERNS = [
  /duplicate\s+receipt/i,
  /\*+\s*duplicate/i,
  /copy\s+of\s+receipt/i,
  /merchant\s+copy/i,
  /customer\s+copy/i,
  /cardholder\s+copy/i,
  /reprint/i,
  /re-?print/i,
  /not\s+a\s+receipt/i,
  /void/i,
  /thank\s+you/i,
  /welcome\s+to/i,
  /please\s+(come\s+again|retain|keep)/i,
  /^receipt\s*(#|\d|$)/i,
  /^invoice\s*(#|\d|$)/i,
  /^\*+$/,                   // lines of asterisks
  /^[-=_]+$/,                // lines of dashes/equals
  /^[#*|=\-\s]{4,}$/,       // purely decorative separator lines
];

/**
 * A line is a bad vendor candidate if it:
 *  - matches a noise pattern above
 *  - looks like a street address (starts with a number)
 *  - looks like a phone number
 *  - looks like a URL or email
 *  - is purely punctuation / symbols
 *  - is very short (1 char) or very long (>70 chars)
 *  - is a single all-caps word that is clearly a city/state/location token
 *    (e.g. "ROSEMEADE", "DALLAS", "TX") — real store names have ≥2 words
 *    OR contain digits (e.g. "Store #11567" is fine)
 */
function isNoiseLine(line: string): boolean {
  if (!line || line.length < 2 || line.length > 70) return true;
  if (VENDOR_NOISE_PATTERNS.some(p => p.test(line))) return true;
  // Addresses: start with digits followed by a word (e.g. "123 Main St")
  if (/^\d+\s+\w/.test(line)) return true;
  // City, State ZIP — e.g. "CARROLLTON, TX 75007" or "Dallas TX 75001-9999"
  if (/[A-Za-z]{2,},?\s+[A-Z]{2}\s+\d{5}(-\d{4})?/.test(line)) return true;
  // Bare state+zip with no business context — e.g. "TX 75007-99"
  if (/^[A-Z]{2}\s+\d{5}/.test(line)) return true;
  // Phone numbers
  if (/(\(\d{3}\)|\d{3}[-.\s])\d{3}[-.\s]\d{4}/.test(line)) return true;
  // URLs / emails
  if (/www\.|http|\.com|\.net|@/.test(line.toLowerCase())) return true;
  // Purely symbolic / decorative
  if (/^[^a-zA-Z0-9]+$/.test(line)) return true;
  // Single all-caps word with no digits — location tokens (e.g. "ROSEMEADE", "DALLAS", "TX")
  if (/^[A-Z]{2,}$/.test(line.trim())) return true;
  // Two all-caps words that look like City State (e.g. "FORT WORTH")
  // but NOT if they contain digits (store numbers are fine)
  if (/^[A-Z]+\s+[A-Z]+$/.test(line.trim()) && !/\d/.test(line)) return true;
  return false;
}

/**
 * Clean up a vendor candidate: remove OCR noise characters, normalize spaces,
 * and strip leading/trailing punctuation.
 */
function cleanVendorName(raw: string): string {
  return raw
    .replace(/^[©®™\s\-_*#|]+/, "")   // leading OCR noise / symbols
    .replace(/[©®™\s\-_*#|]+$/, "")   // trailing noise
    .replace(/\s{2,}/g, " ")           // collapse multiple spaces
    .trim();
}

/**
 * Extract vendor name — scan the first ~10 lines and pick the best candidate.
 * Prefers lines that look like real business names over header noise.
 */
function extractVendor(lines: string[]): string | undefined {
  const candidates: string[] = [];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const raw = lines[i].trim();
    if (isNoiseLine(raw)) continue;
    const cleaned = cleanVendorName(raw);
    if (cleaned.length >= 2) candidates.push(cleaned);
    // Stop after collecting 3 candidates — vendor is near the top
    if (candidates.length >= 3) break;
  }

  // Prefer the first candidate that contains a letter sequence ≥3 chars
  // (filters out stray single-word OCR artifacts)
  for (const c of candidates) {
    if (/[a-zA-Z]{3,}/.test(c)) return c;
  }

  return candidates[0];
}

function extractReceipt(text: string, fileName: string, id: string, fileHash: string, confidence: number, previewUrl?: string): ReceiptData {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const vendor = extractVendor(lines);
  const date   = extractDateFromLines(lines) ?? new Date().toISOString().split("T")[0];

  const subtotal = findLabeledValue(lines, "subtotal", "sub total", "sub-total");
  const tax      = findLabeledValue(lines, "tax", "vat", "gst", "hst");
  const gratuity = findLabeledValue(lines, "tip", "gratuity", "service charge");
  const total    = findLabeledValue(lines, "total", "amount due", "balance due", "grand total");

  // Build item list: lines that have a price but aren't summary lines
  const summaryKeywords = /subtotal|sub-total|total|tax|vat|gst|hst|tip|gratuity|service|change|cash|balance|amount|paid/i;
  const items: ReceiptItem[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const m = line.match(CURRENCY_RE);
    if (!m) continue;
    const price = parseFloat(m[1].replace(/,/g, ""));
    if (isNaN(price) || price <= 0) continue;

    const rawName = line.replace(CURRENCY_RE, "").replace(/[#*|]+/g, "").trim();
    if (rawName.length < 2) continue;
    if (summaryKeywords.test(rawName)) continue;

    // De-dupe items within the same receipt
    const key = `${rawName.toLowerCase()}:${price}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({ name: rawName, price });
  }

  return { id, fileName, fileHash, vendor, date, items, subtotal, tax, gratuity, total, rawText: text, confidence, previewUrl };
}

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

function fmtCurrency(v: number | undefined): string {
  if (v === undefined) return "—";
  return `$${v.toFixed(2)}`;
}

const STATUS_LABEL: Record<ProcessingStatus, string> = {
  idle:     "Queued",
  hashing:  "Hashing…",
  rotating: "Detecting orientation…",
  ocr:      "Running OCR…",
  parsing:  "Parsing…",
  done:     "Done",
  error:    "Failed",
};

// ─────────────────────────────────────────────────────────────
// ICONS (inline SVG — no dep)
// ─────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconScan = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
    <rect x="7" y="7" width="10" height="10" rx="1"/>
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconX = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconSpinner = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const IconEdit = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function InvoiceDigitalizer() {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [receipts,    setReceipts]    = useState<ReceiptData[]>([]);
  const [processing,  setProcessing]  = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDragRef = useRef(false);
  const [isDrag, setIsDrag] = useState(false);

  // ── Duplicate check ─────────────────────────────────────────
  const addFiles = useCallback(async (newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const entries: FileEntry[] = imageFiles.map(f => ({
      file: f,
      id: uid(),
      status: "idle" as ProcessingStatus,
      progress: 0,
      previewUrl: URL.createObjectURL(f),
    }));

    // Hash new files and detect cross-batch duplicates
    setFileEntries(prev => {
      const allHashes = new Map<string, string>(); // hash → id
      // We'll resolve hashes async separately and patch state
      return [...prev, ...entries];
    });

    // Async: compute hashes and flag duplicates across the full queue + already-processed receipts
    const hashes = await Promise.all(
      entries.map(async e => ({ id: e.id, hash: await hashFile(e.file), name: e.file.name }))
    );

    setFileEntries(prev => {
      // Build a map of hash → first-seen-id from already-processed receipts
      const hashMap = new Map<string, string>();
      for (const r of receipts) hashMap.set(r.fileHash, r.id);

      // Also build from entries already in the queue that have been hashed
      // (we tag them with a synthetic hash key in their id for now — we handle
      //  same-file-name detection below using the file name as a secondary signal)

      // Walk all entries in the current queue and flag new ones as duplicates
      // if their hash already exists.
      const updatedEntries = prev.map(entry => {
        const h = hashes.find(h => h.id === entry.id);
        if (!h) return entry; // existing queue item with no new hash info

        if (hashMap.has(h.hash)) {
          return { ...entry, isDuplicate: true, duplicateOf: hashMap.get(h.hash) };
        }
        // Register this hash so subsequent entries in the same batch are caught too
        hashMap.set(h.hash, entry.id);
        return entry;
      });

      return updatedEntries;
    });
  }, [receipts]);

  const removeEntry = (id: string) => {
    setFileEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter(e => e.id !== id);
    });
  };

  // ── OCR Processing ──────────────────────────────────────────
  const handleProcess = async () => {
    const toProcess = fileEntries.filter(e => e.status === "idle" || e.status === "error");
    if (!toProcess.length) return;

    setProcessing(true);
    const newReceipts: ReceiptData[] = [];
    // Track hashes seen in this run AND from already-processed receipts
    const seenHashes = new Map<string, string>(); // hash → receipt id / fileName
    for (const r of receipts) seenHashes.set(r.fileHash, r.id);

    for (const entry of toProcess) {
      const updateEntry = (patch: Partial<FileEntry>) =>
        setFileEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...patch } : e));

      try {
        // 1. Hash
        updateEntry({ status: "hashing", progress: 5 });
        const hash = await hashFile(entry.file);

        // Check for duplicate against already-processed receipts AND current batch
        if (seenHashes.has(hash)) {
          updateEntry({ status: "done", progress: 100, isDuplicate: true });
          continue;
        }
        seenHashes.set(hash, entry.id);

        // 2. Normalize orientation via EXIF
        updateEntry({ status: "rotating", progress: 15 });
        const canvas = await normalizeImageToCanvas(entry.file);

        // 3. OCR with rotation fallback
        updateEntry({ status: "ocr", progress: 20 });
        const { text, confidence } = await ocrWithBestRotation(canvas, p => {
          updateEntry({ progress: 20 + Math.round(p * 0.65) });
        });

        // 4. Parse
        updateEntry({ status: "parsing", progress: 88 });
        const receipt = extractReceipt(text, entry.file.name, entry.id, hash, confidence, entry.previewUrl);
        newReceipts.push(receipt);

        updateEntry({ status: "done", progress: 100 });
      } catch (err) {
        updateEntry({ status: "error", progress: 0, error: String(err) });
      }
    }

    setReceipts(prev => [...prev, ...newReceipts]);
    setProcessing(false);
  };

  // ── Export ──────────────────────────────────────────────────
  const exportToExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Invoice Digitalizer";
    wb.created = new Date();

    // Summary sheet
    const summary = wb.addWorksheet("Expense Summary");
    summary.columns = [
      { header: "Date",        key: "date",        width: 14 },
      { header: "Vendor",      key: "vendor",      width: 28 },
      { header: "Items",       key: "description", width: 45 },
      { header: "Subtotal",    key: "subtotal",    width: 13 },
      { header: "Tax",         key: "tax",         width: 11 },
      { header: "Tip / Svc",   key: "tip",         width: 11 },
      { header: "Total",       key: "total",       width: 13 },
      { header: "Confidence",  key: "confidence",  width: 12 },
      { header: "Source File", key: "fileName",    width: 28 },
    ];

    // Style header row
    const headerRow = summary.getRow(1);
    headerRow.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1208" } };
    headerRow.height = 22;
    headerRow.alignment = { vertical: "middle" };

    const currFmt = '"$"#,##0.00';

    receipts
      .filter(r => !r.isDuplicate)
      .forEach((r, idx) => {
        const row = summary.addRow({
          date:        r.date,
          vendor:      r.vendor ?? "(unknown)",
          description: r.items.map(i => i.name).join(", "),
          subtotal:    r.subtotal,
          tax:         r.tax,
          tip:         r.gratuity,
          total:       r.total,
          confidence:  r.confidence !== undefined ? `${Math.round(r.confidence)}%` : "—",
          fileName:    r.fileName,
        });

        const fill = idx % 2 === 0
          ? { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFAF7F2" } }
          : { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFFFFFF" } };

        row.fill = fill;
        ["subtotal","tax","tip","total"].forEach(col => {
          const cell = row.getCell(col);
          if (cell.value !== null && cell.value !== undefined) cell.numFmt = currFmt;
        });
        row.getCell("total").font = { bold: true };
      });

    // Totals row
    const dataLen = receipts.filter(r => !r.isDuplicate).length;
    if (dataLen > 0) {
      const totRow = summary.addRow({});
      totRow.getCell("vendor").value = "TOTAL";
      totRow.getCell("vendor").font = { bold: true };
      ["subtotal","tax","tip","total"].forEach((col, ci) => {
        const colLetter = ["D","E","F","G"][ci];
        const cell = totRow.getCell(col);
        cell.value = { formula: `SUM(${colLetter}2:${colLetter}${dataLen + 1})` } as any;
        cell.numFmt = currFmt;
        cell.font = { bold: true };
      });
      totRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE4DDD0" } };
    }

    // Per-receipt detail sheets (up to 10)
    receipts.slice(0, 10).filter(r => !r.isDuplicate && r.items.length > 0).forEach((r, idx) => {
      const sheet = wb.addWorksheet(`Receipt ${idx + 1}`);
      sheet.columns = [
        { header: "Item", key: "name", width: 40 },
        { header: "Price", key: "price", width: 14 },
      ];
      const hr = sheet.getRow(1);
      hr.font = { bold: true };
      hr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1208" } };
      hr.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      hr.getCell(2).font = { bold: true, color: { argb: "FFFFFFFF" } };

      r.items.forEach(item => {
        const row = sheet.addRow({ name: item.name, price: item.price });
        row.getCell("price").numFmt = currFmt;
      });

      if (r.subtotal !== undefined) sheet.addRow({ name: "Subtotal", price: r.subtotal }).getCell("price").numFmt = currFmt;
      if (r.tax      !== undefined) sheet.addRow({ name: "Tax",      price: r.tax      }).getCell("price").numFmt = currFmt;
      if (r.gratuity !== undefined) sheet.addRow({ name: "Tip/Svc",  price: r.gratuity }).getCell("price").numFmt = currFmt;
      if (r.total    !== undefined) {
        const row = sheet.addRow({ name: "TOTAL", price: r.total });
        row.getCell("name").font  = { bold: true };
        row.getCell("price").numFmt = currFmt;
        row.getCell("price").font   = { bold: true };
      }
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "expense-report.xlsx");
  };

  // ── Inline editing helpers ───────────────────────────────────
  const updateReceiptField = (id: string, field: keyof ReceiptData, value: any) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // ── Drag & drop ─────────────────────────────────────────────
  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDrag(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDrag(false); };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // Summary stats
  const activeReceipts = receipts.filter(r => !r.isDuplicate);
  const grandTotal = activeReceipts.reduce((s, r) => s + (r.total ?? 0), 0);
  const totalTax   = activeReceipts.reduce((s, r) => s + (r.tax ?? 0), 0);
  const avgConf    = activeReceipts.length
    ? Math.round(activeReceipts.reduce((s, r) => s + (r.confidence ?? 0), 0) / activeReceipts.length)
    : 0;

  const pendingCount = fileEntries.filter(e => e.status === "idle" || e.status === "error").length;

  return (
    <>
      <GlobalStyle />
      <Root>
        {/* ── HEADER ─────────────────────────────────────────── */}
        <Header>
          <HeaderLeft>
            <Title>Invoice Digitalizer</Title>
            <Subtitle>OCR-powered expense extraction with Excel export</Subtitle>
          </HeaderLeft>
          <HeaderBadge>v2.0 · local processing</HeaderBadge>
        </Header>

        {/* ── DROP ZONE ──────────────────────────────────────── */}
        <DropZone
          $active={isDrag}
          $hasFiles={fileEntries.length > 0}
          htmlFor="inv-file-input"
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <DropIcon $active={isDrag}>
            <IconUpload />
          </DropIcon>
          {fileEntries.length === 0 ? (
            <>
              <DropTitle>Drop receipt images here</DropTitle>
              <DropSub>
                Supports JPG, PNG, HEIC, WebP · Multiple files · Auto-rotates sideways images<br />
                Duplicate detection · Inline editing · Excel export
              </DropSub>
            </>
          ) : (
            <DropSub>Drop more images to add to the queue</DropSub>
          )}
          <input
            id="inv-file-input"
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={e => {
              if (e.target.files) addFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
        </DropZone>

        {/* ── FILE QUEUE ─────────────────────────────────────── */}
        {fileEntries.length > 0 && (
          <Queue>
            {fileEntries.map(entry => (
              <QueueItem key={entry.id} $status={entry.status} $dup={!!entry.isDuplicate}>
                <Thumb>
                  {entry.previewUrl && <img src={entry.previewUrl} alt={entry.file.name} />}
                  {["hashing","rotating","ocr","parsing"].includes(entry.status) && <ScanOverlay />}
                </Thumb>

                <QueueInfo>
                  <QueueName>{entry.file.name}</QueueName>
                  <QueueMeta>
                    <span>{fmtBytes(entry.file.size)}</span>
                    <span style={{ color: "#d1cfc9" }}>·</span>
                    <span>{STATUS_LABEL[entry.status]}</span>
                    {entry.isDuplicate && <DupBadge>duplicate</DupBadge>}
                    {entry.error && (
                      <span style={{ color: T.red, fontSize: "0.62rem" }}>{entry.error}</span>
                    )}
                  </QueueMeta>
                  {entry.status !== "idle" && (
                    <ProgressTrack>
                      <ProgressFill
                        $pct={entry.status === "done" ? 100 : entry.progress}
                        $done={entry.status === "done"}
                      />
                    </ProgressTrack>
                  )}
                </QueueInfo>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <StatusIcon $status={entry.status}>
                    {entry.status === "done"  ? <IconCheck /> :
                     entry.status === "error" ? <IconX size={11} /> :
                     entry.status === "idle"  ? null :
                     <IconSpinner />}
                  </StatusIcon>
                  <RemoveBtn
                    title="Remove"
                    onClick={() => removeEntry(entry.id)}
                    disabled={processing}
                  >
                    <IconX size={12} />
                  </RemoveBtn>
                </div>
              </QueueItem>
            ))}
          </Queue>
        )}

        {/* ── ACTION ROW ─────────────────────────────────────── */}
        {fileEntries.length > 0 && (
          <ActionRow>
            <Btn
              $primary
              onClick={handleProcess}
              disabled={processing || pendingCount === 0}
            >
              {processing ? <BtnSpinner /> : <IconScan />}
              {processing ? "Processing…" : `Scan ${pendingCount} Receipt${pendingCount !== 1 ? "s" : ""}`}
            </Btn>

            {receipts.length > 0 && (
              <Btn onClick={exportToExcel}>
                <IconDownload />
                Export to Excel
              </Btn>
            )}

            <Btn
              $ghost
              onClick={() => {
                fileEntries.forEach(e => { if (e.previewUrl) URL.revokeObjectURL(e.previewUrl); });
                setFileEntries([]);
              }}
              disabled={processing}
            >
              Clear Queue
            </Btn>
          </ActionRow>
        )}

        {/* ── RESULTS ────────────────────────────────────────── */}
        {receipts.length > 0 && (
          <>
            <Divider />

            <SectionTitle>
              Extracted Receipts
              <span>{activeReceipts.length} processed</span>
            </SectionTitle>

            {/* Summary bar */}
            <SummaryBar>
              <SumStat>
                <SumLabel>Grand Total</SumLabel>
                <SumValue>${grandTotal.toFixed(2)}</SumValue>
              </SumStat>
              <SumStat>
                <SumLabel>Total Tax</SumLabel>
                <SumValue>${totalTax.toFixed(2)}</SumValue>
              </SumStat>
              <SumStat>
                <SumLabel>Receipts</SumLabel>
                <SumValue>{activeReceipts.length}</SumValue>
              </SumStat>
              <SumStat>
                <SumLabel>Avg. OCR Confidence</SumLabel>
                <SumValue style={{ color: avgConf >= 70 ? "#86efac" : avgConf >= 40 ? "#fcd34d" : "#fca5a5" }}>
                  {avgConf}%
                </SumValue>
              </SumStat>
              <div style={{ marginLeft: "auto" }}>
                <Btn onClick={exportToExcel} style={{ color: T.cream, borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)" }}>
                  <IconDownload />
                  Download Report
                </Btn>
              </div>
            </SummaryBar>

            <ReceiptGrid>
              {receipts.map(r => (
                <ReceiptCard key={r.id} $dup={!!r.isDuplicate}>
                  <CardHeader $dup={!!r.isDuplicate}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {editingId === r.id ? (
                        <EditVendorInput
                          value={r.vendor ?? ""}
                          onChange={e => updateReceiptField(r.id, "vendor", e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                        />
                      ) : (
                        <CardVendor
                          title={r.vendor}
                          onClick={() => setEditingId(r.id)}
                          style={{ cursor: "text" }}
                        >
                          {r.vendor ?? <em style={{ color: T.inkFaint, fontStyle: "italic", fontFamily: T.sans }}>Unknown vendor</em>}
                        </CardVendor>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                      <CardMeta>{r.date}</CardMeta>
                      {r.isDuplicate && <DupBadge>duplicate</DupBadge>}
                      {r.confidence !== undefined && (
                        <ConfidencePill $pct={Math.round(r.confidence)}>
                          {Math.round(r.confidence)}% confidence
                        </ConfidencePill>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody>
                    {r.isDuplicate ? (
                      <EmptyItems>This receipt appears to be a duplicate of a previously scanned file.</EmptyItems>
                    ) : r.items.length === 0 ? (
                      <EmptyItems>No line items extracted — check OCR confidence.</EmptyItems>
                    ) : (
                      <ItemsList>
                        {r.items.slice(0, 8).map((item, i) => (
                          <ItemRow key={i}>
                            <ItemName title={item.name}>{item.name}</ItemName>
                            <ItemPrice>{fmtCurrency(item.price)}</ItemPrice>
                          </ItemRow>
                        ))}
                        {r.items.length > 8 && (
                          <ItemRow>
                            <ItemName style={{ color: T.inkFaint, fontStyle: "italic" }}>
                              +{r.items.length - 8} more items…
                            </ItemName>
                          </ItemRow>
                        )}
                      </ItemsList>
                    )}
                  </CardBody>

                  {!r.isDuplicate && (
                    <CardFooter>
                      <TotalsGrid>
                        {r.subtotal !== undefined && (
                          <>
                            <TotalLabel>Subtotal</TotalLabel>
                            <TotalValue>{fmtCurrency(r.subtotal)}</TotalValue>
                          </>
                        )}
                        {r.tax !== undefined && (
                          <>
                            <TotalLabel>Tax</TotalLabel>
                            <TotalValue>{fmtCurrency(r.tax)}</TotalValue>
                          </>
                        )}
                        {r.gratuity !== undefined && (
                          <>
                            <TotalLabel>Tip / Service</TotalLabel>
                            <TotalValue>{fmtCurrency(r.gratuity)}</TotalValue>
                          </>
                        )}
                        <TotalLabel $bold>Total</TotalLabel>
                        <TotalValue $bold>
                          {editingId === `${r.id}-total` ? (
                            <EditInput
                              type="number"
                              step="0.01"
                              value={r.total ?? ""}
                              onChange={e => updateReceiptField(r.id, "total", parseFloat(e.target.value))}
                              onBlur={() => setEditingId(null)}
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingId(`${r.id}-total`)}
                              style={{ cursor: "text" }}
                              title="Click to edit"
                            >
                              {fmtCurrency(r.total)}
                            </span>
                          )}
                        </TotalValue>
                      </TotalsGrid>
                    </CardFooter>
                  )}
                </ReceiptCard>
              ))}
            </ReceiptGrid>

            {/* Clear results */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn $ghost onClick={() => setReceipts([])} disabled={processing}>
                Clear Results
              </Btn>
            </div>
          </>
        )}
      </Root>
    </>
  );
}