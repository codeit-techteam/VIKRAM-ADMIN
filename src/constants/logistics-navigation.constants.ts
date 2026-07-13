import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

export const LOGISTICS_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: ROUTES.LOGISTICS,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Warehouse Logistics",
        href: `${ROUTES.LOGISTICS}/warehouse`,
      },
      {
        label: "Customer Logistics",
        href: `${ROUTES.LOGISTICS}/customer`,
      },
    ],
  },
  {
    label: "Fleet",
    items: [
      {
        label: "Vehicles",
        href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
      },
      {
        label: "Drivers",
        href: `${ROUTES.LOGISTICS}/fleet/drivers`,
      },
    ],
  },
  {
    label: "Tracking & Maintenance",
    items: [
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
    ],
  },
];

export const LOGISTICS_NAV_CHILDREN: NavChildItem[] =
  LOGISTICS_NAV_GROUPS.flatMap((group) => group.items);

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
