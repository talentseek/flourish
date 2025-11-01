import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIORITY_LOCATIONS = [
  'Broadway Shopping Centre',
  'The Martlets Shopping Centre',
  'Lion Yard',
  'Pentagon Shopping Centre',
  'Priory Shopping Centre',
  'Orchard Centre',
  'Swan Centre',
  'Princess Mead',
  'Royal Exchange',
  "St Christopher's Place",
  'Aylesham Centre',
  'Putney Exchange',
  'Anglia Square',
  'Mercury Mall',
  'Touchwood',
  'Christopher Place',
  'Horse Fair Shopping Centre',
  'Newlands',
  'One Stop Shopping Centre',
  'Marlands Shopping Centre',
  'Islington Square',
];

async function main() {
  console.log('🔍 Checking priority locations...\n');

  for (const name of PRIORITY_LOCATIONS) {
    // Try to find the location (case insensitive, partial match)
    const locations = await prisma.location.findMany({
      where: {
        name: {
          contains: name.replace(' Shopping Centre', '').replace(' Center', ''),
          mode: 'insensitive',
        },
        type: {
          in: ['SHOPPING_CENTRE', 'RETAIL_PARK'],
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        type: true,
        website: true,
        phone: true,
        openingHours: true,
        instagram: true,
        facebook: true,
        twitter: true,
        googleRating: true,
        googleReviews: true,
        facebookRating: true,
        parkingSpaces: true,
        carParkPrice: true,
        evCharging: true,
        numberOfFloors: true,
        publicTransit: true,
        openedYear: true,
        owner: true,
        management: true,
        footfall: true,
        retailers: true,
        retailSpace: true,
        seoKeywords: true,
        topPages: true,
        _count: {
          select: {
            tenants: true,
          },
        },
      },
    });

    if (locations.length === 0) {
      console.log(`❌ "${name}" - NOT FOUND in database`);
      continue;
    }

    for (const loc of locations) {
      console.log(`\n✅ ${loc.name} (${loc.city})`);
      console.log(`   Type: ${loc.type}`);
      
      // Calculate missing fields
      const missing: string[] = [];
      
      if (!loc.website) missing.push('website');
      if (!loc.phone) missing.push('phone');
      if (!loc.openingHours) missing.push('openingHours');
      if (!loc.instagram && !loc.facebook && !loc.twitter) missing.push('social media');
      if (!loc.googleRating) missing.push('googleRating');
      if (!loc.googleReviews) missing.push('googleReviews');
      if (!loc.parkingSpaces) missing.push('parkingSpaces');
      if (!loc.carParkPrice) missing.push('carParkPrice');
      if (!loc.evCharging) missing.push('evCharging');
      if (!loc.numberOfFloors) missing.push('numberOfFloors');
      if (!loc.publicTransit) missing.push('publicTransit');
      if (!loc.openedYear) missing.push('openedYear');
      if (!loc.owner) missing.push('owner');
      if (!loc.management) missing.push('management');
      if (!loc.footfall) missing.push('footfall');
      if (!loc.retailers) missing.push('retailers');
      if (!loc.retailSpace) missing.push('retailSpace');
      if (!loc.seoKeywords) missing.push('seoKeywords');
      if (!loc.topPages) missing.push('topPages');
      if (loc._count.tenants < 5) missing.push(`tenants (only ${loc._count.tenants})`);
      
      const completeness = Math.round(((20 - missing.length) / 20) * 100);
      
      console.log(`   📊 Completeness: ${completeness}%`);
      
      if (missing.length > 0) {
        console.log(`   ⚠️  Missing (${missing.length}): ${missing.join(', ')}`);
      } else {
        console.log(`   🎉 COMPLETE!`);
      }
      
      if (loc.website) {
        console.log(`   🌐 Website: ${loc.website}`);
      }
    }
  }

  console.log('\n\n📈 Summary of available enrichment scripts:');
  console.log('   1. enrich-google-places.ts - Phone, rating, reviews, hours');
  console.log('   2. enrich-social-media-v3.ts - Instagram, Facebook, Twitter, TikTok, YouTube');
  console.log('   3. enrich-facebook-data.ts - Facebook ratings/reviews');
  console.log('   4. enrich-operational-details.ts - EV charging, parking price, transit, floors, year');
  console.log('   5. enrich-seo-metadata.ts - SEO keywords and top pages');
  console.log('   6. enrich-stores-crawl4ai.ts - Store directories (tenant data)');
  console.log('   7. enrich-parking-v3.ts - Parking spaces data');
  console.log('   8. enrich-household-income.ts - Demographics (household income)');
  console.log('   9. backfill-commercial-data.ts - Owner, management, footfall');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

