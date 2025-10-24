import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface FacebookData {
  rating?: number;
  reviews?: number;
  votes?: number;
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}

async function extractFacebookData(facebookUrl: string): Promise<FacebookData> {
  const html = await fetchHTML(facebookUrl);
  if (!html) return {};

  const $ = cheerio.load(html);
  const data: FacebookData = {};

  // Method 1: Look for rating in meta tags
  $('meta').each((_, el) => {
    const property = $(el).attr('property') || '';
    const content = $(el).attr('content') || '';
    
    if (property === 'og:rating' || property === 'al:android:app_name') {
      const ratingMatch = content.match(/(\d+\.?\d*)/);
      if (ratingMatch && !data.rating) {
        const rating = parseFloat(ratingMatch[1]);
        if (rating >= 0 && rating <= 5) {
          data.rating = rating;
        }
      }
    }
  });

  // Method 2: Look for rating in text content
  const text = $('body').text();
  
  // Pattern: "4.5 out of 5 stars" or "4.5/5" or "4.5 rating"
  const ratingPatterns = [
    /(\d+\.?\d*)\s*out\s*of\s*5/i,
    /rating[:\s]*(\d+\.?\d*)[\s\/]*5/i,
    /(\d+\.?\d*)\s*\/\s*5/i,
    /(\d+\.?\d*)\s*stars?/i
  ];

  for (const pattern of ratingPatterns) {
    if (!data.rating) {
      const match = text.match(pattern);
      if (match) {
        const rating = parseFloat(match[1]);
        if (rating >= 0 && rating <= 5) {
          data.rating = rating;
          break;
        }
      }
    }
  }

  // Method 3: Look for review count
  const reviewPatterns = [
    /(\d+(?:,\d+)*)\s*reviews?/i,
    /(\d+(?:,\d+)*)\s*ratings?/i,
    /based\s*on\s*(\d+(?:,\d+)*)/i,
    /(\d+(?:,\d+)*)\s*people\s*rated/i
  ];

  for (const pattern of reviewPatterns) {
    if (!data.reviews) {
      const match = text.match(pattern);
      if (match) {
        const reviews = parseInt(match[1].replace(/,/g, ''), 10);
        if (reviews > 0 && reviews < 10000000) { // Sanity check
          data.reviews = reviews;
          data.votes = reviews; // votes = reviews for Facebook
          break;
        }
      }
    }
  }

  // Method 4: Look in structured data
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const jsonText = $(el).html() || '';
      const json = JSON.parse(jsonText);
      
      if (json.aggregateRating) {
        if (!data.rating && json.aggregateRating.ratingValue) {
          data.rating = parseFloat(json.aggregateRating.ratingValue);
        }
        if (!data.reviews && json.aggregateRating.reviewCount) {
          data.reviews = parseInt(json.aggregateRating.reviewCount, 10);
          data.votes = data.reviews;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });

  return data;
}

async function main() {
  console.log('📘 FACEBOOK DATA ENRICHMENT\n');
  console.log('Finding rating and review counts from Facebook pages...\n');

  const locations = await prisma.location.findMany({
    where: {
      facebook: { not: null },
      OR: [
        { facebookRating: null },
        { facebookReviews: null },
        { facebookVotes: null }
      ]
    },
    select: {
      id: true,
      name: true,
      city: true,
      facebook: true,
      facebookRating: true,
      facebookReviews: true,
      facebookVotes: true
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${locations.length} locations with Facebook pages to enrich\n`);

  if (locations.length === 0) {
    console.log('✅ No locations need Facebook data enrichment!');
    return;
  }

  let successCount = 0;
  let failCount = 0;
  let partialCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;

    console.log(`${progress} ${loc.name} (${loc.city})`);
    console.log(`   🔗 ${loc.facebook}`);

    const fbData = await extractFacebookData(loc.facebook!);

    const updateData: any = {};
    const found: string[] = [];

    if (fbData.rating && !loc.facebookRating) {
      updateData.facebookRating = fbData.rating;
      found.push(`Rating: ${fbData.rating}/5`);
    } else if (loc.facebookRating) {
      found.push(`Rating: ${loc.facebookRating}/5 (existing)`);
    }

    if (fbData.reviews && !loc.facebookReviews) {
      updateData.facebookReviews = fbData.reviews;
      updateData.facebookVotes = fbData.reviews; // votes = reviews for Facebook
      found.push(`Reviews: ${fbData.reviews.toLocaleString()}`);
    } else if (loc.facebookReviews) {
      found.push(`Reviews: ${loc.facebookReviews.toLocaleString()} (existing)`);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      console.log(`   ✅ Found: ${found.join(', ')}`);
      
      if (fbData.rating && fbData.reviews) {
        successCount++;
      } else {
        partialCount++;
      }
    } else if (found.length > 0) {
      console.log(`   ℹ️  ${found.join(', ')}`);
    } else {
      console.log(`   ❌ No Facebook data found`);
      failCount++;
    }

    // Rate limiting - be gentle with Facebook
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Facebook data enrichment complete!');
  console.log(`   Full success (rating + reviews): ${successCount}/${locations.length}`);
  console.log(`   Partial (rating or reviews): ${partialCount}/${locations.length}`);
  console.log(`   Failed: ${failCount}/${locations.length}`);

  // Show coverage
  const totalWithFbRating = await prisma.location.count({
    where: { facebookRating: { not: null } }
  });
  const totalWithFbReviews = await prisma.location.count({
    where: { facebookReviews: { not: null } }
  });
  const totalWithFacebook = await prisma.location.count({
    where: { facebook: { not: null } }
  });

  console.log('\n📊 Overall Facebook Coverage:');
  console.log(`   Facebook Links: ${totalWithFacebook}/2626`);
  console.log(`   Facebook Ratings: ${totalWithFbRating}/${totalWithFacebook} (${(totalWithFbRating/totalWithFacebook*100).toFixed(1)}%)`);
  console.log(`   Facebook Reviews: ${totalWithFbReviews}/${totalWithFacebook} (${(totalWithFbReviews/totalWithFacebook*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

