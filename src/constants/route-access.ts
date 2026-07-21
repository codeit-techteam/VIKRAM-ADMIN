import {
  hasAnyPermission,
  PERMISSIONS,
  type Permission,
} from "@/constants/permissions";
import { ROLES, type Role } from "@/constants/roles";

/** Route prefix → required permission(s). First match wins. */
export const ROUTE_ACCESS_RULES: {
  prefix: string;
  permissions: Permission[];
}[] = [
  { prefix: "/customer-app-cms", permissions: [PERMISSIONS.CMS_VIEW] },
  { prefix: "/central-warehouse", permissions: [PERMISSIONS.WAREHOUSE_VIEW] },
  { prefix: "/sub-hub-network", permissions: [PERMISSIONS.HUB_VIEW] },
  { prefix: "/logistics", permissions: [PERMISSIONS.LOGISTICS_VIEW] },
  { prefix: "/finance-payments", permissions: [PERMISSIONS.FINANCE_VIEW] },
  { prefix: "/user-management", permissions: [PERMISSIONS.USERS_VIEW] },
  {
    prefix: "/customer-executive",
    permissions: [PERMISSIONS.CUSTOMER_EXECUTIVE_VIEW],
  },
  { prefix: "/orders", permissions: [PERMISSIONS.ORDERS_VIEW] },
  { prefix: "/analytics-reports", permissions: [PERMISSIONS.REPORTS_VIEW] },
  { prefix: "/system-settings", permissions: [PERMISSIONS.SETTINGS_VIEW] },
  { prefix: "/approvals", permissions: [PERMISSIONS.USERS_MANAGE] },
  {
    prefix: "/notification-center",
    permissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  { prefix: "/dashboard", permissions: [PERMISSIONS.DASHBOARD_VIEW] },
];

export const NAV_ITEM_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": PERMISSIONS.DASHBOARD_VIEW,
  "/customer-app-cms": PERMISSIONS.CMS_VIEW,
  "/central-warehouse": PERMISSIONS.WAREHOUSE_VIEW,
  "/sub-hub-network": PERMISSIONS.HUB_VIEW,
  "/logistics": PERMISSIONS.LOGISTICS_VIEW,
  "/finance-payments": PERMISSIONS.FINANCE_VIEW,
  "/user-management": PERMISSIONS.USERS_VIEW,
  "/customer-executive": PERMISSIONS.CUSTOMER_EXECUTIVE_VIEW,
};

export function canAccessPath(
  role: Role | null | undefined,
  pathname: string,
  userPermissions?: string[],
): boolean {
  if (!role) return false;

  // Executive dashboard — Super Admin only
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return role === ROLES.SUPER_ADMIN;
  }

  if (role === ROLES.SUPER_ADMIN) return true;

  const rule = ROUTE_ACCESS_RULES.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (!rule) return true;

  if (userPermissions?.length) {
    return rule.permissions.some((p) => userPermissions.includes(p));
  }

  return hasAnyPermission(role, rule.permissions);
}

export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case ROLES.WAREHOUSE_MANAGER:
      return "/central-warehouse";
    case ROLES.CUSTOMER_EXECUTIVE:
      return "/customer-executive";
    default:
      return "/dashboard";
  }
}
