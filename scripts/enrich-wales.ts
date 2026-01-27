
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const TARGETS = [
    // Batch A
    { name: "Aberafan Centre", url: "https://aberafanshopping.co.uk/" }, // Port Talbot
    { name: "Cwmbran Shopping Centre", url: "https://www.cwmbrancentre.com/" },
    { name: "Cyfarthfa Shopping Park", url: "https://www.cyfarthfashopping.com/" }, // Merthyr Tydfil
    { name: "The Quadrant Centre", url: "https://quadrantshopping.co.uk/" }, // Swansea
    { name: "St David's Dewi Sant", url: "https://stdavidscardiff.com/" }, // Cardiff
    { name: "St Catherine's Walk", url: "https://stcatherineswalk.com/" }, // Carmarthen
    { name: "Eagles Meadow", url: "https://eagles-meadow.co.uk/" }, // Wrexham
    { name: "Friars Walk Shopping Centre", url: "https://friarswalknewport.co.uk/" }, // Newport
    { name: "Merlin's Walk", url: "https://merlinswalk.com/" }, // Carmarthen
    { name: "Mermaid Quay", url: "https://www.mermaidquay.co.uk/" }, // Cardiff
    { name: "Queens Arcade Shopping Centre", url: "https://queensarcadecardiff.co.uk/" }, // Cardiff
    { name: "St. Elli Shopping Centre", url: "https://www.st-elli.co.uk/" }, // Llanelli
    { name: "St. Tydfil Square Shopping Centre", url: "https://sttydfilshoppingcentre.co.uk/" }, // Merthyr Tydfil
    { name: "The Rhiw Shopping Centre", url: "https://rhiw.shopping/" }, // Bridgend

    // Batch B
    { name: "The Capitol", url: "https://capitolcardiff.co.uk/" }, // Cardiff
    { name: "White Rose Centre", url: "https://whiterosecentre.co.uk/" }, // Rhyl
    { name: "Castle Court Shopping Centre", url: "https://castlecourtwales.co.uk/" }, // Caerphilly
    { name: "Daniel Owen Centre", url: "https://danielowencentre.org.uk/" }, // Mold
    { name: "Kingsway Shopping Centre", url: "https://kingswaycentre.com/" }, // Newport
    { name: "Deiniol Shopping Centre", url: "https://www.deiniolshoppingcentre.co.uk/" }, // Bangor
    { name: "Bethel Square Shopping Centre", url: "https://bethelsquare.co.uk/" }, // Brecon
    { name: "Bridgend Shopping Centre", url: "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-bridgend/" }, // McArthurGlen
    { name: "Parc Trostre", url: "https://www.parctrostreretailpark.co.uk/" }, // Llanelli
    { name: "Parc Fforestfach", url: "https://fforestfachretailparc.co.uk/" }, // Swansea
    { name: "Bay View Shopping Centre", url: "https://bayviewshopping.com/" } // Colwyn Bay
];

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🚀 Starting Wales Enrichment (${TARGETS.length} Sites)...`);
    let successCount = 0;

    for (const t of TARGETS) {
        console.log(`\n📍 Processing: ${t.name}...`);

        // Use loose matching for names to catch slight variations
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: t.name, mode: 'insensitive' }
            }
        });

        if (locs.length === 0) {
            console.log(`   ❌ Could not find location in DB: ${t.name}`);
            continue;
        }

        const location = locs[0];
        console.log(`   ✅ Matched: ${location.name} (ID: ${location.id}) - ${location.city}`);

        const updateData: any = { website: t.url };

        // Scrape Socials
        try {
            const resp = await axios.get(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 8000
            });
            const $ = cheerio.load(resp.data);

            $('a[href]').each((_, el) => {
                const href = $(el).attr('href')?.toLowerCase();
                if (!href) return;

                if (href.includes('facebook.com') && !href.includes('sharer')) updateData.facebook = $(el).attr('href');
                if (href.includes('instagram.com')) updateData.instagram = $(el).attr('href');
                if (href.includes('twitter.com') || href.includes('x.com')) updateData.twitter = $(el).attr('href');
            });

            if (Object.keys(updateData).length > 1) {
                console.log(`   found socials:`, Object.keys(updateData).filter(k => k !== 'website'));
            }
        } catch (e) {
            console.log(`   ⚠️ Scraping failed/timeout, saving URL only.`);
        }

        await prisma.location.update({
            where: { id: location.id },
            data: updateData
        });
        successCount++;
        await delay(500);
    }

    console.log(`\n🎉 Wales Enrichment Complete! Updated ${successCount}/${TARGETS.length}.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
