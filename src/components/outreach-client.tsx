"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Phone, Globe, Instagram, Linkedin, Twitter, MapPin, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // Mock contact channels for each place
  // Make the first business (index 0) have only a phone number to demonstrate AI Voice Call
  const getContactChannels = (idx: number) => {
    const channels: Array<{ kind: string; icon: any; label: string; value: string }> = []
    
    // First business (Sarah's Kitchen) - only phone for AI Voice Call demo
    if (idx === 0) {
      channels.push({ kind: 'phone', icon: Phone, label: 'Phone', value: '01733 123456' })
      return channels
    }
    
    // Other businesses have multiple channels
    if (idx % 3 !== 1) channels.push({ kind: 'email', icon: Mail, label: 'Email', value: 'contact@example.com' })
    if (idx % 4 !== 2) channels.push({ kind: 'phone', icon: Phone, label: 'Phone', value: `01733 ${Math.floor(100000 + Math.random()*899999)}` })
    channels.push({ kind: 'web', icon: Globe, label: 'Website', value: 'example.com' })
    if (idx % 2 === 0) channels.push({ kind: 'instagram', icon: Instagram, label: 'Instagram', value: '@business' })
    if (idx % 3 === 0) channels.push({ kind: 'linkedin', icon: Linkedin, label: 'LinkedIn', value: '/company/business' })
    return channels
  }

  const selectAll = () => {
    const next: Record<number, boolean> = {}
    // Exclude businesses that only have phone (index 0 = Sarah's Kitchen)
    allIds.forEach((id) => {
      const channels = getContactChannels(id)
      const hasOnlyPhone = channels.length === 1 && channels[0].kind === 'phone'
      if (!hasOnlyPhone) {
        next[id] = true
      }
    })
    setSelected(next)
  }

  const clearAll = () => setSelected({})

  // Calculate count of selectable businesses (excluding phone-only)
  const selectableCount = useMemo(() => {
    return places.filter((_, i) => {
      const channels = getContactChannels(i)
      const hasOnlyPhone = channels.length === 1 && channels[0].kind === 'phone'
      return !hasOnlyPhone
    }).length
  }, [places])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading ? "Fetching nearby candidates…" : `${selectedCount} selected`}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll} disabled={loading}>
            Select All ({selectableCount})
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} disabled={loading || selectedCount === 0}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {(loading ? Array.from({ length: 6 }).map(() => null) : places).map((p, i) => {
          const channels = getContactChannels(i)
          const hasOnlyPhone = channels.length === 1 && channels[0].kind === 'phone'
          
          return (
            <Card 
              key={i} 
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                selected[i] && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="pb-2">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={!!selected[i]}
                        onCheckedChange={(v) => setSelected((prev) => ({ ...prev, [i]: !!v }))}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{p!.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{p!.price} • {p!.type}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{p!.rating}★ ({p!.reviews.toLocaleString()})</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 w-1/3 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{p!.address}</span>
                    </div>
                    <div className="text-sm bg-muted/50 p-2 rounded-md">
                      <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
                      <span className="italic">&quot;{p!.blurb}&quot;</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Contact Channels</div>
                      <div className="flex flex-wrap gap-2">
                        {channels.map((channel, idx) => {
                          const Icon = channel.icon
                          return (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <Icon className="h-3 w-3" />
                              <span>{channel.label}</span>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    {hasOnlyPhone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          // Navigate to AI call page
                          window.location.href = `/outreach/local/${locationId}/${gapId}/call/${i}`
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        AI Voice Call
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
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
              size="lg"
              className="gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Starting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Start Outreach ({selectedNames.length})
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
