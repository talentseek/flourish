"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface FlourishLogoProps {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function FlourishLogo({ width = 120, height = 40, className = "h-8 w-auto", priority = false }: FlourishLogoProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine the actual theme (accounting for system theme)
  const actualTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light"
  const logoSrc = actualTheme === "dark" ? "/flourishlogonew.png" : "/flourishgrey.png"

  return (
    <Image
      src={logoSrc}
      alt="Flourish"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}

