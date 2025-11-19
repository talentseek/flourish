#!/bin/bash
# 🚀 PARALLEL ENRICHMENT RUNNER
# Runs all enrichment scrapers in parallel (except Facebook)

echo "🚀 PARALLEL ENRICHMENT RUNNER"
echo "======================================"
echo ""
echo "Running scrapers in parallel:"
echo "  • Anchor Tenants"
echo "  • Enhanced Website Discovery"
echo "  • Google Places Re-enrichment"
echo "  • Owner/Management"
echo "  • Footfall"
echo "  • Comprehensive Operational"
echo ""
echo "Skipping: Facebook (requires API or manual review)"
echo ""
read -p "Press ENTER to start all enrichment scripts..."

cd /Users/mbeckett/Documents/codeprojects/flourish

echo ""
echo "🚀 LAUNCHING ALL ENRICHMENT SCRIPTS..."
echo ""

# 1. ANCHOR TENANT EXTRACTOR
echo "⭐ 1. ANCHOR TENANT EXTRACTOR"
nohup pnpm tsx scripts/enrich-anchor-tenants.ts > /tmp/anchor-tenants.log 2>&1 &
PID1=$!
echo "   ✅ Started (PID: $PID1)"
sleep 2

# 2. ENHANCED WEBSITE DISCOVERY
echo "🌐 2. ENHANCED WEBSITE DISCOVERY"
nohup pnpm tsx scripts/enrich-websites-enhanced.ts > /tmp/websites-enhanced.log 2>&1 &
PID2=$!
echo "   ✅ Started (PID: $PID2)"
sleep 2

# 3. GOOGLE PLACES RE-ENRICHMENT
echo "📍 3. GOOGLE PLACES RE-ENRICHMENT"
nohup pnpm tsx scripts/enrich-google-places-new-websites.ts > /tmp/google-places-re.log 2>&1 &
PID3=$!
echo "   ✅ Started (PID: $PID3)"
sleep 2

# 4. OWNER/MANAGEMENT SCRAPER
echo "🏢 4. OWNER/MANAGEMENT SCRAPER"
nohup pnpm tsx scripts/enrich-ownership.ts > /tmp/ownership.log 2>&1 &
PID4=$!
echo "   ✅ Started (PID: $PID4)"
sleep 2

# 5. FOOTFALL SCRAPER
echo "👥 5. FOOTFALL SCRAPER"
nohup pnpm tsx scripts/enrich-footfall.ts > /tmp/footfall.log 2>&1 &
PID5=$!
echo "   ✅ Started (PID: $PID5)"
sleep 2

# 6. COMPREHENSIVE OPERATIONAL SCRAPER
echo "🔧 6. COMPREHENSIVE OPERATIONAL SCRAPER"
nohup pnpm tsx scripts/enrich-operational-comprehensive.ts > /tmp/operational-comprehensive.log 2>&1 &
PID6=$!
echo "   ✅ Started (PID: $PID6)"
sleep 2

echo ""
echo "✅ ALL SCRIPTS STARTED!"
echo ""
echo "📊 Process IDs:"
echo "   Anchor Tenants: $PID1"
echo "   Enhanced Websites: $PID2"
echo "   Google Places Re: $PID3"
echo "   Ownership: $PID4"
echo "   Footfall: $PID5"
echo "   Operational: $PID6"
echo ""
echo "📝 Log Files:"
echo "   /tmp/anchor-tenants.log"
echo "   /tmp/websites-enhanced.log"
echo "   /tmp/google-places-re.log"
echo "   /tmp/ownership.log"
echo "   /tmp/footfall.log"
echo "   /tmp/operational-comprehensive.log"
echo ""
echo "🔍 Monitor progress:"
echo "   tail -f /tmp/anchor-tenants.log"
echo "   tail -f /tmp/websites-enhanced.log"
echo "   tail -f /tmp/google-places-re.log"
echo "   tail -f /tmp/ownership.log"
echo "   tail -f /tmp/footfall.log"
echo "   tail -f /tmp/operational-comprehensive.log"
echo ""
echo "🛑 To stop all processes:"
echo "   pkill -f 'enrich-anchor-tenants'"
echo "   pkill -f 'enrich-websites-enhanced'"
echo "   pkill -f 'enrich-google-places-new-websites'"
echo "   pkill -f 'enrich-ownership'"
echo "   pkill -f 'enrich-footfall'"
echo "   pkill -f 'enrich-operational-comprehensive'"
echo ""
echo "Or stop all at once:"
echo "   pkill -f 'enrich-anchor-tenants|enrich-websites-enhanced|enrich-google-places-new-websites|enrich-ownership|enrich-footfall|enrich-operational-comprehensive'"
echo ""

