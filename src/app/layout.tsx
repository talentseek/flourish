import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "../styles/globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Use system serif/mono fallbacks via CSS variables; avoid build-time Google fetches

export const metadata: Metadata = {
  title: "Flourish AI | Retail Property Intelligence & Gap Analysis",
  description: "AI-powered deep research and gap analysis for retail properties. Identify tenant mix opportunities, reduce vacancy rates, and unlock millions in hidden revenue across your portfolio.",
  keywords: ["retail property", "gap analysis", "tenant mix", "shopping centre management", "retail analytics", "AI retail", "property intelligence"],
  authors: [{ name: "This is Flourish" }],
  creator: "This is Flourish",
  publisher: "This is Flourish",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flourish.vercel.app'),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    title: "Flourish AI | Retail Property Intelligence & Gap Analysis",
    description: "AI-powered deep research and gap analysis for retail properties. Identify £2M+ revenue opportunities per centre.",
    siteName: "Flourish AI",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Flourish AI - Retail Property Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flourish AI | Retail Property Intelligence & Gap Analysis",
    description: "AI-powered deep research and gap analysis for retail properties. Identify £2M+ revenue opportunities per centre.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`min-h-screen bg-background antialiased ${montserrat.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
