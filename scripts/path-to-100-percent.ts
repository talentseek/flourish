import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EnrichmentTier {
  name: string;
  fields: string[];
  method: 'api' | 'scraping' | 'calculated' | 'manual' | 'paid-data';
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  cost: string;
  timeEstimate: string;
  notes: string;
}

const ENRICHMENT_ROADMAP: EnrichmentTier[] = [
  {
    name: 'Currently Running Scripts',
    fields: ['phone', 'googleRating', 'googleReviews', 'openingHours', 
             'numberOfFloors', 'publicTransit', 'openedYear', 'carParkPrice', 
             'evCharging', 'evChargingSpaces'],
    method: 'api',
    difficulty: 'easy',
    cost: 'Running now ($7.82 for Places API)',
    timeEstimate: '~20 minutes remaining',
    notes: 'Google Places API + website scraping currently in progress'
  },
  {
    name: 'Next Batch - Facebook Data',
    fields: ['facebookRating', 'facebookReviews'],
    method: 'scraping',
    difficulty: 'medium',
    cost: 'FREE (web scraping)',
    timeEstimate: '~2-3 hours',
    notes: 'Scrape Facebook pages for ratings/reviews (requires Facebook Graph API or scraping)'
  },
  {
    name: 'Next Batch - Retail Analytics',
    fields: ['retailers', 'retailSpace'],
    method: 'calculated',
    difficulty: 'easy',
    cost: 'FREE (from tenant data)',
    timeEstimate: '~10 minutes',
    notes: 'Calculate from existing tenant data in database'
  },
  {
    name: 'Advanced Scraping - Anchor Tenants',
    fields: ['anchorTenants'],
    method: 'scraping',
    difficulty: 'hard',
    cost: 'FREE (web scraping)',
    timeEstimate: '~4-6 hours',
    notes: 'Extract anchor tenant info from websites (requires advanced NLP/pattern matching)'
  },
  {
    name: 'Paid Data - Ownership & Footfall',
    fields: ['owner', 'management', 'footfall'],
    method: 'paid-data',
    difficulty: 'very-hard',
    cost: '£££ (CoStar, JLL, or similar)',
    timeEstimate: 'Varies',
    notes: 'Requires paid commercial real estate data subscriptions (CoStar, JLL, Savills)'
  },
  {
    name: 'Census Data - Household Income',
    fields: ['avgHouseholdIncome'],
    method: 'api',
    difficulty: 'medium',
    cost: 'FREE (ONS Census API)',
    timeEstimate: '~30 minutes',
    notes: 'Already have population/demographics, can add income from same ONS source'
  }
];

async function main() {
  console.log('🎯 PATH TO 100% COMPLETION\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get current state
  const totalLocations = await prisma.location.count();
  const scRp = await prisma.location.count({
    where: { type: { in: ['SHOPPING_CENTRE', 'RETAIL_PARK'] } }
  });
  const withWebsites = await prisma.location.count({
    where: { website: { not: null } }
  });

  console.log('📊 Current State:');
  console.log(`   Total Locations: ${totalLocations}`);
  console.log(`   Shopping Centres/Retail Parks: ${scRp}`);
  console.log(`   Locations with Websites: ${withWebsites}\n`);

  // Sample a high-profile location
  const queensgate = await prisma.location.findFirst({
    where: { name: { contains: 'Queensgate', mode: 'insensitive' } }
  });

  if (queensgate) {
    const allFields = Object.keys(queensgate).filter(k => 
      !['id', 'createdAt', 'updatedAt'].includes(k)
    );
    const filledFields = allFields.filter(f => {
      const value = queensgate[f as keyof typeof queensgate];
      return value !== null && value !== undefined && value !== '' && 
             (typeof value !== 'number' || value !== 0);
    });

    console.log('🏢 Example: Queensgate Shopping Centre (Tier 1)');
    console.log(`   Current Completion: ${filledFields.length}/${allFields.length} (${(filledFields.length/allFields.length*100).toFixed(1)}%)`);
    console.log(`   Missing: ${allFields.length - filledFields.length} fields\n`);
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📈 ENRICHMENT ROADMAP\n');

  let currentCompletion = queensgate ? 
    Object.keys(queensgate).filter(k => {
      const value = queensgate[k as keyof typeof queensgate];
      return value !== null && value !== undefined && value !== '' && 
             (typeof value !== 'number' || value !== 0);
    }).length : 44;
  const totalFields = 72;

  for (let i = 0; i < ENRICHMENT_ROADMAP.length; i++) {
    const tier = ENRICHMENT_ROADMAP[i];
    const expectedCompletion = currentCompletion + tier.fields.length;
    const percentComplete = (expectedCompletion / totalFields * 100).toFixed(1);

    console.log(`\n${i + 1}. ${tier.name}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   📦 Fields (${tier.fields.length}): ${tier.fields.join(', ')}`);
    console.log(`   🛠️  Method: ${tier.method} | Difficulty: ${tier.difficulty}`);
    console.log(`   💰 Cost: ${tier.cost}`);
    console.log(`   ⏱️  Time: ${tier.timeEstimate}`);
    console.log(`   📈 Progress: ${currentCompletion}/${totalFields} → ${expectedCompletion}/${totalFields} (${percentComplete}%)`);
    console.log(`   📝 ${tier.notes}`);

    currentCompletion = expectedCompletion;
  }

  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('🎯 SUMMARY\n');
  console.log('Achievable (Low-hanging fruit):');
  console.log('  ✅ After running scripts: ~75% (10 fields from Google Places + scraping)');
  console.log('  ✅ After next batch: ~81% (+ Facebook data, retailers calc, income)');
  console.log('  ⚠️  After advanced scraping: ~83% (+ anchor tenants - hard but doable)\n');
  
  console.log('Challenging (Requires paid data):');
  console.log('  💰 100% completion requires: Owner, Management, Footfall data');
  console.log('  💰 Options:');
  console.log('     - CoStar Group (commercial real estate data)');
  console.log('     - JLL/Savills market reports');
  console.log('     - Manual research from company reports/news\n');
  
  console.log('💡 RECOMMENDATION:');
  console.log('   Focus on getting to 81-83% with automated methods first.');
  console.log('   For 100%, decide if paid data subscriptions are worth the cost.');
  console.log('   Alternative: Manually fill critical Tier 1 locations only (85 centres).\n');

  // Show field breakdown by enrichment method
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 FIELD BREAKDOWN BY METHOD\n');
  
  const methodBreakdown = {
    api: 0,
    scraping: 0,
    calculated: 0,
    manual: 0,
    'paid-data': 0
  };

  for (const tier of ENRICHMENT_ROADMAP) {
    methodBreakdown[tier.method] += tier.fields.length;
  }

  console.log('API-based (Easy + Reliable):');
  console.log(`  ${methodBreakdown.api} fields - Google Places, ONS Census\n`);
  
  console.log('Web Scraping (Medium effort):');
  console.log(`  ${methodBreakdown.scraping} fields - Website parsing, social media\n`);
  
  console.log('Calculated (Trivial):');
  console.log(`  ${methodBreakdown.calculated} fields - Derived from existing data\n`);
  
  console.log('Paid Data (Expensive):');
  console.log(`  ${methodBreakdown['paid-data']} fields - CoStar, JLL, commercial databases\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

