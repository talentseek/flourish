"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkTierComplete, TierName } from "@/lib/enrichment-metrics";
import { Location } from "@prisma/client";

type LocationWithEnrichment = Pick<Location, 
  'id' | 'name' | 'type' | 'address' | 'city' | 'county' | 'postcode' | 
  'latitude' | 'longitude' | 'parkingSpaces' | 'numberOfStores' | 
  'totalFloorArea' | 'anchorTenants' | 'healthIndex' | 'vacancy' | 
  'largestCategory' | 'largestCategoryPercent' | 'population' | 'medianAge' | 
  'avgHouseholdIncome' | 'homeownership' | 'instagram' | 'facebook' | 'tiktok' | 'youtube'
>;

interface EnrichmentLocationsTableProps {
  locations: LocationWithEnrichment[];
}

type FilterOption = "all" | TierName;

export function EnrichmentLocationsTable({ locations }: EnrichmentLocationsTableProps) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [search, setSearch] = useState("");

  // Filter locations
  const filtered = locations.filter((loc) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        loc.name.toLowerCase().includes(searchLower) ||
        loc.city.toLowerCase().includes(searchLower) ||
        loc.postcode.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Tier filter - show locations that are INCOMPLETE for the selected tier
    if (filter === "all") return true;
    return !checkTierComplete(loc, filter as TierName);
  });

  // Calculate tier status for each location
  const getLocationTierStatus = (loc: Location) => ({
    core: checkTierComplete(loc, "core"),
    geo: checkTierComplete(loc, "geo"),
    operational: checkTierComplete(loc, "operational"),
    commercial: checkTierComplete(loc, "commercial"),
    digital: checkTierComplete(loc, "digital"),
    demographic: checkTierComplete(loc, "demographic"),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Locations Needing Enrichment</CardTitle>
            <CardDescription>
              {filtered.length} location{filtered.length !== 1 ? "s" : ""} shown
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-[200px]"
            />
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="core">Core Incomplete</SelectItem>
                <SelectItem value="geo">Geo Incomplete</SelectItem>
                <SelectItem value="operational">Operational Incomplete</SelectItem>
                <SelectItem value="commercial">Commercial Incomplete</SelectItem>
                <SelectItem value="digital">Digital Incomplete</SelectItem>
                <SelectItem value="demographic">Demographic Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No locations found</p>
            <p className="text-sm mt-2">
              {search
                ? "Try adjusting your search or filter criteria"
                : filter !== "all"
                ? "All locations are complete for this tier"
                : "No locations in the database"}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-center">Core</TableHead>
                  <TableHead className="text-center">Geo</TableHead>
                  <TableHead className="text-center">Op</TableHead>
                  <TableHead className="text-center">Comm</TableHead>
                  <TableHead className="text-center">Dig</TableHead>
                  <TableHead className="text-center">Demo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((loc) => {
                  const tierStatus = getLocationTierStatus(loc);
                  return (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {loc.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {loc.type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {loc.city}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.core ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.core ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.geo ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.geo ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.operational ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.operational ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.commercial ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.commercial ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.digital ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.digital ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={tierStatus.demographic ? "default" : "secondary"}
                          className="w-8 justify-center"
                        >
                          {tierStatus.demographic ? "✓" : "✗"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/gap-analysis?location=${loc.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

