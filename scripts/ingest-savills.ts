
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Savills Portfolio Ingestion...");

    const filePath = 'public/savills_shopping_centres_comprehensive.xlsx';
    if (!fs.existsSync(filePath)) throw new Error("File not found");

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    console.log(`Loaded ${rawData.length} rows.`);

    let stats = {
        updated: 0,
        created: 0,
        skipped: 0,
        errors: 0
    };

    for (const row of rawData as any[]) {
        const name = row['name'];
        const city = row['location'];
        const region = row['region'];
        const category = row['category']; // "Prime & Regional", "Community & Town", "Shopping Park"
        const contactName = row['contact_name'];
        const email = row['email'];
        const phone = row['phone'];

        if (!name) continue;

        // Determine Type
        let type = 'SHOPPING_CENTRE';
        if (category && category.toLowerCase().includes('park')) {
            type = 'RETAIL_PARK';
        }

        console.log(`Processing: ${name} (${city})...`);

        // Find Match
        // Strategy: 
        // 1. Exact Name match
        // 2. "Name Shopping Centre" match
        // 3. Name + City match
        let loc = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: { equals: name, mode: 'insensitive' } },
                    { name: { equals: `${name} Shopping Centre`, mode: 'insensitive' } },
                    {
                        AND: [
                            { name: { contains: name.split(' ')[0], mode: 'insensitive' } },
                            { city: { contains: city, mode: 'insensitive' } }
                        ]
                    }
                ]
            }
        });

        // Prepare Data
        const managementData = {
            management: 'Savills',
            managementContact: contactName || null,
            managementEmail: email || null,
            managementPhone: phone || null,
            // DO NOT TOUCH isManaged
        };

        if (loc) {
            console.log(`   -> MATCH: ${loc.name} (ID: ${loc.id})`);
            // Update
            await prisma.location.update({
                where: { id: loc.id },
                data: managementData
            });
            stats.updated++;
        } else {
            console.log(`   -> NEW: Creating ${name}...`);
            // Create
            await prisma.location.create({
                data: {
                    name: name,
                    city: city || 'Unknown',
                    county: region || 'Unknown', // Map region to county for now
                    postcode: 'UNKNOWN', // We don't have postcards in this Excel? Address lookup needed?
                    // Wait, do we have postcodes? The analysis didn't show them.
                    // We will set UNKNOWN and expect enrichment later.
                    address: `Savills Portfolio Import`,
                    isManaged: false, // Default for non-Flourish
                    type: type as any,
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
