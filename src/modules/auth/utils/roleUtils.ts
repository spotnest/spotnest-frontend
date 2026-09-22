import type { UserRole } from "@/src/store/type";

/**
 * Normalizes any string representation of a role into a valid UserRole.
 */
export function normalizeRole(role?: string): UserRole {
  const r = (role || "").trim().toLowerCase();
  if (r === "admin") return "admin";
  if (r === "owner") return "owner";
  if (r === "tenant") return "tenant";
  if (r === "customer") return "customer";
  return "user";
}

/**
 * Resolves the appropriate dashboard route path for a given user role.
 */
export function getDashboardRouteForRole(role?: string): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "admin":
      return "/admin/dashboard";
    case "owner":
      return "/owner/dashboard";
    case "tenant":
    case "customer":
    case "user":
    default:
      return "/user/dashboard";
  }
}

/**
 * Formats a user role into a human-readable display label.
 */
export function formatRoleName(role?: string): string {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "admin":
      return "Administrator";
    case "owner":
      return "Property Owner";
    case "tenant":
      return "Tenant";
    case "customer":
      return "Customer";
    case "user":
    default:
      return "User";
  }
}

