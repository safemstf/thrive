// src/components/layout/conditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/misc/header';
import { Footer } from '@/components/misc/footer';
import { MatrixProvider, useMatrix } from '@/hooks/useMatrix';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * LayoutInner runs inside MatrixProvider so it can call useMatrix()
 * to toggle matrix state automatically based on the current pathname.
 *
 * Important: Be careful not to always overwrite user toggles when pathname changes.
 * The logic below auto-enables when entering /simulations, and only auto-disables
 * if that enable was performed by this effect (i.e. it was "auto-enabled").
 */
function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // read matrix state + setter from the provider
  const { isMatrixOn, setMatrixOn } = useMatrix();

  // track whether the last change was performed automatically by this component
  // so we don't disable something the user intentionally enabled/disabled.
  const autoToggledRef = useRef(false);

  // compute route flags
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const isApiTest = pathname?.startsWith('/dashboard/api-test') ?? false;
  const isMatrixRoute = pathname?.startsWith('/simulations') ?? false;

  // update fullscreen status based on pathname
  useEffect(() => {
    setIsFullscreen(Boolean(isDashboard || isAdmin || isApiTest));
  }, [isDashboard, isAdmin, isApiTest]);

  // safe auto-toggle behavior:
  // - when entering /simulations: enable matrix and mark autoToggledRef = true
  // - when leaving /simulations: disable matrix ONLY if autoToggledRef === true
  // This prevents clobbering user toggles.
  useEffect(() => {
    try {
      if (isMatrixRoute) {
        // entering matrix route => auto-enable
        setMatrixOn(true);
        autoToggledRef.current = true;
      } else {
        // leaving matrix route => only auto-disable if we auto-enabled earlier
        if (autoToggledRef.current) {
          setMatrixOn(false);
          autoToggledRef.current = false;
        }
      }
    } catch (err) {
      console.warn('Matrix toggle failed', err);
      autoToggledRef.current = false;
    }
  }, [isMatrixRoute, setMatrixOn]);

  // If the user manually toggles while on the matrix route, clear the auto flag.
  // Example: we auto-enabled when entering /simulations, user clicks the taskbar to turn it off —
  // we should respect that and not auto-enable/disable on the next navigation unless re-entering the route.
  useEffect(() => {
    if (isMatrixRoute && !isMatrixOn && autoToggledRef.current) {
      // user turned it off manually
      autoToggledRef.current = false;
    }
    // If user manually turned it on while not auto-enabled, we should also clear auto flag
    // so leaving the route doesn't forcibly turn it off unexpectedly.
    if (!isMatrixRoute && isMatrixOn && !autoToggledRef.current) {
      // user manually enabled matrix on a non-simulations route; keep their preference
      // (we don't flip anything here, but record that it was user-controlled)
      autoToggledRef.current = false;
    }
  }, [isMatrixOn, isMatrixRoute]);

  return (
    <div className="flex flex-col min-h-screen relative">

      {/* Header - hidden on fullscreen-ish routes */}
      {!isFullscreen && <Header title="LearnMorra" subtitle="Brag Responsibly" />}

      {/* Main */}
      <main id="main-content" className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      {!isFullscreen && <Footer />}
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
