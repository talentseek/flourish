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
    
    // Also remove bg-background class and set transparent background
    body.className = body.className.replace(/\bbg-background\b/g, '')
    body.style.backgroundColor = 'transparent'
    body.style.background = 'transparent'
    
    return () => {
      // Restore when leaving V2 page
      body.classList.remove('v2-page-active')
    }
  }, [])

  return (
    <div className="v2-page">
      {children}
    </div>
  )
}

