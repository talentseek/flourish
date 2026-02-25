import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AdminSpacesClient } from './admin-spaces-client'

export const runtime = 'nodejs'

export default async function AdminSpacesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    // Fetch managed locations with their spaces
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: {
            id: true,
            name: true,
            city: true,
            type: true,
            spaces: {
                orderBy: { sortOrder: 'asc' },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    width: true,
                    length: true,
                    hasPower: true,
                    defaultDailyRate: true,
                    sortOrder: true,
                    isActive: true,
                }
            }
        },
        orderBy: { name: 'asc' }
    })

    const serialized = locations.map(loc => ({
        ...loc,
        spaces: loc.spaces.map(s => ({
            ...s,
            width: s.width ? Number(s.width) : null,
            length: s.length ? Number(s.length) : null,
            defaultDailyRate: s.defaultDailyRate ? Number(s.defaultDailyRate) : null,
        }))
    }))

    return <AdminSpacesClient locations={serialized} />
}
