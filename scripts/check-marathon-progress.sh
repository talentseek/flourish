#!/bin/bash
# Quick Marathon Progress Checker

echo "🏃‍♂️ ENRICHMENT MARATHON PROGRESS"
echo "=================================="
echo ""

# Check if still running
if pgrep -f "enrich-marathon.ts" > /dev/null; then
    echo "✅ Status: RUNNING"
else
    echo "⏹️  Status: COMPLETED or STOPPED"
fi

echo ""
echo "📊 PHASE 1: Tenant Scraping"
echo "--------------------------"
grep -E "^\[.*\]" /tmp/enrichment-marathon.log 2>/dev/null | tail -1
echo ""
echo "Last 5 completed:"
grep "SUCCESS! Found" /tmp/enrichment-marathon.log 2>/dev/null | tail -5
echo ""
echo "Success rate:"
SUCCESS=$(grep -c "SUCCESS! Found" /tmp/enrichment-marathon.log 2>/dev/null || echo 0)
FAILED=$(grep -c "No stores found\|ERROR:" /tmp/enrichment-marathon.log 2>/dev/null || echo 0)
TOTAL=$((SUCCESS + FAILED))
if [ $TOTAL -gt 0 ]; then
    RATE=$((SUCCESS * 100 / TOTAL))
    echo "   ✅ Success: $SUCCESS"
    echo "   ❌ Failed:  $FAILED"
    echo "   📈 Rate:    $RATE%"
fi

echo ""
echo "📊 PHASE 2: Operational Enrichment"
echo "-----------------------------------"
if grep -q "PHASE 2" /tmp/enrichment-marathon.log 2>/dev/null; then
    echo "✅ Phase 2 started"
    grep "PHASE 2" /tmp/enrichment-marathon.log 2>/dev/null | tail -10
else
    echo "⏳ Not started yet (still on Phase 1)"
fi

echo ""
echo "⏱️  Runtime"
echo "----------"
if [ -f /tmp/enrichment-marathon.log ]; then
    START_TIME=$(head -5 /tmp/enrichment-marathon.log | grep "Started at:" | sed 's/Started at: //')
    echo "Started: $START_TIME"
    echo "Current: $(date)"
fi

echo ""
echo "💡 Commands:"
echo "   tail -f /tmp/enrichment-marathon.log    # Watch live"
echo "   bash scripts/check-marathon-progress.sh # Check progress"
echo "   pkill -f enrich-marathon.ts             # Stop it"

