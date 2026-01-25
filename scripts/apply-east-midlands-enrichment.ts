
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const emData = [
    // Top 3 (Giants)
    { name: "Derbion", city: "Derby", legacyNames: ["Intu Derby", "Westfield Derby"], website: "https://derbion.com", facebook: "https://www.facebook.com/bepartofderbion", instagram: "https://www.instagram.com/derbion", parkingSpaces: 3600, postcode: "DE1 2PL" },
    { name: "Highcross", city: "Leicester", legacyNames: ["The Shires"], website: "https://highcrossleicester.com", facebook: "https://www.facebook.com/HighcrossLeicester", instagram: "https://www.instagram.com/highcross", parkingSpaces: 3000 },
    { name: "Victoria Centre", create: true, city: "Nottingham", website: "https://victoria-centre.com", facebook: "https://www.facebook.com/VictoriaCentre", instagram: "https://www.instagram.com/viccentrenottingham", parkingSpaces: 2700, postcode: "NG1 3QN" },

    // 4-10
    { name: "St Marks Shopping Centre", create: true, city: "Lincoln", website: "https://stmarks-lincoln.co.uk", facebook: "https://www.facebook.com/StMarksShopping", parkingSpaces: 700, postcode: "LN5 7EX" },
    { name: "Weston Favell Shopping Centre", city: "Northampton", website: "https://westonfavellshopping.com", facebook: "https://www.facebook.com/WestonFavellShopping", parkingSpaces: 1000 },
    { name: "Grosvenor Shopping", create: true, city: "Northampton", website: "https://grosvenorshoppingnorthampton.co.uk", facebook: "https://www.facebook.com/GrosvenorShoppingNorthampton", instagram: "https://www.instagram.com/grosvenornorthampton", parkingSpaces: 800, postcode: "NN1 2EW" },
    { name: "Four Seasons Shopping Centre", city: "Mansfield", website: "https://fourseasonsshopping.co.uk", facebook: "https://www.facebook.com/FourSeasonsShopping", instagram: "https://www.instagram.com/fourseasonsmansfield", parkingSpaces: 500 },
    { name: "Newlands Shopping Centre", create: true, city: "Kettering", website: "https://newlandsshopping.com", facebook: "https://www.facebook.com/NewlandsShopping", parkingSpaces: 305, postcode: "NN16 8DP" },
    { name: "Swansgate Centre", city: "Wellingborough", website: "https://swansgateshoppingcentre.com", parkingSpaces: 1000 },
    { name: "Haymarket Shopping Centre", city: "Leicester", website: "https://haymarketshoppingcentre.com", parkingSpaces: 450 },

    // 11-20
    { name: "The Rushes", city: "Loughborough", website: "https://therushes.co.uk", parkingSpaces: 400 },
    { name: "Vicar Lane Shopping Centre", city: "Chesterfield", website: "https://vicarlaneshoppingcentre.co.uk", parkingSpaces: 380 },
    { name: "Springfields Outlet", city: "Spalding", website: "https://springfieldsoutlet.co.uk", parkingSpaces: 800 },
    { name: "The Pavements", city: "Chesterfield", website: "https://thepavements.co.uk", parkingSpaces: 400 },
    { name: "Willow Place", city: "Corby", website: "https://willowplace.co.uk", parkingSpaces: 1000 },
    { name: "The Idlewells Centre", city: "Sutton In Ashfield", website: "https://idlewells.co.uk", parkingSpaces: 250 },
    { name: "Waterside Shopping Centre", city: "Lincoln", website: "https://watersideshopping.com", facebook: "https://www.facebook.com/WatersideShopping", parkingSpaces: 300 },
    { name: "Beaumont Shopping Centre", city: "Leicester", website: "https://beaumontshopping.com", parkingSpaces: 500 },
    { name: "The Crescent", city: "Hinckley", website: "https://thecrescenthinckley.co.uk", parkingSpaces: 500 },
    { name: "Belvoir Shopping Centre", city: "Coalville", website: "https://belvoirshoppingcentre.co.uk", parkingSpaces: 150 }
];

async function main() {
    console.log("🌳 Applying East Midlands Top 20 Enrichment...");

    for (const data of emData) {
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
                        city: data.city || "East Midlands",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "East Midlands"}`,
                        county: "East Midlands",
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
                    OR: [{ city: { contains: data.city } }, { address: { contains: data.city } }]
                }
            });
            if (loc) break;
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    name: data.name, // Rename to current name if legacy
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
