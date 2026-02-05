import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface DeepData {
    instagram?: string;
    facebook?: string;
    parkingSpaces?: number;
    googleRating?: number;
    openedYear?: number;
}

async function fetchHTML(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) return null;
        return await response.text();
    } catch {
        return null;
    }
}

function extractSocialLinks(html: string): { instagram?: string, facebook?: string } {
    const $ = cheerio.load(html);
    const links: { instagram?: string, facebook?: string } = {};
    
    $('a[href*="instagram.com"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !links.instagram) links.instagram = href;
    });
    
    $('a[href*="facebook.com"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !links.facebook) links.facebook = href;
    });
    
    return links;
}

function extractParking(html: string): number | undefined {
    const $ = cheerio.load(html);
    const text = $('body').text().toLowerCase();
    
    // Look for patterns like "500 spaces", "parking for 1,200 cars"
    const match = text.match(/(\d{2,4})\s*(?:parking|car|spaces|bays)/);
    if (match) return parseInt(match[1].replace(/,/g, ''));
    
    return undefined;
}

async function main() {
    console.log("🐝 [Buzz] Managed Deep Data Enrichment");
    console.log("=".repeat(60));

    // Get managed locations with websites but missing social/parking
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            website: {
                not: null,
                notIn: ['https://thisisflourish.co.uk', 'http://thisisflourish.co.uk']
            },
            OR: [
                { instagram: null },
                { facebook: null },
                { parkingSpaces: null }
            ]
        }
    });

    console.log(`🏢 Found ${locations.length} targets for deep enrichment.`);

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        console.log(`\n[${i+1}/${locations.length}] Enriching ${loc.name}...`);
        
        const html = await fetchHTML(loc.website!);
        if (!html) {
            console.log(`   ❌ Could not fetch website.`);
            continue;
        }

        const updates: any = {};
        
        // 1. Social Links
        const social = extractSocialLinks(html);
        if (social.instagram && !loc.instagram) {
            console.log(`   📸 Found Instagram: ${social.instagram}`);
            updates.instagram = social.instagram;
        }
        if (social.facebook && !loc.facebook) {
            console.log(`   📘 Found Facebook: ${social.facebook}`);
            updates.facebook = social.facebook;
        }

        // 2. Parking
        const parking = extractParking(html);
        if (parking && loc.parkingSpaces === null) {
            console.log(`   🚗 Found Parking: ${parking} spaces`);
            updates.parkingSpaces = parking;
        }

        if (Object.keys(updates).length > 0) {
            await prisma.location.update({
                where: { id: loc.id },
                data: updates
            });
            console.log(`   ✅ Saved updates to database.`);
        } else {
            console.log(`   ℹ️  No new data found on homepage.`);
        }

        // Delay to be polite
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("\n🎉 Deep Data Batch Complete!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
