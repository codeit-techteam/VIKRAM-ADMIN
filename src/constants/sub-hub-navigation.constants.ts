import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

export const SUB_HUB_NETWORK_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "All Sub-Hubs",
        href: ROUTES.SUB_HUB_NETWORK,
      },
    ],
  },
  {
    label: "Hub Operations",
    items: [
      {
        label: "Hub Inventory",
        href: ROUTES.HUB_INVENTORY,
      },
      {
        label: "Hub Requisitions",
        href: ROUTES.HUB_REQUISITIONS,
      },
      {
        label: "Hub Transfers",
        href: ROUTES.HUB_TRANSFERS,
      },
      {
        label: "Dispatch Logs",
        href: ROUTES.HUB_DISPATCH_LOGS,
      },
    ],
  },
  {
    label: "Setup",
    items: [
      {
        label: "Add New Hub",
        href: ROUTES.SUB_HUB_ADD,
      },
    ],
  },
];

export const SUB_HUB_NETWORK_NAV_CHILDREN: NavChildItem[] =
  SUB_HUB_NETWORK_NAV_GROUPS.flatMap((group) => group.items);
