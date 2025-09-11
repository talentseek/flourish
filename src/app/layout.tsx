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
  title: "Flourish",
  description: "Your modern Next.js application with authentication and database",
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
