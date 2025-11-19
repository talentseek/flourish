#!/usr/bin/env tsx
/**
 * 🔍 SEO METADATA ENHANCED
 * Enhanced extraction with sitemap.xml support
 */

import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface SEOData {
  keywords: string[];
  topPages: {url: string, title: string}[];
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}

async function fetchSitemap(baseUrl: string): Promise<string[]> {
  try {
    const sitemapUrl = new URL('/sitemap.xml', baseUrl).href;
    const html = await fetchHTML(sitemapUrl);
    if (!html) return [];
    
    const $ = cheerio.load(html, { xmlMode: true });
    const urls: string[] = [];
    
    $('url > loc').each((_, elem) => {
      const url = $(elem).text();
      if (url) urls.push(url);
    });
    
    return urls;
  } catch {
    return [];
  }
}

async function extractSEOMetadataEnhanced(website: string): Promise<SEOData> {
  const html = await fetchHTML(website);
  if (!html) return { keywords: [], topPages: [] };

  const $ = cheerio.load(html);
  const keywords: string[] = [];
  const topPages: {url: string, title: string}[] = [];

  // Method 1: Meta keywords tag (old school but still used)
  const metaKeywords = $('meta[name="keywords"]').attr('content');
  if (metaKeywords) {
    keywords.push(...metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0));
  }

  // Method 2: Title and H1 tags (primary keywords)
  const title = $('title').text().trim();
  if (title) {
    // Extract key terms from title (remove common words)
    const titleWords = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['shopping', 'centre', 'center', 'retail', 'park', 'the', 'and', 'for'].includes(w));
    keywords.push(...titleWords);
  }

  $('h1, h2').each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const words = text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['shopping', 'centre', 'center', 'retail', 'park', 'the', 'and', 'for'].includes(w));
    keywords.push(...words);
  });

  // Method 3: Extract navigation links as "top pages"
  $('nav a, header a, .menu a, .navigation a, footer a').each((_, el) => {
    const href = $(el).attr('href');
    const linkText = $(el).text().trim();
    
    if (href && linkText && !href.startsWith('#') && !href.includes('facebook') && !href.includes('twitter')) {
      let fullUrl = href;
      if (href.startsWith('/')) {
        const baseUrl = new URL(website);
        fullUrl = `${baseUrl.protocol}//${baseUrl.host}${href}`;
      }
      
      if (fullUrl.startsWith('http')) {
        topPages.push({ url: fullUrl, title: linkText });
      }
    }
  });

  // Method 4: Meta description (extract key terms)
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) {
    const descWords = metaDesc
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['shopping', 'centre', 'center', 'retail', 'park', 'visit', 'explore'].includes(w));
    keywords.push(...descWords.slice(0, 10));
  }

  // Method 5: Extract from sitemap.xml (enhanced)
  try {
    const sitemapUrls = await fetchSitemap(website);
    if (sitemapUrls.length > 0) {
      // Add top pages from sitemap (prioritize main pages)
      const mainPages = sitemapUrls
        .filter(url => {
          const urlLower = url.toLowerCase();
          return !urlLower.includes('tag') && 
                 !urlLower.includes('category') && 
                 !urlLower.includes('author') &&
                 !urlLower.includes('page') &&
                 urlLower.split('/').length <= 5; // Main pages only
        })
        .slice(0, 10);
      
      for (const pageUrl of mainPages) {
        // Try to get title from page
        const pageHTML = await fetchHTML(pageUrl);
        if (pageHTML) {
          const $page = cheerio.load(pageHTML);
          const pageTitle = $page('title').text().trim() || new URL(pageUrl).pathname;
          topPages.push({ url: pageUrl, title: pageTitle });
        } else {
          topPages.push({ url: pageUrl, title: new URL(pageUrl).pathname });
        }
      }
    }
  } catch {
    // Ignore sitemap errors
  }

  // Method 6: Extract keywords from JSON-LD structured data
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const jsonText = $(elem).html();
      if (!jsonText) return;
      
      const data = JSON.parse(jsonText);
      
      if (data.keywords) {
        const kwArray = Array.isArray(data.keywords) ? data.keywords : [data.keywords];
        keywords.push(...kwArray.map((k: string) => k.toLowerCase().trim()).filter((k: string) => k.length > 2));
      }
      
      if (data.description) {
        const descWords = data.description
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 4);
        keywords.push(...descWords.slice(0, 5));
      }
    } catch {
      // Ignore JSON parse errors
    }
  });

  // Deduplicate and limit
  const uniqueKeywords = [...new Set(keywords)].slice(0, 25);
  const uniqueTopPages = topPages
    .filter((page, idx, arr) => arr.findIndex(p => p.url === page.url) === idx)
    .slice(0, 20);

  return {
    keywords: uniqueKeywords,
    topPages: uniqueTopPages
  };
}

async function main() {
  console.log('🔍 SEO METADATA ENHANCED\n');
  console.log('Enhanced extraction with sitemap.xml support...\n');

  const allLocations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      seoKeywords: true,
      topPages: true
    },
    orderBy: { numberOfStores: 'desc' }
  });
  
  // Filter to only locations missing SEO data (Prisma can't filter JSON fields with null)
  const locations = allLocations.filter(loc => 
    !loc.seoKeywords || !loc.topPages
  );
  
  console.log(`📊 Found ${locations.length} locations to process (out of ${allLocations.length} total)\n`);

  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;

    console.log(`${progress} ${loc.name} (${loc.city})`);

    const seoData = await extractSEOMetadataEnhanced(loc.website!);

    const updateData: any = {};
    const found: string[] = [];

    if (seoData.keywords.length > 0 && !loc.seoKeywords) {
      updateData.seoKeywords = seoData.keywords;
      found.push(`Keywords: ${seoData.keywords.length}`);
    }

    if (seoData.topPages.length > 0 && !loc.topPages) {
      updateData.topPages = seoData.topPages;
      found.push(`Pages: ${seoData.topPages.length}`);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      console.log(`   ✅ ${found.join(', ')}`);
      
      if (seoData.keywords.length > 0 && seoData.topPages.length > 0) {
        successCount++;
      } else {
        partialCount++;
      }
    } else {
      console.log(`   ❌ No SEO data found`);
      failCount++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Progress update every 25
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} full, ${partialCount} partial, ${failCount} failed\n`);
    }
  }

  console.log('\n✅ SEO metadata enhanced enrichment complete!');
  console.log(`   Full success (keywords + pages): ${successCount}/${locations.length}`);
  console.log(`   Partial: ${partialCount}/${locations.length}`);
  console.log(`   Failed: ${failCount}/${locations.length}`);

  // Count locations with SEO data
  const allLocs = await prisma.location.findMany({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } },
    select: { seoKeywords: true, topPages: true }
  });
  const totalWithKeywords = allLocs.filter(l => l.seoKeywords !== null).length;
  const totalWithPages = allLocs.filter(l => l.topPages !== null).length;
  const totalLocations = allLocs.length;

  console.log(`\n📊 Overall SEO Coverage:`);
  console.log(`   Keywords: ${totalWithKeywords}/${totalLocations} (${(totalWithKeywords/totalLocations*100).toFixed(1)}%)`);
  console.log(`   Top Pages: ${totalWithPages}/${totalLocations} (${(totalWithPages/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

