"use client"
import { useMemo, useState } from "react"
import { ShoppingCentreSearch } from "@/components/shopping-centre-search"
import { Location } from "@/types/location"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, Factory, Users, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function OutreachGapsClient({ locations }: { locations: Location[] }) {
  const [selected, setSelected] = useState<Location | null>(null)
  const [published, setPublished] = useState<Set<string>>(new Set())
  const router = useRouter()

  const demoGaps = useMemo(() => {
    if (!selected) return [] as any[]
    return [
      {
        id: 'gap-fnb-quick',
        title: 'Food & Beverage – Fast-casual dining',
        priority: 'High',
        rationale: 'Under-indexed vs peers within 10 miles by ~6–8 units',
        suggestedBrands: ['Five Guys', 'Shake Shack', 'Tortilla'],
      },
      {
        id: 'gap-entertainment',
        title: 'Entertainment & Leisure – Family/Experiential',
        priority: 'Medium',
        rationale: 'Limited family entertainment formats vs comparable centres',
        suggestedBrands: ['Boom Battle Bar', 'Gravity Active', 'Puttshack'],
      },
      {
        id: 'gap-specialty-health',
        title: 'Health & Wellness – Specialty',
        priority: 'Medium',
        rationale: 'Growing catchment demand; whitespace in wellness services',
        suggestedBrands: ['The Gym Group', 'Rituals', 'TheraBody'],
      },
    ]
  }, [selected])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-sm font-medium">Target Location</span>
        <ShoppingCentreSearch onCentreSelect={setSelected as any} selectedCentre={selected as any} locations={locations as any} />
      </div>

      {!selected ? (
        <div className="text-sm text-muted-foreground">Select a shopping centre (e.g., Queensgate) to see proposed gaps.</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Proposed gaps for {selected.name}</div>
              <div className="text-xs text-muted-foreground">Simulation based on current radius-set peers</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{demoGaps.length} gaps</Badge>
            </div>
          </div>
          <Separator />

          <div className="space-y-3">
            {demoGaps.map((gap) => (
              <Card key={gap.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{gap.title}</CardTitle>
                    <CardDescription>
                      <span className="mr-2">Priority: <span className="font-medium">{gap.priority}</span></span>
                      <span className="text-muted-foreground">{gap.rationale}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Suggested: {gap.suggestedBrands.join(', ')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setPublished((prev) => new Set(prev).add(gap.id))
                      toast.success('Published as Flourish Franchise Opportunity', { description: `${gap.title}` })
                    }}
                    disabled={published.has(gap.id)}
                  >
                    {published.has(gap.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Published
                      </>
                    ) : (
                      <>
                        <Factory className="h-4 w-4 mr-2" /> Publish Franchise Opportunity
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!selected) return
                      const slug = gap.id // e.g., gap-fnb-quick
                      router.push(`/outreach/local/${selected.id}/${slug}`)
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" /> Local Outreach
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

