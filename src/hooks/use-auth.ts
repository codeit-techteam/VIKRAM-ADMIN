"use client";

import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import type { Permission } from "@/constants/permissions";
import { resolveUserPermissions } from "@/constants/permissions";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    role: user?.role ?? null,
    permissions: user?.permissions ?? [],
    sidebar: user?.sidebar ?? [],
  };
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  const userPermissions = resolveUserPermissions(
    role ?? ROLES.SUPER_ADMIN,
    user?.permissions,
  );

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    if (role === ROLES.SUPER_ADMIN) return true;
    return userPermissions.includes(permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!role) return false;
    if (role === ROLES.SUPER_ADMIN) return true;
    return permissions.some((p) => userPermissions.includes(p));
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!role) return false;
    if (role === ROLES.SUPER_ADMIN) return true;
    return permissions.every((p) => userPermissions.includes(p));
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!role) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(role);
  };

  return { can, canAny, canAll, hasRole, role, permissions: userPermissions };
}
