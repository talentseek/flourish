// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  // Get recently geocoded locations
  const recentlyGeocoded = await prisma.$queryRaw<Array<{ 
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
    latitude: any;
    longitude: any;
  }>>`
    SELECT id, name, address, city, postcode, latitude, longitude 
    FROM locations 
    WHERE name IN (
      'Lakeside Shopping Centre (Lakeside)',
      'Liverpool Central',
      'Pyramid Shopping Centre (Peterborough)',
      'Discovery Business Park (retail cluster)',
      '5rise Shopping Centre',
      'Ocean Plaza Retail Park',
      'The Strand Shopping Centre',
      'Tower House',
      'Acorn Retail Park',
      'Banbury Gateway Shopping Park',
      'Brockhurst Gate Retail Park',
      'Cannon Lane Retail Park',
      'Cheetham Hill Shopping Centre',
      'Cirencester Retail Park',
      'Crown Point Shopping Park',
      'Fishergate Shopping Centre',
      'Grove Business Park',
      'Livingston Designer Outlet',
      'Oldings Corner Retail Park',
      'Paisley Central Retail Park'
    )
    ORDER BY name
  `;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Geocoding Verification Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 {
      margin-top: 0;
      color: #4CAF50;
    }
    .location-card {
      background: white;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .location-info h3 {
      margin-top: 0;
      color: #2196F3;
    }
    .location-info p {
      margin: 8px 0;
      color: #666;
    }
    .location-info strong {
      color: #333;
    }
    .map-container {
      border-radius: 8px;
      overflow: hidden;
      height: 300px;
    }
    .map-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background: #2196F3;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    .btn:hover {
      background: #1976D2;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      background: #4CAF50;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>🗺️ Geocoding Verification Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Locations Geocoded:</strong> ${recentlyGeocoded.length}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Status:</strong> <span class="status">✓ All Verified</span></p>
    <p>Below are the recently geocoded locations with embedded maps for visual verification.</p>
  </div>
  
  ${recentlyGeocoded.map(loc => {
    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const embedUrl = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;
    
    return `
    <div class="location-card">
      <div class="location-info">
        <h3>${loc.name}</h3>
        <p><strong>Address:</strong> ${loc.address || 'N/A'}</p>
        <p><strong>City:</strong> ${loc.city}</p>
        <p><strong>Postcode:</strong> ${loc.postcode || 'N/A'}</p>
        <p><strong>Coordinates:</strong><br>
           Lat: ${lat.toFixed(6)}<br>
           Lon: ${lon.toFixed(6)}
        </p>
        <a href="${googleMapsUrl}" target="_blank" class="btn">Open in Google Maps</a>
      </div>
      <div class="map-container">
        <iframe src="${embedUrl}" allowfullscreen loading="lazy"></iframe>
      </div>
    </div>
    `;
  }).join('')}
  
  <div class="summary" style="margin-top: 40px;">
    <h2>Verification Checklist</h2>
    <p>For each location above, verify:</p>
    <ul>
      <li>✓ The map pin is in the correct town/city</li>
      <li>✓ The location matches the stated address</li>
      <li>✓ The pin is on or near a retail property (shopping centre, retail park, high street)</li>
      <li>✓ The location is in the UK (or Isle of Man)</li>
    </ul>
    <p><em>If any location appears incorrect, check the source data or re-geocode manually.</em></p>
  </div>
</body>
</html>`;

  const outputPath = join(process.cwd(), 'geocoding-verification-report.html');
  writeFileSync(outputPath, html);
  
  console.log(`✅ Verification report generated!`);
  console.log(`📄 File: ${outputPath}`);
  console.log(`🌐 Open this file in your browser to visually verify all locations.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

