'use client'

import React, { useState, useCallback, useRef, useEffect } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import {
  Upload, Target, PenLine, User,
  MapPin, Mail, Phone, Briefcase, GraduationCap,
  CheckCircle, XCircle, AlertCircle, ExternalLink, Copy,
  RefreshCw, ClipboardList, X, Sparkles, Wand2,
  LayoutGrid, Building2, Search
} from "lucide-react";
import type { NormalizedJob } from "@/app/api/jobs/route";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  ink: '#1a1208',
  inkMid: '#3d3525',
  inkLight: '#78716c',
  cream: '#faf7f2',
  surface: '#f3efe8',
  border: 'rgba(26,18,8,0.10)',
  borderMid: 'rgba(26,18,8,0.16)',
  accent: '#2563eb',
  accentBg: '#eff6ff',
  accentBorder: 'rgba(37,99,235,0.20)',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBorder: 'rgba(22,163,74,0.22)',
  amber: '#b45309',
  amberBg: '#fffbeb',
  amberBorder: 'rgba(180,83,9,0.22)',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: 'rgba(220,38,38,0.22)',
  purple: '#7c3aed',
  purpleBg: '#f5f3ff',
  purpleBorder: 'rgba(124,58,237,0.22)',
  serif: '"DM Serif Display", serif',
  mono: '"DM Mono", monospace',
  sans: '"DM Sans", sans-serif',
  shadow: '0 1px 3px rgba(26,18,8,0.08), 0 4px 16px rgba(26,18,8,0.06)',
  shadowMd: '0 4px 12px rgba(26,18,8,0.10), 0 8px 24px rgba(26,18,8,0.06)',
  radius: '12px',
  radiusSm: '7px',
};

const fadeIn = keyframes`from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; }`;
const spin    = keyframes`to { transform: rotate(360deg); }`;
const pulse   = keyframes`0%,100% { opacity:1; } 50% { opacity:.55; }`;

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
`;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ParsedProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  jobTitles: string[];
  skills: string[];
  experienceYears: number;
  education: string[];
  rawText: string;
}

interface ATSCheck {
  label: string;
  pass: boolean;
  message: string;
  points: number;
}

interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
  skillsToAdd: string[];
  bulletHints: BulletHint[];
}

interface BulletHint {
  bullet: string;
  suggestedKeyword: string;
}

interface ScoredJob extends NormalizedJob {
  matchScore: number;
  matchedSkills: string[];
}

type TabKey = 'jobs' | 'ats' | 'tailor' | 'letter';

// ─── PDF Parser ──────────────────────────────────────────────────────────────
async function parsePDFFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(
      content.items
        .map((item: unknown) => {
          const it = item as { str?: string };
          return it.str ?? '';
        })
        .join(' ')
    );
  }
  return parts.join('\n');
}

// ─── Profile Extraction ──────────────────────────────────────────────────────
function extractSection(text: string, headers: string[]): string {
  const pattern = new RegExp(
    `(?:${headers.join('|')})[:\\s]*\\n([\\s\\S]{0,600})`, 'i'
  );
  return text.match(pattern)?.[1] ?? '';
}

function parseSkillsList(raw: string): string[] {
  const items = raw
    .split(/[,|•\n\/]/)
    .map(s => s.replace(/^[\s\-*•]+/, '').trim())
    .filter(s => s.length > 1 && s.length < 45 && !/^\d+$/.test(s));
  return [...new Set(items)].filter(Boolean).slice(0, 30);
}

const COMMON_TITLES = [
  'software engineer', 'software developer', 'frontend engineer', 'backend engineer',
  'full stack developer', 'full stack engineer', 'data engineer', 'data scientist',
  'data analyst', 'machine learning engineer', 'ml engineer', 'devops engineer',
  'cloud engineer', 'product manager', 'project manager', 'ux designer', 'ui designer',
  'graphic designer', 'marketing manager', 'sales manager', 'business analyst',
  'systems analyst', 'qa engineer', 'test engineer', 'security engineer',
  'network engineer', 'database administrator', 'web developer', 'mobile developer',
  'ios developer', 'android developer', 'react developer', 'python developer',
  'java developer', 'finance analyst', 'financial analyst', 'accountant',
  'operations manager', 'hr manager', 'recruiter', 'technical writer',
  'research scientist', 'consultant', 'site reliability engineer', 'embedded engineer',
];

function extractJobTitles(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const t of COMMON_TITLES) {
    if (lower.includes(t)) {
      found.push(t.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' '));
    }
    if (found.length >= 3) break;
  }
  return found;
}

function estimateYears(text: string): number {
  const matches = text.match(/20[0-2]\d|19[89]\d/g);
  if (!matches || matches.length < 2) return 0;
  const nums = matches.map(Number);
  return Math.min(Math.max(...nums, new Date().getFullYear()) - Math.min(...nums), 30);
}

function extractEducation(text: string): string[] {
  const patterns = [
    /Ph\.?D\.?[^,\n]{0,60}/gi, /Doctor(?:ate)?[^,\n]{0,50}/gi,
    /Master(?:'s)?[^,\n]{0,60}/gi, /M\.?S\.?\s+(?:in\s+)?[A-Z][^,\n]{0,50}/g,
    /M\.?B\.?A\.?[^,\n]{0,40}/gi, /Bachelor(?:'s)?[^,\n]{0,60}/gi,
    /B\.?S\.?\s+(?:in\s+)?[A-Z][^,\n]{0,50}/g, /B\.?A\.?\s+(?:in\s+)?[A-Z][^,\n]{0,50}/g,
    /Associate(?:'s)?[^,\n]{0,50}/gi,
  ];
  const found: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) found.push(...m.map(d => d.trim().slice(0, 70)));
    if (found.length >= 3) break;
  }
  return [...new Set(found)].slice(0, 3);
}

function extractProfile(text: string): ParsedProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emailMatch = text.match(/[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[\+]?[1]?[\s\-.]?[(]?[0-9]{3}[)]?[\s\-.]?[0-9]{3}[\s\-.]?[0-9]{4}/);
  const name = lines.find(l =>
    l.length > 2 && l.length < 55 && !l.includes('@') && !/^[+\d(]/.test(l) &&
    !/linkedin|github|http|www\.|portfolio/i.test(l) &&
    !/^(summary|objective|profile|experience|education|skills|work|about|contact)/i.test(l)
  ) ?? '';
  const locMatch = text.match(/([A-Z][a-zA-Z\s]+),\s+([A-Z]{2})(?:\s+\d{5})?/);
  const skillsRaw = extractSection(text, [
    'skills', 'technical skills', 'core competencies',
    'technologies', 'proficiencies', 'tools & technologies', 'tools and technologies',
    'languages', 'frameworks',
  ]);
  return {
    name,
    email: emailMatch?.[0] ?? '',
    phone: phoneMatch?.[0]?.trim() ?? '',
    location: locMatch?.[0] ?? '',
    skills: parseSkillsList(skillsRaw || text),
    jobTitles: extractJobTitles(text),
    experienceYears: estimateYears(text),
    education: extractEducation(text),
    rawText: text,
  };
}

// ─── ATS Score ───────────────────────────────────────────────────────────────
function calculateATS(p: ParsedProfile): { score: number; checks: ATSCheck[] } {
  const t = p.rawText;
  const words = t.split(/\s+/).length;
  const checks: ATSCheck[] = [
    {
      label: 'Contact Information', points: 15,
      pass: !!(p.email && p.phone),
      message: p.email && p.phone ? 'Email and phone detected'
        : `Missing: ${!p.email ? 'email ' : ''}${!p.phone ? 'phone' : ''}`,
    },
    {
      label: 'Standard Section Headers', points: 15,
      pass: /\b(experience|work history)\b/i.test(t) && /\beducation\b/i.test(t),
      message: /\b(experience|work history)\b/i.test(t) && /\beducation\b/i.test(t)
        ? 'Experience and Education sections found'
        : 'Use standard headers: EXPERIENCE, EDUCATION, SKILLS',
    },
    {
      label: 'Skills Section', points: 15,
      pass: /\b(skills|technologies|competencies|proficiencies)\b/i.test(t),
      message: p.skills.length > 0 ? `${p.skills.length} skills detected`
        : 'Add a dedicated Skills section',
    },
    {
      label: 'Quantifiable Achievements', points: 20,
      pass: /\d+%|\$\s*\d+|\d+\s*x\b|\d+\+?\s*(people|users|clients|employees|team|projects|million|billion|\bk\b)/i.test(t),
      message: /\d+%|\$\s*\d+|\d+x/i.test(t) ? 'Metrics detected (%, $, multipliers)'
        : 'Add metrics: "reduced load time by 40%", "managed team of 8"',
    },
    {
      label: 'Action Verbs', points: 15,
      pass: /\b(led|built|designed|developed|managed|improved|increased|reduced|created|launched|implemented|spearheaded|delivered|collaborated|analyzed|optimized|architected|shipped|scaled|drove|owned)\b/i.test(t),
      message: /\b(led|built|designed|developed|managed|improved|implemented|launched)\b/i.test(t)
        ? 'Strong action verbs found' : 'Start bullets with action verbs: Led, Built, Designed, Shipped…',
    },
    {
      label: 'Resume Length', points: 10,
      pass: words >= 300 && words <= 900,
      message: words < 300 ? `Too short (${words} words) — aim for 400–700`
        : words > 900 ? `Too long (${words} words) — trim to 1–2 pages`
        : `Good length (${words} words)`,
    },
    {
      label: 'No First-Person ("I") Statements', points: 10,
      pass: !/(^|\.\s+)I\s+(am|have|was|worked|managed|led|built|created|designed)/m.test(t),
      message: /(^|\.\s+)I\s+(am|have|was|worked|managed|led|built)/m.test(t)
        ? 'Remove first-person — "I built…" → "Built…"' : 'No first-person statements — good',
    },
  ];
  const total  = checks.reduce((s, c) => s + c.points, 0);
  const earned = checks.filter(c => c.pass).reduce((s, c) => s + c.points, 0);
  return { score: Math.round((earned / total) * 100), checks };
}

// ─── JD Keyword Extraction ───────────────────────────────────────────────────
const STOP = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','up','into',
  'through','is','are','was','were','be','been','have','has','had','do','does','did','will',
  'would','could','should','may','might','this','that','these','those','we','you','they','it',
  'our','your','their','as','if','then','so','also','just','very','can','all','any','who',
  'which','what','when','where','how','not','no','only','same','too','most','many','some',
  'such','more','than','both','either','each','every','other',
  'about','overview','summary','description','responsibilities','requirements','qualifications',
  'benefits','compensation','salary','package','perks','job','role','position','team','company',
  'organization','employer','client','opportunity','opening','candidate','right','fit','culture',
  'values','mission','vision','goal','goals','environment','office','workplace',
  'strong','excellent','good','great','ideal','preferred','required','nice','high','large','long',
  'fast','growing','exciting','innovative','passionate','motivated','talented','dedicated',
  'collaborative','dynamic','diverse','inclusive','equal','competitive','attractive',
  'comprehensive','modern',
  'work','working','works','make','makes','take','get','use','uses','using','set','help','helps',
  'helping','want','needs','enjoy','enjoys','join','joining','apply','applying','build','builds',
  'building','built','develop','develops','developing','create','creates','creating','lead',
  'leads','leading','manage','manages','managing','contribute','contributing','improve',
  'improves','improving','collaborate','collaborating','communicate','solve','solves','solving',
  'deliver','delivering','drive','drives','driving','own','owns',
  'hire','hiring','recruiter','staffing','contract','permanent','direct','full','part','time',
  'seeking','finding','partnership','sponsor','visa',
  'location','city','state','country','area','region','metro','downtown','headquartered','based',
  'near','local','global','worldwide','hybrid','remote','onsite','site','campus','floor',
  'front','back','end','stack','side','web','app','right','left','hand',
  'including','such','well','like','plus','related','within','without','throughout','between',
  'among','around','across','above','below','per','via','etc','example','various','multiple',
  'several','number','first','second','third','last','next','current','previous','latest',
  'minimum','maximum','least','prefer','preferred',
  'inc','llc','corp','ltd','group','solutions','services','technologies',
  'contact','click','submit','send','resume','portfolio','linkedin','github','equal',
  'opportunity','employer',
  "we're","we've","don't","isn't","aren't","won't","you'll",
]);

const KEEP_SHORT = new Set(['js','ts','ui','ux','qa','db','ai','ml','go','r#']);
const TECH_PATTERNS = /^(react|vue|angular|svelte|next|nuxt|node|deno|bun|express|fastapi|flask|django|rails|spring|laravel|typescript|javascript|python|java|kotlin|swift|rust|golang|ruby|php|scala|elixir|terraform|ansible|docker|kubernetes|helm|prometheus|grafana|jenkins|github|gitlab|postgresql|mysql|mongodb|redis|elasticsearch|kafka|rabbitmq|graphql|aws|gcp|azure|lambda|bigquery|spark|hadoop|airflow|snowflake|tableau|figma|pytorch|tensorflow|sklearn|llm|openai|langchain|linux|bash|git|webpack|vite|jest|cypress|playwright|pytest|junit|agile|scrum|cicd|microservices|serverless|datadog|sentry|okta|jwt)$/i;

function jdKeywords(text: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  const compoundPatterns: [RegExp, string][] = [
    [/\bCI\s*[/\\]\s*CD\b/i, 'CI/CD'], [/\bA\s*[/\\]\s*B\s+test/i, 'A/B Testing'],
    [/\bnode\.js\b/i, 'Node.js'],       [/\bnext\.js\b/i, 'Next.js'],
    [/\breact\.js\b/i, 'React.js'],     [/\bvue\.js\b/i, 'Vue.js'],
    [/\b\.net\b/i, '.NET'],             [/\basp\.net\b/i, 'ASP.NET'],
  ];
  for (const [re, label] of compoundPatterns) {
    if (re.test(text) && !seen.has(label.toLowerCase())) { seen.add(label.toLowerCase()); result.push(label); }
  }
  const tokens = text
    .replace(/CI\s*\/\s*CD/gi, 'CICD')
    .replace(/[()[\]{}"'`,;:!?@%^&*=|\\]/g, ' ').replace(/\//g, ' ').replace(/-/g, ' ')
    .split(/\s+/).map(w => w.replace(/^[^a-zA-Z0-9+#.]+|[^a-zA-Z0-9+#.]+$/g, '').trim()).filter(Boolean);
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (seen.has(lower) || STOP.has(lower) || lower.length <= 1) continue;
    if (lower.length === 2 && !KEEP_SHORT.has(lower)) continue;
    if (token.length === 2 && /^[A-Z]{2}$/.test(token) && !KEEP_SHORT.has(lower)) continue;
    seen.add(lower); result.push(token);
  }
  return result.slice(0, 80);
}

// ─── Resume Bullets + Tailor ─────────────────────────────────────────────────
function extractBullets(text: string): string[] {
  return text
    .split(/(?:^|\n)[\s]*[•\-*▪►◦‣⁃]\s*/m)
    .map(b => b.split('\n')[0].trim())
    .filter(b => b.length > 35 && b.length < 250)
    .slice(0, 25);
}

const DOMAIN_MAP: Record<string, string[]> = {
  typescript:   ['javascript','react','frontend','component','angular','vue'],
  kubernetes:   ['docker','container','deploy','cloud','service','cluster','helm'],
  terraform:    ['infrastructure','cloud','aws','gcp','azure','provision','iac'],
  graphql:      ['api','rest','query','mutation','backend','data','schema'],
  redis:        ['cache','session','performance','database','latency','queue'],
  kafka:        ['event','stream','queue','message','pipeline','async','broker'],
  elasticsearch:['search','log','analytics','query','index','monitor'],
  postgresql:   ['database','sql','query','schema','mysql','data','postgres'],
  aws:          ['cloud','lambda','ec2','s3','serverless','deploy','infra'],
  python:       ['script','data','automation','ml','api','backend','analysis'],
  react:        ['component','frontend','ui','javascript','state','jsx','hook'],
  nextjs:       ['react','ssr','frontend','fullstack','vercel','routing','page'],
  docker:       ['container','deploy','build','image','service','cicd'],
  cicd:         ['pipeline','deploy','build','test','automate','github','jenkins'],
  agile:        ['sprint','scrum','team','kanban','story','standup','iteration'],
  microservices:['service','api','backend','scalab','deploy','distributed'],
};

function findBulletHints(bullets: string[], missingKws: string[]): BulletHint[] {
  const hints: BulletHint[] = [];
  const seen = new Set<string>();
  for (const kw of missingKws.slice(0, 20)) {
    const lower = kw.toLowerCase().replace(/[^a-z]/g, '');
    const neighbors = DOMAIN_MAP[lower] ?? [];
    if (!neighbors.length) continue;
    for (const bullet of bullets) {
      const bLow = bullet.toLowerCase();
      if (neighbors.some(n => bLow.includes(n)) && !seen.has(bullet.slice(0, 30))) {
        seen.add(bullet.slice(0, 30));
        hints.push({ bullet: bullet.slice(0, 140) + (bullet.length > 140 ? '…' : ''), suggestedKeyword: kw });
        break;
      }
    }
    if (hints.length >= 4) break;
  }
  return hints;
}

function matchJD(resumeText: string, jdText: string): MatchResult {
  const kws = jdKeywords(jdText);
  const resumeLow = resumeText.toLowerCase();
  const matched = kws.filter(kw => resumeLow.includes(kw.toLowerCase()));
  const missing  = kws.filter(kw => !resumeLow.includes(kw.toLowerCase())).slice(0, 30);
  const skillsToAdd = missing.filter(kw => TECH_PATTERNS.test(kw) || kw.length <= 12).slice(0, 15);
  const bulletHints = findBulletHints(extractBullets(resumeText), missing);
  return { score: kws.length > 0 ? Math.round((matched.length / kws.length) * 100) : 0, matched: matched.slice(0, 30), missing, skillsToAdd, bulletHints };
}

// ─── Job Scoring ─────────────────────────────────────────────────────────────
function scoreJob(resumeSkills: string[], job: NormalizedJob): ScoredJob {
  // Build a text corpus from all job data
  const corpus = [...job.tags, job.title, job.description].join(' ').toLowerCase();
  const matchedSkills = resumeSkills.filter(skill => {
    const s = skill.toLowerCase();
    // exact match OR root match (e.g. "react" inside "react.js")
    return corpus.includes(s) || (s.length > 3 && corpus.includes(s.slice(0, s.length - 1)));
  });
  // Score = % of your skills the job mentions (inverse: job wants what you have)
  const score = resumeSkills.length > 0
    ? Math.min(Math.round((matchedSkills.length / resumeSkills.length) * 100), 99)
    : 30;
  return { ...job, matchScore: score, matchedSkills };
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────
function generateCoverLetter(p: ParsedProfile, jdText: string): string {
  const topSkills = p.skills.slice(0, 3).join(', ') || 'my core skills';
  const titleLine = p.jobTitles[0] ?? 'this role';
  const yearsText = p.experienceYears > 0 ? `${p.experienceYears}+ years of` : 'extensive';
  const compMatch = jdText.match(/(?:at|join|for|with)\s+([A-Z][A-Za-z0-9\s&,.']+?)(?:\.|,|\n|!)/);
  const company   = compMatch?.[1]?.trim() ?? '[Company Name]';
  const roleMatch = jdText.match(/(?:hiring|seeking|looking for|for a|for an?)\s+([A-Za-z\s]+?)(?:\.|,|\n|to)/i);
  const role      = roleMatch?.[1]?.trim() ?? titleLine;
  const skills2   = p.skills.slice(0, 2).join(' and ') || 'my field';

  return `${p.name || '[Your Name]'}
${p.email || '[your.email@example.com]'}${p.phone ? ' | ' + p.phone : ''}${p.location ? ' | ' + p.location : ''}

[Today's Date]

Hiring Manager
${company}

Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With ${yearsText} experience${p.jobTitles.length > 0 ? ' as a ' + p.jobTitles[0] : ''}, I am confident I can make an immediate impact on your team.

Throughout my career, I have developed deep expertise in ${topSkills}. I have a consistent track record of delivering results — whether shipping production systems, collaborating cross-functionally, or driving initiatives from inception to completion.

What draws me to ${company} is [CUSTOMIZE: mention company mission, product, or a recent news item — this is the most important line to personalize]. I am excited to bring my background in ${skills2} to a team working on [CUSTOMIZE: specific product or problem from the JD].

I would welcome the opportunity to discuss how my experience aligns with your team's goals. Thank you for your time and consideration — I look forward to speaking with you.

Sincerely,
${p.name || '[Your Name]'}`;
}

// ─── Research quick-links per company ────────────────────────────────────────
function glassdoorUrl(co: string) {
  return `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(co)}`;
}
function levelsUrl(co: string) {
  return `https://www.levels.fyi/companies/${encodeURIComponent(co.toLowerCase().replace(/\s+/g, '-'))}/`;
}
function linkedinUrl(co: string) {
  return `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(co)}`;
}

// ─── Styled components ───────────────────────────────────────────────────────
const Root = styled.div`
  min-height: 100%; padding: 2rem 2.5rem; background: ${T.cream};
  font-family: ${T.sans}; color: ${T.ink}; box-sizing: border-box;
  @media (max-width: 900px) { padding: 1.25rem 1rem; }
`;
const PageHeader = styled.header`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.75rem; flex-wrap: wrap; gap: 0.75rem;
`;
const TitleGroup = styled.div``;
const PageTitle = styled.h1`
  font-family: ${T.serif}; font-size: 2rem; font-weight: 400; color: ${T.ink}; margin: 0 0 0.25rem;
`;
const PageSub = styled.p`font-size: 0.85rem; color: ${T.inkLight}; margin: 0;`;
const MonoBadge = styled.span`
  font-family: ${T.mono}; font-size: 0.7rem; font-weight: 500;
  background: ${T.ink}; color: ${T.cream}; padding: 0.25rem 0.65rem;
  border-radius: 99px; letter-spacing: 0.04em;
`;

// Upload
const UploadWrap = styled.div`
  display: flex; flex-direction: column; gap: 1rem; max-width: 640px;
  margin: 0 auto; animation: ${fadeIn} 0.35s ease;
`;
const UploadZone = styled.label<{ $over?: boolean }>`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.75rem; padding: 3rem 2rem;
  border: 2px dashed ${({ $over }) => $over ? T.accent : T.borderMid};
  border-radius: ${T.radius};
  background: ${({ $over }) => $over ? T.accentBg : T.surface};
  cursor: pointer; transition: all 0.2s; text-align: center;
  &:hover { border-color: ${T.accent}; background: ${T.accentBg}; }
`;
const UploadIcon = styled.div<{ $spin?: boolean }>`
  width: 52px; height: 52px; border-radius: 50%; background: ${T.ink}; color: ${T.cream};
  display: flex; align-items: center; justify-content: center;
  svg { animation: ${({ $spin }) => $spin ? spin : 'none'} 1s linear infinite; }
`;
const UploadTitle = styled.p`font-size: 1rem; font-weight: 700; color: ${T.ink}; margin: 0;`;
const UploadHint  = styled.p`font-size: 0.8rem; color: ${T.inkLight}; margin: 0;`;
const OrDivider = styled.div`
  display: flex; align-items: center; gap: 0.75rem;
  span { font-size: 0.75rem; color: ${T.inkLight}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  &::before, &::after { content: ''; flex: 1; height: 1px; background: ${T.border}; }
`;
const PasteArea = styled.textarea`
  width: 100%; min-height: 140px; padding: 0.85rem 1rem;
  border: 1px solid ${T.borderMid}; border-radius: ${T.radiusSm};
  background: ${T.surface}; color: ${T.ink}; font-family: ${T.mono};
  font-size: 0.8rem; resize: vertical; box-sizing: border-box; outline: none;
  &:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentBg}; }
  &::placeholder { color: ${T.inkLight}; }
`;
const ParseBtn = styled.button`
  padding: 0.7rem 1.5rem; border-radius: 99px; background: ${T.ink}; color: ${T.cream};
  border: none; font-family: ${T.sans}; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; align-self: flex-end; transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;

// Layout
const ParsedLayout = styled.div`
  display: grid; grid-template-columns: 248px 1fr; gap: 1.25rem;
  animation: ${fadeIn} 0.35s ease;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const ProfileCard = styled.div`
  background: ${T.surface}; border: 1px solid ${T.border}; border-radius: ${T.radius};
  padding: 1.25rem; box-shadow: ${T.shadow}; display: flex; flex-direction: column;
  gap: 1rem; height: fit-content;
`;
const Avatar = styled.div`
  width: 48px; height: 48px; border-radius: 50%; background: ${T.ink}; color: ${T.cream};
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;
const ProfileName = styled.p`font-family: ${T.serif}; font-size: 1.1rem; color: ${T.ink}; margin: 0;`;
const ProfileMeta = styled.div`display: flex; flex-direction: column; gap: 0.35rem;`;
const MetaRow = styled.div`
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.78rem; color: ${T.inkMid};
  svg { flex-shrink: 0; color: ${T.inkLight}; }
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
const SectionLabel = styled.p`
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: ${T.inkLight}; margin: 0 0 0.45rem;
`;
const ChipWrap = styled.div`display: flex; flex-wrap: wrap; gap: 0.3rem;`;
const Chip = styled.span`
  font-size: 0.7rem; font-weight: 600; background: ${T.cream}; border: 1px solid ${T.borderMid};
  border-radius: 99px; padding: 0.2rem 0.55rem; color: ${T.inkMid};
`;
const ReuploadBtn = styled.button`
  display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.85rem;
  border-radius: 99px; border: 1px solid ${T.borderMid}; background: transparent;
  color: ${T.inkMid}; font-size: 0.75rem; font-weight: 600; cursor: pointer;
  font-family: ${T.sans}; transition: all 0.15s;
  &:hover { border-color: ${T.ink}; color: ${T.ink}; }
`;

// Tabs
const MainArea = styled.div`
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid ${T.border}; border-radius: ${T.radius};
  background: ${T.surface}; box-shadow: ${T.shadow}; overflow: hidden;
`;
const TabBar = styled.div`
  display: flex; border-bottom: 1px solid ${T.border}; background: ${T.cream};
  overflow-x: auto;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: ${T.border}; }
`;
const TabBtn = styled.button<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 0.4rem; padding: 0.85rem 1.1rem;
  border: none; background: none; font-family: ${T.sans}; font-size: 0.82rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  color: ${({ $active }) => $active ? T.ink : T.inkLight};
  border-bottom: 2px solid ${({ $active }) => $active ? T.ink : 'transparent'};
  cursor: pointer; white-space: nowrap; transition: all 0.15s;
  &:hover { color: ${T.ink}; }
`;
const TabContent = styled.div`
  padding: 1.5rem; flex: 1; overflow-y: auto; animation: ${fadeIn} 0.2s ease;
`;

// ATS
const ScoreRow = styled.div`
  display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
`;
const ScoreCircle = styled.div<{ $score: number }>`
  width: 90px; height: 90px; border-radius: 50%; flex-shrink: 0;
  background: conic-gradient(
    ${({ $score }) => $score >= 75 ? T.green : $score >= 50 ? T.amber : T.red} ${({ $score }) => $score * 3.6}deg,
    ${T.border} 0deg
  );
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 6px ${T.cream}; position: relative;
  &::after { content: ''; position: absolute; inset: 10px; background: ${T.cream}; border-radius: 50%; }
`;
const ScoreNum   = styled.span`font-family: ${T.mono}; font-size: 1.4rem; font-weight: 700; color: ${T.ink}; position: relative; z-index: 1;`;
const ScoreLabel = styled.div`font-family: ${T.serif}; font-size: 1.25rem; color: ${T.ink};`;
const ScoreSub   = styled.p`font-size: 0.78rem; color: ${T.inkLight}; margin: 0.2rem 0 0;`;
const CheckList  = styled.div`display: flex; flex-direction: column; gap: 0.6rem;`;
const CheckRow   = styled.div<{ $pass: boolean }>`
  display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.75rem 0.9rem;
  border-radius: ${T.radiusSm};
  background: ${({ $pass }) => $pass ? T.greenBg : T.redBg};
  border: 1px solid ${({ $pass }) => $pass ? T.greenBorder : T.redBorder};
`;
const CheckBody  = styled.div`flex: 1;`;
const CheckTitle = styled.p`font-weight: 700; font-size: 0.82rem; color: ${T.ink}; margin: 0 0 0.2rem;`;
const CheckMsg   = styled.p`font-size: 0.76rem; color: ${T.inkMid}; margin: 0;`;

// Tailor tab
const AnalyzingDot = styled.span`
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: ${T.amber}; animation: ${pulse} 1s ease infinite; margin-right: 0.35rem;
`;
const AnalyzingRow = styled.div`
  font-size: 0.75rem; color: ${T.amber}; display: flex; align-items: center; margin-top: 0.5rem;
`;
const JDTextarea = styled.textarea`
  width: 100%; min-height: 130px; padding: 0.85rem 1rem;
  border: 1px solid ${T.borderMid}; border-radius: ${T.radiusSm};
  background: ${T.cream}; color: ${T.ink}; font-family: ${T.mono};
  font-size: 0.78rem; resize: vertical; box-sizing: border-box; outline: none;
  &:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentBg}; }
  &::placeholder { color: ${T.inkLight}; }
`;
const MatchScore = styled.div<{ $score: number }>`
  display: inline-flex; align-items: center; gap: 0.5rem; margin: 1rem 0 0.75rem;
  font-family: ${T.mono}; font-size: 1.4rem; font-weight: 700;
  color: ${({ $score }) => $score >= 70 ? T.green : $score >= 45 ? T.amber : T.red};
`;
const KwSection = styled.div`margin-top: 0.85rem;`;
const KwLabel   = styled.p`font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 0.5rem;`;
const KwGrid    = styled.div`display: flex; flex-wrap: wrap; gap: 0.35rem;`;
const KwChip    = styled.span<{ $variant: 'match' | 'miss' }>`
  font-size: 0.72rem; font-weight: 600; border-radius: 99px; padding: 0.2rem 0.6rem;
  background: ${({ $variant }) => $variant === 'match' ? T.greenBg : T.redBg};
  border: 1px solid ${({ $variant }) => $variant === 'match' ? T.greenBorder : T.redBorder};
  color: ${({ $variant }) => $variant === 'match' ? T.green : T.red};
`;
const ActionBox = styled.div`
  margin-top: 1.25rem; padding: 1rem 1.15rem;
  border: 1px solid ${T.purpleBorder}; border-radius: ${T.radiusSm}; background: ${T.purpleBg};
`;
const ActionTitle = styled.p`
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
  color: ${T.purple}; margin: 0 0 0.65rem; display: flex; align-items: center; gap: 0.4rem;
`;
const SkillsSnippet = styled.div`
  font-family: ${T.mono}; font-size: 0.78rem; color: ${T.ink};
  background: ${T.cream}; border: 1px solid ${T.borderMid};
  border-radius: ${T.radiusSm}; padding: 0.65rem 0.85rem; margin-bottom: 0.65rem; word-break: break-word;
`;
const SmallCopyBtn = styled.button<{ $copied?: boolean }>`
  display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.32rem 0.75rem;
  border-radius: 99px;
  background: ${({ $copied }) => $copied ? T.greenBg : T.purple + '18'};
  border: 1px solid ${({ $copied }) => $copied ? T.greenBorder : T.purpleBorder};
  color: ${({ $copied }) => $copied ? T.green : T.purple};
  font-family: ${T.sans}; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.18s;
  &:hover { background: ${T.purple}; color: white; border-color: ${T.purple}; }
`;
const BulletHintList = styled.div`display: flex; flex-direction: column; gap: 0.55rem; margin-top: 0.65rem;`;
const BulletHintRow  = styled.div`
  display: flex; flex-direction: column; gap: 0.25rem; padding: 0.65rem 0.85rem;
  background: ${T.cream}; border: 1px solid ${T.borderMid}; border-radius: ${T.radiusSm};
`;
const BulletHintKw   = styled.span`font-size: 0.68rem; font-weight: 700; color: ${T.purple}; text-transform: uppercase; letter-spacing: 0.05em;`;
const BulletHintText = styled.p`font-size: 0.75rem; color: ${T.inkMid}; margin: 0; font-family: ${T.mono};`;
const MatchTip = styled.div`
  margin-top: 1rem; padding: 0.75rem 1rem;
  background: ${T.amberBg}; border: 1px solid ${T.amberBorder};
  border-radius: ${T.radiusSm}; font-size: 0.78rem; color: ${T.amber}; display: flex; gap: 0.5rem;
`;

// Find Jobs tab
const JobsSearchRow = styled.div`
  display: flex; gap: 0.65rem; margin-bottom: 0.85rem; flex-wrap: wrap;
`;
const JobsInput = styled.input`
  flex: 1; min-width: 180px; padding: 0.55rem 0.85rem;
  border: 1px solid ${T.borderMid}; border-radius: ${T.radiusSm};
  background: ${T.cream}; font-family: ${T.sans}; font-size: 0.82rem; color: ${T.ink};
  outline: none;
  &:focus { border-color: ${T.accent}; box-shadow: 0 0 0 2px ${T.accentBg}; }
  &::placeholder { color: ${T.inkLight}; }
`;
const SearchBtn = styled.button`
  display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem;
  border-radius: ${T.radiusSm}; background: ${T.ink}; color: ${T.cream};
  border: none; font-family: ${T.sans}; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const JobsMeta = styled.p`font-size: 0.75rem; color: ${T.inkLight}; margin: 0 0 0.85rem;`;
const JobsList = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const JobCard  = styled.div`
  display: flex; flex-direction: column; gap: 0.55rem;
  padding: 1rem 1.1rem; border: 1px solid ${T.border}; border-radius: ${T.radiusSm};
  background: ${T.cream}; transition: box-shadow 0.18s;
  &:hover { box-shadow: ${T.shadowMd}; }
`;
const JobCardTop = styled.div`display: flex; align-items: flex-start; gap: 0.75rem;`;
const JobLogo = styled.div<{ $src: string }>`
  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
  background: ${({ $src }) => $src ? `url(${$src}) center/cover` : T.surface};
  border: 1px solid ${T.border};
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 700; color: ${T.inkLight};
`;
const JobInfo = styled.div`flex: 1; min-width: 0;`;
const JobTitle   = styled.p`font-weight: 700; font-size: 0.88rem; color: ${T.ink}; margin: 0 0 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const JobCompany = styled.p`font-size: 0.78rem; color: ${T.inkMid}; margin: 0; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;`;
const JobBadge   = styled.span<{ $color?: string }>`
  font-size: 0.62rem; font-weight: 700; border-radius: 99px; padding: 0.1rem 0.45rem;
  background: ${({ $color }) => ($color ?? T.ink) + '15'};
  border: 1px solid ${({ $color }) => ($color ?? T.ink) + '30'};
  color: ${({ $color }) => $color ?? T.inkMid};
`;
const ScoreBadge = styled.div<{ $score: number }>`
  flex-shrink: 0; font-family: ${T.mono}; font-size: 0.82rem; font-weight: 700;
  padding: 0.2rem 0.55rem; border-radius: 6px;
  color: ${({ $score }) => $score >= 60 ? T.green : $score >= 35 ? T.amber : T.inkLight};
  background: ${({ $score }) => $score >= 60 ? T.greenBg : $score >= 35 ? T.amberBg : T.surface};
  border: 1px solid ${({ $score }) => $score >= 60 ? T.greenBorder : $score >= 35 ? T.amberBorder : T.border};
`;
const SkillChips = styled.div`display: flex; flex-wrap: wrap; gap: 0.3rem;`;
const SkillChip  = styled.span<{ $matched: boolean }>`
  font-size: 0.65rem; font-weight: 600; border-radius: 99px; padding: 0.15rem 0.5rem;
  background: ${({ $matched }) => $matched ? T.greenBg : T.surface};
  border: 1px solid ${({ $matched }) => $matched ? T.greenBorder : T.border};
  color: ${({ $matched }) => $matched ? T.green : T.inkLight};
`;
const JobActions = styled.div`display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;`;
const ApplyBtn = styled.a`
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.42rem 0.85rem; border-radius: ${T.radiusSm};
  background: ${T.ink}; color: ${T.cream};
  font-family: ${T.sans}; font-size: 0.75rem; font-weight: 700;
  text-decoration: none; transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;
const ResearchLink = styled.a<{ $color: string }>`
  display: inline-flex; align-items: center; gap: 0.2rem;
  padding: 0.38rem 0.6rem; border-radius: ${T.radiusSm};
  border: 1px solid ${({ $color }) => $color + '33'};
  background: ${({ $color }) => $color + '10'};
  color: ${({ $color }) => $color};
  font-family: ${T.sans}; font-size: 0.7rem; font-weight: 700;
  text-decoration: none; transition: all 0.15s;
  &:hover { background: ${({ $color }) => $color + '20'}; }
`;
const JobSalary = styled.span`font-size: 0.72rem; color: ${T.green}; font-weight: 600;`;
const JobsEmptyState = styled.div`
  text-align: center; padding: 2.5rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
`;
const JobsLoadingGrid = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const JobSkeleton = styled.div`
  height: 100px; border-radius: ${T.radiusSm}; background: ${T.surface};
  border: 1px solid ${T.border}; animation: ${pulse} 1.5s ease infinite;
`;

// Cover letter
const LetterWrap    = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const LetterBox     = styled.pre`
  white-space: pre-wrap; font-family: ${T.mono}; font-size: 0.78rem; line-height: 1.7;
  color: ${T.ink}; background: ${T.cream}; border: 1px solid ${T.border};
  border-radius: ${T.radiusSm}; padding: 1.25rem; max-height: 420px; overflow-y: auto; margin: 0;
`;
const LetterActions = styled.div`display: flex; gap: 0.65rem; flex-wrap: wrap;`;
const CopyBtn = styled.button<{ $copied?: boolean }>`
  display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; border-radius: 99px;
  background: ${({ $copied }) => $copied ? T.greenBg : T.ink};
  color: ${({ $copied }) => $copied ? T.green : T.cream};
  border: 1px solid ${({ $copied }) => $copied ? T.greenBorder : T.ink};
  font-family: ${T.sans}; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
`;
const LetterNote = styled.p`
  font-size: 0.75rem; color: ${T.inkLight}; margin: 0;
  display: flex; align-items: flex-start; gap: 0.4rem;
`;

const InfoBox = styled.div`
  padding: 0.85rem 1rem; background: ${T.accentBg}; border: 1px solid ${T.accentBorder};
  border-radius: ${T.radiusSm}; font-size: 0.8rem; color: ${T.accent};
  display: flex; gap: 0.5rem; align-items: flex-start; margin-bottom: 1rem;
`;
const EmptyNote = styled.p`font-size: 0.82rem; color: ${T.inkLight}; text-align: center; margin: 2rem 0;`;
const Spinner = styled.div`
  width: 20px; height: 20px; border-radius: 50%;
  border: 2.5px solid ${T.border}; border-top-color: ${T.ink};
  animation: ${spin} 0.7s linear infinite;
`;
const LoadingRow = styled.div`
  display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem;
  animation: ${pulse} 1.5s ease infinite; font-size: 0.85rem; color: ${T.inkMid};
`;

// ─── Component ───────────────────────────────────────────────────────────────
export default function VirtualRecruiter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver,   setIsDragOver]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState('Parsing resume…');
  const [profile,      setProfile]      = useState<ParsedProfile | null>(null);
  const [pasteText,    setPasteText]    = useState('');
  const [activeTab,    setActiveTab]    = useState<TabKey>('jobs');

  // Find Jobs state
  const [jobSearchTitle, setJobSearchTitle] = useState('');
  const [jobsLoading,    setJobsLoading]    = useState(false);
  const [jobListings,    setJobListings]    = useState<ScoredJob[]>([]);
  const [jobsError,      setJobsError]      = useState('');
  const [jobsFetched,    setJobsFetched]    = useState(false);

  // Tailor tab
  const [jdText,       setJDText]       = useState('');
  const [matchResult,  setMatchResult]  = useState<MatchResult | null>(null);
  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [copiedSkills, setCopiedSkills] = useState(false);

  // Cover letter
  const [copied,       setCopied]       = useState(false);
  const [letterText,   setLetterText]   = useState('');

  // ── Job Fetching ──
  const fetchJobs = useCallback(async (title: string, skills: string[]) => {
    if (!title.trim()) return;
    setJobsLoading(true);
    setJobsError('');
    try {
      const params = new URLSearchParams({
        title: title.trim(),
        skills: skills.slice(0, 10).join(','),
      });
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json() as { jobs: NormalizedJob[] };
      const scored = data.jobs
        .map(j => scoreJob(skills, j))
        .sort((a, b) => b.matchScore - a.matchScore);
      setJobListings(scored);
      setJobsFetched(true);
    } catch {
      setJobsError('Could not load job listings — please try again.');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  // Auto-fetch once profile is parsed
  useEffect(() => {
    if (profile && !jobsFetched) {
      const title = jobSearchTitle || profile.jobTitles[0] || 'Software Engineer';
      fetchJobs(title, profile.skills);
    }
  }, [profile, jobsFetched, jobSearchTitle, fetchJobs, profile?.skills]);

  // Process raw text → set profile
  const processText = useCallback((text: string) => {
    const p = extractProfile(text);
    setProfile(p);
    setLetterText(generateCoverLetter(p, ''));
    setJobSearchTitle(p.jobTitles[0] ?? 'Software Engineer');
    setActiveTab('jobs');
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMsg('Parsing resume…');
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setLoadingMsg('Extracting PDF text…');
        text = await parsePDFFile(file);
      } else {
        text = await file.text();
      }
      setLoadingMsg('Analyzing profile…');
      processText(text);
    } catch (e) {
      console.error(e);
      alert('Could not read this file. Try copy-pasting your resume text instead.');
    } finally {
      setIsLoading(false);
    }
  }, [processText]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePasteSubmit = useCallback(() => {
    if (!pasteText.trim()) return;
    processText(pasteText.trim());
  }, [pasteText, processText]);

  // JD auto-analyze
  useEffect(() => {
    if (!profile || jdText.trim().length < 80) {
      if (!jdText.trim()) { setMatchResult(null); setIsAnalyzing(false); }
      return;
    }
    setIsAnalyzing(true);
    const t = setTimeout(() => {
      setMatchResult(matchJD(profile.rawText, jdText));
      setLetterText(generateCoverLetter(profile, jdText));
      setIsAnalyzing(false);
    }, 700);
    return () => clearTimeout(t);
  }, [jdText, profile]);

  const handleCopyLetter = useCallback(() => {
    navigator.clipboard.writeText(letterText).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [letterText]);

  const handleCopySkills = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSkills(true); setTimeout(() => setCopiedSkills(false), 2000);
    });
  }, []);

  const handleReset = useCallback(() => {
    setProfile(null); setPasteText(''); setMatchResult(null); setIsAnalyzing(false);
    setJDText(''); setLetterText(''); setCopied(false); setCopiedSkills(false);
    setJobListings([]); setJobsFetched(false); setJobsError(''); setJobSearchTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const atsData    = profile ? calculateATS(profile) : null;
  const scoreColor = atsData ? atsData.score >= 75 ? T.green : atsData.score >= 50 ? T.amber : T.red : T.inkLight;
  const scoreLabel = atsData ? atsData.score >= 75 ? 'Strong' : atsData.score >= 50 ? 'Needs Work' : 'High Risk' : '';
  const skillsSnippet = matchResult?.skillsToAdd.join(', ') ?? '';

  return (
    <Root>
      <GlobalStyle />

      <PageHeader>
        <TitleGroup>
          <PageTitle>Virtual Recruiter</PageTitle>
          <PageSub>Upload your resume — instantly see matching jobs from real company career pages</PageSub>
        </TitleGroup>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MonoBadge>JOB MATCH</MonoBadge>
          {profile && (
            <ReuploadBtn onClick={handleReset}>
              <X size={13} /> Start Over
            </ReuploadBtn>
          )}
        </div>
      </PageHeader>

      {/* ── UPLOAD ── */}
      {!profile && !isLoading && (
        <UploadWrap>
          <UploadZone
            $over={isDragOver}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon><Upload size={22} /></UploadIcon>
            <UploadTitle>Drop your resume here</UploadTitle>
            <UploadHint>PDF or plain text · click to browse</UploadHint>
            <input
              ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </UploadZone>
          <OrDivider><span>or paste text</span></OrDivider>
          <PasteArea
            placeholder="Paste your resume text here (copy from Word, Google Docs, etc.)…"
            value={pasteText} onChange={e => setPasteText(e.target.value)}
          />
          <ParseBtn onClick={handlePasteSubmit} disabled={!pasteText.trim()}>
            Analyze Resume →
          </ParseBtn>
        </UploadWrap>
      )}

      {/* ── LOADING ── */}
      {isLoading && (
        <LoadingRow><Spinner />{loadingMsg}</LoadingRow>
      )}

      {/* ── PARSED ── */}
      {profile && !isLoading && (
        <ParsedLayout>
          {/* Profile sidebar */}
          <ProfileCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Avatar><User size={22} /></Avatar>
              <ProfileName>{profile.name || 'Your Profile'}</ProfileName>
            </div>
            <ProfileMeta>
              {profile.email      && <MetaRow><Mail size={12} /><span>{profile.email}</span></MetaRow>}
              {profile.phone      && <MetaRow><Phone size={12} /><span>{profile.phone}</span></MetaRow>}
              {profile.location   && <MetaRow><MapPin size={12} /><span>{profile.location}</span></MetaRow>}
              {profile.experienceYears > 0 && <MetaRow><Briefcase size={12} /><span>~{profile.experienceYears} yrs exp</span></MetaRow>}
              {profile.education.length > 0 && <MetaRow><GraduationCap size={12} /><span>{profile.education[0].slice(0, 42)}</span></MetaRow>}
            </ProfileMeta>
            {profile.jobTitles.length > 0 && (
              <div>
                <SectionLabel>Detected Titles</SectionLabel>
                <ChipWrap>{profile.jobTitles.map(t => <Chip key={t}>{t}</Chip>)}</ChipWrap>
              </div>
            )}
            {profile.skills.length > 0 && (
              <div>
                <SectionLabel>Skills ({profile.skills.length})</SectionLabel>
                <ChipWrap>
                  {profile.skills.slice(0, 18).map(s => <Chip key={s}>{s}</Chip>)}
                  {profile.skills.length > 18 && <Chip style={{ opacity: 0.6 }}>+{profile.skills.length - 18} more</Chip>}
                </ChipWrap>
              </div>
            )}
          </ProfileCard>

          {/* Tab area */}
          <MainArea>
            <TabBar>
              <TabBtn $active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>
                <LayoutGrid size={14} /> Find Jobs
              </TabBtn>
              <TabBtn $active={activeTab === 'ats'} onClick={() => setActiveTab('ats')}>
                <Target size={14} /> ATS Score
              </TabBtn>
              <TabBtn $active={activeTab === 'tailor'} onClick={() => setActiveTab('tailor')}>
                <Wand2 size={14} /> Tailor Resume
              </TabBtn>
              <TabBtn $active={activeTab === 'letter'} onClick={() => setActiveTab('letter')}>
                <PenLine size={14} /> Cover Letter
              </TabBtn>
            </TabBar>

            <TabContent key={activeTab}>

              {/* ─── FIND JOBS TAB ─── */}
              {activeTab === 'jobs' && (
                <>
                  <JobsSearchRow>
                    <JobsInput
                      placeholder="Job title (e.g. Senior Software Engineer)"
                      value={jobSearchTitle}
                      onChange={e => setJobSearchTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') fetchJobs(jobSearchTitle, profile.skills); }}
                    />
                    <SearchBtn
                      onClick={() => fetchJobs(jobSearchTitle, profile.skills)}
                      disabled={jobsLoading || !jobSearchTitle.trim()}
                    >
                      {jobsLoading
                        ? <><Spinner style={{ width: 14, height: 14, borderWidth: 2 } as React.CSSProperties} /> Searching…</>
                        : <><Search size={14} /> Search</>
                      }
                    </SearchBtn>
                    {jobsFetched && !jobsLoading && (
                      <ReuploadBtn onClick={() => fetchJobs(jobSearchTitle, profile.skills)}>
                        <RefreshCw size={13} /> Refresh
                      </ReuploadBtn>
                    )}
                  </JobsSearchRow>

                  {jobsError && (
                    <InfoBox style={{ background: T.redBg, borderColor: T.redBorder, color: T.red, marginBottom: 0 }}>
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      {jobsError}
                    </InfoBox>
                  )}

                  {jobsLoading && !jobListings.length && (
                    <JobsLoadingGrid>
                      {[1,2,3,4].map(i => <JobSkeleton key={i} />)}
                    </JobsLoadingGrid>
                  )}

                  {!jobsLoading && jobsFetched && jobListings.length === 0 && !jobsError && (
                    <JobsEmptyState>
                      <Building2 size={32} color={T.inkLight} />
                      <p style={{ fontSize: '0.85rem', color: T.inkLight, margin: 0 }}>
                        No listings found — try a broader title (e.g. &quot;Software Engineer&quot;)
                      </p>
                    </JobsEmptyState>
                  )}

                  {jobListings.length > 0 && (
                    <>
                      <JobsMeta>
                        Showing {jobListings.length} jobs · sorted by match score · sources: Remotive, The Muse
                      </JobsMeta>
                      <JobsList>
                        {jobListings.map(job => (
                          <JobCard key={job.id}>
                            <JobCardTop>
                              <JobLogo $src={job.logo}>
                                {!job.logo && job.company.slice(0, 2).toUpperCase()}
                              </JobLogo>
                              <JobInfo>
                                <JobTitle title={job.title}>{job.title}</JobTitle>
                                <JobCompany>
                                  <Building2 size={11} />
                                  {job.company}
                                  <JobBadge>{job.location}</JobBadge>
                                  <JobBadge $color={job.source === 'Remotive' ? T.accent : T.purple}>
                                    {job.source}
                                  </JobBadge>
                                  {job.salary && <JobSalary>{job.salary}</JobSalary>}
                                </JobCompany>
                              </JobInfo>
                              <ScoreBadge $score={job.matchScore}>
                                {job.matchScore}%
                              </ScoreBadge>
                            </JobCardTop>

                            {job.tags.length > 0 && (
                              <SkillChips>
                                {job.tags.slice(0, 8).map(tag => (
                                  <SkillChip key={tag} $matched={job.matchedSkills.some(s => s.toLowerCase() === tag.toLowerCase())}>
                                    {tag}
                                  </SkillChip>
                                ))}
                              </SkillChips>
                            )}

                            <JobActions>
                              <ApplyBtn href={job.url} target="_blank" rel="noopener noreferrer">
                                Apply <ExternalLink size={11} />
                              </ApplyBtn>
                              {job.company && (
                                <>
                                  <ResearchLink href={glassdoorUrl(job.company)} target="_blank" rel="noopener noreferrer" $color={T.green} title="Glassdoor reviews">
                                    Glassdoor
                                  </ResearchLink>
                                  <ResearchLink href={levelsUrl(job.company)} target="_blank" rel="noopener noreferrer" $color={T.purple} title="Levels.fyi comp data">
                                    Levels
                                  </ResearchLink>
                                  <ResearchLink href={linkedinUrl(job.company)} target="_blank" rel="noopener noreferrer" $color={T.accent} title="LinkedIn company page">
                                    LinkedIn
                                  </ResearchLink>
                                </>
                              )}
                            </JobActions>
                          </JobCard>
                        ))}
                      </JobsList>
                    </>
                  )}
                </>
              )}

              {/* ─── ATS TAB ─── */}
              {activeTab === 'ats' && atsData && (
                <>
                  <ScoreRow>
                    <ScoreCircle $score={atsData.score}>
                      <ScoreNum>{atsData.score}</ScoreNum>
                    </ScoreCircle>
                    <div>
                      <ScoreLabel style={{ color: scoreColor }}>{scoreLabel}</ScoreLabel>
                      <ScoreSub>ATS compatibility score out of 100</ScoreSub>
                      <ScoreSub>
                        {atsData.score >= 75 ? 'Your resume should pass most ATS filters.'
                          : atsData.score >= 50 ? 'Some issues may cause ATS rejection — fix the red items.'
                          : 'High risk of ATS rejection. Address red items before applying.'}
                      </ScoreSub>
                    </div>
                  </ScoreRow>
                  <CheckList>
                    {atsData.checks.map(c => (
                      <CheckRow key={c.label} $pass={c.pass}>
                        {c.pass
                          ? <CheckCircle size={16} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />
                          : <XCircle    size={16} color={T.red}   style={{ flexShrink: 0, marginTop: 1 }} />
                        }
                        <CheckBody>
                          <CheckTitle>{c.label} <span style={{ fontWeight: 400, fontSize: '0.72rem', color: T.inkLight }}>({c.points} pts)</span></CheckTitle>
                          <CheckMsg>{c.message}</CheckMsg>
                        </CheckBody>
                      </CheckRow>
                    ))}
                  </CheckList>
                </>
              )}

              {/* ─── TAILOR RESUME TAB ─── */}
              {activeTab === 'tailor' && (
                <>
                  <InfoBox>
                    <Wand2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    Paste a job description — see keyword match, get a ready-to-paste skills line, and find which bullets to enhance.
                  </InfoBox>
                  <JDTextarea
                    placeholder="Paste the full job description here…"
                    value={jdText} onChange={e => setJDText(e.target.value)}
                  />
                  {isAnalyzing && <AnalyzingRow><AnalyzingDot />Analyzing keywords…</AnalyzingRow>}

                  {matchResult && (
                    <>
                      <MatchScore $score={matchResult.score}>
                        {matchResult.score}%
                        <span style={{ fontSize: '0.85rem', fontFamily: T.sans, fontWeight: 600, color: T.inkLight }}>keyword match</span>
                      </MatchScore>

                      {matchResult.matched.length > 0 && (
                        <KwSection>
                          <KwLabel style={{ color: T.green }}>✓ Matched ({matchResult.matched.length})</KwLabel>
                          <KwGrid>{matchResult.matched.map(kw => <KwChip key={kw} $variant="match">{kw}</KwChip>)}</KwGrid>
                        </KwSection>
                      )}
                      {matchResult.missing.length > 0 && (
                        <KwSection>
                          <KwLabel style={{ color: T.red }}>✗ Missing ({matchResult.missing.length})</KwLabel>
                          <KwGrid>{matchResult.missing.map(kw => <KwChip key={kw} $variant="miss">{kw}</KwChip>)}</KwGrid>
                        </KwSection>
                      )}

                      {matchResult.skillsToAdd.length > 0 && (
                        <ActionBox>
                          <ActionTitle><Wand2 size={13} />Quick Add — copy this line to your Skills section</ActionTitle>
                          <SkillsSnippet>{skillsSnippet}</SkillsSnippet>
                          <SmallCopyBtn $copied={copiedSkills} onClick={() => handleCopySkills(skillsSnippet)}>
                            {copiedSkills ? <CheckCircle size={12} /> : <Copy size={12} />}
                            {copiedSkills ? 'Copied!' : 'Copy Skills Line'}
                          </SmallCopyBtn>
                          <p style={{ fontSize: '0.72rem', color: T.inkLight, margin: '0.55rem 0 0', fontStyle: 'italic' }}>
                            Only add skills you actually have. Mirror the exact phrasing the JD uses.
                          </p>
                        </ActionBox>
                      )}

                      {matchResult.bulletHints.length > 0 && (
                        <ActionBox style={{ marginTop: '0.75rem', borderColor: T.amberBorder, background: T.amberBg }}>
                          <ActionTitle style={{ color: T.amber }}>
                            <ClipboardList size={13} />
                            Bullet Enhancements — these existing bullets are close, consider mentioning:
                          </ActionTitle>
                          <BulletHintList>
                            {matchResult.bulletHints.map((hint, i) => (
                              <BulletHintRow key={i}>
                                <BulletHintKw>Add &quot;{hint.suggestedKeyword}&quot; here →</BulletHintKw>
                                <BulletHintText>…{hint.bullet}</BulletHintText>
                              </BulletHintRow>
                            ))}
                          </BulletHintList>
                        </ActionBox>
                      )}

                      {matchResult.score < 60 && (
                        <MatchTip>
                          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                          Score below 60% — tailor your resume before applying.
                          Mirror the JD&apos;s exact phrasing (e.g. if it says &quot;CI/CD pipelines&quot;, use that exact phrase).
                        </MatchTip>
                      )}
                    </>
                  )}
                  {!jdText.trim() && <EmptyNote>Paste a job description above to get tailoring suggestions</EmptyNote>}
                </>
              )}

              {/* ─── COVER LETTER TAB ─── */}
              {activeTab === 'letter' && (
                <LetterWrap>
                  <InfoBox>
                    <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    Generated from your resume. Paste a JD in Tailor Resume first for a more targeted letter.
                    Customize the [BRACKETS] before sending — especially the company-specific line.
                  </InfoBox>
                  <LetterBox>{letterText}</LetterBox>
                  <LetterActions>
                    <CopyBtn $copied={copied} onClick={handleCopyLetter}>
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Letter'}
                    </CopyBtn>
                    {jdText.trim() && (
                      <ReuploadBtn onClick={() => setLetterText(generateCoverLetter(profile!, jdText))}>
                        <RefreshCw size={13} /> Regenerate with JD
                      </ReuploadBtn>
                    )}
                  </LetterActions>
                  <LetterNote>
                    <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    Always personalize the [CUSTOMIZE] sections — generic cover letters get ignored.
                    The company-specific line is the most important sentence in the letter.
                  </LetterNote>
                </LetterWrap>
              )}

            </TabContent>
          </MainArea>
        </ParsedLayout>
      )}
    </Root>
  );
}
