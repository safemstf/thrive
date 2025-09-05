// src\components\llm\textToSpeech.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Play, Pause, Square, Volume2, VolumeX, Settings, Heart, Zap, AlertTriangle, Globe } from 'lucide-react';

/* ==========================
   ENHANCED TYPE SYSTEM
   ========================== */

interface TTSOptions {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
    gender?: 'male' | 'female' | 'neutral';
    emotion?: 'neutral' | 'happy' | 'excited' | 'calm' | 'serious' | 'encouraging' | 'welcoming';
}

interface ConversationTrack {
    agentId: string;
    language: string;
    context: 'greeting' | 'teaching' | 'correction' | 'encouragement' | 'explanation';
    emotionalState: TTSOptions['emotion'];
    lastInteraction: Date;
}

interface SpeechSegment {
    text: string;
    language: string;
    emotion: TTSOptions['emotion'];
    priority: 'high' | 'normal' | 'low';
    pauseAfter: number;
    rateModifier: number;
}

/* ==========================
   ENHANCED AGENT PROFILES WITH TRACKS
   ========================== */

class AgentProfile {
    public readonly id: string;
    public readonly name: string;
    public readonly nativeLanguage: string;
    public readonly voiceConfig: TTSOptions;
    public readonly personality: string;
    public readonly voicePreferences: string[];
    public readonly greetingPatterns: string[];
    public readonly speechPatterns: {
        [key: string]: {
            rate: number;
            pitch: number;
            pauseMultiplier: number;
        };
    };

    constructor(config: {
        id: string;
        name: string;
        nativeLanguage: string;
        voiceConfig: TTSOptions;
        personality: string;
        voicePreferences: string[];
        greetingPatterns: string[];
        speechPatterns: {
            [key: string]: {
                rate: number;
                pitch: number;
                pauseMultiplier: number;
            };
        };
    }) {
        this.id = config.id;
        this.name = config.name;
        this.nativeLanguage = config.nativeLanguage;
        this.voiceConfig = config.voiceConfig;
        this.personality = config.personality;
        this.voicePreferences = config.voicePreferences;
        this.greetingPatterns = config.greetingPatterns;
        this.speechPatterns = config.speechPatterns;
    }

    getSpeechSettings(context: ConversationTrack['context'], emotion: TTSOptions['emotion']): TTSOptions {
        const baseSettings = { ...this.voiceConfig };
        const contextSettings = this.speechPatterns[context] || this.speechPatterns.default;

        // Apply context-specific modifications
        baseSettings.rate = (baseSettings.rate || 1) * contextSettings.rate;
        baseSettings.pitch = (baseSettings.pitch || 1) * contextSettings.pitch;

        // Apply emotional modifications
        return EmotionalSpeechProcessor.applyEmotionalSettings(emotion, baseSettings);
    }

    getRandomGreeting(): string {
        return this.greetingPatterns[Math.floor(Math.random() * this.greetingPatterns.length)];
    }
}

/* ==========================
   AGENT PROFILES REGISTRY
   ========================== */

const ENHANCED_AGENT_PROFILES = new Map<string, AgentProfile>([
    ['Lexi', new AgentProfile({
        id: 'Lexi',
        name: 'Lexi',
        nativeLanguage: 'ar-SA', // Arabic (Saudi) as native
        voiceConfig: {
            lang: 'ar-SA',
            rate: 0.95,
            pitch: 1.05,
            gender: 'female',
            emotion: 'encouraging'
        },
        personality: 'friendly and supportive Arabic tutor',
        voicePreferences: ['female', 'woman', 'Hoda', 'Zeina'], // Arabic voices if available
        greetingPatterns: [
            "مرحبا! أنا Lexi، معلمتك للغة العربية. Let's start learning Arabic together!",
            "أهلاً! Ready to practice Arabic today?",
            "Hi! I'm excited to help you improve your Arabic skills."
        ],
        speechPatterns: {
            greeting: { rate: 0.9, pitch: 1.15, pauseMultiplier: 1.3 },
            teaching: { rate: 0.95, pitch: 1.05, pauseMultiplier: 1.1 },
            correction: { rate: 0.85, pitch: 0.95, pauseMultiplier: 1.4 },
            encouragement: { rate: 1.0, pitch: 1.2, pauseMultiplier: 0.8 },
            explanation: { rate: 0.9, pitch: 1.0, pauseMultiplier: 1.2 },
            default: { rate: 1.0, pitch: 1.0, pauseMultiplier: 1.0 }
        }
    })],

    ['Kai', new AgentProfile({
        id: 'Kai',
        name: 'Kai',
        nativeLanguage: 'es-ES',
        voiceConfig: {
            lang: 'es-ES',
            rate: 0.85,
            pitch: 0.9,
            gender: 'male',
            emotion: 'calm'
        },
        personality: 'patient Spanish pronunciation specialist',
        voicePreferences: ['Diego', 'Carlos', 'Jorge', 'Antonio', 'male', 'man', 'español', 'masculino'],
        greetingPatterns: [
            "¡Hola! Soy Kai, tu profesor de español. Hello! I'm Kai, your Spanish teacher.",
            "¡Buenos días! Ready to practice español?",
            "¡Saludos! Let's work on your Spanish pronunciation."
        ],
        speechPatterns: {
            greeting: { rate: 0.8, pitch: 0.95, pauseMultiplier: 1.4 },
            teaching: { rate: 0.85, pitch: 0.9, pauseMultiplier: 1.2 },
            correction: { rate: 0.75, pitch: 0.85, pauseMultiplier: 1.6 },
            encouragement: { rate: 0.9, pitch: 1.0, pauseMultiplier: 1.0 },
            explanation: { rate: 0.8, pitch: 0.9, pauseMultiplier: 1.3 },
            default: { rate: 0.85, pitch: 0.9, pauseMultiplier: 1.0 }
        }
    })],

    ['Sana', new AgentProfile({
        id: 'Sana',
        name: 'Sana',
        nativeLanguage: 'fr-FR',
        voiceConfig: {
            lang: 'fr-FR',
            rate: 0.88,
            pitch: 1.05,
            gender: 'female',
            emotion: 'serious'
        },
        personality: 'systematic French grammar expert',
        voicePreferences: ['Amelie', 'Audrey', 'Marie', 'French', 'female', 'femme', 'française'],
        greetingPatterns: [
            "Bonjour ! Je suis Sana, votre professeure de français. Hello! I'm Sana, your French teacher.",
            "Salut! Ready to learn français today?",
            "Bonjour mes étudiants! Let's practice French together."
        ],
        speechPatterns: {
            greeting: { rate: 0.85, pitch: 1.1, pauseMultiplier: 1.4 },
            teaching: { rate: 0.88, pitch: 1.05, pauseMultiplier: 1.2 },
            correction: { rate: 0.8, pitch: 0.95, pauseMultiplier: 1.5 },
            encouragement: { rate: 0.9, pitch: 1.15, pauseMultiplier: 1.0 },
            explanation: { rate: 0.85, pitch: 1.0, pauseMultiplier: 1.3 },
            default: { rate: 0.88, pitch: 1.05, pauseMultiplier: 1.0 }
        }
    })],

    ['Mei', new AgentProfile({
        id: 'Mei',
        name: 'Mei',
        nativeLanguage: 'zh-CN',
        voiceConfig: {
            lang: 'zh-CN',
            rate: 0.75,
            pitch: 1.15,
            gender: 'female',
            emotion: 'encouraging'
        },
        personality: 'patient Mandarin tone specialist',
        voicePreferences: ['Ting-Ting', 'Li-Mu', 'Sin-Ji', 'Chinese', 'female', '中文', 'Kyoko', 'Yuna'],
        greetingPatterns: [
            "你好！我是美美，你的中文老师。Hello! I'm Mei, your Mandarin teacher.",
            "你好! Ready to practice 中文?",
            "欢迎！Let's work on your Mandarin tones today."
        ],
        speechPatterns: {
            greeting: { rate: 0.7, pitch: 1.2, pauseMultiplier: 1.5 },
            teaching: { rate: 0.75, pitch: 1.15, pauseMultiplier: 1.3 },
            correction: { rate: 0.65, pitch: 1.1, pauseMultiplier: 1.8 },
            encouragement: { rate: 0.8, pitch: 1.25, pauseMultiplier: 1.0 },
            explanation: { rate: 0.7, pitch: 1.1, pauseMultiplier: 1.4 },
            default: { rate: 0.75, pitch: 1.15, pauseMultiplier: 1.0 }
        }
    })]
]);

/* ==========================
   CONVERSATION TRACKING SYSTEM
   ========================== */

class ConversationTracker {
    private static instance: ConversationTracker;
    private tracks = new Map<string, ConversationTrack>();

    static getInstance(): ConversationTracker {
        if (!ConversationTracker.instance) {
            ConversationTracker.instance = new ConversationTracker();
        }
        return ConversationTracker.instance;
    }

    updateTrack(agentId: string, context: ConversationTrack['context'], emotion: TTSOptions['emotion']): void {
        const profile = ENHANCED_AGENT_PROFILES.get(agentId);
        if (!profile) return;

        this.tracks.set(agentId, {
            agentId,
            language: profile.nativeLanguage,
            context,
            emotionalState: emotion,
            lastInteraction: new Date()
        });
    }

    getTrack(agentId: string): ConversationTrack | null {
        return this.tracks.get(agentId) || null;
    }

    analyzeContext(text: string): ConversationTrack['context'] {
        const lower = text.toLowerCase();

        if (lower.match(/hello|hi|bonjour|hola|你好|salut/i)) return 'greeting';
        if (lower.match(/correct|wrong|mistake|error|better/i)) return 'correction';
        if (lower.match(/good|great|excellent|perfect|well done/i)) return 'encouragement';
        if (lower.match(/how|why|what|explain|because|meaning/i)) return 'explanation';

        return 'teaching';
    }
}

/* ==========================
   EMOTIONAL SPEECH PROCESSOR
   ========================== */

class EmotionalSpeechProcessor {
    static analyzeTextEmotion(text: string, agentId?: string): TTSOptions['emotion'] {
        const lower = text.toLowerCase();
        const track = agentId ? ConversationTracker.getInstance().getTrack(agentId) : null;

        // Greeting detection
        if (lower.match(/hello|hi|bonjour|hola|你好|welcome|salut/i)) {
            return 'welcoming';
        }

        // Excitement indicators
        if (lower.match(/[!]{2,}|wow|amazing|fantastic|excellent|awesome|incredible/)) {
            return 'excited';
        }

        // Encouragement indicators
        if (lower.match(/good job|well done|perfect|nice|wonderful|keep going|try again/)) {
            return 'encouraging';
        }

        // Happy indicators
        if (lower.match(/:\)|😊|😄|smile|happy|glad|pleased/)) {
            return 'happy';
        }

        // Serious/Important indicators
        if (lower.match(/important|remember|careful|attention|focus|note that/)) {
            return 'serious';
        }

        // Calm/Teaching indicators
        if (lower.match(/let's|here's how|step by step|first|next|explanation/)) {
            return 'calm';
        }

        // Use track context for default
        return track?.emotionalState || 'neutral';
    }

    static applyEmotionalSettings(emotion: TTSOptions['emotion'], baseSettings: TTSOptions): TTSOptions {
        const emotional = { ...baseSettings };

        switch (emotion) {
            case 'welcoming':
                emotional.rate = (baseSettings.rate || 1) * 0.9;
                emotional.pitch = (baseSettings.pitch || 1) * 1.1;
                break;
            case 'excited':
                emotional.rate = (baseSettings.rate || 1) * 1.2;
                emotional.pitch = (baseSettings.pitch || 1) * 1.15;
                break;
            case 'encouraging':
                emotional.rate = (baseSettings.rate || 1) * 0.95;
                emotional.pitch = (baseSettings.pitch || 1) * 1.08;
                break;
            case 'happy':
                emotional.rate = (baseSettings.rate || 1) * 1.05;
                emotional.pitch = (baseSettings.pitch || 1) * 1.1;
                break;
            case 'serious':
                emotional.rate = (baseSettings.rate || 1) * 0.85;
                emotional.pitch = (baseSettings.pitch || 1) * 0.92;
                break;
            case 'calm':
                emotional.rate = (baseSettings.rate || 1) * 0.88;
                emotional.pitch = baseSettings.pitch || 1;
                break;
            default: // neutral
                break;
        }

        // Ensure reasonable bounds
        emotional.rate = Math.max(0.5, Math.min(2.0, emotional.rate || 1));
        emotional.pitch = Math.max(0.5, Math.min(2.0, emotional.pitch || 1));

        return emotional;
    }
}

/* ==========================
   ADVANCED TEXT CHUNKING WITH LANGUAGE DETECTION
   ========================== */

class IntelligentTextProcessor {
    private static languagePatterns = {
        spanish: /\b(hola|gracias|por favor|muy bien|qué|cómo|dónde|cuándo|español|soy|es|son|está|están)\b/i,
        french: /\b(bonjour|merci|s'il vous plaît|très bien|qu'est-ce que|comment|où|quand|français|je suis|il est|ils sont)\b/i,
        chinese: /[\u4e00-\u9fff]|你好|谢谢|请|很好|什么|怎么|哪里|什么时候|中文|我是/,
        english: /\b(hello|thank you|please|very good|what|how|where|when|english|i am|he is|they are)\b/i
    };

    static detectLanguage(text: string): string {
        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) {
                return 'ar-SA';
            }
            
        for (const [lang, pattern] of Object.entries(this.languagePatterns)) {
            if (pattern.test(text)) {
                switch (lang) {
                    case 'spanish': return 'es-ES';
                    case 'french': return 'fr-FR';
                    case 'chinese': return 'zh-CN';
                    default: return 'en-US';
                }
            }
        }
        return 'en-US';
    }

    static splitIntoIntelligentSegments(text: string, agentId?: string): SpeechSegment[] {
        if (!text?.trim()) return [];

        // Protect abbreviations
        const abbreviations = /\b(?:Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|Inc|Corp|Ltd|Co|St|Ave|Blvd|Rd|Mt|Ft|No|Vol|Ch|pp|Fig|Ref|e\.g|i\.e|a\.m|p\.m|U\.S|U\.K|Ph\.D|B\.A|M\.A)\./gi;
        const placeholders = new Map<string, string>();
        let placeholderCount = 0;

        const protectedText = text.replace(abbreviations, (match) => {
            const placeholder = `__ABBREV_${placeholderCount++}__`;
            placeholders.set(placeholder, match);
            return placeholder;
        });

        // Enhanced sentence splitting with language awareness
        const sentences = protectedText
            .split(/(?<=[.!?])\s+|(?<=[。！？])\s*/)
            .map(sentence => {
                // Restore abbreviations
                let restored = sentence;
                placeholders.forEach((original, placeholder) => {
                    restored = restored.replace(placeholder, original);
                });
                return restored.trim();
            })
            .filter(Boolean);

        const segments: SpeechSegment[] = [];
        const tracker = ConversationTracker.getInstance();

        for (const sentence of sentences) {
            const detectedLang = this.detectLanguage(sentence);
            const emotion = EmotionalSpeechProcessor.analyzeTextEmotion(sentence, agentId);
            const context = tracker.analyzeContext(sentence);

            // Update conversation track
            if (agentId) {
                tracker.updateTrack(agentId, context, emotion);
            }

            // Determine priority based on content
            let priority: SpeechSegment['priority'] = 'normal';
            if (context === 'greeting' || emotion === 'welcoming') priority = 'high';
            if (context === 'correction' || emotion === 'serious') priority = 'high';

            // Calculate optimal rate modifier
            const wordCount = sentence.split(/\s+/).length;
            const avgWordLength = sentence.length / wordCount;
            let rateModifier = 1.0;

            if (avgWordLength > 6) rateModifier *= 0.92; // Slower for complex words
            if (detectedLang !== 'en-US') rateModifier *= 0.88; // Slower for non-English
            if (priority === 'high') rateModifier *= 0.9; // Slower for important content

            // Split very long sentences
            if (sentence.length > 200) {
                const subChunks = sentence.split(/(?<=[,;:])\s+/).filter(Boolean);
                for (const subChunk of subChunks) {
                    segments.push({
                        text: subChunk,
                        language: detectedLang,
                        emotion,
                        priority,
                        pauseAfter: this.calculatePauseDuration(subChunk, emotion, context),
                        rateModifier
                    });
                }
            } else {
                segments.push({
                    text: sentence,
                    language: detectedLang,
                    emotion,
                    priority,
                    pauseAfter: this.calculatePauseDuration(sentence, emotion, context),
                    rateModifier
                });
            }
        }

        return segments;
    }

    static calculatePauseDuration(text: string, emotion: TTSOptions['emotion'], context: ConversationTrack['context']): number {
        let delay = 250; // Base delay

        // Punctuation-based adjustments
        if (text.endsWith('.') || text.endsWith('。')) delay += 400;
        else if (text.endsWith('?') || text.endsWith('!') || text.endsWith('？') || text.endsWith('！')) delay += 350;
        else if (text.endsWith(',') || text.endsWith(';') || text.endsWith('，') || text.endsWith('；')) delay += 150;

        // Context-based adjustments
        switch (context) {
            case 'greeting':
                delay *= 1.4; // Longer pauses after greetings
                break;
            case 'correction':
                delay *= 1.5; // Give time to process corrections
                break;
            case 'explanation':
                delay *= 1.2; // Allow processing time
                break;
            case 'encouragement':
                delay *= 0.9; // Keep energy up
                break;
        }

        // Emotional adjustments
        switch (emotion) {
            case 'welcoming':
                delay *= 1.3; // Warm, unhurried
                break;
            case 'excited':
                delay *= 0.7; // Quick pacing
                break;
            case 'serious':
                delay *= 1.4; // Deliberate pacing
                break;
            case 'calm':
                delay *= 1.1; // Relaxed pacing
                break;
        }

        return Math.max(100, Math.min(2000, delay));
    }
}

/* ==========================
   OPTIMIZED VOICE MANAGER
   ========================== */

class OptimizedVoiceManager {
    private static instance: OptimizedVoiceManager;
    private voices: SpeechSynthesisVoice[] = [];
    private voiceCache = new Map<string, SpeechSynthesisVoice>();
    private genderCache = new Map<string, 'male' | 'female' | 'neutral'>();
    private initialized = false;

    static getInstance(): OptimizedVoiceManager {
        if (!OptimizedVoiceManager.instance) {
            OptimizedVoiceManager.instance = new OptimizedVoiceManager();
        }
        return OptimizedVoiceManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                if (this.voices.length > 0) {
                    this.initialized = true;
                    this.precomputeGenders();
                    console.log(`Optimized TTS: Loaded ${this.voices.length} voices`);
                    resolve();
                } else {
                    setTimeout(loadVoices, 100);
                }
            };

            speechSynthesis.addEventListener('voiceschanged', loadVoices);
            loadVoices();
        });
    }

    private precomputeGenders(): void {
        for (const voice of this.voices) {
            this.genderCache.set(voice.name, this.detectVoiceGender(voice.name));
        }
    }

    findOptimalVoice(agentId: string): SpeechSynthesisVoice | null {
        if (!this.initialized) return null;

        // Check cache first
        const cached = this.voiceCache.get(agentId);
        if (cached && this.voices.includes(cached)) return cached;

        const profile = ENHANCED_AGENT_PROFILES.get(agentId);
        if (!profile) return this.voices[0] || null;

        // Gender-first filtering
        const genderFiltered = this.voices.filter(voice => {
            const gender = this.genderCache.get(voice.name);
            return gender === profile.voiceConfig.gender;
        });

        const candidateVoices = genderFiltered.length > 0 ? genderFiltered : this.voices;

        // Score and select best voice
        let bestVoice: SpeechSynthesisVoice | null = null;
        let bestScore = -1;

        for (const voice of candidateVoices) {
            const score = this.scoreVoiceMatch(voice, profile);
            if (score > bestScore) {
                bestScore = score;
                bestVoice = voice;
            }
        }

        if (bestVoice) {
            this.voiceCache.set(agentId, bestVoice);
            console.log(`Selected voice for ${agentId}: ${bestVoice.name} (${this.genderCache.get(bestVoice.name)})`);
        }

        return bestVoice;
    }

    private scoreVoiceMatch(voice: SpeechSynthesisVoice, profile: AgentProfile): number {
        let score = 0;

        // Language matching
        if (voice.lang === profile.voiceConfig.lang) score += 80;
        else if (voice.lang.startsWith(profile.voiceConfig.lang?.split('-')[0] || '')) score += 60;

        // Gender matching (cached)
        const detectedGender = this.genderCache.get(voice.name) || 'neutral';
        if (profile.voiceConfig.gender !== 'neutral' && detectedGender === profile.voiceConfig.gender) {
            score += 70;
        } else if (profile.voiceConfig.gender !== 'neutral' && detectedGender !== 'neutral' && detectedGender !== profile.voiceConfig.gender) {
            score -= 50;
        }

        // Name preferences
        const lowerName = voice.name.toLowerCase();
        for (const preference of profile.voicePreferences) {
            if (lowerName.includes(preference.toLowerCase())) {
                score += 40;
                break;
            }
        }

        // Quality indicators
        if (voice.localService) score += 15;
        if (lowerName.includes('premium') || lowerName.includes('enhanced')) score += 10;

        return score;
    }

    private detectVoiceGender(voiceName: string): 'male' | 'female' | 'neutral' {
        const lower = voiceName.toLowerCase();

        // Explicit indicators
        if (lower.includes('female') || lower.includes('woman') || lower.includes('femme')) return 'female';
        if (lower.includes('male') || lower.includes('man') || lower.includes('homme')) return 'male';

        // Extended name lists
        const femaleNames = ['susan', 'samantha', 'victoria', 'karen', 'moira', 'allison', 'ava', 'emma', 'amelie', 'audrey', 'marie', 'ting-ting', 'sin-ji', 'siri', 'kyoko', 'yuna', 'veena', 'serena'];
        const maleNames = ['alex', 'daniel', 'tom', 'fred', 'diego', 'carlos', 'jorge', 'li-mu', 'antonio', 'bruno', 'dmitri'];

        if (femaleNames.some(name => lower.includes(name))) return 'female';
        if (maleNames.some(name => lower.includes(name))) return 'male';

        return 'neutral';
    }
}

/* ==========================
   ENHANCED TTS COMPONENT
   ========================== */

interface EnhancedTTSProps {
    text: string;
    agentId?: string;
    autoPlay?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onProgress?: (segment: SpeechSegment, index: number, total: number) => void;
}

const OptimizedTextToSpeech: React.FC<EnhancedTTSProps> = ({
    text,
    agentId,
    autoPlay = false,
    onStart,
    onEnd,
    onError,
    onProgress
}) => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSegment, setCurrentSegment] = useState<SpeechSegment | null>(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const voiceManager = OptimizedVoiceManager.getInstance();
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setIsSupported(true);
            voiceManager.initialize();
        }
    }, []);

    const speak = useCallback(async () => {
        if (!isSupported || !text?.trim()) {
            onError?.('Speech synthesis not supported or no text provided');
            return;
        }

        // Cancel any current speech
        speechSynthesis.cancel();
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        // Process text into intelligent segments
        const segments = IntelligentTextProcessor.splitIntoIntelligentSegments(text, agentId);
        if (segments.length === 0) {
            onError?.('No speakable content found');
            return;
        }

        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();

        try {
            const selectedVoice = agentId ? voiceManager.findOptimalVoice(agentId) : null;
            const profile = agentId ? ENHANCED_AGENT_PROFILES.get(agentId) : null;

            for (let i = 0; i < segments.length && !signal.aborted; i++) {
                const segment = segments[i];
                setCurrentSegment(segment);
                setProgress({ current: i + 1, total: segments.length });
                onProgress?.(segment, i + 1, segments.length);

                // Get context-aware speech settings
                const track = agentId ? ConversationTracker.getInstance().getTrack(agentId) : null;
                const speechSettings = profile?.getSpeechSettings(track?.context || 'teaching', segment.emotion) || {
                    rate: 1.0,
                    pitch: 1.0,
                    volume: 0.8,
                    lang: segment.language
                };

                // Create optimized utterance
                const utterance = new SpeechSynthesisUtterance(segment.text);
                utterance.rate = (speechSettings.rate || 1) * segment.rateModifier;
                utterance.pitch = speechSettings.pitch || 1;
                utterance.volume = speechSettings.volume || 0.8;
                utterance.lang = segment.language;

                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                // Speak segment
                await new Promise<void>((resolve) => {
                    if (signal.aborted) {
                        resolve();
                        return;
                    }

                    let hasEnded = false;
                    const cleanup = () => {
                        hasEnded = true;
                        signal.removeEventListener('abort', handleAbort);
                    };

                    const handleAbort = () => {
                        if (!hasEnded) {
                            cleanup();
                            resolve();
                        }
                    };

                    utterance.onend = () => {
                        if (!hasEnded) {
                            cleanup();
                            resolve();
                        }
                    };

                    utterance.onerror = (event) => {
                        if (!hasEnded) {
                            cleanup();
                            console.warn('TTS error:', event.error);
                            resolve();
                        }
                    };

                    signal.addEventListener('abort', handleAbort);
                    speechSynthesis.speak(utterance);
                });

                if (signal.aborted) break;

                // Intelligent pause
                if (i < segments.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, segment.pauseAfter));
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
    }, [text, agentId, isSupported, onStart, onEnd, onError, onProgress]);

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
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSegment(null);
        setProgress({ current: 0, total: 0 });
    }, []);

    useEffect(() => {
        if (autoPlay && text && isSupported && !isSpeaking) {
            const timer = setTimeout(speak, 300);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, text, isSupported, isSpeaking, speak]);

    if (!isSupported) {
        return (
            <TTSContainer>
                <VolumeX size={16} />
                <StatusText>Speech not supported</StatusText>
            </TTSContainer>
        );
    }

    const getEmotionIcon = (emotion: TTSOptions['emotion']) => {
        switch (emotion) {
            case 'excited': return <Zap size={12} />;
            case 'happy': return <Heart size={12} />;
            case 'serious': return <AlertTriangle size={12} />;
            case 'welcoming': return <Globe size={12} />;
            default: return null;
        }
    };

    return (
        <TTSContainer>
            <ControlButton
                onClick={isSpeaking ? (isPaused ? resume : pause) : speak}
                $isActive={isSpeaking}
                disabled={!text}
                title={isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
            >
                {isSpeaking && !isPaused ? <Pause size={14} /> : <Play size={14} />}
            </ControlButton>

            {isSpeaking && (
                <ControlButton onClick={stop} $variant="secondary" title="Stop">
                    <Square size={14} />
                </ControlButton>
            )}

            {currentSegment && (
                <EmotionIndicator $emotion={currentSegment.emotion}>
                    {getEmotionIcon(currentSegment.emotion)}
                    <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        {currentSegment.language.split('-')[0]} - {currentSegment.emotion}
                    </span>
                </EmotionIndicator>
            )}

            <StatusText>
                {isSpeaking
                    ? (isPaused ? 'Paused' : `${progress.current}/${progress.total}`)
                    : agentId ? `${agentId} ready` : 'Ready'
                }
            </StatusText>
        </TTSContainer>
    );
};

/* ==========================
   STYLED COMPONENTS (Optimized)
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
  position: relative;
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

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const EmotionIndicator = styled.div<{ $emotion: TTSOptions['emotion'] }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $emotion }) => {
        switch ($emotion) {
            case 'excited': return '#f59e0b';
            case 'happy': return '#10b981';
            case 'serious': return '#ef4444';
            case 'encouraging': return '#8b5cf6';
            case 'welcoming': return '#06b6d4';
            case 'calm': return '#14b8a6';
            default: return '#6b7280';
        }
    }};
  background: ${({ $emotion }) => {
        switch ($emotion) {
            case 'excited': return 'rgba(245, 158, 11, 0.1)';
            case 'happy': return 'rgba(16, 185, 129, 0.1)';
            case 'serious': return 'rgba(239, 68, 68, 0.1)';
            case 'encouraging': return 'rgba(139, 92, 246, 0.1)';
            case 'welcoming': return 'rgba(6, 182, 212, 0.1)';
            case 'calm': return 'rgba(20, 184, 166, 0.1)';
            default: return 'rgba(107, 114, 128, 0.1)';
        }
    }};
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid currentColor;
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
`;

export default OptimizedTextToSpeech;
export { ENHANCED_AGENT_PROFILES, ConversationTracker, IntelligentTextProcessor, OptimizedVoiceManager };