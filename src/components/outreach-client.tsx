"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type Place = {
  name: string
  rating: number
  reviews: number
  price: string
  type: string
  address: string
  blurb: string
}

type Cluster = { title: string; examples: string[] }

export function OutreachClient({ places, clusters, locationId, gapId }: { places: Place[]; clusters: Cluster[]; locationId: string; gapId: string }) {
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const selectedNames = useMemo(() => Object.entries(selected).filter(([,v]) => v).map(([k]) => places[Number(k)]?.name).filter(Boolean) as string[], [selected, places])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const allIds = useMemo(() => places.map((_, i) => i), [places])
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )

  const selectAll = () => {
    const next: Record<number, boolean> = {}
    allIds.forEach((id) => (next[id] = true))
    setSelected(next)
  }

  const clearAll = () => setSelected({})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading ? "Fetching nearby candidates…" : `${selectedCount} selected`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} disabled={loading}>
            Select All ({places.length})
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={loading || selectedCount === 0}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {(loading ? Array.from({ length: 6 }).map(() => null) : places).map((p, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={!!selected[i]}
                      onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [i]: !!v }))}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-base">{p!.name}</CardTitle>
                      <CardDescription>
                        {p!.price} • {p!.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{p!.rating}★ ({p!.reviews.toLocaleString()})</Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-1/3 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ) : (
                <>
                  <div className="text-xs text-muted-foreground mb-1">{p!.address}</div>
                  <div className="text-sm">“{p!.blurb}”</div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && (
        <>
          <Separator />
          <div>
            <div className="text-sm font-medium mb-2">Discover more</div>
            <div className="grid md:grid-cols-2 gap-3">
              {clusters.map((c, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">{c.examples.join(", ")} + more</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                setSubmitting(true)
                const namesParam = encodeURIComponent(selectedNames.join("|"))
                window.location.href = `/outreach/local/${locationId}/${gapId}/run?names=${namesParam}`
              }}
              disabled={selectedNames.length === 0 || submitting}
            >
              {submitting ? 'Starting…' : `Start Outreach (${selectedNames.length})`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


