// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testOne() {
  const loc = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    address: string;
    city: string;
    postcode: string;
  }>>`
    SELECT id, name, address, city, postcode FROM locations 
    WHERE name = 'Lakeside Shopping Centre (Lakeside)'
    LIMIT 1
  `;
  
  if (loc.length === 0) {
    console.log('Location not found');
    return;
  }
  
  const location = loc[0];
  console.log('Testing geocoding for:', location.name);
  console.log('Address:', location.address);
  console.log('City:', location.city);
  console.log('Postcode:', location.postcode);
  console.log('');
  
  const searchQuery = `${location.address}, ${location.city}, ${location.postcode}, UK`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=gb`;
  
  console.log('URL:', url);
  console.log('');
  
  try {
    console.log('Making request...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Flourish-RetailApp/1.0'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('Response:', text.substring(0, 200));
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data && data.length > 0) {
        console.log('\n✓ Found coordinates:', data[0].lat, data[0].lon);
      } else {
        console.log('\n✗ No results returned');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOne().finally(() => prisma.$disconnect());

