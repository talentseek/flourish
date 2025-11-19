#!/bin/bash
# 🚀 COMPREHENSIVE ENRICHMENT LAUNCHER
# Runs all Phase 1-4 scrapers in parallel

cd /Users/mbeckett/Documents/codeprojects/flourish

echo "🚀 LAUNCHING COMPREHENSIVE ENRICHMENT SCRAPERS"
echo "================================================"
echo ""

# Phase 1: Critical Mass Enrichment
echo "📦 Phase 1: Critical Mass Enrichment"
echo "  - Mass Tenant Enrichment"
echo "  - Enhanced Website Discovery v2"
echo "  - Google Places Complete"
echo ""

# Phase 2: Operational Deep Dive
echo "🔧 Phase 2: Operational Deep Dive"
echo "  - Operational Deep Dive"
echo "  - Anchor Tenants Enhanced"
echo "  - Calculate Retailers/Space"
echo ""

# Phase 3: Social & Ownership
echo "📱 Phase 3: Social & Ownership"
echo "  - Social Media Deep Scrape"
echo "  - Owner/Management Enhanced"
echo "  - Footfall Enhanced"
echo ""

# Phase 4: Polish
echo "✨ Phase 4: Polish"
echo "  - SEO Metadata Enhanced"
echo ""

echo "Starting all scrapers in background..."
echo ""

# Phase 1: Critical Mass
nohup pnpm tsx scripts/enrich-tenants-mass.ts > /tmp/enrich-tenants-mass.log 2>&1 &
TENANTS_PID=$!
echo "✅ Mass Tenant Enrichment started (PID: $TENANTS_PID)"

nohup pnpm tsx scripts/enrich-websites-v2-enhanced.ts > /tmp/enrich-websites-v2.log 2>&1 &
WEBSITES_PID=$!
echo "✅ Enhanced Website Discovery v2 started (PID: $WEBSITES_PID)"

nohup pnpm tsx scripts/enrich-google-places-complete.ts > /tmp/enrich-google-places-complete.log 2>&1 &
GOOGLE_PID=$!
echo "✅ Google Places Complete started (PID: $GOOGLE_PID)"

# Phase 2: Operational Deep Dive
nohup pnpm tsx scripts/enrich-operational-deep.ts > /tmp/enrich-operational-deep.log 2>&1 &
OPERATIONAL_PID=$!
echo "✅ Operational Deep Dive started (PID: $OPERATIONAL_PID)"

nohup pnpm tsx scripts/enrich-anchor-tenants-enhanced.ts > /tmp/enrich-anchor-tenants-enhanced.log 2>&1 &
ANCHOR_PID=$!
echo "✅ Anchor Tenants Enhanced started (PID: $ANCHOR_PID)"

nohup pnpm tsx scripts/enrich-calculate-retailers.ts > /tmp/enrich-calculate-retailers.log 2>&1 &
CALC_PID=$!
echo "✅ Calculate Retailers/Space started (PID: $CALC_PID)"

# Phase 3: Social & Ownership
nohup pnpm tsx scripts/enrich-social-media-deep.ts > /tmp/enrich-social-media-deep.log 2>&1 &
SOCIAL_PID=$!
echo "✅ Social Media Deep Scrape started (PID: $SOCIAL_PID)"

nohup pnpm tsx scripts/enrich-ownership-enhanced.ts > /tmp/enrich-ownership-enhanced.log 2>&1 &
OWNERSHIP_PID=$!
echo "✅ Owner/Management Enhanced started (PID: $OWNERSHIP_PID)"

nohup pnpm tsx scripts/enrich-footfall-enhanced.ts > /tmp/enrich-footfall-enhanced.log 2>&1 &
FOOTFALL_PID=$!
echo "✅ Footfall Enhanced started (PID: $FOOTFALL_PID)"

# Phase 4: Polish
nohup pnpm tsx scripts/enrich-seo-metadata-enhanced.ts > /tmp/enrich-seo-metadata-enhanced.log 2>&1 &
SEO_PID=$!
echo "✅ SEO Metadata Enhanced started (PID: $SEO_PID)"

echo ""
echo "✅ ALL SCRIPTS STARTED!"
echo ""
echo "📊 Monitor progress:"
echo "  tail -f /tmp/enrich-tenants-mass.log"
echo "  tail -f /tmp/enrich-websites-v2.log"
echo "  tail -f /tmp/enrich-google-places-complete.log"
echo "  tail -f /tmp/enrich-operational-deep.log"
echo "  tail -f /tmp/enrich-anchor-tenants-enhanced.log"
echo "  tail -f /tmp/enrich-calculate-retailers.log"
echo "  tail -f /tmp/enrich-social-media-deep.log"
echo "  tail -f /tmp/enrich-ownership-enhanced.log"
echo "  tail -f /tmp/enrich-footfall-enhanced.log"
echo "  tail -f /tmp/enrich-seo-metadata-enhanced.log"
echo ""
echo "🛑 To stop all:"
echo "  pkill -f 'enrich-tenants-mass|enrich-websites-v2|enrich-google-places-complete|enrich-operational-deep|enrich-anchor-tenants-enhanced|enrich-calculate-retailers|enrich-social-media-deep|enrich-ownership-enhanced|enrich-footfall-enhanced|enrich-seo-metadata-enhanced'"
echo ""
echo "📝 PIDs saved to: /tmp/comprehensive-enrichment-pids.txt"
echo "$TENANTS_PID" > /tmp/comprehensive-enrichment-pids.txt
echo "$WEBSITES_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$GOOGLE_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$OPERATIONAL_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$ANCHOR_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$CALC_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$SOCIAL_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$OWNERSHIP_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$FOOTFALL_PID" >> /tmp/comprehensive-enrichment-pids.txt
echo "$SEO_PID" >> /tmp/comprehensive-enrichment-pids.txt

