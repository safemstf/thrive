// src/components/llm/hoda.tsx - HODA Coordination Hub with WebLLM
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Avatar, { type AssistantStatus, type DanceMove } from './hoda.avatar';
import HodaController, { type AbilityResult } from './hoda.abilities';
import HodaHelpPanel from './hoda.help';

// Enhanced AI capabilities - WebLLM as primary system
import {
    ModelManager,
    PromptEngine,
    CHAT_AGENT_PERSONALITIES,
    type Message,
    type AgentPersonality
} from './webLLM';

// Import all components from consolidated styles
import {
    Container,
    StatusMessage,
} from './hoda.styles';

/* ==========================
   EMBEDDED PANEL STYLES
   ========================== */

const PanelRoot = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const VoiceRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.875rem 1rem;
    background: linear-gradient(135deg, #f5f3ff, #ede9fe);
    border-bottom: 1px solid rgba(99,102,241,0.12);
`;

const VoiceInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const VoiceName = styled.div`
    font-size: 0.8rem;
    font-weight: 700;
    color: #4338ca;
    letter-spacing: 0.03em;
`;

const VoiceStatus = styled.div<{ $active: boolean }>`
    font-size: 0.75rem;
    color: ${({ $active }) => $active ? '#059669' : '#6b7280'};
    margin-top: 1px;
    transition: color 0.2s;
`;

const MicBtn = styled.button<{ $listening: boolean }>`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
    font-size: 1rem;

    background: ${({ $listening }) =>
        $listening
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #6366f1, #4f46e5)'
    };
    box-shadow: ${({ $listening }) =>
        $listening
            ? '0 0 0 3px rgba(239,68,68,0.25)'
            : '0 2px 8px rgba(99,102,241,0.35)'
    };
    color: white;

    &:hover { transform: scale(1.08); }
    &:active { transform: scale(0.94); }
`;

const ripple = keyframes`
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(2.2); opacity: 0;   }
`;

const MicRipple = styled.div`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #ef4444;
    animation: ${ripple} 1.2s ease-out infinite;
    pointer-events: none;
`;

const ResponseArea = styled.div`
    padding: 0.75rem 1rem;
    min-height: 56px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
`;

const ResponseBubble = styled.div`
    flex: 1;
    padding: 0.6rem 0.75rem;
    background: rgba(59,130,246,0.07);
    border: 1px solid rgba(59,130,246,0.15);
    border-radius: 10px;
    font-size: 0.82rem;
    line-height: 1.55;
    color: #1e3a5f;
`;

const ResponsePlaceholder = styled.div`
    flex: 1;
    padding: 0.6rem 0.75rem;
    font-size: 0.8rem;
    color: #9ca3af;
    font-style: italic;
`;

const StopBtn = styled.button`
    background: none;
    border: 1px solid #fca5a5;
    color: #ef4444;
    border-radius: 5px;
    padding: 3px 7px;
    font-size: 0.72rem;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
    transition: background 0.15s;

    &:hover { background: #fef2f2; }
`;

const SuggestSection = styled.div`
    padding: 0.625rem 1rem 0.75rem;
    flex: 1;
`;

const SuggestLabel = styled.div`
    font-size: 0.7rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
`;

const SuggestGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
`;

const SuggestBtn = styled.button`
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    font-size: 0.75rem;
    color: #374151;
    text-align: left;
    cursor: pointer;
    line-height: 1.3;
    transition: all 0.13s;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &:hover {
        background: #ede9fe;
        border-color: #c4b5fd;
        color: #4338ca;
    }
    &:active { transform: scale(0.97); }
`;

const PanelFooter = styled.div`
    padding: 0.5rem 1rem;
    background: #f9fafb;
    border-top: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const FooterHint = styled.div`
    font-size: 0.7rem;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 0.375rem;
`;

const Kbd = styled.kbd`
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 0.65rem;
    font-family: monospace;
    color: #374151;
`;

/* Chat history */
const ChatHistory = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 120px;
    max-height: 240px;

    scrollbar-width: thin;
    scrollbar-color: rgba(99,102,241,0.25) transparent;
    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 3px; }
`;

const EmptyChat = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    color: #d1d5db;
    font-style: italic;
    padding: 1rem 0;
`;

const UserMsg = styled.div`
    align-self: flex-end;
    max-width: 82%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    border-radius: 14px 14px 3px 14px;
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
    line-height: 1.45;
    word-break: break-word;
`;

const HodaMsgBubble = styled.div`
    align-self: flex-start;
    max-width: 86%;
    background: rgba(59,130,246,0.07);
    border: 1px solid rgba(59,130,246,0.18);
    border-radius: 14px 14px 14px 3px;
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
    line-height: 1.45;
    color: #1e3a5f;
    word-break: break-word;
`;

/* Suggestion chips */
const SuggestRow = styled.div`
    display: flex;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    overflow-x: auto;
    border-top: 1px solid rgba(0,0,0,0.05);

    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`;

const SuggestChip = styled.button`
    flex-shrink: 0;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 0.3rem 0.65rem;
    font-size: 0.73rem;
    color: #374151;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.13s;
    display: flex;
    align-items: center;
    gap: 0.3rem;

    &:hover {
        background: #ede9fe;
        border-color: #c4b5fd;
        color: #4338ca;
    }
    &:active { transform: scale(0.96); }
    &:disabled { opacity: 0.45; cursor: default; }
`;

/* Text input row */
const InputRow = styled.form`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    background: #f9fafb;
    border-top: 1px solid rgba(0,0,0,0.06);
`;

const InputField = styled.input`
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 0.45rem 0.85rem;
    font-size: 0.8rem;
    color: #111827;
    background: #fff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-width: 0;

    &::placeholder { color: #9ca3af; }
    &:focus {
        border-color: #a5b4fc;
        box-shadow: 0 0 0 2px rgba(99,102,241,0.15);
    }
`;

const SendBtn = styled.button`
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.13s;
    box-shadow: 0 2px 6px rgba(99,102,241,0.3);

    &:hover:not(:disabled) { transform: scale(1.08); }
    &:active:not(:disabled) { transform: scale(0.94); }
    &:disabled { opacity: 0.4; cursor: default; box-shadow: none; }
`;

/* ==========================
   COORDINATION HUB INTERFACE
   ========================== */

interface HodaHubProps {
    onStatusChange?: (status: AssistantStatus) => void;
    className?: string;
    position?: 'fixed' | 'embedded';
    autoStart?: boolean;
}

interface HodaMessage {
    id: string;
    role: 'user' | 'hoda';
    text: string;
}

interface HodaHubState {
    status: AssistantStatus;
    isReady: boolean;
    currentSpeech: string | null;
    showHelp: boolean;
    lastCommand: string | null;
    aiModelLoaded: boolean;
    conversationMode: boolean;
    messages: HodaMessage[];
}

/* ==========================
   SPEECH RECOGNITION UTILITY
   ========================== */

class SpeechManager {
    private recognition: any = null;
    private isSupported: boolean = false;
    private isListening: boolean = false;
    private callbacks: {
        onStart?: () => void;
        onEnd?: () => void;
        onResult?: (transcript: string) => void;
        onError?: (error: string) => void;
    } = {};

    constructor() {
        this.initialize();
    }

    private initialize() {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.isSupported = true;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.callbacks.onStart?.();
            };
            this.recognition.onend = () => {
                this.isListening = false;
                this.callbacks.onEnd?.();
            };
            this.recognition.onerror = (event: any) => {
                this.isListening = false;
                this.callbacks.onError?.(event.error);
            };
            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                this.callbacks.onResult?.(transcript);
            };
        }
    }

    public setCallbacks(callbacks: typeof this.callbacks) {
        this.callbacks = callbacks;
    }

    public start(): boolean {
        if (!this.isSupported || !this.recognition || this.isListening) return false;

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            this.callbacks.onError?.('Failed to start speech recognition');
            return false;
        }
    }

    public stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    public getIsSupported(): boolean {
        return this.isSupported;
    }

    public getIsListening(): boolean {
        return this.isListening;
    }
}

/* ==========================
   MAIN HODA HUB COMPONENT
   ========================== */

const HodaHub: React.FC<HodaHubProps> = ({
    onStatusChange,
    className,
    position = 'fixed',
    autoStart = false
}) => {
    const [state, setState] = useState<HodaHubState>({
        status: 'idle',
        isReady: false,
        currentSpeech: null,
        showHelp: false,
        lastCommand: null,
        aiModelLoaded: false,
        conversationMode: false,
        messages: []
    });

    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const speechManagerRef = useRef<SpeechManager | null>(null);
    const controllerRef = useRef<HodaController | null>(null);
    const modelManagerRef = useRef<ModelManager | null>(null);
    const conversationIdRef = useRef<string>(`hoda-${Date.now()}`);
    const [isClient, setIsClient] = useState(false);

    // Mirror status in a ref so speech callbacks always read the current value
    // without needing to recreate them on every status change
    const statusRef = useRef<AssistantStatus>('idle');

    // Handle hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Keep statusRef in sync
    useEffect(() => {
        statusRef.current = state.status;
    }, [state.status]);

    // Initialize after hydration — runs once
    useEffect(() => {
        if (!isClient) return;

        const initializeHoda = async () => {
            try {
                speechManagerRef.current = new SpeechManager();
                controllerRef.current = new HodaController();
                // Don't load the AI model yet — defer until user sends a message
                modelManagerRef.current = ModelManager.getInstance();

                // Use statusRef in callbacks to avoid stale closures
                speechManagerRef.current.setCallbacks({
                    onStart: () => updateStatus('listening'),
                    onEnd: () => {
                        if (statusRef.current === 'listening') {
                            updateStatus('idle');
                        }
                    },
                    onResult: handleVoiceInput,
                    onError: (error) => {
                        console.error('Speech error:', error);
                        updateStatus('error');
                        setTimeout(() => updateStatus('idle'), 2000);
                    }
                });

                setState(prev => ({ ...prev, isReady: true }));

                if (autoStart && speechManagerRef.current.getIsSupported()) {
                    setTimeout(() => speechManagerRef.current?.start(), 500);
                }

            } catch (error) {
                console.error('Failed to initialize HODA:', error);
                updateStatus('error');
            }
        };

        initializeHoda();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isClient]); // intentionally omits autoStart — only run once on mount

    // Load AI model on first user interaction — not on mount
    const loadAIModelAsync = async () => {
        if (!modelManagerRef.current || state.aiModelLoaded) return;

        try {
            await modelManagerRef.current.loadModel((progress, text) => {
                console.log(`AI Model: ${progress}% - ${text}`);
            });
            setState(prev => ({ ...prev, aiModelLoaded: true }));
        } catch (error) {
            console.error('Failed to load AI model — will use fallback commands:', error);
        }
    };

    // Append a message to the conversation history
    const appendMessage = (role: 'user' | 'hoda', text: string) => {
        setState(prev => ({
            ...prev,
            messages: [...prev.messages, { id: `${Date.now()}-${role}`, role, text }]
        }));
    };

    // Auto-scroll chat to bottom whenever messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [state.messages]);

    // Context-aware suggestions based on current path
    const getPageSuggestions = (): { icon: string; label: string }[] => {
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path.includes('/assessments')) return [
            { icon: '📊', label: 'Tell me about this assessment' },
            { icon: '🎯', label: 'How do I start?' },
            { icon: '📖', label: 'What do my results mean?' },
            { icon: '🧭', label: 'Go to main content' },
        ];
        if (path.includes('/thrive')) return [
            { icon: '🧠', label: 'What assessments are available?' },
            { icon: '🎯', label: 'How does scoring work?' },
            { icon: '📋', label: "What's on this page?" },
            { icon: '🧭', label: 'Go to main content' },
        ];
        if (path.includes('/dashboard')) return [
            { icon: '📋', label: "What can I do here?" },
            { icon: '🧭', label: 'Find navigation menu' },
            { icon: '🔍', label: 'Find the search box' },
            { icon: '📊', label: "What's on this page?" },
        ];
        return [
            { icon: '🔍', label: "What's on this page?" },
            { icon: '🧭', label: 'Go to main content' },
            { icon: '📋', label: 'List all headings' },
            { icon: '🔗', label: 'Find the search box' },
        ];
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (!isClient) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Space to talk (only if not in input field)
            if (e.code === 'Space' && !e.altKey && !e.ctrlKey && !e.metaKey) {
                const activeElement = document.activeElement as HTMLElement;
                const isInputField = activeElement?.tagName === 'INPUT' ||
                    activeElement?.tagName === 'TEXTAREA' ||
                    activeElement?.contentEditable === 'true';

                if (!isInputField) {
                    e.preventDefault();
                    handleToggleListening();
                }
            }

            // Alt+H for help
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setState(prev => ({ ...prev, showHelp: !prev.showHelp }));
            }

            // Escape to cancel
            if (e.key === 'Escape') {
                if (speechManagerRef.current?.getIsListening()) {
                    speechManagerRef.current.stop();
                } else if (state.currentSpeech) {
                    handleStopSpeech();
                } else if (state.showHelp) {
                    setState(prev => ({ ...prev, showHelp: false }));
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isClient, state.showHelp, state.currentSpeech]);

    const updateStatus = (newStatus: AssistantStatus) => {
        setState(prev => ({ ...prev, status: newStatus }));
        onStatusChange?.(newStatus);
    };

    const handleToggleListening = () => {
        if (!speechManagerRef.current || !state.isReady) return;

        if (speechManagerRef.current.getIsListening()) {
            speechManagerRef.current.stop();
        } else {
            speechManagerRef.current.start();
        }
    };

    // Enhanced voice input handling - AI first, then fallback to traditional commands
    const handleVoiceInput = async (transcript: string) => {
        if (!transcript.trim()) return;

        updateStatus('processing');
        setState(prev => ({ ...prev, lastCommand: transcript }));
        appendMessage('user', transcript);

        try {
            // Lazily kick off model load on first real interaction
            if (!state.aiModelLoaded) {
                loadAIModelAsync();
            }

            // Primary: Try AI conversation if model is loaded
            if (state.aiModelLoaded && modelManagerRef.current) {
                const aiResponse = await handleAIConversation(transcript);
                if (aiResponse) return;
            }

            // Fallback: Try traditional command execution
            if (controllerRef.current) {
                const result = await controllerRef.current.executeCommand(transcript);

                if (result.success && result.speechText) {
                    updateStatus('speaking');
                    const speechText = result.speechText || result.message || null;
                    setState(prev => ({ ...prev, currentSpeech: speechText }));
                    if (speechText) appendMessage('hoda', speechText);

                    if (result.focusTarget) {
                        (result.focusTarget as HTMLElement).focus();
                    }
                    return;
                }
            }

            // Last resort: Generic help message
            const fallback = "I didn't quite catch that. Try asking \"What's on this page?\" or click one of the suggestions below.";
            updateStatus('speaking');
            setState(prev => ({ ...prev, currentSpeech: fallback }));
            appendMessage('hoda', fallback);

        } catch (error) {
            console.error('Voice input processing failed:', error);
            updateStatus('error');
            setTimeout(() => updateStatus('idle'), 2000);
        }
    };

    const handleAIConversation = async (transcript: string): Promise<boolean> => {
        if (!modelManagerRef.current) return false;

        try {
            // Create contextual prompt about the current page
            const pageContext = analyzeCurrentPage();
            const contextualPrompt = createContextualPrompt(transcript, pageContext);

            const response = await modelManagerRef.current.generateResponse(
                'HODA',
                contextualPrompt,
                conversationIdRef.current
            );

            if (response) {
                updateStatus('speaking');
                setState(prev => ({
                    ...prev,
                    currentSpeech: response,
                    conversationMode: true
                }));
                appendMessage('hoda', response);
                return true;
            }
        } catch (error) {
            console.error('AI conversation failed:', error);
        }

        return false;
    };

    const analyzeCurrentPage = () => {
        // Analyze current page for context
        const url = window.location.href;
        const title = document.title;
        const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
            .map(h => h.textContent?.trim())
            .filter(Boolean)
            .slice(0, 5);
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'))
            .map(b => b.textContent?.trim() || b.getAttribute('aria-label'))
            .filter(Boolean)
            .slice(0, 10);
        const links = Array.from(document.querySelectorAll('a[href]'))
            .map(a => a.textContent?.trim())
            .filter(Boolean)
            .slice(0, 10);
        const forms = Array.from(document.querySelectorAll('form'))
            .map(f => f.getAttribute('action') || 'form')
            .slice(0, 3);

        return {
            url,
            title,
            headings,
            buttons,
            links,
            forms,
            hasSearch: !!document.querySelector('input[type="search"], [role="search"]'),
            hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
            hasMain: !!document.querySelector('main, [role="main"]')
        };
    };

    const createContextualPrompt = (userInput: string, pageContext: any) => {
        return `You are HODA, a helpful voice assistant for web navigation. You're currently helping someone on a webpage.

Current page context:
- URL: ${pageContext.url}
- Title: ${pageContext.title}
- Main headings: ${pageContext.headings.join(', ')}
- Available buttons: ${pageContext.buttons.join(', ')}
- Navigation links: ${pageContext.links.join(', ')}
- Forms: ${pageContext.forms.join(', ')}
- Has search: ${pageContext.hasSearch}
- Has navigation: ${pageContext.hasNavigation}

User said: "${userInput}"

Respond helpfully and conversationally. If they're asking about page navigation, website features, or need help finding something, provide specific guidance based on what's actually available on this page. Keep responses concise (1-2 sentences) and actionable. If you suggest clicking something, make sure it exists in the context above.

If they're asking general questions not related to navigation, be helpful but guide them back to what you can do to help with this website.`;
    };

    const handleSpeechComplete = () => {
        setState(prev => ({ ...prev, currentSpeech: null }));
        updateStatus('idle');
    };

    const handleStopSpeech = () => {
        // Stop browser speech synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setState(prev => ({ ...prev, currentSpeech: null }));
        updateStatus('idle');
    };

    // Integrated speech synthesis with natural voice selection
    const playAISpeech = (text: string) => {
        if (!('speechSynthesis' in window)) {
            setTimeout(handleSpeechComplete, 3000);
            return;
        }

        window.speechSynthesis.cancel(); // stop any ongoing speech first

        const speak = (voices: SpeechSynthesisVoice[]) => {
            const utterance = new SpeechSynthesisUtterance(text);

            // Prefer high-quality natural voices; fall back gracefully
            const preferred = voices.find(v =>
                v.lang.startsWith('en') && (
                    v.name.includes('Samantha') ||   // macOS
                    v.name.includes('Karen') ||       // macOS AU
                    v.name.includes('Daniel') ||      // macOS UK
                    v.name.includes('Google') ||      // Chrome
                    v.name.includes('Natural') ||
                    v.name.includes('Neural')
                )
            ) || voices.find(v => v.lang.startsWith('en') && v.localService)
              || voices.find(v => v.lang.startsWith('en'))
              || voices[0];

            if (preferred) utterance.voice = preferred;
            utterance.rate   = 0.92;
            utterance.pitch  = 1.05;
            utterance.volume = 0.88;
            utterance.onend  = handleSpeechComplete;
            utterance.onerror = handleSpeechComplete;
            window.speechSynthesis.speak(utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
            speak(voices);
        } else {
            // Voices load async on first call in some browsers
            window.speechSynthesis.onvoiceschanged = () => {
                speak(window.speechSynthesis.getVoices());
            };
        }
    };

    // Auto-play speech when currentSpeech changes
    useEffect(() => {
        if (state.currentSpeech) {
            playAISpeech(state.currentSpeech);
        }
    }, [state.currentSpeech]);

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = inputText.trim();
        if (!text) return;
        setInputText('');
        await handleVoiceInput(text);
    };

    const handleExecuteCommand = async (command: string) => {
        setState(prev => ({ ...prev, showHelp: false }));
        await handleVoiceInput(command);
    };

    // Get appropriate dance move based on status
    const getDanceMove = (): DanceMove => {
        switch (state.status) {
            case 'listening': return 'pulse';
            case 'processing': return 'shimmer';
            case 'speaking': return 'glow';
            default: return 'none';
        }
    };

    // Don't render until client-side to avoid hydration issues
    if (!isClient) {
        return (
            <Container className={className} $position={position}>
                <Avatar
                    size={64}
                    status="idle"
                    danceMove="none"
                    showStatusIndicator={false}
                    professionalMode={true}
                    reduceMotion={true}
                />
            </Container>
        );
    }

    const isSupported = speechManagerRef.current?.getIsSupported() ?? false;

    // Embedded mode — self-contained inline panel, no fixed overlays
    if (position === 'embedded') {
        const voiceSupported = speechManagerRef.current?.getIsSupported() ?? false;
        const isListening = state.status === 'listening';
        const isBusy = state.status === 'processing' || state.status === 'listening';

        const statusText = !voiceSupported
            ? 'Type below to chat'
            : isListening                   ? '🎙 Listening…'
            : state.status === 'processing' ? '⏳ Processing…'
            : state.status === 'speaking'   ? '🔊 Speaking…'
            : state.status === 'error'      ? '⚠️ Something went wrong'
            : 'Ask me anything · tap 🎙 or type below';

        const suggestions = getPageSuggestions();

        return (
            <PanelRoot className={className}>

                {/* ── Voice control row ─────────────────── */}
                <VoiceRow>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar
                            size={40}
                            status={state.status}
                            danceMove={getDanceMove()}
                            showStatusIndicator={false}
                            professionalMode={true}
                        />
                    </div>

                    <VoiceInfo>
                        <VoiceName>HODA</VoiceName>
                        <VoiceStatus $active={isListening || state.status === 'speaking'}>
                            {statusText}
                        </VoiceStatus>
                    </VoiceInfo>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {state.status === 'speaking' && (
                            <StopBtn onClick={handleStopSpeech} aria-label="Stop speech">
                                ⏹ Stop
                            </StopBtn>
                        )}
                        {voiceSupported && (
                            <div style={{ position: 'relative' }}>
                                {isListening && <MicRipple />}
                                <MicBtn
                                    $listening={isListening}
                                    onClick={handleToggleListening}
                                    aria-label={isListening ? 'Stop listening' : 'Start speaking'}
                                    title={isListening ? 'Stop' : 'Speak'}
                                >
                                    {isListening ? '⏹' : '🎙'}
                                </MicBtn>
                            </div>
                        )}
                    </div>
                </VoiceRow>

                {/* ── Chat history ──────────────────────── */}
                <ChatHistory>
                    {state.messages.length === 0 ? (
                        <EmptyChat>Start a conversation below</EmptyChat>
                    ) : (
                        state.messages.map(msg =>
                            msg.role === 'user'
                                ? <UserMsg key={msg.id}>{msg.text}</UserMsg>
                                : <HodaMsgBubble key={msg.id}>{msg.text}</HodaMsgBubble>
                        )
                    )}
                    <div ref={chatEndRef} />
                </ChatHistory>

                {/* ── Contextual suggestion chips ───────── */}
                <SuggestRow>
                    {suggestions.map(s => (
                        <SuggestChip
                            key={s.label}
                            onClick={() => handleExecuteCommand(s.label)}
                            disabled={isBusy}
                            title={s.label}
                        >
                            <span>{s.icon}</span>
                            {s.label}
                        </SuggestChip>
                    ))}
                </SuggestRow>

                {/* ── Text input row ────────────────────── */}
                <InputRow onSubmit={handleTextSubmit}>
                    <InputField
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Type a message…"
                        disabled={isBusy}
                        aria-label="Message HODA"
                        autoComplete="off"
                    />
                    <SendBtn
                        type="submit"
                        disabled={!inputText.trim() || isBusy}
                        aria-label="Send"
                        title="Send"
                    >
                        ↑
                    </SendBtn>
                </InputRow>

                {/* ── Footer ────────────────────────────── */}
                <PanelFooter>
                    <FooterHint>
                        {voiceSupported && <><Kbd>Space</Kbd> to talk&nbsp;·&nbsp;</>}
                        <Kbd>Esc</Kbd> to stop
                    </FooterHint>
                    <FooterHint>
                        {state.aiModelLoaded ? '🧠 AI' : '⚡ Basic'} mode
                    </FooterHint>
                </PanelFooter>

            </PanelRoot>
        );
    }

    // When not embedded (standalone mode), show the avatar
    return (
        <Container className={className} $position={position}>
            <Avatar
                size={64}
                status={state.status}
                danceMove={getDanceMove()}
                showStatusIndicator={true}
                onClick={handleToggleListening}
                professionalMode={true}
                ariaLabel={`HODA Voice Assistant. Status: ${state.status}. ${isSupported ? 'Click to start listening' : 'Speech not supported'}`}
            />

            {!isSupported && (
                <StatusMessage>
                    Speech recognition not supported in this browser
                </StatusMessage>
            )}

            {state.status === 'error' && (
                <StatusMessage>
                    Something went wrong. Try again.
                </StatusMessage>
            )}

            {/* AI Response Display */}
            {state.currentSpeech && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '20px',
                    right: '20px',
                    background: 'rgba(59, 130, 246, 0.95)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9999,
                    maxWidth: '500px',
                    margin: '0 auto',
                    textAlign: 'center',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                        {state.aiModelLoaded ? 'HODA AI:' : 'HODA:'}
                    </div>
                    {state.currentSpeech}
                    <button
                        onClick={handleStopSpeech}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                        }}
                        aria-label="Stop speech"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Help Panel with WebLLM Integration */}
            <HodaHelpPanel
                isOpen={state.showHelp}
                onClose={() => setState(prev => ({ ...prev, showHelp: false }))}
                hodaController={controllerRef.current}
                onExecuteCommand={handleExecuteCommand}
            />
        </Container>
    );
};

export default HodaHub;
export type { HodaHubProps, HodaHubState };