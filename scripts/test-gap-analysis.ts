// Test the gap analysis logic
import { computeGapAnalysis } from '../src/lib/gap-analysis';

async function main() {
  console.log('🔍 Computing Gap Analysis...\n');
  
  const result = await computeGapAnalysis();
  
  console.log('📊 OVERVIEW');
  console.log('═'.repeat(60));
  console.log(`Total Locations: ${result.overview.totalLocations.toLocaleString()}`);
  console.log(`Shopping Centres/Retail Parks: ${result.overview.shoppingCentresRetailParks.toLocaleString()}`);
  console.log(`Locations with Websites: ${result.overview.locationsWithWebsites.toLocaleString()}`);
  
  console.log('\n🚨 CRITICAL GAPS');
  console.log('═'.repeat(60));
  console.log(`Major locations without websites: ${result.criticalGaps.majorLocationsWithoutWebsites}`);
  console.log(`Shopping centres without social: ${result.criticalGaps.shoppingCentresWithoutSocial}`);
  console.log(`Shopping centres without parking: ${result.criticalGaps.shoppingCentresWithoutParking}`);
  
  console.log('\n🎯 TOP 10 GAPS (by priority & missing count)');
  console.log('═'.repeat(60));
  result.fieldGaps.slice(0, 10).forEach((gap, i) => {
    const priority = gap.priority === 'high' ? '🔴' : gap.priority === 'medium' ? '🟡' : '🟢';
    console.log(`${i + 1}. ${priority} ${gap.displayName} (${gap.enrichmentMethod})`);
    console.log(`   ${gap.percentage}% complete | ${gap.totalMissing.toLocaleString()} missing ${gap.contextNote}`);
  });
  
  console.log('\n📈 GAPS BY CATEGORY');
  console.log('═'.repeat(60));
  
  const categories = ['core', 'geo', 'operational', 'commercial', 'digital', 'demographic'];
  categories.forEach(category => {
    const categoryGaps = result.fieldGaps.filter(g => g.category === category && g.percentage < 100);
    if (categoryGaps.length > 0) {
      console.log(`\n${category.toUpperCase()}: ${categoryGaps.length} fields with gaps`);
      categoryGaps.forEach(gap => {
        console.log(`  • ${gap.displayName}: ${gap.percentage}% (${gap.totalMissing} missing)`);
      });
    }
  });
  
  console.log('\n🛠️  ENRICHMENT STRATEGY');
  console.log('═'.repeat(60));
  const methods = ['api', 'scraping', 'manual', 'calculated'];
  methods.forEach(method => {
    const methodGaps = result.fieldGaps.filter(g => g.enrichmentMethod === method && g.percentage < 100);
    if (methodGaps.length > 0) {
      console.log(`\n${method.toUpperCase()}: ${methodGaps.length} fields`);
      methodGaps.forEach(gap => {
        console.log(`  • ${gap.displayName} (${gap.totalMissing} missing)`);
      });
    }
  });
  
  console.log('\n✅ Gap analysis complete!\n');
}

main()
  .catch(console.error);

