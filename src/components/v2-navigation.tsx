"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { label: "Our Locations", href: "#locations" },
  { label: "Looking For Space?", href: "#looking-for-space" },
  { label: "Join our portfolio", href: "#join-portfolio" },
  { label: "Trader Stories", href: "#trader-stories" },
  { label: "About Us", href: "#team" },
  { label: "Video Gallery", href: "#video-gallery" },
  { label: "Contact Us", href: "#contact" },
]

interface V2NavigationProps {
  forceSolid?: boolean
  useAbsoluteLinks?: boolean
}

export function V2Navigation({ forceSolid = false, useAbsoluteLinks = false }: V2NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Switch to dark background when scrolled past 100px
      setIsScrolled(scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const showSolid = forceSolid || isScrolled

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        showSolid
          ? "bg-[#4D4A46] border-b border-[#D8D8D6]"
          : "bg-transparent border-b border-transparent"
      )}
      style={showSolid ? { backgroundColor: '#4D4A46' } : { backgroundColor: 'transparent' }}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={useAbsoluteLinks ? "/v2" : "/v2"} className="flex items-center space-x-2">
          <Image
            src="/flourishlogonew.png"
            alt="Flourish"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={useAbsoluteLinks ? `/v2${item.href}` : item.href}
              className={cn(
                "text-base font-medium transition-colors",
                showSolid
                  ? "text-white/90 hover:text-[#E6FB60]"
                  : "text-white/90 hover:text-[#E6FB60] drop-shadow-md"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Sign in, Mobile menu */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            asChild
            className={cn(
              "hidden md:inline-flex transition-colors",
              showSolid
                ? "bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                : "bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
            )}
          >
            <Link href="/sign-in">Sign In</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={useAbsoluteLinks ? `/v2${item.href}` : item.href}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

