// Analyze structure of major UK shopping centre websites
import * as cheerio from 'cheerio';

interface SiteAnalysis {
  name: string;
  url: string;
  parkingLinks: string[];
  socialLinks: { platform: string; url: string }[];
  navStructure: string[];
  hasParkingOnHomepage: boolean;
  hasSocialInFooter: boolean;
  hasSocialInHeader: boolean;
  hasJsonLd: boolean;
}

const MAJOR_SITES = [
  { name: 'Westfield London', url: 'https://www.westfield.com/london' },
  { name: 'Westfield Stratford', url: 'https://www.westfield.com/stratfordcity' },
  { name: 'Bluewater', url: 'https://www.bluewater.co.uk' },
  { name: 'Trafford Centre', url: 'https://www.traffordcentre.co.uk' },
  { name: 'Metrocentre', url: 'https://www.themetrocentre.co.uk' },
  { name: 'Meadowhall', url: 'https://www.meadowhall.co.uk' },
  { name: 'Lakeside', url: 'https://www.lakeside-shopping.com' },
  { name: 'Bullring', url: 'https://www.bullring.co.uk' },
  { name: 'Manchester Arndale', url: 'https://www.manchesterarndale.com' },
  { name: 'Liverpool ONE', url: 'https://www.liverpool-one.com' },
  { name: 'Cabot Circus', url: 'https://www.cabotcircus.co.uk' },
  { name: 'Cribbs Causeway', url: 'https://www.mallcribbs.com' },
  { name: 'St Davids Cardiff', url: 'https://www.stdavidscardiff.com' },
  { name: 'St James Quarter', url: 'https://www.stjamesquarter.com' },
  { name: 'Brent Cross', url: 'https://www.brentcross.co.uk' },
  { name: 'centre:mk', url: 'https://www.centremk.com' },
  { name: 'Westquay', url: 'https://www.westquay.co.uk' },
  { name: 'Eldon Square', url: 'https://www.eldonsquare.co.uk' },
  { name: 'Braehead', url: 'https://www.braehead.co.uk' },
  { name: 'Merry Hill', url: 'https://www.mymerryhill.co.uk' }
];

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function analyzeSite(html: string, baseUrl: string): Omit<SiteAnalysis, 'name' | 'url'> {
  const $ = cheerio.load(html);
  
  // Find parking-related links
  const parkingLinks: string[] = [];
  $('a').each((_, elem) => {
    const href = $(elem).attr('href');
    const text = $(elem).text().toLowerCase();
    
    if (!href) return;
    
    const parkingKeywords = ['parking', 'car-park', 'getting-here', 'getting here', 'visit', 'plan-your-visit', 'directions'];
    if (parkingKeywords.some(kw => href.toLowerCase().includes(kw) || text.includes(kw))) {
      try {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        if (fullUrl.startsWith(baseUrl.split('/').slice(0, 3).join('/')) && !parkingLinks.includes(fullUrl)) {
          parkingLinks.push(fullUrl);
        }
      } catch {}
    }
  });
  
  // Find social links
  const socialLinks: { platform: string; url: string }[] = [];
  const socialPatterns = [
    { platform: 'Instagram', pattern: /instagram\.com/i },
    { platform: 'Facebook', pattern: /facebook\.com/i },
    { platform: 'YouTube', pattern: /youtube\.com/i },
    { platform: 'TikTok', pattern: /tiktok\.com/i },
    { platform: 'Twitter/X', pattern: /(twitter\.com|x\.com)/i }
  ];
  
  $('a').each((_, elem) => {
    const href = $(elem).attr('href');
    if (!href) return;
    
    for (const { platform, pattern } of socialPatterns) {
      if (pattern.test(href) && !socialLinks.some(s => s.platform === platform)) {
        socialLinks.push({ platform, url: href });
      }
    }
  });
  
  // Check nav structure
  const navStructure: string[] = [];
  $('nav a, header a').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text && text.length < 50) {
      navStructure.push(text);
    }
  });
  
  // Check if parking info on homepage
  const bodyText = $('body').text().toLowerCase();
  const hasParkingOnHomepage = /\d{2,5}\s*(?:parking\s*)?spaces?/.test(bodyText);
  
  // Check social in footer/header
  const footerHtml = $('footer').html() || '';
  const headerHtml = $('header').html() || '';
  const hasSocialInFooter = socialPatterns.some(s => s.pattern.test(footerHtml));
  const hasSocialInHeader = socialPatterns.some(s => s.pattern.test(headerHtml));
  
  // Check for JSON-LD
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
  
  return {
    parkingLinks: parkingLinks.slice(0, 5),
    socialLinks,
    navStructure: [...new Set(navStructure)].slice(0, 10),
    hasParkingOnHomepage,
    hasSocialInFooter,
    hasSocialInHeader,
    hasJsonLd
  };
}

async function main() {
  console.log('🔍 Analyzing 20 Major UK Shopping Centre Websites\n');
  console.log('=' .repeat(80) + '\n');
  
  const results: SiteAnalysis[] = [];
  
  for (let i = 0; i < MAJOR_SITES.length; i++) {
    const site = MAJOR_SITES[i];
    console.log(`[${i + 1}/20] ${site.name}`);
    console.log(`        URL: ${site.url}`);
    
    const html = await fetchHTML(site.url);
    
    if (!html) {
      console.log(`        ❌ Failed to fetch\n`);
      continue;
    }
    
    const analysis = analyzeSite(html, site.url);
    results.push({ name: site.name, url: site.url, ...analysis });
    
    console.log(`        🅿️  Parking links found: ${analysis.parkingLinks.length}`);
    if (analysis.parkingLinks.length > 0) {
      analysis.parkingLinks.forEach(link => {
        const path = link.replace(site.url, '');
        console.log(`           → ${path || '/'}`);
      });
    }
    
    console.log(`        📱 Social links: ${analysis.socialLinks.map(s => s.platform).join(', ') || 'None'}`);
    console.log(`        🏠 Parking on homepage: ${analysis.hasParkingOnHomepage ? 'Yes' : 'No'}`);
    console.log(`        📊 JSON-LD: ${analysis.hasJsonLd ? 'Yes' : 'No'}`);
    console.log('');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS\n');
  
  const totalSites = results.length;
  
  console.log(`Sites analyzed: ${totalSites}/20\n`);
  
  console.log('🅿️  PARKING PATTERNS:');
  console.log(`   - Sites with parking links: ${results.filter(r => r.parkingLinks.length > 0).length}/${totalSites}`);
  console.log(`   - Parking info on homepage: ${results.filter(r => r.hasParkingOnHomepage).length}/${totalSites}`);
  console.log(`   - Average parking links per site: ${(results.reduce((sum, r) => sum + r.parkingLinks.length, 0) / totalSites).toFixed(1)}`);
  
  // Most common parking URL patterns
  const allParkingLinks = results.flatMap(r => r.parkingLinks);
  const parkingPatterns = new Map<string, number>();
  allParkingLinks.forEach(link => {
    const path = new URL(link).pathname.split('/')[1] || 'root';
    parkingPatterns.set(path, (parkingPatterns.get(path) || 0) + 1);
  });
  const topParkingPaths = [...parkingPatterns.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('\n   Top parking URL patterns:');
  topParkingPaths.forEach(([path, count]) => {
    console.log(`      /${path}: ${count} sites`);
  });
  
  console.log('\n📱 SOCIAL MEDIA PATTERNS:');
  const socialCounts = {
    Instagram: results.filter(r => r.socialLinks.some(s => s.platform === 'Instagram')).length,
    Facebook: results.filter(r => r.socialLinks.some(s => s.platform === 'Facebook')).length,
    TikTok: results.filter(r => r.socialLinks.some(s => s.platform === 'TikTok')).length,
    YouTube: results.filter(r => r.socialLinks.some(s => s.platform === 'YouTube')).length,
    'Twitter/X': results.filter(r => r.socialLinks.some(s => s.platform === 'Twitter/X')).length,
  };
  
  Object.entries(socialCounts).forEach(([platform, count]) => {
    console.log(`   ${platform}: ${count}/${totalSites} (${((count/totalSites)*100).toFixed(0)}%)`);
  });
  
  console.log(`\n   Social in footer: ${results.filter(r => r.hasSocialInFooter).length}/${totalSites}`);
  console.log(`   Social in header: ${results.filter(r => r.hasSocialInHeader).length}/${totalSites}`);
  console.log(`   Has JSON-LD: ${results.filter(r => r.hasJsonLd).length}/${totalSites}`);
  
  console.log('\n🗺️  NAVIGATION PATTERNS:');
  const allNav = results.flatMap(r => r.navStructure);
  const navCounts = new Map<string, number>();
  allNav.forEach(item => {
    const normalized = item.toLowerCase().trim();
    if (normalized.length > 2) {
      navCounts.set(normalized, (navCounts.get(normalized) || 0) + 1);
    }
  });
  const topNav = [...navCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('   Most common nav items:');
  topNav.forEach(([item, count]) => {
    console.log(`      "${item}": ${count} sites`);
  });
  
  console.log('\n' + '='.repeat(80));
}

main().catch(console.error);
