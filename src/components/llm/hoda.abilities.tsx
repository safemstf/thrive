// src/components/llm/hoda.abilities.tsx - Clean Web Navigation Abilities
'use client';

/* ==========================
   CORE ABILITY TYPES
   ========================== */

export interface HodaAbility {
    id: string;
    name: string;
    description: string;
    category: AbilityCategory;
    execute: (params: AbilityParams) => Promise<AbilityResult>;
    canExecute: (context: PageContext) => boolean;
    voiceCommands: string[];
}

export type AbilityCategory = 'navigation' | 'content' | 'interaction' | 'system';

export interface AbilityParams {
    query?: string;
    target?: string;
    options?: Record<string, any>;
    context?: PageContext;
}

export interface AbilityResult {
    success: boolean;
    message: string;
    speechText?: string;
    data?: any;
    focusTarget?: Element;
    nextSuggestions?: string[];
}

export interface PageContext {
    pathname: string;
    title: string;
    hasSearch: boolean;
    hasNavigation: boolean;
    hasForms: boolean;
    landmarks: Landmark[];
    headings: HeadingInfo[];
    interactiveElements: InteractiveElement[];
    currentFocus?: Element;
}

export interface Landmark {
    type: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary';
    element: Element;
    label?: string;
}

export interface HeadingInfo {
    level: number;
    text: string;
    element: Element;
}

export interface InteractiveElement {
    type: 'button' | 'link' | 'input' | 'select' | 'textarea';
    element: Element;
    label?: string;
}

/* ==========================
   PAGE CONTEXT ANALYZER (SIMPLE)
   ========================== */

export class PageContextAnalyzer {
    static analyze(): PageContext {
        return {
            pathname: typeof window !== 'undefined' ? window.location.pathname : '',
            title: document.title || 'Unknown Page',
            hasSearch: !!document.querySelector('input[type="search"], [role="search"]'),
            hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
            hasForms: !!document.querySelector('form, input, textarea, select'),
            landmarks: this.findLandmarks(),
            headings: this.findHeadings(),
            interactiveElements: this.findInteractiveElements(),
            currentFocus: document.activeElement || undefined
        };
    }

    private static findLandmarks(): Landmark[] {
        const landmarks: Landmark[] = [];
        const selectors = {
            main: 'main, [role="main"]',
            navigation: 'nav, [role="navigation"]',
            banner: 'header, [role="banner"]',
            contentinfo: 'footer, [role="contentinfo"]',
            complementary: 'aside, [role="complementary"]'
        };

        Object.entries(selectors).forEach(([type, selector]) => {
            document.querySelectorAll(selector).forEach(element => {
                landmarks.push({
                    type: type as Landmark['type'],
                    element,
                    label: element.getAttribute('aria-label') || undefined
                });
            });
        });

        return landmarks;
    }

    private static findHeadings(): HeadingInfo[] {
        const headings: HeadingInfo[] = [];
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(element => {
            const level = parseInt(element.tagName.charAt(1));
            headings.push({
                level,
                text: element.textContent?.trim() || '',
                element
            });
        });
        return headings;
    }

    private static findInteractiveElements(): InteractiveElement[] {
        const elements: InteractiveElement[] = [];
        const selectors = [
            'button', 'a[href]', 'input', 'select', 'textarea',
            '[role="button"]', '[role="link"]', '[tabindex]:not([tabindex="-1"])'
        ];

        document.querySelectorAll(selectors.join(', ')).forEach(element => {
            const tagName = element.tagName.toLowerCase();
            let elementType: InteractiveElement['type'] = 'button';

            if (tagName === 'a') elementType = 'link';
            else if (tagName === 'input') elementType = 'input';
            else if (tagName === 'select') elementType = 'select';
            else if (tagName === 'textarea') elementType = 'textarea';

            elements.push({
                type: elementType,
                element,
                label: this.getElementLabel(element)
            });
        });

        return elements;
    }

    private static getElementLabel(element: Element): string {
        return element.getAttribute('aria-label') ||
            element.textContent?.trim() ||
            element.getAttribute('title') ||
            element.getAttribute('alt') ||
            'Unlabeled element';
    }
}

/* ==========================
   CORE NAVIGATION ABILITIES
   ========================== */

export class CoreNavigationAbilities {
    // Navigate to landmark
    static async navigateToLandmark(params: AbilityParams): Promise<AbilityResult> {
        const context = params.context || PageContextAnalyzer.analyze();
        const landmarkType = params.query?.toLowerCase();

        const landmark = context.landmarks.find(l =>
            l.type === landmarkType ||
            l.type.includes(landmarkType || '') ||
            l.label?.toLowerCase().includes(landmarkType || '')
        );

        if (landmark) {
            landmark.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            (landmark.element as HTMLElement).focus();

            return {
                success: true,
                message: `Navigated to ${landmark.type}`,
                speechText: `Now at ${landmark.label || landmark.type}`,
                focusTarget: landmark.element,
                nextSuggestions: ['read content', 'list headings', 'find links']
            };
        }

        return {
            success: false,
            message: `${landmarkType} not found`,
            speechText: `I couldn't find ${landmarkType} on this page`,
            nextSuggestions: context.landmarks.map(l => `go to ${l.type}`)
        };
    }

    // Jump to heading
    static async jumpToHeading(params: AbilityParams): Promise<AbilityResult> {
        const context = params.context || PageContextAnalyzer.analyze();
        const query = params.query?.toLowerCase() || '';

        const heading = context.headings.find(h =>
            h.text.toLowerCase().includes(query)
        );

        if (heading) {
            heading.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            (heading.element as HTMLElement).focus();

            return {
                success: true,
                message: `Jumped to: ${heading.text}`,
                speechText: `Now at heading: ${heading.text}`,
                focusTarget: heading.element,
                nextSuggestions: ['read content', 'next heading', 'previous heading']
            };
        }

        return {
            success: false,
            message: `Heading "${query}" not found`,
            speechText: `No heading containing "${query}" found`,
            nextSuggestions: context.headings.slice(0, 3).map(h => h.text)
        };
    }

    // Read page summary
    static async readPageSummary(params: AbilityParams): Promise<AbilityResult> {
        const context = params.context || PageContextAnalyzer.analyze();

        let summary = `Page: ${context.title}. `;
        summary += `${context.headings.length} headings, `;
        summary += `${context.interactiveElements.filter(e => e.type === 'link').length} links, `;
        summary += `${context.interactiveElements.filter(e => e.type === 'button').length} buttons. `;

        if (context.landmarks.length > 0) {
            summary += `Landmarks: ${context.landmarks.map(l => l.type).join(', ')}.`;
        }

        return {
            success: true,
            message: summary,
            speechText: summary,
            data: { context },
            nextSuggestions: ['list headings', 'go to main', 'find search']
        };
    }

    // List headings
    static async listHeadings(params: AbilityParams): Promise<AbilityResult> {
        const context = params.context || PageContextAnalyzer.analyze();

        if (context.headings.length === 0) {
            return {
                success: false,
                message: 'No headings found',
                speechText: 'This page has no headings',
                nextSuggestions: ['read page content', 'find links']
            };
        }

        const headingsList = context.headings
            .slice(0, 10)
            .map(h => `Level ${h.level}: ${h.text}`)
            .join('. ');

        return {
            success: true,
            message: `Headings: ${headingsList}`,
            speechText: `Found ${context.headings.length} headings. ${headingsList}`,
            data: { headings: context.headings },
            nextSuggestions: context.headings.slice(0, 3).map(h => `go to ${h.text}`)
        };
    }

    // Find and focus element
    static async findAndFocus(params: AbilityParams): Promise<AbilityResult> {
        const query = params.query?.toLowerCase() || '';
        const target = params.target || 'any';

        let selector = '';
        switch (target) {
            case 'button':
                selector = 'button, [role="button"], input[type="button"], input[type="submit"]';
                break;
            case 'link':
                selector = 'a[href]';
                break;
            case 'search':
                selector = 'input[type="search"], [role="search"], input[placeholder*="search" i]';
                break;
            default:
                selector = 'button, a[href], input, textarea, select, [role="button"]';
        }

        const elements = Array.from(document.querySelectorAll(selector));
        const matchingElement = elements.find(el => {
            const text = el.textContent?.toLowerCase() || '';
            const label = el.getAttribute('aria-label')?.toLowerCase() || '';
            const placeholder = el.getAttribute('placeholder')?.toLowerCase() || '';
            return text.includes(query) || label.includes(query) || placeholder.includes(query);
        });

        if (matchingElement) {
            matchingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (matchingElement as HTMLElement).focus();

            const elementLabel = PageContextAnalyzer['getElementLabel'](matchingElement);

            return {
                success: true,
                message: `Found: ${elementLabel}`,
                speechText: `Focused on ${elementLabel}`,
                focusTarget: matchingElement,
                nextSuggestions: ['activate', 'read description']
            };
        }

        return {
            success: false,
            message: `"${query}" not found`,
            speechText: `I couldn't find "${query}"`,
            nextSuggestions: ['try different search', 'list all buttons', 'page summary']
        };
    }

    // Read current element
    static async readCurrentElement(params: AbilityParams): Promise<AbilityResult> {
        const currentElement = params.context?.currentFocus || document.activeElement;

        if (!currentElement || currentElement === document.body) {
            return {
                success: false,
                message: 'Nothing focused',
                speechText: 'No element is currently focused',
                nextSuggestions: ['find something', 'go to main']
            };
        }

        const elementLabel = PageContextAnalyzer['getElementLabel'](currentElement);
        const tagName = currentElement.tagName.toLowerCase();

        return {
            success: true,
            message: `Current: ${elementLabel}`,
            speechText: `Current ${tagName}: ${elementLabel}`,
            data: { element: currentElement },
            nextSuggestions: ['activate', 'next element', 'previous element']
        };
    }

    // Get all abilities
    static getAbilities(): HodaAbility[] {
        return [
            {
                id: 'navigate-landmark',
                name: 'Navigate to Landmark',
                description: 'Jump to page landmarks like main, navigation, header',
                category: 'navigation',
                execute: this.navigateToLandmark,
                canExecute: (context) => context.landmarks.length > 0,
                voiceCommands: ['go to main', 'go to navigation', 'go to header', 'go to footer']
            },
            {
                id: 'jump-heading',
                name: 'Jump to Heading',
                description: 'Navigate to a specific heading',
                category: 'navigation',
                execute: this.jumpToHeading,
                canExecute: (context) => context.headings.length > 0,
                voiceCommands: ['go to heading', 'jump to', 'find heading']
            },
            {
                id: 'page-summary',
                name: 'Page Summary',
                description: 'Get an overview of the page structure',
                category: 'content',
                execute: this.readPageSummary,
                canExecute: () => true,
                voiceCommands: ['page summary', 'describe page', 'what\'s on this page']
            },
            {
                id: 'list-headings',
                name: 'List Headings',
                description: 'Read all headings on the page',
                category: 'content',
                execute: this.listHeadings,
                canExecute: (context) => context.headings.length > 0,
                voiceCommands: ['list headings', 'show headings', 'page outline']
            },
            {
                id: 'find-focus',
                name: 'Find and Focus',
                description: 'Search for and focus on elements',
                category: 'interaction',
                execute: this.findAndFocus,
                canExecute: () => true,
                voiceCommands: ['find button', 'find link', 'find search', 'locate']
            },
            {
                id: 'read-current',
                name: 'Read Current Element',
                description: 'Describe the currently focused element',
                category: 'content',
                execute: this.readCurrentElement,
                canExecute: () => true,
                voiceCommands: ['read current', 'describe this', 'what am i on']
            }
        ];
    }
}

/* ==========================
   SIMPLE HODA CONTROLLER
   ========================== */

export class HodaController {
    private abilities: HodaAbility[];
    private currentContext: PageContext;

    constructor() {
        this.abilities = CoreNavigationAbilities.getAbilities();
        this.currentContext = PageContextAnalyzer.analyze();
    }

    async executeCommand(command: string): Promise<AbilityResult> {
        this.updateContext();

        // Find matching ability
        const ability = this.abilities.find(a =>
            a.voiceCommands.some(cmd =>
                command.toLowerCase().includes(cmd.toLowerCase())
            ) || a.id === command
        );

        if (!ability) {
            return {
                success: false,
                message: 'Command not recognized',
                speechText: 'I didn\'t understand that command. Try "page summary" or "list headings".',
                nextSuggestions: ['page summary', 'list headings', 'go to main']
            };
        }

        if (!ability.canExecute(this.currentContext)) {
            return {
                success: false,
                message: `${ability.name} not available`,
                speechText: `${ability.name} is not available on this page`,
                nextSuggestions: ['page summary', 'find search']
            };
        }

        try {
            return await ability.execute({
                query: command,
                context: this.currentContext
            });
        } catch (error) {
            console.error('Command failed:', error);
            return {
                success: false,
                message: 'Command failed',
                speechText: 'Sorry, something went wrong',
                nextSuggestions: ['try again', 'page summary']
            };
        }
    }

    getAvailableCommands(): string[] {
        const availableAbilities = this.abilities.filter(a =>
            a.canExecute(this.currentContext)
        );
        return availableAbilities.flatMap(a => a.voiceCommands);
    }

    getAllAbilities(): HodaAbility[] {
        return this.abilities;
    }

    updateContext(): void {
        this.currentContext = PageContextAnalyzer.analyze();
    }
}

export default HodaController;