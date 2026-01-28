
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma
const prisma = new PrismaClient();

// Load JSON data
const JSON_PATH = path.join(process.cwd(), 'src/data/location-managers.json');

// Interface for JSON data
interface LocationManagerData {
    Location: string;
    Postcode: string | null;
    "Regional Manager": string | null;
    "RM Email": string | null;
    "RM Telephone": string | null;
    "RM Tel:": string | null;
}

// Matching Logic (Reused from page.tsx)
function findRegionalManager(location: { name: string; postcode: string }, managers: LocationManagerData[]) {
    // Helper to normalize strings for comparison
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizePostcode = (s: string) => s.replace(/\s/g, '').toLowerCase();

    // 1. Try postcode match first (most reliable)
    let match = managers.find((m) =>
        m.Postcode && location.postcode &&
        normalizePostcode(m.Postcode) === normalizePostcode(location.postcode)
    );

    // 2. Try normalized name match (handles case/punctuation differences)
    if (!match) {
        match = managers.find((m) =>
            normalize(m.Location) === normalize(location.name)
        );
    }

    // 3. Try fuzzy containment (significant words from JSON must appear in DB name)
    if (!match) {
        match = managers.find((m) => {
            const jsonWords = m.Location.toLowerCase()
                .split(/[\s,]+/)
                .filter((w) => w.length > 3 && !['shopping', 'centre', 'center', 'retail', 'park'].includes(w));
            const dbName = location.name.toLowerCase();
            return jsonWords.length > 0 && jsonWords.every((word) => dbName.includes(word));
        });
    }

    return match;
}

async function auditManagedLocations() {
    console.log('🚀 Starting Audit of Managed Locations...');

    // 1. Load JSON Data
    if (!fs.existsSync(JSON_PATH)) {
        console.error(`❌ Error: Source file not found at ${JSON_PATH}`);
        process.exit(1);
    }
    const rawData = fs.readFileSync(JSON_PATH, 'utf-8');
    const managers: LocationManagerData[] = JSON.parse(rawData);
    console.log(`📚 Loaded ${managers.length} entries from location-managers.json`);

    // 2. Fetch Managed Locations from DB
    const locations = await prisma.location.findMany({
        where: { isManaged: true },
        select: { id: true, name: true, postcode: true, regionalManager: true }
    });
    console.log(`🏢 Found ${locations.length} managed locations in Database`);

    const results = {
        total: locations.length,
        healthy: 0,
        fixed: 0,
        failed: 0,
        details: [] as string[]
    };

    // 3. Audit & Fix
    for (const loc of locations) {
        const statusLinePrefix = `- **${loc.name}** (${loc.postcode})`;

        // Check if already healthy
        if (loc.regionalManager) {
            results.healthy++;
            results.details.push(`${statusLinePrefix}: ✅ Healthy (RM: ${loc.regionalManager})`);
            continue;
        }

        // Attempt to find match
        const match = findRegionalManager({ name: loc.name, postcode: loc.postcode }, managers);

        if (match && match["Regional Manager"]) {
            const newManager = match["Regional Manager"];

            // FIX: Update Database
            await prisma.location.update({
                where: { id: loc.id },
                data: { regionalManager: newManager }
            });

            results.fixed++;
            results.details.push(`${statusLinePrefix}: 🛠️ FIXED. Assigned to **${newManager}** (Matched via: ${match.Location})`);
        } else {
            results.failed++;
            results.details.push(`${statusLinePrefix}: ⚠️ ORPHANED. No match found in JSON.`);
        }
    }

    // 4. Generate Report
    const reportContent = `
# Audit Report: Managed Locations

**Date:** ${new Date().toLocaleString()}
**Summary:**
- **Total Managed Locations:** ${results.total}
- **✅ Healthy:** ${results.healthy}
- **🛠️ Fixed:** ${results.fixed}
- **⚠️ Orphaned:** ${results.failed}

## Details
${results.details.join('\n')}
  `;

    const reportPath = path.join(process.cwd(), 'AUDIT_MANAGED_LOCATIONS.md');
    fs.writeFileSync(reportPath, reportContent);

    console.log('\n📊 Audit Complete!');
    console.log(`✅ Healthy: ${results.healthy}`);
    console.log(`🛠️ Fixed:   ${results.fixed}`);
    console.log(`⚠️ Orphaned: ${results.failed}`);
    console.log(`📄 Report saved to: ${reportPath}`);
}

// Execute
auditManagedLocations()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
