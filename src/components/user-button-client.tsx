"use client"

import { useEffect, useState } from "react"
import { UserButton } from "@clerk/nextjs"

interface UserButtonClientProps {
  afterSignOutUrl?: string
  appearance?: {
    elements?: {
      avatarBox?: string
      userButtonPopoverCard?: string
    }
  }
}

export function UserButtonClient({ afterSignOutUrl, appearance }: UserButtonClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  return (
    <UserButton
      afterSignOutUrl={afterSignOutUrl}
      appearance={appearance}
    />
  )
}

