// Manually refresh enrichment metrics snapshot
import { computeEnrichmentStats, calculateTierPercentages } from '../src/lib/enrichment-metrics';

async function main() {
  console.log('🔄 Refreshing enrichment metrics...\n');

  // Use the built-in compute function
  const snapshot = await computeEnrichmentStats();
  
  const percentages = calculateTierPercentages(snapshot);
  const fieldStats = snapshot.fieldStats as Record<string, { filled: number; empty: number }>;
  
  console.log('✅ Enrichment metrics refreshed!\n');
  console.log('📊 Tier Completion:');
  console.log(`   Core: ${snapshot.coreComplete}/${snapshot.totalLocations} (${percentages.core}%)`);
  console.log(`   Geo: ${snapshot.geoComplete}/${snapshot.totalLocations} (${percentages.geo}%)`);
  console.log(`   Operational: ${snapshot.operationalComplete}/${snapshot.totalLocations} (${percentages.operational}%)`);
  console.log(`   Commercial: ${snapshot.commercialComplete}/${snapshot.totalLocations} (${percentages.commercial}%)`);
  console.log(`   Digital: ${snapshot.digitalComplete}/${snapshot.totalLocations} (${percentages.digital}%)`);
  console.log(`   Demographic: ${snapshot.demographicComplete}/${snapshot.totalLocations} (${percentages.demographic}%)`);
  
  console.log('\n📝 Key Field Stats:');
  console.log(`   Website: ${fieldStats.website?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.website?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   Parking: ${fieldStats.parkingSpaces?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.parkingSpaces?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   Instagram: ${fieldStats.instagram?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.instagram?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   Facebook: ${fieldStats.facebook?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.facebook?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   Twitter: ${fieldStats.twitter?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.twitter?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   TikTok: ${fieldStats.tiktok?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.tiktok?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  console.log(`   YouTube: ${fieldStats.youtube?.filled || 0}/${snapshot.totalLocations} (${((fieldStats.youtube?.filled || 0) / snapshot.totalLocations * 100).toFixed(1)}%)`);
  
  console.log(`\n🎉 Snapshot ID: ${snapshot.id}`);
  console.log('\n💡 Refresh your browser to see the updated dashboard!');
}

main()
  .catch(console.error);

