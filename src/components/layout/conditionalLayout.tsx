// src/components/layout/conditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header } from '@/components/misc/header';
import { Footer } from '@/components/misc/footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const isDashboard = pathname?.startsWith('/dashboard');
    const isAdmin = pathname?.startsWith('/admin');
    const isApiTest = pathname?.startsWith('/dashboard/api-test');
    setIsFullscreen(!!(isDashboard || isAdmin || isApiTest));
    setIsMounted(true);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header section */}
      {!isFullscreen && (
        isMounted ? (
          <Header title="LearnMorra" subtitle="Brag Responsibly" />
        ) : (
          <div className="h-[80px] bg-transparent" />
        )
      )}
      
      {/* Main content - flex-grow ensures it takes available space */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer section */}
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