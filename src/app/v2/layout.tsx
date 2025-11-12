"use client"

import { useEffect } from "react"
import './v2-styles.css'

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add class to body for CSS targeting
    const body = document.body
    body.classList.add('v2-page-active')
    
    // Remove bg-background class
    body.className = body.className.replace(/\bbg-background\b/g, '')
    
    // Set transparent background with multiple methods
    body.style.setProperty('background-color', 'transparent', 'important')
    body.style.setProperty('background', 'transparent', 'important')
    body.style.setProperty('--background', 'transparent', 'important')
    
    return () => {
      // Restore when leaving V2 page
      body.classList.remove('v2-page-active')
      body.style.removeProperty('background-color')
      body.style.removeProperty('background')
      body.style.removeProperty('--background')
    }
  }, [])

  return (
    <div className="v2-page">
      {children}
    </div>
  )
}

