'use server'

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getRegionalLocations() {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
        throw new Error("Unauthorized: Not logged in.");
    }

    // Fetch the full user from DB to get the role
    const dbUser = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, name: true }
    });

    if (!dbUser || dbUser.role !== 'REGIONAL_MANAGER') {
        throw new Error("Unauthorized: Regional Manager access required.");
    }

    if (!dbUser.name) {
        return [];
    }

    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            regionalManager: dbUser.name
        },
        select: {
            id: true,
            name: true,
            address: true,
            postcode: true,
            city: true,
            latitude: true,
            longitude: true,
            footfall: true,
            retailSpace: true,
            numberOfStores: true,
            topPages: true,
            seoKeywords: true,
            tenants: {
                select: {
                    name: true,
                    category: true
                }
            }
        }
    });

    return locations;
}
