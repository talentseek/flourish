// @ts-nocheck
// Test Census 2021 API endpoints

async function testCensusAPI() {
  console.log('🔍 Testing Census 2021 Data APIs\n');
  
  // Example LSOA from Peterborough
  const testLSOA = 'E01017830'; // Peterborough LSOA
  const testMSOA = 'E02004514'; // Peterborough MSOA
  const testLTLA = 'E06000031'; // Peterborough unitary authority
  
  console.log('Test codes:');
  console.log(`  LSOA: ${testLSOA}`);
  console.log(`  MSOA: ${testMSOA}`);
  console.log(`  LTLA: ${testLTLA}`);
  console.log('');
  
  // Try NOMIS API (official ONS data portal) with proper endpoints
  console.log('1. Testing NOMIS API for Census 2021 data...\n');
  
  try {
    // Get list of available Census 2021 datasets
    const datasetsUrl = 'https://www.nomisweb.co.uk/api/v01/dataset/def.sdmx.json';
    console.log('Fetching available datasets...');
    const response = await fetch(datasetsUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✓ NOMIS API works!');
      
      // Find Census 2021 datasets
      if (data.structure && data.structure.keyfamilies) {
        const censusDatasets = data.structure.keyfamilies.keyfamily
          .filter((ds: any) => ds.name[0].value.includes('Census 2021'))
          .slice(0, 5);
        
        if (censusDatasets.length > 0) {
          console.log('\nCensus 2021 datasets found:');
          censusDatasets.forEach((ds: any) => {
            console.log(`  - ${ds.id}: ${ds.name[0].value}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n2. Testing specific Census table (TS007 - Age)...\n');
  try {
    // TS007 is "Age by single year" table
    // Format: /api/v01/dataset/{id}/geography/{geography}.data.json
    const ageDataUrl = `https://www.nomisweb.co.uk/api/v01/dataset/NM_2071_1.data.json?geography=${testLTLA}&c2021_age_88=0...88&measures=20100`;
    
    const response = await fetch(ageDataUrl);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✓ Got age data!');
      
      if (data.obs) {
        const totalPop = data.obs.reduce((sum: number, obs: any) => sum + (obs.obs_value?.value || 0), 0);
        console.log(`Total population: ${totalPop.toLocaleString()}`);
        console.log(`Data points: ${data.obs.length}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n3. Testing ONS Open Geography API...\n');
  try {
    // ONS also has Open Geography Portal API
    const geoUrl = `https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/LSOA_Dec_2021_PWC_in_England_and_Wales_2022/FeatureServer/0/query?where=LSOA21CD='${testLSOA}'&outFields=*&f=json`;
    
    const response = await fetch(geoUrl);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features[0]) {
        console.log('✓ Got geography data!');
        console.log('LSOA Name:', data.features[0].attributes.LSOA21NM);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n4. Summary:\n');
  console.log('Best approach:');
  console.log('  1. Use postcodes.io to convert postcode → LSOA/LTLA code');
  console.log('  2. Use NOMIS API to get Census 2021 demographic data');
  console.log('  3. Query specific tables: age, housing, ethnicity, etc.');
}

testCensusAPI();

