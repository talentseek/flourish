#!/bin/bash
# Monitor client-ready enrichment progress

clear
echo "═══════════════════════════════════════════════════════════════════"
echo "         🎯 CLIENT-READY ENRICHMENT PROGRESS 🎯"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check active processes
WEBSITES=$(pgrep -f "enrich-websites-comprehensive" | wc -l)
TIER1=$(pgrep -f "enrich-tenants-comprehensive.*tier1" | wc -l)
TIER2=$(pgrep -f "enrich-tenants-comprehensive.*tier2" | wc -l)
TIER3=$(pgrep -f "enrich-tenants-comprehensive.*tier3" | wc -l)
GOOGLE=$(pgrep -f "enrich-google-places" | wc -l)
SOCIAL=$(pgrep -f "enrich-social-media" | wc -l)
OPERATIONAL=$(pgrep -f "enrich-operational-details" | wc -l)
FACEBOOK=$(pgrep -f "enrich-facebook-data" | wc -l)
SEO=$(pgrep -f "enrich-seo-metadata" | wc -l)
DEMOGRAPHICS=$(pgrep -f "enrich-household-income" | wc -l)

TOTAL=$((WEBSITES + TIER1 + TIER2 + TIER3 + GOOGLE + SOCIAL + OPERATIONAL + FACEBOOK + SEO + DEMOGRAPHICS))

echo "📊 ACTIVE PROCESSES: $TOTAL/10"
echo ""

[ "$WEBSITES" -gt 0 ] && echo "  ✅ Website Discovery" || echo "  ⏹️  Website Discovery"
[ "$TIER1" -gt 0 ] && echo "  ✅ Tier 1 Tenants (30+)" || echo "  ⏹️  Tier 1 Tenants"
[ "$TIER2" -gt 0 ] && echo "  ✅ Tier 2 Tenants (15-29)" || echo "  ⏹️  Tier 2 Tenants"
[ "$TIER3" -gt 0 ] && echo "  ✅ Tier 3 Tenants (10-14)" || echo "  ⏹️  Tier 3 Tenants"
[ "$GOOGLE" -gt 0 ] && echo "  ✅ Google Places" || echo "  ⏹️  Google Places"
[ "$SOCIAL" -gt 0 ] && echo "  ✅ Social Media" || echo "  ⏹️  Social Media"
[ "$OPERATIONAL" -gt 0 ] && echo "  ✅ Operational" || echo "  ⏹️  Operational"
[ "$FACEBOOK" -gt 0 ] && echo "  ✅ Facebook" || echo "  ⏹️  Facebook"
[ "$SEO" -gt 0 ] && echo "  ✅ SEO" || echo "  ⏹️  SEO"
[ "$DEMOGRAPHICS" -gt 0 ] && echo "  ✅ Demographics" || echo "  ⏹️  Demographics"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Calculate total stores added across all tenant tiers
TOTAL_STORES=0
for tier in tier1 tier2 tier3; do
    LOG="/tmp/final-${tier}-tenants.log"
    if [ -f "$LOG" ]; then
        STORES=$(grep -o "Total stores added: [0-9]*" "$LOG" 2>/dev/null | tail -1 | grep -o "[0-9]*")
        [ ! -z "$STORES" ] && TOTAL_STORES=$((TOTAL_STORES + STORES))
    fi
done

if [ $TOTAL_STORES -gt 0 ]; then
    echo "🏆 CUMULATIVE PROGRESS:"
    echo "   Total Stores Added: $TOTAL_STORES"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
fi

# Website Discovery
if [ -f /tmp/final-websites.log ]; then
    echo "🌐 WEBSITE DISCOVERY:"
    SUCCESS=$(grep -c "✅ Found:" /tmp/final-websites.log 2>/dev/null)
    GOOGLE_COUNT=$(grep -c "Google Places" /tmp/final-websites.log 2>/dev/null)
    PATTERN_COUNT=$(grep -c "Pattern Match" /tmp/final-websites.log 2>/dev/null)
    echo "   Found: $SUCCESS websites"
    [ $GOOGLE_COUNT -gt 0 ] && echo "   ├─ Via Google Places: $GOOGLE_COUNT"
    [ $PATTERN_COUNT -gt 0 ] && echo "   └─ Via Pattern Match: $PATTERN_COUNT"
    CURRENT=$(tail -3 /tmp/final-websites.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Tier 1 Tenants
if [ -f /tmp/final-tier1-tenants.log ]; then
    echo "🔥 TIER 1 TENANTS (30+ stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/final-tier1-tenants.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    SUCCESS=$(grep -c "✅ Saved" /tmp/final-tier1-tenants.log 2>/dev/null)
    [ ! -z "$STORES" ] && echo "   Stores added: $STORES"
    [ ! -z "$SUCCESS" ] && echo "   Locations enriched: $SUCCESS/129"
    CURRENT=$(tail -5 /tmp/final-tier1-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Tier 2 Tenants
if [ -f /tmp/final-tier2-tenants.log ]; then
    echo "🎯 TIER 2 TENANTS (15-29 stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/final-tier2-tenants.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    SUCCESS=$(grep -c "✅ Saved" /tmp/final-tier2-tenants.log 2>/dev/null)
    [ ! -z "$STORES" ] && echo "   Stores added: $STORES"
    [ ! -z "$SUCCESS" ] && echo "   Locations enriched: $SUCCESS/280"
    CURRENT=$(tail -5 /tmp/final-tier2-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Tier 3 Tenants
if [ -f /tmp/final-tier3-tenants.log ]; then
    echo "📍 TIER 3 TENANTS (10-14 stores):"
    STORES=$(grep -o "Total stores added: [0-9]*" /tmp/final-tier3-tenants.log 2>/dev/null | tail -1 | grep -o "[0-9]*")
    SUCCESS=$(grep -c "✅ Saved" /tmp/final-tier3-tenants.log 2>/dev/null)
    [ ! -z "$STORES" ] && echo "   Stores added: $STORES"
    [ ! -z "$SUCCESS" ] && echo "   Locations enriched: $SUCCESS/194"
    CURRENT=$(tail -5 /tmp/final-tier3-tenants.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Google Places
if [ -f /tmp/final-google-places.log ]; then
    echo "📞 GOOGLE PLACES:"
    SUCCESS=$(grep -c "✅" /tmp/final-google-places.log 2>/dev/null)
    [ ! -z "$SUCCESS" ] && echo "   Enriched: $SUCCESS locations"
    CURRENT=$(tail -3 /tmp/final-google-places.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Social Media
if [ -f /tmp/final-social-media.log ]; then
    echo "📱 SOCIAL MEDIA:"
    INSTA=$(grep -c "instagram.com" /tmp/final-social-media.log 2>/dev/null)
    FB=$(grep -c "facebook.com" /tmp/final-social-media.log 2>/dev/null)
    TWITTER=$(grep -c "twitter.com\|x.com" /tmp/final-social-media.log 2>/dev/null)
    echo "   Instagram: +$INSTA | Facebook: +$FB | Twitter: +$TWITTER"
    CURRENT=$(tail -3 /tmp/final-social-media.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

# Operational
if [ -f /tmp/final-operational.log ]; then
    echo "🚗 OPERATIONAL:"
    SUCCESS=$(grep -c "✅" /tmp/final-operational.log 2>/dev/null)
    [ ! -z "$SUCCESS" ] && echo "   Enriched: $SUCCESS locations"
    CURRENT=$(tail -3 /tmp/final-operational.log 2>/dev/null | grep "^\[" | tail -1)
    [ ! -z "$CURRENT" ] && echo "   Current: $CURRENT"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════════"
echo ""

if [ $TOTAL_STORES -gt 0 ]; then
    PROGRESS_PCT=$((TOTAL_STORES * 100 / 18000))
    echo "📊 OVERALL TENANT PROGRESS: $TOTAL_STORES / ~18,000 target ($PROGRESS_PCT%)"
    echo ""
fi

echo "💡 COMMANDS:"
echo "   Refresh:       bash scripts/check-client-ready-progress.sh"
echo "   Auto-refresh:  watch -n 30 bash scripts/check-client-ready-progress.sh"
echo "   Watch log:     tail -f /tmp/final-<name>.log"
echo "   Pause all:     pkill -f 'enrich-'"
echo ""
echo "🎯 CLIENT PRESENTATION COUNTDOWN: Check back in the morning!"
echo ""

