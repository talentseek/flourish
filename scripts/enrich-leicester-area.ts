/**
 * Leicester Area Enrichment Script
 * Generated from batch research on 2026-02-05
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TenantData {
    name: string
    category?: string
    isAnchorTenant?: boolean
}

interface LocationEnrichment {
    searchName: string
    updates: {
        website?: string
        openingHours?: any
        numberOfStores?: number
    }
    tenants: TenantData[]
}

const enrichments: LocationEnrichment[] = [
    // PRIORITY 1: 5-mile radius
    {
        searchName: 'Haymarket Shopping Centre',
        updates: {
            website: 'https://haymarketshoppingcentre.com',
            openingHours: { 'Monday': '07:30-19:00', 'Tuesday': '07:30-19:00', 'Wednesday': '07:30-19:00', 'Thursday': '07:30-19:00', 'Friday': '07:30-19:00', 'Saturday': '07:30-19:00', 'Sunday': '10:30-17:30' },
            numberOfStores: 60
        },
        tenants: [
            { name: 'Primark', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'TK Maxx', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Matalan', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'B&M', category: 'General Retail', isAnchorTenant: true },
            { name: 'Costa', category: 'Food & Beverage' },
            { name: 'Greggs', category: 'Food & Beverage' },
            { name: 'Caffe Nero', category: 'Food & Beverage' },
            { name: 'Holland & Barrett', category: 'Health & Beauty' },
            { name: 'Card Factory', category: 'General Retail' },
            { name: 'Ryman', category: 'General Retail' },
            { name: 'Metro Bank', category: 'Services' },
            { name: 'The Entertainer', category: 'Toys & Games' },
            { name: 'Shoe Zone', category: 'Fashion & Apparel' },
            { name: 'Cash Converters', category: 'Services' },
            { name: 'Warren James', category: 'Jewellery' },
            { name: 'eurochange', category: 'Services' },
            { name: 'Tesco Express', category: 'Supermarket' },
            { name: 'Heron Foods', category: 'Supermarket' },
            { name: 'One Beyond', category: 'General Retail' }
        ]
    },
    {
        searchName: 'Beaumont Shopping Centre',
        updates: {
            website: 'https://beaumontshoppingcentre.com',
            numberOfStores: 50
        },
        tenants: [
            { name: 'Tesco Extra', category: 'Supermarket', isAnchorTenant: true },
            { name: 'Next', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'B&M', category: 'General Retail', isAnchorTenant: true },
            { name: 'Aldi', category: 'Supermarket' },
            { name: 'Iceland', category: 'Supermarket' },
            { name: 'WHSmith', category: 'General Retail' },
            { name: 'Poundland', category: 'General Retail' },
            { name: 'Specsavers', category: 'Health & Beauty' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Shoe Zone', category: 'Fashion & Apparel' },
            { name: 'Peacocks', category: 'Fashion & Apparel' },
            { name: 'Bonmarché', category: 'Fashion & Apparel' },
            { name: 'The Works', category: 'General Retail' },
            { name: 'Pets at Home', category: 'Pets' },
            { name: 'Greggs', category: 'Food & Beverage' },
            { name: "McDonald's", category: 'Food & Beverage' },
            { name: 'Santander', category: 'Services' },
            { name: 'O2', category: 'Technology' },
            { name: 'Vodafone', category: 'Technology' }
        ]
    },
    {
        searchName: 'Fosse Park',
        updates: {
            website: 'https://fossepark.co.uk',
            numberOfStores: 90
        },
        tenants: [
            { name: 'Marks & Spencer', category: 'General Retail', isAnchorTenant: true },
            { name: 'Next', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'John Lewis', category: 'General Retail', isAnchorTenant: true },
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'H&M', category: 'Fashion & Apparel' },
            { name: 'Zara', category: 'Fashion & Apparel' },
            { name: 'River Island', category: 'Fashion & Apparel' },
            { name: 'Primark', category: 'Fashion & Apparel' },
            { name: 'JD Sports', category: 'Sports & Leisure' },
            { name: 'Sports Direct', category: 'Sports & Leisure' },
            { name: 'Dunelm', category: 'Home & Garden' },
            { name: 'Currys', category: 'Technology' },
            { name: 'Costa', category: 'Food & Beverage' },
            { name: 'Nando\'s', category: 'Food & Beverage' },
            { name: 'Five Guys', category: 'Food & Beverage' }
        ]
    },
    // PRIORITY 2: 10-mile radius
    {
        searchName: 'The Rushes',
        updates: {
            website: 'https://rushes-shopping.co.uk',
            numberOfStores: 16
        },
        tenants: [
            { name: 'Marks & Spencer', category: 'General Retail', isAnchorTenant: true },
            { name: 'TK Maxx', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Next', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Tesco', category: 'Supermarket', isAnchorTenant: true },
            { name: 'JD Sports', category: 'Sports & Leisure' },
            { name: 'Sports Direct', category: 'Sports & Leisure' },
            { name: 'Argos', category: 'General Retail' },
            { name: 'Pure Gym', category: 'Health & Fitness' },
            { name: 'Subway', category: 'Food & Beverage' },
            { name: 'Muffin Break', category: 'Food & Beverage' },
            { name: 'The Amber Rooms', category: 'Food & Beverage' },
            { name: 'Shoe Zone', category: 'Fashion & Apparel' }
        ]
    },
    // PRIORITY 3: 20-mile radius
    {
        searchName: 'Belvoir Shopping Centre',
        updates: {
            website: 'https://belvoirshoppingcentre.co.uk',
            numberOfStores: 35
        },
        tenants: [
            { name: 'Home Bargains', category: 'General Retail', isAnchorTenant: true },
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'Argos', category: 'General Retail' },
            { name: 'Iceland', category: 'Supermarket' },
            { name: 'Specsavers', category: 'Health & Beauty' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Card Factory', category: 'General Retail' },
            { name: 'Greggs', category: 'Food & Beverage' },
            { name: 'Costa', category: 'Food & Beverage' },
            { name: 'Halifax', category: 'Services' },
            { name: 'Nationwide', category: 'Services' },
            { name: 'Pure Gym', category: 'Health & Fitness' },
            { name: 'CeX', category: 'Technology' },
            { name: 'Shoe Zone', category: 'Fashion & Apparel' },
            { name: 'Bonmarche', category: 'Fashion & Apparel' }
        ]
    },
    {
        searchName: 'Britannia Shopping Centre',
        updates: {
            website: 'https://britanniashopping.co.uk',
            numberOfStores: 15
        },
        tenants: [
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'New Look', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Greggs', category: 'Food & Beverage' },
            { name: 'Claire\'s', category: 'Fashion & Apparel' },
            { name: 'Peacocks', category: 'Fashion & Apparel' },
            { name: 'Poundstretcher', category: 'General Retail' },
            { name: 'Card Factory', category: 'General Retail' },
            { name: 'O2', category: 'Technology' },
            { name: 'The Fragrance Shop', category: 'Health & Beauty' }
        ]
    },
    {
        searchName: 'The Crescent',
        updates: {
            numberOfStores: 12
        },
        tenants: [
            { name: 'Sainsbury\'s', category: 'Supermarket', isAnchorTenant: true },
            { name: 'TK Maxx', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Cineworld', category: 'Entertainment', isAnchorTenant: true },
            { name: 'Poundland', category: 'General Retail' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Argos', category: 'General Retail' },
            { name: 'Burger King', category: 'Food & Beverage' },
            { name: 'Costa', category: 'Food & Beverage' },
            { name: 'Prezzo', category: 'Food & Beverage' }
        ]
    },
    {
        searchName: 'Ropewalk Shopping Centre',
        updates: {
            website: 'https://ropewalknuneaton.co.uk',
            numberOfStores: 30
        },
        tenants: [
            { name: 'TK Maxx', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Next', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'New Look', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'H&M', category: 'Fashion & Apparel' },
            { name: 'River Island', category: 'Fashion & Apparel' },
            { name: 'Schuh', category: 'Fashion & Apparel' },
            { name: 'The Works', category: 'General Retail' },
            { name: 'Pandora', category: 'Jewellery' },
            { name: 'The Perfume Shop', category: 'Health & Beauty' },
            { name: 'The Body Shop', category: 'Health & Beauty' },
            { name: 'Pure Gym', category: 'Health & Fitness' },
            { name: 'Costa', category: 'Food & Beverage' },
            { name: 'Muffin Break', category: 'Food & Beverage' },
            { name: 'Yours Clothing', category: 'Fashion & Apparel' },
            { name: 'Roman Originals', category: 'Fashion & Apparel' }
        ]
    },
    {
        searchName: 'Abbeygate Shopping Centre',
        updates: {
            website: 'https://abbeygatecentre.co.uk',
            numberOfStores: 40
        },
        tenants: [
            { name: 'Peacocks', category: 'Fashion & Apparel', isAnchorTenant: true },
            { name: 'Poundstretcher', category: 'General Retail' },
            { name: 'Greggs', category: 'Food & Beverage' },
            { name: 'Subway', category: 'Food & Beverage' },
            { name: 'Ryman', category: 'General Retail' },
            { name: 'Savers', category: 'Health & Beauty' },
            { name: 'Card Factory', category: 'General Retail' },
            { name: 'TUI', category: 'Services' },
            { name: 'Post Office', category: 'Services' },
            { name: 'Scope', category: 'Charity Shop' },
            { name: 'Hinckley Building Society', category: 'Services' }
        ]
    },
    {
        searchName: 'Rugby Central',
        updates: {
            website: 'https://rugby-central.co.uk',
            numberOfStores: 50
        },
        tenants: [
            { name: 'B&M', category: 'General Retail', isAnchorTenant: true },
            { name: 'Dunelm', category: 'Home & Garden', isAnchorTenant: true },
            { name: 'Wilko', category: 'General Retail', isAnchorTenant: true },
            { name: 'Iceland', category: 'Supermarket' },
            { name: 'New Look', category: 'Fashion & Apparel' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Specsavers', category: 'Health & Beauty' },
            { name: 'Boots', category: 'Health & Beauty' },
            { name: 'The Works', category: 'General Retail' },
            { name: 'Poundland', category: 'General Retail' },
            { name: 'Game', category: 'Technology' },
            { name: 'CeX', category: 'Technology' },
            { name: 'O2', category: 'Technology' },
            { name: '3 Store', category: 'Technology' },
            { name: 'Hays Travel', category: 'Services' },
            { name: 'Timpson', category: 'Services' }
        ]
    },
    {
        searchName: 'Swansgate Centre',
        updates: {
            website: 'https://swansgateshoppingcentre.com',
            numberOfStores: 40
        },
        tenants: [
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'WHSmith', category: 'General Retail', isAnchorTenant: true },
            { name: 'Poundland', category: 'General Retail' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Specsavers', category: 'Health & Beauty' },
            { name: 'Clinton Cards', category: 'General Retail' },
            { name: 'Card Factory', category: 'General Retail' }
        ]
    },
    {
        searchName: 'Swadlincote Shopping Centre',
        updates: {
            numberOfStores: 20
        },
        tenants: [
            { name: 'Boots', category: 'Health & Beauty', isAnchorTenant: true },
            { name: 'Specsavers', category: 'Health & Beauty' },
            { name: 'Superdrug', category: 'Health & Beauty' },
            { name: 'Halfords', category: 'Automotive' },
            { name: "McDonald's", category: 'Food & Beverage' },
            { name: 'Sainsbury\'s', category: 'Supermarket' }
        ]
    },
    {
        searchName: 'Riley Square Shopping Centre',
        updates: {
            numberOfStores: 25
        },
        tenants: [
            { name: 'Farmfoods', category: 'Supermarket', isAnchorTenant: true },
            { name: 'Spar', category: 'Supermarket' },
            { name: 'Lloyds Pharmacy', category: 'Health & Beauty' },
            { name: 'Post Office', category: 'Services' },
            { name: 'Betfred', category: 'Services' },
            { name: 'ExtraCare Charity Shop', category: 'Charity Shop' },
            { name: 'Myton Hospices Shop', category: 'Charity Shop' }
        ]
    }
]

async function enrichLocations() {
    console.log('🚀 Starting Leicester Area Enrichment...\n')

    let updated = 0
    let tenantsAdded = 0

    for (const enrichment of enrichments) {
        const location = await prisma.location.findFirst({
            where: { name: { contains: enrichment.searchName, mode: 'insensitive' } }
        })

        if (!location) {
            console.log(`❌ ${enrichment.searchName}: NOT FOUND`)
            continue
        }

        // Update location fields
        await prisma.location.update({
            where: { id: location.id },
            data: enrichment.updates
        })

        // Add tenants (skip if already has tenants)
        const existingTenants = await prisma.tenant.count({
            where: { locationId: location.id }
        })

        if (existingTenants === 0 && enrichment.tenants.length > 0) {
            await prisma.tenant.createMany({
                data: enrichment.tenants.map(t => ({
                    locationId: location.id,
                    name: t.name,
                    category: t.category || 'General Retail',
                    isAnchorTenant: t.isAnchorTenant || false
                }))
            })
            tenantsAdded += enrichment.tenants.length
        }

        console.log(`✅ ${location.name}: Updated ${Object.keys(enrichment.updates).length} fields, ${enrichment.tenants.length} tenants`)
        updated++
    }

    console.log(`\n✨ Enrichment complete!`)
    console.log(`   Locations updated: ${updated}`)
    console.log(`   Tenants added: ${tenantsAdded}`)
    console.log(`\n📊 Run sync-location-stats.ts to recalculate numberOfStores and anchorTenants from actual tenant data.`)
}

enrichLocations()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
