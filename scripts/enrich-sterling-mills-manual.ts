
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Sterling Mills with Manual Data...');

    // Search for the location
    const loc = await prisma.location.findFirst({
        where: {
            OR: [
                { name: 'Sterling Mills' },
                { name: 'Affinity Sterling Mills Outlet Shopping' }
            ]
        }
    });

    if (!loc) {
        console.error('❌ Could not find Sterling Mills location record.');
        return;
    }

    console.log(`Found location: ${loc.name} (${loc.id})`);

    // Update with full dataset
    const updated = await prisma.location.update({
        where: { id: loc.id },
        data: {
            // Identity & Location
            name: 'Affinity Sterling Mills Outlet Shopping',
            type: 'OUTLET_CENTRE',
            address: 'The Devon Way, Devon Vale',
            city: 'Tillicoultry',
            county: 'Clackmannanshire',
            postcode: 'FK13 6HQ',
            latitude: 56.1491,
            longitude: -3.7409,

            // Contact & Digital
            website: 'https://www.sterlingmills.com/',
            phone: '+44 1259 752100',
            instagram: 'https://www.instagram.com/shopsterlingmills/',
            facebook: 'https://www.facebook.com/SterlingMillsOutlet/',
            youtube: 'https://www.youtube.com/watch?v=dMGktwoXLdg',

            // Operational
            openingHours: {
                "Monday": "10:00 - 18:00",
                "Tuesday": "10:00 - 18:00",
                "Wednesday": "10:00 - 18:00",
                "Thursday": "10:00 - 18:00",
                "Friday": "10:00 - 18:00",
                "Saturday": "10:00 - 18:00",
                "Sunday": "10:00 - 18:00"
            },
            parkingSpaces: 650,
            carParkPrice: 0.00,
            evCharging: false,
            evChargingSpaces: 0,
            publicTransit: 'Local bus services available (e.g., to/from Stirling and Kinross); bus stops located on A908/Devon Way immediately adjacent to the centre.',

            // Physical & Commercial
            totalFloorArea: 86000,
            retailSpace: 86000,
            numberOfFloors: 1,
            numberOfStores: 25,
            retailers: 25,
            anchorTenants: 3,
            owner: 'Frasers Group',
            management: 'Global Mutual',
            openedYear: 1999,

            // Management Contact
            managementContact: 'Nicola Martin (Centre Manager)',
            managementEmail: 'info@sterlingmills.com',
            managementPhone: '+44 1259 752100',

            // Demographics
            population: 51940,
            medianAge: 45,
            familiesPercent: 17.0,
            seniorsPercent: 21.0,
            homeownership: 62.0,
            carOwnership: 71.0,

            // Performance & Sentiment
            googleRating: 4.0,
            googleReviews: 2789,

            // Metadata
            isManaged: true
        }
    });

    console.log('✅ Successfully updated Sterling Mills with full manual dataset.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
