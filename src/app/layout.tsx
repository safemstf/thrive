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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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


        <style
          dangerouslySetInnerHTML={{
            __html: `
      /* ==========================================
         Z-INDEX HIERARCHY (GLOBAL REFERENCE)
         ========================================== */
      /*
        0-999:     Normal content layers
        1000:      Header (sticky)
        1001-1099: Header components
        5000:      Taskbar/Bottom Navigation (MOBILE)
        9000-9999: Global overlays (HODA)
        10000+:    Critical UI (modals, mobile menu)
      */

      /* Base scroll strategy */
      html, body {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      #app-wrapper {
        min-height: 100%;
        position: relative;
        overflow-x: hidden;
      }

      #main-content {
        min-height: 100dvh;
        position: relative;
        z-index: 1;
      }

      /* ==========================================
         SCROLL LOCK (Managed by ConditionalLayout)
         ========================================== */
      
      /* ConditionalLayout handles scroll lock via .scroll-locked class */
      /* Do NOT add body.modal-open styles here - handled in component */

      /* ==========================================
         HODA INTEGRATION (z-index: 9999)
         ========================================== */
      .hoda-overlay {
        pointer-events: none;
        z-index: 9999;
      }

      .hoda-overlay > * {
        pointer-events: auto;
      }

      /* ==========================================
         TASKBAR PROTECTION (z-index: 5000)
         ========================================== */
      
      /* Ensure taskbar is always accessible */
      [data-taskbar],
      .taskbar,
      .bottom-navigation {
        z-index: 5000 !important;
      }

      /* Modal overlays above taskbar but allow interaction */
      [role="dialog"],
      .modal-overlay {
        z-index: 10000;
      }

      /* Sidebar below modals but above taskbar */
      .sidebar-overlay {
        z-index: 9500;
      }

      /* ==========================================
         MOBILE OPTIMIZATIONS
         ========================================== */
      @media (max-width: 768px) {
        /* Prevent zoom on input focus */
        input, select, textarea {
          font-size: 16px !important;
        }

        /* Safe area support */
        @supports (padding: max(0px)) {
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Prevent overscroll */
        body {
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
        }

        /* Reserve space for taskbar */
        #main-content {
          padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
        }
      }

      /* ==========================================
         ACCESSIBILITY
         ========================================== */
      @media (prefers-reduced-motion: reduce) {
        .hoda-overlay *,
        .n-body-simulation *,
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }

      /* ==========================================
         PERFORMANCE OPTIMIZATIONS
         ========================================== */
      
      /* GPU acceleration for fixed/sticky elements */
      header,
      .hoda-overlay,
      [class*="mobile-menu"],
      [class*="sidebar"],
      [data-taskbar],
      .taskbar {
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      /* Smooth scrolling for modern browsers */
      @media (prefers-reduced-motion: no-preference) {
        html {
          scroll-behavior: smooth;
        }
      }

      /* Hide content during initial load */
      body:not(.loaded) {
        visibility: hidden;
        opacity: 0;
      }

      body.loaded {
        visibility: visible;
        opacity: 1;
        transition: opacity 0.15s ease;
      }
    `,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <div id="app-wrapper">
          <GlobalStyles />

          <Providers>
            <ApiProvider>
              <AuthProvider>
                <ApiConnectionManager>
                  <ConditionalLayout>
                    {/* Single main content wrapper - no duplicates */}
                    <main id="main-content">{children}</main>
                  </ConditionalLayout>

                  {/* HODA at z-index: 9999 */}
                  <HodaWrapper className="hoda-overlay" />
                </ApiConnectionManager>
              </AuthProvider>
            </ApiProvider>
          </Providers>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  requestAnimationFrame(function() {
                    if (document.body) {
                      document.body.classList.add('loaded');
                    }
                  });
                } catch (e) {
                  document.body && document.body.classList.add('loaded');
                }
              })();
            `,
          }}
        />

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