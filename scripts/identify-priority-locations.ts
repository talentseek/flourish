#!/usr/bin/env tsx
/**
 * Identify priority locations for tenant enrichment
 * These are locations:
 * - Within 50 miles of a managed location
 * - Have a website
 * - Don't have tenants yet
 */
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function main() {
    console.log('=== IDENTIFYING PRIORITY LOCATIONS FOR TENANT ENRICHMENT ===\n');

    const managed = await prisma.location.findMany({ where: { isManaged: true } });
    console.log('Managed locations:', managed.length);

    // Find all locations with websites but no/few tenants
    const candidates = await prisma.location.findMany({
        where: {
            website: { not: null },
            isManaged: false
        },
        include: { _count: { select: { tenants: true } } }
    });

    const noTenants = candidates.filter(c => c._count.tenants === 0);
    console.log('Locations with websites but no tenants:', noTenants.length);

    // Find which are near managed locations (within 50mi)
    const priorityIds: string[] = [];
    const priorityList: any[] = [];

    for (const candidate of noTenants) {
        for (const m of managed) {
            const dist = getDistance(
                Number(m.latitude), Number(m.longitude),
                Number(candidate.latitude), Number(candidate.longitude)
            );
            if (dist <= 50) {
                if (!priorityIds.includes(candidate.id)) {
                    priorityIds.push(candidate.id);
                    priorityList.push({
                        id: candidate.id,
                        name: candidate.name,
                        website: candidate.website,
                        nearestManaged: m.name,
                        distance: Math.round(dist)
                    });
                }
                break;
            }
        }
    }

    // Sort by distance
    priorityList.sort((a, b) => a.distance - b.distance);

    console.log('\nPriority locations (near managed, have website, no tenants):', priorityList.length);
    console.log('\n=== TOP 30 PRIORITY LOCATIONS ===\n');

    priorityList.slice(0, 30).forEach((p, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${p.name.substring(0, 40).padEnd(42)} ${p.distance}mi from ${p.nearestManaged.substring(0, 25)}`);
    });

    // Save to file for enrichment script
    writeFileSync('/tmp/priority-location-ids.json', JSON.stringify(priorityIds, null, 2));
    writeFileSync('/tmp/priority-locations.json', JSON.stringify(priorityList, null, 2));

    console.log('\n=== SAVED ===');
    console.log('Priority IDs:', priorityIds.length, '→ /tmp/priority-location-ids.json');
    console.log('Full list:', priorityList.length, '→ /tmp/priority-locations.json');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
