// src\app\talkohtaco\page.tsx

'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, Sparkles, Zap, AlertCircle, Bot, User, Send, X, Download, Cpu, Check, Loader, Globe, Heart } from 'lucide-react';
import { JSX } from 'react';
import OptimizedChat, { OptimizedModelManager, AGENT_PERSONALITIES } from '@/components/llm/webLLM';

/* ==========================
   ENHANCED TYPES & INTERFACES
   ========================== */

type AgentStatus = 'ready' | 'inDev';
type AgentCategory = 'language' | 'coding' | 'creative';

interface Agent {
    id: number;
    name: string;
    role: string;
    category: AgentCategory;
    status: AgentStatus;
    tags?: string[];
    short?: string;
    systemPrompt: string;
    nativeLanguage?: string;
    specialties?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

interface SearchFilters {
    query: string;
    category: 'all' | AgentCategory;
    status: 'all' | AgentStatus;
    language: 'all' | 'english' | 'spanish' | 'french' | 'chinese' | 'multilingual';
    difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
}

/* ==========================
   ENHANCED AGENT DATA
   ========================== */

const OPTIMIZED_AGENTS: Agent[] = [
    // Language Learning Agents
    {
        id: 1,
        name: 'Lexi',
        role: 'Arabic Teacher',
        category: 'language',
        status: 'ready',
        tags: ['conversation', 'grammar', 'Arabic', 'pronunciation', 'writing'],
        short: 'Friendly and supportive Arabic tutor for learners of all levels',
        nativeLanguage: 'Arabic',
        specialties: [
            'conversational Arabic',
            'grammar basics',
            'pronunciation practice',
            'reading & writing',
            'daily expressions'
        ],
        difficulty: 'all',
        systemPrompt: 'Enhanced system prompt handled by AGENT_PERSONALITIES'
    },
    {
        id: 2,
        name: 'Kai',
        role: 'Spanish Teacher',
        category: 'language',
        status: 'ready',
        tags: ['pronunciation', 'conversation', 'grammar', 'español', 'cultura'],
        short: 'Patient Spanish teaching with cultural immersion',
        nativeLanguage: 'Spanish',
        specialties: ['pronunciation', 'conversational Spanish', 'grammar', 'cultural context'],
        difficulty: 'all',
        systemPrompt: 'Enhanced system prompt handled by AGENT_PERSONALITIES'
    },
    {
        id: 3,
        name: 'Sana',
        role: 'French Teacher',
        category: 'language',
        status: 'ready',
        tags: ['grammar', 'conversation', 'pronunciation', 'français', 'culture'],
        short: 'Systematic French teaching with proper accent',
        nativeLanguage: 'French',
        specialties: ['French grammar', 'pronunciation', 'conversation', 'formal French'],
        difficulty: 'all',
        systemPrompt: 'Enhanced system prompt handled by AGENT_PERSONALITIES'
    },
    {
        id: 6,
        name: 'Mei',
        role: 'Mandarin Teacher',
        category: 'language',
        status: 'ready',
        tags: ['tones', 'pronunciation', 'characters', '中文', 'pinyin'],
        short: 'Encouraging Mandarin with tone mastery focus',
        nativeLanguage: 'Mandarin',
        specialties: ['tone practice', 'character recognition', 'pronunciation', 'conversational Mandarin'],
        difficulty: 'all',
        systemPrompt: 'Enhanced system prompt handled by AGENT_PERSONALITIES'
    },

    // Coding Mentors
    {
        id: 13,
        name: 'Jax',
        role: 'JavaScript Mentor',
        category: 'coding',
        status: 'ready',
        tags: ['JavaScript', 'ESNext', 'coding', 'web development', 'React'],
        short: 'Enthusiastic code mentoring & practical exercises',
        nativeLanguage: 'English',
        specialties: ['modern JavaScript', 'ES6+', 'debugging', 'best practices'],
        difficulty: 'intermediate',
        systemPrompt: 'You are Jax, an enthusiastic JavaScript mentor. Focus on practical coding, modern ES6+ features, and building real projects.'
    },

    // Creative Arts
    {
        id: 21,
        name: 'Aria',
        role: 'Music Theory & Ear Training',
        category: 'creative',
        status: 'ready',
        tags: ['music', 'pitch', 'theory', 'ear training', 'intervals'],
        short: 'Musical ear training & perfect pitch development',
        nativeLanguage: 'English',
        specialties: ['perfect pitch', 'interval recognition', 'music theory', 'ear training'],
        difficulty: 'all',
        systemPrompt: 'You are Aria, a musical teacher specializing in ear training and music theory. Help develop perfect pitch and musical understanding.'
    },
    {
        id: 23,
        name: 'Pixel',
        role: 'Digital Art & Design',
        category: 'creative',
        status: 'ready',
        tags: ['design', 'art', 'creativity', 'digital art', 'composition'],
        short: 'Creative design mentoring & artistic development',
        nativeLanguage: 'English',
        specialties: ['digital art', 'color theory', 'composition', 'design critique'],
        difficulty: 'all',
        systemPrompt: 'You are Pixel, a creative art mentor. Provide constructive feedback on artwork and teach design principles.'
    },

    // In Development Agents
    {
        id: 4,
        name: 'Ryo',
        role: 'Japanese Culture & Language',
        category: 'language',
        status: 'inDev',
        tags: ['phrases', 'culture', 'conversation', '日本語'],
        short: 'Cultural immersion + language fundamentals',
        nativeLanguage: 'Japanese',
        difficulty: 'beginner',
        systemPrompt: ''
    },
    {
        id: 5,
        name: 'Elara',
        role: 'German Teacher',
        category: 'language',
        status: 'inDev',
        tags: ['fluency', 'grammar', 'conversation', 'Deutsch'],
        short: 'Comprehensive German instruction',
        nativeLanguage: 'German',
        difficulty: 'all',
        systemPrompt: ''
    },
    {
        id: 14,
        name: 'Navi',
        role: 'React & Next.js Tutor',
        category: 'coding',
        status: 'inDev',
        tags: ['React', 'Next.js', 'web development'],
        short: 'Modern web development mentoring',
        difficulty: 'intermediate',
        systemPrompt: ''
    },
    {
        id: 15,
        name: 'Pyra',
        role: 'Python Debugging Assistant',
        category: 'coding',
        status: 'inDev',
        tags: ['Python', 'debugging', 'algorithms'],
        short: 'Debugging and idiomatic Python',
        difficulty: 'intermediate',
        systemPrompt: ''
    },
    {
        id: 22,
        name: 'Lyra',
        role: 'Music Theory & Composition',
        category: 'creative',
        status: 'inDev',
        tags: ['music', 'composition', 'theory'],
        short: 'Advanced theory & composing guidance',
        difficulty: 'advanced',
        systemPrompt: ''
    },
];

/* ==========================
   PERFORMANCE OPTIMIZED COMPONENTS
   ========================== */

// Memoized avatar component for better performance
const MemoizedAvatar = React.memo(function AnimatedAvatar({
    name,
    id,
    size = 84,
    nativeLanguage
}: {
    name: string;
    id: number;
    size?: number;
    nativeLanguage?: string;
}) {
    const seed = useMemo(() => {
        let h = 2166136261 >>> 0;
        const str = String(id) + ':' + name;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h;
    }, [id, name]);

    const faceGradients = [
        ['#ffd7b5', '#ffc29f'],
        ['#ffe7d6', '#ffd1b3'],
        ['#f8d7ff', '#f2b8ff'],
        ['#dbeafe', '#bfdbfe'],
        ['#dffcd6', '#baf5a6'],
    ];

    const hairColors = ['#1f2937', '#334155', '#6b21a8', '#0ea5a4', '#b45309', '#7c3aed'];

    const grad = faceGradients[seed % faceGradients.length];
    const hair = hairColors[(seed >> 8) % hairColors.length];
    const eyeType = (seed >> 16) % 3;
    const mouthType = (seed >> 20) % 3;
    const tilt = ((seed % 11) - 5) * 0.7;

    const initials = useMemo(() => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }, [name]);

    return (
        <AvatarWrapper $size={size} style={{ transform: `rotate(${tilt}deg)` }}>
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

                <g filter={`url(#soft-${id})`}>
                    <circle cx="60" cy="54" r="36" fill={`url(#fg-${id})`} />
                </g>

                <g transform="translate(0, -6)">
                    <path
                        d="M26 40c6-18 28-24 48-18 8 2 14 8 18 16 2 6 2 12-2 16-8 8-42 18-64 2-4-3-5-12-0-16z"
                        fill={hair}
                        opacity="0.95"
                    />
                </g>

                <g>
                    <g transform="translate(36,52)">
                        <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#fff" />
                        {eyeType === 0 && <circle cx="0" cy="0" r="2.2" fill="#111827" />}
                        {eyeType === 1 && (
                            <>
                                <circle cx="0" cy="0" r="3.6" fill="#0f172a" />
                                <circle cx="-0.8" cy="-0.8" r="1.1" fill="#ffffff" opacity="0.9" />
                            </>
                        )}
                        {eyeType === 2 && <ellipse cx="0" cy="0.3" rx="2.6" ry="3.2" fill="#0b1220" />}
                        <BlinkingEyeLid x="-8" y="-6" width="16" height="12" rx="6" fill={`url(#fg-${id})`} />
                    </g>

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
                        <BlinkingEyeLid x="-8" y="-6" width="16" height="12" rx="6" fill={`url(#fg-${id})`} />
                    </g>
                </g>

                <g>
                    <ellipse cx="44" cy="70" rx="6.5" ry="3.5" fill="#ffdede" opacity="0.6" />
                    <ellipse cx="76" cy="70" rx="6.5" ry="3.5" fill="#ffdede" opacity="0.6" />
                </g>

                <g transform="translate(60,82)">
                    {mouthType === 0 && (
                        <path d="M-10 0 C -6 8, 6 8, 10 0" fill="transparent" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="scale(1,0.9)" />
                    )}
                    {mouthType === 1 && (
                        <path d="M-12 0 C -6 12, 6 12, 12 0 C 6 6, -6 6, -12 0" fill="#111827" opacity="0.07" />
                    )}
                    {mouthType === 2 && (
                        <>
                            <BreathingMouth cx="0" cy="0" rx="8" ry="4.6" fill="#111827" opacity="0.95" />
                            <ellipse cx="0" cy="0.6" rx="4.2" ry="2.2" fill="#fff" opacity="0.08" />
                        </>
                    )}
                </g>

                <g transform="translate(60,106)">
                    <rect x="-16" y="-10" width="32" height="20" rx="8" fill="rgba(255,255,255,0.6)" opacity="0.75" />
                    <text x="0" y="4" fontSize="9" textAnchor="middle" fill="#0f172a" fontWeight={700}>{initials}</text>
                </g>

                {/* Language indicator */}
                {nativeLanguage && nativeLanguage !== 'English' && (
                    <g transform="translate(95, 25)">
                        <circle cx="0" cy="0" r="8" fill="#3b82f6" opacity="0.9" />
                        <Globe x="-5" y="-5" width="10" height="10" fill="white" />
                    </g>
                )}
            </svg>
        </AvatarWrapper>
    );
});

/* ==========================
   INTELLIGENT SEARCH & FILTERING
   ========================== */

class AgentSearchEngine {
    static searchAgents(agents: Agent[], filters: SearchFilters): Agent[] {
        return agents.filter(agent => {
            // Category filter
            if (filters.category !== 'all' && agent.category !== filters.category) return false;

            // Status filter
            if (filters.status !== 'all' && agent.status !== filters.status) return false;

            // Language filter
            if (filters.language !== 'all') {
                const langMap = {
                    english: ['English'],
                    spanish: ['Spanish'],
                    french: ['French'],
                    chinese: ['Mandarin', 'Chinese'],
                    multilingual: ['Spanish', 'French', 'Mandarin', 'Chinese']
                };

                const targetLangs = langMap[filters.language as keyof typeof langMap];
                if (targetLangs && !targetLangs.includes(agent.nativeLanguage || 'English')) return false;
            }

            // Difficulty filter
            if (filters.difficulty !== 'all' && agent.difficulty && agent.difficulty !== 'all' && agent.difficulty !== filters.difficulty) return false;

            // Query filter
            if (filters.query.trim()) {
                const query = filters.query.toLowerCase();
                const searchableText = [
                    agent.name,
                    agent.role,
                    agent.short || '',
                    ...(agent.tags || []),
                    ...(agent.specialties || []),
                    agent.nativeLanguage || ''
                ].join(' ').toLowerCase();

                return searchableText.includes(query);
            }

            return true;
        });
    }

    static getSuggestions(query: string, agents: Agent[]): string[] {
        if (!query.trim()) return [];

        const suggestions = new Set<string>();
        const queryLower = query.toLowerCase();

        agents.forEach(agent => {
            // Check names
            if (agent.name.toLowerCase().includes(queryLower)) {
                suggestions.add(agent.name);
            }

            // Check tags
            agent.tags?.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower)) {
                    suggestions.add(tag);
                }
            });

            // Check specialties
            agent.specialties?.forEach(specialty => {
                if (specialty.toLowerCase().includes(queryLower)) {
                    suggestions.add(specialty);
                }
            });
        });

        return Array.from(suggestions).slice(0, 5);
    }
}

/* ==========================
   MAIN OPTIMIZED COMPONENT
   ========================== */

export default function OptimizedTalkOhTacoPage(): JSX.Element {
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        category: 'all',
        status: 'all',
        language: 'all',
        difficulty: 'all'
    });

    const [toast, setToast] = useState<string | null>(null);
    const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
    const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

    const modelManager = OptimizedModelManager.getInstance();

    // Memoized filtered agents for performance
    const filteredAgents = useMemo(() => {
        return AgentSearchEngine.searchAgents(OPTIMIZED_AGENTS, filters);
    }, [filters]);

    // Memoized statistics
    const agentStats = useMemo(() => {
        const total = OPTIMIZED_AGENTS.length;
        const ready = OPTIMIZED_AGENTS.filter(a => a.status === 'ready').length;
        const languages = new Set(OPTIMIZED_AGENTS.map(a => a.nativeLanguage).filter(Boolean)).size;

        return { total, ready, languages, inDev: total - ready };
    }, []);

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Check if model is already ready
    useEffect(() => {
        if (modelManager.isModelReady()) {
            setModelStatus('ready');
        }
    }, []);

    // Update search suggestions
    useEffect(() => {
        if (filters.query.length > 1) {
            const suggestions = AgentSearchEngine.getSuggestions(filters.query, OPTIMIZED_AGENTS);
            setSearchSuggestions(suggestions);
        } else {
            setSearchSuggestions([]);
        }
    }, [filters.query]);

    const handleLoadModel = async () => {
        if (modelStatus === 'loading' || modelStatus === 'ready') return;

        setModelStatus('loading');
        setLoadingProgress(0);
        setLoadingText('Initializing AI models...');

        try {
            await modelManager.loadModel((progress, text) => {
                setLoadingProgress(progress);
                setLoadingText(text);
            });

            setModelStatus('ready');
            setToast(`🎉 AI models loaded! All ${agentStats.ready} agents ready for multilingual conversation.`);
        } catch (error) {
            console.error('Failed to load model:', error);
            setModelStatus('idle');
            setToast('❌ Failed to load AI models. Please check your connection and try again.');
        }
    };

    const handleStartAgent = useCallback((agent: Agent) => {
        if (agent.status === 'inDev') {
            setToast(`🔧 ${agent.name} is in development. Coming soon with ${agent.nativeLanguage || 'enhanced'} capabilities!`);
            return;
        }

        if (modelStatus !== 'ready') {
            setToast('⚡ Please load the AI models first using the button above.');
            return;
        }

        setActiveAgent(agent);
    }, [modelStatus]);

    const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const getModelButtonText = () => {
        if (modelStatus === 'ready') return `Chat with ${agentStats.ready} Agents`;
        if (modelStatus === 'loading') return `Loading... ${loadingProgress}%`;
        return `Load AI Models (${agentStats.ready} agents, ${agentStats.languages} languages)`;
    };

    return (
        <PageWrapper>
            {/* Global model loading indicator */}
            <ModelStatusBar $isVisible={modelStatus === 'loading'}>
                <SpinningIcon $spinning={true}>
                    <Cpu size={20} />
                </SpinningIcon>
                <div>
                    <div style={{ fontWeight: 600 }}>{loadingText}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        {loadingProgress}% complete • Preparing multilingual AI
                    </div>
                </div>
            </ModelStatusBar>

            <Hero>
                <HeroTitle>TalkOh—Taco: Learn A New Language!</HeroTitle>
                <HeroSubtitle>
                    Learn languages with native-speaking AI tutors, master coding with expert mentors,
                    and develop creative skills. Powered by local AI running entirely in your browser.
                </HeroSubtitle>

                {/* Model Status & Load Button */}
                {modelStatus !== 'ready' ? (
                    <LoadAIButton
                        $status={modelStatus}
                        onClick={handleLoadModel}
                        disabled={modelStatus === 'loading'}
                    >
                        <SpinningIcon $spinning={modelStatus === 'loading'}>
                            {modelStatus === 'idle' && <Download size={20} />}
                            {modelStatus === 'loading' && <Loader size={20} />}
                        </SpinningIcon>
                        {getModelButtonText()}
                    </LoadAIButton>
                ) : (
                    <ReadyBadge>
                        <Check size={18} />
                        <div>
                            <div style={{ fontWeight: 700 }}>🎯 AI Ready for Instant Chat!</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                {agentStats.ready} agents • {agentStats.languages} languages • Offline-capable
                            </div>
                        </div>
                    </ReadyBadge>
                )}

                {/* Enhanced Search */}
                <SearchSection>
                    <SearchContainer>
                        <SearchIcon><Search size={20} /></SearchIcon>
                        <SearchInput
                            value={filters.query}
                            onChange={(e) => updateFilter('query', e.target.value)}
                            placeholder="Search agents, languages, skills (e.g. 'Spanish conversation', 'JavaScript debugging', 'music theory')"
                        />
                        {searchSuggestions.length > 0 && (
                            <SearchSuggestions>
                                {searchSuggestions.map(suggestion => (
                                    <SuggestionItem
                                        key={suggestion}
                                        onClick={() => updateFilter('query', suggestion)}
                                    >
                                        {suggestion}
                                    </SuggestionItem>
                                ))}
                            </SearchSuggestions>
                        )}
                    </SearchContainer>

                    {/* Enhanced Filters */}
                    <FilterRow>
                        <FilterGroup>
                            <FilterLabel>Category:</FilterLabel>
                            <FilterPills>
                                {(['all', 'language', 'coding', 'creative'] as const).map(cat => (
                                    <FilterPill
                                        key={cat}
                                        $active={filters.category === cat}
                                        onClick={() => updateFilter('category', cat)}
                                    >
                                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </FilterPill>
                                ))}
                            </FilterPills>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Language:</FilterLabel>
                            <FilterPills>
                                {(['all', 'english', 'spanish', 'french', 'chinese', 'multilingual'] as const).map(lang => (
                                    <FilterPill
                                        key={lang}
                                        $active={filters.language === lang}
                                        onClick={() => updateFilter('language', lang)}
                                    >
                                        {lang === 'all' ? 'All' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </FilterPill>
                                ))}
                            </FilterPills>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Status:</FilterLabel>
                            <FilterPills>
                                <FilterPill
                                    $active={filters.status === 'all'}
                                    onClick={() => updateFilter('status', 'all')}
                                >
                                    All
                                </FilterPill>
                                <FilterPill
                                    $active={filters.status === 'ready'}
                                    onClick={() => updateFilter('status', 'ready')}
                                >
                                    Available ({agentStats.ready})
                                </FilterPill>
                                <FilterPill
                                    $active={filters.status === 'inDev'}
                                    onClick={() => updateFilter('status', 'inDev')}
                                >
                                    In Development ({agentStats.inDev})
                                </FilterPill>
                            </FilterPills>
                        </FilterGroup>
                    </FilterRow>
                </SearchSection>
            </Hero>

            {/* Agents Grid */}
            <AgentsSection>
                <SectionHeader>
                    <h2>Available AI Trainers</h2>
                    <p>Choose your specialized AI tutor for personalized learning</p>
                </SectionHeader>

                <AgentsGrid>
                    {filteredAgents.length === 0 ? (
                        <EmptyState>
                            <AlertCircle size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
                            <h3>No agents match your filters</h3>
                            <p>Try adjusting your search criteria or browse all available agents.</p>
                            <ResetFiltersButton
                                onClick={() => setFilters({
                                    query: '',
                                    category: 'all',
                                    status: 'all',
                                    language: 'all',
                                    difficulty: 'all'
                                })}
                            >
                                <Sparkles size={16} />
                                Show All Agents
                            </ResetFiltersButton>
                        </EmptyState>
                    ) : (
                        filteredAgents.map((agent) => (
                            <AgentCard
                                key={agent.id}
                                $status={agent.status}
                                $disabled={agent.status === 'ready' && modelStatus !== 'ready'}
                            >
                                <MemoizedAvatar
                                    name={agent.name}
                                    id={agent.id}
                                    size={84}
                                    nativeLanguage={agent.nativeLanguage}
                                />

                                <AgentName>
                                    {agent.name}
                                    {agent.nativeLanguage && agent.nativeLanguage !== 'English' && (
                                        <LanguageBadge>
                                            <Globe size={12} />
                                            {agent.nativeLanguage}
                                        </LanguageBadge>
                                    )}
                                    {agent.status === 'inDev' && (
                                        <DevBadge>
                                            <AlertCircle size={12} />
                                            In Development
                                        </DevBadge>
                                    )}
                                </AgentName>

                                <AgentRole>{agent.role}</AgentRole>

                                {agent.short && (
                                    <AgentDescription>{agent.short}</AgentDescription>
                                )}

                                {agent.specialties && (
                                    <SpecialtiesList>
                                        {agent.specialties.slice(0, 3).map(specialty => (
                                            <SpecialtyTag key={specialty}>{specialty}</SpecialtyTag>
                                        ))}
                                        {agent.specialties.length > 3 && (
                                            <SpecialtyTag>+{agent.specialties.length - 3} more</SpecialtyTag>
                                        )}
                                    </SpecialtiesList>
                                )}

                                {agent.tags && (
                                    <TagsList>
                                        {agent.tags.slice(0, 4).map(tag => (
                                            <Tag key={tag}>{tag}</Tag>
                                        ))}
                                    </TagsList>
                                )}

                                <ActionRow>
                                    <PrimaryButton
                                        onClick={() => handleStartAgent(agent)}
                                        $disabled={agent.status === 'inDev' || (agent.status === 'ready' && modelStatus !== 'ready')}
                                    >
                                        <Sparkles size={14} />
                                        {agent.status === 'inDev'
                                            ? 'Preview'
                                            : modelStatus === 'ready'
                                                ? 'Start Chat'
                                                : 'Load AI First'
                                        }
                                    </PrimaryButton>

                                    <SecondaryButton
                                        onClick={() => {
                                            if (agent.status === 'inDev') {
                                                setToast(`💡 ${agent.name} preview: Will teach ${agent.nativeLanguage || 'skills'} with focus on ${agent.short?.toLowerCase()}`);
                                            } else {
                                                const personality = AGENT_PERSONALITIES.get(agent.name);
                                                const tips = personality?.languageRules.useNativeInGreeting
                                                    ? `💬 ${agent.name} will greet you in ${agent.nativeLanguage} and provide bilingual explanations!`
                                                    : `💡 ${agent.name} specializes in ${agent.short?.toLowerCase()}. Voice responses play automatically!`;
                                                setToast(tips);
                                            }
                                        }}
                                    >
                                        <Heart size={14} />
                                        {agent.status === 'inDev' ? 'Preview' : 'Tips'}
                                    </SecondaryButton>
                                </ActionRow>
                            </AgentCard>
                        ))
                    )}
                </AgentsGrid>
            </AgentsSection>

            {/* Active Chat */}
            {activeAgent && (
                <OptimizedChat
                    agent={activeAgent}
                    onClose={() => setActiveAgent(null)}
                />
            )}

            {/* Toast Notifications */}
            {toast && (
                <ToastContainer>
                    <ToastMessage>
                        {toast}
                    </ToastMessage>
                </ToastContainer>
            )}
        </PageWrapper>
    );
}

/* ==========================
   OPTIMIZED STYLED COMPONENTS
   ========================== */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const blink = keyframes`
  0%, 45%, 100% { transform: scaleY(1); }
  48% { transform: scaleY(0.08); }
`;

const breathe = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-1px) scale(1.02); }
`;

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  margin-top: -80px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
`;

const ModelStatusBar = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 320px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
  z-index: 1000;
  display: ${({ $isVisible }) => $isVisible ? 'flex' : 'none'};
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  max-width: 90vw;
  animation: ${fadeInUp} 0.3s ease;
`;

const Hero = styled.section`
  padding: 6rem 1.5rem 4rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.03) 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    right: -20%;
    top: -30%;
    background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 55%);
    filter: blur(32px);
    z-index: 0;
    animation: ${float} 20s ease-in-out infinite;
  }
`;

const HeroTitle = styled.h1`
  position: relative;
  z-index: 1;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  position: relative;
  z-index: 1;
  color: #475569;
  max-width: 900px;
  margin: 0 auto 2rem;
  font-size: 1.125rem;
  line-height: 1.6;
`;

const LoadAIButton = styled.button<{ $status: 'idle' | 'loading' | 'ready' }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.125rem;
  border: none;
  cursor: ${({ $status }) => $status === 'loading' ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.2);

  ${({ $status }) => {
        switch ($status) {
            case 'idle':
                return `
          background: linear-gradient(135deg, #3b82f6, #7c3aed);
          color: white;
          &:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(59, 130, 246, 0.3); }
        `;
            case 'loading':
                return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        `;
        }
    }}
`;

const ReadyBadge = styled.div`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.2);
  animation: ${fadeInUp} 0.5s ease;
`;

const SpinningIcon = styled.div<{ $spinning: boolean }>`
  display: flex;
  align-items: center;
  animation: ${({ $spinning }) => $spinning ? spin : 'none'} 2s linear infinite;
`;

const SearchSection = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 2;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.25rem 3.5rem 1.25rem 3.5rem;
  border-radius: 16px;
  border: 1px solid #e6eef8;
  background: white;
  font-size: 1.125rem;
  box-shadow: 0 8px 24px rgba(15,23,42,0.06);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 12px 32px rgba(59,130,246,0.15);
    transform: translateY(-1px);
  }
`;

const SearchSuggestions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e6eef8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.1);
  z-index: 10;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const SuggestionItem = styled.button`
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  transition: background 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const FilterPill = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? 'linear-gradient(135deg,#3b82f6,#7c3aed)' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#334155')};
  border: 1px solid ${({ $active }) => ($active ? 'transparent' : '#e6eef8')};
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

const AgentsSection = styled.section`
  padding: 4rem 1.5rem 8rem;
  background: white;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
    color: #0f172a;
  }
  
  p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }
`;

const AgentsGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  h3 {
    margin: 0 0 0.5rem;
    color: #374151;
  }
  
  p {
    margin: 0 0 2rem;
  }
`;

const ResetFiltersButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  }
`;

const AgentCard = styled.article<{ $status: AgentStatus; $disabled?: boolean }>`
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(8,15,30,0.06);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid ${({ $status }) => ($status === 'inDev' ? 'rgba(245,158,11,0.1)' : 'transparent')};
  opacity: ${({ $disabled }) => $disabled ? 0.7 : 1};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $status }) =>
        $status === 'ready'
            ? 'linear-gradient(90deg, #10b981, #3b82f6)'
            : 'linear-gradient(90deg, #f59e0b, #d97706)'
    };
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-12px)'};
    box-shadow: ${({ $disabled }) => $disabled ? '0 8px 24px rgba(8,15,30,0.06)' : '0 24px 48px rgba(17,24,39,0.12)'};
    
    &::before {
      opacity: 1;
    }
  }
`;

const AvatarWrapper = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  margin: 0 auto 1.5rem;
  position: relative;
  transition: transform 0.3s ease;
  
  ${AgentCard}:hover & {
    transform: scale(1.05);
  }
`;

const BlinkingEyeLid = styled.rect`
  transform-origin: center;
  animation: ${blink} 5s infinite ease-in-out;
`;

const BreathingMouth = styled.ellipse`
  transform-origin: center;
  animation: ${breathe} 4s ease-in-out infinite;
`;

const AgentName = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const LanguageBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(90deg, #3b82f6, #7c3aed);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const DevBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const AgentRole = styled.p`
  margin: 0 0 1rem;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
`;

const AgentDescription = styled.p`
  margin: 0 0 1.5rem;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const SpecialtiesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const SpecialtyTag = styled.span`
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Tag = styled.span`
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`;

const PrimaryButton = styled.button<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  flex: 1;

  ${({ $disabled }) => {
        if ($disabled) {
            return `
        background: #e5e7eb;
        color: #9ca3af;
      `;
        }
        return `
      background: linear-gradient(135deg, #3b82f6, #7c3aed);
      color: white;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
      }
    `;
    }}
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  max-width: 90vw;
`;

const ToastMessage = styled.div`
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  animation: ${fadeInUp} 0.3s ease;
  max-width: 500px;
  text-align: center;
`;