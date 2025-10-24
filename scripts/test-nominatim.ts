// @ts-nocheck

// Test a single address with verbose output
async function testGeocode() {
  const address = "West Thurrock Way, Grays, Essex, RM20 2ZR, UK";
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=gb`;
  
  console.log('Testing Nominatim API...');
  console.log('URL:', url);
  console.log('');
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flourish-RetailApp/1.0 (contact@flourish-app.com)'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    const data = JSON.parse(text);
    console.log('\nParsed data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGeocode();

