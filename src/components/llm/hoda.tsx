// src/components/llm/hoda.tsx - HODA Coordination Hub with WebLLM
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
   COORDINATION HUB INTERFACE
   ========================== */

interface HodaHubProps {
    onStatusChange?: (status: AssistantStatus) => void;
    className?: string;
    position?: 'fixed' | 'embedded';
    autoStart?: boolean;
}

interface HodaHubState {
    status: AssistantStatus;
    isReady: boolean;
    currentSpeech: string | null;
    showHelp: boolean;
    lastCommand: string | null;
    aiModelLoaded: boolean;
    conversationMode: boolean;
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
        conversationMode: false
    });

    const speechManagerRef = useRef<SpeechManager | null>(null);
    const controllerRef = useRef<HodaController | null>(null);
    const modelManagerRef = useRef<ModelManager | null>(null);
    const conversationIdRef = useRef<string>(`hoda-${Date.now()}`);
    const [isClient, setIsClient] = useState(false);

    // Handle hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize after hydration
    useEffect(() => {
        if (!isClient) return;

        const initializeHoda = async () => {
            try {
                // Initialize speech manager
                speechManagerRef.current = new SpeechManager();

                // Initialize traditional controller for fallback
                controllerRef.current = new HodaController();

                // Initialize AI model manager as primary system
                modelManagerRef.current = ModelManager.getInstance();

                // Setup speech callbacks
                speechManagerRef.current.setCallbacks({
                    onStart: () => updateStatus('listening'),
                    onEnd: () => {
                        if (state.status === 'listening') {
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

                // Load AI model asynchronously
                loadAIModelAsync();

                // Auto-start if requested (typically for embedded mode)
                if (autoStart && speechManagerRef.current.getIsSupported()) {
                    setTimeout(() => {
                        speechManagerRef.current?.start();
                    }, 500);
                }

            } catch (error) {
                console.error('Failed to initialize HODA:', error);
                updateStatus('error');
            }
        };

        initializeHoda();
    }, [isClient, autoStart]);

    // Load AI model asynchronously for enhanced responses
    const loadAIModelAsync = async () => {
        if (!modelManagerRef.current) return;

        try {
            await modelManagerRef.current.loadModel((progress, text) => {
                console.log(`AI Model loading: ${progress}% - ${text}`);
            });

            setState(prev => ({ ...prev, aiModelLoaded: true }));
            console.log('HODA AI model loaded successfully');
        } catch (error) {
            console.error('Failed to load AI model:', error);
            // Continue without AI - basic abilities still work
        }
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

        try {
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

                    if (result.focusTarget) {
                        (result.focusTarget as HTMLElement).focus();
                    }
                    return;
                }
            }

            // Last resort: Generic help message
            updateStatus('speaking');
            setState(prev => ({
                ...prev,
                currentSpeech: "I didn't understand that. Try saying 'help me' or ask a specific question about this page."
            }));

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

    // Integrated speech synthesis (replaces separate TTS component)
    const playAISpeech = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            utterance.onend = handleSpeechComplete;
            utterance.onerror = handleSpeechComplete;
            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback: just show text and auto-complete
            setTimeout(handleSpeechComplete, 3000);
        }
    };

    // Auto-play speech when currentSpeech changes
    useEffect(() => {
        if (state.currentSpeech) {
            playAISpeech(state.currentSpeech);
        }
    }, [state.currentSpeech]);

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

    // When embedded, show accessible help instead of another avatar
    if (position === 'embedded') {
        return (
            <Container className={className} $position={position}>
                <HodaHelpPanel
                    isOpen={true}
                    onClose={() => {
                        // Close the panel by telling parent wrapper to close
                        window.dispatchEvent(new CustomEvent('hoda-close-panel'));
                    }}
                    hodaController={controllerRef.current}
                    onExecuteCommand={handleExecuteCommand}
                    embedded={true}
                    accessibilityMode={true}
                />
            </Container>
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