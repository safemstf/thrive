// src/components/misc/taskbar.logic.tsx

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/authProvider';

// Types
export interface NavLink {
    href: string;
    label: string;
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    hideWhenAuth?: boolean;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    href: string;
}

interface PortfolioSection {
    id: string;
    title: string;
    href: string;
    icon: React.ReactNode;
    types: string[];
}

export interface SidebarConfig {
    user?: {
        name: string;
        email: string;
        role?: string;
    };
    portfolio?: {
        kind: string;
        title?: string;
    };
    quickActions?: QuickAction[];
    portfolioSections?: PortfolioSection[];
    dataStatus?: {
        type: 'dev' | 'offline' | 'live';
        label: string;
    };
    onLogout?: () => void;
    onSettingsClick?: () => void;
}

export interface TaskbarProps {
    isMobile?: boolean;
    onNavigate?: () => void;
    isScrolled?: boolean;
    withSidebar?: boolean;
    sidebarConfig?: SidebarConfig;
}

// Matrix hook safety wrapper
function useMatrixSafe() {
    try {
        // If you have a matrix hook, import it here
        // return useMatrix();
        return {
            isMatrixOn: false,
            setMatrixOn: (value: boolean) => { },
            isHydrated: true
        };
    } catch (error) {
        return {
            isMatrixOn: false,
            setMatrixOn: (value: boolean) => { },
            isHydrated: true
        };
    }
}

// Nav links factory
const getNavLinks = (isAuthenticated: boolean, isAdmin: boolean): NavLink[] => {
    const links: NavLink[] = [
        { href: '/', label: 'Home' },
        { href: '/thrive', label: 'Assessments' },
        { href: '/simulations', label: 'Simulations' },
        { href: '/talkohtaco', label: "Talk Oh—Taco" },
        { href: '/homerank', label: "Home Rank" },
        
    ];

    if (!isAuthenticated) {
        links.push({ href: '/login', label: 'Login', hideWhenAuth: true });
    }

    return links;
};

// Helper functions
export const getPortfolioTypeColor = (type?: string): string => {
    const types: Record<string, string> = {
        creative: '#8b5cf6',
        educational: '#3b82f6',
        professional: '#059669',
        hybrid: '#10b981'
    };
    return types[type || ''] || '#666666';
};

export const getPortfolioTypeLabel = (type?: string): string => {
    const types: Record<string, string> = {
        creative: 'Creative',
        educational: 'Teaching',
        professional: 'Tech',
        hybrid: 'Multi-Faceted'
    };
    return types[type || ''] || 'Portfolio';
};

export const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
};

// Main logic hook
export function useTaskbarLogic({
    isMobile = false,
    onNavigate,
    isScrolled = false,
    withSidebar = false,
    sidebarConfig = {}
}: TaskbarProps) {
    // Core hooks
    const pathname = usePathname();
    const { user, logout, loading } = useAuth();
    const { setMatrixOn } = useMatrixSafe();

    // State
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

    // Refs
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);

    // Derived state
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const navLinks = useMemo(() => getNavLinks(isAuthenticated, isAdmin), [isAuthenticated, isAdmin]);
    const isDashboardPage = pathname.startsWith('/dashboard');

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    // Handle sidebar escape key and body scroll lock
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSidebarVisible(false);
                setDropdownOpen(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth > 1024 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)) {
                setSidebarVisible(false);
            }
        };

        if (sidebarVisible) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);

            // ADD THE CLASS - this is what was missing!
            document.body.classList.add('sidebar-open');
        } else {
            // REMOVE THE CLASS
            document.body.classList.remove('sidebar-open');
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            // Clean up on unmount
            document.body.classList.remove('sidebar-open');
        };
    }, [sidebarVisible]);
    // Event handlers
    const handleLogout = useCallback(async () => {
        try {
            setDropdownOpen(false);
            setSidebarVisible(false);
            await logout();
            if (onNavigate) onNavigate();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout, onNavigate]);

    const handleNavClick = useCallback(() => {
        if (onNavigate) onNavigate();
    }, [onNavigate]);

    const toggleSidebar = useCallback(() => setSidebarVisible(prev => !prev), []);
    const closeSidebar = useCallback(() => setSidebarVisible(false), []);

    const handleNavLinkClick = useCallback((href: string) => {
        if (href === '/simulations') setMatrixOn(true);
        else setMatrixOn(false);
        handleNavClick();
    }, [setMatrixOn, handleNavClick]);

    return {
        // State
        pathname,
        user,
        loading,
        dropdownOpen,
        sidebarVisible,

        // Derived state
        isAuthenticated,
        isAdmin,
        navLinks,
        isDashboardPage,

        // Refs
        dropdownRef,
        sidebarRef,

        // Setters
        setDropdownOpen,
        setSidebarVisible,

        // Event handlers
        handleLogout,
        handleNavClick,
        handleNavLinkClick,
        toggleSidebar,
        closeSidebar,

        // Props passthrough
        isMobile,
        isScrolled,
        withSidebar,
        sidebarConfig
    };
}