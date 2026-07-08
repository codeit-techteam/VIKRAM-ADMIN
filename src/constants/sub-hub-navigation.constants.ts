import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const SUB_HUB_NETWORK_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "All Sub-Hubs",
    href: ROUTES.SUB_HUB_NETWORK,
  },
  {
    label: "Hub Inventory",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,
  },
  {
    label: "Hub Requisitions",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
  },
  {
    label: "Hub Transfers",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
  },
  {
    label: "Dispatch Logs",
    href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
  },
  {
    label: "Add New Hub",
    href: ROUTES.SUB_HUB_NETWORK,
  },
];
