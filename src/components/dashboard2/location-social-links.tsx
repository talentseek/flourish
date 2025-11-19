"use client"

import { Instagram, Facebook, Youtube, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Location } from "@/types/location"

interface LocationSocialLinksProps {
  location: Location
}

export function LocationSocialLinks({ location }: LocationSocialLinksProps) {
  const socialLinks = [
    {
      platform: 'Instagram',
      url: location.instagram,
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
    {
      platform: 'Facebook',
      url: location.facebook,
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      platform: 'YouTube',
      url: location.youtube,
      icon: Youtube,
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      platform: 'Twitter',
      url: location.twitter,
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
  ].filter(link => link.url)

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-muted-foreground">Follow us:</span>
      {socialLinks.map((link) => {
        const Icon = link.icon
        return (
          <Button
            key={link.platform}
            variant="outline"
            size="sm"
            className={`gap-2 ${link.color} text-white border-0`}
            asChild
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon className="h-4 w-4" />
              {link.platform}
            </a>
          </Button>
        )
      })}
      {location.tiktok && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-black hover:bg-gray-900 text-white border-0"
          asChild
        >
          <a
            href={location.tiktok}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>🎵</span>
            TikTok
          </a>
        </Button>
      )}
    </div>
  )
}

