"use client"

import { useEffect } from "react"

export default function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Override body background for V2 page
    const body = document.body
    const originalBg = body.style.backgroundColor
    const originalClass = body.className
    
    // Remove bg-background class and set transparent background
    body.className = body.className.replace(/\bbg-background\b/g, '')
    body.style.backgroundColor = 'transparent'
    
    return () => {
      // Restore original background when leaving V2 page
      body.style.backgroundColor = originalBg
      body.className = originalClass
    }
  }, [])

  return (
    <div className="v2-page">
      {children}
    </div>
  )
}

