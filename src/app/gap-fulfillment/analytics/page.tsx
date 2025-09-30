import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Target, CheckCircle2, MailOpen, Reply, CalendarCheck } from "lucide-react"

export const runtime = 'nodejs'

function percent(n: number, d: number) {
  if (!d) return 0
  return Math.round((n / d) * 100)
}

export default async function OutreachAnalyticsPage() {
  // Mock totals
  const totals = {
    sent: 124,
    delivered: 119,
    opened: 92,
    replied: 27,
    meetings: 11,
  }

  const recent: Array<{ brand: string; status: string; channel: string; when: string }>
    = [
      { brand: 'Wingstop Peterborough', status: 'Meeting booked', channel: 'Email', when: 'Today, 10:14' },
      { brand: 'KOKORO - Peterborough', status: 'Replied', channel: 'LinkedIn', when: 'Today, 09:52' },
      { brand: 'Turtle Bay Peterborough', status: 'Read', channel: 'Email', when: 'Yesterday, 16:07' },
      { brand: 'Five Guys Burgers and Fries Peterborough', status: 'Delivered', channel: 'Email', when: 'Yesterday, 14:22' },
      { brand: 'The Good Stuff - healthy fast food takeaway', status: 'Read', channel: 'Instagram', when: 'Yesterday, 11:09' },
    ]

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Outreach Analytics</h1>
                  <p className="text-muted-foreground">Performance overview (mock data)</p>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sent</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.sent}</div>
                    <p className="text-xs text-muted-foreground">All channels</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.delivered}</div>
                    <p className="text-xs text-muted-foreground">{percent(totals.delivered, totals.sent)}% delivery</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Opened</CardTitle>
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.opened}</div>
                    <p className="text-xs text-muted-foreground">{percent(totals.opened, totals.delivered)}% open rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Replied</CardTitle>
                    <Reply className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.replied}</div>
                    <p className="text-xs text-muted-foreground">{percent(totals.replied, totals.opened)}% reply rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Meetings</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.meetings}</div>
                    <p className="text-xs text-muted-foreground">{percent(totals.meetings, totals.replied)}% from replies</p>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle>Funnel</CardTitle>
                  <CardDescription>Conversion across stages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1"><span>Delivered</span><span>{percent(totals.delivered, totals.sent)}%</span></div>
                    <Progress value={percent(totals.delivered, totals.sent)} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1"><span>Opened</span><span>{percent(totals.opened, totals.delivered)}%</span></div>
                    <Progress value={percent(totals.opened, totals.delivered)} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1"><span>Replied</span><span>{percent(totals.replied, totals.opened)}%</span></div>
                    <Progress value={percent(totals.replied, totals.opened)} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1"><span>Meetings</span><span>{percent(totals.meetings, totals.replied)}%</span></div>
                    <Progress value={percent(totals.meetings, totals.replied)} />
                  </div>
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest outreach updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recent.map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{row.brand}</div>
                          <div className="text-xs text-muted-foreground">{row.channel} • {row.when}</div>
                        </div>
                        <Badge variant={row.status === 'Meeting booked' ? 'default' : row.status === 'Replied' ? 'secondary' : 'outline'}>{row.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


