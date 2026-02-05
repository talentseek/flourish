/**
 * Sync Location Stats from Tenant Data
 * 
 * This script recalculates stale fields from actual tenant data:
 * - numberOfStores = count of tenants
 * - anchorTenants = count of isAnchorTenant: true
 * - largestCategoryPercent = recalculate from category distribution
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncLocationStats() {
    console.log('🔄 Starting location stats sync...\n')

    // Get all locations with tenants
    const locations = await prisma.location.findMany({
        include: {
            tenants: {
                select: {
                    id: true,
                    category: true,
                    isAnchorTenant: true
                }
            }
        }
    })

    console.log(`Found ${locations.length} locations to process\n`)

    let updated = 0
    let skipped = 0

    for (const location of locations) {
        const tenantCount = location.tenants.length
        const anchorCount = location.tenants.filter(t => t.isAnchorTenant).length

        // Calculate largest category percentage
        const categoryCount: Record<string, number> = {}
        location.tenants.forEach(t => {
            if (t.category) {
                categoryCount[t.category] = (categoryCount[t.category] || 0) + 1
            }
        })

        let largestCategory: string | null = null
        let largestCategoryPercent: number | null = null

        if (tenantCount > 0 && Object.keys(categoryCount).length > 0) {
            const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])
            largestCategory = sorted[0][0]
            largestCategoryPercent = sorted[0][1] / tenantCount // Stored as decimal (0.22 for 22%)
        }

        // Check if update needed
        const needsUpdate =
            location.numberOfStores !== tenantCount ||
            location.anchorTenants !== anchorCount

        if (!needsUpdate && tenantCount === 0) {
            skipped++
            continue
        }

        // Update the location
        await prisma.location.update({
            where: { id: location.id },
            data: {
                numberOfStores: tenantCount,
                anchorTenants: anchorCount,
                largestCategory: largestCategory,
                largestCategoryPercent: largestCategoryPercent
            }
        })

        console.log(`✅ ${location.name}`)
        console.log(`   Stores: ${location.numberOfStores || 'null'} → ${tenantCount}`)
        console.log(`   Anchors: ${location.anchorTenants || 'null'} → ${anchorCount}`)
        if (largestCategory) {
            console.log(`   Category: ${largestCategory} (${(largestCategoryPercent! * 100).toFixed(1)}%)`)
        }
        console.log('')
        updated++
    }

    console.log(`\n✨ Sync complete!`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
}

syncLocationStats()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
