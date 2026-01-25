
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data to upsert/update
const remediationData = [
    // --- CREATIONS (The Missing 10) ---
    {
        name: "Centrale Shopping Centre",
        aliases: ["Centrale", "Centrale Croydon"],
        city: "Croydon",
        county: "Greater London",
        postcode: "CR0 1TY",
        latitude: 51.376,
        longitude: -0.103,
        website: "https://www.centraleandwhitgift.co.uk",
        facebook: "https://www.facebook.com/CentraleandWhitgift",
        instagram: "https://www.instagram.com/centralewhitgift",
        parkingSpaces: 940,
        owner: "Unibail-Rodamco-Westfield",
        description: "Jointly managed with Whitgift Centre.",
        create: true
    },
    {
        name: "St Nicholas Centre",
        aliases: ["St Nicholas Shopping Centre"],
        city: "Sutton",
        county: "Greater London",
        postcode: "SM1 1EH",
        latitude: 51.3655,
        longitude: -0.1941,
        website: "https://www.stnicssutton.co.uk",
        facebook: "https://www.facebook.com/StNicsSutton",
        instagram: "https://www.instagram.com/stnicssutton",
        parkingSpaces: 740,
        owner: "Sutton Council",
        create: true
    },
    {
        name: "Wimbledon Quarter",
        aliases: ["Centre Court", "Centre Court Shopping Centre"],
        city: "Wimbledon",
        county: "Greater London",
        postcode: "SW19 8ND",
        latitude: 51.4183,
        longitude: -0.2206,
        website: "https://wimbledonquarter.com",
        facebook: "https://www.facebook.com/WimbledonQuarter",
        instagram: "https://www.instagram.com/wimbledonquarter",
        parkingSpaces: 750,
        owner: "Romulus",
        description: "Formerly Centre Court.",
        create: true
    },
    {
        name: "St Anns Shopping Centre",
        aliases: ["St Anns", "St Anns Harrow"],
        city: "Harrow",
        county: "Greater London",
        postcode: "HA1 1AT",
        latitude: 51.5811,
        longitude: -0.3392,
        website: "https://www.stannsshopping.co.uk",
        facebook: "https://www.facebook.com/stannsshopping", // Inferred
        instagram: "https://www.instagram.com/stannsshopping", // Inferred
        parkingSpaces: 940,
        owner: "RPMI",
        create: true
    },
    {
        name: "Livat Hammersmith",
        aliases: ["Kings Mall"],
        city: "Hammersmith",
        county: "Greater London",
        postcode: "W6 0BT",
        latitude: 51.4930,
        longitude: -0.2287,
        website: "https://www.livat.com/hammersmith/en",
        facebook: "https://www.facebook.com/LivatHammersmith",
        instagram: "https://www.instagram.com/livathammersmith",
        parkingSpaces: 625,
        owner: "Ingka Centres",
        create: true
    },
    {
        name: "W12 Shopping Centre",
        aliases: ["W12 Shopping", "West 12"],
        city: "Shepherd's Bush",
        county: "Greater London",
        postcode: "W12 8PP",
        latitude: 51.5037,
        longitude: -0.2188,
        website: "https://west12shopping.co.uk",
        facebook: "https://www.facebook.com/W12Shopping",
        instagram: "https://www.instagram.com/w12shopping",
        parkingSpaces: 178,
        owner: "West 12 Investments Ltd",
        create: true
    },
    {
        name: "Burlington Arcade",
        aliases: [],
        city: "Mayfair",
        county: "Greater London",
        postcode: "W1J 0QJ",
        latitude: 51.5090,
        longitude: -0.1403,
        website: "https://www.burlington.com",
        facebook: "https://www.facebook.com/burlingtonarcade",
        instagram: "https://www.instagram.com/burlingtonarcade",
        parkingSpaces: 0, // Luxury arcade
        owner: "Reuben Brothers",
        create: true
    },
    {
        name: "Hay's Galleria",
        aliases: [],
        city: "London Bridge",
        county: "Greater London",
        postcode: "SE1 2HD",
        latitude: 51.5058,
        longitude: -0.0837,
        website: "https://haysgalleria.co.uk",
        facebook: null,
        instagram: null, // Managed by London Bridge City usually
        parkingSpaces: 0,
        owner: "St Martin's Property",
        create: true
    },
    {
        name: "Merton Abbey Mills",
        aliases: ["The 1929 Shop"],
        city: "Merton",
        county: "Greater London",
        postcode: "SW19 2RD",
        latitude: 51.4130,
        longitude: -0.1833,
        website: "https://www.mertonabbeymills.org.uk",
        facebook: "https://www.facebook.com/MertonAbbeyMills",
        instagram: "https://www.instagram.com/mertonabbeymills",
        parkingSpaces: 0, // Nearby only
        owner: "Merton Abbey Mills",
        create: true
    },
    {
        name: "Leadenhall Market",
        aliases: [],
        city: "City of London",
        county: "Greater London",
        postcode: "EC3V 1LT",
        latitude: 51.5128,
        longitude: -0.0837,
        website: "https://leadenhallmarket.co.uk",
        facebook: "https://www.facebook.com/LeadenhallMarket",
        instagram: "https://www.instagram.com/leadenhallmarket",
        parkingSpaces: 0,
        owner: "City of London Corporation",
        create: true
    },

    // --- ENRICHMENTS (The Gaps) ---
    {
        name: "Palace Gardens",
        city: "Enfield",
        website: "https://palaceshopping.co.uk",
        parkingSpaces: 523,
        create: false
    },
    {
        name: "Surrey Quays Shopping Centre",
        city: "Rotherhithe",
        website: "https://surreyquays.co.uk",
        parkingSpaces: 650,
        create: false
    },
    {
        name: "One New Change",
        city: "City of London",
        website: "https://onenewchange.com",
        parkingSpaces: 0,
        instagram: "https://www.instagram.com/onenewchange",
        create: false
    },
    {
        name: "The Mercury",
        aliases: ["Mall Romford"], // Existing name often includes Mall
        city: "Romford",
        website: "https://themercurymall.co.uk",
        parkingSpaces: 1000,
        instagram: "https://www.instagram.com/themercurymall",
        create: false
    },
    {
        name: "The Brunswick Centre",
        city: "Bloomsbury",
        website: "https://brunswick.co.uk",
        parkingSpaces: 155,
        create: false
    },
    {
        name: "Angel Central",
        aliases: ["N1 Shopping Centre"],
        city: "Islington",
        website: "https://angelcentral.co.uk",
        parkingSpaces: 100, // Estimate based on research
        facebook: "https://www.facebook.com/angelcentraln1",
        create: false
    },
    {
        name: "Putney Exchange Shopping Centre",
        aliases: ["Putney Exchange"],
        city: "Putney",
        website: "https://putneyexchange.co.uk",
        parkingSpaces: 250,
        create: false
    }
];

async function main() {
    console.log("🇬🇧 LONDON REGIONAL REMEDIATION (Top 40)");

    for (const centre of remediationData) {
        console.log(`Processing ${centre.name}...`);

        // 1. Try to find existing
        const searchNames = [centre.name, ...(centre.aliases || [])];

        let location = await prisma.location.findFirst({
            where: {
                OR: searchNames.map(n => ({ name: { contains: n, mode: "insensitive" } }))
            }
        });

        if (location) {
            console.log(`✅ MATCH: ${location.name} -> ${centre.name}`);
            const updateData: any = {
                website: centre.website,
                parkingSpaces: centre.parkingSpaces,
            };

            // Only update these if explicit in remediation data
            if (centre.create === true) {
                // For "Creations" that matched, force name/city/county standardisation
                updateData.name = centre.name;
                updateData.city = centre.city;
                updateData.county = (centre as any).county;
                updateData.owner = (centre as any).owner;
                if ((centre as any).postcode) updateData.postcode = (centre as any).postcode;
            }
            if ((centre as any).facebook) updateData.facebook = (centre as any).facebook;
            if ((centre as any).instagram) updateData.instagram = (centre as any).instagram;

            await prisma.location.update({
                where: { id: location.id },
                data: updateData
            });
            console.log("   - Updated");

        } else if (centre.create) {
            // DOUBLE CHECK before creating to avoid "London" vs "Greater London" dupes
            // Refined check: If name starts with "St", use full name, otherwise use first word
            const nameCheck = centre.name.startsWith("St ") ? centre.name : centre.name.split(" ")[0];

            const existingCity = await prisma.location.findFirst({
                where: {
                    name: { contains: nameCheck, mode: "insensitive" },
                    city: { contains: centre.city, mode: "insensitive" }
                }
            });

            if (existingCity) {
                console.log(`⚠️ POTENTIAL DUPLICATE Found by City: ${existingCity.name}. Updating instead.`);
                await prisma.location.update({
                    where: { id: existingCity.id },
                    data: {
                        website: centre.website,
                        parkingSpaces: centre.parkingSpaces,
                        owner: (centre as any).owner
                    }
                });
            } else {
                console.log(`🆕 CREATING: ${centre.name}`);
                await prisma.location.create({
                    data: {
                        name: centre.name,
                        city: centre.city,
                        county: (centre as any).county || "Greater London",
                        website: centre.website,
                        parkingSpaces: centre.parkingSpaces,
                        postcode: (centre as any).postcode, // REQUIRED
                        latitude: (centre as any).latitude, // REQUIRED
                        longitude: (centre as any).longitude, // REQUIRED
                        facebook: (centre as any).facebook || null,
                        instagram: (centre as any).instagram || null,
                        owner: (centre as any).owner || null,
                        address: `${centre.name}, ${centre.city}, London`,
                        type: "SHOPPING_CENTRE"
                    }
                });
            }
        } else {
            console.log(`⚠️ SKIPPED: ${centre.name} (Not found in DB, and create=false)`);
        }
    }

    console.log("London Remediation complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
