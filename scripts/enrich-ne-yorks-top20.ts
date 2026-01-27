
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 20 Priority Sites (North East & Yorkshire)...');

    const updates = [
        // --- North East Priority (1-10) ---
        {
            name: 'Teesside Retail Park',
            website: 'https://teessideshopping.co.uk/',
            owner: 'British Land',
            management: 'British Land',
            parking: 4000,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Arnison Centre',
            website: 'https://completelyretail.co.uk/scheme/Arnison-Shopping-Park-Durham',
            owner: 'Sovereign Centros / CBRE Global Investors',
            parking: 1300, // 4h max
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Morton Park',
            website: 'https://morrisons.com', // Anchor
            owner: 'Rockspring / Caisson',
            parking: 600,
            hours: { "Mon-Sat": "07:00-22:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Metro Retail Park',
            website: 'https://themetrocentre.co.uk/',
            owner: 'Metrocentre Partnership / Sovereign Centros',
            management: 'Savills',
            parking: 2000, // 4h max (Retail Park section)
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Abraham Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Abraham-Enterprise-Park-Bishop-Auckland',
            owner: 'Metric Property', // Historical reference, likely fragmented 
            parking: 300,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Northumberland Retail Park',
            website: 'https://northumberlandretailpark.com/',
            owner: 'Northumberland Estates',
            parking: 300,
            hours: { "Mon-Sat": "08:00-22:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Dragonville Retail Park', // M Park Dragonville
            website: 'https://lcpgroup.co.uk/scheme/Dragonville-Retail-Park-Durham',
            owner: 'LCP Group',
            parking: 350,
            hours: { "Mon-Sat": "07:00-22:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Teesbay Retail Park',
            website: 'https://explorehartlepool.com/business-directory/teesbay-retail-park',
            owner: 'Mason Partners',
            parking: 600, // 24h
            hours: { "Mon-Sun": "00:00-23:59" }
        },
        {
            name: 'Hylton Riverside Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Hylton-Riverside-Retail-Park-Sunderland',
            owner: 'Tristan Capital Partners',
            parking: 500, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Westmorland Retail Park',
            website: 'https://manorwalks.co.uk/', // Adjacent
            owner: 'Advance Northumberland',
            parking: 500, // Free
            hours: { "Mon-Sat": "08:00-18:00", "Sun": "09:30-16:30" }
        },

        // --- Yorkshire Priority (1-10) ---
        {
            name: 'Fox Valley',
            website: 'https://foxvalleysheffield.co.uk/',
            owner: 'Dransfield Properties',
            parking: 600, // 4h free
            hours: { "Mon-Sat": "09:00-17:30", "Sun": "10:00-16:00" }
        },
        {
            name: 'Xscape Yorkshire',
            website: 'https://xscapeyorkshire.co.uk/',
            owner: 'Landsec',
            parking: 1400, // Free
            hours: { "Mon-Sun": "06:00-23:59" } // Complex hours
        },
        {
            name: 'The Springs',
            website: 'https://thesprings-leeds.co.uk/',
            owner: 'Scarborough Group / Legal & General',
            management: 'Savills',
            parking: 900, // 5h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'St. Andrews Quay', // DB name likely 'St. Andrews Quay Retail Park' or 'St Andrews Quay'
            website: 'https://standrews-quay.co.uk/',
            owner: 'CBRE / Orchard Street',
            parking: 1280,
            hours: { "Mon-Sat": "07:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Drakehouse Retail Park',
            website: 'https://drakehouseretailpark.co.uk/',
            owner: 'Hines UK',
            parking: 750, // Free
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Forster Square',
            website: 'https://forstersquare.co.uk/',
            owner: 'British Land',
            parking: 1300, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Crown Point Shopping Park',
            website: 'https://crownpoint-shopping.co.uk/',
            owner: 'The Crown Estate / Aviva Investors',
            management: 'JLL',
            parking: 928, // 3h max strict
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Kingswood Retail Park',
            website: 'https://kingswoodparks.co.uk/',
            owner: 'Legal & General',
            parking: 1000,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Leeds Road Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Leeds-Road-Retail-Park-Huddersfield',
            owner: 'LaSalle Investment Management',
            parking: 710,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Enterprise Five',
            website: 'https://morrisons.com', // Anchor
            owner: 'NewRiver',
            parking: 800, // Free
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        }
    ];

    for (const u of updates) {
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
