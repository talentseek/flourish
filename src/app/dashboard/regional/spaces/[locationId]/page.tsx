import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { getSpacesForLocation, getBookingsForDiary } from '@/actions/space-actions'
import { SpaceDiaryGrid } from '@/components/spaces/space-diary-grid'
import { SpaceMapView } from '@/components/spaces/space-map-view'
import { startOfDay, addDays } from 'date-fns'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DiaryPageClient } from './diary-page-client'

export const runtime = 'nodejs'

interface PageProps {
    params: { locationId: string }
}

export default async function SpaceDiaryPage({ params }: PageProps) {
    const sessionUser = await getSessionUser()
    if (!sessionUser) redirect('/login')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true }
    })

    if (!dbUser) redirect('/login')

    // Must be ADMIN or REGIONAL_MANAGER
    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER') {
        redirect('/dashboard')
    }

    // Fetch the location
    const location = await prisma.location.findUnique({
        where: { id: params.locationId },
        select: { id: true, name: true, city: true, regionalManager: true, isManaged: true }
    })

    if (!location) notFound()

    // RM can only see their locations
    if (dbUser.role === 'REGIONAL_MANAGER' && location.regionalManager !== dbUser.name) {
        redirect('/dashboard/regional')
    }

    const windowStart = startOfDay(new Date())
    const windowEnd = addDays(windowStart, 9)

    const [spaces, bookings, floorMaps] = await Promise.all([
        getSpacesForLocation(location.id),
        getBookingsForDiary(location.id, windowStart, windowEnd),
        prisma.floorMap.findMany({
            where: { locationId: location.id },
            orderBy: { sortOrder: 'asc' },
            include: {
                spaces: {
                    where: { isActive: true, mapPinX: { not: null }, mapPinY: { not: null } },
                    select: {
                        id: true,
                        name: true,
                        sortOrder: true,
                        mapPinX: true,
                        mapPinY: true,
                        types: true,
                        isExternal: true,
                    },
                    orderBy: { sortOrder: 'asc' },
                }
            }
        })
    ])

    const serializedSpaces = spaces.map(s => ({
        id: s.id,
        name: s.name,
        types: s.types,
        defaultDailyRate: s.defaultDailyRate ? Number(s.defaultDailyRate) : null
    }))

    const serializedBookings = bookings.map(b => ({
        id: b.id,
        reference: b.reference,
        spaceId: b.spaceId,
        operatorId: b.operatorId,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        companyName: b.companyName,
        brand: b.brand,
        setupDetail: b.setupDetail,
        description: b.description,
        dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
        totalValue: b.totalValue ? Number(b.totalValue) : null,
        notes: b.notes,
        operator: b.operator || null,
    }))

    const serializedFloorMaps = floorMaps.map(m => ({
        id: m.id,
        name: m.name,
        imageUrl: m.imageUrl,
        sortOrder: m.sortOrder,
        spaces: m.spaces.map(s => ({
            ...s,
            mapPinX: s.mapPinX ? Number(s.mapPinX) : null,
            mapPinY: s.mapPinY ? Number(s.mapPinY) : null,
        }))
    }))

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" userRole={dbUser.role} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto w-full">
                        {/* Back nav */}
                        <Link href="/dashboard/regional/spaces">
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Locations
                            </Button>
                        </Link>

                        <DiaryPageClient
                            locationId={location.id}
                            locationName={`${location.name} — ${location.city}`}
                            spaces={serializedSpaces}
                            initialBookings={serializedBookings}
                            initialWindowStart={windowStart}
                            floorMaps={serializedFloorMaps}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
