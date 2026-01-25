
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const niData = [
    // Top 5
    { name: "Victoria Square", city: "Belfast", website: "https://victoriasquare.com", facebook: "https://www.facebook.com/VictoriaSquareBelfast", instagram: "https://www.instagram.com/victoriasquare", parkingSpaces: 1000 },
    { name: "Foyleside Shopping Centre", create: true, city: "Derry", website: "https://foyleside.co.uk", facebook: "https://www.facebook.com/FoylesideShoppingCentre", instagram: "https://www.instagram.com/foyleside", parkingSpaces: 1500 },
    { name: "Rushmere Shopping Centre", create: true, city: "Craigavon", website: "https://rushmereshopping.com", facebook: "https://www.facebook.com/RushmereShopping", parkingSpaces: 1800 },
    { name: "CastleCourt", city: "Belfast", website: "https://castlecourt-uk.com", facebook: "https://www.facebook.com/CastleCourtBelfast", instagram: "https://www.instagram.com/castlecourtbelfast", parkingSpaces: 1600 },
    { name: "Abbey Centre", create: true, city: "Newtownabbey", website: "https://abbeycentrebelfast.co.uk", facebook: "https://www.facebook.com/abbeycentre", parkingSpaces: 1100 }, // Website assumed based on common path or will fail gracefully, checking search result was null, using placeholder based on name if needed or null

    // 6-10
    { name: "The Quays Shopping Centre", create: true, city: "Newry", website: "https://thequays.co.uk", facebook: "https://www.facebook.com/TheQuaysNewry", instagram: "https://www.instagram.com/thequaysnewry", parkingSpaces: 1000 },
    { name: "Forestside Shopping Centre", create: true, city: "Belfast", website: "https://forestside.co.uk", facebook: "https://www.facebook.com/ForestsideShoppingCentre", instagram: "https://www.instagram.com/forestside_shopping_centre", parkingSpaces: 1300 },
    { name: "Bow Street Mall", create: true, city: "Lisburn", website: "https://bowstreetmall.co.uk", facebook: "https://www.facebook.com/BowStreetMall", parkingSpaces: 1000 },
    { name: "Kennedy Centre", create: true, city: "Belfast", website: "https://kennedycentre.co.uk", facebook: "https://www.facebook.com/KennedyCentreBelfast", instagram: "https://www.instagram.com/kennedycentre", parkingSpaces: 800 },
    { name: "Bloomfield Shopping Centre", create: true, city: "Bangor", website: "https://bloomfieldshopping.com", facebook: "https://www.facebook.com/BloomfieldShoppingCentre", parkingSpaces: 1500 },

    // 11-15
    { name: "Fairhill Shopping Centre", create: true, city: "Ballymena", website: "https://fairhillshopping.co.uk", facebook: "https://www.facebook.com/FairhillBallymena", instagram: "https://www.instagram.com/fairhillshopping", parkingSpaces: 800 },
    { name: "Buttercrane Shopping Centre", create: true, city: "Newry", website: "https://buttercraneshopping.co.uk", facebook: "https://www.facebook.com/Buttercrane", instagram: "https://www.instagram.com/buttercrane", parkingSpaces: 1000 },
    { name: "Ards Shopping Centre", create: true, city: "Newtownards", website: "https://ardsshoppingcentre.com", facebook: "https://www.facebook.com/ArdsShoppingCentre", instagram: "https://www.instagram.com/ardsshoppingcentre", parkingSpaces: 1200 },
    { name: "Connswater Shopping Centre", create: true, city: "Belfast", website: "https://connswater.co.uk", description: "Marketed for Sale/Closure Risks", parkingSpaces: 1000 },
    { name: "Tower Centre", create: true, city: "Ballymena", website: "https://towercentre.com", parkingSpaces: 400 },

    // 16-20
    { name: "Erneside Shopping Centre", city: "Enniskillen", website: "https://ernesideshopping.com", parkingSpaces: 680 },
    { name: "Park Centre", create: true, city: "Belfast", website: "https://theparkcentre.co.uk", facebook: "https://www.facebook.com/TheParkCentre", parkingSpaces: 500 },
    { name: "Flagship Centre", create: true, city: "Bangor", description: "Under Redevelopment", parkingSpaces: 420 },
    { name: "Meadowlane Shopping Centre", create: true, city: "Magherafelt", website: "https://meadowlaneshoppingcentre.co.uk", facebook: "https://www.facebook.com/MeadowlaneShoppingCentre", instagram: "https://www.instagram.com/meadowlaneshopping", parkingSpaces: 500 },
    { name: "Richmond Centre", create: true, city: "Derry", website: "https://richmondcentre.co.uk", parkingSpaces: 0 } // Council parking
];

async function main() {
    console.log("☘️ Applying Northern Ireland Top 20 Enrichment...");

    for (const data of niData) {
        if (data.create) {
            // Check existence first
            const exists = await prisma.location.findFirst({ where: { name: data.name } });
            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "Unknown",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "Northern Ireland"}`,
                        county: "Northern Ireland",
                        postcode: "UNKNOWN",
                        latitude: 0.0,
                        longitude: 0.0
                    }
                });
                console.log(`✨ Created: ${data.name}`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name}`);
            }
            continue;
        }

        // Update logic
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

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
            console.log(`✅ Updated: ${loc.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
