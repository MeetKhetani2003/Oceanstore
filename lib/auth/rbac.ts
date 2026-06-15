import type { UserRole } from "@/lib/db/models/User";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  manager: 1,
  admin: 2,
  "super-admin": 3,
};

export const PERMISSIONS = {
  // Product permissions
  "products:read": ["customer", "manager", "admin", "super-admin"],
  "products:write": ["manager", "admin", "super-admin"],
  "products:delete": ["admin", "super-admin"],

  // Order permissions
  "orders:read-own": ["customer", "manager", "admin", "super-admin"],
  "orders:read-all": ["manager", "admin", "super-admin"],
  "orders:update-status": ["manager", "admin", "super-admin"],
  "orders:refund": ["admin", "super-admin"],
  "orders:cancel": ["admin", "super-admin"],

  // Category permissions
  "categories:write": ["manager", "admin", "super-admin"],
  "categories:delete": ["admin", "super-admin"],

  // Customer permissions
  "customers:read": ["manager", "admin", "super-admin"],
  "customers:manage": ["admin", "super-admin"],

  // Coupon permissions
  "coupons:write": ["manager", "admin", "super-admin"],
  "coupons:delete": ["admin", "super-admin"],

  // Settings & roles
  "settings:write": ["admin", "super-admin"],
  "roles:manage": ["super-admin"],
  "audit-logs:read": ["admin", "super-admin"],

  // Analytics
  "analytics:read": ["manager", "admin", "super-admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

export function hasRole(
  userRole: UserRole | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role?: UserRole): boolean {
  return hasRole(role, "admin");
}

export function isManager(role?: UserRole): boolean {
  return hasRole(role, "manager");
}
