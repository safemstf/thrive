// app/layout.tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title:       "Accessible Education and Hub | learnmorra.com",
  description: "",
  openGraph: {
    title:       "Learn More Everyday – learnmorra.com",
    description: "Helping make education accessible to everyone and connecting people to resources.",
    url:         "https://www.learnmorra.com/",
    siteName:    "learnmorra.com",
    locale: "en_US",
    type:   "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
