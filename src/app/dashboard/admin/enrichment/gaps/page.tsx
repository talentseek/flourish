import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Download, Target } from 'lucide-react';
import Link from 'next/link';
import { computeGapAnalysis } from '@/lib/gap-analysis';

export const runtime = 'nodejs';

export default async function GapAnalysisPage() {
  const gapAnalysis = await computeGapAnalysis();

  const { overview, fieldGaps, criticalGaps } = gapAnalysis;

  // Group gaps by category
  const gapsByCategory = fieldGaps.reduce((acc, gap) => {
    if (!acc[gap.category]) {
      acc[gap.category] = [];
    }
    acc[gap.category].push(gap);
    return acc;
  }, {} as Record<string, typeof fieldGaps>);

  // Get high priority gaps
  const highPriorityGaps = fieldGaps.filter(g => g.priority === 'high' && g.percentage < 100);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/admin/enrichment">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Enrichment
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Gap Analysis</h1>
          <p className="text-muted-foreground">
            Systematic view of missing data for targeted enrichment
          </p>
        </div>
      </div>

      {/* Critical Gaps Alert */}
      {(criticalGaps.majorLocationsWithoutWebsites > 0 || 
        criticalGaps.shoppingCentresWithoutSocial > 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Gaps Detected</AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            {criticalGaps.majorLocationsWithoutWebsites > 0 && (
              <div>
                • <strong>{criticalGaps.majorLocationsWithoutWebsites}</strong> major locations (20+ stores) without websites
              </div>
            )}
            {criticalGaps.shoppingCentresWithoutSocial > 0 && (
              <div>
                • <strong>{criticalGaps.shoppingCentresWithoutSocial}</strong> shopping centres/retail parks without any social media
              </div>
            )}
            {criticalGaps.shoppingCentresWithoutParking > 0 && (
              <div>
                • <strong>{criticalGaps.shoppingCentresWithoutParking}</strong> shopping centres/retail parks without parking data
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalLocations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All locations in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Shopping Centres & Retail Parks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.shoppingCentresRetailParks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Primary enrichment targets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Locations With Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.locationsWithWebsites.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Can scrape for social media & parking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Gaps */}
      {highPriorityGaps.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-destructive" />
              <CardTitle>High Priority Gaps</CardTitle>
            </div>
            <CardDescription>
              Critical fields with significant missing data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highPriorityGaps.map((gap) => (
                <div key={gap.field} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{gap.displayName}</span>
                      <Badge variant="destructive" className="text-xs">
                        {gap.enrichmentMethod}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {gap.totalMissing.toLocaleString()} missing {gap.contextNote}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={gap.percentage} className="h-2" />
                    </div>
                    <span className="font-mono text-sm font-medium w-12 text-right">
                      {gap.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gaps by Category */}
      {Object.entries(gapsByCategory).map(([category, gaps]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Fields</CardTitle>
            <CardDescription>
              {gaps.filter(g => g.percentage < 100).length} fields with gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div key={gap.field}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{gap.displayName}</span>
                        <Badge 
                          variant={
                            gap.priority === 'high' ? 'destructive' : 
                            gap.priority === 'medium' ? 'default' : 
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {gap.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {gap.enrichmentMethod}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>{gap.totalMissing.toLocaleString()}</strong> of{' '}
                        <strong>{gap.relevantTotal.toLocaleString()}</strong> locations missing{' '}
                        <span className="italic">{gap.contextNote}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress 
                          value={gap.percentage} 
                          className="h-2"
                        />
                      </div>
                      <span className="font-mono text-sm font-medium w-12 text-right">
                        {gap.percentage}%
                      </span>
                    </div>
                  </div>
                  {gap.field !== gaps[gaps.length - 1].field && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Enrichment Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Enrichment Strategy</CardTitle>
          <CardDescription>Recommended approaches by method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['api', 'scraping', 'manual', 'calculated'].map((method) => {
              const methodGaps = fieldGaps.filter(g => g.enrichmentMethod === method && g.percentage < 100);
              return (
                <div key={method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{method}</span>
                    <Badge variant="outline">{methodGaps.length} fields</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {methodGaps.slice(0, 3).map(g => (
                      <div key={g.field}>• {g.displayName}</div>
                    ))}
                    {methodGaps.length > 3 && (
                      <div className="text-xs font-medium">
                        +{methodGaps.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

