// src/components/cs/sqlBreach/sqlBreach.tsx
'use client';

import React, { useState, useMemo } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  Shield, ShieldCheck, ShieldX, Play, RotateCcw, Info,
  Lock, Database, Zap, ChevronRight,
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
// FAKE DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const FAKE_USERS = [
  { id: 1, username: 'admin',   password: 'S3cur3P@ss!',  email: 'admin@corp.internal',  role: 'superadmin' },
  { id: 2, username: 'alice',   password: 'alice2024!',   email: 'alice@corp.internal',  role: 'user'       },
  { id: 3, username: 'bob',     password: 'hunter2',      email: 'bob@corp.internal',    role: 'user'       },
  { id: 4, username: 'dbroot',  password: 'toor',         email: 'dba@corp.internal',    role: 'dba'        },
  { id: 5, username: 'svc_api', password: 'api_k3y_2024', email: 'api@corp.internal',    role: 'service'    },
];

const FAKE_PRODUCTS = [
  { id: 1, name: 'Widget A',   price: '$9.99',  stock: 42 },
  { id: 2, name: 'Widget B',   price: '$14.99', stock: 17 },
  { id: 3, name: 'Gadget Pro', price: '$49.99', stock: 3  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type AttackType = 'safe' | 'bypass' | 'comment' | 'union' | 'stacked';
type ScenarioKey = 'login' | 'search';

interface Payload {
  id: string;
  label: string;
  description: string;
  username: string;
  password: string;
  type: AttackType;
  scenario: ScenarioKey;
}

type SimResult =
  | { kind: 'success'; user: typeof FAKE_USERS[0]; allRows?: typeof FAKE_USERS }
  | { kind: 'dump';    rows: typeof FAKE_USERS }
  | { kind: 'products'; rows: typeof FAKE_PRODUCTS }
  | { kind: 'info';    message: string; rows: Array<Record<string, string>> }
  | { kind: 'error';   message: string }
  | { kind: 'fail' };

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const PAYLOADS: Payload[] = [
  {
    id: 'safe',
    label: 'Legitimate login',
    description: "Normal credentials — the query runs as intended and returns exactly one row matching both username and password.",
    username: 'alice', password: 'alice2024!',
    type: 'safe', scenario: 'login',
  },
  {
    id: 'bypass-or',
    label: "OR '1'='1 bypass",
    description: "Injects an always-true condition. The WHERE clause becomes: username='' OR '1'='1' — which matches every row, returning all users.",
    username: "' OR '1'='1", password: 'anything',
    type: 'bypass', scenario: 'login',
  },
  {
    id: 'comment-admin',
    label: "Comment — login as admin",
    description: "The double-dash (--) starts a SQL comment, discarding everything after it — including the password check. Works for any known username.",
    username: "admin' --", password: '(ignored)',
    type: 'comment', scenario: 'login',
  },
  {
    id: 'bypass-or11',
    label: "OR 1=1 dump all",
    description: "A numeric tautology — 1=1 is always true. The database returns every row because the WHERE clause is always satisfied.",
    username: "x' OR 1=1 --", password: '',
    type: 'bypass', scenario: 'login',
  },
  {
    id: 'union-users',
    label: "UNION — dump credentials",
    description: "UNION SELECT appends a second query to the original, injecting results from the users table into the response. Leaks every password and email.",
    username: "' UNION SELECT id,username,password,email,role FROM users --", password: '',
    type: 'union', scenario: 'login',
  },
  {
    id: 'union-version',
    label: "UNION — fingerprint DB",
    description: "Extracts the database server version and current user via @@version. Attackers use this to tailor further exploits to the specific DB engine.",
    username: "' UNION SELECT 1,@@version,user(),'N/A','info' --", password: '',
    type: 'union', scenario: 'login',
  },
  {
    id: 'stacked-drop',
    label: "Stacked — DROP TABLE",
    description: "Semicolons allow stacking multiple queries. This terminates the sessions table after the login query runs — irreversible damage with one request.",
    username: "admin'; DROP TABLE sessions; --", password: '',
    type: 'stacked', scenario: 'login',
  },
  {
    id: 'search-exfil',
    label: "Search — exfiltrate users",
    description: "A UNION injection inside a product search endpoint — attackers often target less-guarded search/filter parameters instead of login forms.",
    username: "Widget%' UNION SELECT id,username,password,email,role FROM users --", password: '',
    type: 'union', scenario: 'search',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SQL BUILDER
// ─────────────────────────────────────────────────────────────────────────────
type Seg = { text: string; kw?: boolean; injected?: boolean; str?: boolean };

function hasInjection(text: string): boolean {
  return /['";\-]/.test(text) || /\b(or|and|union|select|drop|insert|update|delete|from|where)\b/i.test(text);
}

function buildLoginSegs(u: string, p: string): Seg[] {
  return [
    { text: 'SELECT', kw: true }, { text: ' * ' },
    { text: 'FROM',   kw: true }, { text: ' users ' },
    { text: 'WHERE',  kw: true }, { text: ' username=' },
    { text: "'", str: true },
    { text: u, injected: hasInjection(u) },
    { text: "'", str: true },
    { text: ' ' },
    { text: 'AND', kw: true }, { text: ' password=' },
    { text: "'", str: true },
    { text: p, injected: hasInjection(p) },
    { text: "'", str: true },
  ];
}

function buildSearchSegs(term: string): Seg[] {
  return [
    { text: 'SELECT', kw: true }, { text: ' * ' },
    { text: 'FROM',   kw: true }, { text: ' products ' },
    { text: 'WHERE',  kw: true }, { text: ' name ' },
    { text: 'LIKE',   kw: true }, { text: " '%" },
    { text: term, injected: hasInjection(term) },
    { text: "%'" },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function simulate(u: string, p: string, scenario: ScenarioKey, secureMode: boolean): SimResult {
  if (secureMode) {
    if (scenario === 'search') {
      const q = u.toLowerCase();
      return { kind: 'products', rows: FAKE_PRODUCTS.filter(r => r.name.toLowerCase().includes(q)) };
    }
    const user = FAKE_USERS.find(r => r.username === u && r.password === p);
    return user ? { kind: 'success', user } : { kind: 'fail' };
  }

  const combined = u + ' ' + p;

  // UNION injection
  if (/union\s+select/i.test(combined)) {
    if (/@@version|version\(\)/i.test(combined)) {
      return {
        kind: 'info',
        message: 'UNION injection — DB server fingerprinted',
        rows: [{ '1': '1', '@@version': 'MySQL 8.0.33-community', 'user()': 'webapp@localhost', "'N/A'": 'N/A', "'info'": 'info' }],
      };
    }
    return { kind: 'dump', rows: FAKE_USERS };
  }

  // Stacked / destructive
  if (/;\s*(drop|truncate|delete|create|alter|insert|update)\s+/i.test(combined)) {
    const m = combined.match(/DROP\s+TABLE\s+`?(\w+)`?/i);
    const tbl = m?.[1] ?? 'target_table';
    return {
      kind: 'error',
      message: `Query OK, 1 row(s) affected\nQuery OK, 0 row(s) affected\n\`${tbl}\` dropped — table no longer exists`,
    };
  }

  // Comment bypass: "admin' --"
  const commentMatch = u.match(/^(.+?)'\s*--/);
  if (commentMatch) {
    const name = commentMatch[1].trim();
    const user = FAKE_USERS.find(r => r.username === name);
    if (user) return { kind: 'success', user };
    return { kind: 'success', user: FAKE_USERS[0], allRows: FAKE_USERS };
  }

  // OR bypass
  if (/'\s+or\s+/i.test(u) || /\bor\b.+?(1\s*=\s*1|'1'\s*=\s*'1')/i.test(combined)) {
    return { kind: 'success', user: FAKE_USERS[0], allRows: FAKE_USERS };
  }

  // Search (no injection)
  if (scenario === 'search') {
    const q = u.toLowerCase().replace(/['"%;]/g, '');
    return { kind: 'products', rows: FAKE_PRODUCTS.filter(r => r.name.toLowerCase().includes(q)) };
  }

  // Normal auth
  const user = FAKE_USERS.find(r => r.username === u && r.password === p);
  return user ? { kind: 'success', user } : { kind: 'fail' };
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const flash  = keyframes`0%{background:rgba(220,38,38,0.16)}100%{background:transparent}`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────────────────────
// STYLED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Root = styled.div`
  width:100%;height:100%;min-height:540px;overflow-y:auto;background:${T.cream};
  font-family:${T.sans};color:${T.ink};-webkit-font-smoothing:antialiased;
  padding:clamp(1.25rem,3vw,2rem) clamp(1rem,3vw,1.75rem);
  display:flex;flex-direction:column;gap:1.25rem;
  &::-webkit-scrollbar{width:4px}
  &::-webkit-scrollbar-thumb{background:${T.creamDeep};border-radius:2px}
`;

const Header = styled.header`
  padding-bottom:1.25rem;border-bottom:2px solid ${T.ink};
  display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;
`;

const Title = styled.h1`
  font-family:${T.serif};font-size:clamp(1.6rem,4vw,2.2rem);font-weight:400;
  letter-spacing:-0.02em;line-height:1.1;margin:0 0 0.2rem;color:${T.ink};
`;

const Subtitle = styled.p`font-size:0.8rem;color:${T.inkLight};margin:0;font-weight:300;letter-spacing:0.02em;`;

const HeaderBadge = styled.div`
  font-family:${T.mono};font-size:0.6rem;color:${T.inkFaint};text-transform:uppercase;
  letter-spacing:0.12em;padding:0.28rem 0.6rem;border:1px solid ${T.creamDeep};
  border-radius:999px;background:${T.creamDark};white-space:nowrap;
`;

const ModeRow = styled.div`
  display:flex;background:${T.creamDark};border:1px solid ${T.rule};
  border-radius:${T.radius};padding:3px;width:fit-content;
`;

const ModeBtn = styled.button<{ $active: boolean; $secure?: boolean }>`
  display:flex;align-items:center;gap:0.3rem;padding:0.38rem 0.95rem;border-radius:9px;
  border:none;font-family:${T.sans};font-size:0.78rem;font-weight:500;cursor:pointer;transition:all 0.15s;
  background:${p => p.$active ? (p.$secure ? T.greenBg : T.redBg) : 'transparent'};
  color:${p => p.$active ? (p.$secure ? T.green : T.red) : T.inkLight};
  box-shadow:${p => p.$active ? T.shadow : 'none'};
`;

const Layout = styled.div`
  display:grid;grid-template-columns:256px 1fr;gap:1rem;min-height:0;
  @media(max-width:760px){grid-template-columns:1fr}
`;

// ─── Sidebar ───
const Sidebar = styled.div`display:flex;flex-direction:column;gap:0.5rem;`;

const SideCard = styled.div`
  background:white;border:1px solid ${T.rule};border-radius:${T.radius};
  box-shadow:${T.shadow};overflow:hidden;
`;

const SideHead = styled.div`
  padding:0.5rem 0.85rem;border-bottom:1px solid ${T.ruleMid};background:${T.creamDark};
  font-family:${T.mono};font-size:0.58rem;font-weight:600;color:${T.inkFaint};
  text-transform:uppercase;letter-spacing:0.1em;display:flex;align-items:center;gap:0.4rem;
`;

const PayloadBtn = styled.button<{ $active: boolean }>`
  display:flex;align-items:center;gap:0.55rem;width:100%;padding:0.52rem 0.85rem;
  border:none;border-bottom:1px solid ${T.ruleMid};
  background:${p => p.$active ? T.accentBg : 'transparent'};
  cursor:pointer;text-align:left;transition:all 0.12s;
  &:last-child{border-bottom:none}
  &:hover{background:${p => p.$active ? T.accentBg : T.creamDark}}
`;

const PDot = styled.div<{ $type: AttackType }>`
  width:7px;height:7px;border-radius:50%;flex-shrink:0;
  background:${p => p.$type==='safe' ? T.green : p.$type==='bypass' ? T.red : p.$type==='comment' ? T.amber : p.$type==='union' ? T.purple : T.red};
`;

const PLabel = styled.div`font-size:0.73rem;font-weight:500;color:${T.ink};line-height:1.3;`;

const TypeChip = styled.span<{ $type: AttackType }>`
  margin-left:auto;flex-shrink:0;font-size:0.51rem;font-weight:700;padding:0.05rem 0.32rem;
  border-radius:999px;text-transform:uppercase;letter-spacing:0.06em;font-family:${T.mono};
  background:${p => p.$type==='safe' ? T.greenBg : p.$type==='bypass' ? T.redBg : p.$type==='comment' ? T.amberBg : p.$type==='union' ? T.purpleBg : T.redBg};
  color:${p => p.$type==='safe' ? T.green : p.$type==='bypass' ? T.red : p.$type==='comment' ? T.amber : p.$type==='union' ? T.purple : T.red};
`;

const InfoBox = styled.div`
  display:flex;gap:0.6rem;padding:0.65rem 0.85rem;background:${T.creamDark};
  border:1px solid ${T.rule};border-radius:${T.radiusSm};font-size:0.7rem;color:${T.inkLight};line-height:1.6;
`;

// ─── Main column ───
const MainCol = styled.div`display:flex;flex-direction:column;gap:0.85rem;min-width:0;`;

const PanelCard = styled.div<{ $flashKey?: number }>`
  background:white;border:1px solid ${T.rule};border-radius:${T.radius};
  box-shadow:${T.shadow};overflow:hidden;
  animation:${fadeUp} 0.3s ease both;
`;

const FlashCard = styled(PanelCard)`
  animation:${flash} 0.5s ease both, ${fadeUp} 0.3s ease both;
`;

const PanelHead = styled.div<{ $danger?: boolean; $safe?: boolean }>`
  padding:0.5rem 1rem;border-bottom:1px solid ${T.ruleMid};
  background:${p => p.$danger ? T.redBg : p.$safe ? T.greenBg : T.creamDark};
  display:flex;align-items:center;justify-content:space-between;gap:0.5rem;
`;

const PanelTitle = styled.div`
  font-family:${T.mono};font-size:0.59rem;font-weight:600;color:${T.inkFaint};
  text-transform:uppercase;letter-spacing:0.1em;display:flex;align-items:center;gap:0.4rem;
`;

const PanelStatus = styled.span<{ $danger?: boolean; $safe?: boolean }>`
  font-family:${T.mono};font-size:0.59rem;font-weight:700;
  color:${p => p.$danger ? T.red : p.$safe ? T.green : T.inkFaint};
`;

const PanelBody = styled.div`padding:0.85rem 1rem;`;

// ─── Form ───
const FormGrid = styled.div`
  display:grid;grid-template-columns:auto 1fr;gap:0.4rem 0.75rem;align-items:center;
`;

const FormLabel = styled.label`font-size:0.72rem;font-weight:500;color:${T.inkLight};white-space:nowrap;`;

const FormInput = styled.input<{ $injected?: boolean }>`
  width:100%;padding:0.42rem 0.7rem;border-radius:${T.radiusSm};font-family:${T.mono};
  font-size:0.72rem;outline:none;transition:all 0.15s;
  border:1px solid ${p => p.$injected ? 'rgba(220,38,38,0.45)' : T.rule};
  background:${p => p.$injected ? T.redBg : T.creamDark};
  color:${p => p.$injected ? T.red : T.ink};
  &:focus{border-color:${p => p.$injected ? T.red : T.accent};background:white}
`;

const BtnRow = styled.div`display:flex;align-items:center;gap:0.75rem;margin-top:0.65rem;`;

const InjectBtn = styled.button`
  display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1.1rem;border-radius:${T.radiusSm};
  border:none;background:${T.ink};color:${T.cream};font-family:${T.sans};font-size:0.78rem;
  font-weight:600;cursor:pointer;transition:all 0.15s;box-shadow:${T.shadow};
  &:hover{background:${T.inkMid};transform:translateY(-1px);box-shadow:${T.shadowLg}}
`;

const ResetBtn = styled.button`
  display:flex;align-items:center;gap:0.28rem;border:none;background:none;
  color:${T.inkFaint};font-size:0.65rem;font-family:${T.sans};cursor:pointer;
  &:hover{color:${T.ink}}
`;

const SecureHint = styled.div`
  margin-top:0.5rem;font-size:0.63rem;color:${T.green};font-family:${T.mono};
  background:${T.greenBg};border:1px solid rgba(22,163,74,0.15);border-radius:${T.radiusSm};
  padding:0.28rem 0.55rem;display:flex;align-items:center;gap:0.35rem;
`;

// ─── SQL view ───
const SqlPre = styled.pre`
  margin:0;font-family:${T.mono};font-size:0.71rem;line-height:1.75;
  white-space:pre-wrap;word-break:break-all;color:${T.inkMid};
`;

const Kw  = styled.span`color:${T.accent};font-weight:600;`;
const Str = styled.span`color:${T.green};`;
const Inj = styled.span`
  color:${T.red};background:rgba(220,38,38,0.1);border-radius:3px;padding:0 2px;font-weight:600;
`;

const InjLabel = styled.span`
  font-size:0.55rem;color:${T.red};opacity:0.75;font-weight:400;
  vertical-align:middle;margin-left:4px;font-style:italic;
`;

const FixBox = styled.div`
  margin-top:0.75rem;padding:0.6rem 0.85rem;background:${T.greenBg};
  border:1px solid rgba(22,163,74,0.18);border-radius:${T.radiusSm};
`;

const FixLabel = styled.div`
  font-size:0.56rem;font-weight:700;color:${T.green};text-transform:uppercase;
  letter-spacing:0.09em;margin-bottom:0.28rem;font-family:${T.mono};
`;

const FixPre = styled.pre`
  margin:0;font-family:${T.mono};font-size:0.69rem;color:${T.green};white-space:pre-wrap;
`;

const Param = styled.span`color:${T.green};font-weight:700;background:rgba(22,163,74,0.12);border-radius:3px;padding:0 3px;`;

// ─── Result ───
const Banner = styled.div<{ $v: 'ok' | 'breach' | 'fail' | 'warn' }>`
  display:flex;align-items:center;gap:0.55rem;padding:0.55rem 0.85rem;border-radius:${T.radiusSm};
  font-size:0.76rem;font-weight:600;margin-bottom:0.65rem;animation:${fadeUp} 0.2s ease;
  background:${p => p.$v==='ok' ? T.greenBg : p.$v==='breach' ? T.redBg : p.$v==='warn' ? T.amberBg : T.creamDark};
  border:1px solid ${p => p.$v==='ok' ? 'rgba(22,163,74,0.2)' : p.$v==='breach' ? 'rgba(220,38,38,0.22)' : p.$v==='warn' ? 'rgba(180,83,9,0.2)' : T.rule};
  color:${p => p.$v==='ok' ? T.green : p.$v==='breach' ? T.red : p.$v==='warn' ? T.amber : T.inkLight};
`;

const TableWrap = styled.div`
  overflow-x:auto;border-radius:${T.radiusSm};border:1px solid ${T.rule};animation:${fadeUp} 0.3s ease;
  &::-webkit-scrollbar{height:4px}
  &::-webkit-scrollbar-thumb{background:${T.creamDeep};border-radius:2px}
`;

const Tbl = styled.table`width:100%;border-collapse:collapse;font-family:${T.mono};font-size:0.62rem;`;

const Th = styled.th<{ $hot?: boolean }>`
  padding:0.32rem 0.6rem;text-align:left;
  background:${p => p.$hot ? T.redBg : T.creamDark};
  color:${p => p.$hot ? T.red : T.inkFaint};
  border-bottom:1px solid ${T.rule};font-weight:700;white-space:nowrap;
  text-transform:uppercase;letter-spacing:0.05em;font-size:0.56rem;
`;

const Td = styled.td<{ $hot?: boolean }>`
  padding:0.32rem 0.6rem;
  color:${p => p.$hot ? T.red : T.inkMid};
  font-weight:${p => p.$hot ? 600 : 400};
  border-bottom:1px solid ${T.ruleMid};
  &:last-child{border-bottom:none}
`;

const Tr = styled.tr`&:last-child td{border-bottom:none}&:hover td{background:${T.creamDark}}`;

const RowMeta = styled.div`font-size:0.6rem;color:${T.inkFaint};font-family:${T.mono};margin-bottom:0.4rem;`;

const ErrPre = styled.pre`
  margin:0;font-family:${T.mono};font-size:0.66rem;color:${T.red};background:${T.redBg};
  border:1px solid rgba(220,38,38,0.18);border-radius:${T.radiusSm};padding:0.55rem 0.8rem;
  white-space:pre-wrap;animation:${fadeUp} 0.3s ease;
`;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function SqlView({ segs, secureMode, username, password }: { segs: Seg[]; secureMode: boolean; username: string; password: string }) {
  const anyInjected = segs.some(s => s.injected && s.text);

  if (secureMode) {
    return (
      <SqlPre>
        <Kw>SELECT</Kw> * <Kw>FROM</Kw> users <Kw>WHERE</Kw> username = <Param>?</Param> <Kw>AND</Kw> password = <Param>?</Param>
        {'\n'}
        <span style={{ color: T.inkFaint, fontSize: '0.61rem' }}>
          {`-- bound: [${JSON.stringify(username)}, ${JSON.stringify(password)}]`}
        </span>
      </SqlPre>
    );
  }

  return (
    <>
      <SqlPre>
        {segs.map((seg, i) => {
          if (seg.kw)  return <Kw  key={i}>{seg.text}</Kw>;
          if (seg.str) return <Str key={i}>{seg.text}</Str>;
          if (seg.injected && seg.text) return (
            <span key={i}>
              <Inj>{seg.text}</Inj>
              <InjLabel>← injected</InjLabel>
            </span>
          );
          return <span key={i}>{seg.text}</span>;
        })}
      </SqlPre>

      {anyInjected && (
        <FixBox>
          <FixLabel>Parameterized fix</FixLabel>
          <FixPre>
            <Kw style={{ color: T.green }}>SELECT</Kw> * <Kw style={{ color: T.green }}>FROM</Kw> users{'\n'}
            <Kw style={{ color: T.green }}>WHERE</Kw> username = <Param>?</Param> <Kw style={{ color: T.green }}>AND</Kw> password = <Param>?</Param>{'\n\n'}
            <span style={{ opacity: 0.65 }}>
              {'// Node:   db.query(sql, [username, password])\n'}
              {'// Python: cursor.execute(sql, (username, password))\n'}
              {'// Java:   stmt.setString(1, u); stmt.setString(2, p);'}
            </span>
          </FixPre>
        </FixBox>
      )}
    </>
  );
}

function ResultView({ result, secureMode }: { result: SimResult; secureMode: boolean }) {
  switch (result.kind) {
    case 'fail':
      return <Banner $v="fail"><Lock size={14} /> 0 rows — authentication failed</Banner>;

    case 'success': {
      const isBreach = !secureMode && !!result.allRows;
      if (isBreach && result.allRows) {
        return (
          <>
            <Banner $v="breach"><ShieldX size={14} /> Bypass successful — all {result.allRows.length} accounts exposed</Banner>
            <RowMeta>{result.allRows.length} row(s) in set</RowMeta>
            <TableWrap>
              <Tbl>
                <thead><tr>{['id','username','password','email','role'].map(h => <Th key={h} $hot={h==='password'||h==='email'}>{h}</Th>)}</tr></thead>
                <tbody>{result.allRows.map(r => <Tr key={r.id}><Td>{r.id}</Td><Td>{r.username}</Td><Td $hot>{r.password}</Td><Td $hot>{r.email}</Td><Td>{r.role}</Td></Tr>)}</tbody>
              </Tbl>
            </TableWrap>
          </>
        );
      }
      return (
        <>
          <Banner $v="ok"><ShieldCheck size={14} /> Authenticated as {result.user.username} ({result.user.role})</Banner>
          <TableWrap>
            <Tbl>
              <thead><tr>{['id','username','email','role'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody><Tr><Td>{result.user.id}</Td><Td>{result.user.username}</Td><Td>{result.user.email}</Td><Td>{result.user.role}</Td></Tr></tbody>
            </Tbl>
          </TableWrap>
        </>
      );
    }

    case 'dump':
      return (
        <>
          <Banner $v="breach"><ShieldX size={14} /> UNION injection — {result.rows.length} accounts exfiltrated</Banner>
          <RowMeta>{result.rows.length} row(s) in set</RowMeta>
          <TableWrap>
            <Tbl>
              <thead><tr>{['id','username','password','email','role'].map(h => <Th key={h} $hot={h==='password'||h==='email'}>{h}</Th>)}</tr></thead>
              <tbody>{result.rows.map(r => <Tr key={r.id}><Td>{r.id}</Td><Td>{r.username}</Td><Td $hot>{r.password}</Td><Td $hot>{r.email}</Td><Td>{r.role}</Td></Tr>)}</tbody>
            </Tbl>
          </TableWrap>
        </>
      );

    case 'products':
      return (
        <>
          <Banner $v={result.rows.length ? 'ok' : 'fail'}>
            <Database size={14} /> {result.rows.length ? `${result.rows.length} product(s) found` : 'No products matched'}
          </Banner>
          {result.rows.length > 0 && (
            <TableWrap>
              <Tbl>
                <thead><tr>{['id','name','price','stock'].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
                <tbody>{result.rows.map(r => <Tr key={r.id}><Td>{r.id}</Td><Td>{r.name}</Td><Td>{r.price}</Td><Td>{r.stock}</Td></Tr>)}</tbody>
              </Tbl>
            </TableWrap>
          )}
        </>
      );

    case 'info':
      return (
        <>
          <Banner $v="warn"><Info size={14} /> {result.message}</Banner>
          {result.rows.length > 0 && (
            <TableWrap>
              <Tbl>
                <thead><tr>{Object.keys(result.rows[0]).map(k => <Th key={k}>{k}</Th>)}</tr></thead>
                <tbody>{result.rows.map((r, i) => <Tr key={i}>{Object.values(r).map((v, j) => <Td key={j}>{String(v)}</Td>)}</Tr>)}</tbody>
              </Tbl>
            </TableWrap>
          )}
        </>
      );

    case 'error':
      return (
        <>
          <Banner $v="breach"><ShieldX size={14} /> Stacked query executed — destructive SQL ran</Banner>
          <ErrPre>{result.message}</ErrPre>
        </>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SQLBreachDemo() {
  const [secureMode,     setSecureMode]     = useState(false);
  const [scenario,       setScenario]       = useState<ScenarioKey>('login');
  const [username,       setUsername]       = useState("' OR '1'='1");
  const [password,       setPassword]       = useState('anything');
  const [fired,          setFired]          = useState(true);   // show result immediately
  const [activeId,       setActiveId]       = useState('bypass-or');
  const [resultKey,      setResultKey]      = useState(0);

  const uInjected = hasInjection(username);
  const pInjected = hasInjection(password);
  const anyInjected = uInjected || pInjected;

  const segs = useMemo(
    () => scenario === 'search' ? buildSearchSegs(username) : buildLoginSegs(username, password),
    [username, password, scenario],
  );

  const result = useMemo<SimResult>(
    () => fired ? simulate(username, password, scenario, secureMode) : { kind: 'fail' },
    [fired, username, password, scenario, secureMode],
  );

  const selectPayload = (p: Payload) => {
    setScenario(p.scenario);
    setUsername(p.username);
    setPassword(p.password);
    setActiveId(p.id);
    setFired(true);
    setResultKey(k => k + 1);
  };

  const handleSecureToggle = (val: boolean) => {
    setSecureMode(val);
    setFired(false);
    setResultKey(k => k + 1);
  };

  const activePayload = PAYLOADS.find(p => p.id === activeId);

  return (
    <Root>
      <GlobalStyle />

      <Header>
        <div>
          <Title>SQL Breach Simulator</Title>
          <Subtitle>Type payloads · watch the query build live · compare vulnerable vs. parameterized</Subtitle>
        </div>
        <HeaderBadge>local · demo db · educational</HeaderBadge>
      </Header>

      {/* Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <ModeRow>
          <ModeBtn $active={!secureMode} onClick={() => handleSecureToggle(false)}>
            <ShieldX size={12} /> Vulnerable
          </ModeBtn>
          <ModeBtn $active={secureMode} $secure onClick={() => handleSecureToggle(true)}>
            <ShieldCheck size={12} /> Parameterized
          </ModeBtn>
        </ModeRow>
        <span style={{ fontSize: '0.71rem', color: T.inkLight }}>
          {secureMode
            ? 'User input is bound as data — SQL structure cannot be altered.'
            : 'Input is concatenated directly into the query — try the payloads or type your own.'}
        </span>
      </div>

      <Layout>
        {/* Left: payload library */}
        <Sidebar>
          <SideCard>
            <SideHead><Zap size={10} /> Attack Library — click to load</SideHead>
            {PAYLOADS.map(p => (
              <PayloadBtn key={p.id} $active={activeId === p.id} onClick={() => selectPayload(p)}>
                <PDot $type={p.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <PLabel>{p.label}</PLabel>
                </div>
                <TypeChip $type={p.type}>{p.type}</TypeChip>
              </PayloadBtn>
            ))}
          </SideCard>

          {activePayload && (
            <InfoBox>
              <Info size={13} style={{ flexShrink: 0, marginTop: '0.1rem', color: T.inkFaint }} />
              <span>{activePayload.description}</span>
            </InfoBox>
          )}
        </Sidebar>

        {/* Right: interactive panel */}
        <MainCol>

          {/* Input form */}
          <PanelCard>
            <PanelHead $danger={anyInjected && !secureMode} $safe={secureMode}>
              <PanelTitle>
                <Database size={11} />
                {scenario === 'login' ? 'Login Form → users table' : 'Search Form → products table'}
              </PanelTitle>
              {anyInjected && !secureMode
                ? <PanelStatus $danger>PAYLOAD ACTIVE</PanelStatus>
                : secureMode
                  ? <PanelStatus $safe>PROTECTED</PanelStatus>
                  : null}
            </PanelHead>
            <PanelBody>
              <FormGrid>
                {scenario === 'login' ? (
                  <>
                    <FormLabel>Username</FormLabel>
                    <FormInput
                      $injected={uInjected && !secureMode}
                      value={username}
                      onChange={e => { setUsername(e.target.value); setFired(false); }}
                      placeholder="username"
                      spellCheck={false}
                    />
                    <FormLabel>Password</FormLabel>
                    <FormInput
                      $injected={pInjected && !secureMode}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setFired(false); }}
                      placeholder="password"
                      spellCheck={false}
                    />
                  </>
                ) : (
                  <>
                    <FormLabel>Search</FormLabel>
                    <FormInput
                      $injected={uInjected && !secureMode}
                      value={username}
                      onChange={e => { setUsername(e.target.value); setFired(false); }}
                      placeholder="product name…"
                      spellCheck={false}
                    />
                  </>
                )}
              </FormGrid>
              <BtnRow>
                <InjectBtn onClick={() => { setFired(true); setResultKey(k => k + 1); }}>
                  <Play size={12} /> {secureMode ? 'Execute (Safe)' : anyInjected ? 'Inject & Execute' : 'Execute'}
                </InjectBtn>
                <ResetBtn onClick={() => { setUsername(''); setPassword(''); setFired(false); setActiveId(''); }}>
                  <RotateCcw size={10} /> Clear
                </ResetBtn>
              </BtnRow>
              {secureMode && (
                <SecureHint>
                  <ShieldCheck size={11} /> Injection characters have no effect — input is bound, not concatenated.
                </SecureHint>
              )}
            </PanelBody>
          </PanelCard>

          {/* Live SQL preview */}
          <PanelCard>
            <PanelHead $danger={anyInjected && !secureMode} $safe={secureMode && anyInjected}>
              <PanelTitle><ChevronRight size={11} /> Live SQL Query</PanelTitle>
              <PanelStatus $danger={anyInjected && !secureMode} $safe={secureMode}>
                {secureMode ? 'parameterized' : anyInjected ? 'unsanitized · danger' : 'safe input'}
              </PanelStatus>
            </PanelHead>
            <PanelBody>
              <SqlView segs={segs} secureMode={secureMode} username={username} password={password} />
            </PanelBody>
          </PanelCard>

          {/* Result */}
          {fired && (
            <PanelCard key={resultKey}>
              <PanelHead
                $danger={!secureMode && (result.kind === 'dump' || result.kind === 'error' || (result.kind === 'success' && !!result.allRows))}
                $safe={result.kind === 'success' && !result.allRows || (secureMode && result.kind !== 'fail')}
              >
                <PanelTitle><Database size={11} /> Database Response</PanelTitle>
                <PanelStatus style={{ color: T.inkFaint, fontSize: '0.58rem', fontFamily: T.mono }}>
                  simulated · demo only
                </PanelStatus>
              </PanelHead>
              <PanelBody>
                <ResultView result={result} secureMode={secureMode} />
              </PanelBody>
            </PanelCard>
          )}

        </MainCol>
      </Layout>
    </Root>
  );
}
