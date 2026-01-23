#!/usr/bin/env python3
"""
Audit a location's enrichment status.
Usage: python audit_location.py "Location Name"
"""

import subprocess
import sys
import json

# Field definitions by category
FIELD_CATEGORIES = {
    "Core (Contact)": ["phone", "website", "openingHours", "heroImage"],
    "Ownership": ["owner", "management", "openedYear"],
    "Operations": [
        "parkingSpaces", "numberOfFloors", "retailSpace", "carParkPrice",
        "evCharging", "evChargingSpaces", "anchorTenants", "publicTransit",
        "numberOfStores", "retailers"
    ],
    "Footfall": ["footfall"],
    "Social Media": ["instagram", "facebook", "twitter", "youtube", "tiktok"],
    "Reviews": [
        "googleRating", "googleReviews", "googleVotes",
        "facebookRating", "facebookReviews", "facebookVotes"
    ],
    "SEO": ["seoKeywords", "topPages"],
    "Demographics": [
        "population", "medianAge", "familiesPercent", "seniorsPercent",
        "avgHouseholdIncome", "incomeVsNational", "homeownership",
        "homeownershipVsNational", "carOwnership", "carOwnershipVsNational"
    ]
}

def get_location_data(name: str) -> dict | None:
    """Fetch location data from database using Prisma."""
    script = f'''
    const {{ PrismaClient }} = require("@prisma/client");
    const prisma = new PrismaClient();
    async function main() {{
        const loc = await prisma.location.findFirst({{
            where: {{ name: {{ contains: "{name}", mode: "insensitive" }} }}
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
        print(f"Error fetching data: {e}", file=sys.stderr)
    return None


def audit_location(data: dict) -> dict:
    """Analyze field completeness."""
    report = {
        "location": data.get("name", "Unknown"),
        "id": data.get("id", "Unknown"),
        "categories": {},
        "summary": {
            "total_fields": 0,
            "filled_fields": 0,
            "missing_fields": 0,
            "completeness": 0
        }
    }
    
    total = 0
    filled = 0
    
    for category, fields in FIELD_CATEGORIES.items():
        cat_report = {"filled": [], "missing": []}
        
        for field in fields:
            total += 1
            value = data.get(field)
            
            # Check if field has a meaningful value
            is_filled = (
                value is not None and
                value != "" and
                value != [] and
                value != {}
            )
            
            if is_filled:
                filled += 1
                cat_report["filled"].append(field)
            else:
                cat_report["missing"].append(field)
        
        cat_report["completeness"] = (
            len(cat_report["filled"]) / len(fields) * 100
            if fields else 0
        )
        report["categories"][category] = cat_report
    
    report["summary"]["total_fields"] = total
    report["summary"]["filled_fields"] = filled
    report["summary"]["missing_fields"] = total - filled
    report["summary"]["completeness"] = round(filled / total * 100, 1) if total else 0
    
    return report


def print_report(report: dict):
    """Print formatted audit report."""
    print(f"\n{'='*60}")
    print(f"LOCATION AUDIT: {report['location']}")
    print(f"ID: {report['id']}")
    print(f"{'='*60}\n")
    
    for category, data in report["categories"].items():
        status = "✅" if data["completeness"] == 100 else "⚠️" if data["completeness"] > 50 else "❌"
        print(f"{status} {category}: {data['completeness']:.0f}% complete")
        
        if data["missing"]:
            print(f"   Missing: {', '.join(data['missing'])}")
        print()
    
    print(f"{'='*60}")
    summary = report["summary"]
    print(f"OVERALL: {summary['filled_fields']}/{summary['total_fields']} fields ({summary['completeness']}%)")
    print(f"{'='*60}\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python audit_location.py \"Location Name\"")
        sys.exit(1)
    
    location_name = sys.argv[1]
    print(f"Searching for: {location_name}...")
    
    data = get_location_data(location_name)
    
    if not data:
        print(f"❌ Location not found: {location_name}")
        sys.exit(1)
    
    report = audit_location(data)
    print_report(report)
    
    # Optionally output JSON
    if "--json" in sys.argv:
        print("\nJSON Report:")
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
