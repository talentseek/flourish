#!/usr/bin/env tsx
/**
 * Import Pentagon tenants from CSV file
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

// Category mapping based on store names
function categorizeStore(name: string): { category: string; isAnchor: boolean } {
    const lowerName = name.toLowerCase();

    // Anchors
    const anchors = ['boots', 'sainsbury', 'asda', 'tesco', 'primark', 'tk maxx', 'h&m', 'marks & spencer', 'new look', 'jd sports', 'sports direct', 'next'];
    const isAnchor = anchors.some(a => lowerName.includes(a));

    // Categories
    if (['costa', 'starbucks', 'greggs', 'subway', 'mcdonald', 'kfc', 'nando', 'coffee', 'cafe', 'pizza', 'food', 'eat', 'burger', 'kebab', 'bakery', 'muffin'].some(k => lowerName.includes(k))) {
        return { category: 'Food & Beverage', isAnchor };
    }
    if (['boots', 'superdrug', 'specsaver', 'optician', 'pharmacy', 'beauty', 'salon', 'barber', 'hair', 'nail'].some(k => lowerName.includes(k))) {
        return { category: 'Health & Beauty', isAnchor };
    }
    if (['fashion', 'clothing', 'new look', 'primark', 'h&m', 'river island', 'next', 'peacock', 'shoe', 'clarks', 'foot'].some(k => lowerName.includes(k))) {
        return { category: 'Fashion & Apparel', isAnchor };
    }
    if (['phone', 'mobile', 'ee', 'o2', 'vodafone', 'three', 'tech', 'game', 'electronic', 'argos', 'currys'].some(k => lowerName.includes(k))) {
        return { category: 'Electronics & Technology', isAnchor };
    }
    if (['jewel', 'h samuel', 'pandora', 'warren james', 'watch'].some(k => lowerName.includes(k))) {
        return { category: 'Jewelry & Accessories', isAnchor };
    }
    if (['bank', 'building society', 'halifax', 'natwest', 'barclays', 'lloyds', 'hsbc', 'post office', 'travel', 'estate agent', 'insurance', 'recruitment', 'adecco'].some(k => lowerName.includes(k))) {
        return { category: 'Services', isAnchor };
    }
    if (['sports', 'jd', 'fitness', 'gym'].some(k => lowerName.includes(k))) {
        return { category: 'Sports & Outdoors', isAnchor };
    }
    if (['home', 'garden', 'furniture', 'the range', 'wilko', 'b&m'].some(k => lowerName.includes(k))) {
        return { category: 'Home & Garden', isAnchor };
    }
    if (['toy', 'entertainer', 'kids', 'baby'].some(k => lowerName.includes(k))) {
        return { category: 'Kids & Toys', isAnchor };
    }
    if (['card', 'gift', 'book', 'works', 'whsmith', 'clintons'].some(k => lowerName.includes(k))) {
        return { category: 'Entertainment', isAnchor };
    }
    if (['poundland', 'pound', 'discount', 'b&m', 'home bargains'].some(k => lowerName.includes(k))) {
        return { category: 'Discount Store', isAnchor };
    }

    return { category: 'General Retail', isAnchor };
}

async function main() {
    // Find Pentagon location
    const pentagon = await prisma.location.findFirst({
        where: { name: { contains: 'Pentagon' }, city: { contains: 'Chatham' } }
    });

    if (!pentagon) {
        console.log('❌ Pentagon Shopping Centre not found');
        return;
    }

    console.log(`📍 Found Pentagon: ${pentagon.id} - ${pentagon.name}`);

    // Read CSV
    const csv = readFileSync('./public/pentagonshoppingcentre.csv', 'utf-8');
    const lines = csv.split('\n').slice(1).filter(l => l.trim()); // Skip header

    console.log(`📋 Found ${lines.length} stores in CSV`);

    let added = 0;
    let skipped = 0;

    for (const line of lines) {
        // Parse CSV line (simple format: url,name)
        const match = line.match(/^"([^"]+)","([^"]+)"/);
        if (!match) continue;

        const [, url, name] = match;
        const { category, isAnchor } = categorizeStore(name);

        try {
            await prisma.tenant.upsert({
                where: { locationId_name: { locationId: pentagon.id, name } },
                create: {
                    locationId: pentagon.id,
                    name,
                    category,
                    isAnchorTenant: isAnchor,
                },
                update: {
                    category,
                    isAnchorTenant: isAnchor,
                },
            });
            added++;
            console.log(`  ✅ ${name} → ${category}${isAnchor ? ' [ANCHOR]' : ''}`);
        } catch (e) {
            skipped++;
        }
    }

    console.log(`\n📊 Results: ${added} added, ${skipped} skipped`);

    // Update location store count
    await prisma.location.update({
        where: { id: pentagon.id },
        data: { numberOfStores: added }
    });

    console.log(`✅ Pentagon now has ${added} tenants`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
