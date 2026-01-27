
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const LOCATION_ID = "cmicxw4gi000m13hx9mghuxqm"; // Kingsland Thatcham
const WEBSITE_URL = "https://kingslandcentre.co.uk/";

async function main() {
    console.log("🚀 Starting Kingsland Centre Enrichment...");

    // 1. Update Website URL
    console.log(`Phase 1: Updating Database URL to ${WEBSITE_URL}...`);
    await prisma.location.update({
        where: { id: LOCATION_ID },
        data: { website: WEBSITE_URL }
    });
    console.log("✅ URL Updated.");

    // 2. Fetch Website
    console.log("Phase 2: Scraping Website...");
    try {
        const response = await axios.get(WEBSITE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        // 3. Extract Data
        const tenants: string[] = [];
        const socials: { instagram?: string, facebook?: string, twitter?: string } = {};

        // Attempt to find tenants in common structures
        // Strategy A: Look for store lists
        $('div.store-list h3, li.store-item, div.tenant-name, a.store-link, h4.store-title').each((_, el) => {
            const name = $(el).text().trim();
            if (name && name.length < 50 && !['stores', 'view all', 'map', 'directions'].includes(name.toLowerCase())) {
                tenants.push(name);
            }
        });

        // Strategy B: If list is empty, try navigation menus for "Stores"
        if (tenants.length === 0) {
            $('ul.menu li a').each((_, el) => {
                const text = $(el).text();
                if (text.includes('Store') || text.includes('Shop')) {
                    // Follow link? For now, just logging possibilities
                    console.log(`   Found Stores link: ${$(el).attr('href')}`);
                }
            });
            // Usually main page has featured stores
            $('img[alt]').each((_, el) => {
                const alt = $(el).attr('alt');
                if (alt && ['costa', 'waitrose', 'holland', 'boots'].some(k => alt.toLowerCase().includes(k))) {
                    tenants.push(alt);
                }
            });
        }

        // Strategy C: Check /stores page directly if few results
        if (tenants.length < 5) {
            console.log("   ⚠️ Few tenants found on Home. Checking /stores...");
            try {
                const storesUrl = `${WEBSITE_URL.replace(/\/$/, '')}/stores`;
                const storesResp = await axios.get(storesUrl);
                const $stores = cheerio.load(storesResp.data);

                $stores('div.store-list h3, li.store-item, h2.entry-title, .store-grid-item h3, a.elementor-button-link').each((_, el) => {
                    const name = $stores(el).text().trim();
                    if (name && name.length < 50 && !['stores', 'view', 'read more', 'click here'].includes(name.toLowerCase())) {
                        tenants.push(name);
                    }
                });
            } catch (e) {
                console.log("   ⚠️ Could not fetch /stores page. Trying /shops...");
                try {
                    const shopsUrl = `${WEBSITE_URL.replace(/\/$/, '')}/shops`;
                    const shopsResp = await axios.get(shopsUrl);
                    const $shops = cheerio.load(shopsResp.data);
                    $shops('div.store-list h3, li.store-item, h2.entry-title').each((_, el) => {
                        const name = $shops(el).text().trim();
                        if (name && name.length < 50) tenants.push(name);
                    });
                } catch (e2) {
                    console.log("   ⚠️ Could not fetch /shops page either.");
                    // Debug: Print menu
                    console.log("   Menu items found:");
                    $('ul.menu li a, nav a').each((_, el) => {
                        console.log(`     - ${$(el).text().trim()} => ${$(el).attr('href')}`);
                    });
                }
            }
        }

        // Deduplicate
        const uniqueTenants = Array.from(new Set(tenants));
        const tenantsToProcess = uniqueTenants.length > 0 ? uniqueTenants : tenants;

        console.log(`\nFound ${uniqueTenants.length} unique tenants:`, uniqueTenants.slice(0, 5));
        console.log("Found Socials:", socials);

        // Socials - Footer usually
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href')?.toLowerCase();
            if (!href) return;
            if (href.includes('facebook.com')) socials.facebook = href;
            if (href.includes('instagram.com')) socials.instagram = href;
            if (href.includes('twitter.com') || href.includes('x.com')) socials.twitter = href;
        });

        console.log(`\nFound ${tenants.length} potential tenants:`, tenants.slice(0, 5));
        console.log("Found Socials:", socials);

        // 4. Update Database
        if (Object.keys(socials).length > 0) {
            await prisma.location.update({
                where: { id: LOCATION_ID },
                data: socials
            });
            console.log("✅ Socials Updated.");
        }

        if (tenantsToProcess.length > 0) {
            console.log("Updating Tenants...");
            for (const tName of tenantsToProcess) {
                // Simple upsert logic
                // Avoid duplicates by checking first?? No, relies on unique constraint if exists, but Tenant is unique by [locationId, name]
                try {
                    // Check if tenant exists
                    const exists = await prisma.tenant.findUnique({
                        where: {
                            locationId_name: {
                                locationId: LOCATION_ID,
                                name: tName
                            }
                        }
                    });

                    if (!exists) {
                        await prisma.tenant.create({
                            data: {
                                locationId: LOCATION_ID,
                                name: tName,
                                category: "Uncategorized", // Can enrich later
                                isAnchorTenant: ['waitrose', 'sainsbury', 'tesco', 'm&s'].some(a => tName.toLowerCase().includes(a))
                            }
                        });
                        process.stdout.write('+');
                    } else {
                        process.stdout.write('.');
                    }
                } catch (e) {
                    // Ignore specific dupe errors if race condition
                }
            }
            console.log("\n✅ Tenants Processed.");
        }

    } catch (error) {
        console.error("❌ Scraping failed:", error.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
