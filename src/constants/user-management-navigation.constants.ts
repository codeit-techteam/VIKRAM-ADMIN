import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

export const USER_MANAGEMENT_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "Customers",
        href: `${ROUTES.USER_MANAGEMENT}/customers`,
      },
      {
        label: "Membership Plans",
        href: ROUTES.USER_MANAGEMENT_MEMBERSHIP_PLANS,
      },
      {
        label: "Customer Loyalty",
        href: ROUTES.USER_MANAGEMENT_CUSTOMER_LOYALTY,
      },
    ],
  },
  {
    label: "Team Management",
    items: [
      {
        label: "Customer Executives",
        href: ROUTES.USER_MANAGEMENT_CUSTOMER_EXECUTIVES,
      },
      {
        label: "Sub Hub Managers",
        href: `${ROUTES.USER_MANAGEMENT}/sub-hub-managers`,
      },
      {
        label: "Drivers",
        href: ROUTES.USER_MANAGEMENT_DRIVERS,
      },
    ],
  },
];

export const USER_MANAGEMENT_NAV_CHILDREN: NavChildItem[] =
  USER_MANAGEMENT_NAV_GROUPS.flatMap((group) => group.items);

export const USER_MANAGEMENT_TABS = [
  {
    id: "customers",
    label: "Customers",
    href: `${ROUTES.USER_MANAGEMENT}/customers`,
  },
  {
    id: "membership-plans",
    label: "Membership Plans",
    href: ROUTES.USER_MANAGEMENT_MEMBERSHIP_PLANS,
  },
  {
    id: "customer-loyalty",
    label: "Customer Loyalty",
    href: ROUTES.USER_MANAGEMENT_CUSTOMER_LOYALTY,
  },
  {
    id: "customer-executives",
    label: "Customer Executives",
    href: ROUTES.USER_MANAGEMENT_CUSTOMER_EXECUTIVES,
  },
  {
    id: "sub-hub-managers",
    label: "Sub Hub Managers",
    href: `${ROUTES.USER_MANAGEMENT}/sub-hub-managers`,
  },
  {
    id: "drivers",
    label: "Drivers",
    href: ROUTES.USER_MANAGEMENT_DRIVERS,
  },
] as const;
