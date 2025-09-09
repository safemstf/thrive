'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, Sparkles, Download, Check, Loader, Globe, Heart, Volume2, Users, Star } from 'lucide-react';
import OptimizedChat, { ModelManager, CHAT_AGENT_PERSONALITIES } from '@/components/llm/webLLM';

/* ==========================
   LANGUAGE GROUPS & TEACHER PAIRS
   ========================== */

interface Teacher {
    id: number;
    name: string;
    gender: 'male' | 'female';
    emotion: 'welcoming' | 'happy' | 'focused' | 'passionate' | 'excited';
    teachingStyle: string;
    specialties: string[];
}

interface LanguageGroup {
    language: string;
    nativeScript: string;
    languageCode: string;
    flag: string;
    teachers: Teacher[];
    status: 'ready' | 'inDev';
    description: string;
    combinedSpecialties: string[];
}

const LANGUAGE_GROUPS: LanguageGroup[] = [
    {
        language: 'Arabic',
        nativeScript: 'العربية',
        languageCode: 'ar',
        flag: '🇸🇦',
        status: 'ready',
        description: 'Learn Arabic with native speakers who make the language accessible and engaging',
        teachers: [
            {
                id: 1,
                name: 'Lexi',
                gender: 'female',
                emotion: 'welcoming',
                teachingStyle: 'Friendly and encouraging, perfect for beginners',
                specialties: ['conversational Arabic', 'grammar basics', 'pronunciation', 'writing']
            },
            {
                id: 7,
                name: 'Adam',
                gender: 'male',
                emotion: 'focused',
                teachingStyle: 'Calm and methodical with cultural insights',
                specialties: ['Arabic grammar', 'cultural context', 'step-by-step learning']
            }
        ],
        combinedSpecialties: ['conversation', 'grammar', 'pronunciation', 'writing', 'culture']
    },
    {
        language: 'Spanish',
        nativeScript: 'Español',
        languageCode: 'es',
        flag: '🇪🇸',
        status: 'ready',
        description: 'Master Spanish with passionate teachers who bring Latin culture to life',
        teachers: [
            {
                id: 2,
                name: 'Kai',
                gender: 'male',
                emotion: 'happy',
                teachingStyle: 'Patient and methodical with pronunciation focus',
                specialties: ['pronunciation', 'conversational Spanish', 'grammar', 'cultural context']
            },
            {
                id: 8,
                name: 'Lupita',
                gender: 'female',
                emotion: 'passionate',
                teachingStyle: 'Warm and expressive with cultural immersion',
                specialties: ['conversational Spanish', 'cultural expressions', 'practical Spanish']
            }
        ],
        combinedSpecialties: ['pronunciation', 'conversation', 'grammar', 'culture', 'expressions']
    },
    {
        language: 'French',
        nativeScript: 'Français',
        languageCode: 'fr',
        flag: '🇫🇷',
        status: 'ready',
        description: 'Discover French elegance with teachers who master both formal and casual styles',
        teachers: [
            {
                id: 3,
                name: 'Sana',
                gender: 'female',
                emotion: 'focused',
                teachingStyle: 'Systematic and precise with grammar focus',
                specialties: ['French grammar', 'pronunciation', 'formal French', 'conversation']
            },
            {
                id: 9,
                name: 'Vinz',
                gender: 'male',
                emotion: 'happy',
                teachingStyle: 'Casual and conversational for real situations',
                specialties: ['conversational French', 'practical usage', 'casual French']
            }
        ],
        combinedSpecialties: ['grammar', 'pronunciation', 'conversation', 'formal', 'casual']
    },
    {
        language: 'Chinese',
        nativeScript: '中文',
        languageCode: 'zh',
        flag: '🇨🇳',
        status: 'ready',
        description: 'Master Mandarin tones and characters with patient, encouraging teachers',
        teachers: [
            {
                id: 6,
                name: 'Mei',
                gender: 'female',
                emotion: 'welcoming',
                teachingStyle: 'Encouraging and patient with tone mastery',
                specialties: ['tone practice', 'character recognition', 'pronunciation', 'conversation']
            },
            {
                id: 10,
                name: 'Wei',
                gender: 'male',
                emotion: 'focused',
                teachingStyle: 'Structured approach with character writing focus',
                specialties: ['character writing', 'structured learning', 'pronunciation']
            }
        ],
        combinedSpecialties: ['tones', 'characters', 'pronunciation', 'conversation', 'writing']
    },
    {
        language: 'Italian',
        nativeScript: 'Italiano',
        languageCode: 'it',
        flag: '🇮🇹',
        status: 'ready',
        description: 'Experience Italian passion and culture through animated, engaging instruction',
        teachers: [
            {
                id: 11,
                name: 'Giulia',
                gender: 'female',
                emotion: 'passionate',
                teachingStyle: 'Passionate and animated with cultural immersion',
                specialties: ['Italian culture', 'animated teaching', 'conversational Italian']
            },
            {
                id: 12,
                name: 'Marco',
                gender: 'male',
                emotion: 'happy',
                teachingStyle: 'Practical and clear for travel and conversation',
                specialties: ['travel Italian', 'practical conversation', 'useful phrases']
            }
        ],
        combinedSpecialties: ['culture', 'conversation', 'travel', 'practical', 'animated']
    }
];

/* ==========================
   EMOTIONAL DUAL AVATAR COMPONENT
   ========================== */

const EmotionalAvatar = React.memo(function EmotionalAvatar({
    teacher,
    size = 72,
    isActive = false
}: {
    teacher: Teacher;
    size?: number;
    isActive?: boolean;
}) {
    const seed = useMemo(() => {
        let h = 2166136261 >>> 0;
        const str = String(teacher.id) + ':' + teacher.name;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h;
    }, [teacher.id, teacher.name]);

    // Gender-appropriate color schemes
    const colorSchemes = {
        female: [
            ['#ffd7b5', '#ffc29f'], // warm peachy
            ['#ffe7d6', '#ffd1b3'], // soft peach
            ['#f8d7ff', '#f2b8ff'], // light purple
        ],
        male: [
            ['#dbeafe', '#bfdbfe'], // soft blue
            ['#dffcd6', '#baf5a6'], // light green
            ['#fef3c7', '#fed7aa'], // warm golden
        ]
    };

    const genderColors = colorSchemes[teacher.gender];
    const colorIndex = seed % genderColors.length;
    const faceColors = genderColors[colorIndex];

    // Hair colors based on emotion and gender
    const hairColors = {
        female: ['#1f2937', '#6b21a8', '#0ea5a4', '#b45309'],
        male: ['#374151', '#1e293b', '#0f172a', '#7c3aed']
    };
    const hairColor = hairColors[teacher.gender][(seed >> 8) % hairColors[teacher.gender].length];

    // Emotion-based expressions
    const getEyeExpression = (emotion: Teacher['emotion']) => {
        switch (emotion) {
            case 'happy': return { type: 'sparkle', openness: 0.9 };
            case 'passionate': return { type: 'intense', openness: 1.0 };
            case 'welcoming': return { type: 'warm', openness: 0.8 };
            case 'focused': return { type: 'determined', openness: 0.7 };
            case 'excited': return { type: 'wide', openness: 1.1 };
            default: return { type: 'normal', openness: 0.8 };
        }
    };

    const getMouthExpression = (emotion: Teacher['emotion']) => {
        switch (emotion) {
            case 'happy': return { type: 'smile', curve: 8 };
            case 'passionate': return { type: 'enthusiastic', curve: 10 };
            case 'welcoming': return { type: 'gentle-smile', curve: 6 };
            case 'focused': return { type: 'neutral', curve: 2 };
            case 'excited': return { type: 'big-smile', curve: 12 };
            default: return { type: 'neutral', curve: 3 };
        }
    };

    const eyeExpr = getEyeExpression(teacher.emotion);
    const mouthExpr = getMouthExpression(teacher.emotion);

    return (
        <AvatarContainer $size={size} $isActive={isActive}>
            <svg viewBox="0 0 120 120" width={size} height={size}>
                <defs>
                    <linearGradient id={`face-${teacher.id}`} x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor={faceColors[0]} />
                        <stop offset="100%" stopColor={faceColors[1]} />
                    </linearGradient>
                    <filter id={`glow-${teacher.id}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={isActive ? "#3b82f6" : "#000000"} floodOpacity={isActive ? "0.3" : "0.1"} />
                    </filter>
                </defs>

                {/* Face */}
                <g filter={`url(#glow-${teacher.id})`}>
                    <circle cx="60" cy="54" r="32" fill={`url(#face-${teacher.id})`} />
                </g>

                {/* Hair */}
                <g transform="translate(0, -4)">
                    <path
                        d="M28 42c4-16 24-20 44-16 6 1 12 6 16 14 2 5 1 10-2 14-6 6-36 16-58 2-3-2-4-10 0-14z"
                        fill={hairColor}
                        opacity="0.9"
                    />
                </g>

                {/* Eyes with emotion */}
                <g>
                    <g transform="translate(40,50)">
                        <ellipse cx="0" cy="0" rx="6" ry={5 * eyeExpr.openness} fill="#fff" />
                        {eyeExpr.type === 'sparkle' && (
                            <>
                                <circle cx="0" cy="0" r="2.5" fill="#111827" />
                                <circle cx="-1" cy="-1" r="0.8" fill="#ffffff" opacity="0.9" />
                                <circle cx="2" cy="1" r="0.3" fill="#ffffff" opacity="0.7" />
                            </>
                        )}
                        {eyeExpr.type === 'intense' && (
                            <ellipse cx="0" cy="0" rx="2.8" ry="3.5" fill="#0f172a" />
                        )}
                        {(eyeExpr.type === 'warm' || eyeExpr.type === 'normal') && (
                            <circle cx="0" cy="0" r="2.2" fill="#111827" />
                        )}
                        {eyeExpr.type === 'determined' && (
                            <>
                                <ellipse cx="0" cy="0.5" rx="2.4" ry="2.8" fill="#0f172a" />
                                <rect x="-8" y="-8" width="16" height="6" fill={`url(#face-${teacher.id})`} opacity="0.3" />
                            </>
                        )}
                        {eyeExpr.type === 'wide' && (
                            <>
                                <circle cx="0" cy="0" r="3.2" fill="#0f172a" />
                                <circle cx="-1.2" cy="-1.2" r="1" fill="#ffffff" opacity="0.9" />
                            </>
                        )}
                    </g>
                    <g transform="translate(80,50)">
                        <ellipse cx="0" cy="0" rx="6" ry={5 * eyeExpr.openness} fill="#fff" />
                        {eyeExpr.type === 'sparkle' && (
                            <>
                                <circle cx="0" cy="0" r="2.5" fill="#111827" />
                                <circle cx="-1" cy="-1" r="0.8" fill="#ffffff" opacity="0.9" />
                                <circle cx="2" cy="1" r="0.3" fill="#ffffff" opacity="0.7" />
                            </>
                        )}
                        {eyeExpr.type === 'intense' && (
                            <ellipse cx="0" cy="0" rx="2.8" ry="3.5" fill="#0f172a" />
                        )}
                        {(eyeExpr.type === 'warm' || eyeExpr.type === 'normal') && (
                            <circle cx="0" cy="0" r="2.2" fill="#111827" />
                        )}
                        {eyeExpr.type === 'determined' && (
                            <>
                                <ellipse cx="0" cy="0.5" rx="2.4" ry="2.8" fill="#0f172a" />
                                <rect x="-8" y="-8" width="16" height="6" fill={`url(#face-${teacher.id})`} opacity="0.3" />
                            </>
                        )}
                        {eyeExpr.type === 'wide' && (
                            <>
                                <circle cx="0" cy="0" r="3.2" fill="#0f172a" />
                                <circle cx="-1.2" cy="-1.2" r="1" fill="#ffffff" opacity="0.9" />
                            </>
                        )}
                    </g>
                </g>

                {/* Cheeks for happiness */}
                {(teacher.emotion === 'happy' || teacher.emotion === 'passionate' || teacher.emotion === 'excited') && (
                    <g>
                        <ellipse cx="42" cy="66" rx="5" ry="3" fill="#ffdede" opacity="0.7" />
                        <ellipse cx="78" cy="66" rx="5" ry="3" fill="#ffdede" opacity="0.7" />
                    </g>
                )}

                {/* Mouth with emotion */}
                <g transform="translate(60,78)">
                    {mouthExpr.type === 'smile' && (
                        <path d={`M-8 0 C -4 ${mouthExpr.curve}, 4 ${mouthExpr.curve}, 8 0`}
                            fill="transparent" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
                    )}
                    {mouthExpr.type === 'enthusiastic' && (
                        <>
                            <path d={`M-10 0 C -5 ${mouthExpr.curve}, 5 ${mouthExpr.curve}, 10 0 C 5 6, -5 6, -10 0`} fill="#111827" opacity="0.8" />
                            <ellipse cx="0" cy="2" rx="6" ry="2" fill="#fff" opacity="0.3" />
                        </>
                    )}
                    {mouthExpr.type === 'gentle-smile' && (
                        <path d={`M-6 0 C -3 ${mouthExpr.curve}, 3 ${mouthExpr.curve}, 6 0`}
                            fill="transparent" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
                    )}
                    {mouthExpr.type === 'neutral' && (
                        <ellipse cx="0" cy="0" rx="4" ry="2" fill="#111827" opacity="0.6" />
                    )}
                    {mouthExpr.type === 'big-smile' && (
                        <>
                            <path d={`M-12 0 C -6 ${mouthExpr.curve}, 6 ${mouthExpr.curve}, 12 0 C 6 8, -6 8, -12 0`} fill="#111827" opacity="0.9" />
                            <ellipse cx="0" cy="3" rx="8" ry="3" fill="#fff" opacity="0.4" />
                        </>
                    )}
                </g>

                {/* Gender indicator */}
                <GenderBadge cx="90" cy="30" r="8" fill={teacher.gender === 'female' ? '#ec4899' : '#3b82f6'} opacity="0.9" />
                <text x="90" y="35" fontSize="8" textAnchor="middle" fill="white" fontWeight="700">
                    {teacher.gender === 'female' ? '♀' : '♂'}
                </text>

                {/* Name label */}
                <g transform="translate(60,110)">
                    <rect x="-20" y="-8" width="40" height="16" rx="8" fill="rgba(255,255,255,0.9)" />
                    <text x="0" y="2" fontSize="10" textAnchor="middle" fill="#0f172a" fontWeight="700">
                        {teacher.name}
                    </text>
                </g>
            </svg>
        </AvatarContainer>
    );
});

/* ==========================
   MAIN COMPONENT
   ========================== */

export default function DualAvatarLanguagePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [toast, setToast] = useState<string | null>(null);

    const modelManager = ModelManager.getInstance();

    // Filter languages based on search
    const filteredLanguages = useMemo(() => {
        if (!searchQuery.trim()) return LANGUAGE_GROUPS;

        const query = searchQuery.toLowerCase();
        return LANGUAGE_GROUPS.filter(group =>
            group.language.toLowerCase().includes(query) ||
            group.nativeScript.toLowerCase().includes(query) ||
            group.combinedSpecialties.some(spec => spec.toLowerCase().includes(query)) ||
            group.teachers.some(teacher =>
                teacher.name.toLowerCase().includes(query) ||
                teacher.teachingStyle.toLowerCase().includes(query)
            )
        );
    }, [searchQuery]);

    // Load model handler
    const handleLoadModel = async () => {
        if (modelStatus === 'loading' || modelStatus === 'ready') return;

        setModelStatus('loading');
        try {
            await modelManager.loadModel((progress: number, text: string) => {
                setLoadingProgress(progress);
            });
            setModelStatus('ready');
            setToast('AI models loaded! All language teachers ready for conversation.');
        } catch (error) {
            setModelStatus('idle');
            setToast('Failed to load AI models. Please try again.');
        }
    };

    // Handle teacher selection
    const handleSelectTeacher = (teacher: Teacher, language: string) => {
        if (modelStatus !== 'ready') {
            setToast('Please load the AI models first!');
            return;
        }

        setSelectedTeacher(teacher);
        setSelectedLanguage(language);
    };

    // Toast auto-dismiss
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    const readyCount = LANGUAGE_GROUPS.filter(g => g.status === 'ready').length;
    const totalTeachers = LANGUAGE_GROUPS.reduce((sum, g) => sum + g.teachers.length, 0);

    return (
        <PageWrapper>
            {/* Hero Section */}
            <HeroSection>
                <HeroTitle>Choose Your Language Teacher</HeroTitle>
                <HeroSubtitle>
                    Learn with native-speaking AI tutors. Each language offers both male and female teachers
                    with unique personalities and teaching styles. Voice responses with authentic accents included!
                </HeroSubtitle>

                {/* Model Loading */}
                {modelStatus !== 'ready' ? (
                    <LoadModelButton onClick={handleLoadModel} disabled={modelStatus === 'loading'}>
                        <ButtonIcon $spinning={modelStatus === 'loading'}>
                            {modelStatus === 'idle' ? <Download size={20} /> : <Loader size={20} />}
                        </ButtonIcon>
                        {modelStatus === 'idle'
                            ? `Load AI Models (${readyCount} languages, ${totalTeachers} teachers)`
                            : `Loading... ${loadingProgress}%`
                        }
                    </LoadModelButton>
                ) : (
                    <ReadyIndicator>
                        <Check size={20} />
                        <div>
                            <strong>AI Ready!</strong> • {readyCount} languages • {totalTeachers} teachers • Voice enabled
                        </div>
                    </ReadyIndicator>
                )}

                {/* Search */}
                <SearchContainer>
                    <SearchIcon><Search size={20} /></SearchIcon>
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search languages, teaching styles, or teacher names..."
                    />
                </SearchContainer>
            </HeroSection>

            {/* Languages Grid */}
            <LanguagesSection>
                <SectionTitle>Available Language Teachers</SectionTitle>
                <LanguageGrid>
                    {filteredLanguages.map((languageGroup) => (
                        <LanguageCard key={languageGroup.language}>
                            <CardHeader>
                                <LanguageInfo>
                                    <LanguageFlag>{languageGroup.flag}</LanguageFlag>
                                    <div>
                                        <LanguageName>{languageGroup.language}</LanguageName>
                                        <NativeScript>{languageGroup.nativeScript}</NativeScript>
                                    </div>
                                </LanguageInfo>
                                <StatusBadge $status={languageGroup.status}>
                                    {languageGroup.status === 'ready' ? (
                                        <>
                                            <Check size={12} />
                                            Ready
                                        </>
                                    ) : (
                                        'In Development'
                                    )}
                                </StatusBadge>
                            </CardHeader>

                            <Description>{languageGroup.description}</Description>

                            {/* Dual Avatars */}
                            <TeachersContainer>
                                <TeachersTitle>Choose Your Teacher:</TeachersTitle>
                                <AvatarRow>
                                    {languageGroup.teachers.map((teacher) => (
                                        <TeacherOption
                                            key={teacher.id}
                                            onClick={() => handleSelectTeacher(teacher, languageGroup.language)}
                                            disabled={languageGroup.status !== 'ready' || modelStatus !== 'ready'}
                                        >
                                            <EmotionalAvatar teacher={teacher} size={80} />
                                            <TeacherInfo>
                                                <TeacherName>{teacher.name}</TeacherName>
                                                <TeachingStyle>{teacher.teachingStyle}</TeachingStyle>
                                                <SpecialtiesGrid>
                                                    {teacher.specialties.slice(0, 3).map(specialty => (
                                                        <SpecialtyPill key={specialty}>{specialty}</SpecialtyPill>
                                                    ))}
                                                </SpecialtiesGrid>
                                            </TeacherInfo>
                                            {languageGroup.status === 'ready' && modelStatus === 'ready' && (
                                                <StartButton>
                                                    <Volume2 size={16} />
                                                    Start Chat
                                                </StartButton>
                                            )}
                                        </TeacherOption>
                                    ))}
                                </AvatarRow>
                            </TeachersContainer>

                            {/* Combined Specialties */}
                            <CombinedSpecialties>
                                <strong>Combined expertise:</strong>
                                <SpecialtyTags>
                                    {languageGroup.combinedSpecialties.map(specialty => (
                                        <SpecialtyTag key={specialty}>{specialty}</SpecialtyTag>
                                    ))}
                                </SpecialtyTags>
                            </CombinedSpecialties>
                        </LanguageCard>
                    ))}
                </LanguageGrid>
            </LanguagesSection>

            {/* Active Chat */}
            {selectedTeacher && selectedLanguage && (
                <OptimizedChat
                    agent={{
                        id: selectedTeacher.id,
                        name: selectedTeacher.name,
                        role: `${selectedLanguage} Teacher`,
                        category: 'language',
                        status: 'ready',
                        systemPrompt: CHAT_AGENT_PERSONALITIES.get(selectedTeacher.name)?.greeting ?? 'Hello!'
                    }}
                    onClose={() => {
                        setSelectedTeacher(null);
                        setSelectedLanguage(null);
                    }}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast>
                    {toast}
                </Toast>
            )}
        </PageWrapper>
    );
}

/* ==========================
   STYLED COMPONENTS
   ========================== */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  font-family: Inter, system-ui, sans-serif;
`;

const HeroSection = styled.section`
  padding: 6rem 2rem 4rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(139,92,246,0.02) 100%);
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSubtitle = styled.p`
  color: #64748b;
  max-width: 800px;
  margin: 0 auto 3rem;
  font-size: 1.125rem;
  line-height: 1.6;
`;

const LoadModelButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

const ReadyIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.2);
  animation: ${fadeIn} 0.5s ease;
`;

const ButtonIcon = styled.div<{ $spinning?: boolean }>`
  display: flex;
  animation: ${({ $spinning }) => $spinning ? spin : 'none'} 2s linear infinite;
`;

const SearchContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  }
`;

const LanguagesSection = styled.section`
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 3rem;
  color: #0f172a;
`;

const LanguageGrid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
`;

const LanguageCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const LanguageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LanguageFlag = styled.div`
  font-size: 2.5rem;
`;

const LanguageName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
`;

const NativeScript = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
`;

const StatusBadge = styled.div<{ $status: 'ready' | 'inDev' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  
  ${({ $status }) => $status === 'ready' ? `
    background: #dcfce7;
    color: #166534;
  ` : `
    background: #fef3c7;
    color: #92400e;
  `}
`;

const Description = styled.p`
  color: #475569;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const TeachersContainer = styled.div`
  margin: 1.5rem 0;
`;

const TeachersTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin: 0 0 1rem;
`;

const AvatarRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const TeacherOption = styled.button`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AvatarContainer = styled.div<{ $size: number; $isActive?: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  margin: 0 auto 1rem;
  transition: transform 0.3s ease;
  
  ${({ $isActive }) => $isActive && `
    animation: ${pulse} 2s infinite;
  `}
`;

const GenderBadge = styled.circle`
  /* Styled in SVG context */
`;

const TeacherInfo = styled.div`
  text-align: center;
`;

const TeacherName = styled.h5`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #0f172a;
`;

const TeachingStyle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem;
  line-height: 1.4;
`;

const SpecialtiesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const SpecialtyPill = styled.span`
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StartButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const CombinedSpecialties = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #64748b;
`;

const SpecialtyTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SpecialtyTag = styled.span`
  background: #f1f5f9;
  color: #334155;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #0f172a;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 500;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease;
`;