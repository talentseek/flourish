// V3: Enhanced social media scraper with modern icon detection
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
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
  
  // Strategy 1: Check footer first (84% of sites use footer)
  const footerHtml = $('footer').html() || '';
  if (footerHtml) {
    const footerLinks = extractFromHTML($, $('footer'));
    Object.assign(links, footerLinks);
  }
  
  // Strategy 2: Check full page if not all found
  if (Object.keys(links).length < 4) {
    const bodyLinks = extractFromHTML($, $('body'));
    // Merge, but don't overwrite footer finds
    Object.keys(bodyLinks).forEach(key => {
      if (!links[key as keyof SocialLinks]) {
        links[key as keyof SocialLinks] = bodyLinks[key as keyof SocialLinks];
      }
    });
  }
  
  return links;
}

function extractFromHTML($: cheerio.Root, context: cheerio.Cheerio): SocialLinks {
  const links: SocialLinks = {};
  
  // Method 1: Standard <a href> links
  context.find('a').each((_, elem) => {
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
    if (!links.twitter && (url.includes('twitter.com') || url.includes('x.com'))) {
      links.twitter = cleanSocialUrl(href, 'twitter');
    }
  });
  
  // Method 2: aria-label on links (Brent Cross pattern)
  context.find('a[aria-label]').each((_, elem) => {
    const ariaLabel = $(elem).attr('aria-label')?.toLowerCase() || '';
    const href = $(elem).attr('href');
    
    if (!href) return;
    
    if (!links.instagram && ariaLabel.includes('instagram')) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    if (!links.facebook && ariaLabel.includes('facebook')) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
    if (!links.youtube && ariaLabel.includes('youtube')) {
      links.youtube = cleanSocialUrl(href, 'youtube');
    }
    if (!links.tiktok && ariaLabel.includes('tiktok')) {
      links.tiktok = cleanSocialUrl(href, 'tiktok');
    }
    if (!links.twitter && (ariaLabel.includes('twitter') || ariaLabel.includes('x.com'))) {
      links.twitter = cleanSocialUrl(href, 'twitter');
    }
  });
  
  // Method 3: img alt text (Bluewater pattern)
  context.find('img[alt]').each((_, elem) => {
    const alt = $(elem).attr('alt')?.toLowerCase() || '';
    const parent = $(elem).parent();
    const href = parent.is('a') ? parent.attr('href') : null;
    
    if (!href) return;
    
    if (!links.instagram && alt.includes('instagram')) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    if (!links.facebook && alt.includes('facebook')) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
    if (!links.youtube && alt.includes('youtube')) {
      links.youtube = cleanSocialUrl(href, 'youtube');
    }
    if (!links.tiktok && alt.includes('tiktok')) {
      links.tiktok = cleanSocialUrl(href, 'tiktok');
    }
    if (!links.twitter && (alt.includes('twitter') || alt.includes('x.com'))) {
      links.twitter = cleanSocialUrl(href, 'twitter');
    }
  });
  
  // Method 4: CSS custom properties (Westfield pattern)
  context.find('[style*="icon-url"]').each((_, elem) => {
    const style = $(elem).attr('style') || '';
    const parent = $(elem).parent();
    const href = parent.is('a') ? parent.attr('href') : $(elem).closest('a').attr('href');
    
    if (!href) return;
    
    if (!links.instagram && style.includes('instagram')) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    if (!links.facebook && style.includes('facebook')) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
    if (!links.youtube && style.includes('youtube')) {
      links.youtube = cleanSocialUrl(href, 'youtube');
    }
    if (!links.tiktok && style.includes('tiktok')) {
      links.tiktok = cleanSocialUrl(href, 'tiktok');
    }
    if (!links.twitter && (style.includes('twitter') || style.includes('x.com'))) {
      links.twitter = cleanSocialUrl(href, 'twitter');
    }
  });
  
  // Method 5: SVG with viewBox patterns (common social icons)
  context.find('a svg').each((_, elem) => {
    const parent = $(elem).closest('a');
    const href = parent.attr('href');
    
    if (!href) return;
    
    // Check SVG paths for social media patterns
    const svgHtml = $(elem).html() || '';
    
    // Instagram: rounded square with circle
    if (!links.instagram && (svgHtml.includes('M224.1 141') || href.includes('instagram'))) {
      links.instagram = cleanSocialUrl(href, 'instagram');
    }
    // Facebook: f in square
    if (!links.facebook && (svgHtml.includes('M279.14 288') || href.includes('facebook'))) {
      links.facebook = cleanSocialUrl(href, 'facebook');
    }
    // TikTok: musical note
    if (!links.tiktok && (svgHtml.includes('M448,209.91') || href.includes('tiktok'))) {
      links.tiktok = cleanSocialUrl(href, 'tiktok');
    }
    // YouTube: play button
    if (!links.youtube && (svgHtml.includes('youtube') || href.includes('youtube'))) {
      links.youtube = cleanSocialUrl(href, 'youtube');
    }
    // Twitter/X: bird icon
    if (!links.twitter && (svgHtml.includes('twitter') || href.includes('twitter') || href.includes('x.com'))) {
      links.twitter = cleanSocialUrl(href, 'twitter');
    }
  });
  
  // Method 6: Meta tags (Open Graph, Twitter Cards)
  $('meta[property^="og:"], meta[name^="twitter:"]', context).each((_, elem) => {
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
    if (property.includes('twitter') || property.includes('x.com')) {
      if (!links.twitter && (content.includes('twitter.com') || content.includes('x.com'))) {
        links.twitter = cleanSocialUrl(content, 'twitter');
      }
    }
  });
  
  // Method 7: JSON-LD structured data
  $('script[type="application/ld+json"]', context).each((_, elem) => {
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
        if (!links.twitter && (url.includes('twitter.com') || url.includes('x.com'))) {
          links.twitter = cleanSocialUrl(url, 'twitter');
        }
      }
    } catch {}
  });
  
  // Method 8: Raw HTML search (last resort)
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
    
    if (!links.twitter) {
      const twMatch = rawHTML.match(/https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/i);
      if (twMatch) links.twitter = cleanSocialUrl(twMatch[0], 'twitter');
    }
  }
  
  return links;
}

function cleanSocialUrl(url: string, platform: string): string {
  try {
    let cleaned = url.split('?')[0].split('#')[0];
    
    if (!cleaned.startsWith('http')) {
      cleaned = 'https://' + cleaned.replace(/^\/\//, '');
    }
    
    if (platform === 'instagram') {
      cleaned = cleaned.replace(/\/(p|reel|tv)\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'facebook') {
      cleaned = cleaned.replace(/\/posts\/.*$/, '');
      cleaned = cleaned.replace(/\/photos\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'youtube') {
      if (cleaned.includes('/watch?') || cleaned.includes('/shorts/')) {
        return '';
      }
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'tiktok') {
      cleaned = cleaned.replace(/\/video\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'twitter') {
      // Normalize x.com to twitter.com for consistency (optional)
      // cleaned = cleaned.replace('x.com', 'twitter.com');
      cleaned = cleaned.replace(/\/status\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    }
    
    return cleaned;
  } catch {
    return url;
  }
}

async function main() {
  console.log('📱 V3: Enhanced social media enrichment with modern icon detection\n');

  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      OR: [
        { instagram: null },
        { facebook: null },
        { youtube: null },
        { tiktok: null },
        { twitter: null }
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
      tiktok: true,
      twitter: true
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${locations.length} locations to process\n`);

  let successCount = 0;
  let failCount = 0;
  
  const results: Array<{ 
    name: string; 
    found: string[];
    new: string[];
  }> = [];

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);

    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`      ❌ Failed to fetch website`);
      failCount++;
      results.push({ name: loc.name, found: [], new: [] });
      continue;
    }

    const socialLinks = extractSocialLinks(html);
    
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
    
    if (socialLinks.twitter && !loc.twitter) {
      updateData.twitter = socialLinks.twitter;
      found.push('Twitter');
      newLinks.push('Twitter');
    } else if (loc.twitter) {
      found.push('Twitter (existing)');
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.location.update({
        where: { id: loc.id },
        data: updateData
      });
    }
    
    if (found.length > 0) {
      successCount++;
      console.log(`      ✅ Found: ${found.join(', ')}`);
      if (newLinks.length > 0) {
        console.log(`      🆕 New: ${newLinks.join(', ')}`);
      }
    } else {
      console.log(`      ❌ No social media links found`);
      failCount++;
    }
    
    results.push({ name: loc.name, found, new: newLinks });

    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    if ((i + 1) % 5 === 0) {
      console.log(`\n📈 Progress: ${successCount} with links, ${failCount} none found\n`);
    }
  }

  console.log('\n✅ Social media enrichment complete!');
  console.log(`   At least one link: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   No links found: ${failCount}/${locations.length}`);
  
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

