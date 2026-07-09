import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const CUSTOMER_EXECUTIVE_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.CUSTOMER_EXECUTIVE,
  },
  {
    label: "Customer Management",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/customers`,
  },
  {
    label: "Orders",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/orders`,
  },
  {
    label: "Payments",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/payments`,
  },
  {
    label: "Tracking",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/tracking`,
  },
  {
    label: "Complaints",
    href: `${ROUTES.CUSTOMER_EXECUTIVE}/complaints`,
  },
];
