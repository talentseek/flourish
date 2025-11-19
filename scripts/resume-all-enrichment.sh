#!/bin/bash
# Resume all enrichment scripts from where they left off

echo "▶️  RESUMING ALL ENRICHMENT SCRIPTS"
echo "==================================="
echo ""

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set!"
    echo ""
    echo "Please run:"
    echo '  export OPENAI_API_KEY="your-openai-api-key-here"'
    echo ""
    echo "Then run this script again."
    exit 1
fi

cd /Users/mbeckett/Documents/codeprojects/flourish

echo "Starting enrichment scripts..."
echo ""

# 1. Tenant enrichment (will resume from progress.json)
if [ -f /tmp/tenant-enrichment-progress.json ]; then
    echo "🏪 Starting TENANT ENRICHMENT (will resume from saved progress)..."
    nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier1 > /tmp/tenant-enrichment-final.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
else
    echo "🏪 Starting TENANT ENRICHMENT (fresh start)..."
    nohup pnpm tsx scripts/enrich-tenants-overnight.ts tier1 > /tmp/tenant-enrichment-final.log 2>&1 &
    echo "   ✅ Started (PID: $!)"
fi

sleep 2

# 2. Social media enrichment
echo "📱 Starting SOCIAL MEDIA ENRICHMENT..."
nohup pnpm tsx scripts/enrich-parallel-social.ts > /tmp/social-enrichment.log 2>&1 &
echo "   ✅ Started (PID: $!)"

sleep 2

# 3. Operational enrichment
echo "🚗 Starting OPERATIONAL ENRICHMENT..."
nohup pnpm tsx scripts/enrich-parallel-operational.ts > /tmp/operational-enrichment.log 2>&1 &
echo "   ✅ Started (PID: $!)"

sleep 2

# 4. Website discovery
echo "🌐 Starting WEBSITE DISCOVERY..."
nohup pnpm tsx scripts/enrich-parallel-websites.ts > /tmp/website-discovery-parallel.log 2>&1 &
echo "   ✅ Started (PID: $!)"

sleep 3

echo ""
echo "=" | head -c 50
echo ""
echo "✅ ALL ENRICHMENT SCRIPTS RESUMED!"
echo ""
echo "Check status with:"
echo "  bash scripts/check-all-enrichment.sh"
echo ""
echo "Pause again with:"
echo "  bash scripts/pause-all-enrichment.sh"
echo ""

