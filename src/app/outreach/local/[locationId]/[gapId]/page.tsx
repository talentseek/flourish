import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, MapPin } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { OutreachClient } from "@/components/outreach-client"

export const runtime = 'nodejs'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function getMockPlaces() {
  // Simulate network latency
  await sleep(600)
  return {
    places: [
      { name: "Sarah's Kitchen", rating: 4.8, reviews: 342, price: '£10–20', type: 'Fast Casual Dining', address: 'High Street, Chatham', blurb: 'Strong local operator in fast-casual dining, perfect fit for Pentagon Shopping Centre.' },
      { name: 'The Ladz Chatham', rating: 4.7, reviews: 2000, price: '£10–20', type: 'Restaurant', address: '15 High Street, Chatham', blurb: 'Friendly staff, stellar food and drink, reasonably priced.' },
      { name: 'Wingstop Chatham', rating: 4.7, reviews: 303, price: '£10–20', type: 'Chicken wings', address: 'Unit 2, Pentagon Shopping Centre, Chatham', blurb: 'Helped me get my food quickly and great service' },
      { name: 'Turtle Bay Chatham', rating: 4.8, reviews: 11000, price: '£30–40', type: 'Caribbean', address: '46, Pentagon Shopping Centre, Chatham', blurb: 'Service quick, drinks lovely and food delish' },
      { name: "Chatham Diner", rating: 4.3, reviews: 12, price: '£1–10', type: 'Diner', address: 'Exchange St, Chatham', blurb: 'Food is freshly made and fast service.' },
      { name: 'The Frying Scotsman Chatham', rating: 4.8, reviews: 258, price: '£1–10', type: 'Restaurant', address: 'High Street, Chatham', blurb: 'Excellent food, lovely staff and great prices.' },
      { name: 'KOKORO - Chatham', rating: 4.6, reviews: 219, price: '£10–20', type: 'Restaurant', address: '7 Pentagon Shopping Centre, Chatham', blurb: 'Polite, quick, delicious food.' },
      { name: 'The Good Stuff - healthy fast food takeaway', rating: 4.9, reviews: 127, price: '£1–10', type: 'Restaurant', address: '16 High Street, Chatham', blurb: 'Affordable, quick, and convenient; menu slaps.' },
      { name: 'Five Guys Burgers and Fries Chatham', rating: 4.3, reviews: 858, price: '£10–20', type: 'Hamburger', address: '6 Pentagon Shopping Centre, Chatham', blurb: 'Top quality; reasonable prices.' },
    ],
    clusters: [
      { title: 'Healthy delivery', examples: ["Kiko Sushi and Bubble Tea", "Nando's Chatham"] },
      { title: 'Hamburger restaurants', examples: ["Five Guys", "Burger King"] },
      { title: 'Fast food restaurants', examples: ["The Good Stuff", "Chatham Grill"] },
      { title: 'Healthy eating', examples: ["KOKORO", "wagamama"] },
    ]
  }
}

export default async function LocalOutreachPage({ params }: { params: { locationId: string, gapId: string } }) {
  const location = await prisma.location.findUnique({ where: { id: params.locationId }, select: { id: true, name: true, city: true, county: true, postcode: true } })
  if (!location) return notFound()

  const data = await getMockPlaces()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> Local Outreach • {location.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {location.city}, {location.county} {location.postcode}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <OutreachClient places={data.places as any} clusters={data.clusters as any} locationId={location.id} gapId={params.gapId} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

