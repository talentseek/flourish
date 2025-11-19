#!/usr/bin/env tsx
/**
 * 📱 SOCIAL MEDIA DEEP SCRAPE
 * Enhanced detection for YouTube, TikTok, Twitter with multiple methods
 */

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

function extractSocialLinksDeep(html: string): SocialLinks {
  const $ = cheerio.load(html);
  const links: SocialLinks = {};
  const rawHTML = $.html();
  
  // Strategy 1: Check footer first
  const footerLinks = extractFromHTML($, $('footer'));
  Object.assign(links, footerLinks);
  
  // Strategy 2: Check full page
  const bodyLinks = extractFromHTML($, $('body'));
  Object.keys(bodyLinks).forEach(key => {
    if (!links[key as keyof SocialLinks]) {
      links[key as keyof SocialLinks] = bodyLinks[key as keyof SocialLinks];
    }
  });
  
  // Strategy 3: Check for YouTube embeds
  if (!links.youtube) {
    $('iframe[src*="youtube.com"], iframe[src*="youtu.be"]').each((_, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        const match = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (match) {
          // Try to extract channel from embed
          const channelMatch = rawHTML.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i);
          if (channelMatch) {
            links.youtube = `https://youtube.com/channel/${channelMatch[1]}`;
          } else {
            const userMatch = rawHTML.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/i);
            if (userMatch) {
              links.youtube = `https://youtube.com/user/${userMatch[1]}`;
            }
          }
        }
      }
    });
  }
  
  // Strategy 4: Check for TikTok embeds
  if (!links.tiktok) {
    $('blockquote[data-tiktok]').each((_, elem) => {
      const dataTiktok = $(elem).attr('data-tiktok');
      if (dataTiktok) {
        const match = dataTiktok.match(/@([a-zA-Z0-9_.-]+)/);
        if (match) {
          links.tiktok = `https://tiktok.com/@${match[1]}`;
        }
      }
    });
    
    // Also check for TikTok video links
    $('a[href*="tiktok.com"]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && !links.tiktok) {
        const match = href.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
        if (match) {
          links.tiktok = `https://tiktok.com/@${match[1]}`;
        }
      }
    });
  }
  
  // Strategy 5: Enhanced Twitter/X detection
  if (!links.twitter) {
    // Check for Twitter widgets
    $('a[class*="twitter"], a[class*="x-"]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && (href.includes('twitter.com') || href.includes('x.com'))) {
        links.twitter = cleanSocialUrl(href, 'twitter');
      }
    });
    
    // Check for Twitter share buttons
    $('a[href*="twitter.com/intent"], a[href*="x.com/intent"]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const urlMatch = href.match(/url=([^&]+)/);
        if (urlMatch) {
          const decoded = decodeURIComponent(urlMatch[1]);
          if (decoded.includes('twitter.com') || decoded.includes('x.com')) {
            links.twitter = cleanSocialUrl(decoded, 'twitter');
          }
        }
      }
    });
  }
  
  // Strategy 6: Check page source for social media URLs (not just rendered)
  if (!links.youtube) {
    const youtubeMatches = rawHTML.match(/youtube\.com\/(?:channel|user|c|@)\/([a-zA-Z0-9_.-]+)/gi);
    if (youtubeMatches && youtubeMatches.length > 0) {
      const match = youtubeMatches[0].match(/youtube\.com\/(?:channel|user|c|@)\/([a-zA-Z0-9_.-]+)/i);
      if (match) {
        links.youtube = `https://youtube.com/${match[0].split('/').slice(-2).join('/')}`;
      }
    }
  }
  
  if (!links.tiktok) {
    const tiktokMatches = rawHTML.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/gi);
    if (tiktokMatches && tiktokMatches.length > 0) {
      const match = tiktokMatches[0].match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
      if (match) {
        links.tiktok = `https://tiktok.com/@${match[1]}`;
      }
    }
  }
  
  if (!links.twitter) {
    const twitterMatches = rawHTML.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi);
    if (twitterMatches && twitterMatches.length > 0) {
      // Filter out common non-profile URLs
      const filtered = twitterMatches.filter(m => 
        !m.includes('/status/') && 
        !m.includes('/intent/') &&
        !m.includes('/hashtag/')
      );
      if (filtered.length > 0) {
        const match = filtered[0].match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
        if (match) {
          links.twitter = `https://twitter.com/${match[1]}`;
        }
      }
    }
  }
  
  return links;
}

function extractFromHTML($: cheerio.Root, context: cheerio.Cheerio): SocialLinks {
  const links: SocialLinks = {};
  
  // Standard <a href> links
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
  
  // JSON-LD structured data
  $('script[type="application/ld+json"]', context).each((_, elem) => {
    try {
      const jsonText = $(elem).html();
      if (!jsonText) return;
      
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
        // Try to extract channel from video URL
        return '';
      }
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'tiktok') {
      cleaned = cleaned.replace(/\/video\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    } else if (platform === 'twitter') {
      cleaned = cleaned.replace(/\/status\/.*$/, '');
      cleaned = cleaned.replace(/\/+$/, '');
    }
    
    return cleaned;
  } catch {
    return url;
  }
}

async function main() {
  console.log('📱 SOCIAL MEDIA DEEP SCRAPE\n');
  console.log('Enhanced detection for YouTube, TikTok, Twitter...\n');
  
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null },
      type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] },
      OR: [
        { youtube: null },
        { tiktok: null },
        { twitter: null },
        { instagram: null },
        { facebook: null }
      ]
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
    orderBy: { numberOfStores: 'desc' }
  });
  
  console.log(`📊 Found ${locations.length} locations to process\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  const enrichmentResults = {
    instagram: 0,
    facebook: 0,
    youtube: 0,
    tiktok: 0,
    twitter: 0
  };
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;
    
    console.log(`${progress} ${loc.name} (${loc.city})`);
    
    const html = await fetchHTML(loc.website!);
    
    if (!html) {
      console.log(`      ❌ Failed to fetch website`);
      failCount++;
      continue;
    }
    
    const socialLinks = extractSocialLinksDeep(html);
    
    const updateData: Partial<SocialLinks> = {};
    const found: string[] = [];
    const newLinks: string[] = [];
    
    if (socialLinks.instagram && !loc.instagram) {
      updateData.instagram = socialLinks.instagram;
      found.push('Instagram');
      newLinks.push('Instagram');
      enrichmentResults.instagram++;
    }
    
    if (socialLinks.facebook && !loc.facebook) {
      updateData.facebook = socialLinks.facebook;
      found.push('Facebook');
      newLinks.push('Facebook');
      enrichmentResults.facebook++;
    }
    
    if (socialLinks.youtube && !loc.youtube) {
      updateData.youtube = socialLinks.youtube;
      found.push('YouTube');
      newLinks.push('YouTube');
      enrichmentResults.youtube++;
    }
    
    if (socialLinks.tiktok && !loc.tiktok) {
      updateData.tiktok = socialLinks.tiktok;
      found.push('TikTok');
      newLinks.push('TikTok');
      enrichmentResults.tiktok++;
    }
    
    if (socialLinks.twitter && !loc.twitter) {
      updateData.twitter = socialLinks.twitter;
      found.push('Twitter');
      newLinks.push('Twitter');
      enrichmentResults.twitter++;
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
      console.log(`      ❌ No new social media links found`);
      failCount++;
    }
    
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    if ((i + 1) % 25 === 0) {
      console.log(`\n📈 Progress: ${successCount} with links, ${failCount} none found\n`);
    }
  }
  
  console.log('\n✅ Social media deep scrape complete!');
  console.log(`   At least one link: ${successCount}/${locations.length} (${(successCount/locations.length*100).toFixed(1)}%)`);
  console.log(`   No links found: ${failCount}/${locations.length}`);
  
  console.log(`\n📝 New links found:`);
  console.log(`   Instagram: ${enrichmentResults.instagram}`);
  console.log(`   Facebook: ${enrichmentResults.facebook}`);
  console.log(`   YouTube: ${enrichmentResults.youtube}`);
  console.log(`   TikTok: ${enrichmentResults.tiktok}`);
  console.log(`   Twitter: ${enrichmentResults.twitter}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

