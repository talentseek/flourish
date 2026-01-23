#!/usr/bin/env python3
"""
Generate a TypeScript enrichment script template for a location.
Usage: python generate_enrichment.py <location-id>
"""

import subprocess
import sys
import json
import re

def get_location_by_id(location_id: str) -> dict | None:
    """Fetch location data by ID."""
    script = f'''
    const {{ PrismaClient }} = require("@prisma/client");
    const prisma = new PrismaClient();
    async function main() {{
        const loc = await prisma.location.findUnique({{
            where: {{ id: "{location_id}" }}
        }});
        if (loc) {{
            console.log(JSON.stringify(loc, (k, v) => typeof v === "bigint" ? v.toString() : v));
        }} else {{
            console.log("null");
        }}
    }}
    main().finally(() => prisma.$disconnect());
    '''
    
    try:
        result = subprocess.run(
            ["npx", "tsx", "-e", script],
            capture_output=True,
            text=True,
            cwd=".",
            timeout=30
        )
        if result.returncode == 0 and result.stdout.strip() != "null":
            return json.loads(result.stdout.strip())
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
    return None


def slugify(name: str) -> str:
    """Convert name to slug."""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def generate_script(location: dict) -> str:
    """Generate TypeScript enrichment script."""
    location_id = location["id"]
    name = location["name"]
    slug = slugify(name)
    
    template = f'''import {{ PrismaClient }} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {{
  const locationId = '{location_id}';
  console.log('Enriching {name}...\\n');

  const updatedLocation = await prisma.location.update({{
    where: {{ id: locationId }},
    data: {{
      // ============================================
      // Contact & Website
      // ============================================
      // phone: '01234 567890',
      // website: 'https://www.example.co.uk',
      // openingHours: 'Mon-Sat 09:00-18:00, Sun 11:00-17:00',
      // heroImage: '/images/locations/{slug}.jpg',

      // ============================================
      // Ownership & Management
      // ============================================
      // owner: 'Owner Name',
      // management: 'Management Company',
      // openedYear: 2000,

      // ============================================
      // Operations
      // ============================================
      // parkingSpaces: 500,
      // numberOfFloors: 2,
      // retailSpace: 100000,
      // carParkPrice: 2.50,
      // evCharging: true,
      // evChargingSpaces: 10,
      // anchorTenants: 3,
      // publicTransit: 'Bus station nearby',
      // retailers: 50,
      // numberOfStores: 50,

      // ============================================
      // Footfall
      // ============================================
      // footfall: 5000000,

      // ============================================
      // Social Media
      // ============================================
      // instagram: 'https://www.instagram.com/{slug}/',
      // facebook: 'https://www.facebook.com/{slug}/',
      // twitter: null,
      // youtube: null,
      // tiktok: null,

      // ============================================
      // Google Reviews
      // ============================================
      // googleRating: 4.2,
      // googleReviews: 1000,
      // googleVotes: 1000,

      // ============================================
      // Facebook Reviews
      // ============================================
      // facebookRating: 4.0,
      // facebookReviews: 500,
      // facebookVotes: 500,

      // ============================================
      // SEO Data
      // ============================================
      // seoKeywords: [
      //   {{ keyword: '{name.lower()}', position: 1, volume: 1000 }},
      // ],
      // topPages: [
      //   {{ url: '/stores', traffic: 5000, percentage: 30 }},
      // ],

      // ============================================
      // Demographics (Match to LTLA)
      // ============================================
      // population: 100000,
      // medianAge: 40,
      // familiesPercent: 28.0,
      // seniorsPercent: 18.5,
      // avgHouseholdIncome: 31400,
      // incomeVsNational: 0.0,
      // homeownership: 62.5,
      // homeownershipVsNational: 0.0,
      // carOwnership: 76.7,
      // carOwnershipVsNational: 0.0,

      // Mark as managed if applicable
      // isManaged: true,
    }}
  }});

  console.log('✅ Successfully updated', updatedLocation.name);
}}

main().catch(console.error).finally(() => prisma.$disconnect());
'''
    return template


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_enrichment.py <location-id>")
        print("       python generate_enrichment.py <location-id> --output")
        sys.exit(1)
    
    location_id = sys.argv[1]
    print(f"Fetching location: {location_id}...")
    
    location = get_location_by_id(location_id)
    
    if not location:
        print(f"❌ Location not found: {location_id}")
        sys.exit(1)
    
    script = generate_script(location)
    
    if "--output" in sys.argv:
        slug = slugify(location["name"])
        filename = f"scripts/enrich-{slug}.ts"
        with open(filename, "w") as f:
            f.write(script)
        print(f"✅ Generated: {filename}")
    else:
        print("\n" + "="*60)
        print(f"ENRICHMENT TEMPLATE FOR: {location['name']}")
        print("="*60)
        print(script)
        print("\nTo save to file, add --output flag")


if __name__ == "__main__":
    main()
