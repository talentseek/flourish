
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const filePath = 'public/mcore_shopping_centres_comprehensive.xlsx';
    if (!fs.existsSync(filePath)) {
        console.error("File not found");
        return;
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Loaded ${data.length} M Core records.`);
    console.log("Headers:", Object.keys(data[0] || {}));
    console.log("Sample:", data[0]);

    // Check overlaps
    console.log("\nChecking Conflicts...");
    let conflicts = 0;

    for (const row of data as any[]) {
        const name = row['Centre Name'];
        if (!name) continue;

        const existing = await prisma.location.findFirst({
            where: { name: { contains: name } }
        });

        if (existing && existing.management && !existing.management.includes('M Core')) {
            console.log(`⚠️  Conflict: ${name} is managed by '${existing.management}'`);
            conflicts++;
        }
    }
    console.log(`Total Conflicts: ${conflicts}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
