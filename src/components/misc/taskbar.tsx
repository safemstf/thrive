// src/components/Taskbar.tsx - Cleaned (No Dark Mode)
'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { LogOut, User } from 'lucide-react';

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

/* ---------- types ---------- */
export interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  hideWhenAuth?: boolean;
}

interface TaskbarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
  isScrolled?: boolean;
}

/* ---------- nav links factory ---------- */
const getNavLinks = (isAuthenticated: boolean, isAdmin: boolean): NavLink[] => {
  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/thrive', label: 'Thrive' },
    { href: '/simulations', label: 'The Matrix' },
  ];

  if (isAuthenticated) links.push({ href: '/dashboard', label: 'Dashboard', requiresAuth: true });
  if (!isAuthenticated) links.push({ href: '/login', label: 'Login', hideWhenAuth: true });

  return links;
};

/* ---------- styles ---------- */
const NavContainer = styled.nav<{ $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.$isScrolled ? 'flex-start' : 'space-between')};
  flex-wrap: wrap;
  gap: ${props => (props.$isScrolled ? '0.4rem' : '0.5rem')};
  max-width: 100%;
  padding-right: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;
`;

const NavButton = styled(Link) <{ $active?: boolean; $isScrolled?: boolean }>`
  background: none;
  border: 1px solid var(--color-primary-500);
  color: ${props => (props.$active ? 'var(--color-background-secondary)' : 'var(--color-primary-500)')};
  background-color: ${props => (props.$active ? 'var(--color-primary-500)' : 'transparent')};
  padding: ${props => (props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem')};
  font-size: ${props => (props.$isScrolled ? '0.9rem' : '1rem')};
  font-family: var(--font-body);
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--color-primary-500);
    color: var(--color-background-secondary);
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 840px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const UserSection = styled.div<{ $isScrolled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => (props.$isScrolled ? 'flex-start' : 'flex-end')};
  gap: ${props => (props.$isScrolled ? '0.5rem' : '0.75rem')};
  margin-left: ${props => (props.$isScrolled ? '0.5rem' : '1rem')};
  transition: all 0.3s ease;
`;

const UserInfo = styled.div<{ $isScrolled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: ${props => (props.$isScrolled ? '0.85rem' : '0.9rem')};
  padding: ${props => (props.$isScrolled ? '0.4rem 0.8rem' : '0.5rem 1rem')};
  background: var(--color-background-tertiary);
  border-radius: 20px;
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  @media (max-width: 840px) {
    span:not(.user-icon) {
      display: none;
    }
    padding: 0.5rem;
    background: transparent;
  }
`;

const UserIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-background-secondary);
  border-radius: 50%;

  @media (max-width: 840px) {
    width: 28px;
    height: 28px;
    background: var(--color-background-tertiary);
    border: 1px solid var(--color-border-medium);
  }
`;

const LogoutButton = styled.button<{ $isScrolled?: boolean }>`
  background: var(--color-background-secondary);
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: ${props => (props.$isScrolled ? '0.6rem 1.2rem' : '0.75rem 1.5rem')};
  font-size: ${props => (props.$isScrolled ? '0.9rem' : '1rem')};
  font-family: var(--font-body);
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-sm);

  &:hover {
    background: #dc2626;
    color: var(--color-background-secondary);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 1024px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 840px) {
    padding: 0.5rem;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    justify-content: center;

    span {
      display: none;
    }
  }
`;

/* Mobile components */
const MobileNavContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MobileNavButton = styled(Link) <{ $active?: boolean }>`
  background: var(--color-background-secondary);
  border: 1px solid ${props => (props.$active ? 'var(--color-primary-500)' : 'var(--color-border-medium)')};
  color: ${props => (props.$active ? 'var(--color-primary-500)' : 'var(--color-text-secondary)')};
  background-color: ${props => (props.$active ? 'var(--color-background-tertiary)' : 'var(--color-background-secondary)')};
  padding: 1rem 1.5rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: none;
  font-weight: ${props => (props.$active ? '400' : '300')};
  text-decoration: none;
  display: block;
  text-align: left;
  width: 100%;
  border-radius: var(--radius-lg);

  &:hover {
    border-color: var(--color-primary-500);
    background-color: var(--color-background-tertiary);
    color: var(--color-primary-500);
  }
`;

const MobileUserSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MobileUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.9rem;
`;

const MobileUserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: var(--color-background-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border-medium);
`;

const MobileLogoutButton = styled.button`
  background: var(--color-background-secondary);
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 0.875rem 1.5rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 300;
  width: 100%;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #dc2626;
    color: var(--color-background-secondary);
  }
`;

/* Debug components */
const DebugHandle = styled.button<{ $open: boolean }>`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 100000;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 180ms ease, background 120ms ease;
  transform: translateY(${p => (p.$open ? '-4px' : '0')});

  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
`;

const DebugPanel = styled.div<{ $open: boolean }>`
  position: fixed;
  z-index: 99999;
  width: 320px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 96px);
  overflow: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-secondary);
  box-shadow: var(--shadow-lg);
  transition: transform 200ms ease, opacity 160ms ease, left 200ms ease, top 200ms ease, right 200ms ease, bottom 200ms ease;

  ${p => !p.$open && `
    right: 16px;
    bottom: 64px;
    transform: translateY(8px);
    opacity: 0;
    pointer-events: none;
  `}

  ${p => p.$open && `
    left: 50%;
    top: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    opacity: 1;
    pointer-events: auto;
  `}

  font-family: var(--font-mono);
  font-size: 12px;

  @media (max-width: 480px) {
    ${p => p.$open ? `
      left: 12px;
      right: 12px;
      top: auto;
      bottom: 72px;
      transform: translateY(0);
      max-height: 45vh;
    ` : `
      left: 12px;
      right: 12px;
      bottom: 72px;
      transform: translateY(8px);
      opacity: 0;
      pointer-events: none;
    `}
  }
`;

const DebugContent = styled.div`
  padding: 12px;
  color: var(--color-text-primary);
`;

const DebugHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const DebugAction = styled.button`
  padding: 6px 8px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-medium);
  background: var(--color-background-tertiary);
  cursor: pointer;
`;

const KeyRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 0;
  border-top: 1px dashed var(--color-border-light);
  &:first-of-type { border-top: none; padding-top: 0; }
`;

/* ---------- Taskbar component ---------- */
export function Taskbar({ isMobile = false, onNavigate, isScrolled = false }: TaskbarProps) {
  // ✅ ALL HOOKS CALLED AT TOP LEVEL - ALWAYS THE SAME ORDER
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { setMatrixOn } = useMatrixSafe();
  const [debugOpen, setDebugOpen] = useState<boolean>(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [isClient, setIsClient] = useState(false);

  // ✅ ALL useEffects in consistent order
  useEffect(() => {
    setIsClient(true);
    // Initialize debug state from localStorage on client
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('taskbarDebug')) {
        setDebugOpen(true);
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    try {
      if (debugOpen) localStorage.setItem('taskbarDebug', '1');
      else localStorage.removeItem('taskbarDebug');
    } catch { }
  }, [debugOpen, isClient]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) return;
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [isClient]);

  // ✅ Memoized values (always computed)
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const navLinks = useMemo(() => getNavLinks(isAuthenticated, isAdmin), [isAuthenticated, isAdmin]);

  // ✅ Event handlers
  const handleLogout = async () => {
    try {
      await logout();
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  const copyDebug = async () => {
    const payload = {
      time: new Date().toISOString(),
      pathname,
      isScrolled,
      viewport: isClient ? viewport : { w: 0, h: 0 },
      user: user ? {
        id: user.id ?? null,
        name: user.name ?? user.username ?? null,
        email: user.email ?? null,
        role: user.role ?? null
      } : null,
      navLinks,
      isClient
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      } else {
        const ta = document.createElement('textarea');
        ta.value = JSON.stringify(payload, null, 2);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // ✅ Render logic (after all hooks)
  const shouldShowDebug = isClient && (process.env.NODE_ENV !== 'production' || debugOpen);

  /* ----------------- Mobile UI ----------------- */
  if (isMobile) {
    return (
      <>
        <MobileNavContainer>
          {navLinks.map(link => {
            if (link.requiresAuth && !isAuthenticated) return null;
            if (link.requiresAdmin && !isAdmin) return null;
            if (link.hideWhenAuth && isAuthenticated) return null;

            return (
              <MobileNavButton
                key={link.href}
                href={link.href}
                $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
                onClick={() => {
                  if (link.href === '/simulations') setMatrixOn(true);
                  else setMatrixOn(false);
                  handleNavClick();
                }}
              >
                {link.label}
              </MobileNavButton>
            );
          })}

          {isAuthenticated && user && (
            <MobileUserSection>
              <MobileUserInfo>
                <MobileUserAvatar>
                  <User size={20} color="var(--color-text-secondary)" />
                </MobileUserAvatar>
                <div>
                  <div style={{ fontWeight: 400, color: 'var(--color-text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>{user.email}</div>
                </div>
              </MobileUserInfo>
              <MobileLogoutButton onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </MobileLogoutButton>
            </MobileUserSection>
          )}
        </MobileNavContainer>

        {/* Debug UI */}
        {shouldShowDebug && (
          <>
            <DebugHandle $open={debugOpen} onClick={() => setDebugOpen(v => !v)}>
              {debugOpen ? 'X' : 'DBG'}
            </DebugHandle>
            <DebugPanel $open={debugOpen} aria-hidden={!debugOpen}>
              <DebugContent>
                <DebugHeaderRow>
                  <strong>Taskbar Debug</strong>
                  <div>
                    <DebugAction onClick={copyDebug}>Copy</DebugAction>
                    <DebugAction onClick={() => setDebugOpen(false)} style={{ marginLeft: 8 }}>Close</DebugAction>
                  </div>
                </DebugHeaderRow>

                <KeyRow><div>Path</div><div>{pathname}</div></KeyRow>
                <KeyRow><div>isScrolled</div><div>{String(isScrolled)}</div></KeyRow>
                <KeyRow><div>Viewport</div><div>{isClient ? `${viewport.w}×${viewport.h}` : 'loading...'}</div></KeyRow>
                <KeyRow><div>User</div><div>{user ? user.name : 'None'}</div></KeyRow>

                <div style={{ marginTop: 8 }}>
                  <details>
                    <summary>More</summary>
                    <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto' }}>
                      {isClient ? JSON.stringify({
                        user: user ? { name: user.name, email: user.email, role: user.role } : null,
                        navLinks
                      }, null, 2) : 'Loading debug info...'}
                    </pre>
                  </details>
                </div>
              </DebugContent>
            </DebugPanel>
          </>
        )}
      </>
    );
  }

  /* ----------------- Desktop UI ----------------- */
  return (
    <>
      <NavContainer className="taskbar" $isScrolled={isScrolled}>
        {navLinks.map(link => {
          if (link.requiresAuth && !isAuthenticated) return null;
          if (link.requiresAdmin && !isAdmin) return null;
          if (link.hideWhenAuth && isAuthenticated) return null;

          return (
            <NavButton
              key={link.href}
              href={link.href}
              $active={pathname === link.href || (link.href === '/dashboard' && pathname.startsWith('/dashboard'))}
              $isScrolled={isScrolled}
              onClick={() => {
                if (link.href === '/simulations') setMatrixOn(true);
                else setMatrixOn(false);
                handleNavClick();
              }}
            >
              {link.label}
            </NavButton>
          );
        })}

        {/* Debug UI */}
        {shouldShowDebug && (
          <>
            <DebugHandle $open={debugOpen} onClick={() => setDebugOpen(v => !v)}>
              {debugOpen ? 'X' : 'DBG'}
            </DebugHandle>

            <DebugPanel $open={debugOpen} aria-hidden={!debugOpen}>
              <DebugContent>
                <DebugHeaderRow>
                  <strong>Taskbar Debug</strong>
                  <div>
                    <DebugAction onClick={copyDebug}>Copy</DebugAction>
                    <DebugAction onClick={() => setDebugOpen(false)} style={{ marginLeft: 8 }}>Close</DebugAction>
                  </div>
                </DebugHeaderRow>

                <KeyRow><div>Path</div><div>{pathname}</div></KeyRow>
                <KeyRow><div>isScrolled</div><div>{String(isScrolled)}</div></KeyRow>
                <KeyRow><div>Viewport</div><div>{isClient ? `${viewport.w}×${viewport.h}` : 'loading...'}</div></KeyRow>
                <KeyRow><div>User</div><div>{user ? user.name : 'None'}</div></KeyRow>

                <div style={{ marginTop: 8 }}>
                  <details>
                    <summary>More</summary>
                    <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto' }}>
                      {JSON.stringify({
                        user: user ? { name: user.name, email: user.email, role: user.role } : null,
                        navLinks
                      }, null, 2)}
                    </pre>
                  </details>
                </div>
              </DebugContent>
            </DebugPanel>
          </>
        )}

        {isAuthenticated && user && (
          <UserSection $isScrolled={isScrolled}>
            <UserInfo $isScrolled={isScrolled}>
              <UserIcon className="user-icon">
                <User size={16} color="var(--color-text-secondary)" />
              </UserIcon>
              <span>{user.name}</span>
            </UserInfo>
            <LogoutButton onClick={handleLogout} $isScrolled={isScrolled}>
              <LogOut size={16} />
              <span>Logout</span>
            </LogoutButton>
          </UserSection>
        )}
      </NavContainer>
    </>
  );
}