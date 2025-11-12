"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { label: "Locations", href: "#locations" },
  { label: "Looking For Space?", href: "#looking-for-space" },
  { label: "Join our portfolio", href: "#join-portfolio" },
  { label: "Trader Stories", href: "#trader-stories" },
  { label: "Team/About Us", href: "#team" },
  { label: "Video Gallery", href: "#video-gallery" },
  { label: "Contact Us", href: "#contact" },
]

export function V2Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-border/50"
          : "border-b border-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/v2" className="flex items-center space-x-2">
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
              href={item.href}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow-md"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Theme toggle, Sign in, Mobile menu */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="outline" asChild className="hidden md:inline-flex bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
            <Link href="/sign-in">Sign In</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
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

