#!/bin/bash
# Launch ALL enrichment scripts in parallel to fill remaining gaps

echo "🌙 LAUNCHING COMPLETE OVERNIGHT ENRICHMENT"
echo "==========================================="
echo ""

cd /Users/mbeckett/Documents/codeprojects/flourish

# Set API key (use your own OpenAI API key from environment or .env file)
export OPENAI_API_KEY="${OPENAI_API_KEY:-your-openai-api-key-here}"

echo "Starting enrichment scripts in parallel..."
echo ""

# 1. TIER 2 TENANT ENRICHMENT (15-29 stores) - HIGH PRIORITY
echo "🎯 1. TIER 2 TENANT ENRICHMENT (15-29 stores, 282 locations)"
nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier2 > /tmp/tier2-tenants.log 2>&1 &
echo "   ✅ Started (PID: $!)"
sleep 2

# 2. TIER 3 TENANT ENRICHMENT (10-14 stores)
echo "🎯 2. TIER 3 TENANT ENRICHMENT (10-14 stores)"
nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier12 > /tmp/tier3-tenants.log 2>&1 &
echo "   ✅ Started (PID: $!)"
sleep 2

# 3. SOCIAL MEDIA (remaining gaps)
echo "📱 3. SOCIAL MEDIA ENRICHMENT (remaining 600+ locations)"
nohup pnpm tsx scripts/enrich-parallel-social.ts > /tmp/social-final.log 2>&1 &
echo "   ✅ Started (PID: $!)"
sleep 2

# 4. OPERATIONAL (remaining gaps)
echo "🚗 4. OPERATIONAL ENRICHMENT (remaining 900+ locations)"
nohup pnpm tsx scripts/enrich-parallel-operational.ts > /tmp/operational-final.log 2>&1 &
echo "   ✅ Started (PID: $!)"
sleep 2

# 5. GOOGLE PLACES (phone, ratings, hours)
echo "📍 5. GOOGLE PLACES ENRICHMENT (1,000+ locations)"
nohup pnpm tsx scripts/enrich-google-places.ts > /tmp/google-places-final.log 2>&1 &
echo "   ✅ Started (PID: $!)"
sleep 3

echo ""
echo "=" | head -c 60
echo ""
echo "✅ ALL 5 ENRICHMENT SCRIPTS LAUNCHED!"
echo ""
echo "Expected completion: 8-12 hours"
echo ""
echo "Monitor with:"
echo "  bash scripts/check-overnight-complete.sh"
echo ""
echo "Logs:"
echo "  /tmp/tier2-tenants.log"
echo "  /tmp/tier3-tenants.log"
echo "  /tmp/social-final.log"
echo "  /tmp/operational-final.log"
echo "  /tmp/google-places-final.log"
echo ""

