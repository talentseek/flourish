'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { BookingStatus } from '@prisma/client'

// --- Auth Helpers ---

async function verifyRMOrAdmin(locationId?: string) {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized: Not authenticated')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true, id: true }
    })

    if (!dbUser) throw new Error('Unauthorized: User not found')
    if (dbUser.role === 'ADMIN') return dbUser

    if (dbUser.role === 'REGIONAL_MANAGER') {
        if (!locationId) return dbUser
        const location = await prisma.location.findFirst({
            where: { id: locationId, regionalManager: dbUser.name, isManaged: true }
        })
        if (location) return dbUser
    }

    throw new Error('Unauthorized: Insufficient permissions')
}

async function verifyAdmin() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true, id: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }
    return dbUser
}

// --- Booking Reference Generator ---

async function generateBookingReference(): Promise<string> {
    const lastBooking = await prisma.spaceBooking.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { reference: true }
    })
    const nextNum = lastBooking
        ? parseInt(lastBooking.reference.split('-')[1]) + 1
        : 1
    return `SB-${String(nextNum).padStart(4, '0')}`
}

// --- Space CRUD (Admin only) ---

export async function getSpacesForLocation(locationId: string) {
    await verifyRMOrAdmin(locationId)

    return prisma.space.findMany({
        where: { locationId, isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
            bookings: {
                where: {
                    status: { not: 'CANCELLED' },
                    endDate: { gte: new Date() }
                },
                orderBy: { startDate: 'asc' }
            }
        }
    })
}

interface CreateSpaceData {
    locationId: string
    name: string
    types?: string[]
    width?: number
    length?: number
    hasPower?: boolean
    powerPhase?: string
    powerAmperage?: string
    powerConnection?: string
    powerDelivery?: string
    hasWater?: boolean
    hasDrainage?: boolean
    isExternal?: boolean
    notes?: string
    defaultDailyRate?: number
    sortOrder?: number
}

export async function createSpace(data: CreateSpaceData) {
    await verifyAdmin()

    const space = await prisma.space.create({
        data: {
            locationId: data.locationId,
            name: data.name,
            types: data.types || ['GENERAL'],
            width: data.width,
            length: data.length,
            hasPower: data.hasPower || false,
            powerPhase: data.hasPower ? (data.powerPhase || null) : null,
            powerAmperage: data.hasPower ? (data.powerAmperage || null) : null,
            powerConnection: data.hasPower ? (data.powerConnection || null) : null,
            powerDelivery: data.hasPower ? (data.powerDelivery || null) : null,
            hasWater: data.hasWater || false,
            hasDrainage: data.hasDrainage || false,
            isExternal: data.isExternal || false,
            notes: data.notes || null,
            defaultDailyRate: data.defaultDailyRate,
            sortOrder: data.sortOrder || 0
        }
    })

    revalidatePath('/admin/spaces')
    revalidatePath(`/dashboard/regional/spaces/${data.locationId}`)
    return { success: true, space }
}

interface UpdateSpaceData {
    name?: string
    types?: string[]
    width?: number | null
    length?: number | null
    hasPower?: boolean
    powerPhase?: string | null
    powerAmperage?: string | null
    powerConnection?: string | null
    powerDelivery?: string | null
    hasWater?: boolean
    hasDrainage?: boolean
    isExternal?: boolean
    notes?: string | null
    defaultDailyRate?: number | null
    sortOrder?: number
    isActive?: boolean
}

export async function updateSpace(spaceId: string, data: UpdateSpaceData) {
    await verifyAdmin()

    const space = await prisma.space.update({
        where: { id: spaceId },
        data
    })

    revalidatePath('/admin/spaces')
    revalidatePath(`/dashboard/regional/spaces/${space.locationId}`)
    return { success: true, space }
}

export async function deleteSpace(spaceId: string) {
    await verifyAdmin()

    const space = await prisma.space.update({
        where: { id: spaceId },
        data: { isActive: false }
    })

    revalidatePath('/admin/spaces')
    revalidatePath(`/dashboard/regional/spaces/${space.locationId}`)
    return { success: true }
}

// --- Booking CRUD ---

export async function getBookingsForDiary(
    locationId: string,
    windowStart: Date,
    windowEnd: Date
) {
    await verifyRMOrAdmin(locationId)

    return prisma.spaceBooking.findMany({
        where: {
            space: { locationId, isActive: true },
            startDate: { lte: windowEnd },
            endDate: { gte: windowStart }
        },
        include: {
            space: {
                select: { id: true, name: true, types: true }
            },
            operator: {
                select: { id: true, companyName: true, tradingName: true }
            }
        },
        orderBy: { startDate: 'asc' }
    })
}

export async function getBookingsForRegionalManager() {
    const user = await verifyRMOrAdmin()
    if (!user.name) return []

    const locations = await prisma.location.findMany({
        where: { regionalManager: user.name, isManaged: true },
        select: { id: true, name: true }
    })
    if (locations.length === 0) return []

    return prisma.spaceBooking.findMany({
        where: {
            space: {
                locationId: { in: locations.map((l: { id: string }) => l.id) },
                isActive: true
            },
            status: { not: 'CANCELLED' },
            endDate: { gte: new Date() }
        },
        include: {
            space: {
                select: {
                    id: true,
                    name: true,
                    location: { select: { id: true, name: true } }
                }
            },
            operator: {
                select: { id: true, companyName: true }
            }
        },
        orderBy: { startDate: 'asc' },
        take: 50
    })
}

interface CreateBookingData {
    spaceId: string
    operatorId: string
    startDate: string
    endDate: string
    brand?: string
    setupDetail?: string
    description?: string
    dailyRate?: number
    status?: BookingStatus
    notes?: string
    patCertNumber?: string
    patExpiryDate?: string
    equipmentList?: string
}

export async function createBooking(data: CreateBookingData) {
    const space = await prisma.space.findUnique({
        where: { id: data.spaceId },
        select: { locationId: true, defaultDailyRate: true }
    })
    if (!space) throw new Error('Space not found')

    const operator = await prisma.operator.findUnique({
        where: { id: data.operatorId },
        select: { id: true, companyName: true, isActive: true }
    })
    if (!operator || !operator.isActive) throw new Error('Operator not found or inactive')

    const user = await verifyRMOrAdmin(space.locationId)
    const reference = await generateBookingReference()

    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const rate = data.dailyRate ?? (space.defaultDailyRate ? Number(space.defaultDailyRate) : null)
    const totalValue = rate ? rate * days : null

    const booking = await prisma.spaceBooking.create({
        data: {
            spaceId: data.spaceId,
            operatorId: data.operatorId,
            reference,
            startDate: start,
            endDate: end,
            companyName: operator.companyName,
            brand: data.brand,
            setupDetail: data.setupDetail,
            description: data.description,
            dailyRate: rate,
            totalValue,
            status: data.status || 'UNCONFIRMED',
            notes: data.notes,
            patCertNumber: data.patCertNumber,
            patExpiryDate: data.patExpiryDate ? new Date(data.patExpiryDate) : undefined,
            equipmentList: data.equipmentList,
            createdById: user.id
        }
    })

    revalidatePath(`/dashboard/regional/spaces/${space.locationId}`)
    revalidatePath('/dashboard/regional')
    return { success: true, booking }
}

interface UpdateBookingData {
    operatorId?: string
    startDate?: string
    endDate?: string
    brand?: string
    setupDetail?: string
    description?: string
    dailyRate?: number
    notes?: string
    patCertNumber?: string
    patExpiryDate?: string
    equipmentList?: string
}

export async function updateBooking(bookingId: string, data: UpdateBookingData) {
    const existing = await prisma.spaceBooking.findUnique({
        where: { id: bookingId },
        include: { space: { select: { locationId: true } } }
    })
    if (!existing) throw new Error('Booking not found')

    await verifyRMOrAdmin(existing.space.locationId)

    const updateData: Record<string, unknown> = { ...data }

    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    if (data.patExpiryDate) updateData.patExpiryDate = new Date(data.patExpiryDate)

    if (data.operatorId) {
        const op = await prisma.operator.findUnique({
            where: { id: data.operatorId },
            select: { companyName: true }
        })
        if (op) updateData.companyName = op.companyName
    }

    if (data.startDate || data.endDate || data.dailyRate !== undefined) {
        const start = data.startDate ? new Date(data.startDate) : existing.startDate
        const end = data.endDate ? new Date(data.endDate) : existing.endDate
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const rate = data.dailyRate ?? (existing.dailyRate ? Number(existing.dailyRate) : null)
        updateData.totalValue = rate ? rate * days : null
    }

    const booking = await prisma.spaceBooking.update({
        where: { id: bookingId },
        data: updateData
    })

    revalidatePath(`/dashboard/regional/spaces/${existing.space.locationId}`)
    revalidatePath('/dashboard/regional')
    return { success: true, booking }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    const existing = await prisma.spaceBooking.findUnique({
        where: { id: bookingId },
        include: {
            space: { select: { locationId: true } },
            operator: {
                include: { licenses: true }
            }
        }
    })
    if (!existing) throw new Error('Booking not found')

    await verifyRMOrAdmin(existing.space.locationId)

    // Compliance gate: block confirmation unless operator passes checks
    if (status === 'CONFIRMED' && existing.operator) {
        const { checkBookingCompliance } = await import('@/lib/compliance-utils')
        const compliance = checkBookingCompliance(
            {
                types: existing.operator.types,
                licenses: existing.operator.licenses.map(l => ({
                    type: l.type,
                    endDate: l.endDate,
                    coverValue: l.coverValue ? Number(l.coverValue) : null,
                }))
            },
            {
                patCertNumber: existing.patCertNumber,
                patExpiryDate: existing.patExpiryDate,
                equipmentList: existing.equipmentList,
            }
        )
        if (!compliance.canConfirm) {
            throw new Error(`Cannot confirm — compliance issues:\n• ${compliance.issues.join('\n• ')}`)
        }
    }

    if (status === 'CONFIRMED' && !existing.operatorId) {
        throw new Error('Cannot confirm a booking without an operator. Please assign an operator first.')
    }

    const booking = await prisma.spaceBooking.update({
        where: { id: bookingId },
        data: { status }
    })

    revalidatePath(`/dashboard/regional/spaces/${existing.space.locationId}`)
    revalidatePath('/dashboard/regional')
    return { success: true, booking }
}

export async function searchBookings(
    query: string,
    filters?: {
        status?: BookingStatus
        locationId?: string
        startDate?: string
        endDate?: string
    }
) {
    const user = await verifyRMOrAdmin(filters?.locationId)

    const where: Record<string, unknown> = {}

    if (user.role === 'REGIONAL_MANAGER' && user.name) {
        where.space = {
            location: { regionalManager: user.name, isManaged: true },
            isActive: true
        }
    } else if (filters?.locationId) {
        where.space = { locationId: filters.locationId, isActive: true }
    }

    if (query) {
        where.OR = [
            { companyName: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { reference: { contains: query, mode: 'insensitive' } },
            { operator: { companyName: { contains: query, mode: 'insensitive' } } },
            { operator: { tradingName: { contains: query, mode: 'insensitive' } } },
        ]
    }

    if (filters?.status) where.status = filters.status
    if (filters?.startDate) where.startDate = { gte: new Date(filters.startDate) }
    if (filters?.endDate) where.endDate = { lte: new Date(filters.endDate) }

    return prisma.spaceBooking.findMany({
        where,
        include: {
            space: {
                select: {
                    id: true,
                    name: true,
                    location: { select: { id: true, name: true } }
                }
            },
            operator: {
                select: { id: true, companyName: true, tradingName: true }
            }
        },
        orderBy: { startDate: 'desc' },
        take: 100
    })
}

// --- Location helpers ---

export async function getManagedLocationsForSpaces() {
    const user = await verifyRMOrAdmin()

    if (user.role === 'ADMIN') {
        return prisma.location.findMany({
            where: { isManaged: true },
            select: { id: true, name: true, city: true, type: true },
            orderBy: { name: 'asc' }
        })
    }

    if (!user.name) return []
    return prisma.location.findMany({
        where: { isManaged: true, regionalManager: user.name },
        select: { id: true, name: true, city: true, type: true },
        orderBy: { name: 'asc' }
    })
}
