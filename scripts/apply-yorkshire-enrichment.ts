
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const yorksData = [
    // Top 5
    { name: "Meadowhall", create: true, city: "Sheffield", website: "https://meadowhall.co.uk", facebook: "https://www.facebook.com/Meadowhall", instagram: "https://www.instagram.com/lovemeadowhall", parkingSpaces: 12000, postcode: "S9 1EP" },
    { name: "Trinity Leeds", city: "Leeds", website: "https://trinityleeds.com", facebook: "https://www.facebook.com/TrinityLeeds", instagram: "https://www.instagram.com/trinityleeds", parkingSpaces: 1000 },
    { name: "Frenchgate Shopping Centre", city: "Doncaster", website: "https://frenchgateshopping.co.uk", facebook: "https://www.facebook.com/Frenchgate", instagram: "https://www.instagram.com/frenchgatedoncaster", parkingSpaces: 1400 },
    { name: "White Rose Shopping Centre", city: "Leeds", website: "https://white-rose.co.uk", facebook: "https://www.facebook.com/WhiteRoseLeeds", instagram: "https://www.instagram.com/whiteroseleeds", parkingSpaces: 4800 },
    { name: "Victoria Leeds", create: true, city: "Leeds", website: "https://victorialeeds.co.uk", facebook: "https://www.facebook.com/VictoriaLeeds", instagram: "https://www.instagram.com/victorialeeds_", parkingSpaces: 805, postcode: "LS2 7AU" },

    // 6-10
    { name: "Crystal Peaks", city: "Sheffield", website: "https://crystalpeaks.co.uk", facebook: "https://www.facebook.com/CrystalPeaks", instagram: "https://www.instagram.com/crystalpeakssheffield", parkingSpaces: 1800 },
    { name: "The Broadway", city: "Bradford", website: "https://broadwaybradford.com", facebook: "https://www.facebook.com/BroadwayBradford", instagram: "https://www.instagram.com/broadwaybradford", parkingSpaces: 1300 },
    { name: "Trinity Walk", city: "Wakefield", website: "https://trinitywalk.com", facebook: "https://www.facebook.com/TrinityWalk", instagram: "https://www.instagram.com/trinitywalk", parkingSpaces: 1000 },
    { name: "St Stephen's", create: true, city: "Hull", website: "https://ststephens-hull.com", facebook: "https://www.facebook.com/StStephensHull", instagram: "https://www.instagram.com/ststephenshull", parkingSpaces: 800, postcode: "HU2 8LN" },
    { name: "Freshney Place", city: "Grimsby", website: "https://freshneyplace.co.uk", facebook: "https://www.facebook.com/FreshneyPlace", parkingSpaces: 1000 },

    // 11-15
    { name: "Merrion Centre", city: "Leeds", website: "https://merrioncentre.co.uk", facebook: "https://www.facebook.com/MerrionCentre", instagram: "https://www.instagram.com/merrioncentre", parkingSpaces: 1000 },
    { name: "The Ridings", create: true, city: "Wakefield", website: "https://ridingscentre.com", facebook: "https://www.facebook.com/ridingscentre", instagram: "https://www.instagram.com/ridingscentre", parkingSpaces: 1000, postcode: "WF1 1DS" },
    { name: "Princes Quay", city: "Hull", website: "https://princesquay.com", facebook: "https://www.facebook.com/PrincesQuayHull", instagram: "https://www.instagram.com/princesquayhull", parkingSpaces: 900 },
    { name: "Kingsgate", city: "Huddersfield", website: "https://kingsgate-huddersfield.co.uk", facebook: "https://www.facebook.com/KingsgateHudd", parkingSpaces: 600 },
    { name: "The Glass Works", city: "Barnsley", website: "https://glassworksbarnsley.com", facebook: "https://www.facebook.com/TheGlassWorksBarnsley", parkingSpaces: 475 },

    // 16-20
    { name: "The Airedale Centre", city: "Keighley", website: "https://airedaleshoppingcentre.co.uk", parkingSpaces: 420 },
    { name: "Prospect Shopping Centre", city: "Hull", website: "https://prospectshoppingcentre.co.uk", parkingSpaces: 250 },
    { name: "St Johns Centre", create: true, city: "Leeds", website: "https://stjohnsleeds.co.uk", facebook: "https://www.facebook.com/stjohnsleeds", instagram: "https://www.instagram.com/stjohnsleeds", parkingSpaces: 280, postcode: "LS2 8LQ" },
    { name: "Kirkgate Shopping Centre", city: "Bradford", website: "https://kirkgate.co.uk", parkingSpaces: 600 },
    { name: "The Core", create: true, city: "Leeds", website: "https://thecoreleeds.co.uk", parkingSpaces: 258, postcode: "LS1 6AD" }
];

async function main() {
    console.log("🌹 Applying Yorkshire Top 20 Enrichment...");

    for (const data of yorksData) {
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
                        city: data.city || "Yorkshire",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "Yorkshire"}`,
                        county: "Yorkshire",
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
