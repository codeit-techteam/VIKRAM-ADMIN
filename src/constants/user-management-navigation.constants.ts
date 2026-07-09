import { ROUTES } from "@/constants/routes";
import type { NavChildItem } from "@/constants/navigation.constants";

export const USER_MANAGEMENT_NAV_CHILDREN: NavChildItem[] = [
  {
    label: "Customers",
    href: `${ROUTES.USER_MANAGEMENT}/customers`,
  },
  {
    label: "Customer Executive",
    href: ROUTES.CUSTOMER_EXECUTIVE,
  },
  {
    label: "Sub Hub Managers",
    href: `${ROUTES.USER_MANAGEMENT}/sub-hub-managers`,
  },
];

export const USER_MANAGEMENT_TABS = [
  {
    id: "customers",
    label: "Customers",
    href: `${ROUTES.USER_MANAGEMENT}/customers`,
  },
  {
    id: "customer-executives",
    label: "Customer Executives",
    href: ROUTES.CUSTOMER_EXECUTIVE,
  },
  {
    id: "sub-hub-managers",
    label: "Sub Hub Managers",
    href: `${ROUTES.USER_MANAGEMENT}/sub-hub-managers`,
  },
  {
    id: "drivers",
    label: "Drivers",
    href: `${ROUTES.USER_MANAGEMENT}/drivers`,
  },
] as const;
