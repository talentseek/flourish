"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, MapPin, GitCompare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface StageNavigationProps {
  currentStage: 1 | 2 | 3 | 4
  onBack: () => void
  canGoBack: boolean
}

const stages = [
  { number: 1, title: "Search", icon: Search },
  { number: 2, title: "Discover", icon: MapPin },
  { number: 3, title: "Compare", icon: GitCompare },
  { number: 4, title: "Report", icon: FileText },
]

export function StageNavigation({ currentStage, onBack, canGoBack }: StageNavigationProps) {
  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = currentStage === stage.number
            const isCompleted = currentStage > stage.number
            const isUpcoming = currentStage < stage.number

            return (
              <div key={stage.number} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                      isActive && "bg-primary text-primary-foreground border-primary",
                      isCompleted && "bg-primary/10 text-primary border-primary",
                      isUpcoming && "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {isCompleted ? (
                      <span className="text-sm font-bold">✓</span>
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-foreground",
                        isCompleted && "text-primary",
                        isUpcoming && "text-muted-foreground"
                      )}
                    >
                      {stage.title}
                    </div>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Back Button */}
      {canGoBack && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Step {currentStage} of {stages.length}
          </div>
        </div>
      )}
    </div>
  )
}

