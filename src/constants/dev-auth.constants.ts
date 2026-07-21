import { ROLES } from "@/constants/roles";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import type { User } from "@/types/auth";

export const DEV_ACCOUNTS = [
  {
    email: "superadmin@bajriwala.in",
    password: "bajriwala123",
    role: ROLES.SUPER_ADMIN,
    name: "Super Admin",
    id: "dev-super-admin",
  },
  {
    email: "warehouse@bajriwala.in",
    password: "bajriwala123",
    role: ROLES.WAREHOUSE_MANAGER,
    name: "Warehouse Manager",
    id: "dev-warehouse-manager",
  },
  {
    email: "executive@bajriwala.in",
    password: "bajriwala123",
    role: ROLES.CUSTOMER_EXECUTIVE,
    name: "Customer Executive",
    id: "dev-customer-executive",
  },
] as const;

/** Legacy dev account */
export const DEV_AUTH = {
  email: "admin@bajriwala.in",
  password: "bajriwala123",
  accessToken: "dev-mock-access-token",
  refreshToken: "dev-mock-refresh-token",
} as const;

export function getDevUserForCredentials(
  email: string,
  password: string,
): User | null {
  const normalized = email.toLowerCase().trim();
  const normalizedPassword = password.trim();
  const account =
    DEV_ACCOUNTS.find(
      (entry) =>
        entry.email === normalized && entry.password === normalizedPassword,
    ) ??
    (normalized === DEV_AUTH.email.toLowerCase() &&
    normalizedPassword === DEV_AUTH.password
      ? DEV_ACCOUNTS[0]
      : null);

  if (!account) return null;

  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    permissions: ROLE_PERMISSIONS[account.role],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  };
}

export function isDevMockToken(token: string | null | undefined): boolean {
  return token === DEV_AUTH.accessToken;
}
