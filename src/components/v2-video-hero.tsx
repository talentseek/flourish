"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function V2VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6) // Start smaller for entrance animation
  const [videoOpacity, setVideoOpacity] = useState(0) // Start invisible for fade-in
  const [overlayOpacity, setOverlayOpacity] = useState(0.3)
  const [contentOpacity, setContentOpacity] = useState(1)
  const [isFixed, setIsFixed] = useState(true) // Track if container should be fixed or absolute
  const [logoFlip, setLogoFlip] = useState<'normal' | 'mirror' | 'normal-final'>('normal')

  // Entrance animation on mount
  useEffect(() => {
    // Trigger entrance animation after a brief delay
    const timer = setTimeout(() => {
      setScale(1)
      setVideoOpacity(1)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Logo flip animation after video fades in
  useEffect(() => {
    let returnTimer: NodeJS.Timeout | null = null
    
    // Wait for video fade-in to complete (0.9s transition + 100ms delay = ~1000ms)
    const logoAnimationTimer = setTimeout(() => {
      // First flip to mirror
      setLogoFlip('mirror')
      
      // Then return to normal after a brief pause
      returnTimer = setTimeout(() => {
        setLogoFlip('normal-final')
      }, 400) // Hold mirror for 400ms
    }, 1000) // Start after video fade-in completes

    return () => {
      clearTimeout(logoAnimationTimer)
      if (returnTimer) clearTimeout(returnTimer)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollY = window.scrollY
      const containerHeight = containerRef.current.offsetHeight
      const scrollProgress = Math.min(scrollY / containerHeight, 1)

      // Hero content fades out when scrollProgress = 0.5 (contentOpacity reaches 0)
      // Stop parallax scaling when content fades out
      const parallaxStopPoint = 0.5
      
      if (scrollProgress < parallaxStopPoint) {
        // Still in parallax phase - scale video down as user scrolls
        const parallaxProgress = scrollProgress / parallaxStopPoint
        const newScale = Math.max(1 - parallaxProgress * 0.5, 0.5)
        setScale(newScale)
        setIsFixed(true)
      } else {
        // Parallax stopped - switch to absolute positioning for normal scroll
        setScale(0.5) // Keep at minimum scale
        setIsFixed(false)
      }

      // Fade out overlay as user scrolls (subtle overlay starts at 0.3)
      const newOverlayOpacity = Math.max(0.3 - scrollProgress * 0.3, 0)
      setOverlayOpacity(newOverlayOpacity)

      // Fade out hero content as user scrolls (reaches 0 at scrollProgress = 0.5)
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
      className={cn(
        "top-0 left-0 right-0 h-screen w-full overflow-hidden -z-10",
        isFixed ? "fixed" : "absolute"
      )}
    >
      {/* Video Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `scale(${scale})`,
          opacity: videoOpacity,
          transition: isFixed 
            ? "transform 0.1s ease-out, opacity 0.9s ease-out" 
            : "transform 0.1s ease-out",
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
          <source src="/kiosk2.mp4" type="video/mp4" />
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
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg flex items-center justify-center gap-3 flex-wrap">
              <span style={{ color: '#e6fb60' }}>Welcome to</span>
              <Image
                src="/flourishlogonew.png"
                alt="Flourish"
                width={200}
                height={60}
                className="h-[1em] w-auto inline-block"
                priority
                style={{
                  transform: logoFlip === 'mirror' ? 'scaleX(-1)' : 'scaleX(1)',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-md" style={{ color: '#e6fb60' }}>
              Transforming retail space into thriving destinations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 bg-[#E6FB60] text-[#4D4A46] hover:bg-[#E6FB60]/90 border-0 font-semibold"
              >
                <Link href="#join-portfolio">I&apos;m a Landlord/Managing Agent</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 bg-white/10 text-white border-2 border-white/50 hover:bg-white/20 backdrop-blur font-semibold"
              >
                <Link href="#looking-for-space">I&apos;m an Operator</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

