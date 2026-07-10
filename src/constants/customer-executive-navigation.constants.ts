import {
  AlertCircle,
  CreditCard,
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  Users,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const CUSTOMER_EXECUTIVE_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.CUSTOMER_EXECUTIVE,
    icon: LayoutDashboard,
  },
  {
    label: "Customer Management",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/customers`,
    icon: Users,
  },
  {
    label: "Orders",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/orders`,
    icon: ShoppingCart,
  },
  {
    label: "Payments",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/payments`,
    icon: CreditCard,
  },
  {
    label: "Tracking",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/tracking`,
    icon: MapPin,
  },
  {
    label: "Complaints",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/complaints`,
    icon: AlertCircle,
    badge: 3,
  },
];
