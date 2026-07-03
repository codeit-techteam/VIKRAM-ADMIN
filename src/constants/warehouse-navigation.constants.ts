import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

// TODO: Replace with warehouse navigation config API
export const PENDING_REQUISITION_COUNT = 12;

export const CENTRAL_WAREHOUSE_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Warehouse Dashboard",
    href: ROUTES.CENTRAL_WAREHOUSE,
  },
  {
    label: "Inventory Management",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,
  },
  {
    label: "Requisition Approval",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
    badge: PENDING_REQUISITION_COUNT,
  },
  {
    label: "Allocation Center",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/allocate`,
  },
  {
    label: "Transfer Management",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
  },
  {
    label: "Dispatch Control",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
  },
];
