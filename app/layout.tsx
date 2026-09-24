import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import "./globals.css";

import { ConvexClientProvider } from "./ConvexClientProvider";
import { ToastProvider } from "@/components/ui/toast";
import { SEOHead } from "@/components/SEOHead";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { ChatWidget } from "@/components/chat/ChatWidget";

import { getToken } from "@/lib/auth-server";

const fontSans = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Linksys Fiber Networks — Fast & Reliable Internet in Molo",

  description:
    "Linksys is a trusted internet service provider in Molo offering fast, reliable, and affordable fiber and Wi-Fi for homes and businesses.",

  metadataBase: new URL("https://linksysmolo.com"),

  openGraph: {
    title: "Linksys Fiber Networks — Fast & Reliable Internet in Molo",
    description:
      "Fast, reliable, and affordable fiber internet for homes and businesses in Molo, Nakuru County.",
    type: "website",
    locale: "en_KE",
  },

  twitter: {
    card: "summary_large_image",
    title: "Linksys Fiber Networks — Molo",
    description:
      "Fast, reliable, and affordable fiber internet for homes and businesses in Molo.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * Get the Better Auth token on the server.
   *
   * This token is passed into ConvexBetterAuthProvider
   * so Convex knows about the existing Better Auth session.
   */
  const token = await getToken();

  return (
    <html
      lang="en"
      className={`${fontSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="relative m-0 min-h-screen max-w-full overflow-x-clip p-0">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundPattern />

          <ConvexClientProvider initialToken={token}>
            <ToastProvider>
              <SEOHead />

              {children}

              <ChatWidget />
            </ToastProvider>
          </ConvexClientProvider>

          {process.env.NODE_ENV === "production" && (
            <Analytics />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}