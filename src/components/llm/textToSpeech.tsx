'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Play, Pause, Square, Volume2, VolumeX, Heart, Zap, AlertTriangle, Globe, SkipForward } from 'lucide-react';

/* ==========================
   CORE TYPES
   ========================== */

interface TTSConfig {
    voice?: string;
    rate: number;
    pitch: number;
    volume: number;
    lang: string;
    gender?: 'male' | 'female' | 'neutral';
}

interface SpeechSegment {
    text: string;
    language: string;
    emotion: EmotionType;
    priority: 'high' | 'normal' | 'low';
    pauseAfter: number;
    utterance?: SpeechSynthesisUtterance;
}

interface SpeechQueue {
    segments: SpeechSegment[];
    currentIndex: number;
    totalDuration: number;
    isReady: boolean;
}

type EmotionType = 'neutral' | 'happy' | 'excited' | 'calm' | 'serious' | 'encouraging' | 'welcoming';
type ContextType = 'greeting' | 'teaching' | 'correction' | 'encouragement' | 'explanation';

/* ==========================
   CENTRALIZED VOICE NAMES DATABASE
   ========================== */

// Centralized database - this is the single source of truth for voice gender detection
const VOICE_GENDER_DATABASE = {
    female: [
        // English
        'susan', 'samantha', 'victoria', 'karen', 'allison', 'ava', 'siri', 'alexa', 'cortana',
        // Arabic
        'hoda', 'zeina', 'layla', 'salma', 'aya', 'reem', 'fatima', 'aisha',
        // Spanish
        'monica', 'paloma', 'esperanza', 'carmen', 'isabella', 'sofia', 'lucia', 'elena',
        // French 
        'amelie', 'audrey', 'marie', 'celine', 'brigitte', 'claire', 'sophie', 'camille',
        // Chinese
        'ting-ting', 'sin-ji', 'hui-chen', 'ya-ling', 'mei', 'li', 'xin',
        // Italian
        'giulia', 'anna', 'francesca', 'valentina', 'chiara', 'elena'
    ],
    male: [
        // English
        'alex', 'daniel', 'tom', 'david', 'michael', 'james', 'robert', 'john',
        // Arabic
        'maged', 'omar', 'hassan', 'ahmed', 'youssef', 'khalid', 'mohammed', 'ali',
        // Spanish
        'diego', 'carlos', 'jorge', 'miguel', 'antonio', 'pablo', 'fernando', 'rafael',
        // French
        'henri', 'vincent', 'pierre', 'bernard', 'philippe', 'guillaume', 'antoine',
        // Chinese
        'kangkang', 'liang', 'feng', 'jun', 'ming', 'wei', 'chen', 'wang',
        // Italian
        'marco', 'giuseppe', 'giovanni', 'francesco', 'alessandro', 'matteo'
    ]
};

/* ==========================
   LANGUAGE DETECTION
   ========================== */

class LanguageDetector {
    private static readonly patterns = {
        arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|مرحبا|شكرا|أهلا|مع السلامة/,
        spanish: /[ñáéíóúü]|hola|gracias|por favor|muy bien|qué|cómo|dónde|español|soy|está/i,
        french: /[àâäéèêëïîôöùûüÿç]|bonjour|merci|s'il vous plaît|très bien|qu'est-ce|comment|français/i,
        chinese: /[\u4e00-\u9fff]|你好|谢谢|请|很好|什么|怎么|中文/,
        italian: /[àèéìíîòóù]|ciao|grazie|prego|molto bene|cosa|come|dove|italiano/i,
        german: /[äöüß]|hallo|danke|bitte|sehr gut|was|wie|wo|deutsch/i,
        portuguese: /[ãõáéíóúâêôç]|olá|obrigado|por favor|muito bem|português/i
    };

    static detect(text: string): string {
        if (this.patterns.arabic.test(text)) return 'ar-SA';

        for (const [lang, pattern] of Object.entries(this.patterns)) {
            if (pattern.test(text)) {
                switch (lang) {
                    case 'spanish': return 'es-ES';
                    case 'french': return 'fr-FR';
                    case 'chinese': return 'zh-CN';
                    case 'italian': return 'it-IT';
                    case 'german': return 'de-DE';
                    case 'portuguese': return 'pt-BR';
                }
            }
        }
        return 'en-US';
    }
}

/* ==========================
   PERFECTLY ALIGNED AGENT PROFILES
   ========================== */

export interface AgentProfile {
    id: string;
    name: string;
    primaryLanguage: string;
    baseConfig: TTSConfig;
    voiceKeywords: string[];  // These MUST align with VOICE_GENDER_DATABASE
    greetings: string[];
    speedMultiplier: number;
}

const AGENT_PROFILES: Record<string, AgentProfile> = {
    // ARABIC TEACHERS
    Lexi: {
        id: 'Lexi',
        name: 'Lexi',
        primaryLanguage: 'ar-SA',
        baseConfig: {
            lang: 'ar-SA',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        },
        // ALIGNED: Only female Arabic names from VOICE_GENDER_DATABASE.female
        voiceKeywords: ['arabic', 'hoda', 'zeina', 'layla', 'salma', 'aya', 'reem', 'fatima', 'aisha', 'female', 'woman'],
        greetings: [
            "مرحباً! I'm Lexi, your Arabic teacher.",
            "أهلاً وسهلاً! Ready to learn Arabic?",
            "مرحبا! Let's explore Arabic together!"
        ],
        speedMultiplier: 0.95
    },
    Adam: {
        id: 'Adam',
        name: 'Adam',
        primaryLanguage: 'ar-SA',
        baseConfig: {
            lang: 'ar-SA',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        },
        // ALIGNED: Only male Arabic names from VOICE_GENDER_DATABASE.male
        voiceKeywords: ['arabic', 'maged', 'omar', 'hassan', 'ahmed', 'youssef', 'khalid', 'mohammed', 'ali', 'male', 'man'],
        greetings: [
            "مرحباً! أنا آدم، مدرس العربية. I'm Adam, your Arabic teacher.",
            "أهلاً وسهلاً! Welcome to Arabic class!",
            "السلام عليكم! Let's learn Arabic together."
        ],
        speedMultiplier: 0.95
    },

    // SPANISH TEACHERS
    Kai: {
        id: 'Kai',
        name: 'Kai',
        primaryLanguage: 'es-ES',
        baseConfig: {
            lang: 'es-ES',
            rate: 1.0,
            pitch: 0.95,
            volume: 0.9,
            gender: 'male'
        },
        // ALIGNED: Only male Spanish names from VOICE_GENDER_DATABASE.male
        voiceKeywords: ['spanish', 'diego', 'carlos', 'jorge', 'miguel', 'antonio', 'pablo', 'fernando', 'rafael', 'male', 'español'],
        greetings: [
            "¡Hola! Soy Kai, tu profesor de español.",
            "¡Buenos días! I'm your Spanish teacher.",
            "¡Saludos! Let's practice español."
        ],
        speedMultiplier: 1.0
    },
    Lupita: {
        id: 'Lupita',
        name: 'Lupita',
        primaryLanguage: 'es-ES',
        baseConfig: {
            lang: 'es-ES',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        },
        // ALIGNED: Only female Spanish names from VOICE_GENDER_DATABASE.female
        voiceKeywords: ['spanish', 'monica', 'paloma', 'esperanza', 'carmen', 'isabella', 'sofia', 'lucia', 'elena', 'female', 'española'],
        greetings: [
            "¡Hola! Soy Lupita, tu profesora de español.",
            "¡Buenos días! I'm your Spanish teacher.",
            "¡Qué gusto conocerte! Let's learn español together."
        ],
        speedMultiplier: 1.0
    },

    // FRENCH TEACHERS
    Sana: {
        id: 'Sana',
        name: 'Sana',
        primaryLanguage: 'fr-FR',
        baseConfig: {
            lang: 'fr-FR',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.9,
            gender: 'female'
        },
        // ALIGNED: Only female French names from VOICE_GENDER_DATABASE.female
        voiceKeywords: ['french', 'amelie', 'audrey', 'marie', 'celine', 'brigitte', 'claire', 'sophie', 'camille', 'female', 'française'],
        greetings: [
            "Bonjour ! Je suis Sana, votre professeure de français.",
            "Salut! I'm your French teacher.",
            "Bonjour mes étudiants!"
        ],
        speedMultiplier: 1.0
    },
    Vinz: {
        id: 'Vinz',
        name: 'Vinz',
        primaryLanguage: 'fr-FR',
        baseConfig: {
            lang: 'fr-FR',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        },
        // ALIGNED: Only male French names from VOICE_GENDER_DATABASE.male
        voiceKeywords: ['french', 'henri', 'vincent', 'pierre', 'bernard', 'philippe', 'guillaume', 'antoine', 'male', 'français'],
        greetings: [
            "Bonjour ! Je suis Vinz, votre professeur de français.",
            "Salut! I'm your French teacher.",
            "Enchanté! Let's explore French together."
        ],
        speedMultiplier: 1.0
    },

    // CHINESE TEACHERS
    Mei: {
        id: 'Mei',
        name: 'Mei',
        primaryLanguage: 'zh-CN',
        baseConfig: {
            lang: 'zh-CN',
            rate: 0.9,
            pitch: 1.1,
            volume: 0.9,
            gender: 'female'
        },
        // ALIGNED: Only female Chinese names from VOICE_GENDER_DATABASE.female
        voiceKeywords: ['chinese', 'mandarin', 'ting-ting', 'sin-ji', 'hui-chen', 'ya-ling', 'mei', 'li', 'xin', 'female', '中文'],
        greetings: [
            "你好！我是美美，你的中文老师。",
            "你好! I'm Mei, your Mandarin teacher.",
            "欢迎！Welcome to Chinese class."
        ],
        speedMultiplier: 1.0
    },
    Wei: {
        id: 'Wei',
        name: 'Wei',
        primaryLanguage: 'zh-CN',
        baseConfig: {
            lang: 'zh-CN',
            rate: 0.9,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        },
        // ALIGNED: Only male Chinese names from VOICE_GENDER_DATABASE.male
        voiceKeywords: ['chinese', 'mandarin', 'kangkang', 'liang', 'feng', 'jun', 'ming', 'wei', 'chen', 'wang', 'male', '中文'],
        greetings: [
            "你好！我是伟，你的中文老师。I'm Wei, your Mandarin teacher.",
            "大家好! Hello everyone, let's learn Chinese!",
            "欢迎来到中文课！Welcome to Chinese class!"
        ],
        speedMultiplier: 1.0
    },

    // ITALIAN TEACHERS
    Giulia: {
        id: 'Giulia',
        name: 'Giulia',
        primaryLanguage: 'it-IT',
        baseConfig: {
            lang: 'it-IT',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        },
        // ALIGNED: Only female Italian names from VOICE_GENDER_DATABASE.female
        voiceKeywords: ['italian', 'giulia', 'anna', 'francesca', 'valentina', 'chiara', 'elena', 'female', 'italiana'],
        greetings: [
            "Ciao! Sono Giulia, la tua insegnante di italiano.",
            "Buongiorno! I'm your Italian teacher.",
            "Benvenuti! Welcome to Italian class!"
        ],
        speedMultiplier: 1.0
    },
    Marco: {
        id: 'Marco',
        name: 'Marco',
        primaryLanguage: 'it-IT',
        baseConfig: {
            lang: 'it-IT',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        },
        // ALIGNED: Only male Italian names from VOICE_GENDER_DATABASE.male
        voiceKeywords: ['italian', 'marco', 'giuseppe', 'giovanni', 'francesco', 'alessandro', 'matteo', 'male', 'italiano'],
        greetings: [
            "Ciao! Sono Marco, il vostro insegnante di italiano.",
            "Buongiorno! I'm your Italian teacher.",
            "Benvenuti alla classe di italiano!"
        ],
        speedMultiplier: 1.0
    }
};

/* ==========================
   EMOTION & CONTEXT PROCESSOR
   ========================== */

class EmotionProcessor {
    static analyzeEmotion(text: string): EmotionType {
        const lower = text.toLowerCase();

        if (lower.match(/hello|hi|مرحبا|hola|bonjour|你好|ciao/)) return 'welcoming';
        if (lower.match(/[!]{2,}|wow|amazing|fantastic|excellent/)) return 'excited';
        if (lower.match(/good job|well done|perfect|wonderful/)) return 'encouraging';
        if (lower.match(/:\)|😊|😄|happy|glad/)) return 'happy';
        if (lower.match(/important|remember|careful|attention/)) return 'serious';
        if (lower.match(/let's|here's how|step by step|explanation/)) return 'calm';

        return 'neutral';
    }

    static analyzeContext(text: string): ContextType {
        const lower = text.toLowerCase();

        if (lower.match(/hello|hi|hey|مرحبا|hola|bonjour|你好/)) return 'greeting';
        if (lower.match(/correct|wrong|mistake|error|better/)) return 'correction';
        if (lower.match(/good|great|excellent|perfect|well done/)) return 'encouragement';
        if (lower.match(/how|why|what|explain|because|meaning/)) return 'explanation';

        return 'teaching';
    }

    static applyEmotionalModifiers(baseConfig: TTSConfig, emotion: EmotionType): TTSConfig {
        const config = { ...baseConfig };

        switch (emotion) {
            case 'welcoming':
                config.rate *= 0.95;
                config.pitch *= 1.05;
                break;
            case 'excited':
                config.rate *= 1.15;
                config.pitch *= 1.1;
                break;
            case 'encouraging':
                config.rate *= 1.0;
                config.pitch *= 1.05;
                break;
            case 'happy':
                config.rate *= 1.05;
                config.pitch *= 1.08;
                break;
            case 'serious':
                config.rate *= 0.9;
                config.pitch *= 0.95;
                break;
            case 'calm':
                config.rate *= 0.95;
                config.pitch *= 1.0;
                break;
            default:
                break;
        }

        config.rate = Math.max(0.5, Math.min(2.0, config.rate));
        config.pitch = Math.max(0.5, Math.min(2.0, config.pitch));

        return config;
    }
}

/* ==========================
   SPEECH QUEUE PROCESSOR
   ========================== */

class SpeechQueueProcessor {
    static async createSpeechQueue(text: string, agentId?: string): Promise<SpeechQueue> {
        if (!text?.trim()) {
            return { segments: [], currentIndex: 0, totalDuration: 0, isReady: false };
        }

        const voiceManager = VoiceManager.getInstance();
        await voiceManager.initialize();

        const segments = this.splitIntoSegments(text, agentId);
        const profile = agentId ? AGENT_PROFILES[agentId] : null;

        // Select ONE voice for the entire agent response (voice consistency)
        const agentVoice = agentId
            ? voiceManager.findBestVoice(agentId, profile?.primaryLanguage)
            : null;

        console.log(`🎭 Voice consistency: Using ${agentVoice?.name || 'system default'} for all ${agentId || 'generic'} segments`);

        // Pre-create all utterances using the SAME voice for consistency
        for (const segment of segments) {
            const baseConfig = profile?.baseConfig || {
                lang: profile?.primaryLanguage || segment.language,
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8
            };

            const emotionalConfig = EmotionProcessor.applyEmotionalModifiers(baseConfig, segment.emotion);

            if (profile?.speedMultiplier) {
                emotionalConfig.rate *= profile.speedMultiplier;
            }

            const utterance = new SpeechSynthesisUtterance(segment.text);
            utterance.rate = emotionalConfig.rate;
            utterance.pitch = emotionalConfig.pitch;
            utterance.volume = emotionalConfig.volume;

            // Use consistent language and voice for agent identity
            if (agentId && profile) {
                // Agent responses: Use agent's primary language and voice consistently
                utterance.lang = profile.primaryLanguage;
                if (agentVoice) {
                    utterance.voice = agentVoice;
                }
                console.log(`🗣️  Agent segment: "${segment.text.slice(0, 30)}..." using ${agentVoice?.name || 'default'} (${profile.primaryLanguage})`);
            } else {
                // Non-agent responses: Use detected language
                utterance.lang = segment.language;
                const segmentVoice = voiceManager.findBestVoice('default', segment.language);
                if (segmentVoice) {
                    utterance.voice = segmentVoice;
                }
                console.log(`💬 User segment: "${segment.text.slice(0, 30)}..." using ${segmentVoice?.name || 'default'} (${segment.language})`);
            }

            segment.utterance = utterance;
        }

        const totalDuration = segments.reduce((total, segment) => {
            const estimatedDuration = (segment.text.length / 12) * 1000;
            return total + estimatedDuration + segment.pauseAfter;
        }, 0);

        console.log(`✅ Speech queue ready: ${segments.length} segments, ~${Math.round(totalDuration / 1000)}s, voice-consistent: ${!!agentId}`);

        return {
            segments,
            currentIndex: 0,
            totalDuration,
            isReady: true
        };
    }

    private static splitIntoSegments(text: string, agentId?: string): SpeechSegment[] {
        if (!text?.trim()) return [];

        const sentences = this.smartSentenceSplit(text);
        const segments: SpeechSegment[] = [];

        for (const sentence of sentences) {
            if (!sentence.trim()) continue;

            const language = LanguageDetector.detect(sentence);
            const emotion = EmotionProcessor.analyzeEmotion(sentence);
            const context = EmotionProcessor.analyzeContext(sentence);

            segments.push({
                text: sentence.trim(),
                language,
                emotion,
                priority: context === 'greeting' || context === 'correction' ? 'high' : 'normal',
                pauseAfter: this.calculatePause(sentence, emotion, context)
            });
        }

        return segments;
    }

    private static smartSentenceSplit(text: string): string[] {
        const protectedText = text
            .replace(/\b(?:Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|Inc|Corp|Ltd|Co|St|Ave|Blvd|No|Vol|Ch|pp|Fig|Ref|e\.g|i\.e|a\.m|p\.m|U\.S|U\.K|Ph\.D|B\.A|M\.A)\./gi, match =>
                match.replace('.', '__DOT__')
            );

        const sentences = protectedText
            .split(/(?<=[.!?。！？])\s+/)
            .map(sentence => sentence.replace(/__DOT__/g, '.').trim())
            .filter(Boolean);

        return sentences;
    }

    private static calculatePause(text: string, emotion: EmotionType, context: ContextType): number {
        let pause = 300;

        if (text.endsWith('.') || text.endsWith('。')) pause += 200;
        else if (text.endsWith('?') || text.endsWith('!')) pause += 150;
        else if (text.endsWith(',') || text.endsWith(';')) pause += 80;

        switch (context) {
            case 'greeting': pause *= 1.1; break;
            case 'correction': pause *= 1.2; break;
            case 'explanation': pause *= 1.0; break;
            case 'encouragement': pause *= 0.9; break;
        }

        switch (emotion) {
            case 'excited': pause *= 0.8; break;
            case 'serious': pause *= 1.1; break;
            case 'welcoming': pause *= 1.0; break;
            default: break;
        }

        return Math.max(150, Math.min(1000, pause));
    }
}

/* ==========================
   PERFECTLY ALIGNED VOICE MANAGER
   ========================== */

class VoiceManager {
    private static instance: VoiceManager;
    private voices: SpeechSynthesisVoice[] = [];
    private voiceCache = new Map<string, SpeechSynthesisVoice>();
    private ready = false;
    private initPromise: Promise<void> | null = null;

    static getInstance(): VoiceManager {
        if (!VoiceManager.instance) {
            VoiceManager.instance = new VoiceManager();
        }
        return VoiceManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.ready) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                if (this.voices.length > 0) {
                    this.ready = true;
                    console.log(`🎙️  TTS: Loaded ${this.voices.length} voices`);
                    this.logAvailableVoices();
                    resolve();
                } else {
                    setTimeout(loadVoices, 100);
                }
            };

            speechSynthesis.addEventListener('voiceschanged', loadVoices);
            loadVoices();
        });

        return this.initPromise;
    }

    private logAvailableVoices(): void {
        const voicesByLang = this.voices.reduce((acc, voice) => {
            const lang = voice.lang.split('-')[0];
            if (!acc[lang]) acc[lang] = [];
            acc[lang].push(voice.name);
            return acc;
        }, {} as Record<string, string[]>);

        console.log('🗣️  Available voices by language:', voicesByLang);
    }

    findBestVoice(agentId: string, targetLang?: string): SpeechSynthesisVoice | null {
        const cacheKey = `${agentId}-${targetLang || 'default'}`;
        const cached = this.voiceCache.get(cacheKey);
        if (cached && this.voices.includes(cached)) return cached;

        const profile = AGENT_PROFILES[agentId];
        if (!profile) {
            return this.findBestLanguageVoice(targetLang || 'en-US');
        }

        // If profile specifies an exact system voice name, honor it
        // (useful when you know a particular voice is correct)
        // Add `forcedVoice` to your AGENT_PROFILES entries to use this.
        // Example: forcedVoice: 'Microsoft Hoda - Arabic (Egypt)'
        // This is optional and won't break existing profiles.
        const forcedName = (profile as any).forcedVoice as string | undefined;
        if (forcedName) {
            const forced = this.voices.find(v => v.name === forcedName);
            if (forced) {
                console.log(`🔒 Forced voice for ${agentId}: ${forced.name}`);
                this.voiceCache.set(cacheKey, forced);
                return forced;
            } else {
                console.warn(`⚠️ Forced voice "${forcedName}" for ${agentId} not found on this system.`);
            }
        }

        const searchLang = profile.primaryLanguage;
        const langCode = searchLang.split('-')[0];
        const targetGender = profile.baseConfig.gender;

        console.log(`🎭 Finding ${targetGender} voice for ${agentId} (${searchLang})`);

        // Primary candidates: voices that match the desired language code
        let candidates = this.voices.filter(voice =>
            voice.lang && voice.lang.toLowerCase().includes(langCode.toLowerCase())
        );

        // Special handling for limited language availability (Arabic/Chinese)
        if (candidates.length === 0 && (langCode === 'ar' || langCode === 'zh')) {
            candidates = this.voices.filter(voice =>
                (voice.lang && voice.lang.toLowerCase().includes(langCode)) ||
                voice.name.toLowerCase().includes(langCode === 'ar' ? 'arab' : 'chin') ||
                profile.voiceKeywords.some(keyword =>
                    voice.name.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            console.log(`🔍 ${langCode.toUpperCase()} voice search: Found ${candidates.length} candidates`);
        }

        // If still none, try fallback to voices that include the profile's primary language exactly
        if (candidates.length === 0) {
            candidates = this.voices.filter(voice =>
                voice.lang && voice.lang.toLowerCase() === searchLang.toLowerCase()
            );
        }

        // If still none, broaden to voices that start with the lang code
        if (candidates.length === 0) {
            candidates = this.voices.filter(voice =>
                voice.lang && voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
            );
        }

        // Final fallback cascades
        if (candidates.length === 0) {
            candidates = this.voices.filter(voice =>
                voice.lang && voice.lang.toLowerCase().includes('en')
            );
        }
        if (candidates.length === 0) {
            candidates = this.voices;
        }

        // --- NEW: Filter by gender preference first --- //
        const genderMatched = candidates.filter(v => this.detectGender(v.name) === targetGender);
        const neutralMatched = candidates.filter(v => this.detectGender(v.name) === 'neutral');

        let prioritizedCandidates: SpeechSynthesisVoice[] = [];
        if (genderMatched.length > 0) {
            prioritizedCandidates = genderMatched;
            console.log(`✅ Found ${genderMatched.length} ${targetGender} voice(s) for ${agentId}, restricting selection to those.`);
        } else if (neutralMatched.length > 0) {
            prioritizedCandidates = neutralMatched;
            console.log(`⚠️ No explicit ${targetGender} voices; using ${neutralMatched.length} neutral voice(s) as fallback for ${agentId}.`);
        } else {
            // as last resort, use original candidates (may include opposite gender)
            prioritizedCandidates = candidates;
            console.log(`⚠️ No ${targetGender} or neutral voices found; allowing all candidates for ${agentId}.`);
        }

        // Scoring inside the prioritized pool (so keywords can't overcome gender)
        let bestVoice: SpeechSynthesisVoice | null = null;
        let bestScore = -Infinity;

        for (const voice of prioritizedCandidates) {
            let score = 0;

            // language match (still high priority)
            if (voice.lang && voice.lang.toLowerCase() === searchLang.toLowerCase()) score += 150;
            else if (voice.lang && voice.lang.toLowerCase().startsWith(langCode.toLowerCase())) score += 100;

            const voiceName = voice.name.toLowerCase();

            // Keyword matching (good but lower weight now that gender is enforced)
            for (const keyword of profile.voiceKeywords) {
                if (voiceName.includes(keyword.toLowerCase())) {
                    score += 50;
                    // only log first found keyword match to reduce noise
                    console.log(`✨ Keyword match: ${voice.name} contains "${keyword}" for ${agentId}`);
                    break;
                }
            }

            // Gender scoring (stronger impact but we already filtered by gender above)
            const detectedGender = this.detectGender(voice.name);
            if (targetGender && detectedGender === targetGender) {
                score += 100;
            } else if (detectedGender === 'neutral') {
                score += 20;
            } else if (targetGender && detectedGender !== targetGender) {
                score -= 100;
            }

            // Quality indicators
            if (voice.localService) score += 20;
            if (voiceName.includes('enhanced') || voiceName.includes('premium') || voiceName.includes('neural')) score += 15;

            // small tie-breaker: prefer voices with longer names (heuristic — tends to pick vendor-labeled voices)
            score += Math.min(5, voiceName.length / 20);

            if (score > bestScore) {
                bestScore = score;
                bestVoice = voice;
            }
        }

        if (bestVoice) {
            this.voiceCache.set(cacheKey, bestVoice);
            const gender = this.detectGender(bestVoice.name);
            console.log(`🎯 Selected voice for ${agentId}: ${bestVoice.name} (${gender}, score: ${bestScore}, lang: ${bestVoice.lang})`);
        } else {
            console.warn(`❌ No suitable voice found for ${agentId} (${searchLang}, ${targetGender})`);
        }

        return bestVoice;
    }

    // ALIGNED: Gender detection using the centralized database
    private detectGender(voiceName: string): 'male' | 'female' | 'neutral' {
        const lower = voiceName.toLowerCase();

        // Explicit gender indicators
        if (lower.includes('female') || lower.includes('woman') || lower.includes('lady')) return 'female';
        if (lower.includes('male') || lower.includes('man') || lower.includes('guy')) return 'male';

        // ALIGNED: Use the centralized database for perfect alignment
        if (VOICE_GENDER_DATABASE.female.some(name => lower.includes(name))) return 'female';
        if (VOICE_GENDER_DATABASE.male.some(name => lower.includes(name))) return 'male';

        return 'neutral';
    }

    private findBestLanguageVoice(targetLang: string): SpeechSynthesisVoice | null {
        const langCode = targetLang.split('-')[0];
        const candidates = this.voices.filter(voice =>
            voice.lang.toLowerCase().includes(langCode.toLowerCase())
        );
        return candidates[0] || this.voices[0] || null;
    }
}


/* ==========================
   MAIN TTS COMPONENT
   ========================== */

interface TTSProps {
    text: string;
    agentId?: string;
    autoPlay?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onProgress?: (segment: SpeechSegment, index: number, total: number) => void;
}

const OptimizedTextToSpeech: React.FC<TTSProps> = ({
    text,
    agentId,
    autoPlay = false,
    onStart,
    onEnd,
    onError,
    onProgress
}) => {
    const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSegment, setCurrentSegment] = useState<SpeechSegment | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [speechQueue, setSpeechQueue] = useState<SpeechQueue | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Pre-process speech when text changes
    useEffect(() => {
        if (!text?.trim() || !isSupported) {
            setSpeechQueue(null);
            return;
        }

        let mounted = true;
        setIsLoading(true);

        const processSpeech = async () => {
            try {
                const queue = await SpeechQueueProcessor.createSpeechQueue(text, agentId);
                if (mounted) {
                    setSpeechQueue(queue);
                    setIsLoading(false);
                    console.log(`Pre-processed ${queue.segments.length} speech segments`);
                }
            } catch (error) {
                console.error('Failed to pre-process speech:', error);
                if (mounted) {
                    setIsLoading(false);
                    onError?.('Failed to prepare speech');
                }
            }
        };

        processSpeech();

        return () => {
            mounted = false;
        };
    }, [text, agentId, isSupported, onError]);

    const speak = useCallback(async () => {
        if (!isSupported || !speechQueue?.isReady || speechQueue.segments.length === 0) {
            onError?.('Speech not ready or no content available');
            return;
        }

        // Cancel any current speech
        speechSynthesis.cancel();
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        setIsSpeaking(true);
        setIsPaused(false);
        setProgress({ current: 0, total: speechQueue.segments.length });
        onStart?.();

        try {
            for (let i = 0; i < speechQueue.segments.length && !signal.aborted; i++) {
                const segment = speechQueue.segments[i];
                setCurrentSegment(segment);
                setProgress({ current: i + 1, total: speechQueue.segments.length });
                onProgress?.(segment, i + 1, speechQueue.segments.length);

                if (!segment.utterance) {
                    console.warn('Segment missing pre-created utterance, skipping');
                    continue;
                }

                // Play the pre-created utterance
                await new Promise<void>((resolve) => {
                    if (signal.aborted) {
                        resolve();
                        return;
                    }

                    let resolved = false;
                    const cleanup = () => {
                        if (!resolved) {
                            resolved = true;
                            signal.removeEventListener('abort', handleAbort);
                            resolve();
                        }
                    };

                    const handleAbort = cleanup;

                    segment.utterance!.onend = cleanup;
                    segment.utterance!.onerror = (event) => {
                        console.warn('TTS error:', event.error);
                        cleanup();
                    };

                    signal.addEventListener('abort', handleAbort);
                    speechSynthesis.speak(segment.utterance!);
                });

                // Pause between segments
                if (i < speechQueue.segments.length - 1 && !signal.aborted) {
                    await new Promise<void>((resolve) => {
                        timeoutRef.current = setTimeout(() => {
                            timeoutRef.current = null;
                            resolve();
                        }, segment.pauseAfter);

                        if (signal.aborted) {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            resolve();
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Speech synthesis error:', error);
            onError?.(`Speech failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentSegment(null);
            setProgress({ current: 0, total: 0 });

            if (!signal.aborted) {
                onEnd?.();
            }
        }
    }, [speechQueue, isSupported, onStart, onEnd, onError, onProgress]);

    const pause = useCallback(() => {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

    const stop = useCallback(() => {
        speechSynthesis.cancel();
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSegment(null);
        setProgress({ current: 0, total: 0 });
    }, []);

    useEffect(() => {
        if (autoPlay && speechQueue?.isReady && !isSpeaking && !isLoading) {
            const timer = setTimeout(speak, 200);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, speechQueue?.isReady, isSpeaking, isLoading, speak]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!isSupported) {
        return (
            <TTSContainer role="region" aria-label="Text-to-speech not supported">
                <VolumeX size={16} aria-hidden="true" />
                <StatusText>Speech not supported</StatusText>
            </TTSContainer>
        );
    }

    const getEmotionIcon = (emotion: EmotionType) => {
        switch (emotion) {
            case 'excited': return <Zap size={12} aria-hidden="true" />;
            case 'happy': return <Heart size={12} aria-hidden="true" />;
            case 'serious': return <AlertTriangle size={12} aria-hidden="true" />;
            case 'welcoming': return <Globe size={12} aria-hidden="true" />;
            default: return null;
        }
    };

    const isReady = speechQueue?.isReady && !isLoading;

    return (
        <TTSContainer role="region" aria-label="Text-to-speech controls">
            <ControlButton
                onClick={isSpeaking ? (isPaused ? resume : pause) : speak}
                $isActive={isSpeaking}
                disabled={!isReady}
                title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
                aria-label={isSpeaking ? (isPaused ? 'Resume speech' : 'Pause speech') : 'Play speech'}
            >
                {isSpeaking && !isPaused ? <Pause size={14} /> : <Play size={14} />}
            </ControlButton>

            {isSpeaking && (
                <ControlButton
                    onClick={stop}
                    $variant="secondary"
                    title="Stop"
                    aria-label="Stop speech"
                >
                    <Square size={14} />
                </ControlButton>
            )}

            {currentSegment && (
                <EmotionIndicator
                    $emotion={currentSegment.emotion}
                    aria-label={`Speaking in ${currentSegment.language} with ${currentSegment.emotion} emotion`}
                >
                    {getEmotionIcon(currentSegment.emotion)}
                    <span>
                        {currentSegment.language.split('-')[0].toUpperCase()} - {currentSegment.emotion}
                    </span>
                </EmotionIndicator>
            )}

            <StatusText role="status">
                {isLoading
                    ? 'Preparing...'
                    : isSpeaking
                        ? (isPaused ? 'Paused' : `${progress.current}/${progress.total}`)
                        : agentId
                            ? `${agentId} ready`
                            : isReady
                                ? 'Ready'
                                : 'Loading...'
                }
            </StatusText>
        </TTSContainer>
    );
};

/* ==========================
   STYLED COMPONENTS
   ========================== */

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const TTSContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  font-size: 0.875rem;
`;

const ControlButton = styled.button<{ $isActive?: boolean; $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${({ $isActive, $variant }) => {
        if ($isActive) return 'linear-gradient(135deg, #3b82f6, #7c3aed)';
        if ($variant === 'secondary') return 'rgba(107, 114, 128, 0.1)';
        return 'rgba(59, 130, 246, 0.1)';
    }};

  color: ${({ $isActive, $variant }) => {
        if ($isActive) return 'white';
        if ($variant === 'secondary') return '#6b7280';
        return '#3b82f6';
    }};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  ${({ $isActive }) =>
        $isActive &&
        css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const EmotionIndicator = styled.div<{ $emotion: EmotionType }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: ${({ $emotion }) => {
        const colors = {
            excited: '#f59e0b',
            happy: '#10b981',
            serious: '#ef4444',
            encouraging: '#8b5cf6',
            welcoming: '#06b6d4',
            calm: '#14b8a6',
            neutral: '#6b7280'
        };
        return colors[$emotion];
    }};
  background: ${({ $emotion }) => {
        const backgrounds = {
            excited: 'rgba(245, 158, 11, 0.1)',
            happy: 'rgba(16, 185, 129, 0.1)',
            serious: 'rgba(239, 68, 68, 0.1)',
            encouraging: 'rgba(139, 92, 246, 0.1)',
            welcoming: 'rgba(6, 182, 212, 0.1)',
            calm: 'rgba(20, 184, 166, 0.1)',
            neutral: 'rgba(107, 114, 128, 0.1)'
        };
        return backgrounds[$emotion];
    }};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid currentColor;
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
  font-weight: 500;
`;

export default OptimizedTextToSpeech;
export { AGENT_PROFILES, VoiceManager, LanguageDetector, EmotionProcessor };