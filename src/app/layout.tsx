// app/layout.tsx - Layout with Proper Z-Index Hierarchy
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ogImage from '../../public/assets/logo3.jpeg';
import './globals.css';

import { ApiConnectionManager } from '@/components/apiConnectionManager';
import { ApiProvider } from '@/providers/apiProvider';
import { Providers } from '@/providers/providers';
import { AuthProvider } from '@/providers/authProvider';
import { ConditionalLayout } from '@/components/layout/conditionalLayout';
import { GlobalStyles } from '@/styles/theme';
import { HodaWrapper } from '@/components/llm/hoda.wrapper';
import Script from 'next/script';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: 'Brag Responsibly | learnmorra.com',
    template: '%s | learnmorra.com',
  },
  description: 'Connecting people to knowledge and resources through accessible portfolio management',
  keywords: ['portfolio', 'learning', 'education', 'accessible', 'creative', 'professional'],
  authors: [{ name: 'LearnMorra Team' }],
  creator: 'LearnMorra',
  publisher: 'LearnMorra',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.learnmorra.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Learn More Everyday – learnmorra.com',
    description: 'Connecting people to knowledge and resources through accessible portfolio management',
    url: 'https://www.learnmorra.com/',
    siteName: 'learnmorra.com',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
        alt: 'LearnMorra.com - Brag Responsibly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn More Everyday – learnmorra.com',
    description: 'Connecting people to knowledge and resources',
    images: [ogImage.src],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://api.learnmorra.com" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        {/* removed large inline style — moved to globals.css */}
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <div id="app-wrapper">
          <GlobalStyles />
          <Providers>
            <ApiProvider>
              <AuthProvider>
                <ApiConnectionManager>
                  <ConditionalLayout>
                    <main id="main-content">{children}</main>
                  </ConditionalLayout>
                  <HodaWrapper className="hoda-overlay" />
                </ApiConnectionManager>
              </AuthProvider>
            </ApiProvider>
          </Providers>
        </div>

        {/* small runtime script: set .loaded once JS runs. Use next/script */}
        <Script id="init-loaded" strategy="afterInteractive">
          {`(function() {
            try {
              requestAnimationFrame(function() {
                if (document.body) document.body.classList.add('loaded');
              });
            } catch (e) {
              document.body && document.body.classList.add('loaded');
            }
          })();`}
        </Script>

        <noscript>
          <style>{`body { visibility: visible !important; opacity: 1 !important; }`}</style>
        </noscript>

        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Analytics scripts */}
          </>
        )}
      </body>
    </html>
  );
}