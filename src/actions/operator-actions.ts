'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ComplianceStatus, LicenseCategory, OperatorType } from '@prisma/client'

// --- Auth Helpers ---

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

async function verifyRMOrAdmin() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized')

    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true, id: true }
    })

    if (!dbUser) throw new Error('Unauthorized')
    if (dbUser.role !== 'ADMIN' && dbUser.role !== 'REGIONAL_MANAGER') {
        throw new Error('Unauthorized: Insufficient permissions')
    }
    return dbUser
}

// --- Operator CRUD ---

export async function getOperators() {
    await verifyRMOrAdmin()

    return prisma.operator.findMany({
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
}

export async function getOperator(id: string) {
    await verifyRMOrAdmin()

    const operator = await prisma.operator.findUnique({
        where: { id },
        include: {
            licenses: {
                orderBy: { endDate: 'asc' }
            },
            bookings: {
                take: 10,
                orderBy: { startDate: 'desc' },
                include: {
                    space: {
                        select: { name: true, location: { select: { name: true } } }
                    }
                }
            }
        }
    })

    if (!operator) throw new Error('Operator not found')
    return operator
}

interface CreateOperatorData {
    companyName: string
    tradingName?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    website?: string
    types: OperatorType[]
    companiesHouseRef?: string
    notes?: string
}

export async function createOperator(data: CreateOperatorData) {
    await verifyAdmin()

    const operator = await prisma.operator.create({
        data: {
            companyName: data.companyName,
            tradingName: data.tradingName,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            address: data.address,
            website: data.website,
            types: data.types,
            companiesHouseRef: data.companiesHouseRef,
            notes: data.notes,
        }
    })

    revalidatePath('/admin/operators')
    return { success: true, operator }
}

interface UpdateOperatorData {
    companyName?: string
    tradingName?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    website?: string
    types?: OperatorType[]
    companiesHouseCheck?: ComplianceStatus
    companiesHouseDate?: string
    companiesHouseRef?: string
    creditCheck?: ComplianceStatus
    creditCheckDate?: string
    notes?: string
    isActive?: boolean
}

export async function updateOperator(id: string, data: UpdateOperatorData) {
    await verifyAdmin()

    const updateData: Record<string, unknown> = { ...data }
    if (data.companiesHouseDate) updateData.companiesHouseDate = new Date(data.companiesHouseDate)
    if (data.creditCheckDate) updateData.creditCheckDate = new Date(data.creditCheckDate)

    const operator = await prisma.operator.update({
        where: { id },
        data: updateData
    })

    revalidatePath('/admin/operators')
    return { success: true, operator }
}

export async function deleteOperator(id: string) {
    await verifyAdmin()

    await prisma.operator.update({
        where: { id },
        data: { isActive: false }
    })

    revalidatePath('/admin/operators')
    return { success: true }
}

// --- License CRUD ---

interface AddLicenseData {
    operatorId: string
    type: LicenseCategory
    reference?: string
    startDate: string
    endDate: string
    coverValue?: number
    isVerified?: boolean
    notes?: string
}

export async function addLicense(data: AddLicenseData) {
    await verifyAdmin()

    const license = await prisma.operatorLicense.create({
        data: {
            operatorId: data.operatorId,
            type: data.type,
            reference: data.reference,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            coverValue: data.coverValue,
            isVerified: data.isVerified || false,
            notes: data.notes,
        }
    })

    revalidatePath('/admin/operators')
    return { success: true, license }
}

interface UpdateLicenseData {
    type?: LicenseCategory
    reference?: string
    startDate?: string
    endDate?: string
    isVerified?: boolean
    notes?: string
}

export async function updateLicense(id: string, data: UpdateLicenseData) {
    await verifyAdmin()

    const updateData: Record<string, unknown> = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)

    const license = await prisma.operatorLicense.update({
        where: { id },
        data: updateData
    })

    revalidatePath('/admin/operators')
    return { success: true, license }
}

export async function removeLicense(id: string) {
    await verifyAdmin()

    await prisma.operatorLicense.delete({
        where: { id }
    })

    revalidatePath('/admin/operators')
    return { success: true }
}

// --- Queries ---

export async function getExpiringLicenses(days: number = 30) {
    await verifyAdmin()

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + days)

    return prisma.operatorLicense.findMany({
        where: {
            endDate: { lte: cutoff },
            operator: { isActive: true }
        },
        include: {
            operator: {
                select: { id: true, companyName: true, tradingName: true }
            }
        },
        orderBy: { endDate: 'asc' }
    })
}

export async function searchOperators(query: string) {
    await verifyRMOrAdmin()

    return prisma.operator.findMany({
        where: {
            isActive: true,
            OR: [
                { companyName: { contains: query, mode: 'insensitive' } },
                { tradingName: { contains: query, mode: 'insensitive' } },
                { contactName: { contains: query, mode: 'insensitive' } },
            ]
        },
        include: {
            licenses: {
                where: {
                    endDate: { gte: new Date() }
                },
                select: { type: true, endDate: true, coverValue: true }
            }
        },
        orderBy: { companyName: 'asc' },
        take: 20
    })
}

export async function getOperatorComplianceSummary() {
    await verifyAdmin()

    const now = new Date()
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)

    const [total, withExpiredLicenses, expiringWithin30Days] = await Promise.all([
        prisma.operator.count({ where: { isActive: true } }),
        prisma.operator.count({
            where: {
                isActive: true,
                licenses: {
                    some: { endDate: { lt: now } }
                }
            }
        }),
        prisma.operatorLicense.count({
            where: {
                endDate: { gte: now, lte: thirtyDays },
                operator: { isActive: true }
            }
        }),
    ])

    return { total, withExpiredLicenses, expiringWithin30Days }
}
