#!/bin/bash
# Monitor emergency tenant enrichment

clear
echo "🚨 EMERGENCY TENANT ENRICHMENT PROGRESS"
echo "========================================"
echo ""

# Check if running
RUNNING=$(pgrep -f "enrich-emergency-tenants" | wc -l)

if [ "$RUNNING" -gt 0 ]; then
    echo "✅ STATUS: RUNNING"
else
    echo "⏹️  STATUS: STOPPED"
fi

echo ""

# Get current progress from log
if [ -f /tmp/emergency-tenants.log ]; then
    echo "📊 PROGRESS:"
    CURRENT=$(tail -5 /tmp/emergency-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    echo "   $CURRENT"
    
    SUCCESS=$(grep -c "✅ Found" /tmp/emergency-tenants.log 2>/dev/null)
    FAILED=$(grep -c "❌ No stores" /tmp/emergency-tenants.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    
    echo ""
    echo "   Success: $SUCCESS"
    echo "   Failed: $FAILED"
    echo "   Total processed: $TOTAL/100"
    
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "   Success rate: $RATE%"
    fi
    
    echo ""
    
    # Get stores added from checkpoints
    STORES=$(grep "Total stores added:" /tmp/emergency-tenants.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    if [ ! -z "$STORES" ]; then
        echo "🏪 STORES ADDED: $STORES"
        echo ""
    fi
fi

echo "========================================"
echo ""
echo "💡 COMMANDS:"
echo "   Watch live:  tail -f /tmp/emergency-tenants.log"
echo "   Check again: bash scripts/check-emergency-progress.sh"
echo ""

if [ "$RUNNING" -gt 0 ]; then
    ELAPSED=$(($(date +%s) - $(stat -f %B /tmp/emergency-tenants.log)))
    MIN=$((ELAPSED / 60))
    echo "⏱️  Running for: $MIN minutes"
    echo "⏱️  Est. completion: ~120 minutes total"
    echo ""
fi

