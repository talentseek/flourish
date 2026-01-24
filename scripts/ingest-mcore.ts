
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting M Core Portfolio Ingestion...");

    const filePath = 'public/mcore_shopping_centres_comprehensive.xlsx';
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    let stats = { updated: 0, created: 0, overwritten: 0 };

    for (const row of rawData as any[]) {
        const name = row['Centre Name'];
        const city = row['Location'];
        const manager = row['Centre Manager'];
        const email = row['Email'];
        const phone = row['Phone'];
        // Default fallbacks if empty
        const finalEmail = email || 'info@mcoreproperty.com';
        const finalPhone = phone || '+44 (0) 1384 400 123';

        if (!name) continue;

        const managementData = {
            management: 'M Core (LCP/Evolve)',
            managementContact: manager || 'M Core Management Team',
            managementEmail: finalEmail,
            managementPhone: finalPhone
        };

        // Fuzzy Match Strategy
        // 1. Exact Name
        // 2. Name + SC Suffix
        // 3. Name (First Word) + City
        let loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { name: { equals: `${name} Shopping Centre`, mode: 'insensitive' } },
                    {
                        AND: [
                            { name: { contains: name.split(' ')[0], mode: 'insensitive' } },
                            { city: { contains: city, mode: 'insensitive' } },
                            { type: 'SHOPPING_CENTRE' } // Prefer SCs if ambiguous
                        ]
                    }
                ]
            }
        });

        if (loc) {
            if (loc.management && !loc.management.includes('M Core')) {
                console.log(`⚠️  Overwriting ${loc.management} -> M Core for ${loc.name}`);
                stats.overwritten++;
            }

            await prisma.location.update({
                where: { id: loc.id },
                data: managementData
            });
            console.log(`✅ Updated ${loc.name}`);
            stats.updated++;
        } else {
            console.log(`🆕 Creating ${name}...`);
            await prisma.location.create({
                data: {
                    name: name,
                    city: city,
                    type: 'SHOPPING_CENTRE',
                    address: `${name}, ${city}`,
                    postcode: 'UNKNOWN',
                    county: row['Region'] || 'Unknown',
                    latitude: 0,
                    longitude: 0,
                    ...managementData
                }
            });
            stats.created++;
        }
    }

    console.log("\n--- Ingestion Complete ---");
    console.log(stats);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
