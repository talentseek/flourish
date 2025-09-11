import { prisma } from "@/lib/db";

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type CategoryDistribution = {
  categoryName: string;
  count: number;
  percentage: number; // 0..100
};

export async function getCategoryDistributionWithinRadius(locationId: string, radiusKm: number): Promise<CategoryDistribution[]> {
  const centre = await prisma.location.findUnique({
    where: { id: locationId },
    select: { latitude: true, longitude: true },
  });
  if (!centre || centre.latitude === null || centre.longitude === null) return [];

  // Fetch candidate locations; simple prefilter by bbox ~radius
  const lat = Number(centre.latitude);
  const lon = Number(centre.longitude);

  const all = await prisma.location.findMany({
    select: { id: true, latitude: true, longitude: true },
  });

  const nearbyIds = all
    .filter((l: any) => l.latitude != null && l.longitude != null)
    .filter((l: any) => Number(l.latitude) !== 0 && Number(l.longitude) !== 0)
    .filter((l: any) => haversineKm(lat, lon, Number(l.latitude), Number(l.longitude)) <= radiusKm)
    .map((l: any) => l.id);

  if (nearbyIds.length === 0) return [];

  const tenants = await prisma.tenant.findMany({
    where: { locationId: { in: nearbyIds } },
    select: { category: true, categoryRef: { select: { name: true } } },
  });

  const countByCategory = new Map<string, number>();
  for (const t of tenants) {
    const name = (t.categoryRef?.name || t.category || "Uncategorized").trim();
    countByCategory.set(name, (countByCategory.get(name) ?? 0) + 1);
  }

  const total = tenants.length || 1;
  const result: CategoryDistribution[] = Array.from(countByCategory.entries())
    .map(([categoryName, count]: [string, number]) => ({ categoryName, count, percentage: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count);

  return result;
}

export type LargestCategoryAggregate = {
  largestCategory: string;
  locations: number;
  avgPercent: number; // 0..100
};

export async function getLargestCategoryAggregationWithinRadius(locationId: string, radiusKm: number): Promise<LargestCategoryAggregate[]> {
  const centre = await prisma.location.findUnique({ where: { id: locationId }, select: { latitude: true, longitude: true } });
  if (!centre || centre.latitude === null || centre.longitude === null) return [];

  const lat = Number(centre.latitude);
  const lon = Number(centre.longitude);

  const all = await prisma.location.findMany({
    select: { id: true, latitude: true, longitude: true, largestCategory: true, largestCategoryPercent: true },
  });

  const within = all.filter((l: any) => l.latitude != null && l.longitude != null)
    .filter((l: any) => Number(l.latitude) !== 0 && Number(l.longitude) !== 0)
    .filter((l: any) => haversineKm(lat, lon, Number(l.latitude), Number(l.longitude)) <= radiusKm)
    .filter((l: any) => l.largestCategory);

  const byCat = new Map<string, { count: number; percentSum: number; percentCount: number }>();
  for (const l of within) {
    const name = String(l.largestCategory);
    const entry = byCat.get(name) ?? { count: 0, percentSum: 0, percentCount: 0 };
    entry.count += 1;
    if (l.largestCategoryPercent != null) {
      entry.percentSum += Number(l.largestCategoryPercent) * 100; // Decimal is 0..1 or already percent? Using as-is implies stored as percent; adjust if necessary
      entry.percentCount += 1;
    }
    byCat.set(name, entry);
  }

  const result: LargestCategoryAggregate[] = Array.from(byCat.entries()).map(([largestCategory, v]: [string, any]) => ({
    largestCategory,
    locations: v.count,
    avgPercent: v.percentCount ? v.percentSum / v.percentCount : 0,
  })).sort((a, b) => b.locations - a.locations);

  return result;
}
