// app/layout.tsx - Server-Safe Layout
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ogImage from '../../public/assets/logo3.jpeg';
import './globals.css';

// Import client components
import { ApiConnectionManager } from '@/components/apiConnectionManager';
import { ApiProvider } from '@/providers/apiProvider';
import { Providers } from '@/providers/providers';
import { AuthProvider } from '@/providers/authProvider';
import { ConditionalLayout } from '@/components/layout/conditionalLayout';
import { DarkModeProvider } from '@/providers/darkModeProvider';
import { ClientThemeProvider } from '@/providers/clientThemeProvider';

// Font setup (unchanged)
const geistSans = Geist({ 
  variable: '--font-geist-sans', 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono', 
  subsets: ['latin'],
  display: 'swap',
  preload: false
});

// ==============================================
// METADATA (Server Component)
// ==============================================

export const metadata: Metadata = {
  title: {
    default: 'Accessible Portfolio Hub | learnmorra.com',
    template: '%s | learnmorra.com'
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
        alt: 'LearnMorra.com - Accessible Portfolio Hub Preview',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// ==============================================
// Root Layout (Server Component)
// ==============================================

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="https://api.learnmorra.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Dark mode script - MUST run before body renders to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var darkMode = localStorage.getItem('dark-mode');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var shouldBeDark = darkMode ? darkMode === 'true' : prefersDark;
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.warn('Error setting initial dark mode:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        
        {/* Use your existing DarkModeProvider with the new ClientThemeProvider */}
        <DarkModeProvider>
          <ClientThemeProvider>
            <Providers>
              <ApiProvider>
                <AuthProvider>
                  <ApiConnectionManager>
                    <ConditionalLayout>
                      <main id="main-content">
                        {children}
                      </main>
                    </ConditionalLayout>
                  </ApiConnectionManager>
                </AuthProvider>
              </ApiProvider>
            </Providers>
          </ClientThemeProvider>
        </DarkModeProvider>

        {/* Analytics scripts would go here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics, etc. */}
          </>
        )}
      </body>
    </html>
  );
}