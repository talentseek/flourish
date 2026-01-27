
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching McArthurGlen & Associated Outlets...');

    const updates = [
        {
            name: 'Ashford Designer Outlet',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-ashford/',
            owner: 'McArthurGlen',
            parking: 2000, // Estimate
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "09:00-21:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'McArthurGlen Bridgend Designer Outlet',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-bridgend/',
            owner: 'M&G Real Estate',
            management: 'McArthurGlen',
            parking: 2000,
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'McArthurGlen Cheshire Oaks Designer Outlet',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/',
            owner: 'LaSalle Investment Management', // Acquired 2022
            management: 'McArthurGlen',
            parking: 3000,
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "09:00-21:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Designer Outlet East Midlands',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-east-midlands/',
            owner: 'McArthurGlen',
            management: 'McArthurGlen',
            parking: 1500,
            hours: { "Mon-Fri": "09:30-20:00", "Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'McArthurGlen Swindon Designer Outlet',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-swindon/',
            owner: 'Frasers Group', // Acquired Dec 2025
            management: 'McArthurGlen',
            parking: 1000,
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'McArthurGlen York Designer Outlet',
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-york/',
            owner: 'McArthurGlen',
            parking: 2800,
            hours: { "Mon-Fri": "09:30-20:00", "Sat": "09:30-20:00", "Sun": "10:00-18:00" }
        }
    ];

    for (const u of updates) {
        const loc = await prisma.location.findFirst({ where: { name: u.name } });
        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    management: u.management || 'McArthurGlen',
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${u.name}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
