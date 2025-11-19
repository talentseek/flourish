#!/bin/bash
# Monitor ultimate comprehensive enrichment

clear
echo "🚀 ULTIMATE ENRICHMENT PROGRESS"
echo "================================"
echo ""

# Check which scripts are running
WEBSITES=$(pgrep -f "enrich-websites-comprehensive" | wc -l)
TIER1=$(pgrep -f "enrich-tenants-comprehensive.*tier1" | wc -l)
TIER2=$(pgrep -f "enrich-tenants-comprehensive.*tier2" | wc -l)
TIER3=$(pgrep -f "enrich-tenants-comprehensive.*tier3" | wc -l)
GOOGLE=$(pgrep -f "enrich-google-places" | wc -l)
SOCIAL=$(pgrep -f "enrich-social-media" | wc -l)
OPERATIONAL=$(pgrep -f "enrich-operational-details" | wc -l)
SEO=$(pgrep -f "enrich-seo-metadata" | wc -l)
FACEBOOK=$(pgrep -f "enrich-facebook-data" | wc -l)

TOTAL_RUNNING=$((WEBSITES + TIER1 + TIER2 + TIER3 + GOOGLE + SOCIAL + OPERATIONAL + SEO + FACEBOOK))

echo "📊 ACTIVE PROCESSES: $TOTAL_RUNNING/9"
echo ""

[ "$WEBSITES" -gt 0 ] && echo "  ✅ Website Discovery" || echo "  ⏹️  Website Discovery"
[ "$TIER1" -gt 0 ] && echo "  ✅ Tier 1 Tenants" || echo "  ⏹️  Tier 1 Tenants"
[ "$TIER2" -gt 0 ] && echo "  ✅ Tier 2 Tenants" || echo "  ⏹️  Tier 2 Tenants"
[ "$TIER3" -gt 0 ] && echo "  ✅ Tier 3 Tenants" || echo "  ⏹️  Tier 3 Tenants"
[ "$GOOGLE" -gt 0 ] && echo "  ✅ Google Places" || echo "  ⏹️  Google Places"
[ "$SOCIAL" -gt 0 ] && echo "  ✅ Social Media" || echo "  ⏹️  Social Media"
[ "$OPERATIONAL" -gt 0 ] && echo "  ✅ Operational" || echo "  ⏹️  Operational"
[ "$SEO" -gt 0 ] && echo "  ✅ SEO Metadata" || echo "  ⏹️  SEO Metadata"
[ "$FACEBOOK" -gt 0 ] && echo "  ✅ Facebook Data" || echo "  ⏹️  Facebook Data"

echo ""
echo "=" | head -c 70
echo ""

# Website discovery
if [ -f /tmp/websites-comprehensive.log ]; then
    echo "🌐 WEBSITE DISCOVERY:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/websites-comprehensive.log 2>/dev/null)
    PATTERNS=$(grep -c "Pattern Match" /tmp/websites-comprehensive.log 2>/dev/null)
    GOOGLE=$(grep -c "Google Places" /tmp/websites-comprehensive.log 2>/dev/null)
    echo "  Success: $SUCCESS websites ($GOOGLE via Google, $PATTERNS via patterns)"
    CURRENT=$(tail -5 /tmp/websites-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Tier 1 tenants
if [ -f /tmp/tenants-tier1-comprehensive.log ]; then
    echo "🎯 TIER 1 TENANTS (30+ stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/tenants-tier1-comprehensive.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    [ ! -z "$STORES" ] && echo "  Stores added: $STORES"
    CURRENT=$(tail -10 /tmp/tenants-tier1-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Tier 2 tenants
if [ -f /tmp/tenants-tier2-comprehensive.log ]; then
    echo "🎯 TIER 2 TENANTS (15-29 stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/tenants-tier2-comprehensive.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    [ ! -z "$STORES" ] && echo "  Stores added: $STORES"
    CURRENT=$(tail -10 /tmp/tenants-tier2-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Tier 3 tenants
if [ -f /tmp/tenants-tier3-comprehensive.log ]; then
    echo "🎯 TIER 3 TENANTS (10-14 stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/tenants-tier3-comprehensive.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    [ ! -z "$STORES" ] && echo "  Stores added: $STORES"
    CURRENT=$(tail -10 /tmp/tenants-tier3-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Google Places
if [ -f /tmp/google-places-comprehensive.log ]; then
    echo "📍 GOOGLE PLACES:"
    SUCCESS=$(grep -c "✅" /tmp/google-places-comprehensive.log 2>/dev/null)
    echo "  Enriched: $SUCCESS locations"
    CURRENT=$(tail -5 /tmp/google-places-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Social media
if [ -f /tmp/social-comprehensive.log ]; then
    echo "📱 SOCIAL MEDIA:"
    INSTA=$(grep -c "instagram.com" /tmp/social-comprehensive.log 2>/dev/null)
    FB=$(grep -c "facebook.com" /tmp/social-comprehensive.log 2>/dev/null)
    TWITTER=$(grep -c "twitter.com\|x.com" /tmp/social-comprehensive.log 2>/dev/null)
    echo "  Found: Instagram=$INSTA, Facebook=$FB, Twitter=$TWITTER"
    CURRENT=$(tail -5 /tmp/social-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# Operational
if [ -f /tmp/operational-comprehensive.log ]; then
    echo "🚗 OPERATIONAL:"
    SUCCESS=$(grep -c "✅" /tmp/operational-comprehensive.log 2>/dev/null)
    echo "  Enriched: $SUCCESS locations"
    CURRENT=$(tail -5 /tmp/operational-comprehensive.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "  Current: $CURRENT"
    echo ""
fi

# SEO
if [ -f /tmp/seo-comprehensive.log ]; then
    echo "🔍 SEO METADATA:"
    SUCCESS=$(grep -c "✅" /tmp/seo-comprehensive.log 2>/dev/null)
    echo "  Enriched: $SUCCESS locations"
    echo ""
fi

# Facebook
if [ -f /tmp/facebook-comprehensive.log ]; then
    echo "👍 FACEBOOK:"
    SUCCESS=$(grep -c "✅" /tmp/facebook-comprehensive.log 2>/dev/null)
    echo "  Enriched: $SUCCESS locations"
    echo ""
fi

echo "=" | head -c 70
echo ""

# Calculate total tenants added across all tiers
TOTAL_TENANTS=0
for log in /tmp/tenants-tier*-comprehensive.log; do
    if [ -f "$log" ]; then
        STORES=$(grep -o "Total stores added: [0-9]*" "$log" 2>/dev/null | tail -1 | grep -o "[0-9]*")
        [ ! -z "$STORES" ] && TOTAL_TENANTS=$((TOTAL_TENANTS + STORES))
    fi
done

if [ $TOTAL_TENANTS -gt 0 ]; then
    echo "🏆 CUMULATIVE TENANT PROGRESS: $TOTAL_TENANTS stores added"
    echo ""
fi

echo "💡 COMMANDS:"
echo "  Watch any log:     tail -f /tmp/<log-name>.log"
echo "  Check progress:    bash scripts/check-ultimate-progress.sh"
echo "  Pause all:         pkill -f 'enrich-'"
echo ""

