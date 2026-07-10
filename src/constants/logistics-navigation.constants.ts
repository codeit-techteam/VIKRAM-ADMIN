import {
  Car,
  LayoutDashboard,
  MapPin,
  Route,
  Truck,
  UserRound,
  Warehouse,
  Wrench,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const LOGISTICS_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Logistics Dashboard",
    href: ROUTES.LOGISTICS,
    icon: LayoutDashboard,
  },
  {
    label: "Warehouse Logistics",
    href: `${ROUTES.LOGISTICS}/warehouse`,
    icon: Warehouse,
  },
  {
    label: "Customer Logistics",
    href: `${ROUTES.LOGISTICS}/customer`,
    icon: Truck,
  },
  {
    label: "Vehicles",
    href: `${ROUTES.LOGISTICS}/fleet/vehicles`,
    icon: Car,
  },
  {
    label: "Drivers",
    href: `${ROUTES.LOGISTICS}/fleet/drivers`,
    icon: UserRound,
  },
  {
    label: "Shipment Tracking",
    href: `${ROUTES.LOGISTICS}/tracking`,
    icon: MapPin,
  },
  {
    label: "Route & Dispatch",
    href: `${ROUTES.LOGISTICS}/dispatch`,
    icon: Route,
  },
  {
    label: "Maintenance",
    href: `${ROUTES.LOGISTICS}/maintenance`,
    icon: Wrench,
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
