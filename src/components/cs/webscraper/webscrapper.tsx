// src/components/cs/webscraper/webscrapper.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  Search, Filter, Download, ChevronDown, ChevronUp, ExternalLink,
  Calendar, DollarSign, Building2, Tag, MapPin, Clock, FileText,
  TrendingUp, BarChart3, RefreshCw, X, CheckCircle2, AlertCircle,
  Globe, ArrowUpDown, ChevronLeft, ChevronRight, Key, Upload,
  Wifi, WifiOff, Loader2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
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
  purple:    '#7c3aed',
  purpleBg:  'rgba(124,58,237,0.08)',
  serif:     `'DM Serif Display', Georgia, serif`,
  mono:      `'DM Mono', 'Fira Code', ui-monospace, monospace`,
  sans:      `'DM Sans', system-ui, sans-serif`,
  shadow:    '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  shadowLg:  '0 8px 32px rgba(26,18,8,0.12)',
  radius:    '12px',
  radiusSm:  '7px',
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Contract {
  id: string;
  title: string;
  agency: string;
  subAgency: string;
  postedDate: string;
  responseDeadline: string;
  naicsCode: string;
  naicsDesc: string;
  type: string;
  setAside: string;
  value: number;
  state: string;
  city: string;
  description: string;
  pointOfContact: string;
  contactEmail: string;
  solicitationNumber: string;
  url: string;
  category: string;
  source: 'sam.gov' | 'csv-upload';
}

type SortField = 'postedDate' | 'responseDeadline' | 'value' | 'agency' | 'title';
type SortDir = 'asc' | 'desc';
type ViewMode = 'results' | 'analytics';

// ── SAM.gov NAICS categories relevant to Omnia Partners ─────────────────────
const OMNIA_NAICS: Array<{ code: string; desc: string; category: string }> = [
  { code: '423420', desc: 'Office Equipment Merchant Wholesalers', category: 'Office Supplies' },
  { code: '423440', desc: 'Other Commercial Equipment Merchant Wholesalers', category: 'Commercial Equipment' },
  { code: '423490', desc: 'Other Professional Equipment', category: 'Professional Equipment' },
  { code: '541512', desc: 'Computer Systems Design Services', category: 'IT Services' },
  { code: '541519', desc: 'Other Computer Related Services', category: 'IT Services' },
  { code: '511210', desc: 'Software Publishers', category: 'Software' },
  { code: '561720', desc: 'Janitorial Services', category: 'Facilities' },
  { code: '561210', desc: 'Facilities Support Services', category: 'Facilities' },
  { code: '561612', desc: 'Security Guards and Patrol Services', category: 'Security' },
  { code: '339112', desc: 'Surgical and Medical Instrument Manufacturing', category: 'Medical' },
  { code: '423450', desc: 'Medical Equipment Merchant Wholesalers', category: 'Medical' },
  { code: '424120', desc: 'Stationery and Office Supplies', category: 'Office Supplies' },
  { code: '337211', desc: 'Wood Office Furniture Manufacturing', category: 'Furniture' },
  { code: '337214', desc: 'Office Furniture (except Wood) Manufacturing', category: 'Furniture' },
  { code: '238220', desc: 'Plumbing, Heating, and AC Contractors', category: 'Facilities' },
  { code: '336111', desc: 'Automobile Manufacturing', category: 'Fleet/Vehicles' },
  { code: '423110', desc: 'Automobile and Other Motor Vehicle Wholesalers', category: 'Fleet/Vehicles' },
  { code: '322291', desc: 'Sanitary Paper Product Manufacturing', category: 'Jan/San' },
  { code: '325611', desc: 'Soap and Other Detergent Manufacturing', category: 'Jan/San' },
  // Education
  { code: '611110', desc: 'Elementary and Secondary Schools', category: 'Education' },
  { code: '611210', desc: 'Junior Colleges', category: 'Education' },
  { code: '611310', desc: 'Colleges, Universities, and Professional Schools', category: 'Education' },
  { code: '611430', desc: 'Professional and Management Development Training', category: 'Education' },
  { code: '611710', desc: 'Educational Support Services', category: 'Education' },
  // Healthcare
  { code: '621111', desc: 'Offices of Physicians (except Mental Health)', category: 'Healthcare' },
  { code: '621610', desc: 'Home Health Care Services', category: 'Healthcare' },
  { code: '622110', desc: 'General Medical and Surgical Hospitals', category: 'Healthcare' },
  { code: '622210', desc: 'Psychiatric and Substance Abuse Hospitals', category: 'Healthcare' },
  { code: '623110', desc: 'Nursing Care Facilities (Skilled Nursing)', category: 'Healthcare' },
  { code: '621510', desc: 'Medical and Diagnostic Laboratories', category: 'Healthcare' },
  { code: '524114', desc: 'Health Insurance Carriers (Direct)', category: 'Healthcare' },
];

const NAICS_BY_CODE = new Map(OMNIA_NAICS.map(n => [n.code, n]));

const CATEGORIES = [...new Set(OMNIA_NAICS.map(n => n.category))].sort();

const PROC_TYPES = [
  { value: '', label: 'All types' },
  { value: 'o', label: 'Solicitation' },
  { value: 'p', label: 'Pre-solicitation' },
  { value: 'k', label: 'Combined Synopsis' },
  { value: 'r', label: 'Sources Sought' },
  { value: 's', label: 'Special Notice' },
  { value: 'a', label: 'Award Notice' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  if (v === 0) return 'TBD';
  return `$${v.toLocaleString()}`;
}

function fmtDate(d: string): string {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length < 3) return d;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`;
}

function daysUntil(d: string): number {
  if (!d) return -999;
  const now = new Date();
  const target = new Date(d);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function toMMDDYYYY(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${m}/${d}/${y}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthsAgoISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// Map SAM.gov response to our Contract shape
function mapSamToContract(opp: Record<string, unknown>): Contract {
  const naicsCode = (opp.naicsCode as string) || '';
  const naicsInfo = NAICS_BY_CODE.get(naicsCode);
  const pop = opp.placeOfPerformance as Record<string, unknown> | null;
  const popState = pop?.state as Record<string, string> | null;
  const popCity = pop?.city as Record<string, string> | null;
  const poc = Array.isArray(opp.pointOfContact) ? opp.pointOfContact[0] : null;
  const award = opp.award as Record<string, unknown> | null;
  const awardAmt = award?.amount ? parseFloat(award.amount as string) : 0;

  // Normalize date from various formats
  let postedDate = (opp.postedDate as string) || '';
  if (postedDate.includes('/')) {
    const [m, d, y] = postedDate.split('/');
    postedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  let deadline = (opp.responseDeadLine as string) || '';
  if (deadline.includes('/')) {
    const [m, d, y] = deadline.split('/');
    deadline = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (deadline.includes('T')) {
    deadline = deadline.slice(0, 10);
  }

  const dept = (opp.fullParentPathName as string) || (opp.department as string) || '';
  const subTier = (opp.subTier as string) || '';

  return {
    id: (opp.noticeId as string) || '',
    title: (opp.title as string) || 'Untitled',
    agency: dept.split('.').pop()?.trim() || dept,
    subAgency: subTier || dept,
    postedDate,
    responseDeadline: deadline,
    naicsCode,
    naicsDesc: naicsInfo?.desc || (opp.naicsSrc as string) || naicsCode,
    type: (opp.type as string) || (opp.baseType as string) || 'Unknown',
    setAside: (opp.typeOfSetAsideDescription as string) || 'None',
    value: awardAmt,
    state: popState?.code || '',
    city: popCity?.name || '',
    description: stripHtml((opp.description as string) || ''),
    pointOfContact: poc?.fullName || '',
    contactEmail: poc?.email || '',
    solicitationNumber: (opp.solicitationNumber as string) || '',
    url: (opp.uiLink as string) || `https://sam.gov/opp/${opp.noticeId || ''}`,
    category: naicsInfo?.category || 'Other',
    source: 'sam.gov',
  };
}

function exportCSV(contracts: Contract[]) {
  const headers = ['ID','Title','Agency','Sub-Agency','Type','NAICS','Category','Value','Posted','Deadline','Set-Aside','State','City','Contact','Email','Source','URL'];
  const rows = contracts.map(c => [
    c.id, `"${c.title}"`, `"${c.agency}"`, `"${c.subAgency}"`, c.type, c.naicsCode, c.category,
    c.value, c.postedDate, c.responseDeadline, c.setAside, c.state, c.city,
    c.pointOfContact, c.contactEmail, c.source, c.url,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contracts_${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse CSV from SAM.gov DataBank download
function parseCSVUpload(text: string): Contract[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const contracts: Contract[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted commas
    const vals: string[] = [];
    let current = '';
    let inQuote = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { vals.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    vals.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });

    // Try to map common SAM.gov DataBank columns
    const title = row['award description'] || row['description of requirement'] || row['title'] || row['contract description'] || '';
    const naics = row['naics code'] || row['naics'] || '';
    const naicsInfo = NAICS_BY_CODE.get(naics);

    contracts.push({
      id: row['piid'] || row['contract number'] || row['award id'] || `CSV-${i}`,
      title: title || `Contract #${i}`,
      agency: row['contracting agency name'] || row['funding agency name'] || row['agency'] || '',
      subAgency: row['contracting office name'] || row['sub-agency'] || '',
      postedDate: row['date signed'] || row['action date'] || row['posted date'] || '',
      responseDeadline: row['ultimate completion date'] || row['response date'] || row['deadline'] || '',
      naicsCode: naics,
      naicsDesc: naicsInfo?.desc || row['naics description'] || naics,
      type: row['award type'] || row['type'] || 'Award',
      setAside: row['type of set aside'] || row['set-aside'] || 'None',
      value: parseFloat(row['dollars obligated'] || row['base and all options value'] || row['value'] || '0') || 0,
      state: row['place of performance state code'] || row['state'] || '',
      city: row['place of performance city'] || row['city'] || '',
      description: row['description of requirement'] || title,
      pointOfContact: row['contracting officer'] || row['contact'] || '',
      contactEmail: row['email'] || '',
      solicitationNumber: row['solicitation id'] || row['solicitation number'] || '',
      url: row['url'] || '',
      category: naicsInfo?.category || 'Other',
      source: 'csv-upload',
    });
  }

  return contracts;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Root = styled.div`
  background: ${T.cream};
  min-height: 100%;
  font-family: ${T.sans};
  color: ${T.ink};
  animation: ${fadeIn} 0.4s ease-out;
`;

const Header = styled.div`
  padding: 24px 28px 20px;
  border-bottom: 1px solid ${T.rule};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  font-family: ${T.serif};
  font-size: 1.5rem;
  font-weight: 400;
  color: ${T.ink};
  margin: 0;
`;

const HeaderBadge = styled.span<{ $live?: boolean }>`
  font-family: ${T.mono};
  font-size: 0.7rem;
  padding: 3px 10px;
  background: ${({ $live }) => $live ? T.greenBg : T.accentBg};
  color: ${({ $live }) => $live ? T.green : T.accent};
  border-radius: 999px;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewToggle = styled.button<{ $active: boolean }>`
  font-family: ${T.sans};
  font-size: 0.78rem;
  font-weight: 500;
  padding: 6px 14px;
  border: 1px solid ${({ $active }) => $active ? T.accent : T.rule};
  border-radius: ${T.radiusSm};
  background: ${({ $active }) => $active ? T.accentBg : 'transparent'};
  color: ${({ $active }) => $active ? T.accent : T.inkLight};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    border-color: ${T.accent};
    color: ${T.accent};
  }
`;

const ActionBtn = styled.button`
  font-family: ${T.sans};
  font-size: 0.78rem;
  font-weight: 500;
  padding: 6px 14px;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  background: transparent;
  color: ${T.inkLight};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    border-color: ${T.accent};
    color: ${T.accent};
    background: ${T.accentBg};
  }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 200px);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  border-right: 1px solid ${T.rule};
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const SideSection = styled.div`
  margin-bottom: 20px;
`;

const SideLabel = styled.label`
  font-family: ${T.mono};
  font-size: 0.68rem;
  font-weight: 500;
  color: ${T.inkLight};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: block;
  margin-bottom: 8px;
`;

const SearchInput = styled.div`
  position: relative;
  margin-bottom: 16px;

  input {
    width: 100%;
    padding: 9px 12px 9px 34px;
    border: 1px solid ${T.rule};
    border-radius: ${T.radiusSm};
    font-family: ${T.sans};
    font-size: 0.82rem;
    color: ${T.ink};
    background: ${T.cream};
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &::placeholder { color: ${T.inkFaint}; }
    &:focus { border-color: ${T.accent}; }
  }

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${T.inkFaint};
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  font-family: ${T.sans};
  font-size: 0.8rem;
  color: ${T.ink};
  background: ${T.cream};
  outline: none;
  cursor: pointer;
  box-sizing: border-box;

  &:focus { border-color: ${T.accent}; }
`;

const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  font-family: ${T.sans};
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 9px;
  border: 1px solid ${({ $active }) => $active ? T.accent : T.rule};
  border-radius: 999px;
  background: ${({ $active }) => $active ? T.accentBg : 'transparent'};
  color: ${({ $active }) => $active ? T.accent : T.inkLight};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${T.accent};
    color: ${T.accent};
  }
`;

const ClearBtn = styled.button`
  font-family: ${T.mono};
  font-size: 0.68rem;
  color: ${T.red};
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 4px;
  opacity: 0.8;

  &:hover { opacity: 1; text-decoration: underline; }
`;

const MainCol = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  flex: 1;
  min-width: 140px;
  padding: 14px 16px;
  background: ${T.creamDark};
  border-radius: ${T.radius};
  border: 1px solid ${T.ruleMid};
`;

const StatLabel = styled.div`
  font-family: ${T.mono};
  font-size: 0.66rem;
  color: ${T.inkLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const StatVal = styled.div<{ $color?: string }>`
  font-family: ${T.serif};
  font-size: 1.35rem;
  color: ${({ $color }) => $color || T.ink};
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ResultCount = styled.span`
  font-family: ${T.mono};
  font-size: 0.75rem;
  color: ${T.inkLight};
`;

const SortBtn = styled.button<{ $active: boolean }>`
  font-family: ${T.sans};
  font-size: 0.72rem;
  font-weight: 500;
  padding: 4px 10px;
  border: 1px solid ${({ $active }) => $active ? T.accent : 'transparent'};
  border-radius: ${T.radiusSm};
  background: ${({ $active }) => $active ? T.accentBg : 'transparent'};
  color: ${({ $active }) => $active ? T.accent : T.inkLight};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;

  &:hover { color: ${T.accent}; }
`;

const ContractCard = styled.div<{ $selected: boolean }>`
  padding: 16px 18px;
  border: 1px solid ${({ $selected }) => $selected ? T.accent : T.rule};
  border-radius: ${T.radius};
  margin-bottom: 8px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? T.accentBg : T.cream};
  transition: all 0.2s;
  animation: ${fadeIn} 0.3s ease-out;

  &:hover {
    border-color: ${T.accent};
    box-shadow: ${T.shadow};
  }
`;

const ContractTitle = styled.div`
  font-family: ${T.sans};
  font-size: 0.88rem;
  font-weight: 600;
  color: ${T.ink};
  margin-bottom: 6px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const ContractMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const MetaItem = styled.span`
  font-family: ${T.sans};
  font-size: 0.72rem;
  color: ${T.inkLight};
  display: flex;
  align-items: center;
  gap: 4px;

  svg { width: 13px; height: 13px; flex-shrink: 0; }
`;

const TypeBadge = styled.span<{ $type: string }>`
  font-family: ${T.mono};
  font-size: 0.62rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  ${({ $type }) => {
    const t = $type.toLowerCase();
    if (t.includes('award')) return `background: ${T.greenBg}; color: ${T.green};`;
    if (t.includes('solicitation') && !t.includes('pre')) return `background: ${T.accentBg}; color: ${T.accent};`;
    if (t.includes('pre')) return `background: ${T.amberBg}; color: ${T.amber};`;
    if (t.includes('sources')) return `background: ${T.purpleBg}; color: ${T.purple};`;
    return `background: ${T.accentBg}; color: ${T.accent};`;
  }}
`;

const ValueBadge = styled.span<{ $v: number }>`
  font-family: ${T.mono};
  font-size: 0.78rem;
  font-weight: 500;
  color: ${({ $v }) => $v >= 1_000_000 ? T.green : $v >= 100_000 ? T.accent : T.inkMid};
  white-space: nowrap;
`;

const DeadlineBadge = styled.span<{ $days: number }>`
  font-family: ${T.mono};
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 999px;
  ${({ $days }) => {
    if ($days < 0) return `background: ${T.creamDeep}; color: ${T.inkFaint};`;
    if ($days <= 7) return `background: ${T.redBg}; color: ${T.red};`;
    if ($days <= 21) return `background: ${T.amberBg}; color: ${T.amber};`;
    return `background: ${T.greenBg}; color: ${T.green};`;
  }}
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 0;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $active }) => $active ? T.accent : T.rule};
  border-radius: ${T.radiusSm};
  background: ${({ $active }) => $active ? T.accentBg : 'transparent'};
  color: ${({ $active }) => $active ? T.accent : T.inkLight};
  font-family: ${T.mono};
  font-size: 0.75rem;
  cursor: pointer;

  &:hover { border-color: ${T.accent}; color: ${T.accent}; }
  &:disabled { opacity: 0.3; cursor: default; pointer-events: none; }
`;

// Detail panel
const DetailPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: min(520px, 90vw);
  height: 100vh;
  background: ${T.cream};
  border-left: 1px solid ${T.rule};
  box-shadow: ${T.shadowLg};
  z-index: 100;
  overflow-y: auto;
  animation: ${slideIn} 0.25s ease-out;
  padding: 24px;
`;

const DetailClose = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${T.rule};
  border-radius: 50%;
  background: ${T.creamDark};
  color: ${T.inkLight};
  cursor: pointer;

  &:hover { color: ${T.ink}; border-color: ${T.inkFaint}; }
`;

const DetailTitle = styled.h2`
  font-family: ${T.serif};
  font-size: 1.2rem;
  font-weight: 400;
  color: ${T.ink};
  margin: 0 0 16px;
  padding-right: 40px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
`;

const DetailField = styled.div<{ $full?: boolean }>`
  ${({ $full }) => $full && 'grid-column: 1 / -1;'}
`;

const DetailFieldLabel = styled.div`
  font-family: ${T.mono};
  font-size: 0.64rem;
  color: ${T.inkFaint};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 3px;
`;

const DetailFieldValue = styled.div`
  font-family: ${T.sans};
  font-size: 0.84rem;
  color: ${T.ink};
  line-height: 1.5;
`;

const DetailDesc = styled.div`
  font-family: ${T.sans};
  font-size: 0.82rem;
  color: ${T.inkMid};
  line-height: 1.7;
  padding: 14px 16px;
  background: ${T.creamDark};
  border-radius: ${T.radius};
  border: 1px solid ${T.ruleMid};
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

// Analytics
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsCard = styled.div`
  padding: 18px 20px;
  background: ${T.creamDark};
  border-radius: ${T.radius};
  border: 1px solid ${T.ruleMid};
`;

const AnalyticsTitle = styled.div`
  font-family: ${T.serif};
  font-size: 0.95rem;
  color: ${T.ink};
  margin-bottom: 14px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

const BarLabel = styled.div`
  font-family: ${T.sans};
  font-size: 0.72rem;
  color: ${T.inkMid};
  width: 120px;
  flex-shrink: 0;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 18px;
  background: ${T.cream};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.5s ease-out;
  min-width: 2px;
`;

const BarValue = styled.span`
  font-family: ${T.mono};
  font-size: 0.68rem;
  color: ${T.inkLight};
  width: 52px;
  text-align: right;
  flex-shrink: 0;
`;

// API key setup
const SetupCard = styled.div`
  max-width: 560px;
  margin: 60px auto;
  padding: 32px;
  background: ${T.creamDark};
  border-radius: ${T.radius};
  border: 1px solid ${T.ruleMid};
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;
`;

const SetupTitle = styled.h2`
  font-family: ${T.serif};
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0 0 8px;
`;

const SetupDesc = styled.p`
  font-family: ${T.sans};
  font-size: 0.85rem;
  color: ${T.inkLight};
  line-height: 1.6;
  margin: 0 0 24px;
`;

const SetupInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${T.rule};
  border-radius: ${T.radiusSm};
  font-family: ${T.mono};
  font-size: 0.82rem;
  color: ${T.ink};
  background: ${T.cream};
  outline: none;
  box-sizing: border-box;
  margin-bottom: 16px;
  text-align: center;

  &::placeholder { color: ${T.inkFaint}; }
  &:focus { border-color: ${T.accent}; }
`;

const SetupBtn = styled.button`
  font-family: ${T.sans};
  font-size: 0.85rem;
  font-weight: 600;
  padding: 10px 28px;
  border: none;
  border-radius: ${T.radiusSm};
  background: ${T.accent};
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const SpinIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

const ErrorBar = styled.div`
  padding: 10px 16px;
  background: ${T.redBg};
  color: ${T.red};
  font-family: ${T.sans};
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(220,38,38,0.15);
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const PER_PAGE = 15;
const API_KEY_STORAGE = 'omnia_sam_api_key';

export default function ContractScraper() {
  // API key
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Data
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & filters
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(monthsAgoISO(6));
  const [dateTo, setDateTo] = useState(todayISO());

  // View
  const [viewMode, setViewMode] = useState<ViewMode>('results');
  const [sortField, setSortField] = useState<SortField>('postedDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // CSV upload
  const [csvContracts, setCsvContracts] = useState<Contract[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      setApiKey(stored);
      setIsConnected(true);
    }
  }, []);

  // Fetch from SAM.gov
  const fetchContracts = useCallback(async (offset = 0) => {
    if (!apiKey) return;
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    params.set('apiKey', apiKey);
    params.set('limit', String(PER_PAGE));
    params.set('offset', String(offset));
    if (dateFrom) params.set('postedFrom', toMMDDYYYY(dateFrom));
    if (dateTo) params.set('postedTo', toMMDDYYYY(dateTo));
    if (query) params.set('keyword', query);
    if (typeFilter) params.set('ptype', typeFilter);

    // If category selected, search with relevant NAICS
    if (categoryFilter) {
      const naics = OMNIA_NAICS.filter(n => n.category === categoryFilter);
      if (naics.length > 0) params.set('naics', naics[0].code);
    }

    try {
      const res = await fetch(`/api/contracts?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Error ${res.status}`);
        setLoading(false);
        return;
      }

      const opps = data.opportunitiesData || [];
      const mapped = opps.map(mapSamToContract);

      // Client-side state filter (SAM.gov doesn't have great state filtering)
      const filtered = stateFilter
        ? mapped.filter((c: Contract) => c.state === stateFilter)
        : mapped;

      setContracts(filtered);
      setTotalRecords(data.totalRecords || opps.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [apiKey, query, categoryFilter, typeFilter, stateFilter, dateFrom, dateTo]);

  // Initial fetch when connected
  useEffect(() => {
    if (isConnected && apiKey) {
      fetchContracts(0);
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = () => {
    if (!keyInput.trim()) return;
    const key = keyInput.trim();
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setKeyInput('');
    setIsConnected(false);
    setContracts([]);
    setTotalRecords(0);
  };

  const handleSearch = () => {
    setPage(1);
    fetchContracts(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchContracts((newPage - 1) * PER_PAGE);
  };

  // CSV upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const parsed = parseCSVUpload(text);
      setCsvContracts(parsed);
    };
    reader.readAsText(file);
  };

  // Merge live + CSV data
  const allContracts = useMemo(() => [...contracts, ...csvContracts], [contracts, csvContracts]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...allContracts];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'postedDate': cmp = a.postedDate.localeCompare(b.postedDate); break;
        case 'responseDeadline': cmp = a.responseDeadline.localeCompare(b.responseDeadline); break;
        case 'value': cmp = a.value - b.value; break;
        case 'agency': cmp = a.agency.localeCompare(b.agency); break;
        case 'title': cmp = a.title.localeCompare(b.title); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [allContracts, sortField, sortDir]);

  // Stats
  const stats = useMemo(() => {
    const valued = allContracts.filter(c => c.value > 0);
    const total = valued.reduce((s, c) => s + c.value, 0);
    const avg = valued.length ? total / valued.length : 0;
    const openCount = allContracts.filter(c => daysUntil(c.responseDeadline) > 0).length;
    return { count: allContracts.length, total, avg, openCount };
  }, [allContracts]);

  // Analytics
  const analytics = useMemo(() => {
    const agencyCounts: Record<string, number> = {};
    const agencyValues: Record<string, number> = {};
    const catCounts: Record<string, number> = {};
    const catValues: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};

    // Pipeline: deadline urgency buckets
    const pipeline = { closing7d: 0, closing30d: 0, closing90d: 0, closed: 0 };
    // Renewal signals: pre-solicitations + sources sought = agencies planning to buy
    const renewalSignals: Contract[] = [];
    // State × Category matrix
    const stateCatMatrix: Record<string, Record<string, number>> = {};

    for (const c of allContracts) {
      const agency = c.agency || 'Unknown';
      agencyCounts[agency] = (agencyCounts[agency] || 0) + 1;
      agencyValues[agency] = (agencyValues[agency] || 0) + c.value;
      const cat = c.category || 'Other';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
      catValues[cat] = (catValues[cat] || 0) + c.value;
      const tp = c.type || 'Unknown';
      typeCounts[tp] = (typeCounts[tp] || 0) + 1;
      if (c.state) {
        stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
        // State × Category
        if (!stateCatMatrix[c.state]) stateCatMatrix[c.state] = {};
        stateCatMatrix[c.state][cat] = (stateCatMatrix[c.state][cat] || 0) + 1;
      }

      // Pipeline urgency
      const days = daysUntil(c.responseDeadline);
      if (days < 0) pipeline.closed++;
      else if (days <= 7) pipeline.closing7d++;
      else if (days <= 30) pipeline.closing30d++;
      else if (days <= 90) pipeline.closing90d++;

      // Renewal signals: pre-solicitations & sources sought are early warnings
      const tl = tp.toLowerCase();
      if (tl.includes('pre') || tl.includes('sources') || tl.includes('special')) {
        renewalSignals.push(c);
      }
    }

    const topAgencies = Object.entries(agencyCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topAgencyValues = Object.entries(agencyValues).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topCategories = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const topCatValues = Object.entries(catValues).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const typeBreakdown = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const topStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // State × Category: top 8 states, all their categories
    const statesCatEntries = Object.entries(stateCatMatrix)
      .sort((a, b) => {
        const aTotal = Object.values(a[1]).reduce((s, v) => s + v, 0);
        const bTotal = Object.values(b[1]).reduce((s, v) => s + v, 0);
        return bTotal - aTotal;
      })
      .slice(0, 8);

    return {
      topAgencies, topAgencyValues, topCategories, topCatValues,
      typeBreakdown, topStates, pipeline, renewalSignals, statesCatEntries,
    };
  }, [allContracts]);

  const selectedContract = selectedId ? allContracts.find(c => c.id === selectedId) : null;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const clearFilters = () => {
    setQuery(''); setCategoryFilter(''); setTypeFilter('');
    setStateFilter(''); setDateFrom(monthsAgoISO(6)); setDateTo(todayISO());
    setPage(1);
  };

  const hasFilters = query || categoryFilter || typeFilter || stateFilter;

  const totalPages = Math.max(1, Math.ceil(totalRecords / PER_PAGE));

  const COLORS = [T.accent, T.green, T.amber, T.purple, T.red, '#06b6d4', '#ec4899', '#f97316'];

  // ── Setup screen (no API key) ──────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Root>
        <GlobalStyle />
        <Header>
          <HeaderLeft>
            <Title>Contract Intelligence</Title>
            <HeaderBadge><WifiOff size={11} /> Offline</HeaderBadge>
          </HeaderLeft>
        </Header>

        <SetupCard>
          <Key size={32} style={{ color: T.accent, marginBottom: 16 }} />
          <SetupTitle>Connect to SAM.gov</SetupTitle>
          <SetupDesc>
            Enter your SAM.gov public API key to search live federal contract opportunities.
            Get a free key at{' '}
            <a href="https://sam.gov" target="_blank" rel="noreferrer" style={{ color: T.accent }}>
              sam.gov
            </a>{' '}
            → Sign in → Profile → Public API Key.
          </SetupDesc>
          <SetupInput
            type="password"
            placeholder="SAM-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConnect()}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <SetupBtn onClick={handleConnect} disabled={!keyInput.trim()}>
              Connect
            </SetupBtn>
          </div>

          <div style={{ marginTop: 32, borderTop: `1px solid ${T.rule}`, paddingTop: 20 }}>
            <SetupDesc style={{ marginBottom: 12 }}>
              Or upload a CSV from SAM.gov DataBank reports
            </SetupDesc>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={{ display: 'none' }}
            />
            <ActionBtn onClick={() => fileRef.current?.click()} style={{ margin: '0 auto' }}>
              <Upload size={14} /> Upload CSV
            </ActionBtn>
            {csvContracts.length > 0 && (
              <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: '0.75rem', color: T.green }}>
                <CheckCircle2 size={13} style={{ verticalAlign: -2 }} /> {csvContracts.length} contracts loaded from CSV
                <SetupBtn onClick={() => setIsConnected(true)} style={{ display: 'block', margin: '12px auto 0' }}>
                  View Data
                </SetupBtn>
              </div>
            )}
          </div>
        </SetupCard>
      </Root>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <Root>
      <GlobalStyle />

      {error && (
        <ErrorBar>
          <AlertCircle size={14} />
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: T.red, cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </ErrorBar>
      )}

      <Header>
        <HeaderLeft>
          <Title>Contract Intelligence</Title>
          <HeaderBadge $live={!!apiKey}>
            {apiKey ? <><Wifi size={11} /> SAM.gov Live</> : 'CSV Only'}
          </HeaderBadge>
          <HeaderBadge>
            {loading ? <SpinIcon size={11} /> : null}
            {totalRecords > 0 ? `${totalRecords.toLocaleString()} results` : `${allContracts.length} contracts`}
          </HeaderBadge>
        </HeaderLeft>
        <HeaderRight>
          <ViewToggle $active={viewMode === 'results'} onClick={() => setViewMode('results')}>
            <FileText size={14} /> Results
          </ViewToggle>
          <ViewToggle $active={viewMode === 'analytics'} onClick={() => setViewMode('analytics')}>
            <BarChart3 size={14} /> Analytics
          </ViewToggle>
          <ActionBtn onClick={() => exportCSV(allContracts)}>
            <Download size={14} /> Export
          </ActionBtn>
          <ActionBtn onClick={handleDisconnect} title="Disconnect API key">
            <Key size={14} />
          </ActionBtn>
        </HeaderRight>
      </Header>

      <Body>
        {/* ─── Sidebar filters ─── */}
        <Sidebar>
          <SearchInput>
            <Search size={15} />
            <input
              placeholder="Search keyword..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </SearchInput>

          {hasFilters && <ClearBtn onClick={clearFilters}>× Clear all filters</ClearBtn>}

          <SideSection>
            <SideLabel>Date Range</SideLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                style={{
                  flex: 1, padding: '7px 6px', border: `1px solid ${T.rule}`,
                  borderRadius: T.radiusSm, fontFamily: T.mono, fontSize: '0.72rem',
                  background: T.cream, color: T.ink, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                style={{
                  flex: 1, padding: '7px 6px', border: `1px solid ${T.rule}`,
                  borderRadius: T.radiusSm, fontFamily: T.mono, fontSize: '0.72rem',
                  background: T.cream, color: T.ink, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </SideSection>

          <SideSection>
            <SideLabel>Category (NAICS)</SideLabel>
            <FilterChips>
              {CATEGORIES.map(cat => (
                <FilterChip
                  key={cat}
                  $active={categoryFilter === cat}
                  onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                >
                  {cat}
                </FilterChip>
              ))}
            </FilterChips>
          </SideSection>

          <SideSection>
            <SideLabel>Procurement Type</SideLabel>
            <FilterSelect
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {PROC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </FilterSelect>
          </SideSection>

          <SideSection>
            <SideLabel>State</SideLabel>
            <FilterSelect
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
            >
              <option value="">All states</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
          </SideSection>

          <div style={{ marginTop: 16 }}>
            <SetupBtn onClick={handleSearch} disabled={loading} style={{ width: '100%' }}>
              {loading ? <><SpinIcon size={14} /> Searching...</> : <><RefreshCw size={14} /> Search SAM.gov</>}
            </SetupBtn>
          </div>

          <div style={{ marginTop: 16, borderTop: `1px solid ${T.rule}`, paddingTop: 16 }}>
            <SideLabel>Upload CSV</SideLabel>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={{ display: 'none' }}
            />
            <ActionBtn onClick={() => fileRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
              <Upload size={14} /> Import DataBank CSV
            </ActionBtn>
            {csvContracts.length > 0 && (
              <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: '0.7rem', color: T.green }}>
                <CheckCircle2 size={11} style={{ verticalAlign: -2 }} /> {csvContracts.length} from CSV
              </div>
            )}
          </div>
        </Sidebar>

        {/* ─── Main content ─── */}
        <MainCol>
          {/* Stats bar */}
          <StatsRow>
            <StatCard>
              <StatLabel>Total Results</StatLabel>
              <StatVal>{stats.count.toLocaleString()}</StatVal>
            </StatCard>
            <StatCard>
              <StatLabel>Closing &le; 7d</StatLabel>
              <StatVal $color={T.red}>{analytics.pipeline.closing7d}</StatVal>
            </StatCard>
            <StatCard>
              <StatLabel>Closing &le; 30d</StatLabel>
              <StatVal $color={T.amber}>{analytics.pipeline.closing30d}</StatVal>
            </StatCard>
            <StatCard>
              <StatLabel>Early Signals</StatLabel>
              <StatVal $color={T.purple}>{analytics.renewalSignals.length}</StatVal>
            </StatCard>
            <StatCard>
              <StatLabel>Total Value</StatLabel>
              <StatVal $color={T.green}>{fmtCurrency(stats.total)}</StatVal>
            </StatCard>
          </StatsRow>

          {viewMode === 'results' ? (
            <>
              {/* Sort bar */}
              <ResultsHeader>
                <ResultCount>
                  {allContracts.length > 0
                    ? `Page ${page} of ${totalPages} (${totalRecords || allContracts.length} total)`
                    : 'No results'}
                </ResultCount>
                <div style={{ display: 'flex', gap: 4 }}>
                  {([
                    ['postedDate', 'Date'],
                    ['value', 'Value'],
                    ['agency', 'Agency'],
                    ['responseDeadline', 'Deadline'],
                  ] as [SortField, string][]).map(([f, label]) => (
                    <SortBtn key={f} $active={sortField === f} onClick={() => handleSort(f)}>
                      {label}
                      {sortField === f && (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                    </SortBtn>
                  ))}
                </div>
              </ResultsHeader>

              {/* Loading state */}
              {loading && allContracts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: T.inkFaint }}>
                  <SpinIcon size={32} style={{ marginBottom: 12 }} /><br />
                  Searching SAM.gov...
                </div>
              )}

              {/* Contract list */}
              {sorted.map(c => {
                const days = daysUntil(c.responseDeadline);
                return (
                  <ContractCard
                    key={c.id}
                    $selected={selectedId === c.id}
                    onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                  >
                    <ContractTitle>
                      <span>{c.title}</span>
                      <ValueBadge $v={c.value}>{fmtCurrency(c.value)}</ValueBadge>
                    </ContractTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <TypeBadge $type={c.type}>{c.type}</TypeBadge>
                      {c.setAside !== 'None' && c.setAside && (
                        <span style={{ fontFamily: T.mono, fontSize: '0.62rem', color: T.purple }}>
                          {c.setAside}
                        </span>
                      )}
                      {c.source === 'csv-upload' && (
                        <span style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.inkFaint }}>CSV</span>
                      )}
                    </div>
                    <ContractMeta>
                      <MetaItem><Building2 /> {c.agency || 'Unknown agency'}</MetaItem>
                      {c.naicsCode && <MetaItem><Tag /> {c.naicsCode} — {c.category}</MetaItem>}
                      {c.state && <MetaItem><MapPin /> {c.city ? `${c.city}, ` : ''}{c.state}</MetaItem>}
                      <MetaItem><Calendar /> {fmtDate(c.postedDate)}</MetaItem>
                      {c.responseDeadline && (
                        <MetaItem>
                          <Clock />
                          <DeadlineBadge $days={days}>
                            {days < 0 ? 'Closed' : days === 0 ? 'Today' : `${days}d left`}
                          </DeadlineBadge>
                        </MetaItem>
                      )}
                    </ContractMeta>
                  </ContractCard>
                );
              })}

              {!loading && allContracts.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '48px 20px', color: T.inkFaint,
                  fontFamily: T.sans, fontSize: '0.9rem'
                }}>
                  <AlertCircle size={32} style={{ marginBottom: 12, opacity: 0.4 }} /><br />
                  {apiKey
                    ? 'No results found. Try different keywords or date range.'
                    : 'Upload a CSV or connect your SAM.gov API key to get started.'}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PageBtn disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                    <ChevronLeft size={14} />
                  </PageBtn>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    return (
                      <PageBtn key={p} $active={page === p} onClick={() => handlePageChange(p)}>
                        {p}
                      </PageBtn>
                    );
                  })}
                  <PageBtn disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                    <ChevronRight size={14} />
                  </PageBtn>
                </Pagination>
              )}
            </>
          ) : (
            /* ─── Analytics view ─── */
            <AnalyticsGrid>
              {/* Pipeline urgency — the #1 metric for outreach prioritization */}
              {allContracts.length > 0 && (
                <AnalyticsCard style={{ gridColumn: '1 / -1' }}>
                  <AnalyticsTitle>Renewal Pipeline — Deadline Urgency</AnalyticsTitle>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Closing ≤ 7 days', count: analytics.pipeline.closing7d, color: T.red, bg: T.redBg },
                      { label: 'Closing ≤ 30 days', count: analytics.pipeline.closing30d, color: T.amber, bg: T.amberBg },
                      { label: 'Closing ≤ 90 days', count: analytics.pipeline.closing90d, color: T.green, bg: T.greenBg },
                      { label: 'Already closed', count: analytics.pipeline.closed, color: T.inkFaint, bg: T.creamDeep },
                    ].map(b => (
                      <div key={b.label} style={{
                        flex: 1, minWidth: 130, padding: '14px 16px', background: b.bg,
                        borderRadius: T.radiusSm, textAlign: 'center',
                      }}>
                        <div style={{ fontFamily: T.serif, fontSize: '1.6rem', color: b.color }}>{b.count}</div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: b.color, marginTop: 2 }}>{b.label}</div>
                      </div>
                    ))}
                  </div>
                </AnalyticsCard>
              )}

              {/* State × Category matrix — "TN has 12 healthcare, 8 IT" */}
              {analytics.statesCatEntries.length > 0 && (
                <AnalyticsCard style={{ gridColumn: '1 / -1' }}>
                  <AnalyticsTitle>State × Category Breakdown</AnalyticsTitle>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse', fontFamily: T.sans, fontSize: '0.75rem',
                    }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '6px 10px', fontFamily: T.mono, fontSize: '0.65rem', color: T.inkLight, borderBottom: `1px solid ${T.rule}` }}>State</th>
                          {CATEGORIES.map(cat => (
                            <th key={cat} style={{
                              textAlign: 'center', padding: '6px 6px', fontFamily: T.mono,
                              fontSize: '0.6rem', color: T.inkLight, borderBottom: `1px solid ${T.rule}`,
                              whiteSpace: 'nowrap',
                            }}>{cat}</th>
                          ))}
                          <th style={{ textAlign: 'center', padding: '6px 10px', fontFamily: T.mono, fontSize: '0.65rem', color: T.ink, fontWeight: 600, borderBottom: `1px solid ${T.rule}` }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.statesCatEntries.map(([st, cats]) => {
                          const total = Object.values(cats).reduce((s, v) => s + v, 0);
                          return (
                            <tr key={st} style={{ borderBottom: `1px solid ${T.ruleMid}` }}>
                              <td style={{ padding: '6px 10px', fontFamily: T.mono, fontWeight: 600, color: T.ink }}>{st}</td>
                              {CATEGORIES.map(cat => {
                                const v = cats[cat] || 0;
                                return (
                                  <td key={cat} style={{
                                    textAlign: 'center', padding: '4px 6px',
                                    color: v > 0 ? T.ink : T.inkFaint, fontFamily: T.mono,
                                    background: v > 5 ? T.accentBg : v > 0 ? T.creamDark : 'transparent',
                                    fontWeight: v > 5 ? 600 : 400,
                                  }}>{v || '·'}</td>
                                );
                              })}
                              <td style={{ textAlign: 'center', padding: '4px 10px', fontFamily: T.mono, fontWeight: 700, color: T.accent }}>{total}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </AnalyticsCard>
              )}

              {/* Early signals — pre-solicitations & sources sought */}
              {analytics.renewalSignals.length > 0 && (
                <AnalyticsCard style={{ gridColumn: '1 / -1' }}>
                  <AnalyticsTitle>
                    Early Signals — Pre-solicitations & Sources Sought
                    <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.purple, marginLeft: 8 }}>
                      {analytics.renewalSignals.length} opportunities
                    </span>
                  </AnalyticsTitle>
                  <div style={{ fontSize: '0.72rem', color: T.inkLight, marginBottom: 12, fontFamily: T.sans }}>
                    These agencies are planning to buy — ideal time for Omnia to pitch cooperative contracts
                  </div>
                  {analytics.renewalSignals.slice(0, 8).map(c => (
                    <div key={c.id} style={{
                      padding: '10px 12px', borderRadius: T.radiusSm, border: `1px solid ${T.ruleMid}`,
                      marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      background: T.cream,
                    }} onClick={() => { setViewMode('results'); setSelectedId(c.id); }}>
                      <TypeBadge $type={c.type}>{c.type}</TypeBadge>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                        <div style={{ fontSize: '0.7rem', color: T.inkLight }}>{c.agency} — {c.state || 'N/A'}</div>
                      </div>
                      {c.responseDeadline && (
                        <DeadlineBadge $days={daysUntil(c.responseDeadline)}>
                          {daysUntil(c.responseDeadline) < 0 ? 'Closed' : `${daysUntil(c.responseDeadline)}d`}
                        </DeadlineBadge>
                      )}
                    </div>
                  ))}
                </AnalyticsCard>
              )}

              {analytics.topAgencies.length > 0 && (
                <AnalyticsCard>
                  <AnalyticsTitle>Top Agencies by Count</AnalyticsTitle>
                  {analytics.topAgencies.map(([name, count], i) => (
                    <BarRow key={name}>
                      <BarLabel title={name}>{name.length > 18 ? name.slice(0, 18) + '...' : name}</BarLabel>
                      <BarTrack>
                        <BarFill $pct={(count / analytics.topAgencies[0][1]) * 100} $color={COLORS[i % COLORS.length]} />
                      </BarTrack>
                      <BarValue>{count}</BarValue>
                    </BarRow>
                  ))}
                </AnalyticsCard>
              )}

              {analytics.topCategories.length > 0 && (
                <AnalyticsCard>
                  <AnalyticsTitle>Categories</AnalyticsTitle>
                  {analytics.topCategories.map(([name, count], i) => (
                    <BarRow key={name}>
                      <BarLabel>{name}</BarLabel>
                      <BarTrack>
                        <BarFill $pct={(count / analytics.topCategories[0][1]) * 100} $color={COLORS[i % COLORS.length]} />
                      </BarTrack>
                      <BarValue>{count}</BarValue>
                    </BarRow>
                  ))}
                </AnalyticsCard>
              )}

              {analytics.topStates.length > 0 && (
                <AnalyticsCard>
                  <AnalyticsTitle>Top States</AnalyticsTitle>
                  {analytics.topStates.map(([name, count], i) => (
                    <BarRow key={name}>
                      <BarLabel>{name}</BarLabel>
                      <BarTrack>
                        <BarFill $pct={(count / analytics.topStates[0][1]) * 100} $color={COLORS[i % COLORS.length]} />
                      </BarTrack>
                      <BarValue>{count}</BarValue>
                    </BarRow>
                  ))}
                </AnalyticsCard>
              )}

              {analytics.typeBreakdown.length > 0 && (
                <AnalyticsCard>
                  <AnalyticsTitle>Contract Types</AnalyticsTitle>
                  {analytics.typeBreakdown.map(([name, count], i) => (
                    <BarRow key={name}>
                      <BarLabel>{name}</BarLabel>
                      <BarTrack>
                        <BarFill $pct={(count / analytics.typeBreakdown[0][1]) * 100} $color={COLORS[i % COLORS.length]} />
                      </BarTrack>
                      <BarValue>{count}</BarValue>
                    </BarRow>
                  ))}
                </AnalyticsCard>
              )}

              {allContracts.length === 0 && (
                <AnalyticsCard style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                  <div style={{ color: T.inkFaint }}>
                    Search for contracts to see analytics
                  </div>
                </AnalyticsCard>
              )}
            </AnalyticsGrid>
          )}
        </MainCol>
      </Body>

      {/* ─── Detail slide-out panel ─── */}
      {selectedContract && (
        <DetailPanel>
          <DetailClose onClick={() => setSelectedId(null)}>
            <X size={16} />
          </DetailClose>

          <DetailTitle>{selectedContract.title}</DetailTitle>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <TypeBadge $type={selectedContract.type}>{selectedContract.type}</TypeBadge>
            {selectedContract.setAside !== 'None' && selectedContract.setAside && (
              <span style={{
                fontFamily: T.mono, fontSize: '0.65rem', padding: '2px 8px',
                borderRadius: 999, background: T.purpleBg, color: T.purple,
              }}>
                {selectedContract.setAside}
              </span>
            )}
          </div>

          <DetailGrid>
            <DetailField>
              <DetailFieldLabel>Solicitation #</DetailFieldLabel>
              <DetailFieldValue style={{ fontFamily: T.mono, fontSize: '0.8rem' }}>
                {selectedContract.solicitationNumber || '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Notice ID</DetailFieldLabel>
              <DetailFieldValue style={{ fontFamily: T.mono, fontSize: '0.8rem' }}>
                {selectedContract.id || '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Agency</DetailFieldLabel>
              <DetailFieldValue>{selectedContract.agency || '—'}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Sub-Agency</DetailFieldLabel>
              <DetailFieldValue>{selectedContract.subAgency || '—'}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>NAICS</DetailFieldLabel>
              <DetailFieldValue>
                {selectedContract.naicsCode ? `${selectedContract.naicsCode} — ${selectedContract.naicsDesc}` : '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Category</DetailFieldLabel>
              <DetailFieldValue>{selectedContract.category}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Value</DetailFieldLabel>
              <DetailFieldValue style={{ fontFamily: T.mono, fontWeight: 600 }}>
                {selectedContract.value > 0 ? `$${selectedContract.value.toLocaleString()}` : 'TBD'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Location</DetailFieldLabel>
              <DetailFieldValue>
                {[selectedContract.city, selectedContract.state].filter(Boolean).join(', ') || '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Posted</DetailFieldLabel>
              <DetailFieldValue>{fmtDate(selectedContract.postedDate)}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Response Deadline</DetailFieldLabel>
              <DetailFieldValue>
                {selectedContract.responseDeadline ? (
                  <>
                    {fmtDate(selectedContract.responseDeadline)}{' '}
                    <DeadlineBadge $days={daysUntil(selectedContract.responseDeadline)}>
                      {(() => {
                        const d = daysUntil(selectedContract.responseDeadline);
                        if (d < 0) return 'Closed';
                        if (d === 0) return 'Today';
                        return `${d}d left`;
                      })()}
                    </DeadlineBadge>
                  </>
                ) : '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Point of Contact</DetailFieldLabel>
              <DetailFieldValue>{selectedContract.pointOfContact || '—'}</DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Contact Email</DetailFieldLabel>
              <DetailFieldValue style={{ fontFamily: T.mono, fontSize: '0.78rem' }}>
                {selectedContract.contactEmail || '—'}
              </DetailFieldValue>
            </DetailField>
            <DetailField>
              <DetailFieldLabel>Source</DetailFieldLabel>
              <DetailFieldValue>
                {selectedContract.source === 'sam.gov' ? 'SAM.gov' : 'CSV Upload'}
              </DetailFieldValue>
            </DetailField>
            {selectedContract.url && (
              <DetailField>
                <DetailFieldLabel>Link</DetailFieldLabel>
                <DetailFieldValue>
                  <a
                    href={selectedContract.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: T.accent, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    View on SAM.gov <ExternalLink size={12} />
                  </a>
                </DetailFieldValue>
              </DetailField>
            )}
          </DetailGrid>

          {selectedContract.description && (
            <DetailDesc>
              <DetailFieldLabel style={{ marginBottom: 8 }}>Description</DetailFieldLabel>
              {selectedContract.description}
            </DetailDesc>
          )}
        </DetailPanel>
      )}
    </Root>
  );
}
