#!/usr/bin/env tsx
/**
 * 🔄 PARALLEL SOCIAL MEDIA ENRICHMENT
 * Safe to run alongside tenant enrichment
 * Scrapes Instagram, Facebook, Twitter links from websites
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

async function scrapeSocialLinks(websiteUrl: string): Promise<SocialLinks> {
  const links: SocialLinks = {};

  try {
    const response = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return links;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Find all links
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')?.toLowerCase() || '';

      if ((href.includes('instagram.com/') || href.includes('instagr.am/')) && !links.instagram) {
        links.instagram = href.split('?')[0];
      }
      if ((href.includes('facebook.com/') || href.includes('fb.com/')) && !links.facebook) {
        links.facebook = href.split('?')[0];
      }
      if ((href.includes('twitter.com/') || href.includes('x.com/')) && !links.twitter) {
        links.twitter = href.split('?')[0];
      }
      if (href.includes('youtube.com/') && !links.youtube) {
        links.youtube = href.split('?')[0];
      }
      if (href.includes('tiktok.com/') && !links.tiktok) {
        links.tiktok = href.split('?')[0];
      }
    });

    // Also check meta tags
    $('meta[property^="og:"], meta[name*="twitter"]').each((_, element) => {
      const content = $(element).attr('content')?.toLowerCase() || '';
      
      if (content.includes('instagram.com/') && !links.instagram) {
        links.instagram = content.split('?')[0];
      }
      if (content.includes('facebook.com/') && !links.facebook) {
        links.facebook = content.split('?')[0];
      }
      if (content.includes('twitter.com/') && !links.twitter) {
        links.twitter = content.split('?')[0];
      }
    });

  } catch (error) {
    // Silently fail
  }

  return links;
}

async function main() {
  console.log('\n🔄 PARALLEL SOCIAL MEDIA ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Scraping social media links (safe to run alongside tenant enrichment)\n');

  // Get locations missing social media
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { instagram: null },
        { facebook: null },
        { twitter: null },
        { youtube: null },
        { tiktok: null },
      ],
    },
    select: { id: true, name: true, website: true },
    orderBy: { numberOfStores: 'desc' },
  });

  console.log(`📊 Found ${locations.length} locations to enrich\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`[${i + 1}/${locations.length}] ${loc.name}`);

    try {
      const social = await scrapeSocialLinks(loc.website!);

      const updateData: any = {};
      if (social.instagram) updateData.instagram = social.instagram;
      if (social.facebook) updateData.facebook = social.facebook;
      if (social.twitter) updateData.twitter = social.twitter;
      if (social.youtube) updateData.youtube = social.youtube;
      if (social.tiktok) updateData.tiktok = social.tiktok;

      if (Object.keys(updateData).length > 0) {
        await prisma.location.update({
          where: { id: loc.id },
          data: updateData,
        });

        const found = Object.keys(updateData).join(', ');
        console.log(`   ✅ Found: ${found}`);
        success++;
      } else {
        console.log(`   ⚠️  No social links found`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Progress update every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n📈 Progress: ${success} enriched, ${failed} failed\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SOCIAL MEDIA ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Success: ${success}/${locations.length}`);
  console.log(`Failed: ${failed}/${locations.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

