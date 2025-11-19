#!/bin/bash
# Safely pause all enrichment scripts

echo "⏸️  PAUSING ALL ENRICHMENT SCRIPTS"
echo "=================================="
echo ""

# Stop all enrichment processes
echo "Stopping processes..."

pkill -f "enrich-tenants-overnight"
sleep 1
pkill -f "enrich-parallel-social"
sleep 1
pkill -f "enrich-parallel-operational"
sleep 1
pkill -f "enrich-parallel-websites"
sleep 2

echo "✅ All processes stopped"
echo ""

# Show what was saved
echo "📊 PROGRESS SAVED:"
echo ""

if [ -f /tmp/tenant-enrichment-progress.json ]; then
    echo "🏪 TENANT ENRICHMENT:"
    SUCCESS=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"successCount":[0-9]*' | grep -o '[0-9]*' | head -1)
    STORES=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"totalStoresAdded":[0-9]*' | grep -o '[0-9]*' | head -1)
    echo "  ✅ Saved: $SUCCESS locations enriched, $STORES stores added"
    echo "  📁 Progress file: /tmp/tenant-enrichment-progress.json"
fi

echo ""

if [ -f /tmp/social-enrichment.log ]; then
    SOCIAL=$(grep -c "✅ Found:" /tmp/social-enrichment.log 2>/dev/null)
    echo "📱 SOCIAL MEDIA ENRICHMENT:"
    echo "  ✅ Saved: $SOCIAL locations enriched"
    echo "  📁 Log file: /tmp/social-enrichment.log"
fi

echo ""

if [ -f /tmp/operational-enrichment.log ]; then
    OPERATIONAL=$(grep -c "✅ Found:" /tmp/operational-enrichment.log 2>/dev/null)
    echo "🚗 OPERATIONAL ENRICHMENT:"
    echo "  ✅ Saved: $OPERATIONAL locations enriched"
    echo "  📁 Log file: /tmp/operational-enrichment.log"
fi

echo ""

if [ -f /tmp/website-discovery-parallel.log ]; then
    WEBSITES=$(grep -c "✅ Found:" /tmp/website-discovery-parallel.log 2>/dev/null)
    echo "🌐 WEBSITE DISCOVERY:"
    echo "  ✅ Saved: $WEBSITES websites discovered"
    echo "  📁 Log file: /tmp/website-discovery-parallel.log"
fi

echo ""
echo "=" | head -c 50
echo ""
echo "💡 ALL PROGRESS IS SAVED!"
echo ""
echo "When you return, run:"
echo "  bash scripts/resume-all-enrichment.sh"
echo ""
echo "Or manually restart individual scripts:"
echo "  cd /Users/mbeckett/Documents/codeprojects/flourish"
echo "  export OPENAI_API_KEY=\"your_key\""
echo "  nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier1 &"
echo "  nohup pnpm tsx scripts/enrich-parallel-social.ts &"
echo "  nohup pnpm tsx scripts/enrich-parallel-operational.ts &"
echo "  nohup pnpm tsx scripts/enrich-parallel-websites.ts &"
echo ""

