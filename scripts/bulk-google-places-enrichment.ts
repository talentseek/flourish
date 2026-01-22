#!/usr/bin/env tsx
/**
 * BULK GOOGLE PLACES ENRICHMENT
 * 
 * Targets ALL locations missing websites to get:
 * - Website URLs
 * - Phone numbers
 * - Google ratings & reviews
 * - Opening hours
 * 
 * Usage: npx tsx scripts/bulk-google-places-enrichment.ts
 * 
 * Progress saved to /tmp/google-places-progress.json for resume
 */
import { PrismaClient } from '@prisma/client';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';

const prisma = new PrismaClient();

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBNelAzf6m_aHMBCscA-ToiaX1woHLS7sg';
const PROGRESS_FILE = '/tmp/google-places-progress.json';
const LOG_FILE = '/tmp/google-places-enrichment.log';
const BATCH_SIZE = 100; // Save progress every N locations
const DELAY_MS = 1500; // Rate limiting delay between API calls

interface Progress {
    startedAt: string;
    processedIds: string[];
    stats: {
        websitesFound: number;
        phonesFound: number;
        ratingsFound: number;
        hoursFound: number;
        notFound: number;
        errors: number;
    };
}

function log(msg: string) {
    const timestamp = new Date().toISOString().slice(11, 19);
    const line = `[${timestamp}] ${msg}`;
    console.log(line);
    try { appendFileSync(LOG_FILE, line + '\n'); } catch { }
}

function loadProgress(): Progress {
    try {
        if (existsSync(PROGRESS_FILE)) {
            return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return {
        startedAt: new Date().toISOString(),
        processedIds: [],
        stats: { websitesFound: 0, phonesFound: 0, ratingsFound: 0, hoursFound: 0, notFound: 0, errors: 0 }
    };
}

function saveProgress(progress: Progress) {
    try { writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2)); } catch { }
}

// Search for place by name and location
async function searchPlace(name: string, city: string, postcode?: string): Promise<string | null> {
    try {
        // Build search query - include "shopping" to help Google find retail locations
        const query = postcode
            ? `${name} ${postcode} UK`
            : `${name} ${city} UK shopping`;

        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].place_id;
        }

        return null;
    } catch (error) {
        return null;
    }
}

// Get detailed place information
async function getPlaceDetails(placeId: string): Promise<any> {
    try {
        const fields = [
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'opening_hours',
            'current_opening_hours'
        ].join(',');

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            return data.result;
        }

        return null;
    } catch (error) {
        return null;
    }
}

async function main() {
    log('');
    log('🌐 BULK GOOGLE PLACES ENRICHMENT');
    log('================================');

    const progress = loadProgress();

    // Get ALL locations missing websites
    const allLocations = await prisma.location.findMany({
        where: {
            OR: [
                { website: null },
                { website: '' }
            ]
        },
        select: {
            id: true,
            name: true,
            city: true,
            postcode: true,
            phone: true,
            googleRating: true,
            openingHours: true
        },
        orderBy: [
            { isManaged: 'desc' }, // Managed first
            { name: 'asc' }
        ]
    });

    // Filter out already processed
    const locations = allLocations.filter(l => !progress.processedIds.includes(l.id));

    log(`📊 Total without websites: ${allLocations.length}`);
    log(`📊 Already processed: ${progress.processedIds.length}`);
    log(`📊 Remaining: ${locations.length}`);
    log('');

    if (locations.length === 0) {
        log('✅ All locations already processed!');
        return;
    }

    const estimatedTime = Math.ceil(locations.length * DELAY_MS * 2 / 60000);
    log(`⏱️  Estimated time: ~${estimatedTime} minutes`);
    log('');

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];

        process.stdout.write(`[${i + 1}/${locations.length}] ${loc.name.substring(0, 35).padEnd(37)} `);

        try {
            // Step 1: Find place_id
            const placeId = await searchPlace(loc.name, loc.city, loc.postcode);

            if (!placeId) {
                console.log('❌ Not found');
                progress.stats.notFound++;
                progress.processedIds.push(loc.id);
                await new Promise(r => setTimeout(r, DELAY_MS));
                continue;
            }

            // Step 2: Get details
            const details = await getPlaceDetails(placeId);

            if (!details) {
                console.log('❌ No details');
                progress.stats.notFound++;
                progress.processedIds.push(loc.id);
                await new Promise(r => setTimeout(r, DELAY_MS));
                continue;
            }

            // Step 3: Build update
            const updateData: any = {};
            const found: string[] = [];

            if (details.website) {
                updateData.website = details.website;
                found.push('web');
                progress.stats.websitesFound++;
            }

            if (details.formatted_phone_number && !loc.phone) {
                updateData.phone = details.formatted_phone_number;
                found.push('phone');
                progress.stats.phonesFound++;
            }

            if (details.rating && !loc.googleRating) {
                updateData.googleRating = details.rating;
                updateData.googleReviews = details.user_ratings_total || 0;
                found.push('rating');
                progress.stats.ratingsFound++;
            }

            if ((details.opening_hours || details.current_opening_hours) && !loc.openingHours) {
                updateData.openingHours = {
                    weekday_text: details.current_opening_hours?.weekday_text || details.opening_hours?.weekday_text || [],
                    periods: details.opening_hours?.periods || []
                };
                found.push('hours');
                progress.stats.hoursFound++;
            }

            // Step 4: Update DB
            if (Object.keys(updateData).length > 0) {
                await prisma.location.update({
                    where: { id: loc.id },
                    data: updateData
                });
                console.log(`✅ ${found.join(', ')}`);
            } else {
                console.log('⚪ No new data');
            }

        } catch (error: any) {
            console.log(`❌ Error: ${error.message?.substring(0, 30)}`);
            progress.stats.errors++;
        }

        progress.processedIds.push(loc.id);

        // Save progress periodically
        if ((i + 1) % BATCH_SIZE === 0) {
            saveProgress(progress);
            log(`\n📊 Progress saved: ${progress.stats.websitesFound} websites found\n`);
        }

        await new Promise(r => setTimeout(r, DELAY_MS));
    }

    saveProgress(progress);

    log('');
    log('═'.repeat(50));
    log('ENRICHMENT COMPLETE');
    log('═'.repeat(50));
    log(`Websites found: ${progress.stats.websitesFound}`);
    log(`Phones found: ${progress.stats.phonesFound}`);
    log(`Ratings found: ${progress.stats.ratingsFound}`);
    log(`Hours found: ${progress.stats.hoursFound}`);
    log(`Not found: ${progress.stats.notFound}`);
    log(`Errors: ${progress.stats.errors}`);
}

main()
    .catch(e => log(`❌ CRASH: ${e.message}`))
    .finally(() => prisma.$disconnect());
