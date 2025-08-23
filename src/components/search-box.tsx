"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SearchBox() {
  return (
    <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Enter shopping centre name..."
          className={cn(
            "pl-10 h-14 text-lg",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        />
      </div>
      <Button size="lg" className="h-12 px-8 text-lg">
        Start AI Analysis
      </Button>
    </div>
  )
}
