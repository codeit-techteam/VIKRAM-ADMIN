import type { Role } from "@/constants/roles";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: string;
  children?: SidebarNavItem[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  avatar?: string;
  role: Role;
  permissions?: string[];
  sidebar?: SidebarNavItem[];
  phone?: string;
  isActive: boolean;
  assignedHubId?: string | null;
  assignedHub?: {
    id: string;
    name: string;
    code: string;
    city: string;
    state: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/** Map backend admin login response to frontend User */
export function mapAdminUser(admin: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions?: string[];
  sidebar?: SidebarNavItem[];
  lastLoginAt?: string | null;
  phone?: string | null;
  isActive?: boolean;
  assignedHubId?: string | null;
  assignedHub?: User["assignedHub"];
}): User {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.fullName,
    fullName: admin.fullName,
    role: admin.role as Role,
    permissions: admin.permissions,
    sidebar: admin.sidebar,
    phone: admin.phone ?? undefined,
    isActive: admin.isActive ?? true,
    assignedHubId: admin.assignedHubId ?? null,
    assignedHub: admin.assignedHub ?? null,
    createdAt: admin.lastLoginAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
