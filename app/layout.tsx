import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Roboto } from "next/font/google";
import './globals.css'
import { ConvexClientProvider } from './ConvexClientProvider'
import { ToastProvider } from '@/components/ui/toast'
import { SEOHead } from '@/components/SEOHead'
import { ThemeProvider } from '@/components/theme-provider'

import { BackgroundPattern } from '@/components/BackgroundPattern'
import { ChatWidget } from '@/components/chat/ChatWidget'

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: 'Linksys Fiber Networks — Fast & Reliable Internet in Molo',
  description: 'Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable fiber and Wi-Fi for homes and businesses.',
  metadataBase: new URL('https://linksysmolo.com'),
  openGraph: {
    title: 'Linksys Fiber Networks — Fast & Reliable Internet in Molo',
    description: 'Fast, reliable, and affordable fiber internet for homes and businesses in Molo, Nakuru County.',
    type: 'website',
    locale: 'en_KE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linksys Fiber Networks — Molo',
    description: 'Fast, reliable, and affordable fiber internet for homes and businesses in Molo.',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontSans.variable} antialiased`} suppressHydrationWarning>
      <body className="m-0 p-0 relative min-h-screen max-w-full overflow-x-clip">
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BackgroundPattern />
            <ConvexClientProvider>
              <ToastProvider>
                <SEOHead />
                {children}
                <ChatWidget />
              </ToastProvider>
            </ConvexClientProvider>
            {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
