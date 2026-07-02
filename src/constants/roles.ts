export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CUSTOMER_EXECUTIVE: "CUSTOMER_EXECUTIVE",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
  SUB_HUB_MANAGER: "SUB_HUB_MANAGER",
  LOGISTICS_MANAGER: "LOGISTICS_MANAGER",
  DRIVER: "DRIVER",
  CUSTOMER: "CUSTOMER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.CUSTOMER_EXECUTIVE]: "Customer Executive",
  [ROLES.WAREHOUSE_MANAGER]: "Warehouse Manager",
  [ROLES.SUB_HUB_MANAGER]: "Sub Hub Manager",
  [ROLES.LOGISTICS_MANAGER]: "Logistics Manager",
  [ROLES.DRIVER]: "Driver",
  [ROLES.CUSTOMER]: "Customer",
};
