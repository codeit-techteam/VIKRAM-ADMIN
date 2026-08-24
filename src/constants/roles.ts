export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
  CUSTOMER_EXECUTIVE: "CUSTOMER_EXECUTIVE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.WAREHOUSE_MANAGER]: "Warehouse Manager",
  [ROLES.CUSTOMER_EXECUTIVE]: "Customer Executive",
};

export const ADMIN_ROLES = Object.values(ROLES);
