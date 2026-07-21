import { ROLES, type Role } from "@/constants/roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  CMS_VIEW: "cms:view",
  CMS_MANAGE: "cms:manage",
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_MANAGE: "customers:manage",
  WAREHOUSE_VIEW: "warehouse:view",
  WAREHOUSE_MANAGE: "warehouse:manage",
  HUB_VIEW: "hub:view",
  HUB_MANAGE: "hub:manage",
  LOGISTICS_VIEW: "logistics:view",
  LOGISTICS_MANAGE: "logistics:manage",
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  CATEGORIES_VIEW: "categories:view",
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",
  DISPATCH_VIEW: "dispatch:view",
  MEMBERSHIP_VIEW: "membership:view",
  MEMBERSHIP_MANAGE: "membership:manage",
  WALLET_VIEW: "wallet:view",
  WALLET_MANAGE: "wallet:manage",
  LOYALTY_VIEW: "loyalty:view",
  LOYALTY_MANAGE: "loyalty:manage",
  BULK_VIEW: "bulk:view",
  BULK_MANAGE: "bulk:manage",
  EMERGENCY_VIEW: "emergency:view",
  EMERGENCY_MANAGE: "emergency:manage",
  FINANCE_VIEW: "finance:view",
  FINANCE_MANAGE: "finance:manage",
  REPORTS_VIEW: "reports:view",
  AUDIT_VIEW: "audit:view",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  NOTIFICATIONS_VIEW: "notifications:view",
  CUSTOMER_EXECUTIVE_VIEW: "customer_executive:view",
  CUSTOMER_EXECUTIVE_MANAGE: "customer_executive:manage",
  SUPPORT_VIEW: "support:view",
  SUPPORT_MANAGE: "support:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Permission matrix — only 3 admin roles */
export const ROLE_PERMISSIONS: Record<
  | typeof ROLES.SUPER_ADMIN
  | typeof ROLES.WAREHOUSE_MANAGER
  | typeof ROLES.CUSTOMER_EXECUTIVE,
  Permission[]
> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.WAREHOUSE_MANAGER]: [
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.HUB_VIEW,
    PERMISSIONS.HUB_MANAGE,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_MANAGE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.DISPATCH_VIEW,
    PERMISSIONS.EMERGENCY_VIEW,
    PERMISSIONS.EMERGENCY_MANAGE,
    PERMISSIONS.BULK_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.CUSTOMER_EXECUTIVE]: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.MEMBERSHIP_VIEW,
    PERMISSIONS.MEMBERSHIP_MANAGE,
    PERMISSIONS.WALLET_VIEW,
    PERMISSIONS.LOYALTY_VIEW,
    PERMISSIONS.BULK_VIEW,
    PERMISSIONS.BULK_MANAGE,
    PERMISSIONS.EMERGENCY_VIEW,
    PERMISSIONS.EMERGENCY_MANAGE,
    PERMISSIONS.CUSTOMER_EXECUTIVE_VIEW,
    PERMISSIONS.CUSTOMER_EXECUTIVE_MANAGE,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  if (role === ROLES.SUPER_ADMIN) return true;
  return (
    ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.includes(
      permission,
    ) ?? false
  );
};

export const hasAnyPermission = (
  role: Role,
  permissions: Permission[],
): boolean => permissions.some((permission) => hasPermission(role, permission));

export const hasAllPermissions = (
  role: Role,
  permissions: Permission[],
): boolean =>
  permissions.every((permission) => hasPermission(role, permission));

/** Resolve permissions from API user object or static role map */
export const resolveUserPermissions = (
  role: Role,
  apiPermissions?: string[],
): Permission[] => {
  if (apiPermissions?.length) {
    return apiPermissions as Permission[];
  }
  if (role === ROLES.SUPER_ADMIN) return Object.values(PERMISSIONS);
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] ?? [];
};
