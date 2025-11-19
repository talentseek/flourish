#!/bin/bash
# Monitor complete overnight enrichment

echo "🌙 OVERNIGHT COMPLETE ENRICHMENT STATUS"
echo "========================================"
echo ""

# Check running processes
TIER2_RUNNING=$(pgrep -f "enrich-tenants-overnight.*tier2" | wc -l)
TIER3_RUNNING=$(pgrep -f "enrich-tenants-overnight.*tier12" | wc -l)
SOCIAL_RUNNING=$(pgrep -f "enrich-parallel-social" | wc -l)
OPERATIONAL_RUNNING=$(pgrep -f "enrich-parallel-operational" | wc -l)
GOOGLE_RUNNING=$(pgrep -f "enrich-google-places" | wc -l)

echo "📊 ACTIVE PROCESSES:"
if [ "$TIER2_RUNNING" -gt 0 ]; then
    echo "  ✅ Tier 2 Tenants (15-29 stores): RUNNING"
else
    echo "  ⏹️  Tier 2 Tenants: STOPPED"
fi

if [ "$TIER3_RUNNING" -gt 0 ]; then
    echo "  ✅ Tier 3 Tenants (10-14 stores): RUNNING"
else
    echo "  ⏹️  Tier 3 Tenants: STOPPED"
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

if [ "$GOOGLE_RUNNING" -gt 0 ]; then
    echo "  ✅ Google Places: RUNNING"
else
    echo "  ⏹️  Google Places: STOPPED"
fi

echo ""
echo "=" | head -c 50
echo ""

# Tier 2 tenants progress
if [ -f /tmp/tier2-tenants.log ]; then
    echo "🎯 TIER 2 TENANT ENRICHMENT:"
    CURRENT=$(tail -10 /tmp/tier2-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "  Current: $CURRENT"
    fi
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/tier2-tenants.log 2>/dev/null | tail -1)
    if [ ! -z "$STORES" ]; then
        echo "  $STORES"
    fi
fi

echo ""
echo "=" | head -c 50
echo ""

# Tier 3 tenants progress
if [ -f /tmp/tier3-tenants.log ]; then
    echo "🎯 TIER 3 TENANT ENRICHMENT:"
    CURRENT=$(tail -10 /tmp/tier3-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "  Current: $CURRENT"
    fi
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/tier3-tenants.log 2>/dev/null | tail -1)
    if [ ! -z "$STORES" ]; then
        echo "  $STORES"
    fi
fi

echo ""
echo "=" | head -c 50
echo ""

# Social media progress
if [ -f /tmp/social-final.log ]; then
    echo "📱 SOCIAL MEDIA:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/social-final.log 2>/dev/null)
    FAILED=$(grep -c "⚠️  No social" /tmp/social-final.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Success: $SUCCESS/$TOTAL ($RATE%)"
    fi
    CURRENT=$(tail -5 /tmp/social-final.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "  Current: $CURRENT"
    fi
fi

echo ""
echo "=" | head -c 50
echo ""

# Operational progress
if [ -f /tmp/operational-final.log ]; then
    echo "🚗 OPERATIONAL:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/operational-final.log 2>/dev/null)
    FAILED=$(grep -c "⚠️  No operational" /tmp/operational-final.log 2>/dev/null)
    TOTAL=$((SUCCESS + FAILED))
    if [ $TOTAL -gt 0 ]; then
        RATE=$((SUCCESS * 100 / TOTAL))
        echo "  Success: $SUCCESS/$TOTAL ($RATE%)"
    fi
    CURRENT=$(tail -5 /tmp/operational-final.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "  Current: $CURRENT"
    fi
fi

echo ""
echo "=" | head -c 50
echo ""

# Google Places progress
if [ -f /tmp/google-places-final.log ]; then
    echo "📍 GOOGLE PLACES:"
    SUCCESS=$(grep -c "✅ " /tmp/google-places-final.log 2>/dev/null)
    echo "  Enriched: $SUCCESS locations"
    CURRENT=$(tail -5 /tmp/google-places-final.log 2>/dev/null | grep "^\[" | tail -1)
    if [ ! -z "$CURRENT" ]; then
        echo "  Current: $CURRENT"
    fi
fi

echo ""
echo "=" | head -c 50
echo ""

echo "💡 COMMANDS:"
echo "  Watch Tier 2:      tail -f /tmp/tier2-tenants.log"
echo "  Watch Tier 3:      tail -f /tmp/tier3-tenants.log"
echo "  Watch social:      tail -f /tmp/social-final.log"
echo "  Watch operational: tail -f /tmp/operational-final.log"
echo "  Watch Google:      tail -f /tmp/google-places-final.log"
echo "  Check progress:    bash scripts/check-overnight-complete.sh"
echo ""

