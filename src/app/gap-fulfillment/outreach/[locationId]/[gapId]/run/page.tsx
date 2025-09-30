import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OutreachSendClient } from "@/components/outreach-send-client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Globe, Instagram, Linkedin, Twitter } from "lucide-react"

export const runtime = 'nodejs'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export default async function OutreachRunPage({ params, searchParams }: { params: { locationId: string, gapId: string }, searchParams?: { [k: string]: string | string[] | undefined } }) {
  const location = await prisma.location.findUnique({ where: { id: params.locationId }, select: { id: true, name: true, city: true, county: true, postcode: true } })
  if (!location) return notFound()

  const namesParam = Array.isArray(searchParams?.names) ? searchParams?.names[0] : (searchParams?.names as string | undefined)
  const names = (namesParam || '').split('|').filter(Boolean)

  // Simulate contact enrichment and AI message creation
  await sleep(800)
  const stopWords = new Set(["the","a","an","and","of","&"]) as Set<string>
  const pickName = (full: string) => {
    const tokens = full.split(/\s+/).filter(Boolean)
    for (const t of tokens) {
      const clean = t.replace(/[^A-Za-z]/g, '')
      if (!stopWords.has(clean.toLowerCase()) && clean.length > 1) return clean
    }
    return tokens[0] || full
  }

  const results = names.map((n, idx) => {
    const handle = n.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const base = n.replace(/\s+/g, '.').toLowerCase()
    const first = pickName(n)

    // Vary contact channels
    const channels: Array<{ kind: string; icon: string; label: string; value: string; href?: string }> = []
    if (idx % 3 !== 1) channels.push({ kind: 'email', icon: 'mail', label: 'Email', value: `${base}@example.com`, href: `mailto:${base}@example.com` })
    if (idx % 4 !== 2) channels.push({ kind: 'phone', icon: 'phone', label: 'Phone', value: `01733 ${Math.floor(100000 + Math.random()*899999)}` })
    channels.push({ kind: 'web', icon: 'globe', label: 'Website', value: `https://example.com/${handle}`, href: `https://example.com/${handle}` })
    if (idx % 2 === 0) channels.push({ kind: 'instagram', icon: 'instagram', label: 'Instagram', value: `@${handle}` , href: `https://instagram.com/${handle}` })
    if (idx % 3 === 0) channels.push({ kind: 'linkedin', icon: 'linkedin', label: 'LinkedIn', value: `/${handle}`, href: `https://linkedin.com/company/${handle}` })
    if (idx % 5 === 0) channels.push({ kind: 'twitter', icon: 'twitter', label: 'X', value: `@${handle}`, href: `https://x.com/${handle}` })

    const message = `Hi ${first},\n\nWe’re reaching out about high-demand fast-casual opportunities within 10 miles of Queensgate Shopping Centre (PE1 1NT). Our peer set shows under-supply in your category, and your concept appears well-suited to current footfall and catchment preferences. We can share quick benchmarks (category share, competitor density, suitable units) and coordinate an intro to the landlord team.\n\nWould you be open to a short call this week to explore fit and timing?`

    return { name: n, channels, message }
  })

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Card>
            <CardHeader>
              <CardTitle>Outreach Preparation • {location.name}</CardTitle>
              <CardDescription>Contact details and draft messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.length === 0 ? (
                <div className="text-sm text-muted-foreground">No candidates selected.</div>
              ) : (
                <OutreachSendClient results={results as any} />
              )}
              <div className="pt-2 flex justify-end">
                <Button asChild>
                  <Link href="/gap-fulfillment/analytics">View Outreach Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


