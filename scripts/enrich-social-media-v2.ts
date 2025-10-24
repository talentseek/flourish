// Enhanced social media scraper with better detection
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
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
  } catch {
    return null;
  }
}

function extractSocialLinks(html: string): SocialLinks {
  const $ = cheerio.load(html);
  const links: SocialLinks = {};
  
  // 1. Check <a href> tags (most common)
  $('a').each((_, elem) => {
    const href = $(elem).attr('href');
    if (!href) return;
    
    const url = href.toLowerCase();
    
    if (!links.instagram && (url.includes('instagram.com') || url.includes('instagr.am'))) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    if (!links.facebook && (url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.me'))) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
    if (!links.youtube && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      links.youtube = cleanSocialUrl(href, 'youtube');
    }
    if (!links.tiktok && url.includes('tiktok.com')) {
      links.tiktok = cleanSocialUrl(href, 'tiktok');
    }
  });
  
  // 2. Check meta tags (Open Graph, Twitter Cards)
  $('meta[property^="og:"], meta[name^="twitter:"]').each((_, elem) => {
    const property = $(elem).attr('property') || $(elem).attr('name') || '';
    const content = $(elem).attr('content');
    
    if (!content) return;
    
    if (property.includes('social') || property.includes('instagram')) {
      if (!links.instagram && content.includes('instagram.com')) {
        links.instagram = cleanSocialUrl(content, 'instagram');
      }
    }
    if (property.includes('facebook')) {
      if (!links.facebook && content.includes('facebook.com')) {
        links.facebook = cleanSocialUrl(content, 'facebook');
      }
    }
  });
  
  // 3. Check link rel tags
  $('link[rel]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (!href) return;
    
    const url = href.toLowerCase();
    
    if (!links.instagram && url.includes('instagram.com')) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    if (!links.facebook && url.includes('facebook.com')) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
  });
  
  // 4. Search in script tags for social URLs (sometimes in JSON-LD or config)
  $('script[type="application/ld+json"]').each((_, elem) => {
    const jsonText = $(elem).html();
    if (!jsonText) return;
    
    try {
      const data = JSON.parse(jsonText);
      const sameAs = data.sameAs || (data['@graph'] && data['@graph'][0]?.sameAs) || [];
      
      for (const url of sameAs) {
        if (typeof url !== 'string') continue;
        
        if (!links.instagram && url.includes('instagram.com')) {
          links.instagram = cleanSocialUrl(url, 'instagram');
        }
        if (!links.facebook && url.includes('facebook.com')) {
          links.facebook = cleanSocialUrl(url, 'facebook');
        }
        if (!links.youtube && url.includes('youtube.com')) {
          links.youtube = cleanSocialUrl(url, 'youtube');
        }
        if (!links.tiktok && url.includes('tiktok.com')) {
          links.tiktok = cleanSocialUrl(url, 'tiktok');
        }
      }
    } catch {}
  });
  
  // 5. Search raw HTML for social URLs (last resort)
  if (Object.keys(links).length < 4) {
    const rawHTML = $.html();
    
    if (!links.instagram) {
      const igMatch = rawHTML.match(/https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.-]+/i);
      if (igMatch) links.instagram = cleanSocialUrl(igMatch[0], 'instagram');
    }
    
    if (!links.facebook) {
      const fbMatch = rawHTML.match(/https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9_.-]+/i);
      if (fbMatch) links.facebook = cleanSocialUrl(fbMatch[0], 'facebook');
    }
    
    if (!links.youtube) {
      const ytMatch = rawHTML.match(/https?:\/\/(?:www\.)?youtube\.com\/@?[a-zA-Z0-9_.-]+/i);
      if (ytMatch) links.youtube = cleanSocialUrl(ytMatch[0], 'youtube');
    }
    
    if (!links.tiktok) {
      const ttMatch = rawHTML.match(/https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9_.-]+/i);
      if (ttMatch) links.tiktok = cleanSocialUrl(ttMatch[0], 'tiktok');
    }
  }
  
  return links;
}

function cleanSocialUrl(url: string, platform: string): string {
  try {
    // Remove query params and anchors
    let cleaned = url.split('?')[0].split('#')[0];
    
    // Ensure https
    if (!cleaned.startsWith('http')) {
      cleaned = 'https://' + cleaned.replace(/^\/\//, '');
    }
    
    // Platform-specific cleaning
    if (platform === 'instagram') {
      // Keep format: https://instagram.com/username
      cleaned = cleaned.replace(/\/(p|reel|tv)\/.*$/, ''); // Remove post URLs
      cleaned = cleaned.replace(/\/+$/, ''); // Remove trailing slashes
    } else if (platform === 'facebook') {
      // Keep format: https://facebook.com/pagename
      cleaned = cleaned.replace(/\/posts\/.*$/, '');
      cleaned = cleaned.replace(/\/photos\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'youtube') {
      // Keep format: https://youtube.com/@username or /channel/ID
      if (cleaned.includes('/watch?') || cleaned.includes('/shorts/')) {
        // Don't store video URLs, only channel URLs
        return '';
      }
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'tiktok') {
      // Keep format: https://tiktok.com/@username
      cleaned = cleaned.replace(/\/video\/.*$/, ''); // Remove video URLs
      cleaned = cleaned.replace(/\/+$/, '');
    }
    
    return cleaned;
  } catch {
    return url;
  }
}

async function main() {
  console.log('📱 Enhanced social media enrichment with multi-source detection\n');

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

  let successCount = 0; // At least one social link found
  let partialCount = 0; // Some but not all
  let failCount = 0; // None found
  
  const results: Array<{ 
    name: string; 
    found: string[];
    new: string[]; // Newly found (not already in DB)
  }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    console.log(`      URL: ${loc.website}`);

    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`      ❌ Failed to fetch website`);
      failCount++;
      results.push({ name: loc.name, found: [], new: [] });
      continue;
    }

    const socialLinks = extractSocialLinks(html);
    
    // Prepare update data (only update null fields)
    const updateData: Partial<SocialLinks> = {};
    const found: string[] = [];
    const newLinks: string[] = [];
    
    if (socialLinks.instagram && !loc.instagram) {
      updateData.instagram = socialLinks.instagram;
      found.push('Instagram');
      newLinks.push('Instagram');
    } else if (loc.instagram) {
      found.push('Instagram (existing)');
    }
    
    if (socialLinks.facebook && !loc.facebook) {
      updateData.facebook = socialLinks.facebook;
      found.push('Facebook');
      newLinks.push('Facebook');
    } else if (loc.facebook) {
      found.push('Facebook (existing)');
    }
    
    if (socialLinks.youtube && !loc.youtube) {
      updateData.youtube = socialLinks.youtube;
      found.push('YouTube');
      newLinks.push('YouTube');
    } else if (loc.youtube) {
      found.push('YouTube (existing)');
    }
    
    if (socialLinks.tiktok && !loc.tiktok) {
      updateData.tiktok = socialLinks.tiktok;
      found.push('TikTok');
      newLinks.push('TikTok');
    } else if (loc.tiktok) {
      found.push('TikTok (existing)');
    }
    
    // Update database if we found new links
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
    }
    
    // Stats
    if (found.length > 0) {
      successCount++;
      if (found.length < 4) partialCount++;
      
      console.log(`      ✅ Found: ${found.join(', ')}`);
      if (newLinks.length > 0) {
        console.log(`      🆕 New: ${newLinks.join(', ')}`);
      }
    } else {
      console.log(`      ❌ No social media links found`);
      failCount++;
    }
    
    results.push({ name: loc.name, found, new: newLinks });

    // Rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Progress update every 5 locations
    if ((i + 1) % 5 === 0) {
      console.log(`\n📈 Progress: ${successCount} with links, ${failCount} none found\n`);
    }
  }

  console.log('\n✅ Social media enrichment complete!');
  console.log(`   At least one link: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   No links found: ${failCount}/${locations.length}`);
  
  // Summary
  const withNewLinks = results.filter(r => r.new.length > 0);
  if (withNewLinks.length > 0) {
    console.log('\n✨ Successfully enriched:');
    withNewLinks.forEach(r => {
      console.log(`   - ${r.name}: ${r.new.join(', ')}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

