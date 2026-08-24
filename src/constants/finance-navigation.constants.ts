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
    ],
  },
];

export const FINANCE_NAV_CHILDREN: NavChildItem[] = FINANCE_NAV_GROUPS.flatMap(
  (group) => group.items,
);
