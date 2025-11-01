#!/bin/bash
# Tenant Enrichment Progress Checker

echo "🏪 TENANT ENRICHMENT PROGRESS"
echo "=============================="
echo ""

# Check if still running
if pgrep -f "enrich-tenants-overnight.ts" > /dev/null 2>&1; then
    echo "✅ Status: RUNNING"
else
    echo "⏹️  Status: COMPLETED or STOPPED"
fi

echo ""

# Read progress file
if [ -f /tmp/tenant-enrichment-progress.json ]; then
    echo "📊 CURRENT PROGRESS (from save file):"
    SUCCESS=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"successCount":[0-9]*' | grep -o '[0-9]*' | head -1)
    FAILED=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"failCount":[0-9]*' | grep -o '[0-9]*' | head -1)
    STORES=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"totalStoresAdded":[0-9]*' | grep -o '[0-9]*' | head -1)
    
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "   ✅ Success: $SUCCESS ($RATE%)"
        echo "   ❌ Failed:  $FAILED"
        echo "   🏪 Stores:  $STORES added"
        echo "   📈 Total:   $TOTAL processed"
    fi
    echo ""
fi

# Show recent activity
echo "📝 RECENT ACTIVITY (last 20 lines):"
tail -20 /tmp/tenant-enrichment-overnight.log 2>/dev/null | grep -E "^\[|✅ Saved|❌ No stores|CHECKPOINT"

echo ""
echo "⏱️  LOG INFO:"
if [ -f /tmp/tenant-enrichment-overnight.log ]; then
    LINES=$(wc -l < /tmp/tenant-enrichment-overnight.log 2>/dev/null)
    echo "   Log file: /tmp/tenant-enrichment-overnight.log"
    echo "   Lines: $LINES"
fi

echo ""
echo "💡 COMMANDS:"
echo "   tail -f /tmp/tenant-enrichment-overnight.log    # Watch live"
echo "   bash scripts/check-tenant-progress.sh           # Check progress"
echo "   pkill -f enrich-tenants-overnight.ts            # Stop it"
echo "   cat /tmp/tenant-enrichment-progress.json         # See full progress"

