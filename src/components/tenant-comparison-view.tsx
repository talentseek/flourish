"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { TenantComparisonResult } from "@/lib/tenant-comparison"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TenantComparisonViewProps {
  comparison: TenantComparisonResult
}

export function TenantComparisonView({ comparison }: TenantComparisonViewProps) {
  const { target, competitors, gaps } = comparison

  // Prepare data for comparison chart (top 10 categories)
  const topCategories = target.categories.slice(0, 10)
  const chartData = topCategories.map(targetCat => {
    const competitorCat = competitors.categories.find(c => c.category === targetCat.category)
    return {
      category: targetCat.category.length > 20 ? targetCat.category.substring(0, 20) + '...' : targetCat.category,
      fullCategory: targetCat.category,
      target: targetCat.percentage,
      competitors: competitorCat?.percentage || 0,
      targetCount: targetCat.count,
      competitorCount: competitorCat?.count || 0
    }
  })

  const chartConfig = {
    target: {
      label: "Target",
      color: "hsl(var(--chart-1))",
    },
    competitors: {
      label: "Competitors Avg",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Target Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{target.totalTenants}</div>
            <p className="text-xs text-muted-foreground">Total tenants</p>
            <p className="text-sm mt-1">{target.locationName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Competitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.totalLocations}</div>
            <p className="text-xs text-muted-foreground">Locations compared</p>
            <p className="text-sm mt-1">Avg {competitors.averageTenantsPerLocation.toFixed(0)} tenants each</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gaps Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaps.missingCategories.length + gaps.underRepresented.length}</div>
            <p className="text-xs text-muted-foreground">Categories needing attention</p>
            <p className="text-sm mt-1">
              {gaps.missingCategories.length} missing, {gaps.underRepresented.length} under-represented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Comparison</CardTitle>
          <CardDescription>
            Target vs Competitors Average (Top 10 Categories)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="target" fill="var(--color-target)" name="Target %" />
              <Bar dataKey="competitors" fill="var(--color-competitors)" name="Competitors Avg %" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Breakdown</CardTitle>
          <CardDescription>
            Side-by-side comparison of category percentages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Competitors Avg</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {target.categories.map((targetCat) => {
                  const competitorCat = competitors.categories.find(c => c.category === targetCat.category)
                  const competitorAvg = competitorCat?.percentage || 0
                  const difference = targetCat.percentage - competitorAvg
                  const isOverRepresented = difference > 5
                  const isUnderRepresented = difference < -5
                  
                  return (
                    <TableRow key={targetCat.category}>
                      <TableCell className="font-medium">{targetCat.category}</TableCell>
                      <TableCell className="text-right">
                        {targetCat.percentage.toFixed(1)}% ({targetCat.count})
                      </TableCell>
                      <TableCell className="text-right">
                        {competitorAvg > 0 ? `${competitorAvg.toFixed(1)}%` : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {competitorAvg > 0 ? (
                          <div className="flex items-center justify-end gap-1">
                            {difference > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : difference < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={difference > 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : ''}>
                              {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOverRepresented && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Over-represented
                          </Badge>
                        )}
                        {isUnderRepresented && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            Under-represented
                          </Badge>
                        )}
                        {!isOverRepresented && !isUnderRepresented && competitorAvg > 0 && (
                          <Badge variant="outline">Balanced</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

