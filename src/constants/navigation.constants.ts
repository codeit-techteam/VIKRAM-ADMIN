import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LogOut,
  Network,
  Smartphone,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";

import { CUSTOMER_EXECUTIVE_NAV_CHILDREN } from "@/constants/customer-executive-navigation.constants";
import { LOGISTICS_NAV_CHILDREN } from "@/constants/logistics-navigation.constants";
import { CENTRAL_WAREHOUSE_NAV_CHILDREN } from "@/constants/warehouse-navigation.constants";
import { SUB_HUB_NETWORK_NAV_CHILDREN } from "@/constants/sub-hub-navigation.constants";
import { USER_MANAGEMENT_NAV_CHILDREN } from "@/constants/user-management-navigation.constants";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
  /** Additional paths that should activate this nav child */
  aliases?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
  children?: NavChildItem[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "CONTENT",
    items: [
      {
        label: "Customer App CMS",
        href: "/customer-app-cms",
        icon: Smartphone,
        hasSubmenu: true,
        children: [
          { label: "CMS Dashboard", href: "/customer-app-cms" },
          { label: "Banner Management", href: "/customer-app-cms/banners" },
          { label: "Video Management", href: "/customer-app-cms/videos" },
          { label: "Product Catalog", href: "/customer-app-cms/catalog" },
          { label: "Categories", href: "/customer-app-cms/categories" },
          {
            label: "Push Notification",
            href: "/customer-app-cms/push-notifications",
          },
        ],
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      {
        label: "Central Warehouse",
        href: "/central-warehouse",
        icon: Warehouse,
        hasSubmenu: true,
        children: CENTRAL_WAREHOUSE_NAV_CHILDREN,
      },
      {
        label: "Sub-Hub Network",
        href: "/sub-hub-network",
        icon: Network,
        hasSubmenu: true,
        children: SUB_HUB_NETWORK_NAV_CHILDREN,
      },
      {
        label: "Logistics",
        href: "/logistics",
        icon: Truck,
        hasSubmenu: true,
        children: LOGISTICS_NAV_CHILDREN,
      },
      {
        label: "Finance & Payments",
        href: "/finance-payments",
        icon: Wallet,
      },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        label: "User Management",
        href: "/user-management",
        icon: Users,
        hasSubmenu: true,
        children: USER_MANAGEMENT_NAV_CHILDREN,
      },
      {
        label: "Customer Executive",
        href: "/customer-executive",
        icon: UserCog,
        hasSubmenu: true,
        children: CUSTOMER_EXECUTIVE_NAV_CHILDREN,
      },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Logout", href: "/login", icon: LogOut },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_SECTIONS.flatMap((section) =>
    section.items.flatMap((item) => {
      if (!item.children?.length) {
        return [item];
      }

      return [
        item,
        ...item.children.map((child) => ({
          label: child.label,
          href: child.href,
          icon: item.icon,
        })),
      ];
    }),
  ),
  ...BOTTOM_NAV_ITEMS.filter((item) => item.label !== "Logout"),
];

export function childMatchesPath(
  child: NavChildItem,
  pathname: string,
): boolean {
  if (!pathname) return false;

  const paths = [child.href, ...(child.aliases ?? [])];
  return paths.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

export function findActiveChildItem(
  children: NavChildItem[],
  pathname: string,
): NavChildItem | undefined {
  if (!pathname) {
    return undefined;
  }

  const matches = children.filter((child) => childMatchesPath(child, pathname));

  if (matches.length === 0) {
    return undefined;
  }

  return matches.reduce((best, current) => {
    const bestLength = Math.max(
      best.href.length,
      ...(best.aliases?.map((path) => path.length) ?? []),
    );
    const currentLength = Math.max(
      current.href.length,
      ...(current.aliases?.map((path) => path.length) ?? []),
    );
    return currentLength > bestLength ? current : best;
  });
}

export function getNavContextFromPath(pathname: string): {
  section?: string;
  page: string;
} {
  if (pathname === "/notification-center") {
    return { page: "Notification Center", section: "OPERATIONS" };
  }

  for (const navSection of NAV_SECTIONS) {
    for (const item of navSection.items) {
      if (item.children?.length) {
        const child = findActiveChildItem(item.children, pathname);

        if (child) {
          return { section: item.label, page: child.label };
        }
      }

      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return { page: item.label, section: navSection.label };
      }
    }
  }

  const bottomItem = BOTTOM_NAV_ITEMS.find(
    (navItem) =>
      pathname === navItem.href || pathname.startsWith(`${navItem.href}/`),
  );

  return { page: bottomItem?.label ?? "Dashboard" };
}

export function getNavLabelFromPath(pathname: string): string {
  return getNavContextFromPath(pathname).page;
}
