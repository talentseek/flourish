#!/usr/bin/env tsx
/**
 * 🌙 COMPLETE OVERNIGHT ENRICHMENT
 * 
 * Fills ALL remaining gaps:
 * - Tier 2 tenant data (409 locations with 15+ stores)
 * - Google Places data (phone, ratings, hours)
 * - Remaining social media
 * - Remaining operational details
 * 
 * Runs multiple enrichers in sequence for comprehensive coverage
 */

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScriptResult {
  name: string;
  success: boolean;
  duration: number;
  message: string;
}

async function runScript(
  scriptPath: string,
  args: string[],
  logFile: string,
  name: string
): Promise<ScriptResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 Starting: ${name}`);
    console.log(`   Script: ${scriptPath}`);
    console.log(`   Log: ${logFile}`);
    console.log('='.repeat(80));

    const child = spawn('pnpm', ['tsx', scriptPath, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let output = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000 / 60);
      
      if (code === 0) {
        console.log(`\n✅ ${name} completed successfully in ${duration} minutes\n`);
        resolve({
          name,
          success: true,
          duration,
          message: `Completed in ${duration} min`,
        });
      } else {
        console.log(`\n⚠️  ${name} finished with code ${code} after ${duration} minutes\n`);
        resolve({
          name,
          success: false,
          duration,
          message: `Exit code ${code} after ${duration} min`,
        });
      }
    });
  });
}

async function main() {
  console.log('\n🌙 COMPLETE OVERNIGHT ENRICHMENT');
  console.log('='.repeat(80));
  console.log('Running comprehensive enrichment to fill ALL gaps');
  console.log('This will take 8-12 hours\n');

  const startTime = Date.now();
  const results: ScriptResult[] = [];

  // Phase 1: TIER 2 TENANT ENRICHMENT (15-29 stores) - HIGH PRIORITY
  console.log('\n📊 PHASE 1: TIER 2 TENANT ENRICHMENT');
  console.log('Target: 409 locations with 15+ stores but no tenants\n');
  
  results.push(
    await runScript(
      'scripts/enrich-tenants-overnight.ts',
      ['tier2'],
      '/tmp/tenant-tier2-enrichment.log',
      'Tier 2 Tenant Enrichment (15-29 stores)'
    )
  );

  // Phase 2: TIER 3 TENANT ENRICHMENT (10-14 stores)
  console.log('\n📊 PHASE 2: TIER 3 TENANT ENRICHMENT');
  console.log('Target: Locations with 10-14 stores\n');
  
  results.push(
    await runScript(
      'scripts/enrich-tenants-tier3.ts',
      [],
      '/tmp/tenant-tier3-enrichment.log',
      'Tier 3 Tenant Enrichment (10-14 stores)'
    )
  );

  // Phase 3: GOOGLE PLACES ENRICHMENT
  console.log('\n📍 PHASE 3: GOOGLE PLACES ENRICHMENT');
  console.log('Target: 1,009 locations missing phone/ratings\n');
  
  results.push(
    await runScript(
      'scripts/enrich-google-places-complete.ts',
      [],
      '/tmp/google-places-complete.log',
      'Google Places Complete Enrichment'
    )
  );

  // Phase 4: SOCIAL MEDIA (remaining)
  console.log('\n📱 PHASE 4: SOCIAL MEDIA (REMAINING)');
  console.log('Target: ~600 locations still missing social links\n');
  
  results.push(
    await runScript(
      'scripts/enrich-parallel-social.ts',
      [],
      '/tmp/social-remaining.log',
      'Social Media (Remaining)'
    )
  );

  // Phase 5: OPERATIONAL (remaining)
  console.log('\n🚗 PHASE 5: OPERATIONAL (REMAINING)');
  console.log('Target: ~900 locations still missing operational data\n');
  
  results.push(
    await runScript(
      'scripts/enrich-parallel-operational.ts',
      [],
      '/tmp/operational-remaining.log',
      'Operational (Remaining)'
    )
  );

  // Final Summary
  const totalDuration = Math.round((Date.now() - startTime) / 1000 / 60);
  
  console.log('\n' + '='.repeat(80));
  console.log('🎉 OVERNIGHT ENRICHMENT COMPLETE!');
  console.log('='.repeat(80));
  console.log(`Total Duration: ${totalDuration} minutes (${(totalDuration / 60).toFixed(1)} hours)\n`);
  
  console.log('RESULTS:\n');
  results.forEach((result) => {
    const icon = result.success ? '✅' : '⚠️';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);
  });

  // Get final database stats
  const stats = await prisma.$transaction([
    prisma.location.count(),
    prisma.location.count({ where: { website: { not: null } } }),
    prisma.location.count({ where: { tenants: { some: {} } } }),
    prisma.tenant.count(),
    prisma.location.count({ where: { instagram: { not: null } } }),
    prisma.location.count({ where: { phone: { not: null } } }),
  ]);

  console.log('📊 FINAL DATABASE STATS:\n');
  console.log(`Total locations: ${stats[0]}`);
  console.log(`With websites: ${stats[1]} (${Math.round((stats[1] / stats[0]) * 100)}%)`);
  console.log(`With tenants: ${stats[2]}`);
  console.log(`Total tenants: ${stats[3]}`);
  console.log(`With Instagram: ${stats[4]}`);
  console.log(`With phone: ${stats[5]}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

