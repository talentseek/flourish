// Extract social media links (Instagram, Facebook, TikTok, YouTube) from location websites
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface SocialMediaResult {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  found: number;
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    return null;
  }
}

function extractSocialMediaLinks(html: string): SocialMediaResult {
  const $ = cheerio.load(html);
  const result: SocialMediaResult = { found: 0 };
  
  // Find all links
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    
    const url = href.toLowerCase();
    
    // Instagram
    if (!result.instagram && (url.includes('instagram.com/') || url.includes('instagr.am/'))) {
      // Extract clean Instagram URL
      const match = href.match(/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([^/?#&]+)/i);
      if (match && !match[1].includes('share') && !match[1].includes('p/')) {
        result.instagram = `https://www.instagram.com/${match[1]}`;
        result.found++;
      }
    }
    
    // Facebook
    if (!result.facebook && url.includes('facebook.com/')) {
      // Extract clean Facebook URL
      const match = href.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?#&]+)/i);
      if (match && !match[1].includes('sharer') && !match[1].includes('share.php')) {
        result.facebook = `https://www.facebook.com/${match[1]}`;
        result.found++;
      }
    }
    
    // YouTube
    if (!result.youtube && (url.includes('youtube.com/') || url.includes('youtu.be/'))) {
      // Extract clean YouTube channel/user URL
      const channelMatch = href.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/((?:c|channel|user|@)[^/?#&]+)/i);
      if (channelMatch) {
        result.youtube = `https://www.youtube.com/${channelMatch[1]}`;
        result.found++;
      }
    }
    
    // TikTok
    if (!result.tiktok && url.includes('tiktok.com/')) {
      // Extract clean TikTok URL
      const match = href.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/?#&]+)/i);
      if (match) {
        result.tiktok = `https://www.tiktok.com/@${match[1]}`;
        result.found++;
      }
    }
  });
  
  return result;
}

async function main() {
  console.log('📱 Enriching social media links from websites\n');

  // Get locations with websites but missing social media data
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { instagram: null },
        { facebook: null },
        { youtube: null },
        { tiktok: null }
      ],
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] }
    },
    select: { 
      id: true, 
      name: true, 
      city: true, 
      website: true,
      instagram: true,
      facebook: true,
      youtube: true,
      tiktok: true
    },
    orderBy: { name: 'asc' },
    take: 20 // TEST WITH 20 FIRST
  });

  console.log(`📊 Found ${locations.length} locations to process\n`);

  let successCount = 0;
  let partialCount = 0;
  let failCount = 0;
  const summary: Array<{ name: string; found: string[] }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name}`);

    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`      ❌ Failed to fetch website`);
      failCount++;
      continue;
    }

    const result = extractSocialMediaLinks(html);
    
    // Only update fields that are currently null
    const updateData: any = {};
    if (!loc.instagram && result.instagram) updateData.instagram = result.instagram;
    if (!loc.facebook && result.facebook) updateData.facebook = result.facebook;
    if (!loc.youtube && result.youtube) updateData.youtube = result.youtube;
    if (!loc.tiktok && result.tiktok) updateData.tiktok = result.tiktok;

    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
      
      const foundPlatforms = Object.keys(updateData);
      if (foundPlatforms.length === 4) {
        console.log(`      ✅ Found all 4 platforms!`);
        successCount++;
      } else {
        console.log(`      ✅ Found ${foundPlatforms.length} platform(s): ${foundPlatforms.join(', ')}`);
        partialCount++;
      }
      
      foundPlatforms.forEach(platform => {
        console.log(`         ${platform}: ${updateData[platform]}`);
      });
      
      summary.push({ name: loc.name, found: foundPlatforms });
    } else {
      console.log(`      ❌ No new social media links found`);
      failCount++;
    }

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Progress update every 20 locations
    if ((i + 1) % 20 === 0) {
      console.log(`\n📈 Progress: ${successCount} complete, ${partialCount} partial, ${failCount} none\n`);
    }
  }

  console.log('\n✅ Social media enrichment complete!');
  console.log(`   Full success (4/4): ${successCount}/${locations.length}`);
  console.log(`   Partial (1-3/4): ${partialCount}/${locations.length}`);
  console.log(`   None found: ${failCount}/${locations.length}`);
  console.log(`   Total enriched: ${successCount + partialCount}/${locations.length} (${((successCount + partialCount)/locations.length*100).toFixed(1)}%)`);
  
  // Show breakdown by platform
  const instagramCount = summary.filter(s => s.found.includes('instagram')).length;
  const facebookCount = summary.filter(s => s.found.includes('facebook')).length;
  const youtubeCount = summary.filter(s => s.found.includes('youtube')).length;
  const tiktokCount = summary.filter(s => s.found.includes('tiktok')).length;
  
  console.log('\n📊 Platform breakdown:');
  console.log(`   Instagram: ${instagramCount} locations`);
  console.log(`   Facebook: ${facebookCount} locations`);
  console.log(`   YouTube: ${youtubeCount} locations`);
  console.log(`   TikTok: ${tiktokCount} locations`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

