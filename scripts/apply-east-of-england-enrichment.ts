
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eeData = [
    // Top 5
    { name: "Lakeside Shopping Centre", city: "West Thurrock", website: "https://lakeside-shopping.com", facebook: "https://www.facebook.com/LakesideShoppingCentre", instagram: "https://www.instagram.com/lakesideshoppingcentre", parkingSpaces: 11857, postcode: "RM20 2ZP" },
    { name: "Atria Watford", city: "Watford", legacyNames: ["Intu Watford", "intu Watford", "Harlequin Centre"], website: "https://atriawatford.com", facebook: "https://www.facebook.com/atriaWatford", instagram: "https://www.instagram.com/atriawatford", parkingSpaces: 2773 },
    { name: "Luton Point", city: "Luton", legacyNames: ["The Mall Luton", "The Arndale", "Luton Arndale"], website: "https://lutonpoint.co.uk", facebook: "https://www.facebook.com/LutonPoint", instagram: "https://www.instagram.com/lutonpoint", parkingSpaces: 1700 },
    { name: "Queensgate Shopping Centre", city: "Peterborough", website: "https://queensgate-shopping.co.uk", facebook: "https://www.facebook.com/Queensgate", instagram: "https://www.instagram.com/queensgate_pb", parkingSpaces: 2300 },
    { name: "Eastgate Shopping Centre", city: "Basildon", website: "https://eastgateshoppingcentre.com", facebook: "https://www.facebook.com/EastgateBasildon", instagram: "https://www.instagram.com/eastgatebasildon", parkingSpaces: 700 },

    // 6-10
    { name: "Chantry Place", city: "Norwich", legacyNames: ["Intu Chapelfield", "intu Chapelfield", "Chapelfield"], website: "https://chantryplace.co.uk", facebook: "https://www.facebook.com/chantryplace", instagram: "https://www.instagram.com/chantryplacenorwich", parkingSpaces: 1000 },
    { name: "The Grafton", create: true, city: "Cambridge", website: "https://graftoncentre.co.uk", facebook: "https://www.facebook.com/GraftonCambridge", instagram: "https://www.instagram.com/graftoncambridge", parkingSpaces: 1160, postcode: "CB1 1PS" },
    { name: "Grand Arcade", city: "Cambridge", website: "https://grandarcade.co.uk", facebook: "https://www.facebook.com/GrandArcadeCambridge", instagram: "https://www.instagram.com/grand_arcade", parkingSpaces: 950 },
    { name: "Vancouver Quarter Shopping Centre", city: "King's Lynn", website: "https://vancouverquarter.com", parkingSpaces: 385 },
    { name: "Castle Quarter", city: "Norwich", legacyNames: ["Castle Mall"], website: "https://castlequarter.co.uk", parkingSpaces: 700 },

    // 11-20
    { name: "The Marlowes Shopping Centre", city: "Hemel Hempstead", website: "https://themarlowes.co.uk", parkingSpaces: 1100 },
    { name: "High Chelmer Shopping Centre", city: "Chelmsford", website: "https://highchelmer.com", parkingSpaces: 1000 },
    { name: "Serpentine Green", city: "Peterborough", website: "https://serpentine-green.com", parkingSpaces: 2000 },
    { name: "Victoria Shopping Centre", city: "Essex", legacyNames: ["The Victoria"], website: "https://victoriasc.co.uk", parkingSpaces: 500 },
    { name: "The Galleria", city: "Hatfield", website: "https://thegalleria.co.uk", parkingSpaces: 1600 },
    { name: "Riverside Shopping Centre", create: true, city: "Hemel Hempstead", website: "https://riversidehemel.com", facebook: "https://www.facebook.com/RiversideHemel", parkingSpaces: 328, postcode: "HP1 1BT" },
    { name: "The Royals Shopping Centre", create: true, city: "Southend-on-Sea", website: "https://royalsshoppingcentre.co.uk", facebook: "https://www.facebook.com/TheRoyalsShoppingCentre", parkingSpaces: 400, postcode: "SS1 1DG" },
    { name: "Culver Square", create: true, city: "Colchester", website: "https://culversquare.co.uk", facebook: "https://www.facebook.com/CulverSquareColchester", parkingSpaces: 0, postcode: "CO1 1WG" }, // Council parking
    { name: "Lion Walk Shopping Centre", city: "Colchester", website: "https://lionwalkshopping.com", parkingSpaces: 0 },
    { name: "Buttermarket Shopping Centre", city: "Ipswich", website: "https://buttermarketipswich.com", parkingSpaces: 400 }
];

async function main() {
    console.log("🌾 Applying East of England Top 20 Enrichment...");

    for (const data of eeData) {
        if (data.create) {
            // Check existence first
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
                        city: data.city || "East of England",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "East of England"}`,
                        county: "East of England",
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

        // Update logic with Legacy Name Support
        let searchNames = [data.name];
        if (data.legacyNames) searchNames = [...searchNames, ...data.legacyNames];

        // Find match using any of the names
        let loc = null;
        for (const searchName of searchNames) {
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: searchName },
                    OR: [
                        { city: { contains: data.city } },
                        { address: { contains: data.city } },
                        { county: { contains: data.city } } // Broaden check e.g. for Essex/Herts
                    ]
                }
            });
            if (loc) break;
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    name: data.name, // Rename to current name
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
