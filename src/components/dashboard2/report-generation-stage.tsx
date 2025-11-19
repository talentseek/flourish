"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Location } from "@/types/location"
import { GapAnalysis } from "@/lib/tenant-comparison"
import { TenantComparisonView } from "@/components/tenant-comparison-view"
import { GapPriorityCards } from "@/components/gap-priority-cards"
import { MissingBrandsSection } from "@/components/missing-brands-section"

interface ReportGenerationStageProps {
  targetLocation: Location
  competitorIds: string[]
  gapAnalysis: GapAnalysis | null
  onGapAnalysisChange: (analysis: GapAnalysis | null) => void
}

export function ReportGenerationStage({
  targetLocation,
  competitorIds,
  gapAnalysis,
  onGapAnalysisChange,
}: ReportGenerationStageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadGapAnalysis = async () => {
      if (gapAnalysis) {
        setLoading(false)
        return
      }

      if (competitorIds.length === 0) {
        setError("No competitors selected")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setProgress(0)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const competitorIdsParam = competitorIds.join(',')
        const res = await fetch(
          `/api/analytics/gap-analysis?targetId=${targetLocation.id}&competitorIds=${competitorIdsParam}&includeBrands=true`
        )

        clearInterval(progressInterval)
        setProgress(100)

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const json = await res.json()
        if (json.success && json.data) {
          onGapAnalysisChange(json.data)
        } else {
          throw new Error(json.error || 'Failed to load gap analysis')
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load gap analysis')
        onGapAnalysisChange(null)
      } finally {
        setLoading(false)
      }
    }

    loadGapAnalysis()
  }, [targetLocation.id, competitorIds, gapAnalysis, onGapAnalysisChange])

  const handleViewFullReport = () => {
    const nearbyParam = encodeURIComponent(competitorIds.join(","))
    router.push(`/reports/run/${targetLocation.id}?nearby=${nearbyParam}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Generating Gap Analysis</h2>
            <p className="text-muted-foreground">
              Analyzing {targetLocation.name} against {competitorIds.length} competitor{competitorIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Generating Report</CardTitle>
          <CardDescription>There was an error while generating your gap analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error}</div>
          <Button
            onClick={() => {
              setLoading(true)
              setError(null)
              onGapAnalysisChange(null)
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!gapAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
          <CardDescription>Unable to generate gap analysis</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gap Analysis Report</h1>
          <p className="text-muted-foreground">
            Comparing {targetLocation.name} with {competitorIds.length} competitor{competitorIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleViewFullReport} size="lg">
          <FileText className="h-4 w-4 mr-2" />
          View Full Report
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Tenant Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Comparison</CardTitle>
            <CardDescription>
              Category distribution comparison between target and competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TenantComparisonView comparison={gapAnalysis.comparison} />
          </CardContent>
        </Card>

        {/* Gap Priorities */}
        <GapPriorityCards analysis={gapAnalysis} />

        {/* Missing Brands */}
        <MissingBrandsSection
          missingBrands={gapAnalysis.missingBrands}
          targetLocationName={gapAnalysis.comparison.target.locationName}
        />

        {/* Insights */}
        {gapAnalysis.insights && gapAnalysis.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>
                Intelligent analysis of tenant mix gaps and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {gapAnalysis.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

