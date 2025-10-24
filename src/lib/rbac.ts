export type AppRole = "USER" | "ADMIN";

export function requireRole(required: AppRole, userRole?: string) {
  if (!userRole) return false;
  if (required === "ADMIN") return userRole === "ADMIN";
  return true; // USER or higher
}

export function checkAdminRole(userRole?: string): boolean {
  return userRole === "ADMIN";
}
