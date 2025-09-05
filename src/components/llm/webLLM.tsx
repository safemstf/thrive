// src\components\llm\webLLM.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, Bot, User, Download, Cpu, AlertCircle, Check, X, Globe, Sparkles } from 'lucide-react';
import * as webllm from '@mlc-ai/web-llm';
import OptimizedTextToSpeech, { ENHANCED_AGENT_PROFILES, ConversationTracker } from './textToSpeech';

/* ==========================
   ENHANCED TYPES
   ========================== */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    language?: string;
    context?: 'greeting' | 'teaching' | 'correction' | 'encouragement' | 'explanation';
}

interface AgentPersonality {
    id: string;
    name: string;
    role: string;
    nativeLanguage: string;
    teachingStyle: string;
    responseTemplates: {
        greeting: string[];
        teaching: string[];
        correction: string[];
        encouragement: string[];
        explanation: string[];
    };
    languageRules: {
        useNativeInGreeting: boolean;
        bilingualResponses: boolean;
        translationHelp: boolean;
        pronunciationFocus: boolean;
    };
}

// Properly typed message for WebLLM API
interface WebLLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/* ==========================
   ENHANCED AGENT PERSONALITIES
   ========================== */

const AGENT_PERSONALITIES = new Map<string, AgentPersonality>([
    ['Lexi', {
        id: 'Lexi',
        name: 'Lexi',
        role: 'Arabic Teacher',
        nativeLanguage: 'Arabic',
        teachingStyle: 'friendly and encouraging, explaining Arabic concepts in simple English with examples',
        responseTemplates: {
            greeting: [
                "مرحباً! I'm Lexi, your Arabic teacher. Let's start with some basics!",
                "أهلاً! Ready to improve your Arabic today?",
                "Hi! I’ll guide you step by step in learning Arabic."
            ],
            teaching: [
                "In Arabic, this is said as...",
                "Here's how you write and pronounce it in Arabic...",
                "This is a common phrase in Arabic..."
            ],
            correction: [
                "Almost there! Try saying it like this in Arabic...",
                "Good effort! The correct Arabic way to say that is...",
                "Let me help you refine your pronunciation..."
            ],
            encouragement: [
                "ممتاز! (Excellent!)",
                "أحسنت! (Well done!)",
                "Great progress, keep going!"
            ],
            explanation: [
                "Arabic has a root-based system. Let me show you...",
                "Think of Arabic verbs this way...",
                "Here’s an easy trick to remember this rule..."
            ]
        },
        languageRules: {
            useNativeInGreeting: true,      // Start with Arabic greetings
            bilingualResponses: true,       // Mix Arabic + English for clarity
            translationHelp: true,          // Provide English equivalents
            pronunciationFocus: true        // Pay attention to Arabic sounds
        }
    }],

    ['Kai', {
        id: 'Kai',
        name: 'Kai',
        role: 'Spanish Teacher',
        nativeLanguage: 'Spanish',
        teachingStyle: 'patient and methodical with emphasis on pronunciation',
        responseTemplates: {
            greeting: [
                "¡Hola! Soy Kai, tu profesor de español. Hello! I'm Kai, your Spanish teacher. ¡Vamos a practicar español juntos!",
                "¡Buenos días! Ready to practice español today? Let's start with some básico conversation.",
                "¡Saludos! I'm here to help you with your Spanish pronunciation and conversation. ¡Empecemos!"
            ],
            teaching: [
                "En español, we say... In Spanish, we say...",
                "Listen carefully to the pronunciation: [Spanish phrase] - this means [English translation]",
                "This is an important rule in español..."
            ],
            correction: [
                "¡Muy bien! Good effort! Let me help: instead of saying that, try: [Spanish correction]",
                "¡Casi! Almost! The correct pronunciation is: [Spanish] - remember to roll your R",
                "Good attempt! In español, we say it like this: [Spanish phrase]"
            ],
            encouragement: [
                "¡Excelente! Excellent!",
                "¡Muy bien! You're improving!",
                "¡Perfecto! Keep practicing like that!"
            ],
            explanation: [
                "Let me explain this Spanish grammar rule...",
                "In español, this works differently than English...",
                "Here's why we pronounce it this way in Spanish..."
            ]
        },
        languageRules: {
            useNativeInGreeting: true,
            bilingualResponses: true,
            translationHelp: true,
            pronunciationFocus: true
        }
    }],

    ['Sana', {
        id: 'Sana',
        name: 'Sana',
        role: 'French Teacher',
        nativeLanguage: 'French',
        teachingStyle: 'systematic and precise with focus on proper grammar',
        responseTemplates: {
            greeting: [
                "Bonjour ! Je suis Sana, votre professeure de français. Hello! I'm Sana, your French teacher. Commençons notre leçon !",
                "Salut ! Ready to learn français today? Let's practice proper French pronunciation and grammar.",
                "Bonjour mes étudiants ! I'll help you master the beautiful French language. Allons-y !"
            ],
            teaching: [
                "En français, nous disons... In French, we say...",
                "Note the pronunciation: [French phrase] - this means [English translation]",
                "This is a fundamental rule in français..."
            ],
            correction: [
                "Très bien ! Good try! The correct French is: [French correction] - note the liaison",
                "Presque ! Almost! In français, we say: [French phrase] - mind the accent",
                "Good effort! The proper French pronunciation is: [French phrase]"
            ],
            encouragement: [
                "Parfait ! Perfect!",
                "Très bien ! You're progressing well!",
                "Excellent ! Continue like this!"
            ],
            explanation: [
                "Let me explain this French grammar concept...",
                "En français, this structure works like this...",
                "Here's why French pronunciation follows this pattern..."
            ]
        },
        languageRules: {
            useNativeInGreeting: true,
            bilingualResponses: true,
            translationHelp: true,
            pronunciationFocus: true
        }
    }],

    ['Mei', {
        id: 'Mei',
        name: 'Mei',
        role: 'Mandarin Teacher',
        nativeLanguage: 'Mandarin',
        teachingStyle: 'encouraging and patient with emphasis on tones',
        responseTemplates: {
            greeting: [
                "你好！我是美美，你的中文老师。Hello! I'm Mei, your Mandarin teacher. 我们一起学中文吧！",
                "你好! Ready to practice 中文? Let's work on those important tones together!",
                "欢迎！Welcome! I'll help you master Mandarin pronunciation and tones. 开始吧！"
            ],
            teaching: [
                "在中文里，我们说... In Mandarin, we say...",
                "Listen to the tones: [Chinese with pinyin] - this means [English translation]",
                "This tone pattern is important in 中文..."
            ],
            correction: [
                "很好！Good try! The correct tone is: [Chinese with tone marks] - remember the rising tone",
                "差不多！Close! In 中文, we say: [Chinese phrase] - focus on the third tone",
                "Good attempt! The proper Mandarin is: [Chinese with pinyin]"
            ],
            encouragement: [
                "太好了！Excellent!",
                "很好！You're improving!",
                "完美！Perfect tones!"
            ],
            explanation: [
                "Let me explain this Mandarin tone rule...",
                "在中文里，tones work like this...",
                "Here's why this tone combination changes..."
            ]
        },
        languageRules: {
            useNativeInGreeting: true,
            bilingualResponses: true,
            translationHelp: true,
            pronunciationFocus: true
        }
    }]
]);

/* ==========================
   ADVANCED PROMPT ENGINEERING
   ========================== */

class MultilingualPromptEngine {
    static generateEnhancedSystemPrompt(agentId: string): string {
        const personality = AGENT_PERSONALITIES.get(agentId);
        if (!personality) return '';

        const basePrompt = `You are ${personality.name}, a ${personality.role.toLowerCase()}.

CRITICAL LANGUAGE REQUIREMENTS:
${personality.languageRules.useNativeInGreeting ?
                `- ALWAYS start your first response with ${personality.nativeLanguage} greeting, then English
- Use ${personality.nativeLanguage} phrases naturally throughout responses
- Provide bilingual explanations: [${personality.nativeLanguage} phrase] - [English translation]` :
                `- Respond primarily in English with helpful explanations
- Use target language examples when teaching`}

PERSONALITY & STYLE:
- Teaching style: ${personality.teachingStyle}
- Be ${personality.teachingStyle}
- ${personality.languageRules.pronunciationFocus ? 'Focus heavily on pronunciation and provide phonetic guidance' : ''}
- ${personality.languageRules.translationHelp ? 'Always provide translations between languages' : ''}

RESPONSE STRUCTURE:
1. ${personality.languageRules.useNativeInGreeting ? `Start with ${personality.nativeLanguage} greeting/phrase` : 'Start with warm English greeting'}
2. Provide teaching content
3. ${personality.languageRules.bilingualResponses ? 'Include both languages naturally' : 'Focus on English explanations'}
4. End with encouragement

EXAMPLE RESPONSES:
${personality.responseTemplates.greeting[0]}

Remember: Be authentic to your ${personality.nativeLanguage} background while teaching effectively.`;

        return basePrompt;
    }

    static formatUserMessage(content: string, context: Message['context']): string {
        const contextMarkers = {
            greeting: '[FIRST_INTERACTION]',
            teaching: '[LEARNING_REQUEST]',
            correction: '[NEEDS_CORRECTION]',
            encouragement: '[SEEKING_ENCOURAGEMENT]',
            explanation: '[NEEDS_EXPLANATION]'
        };

        const marker = context ? contextMarkers[context] : '[GENERAL_INTERACTION]';
        return `${marker} ${content}`;
    }

    static analyzeResponseNeeds(userMessage: string): {
        context: Message['context'];
        needsTranslation: boolean;
        needsPronunciation: boolean;
        language: string;
    } {
        const lower = userMessage.toLowerCase();

        let context: Message['context'] = 'teaching';
        if (lower.match(/hello|hi|hey|first time|nice to meet/)) context = 'greeting';
        if (lower.match(/how do you say|translate|what does.*mean/)) context = 'explanation';
        if (lower.match(/is this correct|did i say.*right|check my/)) context = 'correction';
        if (lower.match(/struggling|difficult|hard|confused/)) context = 'encouragement';

        return {
            context,
            needsTranslation: lower.includes('translate') || lower.includes('mean'),
            needsPronunciation: lower.includes('pronounce') || lower.includes('sound'),
            language: 'auto-detect'
        };
    }
}

/* ==========================
   OPTIMIZED MODEL MANAGER
   ========================== */

class OptimizedModelManager {
    private static instance: OptimizedModelManager;
    private engine: webllm.MLCEngineInterface | null = null;
    private isLoading = false;
    private isReady = false;
    private loadingCallbacks = new Set<(progress: number, text: string) => void>();
    private readyCallbacks = new Set<() => void>();
    private conversationHistory = new Map<string, Message[]>();

    static getInstance(): OptimizedModelManager {
        if (!OptimizedModelManager.instance) {
            OptimizedModelManager.instance = new OptimizedModelManager();
        }
        return OptimizedModelManager.instance;
    }

    async loadModel(progressCallback?: (progress: number, text: string) => void): Promise<webllm.MLCEngineInterface> {
        if (this.engine && this.isReady) return this.engine;

        if (this.isLoading) {
            return new Promise((resolve) => {
                if (progressCallback) this.loadingCallbacks.add(progressCallback);
                this.readyCallbacks.add(() => resolve(this.engine!));
            });
        }

        this.isLoading = true;
        if (progressCallback) this.loadingCallbacks.add(progressCallback);

        try {
            const engineConfig: webllm.MLCEngineConfig = {
                initProgressCallback: (progress) => {
                    const progressPercent = Math.round(progress.progress * 100);
                    const text = progress.text || 'Loading...';
                    this.loadingCallbacks.forEach(cb => cb(progressPercent, text));
                }
            };

            this.engine = new webllm.MLCEngine(engineConfig);
            await this.engine.reload('Llama-3.2-1B-Instruct-q4f32_1-MLC');

            this.isReady = true;
            this.isLoading = false;
            this.loadingCallbacks.clear();
            this.readyCallbacks.forEach(cb => cb());
            this.readyCallbacks.clear();

            return this.engine;
        } catch (error) {
            this.isLoading = false;
            this.loadingCallbacks.clear();
            this.readyCallbacks.clear();
            throw error;
        }
    }

    async generateResponse(agentId: string, userMessage: string, conversationId: string): Promise<string> {
        if (!this.engine || !this.isReady) {
            throw new Error('Model not ready');
        }

        // Analyze user message for context
        const analysis = MultilingualPromptEngine.analyzeResponseNeeds(userMessage);

        // Update conversation tracking
        const tracker = ConversationTracker.getInstance();
        const context: NonNullable<Message['context']> = analysis.context ?? 'teaching';
        tracker.updateTrack(agentId, context, 'calm');

        // Get conversation history
        const history = this.conversationHistory.get(conversationId) || [];

        // Format user message with context
        const formattedUserMessage = MultilingualPromptEngine.formatUserMessage(userMessage, analysis.context);

        // Generate enhanced system prompt
        const systemPrompt = MultilingualPromptEngine.generateEnhancedSystemPrompt(agentId);

        try {
            // Prepare properly typed messages for WebLLM API
            const messages: WebLLMMessage[] = [
                { role: 'system', content: systemPrompt },
                ...history.slice(-6).map((msg): WebLLMMessage => ({
                    role: msg.role as 'user' | 'assistant', // Explicit cast to ensure proper typing
                    content: msg.content
                })),
                { role: 'user', content: formattedUserMessage }
            ];

            const completion = await this.engine.chat.completions.create({
                messages,
                temperature: 0.8,
                max_tokens: 1200,
                top_p: 0.9
            });

            const response = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

            // Store conversation
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: userMessage,
                timestamp: new Date(),
                context: analysis.context
            };

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                context: analysis.context
            };

            const updatedHistory = [...history, userMsg, assistantMsg];
            this.conversationHistory.set(conversationId, updatedHistory.slice(-20));

            return response;
        } catch (error) {
            console.error('Generation error:', error);
            throw new Error('Failed to generate response');
        }
    }

    getConversationHistory(conversationId: string): Message[] {
        return this.conversationHistory.get(conversationId) || [];
    }

    clearConversation(conversationId: string): void {
        this.conversationHistory.delete(conversationId);
    }

    isModelReady(): boolean {
        return this.isReady;
    }

    isModelLoading(): boolean {
        return this.isLoading;
    }
}

/* ==========================
   ENHANCED CHAT COMPONENT
   ========================== */

interface OptimizedChatProps {
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

const OptimizedChat: React.FC<OptimizedChatProps> = ({ agent, onClose }) => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState('Initializing...');

    const modelManager = OptimizedModelManager.getInstance();
    const conversationId = `${agent.name}-${Date.now()}`;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const initializeAgent = async () => {
        try {
            setStatus('loading');
            setLoadingProgress(0);
            setLoadingText(`Preparing ${agent.name}...`);

            await modelManager.loadModel((progress, text) => {
                setLoadingProgress(progress);
                setLoadingText(text);
            });

            setStatus('ready');

            // Generate personalized welcome message
            const personality = AGENT_PERSONALITIES.get(agent.name);
            const welcomeContent = personality?.responseTemplates.greeting[0] ||
                `Hello! I'm ${agent.name}, your ${agent.role.toLowerCase()}. Let's start learning together!`;

            const welcomeMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: welcomeContent,
                timestamp: new Date(),
                context: 'greeting'
            };

            setMessages([welcomeMessage]);

        } catch (err) {
            console.error('Failed to initialize agent:', err);
            setStatus('error');
        }
    };

    useEffect(() => {
        initializeAgent();
    }, [agent]);

    const sendMessage = async () => {
        if (!inputText.trim() || isGenerating || status !== 'ready') return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsGenerating(true);

        try {
            const response = await modelManager.generateResponse(
                agent.name,
                userMessage.content,
                conversationId
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Error generating response:', err);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Lo siento, I encountered an error. Please try again. Désolé pour ce problème technique.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <ChatOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
            <ChatContainer>
                <ChatHeader>
                    <HeaderInfo>
                        <Bot size={24} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {agent.name}
                                {AGENT_PERSONALITIES.get(agent.name)?.languageRules.useNativeInGreeting && (
                                    <Globe size={16} style={{ opacity: 0.8 }} />
                                )}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                                {agent.role} • {AGENT_PERSONALITIES.get(agent.name)?.nativeLanguage || 'English'} Teacher
                            </p>
                        </div>
                    </HeaderInfo>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <StatusBadge $status={status}>
                            {status === 'loading' && <Download size={16} />}
                            {status === 'ready' && <Check size={16} />}
                            {status === 'error' && <AlertCircle size={16} />}
                            {status === 'loading' && 'Loading'}
                            {status === 'ready' && 'Ready'}
                            {status === 'error' && 'Error'}
                        </StatusBadge>

                        <CloseButton onClick={onClose}>
                            <X size={20} />
                        </CloseButton>
                    </div>
                </ChatHeader>

                {status === 'loading' && (
                    <LoadingContainer>
                        <Cpu size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                            Loading {agent.name}
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                            {loadingText}
                        </p>
                        <ProgressBar>
                            <ProgressFill $progress={loadingProgress} />
                        </ProgressBar>
                        <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                            {loadingProgress}% complete
                        </p>
                    </LoadingContainer>
                )}

                {status === 'ready' && (
                    <>
                        <MessagesArea>
                            {messages.map((message) => (
                                <MessageBubble key={message.id} $isUser={message.role === 'user'}>
                                    {message.role === 'assistant' && (
                                        <Avatar $isUser={false}>
                                            <Bot size={16} />
                                        </Avatar>
                                    )}
                                    <MessageContent $isUser={message.role === 'user'}>
                                        {message.content}
                                        {message.role === 'assistant' && (
                                            <div style={{ position: 'absolute', top: '-8px', right: '-8px' }}>
                                                <OptimizedTextToSpeech
                                                    text={message.content}
                                                    agentId={agent.name}
                                                    autoPlay={true}
                                                />
                                            </div>
                                        )}
                                    </MessageContent>
                                    {message.role === 'user' && (
                                        <Avatar $isUser={true}>
                                            <User size={16} />
                                        </Avatar>
                                    )}
                                </MessageBubble>
                            ))}

                            {isGenerating && (
                                <TypingIndicator>
                                    <Bot size={16} />
                                    <span>{agent.name} is thinking</span>
                                    <TypingDots>
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
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Chat with ${agent.name}... (Press Enter to send)`}
                                    disabled={isGenerating}
                                />
                                <SendButton
                                    onClick={sendMessage}
                                    $disabled={!inputText.trim() || isGenerating}
                                    disabled={!inputText.trim() || isGenerating}
                                >
                                    <Send size={18} />
                                </SendButton>
                            </InputContainer>
                        </InputArea>
                    </>
                )}

                {status === 'error' && (
                    <LoadingContainer>
                        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                            Failed to load {agent.name}
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: '0.875rem' }}>
                            Please try again
                        </p>
                    </LoadingContainer>
                )}
            </ChatContainer>
        </ChatOverlay>
    );
};

/* ==========================
   OPTIMIZED STYLED COMPONENTS
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
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6, #7c3aed);
  color: white;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.div<{ $status: 'loading' | 'ready' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
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
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
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

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div<{ $isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: ${fadeInUp} 0.3s ease;
  align-self: ${({ $isUser }) => $isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
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

const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
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
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
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
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
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
export { OptimizedModelManager, MultilingualPromptEngine, AGENT_PERSONALITIES };