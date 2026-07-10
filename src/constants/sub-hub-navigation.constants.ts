import {
  ArrowLeftRight,
  ClipboardList,
  LayoutGrid,
  Package,
  Plus,
  ScrollText,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const SUB_HUB_NETWORK_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "All Sub-Hubs",
    href: ROUTES.SUB_HUB_NETWORK,
    icon: LayoutGrid,
  },
  {
    label: "Hub Inventory",
    href: ROUTES.HUB_INVENTORY,
    icon: Package,
    badge: { text: "15 Low Stock", variant: "warning" },
  },
  {
    label: "Hub Requisitions",
    href: ROUTES.HUB_REQUISITIONS,
    icon: ClipboardList,
    badge: 4,
  },
  {
    label: "Hub Transfers",
    href: ROUTES.HUB_TRANSFERS,
    icon: ArrowLeftRight,
  },
  {
    label: "Dispatch Logs",
    href: ROUTES.HUB_DISPATCH_LOGS,
    icon: ScrollText,
    badge: { text: "9 Active", variant: "info" },
  },
  {
    label: "Add New Hub",
    href: ROUTES.SUB_HUB_ADD,
    icon: Plus,
  },
];
