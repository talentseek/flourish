#!/bin/bash
# Monitor smart overnight enrichment

clear
echo "═══════════════════════════════════════════════════════════════════"
echo "         🧠 SMART OVERNIGHT ENRICHMENT PROGRESS 🧠"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check if running
RUNNING=$(pgrep -f "enrich-smart-tenants" | wc -l)

if [ "$RUNNING" -gt 0 ]; then
    echo "✅ STATUS: RUNNING"
else
    echo "⏹️  STATUS: STOPPED"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Read progress from JSON file
if [ -f /tmp/smart-tenants-progress.json ]; then
    echo "📊 PROGRESS FROM CHECKPOINT FILE:"
    
    SUCCESS=$(grep -o '"successCount":[0-9]*' /tmp/smart-tenants-progress.json | grep -o '[0-9]*')
    FAILED=$(grep -o '"failedCount":[0-9]*' /tmp/smart-tenants-progress.json | grep -o '[0-9]*')
    STORES=$(grep -o '"totalStoresAdded":[0-9]*' /tmp/smart-tenants-progress.json | grep -o '[0-9]*')
    PROCESSED=$(grep -o '"processedIds":\[' /tmp/smart-tenants-progress.json | wc -l)
    
    if [ ! -z "$SUCCESS" ] && [ ! -z "$FAILED" ]; then
        TOTAL=$((SUCCESS + FAILED))
        RATE=$((SUCCESS * 100 / TOTAL))
        
        echo "   Processed: $TOTAL/603 locations"
        echo "   ✅ Success: $SUCCESS ($RATE%)"
        echo "   ❌ Failed: $FAILED"
        echo "   🏪 Total stores added: $STORES"
        echo ""
        
        # Calculate progress bar
        PCT=$((TOTAL * 100 / 603))
        BARS=$((PCT / 2))
        printf "   Progress: ["
        for i in $(seq 1 50); do
            if [ $i -le $BARS ]; then
                printf "█"
            else
                printf "░"
            fi
        done
        printf "] $PCT%%\n"
    fi
    
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Show last few log entries
if [ -f /tmp/smart-tenants-overnight.log ]; then
    echo "📝 RECENT ACTIVITY:"
    echo ""
    
    # Get current location being processed
    CURRENT=$(tail -20 /tmp/smart-tenants-overnight.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "   $CURRENT"
    fi
    
    # Get last success
    LAST_SUCCESS=$(tail -100 /tmp/smart-tenants-overnight.log 2>/dev/null | grep "✅ Saved" | tail -1)
    if [ ! -z "$LAST_SUCCESS" ]; then
        echo "   $LAST_SUCCESS"
    fi
    
    echo ""
    
    # Show last checkpoint if any
    CHECKPOINT=$(grep "CHECKPOINT" /tmp/smart-tenants-overnight.log 2>/dev/null | tail -1)
    if [ ! -z "$CHECKPOINT" ]; then
        echo "📊 LAST CHECKPOINT:"
        tail -100 /tmp/smart-tenants-overnight.log 2>/dev/null | grep -A 5 "CHECKPOINT" | tail -6
        echo ""
    fi
fi

echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Calculate estimated completion
if [ -f /tmp/smart-tenants-progress.json ] && [ ! -z "$SUCCESS" ] && [ ! -z "$FAILED" ]; then
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 10 ]; then
        # Calculate time per location
        if [ -f /tmp/smart-tenants-overnight.log ]; then
            START_TIME=$(stat -f %B /tmp/smart-tenants-overnight.log 2>/dev/null || stat -c %Y /tmp/smart-tenants-overnight.log 2>/dev/null)
            NOW=$(date +%s)
            ELAPSED_MIN=$(( (NOW - START_TIME) / 60 ))
            
            if [ $ELAPSED_MIN -gt 0 ]; then
                TIME_PER_LOC=$(( ELAPSED_MIN / TOTAL ))
                REMAINING=$(( 603 - TOTAL ))
                EST_REMAINING_MIN=$(( REMAINING * TIME_PER_LOC ))
                EST_REMAINING_HOURS=$(( EST_REMAINING_MIN / 60 ))
                
                echo "⏱️  TIMING:"
                echo "   Elapsed: $ELAPSED_MIN minutes"
                echo "   Avg per location: $TIME_PER_LOC minutes"
                echo "   Est. remaining: $EST_REMAINING_HOURS hours $((EST_REMAINING_MIN % 60)) minutes"
                echo ""
            fi
        fi
    fi
fi

echo "💡 COMMANDS:"
echo "   Refresh:       bash scripts/check-smart-progress.sh"
echo "   Auto-refresh:  watch -n 60 bash scripts/check-smart-progress.sh"
echo "   Watch live:    tail -f /tmp/smart-tenants-overnight.log"
echo "   Pause:         pkill -f 'enrich-smart-tenants'"
echo ""

if [ "$RUNNING" -gt 0 ]; then
    echo "🌙 Script is running! Check back later or leave it overnight!"
else
    echo "⚠️  Script has stopped. Check log for completion message."
fi
echo ""

