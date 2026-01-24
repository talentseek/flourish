
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const filePath = 'public/savills_shopping_centres_comprehensive.xlsx';

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    // Read workbook
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} records in sheet '${sheetName}'.`);
    console.log("Column Headers:", Object.keys(data[0] || {}));

    console.log("\nSample Records:");
    data.slice(0, 3).forEach(r => console.log(r));

    // Optional: Check current DB match rate on a small sample
    console.log("\nChecking Match Rate (First 5)...");
    for (let i = 0; i < 5 && i < data.length; i++) {
        const row: any = data[i];
        // Guess column names (adjust after first run if needed)
        // Assuming 'Shopping Centre' or similar
        const name = row['Shopping Centre'] || row['Name'] || Object.values(row)[0];

        if (name) {
            const match = await prisma.location.findFirst({
                where: { name: { contains: name.toString() } }
            });
            console.log(`- '${name}' -> ${match ? `MATCH (${match.name}) [Managed: ${match.isManaged}]` : 'MISSING'}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
