// src/components/layout/conditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/misc/header';
import { Footer } from '@/components/misc/footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isApiTest = pathname?.startsWith('/dashboard/api-test');
  
  // Pages that shouldn't have header/footer (full app pages)
  const isFullscreen = isDashboard || isAdmin || isApiTest;

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      <Header title="LearnMorra" subtitle="Brag Responsibly" />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}