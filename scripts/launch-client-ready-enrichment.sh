#!/bin/bash
# 🎯 CLIENT-READY FINAL NIGHT ENRICHMENT
# The most comprehensive overnight run possible

clear
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║        🎯 CLIENT-READY FINAL NIGHT ENRICHMENT 🎯                  ║"
echo "║                                                                    ║"
echo "║        LAST CHANCE TO MAXIMIZE DATABASE BEFORE DEMO!              ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 TONIGHT'S TARGETS:"
echo ""
echo "  🌐 WEBSITES:      1,149 locations → Discover 300-400 new sites"
echo "  🏪 TENANTS:       603 locations → Add 15,000-20,000 stores"
echo "     ├─ Tier 1:     129 (30+ stores each)"
echo "     ├─ Tier 2:     280 (15-29 stores each)"
echo "     └─ Tier 3:     194 (10-14 stores each)"
echo "  📞 PHONE:         1,009 locations → Google Places API"
echo "  📱 SOCIAL MEDIA:  600+ locations → All platforms"
echo "  🚗 OPERATIONAL:   900+ locations → Parking, EV, transit"
echo ""
echo "🎯 CLIENT DEMO OUTCOME:"
echo "  • 1,750+ locations with websites (67%)"
echo "  • 850+ locations with full tenant directories"
echo "  • 30,000+ tenants categorized for gap analysis"
echo "  • 2,000+ locations with phone numbers"
echo "  • 1,500+ social media profiles"
echo "  • Complete operational data"
echo ""
echo "⏱️  Estimated completion: 10-14 hours"
echo "🎉 Ready for client presentation by morning!"
echo ""
read -p "🚀 Press ENTER to launch the ultimate enrichment..."

cd /Users/mbeckett/Documents/codeprojects/flourish

# Set API key (use your own OpenAI API key from environment or .env file)
export OPENAI_API_KEY="${OPENAI_API_KEY:-your-openai-api-key-here}"

echo ""
echo "🚀 LAUNCHING 10 PARALLEL ENRICHMENT SCRIPTS..."
echo ""

# 1. WEBSITE DISCOVERY (Comprehensive with multiple fallbacks)
echo "🌐 1. WEBSITE DISCOVERY - 1,149 locations"
echo "   Strategy: Google Places + Pattern Matching + Manual Checks"
nohup pnpm tsx scripts/enrich-websites-comprehensive.ts > /tmp/final-websites.log 2>&1 &
PID1=$!
echo "   ✅ PID: $PID1"
sleep 3

# 2. TIER 1 TENANTS (30+ stores) - HIGHEST PRIORITY
echo ""
echo "🔥 2. TIER 1 TENANTS - 129 locations (30+ stores each)"
echo "   Strategy: Multiple URL patterns + AI + Fallbacks"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier1 > /tmp/final-tier1-tenants.log 2>&1 &
PID2=$!
echo "   ✅ PID: $PID2"
sleep 3

# 3. TIER 2 TENANTS (15-29 stores) - HIGH PRIORITY
echo ""
echo "🎯 3. TIER 2 TENANTS - 280 locations (15-29 stores each)"
echo "   Strategy: Multiple URL patterns + AI + Fallbacks"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier2 > /tmp/final-tier2-tenants.log 2>&1 &
PID3=$!
echo "   ✅ PID: $PID3"
sleep 3

# 4. TIER 3 TENANTS (10-14 stores) - MEDIUM PRIORITY
echo ""
echo "📍 4. TIER 3 TENANTS - 194 locations (10-14 stores each)"
echo "   Strategy: Multiple URL patterns + AI + Fallbacks"
nohup pnpm tsx scripts/enrich-tenants-comprehensive.ts tier3 > /tmp/final-tier3-tenants.log 2>&1 &
PID4=$!
echo "   ✅ PID: $PID4"
sleep 3

# 5. GOOGLE PLACES (Phone, Ratings, Hours)
echo ""
echo "📞 5. GOOGLE PLACES - 1,000+ locations"
echo "   Data: Phone numbers, ratings, reviews, hours"
nohup pnpm tsx scripts/enrich-google-places.ts > /tmp/final-google-places.log 2>&1 &
PID5=$!
echo "   ✅ PID: $PID5"
sleep 2

# 6. SOCIAL MEDIA v3 (All platforms, all detection methods)
echo ""
echo "📱 6. SOCIAL MEDIA - 600+ locations"
echo "   Platforms: Instagram, Facebook, Twitter, TikTok, YouTube"
echo "   Methods: Links + aria-labels + SVG + JSON-LD + Meta tags"
nohup pnpm tsx scripts/enrich-social-media-v3.ts > /tmp/final-social-media.log 2>&1 &
PID6=$!
echo "   ✅ PID: $PID6"
sleep 2

# 7. OPERATIONAL DETAILS (Smart AI extraction)
echo ""
echo "🚗 7. OPERATIONAL DATA - 900+ locations"
echo "   Data: Parking, EV charging, transit, floors, year opened"
nohup pnpm tsx scripts/enrich-operational-details.ts > /tmp/final-operational.log 2>&1 &
PID7=$!
echo "   ✅ PID: $PID7"
sleep 2

# 8. FACEBOOK DATA
echo ""
echo "👍 8. FACEBOOK DATA - Ratings & Reviews"
nohup pnpm tsx scripts/enrich-facebook-data.ts > /tmp/final-facebook.log 2>&1 &
PID8=$!
echo "   ✅ PID: $PID8"
sleep 2

# 9. SEO METADATA
echo ""
echo "🔍 9. SEO METADATA - Keywords & Top Pages"
nohup pnpm tsx scripts/enrich-seo-metadata.ts > /tmp/final-seo.log 2>&1 &
PID9=$!
echo "   ✅ PID: $PID9"
sleep 2

# 10. HOUSEHOLD INCOME (Demographics)
echo ""
echo "💰 10. DEMOGRAPHICS - Household Income"
nohup pnpm tsx scripts/enrich-household-income.ts > /tmp/final-demographics.log 2>&1 &
PID10=$!
echo "   ✅ PID: $PID10"

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║          ✅ ALL 10 ENRICHMENT SCRIPTS LAUNCHED! ✅                ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 PROCESS IDs:"
echo "   1. Websites:       $PID1"
echo "   2. Tier 1 Tenants: $PID2"
echo "   3. Tier 2 Tenants: $PID3"
echo "   4. Tier 3 Tenants: $PID4"
echo "   5. Google Places:  $PID5"
echo "   6. Social Media:   $PID6"
echo "   7. Operational:    $PID7"
echo "   8. Facebook:       $PID8"
echo "   9. SEO:            $PID9"
echo "   10. Demographics:  $PID10"
echo ""
echo "═".repeat(70)
echo ""
echo "🎯 EXPECTED RESULTS BY MORNING:"
echo ""
echo "   📊 DATABASE TRANSFORMATION:"
echo "      • Websites:      1,477 → 1,750+ (+18%)"
echo "      • Tenants:       276 → 850+ locations (+208%)"
echo "      • Total Stores:  11,466 → 30,000+ (+162%)"
echo "      • Phone Numbers: 468 → 1,400+ (+199%)"
echo "      • Social Links:  2,544 → 4,000+ (+57%)"
echo ""
echo "   🎯 CLIENT DEMO METRICS:"
echo "      ✓ 67% website coverage (industry-leading)"
echo "      ✓ 850+ tenant directories (10x competitors)"
echo "      ✓ 30,000+ categorized stores (gap analysis ready)"
echo "      ✓ Complete operational data"
echo "      ✓ Comprehensive social media presence"
echo ""
echo "═".repeat(70)
echo ""
echo "📱 MONITORING:"
echo "   Quick status:    bash scripts/check-client-ready-progress.sh"
echo "   Full dashboard:  watch -n 30 bash scripts/check-client-ready-progress.sh"
echo ""
echo "📝 INDIVIDUAL LOGS:"
echo "   tail -f /tmp/final-websites.log"
echo "   tail -f /tmp/final-tier1-tenants.log"
echo "   tail -f /tmp/final-tier2-tenants.log"
echo "   tail -f /tmp/final-tier3-tenants.log"
echo "   tail -f /tmp/final-google-places.log"
echo "   tail -f /tmp/final-social-media.log"
echo "   tail -f /tmp/final-operational.log"
echo ""
echo "⏸️  TO PAUSE ALL:"
echo "   pkill -f 'enrich-'"
echo ""
echo "═".repeat(70)
echo ""
echo "🎉 GOOD LUCK WITH THE CLIENT PRESENTATION!"
echo "🌙 Check back in the morning for amazing results!"
echo ""

