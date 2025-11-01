"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { GapAnalysis } from "@/lib/tenant-comparison"

interface GapPriorityCardsProps {
  analysis: GapAnalysis
}

export function GapPriorityCards({ analysis }: GapPriorityCardsProps) {
  const { priorities } = analysis

  const highPriority = priorities.filter(p => p.priority === 'high')
  const mediumPriority = priorities.filter(p => p.priority === 'medium')
  const lowPriority = priorities.filter(p => p.priority === 'low')

  const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const PriorityCard = ({ priority, gaps }: { priority: 'high' | 'medium' | 'low', gaps: typeof priorities }) => {
    if (gaps.length === 0) return null

    const borderColor = priority === 'high' ? 'border-red-500' : priority === 'medium' ? 'border-orange-500' : 'border-blue-500'
    const bgColor = priority === 'high' ? 'bg-red-50 dark:bg-red-950/20' : priority === 'medium' ? 'bg-orange-50 dark:bg-orange-950/20' : 'bg-blue-50 dark:bg-blue-950/20'

    return (
      <Card className={`border-l-4 ${borderColor} ${bgColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PriorityIcon priority={priority} />
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Gaps ({gaps.length})
          </CardTitle>
          <CardDescription>
            {priority === 'high' && 'Immediate action recommended'}
            {priority === 'medium' && 'Should be addressed soon'}
            {priority === 'low' && 'Consider for future planning'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gaps.map((gap, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-background">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{gap.category}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{gap.recommendation}</p>
                </div>
                <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary'}>
                  Score: {gap.score.toFixed(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Gap Type</p>
                  <p className="text-sm font-medium capitalize">{gap.gapType.replace('-', ' ')}</p>
                </div>
                {gap.gapSize > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Gap Size</p>
                    <p className="text-sm font-medium">~{gap.gapSize} stores</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Competitor Coverage</p>
                  <p className="text-sm font-medium">{gap.competitorCoverage.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(gap.score / 10) * 100} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{gap.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {highPriority.length > 0 && <PriorityCard priority="high" gaps={highPriority} />}
      {mediumPriority.length > 0 && <PriorityCard priority="medium" gaps={mediumPriority} />}
      {lowPriority.length > 0 && <PriorityCard priority="low" gaps={lowPriority} />}
      
      {priorities.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No gaps identified. The target location's tenant mix aligns well with competitors.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

