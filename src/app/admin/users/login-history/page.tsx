import { getLoginHistory, getLoginStats } from "@/app/admin/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Activity, Users, Calendar, Clock, Monitor, Globe, Wifi,
} from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: { page?: string }
}

function parseDevice(ua: string | null): { label: string; icon: typeof Monitor } {
  if (!ua) return { label: "Unknown", icon: Globe }
  if (/iPhone|iPad/.test(ua)) return { label: "iOS", icon: Monitor }
  if (/Android/.test(ua)) return { label: "Android", icon: Monitor }
  if (/Windows/.test(ua)) return { label: "Windows", icon: Monitor }
  if (/Mac OS X/.test(ua)) return { label: "Mac", icon: Monitor }
  return { label: "Browser", icon: Globe }
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "—"
  if (/Edg\//.test(ua)) return "Edge"
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome"
  if (/Firefox\//.test(ua)) return "Firefox"
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari"
  if (/curl\//.test(ua)) return "API"
  return "Browser"
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const roleColour: Record<string, string> = {
  ADMIN: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  REGIONAL_MANAGER: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  USER: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
}

export default async function LoginHistoryPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page ?? 1)
  const [stats, { logs, total, pageSize }] = await Promise.all([
    getLoginStats(),
    getLoginHistory(page, 50),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const usingAuditLog = stats.source === "audit"

  // If no audit log yet, use sessions as the table rows
  const tableRows = usingAuditLog
    ? logs.map(l => ({
        id: l.id,
        name: l.user?.name ?? "—",
        email: l.email,
        role: l.user?.role ?? "USER",
        loginAt: l.loginAt,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
      }))
    : stats.sessions.map(s => ({
        id: s.id,
        name: s.user.name ?? "—",
        email: s.user.email,
        role: s.user.role,
        loginAt: s.createdAt,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
      }))

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Login History</h1>
          <p className="text-muted-foreground mt-1">
            {usingAuditLog
              ? "Permanent audit log — every login captured going forward."
              : "Showing current session data. Permanent audit log starts capturing from now."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border"
          >
            ← Users
          </Link>
        </div>
      </div>

      {/* Source notice */}
      {!usingAuditLog && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <strong>Note for CEO:</strong> The permanent audit log is now active and will capture all
          future logins with exact timestamps. The table below shows <em>current active sessions</em>{" "}
          as a proxy — it does not include logins that have already expired. Full history will build
          up automatically as users sign in going forward.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
            <p className="text-xs text-muted-foreground">{usingAuditLog ? "All time" : "Sessions in DB"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Have logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Live sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Logins Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loginsToday}</div>
            <p className="text-xs text-muted-foreground">Since midnight</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loginsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Login events</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {usingAuditLog ? `All Login Events (${total} total)` : `Current Sessions (${tableRows.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>{usingAuditLog ? "Login Time" : "Session Started"}</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No login records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((row) => {
                    const { label: device } = parseDevice(row.userAgent)
                    const browser = parseBrowser(row.userAgent)
                    const roleClass = roleColour[row.role] ?? roleColour.USER
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-muted-foreground">{row.email}</TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleClass}`}>
                            {row.role.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(row.loginAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.ipAddress ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">{device}</TableCell>
                        <TableCell className="text-sm">{browser}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {total} total entries
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/users/login-history?page=${page - 1}`}
                    className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/users/login-history?page=${page + 1}`}
                    className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
