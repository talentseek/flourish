#!/bin/bash
# 🚀 ULTIMATE COMPREHENSIVE ENRICHMENT
# Every possible data point with multiple fallback strategies

echo "🚀 ULTIMATE COMPREHENSIVE ENRICHMENT"
echo "======================================"
echo ""
echo "This will run EVERYTHING with multiple fallback strategies:"
echo "  • Website discovery (Google + Bing + patterns)"
echo "  • Tenant scraping (multiple URL patterns + AI)"
echo "  • Google Places (phone, ratings, hours)"
echo "  • Social media (all platforms, all methods)"
echo "  • Operational data (parking, EV, transit, floors)"
echo "  • SEO metadata"
echo ""
echo "Expected completion: 12-16 hours"
echo ""
read -p "Press ENTER to launch all enrichment scripts..."

cd /Users/mbeckett/Documents/codeprojects/flourish

# Set API key (use your own OpenAI API key from environment or .env file)
export OPENAI_API_KEY="${OPENAI_API_KEY:-your-openai-api-key-here}"

echo ""
echo "🚀 LAUNCHING ALL ENRICHMENT SCRIPTS..."
echo ""

# 1. COMPREHENSIVE WEBSITE DISCOVERY
echo "🌐 1. COMPREHENSIVE WEBSITE DISCOVERY (1,149 locations)"
echo "   Methods: Google Places + Pattern Matching + Manual Checks"
nohup pnpm tsx scripts/enrich-websites-comprehensive.ts > /tmp/websites-comprehensive.log 2>&1 &
PID1=$!
echo "   ✅ Started (PID: $PID1)"
sleep 3

# 2. TIER 1 TENANT ENRICHMENT (Comprehensive with fallbacks)
echo "🎯 2. TIER 1 TENANTS - 30+ stores (129 locations)"
echo "   Methods: Multiple URL patterns + AI scraping + Homepage fallback"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier1 > /tmp/tenants-tier1-comprehensive.log 2>&1 &
PID2=$!
echo "   ✅ Started (PID: $PID2)"
sleep 3

# 3. TIER 2 TENANT ENRICHMENT
echo "🎯 3. TIER 2 TENANTS - 15-29 stores (280 locations)"
echo "   Methods: Multiple URL patterns + AI scraping + Homepage fallback"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier2 > /tmp/tenants-tier2-comprehensive.log 2>&1 &
PID3=$!
echo "   ✅ Started (PID: $PID3)"
sleep 3

# 4. TIER 3 TENANT ENRICHMENT
echo "🎯 4. TIER 3 TENANTS - 10-14 stores (194 locations)"
echo "   Methods: Multiple URL patterns + AI scraping + Homepage fallback"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier3 > /tmp/tenants-tier3-comprehensive.log 2>&1 &
PID4=$!
echo "   ✅ Started (PID: $PID4)"
sleep 3

# 5. GOOGLE PLACES ENRICHMENT
echo "📍 5. GOOGLE PLACES - Phone, Ratings, Hours (1,000+ locations)"
nohup pnpm tsx scripts/enrich-google-places.ts > /tmp/google-places-comprehensive.log 2>&1 &
PID5=$!
echo "   ✅ Started (PID: $PID5)"
sleep 2

# 6. SOCIAL MEDIA ENRICHMENT v3 (all detection methods)
echo "📱 6. SOCIAL MEDIA - Instagram, Facebook, Twitter, TikTok, YouTube (600+ locations)"
echo "   Methods: Standard links + aria-labels + SVG patterns + JSON-LD + Meta tags"
nohup pnpm tsx scripts/enrich-social-media-v3.ts > /tmp/social-comprehensive.log 2>&1 &
PID6=$!
echo "   ✅ Started (PID: $PID6)"
sleep 2

# 7. OPERATIONAL ENRICHMENT (smart scraping)
echo "🚗 7. OPERATIONAL - Parking, EV, Transit, Floors, Year (900+ locations)"
echo "   Methods: Smart AI extraction from website content"
nohup pnpm tsx scripts/enrich-operational-details.ts > /tmp/operational-comprehensive.log 2>&1 &
PID7=$!
echo "   ✅ Started (PID: $PID7)"
sleep 2

# 8. SEO METADATA
echo "🔍 8. SEO METADATA - Keywords, Top Pages (600+ locations)"
nohup pnpm tsx scripts/enrich-seo-metadata.ts > /tmp/seo-comprehensive.log 2>&1 &
PID8=$!
echo "   ✅ Started (PID: $PID8)"
sleep 2

# 9. FACEBOOK DATA (ratings & reviews)
echo "👍 9. FACEBOOK - Ratings & Reviews (400+ locations)"
nohup pnpm tsx scripts/enrich-facebook-data.ts > /tmp/facebook-comprehensive.log 2>&1 &
PID9=$!
echo "   ✅ Started (PID: $PID9)"

echo ""
echo "=" | head -c 70
echo ""
echo "✅ ALL 9 ENRICHMENT SCRIPTS LAUNCHED!"
echo ""
echo "PIDs: $PID1 $PID2 $PID3 $PID4 $PID5 $PID6 $PID7 $PID8 $PID9"
echo ""
echo "📊 WHAT'S RUNNING:"
echo "  1. Website Discovery (Google + patterns)"
echo "  2. Tier 1 Tenants (30+ stores)"
echo "  3. Tier 2 Tenants (15-29 stores)"
echo "  4. Tier 3 Tenants (10-14 stores)"
echo "  5. Google Places (phone, ratings, hours)"
echo "  6. Social Media (all platforms)"
echo "  7. Operational (parking, EV, transit)"
echo "  8. SEO Metadata"
echo "  9. Facebook Data"
echo ""
echo "🎯 TARGET COVERAGE:"
echo "  • Websites: +30-40% (1,149 → ~1,600)"
echo "  • Tenants: +600 locations (+20,000 stores)"
echo "  • Phone numbers: +1,000 locations"
echo "  • Social media: +600 locations"
echo "  • Operational: +900 locations"
echo ""
echo "💡 MONITOR WITH:"
echo "  bash scripts/check-ultimate-progress.sh"
echo ""
echo "📝 INDIVIDUAL LOGS:"
echo "  tail -f /tmp/websites-comprehensive.log"
echo "  tail -f /tmp/tenants-tier1-comprehensive.log"
echo "  tail -f /tmp/tenants-tier2-comprehensive.log"
echo "  tail -f /tmp/tenants-tier3-comprehensive.log"
echo "  tail -f /tmp/google-places-comprehensive.log"
echo "  tail -f /tmp/social-comprehensive.log"
echo "  tail -f /tmp/operational-comprehensive.log"
echo "  tail -f /tmp/seo-comprehensive.log"
echo "  tail -f /tmp/facebook-comprehensive.log"
echo ""
echo "⏸️  TO PAUSE ALL:"
echo "  pkill -f 'enrich-'"
echo ""
echo "🎉 Good luck! Check back in 12-16 hours!"
echo ""

