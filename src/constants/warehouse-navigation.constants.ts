import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ClipboardList,
  LayoutDashboard,
  Package,
  Truck,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

// TODO: Replace with warehouse navigation config API
export const PENDING_REQUISITION_COUNT = 12;

export const CENTRAL_WAREHOUSE_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Warehouse Dashboard",
    href: ROUTES.CENTRAL_WAREHOUSE,
    icon: LayoutDashboard,
  },
  {
    label: "Inventory Management",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,
    icon: Package,
  },
  {
    label: "Requisition Approval",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
    icon: ClipboardList,
    badge: PENDING_REQUISITION_COUNT,
  },
  {
    label: "Allocation Center",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/allocate`,
    icon: ArrowLeftRight,
  },
  {
    label: "Transfer Management",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
    icon: ArrowLeftRight,
  },
  {
    label: "Dispatch Control",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
    icon: ArrowUpFromLine,
  },
  {
    label: "Hub Receiving",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/hub-receiving`,
    icon: ArrowDownToLine,
  },
];
