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

async function extractSEOMetadata(website: string): Promise<SEOData> {
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
  $('nav a, header a, .menu a, .navigation a').each((_, el) => {
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

  // Deduplicate and limit
  const uniqueKeywords = [...new Set(keywords)].slice(0, 20);
  const uniqueTopPages = topPages
    .filter((page, idx, arr) => arr.findIndex(p => p.url === page.url) === idx)
    .slice(0, 15);

  return {
    keywords: uniqueKeywords,
    topPages: uniqueTopPages
  };
}

async function main() {
  console.log('🔍 SEO METADATA ENRICHMENT\n');
  console.log('Extracting keywords and top pages from websites...\n');

  const locations = await prisma.location.findMany({
    where: {
      website: { not: null }
    },
    select: {
      id: true,
      name: true,
      city: true,
      website: true,
      seoKeywords: true,
      topPages: true
    },
    orderBy: { name: 'asc' }
  });
  
  // Filter to only locations missing SEO data
  const locationsToEnrich = locations.filter(loc => 
    !loc.seoKeywords || !loc.topPages
  );

  console.log(`📊 Found ${locationsToEnrich.length} locations to process\n`);

  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;

  for (let i = 0; i < locationsToEnrich.length; i++) {
    const loc = locationsToEnrich[i];
    const progress = `[${i + 1}/${locationsToEnrich.length}]`;

    console.log(`${progress} ${loc.name} (${loc.city})`);

    const seoData = await extractSEOMetadata(loc.website!);

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
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ SEO metadata enrichment complete!');
  console.log(`   Full success (keywords + pages): ${successCount}/${locationsToEnrich.length}`);
  console.log(`   Partial: ${partialCount}/${locationsToEnrich.length}`);
  console.log(`   Failed: ${failCount}/${locationsToEnrich.length}`);

  // Count locations with SEO data (can't use count with JSON fields)
  const allLocs = await prisma.location.findMany({
    select: { seoKeywords: true, topPages: true }
  });
  const totalWithKeywords = allLocs.filter(l => l.seoKeywords !== null).length;
  const totalWithPages = allLocs.filter(l => l.topPages !== null).length;

  console.log(`\n📊 Overall SEO Coverage:`);
  console.log(`   Keywords: ${totalWithKeywords}/2626 (${(totalWithKeywords/2626*100).toFixed(1)}%)`);
  console.log(`   Top Pages: ${totalWithPages}/2626 (${(totalWithPages/2626*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

