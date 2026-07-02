"use client";

import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/constants/roles";
import type { Permission } from "@/constants/permissions";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/constants/permissions";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    role: user?.role ?? null,
  };
}

export function usePermissions() {
  const role = useAuthStore((state) => state.user?.role);

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!role) return false;
    return hasAnyPermission(role, permissions);
  };

  const canAll = (permissions: Permission[]): boolean => {
    if (!role) return false;
    return hasAllPermissions(role, permissions);
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!role) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(role);
  };

  return { can, canAny, canAll, hasRole, role };
}
