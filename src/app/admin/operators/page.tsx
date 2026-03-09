import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AdminOperatorsClient } from './admin-operators-client'

export const runtime = 'nodejs'

export default async function AdminOperatorsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const operators = await prisma.operator.findMany({
        where: { isActive: true },
        include: {
            licenses: {
                orderBy: { endDate: 'asc' }
            },
            _count: {
                select: { bookings: true }
            }
        },
        orderBy: { companyName: 'asc' }
    })

    const serialized = operators.map(op => ({
        ...op,
        companiesHouseDate: op.companiesHouseDate?.toISOString() || null,
        creditCheckDate: op.creditCheckDate?.toISOString() || null,
        createdAt: op.createdAt.toISOString(),
        updatedAt: op.updatedAt.toISOString(),
        licenses: op.licenses.map(lic => ({
            ...lic,
            coverValue: lic.coverValue ? lic.coverValue.toString() : null,
            startDate: lic.startDate.toISOString(),
            endDate: lic.endDate.toISOString(),
            createdAt: lic.createdAt.toISOString(),
            updatedAt: lic.updatedAt.toISOString(),
        }))
    }))

    return <AdminOperatorsClient operators={serialized} />
}
