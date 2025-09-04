// src/app/talkohtaco/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Search, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { JSX } from 'react';

/* ==========================
   MOCK AGENTS (categorized + statuses)
   ========================== */
type AgentStatus = 'ready' | 'inDev';
type AgentCategory = 'language' | 'coding' | 'creative';

const agents: Array<{
    id: number;
    name: string;
    role: string;
    category: AgentCategory;
    status: AgentStatus;
    tags?: string[];
    short?: string;
}> = [
        { id: 1, name: 'Lexi', role: 'English Conversation', category: 'language', status: 'ready', tags: ['conversation', 'IELTS'], short: 'Friendly conversation practice' },
        { id: 2, name: 'Kai', role: 'Spanish Pronunciation', category: 'language', status: 'ready', tags: ['pronunciation'], short: 'Phonetics & accent work' },
        { id: 3, name: 'Sana', role: 'French Grammar', category: 'language', status: 'ready', tags: ['grammar'], short: 'Focused grammar drills' },
        { id: 4, name: 'Ryo', role: 'Japanese Culture & Phrases', category: 'language', status: 'inDev', tags: ['phrases', 'culture'], short: 'Short cultural lessons + phrases' },
        { id: 5, name: 'Elara', role: 'German Fluency', category: 'language', status: 'inDev', tags: ['fluency'], short: 'Conversation and fluency training' },
        { id: 6, name: 'Mei', role: 'Mandarin Tone Practice', category: 'language', status: 'ready', tags: ['tones'], short: 'Tone drills and listening' },

        { id: 13, name: 'Jax', role: 'JavaScript Mentor', category: 'coding', status: 'ready', tags: ['JavaScript', 'ESNext'], short: 'Code explanations & exercises' },
        { id: 14, name: 'Navi', role: 'React & Next.js Tutor', category: 'coding', status: 'inDev', tags: ['React', 'Next.js'], short: 'Project-based help (coming soon)' },
        { id: 15, name: 'Pyra', role: 'Python Debugging Assistant', category: 'coding', status: 'inDev', tags: ['Python'], short: 'Debugging and idiomatic fixes' },

        { id: 21, name: 'Aria', role: 'Perfect Pitch Training', category: 'creative', status: 'ready', tags: ['music', 'pitch'], short: 'Ear training and pitch identification' },
        { id: 22, name: 'Lyra', role: 'Music Theory & Composition', category: 'creative', status: 'inDev', tags: ['music'], short: 'Theory lessons & composing tips' },
        { id: 23, name: 'Pixel', role: 'Digital Art & Design', category: 'creative', status: 'ready', tags: ['design'], short: 'Critique & technique guidance' },
    ];

/* ==========================
   ANIMATIONS & STYLES
   ========================== */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const blink = keyframes`
  0%, 45%, 100% { transform: scaleY(1); }
  48% { transform: scaleY(0.08); }
`;

const breathe = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-1px) scale(1.02); }
`;

/* ==========================
   LAYOUT STYLES (kept from previous)
   ========================== */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  margin-top: -80px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
`;

/* HERO */
const Hero = styled.section`
  padding: 5.5rem 1.25rem 3rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.03) 100%);
  margin-bottom: 1.5rem;

  &::before {
    content: "";
    position: absolute;
    width: 720px;
    height: 720px;
    border-radius: 50%;
    right: -20%;
    top: -30%;
    background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 55%);
    filter: blur(24px);
    z-index: 0;
    animation: ${float} 18s ease-in-out infinite;
  }
`;

const HeroTitle = styled.h1`
  position: relative;
  z-index: 1;
  font-size: clamp(2.25rem, 4.5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.05;
  margin: 0 0 0.75rem;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  position: relative;
  z-index: 1;
  color: #475569;
  max-width: 820px;
  margin: 0 auto 1.75rem;
  font-size: 1.03rem;
`;

/* Controls */
const Controls = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const SearchWrap = styled.div`
  position: relative;
  width: min(720px, 84%);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.95rem 3.2rem 0.95rem 3.1rem;
  border-radius: 9999px;
  border: 1px solid #e6eef8;
  background: white;
  font-size: 1rem;
  box-shadow: 0 6px 18px rgba(15,23,42,0.04);
  transition: box-shadow 160ms ease, transform 160ms ease;

  &:focus {
    box-shadow: 0 10px 30px rgba(59,130,246,0.12);
    outline: none;
    transform: translateY(-1px);
    border-color: #cfe4ff;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.05rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

/* Filter pills */
const Pills = styled.div`
  display:flex;
  gap: .5rem;
  align-items:center;
  justify-content:center;
  flex-wrap:wrap;
`;

const Pill = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg,#3b82f6,#7c3aed)' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#334155')};
  border: 1px solid ${({ $active }) => ($active ? 'transparent' : '#e6eef8')};
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ $active }) => ($active ? '0 8px 22px rgba(59,130,246,0.12)' : 'none')};
  transition: all 180ms ease;
`;

/* Agents grid */
const AgentsSection = styled.section`
  padding: 3rem 1.25rem 6rem;
  background: #fff;
`;

const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

/* Agent card */
const Card = styled.article<{ $status: AgentStatus }>`
  background: linear-gradient(180deg, #fbfdff 0%, #f5f7fb 100%);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 6px 18px rgba(8,15,30,0.04);
  transition: transform .22s cubic-bezier(.22,.9,.35,1), box-shadow .22s;
  border: 1px solid ${({ $status }) => ($status === 'inDev' ? 'rgba(245,158,11,0.08)' : 'transparent')};

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 36px rgba(17,24,39,0.08);
  }
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
`;

const Role = styled.p`
  margin: 0.35rem 0 1rem;
  color: #475569;
  font-size: 0.9rem;
`;

/* Tags & actions */
const Tags = styled.div`
  display:flex;
  gap:0.4rem;
  justify-content:center;
  flex-wrap:wrap;
  margin-bottom: 0.9rem;
`;

const Tag = styled.span`
  background: rgba(14, 165, 233, 0.08);
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-weight:600;
  font-size: 0.78rem;
`;

/* Action area */
const ActionRow = styled.div`
  display:flex;
  gap: .6rem;
  justify-content:center;
  align-items:center;
`;

const StartBtn = styled.button<{ $disabled?: boolean }>`
  display:inline-flex;
  align-items:center;
  gap:0.5rem;
  padding:0.6rem 1rem;
  border-radius:999px;
  font-weight:700;
  color: ${({ $disabled }) => ($disabled ? '#0f172a88' : 'white')};
  background: ${({ $disabled }) => ($disabled ? '#e6e9ee' : 'linear-gradient(135deg,#3b82f6,#7c3aed)')};
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 8px 22px rgba(59,130,246,0.12)')};
  transition: transform .12s ease, box-shadow .12s ease;

  &:active { transform: translateY(1px); }
`;

/* Small Dev badge */
const DevBadge = styled.span`
  display:inline-flex;
  gap:0.4rem;
  align-items:center;
  background: linear-gradient(90deg,#fff7ed,#fff1e6);
  color: #92400e;
  padding: 0.28rem 0.5rem;
  border-radius: 999px;
  font-weight:700;
  font-size:0.78rem;
`;

/* Toast */
const ToastWrap = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  z-index: 9999;
  max-width: 92%;
`;

/* Session drawer (mock) */
const SessionPanel = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: min(440px, 92%);
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 22px 48px rgba(2,6,23,0.18);
  border: 1px solid rgba(2,6,23,0.04);
`;

/* ==========================
   AnimatedAvatar component
   ========================== */

function stringToSeed(s: string) {
    // simple deterministic hash -> number
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
}

function seededPick(seed: number, items: string[]) {
    // pseudo random pick from items
    const i = seed % items.length;
    return items[i];
}

const faceGradients = [
    ['#ffd7b5', '#ffc29f'],
    ['#ffe7d6', '#ffd1b3'],
    ['#f8d7ff', '#f2b8ff'],
    ['#dbeafe', '#bfdbfe'],
    ['#dffcd6', '#baf5a6'],
];

const hairColors = ['#1f2937', '#334155', '#6b21a8', '#0ea5a4', '#b45309', '#7c3aed'];

const EyeSVG = styled.g`
  transform-origin: center;
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;

const AnimatedFaceWrapper = styled.div<{ $size?: number }>`
  width: ${({ $size }) => ($size ?? 84)}px;
  height: ${({ $size }) => ($size ?? 84)}px;
  display: grid;
  place-items: center;
  margin: 0 auto 0.9rem;
  position: relative;
  will-change: transform;
`;

// CSS for reduced motion and some animation embedding via styled-components
const EyeLid = styled.rect`
  transform-origin: center;
  animation: ${blink} 5s infinite ease-in-out;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: none;
  }
`;

const MouthEl = styled.ellipse`
  transform-origin: center;
  animation: ${breathe} 4s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

function AnimatedAvatar({ name, id, size = 84 }: { name: string; id: number; size?: number }) {
    const seed = useMemo(() => stringToSeed(String(id) + ':' + name), [id, name]);

    // choices derived from seed
    const grad = faceGradients[seed % faceGradients.length];
    const hair = hairColors[(seed >> 8) % hairColors.length];
    const eyeType = (seed >> 16) % 3; // 0 simple dot, 1 round iris, 2 anime/oval
    const mouthType = (seed >> 20) % 3; // 0 small smile, 1 wide smile, 2 open

    const initials = useMemo(() => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }, [name]);

    // small offset to give a little tilt based on seed
    const tilt = ((seed % 11) - 5) * 0.7;

    return (
        <AnimatedFaceWrapper $size={size} style={{ transform: `rotate(${tilt}deg)` }}>
            <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`${name} avatar`}>
                <defs>
                    <linearGradient id={`fg-${id}`} x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor={grad[0]} />
                        <stop offset="100%" stopColor={grad[1]} />
                    </linearGradient>

                    <filter id={`soft-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
                    </filter>
                </defs>

                {/* face shadow (subtle) */}
                <g filter={`url(#soft-${id})`}>
                    <circle cx="60" cy="54" r="36" fill={`url(#fg-${id})`} />
                </g>

                {/* hair (simple shape) */}
                <g transform="translate(0, -6)">
                    {/* hair blob */}
                    <path
                        d="M26 40c6-18 28-24 48-18 8 2 14 8 18 16 2 6 2 12-2 16-8 8-42 18-64 2-4-3-5-12-0-16z"
                        fill={hair}
                        opacity="0.95"
                    />
                </g>

                {/* eyes */}
                <EyeSVG>
                    {/* left eye group */}
                    <g transform="translate(36,52)">
                        {/* eye white */}
                        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#fff" />
                        {/* iris / pupil variants */}
                        {eyeType === 0 && <circle cx="0" cy="0" r="2.2" fill="#111827" />}
                        {eyeType === 1 && (
                            <>
                                <circle cx="0" cy="0" r="3.6" fill="#0f172a" />
                                <circle cx="-0.8" cy="-0.8" r="1.1" fill="#ffffff" opacity="0.9" />
                            </>
                        )}
                        {eyeType === 2 && (
                            <ellipse cx="0" cy="0.3" rx="2.6" ry="3.2" fill="#0b1220" />
                        )}
                        {/* blinking lid */}
                        <EyeLid x="-8" y="-6" width="16" height="12" rx="6" fill={`url(#fg-${id})`} style={{ transformOrigin: 'center' }} />
                    </g>

                    {/* right eye group */}
                    <g transform="translate(84,52)">
                        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#fff" />
                        {eyeType === 0 && <circle cx="0" cy="0" r="2.2" fill="#111827" />}
                        {eyeType === 1 && (
                            <>
                                <circle cx="0" cy="0" r="3.6" fill="#0f172a" />
                                <circle cx="-0.8" cy="-0.8" r="1.1" fill="#ffffff" opacity="0.9" />
                            </>
                        )}
                        {eyeType === 2 && <ellipse cx="0" cy="0.3" rx="2.6" ry="3.2" fill="#0b1220" />}
                        <EyeLid x="-8" y="-6" width="16" height="12" rx="6" fill={`url(#fg-${id})`} style={{ transformOrigin: 'center' }} />
                    </g>
                </EyeSVG>

                {/* blush */}
                <g>
                    <ellipse cx="44" cy="70" rx="6.5" ry="3.5" fill="#ffdede" opacity="0.6" />
                    <ellipse cx="76" cy="70" rx="6.5" ry="3.5" fill="#ffdede" opacity="0.6" />
                </g>

                {/* mouth variations */}
                <g transform="translate(60,82)">
                    {mouthType === 0 && (
                        <path d="M-10 0 C -6 8, 6 8, 10 0" fill="transparent" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="scale(1,0.9)" />
                    )}
                    {mouthType === 1 && (
                        <path d="M-12 0 C -6 12, 6 12, 12 0 C 6 6, -6 6, -12 0" fill="#111827" opacity="0.07" />
                    )}
                    {mouthType === 2 && (
                        <>
                            <MouthEl cx="0" cy="0" rx="8" ry="4.6" fill="#111827" opacity="0.95" />
                            <ellipse cx="0" cy="0.6" rx="4.2" ry="2.2" fill="#fff" opacity="0.08" />
                        </>
                    )}
                </g>

                {/* tiny nameplate letter for recognizability (initials) */}
                <g transform="translate(60,106)">
                    <rect x="-16" y="-10" width="32" height="20" rx="8" fill="rgba(255,255,255,0.6)" opacity="0.75" />
                    <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#0f172a" fontWeight={700}>{initials}</text>
                </g>
            </svg>
        </AnimatedFaceWrapper>
    );
}

/* ==========================
   MAIN PAGE COMPONENT
   ========================== */

export default function TalkOhTacoPage(): JSX.Element {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'all' | AgentCategory | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | AgentStatus>('all');
    const [toast, setToast] = useState<string | null>(null);
    const [activeSession, setActiveSession] = useState<number | null>(null);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3600);
        return () => clearTimeout(t);
    }, [toast]);

    const categories = useMemo(() => ['all', 'language', 'coding', 'creative'] as const, []);

    const filtered = useMemo(() => {
        return agents.filter(a => {
            if (category !== 'all' && a.category !== category) return false;
            if (statusFilter !== 'all' && a.status !== statusFilter) return false;
            if (!query) return true;
            const q = query.trim().toLowerCase();
            return (
                a.name.toLowerCase().includes(q) ||
                a.role.toLowerCase().includes(q) ||
                (a.tags || []).some(t => t.toLowerCase().includes(q))
            );
        });
    }, [category, statusFilter, query]);

    function handleStart(agentId: number, status: AgentStatus) {
        if (status === 'inDev') {
            setToast('This agent is in development — coming soon. We’ll notify you when it’s available.');
            return;
        }
        setActiveSession(agentId);
    }

    function closeSession() {
        setActiveSession(null);
        setToast('Practice session ended (mock)');
    }

    return (
        <PageWrapper>
            <Hero>
                <HeroTitle>TalkOhTaco — Practice with expert agents</HeroTitle>
                <HeroSubtitle>Language tutors, coding mentors, and creative trainers — try mock sessions while the backend rests.</HeroSubtitle>

                <Controls>
                    <SearchWrap>
                        <SearchIcon><Search size={18} /></SearchIcon>
                        <SearchInput
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by agent name, skill, or tag (e.g. 'JavaScript', 'tones', 'composition')"
                            aria-label="Search agents"
                        />
                    </SearchWrap>
                </Controls>

                <Controls style={{ marginTop: 12 }}>
                    <Pills>
                        {categories.map(c => (
                            <Pill
                                key={c}
                                $active={category === c}
                                onClick={() => setCategory(c)}
                                aria-pressed={category === c}
                                title={c === 'all' ? 'All categories' : `Show ${c}`}
                            >
                                {c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1)}
                            </Pill>
                        ))}
                    </Pills>

                    <div style={{ width: 12 }} />

                    <Pills>
                        <Pill $active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All</Pill>
                        <Pill $active={statusFilter === 'ready'} onClick={() => setStatusFilter('ready')}>Available</Pill>
                        <Pill $active={statusFilter === 'inDev'} onClick={() => setStatusFilter('inDev')}>In development</Pill>
                    </Pills>
                </Controls>
            </Hero>

            <AgentsSection>
                <Grid>
                    {filtered.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            No agents match your filters.
                        </div>
                    ) : (
                        filtered.map((a, idx) => (
                            <Card key={a.id} $status={a.status}>
                                <AnimatedAvatar name={a.name} id={a.id} size={84} />

                                <Name>
                                    {a.name}{' '}
                                    {a.status === 'inDev' && (
                                        <DevBadge title="In development"><AlertCircle size={14} /> In dev</DevBadge>
                                    )}
                                </Name>

                                <Role>{a.role}</Role>

                                {a.short && <p style={{ marginTop: 0, marginBottom: 12, color: '#64748b' }}>{a.short}</p>}

                                {a.tags && (
                                    <Tags>
                                        {a.tags.map(t => <Tag key={t}>{t}</Tag>)}
                                    </Tags>
                                )}

                                <ActionRow>
                                    <StartBtn
                                        onClick={() => handleStart(a.id, a.status)}
                                        $disabled={a.status === 'inDev'}
                                        aria-disabled={a.status === 'inDev'}
                                        title={a.status === 'inDev' ? 'This agent is in development' : `Start a session with ${a.name}`}
                                    >
                                        <Sparkles size={14} /> {a.status === 'inDev' ? 'Preview' : 'Start Practice Session'}
                                    </StartBtn>

                                    <StartBtn
                                        onClick={() => {
                                            if (a.status === 'inDev') {
                                                setToast(`${a.name} is being prototyped — preview notes shown here.`);
                                            } else {
                                                setToast(`Opening quick-config for ${a.name} (mock).`);
                                            }
                                        }}
                                        style={{ background: 'linear-gradient(135deg,#f8fafc,#eef2ff)', color: '#0f172a' }}
                                    >
                                        <Zap size={14} /> {a.status === 'inDev' ? 'Dev notes' : 'Quick config'}
                                    </StartBtn>
                                </ActionRow>
                            </Card>
                        ))
                    )}
                </Grid>
            </AgentsSection>

            {/* Mock session drawer */}
            {activeSession && (
                <SessionPanel role="dialog" aria-label="Mock practice session">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                            <strong style={{ fontSize: 16 }}>{agents.find(a => a.id === activeSession)?.name} — practice session (mock)</strong>
                            <div style={{ fontSize: 13, color: '#475569' }}>Client-side mock while the backend is offline.</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setToast('Mock “save transcript” (client-only)'); }} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(2,6,23,0.06)', background: '#fff' }}>Save</button>
                            <button onClick={closeSession} style={{ padding: '8px 12px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#fb7185)', color: 'white', border: 'none' }}>End</button>
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Type to practice</label>
                        <textarea placeholder="Type a practice prompt or role-play scenario..." style={{ width: '100%', minHeight: 110, padding: 12, borderRadius: 8, border: '1px solid #e6eef8' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => setToast('Mock audio feedback: +0.3 semitones (perfect pitch preview)')} style={{ background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', color: '#fff', padding: '8px 12px', borderRadius: 10, border: 'none' }}>
                                Give feedback (mock)
                            </button>
                        </div>
                    </div>
                </SessionPanel>
            )}

            {/* Toast */}
            {toast && (
                <ToastWrap>
                    <div style={{ background: 'linear-gradient(90deg,#0f172a,#334155)', color: 'white', padding: '10px 14px', borderRadius: 10, boxShadow: '0 12px 30px rgba(2,6,23,0.2)' }}>
                        {toast}
                    </div>
                </ToastWrap>
            )}
        </PageWrapper>
    );
}
