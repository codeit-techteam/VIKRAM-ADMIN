import { ROLES } from "@/constants/roles";
import type { User } from "@/types/auth";

export const DEV_AUTH = {
  email: "admin@bajriwala.in",
  password: "bajriwala123",
  accessToken: "dev-mock-access-token",
  refreshToken: "dev-mock-refresh-token",
} as const;

export const DEV_SUPER_ADMIN_USER: User = {
  id: "dev-super-admin-001",
  email: DEV_AUTH.email,
  name: "Super Admin",
  role: ROLES.SUPER_ADMIN,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export function isDevMockToken(token: string | null | undefined): boolean {
  return token === DEV_AUTH.accessToken;
}
