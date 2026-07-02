"use client";

import type { Permission } from "@/constants/permissions";
import type { Role } from "@/constants/roles";
import { usePermissions } from "@/hooks/use-auth";

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: Role | Role[];
  permissions?: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback = null,
}: RoleGuardProps) {
  const { hasRole, canAny, canAll } = usePermissions();

  if (roles) {
    const roleList = Array.isArray(roles) ? roles : [roles];
    if (!roleList.some((role) => hasRole(role))) {
      return fallback;
    }
  }

  if (permissions) {
    const permissionList = Array.isArray(permissions)
      ? permissions
      : [permissions];
    const allowed = requireAll
      ? canAll(permissionList)
      : canAny(permissionList);

    if (!allowed) return fallback;
  }

  return children;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  fallback = null,
}: PermissionGuardProps) {
  const { can } = usePermissions();
  if (!can(permission)) return fallback;
  return children;
}
