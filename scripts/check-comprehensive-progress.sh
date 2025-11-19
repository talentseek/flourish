#!/bin/bash
# 📊 COMPREHENSIVE ENRICHMENT PROGRESS CHECKER

cd /Users/mbeckett/Documents/codeprojects/flourish

echo "📊 COMPREHENSIVE ENRICHMENT PROGRESS"
echo "====================================="
echo ""

# Check if processes are running
echo "🔍 Process Status:"
ps aux | grep -E "enrich-(tenants-mass|websites-v2|google-places-complete|operational-deep|anchor-tenants-enhanced|calculate-retailers|social-media-deep|ownership-enhanced|footfall-enhanced|seo-metadata-enhanced)" | grep -v grep | wc -l | xargs -I {} echo "  Running processes: {}"
echo ""

# Check log files
echo "📝 Recent Activity (last 5 lines per scraper):"
echo ""

echo "1️⃣  Mass Tenant Enrichment:"
tail -5 /tmp/enrich-tenants-mass.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "2️⃣  Enhanced Website Discovery v2:"
tail -5 /tmp/enrich-websites-v2.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "3️⃣  Google Places Complete:"
tail -5 /tmp/enrich-google-places-complete.log 2>/dev/null | grep -E "(Enriched|Found|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "4️⃣  Operational Deep Dive:"
tail -5 /tmp/enrich-operational-deep.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "5️⃣  Anchor Tenants Enhanced:"
tail -5 /tmp/enrich-anchor-tenants-enhanced.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "6️⃣  Calculate Retailers/Space:"
tail -5 /tmp/enrich-calculate-retailers.log 2>/dev/null | grep -E "(Updated|Skipped|complete)" | tail -2 || echo "  No recent activity"
echo ""

echo "7️⃣  Social Media Deep Scrape:"
tail -5 /tmp/enrich-social-media-deep.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "8️⃣  Owner/Management Enhanced:"
tail -5 /tmp/enrich-ownership-enhanced.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "9️⃣  Footfall Enhanced:"
tail -5 /tmp/enrich-footfall-enhanced.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "🔟 SEO Metadata Enhanced:"
tail -5 /tmp/enrich-seo-metadata-enhanced.log 2>/dev/null | grep -E "(Found|Success|Failed|\[.*/.*\])" | tail -2 || echo "  No recent activity"
echo ""

echo "====================================="
echo "💡 To watch live progress:"
echo "  tail -f /tmp/enrich-<scraper-name>.log"
echo ""
echo "🛑 To stop all:"
echo "  pkill -f 'enrich-tenants-mass|enrich-websites-v2|enrich-google-places-complete|enrich-operational-deep|enrich-anchor-tenants-enhanced|enrich-calculate-retailers|enrich-social-media-deep|enrich-ownership-enhanced|enrich-footfall-enhanced|enrich-seo-metadata-enhanced'"

