"use client"

import { useEffect } from "react"
import './v2-styles.css'

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add class to HTML element (highest level)
    const html = document.documentElement
    const body = document.body
    
    html.classList.add('v2-page-active')
    body.classList.add('v2-page-active')
    
    // Override CSS variable at root level
    html.style.setProperty('--background', 'transparent', 'important')
    
    // Remove bg-background class from body
    body.className = body.className.replace(/\bbg-background\b/g, '')
    
    // Set transparent background with multiple methods
    body.style.setProperty('background-color', 'transparent', 'important')
    body.style.setProperty('background', 'transparent', 'important')
    
    return () => {
      // Restore when leaving V2 page
      html.classList.remove('v2-page-active')
      body.classList.remove('v2-page-active')
      html.style.removeProperty('--background')
      body.style.removeProperty('background-color')
      body.style.removeProperty('background')
    }
  }, [])

  return (
    <div className="v2-page">
      {children}
    </div>
  )
}

