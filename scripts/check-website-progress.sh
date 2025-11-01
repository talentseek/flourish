#!/bin/bash
# Quick Website Discovery Progress Checker

echo "🌙 WEBSITE DISCOVERY PROGRESS"
echo "=============================="
echo ""

# Check if still running
if pgrep -f "enrich-websites-overnight.ts" > /dev/null 2>&1; then
    echo "✅ Status: RUNNING"
else
    echo "⏹️  Status: COMPLETED or STOPPED"
fi

echo ""

# Read progress file
if [ -f /tmp/website-discovery-progress.json ]; then
    echo "📊 CURRENT PROGRESS (from save file):"
    SUCCESS=$(cat /tmp/website-discovery-progress.json | grep -o '"successCount":[0-9]*' | grep -o '[0-9]*')
    FAILED=$(cat /tmp/website-discovery-progress.json | grep -o '"failCount":[0-9]*' | grep -o '[0-9]*')
    COMPLETED=$(cat /tmp/website-discovery-progress.json | grep -o '"completed":\[' | wc -l)
    
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "   ✅ Success: $SUCCESS ($RATE%)"
        echo "   ❌ Failed:  $FAILED"
        echo "   📈 Total:   $TOTAL processed"
    fi
    echo ""
fi

# Show recent activity
echo "📝 RECENT ACTIVITY (last 15 lines):"
tail -15 /tmp/website-discovery-overnight.log 2>/dev/null | grep -E "^\[|✅|❌|CHECKPOINT"

echo ""
echo "⏱️  LOG INFO:"
if [ -f /tmp/website-discovery-overnight.log ]; then
    LINES=$(wc -l < /tmp/website-discovery-overnight.log)
    echo "   Log file: /tmp/website-discovery-overnight.log"
    echo "   Lines: $LINES"
fi

echo ""
echo "💡 COMMANDS:"
echo "   tail -f /tmp/website-discovery-overnight.log    # Watch live"
echo "   bash scripts/check-website-progress.sh          # Check progress"
echo "   pkill -f enrich-websites-overnight.ts           # Stop it"
echo "   cat /tmp/website-discovery-progress.json         # See full progress"

