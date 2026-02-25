import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { getSpacesForLocation, getBookingsForDiary } from '@/actions/space-actions'
import { SpaceDiaryGrid } from '@/components/spaces/space-diary-grid'
import { startOfDay, addDays } from 'date-fns'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

    const [spaces, bookings] = await Promise.all([
        getSpacesForLocation(location.id),
        getBookingsForDiary(location.id, windowStart, windowEnd)
    ])

    const serializedSpaces = spaces.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        defaultDailyRate: s.defaultDailyRate ? Number(s.defaultDailyRate) : null
    }))

    const serializedBookings = bookings.map(b => ({
        id: b.id,
        reference: b.reference,
        spaceId: b.spaceId,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        licenseType: b.licenseType,
        companyName: b.companyName,
        contactName: b.contactName,
        contactEmail: b.contactEmail,
        contactPhone: b.contactPhone,
        brand: b.brand,
        setupDetail: b.setupDetail,
        description: b.description,
        dailyRate: b.dailyRate ? Number(b.dailyRate) : null,
        totalValue: b.totalValue ? Number(b.totalValue) : null,
        notes: b.notes,
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

                        <SpaceDiaryGrid
                            locationId={location.id}
                            locationName={`${location.name} — ${location.city}`}
                            spaces={serializedSpaces}
                            initialBookings={serializedBookings}
                            initialWindowStart={windowStart}
                        />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
