"use client"

import { useEffect } from "react"
import './v2-styles.css'

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add class to HTML element for V2 page styling
    const html = document.documentElement
    const body = document.body
    
    html.classList.add('v2-page-active')
    body.classList.add('v2-page-active')
    
    // Only remove bg-background class if it exists, but let theme handle backgrounds
    // Don't force transparent on body - let sections use theme-aware backgrounds
    
    return () => {
      // Restore when leaving V2 page
      html.classList.remove('v2-page-active')
      body.classList.remove('v2-page-active')
    }
  }, [])

  return (
    <div className="v2-page">
      {children}
    </div>
  )
}

