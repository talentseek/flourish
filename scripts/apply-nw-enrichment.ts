
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nwData = [
    // Top 5
    { name: "The Trafford Centre", create: true, city: "Manchester", website: "https://traffordcentre.co.uk", facebook: "https://www.facebook.com/traffordcentre", instagram: "https://www.instagram.com/thetraffordcentre", parkingSpaces: 11500, postcode: "M17 8AA" },
    { name: "Liverpool ONE", city: "Liverpool", website: "https://liverpool-one.com", facebook: "https://www.facebook.com/LiverpoolONE", instagram: "https://www.instagram.com/liverpool_oneofficial", parkingSpaces: 3000 },
    { name: "Manchester Arndale", city: "Manchester", website: "https://manchesterarndale.com", facebook: "https://www.facebook.com/manchesterarndale", instagram: "https://www.instagram.com/manchesterarndale", parkingSpaces: 1400 },
    { name: "Golden Square Shopping Centre", city: "Warrington", website: "https://gswarrington.com", facebook: "https://www.facebook.com/GoldenSquareWarrington", instagram: "https://www.instagram.com/gs_warrington", parkingSpaces: 1700 },
    { name: "The Rock", city: "Bury", website: "https://therockbury.com", facebook: "https://www.facebook.com/therockbury", instagram: "https://www.instagram.com/therockbury", parkingSpaces: 1000 },

    // 6-10
    { name: "Pyramids Shopping Centre", create: true, city: "Birkenhead", website: "https://pyramidsshoppingcentre.co.uk", facebook: "https://www.facebook.com/PyramidsShoppingCentre", instagram: "https://www.instagram.com/pyramids_sc", parkingSpaces: 1100 },
    { name: "The Grange Shopping Centre", create: true, city: "Birkenhead", website: "https://pyramidsshoppingcentre.co.uk", parkingSpaces: 495 }, // Often linked with Pyramids
    { name: "Runcorn Shopping City", create: true, city: "Runcorn", website: "https://shopping-city.co.uk", facebook: "https://www.facebook.com/RuncornShoppingCity", parkingSpaces: 2200 },
    { name: "Spindles Town Square", city: "Oldham", website: "https://spindlestownsquare.com", parkingSpaces: 1000 },
    { name: "Mill Gate Shopping Centre", city: "Bury", website: "https://millgatebury.co.uk", parkingSpaces: 800 },

    // 11-15
    { name: "Grand Arcade", create: true, city: "Wigan", website: "https://ga-wigan.co.uk", facebook: "https://www.facebook.com/GrandArcadeWigan", instagram: "https://www.instagram.com/grandarcadewigan", parkingSpaces: 850, postcode: "WN1 1BH" },
    { name: "The Lanes Shopping Centre", city: "Carlisle", website: "https://thelanesshopping.co.uk", parkingSpaces: 600 },
    { name: "Houndshill Shopping Centre", city: "Blackpool", website: "https://houndshillshoppingcentre.co.uk", parkingSpaces: 750 },
    { name: "Market Place", city: "Bolton", website: "https://marketplacebolton.co.uk", parkingSpaces: 500 },
    { name: "The Concourse", city: "Skelmersdale", website: "https://theconcourse.co.uk", parkingSpaces: 700 },

    // 16-20
    { name: "St Johns Shopping Centre", city: "Liverpool", website: "https://stjohns-shopping.co.uk", parkingSpaces: 600 },
    { name: "Charter Walk Shopping Centre", city: "Burnley", website: "https://charterwalk.com", parkingSpaces: 450 },
    { name: "Fishergate Centre", city: "Preston", website: "https://shopfishergate.co.uk", parkingSpaces: 700 },
    { name: "Middleton Shopping Centre", city: "Middleton", website: "https://middletonshoppingcentre.co.uk", parkingSpaces: 380 },
    { name: "Merseyway Shopping Centre", city: "Stockport", website: "https://merseyway.com", parkingSpaces: 800 },
    { name: "St George's Shopping Centre", create: true, city: "Preston", website: "https://stgeorgespreston.co.uk", facebook: "https://www.facebook.com/StGeorgesPreston", instagram: "https://www.instagram.com/stgeorgespreston", parkingSpaces: 400, postcode: "PR1 2TU" }
];

async function main() {
    console.log("🐝 Applying North West Top 20 Enrichment...");

    for (const data of nwData) {
        if (data.create) {
            // Check existence first - Strict on name AND city to avoid collisions
            let exists = await prisma.location.findFirst({
                where: {
                    name: data.name,
                    OR: [
                        { city: data.city },
                        { address: { contains: data.city } }
                    ]
                }
            });

            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "North West",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "North West"}`,
                        county: "North West",
                        postcode: data.postcode || "UNKNOWN",
                        latitude: 0.0,
                        longitude: 0.0
                    }
                });
                console.log(`✨ Created: ${data.name} (${data.city})`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name} (${data.city})`);
            }
            continue;
        }

        // Update logic
        let whereClause: any = { name: { contains: data.name } };
        // Fuzzy city match
        if (data.city) whereClause.OR = [{ city: { contains: data.city } }, { address: { contains: data.city } }];

        const loc = await prisma.location.findFirst({ where: whereClause });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: data.website,
                    facebook: data.facebook,
                    instagram: data.instagram,
                    parkingSpaces: data.parkingSpaces
                }
            });
            console.log(`✅ Updated: ${loc.name} -> ${data.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name} in ${data.city}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
