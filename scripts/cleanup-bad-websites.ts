// Remove low-quality and unsuitable website URLs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Domains to remove (same as blacklist in enrich-websites-v2.ts)
const BAD_DOMAINS = [
  'wheree.com',
  'millngate.com',
  'retail-systems.com',
  'parkhousemedicalcentre.co.uk',
  'clowes.co.uk',
  'legallais.co.uk',
  'fhp.co.uk',
  'parkplaceretail.co.uk',
  'completelyretail.co.uk',
  'icatcare.org',
  'petsathome.com',
  'bmstores.co.uk',
  'poundstretcher.co.uk',
  'premierinn.com',
  'expedia.com',
  'alamy.com',
  'skyscrapercity.com',
  'amazonaws.com',
  'lancs.live',
  'nottinghampost.com',
  'bordertelegraph.com',
  'reddit.com',
  'rome2rio.com',
  'wikimedia.org',
  'bristol.gov.uk',
  'lancashire.gov.uk',
  'monmouthshire.gov.uk',
  'denbighshire.gov.uk',
  'west-dunbarton.gov.uk',
  'allsop.co.uk',
  'costar.com',
  'apple.com/place',
  'maps.apple.com',
  'cylex-uk.co.uk',
  'lovebuildconstruction.com',
  'jackson-partners.co.uk',
  'nannycare.co.uk',
  'ultimateaddons.com',
  'rayleigh.cylex',
  'discovereaststaffordshire.com',
  'jorvikvikingcentre.co.uk',
  'stores.tescomobile.com',
  'intercom.help',
  'townandcitygiftcards.com',
  'barrowbc.gov.uk',
  'branches.bankofscotland.co.uk',
  'standardhotels.com',
  'tripadvisor.com',
  'bluediamond',
  'macularsociety.org',
  'rapleys.com',
  'restaurants.subway.com',
  'doona.shop',
  'boots.jobs',
  'retailers.tempur.com',
];

async function main() {
  console.log('🧹 Cleaning up bad website URLs\n');

  // Get all locations with websites
  const locations = await prisma.location.findMany({
    where: {
      website: { not: null }
    },
    select: { id: true, name: true, city: true, website: true }
  });

  console.log(`📊 Found ${locations.length} locations with websites\n`);

  let removedCount = 0;
  const removedSites: Array<{ name: string; city: string; website: string }> = [];

  for (const loc of locations) {
    if (!loc.website) continue;

    const urlLower = loc.website.toLowerCase();
    const isBad = BAD_DOMAINS.some(domain => urlLower.includes(domain));

    if (isBad) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { website: null }
      });

      removedSites.push({ name: loc.name, city: loc.city, website: loc.website });
      removedCount++;
      console.log(`❌ Removed: ${loc.name} (${loc.city})`);
      console.log(`   ${loc.website}\n`);
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Removed: ${removedCount} bad websites`);
  console.log(`   Kept: ${locations.length - removedCount} good websites\n`);

  // Group by domain for summary
  const domainCounts: Record<string, number> = {};
  for (const site of removedSites) {
    const domain = site.website.match(/https?:\/\/(?:www\.)?([^\/]+)/)?.[1] || 'unknown';
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  }

  console.log('📊 Removed by domain:');
  Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count}`);
    });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

