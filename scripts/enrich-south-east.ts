
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Broad Street Mall", url: "https://www.broadstreetmall.com/" },
    { name: "The Beacon", url: "https://thebeaconeastbourne.com/" }, // Eastbourne
    { name: "The Belfry Shopping Centre", url: "https://redhillbelfry.co.uk/" }, // Redhill
    { name: "Bicester Village", url: "https://www.thebicestercollection.com/bicester-village/" },
    { name: "Brighton Marina", url: "https://www.brightonmarina.co.uk/" },
    { name: "Castle Quay Shopping Centre", url: "https://castlequay.co.uk/" }, // Banbury
    { name: "Cascades Shopping Centre", url: "https://www.cascades-shopping.co.uk/" }, // Portsmouth
    { name: "Churchill Square", url: "https://churchillsquare.com/" }, // Brighton
    { name: "County Mall", url: "https://www.countymall.co.uk/" }, // Crawley
    { name: "County Square", url: "https://countysquareshoppingcentre.com/" }, // Ashford
    { name: "Dockside Outlet Centre", url: "https://www.chathamdockside.co.uk/" }, // Chatham
    { name: "Elmsleigh Shopping Centre", url: "https://www.elmsleigh.co.uk/" }, // Staines
    { name: "Eden Shopping Centre", url: "https://www.edenshopping.co.uk/" }, // High Wycombe

    // Batch B
    { name: "Friars Square Shopping Centre", url: "https://friarssquareshopping.com/" }, // Aylesbury
    { name: "Festival Place", url: "https://www.festivalplace.co.uk/" }, // Basingstoke
    { name: "Fremlin Walk", url: "https://fremlinwalk.co.uk/" }, // Maidstone
    { name: "Gunwharf Quays", url: "https://gunwharf-quays.com/" }, // Portsmouth
    { name: "Hale Leys Shopping Centre", url: "https://haleleys.co.uk/" }, // Aylesbury
    { name: "Hempstead Valley Shopping Centre", url: "https://www.hempsteadvalley.com/" }, // Gillingham
    { name: "Langney Shopping Centre", url: "https://langneyshoppingcentre.co.uk/" }, // Eastbourne
    { name: "Marriotts Walk", url: "https://www.marriottswalk.co.uk/" }, // Witney
    { name: "Midsummer Place", url: "https://midsummerplace.co.uk/" }, // Milton Keynes
    { name: "Old Market", url: "https://oldmarkethereford.co.uk/" }, // Hereford (Technically West Midlands, but found in this batch search)
    { name: "Priory Shopping Centre", url: "https://www.theprioryshoppingcentre.co.uk/" }, // Dartford
    { name: "Regent Arcade", url: "https://regentarcade.co.uk/" }, // Cheltenham (South West/Midlands border)

    // Batch C
    { name: "Royal Victoria Place", url: "https://royalvictoriaplace.co.uk/" }, // Tunbridge Wells
    { name: "Swan Walk", url: "https://www.swanwalkshopping.co.uk/" }, // Horsham
    { name: "The Friary", url: "https://thefriaryguildford.com/" }, // Guildford
    { name: "The Mall Maidstone", url: "https://www.themallmaidstone.co.uk/" },
    { name: "The Oracle", url: "https://www.theoracle.com/" }, // Reading
    { name: "The Square Camberley", url: "https://thesqcamberley.co.uk/" },
    { name: "Westgate Oxford", url: "https://westgateoxford.co.uk/" },
    { name: "Westquay", url: "https://www.west-quay.co.uk/" }, // Southampton
    { name: "Whiteley Shopping Centre", url: "https://www.whiteleyshopping.co.uk/" }, // Fareham
    { name: "Windsor Yards", url: "https://windsorroyal.co.uk/" } // Now Windsor Royal
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting South East Enrichment (${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // Use loose matching for names to catch slight variations
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: t.name, mode: 'insensitive' }
            }
        });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB: ${t.name}`);
            continue;
        }

        const location = locs[0];
        console.log(`   ✅ Matched: ${location.name} (ID: ${location.id}) - ${location.city}`);

        const updateData: any = { website: t.url };

        // Scrape Socials
        try {
            const resp = await axios.get(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 8000
            });
            const $ = cheerio.load(resp.data);

            $('a[href]').each((_, el) => {
                const href = $(el).attr('href')?.toLowerCase();
                if (!href) return;

                if (href.includes('facebook.com') && !href.includes('sharer')) updateData.facebook = $(el).attr('href');
                if (href.includes('instagram.com')) updateData.instagram = $(el).attr('href');
                if (href.includes('twitter.com') || href.includes('x.com')) updateData.twitter = $(el).attr('href');
            });

            if (Object.keys(updateData).length > 1) {
                console.log(`   found socials:`, Object.keys(updateData).filter(k => k !== 'website'));
            }
        } catch (e) {
            console.log(`   ⚠️ Scraping failed/timeout, saving URL only.`);
        }

        await prisma.location.update({
            where: { id: location.id },
            data: updateData
        });
        successCount++;
        await delay(500);
    }

    console.log(`\n🎉 South East Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
