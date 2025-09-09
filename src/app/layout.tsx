// app/layout.tsx - Layout with HODA Integration
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ogImage from '../../public/assets/logo3.jpeg';
import './globals.css';

// Import client components (removed dark mode providers)
import { ApiConnectionManager } from '@/components/apiConnectionManager';
import { ApiProvider } from '@/providers/apiProvider';
import { Providers } from '@/providers/providers';
import { AuthProvider } from '@/providers/authProvider';
import { ConditionalLayout } from '@/components/layout/conditionalLayout';
import { GlobalStyles } from '@/styles/theme';

// Import HODA wrapper component
import { HodaWrapper } from '@/components/llm/hoda.wrapper';

// Font setup
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

// ==============================================
// METADATA (Server Component)
// ==============================================

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
  themeColor: '#ffffff', // Single theme color
};

// ==============================================
// Root Layout (Server Component)
// ==============================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.learnmorra.com" />

        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />

        {/* Simplified styles - no dark mode complexity */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Base scroll strategy: root (body) scrolls */
              html, body {
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              /* Single wrapper */
              #app-wrapper {
                min-height: 100%;
                position: relative;
                overflow-x: hidden;
              }

              /* Main content */
              #main-content {
                min-height: 100dvh;
              }

              /* Prevent scroll issues on mobile */
              .no-scroll {
                overflow: hidden !important;
              }

              /* Hide content briefly during initial load */
              body:not(.loaded) {
                visibility: hidden;
                opacity: 0;
              }

              body.loaded {
                visibility: visible;
                opacity: 1;
                transition: opacity 0.15s ease;
              }

              /* HODA Integration Styles */
              .hoda-overlay {
                pointer-events: none;
                z-index: 9999;
              }

              .hoda-overlay > * {
                pointer-events: auto;
              }

              /* Ensure HODA doesn't interfere with main content */
              #main-content {
                position: relative;
                z-index: 1;
              }

              /* Accessibility improvements for HODA */
              @media (prefers-reduced-motion: reduce) {
                .hoda-overlay * {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                }
              }

              /* Mobile responsiveness for HODA */
              @media (max-width: 768px) {
                .hoda-overlay {
                  /* Adjust positioning for mobile if needed */
                }
              }
            `,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {/* Single wrapper to control scrolling */}
        <div id="app-wrapper">
          {/* Apply GlobalStyles for your blue theme */}
          <GlobalStyles />

          <Providers>
            <ApiProvider>
              <AuthProvider>
                <ApiConnectionManager>
                  <ConditionalLayout>
                    <main id="main-content">{children}</main>
                  </ConditionalLayout>
                  
                  {/* HODA Voice Assistant - Floating position, globally available */}
                  <HodaWrapper className="hoda-overlay" />
                </ApiConnectionManager>
              </AuthProvider>
            </ApiProvider>
          </Providers>
        </div>

        {/* Simple load script - no dark mode complexity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Mark as loaded after a brief delay
                  requestAnimationFrame(function() {
                    if (document.body) {
                      document.body.classList.add('loaded');
                    }
                  });
                } catch (e) {
                  // Fallback
                  document.body && document.body.classList.add('loaded');
                }
              })();
            `,
          }}
        />

        {/* If JS is disabled, ensure content is visible */}
        <noscript>
          <style>{`body { visibility: visible !important; opacity: 1 !important; }`}</style>
        </noscript>

        {/* Analytics scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics, etc. */}
          </>
        )}
      </body>
    </html>
  );
}