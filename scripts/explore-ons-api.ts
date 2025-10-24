// @ts-nocheck
// Explore ONS API to understand data structure

async function exploreONS() {
  console.log('🔍 Exploring ONS Developer Hub API\n');
  
  // Test 1: Get area types available
  console.log('1. Fetching available area types...');
  try {
    const areaTypesUrl = 'https://api.beta.ons.gov.uk/v1/area-types';
    const response = await fetch(areaTypesUrl);
    const data = await response.json();
    
    console.log('Available area types:');
    if (data.items) {
      data.items.slice(0, 10).forEach((item: any) => {
        console.log(`  - ${item.id}: ${item.label || item.name || 'N/A'}`);
      });
    } else {
      console.log(JSON.stringify(data, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n2. Testing postcode lookup (example: PE1 1NH)...');
  try {
    // ONS Postcode API
    const postcodeUrl = 'https://api.postcodes.io/postcodes/PE1 1NH';
    const response = await fetch(postcodeUrl);
    const data = await response.json();
    
    if (data.result) {
      console.log('Postcode data:');
      console.log(`  LSOA: ${data.result.lsoa}`);
      console.log(`  MSOA: ${data.result.msoa}`);
      console.log(`  Admin District: ${data.result.admin_district}`);
      console.log(`  Admin Ward: ${data.result.admin_ward}`);
      console.log(`  Parliamentary Constituency: ${data.result.parliamentary_constituency}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n3. Testing Census 2021 API...');
  try {
    // Try the census API endpoint
    const censusUrl = 'https://census.gov.uk/ts007';
    const response = await fetch(censusUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('Census API status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n4. Testing NOMIS API (alternative for Census data)...');
  try {
    // NOMIS is the official ONS data portal
    const nomisUrl = 'https://www.nomisweb.co.uk/api/v01/dataset/def.htm';
    const response = await fetch(nomisUrl);
    console.log('NOMIS API status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Available:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

exploreONS();

