// src\components\llm\chat.tsx
'use client';

import * as webllm from '@mlc-ai/web-llm';
import { LanguageDetector } from './textToSpeech';

/* ==========================
   CORE TYPES
   ========================== */

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    language?: string;
    context?: 'greeting' | 'teaching' | 'correction' | 'encouragement' | 'explanation';
    audioPlayed?: boolean;
}

export interface WebLLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AgentPersonality {
    id: string;
    name: string;
    role: string;
    nativeLanguage: string;
    teachingStyle: string;
    greeting: string;
    bilingualResponses: boolean;
    primaryLanguage: string;
    baseConfig: {
        lang: string;
        rate: number;
        pitch: number;
        volume: number;
        gender?: 'male' | 'female';
    };
}

/* ==========================
   AGENT PERSONALITIES
   ========================== */

export const CHAT_AGENT_PERSONALITIES = new Map<string, AgentPersonality>([
    ['Lexi', {
        id: 'Lexi',
        name: 'Lexi',
        role: 'Arabic Teacher',
        nativeLanguage: 'Arabic',
        primaryLanguage: 'ar-SA',
        teachingStyle: 'friendly and encouraging, explaining Arabic concepts in simple English with examples',
        greeting: "مرحباً! I'm Lexi, your Arabic teacher. Let's explore the beautiful Arabic language together!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'ar-SA',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        }
    }],
    ['Adam', {
        id: 'Adam',
        name: 'Adam',
        role: 'Arabic Teacher',
        nativeLanguage: 'Arabic',
        primaryLanguage: 'ar-SA',
        teachingStyle: 'calm and methodical, breaking down Arabic grammar step by step with cultural insights',
        greeting: "مرحباً! أنا آدم، مدرس العربية. I'm Adam, your Arabic teacher. Let's discover Arabic together!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'ar-SA',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        }
    }],
    ['Kai', {
        id: 'Kai',
        name: 'Kai',
        role: 'Spanish Teacher',
        nativeLanguage: 'Spanish',
        primaryLanguage: 'es-ES',
        teachingStyle: 'patient and methodical with emphasis on pronunciation',
        greeting: "¡Hola! Soy Kai, tu profesor de español. I'm excited to help you master Spanish!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'es-ES',
            rate: 1.0,
            pitch: 0.95,
            volume: 0.9,
            gender: 'male'
        }
    }],
    ['Lupita', {
        id: 'Lupita',
        name: 'Lupita',
        role: 'Spanish Teacher',
        nativeLanguage: 'Spanish',
        primaryLanguage: 'es-ES',
        teachingStyle: 'warm and expressive, focusing on conversational Spanish with cultural context',
        greeting: "¡Hola! Soy Lupita, tu profesora de español. ¡Qué gusto conocerte! Let's learn Spanish together!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'es-ES',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        }
    }],
    ['Sana', {
        id: 'Sana',
        name: 'Sana',
        role: 'French Teacher',
        nativeLanguage: 'French',
        primaryLanguage: 'fr-FR',
        teachingStyle: 'systematic and precise with focus on proper grammar',
        greeting: "Bonjour ! Je suis Sana, votre professeure de français. Let's begin your French journey!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'fr-FR',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.9,
            gender: 'female'
        }
    }],
    ['Vinz', {
        id: 'Vinz',
        name: 'Vinz',
        role: 'French Teacher',
        nativeLanguage: 'French',
        primaryLanguage: 'fr-FR',
        teachingStyle: 'casual and conversational, emphasizing practical French for real situations',
        greeting: "Bonjour ! Je suis Vinz, votre professeur de français. Enchanté! Let's explore French together.",
        bilingualResponses: true,
        baseConfig: {
            lang: 'fr-FR',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        }
    }],
    ['Mei', {
        id: 'Mei',
        name: 'Mei',
        role: 'Mandarin Teacher',
        nativeLanguage: 'Mandarin',
        primaryLanguage: 'zh-CN',
        teachingStyle: 'encouraging and patient with emphasis on tones',
        greeting: "你好！我是美美，你的中文老师。I'm Mei, excited to teach you Mandarin!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'zh-CN',
            rate: 0.9,
            pitch: 1.1,
            volume: 0.9,
            gender: 'female'
        }
    }],
    ['Wei', {
        id: 'Wei',
        name: 'Wei',
        role: 'Mandarin Teacher',
        nativeLanguage: 'Mandarin',
        primaryLanguage: 'zh-CN',
        teachingStyle: 'structured and thorough, focusing on character writing and pronunciation',
        greeting: "你好！我是伟，你的中文老师。I'm Wei, your Mandarin teacher. Let's master Chinese!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'zh-CN',
            rate: 0.9,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        }
    }],
    ['Giulia', {
        id: 'Giulia',
        name: 'Giulia',
        role: 'Italian Teacher',
        nativeLanguage: 'Italian',
        primaryLanguage: 'it-IT',
        teachingStyle: 'passionate and animated, bringing Italian culture alive through language',
        greeting: "Ciao! Sono Giulia, la tua insegnante di italiano. Benvenuti! Welcome to beautiful Italian!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'it-IT',
            rate: 1.0,
            pitch: 1.05,
            volume: 0.9,
            gender: 'female'
        }
    }],
    ['Marco', {
        id: 'Marco',
        name: 'Marco',
        role: 'Italian Teacher',
        nativeLanguage: 'Italian',
        primaryLanguage: 'it-IT',
        teachingStyle: 'practical and clear, focusing on useful Italian for travel and conversation',
        greeting: "Ciao! Sono Marco, il vostro insegnante di italiano. Andiamo! Let's learn Italian together!",
        bilingualResponses: true,
        baseConfig: {
            lang: 'it-IT',
            rate: 1.0,
            pitch: 0.9,
            volume: 0.9,
            gender: 'male'
        }
    }],
    // Special HODA personality for navigation
    ['HODA', {
        id: 'HODA',
        name: 'HODA',
        role: 'Navigation Assistant',
        nativeLanguage: 'English',
        primaryLanguage: 'en-US',
        teachingStyle: 'helpful and precise, providing clear navigation guidance',
        greeting: "مرحباً! I'm HODA, your navigation assistant. How can I help you navigate this page?",
        bilingualResponses: false,
        baseConfig: {
            lang: 'en-US',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.9,
            gender: 'female'
        }
    }]
]);

/* ==========================
   PROMPT ENGINE
   ========================== */

export class PromptEngine {
    static generateSystemPrompt(agentId: string): string {
        const personality = CHAT_AGENT_PERSONALITIES.get(agentId);
        if (!personality) {
            // Default system prompt for unknown agents
            return `You are a helpful AI assistant. Be concise, accurate, and helpful in your responses.`;
        }

        if (agentId === 'HODA') {
            return `You are HODA, a web navigation assistant designed to help users, especially those with visual impairments, navigate websites effectively.

Your primary functions:
- Provide clear, actionable navigation guidance
- Describe page structure and content
- Help users find and interact with page elements
- Offer step-by-step instructions for complex tasks
- Be patient, precise, and encouraging

Response style:
- Keep responses concise but informative
- Use clear, simple language
- Provide specific instructions when possible
- Offer alternatives when something isn't available
- Always prioritize accessibility and user independence

Remember: Your goal is to empower users to navigate independently and efficiently.`;
        }

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

        if (lower.match(/hello|hi|hey|greet|start|مرحبا|hola|bonjour|你好|ciao/)) return 'greeting';
        if (lower.match(/how do|what is|translate|mean|explain|why|grammar/)) return 'explanation';
        if (lower.match(/correct|wrong|mistake|check|pronunciation|better/)) return 'correction';
        if (lower.match(/difficult|hard|struggle|help|confused|don't understand/)) return 'encouragement';

        return 'teaching';
    }

    static generateContextualPrompt(message: string, context: Message['context'], agentId: string): string {
        const personality = CHAT_AGENT_PERSONALITIES.get(agentId);
        if (!personality) return message;

        if (agentId === 'HODA') {
            // HODA gets navigation-specific context
            return `User request: "${message}"

Please provide helpful navigation assistance. If this is about finding, clicking, or interacting with page elements, give specific guidance. If it's a general question, answer helpfully and offer to help with navigation.`;
        }

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
   MODEL MANAGER
   ========================== */

export class ModelManager {
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
                    temperature: agentId === 'HODA' ? 0.3 : 0.75, // Lower temperature for HODA (more precise)
                    max_tokens: agentId === 'HODA' ? 200 : 300, // Shorter responses for HODA
                    top_p: 0.9,
                    frequency_penalty: 0.1,
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

// Export singleton instance for easy access
export const modelManager = ModelManager.getInstance();