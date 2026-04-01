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
export async function getLocationsForAdmin(page = 1, pageSize = 20, search = "", regionalManagerFilter = "") {
    await verifyAdmin()

    const whereConditions: Record<string, unknown>[] = []

    // Search filter
    if (search) {
        whereConditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { city: { contains: search, mode: 'insensitive' as const } },
                { postcode: { contains: search, mode: 'insensitive' as const } }
            ]
        })
    }

    // Regional Manager filter
    if (regionalManagerFilter) {
        if (regionalManagerFilter === "unassigned") {
            whereConditions.push({ regionalManager: null, isManaged: true })
        } else if (regionalManagerFilter === "managed") {
            whereConditions.push({ isManaged: true })
        } else {
            whereConditions.push({ regionalManager: regionalManagerFilter })
        }
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

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

// Create a new user (admin only)
export async function createUser(data: {
    name: string
    email: string
    password: string
    role: Role
}) {
    await verifyAdmin()

    const { name, email, password, role } = data

    if (!name || !email || !password) {
        throw new Error("Name, email, and password are required")
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters")
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        throw new Error("A user with this email already exists")
    }

    // Use BetterAuth's internal sign-up to handle password hashing properly
    const result = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
        },
        headers: await headers(),
    })

    if (!result?.user?.id) {
        throw new Error("Failed to create user account")
    }

    // Set the role (BetterAuth defaults to USER)
    if (role !== 'USER') {
        await prisma.user.update({
            where: { id: result.user.id },
            data: { role }
        })
    }

    revalidatePath("/admin/users")
    return { success: true, userId: result.user.id }
}

// Delete a user (admin only)
export async function deleteUser(userId: string) {
    await verifyAdmin()

    // Prevent deleting yourself
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (session?.user?.id === userId) {
        throw new Error("You cannot delete your own account")
    }

    // Prevent deleting the last admin
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
        throw new Error("User not found")
    }

    if (targetUser.role === 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
        if (adminCount <= 1) {
            throw new Error("Cannot delete the last admin user")
        }
    }

    // Cascade delete auth records
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.member.deleteMany({ where: { userId } })
    await prisma.invitation.deleteMany({ where: { inviterId: userId } })
    await prisma.user.delete({ where: { id: userId } })

    revalidatePath("/admin/users")
    return { success: true }
}
