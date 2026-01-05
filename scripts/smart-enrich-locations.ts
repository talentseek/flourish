#!/usr/bin/env tsx
/**
 * 🏬 Smart Tenant Enrichment Orchestrator
 * 
 * Unified script that:
 * 1. Tries multiple URL patterns intelligently
 * 2. Extracts all tenants (retail + F&B) using AI
 * 3. Saves to database with proper categorization
 * 
 * Usage:
 *   npx tsx scripts/smart-enrich-locations.ts [limit]
 *   npx tsx scripts/smart-enrich-locations.ts 5  # Top 5 locations
 */

import { PrismaClient } from '@prisma/client';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

interface Tenant {
    name: string;
    category: string;
    subcategory?: string;
    tenant_type: string;
    is_anchor: boolean;
    url?: string;
}

interface ExtractionResult {
    tenants: Tenant[];
    total_count: number;
    categories: Record<string, number>;
}

// Run Python extraction script
async function extractTenants(storeUrl: string, diningUrl?: string): Promise<ExtractionResult | null> {
    return new Promise((resolve) => {
        const pythonPath = '/Users/mbeckett/miniconda3/bin/python3';
        const scriptPath = './scripts/smart_tenant_extraction.py';
        const args = diningUrl ? [scriptPath, storeUrl, diningUrl] : [scriptPath, storeUrl];

        const childProcess = spawn(pythonPath, args, {
            env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY || '' }
        });

        let output = '';
        let error = '';

        childProcess.stdout.on('data', (data) => { output += data.toString(); });
        childProcess.stderr.on('data', (data) => {
            // Log stderr but don't treat as error (crawl4ai logs to stderr)
            const msg = data.toString();
            if (!msg.includes('[INIT]') && !msg.includes('[FETCH]') && !msg.includes('[SCRAPE]')) {
                process.stderr.write(msg);
            }
        });

        const timer = setTimeout(() => {
            childProcess.kill();
            console.log(`   ⏱️  Timeout after 3 minutes`);
            resolve(null);
        }, 180000); // 3 minute timeout

        childProcess.on('close', (code) => {
            clearTimeout(timer);
            if (code !== 0) {
                resolve(null);
                return;
            }

            try {
                // Find the JSON in the output (may have stderr mixed in)
                const jsonMatch = output.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    resolve(result);
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.log(`   ⚠️  Parse error`);
                resolve(null);
            }
        });
    });
}

// Map category strings to normalized database categories
function normalizeCategory(category: string): string {
    const categoryMap: Record<string, string> = {
        'fashion': 'Fashion & Apparel',
        'f&b': 'Food & Beverage',
        'food & beverage': 'Food & Beverage',
        'food': 'Food & Beverage',
        'electronics': 'Electronics & Technology',
        'health & beauty': 'Health & Beauty',
        'home & living': 'Home & Garden',
        'home': 'Home & Garden',
        'services': 'Services',
        'entertainment': 'Entertainment',
        'sports & outdoors': 'Sports & Outdoors',
        'sports': 'Sports & Outdoors',
        'jewelry': 'Jewelry & Accessories',
        'kids & toys': 'Kids & Toys',
        'supermarket': 'Supermarket',
        'department store': 'Department Store',
    };

    if (!category) return 'General Retail';
    const lowerCat = category.toLowerCase();
    return categoryMap[lowerCat] || category;
}

async function main() {
    console.log('\n🏬 SMART TENANT ENRICHMENT\n');
    console.log('='.repeat(60));

    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY not set');
        process.exit(1);
    }

    const args = process.argv.slice(2);
    const limit = args[0] ? parseInt(args[0]) : undefined;

    // Get managed locations with footfall, sorted by footfall
    const locations = await prisma.location.findMany({
        where: {
            isManaged: true,
            footfall: { not: null },
            website: {
                not: null,
                notIn: ['https://thisisflourish.co.uk', 'http://thisisflourish.co.uk']
            },
        },
        select: {
            id: true,
            name: true,
            city: true,
            website: true,
            footfall: true,
            numberOfStores: true,
            _count: { select: { tenants: true } },
        },
        orderBy: { footfall: 'desc' },
        take: limit,
    });

    console.log(`📊 Found ${locations.length} managed locations with footfall data\n`);

    if (locations.length === 0) {
        console.log('❌ No locations to process');
        return;
    }

    let successCount = 0;
    let totalTenantsAdded = 0;

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        const footfallStr = `${(Number(loc.footfall) / 1000000).toFixed(1)}M`;
        // Generate base URLs with and without www
        let baseUrl = loc.website!.replace(/\/$/, '');

        // Helper to get both www and non-www variants
        const getUrlVariants = (url: string) => {
            const variants = [url];
            if (url.includes('://www.')) {
                // Has www, add without www
                variants.push(url.replace('://www.', '://'));
            } else {
                // No www, add with www
                variants.push(url.replace('://', '://www.'));
            }
            return variants;
        };

        const baseVariants = getUrlVariants(baseUrl);

        // Try multiple URL patterns - prefer www version first
        const urlPatterns: { store: string; dining: string | null }[] = [];

        // Add patterns for each base URL variant
        for (const base of baseVariants) {
            urlPatterns.push(
                { store: `${base}/shopping`, dining: `${base}/dining` },
                { store: `${base}/stores`, dining: `${base}/food-drink` },
                { store: `${base}/shops`, dining: `${base}/eat` },
                { store: `${base}/retailers`, dining: null },
                { store: `${base}/directory`, dining: null },
                { store: base, dining: null },
            );
        }

        console.log('='.repeat(60));
        console.log(`[${i + 1}/${locations.length}] ${loc.name} (${loc.city})`);
        console.log(`   Footfall: ${footfallStr} | Expected: ${loc.numberOfStores || '?'} stores`);
        console.log(`   Current tenants: ${loc._count.tenants}`);

        let result: ExtractionResult | null = null;

        for (const pattern of urlPatterns) {
            console.log(`   📍 Trying: ${pattern.store.replace(baseUrl, '...')}`);

            result = await extractTenants(pattern.store, pattern.dining || undefined);

            if (result && result.tenants && result.tenants.length >= 5) {
                console.log(`   ✅ Extracted ${result.tenants.length} tenants`);
                break;
            } else if (result && result.tenants && result.tenants.length > 0) {
                console.log(`   ⚠️  Only ${result.tenants.length} tenants, trying next pattern...`);
            }
        }

        if (!result || !result.tenants || result.tenants.length === 0) {
            console.log(`   ❌ No tenants extracted`);
            continue;
        }

        // Save to database
        console.log(`   💾 Saving to database...`);

        let saved = 0;
        let anchors = 0;

        for (const tenant of result.tenants) {
            const category = normalizeCategory(tenant.category);
            const isAnchor = tenant.is_anchor || false;

            if (isAnchor) anchors++;

            try {
                await prisma.tenant.upsert({
                    where: {
                        locationId_name: {
                            locationId: loc.id,
                            name: tenant.name,
                        },
                    },
                    create: {
                        locationId: loc.id,
                        name: tenant.name,
                        category,
                        subcategory: tenant.subcategory || null,
                        isAnchorTenant: isAnchor,
                    },
                    update: {
                        category,
                        subcategory: tenant.subcategory || null,
                        isAnchorTenant: isAnchor,
                    },
                });
                saved++;
            } catch (e) {
                // Skip duplicates or errors
            }
        }

        console.log(`   ✅ Saved ${saved} tenants (${anchors} anchors)`);
        console.log(`   📊 Categories: ${Object.keys(result.categories).slice(0, 5).join(', ')}`);

        successCount++;
        totalTenantsAdded += saved;

        // Progress checkpoint every 3 locations
        if ((i + 1) % 3 === 0) {
            console.log(`\n📊 CHECKPOINT: ${successCount}/${i + 1} success, ${totalTenantsAdded} tenants added\n`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 5000));
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ENRICHMENT COMPLETE!');
    console.log(`   Success: ${successCount}/${locations.length}`);
    console.log(`   Total tenants added: ${totalTenantsAdded}`);

    const totalTenants = await prisma.tenant.count();
    const withTenants = await prisma.location.count({ where: { tenants: { some: {} } } });
    console.log(`\n📊 DATABASE: ${totalTenants} total tenants across ${withTenants} locations`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
