'use server'

import { auth, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function getRegionalLocations() {
    const user = await getSessionUser();

    if (!user || user.role !== 'REGIONAL_MANAGER') {
        throw new Error("Unauthorized: Regional Manager access required.");
    }

    // We match based on name "Giorgia Shepherd" or similar logic.
    // Ideally, we'd link user ID to location, but currently we rely on name matching string.
    // Let's use the user's name.

    if (!user.name) {
        return [];
    }

    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            regionalManager: user.name // Matches "Giorgia Shepherd"
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
            topPages: true, // For AI context
            seoKeywords: true, // For AI context
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
