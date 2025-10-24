// @ts-nocheck
// Find correct Census 2021 dataset IDs in NOMIS

async function findCensusDatasets() {
  console.log('🔍 Finding Census 2021 Datasets in NOMIS\n');
  
  try {
    // Get all datasets
    const url = 'https://www.nomisweb.co.uk/api/v01/dataset/def.sdmx.json';
    console.log('Fetching all datasets...\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.structure && data.structure.keyfamilies) {
      const datasets = data.structure.keyfamilies.keyfamily;
      
      // Filter for Census 2021
      const census2021 = datasets.filter((ds: any) => 
        ds.name && ds.name[0] && 
        (ds.name[0].value.toLowerCase().includes('census 2021') ||
         ds.name[0].value.toLowerCase().includes('census2021'))
      );
      
      console.log(`Found ${census2021.length} Census 2021 datasets:\n`);
      
      census2021.slice(0, 20).forEach((ds: any, i: number) => {
        console.log(`${i + 1}. ID: ${ds.id}`);
        console.log(`   Name: ${ds.name[0].value}`);
        console.log(`   AgencyID: ${ds.agencyid || 'N/A'}`);
        console.log('');
      });
      
      // Test a specific one
      if (census2021.length > 0) {
        const testDataset = census2021[0];
        console.log(`\nTesting dataset: ${testDataset.id}`);
        console.log(`Name: ${testDataset.name[0].value}\n`);
        
        // Try to get data for Peterborough (E06000031)
        const testUrl = `https://www.nomisweb.co.uk/api/v01/dataset/${testDataset.id}.data.json?geography=E06000031&measures=20100`;
        console.log('Test URL:', testUrl);
        
        const testResponse = await fetch(testUrl);
        console.log('Status:', testResponse.status);
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log('Response keys:', Object.keys(testData));
          
          if (testData.obs && testData.obs.length > 0) {
            console.log('✓ Got data! Sample:');
            console.log(JSON.stringify(testData.obs[0], null, 2).substring(0, 300));
          } else {
            console.log('No observations found');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n\n=== Checking Alternative: ONS Table Builder ===\n');
  console.log('Census 2021 may need to be accessed via:');
  console.log('1. ONS Cantabular API: https://api.beta.ons.gov.uk/');
  console.log('2. Bulk downloads: https://www.nomisweb.co.uk/sources/census_2021_bulk');
  console.log('3. Table Builder: https://www.ons.gov.uk/datasets');
}

findCensusDatasets();

