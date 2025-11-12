"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function V2VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [overlayOpacity, setOverlayOpacity] = useState(0.3)
  const [contentOpacity, setContentOpacity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollY = window.scrollY
      const containerHeight = containerRef.current.offsetHeight
      const scrollProgress = Math.min(scrollY / containerHeight, 1)

      // Scale video down as user scrolls (from 1 to 0.5)
      const newScale = Math.max(1 - scrollProgress * 0.5, 0.5)
      setScale(newScale)

      // Fade out overlay as user scrolls (subtle overlay starts at 0.3)
      const newOverlayOpacity = Math.max(0.3 - scrollProgress * 0.3, 0)
      setOverlayOpacity(newOverlayOpacity)

      // Fade out hero content as user scrolls
      const newContentOpacity = Math.max(1 - scrollProgress * 2, 0)
      setContentOpacity(newContentOpacity)
    }

    // Throttle scroll events for performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener("scroll", throttledScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden -z-0"
    >
      {/* Video Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videosmall.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Dark Overlay - subtle overlay for text readability */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: overlayOpacity,
          transition: "opacity 0.1s ease-out",
        }}
      />

      {/* Hero Content */}
      <div 
        className="relative z-10 flex h-full items-center justify-center"
        style={{
          opacity: contentOpacity,
          transition: "opacity 0.1s ease-out",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg" style={{ color: '#e6fb60' }}>
              Welcome to Flourish
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-md" style={{ color: '#e6fb60' }}>
              Transforming retail spaces into thriving destinations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="#locations">Explore Locations</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-background/80 backdrop-blur">
                <Link href="#contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

