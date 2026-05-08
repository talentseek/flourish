'use server'

import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function verifyAdmin() {
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error('Unauthorized')
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true }
    })
    if (!dbUser || dbUser.role !== 'ADMIN') throw new Error('Unauthorized: Admin access required')
}

// ─── Create ─────────────────────────────────────────────

export async function createFloorMap(data: {
    locationId: string
    name: string
    imageUrl: string
    sortOrder?: number
}) {
    await verifyAdmin()

    return prisma.floorMap.create({
        data: {
            locationId: data.locationId,
            name: data.name,
            imageUrl: data.imageUrl,
            sortOrder: data.sortOrder || 0,
        }
    })
}

// ─── Update ─────────────────────────────────────────────

export async function updateFloorMap(
    id: string,
    data: { name?: string; imageUrl?: string; sortOrder?: number }
) {
    await verifyAdmin()

    return prisma.floorMap.update({
        where: { id },
        data,
    })
}

// ─── Delete ─────────────────────────────────────────────

export async function deleteFloorMap(id: string) {
    await verifyAdmin()

    // Unlink any spaces pinned to this map
    await prisma.space.updateMany({
        where: { floorMapId: id },
        data: { floorMapId: null, mapPinX: null, mapPinY: null },
    })

    return prisma.floorMap.delete({ where: { id } })
}

// ─── Read ───────────────────────────────────────────────

export async function getFloorMapsForLocation(locationId: string) {
    return prisma.floorMap.findMany({
        where: { locationId },
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
}

// ─── Pin Management ─────────────────────────────────────

export async function updateSpacePin(
    spaceId: string,
    floorMapId: string | null,
    x: number | null,
    y: number | null
) {
    await verifyAdmin()

    return prisma.space.update({
        where: { id: spaceId },
        data: {
            floorMapId,
            mapPinX: x,
            mapPinY: y,
        },
    })
}

export async function removeSpacePin(spaceId: string) {
    await verifyAdmin()

    return prisma.space.update({
        where: { id: spaceId },
        data: {
            floorMapId: null,
            mapPinX: null,
            mapPinY: null,
        },
    })
}

// ─── Space Images ───────────────────────────────────────

export async function addSpaceImage(spaceId: string, imageUrl: string) {
    await verifyAdmin()

    const space = await prisma.space.findUnique({
        where: { id: spaceId },
        select: { images: true },
    })
    if (!space) throw new Error('Space not found')

    return prisma.space.update({
        where: { id: spaceId },
        data: { images: [...space.images, imageUrl] },
    })
}

export async function removeSpaceImage(spaceId: string, imageUrl: string) {
    await verifyAdmin()

    const space = await prisma.space.findUnique({
        where: { id: spaceId },
        select: { images: true },
    })
    if (!space) throw new Error('Space not found')

    return prisma.space.update({
        where: { id: spaceId },
        data: { images: space.images.filter((img: string) => img !== imageUrl) },
    })
}
