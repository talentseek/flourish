
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching North West Region (Batch 1 - Retry)...');

    const updates = [
        {
            name: 'Altrincham Retail Park',
            website: 'https://www.stamfordquarter.com/directory/altrincham-retail-park/',
            owner: 'Park Place Retail',
            management: 'Park Place Retail',
            parking: 500, // Free (3h max)
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Angouleme Retail Park', // Correct DB Name
            website: 'http://www.angoulemeretailpark.co.uk/',
            owner: 'Picton',
            parking: 300,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Astley Bridge', // Short/Fuzzy match
            website: 'https://www.morganwilliams.co.uk/property/astley-bridge-retail-park/',
            owner: 'Realty Income',
            parking: 200,
            hours: { "Mon-Sat": "08:00-22:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Birchwood Shopping', // Matches Shopping Centre
            website: 'https://birchwoodshoppingcentre.co.uk/',
            owner: 'Birchwood Retail Properties Ltd',
            management: 'Ashdown Phillips & Partners',
            parking: 1000,
            carParkPrice: 0,
            hours: { "Mon-Sat": "09:00-17:30", "Sun": "10:00-16:00" }
        },
        {
            name: 'Burnden Park Retail Park',
            website: 'https://orbit-developments.co.uk/our-properties/retail/burnden-park/',
            owner: 'Orbit Developments',
            parking: 580,
            hours: { "Mon-Fri": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Capitol Centre Retail Park',
            website: 'https://www.britishland.com/our-places/capitol-centre-preston',
            owner: 'British Land',
            parking: 1500,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Cockhedge Shopping Park',
            website: 'https://cockhedge.co.uk/',
            owner: 'Cockhedge Property Unit Trust / Altered Space',
            parking: 600,
            carParkPrice: 3.00,
            hours: { "Mon-Sat": "07:30-22:30", "Sun": "09:30-17:00" }
        },
        {
            name: 'Grand Junction Retail Park',
            website: 'https://www.completelyretail.co.uk/scheme/Grand-Junction-Retail-Park-Crewe',
            management: 'Premier Park (Parking)',
            parking: 800,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        }
    ];

    for (const u of updates) {
        // Relaxed search: Match name, ignore type (to catch SCs like Birchwood)
        let loc = await prisma.location.findFirst({
            where: {
                name: { contains: u.name, mode: 'insensitive' }
            }
        });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    management: u.management,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    carParkPrice: u.carParkPrice !== undefined ? u.carParkPrice : undefined,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${loc.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
