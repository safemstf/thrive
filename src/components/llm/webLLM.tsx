'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, Bot, User, Download, Cpu, AlertCircle, Check, X, Globe, Volume2, VolumeX, SkipForward } from 'lucide-react';
import * as webllm from '@mlc-ai/web-llm';
import OptimizedTextToSpeech, { AGENT_PROFILES, LanguageDetector, EmotionProcessor, AgentProfile } from './textToSpeech';
import { pulse } from '@/styles/styled-components';

/* ==========================
   CORE TYPES
   ========================== */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    language?: string;
    context?: 'greeting' | 'teaching' | 'correction' | 'encouragement' | 'explanation';
    audioPlayed?: boolean;
}


export interface AgentPersonality extends AgentProfile {
    role: string;
    teachingStyle: string;
    bilingualResponses: boolean;

    // overrides / convenience
    nativeLanguage: string;   // alias of primaryLanguage, for chat context
    greeting: string;         // single greeting string instead of string[]
}

interface WebLLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/* ==========================
   STREAMLINED AGENT PERSONALITIES
   ========================== */

const CHAT_AGENT_PERSONALITIES = new Map<string, AgentPersonality>([
  ['Lexi', {
    ...AGENT_PROFILES.Lexi,
    role: 'Arabic Teacher',
    nativeLanguage: 'Arabic',
    teachingStyle: 'friendly and encouraging, explaining Arabic concepts in simple English with examples',
    greeting: "مرحباً! I'm Lexi, your Arabic teacher. Let's explore the beautiful Arabic language together!",
    bilingualResponses: true
  }],
  ['Adam', {
    ...AGENT_PROFILES.Adam,
    role: 'Arabic Teacher',
    nativeLanguage: 'Arabic',
    teachingStyle: 'calm and methodical, breaking down Arabic grammar step by step with cultural insights',
    greeting: "مرحباً! أنا آدم، مدرس العربية. I'm Adam, your Arabic teacher. Let's discover Arabic together!",
    bilingualResponses: true
  }],

  // SPANISH TEACHERS
  ['Kai', {
    ...AGENT_PROFILES.Kai,
    role: 'Spanish Teacher',
    nativeLanguage: 'Spanish',
    teachingStyle: 'patient and methodical with emphasis on pronunciation',
    greeting: "¡Hola! Soy Kai, tu profesor de español. I'm excited to help you master Spanish!",
    bilingualResponses: true
  }],
  ['Lupita', {
    ...AGENT_PROFILES.Lupita,
    role: 'Spanish Teacher',
    nativeLanguage: 'Spanish',
    teachingStyle: 'warm and expressive, focusing on conversational Spanish with cultural context',
    greeting: "¡Hola! Soy Lupita, tu profesora de español. ¡Qué gusto conocerte! Let's learn Spanish together!",
    bilingualResponses: true
  }],

  // FRENCH TEACHERS
  ['Sana', {
    ...AGENT_PROFILES.Sana,
    role: 'French Teacher',
    nativeLanguage: 'French',
    teachingStyle: 'systematic and precise with focus on proper grammar',
    greeting: "Bonjour ! Je suis Sana, votre professeure de français. Let's begin your French journey!",
    bilingualResponses: true
  }],
  ['Vinz', {
    ...AGENT_PROFILES.Vinz,
    role: 'French Teacher',
    nativeLanguage: 'French',
    teachingStyle: 'casual and conversational, emphasizing practical French for real situations',
    greeting: "Bonjour ! Je suis Vinz, votre professeur de français. Enchanté! Let's explore French together.",
    bilingualResponses: true
  }],

  // CHINESE TEACHERS
  ['Mei', {
    ...AGENT_PROFILES.Mei,
    role: 'Mandarin Teacher',
    nativeLanguage: 'Mandarin',
    teachingStyle: 'encouraging and patient with emphasis on tones',
    greeting: "你好！我是美美，你的中文老师。I'm Mei, excited to teach you Mandarin!",
    bilingualResponses: true
  }],
  ['Wei', {
    ...AGENT_PROFILES.Wei,
    role: 'Mandarin Teacher',
    nativeLanguage: 'Mandarin',
    teachingStyle: 'structured and thorough, focusing on character writing and pronunciation',
    greeting: "你好！我是伟，你的中文老师。I'm Wei, your Mandarin teacher. Let's master Chinese!",
    bilingualResponses: true
  }],

  // ITALIAN TEACHERS
  ['Giulia', {
    ...AGENT_PROFILES.Giulia,
    role: 'Italian Teacher',
    nativeLanguage: 'Italian',
    teachingStyle: 'passionate and animated, bringing Italian culture alive through language',
    greeting: "Ciao! Sono Giulia, la tua insegnante di italiano. Benvenuti! Welcome to beautiful Italian!",
    bilingualResponses: true
  }],
  ['Marco', {
    ...AGENT_PROFILES.Marco,
    role: 'Italian Teacher',
    nativeLanguage: 'Italian',
    teachingStyle: 'practical and clear, focusing on useful Italian for travel and conversation',
    greeting: "Ciao! Sono Marco, il vostro insegnante di italiano. Andiamo! Let's learn Italian together!",
    bilingualResponses: true
  }]
]);

/* ==========================
   ENHANCED PROMPT ENGINE
   ========================== */

class PromptEngine {
    static generateSystemPrompt(agentId: string): string {
        const personality = CHAT_AGENT_PERSONALITIES.get(agentId);
        if (!personality) return '';

        return `You are ${personality.name}, a native ${personality.nativeLanguage} speaker and professional ${personality.role}.

TEACHING APPROACH:
- Be ${personality.teachingStyle}
- Mix ${personality.nativeLanguage} naturally with English explanations
- Always provide translations in brackets: [${personality.nativeLanguage}] = [English]
- Focus on practical, everyday usage and pronunciation
- Keep responses concise but informative (2-3 sentences typically)
- Use encouragement when students make attempts
- Correct mistakes gently with clear explanations

RESPONSE STYLE:
- Start with a ${personality.nativeLanguage} greeting/phrase when appropriate
- Explain grammar, pronunciation, and cultural context clearly
- Give practical examples the student can use immediately
- Be warm, encouraging, and patient
- End with a question or suggestion to keep the conversation flowing

IMPORTANT: Always include some ${personality.nativeLanguage} in your responses to help with pronunciation practice.

Remember: You're teaching beginners, so keep explanations simple and engaging.`;
    }

    static detectContext(message: string): Message['context'] {
        const lower = message.toLowerCase();

        if (lower.match(/hello|hi|hey|greet|start|مرحبا|hola|bonjour|你好/)) return 'greeting';
        if (lower.match(/how do|what is|translate|mean|explain|why|grammar/)) return 'explanation';
        if (lower.match(/correct|wrong|mistake|check|pronunciation|better/)) return 'correction';
        if (lower.match(/difficult|hard|struggle|help|confused|don't understand/)) return 'encouragement';

        return 'teaching';
    }

    static generateContextualPrompt(message: string, context: Message['context'], agentId: string): string {
        const personality = CHAT_AGENT_PERSONALITIES.get(agentId);
        if (!personality) return message;

        switch (context) {
            case 'greeting':
                return `${message}\n\n[Context: This is a greeting. Respond warmly with a ${personality.nativeLanguage} greeting and introduce what you can help with today.]`;

            case 'correction':
                return `${message}\n\n[Context: The student needs correction or feedback. Be gentle but clear, provide the correct form in ${personality.nativeLanguage}, and explain why.]`;

            case 'encouragement':
                return `${message}\n\n[Context: The student is struggling. Be extra encouraging, break down the concept into simpler parts, and provide easier examples in ${personality.nativeLanguage}.]`;

            case 'explanation':
                return `${message}\n\n[Context: The student wants to learn something new. Explain clearly with ${personality.nativeLanguage} examples and practical usage.]`;

            default:
                return message;
        }
    }
}

/* ==========================
   OPTIMIZED MODEL MANAGER
   ========================== */

class ModelManager {
    private static instance: ModelManager;
    private engine: webllm.MLCEngineInterface | null = null;
    private isLoading = false;
    private isReady = false;
    private conversationHistory = new Map<string, Message[]>();
    private loadPromise: Promise<webllm.MLCEngineInterface> | null = null;

    static getInstance(): ModelManager {
        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    async loadModel(progressCallback?: (progress: number, text: string) => void): Promise<webllm.MLCEngineInterface> {
        // Return existing engine if ready
        if (this.engine && this.isReady) {
            return this.engine;
        }

        // Return existing load promise if loading
        if (this.loadPromise) {
            return this.loadPromise;
        }

        // Start new load
        this.isLoading = true;
        this.loadPromise = this.performLoad(progressCallback);

        try {
            const result = await this.loadPromise;
            return result;
        } finally {
            this.loadPromise = null;
        }
    }

    private async performLoad(progressCallback?: (progress: number, text: string) => void): Promise<webllm.MLCEngineInterface> {
        try {
            const engineConfig: webllm.MLCEngineConfig = {
                initProgressCallback: (progress) => {
                    const percent = Math.round(progress.progress * 100);
                    progressCallback?.(percent, progress.text || 'Loading model...');
                }
            };

            this.engine = new webllm.MLCEngine(engineConfig);
            await this.engine.reload('Llama-3.2-1B-Instruct-q4f32_1-MLC');

            this.isReady = true;
            this.isLoading = false;
            console.log('WebLLM model loaded successfully');
            return this.engine;
        } catch (error) {
            this.isLoading = false;
            this.isReady = false;
            console.error('Failed to load WebLLM model:', error);
            throw error;
        }
    }

    async generateResponse(
        agentId: string,
        userMessage: string,
        conversationId: string,
        maxRetries: number = 2
    ): Promise<string> {
        if (!this.engine || !this.isReady) {
            throw new Error('Model not ready');
        }

        const history = this.conversationHistory.get(conversationId) || [];
        const context = PromptEngine.detectContext(userMessage);
        const contextualMessage = PromptEngine.generateContextualPrompt(userMessage, context, agentId);
        const systemPrompt = PromptEngine.generateSystemPrompt(agentId);

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Build message history with better context
                const messages: WebLLMMessage[] = [
                    { role: 'system', content: systemPrompt },
                    // Include recent conversation history for context
                    ...history.slice(-6).map(msg => ({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: contextualMessage }
                ];

                const completion = await this.engine.chat.completions.create({
                    messages,
                    temperature: 0.75, // Slightly higher for more creative language teaching
                    max_tokens: 300, // Increased for better explanations
                    top_p: 0.9,
                    frequency_penalty: 0.1, // Reduce repetition
                    presence_penalty: 0.1
                });

                const response = completion.choices[0]?.message?.content;

                if (!response || response.trim().length === 0) {
                    throw new Error('Empty response from model');
                }

                // Save to history
                this.updateHistory(conversationId, userMessage, response, context);

                return response.trim();

            } catch (error) {
                lastError = error as Error;
                console.warn(`Generation attempt ${attempt + 1} failed:`, error);

                // Wait before retry
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }

        throw lastError || new Error('Failed to generate response after all retries');
    }

    private updateHistory(conversationId: string, userMsg: string, assistantMsg: string, context: Message['context']) {
        const history = this.conversationHistory.get(conversationId) || [];

        const newMessages: Message[] = [
            {
                id: `${Date.now()}-user`,
                role: 'user',
                content: userMsg,
                timestamp: new Date(),
                context,
                language: LanguageDetector.detect(userMsg)
            },
            {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content: assistantMsg,
                timestamp: new Date(),
                context,
                language: LanguageDetector.detect(assistantMsg),
                audioPlayed: false
            }
        ];

        // Keep last 12 messages for better context retention
        const updated = [...history, ...newMessages].slice(-12);
        this.conversationHistory.set(conversationId, updated);
    }

    clearConversation(conversationId: string) {
        this.conversationHistory.delete(conversationId);
        console.log(`Cleared conversation: ${conversationId}`);
    }

    getConversationHistory(conversationId: string): Message[] {
        return this.conversationHistory.get(conversationId) || [];
    }

    isModelReady(): boolean {
        return this.isReady;
    }

    getLoadingStatus(): { isLoading: boolean; isReady: boolean } {
        return { isLoading: this.isLoading, isReady: this.isReady };
    }
}

/* ==========================
   MAIN CHAT COMPONENT
   ========================== */

interface ChatProps {
    agent: {
        id: number;
        name: string;
        role: string;
        category: string;
        status: string;
        systemPrompt: string;
    };
    onClose: () => void;
}

const OptimizedChat: React.FC<ChatProps> = ({ agent, onClose }) => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing...');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    const modelManager = useMemo(() => ModelManager.getInstance(), []);
    const conversationId = useMemo(() => `${agent.name}-${Date.now()}`, [agent.name]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const chatAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize agent
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                setStatus('loading');
                setLoadingText('Loading language model...');

                await modelManager.loadModel((progress, text) => {
                    if (mounted) {
                        setLoadingProgress(progress);
                        setLoadingText(text);
                    }
                });

                if (mounted) {
                    setStatus('ready');
                    setLoadingText('Ready!');

                    // Add welcome message
                    const personality = CHAT_AGENT_PERSONALITIES.get(agent.name);
                    if (personality) {
                        const welcomeMessage: Message = {
                            id: 'welcome',
                            role: 'assistant',
                            content: personality.greeting,
                            timestamp: new Date(),
                            context: 'greeting',
                            language: LanguageDetector.detect(personality.greeting),
                            audioPlayed: false
                        };

                        setMessages([welcomeMessage]);

                        // Auto-play welcome message if audio enabled
                        if (audioEnabled) {
                            setTimeout(() => setCurrentPlayingId('welcome'), 500);
                        }
                    }
                }
            } catch (err) {
                console.error('Initialization failed:', err);
                if (mounted) {
                    setStatus('error');
                    setLoadingText('Failed to load model');
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [agent.name, modelManager, audioEnabled]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to close
            if (e.key === 'Escape') {
                onClose();
            }

            // Space to toggle audio when not typing
            if (e.key === ' ' && document.activeElement !== inputRef.current && !isGenerating) {
                e.preventDefault();
                setAudioEnabled(!audioEnabled);
            }

            // S to skip current audio
            if (e.key === 's' && (e.ctrlKey || e.metaKey) && isAudioPlaying) {
                e.preventDefault();
                setCurrentPlayingId(null);
                setIsAudioPlaying(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, audioEnabled, isGenerating, isAudioPlaying]);

    // Focus management for accessibility
    useEffect(() => {
        if (status === 'ready') {
            inputRef.current?.focus();
        }
    }, [status]);

    // Handle message sending
    const sendMessage = useCallback(async () => {
        const trimmedInput = inputText.trim();
        if (!trimmedInput || isGenerating || status !== 'ready') return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            timestamp: new Date(),
            language: LanguageDetector.detect(trimmedInput),
            context: PromptEngine.detectContext(trimmedInput)
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsGenerating(true);

        // Announce to screen readers
        const announcement = `Sending message: ${trimmedInput}`;
        announceToScreenReader(announcement);

        // Focus input after a short delay
        setTimeout(() => inputRef.current?.focus(), 100);

        try {
            const response = await modelManager.generateResponse(
                agent.name,
                trimmedInput,
                conversationId
            );

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                language: LanguageDetector.detect(response),
                context: PromptEngine.detectContext(trimmedInput),
                audioPlayed: false
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Announce response to screen readers
            announceToScreenReader(`${agent.name} responded`);

            // Auto-play audio for new message if enabled
            if (audioEnabled) {
                setCurrentPlayingId(assistantMessage.id);
            }

        } catch (err) {
            console.error('Generation failed:', err);

            // Generate contextual error message
            const personality = CHAT_AGENT_PERSONALITIES.get(agent.name);
            const errorContent = personality
                ? `${personality.name === 'Lexi' ? 'آسف! ' :
                    personality.name === 'Kai' ? '¡Lo siento! ' :
                        personality.name === 'Sana' ? 'Désolé! ' :
                            personality.name === 'Mei' ? '对不起! ' : ''}I apologize, but I encountered an error. Please try again.`
                : 'I apologize, but I encountered an error. Please try again.';

            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: errorContent,
                timestamp: new Date(),
                language: 'en-US',
                audioPlayed: false
            };

            setMessages(prev => [...prev, errorMessage]);
            announceToScreenReader('An error occurred. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, [inputText, isGenerating, status, agent.name, conversationId, modelManager, audioEnabled]);

    // Handle keyboard shortcuts
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // Handle input changes with better UX
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }, []);

    // Handle audio start/stop
    const handleAudioStart = useCallback(() => {
        setIsAudioPlaying(true);
        announceToScreenReader('Audio playback started');
    }, []);

    const handleAudioComplete = useCallback((messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, audioPlayed: true } : msg
        ));
        setCurrentPlayingId(null);
        setIsAudioPlaying(false);
        announceToScreenReader('Audio playback completed');
    }, []);

    // Skip current audio
    const skipAudio = useCallback(() => {
        setCurrentPlayingId(null);
        setIsAudioPlaying(false);
        announceToScreenReader('Audio playback skipped');
    }, []);

    // Clear conversation
    const clearConversation = useCallback(() => {
        modelManager.clearConversation(conversationId);
        setMessages([]);
        setCurrentPlayingId(null);

        // Re-add welcome message
        const personality = CHAT_AGENT_PERSONALITIES.get(agent.name);
        if (personality) {
            const welcomeMessage: Message = {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                content: personality.greeting,
                timestamp: new Date(),
                context: 'greeting',
                language: LanguageDetector.detect(personality.greeting),
                audioPlayed: false
            };
            setMessages([welcomeMessage]);
        }

        announceToScreenReader('Conversation cleared');
        inputRef.current?.focus();
    }, [modelManager, conversationId, agent.name]);

    // Utility function to announce to screen readers
    const announceToScreenReader = useCallback((message: string) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    }, []);

    return (
        <ChatOverlay
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
        >
            <ChatContainer>
                <ChatHeader>
                    <HeaderInfo>
                        <Bot size={24} aria-hidden="true" />
                        <div>
                            <AgentName id="chat-title">
                                {agent.name}
                                <Globe size={16} aria-hidden="true" />
                            </AgentName>
                            <AgentRole>
                                {agent.role} • {CHAT_AGENT_PERSONALITIES.get(agent.name)?.nativeLanguage}
                            </AgentRole>
                        </div>
                    </HeaderInfo>

                    <HeaderControls>
                        <AudioToggle
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            $enabled={audioEnabled}
                            title={audioEnabled ? 'Disable audio (Space)' : 'Enable audio (Space)'}
                            aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
                        >
                            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </AudioToggle>

                        {isAudioPlaying && (
                            <SkipButton
                                onClick={skipAudio}
                                title="Skip audio (Ctrl+S)"
                                aria-label="Skip audio"
                            >
                                <SkipForward size={18} />
                            </SkipButton>
                        )}

                        <StatusBadge
                            $status={status}
                            role="status"
                            aria-label={`Model status: ${status}`}
                        >
                            {status === 'loading' && <Download size={16} aria-hidden="true" />}
                            {status === 'ready' && <Check size={16} aria-hidden="true" />}
                            {status === 'error' && <AlertCircle size={16} aria-hidden="true" />}
                            {status}
                        </StatusBadge>

                        <CloseButton
                            onClick={onClose}
                            aria-label="Close chat (Escape)"
                            title="Close chat (Escape)"
                        >
                            <X size={20} />
                        </CloseButton>
                    </HeaderControls>
                </ChatHeader>

                {status === 'loading' && (
                    <LoadingContainer role="status" aria-live="polite">
                        <Cpu size={48} aria-hidden="true" />
                        <LoadingTitle>Loading {agent.name}</LoadingTitle>
                        <LoadingText aria-live="polite">{loadingText}</LoadingText>
                        <ProgressBar role="progressbar" aria-valuenow={loadingProgress} aria-valuemin={0} aria-valuemax={100}>
                            <ProgressFill $progress={loadingProgress} />
                        </ProgressBar>
                        <LoadingPercent aria-live="polite">{loadingProgress}% complete</LoadingPercent>
                    </LoadingContainer>
                )}

                {status === 'ready' && (
                    <>
                        <MessagesArea
                            ref={chatAreaRef}
                            role="log"
                            aria-live="polite"
                            aria-label="Conversation history"
                        >
                            {messages.map((message, index) => (
                                <MessageBubble
                                    key={message.id}
                                    $isUser={message.role === 'user'}
                                    role="article"
                                    aria-label={`${message.role === 'user' ? 'Your message' : `${agent.name}'s response`}`}
                                >
                                    {message.role === 'assistant' && (
                                        <Avatar $isUser={false} aria-hidden="true">
                                            <Bot size={16} />
                                        </Avatar>
                                    )}
                                    <MessageContent $isUser={message.role === 'user'}>
                                        <MessageText>
                                            {message.content}
                                        </MessageText>
                                        {message.role === 'assistant' && audioEnabled && (
                                            <AudioButton>
                                                <OptimizedTextToSpeech
                                                    text={message.content}
                                                    agentId={agent.name}
                                                    autoPlay={currentPlayingId === message.id && !message.audioPlayed}
                                                    onStart={handleAudioStart}
                                                    onEnd={() => handleAudioComplete(message.id)}
                                                />
                                            </AudioButton>
                                        )}
                                        {message.language && message.language !== 'en-US' && (
                                            <LanguageTag
                                                $language={message.language}
                                                aria-label={`Language: ${message.language}`}
                                            >
                                                {message.language.split('-')[0].toUpperCase()}
                                            </LanguageTag>
                                        )}
                                        <MessageTime aria-label={`Sent at ${message.timestamp.toLocaleTimeString()}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </MessageTime>
                                    </MessageContent>
                                    {message.role === 'user' && (
                                        <Avatar $isUser={true} aria-hidden="true">
                                            <User size={16} />
                                        </Avatar>
                                    )}
                                </MessageBubble>
                            ))}

                            {isGenerating && (
                                <TypingIndicator role="status" aria-live="polite">
                                    <Bot size={16} aria-hidden="true" />
                                    <span>{agent.name} is thinking</span>
                                    <TypingDots aria-hidden="true">
                                        <span />
                                        <span />
                                        <span />
                                    </TypingDots>
                                </TypingIndicator>
                            )}

                            <div ref={messagesEndRef} />
                        </MessagesArea>

                        <InputArea>
                            <InputContainer>
                                <TextInput
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Ask ${agent.name} anything... (Press Enter to send)`}
                                    disabled={isGenerating}
                                    rows={1}
                                    aria-label="Type your message"
                                    aria-describedby="input-help"
                                />
                                <HiddenText id="input-help">
                                    Press Enter to send, Shift+Enter for new line, Escape to close, Space to toggle audio
                                </HiddenText>
                                <SendButton
                                    onClick={sendMessage}
                                    disabled={!inputText.trim() || isGenerating}
                                    $disabled={!inputText.trim() || isGenerating}
                                    aria-label="Send message"
                                >
                                    <Send size={18} />
                                </SendButton>
                            </InputContainer>
                        </InputArea>
                    </>
                )}

                {status === 'error' && (
                    <LoadingContainer role="alert">
                        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                        <LoadingTitle>Failed to load {agent.name}</LoadingTitle>
                        <LoadingText>Please refresh and try again</LoadingText>
                        <RetryButton onClick={() => window.location.reload()}>
                            Retry
                        </RetryButton>
                    </LoadingContainer>
                )}
            </ChatContainer>
        </ChatOverlay>
    );
};

/* ==========================
   STYLED COMPONENTS
   ========================== */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const ChatOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ChatContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 95vh;
    max-height: none;
    border-radius: 8px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AgentName = styled.h1`
  margin: 0;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { opacity: 0.8; }
`;

const AgentRole = styled.p`
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const AudioToggle = styled.button<{ $enabled: boolean }>`
  background: ${({ $enabled }) => $enabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const SkipButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const StatusBadge = styled.div<{ $status: 'loading' | 'ready' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $status }) => {
        switch ($status) {
            case 'loading': return 'rgba(245, 158, 11, 0.2)';
            case 'ready': return 'rgba(34, 197, 94, 0.2)';
            case 'error': return 'rgba(239, 68, 68, 0.2)';
        }
    }};
  color: ${({ $status }) => {
        switch ($status) {
            case 'loading': return '#f59e0b';
            case 'ready': return '#22c55e';
            case 'error': return '#ef4444';
        }
    }};
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  
  svg { color: #3b82f6; margin-bottom: 1rem; }
`;

const LoadingTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #374151;
`;

const LoadingText = styled.p`
  color: #6b7280;
  margin: 0.5rem 0;
  font-size: 0.875rem;
`;

const LoadingPercent = styled.p`
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #7c3aed);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${({ $progress }) => $progress}%;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scroll-behavior: smooth;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: ${fadeInUp} 0.3s ease;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  
  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const Avatar = styled.div<{ $isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isUser }) => $isUser ? '#3b82f6' : '#f3f4f6'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#6b7280'};
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ $isUser: boolean }>`
  background: ${({ $isUser }) => $isUser ? '#3b82f6' : '#f3f4f6'};
  color: ${({ $isUser }) => $isUser ? 'white' : '#374151'};
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  word-break: break-word;
  position: relative;
  
  ${({ $isUser }) => !$isUser && `
    border: 1px solid rgba(59, 130, 246, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  `}
`;

const MessageText = styled.div`
  margin-bottom: 0.5rem;
`;

const MessageTime = styled.div`
  font-size: 0.6rem;
  opacity: 0.7;
  margin-top: 0.25rem;
`;

const AudioButton = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
`;

const LanguageTag = styled.div<{ $language: string }>`
  position: absolute;
  bottom: -8px;
  left: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  position: relative;
`;

const TextInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 0.875rem;
  resize: none;
  outline: none;
  font-family: inherit;
  overflow-y: auto;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const VoiceInputButton = styled.button<{ $isListening: boolean }>`
  background: ${({ $isListening }) => $isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255, 255, 255, 0.15)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
  font-size: 1rem;
  
  &:hover {
    background: ${({ $isListening }) => $isListening ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'rgba(255, 255, 255, 0.25)'};
  }
  
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ListeningIndicator = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;
`;

const HiddenText = styled.div`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

const SendButton = styled.button<{ $disabled: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled }) => $disabled ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6, #7c3aed)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 2px;
  
  span {
    width: 4px;
    height: 4px;
    background: #6b7280;
    border-radius: 50%;
    animation: ${typing} 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
`;

export default OptimizedChat;
export { ModelManager, PromptEngine, CHAT_AGENT_PERSONALITIES };