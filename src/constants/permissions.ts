import { ROLES, type Role } from "@/constants/roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  USERS_VIEW: "users:view",
  USERS_MANAGE: "users:manage",
  CMS_VIEW: "cms:view",
  CMS_MANAGE: "cms:manage",
  WAREHOUSE_VIEW: "warehouse:view",
  WAREHOUSE_MANAGE: "warehouse:manage",
  SUBHUB_VIEW: "subhub:view",
  SUBHUB_MANAGE: "subhub:manage",
  LOGISTICS_VIEW: "logistics:view",
  LOGISTICS_MANAGE: "logistics:manage",
  FINANCE_VIEW: "finance:view",
  FINANCE_MANAGE: "finance:manage",
  REPORTS_VIEW: "reports:view",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  NOTIFICATIONS_VIEW: "notifications:view",
  CUSTOMER_EXECUTIVE_VIEW: "customer_executive:view",
  CUSTOMER_EXECUTIVE_MANAGE: "customer_executive:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.CMS_VIEW,
    PERMISSIONS.CMS_MANAGE,
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.SUBHUB_VIEW,
    PERMISSIONS.SUBHUB_MANAGE,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_MANAGE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.CUSTOMER_EXECUTIVE_VIEW,
    PERMISSIONS.CUSTOMER_EXECUTIVE_MANAGE,
  ],
  [ROLES.CUSTOMER_EXECUTIVE]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMER_EXECUTIVE_VIEW,
    PERMISSIONS.CUSTOMER_EXECUTIVE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  [ROLES.WAREHOUSE_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  [ROLES.SUB_HUB_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SUBHUB_VIEW,
    PERMISSIONS.SUBHUB_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  [ROLES.LOGISTICS_MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.LOGISTICS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  [ROLES.DRIVER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LOGISTICS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean =>
  ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

export const hasAnyPermission = (
  role: Role,
  permissions: Permission[],
): boolean => permissions.some((permission) => hasPermission(role, permission));

export const hasAllPermissions = (
  role: Role,
  permissions: Permission[],
): boolean =>
  permissions.every((permission) => hasPermission(role, permission));
