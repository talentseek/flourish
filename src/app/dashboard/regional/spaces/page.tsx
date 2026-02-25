import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { getManagedLocationsForSpaces } from '@/actions/space-actions'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Building2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const runtime = 'nodejs'

export default async function SpacesLocationPicker() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true }
    })

    if (!dbUser) redirect('/login')
    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER') {
        redirect('/dashboard')
    }

    const locations = await getManagedLocationsForSpaces()

    // Count spaces per location
    const spaceCounts = await prisma.space.groupBy({
        by: ['locationId'],
        where: {
            isActive: true,
            locationId: { in: locations.map(l => l.id) }
        },
        _count: { id: true }
    })
    const spaceCountMap = Object.fromEntries(
        spaceCounts.map(sc => [sc.locationId, sc._count.id])
    )

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole={dbUser.role} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto w-full">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Space Bookings</h1>
                            <p className="text-muted-foreground">
                                Select a location to view and manage space bookings.
                            </p>
                        </div>

                        {locations.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No managed locations assigned to you.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {locations.map((loc) => (
                                    <Link
                                        key={loc.id}
                                        href={`/dashboard/regional/spaces/${loc.id}`}
                                        className="block"
                                    >
                                        <Card className="h-full cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        {loc.name}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-lg font-semibold">{loc.city}</div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Building2 className="h-3 w-3" />
                                                    {spaceCountMap[loc.id] || 0} bookable spaces
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {loc.type.replace('_', ' ')}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
