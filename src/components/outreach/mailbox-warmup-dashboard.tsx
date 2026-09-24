'use client'

import { useState } from 'react'
import {
  Mail,
  Globe,
  Flame,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  WARMUP_SUMMARY,
  DOMAINS_POOL,
  MAILBOXES_POOL,
  MailboxInfo,
} from '@/data/outreach-mailboxes'

export function MailboxWarmupDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [rmFilter, setRmFilter] = useState('ALL')
  const [domainFilter, setDomainFilter] = useState('ALL')

  const uniqueRMs = Array.from(new Set(MAILBOXES_POOL.map((m) => m.rmName)))
  const uniqueDomains = DOMAINS_POOL.map((d) => d.domain)

  const filteredMailboxes = MAILBOXES_POOL.filter((m) => {
    const matchesSearch =
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domain.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRm = rmFilter === 'ALL' || m.rmName === rmFilter
    const matchesDomain = domainFilter === 'ALL' || m.domain === domainFilter

    return matchesSearch && matchesRm && matchesDomain
  })

  return (
    <div className="space-y-6">
      {/* Top Banner: Outreach Paused & Warmup Status */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-foreground">
                  Outreach Sending Paused — Automated Deliverability Warmup at 28%
                </h3>
                <Badge variant="outline" className="border-amber-500/50 bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                  Warmup in Progress
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                All outbound campaign triggers and cold email sends are temporarily on hold while our pool of 14 secondary domain mailboxes
                completes automated reputation ramp-up. This ensures 0% spam flags and maximum inbox placement before regional campaigns resume.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Estimated Ready</div>
              <div className="text-sm font-semibold text-foreground">~15 Days Remaining</div>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-amber-500/40 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-sm">
              28%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-amber-500/20">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Ramp Phase 2 (Day 6 of 21)
            </span>
            <span className="text-muted-foreground">Target: 45 Warmup Emails/Day per Mailbox</span>
          </div>
          <Progress value={28} className="h-2.5 bg-amber-500/20 [&>div]:bg-amber-500" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warmup Progress
            </CardTitle>
            <Flame className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">28%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              Day 6 of 21 ramp schedule
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Domains
            </CardTitle>
            <Globe className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {WARMUP_SUMMARY.totalDomains} Domains
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Spaceship • 2 mailboxes / domain
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mailbox Pool
            </CardTitle>
            <Mail className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {WARMUP_SUMMARY.totalMailboxes} Mailboxes
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              5 RMs (Amanda, Paula, Sophie, Giorgia: 3 | Callum: 2)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deliverability Health
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {WARMUP_SUMMARY.averageInboxPlacement}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              SPF, DKIM, DMARC 100% Validated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Infrastructure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-sky-500" />
            Registered Secondary Domains ({DOMAINS_POOL.length})
          </CardTitle>
          <CardDescription>
            Purchased via Spaceship and configured for cold email isolation to protect primary flourish domain reputation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOMAINS_POOL.map((d) => (
              <div
                key={d.domain}
                className="p-3.5 rounded-lg border bg-muted/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{d.domain}</span>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                      Active DNS
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>Registrar: {d.registrar}</span>
                    <span>•</span>
                    <span className="font-medium text-foreground">{d.mailboxesCount} mailboxes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">SPF / DKIM / DMARC</span>
                  </div>
                  <span className="text-muted-foreground truncate max-w-[130px]" title={d.assignedRMs.join(', ')}>
                    {d.assignedRMs.map((name) => name.split(' ')[0]).join(' & ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Manager Mailboxes Pool Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-500" />
                RM Mailbox Directory & Warmup Health
              </CardTitle>
              <CardDescription>
                Allocated mailboxes per Regional Manager. All mailboxes currently ramping at 28% deliverability.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search mailbox or RM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Select value={rmFilter} onValueChange={setRmFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="Filter by RM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Managers</SelectItem>
                  {uniqueRMs.map((rm) => (
                    <SelectItem key={rm} value={rm}>
                      {rm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="Filter by Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Domains</SelectItem>
                  {uniqueDomains.map((dom) => (
                    <SelectItem key={dom} value={dom}>
                      {dom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mailbox Address</TableHead>
                  <TableHead>Regional Manager</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-center">Warmup Status</TableHead>
                  <TableHead className="text-right">Daily Activity</TableHead>
                  <TableHead className="text-right">Inbox Rate</TableHead>
                  <TableHead className="text-center">Authentication</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMailboxes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No mailboxes found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMailboxes.map((mb) => (
                    <TableRow key={mb.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{mb.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium">{mb.rmName}</span>
                          <span className="text-xs text-muted-foreground block">
                            {mb.rmCentresCount} managed centres
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {mb.domain}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1 w-28 mx-auto">
                          <div className="flex items-center justify-between w-full text-xs font-medium">
                            <span className="text-amber-600 dark:text-amber-400">Warming</span>
                            <span>{mb.warmupPercent}%</span>
                          </div>
                          <Progress
                            value={mb.warmupPercent}
                            className="h-1.5 w-full bg-amber-500/20 [&>div]:bg-amber-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <span className="text-emerald-600 font-medium">+{mb.dailySent} sent</span>
                        <span className="text-muted-foreground block">+{mb.dailyReceived} received</span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs text-emerald-600 dark:text-emerald-400">
                        {mb.inboxPlacementPercent}%
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                            SPF
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                            DKIM
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                            DMARC
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
