"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FlourishAssistantClient } from "@/components/flourish-assistant-client"
import { MessageSquare, X } from "lucide-react"

export function AssistantWidget() {
  const [isMinimized, setIsMinimized] = useState(true)

  // When minimized, show just a small floating button
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
          title="Open Flourish Assistant"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="sr-only">Open Flourish Assistant</span>
        </Button>
      </div>
    )
  }

  // When expanded, show the full assistant interface
  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm hidden md:block">
      <Card className="shadow-lg border-2">
        <CardContent className="p-0">
          {/* Header with minimize button */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Flourish Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-7 w-7 p-0"
              title="Minimize"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Assistant Content */}
          <div className="max-h-[500px] overflow-y-auto">
            <div className="p-3">
              <FlourishAssistantClient />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

