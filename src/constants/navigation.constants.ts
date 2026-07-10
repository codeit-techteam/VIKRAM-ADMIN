import type { LucideIcon } from "lucide-react";
import {
  Bell,
  FileText,
  FolderTree,
  HelpCircle,
  Image,
  LayoutDashboard,
  LogOut,
  Network,
  Settings,
  Smartphone,
  Truck,
  UserCog,
  Users,
  Video,
  Wallet,
  Warehouse,
} from "lucide-react";

import { CUSTOMER_EXECUTIVE_NAV_CHILDREN } from "@/constants/customer-executive-navigation.constants";
import { LOGISTICS_NAV_CHILDREN } from "@/constants/logistics-navigation.constants";
import { ROUTES } from "@/constants/routes";
import { CENTRAL_WAREHOUSE_NAV_CHILDREN } from "@/constants/warehouse-navigation.constants";
import { SUB_HUB_NETWORK_NAV_CHILDREN } from "@/constants/sub-hub-navigation.constants";
import { USER_MANAGEMENT_NAV_CHILDREN } from "@/constants/user-management-navigation.constants";

export interface NavBadge {
  text: string;
  variant?: "default" | "warning" | "info" | "destructive";
}

export interface NavChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number | NavBadge;
}

export interface NavItem {
  id: string;
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

export const DEFAULT_FAVORITES = [
  ROUTES.CUSTOMER_EXECUTIVE_ORDERS,
  `${ROUTES.USER_MANAGEMENT}/customers`,
  ROUTES.HUB_INVENTORY,
  ROUTES.HUB_DISPATCH_LOGS,
] as const;

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Inventory Operations",
    items: [
      {
        id: "central-warehouse",
        label: "Central Warehouse",
        href: ROUTES.CENTRAL_WAREHOUSE,
        icon: Warehouse,
        hasSubmenu: true,
        children: CENTRAL_WAREHOUSE_NAV_CHILDREN,
      },
      {
        id: "sub-hub-network",
        label: "Sub-Hub Network",
        href: ROUTES.SUB_HUB_NETWORK,
        icon: Network,
        hasSubmenu: true,
        children: SUB_HUB_NETWORK_NAV_CHILDREN,
      },
    ],
  },
  {
    label: "Logistics",
    items: [
      {
        id: "logistics",
        label: "Logistics",
        href: ROUTES.LOGISTICS,
        icon: Truck,
        hasSubmenu: true,
        children: LOGISTICS_NAV_CHILDREN,
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        id: "user-management",
        label: "User Management",
        href: ROUTES.USER_MANAGEMENT,
        icon: Users,
        hasSubmenu: true,
        children: USER_MANAGEMENT_NAV_CHILDREN,
      },
      {
        id: "customer-executive",
        label: "Customer Executive",
        href: ROUTES.CUSTOMER_EXECUTIVE,
        icon: UserCog,
        hasSubmenu: true,
        children: CUSTOMER_EXECUTIVE_NAV_CHILDREN,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        id: "finance-payments",
        label: "Finance & Payments",
        href: ROUTES.FINANCE_PAYMENTS,
        icon: Wallet,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        id: "customer-app-cms",
        label: "Customer App CMS",
        href: ROUTES.CUSTOMER_APP_CMS,
        icon: Smartphone,
        hasSubmenu: true,
        children: [
          {
            label: "CMS Dashboard",
            href: ROUTES.CUSTOMER_APP_CMS,
            icon: LayoutDashboard,
          },
          {
            label: "Banner Management",
            href: `${ROUTES.CUSTOMER_APP_CMS}/banners`,
            icon: Image,
          },
          {
            label: "Video Management",
            href: `${ROUTES.CUSTOMER_APP_CMS}/videos`,
            icon: Video,
          },
          {
            label: "Product Catalog",
            href: `${ROUTES.CUSTOMER_APP_CMS}/catalog`,
            icon: FileText,
          },
          {
            label: "Categories",
            href: `${ROUTES.CUSTOMER_APP_CMS}/categories`,
            icon: FolderTree,
          },
          {
            label: "Push Notification",
            href: `${ROUTES.CUSTOMER_APP_CMS}/push-notifications`,
            icon: Bell,
          },
        ],
      },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: "notification-center",
    label: "Notification Center",
    href: ROUTES.NOTIFICATION_CENTER,
    icon: Bell,
  },
  {
    id: "settings",
    label: "Settings",
    href: ROUTES.SYSTEM_SETTINGS,
    icon: Settings,
  },
  {
    id: "help",
    label: "Help",
    href: ROUTES.SYSTEM_SETTINGS,
    icon: HelpCircle,
  },
  {
    id: "logout",
    label: "Logout",
    href: ROUTES.LOGIN,
    icon: LogOut,
  },
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
          id: child.href,
          label: child.label,
          href: child.href,
          icon: child.icon ?? item.icon,
        })),
      ];
    }),
  ),
  ...BOTTOM_NAV_ITEMS.filter((item) => item.label !== "Logout"),
];

export function isPathActive(pathname: string, href: string): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveChildItem(
  children: NavChildItem[],
  pathname: string,
): NavChildItem | undefined {
  if (!pathname) {
    return undefined;
  }

  const matches = children.filter((child) =>
    isPathActive(pathname, child.href),
  );

  if (matches.length === 0) {
    return undefined;
  }

  return matches.reduce((best, current) =>
    current.href.length > best.href.length ? current : best,
  );
}

export function findParentNavItem(pathname: string): NavItem | undefined {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.children?.length) {
        const child = findActiveChildItem(item.children, pathname);
        if (child) {
          return item;
        }
      }

      if (isPathActive(pathname, item.href)) {
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
  const bottomItem = BOTTOM_NAV_ITEMS.find(
    (navItem) =>
      navItem.label !== "Logout" && isPathActive(pathname, navItem.href),
  );

  if (bottomItem) {
    return { page: bottomItem.label };
  }

  for (const navSection of NAV_SECTIONS) {
    for (const item of navSection.items) {
      if (item.children?.length) {
        const child = findActiveChildItem(item.children, pathname);

        if (child) {
          return { section: item.label, page: child.label };
        }
      }

      if (isPathActive(pathname, item.href)) {
        return { page: item.label, section: navSection.label };
      }
    }
  }

  return { page: "Dashboard" };
}

export function getNavLabelFromPath(pathname: string): string {
  return getNavContextFromPath(pathname).page;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function getBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD },
  ];

  if (pathname === ROUTES.DASHBOARD) {
    return [{ label: "Dashboard" }];
  }

  const bottomItem = BOTTOM_NAV_ITEMS.find(
    (navItem) =>
      navItem.label !== "Logout" && isPathActive(pathname, navItem.href),
  );

  if (bottomItem) {
    crumbs.push({ label: bottomItem.label });
    return crumbs;
  }

  const parentItem = findParentNavItem(pathname);

  if (parentItem) {
    const child = parentItem.children
      ? findActiveChildItem(parentItem.children, pathname)
      : undefined;

    if (child && child.href !== parentItem.href) {
      crumbs.push({ label: parentItem.label, href: parentItem.href });
      crumbs.push({ label: child.label });
      return crumbs;
    }

    crumbs.push({ label: parentItem.label });
    return crumbs;
  }

  crumbs.push({ label: getNavLabelFromPath(pathname) });
  return crumbs;
}

export function filterNavSections(
  sections: NavSection[],
  query: string,
): NavSection[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return sections;
  }

  return sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          const parentMatches = item.label
            .toLowerCase()
            .includes(normalizedQuery);

          if (!item.children?.length) {
            return parentMatches ? item : null;
          }

          const matchingChildren = item.children.filter((child) =>
            child.label.toLowerCase().includes(normalizedQuery),
          );

          if (parentMatches) {
            return item;
          }

          if (matchingChildren.length > 0) {
            return { ...item, children: matchingChildren };
          }

          return null;
        })
        .filter((item): item is NavItem => item !== null);

      if (items.length === 0) {
        return null;
      }

      return { ...section, items };
    })
    .filter((section): section is NavSection => section !== null);
}

export function getFavoriteNavItems(
  favorites: string[],
): Array<NavChildItem & { parentLabel?: string }> {
  const favoriteSet = new Set(favorites);
  const results: Array<NavChildItem & { parentLabel?: string }> = [];

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (favoriteSet.has(item.href)) {
        results.push({
          label: item.label,
          href: item.href,
          icon: item.icon,
        });
      }

      item.children?.forEach((child) => {
        if (favoriteSet.has(child.href)) {
          results.push({
            ...child,
            parentLabel: item.label,
          });
        }
      });
    }
  }

  return results;
}
