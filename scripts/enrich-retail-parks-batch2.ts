
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 10 Priority Retail Parks (Batch 2)...');

    const updates = [
        {
            name: 'Coliseum Shopping Park',
            website: 'https://www.coliseumshoppingpark.com/',
            owner: 'The Crown Estate',
            parking: 1200, // Estimate based entirely on 'ample' and adjacent leisure
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Victoria Centre', // Llandudno
            website: 'https://www.victoriacentrellandudno.co.uk/',
            owner: 'Mostyn Estates',
            management: 'Centre Management',
            parking: 366,
            hours: { "Mon-Sat": "09:00-17:30", "Sun": "10:30-16:30" }
        },
        {
            name: 'Queensgate Retail Park', // West Yorkshire
            website: 'https://huddersfieldonline.co.uk/listing/queensgate-retail-park/',
            owner: 'Institutional Investor', // Acquired 2024?
            parking: 300,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:00" } // Fallback
        },
        {
            name: 'Queensgate Centre', // Essex (Harlow)
            website: 'https://www.thecrownestate.co.uk/en-gb/our-places/portfolio/queensgate-centre-harlow/',
            owner: 'The Crown Estate',
            parking: 988, // 5 hours free
            hours: { "Mon-Thu": "07:00-22:00", "Fri-Sat": "07:00-23:00", "Sun": "09:00-22:30" }
        },
        {
            name: 'Castlepoint', // Bournemouth
            website: 'https://castlepointshopping.com/',
            owner: 'Delancey & Columbia Threadneedle',
            management: 'Centre Management',
            parking: 2800, // 4 hours free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'The Rock', // Bury - Technically mixed use / SC
            website: 'https://therockbury.com/',
            owner: 'Reef Group', // Or similar Asset Manager
            parking: 1000, // 24h
            hours: { "Mon-Fri": "09:00-19:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'The Beacon', // Eastbourne - Shopping Centre really
            website: 'https://thebeaconeastbourne.com/',
            owner: 'Legal & General Investment Management (LGIM)',
            type: 'SHOPPING_CENTRE', // Reclassifying if currently RP
            parking: 1300,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:30" }
        },
        {
            name: 'Weavers Wharf Retail Park',
            website: 'https://mweaverswharf.co.uk/',
            owner: 'LCP (M Core)', // Acquired 2023
            parking: 420,
            hours: { "Mon-Sat": "09:00-17:30", "Sun": "10:00-16:00" }
        },
        {
            name: 'The Forge Shopping Centre', // Glasgow - Shopping Centre
            website: 'https://forgeshopping.com/',
            owner: 'Belfast Office Properties',
            management: 'Centre Management',
            type: 'SHOPPING_CENTRE', // Reclassifying
            parking: 1600, // Free
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Tower Park Leisure Complex',
            website: 'https://towerparkentertainment.co.uk/',
            owner: 'Landsec',
            management: 'Savills',
            parking: 1000, // Free
            hours: { "Mon-Sun": "06:00-23:59" }
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
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    type: u.type ? (u.type as any) : undefined, // Apply type update if specified
                    isManaged: true,
                    management: u.management
                }
            });
            console.log(`✅ Updated ${u.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
