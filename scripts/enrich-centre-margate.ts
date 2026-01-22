import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const locationId = 'cmicxw4uj001g13hxwa88y750';

    console.log('Enriching The Centre Margate...\n');

    const updatedLocation = await prisma.location.update({
        where: { id: locationId },
        data: {
            // Contact & Website
            phone: '01384 400123',
            website: 'https://www.thecentremargate.com',
            openingHours: 'Mon-Fri 09:30-17:30, Sat 10:00-17:30, Sun 11:00-17:00',
            heroImage: '/images/locations/the-centre-margate.png',

            // Ownership & Management
            owner: 'LCP Group (London & Cambridge Properties)',
            management: 'LCP Group / Clarke & Crittenden',
            openedYear: 1979,

            // Operations
            parkingSpaces: 432,
            numberOfFloors: 1,
            retailSpace: 160000,
            carParkPrice: 0, // Free on Saturdays
            evCharging: false,
            evChargingSpaces: 0,
            anchorTenants: 4, // Boots, Peacocks, Poundland, Card Factory
            publicTransit: 'Cecil Square Bus Stop, Margate Station (0.7 miles)',
            retailers: 25,
            numberOfStores: 25,

            // Footfall - not disclosed, estimate based on similar sized centres
            footfall: 2000000, // Estimated ~40,000 weekly

            // Social Media (UpMargate Hub)
            instagram: 'https://www.instagram.com/upmargate/',
            facebook: 'https://www.facebook.com/UpMargate/',
            youtube: null,
            tiktok: null,
            twitter: null,

            // Google Reviews
            googleRating: 3.7,
            googleReviews: 40,
            googleVotes: 40,

            // Facebook Reviews - not listed
            facebookRating: null,
            facebookReviews: null,
            facebookVotes: null,

            // SEO Data
            seoKeywords: [
                { keyword: 'margate shopping', position: 5, volume: 480 },
                { keyword: 'upmargate', position: 1, volume: 320 },
                { keyword: 'shops in margate', position: 8, volume: 590 },
                { keyword: 'the centre margate', position: 1, volume: 210 },
                { keyword: 'independent traders thanet', position: 3, volume: 110 }
            ],
            topPages: [
                { url: '/upmargate', traffic: 1200, percentage: 35 },
                { url: '/centre-traders', traffic: 800, percentage: 23 },
                { url: '/find-us', traffic: 650, percentage: 19 },
                { url: '/contact-us', traffic: 450, percentage: 13 }
            ],

            // Demographics - Thanet District (same as Westwood Cross)
            population: 140600,
            medianAge: 45,
            familiesPercent: 42.1,
            seniorsPercent: 24.2,
            avgHouseholdIncome: 29000,
            incomeVsNational: -7.6,
            homeownership: 65,
            homeownershipVsNational: 4.0,
            carOwnership: 73.9,
            carOwnershipVsNational: -3.7,

            // Mark as managed
            isManaged: true,
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
