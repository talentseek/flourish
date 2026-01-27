
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 10 Priority Retail Parks (Batch 3)...');

    const updates = [
        {
            name: 'Stockport Exchange',
            website: 'https://www.stockportexchange.co.uk/',
            owner: 'Muse Developments & Stockport Council',
            parking: 1000, // NCP managed
            hours: { "Mon-Sun": "00:00-23:59" } // Open access
        },
        {
            name: 'Parc-y-Llyn Retail Park', // Aberystwyth
            website: 'https://www.evolveestates.com/portfolio/parc-y-llyn-retail-park-aberystwyth/', // Parent site as best rep
            owner: 'Evolve Estates (M Core)',
            management: 'M Core',
            parking: 500, // Free
            hours: { "Mon-Sun": "08:00-22:00" }
        },
        {
            name: 'Clifton Moor Centre Retail Park', // York
            website: 'https://clifton-moor.co.uk/',
            owner: 'Melford Capital', // Acquired 2022
            parking: 1300, // 4 hours free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Parkgate Shopping', // Rotherham
            website: 'https://www.parkgateshopping.co.uk/',
            owner: 'Columbia Threadneedle', // Acquired 2024
            parking: 2000, // 5 hours free
            hours: { "Mon-Fri": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Glasgow Fort Shopping Park',
            website: 'https://www.glasgowfort.com/',
            owner: 'British Land',
            management: 'British Land',
            parking: 2500, // Free
            hours: { "Mon-Fri": "09:00-22:00", "Sat": "09:00-20:00", "Sun": "10:00-19:00" }
        },
        {
            name: 'Fort Kinnaird Shopping Park', // Edinburgh
            website: 'https://www.fortkinnaird.com/',
            owner: 'British Land & M&G Real Estate',
            management: 'British Land',
            parking: 2600, // Free
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Newport Retail Park',
            website: 'https://www.newport-retailpark.co.uk/',
            owner: 'Stadium Developments',
            parking: 1000, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Metro Park West Retail Park', // Gateshead
            website: 'https://themetrocentre.co.uk/', // Part of Metrocentre estate
            owner: 'Metrocentre Partnership (Sovereign Centros)',
            parking: 850, // 4 hours free (unlike main centre)
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Trostre Retail Park', // Llanelli
            website: 'https://www.parctrostreretailpark.co.uk/',
            owner: 'M&G Real Estate',
            parking: 2000, // 3 hours free (ANPR enforced)
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Rushden Lakes Shopping Centre', // Northamptonshire
            website: 'https://www.rushdenlakes.com/',
            owner: 'The Crown Estate',
            parking: 1000, // 5 hours free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        }
    ];

    for (const u of updates) {
        let loc = await prisma.location.findFirst({ where: { name: u.name } });
        if (!loc) {
            loc = await prisma.location.findFirst({ where: { name: { contains: u.name } } });
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    management: u.management,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${u.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
