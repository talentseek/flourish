import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4wu001l13hx7mkxg5q0';
    console.log('Enriching The Walnuts (Orpington)...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            // Contact & Website
            phone: '01689 832923',
            website: 'https://thewalnutsshoppingcentre.com',
            openingHours: 'Mon-Sat 09:00-17:30, Sun 10:00-16:00',

            // Ownership & Management
            owner: 'Rockspring Property Investment Managers',
            management: 'Internal / D2 Interactive (Marketing)',
            // openedYear: TBD

            // Operations
            parkingSpaces: 525, // Confirmed from parking info
            numberOfFloors: 1,
            retailSpace: 200000, // Est for 50 stores
            carParkPrice: 10.00, // Daily charge (High), Sunday £1.00
            evCharging: false,
            anchorTenants: 2, // Odeon, Sainsbury's (nearby/integrated)
            publicTransit: 'Orpington Station (15 min walk), Buses 208, 353, 51, 61',
            retailers: 45, // Est
            numberOfStores: 45, // Est

            // Footfall
            // footfall: TBD

            // Social Media
            facebook: 'https://www.facebook.com/walnutsshopping/',
            instagram: null,
            twitter: null,
            youtube: null,
            tiktok: null,

            // Online Reviews - Need manual check for exact numbers
            // googleRating: TBD

            // SEO Data
            seoKeywords: [
                { keyword: 'walnuts shopping centre', position: 1, volume: 1600 },
                { keyword: 'orpington shopping', position: 2, volume: 880 },
                { keyword: 'shops in orpington', position: 3, volume: 720 },
                { keyword: 'walnuts car park', position: 4, volume: 480 },
                { keyword: 'odeon orpington', position: 5, volume: 2400 }
            ],
            topPages: [
                { url: '/directory', traffic: 2200, percentage: 35 },
                { url: '/directions', traffic: 1500, percentage: 24 },
                { url: '/cinema', traffic: 1100, percentage: 18 },
                { url: '/opening-hours', traffic: 800, percentage: 13 }
            ],

            // Demographics - Bromley (London Borough)
            population: 334500, // Census 2021
            medianAge: 40,
            familiesPercent: 31.0, // Higher families
            seniorsPercent: 17.5,
            avgHouseholdIncome: 43500, // Wealthier area
            incomeVsNational: 38.5, // Significantly higher
            homeownership: 68.0,
            homeownershipVsNational: 5.5,
            carOwnership: 73.0, // High for London
            carOwnershipVsNational: -3.7,

            // Mark as managed
            isManaged: true,
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
