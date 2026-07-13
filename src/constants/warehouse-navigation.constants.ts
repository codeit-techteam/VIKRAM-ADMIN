import { ROUTES } from "@/constants/routes";
import type {
  NavChildGroup,
  NavChildItem,
} from "@/constants/navigation.constants";

// TODO: Replace with warehouse navigation config API
export const PENDING_REQUISITION_COUNT = 12;

export const CENTRAL_WAREHOUSE_NAV_GROUPS: NavChildGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: ROUTES.CENTRAL_WAREHOUSE,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        label: "Inventory Management",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/inventory`,
      },
      {
        label: "Product Management",
        href: ROUTES.CENTRAL_WAREHOUSE_PRODUCTS,
      },
    ],
  },
  {
    label: "Fulfillment",
    items: [
      {
        label: "Requisition Approval",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
        badge: PENDING_REQUISITION_COUNT,
      },
      {
        label: "Allocation Center",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/allocate`,
      },
    ],
  },
  {
    label: "Movement & Dispatch",
    items: [
      {
        label: "Transfer Management",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
      },
      {
        label: "Dispatch Control",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
      },
      {
        label: "Hub Receiving",
        href: `${ROUTES.CENTRAL_WAREHOUSE}/hub-receiving`,
      },
    ],
  },
];

export const CENTRAL_WAREHOUSE_NAV_CHILDREN: NavChildItem[] =
  CENTRAL_WAREHOUSE_NAV_GROUPS.flatMap((group) => group.items);
