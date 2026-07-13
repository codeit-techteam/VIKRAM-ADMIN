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

import { CUSTOMER_EXECUTIVE_NAV_GROUPS } from "@/constants/customer-executive-navigation.constants";
import { LOGISTICS_NAV_GROUPS } from "@/constants/logistics-navigation.constants";
import { CENTRAL_WAREHOUSE_NAV_GROUPS } from "@/constants/warehouse-navigation.constants";
import { SUB_HUB_NETWORK_NAV_GROUPS } from "@/constants/sub-hub-navigation.constants";
import { USER_MANAGEMENT_NAV_GROUPS } from "@/constants/user-management-navigation.constants";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
  /** Additional paths that should activate this nav child */
  aliases?: string[];
}

export interface NavChildGroup {
  /** Optional group heading shown above child links */
  label?: string;
  items: NavChildItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
  /** Flat child list (used when groups are not needed) */
  children?: NavChildItem[];
  /** Grouped child lists (preferred for nested IA like Customer App CMS) */
  childGroups?: NavChildGroup[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface NavBreadcrumbItem {
  label: string;
  href?: string;
}

/** Flatten childGroups or children for matching / lookups */
export function getNavItemChildren(item: NavItem): NavChildItem[] {
  if (item.childGroups?.length) {
    return item.childGroups.flatMap((group) => group.items);
  }

  return item.children ?? [];
}

/** Normalize an item into renderable groups (flat children become one unlabeled group) */
export function getNavItemChildGroups(item: NavItem): NavChildGroup[] {
  if (item.childGroups?.length) {
    return item.childGroups;
  }

  if (item.children?.length) {
    return [{ items: item.children }];
  }

  return [];
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
        childGroups: [
          {
            items: [{ label: "Dashboard", href: "/customer-app-cms" }],
          },
          {
            label: "Content Management",
            items: [
              { label: "Banner Management", href: "/customer-app-cms/banners" },
              { label: "Offer Management", href: "/customer-app-cms/offers" },
              { label: "Video Management", href: "/customer-app-cms/videos" },
              {
                label: "Push Notifications",
                href: "/customer-app-cms/push-notifications",
              },
            ],
          },
          {
            label: "Catalog Management",
            items: [
              { label: "Product Catalog", href: "/customer-app-cms/catalog" },
              { label: "Categories", href: "/customer-app-cms/categories" },
            ],
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
        childGroups: CENTRAL_WAREHOUSE_NAV_GROUPS,
      },
      {
        label: "Sub-Hub Network",
        href: "/sub-hub-network",
        icon: Network,
        hasSubmenu: true,
        childGroups: SUB_HUB_NETWORK_NAV_GROUPS,
      },
      {
        label: "Logistics",
        href: "/logistics",
        icon: Truck,
        hasSubmenu: true,
        childGroups: LOGISTICS_NAV_GROUPS,
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
        childGroups: USER_MANAGEMENT_NAV_GROUPS,
      },
      {
        label: "Customer Executive",
        href: "/customer-executive",
        icon: UserCog,
        hasSubmenu: true,
        childGroups: CUSTOMER_EXECUTIVE_NAV_GROUPS,
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
      const children = getNavItemChildren(item);

      if (!children.length) {
        return [item];
      }

      return [
        item,
        ...children.map((child) => ({
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

  // Longest href/alias wins so /customer-app-cms does not stay active under /offers
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

export function findActiveNavParent(pathname: string): NavItem | undefined {
  if (!pathname) return undefined;

  for (const navSection of NAV_SECTIONS) {
    for (const item of navSection.items) {
      const children = getNavItemChildren(item);

      if (children.length && findActiveChildItem(children, pathname)) {
        return item;
      }
    }
  }

  return undefined;
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
      const children = getNavItemChildren(item);

      if (children.length) {
        const child = findActiveChildItem(children, pathname);

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

/** Breadcrumbs derived from the active nested nav item (parent > child) */
export function getNavBreadcrumbsFromPath(
  pathname: string,
): NavBreadcrumbItem[] {
  const parent = findActiveNavParent(pathname);

  if (!parent) {
    const { page } = getNavContextFromPath(pathname);
    return [{ label: page }];
  }

  const child = findActiveChildItem(getNavItemChildren(parent), pathname);

  if (!child) {
    return [{ label: parent.label, href: parent.href }];
  }

  // Exact dashboard route: still show parent > Dashboard for consistency
  return [{ label: parent.label, href: parent.href }, { label: child.label }];
}
