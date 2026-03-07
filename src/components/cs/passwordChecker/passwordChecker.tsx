// src/components/cs/passwordChecker/passwordChecker.tsx
'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  Lock, Eye, EyeOff, RefreshCw, Copy, Check,
  ShieldCheck, ShieldX, ShieldAlert, X, AlertTriangle,
  Shuffle, Hash, Database, Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const stepIn = keyframes`
  from { opacity: 0; transform: translateX(-4px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const barGrow = keyframes`from { width: 0; }`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.5}`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`;

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — identical to invoiceDigitalizer / virusChecker
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
// ANALYSIS ENGINE
// ─────────────────────────────────────────────────────────────────────────────
type Strength = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

interface PatternFlag {
  id: string;
  label: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
}

interface EntropyBreakdown {
  lengthBits:  number;
  charsetBits: number;   // log2(charsetSize) — contribution per character
  total:       number;
}

interface PasswordResult {
  password:         string;
  strength:         Strength;
  score:            number;
  entropy:          number;
  charsetSize:      number;
  entropyBreakdown: EntropyBreakdown;
  crackTimes:       { label: string; time: string; fast: boolean }[];
  patterns:         PatternFlag[];
  charBreakdown:    { label: string; count: number; chars: string; color: string }[];
  mutations:        string[];   // rule-based variations an attacker would try
}

const COMMON_WORDS = [
  'password','passw0rd','letmein','welcome','monkey','dragon','master','sunshine',
  'princess','football','baseball','shadow','superman','batman','trustno1','qwerty',
  'azerty','iloveyou','abc123','123456','111111','123123','654321','admin','login',
  'access','solo','michael','jessica','ashley','bailey','hunter','ranger','test',
];

const KEYBOARD_WALKS = [
  'qwerty','qwertyuiop','asdfgh','asdfghjkl','zxcvbn','zxcvbnm',
  '1qaz2wsx','1q2w3e4r','qazwsx','12345','123456','1234567','12345678','123456789',
  'poiuyt','lkjhgf','mnbvcx',
];

const LEET_MAP: Record<string, string> = {
  '4':'a','@':'a','3':'e','1':'i','!':'i','0':'o','$':'s','5':'s',
  '7':'t','8':'b','6':'g','9':'g','|':'l','(':'c','+':'t',
};

function deLeeet(s: string): string {
  return s.toLowerCase().split('').map(c => LEET_MAP[c] ?? c).join('');
}

function calcEntropy(password: string): { entropy: number; charsetSize: number; breakdown: EntropyBreakdown } {
  let cs = 0;
  if (/[a-z]/.test(password)) cs += 26;
  if (/[A-Z]/.test(password)) cs += 26;
  if (/[0-9]/.test(password)) cs += 10;
  if (/[^a-zA-Z0-9]/.test(password)) cs += 32;
  const charsetBits = cs > 0 ? Math.log2(cs) : 0;
  const total       = Math.round(charsetBits * password.length * 10) / 10;
  return {
    entropy: total,
    charsetSize: cs,
    breakdown: { lengthBits: password.length, charsetBits: Math.round(charsetBits * 10) / 10, total },
  };
}

function fmtCrackTime(seconds: number): string {
  if (seconds < 1)        return '< 1 second';
  if (seconds < 60)       return `${Math.round(seconds)} sec`;
  if (seconds < 3600)     return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400)    return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000)  return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  const y = seconds / 31536000;
  if (y < 1e3)  return `${Math.round(y)} years`;
  if (y < 1e6)  return `${(y / 1e3).toFixed(1)}k years`;
  if (y < 1e9)  return `${(y / 1e6).toFixed(1)}M years`;
  if (y < 1e12) return `${(y / 1e9).toFixed(1)}B years`;
  return '> 1 trillion years';
}

function isFast(seconds: number) { return seconds < 86400; } // under a day = "fast"

function crackSeconds(entropy: number, gps: number): number {
  return Math.pow(2, Math.max(0, entropy - 1)) / gps;
}

function buildMutations(password: string): string[] {
  const base = password.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (!base || base.length < 3) return [];
  const mutations: string[] = [];
  mutations.push(base + '1');
  mutations.push(base + '123');
  mutations.push(base + '!');
  mutations.push(base[0].toUpperCase() + base.slice(1));
  mutations.push(base[0].toUpperCase() + base.slice(1) + '1');
  mutations.push(base[0].toUpperCase() + base.slice(1) + '!');
  // leet substitutions
  const leetted = base.replace(/a/g,'@').replace(/e/g,'3').replace(/i/g,'1').replace(/o/g,'0').replace(/s/g,'$');
  if (leetted !== base) mutations.push(leetted);
  mutations.push(base + new Date().getFullYear());
  mutations.push(base + (new Date().getFullYear() - 1));
  return [...new Set(mutations)].slice(0, 6);
}

function analyzePassword(password: string): PasswordResult {
  if (!password) return {
    password, strength: 'very-weak', score: 0, entropy: 0, charsetSize: 0,
    entropyBreakdown: { lengthBits: 0, charsetBits: 0, total: 0 },
    crackTimes: [], patterns: [], charBreakdown: [], mutations: [],
  };

  const { entropy, charsetSize, breakdown } = calcEntropy(password);
  const lower  = password.toLowerCase();
  const deleet = deLeeet(lower);
  const patterns: PatternFlag[] = [];

  // ── length ──
  if (password.length < 8) {
    patterns.push({ id: 'too-short', label: 'Too short', detail: `${password.length} characters — minimum recommended is 12. Length is the single biggest factor in password strength.`, severity: 'critical' });
  } else if (password.length < 12) {
    patterns.push({ id: 'short', label: 'Below recommended length', detail: `${password.length} characters. 12+ is the current recommendation for most accounts; 16+ for high-value ones.`, severity: 'high' });
  } else if (password.length >= 20) {
    patterns.push({ id: 'long', label: 'Excellent length', detail: `${password.length} characters — length alone makes this significantly harder to brute-force.`, severity: 'good' });
  }

  // ── common passwords ──
  const isExactCommon = COMMON_WORDS.some(w => lower === w || deleet === w);
  const hasCommonSub  = !isExactCommon && COMMON_WORDS.some(w => lower.includes(w) || deleet.includes(w));
  if (isExactCommon) {
    patterns.push({ id: 'common', label: 'Extremely common password', detail: 'This exact password (or a leet variant) appears in breach databases and will be tried in the first seconds of any attack.', severity: 'critical' });
  } else if (hasCommonSub) {
    patterns.push({ id: 'common-substr', label: 'Contains a common word', detail: 'A well-known password word is embedded here. Attackers use dictionary + rule-based attacks that catch these within minutes.', severity: 'high' });
  }

  // ── keyboard walks ──
  if (KEYBOARD_WALKS.some(w => lower.includes(w))) {
    patterns.push({ id: 'keyboard', label: 'Keyboard walk detected', detail: 'Sequential key patterns (qwerty, asdf, 12345) are stored in every cracking wordlist and tried immediately.', severity: 'high' });
  }

  // ── sequential chars ──
  let seqLen = 1, maxSeq = 1;
  for (let i = 1; i < password.length; i++) {
    const diff = password.charCodeAt(i) - password.charCodeAt(i - 1);
    seqLen = (diff === 1 || diff === -1) ? seqLen + 1 : 1;
    maxSeq = Math.max(maxSeq, seqLen);
  }
  if (maxSeq >= 4) {
    patterns.push({ id: 'sequential', label: 'Long sequential run', detail: `A run of ${maxSeq} consecutive characters (e.g. abcde, 12345) collapses entropy significantly.`, severity: 'medium' });
  }

  // ── repeats ──
  const repeatMatch = password.match(/(.)\1{2,}/g);
  if (repeatMatch) {
    patterns.push({ id: 'repeat', label: 'Repeated characters', detail: `"${repeatMatch[0]}" — runs of the same character add almost no entropy while using up length.`, severity: 'medium' });
  }

  // ── year / date ──
  if (/(?:19|20)\d{2}/.test(password)) {
    patterns.push({ id: 'year', label: 'Contains a year', detail: 'Birth years, graduation years and similar dates are among the top rule-based mutations attackers apply to wordlist entries.', severity: 'medium' });
  }

  // ── name-like capitalisation ──
  if (/^[A-Z][a-z]+/.test(password)) {
    patterns.push({ id: 'name-cap', label: 'Name-style capitalisation', detail: 'A single leading capital followed by lowercase mirrors how people write names or words — a very common and targeted pattern.', severity: 'low' });
  }

  // ── character class coverage ──
  const hasLower  = /[a-z]/.test(password);
  const hasUpper  = /[A-Z]/.test(password);
  const hasDigit  = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const classCnt  = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (!hasUpper)  patterns.push({ id: 'no-upper',  label: 'No uppercase letters', detail: 'Adds 26 more characters to the search space, multiplying crack time by ~2× per character.', severity: 'low' });
  if (!hasDigit)  patterns.push({ id: 'no-digit',  label: 'No digits',            detail: 'Digits add 10 characters to the charset, a modest but free boost.', severity: 'low' });
  if (!hasSymbol) patterns.push({ id: 'no-symbol', label: 'No special characters', detail: '~32 printable symbols expand the charset significantly — one symbol can be worth several extra characters of length.', severity: 'low' });

  if (classCnt === 4 && password.length >= 12) {
    patterns.push({ id: 'all-classes', label: 'All character classes used', detail: 'Lowercase, uppercase, digits, and symbols — maximum character set coverage.', severity: 'good' });
  }

  // ── leet speak ──
  if (deleet !== lower && COMMON_WORDS.some(w => deleet.includes(w))) {
    patterns.push({ id: 'leet', label: 'Leet substitution of common word', detail: 'Substituting letters for numbers (p4ssw0rd) is well-documented and every serious cracking tool applies leet rules automatically.', severity: 'high' });
  }

  // ── score ──
  let score = Math.min(100, Math.round((entropy / 80) * 100));
  if (isExactCommon)                                           score = Math.min(score, 5);
  if (patterns.some(p => p.id === 'too-short'))                score = Math.min(score, 20);
  if (patterns.some(p => p.id === 'common-substr'))            score = Math.max(0, score - 20);
  if (patterns.some(p => p.id === 'keyboard'))                 score = Math.max(0, score - 15);
  if (patterns.some(p => p.id === 'leet'))                     score = Math.max(0, score - 15);
  if (patterns.some(p => p.id === 'sequential'))               score = Math.max(0, score - 10);
  if (patterns.some(p => p.id === 'repeat'))                   score = Math.max(0, score - 10);
  score = Math.max(0, Math.min(100, score));

  const strength: Strength =
    score < 15 ? 'very-weak' :
    score < 35 ? 'weak'      :
    score < 55 ? 'fair'      :
    score < 78 ? 'strong'    : 'very-strong';

  // ── crack times ──
  const crackTimes = [
    { label: 'Online attack (100/s)',      time: fmtCrackTime(crackSeconds(entropy, 1e2)),  fast: isFast(crackSeconds(entropy, 1e2))  },
    { label: 'Throttled (10k/s)',          time: fmtCrackTime(crackSeconds(entropy, 1e4)),  fast: isFast(crackSeconds(entropy, 1e4))  },
    { label: 'Offline bcrypt (100k/s)',    time: fmtCrackTime(crackSeconds(entropy, 1e5)),  fast: isFast(crackSeconds(entropy, 1e5))  },
    { label: 'Offline MD5 (10B/s)',        time: fmtCrackTime(crackSeconds(entropy, 1e10)), fast: isFast(crackSeconds(entropy, 1e10)) },
    { label: 'GPU cluster (1T/s)',         time: fmtCrackTime(crackSeconds(entropy, 1e12)), fast: isFast(crackSeconds(entropy, 1e12)) },
  ];

  // ── char breakdown with colours ──
  const lowerChars  = (password.match(/[a-z]/g)      ?? []).join('');
  const upperChars  = (password.match(/[A-Z]/g)      ?? []).join('');
  const digitChars  = (password.match(/[0-9]/g)      ?? []).join('');
  const symbolChars = (password.match(/[^a-zA-Z0-9]/g) ?? []).join('');
  const charBreakdown = [
    { label: 'Lowercase', count: lowerChars.length,  chars: lowerChars,  color: T.accent  },
    { label: 'Uppercase', count: upperChars.length,  chars: upperChars,  color: T.amber   },
    { label: 'Digits',    count: digitChars.length,  chars: digitChars,  color: T.green   },
    { label: 'Symbols',   count: symbolChars.length, chars: symbolChars, color: T.red     },
  ].filter(c => c.count > 0);

  // ── mutation candidates ──
  const mutations = (hasCommonSub || isExactCommon || patterns.some(p => p.id === 'leet'))
    ? buildMutations(password)
    : [];

  return { password, strength, score, entropy, charsetSize, entropyBreakdown: breakdown, crackTimes, patterns, charBreakdown, mutations };
}

// ─────────────────────────────────────────────────────────────────────────────
// HIBP CHECK — k-anonymity, only first 5 hex chars of SHA-1 ever leave device
// ─────────────────────────────────────────────────────────────────────────────
async function sha1Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function checkHibp(password: string): Promise<number> {
  const hash   = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res    = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' } });
  if (!res.ok) throw new Error('HIBP unreachable');
  const text = await res.text();
  const line = text.split('\n').find(l => l.startsWith(suffix));
  return line ? parseInt(line.split(':')[1].trim(), 10) : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR — random chars + passphrase
// ─────────────────────────────────────────────────────────────────────────────
const LOWER_C   = 'abcdefghijklmnopqrstuvwxyz';
const UPPER_C   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS_C  = '0123456789';
const SYMBOLS_C = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function generateRandom(length: number, useUpper: boolean, useDigits: boolean, useSymbols: boolean): string {
  let charset = LOWER_C;
  const required = [LOWER_C[Math.floor(Math.random() * 26)]];
  if (useUpper)   { charset += UPPER_C;   required.push(UPPER_C[Math.floor(Math.random()   * 26)]); }
  if (useDigits)  { charset += DIGITS_C;  required.push(DIGITS_C[Math.floor(Math.random()  * 10)]); }
  if (useSymbols) { charset += SYMBOLS_C; required.push(SYMBOLS_C[Math.floor(Math.random() * SYMBOLS_C.length)]); }
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  const result = Array.from(arr).map(n => charset[n % charset.length]);
  required.forEach((ch, i) => { result[i] = ch; });
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join('');
}

// ~2048 word EFF-style shortlist (abbreviated — real use would import full list)
const WORDLIST = [
  'abacus','abbey','abbot','above','abuse','abyss','acorn','acres','actor','acute',
  'added','adept','admit','adobe','adopt','adult','after','again','agile','aging',
  'agony','agree','ahead','aired','aisle','alarm','album','alder','alert','alike',
  'alive','alley','allot','allow','alloy','aloft','alone','along','aloof','aloud',
  'altar','alter','angel','angle','angry','anime','ankle','annex','anvil','apart',
  'apple','apply','apron','aptly','arbor','ardor','arena','argon','arise','armed',
  'armor','aroma','array','arrow','ashen','aspen','asset','atlas','attic','audio',
  'audit','augur','avail','avid','avoid','awake','award','awe','axle','azure',
  'badge','bagel','baker','banjo','baron','basil','batch','bayou','beach','beard',
  'beast','beets','begun','bench','birch','bison','blade','blame','bland','blaze',
  'bleat','bleed','blend','bless','blind','bliss','block','blood','blown','blues',
  'blunt','blurb','blurt','blush','board','bogus','bonus','booze','bound','boxer',
  'brace','braid','brain','brave','bread','bream','breed','breve','brick','bride',
  'brine','brink','brisk','broil','broke','brood','brook','broth','brown','brush',
  'budge','build','bulge','bunch','burly','burnt','burro','cabal','cadet','camel',
  'canal','candy','cargo','carol','carry','catch','cedar','chain','chair','chalk',
  'champ','chant','chaos','chard','charm','chart','chase','cheap','cheek','chess',
  'chest','chick','chief','child','chill','chime','choir','chord','chore','chose',
  'churn','cider','cinch','civic','civil','clamp','clang','clank','clash','clasp',
  'class','clean','clear','clerk','cliff','cling','clink','cloak','clock','cloth',
  'cloud','clout','coach','coast','comet','comic','comma','coral','couch','cough',
  'could','count','craft','crane','crash','cream','creek','crest','crisp','cross',
  'crowd','crown','crush','curve','cycle','daisy','dance','denim','depot','derby',
  'depth','digit','dirge','disco','ditch','ditty','dizzy','dodge','dogma','doing',
  'doubt','dough','dowry','draft','drain','drama','drape','drawl','dread','dream',
  'drill','drive','droop','drove','druid','drums','dunce','dwarf','eager','eagle',
  'early','earth','easel','eight','elder','elfin','elite','ember','empty','enamel',
  'equip','ethic','evade','event','every','exist','expel','extra','fable','facet',
  'fairy','faith','falls','fancy','fargo','feast','femur','fence','ferry','fever',
  'fiber','field','fifth','fifty','fight','finch','fired','first','fixed','fjord',
  'flame','flank','flare','flash','flask','flaunt','fleet','flesh','float','flood',
  'flora','flour','flute','foamy','focal','focus','folly','force','forge','forth',
  'forum','frail','frame','frank','fraud','freak','fresh','friar','front','frost',
  'frugal','fungi','funky','gable','gecko','geese','ghost','girth','given','gland',
  'glass','gleam','glean','glide','glint','gloom','gloss','glove','glyph','gnome',
  'golem','gorge','gouge','gourd','grace','grade','graft','grain','grant','grasp',
  'grass','gravel','graze','greed','greet','grill','grimy','grind','gripe','grove',
  'growl','guild','guile','guise','gusto','habit','haiku','halve','handy','hardy',
  'hatch','haunt','haven','helix','hence','herbs','heron','hiked','hinge','hippo',
  'hoard','holly','honey','honor','horde','horse','hotel','hound','house','hover',
  'hurry','hyena','ideal','igloo','image','imply','inept','infer','infix','ingot',
  'inlet','inner','input','inter','ionic','irate','ivory','jazzy','jerky','joint',
  'joker','joust','judge','juice','jumbo','jumpy','kayak','kebab','knack','knave',
  'kneel','knelt','knife','knoll','known','koala','kudos','label','lance','lanky',
  'lapel','laser','latch','later','lathe','layer','leapt','learn','leash','ledge',
  'legal','lemon','level','light','lilac','limit','liner','lingo','lodge','logic',
  'loopy','lorry','lotus','lover','loyal','lucid','lunar','lusty','lying','lyric',
  'magic','major','maker','manor','maple','march','mason','match','maxim','mayor',
  'meant','medal','mercy','merit','metal','micro','might','mimic','minor','minus',
  'model','mogul','moose','moral','mourn','muddy','mulch','mural','murky','music',
  'naive','nerve','never','night','ninja','noble','noise','north','notch','novel',
  'nymph','oaken','octet','omega','onion','onset','opera','orbit','order','organ',
  'other','otter','outer','outdo','oxide','ozone','paint','pairs','panic','panel',
  'paper','parka','parse','pasta','patch','pause','peace','pearl','penal','perch',
  'petty','phase','piano','pixel','pizza','plain','plane','plant','plasm','plate',
  'plaza','pluck','plumb','plume','plunk','plush','poem','point','polar','poppy',
  'porch','pound','power','press','pride','prime','privy','probe','prone','proof',
  'prose','proud','prude','prune','psalm','pubic','pudgy','pulse','punch','pupil',
  'purge','pygmy','quaff','qualm','quash','quasi','queen','query','quest','queue',
  'quick','quiet','quota','quote','rabbi','rabid','radar','radix','rainy','rally',
  'rapid','raven','reach','ready','reap','recap','relay','relic','repay','reset',
  'resin','revel','rifle','ripen','risen','risky','rival','rivet','robin','rocky',
  'rogue','roomy','roost','rouge','rough','rowdy','ruler','rural','rustic','sadly',
  'saint','salsa','sandy','sauce','savor','scald','scalp','scant','scamp','scone',
  'scope','score','scout','seize','serif','serve','seven','sever','shack','shaft',
  'shale','shall','shame','shape','share','shark','sheen','sheer','shift','shoal',
  'shout','showy','shrug','sigma','silky','simile','simmer','since','sixth','sixty',
  'sized','skunk','slate','sleet','slept','slice','slick','slide','slope','sloth',
  'slump','slurp','small','smart','smear','smell','smile','smith','smolt','snack',
  'snake','snare','sneak','snide','snowy','snuff','sober','solar','solid','solve',
  'sonic','south','space','spade','spare','spark','spawn','speak','spear','speed',
  'spelt','spend','spill','spine','spoil','spoke','sport','spray','squad','squat',
  'squid','stack','staff','stage','stain','stale','stall','stark','start','state',
  'stave','stays','steam','steel','steep','steer','stern','stick','stiff','still',
  'sting','stomp','stone','stood','stool','store','storm','story','stout','stove',
  'strap','stray','strip','strut','study','stump','swamp','swear','sweep','sweet',
  'swept','swift','swipe','sword','swore','synth','tabby','taboo','taffy','tasty',
  'taunt','teach','tenet','tense','tepid','terse','thorn','those','three','threw',
  'throw','thumb','tidal','tilde','timid','tipsy','tithe','title','today','token',
  'tonal','tonic','topaz','torch','total','totem','touch','tough','towel','tower',
  'toxic','trace','track','trade','trail','train','trait','tramp','tread','trend',
  'trial','tribe','trick','tried','troop','trout','trove','truce','truly','trunk',
  'trust','truth','tulip','tummy','tuner','tunic','tutor','twice','twist','tying',
  'ulcer','ultra','umbra','uncle','under','unify','union','unity','until','upper',
  'usher','usual','utter','valid','valor','valve','vapor','vault','vaunt','vicar',
  'video','vigor','viral','visor','vista','vital','vivid','vocal','vouch','vowel',
  'vying','waded','waltz','waste','watch','water','weave','wedge','weedy','weigh',
  'weird','whack','wharf','wheat','wheel','where','while','whimsy','whisk','white',
  'whose','widen','witch','women','world','wormy','worst','worth','would','woven',
  'wrath','wring','wrote','yacht','yearn','yield','young','youth','zonal','zebra',
];

function generatePassphrase(words: number, useDigit: boolean, useSymbol: boolean): string {
  const arr = new Uint32Array(words);
  crypto.getRandomValues(arr);
  const chosen = Array.from(arr).map(n => WORDLIST[n % WORDLIST.length]);
  let phrase = chosen.join('-');
  if (useDigit)  phrase += '-' + Math.floor(Math.random() * 90 + 10);
  if (useSymbol) phrase += ['!','@','#','$','&','*'][Math.floor(Math.random() * 6)];
  return phrase;
}

// ─────────────────────────────────────────────────────────────────────────────
// STRENGTH CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STRENGTH_CFG: Record<Strength, {
  label: string; color: string; bg: string; border: string;
  gradient: string; iconFg: string; iconBg: string; titleColor: string; subColor: string;
}> = {
  'very-weak':   { label:'Very Weak',   color:T.red,     bg:T.redBg,                   border:'rgba(220,38,38,0.2)',  gradient:'linear-gradient(135deg,#fff5f5,#fef2f2)', iconFg:T.red,     iconBg:T.redBg,                   titleColor:'#991b1b', subColor:T.red     },
  'weak':        { label:'Weak',        color:'#c2410c', bg:'rgba(194,65,12,0.07)',     border:'rgba(194,65,12,0.2)', gradient:'linear-gradient(135deg,#fff7ed,#ffedd5)', iconFg:'#c2410c', iconBg:'rgba(194,65,12,0.08)',     titleColor:'#7c2d12', subColor:'#c2410c' },
  'fair':        { label:'Fair',        color:T.amber,   bg:T.amberBg,                 border:'rgba(180,83,9,0.2)',  gradient:'linear-gradient(135deg,#fffbeb,#fef3c7)', iconFg:T.amber,   iconBg:T.amberBg,                 titleColor:'#92400e', subColor:T.amber   },
  'strong':      { label:'Strong',      color:'#0d7eca', bg:'rgba(13,126,202,0.07)',    border:'rgba(13,126,202,0.18)',gradient:'linear-gradient(135deg,#eff6ff,#dbeafe)', iconFg:'#0d7eca', iconBg:'rgba(13,126,202,0.08)',    titleColor:'#1e3a8a', subColor:'#0d7eca' },
  'very-strong': { label:'Very Strong', color:T.green,   bg:T.greenBg,                 border:'rgba(22,163,74,0.2)', gradient:'linear-gradient(135deg,#f0fdf4,#dcfce7)', iconFg:T.green,   iconBg:T.greenBg,                 titleColor:'#14532d', subColor:T.green   },
};

const SEV_CFG: Record<PatternFlag['severity'], { color: string; bg: string; border: string }> = {
  critical: { color:T.red,      bg:T.redBg,                   border:'rgba(220,38,38,0.2)'  },
  high:     { color:'#c2410c',  bg:'rgba(194,65,12,0.07)',     border:'rgba(194,65,12,0.18)' },
  medium:   { color:T.amber,    bg:T.amberBg,                  border:'rgba(180,83,9,0.2)'   },
  low:      { color:T.accent,   bg:T.accentBg,                 border:'rgba(37,99,235,0.18)' },
  good:     { color:T.green,    bg:T.greenBg,                  border:'rgba(22,163,74,0.2)'  },
};
const SEV_BAR: Record<PatternFlag['severity'], string> = {
  critical:T.red, high:'#c2410c', medium:T.amber, low:T.accent, good:T.green,
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLED COMPONENTS
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

const Title    = styled.h1`font-family:${T.serif};font-size:clamp(1.8rem,4vw,2.6rem);font-weight:400;letter-spacing:-0.02em;line-height:1.1;margin:0 0 0.25rem;color:${T.ink};`;
const Subtitle = styled.p`font-size:0.82rem;color:${T.inkLight};margin:0;font-weight:300;letter-spacing:0.02em;`;

const HeaderBadge = styled.div`
  font-family:${T.mono};font-size:0.65rem;color:${T.inkFaint};
  text-transform:uppercase;letter-spacing:0.15em;
  padding:0.35rem 0.7rem;border:1px solid ${T.creamDeep};
  border-radius:999px;background:${T.creamDark};white-space:nowrap;
`;

// ── Input card ──
const InputCard     = styled.div`background:white;border:1px solid ${T.rule};border-radius:${T.radius};box-shadow:${T.shadow};overflow:hidden;`;
const InputCardHead = styled.div`
  padding:0.75rem 1rem;border-bottom:1px solid ${T.ruleMid};background:${T.creamDark};
  display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;
`;
const InputCardLabel = styled.div`font-family:${T.mono};font-size:0.62rem;color:${T.inkFaint};text-transform:uppercase;letter-spacing:0.12em;`;
const InputCardBody  = styled.div`padding:1rem;`;

// FIX: white background, ink border on focus — no blue
const PasswordRow = styled.div`
  display:flex;align-items:center;gap:0.5rem;
  background:white;
  border:1.5px solid ${T.creamDeep};
  border-radius:${T.radiusSm};
  padding:0.55rem 0.75rem;
  transition:border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color:${T.inkMid};
    box-shadow:0 0 0 3px rgba(26,18,8,0.06);
  }
`;

const PasswordInput = styled.input`
  flex:1;border:none;background:transparent;
  padding: 0.3rem;
  border-radius:4px;
  font-family:${T.mono};font-size:1rem;color:${T.ink};
  outline:none;letter-spacing:0.05em;min-width:0;
  &::placeholder{color:${T.inkFaint};letter-spacing:0;font-family:${T.sans};font-size:0.85rem;}
`;

const IconBtn = styled.button`
  flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;
  border:none;background:transparent;color:${T.inkFaint};cursor:pointer;border-radius:6px;transition:all 0.15s;
  &:hover{background:${T.creamDark};color:${T.inkMid};}
`;

// ── Strength meter ──
const MeterWrap = styled.div`margin-top:0.85rem;`;
const MeterRow  = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;`;
const MeterLabel = styled.span`font-size:0.72rem;color:${T.inkLight};`;
const MeterScore = styled.span<{$s:Strength}>`font-family:${T.mono};font-size:0.72rem;font-weight:600;color:${p=>STRENGTH_CFG[p.$s].color};`;
const MeterTrack = styled.div`height:5px;background:${T.creamDeep};border-radius:999px;overflow:hidden;`;
const MeterFill  = styled.div<{$pct:number;$s:Strength}>`
  height:100%;width:${p=>p.$pct}%;background:${p=>STRENGTH_CFG[p.$s].color};
  border-radius:999px;transition:width 0.4s ease,background 0.3s;animation:${barGrow} 0.4s ease;
`;
const SegmentRow = styled.div`display:flex;gap:3px;margin-top:0.35rem;`;
const Segment    = styled.div<{$active:boolean;$s:Strength}>`
  flex:1;height:3px;border-radius:2px;
  background:${p=>p.$active?STRENGTH_CFG[p.$s].color:T.creamDeep};transition:background 0.3s;
`;

// ── Entropy visual ──
const EntropyWrap  = styled.div`margin-top:0.9rem;padding-top:0.85rem;border-top:1px solid ${T.ruleMid};`;
const EntropyLabel = styled.div`font-size:0.65rem;color:${T.inkFaint};font-family:${T.mono};text-transform:uppercase;letter-spacing:0.09em;margin-bottom:0.55rem;`;
const EntropyTrack = styled.div`display:flex;height:8px;border-radius:999px;overflow:hidden;gap:2px;`;
const EntropyFill  = styled.div<{$pct:number;$color:string}>`
  height:100%;width:${p=>p.$pct}%;background:${p=>p.$color};border-radius:999px;
  transition:width 0.4s ease;animation:${barGrow} 0.4s ease;
`;
const EntropyLegend = styled.div`display:flex;gap:1rem;margin-top:0.45rem;flex-wrap:wrap;`;
const EntropyItem   = styled.div<{$c:string}>`
  display:flex;align-items:center;gap:0.3rem;font-size:0.62rem;color:${T.inkLight};
  &::before{content:'';width:8px;height:8px;border-radius:50%;background:${p=>p.$c};flex-shrink:0;}
`;

// ── Layout ──
const Divider      = styled.hr`border:none;border-top:1px solid ${T.rule};margin:2rem 0;`;
const SectionTitle = styled.h2`
  font-family:${T.serif};font-size:1.4rem;font-weight:400;letter-spacing:-0.01em;
  margin:0 0 1.25rem;color:${T.ink};display:flex;align-items:baseline;gap:0.6rem;
  span{font-family:${T.mono};font-size:0.7rem;color:${T.inkFaint};font-weight:400;letter-spacing:0.05em;}
`;

// ── Verdict card ──
const VerdictCard   = styled.div<{$s:Strength}>`
  background:white;border:1px solid ${p=>STRENGTH_CFG[p.$s].border};
  border-radius:${T.radius};overflow:hidden;box-shadow:${T.shadow};
  animation:${fadeSlideUp} 0.3s ease both;margin-bottom:0.75rem;
`;
const VerdictHeader = styled.div<{$s:Strength}>`
  padding:0.9rem 1rem 0.75rem;border-bottom:1px solid ${T.ruleMid};
  background:${p=>STRENGTH_CFG[p.$s].gradient};
  display:flex;align-items:center;gap:0.85rem;flex-wrap:wrap;row-gap:0.5rem;
`;
const VerdictIconBox = styled.div<{$s:Strength}>`
  flex-shrink:0;width:40px;height:40px;border-radius:10px;
  background:${p=>STRENGTH_CFG[p.$s].iconBg};border:1px solid ${p=>STRENGTH_CFG[p.$s].border};
  display:flex;align-items:center;justify-content:center;color:${p=>STRENGTH_CFG[p.$s].iconFg};
`;
const VerdictText  = styled.div`flex:1;min-width:0;`;
const VerdictTitle = styled.div<{$s:Strength}>`font-family:${T.serif};font-size:1.05rem;font-weight:400;letter-spacing:-0.01em;color:${p=>STRENGTH_CFG[p.$s].titleColor};`;
const VerdictSub   = styled.div<{$s:Strength}>`font-size:0.72rem;color:${p=>STRENGTH_CFG[p.$s].subColor};margin-top:0.15rem;line-height:1.5;`;
const StatRow = styled.div`display:flex;gap:1rem;flex-shrink:0;flex-wrap:wrap;`;
const Stat    = styled.div`display:flex;flex-direction:column;align-items:flex-end;gap:0.06rem;`;
const StatVal   = styled.div`font-family:${T.mono};font-size:0.95rem;font-weight:600;color:${T.ink};line-height:1;`;
const StatLabel = styled.div`font-family:${T.mono};font-size:0.54rem;color:${T.inkFaint};text-transform:uppercase;letter-spacing:0.1em;`;

// ── HIBP ──
const HibpCard = styled.div<{$state:'idle'|'loading'|'clean'|'pwned'|'error'}>`
  border-radius:${T.radius};overflow:hidden;box-shadow:${T.shadow};
  border:1px solid ${p=>p.$state==='pwned'?'rgba(220,38,38,0.25)':p.$state==='clean'?'rgba(22,163,74,0.2)':T.rule};
  background:white;animation:${fadeSlideUp} 0.3s ease both;margin-bottom:0.75rem;
`;
const HibpHead = styled.div<{$state:'idle'|'loading'|'clean'|'pwned'|'error'}>`
  padding:0.7rem 1rem;border-bottom:1px solid ${T.ruleMid};
  background:${p=>p.$state==='pwned'?'linear-gradient(135deg,#fff5f5,#fef2f2)':p.$state==='clean'?'linear-gradient(135deg,#f0fdf4,#dcfce7)':T.creamDark};
  display:flex;align-items:center;gap:0.75rem;
`;
const HibpIconBox = styled.div<{$state:'idle'|'loading'|'clean'|'pwned'|'error'}>`
  width:32px;height:32px;border-radius:8px;flex-shrink:0;
  background:${p=>p.$state==='pwned'?T.redBg:p.$state==='clean'?T.greenBg:T.creamDeep};
  border:1px solid ${p=>p.$state==='pwned'?'rgba(220,38,38,0.2)':p.$state==='clean'?'rgba(22,163,74,0.18)':T.rule};
  display:flex;align-items:center;justify-content:center;
  color:${p=>p.$state==='pwned'?T.red:p.$state==='clean'?T.green:T.inkFaint};
  animation:${p=>p.$state==='loading'?pulse:fadeSlideUp} 1s ease ${p=>p.$state==='loading'?'infinite':'both'};
`;
const HibpText  = styled.div`flex:1;`;
const HibpTitle = styled.div<{$state:'idle'|'loading'|'clean'|'pwned'|'error'}>`font-size:0.8rem;font-weight:600;color:${p=>p.$state==='pwned'?'#991b1b':p.$state==='clean'?'#14532d':T.ink};`;
const HibpSub   = styled.div`font-size:0.68rem;color:${T.inkLight};margin-top:0.1rem;line-height:1.5;`;
const HibpBtn   = styled.button`
  padding:0.32rem 0.8rem;border-radius:${T.radiusSm};border:1px solid ${T.rule};
  background:white;color:${T.inkMid};font-size:0.72rem;font-family:${T.sans};
  font-weight:500;cursor:pointer;transition:all 0.15s;flex-shrink:0;
  &:hover{background:${T.creamDark};box-shadow:${T.shadow};}
  &:disabled{opacity:0.45;cursor:not-allowed;}
`;
const HibpNote = styled.div`
  padding:0.5rem 1rem;font-size:0.64rem;color:${T.inkFaint};line-height:1.6;
  font-family:${T.mono};border-top:1px solid ${T.ruleMid};background:${T.cream};
`;

// ── Content row ──
const ContentRow = styled.div`display:flex;gap:0.75rem;@media(max-width:860px){flex-direction:column;}`;
const Sidebar    = styled.div`flex-shrink:0;width:220px;display:flex;flex-direction:column;gap:0.75rem;@media(max-width:860px){width:100%;flex-direction:row;flex-wrap:wrap;}`;
const SideCard   = styled.div`background:white;border:1px solid ${T.rule};border-radius:${T.radius};box-shadow:${T.shadow};overflow:hidden;animation:${fadeSlideUp} 0.3s ease both;@media(max-width:860px){flex:1;min-width:160px;}`;
const SideHead   = styled.div`padding:0.55rem 0.9rem;border-bottom:1px solid ${T.ruleMid};background:${T.creamDark};`;
const SideLabel  = styled.div`font-family:${T.mono};font-size:0.57rem;font-weight:500;color:${T.inkFaint};text-transform:uppercase;letter-spacing:0.1em;`;
const SideBody   = styled.div`padding:0.65rem 0.9rem;`;

const CrackRow   = styled.div<{$i:number}>`display:flex;justify-content:space-between;align-items:baseline;gap:0.4rem;padding:0.22rem 0;border-bottom:1px solid ${T.ruleMid};animation:${stepIn} 0.25s ease ${p=>p.$i*0.06}s both;&:last-child{border-bottom:none;}`;
const CrackLabel = styled.span`font-size:0.64rem;color:${T.inkLight};`;
const CrackVal   = styled.span<{$fast:boolean}>`font-family:${T.mono};font-size:0.64rem;font-weight:600;color:${p=>p.$fast?T.red:T.green};text-align:right;`;

const CharBarRow  = styled.div<{$i:number}>`display:flex;align-items:center;gap:0.5rem;padding:0.18rem 0;animation:${stepIn} 0.25s ease ${p=>p.$i*0.06}s both;`;
const CharBarWrap = styled.div`flex:1;height:4px;background:${T.creamDeep};border-radius:999px;overflow:hidden;`;
const CharBarFill = styled.div<{$pct:number;$c:string}>`height:100%;width:${p=>p.$pct}%;background:${p=>p.$c};border-radius:999px;`;
const CharBarLabel = styled.span`font-size:0.63rem;color:${T.inkLight};min-width:52px;`;
const CharBarCount = styled.span`font-family:${T.mono};font-size:0.63rem;font-weight:600;color:${T.ink};min-width:18px;text-align:right;`;

// ── Main panel ──
const MainPanel  = styled.div`flex:1;min-width:0;background:white;border:1px solid ${T.rule};border-radius:${T.radius};box-shadow:${T.shadow};display:flex;flex-direction:column;overflow:hidden;animation:${fadeSlideUp} 0.3s ease 0.05s both;`;
const PanelHead  = styled.div`flex-shrink:0;padding:0.6rem 0.9rem;border-bottom:1px solid ${T.rule};background:${T.cream};display:flex;align-items:center;justify-content:space-between;gap:0.5rem;`;
const PanelTitle = styled.div`font-family:${T.mono};font-size:0.62rem;color:${T.inkFaint};text-transform:uppercase;letter-spacing:0.1em;display:flex;align-items:center;gap:0.5rem;`;
const CountChip  = styled.span<{$alert?:boolean;$ok?:boolean}>`font-size:0.6rem;font-weight:700;padding:0.06rem 0.36rem;border-radius:999px;font-family:${T.mono};background:${p=>p.$alert?T.redBg:p.$ok?T.greenBg:T.creamDark};color:${p=>p.$alert?T.red:p.$ok?T.green:T.inkLight};`;
const ScrollArea = styled.div`flex:1;overflow-y:auto;padding:0.6rem 0.75rem;display:flex;flex-direction:column;gap:0.4rem;min-height:200px;&::-webkit-scrollbar{width:4px;}&::-webkit-scrollbar-thumb{background:${T.creamDeep};border-radius:2px;}`;

const PatternCard = styled.div<{$sev:PatternFlag['severity']}>`
  display:flex;border-radius:${T.radiusSm};border:1px solid ${p=>SEV_CFG[p.$sev].border};
  background:${p=>SEV_CFG[p.$sev].bg};box-shadow:${T.shadow};overflow:hidden;
  animation:${fadeSlideUp} 0.25s ease both;
`;
const PatBar    = styled.div<{$sev:PatternFlag['severity']}>`width:3px;flex-shrink:0;background:${p=>SEV_BAR[p.$sev]};`;
const PatBody   = styled.div`flex:1;padding:0.55rem 0.75rem;min-width:0;`;
const PatHead   = styled.div`display:flex;align-items:center;gap:0.4rem;margin-bottom:0.18rem;flex-wrap:wrap;`;
const PatName   = styled.div`flex:1;font-size:0.75rem;font-weight:600;color:${T.ink};line-height:1.3;`;
const SevBadge  = styled.span<{$sev:PatternFlag['severity']}>`
  flex-shrink:0;font-size:0.54rem;font-weight:700;padding:0.09rem 0.4rem;border-radius:999px;
  text-transform:uppercase;letter-spacing:0.07em;font-family:${T.mono};
  background:${p=>SEV_CFG[p.$sev].bg};color:${p=>SEV_CFG[p.$sev].color};border:1px solid ${p=>SEV_CFG[p.$sev].border};
`;
const PatDetail = styled.div`font-size:0.7rem;color:${T.inkLight};line-height:1.6;`;

// ── Mutations ──
const MutationCard = styled.div`
  border:1px solid rgba(180,83,9,0.2);border-radius:${T.radiusSm};overflow:hidden;
  background:${T.amberBg};animation:${fadeSlideUp} 0.25s ease both;
`;
const MutHead  = styled.div`display:flex;align-items:center;gap:0.4rem;padding:0.45rem 0.75rem;border-bottom:1px solid rgba(180,83,9,0.12);`;
const MutTitle = styled.div`font-size:0.7rem;font-weight:600;color:${T.amber};flex:1;`;
const MutBody  = styled.div`padding:0.4rem 0.75rem 0.55rem;display:flex;flex-wrap:wrap;gap:0.3rem;`;
const MutChip  = styled.span`
  font-family:${T.mono};font-size:0.62rem;color:${T.amber};
  background:white;border:1px solid rgba(180,83,9,0.18);
  border-radius:5px;padding:0.1rem 0.42rem;
`;
const MutNote  = styled.div`font-size:0.64rem;color:${T.inkLight};padding:0 0.75rem 0.45rem;line-height:1.5;`;

const Empty = styled.div`flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;padding:2rem;text-align:center;min-height:140px;`;

// ── Generator ──
const GenCard     = styled.div`background:white;border:1px solid ${T.rule};border-radius:${T.radius};box-shadow:${T.shadow};overflow:hidden;`;
const GenHead     = styled.div`padding:0.75rem 1rem;border-bottom:1px solid ${T.ruleMid};background:${T.creamDark};display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;`;
const GenLabel    = styled.div`font-family:${T.mono};font-size:0.62rem;color:${T.inkFaint};text-transform:uppercase;letter-spacing:0.12em;`;
const GenBody     = styled.div`padding:1rem;display:flex;flex-direction:column;gap:0.85rem;`;
const GenOutput   = styled.div`display:flex;align-items:center;gap:0.5rem;background:${T.creamDark};border:1px solid ${T.rule};border-radius:${T.radiusSm};padding:0.55rem 0.75rem;`;
const GenPassword = styled.div`flex:1;font-family:${T.mono};font-size:0.88rem;color:${T.ink};letter-spacing:0.06em;word-break:break-all;min-width:0;`;
const GenStrength = styled.div<{$s:Strength|null}>`font-family:${T.mono};font-size:0.6rem;font-weight:700;color:${p=>p.$s?STRENGTH_CFG[p.$s].color:T.inkFaint};text-transform:uppercase;letter-spacing:0.08em;flex-shrink:0;`;

const GenControls = styled.div`display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center;`;
const LengthRow   = styled.div`display:flex;align-items:center;gap:0.6rem;`;
const RangeInput  = styled.input`width:110px;accent-color:${T.ink};cursor:pointer;`;
const RangeVal    = styled.span`font-family:${T.mono};font-size:0.72rem;color:${T.inkMid};min-width:20px;`;
const CheckRow    = styled.div`display:flex;flex-wrap:wrap;gap:0.45rem;`;
const CheckPill   = styled.label<{$on:boolean}>`
  display:flex;align-items:center;gap:0.3rem;padding:0.22rem 0.65rem;border-radius:999px;
  border:1px solid ${p=>p.$on?T.rule:T.creamDeep};background:${p=>p.$on?T.creamDeep:T.cream};
  font-size:0.68rem;color:${p=>p.$on?T.inkMid:T.inkFaint};cursor:pointer;transition:all 0.15s;user-select:none;
  input{display:none;}
  &:hover{border-color:${T.inkFaint};}
`;

// Mode toggle for generator
const ModeToggle = styled.div`display:flex;gap:0;border:1px solid ${T.rule};border-radius:${T.radiusSm};overflow:hidden;width:fit-content;`;
const ModeBtn    = styled.button<{$active:boolean}>`
  padding:0.28rem 0.75rem;border:none;background:${p=>p.$active?T.ink:T.cream};
  color:${p=>p.$active?T.cream:T.inkFaint};font-size:0.68rem;font-family:${T.sans};
  font-weight:${p=>p.$active?600:400};cursor:pointer;transition:all 0.15s;
  &:hover{background:${p=>p.$active?T.ink:T.creamDark};}
`;

const ActionRow = styled.div`display:flex;gap:0.75rem;margin-top:1.25rem;flex-wrap:wrap;align-items:center;`;
const Btn = styled.button<{$primary?:boolean}>`
  display:inline-flex;align-items:center;gap:0.45rem;
  padding:${p=>p.$primary?'0.65rem 1.4rem':'0.55rem 1.1rem'};
  border-radius:${T.radiusSm};font-family:${T.sans};font-size:0.82rem;font-weight:500;
  cursor:pointer;transition:all 0.15s;
  border:1px solid ${p=>p.$primary?'transparent':T.rule};
  background:${p=>p.$primary?T.ink:'white'};
  color:${p=>p.$primary?T.cream:T.inkMid};
  box-shadow:${p=>p.$primary?T.shadow:'none'};
  &:hover{background:${p=>p.$primary?T.inkMid:T.creamDark};transform:translateY(-1px);box-shadow:${p=>p.$primary?T.shadowLg:T.shadow};}
`;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type HibpState = 'idle' | 'loading' | 'clean' | 'pwned' | 'error';
type GenMode   = 'random' | 'passphrase';

export default function PasswordChecker() {
  const [password,    setPassword]    = useState('');
  const [show,        setShow]        = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [hibpState,   setHibpState]   = useState<HibpState>('idle');
  const [hibpCount,   setHibpCount]   = useState(0);
  const [hibpChecked, setHibpChecked] = useState('');   // which password was checked
  const [genMode,     setGenMode]     = useState<GenMode>('random');
  const [genLength,   setGenLength]   = useState(18);
  const [genWords,    setGenWords]    = useState(4);
  const [genUpper,    setGenUpper]    = useState(true);
  const [genDigits,   setGenDigits]   = useState(true);
  const [genSymbols,  setGenSymbols]  = useState(true);
  const [generated,   setGenerated]   = useState('');
  const [genCopied,   setGenCopied]   = useState(false);

  const result    = useMemo(() => analyzePassword(password), [password]);
  const genResult = useMemo(() => generated ? analyzePassword(generated) : null, [generated]);
  const hasResult = password.length > 0;
  const sc        = STRENGTH_CFG[result.strength];

  const issues = result.patterns.filter(p => p.severity !== 'good');
  const good   = result.patterns.filter(p => p.severity === 'good');

  // Reset HIBP state when password changes
  useEffect(() => {
    if (password !== hibpChecked) {
      setHibpState('idle');
    }
  }, [password, hibpChecked]);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }, [password]);

  const handleHibp = useCallback(async () => {
    if (!password) return;
    setHibpState('loading');
    try {
      const count = await checkHibp(password);
      setHibpCount(count);
      setHibpChecked(password);
      setHibpState(count > 0 ? 'pwned' : 'clean');
    } catch {
      setHibpState('error');
    }
  }, [password]);

  const handleGenerate = useCallback(() => {
    const pw = genMode === 'passphrase'
      ? generatePassphrase(genWords, genDigits, genSymbols)
      : generateRandom(genLength, genUpper, genDigits, genSymbols);
    setGenerated(pw);
  }, [genMode, genLength, genWords, genUpper, genDigits, genSymbols]);

  const handleUseGenerated = useCallback(() => {
    if (generated) { setPassword(generated); setShow(true); }
  }, [generated]);

  const handleGenCopy = useCallback(async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated).catch(() => {});
    setGenCopied(true); setTimeout(() => setGenCopied(false), 1800);
  }, [generated]);

  const activeSegs = result.strength==='very-weak'?1:result.strength==='weak'?2:result.strength==='fair'?3:result.strength==='strong'?4:5;

  // Entropy breakdown proportions for visual
  const maxExpectedEntropy = 120;
  const lengthContrib  = result.entropy > 0 ? (result.entropyBreakdown.charsetBits * result.entropyBreakdown.lengthBits) / maxExpectedEntropy * 100 : 0;
  const charsetContrib = result.entropy > 0 ? (result.entropyBreakdown.charsetBits / maxExpectedEntropy) * 100 : 0;
  // shown as two bars: length × charsetBits (total) and a visual for charset size alone
  const totalPct    = Math.min(100, (result.entropy / maxExpectedEntropy) * 100);
  const charsetPct  = Math.min(totalPct * 0.35, 35); // charset portion of the bar
  const lengthPctV  = totalPct - charsetPct;

  const verdictSubtext: Record<Strength, string> = {
    'very-weak':   'This password would be cracked almost instantly. Do not use it.',
    'weak':        'Minimal protection. A motivated attacker would crack this quickly.',
    'fair':        'Acceptable for low-risk accounts only. Stronger is always better.',
    'strong':      'Good password. Adding more length or symbols would make it excellent.',
    'very-strong': 'Excellent — highly resistant to brute-force and dictionary attacks.',
  };

  const hibpTitles: Record<HibpState, string> = {
    idle:    'Check against breach databases',
    loading: 'Checking Have I Been Pwned…',
    clean:   'Not found in any known breach',
    pwned:   `Found in ${hibpCount.toLocaleString()} breach${hibpCount === 1 ? '' : 'es'}`,
    error:   'Could not reach HIBP — check your connection',
  };

  const hibpSubs: Record<HibpState, string> = {
    idle:    'Uses k-anonymity — only the first 5 chars of a SHA-1 hash are sent. Your password never leaves this device.',
    loading: 'Querying the HIBP API using k-anonymity…',
    clean:   'This password does not appear in any known breach dataset. Still, use a unique password for every account.',
    pwned:   'This exact password has appeared in real-world data breaches. You should not use it anywhere.',
    error:   'The HIBP API was unreachable. Your password was never transmitted.',
  };

  return (
    <Root>
      <GlobalStyle />

      {/* HEADER */}
      <Header>
        <div>
          <Title>Password Strength</Title>
          <Subtitle>Entropy analysis · pattern detection · breach check · crack time estimation</Subtitle>
        </div>
        <HeaderBadge>never transmitted</HeaderBadge>
      </Header>

      {/* INPUT */}
      <InputCard>
        <InputCardHead>
          <InputCardLabel>Enter a password to analyse</InputCardLabel>
          {hasResult && (
            <div style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}>
              <span style={{ fontFamily:T.mono, fontSize:'0.6rem', color:sc.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                {sc.label}
              </span>
              <span style={{ fontFamily:T.mono, fontSize:'0.6rem', color:T.inkFaint }}>
                · {result.entropy} bits · {result.charsetSize}-char set · {password.length} chars
              </span>
            </div>
          )}
        </InputCardHead>
        <InputCardBody>
          <PasswordRow>
            <Lock size={15} color={T.inkFaint} style={{ flexShrink:0 }} />
            <PasswordInput
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Type or paste a password…"
              autoComplete="off"
              spellCheck={false}
            />
            <IconBtn onClick={() => setShow(s => !s)} title={show ? 'Hide' : 'Show'}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </IconBtn>
            {hasResult && (
              <IconBtn onClick={handleCopy} title="Copy">
                {copied ? <Check size={14} color={T.green} /> : <Copy size={14} />}
              </IconBtn>
            )}
            {hasResult && (
              <IconBtn onClick={() => setPassword('')} title="Clear"><X size={14} /></IconBtn>
            )}
          </PasswordRow>

          {hasResult && (
            <>
              <MeterWrap>
                <MeterRow>
                  <MeterLabel>Strength score</MeterLabel>
                  <MeterScore $s={result.strength}>{result.score} / 100</MeterScore>
                </MeterRow>
                <MeterTrack><MeterFill $pct={result.score} $s={result.strength} /></MeterTrack>
                <SegmentRow>
                  {Array.from({length:5}).map((_,i) => <Segment key={i} $active={i < activeSegs} $s={result.strength} />)}
                </SegmentRow>
              </MeterWrap>

              {/* Entropy visual breakdown */}
              <EntropyWrap>
                <EntropyLabel>Entropy breakdown · {result.entropy} bits total</EntropyLabel>
                <EntropyTrack>
                  <EntropyFill $pct={lengthPctV}  $color={T.accent} />
                  <EntropyFill $pct={charsetPct}  $color={T.amber}  />
                  <EntropyFill $pct={Math.max(0, 100 - totalPct)} $color={T.creamDeep} />
                </EntropyTrack>
                <EntropyLegend>
                  <EntropyItem $c={T.accent}>Length ({password.length} chars × {result.entropyBreakdown.charsetBits} bits)</EntropyItem>
                  <EntropyItem $c={T.amber}>Charset ({result.charsetSize} symbols → {result.entropyBreakdown.charsetBits} bits/char)</EntropyItem>
                  <EntropyItem $c={T.creamDeep}>Unused headroom to 120 bits</EntropyItem>
                </EntropyLegend>
              </EntropyWrap>
            </>
          )}
        </InputCardBody>
      </InputCard>

      {/* RESULTS */}
      {hasResult && (
        <>
          <Divider />
          <SectionTitle>
            Analysis
            <span>{result.patterns.length} finding{result.patterns.length !== 1 ? 's' : ''}</span>
          </SectionTitle>

          {/* Verdict */}
          <VerdictCard $s={result.strength}>
            <VerdictHeader $s={result.strength}>
              <VerdictIconBox $s={result.strength}>
                {(result.strength==='very-weak'||result.strength==='weak') && <ShieldX     size={18}/>}
                {result.strength==='fair'                                   && <ShieldAlert size={18}/>}
                {(result.strength==='strong'||result.strength==='very-strong') && <ShieldCheck size={18}/>}
              </VerdictIconBox>
              <VerdictText>
                <VerdictTitle $s={result.strength}>{sc.label} Password</VerdictTitle>
                <VerdictSub   $s={result.strength}>{verdictSubtext[result.strength]}</VerdictSub>
              </VerdictText>
              <StatRow>
                <Stat><StatVal>{result.entropy}</StatVal><StatLabel>bits entropy</StatLabel></Stat>
                <Stat><StatVal>{password.length}</StatVal><StatLabel>characters</StatLabel></Stat>
                <Stat><StatVal>{result.charsetSize}</StatVal><StatLabel>char set</StatLabel></Stat>
              </StatRow>
            </VerdictHeader>
          </VerdictCard>

          {/* HIBP */}
          <HibpCard $state={hibpState}>
            <HibpHead $state={hibpState}>
              <HibpIconBox $state={hibpState}>
                {hibpState==='loading' && <Database size={14}/>}
                {hibpState==='clean'   && <ShieldCheck size={14}/>}
                {hibpState==='pwned'   && <ShieldX size={14}/>}
                {(hibpState==='idle'||hibpState==='error') && <Database size={14}/>}
              </HibpIconBox>
              <HibpText>
                <HibpTitle $state={hibpState}>{hibpTitles[hibpState]}</HibpTitle>
                <HibpSub>{hibpSubs[hibpState]}</HibpSub>
              </HibpText>
              {(hibpState==='idle'||hibpState==='error') && (
                <HibpBtn onClick={handleHibp}>
                  Check breach
                </HibpBtn>
              )}
              {(hibpState==='clean'||hibpState==='pwned') && password !== hibpChecked && (
                <HibpBtn onClick={handleHibp}>Re-check</HibpBtn>
              )}
            </HibpHead>
            <HibpNote>
              🔒 k-anonymity: only the first 5 hex characters of your password's SHA-1 hash are ever sent to the API. The full hash and your password remain on your device.
            </HibpNote>
          </HibpCard>

          {/* Content row */}
          <ContentRow>
            <Sidebar>
              {/* Crack times */}
              <SideCard>
                <SideHead><SideLabel>Crack Time Estimate</SideLabel></SideHead>
                <SideBody>
                  {result.crackTimes.map((ct, i) => (
                    <CrackRow key={ct.label} $i={i}>
                      <CrackLabel>{ct.label}</CrackLabel>
                      <CrackVal $fast={ct.fast}>{ct.time}</CrackVal>
                    </CrackRow>
                  ))}
                </SideBody>
              </SideCard>

              {/* Char breakdown as mini bar chart */}
              {result.charBreakdown.length > 0 && (
                <SideCard>
                  <SideHead><SideLabel>Character Mix</SideLabel></SideHead>
                  <SideBody>
                    {result.charBreakdown.map((cb, i) => (
                      <CharBarRow key={cb.label} $i={i}>
                        <CharBarLabel>{cb.label}</CharBarLabel>
                        <CharBarWrap>
                          <CharBarFill $pct={(cb.count / password.length) * 100} $c={cb.color} />
                        </CharBarWrap>
                        <CharBarCount>{cb.count}</CharBarCount>
                      </CharBarRow>
                    ))}
                  </SideBody>
                </SideCard>
              )}
            </Sidebar>

            {/* Patterns panel */}
            <MainPanel>
              <PanelHead>
                <PanelTitle>
                  Findings
                  {issues.length > 0 && <CountChip $alert>{issues.length} issue{issues.length!==1?'s':''}</CountChip>}
                  {good.length   > 0 && <CountChip $ok>{good.length} good</CountChip>}
                </PanelTitle>
              </PanelHead>
              <ScrollArea>
                {result.patterns.length === 0 ? (
                  <Empty>
                    <ShieldCheck size={34} color={T.inkFaint} />
                    <div style={{ fontSize:'0.82rem', color:T.inkLight }}>No patterns detected</div>
                  </Empty>
                ) : (
                  <>
                    {result.patterns.map((p, i) => (
                      <PatternCard key={p.id} $sev={p.severity} style={{ animationDelay:`${i*0.04}s` }}>
                        <PatBar  $sev={p.severity}/>
                        <PatBody>
                          <PatHead>
                            <PatName>{p.label}</PatName>
                            <SevBadge $sev={p.severity}>{p.severity}</SevBadge>
                          </PatHead>
                          <PatDetail>{p.detail}</PatDetail>
                        </PatBody>
                      </PatternCard>
                    ))}

                    {/* Mutation warning */}
                    {result.mutations.length > 0 && (
                      <MutationCard>
                        <MutHead>
                          <AlertTriangle size={13} color={T.amber} />
                          <MutTitle>Attackers will also try these mutations</MutTitle>
                        </MutHead>
                        <MutNote>
                          Rule-based cracking tools automatically generate variations from common base words. If your password is similar to any of these, it offers far less protection than it appears.
                        </MutNote>
                        <MutBody>
                          {result.mutations.map(m => <MutChip key={m}>{m}</MutChip>)}
                        </MutBody>
                      </MutationCard>
                    )}
                  </>
                )}
              </ScrollArea>
            </MainPanel>
          </ContentRow>
        </>
      )}

      {/* GENERATOR */}
      <Divider />
      <SectionTitle>Password Generator</SectionTitle>

      <GenCard>
        <GenHead>
          <GenLabel>Generate a secure password</GenLabel>
          <ModeToggle>
            <ModeBtn $active={genMode==='random'}     onClick={() => setGenMode('random')}>Random</ModeBtn>
            <ModeBtn $active={genMode==='passphrase'} onClick={() => setGenMode('passphrase')}>Passphrase</ModeBtn>
          </ModeToggle>
        </GenHead>
        <GenBody>
          <GenOutput>
            <GenPassword>
              {generated
                ? generated
                : <span style={{ color:T.inkFaint, fontFamily:T.sans, fontSize:'0.82rem' }}>Click generate…</span>
              }
            </GenPassword>
            {generated && genResult && (
              <GenStrength $s={genResult.strength}>{STRENGTH_CFG[genResult.strength].label}</GenStrength>
            )}
            {generated && (
              <>
                <IconBtn onClick={handleGenCopy} title="Copy">
                  {genCopied ? <Check size={14} color={T.green}/> : <Copy size={14}/>}
                </IconBtn>
              </>
            )}
          </GenOutput>

          <GenControls>
            {genMode === 'random' ? (
              <>
                <LengthRow>
                  <span style={{ fontSize:'0.72rem', color:T.inkLight }}>Length</span>
                  <RangeInput type="range" min={8} max={64} value={genLength} onChange={e => setGenLength(Number(e.target.value))} />
                  <RangeVal>{genLength}</RangeVal>
                </LengthRow>
                <CheckRow>
                  {[
                    { label:'Uppercase', val:genUpper,   set:setGenUpper   },
                    { label:'Digits',    val:genDigits,  set:setGenDigits  },
                    { label:'Symbols',   val:genSymbols, set:setGenSymbols },
                  ].map(opt => (
                    <CheckPill key={opt.label} $on={opt.val}>
                      <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)} />
                      {opt.val ? '✓ ' : ''}{opt.label}
                    </CheckPill>
                  ))}
                </CheckRow>
              </>
            ) : (
              <>
                <LengthRow>
                  <span style={{ fontSize:'0.72rem', color:T.inkLight }}>Words</span>
                  <RangeInput type="range" min={3} max={8} value={genWords} onChange={e => setGenWords(Number(e.target.value))} />
                  <RangeVal>{genWords}</RangeVal>
                </LengthRow>
                <CheckRow>
                  {[
                    { label:'Add digits', val:genDigits,  set:setGenDigits  },
                    { label:'Add symbol', val:genSymbols, set:setGenSymbols },
                  ].map(opt => (
                    <CheckPill key={opt.label} $on={opt.val}>
                      <input type="checkbox" checked={opt.val} onChange={e => opt.set(e.target.checked)} />
                      {opt.val ? '✓ ' : ''}{opt.label}
                    </CheckPill>
                  ))}
                </CheckRow>
                <span style={{ fontSize:'0.65rem', color:T.inkFaint }}>
                  ~{Math.round(Math.log2(WORDLIST.length) * genWords + (genDigits ? 6 : 0) + (genSymbols ? 2 : 0))} bits entropy
                </span>
              </>
            )}
          </GenControls>
        </GenBody>
      </GenCard>

      <ActionRow>
        <Btn $primary onClick={handleGenerate}>
          <RefreshCw size={13} /> Generate
        </Btn>
        {generated && (
          <Btn onClick={handleUseGenerated}>
            Analyse this password
          </Btn>
        )}
      </ActionRow>
    </Root>
  );
}