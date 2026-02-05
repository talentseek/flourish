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
    console.log("🐝 [Buzz] Managed Regional Enrichment: Amanda Bishop Batch");
    console.log("=".repeat(60));

    const locations = await prisma.location.findMany({
        where: {
            regionalManager: 'Amanda Bishop',
            isManaged: true,
            website: { 
                not: null,
                notIn: ['https://thisisflourish.co.uk', 'http://thisisflourish.co.uk']
            }
        },
        include: { _count: { select: { tenants: true } } }
    });

    console.log(`👤 RM: Amanda Bishop | Sites: ${locations.length}`);

    for (const loc of locations) {
        console.log(`\n📂 Site: ${loc.name} (${loc.city})`);
        
        const currentTenants = loc._count.tenants;
        const expectedStores = loc.numberOfStores || 0;
        
        // Target sites with 0 or very few tenants
        if (currentTenants < expectedStores * 0.5 || currentTenants < 5) {
            console.log(`   🏗️  Enriching Tenants (Current: ${currentTenants} / Expected: ${expectedStores})`);
            const baseUrl = loc.website!.replace(/\/$/, '');
            const paths = ['/stores', '/shopping', '/store-directory', '/brands', '/shops', ''];
            
            for (const p of paths) {
                const url = baseUrl + (p.startsWith('/') ? p : '/' + p);
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
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
