import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

export const CUSTOMER_EXECUTIVE_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: ROUTES.CUSTOMER_EXECUTIVE,
      },
    ],
  },
  {
    label: "Customer Operations",
    items: [
      {
        label: "Customer Management",
        href: `${ROUTES.CUSTOMER_EXECUTIVE}/customers`,
      },
      {
        label: "Orders",
        href: ROUTES.ORDERS,
        aliases: [ROUTES.CUSTOMER_EXECUTIVE_ORDERS],
      },
      {
        label: "Payments",
        href: `${ROUTES.CUSTOMER_EXECUTIVE}/payments`,
      },
    ],
  },
  {
    label: "Service",
    items: [
      {
        label: "Tracking",
        href: `${ROUTES.CUSTOMER_EXECUTIVE}/tracking`,
      },
      {
        label: "Complaints",
        href: `${ROUTES.CUSTOMER_EXECUTIVE}/complaints`,
      },
    ],
  },
  {
    label: "Procurement",
    items: [
      {
        label: "Bulk Procurement",
        href: ROUTES.CUSTOMER_EXECUTIVE_BULK_PROCUREMENT,
      },
    ],
  },
];

export const CUSTOMER_EXECUTIVE_NAV_CHILDREN: NavChildItem[] =
  CUSTOMER_EXECUTIVE_NAV_GROUPS.flatMap((group) => group.items);
