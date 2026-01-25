
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data to upsert/update
const remediationData = [
    // --- WALES ---
    {
        name: "McArthurGlen Designer Outlet Bridgend",
        city: "Bridgend",
        county: "Bridgend",
        website: "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-bridgend",
        facebook: "https://www.facebook.com/McArthurGlenBridgend",
        instagram: "https://www.instagram.com/mcarthurglenbridgend",
        parkingSpaces: 1500,
        create: true
    },
    {
        name: "Victoria Centre",
        city: "Llandudno",
        county: "Conwy",
        website: "https://www.victoriacentrellandudno.co.uk",
        facebook: "https://www.facebook.com/VictoriaCentreLlandudno",
        instagram: null,
        parkingSpaces: 366,
        create: true
    },
    {
        name: "Riverside Haverfordwest", // Often just "Riverside Shopping"
        city: "Haverfordwest",
        county: "Pembrokeshire",
        website: "https://riverside-shopping.co.uk",
        facebook: "https://www.facebook.com/RiversideShoppingHaverfordwest",
        instagram: null,
        parkingSpaces: 0, // Uses Castle Lake nearby
        create: true
    },
    {
        name: "Cwmbran Centre",
        city: "Cwmbran",
        parkingSpaces: 3000,
        website: "https://www.cwmbrancentre.com",
    },
    {
        name: "White Rose Centre",
        city: "Rhyl",
        website: "https://whiterosecentre.com",
        parkingSpaces: 300,
        facebook: "https://www.facebook.com/whiterosecentre"
    },
    // --- NORTHERN IRELAND ---
    {
        name: "Abbey Centre",
        city: "Newtownabbey",
        county: "County Antrim",
        website: "https://lesleyabbeycentre.co.uk",
        facebook: null,
        instagram: null,
        parkingSpaces: 1100,
        create: true
    },
    {
        name: "Bloomfield Shopping Centre",
        city: "Bangor",
        website: "https://lesleybloomfield.com",
        facebook: "https://www.facebook.com/bloomfieldsc",
        parkingSpaces: 1466,
    },
    {
        name: "Tower Centre",
        city: "Ballymena",
        website: "https://towercentreballymena.com",
        parkingSpaces: 1000, // Estimate based on multi-storey
    },
    {
        name: "Richmond Centre",
        city: "Derry", // or Londonderry
        website: "https://richmondcentre.co.uk",
        parkingSpaces: 0, // Council parking nearby
    },
    {
        name: "Connswater",
        city: "Belfast",
        website: null, // Closing 2025
        parkingSpaces: 500,
    }
];

async function main() {
    console.log('🌍 Starting Wales/NI Remediation...');

    for (const centre of remediationData) {
        if (!centre.name) continue;
        console.log(`Processing ${centre.name}...`);

        let location = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: centre.name },
                    { name: centre.name.replace("The ", "") },
                    { name: centre.name + " Shopping Centre" }
                ]
            }
        });

        if (!location && centre.city) {
            // Fallback Geosearch
            location = await prisma.location.findFirst({
                where: {
                    city: { contains: centre.city },
                    name: { contains: centre.name.split(" ")[0] }
                }
            });
        }

        try {
            if (location) {
                console.log(`✅ MATCH: ${location.name} -> ${centre.name}`);
                const updateData: any = {
                    name: centre.name, // Force Standard Name
                    city: centre.city, // Force City Update (Fix Abbey Centre)
                    county: (centre as any).county, // Force County Update
                    website: centre.website,
                    parkingSpaces: centre.parkingSpaces,
                    // description: null, // Removed invalid field
                };
                if (centre.facebook !== undefined) updateData.facebook = centre.facebook;
                if (centre.instagram !== undefined) updateData.instagram = centre.instagram;

                await prisma.location.update({
                    where: { id: location.id },
                    data: updateData,
                });
            } else {
                if (centre.create) {
                    console.log(`⚠️ NEW: Creating ${centre.name}`);

                    // Double check uniqueness constraint details
                    const exists = await prisma.location.findFirst({
                        where: {
                            OR: [
                                { name: centre.name },
                                { name: { equals: centre.name, mode: "insensitive" } }
                            ],
                            city: { contains: centre.city }
                        }
                    });

                    if (!exists) {
                        await prisma.location.create({
                            data: {
                                name: centre.name,
                                city: centre.city,
                                county: (centre as any).county || "Unknown",
                                website: centre.website,
                                parkingSpaces: centre.parkingSpaces,
                                facebook: centre.facebook,
                                instagram: centre.instagram,
                                type: "SHOPPING_CENTRE",
                                address: `${centre.name}, ${centre.city}`,
                                postcode: "UNKNOWN",
                                latitude: 0,
                                longitude: 0,
                                description: null
                            },
                        });
                    } else {
                        console.log(`⚠️ Exists (Strict Check): ${exists.name}, updating...`);
                        await prisma.location.update({
                            where: { id: exists.id },
                            data: {
                                website: centre.website,
                                parkingSpaces: centre.parkingSpaces,
                                facebook: centre.facebook !== undefined ? centre.facebook : undefined,
                                instagram: centre.instagram !== undefined ? centre.instagram : undefined
                            }
                        });
                    }
                } else {
                    console.log(`❌ NOT FOUND: ${centre.name} (Skipping creation as not flagged)`);
                }
            }
        } catch (e) {
            console.error(`🚨 ERROR Processing ${centre.name}:`, e.message);
        }
    }

    console.log('Wales/NI Remediation complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
