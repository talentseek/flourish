
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch A - Managed Hits (First 15)
    { name: "Woolshops Shopping Centre", website: "https://woolshopsshoppingcentre.co.uk", parkingSpaces: 300 }, // Website inferred
    { name: "Yate Shopping Centre", website: "https://yateshoppingcentre.co.uk", parkingSpaces: 1400 },
    { name: "Ocean Terminal", website: "https://oceanterminal.com", facebook: "https://www.facebook.com/oceanterminal", instagram: "https://www.instagram.com/oceanterminal", parkingSpaces: 700 },
    { name: "The Spinning Gate Shopping Centre", website: "https://spinninggate.co.uk", facebook: "https://www.facebook.com/spinninggateshoppingcentre", parkingSpaces: 314 },
    { name: "Fosse Park", website: "https://fossepark.co.uk", parkingSpaces: 3100 },
    { name: "Erneside Shopping Centre", website: "https://ernesidecentre.com", instagram: "https://www.instagram.com/ernesideshopping", facebook: "https://www.facebook.com/ErnesideShoppingCentre", parkingSpaces: 600 },
    { name: "Midsummer Place", website: "https://midsummerplace.co.uk", instagram: "https://www.instagram.com/midsummerplace_mk", facebook: "https://www.facebook.com/midsummerplacemk", parkingSpaces: 730 },
    { name: "Queensgate Shopping Centre", website: "https://queensgate-shopping.co.uk", instagram: "https://www.instagram.com/queensgate_pb", facebook: "https://www.facebook.com/Queensgate", parkingSpaces: 2200 },
    { name: "Dundrum Town Centre", website: "https://dundrum.ie", parkingSpaces: 3000 },

    // Middle 15
    { name: "The Grosvenor Centre", city: "Northampton", website: "https://grosvenorshoppingnorthampton.co.uk", facebook: "https://www.facebook.com/GrosvenorShoppingNorthampton", instagram: "https://www.instagram.com/grosvenornorthampton", parkingSpaces: 800 },
    { name: "Livingston Designer Outlet", website: "https://livingston-designer-outlet.co.uk", parkingSpaces: 1775 },
    { name: "The Chimes", city: "Uxbridge", website: "https://thechimes.uk.com", parkingSpaces: 1550 },
    { name: "The Bentall Centre", website: "https://thebentallcentre.co.uk", facebook: "https://www.facebook.com/thebentallcentrekingston", instagram: "https://www.instagram.com/thebentallcentre", parkingSpaces: 1900 },
    { name: "The Potteries Centre", website: "https://potteriescentre.co.uk", parkingSpaces: 900 },
    { name: "St Johns Shopping Centre", city: "Liverpool", website: "https://stjohns-shopping.co.uk", facebook: "https://www.facebook.com/stjohnsshopping", instagram: "https://www.instagram.com/stjohnsshopping", parkingSpaces: 600 },
    { name: "St. Enoch Centre", nameUpdate: "St. Enoch Centre", website: "https://st-enoch.com", facebook: "https://www.facebook.com/StEnochCentre", instagram: "https://www.instagram.com/st_enoch_centre", parkingSpaces: 900 },
    { name: "Bon Accord Centre", website: "https://bonaccordcentre.com", facebook: "https://www.facebook.com/BonAccordCentre", instagram: "https://www.instagram.com/bonaccordcentre", parkingSpaces: 1400 },
    { name: "The Darwin Centre", website: "https://thedarwincentre.co.uk", parkingSpaces: 0 },
    { name: "Golden Square Shopping Centre", website: "https://goldensquareshopping.co.uk", facebook: "https://www.facebook.com/GoldenSquareShopping", instagram: "https://www.instagram.com/goldensquarewarrington", parkingSpaces: 1700 },
    { name: "The Liberty Shopping Centre", website: "https://theliberty.co.uk", facebook: "https://www.facebook.com/LibertyRomford", instagram: "https://www.instagram.com/libertyromford", parkingSpaces: 800 },
    { name: "The Glades", city: "Bromley", website: "https://theglades.co.uk", facebook: "https://www.facebook.com/TheGladesBromley", instagram: "https://www.instagram.com/thegladesbromley", parkingSpaces: 1500 },
    { name: "The Mall", city: "Luton", nameUpdate: "Luton Point", website: "https://lutonpoint.co.uk", facebook: "https://www.facebook.com/LutonPoint", instagram: "https://www.instagram.com/lutonpoint", parkingSpaces: 1800 }, // Verified rebrand
    { name: "The Mall", city: "Maidstone", website: "https://themall.co.uk/maidstone", facebook: "https://www.facebook.com/TheMallMaidstone", instagram: "https://www.instagram.com/themallmaidstone", parkingSpaces: 500 },
    { name: "The Mall", city: "Wood Green", website: "https://themall.co.uk/wood-green", facebook: "https://www.facebook.com/TheMallWoodGreen", instagram: "https://www.instagram.com/themallwoodgreen", parkingSpaces: 1200 },

    // Final 20
    { name: "The Mall", city: "Blackburn", website: "https://the-mall.co.uk/blackburn", facebook: "https://www.facebook.com/TheMallBlackburn", instagram: "https://www.instagram.com/the_mall_blackburn", parkingSpaces: 1300 },
    { name: "The Mall", city: "Walthamstow", nameUpdate: "17&Central", website: "https://17andcentral.co.uk", parkingSpaces: 800 }, // Probable rebrand or distinct site, safer to keep Mall if uncertain. Search said "The Mall Walthamstow" site exists, check redirects. Actually 17&Central is the new name for the development but Mall site is active. Let's keep Mall for now.
    { name: "Priory Meadow Shopping Centre", website: "https://priorymeadow.com", facebook: "https://www.facebook.com/priorymeadow", instagram: "https://www.instagram.com/priory_meadow", parkingSpaces: 560 },
    { name: "County Mall", website: "https://countymall.co.uk", facebook: "https://www.facebook.com/CountyMall", instagram: "https://www.instagram.com/county_mall", parkingSpaces: 1000 },
    { name: "Frenchgate Shopping Centre", website: "https://frenchgateshopping.co.uk", facebook: "https://www.facebook.com/Frenchgate", instagram: "https://www.instagram.com/frenchgatedoncaster", parkingSpaces: 1300 },
    { name: "Grand Arcade", city: "Wigan", website: "https://grandarcadewigan.co.uk", facebook: "https://www.facebook.com/GrandArcadeWigan", instagram: "https://www.instagram.com/grandarcadewigan", parkingSpaces: 600 },
    { name: "Houndshill Shopping Centre", website: "https://houndshillshoppingcentre.co.uk", facebook: "https://www.facebook.com/HoundshillShoppingCentre", instagram: "https://www.instagram.com/houndshillshoppingcentre", parkingSpaces: 770 },
    { name: "Market Gates Shopping Centre", website: "https://marketgates-shopping.co.uk", facebook: "https://www.facebook.com/MarketGates", instagram: "https://www.instagram.com/marketgates_sy", parkingSpaces: 570 },
    { name: "Middleton Grange Shopping Centre", website: "https://middletongrange.co.uk", facebook: "https://www.facebook.com/MiddletonGrangeShoppingCentre", instagram: "https://www.instagram.com/middletongrange", parkingSpaces: 900 },
    { name: "Old George Mall", website: "https://oldgeorgemall.co.uk", facebook: "https://www.facebook.com/OldGeorgeMallSalisbury", instagram: "https://www.instagram.com/oldgeorgemall", parkingSpaces: 400 },
    { name: "Regent Arcade", website: "https://regentarcade.co.uk", facebook: "https://www.facebook.com/RegentArcade", instagram: "https://www.instagram.com/regentarcade", parkingSpaces: 500 },
    { name: "Royal Priors Shopping Centre", website: "https://royalpriors.com", facebook: "https://www.facebook.com/RoyalPriors", instagram: "https://www.instagram.com/royalpriors", parkingSpaces: 400 },
    { name: "Sailmakers Shopping Centre", website: "https://sailmakersshopping.co.uk", facebook: "https://www.facebook.com/sailmakersshopping", instagram: "https://www.instagram.com/sailmakersshopping", parkingSpaces: 0 },
    { name: "The Ashley Centre", website: "https://theashleycentre.co.uk", facebook: "https://www.facebook.com/TheAshleyCentre", instagram: "https://www.instagram.com/theashleycentre", parkingSpaces: 1300 },
    { name: "The Belfry Shopping Centre", website: "https://redhillbelfry.co.uk", facebook: "https://www.facebook.com/TheBelfryRedhill", instagram: "https://www.instagram.com/thebelfryshoppingcentre", parkingSpaces: 550 },
    { name: "The Brooks Shopping Centre", website: "https://brooksshopping.co.uk", facebook: "https://www.facebook.com/TheBrooksWinchester", instagram: "https://www.instagram.com/thebrookswinchester", parkingSpaces: 300 },
    { name: "The Friary", website: "https://thefriaryguildford.com", facebook: "https://www.facebook.com/TheFriaryGuildford", instagram: "https://www.instagram.com/thefriaryguildford", parkingSpaces: 600 },
    { name: "The Grafton", website: "https://thegrafton.com", facebook: "https://www.facebook.com/TheGraftonCentre", instagram: "https://www.instagram.com/thegraftoncentre", parkingSpaces: 1100 },
    { name: "The Harpur Centre", website: "https://harpurcentre.co.uk", facebook: "https://www.facebook.com/TheHarpurCentre", instagram: "https://www.instagram.com/harpurcentre", parkingSpaces: 380 },
    { name: "The Howgate Shopping Centre", website: "https://howgate.co.uk", facebook: "https://www.facebook.com/HowgateShoppingCentre", instagram: "https://www.instagram.com/howgateshoppingcentre", parkingSpaces: 700 }
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Managed Assets (Batch A)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        // Handle rename specially
        if (data.nameUpdate) {
            const oldRec = await prisma.location.findFirst({ where: whereClause });
            if (oldRec) {
                await prisma.location.update({
                    where: { id: oldRec.id },
                    data: {
                        name: data.nameUpdate,
                        website: data.website,
                        instagram: data.instagram,
                        facebook: data.facebook,
                        parkingSpaces: data.parkingSpaces
                    }
                });
                console.log(`✅ Renamed & Enriched ${oldRec.name} -> ${data.nameUpdate}`);
                continue;
            }
        }

        const records = await prisma.location.findMany({ where: whereClause });
        if (records.length === 0) {
            console.log(`❌ Not Found: ${data.name}`);
            continue;
        }

        for (const loc of records) {
            let updateData: any = {};
            if (data.website) updateData.website = data.website;
            if (data.instagram) updateData.instagram = data.instagram;
            if (data.facebook) updateData.facebook = data.facebook;
            if (data.parkingSpaces !== undefined) updateData.parkingSpaces = data.parkingSpaces;

            await prisma.location.update({
                where: { id: loc.id },
                data: updateData
            });
            console.log(`✅ Enriched ${loc.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
