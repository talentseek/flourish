"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

// Helper to verify admin access
async function verifyAdmin() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized: Not authenticated")
    }

    if (session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized: Admin access required")
    }

    return session.user
}

// Toggle location isManaged status
export async function toggleLocationManaged(locationId: string, isManaged: boolean) {
    await verifyAdmin()

    await prisma.location.update({
        where: { id: locationId },
        data: { isManaged }
    })

    revalidatePath("/admin/locations")
    return { success: true }
}

// Assign regional manager to location
export async function assignRegionalManager(locationId: string, managerName: string | null) {
    await verifyAdmin()

    await prisma.location.update({
        where: { id: locationId },
        data: { regionalManager: managerName }
    })

    revalidatePath("/admin/locations")
    return { success: true }
}

// Update user role
export async function updateUserRole(userId: string, role: Role) {
    await verifyAdmin()

    // Prevent removing last admin
    if (role !== 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
        const currentUser = await prisma.user.findUnique({ where: { id: userId } })

        if (adminCount === 1 && currentUser?.role === 'ADMIN') {
            throw new Error("Cannot demote the last admin user")
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role }
    })

    revalidatePath("/admin/users")
    return { success: true }
}

// Get all locations for admin table
export async function getLocationsForAdmin(page = 1, pageSize = 20, search = "") {
    await verifyAdmin()

    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { postcode: { contains: search, mode: 'insensitive' as const } }
        ]
    } : {}

    const [locations, total] = await Promise.all([
        prisma.location.findMany({
            where,
            select: {
                id: true,
                name: true,
                city: true,
                type: true,
                isManaged: true,
                regionalManager: true
            },
            orderBy: [
                { isManaged: 'desc' },
                { name: 'asc' }
            ],
            skip: (page - 1) * pageSize,
            take: pageSize
        }),
        prisma.location.count({ where })
    ])

    return { locations, total, page, pageSize }
}

// Get all regional managers
export async function getRegionalManagers() {
    await verifyAdmin()

    return prisma.user.findMany({
        where: { role: 'REGIONAL_MANAGER' },
        select: {
            id: true,
            name: true,
            email: true
        },
        orderBy: { name: 'asc' }
    })
}

// Get all users for admin table
export async function getUsersForAdmin() {
    await verifyAdmin()

    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: [
            { role: 'asc' },
            { name: 'asc' }
        ]
    })
}
