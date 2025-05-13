// app/layout.tsx
import type { Metadata }      from "next"
import { Geist, Geist_Mono }  from "next/font/google"
import ogImage                 from "../../public/assets/og-preview.png"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title:       "Accessible Education Hub | learnmorra.com",
  description: "Connecting people to knowledge and resources",
  openGraph: {
    title:       "Learn More Everyday – learnmorra.com",
    description: "Connecting people to knowledge and resources",
    url:         "https://www.learnmorra.com/",
    siteName:    "learnmorra.com",
    locale:      "en_US",
    type:        "website",
    // simply pass the StaticImageData
 images: [
      {
        url:    ogImage.src,    // <-- use .src here
        width:  ogImage.width,  // <-- Next infers these for you too
        height: ogImage.height,
        alt:    "A preview image for LearnMorra.com",
      }, ], },

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
