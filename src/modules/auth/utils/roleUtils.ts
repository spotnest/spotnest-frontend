import type { UserRole } from "@/src/store/type";

/**
 * Normalizes any string representation of a role
 * into one of the valid SPOTNEST user roles.
 */
export function normalizeRole(role?: string): UserRole {
  const normalized = (role || "").trim().toLowerCase();

  if (normalized === "admin") {
    return "admin";
  }

  if (normalized === "owner") {
    return "owner";
  }

  return "user";
}

/**
 * Resolves the landing route for a user role.
 *
 * Normal users start with property discovery.
 * Owners and admins have dedicated dashboards.
 */
export function getDashboardRouteForRole(role?: string): string {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "admin":
      return "/admin/dashboard";

    case "owner":
      return "/owner/dashboard";

    case "user":
    default:
      return "/properties";
  }
}

/**
 * Formats a user role into a human-readable label.
 */
export function formatRoleName(role?: string): string {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "admin":
      return "Administrator";

    case "owner":
      return "Property Owner";

    case "user":
    default:
      return "User";
  }
}