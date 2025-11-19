#!/usr/bin/env tsx
/**
 * Import all tenants from Queensgate Shopping Centre website
 * Based on scraped data from https://queensgate-shopping.co.uk/store/
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tenant data extracted from the website
const tenantsData = [
  { name: "3 Store", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/3-store/" },
  { name: "33 1/3 Bar & Performing Arts Venue", category: "Coffee", floor: "Westgate Arcade", url: "/store/33-1-3-bar-performing-arts-venue/" },
  { name: "Ammar's Fragrances", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/ammar-frangrances/" },
  { name: "Ann Summers", category: "Fashion", floor: "First Floor (QG)", url: "/store/ann-summers/" },
  { name: "Auntie Anne's Pretzel Bakery", category: "Food", floor: "Ground Floor (QG)", url: "/store/auntie-annes/" },
  { name: "Batch'd", category: "Coffee", floor: "Ground Floor (QG)", url: "/store/batchd/" },
  { name: "Beaverbrooks", category: "Jewellery & Watches", floor: "Ground Floor (QG)", url: "/store/beaverbrooks/" },
  { name: "Better Brows", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/better-brows/" },
  { name: "Black Sheep Coffee", category: "Coffee", floor: "Ground Floor (QG)", url: "/store/black-sheep-coffee/" },
  { name: "Boots", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/boots/" },
  { name: "Bubble CiTea", category: "On the Go", floor: "Ground Floor (QG)", url: "/store/bubble-citea/" },
  { name: "Burger King", category: "Dine In", floor: "Ground Floor (QG)", url: "/store/burger-king/" },
  { name: "Calendar Club UK", category: "Gifting & Books", floor: "Upper Mall", url: "/store/calendar-club-uk/" },
  { name: "Card Factory", category: "Gifting & Books", floor: "Ground Floor (QG)", url: "/store/card-factory/" },
  { name: "Cards Direct", category: "Gifting & Books", floor: "First Floor (QG)", url: "/store/cards-direct/" },
  { name: "Claire's", category: "Childrenswear", floor: "Ground Floor (QG)", url: "/store/claires/" },
  { name: "Clarks", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/clarks/" },
  { name: "Clues", category: "Fashion", floor: "Westgate Arcade", url: "/store/clues/" },
  { name: "Costa Coffee", category: "Coffee", floor: "Lower Mall", url: "/store/costa-coffee/" },
  { name: "Damaged Society", category: "Fashion", floor: "Ground Floor (QG)", url: "/store/damaged-society/" },
  { name: "Deichmann", category: "Shoes & Accessories", floor: "Ground Floor (QG)", url: "/store/deichmann/" },
  { name: "Djiboart – RB7 Art Centre CIC", category: "Community", floor: "Upper Mall", url: "/store/djiboart-rb7-art-centre-cic/" },
  { name: "Eden Mobility", category: "Community", floor: "Ground Floor (QG)", url: "/store/eden-mobility/" },
  { name: "EE", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/ee/" },
  { name: "Eurochange", category: "Banks & Services", floor: "Ground Floor (QG)", url: "/store/eurochange/" },
  { name: "F. Hinds", category: "Jewellery & Watches", floor: "Ground Floor (QG)", url: "/store/f-hinds/" },
  { name: "Fast Stitch", category: "Lifestyle", floor: "Westgate Arcade", url: "/store/fast-stitch/" },
  { name: "Flying Tiger Copenhagen", category: "Home", floor: "First Floor (QG)", url: "/store/flying-tiger/" },
  { name: "Fone World", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/fone-world/" },
  { name: "Fraser Hart", category: "Jewellery & Watches", floor: "Ground Floor (QG)", url: "/store/fraser-hart/" },
  { name: "Fruit and Veg", category: "Food", floor: "Westgate Arcade", url: "/store/fruit-and-veg/" },
  { name: "Fusion Flair", category: "Fashion", floor: "Westgate Arcade", url: "/store/fusion-flair/" },
  { name: "Giorgio", category: "Health & Beauty", floor: "Westgate Arcade", url: "/store/giorgio/" },
  { name: "Goldsmiths", category: "Jewellery & Watches", floor: "First Floor (QG)", url: "/store/goldsmiths/" },
  { name: "Greggs", category: "Coffee", floor: "First Floor (QG)", url: "/store/greggs/" },
  { name: "H&M", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/hm/" },
  { name: "Hays Travel", category: "Lifestyle", floor: "First Floor (QG)", url: "/store/hays-travel/" },
  { name: "HMV – Coming Soon!", category: "Electronics & Technology", floor: "Lower Mall", url: "/store/hmv-coming-soon/" },
  { name: "Holland & Barrett", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/holland-barrett/" },
  { name: "Hotel Chocolat", category: "Coffee", floor: "Ground Floor (QG)", url: "/store/hotel-chocolat/" },
  { name: "Inheritance Wills", category: "Banks & Services", floor: "Westgate Arcade", url: "/store/inheritance-wills/" },
  { name: "JD Sports", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/jd-sports/" },
  { name: "Jeans and Jeans", category: "Fashion", floor: "Ground Floor (QG)", url: "/store/jeans-and-jeans/" },
  { name: "Krispy Kreme", category: "Coffee", floor: "Ground Floor (QG)", url: "/store/krispy-kreme/" },
  { name: "Laser Clinic", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/laser-clinic/" },
  { name: "Lovisa", category: "Jewellery & Watches", floor: "Lower Mall", url: "/store/lovisa/" },
  { name: "Lush", category: "Health & Beauty", floor: "First Floor (QG)", url: "/store/lush/" },
  { name: "McDonalds", category: "Coffee", floor: "Ground Floor (QG)", url: "/store/mcdonalds/" },
  { name: "Menkind", category: "Electronics & Technology", floor: "First Floor (QG)", url: "/store/menkind/" },
  { name: "Michael John", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/michael-john/" },
  { name: "Millies Cookies", category: "On the Go", floor: "Ground Floor (QG)", url: "/store/millies-cookies/" },
  { name: "MINISO – Coming Soon!", category: "Gifting & Books", floor: "Lower Mall", url: "/store/miniso-coming-soon/" },
  { name: "Mobile Bitz", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/mobile-bitz/" },
  { name: "Modern Sushi & Bento", category: "Food", floor: "Upper Mall", url: "/store/modern-sushi-bento/" },
  { name: "Nail Design", category: "Health & Beauty", floor: "Westgate Arcade", url: "/store/nail-design/" },
  { name: "New Look", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/new-look/" },
  { name: "O'Donnell Moonshine", category: "On the Go", floor: "Lower Mall", url: "/store/odonnell-moonshine/" },
  { name: "O2", category: "Electronics & Technology", floor: "First Floor (QG)", url: "/store/o2/" },
  { name: "ODEON Luxe Cinema", category: "Dine In", floor: "Third Floor", url: "/store/odeon-cinema/" },
  { name: "OFFICE", category: "Childrenswear", floor: "Ground Floor (QG)", url: "/store/office/" },
  { name: "Pandora", category: "Jewellery & Watches", floor: "Ground Floor (QG)", url: "/store/pandora/" },
  { name: "Peterborough Fish Mongers – Now Open", category: "Food", floor: "Westgate Arcade", url: "/store/peterborough-fish-mongers-opening-soon/" },
  { name: "Phone Trader", category: "Electronics & Technology", floor: "Westgate Arcade", url: "/store/phone-trader/" },
  { name: "Phonexperts", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/phonexperts/" },
  { name: "Primark", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/primark/" },
  { name: "Pulse", category: "Lifestyle", floor: "Westgate Arcade", url: "/store/pulse/" },
  { name: "Putt & Play from Hollywood Bowl", category: "Coffee", floor: "Second Floor", url: "/store/puttstars/" },
  { name: "Rev", category: "Fashion", floor: "Ground Floor (QG)", url: "/store/rev/" },
  { name: "Rich and Famous", category: "Menswear", floor: "Lower Mall", url: "/store/rich-and-famous/" },
  { name: "Richardsons Cycles", category: "Lifestyle", floor: "Ground Floor (QG)", url: "/store/richardson-cycles/" },
  { name: "Rituals", category: "Health & Beauty", floor: "Upper Mall", url: "/store/rituals-coming-soon/" },
  { name: "River Island", category: "Childrenswear", floor: "Ground Floor (QG)", url: "/store/river-island/" },
  { name: "Roots & Rise -Now Open", category: "Community", floor: "Upper Mall", url: "/store/roots-rise-opening-soon/" },
  { name: "Sarushi Beauty", category: "Health & Beauty", floor: "Westgate Arcade", url: "/store/sarushi-beauty/" },
  { name: "Schuh", category: "Childrenswear", floor: "Ground Floor (QG)", url: "/store/schuh/" },
  { name: "Shopmobility", category: "Community", floor: "Queensgate", url: "/store/shopmobility/" },
  { name: "Skechers", category: "Childrenswear", floor: "Ground Floor (QG)", url: "/store/skechers/" },
  { name: "Sky", category: "Electronics & Technology", floor: "Ground Floor (QG)", url: "/store/sky/" },
  { name: "Smart Kidz", category: "Childrenswear", floor: "Westgate Arcade", url: "/store/smart-kidz/" },
  { name: "Snap Fitness", category: "Lifestyle", floor: "First Floor (QG)", url: "/store/energie-fitness/" },
  { name: "Soul Happy", category: "Lifestyle", floor: "Westgate Arcade", url: "/store/soul-happy/" },
  { name: "Søstrene Grene", category: "Food", floor: "Ground Floor (QG)", url: "/store/sostrene-grene/" },
  { name: "Style", category: "Fashion", floor: "Westgate Arcade", url: "/store/style/" },
  { name: "Supercuts", category: "Lifestyle", floor: "Ground Floor (QG)", url: "/store/supercuts/" },
  { name: "Superdrug", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/superdrug/" },
  { name: "Superdry", category: "Fashion", floor: "Ground Floor (QG)", url: "/store/superdry/" },
  { name: "Swarovski", category: "Jewellery & Watches", floor: "First Floor (QG)", url: "/store/swarovski/" },
  { name: "Taco Bell", category: "Dine In", floor: "Ground Floor (QG)", url: "/store/taco-bell/" },
  { name: "TAG Heuer", category: "Jewellery & Watches", floor: "Ground Floor (QG)", url: "/store/tag-heuer/" },
  { name: "Tap & Tandoor", category: "Dine In", floor: "Ground Floor (QG)", url: "/store/tap-tandoor/" },
  { name: "Taz's Beauty – Coming Soon", category: "Health & Beauty", floor: "Lower Mall", url: "/store/tazs-beauty-coming-soon/" },
  { name: "The Choc Box", category: "Sweet Treats", floor: "Westgate Arcade", url: "/store/the-choc-box/" },
  { name: "The Fragrance Shop", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/the-fragrance-shop/" },
  { name: "The Oculist", category: "Lifestyle", floor: "Westgate Arcade", url: "/store/the-oculist/" },
  { name: "The Oriental Supermarket (Nepalese Shop)", category: "Food", floor: "Westgate Arcade", url: "/store/the-oriental-supermarket-nepalese-shop/" },
  { name: "The Perfume Shop", category: "Health & Beauty", floor: "Ground Floor (QG)", url: "/store/the-perfume-shop/" },
  { name: "The Right Time", category: "Jewellery & Watches", floor: "Westgate Arcade", url: "/store/the-right-time/" },
  { name: "TK Maxx", category: "Childrenswear", floor: "First Floor (QG)", url: "/store/tk-maxx/" },
  { name: "Top Yard Boxing Gym", category: "Community", floor: "First Floor (QG)", url: "/store/top-yard-boxing-gym/" },
  { name: "Treasured", category: "Childrenswear", floor: "Lower Mall", url: "/store/treasured/" },
  { name: "Turtle Bay", category: "Dine In", floor: "Ground Floor (QG)", url: "/store/turtle-bay/" },
  // Additional tenants from the second list (some may be duplicates)
  { name: "Wagamama", category: "Food & Beverage", floor: null, url: null },
  { name: "Apple Store", category: "Electronics & Technology", floor: null, url: null },
  { name: "Nando's", category: "Food & Beverage", floor: null, url: null },
];

// Remove duplicates based on name (case-insensitive)
const uniqueTenants = tenantsData.reduce((acc, tenant) => {
  const existing = acc.find(t => t.name.toLowerCase() === tenant.name.toLowerCase());
  if (!existing) {
    acc.push(tenant);
  } else {
    // Merge data if one has more info
    if (!existing.floor && tenant.floor) existing.floor = tenant.floor;
    if (!existing.url && tenant.url) existing.url = tenant.url;
    if (!existing.category && tenant.category) existing.category = tenant.category;
  }
  return acc;
}, [] as typeof tenantsData);

// Anchor tenants (major brands typically considered anchor tenants)
const anchorTenants = [
  "Primark", "H&M", "TK Maxx", "JD Sports", "Boots", "Superdrug", 
  "Marks & Spencer", "Debenhams", "John Lewis", "Next", "Apple Store"
];

// Map floor strings to numbers
function parseFloor(floorStr: string | null | undefined): number | undefined {
  if (!floorStr) return undefined;
  
  const lower = floorStr.toLowerCase();
  if (lower.includes('ground')) return 0;
  if (lower.includes('first')) return 1;
  if (lower.includes('second')) return 2;
  if (lower.includes('third')) return 3;
  if (lower.includes('lower')) return -1;
  if (lower.includes('upper')) return 1;
  
  return undefined;
}

async function main() {
  console.log('\n🏪 IMPORTING QUEENSGATE TENANTS\n');

  // Find Queensgate Shopping Centre (not Queensgate Centre or Queensgate Retail Park)
  const location = await prisma.location.findFirst({
    where: {
      name: {
        equals: 'Queensgate Shopping Centre',
        mode: 'insensitive',
      },
    },
  });

  if (!location) {
    console.error('❌ Queensgate Shopping Centre not found in database');
    process.exit(1);
  }

  console.log(`📍 Found: ${location.name} (ID: ${location.id})`);
  console.log(`📊 Importing ${uniqueTenants.length} unique tenants (from ${tenantsData.length} total entries)...\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const tenant of uniqueTenants) {
    try {
      const isAnchor = anchorTenants.some(anchor => 
        tenant.name.toLowerCase().includes(anchor.toLowerCase()) ||
        anchor.toLowerCase().includes(tenant.name.toLowerCase())
      );

      const floor = parseFloor(tenant.floor);

      const result = await prisma.tenant.upsert({
        where: {
          locationId_name: {
            locationId: location.id,
            name: tenant.name,
          },
        },
        create: {
          locationId: location.id,
          name: tenant.name,
          category: tenant.category || 'Other',
          floor: floor,
          isAnchorTenant: isAnchor,
        },
        update: {
          category: tenant.category || 'Other',
          floor: floor,
          isAnchorTenant: isAnchor,
        },
      });

      if (result) {
        // Check if it was created or updated by checking if it exists
        const existing = await prisma.tenant.findUnique({
          where: {
            id: result.id,
          },
        });
        
        // This is a simple check - in reality upsert doesn't tell us if it was create or update
        // We'll count as created if it's a new tenant
        created++;
        console.log(`✅ ${tenant.name} (${tenant.category})`);
      }
    } catch (error) {
      console.error(`❌ Error importing ${tenant.name}:`, error);
      skipped++;
    }
  }

  // Count anchor tenants
  const anchorCount = await prisma.tenant.count({
    where: {
      locationId: location.id,
      isAnchorTenant: true,
    },
  });

  const totalCount = await prisma.tenant.count({
    where: {
      locationId: location.id,
    },
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Created/Updated: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Total tenants in database: ${totalCount}`);
  console.log(`⭐ Anchor tenants: ${anchorCount}`);
  console.log(`🏪 Expected stores: ${location.numberOfStores || 'unknown'}`);
  console.log(`📊 Coverage: ${totalCount}/${location.numberOfStores || 'unknown'} (${location.numberOfStores ? Math.round((totalCount / location.numberOfStores) * 100) : 'N/A'}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

