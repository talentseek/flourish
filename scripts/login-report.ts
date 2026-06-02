/**
 * login-report.ts
 * Dump current Flourish login sessions and login audit log to the console.
 * Usage: npx tsx scripts/login-report.ts
 */
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown"
  if (/iPhone|iPad/.test(ua)) return "📱 iOS"
  if (/Android/.test(ua)) return "📱 Android"
  if (/Windows/.test(ua)) return "🖥  Windows"
  if (/Mac OS X/.test(ua)) return "🍎 Mac"
  if (/Linux/.test(ua)) return "🐧 Linux"
  return "🌐 Browser"
}

function fmt(d: Date | null): string {
  if (!d) return "—"
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  })
}

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════")
  console.log("  FLOURISH — Login Report")
  console.log(`  Generated: ${fmt(new Date())}`)
  console.log("═══════════════════════════════════════════════════════════\n")

  // ── 1. Active sessions ────────────────────────────────────────────
  const sessions = await prisma.session.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  console.log(`📋  ACTIVE / RECENT SESSIONS  (${sessions.length} total)\n`)
  console.log(
    "Name".padEnd(25) +
    "Email".padEnd(35) +
    "Role".padEnd(18) +
    "Logged In".padEnd(28) +
    "Expires".padEnd(28) +
    "IP".padEnd(18) +
    "Device"
  )
  console.log("─".repeat(160))

  for (const s of sessions) {
    const expired = s.expiresAt < new Date()
    const row =
      (s.user.name ?? "—").padEnd(25) +
      s.user.email.padEnd(35) +
      s.user.role.replace("_", " ").padEnd(18) +
      fmt(s.createdAt).padEnd(28) +
      (expired ? "EXPIRED " : "") + fmt(s.expiresAt).padEnd(28) +
      (s.ipAddress ?? "—").padEnd(18) +
      parseDevice(s.userAgent)
    console.log(expired ? `\x1b[2m${row}\x1b[0m` : row)
  }

  // ── 2. Permanent audit log ────────────────────────────────────────
  let auditRows: Awaited<ReturnType<typeof prisma.userLoginLog.findMany>> = []
  try {
    auditRows = await prisma.userLoginLog.findMany({
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { loginAt: "desc" },
      take: 200,
    })
  } catch {
    // Table may not exist yet in older environments
  }

  if (auditRows.length > 0) {
    console.log(`\n\n📜  PERMANENT LOGIN AUDIT LOG  (last ${auditRows.length} events)\n`)
    console.log(
      "Name".padEnd(25) +
      "Email".padEnd(35) +
      "Role".padEnd(18) +
      "Login Time".padEnd(28) +
      "IP".padEnd(18) +
      "Device"
    )
    console.log("─".repeat(140))

    for (const r of auditRows) {
      console.log(
        (r.user?.name ?? "—").padEnd(25) +
        r.email.padEnd(35) +
        (r.user?.role ?? "—").replace("_", " ").padEnd(18) +
        fmt(r.loginAt).padEnd(28) +
        (r.ipAddress ?? "—").padEnd(18) +
        parseDevice(r.userAgent)
      )
    }
  } else {
    console.log("\n\n📜  PERMANENT AUDIT LOG: No entries yet.")
    console.log("    (Logins will be captured here going forward.)\n")
  }

  // ── 3. Summary stats ──────────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const activeSessions = sessions.filter(s => s.expiresAt > new Date())
  const uniqueUsers = new Set(sessions.map(s => s.userId)).size

  console.log("\n\n📊  SUMMARY")
  console.log("─".repeat(40))
  console.log(`  Total sessions in DB:    ${sessions.length}`)
  console.log(`  Currently active:        ${activeSessions.length}`)
  console.log(`  Unique users seen:       ${uniqueUsers}`)
  if (auditRows.length > 0) {
    const todayLogins = auditRows.filter(r => r.loginAt >= today).length
    const weekLogins = auditRows.filter(r => r.loginAt >= weekAgo).length
    console.log(`  Logins today:           ${todayLogins}`)
    console.log(`  Logins last 7 days:     ${weekLogins}`)
  }
  console.log("")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
