// app/layout.tsx - Optimized version
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ogImage from '../../public/assets/og-preview.png';
import './globals.css';

import { ApiConnectionManager } from '@/components/apiConnectionManager';
import { ApiProvider } from '@/providers/apiProvider';
import { Providers } from '@/providers/providers';
import { AuthProvider } from '@/providers/authProvider';
import { ConditionalLayout } from '@/components/layout/conditionalLayout';

// Optimize font loading with display swap and preload
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
  preload: false // Secondary font doesn't need preload
});

// Enhanced metadata with better SEO
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
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

// Enhanced viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow users to zoom for accessibility
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning // Prevent hydration warnings for theme switching
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
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        
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