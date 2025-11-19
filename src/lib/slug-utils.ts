/**
 * Utility functions for generating and working with location slugs
 */

/**
 * Generate a URL-friendly slug from a location name
 * Example: "Queensgate Shopping Centre" -> "queensgate-shopping-centre"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Find a location by slug from a list of locations
 */
export function findLocationBySlug(
  locations: Array<{ id: string; name: string }>,
  slug: string
): { id: string; name: string } | undefined {
  return locations.find(location => generateSlug(location.name) === slug)
}

/**
 * Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

