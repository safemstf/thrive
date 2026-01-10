// src/components/layout/conditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/misc/header';
import { Footer } from '@/components/misc/footer';
import { MatrixProvider, useMatrix } from '@/hooks/useMatrix';
import { Code, Brush, BookOpen, FileText, Mail } from 'lucide-react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { isMatrixOn, setMatrixOn } = useMatrix();
  const autoToggledRef = useRef(false);

  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const isApiTest = pathname?.startsWith('/dashboard/api-test') ?? false;
  const isMatrixRoute = pathname?.startsWith('/simulations') ?? false;

  useEffect(() => {
    setIsFullscreen(Boolean(isDashboard || isAdmin || isApiTest));
  }, [isDashboard, isAdmin, isApiTest]);

  useEffect(() => {
    try {
      if (isMatrixRoute) {
        setMatrixOn(true);
        autoToggledRef.current = true;
      } else {
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

  useEffect(() => {
    if (isMatrixRoute && !isMatrixOn && autoToggledRef.current) {
      autoToggledRef.current = false;
    }
    if (!isMatrixRoute && isMatrixOn && !autoToggledRef.current) {
      autoToggledRef.current = false;
    }
  }, [isMatrixOn, isMatrixRoute]);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Header with full sidebar config */}
      {!isFullscreen && (
        <Header
          title="LearnMorra"
          subtitle="Brag Responsibly"
          withSidebar={true}
          sidebarConfig={{
            user: {
              name: "Guest User",
              email: "guest@learnmorra.com",
              role: "visitor"
            },
            dataStatus: {
              type: 'dev',
              label: 'Development'
            },
            portfolio: {
              kind: 'hybrid',
              title: 'Portfolio'
            },
            portfolioSections: [
              {
                id: 'home',
                title: 'Home',
                href: '/',
                icon: <BookOpen size={16} />,
                types: []
              },
              {
                id: 'thrive',
                title: 'Assessments',
                href: '/thrive',
                icon: <Brush size={16} />,
                types: []
              },
              {
                id: 'simulations',
                title: 'Simulations',
                href: '/simulations',
                icon: <Code size={16} />,
                types: []
              },
              {
                id: 'taco',
                title: 'Talk Oh—Taco',
                href: '/talkohtaco',
                icon: <Mail size={16} />,
                types: []
              },
              {
                id: 'homerank',
                title: 'Home Rank',
                href: '/homerank',
                icon: <FileText size={16} />,
                types: []
              }
            ]
          }}
        />
      )}

      <div className="flex-grow relative">
        {children}
      </div>

      {!isFullscreen && <Footer />}
    </div>
  );
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <MatrixProvider>
      <LayoutInner>{children}</LayoutInner>
    </MatrixProvider>
  );
}