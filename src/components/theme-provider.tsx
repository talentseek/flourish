"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { usePathname } from "next/navigation"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname()

  // Define public/marketing pages that should always be light mode
  const isMarketingPage = pathname === "/" || pathname === "/v2" || pathname?.startsWith("/locations/") || pathname === "/contact"

  let dynamicProps = { ...props }

  if (isMarketingPage) {
    dynamicProps.forcedTheme = "light"
    dynamicProps.enableSystem = false
  } else {
    // For dashboard and other internal routes, enforce dark mode (or let them toggle, defaulting to dark)
    // The layout.tsx default is "dark". We force it if it strictly must be dark, otherwise leave it.
    // Given the user said "dashboard seems to always default to lightmode we need this to be dark mode",
    // forcing dark is the safest bet to ensure the design remains intact.
    dynamicProps.forcedTheme = "dark"
    dynamicProps.enableSystem = false
  }

  return <NextThemesProvider {...dynamicProps}>{children}</NextThemesProvider>
}
