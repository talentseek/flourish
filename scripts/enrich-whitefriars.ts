import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmid0l76u020ymtpuixnytlvp';

    console.log('Enriching Whitefriars Canterbury...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            // Contact & Website
            phone: '01227 826760',
            website: 'https://www.whitefriars.co.uk',
            openingHours: 'Mon-Sat 09:00-17:30, Sun 11:00-16:00',
            // heroImage will be added later by user

            // Ownership & Management
            owner: 'Nuveen Real Estate (50%) / CPP Investments (50%)',
            management: 'Whitefriars Management Suite (Internal)',
            openedYear: 2005,

            // Operations
            parkingSpaces: 530,
            numberOfFloors: 3,
            retailSpace: 475000,
            carParkPrice: 3.70,
            evCharging: true,
            evChargingSpaces: 10, // Available in multi-storey
            anchorTenants: 4, // Fenwick, M&S, Primark, Next
            publicTransit: 'Canterbury Bus Station (On-site), Canterbury East/West Stations (Walkable)',
            retailers: 70,
            numberOfStores: 70,

            // Footfall
            footfall: 9400000, // ~9.4M annually

            // Social Media
            instagram: 'https://www.instagram.com/whitefriars_canterbury/',
            facebook: 'https://www.facebook.com/whitefriars/',
            youtube: null,
            tiktok: null,
            twitter: 'https://twitter.com/whitefriars_eu',

            // Google Reviews
            googleRating: 4.3,
            googleReviews: 3500,
            googleVotes: 3500,

            // Facebook Reviews
            facebookRating: 4.4,
            facebookReviews: 5000,
            facebookVotes: 5000,

            // SEO Data
            seoKeywords: [
                { keyword: 'whitefriars canterbury', position: 1, volume: 2900 },
                { keyword: 'fenwick canterbury', position: 2, volume: 1600 },
                { keyword: 'shops in canterbury', position: 3, volume: 1200 },
                { keyword: 'primark canterbury', position: 4, volume: 880 },
                { keyword: 'canterbury shopping', position: 5, volume: 720 }
            ],
            topPages: [
                { url: '/stores', traffic: 8500, percentage: 28 },
                { url: '/eating-out', traffic: 5200, percentage: 17 },
                { url: '/parking', traffic: 4800, percentage: 16 },
                { url: '/opening-hours', traffic: 3600, percentage: 12 },
                { url: '/offers', traffic: 2400, percentage: 8 }
            ],

            // Demographics - Canterbury District
            population: 157400,
            medianAge: 41,
            familiesPercent: 28.0,
            seniorsPercent: 23.5,
            avgHouseholdIncome: 34200,
            incomeVsNational: 8.9,
            homeownership: 60,
            homeownershipVsNational: -4.0,
            carOwnership: 74.0,
            carOwnershipVsNational: -3.5,

            // Mark as managed
            isManaged: true,
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
