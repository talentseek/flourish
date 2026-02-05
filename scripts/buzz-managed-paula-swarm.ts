import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

const PYTHON_PATH = '/Users/mbeckett/miniconda3/bin/python3';
const SCRAPER_PATH = './scripts/crawl4ai_scraper.py';

async function runCrawl4AI(url: string, timeout: number = 90000): Promise<any[]> {
    return new Promise((resolve) => {
        const childProcess = spawn(PYTHON_PATH, [SCRAPER_PATH, url], {
            env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' }
        });
        let output = '';
        childProcess.stdout.on('data', (data) => output += data.toString());
        const timer = setTimeout(() => { childProcess.kill(); resolve([]); }, timeout);
        childProcess.on('close', () => {
            clearTimeout(timer);
            try {
                const result = JSON.parse(output);
                resolve(Array.isArray(result) ? result : (result.stores || []));
            } catch { resolve([]); }
        });
    });
}

async function main() {
    console.log("🐝 [Buzz] Managed Regional Enrichment: Paula Muers Batch");
    console.log("=".repeat(60));

    const locations = await prisma.location.findMany({
        where: {
            regionalManager: 'Paula Muers',
            isManaged: true,
            website: { not: null }
        },
        include: { _count: { select: { tenants: true } } }
    });

    console.log(`👤 RM: Paula Muers | Sites: ${locations.length}`);

    for (const loc of locations) {
        console.log(`\n📂 Site: ${loc.name} (${loc.city})`);
        
        // 1. Check if we need tenants
        const currentTenants = loc._count.tenants;
        const expectedStores = loc.numberOfStores || 0;
        
        if (currentTenants < expectedStores * 0.8 || currentTenants === 0) {
            console.log(`   🏗️  Enriching Tenants (Current: ${currentTenants} / Expected: ${expectedStores})`);
            const baseUrl = loc.website!.replace(/\/$/, '');
            const paths = ['/stores', '/shopping', '/store-directory', '/brands', ''];
            
            for (const p of paths) {
                const url = baseUrl + p;
                console.log(`      📍 Probing: ${url}`);
                const stores = await runCrawl4AI(url);
                if (stores.length > 5) {
                    for (const s of stores) {
                        await prisma.tenant.upsert({
                            where: { locationId_name: { locationId: loc.id, name: s.name } },
                            create: { locationId: loc.id, name: s.name, category: s.category || 'Other' },
                            update: { category: s.category || 'Other' }
                        });
                    }
                    console.log(`      ✅ Saved ${stores.length} tenants.`);
                    break;
                }
            }
        } else {
            console.log(`   ✅ Tenants look healthy (${currentTenants}).`);
        }

        // 2. Check for missing metadata (openedYear, numberOfFloors, etc)
        if (!loc.openedYear || !loc.numberOfFloors) {
            // Future Buzz: Add dedicated operational meta-scraper here
            console.log(`   ℹ️  Operational meta-gaps detected (Year/Floors).`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
