
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updates = [
        {
            name: "Meteor Centre",
            data: {
                owner: "Meteor SARL / Ares",
                retailSpace: 200000,
                website: "https://meteorcentre.co.uk/", // Likely
                isManaged: true
            }
        },
        {
            name: "Middlesbrough Leisure Park",
            data: {
                owner: "Legal & General",
                retailSpace: 110000,
                isManaged: true
            }
        },
        {
            name: "Monument Mall",
            data: {
                owner: "Reuben Brothers (Motcomb Estates)",
                retailSpace: 135000,
                website: "https://monumentmall.co.uk/", // Check validity
                isManaged: true
            }
        },
        {
            name: "Navan Town Centre",
            data: {
                owner: "Davy Target / Irish Life",
                retailSpace: 250000,
                numberOfStores: 70,
                website: "https://navantowncentre.ie/",
                isManaged: true
            }
        },
        {
            name: "Newkirkgate Shopping Centre",
            data: {
                owner: "Sheet Anchor Evolve (M Core)",
                retailSpace: 94000,
                website: "https://newkirkgate.com/",
                isManaged: true
            }
        },
        {
            name: "The Avenue",
            matchName: "The Avenue", // Newton Mearns
            data: {
                owner: "NewRiver",
                retailSpace: 198612,
                website: "https://avenueshopping.co.uk/",
                isManaged: true
            }
        },
        {
            name: "North Point Shopping Centre",
            data: {
                management: "FI Real Estate Management",
                retailSpace: 217000,
                numberOfStores: 70,
                website: "https://northpointshoppingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Orchard Centre",
            data: {
                owner: "British Land",
                retailSpace: 300000,
                website: "https://orchardcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Podium",
            data: {
                owner: "DTZ Investors",
                retailSpace: 90000,
                website: "https://podiumbath.co.uk/", // Inferred
                isManaged: true
            }
        },
        {
            name: "The Priory Shopping Centre",
            data: {
                owner: "Magnetar / Northdale",
                retailSpace: 203000,
                numberOfStores: 38,
                website: "https://prioryshoppingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Prospect Centre",
            data: {
                owner: "Z&F Properties",
                retailSpace: 323500,
                numberOfStores: 50,
                website: "https://prospectshoppingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Ridings Shopping Centre",
            data: {
                owner: "NewRiver",
                retailSpace: 319000,
                numberOfStores: 80,
                website: "https://ridingscentre.com/",
                isManaged: true
            }
        },
        {
            name: "Riverside Shopping Centre",
            data: {
                // Ambiguous, assume smallest common denominator or skip explicit owner if unsure which one this is in DB without town
                // But generally safe to mark managed.
                isManaged: true
            }
        },
        {
            name: "Ropewalk Shopping Centre",
            data: {
                management: "BTW Shields", // Owner undisclosed
                retailSpace: 185000,
                numberOfStores: 37,
                website: "https://ropewalknuneaton.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Royal Victoria Place",
            data: {
                owner: "Tunbridge Wells Borough Council",
                retailSpace: 320000,
                numberOfStores: 100,
                website: "https://royalvictoriaplace.com/",
                isManaged: true
            }
        },
        {
            name: "Salford Shopping Centre",
            data: {
                owner: "Salford Estates (Praxis)",
                retailSpace: 290000,
                numberOfStores: 80,
                website: "https://salfordshoppingcentre.com/",
                isManaged: true
            }
        },
        {
            name: "The Swan Centre",
            data: {
                owner: "Ellandi / CCP III",
                retailSpace: 324126,
                website: "https://swanshopping.com/",
                isManaged: true
            }
        },
        {
            name: "Telford Centre",
            data: {
                owner: "Orion Capital Managers",
                retailSpace: 1000000,
                numberOfStores: 160,
                website: "https://telfordcentre.com/",
                isManaged: true
            }
        },
        {
            name: "Templars Square",
            data: {
                owner: "Redevco",
                retailSpace: 236000,
                website: "https://templarssquare.com/",
                isManaged: true
            }
        },
        {
            name: "Trinity Square",
            data: {
                owner: "Tesco PLC",
                retailSpace: 261000,
                website: "https://trinitysquaregateshead.co.uk/",
                isManaged: true
            }
        },
        {
            name: "The Viking Centre",
            data: {
                owner: "Evolve Estates",
                retailSpace: 175000,
                numberOfStores: 60,
                website: "https://thevikingcentre.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Totton Shopping Centre",
            data: {
                owner: "Evolve Estates",
                retailSpace: 40000,
                numberOfStores: 23,
                isManaged: true
            }
        },
        {
            name: "Waterborne Walk",
            data: {
                owner: "Evolve Estates",
                retailSpace: 77750,
                numberOfStores: 20,
                isManaged: true
            }
        },
        {
            name: "Weavers Wharf",
            data: {
                owner: "LCP Group",
                retailSpace: 220000,
                website: "https://weaverswharf.co.uk/", // Likely
                isManaged: true
            }
        },
        {
            name: "Weston Favell Shopping Centre",
            data: {
                owner: "Redefine Properties",
                retailSpace: 330000,
                numberOfStores: 68,
                website: "https://westonfavellshopping.com/",
                isManaged: true
            }
        },
        {
            name: "West Park Farm Retail Park",
            data: {
                // Fragmented ownership
                isManaged: true
            }
        },
        {
            name: "The Willows",
            matchName: "Willows", // DB name
            data: {
                owner: "Sheet Anchor (LCP)",
                retailSpace: 85443,
                isManaged: true
            }
        },
        {
            name: "Windsor Royal Station",
            data: {
                owner: "AEW UK Investment Management",
                retailSpace: 142000,
                numberOfStores: 40,
                website: "https://windsorroyalstation.co.uk/",
                isManaged: true
            }
        },
        {
            name: "Woolshops",
            data: {
                management: "Savills",
                retailSpace: 236923,
                website: "https://woolshopsshoppingcentre.co.uk/",
                isManaged: true
            }
        }
    ];

    for (const update of updates) {
        const queryName = update.matchName || update.name;
        // Use more lenient matching for "The" prefix if needed
        const locs = await prisma.location.findMany({
            where: { name: { contains: queryName, mode: 'insensitive' } }
        });

        if (locs.length === 0) {
            console.log(`⚠️ No match for ${queryName}`);
            continue;
        }

        for (const loc of locs) {
            // Safety check for ambiguous matches like 'Riverside'
            if (update.name === "Riverside Shopping Centre" && locs.length > 1) {
                console.log(`⚠️ Multiple Riversides found, creating generic managed update only for: ${loc.name} (${loc.town})`);
            }

            console.log(`Updating ${loc.name} (${loc.town || 'No Town'})...`);
            await prisma.location.update({
                where: { id: loc.id },
                data: update.data
            });
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
