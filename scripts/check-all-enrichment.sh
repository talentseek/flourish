#!/bin/bash
# Comprehensive Enrichment Status Dashboard

echo "🚀 PARALLEL ENRICHMENT DASHBOARD"
echo "=================================="
echo ""

# Check running processes
TENANT_RUNNING=$(pgrep -f "enrich-tenants-overnight" | wc -l)
SOCIAL_RUNNING=$(pgrep -f "enrich-parallel-social" | wc -l)
OPERATIONAL_RUNNING=$(pgrep -f "enrich-parallel-operational" | wc -l)
WEBSITE_RUNNING=$(pgrep -f "enrich-parallel-websites" | wc -l)

echo "📊 ACTIVE PROCESSES:"
if [ "$TENANT_RUNNING" -gt 0 ]; then
    echo "  ✅ Tenant Enrichment: RUNNING"
else
    echo "  ⏹️  Tenant Enrichment: STOPPED"
fi

if [ "$SOCIAL_RUNNING" -gt 0 ]; then
    echo "  ✅ Social Media: RUNNING"
else
    echo "  ⏹️  Social Media: STOPPED"
fi

if [ "$OPERATIONAL_RUNNING" -gt 0 ]; then
    echo "  ✅ Operational: RUNNING"
else
    echo "  ⏹️  Operational: STOPPED"
fi

if [ "$WEBSITE_RUNNING" -gt 0 ]; then
    echo "  ✅ Website Discovery: RUNNING"
else
    echo "  ⏹️  Website Discovery: STOPPED"
fi

echo ""
echo "=" | head -c 50
echo ""

# Tenant enrichment progress
if [ -f /tmp/tenant-enrichment-progress.json ]; then
    echo "🏪 TENANT ENRICHMENT:"
    SUCCESS=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"successCount":[0-9]*' | grep -o '[0-9]*' | head -1)
    FAILED=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"failCount":[0-9]*' | grep -o '[0-9]*' | head -1)
    STORES=$(cat /tmp/tenant-enrichment-progress.json 2>/dev/null | grep -o '"totalStoresAdded":[0-9]*' | grep -o '[0-9]*' | head -1)
    
    if [ ! -z "$SUCCESS" ]; then
        TOTAL=$((SUCCESS + FAILED))
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Locations: $SUCCESS success, $FAILED failed ($RATE%)"
        echo "  Stores: $STORES added"
    fi
    
    CURRENT=$(tail -50 /tmp/tenant-enrichment-final.log 2>/dev/null | grep "^\[" | tail -1)
    echo "  Current: $CURRENT"
fi

echo ""
echo "=" | head -c 50
echo ""

# Social media progress
if [ -f /tmp/social-enrichment.log ]; then
    echo "📱 SOCIAL MEDIA ENRICHMENT:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/social-enrichment.log 2>/dev/null)
    FAILED=$(grep -c "⚠️  No social" /tmp/social-enrichment.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Success: $SUCCESS/$TOTAL ($RATE%)"
    fi
    CURRENT=$(tail -5 /tmp/social-enrichment.log 2>/dev/null | grep "^\[" | tail -1)
    echo "  Current: $CURRENT"
fi

echo ""
echo "=" | head -c 50
echo ""

# Operational progress
if [ -f /tmp/operational-enrichment.log ]; then
    echo "🚗 OPERATIONAL ENRICHMENT:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/operational-enrichment.log 2>/dev/null)
    FAILED=$(grep -c "⚠️  No operational" /tmp/operational-enrichment.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Success: $SUCCESS/$TOTAL ($RATE%)"
    fi
    CURRENT=$(tail -5 /tmp/operational-enrichment.log 2>/dev/null | grep "^\[" | tail -1)
    echo "  Current: $CURRENT"
fi

echo ""
echo "=" | head -c 50
echo ""

# Website discovery progress
if [ -f /tmp/website-discovery-parallel.log ]; then
    echo "🌐 WEBSITE DISCOVERY:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/website-discovery-parallel.log 2>/dev/null)
    FAILED=$(grep -c "❌ Not found" /tmp/website-discovery-parallel.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Success: $SUCCESS/$TOTAL ($RATE%)"
    fi
    CURRENT=$(tail -5 /tmp/website-discovery-parallel.log 2>/dev/null | grep "^\[" | tail -1)
    echo "  Current: $CURRENT"
fi

echo ""
echo "=" | head -c 50
echo ""

echo "💡 COMMANDS:"
echo "  Watch tenants:     tail -f /tmp/tenant-enrichment-final.log"
echo "  Watch social:      tail -f /tmp/social-enrichment.log"
echo "  Watch operational: tail -f /tmp/operational-enrichment.log"
echo "  Watch websites:    tail -f /tmp/website-discovery-parallel.log"
echo "  Check progress:    bash scripts/check-all-enrichment.sh"

