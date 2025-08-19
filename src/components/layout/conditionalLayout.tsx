// src/components/layout/conditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/misc/header';
import { Footer } from '@/components/misc/footer';
import { MatrixProvider, useMatrix } from '@/hooks/useMatrix';
import { MatrixRain } from '@/app/simulations/matrixStyling';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * LayoutInner runs inside MatrixProvider so it can call useMatrix()
 * to toggle matrix state automatically based on the current pathname.
 */
function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // read matrix state + setter from the provider
  const { isMatrixOn, setMatrixOn } = useMatrix();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    // determine "fullscreen" routes as before
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAdmin = pathname?.startsWith('/admin');
    const isApiTest = pathname?.startsWith('/dashboard/api-test');
    setIsFullscreen(!!(isDashboard || isAdmin || isApiTest));
  }, [pathname]);

  useEffect(() => {
    // Consider the Matrix page as any route under /simulations
    const isMatrixRoute = pathname?.startsWith('/simulations') ?? false;

    // Auto-enable when landing on /simulations, disable otherwise.
    // This ensures header/footer style updates even if user navigates directly
    // by URL (bookmark / reload), or via client-side navigation.
    try {
      setMatrixOn(Boolean(isMatrixRoute));
    } catch (err) {
      // If for any reason setMatrixOn is not callable, swallow error.
      // MatrixProvider should exist because this LayoutInner is rendered inside it.
      // But this keeps things robust in dev.
      // eslint-disable-next-line no-console
      console.warn('Matrix toggle failed', err);
    }
  }, [pathname, setMatrixOn]);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Render MatrixRain canvas behind UI when enabled */}
      {isMatrixOn && (
        <MatrixRain
          fontSize={14}
          layers={2}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      {!isFullscreen && (
        isMounted ? (
          <Header title="LearnMorra" subtitle="Brag Responsibly" />
        ) : (
          <div className="h-[80px] bg-transparent" />
        )
      )}

      {/* Main */}
      <main id="main-content" className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      {!isFullscreen && (
        isMounted ? (
          <Footer />
        ) : (
          <div className="h-[60px] bg-transparent" />
        )
      )}
    </div>
  );
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  // Wrap the app in the provider so any component (Header/Footer/Taskbar) can read the matrix state
  return (
    <MatrixProvider>
      <LayoutInner>{children}</LayoutInner>
    </MatrixProvider>
  );
}
