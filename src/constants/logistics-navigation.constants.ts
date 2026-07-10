import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const LOGISTICS_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Logistics Dashboard",
    href: ROUTES.LOGISTICS,
  },
  {
    label: "Warehouse Logistics",
    href: `${ROUTES.LOGISTICS}/warehouse`,
  },
  {
    label: "Customer Logistics",
    href: `${ROUTES.LOGISTICS}/customer`,
  },
  {
    label: "Vehicles",
    href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
  },
  {
    label: "Drivers",
    href: `${ROUTES.LOGISTICS}/fleet/drivers`,
  },
  {
    label: "Shipment Tracking",
    href: `${ROUTES.LOGISTICS}/tracking`,
  },
  {
    label: "Route & Dispatch",
    href: `${ROUTES.LOGISTICS}/dispatch`,
  },
  {
    label: "Maintenance",
    href: `${ROUTES.LOGISTICS}/maintenance`,
  },
];

export const FLEET_TABS = [
  {
    id: "vehicles",
    label: "Vehicles",
    href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
  },
  {
    id: "drivers",
    label: "Drivers",
    href: `${ROUTES.LOGISTICS}/fleet/drivers`,
  },
];
