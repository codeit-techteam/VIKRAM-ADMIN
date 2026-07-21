import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

export const FINANCE_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "Finance & Payments",
        href: ROUTES.FINANCE_PAYMENTS,
      },
      {
        label: "Customer Wallet",
        href: ROUTES.FINANCE_CUSTOMER_WALLET,
      },
    ],
  },
];

export const FINANCE_NAV_CHILDREN: NavChildItem[] = FINANCE_NAV_GROUPS.flatMap(
  (group) => group.items,
);
