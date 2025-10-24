import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getLatestEnrichmentSnapshot,
  computeEnrichmentStats,
  calculateTierPercentages,
  calculateOverallEnrichment,
  getLocationsWithEnrichmentStatus,
} from "@/lib/enrichment-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EnrichmentLocationsTable } from "@/components/enrichment-locations-table";
import { FieldDrilldownDialog } from "@/components/field-drilldown-dialog";
import { RefreshMetricsButton } from "@/components/refresh-metrics-button";
import { ArrowLeft } from "lucide-react";

export const runtime = "nodejs";

export default async function EnrichmentDashboardPage() {
  const user = await getSessionUser();

  // Check if user exists and has admin role
  if (!user) {
    redirect("/");
  }

  // Get user from database to check role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/");
  }

  // Get latest cached snapshot
  let snapshot = await getLatestEnrichmentSnapshot();

  // If no snapshot exists, compute one
  if (!snapshot) {
    snapshot = await computeEnrichmentStats();
  }

  // Calculate percentages
  const percentages = calculateTierPercentages(snapshot);
  const overallPercentage = calculateOverallEnrichment(snapshot);

  // Get locations with enrichment status
  const locations = await getLocationsWithEnrichmentStatus();

  // Parse field stats
  const fieldStats = snapshot.fieldStats as Record<
    string,
    { filled: number; empty: number }
  >;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Data Enrichment Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track enrichment progress across {snapshot.totalLocations.toLocaleString()}{" "}
              locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/enrichment/gaps">
              <Button variant="outline">
                View Gap Analysis
              </Button>
            </Link>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">
                {new Date(snapshot.createdAt).toLocaleString()}
              </p>
            </div>
            <RefreshMetricsButton />
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Overall Enrichment</CardTitle>
                <CardDescription>
                  Average completeness across all enrichment tiers
                </CardDescription>
              </div>
              <FieldDrilldownDialog fieldStats={fieldStats} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl font-bold">{overallPercentage}%</div>
                <Progress value={overallPercentage} className="flex-1 h-4" />
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round(
                  (overallPercentage / 100) * snapshot.totalLocations
                ).toLocaleString()}{" "}
                of {snapshot.totalLocations.toLocaleString()} locations fully enriched
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tier Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Core Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Data</CardTitle>
              <CardDescription>
                Name, type, address, city, county, postcode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.core}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.coreComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.core} />
              </div>
            </CardContent>
          </Card>

          {/* Geo Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Geocoding</CardTitle>
              <CardDescription>Valid latitude & longitude coordinates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.geo}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.geoComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.geo} />
              </div>
            </CardContent>
          </Card>

          {/* Operational Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operational</CardTitle>
              <CardDescription>
                Store count and floor area (core operational metrics)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.operational}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.operationalComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.operational} />
              </div>
            </CardContent>
          </Card>

          {/* Commercial Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Commercial</CardTitle>
              <CardDescription>
                Vacancy rates, category mix (health index optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.commercial}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.commercialComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.commercial} />
              </div>
            </CardContent>
          </Card>

          {/* Digital Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Digital</CardTitle>
              <CardDescription>At least one social media platform (Instagram, Facebook, TikTok, YouTube, Twitter)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.digital}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.digitalComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.digital} />
              </div>
            </CardContent>
          </Card>

          {/* Demographic Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demographic</CardTitle>
              <CardDescription>
                Population, age, homeownership (Census 2021)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold">{percentages.demographic}%</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot.demographicComplete.toLocaleString()}/
                    {snapshot.totalLocations.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentages.demographic} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Table */}
        <EnrichmentLocationsTable locations={locations} />
      </div>
    </div>
  );
}

